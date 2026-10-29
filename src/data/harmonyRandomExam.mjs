import {
  HARMONY_KEYS,
  buildDiatonicThirds,
  buildHarmonyGuide,
  spanishNote,
} from "./harmonyExamGuide.mjs";

const scaleLabels = Array.from({ length: 7 }, (_, i) => `Grado ${i + 1}`);
const chordLabels = ["Fundamental", "Tercera", "Quinta", "Séptima"];
const display = (notes) => notes.map(spanishNote).join(" – ");
const noteQuestion = (id, topic, prompt, answers, labels, steps) => ({
  id,
  topic,
  prompt,
  kind: "notes",
  answers,
  labels,
  steps,
});
const dim7s = [
  ["G", "B♭", "D♭", "F♭"],
  ["A♭", "C♭", "E𝄫", "G𝄫"],
  ["E", "G", "B♭", "D♭"],
  ["C", "E♭", "G♭", "B𝄫"],
  ["B", "D", "F", "A♭"],
  ["D", "F", "A♭", "C♭"],
];

// La función aleatoria se puede inyectar para comprobar todos los casos en pruebas.
export function generateRandomExam(topic = "todos", random = Math.random) {
  const pick = (items) => items[Math.floor(random() * items.length)];
  const guide = () => buildHarmonyGuide(pick(HARMONY_KEYS).tonic);
  const scale = () => guide();
  const stepsForChord = (key, index, length, description) => {
    const chord = key.chords[index];
    const selected = length === 3 ? chord.triad : chord.seventh;
    const counting = Array.from(
      { length: length * 2 - 1 },
      (_, i) =>
        `${i % 2 ? "salta" : "toma"} ${spanishNote(key.notes[(index + i) % 7])}`,
    ).join(" → ");
    return [
      `Primero escribe ${spanishNote(key.tonic)} mayor: ${display(key.notes)}. Su armadura: ${key.signature}.`,
      `Busca ${spanishNote(chord.root)} y avanza por terceras: ${counting}. Al llegar al final de la escala, continúa desde el principio.`,
      `${description} Las notas resultantes son ${display(selected)}.`,
    ];
  };
  const major = scale();
  const minor = scale();
  const relative = scale();
  const relativeMajor = scale();
  // F♯ conduce a C♯, escrito como D♭ en el círculo simplificado de la guía.
  // Evitamos esa frontera para no rechazar una respuesta enarmónica válida.
  const circle = buildHarmonyGuide(
    pick(HARMONY_KEYS.filter((key) => key.tonic !== "F♯")).tonic,
  );
  const fifth = circle.notes[4];
  const thirdKey = scale();
  const third = pick(buildDiatonicThirds(thirdKey.tonic));
  const majorTriad = guide();
  const minorTriad = guide();
  const dimTriad = guide();
  const maj7 = guide();
  const dominant = guide();
  const minor7 = guide();
  const half = guide();
  const dim7 = pick(dim7s);
  const inversion = guide();
  const inversion7 = guide();
  const harmonization = guide();
  const degree = Math.floor(random() * 7);
  const turnaround = guide();
  const identify = guide();
  const halfChord = identify.chords[6];
  const option = `${halfChord.root}m7♭5 (${halfChord.root}ø7)`;
  const rotate = (items, count) => [
    ...items.slice(count),
    ...items.slice(0, count),
  ];
  const options = [
    option,
    `${halfChord.root}dim7 (${halfChord.root}°7)`,
    `${halfChord.root}m7`,
    `${halfChord.root}maj7`,
  ];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const questions = [
    noteQuestion(
      "random-major",
      "escalas",
      `Escribe las siete notas de ${spanishNote(major.tonic)} mayor, en orden y sin repetir la octava.`,
      major.notes,
      scaleLabels,
      [
        "Una escala mayor sigue tono – tono – semitono – tono – tono – tono – semitono.",
        `Empieza en ${spanishNote(major.tonic)} y escribe los siete nombres consecutivos, sin saltar letras.`,
        `Aplica la armadura de esta tonalidad: ${major.signature}.`,
        `Resultado: ${display(major.notes)}. Comprueba que los semitonos queden entre los grados 3–4 y 7–8.`,
      ],
    ),
    noteQuestion(
      "random-minor",
      "escalas",
      `Escribe las siete notas de ${spanishNote(minor.minor[0])} menor natural, en orden y sin repetir la octava.`,
      minor.minor,
      scaleLabels,
      [
        `Su relativa mayor es ${spanishNote(minor.tonic)} mayor: ${display(minor.notes)}. Ambas comparten armadura: ${minor.signature}.`,
        `Busca el sexto grado de esa escala, ${spanishNote(minor.minor[0])}, y empieza a contar desde ahí con las mismas notas.`,
        `Resultado: ${display(minor.minor)}. Las distancias de la menor natural son tono – semitono – tono – tono – semitono – tono – tono.`,
      ],
    ),
    noteQuestion(
      "random-relative",
      "escalas",
      `¿Qué nota es la tónica de la relativa menor natural de ${spanishNote(relative.tonic)} mayor?`,
      [relative.minor[0]],
      ["Nota"],
      [
        `Escribe la escala: ${display(relative.notes)}.`,
        `Cuenta desde la primera nota: ${relative.notes
          .slice(0, 6)
          .map((n, i) => `${spanishNote(n)}=${i + 1}`)
          .join(", ")}.`,
        `El sexto grado es ${spanishNote(relative.minor[0])}; esa es la tónica menor. Ambas escalas comparten armadura.`,
      ],
    ),
    noteQuestion(
      "random-relative-major",
      "escalas",
      `¿Qué nota es la tónica de la relativa mayor de ${spanishNote(relativeMajor.minor[0])} menor natural?`,
      [relativeMajor.tonic],
      ["Nota"],
      [
        `La escala menor natural es ${display(relativeMajor.minor)}.`,
        `Cuenta desde ${spanishNote(relativeMajor.minor[0])}: ${relativeMajor.minor
          .slice(0, 3)
          .map((n, i) => `${spanishNote(n)}=${i + 1}`)
          .join(", ")}.`,
        `El tercer grado es ${spanishNote(relativeMajor.tonic)}: esa es la tónica de la relativa mayor.`,
      ],
    ),
    noteQuestion(
      "random-circle",
      "circulo",
      `En el círculo de quintas, ¿qué tonalidad mayor sigue después de ${spanishNote(circle.tonic)} mayor en sentido horario?`,
      [fifth],
      ["Tónica"],
      [
        "En sentido horario se avanza una quinta justa; incluye la nota inicial al contar.",
        `Desde ${spanishNote(circle.tonic)}: ${circle.notes
          .slice(0, 5)
          .map((n, i) => `${spanishNote(n)}=${i + 1}`)
          .join(", ")}.`,
        `El quinto grado es ${spanishNote(fifth)}; sigue ${spanishNote(fifth)} mayor.`,
      ],
    ),
    noteQuestion(
      "random-third",
      "circulo",
      `En ${spanishNote(thirdKey.tonic)} mayor, ¿qué nota forma una tercera ascendente desde ${spanishNote(third.start)}?`,
      [third.end],
      ["Nota"],
      [
        `Conserva la armadura de ${spanishNote(thirdKey.tonic)} mayor: ${display(thirdKey.notes)}.`,
        `Cuenta ${spanishNote(third.start)}=1, ${spanishNote(third.skipped)}=2, ${spanishNote(third.end)}=3. Si se acaba la escala, continúa en la octava siguiente.`,
        `La pareja es ${spanishNote(third.start)}–${spanishNote(third.end)}: se salta ${spanishNote(third.skipped)}. Es una tercera ${third.quality} de ${third.semitones} semitonos.`,
      ],
    ),
    noteQuestion(
      "random-major-triad",
      "triadas",
      `Escribe la tríada de ${spanishNote(majorTriad.tonic)} mayor: fundamental, tercera y quinta.`,
      majorTriad.chords[0].triad,
      chordLabels.slice(0, 3),
      stepsForChord(
        majorTriad,
        0,
        3,
        "La tríada mayor tiene fórmula 1 – 3 – 5.",
      ),
    ),
    noteQuestion(
      "random-minor-triad",
      "triadas",
      `Escribe la tríada de ${spanishNote(minorTriad.chords[5].root)} menor: fundamental, tercera y quinta.`,
      minorTriad.chords[5].triad,
      chordLabels.slice(0, 3),
      stepsForChord(
        minorTriad,
        5,
        3,
        "El sexto grado de una escala mayor forma una tríada menor: 1 – ♭3 – 5 respecto de su propia fundamental.",
      ),
    ),
    noteQuestion(
      "random-dim-triad",
      "triadas",
      `Escribe la tríada disminuida de ${spanishNote(dimTriad.chords[6].root)}, sin séptima.`,
      dimTriad.chords[6].triad,
      chordLabels.slice(0, 3),
      stepsForChord(
        dimTriad,
        6,
        3,
        "El séptimo grado forma una tríada disminuida: 1 – ♭3 – ♭5. Tiene tres notas, no cuatro.",
      ),
    ),
    noteQuestion(
      "random-maj7",
      "septimas",
      `Construye ${maj7.chords[0].seventhName}: escribe fundamental, tercera, quinta y séptima.`,
      maj7.chords[0].seventh,
      chordLabels,
      stepsForChord(
        maj7,
        0,
        4,
        "maj7 significa tríada mayor más séptima mayor: 1 – 3 – 5 – 7.",
      ),
    ),
    noteQuestion(
      "random-dominant",
      "septimas",
      `Construye ${dominant.chords[4].seventhName}: escribe fundamental, tercera, quinta y séptima.`,
      dominant.chords[4].seventh,
      chordLabels,
      stepsForChord(
        dominant,
        4,
        4,
        "El acorde 7 de dominante tiene tríada mayor y séptima menor: 1 – 3 – 5 – ♭7.",
      ),
    ),
    noteQuestion(
      "random-minor7",
      "septimas",
      `Construye ${minor7.chords[1].seventhName}: escribe fundamental, tercera, quinta y séptima.`,
      minor7.chords[1].seventh,
      chordLabels,
      stepsForChord(
        minor7,
        1,
        4,
        "m7 tiene tríada menor y séptima menor: 1 – ♭3 – 5 – ♭7.",
      ),
    ),
    noteQuestion(
      "random-half",
      "septimas",
      `Construye ${half.chords[6].seventhName} (${half.chords[6].root}ø7): escribe sus cuatro notas.`,
      half.chords[6].seventh,
      chordLabels,
      stepsForChord(
        half,
        6,
        4,
        "El semidisminuido tiene tríada disminuida y séptima menor: 1 – ♭3 – ♭5 – ♭7.",
      ),
    ),
    noteQuestion(
      "random-dim7",
      "septimas",
      `Construye ${dim7[0]}dim7 (${dim7[0]}°7): escribe sus cuatro notas.`,
      dim7,
      chordLabels,
      [
        "Un disminuido completo usa 1 – ♭3 – ♭5 – ♭♭7: cada nota está a una tercera menor de la anterior.",
        `La tríada disminuida es ${display(dim7.slice(0, 3))}.`,
        `La séptima disminuida es ${spanishNote(dim7[3])}; conserva el nombre de la séptima aunque otra nota enarmónica suene igual.`,
        `Resultado: ${display(dim7)}. En el semidisminuido la séptima estaría un semitono más arriba.`,
      ],
    ),
    noteQuestion(
      "random-first-inversion",
      "inversiones",
      `Escribe la primera inversión de ${spanishNote(inversion.tonic)} mayor de grave a agudo.`,
      rotate(inversion.chords[0].triad, 1),
      ["Bajo", "Nota central", "Nota superior"],
      [
        `En posición fundamental: ${display(inversion.chords[0].triad)}. La primera nota es la fundamental.`,
        `Sube ${spanishNote(inversion.tonic)} una octava: la tercera, ${spanishNote(inversion.chords[0].triad[1])}, queda en el bajo.`,
        `Una disposición de grave a agudo es ${display(rotate(inversion.chords[0].triad, 1))}. También puedes escribir ${display([inversion.chords[0].triad[1], inversion.chords[0].triad[0], inversion.chords[0].triad[2]])}, situando cada nota más aguda que la anterior. En ambos casos la tercera permanece en el bajo.`,
      ],
    ),
    noteQuestion(
      "random-third-inversion",
      "inversiones",
      `Escribe la tercera inversión de ${inversion7.chords[0].seventhName} de grave a agudo.`,
      rotate(inversion7.chords[0].seventh, 3),
      ["Bajo", "Segunda nota", "Tercera nota", "Nota superior"],
      [
        `Posición fundamental: ${display(inversion7.chords[0].seventh)}.`,
        `Primera inversión: sube la fundamental una octava → ${display(rotate(inversion7.chords[0].seventh, 1))}.`,
        `Segunda inversión: sube la tercera una octava → ${display(rotate(inversion7.chords[0].seventh, 2))}.`,
        `Tercera inversión: sube la quinta una octava → ${display(rotate(inversion7.chords[0].seventh, 3))}. La séptima queda en el bajo.`,
        `Las tres notas superiores también pueden estar en otro orden, por ejemplo ${display([inversion7.chords[0].seventh[3], inversion7.chords[0].seventh[2], inversion7.chords[0].seventh[1], inversion7.chords[0].seventh[0]])}, siempre de grave a agudo y con la séptima en el bajo.`,
      ],
    ),
    noteQuestion(
      "random-harmonization",
      "armonizacion",
      `En ${spanishNote(harmonization.tonic)} mayor, escribe las cuatro notas del acorde sobre el grado ${harmonization.chords[degree].degree}.`,
      harmonization.chords[degree].seventh,
      chordLabels,
      stepsForChord(
        harmonization,
        degree,
        4,
        `El acorde del grado ${harmonization.chords[degree].degree} es ${harmonization.chords[degree].seventhName}.`,
      ),
    ),
    noteQuestion(
      "random-turnaround",
      "progresiones",
      `En ${spanishNote(turnaround.tonic)} mayor, escribe las fundamentales del Turn Around Imaj7 – vim7 – iim7 – V7, en ese orden.`,
      turnaround.turnaround.map((chord) => chord.root),
      ["I", "vi", "ii", "V"],
      [
        `Escribe y numera la escala: ${turnaround.notes.map((n, i) => `${i + 1}=${spanishNote(n)}`).join(", ")}.`,
        `Busca los grados 1, 6, 2 y 5, en ese orden: ${display(turnaround.turnaround.map((chord) => chord.root))}. Son las fundamentales, no las cuatro notas de cada acorde.`,
        `Construye la progresión usando la calidad indicada: ${turnaround.turnaround.map((chord) => chord.seventhName).join(" – ")}.`,
      ],
    ),
    {
      id: "random-identify-half",
      topic: "armonizacion",
      kind: "choice",
      prompt: `¿Qué acorde forman ${display(halfChord.seventh)}?`,
      options,
      correctOption: option,
      steps: [
        `La fundamental es ${spanishNote(halfChord.root)}. Las demás notas son su tercera, quinta y séptima.`,
        `Al apilar terceras dentro de ${spanishNote(identify.tonic)} mayor obtenemos ${display(halfChord.seventh)}.`,
        "La tríada es disminuida y la séptima es menor: la fórmula es 1 – ♭3 – ♭5 – ♭7.",
        `Por eso es ${option}, semidisminuido; el disminuido completo llevaría la séptima un semitono más baja.`,
      ],
    },
  ];
  // Conserva la escala de referencia de cada pregunta para enseñar cómo se
  // construye, incluso cuando la tonalidad es distinta en cada intento.
  const explanationScales = {
    "random-major": [major.tonic, "mayor"],
    "random-minor": [minor.tonic, "menor natural"],
    "random-relative": [relative.tonic, "mayor"],
    "random-relative-major": [relativeMajor.tonic, "menor natural"],
    "random-circle": [circle.tonic, "mayor"],
    "random-third": [thirdKey.tonic, "mayor"],
    "random-major-triad": [majorTriad.tonic, "mayor"],
    "random-minor-triad": [minorTriad.tonic, "mayor"],
    "random-dim-triad": [dimTriad.tonic, "mayor"],
    "random-maj7": [maj7.tonic, "mayor"],
    "random-dominant": [dominant.tonic, "mayor"],
    "random-minor7": [minor7.tonic, "mayor"],
    "random-half": [half.tonic, "mayor"],
    "random-first-inversion": [inversion.tonic, "mayor"],
    "random-third-inversion": [inversion7.tonic, "mayor"],
    "random-harmonization": [harmonization.tonic, "mayor"],
    "random-turnaround": [turnaround.tonic, "mayor"],
    "random-identify-half": [identify.tonic, "mayor"],
  };
  for (const question of questions) {
    if (explanationScales[question.id])
      question.explanationScale = explanationScales[question.id];
  }
  return questions.filter(
    (question) => topic === "todos" || question.topic === topic,
  );
}
