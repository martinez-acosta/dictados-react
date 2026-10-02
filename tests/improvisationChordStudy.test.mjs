import test from "node:test";
import assert from "node:assert/strict";
import {
  STUDY_BARS,
  STUDY_CHORDS,
  CHORD_STUDY_LESSON,
  spanishPitch,
} from "../src/data/improvisationChordStudy.mjs";

function midi(pitch) {
  const match = pitch.match(/^([A-G])([♯♭]?)(\d)$/);
  assert.ok(match, pitch);
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[match[1]];
  return (
    12 * (Number(match[3]) + 1) +
    base +
    (match[2] === "♯" ? 1 : match[2] === "♭" ? -1 : 0)
  );
}

test("confirmed week, exact visible chord sequence and four positions per bar", () => {
  assert.equal(CHORD_STUDY_LESSON, "improvisacion-2026-09-28");
  assert.equal(STUDY_BARS.length, 9);
  assert.deepEqual(
    STUDY_BARS.map((bar) =>
      bar.segments.map((segment) => segment.chord).join("/"),
    ),
    ["C", "F7", "C", "C7", "F7", "F7", "C", "Em7/A7", "Dm7"],
  );
  for (const bar of STUDY_BARS)
    assert.equal(bar.segments.flatMap((segment) => segment.notes).length, 4);
  assert.deepEqual(
    STUDY_BARS[7].segments.map((segment) => segment.notes.length),
    [2, 2],
  );
});

test("every pitch belongs to its current chord, including altered notes", () => {
  for (const bar of STUDY_BARS)
    for (const segment of bar.segments) {
      const chord = STUDY_CHORDS.find((item) => item.symbol === segment.chord);
      assert.ok(chord);
      for (const note of segment.notes)
        assert.ok(
          chord.notes.includes(note.replace(/\d$/, "")),
          `${bar.number}: ${note} is not in ${chord.symbol}`,
        );
    }
  assert.deepEqual(STUDY_CHORDS.find((item) => item.symbol === "A7").notes, [
    "A",
    "C♯",
    "E",
    "G",
  ]);
  assert.deepEqual(STUDY_CHORDS.find((item) => item.symbol === "Em7").notes, [
    "E",
    "G",
    "B",
    "D",
  ]);
  assert.equal(spanishPitch("E♭4"), "Mi♭4");
});

test("each bar alternates direction and stays strictly monotonic, including the shared bar", () => {
  STUDY_BARS.forEach((bar, index) => {
    assert.equal(bar.direction, index % 2 === 0 ? "Subir" : "Bajar");
    const pitches = bar.segments.flatMap((segment) => segment.notes).map(midi);
    const direction = bar.direction === "Subir" ? 1 : -1;
    for (let i = 1; i < pitches.length; i++)
      assert.ok(
        (pitches[i] - pitches[i - 1]) * direction > 0,
        `bar ${bar.number}`,
      );
  });
});

test("the first note of each new chord is the nearest available in the required direction", () => {
  let previous;
  for (const bar of STUDY_BARS)
    for (const segment of bar.segments) {
      if (previous !== undefined) {
        const direction = bar.direction === "Subir" ? 1 : -1;
        const chord = STUDY_CHORDS.find(
          (item) => item.symbol === segment.chord,
        );
        const candidates = chord.notes
          .flatMap((name) =>
            [2, 3, 4, 5, 6].map((octave) => midi(`${name}${octave}`)),
          )
          .filter((pitch) => (pitch - previous) * direction > 0)
          .sort((a, b) => Math.abs(a - previous) - Math.abs(b - previous));
        assert.equal(
          midi(segment.notes[0]),
          candidates[0],
          `bar ${bar.number}, ${segment.chord}`,
        );
      }
      previous = midi(segment.notes.at(-1));
    }
});
