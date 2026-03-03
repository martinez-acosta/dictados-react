import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  CancelOutlined,
  CheckCircleOutline,
  LightbulbOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const DEGREE_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII"];
const SCALE_COLUMNS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const CHROMATIC_ROOTS = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

const ROOT_SIGNATURE_INFO = {
  C: { relativeMinor: "Am" },
  Db: { relativeMinor: "Bbm" },
  D: { relativeMinor: "Bm" },
  Eb: { relativeMinor: "Cm" },
  E: { relativeMinor: "C#m" },
  F: { relativeMinor: "Dm" },
  Gb: { relativeMinor: "Ebm" },
  G: { relativeMinor: "Em" },
  Ab: { relativeMinor: "Fm" },
  A: { relativeMinor: "F#m" },
  Bb: { relativeMinor: "Gm" },
  B: { relativeMinor: "G#m" },
};

const CIRCLE_WHEEL_SLOTS = [
  {
    id: "C",
    major: "C",
    minor: "Am",
    signature: "0",
    side: "neutral",
    matchRoots: ["C"],
  },
  {
    id: "G",
    major: "G",
    minor: "Em",
    signature: "1#",
    side: "sharp",
    matchRoots: ["G"],
  },
  {
    id: "D",
    major: "D",
    minor: "Bm",
    signature: "2#",
    side: "sharp",
    matchRoots: ["D"],
  },
  {
    id: "A",
    major: "A",
    minor: "F#m",
    signature: "3#",
    side: "sharp",
    matchRoots: ["A"],
  },
  {
    id: "E",
    major: "E",
    minor: "C#m",
    signature: "4#",
    side: "sharp",
    matchRoots: ["E"],
  },
  {
    id: "B",
    major: "B / Cb",
    minor: "G#m / Abm",
    signature: "5# / 7b",
    side: "mixed",
    matchRoots: ["B"],
  },
  {
    id: "GbFsharp",
    major: "Gb / F#",
    minor: "Ebm / D#m",
    signature: "6b / 6#",
    side: "mixed",
    matchRoots: ["Gb"],
  },
  {
    id: "DbCsharp",
    major: "Db / C#",
    minor: "Bbm / A#m",
    signature: "5b / 7#",
    side: "mixed",
    matchRoots: ["Db"],
  },
  {
    id: "Ab",
    major: "Ab",
    minor: "Fm",
    signature: "4b",
    side: "flat",
    matchRoots: ["Ab"],
  },
  {
    id: "Eb",
    major: "Eb",
    minor: "Cm",
    signature: "3b",
    side: "flat",
    matchRoots: ["Eb"],
  },
  {
    id: "Bb",
    major: "Bb",
    minor: "Gm",
    signature: "2b",
    side: "flat",
    matchRoots: ["Bb"],
  },
  {
    id: "F",
    major: "F",
    minor: "Dm",
    signature: "1b",
    side: "flat",
    matchRoots: ["F"],
  },
];

const FLAT_SUBTABLE = [
  {
    tonality: "Fa",
    count: 1,
    majorScale: ["Fa", "Sol", "La", "Sib", "Do", "Re", "Mi", "Fa"],
  },
  {
    tonality: "Sib",
    count: 2,
    majorScale: ["Sib", "Do", "Re", "Mib", "Fa", "Sol", "La", "Sib"],
  },
  {
    tonality: "Mib",
    count: 3,
    majorScale: ["Mib", "Fa", "Sol", "Lab", "Sib", "Do", "Re", "Mib"],
  },
  {
    tonality: "Lab",
    count: 4,
    majorScale: ["Lab", "Sib", "Do", "Reb", "Mib", "Fa", "Sol", "Lab"],
  },
  {
    tonality: "Reb",
    count: 5,
    majorScale: ["Reb", "Mib", "Fa", "Solb", "Lab", "Sib", "Do", "Reb"],
  },
  {
    tonality: "Solb",
    count: 6,
    majorScale: ["Solb", "Lab", "Sib", "Dob", "Reb", "Mib", "Fa", "Solb"],
  },
];

