import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  readonly alt?: string;
  readonly "auto-rotate"?: boolean;
  readonly "camera-orbit"?: string;
  readonly "disable-zoom"?: boolean;
  readonly "field-of-view"?: string;
  readonly "interaction-prompt"?: string;
  readonly poster?: string;
  readonly "rotation-per-second"?: string;
  readonly "shadow-intensity"?: string;
  readonly src?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      readonly "model-viewer": ModelViewerAttributes;
    }
  }
}
