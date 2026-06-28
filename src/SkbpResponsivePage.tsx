import ky from "ky";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { A11ywayHero } from "./A11ywayHero";
import "./SkbpResponsivePage.css";
import { absolutizeTuniverseHtml } from "./tuniverseOverrides";

type ExperienceReferenceLayout = "iframeOnly" | "a11ywayHero";

type ExperienceReferenceConfig = {
  readonly iframeTitle: string;
  readonly layout: ExperienceReferenceLayout;
  readonly slug: string;
  readonly testId: string;
  readonly url: string;
};

const SKBP_REFERENCE = {
  iframeTitle: "Plus X SKBP responsive reference",
  layout: "iframeOnly",
  slug: "skbp",
  testId: "skbp-responsive-page",
  url: "https://www.plus-ex.com/experience#skbp",
} as const satisfies ExperienceReferenceConfig;

const TUNIVERSE_REFERENCE = {
  iframeTitle: "Plus X T Universe detail page",
  layout: "a11ywayHero",
  slug: "tuniverse",
  testId: "experience-reference-page",
  url: "https://www.plus-ex.com/source/iframe/portfolio/tuniverse.html",
} as const satisfies ExperienceReferenceConfig;

const getViewportSignature = (): string => `${window.innerWidth}x${window.innerHeight}`;

export function getExperienceReferenceConfig(pathname: string, hash: string): ExperienceReferenceConfig | null {
  switch (`${pathname}${hash}`) {
    case "/a11yway#skbp":
      return SKBP_REFERENCE;
    case "/a11yway#tuniverse":
    case "/t-universe":
    case "/tuniverse":
      return TUNIVERSE_REFERENCE;
    default:
      return null;
  }
}

type TuniverseShellStyle = CSSProperties & {
  readonly "--tuniverse-frame-height"?: string;
};

type ExperienceReferencePageProps = {
  readonly config: ExperienceReferenceConfig;
};

export function ExperienceReferencePage({ config }: ExperienceReferencePageProps) {
  const [viewportSignature, setViewportSignature] = useState(getViewportSignature);
  const [tuniverseDocument, setTuniverseDocument] = useState<string | null>(null);
  const [tuniverseFrameHeight, setTuniverseFrameHeight] = useState<number | null>(null);
  const [tuniverseLoadFailed, setTuniverseLoadFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasA11ywayHero = config.layout === "a11ywayHero";
  const shouldRenderTuniverseSrcDoc = hasA11ywayHero && tuniverseDocument !== null && !tuniverseLoadFailed;

  const updateTuniverseFrameHeight = useCallback(() => {
    const frameDocument = iframeRef.current?.contentDocument;

    if (frameDocument === null || frameDocument === undefined) {
      return;
    }

    const bodyHeight = frameDocument.body?.scrollHeight ?? 0;
    const documentHeight = frameDocument.documentElement.scrollHeight;
    const nextFrameHeight = Math.max(bodyHeight, documentHeight, window.innerHeight);
    setTuniverseFrameHeight((currentFrameHeight) =>
      currentFrameHeight === nextFrameHeight ? currentFrameHeight : nextFrameHeight,
    );
  }, []);

  const handleTuniverseFrameLoad = useCallback(() => {
    if (!shouldRenderTuniverseSrcDoc) {
      return;
    }

    window.requestAnimationFrame(updateTuniverseFrameHeight);
  }, [shouldRenderTuniverseSrcDoc, updateTuniverseFrameHeight]);

  useEffect(() => {
    document.documentElement.classList.add("skbp-responsive-mode");
    document.body.classList.add("skbp-responsive-mode");
    if (hasA11ywayHero) {
      document.documentElement.classList.add("skbp-responsive-scroll-mode");
      document.body.classList.add("skbp-responsive-scroll-mode");
    }

    let frameId = 0;
    const syncViewportSignature = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        setViewportSignature(getViewportSignature());
      });
    };

    window.addEventListener("orientationchange", syncViewportSignature);
    window.addEventListener("resize", syncViewportSignature);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("orientationchange", syncViewportSignature);
      window.removeEventListener("resize", syncViewportSignature);
      document.documentElement.classList.remove("skbp-responsive-mode");
      document.documentElement.classList.remove("skbp-responsive-scroll-mode");
      document.body.classList.remove("skbp-responsive-mode");
      document.body.classList.remove("skbp-responsive-scroll-mode");
    };
  }, [hasA11ywayHero]);

  useEffect(() => {
    if (!hasA11ywayHero) {
      return undefined;
    }

    const controller = new AbortController();
    let isActive = true;

    void ky
      .get(config.url, { signal: controller.signal, timeout: 10_000 })
      .text()
      .then((html) => {
        if (!isActive) {
          return;
        }

        setTuniverseDocument(absolutizeTuniverseHtml(html, config.url));
        setTuniverseLoadFailed(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (error instanceof Error) {
          setTuniverseLoadFailed(true);
          return;
        }

        throw error;
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [config.url, hasA11ywayHero]);

  useEffect(() => {
    if (!shouldRenderTuniverseSrcDoc) {
      return undefined;
    }

    const frameDocument = iframeRef.current?.contentDocument;
    const frameWindow = iframeRef.current?.contentWindow;
    if (frameDocument === null || frameDocument === undefined || frameWindow === null || frameWindow === undefined) {
      return undefined;
    }

    let frameId = 0;
    const timeoutIds: number[] = [];
    const scheduleHeightUpdate = () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        updateTuniverseFrameHeight();
      });
    };

    const resizeObserver = new ResizeObserver(scheduleHeightUpdate);
    resizeObserver.observe(frameDocument.documentElement);
    if (frameDocument.body !== null) {
      resizeObserver.observe(frameDocument.body);
    }

    frameWindow.addEventListener("resize", scheduleHeightUpdate);
    for (const delay of [100, 500, 1_500] as const) {
      timeoutIds.push(window.setTimeout(scheduleHeightUpdate, delay));
    }
    scheduleHeightUpdate();

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId);
      }
      resizeObserver.disconnect();
      frameWindow.removeEventListener("resize", scheduleHeightUpdate);
    };
  }, [shouldRenderTuniverseSrcDoc, updateTuniverseFrameHeight, viewportSignature]);

  const detailShellStyle: TuniverseShellStyle | undefined =
    hasA11ywayHero && tuniverseFrameHeight !== null
      ? { "--tuniverse-frame-height": `${tuniverseFrameHeight}px` }
      : undefined;
  const frameSrc = hasA11ywayHero ? undefined : config.url;
  const frameSrcDoc = shouldRenderTuniverseSrcDoc ? tuniverseDocument : undefined;

  return (
    <main
      className={`skbp-responsive-page skbp-responsive-page--${config.layout}`}
      data-experience-slug={config.slug}
      data-testid={config.testId}
    >
      {hasA11ywayHero ? <A11ywayHero /> : null}
      <div className={`experience-detail-shell experience-detail-shell--${config.layout}`} style={detailShellStyle}>
        <iframe
          className={`skbp-responsive-frame skbp-responsive-frame--${config.layout}`}
          data-source-url={config.url}
          key={viewportSignature}
          onLoad={handleTuniverseFrameLoad}
          ref={iframeRef}
          src={frameSrc}
          srcDoc={frameSrcDoc}
          title={config.iframeTitle}
        />
      </div>
    </main>
  );
}

export function SkbpResponsivePage() {
  return <ExperienceReferencePage config={SKBP_REFERENCE} />;
}
