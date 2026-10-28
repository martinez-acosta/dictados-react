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
import { useNavigate } from "react-router-dom";
import { ChordStaff } from "./HarmonyInversionsWeek";
import {
  HARMONY_KEYS,
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
  const [topic, setTopic] = useState(0);
  const [tonic, setTonic] = useState("C");
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
                <Circle selected={tonic} onSelect={setTonic} />
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
                <Heading>Simulacro: intenta antes de abrir</Heading>
                <p>
                  Estas preguntas son <strong>práctica añadida</strong>, no
                  preguntas confirmadas del examen. Escribe las respuestas y
                  abre cada solución para comprobar el procedimiento.
                </p>
                <Answer question="1. ¿Cuál es la relativa menor de Sol mayor?">
                  <p>
                    Sol mayor: Sol–La–Si–Do–Re–Mi–Fa♯. El sexto grado es Mi, por
                    lo que es <strong>Mi menor natural</strong>:
                    Mi–Fa♯–Sol–La–Si–Do–Re–Mi.
                  </p>
                </Answer>
                <Answer question="2. Escribe Re menor natural e indica su relativa mayor.">
                  <p>
                    Re–Mi–Fa–Sol–La–Si♭–Do–Re. El tercer grado es Fa, así que su
                    relativa es <strong>Fa mayor</strong>; ambas comparten Si♭.
                  </p>
                </Answer>
                <Answer question="3. Construye Gmaj7 y G7. ¿Qué cambia?">
                  <p>
                    Gmaj7 = Sol–Si–Re–Fa♯. G7 = Sol–Si–Re–Fa. La tríada
                    permanece igual: la séptima baja de mayor a menor.
                  </p>
                </Answer>
                <Answer question="4. Construye Dm7 y explica la fórmula.">
                  <p>
                    Re–Fa–La–Do: 1=Re, ♭3=Fa, 5=La, ♭7=Do. Re–Fa es tercera
                    menor y Re–Do séptima menor.
                  </p>
                </Answer>
                <Answer question="5. Diferencia Bm7♭5 de Bdim7.">
                  <p>
                    Bm7♭5 = Si–Re–Fa–La. Bdim7 = Si–Re–Fa–La♭. La tríada es
                    igual; La es séptima menor y La♭ séptima disminuida.
                  </p>
                </Answer>
                <Answer question="6. ¿Cuál es la primera inversión de Sol mayor?">
                  <p>
                    Sol mayor es Sol–Si–Re. Sube Sol una octava:{" "}
                    <strong>Si–Re–Sol</strong>. Si es el bajo; puede escribirse
                    G/B.
                  </p>
                </Answer>
                <Answer question="7. Escribe la tercera inversión de Cmaj7.">
                  <p>
                    Cmaj7 = Do–Mi–Sol–Si. La tercera inversión pone la séptima
                    en el bajo: <strong>Si–Do–Mi–Sol</strong>. Conserva las
                    cuatro notas.
                  </p>
                </Answer>
                <Answer question="8. Armoniza Do mayor a cuatro voces.">
                  <p>
                    Cmaj7 (Do Mi Sol Si), Dm7 (Re Fa La Do), Em7 (Mi Sol Si Re),
                    Fmaj7 (Fa La Do Mi), G7 (Sol Si Re Fa), Am7 (La Do Mi Sol),
                    Bm7♭5 (Si Re Fa La).
                  </p>
                </Answer>
                <Answer question="9. Forma el Turn Around de Re mayor.">
                  <p>
                    Re mayor: Re–Mi–Fa♯–Sol–La–Si–Do♯. Grados 1, 6, 2 y 5:
                    Re–Si–Mi–La. Resultado:{" "}
                    <strong>Dmaj7 – Bm7 – Em7 – A7</strong>. Sus notas son Re
                    Fa♯ La Do♯; Si Re Fa♯ La; Mi Sol Si Re; La Do♯ Mi Sol.
                  </p>
                </Answer>
                <Answer question="10. ¿Por qué F♯maj7 lleva Mi♯ y no Fa escrito?">
                  <p>
                    La séptima desde Fa se llama Mi: Fa–Sol–La–Si–Do–Re–Mi. Debe
                    quedar a un semitono de Fa♯, así que es <strong>Mi♯</strong>
                    . Suena en la tecla de Fa, pero escribir Fa repetiría la
                    letra de la fundamental.
                  </p>
                </Answer>
              </>
            )}
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
