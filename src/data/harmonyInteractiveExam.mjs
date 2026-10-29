export const EXAM_TOPICS = [
  ["todos", "Todos los temas"],
  ["escalas", "Escalas y relativas"],
  ["circulo", "Círculo y terceras"],
  ["triadas", "Tríadas"],
  ["septimas", "Cuatríadas y séptimas"],
  ["inversiones", "Inversiones"],
  ["armonizacion", "Armonización"],
  ["progresiones", "Turn Around"],
];

const scaleLabels = Array.from({ length: 7 }, (_, i) => `Grado ${i + 1}`);
const chordLabels = ["Fundamental", "Tercera", "Quinta", "Séptima"];
const notes = (id, topic, prompt, answers, labels, steps, hint = "") => ({
  id,
  topic,
  prompt,
  kind: "notes",
  answers,
  labels,
  steps,
  hint,
});

export const EXAM_QUESTIONS = [
  notes(
    "g-major",
    "escalas",
    "Escribe las siete notas de Sol mayor, en orden y sin repetir la octava.",
    ["G", "A", "B", "C", "D", "E", "F♯"],
    scaleLabels,
    [
      "La escala mayor sigue tono – tono – semitono – tono – tono – tono – semitono.",
      "Desde Sol escribe las letras consecutivas: Sol – La – Si – Do – Re – Mi – Fa.",
      "La armadura de Sol mayor tiene Fa♯. Así Mi–Fa♯ es tono y Fa♯–Sol es semitono.",
      "Resultado: Sol – La – Si – Do – Re – Mi – Fa♯.",
    ],
  ),
  notes(
    "d-minor",
    "escalas",
    "Escribe las siete notas de Re menor natural, en orden y sin repetir la octava.",
    ["D", "E", "F", "G", "A", "B♭", "C"],
    scaleLabels,
    [
      "La menor natural sigue tono – semitono – tono – tono – semitono – tono – tono.",
      "Desde Re: Re–Mi es tono, Mi–Fa semitono, Fa–Sol y Sol–La son tonos.",
      "La siguiente distancia es semitono: La–Si♭. Después Si♭–Do y Do–Re son tonos.",
      "Resultado: Re – Mi – Fa – Sol – La – Si♭ – Do. Su relativa mayor es Fa mayor.",
    ],
  ),
  notes(
    "g-relative",
    "escalas",
    "¿Qué nota es la tónica de la relativa menor natural de Sol mayor?",
    ["E"],
    ["Nota"],
    [
      "Sol mayor es Sol – La – Si – Do – Re – Mi – Fa♯.",
      "Cuenta desde Sol: Sol=1, La=2, Si=3, Do=4, Re=5 y Mi=6.",
      "La menor relativa empieza en el sexto grado: Mi menor. Ambas comparten Fa♯.",
      "Comprobación: desde Sol baja tres semitonos, Sol → Fa♯ → Fa → Mi.",
    ],
  ),
  notes(
    "cs-relative",
    "escalas",
    "¿Qué nota es la tónica de la relativa mayor de Do♯ menor natural?",
    ["E"],
    ["Nota"],
    [
      "La relativa mayor está en el tercer grado de la escala menor natural.",
      "Cuenta las letras desde Do♯: Do♯=1, Re♯=2 y Mi=3.",
      "La respuesta es Mi: Do♯ menor y Mi mayor comparten cuatro sostenidos.",
      "De Do♯ a Mi hay tres semitonos: Do♯ → Re → Re♯ → Mi.",
    ],
  ),
  notes(
    "circle-d",
    "circulo",
    "En el círculo de quintas, ¿qué tonalidad mayor sigue después de Re mayor en sentido horario?",
    ["A"],
    ["Tónica"],
    [
      "El círculo avanza por quintas justas en sentido horario.",
      "Cuenta desde Re incluyendo ambos extremos: Re – Mi – Fa – Sol – La.",
      "La es el quinto nombre y está a siete semitonos de Re: sigue La mayor.",
    ],
  ),
  notes(
    "third-b",
    "circulo",
    "En Do mayor, ¿qué nota forma una tercera ascendente desde Si?",
    ["D"],
    ["Nota"],
    [
      "Las notas de Do mayor son Do – Re – Mi – Fa – Sol – La – Si.",
      "Cuenta desde Si, incluyendo Si como 1: Si=1, Do=2 y Re=3.",
      "La pareja es Si–Re (B–D): se salta Do y se conserva la armadura sin alteraciones.",
      "Si–Re tiene tres semitonos; es una tercera menor.",
    ],
  ),
  notes(
    "bb-triad",
    "triadas",
    "Escribe la tríada de Si♭ mayor: fundamental, tercera y quinta.",
    ["B♭", "D", "F"],
    chordLabels.slice(0, 3),
    [
      "Si♭ mayor es Si♭ – Do – Re – Mi♭ – Fa – Sol – La.",
      "Una tríada usa 1 – 3 – 5. Cuenta desde Si♭: 1=Si♭, 3=Re y 5=Fa.",
      "Resultado: Si♭ – Re – Fa. Si♭–Re es tercera mayor y Si♭–Fa es quinta justa.",
    ],
  ),
  notes(
    "c-minor-triad",
    "triadas",
    "Escribe la tríada de Do menor: fundamental, tercera y quinta.",
    ["C", "E♭", "G"],
    chordLabels.slice(0, 3),
    [
      "La tríada menor usa 1 – ♭3 – 5, comparada con la escala mayor de la misma fundamental.",
      "Do mayor tiene Do=1, Mi=3 y Sol=5. Baja Mi un semitono a Mi♭.",
      "Resultado: Do – Mi♭ – Sol. No cambies Sol: la quinta sigue siendo justa.",
    ],
  ),
  notes(
    "g-dim-triad",
    "triadas",
    "Escribe la tríada disminuida de Sol, sin séptima.",
    ["G", "B♭", "D♭"],
    chordLabels.slice(0, 3),
    [
      "Una tríada disminuida usa 1 – ♭3 – ♭5.",
      "En Sol mayor, 1=Sol, 3=Si y 5=Re. Baja Si a Si♭ y Re a Re♭.",
      "Resultado: Sol – Si♭ – Re♭. Son tres notas; una séptima produciría una cuatríada.",
    ],
  ),
  notes(
    "c-maj7",
    "septimas",
    "Construye Cmaj7: escribe fundamental, tercera, quinta y séptima.",
    ["C", "E", "G", "B"],
    chordLabels,
    [
      "C es Do; maj7 indica una tríada mayor más una séptima mayor.",
      "En Do mayor, toma 1 – 3 – 5 – 7: Do – Mi – Sol – Si.",
      "La séptima Si está a un semitono de la octava Do. No se baja a Si♭.",
    ],
  ),
  notes(
    "c7",
    "septimas",
    "Construye C7: escribe fundamental, tercera, quinta y séptima.",
    ["C", "E", "G", "B♭"],
    chordLabels,
    [
      "C7 usa 1 – 3 – 5 – ♭7: tríada mayor y séptima menor.",
      "Toma Do – Mi – Sol – Si de Do mayor y baja la séptima Si un semitono a Si♭.",
      "Resultado: Do – Mi – Sol – Si♭. Si natural produciría Cmaj7.",
    ],
  ),
  notes(
    "dm7",
    "septimas",
    "Construye Dm7: escribe fundamental, tercera, quinta y séptima.",
    ["D", "F", "A", "C"],
    chordLabels,
    [
      "Dm7 significa Re menor con séptima menor: 1 – ♭3 – 5 – ♭7.",
      "En Re mayor, 1, 3, 5 y 7 son Re, Fa♯, La y Do♯.",
      "Baja la tercera Fa♯ a Fa y la séptima Do♯ a Do.",
      "Resultado: Re – Fa – La – Do.",
    ],
  ),
  notes(
    "b-half-dim",
    "septimas",
    "Construye Bm7♭5 (Bø7): escribe sus cuatro notas.",
    ["B", "D", "F", "A"],
    chordLabels,
    [
      "Bm7♭5 es semidisminuido: 1 – ♭3 – ♭5 – ♭7.",
      "Desde Si, la tríada disminuida es Si – Re – Fa; la séptima menor es La.",
      "Resultado: Si – Re – Fa – La. Si fuera disminuido completo, la séptima sería La♭.",
    ],
  ),
  notes(
    "b-dim7",
    "septimas",
    "Construye Bdim7 (B°7): escribe sus cuatro notas.",
    ["B", "D", "F", "A♭"],
    chordLabels,
    [
      "Bdim7 usa 1 – ♭3 – ♭5 – ♭♭7: tríada y séptima disminuidas.",
      "Desde Si, la tríada disminuida es Si – Re – Fa. Su séptima menor es La.",
      "Baja La un semitono más a La♭. Resultado: Si – Re – Fa – La♭.",
      "La♭ y Sol♯ pueden sonar igual, pero la séptima de Si se escribe con la letra La.",
    ],
  ),
  notes(
    "g-first-inv",
    "inversiones",
    "Escribe la primera inversión de Sol mayor de grave a agudo.",
    ["B", "D", "G"],
    ["Bajo", "Nota central", "Nota superior"],
    [
      "Sol mayor es Sol – Si – Re: fundamental, tercera y quinta.",
      "La primera inversión pone la tercera en el bajo. Sube Sol una octava: Si – Re – Sol.",
      "El acorde sigue siendo Sol mayor; se puede escribir G/B.",
    ],
  ),
  notes(
    "cmaj-third-inv",
    "inversiones",
    "Escribe la tercera inversión de Cmaj7 de grave a agudo.",
    ["B", "C", "E", "G"],
    ["Bajo", "Segunda nota", "Tercera nota", "Nota superior"],
    [
      "Cmaj7 en posición fundamental es Do – Mi – Sol – Si.",
      "En una cuatríada, la tercera inversión coloca la séptima en el bajo.",
      "Sube sucesivamente Do, Mi y Sol una octava: Si – Do – Mi – Sol.",
      "Siguen las mismas cuatro notas; Si es el bajo y Do continúa siendo la fundamental.",
    ],
  ),
  notes(
    "f-major-iv",
    "armonizacion",
    "En Do mayor, escribe las cuatro notas del acorde sobre el IV grado.",
    ["F", "A", "C", "E"],
    chordLabels,
    [
      "Do mayor es Do – Re – Mi – Fa – Sol – La – Si. El IV grado es Fa.",
      "Desde Fa toma una nota sí y una no: Fa, salta Sol, La, salta Si, Do, salta Re, Mi.",
      "Resultado: Fa – La – Do – Mi = Fmaj7. Conserva las notas de Do mayor.",
    ],
  ),
  notes(
    "d-turnaround",
    "progresiones",
    "En Re mayor, escribe las cuatro fundamentales del Turn Around I – vi – ii – V.",
    ["D", "B", "E", "A"],
    ["I · nota base", "vi · nota base", "ii · nota base", "V · nota base"],
    [
      "Re mayor es Re – Mi – Fa♯ – Sol – La – Si – Do♯.",
      "Numera la escala: Re=1, Mi=2, Fa♯=3, Sol=4, La=5, Si=6 y Do♯=7.",
      "El orden I – vi – ii – V pide los grados 1 – 6 – 2 – 5: Re – Si – Mi – La.",
      "Cada nota es la fundamental de un acorde. A cuatro voces: Dmaj7 – Bm7 – Em7 – A7.",
    ],
  ),
  {
    id: "identify-b-half",
    topic: "armonizacion",
    kind: "choice",
    prompt:
      "En Do mayor aparecen las notas Si – Re – Fa – La. ¿Qué acorde forman?",
    options: ["Bm7♭5 (Bø7)", "Bdim7 (B°7)", "Bm7", "Bmaj7"],
    correctOption: "Bm7♭5 (Bø7)",
    steps: [
      "La fundamental es Si. Re es tercera menor, Fa quinta disminuida y La séptima menor.",
      "La fórmula 1 – ♭3 – ♭5 – ♭7 corresponde al semidisminuido: Bm7♭5 o Bø7.",
      "Bdim7 tendría La♭ como séptima disminuida; no aparece aquí.",
    ],
  },
];

// Compare written notes, not merely enharmonic sounds: Mi♯ is not written Fa.
export function normalizeExamNote(value) {
  const raw = String(value).trim();
  if (/^[♭♯𝄫𝄪♮#]/u.test(raw)) return null;
  const compact = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/𝄫/g, "bb")
    .replace(/𝄪/g, "##")
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/♮/g, "")
    .replace(/doble\s*bemol/g, "bb")
    .replace(/doble\s*sostenido/g, "##")
    .replace(/bemol/g, "b")
    .replace(/sostenido/g, "#")
    .replace(/natural/g, "")
    .replace(/\s+/g, "");
  const match = compact.match(/^(do|re|mi|fa|sol|la|si|[a-g])([#b]{0,2})$/);
  if (!match) return null;
  const names = {
    do: "C",
    re: "D",
    mi: "E",
    fa: "F",
    sol: "G",
    la: "A",
    si: "B",
  };
  return (names[match[1]] || match[1].toUpperCase()) + match[2];
}

export function evaluateExamNotes(answers, expected) {
  return expected.map(
    (note, index) =>
      normalizeExamNote(answers[index] || "") !== null &&
      normalizeExamNote(answers[index]) === normalizeExamNote(note),
  );
}
