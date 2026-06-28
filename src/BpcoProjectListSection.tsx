import "./BpcoProjectList.css";

const mainProjects = [
  {
    client: "BAEMIN B",
    title: "BAEMIN B OOH Campaign",
    image: "https://images.prismic.io/btco/aT-ddXNYClf9oLb9_BAEMINB_0main.jpg?auto=format,compress",
  },
  {
    client: "MARITHÉ",
    title: "MARITHÉ an annual OOH Campaign",
    image: "https://images.prismic.io/btco/aT-fBHNYClf9oLcF_marihte_0main.png?auto=format,compress",
  },
  {
    client: "DESCENTE",
    title: "DESCENTE 90th Campagin",
    image: "https://images.prismic.io/btco/aT-p0HNYClf9oLdL_DESCENTE_0m.jpg?auto=format,compress",
  },
  {
    client: "Pokémon GO",
    title: "Pokémon GO an Annual Campaign",
    image: "https://images.prismic.io/btco/aT-sFnNYClf9oLdc_pokemon_0main.jpg?auto=format,compress",
  },
  {
    client: "YEOGIEOTTAE",
    title: "YEOGIEOTTAE an Annual Campaign",
    image: "https://images.prismic.io/btco/aT_TdnNYClf9oLpm_Yeogi_1.jpg?auto=format,compress",
  },
  {
    client: "hince",
    title: "hince an annual OOH Campaign",
    image: "https://images.prismic.io/btco/aT-t4nNYClf9oLdu_Hince_0main.jpg?auto=format,compress",
  },
  {
    client: "NAVER SHOPPING",
    title: "NAVER OOH Campaign",
    image: "https://images.prismic.io/btco/aT_V7XNYClf9oLq7_Naver_0.jpg?auto=format,compress",
  },
] as const;

const subProjects = [
  ["YEOGIEOTTAE CORP", "Yeogieottae", "OOH", "2025. 12"],
  ["BENOW", "fwee", "OOH", "2026. 02"],
  ["EASTAR JET", "Eastar Jet", "OOH", "2025. 12"],
  ["NIANTIC", "Pokémon GO", "CAMPAIGN", "2026. 02"],
  ["ON KOREA", "ON", "OOH&CREATIVE", "2025. 12"],
  ["MEGASTUDY", "Megastudy", "OOH", "2025. 12"],
  ["BENOW", "Knock", "OOH", "2025. 12"],
] as const;

export function BpcoProjectListSection() {
  return (
    <section className="project_list" id="projects" aria-label="Recent projects">
      <div className="pr_info" aria-hidden="true">
        <span>25Y 10M07</span>
        <span>01—BAEMIN B OOH Campaign</span>
      </div>
      <div className="intro_ani_wrap">
        <div className="main_projects">
          {mainProjects.map((project, index) => (
            <article className={`mp_item${index === 0 ? " active" : ""}`} key={project.title}>
              <div className="pr_client">
                <span className="pr_num">({String(index + 1).padStart(2, "0")})</span>
                {project.client}
              </div>
              <div className="pr_img">
                <img src={project.image} alt="" />
              </div>
              <div className="pr_title">{project.title}</div>
            </article>
          ))}
          <div className="other_title">Other projects</div>
        </div>
      </div>
      <div className="sub_projects" aria-label="Other projects">
        {subProjects.map(([client, brand, type, date]) => (
          <div className="sp_item" key={`${client}-${brand}-${date}`}>
            <div className="sp_client">{client}</div>
            <div className="sp_brand">{brand}</div>
            <div className="sp_type">{type}</div>
            <div className="sp_date">{date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
