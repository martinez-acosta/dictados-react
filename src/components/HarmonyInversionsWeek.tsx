import React, { useEffect, useId, useRef, useState } from "react";
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
import { Accidental, Factory, Formatter, Stave, StaveNote } from "vexflow";
import DetailedClassNotes from "./DetailedClassNotes";
import {
  INVERSION_LESSON,
  INVERSION_TASK_KEY,
  MAJOR_SEVENTHS,
  inversions,
  spanishNote,
} from "../data/harmonyInversions.mjs";

type View = "resumen" | "tareas" | "conceptos" | "respuestas";
type Chord = { root: string; name: string; notes: string[] };
const PHOTOS = [
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-28/armonia-inversiones.png`,
    label:
      "Posición fundamental, inversiones de tríadas y Cmaj7, círculo de quintas",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-28/armonia-cadencias.png`,
    label: "Turn Around y cadencias · repaso de ii–V–I en mayor y menor",
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
          borderBottom: "1px solid #dce3e1",
          lineHeight: 1.7,
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

function ChordStaff({ chord, triad }: { chord: Chord; triad: boolean }) {
  const holder = useRef<HTMLDivElement>(null);
  const id = `inversion-staff-${useId().replace(/:/g, "")}`;
  const positions = inversions(chord, triad);
  useEffect(() => {
    if (!holder.current) return;
    holder.current.innerHTML = "";
    const vf = new Factory({
      renderer: { elementId: id, width: positions.length * 210, height: 210 },
    });
    const context = vf.getContext();
    positions.forEach((position, index) => {
      const stave = new Stave(index * 210 + 5, 50, 200)
        .addClef("treble")
        .setContext(context);
      stave.draw();
      const note = new StaveNote({
        clef: "treble",
        keys: position.pitches.map(
          (p) => `${p.note[0].toLowerCase()}/${p.octave}`,
        ),
        duration: "w",
      });
      position.pitches.forEach((p, i) => {
        const accidental = p.note.slice(1).replace("♯", "#").replace("♭", "b");
        if (accidental) note.addModifier(new Accidental(accidental), i);
      });
      Formatter.FormatAndDraw(context, stave, [note]);
    });
    return () => {
      if (holder.current) holder.current.innerHTML = "";
    };
  }, [chord.root, triad, id]);
  return (
    <Box>
      <Typography variant="body2" sx={{ color: "#56676a", mb: 1 }}>
        Pentagrama de estudio añadido · acordes simultáneos, sin armadura. Las
        redondas muestran las alturas, no un ritmo de ejecución obligatorio.
        Desliza horizontalmente si no caben.
      </Typography>
      <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
        <Box sx={{ width: positions.length * 210 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${positions.length}, 210px)`,
              textAlign: "center",
              fontSize: 13,
            }}
          >
            {positions.map((p) => (
              <span key={p.name}>{p.name}</span>
            ))}
          </Box>
          <Box
            ref={holder}
            id={id}
            role="img"
            aria-label={`${chord.root}${triad ? "" : "maj7"}: ${positions.map((p) => `${p.name}: ${p.pitches.map((n) => spanishNote(n.note) + n.octave).join(", ")}`).join("; ")}`}
          />
        </Box>
      </Box>
    </Box>
  );
}

function Tasks() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(INVERSION_TASK_KEY) || "{}");
    } catch {
      return {};
    }
  });
  useEffect(() => {
    localStorage.setItem(INVERSION_TASK_KEY, JSON.stringify(completed));
  }, [completed]);
  return (
    <Stack spacing={3}>
      <Box>
        <Heading>Tarea confirmada · maj7 en los doce tonos</Heading>
        <Typography>
          Escribe cada acorde en posición fundamental y sus tres inversiones: 12
          × 4 = 48 disposiciones. Usa notas verticales en el pentagrama,
          alteraciones explícitas sin armadura, y el nombre de cada acorde e
          inversión. Do está incluido como ejemplo resuelto.
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 750 }}>
        {MAJOR_SEVENTHS.filter((c) => completed[c.root]).length} de 12
        tonalidades terminadas
      </Typography>
      <Box>
        {MAJOR_SEVENTHS.map((c) => (
          <FormControlLabel
            key={c.root}
            sx={{ display: "flex", m: 0, py: 0.5 }}
            control={
              <Checkbox
                checked={Boolean(completed[c.root])}
                onChange={(e) =>
                  setCompleted((current) => ({
                    ...current,
                    [c.root]: e.target.checked,
                  }))
                }
              />
            }
            label={`${c.root}maj7 · ${c.name}: fundamental, 1.ª, 2.ª y 3.ª inversión`}
          />
        ))}
      </Box>
      <Box>
        <Heading>Plazo registrado · fecha por confirmar</Heading>
        <Typography>
          El maestro menciona unos 15 días, que no habrá esta clase la semana
          siguiente y, al cierre, el 15 de octubre. La fecha exacta debe
          confirmarse por los errores de la transcripción; no se establece como
          vencimiento verificado ni se aplica la ausencia a otras materias.
        </Typography>
      </Box>
      <Box>
        <Heading>Estudio recomendado</Heading>
        <Typography>
          Repasar las tríadas y su cifrado 6 / 6 sobre 4, e identificar el bajo
          real. Revisar las cadencias de la segunda foto. Estos apoyos tienen
          soluciones, pero no se añaden como otra entrega obligatoria.
        </Typography>
      </Box>
    </Stack>
  );
}

function Concepts() {
  return (
    <Stack spacing={2}>
      <Heading>Lo esencial para leer las inversiones</Heading>
      <Table
        headers={["Concepto", "Significado"]}
        rows={[
          [
            "Fundamental",
            "Nota que da nombre al acorde; no cambia al invertirlo.",
          ],
          [
            "Bajo",
            "Nota más grave que realmente suena; determina la inversión.",
          ],
          ["Soprano", "Voz superior o nota más aguda de la disposición."],
          [
            "Tríada",
            "Tres notas: posición fundamental y dos inversiones; bajos 1, 3, 5.",
          ],
          [
            "Cuatríada",
            "Cuatro notas: posición fundamental y tres inversiones; bajos 1, 3, 5, 7.",
          ],
          [
            "maj7",
            "Tríada mayor + séptima mayor: 1–3–5–7. Cmaj7 = Do–Mi–Sol–Si.",
          ],
          [
            "7 dominante",
            "Tríada mayor + séptima menor: 1–3–5–♭7. C7 = Do–Mi–Sol–Si♭.",
          ],
          [
            "6 de inversión",
            "Intervalo de sexta sobre el bajo de una tríada; no añade una sexta al acorde.",
          ],
          [
            "6 sobre 4",
            "Segunda inversión de tríada; sexta y cuarta sobre el bajo, no el número 64.",
          ],
          [
            "G/B",
            "Sol mayor con Si en el bajo; primera inversión, sin imponer el orden de las voces superiores.",
          ],
          [
            "Acorde / arpegio",
            "Notas simultáneas / notas sucesivas. La tarea pide escritura vertical.",
          ],
          [
            "Cadencia ii–V–I",
            "Movimiento del segundo al quinto grado y a la tónica; en menor, comprobar las alteraciones del dominante.",
          ],
        ]}
      />
    </Stack>
  );
}

function Cadences() {
  return (
    <Stack spacing={2}>
      <Heading>Repaso de la foto · cadencias explicadas</Heading>
      <Typography>
        Son ejemplos de estudio desarrollados para aclarar el pizarrón, no una
        nueva tarea en los doce tonos ni una transcripción literal de todos los
        rótulos corregidos.
      </Typography>
      <Table
        headers={["Contexto", "ii → V → I", "Notas de los acordes"]}
        rows={[
          ["Do mayor", "Dm7 → G7 → C", "D–F–A–C → G–B–D–F → C–E–G"],
          [
            "Re menor, dominante mayor",
            "Eø7 → A7 → Dm",
            "E–G–B♭–D → A–C♯–E–G → D–F–A",
          ],
        ]}
      />
      <Typography>
        En Do mayor: escribe Do–Re–Mi–Fa–Sol–La–Si; busca los grados ii = Re, V
        = Sol, I = Do; construye las notas de cada acorde. El final C tiene tres
        notas. Si se pide Imaj7, añade Si para Cmaj7; no añadirlo
        automáticamente a un cifrado C.
      </Typography>
      <Typography>
        En Re menor: Re–Mi–Fa–Sol–La–Si♭–Do. El segundo acorde de séptima es
        Eø7, Mi–Sol–Si♭–Re. El quinto diatónico sería Am7, pero para una
        cadencia con dominante mayor se eleva Do a Do♯: A7 = La–Do♯–Mi–Sol. Do♯
        conduce a Re; termina en Dm = Re–Fa–La.
      </Typography>
      <Typography>
        No confundir Eø7 (Mi–Sol–Si♭–Re) con E°7 (Mi–Sol–Si♭–Re♭). En tríadas la
        versión menor sería E° → A → Dm. Invertir cualquiera de estos acordes
        cambia el bajo, no sus alteraciones.
      </Typography>
    </Stack>
  );
}

function Answers() {
  const [section, setSection] = useState("maj7");
  const [root, setRoot] = useState("C");
  const chord = MAJOR_SEVENTHS.find((c) => c.root === root)!;
  const triad = section === "triads";
  const positions = inversions(chord, triad);
  return (
    <Stack spacing={3}>
      <FormControl fullWidth size="small">
        <InputLabel id="inversion-section">Respuesta a revisar</InputLabel>
        <Select
          labelId="inversion-section"
          label="Respuesta a revisar"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        >
          <MenuItem value="maj7">Tarea · 48 disposiciones de maj7</MenuItem>
          <MenuItem value="triads">
            Ejercicio de clase · tríadas y cifrado
          </MenuItem>
          <MenuItem value="cadences">Repaso · cadencias mayor y menor</MenuItem>
        </Select>
      </FormControl>
      {section === "cadences" ? (
        <Cadences />
      ) : (
        <>
          <Box>
            <Heading>
              {triad
                ? "Tríadas mayores · cómo invertirlas"
                : "Tarea resuelta · maj7 y sus tres inversiones"}
            </Heading>
            <Typography>
              {triad
                ? "Repaso del ejercicio de clase, no una entrega adicional. Conserva 1–3–5 y cambia el bajo. Hay tres estados, no tres inversiones."
                : "Consigna: los doce maj7 del círculo, con posición fundamental y tres inversiones. Las 48 disposiciones están en la tabla final; el selector explica y dibuja una tonalidad a la vez."}
            </Typography>
          </Box>
          <FormControl fullWidth size="small">
            <InputLabel id="inversion-key">Tonalidad del círculo</InputLabel>
            <Select
              labelId="inversion-key"
              label="Tonalidad del círculo"
              value={root}
              onChange={(e) => setRoot(e.target.value)}
            >
              {MAJOR_SEVENTHS.map((c) => (
                <MenuItem key={c.root} value={c.root}>
                  {c.root} · {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box>
            <Heading>
              {chord.root}
              {triad ? "" : "maj7"} · paso a paso
            </Heading>
            <Box
              component="ol"
              sx={{ pl: 3, "& li": { mb: 1, lineHeight: 1.8 } }}
            >
              <li>
                La fundamental es{" "}
                <strong>
                  {chord.root} = {chord.name}
                </strong>
                .{" "}
                {triad
                  ? "La fórmula de tríada mayor es 1–3–5: tercera mayor a 4 semitonos y quinta justa a 7."
                  : "maj7 pide 1–3–5–7: tercera mayor a 4 semitonos, quinta justa a 7 y séptima mayor a 11, siempre contados desde esta fundamental."}
              </li>
              <li>
                Construye las notas correctas:{" "}
                <strong>
                  {(triad ? chord.notes.slice(0, 3) : chord.notes).join(" – ")}
                </strong>{" "}
                ={" "}
                {(triad ? chord.notes.slice(0, 3) : chord.notes)
                  .map(spanishNote)
                  .join(" – ")}
                . Usa una letra distinta para cada grado; conserva sus
                alteraciones.
              </li>
              <li>
                Colócalas de grave a agudo en posición fundamental. Sube la nota
                más grave una octava: queda{" "}
                <strong>
                  {positions[1].pitches
                    .map((p) => spanishNote(p.note) + p.octave)
                    .join(" – ")}
                </strong>
                , primera inversión. La tercera queda en el bajo.
              </li>
              <li>
                Repite con el nuevo bajo para obtener la segunda inversión, con
                la quinta abajo
                {triad
                  ? "."
                  : ". Repite una vez más para la tercera inversión, con la séptima abajo."}{" "}
                No cambies ninguna alteración.
              </li>
              <li>
                Comprueba {triad ? "tres" : "cuatro"} notas en cada estado,
                siempre el mismo conjunto de sonidos. Lee la lista de izquierda
                a derecha como <strong>orden de grave a agudo</strong>; en la
                entrega se apilan verticalmente, no se escriben como arpegio.
              </li>
            </Box>
          </Box>
          {root === "F♯" && (
            <Typography>
              <strong>Atención:</strong> E♯ = Mi♯ es la séptima mayor de Fa♯.
              Suena como Fa natural en el piano, pero escribir Fa escondería la
              relación de séptima. F♯7 llevaría Mi natural y sería otro acorde.
            </Typography>
          )}
          <ChordStaff chord={chord} triad={triad} />
          <Table
            headers={[
              "Estado",
              "Notas de grave a agudo · registro de estudio",
              "Bajo / grados",
            ]}
            rows={positions.map((p, i) => [
              <>
                <strong>{p.name}</strong>
                {triad && (
                  <Typography variant="body2">
                    {i === 0
                      ? "Fundamental"
                      : i === 1
                        ? "6 (6/3)"
                        : "6 sobre 4"}
                  </Typography>
                )}
              </>,
              <>
                {p.pitches.map((n) => n.note + n.octave).join(" – ")}
                <Typography variant="body2" sx={{ color: "#56676a" }}>
                  {p.pitches
                    .map((n) => spanishNote(n.note) + n.octave)
                    .join(" – ")}
                </Typography>
              </>,
              `${spanishNote(p.bass)} en el bajo · ${p.degrees.join("–")}`,
            ])}
          />
          {triad && (
            <Typography>
              En Do mayor se cifra I, I⁶ e I⁶₄. En la primera inversión
              Mi–Sol–Do, Do forma una sexta sobre Mi. En la segunda Sol–Do–Mi,
              Do forma una cuarta y Mi una sexta sobre Sol. No es C6 =
              Do–Mi–Sol–La. Para séptimas, esta clase pide los nombres de las
              inversiones; el cifrado tradicional 7 / 6-5 / 4-3 / 4-2 existe,
              pero no se exige aquí.
            </Typography>
          )}
          <Box>
            <Heading>
              {triad
                ? "Las doce tríadas · 36 disposiciones de repaso"
                : "Las doce tonalidades · 48 disposiciones completas"}
            </Heading>
            <Typography sx={{ mb: 1 }}>
              Cada celda se lee de grave a agudo. El selector de arriba fija
              octavas de ejemplo y muestra el pentagrama. Recorrido: C → G → D →
              A → E → B → F♯ → D♭ → A♭ → E♭ → B♭ → F → C.
            </Typography>
            <Table
              headers={[
                "Acorde",
                "Fundamental",
                "1.ª inversión",
                "2.ª inversión",
                ...(!triad ? ["3.ª inversión"] : []),
              ]}
              rows={MAJOR_SEVENTHS.map((c) => [
                <strong>
                  {c.root}
                  {triad ? "" : "maj7"} · {c.name}
                </strong>,
                ...inversions(c, triad).map((p) => (
                  <>
                    {p.notes.join(" – ")}
                    <Typography variant="body2" sx={{ color: "#56676a" }}>
                      {p.notes.map(spanishNote).join(" – ")}
                    </Typography>
                  </>
                )),
              ])}
            />
          </Box>
          <Typography sx={{ color: "#56676a" }}>
            Autocorrección: bajo 1–3–5{triad ? "" : "–7"}; mismas notas y
            alteraciones; escritura vertical; alturas y líneas adicionales
            claras. Invertir no significa convertir maj7 en 7, ni cambiar la
            fundamental. Las octavas del pentagrama son una realización de
            estudio añadida, no un registro obligatorio del audio.
          </Typography>
        </>
      )}
    </Stack>
  );
}

export default function HarmonyInversionsWeek({ view }: { view: View }) {
  if (view === "resumen")
    return <DetailedClassNotes lessonId={INVERSION_LESSON} photos={PHOTOS} />;
  if (view === "tareas") return <Tasks />;
  if (view === "conceptos") return <Concepts />;
  return <Answers />;
}
