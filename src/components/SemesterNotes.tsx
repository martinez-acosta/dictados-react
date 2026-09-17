import React, { useEffect, useState } from "react";
import { ArrowBack, ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

type SubjectId = "solfeo" | "armonia" | "improvisacion";
type DetailView = "resumen" | "tareas" | "conceptos" | "respuestas";

const WEEKS = [
  {
    id: "2026-09-07",
    label: "7–13 de septiembre de 2026",
    shortLabel: "7–13 sep",
  },
] as const;

const SUBJECTS: Array<{ id: SubjectId; label: string; hasNotes: boolean }> = [
  { id: "solfeo", label: "Solfeo", hasNotes: true },
  { id: "armonia", label: "Armonía", hasNotes: true },
  { id: "improvisacion", label: "Improvisación", hasNotes: true },
];

const TASK_GROUPS = [
  {
    title: "Dandelot",
    tasks: [
      ["dandelot-16", "Clave de Sol — Lección 16"],
      ["dandelot-60", "Practicar con metrónomo a 60 BPM"],
      ["dandelot-body", "Leer sin marcar pie, cabeza ni chasquidos"],
      ["dandelot-forward", "Leer de principio a fin"],
      ["dandelot-systems", "Practicar por sistemas"],
      ["dandelot-reverse", "Leer del final hacia el inicio"],
      ["dandelot-flow", "Mantener el pulso aunque haya errores"],
    ],
  },
  {
    title: "Baqueiro Foster",
    tasks: [
      ["baqueiro-part2", "Segunda parte — Lección 1"],
      ["baqueiro-material", "Llevar el método a clase"],
      ["baqueiro-two", "Repasar dirección de 2 tiempos"],
      ["baqueiro-three", "Repasar dirección de 3 tiempos"],
      ["baqueiro-subdivision", "Repasar subdivisión: negra → dos corcheas"],
    ],
  },
] as const;

const SOLFEGE_STORAGE_KEY = "semester-notes:2026-09-07:solfeo:tasks";
const IMPROVISATION_STORAGE_KEY =
  "semester-notes:2026-09-07:improvisacion:tasks";
const HARMONY_STORAGE_KEY = "semester-notes:2026-09-07:armonia:study";
const IMPROVISATION_BOARD_IMAGE = `${import.meta.env.BASE_URL}semester-notes/2026-09-07/improvisacion-intervalos.png`;

const HARMONY_BOARD_IMAGES = [
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-07/armonia-campo-armonico.png`,
    label: "Campo armónico de Re mayor",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-07/armonia-cuatriadas-1.png`,
    label: "Cuatríadas · acercamiento 1",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-07/armonia-cuatriadas-2.png`,
    label: "Cuatríadas · acercamiento 2",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-07/armonia-cuatriadas-3.png`,
    label: "Cuatríadas · vista completa",
  },
] as const;

const HARMONY_STUDY_GROUPS = [
  {
    title: "Tarea · armonización",
    tasks: [
      ["harmonize-g", "Armonizar la escala de G mayor"],
      ["harmonize-d", "Armonizar la escala de D mayor"],
      ["harmonize-a", "Armonizar la escala de A mayor"],
    ],
  },
  {
    title: "Tarea · acordes disminuidos 7",
    tasks: [
      ["g-dim7", "Construir G°7 desde la nota G"],
      ["ab-dim7", "Construir A♭°7 desde la nota A♭"],
      ["e-dim7", "Construir E°7 desde la nota E"],
    ],
  },
  {
    title: "Escalas y tríadas",
    tasks: [
      ["major-formula", "Memorizar T–T–ST–T–T–T–ST"],
      ["build-scale", "Construir escalas mayores con la fórmula"],
      ["harmonize-triads", "Armonizar una escala mayor con tríadas"],
      ["degree-pattern", "Memorizar I–ii–iii–IV–V–vi–vii°"],
      ["tonic-root", "Distinguir tónica de fundamental"],
      ["triad-types", "Construir tríadas mayores, menores y disminuidas"],
    ],
  },
  {
    title: "Cuatríadas",
    tasks: [
      ["maj7", "Construir Maj7"],
      ["dominant7", "Construir 7 dominante"],
      ["minor7", "Construir m7 y mMaj7"],
      ["half-diminished", "Construir m7♭5 / ø7"],
      ["diminished7", "Construir dim7 / °7"],
      ["enharmony", "Repasar enarmonía e inversiones"],
      ["symmetry", "Entender la simetría del acorde °7"],
    ],
  },
] as const;

