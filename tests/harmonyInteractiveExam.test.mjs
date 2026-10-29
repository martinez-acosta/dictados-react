import test from "node:test";
import assert from "node:assert/strict";
import {
  EXAM_QUESTIONS,
  EXAM_TOPICS,
  normalizeExamNote,
  evaluateExamNotes,
  evaluateInversionNotes,
} from "../src/data/harmonyInteractiveExam.mjs";
import {
  buildHarmonyGuide,
  spanishNote,
} from "../src/data/harmonyExamGuide.mjs";

test("las preguntas originales del repaso son las cinco cuatríadas del pizarrón", () => {
  assert.deepEqual(
    EXAM_QUESTIONS.filter((question) => question.topic === "septimas").map(
      (question) => question.id,
    ),
    ["c-maj7", "c7", "dm7", "b-half-dim", "b-dim7"],
  );
});

test("las inversiones admiten cualquier orden de voces superiores sin cambiar el bajo", () => {
  const cFirst = ["E", "G", "C"];
  assert.deepEqual(evaluateInversionNotes(["Mi", "Do", "Sol"], cFirst), [
    true,
    true,
    true,
  ]);
  assert.deepEqual(evaluateInversionNotes(["E", "G", "C"], cFirst), [
    true,
    true,
    true,
  ]);
  assert.deepEqual(evaluateInversionNotes(["C", "E", "G"], cFirst), [
    false,
    false,
    true,
  ]);
  assert.deepEqual(evaluateInversionNotes(["E", "C", "C"], cFirst), [
    true,
    true,
    false,
  ]);
  assert.deepEqual(evaluateInversionNotes(["E", "C♯", "G"], cFirst), [
    true,
    false,
    true,
  ]);
  const cThird = ["B", "C", "E", "G"];
  assert.deepEqual(evaluateInversionNotes(["Si", "Sol", "Mi", "Do"], cThird), [
    true,
    true,
    true,
    true,
  ]);
  assert.deepEqual(evaluateInversionNotes(["B", "G", "E", "G"], cThird), [
    true,
    true,
    true,
    false,
  ]);
  assert.deepEqual(evaluateExamNotes(["E", "C", "G"], cFirst), [
    true,
    false,
    false,
  ]);
});

test("acepta cifrado y solfeo sin perder alteraciones ni confundir enarmonías", () => {
  for (const [input, expected] of [
    ["E", "E"],
    ["Mi", "E"],
    ["mi natural", "E"],
    ["Bb", "Bb"],
    ["Si♭", "Bb"],
    ["si bemol", "Bb"],
    ["Fa#", "F#"],
    ["F♯", "F#"],
    ["Fa sostenido", "F#"],
    ["Si𝄫", "Bbb"],
    ["Si doble bemol", "Bbb"],
    ["Bbb", "Bbb"],
    ["Mi♯", "E#"],
    ["E#", "E#"],
  ])
    assert.equal(normalizeExamNote(input), expected, input);
  assert.notEqual(normalizeExamNote("Mi♯"), normalizeExamNote("Fa"));
  assert.notEqual(normalizeExamNote("Si♭"), normalizeExamNote("La♯"));
  for (const invalid of ["", "𝄫", "xyz", "Do re", "H", "C###"]) {
    assert.equal(normalizeExamNote(invalid), null, invalid);
  }
});

test("califica cada campo en orden y detecta una nota vacía o alterada", () => {
  assert.deepEqual(
    evaluateExamNotes(["Do", "Mi", "Sol", "Si bemol"], ["C", "E", "G", "B♭"]),
    [true, true, true, true],
  );
  assert.deepEqual(
    evaluateExamNotes(["C", "E", "G", "B"], ["C", "E", "G", "B♭"]),
    [true, true, true, false],
  );
  assert.deepEqual(evaluateExamNotes(["C", "", "G"], ["C", "E", "G"]), [
    true,
    false,
    true,
  ]);
  assert.deepEqual(
    evaluateExamNotes(["Si", "Re", "Fa", "Sol#"], ["B", "D", "F", "A♭"]),
    [true, true, true, false],
  );
});

test("las preguntas cubren temas y conservan respuestas y explicaciones completas", () => {
  const ids = new Set();
  const topics = new Set(EXAM_TOPICS.map(([id]) => id));
  for (const question of EXAM_QUESTIONS) {
    assert.ok(!ids.has(question.id), question.id);
    ids.add(question.id);
    assert.ok(topics.has(question.topic), question.id);
    assert.ok(question.steps.length >= 3, question.id);
    if (question.kind === "notes") {
      assert.equal(
        question.answers.length,
        question.labels.length,
        question.id,
      );
      assert.ok(
        evaluateExamNotes(
          question.answers.map(spanishNote),
          question.answers,
        ).every(Boolean),
        question.id,
      );
    } else {
      assert.ok(question.options.includes(question.correctOption), question.id);
    }
  }
  assert.deepEqual(
    EXAM_QUESTIONS.find((q) => q.id === "g-major").answers,
    buildHarmonyGuide("G").notes,
  );
  assert.deepEqual(
    EXAM_QUESTIONS.find((q) => q.id === "d-turnaround").answers,
    buildHarmonyGuide("D").turnaround.map((chord) => chord.root),
  );
});
