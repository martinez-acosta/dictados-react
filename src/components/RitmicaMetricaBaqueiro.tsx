import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import {
  ArrowBack,
  Pause,
  PlayArrow,
  RestartAlt,
  Shuffle,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as Tone from "tone";
import { Beam, Factory, Formatter, Stave, StaveNote, Voice } from "vexflow";

type Duration =
  | "w"
  | "hd"
  | "h"
  | "qd"
  | "q"
  | "8"
  | "wr"
  | "hdr"
  | "hr"
  | "qdr"
  | "qr"
  | "8r";
type Exercise = {
  id: number;
  title: string;
  description: string;
  measures: Duration[][];
};

const DUR_TO_BEATS: Record<Duration, number> = {
  w: 4,
  hd: 3,
  h: 2,
  qd: 1.5,
  q: 1,
  8: 0.5,
  wr: 4,
  hdr: 3,
  hr: 2,
  qdr: 1.5,
  qr: 1,
  "8r": 0.5,
};

type RhythmToken = {
  id: Duration;
  label: string;
  shortLabel: string;
  kind: "note" | "rest";
  beats: number;
  vexBase: "w" | "h" | "q" | "8";
  dots: 0 | 1;
  solfege: string;
};

const RHYTHM_TOKENS: readonly RhythmToken[] = [
  {
    id: "w",
    label: "Redonda",
    shortLabel: "Redonda",
    kind: "note",
    beats: 4,
    vexBase: "w",
    dots: 0,
    solfege: "ta-a-a-a",
  },
  {
    id: "hd",
    label: "Blanca con puntillo",
    shortLabel: "Blanca·",
    kind: "note",
    beats: 3,
    vexBase: "h",
    dots: 1,
    solfege: "ta-a-a",
  },
  {
    id: "h",
    label: "Blanca",
    shortLabel: "Blanca",
    kind: "note",
    beats: 2,
    vexBase: "h",
    dots: 0,
    solfege: "ta-o",
  },
  {
    id: "qd",
    label: "Negra con puntillo",
    shortLabel: "Negra·",
    kind: "note",
    beats: 1.5,
    vexBase: "q",
    dots: 1,
    solfege: "ta-a",
  },
  {
    id: "q",
    label: "Negra",
    shortLabel: "Negra",
    kind: "note",
    beats: 1,
    vexBase: "q",
    dots: 0,
    solfege: "ta",
  },
  {
    id: "8",
    label: "Corchea",
    shortLabel: "Corchea",
    kind: "note",
    beats: 0.5,
    vexBase: "8",
    dots: 0,
    solfege: "ti",
  },
  {
    id: "wr",
    label: "Silencio de redonda",
    shortLabel: "Silencio w",
    kind: "rest",
    beats: 4,
    vexBase: "w",
    dots: 0,
    solfege: "silencio",
  },
  {
    id: "hdr",
    label: "Silencio de blanca con puntillo",
    shortLabel: "Silencio h·",
    kind: "rest",
    beats: 3,
    vexBase: "h",
    dots: 1,
    solfege: "silencio",
  },
  {
    id: "hr",
    label: "Silencio de blanca",
    shortLabel: "Silencio h",
    kind: "rest",
    beats: 2,
    vexBase: "h",
    dots: 0,
    solfege: "silencio",
  },
  {
    id: "qdr",
    label: "Silencio de negra con puntillo",
    shortLabel: "Silencio q·",
    kind: "rest",
    beats: 1.5,
    vexBase: "q",
    dots: 1,
    solfege: "silencio",
  },
  {
    id: "qr",
    label: "Silencio de negra",
    shortLabel: "Silencio q",
    kind: "rest",
    beats: 1,
    vexBase: "q",
    dots: 0,
    solfege: "silencio",
  },
  {
    id: "8r",
    label: "Silencio de corchea",
    shortLabel: "Silencio 8",
    kind: "rest",
    beats: 0.5,
    vexBase: "8",
    dots: 0,
    solfege: "silencio",
  },
] as const;

const TOKEN_BY_ID: Record<Duration, RhythmToken> = RHYTHM_TOKENS.reduce(
  (acc, token) => {
    acc[token.id] = token;
    return acc;
  },
  {} as Record<Duration, RhythmToken>,
);

const FIGURE_TOKENS = RHYTHM_TOKENS.filter((token) => token.kind === "note");
const REST_TOKENS = RHYTHM_TOKENS.filter((token) => token.kind === "rest");

const EXERCISES: Exercise[] = [
  {
    id: 1,
    title: "Ejercicio 1",
    description: "Figuras base: redonda, blanca, negra y silencios simples.",
    measures: [
      ["w"],
      ["h", "h"],
      ["h", "q", "q"],
      ["q", "q", "q", "q"],
      ["h", "qr", "q"],
      ["q", "q", "h"],
      ["q", "qr", "q", "q"],
      ["h", "hr"],
      ["q", "h", "q"],
      ["q", "q", "qr", "q"],
      ["qr", "q", "h"],
      ["h", "q", "qr"],
      ["q", "h", "qr"],
      ["qr", "h", "q"],
      ["q", "qr", "h"],
      ["h", "q", "q"],
      ["w"],
      ["h", "q", "q"],
      ["q", "q", "h"],
      ["h", "hr"],
    ],
  },
  {
    id: 2,
    title: "Ejercicio 2",
    description: "Negras y silencios de negra con combinaciones regulares.",
    measures: [
      ["q", "q", "q", "q"],
      ["q", "q", "qr", "q"],
      ["q", "qr", "q", "q"],
      ["qr", "q", "q", "q"],
      ["q", "qr", "q", "qr"],
      ["qr", "q", "qr", "q"],
      ["q", "q", "qr", "qr"],
      ["h", "q", "qr"],
      ["qr", "q", "h"],
      ["q", "hr", "q"],
      ["q", "q", "h"],
      ["h", "qr", "q"],
      ["qr", "h", "q"],
      ["q", "qr", "h"],
      ["q", "q", "q", "qr"],
      ["h", "h"],
      ["q", "q", "qr", "q"],
      ["h", "qr", "q"],
      ["q", "hr", "q"],
      ["h", "q", "q"],
    ],
  },
  {
    id: 3,
    title: "Ejercicio 3",
    description: "Introducción de dobles corcheas dentro de 4/4.",
    measures: [
      ["h", "q", "q"],
      ["q", "q", "h"],
      ["h", "h"],
      ["q", "qr", "h"],
      ["hr", "q", "q"],
      ["q", "q", "qr", "q"],
      ["8", "8", "8", "8", "q", "q"],
      ["h", "8", "8", "q"],
      ["8", "8", "q", "8", "8", "q"],
      ["q", "8", "8", "q", "8", "8"],
      ["h", "8", "8", "8", "8"],
      ["8", "8", "q", "q", "q"],
      ["q", "8", "8", "h"],
      ["q", "h", "q"],
      ["qr", "q", "h"],
      ["q", "q", "h"],
      ["8", "8", "q", "8", "8", "q"],
      ["h", "q", "q"],
      ["8", "8", "8", "8", "h"],
      ["h", "8", "8", "q"],
    ],
  },
  {
    id: 4,
    title: "Ejercicio 4",
    description: "Fluidez con corcheas y cambios de acento en compás simple.",
    measures: [
      ["q", "8", "8", "q", "8", "8"],
      ["8", "8", "q", "8", "8", "q"],
      ["q", "8", "8", "h"],
      ["h", "8", "8", "q"],
      ["8", "8", "8", "8", "q", "q"],
      ["q", "q", "8", "8", "8", "8"],
      ["8", "8", "q", "q", "8", "8"],
      ["q", "8", "8", "q", "q"],
      ["h", "q", "q"],
      ["q", "q", "h"],
      ["8", "8", "q", "8", "8", "q"],
      ["q", "8", "8", "q", "8", "8"],
      ["h", "8", "8", "q"],
      ["q", "8", "8", "h"],
      ["8", "8", "8", "8", "h"],
      ["h", "q", "q"],
      ["q", "q", "8", "8", "8", "8"],
      ["8", "8", "q", "q", "8", "8"],
      ["q", "8", "8", "q", "q"],
      ["h", "h"],
    ],
  },
];

let masterRef: Tone.Gain | null = null;
let clickRef: Tone.Synth | null = null;
let noteRef: Tone.Synth | null = null;

async function ensureAudio() {
  await Tone.start();
  if (!masterRef) {
    masterRef = new Tone.Gain(1).toDestination();
  }
  if (!clickRef) {
    clickRef = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.05 },
    }).connect(masterRef!);
  }
  if (!noteRef) {
    noteRef = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.06 },
    }).connect(masterRef!);
  }
}