const SHARP_SUBTABLE = [
  {
    tonality: "Sol",
    count: 1,
    majorScale: ["Sol", "La", "Si", "Do", "Re", "Mi", "Fa#", "Sol"],
  },
  {
    tonality: "Re",
    count: 2,
    majorScale: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#", "Re"],
  },
  {
    tonality: "La",
    count: 3,
    majorScale: ["La", "Si", "Do#", "Re", "Mi", "Fa#", "Sol#", "La"],
  },
  {
    tonality: "Mi",
    count: 4,
    majorScale: ["Mi", "Fa#", "Sol#", "La", "Si", "Do#", "Re#", "Mi"],
  },
  {
    tonality: "Si",
    count: 5,
    majorScale: ["Si", "Do#", "Re#", "Mi", "Fa#", "Sol#", "La#", "Si"],
  },
  {
    tonality: "Fa#",
    count: 6,
    majorScale: ["Fa#", "Sol#", "La#", "Si", "Do#", "Re#", "Mi#", "Fa#"],
  },
  {
    tonality: "Do#",
    count: 7,
    majorScale: ["Do#", "Re#", "Mi#", "Fa#", "Sol#", "La#", "Si#", "Do#"],
  },
];

const SCALE_GUIDE = [
  {
    major: "Fa mayor",
    notes: ["Fa", "Sol", "La", "Sib", "Do", "Re", "Mi", "Fa"],
    sixthDegree: "Re",
    relativeMinor: "Re menor",
    keySignature: "1 bemol (Sib)",
  },
  {
    major: "Sib mayor",
    notes: ["Sib", "Do", "Re", "Mib", "Fa", "Sol", "La", "Sib"],
    sixthDegree: "Sol",
    relativeMinor: "Sol menor",
    keySignature: "2 bemoles (Sib, Mib)",
  },
  {
    major: "Mib mayor",
    notes: ["Mib", "Fa", "Sol", "Lab", "Sib", "Do", "Re", "Mib"],
    sixthDegree: "Do",
    relativeMinor: "Do menor",
    keySignature: "3 bemoles (Sib, Mib, Lab)",
  },
  {
    major: "Sol mayor",
    notes: ["Sol", "La", "Si", "Do", "Re", "Mi", "Fa#", "Sol"],
    sixthDegree: "Mi",
    relativeMinor: "Mi menor",
    keySignature: "1 sostenido (Fa#)",
  },
  {
    major: "Re mayor",
    notes: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#", "Re"],
    sixthDegree: "Si",
    relativeMinor: "Si menor",
    keySignature: "2 sostenidos (Fa#, Do#)",
  },
  {
    major: "La mayor",
    notes: ["La", "Si", "Do#", "Re", "Mi", "Fa#", "Sol#", "La"],
    sixthDegree: "Fa#",
    relativeMinor: "Fa# menor",
    keySignature: "3 sostenidos (Fa#, Do#, Sol#)",
  },
];

function shuffle(array) {
  const copy = [...array];
  for (let idx = copy.length - 1; idx > 0; idx -= 1) {
    const j = Math.floor(Math.random() * (idx + 1));
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
  }
  return copy;
}

function createQuizQuestion() {
  const target = SCALE_GUIDE[Math.floor(Math.random() * SCALE_GUIDE.length)];
  const distractors = shuffle(
    SCALE_GUIDE.filter((row) => row.relativeMinor !== target.relativeMinor).map(
      (row) => row.relativeMinor,
    ),
  ).slice(0, 3);

  return {
    major: target.major,
    answer: target.relativeMinor,
    options: shuffle([target.relativeMinor, ...distractors]),
  };
}

function renderScaleDegreeCells(notes, rowKeyPrefix) {
  return notes.slice(0, 8).map((note, index) => (
    <TableCell
      key={`${rowKeyPrefix}-deg-${index}`}
      align="center"
      sx={index === 5 ? { backgroundColor: "#f1f8e9", fontWeight: 700 } : null}
    >
      {note}
    </TableCell>
  ));
}

