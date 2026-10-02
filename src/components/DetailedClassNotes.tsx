import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { parseStudyNotes } from "../lib/parseStudyNotes.mjs";
import solfeoOne from "../data/semester-lessons/solfeo-2026-09-07.md?raw";
import solfeoTwo from "../data/semester-lessons/solfeo-2026-09-14.md?raw";
import harmonyOne from "../data/semester-lessons/armonia-2026-09-07.md?raw";
import harmonyTwo from "../data/semester-lessons/armonia-2026-09-14.md?raw";
import improvisationOne from "../data/semester-lessons/improvisacion-2026-09-07.md?raw";
import improvisationTwo from "../data/semester-lessons/improvisacion-2026-09-14.md?raw";
import piano from "../data/semester-lessons/piano-2026-09-21.md?raw";
import improvisationChordStudy from "../data/semester-lessons/improvisacion-2026-09-28.md?raw";
import harmonyInversions from "../data/semester-lessons/armonia-2026-09-28.md?raw";
import solfegePulse from "../data/semester-lessons/solfeo-2026-09-28.md?raw";

const LESSONS = {
  "solfeo-2026-09-28": [
    "Unidad de tiempo y de compás, lectura en 4/8 y 2/4",
    solfegePulse,
  ],
  "armonia-2026-09-28": [
    "Inversiones de tríadas y maj7, escritura y cadencias",
    harmonyInversions,
  ],
  "solfeo-2026-09-07": [
    "Interiorizar el pulso, lectura y coordinación",
    solfeoOne,
  ],
  "solfeo-2026-09-14": [
    "Lectura, puntillo, ligaduras, contratiempo y síncopa",
    solfeoTwo,
  ],
  "armonia-2026-09-07": [
    "Escalas, tríadas y construcción de cuatríadas",
    harmonyOne,
  ],
  "armonia-2026-09-14": [
    "Armonización de la escala mayor a cuatro voces",
    harmonyTwo,
  ],
  "improvisacion-2026-09-07": [
    "Intervalos, escritura y función de las notas",
    improvisationOne,
  ],
  "improvisacion-2026-09-14": [
    "Lectura del cifrado y notas para improvisar",
    improvisationTwo,
  ],
  "piano-2026-09-21": ["Piano · martes 22 de septiembre", piano],
  "improvisacion-2026-09-28": [
    "Notas del acorde, enlaces y transposición",
    improvisationChordStudy,
  ],
} as const;