const HARMONY_HOMEWORK_ANSWERS = [
  {
    id: "g",
    label: "G mayor",
    scale: "G – A – B – C – D – E – F♯ – G",
    sequence: "G – Am – Bm – C – D – Em – F♯dim – G",
    chords: [
      ["I", "G", "G – B – D"],
      ["ii", "Am", "A – C – E"],
      ["iii", "Bm", "B – D – F♯"],
      ["IV", "C", "C – E – G"],
      ["V", "D", "D – F♯ – A"],
      ["vi", "Em", "E – G – B"],
      ["vii°", "F♯dim", "F♯ – A – C"],
      ["I", "G", "G – B – D"],
    ],
  },
  {
    id: "d",
    label: "D mayor",
    scale: "D – E – F♯ – G – A – B – C♯ – D",
    sequence: "D – Em – F♯m – G – A – Bm – C♯dim – D",
    chords: [
      ["I", "D", "D – F♯ – A"],
      ["ii", "Em", "E – G – B"],
      ["iii", "F♯m", "F♯ – A – C♯"],
      ["IV", "G", "G – B – D"],
      ["V", "A", "A – C♯ – E"],
      ["vi", "Bm", "B – D – F♯"],
      ["vii°", "C♯dim", "C♯ – E – G"],
      ["I", "D", "D – F♯ – A"],
    ],
  },
  {
    id: "a",
    label: "A mayor",
    scale: "A – B – C♯ – D – E – F♯ – G♯ – A",
    sequence: "A – Bm – C♯m – D – E – F♯m – G♯dim – A",
    chords: [
      ["I", "A", "A – C♯ – E"],
      ["ii", "Bm", "B – D – F♯"],
      ["iii", "C♯m", "C♯ – E – G♯"],
      ["IV", "D", "D – F♯ – A"],
      ["V", "E", "E – G♯ – B"],
      ["vi", "F♯m", "F♯ – A – C♯"],
      ["vii°", "G♯dim", "G♯ – B – D"],
      ["I", "A", "A – C♯ – E"],
    ],
  },
] as const;

const HARMONY_DIMINISHED_ANSWERS = [
  {
    chord: "G°7",
    notes: "G – B♭ – D♭ – F♭",
    enharmonic: "G – B♭ – D♭ – E",
  },
  {
    chord: "A♭°7",
    notes: "A♭ – C♭ – E𝄫 – G𝄫",
    enharmonic: "A♭ – B – D – F",
  },
  {
    chord: "E°7",
    notes: "E – G – B♭ – D♭",
    enharmonic: "E – G – B♭ – D♭",
  },
] as const;

const TETRAD_DETAILS = [
  {
    id: "maj7",
    symbol: "Maj7",
    name: "Mayor séptima",
    formula: "1 – 3 – 5 – 7",
    construction: "Tríada mayor + 7ª mayor",
    example: "Cmaj7 = C – E – G – B",
    notes: [
      ["1", "C", "Fundamental", "0 semitonos"],
      ["3", "E", "3ª mayor", "4 semitonos"],
      ["5", "G", "5ª justa", "7 semitonos"],
      ["7", "B", "7ª mayor", "11 semitonos"],
    ],
  },
  {
    id: "7",
    symbol: "7",
    name: "Séptima dominante",
    formula: "1 – 3 – 5 – ♭7",
    construction: "Tríada mayor + 7ª menor",
    example: "C7 = C – E – G – B♭",
    notes: [
      ["1", "C", "Fundamental", "0 semitonos"],
      ["3", "E", "3ª mayor", "4 semitonos"],
      ["5", "G", "5ª justa", "7 semitonos"],
      ["♭7", "B♭", "7ª menor", "10 semitonos"],
    ],
  },
  {
    id: "m7",
    symbol: "m7",
    name: "Menor séptima",
    formula: "1 – ♭3 – 5 – ♭7",
    construction: "Tríada menor + 7ª menor",
    example: "Cm7 = C – E♭ – G – B♭",
    notes: [
      ["1", "C", "Fundamental", "0 semitonos"],
      ["♭3", "E♭", "3ª menor", "3 semitonos"],
      ["5", "G", "5ª justa", "7 semitonos"],
      ["♭7", "B♭", "7ª menor", "10 semitonos"],
    ],
  },
  {
    id: "mmaj7",
    symbol: "mMaj7",
    name: "Menor con séptima mayor",
    formula: "1 – ♭3 – 5 – 7",
    construction: "Tríada menor + 7ª mayor",
    example: "CmMaj7 = C – E♭ – G – B",
    notes: [
      ["1", "C", "Fundamental", "0 semitonos"],
      ["♭3", "E♭", "3ª menor", "3 semitonos"],
      ["5", "G", "5ª justa", "7 semitonos"],
      ["7", "B", "7ª mayor", "11 semitonos"],
    ],
  },
  {
    id: "m7b5",
    symbol: "m7♭5 / ø7",
    name: "Semidisminuido",
    formula: "1 – ♭3 – ♭5 – ♭7",
    construction: "Tríada disminuida + 7ª menor",
    example: "Cm7♭5 = C – E♭ – G♭ – B♭",
    notes: [
      ["1", "C", "Fundamental", "0 semitonos"],
      ["♭3", "E♭", "3ª menor", "3 semitonos"],
      ["♭5", "G♭", "5ª disminuida", "6 semitonos"],
      ["♭7", "B♭", "7ª menor", "10 semitonos"],
    ],
  },
  {
    id: "dim7",
    symbol: "dim7 / °7",
    name: "Disminuido séptima",
    formula: "1 – ♭3 – ♭5 – ♭♭7",
    construction: "Tríada disminuida + 7ª disminuida",
    example: "C°7 = C – E♭ – G♭ – B𝄫 (suena A)",
    notes: [
      ["1", "C", "Fundamental", "0 semitonos"],
      ["♭3", "E♭", "3ª menor", "3 semitonos"],
      ["♭5", "G♭", "5ª disminuida", "6 semitonos"],
      ["♭♭7", "B𝄫", "7ª disminuida", "9 semitonos"],
    ],
  },
] as const;

const JAZZ_BLUES_ANSWERS = [
  ["1", "C7"],
  ["2", "F7"],
  ["3", "C7"],
  ["4", "C7"],
  ["5", "F7"],
  ["6", "F♯dim7"],
  ["7", "C7"],
  ["8", "A7"],
  ["9", "Dm7"],
  ["10", "G7"],
  ["11", "C7 – A7"],
  ["12", "Dm7 – G7"],
] as const;

