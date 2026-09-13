import React, { useEffect, useId, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  BarlineType,
  Beam,
  Factory,
  Formatter,
  Stave,
  StaveNote,
} from "vexflow";

export type DandelotExerciseSheetProps = {
  exerciseNumber: number | string;
  rows: readonly (readonly string[])[];
};

const MIN_SHEET_WIDTH = 760;
const ROW_HEIGHT = 112;

export default function DandelotExerciseSheet({
  exerciseNumber,
  rows,
}: DandelotExerciseSheetProps) {
  const reactId = useId().replace(/:/g, "");
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [sheetWidth, setSheetWidth] = useState(MIN_SHEET_WIDTH);

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
          height: ROW_HEIGHT,
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

      const notes = row.map(
        (key) => new StaveNote({ clef: "treble", keys: [key], duration: "8" }),
      );
      const beams: Beam[] = [];

      for (let noteIndex = 0; noteIndex < notes.length; noteIndex += 2) {
        const pair = notes.slice(noteIndex, noteIndex + 2);
        if (pair.length === 2) beams.push(new Beam(pair));
      }

      Formatter.FormatAndDraw(context, stave, notes);
      beams.forEach((beam) => beam.setContext(context).draw());
    });
  }, [rows, sheetWidth]);

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
            sx={{ position: "relative", height: ROW_HEIGHT }}
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
              sx={{ width: "100%", height: ROW_HEIGHT }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
