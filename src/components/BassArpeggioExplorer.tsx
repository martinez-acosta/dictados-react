import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Typography,
  Grid,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Divider,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { ExpandMore, MusicNote, PlayArrow, Stop } from "@mui/icons-material";
import { getYamahaSampler, releaseYamahaVoices } from "../utils/yamahaSampler";

const ROOT_OPTIONS = [
  { label: "C", value: "C" },
  { label: "Db", value: "Db" },
  { label: "D", value: "D" },
  { label: "Eb", value: "Eb" },
  { label: "E", value: "E" },
  { label: "F", value: "F" },
  { label: "Gb", value: "Gb" },
  { label: "G", value: "G" },
  { label: "Ab", value: "Ab" },
  { label: "A", value: "A" },
  { label: "Bb", value: "Bb" },
  { label: "B", value: "B" },
] as const;

type RootNote = (typeof ROOT_OPTIONS)[number]["value"];

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  "E#": 5,
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
  Cb: 11,
  "B#": 0,
};

const NOTE_NAMES_SHARP = [
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
const NOTE_NAMES_FLAT = [
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
const FLAT_PREFERENCE = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"]);
const MAX_FRET_OPTIONS = [12, 16, 20, 24] as const;

type BassStringId = "B" | "E" | "A" | "D" | "G";

const BASS_STRING_TUNING: readonly {
  id: BassStringId;
  label: string;
  semitone: number;
}[] = [
  { id: "B", label: "B (Si)", semitone: 11 },
  { id: "E", label: "E (Mi)", semitone: 4 },
  { id: "A", label: "A (La)", semitone: 9 },
  { id: "D", label: "D (Re)", semitone: 2 },
  { id: "G", label: "G (Sol)", semitone: 7 },
];

const INVERSION_LABELS = [
  "Estado fundamental",
  "1ª inversión",
  "2ª inversión",
  "3ª inversión",
] as const;

type Pattern = {
  id: string;
  label: string;
  description: string;
  order: readonly number[];
};

type ChordQuality = {
  id: string;
  symbol: string;
  label: string;
  englishLabel: string;
  intervals: readonly number[];
  degrees: readonly string[];
  description: string;
};

type ArpeggioGroup = {
  id: string;
  label: string;
  description: string;
  defaultQualityId: string;
  patterns: readonly Pattern[];
  qualities: readonly ChordQuality[];
};

const ARPEGGIO_GROUPS: readonly ArpeggioGroup[] = [
  {
    id: "triads",
    label: "Triadas (3 notas)",
    description:
      "Arpegios de 1-3-5: ideales para grooves básicos y visualización rápida.",
    defaultQualityId: "maj",
    patterns: [
      {
        id: "triads-ascending",
        label: "Ascendente lineal",
        description: "1-3-5 directo para fijar el acorde.",
        order: [0, 1, 2],
      },
      {
        id: "triads-descending",
        label: "Descendente",
        description: "5-3-1 para rematar en el registro grave.",
        order: [2, 1, 0],
      },
      {
        id: "triads-pivot",
        label: "Salto de quinta",
        description: "1-5-3 estilo under-walking.",
        order: [0, 2, 1],
      },
    ],
    qualities: [
      {
        id: "maj",
        symbol: "",
        label: "Arpegio mayor (triada)",
        englishLabel: "major triad arpeggio",
        intervals: [0, 4, 7],
        degrees: ["1", "3", "5"],
        description:
          "Brillante y estable. Úsalo sobre acordes mayores o la tónica.",
      },
      {
        id: "min",
        symbol: "m",
        label: "Arpegio menor (triada)",
        englishLabel: "minor triad arpeggio",
        intervals: [0, 3, 7],
        degrees: ["1", "b3", "5"],
        description: "Sonoridad melancólica típica del grado vi o ii menor.",
      },
      {
        id: "dim",
        symbol: "dim",
        label: "Arpegio disminuido",
        englishLabel: "diminished triad arpeggio",
        intervals: [0, 3, 6],
        degrees: ["1", "b3", "b5"],
        description:
          "Color tenso ideal para acordes disminuidos o paso cromático.",
      },
      {
        id: "aug",
        symbol: "aug",
        label: "Arpegio aumentado",
        englishLabel: "augmented triad arpeggio",
        intervals: [0, 4, 8],
        degrees: ["1", "3", "#5"],
        description: "Color luminoso/abierto, usado como dominante alterado.",
      },
    ],
  },
  {
    id: "seventh",
    label: "Cuatríadas (7ª)",
    description: "Arpegios de 1-3-5-7 para acordes con séptima.",
    defaultQualityId: "min7",
    patterns: [
      {
        id: "seventh-ascending",
        label: "Ascendente lineal",
        description: "1-3-5-7 para ubicar el acorde de forma directa.",
        order: [0, 1, 2, 3],
      },
      {
        id: "seventh-descending",
        label: "Descendente",
        description: "7-5-3-1 para resolver hacia el registro grave.",
        order: [3, 2, 1, 0],
      },
      {
        id: "seventh-pivot",
        label: "Salto de quinta",
        description: "1-5-7-3 (patrón típico en walking bass).",
        order: [0, 2, 3, 1],
      },
    ],
    qualities: [
      {
        id: "min7",
        symbol: "m7",
        label: "Arpegio menor séptima",
        englishLabel: "minor 7 arpeggio",
        intervals: [0, 3, 7, 10],
        degrees: ["1", "b3", "5", "b7"],
        description: "1-b3-5-b7 (modo dórico / grado ii).",
      },
      {
        id: "dom7",
        symbol: "7",
        label: "Arpegio dominante séptima",
        englishLabel: "dominant 7 arpeggio",
        intervals: [0, 4, 7, 10],
        degrees: ["1", "3", "5", "b7"],
        description: "1-3-5-b7 con tensión hacia la tónica (grado V).",
      },
      {
        id: "maj7",
        symbol: "maj7",
        label: "Arpegio mayor séptima",
        englishLabel: "major 7 arpeggio",
        intervals: [0, 4, 7, 11],
        degrees: ["1", "3", "5", "7"],
        description: "1-3-5-7 estable y luminoso (grado I).",
      },
      {
        id: "half-dim",
        symbol: "m7♭5",
        label: "Arpegio semidisminuido",
        englishLabel: "half diminished arpeggio",
        intervals: [0, 3, 6, 10],
        degrees: ["1", "b3", "b5", "b7"],
        description: "Ideal para acordes iiø en menor (locrian).",
      },
    ],
  },
  {
    id: "extended",
    label: "Extendidos / alterados",
    description:
      "Colores de 4 notas útiles para repertorio moderno (nivel avanzado inicial).",
    defaultQualityId: "dim7",
    patterns: [
      {
        id: "extended-ascending",
        label: "Ascendente lineal",
        description: "1-3-5-7 para oír claramente el color del acorde.",
        order: [0, 1, 2, 3],
      },
      {
        id: "extended-descending",
        label: "Descendente",
        description: "7-5-3-1 para aterrizar en la fundamental.",
        order: [3, 2, 1, 0],
      },
      {
        id: "extended-pivot",
        label: "Patrón de salto",
        description: "1-5-7-3 para fraseo de walking con tensión.",
        order: [0, 2, 3, 1],
      },
    ],
    qualities: [
      {
        id: "dim7",
        symbol: "dim7",
        label: "Arpegio disminuido séptima",
        englishLabel: "fully diminished 7 arpeggio",
        intervals: [0, 3, 6, 9],
        degrees: ["1", "b3", "b5", "bb7"],
        description: "Simétrico por terceras menores; útil en dominantes.",
      },
      {
        id: "minMaj7",
        symbol: "m(maj7)",
        label: "Arpegio menor mayor séptima",
        englishLabel: "minor major 7 arpeggio",
        intervals: [0, 3, 7, 11],
        degrees: ["1", "b3", "5", "7"],
        description: "Color del modo menor melódico.",
      },
      {
        id: "augMaj7",
        symbol: "aug(maj7)",
        label: "Arpegio aumentado mayor séptima",
        englishLabel: "augmented major 7 arpeggio",
        intervals: [0, 4, 8, 11],
        degrees: ["1", "3", "#5", "7"],
        description: "Sonoridad brillante y abierta.",
      },
      {
        id: "aug7",
        symbol: "7#5",
        label: "Arpegio dominante #5",
        englishLabel: "dominant sharp five arpeggio",
        intervals: [0, 4, 8, 10],
        degrees: ["1", "3", "#5", "b7"],
        description: "Color alterado para acordes dominantes.",
      },
    ],
  },
];

function noteNameFromSemitone(value: number, preferFlats: boolean) {
  const table = preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  const index = ((value % 12) + 12) % 12;
  return table[index];
}

function buildChordNotes(
  root: RootNote,
  quality: ChordQuality,
  preferFlats: boolean,
) {
  const rootValue = NOTE_TO_SEMITONE[root] ?? 0;
  return quality.intervals.map((interval) =>
    noteNameFromSemitone(rootValue + interval, preferFlats),
  );
}

function buildPlaybackOctaves(length: number) {
  if (length <= 0) return [];
  return Array.from({ length }, (_, idx) => (idx === length - 1 ? 3 : 2));
}

function normalizeShift(length: number, shift: number) {
  if (length <= 0) return 0;
  return ((shift % length) + length) % length;
}

function rotateArray<T>(items: readonly T[], shift: number) {
  if (items.length <= 1) return [...items];
  const normalized = normalizeShift(items.length, shift);
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function buildInvertedVoicing(
  notes: readonly string[],
  degrees: readonly string[],
  inversion: number,
) {
  const normalizedInversion = normalizeShift(notes.length, inversion);
  return {
    notes: rotateArray(notes, normalizedInversion),
    degrees: rotateArray(degrees, normalizedInversion),
    label: INVERSION_LABELS[normalizedInversion] ?? INVERSION_LABELS[0],
    index: normalizedInversion,
  };
}

function buildRootPositions(root: RootNote, maxFret: number) {
  const targetSemitone = NOTE_TO_SEMITONE[root] ?? 0;
  const positions: { stringId: BassStringId; fret: number }[] = [];

  BASS_STRING_TUNING.forEach((stringConfig) => {
    for (let fret = 0; fret <= maxFret; fret += 1) {
      if ((stringConfig.semitone + fret) % 12 === targetSemitone) {
        positions.push({ stringId: stringConfig.id, fret });
      }
    }
  });

  return positions;
}

function positionLabel(position: { stringId: BassStringId; fret: number }) {
  return `${position.stringId}-${position.fret}`;
}

export default function BassArpeggioExplorer() {
  const defaultGroup =
    ARPEGGIO_GROUPS.find((group) => group.id === "seventh") ??
    ARPEGGIO_GROUPS[0];
  const initialQualityId =
    defaultGroup.defaultQualityId ?? defaultGroup.qualities[0].id;
  const [groupId, setGroupId] = useState<ArpeggioGroup["id"]>(defaultGroup.id);
  const [root, setRoot] = useState<RootNote>("D");
  const [qualityId, setQualityId] = useState<string>(initialQualityId);
  const [inversion, setInversion] = useState(0);
  const [maxFret, setMaxFret] = useState<number>(16);
  const [catalogGroupId, setCatalogGroupId] = useState<
    ArpeggioGroup["id"] | "all"
  >("all");
  const [catalogFilter, setCatalogFilter] = useState("");
  const [playingPatternId, setPlayingPatternId] = useState<string | null>(null);
  const playbackTimeouts = useRef<number[]>([]);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);

  const activeGroup = useMemo(
    () =>
      ARPEGGIO_GROUPS.find((group) => group.id === groupId) ??
      ARPEGGIO_GROUPS[0],
    [groupId],
  );
  const qualityOptions = activeGroup.qualities;
  const selectedQuality = (qualityOptions.find((q) => q.id === qualityId) ??
    qualityOptions[0]) as ChordQuality;
  const currentPatterns = activeGroup.patterns;

  const preferFlats = FLAT_PREFERENCE.has(root);

  const notes = useMemo(
    () => buildChordNotes(root, selectedQuality, preferFlats),
    [root, selectedQuality, preferFlats],
  );
  const voiced = useMemo(
    () => buildInvertedVoicing(notes, selectedQuality.degrees, inversion),
    [inversion, notes, selectedQuality.degrees],
  );
  const voicedNotes = voiced.notes;
  const voicedDegrees = voiced.degrees;
  const inversionOptions = Math.max(1, selectedQuality.intervals.length);
  const inversionLabel = voiced.label;
  const safeInversion = voiced.index;

  const chordSymbol = `${root}${selectedQuality.symbol}`;
  const playbackOctaves = useMemo(
    () => buildPlaybackOctaves(selectedQuality.intervals.length),
    [selectedQuality],
  );
  const rootPositions = useMemo(
    () => buildRootPositions(root, maxFret),
    [maxFret, root],
  );
  const recommendedRootPosition = useMemo(
    () =>
      rootPositions.find((position) => position.fret <= 7) ?? rootPositions[0],
    [rootPositions],
  );
  const playableRangeText = useMemo(
    () => `BEADG · hasta traste ${maxFret}`,
    [maxFret],
  );
  const catalogRows = useMemo(() => {
    const normalizedFilter = catalogFilter.trim().toLowerCase();
    const sourceGroups =
      catalogGroupId === "all"
        ? ARPEGGIO_GROUPS
        : ARPEGGIO_GROUPS.filter((group) => group.id === catalogGroupId);

    return sourceGroups.flatMap((group) =>
      ROOT_OPTIONS.flatMap((rootOption) =>
        group.qualities
          .map((quality) => {
            const preferFlatsByRoot = FLAT_PREFERENCE.has(rootOption.value);
            const qualityNotes = buildChordNotes(
              rootOption.value,
              quality,
              preferFlatsByRoot,
            );
            const positions = buildRootPositions(rootOption.value, maxFret);
            const recommended =
              positions.find((position) => position.fret <= 7) ?? positions[0];
            const chord = `${rootOption.value}${quality.symbol}`;
            return {
              id: `${group.id}-${quality.id}-${rootOption.value}`,
              chord,
              root: rootOption.value,
              groupLabel: group.label,
              qualityLabel: quality.label,
              notesText: qualityNotes.join(" - "),
              degreesText: quality.degrees.join(" - "),
              recommendedText: recommended ? positionLabel(recommended) : "N/A",
              positionsCount: positions.length,
            };
          })
          .filter((row) => {
            if (!normalizedFilter) return true;
            const haystack =
              `${row.chord} ${row.groupLabel} ${row.qualityLabel} ${row.notesText}`.toLowerCase();
            return haystack.includes(normalizedFilter);
          }),
      ),
    );
  }, [catalogFilter, catalogGroupId, maxFret]);

  function clearPlaybackTimers() {
    playbackTimeouts.current.forEach((id) => window.clearTimeout(id));
    playbackTimeouts.current = [];
  }

  function stopPlayback() {
    clearPlaybackTimers();
    setPlayingPatternId(null);
    releaseYamahaVoices();
    setActiveNoteIndex(null);
  }

  useEffect(() => {
    if (!qualityOptions.some((q) => q.id === qualityId)) {
      const fallback = activeGroup.defaultQualityId ?? qualityOptions[0]?.id;
      if (fallback) setQualityId(fallback);
    }
  }, [activeGroup, qualityId, qualityOptions]);
  useEffect(() => {
    setInversion(0);
  }, [qualityId, groupId]);
  useEffect(() => {
    const clamped = Math.min(safeInversion, Math.max(0, inversionOptions - 1));
    if (clamped !== inversion) setInversion(clamped);
  }, [inversion, inversionOptions, safeInversion]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    stopPlayback();
  }, [root, groupId, qualityId, inversion]);

  async function handlePlayPattern(pattern: Pattern) {
    if (voicedNotes.length === 0) return;
    stopPlayback();
    const sampler = await getYamahaSampler();
    setPlayingPatternId(pattern.id);
    setActiveNoteIndex(null);

    const stepMs = 550;
    pattern.order.forEach((index, pos) => {
      const timeout = window.setTimeout(() => {
        setActiveNoteIndex(index);
        const toneNote = `${voicedNotes[index]}${playbackOctaves[index] ?? 2}`;
        sampler.triggerAttackRelease(toneNote, 0.5);
        if (pos === pattern.order.length - 1) {
          setTimeout(() => {
            setPlayingPatternId(null);
            setActiveNoteIndex(null);
          }, 200);
        }
      }, pos * stepMs);
      playbackTimeouts.current.push(timeout);
    });
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2.5}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MusicNote sx={{ color: "success.main" }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Arpegios para Bajo de 5 cuerdas (BEADG)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Modo práctico: elige un arpegio puntual y reprodúcelo con
              diferentes patrones e inversiones.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeGroup.label}: {activeGroup.description}
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ py: 0.75 }}>
          Cobertura completa incluida: catálogo de todas las tonalidades y
          calidades disponibles para bajo de 5 cuerdas.
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="group-label">Familia</InputLabel>
              <Select
                labelId="group-label"
                label="Familia"
                value={groupId}
                onChange={(e) =>
                  setGroupId(e.target.value as ArpeggioGroup["id"])
                }
              >
                {ARPEGGIO_GROUPS.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="root-label">Fundamental</InputLabel>
              <Select
                labelId="root-label"
                label="Fundamental"
                value={root}
                onChange={(e) => setRoot(e.target.value as RootNote)}
              >
                {ROOT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="quality-label">Tipo de arpegio</InputLabel>
              <Select
                labelId="quality-label"
                label="Tipo de arpegio"
                value={qualityId}
                onChange={(e) => setQualityId(e.target.value as string)}
              >
                {qualityOptions.map((quality) => (
                  <MenuItem key={quality.id} value={quality.id}>
                    {quality.symbol ? `${quality.symbol} — ` : ""}
                    {quality.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="inversion-label">Inversión</InputLabel>
              <Select
                labelId="inversion-label"
                label="Inversión"
                value={safeInversion}
                onChange={(e) => setInversion(Number(e.target.value))}
              >
                {Array.from({ length: inversionOptions }, (_, idx) => (
                  <MenuItem key={`inversion-${idx}`} value={idx}>
                    {INVERSION_LABELS[idx]}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{inversionLabel}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="fret-label">Cobertura</InputLabel>
              <Select
                labelId="fret-label"
                label="Cobertura"
                value={maxFret}
                onChange={(e) => setMaxFret(Number(e.target.value))}
              >
                {MAX_FRET_OPTIONS.map((value) => (
                  <MenuItem key={`fret-${value}`} value={value}>
                    Traste 0-{value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {chordSymbol}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedQuality.label} / {selectedQuality.englishLabel}.{" "}
            {selectedQuality.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {playableRangeText}. Inversión activa: {inversionLabel}.
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Notas en cifrado americano
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {voicedNotes.map((note, idx) => (
              <Chip
                key={`${note}-${idx}`}
                label={`${note} (${voicedDegrees[idx]})`}
                color="default"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.6 }}>
            Raíces disponibles en diapasón BEADG
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {root}: {rootPositions.length} posiciones hasta el traste {maxFret}.{" "}
            Sugerida para iniciar:{" "}
            {recommendedRootPosition
              ? positionLabel(recommendedRootPosition)
              : "N/A"}
            .
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            {rootPositions.slice(0, 14).map((position, idx) => (
              <Chip
                key={`${position.stringId}-${position.fret}-${idx}`}
                label={positionLabel(position)}
                size="small"
                variant="outlined"
              />
            ))}
            {rootPositions.length > 14 && (
              <Chip
                size="small"
                color="info"
                label={`+${rootPositions.length - 14} más`}
              />
            )}
          </Stack>
        </Paper>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Modos / patrones sugeridos
          </Typography>
          <Grid container spacing={1.5}>
            {currentPatterns.map((pattern) => (
              <Grid item xs={12} md={4} key={pattern.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    height: "100%",
                    borderColor:
                      playingPatternId === pattern.id
                        ? "success.main"
                        : undefined,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {pattern.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pattern.description}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    sx={{ mt: 1 }}
                  >
                    {pattern.order.map((index, pos) => {
                      const isActiveNote =
                        playingPatternId === pattern.id &&
                        activeNoteIndex === index;
                      return (
                        <Chip
                          key={`${pattern.id}-${pos}`}
                          size="small"
                          label={`${voicedNotes[index]} (${voicedDegrees[index]})`}
                          color={isActiveNote ? "success" : "default"}
                          variant={isActiveNote ? "filled" : "outlined"}
                        />
                      );
                    })}
                  </Stack>
                  <Button
                    size="small"
                    variant={
                      playingPatternId === pattern.id ? "contained" : "outlined"
                    }
                    startIcon={<PlayArrow fontSize="small" />}
                    sx={{ mt: 1 }}
                    onClick={() => handlePlayPattern(pattern)}
                  >
                    Escuchar
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Stop fontSize="small" />}
            onClick={stopPlayback}
            disabled={!playingPatternId}
          >
            Detener audio
          </Button>
        </Stack>

        <Accordion defaultExpanded disableGutters>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Catálogo completo de arpegios (5 cuerdas)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={5} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="catalog-group-label">
                      Alcance de catálogo
                    </InputLabel>
                    <Select
                      labelId="catalog-group-label"
                      label="Alcance de catálogo"
                      value={catalogGroupId}
                      onChange={(e) =>
                        setCatalogGroupId(
                          e.target.value as ArpeggioGroup["id"] | "all",
                        )
                      }
                    >
                      <MenuItem value="all">Todas las familias</MenuItem>
                      {ARPEGGIO_GROUPS.map((group) => (
                        <MenuItem key={`catalog-${group.id}`} value={group.id}>
                          {group.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={7} md={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Filtro (ej: m7, Gb, disminuido)"
                    value={catalogFilter}
                    onChange={(e) => setCatalogFilter(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  color="primary"
                  label={`Arpegios listados: ${catalogRows.length}`}
                />
                <Chip
                  variant="outlined"
                  label={`12 tonalidades × ${
                    catalogGroupId === "all"
                      ? "todas las calidades"
                      : "calidades seleccionadas"
                  }`}
                />
              </Stack>

              <TableContainer
                sx={{
                  maxHeight: { xs: 320, md: 460 },
                  overflowY: "auto",
                  overflowX: "auto",
                  border: "1px solid rgba(11,42,80,0.12)",
                  borderRadius: 1.5,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                      >
                        Arpegio
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                      >
                        Familia
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                      >
                        Notas
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                      >
                        Grados
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                      >
                        Raíz sugerida
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                      >
                        Posiciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {catalogRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {row.chord}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {row.groupLabel}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.qualityLabel}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.notesText}</TableCell>
                        <TableCell>{row.degreesText}</TableCell>
                        <TableCell>{row.recommendedText}</TableCell>
                        <TableCell>{row.positionsCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Ruta recomendada para 1er año (completa)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                1. Semanas 1-4: triadas mayores/menores en 12 tonalidades con
                estado fundamental.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. Semanas 5-8: agrega disminuidas/aumentadas y todas las
                cuatríadas básicas (maj7, 7, m7, m7b5).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Semanas 9-12: trabaja inversiones + alterados (dim7, mMaj7,
                7#5, augMaj7) y aplica en progresiones II-V-I.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Meta técnica: tocar cada arpegio en dos registros distintos del
                diapasón (grave y medio) manteniendo pulso estable.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
}
