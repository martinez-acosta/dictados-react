import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircleOutline,
  MenuBook,
  NavigateBefore,
  NavigateNext,
  RadioButtonUnchecked,
  School,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import {
  WORKBOOK_THEORY_BLOCKS,
  WORKBOOK_THEORY_CHAPTERS,
  type WorkbookBlock,
  type WorkbookChapter,
  type WorkbookSectionBlock,
} from "./workbookTheoryContent";

type WorkbookProgress = {
  reviewedChapterIds: string[];
  lastVisitedChapterId: string | null;
};

const STORAGE_KEY = "dictados-react-theory-workbook-progress";

function defaultProgress(): WorkbookProgress {
  return {
    reviewedChapterIds: [],
    lastVisitedChapterId: null,
  };
}

function chapterTheme(index: number) {
  const themes = [
    {
      accent: "#0f4c81",
      deep: "#082a44",
      soft: "linear-gradient(135deg, rgba(15,76,129,0.16), rgba(132,197,255,0.26))",
      panel:
        "linear-gradient(160deg, rgba(245,251,255,0.98), rgba(232,244,255,0.92))",
      border: "rgba(15,76,129,0.22)",
      glow: "rgba(80, 165, 255, 0.24)",
    },
    {
      accent: "#1e6b52",
      deep: "#12382c",
      soft: "linear-gradient(135deg, rgba(30,107,82,0.16), rgba(153,225,194,0.24))",
      panel:
        "linear-gradient(160deg, rgba(244,252,248,0.98), rgba(230,246,238,0.94))",
      border: "rgba(30,107,82,0.22)",
      glow: "rgba(96, 205, 156, 0.24)",
    },
    {
      accent: "#8a3d19",
      deep: "#49200f",
      soft: "linear-gradient(135deg, rgba(138,61,25,0.14), rgba(255,186,127,0.24))",
      panel:
        "linear-gradient(160deg, rgba(255,249,244,0.98), rgba(250,238,228,0.94))",
      border: "rgba(138,61,25,0.22)",
      glow: "rgba(255, 166, 105, 0.24)",
    },
    {
      accent: "#5b466f",
      deep: "#2d2238",
      soft: "linear-gradient(135deg, rgba(91,70,111,0.16), rgba(198,173,230,0.24))",
      panel:
        "linear-gradient(160deg, rgba(249,246,253,0.98), rgba(239,233,247,0.94))",
      border: "rgba(91,70,111,0.22)",
      glow: "rgba(186, 145, 233, 0.22)",
    },
  ];

  return themes[index % themes.length];
}

