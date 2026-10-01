import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Pause,
  PlayArrow,
  RecordVoiceOver,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import RhythmReadingSheet from "./RhythmReadingSheet";
import {
  buildRhythmTimeline,
  RHYTHM_READING_EXERCISES,
  type RhythmPosition,
} from "./rhythmReading";
import { RhythmVoicePlayer } from "./rhythmVoice";

export default function LecturaRitmica() {
  const navigate = useNavigate();
  const [exerciseId, setExerciseId] = useState(25);
  const [selectedSystems, setSelectedSystems] = useState<number[]>(() =>
    RHYTHM_READING_EXERCISES[0].systems.map((_, index) => index),
  );
  const [bpm, setBpm] = useState(72);
  const [countIn, setCountIn] = useState(true);
  const [loop, setLoop] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [showSyllables, setShowSyllables] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [position, setPosition] = useState<RhythmPosition | null>(null);
  const [entryBeat, setEntryBeat] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const playerRef = useRef<RhythmVoicePlayer | null>(null);
  const playbackRequest = useRef(0);
  const exercise = RHYTHM_READING_EXERCISES.find(
    (item) => item.id === exerciseId,
  )!;
  const timeline = useMemo(
    () => buildRhythmTimeline(exercise, selectedSystems),
    [exercise, selectedSystems],
  );
  const allSelected = selectedSystems.length === exercise.systems.length;

  useEffect(
    () => () => {
      playbackRequest.current += 1;
      playerRef.current?.dispose();
    },
    [],
  );

  function stop() {
    playbackRequest.current += 1;
    playerRef.current?.stop();
    setPlaying(false);
    setLoading(false);
    setPosition(null);
    setEntryBeat(null);
    setPulse(0);
  }

  async function play() {
    if (playing) {
      stop();
      return;
    }
    if (!timeline.positions.length || loading) return;
    stop();
    const request = playbackRequest.current;
    setError("");
    setLoading(true);
    playerRef.current ??= new RhythmVoicePlayer();
    try {
      await playerRef.current.prepare();
      if (request !== playbackRequest.current) return;
      playerRef.current.start({
        timeline,
        bpm,
        beatsPerMeasure: exercise.beatsPerMeasure,
        countIn,
        loop,
        metronome,
        onPosition: (next, entry, nextPulse) => {
          setPosition(next);
          setEntryBeat(entry);
          setPulse(nextPulse);
        },
        onFinish: stop,
      });
      setLoading(false);
      setPlaying(true);
    } catch {
      if (request === playbackRequest.current) {
        stop();
        setError(
          "No se pudo preparar la voz. Revisa el audio del navegador e inténtalo de nuevo.",
        );
      }
    }
  }

  function selectSystem(index: number, selected: boolean) {
    stop();
    setSelectedSystems((previous) =>
      selected
        ? Array.from(new Set([...previous, index])).sort((a, b) => a - b)
        : previous.filter((item) => item !== index),
    );
  }

  const spokenLabel = position?.rest
    ? "Silencio"
    : position?.continuation
      ? "Sostén…"
      : position?.syllable === "ka"
        ? "Ka"
        : "Ta";

  return (
    <Box sx={{ width: "100%", px: 2, py: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0b2a50" }}>
            Lectura rítmica — Ta-ka
          </Typography>
        </Stack>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ sm: "center" }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 750 }}>
                  Ejercicio {exercise.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Escucha y repite la secuencia con «ta-ka», sin alturas
                  musicales.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip label={`${exercise.beatsPerMeasure}/4`} />
                <Chip
                  label={`${exercise.systems.flat().length} compases`}
                  variant="outlined"
                />
                <Chip label={`${bpm} BPM`} variant="outlined" />
              </Stack>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              alignItems={{ sm: "center" }}
            >
              <FormControl size="small" sx={{ minWidth: 230 }}>
                <InputLabel id="rhythm-reading-exercise-label">
                  Ejercicio
                </InputLabel>
                <Select
                  labelId="rhythm-reading-exercise-label"
                  label="Ejercicio"
                  value={exerciseId}
                  onChange={(event) => {
                    stop();
                    const next = RHYTHM_READING_EXERCISES.find(
                      (item) => item.id === Number(event.target.value),
                    )!;
                    setExerciseId(next.id);
                    setSelectedSystems(next.systems.map((_, index) => index));
                  }}
                >
                  {RHYTHM_READING_EXERCISES.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      Ejercicio {item.id} · {item.beatsPerMeasure}/4
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Typography
                  id="rhythm-reading-tempo-label"
                  variant="body2"
                  sx={{ fontWeight: 700 }}
                >
                  Tempo: {bpm} BPM
                </Typography>
                <Slider
                  aria-labelledby="rhythm-reading-tempo-label"
                  value={bpm}
                  min={40}
                  max={160}
                  step={1}
                  valueLabelDisplay="auto"
                  onChange={(_, value) => {
                    stop();
                    setBpm(value as number);
                  }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={playing ? <Pause /> : <PlayArrow />}
                onClick={play}
                disabled={loading || !timeline.positions.length}
                sx={{ minWidth: 190 }}
              >
                {loading
                  ? "Preparando voz…"
                  : playing
                    ? "Detener"
                    : "Reproducir ta-ka"}
              </Button>
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={countIn}
                    onChange={(_, checked) => {
                      stop();
                      setCountIn(checked);
                    }}
                  />
                }
                label="Compás de entrada"
              />
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={loop}
                    onChange={(_, checked) => {
                      stop();
                      setLoop(checked);
                    }}
                  />
                }
                label="Repetir"
              />
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={metronome}
                    onChange={(_, checked) => {
                      stop();
                      setMetronome(checked);
                    }}
                  />
                }
                label="Metrónomo"
              />
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={showSyllables}
                    onChange={(_, checked) => setShowSyllables(checked)}
                  />
                }
                label="Mostrar sílabas"
              />
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
            <Box
              role="status"
              aria-live="off"
              sx={{
                bgcolor: playing ? "#e8f2ff" : "grey.50",
                borderRadius: 2,
                px: 2,
                py: 1.5,
                minHeight: 78,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <RecordVoiceOver color="primary" />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 750, fontSize: 22 }}>
                    {playing
                      ? position
                        ? spokenLabel
                        : entryBeat !== null
                          ? `Entrada: ${entryBeat + 1}`
                          : "Listo…"
                      : "Ta-ka · ta-ka"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {playing && position
                      ? `Compás ${position.measureIndex + 1} · Sistema ${position.systemIndex + 1}`
                      : "Cada sílaba dura toda la figura; las ligaduras prolongan la vocal sin repetir el ataque."}
                  </Typography>
                </Box>
                {playing && (
                  <Stack direction="row" spacing={1}>
                    {Array.from(
                      { length: exercise.beatsPerMeasure },
                      (_, beat) => (
                        <Box
                          key={beat}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor:
                              (position ? pulse : entryBeat) === beat
                                ? "primary.main"
                                : "grey.200",
                            color:
                              (position ? pulse : entryBeat) === beat
                                ? "#fff"
                                : "text.secondary",
                          }}
                        >
                          {beat + 1}
                        </Box>
                      ),
                    )}
                  </Stack>
                )}
              </Stack>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <FormControlLabel
                sx={{ m: 0, whiteSpace: "nowrap" }}
                control={
                  <Switch
                    checked={allSelected}
                    onChange={(_, checked) => {
                      stop();
                      setSelectedSystems(
                        checked
                          ? exercise.systems.map((_, index) => index)
                          : [],
                      );
                    }}
                  />
                }
                label="Todo el ejercicio"
              />
              <Typography
                variant="body2"
                color="text.secondary"
                aria-live="polite"
              >
                {!selectedSystems.length
                  ? "Selecciona al menos un sistema para reproducir."
                  : allSelected
                    ? "Puedes practicar un sistema o combinar varios."
                    : `Sistemas seleccionados: ${selectedSystems.map((index) => index + 1).join(", ")}. Se reproducen en orden.`}
              </Typography>
            </Stack>
            <RhythmReadingSheet
              exercise={exercise}
              selectedSystems={selectedSystems}
              timeline={timeline}
              activeNoteIndex={position?.noteIndex ?? null}
              showSyllables={showSyllables}
              onSystemChange={selectSystem}
            />
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
