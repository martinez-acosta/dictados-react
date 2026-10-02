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
  SOLFEGE_PULSE_LESSON,
  SOLFEGE_PULSE_TASK_KEY,
  SOLFEGE_PULSE_TASKS,
  METER_UNITS,
  FIGURE_COUNTS,
  beatsForFigure,
  barSeconds,
} from "../data/solfegePulseStudy.mjs";

type View = "resumen" | "tareas" | "conceptos" | "respuestas";
const PHOTOS = [
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-28/solfeo-compases-1.png`,
    label:
      "Numerador, denominador y unidades de tiempo y compás · vista general",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-28/solfeo-compases-2.png`,
    label: "4/4, 3/4, 3/8 y 4/2 · acercamiento de las figuras de referencia",
  },
];
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
        maxWidth: "100%",
        "& table": { borderCollapse: "collapse", width: "100%", fontSize: 15 },
        "& th, & td": {
          p: 1.25,
          textAlign: "left",
          verticalAlign: "top",
          lineHeight: 1.7,
          borderBottom: "1px solid #dce3e1",
          minWidth: 90,
        },
      }}
    >
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">
                {h}
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
function Tasks() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(SOLFEGE_PULSE_TASK_KEY) || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    localStorage.setItem(SOLFEGE_PULSE_TASK_KEY, JSON.stringify(completed));
  }, [completed]);
  return (
    <Stack spacing={3}>
      <Box>
        <Heading>Tarea confirmada · para la siguiente clase</Heading>
        <Typography>
          Esta sesión deja Fa 6 y la lección 1 de la segunda parte de Baqueiro;
          no son las tareas de la semana anterior. No se indicó una fecha exacta
          de calendario.
        </Typography>
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 750, mb: 1 }}>
          {SOLFEGE_PULSE_TASKS.filter((t) => completed[t.id]).length} de{" "}
          {SOLFEGE_PULSE_TASKS.length} puntos
        </Typography>
        {SOLFEGE_PULSE_TASKS.map((t) => (
          <FormControlLabel
            key={t.id}
            sx={{ display: "flex", m: 0, py: 0.5 }}
            control={
              <Checkbox
                checked={Boolean(completed[t.id])}
                onChange={(e) =>
                  setCompleted((current) => ({
                    ...current,
                    [t.id]: e.target.checked,
                  }))
                }
              />
            }
            label={t.text}
          />
        ))}
      </Box>
      <Typography>
        Referencias de esta transcripción: Sol 16, página 11 del PDF; bloque de
        Fa, página 21 del PDF; Baqueiro segunda parte, lección 1, página 61 del
        PDF / 66 del físico. Localiza por lección y clave porque las ediciones
        pueden variar.
      </Typography>
      <Box>
        <Heading>Estudio recomendado · no obligación adicional</Heading>
        <Typography>
          Avanzar a lección 2 de Baqueiro si puedes; repasar unidades de tiempo
          y de compás. La meta de Sol a 100 BPM es de examen, no sustituye los
          70 BPM de esta tarea.
        </Typography>
      </Box>
      <Box>
        <Heading>Material pendiente para resolver nota por nota</Heading>
        <Typography>
          Falta la página completa de Fa 6 y la partitura íntegra de Baqueiro,
          segunda parte, lección 1. Las respuestas sí explican cómo ejecutarlas
          y comprobarlas; no inventan las notas ni figuras de los compases que
          no vemos.
        </Typography>
      </Box>
    </Stack>
  );
}
function Concepts() {
  return (
    <Stack spacing={2}>
      <Heading>Referencia rápida de esta clase</Heading>
      <Table
        headers={["Concepto", "Significado"]}
        rows={[
          [
            "Numerador",
            "Número de unidades escritas que caben en el compás. En 4/8: cuatro corcheas.",
          ],
          [
            "Denominador",
            "Figura de referencia respecto a la redonda: 2 blanca, 4 negra, 8 corchea. No indica BPM.",
          ],
          [
            "Unidad de tiempo",
            "Figura que equivale a un tiempo en la cuenta utilizada.",
          ],
          [
            "Unidad de compás",
            "Duración que llena el compás entero; no confundirla con la de un pulso.",
          ],
          [
            "4/8 en esta lectura",
            "Cuatro pulsos de corchea; una blanca llena el compás.",
          ],
          [
            "2/4 en esta lectura",
            "Dos pulsos de negra; una blanca llena el compás.",
          ],
          [
            "Ligadura de prolongación",
            "Suma duraciones de la misma altura sin volver a atacar el segundo sonido.",
          ],
          [
            "Síncopa",
            "Entrada en parte débil sostenida sobre una posición más fuerte sin nuevo ataque; cuidar el acento pedido en este estudio.",
          ],
          [
            "Cambio de unidad de pulso",
            "Un BPM solo se puede comparar con otro si conocemos qué figura vale cada clic.",
          ],
          [
            "Dirección",
            "Cuatro movimientos: abajo, izquierda, derecha, arriba. Dos: abajo, arriba.",
          ],
          [
            "Compás compuesto",
            "No generalizar la cuenta simple: 6/8 suele tener dos pulsos de negra con puntillo.",
          ],
        ]}
      />
    </Stack>
  );
}

