import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel,
  Checkbox,
  FormGroup,
  IconButton,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  ArrowBack,
  Refresh,
  AccessTime,
  CheckCircleOutline,
  CancelOutlined,
  Send as SendIcon,
  LightbulbOutlined,
  PlayArrowRounded,
  DeleteOutline,
  School,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as Tone from "tone";
import { Factory, Stave } from "vexflow";
import { getYamahaSampler, releaseYamahaVoices } from "../utils/yamahaSampler";

type RootLabel =
  | "C"
  | "Db"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "Gb"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B";
type WheelSide = "neutral" | "sharp" | "flat" | "mixed";

function extractAmericanNotation(text: string) {
  if (!text) return text;
  const match = text.match(/\(([^)]+)\)/);
  return match ? match[1] : text;
}

function normalizeAccidentals(text: string) {
  return (text || "")
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeAmericanScaleNote(note: string) {
  return normalizeAccidentals(note).replace(/\s+/g, "").toLowerCase();
}

function normalizeAmericanMinorKey(key: string) {
  const compact = normalizeAccidentals(key).replace(/\s+/g, "");
  const match = compact.match(/^([a-g])(b|#)?(m|minor)$/i);
  if (!match) return compact.toLowerCase();
  return `${match[1].toUpperCase()}${match[2] || ""}m`;
}

function gradePracticeRowState(
  state: { notes: string[]; relativeMinor: string },
  expectedNotes: string[],
  expectedRelativeMinor: string,
) {
  const notesCorrect = state.notes.map(
    (note, index) =>
      normalizeAmericanScaleNote(note) ===
      normalizeAmericanScaleNote(expectedNotes[index]),
  );

  const relativeMinorCorrect =
    normalizeAmericanMinorKey(state.relativeMinor) ===
    normalizeAmericanMinorKey(expectedRelativeMinor);

  return { notesCorrect, relativeMinorCorrect };
}

function parseMajorMinorPair(text: string) {
  const normalized = normalizeAccidentals(text);
  const match = normalized.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (match) {
    return { major: match[1].trim(), minor: match[2].trim() };
  }
  return { major: normalized, minor: "" };
}

type ScaleGuideRow = {
  major: string;
  notes: string[];
  minorNotes: string[];
  sixthDegree: string;
  relativeMinor: string;
  keySignature: string;
};

type SubtableRow = {
  tonality: string;
  tonalityEn: string;
  count: number;
  majorScale: string[];
  relativeMinor: string;
};

type WheelSlot = {
  id: string;
  major: string;
  minor: string;
  signature: string;
  side: WheelSide;
  matchRoots: RootLabel[];
};

type QuizQuestionType =
  | "majorToMinor"
  | "minorToMajor"
  | "writeMajor"
  | "writeMinor"
  | "identifySixth"
  | "identifyNthDegree"
  | "countAccidentals"
  | "identifyKeyByAccidentals"
  | "identifyAccidentalType"
  | "writeMinorFromMajor"
  | "identifyNthDegreeMinor"
  | "orderOfAccidentals"
  | "identifyKeyBySignatureType";

const ALL_QUIZ_TYPES: QuizQuestionType[] = [
  "majorToMinor",
  "minorToMajor",
  "writeMajor",
  "writeMinor",
  "identifySixth",
  "identifyNthDegree",
  "countAccidentals",
  "identifyKeyByAccidentals",
  "identifyAccidentalType",
  "writeMinorFromMajor",
  "identifyNthDegreeMinor",
  "orderOfAccidentals",
  "identifyKeyBySignatureType",
];

type QuizQuestion = {
  type: QuizQuestionType;
  questionText: string;
  answer?: string;
  options?: string[];
  answerArray?: string[];
};

type FlashcardMode =
  | "majorToMinor"
  | "minorToMajor"
  | "signatureToKeys"
  | "sixthDegreeToKey"
  | "notesToMinorKey";

type FlashcardAssessment = "again" | "hard" | "easy";

type FlashcardCheckResult = {
  isCorrect: boolean;
  parts?: boolean[];
};

const DEGREE_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
const SCALE_COLUMNS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
const CHROMATIC_ROOTS = [
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

const ROOT_SIGNATURE_INFO: Record<RootLabel, { relativeMinor: string }> = {
  C: { relativeMinor: "Am" },
  Db: { relativeMinor: "Bbm" },
  D: { relativeMinor: "Bm" },
  Eb: { relativeMinor: "Cm" },
  E: { relativeMinor: "C#m" },
  F: { relativeMinor: "Dm" },
  Gb: { relativeMinor: "Ebm" },
  G: { relativeMinor: "Em" },
  Ab: { relativeMinor: "Fm" },
  A: { relativeMinor: "F#m" },
  Bb: { relativeMinor: "Gm" },
  B: { relativeMinor: "G#m" },
};

const CIRCLE_WHEEL_SLOTS: WheelSlot[] = [
  {
    id: "C",
    major: "C",
    minor: "Am",
    signature: "0",
    side: "neutral",
    matchRoots: ["C"],
  },
  {
    id: "G",
    major: "G",
    minor: "Em",
    signature: "1#",
    side: "sharp",
    matchRoots: ["G"],
  },
  {
    id: "D",
    major: "D",
    minor: "Bm",
    signature: "2#",
    side: "sharp",
    matchRoots: ["D"],
  },
  {
    id: "A",
    major: "A",
    minor: "F#m",
    signature: "3#",
    side: "sharp",
    matchRoots: ["A"],
  },
  {
    id: "E",
    major: "E",
    minor: "C#m",
    signature: "4#",
    side: "sharp",
    matchRoots: ["E"],
  },
  {
    id: "B",
    major: "B / Cb",
    minor: "G#m / Abm",
    signature: "5# / 7b",
    side: "mixed",
    matchRoots: ["B"],
  },
  {
    id: "GbFsharp",
    major: "Gb / F#",
    minor: "Ebm / D#m",
    signature: "6b / 6#",
    side: "mixed",
    matchRoots: ["Gb"],
  },
  {
    id: "DbCsharp",
    major: "Db / C#",
    minor: "Bbm / A#m",
    signature: "5b / 7#",
    side: "mixed",
    matchRoots: ["Db"],
  },
  {
    id: "Ab",
    major: "Ab",
    minor: "Fm",
    signature: "4b",
    side: "flat",
    matchRoots: ["Ab"],
  },
  {
    id: "Eb",
    major: "Eb",
    minor: "Cm",
    signature: "3b",
    side: "flat",
    matchRoots: ["Eb"],
  },
  {
    id: "Bb",
    major: "Bb",
    minor: "Gm",
    signature: "2b",
    side: "flat",
    matchRoots: ["Bb"],
  },
  {
    id: "F",
    major: "F",
    minor: "Dm",
    signature: "1b",
    side: "flat",
    matchRoots: ["F"],
  },
];

const FLAT_SUBTABLE: SubtableRow[] = [
  {
    tonality: "Fa",
    tonalityEn: "F",
    count: 1,
    majorScale: ["F", "G", "A", "Bb", "C", "D", "E", "F"],
    relativeMinor: "Dm",
  },
  {
    tonality: "Sib",
    tonalityEn: "Bb",
    count: 2,
    majorScale: ["Bb", "C", "D", "Eb", "F", "G", "A", "Bb"],
    relativeMinor: "Gm",
  },
  {
    tonality: "Mib",
    tonalityEn: "Eb",
    count: 3,
    majorScale: ["Eb", "F", "G", "Ab", "Bb", "C", "D", "Eb"],
    relativeMinor: "Cm",
  },
  {
    tonality: "Lab",
    tonalityEn: "Ab",
    count: 4,
    majorScale: ["Ab", "Bb", "C", "Db", "Eb", "F", "G", "Ab"],
    relativeMinor: "Fm",
  },
  {
    tonality: "Reb",
    tonalityEn: "Db",
    count: 5,
    majorScale: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C", "Db"],
    relativeMinor: "Bbm",
  },
  {
    tonality: "Solb",
    tonalityEn: "Gb",
    count: 6,
    majorScale: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F", "Gb"],
    relativeMinor: "Ebm",
  },
];

const SHARP_SUBTABLE: SubtableRow[] = [
  {
    tonality: "Sol",
    tonalityEn: "G",
    count: 1,
    majorScale: ["G", "A", "B", "C", "D", "E", "F#", "G"],
    relativeMinor: "Em",
  },
  {
    tonality: "Re",
    tonalityEn: "D",
    count: 2,
    majorScale: ["D", "E", "F#", "G", "A", "B", "C#", "D"],
    relativeMinor: "Bm",
  },
  {
    tonality: "La",
    tonalityEn: "A",
    count: 3,
    majorScale: ["A", "B", "C#", "D", "E", "F#", "G#", "A"],
    relativeMinor: "F#m",
  },
  {
    tonality: "Mi",
    tonalityEn: "E",
    count: 4,
    majorScale: ["E", "F#", "G#", "A", "B", "C#", "D#", "E"],
    relativeMinor: "C#m",
  },
  {
    tonality: "Si",
    tonalityEn: "B",
    count: 5,
    majorScale: ["B", "C#", "D#", "E", "F#", "G#", "A#", "B"],
    relativeMinor: "G#m",
  },
  {
    tonality: "Fa#",
    tonalityEn: "F#",
    count: 6,
    majorScale: ["F#", "G#", "A#", "B", "C#", "D#", "E#", "F#"],
    relativeMinor: "D#m",
  },
  {
    tonality: "Do#",
    tonalityEn: "C#",
    count: 7,
    majorScale: ["C#", "D#", "E#", "F#", "G#", "A#", "B#", "C#"],
    relativeMinor: "A#m",
  },
];

const SCALE_GUIDE: ScaleGuideRow[] = [
  {
    major: "C",
    notes: ["C", "D", "E", "F", "G", "A", "B", "C"],
    minorNotes: ["A", "B", "C", "D", "E", "F", "G", "A"],
    sixthDegree: "A",
    relativeMinor: "Am",
    keySignature: "0 alteraciones",
  },
  {
    major: "F",
    notes: ["F", "G", "A", "Bb", "C", "D", "E", "F"],
    minorNotes: ["D", "E", "F", "G", "A", "Bb", "C", "D"],
    sixthDegree: "D",
    relativeMinor: "Dm",
    keySignature: "1 bemol (Bb)",
  },
  {
    major: "Bb",
    notes: ["Bb", "C", "D", "Eb", "F", "G", "A", "Bb"],
    minorNotes: ["G", "A", "Bb", "C", "D", "Eb", "F", "G"],
    sixthDegree: "G",
    relativeMinor: "Gm",
    keySignature: "2 bemoles (Bb, Eb)",
  },
  {
    major: "Eb",
    notes: ["Eb", "F", "G", "Ab", "Bb", "C", "D", "Eb"],
    minorNotes: ["C", "D", "Eb", "F", "G", "Ab", "Bb", "C"],
    sixthDegree: "C",
    relativeMinor: "Cm",
    keySignature: "3 bemoles (Bb, Eb, Ab)",
  },
  {
    major: "Ab",
    notes: ["Ab", "Bb", "C", "Db", "Eb", "F", "G", "Ab"],
    minorNotes: ["F", "G", "Ab", "Bb", "C", "Db", "Eb", "F"],
    sixthDegree: "F",
    relativeMinor: "Fm",
    keySignature: "4 bemoles (Bb, Eb, Ab, Db)",
  },
  {
    major: "Db",
    notes: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C", "Db"],
    minorNotes: ["Bb", "C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
    sixthDegree: "Bb",
    relativeMinor: "Bbm",
    keySignature: "5 bemoles",
  },
  {
    major: "Gb",
    notes: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F", "Gb"],
    minorNotes: ["Eb", "F", "Gb", "Ab", "Bb", "Cb", "Db", "Eb"],
    sixthDegree: "Eb",
    relativeMinor: "Ebm",
    keySignature: "6 bemoles",
  },
  {
    major: "G",
    notes: ["G", "A", "B", "C", "D", "E", "F#", "G"],
    minorNotes: ["E", "F#", "G", "A", "B", "C", "D", "E"],
    sixthDegree: "E",
    relativeMinor: "Em",
    keySignature: "1 sostenido (F#)",
  },
  {
    major: "D",
    notes: ["D", "E", "F#", "G", "A", "B", "C#", "D"],
    minorNotes: ["B", "C#", "D", "E", "F#", "G", "A", "B"],
    sixthDegree: "B",
    relativeMinor: "Bm",
    keySignature: "2 sostenidos (F#, C#)",
  },
  {
    major: "A",
    notes: ["A", "B", "C#", "D", "E", "F#", "G#", "A"],
    minorNotes: ["F#", "G#", "A", "B", "C#", "D", "E", "F#"],
    sixthDegree: "F#",
    relativeMinor: "F#m",
    keySignature: "3 sostenidos (F#, C#, G#)",
  },
  {
    major: "E",
    notes: ["E", "F#", "G#", "A", "B", "C#", "D#", "E"],
    minorNotes: ["C#", "D#", "E", "F#", "G#", "A", "B", "C#"],
    sixthDegree: "C#",
    relativeMinor: "C#m",
    keySignature: "4 sostenidos",
  },
  {
    major: "B",
    notes: ["B", "C#", "D#", "E", "F#", "G#", "A#", "B"],
    minorNotes: ["G#", "A#", "B", "C#", "D#", "E", "F#", "G#"],
    sixthDegree: "G#",
    relativeMinor: "G#m",
    keySignature: "5 sostenidos",
  },
];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let idx = copy.length - 1; idx > 0; idx -= 1) {
    const j = Math.floor(Math.random() * (idx + 1));
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
  }
  return copy;
}

function createQuizQuestion(
  enabledTypes: QuizQuestionType[] = ALL_QUIZ_TYPES,
): QuizQuestion {
  const target = SCALE_GUIDE[Math.floor(Math.random() * SCALE_GUIDE.length)];

  // If no types selected, fallback to all to prevent crash
  if (enabledTypes.length === 0) enabledTypes = ALL_QUIZ_TYPES;
  const pickedType =
    enabledTypes[Math.floor(Math.random() * enabledTypes.length)];

  if (pickedType === "writeMajor") {
    return {
      type: "writeMajor",
      questionText: `Escribe las 7 notas de la escala de ${target.major} en orden:`,
      answerArray: target.notes.slice(0, 7),
    };
  } else if (pickedType === "writeMinor") {
    return {
      type: "writeMinor",
      questionText: `Escribe las 7 notas de la escala de ${target.relativeMinor} natural en orden:`,
      answerArray: target.minorNotes.slice(0, 7),
    };
  } else if (pickedType === "identifySixth") {
    return {
      type: "identifySixth",
      questionText: `¿Cuál es el 6º grado de ${target.major}?`,
      answer: target.sixthDegree,
    };
  } else if (pickedType === "majorToMinor") {
    const distractors = shuffle(
      SCALE_GUIDE.filter(
        (row) => row.relativeMinor !== target.relativeMinor,
      ).map((row) => row.relativeMinor),
    ).slice(0, 3);

    return {
      type: "majorToMinor",
      questionText: `¿Cuál es el relativo menor de ${target.major}?`,
      answer: target.relativeMinor,
      options: shuffle([target.relativeMinor, ...distractors]),
    };
  } else if (pickedType === "minorToMajor") {
    const distractors = shuffle(
      SCALE_GUIDE.filter((row) => row.major !== target.major).map(
        (row) => row.major,
      ),
    ).slice(0, 3);

    return {
      type: "minorToMajor",
      questionText: `¿Cuál es la escala mayor relativa de ${target.relativeMinor}?`,
      answer: target.major,
      options: shuffle([target.major, ...distractors]),
    };
  } else if (pickedType === "identifyNthDegree") {
    const degreeIndex = Math.floor(Math.random() * 6) + 1; // 1 to 6 (so 2nd to 7th degree)
    const degreeNames = ["1º", "2º", "3º", "4º", "5º", "6º", "7º"];
    return {
      type: "identifyNthDegree",
      questionText: `¿Cuál es el ${degreeNames[degreeIndex]} grado de ${target.major} mayor?`,
      answer: target.notes[degreeIndex],
    };
  } else if (pickedType === "countAccidentals") {
    const accidentals = target.keySignature;
    const typeAcc = accidentals.includes("b")
      ? "bemoles"
      : accidentals.includes("#")
        ? "sostenidos"
        : "alteraciones";
    const count = accidentals === "0" ? "0" : accidentals.replace(/b|#/, "");

    const possibleCounts = ["0", "1", "2", "3", "4", "5", "6", "7"];
    const distractors = shuffle(
      possibleCounts.filter((c) => c !== count),
    ).slice(0, 3);

    return {
      type: "countAccidentals",
      questionText: `¿Cuántos ${typeAcc} tiene la armadura de ${target.major} mayor?`,
      answer: count,
      options: shuffle([count, ...distractors]),
    };
  } else if (pickedType === "identifyKeyByAccidentals") {
    const accidentals = target.keySignature;
    const desc =
      accidentals === "0 alteraciones" ? "0 alteraciones" : accidentals;

    const distractors = shuffle(
      SCALE_GUIDE.filter((row) => row.major !== target.major).map(
        (row) => row.major,
      ),
    ).slice(0, 3);

    return {
      type: "identifyKeyByAccidentals",
      questionText: `¿Qué escala mayor tiene ${desc} en su armadura?`,
      answer: target.major,
      options: shuffle([target.major, ...distractors]),
    };
  } else if (pickedType === "identifyAccidentalType") {
    let ans = "Ninguna";
    if (target.keySignature.includes("b")) ans = "Bemoles";
    if (target.keySignature.includes("#")) ans = "Sostenidos";
    return {
      type: "identifyAccidentalType",
      questionText: `¿La armadura de ${target.major} mayor usa sostenidos o bemoles?`,
      answer: ans,
      options: ["Sostenidos", "Bemoles", "Ninguna"],
    };
  } else if (pickedType === "writeMinorFromMajor") {
    return {
      type: "writeMinorFromMajor",
      questionText: `Si estás en ${target.major}, escribe las 7 notas de su relativo menor:`,
      answerArray: target.minorNotes.slice(0, 7),
    };
  } else if (pickedType === "identifyNthDegreeMinor") {
    const degreeIndex = Math.floor(Math.random() * 6) + 1; // 2nd to 7th degree
    const degreeNames = ["1º", "2º", "3º", "4º", "5º", "6º", "7º"];
    return {
      type: "identifyNthDegreeMinor",
      questionText: `¿Cuál es el ${degreeNames[degreeIndex]} grado de ${target.relativeMinor} natural?`,
      answer: target.minorNotes[degreeIndex],
    };
  } else if (pickedType === "orderOfAccidentals") {
    const isFlats = Math.random() > 0.5;
    const orderItems = isFlats
      ? ["Si", "Mi", "La", "Re", "Sol", "Do", "Fa"]
      : ["Fa", "Do", "Sol", "Re", "La", "Mi", "Si"];
    const typeName = isFlats ? "bemol" : "sostenido";
    const typeNamePlural = isFlats ? "bemoles" : "sostenidos";
    const degreeIndex = Math.floor(Math.random() * 7);
    const degreeNames = ["1er", "2do", "3er", "4to", "5to", "6to", "7mo"];

    return {
      type: "orderOfAccidentals",
      questionText: `¿Cuál es el ${degreeNames[degreeIndex]} ${typeName} en el orden de ${typeNamePlural}?`,
      answer: orderItems[degreeIndex],
    };
  } else {
    // identifyKeyBySignatureType
    const typesAvailable = ["Sostenidos", "Bemoles"];
    const askedType =
      typesAvailable[Math.floor(Math.random() * typesAvailable.length)];

    // the user will type a key name. Let's make this an open text question that accepts any valid key
    // Instead of free text, let's make it multiple choice to avoid complex regex checking (user could type C, Do, etc)
    const correctTarget = shuffle(
      SCALE_GUIDE.filter(
        (row) =>
          (askedType === "Sostenidos" && row.keySignature.includes("#")) ||
          (askedType === "Bemoles" && row.keySignature.includes("b")),
      ),
    )[0];

    const distractors = shuffle(
      SCALE_GUIDE.filter(
        (row) =>
          row.major !== correctTarget.major &&
          ((askedType === "Sostenidos" && !row.keySignature.includes("#")) ||
            (askedType === "Bemoles" && !row.keySignature.includes("b"))),
      ),
    ).slice(0, 3);

    return {
      type: "identifyKeyBySignatureType",
      questionText: `Selecciona una tonalidad mayor que use ${askedType.toLowerCase()} en su armadura:`,
      answer: correctTarget.major,
      options: shuffle([
        correctTarget.major,
        ...distractors.map((d) => d.major),
      ]),
    };
  }
}

type MajorOnlyQuestionType =
  | "majorNotes"
  | "majorKeyByAccidentals"
  | "countMajorAccidentals"
  | "accidentalType"
  | "nthDegreeOfMajor"
  | "majorByNthDegree"
  | "orderOfSharps"
  | "orderOfFlats";

const ALL_MAJOR_ONLY_TYPES: MajorOnlyQuestionType[] = [
  "majorNotes",
  "majorKeyByAccidentals",
  "countMajorAccidentals",
  "accidentalType",
  "nthDegreeOfMajor",
  "majorByNthDegree",
  "orderOfSharps",
  "orderOfFlats",
];

const MAJOR_ONLY_MODE_LABELS: Record<MajorOnlyQuestionType, string> = {
  majorNotes: "Escribe las notas de la escala",
  majorKeyByAccidentals: "¿Qué escala tiene N alteraciones?",
  countMajorAccidentals: "¿Cuántas alteraciones tiene?",
  accidentalType: "¿Sostenidos o bemoles?",
  nthDegreeOfMajor: "¿Cuál es el N-ésimo grado?",
  majorByNthDegree: "¿Qué escala mayor tiene este grado?",
  orderOfSharps: "Orden de sostenidos",
  orderOfFlats: "Orden de bemoles",
};

type MajorOnlyFlashcard = {
  type: MajorOnlyQuestionType;
  target: ScaleGuideRow;
  question: QuizQuestion;
  hintSteps: string[];
};

type FlashcardReviewItem =
  | { kind: "relative"; major: string; mode: FlashcardMode }
  | { kind: "majorOnly"; card: MajorOnlyFlashcard };

function generateMajorOnlyQuestion(
  enabledTypes: MajorOnlyQuestionType[] = ALL_MAJOR_ONLY_TYPES,
): QuizQuestion {
  const target = SCALE_GUIDE[Math.floor(Math.random() * SCALE_GUIDE.length)];
  if (enabledTypes.length === 0) enabledTypes = ALL_MAJOR_ONLY_TYPES;
  const pickedType =
    enabledTypes[Math.floor(Math.random() * enabledTypes.length)];

  if (pickedType === "majorNotes") {
    return {
      type: "writeMajor",
      questionText: `Escribe las 7 notas de ${target.major} en orden:`,
      answerArray: target.notes.slice(0, 7),
    };
  } else if (pickedType === "majorKeyByAccidentals") {
    const desc = target.keySignature;
    const distractors = shuffle(
      SCALE_GUIDE.filter((r) => r.major !== target.major).map((r) => r.major),
    ).slice(0, 3);
    return {
      type: "identifyKeyByAccidentals",
      questionText: `¿Qué escala mayor tiene ${desc} en su armadura?`,
      answer: target.major,
      options: shuffle([target.major, ...distractors]),
    };
  } else if (pickedType === "countMajorAccidentals") {
    const acc = target.keySignature;
    const typeAcc = acc.includes("b")
      ? "bemoles"
      : acc.includes("#")
        ? "sostenidos"
        : "alteraciones";
    const count = acc === "0 alteraciones" ? "0" : acc.replace(/[^0-9]/g, "");
    const distractors = shuffle(
      ["0", "1", "2", "3", "4", "5", "6", "7"].filter((c) => c !== count),
    ).slice(0, 3);
    return {
      type: "countAccidentals",
      questionText: `¿Cuántos ${typeAcc} tiene la armadura de ${target.major}?`,
      answer: count,
      options: shuffle([count, ...distractors]),
    };
  } else if (pickedType === "accidentalType") {
    let ans = "Ninguna";
    if (target.keySignature.includes("b")) ans = "Bemoles";
    if (target.keySignature.includes("#")) ans = "Sostenidos";
    return {
      type: "identifyAccidentalType",
      questionText: `¿La armadura de ${target.major} usa sostenidos o bemoles?`,
      answer: ans,
      options: ["Sostenidos", "Bemoles", "Ninguna"],
    };
  } else if (pickedType === "nthDegreeOfMajor") {
    const degreeIndex = Math.floor(Math.random() * 6) + 1;
    const degreeNames = ["1º", "2º", "3º", "4º", "5º", "6º", "7º"];
    return {
      type: "identifyNthDegree",
      questionText: `¿Cuál es el ${degreeNames[degreeIndex]} grado de ${target.major}?`,
      answer: target.notes[degreeIndex],
    };
  } else if (pickedType === "majorByNthDegree") {
    const degreeIndex = Math.floor(Math.random() * 5) + 1;
    const degreeNames = ["1º", "2º", "3º", "4º", "5º", "6º", "7º"];
    const distractors = shuffle(
      SCALE_GUIDE.filter((r) => r.major !== target.major).map((r) => r.major),
    ).slice(0, 3);
    return {
      type: "identifyKeyByAccidentals",
      questionText: `¿Qué escala mayor tiene "${target.notes[degreeIndex]}" como ${degreeNames[degreeIndex]} grado?`,
      answer: target.major,
      options: shuffle([target.major, ...distractors]),
    };
  } else if (pickedType === "orderOfSharps") {
    const orderItems = ["Fa#", "Do#", "Sol#", "Re#", "La#", "Mi#", "Si#"];
    const idx = Math.floor(Math.random() * 7);
    const degreeNames = ["1er", "2do", "3er", "4to", "5to", "6to", "7mo"];
    return {
      type: "orderOfAccidentals",
      questionText: `¿Cuál es el ${degreeNames[idx]} sostenido en el orden de sostenidos?`,
      answer: orderItems[idx],
    };
  } else {
    const orderItems = ["Sib", "Mib", "Lab", "Reb", "Solb", "Dob", "Fab"];
    const idx = Math.floor(Math.random() * 7);
    const degreeNames = ["1er", "2do", "3er", "4to", "5to", "6to", "7mo"];
    return {
      type: "orderOfAccidentals",
      questionText: `¿Cuál es el ${degreeNames[idx]} bemol en el orden de bemoles?`,
      answer: orderItems[idx],
    };
  }
}

function randomFromArray<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function getScaleGuideByMajor(major: string) {
  return SCALE_GUIDE.find((row) => row.major === major) || SCALE_GUIDE[0];
}

function keySignatureCount(keySignature: string) {
  return keySignature === "0 alteraciones"
    ? "0"
    : keySignature.replace(/[^0-9]/g, "");
}

function normalizeBasicAnswer(value: string) {
  return normalizeAccidentals(value).toLowerCase();
}

function normalizeAmericanMajorKey(value: string) {
  return normalizeAccidentals(value).replace(/\s+/g, "").toUpperCase();
}

function normalizeAccidentalFamily(value: string) {
  const normalized = normalizeBasicAnswer(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("#") || normalized.includes("sosten")) {
    return "sostenidos";
  }
  if (normalized.includes("b") || normalized.includes("bemol")) {
    return "bemoles";
  }
  if (normalized.includes("ning")) {
    return "ninguna";
  }
  return normalized;
}

function createMajorOnlyFlashcard(
  enabledTypes: MajorOnlyQuestionType[] = ALL_MAJOR_ONLY_TYPES,
): MajorOnlyFlashcard {
  const target = randomFromArray(SCALE_GUIDE);
  const availableTypes =
    enabledTypes.length > 0 ? enabledTypes : ALL_MAJOR_ONLY_TYPES;
  const pickedType = randomFromArray(availableTypes);

  if (pickedType === "majorNotes") {
    return {
      type: pickedType,
      target,
      question: {
        type: "writeMajor",
        questionText: `Escribe las 7 notas de ${target.major} en orden:`,
        answerArray: target.notes.slice(0, 7),
      },
      hintSteps: [
        `Armadura: ${target.keySignature}.`,
        `La escala empieza en ${target.notes[0]} y termina en ${target.notes[6]}.`,
        `Patrón mayor: T-T-st-T-T-T-st.`,
      ],
    };
  }

  if (pickedType === "majorKeyByAccidentals") {
    const desc = target.keySignature;
    const distractors = shuffle(
      SCALE_GUIDE.filter((r) => r.major !== target.major).map((r) => r.major),
    ).slice(0, 3);
    return {
      type: pickedType,
      target,
      question: {
        type: "identifyKeyByAccidentals",
        questionText: `¿Qué escala mayor tiene ${desc} en su armadura?`,
        answer: target.major,
        options: shuffle([target.major, ...distractors]),
      },
      hintSteps: [
        `Piensa en el círculo de quintas para ${desc}.`,
        `Comparte armadura con ${target.relativeMinor}.`,
        `La respuesta correcta es ${target.major}.`,
      ],
    };
  }

  if (pickedType === "countMajorAccidentals") {
    const acc = target.keySignature;
    const typeAcc = acc.includes("b")
      ? "bemoles"
      : acc.includes("#")
        ? "sostenidos"
        : "alteraciones";
    const count = keySignatureCount(acc);
    const distractors = shuffle(
      ["0", "1", "2", "3", "4", "5", "6", "7"].filter((c) => c !== count),
    ).slice(0, 3);

    return {
      type: pickedType,
      target,
      question: {
        type: "countAccidentals",
        questionText: `¿Cuántos ${typeAcc} tiene la armadura de ${target.major}?`,
        answer: count,
        options: shuffle([count, ...distractors]),
      },
      hintSteps: [
        `La armadura de ${target.major} es ${target.keySignature}.`,
        `Cuenta solo el número inicial de la armadura.`,
        `La respuesta correcta es ${count}.`,
      ],
    };
  }

  if (pickedType === "accidentalType") {
    let answer = "Ninguna";
    if (target.keySignature.includes("b")) answer = "Bemoles";
    if (target.keySignature.includes("#")) answer = "Sostenidos";

    return {
      type: pickedType,
      target,
      question: {
        type: "identifyAccidentalType",
        questionText: `¿La armadura de ${target.major} usa sostenidos o bemoles?`,
        answer,
        options: ["Sostenidos", "Bemoles", "Ninguna"],
      },
      hintSteps: [
        `La armadura de ${target.major} es ${target.keySignature}.`,
        `Si ves "#", son sostenidos; si ves "b", son bemoles.`,
        `La respuesta correcta es ${answer}.`,
      ],
    };
  }

  if (pickedType === "nthDegreeOfMajor") {
    const degreeIndex = Math.floor(Math.random() * 6) + 1;
    const degreeNames = ["1º", "2º", "3º", "4º", "5º", "6º", "7º"];
    const degreeLabel = degreeNames[degreeIndex];

    return {
      type: pickedType,
      target,
      question: {
        type: "identifyNthDegree",
        questionText: `¿Cuál es el ${degreeLabel} grado de ${target.major}?`,
        answer: target.notes[degreeIndex],
      },
      hintSteps: [
        `Escribe mentalmente la escala de ${target.major}.`,
        `Cuenta desde ${target.notes[0]} hasta el ${degreeLabel}.`,
        `La respuesta correcta es ${target.notes[degreeIndex]}.`,
      ],
    };
  }

  if (pickedType === "majorByNthDegree") {
    const degreeIndex = Math.floor(Math.random() * 6) + 1;
    const degreeNames = ["1º", "2º", "3º", "4º", "5º", "6º", "7º"];
    const degreeLabel = degreeNames[degreeIndex];

    return {
      type: pickedType,
      target,
      question: {
        type: "writeMajor",
        questionText: `¿Qué escala mayor tiene ${target.notes[degreeIndex]} como ${degreeLabel} grado?`,
        answer: target.major,
      },
      hintSteps: [
        `Piensa en la escala donde ${target.notes[degreeIndex]} cae como ${degreeLabel}.`,
        `La armadura correspondiente es ${target.keySignature}.`,
        `La respuesta correcta es ${target.major}.`,
      ],
    };
  }

  if (pickedType === "orderOfSharps") {
    const orderItems = ["Fa#", "Do#", "Sol#", "Re#", "La#", "Mi#", "Si#"];
    const idx = Math.floor(Math.random() * 7);
    const degreeNames = ["1er", "2do", "3er", "4to", "5to", "6to", "7mo"];

    return {
      type: pickedType,
      target,
      question: {
        type: "orderOfAccidentals",
        questionText: `¿Cuál es el ${degreeNames[idx]} sostenido en el orden de sostenidos?`,
        answer: orderItems[idx],
      },
      hintSteps: [
        `Recuerda: Fa#, Do#, Sol#, Re#, La#, Mi#, Si#.`,
        `Cuenta la posición ${degreeNames[idx]}.`,
        `La respuesta correcta es ${orderItems[idx]}.`,
      ],
    };
  }

  const orderItems = ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"];
  const idx = Math.floor(Math.random() * 7);
  const degreeNames = ["1er", "2do", "3er", "4to", "5to", "6to", "7mo"];

  return {
    type: "orderOfFlats",
    target,
    question: {
      type: "orderOfAccidentals",
      questionText: `¿Cuál es el ${degreeNames[idx]} bemol en el orden de bemoles?`,
      answer: orderItems[idx],
    },
    hintSteps: [
      `Recuerda: Bb, Eb, Ab, Db, Gb, Cb, Fb.`,
      `Cuenta la posición ${degreeNames[idx]}.`,
      `La respuesta correcta es ${orderItems[idx]}.`,
    ],
  };
}

// Helper to initialize or get practice state for a row
function getRowPracticeState(
  tablePracticeAnswers: Record<string, any>,
  rowKey: string,
) {
  return (
    tablePracticeAnswers[rowKey] || {
      isActive: true,
      notes: Array(7).fill(""),
      relativeMinor: "",
      evaluated: false,
      notesCorrect: Array(7).fill(false),
      relativeMinorCorrect: false,
    }
  );
}

function handleRowGrade(
  rowKey: string,
  expectedNotes: string[],
  expectedRelativeMinor: string,
  tablePracticeAnswers: Record<string, any>,
  setTablePracticeAnswers: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
) {
  const currentState = getRowPracticeState(tablePracticeAnswers, rowKey);
  const { notesCorrect, relativeMinorCorrect } = gradePracticeRowState(
    currentState,
    expectedNotes,
    expectedRelativeMinor,
  );

  setTablePracticeAnswers((prev) => ({
    ...prev,
    [rowKey]: {
      ...currentState,
      evaluated: true,
      notesCorrect,
      relativeMinorCorrect,
    },
  }));
}

function renderPracticeRow(
  rowKey: string,
  tonality: string,
  tonalityEn: string,
  count: number | string,
  expectedNotes: string[],
  expectedRelativeMinor: string,
  tablePracticeMode: boolean,
  tablePracticeAnswers: Record<string, any>,
  setTablePracticeAnswers: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
) {
  const isDo = rowKey === "c-flat" || rowKey === "c-sharp";
  const state = getRowPracticeState(tablePracticeAnswers, rowKey);

  const updateNote = (index: number, val: string) => {
    const newNotes = [...state.notes];
    newNotes[index] = val;
    setTablePracticeAnswers((prev) => ({
      ...prev,
      [rowKey]: { ...state, notes: newNotes, evaluated: false },
    }));
  };

  const updateRelative = (val: string) => {
    setTablePracticeAnswers((prev) => ({
      ...prev,
      [rowKey]: { ...state, relativeMinor: val, evaluated: false },
    }));
  };

  return (
    <TableRow key={rowKey}>
      {tablePracticeMode && (
        <TableCell
          align="center"
          sx={{
            py: 0.5,
            backgroundColor: isDo ? "#fff8e1" : "inherit",
            width: 40,
          }}
        >
          <Switch
            size="small"
            checked={state.isActive}
            onChange={(e) => {
              setTablePracticeAnswers((prev) => ({
                ...prev,
                [rowKey]: { ...state, isActive: e.target.checked },
              }));
            }}
            color="secondary"
          />
        </TableCell>
      )}
      <TableCell
        align="center"
        sx={{
          fontWeight: 600,
          backgroundColor: isDo ? "#fff8e1" : "inherit",
        }}
      >
        {tonalityEn || extractAmericanNotation(tonality)}
      </TableCell>
      <TableCell
        align="center"
        sx={{ backgroundColor: isDo ? "#fff8e1" : "inherit" }}
      >
        {count}
      </TableCell>

      {/* 7 Notes */}
      {expectedNotes.slice(0, 7).map((note, index) => (
        <TableCell
          key={`${rowKey}-deg-${index}`}
          align="center"
          sx={
            index === 5
              ? {
                  backgroundColor: isDo ? "#fff8e1" : "#f1f8e9",
                  fontWeight: 700,
                }
              : { backgroundColor: isDo ? "#fff8e1" : "inherit" }
          }
        >
          {tablePracticeMode && state.isActive ? (
            <TextField
              variant="standard"
              size="small"
              value={state.notes[index]}
              onChange={(e) => updateNote(index, e.target.value)}
              inputProps={{
                style: { textAlign: "center", padding: "4px 0" },
              }}
              sx={(theme) => ({
                width: "100%",
                minWidth: 40,
                ...(state.evaluated && state.notesCorrect[index]
                  ? {
                      "& .MuiInput-underline:before": {
                        borderBottomColor: `${theme.palette.success.main} !important`,
                      },
                      "& .MuiInputBase-input": {
                        color: `${theme.palette.success.main} !important`,
                        WebkitTextFillColor: `${theme.palette.success.main} !important`,
                      },
                    }
                  : {}),
              })}
              error={state.evaluated && !state.notesCorrect[index]}
            />
          ) : (
            note
          )}
        </TableCell>
      ))}

      {/* Relative Minor */}
      <TableCell
        align="center"
        sx={{
          fontWeight: 600,
          backgroundColor: isDo ? "#fff8e1" : "inherit",
        }}
      >
        {tablePracticeMode && state.isActive ? (
          <Box>
            <TextField
              variant="standard"
              size="small"
              placeholder="Ej. Am"
              value={state.relativeMinor}
              onChange={(e) => updateRelative(e.target.value)}
              inputProps={{
                style: {
                  textAlign: "center",
                  padding: "4px 0",
                  fontWeight: 600,
                },
              }}
              sx={(theme) => ({
                width: "100%",
                minWidth: 80,
                ...(state.evaluated && state.relativeMinorCorrect
                  ? {
                      "& .MuiInput-underline:before": {
                        borderBottomColor: `${theme.palette.success.main} !important`,
                      },
                      "& .MuiInputBase-input": {
                        color: `${theme.palette.success.main} !important`,
                        WebkitTextFillColor: `${theme.palette.success.main} !important`,
                      },
                    }
                  : {}),
              })}
              error={state.evaluated && !state.relativeMinorCorrect}
            />
          </Box>
        ) : (
          expectedRelativeMinor
        )}
      </TableCell>

      {/* Grade Action */}
      {tablePracticeMode && state.isActive && (
        <TableCell
          align="center"
          sx={{ backgroundColor: isDo ? "#fff8e1" : "inherit" }}
        >
          <IconButton
            size="small"
            color={state.evaluated ? "success" : "primary"}
            onClick={() => {
              handleRowGrade(
                rowKey,
                expectedNotes,
                expectedRelativeMinor,
                tablePracticeAnswers,
                setTablePracticeAnswers,
              );
            }}
          >
            {state.evaluated ? (
              <CheckCircleOutline fontSize="small" />
            ) : (
              <SendIcon fontSize="small" />
            )}
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
}

function getMemoPracticeState(
  tablePracticeAnswers: Record<string, any>,
  rowKey: string,
) {
  return (
    tablePracticeAnswers[rowKey] || {
      isActive: true,
      sharpsMajorInput: "",
      sharpsMinorInput: "",
      flatsMajorInput: "",
      flatsMinorInput: "",
      sharpsAccInput: "",
      flatsAccInput: "",
      evaluated: false,
      sharpsMajorCorrect: false,
      sharpsMinorCorrect: false,
      flatsMajorCorrect: false,
      flatsMinorCorrect: false,
      sharpsAccCorrect: false,
      flatsAccCorrect: false,
    }
  );
}

function handleMemorizationRowGrade(
  rowKey: string,
  expectedSharps: string,
  expectedFlats: string,
  expectedSharpsAcc: string,
  expectedFlatsAcc: string,
  tablePracticeAnswers: Record<string, any>,
  setTablePracticeAnswers: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
) {
  const currentState = getMemoPracticeState(tablePracticeAnswers, rowKey);

  const normalize = (str: string = "") =>
    (str || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const expectedSharpsParsed = parseMajorMinorPair(expectedSharps);
  const expectedFlatsParsed = parseMajorMinorPair(expectedFlats);

  const sharpsMajorCorrect =
    normalize(currentState.sharpsMajorInput) ===
    normalize(expectedSharpsParsed.major);
  const sharpsMinorCorrect =
    normalize(currentState.sharpsMinorInput) ===
    normalize(expectedSharpsParsed.minor);
  const flatsMajorCorrect =
    normalize(currentState.flatsMajorInput) ===
    normalize(expectedFlatsParsed.major);
  const flatsMinorCorrect =
    normalize(currentState.flatsMinorInput) ===
    normalize(expectedFlatsParsed.minor);
  const sharpsAccCorrect =
    normalize(currentState.sharpsAccInput) === normalize(expectedSharpsAcc);
  const flatsAccCorrect =
    normalize(currentState.flatsAccInput) === normalize(expectedFlatsAcc);

  setTablePracticeAnswers((prev) => ({
    ...prev,
    [rowKey]: {
      ...currentState,
      evaluated: true,
      sharpsMajorCorrect,
      sharpsMinorCorrect,
      flatsMajorCorrect,
      flatsMinorCorrect,
      sharpsAccCorrect,
      flatsAccCorrect,
    },
  }));
}

function renderMemorizationRow(
  rowKey: string,
  count: number,
  expectedSharps: string,
  expectedFlats: string,
  expectedSharpsAcc: string,
  expectedFlatsAcc: string,
  memoTablePracticeMode: boolean,
  tablePracticeAnswers: Record<string, any>,
  setTablePracticeAnswers: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
) {
  const state = getMemoPracticeState(tablePracticeAnswers, rowKey);

  const updateField = (
    field:
      | "sharpsMajorInput"
      | "sharpsMinorInput"
      | "flatsMajorInput"
      | "flatsMinorInput"
      | "sharpsAccInput"
      | "flatsAccInput",
    val: string,
  ) => {
    setTablePracticeAnswers((prev) => ({
      ...prev,
      [rowKey]: { ...state, [field]: val, evaluated: false },
    }));
  };

  const getTextFieldColors = (isCorrect: boolean) =>
    state.evaluated
      ? isCorrect
        ? {
            "& .MuiInput-underline:before": {
              borderBottomColor: "#4caf50 !important",
            },
            "& .MuiInputBase-input": {
              color: "#4caf50 !important",
              WebkitTextFillColor: "#4caf50 !important",
            },
          }
        : {
            "& .MuiInput-underline:before": {
              borderBottomColor: "#f44336 !important",
            },
            "& .MuiInputBase-input": {
              color: "#f44336 !important",
              WebkitTextFillColor: "#f44336 !important",
            },
          }
      : ({} as any);

  return (
    <TableRow key={rowKey}>
      {memoTablePracticeMode && (
        <TableCell align="center" sx={{ py: 0.5, width: 40 }}>
          <Switch
            size="small"
            checked={state.isActive}
            onChange={(e) => {
              setTablePracticeAnswers((prev) => ({
                ...prev,
                [rowKey]: { ...state, isActive: e.target.checked },
              }));
            }}
            color="secondary"
          />
        </TableCell>
      )}
      <TableCell align="center" sx={{ fontWeight: 600 }}>
        {count}
      </TableCell>
      <TableCell align="center">
        {memoTablePracticeMode && state.isActive ? (
          <Stack direction="column" alignItems="center" gap={1}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={0.5}
            >
              <TextField
                variant="standard"
                size="small"
                value={state.sharpsMajorInput}
                onChange={(e) =>
                  updateField("sharpsMajorInput", e.target.value)
                }
                inputProps={{ style: { textAlign: "center", width: "30px" } }}
                sx={getTextFieldColors(state.sharpsMajorCorrect)}
                error={state.evaluated && !state.sharpsMajorCorrect}
              />
              <Typography color="text.secondary">(</Typography>
              <TextField
                variant="standard"
                size="small"
                value={state.sharpsMinorInput}
                onChange={(e) =>
                  updateField("sharpsMinorInput", e.target.value)
                }
                inputProps={{ style: { textAlign: "center", width: "30px" } }}
                sx={getTextFieldColors(state.sharpsMinorCorrect)}
                error={state.evaluated && !state.sharpsMinorCorrect}
              />
              <Typography color="text.secondary">)</Typography>
            </Stack>
            <TextField
              variant="standard"
              size="small"
              placeholder={count > 0 ? "Ej. F# C#" : "-"}
              value={state.sharpsAccInput}
              onChange={(e) => updateField("sharpsAccInput", e.target.value)}
              inputProps={{
                style: {
                  textAlign: "center",
                  width: "110px",
                  fontSize: "0.85rem",
                },
              }}
              sx={getTextFieldColors(state.sharpsAccCorrect)}
              error={state.evaluated && !state.sharpsAccCorrect}
            />
          </Stack>
        ) : (
          <Stack direction="column" alignItems="center">
            <Typography>{expectedSharps}</Typography>
            <Typography variant="caption" color="text.secondary">
              {expectedSharpsAcc}
            </Typography>
          </Stack>
        )}
      </TableCell>
      <TableCell align="center">
        {memoTablePracticeMode && state.isActive ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            <Stack direction="column" alignItems="center" gap={1}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                gap={0.5}
              >
                <TextField
                  variant="standard"
                  size="small"
                  value={state.flatsMajorInput}
                  onChange={(e) =>
                    updateField("flatsMajorInput", e.target.value)
                  }
                  inputProps={{ style: { textAlign: "center", width: "40px" } }}
                  sx={getTextFieldColors(state.flatsMajorCorrect)}
                  error={state.evaluated && !state.flatsMajorCorrect}
                />
                <Typography color="text.secondary">(</Typography>
                <TextField
                  variant="standard"
                  size="small"
                  value={state.flatsMinorInput}
                  onChange={(e) =>
                    updateField("flatsMinorInput", e.target.value)
                  }
                  inputProps={{ style: { textAlign: "center", width: "40px" } }}
                  sx={getTextFieldColors(state.flatsMinorCorrect)}
                  error={state.evaluated && !state.flatsMinorCorrect}
                />
                <Typography color="text.secondary">)</Typography>
              </Stack>
              <TextField
                variant="standard"
                size="small"
                placeholder={count > 0 ? "Ej. Bb Eb" : "-"}
                value={state.flatsAccInput}
                onChange={(e) => updateField("flatsAccInput", e.target.value)}
                inputProps={{
                  style: {
                    textAlign: "center",
                    width: "110px",
                    fontSize: "0.85rem",
                  },
                }}
                sx={getTextFieldColors(state.flatsAccCorrect)}
                error={state.evaluated && !state.flatsAccCorrect}
              />
            </Stack>
            <IconButton
              size="small"
              color={
                state.evaluated
                  ? state.sharpsMajorCorrect &&
                    state.sharpsMinorCorrect &&
                    state.flatsMajorCorrect &&
                    state.flatsMinorCorrect &&
                    state.sharpsAccCorrect &&
                    state.flatsAccCorrect
                    ? "success"
                    : "error"
                  : "primary"
              }
              onClick={() =>
                handleMemorizationRowGrade(
                  rowKey,
                  expectedSharps,
                  expectedFlats,
                  expectedSharpsAcc,
                  expectedFlatsAcc,
                  tablePracticeAnswers,
                  setTablePracticeAnswers,
                )
              }
            >
              {state.evaluated &&
              state.sharpsMajorCorrect &&
              state.sharpsMinorCorrect &&
              state.flatsMajorCorrect &&
              state.flatsMinorCorrect &&
              state.sharpsAccCorrect &&
              state.flatsAccCorrect ? (
                <CheckCircleOutline fontSize="small" />
              ) : state.evaluated ? (
                <CancelOutlined fontSize="small" />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
        ) : (
          <Stack direction="column" alignItems="center">
            <Typography>{expectedFlats}</Typography>
            <Typography variant="caption" color="text.secondary">
              {expectedFlatsAcc}
            </Typography>
          </Stack>
        )}
      </TableCell>
    </TableRow>
  );
}

function polarPosition(angleDeg: number, radiusPercent: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(radians) * radiusPercent}%`,
    top: `${50 + Math.sin(radians) * radiusPercent}%`,
  };
}

function sideColor(side: WheelSide) {
  if (side === "sharp") return "#1565c0";
  if (side === "flat") return "#8e24aa";
  if (side === "mixed") return "#ef6c00";
  return "#455a64";
}

function compactLabel(value: string) {
  return value.replaceAll(" / ", "/");
}

function tokenAccent(token: string) {
  if (token.includes("#")) {
    return {
      color: "#1565c0",
      bg: "rgba(21,101,192,0.12)",
      border: "rgba(21,101,192,0.24)",
    };
  }
  if (token.includes("b")) {
    return {
      color: "#8e24aa",
      bg: "rgba(142,36,170,0.12)",
      border: "rgba(142,36,170,0.24)",
    };
  }
  return {
    color: "#455a64",
    bg: "rgba(69,90,100,0.10)",
    border: "rgba(69,90,100,0.16)",
  };
}

function splitSlashParts(value: string) {
  return value.split(" / ");
}

function CircleOfFifthsClock({
  selectedRoot,
  compact = false,
}: {
  selectedRoot: RootLabel;
  compact?: boolean;
}) {
  const selectedInfo = ROOT_SIGNATURE_INFO[selectedRoot];
  return (
    <Box sx={{ width: "100%", maxWidth: compact ? 360 : 520, mx: "auto" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, rgba(21,101,192,0.10) 0deg 180deg, rgba(142,36,170,0.10) 180deg 360deg)",
          border: "2px solid #0b2a50",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "13%",
            borderRadius: "50%",
            border: "2px solid #0b2a50",
            background:
              "radial-gradient(circle, #ffffff 0%, #ffffff 58%, rgba(241,245,255,0.95) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: "30%",
            borderRadius: "50%",
            border: "2px solid #0b2a50",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        />

        {Array.from({ length: 12 }).map((_, idx) => (
          <Box
            key={`divider-${idx}`}
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "1.5px",
              height: compact ? "50%" : "49%",
              bgcolor: "rgba(11,42,80,0.14)",
              transformOrigin: "50% 0%",
              transform: `rotate(${idx * 30}deg) translateY(-100%)`,
            }}
          />
        ))}

        {CIRCLE_WHEEL_SLOTS.map((slot, idx) => {
          const angle = -90 + idx * 30;
          const majorPos = polarPosition(angle, compact ? 39 : 39);
          const sigPos = polarPosition(angle, compact ? 25.5 : 26);
          const minorPos = polarPosition(angle, compact ? 18 : 15.5);
          const isSelected = slot.matchRoots.includes(selectedRoot);
          const color = sideColor(slot.side);
          const majorText = compact ? compactLabel(slot.major) : slot.major;
          const minorText = compact ? compactLabel(slot.minor) : slot.minor;
          const signatureParts = splitSlashParts(slot.signature);

          return (
            <React.Fragment key={slot.id}>
              <Box
                sx={{
                  position: "absolute",
                  ...majorPos,
                  transform: "translate(-50%, -50%)",
                  minWidth: compact ? "12%" : "18%",
                  maxWidth: compact ? "19%" : "none",
                  px: compact ? 0.4 : 0.75,
                  py: compact ? 0.15 : 0.25,
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: isSelected ? `${color}18` : "rgba(255,255,255,0.65)",
                  border: isSelected
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                }}
              >
                {slot.side === "mixed" ? (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.35,
                      justifyContent: "center",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {splitSlashParts(majorText).map((part, partIdx) => {
                      const hintToken = signatureParts[partIdx] ?? part;
                      const accent = tokenAccent(hintToken);
                      return (
                        <Box
                          key={`${slot.id}-major-${part}`}
                          sx={{
                            px: compact ? 0.35 : 0.45,
                            py: 0.05,
                            borderRadius: 1,
                            backgroundColor: accent.bg,
                            border: `1px solid ${accent.border}`,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: compact
                                ? "0.54rem"
                                : { xs: "0.7rem", sm: "0.8rem" },
                              fontWeight: 700,
                              color: accent.color,
                              lineHeight: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {part}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  (() => {
                    const accent = tokenAccent(slot.signature);
                    const useTokenBg = slot.side !== "neutral";
                    return (
                      <Box
                        sx={{
                          display: "inline-flex",
                          px: useTokenBg ? (compact ? 0.35 : 0.45) : 0,
                          py: useTokenBg ? 0.05 : 0,
                          borderRadius: useTokenBg ? 1 : 0,
                          backgroundColor: useTokenBg
                            ? accent.bg
                            : "transparent",
                          border: useTokenBg
                            ? `1px solid ${accent.border}`
                            : "1px solid transparent",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.85rem" },
                            ...(compact && { fontSize: "0.56rem" }),
                            fontWeight: isSelected ? 700 : 600,
                            color: useTokenBg
                              ? accent.color
                              : isSelected
                                ? color
                                : "#111",
                            lineHeight: compact ? 1 : 1.1,
                            whiteSpace: compact ? "normal" : "nowrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {majorText}
                        </Typography>
                      </Box>
                    );
                  })()
                )}
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  ...sigPos,
                  transform: "translate(-50%, -50%)",
                  px: compact ? 0.35 : 0.6,
                  py: compact ? 0.1 : 0.15,
                  borderRadius: 1.5,
                  bgcolor: isSelected ? `${color}12` : "transparent",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.35,
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "nowrap",
                  }}
                >
                  {signatureParts.map((part) => {
                    const accent = tokenAccent(part);
                    return (
                      <Box
                        key={`${slot.id}-sig-${part}`}
                        sx={{
                          px: compact ? 0.25 : 0.4,
                          py: 0.05,
                          borderRadius: 1,
                          bgcolor: accent.bg,
                          border: `1px solid ${accent.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.62rem", sm: "0.75rem" },
                            ...(compact && { fontSize: "0.5rem" }),
                            fontWeight: 700,
                            color: accent.color,
                            whiteSpace: "nowrap",
                            lineHeight: 1,
                          }}
                        >
                          {part}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {!compact && (
                <Box
                  sx={{
                    position: "absolute",
                    ...minorPos,
                    transform: "translate(-50%, -50%)",
                    px: 0.4,
                    textAlign: "center",
                  }}
                >
                  {slot.side === "mixed" ? (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.35,
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {splitSlashParts(minorText).map((part, partIdx) => {
                        const hintToken = signatureParts[partIdx] ?? part;
                        const accent = tokenAccent(hintToken);
                        return (
                          <Box
                            key={`${slot.id}-minor-${part}`}
                            sx={{
                              px: 0.35,
                              py: 0.02,
                              borderRadius: 1,
                              backgroundColor: accent.bg,
                              border: `1px solid ${accent.border}`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.62rem",
                                color: accent.color,
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                                fontWeight: 600,
                              }}
                            >
                              {part}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: { xs: "0.58rem", sm: "0.72rem" },
                        color: "#263238",
                        lineHeight: 1.05,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {minorText}
                    </Typography>
                  )}
                </Box>
              )}
            </React.Fragment>
          );
        })}

        {!compact && (
          <Box
            sx={{
              position: "absolute",
              top: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              px: 1.2,
              py: 0.4,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(11,42,80,0.1)",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.85rem" },
                fontWeight: 700,
              }}
            >
              C
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: compact ? "32%" : "26%",
            height: compact ? "32%" : "26%",
            borderRadius: "50%",
            border: "1px solid rgba(11,42,80,0.1)",
            bgcolor: "rgba(255,255,255,0.96)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: compact
                ? { xs: "0.5rem", sm: "0.6rem" }
                : { xs: "0.58rem", sm: "0.72rem" },
              color: "text.secondary",
            }}
          >
            {compact ? "Menor rel." : "Menor relativo"}
          </Typography>
          <Typography
            sx={{
              fontSize: compact
                ? { xs: "0.68rem", sm: "0.8rem" }
                : { xs: "0.72rem", sm: "0.92rem" },
              fontWeight: 700,
              color: "#0b2a50",
            }}
          >
            {compact ? selectedRoot : "Círculo"}
          </Typography>
          <Typography
            sx={{
              fontSize: compact
                ? { xs: "0.58rem", sm: "0.72rem" }
                : { xs: "0.72rem", sm: "0.92rem" },
              fontWeight: 700,
              color: "#0b2a50",
            }}
          >
            {compact ? selectedInfo.relativeMinor : "de Quintas"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function RelativeMinorScalesStudy() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedMajor, setSelectedMajor] = useState<string>(
    SCALE_GUIDE[0].major,
  );
  const [showArmadurasText, setShowArmadurasText] = useState<boolean>(true);
  const [tablePracticeMode, setTablePracticeMode] = useState<boolean>(false);
  const [memoTablePracticeMode, setMemoTablePracticeMode] =
    useState<boolean>(false);
  const [tablePracticeAnswers, setTablePracticeAnswers] = useState<
    Record<
      string,
      {
        isActive: boolean;
        notes: string[];
        relativeMinor: string;
        evaluated: boolean;
        notesCorrect: boolean[];
        relativeMinorCorrect: boolean;
      }
    >
  >(() => {
    const saved = localStorage.getItem("relativeMinorPracticeAnswers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved practice answers", e);
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(
      "relativeMinorPracticeAnswers",
      JSON.stringify(tablePracticeAnswers),
    );
  }, [tablePracticeAnswers]);

  const [focusRoot, setFocusRoot] = useState<RootLabel>("C");
  const [enabledQuizTypes, setEnabledQuizTypes] =
    useState<QuizQuestionType[]>(ALL_QUIZ_TYPES);
  const [question, setQuestion] = useState<QuizQuestion>(() =>
    createQuizQuestion(ALL_QUIZ_TYPES),
  );
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [scaleInputs, setScaleInputs] = useState<string[]>(Array(7).fill(""));
  const [textInput, setTextInput] = useState<string>("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [scoreCorrect, setScoreCorrect] = useState(0);
  const [scoreTotal, setScoreTotal] = useState(0);

  // Flashcards state
  const [currentFlashcard, setCurrentFlashcard] = useState<ScaleGuideRow>(
    () => {
      const r = Math.floor(Math.random() * SCALE_GUIDE.length);
      return SCALE_GUIDE[r];
    },
  );
  const [currentMajorOnlyFlashcard, setCurrentMajorOnlyFlashcard] =
    useState<MajorOnlyFlashcard>(() => createMajorOnlyFlashcard());
  const [isFlipped, setIsFlipped] = useState(false);
  const FLASHCARD_MODE_LABELS: Record<FlashcardMode, string> = {
    majorToMinor: "Mayor a Menor",
    minorToMajor: "Menor a Mayor",
    signatureToKeys: "Adivinar Armadura",
    sixthDegreeToKey: "Adivinar 6º Grado",
    notesToMinorKey: "Adivinar Notas",
  };
  const ALL_FLASHCARD_MODES: FlashcardMode[] = [
    "majorToMinor",
    "minorToMajor",
    "signatureToKeys",
    "sixthDegreeToKey",
    "notesToMinorKey",
  ];

  const [activeFlashcardModes, setActiveFlashcardModes] =
    useState<FlashcardMode[]>(ALL_FLASHCARD_MODES);
  const [majorOnlyMode, setMajorOnlyMode] = useState<boolean>(false);
  const [activeMajorOnlyTypes, setActiveMajorOnlyTypes] =
    useState<MajorOnlyQuestionType[]>(ALL_MAJOR_ONLY_TYPES);
  const [flashcardMode, setFlashcardMode] =
    useState<FlashcardMode>("majorToMinor");
  const [flashcardTextAnswer, setFlashcardTextAnswer] = useState("");
  const [flashcardChoiceAnswer, setFlashcardChoiceAnswer] = useState("");
  const [flashcardPairAnswer, setFlashcardPairAnswer] = useState({
    left: "",
    right: "",
  });
  const [flashcardNoteAnswers, setFlashcardNoteAnswers] = useState<string[]>(
    Array(7).fill(""),
  );
  const [flashcardHintLevel, setFlashcardHintLevel] = useState(0);
  const [flashcardChecked, setFlashcardChecked] = useState(false);
  const [flashcardCheckResult, setFlashcardCheckResult] =
    useState<FlashcardCheckResult | null>(null);
  const [flashcardReviewQueue, setFlashcardReviewQueue] = useState<
    FlashcardReviewItem[]
  >([]);
  const [flashcardReviewOnlyMode, setFlashcardReviewOnlyMode] = useState(false);
  const [flashcardAudioOnlyMode, setFlashcardAudioOnlyMode] = useState(false);
  const [flashcardSessionStats, setFlashcardSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
  });
  const [flashcardSprintActive, setFlashcardSprintActive] = useState(false);
  const [flashcardSprintRemaining, setFlashcardSprintRemaining] = useState(90);
  const [flashcardSprintStats, setFlashcardSprintStats] = useState({
    reviewed: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
  });
  const flashcardFlipTimeoutRef = React.useRef<number | null>(null);
  const flashcardSprintRef = React.useRef<number | null>(null);

  const clearFlashcardCheck = () => {
    setFlashcardChecked(false);
    setFlashcardCheckResult(null);
  };

  const resetFlashcardAttempt = () => {
    setIsFlipped(false);
    setFlashcardTextAnswer("");
    setFlashcardChoiceAnswer("");
    setFlashcardPairAnswer({ left: "", right: "" });
    setFlashcardNoteAnswers(Array(7).fill(""));
    setFlashcardHintLevel(0);
    clearFlashcardCheck();
  };

  const nextFlashcard = () => {
    resetFlashcardAttempt();
    if (flashcardFlipTimeoutRef.current)
      clearTimeout(flashcardFlipTimeoutRef.current);

    const shouldUseReviewCard =
      flashcardReviewQueue.length > 0 &&
      (flashcardReviewOnlyMode || Math.random() < 0.6);

    if (shouldUseReviewCard) {
      const [reviewItem, ...rest] = flashcardReviewQueue;
      setFlashcardReviewQueue(rest);
      flashcardFlipTimeoutRef.current = window.setTimeout(() => {
        if (reviewItem.kind === "majorOnly") {
          setMajorOnlyMode(true);
          setCurrentMajorOnlyFlashcard(reviewItem.card);
        } else {
          setMajorOnlyMode(false);
          setCurrentFlashcard(getScaleGuideByMajor(reviewItem.major));
          setFlashcardMode(reviewItem.mode);
        }
        flashcardFlipTimeoutRef.current = null;
      }, 150);
      return;
    }

    if (flashcardReviewOnlyMode && flashcardReviewQueue.length === 0) {
      setFlashcardReviewOnlyMode(false);
    }

    let r = Math.floor(Math.random() * SCALE_GUIDE.length);
    while (SCALE_GUIDE[r].major === currentFlashcard.major) {
      r = Math.floor(Math.random() * SCALE_GUIDE.length);
    }

    const modes =
      activeFlashcardModes.length > 0
        ? activeFlashcardModes
        : (["majorToMinor"] as FlashcardMode[]);
    const newMode = modes[Math.floor(Math.random() * modes.length)];
    flashcardFlipTimeoutRef.current = window.setTimeout(() => {
      if (majorOnlyMode) {
        setCurrentMajorOnlyFlashcard(
          createMajorOnlyFlashcard(activeMajorOnlyTypes),
        );
      } else {
        setCurrentFlashcard(SCALE_GUIDE[r]);
        setFlashcardMode(newMode);
      }
      flashcardFlipTimeoutRef.current = null;
    }, 150);
  };

  // Table Challenge state
  const [challengeActive, setChallengeActive] = useState(false);
  const [challengeTimer, setChallengeTimer] = useState(0);
  const [challengeResult, setChallengeResult] = useState<{
    correct: number;
    total: number;
  } | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startChallenge = () => {
    // Force clean state with ALL rows active
    const newAnswers: Record<string, any> = {};
    const initRowState = {
      isActive: true,
      notes: Array(7).fill(""),
      relativeMinor: "",
      evaluated: false,
      notesCorrect: Array(7).fill(false),
      relativeMinorCorrect: false,
    };

    newAnswers["c-flat"] = { ...initRowState };
    newAnswers["c-sharp"] = { ...initRowState };
    FLAT_SUBTABLE.forEach((r) => {
      newAnswers[`flat-${r.tonality}`] = { ...initRowState };
    });
    SHARP_SUBTABLE.forEach((r) => {
      newAnswers[`sharp-${r.tonality}`] = { ...initRowState };
    });

    setTablePracticeAnswers(newAnswers);
    setTablePracticeMode(true);
    setChallengeTimer(0);
    setChallengeResult(null);
    setChallengeActive(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setChallengeTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopChallenge = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setChallengeActive(false);

    // Grade ALL rows in a single atomic state update to avoid race conditions
    setTablePracticeAnswers((prev) => {
      const next = { ...prev };
      let totalRows = 0;
      let correctRows = 0;

      const gradeRow = (
        rowKey: string,
        expectedNotes: string[],
        expectedRelativeMinor: string,
      ) => {
        const state = next[rowKey] || {
          isActive: true,
          notes: Array(7).fill(""),
          relativeMinor: "",
          evaluated: false,
          notesCorrect: Array(7).fill(false),
          relativeMinorCorrect: false,
        };
        const { notesCorrect, relativeMinorCorrect } = gradePracticeRowState(
          state,
          expectedNotes,
          expectedRelativeMinor,
        );

        next[rowKey] = {
          ...state,
          evaluated: true,
          notesCorrect,
          relativeMinorCorrect,
        };
        totalRows++;
        if (notesCorrect.every(Boolean) && relativeMinorCorrect) correctRows++;
      };

      gradeRow("c-flat", ["C", "D", "E", "F", "G", "A", "B", "C"], "Am");
      FLAT_SUBTABLE.forEach((r) =>
        gradeRow(`flat-${r.tonality}`, r.majorScale, r.relativeMinor),
      );
      gradeRow("c-sharp", ["C", "D", "E", "F", "G", "A", "B", "C"], "Am");
      SHARP_SUBTABLE.forEach((r) =>
        gradeRow(`sharp-${r.tonality}`, r.majorScale, r.relativeMinor),
      );

      setChallengeResult({ correct: correctRows, total: totalRows });
      return next;
    });
  };

  // Cleanup intervals and pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flashcardFlipTimeoutRef.current)
        clearTimeout(flashcardFlipTimeoutRef.current);
      if (flashcardSprintRef.current) clearInterval(flashcardSprintRef.current);
    };
  }, []);

  const selectedScale = useMemo(
    () =>
      SCALE_GUIDE.find((row) => row.major === selectedMajor) || SCALE_GUIDE[0],
    [selectedMajor],
  );

  const currentReviewItem = useMemo<FlashcardReviewItem>(
    () =>
      majorOnlyMode
        ? { kind: "majorOnly", card: currentMajorOnlyFlashcard }
        : {
            kind: "relative",
            major: currentFlashcard.major,
            mode: flashcardMode,
          },
    [
      currentFlashcard.major,
      currentMajorOnlyFlashcard,
      flashcardMode,
      majorOnlyMode,
    ],
  );

  const flashcardPromptMeta = useMemo(() => {
    if (majorOnlyMode) {
      const card = currentMajorOnlyFlashcard;

      switch (card.type) {
        case "majorNotes":
          return {
            kind: "notes" as const,
            hintSteps: card.hintSteps,
            audioNotes: card.target.notes.slice(0, 7),
            audioLabel: `Escuchar ${extractAmericanNotation(card.target.major)}`,
            evaluate: (input: {
              text: string;
              choice: string;
              notes: string[];
              pair: { left: string; right: string };
            }) => {
              const parts = input.notes.map(
                (note, index) =>
                  normalizeAmericanScaleNote(note) ===
                  normalizeAmericanScaleNote(card.target.notes[index]),
              );
              return { isCorrect: parts.every(Boolean), parts };
            },
          };
        case "majorKeyByAccidentals":
          return {
            kind: "choice" as const,
            hintSteps: card.hintSteps,
            options: card.question.options || [],
            audioNotes: card.target.notes.slice(0, 7),
            audioLabel: `Escuchar ${extractAmericanNotation(card.target.major)}`,
            evaluate: (input: {
              text: string;
              choice: string;
              notes: string[];
              pair: { left: string; right: string };
            }) => ({
              isCorrect:
                normalizeAmericanMajorKey(input.choice) ===
                normalizeAmericanMajorKey(card.target.major),
            }),
          };
        case "countMajorAccidentals":
          return {
            kind: "choice" as const,
            hintSteps: card.hintSteps,
            options: card.question.options || [],
            audioNotes: card.target.notes.slice(0, 7),
            audioLabel: `Escuchar ${extractAmericanNotation(card.target.major)}`,
            evaluate: (input: {
              text: string;
              choice: string;
              notes: string[];
              pair: { left: string; right: string };
            }) => ({
              isCorrect:
                normalizeBasicAnswer(input.choice) ===
                normalizeBasicAnswer(
                  keySignatureCount(card.target.keySignature),
                ),
            }),
          };
        case "accidentalType":
          return {
            kind: "choice" as const,
            hintSteps: card.hintSteps,
            options: card.question.options || [],
            audioNotes: card.target.notes.slice(0, 7),
            audioLabel: `Escuchar ${extractAmericanNotation(card.target.major)}`,
            evaluate: (input: {
              text: string;
              choice: string;
              notes: string[];
              pair: { left: string; right: string };
            }) => ({
              isCorrect:
                normalizeAccidentalFamily(input.choice) ===
                normalizeAccidentalFamily(card.question.answer || ""),
            }),
          };
        case "nthDegreeOfMajor":
        case "orderOfSharps":
        case "orderOfFlats":
          return {
            kind: "text" as const,
            hintSteps: card.hintSteps,
            placeholder: "Tu respuesta",
            audioNotes:
              card.type === "nthDegreeOfMajor"
                ? card.target.notes.slice(0, 7)
                : card.target.notes.slice(0, 7),
            audioLabel:
              card.type === "nthDegreeOfMajor"
                ? `Escuchar ${extractAmericanNotation(card.target.major)}`
                : "Escuchar referencia",
            evaluate: (input: {
              text: string;
              choice: string;
              notes: string[];
              pair: { left: string; right: string };
            }) => ({
              isCorrect:
                normalizeAmericanScaleNote(input.text) ===
                normalizeAmericanScaleNote(card.question.answer || ""),
            }),
          };
        case "majorByNthDegree":
          return {
            kind: "text" as const,
            hintSteps: card.hintSteps,
            placeholder: "Ej. Bb",
            audioNotes: card.target.notes.slice(0, 7),
            audioLabel: `Escuchar ${extractAmericanNotation(card.target.major)}`,
            evaluate: (input: {
              text: string;
              choice: string;
              notes: string[];
              pair: { left: string; right: string };
            }) => ({
              isCorrect:
                normalizeAmericanMajorKey(input.text) ===
                normalizeAmericanMajorKey(card.target.major),
            }),
          };
      }
    }

    switch (flashcardMode) {
      case "majorToMinor":
        return {
          kind: "text" as const,
          hintSteps: [
            `Armadura: ${currentFlashcard.keySignature}.`,
            `El 6º grado es ${currentFlashcard.sixthDegree}.`,
            `Respuesta: ${extractAmericanNotation(currentFlashcard.relativeMinor)}.`,
          ],
          placeholder: "Ej. F#m",
          audioNotes: currentFlashcard.notes.slice(0, 7),
          audioLabel: `Escuchar ${extractAmericanNotation(currentFlashcard.major)}`,
          evaluate: (input: {
            text: string;
            choice: string;
            notes: string[];
            pair: { left: string; right: string };
          }) => ({
            isCorrect:
              normalizeAmericanMinorKey(input.text) ===
              normalizeAmericanMinorKey(currentFlashcard.relativeMinor),
          }),
        };
      case "minorToMajor":
        return {
          kind: "text" as const,
          hintSteps: [
            `Comparte armadura con ${extractAmericanNotation(currentFlashcard.major)}.`,
            `Sube 3 semitonos desde ${extractAmericanNotation(currentFlashcard.relativeMinor)}.`,
            `Respuesta: ${extractAmericanNotation(currentFlashcard.major)}.`,
          ],
          placeholder: "Ej. E",
          audioNotes: currentFlashcard.minorNotes.slice(0, 7),
          audioLabel: `Escuchar ${extractAmericanNotation(currentFlashcard.relativeMinor)}`,
          evaluate: (input: {
            text: string;
            choice: string;
            notes: string[];
            pair: { left: string; right: string };
          }) => ({
            isCorrect:
              normalizeAmericanMajorKey(input.text) ===
              normalizeAmericanMajorKey(currentFlashcard.major),
          }),
        };
      case "signatureToKeys":
        return {
          kind: "pair" as const,
          hintSteps: [
            `Comparten armadura: ${currentFlashcard.keySignature}.`,
            `Mayor: ${extractAmericanNotation(currentFlashcard.major)}.`,
            `Menor relativo: ${extractAmericanNotation(currentFlashcard.relativeMinor)}.`,
          ],
          pairLabels: ["Mayor", "Menor rel."],
          audioNotes: currentFlashcard.notes.slice(0, 7),
          audioLabel: `Escuchar ${extractAmericanNotation(currentFlashcard.major)}`,
          evaluate: (input: {
            text: string;
            choice: string;
            notes: string[];
            pair: { left: string; right: string };
          }) => {
            const parts = [
              normalizeAmericanMajorKey(input.pair.left) ===
                normalizeAmericanMajorKey(currentFlashcard.major),
              normalizeAmericanMinorKey(input.pair.right) ===
                normalizeAmericanMinorKey(currentFlashcard.relativeMinor),
            ];
            return { isCorrect: parts.every(Boolean), parts };
          },
        };
      case "sixthDegreeToKey":
        return {
          kind: "text" as const,
          hintSteps: [
            `Ese 6º grado apunta al relativo menor ${extractAmericanNotation(currentFlashcard.relativeMinor)}.`,
            `Comparte armadura: ${currentFlashcard.keySignature}.`,
            `Respuesta: ${extractAmericanNotation(currentFlashcard.major)}.`,
          ],
          placeholder: "Ej. Db",
          audioNotes: currentFlashcard.notes.slice(0, 7),
          audioLabel: `Escuchar ${extractAmericanNotation(currentFlashcard.major)}`,
          evaluate: (input: {
            text: string;
            choice: string;
            notes: string[];
            pair: { left: string; right: string };
          }) => ({
            isCorrect:
              normalizeAmericanMajorKey(input.text) ===
              normalizeAmericanMajorKey(currentFlashcard.major),
          }),
        };
      case "notesToMinorKey":
      default:
        return {
          kind: "text" as const,
          hintSteps: [
            `La escala empieza en ${currentFlashcard.minorNotes[0]}.`,
            `Comparte armadura con ${extractAmericanNotation(currentFlashcard.major)}.`,
            `Respuesta: ${extractAmericanNotation(currentFlashcard.relativeMinor)}.`,
          ],
          placeholder: "Ej. Bbm",
          audioNotes: currentFlashcard.minorNotes.slice(0, 7),
          audioLabel: `Escuchar ${extractAmericanNotation(currentFlashcard.relativeMinor)}`,
          evaluate: (input: {
            text: string;
            choice: string;
            notes: string[];
            pair: { left: string; right: string };
          }) => ({
            isCorrect:
              normalizeAmericanMinorKey(input.text) ===
              normalizeAmericanMinorKey(currentFlashcard.relativeMinor),
          }),
        };
    }
  }, [
    currentFlashcard,
    currentMajorOnlyFlashcard,
    flashcardMode,
    majorOnlyMode,
  ]);

  const runFlashcardCheck = (flipAfter = false) => {
    const result = flashcardPromptMeta.evaluate({
      text: flashcardTextAnswer,
      choice: flashcardChoiceAnswer,
      notes: flashcardNoteAnswers,
      pair: flashcardPairAnswer,
    });

    setFlashcardChecked(true);
    setFlashcardCheckResult(result);
    if (flipAfter) setIsFlipped(true);
    return result;
  };

  const pushReviewItems = (
    assessment: FlashcardAssessment,
    result: FlashcardCheckResult,
  ) => {
    if (result.isCorrect && assessment === "easy") return;

    const copies =
      !result.isCorrect || assessment === "again"
        ? 2
        : assessment === "hard"
          ? 1
          : 0;

    if (copies === 0) return;

    setFlashcardReviewQueue((prev) => [
      ...prev,
      ...Array.from({ length: copies }, () => currentReviewItem),
    ]);
  };

  const updateFlashcardStats = (
    result: FlashcardCheckResult,
    assessment: FlashcardAssessment,
  ) => {
    const countsAsCorrect = result.isCorrect && assessment !== "again";

    const updateStats = (prev: {
      reviewed: number;
      correct: number;
      streak: number;
      bestStreak: number;
    }) => {
      const streak = countsAsCorrect ? prev.streak + 1 : 0;
      return {
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (countsAsCorrect ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
    };

    setFlashcardSessionStats(updateStats);
    if (flashcardSprintActive) {
      setFlashcardSprintStats(updateStats);
    }
  };

  const revealFlashcardAnswer = () => {
    if (isFlipped) return;
    runFlashcardCheck(true);
  };

  const submitFlashcardAssessment = (assessment: FlashcardAssessment) => {
    const result =
      flashcardChecked && flashcardCheckResult
        ? flashcardCheckResult
        : runFlashcardCheck(true);

    updateFlashcardStats(result, assessment);
    pushReviewItems(assessment, result);
    nextFlashcard();
  };

  const playFlashcardPromptAudio = async () => {
    await playScale(flashcardPromptMeta.audioNotes);
  };

  useEffect(() => {
    if (!flashcardSprintActive) {
      if (flashcardSprintRef.current) clearInterval(flashcardSprintRef.current);
      flashcardSprintRef.current = null;
      return;
    }

    if (flashcardSprintRef.current) clearInterval(flashcardSprintRef.current);
    flashcardSprintRef.current = window.setInterval(() => {
      setFlashcardSprintRemaining((prev) => {
        if (prev <= 1) {
          if (flashcardSprintRef.current)
            clearInterval(flashcardSprintRef.current);
          flashcardSprintRef.current = null;
          setFlashcardSprintActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (flashcardSprintRef.current) clearInterval(flashcardSprintRef.current);
      flashcardSprintRef.current = null;
    };
  }, [flashcardSprintActive]);

  useEffect(() => {
    resetFlashcardAttempt();
  }, [majorOnlyMode]);

  const isMultipleChoice =
    question.type === "majorToMinor" ||
    question.type === "minorToMajor" ||
    question.type === "countAccidentals" ||
    question.type === "identifyKeyByAccidentals" ||
    question.type === "identifyAccidentalType" ||
    question.type === "orderOfAccidentals" ||
    question.type === "identifyKeyBySignatureType";
  const isWriteScale =
    question.type === "writeMajor" ||
    question.type === "writeMinor" ||
    question.type === "writeMinorFromMajor";
  const isIdentifyDegree =
    question.type === "identifySixth" ||
    question.type === "identifyNthDegree" ||
    question.type === "identifyNthDegreeMinor";

  const answered = isEvaluated;
  let isCorrect = false;

  if (isEvaluated) {
    if (isMultipleChoice) {
      isCorrect = selectedOption === question.answer;
    } else if (isWriteScale) {
      isCorrect = scaleInputs.every(
        (val, i) =>
          val.trim().toLowerCase() ===
          (question.answerArray?.[i] || "").toLowerCase(),
      );
    } else if (isIdentifyDegree) {
      isCorrect =
        textInput.trim().toLowerCase() ===
        (question.answer || "").toLowerCase();
    }
  }

  const playScale = async (notesToPlay: string[]) => {
    // Basic mapping from notation to Tone.js friendly format
    // Assumes C4 as starting octave for simplicity
    // Doing a naive mapping just to demonstrate the sound
    releaseYamahaVoices();
    const sampler = await getYamahaSampler();
    if (!sampler) return;
    await Tone.start();

    // We need to map syllables to pitch+octave (e.g. Do -> C4, Re -> D4)
    // For a robust app this needs a better mapping, but for quick play we approximate:
    const noteMap: Record<string, string> = {
      Do: "C",
      "Do#": "C#",
      Reb: "Db",
      Re: "D",
      "Re#": "D#",
      Mib: "Eb",
      Mi: "E",
      Fa: "F",
      "Fa#": "F#",
      Solb: "Gb",
      Sol: "G",
      "Sol#": "G#",
      Lab: "Ab",
      La: "A",
      "La#": "A#",
      Sib: "Bb",
      Si: "B",
      Dob: "B",
      "Mi#": "F",
      Fab: "E",
    };

    let currentOctave = 4;
    let baseNotes = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
    let lastNoteIndex = -1;

    let time = Tone.now() + 0.1;
    notesToPlay.forEach((noteStr) => {
      // clean up basic note name
      const cleanNote = noteStr;
      const baseNoteMatch = baseNotes.find((bn) => cleanNote.startsWith(bn));
      if (baseNoteMatch) {
        let nIndex = baseNotes.indexOf(baseNoteMatch);
        if (lastNoteIndex !== -1 && nIndex < lastNoteIndex) {
          currentOctave++;
        }
        lastNoteIndex = nIndex;
      }

      const pitch = noteMap[noteStr] || noteStr;

      sampler.triggerAttackRelease(`${pitch}${currentOctave}`, "4n", time);
      time += 0.5; // half second per note
    });
  };

  // VexFlow references for key signature diagrams
  const vfTrebleFlatsRef = React.useRef<HTMLDivElement>(null);
  const vfBassFlatsRef = React.useRef<HTMLDivElement>(null);
  const vfTrebleSharpsRef = React.useRef<HTMLDivElement>(null);
  const vfBassSharpsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const drawSignature = (
      container: HTMLDivElement | null,
      clef: string,
      keySignature: string,
    ) => {
      if (!container) return;
      container.innerHTML = "";
      const vf = new Factory({
        renderer: { elementId: container.id, width: 220, height: 90 },
      });
      const ctx = vf.getContext();
      const stave = new Stave(10, 0, 200);
      stave.addClef(clef).addKeySignature(keySignature);
      stave.setContext(ctx).draw();
    };

    drawSignature(vfTrebleFlatsRef.current, "treble", "Cb");

    drawSignature(vfBassFlatsRef.current, "bass", "Cb");

    drawSignature(vfTrebleSharpsRef.current, "treble", "C#");

    drawSignature(vfBassSharpsRef.current, "bass", "C#");
  }, []);

  const handleNextQuestion = () => {
    setQuestion(
      majorOnlyMode
        ? generateMajorOnlyQuestion(activeMajorOnlyTypes)
        : createQuizQuestion(enabledQuizTypes),
    );
    setSelectedOption("");
    setScaleInputs(Array(7).fill(""));
    setTextInput("");
    setIsEvaluated(false);
  };

  const flashcardVisualMasked = flashcardAudioOnlyMode && !isFlipped;

  const renderMajorOnlyFlashcardFront = () => {
    if (currentMajorOnlyFlashcard.type === "majorNotes") {
      return (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            ¿Cuáles son las notas de...?
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#e65100", textAlign: "center" }}
          >
            {flashcardVisualMasked
              ? "Escucha la pista"
              : extractAmericanNotation(currentMajorOnlyFlashcard.target.major)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {flashcardVisualMasked
              ? "Pista visual oculta"
              : `Armadura: ${currentMajorOnlyFlashcard.target.keySignature}`}
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600, px: 2, textAlign: "center" }}
        >
          {currentMajorOnlyFlashcard.question.questionText}
        </Typography>
        {flashcardVisualMasked ? (
          <Chip
            label="Usa audio o pistas"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700, mt: 1 }}
          />
        ) : (
          <Chip
            label={`Armadura: ${currentMajorOnlyFlashcard.target.keySignature}`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700, mt: 1 }}
          />
        )}
      </>
    );
  };

  const renderMajorOnlyFlashcardBack = () => {
    const answerArray = currentMajorOnlyFlashcard.question.answerArray;
    const answer = currentMajorOnlyFlashcard.question.answer;

    if (answerArray) {
      return (
        <>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            Notas de{" "}
            {extractAmericanNotation(currentMajorOnlyFlashcard.target.major)}:
          </Typography>
          <Stack
            direction="row"
            spacing={0.3}
            flexWrap="wrap"
            justifyContent="center"
            px={1}
          >
            {answerArray.map((note, idx) => (
              <Chip
                key={idx}
                label={note}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: "#fff8e1",
                  color: "#e65100",
                  border: "1px solid #ffcc80",
                }}
              />
            ))}
          </Stack>
          <Chip
            label={`Armadura: ${currentMajorOnlyFlashcard.target.keySignature}`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 700, mt: 1, fontSize: "0.9rem" }}
          />
        </>
      );
    }

    return (
      <>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          Respuesta:
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, color: "#004d40", textAlign: "center" }}
        >
          {answer}
        </Typography>
        <Chip
          label={`Armadura: ${currentMajorOnlyFlashcard.target.keySignature}`}
          color="warning"
          variant="outlined"
          sx={{ fontWeight: 700, mt: 1 }}
        />
      </>
    );
  };

  const renderFlashcardAnswerInputs = () => {
    if (flashcardPromptMeta.kind === "notes") {
      return (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ mt: 1 }}
        >
          {flashcardNoteAnswers.map((note, index) => (
            <TextField
              key={`flash-note-${index}`}
              variant="outlined"
              size="small"
              value={note}
              onChange={(e) => {
                const next = [...flashcardNoteAnswers];
                next[index] = e.target.value;
                setFlashcardNoteAnswers(next);
                clearFlashcardCheck();
              }}
              inputProps={{ style: { textAlign: "center", width: 26 } }}
              error={
                flashcardChecked &&
                !!flashcardCheckResult?.parts &&
                !flashcardCheckResult.parts[index]
              }
            />
          ))}
        </Stack>
      );
    }

    if (flashcardPromptMeta.kind === "choice") {
      return (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          justifyContent="center"
          sx={{ mt: 1 }}
        >
          {(flashcardPromptMeta.options || []).map((option) => (
            <Button
              key={option}
              variant={
                flashcardChoiceAnswer === option ? "contained" : "outlined"
              }
              size="small"
              onClick={() => {
                setFlashcardChoiceAnswer(option);
                clearFlashcardCheck();
              }}
              sx={{ textTransform: "none" }}
            >
              {option}
            </Button>
          ))}
        </Stack>
      );
    }

    if (flashcardPromptMeta.kind === "pair") {
      return (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ mt: 1 }}
        >
          <TextField
            label={flashcardPromptMeta.pairLabels?.[0] || "Mayor"}
            size="small"
            value={flashcardPairAnswer.left}
            onChange={(e) => {
              setFlashcardPairAnswer((prev) => ({
                ...prev,
                left: e.target.value,
              }));
              clearFlashcardCheck();
            }}
            error={
              flashcardChecked &&
              !!flashcardCheckResult?.parts &&
              !flashcardCheckResult.parts[0]
            }
          />
          <TextField
            label={flashcardPromptMeta.pairLabels?.[1] || "Menor"}
            size="small"
            value={flashcardPairAnswer.right}
            onChange={(e) => {
              setFlashcardPairAnswer((prev) => ({
                ...prev,
                right: e.target.value,
              }));
              clearFlashcardCheck();
            }}
            error={
              flashcardChecked &&
              !!flashcardCheckResult?.parts &&
              !flashcardCheckResult.parts[1]
            }
          />
        </Stack>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        placeholder={flashcardPromptMeta.placeholder}
        value={flashcardTextAnswer}
        onChange={(e) => {
          setFlashcardTextAnswer(e.target.value);
          clearFlashcardCheck();
        }}
        sx={{ mt: 1, maxWidth: 320 }}
        error={flashcardChecked && flashcardCheckResult?.isCorrect === false}
      />
    );
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5 }, py: 3 }}>
      <Stack spacing={2.5} maxWidth="1100px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2a50" }}>
            Estudio de Escalas: 6º grado y relativo menor
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LightbulbOutlined sx={{ color: "#ef6c00" }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Explicación rápida
            </Typography>
          </Stack>
          <Typography sx={{ mb: 1 }}>
            La idea de tu pizarrón se resume así: el{" "}
            <strong>6º grado de una escala mayor</strong> te da la{" "}
            <strong>escala menor relativa</strong>.
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Ejemplo: Fa mayor = Fa Sol La Sib Do Re Mi. Su 6º grado es Re, por
            eso su relativo menor es Re menor.
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Ojo con tu duda: el grado depende de la tónica. En{" "}
            <strong>La mayor</strong>, <strong>Fa#</strong> es el{" "}
            <strong>6º grado</strong>. En <strong>Do mayor</strong>,{" "}
            <strong>Fa</strong> es el <strong>4º grado</strong>.
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Mayor y relativo menor comparten la misma armadura (mismos
            sostenidos o bemoles), solo cambia el centro tonal, por lo que los
            semitonos caen en lugares distintos dando ese sonido alegre (mayor)
            vs melancólico (menor).
          </Typography>
          <Box
            sx={{
              pl: 2,
              borderLeft: "3px solid #ef6c00",
              bgcolor: "rgba(239, 108, 0, 0.04)",
              p: 1.5,
              borderRadius: "0 8px 8px 0",
              mt: 1.5,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Estructura Mayor: T - T - st - T - T - T - st
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
              Estructura Menor N.: T - st - T - T - st - T - T
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderColor: "secondary.main",
            borderWidth: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <LightbulbOutlined sx={{ color: "secondary.main" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "secondary.main" }}
            >
              Trucos para NO memorizar
            </Typography>
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            1. ¿Cómo sacar el Relativo Menor rápido?
          </Typography>
          <Typography sx={{ mb: 1.5, pl: 2 }}>
            Simplemente <strong>baja 3 semitonos</strong> (un tono y medio)
            desde la nota tónica mayor.
            <br />
            <em>Ejemplo:</em> De Do mayor bajas a Si (1), Sib (2) y llegas a{" "}
            <strong>La (3)</strong>. ¡El relativo menor de Do es La menor!
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            2. ¿Cómo deducir la Tonalidad desde la Armadura?
          </Typography>
          <Box
            sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
          >
            <Typography>
              <strong>Si tiene Bemoles (b):</strong> El nombre de la tonalidad
              mayor es el <strong>penúltimo bemol</strong>.
              <br />
              <em>Ejemplo:</em> Si ves 3 bemoles (Sib, Mib, Lab), el penúltimo
              es <strong>Mib</strong>. Esa es la armadura de Mib Mayor.
            </Typography>
            <Typography>
              <strong>Si tiene Sostenidos (#):</strong> Súbele{" "}
              <strong>medio tono</strong> al <strong>último sostenido</strong>.
              <br />
              <em>Ejemplo:</em> Si ves 3 sostenidos (Fa#, Do#, Sol#), el último
              es Sol#. Súbele medio tono y llegas a <strong>La</strong>. Esa es
              la armadura de La Mayor.
            </Typography>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderColor: "info.main",
            borderWidth: 2,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <School sx={{ color: "info.main" }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "info.main" }}
            >
              Metodología de Estudio Sugerida
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ mb: 2 }}>
            No intentes memorizar todo el primer día. Sigue este flujo para
            dominar las tonalidades y sus relativos menores:
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "info.dark" }}
              >
                Fase 1: Entender la Lógica (Reglas y Trucos)
              </Typography>
              <Typography variant="body2">
                Aprende a deducir usando los trucos del panel anterior (bajar 3
                semitonos o leer la armadura). Esto te da independencia
                cognitiva si alguna vez olvidas una escala.
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "info.dark" }}
              >
                Fase 2: Relación Directa (Práctica con Flashcards)
              </Typography>
              <Typography variant="body2">
                Usa las <strong>Flashcards Bidireccionales</strong>. El objetivo
                es que dejes de calcular manualmente y comiences a relacionar
                por instinto visual que "Re Mayor = Si menor = 2 sostenidos".
              </Typography>
            </Box>
            <Divider />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "info.dark" }}
              >
                Fase 3: Memorización Total (Ejecución bajo presión)
              </Typography>
              <Typography variant="body2">
                Usa el <strong>Reto Contra Reloj</strong> en las tablas o el{" "}
                <strong>Modo Examen Extendido</strong> inferior para poner a
                prueba tu memoria a largo plazo bajo estrés de tiempo. Este es
                el nivel profesional.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderColor: "primary.main",
            borderWidth: 2,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
              Visualiza una escala y su 6º grado
            </Typography>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              <InputLabel id="major-scale-select-label">
                Escala mayor
              </InputLabel>
              <Select
                labelId="major-scale-select-label"
                value={selectedMajor}
                label="Escala mayor"
                onChange={(event) => setSelectedMajor(event.target.value)}
              >
                {SCALE_GUIDE.map((row) => (
                  <MenuItem key={row.major} value={row.major}>
                    {row.major}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
              Escala {selectedScale.major}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<PlayArrowRounded />}
              onClick={() => playScale(selectedScale.notes)}
              sx={{ borderRadius: 6, textTransform: "none" }}
            >
              Escuchar
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
          >
            {selectedScale.notes.slice(0, 7).map((note, index) => (
              <Chip
                key={`${selectedScale.major}-${note}-${index}`}
                label={`${DEGREE_LABELS[index]} (${index + 1}). ${note}`}
                color={index === 5 ? "success" : "default"}
                variant={index === 5 ? "filled" : "outlined"}
              />
            ))}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
              Escala {selectedScale.relativeMinor} (Menor Natural)
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<PlayArrowRounded />}
              onClick={() => playScale(selectedScale.minorNotes)}
              sx={{ borderRadius: 6, textTransform: "none" }}
            >
              Escuchar
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
          >
            {selectedScale.minorNotes.slice(0, 7).map((note, index) => (
              <Chip
                key={`minor-${selectedScale.relativeMinor}-${note}-${index}`}
                label={`${DEGREE_LABELS[index]} (${index + 1}). ${note}`}
                color={index === 0 ? "success" : "default"}
                variant={index === 0 ? "filled" : "outlined"}
              />
            ))}
          </Stack>

          <Typography>
            La tónica menor es el <strong>6º grado</strong> de la mayor (
            <strong>{selectedScale.sixthDegree}</strong>).
          </Typography>
          <Typography color="text.secondary">
            Armadura: {selectedScale.keySignature}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            bgcolor: "#f5fdfb",
            borderColor: "#80cbc4",
            borderWidth: 2,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 2 }}
            spacing={1}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#00695c" }}>
              Práctica Rápida: Flashcards
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={majorOnlyMode}
                    onChange={(e) => {
                      setMajorOnlyMode(e.target.checked);
                      clearFlashcardCheck();
                    }}
                    color="warning"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Solo Escalas Mayores
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={flashcardAudioOnlyMode}
                    onChange={(e) =>
                      setFlashcardAudioOnlyMode(e.target.checked)
                    }
                    color="info"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Audio primero
                  </Typography>
                }
              />
              <Button
                variant="contained"
                size="small"
                onClick={nextFlashcard}
                sx={{ bgcolor: "#00897b", textTransform: "none" }}
              >
                Siguiente Tarjeta
              </Button>
              <Button
                variant={flashcardSprintActive ? "contained" : "outlined"}
                color={flashcardSprintActive ? "warning" : "primary"}
                size="small"
                startIcon={<AccessTime />}
                onClick={() => {
                  if (flashcardSprintActive) {
                    setFlashcardSprintActive(false);
                    return;
                  }
                  setFlashcardSprintRemaining(90);
                  setFlashcardSprintStats({
                    reviewed: 0,
                    correct: 0,
                    streak: 0,
                    bestStreak: 0,
                  });
                  setFlashcardSprintActive(true);
                  nextFlashcard();
                }}
                sx={{ textTransform: "none" }}
              >
                {flashcardSprintActive ? "Detener Sprint" : "Sprint 90s"}
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{ mb: 2 }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`Sesion: ${flashcardSessionStats.correct}/${flashcardSessionStats.reviewed}`}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`Racha: ${flashcardSessionStats.streak}`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`Errores pendientes: ${flashcardReviewQueue.length}`}
                color={flashcardReviewQueue.length > 0 ? "error" : "default"}
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              {flashcardSprintActive && (
                <Chip
                  icon={<AccessTime />}
                  label={`Sprint ${formatTime(flashcardSprintRemaining)}`}
                  color="warning"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={flashcardReviewOnlyMode}
                  onChange={(e) => setFlashcardReviewOnlyMode(e.target.checked)}
                  color="error"
                  disabled={flashcardReviewQueue.length === 0}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Repasar solo errores
                </Typography>
              }
            />
          </Stack>

          {majorOnlyMode ? (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Tipos de pregunta (Solo Escalas Mayores):
              </Typography>
              <FormGroup row>
                {ALL_MAJOR_ONLY_TYPES.map((t) => (
                  <FormControlLabel
                    key={t}
                    control={
                      <Checkbox
                        size="small"
                        checked={activeMajorOnlyTypes.includes(t)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveMajorOnlyTypes((prev) => [...prev, t]);
                          } else {
                            setActiveMajorOnlyTypes((prev) =>
                              prev.filter((x) => x !== t),
                            );
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {MAJOR_ONLY_MODE_LABELS[t]}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                Tipos de pregunta a incluir:
              </Typography>
              <FormGroup row>
                {ALL_FLASHCARD_MODES.map((mode) => (
                  <FormControlLabel
                    key={mode}
                    control={
                      <Checkbox
                        size="small"
                        checked={activeFlashcardModes.includes(mode)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActiveFlashcardModes((prev) => [...prev, mode]);
                          } else {
                            setActiveFlashcardModes((prev) =>
                              prev.filter((m) => m !== mode),
                            );
                          }
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {FLASHCARD_MODE_LABELS[mode]}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          )}

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "center", md: "flex-start" }}
            justifyContent="center"
          >
          {/* Flashcard Card */}
          <Box
            sx={{
              perspective: "1000px",
              width: "100%",
              maxWidth: "420px",
              height: "240px",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={() => {
              if (isFlipped) {
                setIsFlipped(false);
              } else {
                revealFlashcardAnswer();
              }
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* FRENTE */}
              <Paper
                elevation={4}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: majorOnlyMode
                    ? "#fff8e1"
                    : flashcardMode === "majorToMinor" ||
                        flashcardMode === "signatureToKeys" ||
                        flashcardMode === "notesToMinorKey"
                      ? "#fff"
                      : "#e0f2f1",
                  borderRadius: 3,
                  border: majorOnlyMode
                    ? "2px solid #ffe082"
                    : flashcardMode === "majorToMinor" ||
                        flashcardMode === "signatureToKeys" ||
                        flashcardMode === "notesToMinorKey"
                      ? "2px solid #b2dfdb"
                      : "2px solid #4db6ac",
                  gap: 1,
                }}
              >
                {majorOnlyMode ? (
                  renderMajorOnlyFlashcardFront()
                ) : flashcardMode === "majorToMinor" ? (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      ¿Cuál es el Relativo Menor de...?
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontWeight: 600, mt: -0.5 }}
                    >
                      (Baja 3 semitonos)
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: "#004d40",
                        textAlign: "center",
                      }}
                    >
                      {flashcardVisualMasked
                        ? "Escucha la pista"
                        : extractAmericanNotation(currentFlashcard.major)}
                    </Typography>
                  </>
                ) : flashcardMode === "minorToMajor" ? (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      ¿A qué Mayor corresponde este Relativo?
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontWeight: 600, mt: -0.5 }}
                    >
                      (Sube 3 semitonos)
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: "#00695c",
                        textAlign: "center",
                      }}
                    >
                      {flashcardVisualMasked
                        ? "Escucha la pista"
                        : extractAmericanNotation(
                            currentFlashcard.relativeMinor,
                          )}
                    </Typography>
                    <Chip
                      label={
                        flashcardVisualMasked
                          ? "Pista visual oculta"
                          : currentFlashcard.keySignature
                      }
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </>
                ) : flashcardMode === "signatureToKeys" ? (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      ¿A qué escalas pertenece esta armadura?
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontWeight: 600, mt: -1.5, mb: 0.5 }}
                    >
                      (Último # + 1/2 tono / Penúltimo b)
                    </Typography>
                    <Chip
                      label={
                        flashcardVisualMasked
                          ? "Usa audio o pistas"
                          : currentFlashcard.keySignature
                      }
                      color="secondary"
                      sx={{ fontWeight: 800, fontSize: "1.2rem", py: 2.5 }}
                    />
                  </>
                ) : flashcardMode === "sixthDegreeToKey" ? (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, px: 2, textAlign: "center" }}
                    >
                      Si esta nota es el 6º grado de una Escala Mayor...
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontWeight: 600, mt: -0.5, mb: 1 }}
                    >
                      (Recuerda, el 6º grado es el Relativo Menor)
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 800,
                        color: "#00695c",
                        textAlign: "center",
                      }}
                    >
                      {flashcardVisualMasked
                        ? "Escucha la pista"
                        : extractAmericanNotation(currentFlashcard.sixthDegree)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mt: 1 }}
                    >
                      ¿De qué Escala Mayor se trata?
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      ¿Qué escala menor natural es esta?
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ fontWeight: 600, mt: -1.5, mb: 0.5 }}
                    >
                      (Fíjate en las alteraciones o distancias T-st)
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      justifyContent="center"
                      px={2}
                    >
                      {flashcardVisualMasked ? (
                        <Chip
                          label="Notas ocultas"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: "#fff3e0",
                            color: "#e65100",
                          }}
                        />
                      ) : (
                        currentFlashcard.minorNotes.map((note, idx) => (
                          <Chip
                            key={idx}
                            label={note}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              bgcolor: "#e0f2f1",
                              color: "#004d40",
                            }}
                          />
                        ))
                      )}
                    </Stack>
                  </>
                )}
                <Typography
                  variant="body2"
                  sx={{ mt: 2, color: "text.disabled", fontSize: "0.75rem" }}
                >
                  Toca para voltear ↻
                </Typography>
              </Paper>

              {/* REVERSO */}
              <Paper
                elevation={4}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: majorOnlyMode
                    ? "#fff3e0"
                    : flashcardMode === "majorToMinor" ||
                        flashcardMode === "signatureToKeys" ||
                        flashcardMode === "notesToMinorKey"
                      ? "#e0f2f1"
                      : "#fff",
                  borderRadius: 3,
                  border: majorOnlyMode
                    ? "2px solid #ffb74d"
                    : flashcardMode === "majorToMinor" ||
                        flashcardMode === "signatureToKeys" ||
                        flashcardMode === "notesToMinorKey"
                      ? "2px solid #4db6ac"
                      : "2px solid #b2dfdb",
                  gap: 1,
                }}
              >
                {majorOnlyMode ? (
                  renderMajorOnlyFlashcardBack()
                ) : flashcardMode === "majorToMinor" ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#00695c" }}
                    >
                      {extractAmericanNotation(currentFlashcard.relativeMinor)}
                    </Typography>
                    <Chip
                      label={`Armadura: ${currentFlashcard.keySignature}`}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: "0.95rem", py: 2.5 }}
                    />
                  </>
                ) : flashcardMode === "minorToMajor" ? (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Tonalidad Mayor:
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "#004d40" }}
                    >
                      {extractAmericanNotation(currentFlashcard.major)}
                    </Typography>
                  </>
                ) : flashcardMode === "signatureToKeys" ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#004d40" }}
                    >
                      {extractAmericanNotation(currentFlashcard.major)}
                    </Typography>
                    <Divider sx={{ width: "60%", my: 0.5 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#00695c" }}
                    >
                      {extractAmericanNotation(currentFlashcard.relativeMinor)}
                    </Typography>
                  </>
                ) : flashcardMode === "sixthDegreeToKey" ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#004d40", mb: 1 }}
                    >
                      {extractAmericanNotation(currentFlashcard.major)}
                    </Typography>
                    <Chip
                      label={`Relativo Menor: ${extractAmericanNotation(currentFlashcard.relativeMinor)}`}
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 700 }}
                    />
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Es la escala relativa de:
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 800, color: "#00695c" }}
                    >
                      {extractAmericanNotation(currentFlashcard.relativeMinor)}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.disabled"
                      sx={{ mt: 1 }}
                    >
                      ({extractAmericanNotation(currentFlashcard.major)})
                    </Typography>
                  </>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Quick Access: Quintas Diatónicas + Escala */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderColor: "#ffcc80",
              bgcolor: "#fffde7",
              borderRadius: 2,
              minWidth: 200,
              flexShrink: 0,
              display: { xs: "none", md: "block" },
            }}
          >
            <Stack direction="row" spacing={2.5}>
              {/* Fifths pairs column */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#e65100", mb: 0.5, display: "block" }}
                >
                  Quintas ↓
                </Typography>
                {[
                  ["C", "G"],
                  ["B", "F"],
                  ["A", "E"],
                  ["G", "D"],
                  ["F", "C"],
                  ["E", "B"],
                  ["D", "A"],
                  ["C", "G"],
                ].map(([left, right], idx) => (
                  <Stack
                    key={`fifth-${idx}`}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      py: 0.15,
                      borderBottom: idx < 7 ? "1px solid #fff3e0" : "none",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#bf360c", minWidth: 24, textAlign: "right" }}
                    >
                      {left}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">—</Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#4e342e", minWidth: 24 }}
                    >
                      {right}
                    </Typography>
                  </Stack>
                ))}
              </Box>

              {/* Divider */}
              <Divider orientation="vertical" flexItem />

              {/* Thirds pairs column */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#1565c0", mb: 0.5, display: "block" }}
                >
                  Terceras ↓
                </Typography>
                {[
                  ["C", "E"],
                  ["B", "D"],
                  ["A", "C"],
                  ["G", "B"],
                  ["F", "A"],
                  ["E", "G"],
                  ["D", "F"],
                  ["C", "E"],
                ].map(([left, right], idx) => (
                  <Stack
                    key={`third-${idx}`}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      py: 0.15,
                      borderBottom: idx < 7 ? "1px solid #e3f2fd" : "none",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#1565c0", minWidth: 24, textAlign: "right" }}
                    >
                      {left}
                    </Typography>
                    <Typography variant="body2" color="text.disabled">—</Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#37474f", minWidth: 24 }}
                    >
                      {right}
                    </Typography>
                  </Stack>
                ))}
              </Box>

              {/* Divider */}
              <Divider orientation="vertical" flexItem />

              {/* Scale column */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#00695c", mb: 0.5, display: "block" }}
                >
                  Escala
                </Typography>
                {["B", "A", "G", "F", "E", "D", "C"].map(
                  (note, idx) => (
                    <Typography
                      key={`scale-col-${idx}`}
                      variant="body2"
                      sx={{
                        fontWeight: idx === 0 || idx === 7 ? 800 : 600,
                        color: idx === 0 || idx === 7 ? "#00695c" : "#37474f",
                        py: 0.15,
                        borderBottom: idx < 7 ? "1px solid #e0f2f1" : "none",
                      }}
                    >
                      {note}
                    </Typography>
                  ),
                )}
              </Box>
            </Stack>
          </Paper>
          </Stack>

          <Stack spacing={1.5} sx={{ mt: 2, alignItems: "center" }}>
            {renderFlashcardAnswerInputs()}

            {flashcardHintLevel > 0 && (
              <Stack spacing={0.5} sx={{ width: "100%", maxWidth: 520 }}>
                {flashcardPromptMeta.hintSteps
                  .slice(0, flashcardHintLevel)
                  .map((hint, idx) => (
                    <Typography
                      key={`flash-hint-${idx}`}
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        bgcolor: "rgba(255, 193, 7, 0.08)",
                      }}
                    >
                      Pista {idx + 1}: {hint}
                    </Typography>
                  ))}
              </Stack>
            )}

            {flashcardChecked && (
              <Chip
                color={flashcardCheckResult?.isCorrect ? "success" : "error"}
                label={
                  flashcardCheckResult?.isCorrect
                    ? "Respuesta correcta"
                    : "Respuesta incorrecta"
                }
                sx={{ fontWeight: 700 }}
              />
            )}

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<PlayArrowRounded />}
                onClick={playFlashcardPromptAudio}
                sx={{ textTransform: "none" }}
              >
                {flashcardPromptMeta.audioLabel}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() =>
                  setFlashcardHintLevel((prev) =>
                    Math.min(prev + 1, flashcardPromptMeta.hintSteps.length),
                  )
                }
                disabled={
                  flashcardHintLevel >= flashcardPromptMeta.hintSteps.length
                }
                sx={{ textTransform: "none" }}
              >
                Pista {flashcardHintLevel}/
                {flashcardPromptMeta.hintSteps.length}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => runFlashcardCheck(false)}
                sx={{ textTransform: "none", bgcolor: "#00796b" }}
              >
                Comprobar
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={revealFlashcardAnswer}
                sx={{ textTransform: "none" }}
              >
                Mostrar respuesta
              </Button>
            </Stack>

            {isFlipped && (
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                justifyContent="center"
              >
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={() => submitFlashcardAssessment("again")}
                  sx={{ textTransform: "none" }}
                >
                  Again
                </Button>
                <Button
                  size="small"
                  color="warning"
                  variant="contained"
                  onClick={() => submitFlashcardAssessment("hard")}
                  sx={{ textTransform: "none" }}
                >
                  Hard
                </Button>
                <Button
                  size="small"
                  color="success"
                  variant="contained"
                  onClick={() => submitFlashcardAssessment("easy")}
                  sx={{ textTransform: "none" }}
                >
                  Easy
                </Button>
              </Stack>
            )}

            {flashcardSprintActive && (
              <Typography variant="caption" color="text.secondary">
                Sprint: {flashcardSprintStats.correct}/
                {flashcardSprintStats.reviewed} correctas, mejor racha{" "}
                {flashcardSprintStats.bestStreak}.
              </Typography>
            )}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 4 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Tabla de Memorización Rápida
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Esta tabla resume el número de alteraciones exactas para cada
                tonalidad Mayor y su Relativa Menor correspondiente. Úsala para
                memorizar.
              </Typography>
            </Box>
            <Stack direction="row" alignItems="center" gap={2}>
              {memoTablePracticeMode && (
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => {
                    const newAnswers = { ...tablePracticeAnswers };
                    Object.keys(newAnswers).forEach((key) => {
                      if (key.startsWith("memo-")) {
                        delete newAnswers[key];
                      }
                    });
                    setTablePracticeAnswers(newAnswers);
                  }}
                >
                  Limpiar Práctica
                </Button>
              )}
              <FormControlLabel
                control={
                  <Switch
                    checked={memoTablePracticeMode}
                    onChange={(e) => setMemoTablePracticeMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="Modo Práctica"
                sx={{ m: 0 }}
              />
            </Stack>
          </Stack>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.04)" }}>
                <TableRow>
                  {memoTablePracticeMode && <TableCell width={40} />}
                  <TableCell align="center">
                    <strong>Nº Alteraciones</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Sostenidos (#)</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Bemoles (b)</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(
                  [
                    {
                      count: 0,
                      sharps: "C (Am)",
                      flats: "C (Am)",
                      sharpsAcc: "-",
                      flatsAcc: "-",
                    },
                    {
                      count: 1,
                      sharps: "G (Em)",
                      flats: "F (Dm)",
                      sharpsAcc: "F#",
                      flatsAcc: "Bb",
                    },
                    {
                      count: 2,
                      sharps: "D (Bm)",
                      flats: "Bb (Gm)",
                      sharpsAcc: "F# C#",
                      flatsAcc: "Bb Eb",
                    },
                    {
                      count: 3,
                      sharps: "A (F#m)",
                      flats: "Eb (Cm)",
                      sharpsAcc: "F# C# G#",
                      flatsAcc: "Bb Eb Ab",
                    },
                    {
                      count: 4,
                      sharps: "E (C#m)",
                      flats: "Ab (Fm)",
                      sharpsAcc: "F# C# G# D#",
                      flatsAcc: "Bb Eb Ab Db",
                    },
                    {
                      count: 5,
                      sharps: "B (G#m)",
                      flats: "Db (Bbm)",
                      sharpsAcc: "F# C# G# D# A#",
                      flatsAcc: "Bb Eb Ab Db Gb",
                    },
                    {
                      count: 6,
                      sharps: "F# (D#m)",
                      flats: "Gb (Ebm)",
                      sharpsAcc: "F# C# G# D# A# E#",
                      flatsAcc: "Bb Eb Ab Db Gb Cb",
                    },
                    {
                      count: 7,
                      sharps: "C# (A#m)",
                      flats: "Cb (Abm)",
                      sharpsAcc: "F# C# G# D# A# E# B#",
                      flatsAcc: "Bb Eb Ab Db Gb Cb Fb",
                    },
                  ] as const
                ).map((row, idx) =>
                  renderMemorizationRow(
                    `memo-${idx}`,
                    row.count,
                    row.sharps,
                    row.flats,
                    row.sharpsAcc,
                    row.flatsAcc,
                    memoTablePracticeMode,
                    tablePracticeAnswers,
                    setTablePracticeAnswers,
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Reloj del círculo de quintas (armaduras)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A la derecha (sentido horario desde C) aumentan los{" "}
            <strong>sostenidos</strong>. A la izquierda aumentan los{" "}
            <strong>bemoles</strong>.
          </Typography>

          <FormControl
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 230 }, mb: 2 }}
          >
            <InputLabel id="focus-root-select-label">
              Tonalidad foco (reloj)
            </InputLabel>
            <Select
              labelId="focus-root-select-label"
              value={focusRoot}
              label="Tonalidad foco (reloj)"
              onChange={(event) =>
                setFocusRoot(event.target.value as RootLabel)
              }
            >
              {CHROMATIC_ROOTS.map((root) => (
                <MenuItem key={root} value={root}>
                  {root}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CircleOfFifthsClock selectedRoot={focusRoot} compact={isMobile} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            sx={{ mt: 2 }}
          >
            <Chip
              label="Derecha del reloj = sostenidos"
              sx={{ bgcolor: "rgba(21,101,192,0.08)", color: "#1565c0" }}
            />
            <Chip
              label="Izquierda del reloj = bemoles"
              sx={{ bgcolor: "rgba(142,36,170,0.08)", color: "#8e24aa" }}
            />
            <Chip
              label="Centro = menores relativos"
              sx={{ bgcolor: "rgba(69,90,100,0.08)", color: "#455a64" }}
            />
          </Stack>
          {isMobile && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              En móvil se muestra una versión compacta del reloj para evitar
              encimado de etiquetas.
            </Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Orden de aparición de armaduras
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showArmadurasText}
                  onChange={(e) => setShowArmadurasText(e.target.checked)}
                  color="primary"
                />
              }
              label="Mostrar notas"
            />
          </Stack>

          <Stack
            spacing={4}
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-around"
          >
            <Box>
              <Typography
                variant="subtitle1"
                color="primary.main"
                sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}
              >
                Orden de Bemoles (b)
              </Typography>
              <div
                id="vf-treble-flats"
                ref={vfTrebleFlatsRef}
                style={{ display: "flex", justifyContent: "center" }}
              />
              <div
                id="vf-bass-flats"
                ref={vfBassFlatsRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: -15,
                }}
              />
              {showArmadurasText && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={1.5}
                  sx={{ mt: 1, ml: 3, opacity: 0.85 }}
                >
                  {["Sib", "Mib", "Lab", "Reb", "Solb", "Dob", "Fab"].map(
                    (n) => (
                      <Typography
                        key={`f-${n}`}
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {n}
                      </Typography>
                    ),
                  )}
                </Stack>
              )}
            </Box>

            <Box>
              <Typography
                variant="subtitle1"
                color="error.main"
                sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}
              >
                Orden de Sostenidos (#)
              </Typography>
              <div
                id="vf-treble-sharps"
                ref={vfTrebleSharpsRef}
                style={{ display: "flex", justifyContent: "center" }}
              />
              <div
                id="vf-bass-sharps"
                ref={vfBassSharpsRef}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: -15,
                }}
              />
              {showArmadurasText && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={1.5}
                  sx={{ mt: 1, ml: 3, opacity: 0.85 }}
                >
                  {["Fa#", "Do#", "Sol#", "Re#", "La#", "Mi#", "Si#"].map(
                    (n) => (
                      <Typography
                        key={`s-${n}`}
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {n}
                      </Typography>
                    ),
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ mb: 1.5 }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tablas de Tonalidades Mayores y sus Relativos
              </Typography>
              {challengeActive ? (
                <Chip
                  icon={<AccessTime />}
                  label={formatTime(challengeTimer)}
                  color="warning"
                  sx={{
                    fontWeight: "bold",
                    px: 1,
                    fontSize: "1.1rem",
                    borderRadius: 1,
                  }}
                />
              ) : challengeResult ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    icon={<CheckCircleOutline />}
                    label={`${formatTime(challengeTimer)} • ${challengeResult.correct} / ${challengeResult.total} correctas`}
                    color={
                      challengeResult.correct === challengeResult.total
                        ? "success"
                        : "primary"
                    }
                    sx={{ fontWeight: "bold", borderRadius: 1 }}
                  />
                </Stack>
              ) : null}
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: { xs: 1.5, md: 0 } }}
            >
              {!challengeActive ? (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  startIcon={<AccessTime />}
                  onClick={startChallenge}
                  sx={{
                    borderRadius: 6,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Reto Contra Reloj
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={stopChallenge}
                  sx={{
                    borderRadius: 6,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Calificar Reto Completo
                </Button>
              )}

              {tablePracticeMode &&
                !challengeActive &&
                Object.keys(tablePracticeAnswers).length > 0 && (
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    startIcon={<DeleteOutline />}
                    onClick={() => {
                      setTablePracticeAnswers({});
                      setChallengeTimer(0);
                    }}
                  >
                    Limpiar Práctica
                  </Button>
                )}
              <FormControlLabel
                control={
                  <Switch
                    checked={tablePracticeMode}
                    onChange={(e) => setTablePracticeMode(e.target.checked)}
                    color="primary"
                    disabled={challengeActive}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Modo Práctica
                  </Typography>
                }
              />
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Box sx={{ overflowX: "auto" }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Subtabla 1: Bemoles
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {tablePracticeMode && (
                      <TableCell align="center" sx={{ width: 40 }}></TableCell>
                    )}
                    <TableCell align="center">Tonalidad</TableCell>
                    <TableCell align="center"># de bemoles</TableCell>
                    {SCALE_COLUMNS.map((degree, index) => (
                      <TableCell
                        key={`flat-head-${degree}`}
                        align="center"
                        sx={
                          index === 5
                            ? {
                                backgroundColor: "#e8f5e9",
                                fontWeight: 700,
                                width: tablePracticeMode ? 70 : "auto",
                              }
                            : { width: tablePracticeMode ? 70 : "auto" }
                        }
                      >
                        {degree}
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        width: tablePracticeMode ? 140 : "auto",
                      }}
                    >
                      Relativo Menor
                    </TableCell>
                    {tablePracticeMode && (
                      <TableCell align="center" sx={{ width: 60 }}></TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderPracticeRow(
                    "c-flat",
                    "C",
                    "C",
                    0,
                    ["C", "D", "E", "F", "G", "A", "B", "C"],
                    "Am",
                    tablePracticeMode,
                    tablePracticeAnswers,
                    setTablePracticeAnswers,
                  )}
                  {FLAT_SUBTABLE.map((row) =>
                    renderPracticeRow(
                      `flat-${row.tonality}`,
                      row.tonality,
                      row.tonalityEn,
                      row.count,
                      row.majorScale,
                      row.relativeMinor,
                      tablePracticeMode,
                      tablePracticeAnswers,
                      setTablePracticeAnswers,
                    ),
                  )}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Subtabla 2: Sostenidos (empieza en Sol)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {tablePracticeMode && (
                      <TableCell align="center" sx={{ width: 40 }}></TableCell>
                    )}
                    <TableCell align="center">Tonalidad</TableCell>
                    <TableCell align="center"># de sostenidos</TableCell>
                    {SCALE_COLUMNS.map((degree, index) => (
                      <TableCell
                        key={`sharp-head-${degree}`}
                        align="center"
                        sx={
                          index === 5
                            ? {
                                backgroundColor: "#e8f5e9",
                                fontWeight: 700,
                                width: tablePracticeMode ? 70 : "auto",
                              }
                            : { width: tablePracticeMode ? 70 : "auto" }
                        }
                      >
                        {degree}
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 600,
                        width: tablePracticeMode ? 140 : "auto",
                      }}
                    >
                      Relativo Menor
                    </TableCell>
                    {tablePracticeMode && (
                      <TableCell align="center" sx={{ width: 60 }}></TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renderPracticeRow(
                    "c-sharp",
                    "C",
                    "C",
                    0,
                    ["C", "D", "E", "F", "G", "A", "B", "C"],
                    "Am",
                    tablePracticeMode,
                    tablePracticeAnswers,
                    setTablePracticeAnswers,
                  )}
                  {SHARP_SUBTABLE.map((row) =>
                    renderPracticeRow(
                      `sharp-${row.tonality}`,
                      row.tonality,
                      row.tonalityEn,
                      row.count,
                      row.majorScale,
                      row.relativeMinor,
                      tablePracticeMode,
                      tablePracticeAnswers,
                      setTablePracticeAnswers,
                    ),
                  )}
                </TableBody>
              </Table>
            </Box>
          </Stack>
          <Box sx={{ mt: 1.25 }}>
            <Typography variant="body2" color="text.secondary">
              Nota: C mayor tiene 0 alteraciones.
            </Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ mb: 1.5 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Práctica rápida (exam mode)
              </Typography>
              {scoreTotal > 0 && (
                <Chip
                  color={scoreCorrect === scoreTotal ? "success" : "primary"}
                  label={`Puntuación: ${scoreCorrect} / ${scoreTotal}`}
                  sx={{ fontWeight: 700, borderRadius: 1 }}
                />
              )}
            </Stack>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      enabledQuizTypes.includes("writeMajor") ||
                      enabledQuizTypes.includes("writeMinor")
                    }
                    onChange={(e) => {
                      const tgts: QuizQuestionType[] = [
                        "writeMajor",
                        "writeMinor",
                      ];
                      setEnabledQuizTypes((prev) =>
                        e.target.checked
                          ? [...new Set([...prev, ...tgts])]
                          : prev.filter((t) => !tgts.includes(t)),
                      );
                    }}
                  />
                }
                label={
                  <Typography variant="body2">Escribir escalas</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={enabledQuizTypes.includes("writeMinorFromMajor")}
                    onChange={(e) => {
                      const tgts: QuizQuestionType[] = ["writeMinorFromMajor"];
                      setEnabledQuizTypes((prev) =>
                        e.target.checked
                          ? [...new Set([...prev, ...tgts])]
                          : prev.filter((t) => !tgts.includes(t)),
                      );
                    }}
                  />
                }
                label={
                  <Typography variant="body2">De Mayor a Menor</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      enabledQuizTypes.includes("majorToMinor") ||
                      enabledQuizTypes.includes("minorToMajor")
                    }
                    onChange={(e) => {
                      const tgts: QuizQuestionType[] = [
                        "majorToMinor",
                        "minorToMajor",
                      ];
                      setEnabledQuizTypes((prev) =>
                        e.target.checked
                          ? [...new Set([...prev, ...tgts])]
                          : prev.filter((t) => !tgts.includes(t)),
                      );
                    }}
                  />
                }
                label={
                  <Typography variant="body2">Relativos menores</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      enabledQuizTypes.includes("identifySixth") ||
                      enabledQuizTypes.includes("identifyNthDegree")
                    }
                    onChange={(e) => {
                      const tgts: QuizQuestionType[] = [
                        "identifySixth",
                        "identifyNthDegree",
                      ];
                      setEnabledQuizTypes((prev) =>
                        e.target.checked
                          ? [...new Set([...prev, ...tgts])]
                          : prev.filter((t) => !tgts.includes(t)),
                      );
                    }}
                  />
                }
                label={
                  <Typography variant="body2">Grados (6º, N-º)</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={enabledQuizTypes.includes(
                      "identifyNthDegreeMinor",
                    )}
                    onChange={(e) => {
                      const tgts: QuizQuestionType[] = [
                        "identifyNthDegreeMinor",
                      ];
                      setEnabledQuizTypes((prev) =>
                        e.target.checked
                          ? [...new Set([...prev, ...tgts])]
                          : prev.filter((t) => !tgts.includes(t)),
                      );
                    }}
                  />
                }
                label={
                  <Typography variant="body2">Grados en menores</Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      enabledQuizTypes.includes("countAccidentals") ||
                      enabledQuizTypes.includes("identifyKeyByAccidentals")
                    }
                    onChange={(e) => {
                      const tgts: QuizQuestionType[] = [
                        "countAccidentals",
                        "identifyKeyByAccidentals",
                      ];
                      setEnabledQuizTypes((prev) =>
                        e.target.checked
                          ? [...new Set([...prev, ...tgts])]
                          : prev.filter((t) => !tgts.includes(t)),
                      );
                    }}
                  />
                }
                label={<Typography variant="body2">Armaduras</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={
                      enabledQuizTypes.includes("identifyAccidentalType") ||
                      enabledQuizTypes.includes("orderOfAccidentals") ||
                      enabledQuizTypes.includes("identifyKeyBySignatureType")
                    }
                    onChange={(e) => {
                      const tgts: QuizQuestionType[] = [
                        "identifyAccidentalType",
                        "orderOfAccidentals",
                        "identifyKeyBySignatureType",
                      ];
                      setEnabledQuizTypes((prev) =>
                        e.target.checked
                          ? [...new Set([...prev, ...tgts])]
                          : prev.filter((t) => !tgts.includes(t)),
                      );
                    }}
                  />
                }
                label={
                  <Typography variant="body2">Armaduras avanzadas</Typography>
                }
              />
            </FormGroup>
          </Stack>

          <Typography sx={{ mb: 1.5 }}>{question.questionText}</Typography>

          {isMultipleChoice && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              {(question.options || []).map((option) => (
                <Button
                  key={`${question.questionText}-${option}`}
                  variant={selectedOption === option ? "contained" : "outlined"}
                  color={selectedOption === option ? "primary" : "inherit"}
                  onClick={() => {
                    if (isEvaluated) return;
                    setSelectedOption(option);
                    setIsEvaluated(true);

                    // Evaluate immediately to update score
                    const correct = option === question.answer;
                    setScoreTotal((prev) => prev + 1);
                    if (correct) setScoreCorrect((prev) => prev + 1);
                  }}
                >
                  {option}
                </Button>
              ))}
            </Stack>
          )}

          {isWriteScale && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Array.from({ length: 7 }).map((_, i) => (
                  <TextField
                    key={`scale-input-${i}`}
                    label={DEGREE_LABELS[i]}
                    size="small"
                    value={scaleInputs[i]}
                    onChange={(e) => {
                      const newInputs = [...scaleInputs];
                      newInputs[i] = e.target.value;
                      setScaleInputs(newInputs);
                    }}
                    sx={{ width: { xs: "calc(33.33% - 8px)", sm: 80 } }}
                    InputProps={{
                      readOnly: isEvaluated,
                    }}
                    color={
                      isEvaluated
                        ? scaleInputs[i].trim().toLowerCase() ===
                          (question.answerArray?.[i] || "").toLowerCase()
                          ? "success"
                          : "error"
                        : "primary"
                    }
                    focused={isEvaluated}
                  />
                ))}
              </Stack>
              {!isEvaluated && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsEvaluated(true);
                    const correct = scaleInputs.every(
                      (val, i) =>
                        val.trim().toLowerCase() ===
                        (question.answerArray?.[i] || "").toLowerCase(),
                    );
                    setScoreTotal((prev) => prev + 1);
                    if (correct) setScoreCorrect((prev) => prev + 1);
                  }}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Calificar escala
                </Button>
              )}
            </Stack>
          )}

          {isIdentifyDegree && (
            <Stack spacing={2} direction="row" alignItems="center">
              <TextField
                size="small"
                label="Respuesta"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                InputProps={{ readOnly: isEvaluated }}
                color={
                  isEvaluated
                    ? textInput.trim().toLowerCase() ===
                      (question.answer || "").toLowerCase()
                      ? "success"
                      : "error"
                    : "primary"
                }
                focused={isEvaluated}
              />
              {!isEvaluated && (
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsEvaluated(true);
                    const correct =
                      textInput.trim().toLowerCase() ===
                      (question.answer || "").toLowerCase();
                    setScoreTotal((prev) => prev + 1);
                    if (correct) setScoreCorrect((prev) => prev + 1);
                  }}
                >
                  Calificar
                </Button>
              )}
            </Stack>
          )}

          {answered && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" spacing={1} alignItems="center">
                {isCorrect ? (
                  <>
                    <CheckCircleOutline color="success" />
                    <Typography color="success.main" sx={{ fontWeight: 600 }}>
                      ¡Correcto!
                    </Typography>
                  </>
                ) : (
                  <>
                    <CancelOutlined color="error" />
                    <Stack>
                      <Typography color="error.main" sx={{ fontWeight: 600 }}>
                        Casi. La respuesta correcta es:
                      </Typography>
                      {isMultipleChoice && (
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {question.answer}
                        </Typography>
                      )}
                      {isIdentifyDegree && (
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {question.answer}
                        </Typography>
                      )}
                      {isWriteScale && (
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {question.answerArray?.join(" - ")}
                        </Typography>
                      )}
                    </Stack>
                  </>
                )}
              </Stack>
            </>
          )}

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={handleNextQuestion}
          >
            Siguiente pregunta
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
}
