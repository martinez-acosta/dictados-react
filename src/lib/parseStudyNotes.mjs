// Parse the small, trusted Markdown subset used by the class notes.
// No HTML, scripts, images or remote links are interpreted.
export function parseStudyNotes(markdown) {
  const sections = [];
  let current;
  let inCode = false;
  for (const line of markdown.replace(/\r/g, "").split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    const title = !inCode && line.match(/^## (\d+\. .+)$/);
    if (title) {
      current = { title: title[1], lines: [] };
      sections.push(current);
    } else if (current) current.lines.push(line);
  }
  return sections.map(({ title, lines }) => ({
    title,
    blocks: parseBlocks(lines),
  }));
}

const listItem = /^\s*(?:[-*]|(\d+)\.)\s+(.+)$/;
const tableDivider = /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/;
const cells = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
const boundary = (line) =>
  !line.trim() || /^#{1,6} |^>|^```|^---\s*$/.test(line) || listItem.test(line);

function parseBlocks(lines) {
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^---\s*$/.test(line)) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```"))
        code.push(lines[i++]);
      i++;
      blocks.push({ type: "code", text: code.join("\n") });
    } else if (line.startsWith("|") && tableDivider.test(lines[i + 1] || "")) {
      const header = cells(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].startsWith("|"))
        rows.push(cells(lines[i++]));
      blocks.push({ type: "table", header, rows });
    } else if (/^#{1,6} /.test(line)) {
      blocks.push({ type: "heading", text: line.replace(/^#{1,6} /, "") });
      i++;
    } else if (line.startsWith(">")) {
      const text = [];
      while (i < lines.length && lines[i].startsWith(">"))
        text.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "quote", text: text.join("\n") });
    } else if (listItem.test(line)) {
      const first = line.match(listItem);
      const ordered = Boolean(first[1]);
      const items = [];
      while (i < lines.length) {
        const match = lines[i].match(listItem);
        if (!match || Boolean(match[1]) !== ordered) break;
        items.push(match[2]);
        i++;
      }
      blocks.push({
        type: "list",
        ordered,
        start: ordered ? Number(first[1]) : undefined,
        items,
      });
    } else {
      const text = [line.trim()];
      i++;
      while (
        i < lines.length &&
        !boundary(lines[i]) &&
        !(lines[i].startsWith("|") && tableDivider.test(lines[i + 1] || ""))
      )
        text.push(lines[i++].trim());
      blocks.push({ type: "paragraph", text: text.join("\n") });
    }
  }
  return blocks;
}
