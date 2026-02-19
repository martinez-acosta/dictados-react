import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Paper,
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import { PlayArrow, Pause, ArrowBack } from "@mui/icons-material";
import {
  Factory,
  StaveNote,
  Stave,
  Accidental,
  TickContext,
  Formatter,
} from "vexflow";
import * as Tone from "tone";
import { useNavigate } from "react-router-dom";
import IntervalsTable from "./IntervalsTable";

// ---------------- Audio sampler persistente ----------------
let toneSamplerRef: Tone.Sampler | null = null;

async function loadSampler() {
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

// ---------------- Utilidades musicales ----------------
type Clef = "treble" | "bass";
type Quality = "Justo" | "Mayor" | "Menor" | "Aumentado" | "Disminuido";

const NAT_PC: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const ES_NAME: Record<string, string> = {
  C: "Do",
  D: "Re",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};
const ACC_TO_SHIFT = { "": 0, "#": +1, "##": +2, b: -1, bb: -2 } as const;
const ACC_SYMBOL: Record<string, string> = {
  "": "",
  "#": "♯",
  "##": "𝄪",
  b: "♭",
  bb: "𝄫",
};

function parseSpelled(name: string): {
  letter: keyof typeof NAT_PC;
  acc: "" | "#" | "##" | "b" | "bb";
  octave: number;
} {
  const m = name.match(/^([A-G])([b#]{0,2})(\d+)$/);
  if (!m) return { letter: "C", acc: "", octave: 4 };
  const letter = m[1] as keyof typeof NAT_PC;
  const acc = (m[2] as "" | "#" | "##" | "b" | "bb") || "";
  const octave = parseInt(m[3], 10);
  return { letter, acc, octave };
}

function midiFromSpelled(name: string): number {
  const { letter, acc, octave } = parseSpelled(name);
  const shift = ACC_TO_SHIFT[acc];
  return (octave + 1) * 12 + NAT_PC[letter] + shift;
}

function spanishOf(L: string, acc: string, oct: number): string {
  return `${ES_NAME[L]}${ACC_SYMBOL[acc]}${oct}`;
}

// ---------------- Intervalos HARDCODEADOS (tabla Said con notas naturales) ----------------
const HARDCODED_INTERVALS: Array<{
  root: string;
  interval: string;
  spelled: [string, string];
}> = [];

// Generar todos los intervalos desde notas naturales
const NATURAL_ROOTS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const SAID_INTERVALS = [
  {
    symbol: "P1",
    name: "Unísono",
    semitones: 0,
    quality: "Justo" as Quality,
    steps: 0,
  },
  {
    symbol: "m2",
    name: "2ª menor",
    semitones: 1,
    quality: "Menor" as Quality,
    steps: 1,
  },
  {
    symbol: "M2",
    name: "2ª mayor",
    semitones: 2,
    quality: "Mayor" as Quality,
    steps: 1,
  },
  {
    symbol: "m3",
    name: "3ª menor",
    semitones: 3,
    quality: "Menor" as Quality,
    steps: 2,
  },
  {
    symbol: "M3",
    name: "3ª mayor",
    semitones: 4,
    quality: "Mayor" as Quality,
    steps: 2,
  },
  {
    symbol: "P4",
    name: "4ª justa",
    semitones: 5,
    quality: "Justo" as Quality,
    steps: 3,
  },
  {
    symbol: "A4",
    name: "4ª aumentada",
    semitones: 6,
    quality: "Aumentado" as Quality,
    steps: 3,
  },
  {
    symbol: "d5",
    name: "5ª disminuida",
    semitones: 6,
    quality: "Disminuido" as Quality,
    steps: 4,
  },
  {
    symbol: "P5",
    name: "5ª justa",
    semitones: 7,
    quality: "Justo" as Quality,
    steps: 4,
  },
  {
    symbol: "A5",
    name: "5ª aumentada",
    semitones: 8,
    quality: "Aumentado" as Quality,
    steps: 4,
  },
  {
    symbol: "m6",
    name: "6ª menor",
    semitones: 8,
    quality: "Menor" as Quality,
    steps: 5,
  },
  {
    symbol: "M6",
    name: "6ª mayor",
    semitones: 9,
    quality: "Mayor" as Quality,
    steps: 5,
  },
  {
    symbol: "m7",
    name: "7ª menor",
    semitones: 10,
    quality: "Menor" as Quality,
    steps: 6,
  },
  {
    symbol: "M7",
    name: "7ª mayor",
    semitones: 11,
    quality: "Mayor" as Quality,
    steps: 6,
  },
  {
    symbol: "P8",
    name: "Octava",
    semitones: 12,
    quality: "Justo" as Quality,
    steps: 7,
  },
];

// Calcular intervalos con deletreo correcto
function calculateInterval(
  rootLetter: string,
  interval: (typeof SAID_INTERVALS)[0],
) {
  const rootPc = NAT_PC[rootLetter];
  const rootMidi = 12 * 5 + rootPc; // octava 4
  const targetMidi = rootMidi + interval.semitones;

  // Calcular letra destino y octava correctamente
  const rootIdx = LETTERS.indexOf(rootLetter as any);
  const targetSum = rootIdx + interval.steps;
  const targetIdx = ((targetSum % 7) + 7) % 7;
  const targetLetter = LETTERS[targetIdx];

  // Calcular octava basada en el cruce de la escala
  const octaveCarry = Math.floor(targetSum / 7);
  let targetOct = 4 + octaveCarry;

  // Calcular alteración necesaria
  const naturalTargetPc = NAT_PC[targetLetter];
  const naturalTargetMidi = 12 * (targetOct + 1) + naturalTargetPc;
  const delta = targetMidi - naturalTargetMidi;

  const acc =
    delta === 0
      ? ""
      : delta === 1
        ? "#"
        : delta === -1
          ? "b"
          : delta === 2
            ? "##"
            : delta === -2
              ? "bb"
              : "";
  const targetSpelled = `${targetLetter}${acc}${targetOct}`;

  return [`${rootLetter}4`, targetSpelled];
}

// Generar todos los intervalos
for (const root of NATURAL_ROOTS) {
  for (const interval of SAID_INTERVALS) {
    const [rootSpelled, targetSpelled] = calculateInterval(root, interval);
    HARDCODED_INTERVALS.push({
      root,
      interval: interval.symbol,
      spelled: [rootSpelled, targetSpelled],
    });
  }
}

// ---------------- Tipos y construcción ----------------
type Interval = {
  root: string;
  symbol: string;
  name: string;
  quality: Quality;
  spelled: [string, string];
  keys: [string, string];
  midis: [number, number];
};

function buildIntervals(intervalSymbol: string): Interval[] {
  const intervalDef = SAID_INTERVALS.find((i) => i.symbol === intervalSymbol)!;

  return HARDCODED_INTERVALS.filter((h) => h.interval === intervalSymbol).map(
    ({ root, spelled }) => {
      const keys = spelled.map((n) => {
        const { letter, octave } = parseSpelled(n);
        return `${letter.toLowerCase()}/${octave}`;
      }) as [string, string];

      const midis = spelled.map(midiFromSpelled) as [number, number];

      return {
        root,
        symbol: intervalDef.symbol,
        name: intervalDef.name,
        quality: intervalDef.quality,
        spelled,
        keys,
        midis,
      };
    },
  );
}

// ---------------- VexFlow Card ----------------
type IntervalCardProps = {
  interval: Interval;
  clef: Clef;
  highlight?: boolean;
};

function IntervalCard({ interval, clef, highlight }: IntervalCardProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const holderId = `vf-${interval.symbol}-${interval.root}`;
  const [vw, setVw] = useState<number>(280);

  useEffect(() => {
    if (!holderRef.current) return;
    const el = holderRef.current;
    const ro = new ResizeObserver(() => {
      const w = Math.max(180, Math.floor(el.clientWidth || 0));
      setVw(w);
    });
    ro.observe(el);
    setVw(Math.max(180, Math.floor(el.clientWidth || 0)));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!holderRef.current) return;
    holderRef.current.innerHTML = "";

    const width = Math.max(180, vw);
    const height = 120;
    const vf = new Factory({
      renderer: { elementId: holderId, width, height },
    });
    const ctx = vf.getContext();
    const stave = new Stave(10, 10, (width - 20) / 2);
    stave.addClef(clef).addTimeSignature("4/4").setContext(ctx).draw();

    // Crear dos notas separadas horizontalmente
    const notes = interval.keys.map((key, idx) => {
      const note = new StaveNote({ clef, keys: [key], duration: "w" });
      const spelled = interval.spelled[idx];
      const { acc } = parseSpelled(spelled);

      if (acc) note.addModifier(new Accidental(acc), 0);
      note.setStave(stave).setContext(ctx);
      if (highlight)
        note.setStyle({ fillStyle: "#ff6b35", strokeStyle: "#ff6b35" });
      return note;
    });

    try {
      Formatter.FormatAndDraw(ctx, stave, notes);
    } catch (e) {
      // Fallback: posicionamiento manual
      const leftPad = 20,
        rightPad = 20;
      const leftEdge = stave.getX() + leftPad;
      const rightEdge = stave.getX() + stave.getWidth() - rightPad;
      const span = Math.max(1, rightEdge - leftEdge);

      notes.forEach((note, i) => {
        const x = leftEdge + (span * (i + 0.5)) / notes.length;
        const tc = new TickContext();
        tc.addTickable(note).preFormat().setX(x);
        note.setTickContext(tc);
        try {
          note.draw();
        } catch {}
      });
    }

    // Agregar etiquetas de notas debajo del pentagrama usando posiciones calculadas
    const leftPad = 50;
    const rightPad = 20;
    const leftEdge = stave.getX() + leftPad;
    const rightEdge = stave.getX() + stave.getWidth() - rightPad;
    const span = Math.max(1, rightEdge - leftEdge);

    notes.forEach((note, i) => {
      const spelled = interval.spelled[i];

      // Calcular posición X basada en el espaciado uniforme
      const x = leftEdge + (span * (i + 0.5)) / notes.length;
      const y = stave.getYForLine(4) + 25; // Debajo del pentagrama

      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";

      // Medir el texto para centrarlo
      const textWidth = ctx.measureText(spelled).width;
      ctx.fillText(spelled, x - textWidth / 2, y);
    });
  }, [interval, clef, highlight, vw, holderId]);

  return <div id={holderId} ref={holderRef} style={{ width: "100%" }} />;
}

// ---------------- Componente principal ----------------
export default function IntervalsTrainer() {
  const navigate = useNavigate();

  const [intervalSymbol, setIntervalSymbol] = useState<string>("M3");
  const [clef, setClef] = useState<Clef>("treble");
  const [bpm, setBpm] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const intervals = useMemo(
    () => buildIntervals(intervalSymbol),
    [intervalSymbol],
  );

  useEffect(() => () => stopAll(), []);

  function stopAll() {
    setIsPlaying(false);
    setPlayingIndex(null);
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    try {
      toneSamplerRef?.releaseAll();
    } catch {}
  }

  function noteSeconds(): number {
    const beat = 60 / Math.max(30, Math.min(240, bpm));
    return beat * 4; // redonda
  }

  function arpeggioTiming(total: number) {
    const gap = total * 0.05;
    const sub = (total - 2 * gap) / 2; // 2 notas
    return { subDur: sub, gapDur: gap };
  }

  async function playInterval(idx: number) {
    await loadSampler();
    const interval = intervals[idx];
    if (!interval) return;
    const total = noteSeconds();
    setPlayingIndex(idx);

    const { subDur, gapDur } = arpeggioTiming(total);
    interval.midis.forEach((m, i) => {
      const at = i * (subDur + gapDur) * 1000;
      const to = window.setTimeout(() => {
        const freq = Tone.Frequency(m, "midi").toFrequency();
        toneSamplerRef!.triggerAttackRelease(freq, subDur * 0.95);
        if (i === interval.midis.length - 1) {
          const done = window.setTimeout(
            () => setPlayingIndex(null),
            subDur * 900,
          );
          timeoutsRef.current.push(done);
        }
      }, at);
      timeoutsRef.current.push(to);
    });
  }

  async function playAll() {
    if (isPlaying) {
      stopAll();
      return;
    }
    await loadSampler();
    setIsPlaying(true);

    const total = noteSeconds();
    const block = total + 0.4;

    for (let i = 0; i < intervals.length; i++) {
      const at = i * block * 1000;
      const to = window.setTimeout(() => {
        playInterval(i);
        if (i === intervals.length - 1) {
          const done = window.setTimeout(() => {
            setIsPlaying(false);
            setPlayingIndex(null);
          }, block * 1000);
          timeoutsRef.current.push(done);
        }
      }, at);
      timeoutsRef.current.push(to);
    }
  }

  const intervalData = SAID_INTERVALS.find((i) => i.symbol === intervalSymbol)!;

  return (
    <Box sx={{ width: "100%", px: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "#0b2a50", flex: 1 }}
          >
            🎵 Entrenador de Intervalos — {intervalData.name} (
            {intervalData.symbol})
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Tabla de intervalos a la izquierda */}
          <Grid item xs={12} lg={4}>
            <IntervalsTable />
          </Grid>

          {/* Contenido principal a la derecha */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Intervalo</InputLabel>
                      <Select
                        value={intervalSymbol}
                        onChange={(e) => setIntervalSymbol(e.target.value)}
                        label="Intervalo"
                      >
                        {SAID_INTERVALS.map((iv) => (
                          <MenuItem key={iv.symbol} value={iv.symbol}>
                            {iv.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Clave</InputLabel>
                      <Select
                        value={clef}
                        onChange={(e) => setClef(e.target.value as Clef)}
                        label="Clave"
                      >
                        <MenuItem value="treble">Sol (2ª línea)</MenuItem>
                        <MenuItem value="bass">Fa (4ª línea)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} sm={4} md={2}>
                    <TextField
                      size="small"
                      label="BPM"
                      type="number"
                      value={bpm}
                      inputProps={{ min: 40, max: 220 }}
                      onChange={(e) => setBpm(Number(e.target.value))}
                      helperText="Redondas"
                    />
                  </Grid>

                  <Grid item xs />
                  <Grid item xs={12} md="auto">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={playAll}
                      startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                    >
                      {isPlaying ? "Pausar" : "Reproducir TODOS"}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  7 {intervalData.name} — desde notas naturales (C, D, E, F, G,
                  A, B)
                </Typography>

                <Grid container spacing={2}>
                  {intervals.map((interval, i) => (
                    <Grid
                      item
                      xs={8}
                      sm={4}
                      md={2.67}
                      key={`${interval.symbol}-${i}`}
                    >
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor:
                            playingIndex === i
                              ? "rgba(255,107,53,0.06)"
                              : undefined,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Chip
                              size="small"
                              label={interval.symbol}
                              color={
                                interval.quality === "Justo"
                                  ? "success"
                                  : interval.quality === "Mayor"
                                    ? "primary"
                                    : interval.quality === "Menor"
                                      ? "error"
                                      : interval.quality === "Aumentado"
                                        ? "secondary"
                                        : "warning"
                              }
                            />
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {interval.spelled.join(" → ")}
                            </Typography>
                          </Stack>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => playInterval(i)}
                            startIcon={<PlayArrow />}
                          >
                            Reproducir
                          </Button>
                        </Box>

                        <Box
                          sx={{
                            mb: 1,
                            p: 1,
                            bgcolor: "rgba(0,0,0,0.02)",
                            borderRadius: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            <strong>Desde {interval.root}:</strong>{" "}
                            {interval.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ display: "block", color: "text.secondary" }}
                          >
                            <strong>MIDI:</strong> {interval.midis.join(" → ")}
                          </Typography>
                        </Box>

                        <IntervalCard
                          interval={interval}
                          clef={clef}
                          highlight={playingIndex === i}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
