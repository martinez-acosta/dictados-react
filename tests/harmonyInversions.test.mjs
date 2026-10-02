import test from "node:test";
import assert from "node:assert/strict";
import {
  MAJOR_SEVENTHS,
  inversions,
  spanishNote,
} from "../src/data/harmonyInversions.mjs";
const pitch = (note) =>
  (({ C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 })[note[0]] +
    (note.includes("♯") ? 1 : note.includes("♭") ? -1 : 0) +
    12) %
  12;
const midi = (p) => pitch(p.note) + 12 * (p.octave + 1);
test("all 12 correctly spelled major sevenths follow class circle", () => {
  assert.deepEqual(
    MAJOR_SEVENTHS.map((c) => c.root),
    ["C", "G", "D", "A", "E", "B", "F♯", "D♭", "A♭", "E♭", "B♭", "F"],
  );
  assert.equal(new Set(MAJOR_SEVENTHS.map((c) => pitch(c.root))).size, 12);
  for (const chord of MAJOR_SEVENTHS) {
    assert.deepEqual(
      chord.notes.map((n) => (pitch(n) - pitch(chord.root) + 12) % 12),
      [0, 4, 7, 11],
    );
    const letters = "CDEFGAB";
    const root = letters.indexOf(chord.root[0]);
    assert.deepEqual(
      chord.notes.map((n) => letters.indexOf(n[0])),
      [0, 2, 4, 6].map((i) => (root + i) % 7),
    );
  }
  assert.equal(MAJOR_SEVENTHS.find((c) => c.root === "F♯").notes[3], "E♯");
  assert.equal(spanishNote("E♯"), "Mi♯");
});
test("48 major-seventh voicings and 36 triads retain notes, bass and real ascending pitches", () => {
  for (const triad of [false, true]) {
    const count = triad ? 3 : 4;
    assert.equal(
      MAJOR_SEVENTHS.flatMap((c) => inversions(c, triad)).length,
      triad ? 36 : 48,
    );
    for (const chord of MAJOR_SEVENTHS) {
      const source = chord.notes.slice(0, count);
      const states = inversions(chord, triad);
      states.forEach((state, i) => {
        assert.equal(state.pitches.length, count);
        assert.equal(state.bass, source[i]);
        assert.deepEqual([...state.notes].sort(), [...source].sort());
        assert.equal(state.degrees[0], [1, 3, 5, 7][i]);
        for (let j = 1; j < count; j++)
          assert.ok(midi(state.pitches[j]) > midi(state.pitches[j - 1]));
        if (i) {
          const previous = states[i - 1].pitches;
          assert.deepEqual(state.pitches.slice(0, -1), previous.slice(1));
          assert.equal(midi(state.pitches.at(-1)) - midi(previous[0]), 12);
        }
      });
    }
  }
});
