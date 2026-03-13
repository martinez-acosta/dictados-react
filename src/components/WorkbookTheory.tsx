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
  WORKBOOK_THEORY_CHAPTERS,
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

function renderBlock(block: WorkbookSectionBlock) {
  if (block.type === "paragraph") {
    return (
      <Typography key={block.text} variant="body1" color="text.primary">
        {block.text}
      </Typography>
    );
  }

  if (block.type === "list") {
    return (
      <Stack key={`${block.title || "list"}-${block.items[0] || "empty"}`} spacing={1}>
        {block.title ? (
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {block.title}
          </Typography>
        ) : null}
        <List dense sx={{ py: 0 }}>
          {block.items.map((item) => (
            <ListItemText
              key={item}
              primary={`- ${item}`}
              primaryTypographyProps={{ variant: "body1", color: "text.primary" }}
              sx={{ my: 0.25 }}
            />
          ))}
        </List>
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
          backgroundColor: "#f7fbff",
          borderColor: "rgba(21, 101, 192, 0.2)",
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
            <Chip key={item} label={item} variant="outlined" />
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
              backgroundColor: "#fafcff",
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
  chapters,
  activeChapterId,
  reviewedChapterIds,
  onOpenChapter,
}: {
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
      <List sx={{ py: 0 }}>
        {chapters.map((chapter, index) => {
          const reviewed = reviewedChapterIds.includes(chapter.chapterId);
          return (
            <ListItemButton
              key={chapter.chapterId}
              selected={chapter.chapterId === activeChapterId}
              onClick={() => onOpenChapter(chapter.chapterId)}
              sx={{ borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText
                primary={`${index + 1}. ${chapter.title}`}
                secondary={reviewed ? "Revisado" : "Pendiente"}
                primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                secondaryTypographyProps={{
                  variant: "caption",
                  color: reviewed ? "success.main" : "text.secondary",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

function WorkbookIndex({
  chapters,
  reviewedChapterIds,
  lastVisitedChapterId,
  onOpenChapter,
}: {
  chapters: WorkbookChapter[];
  reviewedChapterIds: string[];
  lastVisitedChapterId: string | null;
  onOpenChapter: (chapterId: string) => void;
}) {
  const reviewedCount = reviewedChapterIds.length;
  const lastVisitedChapter =
    chapters.find((chapter) => chapter.chapterId === lastVisitedChapterId) || null;

  return (
    <Stack spacing={2.5}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <School color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Workbook de teoria
            </Typography>
          </Box>
          <Typography variant="body1">
            Este workbook funciona como cuaderno de consulta. Reune explicacion
            teorica detallada, ejemplos concretos, errores comunes y checklist
            final por tema.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${chapters.length} capitulos`} variant="outlined" />
            <Chip
              label={`Revisados: ${reviewedCount}/${chapters.length}`}
              color={reviewedCount === chapters.length ? "success" : "default"}
              variant="outlined"
            />
            {lastVisitedChapter ? (
              <Chip
                label={`Ultimo visto: ${lastVisitedChapter.title}`}
                color="primary"
                variant="outlined"
              />
            ) : null}
          </Stack>
          {lastVisitedChapter ? (
            <Box>
              <Button
                variant="contained"
                onClick={() => onOpenChapter(lastVisitedChapter.chapterId)}
              >
                Continuar lectura
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {chapters.map((chapter, index) => {
          const reviewed = reviewedChapterIds.includes(chapter.chapterId);
          return (
            <Grid item xs={12} md={6} xl={4} key={chapter.chapterId}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip label={`Capitulo ${index + 1}`} size="small" />
                  <Chip
                    label={reviewed ? "Revisado" : "Pendiente"}
                    size="small"
                    color={reviewed ? "success" : "default"}
                    variant={reviewed ? "filled" : "outlined"}
                  />
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {chapter.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {chapter.summary}
                </Typography>
                <Typography variant="body2">
                  Objetivo: {chapter.objective}
                </Typography>
                <Box sx={{ mt: "auto" }}>
                  <Button
                    variant="outlined"
                    fullWidth
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
  );
}

function WorkbookChapterView({
  chapter,
  chapters,
  reviewedChapterIds,
  onOpenChapter,
  onToggleReviewed,
}: {
  chapter: WorkbookChapter;
  chapters: WorkbookChapter[];
  reviewedChapterIds: string[];
  onOpenChapter: (chapterId: string) => void;
  onToggleReviewed: (chapterId: string) => void;
}) {
  const chapterIndex = chapters.findIndex(
    (item) => item.chapterId === chapter.chapterId,
  );
  const previousChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;
  const reviewed = reviewedChapterIds.includes(chapter.chapterId);

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={3}>
        <ChapterSidebar
          chapters={chapters}
          activeChapterId={chapter.chapterId}
          reviewedChapterIds={reviewedChapterIds}
          onOpenChapter={onOpenChapter}
        />
      </Grid>
      <Grid item xs={12} md={9}>
        <Stack spacing={2.5}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <Box>
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

          {chapter.sections.map((section) => (
            <Paper key={section.title} sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {section.title}
                </Typography>
                {section.blocks.map((block) => renderBlock(block))}
              </Stack>
            </Paper>
          ))}

          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
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

          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
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

          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
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
                    <RadioButtonUnchecked color="disabled" sx={{ mt: 0.1 }} />
                  )}
                  <Typography variant="body1">{item.text}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>

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
                onClick={() => nextChapter && onOpenChapter(nextChapter.chapterId)}
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
        ? WORKBOOK_THEORY_CHAPTERS.find((chapter) => chapter.chapterId === chapterId) ||
          null
        : null,
    [chapterId],
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
      const alreadyReviewed = prev.reviewedChapterIds.includes(chapterIdToToggle);
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
            chapter={activeChapter}
            chapters={WORKBOOK_THEORY_CHAPTERS}
            reviewedChapterIds={progress.reviewedChapterIds}
            onOpenChapter={openChapter}
            onToggleReviewed={toggleReviewed}
          />
        ) : (
          <WorkbookIndex
            chapters={WORKBOOK_THEORY_CHAPTERS}
            reviewedChapterIds={progress.reviewedChapterIds}
            lastVisitedChapterId={progress.lastVisitedChapterId}
            onOpenChapter={openChapter}
          />
        )}
      </Stack>
    </Box>
  );
}
