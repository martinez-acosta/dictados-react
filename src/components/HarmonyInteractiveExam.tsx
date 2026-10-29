import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  EXAM_QUESTIONS,
  EXAM_TOPICS,
  evaluateExamNotes,
} from "../data/harmonyInteractiveExam.mjs";
import { spanishNote } from "../data/harmonyExamGuide.mjs";
import { generateRandomExam } from "../data/harmonyRandomExam.mjs";
import { explainExamQuestion } from "../data/harmonyExamExplanations.mjs";
import HarmonyChordStaffInput, {
  type StaffEntry,
} from "./HarmonyChordStaffInput";
import { staffAnswers } from "../data/harmonyStaffInput.mjs";

type Question = (typeof EXAM_QUESTIONS)[number];

function ExamExplanation({ question }: { question: Question }) {
  const { foundation, steps } = explainExamQuestion(question);
  return (
    <>
      {foundation.length > 0 && (
        <>
          <Typography component="h4" sx={{ fontWeight: 800, mt: 2 }}>
            Primero, construyamos la base desde cero
          </Typography>
          <Box
            component="ol"
            sx={{ pl: 3, "& li": { mb: 1.5, lineHeight: 1.7 } }}
          >
            {foundation.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </Box>
        </>
      )}
      <Typography component="h4" sx={{ fontWeight: 800, mt: 2 }}>
        Ahora, resolvamos la pregunta
      </Typography>
      <Box component="ol" sx={{ pl: 3, "& li": { mb: 1.5, lineHeight: 1.7 } }}>
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </Box>
    </>
  );
}

function shuffled(items: Question[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function HarmonyInteractiveExam() {
  const [topic, setTopic] = useState("todos");
  const [mode, setMode] = useState("aleatorias");
  const [questions, setQuestions] = useState<Question[]>(() =>
    generateRandomExam("todos"),
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    fields: boolean[];
  } | null>(null);
  const [firstResults, setFirstResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [answerChanged, setAnswerChanged] = useState(false);
  const [staffNotes, setStaffNotes] = useState<StaffEntry[]>([]);
  const [answerMode, setAnswerMode] = useState<"pentagrama" | "texto">(
    "pentagrama",
  );
  const question = questions[index];
  const usesStaff =
    question?.topic === "septimas" && question?.kind === "notes";
  const drawingAnswer = usesStaff && answerMode === "pentagrama";
  const evaluatedCount = Object.keys(firstResults).length;
  const correctCount = Object.values(firstResults).filter(Boolean).length;
  const topicName =
    EXAM_TOPICS.find(([id]) => id === question?.topic)?.[1] ?? "";
  const inputComplete = drawingAnswer
    ? staffNotes.length === question.answers.length
    : question?.kind === "choice"
      ? Boolean(selectedOption)
      : question?.answers?.every((_, i) => Boolean(answers[i]?.trim()));

  function start(
    nextTopic: string,
    randomize = false,
    only?: Question[],
    nextMode = mode,
  ) {
    const available =
      only ??
      (nextMode === "aleatorias"
        ? generateRandomExam(nextTopic)
        : EXAM_QUESTIONS.filter(
            (item) => nextTopic === "todos" || item.topic === nextTopic,
          ));
    setTopic(nextTopic);
    setMode(nextMode);
    setQuestions(randomize ? shuffled(available) : [...available]);
    setIndex(0);
    setAnswers([]);
    setStaffNotes([]);
    setSelectedOption("");
    setFeedback(null);
    setAnswerChanged(false);
    setFirstResults({});
    setFinished(false);
    setHelpOpen(false);
  }

  function grade() {
    if (!question || !inputComplete || (feedback && !answerChanged)) return;
    const fields =
      question.kind === "notes"
        ? evaluateExamNotes(
            drawingAnswer ? staffAnswers(staffNotes) : answers,
            question.answers,
          )
        : [];
    const correct =
      question.kind === "notes"
        ? fields.every(Boolean)
        : selectedOption === question.correctOption;
    setFeedback({ correct, fields });
    setAnswerChanged(false);
    setFirstResults((previous) =>
      Object.prototype.hasOwnProperty.call(previous, question.id)
        ? previous
        : { ...previous, [question.id]: correct },
    );
  }

  function next() {
    if (!feedback || answerChanged) return;
    setHelpOpen(false);
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setAnswers([]);
    setStaffNotes([]);
    setSelectedOption("");
    setFeedback(null);
    setAnswerChanged(false);
  }

  const missed = questions.filter((item) => firstResults[item.id] === false);

  return (
    <Box>
      <Typography
        component="h2"
        sx={{
          fontSize: { xs: 23, sm: 28 },
          fontWeight: 850,
          lineHeight: 1.25,
          mb: 1.5,
        }}
      >
        Simulacro interactivo de Armonía
      </Typography>
      <Typography sx={{ color: "#56696a", lineHeight: 1.7, mb: 2 }}>
        Responde una pregunta a la vez y pulsa «Calificar». Si necesitas ayuda,
        abre el paso a paso antes de responder. Puedes elegir un tema o
        practicar todos. En cuatríadas se incluyen los cinco tipos del repaso de
        clase: maj7, 7, m7, m7♭5 y dim7. No es una lista confirmada de preguntas
        del examen.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <FormControl fullWidth size="small">
          <InputLabel id="harmony-exam-filter">Tema de práctica</InputLabel>
          <Select
            labelId="harmony-exam-filter"
            label="Tema de práctica"
            value={topic}
            onChange={(event) => start(event.target.value)}
          >
            {EXAM_TOPICS.map(([id, label]) => (
              <MenuItem key={id} value={id}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel id="harmony-exam-mode">Tipo de preguntas</InputLabel>
          <Select
            labelId="harmony-exam-mode"
            label="Tipo de preguntas"
            value={mode}
            onChange={(event) =>
              start(topic, false, undefined, event.target.value)
            }
          >
            <MenuItem value="aleatorias">Preguntas aleatorias</MenuItem>
            <MenuItem value="originales">Preguntas originales</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Typography variant="body2" sx={{ color: "#667678", mt: 0.75 }}>
        {mode === "aleatorias"
          ? "Cada simulacro genera nuevas tonalidades para las preguntas; algunas pueden repetirse. "
          : "Las preguntas originales son fijas; puedes cambiar su orden. "}
        Al cambiar el tema o el tipo de preguntas comienza otro simulacro.
        Acepta Do o C, Mi o E, Si♭ o Bb, Fa♯ o F#. Escribe las alteraciones; se
        comprueba el nombre de la nota, no solo si suena igual.
      </Typography>

      {!finished && (
        <Button
          variant="text"
          onClick={() => start(topic, true)}
          sx={{ mt: 0.5, textTransform: "none" }}
        >
          {mode === "aleatorias"
            ? "Generar nuevas preguntas"
            : "Mezclar y reiniciar"}
        </Button>
      )}

      <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid #dce3e1" }}>
        {finished ? (
          <Box aria-live="polite">
            <Typography component="h3" sx={{ fontSize: 20, fontWeight: 850 }}>
              Simulacro terminado
            </Typography>
            <Typography sx={{ mt: 1, lineHeight: 1.7 }}>
              Correctas al primer intento:{" "}
              <strong>
                {correctCount} de {questions.length}
              </strong>
              . Puedes volver a practicar las que fallaste o iniciar otro
              simulacro.
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 2 }}
            >
              {missed.length > 0 && (
                <Button
                  variant="contained"
                  onClick={() => start(topic, false, missed)}
                >
                  Repasar {missed.length}{" "}
                  {missed.length === 1 ? "pregunta" : "preguntas"}
                </Button>
              )}
              <Button variant="outlined" onClick={() => start(topic, true)}>
                Nuevo simulacro
              </Button>
            </Stack>
          </Box>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              grade();
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={0.5}
            >
              <Typography
                variant="body2"
                sx={{ color: "#56696a", fontWeight: 700 }}
              >
                Pregunta {index + 1} de {questions.length} · {topicName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#56696a" }}>
                Primer intento: {correctCount} / {evaluatedCount} calificadas
              </Typography>
            </Stack>
            <Typography
              component="h3"
              sx={{
                fontSize: { xs: 19, sm: 21 },
                fontWeight: 800,
                lineHeight: 1.5,
                mt: 1.5,
              }}
            >
              {question.prompt}
            </Typography>
            {question.hint && (
              <Typography sx={{ color: "#667678", mt: 0.5 }}>
                {question.hint}
              </Typography>
            )}

            <Button
              type="button"
              variant="outlined"
              onClick={() => setHelpOpen(true)}
              sx={{ mt: 1.5, textTransform: "none" }}
            >
              Ver paso a paso
            </Button>
            <Dialog
              open={helpOpen}
              onClose={() => setHelpOpen(false)}
              aria-labelledby="harmony-exam-help-title"
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle id="harmony-exam-help-title">
                Cómo resolver esta pregunta
              </DialogTitle>
              <DialogContent dividers>
                <Typography sx={{ fontWeight: 700, lineHeight: 1.6 }}>
                  {question.prompt}
                </Typography>
                <Typography variant="body2" sx={{ color: "#56696a", mt: 1 }}>
                  Esta guía muestra la respuesta. Puedes consultarla sin perder
                  lo que ya escribiste; abrirla no califica la pregunta.
                </Typography>
                <ExamExplanation question={question} />
                <Typography sx={{ lineHeight: 1.7 }}>
                  <strong>Respuesta:</strong>{" "}
                  {question.kind === "notes"
                    ? question.answers
                        .map((note) => `${spanishNote(note)} (${note})`)
                        .join(" – ")
                    : question.correctOption}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setHelpOpen(false)}>
                  Volver a la pregunta
                </Button>
              </DialogActions>
            </Dialog>

            {usesStaff && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 2 }}
                role="group"
                aria-label="Forma de responder"
              >
                {(
                  [
                    ["pentagrama", "Dibujar en pentagrama"],
                    ["texto", "Escribir notas"],
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={answerMode === value ? "contained" : "outlined"}
                    aria-pressed={answerMode === value}
                    onClick={() => {
                      if (value !== answerMode && feedback)
                        setAnswerChanged(true);
                      setAnswerMode(value);
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            )}

            {drawingAnswer ? (
              <HarmonyChordStaffInput
                notes={staffNotes}
                maxNotes={question.answers.length}
                onChange={(nextNotes) => {
                  setStaffNotes(nextNotes);
                  if (feedback) setAnswerChanged(true);
                }}
              />
            ) : question.kind === "notes" ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                  mt: 2,
                }}
              >
                {question.answers.map((expected, i) => (
                  <TextField
                    key={i}
                    label={question.labels[i]}
                    value={answers[i] ?? ""}
                    onChange={(event) => {
                      if (feedback) setAnswerChanged(true);
                      setAnswers((current) => {
                        const updated = [...current];
                        updated[i] = event.target.value;
                        return updated;
                      });
                    }}
                    size="small"
                    fullWidth
                    error={Boolean(
                      feedback && !answerChanged && !feedback.fields[i],
                    )}
                    helperText={
                      feedback && !answerChanged && !feedback.fields[i]
                        ? `Esperado: ${spanishNote(expected)} (${expected})`
                        : undefined
                    }
                    inputProps={{
                      autoCorrect: "off",
                      spellCheck: false,
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                role="group"
                aria-label="Opciones de respuesta"
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1,
                  mt: 2,
                }}
              >
                {question.options.map((option) => (
                  <Button
                    key={option}
                    variant={
                      selectedOption === option ? "contained" : "outlined"
                    }
                    aria-pressed={selectedOption === option}
                    onClick={() => {
                      if (feedback && option !== selectedOption)
                        setAnswerChanged(true);
                      setSelectedOption(option);
                    }}
                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                  >
                    {option}
                  </Button>
                ))}
              </Box>
            )}

            {(!feedback || answerChanged) && (
              <Button
                type="submit"
                variant="contained"
                disabled={!inputComplete}
                sx={{ mt: 2 }}
              >
                {feedback ? "Volver a calificar" : "Calificar"}
              </Button>
            )}

            {feedback && (
              <Box
                aria-live="polite"
                sx={{ mt: 2, pt: 2, borderTop: "1px solid #dce3e1" }}
              >
                <Typography
                  sx={{
                    fontWeight: 850,
                    color: feedback.correct ? "#116453" : "#9b332c",
                  }}
                >
                  {answerChanged
                    ? "Respuesta modificada. Vuelve a calificarla para comprobarla."
                    : feedback.correct
                      ? "¡Correcto!"
                      : "Todavía no. Revisa la respuesta:"}
                </Typography>
                <Typography sx={{ mt: 0.75, lineHeight: 1.7 }}>
                  {drawingAnswer && !answerChanged && (
                    <>
                      <strong>Tu respuesta:</strong>{" "}
                      {staffAnswers(staffNotes)
                        .map((note: string) => `${spanishNote(note)} (${note})`)
                        .join(" – ")}
                      <br />
                    </>
                  )}
                  <strong>Respuesta:</strong>{" "}
                  {question.kind === "notes"
                    ? question.answers
                        .map((note) => `${spanishNote(note)} (${note})`)
                        .join(" – ")
                    : question.correctOption}
                </Typography>
                <ExamExplanation question={question} />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="contained"
                    onClick={next}
                    disabled={answerChanged}
                  >
                    {index === questions.length - 1
                      ? "Ver resultado"
                      : "Siguiente pregunta"}
                  </Button>
                </Stack>
                {(!feedback.correct || answerChanged) && (
                  <Typography variant="body2" sx={{ color: "#667678", mt: 1 }}>
                    Puedes editar tu respuesta directamente; la puntuación
                    conserva el resultado del primer intento.
                  </Typography>
                )}
              </Box>
            )}
          </form>
        )}
      </Box>
    </Box>
  );
}
