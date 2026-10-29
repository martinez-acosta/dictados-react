import test from "node:test";
import assert from "node:assert/strict";
import {
  HARMONY_KEYS,
  buildHarmonyGuide,
  spanishNote,
} from "../src/data/harmonyExamGuide.mjs";
import { EXAM_QUESTIONS } from "../src/data/harmonyInteractiveExam.mjs";
import { generateRandomExam } from "../src/data/harmonyRandomExam.mjs";
import {
  explainExamQuestion,
  explainScale,
} from "../src/data/harmonyExamExplanations.mjs";

test("explica Do sostenido menor natural sin exigir conocer Mi mayor", () => {
  const key = buildHarmonyGuide("E");
  const text = explainScale(key.minor, "menor natural").join("\n");
  assert.match(
    text,
    /Desde Do♯ hasta Re natural hay 1 semitono; necesitamos 2.*Re♯/,
  );
  assert.match(
    text,
    /Desde Re♯ hasta Mi natural hay 1 semitono; necesitamos 1/,
  );
  assert.match(
    text,
    /Desde Mi hasta Fa natural hay 1 semitono; necesitamos 2.*Fa♯/,
  );
  assert.match(text, /4 notas alteradas: Do♯, Re♯, Fa♯, Sol♯/);
  const question = {
    id: "random-minor",
    explanationScale: ["E", "menor natural"],
    steps: [],
  };
  const full = explainExamQuestion(question).foundation.join("\n");
  assert.match(full, /El tercer grado es Mi/);
  assert.match(
    full,
    /La escala queda Mi – Fa♯ – Sol♯ – La – Si – Do♯ – Re♯. Tiene 4 notas alteradas: Fa♯, Sol♯, Do♯, Re♯/,
  );
});

test("todas las escalas y explicaciones mantienen su escritura y la distancia real", () => {
  const natural = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const alteration = { "": 0, "♯": 1, "♭": -1 };
  const pitch = (note) =>
    (natural[note[0]] + alteration[note.slice(1)] + 12) % 12;
  for (const key of HARMONY_KEYS.map((item) => buildHarmonyGuide(item.tonic))) {
    for (const [notes, kind, intervals] of [
      [key.notes, "mayor", [2, 2, 1, 2, 2, 2, 1]],
      [key.minor, "menor natural", [2, 1, 2, 2, 1, 2, 2]],
    ]) {
      const steps = explainScale(notes, kind);
      assert.equal(steps.length, 10);
      for (let i = 0; i < 7; i++)
        assert.equal(
          (pitch(notes[(i + 1) % 7]) - pitch(notes[i]) + 12) % 12,
          intervals[i],
        );
      for (const note of notes)
        assert.ok(steps.at(-1).includes(spanishNote(note)));
    }
  }
  for (const question of [...EXAM_QUESTIONS, ...generateRandomExam()]) {
    const explanation = explainExamQuestion(question);
    assert.ok(explanation.foundation.length > 0, question.id);
    assert.deepEqual(explanation.steps, question.steps);
  }
});
