import React, { useMemo, useState } from "react";
import {
  Typography,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

export default function IntervalsTable() {
  // ---------- Tipos ----------
  type Dir = "asc" | "desc";
  type Kind =
    | "Justo"
    | "Mayor"
    | "Menor"
    | "Aumentado"
    | "Disminuido"
    | "Tritono";

  // ---------- Colores ----------
  const getTypeColor = (type: Kind) => {
    switch (type) {
      case "Justo":
        return "#2e7d32";
      case "Mayor":
        return "#1565c0";
      case "Menor":
        return "#c62828";
      case "Aumentado":
        return "#6a1b9a";
      case "Disminuido":
        return "#ef6c00";
      case "Tritono":
        return "#8d6e63";
      default:
        return "#666";
    }
  };

  // ---------- Utilidades de notas ----------
  const NAT_PC: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };
  const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
  const ES_NAME: Record<string, string> = {
    C: "Do",
    D: "Re",
    E: "Mi",
    F: "Fa",
    G: "Sol",
    A: "La",
    B: "Si",
  };
  const ACC_TO_SHIFT = { "": 0, "#": +1, "##": +2, b: -1, bb: -2 } as const;
  const ACC_SYMBOL: Record<string, string> = {
    "": "",
    "#": "♯",
    "##": "𝄪",
    b: "♭",
    bb: "𝄫",
  };
  const shiftToAcc = (s: number) =>
    s === -2 ? "bb" : s === -1 ? "b" : s === 1 ? "#" : s === 2 ? "##" : "";
  type Parsed = { L: string; acc: string; shift: number; oct: number };

  const parseSPN = (spn: string): Parsed => {
    const m = spn.match(/^([A-Ga-g])(#{1,2}|b{1,2})?(\d)$/);
    if (!m) throw new Error(`Nota inválida: ${spn}`);
    const L = m[1].toUpperCase();
    const acc = m[2] ?? "";
    const oct = parseInt(m[3], 10);
    return {
      L,
      acc,
      shift: ACC_TO_SHIFT[acc as keyof typeof ACC_TO_SHIFT] ?? 0,
      oct,
    };
  };
  const midiOf = ({
    L,
    shift,
    oct,
  }: {
    L: string;
    shift: number;
    oct: number;
  }) => 12 * (oct + 1) + NAT_PC[L] + shift;

  const spanishOf = (L: string, acc: string, oct: number) =>
    `${ES_NAME[L]}${ACC_SYMBOL[acc]}${oct}`;

  // Nota destino (deletreo correcto con pasos diatónicos + semitonos)
  const spellIntervalTarget = (
    rootSpn: string,
    semitones: number,
    steps: number,
    dir: Dir,
  ) => {
    const r = parseSPN(rootSpn);
    const rootMidi = midiOf(r);
    const dSteps = dir === "asc" ? steps : -steps;
    const dSemis = dir === "asc" ? semitones : -semitones;
    const wantMidi = rootMidi + dSemis;

    const rootIdx = LETTERS.indexOf(r.L as any);
    const idxSum = rootIdx + dSteps;
    const tgtIdx = ((idxSum % 7) + 7) % 7;
    const octaveCarry = Math.floor(idxSum / 7);
    const tgtL = LETTERS[tgtIdx];
    const tgtOct = r.oct + octaveCarry;

    const naturalMidi = 12 * (tgtOct + 1) + NAT_PC[tgtL];
    let delta = wantMidi - naturalMidi;
    if (delta > 2) delta = 2;
    if (delta < -2) delta = -2;
    const acc = shiftToAcc(delta);

    return { es: spanishOf(tgtL, acc, tgtOct), spn: `${tgtL}${acc}${tgtOct}` };
  };

  // ---------- Tabla Melissa (por semitonos) ----------
  const melissaIntervals = [
    {
      name: "Unísono",
      symbol: "P1",
      semitones: 0,
      type: "Justo" as Kind,
      steps: 0,
    },
    {
      name: "2ª menor",
      symbol: "m2",
      semitones: 1,
      type: "Menor" as Kind,
      steps: 1,
    },
    {
      name: "2ª mayor",
      symbol: "M2",
      semitones: 2,
      type: "Mayor" as Kind,
      steps: 1,
    },
    {
      name: "3ª menor",
      symbol: "m3",
      semitones: 3,
      type: "Menor" as Kind,
      steps: 2,
    },
    {
      name: "3ª mayor",
      symbol: "M3",
      semitones: 4,
      type: "Mayor" as Kind,
      steps: 2,
    },
    {
      name: "4ª justa",
      symbol: "P4",
      semitones: 5,
      type: "Justo" as Kind,
      steps: 3,
    },
    {
      name: "Tritono",
      symbol: "TT",
      semitones: 6,
      type: "Tritono" as Kind,
      steps: 3,
    }, // A4 / d5
    {
      name: "5ª justa",
      symbol: "P5",
      semitones: 7,
      type: "Justo" as Kind,
      steps: 4,
    },
    {
      name: "6ª menor",
      symbol: "m6",
      semitones: 8,
      type: "Menor" as Kind,
      steps: 5,
    },
    {
      name: "6ª mayor",
      symbol: "M6",
      semitones: 9,
      type: "Mayor" as Kind,
      steps: 5,
    },
    {
      name: "7ª menor",
      symbol: "m7",
      semitones: 10,
      type: "Menor" as Kind,
      steps: 6,
    },
    {
      name: "7ª mayor",
      symbol: "M7",
      semitones: 11,
      type: "Mayor" as Kind,
      steps: 6,
    },
    {
      name: "Octava",
      symbol: "P8",
      semitones: 12,
      type: "Justo" as Kind,
      steps: 7,
    },
  ];

  // ---------- Tabla Said (exactamente lo que pediste) ----------
  const saidIntervals = [
    {
      name: "Unísono",
      symbol: "P1",
      semitones: 0,
      type: "Justo" as Kind,
      steps: 0,
    },
    {
      name: "2ª menor",
      symbol: "m2",
      semitones: 1,
      type: "Menor" as Kind,
      steps: 1,
    },
    {
      name: "2ª mayor",
      symbol: "M2",
      semitones: 2,
      type: "Mayor" as Kind,
      steps: 1,
    },
    {
      name: "3ª menor",
      symbol: "m3",
      semitones: 3,
      type: "Menor" as Kind,
      steps: 2,
    },
    {
      name: "3ª mayor",
      symbol: "M3",
      semitones: 4,
      type: "Mayor" as Kind,
      steps: 2,
    },
    {
      name: "4ª justa",
      symbol: "P4",
      semitones: 5,
      type: "Justo" as Kind,
      steps: 3,
    },
    {
      name: "4ª aumentada",
      symbol: "A4",
      semitones: 6,
      type: "Aumentado" as Kind,
      steps: 3,
    },
    {
      name: "5ª disminuida",
      symbol: "d5",
      semitones: 6,
      type: "Disminuido" as Kind,
      steps: 4,
    },
    {
      name: "5ª justa",
      symbol: "P5",
      semitones: 7,
      type: "Justo" as Kind,
      steps: 4,
    },
    {
      name: "5ª aumentada",
      symbol: "A5",
      semitones: 8,
      type: "Aumentado" as Kind,
      steps: 4,
    },
    {
      name: "6ª menor",
      symbol: "m6",
      semitones: 8,
      type: "Menor" as Kind,
      steps: 5,
    },
    {
      name: "6ª mayor",
      symbol: "M6",
      semitones: 9,
      type: "Mayor" as Kind,
      steps: 5,
    },
    {
      name: "7ª menor",
      symbol: "m7",
      semitones: 10,
      type: "Menor" as Kind,
      steps: 6,
    },
    {
      name: "7ª mayor",
      symbol: "M7",
      semitones: 11,
      type: "Mayor" as Kind,
      steps: 6,
    },
    {
      name: "Octava",
      symbol: "P8",
      semitones: 12,
      type: "Justo" as Kind,
      steps: 7,
    },
  ];

  // ---------- Estado ----------
  const NATURAL_ROOTS_4 = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"] as const;
  const [root, setRoot] = useState<string>("C4");
  const [direction, setDirection] = useState<Dir>("asc");
  const [selectedInterval, setSelectedInterval] = useState<string>("");

  // ---------- Estilos ----------
  const thBase: React.CSSProperties = {
    padding: "6px 8px",
    fontWeight: 700,
    fontSize: "0.85em",
    whiteSpace: "nowrap",
  };
  const tdBase: React.CSSProperties = {
    padding: "6px 8px",
    fontSize: "0.85em",
    whiteSpace: "nowrap",
  };
  const rootEs = (() => {
    const p = parseSPN(root);
    return spanishOf(p.L, p.acc, p.oct);
  })();

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          📐 Tablas de intervalos — base {rootEs}
        </Typography>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="root-label">Nota base</InputLabel>
            <Select
              labelId="root-label"
              label="Nota base"
              value={root}
              onChange={(e) => setRoot(e.target.value)}
            >
              {NATURAL_ROOTS_4.map((n) => {
                const p = parseSPN(n);
                const es = spanishOf(p.L, p.acc, p.oct);
                return (
                  <MenuItem key={n} value={n}>
                    {es} — {n}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="dir-label">Dirección</InputLabel>
            <Select
              labelId="dir-label"
              label="Dirección"
              value={direction}
              onChange={(e) => setDirection(e.target.value as Dir)}
            >
              <MenuItem value="asc">Ascendente</MenuItem>
              <MenuItem value="desc">Descendente</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="interval-label">Intervalo destacado</InputLabel>
            <Select
              labelId="interval-label"
              label="Intervalo destacado"
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value)}
            >
              <MenuItem value="">Ninguno</MenuItem>
              {saidIntervals.map((iv) => (
                <MenuItem key={iv.symbol} value={iv.symbol}>
                  {iv.symbol} — {iv.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
        {/* Tabla Melissa */}
        <Box sx={{ flex: 1, overflowX: "auto" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Melissa — por semitonos (incluye “Tritono” único)
          </Typography>
          <table
            style={{
              display: "table",
              borderCollapse: "collapse",
              width: "100%",
              tableLayout: "fixed",
            }}
            cellSpacing={0}
            cellPadding={0}
          >
            <colgroup>
              <col style={{ width: "15%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "45%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd" }}>
                <th style={{ ...thBase, textAlign: "center" }}>Tonos</th>
                <th style={{ ...thBase, textAlign: "center" }}>Tipo</th>
                <th style={{ ...thBase, textAlign: "left" }}>
                  Símbolo / Intervalo
                </th>
                <th style={{ ...thBase, textAlign: "left" }}>Destino</th>
              </tr>
            </thead>
            <tbody>
              {melissaIntervals.map((iv, i) => {
                const target = spellIntervalTarget(
                  root,
                  iv.semitones,
                  iv.steps,
                  direction,
                );
                // Destacar si es el intervalo seleccionado O si es tritono y se seleccionó A4/d5
                const isHighlighted =
                  selectedInterval === iv.symbol ||
                  (iv.symbol === "TT" &&
                    (selectedInterval === "A4" || selectedInterval === "d5"));
                const backgroundColor = isHighlighted
                  ? "rgba(25, 118, 210, 0.15)"
                  : i % 2 === 0
                    ? "#fafafa"
                    : "#fff";
                return (
                  <tr
                    key={`mel-${iv.symbol}`}
                    style={{
                      borderBottom: "1px solid #eee",
                      background: backgroundColor,
                    }}
                  >
                    <td style={{ ...tdBase, textAlign: "center" }}>
                      {iv.semitones / 2}
                    </td>
                    <td
                      style={{
                        ...tdBase,
                        textAlign: "center",
                        fontWeight: 700,
                        color: getTypeColor(iv.type),
                        fontSize: "0.65em",
                      }}
                    >
                      {iv.type}
                    </td>
                    <td
                      style={{
                        ...tdBase,
                        fontFamily: "monospace",
                        fontWeight: 700,
                      }}
                    >
                      {iv.symbol} <span style={{ opacity: 0.6 }}>/</span>{" "}
                      <span style={{ fontWeight: 500, fontFamily: "inherit" }}>
                        {iv.name}
                      </span>
                    </td>
                    <td style={{ ...tdBase, fontFamily: "monospace" }}>
                      {target.es}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>

        {/* Tabla Said */}
        <Box sx={{ flex: 1, overflowX: "auto" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Said — notación con A/d (A4, d5, A5…)
          </Typography>
          <table
            style={{
              display: "table",
              borderCollapse: "collapse",
              width: "100%",
              tableLayout: "fixed",
            }}
            cellSpacing={0}
            cellPadding={0}
          >
            <colgroup>
              <col style={{ width: "15%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "45%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd" }}>
                <th style={{ ...thBase, textAlign: "center" }}>Tonos</th>
                <th style={{ ...thBase, textAlign: "center" }}>Tipo</th>
                <th style={{ ...thBase, textAlign: "left" }}>
                  Símbolo / Intervalo
                </th>
                <th style={{ ...thBase, textAlign: "left" }}>Destino</th>
              </tr>
            </thead>
            <tbody>
              {saidIntervals.map((iv, i) => {
                const target = spellIntervalTarget(
                  root,
                  iv.semitones,
                  iv.steps,
                  direction,
                );
                // Destacar si es el intervalo seleccionado O si es A4/d5 y se seleccionó TT
                const isHighlighted =
                  selectedInterval === iv.symbol ||
                  ((iv.symbol === "A4" || iv.symbol === "d5") &&
                    selectedInterval === "TT");
                const backgroundColor = isHighlighted
                  ? "rgba(25, 118, 210, 0.15)"
                  : i % 2 === 0
                    ? "#fafafa"
                    : "#fff";
                return (
                  <tr
                    key={`said-${iv.symbol}`}
                    style={{
                      borderBottom: "1px solid #eee",
                      background: backgroundColor,
                    }}
                  >
                    <td style={{ ...tdBase, textAlign: "center" }}>
                      {iv.semitones / 2}
                    </td>
                    <td
                      style={{
                        ...tdBase,
                        textAlign: "center",
                        fontWeight: 700,
                        color: getTypeColor(iv.type),
                        fontSize: "0.65em",
                      }}
                    >
                      {iv.type}
                    </td>
                    <td
                      style={{
                        ...tdBase,
                        fontFamily: "monospace",
                        fontWeight: 700,
                      }}
                    >
                      {iv.symbol} <span style={{ opacity: 0.6 }}>/</span>{" "}
                      <span style={{ fontWeight: 500, fontFamily: "inherit" }}>
                        {iv.name}
                      </span>
                    </td>
                    <td style={{ ...tdBase, fontFamily: "monospace" }}>
                      {target.es}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Stack>

      {/* Diagramas de escalas mayores juntos */}
      <Stack spacing={2} sx={{ mt: 3 }}>
        {/* Diagrama de escala mayor fijo desde Do4 */}
        <Box sx={{ p: 2, bgcolor: "rgba(76, 175, 80, 0.08)", borderRadius: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}
          >
            🎵 Escala Mayor desde Do4 — patrón T T S T T T S (fijo)
          </Typography>

          {(() => {
            // Calcular la escala mayor desde Do4 (fijo) incluyendo la octava
            const scale: Array<{
              note: string;
              midi: number;
              interval: string;
            }> = [];
            let currentNote = { L: "C", acc: "", shift: 0, oct: 4 };
            const pattern = [2, 2, 1, 2, 2, 2, 1]; // T T S T T T S en semitonos

            // Agregar la tónica
            scale.push({
              note: spanishOf(currentNote.L, currentNote.acc, currentNote.oct),
              midi: midiOf(currentNote),
              interval: "",
            });

            // Calcular cada nota de la escala (incluyendo la octava)
            for (let i = 0; i < pattern.length; i++) {
              const currentMidi = midiOf(currentNote);
              const targetMidi = currentMidi + pattern[i];

              // Encontrar la siguiente letra
              const letterIndex = LETTERS.indexOf(currentNote.L as any);
              const nextLetterIndex = (letterIndex + 1) % 7;
              const nextLetter = LETTERS[nextLetterIndex];

              // Calcular octava
              const nextOct =
                letterIndex === 6 ? currentNote.oct + 1 : currentNote.oct;
              const naturalMidi = 12 * (nextOct + 1) + NAT_PC[nextLetter];
              const delta = targetMidi - naturalMidi;

              const acc =
                delta === 0 ? "" : delta === 1 ? "#" : delta === -1 ? "b" : "";
              const intervalType = pattern[i] === 2 ? "T" : "S";

              currentNote = { L: nextLetter, acc, shift: delta, oct: nextOct };
              scale.push({
                note: spanishOf(nextLetter, acc, nextOct),
                midi: targetMidi,
                interval: intervalType,
              });
            }

            return (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                {scale.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        px: 1,
                        py: 0.3,
                        bgcolor:
                          index === 0 ? "#2e7d32" : "rgba(76, 175, 80, 0.15)",
                        color: index === 0 ? "white" : "#2e7d32",
                        borderRadius: 1,
                        fontWeight: 700,
                        fontSize: "0.75em",
                        minWidth: "40px",
                        textAlign: "center",
                      }}
                    >
                      {item.note}
                    </Box>
                    {index < scale.length - 1 && (
                      <Box
                        sx={{
                          mx: 0.3,
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            scale[index + 1].interval === "T"
                              ? "#1976d2"
                              : "#f57c00",
                          color: "white",
                          borderRadius: "50%",
                          fontSize: "0.7em",
                          fontWeight: 700,
                        }}
                      >
                        {scale[index + 1].interval}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            );
          })()}

          <Typography
            variant="caption"
            sx={{ mt: 1, display: "block", color: "#2e7d32" }}
          >
            <strong style={{ color: "#1976d2" }}>T</strong> = Tono (2 semitonos)
            • <strong style={{ color: "#f57c00" }}>S</strong> = Semitono (1
            semitono) • Patrón universal de la escala mayor
          </Typography>
        </Box>

        {/* Diagrama de escala mayor T T S T T T S variable */}
        <Box sx={{ p: 2, bgcolor: "rgba(76, 175, 80, 0.08)", borderRadius: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}
          >
            🎵 Escala Mayor desde {rootEs} — patrón T T S T T T S
          </Typography>

          {(() => {
            // Calcular la escala mayor desde la nota base variable incluyendo la octava
            const rootParsed = parseSPN(root);
            const scale: Array<{
              note: string;
              midi: number;
              interval: string;
            }> = [];
            let currentNote = rootParsed;
            const pattern = [2, 2, 1, 2, 2, 2, 1]; // T T S T T T S en semitonos

            // Agregar la tónica
            scale.push({
              note: spanishOf(currentNote.L, currentNote.acc, currentNote.oct),
              midi: midiOf(currentNote),
              interval: "",
            });

            // Calcular cada nota de la escala (incluyendo la octava)
            for (let i = 0; i < pattern.length; i++) {
              const currentMidi = midiOf(currentNote);
              const targetMidi = currentMidi + pattern[i];

              // Encontrar la siguiente letra
              const letterIndex = LETTERS.indexOf(currentNote.L as any);
              const nextLetterIndex = (letterIndex + 1) % 7;
              const nextLetter = LETTERS[nextLetterIndex];

              // Calcular octava
              const nextOct =
                letterIndex === 6 ? currentNote.oct + 1 : currentNote.oct;
              const naturalMidi = 12 * (nextOct + 1) + NAT_PC[nextLetter];
              const delta = targetMidi - naturalMidi;

              const acc =
                delta === 0 ? "" : delta === 1 ? "#" : delta === -1 ? "b" : "";
              const intervalType = pattern[i] === 2 ? "T" : "S";

              currentNote = { L: nextLetter, acc, shift: delta, oct: nextOct };
              scale.push({
                note: spanishOf(nextLetter, acc, nextOct),
                midi: targetMidi,
                interval: intervalType,
              });
            }

            return (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  alignItems: "center",
                }}
              >
                {scale.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        px: 1,
                        py: 0.3,
                        bgcolor:
                          index === 0 ? "#2e7d32" : "rgba(76, 175, 80, 0.15)",
                        color: index === 0 ? "white" : "#2e7d32",
                        borderRadius: 1,
                        fontWeight: 700,
                        fontSize: "0.75em",
                        minWidth: "40px",
                        textAlign: "center",
                      }}
                    >
                      {item.note}
                    </Box>
                    {index < scale.length - 1 && (
                      <Box
                        sx={{
                          mx: 0.3,
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            scale[index + 1].interval === "T"
                              ? "#1976d2"
                              : "#f57c00",
                          color: "white",
                          borderRadius: "50%",
                          fontSize: "0.7em",
                          fontWeight: 700,
                        }}
                      >
                        {scale[index + 1].interval}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            );
          })()}

          <Typography
            variant="caption"
            sx={{ mt: 1, display: "block", color: "#2e7d32" }}
          >
            <strong style={{ color: "#1976d2" }}>T</strong> = Tono (2 semitonos)
            • <strong style={{ color: "#f57c00" }}>S</strong> = Semitono (1
            semitono) • Patrón universal de la escala mayor
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          mt: 1.5,
          display: "block",
          color: "text.secondary",
          fontStyle: "italic",
        }}
      >
        "Tritono" (3 tonos) se puede escribir como 4ª aumentada (A4) o 5ª
        disminuida (d5). Ambas suenan igual, pero su función y escritura
        cambian.
      </Typography>
    </Paper>
  );
}
