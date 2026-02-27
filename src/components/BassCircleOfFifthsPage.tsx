import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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
import { ArrowBack, ExpandMore, Pause, PlayArrow } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getYamahaSampler, releaseYamahaVoices } from "../utils/yamahaSampler";
import AlwaysOnTuner from "./AlwaysOnTuner";
import * as Tone from "tone";

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

type RootLabel = (typeof CHROMATIC_ROOTS)[number];
type Direction = "ascending" | "descending";
type FigureValue = "q" | "h";

const ROOT_TO_INDEX: Record<RootLabel, number> = CHROMATIC_ROOTS.reduce(
  (acc, root, idx) => {
    acc[root] = idx;
    return acc;
  },
  {} as Record<RootLabel, number>,
);

const BASS_OCTAVE_NOTE_MAP: Record<RootLabel, string> = {
  C: "C2",
  Db: "Db2",
  D: "D2",
  Eb: "Eb2",
  E: "E2",
  F: "F2",
  Gb: "Gb2",
  G: "G2",
  Ab: "Ab1",
  A: "A1",
  Bb: "Bb1",
  B: "B1",
};

const BASS_POSITION_MAP: Record<RootLabel, { main: string; alt: string }> = {
  C: { main: "A-3", alt: "E-8" },
  Db: { main: "A-4", alt: "E-9" },
  D: { main: "D-0 / A-5", alt: "E-10" },
  Eb: { main: "D-1", alt: "A-6" },
  E: { main: "E-0 / D-2", alt: "A-7" },
  F: { main: "E-1 / D-3", alt: "A-8" },
  Gb: { main: "E-2 / D-4", alt: "A-9" },
  G: { main: "E-3 / D-5", alt: "A-10" },
  Ab: { main: "E-4 / D-6", alt: "A-11" },
  A: { main: "A-0 / E-5", alt: "D-7" },
  Bb: { main: "A-1 / E-6", alt: "D-8" },
  B: { main: "A-2 / E-7", alt: "D-9" },
};

const FIGURE_OPTIONS = [
  { value: "q" as const, label: "Negra", beats: 1 },
  { value: "h" as const, label: "Blanca", beats: 2 },
];

const FIGURE_TO_BEATS: Record<FigureValue, number> = {
  q: 1,
  h: 2,
};

const DIRECTION_START_OPTIONS: Record<Direction, readonly RootLabel[]> = {
  ascending: ["C", "G", "D", "A", "E", "B", "Gb"],
  descending: ["C", "F", "Bb", "Eb", "Ab", "Db", "Gb"],
};

const ORDER_OF_SHARPS = ["F#", "C#", "G#", "D#", "A#", "E#", "B#"] as const;
const ORDER_OF_FLATS = ["Bb", "Eb", "Ab", "Db", "Gb", "Cb", "Fb"] as const;

type SignatureType = "none" | "sharp" | "flat";

type SignatureInfo = {
  major: string;
  relativeMinor: string;
  type: SignatureType;
  count: number;
  accidentals: readonly string[];
  signatureLabel: string;
  note?: string;
};

type WheelSlot = {
  id: string;
  major: string;
  minor: string;
  signature: string;
  side: "neutral" | "sharp" | "flat" | "mixed";
  matchRoots: readonly RootLabel[];
};

