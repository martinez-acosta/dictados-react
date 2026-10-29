import React, { useState } from "react";
import { ArrowBack, ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChordStaff } from "./HarmonyInversionsWeek";
import HarmonyInteractiveExam from "./HarmonyInteractiveExam";
import {
  HARMONY_KEYS,
  buildDiatonicThirds,
  buildHarmonyGuide,
  spanishNote,
} from "../data/harmonyExamGuide.mjs";

const topics = [
  "Ruta para estudiar",
  "Notas, tonos e intervalos",
  "Escalas y relativas",
  "Círculo de quintas",
  "Tríadas",
  "Cuatríadas y séptimas",
  "Armonización",
  "Inversiones",
  "Cadencias y Turn Around",
  "Simulacro con respuestas",
  "Simulacro interactivo",
];
const accent = "#0f766e";
const notes = (items: readonly string[]) => items.map(spanishNote).join(" – ");
const names = (items: readonly string[]) => items.join(" – ");

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="h2"
      sx={{
        fontSize: { xs: 23, sm: 28 },
        fontWeight: 850,
        lineHeight: 1.25,
        mb: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}
function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="h3"
      sx={{ fontSize: 19, fontWeight: 800, mt: 3, mb: 1 }}
    >
      {children}
    </Typography>
  );
}
function Diagram({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Box
      role="img"
      aria-label={label}
      sx={{
        borderLeft: `3px solid ${accent}`,
        bgcolor: "#f2f7f6",
        py: 1.5,
        px: 2,
        my: 2,
        fontSize: { xs: 16, sm: 18 },
        lineHeight: 1.9,
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </Box>
  );
}
function Table({
  headings,
  rows,
}: {
  headings: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <Box
      sx={{
        overflowX: "auto",
        maxWidth: "100%",
        my: 2,
        "& table": { width: "100%", borderCollapse: "collapse" },
        "& th, & td": {
          textAlign: "left",
          verticalAlign: "top",
          px: 1.2,
          py: 1.1,
          borderBottom: "1px solid #dce3e1",
          minWidth: 80,
          lineHeight: 1.55,
        },
        "& th": { fontWeight: 800 },
      }}
    >
      <table>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading} scope="col">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
function Circle({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <Box
      role="group"
      aria-label="Círculo de quintas: elige una tonalidad mayor"
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 360,
        aspectRatio: "1 / 1",
        mx: "auto",
        my: 2,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: "14%",
          border: "1px solid #c8d7d3",
          borderRadius: "50%",
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: "35% 24%",
          textAlign: "center",
          display: "grid",
          placeContent: "center",
        }}
      >
        <strong>{spanishNote(selected)} mayor</strong>
        <span>↻ quintas</span>
      </Box>
      {HARMONY_KEYS.map((key, i) => {
        const angle = (i * Math.PI) / 6 - Math.PI / 2;
        const active = key.tonic === selected;
        return (
          <Button
            key={key.tonic}
            aria-label={`${spanishNote(key.tonic)} mayor`}
            aria-pressed={active}
            onClick={() => onSelect(key.tonic)}
            sx={{
              position: "absolute",
              left: `${50 + 37 * Math.cos(angle)}%`,
              top: `${50 + 37 * Math.sin(angle)}%`,
              transform: "translate(-50%, -50%)",
              border: "1px solid",
              borderColor: active ? accent : "#c8d7d3",
              bgcolor: active ? accent : "white",
              color: active ? "white" : "#203638",
              borderRadius: "50%",
              width: { xs: 43, sm: 50 },
              height: { xs: 43, sm: 50 },
              minWidth: 0,
              p: 0,
              fontWeight: 800,
              textTransform: "none",
              "&:hover": { bgcolor: active ? "#115e59" : "#edf4f2" },
            }}
          >
            {key.tonic}
          </Button>
        );
      })}
    </Box>
  );
}

function ThirdPairs({
  tonic,
  index,
  onChange,
}: {
  tonic: string;
  index: number;
  onChange: (index: number) => void;
}) {
  const pairs = buildDiatonicThirds(tonic);
  const pair = pairs[index];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography component="h3" sx={{ fontWeight: 850, fontSize: 19 }}>
        Parejas por terceras · {spanishNote(tonic)} mayor
      </Typography>
      <Typography sx={{ color: "#56696a", mt: 0.75, lineHeight: 1.7 }}>
        Desde cada nota cuenta tres nombres: toma la primera, salta la siguiente
        y toma la tercera. Avanza por los grados de la escala, conservando sus
        alteraciones.
      </Typography>
      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={{ mt: 1.5, py: 1.5, borderBlock: "1px solid #dce3e1" }}
      >
        <Typography sx={{ fontSize: 21, fontWeight: 850 }}>
          {spanishNote(pair.start)} – {spanishNote(pair.end)}{" "}
          <Box
            component="span"
            sx={{ color: "#56696a", fontSize: 16, fontWeight: 600 }}
          >
            ({pair.start} – {pair.end})
          </Box>
        </Typography>
        <Typography sx={{ mt: 0.5, lineHeight: 1.7 }}>
          1: {spanishNote(pair.start)} → 2: {spanishNote(pair.skipped)} (se
          salta) → 3: {spanishNote(pair.end)}.
        </Typography>
        <Typography sx={{ color: "#56696a", lineHeight: 1.7 }}>
          Tercera {pair.quality} · {pair.semitones} semitonos
          {pair.wrapsScale
            ? " · la cuenta continúa al volver al inicio de la escala"
            : ""}
          .
        </Typography>
      </Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 1 }}
      >
        <Button
          startIcon={<ChevronLeft />}
          onClick={() => onChange(index - 1)}
          disabled={index === 0}
          sx={{ textTransform: "none" }}
        >
          Pareja anterior
        </Button>
        <Typography sx={{ color: "#56696a", fontSize: 14 }}>
          {index + 1} / {pairs.length}
        </Typography>
        <Button
          endIcon={<ChevronRight />}
          onClick={() => onChange(index + 1)}
          disabled={index === pairs.length - 1}
          sx={{ textTransform: "none" }}
        >
          Siguiente pareja
        </Button>
      </Stack>
      <Box
        role="group"
        aria-label="Parejas por terceras de la escala"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(4, minmax(0, 1fr))",
          },
          gap: 0.5,
          mt: 1,
        }}
      >
        {pairs.map((item, pairIndex) => (
          <Button
            key={item.degree}
            aria-pressed={index === pairIndex}
            aria-label={`Pareja ${item.degree}: ${spanishNote(item.start)} a ${spanishNote(item.end)} (${item.start} a ${item.end})`}
            onClick={() => onChange(pairIndex)}
            sx={{
              textTransform: "none",
              justifyContent: "flex-start",
              color: index === pairIndex ? accent : "#344b4d",
              bgcolor: index === pairIndex ? "#edf7f4" : "transparent",
              fontWeight: index === pairIndex ? 800 : 500,
              fontSize: 14,
            }}
          >
            {item.start} – {item.end}
          </Button>
        ))}
      </Box>
      <Typography
        sx={{ color: "#667678", fontSize: 14, mt: 1, lineHeight: 1.65 }}
      >
        Cada botón muestra una pareja, no un acorde completo. Para formar un
        acorde por terceras puedes encadenarlas: Do–Mi, Mi–Sol, Sol–Si.
      </Typography>
    </Box>
  );
}

const keyboardExamples = [
  {
    name: "Cmaj7",
    notes: ["C", "E", "G", "B"],
    pitches: ["C", "E", "G", "B"],
    formula: "1 – 3 – 5 – 7",
    text: "Do–Mi–Sol es una tríada mayor; Si es su séptima mayor, a un semitono de Do.",
  },
  {
    name: "C7",
    notes: ["C", "E", "G", "B♭"],
    pitches: ["C", "E", "G", "A♯"],
    formula: "1 – 3 – 5 – ♭7",
    text: "La tríada sigue siendo mayor, pero Si♭ es séptima menor: un tono antes de Do.",
  },
  {
    name: "Cm7",
    notes: ["C", "E♭", "G", "B♭"],
    pitches: ["C", "D♯", "G", "A♯"],
    formula: "1 – ♭3 – 5 – ♭7",
    text: "Mi♭ convierte la tríada en menor; Si♭ es la séptima menor.",
  },
  {
    name: "CmMaj7",
    notes: ["C", "E♭", "G", "B"],
    pitches: ["C", "D♯", "G", "B"],
    formula: "1 – ♭3 – 5 – 7",
    text: "Mi♭ forma la tríada menor; Si es la séptima mayor. La m describe la tríada y Maj7 describe la séptima.",
  },
  {
    name: "Cm7♭5",
    notes: ["C", "E♭", "G♭", "B♭"],
    pitches: ["C", "D♯", "F♯", "A♯"],
    formula: "1 – ♭3 – ♭5 – ♭7",
    text: "La tríada es disminuida y la séptima es menor: semidisminuido, también Cø7.",
  },
  {
    name: "Cdim7",
    notes: ["C", "E♭", "G♭", "B𝄫"],
    pitches: ["C", "D♯", "F♯", "A"],
    formula: "1 – ♭3 – ♭5 – ♭♭7",
    text: "La tríada y la séptima son disminuidas. Si doble bemol se toca en la tecla de La, pero se escribe Si𝄫 para conservar el nombre de séptima.",
  },
];

