import { useEffect } from "react";
import { BpcoHeroCanvas } from "./BpcoHeroCanvas";
import { assets, businessItems, philosophyItems, projectItems } from "./bpcoContent";
import { RippleExperience } from "./RippleExperience";

const clamp = (value: number, min = 0, max = 1): number => Math.min(Math.max(value, min), max);
const ledItems = Array.from({ length: 4 }, (_, index) => `led-${index + 1}`);

function useBpcoScrollMotion(): void {
  useEffect(() => {
    let frameId = 0;
    const root = document.documentElement;

    const sync = () => {
      frameId = 0;
      const y = window.scrollY;
      const heroZoom = clamp(y / 900);
      const heroProgress = clamp(y / 3316);
      const introUiOpacity = y < 360 ? clamp(1 - y / 360) : 0;
      const projectProgress = clamp((y - 4216) / 8412);
      const objectOpacity = y < 2400 ? 1 : clamp(1 - (y - 2400) / 650);
      const heroObject = document.getElementById("main_canvas");

      heroObject?.setAttribute("src", assets.heroModel);
      heroObject?.setAttribute("data-model-progress", clamp(y / 3000).toFixed(4));

      root.style.setProperty("--hero-progress", heroProgress.toFixed(4));
      root.style.setProperty("--hero-zoom", heroZoom.toFixed(4));
      root.style.setProperty("--intro-ui-opacity", introUiOpacity.toFixed(4));
      root.style.setProperty("--hero-object-opacity", objectOpacity.toFixed(4));
      root.style.setProperty("--project-progress", projectProgress.toFixed(4));
    };

    const requestSync = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(sync);
      }
    };

    sync();
    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", requestSync);
      window.removeEventListener("resize", requestSync);
    };
  }, []);
}

function BpcoPage() {
  useBpcoScrollMotion();

  return (
    <div className="bpco-page" data-testid="bpco-page">
      <header className="header" aria-label="Bigpicture Company navigation">
        <a className="logo" href="#home" aria-label="Bigpicture Company home">
          Bigpicture Company
        </a>
        <div className="header_meta" aria-label="Bigpicture Company metadata">
          <span>Creativity_agency</span>
          <span>Offline_marketing</span>
          <span>Seoul,Korea</span>
        </div>
        <nav className="nav" aria-label="Primary">
          <a href="#home">HOME</a>
          <a href="#projects">PROJECTS</a>
          <a href="#contact">CONTACT</a>
        </nav>
      </header>

      <BpcoHeroCanvas />

      <main className="contents_wrap">
        <section className="main m1" id="home" aria-label="BPCO hero">
          <div className="hero_motion_anchor" aria-hidden="true" />
          <h1 className="hero_heading">
            <span>We share</span>
            <span>Our pleasure</span>
          </h1>
          <p className="hero_statement">
            We are an advertising agency specializing in planning, production and execution of large-scale outdoor
            advertisements that captivate attention. The company's exceptional performance lies in creating innovative
            and distinctive images that leave a lasting impression on the audience's minds.
          </p>
          <div className="led_section" aria-hidden="true">
            {ledItems.map((item) => (
              <div className="led_item" key={item}>
                <div className="led_top">
                  <div className="led_l" />
                  <div className="led_b" />
                </div>
                <div className="led_bottom">
                  <div className="led_l" />
                  <div className="led_b" />
                </div>
                <div className="led_shadow" />
              </div>
            ))}
          </div>
          <div className="hero_caption">
            <div className="ic_name">
              <span>©BPCO</span>
            </div>
            <p className="ic_desc">
              advertising agency specializing in planning, production, and outdoor advertisements
            </p>
            <div className="ic_bottom">
              <strong>BIGPICTURE COMPANY</strong>
              <small>08</small>
            </div>
          </div>
          <div className="scroll_cue">
            <div className="arrow_section" aria-hidden="true">
              <div className="ar_items">
                <div className="ar_item ar1 ar11" />
                <div className="ar_item ar1 ar12" />
                <div className="ar_item ar1 ar13" />
                <div className="ar_item ar2 ar21" />
                <div className="ar_item ar2 ar22" />
                <div className="ar_item ar2 ar23" />
                <div className="ar_item ar2 ar24" />
                <div className="ar_item ar3 ar31" />
                <div className="ar_item ar3 ar32" />
              </div>
              <div className="ar_items">
                <div className="ar_item ar1 ar11" />
                <div className="ar_item ar1 ar12" />
                <div className="ar_item ar1 ar13" />
                <div className="ar_item ar2 ar21" />
                <div className="ar_item ar2 ar22" />
                <div className="ar_item ar2 ar23" />
                <div className="ar_item ar2 ar24" />
                <div className="ar_item ar3 ar31" />
                <div className="ar_item ar3 ar32" />
              </div>
            </div>
            <span>PLEASE SCROLL DOWN</span>
          </div>
        </section>

        <section className="main m2" aria-label="BPCO philosophy">
          <div className="round_img">
            <img src={assets.interior} alt="Bigpicture Company workspace" />
          </div>
          <div className="philosophy_copy">
            <p className="eyebrow">BPCO PHILOSOPHY</p>
            <h2>We share Our pleasure</h2>
            <p>
              Bigpicture Company looks for the wider answer between brands, cities, and people. We make communication
              that moves naturally through offline media and public space.
            </p>
          </div>
        </section>

        <section className="project_list" id="projects" aria-label="Recent projects">
          <div className="project_head">
            <p className="eyebrow">RECENT PROJECT</p>
            <h2>What we made recently</h2>
            <div className="symbol_row" aria-hidden="true">
              <img src={assets.star} alt="" />
              <img src={assets.starAlt} alt="" />
            </div>
          </div>
          <div className="project_track">
            {projectItems.map((project) => (
              <article className="mp_item" key={project.title}>
                <div className="pr_img">
                  <img src={project.image} alt="" />
                </div>
                <div className="project_meta">
                  <span>{project.year}</span>
                  <span className="project_date">{project.date}</span>
                </div>
                <h2 className="project_title">{project.title}</h2>
                <p>{project.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="main m4" id="business" aria-label="Business fields">
          <div className="business_sticky">
            <p className="eyebrow">BUSINESS</p>
            <h2>We will, as always, seek the answers</h2>
            <div className="business_grid">
              {businessItems.map((item) => (
                <span className="bs_item" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="desc_grid">
              {philosophyItems.map((item) => (
                <article className="main_desc" key={item.title}>
                  <span>{item.number}</span>
                  <h3>
                    <span>{item.title}</span>
                  </h3>
                  <p>{item.body}</p>
                  <small>{item.kr}</small>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact">
        <div>
          <img src={assets.logo} alt="Bigpicture Company" />
          <img className="qr_img" src={assets.qr} alt="" />
          <span className="footer_label">OOH EXPERIENCE PARTNER</span>
          <p>Bigpicture Company</p>
        </div>
        <address>
          +82)02 798 9248
          <br />
          bpco@bpco.kr
        </address>
      </footer>
    </div>
  );
}

export function App() {
  if (window.location.pathname === "/ripple") {
    return <RippleExperience />;
  }

  return <BpcoPage />;
}
