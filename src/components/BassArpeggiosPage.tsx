import React from 'react'
import { Box, Stack, Button, Typography, Paper } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import BassArpeggioExplorer from './BassArpeggioExplorer'

export default function BassArpeggiosPage() {
  const navigate = useNavigate()

  return (
    <Box sx={{ width: '100%', px: 2, py: 3 }}>
      <Stack spacing={2} maxWidth="900px" mx="auto">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/')}>
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0b2a50', flex: 1 }}>
            🎵 Arpegios de 7ª para Bajo
          </Typography>
        </Box>

        <BassArpeggioExplorer />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Referencia rápida: Dm7 (1-b3-5-b7), G7 (1-3-5-b7) y Cmaj7 (1-3-5-7). Selecciona cualquier fundamental para ver
            las cuatro notas del arpegio y tres modos de ejecución sugeridos.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
