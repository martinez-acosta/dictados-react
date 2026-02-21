import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Paper,
  Box,
  Grid,
  Typography,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Chip,
  FormGroup,
} from "@mui/material";
import { PlayArrow, Pause, ArrowBack, SyncAlt } from "@mui/icons-material";
import {
  Factory,
  Stave,
  StaveNote,
  Formatter,
  Accidental,
  Annotation,
} from "vexflow";
import * as Tone from "tone";
import { useNavigate } from "react-router-dom";

// ---------------- Audio sampler (persistente entre renders) ----------------
let toneSamplerRef: Tone.Sampler | null = null;

async function ensureSampler(): Promise<Tone.Sampler> {
  if (toneSamplerRef) return toneSamplerRef;
  await Tone.start();
  toneSamplerRef = new Tone.Sampler({
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
  return toneSamplerRef;
}

// ---------------- Datos de Intervalos ----------------

type IntervalId =
  | "m2"
  | "M2"
  | "m3"
  | "M3"
  | "P4"
  | "TT"
  | "P5"
  | "m6"
  | "M6"
  | "m7"
  | "M7"
  | "P8";

interface IntervalDef {
  id: IntervalId;
  name: string;
  semitones: number;
}
type PracticeMode = "train" | "exam";
type IntervalDirection = "ascending" | "descending";
type ReferenceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type QuestionOptionId =
  | "minor_arpeggio"
  | "major_arpeggio"
  | "minor_chord"
  | "major_chord";
type QuestionOption = {
  id: QuestionOptionId;
  label: string;
  intervalKind: "minor" | "major";
  playback: "arpeggio" | "chord";
};
type PairGroup = {
  id: IntervalGroupId;
  minorId: IntervalId;
  majorId: IntervalId;
};
type PairRound = {
  groupId: IntervalGroupId;
  base: { step: string; vfKey: string };
  minor: IntervalDef;
  major: IntervalDef;
  minorTarget: { step: string; vfKey: string };
  majorTarget: { step: string; vfKey: string };
};

const ALL_INTERVALS: IntervalDef[] = [
  { id: "m2", name: "2ª menor", semitones: 1 },
  { id: "M2", name: "2ª mayor", semitones: 2 },
  { id: "m3", name: "3ª menor", semitones: 3 },
  { id: "M3", name: "3ª mayor", semitones: 4 },
  { id: "P4", name: "4ª justa", semitones: 5 },
  { id: "TT", name: "Tritono", semitones: 6 },
  { id: "P5", name: "5ª justa", semitones: 7 },
  { id: "m6", name: "6ª menor", semitones: 8 },
  { id: "M6", name: "6ª mayor", semitones: 9 },
  { id: "m7", name: "7ª menor", semitones: 10 },
  { id: "M7", name: "7ª mayor", semitones: 11 },
  { id: "P8", name: "Octava", semitones: 12 },
];

type IntervalGroupId =
  | "segundas"
  | "terceras"
  | "cuartas_quintas"
  | "sextas"
  | "septimas"
  | "octava";

const INTERVAL_GROUPS: {
  id: IntervalGroupId;
  label: string;
  intervals: IntervalId[];
}[] = [
  { id: "segundas", label: "Segundas (m2, M2)", intervals: ["m2", "M2"] },
  { id: "terceras", label: "Terceras (m3, M3)", intervals: ["m3", "M3"] },
  {
    id: "cuartas_quintas",
    label: "4as y 5as (P4, TT, P5)",
    intervals: ["P4", "TT", "P5"],
  },
  { id: "sextas", label: "Sextas (m6, M6)", intervals: ["m6", "M6"] },
  { id: "septimas", label: "Séptimas (m7, M7)", intervals: ["m7", "M7"] },
  { id: "octava", label: "Octava (P8)", intervals: ["P8"] },
];

const MINOR_MAJOR_PAIR_GROUPS: PairGroup[] = [
  { id: "segundas", minorId: "m2", majorId: "M2" },
  { id: "terceras", minorId: "m3", majorId: "M3" },
  { id: "cuartas_quintas", minorId: "P4", majorId: "P5" }, // Emparejamos P4 y P5 para simplificar
  { id: "sextas", minorId: "m6", majorId: "M6" },
  { id: "septimas", minorId: "m7", majorId: "M7" },
];
const QUESTION_OPTIONS: QuestionOption[] = [
  {
    id: "minor_arpeggio",
    label: "Menor arpegio",
    intervalKind: "minor",
    playback: "arpeggio",
  },
  {
    id: "major_arpeggio",
    label: "Mayor arpegio",
    intervalKind: "major",
    playback: "arpeggio",
  },
  {
    id: "minor_chord",
    label: "Menor acorde",
    intervalKind: "minor",
    playback: "chord",
  },
  {
    id: "major_chord",
    label: "Mayor acorde",
    intervalKind: "major",
    playback: "chord",
  },
];

const STEP_TO_INT: Record<string, number> = {
  c: 0,
  "c#": 1,
  db: 1,
  d: 2,
  "d#": 3,
  eb: 3,
  e: 4,
  f: 5,
  "f#": 6,
  gb: 6,
  g: 7,
  "g#": 8,
  ab: 8,
  a: 9,
  "a#": 10,
  bb: 10,
  b: 11,
};

const BASE_NOTES = [
  { step: "c", label: "Do" },
  { step: "c#", label: "Do♯" },
  { step: "d", label: "Re" },
  { step: "eb", label: "Mi♭" },
  { step: "e", label: "Mi" },
  { step: "f", label: "Fa" },
  { step: "f#", label: "Fa♯" },
  { step: "g", label: "Sol" },
  { step: "ab", label: "La♭" },
  { step: "a", label: "La" },
  { step: "bb", label: "Si♭" },
  { step: "b", label: "Si" },
];

const SHARP_STEPS = [
  "c",
  "c#",
  "d",
  "d#",
  "e",
  "f",
  "f#",
  "g",
  "g#",
  "a",
  "a#",
  "b",
];
const FLAT_STEPS = [
  "c",
  "db",
  "d",
  "eb",
  "e",
  "f",
  "gb",
  "g",
  "ab",
  "a",
  "bb",
  "b",
];

function calculateIntervalFromBase(
  baseVfKey: string,
  semitones: number,
  direction: IntervalDirection,
): string {
  const [baseStep, baseOctaveRaw] = baseVfKey.split("/");
  const baseOctave = parseInt(baseOctaveRaw, 10);
  const basePc = STEP_TO_INT[baseStep] ?? 0;
  const baseMidi = (baseOctave + 1) * 12 + basePc;
  const delta = direction === "ascending" ? semitones : -semitones;
  const targetMidi = baseMidi + delta;
  const targetPc = ((targetMidi % 12) + 12) % 12;
  const targetOctave = Math.floor(targetMidi / 12) - 1;
  const preferSharps = baseStep.includes("#");
  const targetStep = (preferSharps ? SHARP_STEPS : FLAT_STEPS)[targetPc];
  return `${targetStep}/${targetOctave}`;
}

function noteToTone(vfKey: string): string {
  const [s, o] = vfKey.split("/");
  const pcMap: Record<string, number> = {
    c: 0,
    "c#": 1,
    db: 1,
    d: 2,
    "d#": 3,
    eb: 3,
    e: 4,
    f: 5,
    "f#": 6,
    gb: 6,
    g: 7,
    "g#": 8,
    ab: 8,
    a: 9,
    "a#": 10,
    bb: 10,
    b: 11,
  };
  const intVal = pcMap[s];
  const octInt = parseInt(o, 10);
  const midi = (octInt + 1) * 12 + intVal;
  const names = [
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
  ];
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

const addAccidental = (note: StaveNote, step: string): StaveNote => {
  const acc = step.endsWith("#")
    ? "#"
    : step.length > 1 && step.endsWith("b")
      ? "b"
      : null;
  if (acc) note.addModifier(new Accidental(acc as "#" | "b"), 0);
  return note;
};

// ---------------- Componente principal ----------------

export default function DictadosIntervalos() {
  const navigate = useNavigate();

  // Opciones de configuración
  const [selectedGroups, setSelectedGroups] = useState<IntervalGroupId[]>([
    "terceras",
  ]);

  // Estado de la partida actual
  const [currentBaseNote, setCurrentBaseNote] = useState<{
    step: string;
    vfKey: string;
  } | null>(null);
  const [currentTargetNote, setCurrentTargetNote] = useState<{
    step: string;
    vfKey: string;
  } | null>(null);
  const [currentCorrectInterval, setCurrentCorrectInterval] =
    useState<IntervalDef | null>(null);

  // Stats y UI
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [statusMsg, setStatusMsg] = useState(
    "Selecciona los intervalos y pide el primero.",
  );
  const [statusColor, setStatusColor] = useState<
    "text.secondary" | "success.main" | "error.main"
  >("text.secondary");
  const [hasGuessed, setHasGuessed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<PracticeMode>("train");
  const [direction, setDirection] = useState<IntervalDirection>("ascending");
  const [currentRound, setCurrentRound] = useState<PairRound | null>(null);
  const [infiniteReference, setInfiniteReference] = useState(false);
  const [infiniteQuestion, setInfiniteQuestion] = useState(false);
  const [selectedQuestionOptionIds, setSelectedQuestionOptionIds] = useState<
    QuestionOptionId[]
  >(["minor_chord", "major_chord"]);
  const [currentCorrectQuestion, setCurrentCorrectQuestion] =
    useState<QuestionOption | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPlayingState, setCurrentPlayingState] =
    useState<ReferenceStep | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const playbackTimeoutsRef = useRef<number[]>([]);

  const selectedPairGroups = MINOR_MAJOR_PAIR_GROUPS.filter((pair) =>
    selectedGroups.includes(pair.id),
  );
  const selectedQuestionOptions = QUESTION_OPTIONS.filter((option) =>
    selectedQuestionOptionIds.includes(option.id),
  );

  useEffect(() => {
    setCurrentIndex(0);
    setCurrentRound(null);
    setCurrentBaseNote(null);
    setCurrentTargetNote(null);
    setCurrentCorrectInterval(null);
    setCurrentCorrectQuestion(null);
    setHasGuessed(false);
    stopPlayback();
  }, [selectedGroups]);

  useEffect(() => {
    stopPlayback();
    setCurrentRound(null);
    setCurrentBaseNote(null);
    setCurrentTargetNote(null);
    setCurrentCorrectInterval(null);
    setCurrentCorrectQuestion(null);
    setHasGuessed(false);
  }, [direction]);

  useEffect(() => {
    drawStaff();
  }, [
    currentBaseNote,
    currentTargetNote,
    hasGuessed,
    currentPlayingState,
    mode,
  ]);

  const toggleGroup = (id: IntervalGroupId) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const toggleQuestionOption = (id: QuestionOptionId) => {
    setSelectedQuestionOptionIds((prev) =>
      prev.includes(id) ? prev.filter((optId) => optId !== id) : [...prev, id],
    );
  };

  const queueTimeout = (fn: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      playbackTimeoutsRef.current = playbackTimeoutsRef.current.filter(
        (timeoutId) => timeoutId !== id,
      );
      fn();
    }, delayMs);
    playbackTimeoutsRef.current.push(id);
  };

  const stopPlayback = () => {
    playbackTimeoutsRef.current.forEach((id) => clearTimeout(id));
    playbackTimeoutsRef.current = [];
    try {
      toneSamplerRef?.releaseAll();
    } catch {
      // noop
    }
    setCurrentPlayingState(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const startNewRound = async () => {
    if (selectedPairGroups.length === 0) {
      setStatusMsg(
        "Selecciona al menos un grupo válido (segundas, terceras, 4as/5as, sextas o séptimas).",
      );
      setStatusColor("error.main");
      return;
    }
    if (selectedQuestionOptions.length === 0) {
      setStatusMsg("Selecciona al menos una combinación para practicar.");
      setStatusColor("error.main");
      return;
    }

    stopPlayback();

    const pairGroup =
      selectedPairGroups[currentIndex % selectedPairGroups.length];
    setCurrentIndex((prev) => (prev + 1) % selectedPairGroups.length);

    const minorDef = ALL_INTERVALS.find((i) => i.id === pairGroup.minorId)!;
    const majorDef = ALL_INTERVALS.find((i) => i.id === pairGroup.majorId)!;
    const baseNoteObj =
      BASE_NOTES[Math.floor(Math.random() * BASE_NOTES.length)];
    const oct = Math.random() > 0.5 ? "3" : "4";
    const baseKey = `${baseNoteObj.step}/${oct}`;

    const minorKey = calculateIntervalFromBase(
      baseKey,
      minorDef.semitones,
      direction,
    );
    const majorKey = calculateIntervalFromBase(
      baseKey,
      majorDef.semitones,
      direction,
    );
    const nextRound: PairRound = {
      groupId: pairGroup.id,
      base: { step: baseNoteObj.step, vfKey: baseKey },
      minor: minorDef,
      major: majorDef,
      minorTarget: { step: minorKey.split("/")[0], vfKey: minorKey },
      majorTarget: { step: majorKey.split("/")[0], vfKey: majorKey },
    };

    setCurrentRound(nextRound);
    setCurrentBaseNote(nextRound.base);
    setCurrentTargetNote(nextRound.minorTarget);
    setCurrentCorrectInterval(null);
    setCurrentCorrectQuestion(null);
    setHasGuessed(false);

    setStatusMsg(
      `Referencia ${direction === "ascending" ? "ascendente" : "descendente"} según combinaciones seleccionadas.`,
    );
    setStatusColor("text.secondary");
    await playReferenceSequence(nextRound);
  };

  const playReferenceSequence = async (roundOverride?: PairRound) => {
    const round = roundOverride || currentRound;
    if (!round) return;
    if (isPlaying && !roundOverride) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setIsPlaying(true);
    try {
      const sampler = await ensureSampler();
      const toneBase = noteToTone(round.base.vfKey);
      const toneMinor = noteToTone(round.minorTarget.vfKey);
      const toneMajor = noteToTone(round.majorTarget.vfKey);
      const arpeggioDur = 0.75;
      const chordDur = 1.1;
      const gapMs = 180;
      const baseOrder: QuestionOptionId[] = [
        "minor_arpeggio",
        "major_arpeggio",
        "minor_chord",
        "major_chord",
      ];
      const activeOrder: QuestionOptionId[] = baseOrder.filter((id) =>
        selectedQuestionOptionIds.includes(id),
      );
      const events: Array<{
        delayMs: number;
        step: ReferenceStep;
        target: { step: string; vfKey: string };
        chord: string[];
        dur: number;
      }> = [];
      let cursor = 0;

      const pushMinorArpeggio = () => {
        events.push({
          delayMs: cursor,
          step: 0,
          target: round.minorTarget,
          chord: [toneBase],
          dur: arpeggioDur,
        });
        cursor += 760;
        events.push({
          delayMs: cursor,
          step: 1,
          target: round.minorTarget,
          chord: [toneMinor],
          dur: arpeggioDur,
        });
        cursor += 760 + gapMs;
      };
      const pushMajorArpeggio = () => {
        events.push({
          delayMs: cursor,
          step: 2,
          target: round.majorTarget,
          chord: [toneBase],
          dur: arpeggioDur,
        });
        cursor += 760;
        events.push({
          delayMs: cursor,
          step: 3,
          target: round.majorTarget,
          chord: [toneMajor],
          dur: arpeggioDur,
        });
        cursor += 760 + gapMs;
      };
      const pushMinorChord = () => {
        events.push({
          delayMs: cursor,
          step: 4,
          target: round.minorTarget,
          chord: [toneBase, toneMinor],
          dur: chordDur,
        });
        cursor += 1120 + gapMs;
      };
      const pushMajorChord = () => {
        events.push({
          delayMs: cursor,
          step: 5,
          target: round.majorTarget,
          chord: [toneBase, toneMajor],
          dur: chordDur,
        });
        cursor += 1120 + gapMs;
      };

      activeOrder.forEach((id) => {
        if (id === "minor_arpeggio") pushMinorArpeggio();
        else if (id === "major_arpeggio") pushMajorArpeggio();
        else if (id === "minor_chord") pushMinorChord();
        else if (id === "major_chord") pushMajorChord();
      });

      if (events.length === 0) {
        setIsPlaying(false);
        setStatusMsg("No hay combinaciones activas para reproducir.");
        setStatusColor("error.main");
        return;
      }

      const scheduleCycle = () => {
        events.forEach((event) => {
          queueTimeout(() => {
            setCurrentTargetNote(event.target);
            setCurrentPlayingState(event.step);
            sampler.triggerAttackRelease(
              event.chord.length === 1 ? event.chord[0] : event.chord,
              event.dur,
            );
          }, event.delayMs);
        });

        const endMs = events[events.length - 1].delayMs + 1250;
        queueTimeout(() => {
          setCurrentPlayingState(null);
          if (infiniteReference) {
            scheduleCycle();
          } else {
            setIsPlaying(false);
            setStatusMsg("Referencia lista. Pulsa Pregunta para adivinar.");
            setStatusColor("text.secondary");
          }
        }, endMs);
      };

      if (infiniteReference) {
        setStatusMsg("Referencia en infinito. Pulsa Detener para parar.");
      }
      scheduleCycle();
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const playQuestion = async () => {
    if (!currentRound) {
      setStatusMsg("Primero genera un nuevo par.");
      setStatusColor("error.main");
      return;
    }
    if (selectedQuestionOptions.length === 0) {
      setStatusMsg("Selecciona al menos una combinación para la pregunta.");
      setStatusColor("error.main");
      return;
    }
    if (isPlaying) {
      stopPlayback();
      return;
    }

    stopPlayback();

    const askedOption =
      selectedQuestionOptions[
        Math.floor(Math.random() * selectedQuestionOptions.length)
      ];
    const askedDef =
      askedOption.intervalKind === "minor"
        ? currentRound.minor
        : currentRound.major;
    const askedTarget =
      askedOption.intervalKind === "minor"
        ? currentRound.minorTarget
        : currentRound.majorTarget;

    setCurrentBaseNote(currentRound.base);
    setCurrentTargetNote(askedTarget);
    setCurrentCorrectInterval(askedDef);
    setCurrentCorrectQuestion(askedOption);
    setHasGuessed(false);
    if (infiniteQuestion) {
      setStatusMsg("Pregunta en infinito. Pulsa Detener o responde.");
    } else {
      setStatusMsg("Pregunta: identifica la combinación.");
    }
    setStatusColor("text.secondary");
    setIsPlaying(true);

    try {
      const sampler = await ensureSampler();
      const toneBase = noteToTone(currentRound.base.vfKey);
      const toneTarget = noteToTone(askedTarget.vfKey);

      const scheduleQuestionCycle = () => {
        if (askedOption.playback === "chord") {
          const step = askedOption.intervalKind === "minor" ? 4 : 5;
          queueTimeout(() => {
            setCurrentPlayingState(step);
            sampler.triggerAttackRelease([toneBase, toneTarget], 1.2);
          }, 0);
          queueTimeout(() => {
            setCurrentPlayingState(null);
            if (infiniteQuestion) {
              scheduleQuestionCycle();
            } else {
              setIsPlaying(false);
            }
          }, 1220);
          return;
        }

        const firstStep = askedOption.intervalKind === "minor" ? 0 : 2;
        const secondStep = askedOption.intervalKind === "minor" ? 1 : 3;
        queueTimeout(() => {
          setCurrentPlayingState(firstStep);
          sampler.triggerAttackRelease(toneBase, 0.75);
        }, 0);
        queueTimeout(() => {
          setCurrentPlayingState(secondStep);
          sampler.triggerAttackRelease(toneTarget, 0.75);
        }, 760);
        queueTimeout(() => {
          setCurrentPlayingState(null);
          if (infiniteQuestion) {
            scheduleQuestionCycle();
          } else {
            setIsPlaying(false);
          }
        }, 1520);
      };

      scheduleQuestionCycle();
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const handleGuess = (option: QuestionOption) => {
    if (hasGuessed || !currentCorrectQuestion) return;

    setHasGuessed(true);
    setAttempts((prev) => prev + 1);
    stopPlayback();

    if (option.id === currentCorrectQuestion.id) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setStatusMsg(`¡Correcto! Era ${currentCorrectQuestion.label}.`);
      setStatusColor("success.main");
    } else {
      setStreak(0);
      setStatusMsg(`Incorrecto. Era ${currentCorrectQuestion.label}.`);
      setStatusColor("error.main");
    }
  };

  function drawStaff() {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const renderer = new Factory({
      renderer: { elementId: containerRef.current.id, width: 400, height: 160 },
    });

    const ctx = renderer.getContext();
    const stave = new Stave(10, 20, 380);
    // Para dictado genérico usamos clave de sol principal, o de fa si cae muy grave.
    // Base está entre C3 y B4, target puede llegar a C6 (B4 + octava). Clave de Sol está bien usando líneas adicionales.
    let clef = "treble";
    if (
      currentBaseNote &&
      currentBaseNote.vfKey.endsWith("3") &&
      (!currentTargetNote ||
        currentTargetNote.vfKey.endsWith("3") ||
        currentTargetNote.vfKey.endsWith("4"))
    ) {
      clef = "bass";
    }

    stave.addClef(clef).setContext(ctx).draw();

    if (!currentBaseNote || !currentTargetNote) return;
    const isQuestionActive = !!currentCorrectQuestion && !hasGuessed;
    const hideNotes = (mode === "exam" && !hasGuessed) || isQuestionActive;
    if (hideNotes) {
      const canvasCtx = (ctx as any).context as
        | CanvasRenderingContext2D
        | undefined;
      if (canvasCtx) {
        canvasCtx.save();
        canvasCtx.font = "bold 13px Arial";
        canvasCtx.fillStyle = "#546e7a";
        canvasCtx.textAlign = "center";
        canvasCtx.fillText(
          isQuestionActive
            ? "Pregunta activa: notas ocultas"
            : "Modo examen: notas ocultas",
          200,
          95,
        );
        canvasCtx.restore();
      }
      return;
    }

    const bStep = currentBaseNote.step;
    const tStep = currentTargetNote.step;
    const bKey = currentBaseNote.vfKey;
    const tKey = currentTargetNote.vfKey;
    const getCurrentIntervalForDisplay = (): IntervalDef | null => {
      if (!currentRound && !currentCorrectInterval) return null;
      if (
        currentPlayingState === 0 ||
        currentPlayingState === 1 ||
        currentPlayingState === 4
      ) {
        return currentRound?.minor ?? null;
      }
      if (
        currentPlayingState === 2 ||
        currentPlayingState === 3 ||
        currentPlayingState === 5
      ) {
        return currentRound?.major ?? null;
      }
      return hasGuessed ? currentCorrectInterval : null;
    };

    let notesToDraw = [];
    const n1 = addAccidental(
      new StaveNote({ clef, keys: [bKey], duration: "q" }),
      bStep,
    );
    const n2 = addAccidental(
      new StaveNote({ clef, keys: [tKey], duration: "q" }),
      tStep,
    );

    // Highlight naranja según lo que suena
    if (currentPlayingState === 0 || currentPlayingState === 2) {
      n1.setStyle({ fillStyle: "#ff6b35", strokeStyle: "#ff6b35" });
    } else if (currentPlayingState === 1 || currentPlayingState === 3) {
      n2.setStyle({ fillStyle: "#ff6b35", strokeStyle: "#ff6b35" });
    } else if (
      currentPlayingState === 4 ||
      currentPlayingState === 5 ||
      currentPlayingState === 6
    ) {
      n1.setStyle({ fillStyle: "#ff6b35", strokeStyle: "#ff6b35" });
      n2.setStyle({ fillStyle: "#ff6b35", strokeStyle: "#ff6b35" });
    }
    if (mode === "train") {
      const intervalLabel = getCurrentIntervalForDisplay();
      if (intervalLabel) {
        n2.addModifier(
          new Annotation(intervalLabel.name)
            .setVerticalJustification(3)
            .setFont("Arial", 12, "bold")
            .setStyle({ fillStyle: "#ff6b35" }),
          0,
        );
      }
    }

    notesToDraw = [n1, n2];

    Formatter.FormatAndDraw(ctx, stave, notesToDraw);
  }

  return (
    <Container maxWidth="md" sx={{ pb: 4 }}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Menú
          </Button>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, flex: 1, color: "#0b2a50" }}
          >
            🎵 Dictado de Intervalos
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Ajustes
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="mode-label">Modo</InputLabel>
                <Select
                  labelId="mode-label"
                  label="Modo"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as PracticeMode)}
                >
                  <MenuItem value="exam">Examen</MenuItem>
                  <MenuItem value="train">Entrenamiento</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                sx={{ mb: 1 }}
                control={
                  <Switch
                    checked={direction === "descending"}
                    onChange={(e) =>
                      setDirection(
                        e.target.checked ? "descending" : "ascending",
                      )
                    }
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    Dirección:{" "}
                    {direction === "ascending" ? "Ascendente" : "Descendente"}
                  </Typography>
                }
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Intervalos Activos
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", mb: 1 }}
              >
                Para este ejercicio solo aplican los grupos compatibles en pares
                (ej. menor/mayor, cuartas/quintas).
              </Typography>
              <FormGroup>
                <Grid container>
                  {INTERVAL_GROUPS.map((g) => {
                    const isSupported = MINOR_MAJOR_PAIR_GROUPS.some(
                      (pair) => pair.id === g.id,
                    );
                    return (
                      <Grid item xs={12} sm={6} key={g.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedGroups.includes(g.id)}
                              onChange={() => toggleGroup(g.id)}
                              disabled={!isSupported}
                              size="small"
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              color={
                                isSupported ? "text.primary" : "text.disabled"
                              }
                            >
                              {g.label}
                            </Typography>
                          }
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </FormGroup>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Combinaciones de pregunta
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", mb: 1 }}
              >
                Puedes practicar cualquier combinación (activa arpegios o
                acordes).
              </Typography>
              <FormGroup>
                {QUESTION_OPTIONS.map((option) => {
                  let dynamicLabel = option.label;
                  if (option.intervalKind === "minor")
                    dynamicLabel = `Opción 1 [m/P4] (${option.playback === "arpeggio" ? "arpegio" : "acorde"})`;
                  if (option.intervalKind === "major")
                    dynamicLabel = `Opción 2 [M/P5] (${option.playback === "arpeggio" ? "arpegio" : "acorde"})`;

                  return (
                    <FormControlLabel
                      key={option.id}
                      control={
                        <Checkbox
                          checked={selectedQuestionOptionIds.includes(
                            option.id,
                          )}
                          onChange={() => toggleQuestionOption(option.id)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">{dynamicLabel}</Typography>
                      }
                    />
                  );
                })}
              </FormGroup>
              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Switch
                    checked={infiniteReference}
                    onChange={(e) => setInfiniteReference(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">Referencia infinita</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={infiniteQuestion}
                    onChange={(e) => setInfiniteQuestion(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">Pregunta infinita</Typography>
                }
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8} lg={9}>
            <Paper
              sx={{
                p: { xs: 1.5, sm: 3 },
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: { xs: 1.5, sm: 3 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  sx={{ flexWrap: "wrap", gap: { xs: 1, sm: 0 } }}
                >
                  <Chip
                    size="small"
                    label={`Aciertos: ${score} / ${attempts}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={`Racha: ${streak}`}
                    color={streak > 2 ? "warning" : "default"}
                  />
                </Stack>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startNewRound}
                  startIcon={<SyncAlt />}
                  size="small"
                  sx={{ mt: { xs: 1, sm: 0 } }}
                >
                  Nuevo Par
                </Button>
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  color: statusColor,
                  textAlign: "center",
                  minHeight: "32px",
                  fontWeight: "bold",
                }}
              >
                {statusMsg}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 2 },
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  color={isPlaying ? "warning" : "secondary"}
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  disabled={!currentRound}
                  onClick={() => playReferenceSequence()}
                  sx={{
                    px: { xs: 2, sm: 4 },
                    py: 1,
                    borderRadius: 8,
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  }}
                >
                  {isPlaying ? "Detener" : "Reproducir Referencia"}
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  disabled={!currentRound}
                  onClick={playQuestion}
                  sx={{
                    px: { xs: 2, sm: 4 },
                    py: 1,
                    borderRadius: 8,
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  }}
                >
                  Pregunta
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  overflowX: "auto",
                }}
              >
                <div id="interval-staff" ref={containerRef} />
              </Box>

              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1, textAlign: "center" }}
                >
                  ¿Qué combinación sonó?
                </Typography>
                <Grid container spacing={1} justifyContent="center">
                  {selectedQuestionOptions.map((def) => {
                    const dynamicLabel =
                      def.intervalKind === "minor"
                        ? `${currentRound?.minor?.name || "Opción 1"} (${def.playback === "arpeggio" ? "arp." : "ac."})`
                        : `${currentRound?.major?.name || "Opción 2"} (${def.playback === "arpeggio" ? "arp." : "ac."})`;

                    return (
                      <Grid item key={def.id}>
                        <Button
                          variant={
                            hasGuessed && currentCorrectQuestion?.id === def.id
                              ? "contained"
                              : "outlined"
                          }
                          color={
                            hasGuessed
                              ? currentCorrectQuestion?.id === def.id
                                ? "success"
                                : "inherit"
                              : "primary"
                          }
                          onClick={() => handleGuess(def)}
                          disabled={hasGuessed || !currentCorrectQuestion}
                          sx={{
                            minWidth: { xs: "100px", sm: "120px" },
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            p: { xs: "6px", sm: "12px" },
                          }}
                        >
                          {dynamicLabel}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
