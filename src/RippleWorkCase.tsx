import type { RippleProject } from "./ripplePortfolio";

const transitionDotIds = [
  "dot-01",
  "dot-02",
  "dot-03",
  "dot-04",
  "dot-05",
  "dot-06",
  "dot-07",
  "dot-08",
  "dot-09",
  "dot-10",
  "dot-11",
  "dot-12",
  "dot-13",
  "dot-14",
  "dot-15",
  "dot-16",
  "dot-17",
  "dot-18",
] as const;

type RippleWorkCaseProps = {
  readonly index: number;
  readonly nextProject: RippleProject | undefined;
  readonly project: RippleProject;
};

type RippleWorkTransitionProps = {
  readonly href: string;
  readonly kicker: string;
  readonly project: RippleProject;
  readonly prompt: string;
  readonly variant?: "intro" | "next";
};

export function RippleWorkTransition({
  href,
  kicker,
  project,
  prompt,
  variant = "next",
}: RippleWorkTransitionProps) {
  const transitionClassName =
    variant === "intro" ? "ripple_next_work ripple_next_work--intro" : "ripple_next_work";

  return (
    <a className={transitionClassName} href={href} aria-label={`Enter work: ${project.title}`}>
      <span className="ripple_next_motion" aria-hidden="true">
        <span className="ripple_next_orb" />
        <span className="ripple_next_ring" />
        <span className="ripple_next_dot_field" />
        <span className="ripple_next_dot_cluster">
          {transitionDotIds.map((dotId) => (
            <span key={dotId} />
          ))}
        </span>
        <span className="ripple_next_wake" />
      </span>
      <span className="ripple_next_kicker">{kicker}</span>
      <strong>{project.title}</strong>
      <span className="ripple_next_line" aria-hidden="true" />
      <span className="ripple_next_meta">
        <span>{project.client}</span>
        <span>{project.period}</span>
        <span>{project.category}</span>
      </span>
      <span className="ripple_next_prompt">{prompt}</span>
    </a>
  );
}

export function RippleWorkCase({ index, nextProject, project }: RippleWorkCaseProps) {
  const workNumber = String(index + 1).padStart(2, "0");
  const nextWorkNumber = nextProject ? String(index + 2).padStart(2, "0") : "";

  return (
    <article className="ripple_case" id={project.id}>
      <div className="ripple_case_intro">
        <p className="ripple_case_count">Work {workNumber}</p>
        <h3>{project.title}</h3>
        <span className="ripple_case_entry_line" aria-hidden="true" />
        <dl className="ripple_case_meta">
          <div>
            <dt>Client</dt>
            <dd>{project.client}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{project.category}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{project.period}</dd>
          </div>
          <div>
            <dt>Link</dt>
            <dd>
              <a href={project.href}>Open project</a>
            </dd>
          </div>
        </dl>
        <p className="ripple_case_overview">{project.overview}</p>
      </div>
      <div className="ripple_case_visual" aria-hidden="true">
        <div className="ripple_case_visual_header">
          <span>{project.title}</span>
          <span>{workNumber}</span>
        </div>
        <div className="ripple_case_visual_body">
          <span />
          <span />
          <span />
        </div>
      </div>
      <section className="ripple_case_story" aria-label={`${project.title} portfolio flow`}>
        {project.chapters.map((chapter, chapterIndex) => (
          <article className="ripple_case_chapter" key={chapter.title}>
            <p>
              {String(chapterIndex + 1).padStart(2, "0")} / {chapter.label}
            </p>
            <div>
              <h4>{chapter.title}</h4>
              <span>{chapter.body}</span>
            </div>
          </article>
        ))}
      </section>
      <div className="ripple_case_screens" aria-label={`${project.title} screen sequence`}>
        {project.screens.map((screen) => (
          <figure className="ripple_case_screen" key={screen.title}>
            <strong>{screen.title}</strong>
            <figcaption>{screen.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="ripple_case_detail">
        <p>{project.statement}</p>
        <div className="ripple_case_result">
          <div className="ripple_case_metrics">
            {project.metrics.map((metric) => (
              <span className="ripple_case_metric" key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </span>
            ))}
          </div>
          <ul>
            {project.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </div>
      </div>
      {nextProject ? (
        <RippleWorkTransition
          href={nextProject.route}
          kicker={`Work ${workNumber} to Work ${nextWorkNumber}`}
          project={nextProject}
          prompt="Scroll to enter"
        />
      ) : null}
    </article>
  );
}
