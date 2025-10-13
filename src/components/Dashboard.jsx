import React from 'react'
import { Container, Paper, Typography, Box, Button, Grid } from '@mui/material'
import { MusicNote, GraphicEq, Home, Piano, RecordVoiceOver, LibraryMusic, AccessTime, MenuBook } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Home sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#0b2a50', mb: 2 }}>
            🎼 Centro de Ejercicios Musicales
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Selecciona el tipo de ejercicio que deseas practicar
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/dictados')}
            >
              <MusicNote sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Dictados Melódicos
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Practica el reconocimiento auditivo de melodías en diferentes claves
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/dictados')}
                sx={{ py: 1.5 }}
              >
                Comenzar Dictados
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/intervalos')}
            >
              <GraphicEq sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Ejercicios de Intervalos
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Mejora tu oído musical identificando intervalos musicales
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => navigate('/intervalos')}
                sx={{ py: 1.5 }}
              >
                Comenzar Intervalos
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/bajo')}
            >
              <Piano sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Entrenador de Bajo
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Practica escalas y notas con pentagrama interactivo
              </Typography>
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => navigate('/bajo')}
                sx={{ py: 1.5 }}
              >
                Comenzar Bajo
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/vocal')}
            >
              <RecordVoiceOver sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Entrenador Vocal
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Practica escalas vocales en clave de Sol con afinador integrado
              </Typography>
              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={() => navigate('/vocal')}
                sx={{ py: 1.5 }}
              >
                Comenzar Vocal
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/triadas')}
            >
              <LibraryMusic sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Entrenador de Tríadas
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Practica tríadas (mayor, menor, disminuida, aumentada) y sus inversiones
              </Typography>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => navigate('/triadas')}
                sx={{ py: 1.5 }}
              >
                Comenzar Tríadas
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/ritmica')}
            >
              <AccessTime sx={{ fontSize: 64, color: 'purple', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Rítmica
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Aprende figuras, silencios, batimientos y compases musicales
              </Typography>
              <Button
                variant="contained"
                sx={{
                  py: 1.5,
                  backgroundColor: 'purple',
                  '&:hover': { backgroundColor: '#7b1fa2' }
                }}
                fullWidth
                onClick={() => navigate('/ritmica')}
              >
                Comenzar Rítmica
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/intervalos-piano')}
            >
              <Piano sx={{ fontSize: 64, color: 'info.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Intervalos Piano
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Escalas en clave de sol con pentagrama y piano interactivo
              </Typography>
              <Button
                variant="contained"
                color="info"
                fullWidth
                onClick={() => navigate('/intervalos-piano')}
                sx={{ py: 1.5 }}
              >
                Comenzar Intervalos Piano
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/intervalos-trainer')}
            >
              <GraphicEq sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Entrenador de Intervalos
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Practica todos los intervalos con tabla de referencia y notación musical
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={() => navigate('/intervalos-trainer')}
                sx={{ py: 1.5 }}
              >
                Comenzar Entrenador
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => navigate('/lectura-musical')}
            >
              <MenuBook sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Lectura Musical
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                Practica la lectura de notas estilo Dandelot con ejercicios progresivos
              </Typography>
              <Button
                variant="contained"
                sx={{
                  py: 1.5,
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#388e3c' }
                }}
                fullWidth
                onClick={() => navigate('/lectura-musical')}
              >
                Comenzar Lectura
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}