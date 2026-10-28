// Una escritura por altura del círculo; las enarmonías se explican en la guía.
export const HARMONY_KEYS = [
  {
    tonic: "C",
    notes: ["C", "D", "E", "F", "G", "A", "B"],
    signature: "Sin alteraciones",
  },
  {
    tonic: "G",
    notes: ["G", "A", "B", "C", "D", "E", "F♯"],
    signature: "1 sostenido: Fa♯",
  },
  {
    tonic: "D",
    notes: ["D", "E", "F♯", "G", "A", "B", "C♯"],
    signature: "2 sostenidos: Fa♯, Do♯",
  },
  {
    tonic: "A",
    notes: ["A", "B", "C♯", "D", "E", "F♯", "G♯"],
    signature: "3 sostenidos: Fa♯, Do♯, Sol♯",
  },
  {
    tonic: "E",
    notes: ["E", "F♯", "G♯", "A", "B", "C♯", "D♯"],
    signature: "4 sostenidos: Fa♯, Do♯, Sol♯, Re♯",
  },
  {
    tonic: "B",
    notes: ["B", "C♯", "D♯", "E", "F♯", "G♯", "A♯"],
    signature: "5 sostenidos: Fa♯, Do♯, Sol♯, Re♯, La♯",
  },
  {
    tonic: "F♯",
    notes: ["F♯", "G♯", "A♯", "B", "C♯", "D♯", "E♯"],
    signature: "6 sostenidos: Fa♯, Do♯, Sol♯, Re♯, La♯, Mi♯",
  },
  {
    tonic: "D♭",
    notes: ["D♭", "E♭", "F", "G♭", "A♭", "B♭", "C"],
    signature: "5 bemoles: Si♭, Mi♭, La♭, Re♭, Sol♭",
  },
  {
    tonic: "A♭",
    notes: ["A♭", "B♭", "C", "D♭", "E♭", "F", "G"],
    signature: "4 bemoles: Si♭, Mi♭, La♭, Re♭",
  },
  {
    tonic: "E♭",
    notes: ["E♭", "F", "G", "A♭", "B♭", "C", "D"],
    signature: "3 bemoles: Si♭, Mi♭, La♭",
  },
  {
    tonic: "B♭",
    notes: ["B♭", "C", "D", "E♭", "F", "G", "A"],
    signature: "2 bemoles: Si♭, Mi♭",
  },
  {
    tonic: "F",
    notes: ["F", "G", "A", "B♭", "C", "D", "E"],
    signature: "1 bemol: Si♭",
  },
];

const SPANISH = {
  C: "Do",
  D: "Re",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};
export function spanishNote(note) {
  return `${SPANISH[note[0]] ?? note[0]}${note.slice(1)}`;
}

export function buildHarmonyGuide(tonic) {
  const key = HARMONY_KEYS.find((item) => item.tonic === tonic);
  if (!key) throw new Error(`Tonalidad no disponible: ${tonic}`);
  const degrees = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  const triads = ["", "m", "m", "", "", "m", "°"];
  const sevenths = ["maj7", "m7", "m7", "maj7", "7", "m7", "m7♭5"];
  const chords = key.notes.map((root, index) => ({
    degree: degrees[index],
    root,
    triadName: root + triads[index],
    seventhName: root + sevenths[index],
    triad: [0, 2, 4].map((step) => key.notes[(index + step) % 7]),
    seventh: [0, 2, 4, 6].map((step) => key.notes[(index + step) % 7]),
  }));
  const minor = [5, 6, 0, 1, 2, 3, 4].map((i) => key.notes[i]);
  return {
    ...key,
    chords,
    minor,
    turnaround: [chords[0], chords[5], chords[1], chords[4]],
  };
}

// Parejas diatónicas ascendentes: desde cada grado hasta dos notas después.
export function buildDiatonicThirds(tonic) {
  const { notes } = buildHarmonyGuide(tonic);
  const naturalPitches = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const pitch = (note) => {
    const accidental = note.slice(1);
    const shift = accidental === "♯" ? 1 : accidental === "♭" ? -1 : 0;
    return (naturalPitches[note[0]] + shift + 12) % 12;
  };
  return notes.map((start, index) => {
    const skipped = notes[(index + 1) % 7];
    const end = notes[(index + 2) % 7];
    const semitones = (pitch(end) - pitch(start) + 12) % 12;
    return {
      degree: index + 1,
      start,
      skipped,
      end,
      semitones,
      quality: semitones === 4 ? "mayor" : "menor",
      wrapsScale: index + 2 >= notes.length,
    };
  });
}