const chordReferenceDetails = [
  {
    name: "Mayor con séptima mayor",
    symbol: "maj7 / Δ7",
    construction: "Tríada mayor + séptima mayor.",
  },
  {
    name: "Séptima de dominante",
    symbol: "7",
    construction: "Tríada mayor + séptima menor.",
  },
  {
    name: "Menor con séptima menor",
    symbol: "m7",
    construction: "Tríada menor + séptima menor.",
  },
  {
    name: "Menor con séptima mayor",
    symbol: "mMaj7",
    construction: "Tríada menor + séptima mayor.",
  },
  {
    name: "Semidisminuido (menor séptima con quinta disminuida)",
    symbol: "m7♭5 / ø7",
    construction: "Tríada disminuida + séptima menor: semidisminuido.",
  },
  {
    name: "Disminuido con séptima disminuida (disminuido completo)",
    symbol: "dim7 / °7",
    construction: "Tríada disminuida + séptima disminuida.",
  },
];

function SeventhChordQuickReference() {
  return (
    <Box
      component="section"
      aria-labelledby="chord-quick-reference-title"
      sx={{ mt: 3 }}
    >
      <Typography
        id="chord-quick-reference-title"
        component="h3"
        sx={{ fontSize: 19, fontWeight: 800 }}
      >
        Fórmulas de cuatríadas
      </Typography>
      <Typography sx={{ mt: 0.75, color: "#56696a", lineHeight: 1.7 }}>
        Una cuatríada tiene cuatro notas: fundamental (1), tercera (3), quinta
        (5) y séptima (7). Las fórmulas se comparan con la escala mayor de la
        fundamental: ♭ baja ese grado un semitono y ♭♭ lo baja dos. Los ejemplos
        son desde Do, aunque elijas otra tonalidad en el círculo.
      </Typography>
      <Box component="dl" sx={{ m: 0, mt: 1.5 }}>
        {keyboardExamples.map((example, index) => (
          <Box
            key={example.name}
            sx={{ py: 1.25, borderBottom: "1px solid #dce3e1" }}
          >
            <Typography
              component="dt"
              sx={{ fontWeight: 800, lineHeight: 1.6 }}
            >
              {chordReferenceDetails[index].name}
            </Typography>
            <Box
              component="dd"
              sx={{ m: 0, lineHeight: 1.7, color: "#354c4e" }}
            >
              <strong>{chordReferenceDetails[index].symbol}</strong> ·{" "}
              {example.formula}
              <br />
              {chordReferenceDetails[index].construction}
              <br />
              Ejemplo: {example.name} = {notes(example.notes)}.
            </Box>
          </Box>
        ))}
      </Box>
      <Typography
        variant="body2"
        sx={{ mt: 1, color: "#56696a", lineHeight: 1.7 }}
      >
        Para distinguir los dos últimos: el semidisminuido usa ♭7; el disminuido
        completo usa ♭♭7. En Cdim7, Si𝄫 suena como La, pero se escribe Si𝄫
        porque es la séptima de Do.
      </Typography>
    </Box>
  );
}
function Keyboard({
  pitches,
  writtenNotes,
}: {
  pitches: readonly string[];
  writtenNotes: readonly string[];
}) {
  const white = ["C", "D", "E", "F", "G", "A", "B"];
  const black = [
    { pitch: "C♯", label: "Do♯/Re♭", boundary: 1 },
    { pitch: "D♯", label: "Re♯/Mi♭", boundary: 2 },
    { pitch: "F♯", label: "Fa♯/Sol♭", boundary: 4 },
    { pitch: "G♯", label: "Sol♯/La♭", boundary: 5 },
    { pitch: "A♯", label: "La♯/Si♭", boundary: 6 },
  ];
  return (
    <Box
      role="img"
      aria-label={`Teclado: notas del acorde ${writtenNotes.map(spanishNote).join(", ")}`}
      sx={{
        position: "relative",
        height: { xs: 120, sm: 160 },
        maxWidth: 560,
        mx: "auto",
        my: 2,
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        border: "1px solid #293e40",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {white.map((p) => (
        <Box
          key={p}
          sx={{
            position: "relative",
            borderRight: "1px solid #9ca9a7",
            bgcolor: pitches.includes(p) ? "#a8d9ce" : "#fff",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pb: 1,
            fontWeight: 800,
            fontSize: { xs: 12, sm: 14 },
          }}
        >
          {p === "A" && writtenNotes.includes("B𝄫")
            ? "La / Si𝄫"
            : spanishNote(p)}
        </Box>
      ))}
      {black.map(({ pitch, label, boundary }) => (
        <Box
          key={pitch}
          title={label}
          sx={{
            position: "absolute",
            top: 0,
            left: `${(boundary / 7) * 100}%`,
            transform: "translateX(-50%)",
            width: "8%",
            height: "62%",
            bgcolor: pitches.includes(pitch) ? accent : "#293e40",
            color: "#fff",
            borderRadius: "0 0 4px 4px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pb: 0.5,
            fontSize: { xs: 8, sm: 11 },
            fontWeight: 700,
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {label.split("/").map((name) => (
            <React.Fragment key={name}>
              {name}
              <br />
            </React.Fragment>
          ))}
        </Box>
      ))}
    </Box>
  );
}
function Answer({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      component="details"
      sx={{
        borderBottom: "1px solid #dce3e1",
        py: 1.5,
        "& summary": { cursor: "pointer", fontWeight: 750, lineHeight: 1.5 },
        "& p": { lineHeight: 1.75 },
      }}
    >
      <summary>{question}</summary>
      <Box sx={{ pl: 2, pt: 1, color: "#354c4e" }}>{children}</Box>
    </Box>
  );
}

export default function HarmonyExamGuide() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState(() =>
    searchParams.get("tema") === "simulacro-interactivo" ? 10 : 0,
  );
  const [tonic, setTonic] = useState("C");
  const [pairIndex, setPairIndex] = useState(0);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [chordIndex, setChordIndex] = useState(0);
  const key = buildHarmonyGuide(tonic);
  const example = keyboardExamples[chordIndex];
  const nextTopic = (index: number) => {
    setTopic(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f9f8", color: "#172b2d" }}>
      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 }, py: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/notas-semestre")}
          sx={{ color: "#526365", textTransform: "none", mb: 1.5 }}
        >
          Volver a notas del semestre
        </Button>
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: 27, sm: 36 },
            fontWeight: 900,
            lineHeight: 1.2,
          }}
        >
          Guía de examen de Armonía
        </Typography>
        <Typography sx={{ color: "#56696a", mt: 1, lineHeight: 1.7 }}>
          Segundo año · desde las bases hasta ejercicios resueltos. Selecciona
          un tema y avanza a tu ritmo.
        </Typography>
        <Box
          sx={{
            bgcolor: "white",
            border: "1px solid #dce3e1",
            mt: 2.5,
            p: { xs: 1.5, sm: 3 },
          }}
        >
          <Button
            variant="outlined"
            aria-expanded={referenceOpen}
            aria-controls="harmony-quick-reference"
            onClick={() => setReferenceOpen((current) => !current)}
            sx={{
              color: accent,
              borderColor: accent,
              textTransform: "none",
              mb: 2,
            }}
          >
            {referenceOpen
              ? "Ocultar referencia"
              : "Ver círculo, terceras y fórmulas"}
          </Button>
          <Button
            variant="text"
            onClick={() => setTopic(10)}
            sx={{ color: accent, textTransform: "none", mb: 2, ml: { sm: 1 } }}
          >
            Ir al simulacro interactivo
          </Button>
          {referenceOpen && (
            <Box
              id="harmony-quick-reference"
              sx={{ pb: 2.5, mb: 2.5, borderBottom: "1px solid #dce3e1" }}
            >
              <Typography component="h2" sx={{ fontSize: 21, fontWeight: 850 }}>
                Círculo de quintas · referencia
              </Typography>
              <Typography sx={{ mt: 0.75, color: "#56696a", lineHeight: 1.7 }}>
                Elige una tonalidad mayor en el círculo; las parejas de abajo
                usan las notas y alteraciones de esa escala. La misma tonalidad
                se usa en armonización y Turn Around.
              </Typography>
              <Circle selected={tonic} onSelect={setTonic} />
              <Typography sx={{ lineHeight: 1.7 }}>
                <strong>
                  {spanishNote(tonic)} mayor ({tonic})
                </strong>{" "}
                · {key.signature}
                <br />
                Escala: {notes([...key.notes, key.tonic])}.
              </Typography>
              <SeventhChordQuickReference />
              <ThirdPairs
                tonic={tonic}
                index={pairIndex}
                onChange={setPairIndex}
              />
            </Box>
          )}
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel id="harmony-exam-topic-label">
              Tema de la guía
            </InputLabel>
            <Select
              labelId="harmony-exam-topic-label"
              label="Tema de la guía"
              value={topic}
              onChange={(event) => setTopic(Number(event.target.value))}
            >
              {topics.map((name, i) => (
                <MenuItem key={name} value={i}>
                  {i + 1}. {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box
            sx={{
              "& p, & li": { lineHeight: 1.8 },
              "& li": { mb: 0.5 },
              "& p": { mt: 1, mb: 1 },
              overflowWrap: "break-word",
            }}
          >
            {topic === 0 && (
              <>
                <Heading>¿Qué estudiar primero?</Heading>
                <p>
                  Esta guía reúne las clases de Armonía: escalas, círculo de
                  quintas, tríadas, cuatríadas, inversiones y armonización.
                  También incluye cadencias y Turn Around, que trabajaron en las
                  tareas.
                </p>
                <p>
                  En la grabación más reciente se repasan los temas de Armonía,
                  pero no queda confirmada una lista exhaustiva del examen. Usa
                  esto como guía de estudio; el simulacro contiene ejercicios de
                  práctica, no preguntas confirmadas.
                </p>
                <ol>
                  <li>Empieza por nombres de notas, tonos y semitonos.</li>
                  <li>
                    Construye una escala mayor y encuentra su menor relativa.
                  </li>
                  <li>Construye e identifica tríadas y acordes con séptima.</li>
                  <li>Armoniza la escala y cambia los acordes de inversión.</li>
                  <li>
                    Resuelve el simulacro sin mirar y después comprueba cada
                    respuesta.
                  </li>
                </ol>
                <Diagram label="Ruta de estudio: notas, escalas, acordes, inversiones y progresiones">
                  Notas → escala → acordes → inversiones → progresiones
                </Diagram>
                <p>
                  Consejo: escribe las notas con sus alteraciones y di sus
                  nombres en voz alta. C = Do, D = Re, E = Mi, F = Fa, G = Sol,
                  A = La y B = Si.
                </p>
              </>
            )}
            {topic === 1 && (
              <>
                <Heading>Notas, tonos e intervalos</Heading>
                <p>
                  Un <strong>semitono</strong> es la distancia entre dos teclas
                  vecinas del piano, sean blancas o negras. Un{" "}
                  <strong>tono</strong> equivale a dos semitonos. Entre Mi–Fa y
                  Si–Do ya hay un semitono sin tecla negra intermedia.
                </p>
                <Diagram label="Un tono son dos semitonos: Do, Do sostenido, Re">
                  Do → Do♯ → Re
                  <br />1 semitono + 1 semitono = 1 tono
                </Diagram>
                <p>
                  Un <strong>intervalo</strong> es la distancia entre dos notas.
                  Cuenta las letras incluyendo ambas: Do–Re–Mi son tres nombres,
                  así que Do–Mi es una tercera. Después cuenta semitonos para
                  saber si es mayor o menor.
                </p>
                <Table
                  headings={["Intervalo", "Semitonos", "Ejemplo desde Do"]}
                  rows={[
                    ["3ª menor", "3", "Do–Mi♭"],
                    ["3ª mayor", "4", "Do–Mi"],
                    ["5ª disminuida", "6", "Do–Sol♭"],
                    ["5ª justa", "7", "Do–Sol"],
                    ["7ª disminuida", "9", "Do–Si𝄫"],
                    ["7ª menor", "10", "Do–Si♭"],
                    ["7ª mayor", "11", "Do–Si"],
                  ]}
                />
                <p>
                  <strong>Enarmonía:</strong> dos nombres pueden sonar en la
                  misma tecla. Do♯ y Re♭ comparten tecla, pero no se escriben
                  igual al construir una escala o un intervalo. Si𝄫 suena como
                  La en el piano, pero es una séptima de Do; La es una sexta.
                </p>
                <p>
                  <strong>Tónica</strong> es la nota que da nombre a una
                  tonalidad; la <strong>fundamental</strong> da nombre a cada
                  acorde; el <strong>bajo</strong> es la nota más grave que
                  suena. En una inversión, fundamental y bajo pueden ser
                  diferentes.
                </p>
              </>
            )}
            {topic === 2 && (
              <>
                <Heading>Escalas y relativas</Heading>
                <p>
                  Una escala usa siete nombres consecutivos y repite la tónica
                  en la octava. Las letras no se saltan aunque haya sostenidos o
                  bemoles.
                </p>
                <Table
                  headings={[
                    "Escala",
                    "Distancias entre notas",
                    "Grados desde la tónica",
                  ]}
                  rows={[
                    [
                      "Mayor",
                      "T – T – ST – T – T – T – ST",
                      "1 – 2 – 3 – 4 – 5 – 6 – 7",
                    ],
                    [
                      "Menor natural",
                      "T – ST – T – T – ST – T – T",
                      "1 – 2 – ♭3 – 4 – 5 – ♭6 – ♭7",
                    ],
                  ]}
                />
                <p>
                  T = tono; ST = semitono. Las fórmulas menores se comparan con
                  la escala mayor de la <em>misma tónica</em>.
                </p>
                <Subheading>
                  Ejemplo paso a paso: Do mayor y La menor
                </Subheading>
                <ol>
                  <li>
                    Do mayor: <strong>Do–Re–Mi–Fa–Sol–La–Si–Do</strong>.
                  </li>
                  <li>
                    Cuenta desde Do: el sexto grado es La. También puedes bajar
                    tres semitonos: Do → Si → Si♭ → La.
                  </li>
                  <li>
                    Empieza con La y conserva las mismas notas:{" "}
                    <strong>La–Si–Do–Re–Mi–Fa–Sol–La</strong>.
                  </li>
                  <li>
                    Para volver, sube una tercera menor desde La o cuenta
                    La–Si–Do: la relativa mayor es Do.
                  </li>
                </ol>
                <Diagram label="Do mayor y La menor comparten notas pero tienen distintas tónicas">
                  Do mayor ↔ La menor natural
                  <br />
                  Misma armadura · distinta tónica
                </Diagram>
                <p>
                  Las relativas comparten armadura. Las paralelas comparten
                  tónica: Do mayor y Do menor tienen distintas armaduras. El
                  profesor mencionó además las menores armónica y melódica; el
                  ejercicio más reciente se centró en la{" "}
                  <strong>menor natural</strong>.
                </p>
                <Subheading>Otras menores · repaso añadido</Subheading>
                <p>
                  La menor <strong>armónica</strong> sube el séptimo grado de la
                  menor natural: La–Si–Do–Re–Mi–Fa–Sol♯–La. La menor
                  <strong> melódica</strong>, en la práctica clásica, sube el
                  sexto y el séptimo al ascender: La–Si–Do–Re–Mi–Fa♯–Sol♯–La; al
                  descender suele usar la forma natural. En jazz también puede
                  conservar la forma ascendente al bajar. Son ejemplos de
                  repaso, no una lista confirmada para el examen.
                </p>
                <Subheading>Los cinco ejercicios de clase</Subheading>
                <Table
                  headings={["Menor natural", "Notas", "Relativa mayor"]}
                  rows={[
                    ["Do menor", "Do Re Mi♭ Fa Sol La♭ Si♭ Do", "Mi♭"],
                    ["Sol menor", "Sol La Si♭ Do Re Mi♭ Fa Sol", "Si♭"],
                    ["Si menor", "Si Do♯ Re Mi Fa♯ Sol La Si", "Re"],
                    ["Do♯ menor", "Do♯ Re♯ Mi Fa♯ Sol♯ La Si Do♯", "Mi"],
                    ["Sol♯ menor", "Sol♯ La♯ Si Do♯ Re♯ Mi Fa♯ Sol♯", "Si"],
                  ]}
                />
              </>
            )}
            {topic === 3 && (
              <>
                <Heading>Círculo de quintas</Heading>
                <p>
                  Cada paso en sentido horario sube una quinta justa: Do → Sol →
                  Re. En sentido contrario se avanza por cuartas: Do → Fa → Si♭.
                  Toca una tonalidad para ver su armadura y su relativa menor.
                </p>
                {!referenceOpen ? (
                  <>
                    <Circle selected={tonic} onSelect={setTonic} />
                    <ThirdPairs
                      tonic={tonic}
                      index={pairIndex}
                      onChange={setPairIndex}
                    />
                  </>
                ) : (
                  <p>
                    El círculo y las parejas por terceras están abiertos en la
                    referencia de arriba.
                  </p>
                )}
                <Typography aria-live="polite">
                  <strong>
                    {spanishNote(tonic)} mayor ({tonic})
                  </strong>{" "}
                  · {key.signature}
                  <br />
                  Escala: {notes([...key.notes, key.tonic])}.<br />
                  Relativa menor natural:{" "}
                  <strong>
                    {spanishNote(key.minor[0])} menor ({key.minor[0]}m)
                  </strong>
                  .<br />
                  Notas: {notes([...key.minor, key.minor[0]])}.
                </Typography>
                <Subheading>Orden de alteraciones</Subheading>
                <p>
                  Sostenidos: <strong>Fa – Do – Sol – Re – La – Mi – Si</strong>
                  . Bemoles: <strong>Si – Mi – La – Re – Sol – Do – Fa</strong>,
                  el orden inverso. Cada nueva armadura conserva las
                  alteraciones anteriores.
                </p>
                <p>
                  El recorrido usa Fa♯ y después Re♭. Do♯ y Re♭ son enarmónicos
                  en el piano; para escribir cada escala, usa los nombres de su
                  propia armadura. Por ejemplo, Fa♯ mayor lleva{" "}
                  <strong>Mi♯</strong>, no Fa natural escrito como séptimo
                  grado.
                </p>
              </>
            )}
            {topic === 4 && (
              <>
                <Heading>Tríadas: tres notas</Heading>
                <p>
                  Una tríada se forma con{" "}
                  <strong>fundamental, tercera y quinta</strong>. Desde Do,
                  cuenta letras alternadas: Do–Mi–Sol. Para saber el tipo,
                  compara la tercera y la quinta con la escala mayor de la misma
                  fundamental.
                </p>
                <Table
                  headings={[
                    "Tipo",
                    "Fórmula",
                    "Ejemplo en Do",
                    "Distancias sobre Do",
                  ]}
                  rows={[
                    [
                      "Mayor",
                      "1 – 3 – 5",
                      "Do – Mi – Sol (C)",
                      "4 y 7 semitonos",
                    ],
                    [
                      "Menor",
                      "1 – ♭3 – 5",
                      "Do – Mi♭ – Sol (Cm)",
                      "3 y 7 semitonos",
                    ],
                    [
                      "Disminuida",
                      "1 – ♭3 – ♭5",
                      "Do – Mi♭ – Sol♭ (C°)",
                      "3 y 6 semitonos",
                    ],
                    [
                      "Aumentada · repaso",
                      "1 – 3 – ♯5",
                      "Do – Mi – Sol♯ (C+)",
                      "4 y 8 semitonos",
                    ],
                  ]}
                />
                <Diagram label="Tríada de Do mayor apilada: Sol, Mi y Do simultáneos">
                  Sol · quinta
                  <br />
                  Mi · tercera
                  <br />
                  <strong>Do · fundamental</strong>
                </Diagram>
                <p>
                  El dibujo representa sonidos simultáneos. Si tocas Do, después
                  Mi y después Sol, tocas un <strong>arpegio</strong>; son las
                  mismas notas pero sucesivas. Si te piden el acorde escrito,
                  colócalas juntas en vertical.
                </p>
                <Subheading>Ejemplo: Sol mayor</Subheading>
                <p>
                  Sol–Si–Re. Sol→Si son cuatro semitonos y Sol→Re siete: tercera
                  mayor y quinta justa. Si bajamos Si a Si♭, obtenemos Sol
                  menor: Sol–Si♭–Re.
                </p>
              </>
            )}
            {topic === 5 && (
              <>
                <Heading>Cuatríadas: tríada + séptima</Heading>
                <p>
                  Una cuatríada añade una séptima a la tríada. El símbolo dice
                  qué cambia: <strong>maj7</strong> indica séptima mayor;{" "}
                  <strong>7</strong> sola indica séptima menor;{" "}
                  <strong>m</strong> antes del 7 indica tríada menor.
                </p>
                <Table
                  headings={["Símbolo", "Fórmula", "Ejemplo desde Do"]}
                  rows={[
                    ["maj7 / Δ7", "1 – 3 – 5 – 7", "Cmaj7: Do Mi Sol Si"],
                    ["7", "1 – 3 – 5 – ♭7", "C7: Do Mi Sol Si♭"],
                    ["m7", "1 – ♭3 – 5 – ♭7", "Cm7: Do Mi♭ Sol Si♭"],
                    ["mMaj7", "1 – ♭3 – 5 – 7", "CmMaj7: Do Mi♭ Sol Si"],
                    ["m7♭5 / ø7", "1 – ♭3 – ♭5 – ♭7", "Cm7♭5: Do Mi♭ Sol♭ Si♭"],
                    [
                      "dim7 / °7",
                      "1 – ♭3 – ♭5 – ♭♭7",
                      "Cdim7: Do Mi♭ Sol♭ Si𝄫",
                    ],
                  ]}
                />
                <p>
                  La séptima mayor está a un semitono de la octava; la menor, a
                  un tono. <strong>Semidisminuido</strong> y{" "}
                  <strong>disminuido 7</strong> comparten tríada disminuida,
                  pero tienen séptima menor y disminuida, respectivamente.
                </p>
                <Subheading>
                  Teclado de referencia · apoyo visual opcional
                </Subheading>
                <FormControl size="small" fullWidth>
                  <InputLabel id="exam-chord-label">
                    Acorde de ejemplo
                  </InputLabel>
                  <Select
                    labelId="exam-chord-label"
                    label="Acorde de ejemplo"
                    value={chordIndex}
                    onChange={(e) => setChordIndex(Number(e.target.value))}
                  >
                    {keyboardExamples.map((c, i) => (
                      <MenuItem key={c.name} value={i}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Keyboard
                  pitches={example.pitches}
                  writtenNotes={example.notes}
                />
                <p>
                  <strong>{example.name}</strong>: {notes(example.notes)} (
                  {names(example.notes)}). Fórmula: {example.formula}.
                </p>
                <p>{example.text}</p>
                <p>
                  El teclado ayuda a visualizar las distancias y equivalencias
                  entre notas. Para resolver el acorde de Armonía, escribe sus
                  notas y alteraciones como aparecen en la línea anterior.
                </p>
                <Subheading>Disminuidos 7 de la tarea anterior</Subheading>
                <p>
                  Parte de la fundamental y apila tres terceras menores. Para
                  escribirlas, conserva una letra de por medio: el último sonido
                  debe llamarse séptima, aunque su tecla coincida con otra nota.
                </p>
                <Table
                  headings={[
                    "Acorde",
                    "Escritura correcta",
                    "Teclas equivalentes",
                  ]}
                  rows={[
                    ["G°7", "Sol – Si♭ – Re♭ – Fa♭", "Sol – Si♭ – Re♭ – Mi"],
                    ["A♭°7", "La♭ – Do♭ – Mi𝄫 – Sol𝄫", "La♭ – Si – Re – Fa"],
                    ["E°7", "Mi – Sol – Si♭ – Re♭", "Mi – Sol – Si♭ – Re♭"],
                  ]}
                />
                <p>
                  El doble bemol baja dos semitonos. G°7 y E°7 comparten las
                  mismas teclas, pero cada acorde se escribe por terceras desde
                  su propia fundamental.
                </p>
              </>
            )}
            {topic === 6 && (
              <>
                <Heading>Armonizar una escala mayor</Heading>
                <p>
                  Armonizar es construir un acorde sobre cada grado de la
                  escala, usando únicamente sus notas. Para una tríada toma la
                  nota de partida y salta una: <strong>1–3–5</strong>. Para una
                  cuatríada agrega otra tercera: <strong>1–3–5–7</strong>.
                </p>
                <p>
                  Elige una tonalidad para ver sus siete grados. Los números de
                  la fórmula vuelven a contarse desde la fundamental de cada
                  acorde.
                </p>
                <FormControl size="small" fullWidth>
                  <InputLabel id="exam-key-label">Tonalidad mayor</InputLabel>
                  <Select
                    labelId="exam-key-label"
                    label="Tonalidad mayor"
                    value={tonic}
                    onChange={(e) => setTonic(e.target.value)}
                  >
                    {HARMONY_KEYS.map((k) => (
                      <MenuItem key={k.tonic} value={k.tonic}>
                        {spanishNote(k.tonic)} mayor ({k.tonic})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <p>
                  <strong>Escala:</strong> {notes([...key.notes, key.tonic])}.{" "}
                  {key.signature}.
                </p>
                <Table
                  headings={["Grado", "Tríada · notas", "Cuatríada · notas"]}
                  rows={key.chords.map((c) => [
                    c.degree,
                    <>
                      {c.triadName}
                      <br />
                      {notes(c.triad)}
                    </>,
                    <>
                      {c.seventhName}
                      <br />
                      {notes(c.seventh)}
                    </>,
                  ])}
                />
                <p>
                  El patrón en mayor es{" "}
                  <strong>
                    Mayor – menor – menor – Mayor – Mayor – menor – disminuida
                  </strong>
                  . Con séptimas:{" "}
                  <strong>maj7 – m7 – m7 – maj7 – 7 – m7 – m7♭5</strong>. El V7
                  tiene séptima menor; el vii es semidisminuido, no disminuido 7
                  completo.
                </p>
                <p>
                  Ejemplo en Do: para el V, empieza en Sol y toma Sol–Si–Re–Fa.
                  La tercera es mayor y Fa es séptima menor: <strong>G7</strong>
                  , no Gmaj7.
                </p>
              </>
            )}
            {topic === 7 && (
              <>
                <Heading>Inversiones: cambia la nota del bajo</Heading>
                <p>
                  La fundamental sigue dando nombre al acorde. La inversión se
                  decide por la{" "}
                  <strong>nota más grave que realmente suena</strong>, aunque
                  las voces superiores estén en otro orden.
                </p>
                <Subheading>Tríada de Do mayor: dos inversiones</Subheading>
                <Table
                  headings={["Estado", "De grave a agudo", "Bajo", "Cifrado"]}
                  rows={[
                    ["Fundamental", "Do4 – Mi4 – Sol4", "Do: 1", "C"],
                    ["1ª inversión", "Mi4 – Sol4 – Do5", "Mi: 3", "C/E · I⁶"],
                    ["2ª inversión", "Sol4 – Do5 – Mi5", "Sol: 5", "C/G · I⁶₄"],
                  ]}
                />
                <ChordStaff
                  chord={{ root: "C", name: "Do", notes: ["C", "E", "G", "B"] }}
                  triad
                />
                <p>
                  Para pasar a la siguiente disposición, sube la nota de abajo
                  una octava. Los números 6 y 6/4 son intervalos sobre el bajo
                  en el cifrado tradicional; <strong>C6</strong> es otro
                  símbolo: Do–Mi–Sol–La.
                </p>
                <Subheading>Cmaj7: tres inversiones</Subheading>
                <Table
                  headings={["Estado", "Notas de grave a agudo", "Bajo"]}
                  rows={[
                    ["Fundamental", "Do4 Mi4 Sol4 Si4", "Do · fundamental"],
                    ["1ª", "Mi4 Sol4 Si4 Do5", "Mi · tercera"],
                    ["2ª", "Sol4 Si4 Do5 Mi5", "Sol · quinta"],
                    ["3ª", "Si4 Do5 Mi5 Sol5", "Si · séptima"],
                  ]}
                />
                <ChordStaff
                  chord={{ root: "C", name: "Do", notes: ["C", "E", "G", "B"] }}
                  triad={false}
                />
                <p>
                  Una tríada tiene tres posiciones en total; una cuatríada,
                  cuatro. En la tarea de clase se pidieron los doce acordes maj7
                  del círculo en las cuatro posiciones: 12 × 4 = 48
                  disposiciones.
                </p>
              </>
            )}
            {topic === 8 && (
              <>
                <Heading>Cadencias y Turn Around</Heading>
                <p>
                  Una <strong>cadencia</strong> enlaza acordes y crea una
                  sensación de llegada. En mayor, una muy usada es ii–V–I. El
                  Turn Around estudiado añade el vi antes:{" "}
                  <strong>Imaj7 – vim7 – iim7 – V7</strong>.
                </p>
                <p>
                  Selecciona la tonalidad y sigue los cuatro pasos. El grado se
                  cuenta dentro de la escala; la fórmula de cada acorde vuelve a
                  empezar desde su propia fundamental.
                </p>
                <FormControl size="small" fullWidth>
                  <InputLabel id="exam-turnaround-key">
                    Tonalidad mayor
                  </InputLabel>
                  <Select
                    labelId="exam-turnaround-key"
                    label="Tonalidad mayor"
                    value={tonic}
                    onChange={(e) => setTonic(e.target.value)}
                  >
                    {HARMONY_KEYS.map((k) => (
                      <MenuItem key={k.tonic} value={k.tonic}>
                        {spanishNote(k.tonic)} mayor ({k.tonic})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <ol>
                  <li>
                    Escribe la escala: {notes([...key.notes, key.tonic])}.
                  </li>
                  <li>
                    Selecciona grados <strong>1, 6, 2 y 5</strong>:{" "}
                    {notes(key.turnaround.map((c) => c.root))}. Son cuatro
                    fundamentales, no las notas de un solo acorde.
                  </li>
                  <li>Desde cada una, toma 1–3–5–7 dentro de la escala.</li>
                  <li>
                    Aplica los nombres:{" "}
                    {key.turnaround.map((c) => c.seventhName).join(" → ")}.
                  </li>
                </ol>
                <Table
                  headings={["Grado", "Acorde", "Notas"]}
                  rows={key.turnaround.map((c, i) => [
                    ["Imaj7", "vim7", "iim7", "V7"][i],
                    c.seventhName,
                    notes(c.seventh),
                  ])}
                />
                <p>
                  La cadencia ii–V–I en esta tonalidad es{" "}
                  <strong>
                    {key.chords[1].seventhName} → {key.chords[4].seventhName} →{" "}
                    {key.chords[0].seventhName}
                  </strong>
                  . Si el último acorde se pide como tríada, no agregues la
                  séptima automáticamente.
                </p>
              </>
            )}
            {topic === 9 && (
              <>
                <Heading>Simulacro: aprende paso a paso</Heading>
                <p>
                  Abre una pregunta y sigue la explicación mientras la resuelves
                  en tu cuaderno. Cada solución comienza con los datos, explica
                  cómo llegar al resultado y termina con una comprobación. Son
                  ejercicios de práctica, no preguntas confirmadas del examen.
                </p>
                <Button
                  variant="outlined"
                  onClick={() => setTopic(10)}
                  sx={{ textTransform: "none", mt: 1, mb: 1 }}
                >
                  Practicar respondiendo preguntas
                </Button>
                <p>
                  <strong>Antes de empezar:</strong> una escala es una lista de
                  notas; un <strong>grado</strong> es la posición de una nota en
                  esa lista. Una <strong>fundamental</strong> es la nota que da
                  nombre a un acorde. Un semitono es la distancia cromática más
                  pequeña entre dos notas vecinas; un tono son dos semitonos. ♯
                  sube un semitono y ♭ lo baja.
                </p>
                <Answer question="1. ¿Cuál es la relativa menor de Sol mayor?">
                  <ol>
                    <li>
                      <strong>Escribe Sol mayor.</strong> Sus notas son Sol – La
                      – Si – Do – Re – Mi – Fa♯ – Sol. La armadura tiene un
                      sostenido: Fa♯.
                    </li>
                    <li>
                      <strong>Cuenta hasta el sexto grado.</strong> Sol es 1, La
                      es 2, Si es 3, Do es 4, Re es 5 y <strong>Mi es 6</strong>
                      .
                    </li>
                    <li>
                      <strong>Empieza desde Mi sin cambiar la armadura.</strong>{" "}
                      Reordena las mismas notas: Mi – Fa♯ – Sol – La – Si – Do –
                      Re – Mi. Esa es la escala de Mi menor natural.
                    </li>
                    <li>
                      <strong>Comprueba la distancia.</strong> Desde Sol baja
                      tres semitonos: Sol → Fa♯ → Fa → Mi. Llegas a la misma
                      nota, una tercera menor descendente.
                    </li>
                  </ol>
                  <p>
                    <strong>¿Por qué usamos el sexto grado?</strong> Una escala
                    mayor y su relativa menor natural comparten las mismas siete
                    notas y la misma armadura. Si empiezas la lista de Sol mayor
                    en su sexto grado, Mi, aparece la sucesión de tonos y
                    semitonos de Mi menor natural. Comparten notas, pero Mi pasa
                    a ser el centro o <strong>tónica</strong> de la menor.
                  </p>
                  <Table
                    headings={[
                      "Grado en Sol mayor",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                    ]}
                    rows={[
                      ["Nota", "Sol", "La", "Si", "Do", "Re", "Mi", "Fa♯"],
                    ]}
                  />
                  <p>
                    <strong>Revisa la menor:</strong> Mi–Fa♯ es tono; Fa♯–Sol,
                    semitono; Sol–La y La–Si, tonos; Si–Do, semitono; Do–Re y
                    Re–Mi, tonos. Se cumple T–ST–T–T–ST–T–T. No quites el Fa♯:
                    compartir armadura significa conservarlo.
                  </p>
                  <p>
                    <strong>Respuesta:</strong> la relativa menor de Sol mayor
                    es <strong>Mi menor</strong>. Ambas comparten Fa♯, pero su
                    tónica es distinta.
                  </p>
                </Answer>
                <Answer question="2. Escribe Re menor natural e indica su relativa mayor.">
                  <ol>
                    <li>
                      <strong>Escribe las letras desde Re.</strong> Re – Mi – Fa
                      – Sol – La – Si – Do – Re. Todavía falta comprobar las
                      alteraciones.
                    </li>
                    <li>
                      <strong>Aplica la fórmula menor natural:</strong> tono –
                      semitono – tono – tono – semitono – tono – tono. Re–Mi es
                      tono y Mi–Fa es semitono; Fa–Sol y Sol–La son tonos.
                      Después de La necesitas un semitono, por eso la siguiente
                      nota es <strong>Si♭</strong>, no Si natural.
                    </li>
                    <li>
                      <strong>Completa la escala.</strong> Si♭–Do y Do–Re son
                      tonos: Re – Mi – Fa – Sol – La – Si♭ – Do – Re.
                    </li>
                    <li>
                      <strong>Busca el tercer grado:</strong> Re es 1, Mi es 2 y
                      Fa es 3. La relativa mayor es <strong>Fa mayor</strong>.
                    </li>
                  </ol>
                  <p>
                    <strong>Comprueba cada salto, no solo los bemoles:</strong>{" "}
                    empieza en Re y compara cada pareja de notas con la fórmula.
                    La columna «resultado» es la siguiente nota que escribes.
                  </p>
                  <Table
                    headings={["Desde", "Distancia pedida", "Llegas a"]}
                    rows={[
                      ["Re", "1 tono", "Mi"],
                      ["Mi", "1 semitono", "Fa"],
                      ["Fa", "1 tono", "Sol"],
                      ["Sol", "1 tono", "La"],
                      ["La", "1 semitono", "Si♭"],
                      ["Si♭", "1 tono", "Do"],
                      ["Do", "1 tono", "Re · octava"],
                    ]}
                  />
                  <p>
                    La <strong>octava</strong> repite el nombre de la tónica en
                    un registro más agudo. Para encontrar la relativa mayor,
                    cuenta Re como 1, no como 0: Re–Mi–Fa. Es Fa mayor, no Fa
                    menor; la palabra «mayor» forma parte de la respuesta.
                  </p>
                  <p>
                    <strong>Comprobación:</strong> Fa mayor es Fa – Sol – La –
                    Si♭ – Do – Re – Mi – Fa. Tiene las mismas notas y el mismo
                    Si♭; cambia la tónica, de Re a Fa.
                  </p>
                </Answer>
                <Answer question="3. Construye Gmaj7 y G7. ¿Qué cambia?">
                  <ol>
                    <li>
                      <strong>Identifica la fundamental.</strong> G significa
                      Sol. Escribe Sol mayor: Sol – La – Si – Do – Re – Mi – Fa♯
                      – Sol.
                    </li>
                    <li>
                      <strong>Forma Gmaj7.</strong> Maj7 usa los grados 1 – 3 –
                      5 – 7 de esa escala: Sol – Si – Re – Fa♯. Los primeros
                      tres forman la tríada mayor y Fa♯ es la séptima mayor.
                    </li>
                    <li>
                      <strong>Forma G7.</strong> Su fórmula es 1 – 3 – 5 – ♭7:
                      conserva Sol – Si – Re y baja la séptima Fa♯ un semitono a{" "}
                      <strong>Fa natural</strong>. Queda Sol – Si – Re – Fa.
                    </li>
                    <li>
                      <strong>Compara las séptimas.</strong> Fa♯ está a un
                      semitono de la octava Sol; Fa natural está a un tono. Por
                      eso una es mayor y la otra menor.
                    </li>
                  </ol>
                  <p>
                    <strong>Desglose de los grados:</strong> cada número indica
                    una posición de la escala de Sol. Primero toma la nota del
                    grado, y después fíjate si el símbolo pide modificarla.
                  </p>
                  <Table
                    headings={["Qué buscamos", "En Sol mayor", "Gmaj7", "G7"]}
                    rows={[
                      ["1 · fundamental", "Sol", "Sol", "Sol"],
                      ["3 · tercera mayor", "Si", "Si", "Si"],
                      ["5 · quinta justa", "Re", "Re", "Re"],
                      [
                        "7 · séptima",
                        "Fa♯",
                        "Fa♯ · mayor",
                        "Fa natural · menor",
                      ],
                    ]}
                  />
                  <p>
                    <strong>¿Qué significa ♭7?</strong> Se compara con el
                    séptimo grado de la escala mayor de la misma fundamental. En
                    Sol, ese grado es Fa♯; bajarlo un semitono da Fa natural. El
                    símbolo ♭7 describe la distancia, no obliga a que la nota
                    final lleve un bemol escrito.
                  </p>
                  <p>
                    <strong>Respuesta:</strong> Gmaj7 = Sol – Si – Re – Fa♯; G7
                    = Sol – Si – Re – Fa. Solo cambia la séptima.
                  </p>
                </Answer>
                <Answer question="4. Construye Dm7 y explica la fórmula.">
                  <ol>
                    <li>
                      <strong>Lee el símbolo:</strong> D es Re; la m indica
                      tríada menor y el 7 indica séptima menor. La fórmula es 1
                      – ♭3 – 5 – ♭7.
                    </li>
                    <li>
                      <strong>Usa Re mayor como punto de comparación:</strong>{" "}
                      Re – Mi – Fa♯ – Sol – La – Si – Do♯ – Re. Sus grados 1, 3,
                      5 y 7 son Re, Fa♯, La y Do♯.
                    </li>
                    <li>
                      <strong>Baja la tercera y la séptima un semitono.</strong>{" "}
                      Fa♯ pasa a Fa natural; Do♯ pasa a Do natural. Re y La
                      permanecen igual.
                    </li>
                    <li>
                      <strong>Ordena las cuatro notas:</strong> Re – Fa – La –
                      Do. Desde Re, Fa es tercera menor, La quinta justa y Do
                      séptima menor.
                    </li>
                  </ol>
                  <p>
                    <strong>Tabla para no saltarte ninguna nota:</strong> toma
                    cada grado desde <em>Re</em>, la fundamental de este acorde,
                    y aplica el cambio de la fórmula. La ♭ delante del número
                    significa bajar ese grado un semitono respecto de Re mayor.
                  </p>
                  <Table
                    headings={[
                      "Fórmula",
                      "En Re mayor",
                      "Cambio",
                      "Nota de Dm7",
                    ]}
                    rows={[
                      ["1", "Re", "Sin cambio", "Re"],
                      ["♭3", "Fa♯", "Bajar 1 semitono", "Fa natural"],
                      ["5", "La", "Sin cambio", "La"],
                      ["♭7", "Do♯", "Bajar 1 semitono", "Do natural"],
                    ]}
                  />
                  <p>
                    <strong>Comprueba las distancias desde Re:</strong> Re → Re♯
                    → Mi → Fa son 3 semitonos, una tercera menor; Re hasta La
                    son 7, una quinta justa; Re hasta Do son 10, una séptima
                    menor. Así sabes por qué se llama <strong>menor 7</strong>.
                  </p>
                  <p>
                    <strong>Respuesta:</strong> Dm7 ={" "}
                    <strong>Re – Fa – La – Do</strong>. Comprueba que hay cuatro
                    notas y que no dejaste Fa♯ ni Do♯ del acorde de referencia.
                  </p>
                </Answer>
                <Answer question="5. Diferencia Bm7♭5 de Bdim7.">
                  <ol>
                    <li>
                      <strong>Empieza en la misma fundamental:</strong> B = Si.
                      Los dos acordes usan una tríada disminuida: 1 – ♭3 – ♭5.
                    </li>
                    <li>
                      <strong>Construye esa tríada.</strong> En Si mayor, los
                      grados 1, 3 y 5 son Si, Re♯ y Fa♯. Baja Re♯ y Fa♯ un
                      semitono: queda <strong>Si – Re – Fa</strong>.
                    </li>
                    <li>
                      <strong>Para Bm7♭5 agrega séptima menor.</strong> La
                      séptima de Si debe llamarse La; la menor es La natural.
                      Resultado: Si – Re – Fa – La. También se llama Bø7.
                    </li>
                    <li>
                      <strong>
                        Para Bdim7 baja esa séptima un semitono más.
                      </strong>{" "}
                      La pasa a La♭: Si – Re – Fa – La♭. Es una séptima
                      disminuida, por eso se escribe La♭ y no Sol♯.
                    </li>
                  </ol>
                  <p>
                    <strong>Construcción nota por nota:</strong> Si mayor es Si
                    – Do♯ – Re♯ – Mi – Fa♯ – Sol♯ – La♯ – Si. Partimos de sus
                    grados 1, 3, 5 y 7 y bajamos los que indique cada fórmula.
                  </p>
                  <Table
                    headings={["Grado", "Si mayor", "Bm7♭5", "Bdim7"]}
                    rows={[
                      ["1", "Si", "Si", "Si"],
                      ["♭3", "Re♯", "Re natural", "Re natural"],
                      ["♭5", "Fa♯", "Fa natural", "Fa natural"],
                      ["7", "La♯", "La natural · ♭7", "La♭ · ♭♭7"],
                    ]}
                  />
                  <p>
                    <strong>
                      ¿Por qué la última nota sigue llamándose La?
                    </strong>{" "}
                    Al contar letras desde Si, la séptima es La: Si–Do–Re–Mi–
                    Fa–Sol–La. La♭ y Sol♯ pueden sonar igual, pero Sol sería una
                    sexta escrita; La♭ conserva el nombre de séptima.
                  </p>
                  <p>
                    <strong>Comprobación:</strong> la tríada es igual en ambos;
                    solo cambia la última nota. La está a diez semitonos de Si y
                    La♭, a nueve.
                  </p>
                </Answer>
                <Answer question="6. ¿Cuál es la primera inversión de Sol mayor?">
                  <ol>
                    <li>
                      <strong>Construye el acorde:</strong> G = Sol mayor. De la
                      escala de Sol toma 1, 3 y 5: Sol – Si – Re.
                    </li>
                    <li>
                      <strong>Identifica el bajo actual.</strong> En Sol3 – Si3
                      – Re4, Sol3 es la nota más grave: está en posición
                      fundamental.
                    </li>
                    <li>
                      <strong>Sube el bajo una octava.</strong> Mueve Sol3 a
                      Sol4 y deja Si3 y Re4 donde están. De grave a agudo queda
                      Si3 – Re4 – Sol4.
                    </li>
                    <li>
                      <strong>Mira el nuevo bajo.</strong> Si es la tercera del
                      acorde; tercera en el bajo significa primera inversión.
                    </li>
                  </ol>
                  <p>
                    <strong>De dónde sale Sol–Si–Re:</strong> escribe Sol mayor
                    Sol–La–Si–Do–Re–Mi–Fa♯. Su primer grado es Sol, el tercero
                    Si y el quinto Re. Esos son 1–3–5 del acorde; no se añade
                    Fa♯ porque aquí se pide una tríada, no una cuatríada.
                  </p>
                  <Diagram label="Sol mayor: Sol en el bajo pasa a Si en el bajo al subir Sol una octava">
                    Fundamental: <strong>Sol3</strong> – Si3 – Re4
                    <br />
                    Sube Sol3 → Sol4
                    <br />
                    Primera inversión: <strong>Si3</strong> – Re4 – Sol4
                  </Diagram>
                  <p>
                    Los números 3 y 4 indican el <strong>registro</strong>, no
                    grados del acorde. Una octava más arriba es la misma nota en
                    un registro más agudo. Si la consigna no fija octavas, usa
                    un registro donde Si sea realmente la nota más grave.
                  </p>
                  <p>
                    <strong>Respuesta:</strong> Si – Re – Sol, también G/B. La
                    fundamental sigue siendo Sol: G/B significa «Sol mayor con
                    Si en el bajo», no Si mayor.
                  </p>
                </Answer>
                <Answer question="7. Escribe la tercera inversión de Cmaj7.">
                  <ol>
                    <li>
                      <strong>Construye Cmaj7.</strong> C = Do; maj7 usa 1 – 3 –
                      5 – 7 de Do mayor: Do – Mi – Sol – Si.
                    </li>
                    <li>
                      <strong>Parte de la posición fundamental:</strong> Do4 –
                      Mi4 – Sol4 – Si4. El bajo es Do.
                    </li>
                    <li>
                      <strong>Primera inversión:</strong> sube Do4 una octava.
                      Obtienes Mi4 – Sol4 – Si4 – Do5; el bajo es Mi.
                    </li>
                    <li>
                      <strong>Segunda inversión:</strong> sube Mi4. Queda Sol4 –
                      Si4 – Do5 – Mi5; el bajo es Sol.
                    </li>
                    <li>
                      <strong>Tercera inversión:</strong> sube Sol4. Queda Si4 –
                      Do5 – Mi5 – Sol5; ahora el bajo es Si, la séptima.
                    </li>
                  </ol>
                  <p>
                    <strong>
                      Antes de invertir, identifica el papel de cada nota:
                    </strong>{" "}
                    Do es la fundamental, Mi la tercera, Sol la quinta y Si la
                    séptima mayor. El número de la inversión depende de cuál
                    queda abajo; no significa cambiar el nombre del acorde.
                  </p>
                  <Table
                    headings={["Estado", "De grave a agudo", "Nota del bajo"]}
                    rows={[
                      ["Fundamental", "Do4 – Mi4 – Sol4 – Si4", "Do · 1"],
                      ["Primera", "Mi4 – Sol4 – Si4 – Do5", "Mi · 3"],
                      ["Segunda", "Sol4 – Si4 – Do5 – Mi5", "Sol · 5"],
                      ["Tercera", "Si4 – Do5 – Mi5 – Sol5", "Si · 7"],
                    ]}
                  />
                  <p>
                    Una cuatríada tiene cuatro notas: por eso existen cuatro
                    posiciones en total, pero solo tres se llaman inversiones.
                    Si escribieras Si♭, cambiarías la séptima y obtendrías un
                    acorde distinto de Cmaj7.
                  </p>
                  <p>
                    <strong>Respuesta:</strong> Si – Do – Mi – Sol, de grave a
                    agudo. Comprueba que siguen las cuatro notas originales y
                    que la séptima, Si, está abajo.
                  </p>
                </Answer>
                <Answer question="8. Armoniza Do mayor a cuatro voces.">
                  <ol>
                    <li>
                      <strong>Escribe la escala:</strong> Do – Re – Mi – Fa –
                      Sol – La – Si. En Do mayor no se agregan alteraciones.
                    </li>
                    <li>
                      <strong>Numera cada nota:</strong> Do = I, Re = ii, Mi =
                      iii, Fa = IV, Sol = V, La = vi y Si = vii.
                    </li>
                    <li>
                      <strong>Apila terceras sobre cada grado.</strong> Empieza
                      en la nota del acorde y toma una sí y otra no hasta tener
                      cuatro: desde Do, Do – Mi – Sol – Si. Si llegas al final
                      de la escala, continúa desde Do en la siguiente octava.
                    </li>
                    <li>
                      <strong>Nombra cada resultado</strong> según su tríada y
                      su séptima. La tabla muestra el procedimiento completo
                      para los siete grados:
                    </li>
                  </ol>
                  <Table
                    headings={["Grado", "Notas de 1 – 3 – 5 – 7", "Acorde"]}
                    rows={[
                      ["I", "Do – Mi – Sol – Si", "Cmaj7"],
                      ["ii", "Re – Fa – La – Do", "Dm7"],
                      ["iii", "Mi – Sol – Si – Re", "Em7"],
                      ["IV", "Fa – La – Do – Mi", "Fmaj7"],
                      ["V", "Sol – Si – Re – Fa", "G7"],
                      ["vi", "La – Do – Mi – Sol", "Am7"],
                      ["vii", "Si – Re – Fa – La", "Bm7♭5 / Bø7"],
                    ]}
                  />
                  <p>
                    <strong>Ahora hazlo uno por uno.</strong> «Toma» significa
                    escribir esa nota en el acorde; «salta» significa pasar a la
                    siguiente sin incluirla. Todas son notas de Do mayor, aunque
                    el recorrido continúe después de Si.
                  </p>
                  <ol>
                    <li>
                      <strong>I: desde Do.</strong> Toma Do, salta Re, toma Mi,
                      salta Fa, toma Sol, salta La y toma Si → Do–Mi–Sol–Si.
                      Do–Mi es tercera mayor y Do–Si, séptima mayor:{" "}
                      <strong>Cmaj7</strong>.
                    </li>
                    <li>
                      <strong>ii: desde Re.</strong> Toma Re, salta Mi, toma Fa,
                      salta Sol, toma La, salta Si y toma Do → Re–Fa–La–Do.
                      Re–Fa es tercera menor y Re–Do, séptima menor:{" "}
                      <strong>Dm7</strong>.
                    </li>
                    <li>
                      <strong>iii: desde Mi.</strong> Toma Mi, salta Fa, toma
                      Sol, salta La, toma Si, salta Do y toma Re → Mi–Sol–Si–Re.
                      Mi–Sol es tercera menor y Mi–Re, séptima menor:{" "}
                      <strong>Em7</strong>.
                    </li>
                    <li>
                      <strong>IV: desde Fa.</strong> Toma Fa, salta Sol, toma
                      La, salta Si, toma Do, salta Re y toma Mi → Fa–La–Do–Mi.
                      Fa–La es tercera mayor y Fa–Mi, séptima mayor:{" "}
                      <strong>Fmaj7</strong>.
                    </li>
                    <li>
                      <strong>V: desde Sol.</strong> Toma Sol, salta La, toma
                      Si, salta Do, toma Re, salta Mi y toma Fa → Sol–Si–Re–Fa.
                      Sol–Si es tercera mayor, pero Sol–Fa es séptima menor:{" "}
                      <strong>G7</strong>, no Gmaj7.
                    </li>
                    <li>
                      <strong>vi: desde La.</strong> Toma La, salta Si, toma Do,
                      salta Re, toma Mi, salta Fa y toma Sol → La–Do–Mi–Sol.
                      La–Do es tercera menor y La–Sol, séptima menor:{" "}
                      <strong>Am7</strong>.
                    </li>
                    <li>
                      <strong>vii: desde Si.</strong> Toma Si, salta Do, toma
                      Re, salta Mi, toma Fa, salta Sol y toma La → Si–Re–Fa–La.
                      Si–Re es tercera menor, Si–Fa quinta disminuida y Si–La
                      séptima menor: <strong>Bm7♭5</strong>.
                    </li>
                  </ol>
                  <p>
                    <strong>Comprueba:</strong> el V es G7 porque Fa es una
                    séptima menor sobre Sol; el vii es semidisminuido porque su
                    quinta es Fa y su séptima es La. No lleva una séptima
                    disminuida.
                  </p>
                </Answer>
                <Answer question="9. Forma el Turn Around de Re mayor.">
                  <ol>
                    <li>
                      <strong>Escribe Re mayor:</strong> Re – Mi – Fa♯ – Sol –
                      La – Si – Do♯. Su armadura tiene Fa♯ y Do♯.
                    </li>
                    <li>
                      <strong>Numera la escala.</strong> Re = 1, Mi = 2, Fa♯ =
                      3, Sol = 4, La = 5, Si = 6 y Do♯ = 7.
                    </li>
                    <li>
                      <strong>Elige las fundamentales del Turn Around:</strong>{" "}
                      I – vi – ii – V significa grados 1 – 6 – 2 – 5. Aquí son
                      <strong> Re – Si – Mi – La</strong>: son las notas donde
                      comienza cada acorde, no cuatro notas de un solo acorde.
                    </li>
                    <li>
                      <strong>Apila terceras desde cada fundamental.</strong>{" "}
                      Usa las notas de Re mayor y toma una sí y una no hasta
                      tener cuatro:
                    </li>
                  </ol>
                  <Table
                    headings={["Grado", "Notas", "Nombre"]}
                    rows={[
                      ["Imaj7", "Re – Fa♯ – La – Do♯", "Dmaj7"],
                      ["vim7", "Si – Re – Fa♯ – La", "Bm7"],
                      ["iim7", "Mi – Sol – Si – Re", "Em7"],
                      ["V7", "La – Do♯ – Mi – Sol", "A7"],
                    ]}
                  />
                  <p>
                    <strong>Qué significa cada apellido:</strong> maj7 = tríada
                    mayor y séptima mayor; m7 = tríada menor y séptima menor; 7
                    = tríada mayor y séptima menor. Vamos a construir los
                    cuatro, sin saltarnos el conteo:
                  </p>
                  <ol>
                    <li>
                      <strong>Imaj7, empezando en Re.</strong> Toma Re, salta
                      Mi, toma Fa♯, salta Sol, toma La, salta Si y toma Do♯.
                      Re–Fa♯ es tercera mayor; Re–Do♯ es séptima mayor. Por eso
                      Re–Fa♯–La–Do♯ se llama <strong>Dmaj7</strong>.
                    </li>
                    <li>
                      <strong>vim7, empezando en Si.</strong> Toma Si, salta
                      Do♯, toma Re, salta Mi, toma Fa♯, salta Sol y toma La.
                      Si–Re es tercera menor y Si–La, séptima menor:{" "}
                      <strong>Bm7</strong>. Al terminar en Do♯, la lista vuelve
                      a empezar en Re, conservando la armadura de Re mayor.
                    </li>
                    <li>
                      <strong>iim7, empezando en Mi.</strong> Toma Mi, salta
                      Fa♯, toma Sol, salta La, toma Si, salta Do♯ y toma Re.
                      Mi–Sol es tercera menor y Mi–Re, séptima menor:{" "}
                      <strong>Em7</strong>.
                    </li>
                    <li>
                      <strong>V7, empezando en La.</strong> Toma La, salta Si,
                      toma Do♯, salta Re, toma Mi, salta Fa♯ y toma Sol. La–Do♯
                      es tercera mayor y La–Sol, séptima menor:{" "}
                      <strong>A7</strong>.
                    </li>
                  </ol>
                  <p>
                    <strong>Dos conteos diferentes:</strong> al elegir el vi, Si
                    es el grado 6 de <em>Re mayor</em>. Cuando construyes Bm7,
                    Si se convierte en la fundamental o 1 de <em>ese acorde</em>
                    ; Re es su tercera. Ambos conteos son correctos porque
                    responden a preguntas distintas.
                  </p>
                  <p>
                    <strong>Respuesta:</strong> Dmaj7 – Bm7 – Em7 – A7. Para
                    comprobar Bm7, vuelve a contar desde Si: Si es 1, Re es ♭3,
                    Fa♯ es 5 y La es ♭7; no cuentas desde Re en esa fórmula.
                  </p>
                </Answer>
                <Answer question="10. ¿Por qué F♯maj7 lleva Mi♯ y no Fa escrito?">
                  <ol>
                    <li>
                      <strong>Lee el símbolo:</strong> F♯ = Fa♯ y maj7 pide una
                      tríada mayor más una séptima mayor: 1 – 3 – 5 – 7.
                    </li>
                    <li>
                      <strong>Cuenta los nombres hasta la séptima.</strong> Fa =
                      1, Sol = 2, La = 3, Si = 4, Do = 5, Re = 6 y Mi = 7. La
                      séptima debe escribirse con la letra <strong>Mi</strong>.
                    </li>
                    <li>
                      <strong>Comprueba la distancia.</strong> La séptima mayor
                      queda un semitono antes de la octava Fa♯. Mi natural está
                      a un tono; <strong>Mi♯</strong> queda a un semitono.
                    </li>
                    <li>
                      <strong>Completa el acorde:</strong> Fa♯ – La♯ – Do♯ –
                      Mi♯. Son sus grados 1, 3, 5 y 7.
                    </li>
                  </ol>
                  <p>
                    <strong>
                      Ahora construye las cuatro notas, una por una:
                    </strong>{" "}
                    la escala de Fa♯ mayor es Fa♯ – Sol♯ – La♯ – Si – Do♯ – Re♯
                    – Mi♯ – Fa♯. El número de grado se cuenta desde Fa♯,
                    incluyendo Fa♯ como 1.
                  </p>
                  <Table
                    headings={["Grado del acorde", "Nota", "Cómo comprobarla"]}
                    rows={[
                      [
                        "1 · fundamental",
                        "Fa♯",
                        "Es la nota que da nombre al acorde",
                      ],
                      [
                        "3 · tercera mayor",
                        "La♯",
                        "Fa♯–Sol–Sol♯–La–La♯: 4 semitonos",
                      ],
                      ["5 · quinta justa", "Do♯", "Está a 7 semitonos de Fa♯"],
                      [
                        "7 · séptima mayor",
                        "Mi♯",
                        "Está a 11 semitonos de Fa♯ y a 1 de la octava",
                      ],
                    ]}
                  />
                  <p>
                    <strong>Cuenta la séptima completa:</strong> Fa♯ → Sol →
                    Sol♯ → La → La♯ → Si → Do → Do♯ → Re → Re♯ → Mi → Mi♯. Hay
                    once pasos de semitono. Uno más, Mi♯ → Fa♯, llega a la
                    octava. Mi natural aparece en el paso diez: sería séptima
                    menor y formaría F♯7, no F♯maj7.
                  </p>
                  <p>
                    <strong>Comprobación:</strong> Mi♯ y Fa natural son
                    enarmónicos en el piano, pero Fa natural se escribiría con
                    la misma letra que la fundamental. Mi♯ conserva el nombre de
                    séptima.
                  </p>
                </Answer>
              </>
            )}
            <Box sx={{ display: topic === 10 ? "block" : "none" }}>
              <HarmonyInteractiveExam />
            </Box>
          </Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 4, pt: 2, borderTop: "1px solid #dce3e1" }}
          >
            <Button
              startIcon={<ChevronLeft />}
              disabled={topic === 0}
              onClick={() => nextTopic(topic - 1)}
            >
              Anterior
            </Button>
            <Typography
              sx={{ alignSelf: "center", color: "#667678", fontSize: 14 }}
            >
              {topic + 1} / {topics.length}
            </Typography>
            <Button
              endIcon={<ChevronRight />}
              disabled={topic === topics.length - 1}
              onClick={() => nextTopic(topic + 1)}
            >
              Siguiente
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
