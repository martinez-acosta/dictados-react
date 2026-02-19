// RitmicaTablaYEntrenador.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  RestartAlt,
  ArrowBack,
  Undo,
  Delete,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as Tone from "tone";
import { Factory, Stave, StaveNote, Formatter, Beam, Voice } from "vexflow";
import FigurasYSilenciosTable, {
  FIGURAS_TABLE,
} from "./FigurasYSilenciosTable";

// ------------------ Audio persistente (sampler + metrónomo + master) ------------------
let masterRef: Tone.Gain | null = null;
let samplerRef: Tone.Sampler | null = null;
let metroRef: Tone.Synth | null = null;

async function ensureAudio() {
  await Tone.start();
  if (!masterRef) masterRef = new Tone.Gain(1).toDestination();

  if (!samplerRef) {
    samplerRef = new Tone.Sampler({
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
      release: 0.8,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).connect(masterRef!);
    await Tone.loaded();
  }
  if (!metroRef) {
    metroRef = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
    }).connect(masterRef!);
  }
}
function releaseAll() {
  try {
    samplerRef?.releaseAll();
  } catch {}
}

// ------------------ Datos base ------------------
const DUR_TO_PULSES: Record<string, number> = Object.fromEntries(
  FIGURAS_TABLE.flatMap((r) => [
    [r.durNota, r.pulsos44],
    [r.durSilencio, r.pulsos44],
  ]),
);

// ------------------ Helpers VexFlow ------------------
function mountCleanTarget(host: HTMLDivElement, id: string) {
  let target = host.querySelector<HTMLDivElement>(`#${id}`);
  if (!target) {
    target = document.createElement("div");
    target.id = id;
    host.replaceChildren(target);
  } else {
    target.replaceChildren();
  }
  return target;
}

function createBeamGroups(notes: StaveNote[]) {
  const beams: Beam[] = [];
  let current: StaveNote[] = [];

  const flush = () => {
    if (current.length > 1) {
      beams.push(new Beam(current));
    }
    current = [];
  };

  notes.forEach((note, idx) => {
    const beamCount =
      typeof note.getBeamCount === "function" ? note.getBeamCount() : 0;
    const isRest =
      typeof note.isRest === "function"
        ? note.isRest()
        : note.getDuration().includes("r");

    if (beamCount === 0 || isRest) {
      flush();
      return;
    }

    current.push(note);

    const next = notes[idx + 1];
    if (!next) {
      flush();
      return;
    }
    const nextBeamCount =
      typeof next.getBeamCount === "function" ? next.getBeamCount() : 0;
    const nextIsRest =
      typeof next.isRest === "function"
        ? next.isRest()
        : next.getDuration().includes("r");

    if (nextBeamCount !== beamCount || nextIsRest) {
      flush();
    }
  });

  flush();
  return beams;
}

