// FigurasYSilenciosTable.tsx
import React, { useEffect, useRef, useMemo } from 'react'
import { Paper, Typography, Grid, Box, Chip, Stack } from '@mui/material'
import { Factory, Stave, StaveNote, Formatter, Beam, StaveTie, Voice } from 'vexflow'

// ------------------- Constantes de UI -------------------
const BG = '#fff' // Fuerza blanco real
const MAIN_W = 168, MAIN_H = 120
const VAR_W  = 138, VAR_H  = 120
const STAVE_X = 10,  STAVE_Y = 12
const VAR_STAVE_X = 8, VAR_STAVE_Y = 10
const STAVE_RIGHT_PAD = 26
const MAIN_STAVE_W = MAIN_W - STAVE_X - STAVE_RIGHT_PAD
const VAR_STAVE_W  = VAR_W  - VAR_STAVE_X - STAVE_RIGHT_PAD
const ROW_MIN_H = Math.max(MAIN_H, VAR_H) + 16
const VALUE_COL_WIDTH = 64

// -----------------------------------------------------------------------------
// Datos — Tabla fija de Figuras y Silencios (solo valores medios)
// -----------------------------------------------------------------------------
export type FiguraRow = {
  id: string
  figura: string
  durNota: string
  durSilencio: string
  valor: string
  pulsos44: number
}

export const FIGURAS_TABLE: FiguraRow[] = [
  { id: 'w',   figura: 'Redonda',       durNota: 'w',   durSilencio: 'wr',   valor: '1',      pulsos44: 4 },
  { id: 'h',   figura: 'Blanca',        durNota: 'h',   durSilencio: 'hr',   valor: '1/2',    pulsos44: 2 },
  { id: 'q',   figura: 'Negra',         durNota: 'q',   durSilencio: 'qr',   valor: '1/4',    pulsos44: 1 },
  { id: '8',   figura: 'Corchea',       durNota: '8',   durSilencio: '8r',   valor: '1/8',    pulsos44: 0.5 },
  { id: '16',  figura: 'Semicorchea',   durNota: '16',  durSilencio: '16r',  valor: '1/16',   pulsos44: 0.25 },
  { id: '32',  figura: 'Fusa',          durNota: '32',  durSilencio: '32r',  valor: '1/32',   pulsos44: 0.125 },
  { id: '64',  figura: 'Semifusa',      durNota: '64',  durSilencio: '64r',  valor: '1/64',   pulsos44: 0.0625 },
]

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function mountCleanTarget(host: HTMLDivElement, id: string) {
  let target = host.querySelector<HTMLDivElement>(`#${id}`)
  if (!target) {
    target = document.createElement('div')
    target.id = id
    host.replaceChildren(target)
  } else {
    target.replaceChildren()
  }
  target.style.background = BG
  return target
}

