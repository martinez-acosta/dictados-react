// RitmicaConAlturas.tsx - Dictado rítmico con alturas de notas
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box, Paper, Stack, Typography, Grid, Button, Chip, Divider,
  TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch
} from '@mui/material'
import { PlayArrow, Pause, RestartAlt, ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import * as Tone from 'tone'
import { Factory, Stave, StaveNote, Formatter, Beam, Voice } from 'vexflow'
import { FIGURAS_TABLE } from './FigurasYSilenciosTable'

// ------------------ Audio persistente ------------------
let masterRef: Tone.Gain | null = null
let samplerRef: Tone.Sampler | null = null
let metroRef: Tone.Synth | null = null

async function ensureAudio() {
  await Tone.start()
  if (!masterRef) masterRef = new Tone.Gain(1).toDestination()

  if (!samplerRef) {
    samplerRef = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3',
        A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3',
        A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3',
        A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3',
        A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3',
        A5: 'A5.mp3', C6: 'C6.mp3'
      },
      release: 0.8,
      baseUrl: 'https://tonejs.github.io/audio/salamander/'
    }).connect(masterRef!)
    await Tone.loaded()
  }
  if (!metroRef) {
    metroRef = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
    }).connect(masterRef!)
  }
}
function releaseAll() { try { samplerRef?.releaseAll() } catch {} }

// ------------------ Utilidades ------------------
const DUR_TO_PULSES: Record<string, number> =
  Object.fromEntries(FIGURAS_TABLE.flatMap(r => [[r.durNota, r.pulsos44],[r.durSilencio, r.pulsos44]]))

// Rangos de notas disponibles
const NOTE_RANGES: Record<string, string[]> = {
  'C3-C4': ['c/3','d/3','e/3','f/3','g/3','a/3','b/3','c/4'],
  'C4-C5': ['c/4','d/4','e/4','f/4','g/4','a/4','b/4','c/5'],
  'C3-C5': ['c/3','d/3','e/3','f/3','g/3','a/3','b/3','c/4','d/4','e/4','f/4','g/4','a/4','b/4','c/5'],
  'E2-E3': ['e/2','f/2','g/2','a/2','b/2','c/3','d/3','e/3'], // Bajo
  'E1-E2': ['e/1','f/1','g/1','a/1','b/1','c/2','d/2','e/2'], // Bajo grave
}

// Convertir VexFlow key a notación científica para Tone.js
function keyToSPN(key: string): string {
  const [l, oct] = key.split('/')
  const letter = l[0].toUpperCase()
  const sharp = l.includes('#') ? '#' : ''
  return `${letter}${sharp}${oct}`
}

// ------------------ Helpers VexFlow ------------------
function mountCleanTarget(host: HTMLDivElement, id: string) {
  let target = host.querySelector<HTMLDivElement>(`#${id}`)
  if (!target) {
    target = document.createElement('div')
    target.id = id
    host.replaceChildren(target)
  } else {
    target.replaceChildren()
  }
  return target
}

function createBeamGroups(notes: StaveNote[]) {
  const beams: Beam[] = []
  let current: StaveNote[] = []

  const flush = () => {
    if (current.length > 1) {
      beams.push(new Beam(current))
    }
    current = []
  }

  notes.forEach((note, idx) => {
    const beamCount = typeof note.getBeamCount === 'function' ? note.getBeamCount() : 0
    const isRest = typeof note.isRest === 'function'
      ? note.isRest()
      : note.getDuration().includes('r')

    if (beamCount === 0 || isRest) {
      flush()
      return
    }

    current.push(note)

    const next = notes[idx + 1]
    if (!next) {
      flush()
      return
    }
    const nextBeamCount = typeof next.getBeamCount === 'function' ? next.getBeamCount() : 0
    const nextIsRest = typeof next.isRest === 'function'
      ? next.isRest()
      : next.getDuration().includes('r')

    if (nextBeamCount !== beamCount || nextIsRest) {
      flush()
    }
  })

  flush()
  return beams
}

// ------------------ Tipos ------------------
type NoteWithPitch = { duration: string; pitch: string } // pitch en formato VexFlow (ej: 'c/4')
type Medida = { notes: NoteWithPitch[] }

function totalPulses(notes: NoteWithPitch[]) {
  return notes.reduce((a, n) => a + (DUR_TO_PULSES[n.duration] || 0), 0)
}

