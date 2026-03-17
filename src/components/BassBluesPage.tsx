import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowBack, Pause, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  Factory,
  Stave,
  StaveNote,
  Accidental,
  Formatter,
  Annotation,
} from "vexflow";
import * as Tone from "tone";
import AlwaysOnTuner from "./AlwaysOnTuner";
import { getYamahaSampler, releaseYamahaVoices } from "../utils/yamahaSampler";

const ROOT_OPTIONS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

type RootNote = (typeof ROOT_OPTIONS)[number];
type BluesTypeId = "minor-blues" | "major-blues";
type ChordFunctionId = "I7" | "IV7" | "V7" | "Im7";
type FigureValue = "8" | "q" | "h";

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const SHARP_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

const FLAT_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;

const FLAT_ROOTS = new Set<RootNote>(["Db", "Eb", "Gb", "Ab", "Bb", "F"]);
const FIGURE_OPTIONS = [
  { value: "8" as const, label: "Corchea" },
  { value: "q" as const, label: "Negra" },
  { value: "h" as const, label: "Blanca" },
];
const FIGURE_TO_BEATS: Record<FigureValue, number> = {
  "8": 0.5,
  q: 1,
  h: 2,
};
const ACTIVE_COLOR = "#ea580c";

const BLUES_TYPES: Record<
  BluesTypeId,
  {
    title: string;
    description: string;
    intervals: readonly number[];
    formula: readonly string[];
  }
> = {
  "minor-blues": {
    title: "Escala blues menor",
    description: "1 - b3 - 4 - b5 - 5 - b7 con octava.",
    intervals: [0, 3, 5, 6, 7, 10, 12],
    formula: ["1", "b3", "4", "b5", "5", "b7", "8"],
  },
  "major-blues": {
    title: "Escala blues mayor",
    description: "1 - 2 - b3 - 3 - 5 - 6 con octava.",
    intervals: [0, 2, 3, 4, 7, 9, 12],
    formula: ["1", "2", "b3", "3", "5", "6", "8"],
  },
};

const CHORD_FUNCTIONS: Record<
  ChordFunctionId,
  {
    title: string;
    description: string;
    offset: number;
    intervals: readonly number[];
    formula: readonly string[];
  }
> = {
  I7: {
    title: "I7",
    description: "Dominante principal del blues.",
    offset: 0,
    intervals: [0, 4, 7, 10],
    formula: ["1", "3", "5", "b7"],
  },
  IV7: {
    title: "IV7",
    description: "Subdominante con color blues.",
    offset: 5,
    intervals: [0, 4, 7, 10],
    formula: ["1", "3", "5", "b7"],
  },
  V7: {
    title: "V7",
    description: "Dominante de resolución.",
    offset: 7,
    intervals: [0, 4, 7, 10],
    formula: ["1", "3", "5", "b7"],
  },
  Im7: {
    title: "Im7",
    description: "Color menor útil para blues menor.",
    offset: 0,
    intervals: [0, 3, 7, 10],
    formula: ["1", "b3", "5", "b7"],
  },
};

const INVERSION_LABELS = [
  "Estado fundamental",
  "1a inversion",
  "2a inversion",
  "3a inversion",
] as const;

type RenderedNote = {
  vexKey: string;
  label: string;
  toneName: string;
};

type RenderedSequence = {
  notes: RenderedNote[];
  summaryNotes: string[];
};

function prefersFlats(root: RootNote) {
  return FLAT_ROOTS.has(root);
}

