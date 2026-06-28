import { RippleMotionCanvas } from "./RippleMotionCanvas";

export function RippleExperience() {
  return (
    <main className="ripple_experience" data-testid="ripple-experience" aria-label="Ripple motion study">
      <RippleMotionCanvas />
      <div className="ripple_frame" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <section className="ripple_panel" aria-label="Ripple motion controls">
        <p>THE RIPPLE</p>
        <h1>Wave field study</h1>
        <div className="ripple_status">
          <span>Intro drop</span>
          <span>Pointer waves</span>
          <span>Perspective grid</span>
        </div>
      </section>
    </main>
  );
}
