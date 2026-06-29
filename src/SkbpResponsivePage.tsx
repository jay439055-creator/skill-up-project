import ky from "ky";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { A11ywayHero } from "./A11ywayHero";
import "./SkbpResponsivePage.css";
import { absolutizeTuniverseHtml } from "./tuniverseOverrides";

type ExperienceReferenceLayout = "iframeOnly" | "a11ywayHero";
type ExperienceReferenceSlug = "skbp" | "tuniverse";

type ExperienceReferenceConfig = {
  readonly iframeTitle: string;
  readonly layout: ExperienceReferenceLayout;
  readonly slug: ExperienceReferenceSlug;
  readonly testId: string;
  readonly url: string;
};

const SKBP_REFERENCE = {
  iframeTitle: "Plus X SKBP responsive reference",
  layout: "iframeOnly",
  slug: "skbp",
  testId: "skbp-responsive-page",
  url: "/experience",
} as const satisfies ExperienceReferenceConfig;

const TUNIVERSE_REFERENCE = {
  iframeTitle: "Plus X T Universe detail page",
  layout: "a11ywayHero",
  slug: "tuniverse",
  testId: "experience-reference-page",
  url: "https://www.plus-ex.com/source/iframe/portfolio/tuniverse.html",
} as const satisfies ExperienceReferenceConfig;

const EXPERIENCE_ROUTE_MESSAGE_TYPE = "a11yway:experience-route";
const SKBP_EXPERIENCE_ROUTE = "/experience";
const SKBP_TOP_LIST_ROUTE = "/a11yway#skbp";
const SKBP_TOP_DETAIL_PREFIX = "/a11yway/";

type ExperienceRouteNavigationType = "push" | "replace";

type ExperienceRouteMessage = {
  readonly hash: string;
  readonly navigationType: ExperienceRouteNavigationType;
  readonly pathname: string;
  readonly type: typeof EXPERIENCE_ROUTE_MESSAGE_TYPE;
};

const getViewportSignature = (): string => `${window.innerWidth}x${window.innerHeight}`;

function decodeRoutePart(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getA11ywayDetailProjectSlug(pathname: string): string | null {
  if (!pathname.startsWith(SKBP_TOP_DETAIL_PREFIX)) {
    return null;
  }

  const routePart = pathname.slice(SKBP_TOP_DETAIL_PREFIX.length).replace(/\/$/, "");
  if (routePart === "" || routePart.includes("/")) {
    return null;
  }

  return decodeRoutePart(routePart);
}

function getExperienceHashProjectSlug(hash: string): string | null {
  const routePart = hash.startsWith("#") ? hash.slice(1) : hash;
  return routePart === "" ? null : decodeRoutePart(routePart);
}

function getLegacyA11ywayHashProjectSlug(pathname: string, hash: string): string | null {
  if (pathname !== "/a11yway" || hash === "" || hash === "#skbp" || hash === "#tuniverse") {
    return null;
  }

  return getExperienceHashProjectSlug(hash);
}

function getSkbpReferenceConfigForProject(projectSlug: string): ExperienceReferenceConfig {
  return {
    ...SKBP_REFERENCE,
    url: `${SKBP_EXPERIENCE_ROUTE}#${encodeURIComponent(projectSlug)}`,
  };
}

export function getExperienceReferenceConfig(pathname: string, hash: string): ExperienceReferenceConfig | null {
  const pathProjectSlug = getA11ywayDetailProjectSlug(pathname);
  if (pathProjectSlug !== null) {
    return getSkbpReferenceConfigForProject(pathProjectSlug);
  }

  const hashProjectSlug = getLegacyA11ywayHashProjectSlug(pathname, hash);
  if (hashProjectSlug !== null) {
    return getSkbpReferenceConfigForProject(hashProjectSlug);
  }

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

function isSkbpExperienceReference(config: ExperienceReferenceConfig): boolean {
  return config.slug === "skbp" && config.layout === "iframeOnly";
}

function isExperienceRouteMessage(value: unknown): value is ExperienceRouteMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "type" in value &&
    value.type === EXPERIENCE_ROUTE_MESSAGE_TYPE &&
    "pathname" in value &&
    value.pathname === SKBP_EXPERIENCE_ROUTE &&
    "hash" in value &&
    typeof value.hash === "string" &&
    "navigationType" in value &&
    (value.navigationType === "push" || value.navigationType === "replace")
  );
}