// Unidades disponibles (notas)
const UNITS_NOTES: {name:string; add: string[]; pulses:number}[] = [
  { name:'Redonda', add:['w'], pulses:4 },
  { name:'Blanca', add:['h'], pulses:2 },
  { name:'Negra', add:['q'], pulses:1 },
  { name:'Doble corchea', add:['8','8'], pulses:1 },
]

// Unidades disponibles (silencios)
const UNITS_RESTS: {name:string; add: string[]; pulses:number}[] = [
  { name:'Silencio de redonda', add:['wr'], pulses:4 },
  { name:'Silencio de blanca',  add:['hr'], pulses:2 },
  { name:'Silencio de negra',   add:['qr'], pulses:1 },
]

// Generar medida con alturas aleatorias
function generateMeasureWithPitches(includeRests: boolean, pitchPool: string[]): Medida {
  const target = 4
  const seq: NoteWithPitch[] = []
  let sum = 0
  let lastWasRest = false

  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  while (sum < target - 1e-6) {
    const rem = +(target - sum).toFixed(3)
    const candNotes = UNITS_NOTES.filter(u => u.pulses <= rem + 1e-6)
    const candRests = includeRests ? UNITS_RESTS.filter(u => u.pulses <= rem + 1e-6) : []

    let pick: {add:string[]; pulses:number} | undefined
    if (!includeRests || lastWasRest || seq.length === 0 || candRests.length === 0) {
      pick = pickRandom(candNotes)
    } else {
      pick = Math.random() < 0.7
        ? pickRandom(candNotes)
        : pickRandom(candRests)
    }
    if (!pick) pick = candNotes[0] || candRests[0]

    const will = sum + pick.pulses
    if (will <= target + 1e-6) {
      pick.add.forEach(dur => {
        const pitch = dur.endsWith('r') ? 'b/4' : pickRandom(pitchPool) // silencios no tienen pitch
        seq.push({ duration: dur, pitch })
      })
      sum = +(sum + pick.pulses).toFixed(3)
      lastWasRest = pick.add.every(d => d.endsWith('r'))
    } else {
      break
    }
  }

  // Garantía: al menos una nota si hay silencios
  if (includeRests && seq.every(n => n.duration.endsWith('r'))) {
    return {
      notes: [
        { duration: 'q', pitch: pickRandom(pitchPool) },
        { duration: 'q', pitch: pickRandom(pitchPool) },
        { duration: 'q', pitch: pickRandom(pitchPool) },
        { duration: 'q', pitch: pickRandom(pitchPool) }
      ]
    }
  }
  return { notes: seq }
}

function equalMeasures(a: NoteWithPitch[], b: NoteWithPitch[]) {
  if (a.length !== b.length) return false
  for (let i=0; i<a.length; i++) {
    if (a[i].duration !== b[i].duration || a[i].pitch !== b[i].pitch) return false
  }
  return true
}

