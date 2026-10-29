import React, { useEffect, useId, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Factory, Stave } from "vexflow";
import {
  STAFF_BOTTOM_Y,
  STAFF_STEP_Y,
  staffStepFromY,
} from "../data/harmonyStaffInput.mjs";

export type StaffEntry = { step: number; accidental: string };
type Props = {
  notes: StaffEntry[];
  onChange: (notes: StaffEntry[]) => void;
  maxNotes: number;
};
const tools = [
  ["", "Natural", "♮"],
  ["♯", "Sostenido", "♯"],
  ["♭", "Bemol", "♭"],
  ["𝄫", "Doble bemol", "♭♭"],
];

export default function HarmonyChordStaffInput({
  notes,
  onChange,
  maxNotes,
}: Props) {
  const id = `chord-staff-${useId().replace(/:/g, "")}`;
  const holder = useRef<HTMLDivElement>(null);
  const drawing = useRef<{
    pointerId: number;
    inverseMatrix: DOMMatrix;
    points: { x: number; y: number }[];
  } | null>(null);
  const [path, setPath] = useState("");
  const [accidental, setAccidental] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!holder.current) return;
    holder.current.innerHTML = "";
    const vf = new Factory({
      renderer: { elementId: id, width: 340, height: 170 },
    });
    new Stave(10, 20, 320).addClef("treble").setContext(vf.getContext()).draw();
    const svg = holder.current.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", "0 0 340 170");
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.setAttribute("aria-hidden", "true");
    }
    return () => {
      if (holder.current) holder.current.innerHTML = "";
    };
  }, [id]);

  function point(
    event: React.PointerEvent<SVGSVGElement>,
    inverseMatrix?: DOMMatrix,
  ) {
    const svg = event.currentTarget;
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    const matrix = inverseMatrix ?? svg.getScreenCTM()?.inverse();
    if (!matrix) return null;
    return p.matrixTransform(matrix);
  }

  function begin(event: React.PointerEvent<SVGSVGElement>) {
    if (
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    )
      return;
    const inverseMatrix = event.currentTarget.getScreenCTM()?.inverse();
    if (!inverseMatrix) return;
    const p = point(event, inverseMatrix);
    if (!p || p.x < 110 || p.x > 660) return;
    if (staffStepFromY(p.y) === null) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = {
      pointerId: event.pointerId,
      inverseMatrix,
      points: [{ x: p.x, y: p.y }],
    };
    setPath(`M ${p.x} ${p.y}`);
    setMessage("");
  }

  function move(event: React.PointerEvent<SVGSVGElement>) {
    const current = drawing.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const p = point(event, current.inverseMatrix);
    if (!p) return;
    current.points.push({ x: p.x, y: p.y });
    setPath(
      current.points
        .map((item, i) => `${i ? "L" : "M"} ${item.x} ${item.y}`)
        .join(" "),
    );
  }

  function end(event: React.PointerEvent<SVGSVGElement>, cancel = false) {
    const current = drawing.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drawing.current = null;
    setPath("");
    if (cancel) return;
    const last = point(event, current.inverseMatrix);
    if (last) current.points.push({ x: last.x, y: last.y });
    const ys = current.points.map((p) => p.y);
    const xs = current.points.map((p) => p.x);
    // Acepta tanto un toque como un pequeño círculo; rechaza trazos largos
    // para no convertir un intento de desplazamiento en una nota equivocada.
    if (
      Math.max(...ys) - Math.min(...ys) > 55 ||
      Math.max(...xs) - Math.min(...xs) > 70
    ) {
      setMessage("Dibuja un círculo pequeño en la línea o el espacio deseado.");
      return;
    }
    const step = staffStepFromY((Math.min(...ys) + Math.max(...ys)) / 2);
    if (step === null) {
      setMessage("Dibuja más cerca del pentagrama.");
      return;
    }
    const existing = notes.find((note) => note.step === step);
    if (existing) {
      if (existing.accidental === accidental) {
        onChange(notes.filter((note) => note.step !== step));
        setMessage("Nota eliminada.");
      } else {
        onChange(
          notes.map((note) =>
            note.step === step ? { step, accidental } : note,
          ),
        );
        setMessage("Alteración actualizada.");
      }
    } else if (notes.length >= maxNotes) {
      setMessage(
        `Ya hay ${maxNotes} notas. Toca una para borrarla o usa «Borrar última».`,
      );
    } else {
      onChange([...notes, { step, accidental }]);
      setMessage("Nota colocada.");
    }
  }

  const ledgerLines = new Set<number>();
  for (const note of notes) {
    for (let line = -2; line >= note.step; line -= 2) ledgerLines.add(line);
    for (let line = 10; line <= note.step; line += 2) ledgerLines.add(line);
  }
  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ lineHeight: 1.6 }}>
        Dibuja un círculo por nota con el Apple Pencil, el dedo o el ratón. Se
        acomodarán juntas como acorde, de grave a agudo; puedes empezar por
        cualquiera.
      </Typography>
      <Typography variant="body2" sx={{ color: "#56696a", mt: 0.5 }}>
        Elige la alteración antes de dibujar cada nota. Para borrarla, tócala
        con la misma alteración seleccionada; para cambiarla, selecciona otra y
        tócala de nuevo. No hay armadura: escribe cada alteración necesaria.
      </Typography>
      <Stack
        direction="row"
        useFlexGap
        flexWrap="wrap"
        spacing={0.75}
        sx={{ mt: 1.5 }}
        role="group"
        aria-label="Alteración para la próxima nota"
      >
        {tools.map(([value, label, symbol]) => (
          <Button
            key={label}
            type="button"
            variant={accidental === value ? "contained" : "outlined"}
            aria-pressed={accidental === value}
            onClick={() => setAccidental(value)}
            sx={{ textTransform: "none" }}
          >
            {symbol} {label}
          </Button>
        ))}
      </Stack>
      <Box
        sx={{
          overflowX: "auto",
          mt: 1,
          border: "1px solid #dce3e1",
          borderRadius: 1,
          background: "#fff",
        }}
      >
        <Box
          sx={{
            minWidth: 560,
            width: "100%",
            position: "relative",
            aspectRatio: "2 / 1",
          }}
        >
          <Box
            id={id}
            ref={holder}
            sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          />
          <svg
            viewBox="0 0 680 340"
            aria-label="Pentagrama para dibujar notas en clave de sol"
            role="img"
            onPointerDown={begin}
            onPointerMove={move}
            onPointerUp={(e) => end(e)}
            onPointerCancel={(e) => end(e, true)}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              inset: 0,
              touchAction: "none",
              cursor: "crosshair",
            }}
          >
            <rect x="110" y="40" width="550" height="240" fill="transparent" />
            {[...ledgerLines].map((step) => (
              <line
                key={step}
                x1="317"
                x2="363"
                y1={STAFF_BOTTOM_Y - step * STAFF_STEP_Y}
                y2={STAFF_BOTTOM_Y - step * STAFF_STEP_Y}
                stroke="#111"
                strokeWidth="2"
              />
            ))}
            {notes.map((note) => {
              const y = STAFF_BOTTOM_Y - note.step * STAFF_STEP_Y;
              const offset = notes.some((other) => other.step === note.step - 1)
                ? 20
                : 0;
              return (
                <g key={note.step}>
                  {note.accidental && (
                    <text
                      x={304 + offset}
                      y={y + 8}
                      textAnchor="end"
                      fontFamily="serif"
                      fontSize="29"
                    >
                      {note.accidental === "𝄫" ? "♭♭" : note.accidental}
                    </text>
                  )}
                  <ellipse
                    cx={340 + offset}
                    cy={y}
                    rx="11"
                    ry="7"
                    fill="#fff"
                    stroke="#111"
                    strokeWidth="2.5"
                    transform={`rotate(-12 ${340 + offset} ${y})`}
                  />
                </g>
              );
            })}
            {path && (
              <path
                d={path}
                fill="none"
                stroke="#1976d2"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </Box>
      </Box>
      <Stack
        direction="row"
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        spacing={1}
        sx={{ mt: 1 }}
      >
        <Typography variant="body2">
          {notes.length} de {maxNotes} notas
        </Typography>
        <Button
          type="button"
          size="small"
          disabled={!notes.length}
          onClick={() => {
            onChange(notes.slice(0, -1));
            setMessage("Última nota borrada.");
          }}
        >
          Borrar última
        </Button>
        <Button
          type="button"
          size="small"
          disabled={!notes.length}
          onClick={() => {
            onChange([]);
            setMessage("Pentagrama limpio.");
          }}
        >
          Limpiar pentagrama
        </Button>
      </Stack>
      <Typography
        variant="body2"
        aria-live="polite"
        sx={{ color: "#56696a", minHeight: "1.4em" }}
      >
        {message}
      </Typography>
    </Box>
  );
}
