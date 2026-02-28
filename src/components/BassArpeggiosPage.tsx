import React from "react";
import { Box, Stack, Button, Typography, Paper } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import BassArpeggioExplorer from "./BassArpeggioExplorer";
import AlwaysOnTuner from "./AlwaysOnTuner";

export default function BassArpeggiosPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      <Stack spacing={2} maxWidth="1200px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#0b2a50", flex: 1 }}
          >
            🎵 Arpegios para Bajo
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Afinador
          </Typography>
          <AlwaysOnTuner />
        </Paper>

        <BassArpeggioExplorer />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Referencia rápida: módulo completo para bajo de 5 cuerdas (BEADG)
            con triadas, cuatríadas e inversiones, más catálogo por 12
            tonalidades para estudio anual.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
