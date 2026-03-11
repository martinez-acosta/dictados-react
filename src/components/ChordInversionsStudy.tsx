import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  ArrowBack,
  CancelOutlined,
  CheckCircleOutline,
  LightbulbOutlined,
  PlayArrow,
  Refresh,
  School,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Accidental, Factory, Formatter, Stave, StaveNote, Voice } from "vexflow";
import * as Tone from "tone";
import { getYamahaSampler, releaseYamahaVoices } from "../utils/yamahaSampler";

type ChordFamily = "triad" | "seventh";
type InversionIndex = number;
type FlashcardMode =
  | "inversionToNotes"
  | "notesToInversion"
  | "bassToInversion"
  | "degreesToInversion"
  | "chordToNotes";
type QuizQuestionType =
  | "identifyBassInversion"
  | "identifyOrderInversion"
  | "writeNotes"
  | "chooseBassDegree"
  | "convertFromRootPosition"
  | "distinguishSecondThird";

type ChordQuality = {
  id: string;
  family: ChordFamily;
  label: string;
  symbol: string;
  description: string;
  degreeFormula: string[];
  semitones: number[];
};

type NoteParts = {
  letter: string;
  accidental: "" | "#" | "##" | "b" | "bb";
};

type ChordTone = {
  name: string;
  degree: string;
  letter: string;
  accidental: "" | "#" | "##" | "b" | "bb";
  octave: number;
  midi: number;
};

type InversionData = {
  index: InversionIndex;
  label: string;
  notes: ChordTone[];
  noteNames: string[];
  noteNamesWithOctave: string[];
  degrees: string[];
  bassNote: string;
  bassDegree: string;
};

type BuiltChord = {
  root: string;
  quality: ChordQuality;
  family: ChordFamily;
  symbol: string;
  rootPosition: ChordTone[];
  inversions: InversionData[];
};

type ChordStudyRow = {
  key: string;
  inversionIndex: number;
  inversionLabel: string;
  degreesExpected: string[];
  bassNote: string;
  bassDegree: string;
  notesExpected: string[];
};

type FlashcardCard = {
  id: string;
  mode: FlashcardMode;
  prompt: string;
  answerKind: "notes" | "choice";
  answerNotes?: string[];
  answerChoice?: string;
  options?: string[];
  answerLines: string[];
  audioNotes: string[];
  chordSymbol: string;
  inversionLabel: string;
  activeInversionIndex: number;
  inversions: InversionData[];
};

type FlashcardCheckResult = {
  isCorrect: boolean;
  expected: string;
};

type QuizQuestion = {
  id: string;
  type: QuizQuestionType;
  family: ChordFamily;
  prompt: string;
  answerKind: "notes" | "choice";
  answerNotes?: string[];
  answerChoice?: string;
  options?: string[];
  helperText: string;
};

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const NATURAL_PC: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
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
const QUALITY_DEFINITIONS: ChordQuality[] = [
  {
    id: "major",
    family: "triad",
    label: "Mayor",
    symbol: "",
    description: "Fórmula 1-3-5. La inversión cambia el bajo, no la calidad.",
    degreeFormula: ["1", "3", "5"],
    semitones: [0, 4, 7],
  },
  {
    id: "minor",
    family: "triad",
    label: "Menor",
    symbol: "m",
    description: "Fórmula 1-b3-5. Sonoridad menor con tercera descendida.",
    degreeFormula: ["1", "b3", "5"],
    semitones: [0, 3, 7],
  },
  {
    id: "diminished",
    family: "triad",
    label: "Disminuida",
    symbol: "°",
    description: "Fórmula 1-b3-b5. La quinta disminuida exige spelling exacto.",
    degreeFormula: ["1", "b3", "b5"],
    semitones: [0, 3, 6],
  },
  {
    id: "augmented",
    family: "triad",
    label: "Aumentada",
    symbol: "+",
    description: "Fórmula 1-3-#5. La quinta aumentada desplaza el color del acorde.",
    degreeFormula: ["1", "3", "#5"],
    semitones: [0, 4, 8],
  },
  {
    id: "maj7",
    family: "seventh",
    label: "Maj7",
    symbol: "maj7",
    description: "Fórmula 1-3-5-7. Cuatríada con séptima mayor.",
    degreeFormula: ["1", "3", "5", "7"],
    semitones: [0, 4, 7, 11],
  },
  {
    id: "7",
    family: "seventh",
    label: "7",
    symbol: "7",
    description: "Fórmula 1-3-5-b7. Dominante clásica.",
    degreeFormula: ["1", "3", "5", "b7"],
    semitones: [0, 4, 7, 10],
  },
  {
    id: "m7",
    family: "seventh",
    label: "m7",
    symbol: "m7",
    description: "Fórmula 1-b3-5-b7. Sonoridad menor con séptima menor.",
    degreeFormula: ["1", "b3", "5", "b7"],
    semitones: [0, 3, 7, 10],
  },
  {
    id: "m7b5",
    family: "seventh",
    label: "m7b5",
    symbol: "m7b5",
    description: "Fórmula 1-b3-b5-b7. Semidisminuido.",
    degreeFormula: ["1", "b3", "b5", "b7"],
    semitones: [0, 3, 6, 10],
  },
  {
    id: "dim7",
    family: "seventh",
    label: "dim7",
    symbol: "°7",
    description: "Fórmula 1-b3-b5-bb7. Disminuido completo.",
    degreeFormula: ["1", "b3", "b5", "bb7"],
    semitones: [0, 3, 6, 9],
  },
];
const FLASHCARD_MODE_LABELS: Record<FlashcardMode, string> = {
  inversionToNotes: "Inversión -> notas",
  notesToInversion: "Notas -> inversión",
  bassToInversion: "Bajo -> inversión",
  degreesToInversion: "Grados -> inversión",
  chordToNotes: "Acorde -> notas",
};
const QUIZ_TYPE_LABELS: Record<QuizQuestionType, string> = {
  identifyBassInversion: "Identificar por bajo",
  identifyOrderInversion: "Identificar por orden",
  writeNotes: "Escribir notas",
  chooseBassDegree: "Elegir grado en bajo",
  convertFromRootPosition: "Convertir desde raíz",
  distinguishSecondThird: "Distinguir 2ª/3ª",
};
const ALL_FLASHCARD_MODES = Object.keys(
  FLASHCARD_MODE_LABELS,
) as FlashcardMode[];
const ALL_QUIZ_TYPES = Object.keys(QUIZ_TYPE_LABELS) as QuizQuestionType[];
const STORAGE_KEY = "dictados-react-chord-inversions-study";