const ROOT_SIGNATURE_INFO: Record<RootLabel, SignatureInfo> = {
  C: {
    major: "C mayor",
    relativeMinor: "Am",
    type: "none",
    count: 0,
    accidentals: [],
    signatureLabel: "0 alteraciones",
  },
  G: {
    major: "G mayor",
    relativeMinor: "Em",
    type: "sharp",
    count: 1,
    accidentals: ORDER_OF_SHARPS.slice(0, 1),
    signatureLabel: "1 sostenido",
  },
  D: {
    major: "D mayor",
    relativeMinor: "Bm",
    type: "sharp",
    count: 2,
    accidentals: ORDER_OF_SHARPS.slice(0, 2),
    signatureLabel: "2 sostenidos",
  },
  A: {
    major: "A mayor",
    relativeMinor: "F#m",
    type: "sharp",
    count: 3,
    accidentals: ORDER_OF_SHARPS.slice(0, 3),
    signatureLabel: "3 sostenidos",
  },
  E: {
    major: "E mayor",
    relativeMinor: "C#m",
    type: "sharp",
    count: 4,
    accidentals: ORDER_OF_SHARPS.slice(0, 4),
    signatureLabel: "4 sostenidos",
  },
  B: {
    major: "B mayor",
    relativeMinor: "G#m",
    type: "sharp",
    count: 5,
    accidentals: ORDER_OF_SHARPS.slice(0, 5),
    signatureLabel: "5 sostenidos",
    note: "Enarmónica: Cb mayor = 7 bemoles.",
  },
  F: {
    major: "F mayor",
    relativeMinor: "Dm",
    type: "flat",
    count: 1,
    accidentals: ORDER_OF_FLATS.slice(0, 1),
    signatureLabel: "1 bemol",
  },
  Bb: {
    major: "Bb mayor",
    relativeMinor: "Gm",
    type: "flat",
    count: 2,
    accidentals: ORDER_OF_FLATS.slice(0, 2),
    signatureLabel: "2 bemoles",
  },
  Eb: {
    major: "Eb mayor",
    relativeMinor: "Cm",
    type: "flat",
    count: 3,
    accidentals: ORDER_OF_FLATS.slice(0, 3),
    signatureLabel: "3 bemoles",
  },
  Ab: {
    major: "Ab mayor",
    relativeMinor: "Fm",
    type: "flat",
    count: 4,
    accidentals: ORDER_OF_FLATS.slice(0, 4),
    signatureLabel: "4 bemoles",
  },
  Db: {
    major: "Db mayor",
    relativeMinor: "Bbm",
    type: "flat",
    count: 5,
    accidentals: ORDER_OF_FLATS.slice(0, 5),
    signatureLabel: "5 bemoles",
    note: "Enarmónica: C# mayor = 7 sostenidos.",
  },
  Gb: {
    major: "Gb mayor",
    relativeMinor: "Ebm",
    type: "flat",
    count: 6,
    accidentals: ORDER_OF_FLATS.slice(0, 6),
    signatureLabel: "6 bemoles",
    note: "Enarmónica: F# mayor = 6 sostenidos.",
  },
};

const MAJOR_SCALE_NOTES_BY_ROOT: Record<RootLabel, readonly string[]> = {
  C: ["C", "D", "E", "F", "G", "A", "B", "C"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C", "Db"],
  D: ["D", "E", "F#", "G", "A", "B", "C#", "D"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D", "Eb"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#", "E"],
  F: ["F", "G", "A", "Bb", "C", "D", "E", "F"],
  Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "F", "Gb"],
  G: ["G", "A", "B", "C", "D", "E", "F#", "G"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G", "Ab"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#", "A"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A", "Bb"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#", "B"],
};

const CIRCLE_WHEEL_SLOTS: readonly WheelSlot[] = [
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
] as const;

