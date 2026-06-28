import { assets, philosophyItems } from "./bpcoContent";

type PhilosophyContentsProps = {
  readonly body: string;
  readonly kr: string;
};

function PhilosophyContents({ body, kr }: PhilosophyContentsProps) {
  return (
    <>
      <span className="t_gap" />
      {body}
      <div className="copy_kr">{kr}</div>
    </>
  );
}

export function BpcoPhilosophySection() {
  const first = philosophyItems[0];
  const second = philosophyItems[1];
  const third = philosophyItems[2];

  return (
    <section className="main m2" aria-label="BPCO philosophy">
      <div className="m2_sticky">
        <div className="row_container">
          <div className="row_section rs1">
            <div className="copy_section">
              <h2 className="m2_title main_title" aria-label="We are">
                <span className="tspan tspan_w" aria-hidden="true" />
                e are
              </h2>
              <article className="main_desc m2_desc">
                <div className="de_title">
                  <span className="de_num">{first.number}</span>
                  <h3>{first.title}</h3>
                </div>
                <div className="de_contents">
                  <PhilosophyContents body={first.body} kr={first.kr} />
                </div>
              </article>
            </div>
            <div className="img_section" aria-hidden="true">
              <div className="round_img">
                <img className="back_img" src={assets.interior} alt="" />
                <img className="copy_img" src={assets.philosophy} alt="" />
              </div>
              <p className="copy_deco">
                We highly value joy and discover it in various aspects of life. Pleasure is at the core of what we do
              </p>
            </div>
          </div>

          <div className="row_section rs2">
            <div className="copy_section">
              <article className="main_desc m2_desc">
                <div className="de_title">
                  <span className="de_num">{second.number}</span>
                  <h3>{second.title}</h3>
                </div>
                <div className="de_contents">
                  <PhilosophyContents body={second.body} kr={second.kr} />
                </div>
              </article>
              <h2 className="m2_title main_title" aria-label="Principle">
                <span className="tspan tspan_2" />
                rin
                <span className="tspan tspan_3">
                  <img src="https://www.bpco.kr/img/main_c.webp" alt="" />
                </span>
                iple
              </h2>
            </div>
          </div>

          <div className="row_section rs3">
            <p className="copy_deco">
              We prove the power of BPCO <br />
              through fresh, creative, and <br />
              cutting-edge advertisements
            </p>
            <div className="copy_section">
              <h2 className="m2_title main_title" aria-label="Mission">
                <span className="tspan tspan_4" />
                is
                <span className="tspan tspan_5">
                  <img src={assets.titleSmall} alt="" />
                </span>
                ion
              </h2>
              <article className="main_desc m2_desc">
                <div className="de_title">
                  <span className="de_num">{third.number}</span>
                  <h3>{third.title}</h3>
                </div>
                <div className="de_contents">
                  <PhilosophyContents body={third.body} kr={third.kr} />
                </div>
              </article>
            </div>
          </div>

          <div className="row_section rs4" aria-hidden="true">
            <img className="back_img" src={assets.heroPoster} alt="" />
          </div>

          <div className="row_section rs5" aria-label="Recent project preview">
            <div className="section_info">
              <span className="section_title">Recent project</span>
              <span className="pr_title">4P—CREATIVE—Campaign</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
