export const portfolioProjects = [
  {
    id: "work-01",
    route: "/work/1",
    title: "ELiF Archive",
    client: "ELiF",
    category: "Interaction / Case Study",
    period: "2025",
    href: "/skill-up-note",
    overview:
      "A long-form interaction archive that turns source screens, product notes, and motion records into one continuous case-study scroll.",
    statement:
      "The archive is organized like a visual record: viewers can move through the project context, interface decisions, and embedded product evidence without leaving the portfolio flow.",
    chapters: [
      {
        label: "Context",
        title: "Source material becomes a readable archive.",
        body: "The case starts from scattered visual references and reframes them as a single editorial sequence, so the project reads like one complete portfolio piece rather than a link list.",
      },
      {
        label: "Structure",
        title: "Each scroll beat carries one product decision.",
        body: "Large section changes separate intent, screen evidence, and motion records. The rhythm lets viewers understand why the page exists before asking them to open the full case.",
      },
      {
        label: "Interaction",
        title: "Motion records keep the archive alive.",
        body: "Video-like panels and quiet transitions create a sense of documentation in motion while keeping the surface calm enough for a portfolio reader.",
      },
    ],
    screens: [
      { title: "Opening Archive", caption: "Hero, source mood, and project scope" },
      { title: "Section Narrative", caption: "Scroll-led visual explanation" },
      { title: "Motion Record", caption: "Embedded interaction evidence" },
      { title: "Detail Route", caption: "Standalone case destination" },
    ],
    metrics: [
      { value: "06", label: "source sections" },
      { value: "03", label: "motion records" },
      { value: "01", label: "archive route" },
    ],
    outcomes: ["Long-form case structure", "Embedded motion records", "Visual documentation"],
  },
  {
    id: "work-02",
    route: "/work/2",
    title: "A11yway",
    client: "Skill Up A11yway",
    category: "AI-native UX / Accessibility",
    period: "2026",
    href: "#work-02",
    overview:
      "A mock accessibility portfolio case for an AI-native workflow that turns complex audit findings into clear product decisions.",
    statement:
      "A11yway explores how teams can move from fragmented accessibility problems to prioritized action with an interface language that keeps compliance, empathy, and product velocity in the same conversation.",
    chapters: [
      {
        label: "Problem",
        title: "Accessibility findings are hard to turn into decisions.",
        body: "Audit results often arrive as isolated issues. The mock service groups those signals by user impact, product area, and fix effort so teams can understand what to act on first.",
      },
      {
        label: "Flow",
        title: "AI becomes a review partner, not the final judge.",
        body: "The workflow drafts issue summaries, asks for missing context, and keeps human approval visible. Designers can move between evidence, recommendation, and handoff in one place.",
      },
      {
        label: "Handoff",
        title: "Every fix ends with a product-ready next step.",
        body: "Each accessibility item is translated into a concise design and development action, making the case useful for service planning as well as interface refinement.",
      },
    ],
    screens: [
      { title: "Audit Intake", caption: "Capture page, user flow, and standard" },
      { title: "AI Issue Map", caption: "Group findings by real user impact" },
      { title: "Priority Board", caption: "Balance urgency and implementation effort" },
      { title: "Fix Handoff", caption: "Turn evidence into next actions" },
    ],
    metrics: [
      { value: "12", label: "issue signals" },
      { value: "04", label: "workflow screens" },
      { value: "02", label: "handoff modes" },
    ],
    outcomes: ["Accessibility audit triage", "AI-assisted issue grouping", "Design handoff checklist"],
  },
] as const;

export type RippleProject = (typeof portfolioProjects)[number];

export const getWorkProjectFromPathname = (pathname: string) =>
  portfolioProjects.find((project) => project.route === pathname);