function polarPosition(angleDeg: number, radiusPercent: number) {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + Math.cos(radians) * radiusPercent}%`,
    top: `${50 + Math.sin(radians) * radiusPercent}%`,
  };
}

function sideColor(side: WheelSlot["side"]) {
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
                            ...(compact && {
                              fontSize: "0.56rem",
                            }),
                            fontWeight: isSelected ? 700 : 600,
                            color: useTokenBg
                              ? accent.color
                              : isSelected
                                ? color
                                : "#111",
                            lineHeight: compact ? 1.0 : 1.1,
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
                            ...(compact && {
                              fontSize: "0.5rem",
                            }),
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

function buildCircleSequence(
  startRoot: RootLabel,
  direction: Direction,
  steps = 12,
): RootLabel[] {
  const startIdx = ROOT_TO_INDEX[startRoot];
  const jump = direction === "ascending" ? 7 : -7;
  return Array.from({ length: steps }, (_, i) => {
    const idx = (startIdx + i * jump + 1200) % 12;
    return CHROMATIC_ROOTS[idx];
  });
}

function ScalePyramidPanel({
  title,
  caption,
  roots,
  focusRoot,
  noteOrder,
  mirrorSteps = false,
  isMobile = false,
}: {
  title: string;
  caption: string;
  roots: RootLabel[];
  focusRoot: RootLabel;
  noteOrder: "ascending" | "descending";
  mirrorSteps?: boolean;
  isMobile?: boolean;
}) {
  const orderedRoots = roots.slice(0, 12);
  const indentStep = isMobile ? 6 : 10;
  const maxIndent = Math.max(0, orderedRoots.length - 1) * indentStep;
  const rowAccent =
    noteOrder === "ascending" ? "rgba(21,101,192," : "rgba(142,36,170,";

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.25, display: "block" }}>
        {caption}
      </Typography>

      <Stack spacing={0.75}>
        {orderedRoots.map((root, rowIdx) => {
          const rawNotes = [...MAJOR_SCALE_NOTES_BY_ROOT[root]];
          const notes =
            noteOrder === "ascending" ? rawNotes : rawNotes.slice().reverse();
          const indent = mirrorSteps
            ? maxIndent - rowIdx * indentStep
            : rowIdx * indentStep;
          const isFocusedRow = root === focusRoot;
          const rowTintAlpha = 0.03 + rowIdx * 0.01;

          return (
            <Box
              key={`${title}-${root}-${rowIdx}`}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "128px 1fr" },
                gap: 0.75,
                alignItems: "start",
                p: 0.75,
                borderRadius: 2,
                border: isFocusedRow
                  ? "1px solid rgba(25,118,210,0.35)"
                  : "1px solid rgba(11,42,80,0.08)",
                backgroundColor: isFocusedRow
                  ? "rgba(25,118,210,0.05)"
                  : "rgba(255,255,255,0.8)",
              }}
            >
              <Box sx={{ minWidth: 0, pt: { sm: 0.1 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "0.85rem" }}
                >
                  {rowIdx + 1}. {root} mayor
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
                  {noteOrder === "ascending" ? "1 → 8" : "8 → 1"}
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                  overflowX: "auto",
                  pl: `${indent}px`,
                  pr: 0.25,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                    width: "fit-content",
                    maxWidth: "100%",
                    p: 0.5,
                    borderRadius: 1.5,
                    border: "1px dashed rgba(11,42,80,0.12)",
                    backgroundColor: `${rowAccent}${rowTintAlpha})`,
                    justifyContent: "flex-start",
                  }}
                >
                  {notes.map((note, noteIdx) => {
                    const accent = tokenAccent(note);
                    const degreeLabel =
                      noteOrder === "ascending" ? noteIdx + 1 : notes.length - noteIdx;
                    return (
                      <Chip
                        key={`pyramid-${title}-${root}-${noteIdx}-${note}`}
                        label={`${degreeLabel}. ${note}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          color: accent.color,
                          backgroundColor: accent.bg,
                          border: `1px solid ${accent.border}`,
                          height: 28,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1.25, display: "block" }}
      >
        Escalonado visual: cada fila se desplaza para que notes cómo cambian
        las alteraciones al avanzar por el ciclo.
      </Typography>
    </Paper>
  );
}

