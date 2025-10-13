// DiatonicTriadsTrainer.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Paper, Box, Grid, Typography, TextField,
  MenuItem, Select, InputLabel, FormControl, Stack,
  Button, Chip, Checkbox, FormControlLabel
} from '@mui/material'
import { PlayArrow, Pause, ArrowBack } from '@mui/icons-material'
import { Factory, StaveNote, Stave, Accidental, TickContext, Formatter } from 'vexflow'
import * as Tone from 'tone'
import { useNavigate } from 'react-router-dom'
import IntervalsTable from './IntervalsTable'

// ---------------- Audio sampler persistente ----------------
let toneSamplerRef: Tone.Sampler | null = null

async function loadSampler() {
  if (toneSamplerRef) return toneSamplerRef
  await Tone.start()
  toneSamplerRef = new Tone.Sampler({
    urls: {
      A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
      A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
      A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
      A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
      A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
      A5: 'A5.mp3', C6: 'C6.mp3'
    },
    release: 1,
    baseUrl: 'https://tonejs.github.io/audio/salamander/'
  }).toDestination()
  await Tone.loaded()
  return toneSamplerRef
}

// ---------------- Utilidades musicales ----------------
type Clef = 'treble'|'bass'
type Quality = 'major'|'minor'|'augmented'|'diminished'

const NAT_PC: Record<string, number> = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }

