export const M4_SCROLL_DISTANCE = 3400;

const M4_INITIAL_WHEEL_ROTATION = -80;
const M4_FIRST_WHEEL_DISTANCE = 972;
const M4_SECOND_WHEEL_DISTANCE = 1972;
const M4_ITEM_TILT_START_DISTANCE = 1472;
const M4_MID_WHEEL_ROTATION = 177.3;
const M4_FINAL_WHEEL_ROTATION = 270;
const M4_FINAL_ITEM_TILT = -17;
const M4_INITIAL_WHEEL_WIDTH = 2142;
const M4_MID_WHEEL_WIDTH = 1226;
const M4_FINAL_WHEEL_WIDTH = 2168;
const M4_MID_WHEEL_OFFSET_Y = -10;
const SOURCE_DESKTOP_WIDTH = 1440;
const SOURCE_WIDE_WIDTH = 1970;
const SOURCE_WIDE_WHEEL_SCALE = 1.234;
const M4_EARLY_WHEEL_ROTATION_KEYFRAMES = [
  { distance: 0, rotation: M4_INITIAL_WHEEL_ROTATION },
  { distance: 259, rotation: 0 },
  { distance: 679, rotation: 116 },
  { distance: M4_FIRST_WHEEL_DISTANCE, rotation: M4_MID_WHEEL_ROTATION },
] as const;
type M4WheelKeyframe = (typeof M4_EARLY_WHEEL_ROTATION_KEYFRAMES)[number];

function easeOutQuad(progress: number): number {
  return 1 - (1 - progress) * (1 - progress);
}

function easeOutPower(progress: number, power: number): number {
  return 1 - (1 - progress) ** power;
}

function getWideViewportProgress(viewportWidth: number): number {
  return Math.min(Math.max((viewportWidth - SOURCE_DESKTOP_WIDTH) / (SOURCE_WIDE_WIDTH - SOURCE_DESKTOP_WIDTH), 0), 1);
}

export function getM4WheelRotation(scrollY: number, m4Start: number, viewportWidth = SOURCE_DESKTOP_WIDTH): number {
  const distance = Math.max(scrollY - m4Start, 0);

  if (distance <= M4_FIRST_WHEEL_DISTANCE) {
    const linearProgress = distance / M4_FIRST_WHEEL_DISTANCE;
    const linearRotation = M4_INITIAL_WHEEL_ROTATION + (M4_MID_WHEEL_ROTATION - M4_INITIAL_WHEEL_ROTATION) * linearProgress;
    let previous: M4WheelKeyframe = M4_EARLY_WHEEL_ROTATION_KEYFRAMES[0];

    for (const next of M4_EARLY_WHEEL_ROTATION_KEYFRAMES.slice(1)) {
      if (distance <= next.distance) {
        const progress = (distance - previous.distance) / (next.distance - previous.distance);
        const keyedRotation = previous.rotation + (next.rotation - previous.rotation) * progress;
        const wideProgress = getWideViewportProgress(viewportWidth);
        return keyedRotation + (linearRotation - keyedRotation) * wideProgress;
      }

      previous = next;
    }

    return M4_MID_WHEEL_ROTATION;
  }

  if (distance <= M4_SECOND_WHEEL_DISTANCE) {
    const rawProgress = (distance - M4_FIRST_WHEEL_DISTANCE) / (M4_SECOND_WHEEL_DISTANCE - M4_FIRST_WHEEL_DISTANCE);
    const desktopProgress = easeOutQuad(rawProgress);
    const wideProgress = easeOutPower(rawProgress, 1.55);
    const progress = desktopProgress + (wideProgress - desktopProgress) * getWideViewportProgress(viewportWidth);
    return M4_MID_WHEEL_ROTATION + (M4_FINAL_WHEEL_ROTATION - M4_MID_WHEEL_ROTATION) * progress;
  }

  return M4_FINAL_WHEEL_ROTATION;
}

export function getM4ItemTilt(scrollY: number, m4Start: number): number {
  const distance = Math.max(scrollY - m4Start, 0);

  if (distance <= M4_ITEM_TILT_START_DISTANCE) {
    return 0;
  }

  const progress = Math.min((distance - M4_ITEM_TILT_START_DISTANCE) / (M4_SECOND_WHEEL_DISTANCE - M4_ITEM_TILT_START_DISTANCE), 1);
  return M4_FINAL_ITEM_TILT * progress;
}

function getWideWheelScale(viewportWidth: number): number {
  const progress = getWideViewportProgress(viewportWidth);
  return 1 + (SOURCE_WIDE_WHEEL_SCALE - 1) * progress;
}

export function getM4WheelWidth(scrollY: number, m4Start: number, viewportWidth: number): number {
  const distance = Math.max(scrollY - m4Start, 0);
  const scale = getWideWheelScale(viewportWidth);

  if (distance <= M4_FIRST_WHEEL_DISTANCE) {
    const progress = distance / M4_FIRST_WHEEL_DISTANCE;
    return (M4_INITIAL_WHEEL_WIDTH + (M4_MID_WHEEL_WIDTH - M4_INITIAL_WHEEL_WIDTH) * progress) * scale;
  }

  if (distance <= M4_SECOND_WHEEL_DISTANCE) {
    const progress = easeOutPower((distance - M4_FIRST_WHEEL_DISTANCE) / (M4_SECOND_WHEEL_DISTANCE - M4_FIRST_WHEEL_DISTANCE), 2.7);
    return (M4_MID_WHEEL_WIDTH + (M4_FINAL_WHEEL_WIDTH - M4_MID_WHEEL_WIDTH) * progress) * scale;
  }

  return M4_FINAL_WHEEL_WIDTH * scale;
}

export function getM4WheelOffsetY(scrollY: number, m4Start: number): number {
  const distance = Math.max(scrollY - m4Start, 0);

  if (distance <= M4_FIRST_WHEEL_DISTANCE) {
    const progress = distance / M4_FIRST_WHEEL_DISTANCE;
    return M4_MID_WHEEL_OFFSET_Y * progress;
  }

  if (distance <= M4_SECOND_WHEEL_DISTANCE) {
    const progress = (distance - M4_FIRST_WHEEL_DISTANCE) / (M4_SECOND_WHEEL_DISTANCE - M4_FIRST_WHEEL_DISTANCE);
    return -232 * progress * progress + 242 * progress + M4_MID_WHEEL_OFFSET_Y;
  }

  return 0;
}

export function getM4ItemOffsetY(scrollY: number, m4Start: number): number {
  const distance = Math.max(scrollY - m4Start, 0);

  if (distance <= M4_FIRST_WHEEL_DISTANCE || distance >= M4_SECOND_WHEEL_DISTANCE) {
    return 0;
  }

  const progress = (distance - M4_FIRST_WHEEL_DISTANCE) / (M4_SECOND_WHEEL_DISTANCE - M4_FIRST_WHEEL_DISTANCE);
  return 1048 * progress * (1 - progress);
}
