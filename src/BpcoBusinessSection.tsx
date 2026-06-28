import type { ReactElement } from "react";

import { businessItems, projectItems } from "./bpcoContent";

export function BpcoBusinessSection(): ReactElement {
  return (
    <section className="main m4" id="business" aria-label="Business fields">
      <div className="m4_sticky">
        <div className="m4_media_collage" aria-hidden="true">
          {projectItems.map((project, index) => (
            <img className={`m4_media_item mi${index + 1}`} src={project.image} alt="" key={project.title} />
          ))}
        </div>
        <div className="section_title">(2020 - NOW, WHAT WE DO)</div>
        <div className="section_desc">"We will, as always, seek the answers just like we have always done." </div>
        <div className="business_items">
          {businessItems.map((item) => (
            <span className="bs_item" key={item}>
              <span className="bs_label">{item}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
