export type RhythmDuration = "8" | "q" | "h" | "qr" | "hr";
export type RhythmFigure = {
  duration: RhythmDuration;
  tieToNext?: boolean;
};
export type RhythmReadingExercise = {
  id: number;
  beatsPerMeasure: 2 | 3;
  systems: readonly (readonly (readonly RhythmFigure[])[])[];
};

const figure = (duration: RhythmDuration, tieToNext = false): RhythmFigure => ({
  duration,
  ...(tieToNext ? { tieToNext: true } : {}),
});
const eighth = () => figure("8");
const quarter = (tie = false) => figure("q", tie);
const half = (tie = false) => figure("h", tie);
const rest = () => figure("qr");
const pair = () => [eighth(), eighth()];

export const RHYTHM_READING_EXERCISES: readonly RhythmReadingExercise[] = [
  {
    id: 25,
    beatsPerMeasure: 3,
    systems: [
      [
        [...pair(), ...pair(), quarter(true)],
        [...pair(), half()],
        [...pair(), rest(), quarter(true)],
        [...pair(), quarter(), quarter()],
      ],
      [
        [rest(), ...pair(), quarter(true)],
        [...pair(), quarter(), ...pair()],
        [...pair(), ...pair(), quarter(true)],
        [...pair(), ...pair(), quarter()],
      ],
      [
        [...pair(), rest(), quarter(true)],
        [...pair(), quarter(), rest()],
        [...pair(), quarter(), quarter(true)],
        [...pair(), rest(), quarter()],
      ],
      [
        [rest(), ...pair(), quarter(true)],
        [...pair(), ...pair(), ...pair()],
        [...pair(), ...pair(), quarter(true)],
        [...pair(), ...pair(), quarter()],
      ],
      [
        [rest(), ...pair(), quarter(true)],
        [...pair(), rest(), ...pair()],
        [...pair(), rest(), quarter(true)],
        [...pair(), figure("hr")],
      ],
    ],
  },
  {
    id: 26,
    beatsPerMeasure: 2,
    systems: [
      [
        [half(true)],
        [...pair(), quarter()],
        [quarter(), quarter(true)],
        [...pair(), ...pair()],
        [rest(), quarter(true)],
        [...pair(), rest()],
      ],
      [
        [...pair(), quarter(true)],
        [...pair(), quarter()],
        [quarter(), quarter(true)],
        [...pair(), rest()],
        [rest(), quarter(true)],
        [...pair(), ...pair()],
        [quarter(), eighth(), figure("8", true)],
      ],
      [
        [...pair(), rest()],
        [quarter(), quarter(true)],
        [...pair(), quarter()],
        [quarter(), eighth(), figure("8", true)],
        [...pair(), ...pair()],
        [half(true)],
        [...pair(), rest()],
      ],
    ],
  },
];

export function rhythmBeats(duration: RhythmDuration): number {
  return duration === "8" ? 0.5 : duration.startsWith("h") ? 2 : 1;
}

export type WrittenRhythmNote = RhythmFigure & {
  noteIndex: number;
  measureIndex: number;
  systemIndex: number;
  beatInMeasure: number;
  beats: number;
  rest: boolean;
  tiedFromPrevious: boolean;
  syllable: "ta" | "ka";
};

export function writtenRhythmNotes(
  exercise: RhythmReadingExercise,
): WrittenRhythmNote[] {
  const notes: WrittenRhythmNote[] = [];
  let measureIndex = 0;
  exercise.systems.forEach((system, systemIndex) => {
    system.forEach((measure) => {
      let beatInMeasure = 0;
      measure.forEach((note) => {
        const beats = rhythmBeats(note.duration);
        const isRest = note.duration.endsWith("r");
        notes.push({
          ...note,
          noteIndex: notes.length,
          measureIndex,
          systemIndex,
          beatInMeasure,
          beats,
          rest: isRest,
          tiedFromPrevious: Boolean(notes.at(-1)?.tieToNext),
          syllable: beatInMeasure % 1 === 0 ? "ta" : "ka",
        });
        beatInMeasure += beats;
      });
      measureIndex += 1;
    });
  });
  return notes;
}

export type RhythmPosition = WrittenRhythmNote & {
  startBeat: number;
  continuation: boolean;
};
export type RhythmAttack = {
  noteIndex: number;
  startBeat: number;
  beats: number;
  syllable: "ta" | "ka";
};
export type RhythmTimeline = {
  positions: RhythmPosition[];
  attacks: RhythmAttack[];
  totalBeats: number;
};

export function buildRhythmTimeline(
  exercise: RhythmReadingExercise,
  selectedSystems: readonly number[],
): RhythmTimeline {
  const positions: RhythmPosition[] = [];
  const attacks: RhythmAttack[] = [];
  let totalBeats = 0;
  writtenRhythmNotes(exercise)
    .filter((note) => selectedSystems.includes(note.systemIndex))
    .forEach((note) => {
      const previous = positions.at(-1);
      const continuation = Boolean(
        !note.rest &&
        previous &&
        previous.noteIndex + 1 === note.noteIndex &&
        previous.tieToNext &&
        !previous.rest,
      );
      positions.push({ ...note, startBeat: totalBeats, continuation });
      if (!note.rest) {
        if (continuation) {
          attacks[attacks.length - 1].beats += note.beats;
        } else {
          attacks.push({
            noteIndex: note.noteIndex,
            startBeat: totalBeats,
            beats: note.beats,
            syllable: note.syllable,
          });
        }
      }
      totalBeats += note.beats;
    });
  return { positions, attacks, totalBeats };
}
