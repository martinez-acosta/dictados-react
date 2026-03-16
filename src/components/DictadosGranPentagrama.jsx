import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  DeleteOutline,
  Pause,
  PlayArrow,
  RestartAlt,
  Undo,
} from "@mui/icons-material";
import { Factory, Stave, StaveConnector, StaveNote, TickContext } from "vexflow";
import { useNavigate } from "react-router-dom";
import {
  CLEF_CONFIGS,
  DURATIONS,
  audioContext,
  clamp,
  clickMetronome,
  ensureAudio,
  freqOfKey,
  getLoadedSampler,
  labelSPN,
  labelSolfege,
  loadYamahaSampler,
  makeRandomStudyBlock,
  parseNoteInput,
  pianoLike,
  stopAllSounds,
} from "./dictationShared";

const BLOCK_PATTERN = ["treble", "bass", "treble"];
const BLOCK_SIZE_OPTIONS = [2, 4, 6, 8];
const STAFF_CANVAS_WIDTH = 1220;
const STAFF_CANVAS_HEIGHT = 390;
const STAVE_X = 92;
const STAVE_WIDTH = 1060;
const TREBLE_Y = 34;
const BASS_Y = 236;

const CLEF_LABELS = {
  treble: "Sol",
  bass: "Fa",
};

const CLEF_LONG_LABELS = {
  treble: "Clave de Sol",
  bass: "Clave de Fa",
};

function buildGrandStaffDictation(blockSize) {
  return BLOCK_PATTERN.flatMap((clef, blockIndex) =>
    makeRandomStudyBlock(blockSize, clef).map((key) => ({
      key,
      clef,
      blockIndex,
    })),
  );
}

function findNextEmptyIndex(notes, currentIdx) {
  for (let index = currentIdx + 1; index < notes.length; index += 1) {
    if (!notes[index]) return index;
  }
  for (let index = 0; index < notes.length; index += 1) {
    if (!notes[index]) return index;
  }
  return Math.min(Math.max(0, notes.length - 1), currentIdx);
}

function getExerciseRange(clef) {
  return CLEF_CONFIGS[clef].studyRange?.length
    ? CLEF_CONFIGS[clef].studyRange
    : CLEF_CONFIGS[clef].rangeKeys;
}

