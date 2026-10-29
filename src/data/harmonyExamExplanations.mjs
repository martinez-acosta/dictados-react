import {
  HARMONY_KEYS,
  buildHarmonyGuide,
  spanishNote,
} from "./harmonyExamGuide.mjs";

const naturalPitches = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const adjustments = { "": 0, "♯": 1, "♭": -1, "𝄫": -2, "𝄪": 2 };
const pitch = (note) =>
  (naturalPitches[note[0]] + (adjustments[note.slice(1)] ?? 0) + 12) % 12;
const distance = (from, to) => (pitch(to) - pitch(from) + 12) % 12;
const display = (notes) => notes.map(spanishNote).join(" – ");

// Explica la decisión de alterar cada nombre, no solo la armadura resultante.
function explainStep(from, to, semitones) {
  const natural = to[0];
  const naturalDistance = distance(from, natural);
  const accidental = to.slice(1);
  const change = {
    "": `no hace falta alterar ${spanishNote(natural)}`,
    "♯": `sube ${spanishNote(natural)} un semitono: escribe ${spanishNote(to)}`,
    "♭": `baja ${spanishNote(natural)} un semitono: escribe ${spanishNote(to)}`,
    "𝄫": `baja ${spanishNote(natural)} dos semitonos: escribe ${spanishNote(to)} (doble bemol)`,
    "𝄪": `sube ${spanishNote(natural)} dos semitonos: escribe ${spanishNote(to)} (doble sostenido)`,
  }[accidental];
  return `Desde ${spanishNote(from)} hasta ${spanishNote(natural)} natural hay ${naturalDistance} ${naturalDistance === 1 ? "semitono" : "semitonos"}; necesitamos ${semitones}. Por eso ${change}.`;
}

export function explainScale(notes, kind = "mayor") {
  const pattern =
    kind === "menor natural" ? [2, 1, 2, 2, 1, 2, 2] : [2, 2, 1, 2, 2, 2, 1];
  const steps = [
    "Un semitono es la distancia a la tecla inmediatamente vecina del piano, sea blanca o negra. Un tono equivale a dos semitonos. Entre Mi–Fa y Si–Do naturales hay un semitono; entre las demás notas naturales consecutivas hay un tono.",
    `Para construir ${spanishNote(notes[0])} ${kind}, empieza en ${spanishNote(notes[0])} y usa cada nombre una vez: Do, Re, Mi, Fa, Sol, La, Si, continuando en círculo.`,
    `La fórmula ${kind} es ${pattern.map((n) => (n === 2 ? "tono" : "semitono")).join(" – ")}. Cada distancia indica cuánto subir desde la nota anterior.`,
  ];
  for (let i = 1; i < notes.length; i++)
    steps.push(explainStep(notes[i - 1], notes[i], pattern[i - 1]));
  const altered = notes.filter((note) => note.slice(1));
  steps.push(
    `La escala queda ${display(notes)}. Tiene ${altered.length} ${altered.length === 1 ? "nota alterada" : "notas alteradas"}: ${altered.map(spanishNote).join(", ") || "ninguna"}. Para comprobar el cierre, de ${spanishNote(notes[6])} a ${spanishNote(notes[0])} de la octava siguiente hay ${pattern[6]} ${pattern[6] === 1 ? "semitono" : "semitonos"}.`,
  );
  return steps;
}

const originalScales = {
  "g-major": ["G", "mayor"],
  "d-minor": ["F", "menor natural"],
  "g-relative": ["G", "mayor"],
  "cs-relative": ["E", "menor natural"],
  "circle-d": ["D", "mayor"],
  "third-b": ["C", "mayor"],
  "bb-triad": ["B♭", "mayor"],
  "c-minor-triad": ["E♭", "mayor"],
  "g-dim-triad": ["A♭", "mayor"],
  "c-maj7": ["C", "mayor"],
  c7: ["F", "mayor"],
  dm7: ["C", "mayor"],
  "b-half-dim": ["C", "mayor"],
  "b-dim7": ["C", "mayor"],
  "g-first-inv": ["G", "mayor"],
  "cmaj-third-inv": ["C", "mayor"],
  "f-major-iv": ["C", "mayor"],
  "d-turnaround": ["D", "mayor"],
  "identify-b-half": ["C", "mayor"],
};

export function explainExamQuestion(question) {
  const scaleInfo = question.explanationScale ?? originalScales[question.id];
  let foundation = [];
  if (scaleInfo) {
    const [tonic, kind] = scaleInfo;
    if (HARMONY_KEYS.some((key) => key.tonic === tonic)) {
      const key = buildHarmonyGuide(tonic);
      foundation = explainScale(
        kind === "menor natural" ? key.minor : key.notes,
        kind,
      );
      if (kind === "menor natural") {
        foundation.push(
          `Para encontrar su relativa mayor, cuenta desde la tónica menor: ${key.minor
            .slice(0, 3)
            .map((note, i) => `${spanishNote(note)}=${i + 1}`)
            .join(
              ", ",
            )}. El tercer grado es ${spanishNote(key.tonic)}. Las dos escalas usan las mismas notas y alteraciones; ahora construyamos también ${spanishNote(key.tonic)} mayor para comprobarlo.`,
          ...explainScale(key.notes, "mayor"),
        );
      }
    }
  }
  if (question.id === "random-dim7" || question.id === "b-dim7") {
    const notes = question.answers;
    foundation = [
      "Un semitono es la distancia a la tecla inmediatamente vecina, blanca o negra. Una tercera menor equivale a tres semitonos; el acorde disminuido completo se construye encadenando tres terceras menores.",
      `Empieza en la fundamental ${spanishNote(notes[0])}. Para cada tercera, cuenta los nombres incluyendo el inicial y el destino; después comprueba los tres semitonos.`,
      ...notes.slice(1).map((note, i) => explainStep(notes[i], note, 3)),
      `De grave a agudo: ${display(notes)}. Un doble bemol baja la nota natural dos semitonos y conserva su nombre musical.`,
    ];
  }
  return { foundation, steps: question.steps };
}