// -----------------------------------------------------------------------------
// Celdas de dibujo
// -----------------------------------------------------------------------------
function VFPairCell({ note, rest }: { note: string; rest: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(`vf-pair-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    mountCleanTarget(host, idRef.current)

    try {
      const vf = new Factory({ renderer: { elementId: idRef.current, width: MAIN_W, height: MAIN_H } })
      const ctx = vf.getContext()
      const stave = new Stave(STAVE_X, STAVE_Y, MAIN_STAVE_W)
      stave.addClef('treble').setContext(ctx).draw()
      const n1 = new StaveNote({ clef: 'treble', keys: ['b/4'], duration: note })
      const n2 = new StaveNote({ clef: 'treble', keys: ['b/4'], duration: rest })
      Formatter.FormatAndDraw(ctx, stave, [n1, n2])
    } catch { /* noop */ }
  }, [note, rest])

  return <div ref={hostRef} style={{ width: MAIN_W, height: MAIN_H, background: BG }} />
}

// -----------------------------------------------------------------------------
// Variantes (barra/ligadura) con dirección alternada de tallo
// -----------------------------------------------------------------------------
type VariantSpec = {
  notes: string[]
  tie?: [number, number]
  beamed?: boolean
  stemDir?: 1 | -1 // 1 = arriba, -1 = abajo
}

function buildVariant(id: string): VariantSpec | null {
  switch (id) {
    case 'w':  return { notes: ['h', 'h'], tie: [0, 1], stemDir: 1 }           // redonda = 2 blancas ligadas
    case 'h':  return { notes: ['q', 'q'], tie: [0, 1], stemDir: 1 }           // blanca = 2 negras ligadas
    case 'q':  return { notes: ['8', '8'], beamed: true, stemDir: 1 }          // arriba
    case '8':  return { notes: ['16', '16'], beamed: true, stemDir: -1 }       // abajo
    case '16': return { notes: ['32', '32'], beamed: true, stemDir: 1 }        // arriba
    case '32': return { notes: ['64', '64'], beamed: true, stemDir: -1 }       // abajo
    case '64': return { notes: ['128', '128'], beamed: true, stemDir: 1 }      // arriba
    default:   return null
  }
}

function VFVariantCell({ forId }: { forId: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(`vf-var-${Math.random().toString(36).slice(2)}`)
  const spec = useMemo(() => buildVariant(forId), [forId])

  useEffect(() => {
    const host = hostRef.current
    if (!host || !spec) return
    mountCleanTarget(host, idRef.current)

    try {
      const vf = new Factory({ renderer: { elementId: idRef.current, width: VAR_W, height: VAR_H } })
      const ctx = vf.getContext()
      const stave = new Stave(VAR_STAVE_X, VAR_STAVE_Y, VAR_STAVE_W).addClef('treble')
      stave.setContext(ctx).draw()

      const notes = spec.notes.map(d =>
        new StaveNote({ clef: 'treble', keys: ['b/4'], duration: d, stem_direction: spec.stemDir })
      )

      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      if (typeof (voice as any).setStrict === 'function') (voice as any).setStrict(false)
      else if ((Voice as any).Mode) (voice as any).setMode((Voice as any).Mode.SOFT)
      voice.addTickables(notes)

      // Genera beams ANTES de dibujar la voz, respetando stemDir (evita banderitas duplicadas)
      let beams: Beam[] = []
      if (spec.beamed) {
        const gen = (Beam as any).generateBeams
        if (typeof gen === 'function') {
          beams = gen(notes, { maintain_stem_directions: true }) as Beam[]
        } else {
          notes.forEach(n => ((n as any).render_options.draw_flag = false))
          beams = [new Beam(notes)]
        }
      }

      new Formatter().joinVoices([voice]).format([voice], VAR_STAVE_W - 8)
      voice.draw(ctx, stave)
      beams.forEach(b => b.setContext(ctx).draw())

      if (spec.tie) {
        new StaveTie({
          first_note: notes[spec.tie[0]],
          last_note:  notes[spec.tie[1]],
          first_indices: [0], last_indices: [0],
        }).setContext(ctx).draw()
      }
    } catch { /* noop */ }
  }, [spec])

  return <div ref={hostRef} style={{ width: VAR_W, height: VAR_H, background: BG }} />
}

// -----------------------------------------------------------------------------
// UI — Encabezado y filas (4 columnas)
// -----------------------------------------------------------------------------
function ColumnHeader4() {
  return (
    <Box sx={{ px: 1, mb: 0.5, bgcolor: BG }}>
      <Grid container spacing={1} sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
        <Grid item xs>Figura</Grid>
        <Grid item xs>Notación (original)</Grid>
        <Grid item xs>Variante</Grid>
        <Grid item sx={{ width: VALUE_COL_WIDTH, textAlign: 'center' }}>Valor</Grid>
      </Grid>
    </Box>
  )
}

function Row4({ row, first }: { row: FiguraRow; first: boolean }) {
  return (
    <Box
      sx={{
        py: 1, px: 1, minHeight: ROW_MIN_H, bgcolor: BG,
        ...(first ? {} : { borderTop: '1px solid rgba(0,0,0,0.08)' }),
        '&:hover': { bgcolor: '#fafafa' },
      }}
    >
      <Grid container spacing={1} alignItems="center" wrap="nowrap">
        <Grid item xs zeroMinWidth>
          <Typography sx={{ fontWeight: 600, fontSize: 13.5, lineHeight: 1.2 }}>{row.figura}</Typography>
        </Grid>
        <Grid item xs>
          <Box sx={{ width: MAIN_W, mx: 'auto' }}><VFPairCell note={row.durNota} rest={row.durSilencio} /></Box>
        </Grid>
        <Grid item xs>
          <Box sx={{ width: VAR_W, mx: 'auto' }}><VFVariantCell forId={row.id} /></Box>
        </Grid>
        <Grid item sx={{ width: VALUE_COL_WIDTH, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, fontFamily: 'monospace' }}>{row.valor}</Typography>
        </Grid>
      </Grid>
    </Box>
  )
}

function TableBlock({ rows }: { rows: FiguraRow[] }) {
  return (
    <Box>
      <ColumnHeader4 />
      <Box sx={{
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: BG,
      }}>
        {rows.map((row, i) => <Row4 key={row.id} row={row} first={i === 0} />)}
      </Box>
    </Box>
  )
}

// -----------------------------------------------------------------------------
// Componente principal — 4 tablas
// -----------------------------------------------------------------------------
export interface FigurasYSilenciosTableProps {
  showHeader?: boolean
}

function splitInto<T>(arr: T[], columns: number): T[][] {
  const perCol = Math.ceil(arr.length / columns)
  const out: T[][] = []
  for (let i = 0; i < columns; i++) out.push(arr.slice(i * perCol, (i + 1) * perCol))
  return out
}

export default function FigurasYSilenciosTable({ showHeader = true }: FigurasYSilenciosTableProps) {
  const columns = useMemo(() => splitInto(FIGURAS_TABLE, 4), [])

  return (
    <Paper sx={{ p: 2, maxWidth: 1800, mx: 'auto', bgcolor: BG }}>
      {showHeader && (
        <Stack direction="row" spacing={1.5} alignItems="baseline" sx={{ mb: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mr: 1 }}>
            Tabla de figuras y silencios
          </Typography>
          <Chip label="Notación: primero figura, luego silencio" size="small" variant="outlined" />
          <Chip label="Variante con barra / ligadura" size="small" variant="outlined" color="secondary" />
        </Stack>
      )}

      {/* 1 en xs, 2 en sm, 4 en md+ */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
        gap: 2,
        alignItems: 'start',
        bgcolor: BG,
      }}>
        {columns.map((colRows, idx) => <TableBlock key={idx} rows={colRows} />)}
      </Box>
    </Paper>
  )
}