function getTopRouteForExperienceHash(hash: string): string {
  const projectSlug = getExperienceHashProjectSlug(hash);
  return projectSlug === null ? SKBP_TOP_LIST_ROUTE : `${SKBP_TOP_DETAIL_PREFIX}${encodeURIComponent(projectSlug)}`;
}

function getExperienceRouteForTopRoute(pathname: string, hash: string): string {
  const pathProjectSlug = getA11ywayDetailProjectSlug(pathname);
  if (pathProjectSlug !== null) {
    return `${SKBP_EXPERIENCE_ROUTE}#${encodeURIComponent(pathProjectSlug)}`;
  }

  const hashProjectSlug = getLegacyA11ywayHashProjectSlug(pathname, hash);
  if (hashProjectSlug !== null) {
    return `${SKBP_EXPERIENCE_ROUTE}#${encodeURIComponent(hashProjectSlug)}`;
  }

  return SKBP_EXPERIENCE_ROUTE;
}

export function ExperienceReferencePage({ config }: ExperienceReferencePageProps) {
  const [viewportSignature, setViewportSignature] = useState(getViewportSignature);
  const [referenceDocument, setReferenceDocument] = useState<string | null>(null);
  const [tuniverseFrameHeight, setTuniverseFrameHeight] = useState<number | null>(null);
  const [referenceLoadFailed, setReferenceLoadFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasA11ywayHero = config.layout === "a11ywayHero";
  const shouldLoadReferenceSrcDoc = hasA11ywayHero;
  const shouldRenderReferenceSrcDoc = shouldLoadReferenceSrcDoc && referenceDocument !== null && !referenceLoadFailed;

  useEffect(() => {
    if (!isSkbpExperienceReference(config)) {
      return undefined;
    }

    const handleExperienceRouteMessage = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!isExperienceRouteMessage(event.data)) {
        return;
      }

      const targetRoute = getTopRouteForExperienceHash(event.data.hash);
      const currentRoute = `${window.location.pathname}${window.location.hash}`;
      if (currentRoute === targetRoute) {
        return;
      }

      if (event.data.navigationType === "replace") {
        window.history.replaceState(null, "", targetRoute);
        return;
      }

      window.history.pushState(null, "", targetRoute);
    };

    window.addEventListener("message", handleExperienceRouteMessage);
    return () => window.removeEventListener("message", handleExperienceRouteMessage);
  }, [config]);

  useEffect(() => {
    if (!isSkbpExperienceReference(config)) {
      return undefined;
    }

    const syncFrameToTopRoute = () => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (frameWindow === null || frameWindow === undefined) {
        return;
      }

      const targetRoute = getExperienceRouteForTopRoute(window.location.pathname, window.location.hash);
      const currentRoute = `${frameWindow.location.pathname}${frameWindow.location.hash}`;
      if (currentRoute !== targetRoute) {
        frameWindow.location.assign(targetRoute);
      }
    };

    window.addEventListener("popstate", syncFrameToTopRoute);
    return () => window.removeEventListener("popstate", syncFrameToTopRoute);
  }, [config]);

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

  const handleReferenceFrameLoad = useCallback(() => {
    if (!shouldRenderReferenceSrcDoc || !hasA11ywayHero) {
      return;
    }

    window.requestAnimationFrame(updateTuniverseFrameHeight);
  }, [hasA11ywayHero, shouldRenderReferenceSrcDoc, updateTuniverseFrameHeight]);

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
    if (!shouldLoadReferenceSrcDoc) {
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

        setReferenceDocument(absolutizeTuniverseHtml(html, config.url));
        setReferenceLoadFailed(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (error instanceof Error) {
          setReferenceLoadFailed(true);
          return;
        }

        throw error;
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [config, shouldLoadReferenceSrcDoc]);

  useEffect(() => {
    if (!shouldRenderReferenceSrcDoc || !hasA11ywayHero) {
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
  }, [hasA11ywayHero, shouldRenderReferenceSrcDoc, updateTuniverseFrameHeight, viewportSignature]);

  const detailShellStyle: TuniverseShellStyle | undefined =
    hasA11ywayHero && tuniverseFrameHeight !== null
      ? { "--tuniverse-frame-height": `${tuniverseFrameHeight}px` }
      : undefined;
  const frameSrc = shouldLoadReferenceSrcDoc ? undefined : config.url;
  const frameSrcDoc = shouldRenderReferenceSrcDoc ? referenceDocument : undefined;

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
          onLoad={handleReferenceFrameLoad}
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
