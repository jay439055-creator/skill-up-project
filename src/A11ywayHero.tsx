import { useCallback, useState } from "react";
import "./A11ywayHero.css";
import { A11ywayQuestHeroCanvas } from "./A11ywayQuestHeroCanvas";

const HERO_ASSET_PATH = "/figma/a11yway-hero";

type HeroLayer = {
  readonly alt: string;
  readonly className: string;
  readonly src: string;
  readonly testId: string;
};

const HERO_LAYERS = [
  {
    alt: "",
    className: "a11yway-hero__asset a11yway-hero__asset--background",
    src: `${HERO_ASSET_PATH}/background.svg`,
    testId: "a11yway-hero-background",
  },
  {
    alt: "a11yway VR machine",
    className: "a11yway-hero__asset a11yway-hero__asset--device",
    src: `${HERO_ASSET_PATH}/vr-machine.svg`,
    testId: "a11yway-hero-device",
  },
] as const satisfies readonly HeroLayer[];

export function A11ywayHero() {
  const [questRendererReady, setQuestRendererReady] = useState(false);
  const handleQuestReady = useCallback(() => setQuestRendererReady(true), []);

  return (
    <section className="a11yway-hero" data-testid="a11yway-hero" aria-label="a11yway hero">
      <div className="a11yway-hero__stage" data-quest-renderer-ready={questRendererReady ? "true" : undefined}>
        {HERO_LAYERS.map((layer) => (
          <img
            alt={layer.alt}
            className={layer.className}
            data-testid={layer.testId}
            draggable="false"
            key={layer.testId}
            src={layer.src}
          />
        ))}
        <A11ywayQuestHeroCanvas onReady={handleQuestReady} />
      </div>
    </section>
  );
}
