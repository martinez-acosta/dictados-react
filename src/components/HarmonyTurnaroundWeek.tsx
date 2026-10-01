import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

type View = "resumen" | "tareas" | "conceptos" | "respuestas";

// Twelve keys in ascending fifths; switch to flat spellings after F♯.
const KEYS = [
  { name: "Do", notes: ["C", "D", "E", "F", "G", "A", "B"] },
  { name: "Sol", notes: ["G", "A", "B", "C", "D", "E", "F♯"] },
  { name: "Re", notes: ["D", "E", "F♯", "G", "A", "B", "C♯"] },
  { name: "La", notes: ["A", "B", "C♯", "D", "E", "F♯", "G♯"] },
  { name: "Mi", notes: ["E", "F♯", "G♯", "A", "B", "C♯", "D♯"] },
  { name: "Si", notes: ["B", "C♯", "D♯", "E", "F♯", "G♯", "A♯"] },
  { name: "Fa♯", notes: ["F♯", "G♯", "A♯", "B", "C♯", "D♯", "E♯"] },
  { name: "Re♭", notes: ["D♭", "E♭", "F", "G♭", "A♭", "B♭", "C"] },
  { name: "La♭", notes: ["A♭", "B♭", "C", "D♭", "E♭", "F", "G"] },
  { name: "Mi♭", notes: ["E♭", "F", "G", "A♭", "B♭", "C", "D"] },
  { name: "Si♭", notes: ["B♭", "C", "D", "E♭", "F", "G", "A"] },
  { name: "Fa", notes: ["F", "G", "A", "B♭", "C", "D", "E"] },
] as const;

const DEGREES = [
  { index: 0, label: "Imaj7", suffix: "maj7", formula: "1–3–5–7" },
  { index: 5, label: "vim7", suffix: "m7", formula: "1–♭3–5–♭7" },
  { index: 1, label: "iim7", suffix: "m7", formula: "1–♭3–5–♭7" },
  { index: 4, label: "V7", suffix: "7", formula: "1–3–5–♭7" },
] as const;

const ANSWERS = KEYS.map((key) => {
  const chords = DEGREES.map((degree) => ({
    degree: degree.label,
    formula: degree.formula,
    name: `${key.notes[degree.index]}${degree.suffix}`,
    notes: [0, 2, 4, 6].map((step) => key.notes[(degree.index + step) % 7]),
  }));
  return {
    ...key,
    id: key.notes[0],
    chords,
    sequence: chords.map((chord) => chord.name).join(" – "),
  };
});

const PHOTOS = [
  {
    file: "armonia-cuatriadas.png",
    label: "Armonización y tipos de cuatríadas",
  },
  {
    file: "armonia-turnaround.png",
    label: "Turn Around · ejemplos en Do, Sol y Re",
  },
] as const;
const STORAGE_KEY = "semester-notes:2026-09-21:armonia:turnaround";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="h3" sx={{ fontWeight: 900, fontSize: 17, mb: 1 }}>
      {children}
    </Typography>
  );
}

