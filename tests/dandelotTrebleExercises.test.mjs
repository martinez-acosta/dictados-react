import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DANDELOT_SERIES_EXERCISE_18,
  DANDELOT_SERIES_EXERCISE_19,
} from "../src/data/dandelotTrebleExercises.mjs";

const expectedSystems = (systems) => systems.map((system) => system.split(" "));

test("Sol 18: los tres sistemas mantienen las notas y octavas de la imagen", () => {
  assert.deepEqual(
    DANDELOT_SERIES_EXERCISE_18.map((system) => system.flat()),
    expectedSystems([
      "c/5 e/5 f/5 a/5 g/5 e/5 c/5 a/4 g/4 b/4 d/5 f/5 e/5 c/5 a/4 f/4 d/4 b/3 g/4 e/4 d/4 f/4",
      "c/4 e/4 g/4 c/5 f/5 d/5 g/5 e/5 c/6 b/5 d/5 b/4 f/5 d/5 g/4 e/4 d/4 f/4 b/3 d/4 c/4 e/4",
      "c/5 a/4 g/4 b/4 g/5 e/5 b/4 d/5 b/5 g/5 a/4 c/5 f/5 d/5 e/4 g/4 a/5 f/5 d/4 f/4 e/5 c/5 c/4",
    ]),
  );
});

test("Sol 19: los tres sistemas mantienen las notas y octavas de la imagen", () => {
  assert.deepEqual(
    DANDELOT_SERIES_EXERCISE_19.map((system) => system.flat()),
    expectedSystems([
      "g/4 c/5 b/4 c/5 d/5 b/4 c/5 e/5 g/5 f/5 d/5 g/5 e/5 a/5 f/5 d/5 b/4 e/5 d/5 b/4 g/4 c/5 b/4 c/5",
      "d/5 g/5 e/5 c/5 c/6 b/5 d/6 a/5 g/5 e/5 a/5 f/5 d/5 e/5 f/5 d/5 b/4 g/4 c/5 g/4 d/4 a/3 b/3 e/4 a/4 d/5",
      "g/4 c/5 f/5 c/6 g/5 e/5 a/5 f/5 d/5 a/4 f/4 b/3 d/4 g/4 e/4 g/4 c/5 e/5 g/5 f/5 d/5 b/4 g/4 e/4 c/4",
    ]),
  );
});

for (const [number, exercise, counts, beats] of [
  [18, DANDELOT_SERIES_EXERCISE_18, [22, 22, 23], [11, 11, 12]],
  [19, DANDELOT_SERIES_EXERCISE_19, [24, 26, 25], [12, 13, 13]],
]) {
  test(`Sol ${number}: dos corcheas por pulso y una negra final`, () => {
    assert.deepEqual(
      exercise.map((system) => system.flat().length),
      counts,
    );
    assert.deepEqual(
      exercise.map((system) => system.length),
      beats,
    );
    const groups = exercise.flat();
    assert.deepEqual(groups.at(-1), ["c/4"]);
    assert.ok(groups.slice(0, -1).every((group) => group.length === 2));
    for (const key of groups.flat()) {
      assert.match(key, /^[a-g]\/[3-6]$/);
    }
  });
}

test("Sol 18 y 19 se añaden al selector sin reemplazar el 16 y el 17", () => {
  const source = readFileSync(
    new URL("../src/components/LecturaMusical.tsx", import.meta.url),
    "utf8",
  );
  for (const number of [16, 17, 18, 19]) {
    assert.match(
      source,
      new RegExp(
        `id: "${number}",[\\s\\S]*?clef: "treble",[\\s\\S]*?rows: DANDELOT_SERIES_EXERCISE_${number}`,
      ),
    );
  }
});