export default function DictadosGranPentagrama() {
  const navigate = useNavigate();
  const [blockSize, setBlockSize] = useState(4);
  const [bpm, setBpm] = useState(60);
  const [dur, setDur] = useState("q");
  const [mode, setMode] = useState("train");
  const [engine, setEngine] = useState("yamaha");
  const [dictationNotes, setDictationNotes] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [userInputs, setUserInputs] = useState([]);
  const [status, setStatus] = useState(
    "Listo: genera un dictado y responde por bloques Sol → Fa → Sol.",
  );
  const [mask, setMask] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingNote, setCurrentPlayingNote] = useState(-1);
  const [currentNoteDisplay, setCurrentNoteDisplay] = useState({
    spn: "",
    solfege: "",
    show: false,
  });
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [metronomeBeat, setMetronomeBeat] = useState(0);

  const playIntervalRef = useRef(null);
  const playTimeoutsRef = useRef([]);
  const metronomeIntervalRef = useRef(null);
  const wrapModel = useRef(null);
  const wrapAnswer = useRef(null);
  const answerMetricsRef = useRef(null);
  const inputRefs = useRef([]);

  const totalNotes = blockSize * BLOCK_PATTERN.length;
  const activeSlot = dictationNotes[activeIdx];
  const activeBlock = activeSlot ? activeSlot.blockIndex + 1 : 1;
  const expectedClef = activeSlot?.clef ?? BLOCK_PATTERN[0];
  const answeredCount = userNotes.filter(Boolean).length;
  const correctCount = mask ? mask.filter(Boolean).length : 0;

  const blockSummary = useMemo(
    () =>
      BLOCK_PATTERN.map((clef, index) => ({
        clef,
        index,
        start: index * blockSize,
        end: (index + 1) * blockSize,
      })),
    [blockSize],
  );

  const clearPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentPlayingNote(-1);
    setCurrentNoteDisplay({ spn: "", solfege: "", show: false });
    setMetronomeActive(false);
    playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    playTimeoutsRef.current = [];
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
    }
    stopAllSounds();
  }, []);

  const newDictation = useCallback(() => {
    clearPlayback();
    const nextDictation = buildGrandStaffDictation(blockSize);
    setDictationNotes(nextDictation);
    setUserNotes(Array(nextDictation.length).fill(null));
    setUserInputs(Array(nextDictation.length).fill(""));
    setMask(null);
    setActiveIdx(0);
    setStatus(
      `Nuevo dictado de ${nextDictation.length} notas en patrón Sol → Fa → Sol (${blockSize} por bloque).`,
    );
  }, [blockSize, clearPlayback]);

  useEffect(() => {
    newDictation();
  }, [newDictation]);

  useEffect(() => () => clearPlayback(), [clearPlayback]);

  const drawGrandStaff = useCallback(
    ({ targetRef, elementId, notes, activeIndex, evaluationMask, hideNotes }) => {
      if (!targetRef.current) return null;

      targetRef.current.innerHTML = "";
      const vf = new Factory({
        renderer: {
          elementId,
          width: STAFF_CANVAS_WIDTH,
          height: STAFF_CANVAS_HEIGHT,
        },
      });
      const context = vf.getContext();
      const trebleStave = new Stave(STAVE_X, TREBLE_Y, STAVE_WIDTH);
      const bassStave = new Stave(STAVE_X, BASS_Y, STAVE_WIDTH);

      trebleStave.addClef("treble").addTimeSignature("4/4");
      bassStave.addClef("bass").addTimeSignature("4/4");

      trebleStave.setContext(context).draw();
      bassStave.setContext(context).draw();

      new StaveConnector(trebleStave, bassStave)
        .setType(StaveConnector.type.BRACE)
        .setContext(context)
        .draw();
      new StaveConnector(trebleStave, bassStave)
        .setType(StaveConnector.type.SINGLE_LEFT)
        .setContext(context)
        .draw();
      new StaveConnector(trebleStave, bassStave)
        .setType(StaveConnector.type.SINGLE_RIGHT)
        .setContext(context)
        .draw();

      const slots = Math.max(1, notes.length || totalNotes);
      const startX = trebleStave.getNoteStartX() + 2;
      const endX = trebleStave.getX() + trebleStave.getWidth() - 24;
      const availableWidth = endX - startX;
      const blockWidth = availableWidth / BLOCK_PATTERN.length;
      const leftPadding = Math.min(10, blockWidth * 0.04);
      const rightPadding = Math.min(34, blockWidth * 0.14);
      const usableBlockWidth = Math.max(
        blockWidth - leftPadding - rightPadding,
        blockWidth * 0.68,
      );
      const positions = [];

      if (typeof context.save === "function") {
        context.save();
      }
      if (typeof context.setFillStyle === "function") {
        context.setFillStyle("#475569");
      }
      if (typeof context.setFont === "function") {
        context.setFont("14px Georgia");
      }
      blockSummary.forEach((block) => {
        const blockX = startX + block.index * blockWidth + blockWidth * 0.18;
        context.fillText(
          `Bloque ${block.index + 1} · ${CLEF_LONG_LABELS[block.clef]}`,
          blockX,
          TREBLE_Y - 12,
        );
      });
      if (typeof context.restore === "function") {
        context.restore();
      }

      for (let index = 0; index < slots; index += 1) {
        const slot = notes[index];
        const expectedSlot = slot ?? dictationNotes[index];
        const resolvedBlockIndex =
          expectedSlot?.blockIndex ?? Math.floor(index / Math.max(1, blockSize));
        const slotInBlock = index % Math.max(1, blockSize);
        const blockStartX =
          startX + resolvedBlockIndex * blockWidth + leftPadding;
        const blockEndX =
          startX + (resolvedBlockIndex + 1) * blockWidth - rightPadding;
        const noteX =
          blockSize === 1
            ? (blockStartX + blockEndX) / 2
            : blockStartX +
              (slotInBlock / (blockSize - 1)) * (blockEndX - blockStartX);

        positions.push({
          x: noteX,
          clef: expectedSlot?.clef ?? BLOCK_PATTERN[resolvedBlockIndex],
          blockIndex: resolvedBlockIndex,
        });

        if (!hideNotes && slot?.key) {
          const note = new StaveNote({
            clef: CLEF_CONFIGS[slot.clef].vexflowClef,
            keys: [slot.key],
            duration: dur,
          });

          if (evaluationMask && typeof evaluationMask[index] === "boolean") {
            const color = evaluationMask[index] ? "#15803d" : "#dc2626";
            note.setStyle({ fillStyle: color, strokeStyle: color });
          } else if (currentPlayingNote === index) {
            note.setStyle({ fillStyle: "#c2410c", strokeStyle: "#c2410c" });
          }

          note.setStave(slot.clef === "treble" ? trebleStave : bassStave);
          note.setContext(context);
          const tickContext = new TickContext();
          tickContext.addTickable(note).preFormat().setX(noteX);
          note.setTickContext(tickContext);
          note.draw();
        }
      }

      for (let blockIndex = 1; blockIndex < BLOCK_PATTERN.length; blockIndex += 1) {
        const barX = startX + blockIndex * blockWidth;
        context.beginPath();
        context.moveTo(barX, trebleStave.getYForLine(0));
        context.lineTo(barX, bassStave.getYForLine(4));
        context.strokeStyle = "#1d4ed8";
        context.lineWidth = 1.8;
        context.stroke();
      }

      for (let index = 4; index < positions.length; index += 4) {
        if (index % blockSize === 0 || !positions[index - 1] || !positions[index]) {
          continue;
        }
        const barX = (positions[index - 1].x + positions[index].x) / 2;
        context.beginPath();
        context.moveTo(barX, trebleStave.getYForLine(0));
        context.lineTo(barX, bassStave.getYForLine(4));
        context.strokeStyle = "#94a3b8";
        context.lineWidth = 1;
        context.stroke();
      }

      if (activeIndex >= 0 && positions[activeIndex]) {
        const cursorX = positions[activeIndex].x;
        context.beginPath();
        context.moveTo(cursorX, trebleStave.getYForLine(0) - 14);
        context.lineTo(cursorX, bassStave.getYForLine(4) + 14);
        context.strokeStyle = "#c2410c";
        context.lineWidth = 2;
        context.stroke();
      }

      return {
        trebleStave,
        bassStave,
        positions,
      };
    },
    [blockSize, blockSummary, dictationNotes, dur, totalNotes, currentPlayingNote],
  );

  useEffect(() => {
    drawGrandStaff({
      targetRef: wrapModel,
      elementId: "grand-staff-model",
      notes: mode === "exam" ? [] : dictationNotes,
      activeIndex: mode === "exam" ? -1 : currentPlayingNote,
      evaluationMask: null,
      hideNotes: mode === "exam",
    });
  }, [dictationNotes, mode, drawGrandStaff, currentPlayingNote]);

  useEffect(() => {
    answerMetricsRef.current = drawGrandStaff({
      targetRef: wrapAnswer,
      elementId: "grand-staff-answer",
      notes: userNotes,
      activeIndex: activeIdx,
      evaluationMask: mask,
      hideNotes: false,
    });
  }, [userNotes, activeIdx, mask, drawGrandStaff]);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function resolveClickedClef(localY) {
    const metrics = answerMetricsRef.current;
    if (!metrics) return null;

    const trebleTop = metrics.trebleStave.getYForLine(0) - 18;
    const trebleBottom = metrics.trebleStave.getYForLine(4) + 18;
    const bassTop = metrics.bassStave.getYForLine(0) - 18;
    const bassBottom = metrics.bassStave.getYForLine(4) + 18;

    if (localY >= trebleTop && localY <= trebleBottom) return "treble";
    if (localY >= bassTop && localY <= bassBottom) return "bass";

    const trebleCenter = (trebleTop + trebleBottom) / 2;
    const bassCenter = (bassTop + bassBottom) / 2;
    return Math.abs(localY - trebleCenter) <= Math.abs(localY - bassCenter)
      ? "treble"
      : "bass";
  }

  function keyFromStaffY(localY, clef) {
    const metrics = answerMetricsRef.current;
    const stave =
      clef === "treble" ? metrics?.trebleStave : metrics?.bassStave;
    const exerciseRange = getExerciseRange(clef);
    if (!stave) return exerciseRange[0];

    const order = exerciseRange;
    const refNote = CLEF_CONFIGS[clef].firstLineNote;
    const refIndex = order.indexOf(refNote);
    const lineDist = Math.abs(stave.getYForLine(4) - stave.getYForLine(3));
    const baseY = stave.getYForLine(4);

    let best = order[0];
    let bestDistance = Number.POSITIVE_INFINITY;
    order.forEach((candidate, index) => {
      const candidateY = baseY - (index - refIndex) * (lineDist / 2);
      const distance = Math.abs(localY - candidateY);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    });

    return best;
  }

  function commitNoteAtIndex(index, noteObject, inputValue) {
    const nextNotes = [...userNotes];
    const nextInputs = [...userInputs];
    nextNotes[index] = noteObject;
    nextInputs[index] = inputValue;
    setUserNotes(nextNotes);
    setUserInputs(nextInputs);
    setMask(null);
    setActiveIdx(findNextEmptyIndex(nextNotes, index));
  }

  function onClickStaff(event) {
    if (!dictationNotes.length || !wrapAnswer.current) return;
    const canvas = wrapAnswer.current.querySelector("canvas");
    if (!canvas) return;

    const expected = dictationNotes[activeIdx];
    if (!expected) return;

    const rect = canvas.getBoundingClientRect();
    const localY = event.clientY - rect.top;
    const clickedClef = resolveClickedClef(localY);

    if (clickedClef !== expected.clef) {
      setStatus(
        `La nota #${activeIdx + 1} está en el bloque ${expected.blockIndex + 1} (${CLEF_LONG_LABELS[expected.clef]}). Haz clic en ese pentagrama.`,
      );
      return;
    }

    const key = keyFromStaffY(localY, clickedClef);
    commitNoteAtIndex(
      activeIdx,
      {
        key,
        clef: expected.clef,
        blockIndex: expected.blockIndex,
      },
      labelSPN(key),
    );
    setStatus(
      `Nota #${activeIdx + 1} colocada en ${labelSPN(key)} (${labelSolfege(key)}).`,
    );
  }

  function undo() {
    if (!userNotes.length) return;
    const targetIndex = userNotes[activeIdx]
      ? activeIdx
      : Math.max(
          0,
          activeIdx - 1 >= 0 && userNotes[activeIdx - 1] ? activeIdx - 1 : 0,
        );
    let resolvedIndex = targetIndex;
    while (resolvedIndex > 0 && !userNotes[resolvedIndex]) {
      resolvedIndex -= 1;
    }
    if (!userNotes[resolvedIndex]) return;

    const nextNotes = [...userNotes];
    const nextInputs = [...userInputs];
    nextNotes[resolvedIndex] = null;
    nextInputs[resolvedIndex] = "";
    setUserNotes(nextNotes);
    setUserInputs(nextInputs);
    setMask(null);
    setActiveIdx(resolvedIndex);
    setStatus(`Se eliminó la nota #${resolvedIndex + 1}.`);
  }

  function clearAnswer() {
    setUserNotes(Array(dictationNotes.length).fill(null));
    setUserInputs(Array(dictationNotes.length).fill(""));
    setMask(null);
    setActiveIdx(0);
    setStatus("Respuesta borrada. Puedes volver a escribir desde el inicio.");
  }

  function grade() {
    if (!dictationNotes.length) {
      setStatus("Primero genera un dictado.");
      return;
    }

    const evaluation = dictationNotes.map((slot, index) => {
      const answer = userNotes[index];
      return answer?.key ? answer.key === slot.key : null;
    });
    const answered = userNotes.filter(Boolean).length;
    const correct = evaluation.filter(Boolean).length;
    const pct = answered > 0 ? Math.round((100 * correct) / answered) : 0;

    setMask(evaluation);

    if (answered === dictationNotes.length) {
      setStatus(
        `Resultado: ${correct}/${dictationNotes.length} (${Math.round((100 * correct) / dictationNotes.length)}%).`,
      );
      return;
    }

    setStatus(
      `Progreso: ${correct}/${answered} correctas de ${answered}/${dictationNotes.length} respondidas (${pct}% acierto).`,
    );
  }

  function startMetronomePreview() {
    ensureAudio();
    if (!audioContext) return;
    const beatSec = 60 / bpm;
    let start = audioContext.currentTime + 0.05;
    for (let beat = 0; beat < 4; beat += 1) {
      clickMetronome(start + beat * beatSec);
    }
  }

  function playSequence() {
    if (!dictationNotes.length) return;
    if (isPlaying) {
      clearPlayback();
      return;
    }

    ensureAudio();
    setIsPlaying(true);

    const beatSec = 60 / bpm;
    const noteLength = DURATIONS[dur]?.factor ?? 1;
    const noteDuration = noteLength * beatSec * 0.95;
    const sequenceDuration = 1 + dictationNotes.length * beatSec * noteLength;

    const playOnce = () => {
      playTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      playTimeoutsRef.current = [];
      const prepTime = 1;
      setCurrentPlayingNote(-1);
      setCurrentNoteDisplay({ spn: "", solfege: "", show: false });
      setMetronomeActive(true);
      setMetronomeBeat(0);

      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }

      const totalBeats = dictationNotes.length * noteLength;
      for (let beat = 0; beat < totalBeats; beat += 1) {
        const beatTimeout = setTimeout(
          () => setMetronomeBeat(beat % 4),
          (prepTime + beat * beatSec) * 1000,
        );
        playTimeoutsRef.current.push(beatTimeout);
      }

      const endTimeout = setTimeout(
        () => setMetronomeActive(false),
        (prepTime + totalBeats * beatSec) * 1000,
      );
      playTimeoutsRef.current.push(endTimeout);

      const schedulePlayback = () => {
        dictationNotes.forEach((slot, index) => {
          const noteTimeout = setTimeout(
            () => {
              setCurrentPlayingNote(index);
              setCurrentNoteDisplay({
                spn: labelSPN(slot.key),
                solfege: labelSolfege(slot.key),
                show: true,
              });

              const sampler = getLoadedSampler();
              if (engine === "yamaha" && sampler) {
                sampler.triggerAttackRelease(labelSPN(slot.key), noteDuration);
              } else if (audioContext) {
                pianoLike(
                  freqOfKey(slot.key),
                  audioContext.currentTime + 0.01,
                  noteDuration,
                );
              }

              if (index === dictationNotes.length - 1) {
                const tailTimeout = setTimeout(() => {
                  setCurrentPlayingNote(-1);
                  setCurrentNoteDisplay({ spn: "", solfege: "", show: false });
                }, noteDuration * 1000);
                playTimeoutsRef.current.push(tailTimeout);
              }
            },
            (prepTime + index * beatSec * noteLength) * 1000,
          );
          playTimeoutsRef.current.push(noteTimeout);
        });
      };

      if (engine === "yamaha") {
        loadYamahaSampler().then(schedulePlayback).catch(schedulePlayback);
      } else {
        schedulePlayback();
      }
    };

    playOnce();
    playIntervalRef.current = setInterval(
      playOnce,
      (sequenceDuration + 1) * 1000,
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "100%",
        maxWidth: "100vw",
        px: { xs: 1.5, sm: 2.5, lg: 3.5 },
        py: 4,
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ md: "center" }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          >
            Volver al menú
          </Button>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: "0.18em", color: "#64748b" }}
            >
              Gran pentagrama
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Iowan Old Style", "Palatino Linotype", serif',
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Dictado por bloques Sol → Fa → Sol
            </Typography>
            <Typography sx={{ maxWidth: 900, color: "#475569" }}>
              El ejercicio recorre tres bloques fijos. El cursor avanza en
              orden lineal, pero cada bloque te obliga a ubicar la nota en el
              pentagrama correcto del gran pentagrama.
            </Typography>
          </Box>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 4,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.5 },
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={1.5}
              alignItems={{ lg: "center" }}
              justifyContent="space-between"
            >
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ alignItems: "center" }}
              >
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="block-size-label">Bloque</InputLabel>
                  <Select
                    labelId="block-size-label"
                    label="Bloque"
                    value={blockSize}
                    onChange={(event) =>
                      setBlockSize(Number(event.target.value))
                    }
                  >
                    {BLOCK_SIZE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option} notas
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  label="BPM"
                  type="number"
                  value={bpm}
                  inputProps={{ min: 40, max: 180 }}
                  onChange={(event) =>
                    setBpm(clamp(Number(event.target.value), 40, 180))
                  }
                  sx={{ width: 110 }}
                />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel id="duration-label">Duración</InputLabel>
                  <Select
                    labelId="duration-label"
                    label="Duración"
                    value={dur}
                    onChange={(event) => setDur(event.target.value)}
                  >
                    <MenuItem value="q">Negra</MenuItem>
                    <MenuItem value="8">Corchea</MenuItem>
                    <MenuItem value="h">Blanca</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="mode-label">Modo</InputLabel>
                  <Select
                    labelId="mode-label"
                    label="Modo"
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                  >
                    <MenuItem value="train">Entrenamiento</MenuItem>
                    <MenuItem value="exam">Examen</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="sound-label">Sonido</InputLabel>
                  <Select
                    labelId="sound-label"
                    label="Sonido"
                    value={engine}
                    onChange={(event) => setEngine(event.target.value)}
                  >
                    <MenuItem value="yamaha">Piano Yamaha</MenuItem>
                    <MenuItem value="synth">Piano simulado</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={newDictation}
                  startIcon={<RestartAlt />}
                >
                  Nuevo
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={playSequence}
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                >
                  {isPlaying ? "Pausar" : "Reproducir"}
                </Button>
                <Button variant="outlined" onClick={startMetronomePreview}>
                  Metrónomo
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={grade}
                >
                  Calificar
                </Button>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={`Patrón fijo: Sol → Fa → Sol`} size="small" />
              <Chip label={`${blockSize} notas por bloque`} size="small" />
              <Chip label={`${totalNotes} notas totales`} size="small" />
              <Chip
                label={`Bloque activo: ${activeBlock}/3 (${CLEF_LABELS[expectedClef]})`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Respondidas: ${answeredCount}/${dictationNotes.length || totalNotes}`}
                size="small"
              />
              {mask && (
                <Chip
                  label={`Correctas: ${correctCount}/${answeredCount || 0}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.5,
              borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
              backgroundColor: "#f8fafc",
            }}
          >
            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
              Modelo auditivo
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Pentagrama superior en clave de Sol y pentagrama inferior en clave
              de Fa. En modo examen se ocultan las notas del modelo.
            </Typography>
          </Box>
          <Box sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
            {mode === "train" && currentNoteDisplay.show && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mb: 1.5,
                  color: "#c2410c",
                  fontWeight: 700,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {currentNoteDisplay.spn} ({currentNoteDisplay.solfege})
                </Typography>
              </Box>
            )}
            {metronomeActive && (
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {bpm} BPM
                </Typography>
                {[0, 1, 2, 3].map((beat) => (
                  <Box
                    key={beat}
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor:
                        metronomeBeat === beat ? "#2563eb" : "#cbd5e1",
                      transition: "background-color 120ms ease",
                    }}
                  />
                ))}
              </Stack>
            )}
            <Box sx={{ overflowX: "auto" }}>
              <Box
                id="grand-staff-model"
                ref={wrapModel}
                sx={{
                  minWidth: STAFF_CANVAS_WIDTH,
                  width: "fit-content",
                  mx: "auto",
                }}
              />
            </Box>
            {mode === "train" && (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 1.5 }}
              >
                {dictationNotes.map((slot, index) => (
                  <Chip
                    key={`model-${index}`}
                    size="small"
                    label={`${index + 1}. ${labelSPN(slot.key)} · ${CLEF_LABELS[slot.clef]}`}
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 1.5,
              borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
              backgroundColor: "#f8fafc",
            }}
          >
            <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
              Tu respuesta
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Haz clic en el pentagrama correcto para la nota activa. Si te
              equivocas, usa `Deshacer` o `Backspace`.
            </Typography>
          </Box>
          <Box sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
            <Box sx={{ overflowX: "auto" }}>
              <Box
                id="grand-staff-answer"
                ref={wrapAnswer}
                onClick={onClickStaff}
                sx={{
                  minWidth: STAFF_CANVAS_WIDTH,
                  width: "fit-content",
                  mx: "auto",
                  cursor: "crosshair",
                }}
              />
            </Box>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 1.5 }}
            >
              <Button
                variant="outlined"
                startIcon={<Undo />}
                onClick={undo}
              >
                Deshacer
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<DeleteOutline />}
                onClick={clearAnswer}
              >
                Borrar respuesta
              </Button>
              <Chip
                label={`Nota activa: #${activeIdx + 1} · ${CLEF_LONG_LABELS[expectedClef]}`}
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 2,
                overflowX: "auto",
                pb: 0.5,
              }}
            >
              {dictationNotes.map((slot, index) => {
                const typed = userInputs[index] ?? "";
                const parsed = parseNoteInput(typed);
                const exerciseRange = getExerciseRange(slot.clef);
                const inRange = parsed.valid
                  ? exerciseRange.includes(parsed.key)
                  : false;
                const helper = typed
                  ? parsed.valid
                    ? inRange
                      ? parsed.typedSolfege
                        ? labelSPN(parsed.key)
                        : labelSolfege(parsed.key)
                      : `Solo dentro del rango ${CLEF_LABELS[slot.clef]}`
                    : "Ej: C4 o Do4"
                  : `${index + 1} · ${CLEF_LABELS[slot.clef]}`;
                const color =
                  mask && typed && parsed.valid && inRange
                    ? mask[index]
                      ? "success"
                      : "error"
                    : "primary";

                return (
                  <TextField
                    key={`slot-${index}`}
                    size="small"
                    label={`#${index + 1}`}
                    value={typed}
                    color={color}
                    error={Boolean(typed && (!parsed.valid || !inRange))}
                    helperText={helper}
                    onFocus={() => setActiveIdx(index)}
                    onChange={(event) => {
                      const value = event.target.value;
                      const nextInputs = [...userInputs];
                      nextInputs[index] = value;
                      setUserInputs(nextInputs);
                      setMask(null);
                      setActiveIdx(index);

                      const nextNotes = [...userNotes];
                      const nextParsed = parseNoteInput(value);
                      const allowedRange = getExerciseRange(slot.clef);
                      const nextInRange = nextParsed.valid
                        ? allowedRange.includes(nextParsed.key)
                        : false;
                      nextNotes[index] =
                        nextParsed.valid && nextInRange
                          ? {
                              key: nextParsed.key,
                              clef: slot.clef,
                              blockIndex: slot.blockIndex,
                            }
                          : null;
                      setUserNotes(nextNotes);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        const nextIndex = Math.min(
                          dictationNotes.length - 1,
                          index + 1,
                        );
                        inputRefs.current[nextIndex]?.focus();
                      }
                    }}
                    inputRef={(node) => {
                      inputRefs.current[index] = node;
                    }}
                    sx={{
                      minWidth: 96,
                      backgroundColor:
                        activeIdx === index
                          ? "rgba(37, 99, 235, 0.04)"
                          : "transparent",
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid rgba(15, 23, 42, 0.08)",
            borderRadius: 4,
            px: { xs: 2, md: 3 },
            py: 2,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Typography sx={{ color: "#334155" }}>{status}</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {blockSummary.map((block) => (
                <Chip
                  key={`summary-${block.index}`}
                  size="small"
                  label={`Bloque ${block.index + 1}: ${CLEF_LABELS[block.clef]} (${blockSize} notas)`}
                  variant={activeBlock === block.index + 1 ? "filled" : "outlined"}
                  color={activeBlock === block.index + 1 ? "primary" : "default"}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
