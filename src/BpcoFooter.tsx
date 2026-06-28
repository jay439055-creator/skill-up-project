import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

import { assets } from "./bpcoContent";
import "./BpcoFooter.css";

const FOOTER_COPY =
  "We are an advertising agency specializing in planning, production and execution of large-scale outdoor advertisements that captivate attention. The company's exceptional performance lies in creating innovative and distinctive images that leave a lasting impression on the audience's minds.";

const COMPANY_ITEMS = ["©BPCO 2023", "+82)02 798 9248", "bpco@bpco.kr"] as const;

function SayHiCanvas(): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    const context = canvas.getContext("2d");
    if (context === null) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "500 120px Helvetica Neue, Arial, sans-serif";
    context.textBaseline = "top";
    context.fillStyle = "#898989";

    const text = "SAY HI";
    const textWidth = context.measureText(text).width;
    const x = Math.round((canvas.width - textWidth) / 2);
    context.fillText(text, x, 40);
  }, []);

  return <canvas id="say_canvas" ref={canvasRef} width="1000" height="300" aria-hidden="true" />;
}

export function BpcoFooter(): ReactElement {
  return (
    <footer className="bpco_footer" id="contact">
      <div className="deco_img" aria-hidden="true">
        <img src={assets.star} alt="company decoration icon" />
        <img src={assets.starAlt} alt="company decoration icon" />
      </div>
      <div className="main_copy">
        <SayHiCanvas />
      </div>
      <div className="bottom_section">
        <div className="logo_section">
          <img src={assets.logo} alt="company logo" />
        </div>
        <div className="company_info_items">
          {COMPANY_ITEMS.map((item) => (
            <div className="ci_item" key={item}>
              {item}
            </div>
          ))}
          <div className="ci_item mobile_hidden">
            <a href="https://works.do/51O7nVU" download>
              credential.pdf
            </a>
          </div>
        </div>
        <p className="info_copy">{FOOTER_COPY}</p>
      </div>
      <div className="deco_img" aria-hidden="true">
        <img src={assets.qr} alt="company decoration icon" />
      </div>
    </footer>
  );
}
