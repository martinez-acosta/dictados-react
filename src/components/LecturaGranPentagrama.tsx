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
  beatsFromDur,
  beatsToBBS,
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

type MeasureReading = {
  clef: ClefType;
  notes: string[];
  durs: DurationSym[];
};

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

function chunkMeasures(measures: MeasureReading[], size: number) {
  const out: MeasureReading[][] = [];
  for (let index = 0; index < measures.length; index += size) {
    out.push(measures.slice(index, index + size));
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

  useEffect(() => {
    setMeasureClefs((prev) => {
      const next = prev.slice(0, measureCount);
      while (next.length < measureCount) next.push("treble");
      return next.every((value, index) => value === prev[index]) &&
        next.length === prev.length
        ? prev
        : next;
    });
  }, [measureCount]);

  const flattenedSequence = useMemo(() => {
    const out: Array<{
      key: string;
      dur: DurationSym;
      clef: ClefType;
      measureIndex: number;
      noteIndex: number;
    }> = [];

    measures.forEach((measure, measureIndex) => {
      measure.notes.forEach((key, noteIndex) => {
        out.push({
          key,
          dur: measure.durs[noteIndex] ?? duration,
          clef: measure.clef,
          measureIndex,
          noteIndex,
        });
      });
    });

    return out;
  }, [duration, measures]);

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
    const nextMeasures = measureClefs.slice(0, measureCount).map((clef) => {
      const exerciseKey = clef === "treble" ? trebleExerciseKey : bassExerciseKey;
      const pool = getNotePool(resolveExerciseConfig(clef, exerciseKey), clef);
      const notes = generateExercise(pool, notesPerMeasure);
      const durs = randomFigure
        ? randomDurations(notes.length)
        : Array(notes.length).fill(duration);

      return { clef, notes, durs };
    });

    setMeasures(nextMeasures);
    hardStop();
  }

  useEffect(() => {
    generateNewExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measureClefs, measureCount, notesPerMeasure, trebleExerciseKey, bassExerciseKey]);

  useEffect(() => {
    if (measures.length === 0) return;
    setMeasures((prev) =>
      prev.map((measure) => ({
        ...measure,
        durs: randomFigure
          ? randomDurations(measure.notes.length)
          : Array(measure.notes.length).fill(duration),
      })),
    );
    hardStop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [randomFigure, duration]);

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

        const isStrongBeat = jazzStyle ? beat === 1 || beat === 3 : beat === 0;
        if (clickSynthRef) {
          const freq = isStrongBeat ? 1200 : 800;
          clickSynthRef.volume.value = isStrongBeat ? -6 : -12;
          clickSynthRef.triggerAttackRelease(freq, "32n", time);
        }
        setCurrentBeat(beat);
      },
      "4n",
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
    Tone.Transport.timeSignature = [4, 4];
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
    Tone.Transport.timeSignature = [4, 4];
    Tone.Transport.position = "0:0:0";

    const totalBeats = displaySequence.reduce(
      (sum, note) => sum + beatsFromDur(note.dur),
      0,
    );
    const loopEnd = beatsToBBS(totalBeats);

    scheduleMetronome();
    setMetronomeActive(true);
    setCurrentBeat(0);

    let accBeats = 0;
    displaySequence.forEach((note) => {
      const startAt = beatsToBBS(accBeats);
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
      accBeats += beatsFromDur(note.dur);
    });

    Tone.Transport.setLoopPoints("0:0:0", loopEnd);
    Tone.Transport.loop = true;
    setIsPlaying(true);
    Tone.Transport.start("+0.05");
  }

  function drawGrandStaff() {
    if (!staffRef.current) return;

    staffRef.current.innerHTML = "";
    const systems = chunkMeasures(measures, 4);
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

    systems.forEach((systemMeasures, systemIndex) => {
      const yOffset = systemIndex * SYSTEM_STEP;
      const trebleStave = new Stave(STAFF_X, TREBLE_Y + yOffset, width - 40);
      const bassStave = new Stave(STAFF_X, BASS_Y + yOffset, width - 40);

      trebleStave.addClef("treble").addTimeSignature("4/4");
      bassStave.addClef("bass").addTimeSignature("4/4");

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
        const globalMeasureIndex = systemIndex * 4 + localMeasureIndex;
        const measureStartX = usableStartX + localMeasureIndex * measureWidth;
        const measureEndX = measureStartX + measureWidth;
        const labelX = (measureStartX + measureEndX) / 2;

        if (typeof context.save === "function") context.save();
        context.fillStyle = "#475569";
        context.font = "13px Georgia";
        context.textAlign = "center";
        context.fillText(
          `Compas ${globalMeasureIndex + 1} · ${CLEF_LONG_LABELS[measure.clef]}`,
          labelX,
          TREBLE_Y + yOffset - 12,
        );
        if (typeof context.restore === "function") context.restore();

        const leftInset = 12;
        const rightInset = 22;
        measure.notes.forEach((key, noteIndex) => {
          const noteCenterX =
            measure.notes.length === 1
              ? labelX
              : measureStartX +
                leftInset +
                (noteIndex / (measure.notes.length - 1)) *
                  (measureWidth - leftInset - rightInset);
          const note = new StaveNote({
            clef: measure.clef,
            keys: [key],
            duration: measure.durs[noteIndex] ?? duration,
          });
          const isHighlighted =
            currentHighlightedNote?.measureIndex === globalMeasureIndex &&
            currentHighlightedNote?.noteIndex === noteIndex;

          note.setStyle({
            fillStyle: isHighlighted ? ACTIVE_COLOR : NOTE_COLOR,
            strokeStyle: isHighlighted ? ACTIVE_COLOR : NOTE_COLOR,
          });

          const targetStave = measure.clef === "treble" ? trebleStave : bassStave;
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
            const baseY = targetStave.getYForLine(4) + (measure.clef === "bass" ? 40 : 24);
            context.fillStyle = LABEL_COLOR;
            context.font = "10px Arial";

            if (measure.clef === "bass") {
              const written = NOTE_WRITTEN[key] ?? NOTE_NAMES[key] ?? key;
              const w1 = context.measureText(written).width;
              context.fillText(written, noteCenterX - w1 / 2, baseY);

              const sounds = NOTE_SOUNDS[key];
              if (sounds) {
                const soundText = `(${sounds})`;
                context.font = "9px Arial";
                context.fillStyle = SUBLABEL_COLOR;
                const w2 = context.measureText(soundText).width;
                context.fillText(soundText, noteCenterX - w2 / 2, baseY + 11);
              }
            } else {
              const label = NOTE_NAMES[key] ?? key;
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
  }, [measures, currentHighlightedNote, showNoteLabels]);

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
                >
                  Nuevo
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${measureCount} compases`} size="small" color="primary" />
                <Chip
                  label={`${notesPerMeasure} notas por compas`}
                  size="small"
                  color="secondary"
                />
                <Chip
                  label={`${displaySequence.length} notas totales`}
                  size="small"
                />
                <Chip
                  label={randomFigure ? "Figuras aleatorias" : `Figura fija: ${duration.toUpperCase()}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

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

        <Paper sx={{ p: 2, bgcolor: "rgba(25, 118, 210, 0.05)" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
            Presets activos
          </Typography>
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
            Cada sistema muestra hasta 4 compases. Cada compas usa su propia clave
            y toma las alturas desde el preset global de Sol o Fa.
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
              {[0, 1, 2, 3].map((beat) => {
                const isStrongBeat = jazzStyle
                  ? beat === 1 || beat === 3
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
                maxWidth: 1180,
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
                  minWidth: 920,
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