function Units() {
  return (
    <Stack spacing={2}>
      <Heading>Respuestas: unidad de tiempo y de compás</Heading>
      <Typography>
        Primero mira el denominador para identificar la figura; luego toma
        tantas de esas figuras como indica el numerador. Por último busca la
        duración que las reúne. Ejemplo: 3/8 = tres corcheas; dos forman una
        negra y la tercera es su mitad, por eso el total es una negra con
        puntillo.
      </Typography>
      <Table
        headers={[
          "Compás",
          "Unidad de tiempo · cuenta de clase",
          "Unidad de compás / total",
        ]}
        rows={METER_UNITS.map((m) => [
          m.meter,
          m.unit,
          `${m.total} · ${m.quarterNotes} negras`,
        ])}
      />
      <Typography>
        En 4/2, cuatro blancas suman ocho negras: dos redondas ligadas o una
        cuadrada. Una sola redonda no alcanza. En 3/4, blanca de dos negras +
        puntillo de una negra = tres. En 3/8, negra de dos corcheas + puntillo
        de una corchea = tres.
      </Typography>
      <Typography>
        La tabla usa la cuenta simple de esta clase. En 3/8 rápido puede
        sentirse un pulso grande de negra con puntillo; en compases compuestos
        también hay agrupaciones distintas. Nunca deducir velocidad solo del
        denominador.
      </Typography>
      <Heading>La misma figura, dos maneras de contar</Heading>
      <Table
        headers={[
          "Figura escrita",
          "Tiempos de corchea en 4/8",
          "Tiempos de negra en 2/4",
        ]}
        rows={FIGURE_COUNTS.map((f) => [
          f.figure,
          beatsForFigure(f.quarterNotes, 8),
          beatsForFigure(f.quarterNotes, 4),
        ])}
      />
      <Typography>
        No redibujes una blanca como redonda: la blanca conserva su duración
        relativa. Son cuatro clics si cuentas corcheas o dos clics si cuentas
        negras. Los silencios de esas figuras se cuentan igual, sin producir
        sonido.
      </Typography>
    </Stack>
  );
}
function Tempos() {
  return (
    <Stack spacing={2}>
      <Heading>Por qué 60 por negra es más rápido que 90 por corchea</Heading>
      <Box component="ol" sx={{ pl: 3, "& li": { mb: 1, lineHeight: 1.8 } }}>
        <li>
          Primera consigna: <strong>corchea = 90</strong>. Cada clic dura 60 ÷
          90 = 0,667 segundos. Cuatro clics llenan el compás:{" "}
          {barSeconds(4, 90).toFixed(2).replace(".", ",")} segundos.
        </li>
        <li>
          Segunda consigna: <strong>negra = 60</strong>. Cada clic dura 1
          segundo y contiene dos corcheas. Dos clics llenan el compás:{" "}
          {barSeconds(2, 60)} segundos.
        </li>
        <li>
          Las figuras pasan más rápido en la segunda versión: cada corchea dura
          0,5 segundos en vez de 0,667. La ejecución es un 33,3 % más rápida, no
          más lenta.
        </li>
        <li>
          Para igualar la primera velocidad con pulsos de negra sería{" "}
          <strong>negra = 45</strong>. Eso explica la equivalencia, pero no
          cambia la tarea: el maestro pidió 60 en la segunda versión.
        </li>
      </Box>
      <Table
        headers={[
          "Versión",
          "Clic / movimiento",
          "Corcheas por clic",
          "Duración por compás",
        ]}
        rows={[
          ["4/8 · 90 BPM", "Corchea", 1, "2,67 segundos"],
          ["2/4 · 60 BPM", "Negra", 2, "2 segundos"],
        ]}
      />
      <Box
        component="pre"
        sx={{ overflowX: "auto", fontSize: 14, p: 1.5, bgcolor: "#f5f7f6" }}
      >
        {
          "Misma duración escrita: cuatro corcheas\n4/8:   1       2       3       4     (un clic por corchea)\n2/4:   1       y       2       y     (un clic por negra)\nGesto: ↓               ↑            en la lectura de dos"
        }
      </Box>
      <Typography>
        El esquema es conceptual, no una copia de la lección. Sus espacios
        muestran agrupación, no una escala de segundos común para ambas
        velocidades.
      </Typography>
    </Stack>
  );
}
function Baqueiro() {
  return (
    <Stack spacing={2}>
      <Heading>Guía resuelta · Baqueiro, segunda parte, lección 1</Heading>
      <Typography>
        Consigna: la misma página en 4/8 a 90 por corchea y en 2/4 a 60 por
        negra, sin ayuda del maestro y cuidando las síncopas indicadas.
      </Typography>
      <Box component="ol" sx={{ pl: 3, "& li": { mb: 1, lineHeight: 1.8 } }}>
        <li>
          Localiza segunda parte, lección 1 (página 61 del PDF / 66 del físico
          según la transcripción). Revisa la clave y las alturas en tu página
          antes de pronunciar las notas.
        </li>
        <li>
          Para 4/8 cuenta <strong>1–2–3–4</strong> por corcheas. Una blanca
          ocupa los cuatro pulsos; una negra ocupa dos; una corchea, uno. Dirige
          abajo, izquierda, derecha, arriba.
        </li>
        <li>
          Cuenta los silencios sin cortar el pulso. El audio señala una entrada
          en el tiempo 3 del compás 8 y una revisión del compás 17 alrededor del
          tiempo 2; compruébalas en la partitura, sin adivinar las figuras que
          faltan.
        </li>
        <li>
          Ubica la primera nota de cada ligadura. Suma sus duraciones y sostén
          el sonido sin repetirlo al pasar la barra. Acentúa el comienzo
          sincopado que el maestro pide, no la continuación ligada.
        </li>
        <li>
          Vuelve a leer en 2/4: <strong>1–y–2–y</strong>. El metrónomo a 60
          marca 1 y 2; las corcheas intermedias caen en “y”. Dirige abajo y
          arriba. Las notas y las ligaduras no se eliminan.
        </li>
        <li>
          Haz una pasada completa sin detenerte. Si fallas, continúa y luego
          estudia por separado el enlace; no conviertas el error en una pausa
          permanente.
        </li>
      </Box>
      <Table
        headers={["Zona final indicada", "Qué comprobar"]}
        rows={[
          ["12–13", "Ligadura, entrada débil, continuidad al cambiar compás."],
          ["15–16", "Duración completa sin cortar ni añadir un ataque."],
          ["16–17", "Entrada y final exactos según las figuras de la página."],
          [
            "18, 19 y 20",
            "Síncopas y sus acentos; especial atención al enlace 18–19 mencionado en clase.",
          ],
        ]}
      />
      <Heading>Ejemplo de síncopa resuelto · añadido para estudiar</Heading>
      <Typography>
        En 2/4, silencio de corchea en 1 + corchea en “y” de 1 ligada a una
        negra en 2: 0,5 + 0,5 + 1 = 2 negras. El sonido empieza en parte débil y
        se mantiene en 2; no se vuelve a atacar en 2. En cuenta de 4/8, esas
        duraciones equivalen a 1 + 1 + 2 = 4 corcheas.
      </Typography>
      <Typography sx={{ color: "#56676a" }}>
        Falta la partitura completa para escribir una solución exacta de todos
        los compases. Esta guía resuelve la ejecución y los criterios
        disponibles, pero el ejemplo no se presenta como el compás original de
        Baqueiro.
      </Typography>
    </Stack>
  );
}
function Dandelot() {
  return (
    <Stack spacing={2}>
      <Heading>Guías de realización · Dandelot Sol y Fa</Heading>
      <Table
        headers={[
          "Ejercicio / consigna",
          "Cómo realizarlo",
          "Cómo comprobarlo",
        ]}
        rows={[
          [
            "Sol, lección 16 · 70 BPM",
            "Localiza la lección 16; lectura continua de inicio a fin, luego al revés como en clase. En el ejercicio ya disponible conserva dos corcheas por pulso de negra; no hagas dos clics por pareja.",
            "No detengas la lectura por un error; escucha el clic y conserva la posición de cada nota. 100 BPM es meta de examen, no la tarea inmediata.",
          ],
          [
            "Fa, lección 6 · 60 BPM",
            "Identifica Fa en la cuarta línea por los dos puntos de la clave; lee las alturas de la página de lección 6 antes de añadir el metrónomo. Después mantén 60 y la relación de figuras que indique esa partitura.",
            "Las líneas, de abajo arriba: Sol–Si–Re–Fa–La; espacios: La–Do–Mi–Sol. No leas esos lugares con los nombres de clave de Sol.",
          ],
        ]}
      />
      <Typography>
        El repaso de Fa 4 y 5 no sustituye Fa 6. Puedes leerlas de nuevo para
        afianzar la clave, pero la tarea final es la sexta lección.
      </Typography>
      <Typography>
        Para las palmas de la pasada especial de Sol: cuenta cuatro pulsos y
        aplaude solo en <strong>2 y 4</strong>. Haz también una pasada sin
        palmas. No marcar pie, cabeza ni chasquidos para depender de ellos.
      </Typography>
      <Typography>
        En relevos, sigue internamente las notas de los otros y entra al
        comenzar tu sistema, sin esperar a que alguien corrija su error. La
        dirección inversa se practica sobre las notas de la página, no sobre las
        sílabas defectuosas de la transcripción.
      </Typography>
      <Typography sx={{ color: "#56676a" }}>
        La lección 16 interactiva existente conserva sus notas y controles. No
        se inventa la secuencia de Fa 6 porque su página no está adjunta: estos
        nombres de líneas y espacios son una referencia añadida para comprobar
        tu lectura, no la solución melódica de esa lección.
      </Typography>
    </Stack>
  );
}
function Answers() {
  const [section, setSection] = useState("units");
  return (
    <Stack spacing={3}>
      <FormControl fullWidth size="small">
        <InputLabel id="solfege-pulse-answer">Respuesta a revisar</InputLabel>
        <Select
          labelId="solfege-pulse-answer"
          label="Respuesta a revisar"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <MenuItem value="units">
            Unidades y figuras · respuestas paso a paso
          </MenuItem>
          <MenuItem value="tempos">
            4/8 a 90 y 2/4 a 60 · por qué cambia
          </MenuItem>
          <MenuItem value="baqueiro">Baqueiro · ejecución y síncopas</MenuItem>
          <MenuItem value="dandelot">
            Dandelot · guías de Sol 16 y Fa 6
          </MenuItem>
        </Select>
      </FormControl>
      {section === "units" ? (
        <Units />
      ) : section === "tempos" ? (
        <Tempos />
      ) : section === "baqueiro" ? (
        <Baqueiro />
      ) : (
        <Dandelot />
      )}
    </Stack>
  );
}
export default function SolfegePulseWeek({ view }: { view: View }) {
  if (view === "resumen")
    return (
      <DetailedClassNotes lessonId={SOLFEGE_PULSE_LESSON} photos={PHOTOS} />
    );
  if (view === "tareas") return <Tasks />;
  if (view === "conceptos") return <Concepts />;
  return <Answers />;
}
