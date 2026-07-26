import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { ArrowBack, Pause, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  Accidental,
  BarlineType,
  Beam,
  Dot,
  Factory,
  Formatter,
  Stave,
  StaveConnector,
  StaveNote,
  StaveTie,
  Voice,
} from "vexflow";
import * as Tone from "tone";

type Duration = "w" | "h" | "q" | "8";

type ScoreNote = {
  id: string;
  key: string;
  duration: Duration;
  dots?: 1 | 2;
  rest?: boolean;
  tieToNext?: boolean;
};

type Measure = {
  chord: string;
  melody: ScoreNote[];
  bass: ScoreNote[];
  melodyBeams?: number[][];
  bassBeams?: number[][];
};

const n = (
  id: string,
  key: string,
  duration: Duration,
  options: Omit<ScoreNote, "id" | "key" | "duration"> = {},
): ScoreNote => ({ id, key, duration, ...options });

const MEASURES: Measure[] = [
  {
    chord: "Cm7",
    melody: [
      n("m1-m1", "eb/5", "q", { dots: 1 }),
      n("m1-m2", "c/5", "8", { tieToNext: true }),
      n("m1-m3", "c/5", "h", { tieToNext: true }),
    ],
    bass: [
      n("m1-b1", "c/3", "q", { dots: 1 }),
      n("m1-b2", "c/3", "8", { tieToNext: true }),
      n("m1-b3", "c/3", "q"),
      n("m1-b4", "c/3", "q", { tieToNext: true }),
    ],
  },
  {
    chord: "Cm7",
    melody: [
      n("m2-m1", "c/5", "h", { dots: 1, tieToNext: true }),
      n("m2-m2", "c/5", "8"),
      n("m2-m3", "g/4", "8"),
    ],
    bass: [
      n("m2-b1", "c/3", "h"),
      n("m2-b2", "g/2", "q"),
      n("m2-b3", "bb/2", "q"),
    ],
    melodyBeams: [[1, 2]],
  },
  {
    chord: "Cm7",
    melody: [
      n("m3-m1", "eb/5", "8"),
      n("m3-m2", "c/5", "8", { tieToNext: true }),
      n("m3-m3", "c/5", "h", { tieToNext: true }),
      n("m3-m4", "c/5", "8"),
      n("m3-m5", "g/4", "8"),
    ],
    bass: [
      n("m3-b1", "c/3", "q", { dots: 1 }),
      n("m3-b2", "c/3", "8", { tieToNext: true }),
      n("m3-b3", "c/3", "q"),
      n("m3-b4", "c/3", "q", { tieToNext: true }),
    ],
    melodyBeams: [
      [0, 1],
      [3, 4],
    ],
  },
  {
    chord: "Cm7",
    melody: [
      n("m4-m1", "c/5", "8"),
      n("m4-m2", "eb/5", "8"),
      n("m4-m3", "b/4", "q", { rest: true }),
      n("m4-m4", "b/4", "q", { rest: true }),
      n("m4-m5", "b/4", "8", { rest: true }),
      n("m4-m6", "eb/5", "8"),
    ],
    bass: [
      n("m4-b1", "c/3", "h"),
      n("m4-b2", "g/2", "q"),
      n("m4-b3", "bb/2", "q"),
    ],
    melodyBeams: [[0, 1]],
  },
  {
    chord: "Fm7",
    melody: [
      n("m5-m1", "f/5", "q", { dots: 1 }),
      n("m5-m2", "c/5", "8", { tieToNext: true }),
      n("m5-m3", "c/5", "h", { tieToNext: true }),
    ],
    bass: [
      n("m5-b1", "f/3", "q", { dots: 1 }),
      n("m5-b2", "f/3", "8", { tieToNext: true }),
      n("m5-b3", "f/3", "q"),
      n("m5-b4", "f/3", "q", { tieToNext: true }),
    ],
  },
  {
    chord: "Fm7",
    melody: [n("m6-m1", "c/5", "h", { dots: 2 }), n("m6-m2", "f/5", "8")],
    bass: [
      n("m6-b1", "f/3", "h"),
      n("m6-b2", "c/3", "q"),
      n("m6-b3", "eb/3", "q"),
    ],
  },
  {
    chord: "Cm7",
    melody: [
      n("m7-m1", "eb/5", "q", { dots: 1 }),
      n("m7-m2", "c/5", "8", { tieToNext: true }),
      n("m7-m3", "c/5", "q", { dots: 1 }),
      n("m7-m4", "g/4", "8"),
    ],
    bass: [
      n("m7-b1", "c/3", "q", { dots: 1 }),
      n("m7-b2", "c/3", "8", { tieToNext: true }),
      n("m7-b3", "c/3", "q"),
      n("m7-b4", "c/3", "q", { tieToNext: true }),
    ],
  },
  {
    chord: "Cm7",
    melody: [
      n("m8-m1", "c/5", "8"),
      n("m8-m2", "eb/5", "8"),
      n("m8-m3", "b/4", "q", { rest: true }),
      n("m8-m4", "b/4", "h", { rest: true }),
    ],
    bass: [n("m8-b1", "c/3", "w")],
    melodyBeams: [[0, 1]],
  },
  {
    chord: "Ab7",
    melody: [
      n("m9-m1", "b/4", "8", { rest: true }),
      n("m9-m2", "c/5", "8"),
      n("m9-m3", "b/4", "q", { rest: true }),
      n("m9-m4", "d/5", "q", { dots: 1 }),
      n("m9-m5", "c/5", "8"),
    ],
    bass: [n("m9-b1", "ab/2", "w")],
  },
  {
    chord: "G7",
    melody: [
      n("m10-m1", "d/5", "q", { dots: 1 }),
      n("m10-m2", "c/5", "8"),
      n("m10-m3", "eb/5", "8"),
      n("m10-m4", "d/5", "8"),
      n("m10-m5", "f/5", "q"),
    ],
    bass: [n("m10-b1", "g/2", "w")],
    melodyBeams: [[2, 3]],
  },
  {
    chord: "Cm7",
    melody: [n("m11-m1", "c/5", "w", { tieToNext: true })],
    bass: [
      n("m11-b1", "c/3", "q", { dots: 1 }),
      n("m11-b2", "c/3", "8", { tieToNext: true }),
      n("m11-b3", "c/3", "q"),
      n("m11-b4", "c/3", "q", { tieToNext: true }),
    ],
  },
  {
    chord: "Cm7",
    melody: [n("m12-m1", "c/5", "h", { dots: 2 }), n("m12-m2", "g/4", "8")],
    bass: [
      n("m12-b1", "c/3", "h"),
      n("m12-b2", "g/2", "q"),
      n("m12-b3", "bb/2", "q"),
    ],
  },
];

