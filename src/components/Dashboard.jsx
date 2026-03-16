import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Stack,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  MusicNote,
  GraphicEq,
  Home,
  Piano,
  RecordVoiceOver,
  LibraryMusic,
  AccessTime,
  MenuBook,
  GraphicEqOutlined,
  QueueMusic,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const CARD_BASE_SX = {
  p: { xs: 2, sm: 3 },
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.25s ease",
  border: "1px solid rgba(11, 42, 80, 0.06)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: 6,
  },
};

const EXERCISE_SECTIONS = [
  {
    id: "bajo",
    title: "Bajo",
    subtitle: "Técnica, lectura y recursos específicos para bajo eléctrico.",
    accent: "#00897b",
    icon: MusicNote,
    items: [
      {
        route: "/bajo-suite",
        title: "Suite Bajo (Escala + Arpegios)",
        description:
          "Cuatro pentagramas en clave de Fa: escala mayor, menor y arpegios encadenados con afinador integrado.",
        buttonLabel: "Abrir Suite",
        buttonColor: "secondary",
        icon: MusicNote,
        iconColor: "#f06292",
      },
      {
        route: "/bajo-circulo-quintas",
        title: "Círculo de Quintas (Bajo)",
        description:
          "Practica el ciclo de quintas ascendente o descendente con raíces, BPM y guía de digitación para bajo.",
        buttonLabel: "Abrir Círculo",
        buttonSx: {
          backgroundColor: "#00897b",
          "&:hover": { backgroundColor: "#00695c" },
        },
        icon: MusicNote,
        iconColor: "#00897b",
      },
      {
        route: "/bajo",
        title: "Entrenador de Bajo",
        description: "Practica escalas y notas con pentagrama interactivo",
        buttonLabel: "Comenzar Bajo",
        buttonColor: "success",
        icon: Piano,
        iconColor: "success.main",
      },
      {
        route: "/arpegios-bajo",
        title: "Arpegios de Bajo",
        description:
          "Consulta las notas 1-3-5-7 y patrones sugeridos para acordes m7, 7 y maj7.",
        buttonLabel: "Abrir Arpegios",
        buttonColor: "success",
        icon: QueueMusic,
        iconColor: "#4caf50",
      },
    ],
  },
  {
    id: "solfeo-auditivo",
    title: "Solfeo y Entrenamiento Auditivo",
    subtitle:
      "Dictados, intervalos, tríadas y práctica vocal/visual para afinar oído y lectura.",
    accent: "#3f51b5",
    icon: MenuBook,
    items: [
      {
        route: "/dictados",
        title: "Dictados Melódicos",
        description:
          "Practica el reconocimiento auditivo de melodías en diferentes claves",
        buttonLabel: "Comenzar Dictados",
        buttonColor: "primary",
        icon: MusicNote,
        iconColor: "primary.main",
      },
      {
        route: "/dictados-gran-pentagrama",
        title: "Dictados en Gran Pentagrama",
        description:
          "Trabaja por bloques Sol → Fa → Sol en un gran pentagrama con dictado y respuesta sobre ambos pentagramas.",
        buttonLabel: "Abrir Gran Pentagrama",
        buttonColor: "primary",
        icon: MenuBook,
        iconColor: "#1d4ed8",
      },
      {
        route: "/dictados-intervalos",
        title: "Dictados de Intervalos",
        description:
          "Identifica de oído el intervalo que suena, en Arpegio o Acorde.",
        buttonLabel: "Comenzar Dictados",
        buttonColor: "secondary",
        icon: GraphicEq,
        iconColor: "secondary.main",
      },
      {
        route: "/intervalos",
        title: "Ejercicios de Intervalos",
        description:
          "Mejora tu oído musical identificando intervalos musicales",
        buttonLabel: "Comenzar Intervalos",
        buttonColor: "secondary",
        icon: GraphicEq,
        iconColor: "secondary.main",
      },
      {
        route: "/intervalos-trainer",
        title: "Entrenador de Intervalos",
        description:
          "Practica todos los intervalos con tabla de referencia y notación musical",
        buttonLabel: "Comenzar Entrenador",
        buttonColor: "secondary",
        icon: GraphicEq,
        iconColor: "secondary.main",
      },
      {
        route: "/triadas",
        title: "Entrenador de Tríadas",
        description:
          "Practica tríadas (mayor, menor, disminuida, aumentada) y sus inversiones",
        buttonLabel: "Comenzar Tríadas",
        buttonColor: "error",
        icon: LibraryMusic,
        iconColor: "error.main",
      },
      {
        route: "/vocal",
        title: "Entrenador Vocal",
        description:
          "Practica escalas vocales en clave de Sol con afinador integrado",
        buttonLabel: "Comenzar Vocal",
        buttonColor: "warning",
        icon: RecordVoiceOver,
        iconColor: "warning.main",
      },
      {
        route: "/intervalos-piano",
        title: "Intervalos Piano",
        description:
          "Escalas en clave de sol con pentagrama y piano interactivo",
        buttonLabel: "Comenzar Intervalos Piano",
        buttonColor: "info",
        icon: Piano,
        iconColor: "info.main",
      },
      {
        route: "/lectura-musical",
        title: "Lectura Musical",
        description:
          "Practica la lectura de notas estilo Dandelot con ejercicios progresivos en claves de Sol y Fa.",
        buttonLabel: "Comenzar Lectura",
        buttonSx: {
          backgroundColor: "#4caf50",
          "&:hover": { backgroundColor: "#388e3c" },
        },
        icon: MenuBook,
        iconColor: "#4caf50",
      },
      {
        route: "/escalas-relativas",
        title: "Escalas Relativas (6º grado)",
        description:
          "Estudia la relación mayor-menor relativa (6º grado), con explicación y mini quiz para examen.",
        buttonLabel: "Estudiar Escalas",
        buttonSx: {
          backgroundColor: "#1565c0",
          "&:hover": { backgroundColor: "#0d47a1" },
        },
        icon: LibraryMusic,
        iconColor: "#1565c0",
      },
      {
        route: "/inversiones-acordes",
        title: "Inversiones de Acordes",
        description:
          "Estudia tríadas y cuatríadas con inversiones, flashcards, práctica escrita y quiz.",
        buttonLabel: "Estudiar Inversiones",
        buttonSx: {
          backgroundColor: "#00838f",
          "&:hover": { backgroundColor: "#006064" },
        },
        icon: LibraryMusic,
        iconColor: "#00838f",
      },
      {
        route: "/armonizacion-mayor",
        title: "Armonización Mayor",
        description:
          "Aprende a construir a mano los 7 acordes diatónicos de una escala mayor con pistas opcionales.",
        buttonLabel: "Abrir Armonización",
        buttonSx: {
          backgroundColor: "#2e7d32",
          "&:hover": { backgroundColor: "#1b5e20" },
        },
        icon: LibraryMusic,
        iconColor: "#2e7d32",
      },
      {
        route: "/campo-armonico-septimas",
        title: "Campo Armónico con Séptimas",
        description:
          "Resuelve a mano el campo armónico de escalas major y natural minor con acordes de 7a.",
        buttonLabel: "Abrir Campo Armónico",
        buttonSx: {
          backgroundColor: "#6a1b9a",
          "&:hover": { backgroundColor: "#4a148c" },
        },
        icon: LibraryMusic,
        iconColor: "#6a1b9a",
      },
      {
        route: "/workbook-teoria",
        title: "Workbook de Teoria",
        description:
          "Manual de consulta por capitulos con teoria, ejemplos, errores comunes y checklist de estudio.",
        buttonLabel: "Abrir Workbook",
        buttonSx: {
          backgroundColor: "#455a64",
          "&:hover": { backgroundColor: "#263238" },
        },
        icon: MenuBook,
        iconColor: "#455a64",
      },
    ],
  },
  {
    id: "ritmica",
    title: "Rítmica",
    subtitle:
      "Pulso, figuras, compases, métrica y trabajo combinado con alturas.",
    accent: "#ef6c00",
    icon: AccessTime,
    items: [
      {
        route: "/ritmica",
        title: "Rítmica",
        description:
          "Aprende figuras, silencios, batimientos y compases musicales",
        buttonLabel: "Comenzar Rítmica",
        buttonSx: {
          backgroundColor: "purple",
          "&:hover": { backgroundColor: "#7b1fa2" },
        },
        icon: AccessTime,
        iconColor: "purple",
      },
      {
        route: "/ritmica-alturas",
        title: "Rítmica con Alturas",
        description:
          "Dictados rítmicos combinados con identificación de alturas de notas",
        buttonLabel: "Comenzar Rítmica con Alturas",
        buttonSx: {
          backgroundColor: "#9c27b0",
          "&:hover": { backgroundColor: "#7b1fa2" },
        },
        icon: AccessTime,
        iconColor: "#9c27b0",
      },
      {
        route: "/ritmica-metrica",
        title: "Rítmica y Métrica",
        description:
          "Ejercicios progresivos estilo solfeo clásico con modo pregunta e infinito.",
        buttonLabel: "Abrir Rítmica y Métrica",
        buttonSx: {
          backgroundColor: "#ef6c00",
          "&:hover": { backgroundColor: "#e65100" },
        },
        icon: AccessTime,
        iconColor: "#ef6c00",
      },
    ],
  },
  {
    id: "utilidades",
    title: "Utilidades y Repertorio",
    subtitle:
      "Herramientas rápidas para afinar y material de apoyo para práctica.",
    accent: "#ff6b35",
    icon: GraphicEqOutlined,
    items: [
      {
        route: "/afinador",
        title: "Afinador Cromático",
        description:
          "Afina tu instrumento con detección de pitch en tiempo real y historial de notas",
        buttonLabel: "Abrir Afinador",
        buttonSx: {
          backgroundColor: "#9c27b0",
          "&:hover": { backgroundColor: "#7b1fa2" },
        },
        icon: GraphicEqOutlined,
        iconColor: "#9c27b0",
      },
      {
        route: "/canciones",
        title: "Canciones",
        description: "Letras y acordes de canciones para práctica y adoración",
        buttonLabel: "Ver Canciones",
        buttonSx: {
          backgroundColor: "#ff6b35",
          "&:hover": { backgroundColor: "#ff5722" },
        },
        icon: QueueMusic,
        iconColor: "#ff6b35",
      },
    ],
  },
];

