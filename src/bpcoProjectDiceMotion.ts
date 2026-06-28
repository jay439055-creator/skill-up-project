type Matrix3d = readonly number[];

type CubeKeyframe = {
  readonly distance: number;
  readonly matrix: Matrix3d;
};

type CubeKeyframes = readonly [CubeKeyframe, ...CubeKeyframe[]];

const CUBE_KEYFRAMES = [
  {
    distance: 3968,
    matrix: [0.984023, 0, -0.178043, 0, 0, 1, 0, 0, 0.178043, 0, 0.984023, 0, 0, 0, -288, 1],
  },
  {
    distance: 4284,
    matrix: [0.777504, 0, -0.628878, 0, 0, 1, 0, 0, 0.628878, 0, 0.777504, 0, 0, 0, -288, 1],
  },
  {
    distance: 4384,
    matrix: [0.668427, 0, -0.743777, 0, 0, 1, 0, 0, 0.743777, 0, 0.668427, 0, 0, 0, -288, 1],
  },
  {
    distance: 4784,
    matrix: [0.0976697, 0, -0.995219, 0, 0, 1, 0, 0, 0.995219, 0, 0.0976697, 0, 0, 0, -288, 1],
  },
  {
    distance: 5384,
    matrix: [-0.753615, 0, -0.657316, 0, 0, 1, 0, 0, 0.657316, 0, -0.753615, 0, 0, 0, -288, 1],
  },
  {
    distance: 5784,
    matrix: [-0.996557, 0, -0.0829056, 0, 0, 1, 0, 0, 0.0829056, 0, -0.996557, 0, 0, 0, -288, 1],
  },
  {
    distance: 6284,
    matrix: [-0.758481, 0, 0.651695, 0, 0, 1, 0, 0, -0.651695, 0, -0.758481, 0, 0, 0, -288, 1],
  },
  {
    distance: 6784,
    matrix: [-0.0680936, 0, 0.997679, 0, 0, 1, 0, 0, -0.997679, 0, -0.0680936, 0, 0, 0, -288, 1],
  },
  {
    distance: 7034,
    matrix: [0.260676, 0, 0.965426, 0, 0, 1, 0, 0, -0.965426, 0, 0.260676, 0, 0, 0, -288, 1],
  },
  {
    distance: 7464,
    matrix: [0.846879, 0, 0.531786, 0, 0, 1, 0, 0, -0.531786, 0, 0.846879, 0, 0, 0, -288, 1],
  },
  {
    distance: 7784,
    matrix: [0.99858, 0, 0.0532667, 0, 0, 1, 0, 0, -0.0532667, 0, 0.99858, 0, 0, 0, -288, 1],
  },
  {
    distance: 8104,
    matrix: [1, 0, 0, 0, 0, 0.122244, 0.9925, 0, 0, -0.9925, 0.122244, 0, 0, 0, -288, 1],
  },
  {
    distance: 8784,
    matrix: [3.9999, 0, 0, 0, 0, 0.00698114, 3.99989, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
] as const satisfies CubeKeyframes;

const M4_DICE_EXIT_KEYFRAMES = [
  {
    distance: 0,
    matrix: [3.9999, 0, 0, 0, 0, 0.00698114, 3.99989, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
  {
    distance: 1400,
    matrix: [3.9999, 0, 0, 0, 0, 0.00698114, 3.99989, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
  {
    distance: 1872,
    matrix: [2.0742, 0, 0, 0, 0, 0.00362016, 2.0742, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
  {
    distance: 1990,
    matrix: [1.0159, 0, 0, 0, 0, 0.00177308, 1.0159, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
  {
    distance: 2090,
    matrix: [0.7952, 0, 0, 0, 0, 0.00138789, 0.795199, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
  {
    distance: 2290,
    matrix: [0.2633, 0, 0, 0, 0, 0.000459545, 0.2633, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
  {
    distance: 2690,
    matrix: [0.0019, 0, 0, 0, 0, 0.00000331612, 0.0019, 0, 0, -0.999998, 0.00174533, 0, 0, 0, -288, 1],
  },
] as const satisfies CubeKeyframes;

const SOURCE_DESKTOP_WIDTH = 1440;
const SOURCE_WIDE_WIDTH = 1970;
const SOURCE_WIDE_TIMELINE_DURATION = 23.5;
const SOURCE_DICE_ROTATE_Y_START = 12;
const SOURCE_DICE_ROTATE_Y_DURATION = 10;
const SOURCE_DICE_ROTATE_X_START = 22;
const SOURCE_DICE_SCALE_OUT_START = 23;
const SOURCE_DICE_SCALE_OUT_DURATION = 0.5;
const SOURCE_DICE_ROTATE_X_RADIANS = (89.9 * Math.PI) / 180;
const TAU = Math.PI * 2;

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;
const easeOut = (progress: number): number => 1 - (1 - progress) * (1 - progress);

const matrixToCss = (matrix: Matrix3d, depth: number): string =>
  `matrix3d(${matrix.map((value, index) => Number((index === 14 ? -depth : value).toFixed(6))).join(", ")})`;

const mixMatrix = (from: Matrix3d, to: Matrix3d, progress: number): Matrix3d =>
  from.map((value, index) => lerp(value, to[index] ?? value, progress));

function getMatrixAtDistance(projectDistance: number, keyframes: CubeKeyframes): Matrix3d {
  let previous: CubeKeyframe = keyframes[0];

  for (const next of keyframes.slice(1)) {
    if (projectDistance <= next.distance) {
      const progress = clamp01((projectDistance - previous.distance) / (next.distance - previous.distance));
      return mixMatrix(previous.matrix, next.matrix, progress);
    }

    previous = next;
  }

  return previous.matrix;
}

function getSourceWideTimelineMatrix(timelineDistance: number, timelineEnd: number): Matrix3d {
  const time = clamp01(timelineDistance / timelineEnd) * SOURCE_WIDE_TIMELINE_DURATION;

  if (time < SOURCE_DICE_ROTATE_Y_START) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -288, 1];
  }

  if (time < SOURCE_DICE_ROTATE_X_START) {
    const angle = (clamp01((time - SOURCE_DICE_ROTATE_Y_START) / SOURCE_DICE_ROTATE_Y_DURATION) * TAU) % TAU;
    const cosY = Math.cos(angle);
    const sinY = Math.sin(angle);
    return [cosY, 0, -sinY, 0, 0, 1, 0, 0, sinY, 0, cosY, 0, 0, 0, -288, 1];
  }

  const rotateXProgress = easeOut(clamp01(time - SOURCE_DICE_ROTATE_X_START));
  const scaleOutProgress = easeOut(clamp01((time - SOURCE_DICE_SCALE_OUT_START) / SOURCE_DICE_SCALE_OUT_DURATION));
  const cosX = Math.cos(SOURCE_DICE_ROTATE_X_RADIANS * rotateXProgress);
  const sinX = Math.sin(SOURCE_DICE_ROTATE_X_RADIANS * rotateXProgress);
  const scale = lerp(1, 4, scaleOutProgress);
  return [scale, 0, 0, 0, 0, scale * cosX, scale * sinX, 0, 0, -sinX, cosX, 0, 0, 0, -288, 1];
}

export function getSourceWideScaleOutProgress(timelineDistance: number, timelineEnd: number): number {
  const time = clamp01(timelineDistance / timelineEnd) * SOURCE_WIDE_TIMELINE_DURATION;
  return easeOut(clamp01((time - SOURCE_DICE_SCALE_OUT_START) / SOURCE_DICE_SCALE_OUT_DURATION));
}

export function getProjectDiceWrapperTransform(
  projectDistance: number,
  depth = 288,
  viewportWidth = SOURCE_DESKTOP_WIDTH,
  m4Distance = -1,
  sourceTimelineDistance?: number,
  sourceTimelineEnd?: number,
): string {
  if (m4Distance >= 0) {
    return matrixToCss(getMatrixAtDistance(m4Distance, M4_DICE_EXIT_KEYFRAMES), depth);
  }

  const standardMatrix = getMatrixAtDistance(projectDistance, CUBE_KEYFRAMES);
  const wideProgress = clamp01((viewportWidth - SOURCE_DESKTOP_WIDTH) / (SOURCE_WIDE_WIDTH - SOURCE_DESKTOP_WIDTH));

  if (wideProgress === 0) {
    return matrixToCss(standardMatrix, depth);
  }

  const wideMatrix =
    sourceTimelineDistance === undefined || sourceTimelineEnd === undefined
      ? standardMatrix
      : getSourceWideTimelineMatrix(sourceTimelineDistance, sourceTimelineEnd);
  return matrixToCss(mixMatrix(standardMatrix, wideMatrix, wideProgress), depth);
}
