import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
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

type ScaleMode = "major" | "naturalMinor";
type HintLevel = "none" | "root" | "stack" | "quality" | "answer";
type SeventhQualityId = "maj7" | "m7" | "7" | "m7b5";

type KeyOption = {
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

type SeventhChordRow = {
  degreeRoman: string;
  degreeNumber: number;
  rootNote: string;
  stackFormula: string;
  stackNotes: string[];
  qualityId: SeventhQualityId;
  qualityLabel: string;
  symbol: string;
};

type SeventhPatternRow = {
  degreeRoman: string;
  qualityId: SeventhQualityId;
};

const STORAGE_KEY = "dictados-react-seventh-chord-harmonic-field-study";
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
const NATURAL_MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10] as const;
const HINT_LEVEL_ORDER: HintLevel[] = [
  "none",
  "root",
  "stack",
  "quality",
  "answer",
];
const MAJOR_KEY_OPTIONS: KeyOption[] = [
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
const NATURAL_MINOR_KEY_OPTIONS: KeyOption[] = [
  { root: "A", label: "A natural minor" },
  { root: "E", label: "E natural minor" },
  { root: "B", label: "B natural minor" },
  { root: "F#", label: "F# natural minor" },
  { root: "C#", label: "C# natural minor" },
  { root: "G#", label: "G# natural minor" },
  { root: "D#", label: "D# natural minor" },
  { root: "D", label: "D natural minor" },
  { root: "G", label: "G natural minor" },
  { root: "C", label: "C natural minor" },
  { root: "F", label: "F natural minor" },
  { root: "Bb", label: "Bb natural minor" },
  { root: "Eb", label: "Eb natural minor" },
];
const SEVENTH_QUALITY_LABELS: Record<SeventhQualityId, string> = {
  maj7: "Mayor séptima",
  m7: "Menor séptima",
  "7": "Dominante",
  m7b5: "Semidisminuido",
};
const MAJOR_PATTERN: SeventhPatternRow[] = [
  { degreeRoman: "Imaj7", qualityId: "maj7" },
  { degreeRoman: "ii7", qualityId: "m7" },
  { degreeRoman: "iii7", qualityId: "m7" },
  { degreeRoman: "IVmaj7", qualityId: "maj7" },
  { degreeRoman: "V7", qualityId: "7" },
  { degreeRoman: "vi7", qualityId: "m7" },
  { degreeRoman: "viiø7", qualityId: "m7b5" },
];
const NATURAL_MINOR_PATTERN: SeventhPatternRow[] = [
  { degreeRoman: "i7", qualityId: "m7" },
  { degreeRoman: "iiø7", qualityId: "m7b5" },
  { degreeRoman: "IIImaj7", qualityId: "maj7" },
  { degreeRoman: "iv7", qualityId: "m7" },
  { degreeRoman: "v7", qualityId: "m7" },
  { degreeRoman: "VImaj7", qualityId: "maj7" },
  { degreeRoman: "VII7", qualityId: "7" },
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
  const targetLetter = LETTERS[(rootLetterIndex + degreeIndex) % LETTERS.length];
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

function buildScale(root: string, mode: ScaleMode) {
  const intervals =
    mode === "major" ? MAJOR_SCALE_INTERVALS : NATURAL_MINOR_INTERVALS;
  return intervals.map((interval, index) =>
    spelledNoteForDegree(root, index, interval),
  );
}

function seventhSymbol(root: string, qualityId: SeventhQualityId) {
  if (qualityId === "maj7") return `${root}maj7`;
  if (qualityId === "m7") return `${root}m7`;
  if (qualityId === "m7b5") return `${root}m7b5`;
  return `${root}7`;
}

function patternForMode(mode: ScaleMode) {
  return mode === "major" ? MAJOR_PATTERN : NATURAL_MINOR_PATTERN;
}

function buildSeventhRows(root: string, mode: ScaleMode): SeventhChordRow[] {
  const scale = buildScale(root, mode);
  const pattern = patternForMode(mode);

  return scale.map((note, index) => {
    const stackNotes = [
      scale[index],
      scale[(index + 2) % scale.length],
      scale[(index + 4) % scale.length],
      scale[(index + 6) % scale.length],
    ];
    const qualityId = pattern[index].qualityId;

    return {
      degreeRoman: pattern[index].degreeRoman,
      degreeNumber: index + 1,
      rootNote: note,
      stackFormula: "1 - 3 - 5 - 7",
      stackNotes,
      qualityId,
      qualityLabel: SEVENTH_QUALITY_LABELS[qualityId],
      symbol: seventhSymbol(note, qualityId),
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

function modeLabel(mode: ScaleMode) {
  return mode === "major" ? "major" : "natural minor";
}

function patternSummary(mode: ScaleMode) {
  return patternForMode(mode)
    .map((item) => item.degreeRoman)
    .join(" · ");
}

function hintTextForRow(row: SeventhChordRow, mode: ScaleMode, scaleNotes: string[], level: HintLevel) {
  if (level === "none") return "Sin pista todavía.";
  if (level === "root") {
    return `Nota base: ${row.rootNote}.`;
  }
  if (level === "stack") {
    return `Apila terceras dentro de ${modeLabel(mode)}: ${row.stackNotes.join(" - ")}.`;
  }
  if (level === "quality") {
    return `Patrón fijo: ${patternSummary(mode)}. En esta fila la calidad es ${row.qualityLabel}.`;
  }
  return `Respuesta completa: ${row.stackNotes.join(" - ")} · ${row.qualityLabel} · ${row.symbol}. Escala: ${scaleNotes.join(" - ")}.`;
}

function TrebleChordPreview({ notes }: { notes: string[] }) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const holderId = useRef(
    `seventh-field-staff-${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => {
    if (!holderRef.current) return;

    holderRef.current.innerHTML = "";
    if (notes.length === 0) return;

    const renderedNotes = buildTrebleKeys(notes);
    const width = 240;
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
        sx={{ width: 240, minHeight: 90 }}
      />
    </Box>
  );
}

export default function SeventhChordHarmonicFieldStudy() {
  const navigate = useNavigate();
  const [scaleMode, setScaleMode] = useState<ScaleMode>("major");
  const [selectedKey, setSelectedKey] = useState("C");
  const [practiceMode, setPracticeMode] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [validateLabels, setValidateLabels] = useState(false);
  const [answersByConfig, setAnswersByConfig] = useState<
    Record<string, Record<string, PracticeState>>
  >({});
  const [hintLevelsByConfig, setHintLevelsByConfig] = useState<
    Record<string, Record<string, HintLevel>>
  >({});
  const [resultsByConfig, setResultsByConfig] = useState<
    Record<string, Record<string, PracticeCheck | null>>
  >({});

  const keyOptions = useMemo(
    () => (scaleMode === "major" ? MAJOR_KEY_OPTIONS : NATURAL_MINOR_KEY_OPTIONS),
    [scaleMode],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.scaleMode === "major" || saved.scaleMode === "naturalMinor") {
        setScaleMode(saved.scaleMode);
      }
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
      if (saved.answersByConfig && typeof saved.answersByConfig === "object") {
        setAnswersByConfig(saved.answersByConfig);
      }
      if (
        saved.hintLevelsByConfig &&
        typeof saved.hintLevelsByConfig === "object"
      ) {
        setHintLevelsByConfig(saved.hintLevelsByConfig);
      }
    } catch (error) {
      console.error("No se pudo cargar el estudio de campo armónico", error);
    }
  }, []);

  useEffect(() => {
    if (!keyOptions.some((option) => option.root === selectedKey)) {
      setSelectedKey(keyOptions[0]?.root || "C");
    }
  }, [keyOptions, selectedKey]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        scaleMode,
        selectedKey,
        practiceMode,
        showHints,
        validateLabels,
        answersByConfig,
        hintLevelsByConfig,
      }),
    );
  }, [
    answersByConfig,
    hintLevelsByConfig,
    practiceMode,
    scaleMode,
    selectedKey,
    showHints,
    validateLabels,
  ]);

  const rows = useMemo(
    () => buildSeventhRows(selectedKey, scaleMode),
    [scaleMode, selectedKey],
  );
  const scaleNotes = useMemo(
    () => buildScale(selectedKey, scaleMode),
    [scaleMode, selectedKey],
  );
  const configKey = `${scaleMode}:${selectedKey}`;
  const qualityExamples = useMemo(
    () => ({
      maj7: rows.find((row) => row.qualityId === "maj7") || null,
      m7: rows.find((row) => row.qualityId === "m7") || null,
      "7": rows.find((row) => row.qualityId === "7") || null,
      m7b5: rows.find((row) => row.qualityId === "m7b5") || null,
    }),
    [rows],
  );

  function currentAnswer(rowKey: string) {
    return answersByConfig[configKey]?.[rowKey] || defaultPracticeState();
  }

  function currentHintLevel(rowKey: string) {
    return hintLevelsByConfig[configKey]?.[rowKey] || "none";
  }

  function currentResult(rowKey: string) {
    return resultsByConfig[configKey]?.[rowKey] || null;
  }

  function updateRowAnswer(
    rowKey: string,
    field: keyof PracticeState,
    value: string,
  ) {
    setAnswersByConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...(prev[configKey] || {}),
        [rowKey]: {
          ...currentAnswer(rowKey),
          [field]: value,
        },
      },
    }));
    setResultsByConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...(prev[configKey] || {}),
        [rowKey]: null,
      },
    }));
  }

  function revealNextHint(rowKey: string) {
    setHintLevelsByConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...(prev[configKey] || {}),
        [rowKey]: nextHintLevel(currentHintLevel(rowKey)),
      },
    }));
  }

  function checkRow(row: SeventhChordRow) {
    const rowKey = row.degreeRoman;
    const answer = currentAnswer(rowKey);
    const noteCheck = checkNotesAnswer(answer.notes, row.stackNotes);
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

    setResultsByConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...(prev[configKey] || {}),
        [rowKey]: finalCheck,
      },
    }));
  }

  function checkAllRows() {
    rows.forEach((row) => checkRow(row));
  }

  function clearPractice() {
    setAnswersByConfig((prev) => ({
      ...prev,
      [configKey]: {},
    }));
    setHintLevelsByConfig((prev) => ({
      ...prev,
      [configKey]: {},
    }));
    setResultsByConfig((prev) => ({
      ...prev,
      [configKey]: {},
    }));
  }

  const resolvedCount = rows.filter(
    (row) => currentResult(row.degreeRoman)?.overall,
  ).length;

  return (
    <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5 }, py: 3 }}>
      <Stack spacing={2.5} maxWidth="1320px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2a50" }}>
            Campo Armónico con Séptimas
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
              1. Escribe las 7 notas de la escala. 2. Desde cada grado apila
              terceras hasta tener 4 notas: 1-3-5-7. 3. Clasifica la calidad del
              acorde. 4. Escribe el símbolo final.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {patternForMode("major").map((item) => (
                <Chip key={`major-${item.degreeRoman}`} label={item.degreeRoman} variant="outlined" />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {patternForMode("naturalMinor").map((item) => (
                <Chip
                  key={`minor-${item.degreeRoman}`}
                  label={item.degreeRoman}
                  variant="outlined"
                />
              ))}
            </Stack>
            <Alert severity="info">
              Regla rápida: `7` significa séptima menor. `maj7` significa séptima
              mayor. Por eso `D7 = D F# A C` y `Dmaj7 = D F# A C#`.
            </Alert>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              De dónde salen los grados
            </Typography>
            <Typography variant="body2">
              El grado es solo la posición de una nota dentro de la escala.
              Si estás en {selectedKey} {modeLabel(scaleMode)}, la nota 1 es la
              tónica, la 2 es el segundo grado, la 3 es el tercero y así hasta
              el 7.
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {scaleNotes.map((note, index) => (
                <Chip
                  key={`degree-source-${note}-${index}`}
                  label={`${index + 1} = ${note}`}
                  color={index === 0 ? "primary" : "default"}
                  variant={index === 0 ? "filled" : "outlined"}
                />
              ))}
            </Stack>
            <Grid container spacing={2}>
              {rows.slice(0, 3).map((row) => (
                <Grid item xs={12} md={4} key={`degree-explainer-${row.degreeRoman}`}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, height: "100%", backgroundColor: "#fafcff" }}
                  >
                    <Stack spacing={0.75}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {row.degreeRoman}
                      </Typography>
                      <Typography variant="body2">
                        Empieza en la nota {row.degreeNumber}: {row.rootNote}.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Luego apilas terceras dentro de la escala:
                      </Typography>
                      <Typography variant="body2">
                        {row.rootNote}
                        {" -> "}
                        {row.stackNotes.join(" -> ")}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Alert severity="info">
              Ejemplo rápido: si la escala es `C major`, el grado 2 empieza en
              `D`. Si apilas terceras dentro de esa escala te sale
              `D - F - A - C`, o sea `Dm7`.
            </Alert>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Cómo sale la calidad del acorde
            </Typography>
            <Typography variant="body2">
              La calidad ya no depende del nombre del grado sino de las
              distancias internas entre la raíz, la tercera, la quinta y la
              séptima. En otras palabras: miras qué tercera tiene, qué quinta
              tiene y qué séptima tiene.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={3}>
                <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      maj7
                    </Typography>
                    <Typography variant="body2">
                      3ra mayor + 5ta justa + 7ma mayor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fórmula: 1 - 3 - 5 - 7
                    </Typography>
                    <Typography variant="body2">
                      Ejemplo: {qualityExamples.maj7?.symbol || "Cmaj7"} ={" "}
                      {qualityExamples.maj7?.stackNotes.join(" - ") || "C - E - G - B"}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      m7
                    </Typography>
                    <Typography variant="body2">
                      3ra menor + 5ta justa + 7ma menor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fórmula: 1 - b3 - 5 - b7
                    </Typography>
                    <Typography variant="body2">
                      Ejemplo: {qualityExamples.m7?.symbol || "Dm7"} ={" "}
                      {qualityExamples.m7?.stackNotes.join(" - ") || "D - F - A - C"}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      7
                    </Typography>
                    <Typography variant="body2">
                      3ra mayor + 5ta justa + 7ma menor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fórmula: 1 - 3 - 5 - b7
                    </Typography>
                    <Typography variant="body2">
                      Ejemplo: {qualityExamples["7"]?.symbol || "G7"} ={" "}
                      {qualityExamples["7"]?.stackNotes.join(" - ") || "G - B - D - F"}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Paper variant="outlined" sx={{ p: 1.5, height: "100%" }}>
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      m7b5
                    </Typography>
                    <Typography variant="body2">
                      3ra menor + 5ta disminuida + 7ma menor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fórmula: 1 - b3 - b5 - b7
                    </Typography>
                    <Typography variant="body2">
                      Ejemplo: {qualityExamples.m7b5?.symbol || "Bm7b5"} ={" "}
                      {qualityExamples.m7b5?.stackNotes.join(" - ") || "B - D - F - A"}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
            <Alert severity="warning">
              Los números romanos te dicen desde qué nota empiezas. La calidad
              te la dicen las notas que salen al apilar 1-3-5-7 dentro de la
              escala.
            </Alert>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Tabla guiada principal
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="scale-mode-label">Modo</InputLabel>
                  <Select
                    labelId="scale-mode-label"
                    label="Modo"
                    value={scaleMode}
                    onChange={(event) => setScaleMode(event.target.value as ScaleMode)}
                  >
                    <MenuItem value="major">Major</MenuItem>
                    <MenuItem value="naturalMinor">Natural minor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel id="key-label">Tonalidad</InputLabel>
                  <Select
                    labelId="key-label"
                    label="Tonalidad"
                    value={selectedKey}
                    onChange={(event) => setSelectedKey(event.target.value)}
                  >
                    {keyOptions.map((option) => (
                      <MenuItem key={`${scaleMode}-${option.root}`} value={option.root}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, height: "100%", backgroundColor: "#fafcff" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Escala actual
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {scaleNotes.map((note, index) => (
                      <Chip
                        key={`${selectedKey}-${note}-${index}`}
                        label={`${index + 1}. ${note}`}
                        color={index === 0 ? "primary" : "default"}
                        variant={index === 0 ? "filled" : "outlined"}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, height: "100%", backgroundColor: "#fafcff" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Patrón fijo de {modeLabel(scaleMode)}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {patternForMode(scaleMode).map((item) => (
                      <Chip key={`${scaleMode}-${item.degreeRoman}`} label={item.degreeRoman} variant="outlined" />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, height: "100%", backgroundColor: "#fafcff" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Calidad de séptimas
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label="maj7 = Mayor séptima" variant="outlined" />
                    <Chip label="m7 = Menor séptima" variant="outlined" />
                    <Chip label="7 = Dominante" variant="outlined" />
                    <Chip label="m7b5 = Semidisminuido" variant="outlined" />
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
                      onClick={clearPractice}
                    >
                      Limpiar tabla
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
                  <TableCell>1-3-5-7</TableCell>
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
                    <TableRow key={`${configKey}-${rowKey}`}>
                      <TableCell sx={{ fontWeight: 700 }}>{row.degreeRoman}</TableCell>
                      <TableCell>{row.rootNote}</TableCell>
                      <TableCell>
                        {!practiceMode
                          ? row.stackNotes.join(" - ")
                          : showHints &&
                              (hintLevel === "stack" ||
                                hintLevel === "quality" ||
                                hintLevel === "answer")
                          ? row.stackNotes.join(" - ")
                          : row.stackFormula}
                      </TableCell>
                      <TableCell sx={{ minWidth: 240 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Ej. C E G B"
                            value={answer.notes}
                            onChange={(event) =>
                              updateRowAnswer(rowKey, "notes", event.target.value)
                            }
                          />
                        ) : (
                          row.stackNotes.join(" - ")
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 260 }}>
                        {displayNotes.length > 0 ? (
                          <TrebleChordPreview notes={displayNotes} />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Escribe notas para ver el acorde
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            disabled={!validateLabels}
                            placeholder={row.qualityLabel}
                            value={answer.quality}
                            onChange={(event) =>
                              updateRowAnswer(rowKey, "quality", event.target.value)
                            }
                          />
                        ) : (
                          row.qualityLabel
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        {practiceMode ? (
                          <TextField
                            size="small"
                            fullWidth
                            disabled={!validateLabels}
                            placeholder={row.symbol}
                            value={answer.symbol}
                            onChange={(event) =>
                              updateRowAnswer(rowKey, "symbol", event.target.value)
                            }
                          />
                        ) : (
                          row.symbol
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 310 }}>
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
                                {hintTextForRow(row, scaleMode, scaleNotes, hintLevel)}
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
              Qué te conviene entregar
            </Typography>
            <Typography variant="body2">
              Si la tarea dice campo armónico mayor y menor con séptimas, lo más
              probable es que te pidan dos tablas: una en una escala mayor y otra
              en una escala menor natural, ambas con 7 acordes de cuatro notas.
            </Typography>
            <Alert severity="warning">
              Este módulo asume `natural minor`. Si tu maestro pidió armónica o
              melódica, ese patrón cambia y habría que añadirlo aparte.
            </Alert>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