function TurnaroundWalkthrough({
  answer,
}: {
  answer: (typeof ANSWERS)[number];
}) {
  return (
    <Stack spacing={2.5} sx={{ mt: 2 }}>
      <Box>
        <Heading>1. Escribe la escala mayor</Heading>
        <Typography sx={{ color: "#56676a" }}>
          Una escala es nuestra lista de siete notas disponibles. Usa la fórmula
          tono–tono–semitono–tono–tono–tono–semitono. Un semitono es pasar a la
          tecla vecina del piano; un tono son dos semitonos.
        </Typography>
        <Typography sx={{ mt: 1, fontWeight: 800 }}>
          {answer.notes.join(" – ")}
        </Typography>
        <Typography sx={{ mt: 0.5, color: "#56676a" }}>
          C = Do · D = Re · E = Mi · F = Fa · G = Sol · A = La · B = Si. ♯ sube
          un semitono; ♭ baja un semitono.
        </Typography>
      </Box>
      <Box>
        <Heading>2. Numera las siete notas</Heading>
        <Typography sx={{ color: "#56676a" }}>
          “Grado” significa posición en esa lista. I es 1, VI es 6, ii es 2 y V
          es 5. La tarea pide ese orden, no 1–2–3–4.
        </Typography>
        <Typography sx={{ mt: 1, fontWeight: 800, lineHeight: 1.8 }}>
          {answer.notes
            .map((note, index) => `${index + 1} = ${note}`)
            .join(" · ")}
        </Typography>
        <Typography sx={{ mt: 1, fontWeight: 800 }}>
          Tus cuatro fundamentales:{" "}
          {answer.chords.map((chord) => chord.notes[0]).join(" → ")}.
        </Typography>
      </Box>
      <Box>
        <Heading>3. Forma cada acorde: una nota sí y una no</Heading>
        <Typography sx={{ color: "#56676a" }}>
          Empieza desde su fundamental. Toma la nota 1, salta la 2, toma la 3,
          salta la 4, toma la 5, salta la 6 y toma la 7. Si terminas la escala,
          continúa desde el inicio en la siguiente octava. Conserva sus ♯ o ♭.
        </Typography>
        {answer.chords.map((chord, index) => (
          <Box
            key={chord.degree}
            sx={{ py: 1, borderBottom: "1px solid #dce3e1" }}
          >
            <Typography sx={{ fontWeight: 900 }}>
              {chord.degree} · empezar en {chord.notes[0]}
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#56676a", lineHeight: 1.8 }}>
              {Array.from({ length: 7 }, (_, step) => {
                const note = answer.notes[(DEGREES[index].index + step) % 7];
                return `${step % 2 === 0 ? "toma" : "salta"} ${note}`;
              }).join(" → ")}
            </Typography>
            <Typography sx={{ mt: 0.5, fontWeight: 750 }}>
              Resultado: {chord.notes.join(" – ")}.
            </Typography>
          </Box>
        ))}
      </Box>
      <Box>
        <Heading>4. Ponle apellido al acorde</Heading>
        <Typography sx={{ color: "#56676a" }}>
          El nombre empieza con su fundamental. Después, el apellido nos dice
          qué tipo de tercera y séptima tiene. En cualquier escala mayor se
          cumple este patrón para los grados de la tarea:
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Typography>
            <strong>I → maj7:</strong> tríada mayor + séptima mayor. La tercera
            está a 4 semitonos y la séptima a 11 de la fundamental. Aquí:{" "}
            {answer.chords[0].name}.
          </Typography>
          <Typography>
            <strong>VI y ii → m7:</strong> tríada menor + séptima menor. La
            tercera está a 3 semitonos y la séptima a 10. Aquí:{" "}
            {answer.chords[1].name} y {answer.chords[2].name}.
          </Typography>
          <Typography>
            <strong>V → 7:</strong> tríada mayor + séptima menor. La tercera
            está a 4 semitonos y la séptima a 10. Aquí: {answer.chords[3].name}.
          </Typography>
        </Stack>
        <Typography sx={{ mt: 1, color: "#56676a" }}>
          La quinta es justa en los cuatro acordes: 7 semitonos. “m” significa
          menor; “maj7” indica séptima mayor; “7” solo indica séptima menor en
          estos símbolos. Cuenta los semitonos desde cero en la fundamental.
        </Typography>
      </Box>
      <Box>
        <Heading>5. Escribe la progresión y comprueba</Heading>
        <Typography sx={{ fontWeight: 900 }}>{answer.sequence}</Typography>
        <Typography sx={{ mt: 1, color: "#56676a" }}>
          Debes tener cuatro acordes, con cuatro notas cada uno. Todas las notas
          pertenecen a {answer.name} mayor. Al repetir, el último acorde vuelve
          al primero. Para el siguiente tono, repite estos cinco pasos usando su
          propia escala.
        </Typography>
      </Box>
    </Stack>
  );
}

