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
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ArrowBack,
  CancelOutlined,
  CheckCircleOutline,
  LightbulbOutlined,
  PlayArrowRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import * as Tone from "tone";
import { getYamahaSampler, releaseYamahaVoices } from "../utils/yamahaSampler";

type RootLabel =
  | "C"
  | "Db"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "Gb"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B";
type WheelSide = "neutral" | "sharp" | "flat" | "mixed";

type ScaleGuideRow = {
  major: string;
  notes: string[];
  minorNotes: string[];
  sixthDegree: string;
  relativeMinor: string;
  keySignature: string;
};

type SubtableRow = {
  tonality: string;
  tonalityEn: string;
  count: number;
  majorScale: string[];
  relativeMinor: string;
};

type WheelSlot = {
  id: string;
  major: string;
  minor: string;
  signature: string;
  side: WheelSide;
  matchRoots: RootLabel[];
};

type QuizQuestionType =
  | "majorToMinor"
  | "minorToMajor"
  | "writeMajor"
  | "writeMinor"
  | "identifySixth";

type QuizQuestion = {
  type: QuizQuestionType;
  questionText: string;
  answer?: string;
  options?: string[];
  answerArray?: string[];
};

const DEGREE_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
const SCALE_COLUMNS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
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
] as const;

const ROOT_SIGNATURE_INFO: Record<RootLabel, { relativeMinor: string }> = {
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

const CIRCLE_WHEEL_SLOTS: WheelSlot[] = [
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

const FLAT_SUBTABLE: SubtableRow[] = [
  {
    tonality: "Fa",
    tonalityEn: "F",
    count: 1,
    majorScale: ["Fa", "Sol", "La", "Sib", "Do", "Re", "Mi", "Fa"],
    relativeMinor: "Re menor (Dm)",
  },
  {
    tonality: "Sib",
    tonalityEn: "Bb",
    count: 2,
    majorScale: ["Sib", "Do", "Re", "Mib", "Fa", "Sol", "La", "Sib"],
    relativeMinor: "Sol menor (Gm)",
  },
  {
    tonality: "Mib",
    tonalityEn: "Eb",
    count: 3,
    majorScale: ["Mib", "Fa", "Sol", "Lab", "Sib", "Do", "Re", "Mib"],
    relativeMinor: "Do menor (Cm)",
  },
  {
    tonality: "Lab",
    tonalityEn: "Ab",
    count: 4,
    majorScale: ["Lab", "Sib", "Do", "Reb", "Mib", "Fa", "Sol", "Lab"],
    relativeMinor: "Fa menor (Fm)",
  },
  {
    tonality: "Reb",
    tonalityEn: "Db",
    count: 5,
    majorScale: ["Reb", "Mib", "Fa", "Solb", "Lab", "Sib", "Do", "Reb"],
    relativeMinor: "Sib menor (Bbm)",
  },
  {
    tonality: "Solb",
    tonalityEn: "Gb",
    count: 6,
    majorScale: ["Solb", "Lab", "Sib", "Dob", "Reb", "Mib", "Fa", "Solb"],
    relativeMinor: "Mib menor (Ebm)",
  },
];

const SHARP_SUBTABLE: SubtableRow[] = [
  {
    tonality: "Sol",
    tonalityEn: "G",
    count: 1,
    majorScale: ["Sol", "La", "Si", "Do", "Re", "Mi", "Fa#", "Sol"],
    relativeMinor: "Mi menor (Em)",
  },
  {
    tonality: "Re",
    tonalityEn: "D",
    count: 2,
    majorScale: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#", "Re"],
    relativeMinor: "Si menor (Bm)",
  },
  {
    tonality: "La",
    tonalityEn: "A",
    count: 3,
    majorScale: ["La", "Si", "Do#", "Re", "Mi", "Fa#", "Sol#", "La"],
    relativeMinor: "Fa# menor (F#m)",
  },
  {
    tonality: "Mi",
    tonalityEn: "E",
    count: 4,
    majorScale: ["Mi", "Fa#", "Sol#", "La", "Si", "Do#", "Re#", "Mi"],
    relativeMinor: "Do# menor (C#m)",
  },
  {
    tonality: "Si",
    tonalityEn: "B",
    count: 5,
    majorScale: ["Si", "Do#", "Re#", "Mi", "Fa#", "Sol#", "La#", "Si"],
    relativeMinor: "Sol# menor (G#m)",
  },
  {
    tonality: "Fa#",
    tonalityEn: "F#",
    count: 6,
    majorScale: ["Fa#", "Sol#", "La#", "Si", "Do#", "Re#", "Mi#", "Fa#"],
    relativeMinor: "Re# menor (D#m)",
  },
  {
    tonality: "Do#",
    tonalityEn: "C#",
    count: 7,
    majorScale: ["Do#", "Re#", "Mi#", "Fa#", "Sol#", "La#", "Si#", "Do#"],
    relativeMinor: "La# menor (A#m)",
  },
];

const SCALE_GUIDE: ScaleGuideRow[] = [
  {
    major: "Do mayor (C)",
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
    minorNotes: ["La", "Si", "Do", "Re", "Mi", "Fa", "Sol", "La"],
    sixthDegree: "La",
    relativeMinor: "La menor (Am)",
    keySignature: "0 alteraciones",
  },
  {
    major: "Fa mayor (F)",
    notes: ["Fa", "Sol", "La", "Sib", "Do", "Re", "Mi", "Fa"],
    minorNotes: ["Re", "Mi", "Fa", "Sol", "La", "Sib", "Do", "Re"],
    sixthDegree: "Re",
    relativeMinor: "Re menor (Dm)",
    keySignature: "1 bemol (Sib)",
  },
  {
    major: "Sib mayor (Bb)",
    notes: ["Sib", "Do", "Re", "Mib", "Fa", "Sol", "La", "Sib"],
    minorNotes: ["Sol", "La", "Sib", "Do", "Re", "Mib", "Fa", "Sol"],
    sixthDegree: "Sol",
    relativeMinor: "Sol menor (Gm)",
    keySignature: "2 bemoles (Sib, Mib)",
  },
  {
    major: "Mib mayor (Eb)",
    notes: ["Mib", "Fa", "Sol", "Lab", "Sib", "Do", "Re", "Mib"],
    minorNotes: ["Do", "Re", "Mib", "Fa", "Sol", "Lab", "Sib", "Do"],
    sixthDegree: "Do",
    relativeMinor: "Do menor (Cm)",
    keySignature: "3 bemoles (Sib, Mib, Lab)",
  },
  {
    major: "Lab mayor (Ab)",
    notes: ["Lab", "Sib", "Do", "Reb", "Mib", "Fa", "Sol", "Lab"],
    minorNotes: ["Fa", "Sol", "Lab", "Sib", "Do", "Reb", "Mib", "Fa"],
    sixthDegree: "Fa",
    relativeMinor: "Fa menor (Fm)",
    keySignature: "4 bemoles (Sib, Mib, Lab, Reb)",
  },
  {
    major: "Reb mayor (Db)",
    notes: ["Reb", "Mib", "Fa", "Solb", "Lab", "Sib", "Do", "Reb"],
    minorNotes: ["Sib", "Do", "Reb", "Mib", "Fa", "Solb", "Lab", "Sib"],
    sixthDegree: "Sib",
    relativeMinor: "Sib menor (Bbm)",
    keySignature: "5 bemoles",
  },
  {
    major: "Solb mayor (Gb)",
    notes: ["Solb", "Lab", "Sib", "Dob", "Reb", "Mib", "Fa", "Solb"],
    minorNotes: ["Mib", "Fa", "Solb", "Lab", "Sib", "Dob", "Reb", "Mib"],
    sixthDegree: "Mib",
    relativeMinor: "Mib menor (Ebm)",
    keySignature: "6 bemoles",
  },
  {
    major: "Sol mayor (G)",
    notes: ["Sol", "La", "Si", "Do", "Re", "Mi", "Fa#", "Sol"],
    minorNotes: ["Mi", "Fa#", "Sol", "La", "Si", "Do", "Re", "Mi"],
    sixthDegree: "Mi",
    relativeMinor: "Mi menor (Em)",
    keySignature: "1 sostenido (Fa#)",
  },
  {
    major: "Re mayor (D)",
    notes: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#", "Re"],
    minorNotes: ["Si", "Do#", "Re", "Mi", "Fa#", "Sol", "La", "Si"],
    sixthDegree: "Si",
    relativeMinor: "Si menor (Bm)",
    keySignature: "2 sostenidos (Fa#, Do#)",
  },
  {
    major: "La mayor (A)",
    notes: ["La", "Si", "Do#", "Re", "Mi", "Fa#", "Sol#", "La"],
    minorNotes: ["Fa#", "Sol#", "La", "Si", "Do#", "Re", "Mi", "Fa#"],
    sixthDegree: "Fa#",
    relativeMinor: "Fa# menor (F#m)",
    keySignature: "3 sostenidos (Fa#, Do#, Sol#)",
  },
  {
    major: "Mi mayor (E)",
    notes: ["Mi", "Fa#", "Sol#", "La", "Si", "Do#", "Re#", "Mi"],
    minorNotes: ["Do#", "Re#", "Mi", "Fa#", "Sol#", "La", "Si", "Do#"],
    sixthDegree: "Do#",
    relativeMinor: "Do# menor (C#m)",
    keySignature: "4 sostenidos",
  },
  {
    major: "Si mayor (B)",
    notes: ["Si", "Do#", "Re#", "Mi", "Fa#", "Sol#", "La#", "Si"],
    minorNotes: ["Sol#", "La#", "Si", "Do#", "Re#", "Mi", "Fa#", "Sol#"],
    sixthDegree: "Sol#",
    relativeMinor: "Sol# menor (G#m)",
    keySignature: "5 sostenidos",
  },
];

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let idx = copy.length - 1; idx > 0; idx -= 1) {
    const j = Math.floor(Math.random() * (idx + 1));
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
  }
  return copy;
}

