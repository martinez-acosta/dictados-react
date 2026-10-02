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
import HarmonyTurnaroundWeek from "./HarmonyTurnaroundWeek";
import DetailedClassNotes from "./DetailedClassNotes";
import ImprovisationChordStudy from "./ImprovisationChordStudy";
import HarmonyInversionsWeek from "./HarmonyInversionsWeek";
import SolfegePulseWeek from "./SolfegePulseWeek";

type SubjectId = "solfeo" | "armonia" | "improvisacion" | "piano";
type DetailView = "resumen" | "tareas" | "conceptos" | "respuestas";

const WEEKS: Array<{
  id: string;
  label: string;
  shortLabel: string;
  subjects: SubjectId[];
}> = [
  {
    id: "2026-09-07",
    label: "7–13 de septiembre de 2026",
    shortLabel: "7–13 sep",
    subjects: ["solfeo", "armonia", "improvisacion"],
  },
  {
    id: "2026-09-14",
    label: "14–20 de septiembre de 2026",
    shortLabel: "14–20 sep",
    subjects: ["solfeo", "armonia", "improvisacion"],
  },
  {
    id: "2026-09-21",
    label: "21–27 de septiembre de 2026",
    shortLabel: "21–27 sep",
    subjects: ["piano", "armonia"],
  },
  {
    id: "2026-09-28",
    label: "28 de septiembre–2 de octubre de 2026",
    shortLabel: "28 sep–2 oct",
    subjects: ["solfeo", "armonia", "improvisacion"],
  },
];

const SUBJECTS: Array<{ id: SubjectId; label: string }> = [
  { id: "solfeo", label: "Solfeo" },
  { id: "armonia", label: "Armonía" },
  { id: "improvisacion", label: "Improvisación" },
  { id: "piano", label: "Piano" },
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

const SOLFEGE_WEEK_TWO_TASK_GROUPS = [
  {
    title: "Dandelot · Clave de Sol",
    tasks: [
      ["dandelot-16", "Lección 16 · última revisión"],
      ["dandelot-70", "Practicar a 70 BPM"],
      ["dandelot-body", "Sin marcar pie, cabeza ni chasquidos"],
      ["dandelot-flow", "Mantener la lectura aunque haya errores"],
    ],
  },
  {
    title: "Clave de Fa",
    tasks: [
      ["bass-4", "Lección 4"],
      ["bass-5", "Lección 5"],
      ["bass-60", "Ambas a 60 BPM"],
      ["bass-directions", "Leer de principio a fin y al revés"],
    ],
  },
  {
    title: "Baqueiro Foster",
    tasks: [
      ["baqueiro-26", "Lección 26"],
      ["baqueiro-80", "Practicar a 80 BPM"],
      ["baqueiro-syncopation", "Acentuar correctamente cada síncopa"],
    ],
  },
] as const;

const PIANO_WEEK_TASK_GROUPS = [
  {
    title: "Escalas mayores · tres octavas",
    tasks: [
      ["c-major", "Do mayor · ida y vuelta"],
      ["g-major", "Sol mayor · ida y vuelta"],
      ["d-major", "Re mayor · ida y vuelta"],
      ["a-major", "La mayor · ida y vuelta"],
      ["e-major", "Mi mayor · ida y vuelta"],
    ],
  },
  {
    title: "Control técnico",
    tasks: [
      ["fingering", "Mantener la misma digitación en las cinco escalas"],
      ["hands", "Practicar cada mano por separado antes de unirlas"],
      ["even", "Conservar pulso y volumen parejos al cruzar los dedos"],
    ],
  },
] as const;

const PIANO_SCALE_ANSWERS = [
  {
    id: "c",
    label: "Do mayor",
    keySignature: "Sin sostenidos ni bemoles",
    ascending: "C – D – E – F – G – A – B – C",
    descending: "C – B – A – G – F – E – D – C",
  },
  {
    id: "g",
    label: "Sol mayor",
    keySignature: "1 sostenido: F♯",
    ascending: "G – A – B – C – D – E – F♯ – G",
    descending: "G – F♯ – E – D – C – B – A – G",
  },
  {
    id: "d",
    label: "Re mayor",
    keySignature: "2 sostenidos: F♯, C♯",
    ascending: "D – E – F♯ – G – A – B – C♯ – D",
    descending: "D – C♯ – B – A – G – F♯ – E – D",
  },
  {
    id: "a",
    label: "La mayor",
    keySignature: "3 sostenidos: F♯, C♯, G♯",
    ascending: "A – B – C♯ – D – E – F♯ – G♯ – A",
    descending: "A – G♯ – F♯ – E – D – C♯ – B – A",
  },
  {
    id: "e",
    label: "Mi mayor",
    keySignature: "4 sostenidos: F♯, C♯, G♯, D♯",
    ascending: "E – F♯ – G♯ – A – B – C♯ – D♯ – E",
    descending: "E – D♯ – C♯ – B – A – G♯ – F♯ – E",
  },
] as const;

const SOLFEGE_STORAGE_KEY = "semester-notes:2026-09-07:solfeo:tasks";
const SOLFEGE_WEEK_TWO_STORAGE_KEY = "semester-notes:2026-09-14:solfeo:tasks";
const PIANO_WEEK_STORAGE_KEY = "semester-notes:2026-09-21:piano:tasks";
const IMPROVISATION_WEEK_TWO_STORAGE_KEY =
  "semester-notes:2026-09-14:improvisacion:study";
const HARMONY_WEEK_TWO_STORAGE_KEY = "semester-notes:2026-09-14:armonia:tasks";
const IMPROVISATION_STORAGE_KEY =
  "semester-notes:2026-09-07:improvisacion:tasks";
const HARMONY_STORAGE_KEY = "semester-notes:2026-09-07:armonia:study";
const IMPROVISATION_BOARD_IMAGE = `${import.meta.env.BASE_URL}semester-notes/2026-09-07/improvisacion-intervalos.png`;
const IMPROVISATION_WEEK_TWO_BOARD_IMAGE = `${import.meta.env.BASE_URL}semester-notes/2026-09-14/improvisacion-grados-extensiones.png`;

const SOLFEGE_WEEK_TWO_BOARD_IMAGES = [
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-14/solfeo-sincopa-1.png`,
    label: "Síncopa y contratiempo · ejemplos completos",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-14/solfeo-sincopa-2.png`,
    label: "Figuras rítmicas en 4/4",
  },
] as const;

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