const IMPROVISATION_CHORD_ANSWERS = [
  ["C7", "1 – 3 – 5 – ♭7", "C – E – G – B♭"],
  ["F7", "1 – 3 – 5 – ♭7", "F – A – C – E♭"],
  ["F♯dim7", "1 – ♭3 – ♭5 – ♭♭7", "F♯ – A – C – E♭"],
  ["A7", "1 – 3 – 5 – ♭7", "A – C♯ – E – G"],
  ["Dm7", "1 – ♭3 – 5 – ♭7", "D – F – A – C"],
  ["G7", "1 – 3 – 5 – ♭7", "G – B – D – F"],
] as const;

const IMPROVISATION_TASK_GROUPS = [
  {
    title: "Intervalos",
    tasks: [
      ["fifths", "Memorizar las quintas justas"],
      ["altered-fifths", "Entender quinta disminuida y quinta aumentada"],
      ["seconds-thirds", "Repasar 2m, 2M, 3m y 3M"],
      ["sixths-sevenths", "Repasar sextas y séptimas"],
      ["root", "Entender qué es una fundamental"],
      ["interval-scale", "Distinguir intervalo de escala"],
      ["enharmony", "Distinguir sonido enarmónico de función musical"],
      ["voicing", "Entender qué significa voicing"],
    ],
  },
  {
    title: "Jazz Blues y tarea",
    tasks: [
      ["jazz-blues", "Repasar la forma Jazz Blues de la clase anterior"],
      ["teacher-chords", "Construir los acordes indicados por el maestro"],
      ["no-internet", "Resolverlos sin buscar las respuestas en Internet"],
      ["bring-work", "Llevar el procedimiento aunque pueda estar incorrecto"],
    ],
  },
] as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="h3"
      sx={{ fontSize: 17, fontWeight: 900, color: "#183638", mb: 1.25 }}
    >
      {children}
    </Typography>
  );
}

function SummaryView() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "#0f766e", fontWeight: 900, letterSpacing: 1 }}
        >
          Idea central
        </Typography>
        <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 900 }}>
          Interiorizar el pulso y mantener la lectura continua
        </Typography>
        <Typography sx={{ mt: 1, color: "#5d6c6e", maxWidth: 760 }}>
          El objetivo no es solo acertar las notas: hay que leer, cantar y
          continuar dentro del tempo, incluso después de un error.
        </Typography>
      </Box>

      <Divider />

      <Box>
        <SectionHeading>Dandelot · Lección 16</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d" }}>
          <Typography>• Clave de Sol con metrónomo a 60 BPM.</Typography>
          <Typography>
            • Sin mover el pie, la cabeza, chasquear ni sostener físicamente el
            pulso.
          </Typography>
          <Typography>
            • Lectura de principio a fin, de final a principio y por sistemas.
          </Typography>
          <Typography>
            • Palmas en los tiempos 2 y 4 mientras continúa la lectura.
          </Typography>
          <Typography>
            • Meta progresiva mencionada en clase: avanzar hacia 100 BPM.
          </Typography>
        </Stack>
      </Box>

      <Divider />

      <Box>
        <SectionHeading>Baqueiro Foster · Lecciones 24–26</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d" }}>
          <Typography>• Repaso de compases de 3 y 2 tiempos.</Typography>
          <Typography>
            • Un compás completo de cuenta antes de comenzar la lectura.
          </Typography>
          <Typography>
            • Lectura rítmica con sílabas como “ta” y “taca”.
          </Typography>
          <Typography>
            • Ligadura, silencios y subdivisión mental del pulso.
          </Typography>
          <Typography>
            • Coordinación: pies en 1–2 y palmas con negras o corcheas.
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Lo que sigue</Typography>
        <Typography sx={{ color: "#5d6c6e" }}>
          Segunda parte de Baqueiro Foster, Lección 1. Habrá una introducción
          teórica; la referencia aproximada es página 66 del libro o 61 del PDF.
          El tema 4/8 quedó por confirmar en la grabación.
        </Typography>
      </Box>
    </Stack>
  );
}

function TasksView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem(SOLFEGE_STORAGE_KEY) ?? "{}",
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(SOLFEGE_STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const taskCount = TASK_GROUPS.reduce(
    (total, group) => total + group.tasks.length,
    0,
  );
  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
            Próxima clase
          </Typography>
          <Typography sx={{ color: "#667678" }}>
            Marca cada punto conforme lo completes.
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} de ${taskCount}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {TASK_GROUPS.map((group) => (
        <Box key={group.title}>
          <SectionHeading>{group.title}</SectionHeading>
          <Stack spacing={0.25}>
            {group.tasks.map(([id, label]) => (
              <FormControlLabel
                key={id}
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
                sx={{
                  m: 0,
                  py: 0.25,
                  color: completed[id] ? "#849092" : "#243d3f",
                  textDecoration: completed[id] ? "line-through" : "none",
                }}
              />
            ))}
          </Stack>
        </Box>
      ))}

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Clave de Fa</Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Pendiente confirmar la lección. La grabación termina antes de que el
          maestro indique el número.
        </Typography>
      </Box>
    </Stack>
  );
}

