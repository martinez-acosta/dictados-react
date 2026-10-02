import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseStudyNotes } from "../src/lib/parseStudyNotes.mjs";

test("each lesson keeps all numbered topics and nonempty content", () => {
  const directory = new URL("../src/data/semester-lessons/", import.meta.url);
  for (const file of fs.readdirSync(directory)) {
    const source = fs.readFileSync(new URL(file, directory), "utf8");
    const sections = parseStudyNotes(source);
    assert.equal(
      sections.length,
      [...source.matchAll(/^## \d+\. /gm)].length,
      file,
    );
    assert.ok(sections.length >= 4, file);
    assert.ok(
      sections.every((section) => section.blocks.length > 0),
      file,
    );
  }
});

test("definitions, tables, numbered lists and conceptual rhythmic diagrams survive", () => {
  const source = fs.readFileSync(
    new URL(
      "../src/data/semester-lessons/solfeo-2026-09-14.md",
      import.meta.url,
    ),
    "utf8",
  );
  const sections = parseStudyNotes(source);
  assert.ok(
    sections
      .find(
        (section) =>
          section.title.includes("Contratiempo") ||
          section.title.includes("CONTRATIEMPO"),
      )
      .blocks.some((block) => block.type === "quote"),
  );
  assert.ok(
    sections
      .flatMap((section) => section.blocks)
      .some((block) => block.type === "table"),
  );
  assert.ok(
    sections
      .flatMap((section) => section.blocks)
      .some(
        (block) => block.type === "code" && block.text.includes("Subdivisión"),
      ),
  );
  assert.ok(
    sections
      .flatMap((section) => section.blocks)
      .some((block) => block.type === "list" && block.ordered),
  );
});

test("literal HTML remains text and code fences do not become headings", () => {
  const [section] = parseStudyNotes(
    "## 1. Tema\n<script>alert(1)</script>\n\n```text\n## 2. ejemplo\n```",
  );
  assert.equal(section.blocks[0].type, "paragraph");
  assert.equal(section.blocks[1].type, "code");
  assert.equal(section.blocks[1].text, "## 2. ejemplo");
});