function mountCleanTarget(host: HTMLDivElement, id: string) {
  let target = host.querySelector<HTMLDivElement>(`#${id}`);
  if (!target) {
    target = document.createElement("div");
    target.id = id;
    host.replaceChildren(target);
  } else {
    target.replaceChildren();
  }
}

function createBeamGroups(notes: StaveNote[]) {
  const beams: Beam[] = [];
  let current: StaveNote[] = [];

  const flush = () => {
    if (current.length > 1) {
      beams.push(new Beam(current));
    }
    current = [];
  };

  notes.forEach((note, index) => {
    const beamCount =
      typeof note.getBeamCount === "function" ? note.getBeamCount() : 0;
    const isRest =
      typeof (note as any).isRest === "function"
        ? (note as any).isRest()
        : note.getDuration().includes("r");
    if (beamCount === 0 || isRest) {
      flush();
      return;
    }
    current.push(note);
    const next = notes[index + 1];
    if (!next) {
      flush();
      return;
    }
    const nextBeamCount =
      typeof next.getBeamCount === "function" ? next.getBeamCount() : 0;
    const nextIsRest =
      typeof (next as any).isRest === "function"
        ? (next as any).isRest()
        : next.getDuration().includes("r");
    if (nextBeamCount !== beamCount || nextIsRest) {
      flush();
    }
  });

  flush();
  return beams;
}