const BASS_LABELS: Record<string, string> = {
  "c/3": "Do3",
  "f/3": "Fa3",
  "eb/3": "Mib3",
  "g/2": "Sol2",
  "bb/2": "Sib2",
  "ab/2": "Lab2",
};

function beatsFor(note: ScoreNote) {
  const base =
    note.duration === "w"
      ? 4
      : note.duration === "h"
        ? 2
        : note.duration === "q"
          ? 1
          : 0.5;
  if (note.dots === 2) return base * 1.75;
  if (note.dots === 1) return base * 1.5;
  return base;
}

function tonePitch(key: string) {
  const match = /^([a-g])(b?)[/]([0-9])$/.exec(key);
  if (!match) return "C2";
  return `${match[1].toUpperCase()}${match[2]}${Number(match[3]) - 1}`;
}

function makeStaveNote(
  spec: ScoreNote,
  clef: "treble" | "bass",
  activeBassNote: string | null,
) {
  const note = new StaveNote({
    clef,
    keys: [spec.rest ? (clef === "bass" ? "d/3" : "b/4") : spec.key],
    duration: `${spec.duration}${"d".repeat(spec.dots ?? 0)}${spec.rest ? "r" : ""}`,
  });

  if (!spec.rest && spec.key.includes("b")) {
    note.addModifier(new Accidental("b"), 0);
  }
  for (let index = 0; index < (spec.dots ?? 0); index += 1) {
    Dot.buildAndAttach([note], { all: true });
  }
  if (clef === "bass" && spec.id === activeBassNote) {
    note.setStyle({ fillStyle: "#d97706", strokeStyle: "#d97706" });
  }
  return note;
}

