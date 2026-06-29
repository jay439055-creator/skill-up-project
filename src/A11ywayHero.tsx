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
  {
    alt: "A11yway Quest headset with accessible VR controls",
    className: "a11yway-hero__asset a11yway-hero__asset--reference",
    src: `${HERO_ASSET_PATH}/reference-hero.png`,
    testId: "a11yway-hero-reference",
  },
] as const satisfies readonly HeroLayer[];

type QuestRendererState = "loading" | "ready" | "failed";

export function A11ywayHero() {
  const [questRendererState, setQuestRendererState] = useState<QuestRendererState>("loading");
  const handleQuestError = useCallback(() => setQuestRendererState("failed"), []);
  const handleQuestReady = useCallback(() => setQuestRendererState("ready"), []);

  return (
    <section className="a11yway-hero" data-testid="a11yway-hero" aria-label="a11yway hero">
      <div className="a11yway-hero__stage" data-quest-renderer-state={questRendererState}>
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
        <A11ywayQuestHeroCanvas onError={handleQuestError} onReady={handleQuestReady} />
      </div>
    </section>
  );
}