// ------------------ Componente VexFlow ------------------
function VFMeasure({ notes, ts, highlight }: { notes: NoteWithPitch[], ts: '4/4', highlight?: number }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(`vf-meas-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    mountCleanTarget(host, idRef.current)

    const width = 600
    const height = 180
    const vf = new Factory({ renderer: { elementId: idRef.current, width, height } })
    const ctx = vf.getContext()
    const stave = new Stave(8, 8, width - 60)
    stave.addClef('treble').addTimeSignature(ts).setContext(ctx).draw()

    try {
      const vs = notes.map((n, i) => {
        const note = new StaveNote({ clef: 'treble', keys: [n.pitch], duration: n.duration })
        if (highlight === i) note.setStyle({ fillStyle: '#ff6b35', strokeStyle: '#ff6b35' })
        return note
      })

      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      if (typeof (voice as any).setStrict === 'function') (voice as any).setStrict(false)
      else if ((Voice as any).Mode) (voice as any).setMode((Voice as any).Mode.SOFT)
      voice.addTickables(vs)

      new Formatter({ align_rests: true }).joinVoices([voice]).format([voice], width - 80)
      voice.draw(ctx, stave)

      const beams = createBeamGroups(vs)
      beams.forEach(b => b.setContext(ctx).draw())
    } catch (e) {
      console.warn('VF measure error:', e)
    }
  }, [notes, ts, highlight])

  return <div ref={hostRef} />
}

// ------------------ Componente principal ------------------
export default function RitmicaConAlturas() {
  const navigate = useNavigate()
  const timeoutsRef = useRef<number[]>([])

  const barsCount = 2 as const

  const [bpm, setBpm] = useState(60)
  const [repeats, setRepeats] = useState<number>(5)
  const [includeRests, setIncludeRests] = useState<boolean>(true)
  const [noteRange, setNoteRange] = useState<string>('C4-C5')
  const [solution, setSolution] = useState<Medida[]>([])
  const [showSolution, setShowSolution] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null)
  const [currentBar, setCurrentBar] = useState<number | null>(null)

  const pitchPool = useMemo(() => NOTE_RANGES[noteRange] || NOTE_RANGES['C4-C5'], [noteRange])

  useEffect(() => {
    nuevaSecuencia()
    return () => { pauseAll(true) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function clearTimers() {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }

  function pauseAll(silent = false) {
    clearTimers()
    releaseAll()
    if (masterRef) masterRef.gain.rampTo(0, 0.02)
    if (!silent) setIsPlaying(false)
    setCurrentBeat(0)
    setCurrentNoteIndex(null)
    setCurrentBar(null)
  }

  function nuevaSecuencia() {
    const sol = Array.from({length: barsCount}, () => generateMeasureWithPitches(includeRests, pitchPool))
    setSolution(sol)
    pauseAll(true)
  }

  async function playSequence(seq: Medida[], reps = repeats, barOffset = 0) {
    if (!seq.length) return
    await ensureAudio()

    if (masterRef) masterRef.gain.rampTo(1, 0.03)
    clearTimers(); releaseAll()
    setIsPlaying(true)
    setCurrentBeat(0)
    setCurrentNoteIndex(null)
    setCurrentBar(null)

    const base = 60 / Math.max(30, Math.min(240, bpm))
    const safeReps = Math.max(1, Math.min(6, reps))
    let acc = 0

    for (let r = 0; r < safeReps; r++) {
      // Conteo inicial
      if (r === 0) {
        for (let i = 0; i < 4; i++) {
          const to = window.setTimeout(() => {
            metroRef!.triggerAttackRelease(i === 0 ? 'A5' : 'F5', '16n')
            setCurrentBeat(i)
            setCurrentBar(null)
            setCurrentNoteIndex(null)
          }, (acc + i * base) * 1000)
          timeoutsRef.current.push(to)
        }
        acc += base * 4
      }

      for (let localIndex = 0; localIndex < seq.length; localIndex++) {
        const measure = seq[localIndex]
        const globalIndex = barOffset + localIndex
        const measureStart = acc

        const startTo = window.setTimeout(() => {
          setCurrentBar(globalIndex)
          setCurrentNoteIndex(null)
        }, measureStart * 1000)
        timeoutsRef.current.push(startTo)

        // Metrónomo
        for (let beat = 0; beat < 4; beat++) {
          const beatTime = measureStart + beat * base
          const to = window.setTimeout(() => {
            metroRef!.triggerAttackRelease(beat === 0 ? 'A5' : 'F5', '16n')
            setCurrentBeat(beat)
            setCurrentBar(globalIndex)
          }, beatTime * 1000)
          timeoutsRef.current.push(to)
        }

        // Notas con alturas
        let noteAcc = 0
        measure.notes.forEach((n, idx) => {
          const secs = (DUR_TO_PULSES[n.duration] || 0) * base
          const to = window.setTimeout(() => {
            setCurrentBar(globalIndex)
            setCurrentNoteIndex(idx)
            if (!n.duration.endsWith('r')) {
              const spn = keyToSPN(n.pitch)
              samplerRef!.triggerAttackRelease(spn, Math.max(0.06, secs * 0.9))
            }
          }, (measureStart + noteAcc) * 1000)
          timeoutsRef.current.push(to)
          noteAcc += secs
        })

        acc += base * 4
      }

      acc += 0.05
      acc += base
    }

    const endTo = window.setTimeout(() => {
      setIsPlaying(false)
      setCurrentBeat(0)
      setCurrentNoteIndex(null)
      setCurrentBar(null)
    }, acc * 1000 + 50)
    timeoutsRef.current.push(endTo)
  }

  return (
    <Box sx={{ width:'100%', px:2, pb:4 }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb:2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={()=>navigate('/')}>
          Volver al menú
        </Button>
        <Typography variant="h6" sx={{ fontWeight:800, color:'#0b2a50' }}>
          🎼 Dictado Rítmico con Alturas (2 compases)
        </Typography>
      </Stack>

      {/* ENTRENAMIENTO */}
      <Paper sx={{ p:2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb:1 }} flexWrap="wrap">
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" sx={{ fontWeight:700 }}>Entrenamiento (2 compases)</Typography>

            <TextField size="small" type="number" label="BPM" value={bpm}
                       onChange={e=>setBpm(Number(e.target.value))}
                       inputProps={{min:30,max:240,step:1}} sx={{ width:120 }}/>

            <TextField size="small" type="number" label="Repeticiones" value={repeats}
                       onChange={e=>setRepeats(Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
                       inputProps={{min:1,max:6,step:1}} sx={{ width:150 }}/>

            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Rango de notas</InputLabel>
              <Select
                value={noteRange}
                onChange={(e) => setNoteRange(e.target.value)}
                label="Rango de notas"
              >
                <MenuItem value="C3-C4">Do3 - Do4</MenuItem>
                <MenuItem value="C4-C5">Do4 - Do5</MenuItem>
                <MenuItem value="C3-C5">Do3 - Do5</MenuItem>
                <MenuItem value="E2-E3">Mi2 - Mi3 (Bajo)</MenuItem>
                <MenuItem value="E1-E2">Mi1 - Mi2 (Bajo grave)</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={includeRests} onChange={(e)=>setIncludeRests(e.target.checked)} />}
              label="Incluir silencios"
            />

            <Button variant="outlined" startIcon={<RestartAlt/>} onClick={nuevaSecuencia}>
              Nueva secuencia
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {isPlaying ? (
              <Button color="warning" variant="contained" startIcon={<Pause/>} onClick={()=>pauseAll()}>
                Pausar
              </Button>
            ) : (
              <Button variant="contained" startIcon={<PlayArrow/>} onClick={()=>playSequence(solution, repeats)}>
                Escuchar
              </Button>
            )}
            <Chip
              icon={showSolution ? <Visibility/> : <VisibilityOff/>}
              label={showSolution ? 'Ocultar solución' : 'Ver solución'}
              variant="outlined"
              onClick={()=>setShowSolution(v=>!v)}
            />
          </Stack>
        </Stack>

        <Divider sx={{ my:1.5 }} />

        {/* Indicador visual del metrónomo */}
        {isPlaying && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 1, mb: 2, backgroundColor: 'rgba(33, 150, 243, 0.08)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
              {bpm} BPM:
            </Typography>
            {[0,1,2,3].map(beat => (
              <Box
                key={beat}
                sx={{
                  width: 22, height: 22, borderRadius: '50%',
                  backgroundColor: currentBeat === beat ? '#2196f3' : '#e0e0e0',
                  transition: 'background-color 0.1s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Typography variant="caption" sx={{ color: currentBeat === beat ? 'white' : '#666', fontWeight: 'bold' }}>
                  {beat + 1}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Compases de solución */}
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, pt: 0.5 }}>
          {solution.map((m, idx) => {
            const sum = totalPulses(m.notes)
            const complete = Math.abs(sum - 4) < 1e-6

            return (
              <Paper
                key={`sol-${idx}`}
                variant="outlined"
                sx={{
                  flex: '1 1 auto',
                  minWidth: '360px',
                  p: 1.5,
                  borderColor: 'primary.main',
                  borderWidth: 1
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                      Compás {idx + 1}
                    </Typography>
                    <Chip size="small" label={complete ? '4/4 ✓' : `${sum.toFixed(2)} / 4`}
                          color={complete ? 'success' : 'default'}
                          variant={complete ? 'filled' : 'outlined'}
                    />
                  </Stack>

                  <Button size="small" variant="outlined" startIcon={<PlayArrow />}
                    onClick={(e) => { e.stopPropagation(); pauseAll(true); playSequence([solution[idx]], repeats, idx) }}>
                    Oír
                  </Button>
                </Stack>

                {showSolution && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <VFMeasure
                      notes={m.notes.length > 0 ? m.notes : [{ duration: 'qr', pitch: 'b/4' }]}
                      ts="4/4"
                      highlight={isPlaying && idx === currentBar ? currentNoteIndex ?? undefined : undefined}
                    />
                  </Box>
                )}

                {!showSolution && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 180, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Solución oculta
                    </Typography>
                  </Box>
                )}
              </Paper>
            )
          })}
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
          💡 Este ejercicio combina ritmo y altura. Escucha atentamente tanto la duración como la nota que suena.
        </Typography>
      </Paper>
    </Box>
  )
}
