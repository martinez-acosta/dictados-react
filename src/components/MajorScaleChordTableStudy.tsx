import React, { useEffect, useMemo, useState } from "react";
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

type HintLevel = "none" | "root" | "stack" | "quality" | "answer";
type ExtensionQuality = "major" | "minor" | "diminished" | "augmented";

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

function buildFamilyTriads(quality: ExtensionQuality) {
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
      if (saved.answersByKey && typeof saved.answersByKey === "object") {
        setAnswersByKey(saved.answersByKey);
      }
      if (saved.hintLevelsByKey && typeof saved.hintLevelsByKey === "object") {
        setHintLevelsByKey(saved.hintLevelsByKey);
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
        answersByKey,
        hintLevelsByKey,
      }),
    );
  }, [
    answersByKey,
    hintLevelsByKey,
    practiceMode,
    selectedKey,
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

  const resolvedCount = rows.filter(
    (row) => currentResult(row.degreeRoman)?.overall,
  ).length;

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
                Tabla guiada principal
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
              Las pistas avanzan por fila en este orden: nota base, apilar 1-3-5,
              calidad, respuesta completa. Si quieres estudiar de verdad, deja las
              pistas apagadas y sólo actívalas cuando te bloquees.
            </Typography>
            <Alert severity="info">
              Regla rápida para revisar mentalmente: en la escala mayor las
              tríadas salen siempre I mayor, ii menor, iii menor, IV mayor, V
              mayor, vi menor, vii disminuido.
            </Alert>
          </Stack>
        </Paper>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Extra: 7 tríadas por familia sobre notas naturales
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta parte es referencia separada. No es la misma tarea que armonizar
              el modo mayor; sirve para practicar cómo se forman mayores, menores,
              disminuidas y aumentadas desde C-D-E-F-G-A-B.
            </Typography>

            <FormControl size="small" sx={{ maxWidth: 260 }}>
              <InputLabel id="extension-quality-label">Familia</InputLabel>
              <Select
                labelId="extension-quality-label"
                label="Familia"
                value={extensionQuality}
                onChange={(event) =>
                  setExtensionQuality(event.target.value as ExtensionQuality)
                }
              >
                <MenuItem value="major">Mayores</MenuItem>
                <MenuItem value="minor">Menores</MenuItem>
                <MenuItem value="diminished">Disminuidas</MenuItem>
                <MenuItem value="augmented">Aumentadas</MenuItem>
              </Select>
            </FormControl>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Raíz</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell>Símbolo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {extensionRows.map((row) => (
                    <TableRow key={`${extensionQuality}-${row.root}`}>
                    <TableCell>{formatNote(row.root)}</TableCell>
                    <TableCell>
                      {row.notes.map(formatNote).join(" - ")}
                    </TableCell>
                    <TableCell>{row.symbol}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Alert severity="success" icon={<CheckCircleOutline />}>
              Ejercicio sugerido: primero memoriza C major completo, luego cambia
              a G major y F major para acostumbrarte a sostenidos y bemoles.
            </Alert>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
