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

const FUNDAMENTAL_NOTES = [
  { note: "C", solfege: "Do", semitonos: 0, interval: "Unísono" },
  { note: "D", solfege: "Re", semitonos: 2, interval: "2ª mayor" },
  { note: "E", solfege: "Mi", semitonos: 4, interval: "3ª mayor" },
  { note: "F", solfege: "Fa", semitonos: 5, interval: "4ª justa" },
  { note: "G", solfege: "Sol", semitonos: 7, interval: "5ª justa" },
  { note: "A", solfege: "La", semitonos: 9, interval: "6ª mayor" },
  { note: "B", solfege: "Si", semitonos: 11, interval: "7ª mayor" },
];

export default function FundamentalNotesTable() {
  return (
    <Grid item xs={12} md={4}>
      <Typography
        variant="h6"
        sx={{ mb: 1, color: "primary.main", fontWeight: "bold" }}
      >
        Notas Fundamentales
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.100" }}>
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
                Intervalo
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {FUNDAMENTAL_NOTES.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                  "&:hover": { backgroundColor: "primary.light", opacity: 0.8 },
                }}
              >
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    py: 1,
                    textAlign: "center",
                    fontSize: "1.1em",
                  }}
                >
                  {row.note}
                </TableCell>
                <TableCell
                  sx={{
                    fontStyle: "italic",
                    py: 1,
                    textAlign: "center",
                    fontSize: "1.1em",
                  }}
                >
                  {row.solfege}
                </TableCell>
                <TableCell
                  sx={{ py: 1, textAlign: "center", fontSize: "1.1em" }}
                >
                  {row.semitonos}
                </TableCell>
                <TableCell
                  sx={{
                    py: 1,
                    textAlign: "center",
                    fontSize: "1.0em",
                    fontWeight: "medium",
                  }}
                >
                  {row.interval}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}
