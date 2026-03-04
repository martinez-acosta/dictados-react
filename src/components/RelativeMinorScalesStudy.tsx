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
    majorScale: ["Fa", "Sol", "La", "Sib", "Do", "Re", "Mi", "Fa"],
    relativeMinor: "Re menor (Dm)",
  },
  {
    tonality: "Sib",
    tonalityEn: "Bb",
    count: 2,
    majorScale: ["Sib", "Do", "Re", "Mib", "Fa", "Sol", "La", "Sib"],
    relativeMinor: "Sol menor (Gm)",
  },
  {
    tonality: "Mib",
    tonalityEn: "Eb",
    count: 3,
    majorScale: ["Mib", "Fa", "Sol", "Lab", "Sib", "Do", "Re", "Mib"],
    relativeMinor: "Do menor (Cm)",
  },
  {
    tonality: "Lab",
    tonalityEn: "Ab",
    count: 4,
    majorScale: ["Lab", "Sib", "Do", "Reb", "Mib", "Fa", "Sol", "Lab"],
    relativeMinor: "Fa menor (Fm)",
  },
  {
    tonality: "Reb",
    tonalityEn: "Db",
    count: 5,
    majorScale: ["Reb", "Mib", "Fa", "Solb", "Lab", "Sib", "Do", "Reb"],
    relativeMinor: "Sib menor (Bbm)",
  },
  {
    tonality: "Solb",
    tonalityEn: "Gb",
    count: 6,
    majorScale: ["Solb", "Lab", "Sib", "Dob", "Reb", "Mib", "Fa", "Solb"],
    relativeMinor: "Mib menor (Ebm)",
  },
];

const SHARP_SUBTABLE: SubtableRow[] = [
  {
    tonality: "Sol",
    tonalityEn: "G",
    count: 1,
    majorScale: ["Sol", "La", "Si", "Do", "Re", "Mi", "Fa#", "Sol"],
    relativeMinor: "Mi menor (Em)",
  },
  {
    tonality: "Re",
    tonalityEn: "D",
    count: 2,
    majorScale: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#", "Re"],
    relativeMinor: "Si menor (Bm)",
  },
  {
    tonality: "La",
    tonalityEn: "A",
    count: 3,
    majorScale: ["La", "Si", "Do#", "Re", "Mi", "Fa#", "Sol#", "La"],
    relativeMinor: "Fa# menor (F#m)",
  },
  {
    tonality: "Mi",
    tonalityEn: "E",
    count: 4,
    majorScale: ["Mi", "Fa#", "Sol#", "La", "Si", "Do#", "Re#", "Mi"],
    relativeMinor: "Do# menor (C#m)",
  },
  {
    tonality: "Si",
    tonalityEn: "B",
    count: 5,
    majorScale: ["Si", "Do#", "Re#", "Mi", "Fa#", "Sol#", "La#", "Si"],
    relativeMinor: "Sol# menor (G#m)",
  },
  {
    tonality: "Fa#",
    tonalityEn: "F#",
    count: 6,
    majorScale: ["Fa#", "Sol#", "La#", "Si", "Do#", "Re#", "Mi#", "Fa#"],
    relativeMinor: "Re# menor (D#m)",
  },
  {
    tonality: "Do#",
    tonalityEn: "C#",
    count: 7,
    majorScale: ["Do#", "Re#", "Mi#", "Fa#", "Sol#", "La#", "Si#", "Do#"],
    relativeMinor: "La# menor (A#m)",
  },
];

