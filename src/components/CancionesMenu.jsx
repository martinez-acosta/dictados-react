import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import { MusicNote, ArrowBack, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const normalizarTexto = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");

export default function CancionesMenu() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  const canciones = [
    {
      id: "rompe-el-cielo",
      titulo: "Rompe el Cielo",
      artista: "Conquistando Fronteras",
      tonalidad: "D",
      bpm: 143,
      archivo: "/dictados-react/src/RompeElCielo.html",
      color: "#ff6b35",
    },
    {
      id: "salmo-27-d",
      titulo: "Salmo 27",
      artista: "Música ICF / Conquistando Fronteras",
      tonalidad: "D",
      bpm: 138,
      archivo: "/dictados-react/src/Salmo27D.html",
      color: "#1864ab",
    },
    {
      id: "mi-socorro-esta-en-ti-d",
      titulo: "Mi Socorro Está en Ti",
      artista: "Conquistando Fronteras",
      tonalidad: "D",
      bpm: 82,
      archivo: "/dictados-react/src/MiSocorroEstaEnTiD.html",
      color: "#2b8a3e",
    },
    {
      id: "voy-cantando-d",
      titulo: "Voy Cantando",
      artista: "Conquistando Fronteras",
      tonalidad: "D",
      archivo: "/dictados-react/src/VoyCantandoD.html",
      color: "#f59f00",
    },
    {
      id: "sopla",
      titulo: "Sopla",
      artista: "Conquistando Fronteras",
      tonalidad: "E",
      bpm: 95,
      archivo: "/dictados-react/src/Sopla.html",
      color: "#4ecdc4",
    },
    {
      id: "revelacion-a",
      titulo: "Revelación (Revelation Song)",
      artista: "Danilo Montero y Kari Jobe",
      tonalidad: "A",
      archivo: "/dictados-react/src/RevelacionA.html",
      color: "#7950f2",
    },
    {
      id: "gloria-shekhina-b",
      titulo: "Gloria Shekhiná",
      artista: "Conquistando Fronteras",
      tonalidad: "B",
      archivo: "/dictados-react/src/GloriaShekhina.html",
      color: "#5c7cfa",
    },
    {
      id: "gloria-y-majestad-e",
      titulo: "Gloria y Majestad",
      artista: "Conquistando Fronteras",
      tonalidad: "E",
      archivo: "/dictados-react/src/GloriaYMajestadE.html",
      color: "#7048e8",
    },
    {
      id: "muestranos-tu-rostro-d",
      titulo: "Muéstranos Tu Rostro",
      artista: "Conquistando Fronteras",
      tonalidad: "D",
      archivo: "/dictados-react/src/MuestranosTuRostroD.html",
      color: "#1971c2",
    },
    {
      id: "hermoso-no-volvere-atras-d",
      titulo: "Hermoso / No volveré atrás (Most Beautiful / Never Going Back)",
      artista: "Toma Tu Lugar feat. Damaris Calviño y Lucas Conslie",
      tonalidad: "D",
      archivo: "/dictados-react/src/HermosoNoVolvereAtrasDb.html",
      color: "#2f9e44",
    },
    {
      id: "toda-lengua-y-toda-nacion-a",
      titulo: "Toda Lengua y Toda Nación",
      artista: "Toma Tu Lugar, Marcos Brunet y Jan Earle",
      tonalidad: "A",
      archivo: "/dictados-react/src/TodaLenguaYTodaNacionB.html",
      color: "#6741d9",
    },
    {
      id: "thas-rindo-todo-e",
      titulo: "THAS (Rindo Todo)",
      artista: "Música ICF / Conquistando Fronteras",
      tonalidad: "E",
      bpm: 125,
      archivo: "/dictados-react/src/ThasRindoTodoE.html",
      color: "#d6336c",
    },
    {
      id: "lo-haras-otra-vez-bb",
      titulo: "Lo Harás Otra Vez (Do It Again)",
      artista: "Elevation Worship",
      tonalidad: "Bb",
      archivo: "/dictados-react/src/LoHarasOtraVezB.html",
      color: "#1c7ed6",
    },
    {
      id: "dios-ha-sido-bueno-f",
      titulo: "Dios Ha Sido Bueno",
      artista: "Marcos Witt",
      tonalidad: "F → G",
      tonoOriginal: "F",
      archivo: "/dictados-react/src/DiosHaSidoBuenoB.html",
      color: "#2f9e44",
    },
    {
      id: "dame-de-beber-d",
      titulo: "Dame de Beber",
      artista: "Marco Barrientos",
      tonalidad: "D",
      archivo: "/dictados-react/src/DameDeBeberD.html",
      color: "#087f8c",
    },
    {
      id: "tu-fidelidad-d",
      titulo: "Tu Fidelidad",
      artista: "Marcos Witt",
      tonalidad: "D → Eb → E → F → G",
      tonoOriginal: "D",
      archivo: "/dictados-react/src/TuFidelidadD.html",
      color: "#1971c2",
    },
    {
      id: "visitanos-avivanos",
      titulo: "Visítanos / Avívanos",
      artista: "Maranatha · Un Nuevo Amanecer",
      tonalidad: "Por confirmar",
      archivo: "/dictados-react/src/VisitanosAvivanosB.html",
      color: "#0b7285",
    },
    {
      id: "alaba-a-dios-d",
      titulo: "Alaba a Dios",
      artista: "Danny Berrios",
      tonalidad: "D",
      archivo: "/dictados-react/src/AlabaADiosD.html",
      color: "#f08c00",
    },
    {
      id: "dios-el-mas-grande-bb",
      titulo: "Dios el Más Grande",
      artista: "Juan Carlos Alvarado",
      tonalidad: "Bb",
      archivo: "/dictados-react/src/DiosElMasGrandeBb.html",
      color: "#fcc419",
    },
    {
      id: "danzare-e",
      titulo: "Danzaré",
      artista: "Conquistando Fronteras",
      tonalidad: "E",
      archivo: "/dictados-react/src/DanzareE.html",
      color: "#e67700",
    },
    {
      id: "hay-libertad-dm",
      titulo: "Hay Libertad",
      artista: "Art Aguilera",
      tonalidad: "Dm",
      archivo: "/dictados-react/src/HayLibertadEm.html",
      color: "#0b7285",
    },
    {
      id: "fiel-f",
      titulo: "Fiel",
      artista: "Majo y Dan",
      tonalidad: "F",
      bpm: 145,
      archivo: "/dictados-react/src/FielF.html",
      color: "#d9480f",
    },
    {
      id: "agradecido-estoy-e",
      titulo: "Agradecido Estoy",
      artista: "Elevation Español",
      tonalidad: "E",
      bpm: 72,
      archivo: "/dictados-react/src/AgradecidoEstoyEb.html",
      color: "#7b2cbf",
    },
    {
      id: "tus-cuerdas-de-amor-f",
      titulo: "Tus Cuerdas de Amor",
      artista: "Julio Melgar feat. Lowsan Melgar",
      tonalidad: "F",
      archivo: "/dictados-react/src/TusCuerdasDeAmorF.html",
      color: "#2b8a3e",
    },
    {
      id: "como-nos-ama-c",
      titulo: "Cómo Nos Ama (How He Loves)",
      artista: "Conquistando Fronteras",
      tonalidad: "C",
      archivo: "/dictados-react/src/ComoNosAmaG.html",
      color: "#e8590c",
    },
    {
      id: "esa-es-la-razon-db",
      titulo: "Esa Es La Razón (Ask Me Why)",
      artista: "Gateway Worship Español",
      tonalidad: "Db",
      bpm: 118,
      archivo: "/dictados-react/src/EsaEsLaRazonDb.html",
      color: "#c2255c",
    },
    {
      id: "grande-eres-dios-a",
      titulo: "Grande Eres Dios (Great Are You Lord)",
      artista: "All Sons & Daughters · adaptación en español",
      tonalidad: "A",
      archivo: "/dictados-react/src/GrandeEresDiosG.html",
      color: "#1864ab",
    },
    {
      id: "mi-fundamento-bb",
      titulo: "Mi Fundamento (Firm Foundation / He Won't)",
      artista: "The Belonging Co / Cody Carnes · traducción Más Vida",
      tonalidad: "Bb",
      archivo: "/dictados-react/src/MiFundamentoD.html",
      color: "#5f3dc4",
    },
    {
      id: "testigo-soy-db",
      titulo: "Testigo Soy (I've Witnessed It)",
      artista: "Passion · versión Conquistando Fronteras",
      tonalidad: "Db",
      archivo: "/dictados-react/src/TestigoSoy.html",
      color: "#12b886",
    },
    {
      id: "la-sangre-de-cristo",
      titulo: "La Sangre de Cristo",
      artista: "Versión por confirmar",
      tonalidad: "Por confirmar",
      archivo: "/dictados-react/src/LaSangreDeCristo.html",
      color: "#c92a2a",
    },
  ];

  const abrirCancion = (cancion) => {
    const tonoOriginal =
      cancion.tonoOriginal ||
      (/^[A-G](?:#|b)?m?$/.test(cancion.tonalidad) ? cancion.tonalidad : null);
    const destino = tonoOriginal
      ? `${cancion.archivo}?original=${encodeURIComponent(tonoOriginal)}`
      : cancion.archivo;

    window.open(destino, "_blank");
  };

  const terminoNormalizado = normalizarTexto(busqueda.trim());
  const cancionesFiltradas = canciones.filter((cancion) => {
    if (!terminoNormalizado) return true;

    return normalizarTexto(`${cancion.titulo} ${cancion.artista}`).includes(
      terminoNormalizado,
    );
  });

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <MusicNote sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: "#0b2a50", mb: 1 }}
            >
              🎵 Canciones
            </Typography>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              Letras y acordes para práctica
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="Buscar por canción o artista"
          placeholder="Ej. Revelación o Conquistando Fronteras"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />

        {busqueda.trim() ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {cancionesFiltradas.length === 1
              ? "1 canción encontrada"
              : `${cancionesFiltradas.length} canciones encontradas`}
          </Typography>
        ) : null}

        <Grid container spacing={3}>
          {cancionesFiltradas.map((cancion) => (
            <Grid item xs={12} sm={6} key={cancion.id}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  borderLeft: `4px solid ${cancion.color}`,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
                onClick={() => abrirCancion(cancion)}
              >
                <MusicNote sx={{ fontSize: 48, color: cancion.color, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {cancion.titulo}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 2 }}
                >
                  {cancion.artista}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: "rgba(0,0,0,0.05)",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 600,
                    }}
                  >
                    Tono original: {cancion.tonalidad}
                  </Typography>
                  {cancion.bpm ? (
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: "rgba(0,0,0,0.05)",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      {cancion.bpm} BPM
                    </Typography>
                  ) : null}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={(event) => {
                    event.stopPropagation();
                    abrirCancion(cancion);
                  }}
                  sx={{
                    py: 1.5,
                    backgroundColor: cancion.color,
                    "&:hover": {
                      backgroundColor: cancion.color,
                      filter: "brightness(0.9)",
                    },
                  }}
                >
                  Ver Letra y Acordes
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {cancionesFiltradas.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <MusicNote sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
            <Typography variant="h6">No encontramos canciones</Typography>
            <Typography variant="body2" color="text.secondary">
              Prueba con otro nombre o artista.
            </Typography>
          </Box>
        ) : null}
      </Paper>
    </Container>
  );
}
