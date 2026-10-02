export const INVERSION_LESSON = "armonia-2026-09-28";
export const INVERSION_TASK_KEY =
  "semester-notes:2026-09-28:armonia:inversions";
export const POSITION_NAMES = [
  "Posición fundamental",
  "Primera inversión",
  "Segunda inversión",
  "Tercera inversión",
];

// Spellings follow the class circle: only F♯ at the seam, then flat keys.
export const MAJOR_SEVENTHS = [
  ["C", "Do", ["C", "E", "G", "B"]],
  ["G", "Sol", ["G", "B", "D", "F♯"]],
  ["D", "Re", ["D", "F♯", "A", "C♯"]],
  ["A", "La", ["A", "C♯", "E", "G♯"]],
  ["E", "Mi", ["E", "G♯", "B", "D♯"]],
  ["B", "Si", ["B", "D♯", "F♯", "A♯"]],
  ["F♯", "Fa♯", ["F♯", "A♯", "C♯", "E♯"]],
  ["D♭", "Re♭", ["D♭", "F", "A♭", "C"]],
  ["A♭", "La♭", ["A♭", "C", "E♭", "G"]],
  ["E♭", "Mi♭", ["E♭", "G", "B♭", "D"]],
  ["B♭", "Si♭", ["B♭", "D", "F", "A"]],
  ["F", "Fa", ["F", "A", "C", "E"]],
].map(([root, name, notes]) => ({ root, name, notes }));

export function spanishNote(note) {
  const names = {
    C: "Do",
    D: "Re",
    E: "Mi",
    F: "Fa",
    G: "Sol",
    A: "La",
    B: "Si",
  };
  return names[note[0]] + note.slice(1);
}

export function inversions(chord, triad = false) {
  const notes = triad ? chord.notes.slice(0, 3) : chord.notes;
  const letters = "CDEFGAB";
  let octave = ["G", "A", "B"].includes(notes[0][0]) ? 3 : 4;
  const voiced = notes.map((note, index) => {
    if (
      index &&
      letters.indexOf(note[0]) < letters.indexOf(notes[index - 1][0])
    )
      octave++;
    return { note, octave };
  });
  return notes.map((_, index) => {
    const pitches = [
      ...voiced.slice(index),
      ...voiced.slice(0, index).map((p) => ({ ...p, octave: p.octave + 1 })),
    ];
    return {
      name: POSITION_NAMES[index],
      bass: pitches[0].note,
      pitches,
      notes: pitches.map((p) => p.note),
      degrees: [
        ...(triad ? [1, 3, 5] : [1, 3, 5, 7]).slice(index),
        ...(triad ? [1, 3, 5] : [1, 3, 5, 7]).slice(0, index),
      ],
    };
  });
}