function sectionAnchorId(chapterId: string, title: string) {
  return `${chapterId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function resolvePrerequisiteTitles(
  chapters: WorkbookChapter[],
  prerequisiteIds?: string[],
) {
  if (!prerequisiteIds?.length) return [];

  return prerequisiteIds.map(
    (prerequisiteId) =>
      chapters.find((chapter) => chapter.chapterId === prerequisiteId)?.title ||
      prerequisiteId,
  );
}

function blockProgress(
  block: WorkbookBlock,
  reviewedChapterIds: string[],
): number {
  if (!block.chapters.length) return 0;

  const reviewedCount = block.chapters.filter((chapter) =>
    reviewedChapterIds.includes(chapter.chapterId),
  ).length;

  return Math.round((reviewedCount / block.chapters.length) * 100);
}

function QuickPanel({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        height: "100%",
        borderColor: `${accent}40`,
        borderRadius: 3,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.94))",
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: accent,
              boxShadow: `0 0 0 6px ${accent}18`,
            }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color: accent }}
          >
            {title}
          </Typography>
        </Stack>
        <Divider sx={{ borderColor: `${accent}22` }} />
        {items.map((item) => (
          <Typography
            key={item}
            variant="body2"
            sx={{ lineHeight: 1.7, color: "text.primary" }}
          >
            - {item}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}

function renderBlock(block: WorkbookSectionBlock) {
  if (block.type === "paragraph") {
    return (
      <Typography
        key={block.text}
        variant="body1"
        color="text.primary"
        sx={{ lineHeight: 1.8 }}
      >
        {block.text}
      </Typography>
    );
  }

  if (block.type === "list") {
    return (
      <Stack
        key={`${block.title || "list"}-${block.items[0] || "empty"}`}
        spacing={1}
      >
        {block.title ? (
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {block.title}
          </Typography>
        ) : null}
        <Stack spacing={0.75}>
          {block.items.map((item) => (
            <Typography
              key={item}
              variant="body1"
              sx={{ pl: 1.5, position: "relative", lineHeight: 1.75 }}
            >
              <Box
                component="span"
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                -
              </Box>
              {item}
            </Typography>
          ))}
        </Stack>
      </Stack>
    );
  }

  if (block.type === "example") {
    return (
      <Paper
        key={`${block.title}-${block.lines[0] || "example"}`}
        variant="outlined"
        sx={{
          p: 2,
          background:
            "linear-gradient(135deg, rgba(21,101,192,0.08), rgba(255,255,255,0.96))",
          borderColor: "rgba(21, 101, 192, 0.2)",
          borderLeft: "4px solid #1565c0",
        }}
      >
        <Stack spacing={0.75}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {block.title}
          </Typography>
          {block.lines.map((line) => (
            <Typography
              key={line}
              variant="body2"
              sx={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
            >
              {line}
            </Typography>
          ))}
        </Stack>
      </Paper>
    );
  }

  if (block.type === "chips") {
    return (
      <Stack
        key={`${block.title || "chips"}-${block.items[0] || "empty"}`}
        spacing={1}
      >
        {block.title ? (
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {block.title}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {block.items.map((item) => (
            <Chip
              key={item}
              label={item}
              variant="outlined"
              sx={{ backgroundColor: "rgba(255,255,255,0.7)" }}
            />
          ))}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      key={`${block.title || "table"}-${block.columns.join("-")}`}
      spacing={1}
    >
      {block.title ? (
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {block.title}
        </Typography>
      ) : null}
      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            minWidth: 520,
            borderCollapse: "collapse",
            "& th, & td": {
              border: "1px solid",
              borderColor: "divider",
              p: 1.25,
              textAlign: "left",
              verticalAlign: "top",
            },
            "& th": {
              background:
                "linear-gradient(180deg, rgba(21,101,192,0.08), rgba(255,255,255,0.92))",
              fontWeight: 700,
            },
          }}
        >
          <Box component="thead">
            <Box component="tr">
              {block.columns.map((column) => (
                <Box component="th" key={column}>
                  {column}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {block.rows.map((row) => (
              <Box component="tr" key={row.join("|")}>
                {row.map((cell) => (
                  <Box component="td" key={cell}>
                    {cell}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}

function ChapterSidebar({
  blocks,
  chapters,
  activeChapterId,
  reviewedChapterIds,
  onOpenChapter,
}: {
  blocks: WorkbookBlock[];
  chapters: WorkbookChapter[];
  activeChapterId: string;
  reviewedChapterIds: string[];
  onOpenChapter: (chapterId: string) => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        position: { md: "sticky" },
        top: { md: 16 },
        borderRadius: 4,
        borderColor: "rgba(18, 34, 61, 0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,247,252,0.94))",
        boxShadow: "0 24px 60px rgba(17, 24, 39, 0.08)",
      }}
    >
      <Stack spacing={1.5} sx={{ px: 0.75, pb: 0.75 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 800, px: 0.5, pt: 0.5 }}
        >
          Mapa del workbook
        </Typography>
        <Typography variant="caption" sx={{ px: 0.5, color: "text.secondary" }}>
          Navega por bloques y sigue tu avance con una vista editorial del plan
          completo.
        </Typography>
      </Stack>
      <Stack spacing={1} sx={{ pt: 0.5 }}>
        {blocks.map((block, blockIndex) => (
          <Paper
            key={block.blockId}
            variant="outlined"
            sx={{
              p: 1,
              borderRadius: 3,
              borderColor: `${chapterTheme(blockIndex).accent}22`,
              background: chapterTheme(blockIndex).panel,
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ px: 0.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: chapterTheme(blockIndex).accent,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                  }}
                >
                  {block.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {blockProgress(block, reviewedChapterIds)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={blockProgress(block, reviewedChapterIds)}
                sx={{
                  height: 7,
                  borderRadius: 999,
                  bgcolor: "rgba(15, 23, 42, 0.06)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${chapterTheme(blockIndex).accent}, ${chapterTheme(blockIndex).deep})`,
                  },
                }}
              />
            </Stack>
            <Typography
              variant="caption"
              sx={{
                px: 0.5,
                pt: 1,
                pb: 0.5,
                display: "block",
                color: "text.secondary",
              }}
            >
              {block.chapters.length} capitulos
            </Typography>
            <List sx={{ py: 0 }}>
              {block.chapters.map((chapter) => {
                const reviewed = reviewedChapterIds.includes(chapter.chapterId);
                const chapterIndex = chapters.findIndex(
                  (item) => item.chapterId === chapter.chapterId,
                );
                const isActiveChapter = chapter.chapterId === activeChapterId;

                return (
                  <Box key={chapter.chapterId} sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isActiveChapter}
                      onClick={() => onOpenChapter(chapter.chapterId)}
                      sx={{
                        borderRadius: 2.5,
                        border: "1px solid transparent",
                        alignItems: "flex-start",
                        "&.Mui-selected": {
                          backgroundColor: `${chapterTheme(blockIndex).accent}14`,
                          borderColor: `${chapterTheme(blockIndex).accent}30`,
                        },
                        "&:hover": {
                          backgroundColor: `${chapterTheme(blockIndex).accent}0d`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          mt: 1,
                          mr: 1.25,
                          flexShrink: 0,
                          backgroundColor: reviewed
                            ? "success.main"
                            : isActiveChapter
                              ? chapterTheme(blockIndex).accent
                              : "rgba(15, 23, 42, 0.14)",
                          boxShadow: isActiveChapter
                            ? `0 0 0 6px ${chapterTheme(blockIndex).accent}14`
                            : "none",
                        }}
                      />
                      <ListItemText
                        primary={`${chapterIndex + 1}. ${chapter.title}`}
                        secondary={reviewed ? "Revisado" : "Pendiente"}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 600,
                        }}
                        secondaryTypographyProps={{
                          variant: "caption",
                          color: reviewed ? "success.main" : "text.secondary",
                        }}
                      />
                    </ListItemButton>

                    {isActiveChapter ? (
                      <Stack spacing={0.4} sx={{ pl: 4.5, pr: 0.5, pt: 0.75 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: chapterTheme(blockIndex).accent,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                          }}
                        >
                          Subcapitulos
                        </Typography>
                        {chapter.sections.map((section, sectionIndex) => (
                          <Button
                            key={section.title}
                            variant="text"
                            onClick={() => {
                              const sectionElement = document.getElementById(
                                sectionAnchorId(chapter.chapterId, section.title),
                              );
                              if (sectionElement) {
                                sectionElement.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                            }}
                            sx={{
                              justifyContent: "flex-start",
                              px: 1,
                              py: 0.6,
                              minHeight: 0,
                              textTransform: "none",
                              borderRadius: 2,
                              color: "text.secondary",
                              fontSize: "0.78rem",
                              lineHeight: 1.35,
                              backgroundColor: "rgba(255,255,255,0.52)",
                              border: "1px solid rgba(15, 23, 42, 0.05)",
                              "&:hover": {
                                backgroundColor: `${chapterTheme(blockIndex).accent}10`,
                                color: chapterTheme(blockIndex).accent,
                              },
                            }}
                          >
                            {sectionIndex + 1}. {section.title}
                          </Button>
                        ))}
                      </Stack>
                    ) : null}
                  </Box>
                );
              })}
            </List>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

