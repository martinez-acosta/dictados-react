import test from "node:test";
import assert from "node:assert/strict";
import {
  HARMONY_KEYS,
  buildDiatonicThirds,
  buildHarmonyGuide,
} from "../src/data/harmonyExamGuide.mjs";

const naturals = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function pitch(note) {
  return (
    (naturals[note[0]] +
      (note.slice(1) === "♯" ? 1 : note.slice(1) === "♭" ? -1 : 0) +
      12) %
    12
  );
}
const distance = (a, b) => (pitch(b) - pitch(a) + 12) % 12;

test("las doce escalas del círculo conservan grados y distancias mayores", () => {
  assert.equal(HARMONY_KEYS.length, 12);
  for (const key of HARMONY_KEYS) {
    const complete = [...key.notes, key.tonic];
    assert.deepEqual(
      complete.slice(0, -1).map((n, i) => distance(n, complete[i + 1])),
      [2, 2, 1, 2, 2, 2, 1],
      key.tonic,
    );
    assert.equal(new Set(key.notes.map((n) => n[0])).size, 7, key.tonic);
    const minor = buildHarmonyGuide(key.tonic).minor;
    const fullMinor = [...minor, minor[0]];
    assert.deepEqual(
      fullMinor.slice(0, -1).map((n, i) => distance(n, fullMinor[i + 1])),
      [2, 1, 2, 2, 1, 2, 2],
      key.tonic,
    );
  }
});

test("las parejas avanzan por terceras de la escala sin perder alteraciones", () => {
  for (const key of HARMONY_KEYS) {
    const pairs = buildDiatonicThirds(key.tonic);
    assert.equal(pairs.length, 7);
    assert.deepEqual(
      pairs.map((pair) => pair.semitones),
      [4, 3, 3, 4, 4, 3, 3],
      key.tonic,
    );
    pairs.forEach((pair, index) => {
      assert.equal(pair.start, key.notes[index]);
      assert.equal(pair.skipped, key.notes[(index + 1) % 7]);
      assert.equal(pair.end, key.notes[(index + 2) % 7]);
      assert.equal(pair.semitones, distance(pair.start, pair.end));
      assert.equal(pair.wrapsScale, index >= 5);
    });
  }
  assert.deepEqual(
    buildDiatonicThirds("C").map(({ start, end }) => `${start}–${end}`),
    ["C–E", "D–F", "E–G", "F–A", "G–B", "A–C", "B–D"],
  );
  assert.equal(buildDiatonicThirds("G")[4].end, "F♯");
});

test("cada campo armónico y Turn Around mantiene las calidades correctas", () => {
  const expectedTriads = [
    [4, 7],
    [3, 7],
    [3, 7],
    [4, 7],
    [4, 7],
    [3, 7],
    [3, 6],
  ];
  const expectedSevenths = [11, 10, 10, 11, 10, 10, 10];
  for (const key of HARMONY_KEYS) {
    const data = buildHarmonyGuide(key.tonic);
    data.chords.forEach((chord, index) => {
      assert.deepEqual(
        chord.triad.slice(1).map((n) => distance(chord.root, n)),
        expectedTriads[index],
        `${key.tonic} ${chord.degree}`,
      );
      assert.equal(
        distance(chord.root, chord.seventh[3]),
        expectedSevenths[index],
        `${key.tonic} ${chord.degree}`,
      );
    });
    assert.deepEqual(
      data.turnaround.map((chord) => chord.root),
      [key.notes[0], key.notes[5], key.notes[1], key.notes[4]],
    );
  }
  assert.deepEqual(
    buildHarmonyGuide("D").turnaround.map((c) => c.seventhName),
    ["Dmaj7", "Bm7", "Em7", "A7"],
  );
  assert.deepEqual(buildHarmonyGuide("F♯").chords[0].seventh, [
    "F♯",
    "A♯",
    "C♯",
    "E♯",
  ]);
});