function ExerciseCard({ item, navigate }) {
  const Icon = item.icon;

  return (
    <Paper sx={CARD_BASE_SX} onClick={() => navigate(item.route)}>
      <Icon sx={{ fontSize: 64, color: item.iconColor, mb: 2 }} />
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 1.5,
          fontSize: { xs: "1.05rem", sm: "1.25rem", md: "1.35rem" },
          lineHeight: 1.15,
        }}
      >
        {item.title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          mb: 2.5,
          flexGrow: 1,
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        {item.description}
      </Typography>
      <Button
        variant="contained"
        color={item.buttonColor}
        fullWidth
        onClick={(event) => {
          event.stopPropagation();
          navigate(item.route);
        }}
        sx={{ py: 1.5, ...(item.buttonSx || {}) }}
      >
        {item.buttonLabel}
      </Button>
    </Paper>
  );
}

function SectionPanel({ section, navigate, isCollapsed, onToggle }) {
  const SectionIcon = section.icon;

  return (
    <Paper
      id={section.id}
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        scrollMarginTop: "16px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,251,255,0.98) 100%)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${section.accent}14`,
              color: section.accent,
            }}
          >
            <SectionIcon />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#0b2a50",
                fontSize: { xs: "1.05rem", sm: "1.3rem" },
              }}
            >
              {section.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              {section.subtitle}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={`${section.items.length} ejercicios`}
            sx={{
              fontWeight: 600,
              border: `1px solid ${section.accent}33`,
              backgroundColor: `${section.accent}10`,
              color: section.accent,
            }}
          />
          <IconButton
            onClick={onToggle}
            aria-label={
              isCollapsed
                ? `Expandir ${section.title}`
                : `Colapsar ${section.title}`
            }
            size="small"
            sx={{
              border: `1px solid ${section.accent}33`,
              color: section.accent,
              backgroundColor: "white",
            }}
          >
            {isCollapsed ? (
              <ExpandMore fontSize="small" />
            ) : (
              <ExpandLess fontSize="small" />
            )}
          </IconButton>
        </Stack>
      </Stack>

      <Collapse in={!isCollapsed}>
        <Grid container spacing={2.5}>
          {section.items.map((item) => (
            <Grid item xs={12} sm={6} xl={4} key={item.route}>
              <ExerciseCard item={item} navigate={navigate} />
            </Grid>
          ))}
        </Grid>
      </Collapse>
      {isCollapsed && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Sección colapsada. Usa el botón para mostrar sus tarjetas.
        </Typography>
      )}
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [collapsedSections, setCollapsedSections] = React.useState(() =>
    EXERCISE_SECTIONS.reduce((acc, section) => {
      acc[section.id] = false;
      return acc;
    }, {}),
  );
  const totalExercises = EXERCISE_SECTIONS.reduce(
    (acc, section) => acc + section.items.length,
    0,
  );
  const collapsedCount = EXERCISE_SECTIONS.reduce(
    (acc, section) => acc + (collapsedSections[section.id] ? 1 : 0),
    0,
  );
  const allCollapsed = collapsedCount === EXERCISE_SECTIONS.length;

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const expandSection = (sectionId) => {
    setCollapsedSections((prev) =>
      prev[sectionId]
        ? {
            ...prev,
            [sectionId]: false,
          }
        : prev,
    );
  };

  const toggleAllSections = () => {
    const nextCollapsed = !allCollapsed;
    setCollapsedSections(
      EXERCISE_SECTIONS.reduce((acc, section) => {
        acc[section.id] = nextCollapsed;
        return acc;
      }, {}),
    );
  };

  return (
    <Container
      maxWidth={false}
      sx={{ mt: 3, mb: 4, px: { xs: 1.5, sm: 2, md: 3 } }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 4,
          background:
            "radial-gradient(circle at top right, rgba(64,126,255,0.08), transparent 45%), #fff",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Home sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#0b2a50",
              mb: 1.5,
              fontSize: { xs: "1.35rem", sm: "2rem", md: "2.6rem" },
              lineHeight: 1.1,
            }}
          >
            🎼 Centro de Ejercicios Musicales
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: 820,
              mx: "auto",
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
            }}
          >
            Menú reorganizado por secciones para navegar más rápido entre bajo,
            solfeo/auditivo, rítmica y utilidades.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="center"
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ mb: 1.5, flexWrap: "wrap" }}
        >
          <Chip label={`${totalExercises} ejercicios`} color="primary" />
          <Chip
            label={
              collapsedCount
                ? `${collapsedCount} secciones colapsadas`
                : "Todas las secciones expandidas"
            }
            variant="outlined"
          />
          <Button
            size="small"
            variant="outlined"
            onClick={toggleAllSections}
            sx={{ textTransform: "none" }}
          >
            {allCollapsed ? "Expandir todo" : "Colapsar todo"}
          </Button>
        </Stack>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 1,
            mb: 2,
            px: 0.25,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(11,42,80,0.18)",
              borderRadius: 999,
            },
          }}
        >
          {EXERCISE_SECTIONS.map((section) => (
            <Chip
              key={`summary-${section.id}`}
              label={`${section.title} · ${section.items.length}`}
              variant="outlined"
              sx={{
                borderColor: `${section.accent}55`,
                color: section.accent,
                flexShrink: 0,
                backgroundColor: "white",
              }}
            />
          ))}
        </Box>

        <Paper
          variant="outlined"
          sx={{
            display: { xs: "block", lg: "none" },
            p: 2,
            mb: 2.5,
            borderRadius: 3,
            backgroundColor: "#fbfcff",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "#0b2a50", mb: 1 }}
          >
            Navegación rápida
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              "&::-webkit-scrollbar": { height: 6 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(11,42,80,0.16)",
                borderRadius: 999,
              },
            }}
          >
            {EXERCISE_SECTIONS.map((section) => (
              <Chip
                key={`mobile-nav-${section.id}`}
                component="a"
                clickable
                href={`#${section.id}`}
                onClick={() => expandSection(section.id)}
                label={section.title}
                sx={{
                  border: `1px solid ${section.accent}44`,
                  color: section.accent,
                  backgroundColor: `${section.accent}0a`,
                  textDecoration: "none",
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 280px" },
            alignItems: "start",
          }}
        >
          <Stack spacing={2.5}>
            {EXERCISE_SECTIONS.map((section) => (
              <SectionPanel
                key={section.id}
                section={section}
                navigate={navigate}
                isCollapsed={collapsedSections[section.id]}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </Stack>

          <Box sx={{ display: { xs: "none", lg: "block" } }}>
            <Paper
              variant="outlined"
              sx={{
                position: "sticky",
                top: 24,
                borderRadius: 3,
                overflow: "hidden",
                borderColor: "rgba(11, 42, 80, 0.12)",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(135deg, #0b2a50 0%, #407eff 100%)",
                  color: "white",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, opacity: 0.9 }}
                >
                  Índice del menú
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Estilo panel lateral para navegar por secciones
                </Typography>
              </Box>

              <Stack spacing={1} sx={{ p: 1.5, backgroundColor: "#fbfcff" }}>
                {EXERCISE_SECTIONS.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <Button
                      key={`desktop-nav-${section.id}`}
                      component="a"
                      href={`#${section.id}`}
                      variant="text"
                      onClick={() => expandSection(section.id)}
                      sx={{
                        justifyContent: "space-between",
                        textTransform: "none",
                        color: "#0b2a50",
                        px: 1.25,
                        py: 1,
                        borderRadius: 2,
                        border: `1px solid ${section.accent}22`,
                        backgroundColor: "white",
                        "&:hover": {
                          backgroundColor: `${section.accent}10`,
                          borderColor: `${section.accent}55`,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1.5,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: `${section.accent}14`,
                            color: section.accent,
                          }}
                        >
                          <SectionIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                      </Stack>
                      <Chip
                        label={section.items.length}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          bgcolor: `${section.accent}14`,
                          color: section.accent,
                        }}
                      />
                    </Button>
                  );
                })}
              </Stack>

              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid #eef1f7",
                  backgroundColor: "white",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block" }}
                >
                  Consejo: empieza por una sección y deja abiertas las demás
                  para sesiones temáticas.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
