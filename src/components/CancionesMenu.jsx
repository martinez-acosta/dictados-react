import React from "react";
import { Container, Paper, Typography, Box, Button, Grid } from "@mui/material";
import { MusicNote, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function CancionesMenu() {
  const navigate = useNavigate();

  const canciones = [
    {
      id: "rompe-el-cielo",
      titulo: "Rompe el Cielo",
      artista: "Conquistando Fronteras",
      tonalidad: "E",
      bpm: 143,
      archivo: "/dictados-react/src/RompeElCielo.html",
      color: "#ff6b35",
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
      id: "gloria-shekhina",
      titulo: "Gloria Shekhiná",
      artista: "Modo teatro",
      tonalidad: "D",
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
      id: "hermoso-no-volvere-atras-db",
      titulo: "Hermoso / No volveré atrás",
      artista: "Toma Tu Lugar",
      tonalidad: "Db",
      archivo: "/dictados-react/src/HermosoNoVolvereAtrasDb.html",
      color: "#2f9e44",
    },
    {
      id: "hermoso-no-volvere-atras-c",
      titulo: "Hermoso / No volveré atrás",
      artista: "Toma Tu Lugar",
      tonalidad: "C",
      archivo: "/dictados-react/src/HermosoNoVolvereAtrasC.html",
      color: "#099268",
    },
    {
      id: "toda-lengua-y-toda-nacion-b",
      titulo: "Toda Lengua y Toda Nación",
      artista: "Toma Tu Lugar",
      tonalidad: "B",
      archivo: "/dictados-react/src/TodaLenguaYTodaNacionB.html",
      color: "#6741d9",
    },
    {
      id: "thas-rindo-todo-e",
      titulo: "THAS (Rindo Todo)",
      artista: "Música ICF",
      tonalidad: "E",
      bpm: 125,
      archivo: "/dictados-react/src/ThasRindoTodoE.html",
      color: "#d6336c",
    },
    {
      id: "lo-haras-otra-vez-b",
      titulo: "Lo Harás Otra Vez",
      artista: "Elevation Worship",
      tonalidad: "B",
      archivo: "/dictados-react/src/LoHarasOtraVezB.html",
      color: "#1c7ed6",
    },
    {
      id: "dios-ha-sido-bueno-b",
      titulo: "Dios Ha Sido Bueno",
      artista: "Marcos Witt",
      tonalidad: "B",
      archivo: "/dictados-react/src/DiosHaSidoBuenoB.html",
      color: "#2f9e44",
    },
    {
      id: "alaba-a-dios-e",
      titulo: "Alaba a Dios",
      artista: "Gladys Muñoz",
      tonalidad: "E",
      archivo: "/dictados-react/src/AlabaADiosE.html",
      color: "#f08c00",
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
      id: "hay-libertad-em",
      titulo: "Hay Libertad",
      artista: "Art Aguilera",
      tonalidad: "Em",
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
      id: "agradecido-estoy-eb",
      titulo: "Agradecido Estoy",
      artista: "Elevation Español",
      tonalidad: "Eb",
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
      id: "como-nos-ama-g",
      titulo: "Cómo Nos Ama",
      artista: "Versión en español",
      tonalidad: "G",
      archivo: "/dictados-react/src/ComoNosAmaG.html",
      color: "#e8590c",
    },
    {
      id: "esa-es-la-razon-db",
      titulo: "Esa Es La Razón",
      artista: "Gateway Worship Español",
      tonalidad: "Db",
      bpm: 118,
      archivo: "/dictados-react/src/EsaEsLaRazonDb.html",
      color: "#c2255c",
    },
    {
      id: "grande-eres-dios-g",
      titulo: "Grande Eres Dios",
      artista: "Bethel Music",
      tonalidad: "G",
      archivo: "/dictados-react/src/GrandeEresDiosG.html",
      color: "#1864ab",
    },
    {
      id: "mi-fundamento-d",
      titulo: "Mi Fundamento (Firm Foundation)",
      artista: "The Belonging Co · Más Vida",
      tonalidad: "D",
      archivo: "/dictados-react/src/MiFundamentoD.html",
      color: "#5f3dc4",
    },
    {
      id: "testigo-soy",
      titulo: "Testigo Soy",
      artista: "Passion / Conquistando Fronteras",
      tonalidad: "C",
      archivo: "/dictados-react/src/TestigoSoy.html",
      color: "#12b886",
    },
    {
      id: "la-sangre-de-cristo",
      titulo: "La Sangre de Cristo",
      artista: "Conquistando Fronteras",
      tonalidad: "C",
      archivo: "/dictados-react/src/LaSangreDeCristo.html",
      color: "#c92a2a",
    },
    {
      id: "la-sangre-de-cristo-db",
      titulo: "La Sangre de Cristo",
      artista: "Conquistando Fronteras",
      tonalidad: "Db",
      archivo: "/dictados-react/src/LaSangreDeCristoDb.html",
      color: "#862e9c",
    },
  ];

  const abrirCancion = (archivo) => {
    // Abrir el archivo HTML en una nueva pestaña
    window.open(archivo, "_blank");
  };

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

        <Grid container spacing={3}>
          {canciones.map((cancion) => (
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
                onClick={() => abrirCancion(cancion.archivo)}
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
                    {cancion.tonalidad}
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
                  onClick={() => abrirCancion(cancion.archivo)}
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
      </Paper>
    </Container>
  );
}