// ------------------ VexFlow: medida y "snippet" para paleta ------------------
function VFMeasure({
  notes,
  ts,
  highlight,
}: {
  notes: string[];
  ts: "4/4";
  highlight?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(`vf-meas-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    mountCleanTarget(host, idRef.current);

    const width = 156;
    const height = 94;
    const vf = new Factory({
      renderer: { elementId: idRef.current, width, height },
    });
    const ctx = vf.getContext();
    ctx.scale(0.78, 0.78);
    const stave = new Stave(6, 6, (width - 16) * 1.28);
    stave.addClef("treble").addTimeSignature(ts).setContext(ctx).draw();
    try {
      const vs = notes.map((d, i) => {
        const note = new StaveNote({
          clef: "treble",
          keys: ["b/4"],
          duration: d,
        });
        if (highlight === i)
          note.setStyle({ fillStyle: "#ff6b35", strokeStyle: "#ff6b35" });
        return note;
      });

      const voice = new Voice({ num_beats: 4, beat_value: 4 });
      if (typeof (voice as any).setStrict === "function")
        (voice as any).setStrict(false);
      else if ((Voice as any).Mode)
        (voice as any).setMode((Voice as any).Mode.SOFT);
      voice.addTickables(vs);

      new Formatter({ align_rests: true })
        .joinVoices([voice])
        .format([voice], (width - 26) * 1.28);
      voice.draw(ctx, stave);

      const beams = createBeamGroups(vs);
      beams.forEach((b) => b.setContext(ctx).draw());
    } catch (e) {
      // Si no hay API Groups en la versión, haz un beam simple por pares adyacentes:
      try {
        const all8 = notes
          .map((d, i) => ({ d, i }))
          .filter((x) => x.d === "8")
          .map((x) => x.i);
        for (let k = 0; k < all8.length; k += 2) {
          const i1 = all8[k],
            i2 = all8[k + 1];
          if (i1 != null && i2 != null && i2 === i1 + 1) {
            const vf = document.getElementById(idRef.current) as any;
          }
        }
      } catch {}
      console.warn("VF measure error:", e);
    }
  }, [notes, ts, highlight]);

  return <div ref={hostRef} />;
}

const PAL_W = 79,
  PAL_H = 70,
  PAL_STAVE_X = 4,
  PAL_STAVE_Y = 8,
  PAL_STAVE_W = (PAL_W - 10) * 1.28;
function VFSnippet({ durations }: { durations: string[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef(`vf-snip-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    mountCleanTarget(host, idRef.current);

    const vf = new Factory({
      renderer: { elementId: idRef.current, width: PAL_W, height: PAL_H },
    });
    const ctx = vf.getContext();
    ctx.scale(0.78, 0.78);
    const stave = new Stave(PAL_STAVE_X, PAL_STAVE_Y, PAL_STAVE_W);
    stave.addClef("treble").setContext(ctx).draw();
    try {
      const notes = durations.map(
        (d) => new StaveNote({ clef: "treble", keys: ["b/4"], duration: d }),
      );
      const voice = new Voice({ num_beats: 4, beat_value: 4 });
      if (typeof (voice as any).setStrict === "function")
        (voice as any).setStrict(false);
      else if ((Voice as any).Mode)
        (voice as any).setMode((Voice as any).Mode.SOFT);
      voice.addTickables(notes);

      new Formatter({ align_rests: true })
        .joinVoices([voice])
        .format([voice], PAL_STAVE_W - 6);
      voice.draw(ctx, stave);

      const beams = createBeamGroups(notes);
      beams.forEach((b) => b.setContext(ctx).draw());
    } catch (e) {
      console.warn("VF snippet error:", e);
    }
  }, [durations]);

  return <div ref={hostRef} style={{ width: PAL_W, height: PAL_H }} />;
}

// ------------------ Utilidades (entrenador) ------------------
type Medida = { notes: string[] };
function totalPulses(ds: string[]) {
  return ds.reduce((a, d) => a + (DUR_TO_PULSES[d] || 0), 0);
}

// Unidades disponibles (notas)
const UNITS_NOTES: { name: string; add: string[]; pulses: number }[] = [
  { name: "Redonda", add: ["w"], pulses: 4 },
  { name: "Blanca", add: ["h"], pulses: 2 },
  { name: "Negra", add: ["q"], pulses: 1 },
  { name: "Doble corchea", add: ["8", "8"], pulses: 1 }, // ← 2 corcheas como una unidad
];

// Unidades disponibles (silencios equivalentes)
const UNITS_RESTS: { name: string; add: string[]; pulses: number }[] = [
  { name: "Silencio de redonda", add: ["wr"], pulses: 4 },
  { name: "Silencio de blanca", add: ["hr"], pulses: 2 },
  { name: "Silencio de negra", add: ["qr"], pulses: 1 }, // ← equivalente a doble corchea
];