const HARMONY_WEEK_TWO_BOARD_IMAGES = [
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-14/armonia-cuatriadas-1.png`,
    label: "Armonización de Do mayor con cuatríadas",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-14/armonia-cuatriadas-2.png`,
    label: "Armonización de Do mayor · vista completa",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-14/armonia-formulas-1.png`,
    label: "Tipos y fórmulas de cuatríadas",
  },
  {
    src: `${import.meta.env.BASE_URL}semester-notes/2026-09-14/armonia-formulas-2.png`,
    label: "Tipos y fórmulas · vista completa",
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

const HARMONY_WEEK_TWO_TASK_GROUPS = [
  {
    title: "Tarea · A mayor",
    tasks: [
      ["a-scale", "Construir la escala de A mayor"],
      ["a-tetrads", "Formar una cuatríada sobre cada grado"],
      ["a-labels", "Anotar grado, nombre y notas de cada acorde"],
    ],
  },
  {
    title: "Tarea · E mayor",
    tasks: [
      ["e-scale", "Construir la escala de E mayor"],
      ["e-tetrads", "Formar una cuatríada sobre cada grado"],
      ["e-labels", "Anotar grado, nombre y notas de cada acorde"],
    ],
  },
  {
    title: "Preparación de examen",
    tasks: [
      ["pattern", "Memorizar Imaj7–iim7–iiim7–IVmaj7–V7–vim7–viim7♭5"],
      ["piano", "Practicar las cuatríadas en piano"],
      ["seventh-shortcuts", "Reconocer 7M y 7m desde la octava"],
    ],
  },
] as const;

const HARMONY_WEEK_TWO_ANSWERS = [
  {
    id: "a",
    label: "A mayor",
    scale: "A – B – C♯ – D – E – F♯ – G♯ – A",
    sequence: "Amaj7 – Bm7 – C♯m7 – Dmaj7 – E7 – F♯m7 – G♯m7♭5",
    chords: [
      ["I", "Amaj7", "A – C♯ – E – G♯"],
      ["ii", "Bm7", "B – D – F♯ – A"],
      ["iii", "C♯m7", "C♯ – E – G♯ – B"],
      ["IV", "Dmaj7", "D – F♯ – A – C♯"],
      ["V", "E7", "E – G♯ – B – D"],
      ["vi", "F♯m7", "F♯ – A – C♯ – E"],
      ["vii", "G♯m7♭5", "G♯ – B – D – F♯"],
    ],
  },
  {
    id: "e",
    label: "E mayor",
    scale: "E – F♯ – G♯ – A – B – C♯ – D♯ – E",
    sequence: "Emaj7 – F♯m7 – G♯m7 – Amaj7 – B7 – C♯m7 – D♯m7♭5",
    chords: [
      ["I", "Emaj7", "E – G♯ – B – D♯"],
      ["ii", "F♯m7", "F♯ – A – C♯ – E"],
      ["iii", "G♯m7", "G♯ – B – D♯ – F♯"],
      ["IV", "Amaj7", "A – C♯ – E – G♯"],
      ["V", "B7", "B – D♯ – F♯ – A"],
      ["vi", "C♯m7", "C♯ – E – G♯ – B"],
      ["vii", "D♯m7♭5", "D♯ – F♯ – A – C♯"],
    ],
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

const IMPROVISATION_WEEK_TWO_STUDY_GROUPS = [
  {
    title: "Lectura de símbolos",
    tasks: [
      ["maj7", "Formar acordes Maj7"],
      ["dominant7", "Formar acordes 7"],
      ["minor7", "Formar acordes m7"],
      ["minor-major7", "Formar acordes mMaj7"],
      ["half-diminished", "Formar acordes m7♭5"],
      ["diminished7", "Formar acordes dim7"],
      ["sevenths", "Diferenciar 7ª mayor, menor y disminuida"],
    ],
  },
  {
    title: "Acorde y material melódico",
    tasks: [
      ["chord-tonality", "No confundir acorde aislado con tonalidad"],
      ["relatives", "Repasar relativas mayores y menores"],
      ["major-degrees", "Memorizar los grados de la estructura mayor"],
      ["minor-degrees", "Repasar los grados de la estructura menor"],
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
  return <DetailedClassNotes lessonId="solfeo-2026-09-07" />;
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

function SolfegeWeekTwoSummaryView() {
  return (
    <DetailedClassNotes
      lessonId="solfeo-2026-09-14"
      photos={SOLFEGE_WEEK_TWO_BOARD_IMAGES}
    />
  );
}

function SolfegeWeekTwoTasksView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem(SOLFEGE_WEEK_TWO_STORAGE_KEY) ?? "{}",
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      SOLFEGE_WEEK_TWO_STORAGE_KEY,
      JSON.stringify(completed),
    );
  }, [completed]);

  const taskCount = SOLFEGE_WEEK_TWO_TASK_GROUPS.reduce(
    (total, group) => total + group.tasks.length,
    0,
  );
  const taskIds = new Set(
    SOLFEGE_WEEK_TWO_TASK_GROUPS.flatMap((group) =>
      group.tasks.map(([id]) => id),
    ),
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
            Tarea para la siguiente clase
          </Typography>
          <Typography sx={{ color: "#667678" }}>
            Tres métodos, cada uno con su tempo específico.
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} de ${taskCount}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {SOLFEGE_WEEK_TWO_TASK_GROUPS.map((group) => (
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
        <Typography sx={{ fontWeight: 900 }}>Indicación definitiva</Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          El maestro corrigió la indicación al final: la tarea de Baqueiro es la
          lección 26 a 80 BPM, cuidando los acentos de síncopa.
        </Typography>
      </Box>
    </Stack>
  );
}

function SolfegeWeekTwoConceptsView() {
  const metricAccents = [
    ["2 tiempos", "1 fuerte · 2 débil"],
    ["3 tiempos", "1 fuerte · 2 débil · 3 débil"],
    ["4 tiempos", "1 fuerte · 2 débil · 3 semifuerte · 4 débil"],
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Conceptos de la semana
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Reglas para distinguir duración, articulación y desplazamiento del
          acento.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Puntillo y ligaduras</SectionHeading>
        <Box sx={{ borderTop: "1px solid #dce3e1" }}>
          {[
            [
              "Puntillo",
              "Agrega la mitad del valor. Una blanca con puntillo dura 3 negras.",
            ],
            ["Prolongación", "Une la misma nota y suma sus duraciones."],
            [
              "Fraseo",
              "Une notas de distinta altura para interpretarlas como una frase.",
            ],
          ].map(([term, meaning]) => (
            <Box
              key={term}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "150px 1fr" },
                gap: { xs: 0.25, sm: 2 },
                py: 1.1,
                borderBottom: "1px solid #dce3e1",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>{term}</Typography>
              <Typography sx={{ color: "#56676a" }}>{meaning}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <SectionHeading>Fuerte y débil</SectionHeading>
        <Box sx={{ borderTop: "1px solid #dce3e1" }}>
          {metricAccents.map(([meter, accents]) => (
            <Box
              key={meter}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "100px 1fr", sm: "150px 1fr" },
                gap: 1,
                py: 1,
                borderBottom: "1px solid #dce3e1",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>{meter}</Typography>
              <Typography sx={{ color: "#56676a" }}>{accents}</Typography>
            </Box>
          ))}
        </Box>
        <Typography sx={{ color: "#5d6c6e", mt: 1.25 }}>
          En un compás simple cada pulso se divide en dos. Dentro del pulso, la
          primera corchea es fuerte y la segunda es débil: 1–y.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Contratiempo vs. síncopa</SectionHeading>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 470 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 120px",
                gap: 1,
                py: 0.8,
                borderBlock: "1px solid #cbd6d4",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 900 }}>
                CARACTERÍSTICA
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 900 }}>
                CONTRATIEMPO
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 900 }}>
                SÍNCOPA
              </Typography>
            </Box>
            {[
              ["Aparece en parte débil", "Sí", "Sí"],
              ["Desplaza el acento", "Sí", "Sí"],
              ["Precedido por silencio", "Siempre", "No necesariamente"],
              ["Puede llegar a parte fuerte", "No", "Sí"],
            ].map(([feature, offbeat, syncopation]) => (
              <Box
                key={feature}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 120px",
                  gap: 1,
                  py: 0.9,
                  borderBottom: "1px solid #dce3e1",
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>{feature}</Typography>
                <Typography sx={{ color: "#56676a" }}>{offbeat}</Typography>
                <Typography sx={{ color: "#56676a" }}>{syncopation}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Tipos de síncopa</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          De tiempo: empieza en la parte débil y se prolonga hacia el siguiente
          tiempo. De compás: la ligadura atraviesa la barra de compás. Regular:
          valores iguales; irregular: valores diferentes.
        </Typography>
      </Box>

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Regla para memorizar</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          El contratiempo siempre viene después de un silencio. La síncopa no, y
          puede prolongarse desde una parte débil hacia una fuerte. Toda síncopa
          debe acentuarse.
        </Typography>
      </Box>
    </Stack>
  );
}

function ImprovisationWeekTwoSummaryView() {
  return (
    <DetailedClassNotes
      lessonId="improvisacion-2026-09-14"
      photos={[
        {
          src: IMPROVISATION_WEEK_TWO_BOARD_IMAGE,
          label: "Grados y extensiones 9, 11 y 13",
        },
      ]}
    />
  );
}

function ImprovisationWeekTwoTasksView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem(IMPROVISATION_WEEK_TWO_STORAGE_KEY) ?? "{}",
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      IMPROVISATION_WEEK_TWO_STORAGE_KEY,
      JSON.stringify(completed),
    );
  }, [completed]);

  const taskCount = IMPROVISATION_WEEK_TWO_STUDY_GROUPS.reduce(
    (total, group) => total + group.tasks.length,
    0,
  );
  const taskIds = new Set(
    IMPROVISATION_WEEK_TWO_STUDY_GROUPS.flatMap((group) =>
      group.tasks.map(([id]) => id),
    ),
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
            Estudio recomendado
          </Typography>
          <Typography sx={{ color: "#667678" }}>
            La grabación no contiene una tarea nueva explícita para entregar.
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} de ${taskCount}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {IMPROVISATION_WEEK_TWO_STUDY_GROUPS.map((group) => (
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
        <Typography sx={{ fontWeight: 900 }}>
          Dónde continúa la clase
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          El audio termina cuando empieza la comparación interválica de las
          estructuras mayor y menor. Por eso se conserva como estudio y no como
          entrega confirmada.
        </Typography>
      </Box>
    </Stack>
  );
}

function ImprovisationWeekTwoConceptsView() {
  const symbolParts = [
    ["Letra", "Fundamental del acorde: C, D, E…"],
    ["Sin m", "La tríada es mayor"],
    ["m", "La tercera baja: tríada menor"],
    ["7", "Séptima menor"],
    ["Maj7", "Séptima mayor"],
    ["♭5", "Quinta disminuida"],
    ["dim7 / °7", "Tríada disminuida + séptima disminuida"],
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Leer el símbolo por partes
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Cada fragmento modifica una función concreta del acorde.
        </Typography>
      </Box>

      <Box sx={{ borderTop: "1px solid #dce3e1" }}>
        {symbolParts.map(([symbol, meaning]) => (
          <Box
            key={symbol}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "90px 1fr", sm: "140px 1fr" },
              gap: 1,
              py: 1,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>{symbol}</Typography>
            <Typography sx={{ color: "#56676a" }}>{meaning}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Cómo leer CmMaj7</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          C es la fundamental · m convierte la tríada en menor · Maj7 conserva
          una séptima mayor. Resultado: C–E♭–G–B.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Grados que rodean al acorde</SectionHeading>
        <Box sx={{ borderTop: "1px solid #dce3e1" }}>
          {[
            ["1", "Fundamental"],
            ["2", "Normalmente 2ª mayor; será 9ª como extensión"],
            ["3", "Define si la estructura es mayor o menor"],
            ["4", "Normalmente 4ª justa"],
            ["5", "Justa, disminuida ♭5 o aumentada ♯5"],
            ["6", "Mayor en estructura mayor; menor en menor natural"],
            ["7", "Mayor, menor o disminuida según el símbolo"],
          ].map(([degree, role]) => (
            <Box
              key={degree}
              sx={{
                display: "grid",
                gridTemplateColumns: "50px 1fr",
                gap: 1,
                py: 0.9,
                borderBottom: "1px solid #dce3e1",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>{degree}</Typography>
              <Typography sx={{ color: "#56676a" }}>{role}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box>
        <SectionHeading>Relativas</SectionHeading>
        <Typography sx={{ color: "#344b4d" }}>
          La relativa menor nace en el VI grado de la escala mayor. G mayor y E
          menor natural comparten G–A–B–C–D–E–F♯; cambia la nota que funciona
          como centro.
        </Typography>
      </Box>

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>
          Modos: solo introducción
        </Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Se mencionaron Jónico, Dórico y Frigio, pero todavía no son el tema
          principal. Primero hay que leer bien el acorde y sus grados.
        </Typography>
      </Box>
    </Stack>
  );
}

function ImprovisationWeekTwoAnswersView() {
  const [answerTopic, setAnswerTopic] = useState("chords");

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Respuestas de las tareas
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Soluciones completas para comprobar cada tema de estudio.
        </Typography>
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel id="improvisation-week-two-answer-label">
          Respuesta
        </InputLabel>
        <Select
          labelId="improvisation-week-two-answer-label"
          label="Respuesta"
          value={answerTopic}
          onChange={(event) => setAnswerTopic(event.target.value)}
        >
          <MenuItem value="chords">Acordes de séptima</MenuItem>
          <MenuItem value="c7">C7 · completar 2, 4 y 6</MenuItem>
          <MenuItem value="em7">Em7 · relativa mayor</MenuItem>
          <MenuItem value="structures">Estructuras mayor y menor</MenuItem>
        </Select>
      </FormControl>

      {answerTopic === "chords" && (
        <Stack spacing={3}>
          <Box>
            <SectionHeading>Corrección de la tarea anterior</SectionHeading>
            <Stack spacing={0} sx={{ borderTop: "1px solid #dce3e1" }}>
              {[
                ["G7", "1–3–5–♭7", "G – B – D – F", "La 7ª es F, no F♯."],
                [
                  "Am7",
                  "1–♭3–5–♭7",
                  "A – C – E – G",
                  "Tríada menor + 7ª menor.",
                ],
              ].map(([chord, formula, notes, explanation]) => (
                <Box
                  key={chord}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "76px 1fr",
                      sm: "90px 140px 1fr",
                    },
                    gap: 1,
                    py: 1.2,
                    borderBottom: "1px solid #dce3e1",
                  }}
                >
                  <Typography sx={{ fontWeight: 900 }}>{chord}</Typography>
                  <Typography sx={{ color: "#56676a" }}>{formula}</Typography>
                  <Box sx={{ gridColumn: { xs: "2", sm: "auto" } }}>
                    <Typography sx={{ color: "#183638", fontWeight: 800 }}>
                      {notes}
                    </Typography>
                    <Typography sx={{ color: "#758285", fontSize: 14 }}>
                      {explanation}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <SectionHeading>Familia de cuatríadas desde C</SectionHeading>
            <Stack spacing={0} sx={{ borderTop: "1px solid #dce3e1" }}>
              {TETRAD_DETAILS.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "90px 1fr",
                      sm: "130px 150px 1fr",
                    },
                    gap: 1,
                    py: 1.1,
                    borderBottom: "1px solid #dce3e1",
                  }}
                >
                  <Typography sx={{ fontWeight: 900 }}>
                    {item.symbol}
                  </Typography>
                  <Typography sx={{ color: "#56676a" }}>
                    {item.formula}
                  </Typography>
                  <Typography
                    sx={{
                      gridColumn: { xs: "2", sm: "auto" },
                      color: "#183638",
                      fontWeight: 750,
                    }}
                  >
                    {item.example}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
            <Typography sx={{ fontWeight: 900 }}>
              Cómo distinguir las séptimas
            </Typography>
            <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
              7ª mayor: 11 semitonos, medio tono antes de la octava. 7ª menor:
              10 semitonos, un tono antes. 7ª disminuida: 9 semitonos y se
              escribe ♭♭7. Desde G: F♯ = 7M, F = 7m y F♭ = 7dim.
            </Typography>
          </Box>
        </Stack>
      )}

      {answerTopic === "c7" && (
        <Stack spacing={2.5}>
          <Box>
            <SectionHeading>1. Construir el acorde</SectionHeading>
            <Typography sx={{ color: "#344b4d" }}>
              C7 = 1–3–5–♭7 = <strong>C – E – G – B♭</strong>.
            </Typography>
          </Box>
          <Box>
            <SectionHeading>2. Completar los grados faltantes</SectionHeading>
            <Typography sx={{ color: "#344b4d" }}>
              2 = D · 4 = F · 6 = A. Al colocarlos una octava arriba se llaman 9
              = D · 11 = F · 13 = A.
            </Typography>
          </Box>
          <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
            <Typography sx={{ fontWeight: 900 }}>Material completo</Typography>
            <Typography sx={{ color: "#344b4d", mt: 0.5, fontWeight: 750 }}>
              C – D – E – F – G – A – B♭
            </Typography>
            <Typography sx={{ color: "#667678", mt: 0.5 }}>
              Fórmula: 1–2–3–4–5–6–♭7. Es material posible para improvisar, pero
              C7 aislado no confirma por sí solo una tonalidad.
            </Typography>
          </Box>
        </Stack>
      )}

      {answerTopic === "em7" && (
        <Stack spacing={2.5}>
          <Box>
            <SectionHeading>1. Construir el acorde</SectionHeading>
            <Typography sx={{ color: "#344b4d" }}>
              Em7 = 1–♭3–5–♭7 = <strong>E – G – B – D</strong>.
            </Typography>
          </Box>
          <Box>
            <SectionHeading>2. Encontrar la relativa</SectionHeading>
            <Typography sx={{ color: "#344b4d" }}>
              E menor es la relativa menor de G mayor porque E es el VI grado de
              G. Ambas usan las mismas notas.
            </Typography>
          </Box>
          <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
            <Typography sx={{ fontWeight: 900 }}>Material completo</Typography>
            <Typography sx={{ color: "#344b4d", mt: 0.5, fontWeight: 750 }}>
              E – F♯ – G – A – B – C – D
            </Typography>
            <Typography sx={{ color: "#667678", mt: 0.5 }}>
              Faltaban 2 = F♯, 4 = A y ♭6 = C. Fórmula menor natural:
              1–2–♭3–4–5–♭6–♭7.
            </Typography>
          </Box>
        </Stack>
      )}

      {answerTopic === "structures" && (
        <Stack spacing={3}>
          <Box>
            <SectionHeading>Estructuras por grados</SectionHeading>
            {[
              ["Mayor", "1 – 2 – 3 – 4 – 5 – 6 – 7"],
              ["Menor natural", "1 – 2 – ♭3 – 4 – 5 – ♭6 – ♭7"],
            ].map(([name, formula]) => (
              <Box
                key={name}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "110px 1fr", sm: "150px 1fr" },
                  gap: 1,
                  py: 1,
                  borderBottom: "1px solid #dce3e1",
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{name}</Typography>
                <Typography sx={{ color: "#344b4d", fontWeight: 700 }}>
                  {formula}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box>
            <SectionHeading>Relativas que comparten notas</SectionHeading>
            <Typography sx={{ color: "#344b4d" }}>
              C mayor ↔ A menor · G mayor ↔ E menor · D mayor ↔ B menor · A
              mayor ↔ F♯ menor · E mayor ↔ C♯ menor.
            </Typography>
          </Box>

          <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
            <Typography sx={{ fontWeight: 900 }}>
              Acorde aislado ≠ tonalidad
            </Typography>
            <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
              C7 solo asegura C–E–G–B♭. Puede funcionar como V7 de F mayor, pero
              únicamente si el contexto armónico lo confirma. Primero se lee el
              acorde; después se decide la escala o el modo.
            </Typography>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}

function HarmonyWeekTwoSummaryView() {
  return (
    <DetailedClassNotes
      lessonId="armonia-2026-09-14"
      photos={HARMONY_WEEK_TWO_BOARD_IMAGES}
    />
  );
}

function HarmonyWeekTwoTasksView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem(HARMONY_WEEK_TWO_STORAGE_KEY) ?? "{}",
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      HARMONY_WEEK_TWO_STORAGE_KEY,
      JSON.stringify(completed),
    );
  }, [completed]);

  const taskCount = HARMONY_WEEK_TWO_TASK_GROUPS.reduce(
    (total, group) => total + group.tasks.length,
    0,
  );
  const completedCount = HARMONY_WEEK_TWO_TASK_GROUPS.flatMap(
    (group) => group.tasks,
  ).filter(([id]) => completed[id]).length;

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
            Tarea de Armonía
          </Typography>
          <Typography sx={{ color: "#667678" }}>
            Armonizar A mayor y E mayor con cuatríadas.
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} de ${taskCount}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {HARMONY_WEEK_TWO_TASK_GROUPS.map((group) => (
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
    </Stack>
  );
}

function HarmonyWeekTwoConceptsView() {
  const cMajorTetrads = [
    ["I", "C–E–G–B", "Cmaj7"],
    ["ii", "D–F–A–C", "Dm7"],
    ["iii", "E–G–B–D", "Em7"],
    ["IV", "F–A–C–E", "Fmaj7"],
    ["V", "G–B–D–F", "G7"],
    ["vi", "A–C–E–G", "Am7"],
    ["vii", "B–D–F–A", "Bm7♭5"],
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Cómo armonizar con cuatríadas
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Sobre cada grado toma una nota sí y una no: 1–3–5–7.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Ejemplo completo · C mayor</SectionHeading>
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 410 }}>
            {cMajorTetrads.map(([degree, notes, chord]) => (
              <Box
                key={degree}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "55px 1fr 110px",
                  gap: 1,
                  py: 0.9,
                  borderBottom: "1px solid #dce3e1",
                }}
              >
                <Typography sx={{ fontWeight: 900 }}>{degree}</Typography>
                <Typography sx={{ color: "#56676a" }}>{notes}</Typography>
                <Typography sx={{ fontWeight: 800 }}>{chord}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>V grado dominante</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          G–B–D es una tríada mayor, pero F es séptima menor de G. Por eso el
          acorde es G7, no Gmaj7.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Semidisminuido vs. disminuido 7</SectionHeading>
        <Typography sx={{ color: "#344b4d" }}>
          m7♭5 = tríada disminuida + 7ª menor. dim7 = tríada disminuida + 7ª
          disminuida. El vii grado de la escala mayor produce m7♭5.
        </Typography>
      </Box>
    </Stack>
  );
}

function HarmonyWeekTwoAnswersView() {
  const [scaleId, setScaleId] = useState("a");
  const answer =
    HARMONY_WEEK_TWO_ANSWERS.find((item) => item.id === scaleId) ??
    HARMONY_WEEK_TWO_ANSWERS[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Respuestas de la tarea
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Escalas y cuatríadas completas de A mayor y E mayor.
        </Typography>
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel id="harmony-week-two-answer-label">Escala</InputLabel>
        <Select
          labelId="harmony-week-two-answer-label"
          label="Escala"
          value={scaleId}
          onChange={(event) => setScaleId(event.target.value)}
        >
          {HARMONY_WEEK_TWO_ANSWERS.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <SectionHeading>Escala</SectionHeading>
        <Typography sx={{ color: "#344b4d", fontWeight: 700 }}>
          {answer.scale}
        </Typography>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 420 }}>
          {answer.chords.map(([degree, chord, notes]) => (
            <Box
              key={degree}
              sx={{
                display: "grid",
                gridTemplateColumns: "55px 120px 1fr",
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

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>Respuesta corrida</Typography>
        <Typography sx={{ color: "#344b4d", mt: 0.5, fontWeight: 700 }}>
          {answer.sequence}
        </Typography>
      </Box>
    </Stack>
  );
}

function HarmonySummaryView() {
  return (
    <DetailedClassNotes
      lessonId="armonia-2026-09-07"
      photos={HARMONY_BOARD_IMAGES}
    />
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
    <DetailedClassNotes
      lessonId="improvisacion-2026-09-07"
      photos={[
        { src: IMPROVISATION_BOARD_IMAGE, label: "Intervalos en pentagrama" },
      ]}
    />
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

function PianoWeekSummaryView() {
  return <DetailedClassNotes lessonId="piano-2026-09-21" />;
}

function PianoWeekTasksView() {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem(PIANO_WEEK_STORAGE_KEY) ?? "{}",
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      PIANO_WEEK_STORAGE_KEY,
      JSON.stringify(completed),
    );
  }, [completed]);

  const taskCount = PIANO_WEEK_TASK_GROUPS.reduce(
    (total, group) => total + group.tasks.length,
    0,
  );
  const completedCount = PIANO_WEEK_TASK_GROUPS.flatMap(
    (group) => group.tasks,
  ).filter(([id]) => completed[id]).length;

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
            Tarea de Piano
          </Typography>
          <Typography sx={{ color: "#667678" }}>
            Cinco escalas mayores, tres octavas, ida y vuelta.
          </Typography>
        </Box>
        <Chip
          label={`${completedCount} de ${taskCount}`}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {PIANO_WEEK_TASK_GROUPS.map((group) => (
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
    </Stack>
  );
}

function PianoWeekConceptsView() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Cómo conectar las cinco escalas
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          No son cinco ejercicios aislados: forman una secuencia del círculo de
          quintas.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Sostenidos acumulados</SectionHeading>
        {PIANO_SCALE_ANSWERS.map((scale) => (
          <Box
            key={scale.id}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "100px 1fr", sm: "140px 1fr" },
              gap: 1,
              py: 0.9,
              borderBottom: "1px solid #dce3e1",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>{scale.label}</Typography>
            <Typography sx={{ color: "#56676a" }}>
              {scale.keySignature}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box>
        <SectionHeading>Cruces de dedos</SectionHeading>
        <Stack spacing={0.75} sx={{ color: "#344b4d" }}>
          <Typography>
            • Mano derecha al subir: el pulgar pasa después del dedo 3.
          </Typography>
          <Typography>
            • Mano izquierda al subir: el dedo 3 pasa sobre el pulgar dentro de
            la octava; al continuar otra octava entra el dedo 4.
          </Typography>
          <Typography>
            • Al bajar se invierte exactamente el recorrido de cada mano.
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ border: "1px solid #d9e2e0", p: 2 }}>
        <Typography sx={{ fontWeight: 900 }}>Práctica recomendada</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Primero una mano lenta y pareja; después la otra. Une ambas solo
          cuando los cruces no provoquen pausas ni acentos involuntarios.
        </Typography>
      </Box>
    </Stack>
  );
}

function PianoWeekAnswersView() {
  const [scaleId, setScaleId] = useState("c");
  const scale =
    PIANO_SCALE_ANSWERS.find((item) => item.id === scaleId) ??
    PIANO_SCALE_ANSWERS[0];

  const fingerings = [
    ["MD · subir", "1–2–3 | 1–2–3–4 | 1–2–3 | 1–2–3–4 | 1–2–3 | 1–2–3–4–5"],
    ["MD · bajar", "5–4–3–2–1 | 3–2–1 | 4–3–2–1 | 3–2–1 | 4–3–2–1 | 3–2–1"],
    ["MI · subir", "5–4–3–2–1 | 3–2–1 | 4–3–2–1 | 3–2–1 | 4–3–2–1 | 3–2–1"],
    ["MI · bajar", "1–2–3 | 1–2–3–4 | 1–2–3 | 1–2–3–4 | 1–2–3 | 1–2–3–4–5"],
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 900 }}>
          Respuestas de las escalas
        </Typography>
        <Typography sx={{ color: "#667678", mt: 0.5 }}>
          Notas, armadura y digitación completa para comprobar la tarea.
        </Typography>
      </Box>

      <FormControl fullWidth size="small">
        <InputLabel id="piano-scale-answer-label">Escala</InputLabel>
        <Select
          labelId="piano-scale-answer-label"
          label="Escala"
          value={scaleId}
          onChange={(event) => setScaleId(event.target.value)}
        >
          {PIANO_SCALE_ANSWERS.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <SectionHeading>{scale.label}</SectionHeading>
        <Typography sx={{ color: "#0f766e", fontWeight: 850 }}>
          {scale.keySignature}
        </Typography>
        <Typography sx={{ color: "#344b4d", mt: 1 }}>
          <strong>Subir:</strong> {scale.ascending}
        </Typography>
        <Typography sx={{ color: "#344b4d", mt: 0.5 }}>
          <strong>Bajar:</strong> {scale.descending}
        </Typography>
        <Typography sx={{ color: "#667678", mt: 1 }}>
          Para tres octavas, repite el mismo orden de notas en cada registro y
          usa los cruces indicados abajo.
        </Typography>
      </Box>

      <Box>
        <SectionHeading>Digitación · tres octavas</SectionHeading>
        <Stack spacing={0} sx={{ borderTop: "1px solid #dce3e1" }}>
          {fingerings.map(([hand, fingering]) => (
            <Box
              key={hand}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "88px 1fr", sm: "120px 1fr" },
                gap: 1,
                py: 1,
                borderBottom: "1px solid #dce3e1",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>{hand}</Typography>
              <Typography
                sx={{ color: "#344b4d", fontWeight: 700, lineHeight: 1.6 }}
              >
                {fingering}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ borderLeft: "3px solid #0f766e", pl: 2, py: 0.5 }}>
        <Typography sx={{ fontWeight: 900 }}>La respuesta clave</Typography>
        <Typography sx={{ color: "#5d6c6e", mt: 0.5 }}>
          Do, Sol, Re, La y Mi usan esta misma digitación. Revisa únicamente
          cuántos sostenidos lleva cada escala y conserva el movimiento al
          cambiar de octava.
        </Typography>
      </Box>
    </Stack>
  );
}

export default function SemesterNotes() {
  const navigate = useNavigate();
  const [weekIndex, setWeekIndex] = useState(WEEKS.length - 1);
  const [subject, setSubject] = useState<SubjectId>(
    () => WEEKS[WEEKS.length - 1].subjects[0],
  );
  const [detailView, setDetailView] = useState<DetailView>("resumen");
  const week = WEEKS[weekIndex];
  const selectedSubject = SUBJECTS.find((item) => item.id === subject)!;
  const hasNotes = week.subjects.includes(subject);

  const changeWeek = (nextIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(WEEKS.length - 1, nextIndex));
    const nextWeek = WEEKS[boundedIndex];
    setWeekIndex(boundedIndex);
    setSubject((current) =>
      nextWeek.subjects.includes(current) ? current : nextWeek.subjects[0],
    );
    setDetailView("resumen");
  };

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
                Segundo año · Solfeo, Armonía, Improvisación y Piano
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
              onClick={() => changeWeek(weekIndex - 1)}
            >
              <ChevronLeft />
            </IconButton>
            <FormControl fullWidth size="small">
              <InputLabel id="semester-week-label">Semana</InputLabel>
              <Select
                labelId="semester-week-label"
                label="Semana"
                value={weekIndex}
                onChange={(event) => {
                  changeWeek(Number(event.target.value));
                }}
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
              onClick={() => changeWeek(weekIndex + 1)}
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
                sx={{
                  minWidth: 0,
                  px: { xs: 0.5, sm: 2 },
                  fontSize: { xs: 12, sm: 14 },
                  textTransform: "none",
                  fontWeight: 850,
                }}
              />
            ))}
          </Tabs>

          <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            {hasNotes ? (
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
                    <ToggleButton value="resumen">En clase</ToggleButton>
                    <ToggleButton value="tareas">Tareas</ToggleButton>
                    <ToggleButton value="conceptos">Conceptos</ToggleButton>
                    {(subject !== "solfeo" || week.id === "2026-09-28") && (
                      <ToggleButton value="respuestas">Respuestas</ToggleButton>
                    )}
                  </ToggleButtonGroup>
                </Stack>

                {week.id === "2026-09-28" && subject === "improvisacion" && (
                  <ImprovisationChordStudy view={detailView} />
                )}
                {week.id === "2026-09-28" && subject === "armonia" && (
                  <HarmonyInversionsWeek view={detailView} />
                )}
                {week.id === "2026-09-28" && subject === "solfeo" && (
                  <SolfegePulseWeek view={detailView} />
                )}
                {week.id === "2026-09-07" &&
                  subject === "solfeo" &&
                  detailView === "resumen" && <SummaryView />}
                {week.id === "2026-09-07" &&
                  subject === "solfeo" &&
                  detailView === "tareas" && <TasksView />}
                {week.id === "2026-09-07" &&
                  subject === "solfeo" &&
                  detailView === "conceptos" && <ConceptsView />}
                {week.id === "2026-09-14" &&
                  subject === "solfeo" &&
                  detailView === "resumen" && <SolfegeWeekTwoSummaryView />}
                {week.id === "2026-09-14" &&
                  subject === "solfeo" &&
                  detailView === "tareas" && <SolfegeWeekTwoTasksView />}
                {week.id === "2026-09-14" &&
                  subject === "solfeo" &&
                  detailView === "conceptos" && <SolfegeWeekTwoConceptsView />}
                {week.id === "2026-09-14" &&
                  subject === "improvisacion" &&
                  detailView === "resumen" && (
                    <ImprovisationWeekTwoSummaryView />
                  )}
                {week.id === "2026-09-14" &&
                  subject === "improvisacion" &&
                  detailView === "tareas" && <ImprovisationWeekTwoTasksView />}
                {week.id === "2026-09-14" &&
                  subject === "improvisacion" &&
                  detailView === "conceptos" && (
                    <ImprovisationWeekTwoConceptsView />
                  )}
                {week.id === "2026-09-14" &&
                  subject === "improvisacion" &&
                  detailView === "respuestas" && (
                    <ImprovisationWeekTwoAnswersView />
                  )}
                {week.id === "2026-09-14" &&
                  subject === "armonia" &&
                  detailView === "resumen" && <HarmonyWeekTwoSummaryView />}
                {week.id === "2026-09-14" &&
                  subject === "armonia" &&
                  detailView === "tareas" && <HarmonyWeekTwoTasksView />}
                {week.id === "2026-09-14" &&
                  subject === "armonia" &&
                  detailView === "conceptos" && <HarmonyWeekTwoConceptsView />}
                {week.id === "2026-09-14" &&
                  subject === "armonia" &&
                  detailView === "respuestas" && <HarmonyWeekTwoAnswersView />}
                {week.id === "2026-09-21" && subject === "armonia" && (
                  <HarmonyTurnaroundWeek view={detailView} />
                )}
                {week.id === "2026-09-21" &&
                  subject === "piano" &&
                  detailView === "resumen" && <PianoWeekSummaryView />}
                {week.id === "2026-09-21" &&
                  subject === "piano" &&
                  detailView === "tareas" && <PianoWeekTasksView />}
                {week.id === "2026-09-21" &&
                  subject === "piano" &&
                  detailView === "conceptos" && <PianoWeekConceptsView />}
                {week.id === "2026-09-21" &&
                  subject === "piano" &&
                  detailView === "respuestas" && <PianoWeekAnswersView />}
                {week.id === "2026-09-07" &&
                  subject === "armonia" &&
                  detailView === "resumen" && <HarmonySummaryView />}
                {week.id === "2026-09-07" &&
                  subject === "armonia" &&
                  detailView === "tareas" && <HarmonyTasksView />}
                {week.id === "2026-09-07" &&
                  subject === "armonia" &&
                  detailView === "conceptos" && <HarmonyConceptsView />}
                {week.id === "2026-09-07" &&
                  subject === "armonia" &&
                  detailView === "respuestas" && <HarmonyAnswersView />}
                {week.id === "2026-09-07" &&
                  subject === "improvisacion" &&
                  detailView === "resumen" && <ImprovisationSummaryView />}
                {week.id === "2026-09-07" &&
                  subject === "improvisacion" &&
                  detailView === "tareas" && <ImprovisationTasksView />}
                {week.id === "2026-09-07" &&
                  subject === "improvisacion" &&
                  detailView === "conceptos" && <ImprovisationConceptsView />}
                {week.id === "2026-09-07" &&
                  subject === "improvisacion" &&
                  detailView === "respuestas" && <ImprovisationAnswersView />}
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
