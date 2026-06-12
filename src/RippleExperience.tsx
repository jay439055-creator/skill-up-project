import { useEffect, useState } from "react";
import { RippleMotionCanvas } from "./RippleMotionCanvas";

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

export function RippleExperience() {
  const [navOnLight, setNavOnLight] = useState(false);

  useEffect(() => {
    const aboutSection = document.getElementById("about");

    if (!aboutSection) {
      return;
    }

    let animationFrame = 0;

    const updateNavTone = () => {
      animationFrame = 0;

      const switchLine = window.matchMedia("(max-width: 820px)").matches ? 78 : 108;
      const aboutRect = aboutSection.getBoundingClientRect();
      const nextNavOnLight = aboutRect.top <= switchLine;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const revealProgress = clampProgress((viewportHeight * 0.7 - aboutRect.top) / (viewportHeight * 0.58));
      const driftProgress = clampProgress((viewportHeight * 0.58 - aboutRect.top) / (viewportHeight * 0.92));
      const easedReveal = revealProgress * revealProgress * (3 - 2 * revealProgress);
      const entryDistance = 1 - easedReveal;
      const driftWave = Math.sin(driftProgress * Math.PI * 2);

      aboutSection.style.setProperty("--ripple_about_alpha", (0.08 + easedReveal * 0.92).toFixed(4));
      aboutSection.style.setProperty("--ripple_about_blur", `${(1 - easedReveal) * 2.4}px`);
      aboutSection.style.setProperty("--ripple_about_lift", `${entryDistance * 108}px`);
      aboutSection.style.setProperty("--ripple_about_word_space", `${entryDistance * 2.8}vw`);
      aboutSection.style.setProperty("--ripple_about_line_1", `${-6.2 * entryDistance + driftWave * 0.34}vw`);
      aboutSection.style.setProperty("--ripple_about_line_2", `${5.4 * entryDistance - driftWave * 0.3}vw`);
      aboutSection.style.setProperty("--ripple_about_line_3", `${-3.8 * entryDistance + driftWave * 0.24}vw`);
      aboutSection.style.setProperty("--ripple_about_line_4", `${4.8 * entryDistance - driftWave * 0.22}vw`);
      aboutSection.style.setProperty("--ripple_about_line_5", `${-2.6 * entryDistance + driftWave * 0.18}vw`);
      aboutSection.style.setProperty("--ripple_about_line_6", `${3.2 * entryDistance - driftWave * 0.16}vw`);

      setNavOnLight((currentNavOnLight) =>
        currentNavOnLight === nextNavOnLight ? currentNavOnLight : nextNavOnLight,
      );
    };

    const requestNavToneUpdate = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateNavTone);
    };

    updateNavTone();
    window.addEventListener("scroll", requestNavToneUpdate, { passive: true });
    window.addEventListener("resize", requestNavToneUpdate);

    return () => {
      window.removeEventListener("scroll", requestNavToneUpdate);
      window.removeEventListener("resize", requestNavToneUpdate);

      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <main className="ripple_experience" data-testid="ripple-experience" aria-label="Ripple motion study">
      <section className="ripple_hero" aria-label="Ripple motion controls">
        <RippleMotionCanvas />
        <nav className={`ripple_nav${navOnLight ? " is_on_light" : ""}`} aria-label="Ripple portfolio navigation">
          <a className="ripple_nav_home" href="#about">Home</a>
          <div className="ripple_nav_tabs">
            <a href="#about">about</a>
            <a href="/skill-up-note">work</a>
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
      <section
        className="ripple_transition"
        data-testid="ripple-transition"
        data-transition-surface="white-gradient-veil"
        aria-hidden="true"
      />
      <section id="about" className="ripple_after" aria-label="Portfolio body">
        <div className="ripple_about_intro">
          <p className="ripple_about_kicker">(How I Work)</p>
          <h2 aria-label="A UX/UI designer using AI-native workflows to turn complex problems into clear, user-centered product experiences. Focused on service planning, interaction design, and AI-driven UX, I design meaningful digital experiences that connect business goals with real user needs.">
            <span className="ripple_about_line">A UX/UI DESIGNER USING AI-NATIVE WORKFLOWS</span>
            <span className="ripple_about_line">TO TURN COMPLEX PROBLEMS INTO CLEAR,</span>
            <span className="ripple_about_line">USER-CENTERED PRODUCT EXPERIENCES.</span>
            <span className="ripple_about_line">FOCUSED ON SERVICE PLANNING, INTERACTION DESIGN,</span>
            <span className="ripple_about_line">AND AI-DRIVEN UX, I DESIGN MEANINGFUL DIGITAL EXPERIENCES</span>
            <span className="ripple_about_line">THAT CONNECT BUSINESS GOALS WITH REAL USER NEEDS.</span>
          </h2>
          <p className="ripple_about_copy">
            복잡한 문제를 사용자에게 명확한 경험으로 바꾸는 UX/UI 디자이너입니다. AI-native 워크플로우를
            바탕으로 서비스 기획, 인터랙션 디자인, AI-driven UX를 탐구하며, 비즈니스의 방향성과 사용자의 실제
            니즈가 만나는 지점을 설계합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