function ConceptsView() {
  const concepts = [
    ["Compás de 2 tiempos", "1 abajo · 2 arriba"],
    ["Compás de 3 tiempos", "1 abajo · 2 derecha/afuera · 3 arriba"],
    ["Numerador", "Cantidad y organización de tiempos"],
    ["Subdividir", "Dividir internamente un pulso"],
    ["Negra", "Puede subdividirse en dos corcheas: 1–y"],
    ["Metrónomo", "Estabilizar e interiorizar el tiempo"],
    ["Pies + palmas", "Desarrollar independencia y coordinación"],
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Conceptos para responder sin dudar
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Referencia rápida de lo trabajado en clase.
        </Typography>
      </Box>

      <Box sx={{ borderTop: "1px solid #dce3e1" }}>
        {concepts.map(([term, meaning]) => (
          <Box
            key={term}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "190px 1fr" },
              gap: { xs: 0.25, sm: 2 },
              py: 1.5,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>{term}</Typography>
            <Typography sx={{ color: "#56676a" }}>{meaning}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Aplicación musical</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Leer, cantar, escuchar, mantener afinación y conservar el tempo deben
          suceder simultáneamente. La coordinación rítmica prepara esa
          independencia.
        </Typography>
      </Box>
    </Stack>
  );
}

function HarmonySummaryView() {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = HARMONY_BOARD_IMAGES[photoIndex];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "#0f766e", fontWeight: 900, letterSpacing: 1 }}
        >
          Idea central
        </Typography>
        <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 900 }}>
          De la escala mayor a las tríadas y cuatríadas
        </Typography>
        <Typography sx={{ mt: 1, color: "#5d6c6e", maxWidth: 760 }}>
          La clase conectó la fórmula de la escala mayor con la armonización por
          grados y después añadió la séptima para construir cuatríadas.
        </Typography>
      </Box>

      <Box component="figure" sx={{ m: 0 }}>
        <Box
          component="img"
          src={photo.src}
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
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1.25, overflowX: "auto", pb: 0.5 }}
        >
          {HARMONY_BOARD_IMAGES.map((item, index) => (
            <Button
              key={item.src}
              size="small"
              variant={photoIndex === index ? "contained" : "outlined"}
              onClick={() => setPhotoIndex(index)}
              sx={{ minWidth: "max-content", textTransform: "none" }}
            >
              Foto {index + 1}
            </Button>
          ))}
        </Stack>
        <Typography
          component="figcaption"
          variant="caption"
          sx={{ display: "block", mt: 0.5, color: "#677779" }}
        >
          {photo.label}
        </Typography>
      </Box>

      <Divider />

      <Box>
        <SectionHeading>Escala mayor y armonización</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d" }}>
          <Typography>• Fórmula mayor: T–T–ST–T–T–T–ST.</Typography>
          <Typography>
            • Cada grado funciona como fundamental de su propio acorde.
          </Typography>
          <Typography>• Patrón de tríadas: M–m–m–M–M–m–°.</Typography>
          <Typography>
            • Mayores: I, IV y V · menores: ii, iii y vi · disminuido: vii°.
          </Typography>
        </Stack>
      </Box>

      <Divider />

      <Box>
        <SectionHeading>De tríada a cuatríada</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d" }}>
          <Typography>• Tríada: 1–3–5.</Typography>
          <Typography>• Cuatríada: 1–3–5–7.</Typography>
          <Typography>
            • Se trabajaron Maj7, 7, m7, mMaj7, m7♭5/ø7 y dim7/°7.
          </Typography>
          <Typography>
            • La escritura enarmónica debe conservar la función de tercera,
            quinta o séptima.
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Acorde disminuido 7</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Está formado por terceras menores sucesivas, es simétrico y produce
          solo tres conjuntos distintos de alturas antes de repetirse por
          inversión y enarmonía.
        </Typography>
      </Box>
    </Stack>
  );
}

function HarmonyTasksView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem(HARMONY_STORAGE_KEY) ?? "{}",
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(HARMONY_STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const taskCount = HARMONY_STUDY_GROUPS.reduce(
    (total, group) => total + group.tasks.length,
    0,
  );
  const taskIds = new Set(
    HARMONY_STUDY_GROUPS.flatMap((group) => group.tasks.map(([id]) => id)),
  );
  const completedCount = Object.entries(completed).filter(
    ([id, isDone]) => isDone && taskIds.has(id),
  ).length;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
            Tarea y estudio
          </Typography>
          <Typography sx={{ color: "#667678" }}>
            Armonizar G, D y A mayor y construir G°7, A♭°7 y E°7.
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} de ${taskCount}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {HARMONY_STUDY_GROUPS.map((group) => (
        <Box key={group.title}>
          <SectionHeading>{group.title}</SectionHeading>
          <Stack spacing={0.25}>
            {group.tasks.map(([id, label]) => (
              <FormControlLabel
                key={id}
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
                sx={{
                  m: 0,
                  py: 0.25,
                  color: completed[id] ? "#849092" : "#243d3f",
                  textDecoration: completed[id] ? "line-through" : "none",
                }}
              />
            ))}
          </Stack>
        </Box>
      ))}

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Cómo comprobarla</Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Usa el patrón I–ii–iii–IV–V–vi–vii°–I. La sección Respuestas muestra
          las tres tonalidades y la fórmula 1–♭3–♭5–♭♭7 para los disminuidos.
        </Typography>
      </Box>
    </Stack>
  );
}

