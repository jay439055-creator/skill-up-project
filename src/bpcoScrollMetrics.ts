export const M2_HORIZONTAL_DISTANCE = 3968;
export const M2_HORIZONTAL_RATIO = 1.591;
export const SOURCE_HORIZONTAL_END_PADDING = 3000;
export const SOURCE_DESKTOP_ROW_TRAVEL = 6311.8;
export const SOURCE_DESKTOP_BASE_WIDTH = 1440;
export const SOURCE_PROJECT_WIDE_DELAY_RATIO = 1.6;
const SOURCE_WIDE_BASE_WIDTH = 1440;
const SOURCE_WIDE_REFERENCE_WIDTH = 1970;
const SOURCE_WIDE_HORIZONTAL_DISTANCE = 4800;
const SOURCE_WIDE_RS1_WIDTH_SLOPE = 0.20435849056603773;
const SOURCE_ULTRAWIDE_ROW_TRAVEL_SLOPE = 0.29307692307692305;
const SOURCE_WIDE_DISTANCE_SLOPE =
  (SOURCE_WIDE_HORIZONTAL_DISTANCE - M2_HORIZONTAL_DISTANCE) / (SOURCE_WIDE_REFERENCE_WIDTH - SOURCE_WIDE_BASE_WIDTH);

export function getSourceM2Start(): number {
  return 3145 + window.innerHeight * 0.19;
}

export function getSourceProjectStart(): number {
  const wideViewportDelay = Math.max(window.innerWidth - SOURCE_DESKTOP_BASE_WIDTH, 0) * SOURCE_PROJECT_WIDE_DELAY_RATIO;
  return getSourceM2Start() + window.innerHeight + wideViewportDelay;
}

function getSourceRs1Width(width: number): number {
  const baseWidth = width * 0.65 + 876.69;
  const wideWidth =
    width * (0.65 + SOURCE_WIDE_RS1_WIDTH_SLOPE) - SOURCE_WIDE_BASE_WIDTH * SOURCE_WIDE_RS1_WIDTH_SLOPE + 876.69;
  return Math.max(baseWidth, wideWidth);
}

export function getSourceM2RowTravel(width = window.innerWidth): number {
  const rs1Width = getSourceRs1Width(width);
  const rs2Width = Math.max(width * 1.05, width * 0.45 + 861.13);
  const rs3Width = Math.max(width * 0.8, width * 0.25 + 871.13) + width * 0.1;

  return rs1Width + rs2Width + rs3Width + width * 0.05 + width + 100;
}

export function getSourceM2HorizontalDistance(width = window.innerWidth): number {
  return M2_HORIZONTAL_DISTANCE + Math.max(width - SOURCE_WIDE_BASE_WIDTH, 0) * SOURCE_WIDE_DISTANCE_SLOPE;
}

export function getSourceM2PinnedTravel(width = window.innerWidth): number {
  return getSourceM2RowTravel(width) + Math.max(width - SOURCE_WIDE_REFERENCE_WIDTH, 0) * SOURCE_ULTRAWIDE_ROW_TRAVEL_SLOPE;
}

export function getSourceM2HorizontalRatio(): number {
  const rowTravel = getSourceM2RowTravel();
  if (window.innerWidth > SOURCE_DESKTOP_BASE_WIDTH) {
    return rowTravel / getSourceM2HorizontalDistance();
  }

  return (
    M2_HORIZONTAL_RATIO *
    (rowTravel / SOURCE_DESKTOP_ROW_TRAVEL) *
    ((SOURCE_DESKTOP_ROW_TRAVEL + SOURCE_HORIZONTAL_END_PADDING) / (rowTravel + SOURCE_HORIZONTAL_END_PADDING))
  );
}
