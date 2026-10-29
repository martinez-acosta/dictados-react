// Clave de sol: la primera línea inferior es Mi4; cada paso es línea o espacio.
export const STAFF_BOTTOM_Y = 200;
export const STAFF_STEP_Y = 10;
export const STAFF_MIN_STEP = -6;
export const STAFF_MAX_STEP = 14;
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];

export function staffStepFromY(y) {
  const step = Math.round((STAFF_BOTTOM_Y - y) / STAFF_STEP_Y);
  return step < STAFF_MIN_STEP || step > STAFF_MAX_STEP ? null : step;
}

export function staffNoteName(step, accidental = "") {
  if (!Number.isInteger(step) || step < STAFF_MIN_STEP || step > STAFF_MAX_STEP)
    return null;
  if (!["", "♯", "♭", "𝄫"].includes(accidental)) return null;
  const absolute = 4 * 7 + 2 + step;
  return {
    note: LETTERS[absolute % 7] + accidental,
    octave: Math.floor(absolute / 7),
  };
}

export function staffAnswers(notes) {
  return [...notes]
    .sort((a, b) => a.step - b.step)
    .map(({ step, accidental }) => staffNoteName(step, accidental)?.note ?? "");
}
