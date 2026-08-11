import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowBack,
  GraphicEq,
  Pause,
  PlayArrow,
  Remove,
  Add,
  RestartAlt,
  CheckCircle,
  RadioButtonUnchecked,
  NavigateBefore,
  NavigateNext,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as Tone from "tone";

type MeterId = "4/4" | "3/4" | "6/8";
type Level = "Inicio" | "Intermedio" | "Reto";
type StageId = "fundamentos" | "control" | "compases" | "grooves";
type PatternToken =
  | "R"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "b7"
  | "8"
  | "G"
  | "H"
  | "-";

type Groove = {
  id: string;
  name: string;
  feel: string;
  stage: StageId;
  meter: MeterId;
  level: Level;
  description: string;
  tip: string;
  counting: string;
  recommendedBpm: number;
  subdivisionsPerPulse: number;
  stepUnit: "16n" | "8n" | "8t";
  bars: [PatternToken[], PatternToken[]];
};

const splitPattern = (pattern: string) =>
  pattern.trim().split(/\s+/) as PatternToken[];

const STAGES: Array<{
  id: StageId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
}> = [
  {
    id: "fundamentos",
    label: "Nivel 1 · Fundamentos",
    shortLabel: "Fundamentos",
    description: "Pulso, duración, silencios y subdivisión.",
    color: "#0f766e",
  },
  {
    id: "control",
    label: "Nivel 2 · Control rítmico",
    shortLabel: "Control",
    description: "Contratiempos, anticipaciones y precisión.",
    color: "#b45309",
  },
  {
    id: "compases",
    label: "Nivel 3 · Otros compases",
    shortLabel: "Compases",
    description: "Aprende a sentir 3/4 y 6/8 sin perder el pulso.",
    color: "#2563eb",
  },
  {
    id: "grooves",
    label: "Nivel 4 · Grooves",
    shortLabel: "Grooves",
    description: "Aplica las bases en rock, blues, jazz y funk.",
    color: "#be123c",
  },
];