// Genera exactamente 4/4; si se permiten silencios, evita “todo silencios” y dos seguidos
function generateMeasureBasic4(includeRests: boolean): Medida {
  const target = 4;
  const seq: string[] = [];
  let sum = 0;
  let lastWasRest = false;

  while (sum < target - 1e-6) {
    const rem = +(target - sum).toFixed(3);
    const candNotes = UNITS_NOTES.filter((u) => u.pulses <= rem + 1e-6);
    const candRests = includeRests
      ? UNITS_RESTS.filter((u) => u.pulses <= rem + 1e-6)
      : [];

    let pick: { add: string[]; pulses: number } | undefined;
    if (
      !includeRests ||
      lastWasRest ||
      seq.length === 0 ||
      candRests.length === 0
    ) {
      pick = candNotes[Math.floor(Math.random() * candNotes.length)];
    } else {
      pick =
        Math.random() < 0.7
          ? candNotes[Math.floor(Math.random() * candNotes.length)]
          : candRests[Math.floor(Math.random() * candRests.length)];
    }
    if (!pick) pick = candNotes[0] || candRests[0];

    const will = sum + pick.pulses;
    if (will <= target + 1e-6) {
      seq.push(...pick.add);
      sum = +(sum + pick.pulses).toFixed(3);
      lastWasRest = pick.add.every((d) => d.endsWith("r"));
    } else {
      break;
    }
  }

  // Garantía: al menos una nota si se incluyeron silencios
  if (includeRests && seq.every((d) => d.endsWith("r"))) {
    // Cambia el primer grupo por una negra
    return { notes: ["q", "q", "q", "q"] };
  }
  return { notes: seq };
}