export default function HarmonyTurnaroundWeek({ view }: { view: View }) {
  const [tone, setTone] = useState("C");
  const [photoIndex, setPhotoIndex] = useState(1);
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      return saved && typeof saved === "object" && !Array.isArray(saved)
        ? saved
        : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const answer = ANSWERS.find((item) => item.id === tone) ?? ANSWERS[0];
  const photo = PHOTOS[photoIndex];

  if (view === "resumen") {
    return (
      <Stack spacing={3}>
        <Box>
          <Heading>Turn Around en todos los tonos</Heading>
          <Typography sx={{ color: "#56676a" }}>
            Material de la semana 21–27 de septiembre: tarea compartida y fotos
            del pizarrón. No contamos con apuntes completos de la clase.
          </Typography>
        </Box>
        <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
            Imaj7 → vim7 → iim7 → V7
          </Typography>
          <Typography sx={{ mt: 0.75, color: "#56676a" }}>
            En Do: Cmaj7 → Am7 → Dm7 → G7 → Cmaj7 al repetir.
          </Typography>
        </Box>
        <Typography sx={{ color: "#56676a" }}>
          Para la próxima clase: llevar esta progresión en los 12 tonos del
          círculo de quintas. En Respuestas están resueltos los cuatro acordes y
          sus notas para cada tono.
        </Typography>
        <Box component="figure" sx={{ m: 0 }}>
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}semester-notes/2026-09-21/${photo.file}`}
            alt={`Pizarrón de Armonía: ${photo.label}`}
            sx={{
              display: "block",
              width: "100%",
              maxHeight: 520,
              objectFit: "contain",
              bgcolor: "#eef2f1",
              border: "1px solid #d6dfdd",
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            {PHOTOS.map((item, index) => (
              <Button
                key={item.file}
                size="small"
                variant={photoIndex === index ? "contained" : "outlined"}
                aria-pressed={photoIndex === index}
                onClick={() => setPhotoIndex(index)}
                sx={{ textTransform: "none" }}
              >
                Foto {index + 1}
              </Button>
            ))}
          </Stack>
          <Typography
            component="figcaption"
            sx={{ mt: 0.75, fontSize: 13, color: "#677779" }}
          >
            {photo.label}
          </Typography>
        </Box>
      </Stack>
    );
  }

  if (view === "tareas") {
    return (
      <Stack spacing={2}>
        <Box>
          <Heading>Tarea para la próxima clase</Heading>
          <Typography sx={{ color: "#56676a" }}>
            Escribir Imaj7–vim7–iim7–V7 en cada tono. Marca un tono cuando hayas
            escrito y comprobado sus cuatro acordes.
          </Typography>
          <Typography sx={{ mt: 1, fontWeight: 800 }}>
            {ANSWERS.filter((item) => completed[item.id]).length} de 12 tonos
          </Typography>
        </Box>
        <Stack>
          {ANSWERS.map((item) => (
            <FormControlLabel
              key={item.id}
              sx={{ m: 0, py: 0.5, borderBottom: "1px solid #dce3e1" }}
              control={
                <Checkbox
                  checked={Boolean(completed[item.id])}
                  onChange={(event) =>
                    setCompleted((current) => ({
                      ...current,
                      [item.id]: event.target.checked,
                    }))
                  }
                />
              }
              label={`${item.name} mayor (${item.id})`}
            />
          ))}
        </Stack>
      </Stack>
    );
  }

  if (view === "conceptos") {
    return (
      <Stack spacing={3}>
        <Box>
          <Heading>Turn Around · paso a paso desde cero</Heading>
          <Typography sx={{ color: "#56676a" }}>
            “Turn Around” es una progresión que prepara volver al inicio.
            Empezamos con Do mayor y seguimos el mismo procedimiento para los
            demás tonos.
          </Typography>
        </Box>
        <Box>
          <TurnaroundWalkthrough answer={ANSWERS[0]} />
        </Box>
        <Box>
          <Heading>Por qué VI lleva m7</Heading>
          <Typography sx={{ color: "#56676a" }}>
            La indicación del maestro usa VI m7; al escribir la calidad del
            acorde lo mostramos como vim7. Es menor séptima: en Do es Am7,
            formado por A–C–E–G. El V es dominante: G7 tiene F natural como
            séptima menor.
          </Typography>
        </Box>
        <Box>
          <Heading>Recorrer el círculo</Heading>
          <Typography sx={{ color: "#56676a" }}>
            C → G → D → A → E → B → F♯ → D♭ → A♭ → E♭ → B♭ → F → C. Después de
            F♯ usamos D♭, enarmónico de C♯, para mantener una escritura
            sencilla. F♯ y G♭ representan el mismo tono; B y C♭ también.
          </Typography>
        </Box>
        <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2 }}>
          <Heading>Volver al inicio</Heading>
          <Typography sx={{ color: "#56676a" }}>
            El V7 prepara el regreso al Imaj7. El acorde menor del VI es el
            indicado para esta tarea; conserva esa calidad en todos los tonos.
          </Typography>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Heading>Respuestas de la tarea · 12 tonos</Heading>
        <Typography sx={{ color: "#56676a" }}>
          Elige un tono para ver la progresión y las cuatro notas de cada
          acorde, o consulta la lista completa de progresiones.
        </Typography>
      </Box>
      <FormControl fullWidth size="small">
        <InputLabel id="turnaround-tone-label">Tono</InputLabel>
        <Select
          labelId="turnaround-tone-label"
          label="Tono"
          value={tone}
          onChange={(event) => setTone(event.target.value)}
        >
          <MenuItem value="all">Todos · 12 progresiones</MenuItem>
          {ANSWERS.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name} mayor ({item.id})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {tone === "all" ? (
        <Stack>
          {ANSWERS.map((item) => (
            <Box
              key={item.id}
              sx={{ py: 1.25, borderBottom: "1px solid #dce3e1" }}
            >
              <Typography sx={{ fontWeight: 900 }}>
                {item.name} mayor
              </Typography>
              <Typography sx={{ mt: 0.5, color: "#56676a" }}>
                {item.sequence}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Box>
            <Heading>{answer.name} mayor</Heading>
            <Typography sx={{ color: "#56676a" }}>
              {answer.notes.join(" – ")}
            </Typography>
            <Typography sx={{ mt: 1, fontWeight: 900 }}>
              {answer.sequence}
            </Typography>
          </Box>
          <Box component="dl" sx={{ m: 0 }}>
            {answer.chords.map((chord) => (
              <Box
                key={chord.degree}
                sx={{ py: 1.25, borderBottom: "1px solid #dce3e1" }}
              >
                <Typography component="dt" sx={{ fontWeight: 900 }}>
                  {chord.degree} · {chord.name}
                </Typography>
                <Box component="dd" sx={{ m: 0, mt: 0.5 }}>
                  <Typography sx={{ color: "#56676a" }}>
                    Fórmula: {chord.formula}
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontWeight: 750 }}>
                    {chord.notes.join(" – ")}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography sx={{ color: "#677779", fontSize: 14 }}>
            Las fórmulas expresan intervalos respecto a la fundamental de cada
            acorde. Al repetir, vuelve de {answer.chords[3].name} a{" "}
            {answer.chords[0].name}.
          </Typography>
          <Box
            component="details"
            sx={{ borderTop: "1px solid #dce3e1", pt: 1.5 }}
          >
            <Box
              component="summary"
              sx={{ cursor: "pointer", fontWeight: 900, py: 0.75 }}
            >
              Cómo se obtiene · paso a paso en {answer.name} mayor
            </Box>
            <TurnaroundWalkthrough answer={answer} />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
