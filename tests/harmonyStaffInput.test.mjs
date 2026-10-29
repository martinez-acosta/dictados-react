import test from "node:test";
import assert from "node:assert/strict";
import {
  staffAnswers,
  staffNoteName,
  staffStepFromY,
} from "../src/data/harmonyStaffInput.mjs";
import { evaluateExamNotes } from "../src/data/harmonyInteractiveExam.mjs";

test("las líneas y espacios de clave de sol conservan nombre y octava", () => {
  assert.deepEqual(staffNoteName(-2), { note: "C", octave: 4 });
  assert.deepEqual(staffNoteName(0), { note: "E", octave: 4 });
  assert.deepEqual(staffNoteName(4, "♯"), { note: "B♯", octave: 4 });
  assert.deepEqual(staffNoteName(8), { note: "F", octave: 5 });
  assert.deepEqual(staffNoteName(10, "𝄫"), { note: "A𝄫", octave: 5 });
  assert.equal(staffStepFromY(200), 0);
  assert.equal(staffStepFromY(220), -2);
  assert.equal(staffStepFromY(120), 8);
  assert.equal(staffStepFromY(10), null);
});

test("el acorde se lee de grave a agudo, con alteraciones escritas correctamente", () => {
  const chord = [
    { step: 5, accidental: "♭" },
    { step: -2, accidental: "" },
    { step: 2, accidental: "" },
    { step: 0, accidental: "" },
  ];
  const answers = staffAnswers(chord);
  assert.deepEqual(answers, ["C", "E", "G", "C♭"]);
  assert.deepEqual(evaluateExamNotes(answers, ["C", "E", "G", "B♭"]), [
    true,
    true,
    true,
    false,
  ]);
  const correct = staffAnswers([
    { step: 4, accidental: "♭" },
    ...chord.slice(1),
  ]);
  assert.deepEqual(correct, ["C", "E", "G", "B♭"]);
  assert.ok(evaluateExamNotes(correct, ["C", "E", "G", "B♭"]).every(Boolean));
});
