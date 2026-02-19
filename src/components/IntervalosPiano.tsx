import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Paper,
  Box,
  Grid,
  Typography,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Slider,
} from "@mui/material";
import { ArrowBack, PlayArrow, Pause } from "@mui/icons-material";
import * as Tone from "tone";
import { useNavigate } from "react-router-dom";
import { Factory, Stave, StaveNote, TickContext } from "vexflow";

// -------------------------- Sampler (piano) --------------------------
let toneSamplerRef: Tone.Sampler | null = null;
async function ensureSampler() {
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

// -------------------------- Config general --------------------------
const CLEF = "treble";

// Escala: id, label y notas (una octava ascendente) en notación VexFlow (p.ej. 'c#/4')
type Scale = { id: string; label: string; notes: string[] };

// TODAS las escalas mayores en clave de sol (15, incluyendo enarmonías)
const SCALES: Scale[] = [
  {
    id: "C_Major",
    label: "C Mayor (Do mayor) — 0 ♯/♭",
    notes: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"],
  },
  {
    id: "G_Major",
    label: "G Mayor (Sol mayor) — 1 ♯",
    notes: ["g/4", "a/4", "b/4", "c/5", "d/5", "e/5", "f#/5", "g/5"],
  },
  {
    id: "D_Major",
    label: "D Mayor (Re mayor) — 2 ♯",
    notes: ["d/4", "e/4", "f#/4", "g/4", "a/4", "b/4", "c#/5", "d/5"],
  },
  {
    id: "A_Major",
    label: "A Mayor (La mayor) — 3 ♯",
    notes: ["a/4", "b/4", "c#/5", "d/5", "e/5", "f#/5", "g#/5", "a/5"],
  },
  {
    id: "E_Major",
    label: "E Mayor (Mi mayor) — 4 ♯",
    notes: ["e/4", "f#/4", "g#/4", "a/4", "b/4", "c#/5", "d#/5", "e/5"],
  },
  {
    id: "B_Major",
    label: "B Mayor (Si mayor) — 5 ♯",
    notes: ["b/3", "c#/4", "d#/4", "e/4", "f#/4", "g#/4", "a#/4", "b/4"],
  },
  {
    id: "F#_Major",
    label: "F♯ Mayor — 6 ♯",
    notes: ["f#/3", "g#/3", "a#/3", "b/3", "c#/4", "d#/4", "e#/4", "f#/4"],
  },
  {
    id: "C#_Major",
    label: "C♯ Mayor — 7 ♯",
    notes: ["c#/4", "d#/4", "e#/4", "f#/4", "g#/4", "a#/4", "b#/4", "c#/5"],
  },

  {
    id: "F_Major",
    label: "F Mayor (Fa mayor) — 1 ♭",
    notes: ["f/4", "g/4", "a/4", "bb/4", "c/5", "d/5", "e/5", "f/5"],
  },
  {
    id: "Bb_Major",
    label: "B♭ Mayor — 2 ♭",
    notes: ["bb/3", "c/4", "d/4", "eb/4", "f/4", "g/4", "a/4", "bb/4"],
  },
  {
    id: "Eb_Major",
    label: "E♭ Mayor — 3 ♭",
    notes: ["eb/4", "f/4", "g/4", "ab/4", "bb/4", "c/5", "d/5", "eb/5"],
  },
  {
    id: "Ab_Major",
    label: "A♭ Mayor — 4 ♭",
    notes: ["ab/3", "bb/3", "c/4", "db/4", "eb/4", "f/4", "g/4", "ab/4"],
  },
  {
    id: "Db_Major",
    label: "D♭ Mayor — 5 ♭",
    notes: ["db/4", "eb/4", "f/4", "gb/4", "ab/4", "bb/4", "c/5", "db/5"],
  },
  {
    id: "Gb_Major",
    label: "G♭ Mayor — 6 ♭",
    notes: ["gb/3", "ab/3", "bb/3", "cb/4", "db/4", "eb/4", "f/4", "gb/4"],
  },
  {
    id: "Cb_Major",
    label: "C♭ Mayor — 7 ♭",
    notes: ["cb/3", "db/4", "eb/4", "fb/4", "gb/4", "ab/4", "bb/4", "cb/4"],
  },
];

// -------------------------- Utilidades de notas --------------------------
// Para etiqueta bonita
const LETTERS: Record<string, string> = {
  c: "C",
  "c#": "C♯",
  db: "D♭",
  cb: "C♭",
  d: "D",
  "d#": "D♯",
  eb: "E♭",
  e: "E",
  "e#": "E♯",
  fb: "F♭",
  f: "F",
  "f#": "F♯",
  gb: "G♭",
  g: "G",
  "g#": "G♯",
  ab: "A♭",
  a: "A",
  "a#": "A♯",
  bb: "B♭",
  b: "B",
  "b#": "B♯",
};
function spn(vfKey: string) {
  const [s, o] = vfKey.split("/");
  const pretty = LETTERS[s] ?? s.toUpperCase();
  return `${pretty}${o}`;
}

// Mapeo cromático (sin claves duplicadas) + enarmonías comunes
function toMidi(vfKey: string) {
  const [raw, octStr] = vfKey.split("/");
  const o = parseInt(octStr, 10);
  const pcMap: Record<string, number> = {
    c: 0,
    "b#": 0,
    "c#": 1,
    db: 1,
    d: 2,
    "d#": 3,
    eb: 3,
    e: 4,
    fb: 4,
    "e#": 5,
    f: 5,
    "f#": 6,
    gb: 6,
    g: 7,
    "g#": 8,
    ab: 8,
    a: 9,
    "a#": 10,
    bb: 10,
    b: 11,
    cb: 11,
  };
  const pc = pcMap[raw.toLowerCase()];
  return (o + 1) * 12 + (pc ?? 0);
}
function toneName(vfKey: string) {
  const m = toMidi(vfKey);
  const names = [
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
  ];
  return `${names[m % 12]}${Math.floor(m / 12) - 1}`;
}
function buildFullScaleNotes(up: string[]): string[] {
  const asc = [...up];
  const desc = [...up].reverse(); // incluye la tónica alta como pivote
  return [...asc, ...desc];
}
function vfDurFromFigure(fig: "8n" | "4n" | "2n") {
  if (fig === "8n") return "8";
  if (fig === "2n") return "h";
  return "q"; // 4n
}

// -------------------------- Piano visual helpers --------------------------
const PIANO_WHITE_ORDER = ["c", "d", "e", "f", "g", "a", "b"] as const;
const BLACK_AFTER = new Set(["c", "d", "f", "g", "a"]);
function isBlackAfter(n: string) {
  return BLACK_AFTER.has(n);
}
function blackName(n: string) {
  return ({ c: "c#", d: "d#", f: "f#", g: "g#", a: "a#" } as const)[
    n
  ] as string;
}

// -------------------------- Componente --------------------------
export default function EscalasUnaMano() {
  const navigate = useNavigate();
  const [scaleId, setScaleId] = useState<string>(SCALES[0].id);
  const [bpm, setBpm] = useState<number>(80);
  const [figure, setFigure] = useState<"8n" | "4n" | "2n">("4n"); // corchea, negra, blanca
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [highlight, setHighlight] = useState<string | null>(null);

  const staveRef = useRef<HTMLDivElement | null>(null);
  const vfRef = useRef<any>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  const scale = SCALES.find((s) => s.id === scaleId)!;
  const seq = buildFullScaleNotes(scale.notes);

  // Set de MIDIs para marcar teclas de la escala
  const seqMidiSet = new Set(seq.map(toMidi));
  const currentMidi = highlight ? toMidi(highlight) : null;

  // Dibujo del pentagrama
  useEffect(() => {
    drawStaff();
  }, [scaleId, currentIdx, highlight, figure]);

  useEffect(() => {
    return () => {
      stopPlayback(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawStaff() {
    if (!staveRef.current) return;
    staveRef.current.innerHTML = "";

    // 1) Parámetros de métrica/figura
    const FIG_BEATS: Record<"8n" | "4n" | "2n", number> = {
      "8n": 0.5,
      "4n": 1,
      "2n": 2,
    };
    const beatsPerNote = FIG_BEATS[figure] ?? 1;
    const vfDur = figure === "8n" ? "8" : figure === "2n" ? "h" : "q";

    // 2) Layout básico (ancho proporcional a beats totales)
    const totalBeats = seq.length * beatsPerNote;
    const width = Math.max(720, Math.ceil(120 + totalBeats * 60)); // ~60px por beat
    vfRef.current = new Factory({
      renderer: { elementId: "escala-una-mano-stave", width, height: 230 },
    });
    const ctx = vfRef.current.getContext();
    const stave = new Stave(10, 20, width - 20);
    stave.addClef(CLEF).addTimeSignature("4/4");
    stave.setContext(ctx).draw();

    // 3) Cálculo de posiciones por beat
    const startX = stave.getNoteStartX() - 20;
    const endX = stave.getX() + stave.getWidth() - 40;
    const avail = endX - startX;
    const beatW = avail / totalBeats;

    // 4) Pintar notas (verde; naranja si es la actual)
    let currentBeat = 0;
    let highlightX: number | null = null;
    let highlightLabel = "";

    seq.forEach((k, i) => {
      const n = new StaveNote({ clef: CLEF, keys: [k], duration: vfDur });

      if (highlight === k && i === currentIdx) {
        // Naranja: nota actual
        n.setStyle({ fillStyle: "#ff6b35", strokeStyle: "#ff6b35" });
      } else {
        // Verde: resto de notas de la escala
        n.setStyle({ fillStyle: "#43a047", strokeStyle: "#43a047" });
      }

      n.setStave(stave).setContext(ctx);
      const tc = new TickContext();
      const centerX = startX + currentBeat * beatW + (beatsPerNote * beatW) / 2;
      tc.addTickable(n).preFormat().setX(centerX);
      n.setTickContext(tc);
      n.draw();

      if (highlight === k && i === currentIdx) {
        highlightX = centerX;
        highlightLabel = `♪ ${spn(k)} / ${toneName(k)}`;
      }

      currentBeat += beatsPerNote;
    });

    // 5) Dibujar líneas de compás (cada 4 beats)
    const topY = stave.getYForLine(0);
    const botY = stave.getYForLine(4);
    for (let b = 4; b < totalBeats; b += 4) {
      const barX = startX + b * beatW;
      ctx.beginPath();
      ctx.moveTo(barX, topY);
      ctx.lineTo(barX, botY);
      ctx.strokeStyle = "#999";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 6) Texto con el nombre de la nota actual sobre el pentagrama (canvas puro, sin Annotation)
    if (highlightX !== null) {
      const c2d = (ctx as any).context as CanvasRenderingContext2D | undefined;
      if (c2d) {
        c2d.save();
        c2d.font = "bold 12px Arial";
        c2d.fillStyle = "#ff6b35";
        c2d.textAlign = "center";
        // Un poco por encima de la línea superior del pentagrama
        const textY = topY - 12;
        c2d.fillText(highlightLabel, highlightX, textY);
        c2d.restore();
      } else {
        // Fallback para otros contextos (SVG): usar API de VexFlow si está disponible
        try {
          // @ts-ignore - VexFlow CanvasContext suele exponer setFont / fillText
          ctx.setFont("Arial", 12, "bold");
          // @ts-ignore
          ctx.setFillStyle("#ff6b35");
          // @ts-ignore
          ctx.fillText(highlightLabel, highlightX, topY - 12);
        } catch {}
      }
    }
  }

  async function startPlayback() {
    if (isPlaying) return;
    await ensureSampler();
    Tone.Transport.bpm.value = bpm;

    // Reinicia loop si existiera
    loopRef.current?.stop();
    loopRef.current?.dispose();
    let i = 0;

    const noteDurSeconds = Tone.Time(figure).toSeconds() * 0.9;
    loopRef.current = new Tone.Loop((time) => {
      const k = seq[i];
      setCurrentIdx(i);
      setHighlight(k);
      toneSamplerRef!.triggerAttackRelease(toneName(k), noteDurSeconds, time);
      i = (i + 1) % seq.length;
    }, figure);

    loopRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  }

  function stopPlayback(silent = false) {
    loopRef.current?.stop();
    loopRef.current?.dispose();
    loopRef.current = null;
    Tone.Transport.stop();
    if (!silent) setIsPlaying(false);
    setCurrentIdx(0);
    setHighlight(null);
  }

  // Si cambia BPM, figura o escala mientras reproduce, reinicia el loop
  useEffect(() => {
    if (!isPlaying) return;
    (async () => {
      stopPlayback(true);
      await startPlayback();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, figure, scaleId]);

  // Piano visual: C2–B5
  const WHITE_KEYS: {
    name: string;
    octave: number;
    id: string;
    midi: number;
  }[] = [];
  for (let oct = 2; oct <= 5; oct++) {
    for (const n of PIANO_WHITE_ORDER) {
      const id = `${n}/${oct}`;
      WHITE_KEYS.push({ name: n, octave: oct, id, midi: toMidi(id) });
    }
  }

  return (
    <Container maxWidth="xl" sx={{ pb: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            🎹 Escalas de piano — 1 mano (clave de Sol)
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="scale-label">Escala</InputLabel>
                <Select
                  labelId="scale-label"
                  label="Escala"
                  value={scaleId}
                  onChange={(e) => setScaleId(e.target.value)}
                >
                  {SCALES.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                BPM: {bpm}
              </Typography>
              <Slider
                value={bpm}
                min={40}
                max={200}
                step={1}
                onChange={(_, v) => setBpm(v as number)}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="fig-label">Figura</InputLabel>
                <Select
                  labelId="fig-label"
                  label="Figura"
                  value={figure}
                  onChange={(e) =>
                    setFigure(e.target.value as "8n" | "4n" | "2n")
                  }
                >
                  <MenuItem value="8n">Corchea (♪)</MenuItem>
                  <MenuItem value="4n">Negra (♩)</MenuItem>
                  <MenuItem value="2n">Blanca (𝅗𝅥)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color={isPlaying ? "warning" : "primary"}
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
                >
                  {isPlaying ? "Detener" : "Reproducir (∞)"}
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label="Verde: notas de la escala"
                  color="success"
                  size="small"
                />
                <Chip
                  label="Naranja: nota actual"
                  color="warning"
                  size="small"
                />
                {highlight && (
                  <Chip
                    label={`Ahora: ${spn(highlight)} (${toneName(highlight)})`}
                    size="small"
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Pentagrama */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            Pentagrama (VexFlow) — escala completa ascendente y descendente
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <div id="escala-una-mano-stave" ref={staveRef} />
          </Box>
        </Paper>

        {/* Piano visual */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            Piano (C2–B5). Verde = teclas de la escala, Naranja = nota actual.
          </Typography>

          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 240,
                mx: 0,
                userSelect: "none",
              }}
            >
              {/* Blancas */}
              <Box sx={{ display: "flex", height: "100%" }}>
                {WHITE_KEYS.map((k, i) => {
                  const active = seqMidiSet.has(k.midi);
                  const isNow = currentMidi !== null && k.midi === currentMidi;
                  return (
                    <Box
                      key={i}
                      sx={{
                        flex: "1 1 0",
                        border: "1px solid #333",
                        backgroundColor: isNow
                          ? "rgba(255,107,53,0.95)" // Naranja actual
                          : active
                            ? "rgba(76,175,80,0.25)" // Verde escala
                            : "#fff",
                        position: "relative",
                      }}
                      title={`${k.name.toUpperCase()}${k.octave}`}
                    />
                  );
                })}
              </Box>

              {/* Negras */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  height: "64%",
                  display: "flex",
                  pointerEvents: "none",
                }}
              >
                {WHITE_KEYS.map((k, i) => {
                  if (!isBlackAfter(k.name))
                    return (
                      <Box
                        key={i}
                        sx={{ flex: "1 1 0", position: "relative" }}
                      />
                    );
                  const bn = blackName(k.name);
                  const id = `${bn}/${k.octave}`;
                  const midi = toMidi(id);
                  const active = seqMidiSet.has(midi);
                  const isNow = currentMidi !== null && midi === currentMidi;
                  return (
                    <Box key={i} sx={{ flex: "1 1 0", position: "relative" }}>
                      <Box
                        sx={{
                          position: "absolute",
                          left: "65%",
                          transform: "translateX(-50%)",
                          width: "60%",
                          height: "100%",
                          border: "1px solid #000",
                          backgroundColor: isNow
                            ? "rgba(255,107,53,0.95)"
                            : active
                              ? "rgba(76,175,80,0.9)"
                              : "#000",
                        }}
                        title={`${bn.toUpperCase()}${k.octave}`}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
