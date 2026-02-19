import React from "react";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";

const INTERVAL_REFERENCE = [
  { interval: "Unísono", note: "C", solfege: "Do", semitonos: 0, tonos: "0" },
  {
    interval: "2ª menor",
    note: "C#/Db",
    solfege: "Do#/Reb",
    semitonos: 1,
    tonos: "1/2",
  },
  { interval: "2ª mayor", note: "D", solfege: "Re", semitonos: 2, tonos: "1" },
  {
    interval: "3ª menor",
    note: "D#/Eb",
    solfege: "Re#/Mib",
    semitonos: 3,
    tonos: "1 1/2",
  },
  { interval: "3ª mayor", note: "E", solfege: "Mi", semitonos: 4, tonos: "2" },
  {
    interval: "4ª justa",
    note: "F",
    solfege: "Fa",
    semitonos: 5,
    tonos: "2 1/2",
  },
  {
    interval: "4ª aum/5ª dis",
    note: "F#/Gb",
    solfege: "Fa#/Solb",
    semitonos: 6,
    tonos: "3",
  },
  {
    interval: "5ª justa",
    note: "G",
    solfege: "Sol",
    semitonos: 7,
    tonos: "3 1/2",
  },
  {
    interval: "6ª menor",
    note: "G#/Ab",
    solfege: "Sol#/Lab",
    semitonos: 8,
    tonos: "4",
  },
  {
    interval: "6ª mayor",
    note: "A",
    solfege: "La",
    semitonos: 9,
    tonos: "4 1/2",
  },
  {
    interval: "7ª menor",
    note: "A#/Bb",
    solfege: "La#/Sib",
    semitonos: 10,
    tonos: "5",
  },
  {
    interval: "7ª mayor",
    note: "B",
    solfege: "Si",
    semitonos: 11,
    tonos: "5 1/2",
  },
  { interval: "Octava", note: "C", solfege: "Do", semitonos: 12, tonos: "6" },
];

export default function ChromaticIntervalsTable() {
  return (
    <Grid item xs={12} md={8}>
      <Typography
        variant="h6"
        sx={{ mb: 1, color: "primary.main", fontWeight: "bold" }}
      >
        Intervalos Cromáticos (desde Do)
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.100" }}>
              <TableCell
                sx={{ fontWeight: "bold", py: 1, textAlign: "center" }}
              >
                Intervalo
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", py: 1, textAlign: "center" }}
              >
                Nota
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", py: 1, textAlign: "center" }}
              >
                Solfeo
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", py: 1, textAlign: "center" }}
              >
                Semitonos
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", py: 1, textAlign: "center" }}
              >
                Tonos
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {INTERVAL_REFERENCE.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                  "&:hover": { backgroundColor: "primary.light", opacity: 0.8 },
                }}
              >
                <TableCell
                  sx={{ py: 1, textAlign: "center", fontWeight: "medium" }}
                >
                  {row.interval}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    py: 1,
                    textAlign: "center",
                  }}
                >
                  {row.note}
                </TableCell>
                <TableCell
                  sx={{ fontStyle: "italic", py: 1, textAlign: "center" }}
                >
                  {row.solfege}
                </TableCell>
                <TableCell sx={{ py: 1, textAlign: "center" }}>
                  {row.semitonos}
                </TableCell>
                <TableCell
                  sx={{ py: 1, fontFamily: "monospace", textAlign: "center" }}
                >
                  {row.tonos}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}
