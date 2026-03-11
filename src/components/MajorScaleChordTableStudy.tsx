import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
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
  ArrowBack,
  CheckCircleOutline,
  LightbulbOutlined,
  Refresh,
  Rule,
  School,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Accidental, Factory, Formatter, Stave, StaveNote, Voice } from "vexflow";

type HintLevel = "none" | "root" | "stack" | "quality" | "answer";
type ExtensionQuality = "major" | "minor" | "diminished" | "augmented";
type FlashcardMode =
  | "familyRootToNotes"
  | "familyNotesToQuality"
  | "familyRootToSymbol"
  | "diatonicDegreeToChord"
  | "diatonicChordToDegree"
  | "diatonicDegreeToNotes";
type FlashcardAnswerKind = "notes" | "choice";

type MajorKeyOption = {
  root: string;
  label: string;
};

type PracticeState = {
  notes: string;
  quality: string;
  symbol: string;
};

type PracticeCheck = {
  notes: boolean;
  quality: boolean;
  symbol: boolean;
  overall: boolean;
};

type NoteParts = {
  letter: string;
  accidental: "" | "#" | "##" | "b" | "bb";
};

type DiatonicDegreeRow = {
  degreeRoman: string;
  degreeNumber: number;
  rootNote: string;
  stackNotes: string[];
  quality: "Mayor" | "Menor" | "Disminuido";
  symbol: string;
};

type FamilyTriadRow = {
  root: string;
  notes: string[];
  qualityLabel: string;
  symbol: string;
};

type FlashcardCard = {
  id: string;
  mode: FlashcardMode;
  contextLabel: string;
  prompt: string;
  answerKind: FlashcardAnswerKind;
  answerNotes?: string[];
  answerChoice?: string;
  options?: string[];
  answerLines: string[];
  tipTitle: string;
  tipLines: string[];
};

type FlashcardCheckResult = {
  isCorrect: boolean;
  expected: string;
};

const STORAGE_KEY = "dictados-react-major-scale-chord-table-study";
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
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11] as const;
const NATURAL_ROOTS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const DIATONIC_ROMAN_NUMERALS = [
  "I",
  "ii",
  "iii",
  "IV",
  "V",
  "vi",
  "vii°",
] as const;
const DIATONIC_QUALITIES = [
  "Mayor",
  "Menor",
  "Menor",
  "Mayor",
  "Mayor",
  "Menor",
  "Disminuido",
] as const;
const HINT_LEVEL_ORDER: HintLevel[] = [
  "none",
  "root",
  "stack",
  "quality",
  "answer",
];
const ALL_FLASHCARD_MODES: FlashcardMode[] = [
  "familyRootToNotes",
  "familyNotesToQuality",
  "familyRootToSymbol",
  "diatonicDegreeToChord",
  "diatonicChordToDegree",
  "diatonicDegreeToNotes",
];
const FLASHCARD_MODE_LABELS: Record<FlashcardMode, string> = {
  familyRootToNotes: "Familia -> notas",
  familyNotesToQuality: "Notas -> calidad",
  familyRootToSymbol: "Raíz + familia -> símbolo",
  diatonicDegreeToChord: "Grado -> acorde",
  diatonicChordToDegree: "Acorde -> grado",
  diatonicDegreeToNotes: "Grado -> notas",
};
const FAMILY_FORMULAS: Record<ExtensionQuality, string> = {
  major: "1 - 3 - 5",
  minor: "1 - b3 - 5",
  diminished: "1 - b3 - b5",
  augmented: "1 - 3 - #5",
};
const FAMILY_LABELS: Record<ExtensionQuality, string> = {
  major: "Mayor",
  minor: "Menor",
  diminished: "Disminuida",
  augmented: "Aumentada",
};
const MAJOR_KEY_OPTIONS: MajorKeyOption[] = [
  { root: "C", label: "C major" },
  { root: "G", label: "G major" },
  { root: "D", label: "D major" },
  { root: "A", label: "A major" },
  { root: "E", label: "E major" },
  { root: "B", label: "B major" },
  { root: "F", label: "F major" },
  { root: "Bb", label: "Bb major" },
  { root: "Eb", label: "Eb major" },
  { root: "Ab", label: "Ab major" },
  { root: "Db", label: "Db major" },
  { root: "Gb", label: "Gb major" },
];

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

function spelledNoteForDegree(root: string, degreeIndex: number, semitones: number) {
  const rootParts = parseNoteParts(root);
  const rootLetterIndex = LETTERS.indexOf(rootParts.letter as (typeof LETTERS)[number]);
  const rootPitchClass = mod12(
    NATURAL_PC[rootParts.letter] + accidentalToShift(rootParts.accidental),
  );
  const targetLetter =
    LETTERS[(rootLetterIndex + degreeIndex) % LETTERS.length];
  const targetPitchClass = mod12(rootPitchClass + semitones);
  let shift = 0;

  for (let candidate = -2; candidate <= 2; candidate += 1) {
    if (mod12(NATURAL_PC[targetLetter] + candidate) === targetPitchClass) {
      shift = candidate;
      break;
    }
  }

  return `${targetLetter}${shiftToAccidental(shift)}`;
}