function parseNoteParts(note: string): NoteParts {
  const match = note.match(/^([A-G])(bb|##|b|#)?$/);
  if (!match) {
    return { letter: "C", accidental: "" };
  }
  return {
    letter: match[1],
    accidental: (match[2] || "") as NoteParts["accidental"],
  };
}

function accidentalToShift(accidental: NoteParts["accidental"]) {
  switch (accidental) {
    case "#":
      return 1;
    case "##":
      return 2;
    case "b":
      return -1;
    case "bb":
      return -2;
    default:
      return 0;
  }
}

function shiftToAccidental(shift: number): NoteParts["accidental"] {
  switch (shift) {
    case -2:
      return "bb";
    case -1:
      return "b";
    case 1:
      return "#";
    case 2:
      return "##";
    default:
      return "";
  }
}

function mod12(value: number) {
  return ((value % 12) + 12) % 12;
}

function degreeNumber(degree: string) {
  return Number(degree.replace(/[^0-9]/g, "")) || 1;
}

function noteMidi(name: string, octave: number) {
  const { letter, accidental } = parseNoteParts(name);
  return (octave + 1) * 12 + NATURAL_PC[letter] + accidentalToShift(accidental);
}

function normalizeText(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeNoteToken(note: string) {
  return note.replace(/♭/g, "b").replace(/♯/g, "#").trim().toLowerCase();
}

function normalizeNotesInput(value: string) {
  return (value || "")
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .split(/[,\s/|-]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.toLowerCase());
}

function normalizeChoiceLabel(value: string) {
  return normalizeText(value).replace(/raiz/g, "raiz");
}

function toToneNote(name: string, octave: number) {
  return Tone.Frequency(noteMidi(name, octave), "midi").toNote();
}

function createSpelledNote(root: string, degree: string, semitones: number) {
  const rootParts = parseNoteParts(root);
  const rootLetterIndex = LETTERS.indexOf(rootParts.letter as (typeof LETTERS)[number]);
  const rootPc = mod12(
    NATURAL_PC[rootParts.letter] + accidentalToShift(rootParts.accidental),
  );
  const targetDegreeNumber = degreeNumber(degree);
  const targetLetter =
    LETTERS[(rootLetterIndex + targetDegreeNumber - 1) % LETTERS.length];
  const targetPc = mod12(rootPc + semitones);
  let shift = 0;

  for (let candidate = -2; candidate <= 2; candidate += 1) {
    if (mod12(NATURAL_PC[targetLetter] + candidate) === targetPc) {
      shift = candidate;
      break;
    }
  }

  return {
    name: `${targetLetter}${shiftToAccidental(shift)}`,
    degree,
    letter: targetLetter,
    accidental: shiftToAccidental(shift),
  };
}

function buildRootPositionTones(root: string, quality: ChordQuality) {
  let previousMidi = -Infinity;
  let currentOctave = 4;

  return quality.degreeFormula.map((degree, index) => {
    const spelled = createSpelledNote(root, degree, quality.semitones[index]);
    let midi = noteMidi(spelled.name, currentOctave);

    while (midi <= previousMidi) {
      currentOctave += 1;
      midi = noteMidi(spelled.name, currentOctave);
    }

    previousMidi = midi;

    return {
      ...spelled,
      octave: currentOctave,
      midi,
    } as ChordTone;
  });
}

function inversionLabel(length: number, index: number) {
  if (index === 0) return "Posición fundamental";
  if (index === 1) return "1ª inversión";
  if (index === 2) return "2ª inversión";
  if (length === 4 && index === 3) return "3ª inversión";
  return `${index}ª inversión`;
}

function buildInversion(rootPosition: ChordTone[], index: number): InversionData {
  const rotated = rootPosition.map((_, currentIndex) => {
    const sourceIndex = (currentIndex + index) % rootPosition.length;
    const wraps = sourceIndex < index ? 1 : 0;
    const source = rootPosition[sourceIndex];
    return {
      ...source,
      octave: source.octave + wraps,
      midi: source.midi + wraps * 12,
    };
  });

  return {
    index,
    label: inversionLabel(rootPosition.length, index),
    notes: rotated,
    noteNames: rotated.map((note) => note.name),
    noteNamesWithOctave: rotated.map((note) => `${note.name}${note.octave}`),
    degrees: rotated.map((note) => note.degree),
    bassNote: rotated[0]?.name || "",
    bassDegree: rotated[0]?.degree || "",
  };
}

function buildChord(root: string, quality: ChordQuality): BuiltChord {
  const rootPosition = buildRootPositionTones(root, quality);
  return {
    root,
    quality,
    family: quality.family,
    symbol: `${root}${quality.symbol}`,
    rootPosition,
    inversions: rootPosition.map((_, index) => buildInversion(rootPosition, index)),
  };
}

function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: readonly T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function expectedNotesText(notes: string[]) {
  return notes.join(" - ");
}

function checkNotesAnswer(input: string, expected: string[]) {
  const normalizedInput = normalizeNotesInput(input);
  const normalizedExpected = expected.map(normalizeNoteToken);
  if (normalizedInput.length !== normalizedExpected.length) return false;
  return normalizedInput.every((note, index) => note === normalizedExpected[index]);
}

function checkChoiceAnswer(input: string, expected: string) {
  return normalizeChoiceLabel(input) === normalizeChoiceLabel(expected);
}

function buildFlashcard(
  chords: BuiltChord[],
  family: ChordFamily,
  enabledModes: FlashcardMode[],
): FlashcardCard {
  const availableChords = chords.filter((chord) => chord.family === family);
  const chord = randomItem(availableChords.length ? availableChords : chords);
  const mode = randomItem(enabledModes.length ? enabledModes : ALL_FLASHCARD_MODES);
  const inversion =
    mode === "chordToNotes"
      ? randomItem(chord.inversions.slice(1))
      : randomItem(chord.inversions);
  const baseId = `${chord.symbol}-${inversion.index}-${mode}-${Date.now()}-${Math.random()}`;

  switch (mode) {
    case "inversionToNotes":
      return {
        id: baseId,
        mode,
        prompt: `${chord.symbol} en ${inversion.label}. Escribe las notas en orden ascendente.`,
        answerKind: "notes",
        answerNotes: inversion.noteNames,
        answerLines: [
          `Acorde: ${chord.symbol}`,
          `Inversión: ${inversion.label}`,
          `Respuesta: ${expectedNotesText(inversion.noteNames)}`,
        ],
        audioNotes: inversion.noteNamesWithOctave,
        chordSymbol: chord.symbol,
        inversionLabel: inversion.label,
        activeInversionIndex: inversion.index,
        inversions: chord.inversions,
      };
    case "notesToInversion":
      return {
        id: baseId,
        mode,
        prompt: `${chord.symbol}. Orden de notas: ${expectedNotesText(
          inversion.noteNames,
        )}. ¿Qué inversión es?`,
        answerKind: "choice",
        answerChoice: inversion.label,
        options: chord.inversions.map((item) => item.label),
        answerLines: [
          `Acorde: ${chord.symbol}`,
          `Orden: ${expectedNotesText(inversion.noteNames)}`,
          `Respuesta: ${inversion.label}`,
        ],
        audioNotes: inversion.noteNamesWithOctave,
        chordSymbol: chord.symbol,
        inversionLabel: inversion.label,
        activeInversionIndex: inversion.index,
        inversions: chord.inversions,
      };
    case "bassToInversion":
      return {
        id: baseId,
        mode,
        prompt: `${chord.symbol}. Si ${inversion.bassNote} está en el bajo, ¿qué inversión es?`,
        answerKind: "choice",
        answerChoice: inversion.label,
        options: chord.inversions.map((item) => item.label),
        answerLines: [
          `Acorde: ${chord.symbol}`,
          `Bajo: ${inversion.bassNote} (${inversion.bassDegree})`,
          `Respuesta: ${inversion.label}`,
        ],
        audioNotes: inversion.noteNamesWithOctave,
        chordSymbol: chord.symbol,
        inversionLabel: inversion.label,
        activeInversionIndex: inversion.index,
        inversions: chord.inversions,
      };
    case "degreesToInversion":
      return {
        id: baseId,
        mode,
        prompt: `${chord.symbol}. Orden de grados: ${inversion.degrees.join(
          " - ",
        )}. ¿Qué inversión corresponde?`,
        answerKind: "choice",
        answerChoice: inversion.label,
        options: chord.inversions.map((item) => item.label),
        answerLines: [
          `Acorde: ${chord.symbol}`,
          `Grados: ${inversion.degrees.join(" - ")}`,
          `Respuesta: ${inversion.label}`,
        ],
        audioNotes: inversion.noteNamesWithOctave,
        chordSymbol: chord.symbol,
        inversionLabel: inversion.label,
        activeInversionIndex: inversion.index,
        inversions: chord.inversions,
      };
    case "chordToNotes":
    default:
      return {
        id: baseId,
        mode,
        prompt: `Toma ${chord.symbol} en posición fundamental y conviértelo a ${inversion.label}. Escribe las notas finales.`,
        answerKind: "notes",
        answerNotes: inversion.noteNames,
        answerLines: [
          `Raíz: ${expectedNotesText(chord.rootPosition.map((note) => note.name))}`,
          `Objetivo: ${inversion.label}`,
          `Respuesta: ${expectedNotesText(inversion.noteNames)}`,
        ],
        audioNotes: inversion.noteNamesWithOctave,
        chordSymbol: chord.symbol,
        inversionLabel: inversion.label,
        activeInversionIndex: inversion.index,
        inversions: chord.inversions,
      };
  }
}

function buildQuizQuestion(
  chords: BuiltChord[],
  enabledFamilies: ChordFamily[],
  enabledTypes: QuizQuestionType[],
): QuizQuestion {
  const familyPool = enabledFamilies.length ? enabledFamilies : (["triad", "seventh"] as ChordFamily[]);
  const sourceChords = chords.filter((chord) => familyPool.includes(chord.family));
  const fallbackChord = sourceChords.length ? sourceChords : chords;
  const validTypes = enabledTypes.filter((type) =>
    type === "distinguishSecondThird"
      ? familyPool.includes("seventh")
      : true,
  );
  const type = randomItem(validTypes.length ? validTypes : ALL_QUIZ_TYPES);
  const familyForType =
    type === "distinguishSecondThird"
      ? "seventh"
      : randomItem(familyPool);
  const familyChords = fallbackChord.filter((chord) => chord.family === familyForType);
  const chord = randomItem(familyChords.length ? familyChords : fallbackChord);
  const inversion =
    type === "distinguishSecondThird"
      ? randomItem(chord.inversions.filter((item) => item.index === 2 || item.index === 3))
      : type === "writeNotes" || type === "convertFromRootPosition"
        ? randomItem(chord.inversions)
        : randomItem(chord.inversions.filter((item) => item.index > 0).length
            ? chord.inversions.filter((item) => item.index > 0)
            : chord.inversions);
  const id = `${type}-${chord.symbol}-${inversion.index}-${Date.now()}-${Math.random()}`;

  switch (type) {
    case "identifyBassInversion":
      return {
        id,
        type,
        family: chord.family,
        prompt: `${chord.symbol}: si ${inversion.bassNote} está en el bajo, ¿qué inversión es?`,
        answerKind: "choice",
        answerChoice: inversion.label,
        options: chord.inversions.map((item) => item.label),
        helperText: `${inversion.bassNote} es el bajo de ${inversion.label}.`,
      };
    case "identifyOrderInversion":
      return {
        id,
        type,
        family: chord.family,
        prompt: `${chord.symbol}: orden ${expectedNotesText(inversion.noteNames)}. ¿Qué inversión es?`,
        answerKind: "choice",
        answerChoice: inversion.label,
        options: chord.inversions.map((item) => item.label),
        helperText: `El orden ${expectedNotesText(inversion.noteNames)} corresponde a ${inversion.label}.`,
      };
    case "writeNotes":
      return {
        id,
        type,
        family: chord.family,
        prompt: `${chord.symbol} en ${inversion.label}. Escribe las notas en orden ascendente.`,
        answerKind: "notes",
        answerNotes: inversion.noteNames,
        helperText: `Respuesta esperada: ${expectedNotesText(inversion.noteNames)}.`,
      };
    case "chooseBassDegree":
      return {
        id,
        type,
        family: chord.family,
        prompt: `${chord.symbol} en ${inversion.label}. ¿Qué grado queda en el bajo?`,
        answerKind: "choice",
        answerChoice: inversion.bassDegree,
        options: shuffle(chord.quality.degreeFormula),
        helperText: `En ${inversion.label}, el bajo es ${inversion.bassDegree}.`,
      };
    case "convertFromRootPosition":
      return {
        id,
        type,
        family: chord.family,
        prompt: `Posición fundamental ${expectedNotesText(
          chord.rootPosition.map((note) => note.name),
        )}. Convierte el acorde a ${inversion.label}.`,
        answerKind: "notes",
        answerNotes: inversion.noteNames,
        helperText: `La conversión correcta es ${expectedNotesText(inversion.noteNames)}.`,
      };
    case "distinguishSecondThird":
    default: {
      const options = chord.inversions
        .filter((item) => item.index === 2 || item.index === 3)
        .map((item) => item.label);
      return {
        id,
        type,
        family: "seventh",
        prompt: `${chord.symbol}: orden ${expectedNotesText(
          inversion.noteNames,
        )}. ¿Es 2ª o 3ª inversión?`,
        answerKind: "choice",
        answerChoice: inversion.label,
        options,
        helperText: `El orden ${expectedNotesText(inversion.noteNames)} corresponde a ${inversion.label}.`,
      };
    }
  }
}

function ChordStaffPreview({ inversion }: { inversion: InversionData }) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const holderId = useRef(
    `chord-inversion-preview-${Math.random().toString(36).slice(2)}`,
  );
  const [width, setWidth] = useState(320);

  useEffect(() => {
    if (!holderRef.current) return undefined;
    const element = holderRef.current;
    const resizeObserver = new ResizeObserver(() => {
      setWidth(Math.max(220, Math.floor(element.clientWidth || 320)));
    });
    resizeObserver.observe(element);
    setWidth(Math.max(220, Math.floor(element.clientWidth || 320)));
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!holderRef.current) return;

    holderRef.current.innerHTML = "";
    const vf = new Factory({
      renderer: {
        elementId: holderId.current,
        width,
        height: 150,
      },
    });
    const context = vf.getContext();
    const stave = new Stave(10, 20, width - 20);
    stave.addClef("treble").addTimeSignature("4/4").setContext(context).draw();

    const note = new StaveNote({
      clef: "treble",
      keys: inversion.notes.map(
        (item) => `${item.letter.toLowerCase()}/${item.octave}`,
      ),
      duration: "w",
    });

    inversion.notes.forEach((item, index) => {
      if (item.accidental) {
        note.addModifier(new Accidental(item.accidental), index);
      }
    });

    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([note]);
    new Formatter().joinVoices([voice]).format([voice], width - 80);
    voice.draw(context, stave);
  }, [inversion, width]);

  return <Box ref={holderRef} id={holderId.current} sx={{ width: "100%", minHeight: 150 }} />;
}

export default function ChordInversionsStudy() {
  const navigate = useNavigate();
  const allChords = useMemo(
    () =>
      ROOT_OPTIONS.flatMap((root) =>
        QUALITY_DEFINITIONS.map((quality) => buildChord(root, quality)),
      ),
    [],
  );

  const [family, setFamily] = useState<ChordFamily>("triad");
  const [qualityId, setQualityId] = useState<string>("major");
  const [root, setRoot] = useState<string>("C");
  const [inversionIndex, setInversionIndex] = useState<InversionIndex>(0);
  const [practiceMode, setPracticeMode] = useState(true);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceResults, setPracticeResults] = useState<Record<string, boolean | null>>({});
  const [activeFlashcardModes, setActiveFlashcardModes] =
    useState<FlashcardMode[]>(ALL_FLASHCARD_MODES);
  const [flashcard, setFlashcard] = useState<FlashcardCard>(() =>
    buildFlashcard(allChords, "triad", ALL_FLASHCARD_MODES),
  );
  const [flashcardInput, setFlashcardInput] = useState("");
  const [flashcardChoice, setFlashcardChoice] = useState("");
  const [flashcardResult, setFlashcardResult] = useState<FlashcardCheckResult | null>(
    null,
  );
  const [flashcardRevealed, setFlashcardRevealed] = useState(false);
  const [flashcardReviewQueue, setFlashcardReviewQueue] = useState<FlashcardCard[]>([]);
  const [flashcardStats, setFlashcardStats] = useState({
    seen: 0,
    correct: 0,
  });
  const [showFlashcardTips, setShowFlashcardTips] = useState(true);
  const [quizFamilies, setQuizFamilies] = useState<ChordFamily[]>([
    "triad",
    "seventh",
  ]);
  const [quizTypes, setQuizTypes] = useState<QuizQuestionType[]>(ALL_QUIZ_TYPES);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion>(() =>
    buildQuizQuestion(allChords, ["triad", "seventh"], ALL_QUIZ_TYPES),
  );
  const [quizInput, setQuizInput] = useState("");
  const [quizChoice, setQuizChoice] = useState("");
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  const playbackTimeouts = useRef<number[]>([]);
  const qualityOptions = useMemo(
    () => QUALITY_DEFINITIONS.filter((quality) => quality.family === family),
    [family],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.family === "triad" || saved.family === "seventh") {
        setFamily(saved.family);
      }
      if (typeof saved.qualityId === "string") {
        setQualityId(saved.qualityId);
      }
      if (typeof saved.root === "string") {
        setRoot(saved.root);
      }
      if (typeof saved.inversionIndex === "number") {
        setInversionIndex(saved.inversionIndex);
      }
      if (typeof saved.practiceMode === "boolean") {
        setPracticeMode(saved.practiceMode);
      }
      if (typeof saved.showFlashcardTips === "boolean") {
        setShowFlashcardTips(saved.showFlashcardTips);
      }
      if (saved.practiceAnswers && typeof saved.practiceAnswers === "object") {
        setPracticeAnswers(saved.practiceAnswers);
      }
    } catch (error) {
      console.error("No se pudo cargar el estudio de inversiones guardado", error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        family,
        qualityId,
        root,
        inversionIndex,
        practiceMode,
        showFlashcardTips,
        practiceAnswers,
      }),
    );
  }, [
    family,
    inversionIndex,
    practiceAnswers,
    practiceMode,
    qualityId,
    root,
    showFlashcardTips,
  ]);

  useEffect(() => {
    if (!qualityOptions.some((quality) => quality.id === qualityId)) {
      setQualityId(qualityOptions[0]?.id || "major");
    }
  }, [qualityId, qualityOptions]);

  const activeQuality =
    qualityOptions.find((quality) => quality.id === qualityId) || qualityOptions[0];
  const activeChord =
    allChords.find(
      (item) =>
        item.family === family &&
        item.root === root &&
        item.quality.id === (activeQuality?.id || "major"),
    ) || allChords[0];

  useEffect(() => {
    if (inversionIndex > activeChord.inversions.length - 1) {
      setInversionIndex(activeChord.inversions.length - 1);
    }
  }, [activeChord.inversions.length, inversionIndex]);

  useEffect(() => {
    clearFlashcardAttempt();
    setFlashcard(buildFlashcard(allChords, family, activeFlashcardModes));
  }, [activeFlashcardModes, allChords, family]);

  useEffect(() => {
    setQuizInput("");
    setQuizChoice("");
    setQuizChecked(false);
    setQuizCorrect(null);
    setQuizQuestion(buildQuizQuestion(allChords, quizFamilies, quizTypes));
  }, [allChords, quizFamilies, quizTypes]);

  useEffect(() => {
    return () => {
      playbackTimeouts.current.forEach((id) => window.clearTimeout(id));
      releaseYamahaVoices();
    };
  }, []);

  const activeInversion =
    activeChord.inversions[inversionIndex] || activeChord.inversions[0];
  const studyRows = useMemo<ChordStudyRow[]>(
    () =>
      activeChord.inversions.map((item) => ({
        key: `${activeChord.symbol}-${item.index}`,
        inversionIndex: item.index,
        inversionLabel: item.label,
        degreesExpected: item.degrees,
        bassNote: item.bassNote,
        bassDegree: item.bassDegree,
        notesExpected: item.noteNames,
      })),
    [activeChord],
  );

  function resetPlayback() {
    playbackTimeouts.current.forEach((id) => window.clearTimeout(id));
    playbackTimeouts.current = [];
    releaseYamahaVoices();
  }

  async function playActiveInversion(mode: "arpeggio" | "block" = "arpeggio") {
    resetPlayback();
    const sampler = await getYamahaSampler();
    const tones = activeInversion.notes.map((note) => toToneNote(note.name, note.octave));
    if (mode === "block") {
      sampler.triggerAttackRelease(tones, 1.2);
      return;
    }

    tones.forEach((tone, index) => {
      const timeoutId = window.setTimeout(() => {
        sampler.triggerAttackRelease(tone, 0.55);
      }, index * 420);
      playbackTimeouts.current.push(timeoutId);
    });
  }

  async function playFlashcardAudio() {
    resetPlayback();
    const sampler = await getYamahaSampler();
    flashcard.audioNotes.forEach((tone, index) => {
      const timeoutId = window.setTimeout(() => {
        sampler.triggerAttackRelease(tone, 0.5);
      }, index * 380);
      playbackTimeouts.current.push(timeoutId);
    });
  }

  function clearFlashcardAttempt() {
    setFlashcardInput("");
    setFlashcardChoice("");
    setFlashcardResult(null);
    setFlashcardRevealed(false);
  }

  function nextFlashcard() {
    clearFlashcardAttempt();
    setFlashcard((prev) => {
      if (flashcardReviewQueue.length > 0) {
        const [first, ...rest] = flashcardReviewQueue;
        setFlashcardReviewQueue(rest);
        return first;
      }

      let next = buildFlashcard(allChords, family, activeFlashcardModes);
      if (prev?.id === next.id) {
        next = buildFlashcard(allChords, family, activeFlashcardModes);
      }
      return next;
    });
  }

  function checkFlashcard() {
    if (flashcardResult) {
      setFlashcardRevealed(true);
      return flashcardResult;
    }
    const result =
      flashcard.answerKind === "notes"
        ? checkNotesAnswer(flashcardInput, flashcard.answerNotes || [])
        : checkChoiceAnswer(flashcardChoice, flashcard.answerChoice || "");
    const expected =
      flashcard.answerKind === "notes"
        ? expectedNotesText(flashcard.answerNotes || [])
        : flashcard.answerChoice || "";
    const finalResult = { isCorrect: result, expected };
    setFlashcardResult(finalResult);
    setFlashcardRevealed(true);
    setFlashcardStats((prev) => ({
      seen: prev.seen + 1,
      correct: prev.correct + (result ? 1 : 0),
    }));
    return finalResult;
  }

  function submitFlashcardAssessment(level: "again" | "hard" | "easy") {
    const lastResult = flashcardResult || checkFlashcard();
    if (level === "again") {
      setFlashcardReviewQueue((prev) => [...prev, flashcard, flashcard]);
    } else if (level === "hard" || !lastResult.isCorrect) {
      setFlashcardReviewQueue((prev) => [...prev, flashcard]);
    }
    nextFlashcard();
  }

  function updatePracticeAnswer(rowKey: string, value: string) {
    setPracticeAnswers((prev) => ({ ...prev, [rowKey]: value }));
    setPracticeResults((prev) => ({ ...prev, [rowKey]: null }));
  }

  function gradePracticeRow(row: ChordStudyRow) {
    const userValue = practiceAnswers[row.key] || "";
    const isCorrect = checkNotesAnswer(userValue, row.notesExpected);
    setPracticeResults((prev) => ({ ...prev, [row.key]: isCorrect }));
  }

  function clearPractice() {
    setPracticeAnswers({});
    setPracticeResults({});
  }

  function toggleFlashcardMode(mode: FlashcardMode, checked: boolean) {
    setActiveFlashcardModes((prev) => {
      if (checked) {
        return prev.includes(mode) ? prev : [...prev, mode];
      }
      const next = prev.filter((item) => item !== mode);
      return next.length ? next : [mode];
    });
  }

  function nextQuizQuestion() {
    setQuizInput("");
    setQuizChoice("");
    setQuizChecked(false);
    setQuizCorrect(null);
    setQuizQuestion(buildQuizQuestion(allChords, quizFamilies, quizTypes));
  }

  function checkQuizAnswer() {
    const isCorrect =
      quizQuestion.answerKind === "notes"
        ? checkNotesAnswer(quizInput, quizQuestion.answerNotes || [])
        : checkChoiceAnswer(quizChoice, quizQuestion.answerChoice || "");
    setQuizChecked(true);
    setQuizCorrect(isCorrect);
  }

  return (
    <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5 }, py: 3 }}>
      <Stack spacing={2.5} maxWidth="1280px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2a50" }}>
            Estudio de Inversiones de Acordes
          </Typography>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Explicación rápida
            </Typography>
            <Typography variant="body1">
              Una inversión no cambia la calidad del acorde. Cambia qué nota queda
              en el bajo y, por tanto, el orden visible de las notas.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Piensa así: posición fundamental = bajo en 1, 1ª inversión = bajo
              en 3 o b3, 2ª inversión = bajo en 5 o b5, 3ª inversión = bajo en 7,
              b7 o bb7.
            </Typography>
            <Alert severity="info" sx={{ alignItems: "center" }}>
              Regla base: conserva el spelling correcto. La inversión rota las
              notas, no las renombra arbitrariamente.
            </Alert>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LightbulbOutlined color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Metodología sugerida
              </Typography>
            </Box>
            <Typography variant="body2">
              Fase 1: entiende la lógica de grados y bajo. Fase 2: haz flashcards
              hasta responder sin calcular demasiado. Fase 3: usa el quiz para
              detectar si ya reconoces las inversiones por orden, bajo y spelling.
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Explorador guiado
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="family-label">Familia</InputLabel>
                  <Select
                    labelId="family-label"
                    label="Familia"
                    value={family}
                    onChange={(event) => setFamily(event.target.value as ChordFamily)}
                  >
                    <MenuItem value="triad">Tríadas</MenuItem>
                    <MenuItem value="seventh">Cuatríadas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="quality-label">Calidad</InputLabel>
                  <Select
                    labelId="quality-label"
                    label="Calidad"
                    value={activeQuality?.id || ""}
                    onChange={(event) => setQualityId(event.target.value)}
                  >
                    {qualityOptions.map((quality) => (
                      <MenuItem key={quality.id} value={quality.id}>
                        {quality.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="root-label">Fundamental</InputLabel>
                  <Select
                    labelId="root-label"
                    label="Fundamental"
                    value={root}
                    onChange={(event) => setRoot(event.target.value)}
                  >
                    {ROOT_OPTIONS.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="inversion-label">Inversión</InputLabel>
                  <Select
                    labelId="inversion-label"
                    label="Inversión"
                    value={activeInversion.index}
                    onChange={(event) => setInversionIndex(Number(event.target.value))}
                  >
                    {activeChord.inversions.map((item) => (
                      <MenuItem key={item.index} value={item.index}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                  <Stack spacing={1.25}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {activeChord.symbol}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeQuality?.description}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label={`Fórmula: ${activeQuality?.degreeFormula.join(" - ")}`} />
                      <Chip label={`Inversión activa: ${activeInversion.label}`} color="primary" />
                      <Chip
                        label={`Bajo: ${activeInversion.bassNote} (${activeInversion.bassDegree})`}
                        color="secondary"
                        variant="outlined"
                      />
                    </Stack>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Notas resultantes
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {activeInversion.noteNames.map((note, index) => (
                          <Chip
                            key={`${note}-${index}`}
                            label={`${note} (${activeInversion.degrees[index]})`}
                            variant={index === 0 ? "filled" : "outlined"}
                            color={index === 0 ? "success" : "default"}
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => playActiveInversion("arpeggio")}
                      >
                        Escuchar arpegio
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PlayArrow />}
                        onClick={() => playActiveInversion("block")}
                      >
                        Escuchar bloque
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Voicing estático en clave de Sol
                  </Typography>
                  <ChordStaffPreview inversion={activeInversion} />
                </Paper>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Resumen visual de inversiones
              </Typography>
              <Grid container spacing={1.5}>
                {activeChord.inversions.map((item) => (
                  <Grid item xs={12} sm={6} md={3} key={`${activeChord.symbol}-${item.index}`}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderColor:
                          item.index === activeInversion.index ? "primary.main" : "divider",
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Bajo: {item.bassNote} ({item.bassDegree})
                        </Typography>
                        <Typography variant="body2">
                          {expectedNotesText(item.noteNames)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Grados: {item.degrees.join(" - ")}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 1.5,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Práctica rápida: flashcards
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reconoce inversiones por bajo, orden de grados y spelling.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showFlashcardTips}
                      onChange={(event) => setShowFlashcardTips(event.target.checked)}
                    />
                  }
                  label="Mostrar tips"
                />
                <Chip
                  label={`Vistas: ${flashcardStats.seen}`}
                  color="default"
                  variant="outlined"
                />
                <Chip
                  label={`Correctas: ${flashcardStats.correct}`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`Repaso: ${flashcardReviewQueue.length}`}
                  color="warning"
                  variant="outlined"
                />
              </Stack>
            </Box>

            <FormGroup row>
              {ALL_FLASHCARD_MODES.map((mode) => (
                <FormControlLabel
                  key={mode}
                  control={
                    <Checkbox
                      checked={activeFlashcardModes.includes(mode)}
                      onChange={(event) => toggleFlashcardMode(mode, event.target.checked)}
                    />
                  }
                  label={FLASHCARD_MODE_LABELS[mode]}
                />
              ))}
            </FormGroup>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {flashcard.chordSymbol}
                    </Typography>
                    <Typography variant="body1">{flashcard.prompt}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={playFlashcardAudio}
                    >
                      Escuchar
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={nextFlashcard}
                    >
                      Otra
                    </Button>
                  </Stack>
                </Stack>

                {flashcard.answerKind === "notes" ? (
                  <TextField
                    label="Tu respuesta"
                    placeholder="Ej. C E G Bb"
                    fullWidth
                    value={flashcardInput}
                    onChange={(event) => setFlashcardInput(event.target.value)}
                  />
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(flashcard.options || []).map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        clickable
                        color={flashcardChoice === option ? "primary" : "default"}
                        variant={flashcardChoice === option ? "filled" : "outlined"}
                        onClick={() => setFlashcardChoice(option)}
                      />
                    ))}
                  </Stack>
                )}

                {showFlashcardTips ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      backgroundColor: "#f7fbff",
                      borderColor: "rgba(21, 101, 192, 0.2)",
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Tip de estudio: resumen visual de inversiones
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Usa este apoyo mientras memorizas qué grado cae en el bajo y
                        cómo se reordena el acorde.
                      </Typography>
                      <Grid container spacing={1}>
                        {flashcard.inversions.map((item) => (
                          <Grid item xs={12} sm={6} md={3} key={`${flashcard.id}-${item.index}`}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1,
                                borderColor:
                                  item.index === flashcard.activeInversionIndex
                                    ? "primary.main"
                                    : "divider",
                                backgroundColor:
                                  item.index === flashcard.activeInversionIndex
                                    ? "rgba(25, 118, 210, 0.05)"
                                    : "transparent",
                              }}
                            >
                              <Stack spacing={0.4}>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  {item.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Bajo: {item.bassNote} ({item.bassDegree})
                                </Typography>
                                <Typography variant="caption">
                                  {expectedNotesText(item.noteNames)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.degrees.join(" - ")}
                                </Typography>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  </Paper>
                ) : null}

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="contained" onClick={checkFlashcard}>
                    Comprobar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setFlashcardRevealed(true);
                      if (!flashcardResult) {
                        setFlashcardResult({
                          isCorrect: false,
                          expected:
                            flashcard.answerKind === "notes"
                              ? expectedNotesText(flashcard.answerNotes || [])
                              : flashcard.answerChoice || "",
                        });
                      }
                    }}
                  >
                    Mostrar respuesta
                  </Button>
                </Stack>

                {flashcardRevealed ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderColor: flashcardResult?.isCorrect ? "success.main" : "warning.main",
                    }}
                  >
                    <Stack spacing={0.75}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {flashcardResult?.isCorrect ? (
                          <CheckCircleOutline color="success" />
                        ) : (
                          <CancelOutlined color="warning" />
                        )}
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {flashcardResult?.isCorrect ? "Correcto" : "Respuesta mostrada"}
                        </Typography>
                      </Box>
                      {flashcard.answerLines.map((line) => (
                        <Typography key={line} variant="body2">
                          {line}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                ) : null}

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button onClick={() => submitFlashcardAssessment("again")} color="warning">
                    Again
                  </Button>
                  <Button onClick={() => submitFlashcardAssessment("hard")} color="secondary">
                    Hard
                  </Button>
                  <Button onClick={() => submitFlashcardAssessment("easy")} color="success">
                    Easy
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 1.5,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Tabla de memorización y práctica escrita
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trabaja cada inversión del acorde activo y corrige fila por fila.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={practiceMode}
                      onChange={(event) => setPracticeMode(event.target.checked)}
                    />
                  }
                  label="Modo práctica"
                />
                <Button variant="outlined" startIcon={<Refresh />} onClick={clearPractice}>
                  Limpiar
                </Button>
              </Stack>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Inversión</TableCell>
                  <TableCell>Grados esperados</TableCell>
                  <TableCell>Bajo</TableCell>
                  <TableCell>Notas del acorde</TableCell>
                  <TableCell>Respuesta del usuario</TableCell>
                  <TableCell>Validación</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studyRows.map((row) => {
                  const result = practiceResults[row.key];
                  return (
                    <TableRow key={row.key}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.inversionLabel}</TableCell>
                      <TableCell>{row.degreesExpected.join(" - ")}</TableCell>
                      <TableCell>
                        {row.bassNote} ({row.bassDegree})
                      </TableCell>
                      <TableCell>
                        {practiceMode ? "•••" : expectedNotesText(row.notesExpected)}
                      </TableCell>
                      <TableCell sx={{ minWidth: 260 }}>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Ej. E G C"
                            value={practiceAnswers[row.key] || ""}
                            onChange={(event) =>
                              updatePracticeAnswer(row.key, event.target.value)
                            }
                          />
                          <Button
                            variant="outlined"
                            onClick={() => gradePracticeRow(row)}
                          >
                            Revisar
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {result === null || typeof result === "undefined" ? (
                          <Chip label="Pendiente" size="small" variant="outlined" />
                        ) : result ? (
                          <Chip label="Correcto" size="small" color="success" />
                        ) : (
                          <Chip
                            label={`Esperado: ${expectedNotesText(row.notesExpected)}`}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Quiz tipo examen
              </Typography>
            </Box>

            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Familias incluidas
              </Typography>
              <FormGroup row>
                {(["triad", "seventh"] as ChordFamily[]).map((item) => (
                  <FormControlLabel
                    key={item}
                    control={
                      <Checkbox
                        checked={quizFamilies.includes(item)}
                        onChange={(event) => {
                          setQuizFamilies((prev) => {
                            const next = event.target.checked
                              ? [...prev, item]
                              : prev.filter((value) => value !== item);
                            return next.length ? next : [item];
                          });
                        }}
                      />
                    }
                    label={item === "triad" ? "Tríadas" : "Cuatríadas"}
                  />
                ))}
              </FormGroup>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Tipos de pregunta
              </Typography>
              <FormGroup row>
                {ALL_QUIZ_TYPES.map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={quizTypes.includes(type)}
                        onChange={(event) => {
                          setQuizTypes((prev) => {
                            const next = event.target.checked
                              ? [...prev, type]
                              : prev.filter((value) => value !== type);
                            return next.length ? next : [type];
                          });
                        }}
                      />
                    }
                    label={QUIZ_TYPE_LABELS[type]}
                  />
                ))}
              </FormGroup>
            </Stack>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {quizQuestion.prompt}
                </Typography>
                <Chip
                  label={
                    quizQuestion.family === "triad"
                      ? "Familia: Tríadas"
                      : "Familia: Cuatríadas"
                  }
                  variant="outlined"
                  sx={{ width: "fit-content" }}
                />

                {quizQuestion.answerKind === "notes" ? (
                  <TextField
                    label="Tu respuesta"
                    placeholder="Ej. G Bb D F"
                    fullWidth
                    value={quizInput}
                    onChange={(event) => setQuizInput(event.target.value)}
                  />
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(quizQuestion.options || []).map((option) => (
                      <Chip
                        key={option}
                        label={option}
                        clickable
                        color={quizChoice === option ? "primary" : "default"}
                        variant={quizChoice === option ? "filled" : "outlined"}
                        onClick={() => setQuizChoice(option)}
                      />
                    ))}
                  </Stack>
                )}

                <Stack direction="row" spacing={1}>
                  <Button variant="contained" onClick={checkQuizAnswer}>
                    Revisar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={nextQuizQuestion}
                  >
                    Siguiente
                  </Button>
                </Stack>

                {quizChecked ? (
                  <Alert severity={quizCorrect ? "success" : "warning"}>
                    {quizCorrect ? "Correcto. " : "Incorrecto. "}
                    {quizQuestion.helperText}
                  </Alert>
                ) : (
                  <Alert severity="info" icon={<AccessTime />}>
                    Responde y revisa. Usa los filtros para concentrarte en el tipo
                    de error que más te cuesta.
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