function HarmonyConceptsView() {
  const [tetradId, setTetradId] = useState("maj7");
  const dMajorHarmony = [
    ["I", "D", "Mayor"],
    ["ii", "Em", "Menor"],
    ["iii", "F♯m", "Menor"],
    ["IV", "G", "Mayor"],
    ["V", "A", "Mayor"],
    ["vi", "Bm", "Menor"],
    ["vii°", "C♯°", "Disminuido"],
  ];
  const tetrad =
    TETRAD_DETAILS.find((item) => item.id === tetradId) ?? TETRAD_DETAILS[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Referencia de armonía
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Fórmulas y ejemplos centrales de la clase.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Armonización de Re mayor</SectionHeading>
        <Box sx={{ borderTop: "1px solid #dce3e1" }}>
          {dMajorHarmony.map(([degree, chord, quality]) => (
            <Box
              key={degree}
              sx={{
                display: "grid",
                gridTemplateColumns: "70px 90px 1fr",
                py: 0.8,
                borderBottom: "1px solid #dce3e1",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>{degree}</Typography>
              <Typography>{chord}</Typography>
              <Typography sx={{ color: "#56676a" }}>{quality}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <SectionHeading>Fórmulas de cuatríadas</SectionHeading>
        <Typography sx={{ color: "#56676a", mb: 2 }}>
          Empieza con la escala mayor. Toma sus grados 1, 3, 5 y 7; después baja
          un semitono cada grado que tenga ♭. Un ♭♭ baja dos semitonos.
        </Typography>

        <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, mb: 2.5 }}>
          <Typography sx={{ fontWeight: 900 }}>
            Ejemplo base en C mayor
          </Typography>
          <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
            Escala: C–D–E–F–G–A–B · Elige 1–3–5–7: C–E–G–B. Como no se bajó
            ninguna nota, el resultado es Cmaj7.
          </Typography>
        </Box>

        <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
          <InputLabel id="tetrad-detail-label">Tipo de cuatríada</InputLabel>
          <Select
            labelId="tetrad-detail-label"
            label="Tipo de cuatríada"
            value={tetradId}
            onChange={(event) => setTetradId(event.target.value)}
          >
            {TETRAD_DETAILS.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.symbol} · {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ borderTop: "1px solid #dce3e1" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
              gap: { xs: 0.25, sm: 2 },
              py: 1.2,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>Nombre</Typography>
            <Typography sx={{ color: "#56676a" }}>
              {tetrad.symbol} · {tetrad.name}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
              gap: { xs: 0.25, sm: 2 },
              py: 1.2,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>Fórmula</Typography>
            <Typography sx={{ color: "#183638", fontWeight: 800 }}>
              {tetrad.formula}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
              gap: { xs: 0.25, sm: 2 },
              py: 1.2,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>Construcción</Typography>
            <Typography sx={{ color: "#56676a" }}>
              {tetrad.construction}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
              gap: { xs: 0.25, sm: 2 },
              py: 1.2,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>Ejemplo desde C</Typography>
            <Typography sx={{ color: "#183638", fontWeight: 800 }}>
              {tetrad.example}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>Nota por nota</Typography>
          <Box sx={{ borderTop: "1px solid #dce3e1" }}>
            {tetrad.notes.map(([degree, note, interval, distance]) => (
              <Box
                key={degree}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "52px 52px 1fr",
                    sm: "70px 70px 1fr 120px",
                  },
                  gap: 1,
                  py: 0.9,
                  borderBottom: "1px solid #dce3e1",
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{degree}</Typography>
                <Typography sx={{ fontWeight: 800 }}>{note}</Typography>
                <Typography sx={{ color: "#56676a" }}>{interval}</Typography>
                <Typography
                  sx={{
                    gridColumn: { xs: "3", sm: "auto" },
                    color: "#758285",
                    fontSize: 14,
                  }}
                >
                  {distance}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 2.5, border: "1px solid #d9e2e0", p: 2 }}>
          <Typography sx={{ fontWeight: 900 }}>La diferencia clave</Typography>
          <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
            Maj7 conserva la 7 natural. El acorde 7 baja esa nota a ♭7. Por eso
            Cmaj7 lleva B, mientras C7 lleva B♭.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Tónica y fundamental</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          La tónica pertenece a la escala. La fundamental es la nota desde la
          que se construye cada acorde.
        </Typography>
      </Box>
    </Stack>
  );
}

function HarmonyAnswersView() {
  const [scaleId, setScaleId] = useState("g");
  const answer =
    HARMONY_HOMEWORK_ANSWERS.find((item) => item.id === scaleId) ??
    HARMONY_HOMEWORK_ANSWERS[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Respuestas de la tarea
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Armonización de G, D y A mayor, más los tres acordes disminuidos 7.
        </Typography>
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel id="harmony-answer-scale-label">Escala</InputLabel>
        <Select
          labelId="harmony-answer-scale-label"
          label="Escala"
          value={scaleId}
          onChange={(event) => setScaleId(event.target.value)}
        >
          {HARMONY_HOMEWORK_ANSWERS.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <SectionHeading>Escala de {answer.label}</SectionHeading>
        <Typography sx={{ color: "#344b4d", fontWeight: 700 }}>
          {answer.scale}
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Grados, acordes y notas</SectionHeading>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 390 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "64px 100px 1fr",
                gap: 1,
                py: 0.8,
                borderBlock: "1px solid #cbd6d4",
                color: "#5d6c6e",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 900 }}>
                GRADO
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 900 }}>
                ACORDE
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 900 }}>
                NOTAS
              </Typography>
            </Box>
            {answer.chords.map(([degree, chord, notes], index) => (
              <Box
                key={`${degree}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "64px 100px 1fr",
                  gap: 1,
                  py: 0.9,
                  borderBottom: "1px solid #dce3e1",
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{degree}</Typography>
                <Typography sx={{ fontWeight: 800 }}>{chord}</Typography>
                <Typography sx={{ color: "#56676a" }}>{notes}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Respuesta corrida</Typography>
        <Typography sx={{ color: "#344b4d", mt: 0.5, fontWeight: 700 }}>
          {answer.sequence}
        </Typography>
      </Box>

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Fórmula para recordar</Typography>
        <Typography sx={{ color: "#344b4d", mt: 0.5 }}>
          I–ii–iii–IV–V–vi–vii°–I · M–m–m–M–M–m–°–M
        </Typography>
      </Box>

      <Divider />

      <Box>
        <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
          Acordes disminuidos 7
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Fórmula: 1–♭3–♭5–♭♭7. Se forman apilando terceras menores.
        </Typography>
      </Box>

      <Stack spacing={0} sx={{ borderTop: "1px solid #dce3e1" }}>
        {HARMONY_DIMINISHED_ANSWERS.map((item) => (
          <Box
            key={item.chord}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "76px 1fr", sm: "90px 1fr 1fr" },
              gap: 1,
              py: 1.25,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>{item.chord}</Typography>
            <Box>
              <Typography variant="caption" sx={{ color: "#6a797b" }}>
                ESCRITURA TEÓRICA
              </Typography>
              <Typography sx={{ color: "#183638", fontWeight: 750 }}>
                {item.notes}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "2", sm: "auto" } }}>
              <Typography variant="caption" sx={{ color: "#6a797b" }}>
                SONIDO ENARMÓNICO
              </Typography>
              <Typography sx={{ color: "#56676a" }}>
                {item.enharmonic}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Detalle importante</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          G°7 y E°7 contienen los mismos sonidos en otro orden. La escritura
          cambia para conservar la construcción por terceras y la función de
          cada nota.
        </Typography>
      </Box>
    </Stack>
  );
}

function ImprovisationSummaryView() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: "#0f766e", fontWeight: 900, letterSpacing: 1 }}
        >
          Idea central
        </Typography>
        <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 900 }}>
          Reconocer intervalos sin detener la música
        </Typography>
        <Typography sx={{ mt: 1, color: "#5d6c6e", maxWidth: 760 }}>
          La improvisación exige identificar rápidamente la distancia y la
          función de cada nota. La teoría se está usando como base para formar
          acordes y elegir notas con intención.
        </Typography>
      </Box>

      <Box component="figure" sx={{ m: 0 }}>
        <Box
          component="img"
          src={IMPROVISATION_BOARD_IMAGE}
          alt="Pizarrón de la clase de Improvisación con intervalos escritos en pentagrama"
          sx={{
            display: "block",
            width: "100%",
            maxHeight: 520,
            objectFit: "contain",
            bgcolor: "#eef2f1",
            border: "1px solid #d6dfdd",
          }}
        />
        <Typography
          component="figcaption"
          variant="caption"
          sx={{ display: "block", mt: 1, color: "#677779" }}
        >
          Pizarrón: 2m, 2M, 3m, 3M, 4J, quintas, sextas y séptimas.
        </Typography>
      </Box>

      <Divider />

      <Box>
        <SectionHeading>Quintas y formación de acordes</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d" }}>
          <Typography>
            • La quinta justa debe reconocerse de memoria: C–G, D–A, E–B, F–C,
            G–D, A–E y B–F♯.
          </Typography>
          <Typography>
            • Quinta disminuida: bajar un semitono a la quinta justa.
          </Typography>
          <Typography>
            • Quinta aumentada: subir un semitono a la quinta justa.
          </Typography>
          <Typography>
            • Un acorde básico se entiende como fundamental + tercera + quinta
            (1–3–5).
          </Typography>
        </Stack>
      </Box>

      <Divider />

      <Box>
        <SectionHeading>Función musical</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d" }}>
          <Typography>• Un intervalo no es una escala.</Typography>
          <Typography>
            • Voicing es la disposición de las notas y sus funciones dentro de
            un acorde.
          </Typography>
          <Typography>
            • Dos notas pueden sonar igual y cumplir funciones distintas: C y B♯
            son enarmónicas, pero no equivalentes en todo contexto.
          </Typography>
          <Typography>
            • Los atajos sirven para comprobar intervalos amplios, pero no deben
            borrar su función original.
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Ruta de aprendizaje</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Intervalos → formación de acordes → función de las notas → voicings →
          progresiones → Jazz Blues → elección de notas → improvisación.
        </Typography>
      </Box>
    </Stack>
  );
}

function ImprovisationTasksView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem(IMPROVISATION_STORAGE_KEY) ?? "{}",
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      IMPROVISATION_STORAGE_KEY,
      JSON.stringify(completed),
    );
  }, [completed]);

  const taskCount = IMPROVISATION_TASK_GROUPS.reduce(
    (total, group) => total + group.tasks.length,
    0,
  );
  const taskIds = new Set(
    IMPROVISATION_TASK_GROUPS.flatMap((group) => group.tasks.map(([id]) => id)),
  );
  const completedCount = Object.entries(completed).filter(
    ([id, isDone]) => isDone && taskIds.has(id),
  ).length;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
      >
        <Box>
          <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
            Estudio y tarea
          </Typography>
          <Typography sx={{ color: "#667678" }}>
            El maestro quiere revisar tu procedimiento, no una respuesta
            copiada.
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} de ${taskCount}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {IMPROVISATION_TASK_GROUPS.map((group) => (
        <Box key={group.title}>
          <SectionHeading>{group.title}</SectionHeading>
          <Stack spacing={0.25}>
            {group.tasks.map(([id, label]) => (
              <FormControlLabel
                key={id}
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
                sx={{
                  m: 0,
                  py: 0.25,
                  color: completed[id] ? "#849092" : "#243d3f",
                  textDecoration: completed[id] ? "line-through" : "none",
                }}
              />
            ))}
          </Stack>
        </Box>
      ))}

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Acordes reconstruidos</Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          La sección Respuestas usa la forma de Jazz Blues en C trabajada antes:
          C7, F7, F♯dim7, A7, Dm7 y G7. Conservamos la advertencia de que el
          audio no captó la lista escrita completa.
        </Typography>
      </Box>
    </Stack>
  );
}

function ImprovisationConceptsView() {
  const intervalRows = [
    ["2m", "½ tono"],
    ["2M", "1 tono"],
    ["3m", "1½ tonos"],
    ["3M", "2 tonos"],
    ["4J", "2½ tonos"],
    ["5dim", "3 tonos"],
    ["5J", "3½ tonos"],
    ["5aum", "4 tonos"],
    ["6m", "4 tonos"],
    ["6M", "4½ tonos"],
    ["7m", "5 tonos"],
    ["7M", "5½ tonos"],
  ];
  const fifthRows = [
    ["C", "G"],
    ["D", "A"],
    ["E", "B"],
    ["F", "C"],
    ["G", "D"],
    ["A", "E"],
    ["B", "F♯"],
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Referencia de intervalos
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Distancias para memorizar y reconocer con rapidez.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 3, sm: 4 },
        }}
      >
        <Box>
          <SectionHeading>Distancias</SectionHeading>
          <Box sx={{ borderTop: "1px solid #dce3e1" }}>
            {intervalRows.map(([interval, distance]) => (
              <Box
                key={interval}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  py: 0.8,
                  borderBottom: "1px solid #dce3e1",
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{interval}</Typography>
                <Typography sx={{ color: "#56676a" }}>{distance}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box>
          <SectionHeading>Quintas justas naturales</SectionHeading>
          <Box sx={{ borderTop: "1px solid #dce3e1" }}>
            {fifthRows.map(([root, fifth]) => (
              <Box
                key={root}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  py: 0.8,
                  borderBottom: "1px solid #dce3e1",
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{root}</Typography>
                <Typography sx={{ color: "#56676a" }}>{fifth}</Typography>
              </Box>
            ))}
          </Box>
          <Typography sx={{ mt: 1.5, color: "#5d6c6e", fontSize: 14 }}>
            Atención: la quinta justa de B es F♯, no F natural.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Regla importante</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Sonido ≠ función. Una escritura enarmónica puede sonar igual en el
          piano y aun así representar otra función armónica.
        </Typography>
      </Box>
    </Stack>
  );
}

function ImprovisationAnswersView() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Respuestas de la tarea
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Construcción de los acordes usados en el Jazz Blues en C.
        </Typography>
      </Box>

      <Box sx={{ borderLeft: "3px solid #b7791f", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>
          Referencia reconstruida
        </Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          El maestro indicó que estos acordes eran tarea, pero el audio no captó
          la lista del pizarrón. Esta respuesta parte de la forma de Jazz Blues
          en C que ya se había trabajado.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Forma de 12 compases</SectionHeading>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            borderTop: "1px solid #cbd6d4",
            borderLeft: "1px solid #cbd6d4",
          }}
        >
          {JAZZ_BLUES_ANSWERS.map(([measure, chord]) => (
            <Box
              key={measure}
              sx={{
                minHeight: 72,
                p: 1.25,
                borderRight: "1px solid #cbd6d4",
                borderBottom: "1px solid #cbd6d4",
              }}
            >
              <Typography variant="caption" sx={{ color: "#6a797b" }}>
                COMPÁS {measure}
              </Typography>
              <Typography sx={{ mt: 0.35, fontWeight: 900 }}>
                {chord}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <SectionHeading>Grados</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d", fontWeight: 700 }}>
          <Typography>I7 – IV7 – I7 – I7</Typography>
          <Typography>IV7 – ♯IV°7 – I7 – VI7</Typography>
          <Typography>IIm7 – V7 – I7 VI7 – IIm7 V7</Typography>
        </Stack>
      </Box>

      <Box>
        <SectionHeading>Construcción de acordes</SectionHeading>
        <Stack spacing={0} sx={{ borderTop: "1px solid #dce3e1" }}>
          {IMPROVISATION_CHORD_ANSWERS.map(([chord, formula, notes]) => (
            <Box
              key={chord}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "82px 1fr",
                  sm: "100px 180px 1fr",
                },
                gap: 1,
                py: 1.25,
                borderBottom: "1px solid #dce3e1",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>{chord}</Typography>
              <Typography sx={{ color: "#56676a" }}>{formula}</Typography>
              <Typography
                sx={{
                  gridColumn: { xs: "2", sm: "auto" },
                  color: "#183638",
                  fontWeight: 750,
                }}
              >
                {notes}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Procedimiento</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Escribe nombre del acorde → fórmula → notas. Por ejemplo: C7 →
          1–3–5–♭7 → C–E–G–B♭.
        </Typography>
      </Box>
    </Stack>
  );
}

export default function SemesterNotes() {
  const navigate = useNavigate();
  const [weekIndex, setWeekIndex] = useState(0);
  const [subject, setSubject] = useState<SubjectId>("solfeo");
  const [detailView, setDetailView] = useState<DetailView>("resumen");
  const week = WEEKS[weekIndex];
  const selectedSubject = SUBJECTS.find((item) => item.id === subject)!;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f9f8", color: "#172b2d" }}>
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #dce3e1" }}>
        <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 }, py: 2.5 }}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{ mb: 1.5, color: "#526365" }}
          >
            Volver al inicio
          </Button>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            spacing={1}
          >
            <Box>
              <Typography
                component="h1"
                sx={{ fontSize: { xs: 28, sm: 36 }, fontWeight: 950 }}
              >
                Notas del semestre
              </Typography>
              <Typography sx={{ color: "#687779", mt: 0.25 }}>
                Segundo año · Solfeo, Armonía e Improvisación
              </Typography>
            </Box>
            <Chip label="Segundo año" variant="outlined" />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 }, py: 3 }}>
        <Paper variant="outlined" square sx={{ bgcolor: "#fff" }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ p: { xs: 1.25, sm: 2 }, borderBottom: "1px solid #dce3e1" }}
          >
            <IconButton
              aria-label="Semana anterior"
              disabled={weekIndex === 0}
              onClick={() => setWeekIndex((index) => Math.max(0, index - 1))}
            >
              <ChevronLeft />
            </IconButton>
            <FormControl fullWidth size="small">
              <InputLabel id="semester-week-label">Semana</InputLabel>
              <Select
                labelId="semester-week-label"
                label="Semana"
                value={weekIndex}
                onChange={(event) => setWeekIndex(Number(event.target.value))}
              >
                {WEEKS.map((item, index) => (
                  <MenuItem key={item.id} value={index}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              aria-label="Semana siguiente"
              disabled={weekIndex === WEEKS.length - 1}
              onClick={() =>
                setWeekIndex((index) => Math.min(WEEKS.length - 1, index + 1))
              }
            >
              <ChevronRight />
            </IconButton>
          </Stack>

          <Tabs
            value={subject}
            onChange={(_, value: SubjectId) => {
              setSubject(value);
              setDetailView("resumen");
            }}
            variant="fullWidth"
            aria-label="Materias del semestre"
            sx={{ borderBottom: "1px solid #dce3e1" }}
          >
            {SUBJECTS.map((item) => (
              <Tab
                key={item.id}
                value={item.id}
                label={item.label}
                sx={{ textTransform: "none", fontWeight: 850 }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            {selectedSubject.hasNotes ? (
              <>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1.5}
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography variant="overline" sx={{ color: "#657577" }}>
                      Semana {week.shortLabel}
                    </Typography>
                    <Typography
                      component="h2"
                      sx={{ fontSize: 24, fontWeight: 950 }}
                    >
                      {selectedSubject.label}
                    </Typography>
                  </Box>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={detailView}
                    onChange={(_, value: DetailView | null) =>
                      value && setDetailView(value)
                    }
                    aria-label={`Apartado de ${selectedSubject.label}`}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      "& .MuiToggleButton-root": {
                        flex: { xs: 1, sm: "initial" },
                        px: { xs: 0.75, sm: 1.5 },
                        fontSize: { xs: 11, sm: 13 },
                      },
                    }}
                  >
                    <ToggleButton value="resumen">Resumen</ToggleButton>
                    <ToggleButton value="tareas">Tareas</ToggleButton>
                    <ToggleButton value="conceptos">Conceptos</ToggleButton>
                    {subject !== "solfeo" && (
                      <ToggleButton value="respuestas">Respuestas</ToggleButton>
                    )}
                  </ToggleButtonGroup>
                </Stack>

                {subject === "solfeo" && detailView === "resumen" && (
                  <SummaryView />
                )}
                {subject === "solfeo" && detailView === "tareas" && (
                  <TasksView />
                )}
                {subject === "solfeo" && detailView === "conceptos" && (
                  <ConceptsView />
                )}
                {subject === "armonia" && detailView === "resumen" && (
                  <HarmonySummaryView />
                )}
                {subject === "armonia" && detailView === "tareas" && (
                  <HarmonyTasksView />
                )}
                {subject === "armonia" && detailView === "conceptos" && (
                  <HarmonyConceptsView />
                )}
                {subject === "armonia" && detailView === "respuestas" && (
                  <HarmonyAnswersView />
                )}
                {subject === "improvisacion" && detailView === "resumen" && (
                  <ImprovisationSummaryView />
                )}
                {subject === "improvisacion" && detailView === "tareas" && (
                  <ImprovisationTasksView />
                )}
                {subject === "improvisacion" && detailView === "conceptos" && (
                  <ImprovisationConceptsView />
                )}
                {subject === "improvisacion" && detailView === "respuestas" && (
                  <ImprovisationAnswersView />
                )}
              </>
            ) : (
              <Box sx={{ py: { xs: 5, sm: 8 }, textAlign: "center" }}>
                <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
                  {selectedSubject.label}
                </Typography>
                <Typography sx={{ mt: 1, color: "#6a797b" }}>
                  Aún no hay notas para esta semana.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
