import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Paper,
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  ArrowBack,
  Refresh,
  AccessTime,
} from "@mui/icons-material";
import { Factory, Stave, StaveConnector, StaveNote, TickContext } from "vexflow";
import * as Tone from "tone";
import { useNavigate } from "react-router-dom";
import {
  BASS_EXERCISES,
  type ClefType,
  DURATIONS,
  EXERCISES_BY_CLEF,
  generateExercise,
  getNotePool,
  keyToSPN,
  NOTE_NAMES,
  NOTE_SOUNDS,
  NOTE_WRITTEN,
  randomDurations,
  resolveExerciseConfig,
  toneDur,
  type DurationSym,
  type ExerciseKeyByClef,
} from "./LecturaMusical";

let samplerRef: Tone.Sampler | null = null;
let clickSynthRef: Tone.Synth | null = null;

async function ensureAudio() {
  await Tone.start();
  if (!samplerRef) {
    samplerRef = new Tone.Sampler({
      urls: {
        A0: "A0.mp3",
        C1: "C1.mp3",
        "D#1": "Ds1.mp3",
        "F#1": "Fs1.mp3",
        A1: "A1.mp3",
        C2: "C2.mp3",
        "D#2": "Ds2.mp3",
        "F#2": "Fs2.mp3",
        A2: "A2.mp3",
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();
    await Tone.loaded();
  }
  if (!clickSynthRef) {
    clickSynthRef = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
    }).toDestination();
    clickSynthRef.volume.value = -6;
  }
}

type TimeSignatureValue = readonly [2 | 4, 2 | 4];

type ReadingNote = {
  key: string;
  dur: DurationSym;
  clef: ClefType;
};

type MeasureReading = {
  notes: ReadingNote[];
};

type FixedGrandStaffPreset = {
  id: "pozzoli_2";
  name: string;
  description: string;
  timeSignature: TimeSignatureValue;
  systemMeasureCounts: number[];
  measures: MeasureReading[];
};

type ScorePresetId = "generated" | "pozzoli_2";

type HighlightedNote = {
  measureIndex: number;
  noteIndex: number;
} | null;

const MEASURE_COUNT_OPTIONS = [4, 8, 12];
const NOTES_PER_MEASURE_OPTIONS = [3, 4, 6, 8];
const BPM_OPTIONS = [
  40, 45, 50, 55, 60, 65, 70, 72, 75, 80, 85, 90, 95, 96, 100, 105, 110, 115,
  120,
];
const CLEF_LABELS: Record<ClefType, string> = {
  treble: "Sol",
  bass: "Fa",
};
const CLEF_LONG_LABELS: Record<ClefType, string> = {
  treble: "Clave de Sol",
  bass: "Clave de Fa",
};
const ACTIVE_COLOR = "#ea580c";
const NOTE_COLOR = "#111827";
const LABEL_COLOR = "#64748b";
const SUBLABEL_COLOR = "#94a3b8";
const SYSTEM_STEP = 284;
const STAFF_HEIGHT = 204;
const STAFF_X = 20;
const TREBLE_Y = 38;
const BASS_Y = 138;

function clefForKey(key: string): ClefType {
  const [, octaveText] = key.split("/");
  const octave = Number(octaveText);
  return octave >= 4 ? "treble" : "bass";
}

function note(key: string, dur: DurationSym = "h", clef?: ClefType): ReadingNote {
  return { key, dur, clef: clef ?? clefForKey(key) };
}

function measure(...notes: ReadingNote[]): MeasureReading {
  return { notes };
}

function beatsFromDurForSignature(
  duration: DurationSym,
  timeSignature: TimeSignatureValue,
) {
  if (timeSignature[1] === 2) {
    return duration === "w"
      ? 2
      : duration === "h"
      ? 1
      : duration === "q"
      ? 0.5
      : 0.25;
  }
  return duration === "w" ? 4 : duration === "h" ? 2 : duration === "q" ? 1 : 0.5;
}

function beatsToTransportPosition(
  totalBeats: number,
  timeSignature: TimeSignatureValue,
) {
  const beatsPerBar = timeSignature[0];
  const bar = Math.floor(totalBeats / beatsPerBar);
  const beat = totalBeats % beatsPerBar;
  return `${bar}:${beat}:0`;
}

function metronomeSubdivision(timeSignature: TimeSignatureValue) {
  return timeSignature[1] === 2 ? "2n" : "4n";
}

function measureClefLabel(measure: MeasureReading) {
  const clefs = Array.from(new Set(measure.notes.map((item) => item.clef)));
  if (clefs.length === 1) return CLEF_LONG_LABELS[clefs[0]];
  return "Mixto";
}

const POZZOLI_2_PRESET: FixedGrandStaffPreset = {
  id: "pozzoli_2",
  name: "Ejercicio 2 Pozzoli",
  description:
    "Transcripción manual fija en 2/2 basada en la imagen proporcionada por el usuario.",
  timeSignature: [2, 2],
  systemMeasureCounts: [11, 13, 11],
  measures: [
    measure(note("c/3"), note("d/3")),
    measure(note("e/3"), note("f/3")),
    measure(note("g/3"), note("a/3")),
    measure(note("b/3"), note("d/4")),
    measure(note("c/4"), note("c/4")),
    measure(note("d/4"), note("e/4")),
    measure(note("f/4"), note("f/4")),
    measure(note("g/4"), note("a/4")),
    measure(note("b/4"), note("b/4")),
    measure(note("d/5"), note("c/5")),
    measure(note("e/5"), note("d/5")),
    measure(note("f/5"), note("e/5")),
    measure(note("g/5"), note("f/5")),
    measure(note("e/5"), note("d/5")),
    measure(note("d/5"), note("b/4")),
    measure(note("c/5"), note("a/4")),
    measure(note("f/4"), note("d/4")),
    measure(note("b/3"), note("g/3")),
    measure(note("e/3"), note("c/3")),
    measure(note("a/2"), note("f/2")),
    measure(note("d/2"), note("c/2")),
    measure(note("d/2"), note("e/2")),
    measure(note("f/2"), note("g/2")),
    measure(note("a/2", "h", "bass"), note("b/2", "h", "bass")),
    measure(note("c/3", "h", "bass"), note("c/3", "h", "bass")),
    measure(note("d/3", "h", "bass"), note("e/3", "h", "bass")),
    measure(note("f/3", "h", "bass"), note("g/3", "h", "bass")),
    measure(note("c/4", "h", "bass"), note("c/4", "h", "bass")),
    measure(note("d/4", "h", "treble"), note("e/4", "h", "treble")),
    measure(note("f/4", "h", "treble"), note("g/4", "h", "treble")),
    measure(note("a/4", "h", "treble"), note("b/4", "h", "treble")),
    measure(note("c/5", "h", "treble"), note("c/5", "h", "treble")),
    measure(note("d/5", "h", "treble"), note("e/5", "h", "treble")),
    measure(note("f/5", "h", "treble"), note("g/5", "h", "treble")),
    measure(note("a/5", "h", "treble"), note("b/5", "h", "treble")),
  ],
};

function chunkMeasuresByCounts(measures: MeasureReading[], counts: number[]) {
  const out: MeasureReading[][] = [];
  let cursor = 0;
  counts.forEach((count) => {
    if (count <= 0) return;
    out.push(measures.slice(cursor, cursor + count));
    cursor += count;
  });
  if (cursor < measures.length) {
    out.push(measures.slice(cursor));
  }
  return out;
}

function createDefaultClefs(count: number): ClefType[] {
  return Array(count).fill("treble");
}

function randomClef(): ClefType {
  return Math.random() < 0.5 ? "treble" : "bass";
}

export default function LecturaGranPentagrama() {
  const navigate = useNavigate();
  const trebleExerciseEntries = useMemo(
    () =>
      Object.entries(EXERCISES_BY_CLEF.treble) as Array<
        [ExerciseKeyByClef<"treble">, (typeof EXERCISES_BY_CLEF.treble)[keyof typeof EXERCISES_BY_CLEF.treble]]
      >,
    [],
  );
  const bassExerciseEntries = useMemo(
    () =>
      Object.entries(BASS_EXERCISES) as Array<
        [ExerciseKeyByClef<"bass">, (typeof BASS_EXERCISES)[keyof typeof BASS_EXERCISES]]
      >,
    [],
  );

  const [measureCount, setMeasureCount] = useState(4);
  const [notesPerMeasure, setNotesPerMeasure] = useState(8);
  const [measureClefs, setMeasureClefs] = useState<ClefType[]>(
    createDefaultClefs(4),
  );
  const [scorePresetId, setScorePresetId] = useState<ScorePresetId>("generated");
  const [trebleExerciseKey, setTrebleExerciseKey] =
    useState<ExerciseKeyByClef<"treble">>(trebleExerciseEntries[0][0]);
  const [bassExerciseKey, setBassExerciseKey] = useState<ExerciseKeyByClef<"bass">>(
    bassExerciseEntries[0][0],
  );
  const [bpm, setBpm] = useState(60);
  const [duration, setDuration] = useState<DurationSym>("q");
  const [randomFigure, setRandomFigure] = useState(false);
  const [showNoteLabels, setShowNoteLabels] = useState(true);
  const [jazzStyle, setJazzStyle] = useState(false);
  const [reverseOrder, setReverseOrder] = useState(false);
  const [measures, setMeasures] = useState<MeasureReading[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [currentHighlightedNote, setCurrentHighlightedNote] =
    useState<HighlightedNote>(null);

  const staffRef = useRef<HTMLDivElement | null>(null);
  const metronomeIdRef = useRef<number | null>(null);
  const fixedPreset = scorePresetId === "pozzoli_2" ? POZZOLI_2_PRESET : null;
  const activeTimeSignature = fixedPreset?.timeSignature ?? ([4, 4] as const);
  const activeSystemMeasureCounts = fixedPreset?.systemMeasureCounts ?? [4];
  const isFixedPreset = fixedPreset !== null;
  const activeMeasures = fixedPreset?.measures ?? measures;

  useEffect(() => {
    if (isFixedPreset) return;
    setMeasureClefs((prev) => {
      const next = prev.slice(0, measureCount);
      while (next.length < measureCount) next.push("treble");
      return next.every((value, index) => value === prev[index]) &&
        next.length === prev.length
        ? prev
        : next;
    });
  }, [isFixedPreset, measureCount]);

  const flattenedSequence = useMemo(() => {
    const out: Array<{
      key: string;
      dur: DurationSym;
      clef: ClefType;
      measureIndex: number;
      noteIndex: number;
    }> = [];

    activeMeasures.forEach((measure, measureIndex) => {
      measure.notes.forEach((readingNote, noteIndex) => {
        out.push({
          key: readingNote.key,
          dur: readingNote.dur,
          clef: readingNote.clef,
          measureIndex,
          noteIndex,
        });
      });
    });

    return out;
  }, [activeMeasures]);

  const displaySequence = useMemo(
    () =>
      reverseOrder ? [...flattenedSequence].reverse() : flattenedSequence,
    [flattenedSequence, reverseOrder],
  );

  const treblePool = useMemo(
    () =>
      getNotePool(
        resolveExerciseConfig("treble", trebleExerciseKey),
        "treble",
      ),
    [trebleExerciseKey],
  );
  const bassPool = useMemo(
    () => getNotePool(resolveExerciseConfig("bass", bassExerciseKey), "bass"),
    [bassExerciseKey],
  );

  function softStopUI() {
    setIsPlaying(false);
    setMetronomeActive(false);
    setCurrentBeat(0);
    setCurrentHighlightedNote(null);
  }

  function hardStop() {
    try {
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      Tone.Transport.loop = false;
    } catch {}
    softStopUI();
  }

  function generateNewExercise() {
    if (isFixedPreset) {
      hardStop();
      return;
    }
    const nextMeasures = measureClefs.slice(0, measureCount).map((clef) => {
      const exerciseKey = clef === "treble" ? trebleExerciseKey : bassExerciseKey;
      const pool = getNotePool(resolveExerciseConfig(clef, exerciseKey), clef);
      const notes = generateExercise(pool, notesPerMeasure);
      const durations = randomFigure
        ? randomDurations(notes.length)
        : Array(notes.length).fill(duration);

      return {
        notes: notes.map((key, index) => note(key, durations[index], clef)),
      };
    });

    setMeasures(nextMeasures);
    hardStop();
  }

  useEffect(() => {
    if (isFixedPreset) {
      hardStop();
      return;
    }
    generateNewExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bassExerciseKey,
    isFixedPreset,
    measureClefs,
    measureCount,
    notesPerMeasure,
    trebleExerciseKey,
  ]);

  useEffect(() => {
    if (isFixedPreset || measures.length === 0) return;
    setMeasures((prev) =>
      prev.map((measure) => {
        const nextDurations = randomFigure
          ? randomDurations(measure.notes.length)
          : Array(measure.notes.length).fill(duration);
        return {
          ...measure,
          notes: measure.notes.map((readingNote, index) => ({
            ...readingNote,
            dur: nextDurations[index],
          })),
        };
      }),
    );
    hardStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, isFixedPreset, randomFigure]);

  useEffect(() => () => hardStop(), []);

  function scheduleMetronome() {
    if (metronomeIdRef.current !== null) {
      Tone.Transport.clear(metronomeIdRef.current);
      metronomeIdRef.current = null;
    }

    const id = Tone.Transport.scheduleRepeat(
      (time) => {
        const pos = Tone.Transport.position;
        let beat = 0;
        try {
          const parts = String(pos).split(":");
          beat = parseInt(parts[1] ?? "0", 10) || 0;
        } catch {}

        const isStrongBeat =
          jazzStyle && activeTimeSignature[0] >= 4
            ? beat === 1 || beat === 3
            : jazzStyle
            ? beat === 1
            : beat === 0;
        if (clickSynthRef) {
          const freq = isStrongBeat ? 1200 : 800;
          clickSynthRef.volume.value = isStrongBeat ? -6 : -12;
          clickSynthRef.triggerAttackRelease(freq, "32n", time);
        }
        setCurrentBeat(beat);
      },
      metronomeSubdivision(activeTimeSignature),
      "0:0:0",
    );

    metronomeIdRef.current = id;
  }

  async function toggleMetronomeOnly() {
    if (isPlaying) return;
    if (metronomeActive) {
      hardStop();
      return;
    }

    await ensureAudio();
    Tone.Transport.cancel(0);
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.timeSignature = [...activeTimeSignature];
    Tone.Transport.loop = false;
    scheduleMetronome();
    setMetronomeActive(true);
    setCurrentBeat(0);
    Tone.Transport.position = "0:0:0";
    Tone.Transport.start("+0.05");
  }

  async function playExercise() {
    if (isPlaying) {
      hardStop();
      return;
    }
    if (displaySequence.length === 0) return;

    await ensureAudio();
    Tone.Transport.cancel(0);
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.timeSignature = [...activeTimeSignature];
    Tone.Transport.position = "0:0:0";

    const totalBeats = displaySequence.reduce(
      (sum, note) => sum + beatsFromDurForSignature(note.dur, activeTimeSignature),
      0,
    );
    const loopEnd = beatsToTransportPosition(totalBeats, activeTimeSignature);

    scheduleMetronome();
    setMetronomeActive(true);
    setCurrentBeat(0);

    let accBeats = 0;
    displaySequence.forEach((note) => {
      const startAt = beatsToTransportPosition(accBeats, activeTimeSignature);
      Tone.Transport.schedule((time) => {
        setCurrentHighlightedNote({
          measureIndex: note.measureIndex,
          noteIndex: note.noteIndex,
        });
        samplerRef?.triggerAttackRelease(
          keyToSPN(note.key),
          toneDur(note.dur),
          time,
        );
      }, startAt);
      accBeats += beatsFromDurForSignature(note.dur, activeTimeSignature);
    });

    Tone.Transport.setLoopPoints("0:0:0", loopEnd);
    Tone.Transport.loop = true;
    setIsPlaying(true);
    Tone.Transport.start("+0.05");
  }

  function drawGrandStaff() {
    if (!staffRef.current) return;

    staffRef.current.innerHTML = "";
    const systems = chunkMeasuresByCounts(activeMeasures, activeSystemMeasureCounts);
    const systemCount = Math.max(1, systems.length);
    const width = Math.max(
      Math.floor(staffRef.current.getBoundingClientRect().width),
      920,
    );
    const height = systemCount * SYSTEM_STEP + 40;
    const vf = new Factory({
      renderer: {
        elementId: staffRef.current.id,
        width,
        height,
      },
    });
    const context = vf.getContext();

    const timeSignatureLabel = `${activeTimeSignature[0]}/${activeTimeSignature[1]}`;

    systems.forEach((systemMeasures, systemIndex) => {
      const systemStartMeasureIndex = activeSystemMeasureCounts
        .slice(0, systemIndex)
        .reduce((sum, count) => sum + count, 0);
      const yOffset = systemIndex * SYSTEM_STEP;
      const trebleStave = new Stave(STAFF_X, TREBLE_Y + yOffset, width - 40);
      const bassStave = new Stave(STAFF_X, BASS_Y + yOffset, width - 40);

      trebleStave.addClef("treble").addTimeSignature(timeSignatureLabel);
      bassStave.addClef("bass").addTimeSignature(timeSignatureLabel);

      trebleStave.setContext(context).draw();
      bassStave.setContext(context).draw();

      new StaveConnector(trebleStave, bassStave)
        .setType(StaveConnector.type.BRACE)
        .setContext(context)
        .draw();
      new StaveConnector(trebleStave, bassStave)
        .setType(StaveConnector.type.SINGLE_LEFT)
        .setContext(context)
        .draw();
      new StaveConnector(trebleStave, bassStave)
        .setType(StaveConnector.type.SINGLE_RIGHT)
        .setContext(context)
        .draw();

      const usableStartX = trebleStave.getNoteStartX() + 12;
      const usableEndX = trebleStave.getX() + trebleStave.getWidth() - 24;
      const usableWidth = usableEndX - usableStartX;
      const measureWidth = usableWidth / systemMeasures.length;

      systemMeasures.forEach((measure, localMeasureIndex) => {
        const globalMeasureIndex = systemStartMeasureIndex + localMeasureIndex;
        const measureStartX = usableStartX + localMeasureIndex * measureWidth;
        const measureEndX = measureStartX + measureWidth;
        const labelX = (measureStartX + measureEndX) / 2;

        const leftInset = 12;
        const rightInset = 22;
        measure.notes.forEach((readingNote, noteIndex) => {
          const noteCenterX =
            measure.notes.length === 1
              ? labelX
              : measureStartX +
                leftInset +
                (noteIndex / (measure.notes.length - 1)) *
                  (measureWidth - leftInset - rightInset);
          const note = new StaveNote({
            clef: readingNote.clef,
            keys: [readingNote.key],
            duration: readingNote.dur,
          });
          const isHighlighted =
            currentHighlightedNote?.measureIndex === globalMeasureIndex &&
            currentHighlightedNote?.noteIndex === noteIndex;

          note.setStyle({
            fillStyle: isHighlighted ? ACTIVE_COLOR : NOTE_COLOR,
            strokeStyle: isHighlighted ? ACTIVE_COLOR : NOTE_COLOR,
          });

          const targetStave =
            readingNote.clef === "treble" ? trebleStave : bassStave;
          note.setStave(targetStave);
          note.setContext(context);
          const tickContext = new TickContext();
          tickContext.addTickable(note).preFormat().setX(noteCenterX);
          note.setTickContext(tickContext);

          if (
            typeof note.getAbsoluteX === "function" &&
            typeof note.setXShift === "function"
          ) {
            const absoluteX = note.getAbsoluteX();
            if (Number.isFinite(absoluteX)) {
              note.setXShift(noteCenterX - absoluteX);
            }
          }

          note.draw();

          if (showNoteLabels) {
            const baseY =
              targetStave.getYForLine(4) + (readingNote.clef === "bass" ? 40 : 24);
            context.fillStyle = LABEL_COLOR;
            context.font = "10px Arial";

            if (readingNote.clef === "bass") {
              const written =
                NOTE_WRITTEN[readingNote.key] ??
                NOTE_NAMES[readingNote.key] ??
                readingNote.key;
              const w1 = context.measureText(written).width;
              context.fillText(written, noteCenterX - w1 / 2, baseY);

              const sounds = NOTE_SOUNDS[readingNote.key];
              if (sounds) {
                const soundText = `(${sounds})`;
                context.font = "9px Arial";
                context.fillStyle = SUBLABEL_COLOR;
                const w2 = context.measureText(soundText).width;
                context.fillText(soundText, noteCenterX - w2 / 2, baseY + 11);
              }
            } else {
              const label = NOTE_NAMES[readingNote.key] ?? readingNote.key;
              const w = context.measureText(label).width;
              context.fillText(label, noteCenterX - w / 2, baseY);
            }
          }
        });

        if (localMeasureIndex < systemMeasures.length - 1) {
          context.beginPath();
          context.moveTo(measureEndX, trebleStave.getYForLine(0));
          context.lineTo(measureEndX, bassStave.getYForLine(4));
          context.strokeStyle = "rgba(148, 163, 184, 0.6)";
          context.lineWidth = 1.2;
          context.stroke();
        }
      });
    });
  }

  useEffect(() => {
    drawGrandStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeMeasures,
    activeSystemMeasureCounts,
    activeTimeSignature,
    currentHighlightedNote,
    showNoteLabels,
  ]);

  const trebleConfig = useMemo(
    () => resolveExerciseConfig("treble", trebleExerciseKey),
    [trebleExerciseKey],
  );
  const bassConfig = useMemo(
    () => resolveExerciseConfig("bass", bassExerciseKey),
    [bassExerciseKey],
  );

  function randomizeMeasureClefs() {
    setMeasureClefs(Array.from({ length: measureCount }, () => randomClef()));
  }

  function fillMeasureClefs(clef: ClefType) {
    setMeasureClefs(Array.from({ length: measureCount }, () => clef));
  }

  return (
    <Box sx={{ width: "100%", px: 2 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menu
          </Button>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "#0b2a50", flex: 1 }}
          >
            Lectura en Gran Pentagrama
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Partitura</InputLabel>
                <Select
                  value={scorePresetId}
                  onChange={(event) =>
                    setScorePresetId(event.target.value as ScorePresetId)
                  }
                  label="Partitura"
                >
                  <MenuItem value="generated">Generado por presets</MenuItem>
                  <MenuItem value="pozzoli_2">Ejercicio 2 Pozzoli</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {!isFixedPreset ? (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Compases</InputLabel>
                    <Select
                      value={measureCount}
                      onChange={(event) => setMeasureCount(Number(event.target.value))}
                      label="Compases"
                    >
                      {MEASURE_COUNT_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Notas por compas</InputLabel>
                    <Select
                      value={notesPerMeasure}
                      onChange={(event) =>
                        setNotesPerMeasure(Number(event.target.value))
                      }
                      label="Notas por compas"
                    >
                      {NOTES_PER_MEASURE_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Preset de Sol</InputLabel>
                    <Select
                      value={trebleExerciseKey}
                      onChange={(event) =>
                        setTrebleExerciseKey(
                          event.target.value as ExerciseKeyByClef<"treble">,
                        )
                      }
                      label="Preset de Sol"
                    >
                      {trebleExerciseEntries.map(([key, cfg]) => (
                        <MenuItem key={String(key)} value={String(key)}>
                          {cfg.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Preset de Fa</InputLabel>
                    <Select
                      value={bassExerciseKey}
                      onChange={(event) =>
                        setBassExerciseKey(
                          event.target.value as ExerciseKeyByClef<"bass">,
                        )
                      }
                      label="Preset de Fa"
                    >
                      {bassExerciseEntries.map(([key, cfg]) => (
                        <MenuItem key={String(key)} value={String(key)}>
                          {cfg.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : (
              <Grid item xs={12} md={8}>
                <Typography variant="body2" color="text.secondary">
                  {POZZOLI_2_PRESET.description}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>BPM</InputLabel>
                <Select
                  value={bpm}
                  onChange={(event) => setBpm(Number(event.target.value))}
                  label="BPM"
                >
                  {BPM_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option} BPM
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!isFixedPreset ? (
              <Grid item xs={12} sm={6} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={randomFigure}
                      onChange={(event) => setRandomFigure(event.target.checked)}
                    />
                  }
                  label="Figuras aleatorias"
                />
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Duracion fija</InputLabel>
                  <Select
                    value={duration}
                    onChange={(event) =>
                      setDuration(event.target.value as DurationSym)
                    }
                    label="Duracion fija"
                    disabled={randomFigure}
                  >
                    <MenuItem value="w">Redonda</MenuItem>
                    <MenuItem value="h">Blanca</MenuItem>
                    <MenuItem value="q">Negra</MenuItem>
                    <MenuItem value="8">Corchea</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            ) : null}

            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showNoteLabels}
                    onChange={(event) => setShowNoteLabels(event.target.checked)}
                  />
                }
                label="Mostrar nombres"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={jazzStyle}
                    onChange={(event) => setJazzStyle(event.target.checked)}
                  />
                }
                label={jazzStyle ? "Metronomo Jazz (2 y 4)" : "Metronomo Clasico (1)"}
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={reverseOrder}
                    onChange={(event) => setReverseOrder(event.target.checked)}
                  />
                }
                label="Invertir reproduccion"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={playExercise}
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  disabled={displaySequence.length === 0}
                >
                  {isPlaying ? "Detener" : "Reproducir"}
                </Button>
                <Button
                  variant={
                    metronomeActive && !isPlaying ? "contained" : "outlined"
                  }
                  color={
                    metronomeActive && !isPlaying ? "secondary" : "inherit"
                  }
                  onClick={toggleMetronomeOnly}
                  startIcon={<AccessTime />}
                  disabled={isPlaying}
                >
                  {metronomeActive && !isPlaying ? "Parar" : "Metronomo"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={generateNewExercise}
                  startIcon={<Refresh />}
                  disabled={isFixedPreset}
                >
                  Nuevo
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={`${activeMeasures.length} compases`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={
                    isFixedPreset
                      ? `${activeSystemMeasureCounts.join(" · ")} compases por sistema`
                      : `${notesPerMeasure} notas por compas`
                  }
                  size="small"
                  color="secondary"
                />
                <Chip
                  label={`${displaySequence.length} notas totales`}
                  size="small"
                />
                <Chip
                  label={
                    isFixedPreset
                      ? `${activeTimeSignature[0]}/${activeTimeSignature[1]} fijo`
                      : randomFigure
                      ? "Figuras aleatorias"
                      : `Figura fija: ${duration.toUpperCase()}`
                  }
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {!isFixedPreset ? (
          <Paper sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Clave por compas
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fillMeasureClefs("treble")}
                >
                  Solo clave de Sol
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fillMeasureClefs("bass")}
                >
                  Solo clave de Fa
                </Button>
                <Button variant="outlined" size="small" onClick={randomizeMeasureClefs}>
                  Aleatorio
                </Button>
              </Stack>
            </Box>
            <Grid container spacing={1.5}>
              {measureClefs.map((clef, index) => (
                <Grid item xs={12} sm={6} md={3} key={`measure-clef-${index}`}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{`Compas ${index + 1}`}</InputLabel>
                    <Select
                      value={clef}
                      onChange={(event) => {
                        const next = [...measureClefs];
                        next[index] = event.target.value as ClefType;
                        setMeasureClefs(next);
                      }}
                      label={`Compas ${index + 1}`}
                    >
                      <MenuItem value="treble">Clave de Sol</MenuItem>
                      <MenuItem value="bass">Clave de Fa</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              {measureClefs.map((clef, index) => (
                <Chip
                  key={`summary-clef-${index}`}
                  size="small"
                  label={`Compas ${index + 1}: ${CLEF_LABELS[clef]}`}
                  color={clef === "treble" ? "primary" : "secondary"}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Paper>
        ) : null}

        <Paper sx={{ p: 2, bgcolor: "rgba(25, 118, 210, 0.05)" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
            Presets activos
          </Typography>
          {isFixedPreset ? (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Partitura fija: {POZZOLI_2_PRESET.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {POZZOLI_2_PRESET.description}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`${POZZOLI_2_PRESET.measures.length} compases`}
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  size="small"
                  label={POZZOLI_2_PRESET.systemMeasureCounts.join(" · ")}
                  variant="outlined"
                  color="secondary"
                />
                <Chip
                  size="small"
                  label={`${POZZOLI_2_PRESET.timeSignature[0]}/${POZZOLI_2_PRESET.timeSignature[1]}`}
                  variant="outlined"
                />
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Sol: {trebleConfig.name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Fa: {bassConfig.name}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                {Array.from(new Set(treblePool)).map((note) => (
                  <Chip
                    key={`treble-pool-${note}`}
                    size="small"
                    label={NOTE_NAMES[note] ?? note}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {Array.from(new Set(bassPool)).map((note) => {
                  const written = NOTE_WRITTEN[note] ?? NOTE_NAMES[note] ?? note;
                  const sounds = NOTE_SOUNDS[note];
                  return (
                    <Chip
                      key={`bass-pool-${note}`}
                      size="small"
                      label={sounds ? `${written} (${sounds})` : written}
                      variant="outlined"
                      color="secondary"
                    />
                  );
                })}
              </Stack>
            </>
          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "primary.main",
              textAlign: "center",
            }}
          >
            Gran pentagrama de lectura
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 2, color: "text.secondary", textAlign: "center" }}
          >
            {isFixedPreset
              ? "Partitura fija en gran pentagrama. Conserva ayudas del componente, pero bloquea los controles que alterarían el ejercicio."
              : "Cada sistema muestra hasta 4 compases. Cada compas usa su propia clave y toma las alturas desde el preset global de Sol o Fa."}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              minHeight: 40,
              mb: 1,
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showNoteLabels}
                  onChange={(event) => setShowNoteLabels(event.target.checked)}
                />
              }
              label="Mostrar nombres"
              sx={{ mr: 0 }}
            />
          </Box>

          {(metronomeActive || isPlaying) && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                py: 1,
                mb: 2,
                backgroundColor: jazzStyle
                  ? "rgba(255, 152, 0, 0.08)"
                  : "rgba(33, 150, 243, 0.08)",
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
                {bpm} BPM:
              </Typography>
              {Array.from({ length: activeTimeSignature[0] }, (_, beat) => {
                const isStrongBeat = jazzStyle
                  ? activeTimeSignature[0] >= 4
                    ? beat === 1 || beat === 3
                    : beat === 1
                  : beat === 0;
                const isActive = currentBeat === beat;
                return (
                  <Box
                    key={beat}
                    sx={{
                      width: isStrongBeat ? 26 : 22,
                      height: isStrongBeat ? 26 : 22,
                      borderRadius: "50%",
                      backgroundColor: isActive ? ACTIVE_COLOR : "#e2e8f0",
                      border: isStrongBeat
                        ? `2px solid ${isActive ? ACTIVE_COLOR : "#fdba74"}`
                        : "none",
                      transition: "background-color 0.1s ease, border-color 0.1s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                        color: isActive ? "white" : "#475569",
                        fontWeight: isStrongBeat ? "bold" : "normal",
                      }}
                    >
                      {beat + 1}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: isFixedPreset ? 1880 : 1180,
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                bgcolor: "rgba(248,250,252,0.8)",
                overflowX: "auto",
                p: 1,
              }}
            >
              <Box
                id="grand-staff-reading"
                ref={staffRef}
                sx={{
                  width: "100%",
                  minWidth: isFixedPreset ? 1680 : 920,
                  minHeight: STAFF_HEIGHT,
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