function createQuizQuestion(): QuizQuestion {
  const target = SCALE_GUIDE[Math.floor(Math.random() * SCALE_GUIDE.length)];
  const modeRand = Math.random();

  if (modeRand < 0.2) {
    return {
      type: "writeMajor",
      questionText: `Escribe las 7 notas de la escala de ${target.major} en orden:`,
      answerArray: target.notes.slice(0, 7),
    };
  } else if (modeRand < 0.4) {
    return {
      type: "writeMinor",
      questionText: `Escribe las 7 notas de la escala de ${target.relativeMinor} natural en orden:`,
      answerArray: target.minorNotes.slice(0, 7),
    };
  } else if (modeRand < 0.6) {
    return {
      type: "identifySixth",
      questionText: `¿Cuál es el 6º grado de ${target.major}?`,
      answer: target.sixthDegree,
    };
  } else if (modeRand < 0.8) {
    const distractors = shuffle(
      SCALE_GUIDE.filter(
        (row) => row.relativeMinor !== target.relativeMinor,
      ).map((row) => row.relativeMinor),
    ).slice(0, 3);

    return {
      type: "majorToMinor",
      questionText: `¿Cuál es el relativo menor de ${target.major}?`,
      answer: target.relativeMinor,
      options: shuffle([target.relativeMinor, ...distractors]),
    };
  } else {
    const distractors = shuffle(
      SCALE_GUIDE.filter((row) => row.major !== target.major).map(
        (row) => row.major,
      ),
    ).slice(0, 3);

    return {
      type: "minorToMajor",
      questionText: `¿Cuál es la escala mayor relativa de ${target.relativeMinor}?`,
      answer: target.major,
      options: shuffle([target.major, ...distractors]),
    };
  }
}