function polarPosition(angleDeg, radiusPercent) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(radians) * radiusPercent}%`,
    top: `${50 + Math.sin(radians) * radiusPercent}%`,
  };
}

function sideColor(side) {
  if (side === "sharp") return "#1565c0";
  if (side === "flat") return "#8e24aa";
  if (side === "mixed") return "#ef6c00";
  return "#455a64";
}

function compactLabel(value) {
  return value.replaceAll(" / ", "/");
}

function tokenAccent(token) {
  if (token.includes("#")) {
    return {
      color: "#1565c0",
      bg: "rgba(21,101,192,0.12)",
      border: "rgba(21,101,192,0.24)",
    };
  }
  if (token.includes("b")) {
    return {
      color: "#8e24aa",
      bg: "rgba(142,36,170,0.12)",
      border: "rgba(142,36,170,0.24)",
    };
  }
  return {
    color: "#455a64",
    bg: "rgba(69,90,100,0.10)",
    border: "rgba(69,90,100,0.16)",
  };
}

function splitSlashParts(value) {
  return value.split(" / ");
}

function CircleOfFifthsClock({ selectedRoot, compact = false }) {
  const selectedInfo = ROOT_SIGNATURE_INFO[selectedRoot];
  return (
    <Box sx={{ width: "100%", maxWidth: compact ? 360 : 520, mx: "auto" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, rgba(21,101,192,0.10) 0deg 180deg, rgba(142,36,170,0.10) 180deg 360deg)",
          border: "2px solid #0b2a50",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: "13%",
            borderRadius: "50%",
            border: "2px solid #0b2a50",
            background:
              "radial-gradient(circle, #ffffff 0%, #ffffff 58%, rgba(241,245,255,0.95) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: "30%",
            borderRadius: "50%",
            border: "2px solid #0b2a50",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        />

        {Array.from({ length: 12 }).map((_, idx) => (
          <Box
            key={`divider-${idx}`}
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "1.5px",
              height: compact ? "50%" : "49%",
              bgcolor: "rgba(11,42,80,0.14)",
              transformOrigin: "50% 0%",
              transform: `rotate(${idx * 30}deg) translateY(-100%)`,
            }}
          />
        ))}

        {CIRCLE_WHEEL_SLOTS.map((slot, idx) => {
          const angle = -90 + idx * 30;
          const majorPos = polarPosition(angle, compact ? 39 : 39);
          const sigPos = polarPosition(angle, compact ? 25.5 : 26);
          const minorPos = polarPosition(angle, compact ? 18 : 15.5);
          const isSelected = slot.matchRoots.includes(selectedRoot);
          const color = sideColor(slot.side);
          const majorText = compact ? compactLabel(slot.major) : slot.major;
          const minorText = compact ? compactLabel(slot.minor) : slot.minor;
          const signatureParts = splitSlashParts(slot.signature);

          return (
            <React.Fragment key={slot.id}>
              <Box
                sx={{
                  position: "absolute",
                  ...majorPos,
                  transform: "translate(-50%, -50%)",
                  minWidth: compact ? "12%" : "18%",
                  maxWidth: compact ? "19%" : "none",
                  px: compact ? 0.4 : 0.75,
                  py: compact ? 0.15 : 0.25,
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: isSelected ? `${color}18` : "rgba(255,255,255,0.65)",
                  border: isSelected
                    ? `1px solid ${color}`
                    : "1px solid transparent",
                }}
              >
                {slot.side === "mixed" ? (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.35,
                      justifyContent: "center",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    {splitSlashParts(majorText).map((part, partIdx) => {
                      const hintToken = signatureParts[partIdx] ?? part;
                      const accent = tokenAccent(hintToken);
                      return (
                        <Box
                          key={`${slot.id}-major-${part}`}
                          sx={{
                            px: compact ? 0.35 : 0.45,
                            py: 0.05,
                            borderRadius: 1,
                            backgroundColor: accent.bg,
                            border: `1px solid ${accent.border}`,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: compact
                                ? "0.54rem"
                                : { xs: "0.7rem", sm: "0.8rem" },
                              fontWeight: 700,
                              color: accent.color,
                              lineHeight: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {part}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  (() => {
                    const accent = tokenAccent(slot.signature);
                    const useTokenBg = slot.side !== "neutral";
                    return (
                      <Box
                        sx={{
                          display: "inline-flex",
                          px: useTokenBg ? (compact ? 0.35 : 0.45) : 0,
                          py: useTokenBg ? 0.05 : 0,
                          borderRadius: useTokenBg ? 1 : 0,
                          backgroundColor: useTokenBg
                            ? accent.bg
                            : "transparent",
                          border: useTokenBg
                            ? `1px solid ${accent.border}`
                            : "1px solid transparent",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.85rem" },
                            ...(compact && { fontSize: "0.56rem" }),
                            fontWeight: isSelected ? 700 : 600,
                            color: useTokenBg
                              ? accent.color
                              : isSelected
                                ? color
                                : "#111",
                            lineHeight: compact ? 1 : 1.1,
                            whiteSpace: compact ? "normal" : "nowrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {majorText}
                        </Typography>
                      </Box>
                    );
                  })()
                )}
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  ...sigPos,
                  transform: "translate(-50%, -50%)",
                  px: compact ? 0.35 : 0.6,
                  py: compact ? 0.1 : 0.15,
                  borderRadius: 1.5,
                  bgcolor: isSelected ? `${color}12` : "transparent",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.35,
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: "nowrap",
                  }}
                >
                  {signatureParts.map((part) => {
                    const accent = tokenAccent(part);
                    return (
                      <Box
                        key={`${slot.id}-sig-${part}`}
                        sx={{
                          px: compact ? 0.25 : 0.4,
                          py: 0.05,
                          borderRadius: 1,
                          bgcolor: accent.bg,
                          border: `1px solid ${accent.border}`,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "0.62rem", sm: "0.75rem" },
                            ...(compact && { fontSize: "0.5rem" }),
                            fontWeight: 700,
                            color: accent.color,
                            whiteSpace: "nowrap",
                            lineHeight: 1,
                          }}
                        >
                          {part}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {!compact && (
                <Box
                  sx={{
                    position: "absolute",
                    ...minorPos,
                    transform: "translate(-50%, -50%)",
                    px: 0.4,
                    textAlign: "center",
                  }}
                >
                  {slot.side === "mixed" ? (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.35,
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {splitSlashParts(minorText).map((part, partIdx) => {
                        const hintToken = signatureParts[partIdx] ?? part;
                        const accent = tokenAccent(hintToken);
                        return (
                          <Box
                            key={`${slot.id}-minor-${part}`}
                            sx={{
                              px: 0.35,
                              py: 0.02,
                              borderRadius: 1,
                              backgroundColor: accent.bg,
                              border: `1px solid ${accent.border}`,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.62rem",
                                color: accent.color,
                                lineHeight: 1,
                                whiteSpace: "nowrap",
                                fontWeight: 600,
                              }}
                            >
                              {part}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: { xs: "0.58rem", sm: "0.72rem" },
                        color: "#263238",
                        lineHeight: 1.05,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {minorText}
                    </Typography>
                  )}
                </Box>
              )}
            </React.Fragment>
          );
        })}

        {!compact && (
          <Box
            sx={{
              position: "absolute",
              top: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              px: 1.2,
              py: 0.4,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(11,42,80,0.1)",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.85rem" },
                fontWeight: 700,
              }}
            >
              C (Do)
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: compact ? "32%" : "26%",
            height: compact ? "32%" : "26%",
            borderRadius: "50%",
            border: "1px solid rgba(11,42,80,0.1)",
            bgcolor: "rgba(255,255,255,0.96)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: compact
                ? { xs: "0.5rem", sm: "0.6rem" }
                : { xs: "0.58rem", sm: "0.72rem" },
              color: "text.secondary",
            }}
          >
            {compact ? "Menor rel." : "Menor relativo"}
          </Typography>
          <Typography
            sx={{
              fontSize: compact
                ? { xs: "0.68rem", sm: "0.8rem" }
                : { xs: "0.72rem", sm: "0.92rem" },
              fontWeight: 700,
              color: "#0b2a50",
            }}
          >
            {compact ? selectedRoot : "Círculo"}
          </Typography>
          <Typography
            sx={{
              fontSize: compact
                ? { xs: "0.58rem", sm: "0.72rem" }
                : { xs: "0.72rem", sm: "0.92rem" },
              fontWeight: 700,
              color: "#0b2a50",
            }}
          >
            {compact ? selectedInfo.relativeMinor : "de Quintas"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function RelativeMinorScalesStudy() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedMajor, setSelectedMajor] = useState(SCALE_GUIDE[0].major);
  const [focusRoot, setFocusRoot] = useState("C");
  const [question, setQuestion] = useState(() => createQuizQuestion());
  const [selectedOption, setSelectedOption] = useState("");

  const selectedScale = useMemo(
    () =>
      SCALE_GUIDE.find((row) => row.major === selectedMajor) || SCALE_GUIDE[0],
    [selectedMajor],
  );

  const answered = selectedOption.length > 0;
  const isCorrect = answered && selectedOption === question.answer;

  const handleNextQuestion = () => {
    setQuestion(createQuizQuestion());
    setSelectedOption("");
  };

  return (
    <Box sx={{ width: "100%", px: { xs: 1.5, sm: 2.5 }, py: 3 }}>
      <Stack spacing={2.5} maxWidth="1100px" mx="auto">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b2a50" }}>
            Estudio de Escalas: 6º grado y relativo menor
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <LightbulbOutlined sx={{ color: "#ef6c00" }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Explicación rápida
            </Typography>
          </Stack>
          <Typography sx={{ mb: 1 }}>
            La idea de tu pizarrón se resume así: el{" "}
            <strong>6º grado de una escala mayor</strong> te da la{" "}
            <strong>escala menor relativa</strong>.
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Ejemplo: Fa mayor = Fa Sol La Sib Do Re Mi. Su 6º grado es Re, por
            eso su relativo menor es Re menor.
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Ojo con tu duda: el grado depende de la tónica. En{" "}
            <strong>La mayor</strong>, <strong>Fa#</strong> es el{" "}
            <strong>6º grado</strong>. En <strong>Do mayor</strong>,{" "}
            <strong>Fa</strong> es el <strong>4º grado</strong>.
          </Typography>
          <Typography color="text.secondary">
            Mayor y relativo menor comparten la misma armadura (mismos
            sostenidos o bemoles), solo cambia el centro tonal.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
              Visualiza una escala y su 6º grado
            </Typography>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", md: 220 } }}
            >
              <InputLabel id="major-scale-select-label">
                Escala mayor
              </InputLabel>
              <Select
                labelId="major-scale-select-label"
                value={selectedMajor}
                label="Escala mayor"
                onChange={(event) => setSelectedMajor(event.target.value)}
              >
                {SCALE_GUIDE.map((row) => (
                  <MenuItem key={row.major} value={row.major}>
                    {row.major}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}
          >
            {selectedScale.notes.slice(0, 7).map((note, index) => (
              <Chip
                key={`${selectedScale.major}-${note}-${index}`}
                label={`${DEGREE_LABELS[index]} (${index + 1}). ${note}`}
                color={index === 5 ? "success" : "default"}
                variant={index === 5 ? "filled" : "outlined"}
              />
            ))}
          </Stack>

          <Typography>
            6º grado: <strong>{selectedScale.sixthDegree}</strong> | Relativo
            menor: <strong>{selectedScale.relativeMinor}</strong>
          </Typography>
          <Typography color="text.secondary">
            Armadura: {selectedScale.keySignature}
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Reloj del círculo de quintas (armaduras)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A la derecha (sentido horario desde C) aumentan los{" "}
            <strong>sostenidos</strong>. A la izquierda aumentan los{" "}
            <strong>bemoles</strong>.
          </Typography>

          <FormControl
            size="small"
            sx={{ minWidth: { xs: "100%", sm: 230 }, mb: 2 }}
          >
            <InputLabel id="focus-root-select-label">
              Tonalidad foco (reloj)
            </InputLabel>
            <Select
              labelId="focus-root-select-label"
              value={focusRoot}
              label="Tonalidad foco (reloj)"
              onChange={(event) => setFocusRoot(event.target.value)}
            >
              {CHROMATIC_ROOTS.map((root) => (
                <MenuItem key={root} value={root}>
                  {root}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <CircleOfFifthsClock selectedRoot={focusRoot} compact={isMobile} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            sx={{ mt: 2 }}
          >
            <Chip
              label="Derecha del reloj = sostenidos"
              sx={{ bgcolor: "rgba(21,101,192,0.08)", color: "#1565c0" }}
            />
            <Chip
              label="Izquierda del reloj = bemoles"
              sx={{ bgcolor: "rgba(142,36,170,0.08)", color: "#8e24aa" }}
            />
            <Chip
              label="Centro = menores relativos"
              sx={{ bgcolor: "rgba(69,90,100,0.08)", color: "#455a64" }}
            />
          </Stack>
          {isMobile && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              En móvil se muestra una versión compacta del reloj para evitar
              encimado de etiquetas.
            </Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Tabla de armaduras (como tu pizarrón)
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ overflowX: "auto" }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Subtabla 1: Bemoles
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Tonalidad</TableCell>
                    <TableCell align="center"># de bemoles</TableCell>
                    {SCALE_COLUMNS.map((degree, index) => (
                      <TableCell
                        key={`flat-head-${degree}`}
                        align="center"
                        sx={
                          index === 5
                            ? { backgroundColor: "#e8f5e9", fontWeight: 700 }
                            : null
                        }
                      >
                        {degree}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {FLAT_SUBTABLE.map((row) => (
                    <TableRow key={row.tonality}>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.tonality}
                      </TableCell>
                      <TableCell align="center">{row.count}</TableCell>
                      {renderScaleDegreeCells(row.majorScale, row.tonality)}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1", fontWeight: 600 }}
                    >
                      Do
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1" }}
                    >
                      0
                    </TableCell>
                    {renderScaleDegreeCells(
                      ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
                      "do-flat",
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ overflowX: "auto" }}>
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Subtabla 2: Sostenidos (empieza en Sol)
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Tonalidad</TableCell>
                    <TableCell align="center"># de sostenidos</TableCell>
                    {SCALE_COLUMNS.map((degree, index) => (
                      <TableCell
                        key={`sharp-head-${degree}`}
                        align="center"
                        sx={
                          index === 5
                            ? { backgroundColor: "#e8f5e9", fontWeight: 700 }
                            : null
                        }
                      >
                        {degree}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SHARP_SUBTABLE.map((row) => (
                    <TableRow key={row.tonality}>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.tonality}
                      </TableCell>
                      <TableCell align="center">{row.count}</TableCell>
                      {renderScaleDegreeCells(row.majorScale, row.tonality)}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1", fontWeight: 600 }}
                    >
                      Do
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1" }}
                    >
                      0
                    </TableCell>
                    {renderScaleDegreeCells(
                      ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
                      "do-sharp",
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Stack>
          <Box sx={{ mt: 1.25 }}>
            <Typography variant="body2" color="text.secondary">
              Nota: Do mayor tiene 0 alteraciones.
            </Typography>
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Práctica rápida (exam mode)
          </Typography>
          <Typography sx={{ mb: 1.5 }}>
            ¿Cuál es el relativo menor de <strong>{question.major}</strong>?
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            {question.options.map((option) => (
              <Button
                key={`${question.major}-${option}`}
                variant={selectedOption === option ? "contained" : "outlined"}
                color={selectedOption === option ? "primary" : "inherit"}
                onClick={() => setSelectedOption(option)}
              >
                {option}
              </Button>
            ))}
          </Stack>

          {answered && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" spacing={1} alignItems="center">
                {isCorrect ? (
                  <>
                    <CheckCircleOutline color="success" />
                    <Typography color="success.main" sx={{ fontWeight: 600 }}>
                      Correcto. {question.major} → {question.answer}
                    </Typography>
                  </>
                ) : (
                  <>
                    <CancelOutlined color="error" />
                    <Typography color="error.main" sx={{ fontWeight: 600 }}>
                      Casi. La respuesta correcta es {question.answer}.
                    </Typography>
                  </>
                )}
              </Stack>
            </>
          )}

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={handleNextQuestion}
          >
            Siguiente pregunta
          </Button>
        </Paper>
      </Stack>
    </Box>
  );
}
