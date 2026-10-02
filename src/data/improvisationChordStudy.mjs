// This is a worked study solution, not a literal transcription of the staff.
// Keep task progress stable independently of future date corrections.
export const CHORD_STUDY_LESSON = "improvisacion-2026-09-28";
export const CHORD_STUDY_TASK_KEY =
  "semester-notes:improvisacion-arpegios-movimiento-contrario:tasks";

export const STUDY_CHORDS = [
  {
    symbol: "C",
    name: "Do mayor",
    formula: "1–3–5",
    notes: ["C", "E", "G"],
    spanish: "Do – Mi – Sol",
    explanation:
      "Tríada mayor. No tiene una séptima indicada; para cuatro notas puede repetirse un sonido en otra octava.",
  },
  {
    symbol: "F7",
    name: "Fa séptima",
    formula: "1–3–5–♭7",
    notes: ["F", "A", "C", "E♭"],
    spanish: "Fa – La – Do – Mi♭",
    explanation:
      "Tríada mayor más séptima menor. Mi natural correspondería a Fmaj7, no a F7.",
  },
  {
    symbol: "C7",
    name: "Do séptima",
    formula: "1–3–5–♭7",
    notes: ["C", "E", "G", "B♭"],
    spanish: "Do – Mi – Sol – Si♭",
    explanation:
      "Se conserva la tríada de Do y se agrega Si♭, su séptima menor.",
  },
  {
    symbol: "Em7",
    name: "Mi menor séptima",
    formula: "1–♭3–5–♭7",
    notes: ["E", "G", "B", "D"],
    spanish: "Mi – Sol – Si – Re",
    explanation:
      "Sol es la tercera menor y Re natural es la séptima menor. No usar Re♭ ni Re♯.",
  },
  {
    symbol: "A7",
    name: "La séptima",
    formula: "1–3–5–♭7",
    notes: ["A", "C♯", "E", "G"],
    spanish: "La – Do♯ – Mi – Sol",
    explanation:
      "Do♯ es la tercera mayor y Sol natural la séptima menor. No arrastrar Sol♯ de La mayor.",
  },
  {
    symbol: "Dm7",
    name: "Re menor séptima",
    formula: "1–♭3–5–♭7",
    notes: ["D", "F", "A", "C"],
    spanish: "Re – Fa – La – Do",
    explanation: "Fa es la tercera menor y Do la séptima menor.",
  },
];

export const STUDY_BARS = [
  {
    number: 1,
    direction: "Subir",
    segments: [
      {
        chord: "C",
        notes: ["C4", "E4", "G4", "C5"],
        degrees: "1–3–5–1 (octava)",
      },
    ],
  },
  {
    number: 2,
    direction: "Bajar",
    segments: [
      { chord: "F7", notes: ["A4", "F4", "E♭4", "C4"], degrees: "3–1–♭7–5" },
    ],
  },
  {
    number: 3,
    direction: "Subir",
    segments: [
      { chord: "C", notes: ["E4", "G4", "C5", "E5"], degrees: "3–5–1–3" },
    ],
  },
  {
    number: 4,
    direction: "Bajar",
    segments: [
      { chord: "C7", notes: ["C5", "B♭4", "G4", "E4"], degrees: "1–♭7–5–3" },
    ],
  },
  {
    number: 5,
    direction: "Subir",
    segments: [
      { chord: "F7", notes: ["F4", "A4", "C5", "E♭5"], degrees: "1–3–5–♭7" },
    ],
  },
  {
    number: 6,
    direction: "Bajar",
    segments: [
      { chord: "F7", notes: ["C5", "A4", "F4", "E♭4"], degrees: "5–3–1–♭7" },
    ],
  },
  {
    number: 7,
    direction: "Subir",
    segments: [
      { chord: "C", notes: ["E4", "G4", "C5", "E5"], degrees: "3–5–1–3" },
    ],
  },
  {
    number: 8,
    direction: "Bajar",
    segments: [
      { chord: "Em7", notes: ["D5", "B4"], degrees: "♭7–5" },
      { chord: "A7", notes: ["A4", "G4"], degrees: "1–♭7" },
    ],
  },
  {
    number: 9,
    direction: "Subir",
    segments: [
      { chord: "Dm7", notes: ["A4", "C5", "D5", "F5"], degrees: "5–♭7–1–♭3" },
    ],
  },
];

export function spanishPitch(pitch) {
  const names = {
    C: "Do",
    D: "Re",
    E: "Mi",
    F: "Fa",
    G: "Sol",
    A: "La",
    B: "Si",
  };
  return `${names[pitch[0]]}${pitch.slice(1)}`;
}
