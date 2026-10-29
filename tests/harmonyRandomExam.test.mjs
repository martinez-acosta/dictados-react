import test from "node:test";
import assert from "node:assert/strict";
import { generateRandomExam } from "../src/data/harmonyRandomExam.mjs";
import { evaluateExamNotes } from "../src/data/harmonyInteractiveExam.mjs";
import { spanishNote } from "../src/data/harmonyExamGuide.mjs";

const rng = (seed) => () =>
  (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const pitches = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function pitch(note) {
  const accidental = note.slice(1);
  return (
    (pitches[note[0]] + ({ "♯": 1, "♭": -1, "𝄫": -2 }[accidental] || 0) + 12) %
    12
  );
}
function intervals(notes) {
  return notes
    .slice(1)
    .map((note) => (pitch(note) - pitch(notes[0]) + 12) % 12);
}

test("los simulacros generan respuestas calificables, armónicamente correctas y con variedad", () => {
  const expectedIntervals = {
    "random-major-triad": [4, 7],
    "random-minor-triad": [3, 7],
    "random-dim-triad": [3, 6],
    "random-maj7": [4, 7, 11],
    "random-dominant": [4, 7, 10],
    "random-minor7": [3, 7, 10],
    "random-half": [3, 6, 10],
    "random-dim7": [3, 6, 9],
  };
  const seen = new Set();
  for (let seed = 1; seed <= 300; seed++) {
    const questions = generateRandomExam("todos", rng(seed));
    assert.equal(questions.length, 19);
    assert.equal(new Set(questions.map((item) => item.id)).size, 19);
    seen.add(questions[0].prompt);
    for (const question of questions) {
      assert.ok(question.steps.length >= 3, question.id);
      if (question.kind === "choice") {
        assert.ok(question.options.includes(question.correctOption));
        continue;
      }
      assert.equal(
        question.answers.length,
        question.labels.length,
        question.id,
      );
      assert.ok(
        evaluateExamNotes(question.answers, question.answers).every(Boolean),
      );
      assert.ok(
        evaluateExamNotes(
          question.answers.map(spanishNote),
          question.answers,
        ).every(Boolean),
      );
      if (expectedIntervals[question.id])
        assert.deepEqual(
          intervals(question.answers),
          expectedIntervals[question.id],
          question.id,
        );
      if (question.id === "random-major")
        assert.deepEqual(intervals(question.answers), [2, 4, 5, 7, 9, 11]);
      if (question.id === "random-minor")
        assert.deepEqual(intervals(question.answers), [2, 3, 5, 7, 8, 10]);
      if (question.id === "random-circle")
        assert.notEqual(question.prompt.includes("Fa♯ mayor"), true);
    }
  }
  assert.ok(seen.size > 1, "las tonalidades deben variar");
});

test("el filtro conserva solo preguntas del tema y la generación admite resultados reproducibles", () => {
  const all = generateRandomExam("todos", rng(123));
  const filtered = generateRandomExam("triadas", rng(123));
  assert.deepEqual(
    filtered,
    all.filter((question) => question.topic === "triadas"),
  );
  assert.deepEqual(generateRandomExam("todos", rng(123)), all);
  assert.notDeepEqual(generateRandomExam("todos", rng(124)), all);
});

test("la práctica de cuatríadas cubre únicamente los cinco tipos del repaso", () => {
  const expected = [
    "random-maj7",
    "random-dominant",
    "random-minor7",
    "random-half",
    "random-dim7",
  ];
  for (let seed = 1; seed <= 100; seed++) {
    const questions = generateRandomExam("septimas", rng(seed));
    assert.deepEqual(
      questions.map((question) => question.id),
      expected,
    );
    assert.ok(
      questions.every(
        (question) =>
          question.kind === "notes" && question.answers.length === 4,
      ),
    );
  }
});
