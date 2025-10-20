import React from 'react'
import { Container, Paper, Typography, Box, Button, Grid } from '@mui/material'
import { MusicNote, ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function CancionesMenu() {
  const navigate = useNavigate()

  const canciones = [
    {
      id: 'rompe-el-cielo',
      titulo: 'Rompe el Cielo',
      artista: 'Conquistando Fronteras',
      tonalidad: 'E',
      bpm: 143,
      archivo: '/dictados-react/src/RompeElCielo.html',
      color: '#ff6b35'
    },
    {
      id: 'sopla',
      titulo: 'Sopla',
      artista: 'Conquistando Fronteras',
      tonalidad: 'E',
      bpm: 95,
      archivo: '/dictados-react/src/Sopla.html',
      color: '#4ecdc4'
    }
  ]

  const abrirCancion = (archivo) => {
    // Abrir el archivo HTML en una nueva pestaña
    window.open(archivo, '_blank')
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Volver al menú
          </Button>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <MusicNote sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#0b2a50', mb: 1 }}>
              🎵 Canciones
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
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
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${cancion.color}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => abrirCancion(cancion.archivo)}
              >
                <MusicNote sx={{ fontSize: 48, color: cancion.color, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {cancion.titulo}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  {cancion.artista}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.05)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 600
                    }}
                  >
                    {cancion.tonalidad}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.05)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 600
                    }}
                  >
                    {cancion.bpm} BPM
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => abrirCancion(cancion.archivo)}
                  sx={{
                    py: 1.5,
                    backgroundColor: cancion.color,
                    '&:hover': {
                      backgroundColor: cancion.color,
                      filter: 'brightness(0.9)'
                    }
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
  )
}