const SCALE_GUIDE: ScaleGuideRow[] = [
  {
    major: "Do mayor (C)",
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
    minorNotes: ["La", "Si", "Do", "Re", "Mi", "Fa", "Sol", "La"],
    sixthDegree: "La",
    relativeMinor: "La menor (Am)",
    keySignature: "0 alteraciones",
  },
  {
    major: "Fa mayor (F)",
    notes: ["Fa", "Sol", "La", "Sib", "Do", "Re", "Mi", "Fa"],
    minorNotes: ["Re", "Mi", "Fa", "Sol", "La", "Sib", "Do", "Re"],
    sixthDegree: "Re",
    relativeMinor: "Re menor (Dm)",
    keySignature: "1 bemol (Sib)",
  },
  {
    major: "Sib mayor (Bb)",
    notes: ["Sib", "Do", "Re", "Mib", "Fa", "Sol", "La", "Sib"],
    minorNotes: ["Sol", "La", "Sib", "Do", "Re", "Mib", "Fa", "Sol"],
    sixthDegree: "Sol",
    relativeMinor: "Sol menor (Gm)",
    keySignature: "2 bemoles (Sib, Mib)",
  },
  {
    major: "Mib mayor (Eb)",
    notes: ["Mib", "Fa", "Sol", "Lab", "Sib", "Do", "Re", "Mib"],
    minorNotes: ["Do", "Re", "Mib", "Fa", "Sol", "Lab", "Sib", "Do"],
    sixthDegree: "Do",
    relativeMinor: "Do menor (Cm)",
    keySignature: "3 bemoles (Sib, Mib, Lab)",
  },
  {
    major: "Lab mayor (Ab)",
    notes: ["Lab", "Sib", "Do", "Reb", "Mib", "Fa", "Sol", "Lab"],
    minorNotes: ["Fa", "Sol", "Lab", "Sib", "Do", "Reb", "Mib", "Fa"],
    sixthDegree: "Fa",
    relativeMinor: "Fa menor (Fm)",
    keySignature: "4 bemoles (Sib, Mib, Lab, Reb)",
  },
  {
    major: "Reb mayor (Db)",
    notes: ["Reb", "Mib", "Fa", "Solb", "Lab", "Sib", "Do", "Reb"],
    minorNotes: ["Sib", "Do", "Reb", "Mib", "Fa", "Solb", "Lab", "Sib"],
    sixthDegree: "Sib",
    relativeMinor: "Sib menor (Bbm)",
    keySignature: "5 bemoles",
  },
  {
    major: "Solb mayor (Gb)",
    notes: ["Solb", "Lab", "Sib", "Dob", "Reb", "Mib", "Fa", "Solb"],
    minorNotes: ["Mib", "Fa", "Solb", "Lab", "Sib", "Dob", "Reb", "Mib"],
    sixthDegree: "Mib",
    relativeMinor: "Mib menor (Ebm)",
    keySignature: "6 bemoles",
  },
  {
    major: "Sol mayor (G)",
    notes: ["Sol", "La", "Si", "Do", "Re", "Mi", "Fa#", "Sol"],
    minorNotes: ["Mi", "Fa#", "Sol", "La", "Si", "Do", "Re", "Mi"],
    sixthDegree: "Mi",
    relativeMinor: "Mi menor (Em)",
    keySignature: "1 sostenido (Fa#)",
  },
  {
    major: "Re mayor (D)",
    notes: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#", "Re"],
    minorNotes: ["Si", "Do#", "Re", "Mi", "Fa#", "Sol", "La", "Si"],
    sixthDegree: "Si",
    relativeMinor: "Si menor (Bm)",
    keySignature: "2 sostenidos (Fa#, Do#)",
  },
  {
    major: "La mayor (A)",
    notes: ["La", "Si", "Do#", "Re", "Mi", "Fa#", "Sol#", "La"],
    minorNotes: ["Fa#", "Sol#", "La", "Si", "Do#", "Re", "Mi", "Fa#"],
    sixthDegree: "Fa#",
    relativeMinor: "Fa# menor (F#m)",
    keySignature: "3 sostenidos (Fa#, Do#, Sol#)",
  },
  {
    major: "Mi mayor (E)",
    notes: ["Mi", "Fa#", "Sol#", "La", "Si", "Do#", "Re#", "Mi"],
    minorNotes: ["Do#", "Re#", "Mi", "Fa#", "Sol#", "La", "Si", "Do#"],
    sixthDegree: "Do#",
    relativeMinor: "Do# menor (C#m)",
    keySignature: "4 sostenidos",
  },
  {
    major: "Si mayor (B)",
    notes: ["Si", "Do#", "Re#", "Mi", "Fa#", "Sol#", "La#", "Si"],
    minorNotes: ["Sol#", "La#", "Si", "Do#", "Re#", "Mi", "Fa#", "Sol#"],
    sixthDegree: "Sol#",
    relativeMinor: "Sol# menor (G#m)",
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
  const notesCorrect = currentState.notes.map(
    (n: string, i: number) =>
      n.trim().toLowerCase() === expectedNotes[i].toLowerCase(),
  );
  const normInput = currentState.relativeMinor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const normExpected = expectedRelativeMinor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Extract core note name and english symbol (e.g., from "la menor (am)" extract "la" and "am")
  const expectedParts = normExpected.match(
    /^([a-z#b]+)\s+menor\s+\(([a-z#bm]+)\)$/,
  );

  let relativeMinorCorrect = false;
  if (expectedParts) {
    const spanishNote = expectedParts[1];
    const englishSymbol = expectedParts[2];

    // Accept match if input is just "la", "am", "la menor", etc.
    if (
      normInput === spanishNote ||
      normInput === englishSymbol ||
      normInput === `${spanishNote} m` ||
      normInput === `${spanishNote} menor` ||
      (normExpected.includes(normInput) && normInput.length >= 2) // fallback
    ) {
      relativeMinorCorrect = true;
    }
  } else {
    relativeMinorCorrect =
      normInput === normExpected || normExpected.includes(normInput);
  }

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
  const isDo = rowKey === "do-flat" || rowKey === "do-sharp";
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
        {tonality} {tonalityEn ? `(${tonalityEn})` : ""}
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
      evaluated: false,
      sharpsMajorCorrect: false,
      sharpsMinorCorrect: false,
      flatsMajorCorrect: false,
      flatsMinorCorrect: false,
    }
  );
}

function handleMemorizationRowGrade(
  rowKey: string,
  expectedSharps: string,
  expectedFlats: string,
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

  const parseExpected = (str: string) => {
    const match = str.match(/(.*?)\s*\((.*?)\)/);
    if (match) {
      return { major: match[1].trim(), minor: match[2].trim() };
    }
    return { major: str, minor: "" };
  };

  const expectedSharpsParsed = parseExpected(expectedSharps);
  const expectedFlatsParsed = parseExpected(expectedFlats);

  const sharpsMajorCorrect = normalize(currentState.sharpsMajorInput) === normalize(expectedSharpsParsed.major);
  const sharpsMinorCorrect = normalize(currentState.sharpsMinorInput) === normalize(expectedSharpsParsed.minor);
  const flatsMajorCorrect = normalize(currentState.flatsMajorInput) === normalize(expectedFlatsParsed.major);
  const flatsMinorCorrect = normalize(currentState.flatsMinorInput) === normalize(expectedFlatsParsed.minor);

  setTablePracticeAnswers((prev) => ({
    ...prev,
    [rowKey]: {
      ...currentState,
      evaluated: true,
      sharpsMajorCorrect,
      sharpsMinorCorrect,
      flatsMajorCorrect,
      flatsMinorCorrect,
    },
  }));
}

function renderMemorizationRow(
  rowKey: string,
  count: number,
  expectedSharps: string,
  expectedFlats: string,
  tablePracticeMode: boolean,
  tablePracticeAnswers: Record<string, any>,
  setTablePracticeAnswers: React.Dispatch<
    React.SetStateAction<Record<string, any>>
  >,
) {
  const state = getMemoPracticeState(tablePracticeAnswers, rowKey);

  const updateField = (
    field: "sharpsMajorInput" | "sharpsMinorInput" | "flatsMajorInput" | "flatsMinorInput",
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
            "& .MuiInput-underline:before": { borderBottomColor: "#4caf50 !important" },
            "& .MuiInputBase-input": { color: "#4caf50 !important", WebkitTextFillColor: "#4caf50 !important" },
          }
        : {
            "& .MuiInput-underline:before": { borderBottomColor: "#f44336 !important" },
            "& .MuiInputBase-input": { color: "#f44336 !important", WebkitTextFillColor: "#f44336 !important" },
          }
      : ({} as any);

  return (
    <TableRow key={rowKey}>
      {tablePracticeMode && (
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
        {tablePracticeMode && state.isActive ? (
          <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
            <TextField
              variant="standard"
              size="small"
              value={state.sharpsMajorInput}
              onChange={(e) => updateField("sharpsMajorInput", e.target.value)}
              inputProps={{ style: { textAlign: "center", width: "30px" } }}
              sx={getTextFieldColors(state.sharpsMajorCorrect)}
              error={state.evaluated && !state.sharpsMajorCorrect}
            />
            <Typography color="text.secondary">(</Typography>
            <TextField
              variant="standard"
              size="small"
              value={state.sharpsMinorInput}
              onChange={(e) => updateField("sharpsMinorInput", e.target.value)}
              inputProps={{ style: { textAlign: "center", width: "30px" } }}
              sx={getTextFieldColors(state.sharpsMinorCorrect)}
              error={state.evaluated && !state.sharpsMinorCorrect}
            />
            <Typography color="text.secondary">)</Typography>
          </Stack>
        ) : (
          expectedSharps
        )}
      </TableCell>
      <TableCell align="center">
        {tablePracticeMode && state.isActive ? (
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
            <Stack direction="row" alignItems="center" justifyContent="center" gap={0.5}>
              <TextField
                variant="standard"
                size="small"
                value={state.flatsMajorInput}
                onChange={(e) => updateField("flatsMajorInput", e.target.value)}
                inputProps={{ style: { textAlign: "center", width: "40px" } }}
                sx={getTextFieldColors(state.flatsMajorCorrect)}
                error={state.evaluated && !state.flatsMajorCorrect}
              />
              <Typography color="text.secondary">(</Typography>
              <TextField
                variant="standard"
                size="small"
                value={state.flatsMinorInput}
                onChange={(e) => updateField("flatsMinorInput", e.target.value)}
                inputProps={{ style: { textAlign: "center", width: "40px" } }}
                sx={getTextFieldColors(state.flatsMinorCorrect)}
                error={state.evaluated && !state.flatsMinorCorrect}
              />
              <Typography color="text.secondary">)</Typography>
            </Stack>
            <IconButton
              size="small"
              color={state.evaluated ? (state.sharpsMajorCorrect && state.sharpsMinorCorrect && state.flatsMajorCorrect && state.flatsMinorCorrect ? "success" : "error") : "primary"}
              onClick={() =>
                handleMemorizationRowGrade(
                  rowKey,
                  expectedSharps,
                  expectedFlats,
                  tablePracticeAnswers,
                  setTablePracticeAnswers,
                )
              }
            >
               {state.evaluated && state.sharpsMajorCorrect && state.sharpsMinorCorrect && state.flatsMajorCorrect && state.flatsMinorCorrect ? (
                <CheckCircleOutline fontSize="small" />
              ) : state.evaluated ? (
                <CancelOutlined fontSize="small" />
              ) : (
                <SendIcon fontSize="small" />
              )}
            </IconButton>
          </Stack>
        ) : (
          expectedFlats
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
              C (Do)
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
  const [isFlipped, setIsFlipped] = useState(false);
  // 'majorToMinor' = front shows major key, back shows minor+armadura
  // 'minorToMajor' = front shows minor+armadura, back shows major key
  type FlashcardMode =
    | "majorToMinor"
    | "minorToMajor"
    | "signatureToKeys"
    | "sixthDegreeToKey"
    | "notesToMinorKey";

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
  const [flashcardMode, setFlashcardMode] =
    useState<FlashcardMode>("majorToMinor");
  const flashcardFlipTimeoutRef = React.useRef<number | null>(null);

  const nextFlashcard = () => {
    setIsFlipped(false);
    if (flashcardFlipTimeoutRef.current)
      clearTimeout(flashcardFlipTimeoutRef.current);
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
      setCurrentFlashcard(SCALE_GUIDE[r]);
      setFlashcardMode(newMode);
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

    newAnswers["do-flat"] = { ...initRowState };
    newAnswers["do-sharp"] = { ...initRowState };
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
        const notesCorrect = state.notes.map(
          (n: string, i: number) =>
            n.trim().toLowerCase() === expectedNotes[i].toLowerCase(),
        );
        const normInput = state.relativeMinor
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const normExpected = expectedRelativeMinor
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const parts = normExpected.match(
          /^([a-z#b]+)\s+menor\s+\(([a-z#bm]+)\)$/,
        );
        let relativeMinorCorrect = false;
        if (parts) {
          relativeMinorCorrect =
            [parts[1], parts[2], `${parts[1]} m`, `${parts[1]} menor`].includes(
              normInput,
            ) ||
            (normExpected.includes(normInput) && normInput.length >= 2);
        } else {
          relativeMinorCorrect =
            normInput === normExpected || normExpected.includes(normInput);
        }
        next[rowKey] = {
          ...state,
          evaluated: true,
          notesCorrect,
          relativeMinorCorrect,
        };
        totalRows++;
        if (notesCorrect.every(Boolean) && relativeMinorCorrect) correctRows++;
      };

      gradeRow(
        "do-flat",
        ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
        "La menor (Am)",
      );
      FLAT_SUBTABLE.forEach((r) =>
        gradeRow(`flat-${r.tonality}`, r.majorScale, r.relativeMinor),
      );
      gradeRow(
        "do-sharp",
        ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
        "La menor (Am)",
      );
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
    };
  }, []);

  const selectedScale = useMemo(
    () =>
      SCALE_GUIDE.find((row) => row.major === selectedMajor) || SCALE_GUIDE[0],
    [selectedMajor],
  );

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
    setQuestion(createQuizQuestion(enabledQuizTypes));
    setSelectedOption("");
    setScaleInputs(Array(7).fill(""));
    setTextInput("");
    setIsEvaluated(false);
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

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
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
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                onClick={nextFlashcard}
                sx={{ bgcolor: "#00897b", textTransform: "none" }}
              >
                Siguiente Tarjeta
              </Button>
            </Stack>
          </Stack>

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

          <Box
            sx={{
              perspective: "1000px",
              width: "100%",
              maxWidth: "420px",
              height: "240px",
              mx: "auto",
              cursor: "pointer",
            }}
            onClick={() => setIsFlipped(!isFlipped)}
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
                  bgcolor:
                    flashcardMode === "majorToMinor" ||
                    flashcardMode === "signatureToKeys" ||
                    flashcardMode === "notesToMinorKey"
                      ? "#fff"
                      : "#e0f2f1",
                  borderRadius: 3,
                  border:
                    flashcardMode === "majorToMinor" ||
                    flashcardMode === "signatureToKeys" ||
                    flashcardMode === "notesToMinorKey"
                      ? "2px solid #b2dfdb"
                      : "2px solid #4db6ac",
                  gap: 1,
                }}
              >
                {flashcardMode === "majorToMinor" ? (
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
                      sx={{ fontWeight: 800, color: "#004d40" }}
                    >
                      {currentFlashcard.major}
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
                      sx={{ fontWeight: 800, color: "#00695c" }}
                    >
                      {currentFlashcard.relativeMinor}
                    </Typography>
                    <Chip
                      label={currentFlashcard.keySignature}
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
                      label={currentFlashcard.keySignature}
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
                      sx={{ fontWeight: 800, color: "#00695c" }}
                    >
                      {currentFlashcard.sixthDegree}
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
                      {currentFlashcard.minorNotes.map((note, idx) => (
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
                      ))}
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
                  bgcolor:
                    flashcardMode === "majorToMinor" ||
                    flashcardMode === "signatureToKeys" ||
                    flashcardMode === "notesToMinorKey"
                      ? "#e0f2f1"
                      : "#fff",
                  borderRadius: 3,
                  border:
                    flashcardMode === "majorToMinor" ||
                    flashcardMode === "signatureToKeys" ||
                    flashcardMode === "notesToMinorKey"
                      ? "2px solid #4db6ac"
                      : "2px solid #b2dfdb",
                  gap: 1,
                }}
              >
                {flashcardMode === "majorToMinor" ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#00695c" }}
                    >
                      {currentFlashcard.relativeMinor}
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
                      {currentFlashcard.major}
                    </Typography>
                  </>
                ) : flashcardMode === "signatureToKeys" ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#004d40" }}
                    >
                      {currentFlashcard.major}
                    </Typography>
                    <Divider sx={{ width: "60%", my: 0.5 }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#00695c" }}
                    >
                      {currentFlashcard.relativeMinor}
                    </Typography>
                  </>
                ) : flashcardMode === "sixthDegreeToKey" ? (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#004d40", mb: 1 }}
                    >
                      {currentFlashcard.major}
                    </Typography>
                    <Chip
                      label={`Relativo Menor: ${currentFlashcard.relativeMinor}`}
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
                      {currentFlashcard.relativeMinor}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.disabled"
                      sx={{ mt: 1 }}
                    >
                      ({currentFlashcard.major})
                    </Typography>
                  </>
                )}
              </Paper>
            </Box>
          </Box>
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
            <FormControlLabel
              control={
                <Switch
                  checked={tablePracticeMode}
                  onChange={(e) => setTablePracticeMode(e.target.checked)}
                  color="primary"
                />
              }
              label="Modo Práctica"
              sx={{ m: 0 }}
            />
          </Stack>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 400 }}>
              <TableHead sx={{ bgcolor: "rgba(0,0,0,0.04)" }}>
                <TableRow>
                  {tablePracticeMode && <TableCell width={40} />}
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
                    { count: 0, sharps: "C (Am)", flats: "C (Am)" },
                    { count: 1, sharps: "G (Em)", flats: "F (Dm)" },
                    { count: 2, sharps: "D (Bm)", flats: "Bb (Gm)" },
                    { count: 3, sharps: "A (F#m)", flats: "Eb (Cm)" },
                    { count: 4, sharps: "E (C#m)", flats: "Ab (Fm)" },
                    { count: 5, sharps: "B (G#m)", flats: "Db (Bbm)" },
                    { count: 6, sharps: "F# (D#m)", flats: "Gb (Ebm)" },
                    { count: 7, sharps: "C# (A#m)", flats: "Cb (Abm)" },
                  ] as const
                ).map((row, idx) =>
                  renderMemorizationRow(
                    `memo-${idx}`,
                    row.count,
                    row.sharps,
                    row.flats,
                    tablePracticeMode,
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
                    "do-flat",
                    "Do",
                    "C",
                    0,
                    ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
                    "La menor (Am)",
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
                    "do-sharp",
                    "Do",
                    "C",
                    0,
                    ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
                    "La menor (Am)",
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
              Nota: Do mayor tiene 0 alteraciones.
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
