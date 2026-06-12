import { useState } from "react";
import type { CSSProperties } from "react";

const elifSections = [
  { height: 1107, name: "Elif_01.svg" },
  { height: 545, name: "Elif_02.svg" },
  { height: 2092, name: "Elif_03.svg" },
  { height: 2425, name: "Elif_04.svg" },
  { height: 3157, name: "Elif_05.svg" },
  { height: 1292, name: "Elif_06.png" },
  { height: 1926, name: "Elif_07.svg" },
  { height: 1467, name: "Elif_08.svg" },
  { height: 2685, name: "Elif_09.svg" },
  { height: 1859, name: "Elif_10.svg" },
  { height: 1410, name: "Elif_11.svg" },
  { height: 1162, name: "Elif_12.svg" },
  { height: 1080, name: "Elif_13.svg" },
  { height: 2036, name: "Elif_14.svg" },
  { height: 2365, name: "Elif_15.svg" },
  { height: 1984, name: "Elif_16.svg" },
  { height: 2332, name: "Elif_17.svg" },
] as const;

const vimeoSource = "https://player.vimeo.com/video/1103381792?h=3dec457f5d";

const sourceLayerStyle = {
  display: "block",
  lineHeight: 0,
  position: "relative",
} satisfies CSSProperties;

const videoTriggerStyle = {
  aspectRatio: "1 / 1",
  background: "transparent",
  border: 0,
  borderRadius: "999px",
  cursor: "pointer",
  left: "47.708333%",
  padding: 0,
  position: "absolute",
  top: "48.611111%",
  transform: "translate(-50%, -50%)",
  width: "11.458333%",
  zIndex: 2,
} satisfies CSSProperties;

const videoEmbedStyle = {
  background: "#000",
  bottom: 0,
  left: 0,
  lineHeight: 0,
  position: "absolute",
  right: 0,
  top: 0,
  zIndex: 3,
} satisfies CSSProperties;

const vimeoFrameStyle = {
  border: 0,
  display: "block",
  height: "100%",
  width: "100%",
} satisfies CSSProperties;

export function SkillUpNotePage() {
  const [isVideoEmbedded, setIsVideoEmbedded] = useState(false);

  return (
    <main className="skill-up-note-page" data-subpage="skill-up-note" data-testid="skill-up-note-page">
      <div className="skill-up-note-frame elif-source-stack" data-testid="skill-up-note-frame" aria-label="ELiF source stack">
        {elifSections.map((section, index) => {
          const isVideoSection = section.name === "Elif_13.svg";

          return (
            <div data-elif-layer={index + 1} key={section.name} style={sourceLayerStyle}>
              <img
                alt=""
                aria-hidden="true"
                className="elif-source-section"
                data-elif-index={index + 1}
                data-elif-source={section.name}
                height={section.height}
                loading={index < 3 ? "eager" : "lazy"}
                src={`/figma/skill-up-note/elif-source/${section.name}`}
                width={1920}
              />
              {isVideoSection && !isVideoEmbedded ? (
                <button
                  aria-label="Vimeo 영상 재생"
                  data-testid="skill-up-note-video-trigger"
                  onClick={() => setIsVideoEmbedded(true)}
                  style={videoTriggerStyle}
                  type="button"
                />
              ) : null}
              {isVideoSection && isVideoEmbedded ? (
                <div data-testid="skill-up-note-video-embed" style={videoEmbedStyle}>
                  <iframe
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    allowFullScreen
                    data-testid="skill-up-note-vimeo-player"
                    frameBorder="0"
                    height="360"
                    referrerPolicy="strict-origin-when-cross-origin"
                    src={vimeoSource}
                    style={vimeoFrameStyle}
                    title="vimeo-player"
                    width="640"
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </main>
  );
}
