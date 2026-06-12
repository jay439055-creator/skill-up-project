import { RippleMotionCanvas } from "./RippleMotionCanvas";

export function RippleExperience() {
  return (
    <main className="ripple_experience" data-testid="ripple-experience" aria-label="Ripple motion study">
      <section className="ripple_hero" aria-label="Ripple motion controls">
        <RippleMotionCanvas />
        <nav className="ripple_nav" aria-label="Ripple portfolio navigation">
          <a className="ripple_nav_home" href="#about">Home</a>
          <div className="ripple_nav_tabs">
            <a href="#about">about</a>
            <a href="#work">work</a>
            <a href="#contact">contact</a>
          </div>
        </nav>
        <div className="ripple_frame" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="ripple_panel">
          <h1 data-label="Current Archive">Current Archive</h1>
        </div>
      </section>
      <section className="ripple_after" aria-label="Portfolio body" />
    </main>
  );
}