const GROOVES: Groove[] = [
  {
    id: "quarter-pulse",
    name: "Pulso en negras",
    feel: "Base 1",
    stage: "fundamentos",
    meter: "4/4",
    level: "Inicio",
    description:
      "Una nota en cada pulso. Esta es la base para no correr ni quedarse atrás.",
    tip: "Cuenta en voz alta y mueve el pie. Toca exactamente al mismo tiempo que el click.",
    counting: "1 · 2 · 3 · 4",
    recommendedBpm: 60,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R H H H R H H H R H H H R H H H"),
      splitPattern("R H H H R H H H R H H H R H H H"),
    ],
  },
  {
    id: "long-note-values",
    name: "Redonda y blancas",
    feel: "Base 2",
    stage: "fundamentos",
    meter: "4/4",
    level: "Inicio",
    description:
      "Sostén primero una redonda de cuatro pulsos y después dos blancas de dos pulsos.",
    tip: "No vuelvas a atacar mientras aparece la línea verde: deja sonar la nota completa.",
    counting: "Redonda: 1–2–3–4 · Blancas: 1–2, 3–4",
    recommendedBpm: 56,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R H H H H H H H H H H H H H H H"),
      splitPattern("R H H H H H H H R H H H H H H H"),
    ],
  },
  {
    id: "quarter-rests",
    name: "Negras y silencios",
    feel: "Base 3",
    stage: "fundamentos",
    meter: "4/4",
    level: "Inicio",
    description:
      "Aprende que el silencio también tiene duración y debe sentirse por dentro.",
    tip: "Sigue contando durante los espacios grises. Silencio no significa perder el pulso.",
    counting: "1 (toca) · 2 (silencio) · 3 (toca) · 4 (silencio)",
    recommendedBpm: 60,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R H H H - - - - R H H H - - - -"),
      splitPattern("- - - - R H H H - - - - R H H H"),
    ],
  },
  {
    id: "eighth-subdivision",
    name: "Subdivisión en corcheas",
    feel: "Base 4",
    stage: "fundamentos",
    meter: "4/4",
    level: "Inicio",
    description:
      "Divide cada pulso en dos partes iguales y toca ocho notas por compás.",
    tip: "La palabra «y» debe caer justo a la mitad entre dos números.",
    counting: "1 y 2 y 3 y 4 y",
    recommendedBpm: 64,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R H R H R H R H R H R H R H R H"),
      splitPattern("R H R H 5 H R H R H 8 H 5 H R H"),
    ],
  },
  {
    id: "sixteenth-subdivision",
    name: "Subdivisión en semicorcheas",
    feel: "Base 5",
    stage: "fundamentos",
    meter: "4/4",
    level: "Intermedio",
    description:
      "Divide cada pulso en cuatro partes iguales antes de entrar a las síncopas.",
    tip: "Empieza muy lento. Si las cuatro notas no caben parejas, baja el tempo.",
    counting: "1 e y a · 2 e y a · 3 e y a · 4 e y a",
    recommendedBpm: 50,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R R R R R R R R R R R R R R R R"),
      splitPattern("R R 5 R R R 5 R 8 R 5 R R 5 R R"),
    ],
  },
  {
    id: "eighth-offbeats",
    name: "Contratiempos de corchea",
    feel: "Control 1",
    stage: "control",
    meter: "4/4",
    level: "Intermedio",
    description:
      "Toca en las «y» mientras mantienes los números únicamente en tu conteo.",
    tip: "No adivines el contratiempo: siente primero el número y coloca la nota después.",
    counting: "1 Y 2 Y 3 Y 4 Y · toca solamente las Y",
    recommendedBpm: 58,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("- - R H - - R H - - R H - - R H"),
      splitPattern("R H - - - - R H R H - - - - R H"),
    ],
  },
  {
    id: "rock-push",
    name: "Anticipaciones y síncopa",
    feel: "Control 2",
    stage: "control",
    meter: "4/4",
    level: "Intermedio",
    description:
      "Combina pulsos fuertes con notas que se adelantan al siguiente tiempo.",
    tip: "Haz cortas las notas antes de cada anticipación; deja respirar el silencio.",
    counting: "1 e y a · localiza cada ataque antes de tocar",
    recommendedBpm: 66,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R - - - R - R - 5 - - - R - R -"),
      splitPattern("R - - R - - 5 - R - - - 5 - R -"),
    ],
  },
  {
    id: "waltz-bass",
    name: "Sentir el 3/4",
    feel: "Vals",
    stage: "compases",
    meter: "3/4",
    level: "Inicio",
    description:
      "Tres pulsos por compás: fundamental fuerte y dos apoyos ligeros.",
    tip: "Acentúa el 1 y siente 2–3 más ligeros. No agregues un cuarto pulso.",
    counting: "1 · 2 · 3",
    recommendedBpm: 66,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R H H H 5 H H H 5 H H H"),
      splitPattern("R H R H 5 H H H 3 H H H"),
    ],
  },
  {
    id: "six-eight-drive",
    name: "Sentir el 6/8",
    feel: "Balada",
    stage: "compases",
    meter: "6/8",
    level: "Inicio",
    description:
      "Seis corcheas agrupadas en dos pulsos grandes: 1-2-3 y 4-5-6.",
    tip: "Marca con el pie solo 1 y 4, aunque cuentes las seis corcheas.",
    counting: "UNO 2 3 · CUATRO 5 6",
    recommendedBpm: 58,
    subdivisionsPerPulse: 3,
    stepUnit: "8n",
    bars: [splitPattern("R H R 5 H R"), splitPattern("R 5 H 8 H 5")],
  },
  {
    id: "rock-eighths",
    name: "Rock en corcheas",
    feel: "Rock",
    stage: "grooves",
    meter: "4/4",
    level: "Inicio",
    description:
      "Aplica las corcheas con cambios de fundamental, quinta y octava.",
    tip: "Alterna índice y medio. Busca que todas las notas duren y pesen igual.",
    counting: "1 y 2 y 3 y 4 y",
    recommendedBpm: 78,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R - R - R - R - R - R - R - R -"),
      splitPattern("R - R - 5 - R - 8 - 5 - R - R -"),
    ],
  },
  {
    id: "shuffle-blues",
    name: "Shuffle de blues",
    feel: "Blues",
    stage: "grooves",
    meter: "4/4",
    level: "Intermedio",
    description:
      "Cada pulso se divide en tres: largo–corto, con sensación ternaria.",
    tip: "Siente el espacio central antes del segundo ataque de cada pulso.",
    counting: "1-la-li · 2-la-li · 3-la-li · 4-la-li",
    recommendedBpm: 72,
    subdivisionsPerPulse: 3,
    stepUnit: "8t",
    bars: [
      splitPattern("R - R 5 - R R - R 5 - R"),
      splitPattern("R - 5 b7 - 5 R - R 5 - b7"),
    ],
  },
  {
    id: "walking-line",
    name: "Walking esencial",
    feel: "Jazz",
    stage: "grooves",
    meter: "4/4",
    level: "Intermedio",
    description:
      "Una nota por pulso con dirección melódica hacia la siguiente vuelta.",
    tip: "Deja caminar cada negra hasta la siguiente, sin cortar el sonido demasiado pronto.",
    counting: "1 · 2 · 3 · 4",
    recommendedBpm: 76,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R H H H 3 H H H 5 H H H 6 H H H"),
      splitPattern("b7 H H H 6 H H H 5 H H H 2 H H H"),
    ],
  },
  {
    id: "funk-pocket",
    name: "Síncopa con ghost notes",
    feel: "Funk",
    stage: "grooves",
    meter: "4/4",
    level: "Reto",
    description:
      "Contratiempos y notas fantasma para trabajar precisión y pocket.",
    tip: "Las × son ghost notes: apaga las cuerdas con la mano izquierda y ataca suave.",
    counting: "1 e y a · cuenta las 16 subdivisiones",
    recommendedBpm: 72,
    subdivisionsPerPulse: 4,
    stepUnit: "16n",
    bars: [
      splitPattern("R - - G - R - - 8 - G - 5 - R -"),
      splitPattern("R - 5 - - G R - - R - G 5 - - R"),
    ],
  },
];

