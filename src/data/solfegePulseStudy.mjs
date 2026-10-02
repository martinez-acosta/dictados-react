export const SOLFEGE_PULSE_LESSON = "solfeo-2026-09-28";
export const SOLFEGE_PULSE_TASK_KEY = "semester-notes:2026-09-28:solfeo:tasks";
export const SOLFEGE_PULSE_TASKS = [
  {
    id: "sol-16-70",
    text: "Dandelot · clave de Sol, lección 16 a 70 BPM · lectura continua",
  },
  { id: "fa-6-60", text: "Dandelot · clave de Fa, lección 6 a 60 BPM" },
  {
    id: "baqueiro-1-90",
    text: "Baqueiro Foster · segunda parte, lección 1 · 4/8 a 90 BPM por corchea",
  },
  {
    id: "baqueiro-1-60",
    text: "La misma lección · lectura en 2/4 a 60 BPM por negra",
  },
  {
    id: "syncopation",
    text: "Revisar síncopas: 12–13, 15–16, 16–17 y compases 18, 19 y 20",
  },
  {
    id: "independence",
    text: "Leer sin ayuda del maestro; no detenerse en errores o relevos",
  },
];
export const METER_UNITS = [
  {
    meter: "4/4",
    numerator: 4,
    denominator: 4,
    unit: "Negra",
    total: "Redonda",
    quarterNotes: 4,
  },
  {
    meter: "3/4",
    numerator: 3,
    denominator: 4,
    unit: "Negra",
    total: "Blanca con puntillo",
    quarterNotes: 3,
  },
  {
    meter: "3/8",
    numerator: 3,
    denominator: 8,
    unit: "Corchea",
    total: "Negra con puntillo",
    quarterNotes: 1.5,
  },
  {
    meter: "4/2",
    numerator: 4,
    denominator: 2,
    unit: "Blanca",
    total: "Dos redondas ligadas (o una cuadrada)",
    quarterNotes: 8,
  },
  {
    meter: "4/8",
    numerator: 4,
    denominator: 8,
    unit: "Corchea",
    total: "Blanca",
    quarterNotes: 2,
  },
  {
    meter: "2/4",
    numerator: 2,
    denominator: 4,
    unit: "Negra",
    total: "Blanca",
    quarterNotes: 2,
  },
];
export const FIGURE_COUNTS = [
  { figure: "Blanca", quarterNotes: 2 },
  { figure: "Negra", quarterNotes: 1 },
  { figure: "Corchea", quarterNotes: 0.5 },
  { figure: "Semicorchea", quarterNotes: 0.25 },
];
export function beatsForFigure(quarterNotes, denominator) {
  return (quarterNotes * denominator) / 4;
}
export function barSeconds(beats, bpm) {
  return (beats * 60) / bpm;
}