function inline(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**"))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`"))
      return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function NoteBlock({ block }: { block: any }) {
  switch (block.type) {
    case "heading":
      return <h4>{inline(block.text)}</h4>;
    case "quote":
      return <blockquote>{inline(block.text)}</blockquote>;
    case "code":
      return <pre>{block.text}</pre>;
    case "table":
      return (
        <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
          <table>
            <thead>
              <tr>
                {block.header.map((cell: string, i: number) => (
                  <th key={i} scope="col">
                    {inline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row: string[], i: number) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{inline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      );
    case "list": {
      const items = block.items.map((item: string, i: number) => (
        <li key={i}>{inline(item)}</li>
      ));
      return block.ordered ? (
        <ol start={block.start}>{items}</ol>
      ) : (
        <ul>{items}</ul>
      );
    }
    default:
      return <p>{inline(block.text)}</p>;
  }
}

export default function DetailedClassNotes({
  lessonId,
  photos = [],
}: {
  lessonId: keyof typeof LESSONS;
  photos?: ReadonlyArray<{ src: string; label: string }>;
}) {
  const [title, markdown] = LESSONS[lessonId];
  const sections = parseStudyNotes(markdown);
  const [open, setOpen] = useState<number[]>(() => sections.map((_, i) => i));
  const [photoIndex, setPhotoIndex] = useState(0);
  const [topic, setTopic] = useState("");
  const topicId = (index: number) => `class-${lessonId}-${index}`;

  return (
    <Stack spacing={2.5} sx={{ minWidth: 0 }}>
      <Box>
        <Typography
          component="h3"
          sx={{ fontSize: { xs: 21, sm: 26 }, fontWeight: 850 }}
        >
          {title}
        </Typography>
        <Typography sx={{ mt: 1, color: "#59696b", lineHeight: 1.7 }}>
          Apuntes desarrollados: explicaciones, definiciones registradas,
          ejemplos, correcciones y ejercicios de clase.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: "#667678" }}>
          Reconstruidos a partir del material que compartiste; las definiciones
          no son citas literales verificadas del audio. Los ejemplos
          conceptuales se distinguen de las partituras originales. Tareas y
          soluciones siguen en sus apartados.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ sm: "center" }}
      >
        <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
          <InputLabel id={`${lessonId}-topic-label`}>
            Ir a un tema · {sections.length} temas
          </InputLabel>
          <Select
            labelId={`${lessonId}-topic-label`}
            value={topic}
            label={`Ir a un tema · ${sections.length} temas`}
            onChange={(event) => {
              const index = Number(event.target.value);
              setTopic(String(index));
              setOpen((current) =>
                current.includes(index) ? current : [...current, index],
              );
              requestAnimationFrame(() =>
                document
                  .getElementById(topicId(index))
                  ?.scrollIntoView({ behavior: "smooth", block: "start" }),
              );
            }}
          >
            {sections.map((section, index) => (
              <MenuItem
                key={index}
                value={String(index)}
                sx={{ whiteSpace: "normal" }}
              >
                {section.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction="row">
          <Button
            onClick={() => setOpen(sections.map((_, i) => i))}
            sx={{ textTransform: "none" }}
          >
            Mostrar todo
          </Button>
          <Button onClick={() => setOpen([])} sx={{ textTransform: "none" }}>
            Solo títulos
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          "& details": { borderBottom: "1px solid #dce3e1" },
          "& summary": {
            cursor: "pointer",
            py: 2,
            fontSize: { xs: 17, sm: 19 },
            fontWeight: 750,
            color: "#203638",
            scrollMarginTop: 24,
          },
          "& summary:focus-visible": {
            outline: "2px solid #0f766e",
            outlineOffset: 2,
          },
          "& h4": {
            fontSize: 16,
            lineHeight: 1.6,
            margin: "20px 0 8px",
            fontWeight: 750,
          },
          "& p, & li, & blockquote": {
            lineHeight: 1.8,
            fontSize: 16,
            color: "#344b4d",
            whiteSpace: "pre-line",
          },
          "& p": { my: 1.25 },
          "& li": { mb: 0.5 },
          "& ul, & ol": { pl: 3, my: 1.5 },
          "& blockquote": {
            borderLeft: "3px solid #0f766e",
            margin: "16px 0",
            pl: 2,
          },
          "& pre": {
            overflowX: "auto",
            p: 2,
            bgcolor: "#f4f6f5",
            fontSize: 14,
            lineHeight: 1.8,
            borderRadius: 0,
          },
          "& table": {
            borderCollapse: "collapse",
            width: "100%",
            fontSize: 15,
            my: 1.5,
          },
          "& th, & td": {
            borderBottom: "1px solid #dce3e1",
            textAlign: "left",
            p: 1.25,
            lineHeight: 1.6,
            verticalAlign: "top",
            minWidth: 95,
          },
        }}
      >
        {sections.map((section, index) => (
          <details key={index} open={open.includes(index)}>
            <summary
              id={topicId(index)}
              onClick={(event) => {
                event.preventDefault();
                setOpen((current) =>
                  current.includes(index)
                    ? current.filter((i) => i !== index)
                    : [...current, index],
                );
              }}
            >
              {section.title}
            </summary>
            <Box sx={{ pb: 2, maxWidth: 900 }}>
              {section.blocks.map((block, i) => (
                <NoteBlock key={i} block={block} />
              ))}
            </Box>
          </details>
        ))}
      </Box>

      {photos.length > 0 && (
        <Box component="details" sx={{ borderTop: "1px solid #dce3e1", pt: 1 }}>
          <Box
            component="summary"
            sx={{ cursor: "pointer", fontWeight: 750, py: 1 }}
          >
            Fotos del pizarrón · {photos.length}
          </Box>
          <Box component="figure" sx={{ m: 0, mt: 1 }}>
            <Box
              component="img"
              src={photos[photoIndex].src}
              alt={`Pizarrón: ${photos[photoIndex].label}`}
              loading="lazy"
              sx={{
                display: "block",
                width: "100%",
                maxHeight: 560,
                objectFit: "contain",
                bgcolor: "#f4f6f5",
              }}
            />
            <Typography
              component="figcaption"
              variant="body2"
              sx={{ mt: 1, color: "#667678" }}
            >
              {photos[photoIndex].label}
            </Typography>
            {photos.length > 1 && (
              <Stack direction="row" sx={{ flexWrap: "wrap", mt: 1 }}>
                {photos.map((photo, index) => (
                  <Button
                    key={photo.src}
                    variant={photoIndex === index ? "outlined" : "text"}
                    onClick={() => setPhotoIndex(index)}
                    sx={{ textTransform: "none" }}
                  >
                    Foto {index + 1}
                  </Button>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
