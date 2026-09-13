import React, { useEffect, useId, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  Annotation,
  BarlineType,
  Beam,
  Factory,
  Formatter,
  Stave,
  StaveNote,
} from "vexflow";

export type DandelotNoteGroup = readonly string[];
export type DandelotExerciseRow = readonly DandelotNoteGroup[];

export type DandelotExerciseSheetProps = {
  exerciseNumber: number | string;
  rows: readonly DandelotExerciseRow[];
  activeNoteIndex?: number | null;
  showNoteLabels?: boolean;
};

const MIN_SHEET_WIDTH = 760;
const ROW_HEIGHT = 112;
const ROW_HEIGHT_WITH_LABELS = 128;
const SPANISH_NOTE_NAMES: Record<string, string> = {
  c: "Do",
  d: "Re",
  e: "Mi",
  f: "Fa",
  g: "Sol",
  a: "La",
  b: "Si",
};

export default function DandelotExerciseSheet({
  exerciseNumber,
  rows,
  activeNoteIndex = null,
  showNoteLabels = false,
}: DandelotExerciseSheetProps) {
  const reactId = useId().replace(/:/g, "");
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [sheetWidth, setSheetWidth] = useState(MIN_SHEET_WIDTH);
  const rowHeight = showNoteLabels ? ROW_HEIGHT_WITH_LABELS : ROW_HEIGHT;

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const updateWidth = () => {
      setSheetWidth(Math.max(MIN_SHEET_WIDTH, Math.floor(sheet.clientWidth)));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(sheet);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let noteOffset = 0;

    rows.forEach((row, rowIndex) => {
      const container = rowRefs.current[rowIndex];
      if (!container) return;

      container.innerHTML = "";

      const startsAfterNumber = rowIndex === 0;
      const staveX = startsAfterNumber ? 64 : 8;
      const staveWidth = sheetWidth - staveX - 10;
      const factory = new Factory({
        renderer: {
          elementId: container.id,
          width: sheetWidth,
          height: rowHeight,
        },
      });
      const context = factory.getContext();
      const stave = new Stave(staveX, 7, staveWidth)
        .setBegBarType(BarlineType.NONE)
        .setEndBarType(
          rowIndex === rows.length - 1 ? BarlineType.END : BarlineType.NONE,
        )
        .addClef("treble");

      stave.setContext(context).draw();
      if (row.length === 0) return;

      let groupOffset = noteOffset;
      const noteGroups = row.map((group) => {
        const groupNotes = group.map((key, groupNoteIndex) => {
          const note = new StaveNote({
            clef: "treble",
            keys: [key],
            duration: group.length === 1 ? "q" : "8",
          });
          const noteIndex = groupOffset + groupNoteIndex;

          if (noteIndex === activeNoteIndex) {
            note.setStyle({ fillStyle: "#1976d2", strokeStyle: "#1976d2" });
          }

          if (showNoteLabels) {
            const noteName = SPANISH_NOTE_NAMES[key.split("/")[0]] ?? key;
            note.addModifier(
              new Annotation(noteName)
                .setFont("Arial", 10)
                .setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
              0,
            );
          }

          return note;
        });
        groupOffset += group.length;
        return groupNotes;
      });
      const notes = noteGroups.flat();
      const beams = noteGroups
        .filter((group) => group.length > 1)
        .map((group) => new Beam(group));

      Formatter.FormatAndDraw(context, stave, notes);
      beams.forEach((beam) => beam.setContext(context).draw());
      noteOffset = groupOffset;
    });
  }, [activeNoteIndex, rowHeight, rows, sheetWidth, showNoteLabels]);

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Box
        ref={sheetRef}
        role="img"
        aria-label={`Ejercicio Dandelot ${exerciseNumber}, ${rows.length} renglones en clave de sol`}
        sx={{
          minWidth: MIN_SHEET_WIDTH,
          width: "100%",
          bgcolor: "#fff",
          color: "#111",
          px: 1,
          py: 1.5,
        }}
      >
        {rows.map((_, rowIndex) => (
          <Box
            key={`${reactId}-row-${rowIndex}`}
            sx={{ position: "relative", height: rowHeight }}
          >
            {rowIndex === 0 && (
              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  zIndex: 1,
                  top: 31,
                  left: 8,
                  minWidth: 38,
                  height: 38,
                  px: 0.75,
                  border: "1px solid #777",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {exerciseNumber}
              </Box>
            )}
            <Box
              id={`dandelot-${reactId}-${rowIndex}`}
              ref={(element: HTMLDivElement | null) => {
                rowRefs.current[rowIndex] = element;
              }}
              sx={{ width: "100%", height: rowHeight }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
