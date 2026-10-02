import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import DetailedClassNotes from "./DetailedClassNotes";
import {
  CHORD_STUDY_LESSON,
  CHORD_STUDY_TASK_KEY,
  STUDY_CHORDS,
  STUDY_BARS,
  spanishPitch,
} from "../data/improvisationChordStudy.mjs";

type View = "resumen" | "tareas" | "conceptos" | "respuestas";
const PHOTO = [
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-28/improvisacion-arpegios.png`,
    label: "Notas del acorde y cambio de dirección · C, F7, C7, Em7/A7 y Dm7",
  },
];
const TASKS = [
  [
    "written",
    "Continuar la línea escrita usando solo notas del acorde indicado",
  ],
  [
    "four-notes",
    "Conservar cuatro notas por compás; dos de cada acorde cuando comparten compás",
  ],
  ["movement", "Cambiar de dirección y buscar enlaces cercanos entre acordes"],
  ["memory", "Memorizar las notas de cada acorde en ambos sentidos"],
  ["instrument", "Llevar el ejercicio al instrumento y practicarlo de memoria"],
] as const;

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="h3" sx={{ fontWeight: 850, fontSize: 20, mb: 1 }}>
      {children}
    </Typography>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <Box
      sx={{
        overflowX: "auto",
        "& table": { borderCollapse: "collapse", width: "100%", fontSize: 15 },
        "& th, & td": {
          p: 1.25,
          textAlign: "left",
          verticalAlign: "top",
          lineHeight: 1.7,
          borderBottom: "1px solid #dce3e1",
          minWidth: 95,
        },
      }}
    >
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
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

function Tasks() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(CHORD_STUDY_TASK_KEY) || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    localStorage.setItem(CHORD_STUDY_TASK_KEY, JSON.stringify(completed));
  }, [completed]);
  return (
    <Stack spacing={3}>
      <Box>
        <Heading>Trabajo indicado al cierre de la clase</Heading>
        <Typography sx={{ color: "#56676a" }}>
          Continuar el ejercicio y llevarlo al instrumento de memoria. El audio
          no establece una fecha exacta de entrega ni BPM. La foto aporta nueve
          compases visibles, no toda la progresión.
        </Typography>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 750, mb: 1 }}>
          {TASKS.filter(([id]) => completed[id]).length} de {TASKS.length}{" "}
          puntos
        </Typography>
        {TASKS.map(([id, label]) => (
          <FormControlLabel
            key={id}
            sx={{ display: "flex", m: 0, py: 0.5 }}
            control={
              <Checkbox
                checked={Boolean(completed[id])}
                onChange={(event) =>
                  setCompleted((current) => ({
                    ...current,
                    [id]: event.target.checked,
                  }))
                }
              />
            }
            label={label}
          />
        ))}
      </Box>
      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2 }}>
        <Heading>
          Estudio recomendado · no una entrega adicional confirmada
        </Heading>
        <Typography>
          Transportar un patrón a Sol o Si♭; comenzar bajando y luego subiendo;
          decir en voz alta los grados que se tocan. No hay una lista de todos
          los tonos ni velocidad obligatoria en este audio.
        </Typography>
      </Box>
      <Box>
        <Heading>Pendiente de confirmar</Heading>
        <Typography>
          Cualquier compás de la progresión que no aparezca en la fotografía y
          posibles parámetros de entrega no registrados. La semana está
          confirmada: 28 de septiembre–2 de octubre de 2026; el día exacto de la
          sesión no fue especificado.
        </Typography>
      </Box>
    </Stack>
  );
}

function Chords() {
  return (
    <Stack spacing={2}>
      <Heading>Acordes completos · material permitido</Heading>
      <Typography sx={{ color: "#56676a" }}>
        Primero identifica los sonidos disponibles. El orden de una línea puede
        cambiar, pero cada nota debe pertenecer al cifrado vigente.
      </Typography>
      <Table
        headers={["Acorde", "Fórmula", "Notas / nombres"]}
        rows={STUDY_CHORDS.map((chord) => [
          <strong>
            {chord.symbol} · {chord.name}
          </strong>,
          chord.formula,
          <>
            <Typography>{chord.notes.join(" – ")}</Typography>
            <Typography variant="body2" sx={{ color: "#56676a" }}>
              {chord.spanish}
            </Typography>
          </>,
        ])}
      />
      {STUDY_CHORDS.map((chord) => (
        <Typography key={chord.symbol}>
          <strong>{chord.symbol}:</strong> {chord.explanation}
        </Typography>
      ))}
    </Stack>
  );
}

function FullExercise() {
  return (
    <Stack spacing={3}>
      <Box>
        <Heading>Solución de estudio · nueve compases visibles</Heading>
        <Typography>
          Esta es una realización válida desarrollada desde los cifrados de la
          foto, no una transcripción literal de sus alturas. Se comienza en Do4;
          cada nuevo compás cambia de dirección. Los números indican octava: Do5
          es más agudo que Do4.
        </Typography>
      </Box>
      <Box>
        <Heading>Cómo se hace el primer enlace</Heading>
        <Box component="ol" sx={{ pl: 3, "& li": { mb: 1, lineHeight: 1.8 } }}>
          <li>
            C tiene Do, Mi y Sol; no pide séptima. Para cuatro posiciones
            ascendentes: <strong>Do4 – Mi4 – Sol4 – Do5</strong>.
          </li>
          <li>
            Al cambiar a F7, enumera sus notas:{" "}
            <strong>Fa – La – Do – Mi♭</strong>.
          </li>
          <li>
            Ahora hay que bajar. Desde Do5, la nota inferior más cercana de F7
            es <strong>La4</strong>. No se elige Mi♭5, porque subiría, ni se
            repite Do5.
          </li>
          <li>
            Continúa descendiendo entre notas de F7:{" "}
            <strong>La4 – Fa4 – Mi♭4 – Do4</strong>.
          </li>
          <li>
            El siguiente C vuelve a subir. Desde Do4, la nota superior más
            cercana de C es <strong>Mi4</strong>; sigue Sol4 – Do5 – Mi5.
          </li>
        </Box>
      </Box>
      <Table
        headers={[
          "Compás / sentido",
          "Acorde y notas",
          "Grados dentro de cada acorde",
        ]}
        rows={STUDY_BARS.map((bar) => [
          <strong>
            {bar.number} · {bar.direction}
          </strong>,
          <Stack spacing={1}>
            {bar.segments.map((segment) => (
              <Box key={segment.chord}>
                <Typography sx={{ fontWeight: 750 }}>
                  {segment.chord}: {segment.notes.join(" – ")}
                </Typography>
                <Typography variant="body2" sx={{ color: "#56676a" }}>
                  {segment.notes.map(spanishPitch).join(" – ")}
                </Typography>
              </Box>
            ))}
          </Stack>,
          <Stack spacing={1}>
            {bar.segments.map((segment) => (
              <Typography key={segment.chord}>
                {segment.chord}: {segment.degrees}
              </Typography>
            ))}
          </Stack>,
        ])}
      />
      <Box>
        <Heading>El compás de Em7 – A7, explicado</Heading>
        <Typography>
          Vienes de Mi5 y el tramo debe bajar. En Em7, la nota inferior más
          cercana es Re5; luego Si4. Al cambiar a A7, la nota inferior más
          cercana a Si4 es La4; después Sol4. Queda{" "}
          <strong>Re5 – Si4 | La4 – Sol4</strong>: dos notas de Em7 y dos de A7,
          cuatro en total. La barra aquí separa acordes dentro del mismo compás,
          no crea dos compases.
        </Typography>
      </Box>
      <Box>
        <Heading>Cómo comprobar la solución</Heading>
        <Box
          component="ul"
          sx={{ pl: 3, "& li": { mb: 0.75, lineHeight: 1.8 } }}
        >
          <li>Cada compás suma cuatro notas; el octavo reparte dos y dos.</li>
          <li>
            La dirección real alterna subir y bajar, comprobando las octavas.
          </li>
          <li>Cada nota pertenece al acorde que suena en su posición.</li>
          <li>
            El inicio de cada nuevo acorde usa el sonido disponible más cercano
            en el sentido elegido, sin repetir la altura de llegada.
          </li>
          <li>
            Las alteraciones son correctas: Mi♭ en F7, Si♭ en C7, Do♯ y Sol
            natural en A7.
          </li>
        </Box>
        <Typography sx={{ color: "#56676a" }}>
          Puede haber otras soluciones válidas si cumplen la consigna. No se
          inventan compases 10–12 ni se modifica el Jazz Blues guardado en la
          primera semana.
        </Typography>
      </Box>
    </Stack>
  );
}

function Transposition() {
  return (
    <Stack spacing={3}>
      <Box>
        <Heading>Transportar por grados · ejemplos de estudio</Heading>
        <Typography>
          La transcripción explica el principio, pero no exige una lista
          específica de tonos. Estos ejemplos enseñan el procedimiento, no
          añaden una entrega obligatoria.
        </Typography>
      </Box>
      <Box>
        <Heading>Do – Mi – Sol – Do, a Sol y Si♭</Heading>
        <Box component="ol" sx={{ pl: 3, "& li": { mb: 1, lineHeight: 1.8 } }}>
          <li>
            Identifica el patrón del acorde de Do:{" "}
            <strong>1–3–5–1 en la octava superior</strong>.
          </li>
          <li>
            Para Sol mayor, escribe su tríada: Sol – Si – Re. Conserva el
            patrón: <strong>Sol4 – Si4 – Re5 – Sol5</strong>.
          </li>
          <li>
            Para Si♭ mayor, escribe su tríada: Si♭ – Re – Fa. Conserva el
            patrón: <strong>Si♭3 – Re4 – Fa4 – Si♭4</strong>.
          </li>
          <li>
            Comprueba que cada tercera sea mayor, cada quinta justa y la última
            nota una octava sobre la primera. Un registro distinto es válido si
            conserva esos intervalos.
          </li>
        </Box>
      </Box>
      <Box>
        <Heading>Las mañanitas: dos cuentas diferentes</Heading>
        <Typography>
          En Fa mayor, Do es el quinto grado y la entrada Do → Fa superior forma
          una cuarta justa. En Si♭ mayor, Fa es el quinto grado y Fa → Si♭
          superior conserva esa cuarta.
        </Typography>
        <Table
          headers={["Tonalidad", "Grado 5 → tónica", "Cuenta del intervalo"]}
          rows={[
            ["Fa mayor", "Do → Fa", "Do–Re–Mi–Fa: cuarta"],
            ["Si♭ mayor", "Fa → Si♭", "Fa–Sol–La–Si♭: cuarta"],
          ]}
        />
        <Typography sx={{ mt: 1 }}>
          El grado tonal se cuenta desde la tónica de la escala; el intervalo se
          cuenta desde la primera nota que suena. Por eso “empieza en el quinto
          grado” y “sube una cuarta” pueden describir el mismo comienzo.
        </Typography>
      </Box>
      <Box>
        <Heading>Para transportar toda la línea</Heading>
        <Typography>
          Traslada tanto los acordes como sus notas por el mismo intervalo,
          conservando el tipo de acorde, el sentido y las distancias. Por
          ejemplo, al subir de Do a Sol, F7 pasa a C7 y su Mi♭ pasa a Si♭. No
          basta con cambiar el primer Do: también se transportan las
          alteraciones de todos los acordes.
        </Typography>
      </Box>
    </Stack>
  );
}

function Concepts() {
  return (
    <Stack spacing={3}>
      <Heading>Referencia rápida de esta clase</Heading>
      <Table
        headers={["Concepto", "Significado"]}
        rows={[
          [
            "Nota del acorde",
            "Sonido que pertenece al cifrado vigente; en F7: Fa, La, Do o Mi♭.",
          ],
          [
            "Arpegio",
            "Notas de un acorde tocadas sucesivamente, no todas a la vez.",
          ],
          [
            "Ascendente / descendente",
            "Ir hacia alturas más agudas / más graves; hay que conocer las octavas.",
          ],
          [
            "Movimiento contrario entre compases",
            "Cambiar la dirección de un tramo al siguiente en este ejercicio; no implica dos voces simultáneas.",
          ],
          [
            "Enlace cercano",
            "Nota del acorde nuevo más próxima en la dirección indicada.",
          ],
          [
            "Grado del acorde",
            "Intervalo medido desde su fundamental: 1, 3, 5, séptima y sus alteraciones.",
          ],
          [
            "Grado de la tonalidad",
            "Posición de una nota en la escala, contada desde la tónica.",
          ],
          [
            "Transposición",
            "Mover una estructura a otra altura conservando sus relaciones interválicas.",
          ],
          [
            "Séptima menor",
            "A un tono por debajo de la octava: en Mi, Re; en La, Sol.",
          ],
          [
            "Dos acordes por compás",
            "Para esta consigna: dos notas del primero y dos del segundo, mismo sentido.",
          ],
        ]}
      />
      <Typography sx={{ color: "#56676a" }}>
        No confundir “cuatro notas por compás” con “cuatro notas distintas”: C
        tiene tres sonidos diferentes y puede repetir uno en otra octava.
      </Typography>
    </Stack>
  );
}

function Answers() {
  const [section, setSection] = useState("line");
  return (
    <Stack spacing={3}>
      <FormControl size="small" fullWidth>
        <InputLabel id="chord-study-answer-label">
          Respuesta a revisar
        </InputLabel>
        <Select
          labelId="chord-study-answer-label"
          label="Respuesta a revisar"
          value={section}
          onChange={(event) => setSection(event.target.value)}
        >
          <MenuItem value="line">Ejercicio completo · nueve compases</MenuItem>
          <MenuItem value="chords">
            Notas y construcción de cada acorde
          </MenuItem>
          <MenuItem value="transpose">
            Transposición y grados · paso a paso
          </MenuItem>
          <MenuItem value="memory">Cómo practicar de memoria</MenuItem>
        </Select>
      </FormControl>
      {section === "line" && <FullExercise />}
      {section === "chords" && <Chords />}
      {section === "transpose" && <Transposition />}
      {section === "memory" && (
        <Stack spacing={2}>
          <Heading>Respuesta práctica: aprender sin depender del papel</Heading>
          <Typography>
            Empieza con un solo acorde. Di sus notas y después tócalas hacia
            arriba y hacia abajo. Para Em7: <strong>Mi – Sol – Si – Re</strong>;
            al revés: <strong>Re – Si – Sol – Mi</strong>.
          </Typography>
          <Typography>
            Después enlaza dos compases de la solución. Di qué nota corresponde
            a qué grado y comprueba el cambio de dirección. Si fallas una
            alteración, vuelve a construir el acorde antes de acelerar.
          </Typography>
          <Typography>
            En Em7/A7, identifica el cambio después de la segunda nota. El reto
            no es solo recordar cuatro sonidos, sino saber cuándo cambia el
            material permitido.
          </Typography>
          <Typography>
            La guía se puede tocar con pulsos iguales a un tempo cómodo elegido
            por ti. El audio no fija BPM obligatorios. La autocorrección
            consiste en comprobar pertenencia al acorde, cuatro posiciones,
            sentido, registro y continuidad.
          </Typography>
          <Typography sx={{ color: "#56676a" }}>
            Para comenzar el ejercicio bajando y luego subiendo hay que
            construir otra realización y comprobar de nuevo los enlaces; no
            invertir sin más una lista perdiendo el orden de los acordes.
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}

export default function ImprovisationChordStudy({ view }: { view: View }) {
  if (view === "resumen")
    return <DetailedClassNotes lessonId={CHORD_STUDY_LESSON} photos={PHOTO} />;
  if (view === "tareas") return <Tasks />;
  if (view === "conceptos") return <Concepts />;
  return <Answers />;
}