const ROOTS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const ROOT_TO_BASS_NOTE: Record<string, string> = {
  C: "C2",
  Db: "Db2",
  D: "D2",
  Eb: "Eb2",
  E: "E2",
  F: "F2",
  Gb: "Gb2",
  G: "G2",
  Ab: "Ab1",
  A: "A1",
  Bb: "Bb1",
  B: "B1",
};

const TOKEN_TO_SEMITONES: Partial<Record<PatternToken, number>> = {
  R: 0,
  "2": 2,
  "3": 4,
  "4": 5,
  "5": 7,
  "6": 9,
  b7: 10,
  "8": 12,
};

const NOTE_LABELS_SHARP = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
];
const NOTE_LABELS_FLAT = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
const ROOT_SEMITONES: Record<string, number> = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11,
};

const LEVEL_COLOR: Record<Level, string> = {
  Inicio: "#0f766e",
  Intermedio: "#b45309",
  Reto: "#be123c",
};

const countLabel = (index: number, groove: Groove) => {
  if (groove.meter === "6/8") return String(index + 1);
  const part = index % groove.subdivisionsPerPulse;
  const beat = Math.floor(index / groove.subdivisionsPerPulse) + 1;
  if (part === 0) return String(beat);
  if (groove.subdivisionsPerPulse === 4) return ["", "e", "y", "a"][part];
  if (groove.subdivisionsPerPulse === 3) return ["", "la", "li"][part];
  return "+";
};

const tokenLabel = (token: PatternToken, root: string) => {
  if (token === "-" || token === "H") return "";
  if (token === "G") return "×";
  const semitones = TOKEN_TO_SEMITONES[token] ?? 0;
  const useFlats = root.includes("b") || root === "F";
  const labels = useFlats ? NOTE_LABELS_FLAT : NOTE_LABELS_SHARP;
  const label = labels[(ROOT_SEMITONES[root] + semitones) % 12];
  return semitones >= 12 ? `${label}↑` : label;
};

const sustainedStepCount = (bar: PatternToken[], startIndex: number) => {
  let steps = 1;
  while (bar[startIndex + steps] === "H") steps += 1;
  return steps;
};

function MeterBadge({ meter }: { meter: MeterId }) {
  const [top, bottom] = meter.split("/");
  return (
    <Box
      aria-label={`Compás de ${top} por ${bottom}`}
      sx={{
        width: 70,
        minWidth: 70,
        height: 86,
        borderRadius: 2.5,
        bgcolor: "#082f36",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 28px rgba(8, 47, 54, 0.18)",
      }}
    >
      <Typography
        sx={{
          fontSize: 34,
          fontWeight: 900,
          lineHeight: 0.82,
          fontFamily: "Georgia, serif",
        }}
      >
        {top}
      </Typography>
      <Typography
        sx={{
          fontSize: 34,
          fontWeight: 900,
          lineHeight: 0.82,
          fontFamily: "Georgia, serif",
        }}
      >
        {bottom}
      </Typography>
    </Box>
  );
}