function connectSystem(context: any, treble: Stave, bass: Stave) {
  new StaveConnector(treble, bass)
    .setType(StaveConnector.type.BRACE)
    .setContext(context)
    .draw();
  new StaveConnector(treble, bass)
    .setType(StaveConnector.type.SINGLE_LEFT)
    .setContext(context)
    .draw();
}

export default function EquinoxStudy() {
  const navigate = useNavigate();
  const scoreRef = useRef<HTMLDivElement | null>(null);
  const synthRef = useRef<Tone.MonoSynth | null>(null);
  const timerRefs = useRef<number[]>([]);
  const [showNoteNames, setShowNoteNames] = useState(true);
  const [bpm, setBpm] = useState(76);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeBassNote, setActiveBassNote] = useState<string | null>(null);

  useEffect(() => {
    const host = scoreRef.current;
    if (!host) return;

    const drawScore = () => {
      host.innerHTML = "";
      if (!host.id) host.id = "equinox-score";

      const width = Math.max(1120, Math.floor(host.clientWidth));
      const systemHeight = 300;
      const height = systemHeight * 3 + 30;
      const vf = new Factory({
        renderer: { elementId: host.id, width, height },
      });
      const context = vf.getContext();
      const noteRefs = new Map<string, StaveNote>();

      for (let systemIndex = 0; systemIndex < 3; systemIndex += 1) {
        const yOffset = systemIndex * systemHeight;
        const trebleY = 34 + yOffset;
        const bassY = 166 + yOffset;
        const left = 24;
        const right = 20;
        const pickupWidth = systemIndex === 0 ? 138 : 0;
        const measureStart = left + pickupWidth;
        const measureWidth = (width - measureStart - right) / 4;
        let connectorTreble: Stave | null = null;
        let connectorBass: Stave | null = null;
        let finalTreble: Stave | null = null;
        let finalBass: Stave | null = null;

        if (systemIndex === 0) {
          const pickupTreble = new Stave(left, trebleY, pickupWidth)
            .addClef("treble")
            .addTimeSignature("4/4");
          const pickupBass = new Stave(left, bassY, pickupWidth).addClef(
            "bass",
          );
          pickupTreble.setEndBarType(BarlineType.REPEAT_BEGIN);
          pickupBass.setEndBarType(BarlineType.REPEAT_BEGIN);
          pickupTreble.setContext(context).draw();
          pickupBass.setContext(context).draw();
          connectSystem(context, pickupTreble, pickupBass);
          connectorTreble = pickupTreble;
          connectorBass = pickupBass;

          const pickupNote = makeStaveNote(
            n("pickup", "g/4", "8"),
            "treble",
            null,
          );
          const pickupVoice = new Voice({ num_beats: 1, beat_value: 8 });
          pickupVoice.addTickable(pickupNote);
          new Formatter().formatToStave([pickupVoice], pickupTreble);
          pickupVoice.draw(context, pickupTreble);
          context.setFont("Georgia", 13, "bold");
          context.setFillStyle("#475569");
          context.fillText(`♩ = ${bpm}`, left + 56, trebleY - 8);
        }

        for (let localIndex = 0; localIndex < 4; localIndex += 1) {
          const measureIndex = systemIndex * 4 + localIndex;
          const measure = MEASURES[measureIndex];
          const x = measureStart + localIndex * measureWidth;
          const treble = new Stave(x, trebleY, measureWidth);
          const bass = new Stave(x, bassY, measureWidth);

          if (localIndex === 0 && systemIndex > 0) {
            treble.addClef("treble");
            bass.addClef("bass");
            connectorTreble = treble;
            connectorBass = bass;
          }
          if (measureIndex === MEASURES.length - 1) {
            treble.setEndBarType(BarlineType.REPEAT_END);
            bass.setEndBarType(BarlineType.REPEAT_END);
          }

          treble.setContext(context).draw();
          bass.setContext(context).draw();
          finalTreble = treble;
          finalBass = bass;

          const melodyNotes = measure.melody.map((spec) => {
            const note = makeStaveNote(spec, "treble", activeBassNote);
            noteRefs.set(spec.id, note);
            return note;
          });
          const bassNotes = measure.bass.map((spec) => {
            const note = makeStaveNote(spec, "bass", activeBassNote);
            noteRefs.set(spec.id, note);
            return note;
          });
          const melodyVoice = new Voice({ num_beats: 4, beat_value: 4 });
          const bassVoice = new Voice({ num_beats: 4, beat_value: 4 });
          melodyVoice.addTickables(melodyNotes);
          bassVoice.addTickables(bassNotes);
          new Formatter({ maxIterations: 10 }).formatToStave(
            [melodyVoice],
            treble,
            { align_rests: true },
          );
          new Formatter({ maxIterations: 10 }).formatToStave([bassVoice], bass);
          melodyVoice.draw(context, treble);
          bassVoice.draw(context, bass);

          (measure.melodyBeams ?? []).forEach((indices) => {
            const notes = indices.map((index) => melodyNotes[index]);
            if (notes.length > 1) new Beam(notes).setContext(context).draw();
          });
          (measure.bassBeams ?? []).forEach((indices) => {
            const notes = indices.map((index) => bassNotes[index]);
            if (notes.length > 1) new Beam(notes).setContext(context).draw();
          });

          context.setFont("Georgia", 18, "bold");
          context.setFillStyle("#17324d");
          context.fillText(measure.chord, bass.getNoteStartX() + 3, bassY - 10);

          if (showNoteNames) {
            context.setFont("Avenir Next", 10, "normal");
            context.setFillStyle("#64748b");
            measure.bass.forEach((spec, index) => {
              if (spec.rest) return;
              const bassNote = bassNotes[index];
              const label = BASS_LABELS[spec.key] ?? spec.key;
              const labelWidth = context.measureText(label).width;
              context.fillText(
                label,
                bassNote.getAbsoluteX() - labelWidth / 2,
                bass.getYForLine(4) + 37,
              );
            });
          }
        }

        if (connectorTreble && connectorBass) {
          if (systemIndex > 0)
            connectSystem(context, connectorTreble, connectorBass);
        }
        if (finalTreble && finalBass) {
          new StaveConnector(finalTreble, finalBass)
            .setType(StaveConnector.type.SINGLE_RIGHT)
            .setContext(context)
            .draw();
        }
      }

      MEASURES.forEach((measure, measureIndex) => {
        (["melody", "bass"] as const).forEach((part) => {
          const specs = measure[part];
          specs.forEach((spec, noteIndex) => {
            if (!spec.tieToNext) return;
            const current = noteRefs.get(spec.id);
            const nextSpec =
              specs[noteIndex + 1] ?? MEASURES[measureIndex + 1]?.[part][0];
            const next = nextSpec ? noteRefs.get(nextSpec.id) : null;
            if (!current || !next || nextSpec.rest) return;
            new StaveTie({
              first_note: current,
              last_note: next,
              first_indices: [0],
              last_indices: [0],
            })
              .setContext(context)
              .draw();
          });
        });
      });
    };

    drawScore();
    const resizeObserver = new ResizeObserver(drawScore);
    resizeObserver.observe(host);
    return () => resizeObserver.disconnect();
  }, [activeBassNote, bpm, showNoteNames]);

  function stopPlayback() {
    timerRefs.current.forEach((timer) => window.clearTimeout(timer));
    timerRefs.current = [];
    synthRef.current?.triggerRelease();
    setIsPlaying(false);
    setActiveBassNote(null);
  }

  async function playBassLine() {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    stopPlayback();
    setIsPlaying(true);
    try {
      await Tone.start();
      if (!synthRef.current) {
        synthRef.current = new Tone.MonoSynth({
          oscillator: { type: "triangle" },
          filter: { type: "lowpass", Q: 2, rolloff: -24 },
          envelope: {
            attack: 0.01,
            decay: 0.08,
            sustain: 0.72,
            release: 0.18,
          },
          filterEnvelope: {
            attack: 0.01,
            decay: 0.12,
            sustain: 0.2,
            release: 0.2,
            baseFrequency: 90,
            octaves: 2.4,
          },
        }).toDestination();
        synthRef.current.volume.value = -9;
      }
    } catch {
      setIsPlaying(false);
      return;
    }

    const beatMs = 60000 / bpm;
    const flattened = MEASURES.flatMap((measure) => measure.bass);
    let beatCursor = 0;

    for (let index = 0; index < flattened.length; index += 1) {
      const spec = flattened[index];
      let length = beatsFor(spec);
      const startBeat = beatCursor;
      beatCursor += beatsFor(spec);

      if (spec.rest) continue;
      while (
        flattened[index]?.tieToNext &&
        flattened[index + 1] &&
        flattened[index + 1].key === spec.key
      ) {
        index += 1;
        length += beatsFor(flattened[index]);
        beatCursor += beatsFor(flattened[index]);
      }

      const timer = window.setTimeout(() => {
        setActiveBassNote(spec.id);
        synthRef.current?.triggerAttackRelease(
          tonePitch(spec.key),
          (length * beatMs * 0.96) / 1000,
        );
      }, startBeat * beatMs);
      timerRefs.current.push(timer);
    }

    timerRefs.current.push(
      window.setTimeout(
        () => {
          setIsPlaying(false);
          setActiveBassNote(null);
        },
        beatCursor * beatMs + 80,
      ),
    );
  }

  useEffect(
    () => () => {
      timerRefs.current.forEach((timer) => window.clearTimeout(timer));
      synthRef.current?.dispose();
    },
    [],
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1.5, md: 3 },
        py: 3,
        background:
          "radial-gradient(circle at 12% 0%, #fef3c7 0, transparent 30%), linear-gradient(145deg, #f8fafc 0%, #e7eef5 100%)",
      }}
    >
      <Stack spacing={2.5} maxWidth="1280px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "Georgia, serif",
                fontWeight: 800,
                color: "#17324d",
                lineHeight: 1,
              }}
            >
              Equinox
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              John Coltrane · partitura fija para estudio de bajo
            </Typography>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid #cbd5e1",
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.88)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="Cm" color="primary" />
              <Chip label="4/4" />
              <Chip label="12 compases" />
              <Chip label="Clave de Fa · 4ª línea" />
              <Chip label="Bajo suena 8va abajo" variant="outlined" />
            </Stack>
            <Box sx={{ flex: 1 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={showNoteNames}
                  onChange={(event) => setShowNoteNames(event.target.checked)}
                />
              }
              label="Nombres de notas"
            />
            <Button
              variant="contained"
              color={isPlaying ? "warning" : "primary"}
              startIcon={isPlaying ? <Pause /> : <PlayArrow />}
              onClick={playBassLine}
            >
              {isPlaying ? "Detener" : "Reproducir bajo"}
            </Button>
          </Stack>

          <Box sx={{ mt: 2, maxWidth: 320 }}>
            <Typography variant="caption" color="text.secondary">
              Tempo: {bpm} BPM
            </Typography>
            <Slider
              size="small"
              min={48}
              max={132}
              step={2}
              value={bpm}
              onChange={(_, value) => {
                stopPlayback();
                setBpm(value as number);
              }}
              aria-label="Tempo"
            />
          </Box>
        </Paper>

        <Paper
          elevation={3}
          sx={{
            overflowX: "auto",
            borderRadius: 3,
            border: "1px solid #d6dee8",
            backgroundColor: "#fffdf8",
          }}
        >
          <Box
            ref={scoreRef}
            id="equinox-score"
            sx={{ minWidth: 1120, minHeight: 930 }}
          />
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,.75)",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            La voz superior conserva la melodía. La voz inferior es la línea de
            bajo escrita en clave de Fa en cuarta línea; al reproducirse suena
            una octava debajo de lo escrito, como el bajo eléctrico.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
