import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  METER_UNITS,
  FIGURE_COUNTS,
  SOLFEGE_PULSE_TASKS,
  beatsForFigure,
  barSeconds,
} from "../src/data/solfegePulseStudy.mjs";
test("simple-meter totals and figure counts preserve written durations", () => {
  for (const meter of METER_UNITS)
    assert.equal(meter.quarterNotes, (meter.numerator * 4) / meter.denominator);
  assert.deepEqual(
    FIGURE_COUNTS.map((f) => beatsForFigure(f.quarterNotes, 8)),
    [4, 2, 1, 0.5],
  );
  assert.deepEqual(
    FIGURE_COUNTS.map((f) => beatsForFigure(f.quarterNotes, 4)),
    [2, 1, 0.5, 0.25],
  );
  assert.equal(
    METER_UNITS.find((m) => m.meter === "4/8").quarterNotes,
    METER_UNITS.find((m) => m.meter === "2/4").quarterNotes,
  );
});
test("90 per eighth differs from 60 per quarter; equivalent quarter tempo is 45", () => {
  assert.equal(barSeconds(4, 90), 8 / 3);
  assert.equal(barSeconds(2, 60), 2);
  assert.equal(barSeconds(4, 90), barSeconds(2, 45));
  assert.ok(Math.abs(barSeconds(4, 90) / barSeconds(2, 60) - 4 / 3) < 1e-10);
});
test("new Solfege class is reachable with answers and correct final tasks", () => {
  const source = fs.readFileSync(
    new URL("../src/components/SemesterNotes.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /subjects: \["solfeo", "armonia", "improvisacion"\]/);
  assert.match(source, /<SolfegePulseWeek view=\{detailView\}/);
  assert.match(source, /subject !== "solfeo" \|\| week.id === "2026-09-28"/);
  assert.ok(
    SOLFEGE_PULSE_TASKS.find((t) => t.id === "fa-6-60").text.includes(
      "lección 6",
    ),
  );
  assert.ok(
    SOLFEGE_PULSE_TASKS.find((t) => t.id === "baqueiro-1-90").text.includes(
      "segunda parte",
    ),
  );
});