function parseSpelled(n: string): { letter: keyof typeof NAT_PC, acc: ''|'#'|'##'|'b'|'bb', octave: number } {
  const m = n.match(/^([A-G])([#b]{0,2})(\d+)$/)
  if (!m) return { letter: 'C', acc: '', octave: 4 }
  const letter = m[1] as keyof typeof NAT_PC
  const acc = (m[2] as ''|'#'|'##'|'b'|'bb') || ''
  const octave = parseInt(m[3], 10)
  return { letter, acc, octave }
}
function accShift(acc: ''|'#'|'##'|'b'|'bb'): number {
  switch (acc) { case '#': return +1; case '##': return +2; case 'b': return -1; case 'bb': return -2; default: return 0 }
}
function midiFromSpelled(name: string): number {
  const { letter, acc, octave } = parseSpelled(name)
  return (octave + 1) * 12 + NAT_PC[letter] + accShift(acc)
}
function pcFromSpelled(name: string): number {
  const { letter, acc } = parseSpelled(name)
  return (NAT_PC[letter] + accShift(acc) + 1200) % 12
}

// solfeo a partir del deletreo (sin ambigüedades tipo "Fa#/Solb")
const LETTER_TO_SOLFEGE: Record<'C'|'D'|'E'|'F'|'G'|'A'|'B', string> =
  { C:'Do', D:'Re', E:'Mi', F:'Fa', G:'Sol', A:'La', B:'Si' }

function solfegeFromSpelled(name: string): string {
  const { letter, acc } = parseSpelled(name)
  const base = LETTER_TO_SOLFEGE[letter as keyof typeof LETTER_TO_SOLFEGE] || 'Do'
  if (!acc) return base
  if (acc === '#') return `${base}#`
  if (acc === '##') return `${base}##`
  if (acc === 'b') return `${base}b`
  if (acc === 'bb') return `${base}bb`
  return base
}

// ---------------- Tríadas HARDCODEADAS (7 por calidad, cada nota con octava correcta) ----------------
const HARDCODED: Record<Quality, Array<{ root: string, spelled: [string,string,string] }>> = {
  major: [
    { root:'C', spelled:['C4','E4','G4'] },
    { root:'D', spelled:['D4','F#4','A4'] },
    { root:'E', spelled:['E4','G#4','B4'] },
    { root:'F', spelled:['F4','A4','C5'] },
    { root:'G', spelled:['G4','B4','D5'] },
    { root:'A', spelled:['A4','C#5','E5'] },
    { root:'B', spelled:['B4','D#5','F#5'] },
  ],
  minor: [
    { root:'C', spelled:['C4','Eb4','G4'] },
    { root:'D', spelled:['D4','F4','A4'] },
    { root:'E', spelled:['E4','G4','B4'] },
    { root:'F', spelled:['F4','Ab4','C5'] },
    { root:'G', spelled:['G4','Bb4','D5'] },
    { root:'A', spelled:['A4','C5','E5'] },
    { root:'B', spelled:['B4','D5','F#5'] },
  ],
  diminished: [
    { root:'C', spelled:['C4','Eb4','Gb4'] },
    { root:'D', spelled:['D4','F4','Ab4'] },
    { root:'E', spelled:['E4','G4','Bb4'] },
    { root:'F', spelled:['F4','Ab4','Cb5'] },   // Cb5 (B4) — sigue siendo 1–3–5 ascendente
    { root:'G', spelled:['G4','Bb4','Db5'] },
    { root:'A', spelled:['A4','C5','Eb5'] },
    { root:'B', spelled:['B4','D5','F5'] },
  ],
  augmented: [
    { root:'C', spelled:['C4','E4','G#4'] },
    { root:'D', spelled:['D4','F#4','A#4'] },
    { root:'E', spelled:['E4','G#4','B#4'] },   // B#4 (C5)
    { root:'F', spelled:['F4','A4','C#5'] },
    { root:'G', spelled:['G4','B4','D#5'] },
    { root:'A', spelled:['A4','C#5','E#5'] },   // E#5 (F5)
    { root:'B', spelled:['B4','D#5','F##5'] },  // F##5 (G5)
  ],
}

// ---------------- Tipos y construcción ----------------
type Triad = {
  root: string
  quality: Quality
  symbol: string   // C, Dm, B°, F+
  spelled: [string,string,string] // con octava
  pcs: [number,number,number]
  keys: [string,string,string]    // 'c/4' (letra base + /octava)
  accs: [''|'#'|'##'|'b'|'bb',''|'#'|'##'|'b'|'bb',''|'#'|'##'|'b'|'bb']
  midis: [number,number,number]
  solfege: [string,string,string]
}
function buildTriads(q: Quality): Triad[] {
  const sym = q==='major' ? '' : q==='minor' ? 'm' : q==='augmented' ? '+' : '°'
  return HARDCODED[q].map(({root, spelled}) => {
    const pcs = spelled.map(pcFromSpelled) as [number,number,number]
    const keys = spelled.map(n => {
      const { letter, octave } = parseSpelled(n)
      // Para VexFlow, sólo letra base en la key; el accidental va como modifier
      return `${letter.toLowerCase()}/${octave}`
    }) as [string,string,string]
    const accs = spelled.map(n => parseSpelled(n).acc) as Triad['accs']
    const midis = spelled.map(midiFromSpelled) as [number,number,number]
    const solfege = spelled.map(solfegeFromSpelled) as [string,string,string]
    return { root, quality: q, symbol: `${root}${sym}`, spelled, pcs, keys, accs, midis, solfege }
  })
}

// ---------------- VexFlow MiniCard (siempre arpegio visual) ----------------
type TriadCardProps = { triad: Triad; clef: Clef; highlight?: boolean }

function TriadCard({ triad, clef, highlight }: TriadCardProps) {
  const holderRef = useRef<HTMLDivElement | null>(null)
  const holderId = `vf-${triad.symbol}-${triad.root}`
  const [vw, setVw] = useState<number>(280)

  // Se adapta al ancho disponible: siempre caben 3 notas
  useEffect(() => {
    if (!holderRef.current) return
    const el = holderRef.current
    const ro = new ResizeObserver(() => {
      const w = Math.max(180, Math.floor(el.clientWidth || 0))
      setVw(w)
    })
    ro.observe(el)
    setVw(Math.max(180, Math.floor(el.clientWidth || 0)))
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!holderRef.current) return
    holderRef.current.innerHTML = ''

    const width = Math.max(180, vw)
    const height = 120
    const vf = new Factory({ renderer: { elementId: holderId, width, height } })
    const ctx = vf.getContext()
    const stave = new Stave(10, 10, width - 20)
    stave.addClef(clef).addTimeSignature('4/4').setContext(ctx).draw()

    // Arpegio visual: 3 redondas separadas (nota por nota)
    const notes = triad.keys.map((key, idx) => {
      const note = new StaveNote({ clef, keys: [key], duration: 'w' })
      const acc = triad.accs[idx]
      // Agregar accidental ANTES de asociar al contexto (este orden funciona con Formatter)
      if (acc) note.addModifier(new Accidental(acc), 0)
      note.setStave(stave).setContext(ctx)
      if (highlight) note.setStyle({ fillStyle: '#ff6b35', strokeStyle: '#ff6b35' })
      return note
    })

    try {
      // Deja que VexFlow formatee y posicione las 3 redondas dentro del compás
      Formatter.FormatAndDraw(ctx, stave, notes)
    } catch (e) {
      // Fallback por si alguna versión de VexFlow no acepta FormatAndDraw con varias redondas
      const leftPad = 20, rightPad = 20
      const leftEdge = stave.getX() + leftPad
      const rightEdge = stave.getX() + stave.getWidth() - rightPad
      const span = Math.max(1, rightEdge - leftEdge)
      const n = notes.length
      notes.forEach((note, i) => {
        const x = leftEdge + (span * (i + 0.5)) / n
        const tc = new TickContext()
        tc.addTickable(note).preFormat().setX(x)
        note.setTickContext(tc)
        try { note.draw() } catch {}
      })
    }
  }, [triad, clef, highlight, vw, holderId])

  return <div id={holderId} ref={holderRef} style={{ width: '100%' }} />
}

// ---------------- Componente principal ----------------
export default function DiatonicTriadsTrainer() {
  const navigate = useNavigate()

  const [quality, setQuality] = useState<Quality>('major')
  const [clef, setClef] = useState<Clef>('treble')
  const [bpm, setBpm] = useState(60)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const timeoutsRef = useRef<number[]>([])

  const triads = useMemo(() => buildTriads(quality), [quality])

  useEffect(() => () => stopAll(), [])

  function stopAll() {
    setIsPlaying(false)
    setPlayingIndex(null)
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
    try { toneSamplerRef?.releaseAll() } catch {}
  }

  function noteSeconds(): number {
    const beat = 60 / Math.max(30, Math.min(240, bpm))
    return beat * 4 // redonda
  }
  function arpeggioTiming(total:number) {
    const gap = total * 0.05
    const sub = (total - 2 * gap) / 3
    return { subDur: sub, gapDur: gap }
  }

  async function playTriad(idx: number) {
    await loadSampler()
    const t = triads[idx]; if (!t) return
    const total = noteSeconds()
    setPlayingIndex(idx)

    const { subDur, gapDur } = arpeggioTiming(total)
    t.midis.forEach((m, i) => {
      const at = (i * (subDur + gapDur)) * 1000
      const to = window.setTimeout(() => {
        const freq = Tone.Frequency(m, 'midi').toFrequency()
        toneSamplerRef!.triggerAttackRelease(freq, subDur * 0.95)
        if (i === t.midis.length - 1) {
          const done = window.setTimeout(() => setPlayingIndex(null), subDur * 900)
          timeoutsRef.current.push(done)
        }
      }, at)
      timeoutsRef.current.push(to)
    })
  }

  async function playAll() {
    if (isPlaying) { stopAll(); return }
    await loadSampler()
    setIsPlaying(true)

    const total = noteSeconds()
    const block = total + 0.4

    for (let i = 0; i < triads.length; i++) {
      const at = i * block * 1000
      const to = window.setTimeout(() => {
        playTriad(i)
        if (i === triads.length - 1) {
          const done = window.setTimeout(() => { setIsPlaying(false); setPlayingIndex(null) }, block * 1000)
          timeoutsRef.current.push(done)
        }
      }, at)
      timeoutsRef.current.push(to)
    }
  }

  const qualityLabel = (q:Quality) =>
    q==='major' ? 'Mayores' : q==='minor' ? 'Menores' : q==='augmented' ? 'Aumentadas' : 'Disminuidas'

  return (
    <Box sx={{ width: '100%', px: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/')}>Volver al menú</Button>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0b2a50', flex: 1 }}>
            🎼 Tríadas {qualityLabel(quality)} — C4, D4, E4, F4, G4, A4, B4
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Tabla de intervalos a la izquierda */}
          <Grid item xs={12} lg={4}>
            <IntervalsTable />
          </Grid>

          {/* Contenido principal a la derecha */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={2}>

        <Paper sx={{ p:2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Calidad</InputLabel>
                <Select value={quality} onChange={e => setQuality(e.target.value as Quality)} label="Calidad">
                  <MenuItem value="major">Mayores</MenuItem>
                  <MenuItem value="minor">Menores</MenuItem>
                  <MenuItem value="augmented">Aumentadas</MenuItem>
                  <MenuItem value="diminished">Disminuidas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Clave</InputLabel>
                <Select value={clef} onChange={e => setClef(e.target.value as Clef)} label="Clave">
                  <MenuItem value="treble">Sol (2ª línea)</MenuItem>
                  <MenuItem value="bass">Fa (4ª línea)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField size="small" label="BPM (espaciado)" type="number" value={bpm}
                inputProps={{min:40, max:220}} onChange={e=>setBpm(Number(e.target.value))}
                helperText="1 redonda por tarjeta" />
            </Grid>
            <Grid item xs />
            <Grid item xs={12} md="auto">
              <Button variant="contained" color="primary" onClick={playAll}
                startIcon={isPlaying ? <Pause/> : <PlayArrow/>}>
                {isPlaying ? 'Pausar' : 'Reproducir TODAS'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight:700, mb:1 }}>
            7 tríadas {qualityLabel(quality)} — cada nota con octava
          </Typography>

          <Grid container spacing={2}>
            {triads.map((t, i) => (
              <Grid item xs={12} sm={6} md={4} key={`${t.symbol}-${i}`}>
                <Paper variant="outlined" sx={{ p:1.5, borderRadius:2, bgcolor: playingIndex===i ? 'rgba(255,107,53,0.06)' : undefined }}>
                  <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small"
                        label={t.symbol}
                        color={t.quality==='major' ? 'success'
                          : t.quality==='minor' ? 'primary'
                          : t.quality==='augmented' ? 'secondary' : 'warning'} />
                      <Typography variant="subtitle2" sx={{ fontWeight:700 }}>
                        {t.spelled.join(' - ')}
                      </Typography>
                    </Stack>
                    <Button size="small" variant="contained" onClick={()=>playTriad(i)} startIcon={<PlayArrow/>}>
                      Reproducir
                    </Button>
                  </Box>

                  <Box sx={{ mb:1, p:1, bgcolor:'rgba(0,0,0,0.02)', borderRadius:1 }}>
                    <Typography variant="caption" sx={{ display:'block', mb:0.5 }}>
                      <strong>Solfeo:</strong> {t.solfege.join(' - ')}
                    </Typography>
                    <Typography variant="caption" sx={{ display:'block', color:'text.secondary' }}>
                      <strong>MIDI:</strong> {t.midis.join(', ')}
                    </Typography>
                  </Box>

                  <TriadCard triad={t} clef={clef} highlight={playingIndex===i}/>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}