function RhythmBar({
  groove,
  bar,
  barIndex,
  root,
  activeBar,
  activeStep,
  isPlaying,
}: {
  groove: Groove;
  bar: PatternToken[];
  barIndex: number;
  root: string;
  activeBar: number;
  activeStep: number;
  isPlaying: boolean;
}) {
  return (
    <Box sx={{ minWidth: { xs: 560, md: 0 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography
          variant="overline"
          sx={{ color: "#527078", fontWeight: 800, letterSpacing: 1.2 }}
        >
          Compás {barIndex + 1}
        </Typography>
        <Typography variant="caption" sx={{ color: "#6b7f84" }}>
          {barIndex === 0 ? "Pregunta" : "Respuesta"}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${bar.length}, minmax(28px, 1fr))`,
          border: "2px solid #173f46",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#fffdf7",
        }}
      >
        {bar.map((token, stepIndex) => {
          const isBeat = stepIndex % groove.subdivisionsPerPulse === 0;
          const isActive =
            isPlaying && activeBar === barIndex && activeStep === stepIndex;
          const isGhost = token === "G";
          const isRest = token === "-";
          const isHold = token === "H";
          return (
            <Box
              key={`${barIndex}-${stepIndex}`}
              sx={{
                minHeight: 98,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                py: 1,
                borderLeft:
                  stepIndex === 0
                    ? 0
                    : isBeat
                      ? "2px solid #7d999e"
                      : "1px solid #dce7e8",
                bgcolor: isActive
                  ? "#ffe5a8"
                  : isBeat
                    ? "rgba(8, 116, 106, 0.045)"
                    : "transparent",
                boxShadow: isActive ? "inset 0 -5px 0 #f59e0b" : "none",
                transition: "background-color 80ms ease",
              }}
            >
              <Typography
                aria-hidden="true"
                sx={{
                  fontSize: 11,
                  color: isBeat ? "#0f766e" : "#819398",
                  fontWeight: isBeat ? 900 : 700,
                }}
              >
                {countLabel(stepIndex, groove)}
              </Typography>
              <Box
                sx={{
                  width: isRest ? 8 : isHold ? 22 : isGhost ? 22 : 28,
                  height: isRest || isHold ? 3 : isGhost ? 22 : 28,
                  borderRadius: isGhost ? 1 : "50%",
                  bgcolor:
                    isRest || isHold
                      ? isHold
                        ? "#0f8a78"
                        : "#c6d1d3"
                      : isGhost
                        ? "transparent"
                        : "#0b3c45",
                  border: isGhost ? "2px solid #bb5e36" : "none",
                  color: "#bb5e36",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  fontSize: 18,
                  transform: isGhost ? "rotate(45deg)" : "none",
                }}
              >
                {isGhost ? (
                  <span style={{ transform: "rotate(-45deg)" }}>×</span>
                ) : null}
              </Box>
              <Typography
                sx={{
                  minHeight: 17,
                  fontSize: 11,
                  lineHeight: 1,
                  color: isGhost ? "#a54d2b" : "#34555c",
                  fontWeight: 800,
                }}
              >
                {isRest ? "" : tokenLabel(token, root)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default function BassRhythmLab() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(GROOVES[0].id);
  const [meterFilter, setMeterFilter] = useState<"Todos" | MeterId>("Todos");
  const [root, setRoot] = useState("E");
  const [bpm, setBpm] = useState(GROOVES[0].recommendedBpm);
  const [bassGuide, setBassGuide] = useState(true);
  const [metronome, setMetronome] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(-1);
  const [loops, setLoops] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem("bass-rhythm-progress");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? Array.from(
            new Set(
              parsed.filter((id) => GROOVES.some((item) => item.id === id)),
            ),
          )
        : [];
    } catch {
      return [];
    }
  });
  const bassSynthRef = useRef<Tone.MonoSynth | null>(null);
  const clickSynthRef = useRef<Tone.Synth | null>(null);
  const scheduleIdRef = useRef<number | null>(null);
  const sequenceIndexRef = useRef(0);
  const mountedRef = useRef(true);

  const groove = useMemo(
    () => GROOVES.find((item) => item.id === selectedId) ?? GROOVES[0],
    [selectedId],
  );
  const visibleGrooves = useMemo(
    () =>
      GROOVES.filter(
        (item) => meterFilter === "Todos" || item.meter === meterFilter,
      ),
    [meterFilter],
  );
  const stepsPerBar = groove.bars[0].length;
  const totalSteps = stepsPerBar * groove.bars.length;
  const activeBar = playhead >= 0 ? Math.floor(playhead / stepsPerBar) : -1;
  const activeStep = playhead >= 0 ? playhead % stepsPerBar : -1;
  const currentIndex = GROOVES.findIndex((item) => item.id === groove.id);
  const currentStage =
    STAGES.find((stage) => stage.id === groove.stage) ?? STAGES[0];
  const completionPercent = (completedIds.length / GROOVES.length) * 100;

  const stop = useCallback(() => {
    Tone.Transport.stop();
    if (scheduleIdRef.current !== null) {
      Tone.Transport.clear(scheduleIdRef.current);
      scheduleIdRef.current = null;
    }
    Tone.Transport.cancel(0);
    Tone.Transport.position = "0:0:0";
    sequenceIndexRef.current = 0;
    bassSynthRef.current?.triggerRelease();
    if (mountedRef.current) {
      setIsPlaying(false);
      setPlayhead(-1);
    }
  }, []);

  const ensureAudio = useCallback(async () => {
    await Tone.start();
    if (!bassSynthRef.current) {
      bassSynthRef.current = new Tone.MonoSynth({
        oscillator: { type: "triangle" },
        filter: { Q: 2, type: "lowpass", rolloff: -24 },
        envelope: { attack: 0.008, decay: 0.12, sustain: 0.32, release: 0.16 },
        filterEnvelope: {
          attack: 0.004,
          decay: 0.1,
          sustain: 0.2,
          release: 0.15,
          baseFrequency: 90,
          octaves: 2.2,
        },
        volume: -5,
      }).toDestination();
    }
    if (!clickSynthRef.current) {
      clickSynthRef.current = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.035, sustain: 0, release: 0.025 },
        volume: -11,
      }).toDestination();
    }
  }, []);

  const start = useCallback(async () => {
    stop();
    await ensureAudio();
    if (!mountedRef.current) return;

    const transportBpm = groove.meter === "6/8" ? bpm * 1.5 : bpm;
    Tone.Transport.bpm.value = transportBpm;
    Tone.Transport.timeSignature =
      groove.meter === "6/8" ? [6, 8] : [Number(groove.meter[0]), 4];
    sequenceIndexRef.current = 0;
    setLoops(0);
    setIsPlaying(true);

    scheduleIdRef.current = Tone.Transport.scheduleRepeat((time) => {
      const index = sequenceIndexRef.current;
      const barIndex = Math.floor(index / stepsPerBar);
      const stepIndex = index % stepsPerBar;
      const token = groove.bars[barIndex][stepIndex];
      const pulseStart = stepIndex % groove.subdivisionsPerPulse === 0;

      if (metronome && pulseStart) {
        const accent = barIndex === 0 && stepIndex === 0;
        clickSynthRef.current?.triggerAttackRelease(
          accent ? "C6" : "G5",
          "64n",
          time,
          accent ? 0.72 : 0.42,
        );
      }

      if (bassGuide && token !== "-" && token !== "H") {
        const ghost = token === "G";
        const semitones = ghost ? 0 : (TOKEN_TO_SEMITONES[token] ?? 0);
        const note = Tone.Frequency(ROOT_TO_BASS_NOTE[root])
          .transpose(semitones)
          .toNote();
        const durationSteps = ghost
          ? 1
          : sustainedStepCount(groove.bars[barIndex], stepIndex);
        const duration = ghost
          ? "64n"
          : Tone.Time(groove.stepUnit).toSeconds() * durationSteps * 0.92;
        bassSynthRef.current?.triggerAttackRelease(
          note,
          duration,
          time,
          ghost ? 0.16 : stepIndex === 0 ? 0.88 : 0.66,
        );
      }

      Tone.Draw.schedule(() => {
        if (!mountedRef.current) return;
        setPlayhead(index);
        if (index === totalSteps - 1) setLoops((value) => value + 1);
      }, time);

      sequenceIndexRef.current = (index + 1) % totalSteps;
    }, groove.stepUnit);

    Tone.Transport.start("+0.06");
  }, [
    bassGuide,
    bpm,
    ensureAudio,
    groove,
    metronome,
    root,
    stepsPerBar,
    stop,
    totalSteps,
  ]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) stop();
    else void start();
  }, [isPlaying, start, stop]);

  useEffect(() => {
    if (!isPlaying) return;
    const transportBpm = groove.meter === "6/8" ? bpm * 1.5 : bpm;
    Tone.Transport.bpm.rampTo(transportBpm, 0.08);
  }, [bpm, groove.meter, isPlaying]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.code !== "Space" ||
        ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName)
      )
        return;
      event.preventDefault();
      togglePlayback();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlayback]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "bass-rhythm-progress",
        JSON.stringify(completedIds),
      );
    } catch {}
  }, [completedIds]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      bassSynthRef.current?.dispose();
      clickSynthRef.current?.dispose();
      bassSynthRef.current = null;
      clickSynthRef.current = null;
    };
  }, []);

  const selectGroove = (id: string) => {
    if (id === selectedId) return;
    stop();
    setSelectedId(id);
    const selected = GROOVES.find((item) => item.id === id);
    if (selected) setBpm(selected.recommendedBpm);
    setLoops(0);
  };

  const toggleCompleted = () => {
    setCompletedIds((current) =>
      current.includes(groove.id)
        ? current.filter((id) => id !== groove.id)
        : [...current, groove.id],
    );
  };

  const goToRelativeExercise = (offset: number) => {
    const next = GROOVES[currentIndex + offset];
    if (next) selectGroove(next.id);
  };

  const meterExplanation =
    groove.meter === "6/8"
      ? "6 corcheas · 2 pulsos grandes"
      : `${groove.meter[0]} pulsos · la negra vale 1`;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f7f5", pb: 7 }}>
      <Box
        sx={{
          background:
            "linear-gradient(125deg, #062f36 0%, #0d5b5a 62%, #157f72 100%)",
          color: "white",
          pt: { xs: 2, md: 3 },
          pb: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="xl">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{
              color: "rgba(255,255,255,.84)",
              textTransform: "none",
              mb: { xs: 3, md: 5 },
            }}
          >
            Volver al inicio
          </Button>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            spacing={3}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Chip
                icon={<GraphicEq />}
                label="RUTA PROGRESIVA DE RITMO"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(255,255,255,.12)",
                  color: "white",
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              />
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "2.25rem", sm: "3.4rem", md: "4.6rem" },
                  lineHeight: 0.96,
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                }}
              >
                Ritmo que se ve.
                <Box
                  component="span"
                  sx={{ color: "#ffc857", display: "block" }}
                >
                  Groove que se siente.
                </Box>
              </Typography>
              <Typography
                sx={{
                  mt: 2.5,
                  color: "rgba(255,255,255,.78)",
                  fontSize: { xs: 16, md: 19 },
                  maxWidth: 650,
                }}
              >
                Empieza con pulso y figuras básicas. Avanza paso a paso hasta
                tocar líneas de bajo en rock, blues, jazz y funk.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ pb: 0.5 }}>
              {["4/4", "3/4", "6/8"].map((meter) => (
                <Box
                  key={meter}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,.18)",
                    bgcolor: "rgba(0,0,0,.1)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Georgia, serif",
                      fontWeight: 900,
                      fontSize: 20,
                    }}
                  >
                    {meter}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: -3, md: -4 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2, md: 3 },
            border: "1px solid #d8e5e2",
            boxShadow: "0 18px 48px rgba(20, 65, 66, .1)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={3}
            alignItems={{ xs: "stretch", lg: "center" }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ minWidth: 250 }}
            >
              <MeterBadge meter={groove.meter} />
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: "#0f766e", fontWeight: 900, letterSpacing: 1.2 }}
                >
                  COMPÁS ACTUAL
                </Typography>
                <Typography sx={{ color: "#173f46", fontWeight: 800 }}>
                  {meterExplanation}
                </Typography>
                <Typography variant="caption" sx={{ color: "#70878b" }}>
                  BPM ={" "}
                  {groove.meter === "6/8" ? "pulso con puntillo" : "negra"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#0f766e", display: "block", fontWeight: 800 }}
                >
                  Recomendado: {groove.recommendedBpm} BPM
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                flex: 1,
                px: { lg: 2 },
                borderLeft: { lg: "1px solid #dce7e5" },
                borderRight: { lg: "1px solid #dce7e5" },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
              >
                <Typography sx={{ fontWeight: 900, color: "#173f46" }}>
                  Tempo
                </Typography>
                <Typography
                  sx={{ fontWeight: 900, color: "#d97706", fontSize: 22 }}
                >
                  {bpm} BPM
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconButton
                  aria-label="Bajar 5 BPM"
                  onClick={() => setBpm((value) => Math.max(45, value - 5))}
                  size="small"
                >
                  <Remove />
                </IconButton>
                <Slider
                  value={bpm}
                  min={45}
                  max={180}
                  step={1}
                  onChange={(_, value) => setBpm(value as number)}
                  aria-label="Tempo en BPM"
                  sx={{ color: "#0f766e" }}
                />
                <IconButton
                  aria-label="Subir 5 BPM"
                  onClick={() => setBpm((value) => Math.min(180, value + 5))}
                  size="small"
                >
                  <Add />
                </IconButton>
              </Stack>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <FormControl size="small" sx={{ minWidth: 110 }}>
                <InputLabel id="bass-rhythm-root-label">Tonalidad</InputLabel>
                <Select
                  labelId="bass-rhythm-root-label"
                  value={root}
                  label="Tonalidad"
                  onChange={(event) => {
                    stop();
                    setRoot(event.target.value);
                  }}
                >
                  {ROOTS.map((note) => (
                    <MenuItem key={note} value={note}>
                      {note}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="large"
                startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                onClick={togglePlayback}
                sx={{
                  minWidth: 190,
                  py: 1.35,
                  bgcolor: isPlaying ? "#b45309" : "#0f766e",
                  textTransform: "none",
                  fontWeight: 900,
                  boxShadow: "none",
                  "&:hover": { bgcolor: isPlaying ? "#92400e" : "#0b5c55" },
                }}
              >
                {isPlaying ? "Detener" : "Iniciar práctica"}
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            border: "1px solid #d8e5e2",
            bgcolor: "#fff",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: currentStage.color, fontWeight: 900 }}
                  >
                    {currentStage.label}
                  </Typography>
                  <Typography sx={{ color: "#173f46", fontWeight: 900 }}>
                    Ejercicio {currentIndex + 1} de {GROOVES.length}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#637b7f", fontWeight: 800 }}
                >
                  {completedIds.length} completados
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={completionPercent}
                aria-label="Progreso de la ruta de ritmo"
                sx={{
                  height: 9,
                  borderRadius: 99,
                  bgcolor: "#e4eeec",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#0f766e",
                    borderRadius: 99,
                  },
                }}
              />
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ minWidth: { md: 460 } }}
            >
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                disabled={currentIndex === 0}
                onClick={() => goToRelativeExercise(-1)}
                sx={{ textTransform: "none" }}
              >
                Anterior
              </Button>
              <Button
                variant={
                  completedIds.includes(groove.id) ? "outlined" : "contained"
                }
                color="success"
                startIcon={
                  completedIds.includes(groove.id) ? (
                    <CheckCircle />
                  ) : (
                    <RadioButtonUnchecked />
                  )
                }
                onClick={toggleCompleted}
                sx={{ textTransform: "none", fontWeight: 800 }}
              >
                {completedIds.includes(groove.id)
                  ? "Completado"
                  : "Marcar completado"}
              </Button>
              <Button
                variant="outlined"
                endIcon={<NavigateNext />}
                disabled={currentIndex === GROOVES.length - 1}
                onClick={() => goToRelativeExercise(1)}
                sx={{ textTransform: "none" }}
              >
                Siguiente
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", xl: "330px minmax(0, 1fr)" },
            gap: 3,
            mt: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid #d8e5e2",
              alignSelf: "start",
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: "#5e777b", fontWeight: 900, letterSpacing: 1.2 }}
            >
              RUTA DE APRENDIZAJE
            </Typography>
            <Typography variant="body2" sx={{ color: "#6a8084", mt: 0.25 }}>
              Sigue el orden para construir una base rítmica sólida.
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ mt: 1.5, mb: 2.5, flexWrap: "wrap", gap: 0.75 }}
            >
              {(["Todos", "4/4", "3/4", "6/8"] as const).map((meter) => (
                <Chip
                  key={meter}
                  label={meter}
                  clickable
                  onClick={() => setMeterFilter(meter)}
                  color={meterFilter === meter ? "primary" : "default"}
                  variant={meterFilter === meter ? "filled" : "outlined"}
                  sx={meterFilter === meter ? { bgcolor: "#0f766e" } : {}}
                />
              ))}
            </Stack>
            <Stack spacing={2.5}>
              {STAGES.map((stage) => {
                const stageGrooves = visibleGrooves.filter(
                  (item) => item.stage === stage.id,
                );
                if (!stageGrooves.length) return null;
                return (
                  <Box key={stage.id}>
                    <Typography
                      sx={{
                        color: stage.color,
                        fontWeight: 900,
                        fontSize: 14,
                      }}
                    >
                      {stage.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#7a8d90", display: "block", mb: 1 }}
                    >
                      {stage.description}
                    </Typography>
                    <Stack spacing={0.8}>
                      {stageGrooves.map((item) => {
                        const selected = item.id === groove.id;
                        const itemIndex = GROOVES.findIndex(
                          (candidate) => candidate.id === item.id,
                        );
                        const completed = completedIds.includes(item.id);
                        return (
                          <Button
                            key={item.id}
                            onClick={() => selectGroove(item.id)}
                            aria-pressed={selected}
                            sx={{
                              p: 1.2,
                              justifyContent: "flex-start",
                              textAlign: "left",
                              textTransform: "none",
                              borderRadius: 2.5,
                              border: selected
                                ? `2px solid ${stage.color}`
                                : "1px solid #dce6e4",
                              bgcolor: selected ? `${stage.color}12` : "white",
                              color: "#173f46",
                              "&:hover": {
                                bgcolor: selected
                                  ? `${stage.color}18`
                                  : "#f6faf9",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 28,
                                minWidth: 28,
                                height: 28,
                                borderRadius: "50%",
                                mr: 1.1,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: completed ? stage.color : "#edf3f2",
                                color: completed ? "white" : "#647b7f",
                                fontSize: 12,
                                fontWeight: 900,
                              }}
                            >
                              {completed ? (
                                <CheckCircle sx={{ fontSize: 18 }} />
                              ) : (
                                itemIndex + 1
                              )}
                            </Box>
                            <Box sx={{ width: "100%" }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  sx={{ fontWeight: 900, lineHeight: 1.2 }}
                                >
                                  {item.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontFamily: "Georgia, serif",
                                    fontWeight: 900,
                                    color: stage.color,
                                  }}
                                >
                                  {item.meter}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: LEVEL_COLOR[item.level],
                                  fontWeight: 800,
                                }}
                              >
                                {item.feel} · {item.level}
                              </Typography>
                            </Box>
                          </Button>
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid #d8e5e2",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: "#fff" }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 0.75 }}
                  >
                    <Chip
                      label={currentStage.shortLabel}
                      size="small"
                      sx={{
                        bgcolor: currentStage.color,
                        color: "white",
                        fontWeight: 800,
                      }}
                    />
                    <Chip
                      label={groove.feel}
                      size="small"
                      variant="outlined"
                      sx={{ color: "#173f46", fontWeight: 800 }}
                    />
                    <Chip
                      label={groove.level}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: LEVEL_COLOR[groove.level],
                        borderColor: LEVEL_COLOR[groove.level],
                        fontWeight: 800,
                      }}
                    />
                  </Stack>
                  <Typography
                    component="h2"
                    sx={{
                      fontSize: { xs: 27, md: 36 },
                      fontWeight: 900,
                      color: "#123940",
                      letterSpacing: "-0.035em",
                    }}
                  >
                    {groove.name}
                  </Typography>
                  <Typography sx={{ color: "#61787d", mt: 0.5 }}>
                    {groove.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#829397", fontWeight: 800 }}
                  >
                    Paso {currentIndex + 1} de {GROOVES.length}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ textAlign: "right", mr: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#788c90" }}
                    >
                      VUELTAS
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 27,
                        lineHeight: 1,
                        fontWeight: 900,
                        color: "#0f766e",
                      }}
                    >
                      {loops}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label="Reiniciar contador"
                    onClick={() => setLoops(0)}
                    sx={{ border: "1px solid #d5e2df" }}
                  >
                    <RestartAlt />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            <Box
              sx={{
                px: { xs: 2.5, md: 3.5 },
                py: 3,
                bgcolor: "#f9f4e8",
                borderTop: "1px solid #eee6d6",
                borderBottom: "1px solid #eee6d6",
              }}
            >
              <Box
                sx={{
                  mb: 2.5,
                  p: 1.75,
                  borderRadius: 2.5,
                  bgcolor: "#fff",
                  border: "1px solid #eadfca",
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: "#a65d00", fontWeight: 900 }}
                >
                  CUENTA EN VOZ ALTA
                </Typography>
                <Typography
                  sx={{
                    color: "#173f46",
                    fontWeight: 900,
                    fontSize: { xs: 16, md: 19 },
                  }}
                >
                  {groove.counting}
                </Typography>
              </Box>
              <Box
                sx={{
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": { height: 7 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "#b5c7c5",
                    borderRadius: 20,
                  },
                }}
              >
                <Stack spacing={2.5}>
                  {groove.bars.map((bar, index) => (
                    <RhythmBar
                      key={`${groove.id}-${index}`}
                      groove={groove}
                      bar={bar}
                      barIndex={index}
                      root={root}
                      activeBar={activeBar}
                      activeStep={activeStep}
                      isPlaying={isPlaying}
                    />
                  ))}
                </Stack>
              </Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 1, sm: 3 }}
                sx={{ mt: 2 }}
              >
                <Typography variant="caption" sx={{ color: "#536c70" }}>
                  <Box
                    component="span"
                    sx={{ color: "#0b3c45", fontWeight: 900 }}
                  >
                    ●
                  </Box>{" "}
                  nota tocada
                </Typography>
                <Typography variant="caption" sx={{ color: "#536c70" }}>
                  <Box
                    component="span"
                    sx={{ color: "#a54d2b", fontWeight: 900 }}
                  >
                    ×
                  </Box>{" "}
                  ghost note
                </Typography>
                <Typography variant="caption" sx={{ color: "#536c70" }}>
                  <Box
                    component="span"
                    sx={{ color: "#9cabad", fontWeight: 900 }}
                  >
                    —
                  </Box>{" "}
                  espacio / silencio
                </Typography>
                <Typography variant="caption" sx={{ color: "#536c70" }}>
                  <Box
                    component="span"
                    sx={{ color: "#0f8a78", fontWeight: 900 }}
                  >
                    ━
                  </Box>{" "}
                  sostener la nota
                </Typography>
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                justifyContent="space-between"
                spacing={2.5}
                alignItems={{ xs: "stretch", lg: "center" }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderLeft: "4px solid #f0a500",
                    bgcolor: "#fff9e9",
                    borderRadius: "0 12px 12px 0",
                    flex: 1,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: "#a65d00", fontWeight: 900 }}
                  >
                    CONSEJO DE PRÁCTICA
                  </Typography>
                  <Typography sx={{ color: "#4f5f62", fontSize: 14 }}>
                    {groove.tip}
                  </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={bassGuide}
                        onChange={(event) => {
                          stop();
                          setBassGuide(event.target.checked);
                        }}
                        color="success"
                      />
                    }
                    label="Bajo guía"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={metronome}
                        onChange={(event) => {
                          stop();
                          setMetronome(event.target.checked);
                        }}
                        color="warning"
                      />
                    }
                    label="Click"
                  />
                </Stack>
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 2,
                  color: "#819195",
                  textAlign: "center",
                }}
              >
                Espacio inicia o detiene · Escucha primero · Silencia «Bajo
                guía» y toca tú la segunda vuelta
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
