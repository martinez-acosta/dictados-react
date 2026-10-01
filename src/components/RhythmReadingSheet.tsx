import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Box, FormControlLabel, Switch } from "@mui/material";
import {
  Annotation,
  BarlineType,
  Beam,
  Factory,
  Formatter,
  Stave,
  StaveNote,
  StaveTie,
  Voice,
} from "vexflow";
import {
  writtenRhythmNotes,
  type RhythmReadingExercise,
  type RhythmTimeline,
} from "./rhythmReading";

type Props = {
  exercise: RhythmReadingExercise;
  selectedSystems: readonly number[];
  timeline: RhythmTimeline;
  activeNoteIndex: number | null;
  showSyllables: boolean;
  onSystemChange: (index: number, selected: boolean) => void;
};
const MIN_WIDTH = 1100;
const ROW_HEIGHT = 136;

export default function RhythmReadingSheet({
  exercise,
  selectedSystems,
  timeline,
  activeNoteIndex,
  showSyllables,
  onSystemChange,
}: Props) {
  const id = useId().replace(/:/g, "");
  const host = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [width, setWidth] = useState(MIN_WIDTH);
  const notes = useMemo(() => writtenRhythmNotes(exercise), [exercise]);

  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    const resize = () =>
      setWidth(Math.max(MIN_WIDTH, Math.floor(element.clientWidth)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const positions = new Map(
      timeline.positions.map((note) => [note.noteIndex, note]),
    );
    const lastMeasureIndex = exercise.systems.flat().length - 1;
    exercise.systems.forEach((system, systemIndex) => {
      const element = rowRefs.current[systemIndex];
      if (!element) return;
      element.innerHTML = "";
      const factory = new Factory({
        renderer: { elementId: element.id, width, height: ROW_HEIGHT },
      });
      const context = factory.getContext();
      const rowNotes = notes.filter((note) => note.systemIndex === systemIndex);
      const drawnNotes = new Map<number, StaveNote>();
      const weights = system.map(
        (measure, index) =>
          60 +
          measure.length * 20 +
          (systemIndex === 0 && index === 0 ? 36 : 0),
      );
      const totalWeight = weights.reduce((total, weight) => total + weight, 0);
      let x = 8;
      system.forEach((_, localMeasureIndex) => {
        const measureIndex = rowNotes[0].measureIndex + localMeasureIndex;
        const measureNotes = rowNotes.filter(
          (note) => note.measureIndex === measureIndex,
        );
        const staveWidth =
          ((width - 20) * weights[localMeasureIndex]) / totalWeight;
        const stave = new Stave(x, 10, staveWidth)
          .setConfigForLines([
            { visible: false },
            { visible: false },
            { visible: true },
            { visible: false },
            { visible: false },
          ])
          .setBegBarType(BarlineType.SINGLE)
          .setEndBarType(
            measureIndex === lastMeasureIndex
              ? BarlineType.END
              : BarlineType.SINGLE,
          );
        if (measureIndex === 0)
          stave.addTimeSignature(`${exercise.beatsPerMeasure}/4`);
        stave.setContext(context).draw();
        context.save();
        context.setFont("Arial", 12, "bold");
        context.fillText(String(measureIndex + 1), x + 3, 20);
        context.restore();

        const staveNotes = measureNotes.map((note) => {
          const drawn = new StaveNote({
            keys: ["b/4"],
            duration: note.duration,
            stem_direction: 1,
          });
          drawn.setAttribute("id", `rhythm-${id}-${note.noteIndex}`);
          if (note.noteIndex === activeNoteIndex)
            drawn.setStyle({ fillStyle: "#1976d2", strokeStyle: "#1976d2" });
          if (showSyllables) {
            const continuation =
              positions.get(note.noteIndex)?.continuation ??
              note.tiedFromPrevious;
            const label = note.rest
              ? "sil."
              : continuation
                ? "—"
                : note.beats === 2
                  ? "ta-a"
                  : note.syllable;
            drawn.addModifier(
              new Annotation(label)
                .setFont("Arial", 11)
                .setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
              0,
            );
          }
          drawnNotes.set(note.noteIndex, drawn);
          return drawn;
        });
        const voice = new Voice({
          num_beats: exercise.beatsPerMeasure,
          beat_value: 4,
        }).addTickables(staveNotes);
        const beams: Beam[] = [];
        measureNotes.forEach((note, index) => {
          const next = measureNotes[index + 1];
          if (
            note.duration === "8" &&
            next?.duration === "8" &&
            note.beatInMeasure % 1 === 0
          ) {
            beams.push(new Beam([staveNotes[index], staveNotes[index + 1]]));
          }
        });
        new Formatter().joinVoices([voice]).formatToStave([voice], stave);
        voice.draw(context, stave);
        beams.forEach((beam) => beam.setContext(context).draw());
        x += staveWidth;
      });
      rowNotes.forEach((note) => {
        if (note.tieToNext) {
          new StaveTie({
            first_note: drawnNotes.get(note.noteIndex),
            last_note: drawnNotes.get(note.noteIndex + 1),
            first_indices: [0],
            last_indices: [0],
          })
            .setDirection(1)
            .setContext(context)
            .draw();
        }
        if (note.tiedFromPrevious && !drawnNotes.has(note.noteIndex - 1)) {
          new StaveTie({
            last_note: drawnNotes.get(note.noteIndex),
            first_indices: [0],
            last_indices: [0],
          })
            .setDirection(1)
            .setContext(context)
            .draw();
        }
      });
    });
  }, [activeNoteIndex, exercise, id, notes, showSyllables, timeline, width]);

  return (
    <Box
      sx={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        width: "100%",
      }}
    >
      <Box
        ref={host}
        role="group"
        aria-label={`Ejercicio rítmico ${exercise.id}, ${exercise.systems.length} sistemas`}
        sx={{
          minWidth: MIN_WIDTH,
          width: "100%",
          bgcolor: "#fff",
          color: "#111",
          p: 1,
        }}
      >
        {exercise.systems.map((_, index) => (
          <Box key={index}>
            <FormControlLabel
              control={
                <Switch
                  checked={selectedSystems.includes(index)}
                  onChange={(_, checked) => onSystemChange(index, checked)}
                />
              }
              label={`Sistema ${index + 1}`}
              sx={{ m: 0, color: "text.primary" }}
            />
            <Box
              role="img"
              aria-label={`Sistema ${index + 1} del ejercicio ${exercise.id}, compás ${exercise.beatsPerMeasure}/4`}
              sx={{ opacity: selectedSystems.includes(index) ? 1 : 0.4 }}
            >
              <Box
                id={`rhythm-system-${id}-${index}`}
                ref={(element: HTMLDivElement | null) => {
                  rowRefs.current[index] = element;
                }}
                sx={{ height: ROW_HEIGHT, width: "100%" }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
