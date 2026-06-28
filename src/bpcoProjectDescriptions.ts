import { projectItems } from "./bpcoContent";

const PROJECT_DICE_DESC_START = 3570;
const PROJECT_DICE_DESC_MARITHE_START = 4784;
const PROJECT_DICE_DESC_DESCENTE_START = 5784;
const PROJECT_DICE_DESC_POKEMON_START = 6464;
const PROJECT_DICE_DESC_CLEAR_START = 6800;

const PROJECT_DESCRIPTIONS = [
  {
    distance: PROJECT_DICE_DESC_START,
    text: projectItems[0].description,
  },
  {
    distance: PROJECT_DICE_DESC_MARITHE_START,
    text: projectItems[1].description,
  },
  {
    distance: PROJECT_DICE_DESC_DESCENTE_START,
    text: projectItems[2].description,
  },
  {
    distance: PROJECT_DICE_DESC_POKEMON_START,
    text: projectItems[3].description,
  },
  {
    distance: PROJECT_DICE_DESC_CLEAR_START,
    text: "",
  },
] as const;

export function getProjectDescriptionText(projectDistance: number): string {
  let text = "";
  for (const description of PROJECT_DESCRIPTIONS) {
    if (projectDistance >= description.distance) {
      text = description.text;
    }
  }

  return text;
}
