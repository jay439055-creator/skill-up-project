import { useEffect, useState } from "react";
import { RippleMotionCanvas } from "./RippleMotionCanvas";
import { RippleWorkCase, RippleWorkTransition } from "./RippleWorkCase";
import { getWorkProjectFromPathname, portfolioProjects } from "./ripplePortfolio";

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));
const smoothProgress = (value: number) => {
  const clampedValue = clampProgress(value);
  return clampedValue * clampedValue * (3 - 2 * clampedValue);
};

export function RippleExperience() {
  const [navOnLight, setNavOnLight] = useState(false);
  const firstProject = portfolioProjects[0];

  useEffect(() => {
    const initialProject = getWorkProjectFromPathname(window.location.pathname);

    if (!initialProject) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      document.getElementById(initialProject.id)?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const syncWorkRoute = () => {
      animationFrame = 0;
      const routeLine = window.innerHeight * 0.5;
      const firstProjectNode = document.getElementById(portfolioProjects[0]?.id ?? "");
      const firstProjectTop = firstProjectNode
        ? firstProjectNode.getBoundingClientRect().top + window.scrollY
        : Number.POSITIVE_INFINITY;
      const isBeforeFirstProject = window.scrollY + routeLine < firstProjectTop;
      const activeProject = portfolioProjects.find((project) => {
        const projectNode = document.getElementById(project.id);

        if (!projectNode) {
          return false;
        }

        const projectRect = projectNode.getBoundingClientRect();
        return projectRect.top <= routeLine && projectRect.bottom > routeLine;
      });

      if (!activeProject) {
        if (isBeforeFirstProject && window.location.pathname !== "/ripple") {
          window.history.replaceState(null, "", "/ripple");
        }

        return;
      }

      if (window.location.pathname === activeProject.route) {
        return;
      }

      window.history.replaceState(null, "", activeProject.route);
    };

    const requestRouteSync = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(syncWorkRoute);
    };

    requestRouteSync();
    window.addEventListener("scroll", requestRouteSync, { passive: true });
    window.addEventListener("resize", requestRouteSync);

    return () => {
      window.removeEventListener("scroll", requestRouteSync);
      window.removeEventListener("resize", requestRouteSync);

      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    const transitionSurfaces = Array.from(document.querySelectorAll<HTMLElement>(".ripple_next_work"));

    if (transitionSurfaces.length === 0) {
      return;
    }

    let animationFrame = 0;

    const updateTransitionProgress = () => {
      animationFrame = 0;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const viewportWidth = Math.max(window.innerWidth, 1);
      const maxOrbScale = viewportWidth < 820 ? 4.2 : 5.8;

      transitionSurfaces.forEach((surface) => {
        const rect = surface.getBoundingClientRect();
        const scrollTravel = viewportHeight + rect.height;
        const rawProgress = clampProgress((viewportHeight * 0.94 - rect.top) / scrollTravel);
        const coverProgress = smoothProgress((rawProgress - 0.04) / 0.54);
        const dotProgress = smoothProgress((rawProgress - 0.12) / 0.48);
        const titleProgress = smoothProgress((rawProgress - 0.36) / 0.34);
        const wakeProgress = smoothProgress((rawProgress - 0.52) / 0.32);
        const ringOpacity = Math.max(0.08, 0.74 * (1 - Math.abs(coverProgress - 0.44) * 1.55));
        const dotsOpacity = 0.1 + dotProgress * 0.74 - wakeProgress * 0.28;
        const dotsShift = (1 - dotProgress) * 74 - wakeProgress * 34;
        const orbX = (1 - coverProgress) * -28 + wakeProgress * 16;
        const orbY = (1 - coverProgress) * 42 - wakeProgress * 24;
        const veilOpacity = 0.26 + coverProgress * 0.42 + dotProgress * 0.16 - wakeProgress * 0.18;

        surface.style.setProperty("--ripple_next_orb_x", `${orbX.toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_orb_y", `${orbY.toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_orb_scale", (0.08 + coverProgress * (maxOrbScale - 0.08)).toFixed(4));
        surface.style.setProperty("--ripple_next_orb_opacity", (0.08 + coverProgress * 0.9 - wakeProgress * 0.22).toFixed(4));
        surface.style.setProperty("--ripple_next_orb_blur", `${(coverProgress * 2.4 + wakeProgress * 13).toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_ring_scale", (0.16 + coverProgress * 4.4).toFixed(4));
        surface.style.setProperty("--ripple_next_ring_opacity", ringOpacity.toFixed(4));
        surface.style.setProperty("--ripple_next_dots_opacity", dotsOpacity.toFixed(4));
        surface.style.setProperty("--ripple_next_dots_shift", `${dotsShift.toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_grid_opacity", (0.22 + dotsOpacity * 0.28).toFixed(4));
        surface.style.setProperty("--ripple_next_grid_shift", `${(dotsShift * 0.18).toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_dots_scale", (1.22 - dotProgress * 0.22 + wakeProgress * 0.18).toFixed(4));
        surface.style.setProperty("--ripple_next_title_alpha", titleProgress.toFixed(4));
        surface.style.setProperty("--ripple_next_title_lift", `${((1 - titleProgress) * 54).toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_title_blur", `${((1 - titleProgress) * 14).toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_wake_alpha", wakeProgress.toFixed(4));
        surface.style.setProperty("--ripple_next_wake_lift", `${((1 - wakeProgress) * 42 - wakeProgress * 8).toFixed(2)}%`);
        surface.style.setProperty("--ripple_next_wake_blur", `${(24 - wakeProgress * 4).toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_line_scale", titleProgress.toFixed(4));
        surface.style.setProperty("--ripple_next_veil_opacity", veilOpacity.toFixed(4));
        surface.style.setProperty("--ripple_next_veil_shift", `${(-9 + coverProgress * 12 - wakeProgress * 6).toFixed(2)}vw`);
        surface.style.setProperty("--ripple_next_veil_lift", `${(44 - coverProgress * 64 + wakeProgress * 18).toFixed(2)}px`);
        surface.style.setProperty("--ripple_next_veil_blur", `${(46 - coverProgress * 18 + wakeProgress * 16).toFixed(2)}px`);
      });
    };

    const requestTransitionProgressUpdate = () => {
      if (animationFrame !== 0) {
        return;
      }

      animationFrame = window.requestAnimationFrame(updateTransitionProgress);
    };

    updateTransitionProgress();
    window.addEventListener("scroll", requestTransitionProgressUpdate, { passive: true });
    window.addEventListener("resize", requestTransitionProgressUpdate);

    return () => {
      window.removeEventListener("scroll", requestTransitionProgressUpdate);
      window.removeEventListener("resize", requestTransitionProgressUpdate);

      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    const aboutSection = document.getElementById("about");
    const darkRouteSurfaces = Array.from(document.querySelectorAll(".ripple_next_work"));

    if (!aboutSection) {
      return;
    }

    let animationFrame = 0;

    const updateNavTone = () => {
      animationFrame = 0;

      const switchLine = window.matchMedia("(max-width: 820px)").matches ? 78 : 108;
      const aboutRect = aboutSection.getBoundingClientRect();
      const darkSurfaceAtNav = darkRouteSurfaces.some((surface) => {
        const surfaceRect = surface.getBoundingClientRect();
        return surfaceRect.top <= switchLine && surfaceRect.bottom > switchLine;
      });
      const nextNavOnLight = aboutRect.top <= switchLine && !darkSurfaceAtNav;
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
          <a className="ripple_nav_home" href="/ripple#about">Home</a>
          <div className="ripple_nav_tabs">
            <a href="/ripple#about">about</a>
            <a href="/work/1">work</a>
            <a href="/ripple#contact">contact</a>
          </div>
        </nav>
        <div className="ripple_frame" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="ripple_panel">
          <div className="ripple_title_stack">
            <h1 data-label="Portfolio">Portfolio</h1>
            <p className="ripple_title_name">Shinji</p>
          </div>
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
        <section id="work" className="ripple_work" aria-label="Portfolio projects">
          <div className="ripple_work_head">
            <p>(Selected Work)</p>
            <h2>Each project unfolds as a continuous scroll case.</h2>
          </div>
          <div className="ripple_case_stack">
            <RippleWorkTransition
              href={firstProject.route}
              kicker="Portfolio to Work 01"
              project={firstProject}
              prompt="Scroll to begin"
              variant="intro"
            />
            {portfolioProjects.map((project, index) => (
              <RippleWorkCase
                index={index}
                key={project.id}
                nextProject={portfolioProjects[index + 1]}
                project={project}
              />
            ))}
          </div>
        </section>
      </section>
      <section id="contact" className="ripple_contact" aria-label="Contact">
        <p>(Contact)</p>
        <a href="mailto:hello@shinji-portfolio.local">hello@shinji-portfolio.local</a>
      </section>
    </main>
  );
}