function midiToRenderedNote(midi: number, useFlats: boolean): RenderedNote {
  const names = useFlats ? FLAT_NAMES : SHARP_NAMES;
  const pitchClass = names[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  const vexPitch = pitchClass.toLowerCase();
  return {
    vexKey: `${vexPitch}/${octave}`,
    label: `${pitchClass}${octave}`,
    toneName: `${SHARP_NAMES[((midi % 12) + 12) % 12]}${octave}`,
  };
}

function buildScaleSequence(root: RootNote, bluesType: BluesTypeId): RenderedSequence {
  const rootMidi = 36 + NOTE_TO_SEMITONE[root];
  const useFlats = prefersFlats(root);
  const ascending = BLUES_TYPES[bluesType].intervals.map((interval) =>
    midiToRenderedNote(rootMidi + interval, useFlats),
  );
  const descending = ascending.slice(0, -1).reverse();
  return {
    notes: [...ascending, ...descending],
    summaryNotes: ascending.map((note) => note.label),
  };
}

function buildInversionIntervals(
  baseIntervals: readonly number[],
  inversion: number,
) {
  return baseIntervals.map((_, index) => {
    const sourceIndex = (index + inversion) % baseIntervals.length;
    const sourceInterval = baseIntervals[sourceIndex];
    return sourceInterval + (sourceIndex < inversion ? 12 : 0);
  });
}

function rootAfterOffset(root: RootNote, offset: number) {
  const semitone = (NOTE_TO_SEMITONE[root] + offset) % 12;
  return (prefersFlats(root) ? FLAT_NAMES : SHARP_NAMES)[semitone];
}

function buildArpeggioSequence(
  root: RootNote,
  chordFunction: ChordFunctionId,
  inversion: number,
): RenderedSequence {
  const functionConfig = CHORD_FUNCTIONS[chordFunction];
  const chordRootMidi = 36 + NOTE_TO_SEMITONE[root] + functionConfig.offset;
  const useFlats = prefersFlats(root);
  const voicedIntervals = buildInversionIntervals(
    functionConfig.intervals,
    inversion,
  );
  const ascending = voicedIntervals.map((interval) =>
    midiToRenderedNote(chordRootMidi + interval, useFlats),
  );
  const descending = ascending.slice(0, -1).reverse();
  return {
    notes: [...ascending, ...descending],
    summaryNotes: ascending.map((note) => note.label),
  };
}

function drawBassStaff(
  container: HTMLDivElement | null,
  notes: RenderedNote[],
  figure: FigureValue,
  showLabels: boolean,
  activeIndex: number | null,
) {
  if (!container) return;

  if (!container.id) {
    container.id = `bass-blues-${Math.random().toString(36).slice(2)}`;
  }

  container.innerHTML = "";
  const parentWidth = container.parentElement?.clientWidth ?? 820;
  const minWidth = Math.max(760, notes.length * 54);
  const width = Math.max(parentWidth - 16, minWidth);
  const height = showLabels ? 210 : 150;
  const factory = new Factory({
    renderer: { elementId: container.id, width, height },
  });
  const context = factory.getContext();
  const stave = new Stave(12, 28, width - 24);
  stave.addClef("bass");
  stave.setContext(context).draw();

  const vexNotes = notes.map((note, index) => {
    const staveNote = new StaveNote({
      clef: "bass",
      keys: [note.vexKey],
      duration: figure,
    });
    const [pitchClass] = note.vexKey.split("/");
    if (pitchClass.includes("#")) {
      staveNote.addModifier(new Accidental("#"), 0);
    } else if (pitchClass.endsWith("b")) {
      staveNote.addModifier(new Accidental("b"), 0);
    }

    if (showLabels) {
      const annotation = new Annotation(note.label)
        .setFont("Arial", 10)
        .setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
      staveNote.addModifier(annotation, 0);
    }

    if (activeIndex === index) {
      staveNote.setStyle({
        fillStyle: ACTIVE_COLOR,
        strokeStyle: ACTIVE_COLOR,
      });
    }

    return staveNote;
  });

  Formatter.FormatAndDraw(context, stave, vexNotes);
  container.style.width = "100%";
  container.style.minWidth = `${minWidth}px`;
  container.style.minHeight = `${height}px`;
}

export default function BassBluesPage() {
  const navigate = useNavigate();
  const [root, setRoot] = useState<RootNote>("C");
  const [bluesType, setBluesType] = useState<BluesTypeId>("minor-blues");
  const [chordFunction, setChordFunction] = useState<ChordFunctionId>("I7");
  const [inversion, setInversion] = useState(0);
  const [figure, setFigure] = useState<FigureValue>("q");
  const [bpm, setBpm] = useState(84);
  const [showNoteLabels, setShowNoteLabels] = useState(true);
  const [activeSection, setActiveSection] = useState<"scale" | "arpeggio" | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const scaleRef = useRef<HTMLDivElement | null>(null);
  const arpeggioRef = useRef<HTMLDivElement | null>(null);
  const timerRefs = useRef<number[]>([]);
  const isPlayingRef = useRef(false);

  const scaleSequence = useMemo(
    () => buildScaleSequence(root, bluesType),
    [root, bluesType],
  );
  const arpeggioSequence = useMemo(
    () => buildArpeggioSequence(root, chordFunction, inversion),
    [root, chordFunction, inversion],
  );

  useEffect(() => {
    drawBassStaff(
      scaleRef.current,
      scaleSequence.notes,
      figure,
      showNoteLabels,
      activeSection === "scale" ? activeIndex : null,
    );
  }, [scaleSequence, figure, showNoteLabels, activeSection, activeIndex]);

  useEffect(() => {
    drawBassStaff(
      arpeggioRef.current,
      arpeggioSequence.notes,
      figure,
      showNoteLabels,
      activeSection === "arpeggio" ? activeIndex : null,
    );
  }, [arpeggioSequence, figure, showNoteLabels, activeSection, activeIndex]);

  useEffect(() => {
    return () => {
      timerRefs.current.forEach((id) => window.clearTimeout(id));
      releaseYamahaVoices();
    };
  }, []);

  function stopPlayback() {
    timerRefs.current.forEach((id) => window.clearTimeout(id));
    timerRefs.current = [];
    releaseYamahaVoices();
    setIsPlaying(false);
    setActiveSection(null);
    setActiveIndex(null);
    isPlayingRef.current = false;
  }

  async function playSequence(
    section: "scale" | "arpeggio",
    sequence: RenderedNote[],
  ) {
    stopPlayback();
    await Tone.start();
    const sampler = await getYamahaSampler();
    const noteSeconds = (60 / Math.max(40, Math.min(220, bpm))) * FIGURE_TO_BEATS[figure];
    isPlayingRef.current = true;
    setIsPlaying(true);
    setActiveSection(section);

    sequence.forEach((note, index) => {
      const timerId = window.setTimeout(() => {
        if (!isPlayingRef.current) return;
        setActiveSection(section);
        setActiveIndex(index);
        sampler.triggerAttackRelease(note.toneName, Math.max(0.2, noteSeconds * 0.9));
      }, index * noteSeconds * 1000);
      timerRefs.current.push(timerId);
    });

    const endTimer = window.setTimeout(() => {
      stopPlayback();
    }, sequence.length * noteSeconds * 1000 + 80);
    timerRefs.current.push(endTimer);
  }

  const chordRootLabel = rootAfterOffset(root, CHORD_FUNCTIONS[chordFunction].offset);

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Stack spacing={2} maxWidth="1240px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menu
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2a50", flex: 1 }}>
            Blues para Bajo
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Enfoque de estudio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Practica la escala blues y sus arpegios más usados en clave de Fa.
            La sección de arpegios permite trabajar inversiones reales sobre I7,
            IV7, V7 e Im7 desde una sola tonalidad base.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Afinador
          </Typography>
          <AlwaysOnTuner />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            flexWrap="wrap"
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Tonalidad</InputLabel>
              <Select
                value={root}
                label="Tonalidad"
                onChange={(event) => setRoot(event.target.value as RootNote)}
              >
                {ROOT_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Figura</InputLabel>
              <Select
                value={figure}
                label="Figura"
                onChange={(event) => setFigure(event.target.value as FigureValue)}
              >
                {FIGURE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label="BPM"
              type="number"
              value={bpm}
              onChange={(event) => setBpm(Math.max(40, Math.min(220, Number(event.target.value) || 40)))}
              inputProps={{ min: 40, max: 220 }}
              sx={{ width: 120 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showNoteLabels}
                  onChange={(event) => setShowNoteLabels(event.target.checked)}
                />
              }
              label="Mostrar nombres"
            />
            {isPlaying ? (
              <Button variant="outlined" color="warning" startIcon={<Pause />} onClick={stopPlayback}>
                Detener
              </Button>
            ) : null}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {BLUES_TYPES[bluesType].title} en {root}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {BLUES_TYPES[bluesType].description}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={bluesType}
                    label="Tipo"
                    onChange={(event) =>
                      setBluesType(event.target.value as BluesTypeId)
                    }
                  >
                    <MenuItem value="minor-blues">Blues menor</MenuItem>
                    <MenuItem value="major-blues">Blues mayor</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={activeSection === "scale" && isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={() =>
                    activeSection === "scale" && isPlaying
                      ? stopPlayback()
                      : playSequence("scale", scaleSequence.notes)
                  }
                >
                  {activeSection === "scale" && isPlaying ? "Detener" : "Escuchar escala"}
                </Button>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {BLUES_TYPES[bluesType].formula.map((degree) => (
                <Chip key={`scale-degree-${degree}`} size="small" label={degree} color="primary" variant="outlined" />
              ))}
            </Stack>

            <Box
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                bgcolor: "#fafafa",
                overflowX: "auto",
                px: 1,
                py: 1,
              }}
            >
              <Box ref={scaleRef} />
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {scaleSequence.summaryNotes.map((note) => (
                <Chip key={`scale-note-${note}`} size="small" label={note} />
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Arpegio {CHORD_FUNCTIONS[chordFunction].title} sobre {root}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {chordRootLabel}{chordFunction === "Im7" ? "m7" : "7"} ·{" "}
                  {INVERSION_LABELS[inversion]}. {CHORD_FUNCTIONS[chordFunction].description}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel>Funcion</InputLabel>
                  <Select
                    value={chordFunction}
                    label="Funcion"
                    onChange={(event) =>
                      setChordFunction(event.target.value as ChordFunctionId)
                    }
                  >
                    <MenuItem value="I7">I7</MenuItem>
                    <MenuItem value="IV7">IV7</MenuItem>
                    <MenuItem value="V7">V7</MenuItem>
                    <MenuItem value="Im7">Im7</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 170 }}>
                  <InputLabel>Inversion</InputLabel>
                  <Select
                    value={inversion}
                    label="Inversion"
                    onChange={(event) => setInversion(Number(event.target.value))}
                  >
                    {INVERSION_LABELS.map((label, index) => (
                      <MenuItem key={`inv-${index}`} value={index}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={activeSection === "arpeggio" && isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={() =>
                    activeSection === "arpeggio" && isPlaying
                      ? stopPlayback()
                      : playSequence("arpeggio", arpeggioSequence.notes)
                  }
                >
                  {activeSection === "arpeggio" && isPlaying ? "Detener" : "Escuchar arpegio"}
                </Button>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {CHORD_FUNCTIONS[chordFunction].formula.map((degree) => (
                <Chip key={`arp-degree-${degree}`} size="small" label={degree} color="secondary" variant="outlined" />
              ))}
            </Stack>

            <Box
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                bgcolor: "#fafafa",
                overflowX: "auto",
                px: 1,
                py: 1,
              }}
            >
              <Box ref={arpeggioRef} />
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {arpeggioSequence.summaryNotes.map((note, index) => (
                <Chip
                  key={`arp-note-${index}-${note}`}
                  size="small"
                  label={`${index + 1}. ${note}`}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