function formatNote(note: string) {
  return note;
}

function normalizeNoteToken(note: string) {
  return (note || "")
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
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

function normalizeText(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeAmericanNote(note: string) {
  const cleaned = (note || "")
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .trim();
  const match = cleaned.match(/^([a-gA-G])(bb|##|b|#)?$/);
  if (!match) return null;
  return `${match[1].toUpperCase()}${match[2] || ""}`;
}

function parseAmericanNotes(value: string) {
  return (value || "")
    .split(/[,\s/|-]+/)
    .map((item) => normalizeAmericanNote(item))
    .filter(Boolean) as string[];
}

function noteMidi(name: string, octave: number) {
  const parts = parseNoteParts(name);
  return (
    (octave + 1) * 12 +
    NATURAL_PC[parts.letter] +
    accidentalToShift(parts.accidental)
  );
}

function buildTrebleKeys(notes: string[]) {
  let previousMidi = -Infinity;
  let octave = 4;

  return notes.map((name) => {
    const parts = parseNoteParts(name);
    let midi = noteMidi(name, octave);

    while (midi <= previousMidi) {
      octave += 1;
      midi = noteMidi(name, octave);
    }

    previousMidi = midi;

    return {
      key: `${parts.letter.toLowerCase()}/${octave}`,
      accidental: parts.accidental,
    };
  });
}

function buildMajorScale(root: string) {
  return MAJOR_SCALE_INTERVALS.map((interval, index) =>
    spelledNoteForDegree(root, index, interval),
  );
}

function triadSymbol(root: string, quality: DiatonicDegreeRow["quality"] | ExtensionQuality) {
  if (quality === "Mayor") return root;
  if (quality === "Menor") return `${root}m`;
  if (quality === "Disminuido") return `${root}°`;
  if (quality === "major") return root;
  if (quality === "minor") return `${root}m`;
  if (quality === "diminished") return `${root}°`;
  return `${root}+`;
}

function buildDiatonicRows(root: string): DiatonicDegreeRow[] {
  const scale = buildMajorScale(root);
  return scale.map((note, index) => {
    const stackNotes = [
      scale[index],
      scale[(index + 2) % scale.length],
      scale[(index + 4) % scale.length],
    ];
    const quality = DIATONIC_QUALITIES[index];

    return {
      degreeRoman: DIATONIC_ROMAN_NUMERALS[index],
      degreeNumber: index + 1,
      rootNote: note,
      stackNotes,
      quality,
      symbol: triadSymbol(note, quality),
    };
  });
}

function buildFamilyTriads(quality: ExtensionQuality): FamilyTriadRow[] {
  const semitoneFormulas: Record<ExtensionQuality, [number, number, number]> = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
  };
  const labels: Record<ExtensionQuality, string> = {
    major: "Mayor",
    minor: "Menor",
    diminished: "Disminuida",
    augmented: "Aumentada",
  };

  return NATURAL_ROOTS.map((root) => {
    const notes = semitoneFormulas[quality].map((interval, index) =>
      spelledNoteForDegree(root, index * 2, interval),
    );
    return {
      root,
      notes,
      qualityLabel: labels[quality],
      symbol: triadSymbol(root, quality),
    };
  });
}

function defaultPracticeState(): PracticeState {
  return { notes: "", quality: "", symbol: "" };
}

function nextHintLevel(level: HintLevel): HintLevel {
  const currentIndex = HINT_LEVEL_ORDER.indexOf(level);
  return HINT_LEVEL_ORDER[Math.min(currentIndex + 1, HINT_LEVEL_ORDER.length - 1)];
}

function checkNotesAnswer(input: string, expected: string[]) {
  const normalizedInput = normalizeNotesInput(input);
  const normalizedExpected = expected.map(normalizeNoteToken);
  if (normalizedInput.length !== normalizedExpected.length) return false;
  return normalizedInput.every((note, index) => note === normalizedExpected[index]);
}

function hintTextForRow(row: DiatonicDegreeRow, level: HintLevel) {
  if (level === "none") return "Sin pista todavía.";
  if (level === "root") {
    return `Nota base: ${formatNote(row.rootNote)}.`;
  }
  if (level === "stack") {
    return `Salta una letra desde ${row.rootNote}: ${row.stackNotes.join(" - ")}.`;
  }
  if (level === "quality") {
    return `Calidad esperada: ${row.quality}. Símbolo base: ${row.symbol}.`;
  }
  return `Respuesta completa: ${row.stackNotes.join(" - ")} · ${row.quality} · ${row.symbol}.`;
}

function shuffleArray<T>(items: T[]) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function buildChoiceOptions(correct: string, pool: string[], size = 4) {
  const distractors = shuffleArray(
    Array.from(new Set(pool.filter((item) => item !== correct))),
  ).slice(0, Math.max(0, size - 1));
  return shuffleArray([correct, ...distractors]);
}

function expectedNotesText(notes: string[]) {
  return notes.join(" - ");
}

function checkChoiceAnswer(input: string, expected: string) {
  return normalizeText(input) === normalizeText(expected);
}

function buildFlashcard(
  diatonicRows: DiatonicDegreeRow[],
  scaleNotes: string[],
  familyRows: FamilyTriadRow[],
  selectedKey: string,
  extensionQuality: ExtensionQuality,
  modes: FlashcardMode[],
): FlashcardCard {
  const enabledModes = modes.length ? modes : ALL_FLASHCARD_MODES;
  const mode = pickRandom(enabledModes);
  const familyRow = pickRandom(familyRows);
  const diatonicRow = pickRandom(diatonicRows);
  const qualityPattern = DIATONIC_ROMAN_NUMERALS.map(
    (degree, index) => `${degree} ${DIATONIC_QUALITIES[index]}`,
  ).join(" · ");

  if (mode === "familyRootToNotes") {
    return {
      id: `${mode}-${extensionQuality}-${familyRow.root}`,
      mode,
      contextLabel: `Familia ${FAMILY_LABELS[extensionQuality]}`,
      prompt: `Escribe las notas de ${familyRow.symbol}.`,
      answerKind: "notes",
      answerNotes: familyRow.notes,
      answerLines: [
        `${familyRow.symbol} = ${expectedNotesText(familyRow.notes)}`,
        `Calidad: ${familyRow.qualityLabel}.`,
      ],
      tipTitle: "Tip de familia",
      tipLines: [
        `La fórmula activa es ${FAMILY_FORMULAS[extensionQuality]}.`,
        `Parte desde ${familyRow.root} y apila terceras.`,
        `Símbolo esperado: ${familyRow.symbol}.`,
      ],
    };
  }

  if (mode === "familyNotesToQuality") {
    return {
      id: `${mode}-${extensionQuality}-${familyRow.root}`,
      mode,
      contextLabel: `Familia ${FAMILY_LABELS[extensionQuality]}`,
      prompt: `¿Qué calidad tiene ${expectedNotesText(familyRow.notes)}?`,
      answerKind: "choice",
      answerChoice: familyRow.qualityLabel,
      options: buildChoiceOptions(familyRow.qualityLabel, Object.values(FAMILY_LABELS)),
      answerLines: [
        `${expectedNotesText(familyRow.notes)} = ${familyRow.qualityLabel}.`,
        `Símbolo: ${familyRow.symbol}.`,
      ],
      tipTitle: "Tip de fórmula",
      tipLines: [
        "Mayor = 1-3-5.",
        "Menor = 1-b3-5.",
        "Aumentada = 1-3-#5.",
        "Disminuida = 1-b3-b5.",
      ],
    };
  }

  if (mode === "familyRootToSymbol") {
    const symbolPool = [
      triadSymbol(familyRow.root, "major"),
      triadSymbol(familyRow.root, "minor"),
      triadSymbol(familyRow.root, "augmented"),
      triadSymbol(familyRow.root, "diminished"),
    ];

    return {
      id: `${mode}-${extensionQuality}-${familyRow.root}`,
      mode,
      contextLabel: `Familia ${FAMILY_LABELS[extensionQuality]}`,
      prompt: `¿Cuál es el símbolo correcto para la tríada ${familyRow.qualityLabel.toLowerCase()} de ${familyRow.root}?`,
      answerKind: "choice",
      answerChoice: familyRow.symbol,
      options: buildChoiceOptions(familyRow.symbol, symbolPool),
      answerLines: [
        `La respuesta correcta es ${familyRow.symbol}.`,
        `Notas: ${expectedNotesText(familyRow.notes)}.`,
      ],
      tipTitle: "Tip de símbolo",
      tipLines: [
        "Mayor no lleva sufijo.",
        "Menor usa m.",
        "Aumentada usa +.",
        "Disminuida usa °.",
      ],
    };
  }

  if (mode === "diatonicDegreeToChord") {
    return {
      id: `${mode}-${selectedKey}-${diatonicRow.degreeRoman}`,
      mode,
      contextLabel: `${selectedKey} major`,
      prompt: `En ${selectedKey} major, ¿qué acorde corresponde a ${diatonicRow.degreeRoman}?`,
      answerKind: "choice",
      answerChoice: diatonicRow.symbol,
      options: buildChoiceOptions(
        diatonicRow.symbol,
        diatonicRows.map((row) => row.symbol),
      ),
      answerLines: [
        `${diatonicRow.degreeRoman} = ${diatonicRow.symbol}.`,
        `Notas: ${expectedNotesText(diatonicRow.stackNotes)}.`,
      ],
      tipTitle: "Tip diatónico",
      tipLines: [
        `Patrón fijo del modo mayor: ${qualityPattern}.`,
        `Escala actual: ${scaleNotes.join(" - ")}.`,
      ],
    };
  }

  if (mode === "diatonicChordToDegree") {
    return {
      id: `${mode}-${selectedKey}-${diatonicRow.degreeRoman}`,
      mode,
      contextLabel: `${selectedKey} major`,
      prompt: `En ${selectedKey} major, ${diatonicRow.symbol} es qué grado?`,
      answerKind: "choice",
      answerChoice: diatonicRow.degreeRoman,
      options: buildChoiceOptions(
        diatonicRow.degreeRoman,
        DIATONIC_ROMAN_NUMERALS as unknown as string[],
        5,
      ),
      answerLines: [
        `${diatonicRow.symbol} es ${diatonicRow.degreeRoman}.`,
        `Notas: ${expectedNotesText(diatonicRow.stackNotes)}.`,
      ],
      tipTitle: "Tip diatónico",
      tipLines: [
        `Empieza por la escala: ${scaleNotes.join(" - ")}.`,
        `Luego aplica el patrón ${qualityPattern}.`,
      ],
    };
  }

  return {
    id: `${mode}-${selectedKey}-${diatonicRow.degreeRoman}`,
    mode,
    contextLabel: `${selectedKey} major`,
    prompt: `En ${selectedKey} major, escribe las notas de ${diatonicRow.degreeRoman}.`,
    answerKind: "notes",
    answerNotes: diatonicRow.stackNotes,
    answerLines: [
      `${diatonicRow.degreeRoman} = ${expectedNotesText(diatonicRow.stackNotes)}.`,
      `Símbolo: ${diatonicRow.symbol}.`,
    ],
    tipTitle: "Tip de 1-3-5",
    tipLines: [
      `Nota base: ${diatonicRow.rootNote}.`,
      "Apila terceras diatónicas: 1-3-5.",
      `Patrón del modo mayor: ${qualityPattern}.`,
    ],
  };
}

function TrebleChordPreview({ notes }: { notes: string[] }) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const holderId = useRef(
    `major-scale-staff-${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => {
    if (!holderRef.current) return;

    holderRef.current.innerHTML = "";
    if (notes.length === 0) return;

    const renderedNotes = buildTrebleKeys(notes);
    const width = 210;
    const height = 110;
    const vf = new Factory({
      renderer: {
        elementId: holderId.current,
        width,
        height,
      },
    });
    const context = vf.getContext();
    const stave = new Stave(10, 15, width - 20);
    stave.addClef("treble").setContext(context).draw();

    const chord = new StaveNote({
      clef: "treble",
      keys: renderedNotes.map((item) => item.key),
      duration: "w",
    });

    renderedNotes.forEach((item, index) => {
      if (item.accidental) {
        chord.addModifier(new Accidental(item.accidental), index);
      }
    });

    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables([chord]);
    new Formatter().joinVoices([voice]).format([voice], width - 70);
    voice.draw(context, stave);
  }, [notes]);

  return (
    <Box>
      <Box
        ref={holderRef}
        id={holderId.current}
        sx={{ width: 210, minHeight: 90 }}
      />
    </Box>
  );
}

export default function MajorScaleChordTableStudy() {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("C");
  const [practiceMode, setPracticeMode] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [validateLabels, setValidateLabels] = useState(false);
  const [extensionQuality, setExtensionQuality] =
    useState<ExtensionQuality>("major");
  const [answersByKey, setAnswersByKey] = useState<
    Record<string, Record<string, PracticeState>>
  >({});
  const [hintLevelsByKey, setHintLevelsByKey] = useState<
    Record<string, Record<string, HintLevel>>
  >({});
  const [resultsByKey, setResultsByKey] = useState<
    Record<string, Record<string, PracticeCheck | null>>
  >({});
  const [familyAnswersByQuality, setFamilyAnswersByQuality] = useState<
    Record<string, Record<string, PracticeState>>
  >({});
  const [familyResultsByQuality, setFamilyResultsByQuality] = useState<
    Record<string, Record<string, PracticeCheck | null>>
  >({});
  const [activeFlashcardModes, setActiveFlashcardModes] =
    useState<FlashcardMode[]>(ALL_FLASHCARD_MODES);
  const [flashcard, setFlashcard] = useState<FlashcardCard>(() =>
    buildFlashcard(
      buildDiatonicRows("C"),
      buildMajorScale("C"),
      buildFamilyTriads("major"),
      "C",
      "major",
      ALL_FLASHCARD_MODES,
    ),
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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.selectedKey === "string") {
        setSelectedKey(saved.selectedKey);
      }
      if (typeof saved.practiceMode === "boolean") {
        setPracticeMode(saved.practiceMode);
      }
      if (typeof saved.showHints === "boolean") {
        setShowHints(saved.showHints);
      }
      if (typeof saved.validateLabels === "boolean") {
        setValidateLabels(saved.validateLabels);
      }
      if (typeof saved.showFlashcardTips === "boolean") {
        setShowFlashcardTips(saved.showFlashcardTips);
      }
      if (saved.answersByKey && typeof saved.answersByKey === "object") {
        setAnswersByKey(saved.answersByKey);
      }
      if (
        saved.familyAnswersByQuality &&
        typeof saved.familyAnswersByQuality === "object"
      ) {
        setFamilyAnswersByQuality(saved.familyAnswersByQuality);
      }
      if (saved.hintLevelsByKey && typeof saved.hintLevelsByKey === "object") {
        setHintLevelsByKey(saved.hintLevelsByKey);
      }
      if (Array.isArray(saved.activeFlashcardModes)) {
        const validModes = saved.activeFlashcardModes.filter((mode: string) =>
          ALL_FLASHCARD_MODES.includes(mode as FlashcardMode),
        );
        if (validModes.length > 0) {
          setActiveFlashcardModes(validModes as FlashcardMode[]);
        }
      }
    } catch (error) {
      console.error("No se pudo cargar la práctica de armonización mayor", error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedKey,
        practiceMode,
        showHints,
        validateLabels,
        showFlashcardTips,
        answersByKey,
        familyAnswersByQuality,
        hintLevelsByKey,
        activeFlashcardModes,
      }),
    );
  }, [
    activeFlashcardModes,
    answersByKey,
    familyAnswersByQuality,
    hintLevelsByKey,
    practiceMode,
    selectedKey,
    showFlashcardTips,
    showHints,
    validateLabels,
  ]);

  const rows = useMemo(() => buildDiatonicRows(selectedKey), [selectedKey]);
  const scaleNotes = useMemo(() => buildMajorScale(selectedKey), [selectedKey]);
  const extensionRows = useMemo(
    () => buildFamilyTriads(extensionQuality),
    [extensionQuality],
  );

  function currentAnswer(rowKey: string) {
    return answersByKey[selectedKey]?.[rowKey] || defaultPracticeState();
  }

  function currentHintLevel(rowKey: string) {
    return hintLevelsByKey[selectedKey]?.[rowKey] || "none";
  }

  function currentResult(rowKey: string) {
    return resultsByKey[selectedKey]?.[rowKey] || null;
  }

  function currentFamilyAnswer(rowKey: string) {
    return familyAnswersByQuality[extensionQuality]?.[rowKey] || defaultPracticeState();
  }

  function currentFamilyResult(rowKey: string) {
    return familyResultsByQuality[extensionQuality]?.[rowKey] || null;
  }

  function updateRowAnswer(
    rowKey: string,
    field: keyof PracticeState,
    value: string,
  ) {
    setAnswersByKey((prev) => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] || {}),
        [rowKey]: {
          ...currentAnswer(rowKey),
          [field]: value,
        },
      },
    }));
    setResultsByKey((prev) => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] || {}),
        [rowKey]: null,
      },
    }));
  }

  function revealNextHint(rowKey: string) {
    setHintLevelsByKey((prev) => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] || {}),
        [rowKey]: nextHintLevel(currentHintLevel(rowKey)),
      },
    }));
  }

  function updateFamilyAnswer(
    rowKey: string,
    field: keyof PracticeState,
    value: string,
  ) {
    setFamilyAnswersByQuality((prev) => ({
      ...prev,
      [extensionQuality]: {
        ...(prev[extensionQuality] || {}),
        [rowKey]: {
          ...currentFamilyAnswer(rowKey),
          [field]: value,
        },
      },
    }));
    setFamilyResultsByQuality((prev) => ({
      ...prev,
      [extensionQuality]: {
        ...(prev[extensionQuality] || {}),
        [rowKey]: null,
      },
    }));
  }

  function checkRow(row: DiatonicDegreeRow) {
    const rowKey = row.degreeRoman;
    const answer = currentAnswer(rowKey);
    const noteCheck = checkNotesAnswer(answer.notes, row.stackNotes);
    const qualityCheck = normalizeText(answer.quality) === normalizeText(row.quality);
    const symbolCheck = normalizeText(answer.symbol) === normalizeText(row.symbol);
    const finalCheck = {
      notes: noteCheck,
      quality: qualityCheck,
      symbol: symbolCheck,
      overall: validateLabels
        ? noteCheck && qualityCheck && symbolCheck
        : noteCheck,
    };

    setResultsByKey((prev) => ({
      ...prev,
      [selectedKey]: {
        ...(prev[selectedKey] || {}),
        [rowKey]: finalCheck,
      },
    }));
  }

  function checkAllRows() {
    rows.forEach((row) => checkRow(row));
  }

  function checkFamilyRow(row: FamilyTriadRow) {
    const rowKey = row.root;
    const answer = currentFamilyAnswer(rowKey);
    const noteCheck = checkNotesAnswer(answer.notes, row.notes);
    const qualityCheck =
      normalizeText(answer.quality) === normalizeText(row.qualityLabel);
    const symbolCheck = normalizeText(answer.symbol) === normalizeText(row.symbol);
    const finalCheck = {
      notes: noteCheck,
      quality: qualityCheck,
      symbol: symbolCheck,
      overall: validateLabels
        ? noteCheck && qualityCheck && symbolCheck
        : noteCheck,
    };

    setFamilyResultsByQuality((prev) => ({
      ...prev,
      [extensionQuality]: {
        ...(prev[extensionQuality] || {}),
        [rowKey]: finalCheck,
      },
    }));
  }

  function checkAllFamilyRows() {
    extensionRows.forEach((row) => checkFamilyRow(row));
  }

  function clearCurrentKeyPractice() {
    setAnswersByKey((prev) => ({
      ...prev,
      [selectedKey]: {},
    }));
    setHintLevelsByKey((prev) => ({
      ...prev,
      [selectedKey]: {},
    }));
    setResultsByKey((prev) => ({
      ...prev,
      [selectedKey]: {},
    }));
  }

  function clearCurrentFamilyPractice() {
    setFamilyAnswersByQuality((prev) => ({
      ...prev,
      [extensionQuality]: {},
    }));
    setFamilyResultsByQuality((prev) => ({
      ...prev,
      [extensionQuality]: {},
    }));
  }

  const resolvedCount = rows.filter(
    (row) => currentResult(row.degreeRoman)?.overall,
  ).length;
  const resolvedFamilyCount = extensionRows.filter(
    (row) => currentFamilyResult(row.root)?.overall,
  ).length;

  useEffect(() => {
    clearFlashcardAttempt();
    setFlashcard(
      buildFlashcard(
        rows,
        scaleNotes,
        extensionRows,
        selectedKey,
        extensionQuality,
        activeFlashcardModes,
      ),
    );
  }, [activeFlashcardModes, extensionQuality, rows, scaleNotes, selectedKey, extensionRows]);

  function clearFlashcardAttempt() {
    setFlashcardInput("");
    setFlashcardChoice("");
    setFlashcardResult(null);
    setFlashcardRevealed(false);
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

  function nextFlashcard() {
    clearFlashcardAttempt();
    setFlashcard((previous) => {
      if (flashcardReviewQueue.length > 0) {
        const [first, ...rest] = flashcardReviewQueue;
        setFlashcardReviewQueue(rest);
        return first;
      }

      let nextCard = buildFlashcard(
        rows,
        scaleNotes,
        extensionRows,
        selectedKey,
        extensionQuality,
        activeFlashcardModes,
      );
      if (previous.id === nextCard.id) {
        nextCard = buildFlashcard(
          rows,
          scaleNotes,
          extensionRows,
          selectedKey,
          extensionQuality,
          activeFlashcardModes,
        );
      }
      return nextCard;
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
            Armoniza la Escala Mayor Paso a Paso
          </Typography>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Rule color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Cómo hacerlo a mano
              </Typography>
            </Box>
            <Typography variant="body2">
              1. Escribe las 7 notas de la escala mayor. 2. Desde cada grado,
              apila terceras: 1-3-5. 3. Observa la calidad del acorde. 4.
              Memoriza el patrón fijo del modo mayor: Mayor, menor, menor,
              Mayor, Mayor, menor, disminuido.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {DIATONIC_QUALITIES.map((quality, index) => (
                <Chip
                  key={`${quality}-${index}`}
                  label={`${DIATONIC_ROMAN_NUMERALS[index]} = ${quality}`}
                  variant="outlined"
                />
              ))}
            </Stack>
            <Alert severity="info">
              Si estás en C major, la tabla esperada es: C, Dm, Em, F, G, Am,
              B°.
            </Alert>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tabla guiada principal: 7 acordes por familia
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="extension-quality-label">Familia</InputLabel>
                  <Select
                    labelId="extension-quality-label"
                    label="Familia"
                    value={extensionQuality}
                    onChange={(event) =>
                      setExtensionQuality(event.target.value as ExtensionQuality)
                    }
                  >
                    <MenuItem value="major">7 mayores</MenuItem>
                    <MenuItem value="minor">7 menores</MenuItem>
                    <MenuItem value="augmented">7 aumentadas</MenuItem>
                    <MenuItem value="diminished">7 disminuidas</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, height: "100%", backgroundColor: "#fafcff" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Orden sugerido
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Primero 7 mayores, luego 7 menores, luego 7 aumentadas y al
                    final 7 disminuidas.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, height: "100%", backgroundColor: "#fafcff" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Fórmula activa
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {extensionRows.map((row) => (
                      <Chip
                        key={`${extensionQuality}-${row.root}`}
                        label={row.symbol}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            <Alert severity="info">
              Aquí no estás armonizando una tonalidad. Aquí construyes una misma
              familia de tríadas sobre `C D E F G A B`.
            </Alert>

            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 1.5,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={
                    <Switch
                      checked={practiceMode}
                      onChange={(event) => setPracticeMode(event.target.checked)}
                    />
                  }
                  label="Modo práctica"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={validateLabels}
                      onChange={(event) => setValidateLabels(event.target.checked)}
                    />
                  }
                  label="Validar calidad y símbolo"
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`Correctas: ${resolvedFamilyCount}/7`}
                  color={resolvedFamilyCount === 7 ? "success" : "default"}
                  variant="outlined"
                />
                {practiceMode ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={clearCurrentFamilyPractice}
                    >
                      Limpiar familia
                    </Button>
                    <Button variant="contained" onClick={checkAllFamilyRows}>
                      Revisar familia
                    </Button>
                  </>
                ) : null}
              </Stack>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Raíz</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell>Clave de Sol</TableCell>
                  <TableCell>Calidad</TableCell>
                  <TableCell>Símbolo</TableCell>
                  <TableCell>Revisión</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extensionRows.map((row) => {
                  const rowKey = row.root;
                  const answer = currentFamilyAnswer(rowKey);
                  const result = currentFamilyResult(rowKey);
                  const displayNotes = practiceMode
                    ? parseAmericanNotes(answer.notes)
                    : row.notes;

                  return (
                    <TableRow key={`${extensionQuality}-${row.root}`}>
                      <TableCell sx={{ fontWeight: 700 }}>{row.root}</TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Ej. C E G"
                            value={answer.notes}
                            onChange={(event) =>
                              updateFamilyAnswer(rowKey, "notes", event.target.value)
                            }
                          />
                        ) : (
                          row.notes.join(" - ")
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 230 }}>
                        {displayNotes.length > 0 ? (
                          <TrebleChordPreview notes={displayNotes} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Escribe notas para ver el diagrama
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 170 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            disabled={!validateLabels}
                            placeholder={row.qualityLabel}
                            value={answer.quality}
                            onChange={(event) =>
                              updateFamilyAnswer(rowKey, "quality", event.target.value)
                            }
                          />
                        ) : (
                          row.qualityLabel
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            disabled={!validateLabels}
                            placeholder={row.symbol}
                            value={answer.symbol}
                            onChange={(event) =>
                              updateFamilyAnswer(rowKey, "symbol", event.target.value)
                            }
                          />
                        ) : (
                          row.symbol
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        {practiceMode ? (
                          <Stack spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => checkFamilyRow(row)}
                            >
                              Revisar fila
                            </Button>
                            {result ? (
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                  size="small"
                                  label={result.notes ? "Notas OK" : "Notas pendientes"}
                                  color={result.notes ? "success" : "warning"}
                                  variant={result.notes ? "filled" : "outlined"}
                                />
                                {validateLabels ? (
                                  <>
                                    <Chip
                                      size="small"
                                      label={result.quality ? "Calidad OK" : "Calidad pendiente"}
                                      color={result.quality ? "success" : "warning"}
                                      variant={result.quality ? "filled" : "outlined"}
                                    />
                                    <Chip
                                      size="small"
                                      label={result.symbol ? "Símbolo OK" : "Símbolo pendiente"}
                                      color={result.symbol ? "success" : "warning"}
                                      variant={result.symbol ? "filled" : "outlined"}
                                    />
                                  </>
                                ) : null}
                              </Stack>
                            ) : null}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Tabla resuelta
                          </Typography>
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
                  Mezcla tarjetas de familias y de acordes diatónicos para estudiar
                  spelling, calidad, símbolo y grado.
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
                <Chip label={`Vistas: ${flashcardStats.seen}`} variant="outlined" />
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
                      onChange={(event) =>
                        toggleFlashcardMode(mode, event.target.checked)
                      }
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
                    <Chip
                      label={flashcard.contextLabel}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {flashcard.prompt}
                    </Typography>
                  </Box>
                  <Button variant="outlined" startIcon={<Refresh />} onClick={nextFlashcard}>
                    Otra
                  </Button>
                </Stack>

                {flashcard.answerKind === "notes" ? (
                  <TextField
                    label="Tu respuesta"
                    placeholder="Ej. C E G"
                    fullWidth
                    value={flashcardInput}
                    onChange={(event) => setFlashcardInput(event.target.value)}
                  />
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(flashcard.options || []).map((option) => (
                      <Chip
                        key={`${flashcard.id}-${option}`}
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
                    <Stack spacing={0.75}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {flashcard.tipTitle}
                      </Typography>
                      {flashcard.tipLines.map((line) => (
                        <Typography key={`${flashcard.id}-${line}`} variant="body2">
                          {line}
                        </Typography>
                      ))}
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
                        <CheckCircleOutline
                          color={flashcardResult?.isCorrect ? "success" : "warning"}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {flashcardResult?.isCorrect ? "Correcto" : "Respuesta mostrada"}
                        </Typography>
                      </Box>
                      {flashcard.answerLines.map((line) => (
                        <Typography key={`${flashcard.id}-answer-${line}`} variant="body2">
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Referencia extra: acordes diatónicos por tonalidad
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="major-key-label">Tonalidad</InputLabel>
                  <Select
                    labelId="major-key-label"
                    label="Tonalidad"
                    value={selectedKey}
                    onChange={(event) => setSelectedKey(event.target.value)}
                  >
                    {MAJOR_KEY_OPTIONS.map((option) => (
                      <MenuItem key={option.root} value={option.root}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, height: "100%", backgroundColor: "#fafcff" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Notas de la escala actual
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {scaleNotes.map((note, index) => (
                      <Chip
                        key={`${note}-${index}`}
                        label={`${index + 1}. ${formatNote(note)}`}
                        color={index === 0 ? "primary" : "default"}
                        variant={index === 0 ? "filled" : "outlined"}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: 1.5,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <FormControlLabel
                  control={
                    <Switch
                      checked={practiceMode}
                      onChange={(event) => setPracticeMode(event.target.checked)}
                    />
                  }
                  label="Modo práctica"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showHints}
                      onChange={(event) => setShowHints(event.target.checked)}
                    />
                  }
                  label="Mostrar pistas"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={validateLabels}
                      onChange={(event) => setValidateLabels(event.target.checked)}
                    />
                  }
                  label="Validar calidad y símbolo"
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`Correctas: ${resolvedCount}/7`}
                  color={resolvedCount === 7 ? "success" : "default"}
                  variant="outlined"
                />
                {practiceMode ? (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={clearCurrentKeyPractice}
                    >
                      Limpiar tonalidad
                    </Button>
                    <Button variant="contained" onClick={checkAllRows}>
                      Revisar toda la tabla
                    </Button>
                  </>
                ) : null}
              </Stack>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Grado</TableCell>
                  <TableCell>Nota base</TableCell>
                  <TableCell>1-3-5</TableCell>
                  <TableCell>Notas del acorde</TableCell>
                  <TableCell>Clave de Sol</TableCell>
                  <TableCell>Calidad</TableCell>
                  <TableCell>Símbolo</TableCell>
                  <TableCell>Pistas / revisión</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const rowKey = row.degreeRoman;
                  const answer = currentAnswer(rowKey);
                  const result = currentResult(rowKey);
                  const hintLevel = currentHintLevel(rowKey);
                  const displayNotes = practiceMode
                    ? parseAmericanNotes(answer.notes)
                    : row.stackNotes;

                  return (
                    <TableRow key={rowKey}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {row.degreeRoman}
                      </TableCell>
                      <TableCell>{formatNote(row.rootNote)}</TableCell>
                      <TableCell>
                        {!practiceMode
                          ? row.stackNotes.map(formatNote).join(" - ")
                          : showHints &&
                              (hintLevel === "stack" ||
                                hintLevel === "quality" ||
                                hintLevel === "answer")
                          ? row.stackNotes.map(formatNote).join(" - ")
                          : "Salta una letra"}
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Ej. C E G"
                            value={answer.notes}
                            onChange={(event) =>
                              updateRowAnswer(rowKey, "notes", event.target.value)
                            }
                          />
                        ) : (
                          row.stackNotes.join(" - ")
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 230 }}>
                        {displayNotes.length > 0 ? (
                          <TrebleChordPreview notes={displayNotes} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Escribe notas para ver el diagrama
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 170 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            disabled={!validateLabels}
                            placeholder="Mayor / Menor / Disminuido"
                            value={answer.quality}
                            onChange={(event) =>
                              updateRowAnswer(rowKey, "quality", event.target.value)
                            }
                          />
                        ) : (
                          row.quality
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            disabled={!validateLabels}
                            placeholder="Ej. Dm"
                            value={answer.symbol}
                            onChange={(event) =>
                              updateRowAnswer(rowKey, "symbol", event.target.value)
                            }
                          />
                        ) : (
                          row.symbol
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 280 }}>
                        {practiceMode ? (
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {showHints ? (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<LightbulbOutlined />}
                                  onClick={() => revealNextHint(rowKey)}
                                >
                                  Siguiente pista
                                </Button>
                              ) : null}
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => checkRow(row)}
                              >
                                Revisar fila
                              </Button>
                            </Stack>

                            {showHints ? (
                              <Typography variant="caption" color="text.secondary">
                                {hintTextForRow(row, hintLevel)}
                              </Typography>
                            ) : null}

                            {result ? (
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                  size="small"
                                  label={result.notes ? "Notas OK" : "Notas pendientes"}
                                  color={result.notes ? "success" : "warning"}
                                  variant={result.notes ? "filled" : "outlined"}
                                />
                                {validateLabels ? (
                                  <>
                                    <Chip
                                      size="small"
                                      label={result.quality ? "Calidad OK" : "Calidad pendiente"}
                                      color={result.quality ? "success" : "warning"}
                                      variant={result.quality ? "filled" : "outlined"}
                                    />
                                    <Chip
                                      size="small"
                                      label={result.symbol ? "Símbolo OK" : "Símbolo pendiente"}
                                      color={result.symbol ? "success" : "warning"}
                                      variant={result.symbol ? "filled" : "outlined"}
                                    />
                                  </>
                                ) : null}
                                <Chip
                                  size="small"
                                  label={result.overall ? "Fila correcta" : "Revisa esta fila"}
                                  color={result.overall ? "success" : "warning"}
                                />
                              </Stack>
                            ) : null}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Tabla resuelta
                          </Typography>
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
          <Stack spacing={1.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Pistas opcionales
            </Typography>
            <Typography variant="body2">
              Usa primero la tabla de familias para construir los 28 acordes. La
              tabla por tonalidad queda como apoyo aparte para entender por qué en
              `C major` solo aparecen mayores, menores y un disminuido.
            </Typography>
            <Alert severity="info">
              Regla rápida: la tarea de familias no depende de una tonalidad fija.
              La tarea por tonalidad saca los acordes diatónicos de una escala
              concreta.
            </Alert>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
