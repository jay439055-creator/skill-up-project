import { projectItems } from "./bpcoContent";
import { BpcoProjectTvNoiseCanvas } from "./BpcoProjectTvNoiseCanvas";

const diceSlots = [...projectItems, null] as const;

function formatBarcode(date: string, year: string): string {
  return `${date.replace(/\s+/g, "")}${year}`;
}

export function BpcoProjectDiceSection() {
  const primaryProject = projectItems[0];

  return (
    <div className="m3_dice_section" aria-label="Recent project dice surface">
      <div className="project_split_labels" aria-hidden="true">
        <span className="project_split_left">RECENT PROJECT</span>
        <span className="project_split_right">4P—CREATIVE—CAMPAIGN</span>
      </div>
      <div className="project_left_label">RECENT PROJECT</div>
      <div className="project_right_label">4P—CREATIVE—CAMPAIGN</div>
      <div className="pr_section">
        <div className="dice_items">
          {diceSlots.map((project, index) => (
            <article className={`dice_item di${index + 2}`} key={project?.title ?? "tv-screen"}>
              {project === null ? (
                <BpcoProjectTvNoiseCanvas />
              ) : (
                <>
                  <img src={project.image} alt="" />
                  <div className="barcode_section" aria-hidden="true">
                    {Array.from({ length: 26 }, (_, barIndex) => (
                      <span className={`bar_item bi${(barIndex % 11) + 1}`} key={`bar-${barIndex}`} />
                    ))}
                    <span className="barcode_number">{formatBarcode(project.date, project.year)}</span>
                  </div>
                  <div className="info_section">
                    <div className="info_header">
                      <span className="info_title">{project.title}</span>
                      <span className="info_number">{project.year}</span>
                    </div>
                    <p>{project.body}</p>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </div>
      <div className="project_tv_underside_overlay" aria-hidden="true">
        <BpcoProjectTvNoiseCanvas />
      </div>
      <p className="pr_desc">{primaryProject.description}</p>
    </div>
  );
}
