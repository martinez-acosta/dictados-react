import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
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
      accent: "#1565c0",
      soft: "linear-gradient(135deg, rgba(21,101,192,0.12), rgba(144,202,249,0.18))",
      border: "rgba(21,101,192,0.22)",
    },
    {
      accent: "#2e7d32",
      soft: "linear-gradient(135deg, rgba(46,125,50,0.12), rgba(165,214,167,0.18))",
      border: "rgba(46,125,50,0.22)",
    },
    {
      accent: "#6a1b9a",
      soft: "linear-gradient(135deg, rgba(106,27,154,0.12), rgba(206,147,216,0.18))",
      border: "rgba(106,27,154,0.22)",
    },
    {
      accent: "#ef6c00",
      soft: "linear-gradient(135deg, rgba(239,108,0,0.12), rgba(255,204,128,0.22))",
      border: "rgba(239,108,0,0.22)",
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
        p: 2,
        height: "100%",
        borderColor: accent,
        background: `linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,252,255,0.95))`,
      }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: accent }}>
          {title}
        </Typography>
        {items.map((item) => (
          <Typography key={item} variant="body2">
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
        p: 1,
        position: { md: "sticky" },
        top: { md: 16 },
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, px: 1, py: 0.5 }}>
        Capitulos
      </Typography>
      <Stack spacing={1} sx={{ pt: 0.5 }}>
        {blocks.map((block, blockIndex) => (
          <Box key={block.blockId}>
            <Typography
              variant="caption"
              sx={{
                px: 1,
                pb: 0.5,
                display: "block",
                color: chapterTheme(blockIndex).accent,
                fontWeight: 700,
              }}
            >
              {block.title}
            </Typography>
            <List sx={{ py: 0 }}>
              {block.chapters.map((chapter) => {
                const reviewed = reviewedChapterIds.includes(chapter.chapterId);
                const chapterIndex = chapters.findIndex(
                  (item) => item.chapterId === chapter.chapterId,
                );

                return (
                  <ListItemButton
                    key={chapter.chapterId}
                    selected={chapter.chapterId === activeChapterId}
                    onClick={() => onOpenChapter(chapter.chapterId)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
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
                );
              })}
            </List>
          </Box>
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

  return (
    <Stack spacing={2.5}>
      <Paper
        sx={{
          p: { xs: 2.5, sm: 4 },
          background:
            "linear-gradient(135deg, rgba(11,42,80,0.96), rgba(21,101,192,0.88))",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <Grid container spacing={2.5} alignItems="stretch">
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <MenuBook sx={{ color: "#fff" }} />
                <Typography variant="overline" sx={{ letterSpacing: 1.6 }}>
                  Consulta teorica
                </Typography>
              </Stack>
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, lineHeight: 1.1 }}
              >
                Workbook de teoria musical
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 780, opacity: 0.92 }}>
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
              {lastVisitedChapter ? (
                <Box>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#fff",
                      color: "#0b2a50",
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                    onClick={() => onOpenChapter(lastVisitedChapter.chapterId)}
                  >
                    Continuar lectura
                  </Button>
                </Box>
              ) : null}
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  backdropFilter: "blur(6px)",
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
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  backdropFilter: "blur(6px)",
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
              sx={{ p: { xs: 2, sm: 2.5 }, borderColor: theme.border }}
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
                      sx={{ letterSpacing: 1.2, color: theme.accent }}
                    >
                      Ruta curricular
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
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
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      icon={<School />}
                      label={`${block.chapters.length} capitulos`}
                      variant="outlined"
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
                          }}
                        >
                          <Box sx={{ p: 2.5, background: theme.soft }}>
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
                                sx={{ backgroundColor: "#fff" }}
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
                              sx={{ fontWeight: 800, mt: 1.5, mb: 0.75 }}
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
                                backgroundColor: theme.accent,
                                "&:hover": { backgroundColor: theme.accent },
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
              background: theme.soft,
              border: "1px solid",
              borderColor: theme.border,
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
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
                    />
                    <Chip
                      label={`Capitulo ${chapterIndex + 1}`}
                      size="small"
                      sx={{ backgroundColor: "#fff" }}
                    />
                    <Chip
                      label={chapter.focusBadge}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${chapter.sections.length} secciones`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {chapter.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {chapter.summary}
                  </Typography>
                </Box>
                <Button
                  variant={reviewed ? "contained" : "outlined"}
                  color={reviewed ? "success" : "primary"}
                  onClick={() => onToggleReviewed(chapter.chapterId)}
                >
                  {reviewed ? "Marcado como revisado" : "Marcar como revisado"}
                </Button>
              </Stack>
              <Alert severity="info">Objetivo: {chapter.objective}</Alert>
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

          <Paper variant="outlined" sx={{ p: 2, borderColor: theme.border }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Navegacion interna
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {chapter.sections.map((section) => (
                  <Chip
                    key={section.title}
                    label={section.title}
                    clickable
                    variant="outlined"
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
                      backgroundColor: `${theme.accent}12`,
                      color: theme.accent,
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
              }}
            >
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Glosario del capitulo
                </Typography>
                <Grid container spacing={1.5}>
                  {chapter.glossary.map((item) => (
                    <Grid item xs={12} md={6} key={item.term}>
                      <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
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

          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
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
                onClick={() =>
                  previousChapter && onOpenChapter(previousChapter.chapterId)
                }
              >
                Capitulo anterior
              </Button>
              <Button variant="text" onClick={() => onOpenChapter("")}>
                Volver al indice
              </Button>
              <Button
                variant="contained"
                endIcon={<NavigateNext />}
                disabled={!nextChapter}
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
    <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5 }, py: 3 }}>
      <Stack spacing={2.5} maxWidth="1600px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menu
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2a50" }}>
            Workbook de teoria
          </Typography>
        </Box>

        <Divider />

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