function equalArrays(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// ------------------ Componente principal ------------------
export default function RitmicaTablaYEntrenador() {
  const navigate = useNavigate();
  const timeoutsRef = useRef<number[]>([]);

  // Total de compases disponibles en cada ejercicio
  const barsCount = 4 as const;

  const [bpm, setBpm] = useState(60);
  const [repeats, setRepeats] = useState<number>(5);
  const [includeRests, setIncludeRests] = useState<boolean>(true);
  const [solution, setSolution] = useState<Medida[]>([]);
  const [answers, setAnswers] = useState<Medida[]>([]);
  const [activeBar, setActiveBar] = useState(0);
  const [graded, setGraded] = useState<boolean[]>([]);
  const [showSolution, setShowSolution] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0); // 0..3
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null);
  const [currentBar, setCurrentBar] = useState<number | null>(null);

  const target = 4;

  useEffect(() => {
    nuevaSecuencia();
    return () => {
      pauseAll(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearTimers() {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }

  function pauseAll(silent = false) {
    clearTimers();
    releaseAll();
    if (masterRef) masterRef.gain.rampTo(0, 0.02);
    if (!silent) setIsPlaying(false);
    setCurrentBeat(0);
    setCurrentNoteIndex(null);
    setCurrentBar(null);
  }

  function nuevaSecuencia() {
    const sol = Array.from({ length: barsCount }, () =>
      generateMeasureBasic4(includeRests),
    );
    setSolution(sol);
    setAnswers(Array.from({ length: barsCount }, () => ({ notes: [] })));
    setActiveBar(0);
    setGraded(Array(barsCount).fill(false));
    // setShowSolution(false) // Removido para que mantenga el estado del usuario
    pauseAll(true);
  }

  function addToActive(durs: string[] | string) {
    const durations = Array.isArray(durs) ? durs : [durs];
    setAnswers((prev) => {
      const copy = prev.map((m) => ({ notes: [...m.notes] }));
      const current = copy[activeBar];
      const sum = current.notes.reduce(
        (a, d) => a + (DUR_TO_PULSES[d] || 0),
        0,
      );
      const addVal = totalPulses(durations);
      if (sum + addVal <= target + 1e-6) {
        current.notes.push(...durations);
      }
      return copy;
    });
  }
  function undoActive() {
    setAnswers((prev) => {
      const copy = prev.map((m) => ({ notes: [...m.notes] }));
      copy[activeBar].notes.pop();
      return copy;
    });
  }
  function clearActive() {
    setAnswers((prev) => {
      const copy = prev.map((m) => ({ notes: [...m.notes] }));
      copy[activeBar].notes = [];
      return copy;
    });
  }

  const allComplete = useMemo(
    () =>
      answers.every(
        (m) =>
          Math.abs(
            m.notes.reduce((a, d) => a + (DUR_TO_PULSES[d] || 0), 0) - target,
          ) < 1e-6,
      ),
    [answers],
  );

  function calificar() {
    const res = answers.map((m, i) => equalArrays(m.notes, solution[i].notes));
    setGraded(res);
    setShowSolution(true);
  }

  async function playSequence(seq: Medida[], reps = repeats, barOffset = 0) {
    if (!seq.length) return;
    await ensureAudio();

    if (masterRef) masterRef.gain.rampTo(1, 0.03);
    clearTimers();
    releaseAll();
    setIsPlaying(true);
    setCurrentBeat(0);
    setCurrentNoteIndex(null);
    setCurrentBar(null);

    const base = 60 / Math.max(30, Math.min(240, bpm));
    const safeReps = Math.max(1, Math.min(6, reps));
    let acc = 0;

    for (let r = 0; r < safeReps; r++) {
      // Conteo inicial en la primera repetición
      if (r === 0) {
        for (let i = 0; i < 4; i++) {
          const to = window.setTimeout(
            () => {
              metroRef!.triggerAttackRelease(i === 0 ? "A5" : "F5", "16n");
              setCurrentBeat(i);
              setCurrentBar(null);
              setCurrentNoteIndex(null);
            },
            (acc + i * base) * 1000,
          );
          timeoutsRef.current.push(to);
        }
        acc += base * 4;
      }

      for (let localIndex = 0; localIndex < seq.length; localIndex++) {
        const measure = seq[localIndex];
        const globalIndex = barOffset + localIndex;
        const measureStart = acc;

        // Marca el inicio del compás y limpia el resaltado previo
        const startTo = window.setTimeout(() => {
          setCurrentBar(globalIndex);
          setCurrentNoteIndex(null);
        }, measureStart * 1000);
        timeoutsRef.current.push(startTo);

        // Metrónomo: click en cada beat del compás
        for (let beat = 0; beat < 4; beat++) {
          const beatTime = measureStart + beat * base;
          const to = window.setTimeout(() => {
            metroRef!.triggerAttackRelease(beat === 0 ? "A5" : "F5", "16n");
            setCurrentBeat(beat);
            setCurrentBar(globalIndex);
          }, beatTime * 1000);
          timeoutsRef.current.push(to);
        }

        // Notas con resaltado
        let noteAcc = 0;
        measure.notes.forEach((dur, idx) => {
          const secs = (DUR_TO_PULSES[dur] || 0) * base;
          const to = window.setTimeout(
            () => {
              setCurrentBar(globalIndex);
              setCurrentNoteIndex(idx);
              if (!dur.endsWith("r")) {
                samplerRef!.triggerAttackRelease(
                  "C4",
                  Math.max(0.06, secs * 0.9),
                );
              }
            },
            (measureStart + noteAcc) * 1000,
          );
          timeoutsRef.current.push(to);
          noteAcc += secs;
        });

        acc += base * 4;
      }

      acc += 0.05;
      acc += base;
    }

    const endTo = window.setTimeout(
      () => {
        setIsPlaying(false);
        setCurrentBeat(0);
        setCurrentNoteIndex(null);
        setCurrentBar(null);
      },
      acc * 1000 + 50,
    );
    timeoutsRef.current.push(endTo);
  }
  // ------------------ Render ------------------
  // Base para la paleta: tomamos las filas de la tabla w, h, q y 8 (usaremos 8 como doble corchea)
  const rowW = FIGURAS_TABLE.find((r) => r.id === "w")!;
  const rowH = FIGURAS_TABLE.find((r) => r.id === "h")!;
  const rowQ = FIGURAS_TABLE.find((r) => r.id === "q")!;
  const row8 = FIGURAS_TABLE.find((r) => r.id === "8")!; // usamos su glifo, pero agregamos dos '8' y silencio 'qr'

  return (
    <Box sx={{ width: "100%", px: 2, pb: 4 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
        >
          Volver al menú
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0b2a50" }}>
          🎵 Figuras & Silencios + Dictado (4 compases)
        </Typography>
      </Stack>

      <Grid>
        <Grid>
          <FigurasYSilenciosTable />
        </Grid>
      </Grid>

      {/* ENTRENAMIENTO */}
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Entrenamiento (4 compases)
            </Typography>

            <TextField
              size="small"
              type="number"
              label="BPM"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              inputProps={{ min: 30, max: 240, step: 1 }}
              sx={{ width: 120 }}
            />

            <TextField
              size="small"
              type="number"
              label="Repeticiones"
              value={repeats}
              onChange={(e) =>
                setRepeats(
                  Math.max(1, Math.min(6, Number(e.target.value) || 1)),
                )
              }
              inputProps={{ min: 1, max: 6, step: 1 }}
              sx={{ width: 150 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={includeRests}
                  onChange={(e) => setIncludeRests(e.target.checked)}
                />
              }
              label="Incluir silencios (en los ejercicios)"
            />

            <Button
              variant="outlined"
              startIcon={<RestartAlt />}
              onClick={nuevaSecuencia}
            >
              Nueva secuencia
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {isPlaying ? (
              <Button
                color="warning"
                variant="contained"
                startIcon={<Pause />}
                onClick={() => pauseAll()}
              >
                Pausar todo
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => playSequence(solution, repeats)}
              >
                Escuchar
              </Button>
            )}
            <Chip
              icon={showSolution ? <Visibility /> : <VisibilityOff />}
              label={showSolution ? "Ocultar solución" : "Ver solución"}
              variant="outlined"
              onClick={() => setShowSolution((v) => !v)}
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Indicador visual del metrónomo */}
        {isPlaying && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              py: 1,
              mb: 2,
              backgroundColor: "rgba(33, 150, 243, 0.08)",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold", mr: 1 }}>
              {bpm} BPM:
            </Typography>
            {[0, 1, 2, 3].map((beat) => (
              <Box
                key={beat}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: currentBeat === beat ? "#2196f3" : "#e0e0e0",
                  transition: "background-color 0.1s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: currentBeat === beat ? "white" : "#666",
                    fontWeight: "bold",
                  }}
                >
                  {beat + 1}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Paleta — redonda, blanca, negra y DOBLE CORCHEA (+ silencios si aplica) */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>
            Figuras: redonda, blanca, negra, doble corchea
            {includeRests ? " + silencios" : ""}
          </Typography>
          <Grid container spacing={1}>
            {/* Redonda */}
            {[rowW, rowH, rowQ].map((r, i) => (
              <Grid
                item
                key={`${r.id}-pal-${i}`}
                xs={6}
                sm={3}
                md={3}
                lg={2.4 as any}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 0.5,
                    cursor: "pointer",
                    minHeight: PAL_H + 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      bgcolor: "rgba(25,118,210,.05)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => addToActive(r.durNota)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <VFSnippet durations={[r.durNota]} />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 8, mt: 0.15 }}
                    >
                      Figura
                    </Typography>
                  </Box>
                </Paper>

                {includeRests && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 0.5,
                      mt: 0.5,
                      cursor: "pointer",
                      minHeight: PAL_H + 13,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        bgcolor: "rgba(25,118,210,.05)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => addToActive(r.durSilencio)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <VFSnippet durations={[r.durSilencio]} />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 8, mt: 0.15 }}
                      >
                        Silencio
                      </Typography>
                    </Box>
                  </Paper>
                )}
              </Grid>
            ))}

            {/* Doble corchea (dos '8' con barra); silencio equivalente: qr */}
            <Grid item key={"double8"} xs={6} sm={3} md={3} lg={2.4 as any}>
              <Paper
                variant="outlined"
                sx={{
                  p: 0.4,
                  cursor: "pointer",
                  minHeight: PAL_H + 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    bgcolor: "rgba(25,118,210,.05)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
                onClick={() => addToActive(["8", "8"])}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <VFSnippet durations={["8", "8"]} />
                  <Typography variant="caption" sx={{ fontSize: 7, mt: 0.12 }}>
                    Doble corchea
                  </Typography>
                </Box>
              </Paper>

              {includeRests && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 0.4,
                    mt: 0.4,
                    cursor: "pointer",
                    minHeight: PAL_H + 11,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      bgcolor: "rgba(25,118,210,.05)",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => addToActive("qr")}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <VFSnippet durations={["qr"]} />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 7, mt: 0.12 }}
                    >
                      Silencio (¼)
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Stack>

        {/* Respuesta — 4 compases */}
        <Box
          sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1, pt: 0.5 }}
        >
          {answers.map((m, idx) => {
            const sum = m.notes.reduce(
              (a, d) => a + (DUR_TO_PULSES[d] || 0),
              0,
            );
            const complete = Math.abs(sum - target) < 1e-6;
            const correct = graded[idx] ?? false;

            return (
              <Paper
                key={`ans-${idx}`}
                variant="outlined"
                onClick={() => setActiveBar(idx)}
                sx={{
                  flex: "1 1 auto",
                  minWidth: "180px",
                  p: 0.75,
                  cursor: "pointer",
                  borderColor: activeBar === idx ? "primary.main" : "divider",
                  borderWidth: activeBar === idx ? 2 : 1,
                  bgcolor:
                    activeBar === idx ? "rgba(25,118,210,.03)" : undefined,
                  "&:hover": {
                    bgcolor:
                      activeBar === idx
                        ? "rgba(25,118,210,.05)"
                        : "rgba(0,0,0,.02)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          activeBar === idx ? "primary.main" : "text.primary",
                      }}
                    >
                      Compás {idx + 1}
                    </Typography>
                    <Chip
                      size="small"
                      label={complete ? "4/4 ✓" : `${sum.toFixed(2)} / 4`}
                      color={complete ? "success" : "default"}
                      variant={complete ? "filled" : "outlined"}
                    />
                    {graded.length > 0 && (
                      <Chip
                        size="small"
                        label={correct ? "Correcto ✓" : "Revisa"}
                        color={correct ? "success" : "warning"}
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        undoActive();
                      }}
                      disabled={activeBar !== idx || m.notes.length === 0}
                      sx={{
                        opacity:
                          activeBar === idx && m.notes.length > 0 ? 1 : 0.3,
                      }}
                    >
                      <Undo fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearActive();
                      }}
                      disabled={activeBar !== idx || m.notes.length === 0}
                      sx={{
                        opacity:
                          activeBar === idx && m.notes.length > 0 ? 1 : 0.3,
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={(e) => {
                        e.stopPropagation();
                        pauseAll(true);
                        playSequence([solution[idx]], repeats, idx);
                      }}
                      sx={{ ml: 1 }}
                    >
                      Oír
                    </Button>
                  </Stack>
                </Stack>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: showSolution ? 1 : 0,
                  }}
                >
                  <VFMeasure
                    notes={m.notes.length > 0 ? m.notes : ["qr"]}
                    ts="4/4"
                    highlight={
                      isPlaying && idx === currentBar
                        ? (currentNoteIndex ?? undefined)
                        : undefined
                    }
                  />
                </Box>

                {showSolution && (
                  <Box sx={{ borderTop: "1px dashed #ddd", pt: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5, display: "block" }}
                    >
                      💡 Solución correcta:
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <VFMeasure
                        notes={solution[idx].notes}
                        ts="4/4"
                        highlight={
                          isPlaying && idx === currentBar
                            ? (currentNoteIndex ?? undefined)
                            : undefined
                        }
                      />
                    </Box>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              setAnswers(
                Array.from({ length: barsCount }, () => ({ notes: [] })),
              )
            }
          >
            Limpiar todo
          </Button>
          <Button
            variant="contained"
            onClick={calificar}
            disabled={!allComplete}
          >
            Calificar
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
