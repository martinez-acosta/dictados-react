import React, { useState } from "react";
import {
  Box,
  Button,
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

type Question = (typeof EXAM_QUESTIONS)[number];

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
  const [questions, setQuestions] = useState<Question[]>(() => [
    ...EXAM_QUESTIONS,
  ]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    fields: boolean[];
  } | null>(null);
  const [firstResults, setFirstResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const question = questions[index];
  const evaluatedCount = Object.keys(firstResults).length;
  const correctCount = Object.values(firstResults).filter(Boolean).length;
  const topicName =
    EXAM_TOPICS.find(([id]) => id === question?.topic)?.[1] ?? "";
  const inputComplete =
    question?.kind === "choice"
      ? Boolean(selectedOption)
      : question?.answers?.every((_, i) => Boolean(answers[i]?.trim()));

  function start(nextTopic: string, randomize = false, only?: Question[]) {
    const available =
      only ??
      EXAM_QUESTIONS.filter(
        (item) => nextTopic === "todos" || item.topic === nextTopic,
      );
    setTopic(nextTopic);
    setQuestions(randomize ? shuffled(available) : [...available]);
    setIndex(0);
    setAnswers([]);
    setSelectedOption("");
    setFeedback(null);
    setFirstResults({});
    setFinished(false);
  }

  function grade() {
    if (!question || !inputComplete || feedback) return;
    const fields =
      question.kind === "notes"
        ? evaluateExamNotes(answers, question.answers)
        : [];
    const correct =
      question.kind === "notes"
        ? fields.every(Boolean)
        : selectedOption === question.correctOption;
    setFeedback({ correct, fields });
    setFirstResults((previous) =>
      Object.prototype.hasOwnProperty.call(previous, question.id)
        ? previous
        : { ...previous, [question.id]: correct },
    );
  }

  function next() {
    if (!feedback) return;
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setAnswers([]);
    setSelectedOption("");
    setFeedback(null);
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
        Responde una pregunta a la vez y pulsa «Calificar». Después verás la
        respuesta y una explicación. Es práctica basada en las clases, no una
        lista confirmada de preguntas del examen.
      </Typography>

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
      <Typography variant="body2" sx={{ color: "#667678", mt: 0.75 }}>
        Al cambiar el tema comienza otro simulacro. Acepta Do o C, Mi o E, Si♭ o
        Bb, Fa♯ o F#. Escribe las alteraciones; se comprueba el nombre de la
        nota, no solo si suena igual.
      </Typography>

      {!finished && (
        <Button
          variant="text"
          onClick={() => start(topic, true)}
          sx={{ mt: 0.5, textTransform: "none" }}
        >
          Mezclar y reiniciar
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

            {question.kind === "notes" ? (
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
                    onChange={(event) =>
                      setAnswers((current) => {
                        const updated = [...current];
                        updated[i] = event.target.value;
                        return updated;
                      })
                    }
                    size="small"
                    fullWidth
                    error={Boolean(feedback && !feedback.fields[i])}
                    helperText={
                      feedback && !feedback.fields[i]
                        ? `Esperado: ${spanishNote(expected)} (${expected})`
                        : undefined
                    }
                    inputProps={{
                      readOnly: Boolean(feedback),
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
                    disabled={Boolean(feedback)}
                    onClick={() => setSelectedOption(option)}
                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                  >
                    {option}
                  </Button>
                ))}
              </Box>
            )}

            {!feedback && (
              <Button
                type="submit"
                variant="contained"
                disabled={!inputComplete}
                sx={{ mt: 2 }}
              >
                Calificar
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
                  {feedback.correct
                    ? "¡Correcto!"
                    : "Todavía no. Revisa la respuesta:"}
                </Typography>
                <Typography sx={{ mt: 0.75, lineHeight: 1.7 }}>
                  <strong>Respuesta:</strong>{" "}
                  {question.kind === "notes"
                    ? question.answers
                        .map((note) => `${spanishNote(note)} (${note})`)
                        .join(" – ")
                    : question.correctOption}
                </Typography>
                <Typography component="h4" sx={{ fontWeight: 800, mt: 1.5 }}>
                  Cómo resolverlo
                </Typography>
                <Box
                  component="ol"
                  sx={{ pl: 3, "& li": { mb: 0.5, lineHeight: 1.7 } }}
                >
                  {question.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ mt: 2 }}
                >
                  {!feedback.correct && (
                    <Button
                      variant="outlined"
                      onClick={() => setFeedback(null)}
                    >
                      Corregir mi respuesta
                    </Button>
                  )}
                  <Button variant="contained" onClick={next}>
                    {index === questions.length - 1
                      ? "Ver resultado"
                      : "Siguiente pregunta"}
                  </Button>
                </Stack>
                {!feedback.correct && (
                  <Typography variant="body2" sx={{ color: "#667678", mt: 1 }}>
                    Puedes corregirla; la puntuación conserva el resultado del
                    primer intento.
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
