import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import { MusicNote, PlayArrow } from "@mui/icons-material";
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

export default function BassArpeggioExplorer() {
  const defaultGroup =
    ARPEGGIO_GROUPS.find((group) => group.id === "seventh") ??
    ARPEGGIO_GROUPS[0];
  const initialQualityId =
    defaultGroup.defaultQualityId ?? defaultGroup.qualities[0].id;
  const [groupId, setGroupId] = useState<ArpeggioGroup["id"]>(defaultGroup.id);
  const [root, setRoot] = useState<RootNote>("D");
  const [qualityId, setQualityId] = useState<string>(initialQualityId);
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

  const chordSymbol = `${root}${selectedQuality.symbol}`;
  const playbackOctaves = useMemo(
    () => buildPlaybackOctaves(selectedQuality.intervals.length),
    [selectedQuality],
  );

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
    return () => {
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    stopPlayback();
  }, [root, groupId, qualityId]);

  async function handlePlayPattern(pattern: Pattern) {
    if (notes.length === 0) return;
    stopPlayback();
    const sampler = await getYamahaSampler();
    setPlayingPatternId(pattern.id);
    setActiveNoteIndex(null);

    const stepMs = 550;
    pattern.order.forEach((index, pos) => {
      const timeout = window.setTimeout(() => {
        setActiveNoteIndex(index);
        const toneNote = `${notes[index]}${playbackOctaves[index] ?? 2}`;
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
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MusicNote sx={{ color: "success.main" }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Arpegios para Bajo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona la familia (triadas o cuatríadas) y explora sus notas
              con patrones reproducibles.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {activeGroup.label}: {activeGroup.description}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
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
          <Grid item xs={12} sm={6} md={4}>
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
          <Grid item xs={12} sm={6} md={4}>
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
        </Grid>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {chordSymbol}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedQuality.label} / {selectedQuality.englishLabel}.{" "}
            {selectedQuality.description}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Notas en cifrado americano
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {notes.map((note, idx) => (
              <Chip
                key={`${note}-${idx}`}
                label={`${note} (${selectedQuality.degrees[idx]})`}
                color="default"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

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
                          label={`${notes[index]} (${selectedQuality.degrees[index]})`}
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
      </Stack>
    </Paper>
  );
}