function validateMeasure(measure: Duration[]) {
  const sum = measure.reduce((acc, d) => acc + (DUR_TO_BEATS[d] || 0), 0);
  return Math.abs(sum - 4) < 1e-6;
}

function cloneMeasure(measure: Duration[]) {
  return [...measure] as Duration[];
}

function randomFrom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffleArray<T>(items: readonly T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function durationToVex(duration: Duration) {
  const token = TOKEN_BY_ID[duration];
  return {
    duration: token.kind === "rest" ? `${token.vexBase}r` : token.vexBase,
    dots: token.dots,
  };
}

function isRestDuration(duration: Duration) {
  return TOKEN_BY_ID[duration].kind === "rest";
}

function buildPaletteMeasure(
  enabledNotes: Duration[],
  enabledRests: Duration[],
): Duration[] {
  const allEnabled = [...enabledNotes, ...enabledRests].filter(
    (id) => TOKEN_BY_ID[id],
  );
  if (!allEnabled.length) return ["q", "q", "q", "q"];

  const targetHalfBeats = 8;
  const maxDepth = 16;
  const needsAtLeastOneNote = enabledNotes.length > 0;
  const weightedPool = allEnabled.flatMap((id) =>
    TOKEN_BY_ID[id].kind === "note" ? [id, id, id] : [id],
  );

  const measure: Duration[] = [];
  let solved = false;

  const search = (
    remainingHalfBeats: number,
    hasNote: boolean,
    depth: number,
  ) => {
    if (remainingHalfBeats === 0) {
      return !needsAtLeastOneNote || hasNote;
    }
    if (depth >= maxDepth) return false;

    const available = shuffleArray(weightedPool).filter((id) => {
      const halfBeats = Math.round(DUR_TO_BEATS[id] * 2);
      return halfBeats <= remainingHalfBeats;
    });

    for (const duration of available) {
      const halfBeats = Math.round(DUR_TO_BEATS[duration] * 2);
      measure.push(duration);
      const nextHasNote = hasNote || !isRestDuration(duration);
      if (search(remainingHalfBeats - halfBeats, nextHasNote, depth + 1)) {
        return true;
      }
      measure.pop();
    }

    return false;
  };

  for (let attempt = 0; attempt < 24 && !solved; attempt += 1) {
    measure.length = 0;
    solved = search(targetHalfBeats, false, 0);
  }

  if (!solved) return ["q", "q", "q", "q"];
  return [...measure];
}

function generatePaletteExercise(
  count: number,
  enabledNotes: Duration[],
  enabledRests: Duration[],
) {
  return Array.from({ length: count }, () =>
    buildPaletteMeasure(enabledNotes, enabledRests),
  );
}

const VARIANT_POOLS: Record<number, Duration[][]> = {
  1: [
    ["w"],
    ["h", "h"],
    ["h", "q", "q"],
    ["q", "q", "h"],
    ["q", "q", "q", "q"],
    ["h", "hr"],
    ["h", "qr", "q"],
    ["q", "qr", "q", "q"],
    ["q", "q", "qr", "q"],
    ["qr", "q", "h"],
    ["q", "h", "qr"],
    ["qr", "h", "q"],
  ] as Duration[][],
  2: [
    ["q", "q", "q", "q"],
    ["q", "q", "qr", "q"],
    ["q", "qr", "q", "q"],
    ["qr", "q", "q", "q"],
    ["q", "qr", "q", "qr"],
    ["qr", "q", "qr", "q"],
    ["q", "q", "qr", "qr"],
    ["q", "hr", "q"],
    ["h", "q", "q"],
    ["h", "qr", "q"],
    ["q", "q", "h"],
    ["hr", "q", "q"],
  ] as Duration[][],
  3: [
    ["h", "q", "q"],
    ["q", "q", "h"],
    ["h", "h"],
    ["q", "qr", "h"],
    ["8", "8", "q", "q", "q"],
    ["q", "8", "8", "h"],
    ["h", "8", "8", "q"],
    ["8", "8", "8", "8", "q", "q"],
    ["q", "8", "8", "q", "8", "8"],
    ["8", "8", "q", "8", "8", "q"],
    ["8", "8", "8", "8", "h"],
    ["qr", "q", "h"],
  ] as Duration[][],
  4: [
    ["q", "8", "8", "q", "8", "8"],
    ["8", "8", "q", "8", "8", "q"],
    ["q", "8", "8", "h"],
    ["h", "8", "8", "q"],
    ["8", "8", "8", "8", "q", "q"],
    ["q", "q", "8", "8", "8", "8"],
    ["8", "8", "q", "q", "8", "8"],
    ["q", "8", "8", "q", "q"],
    ["h", "q", "q"],
    ["q", "q", "h"],
    ["8", "8", "8", "8", "h"],
    ["h", "h"],
  ] as Duration[][],
};

function generateExerciseVariant(
  exerciseId: number,
  count: number,
): Duration[][] {
  const pool = VARIANT_POOLS[exerciseId] || VARIANT_POOLS[1];
  return Array.from({ length: count }, (_, index) => {
    // Fuerza algunas referencias estructurales al inicio y cierre para que "se sienta" como ejercicio.
    if (index === 0 && exerciseId <= 2) return cloneMeasure(["w"]);
    if (index === count - 1 && exerciseId >= 3) return cloneMeasure(["h", "h"]);
    return cloneMeasure(randomFrom(pool));
  });
}

function chunkMeasures(measures: Duration[][], size: number) {
  const rows: { startIndex: number; measures: Duration[][] }[] = [];
  for (let i = 0; i < measures.length; i += size) {
    rows.push({ startIndex: i, measures: measures.slice(i, i + size) });
  }
  return rows;
}

function RhythmSystemRow({
  startIndex,
  measures,
  showNotes,
  highlightVisible,
  currentMeasure,
  activeMeasure,
  onSelectMeasure,
}: {
  startIndex: number;
  measures: Duration[][];
  showNotes: boolean;
  highlightVisible: boolean;
  currentMeasure: number;
  activeMeasure: number | null;
  onSelectMeasure: (index: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(`vf-rm-${Math.random().toString(36).slice(2)}`);
  const isFirstSystem = startIndex === 0;
  const measureWidths = useMemo(
    () =>
      measures.map((_, localIdx) =>
        isFirstSystem && localIdx === 0 ? 230 : 182,
      ),
    [isFirstSystem, measures],
  );
  const leftOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (const w of measureWidths) {
      offsets.push(acc);
      acc += w;
    }
    return offsets;
  }, [measureWidths]);
  const canvasWidth = useMemo(
    () => measureWidths.reduce((a, b) => a + b, 0) + 22,
    [measureWidths],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    mountCleanTarget(host, idRef.current);

    const width = canvasWidth;
    const height = 120;
    const vf = new Factory({
      renderer: { elementId: idRef.current, width, height },
    });
    const ctx = vf.getContext();
    let x = 10;

    measures.forEach((measure, localIndex) => {
      const globalIndex = startIndex + localIndex;
      const staveWidth = measureWidths[localIndex];
      const stave = new Stave(x, 28, staveWidth);
      if (globalIndex === 0) {
        stave.addClef("treble").addTimeSignature("4/4");
      }
      stave.setContext(ctx).draw();

      if (showNotes) {
        const safeDurations = validateMeasure(measure)
          ? measure
          : (["q", "q", "q", "q"] as Duration[]);
        try {
          const notes = safeDurations.map((d) => {
            const parsed = durationToVex(d);
            const note = new StaveNote({
              clef: "treble",
              keys: ["b/4"],
              duration: parsed.duration,
            });
            if (parsed.dots > 0) {
              note.addDotToAll();
            }
            return note;
          });
          const voice = new Voice({ num_beats: 4, beat_value: 4 });
          if (typeof (voice as any).setStrict === "function") {
            (voice as any).setStrict(false);
          } else if ((Voice as any).Mode) {
            (voice as any).setMode((Voice as any).Mode.SOFT);
          }
          voice.addTickables(notes);

          // El primer compás del primer sistema necesita espacio extra por clave y compás.
          const formatWidth =
            globalIndex === 0 ? staveWidth - 92 : staveWidth - 16;
          new Formatter({ align_rests: true })
            .joinVoices([voice])
            .format([voice], Math.max(48, formatWidth));
          voice.draw(ctx, stave);
          createBeamGroups(notes).forEach((b) => b.setContext(ctx).draw());
        } catch (error) {
          console.warn("Error renderizando compás:", error);
        }
      }

      x += staveWidth;
    });
  }, [canvasWidth, measureWidths, measures, showNotes, startIndex]);

  return (
    <Paper variant="outlined" sx={{ p: 1, minWidth: canvasWidth + 16 }}>
      <Box
        sx={{
          position: "relative",
          width: canvasWidth,
          height: 122,
          mx: "auto",
        }}
      >
        <div ref={hostRef} />
        {measures.map((_, localIndex) => {
          const globalIndex = startIndex + localIndex;
          const left = 10 + leftOffsets[localIndex];
          const boxWidth = measureWidths[localIndex];
          const highlighted =
            highlightVisible &&
            (activeMeasure === globalIndex || currentMeasure === globalIndex);

          return (
            <Box
              key={`overlay-${globalIndex}`}
              onClick={() => onSelectMeasure(globalIndex)}
              sx={{
                position: "absolute",
                left,
                top: 0,
                width: boxWidth,
                height: 116,
                cursor: "pointer",
                borderRadius: 1,
                border: highlighted
                  ? "2px solid #ff6b35"
                  : "2px solid transparent",
                backgroundColor: highlighted
                  ? "rgba(255,107,53,.08)"
                  : "transparent",
                transition: "all .12s ease",
                "&:hover": {
                  backgroundColor: highlighted
                    ? "rgba(255,107,53,.10)"
                    : "rgba(0,0,0,.03)",
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                {globalIndex + 1}
              </Typography>
              {!showNotes && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: "20px 0 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 28,
                    color: "rgba(0,0,0,.30)",
                    pointerEvents: "none",
                  }}
                >
                  ?
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export default function RitmicaMetricaBaqueiro() {
  const navigate = useNavigate();
  const timeoutsRef = useRef<number[]>([]);

  const [exerciseId, setExerciseId] = useState(1);
  const [currentMeasure, setCurrentMeasure] = useState(0);
  const [bpm, setBpm] = useState(72);
  const [repeats, setRepeats] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMeasure, setActiveMeasure] = useState<number | null>(null);
  const [activeBeat, setActiveBeat] = useState<number | null>(null);
  const [showNotationInPractice, setShowNotationInPractice] = useState(true);

  const [questionMode, setQuestionMode] = useState(false);
  const [questionInfinite, setQuestionInfinite] = useState(false);
  const [questionMeasure, setQuestionMeasure] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(true);
  const [generatedMeasures, setGeneratedMeasures] = useState<
    Duration[][] | null
  >(null);
  const [generatedMode, setGeneratedMode] = useState<
    "book" | "variant" | "palette"
  >("book");
  const [paletteEnabled, setPaletteEnabled] = useState(false);
  const [solfeoVoiceEnabled, setSolfeoVoiceEnabled] = useState(false);
  const [solfeoIncludeRests, setSolfeoIncludeRests] = useState(false);
  const [selectedFigureSet, setSelectedFigureSet] = useState<Duration[]>([
    "h",
    "qd",
    "q",
    "8",
  ]);
  const [selectedRestSet, setSelectedRestSet] = useState<Duration[]>(["qr"]);

  const selectedExercise = useMemo(
    () => EXERCISES.find((e) => e.id === exerciseId) || EXERCISES[0],
    [exerciseId],
  );

  const displayMeasures = generatedMeasures ?? selectedExercise.measures;
  const rows = useMemo(
    () => chunkMeasures(displayMeasures, 5),
    [displayMeasures],
  );
  const measureCount = displayMeasures.length;
  const hasAnyPaletteToken =
    selectedFigureSet.length > 0 || selectedRestSet.length > 0;
  const paletteSummary = useMemo(() => {
    const items = [...selectedFigureSet, ...selectedRestSet]
      .map((id) => TOKEN_BY_ID[id]?.shortLabel)
      .filter(Boolean);
    return items.length ? items.join(" · ") : "Sin figuras seleccionadas";
  }, [selectedFigureSet, selectedRestSet]);
  const notesVisible = questionMode ? showAnswer : showNotationInPractice;
  const highlightVisible = !questionMode || showAnswer;

  const clearPlayback = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveMeasure(null);
    setActiveBeat(null);
  }, []);

  useEffect(() => {
    return () => clearPlayback();
  }, [clearPlayback]);

  useEffect(() => {
    clearPlayback();
    setCurrentMeasure(0);
    setQuestionMode(false);
    setQuestionMeasure(null);
    setShowAnswer(true);
    setGeneratedMeasures(null);
    setGeneratedMode("book");
  }, [exerciseId, clearPlayback]);

  const togglePaletteDuration = useCallback(
    (duration: Duration, kind: "note" | "rest") => {
      if (kind === "note") {
        setSelectedFigureSet((prev) =>
          prev.includes(duration)
            ? prev.filter((item) => item !== duration)
            : [...prev, duration],
        );
      } else {
        setSelectedRestSet((prev) =>
          prev.includes(duration)
            ? prev.filter((item) => item !== duration)
            : [...prev, duration],
        );
      }
    },
    [],
  );

  const generateFromPalette = useCallback(() => {
    if (!hasAnyPaletteToken) return;
    clearPlayback();
    setQuestionMode(false);
    setQuestionMeasure(null);
    setShowAnswer(true);
    setCurrentMeasure(0);
    setGeneratedMeasures(
      generatePaletteExercise(
        selectedExercise.measures.length,
        selectedFigureSet,
        selectedRestSet,
      ),
    );
    setGeneratedMode("palette");
  }, [
    clearPlayback,
    hasAnyPaletteToken,
    selectedExercise.measures.length,
    selectedFigureSet,
    selectedRestSet,
  ]);

  const speakSolfegeAt = useCallback(
    (duration: Duration, timeInSeconds: number) => {
      if (!solfeoVoiceEnabled) return;
      const token = TOKEN_BY_ID[duration];
      if (!token) return;
      if (token.kind === "rest" && !solfeoIncludeRests) return;
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      const timer = window.setTimeout(
        () => {
          const utterance = new SpeechSynthesisUtterance(token.solfege);
          utterance.lang = "es-MX";
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 0.9;
          window.speechSynthesis.speak(utterance);
        },
        Math.max(0, timeInSeconds * 1000),
      );
      timeoutsRef.current.push(timer);
    },
    [solfeoIncludeRests, solfeoVoiceEnabled],
  );

  const playSequence = useCallback(
    async (indexes: number[], loopCount = 1) => {
      if (!indexes.length) return;
      await ensureAudio();
      clearPlayback();
      setIsPlaying(true);

      const secondsPerBeat = 60 / Math.max(30, Math.min(240, bpm));
      const loops = Math.max(1, Math.min(8, loopCount));
      let acc = 0;

      for (let beat = 0; beat < 4; beat++) {
        const timer = window.setTimeout(
          () => {
            clickRef?.triggerAttackRelease(beat === 0 ? "A5" : "F5", "16n");
            setActiveBeat(beat);
            setActiveMeasure(null);
          },
          (acc + beat * secondsPerBeat) * 1000,
        );
        timeoutsRef.current.push(timer);
      }
      acc += secondsPerBeat * 4;

      for (let rep = 0; rep < loops; rep++) {
        for (const measureIndex of indexes) {
          const measure = displayMeasures[measureIndex] || ["q", "q", "q", "q"];
          const measureStart = acc;

          const startTimer = window.setTimeout(() => {
            setActiveMeasure(measureIndex);
          }, measureStart * 1000);
          timeoutsRef.current.push(startTimer);

          for (let beat = 0; beat < 4; beat++) {
            const timer = window.setTimeout(
              () => {
                clickRef?.triggerAttackRelease(beat === 0 ? "A5" : "F5", "16n");
                setActiveBeat(beat);
                setActiveMeasure(measureIndex);
              },
              (measureStart + beat * secondsPerBeat) * 1000,
            );
            timeoutsRef.current.push(timer);
          }

          let measureOffset = 0;
          measure.forEach((dur) => {
            const durSecs = (DUR_TO_BEATS[dur] || 1) * secondsPerBeat;
            if (!isRestDuration(dur)) {
              const timer = window.setTimeout(
                () => {
                  noteRef?.triggerAttackRelease(
                    "C4",
                    Math.max(0.06, durSecs * 0.88),
                  );
                },
                (measureStart + measureOffset) * 1000,
              );
              timeoutsRef.current.push(timer);
            }
            speakSolfegeAt(dur, measureStart + measureOffset);
            measureOffset += durSecs;
          });

          acc += secondsPerBeat * 4;
        }
        acc += secondsPerBeat * 0.6;
      }

      const endTimer = window.setTimeout(() => {
        setIsPlaying(false);
        setActiveMeasure(null);
        setActiveBeat(null);
      }, acc * 1000);
      timeoutsRef.current.push(endTimer);
    },
    [bpm, clearPlayback, displayMeasures, speakSolfegeAt],
  );

  const startQuestionRound = useCallback(() => {
    if (!measureCount) return;
    const randomIndex = Math.floor(Math.random() * measureCount);
    setQuestionMode(true);
    setShowAnswer(false);
    setQuestionMeasure(randomIndex);
    setCurrentMeasure(randomIndex);
    void playSequence([randomIndex], 1);
  }, [measureCount, playSequence]);

  useEffect(() => {
    if (!questionMode || !questionInfinite || showAnswer || isPlaying) return;
    const timer = window.setTimeout(() => {
      startQuestionRound();
    }, 450);
    return () => clearTimeout(timer);
  }, [
    isPlaying,
    questionInfinite,
    questionMode,
    showAnswer,
    startQuestionRound,
  ]);

  return (
    <Box sx={{ width: "100%", px: 2, pb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
        >
          Volver al menú
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0b2a50" }}>
          Rítmica y Métrica (inspirado en Baqueiro/Foster)
        </Typography>
      </Stack>

      <Paper sx={{ p: 2.25, mb: 2 }}>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Ejercicio</InputLabel>
            <Select
              label="Ejercicio"
              value={exerciseId}
              onChange={(e) => setExerciseId(Number(e.target.value))}
            >
              {EXERCISES.map((exercise) => (
                <MenuItem key={exercise.id} value={exercise.id}>
                  {exercise.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="number"
            label="BPM"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value) || 72)}
            inputProps={{ min: 30, max: 240, step: 1 }}
            sx={{ width: 110 }}
          />

          <TextField
            size="small"
            type="number"
            label="Repeticiones"
            value={repeats}
            onChange={(e) =>
              setRepeats(Math.max(1, Math.min(8, Number(e.target.value) || 1)))
            }
            inputProps={{ min: 1, max: 8, step: 1 }}
            sx={{ width: 130 }}
          />

          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            disabled={isPlaying}
            onClick={() =>
              void playSequence([...Array(measureCount).keys()], repeats)
            }
          >
            Escuchar ejercicio
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayArrow />}
            disabled={isPlaying}
            onClick={() => void playSequence([currentMeasure], repeats)}
          >
            Escuchar compás
          </Button>

          <Button
            variant="outlined"
            color="warning"
            startIcon={<Pause />}
            onClick={clearPlayback}
          >
            Pausar
          </Button>

          <Button
            variant="outlined"
            color="success"
            startIcon={<Shuffle />}
            disabled={isPlaying || (paletteEnabled && !hasAnyPaletteToken)}
            onClick={() => {
              clearPlayback();
              setQuestionMode(false);
              setQuestionMeasure(null);
              setShowAnswer(true);
              setCurrentMeasure(0);
              if (paletteEnabled) {
                setGeneratedMeasures(
                  generatePaletteExercise(
                    selectedExercise.measures.length,
                    selectedFigureSet,
                    selectedRestSet,
                  ),
                );
                setGeneratedMode("palette");
              } else {
                setGeneratedMeasures(
                  generateExerciseVariant(exerciseId, measureCount),
                );
                setGeneratedMode("variant");
              }
            }}
          >
            {paletteEnabled ? "Generar con paleta" : "Nuevo ejercicio"}
          </Button>

          <Button
            variant="text"
            disabled={!generatedMeasures}
            onClick={() => {
              setGeneratedMeasures(null);
              setGeneratedMode("book");
            }}
          >
            Volver al libro
          </Button>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
          sx={{ mt: 1.25 }}
        >
          <Button
            variant="outlined"
            disabled={currentMeasure <= 0}
            onClick={() => setCurrentMeasure((v) => Math.max(0, v - 1))}
          >
            Compás anterior
          </Button>
          <Button
            variant="outlined"
            disabled={currentMeasure >= measureCount - 1}
            onClick={() =>
              setCurrentMeasure((v) => Math.min(measureCount - 1, v + 1))
            }
          >
            Compás siguiente
          </Button>
          <Chip label={`Compás seleccionado: ${currentMeasure + 1}`} />
          <Chip
            icon={<RestartAlt />}
            label={`${measureCount} compases`}
            variant="outlined"
          />
          <Chip label={`${bpm} BPM`} variant="outlined" />
          <Chip
            color={generatedMode === "book" ? "default" : "success"}
            label={
              generatedMode === "book"
                ? "Versión del libro"
                : generatedMode === "palette"
                  ? "Generado por paleta"
                  : "Variación generada"
            }
            variant={generatedMode === "book" ? "outlined" : "filled"}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
          sx={{ mt: 1.25 }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={paletteEnabled}
                onChange={(e) => setPaletteEnabled(e.target.checked)}
              />
            }
            label="Usar paleta personalizada"
          />

          <FormControlLabel
            control={
              <Switch
                checked={solfeoVoiceEnabled}
                onChange={(e) => setSolfeoVoiceEnabled(e.target.checked)}
              />
            }
            label="Narrar solfeo (ta, ta-o...)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={solfeoIncludeRests}
                onChange={(e) => setSolfeoIncludeRests(e.target.checked)}
                disabled={!solfeoVoiceEnabled}
              />
            }
            label="Narrar silencios"
          />
        </Stack>

        {paletteEnabled && (
          <Paper
            variant="outlined"
            sx={{ mt: 1.25, p: 1.25, borderStyle: "dashed" }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8 }}>
              Paleta de figuras y silencios (4/4)
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Selecciona qué valores quieres practicar. Ejemplo: activa{" "}
              <strong>Negra con puntillo</strong> + <strong>Corchea</strong>{" "}
              para trabajar esa célula.
            </Typography>

            <Typography sx={{ mt: 1, mb: 0.35, fontSize: 13, fontWeight: 700 }}>
              Figuras
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {FIGURE_TOKENS.map((token) => {
                const isActive = selectedFigureSet.includes(token.id);
                return (
                  <Chip
                    key={`fig-${token.id}`}
                    clickable
                    color={isActive ? "primary" : "default"}
                    variant={isActive ? "filled" : "outlined"}
                    label={`${token.shortLabel} · ${token.solfege}`}
                    onClick={() => togglePaletteDuration(token.id, "note")}
                  />
                );
              })}
            </Stack>

            <Typography
              sx={{ mt: 1.1, mb: 0.35, fontSize: 13, fontWeight: 700 }}
            >
              Silencios
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {REST_TOKENS.map((token) => {
                const isActive = selectedRestSet.includes(token.id);
                return (
                  <Chip
                    key={`rest-${token.id}`}
                    clickable
                    color={isActive ? "secondary" : "default"}
                    variant={isActive ? "filled" : "outlined"}
                    label={token.shortLabel}
                    onClick={() => togglePaletteDuration(token.id, "rest")}
                  />
                );
              })}
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              alignItems="center"
              sx={{ mt: 1.1 }}
            >
              <Chip label={`Selección: ${paletteSummary}`} />
              <Button
                size="small"
                variant="contained"
                startIcon={<Shuffle />}
                disabled={!hasAnyPaletteToken || isPlaying}
                onClick={generateFromPalette}
              >
                Generar paleta
              </Button>
            </Stack>
          </Paper>
        )}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
          sx={{ mt: 1.25 }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showNotationInPractice}
                onChange={(e) => setShowNotationInPractice(e.target.checked)}
              />
            }
            label="Mostrar partitura (modo normal)"
          />

          <FormControlLabel
            control={
              <Switch
                checked={questionInfinite}
                onChange={(e) => setQuestionInfinite(e.target.checked)}
              />
            }
            label="Pregunta infinita"
          />

          <Button
            variant="contained"
            color="warning"
            startIcon={<Shuffle />}
            onClick={startQuestionRound}
          >
            Pregunta aleatoria
          </Button>

          <Button
            variant="outlined"
            startIcon={showAnswer ? <VisibilityOff /> : <Visibility />}
            disabled={!questionMode}
            onClick={() => setShowAnswer((v) => !v)}
          >
            {showAnswer ? "Ocultar respuesta" : "Mostrar respuesta"}
          </Button>

          <Button
            variant="outlined"
            disabled={!questionMode}
            onClick={() => {
              setQuestionMode(false);
              setQuestionMeasure(null);
              setShowAnswer(true);
            }}
          >
            Salir de pregunta
          </Button>
        </Stack>

        <Typography variant="body2" sx={{ mt: 1.5, color: "text.secondary" }}>
          {paletteEnabled
            ? `Paleta activa: ${paletteSummary}. Los compases nuevos solo usarán estas figuras/silencios.`
            : selectedExercise.description}
        </Typography>
      </Paper>

      {isPlaying && (
        <Paper
          sx={{ p: 1.25, mb: 2, backgroundColor: "rgba(33, 150, 243, .08)" }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Pulso:
            </Typography>
            {[0, 1, 2, 3].map((beat) => (
              <Box
                key={beat}
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: activeBeat === beat ? "#1976d2" : "#d6d6d6",
                  color: activeBeat === beat ? "white" : "#444",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {beat + 1}
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      <Box sx={{ overflowX: "auto", pb: 1 }}>
        <Stack spacing={1.25} sx={{ minWidth: 980 }}>
          {rows.map((row) => (
            <RhythmSystemRow
              key={`row-${selectedExercise.id}-${row.startIndex}-${generatedMeasures ? "gen" : "base"}`}
              startIndex={row.startIndex}
              measures={row.measures}
              showNotes={notesVisible}
              highlightVisible={highlightVisible}
              currentMeasure={isPlaying ? -1 : currentMeasure}
              activeMeasure={activeMeasure}
              onSelectMeasure={(index) => setCurrentMeasure(index)}
            />
          ))}
        </Stack>
      </Box>

      {questionMode && (
        <Paper
          sx={{
            p: 1.25,
            mt: 2,
            border: "1px dashed #ff9800",
            background: "rgba(255,152,0,.08)",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Modo pregunta activo
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Notación y resaltado naranja ocultos hasta mostrar respuesta.
            {questionMeasure != null
              ? ` Último compás preguntado: ${questionMeasure + 1}.`
              : ""}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