export default function BassCircleOfFifthsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [startRoot, setStartRoot] = useState<RootLabel>("C");
  const [focusRoot, setFocusRoot] = useState<RootLabel>("C");
  const [direction, setDirection] = useState<Direction>("ascending");
  const [steps, setSteps] = useState(7);
  const [bpm, setBpm] = useState(80);
  const [figure, setFigure] = useState<FigureValue>("q");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timerRefs = useRef<number[]>([]);
  const isPlayingRef = useRef(false);

  const sequence = useMemo(
    () => buildCircleSequence(startRoot, direction, steps),
    [startRoot, direction, steps],
  );
  const availableStartRoots = useMemo(
    () => DIRECTION_START_OPTIONS[direction],
    [direction],
  );

  const playbackNotes = useMemo(
    () => sequence.map((root) => BASS_OCTAVE_NOTE_MAP[root]),
    [sequence],
  );
  const ascendingPyramidRoots = useMemo(
    () => buildCircleSequence(startRoot, "ascending", 12),
    [startRoot],
  );
  const descendingPyramidRoots = useMemo(
    () => buildCircleSequence(startRoot, "descending", 12),
    [startRoot],
  );

  useEffect(() => {
    return () => {
      timerRefs.current.forEach((id) => window.clearTimeout(id));
      releaseYamahaVoices();
    };
  }, []);

  useEffect(() => {
    if (!availableStartRoots.includes(startRoot)) {
      setStartRoot("C");
    }
  }, [availableStartRoots, startRoot]);

  useEffect(() => {
    setFocusRoot(startRoot);
  }, [startRoot]);

  useEffect(() => {
    if (!sequence.includes(focusRoot)) {
      setFocusRoot(sequence[0] ?? startRoot);
    }
  }, [sequence, focusRoot, startRoot]);

  const stopPlayback = () => {
    timerRefs.current.forEach((id) => window.clearTimeout(id));
    timerRefs.current = [];
    releaseYamahaVoices();
    isPlayingRef.current = false;
    setIsPlaying(false);
    setActiveIndex(null);
  };

  const handlePlay = async () => {
    stopPlayback();
    if (!playbackNotes.length) return;

    const sampler = await getYamahaSampler();
    await Tone.start();

    isPlayingRef.current = true;
    setIsPlaying(true);

    const clampedBpm = Math.max(30, Math.min(220, bpm));
    const secondsPerBeat = 60 / clampedBpm;
    const noteSeconds = secondsPerBeat * FIGURE_TO_BEATS[figure];

    let offset = 0;
    playbackNotes.forEach((note, idx) => {
      const timerId = window.setTimeout(() => {
        if (!isPlayingRef.current) return;
        setActiveIndex(idx);
        sampler.triggerAttackRelease(note, Math.max(0.2, noteSeconds * 0.9));
      }, offset * 1000);
      timerRefs.current.push(timerId);
      offset += noteSeconds;
    });

    const endTimer = window.setTimeout(
      () => {
        stopPlayback();
      },
      offset * 1000 + 50,
    );
    timerRefs.current.push(endTimer);
  };

  const handleStepsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (Number.isNaN(next)) return;
    setSteps(Math.max(4, Math.min(12, next)));
  };

  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (Number.isNaN(next)) return;
    setBpm(Math.max(30, Math.min(220, next)));
  };

  const titleDirection =
    direction === "ascending"
      ? "Ascendente (por quintas)"
      : "Descendente (por quintas)";
  const selectedSignature = ROOT_SIGNATURE_INFO[focusRoot];
  const focusScaleNotes = MAJOR_SCALE_NOTES_BY_ROOT[focusRoot];
  const selectedSideLabel =
    selectedSignature.type === "sharp"
      ? "Lado derecho del reloj (sostenidos)"
      : selectedSignature.type === "flat"
        ? "Lado izquierdo del reloj (bemoles)"
        : "Centro del reloj (sin alteraciones)";

  return (
    <Box sx={{ width: "100%", px: { xs: 1, sm: 2, md: 4 }, py: 3 }}>
      <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
          >
            Volver al menú
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#0b2a50",
              fontSize: { xs: "1.35rem", sm: "2.125rem" },
            }}
          >
            Círculo de Quintas para Bajo
          </Typography>
        </Stack>

        <Accordion
          defaultExpanded
          disableGutters
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid rgba(11,42,80,0.12)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              background:
                "linear-gradient(135deg, rgba(64,126,255,0.08) 0%, rgba(0,137,123,0.08) 100%)",
              minHeight: 56,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: "#0b2a50" }}>
              Contexto (principiantes)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={1.2}>
              <Typography variant="body2" color="text.secondary">
                El círculo de quintas es un mapa que te ayuda a entender cómo se
                relacionan las tonalidades. Si avanzas hacia la derecha del
                reloj, cada paso agrega un sostenido; si vas hacia la izquierda,
                cada paso agrega un bemol.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Para bajo, esto sirve muchísimo porque muchas progresiones
                comunes se mueven por cuartas/quintas (por ejemplo: II–V–I,
                turnarounds, intros y finales). Practicar el ciclo te ayuda a
                memorizar raíces y cambios de posición en el mástil.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En esta vista:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1) Arriba configuras dirección, tonalidad inicial, pasos, figura
                y BPM.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2) La secuencia muestra las raíces que vas a tocar.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3) El reloj te enseña en qué lado están las tonalidades con
                sostenidos (derecha) y con bemoles (izquierda).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4) La armadura de la tonalidad te dice exactamente qué notas se
                alteran.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Consejo para empezar: usa 4 o 6 pasos, negras a 60-80 BPM, y
                toca solo raíces con buen pulso. Luego aumenta a 12 pasos para
                cerrar el círculo completo.
              </Typography>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(280px, 0.8fr) minmax(0, 1.2fr)",
            },
          }}
        >
          <Paper
            variant="outlined"
            sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Configuración
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Dirección</InputLabel>
              <Select
                label="Dirección"
                value={direction}
                onChange={(e) => setDirection(e.target.value as Direction)}
              >
                <MenuItem value="ascending">Ascendente (quintas)</MenuItem>
                <MenuItem value="descending">Descendente (quintas)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Tonalidad inicial</InputLabel>
              <Select
                label="Tonalidad inicial"
                value={startRoot}
                onChange={(e: SelectChangeEvent<RootLabel>) =>
                  setStartRoot(e.target.value as RootLabel)
                }
              >
                {availableStartRoots.map((root) => (
                  <MenuItem key={root} value={root}>
                    {root}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              {direction === "ascending"
                ? "Ascendente: se muestran tonalidades del lado de sostenidos (derecha del reloj)."
                : "Descendente: se muestran tonalidades del lado de bemoles (izquierda del reloj)."}
            </Typography>

            <FormControl fullWidth size="small">
              <InputLabel>Escala a estudiar</InputLabel>
              <Select
                label="Escala a estudiar"
                value={focusRoot}
                onChange={(e: SelectChangeEvent<RootLabel>) =>
                  setFocusRoot(e.target.value as RootLabel)
                }
              >
                {sequence.map((root, idx) => (
                  <MenuItem key={`focus-${root}-${idx}`} value={root}>
                    {idx + 1}. {root}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Esta tonalidad se usa para el reloj y la armadura (sección
              teórica).
            </Typography>

            <TextField
              label="Pasos del ciclo"
              type="number"
              size="small"
              value={steps}
              onChange={handleStepsChange}
              inputProps={{ min: 4, max: 12 }}
              helperText="Entre 4 y 12. Usa 12 para completar el ciclo."
            />

            <FormControl fullWidth size="small">
              <InputLabel>Figura</InputLabel>
              <Select
                label="Figura"
                value={figure}
                onChange={(e) => setFigure(e.target.value as FigureValue)}
              >
                {FIGURE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="BPM"
              type="number"
              size="small"
              value={bpm}
              onChange={handleBpmChange}
              inputProps={{ min: 30, max: 220 }}
            />

            <Button
              variant="contained"
              color="success"
              startIcon={isPlaying ? <Pause /> : <PlayArrow />}
              onClick={isPlaying ? stopPlayback : handlePlay}
              fullWidth
            >
              {isPlaying ? "Detener" : "Reproducir raíces"}
            </Button>

            <Typography variant="body2" color="text.secondary">
              Enfoque para bajo: practica raíces del ciclo con digitación
              estable, primero a negras y luego a blancas manteniendo pulso y
              precisión de ataque.
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Secuencia actual
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {titleDirection} desde {startRoot}. Registro sugerido para bajo:{" "}
              {playbackNotes.join(" · ")}.
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {sequence.map((root, idx) => {
                const isActive = activeIndex === idx;
                const isFocused = focusRoot === root;
                return (
                  <Chip
                    key={`${root}-${idx}`}
                    label={`${idx + 1}. ${root}`}
                    color={
                      isActive ? "success" : isFocused ? "primary" : "default"
                    }
                    variant={isActive ? "filled" : "outlined"}
                    sx={{
                      mb: 1,
                      fontWeight: isActive ? 700 : 500,
                      borderWidth: isActive ? 2 : 1,
                      ...(isFocused &&
                        !isActive && {
                          borderColor: "primary.main",
                          backgroundColor: "rgba(25,118,210,0.06)",
                        }),
                    }}
                  />
                );
              })}
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Azul = tonalidad seleccionada para estudio. Verde = nota en
              reproducción.
            </Typography>

            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: "1px dashed rgba(11,42,80,0.15)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Notas que vas a tocar en {focusRoot} mayor (1–8)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {focusScaleNotes.map((note, idx) => {
                  const accent = tokenAccent(note);
                  return (
                    <Chip
                      key={`scale-note-${focusRoot}-${idx}-${note}`}
                      label={`${idx + 1}. ${note}`}
                      size="small"
                      sx={{
                        mb: 1,
                        fontWeight: 700,
                        color: accent.color,
                        backgroundColor: accent.bg,
                        border: `1px solid ${accent.border}`,
                      }}
                    />
                  );
                })}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Tócalas en orden ascendente y luego descendente, manteniendo la
                misma digitación base cuando sea posible.
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: "1px dashed rgba(11,42,80,0.15)",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Afinador de bajo (referencia rápida)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1.25 }}
              >
                Úsalo aquí mismo mientras practicas la secuencia y la escala
                seleccionada.
              </Typography>
              <AlwaysOnTuner />
            </Box>
          </Paper>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", xl: "1.2fr 0.8fr" },
          }}
        >
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Reloj del círculo de quintas (armaduras)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A la derecha (sentido horario desde C) aumentan los{" "}
              <strong>sostenidos</strong>. A la izquierda aumentan los{" "}
              <strong>bemoles</strong>.
            </Typography>

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

          <Stack spacing={2}>
            <Paper
              variant="outlined"
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.25 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Armadura de {focusRoot}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSignature.major} · relativo menor:{" "}
                {selectedSignature.relativeMinor}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={selectedSignature.signatureLabel}
                  color={
                    selectedSignature.type === "sharp"
                      ? "primary"
                      : selectedSignature.type === "flat"
                        ? "secondary"
                        : "default"
                  }
                  sx={{ mb: 1 }}
                />
                <Chip
                  variant="outlined"
                  label={selectedSideLabel}
                  sx={{ mb: 1 }}
                />
              </Stack>

              {selectedSignature.accidentals.length > 0 ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Alteraciones de la armadura:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedSignature.accidentals.map((acc) => (
                      <Chip
                        key={`sig-${focusRoot}-${acc}`}
                        label={acc}
                        size="small"
                        sx={{
                          mb: 1,
                          fontWeight: 700,
                          bgcolor:
                            selectedSignature.type === "sharp"
                              ? "rgba(21,101,192,0.08)"
                              : "rgba(142,36,170,0.08)",
                          color:
                            selectedSignature.type === "sharp"
                              ? "#1565c0"
                              : "#8e24aa",
                        }}
                      />
                    ))}
                  </Stack>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  C mayor / A menor no llevan sostenidos ni bemoles en la
                  armadura.
                </Typography>
              )}

              {selectedSignature.note && (
                <Typography variant="body2" color="text.secondary">
                  {selectedSignature.note}
                </Typography>
              )}
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.25 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Orden de alteraciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Memorízalo: cada tonalidad nueva agrega la siguiente alteración
                en este orden.
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "#1565c0", fontWeight: 700 }}
              >
                Sostenidos (lado derecho):
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {ORDER_OF_SHARPS.join("  ")}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "#8e24aa", fontWeight: 700 }}
              >
                Bemoles (lado izquierdo):
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {ORDER_OF_FLATS.join("  ")}
              </Typography>
            </Paper>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", xl: "1.2fr 0.8fr" },
          }}
        >
          <Paper variant="outlined" sx={{ p: 3, overflowX: "auto" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Referencia de digitación (4 cuerdas EADG)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              `main` prioriza posiciones cómodas de estudio. `alt` sirve para
              continuar en otra zona del mástil o evitar saltos grandes.
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Tonalidad</TableCell>
                  <TableCell>Raíz (audio)</TableCell>
                  <TableCell>main</TableCell>
                  <TableCell>alt</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sequence.map((root, idx) => (
                  <TableRow
                    key={`row-${root}-${idx}`}
                    sx={{
                      bgcolor:
                        activeIndex === idx
                          ? "rgba(76, 175, 80, 0.12)"
                          : "inherit",
                    }}
                  >
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{root}</TableCell>
                    <TableCell>{BASS_OCTAVE_NOTE_MAP[root]}</TableCell>
                    <TableCell>{BASS_POSITION_MAP[root].main}</TableCell>
                    <TableCell>{BASS_POSITION_MAP[root].alt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Stack spacing={2}>
            <Paper
              variant="outlined"
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Cómo practicar (bajo)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1) Toca solo raíces siguiendo el ciclo y acentúa cada primer
                pulso.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2) Repite cantando la tonalidad antes de tocarla (Do, Sol,
                Re...).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3) Alterna `main` y `alt` para trabajar cambios de posición.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4) Después añade quinta u octava libremente sobre cada raíz.
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 1.2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Lectura del ciclo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ascendente por quintas (+7 semitonos) te lleva por más
                sostenidos.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Descendente por quintas (-7 semitonos) equivale a ascender por
                cuartas, muy usado en grooves y turnarounds.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usa 12 pasos para cerrar el círculo y volver a la tonalidad
                inicial.
              </Typography>
            </Paper>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <ScalePyramidPanel
            title="Pirámide ascendente (quintas) · 12 pasos"
            caption={`Desde ${startRoot}, lado derecho del reloj (cuando aplica): cada fila muestra la escala mayor correspondiente en orden ascendente.`}
            roots={ascendingPyramidRoots}
            focusRoot={focusRoot}
            noteOrder="ascending"
            isMobile={isMobile}
          />

          <ScalePyramidPanel
            title="Pirámide descendente (quintas) · 12 pasos"
            caption={`Desde ${startRoot}, lado izquierdo del reloj (cuando aplica): cada fila muestra la escala mayor correspondiente en orden descendente.`}
            roots={descendingPyramidRoots}
            focusRoot={focusRoot}
            noteOrder="descending"
            isMobile={isMobile}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