function WorkbookIndex({
  blocks,
  chapters,
  reviewedChapterIds,
  lastVisitedChapterId,
  onOpenChapter,
}: {
  blocks: WorkbookBlock[];
  chapters: WorkbookChapter[];
  reviewedChapterIds: string[];
  lastVisitedChapterId: string | null;
  onOpenChapter: (chapterId: string) => void;
}) {
  const reviewedCount = reviewedChapterIds.length;
  const lastVisitedChapter =
    chapters.find((chapter) => chapter.chapterId === lastVisitedChapterId) ||
    null;
  const completion = Math.round((reviewedCount / chapters.length) * 100);

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, sm: 4 },
          background:
            "linear-gradient(135deg, rgba(7,24,48,0.98), rgba(15,76,129,0.92) 48%, rgba(23,120,178,0.88))",
          color: "#fff",
          overflow: "hidden",
          position: "relative",
          borderRadius: 5,
          boxShadow: "0 28px 80px rgba(8, 33, 62, 0.34)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(148, 205, 255, 0.16)",
            top: -140,
            right: -80,
            filter: "blur(8px)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255, 209, 138, 0.12)",
            bottom: -120,
            left: -60,
            filter: "blur(6px)",
          },
        }}
      >
        <Grid
          container
          spacing={2.5}
          alignItems="stretch"
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  <MenuBook sx={{ color: "#fff" }} />
                </Box>
                <Typography variant="overline" sx={{ letterSpacing: 2.2 }}>
                  Consulta teorica
                </Typography>
              </Stack>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  lineHeight: 1.02,
                  maxWidth: 760,
                  fontSize: { xs: "2.3rem", md: "3.4rem" },
                }}
              >
                Workbook de teoria musical
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 760,
                  opacity: 0.92,
                  fontSize: { md: "1.04rem" },
                }}
              >
                Un manual de estudio para revisar conceptos, formulas, patrones
                y errores tipicos antes o despues de practicar en los
                entrenadores.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`${blocks.length} bloques`}
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.28)" }}
                  variant="outlined"
                />
                <Chip
                  label={`${chapters.length} capitulos`}
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.28)" }}
                  variant="outlined"
                />
                <Chip
                  label={`Revisados: ${reviewedCount}/${chapters.length}`}
                  sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.28)" }}
                  variant="outlined"
                />
                {lastVisitedChapter ? (
                  <Chip
                    label={`Ultimo visto: ${lastVisitedChapter.title}`}
                    sx={{
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.28)",
                    }}
                    variant="outlined"
                  />
                ) : null}
              </Stack>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.08))",
                  color: "#fff",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Stack spacing={1}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={0.75}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Progreso global
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.86 }}>
                      {reviewedCount} de {chapters.length} capitulos revisados
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={completion}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: "rgba(255,255,255,0.16)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        background:
                          "linear-gradient(90deg, #b8ecff 0%, #fff0bd 100%)",
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    Lectura progresiva por bloques con continuidad entre teoria,
                    armonia, forma y repertorios avanzados.
                  </Typography>
                </Stack>
              </Paper>
              {lastVisitedChapter ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: "#fff",
                      color: "#0b2a50",
                      px: 2.25,
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                    onClick={() => onOpenChapter(lastVisitedChapter.chapterId)}
                  >
                    Continuar lectura
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                    onClick={() => onOpenChapter(chapters[0]?.chapterId || "")}
                  >
                    Empezar ruta
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  backdropFilter: "blur(14px)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 0.75 }}
                >
                  Que vas a encontrar
                </Typography>
                <Typography variant="body2">
                  Teoria explicada por tema, tablas rapidas, formulas, errores
                  comunes y checklist para saber si ya dominas lo esencial.
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  backdropFilter: "blur(14px)",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 0.75 }}
                >
                  Como usarlo
                </Typography>
                <Typography variant="body2">
                  Lee un capitulo, marca ideas clave, compara con tus ejercicios
                  y usa el checklist final para detectar huecos antes del
                  examen.
                </Typography>
              </Paper>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
                  color: "#fff",
                  backdropFilter: "blur(14px)",
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Ritmo de avance
                  </Typography>
                  {blocks.slice(0, 3).map((block) => (
                    <Box key={block.blockId}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 0.5 }}
                      >
                        <Typography variant="caption">{block.title}</Typography>
                        <Typography variant="caption">
                          {blockProgress(block, reviewedChapterIds)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={blockProgress(block, reviewedChapterIds)}
                        sx={{
                          height: 6,
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,0.16)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.9)",
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Stack spacing={2.5}>
        {blocks.map((block, blockIndex) => {
          const theme = chapterTheme(blockIndex);
          const reviewedInBlock = block.chapters.filter((chapter) =>
            reviewedChapterIds.includes(chapter.chapterId),
          ).length;

          return (
            <Paper
              key={block.blockId}
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderColor: theme.border,
                borderRadius: 5,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,254,0.92))",
                boxShadow: `0 26px 60px ${theme.glow}`,
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box sx={{ maxWidth: 840 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        letterSpacing: 1.8,
                        color: theme.accent,
                        fontWeight: 800,
                      }}
                    >
                      Ruta curricular
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 900, lineHeight: 1.06 }}
                    >
                      {block.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {block.summary}
                    </Typography>
                  </Box>
                  <Stack spacing={1} sx={{ minWidth: { md: 220 } }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        icon={<School />}
                        label={`${block.chapters.length} capitulos`}
                        variant="outlined"
                        sx={{ borderColor: `${theme.accent}30` }}
                      />
                      <Chip
                        label={`Revisados ${reviewedInBlock}/${block.chapters.length}`}
                        color={
                          reviewedInBlock === block.chapters.length
                            ? "success"
                            : "default"
                        }
                        variant={
                          reviewedInBlock === block.chapters.length
                            ? "filled"
                            : "outlined"
                        }
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={blockProgress(block, reviewedChapterIds)}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: "rgba(15, 23, 42, 0.06)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${theme.accent}, ${theme.deep})`,
                        },
                      }}
                    />
                  </Stack>
                </Stack>
                <Grid container spacing={2}>
                  {block.chapters.map((chapter) => {
                    const reviewed = reviewedChapterIds.includes(
                      chapter.chapterId,
                    );
                    const index = chapters.findIndex(
                      (item) => item.chapterId === chapter.chapterId,
                    );
                    const prerequisiteTitles = resolvePrerequisiteTitles(
                      chapters,
                      chapter.prerequisites,
                    );

                    return (
                      <Grid item xs={12} md={6} xl={4} key={chapter.chapterId}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 0,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            borderColor: theme.border,
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.9)",
                            transition:
                              "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 20px 45px rgba(15, 23, 42, 0.1)",
                              borderColor: `${theme.accent}55`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 2.5,
                              background: theme.soft,
                              borderBottom: `1px solid ${theme.border}`,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              flexWrap="wrap"
                              useFlexGap
                            >
                              <Chip
                                label={`Capitulo ${index + 1}`}
                                size="small"
                                sx={{
                                  backgroundColor: "#fff",
                                  fontWeight: 700,
                                }}
                              />
                              <Chip
                                label={chapter.focusBadge}
                                size="small"
                                variant="outlined"
                                sx={{
                                  backgroundColor: "rgba(255,255,255,0.65)",
                                }}
                              />
                              <Chip
                                label={reviewed ? "Revisado" : "Pendiente"}
                                size="small"
                                color={reviewed ? "success" : "default"}
                                variant={reviewed ? "filled" : "outlined"}
                              />
                            </Stack>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 900,
                                mt: 1.5,
                                mb: 0.75,
                                lineHeight: 1.15,
                              }}
                            >
                              {chapter.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {chapter.summary}
                            </Typography>
                          </Box>
                          <Stack spacing={1.25} sx={{ p: 2.5, flexGrow: 1 }}>
                            <Typography variant="body2">
                              Objetivo: {chapter.objective}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              <Chip
                                label={`${chapter.sections.length} secciones`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={`${chapter.checklistItems.length} puntos de cierre`}
                                size="small"
                                variant="outlined"
                              />
                              {chapter.microExercises?.length ? (
                                <Chip
                                  label={`${chapter.microExercises.length} mini practicas`}
                                  size="small"
                                  variant="outlined"
                                />
                              ) : null}
                            </Stack>
                            {prerequisiteTitles.length ? (
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Antes de entrar
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  {prerequisiteTitles.join(", ")}
                                </Typography>
                              </Box>
                            ) : null}
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Para memorizar
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {chapter.memoryHooks[0]}
                              </Typography>
                            </Box>
                          </Stack>
                          <Box sx={{ px: 2.5, pb: 2.5, mt: "auto" }}>
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.deep})`,
                                borderRadius: 999,
                                boxShadow: "none",
                                "&:hover": { boxShadow: "none", opacity: 0.96 },
                              }}
                              onClick={() => onOpenChapter(chapter.chapterId)}
                            >
                              Abrir capitulo
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}

function WorkbookChapterView({
  blocks,
  chapter,
  chapters,
  reviewedChapterIds,
  onOpenChapter,
  onToggleReviewed,
}: {
  blocks: WorkbookBlock[];
  chapter: WorkbookChapter;
  chapters: WorkbookChapter[];
  reviewedChapterIds: string[];
  onOpenChapter: (chapterId: string) => void;
  onToggleReviewed: (chapterId: string) => void;
}) {
  const chapterIndex = chapters.findIndex(
    (item) => item.chapterId === chapter.chapterId,
  );
  const prerequisiteTitles = resolvePrerequisiteTitles(
    chapters,
    chapter.prerequisites,
  );
  const activeBlock =
    blocks.find((block) =>
      block.chapters.some((item) => item.chapterId === chapter.chapterId),
    ) || null;
  const activeBlockIndex = activeBlock
    ? blocks.findIndex((block) => block.blockId === activeBlock.blockId)
    : chapterIndex;
  const theme = chapterTheme(activeBlockIndex);
  const activeBlockCompletion = activeBlock
    ? blockProgress(activeBlock, reviewedChapterIds)
    : 0;
  const chapterPositionInBlock = activeBlock
    ? activeBlock.chapters.findIndex(
        (item) => item.chapterId === chapter.chapterId,
      ) + 1
    : null;
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;
  const reviewed = reviewedChapterIds.includes(chapter.chapterId);

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={3}>
        <ChapterSidebar
          blocks={blocks}
          chapters={chapters}
          activeChapterId={chapter.chapterId}
          reviewedChapterIds={reviewedChapterIds}
          onOpenChapter={onOpenChapter}
        />
      </Grid>
      <Grid item xs={12} md={9}>
        <Stack spacing={2.5}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              background: `linear-gradient(135deg, ${theme.deep} 0%, ${theme.accent} 58%, rgba(255,255,255,0.94) 180%)`,
              border: "1px solid",
              borderColor: theme.border,
              borderRadius: 5,
              color: "#fff",
              boxShadow: `0 28px 70px ${theme.glow}`,
              overflow: "hidden",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                width: 260,
                height: 260,
                borderRadius: "50%",
                right: -80,
                top: -110,
                background: "rgba(255,255,255,0.12)",
              },
            }}
          >
            <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 1 }}
                  >
                    <Chip
                      label={activeBlock?.title || chapter.unit}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.34)",
                        backgroundColor: "rgba(255,255,255,0.08)",
                      }}
                    />
                    <Chip
                      label={`Capitulo ${chapterIndex + 1}`}
                      size="small"
                      sx={{
                        backgroundColor: "#fff",
                        color: theme.deep,
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label={chapter.focusBadge}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.34)",
                        backgroundColor: "rgba(255,255,255,0.08)",
                      }}
                    />
                    <Chip
                      label={`${chapter.sections.length} secciones`}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.34)",
                        backgroundColor: "rgba(255,255,255,0.08)",
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.04,
                      maxWidth: 800,
                      fontSize: { xs: "2rem", md: "3rem" },
                    }}
                  >
                    {chapter.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "rgba(255,255,255,0.86)" }}
                  >
                    {chapter.summary}
                  </Typography>
                </Box>
                <Button
                  variant={reviewed ? "contained" : "outlined"}
                  color={reviewed ? "success" : "inherit"}
                  onClick={() => onToggleReviewed(chapter.chapterId)}
                  sx={
                    reviewed
                      ? { alignSelf: { xs: "stretch", sm: "auto" } }
                      : {
                          alignSelf: { xs: "stretch", sm: "auto" },
                          color: "#fff",
                          borderColor: "rgba(255,255,255,0.34)",
                        }
                  }
                >
                  {reviewed ? "Marcado como revisado" : "Marcar como revisado"}
                </Button>
              </Stack>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={7}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Typography variant="overline" sx={{ letterSpacing: 1.6 }}>
                      Objetivo
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {chapter.objective}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 4,
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="overline"
                          sx={{ letterSpacing: 1.4 }}
                        >
                          Progreso del bloque
                        </Typography>
                        <Typography variant="body2">
                          {chapterPositionInBlock}/
                          {activeBlock?.chapters.length || 0}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={activeBlockCompletion}
                        sx={{
                          height: 9,
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,0.18)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            background:
                              "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,234,190,0.95))",
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {activeBlock?.title || chapter.unit}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <QuickPanel
                title="Dentro de este bloque"
                items={
                  activeBlock
                    ? [activeBlock.summary]
                    : [
                        "Capitulo integrado dentro del recorrido general del workbook.",
                      ]
                }
                accent={theme.accent}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <QuickPanel
                title="Antes de estudiar este capitulo"
                items={
                  prerequisiteTitles.length
                    ? prerequisiteTitles
                    : ["No tiene prerrequisitos formales dentro del workbook."]
                }
                accent={theme.accent}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <QuickPanel
                title="Como estudiarlo"
                items={chapter.studyFlow}
                accent={theme.accent}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <QuickPanel
                title="Para memorizar"
                items={chapter.memoryHooks}
                accent={theme.accent}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <QuickPanel
                title="Lo que mas pueden preguntarte"
                items={
                  chapter.examFocus?.length
                    ? chapter.examFocus
                    : ["Usalo como repaso teorico general."]
                }
                accent={theme.accent}
              />
            </Grid>
          </Grid>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderColor: theme.border,
              borderRadius: 4,
              background: theme.panel,
            }}
          >
            <Stack spacing={1}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: theme.accent }}
              >
                Navegacion interna
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {chapter.sections.map((section) => (
                  <Chip
                    key={section.title}
                    label={section.title}
                    clickable
                    variant="outlined"
                    sx={{
                      borderRadius: 999,
                      borderColor: `${theme.accent}26`,
                      backgroundColor: "rgba(255,255,255,0.66)",
                    }}
                    onClick={() => {
                      const sectionElement = document.getElementById(
                        sectionAnchorId(chapter.chapterId, section.title),
                      );
                      if (sectionElement) {
                        sectionElement.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Paper>

          {chapter.sections.map((section, index) => (
            <Paper
              key={section.title}
              id={sectionAnchorId(chapter.chapterId, section.title)}
              sx={{
                p: { xs: 2, sm: 3 },
                borderLeft: `5px solid ${theme.accent}`,
                scrollMarginTop: 96,
                borderRadius: 4,
                background:
                  index % 2 === 0
                    ? "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.94))"
                    : "linear-gradient(180deg, rgba(250,252,255,0.98), rgba(255,255,255,0.94))",
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Chip
                    label={`Seccion ${index + 1}`}
                    size="small"
                    sx={{
                      backgroundColor: `${theme.accent}14`,
                      color: theme.accent,
                      fontWeight: 700,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {section.title}
                  </Typography>
                </Stack>
                {section.blocks.map((block) => renderBlock(block))}
              </Stack>
            </Paper>
          ))}

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: "100%",
                  borderTop: `4px solid ${theme.accent}`,
                  borderRadius: 4,
                  background: theme.panel,
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Errores comunes
                  </Typography>
                  {chapter.commonMistakes.map((item) => (
                    <Typography key={item} variant="body1">
                      - {item}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: "100%",
                  borderTop: `4px solid ${theme.accent}`,
                  borderRadius: 4,
                  background: theme.panel,
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Resumen
                  </Typography>
                  {chapter.reviewSummary.map((item) => (
                    <Typography key={item} variant="body1">
                      - {item}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: "100%",
                  borderTop: `4px solid ${theme.accent}`,
                  borderRadius: 4,
                  background: theme.panel,
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Checklist de estudio
                  </Typography>
                  {chapter.checklistItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      {reviewed ? (
                        <CheckCircleOutline color="success" sx={{ mt: 0.1 }} />
                      ) : (
                        <RadioButtonUnchecked
                          color="disabled"
                          sx={{ mt: 0.1 }}
                        />
                      )}
                      <Typography variant="body1">{item.text}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {chapter.microExercises?.length ? (
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderLeft: `5px solid ${theme.accent}`,
                borderRadius: 4,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,250,255,0.94))",
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mini practica
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Intenta responder primero sin ver la solucion y luego compara
                  tu proceso.
                </Typography>
                <Grid container spacing={1.5}>
                  {chapter.microExercises.map((exercise, index) => (
                    <Grid item xs={12} key={`${exercise.prompt}-${index}`}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,249,255,0.96))",
                        }}
                      >
                        <Stack spacing={1}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            Ejercicio {index + 1}
                          </Typography>
                          <Typography variant="body1">
                            {exercise.prompt}
                          </Typography>
                          <Divider />
                          <Typography variant="body2" color="text.secondary">
                            Respuesta guia
                          </Typography>
                          <Typography variant="body1">
                            {exercise.answer}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          ) : null}

          {chapter.glossary?.length ? (
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderLeft: `5px solid ${theme.accent}`,
                borderRadius: 4,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,250,255,0.94))",
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Glosario del capitulo
                </Typography>
                <Grid container spacing={1.5}>
                  {chapter.glossary.map((item) => (
                    <Grid item xs={12} md={6} key={item.term}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: "100%",
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.84)",
                        }}
                      >
                        <Stack spacing={0.75}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            {item.term}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.definition}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Paper>
          ) : null}

          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              background: theme.panel,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                disabled={!previousChapter}
                sx={{ borderRadius: 999 }}
                onClick={() =>
                  previousChapter && onOpenChapter(previousChapter.chapterId)
                }
              >
                Capitulo anterior
              </Button>
              <Button
                variant="text"
                sx={{ borderRadius: 999 }}
                onClick={() => onOpenChapter("")}
              >
                Volver al indice
              </Button>
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                disabled={!nextChapter}
                sx={{
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${theme.accent}, ${theme.deep})`,
                  boxShadow: "none",
                }}
                onClick={() =>
                  nextChapter && onOpenChapter(nextChapter.chapterId)
                }
              >
                Siguiente capitulo
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default function WorkbookTheory() {
  const navigate = useNavigate();
  const { chapterId } = useParams();
  const [progress, setProgress] = useState<WorkbookProgress>(defaultProgress);
  const blocks = WORKBOOK_THEORY_BLOCKS;
  const chapters = WORKBOOK_THEORY_CHAPTERS;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setProgress({
        reviewedChapterIds: Array.isArray(saved.reviewedChapterIds)
          ? saved.reviewedChapterIds
          : [],
        lastVisitedChapterId:
          typeof saved.lastVisitedChapterId === "string"
            ? saved.lastVisitedChapterId
            : null,
      });
    } catch (error) {
      console.error("No se pudo cargar el progreso del workbook", error);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const activeChapter = useMemo(
    () =>
      chapterId
        ? chapters.find((chapter) => chapter.chapterId === chapterId) || null
        : null,
    [chapterId, chapters],
  );

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [chapterId]);

  useEffect(() => {
    if (!activeChapter) return;
    setProgress((prev) => ({
      ...prev,
      lastVisitedChapterId: activeChapter.chapterId,
    }));
  }, [activeChapter]);

  function openChapter(nextChapterId: string) {
    if (!nextChapterId) {
      navigate("/workbook-teoria");
      return;
    }
    navigate(`/workbook-teoria/${nextChapterId}`);
  }

  function toggleReviewed(chapterIdToToggle: string) {
    setProgress((prev) => {
      const alreadyReviewed =
        prev.reviewedChapterIds.includes(chapterIdToToggle);
      return {
        ...prev,
        reviewedChapterIds: alreadyReviewed
          ? prev.reviewedChapterIds.filter((id) => id !== chapterIdToToggle)
          : [...prev.reviewedChapterIds, chapterIdToToggle],
      };
    });
  }

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 1.5, sm: 2.5 },
        py: 3,
        minHeight: "100%",
        background:
          "radial-gradient(circle at top left, rgba(181, 220, 255, 0.22), transparent 30%), radial-gradient(circle at 85% 20%, rgba(255, 225, 177, 0.18), transparent 24%), linear-gradient(180deg, #f6f9fc 0%, #edf3f8 100%)",
      }}
    >
      <Stack spacing={2.5} maxWidth="1600px" mx="auto">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            sx={{ borderRadius: 999, backgroundColor: "rgba(255,255,255,0.7)" }}
            onClick={() => navigate("/")}
          >
            Volver al menu
          </Button>
          <Stack spacing={0.2} sx={{ ml: { sm: "auto" }, textAlign: "right" }}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 1.6, color: "text.secondary" }}
            >
              Biblioteca de estudio
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0b2a50" }}>
              Workbook de teoria
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)" }} />

        {chapterId && !activeChapter ? (
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <Alert severity="warning">
                El capitulo solicitado no existe o ya no esta disponible.
              </Alert>
              <Box>
                <Button variant="contained" onClick={() => openChapter("")}>
                  Volver al indice
                </Button>
              </Box>
            </Stack>
          </Paper>
        ) : activeChapter ? (
          <WorkbookChapterView
            blocks={blocks}
            chapter={activeChapter}
            chapters={chapters}
            reviewedChapterIds={progress.reviewedChapterIds}
            onOpenChapter={openChapter}
            onToggleReviewed={toggleReviewed}
          />
        ) : (
          <WorkbookIndex
            blocks={blocks}
            chapters={chapters}
            reviewedChapterIds={progress.reviewedChapterIds}
            lastVisitedChapterId={progress.lastVisitedChapterId}
            onOpenChapter={openChapter}
          />
        )}
      </Stack>
    </Box>
  );
}