function renderScaleDegreeCells(notes: string[], rowKeyPrefix: string) {
  return notes.slice(0, 7).map((note, index) => (
    <TableCell
      key={`${rowKeyPrefix}-deg-${index}`}
      align="center"
      sx={index === 5 ? { backgroundColor: "#f1f8e9", fontWeight: 700 } : null}
    >
      {note}
    </TableCell>
  ));
}

function polarPosition(angleDeg: number, radiusPercent: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(radians) * radiusPercent}%`,
    top: `${50 + Math.sin(radians) * radiusPercent}%`,
  };
}

function sideColor(side: WheelSide) {
  if (side === "sharp") return "#1565c0";
  if (side === "flat") return "#8e24aa";
  if (side === "mixed") return "#ef6c00";
  return "#455a64";
}

function compactLabel(value: string) {
  return value.replaceAll(" / ", "/");
}

function tokenAccent(token: string) {
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

function splitSlashParts(value: string) {
  return value.split(" / ");
}

function CircleOfFifthsClock({
  selectedRoot,
  compact = false,
}: {
  selectedRoot: RootLabel;
  compact?: boolean;
}) {
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
  const [selectedMajor, setSelectedMajor] = useState<string>(
    SCALE_GUIDE[0].major,
  );
  const [focusRoot, setFocusRoot] = useState<RootLabel>("C");
  const [question, setQuestion] = useState<QuizQuestion>(() => createQuizQuestion());
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [scaleInputs, setScaleInputs] = useState<string[]>(Array(7).fill(""));
  const [textInput, setTextInput] = useState<string>("");
  const [isEvaluated, setIsEvaluated] = useState(false);

  const selectedScale = useMemo(
    () =>
      SCALE_GUIDE.find((row) => row.major === selectedMajor) || SCALE_GUIDE[0],
    [selectedMajor],
  );

  const isMultipleChoice =
    question.type === "majorToMinor" || question.type === "minorToMajor";
  const isWriteScale =
    question.type === "writeMajor" || question.type === "writeMinor";
  const isIdentifySixth = question.type === "identifySixth";

  const answered = isEvaluated;
  let isCorrect = false;

  if (isEvaluated) {
    if (isMultipleChoice) {
      isCorrect = selectedOption === question.answer;
    } else if (isWriteScale) {
      isCorrect = scaleInputs.every(
        (val, i) =>
          val.trim().toLowerCase() ===
          (question.answerArray?.[i] || "").toLowerCase(),
      );
    } else if (isIdentifySixth) {
      isCorrect =
        textInput.trim().toLowerCase() === (question.answer || "").toLowerCase();
    }
  }

  const playScale = async (notesToPlay: string[]) => {
    // Basic mapping from notation to Tone.js friendly format
    // Assumes C4 as starting octave for simplicity
    // Doing a naive mapping just to demonstrate the sound
    releaseYamahaVoices();
    const sampler = await getYamahaSampler();
    if (!sampler) return;
    await Tone.start();

    // We need to map syllables to pitch+octave (e.g. Do -> C4, Re -> D4)
    // For a robust app this needs a better mapping, but for quick play we approximate:
    const noteMap: Record<string, string> = {
      Do: "C",
      "Do#": "C#",
      Reb: "Db",
      Re: "D",
      "Re#": "D#",
      Mib: "Eb",
      Mi: "E",
      Fa: "F",
      "Fa#": "F#",
      Solb: "Gb",
      Sol: "G",
      "Sol#": "G#",
      Lab: "Ab",
      La: "A",
      "La#": "A#",
      Sib: "Bb",
      Si: "B",
      Dob: "B",
      "Mi#": "F",
      Fab: "E",
    };

    let currentOctave = 4;
    let baseNotes = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
    let lastNoteIndex = -1;

    let time = Tone.now() + 0.1;
    notesToPlay.forEach((noteStr) => {
      // clean up basic note name
      const cleanNote = noteStr;
      const baseNoteMatch = baseNotes.find((bn) => cleanNote.startsWith(bn));
      if (baseNoteMatch) {
        let nIndex = baseNotes.indexOf(baseNoteMatch);
        if (lastNoteIndex !== -1 && nIndex < lastNoteIndex) {
          currentOctave++;
        }
        lastNoteIndex = nIndex;
      }

      const pitch = noteMap[noteStr] || noteStr;

      sampler.triggerAttackRelease(`${pitch}${currentOctave}`, "4n", time);
      time += 0.5; // half second per note
    });
  };

  const handleNextQuestion = () => {
    setQuestion(createQuizQuestion());
    setSelectedOption("");
    setScaleInputs(Array(7).fill(""));
    setTextInput("");
    setIsEvaluated(false);
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
          <Typography sx={{ mb: 1 }}>
            Mayor y relativo menor comparten la misma armadura (mismos
            sostenidos o bemoles), solo cambia el centro tonal, por lo que los
            semitonos caen en lugares distintos dando ese sonido alegre (mayor)
            vs melancólico (menor).
          </Typography>
          <Box
            sx={{
              pl: 2,
              borderLeft: "3px solid #ef6c00",
              bgcolor: "rgba(239, 108, 0, 0.04)",
              p: 1.5,
              borderRadius: "0 8px 8px 0",
              mt: 1.5,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Estructura Mayor: T - T - st - T - T - T - st
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
              Estructura Menor N.: T - st - T - T - st - T - T
            </Typography>
          </Box>
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

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "primary.main" }}>
              Escala {selectedScale.major}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<PlayArrowRounded />}
              onClick={() => playScale(selectedScale.notes)}
              sx={{ borderRadius: 6, textTransform: "none" }}
            >
              Escuchar
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
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

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
              Escala {selectedScale.relativeMinor} (Menor Natural)
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              startIcon={<PlayArrowRounded />}
              onClick={() => playScale(selectedScale.minorNotes)}
              sx={{ borderRadius: 6, textTransform: "none" }}
            >
              Escuchar
            </Button>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
          >
            {selectedScale.minorNotes.slice(0, 7).map((note, index) => (
              <Chip
                key={`minor-${selectedScale.relativeMinor}-${note}-${index}`}
                label={`${DEGREE_LABELS[index]} (${index + 1}). ${note}`}
                color={index === 0 ? "success" : "default"}
                variant={index === 0 ? "filled" : "outlined"}
              />
            ))}
          </Stack>

          <Typography>
            La tónica menor es el <strong>6º grado</strong> de la mayor (
            <strong>{selectedScale.sixthDegree}</strong>).
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
              onChange={(event) =>
                setFocusRoot(event.target.value as RootLabel)
              }
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
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Relativo Menor
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1", fontWeight: 600 }}
                    >
                      Do (C)
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
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1", fontWeight: 600 }}
                    >
                      La menor (Am)
                    </TableCell>
                  </TableRow>
                  {FLAT_SUBTABLE.map((row) => (
                    <TableRow key={row.tonality}>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.tonality} ({row.tonalityEn})
                      </TableCell>
                      <TableCell align="center">{row.count}</TableCell>
                      {renderScaleDegreeCells(row.majorScale, row.tonality)}
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.relativeMinor}
                      </TableCell>
                    </TableRow>
                  ))}
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
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Relativo Menor
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1", fontWeight: 600 }}
                    >
                      Do (C)
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
                    <TableCell
                      align="center"
                      sx={{ backgroundColor: "#fff8e1", fontWeight: 600 }}
                    >
                      La menor (Am)
                    </TableCell>
                  </TableRow>
                  {SHARP_SUBTABLE.map((row) => (
                    <TableRow key={row.tonality}>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.tonality} ({row.tonalityEn})
                      </TableCell>
                      <TableCell align="center">{row.count}</TableCell>
                      {renderScaleDegreeCells(row.majorScale, row.tonality)}
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {row.relativeMinor}
                      </TableCell>
                    </TableRow>
                  ))}
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
          <Typography sx={{ mb: 1.5 }}>{question.questionText}</Typography>

          {isMultipleChoice && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              {(question.options || []).map((option) => (
                <Button
                  key={`${question.questionText}-${option}`}
                  variant={selectedOption === option ? "contained" : "outlined"}
                  color={selectedOption === option ? "primary" : "inherit"}
                  onClick={() => {
                    if (isEvaluated) return;
                    setSelectedOption(option);
                    setIsEvaluated(true);
                  }}
                >
                  {option}
                </Button>
              ))}
            </Stack>
          )}

          {isWriteScale && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Array.from({ length: 7 }).map((_, i) => (
                  <TextField
                    key={`scale-input-${i}`}
                    label={DEGREE_LABELS[i]}
                    size="small"
                    value={scaleInputs[i]}
                    onChange={(e) => {
                      const newInputs = [...scaleInputs];
                      newInputs[i] = e.target.value;
                      setScaleInputs(newInputs);
                    }}
                    sx={{ width: { xs: "calc(33.33% - 8px)", sm: 80 } }}
                    InputProps={{
                      readOnly: isEvaluated,
                    }}
                    color={
                      isEvaluated
                        ? scaleInputs[i].trim().toLowerCase() ===
                          (question.answerArray?.[i] || "").toLowerCase()
                          ? "success"
                          : "error"
                        : "primary"
                    }
                    focused={isEvaluated}
                  />
                ))}
              </Stack>
              {!isEvaluated && (
                <Button
                  variant="contained"
                  onClick={() => setIsEvaluated(true)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Calificar escala
                </Button>
              )}
            </Stack>
          )}

          {isIdentifySixth && (
            <Stack spacing={2} direction="row" alignItems="center">
              <TextField
                size="small"
                label="6º grado"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                InputProps={{ readOnly: isEvaluated }}
                color={
                  isEvaluated
                    ? textInput.trim().toLowerCase() ===
                      (question.answer || "").toLowerCase()
                      ? "success"
                      : "error"
                    : "primary"
                }
                focused={isEvaluated}
              />
              {!isEvaluated && (
                <Button
                  variant="contained"
                  onClick={() => setIsEvaluated(true)}
                >
                  Calificar
                </Button>
              )}
            </Stack>
          )}

          {answered && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" spacing={1} alignItems="center">
                {isCorrect ? (
                  <>
                    <CheckCircleOutline color="success" />
                    <Typography color="success.main" sx={{ fontWeight: 600 }}>
                      ¡Correcto!
                    </Typography>
                  </>
                ) : (
                  <>
                    <CancelOutlined color="error" />
                    <Stack>
                      <Typography color="error.main" sx={{ fontWeight: 600 }}>
                        Casi. La respuesta correcta es:
                      </Typography>
                      {isMultipleChoice && (
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {question.answer}
                        </Typography>
                      )}
                      {isIdentifySixth && (
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {question.answer}
                        </Typography>
                      )}
                      {isWriteScale && (
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {question.answerArray?.join(" - ")}
                        </Typography>
                      )}
                    </Stack>
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
