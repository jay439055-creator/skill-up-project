const elifSections = [
  { height: 1107, name: "Elif_01.svg" },
  { height: 545, name: "Elif_02.svg" },
  { height: 2092, name: "Elif_03.svg" },
  { height: 2425, name: "Elif_04.svg" },
  { height: 3157, name: "Elif_05.svg" },
  { height: 1292, name: "Elif_06.svg" },
  { height: 1926, name: "Elif_07.svg" },
  { height: 1467, name: "Elif_08.svg" },
  { height: 2685, name: "Elif_09.svg" },
  { height: 1859, name: "Elif_10.svg" },
  { height: 1410, name: "Elif_11.svg" },
  { height: 1162, name: "Elif_12.svg" },
  { height: 1080, name: "Elif_13.svg" },
  { height: 2036, name: "Elif_14.svg" },
  { height: 2365, name: "Elif_15.svg" },
  { height: 1984, name: "Elif_16.svg" },
  { height: 2332, name: "Elif_17.svg" },
] as const;

export function SkillUpNotePage() {
  return (
    <main className="skill-up-note-page" data-subpage="skill-up-note" data-testid="skill-up-note-page">
      <div className="skill-up-note-frame elif-source-stack" data-testid="skill-up-note-frame" aria-label="ELiF source stack">
        {elifSections.map((section, index) => (
          <img
            alt=""
            aria-hidden="true"
            className="elif-source-section"
            data-elif-index={index + 1}
            data-elif-source={section.name}
            height={section.height}
            key={section.name}
            loading={index < 3 ? "eager" : "lazy"}
            src={`/figma/skill-up-note/elif-source/${section.name}`}
            width={1920}
          />
        ))}
      </div>
    </main>
  );
}
