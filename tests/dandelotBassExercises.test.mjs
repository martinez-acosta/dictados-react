import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DANDELOT_BASS_EXERCISE_4,
  DANDELOT_BASS_EXERCISE_5,
  DANDELOT_BASS_EXERCISE_6,
} from "../src/data/dandelotBassExercises.mjs";

const pitches = (system) => system.flat();
const expected = (notes) => notes.split(" ");

test("Fa 4: primer sistema corregido sin modificar los otros dos", () => {
  assert.deepEqual(
    DANDELOT_BASS_EXERCISE_4.map(pitches),
    [
      "f/3 e/3 c/3 f/3 c/3 b/2 c/3 f/2 g/2 e/2 f/2 c/4 b/3 d/4 c/4 f/3 e/3 f/2 g/2 d/3 c/3",
      "e/3 f/3 b/3 c/4 c/3 d/3 g/3 f/3 b/2 c/3 e/2 f/2 g/2 f/2 b/2 d/3 c/3 c/4 b/3 g/3 f/3",
      "b/2 c/3 g/2 f/2 d/4 c/4 c/3 f/3 g/3 f/3 f/2 c/3 b/2 g/2 f/2 e/2 g/2 f/2 c/3 f/3 c/4 f/3",
    ].map(expected),
  );
});

test("Fa 5: dos sistemas de 22 notas con las octavas de la imagen", () => {
  assert.deepEqual(
    DANDELOT_BASS_EXERCISE_5.map(pitches),
    [
      "f/3 c/3 d/3 f/2 g/2 f/2 c/4 g/3 f/3 d/3 c/3 e/3 f/3 g/2 f/2 e/2 f/2 f/3 d/3 c/3 g/3 f/3",
      "d/4 c/4 b/3 d/4 c/4 g/3 e/3 f/3 g/3 f/3 g/2 f/2 e/2 g/2 f/2 c/3 d/3 b/2 c/3 g/3 e/3 f/3",
    ].map(expected),
  );
});

test("Fa 6: dos sistemas de 20 notas con las octavas de la imagen", () => {
  assert.deepEqual(
    DANDELOT_BASS_EXERCISE_6.map(pitches),
    [
      "c/4 g/3 d/3 c/3 f/3 b/2 c/3 g/2 d/3 g/3 c/3 f/3 b/3 c/4 d/4 g/3 e/3 f/3 g/2 c/3",
      "f/2 b/2 e/3 f/3 d/3 c/3 d/4 b/3 c/4 e/3 f/3 b/2 c/3 g/3 f/3 g/2 e/2 f/2 f/3 f/2",
    ].map(expected),
  );
});

test("Todos los ejercicios de Fa mantienen una negra por pulso", () => {
  for (const exercise of [
    DANDELOT_BASS_EXERCISE_4,
    DANDELOT_BASS_EXERCISE_5,
    DANDELOT_BASS_EXERCISE_6,
  ]) {
    for (const system of exercise) {
      for (const group of system) {
        assert.equal(group.length, 1);
        assert.match(group[0], /^[a-g]\/[2-4]$/);
      }
    }
  }
});

test("Fa 4, 5 y 6 están disponibles en el selector Dandelot", () => {
  const source = readFileSync(
    new URL("../src/components/LecturaMusical.tsx", import.meta.url),
    "utf8",
  );
  for (const number of [4, 5, 6]) {
    assert.match(
      source,
      new RegExp(
        `id: "fa-${number}",[\\s\\S]*?clef: "bass",[\\s\\S]*?rows: DANDELOT_BASS_EXERCISE_${number}`,
      ),
    );
  }
});
