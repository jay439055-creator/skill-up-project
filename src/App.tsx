import { BpcoBusinessSection } from "./BpcoBusinessSection";
import { BpcoFooter } from "./BpcoFooter";
import { BpcoHeroCanvas } from "./BpcoHeroCanvas";
import { BpcoPhilosophySection } from "./BpcoPhilosophySection";
import { BpcoProjectDiceSection } from "./BpcoProjectDiceSection";
import { BpcoProjectListSection } from "./BpcoProjectListSection";
import { assets } from "./bpcoContent";
import { RippleExperience } from "./RippleExperience";
import { SequenceLabsPage } from "./SequenceLabsPage";
import { useBpcoScrollMotion } from "./useBpcoScrollMotion";

const ledItems = Array.from({ length: 4 }, (_, index) => `led-${index + 1}`);

function BpcoPage() {
  useBpcoScrollMotion();

  return (
    <div className="bpco-page" data-testid="bpco-page">
      <header className="header" aria-label="Bigpicture Company navigation">
        <a className="logo" href="#home" aria-label="Bigpicture Company home">
          Bigpicture Company
          <span className="logo_tagline">
            We share
            <br />
            Our pleasure
          </span>
        </a>
        <div className="header_meta" aria-label="Bigpicture Company metadata">
          <span>Creativity_agency</span>
          <span>Offline_marketing</span>
          <span className="local_info">
            <img src={assets.globe} alt="" />
            Seoul,Korea
          </span>
        </div>
      </header>

      <nav className="nav" aria-label="Primary">
        <a href="#home">HOME</a>
        <a href="#projects">PROJECTS</a>
        <a href="#contact">CONTACT</a>
      </nav>

      <BpcoHeroCanvas />
      <BpcoProjectDiceSection />

      <main className="contents_wrap">
        <section className="main m1" id="home" aria-label="BPCO hero">
          <div className="hero_motion_anchor" aria-hidden="true" />
          <h1 className="hero_heading">
            <span>We share</span>
            {" "}
            <span>Our pleasure</span>
          </h1>
          <h2 className="intro_copy">
            We are an advertising agency specializing in planning, production and execution of <br />
            large-scale outdoor advertisements that captivate attention.{" "}
            <span className="mobile_hidden">
              The company's exceptional performance lies in <br />
              creating innovative and distinctive images that leave a lasting impression on the audience's minds.
            </span>
          </h2>
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
              <strong>BIPICTURE COMPANY</strong>
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

        <BpcoPhilosophySection />

        <BpcoProjectListSection />

        <BpcoBusinessSection />
      </main>

      <BpcoFooter />
    </div>
  );
}

export function App() {
  if (window.location.pathname === "/labs" || window.location.pathname === "/sequence-labs") {
    return <SequenceLabsPage />;
  }

  if (window.location.pathname === "/ripple") {
    return <RippleExperience />;
  }

  return <BpcoPage />;
}
