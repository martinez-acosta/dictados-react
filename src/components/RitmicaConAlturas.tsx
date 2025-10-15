// RitmicaConAlturas.tsx - Dictado rítmico con alturas de notas
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box, Paper, Stack, Typography, Grid, Button, Chip, Divider,
  TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch,
  IconButton
} from '@mui/material'
import { PlayArrow, Pause, RestartAlt, ArrowBack, Visibility, VisibilityOff, Undo, Delete, CheckCircle } from '@mui/icons-material'
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

const NOTE_NAMES: Record<string, string> = {
  'c/1':'Do1','d/1':'Re1','e/1':'Mi1','f/1':'Fa1','g/1':'Sol1','a/1':'La1','b/1':'Si1',
  'c/2':'Do2','d/2':'Re2','e/2':'Mi2','f/2':'Fa2','g/2':'Sol2','a/2':'La2','b/2':'Si2',
  'c/3':'Do3','d/3':'Re3','e/3':'Mi3','f/3':'Fa3','g/3':'Sol3','a/3':'La3','b/3':'Si3',
  'c/4':'Do4','d/4':'Re4','e/4':'Mi4','f/4':'Fa4','g/4':'Sol4','a/4':'La4','b/4':'Si4',
  'c/5':'Do5','d/5':'Re5','e/5':'Mi5','f/5':'Fa5','g/5':'Sol5','a/5':'La5','b/5':'Si5',
}

// Convertir VexFlow key a notación científica para Tone.js
function keyToSPN(key: string): string {
  const [l, oct] = key.split('/')
  const letter = l[0].toUpperCase()
  const sharp = l.includes('#') ? '#' : ''
  return `${letter}${sharp}${oct}`
}

// Parse nota de entrada (ej: "C4" o "Do4" -> "c/4")
function parseNoteInput(input: string, rangeKeys: string[]): { valid: boolean; key?: string } {
  if (!input) return { valid: false }
  const trimmed = input.trim().toLowerCase()

  // Intentar formato científico: C4, D3, etc.
  const scientificMatch = trimmed.match(/^([a-g])(\d)$/i)
  if (scientificMatch) {
    const key = `${scientificMatch[1].toLowerCase()}/${scientificMatch[2]}`
    if (rangeKeys.includes(key)) return { valid: true, key }
  }

  // Intentar formato solfeo: Do4, Re3, etc.
  const solfegeMap: Record<string, string> = {
    'do': 'c', 're': 'd', 'mi': 'e', 'fa': 'f', 'sol': 'g', 'la': 'a', 'si': 'b'
  }
  const solfegeMatch = trimmed.match(/^(do|re|mi|fa|sol|la|si)(\d)$/i)
  if (solfegeMatch) {
    const letter = solfegeMap[solfegeMatch[1].toLowerCase()]
    const key = `${letter}/${solfegeMatch[2]}`
    if (rangeKeys.includes(key)) return { valid: true, key }
  }

  return { valid: false }
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
        const pitch = dur.endsWith('r') ? 'b/4' : pickRandom(pitchPool)
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
function VFMeasure({ notes, ts, highlight, showGrading, graded }: {
  notes: NoteWithPitch[],
  ts: '4/4',
  highlight?: number,
  showGrading?: boolean,
  graded?: boolean[]
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(`vf-meas-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    mountCleanTarget(host, idRef.current)

    const width = 225
    const height = 105
    const vf = new Factory({ renderer: { elementId: idRef.current, width, height } })
    const ctx = vf.getContext()
    const stave = new Stave(6, 6, width - 22)
    stave.addClef('treble').addTimeSignature(ts).setContext(ctx).draw()

    try {
      const vs = notes.map((n, i) => {
        const note = new StaveNote({ clef: 'treble', keys: [n.pitch], duration: n.duration })
        if (highlight === i) {
          note.setStyle({ fillStyle: '#ff6b35', strokeStyle: '#ff6b35' })
        } else if (showGrading && graded && graded[i] !== undefined) {
          const color = graded[i] ? '#34d399' : '#fb7185'
          note.setStyle({ fillStyle: color, strokeStyle: color })
        }
        return note
      })

      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      if (typeof (voice as any).setStrict === 'function') (voice as any).setStrict(false)
      else if ((Voice as any).Mode) (voice as any).setMode((Voice as any).Mode.SOFT)
      voice.addTickables(vs)

      new Formatter({ align_rests: true }).joinVoices([voice]).format([voice], width - 40)
      voice.draw(ctx, stave)

      const beams = createBeamGroups(vs)
      beams.forEach(b => b.setContext(ctx).draw())
    } catch (e) {
      console.warn('VF measure error:', e)
    }
  }, [notes, ts, highlight, showGrading, graded])

  return <div ref={hostRef} />
}

// Paleta snippet pequeño
const PAL_W = 90, PAL_H = 80, PAL_STAVE_X = 4, PAL_STAVE_Y = 8, PAL_STAVE_W = PAL_W - 10
function VFSnippet({ durations }: { durations: string[] }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef(`vf-snip-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    mountCleanTarget(host, idRef.current)

    const vf = new Factory({ renderer: { elementId: idRef.current, width: PAL_W, height: PAL_H } })
    const ctx = vf.getContext()
    const stave = new Stave(PAL_STAVE_X, PAL_STAVE_Y, PAL_STAVE_W)
    stave.addClef('treble').setContext(ctx).draw()
    try {
      const notes = durations.map(d => new StaveNote({ clef: 'treble', keys: ['b/4'], duration: d }))
      const voice = new Voice({ num_beats: 4, beat_value: 4 })
      if (typeof (voice as any).setStrict === 'function') (voice as any).setStrict(false)
      else if ((Voice as any).Mode) (voice as any).setMode((Voice as any).Mode.SOFT)
      voice.addTickables(notes)

      new Formatter({ align_rests: true }).joinVoices([voice]).format([voice], PAL_STAVE_W - 6)
      voice.draw(ctx, stave)

      const beams = createBeamGroups(notes)
      beams.forEach(b => b.setContext(ctx).draw())
    } catch (e) {
      console.warn('VF snippet error:', e)
    }
  }, [durations])

  return <div ref={hostRef} style={{ width: PAL_W, height: PAL_H }} />
}

// ------------------ Componente principal ------------------
export default function RitmicaConAlturas() {
  const navigate = useNavigate()
  const timeoutsRef = useRef<number[]>([])

  const barsCount = 4 as const

  const [bpm, setBpm] = useState(60)
  const [repeats, setRepeats] = useState<number>(5)
  const [includeRests, setIncludeRests] = useState<boolean>(true)
  const [noteRange, setNoteRange] = useState<string>('C4-C5')
  const [mode, setMode] = useState<'train' | 'exam'>('train')
  const [solution, setSolution] = useState<Medida[]>([])
  const [answers, setAnswers] = useState<Medida[]>([])
  const [activeBar, setActiveBar] = useState(0)
  const [graded, setGraded] = useState<boolean[][]>([])
  const [showSolution, setShowSolution] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null)
  const [currentBar, setCurrentBar] = useState<number | null>(null)
  // Para inputs de texto
  const [noteInputs, setNoteInputs] = useState<string[][]>([[],[],[],[]])

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
    setAnswers(Array.from({length: barsCount}, () => ({ notes: [] })))
    setNoteInputs(Array.from({length: barsCount}, () => []))
    setActiveBar(0)
    setGraded([])
    pauseAll(true)
  }

  function addToActive(durs: string[] | string, pitches?: string[]) {
    const durations = Array.isArray(durs) ? durs : [durs]
    setAnswers(prev => {
      const copy = prev.map(m => ({ notes:[...m.notes] }))
      const current = copy[activeBar]
      const sum = totalPulses(current.notes)
      const addVal = durations.reduce((a,d)=>a+(DUR_TO_PULSES[d]||0),0)
      if (sum + addVal <= 4 + 1e-6) {
        durations.forEach((dur, i) => {
          const pitch = pitches && pitches[i] ? pitches[i] : (dur.endsWith('r') ? 'b/4' : 'c/4')
          current.notes.push({ duration: dur, pitch })
        })
      }
      return copy
    })
    // Actualizar inputs
    setNoteInputs(prev => {
      const copy = prev.map(arr => [...arr])
      durations.forEach((dur) => {
        if (!dur.endsWith('r')) {
          copy[activeBar].push('')
        }
      })
      return copy
    })
  }

  function undoActive() {
    setAnswers(prev => {
      const copy = prev.map(m => ({ notes:[...m.notes] }))
      const last = copy[activeBar].notes.pop()
      return copy
    })
    setNoteInputs(prev => {
      const copy = prev.map(arr => [...arr])
      if (copy[activeBar].length > 0) {
        copy[activeBar].pop()
      }
      return copy
    })
  }

  function clearActive() {
    setAnswers(prev => {
      const copy = prev.map(m => ({ notes:[...m.notes] }))
      copy[activeBar].notes = []
      return copy
    })
    setNoteInputs(prev => {
      const copy = prev.map(arr => [...arr])
      copy[activeBar] = []
      return copy
    })
  }

  function updateNotePitch(barIdx: number, noteIdx: number, input: string) {
    const parsed = parseNoteInput(input, pitchPool)
    setNoteInputs(prev => {
      const copy = prev.map(arr => [...arr])
      copy[barIdx][noteIdx] = input
      return copy
    })
    if (parsed.valid && parsed.key) {
      setAnswers(prev => {
        const copy = prev.map(m => ({ notes:[...m.notes] }))
        if (copy[barIdx].notes[noteIdx]) {
          copy[barIdx].notes[noteIdx].pitch = parsed.key!
        }
        return copy
      })
    }
  }

  const allComplete = useMemo(() =>
    answers.every(m => Math.abs(totalPulses(m.notes) - 4) < 1e-6),
    [answers]
  )

  function calificar() {
    const res = answers.map((m,i) => {
      return m.notes.map((n, j) => {
        const sol = solution[i].notes[j]
        if (!sol) return false
        return n.duration === sol.duration && n.pitch === sol.pitch
      })
    })
    setGraded(res)
    setShowSolution(true)
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

        for (let beat = 0; beat < 4; beat++) {
          const beatTime = measureStart + beat * base
          const to = window.setTimeout(() => {
            metroRef!.triggerAttackRelease(beat === 0 ? 'A5' : 'F5', '16n')
            setCurrentBeat(beat)
            setCurrentBar(globalIndex)
          }, beatTime * 1000)
          timeoutsRef.current.push(to)
        }

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

  // Paleta de figuras
  const rowW = FIGURAS_TABLE.find(r => r.id === 'w')!
  const rowH = FIGURAS_TABLE.find(r => r.id === 'h')!
  const rowQ = FIGURAS_TABLE.find(r => r.id === 'q')!

  return (
    <Box sx={{ width:'100%', px:2, pb:4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb:2 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={()=>navigate('/')}>
          Volver al menú
        </Button>
        <Typography variant="h6" sx={{ fontWeight:800, color:'#0b2a50' }}>
          🎼 Dictado Rítmico con Alturas (4 compases)
        </Typography>
      </Stack>

      <Paper sx={{ p:2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb:1 }} flexWrap="wrap">
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" sx={{ fontWeight:700 }}>
              {mode === 'train' ? 'Modo: Entrenamiento' : 'Modo: Examen'}
            </Typography>

            <FormControl size="small" sx={{ width: 120 }}>
              <InputLabel>Modo</InputLabel>
              <Select value={mode} onChange={(e) => setMode(e.target.value as 'train' | 'exam')} label="Modo">
                <MenuItem value="train">Entrenamiento</MenuItem>
                <MenuItem value="exam">Examen</MenuItem>
              </Select>
            </FormControl>

            <TextField size="small" type="number" label="BPM" value={bpm}
                       onChange={e=>setBpm(Number(e.target.value))}
                       inputProps={{min:30,max:240,step:1}} sx={{ width:120 }}/>

            <TextField size="small" type="number" label="Repeticiones" value={repeats}
                       onChange={e=>setRepeats(Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
                       inputProps={{min:1,max:6,step:1}} sx={{ width:150 }}/>

            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Rango de notas</InputLabel>
              <Select value={noteRange} onChange={(e) => setNoteRange(e.target.value)} label="Rango de notas">
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

        {isPlaying && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 1, mb: 2, backgroundColor: 'rgba(33, 150, 243, 0.08)', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
              {bpm} BPM:
            </Typography>
            {[0,1,2,3].map(beat => (
              <Box key={beat} sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: currentBeat === beat ? '#2196f3' : '#e0e0e0', transition: 'background-color 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: currentBeat === beat ? 'white' : '#666', fontWeight: 'bold' }}>
                  {beat + 1}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {mode === 'exam' && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Figuras disponibles: redonda, blanca, negra y <strong>doble corchea</strong>{includeRests ? ' + silencios' : ''}
            </Typography>
            <Grid container spacing={1}>
              {[rowW, rowH, rowQ].map((r, i) => (
                <Grid item key={`${r.id}-pal-${i}`} xs={6} sm={3} md={3} lg={2.4 as any}>
                  <Paper variant="outlined" sx={{ p: 0.5, cursor: 'pointer', minHeight: PAL_H + 12, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'rgba(25,118,210,.05)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }} onClick={() => addToActive(r.durNota)}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <VFSnippet durations={[r.durNota]} />
                      <Typography variant="caption" sx={{ fontSize: 8, mt: 0.2 }}>Figura</Typography>
                    </Box>
                  </Paper>

                  {includeRests && (
                    <Paper variant="outlined" sx={{ p: 0.5, mt: 0.5, cursor: 'pointer', minHeight: PAL_H + 14, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'rgba(25,118,210,.05)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }} onClick={() => addToActive(r.durSilencio)}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <VFSnippet durations={[r.durSilencio]} />
                        <Typography variant="caption" sx={{ fontSize: 8, mt: 0.2 }}>Silencio</Typography>
                      </Box>
                    </Paper>
                  )}
                </Grid>
              ))}

              <Grid item key={'double8'} xs={6} sm={3} md={3} lg={2.4 as any}>
                <Paper variant="outlined" sx={{ p: 0.5, cursor: 'pointer', minHeight: PAL_H + 12, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'rgba(25,118,210,.05)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }} onClick={() => addToActive(['8','8'])}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <VFSnippet durations={['8','8']} />
                    <Typography variant="caption" sx={{ fontSize: 8, mt: 0.2 }}>Doble corchea</Typography>
                  </Box>
                </Paper>

                {includeRests && (
                  <Paper variant="outlined" sx={{ p: 0.5, mt: 0.5, cursor: 'pointer', minHeight: PAL_H + 14, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'rgba(25,118,210,.05)', transform: 'translateY(-1px)' }, transition: 'all 0.2s ease' }} onClick={() => addToActive('qr')}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <VFSnippet durations={['qr']} />
                      <Typography variant="caption" sx={{ fontSize: 8, mt: 0.2 }}>Silencio (¼)</Typography>
                    </Box>
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Stack>
        )}

        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, pt: 0.5 }}>
          {(mode === 'exam' ? answers : solution).map((m, idx) => {
            const sum = totalPulses(m.notes)
            const complete = Math.abs(sum - 4) < 1e-6
            const isActive = mode === 'exam' && idx === activeBar

            return (
              <Paper key={`bar-${idx}`} variant="outlined" onClick={() => mode === 'exam' && setActiveBar(idx)} sx={{ flex: '1 1 auto', minWidth: '320px', p: 1.5, cursor: mode === 'exam' ? 'pointer' : 'default', borderColor: isActive ? 'primary.main' : 'divider', borderWidth: isActive ? 2 : 1, bgcolor: isActive ? 'rgba(25,118,210,.03)' : undefined }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 700, color: isActive ? 'primary.main' : 'text.primary' }}>
                      Compás {idx + 1}
                    </Typography>
                    <Chip size="small" label={complete ? '4/4 ✓' : `${sum.toFixed(2)} / 4`} color={complete ? 'success' : 'default'} variant={complete ? 'filled' : 'outlined'} />
                    {mode === 'exam' && graded.length > 0 && graded[idx] && (
                      <Chip size="small" label={`${graded[idx].filter(Boolean).length}/${graded[idx].length}`} color={graded[idx].every(Boolean) ? 'success' : 'warning'} variant="outlined" />
                    )}
                  </Stack>

                  {mode === 'exam' && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); undoActive() }} disabled={activeBar !== idx || m.notes.length === 0}>
                        <Undo fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); clearActive() }} disabled={activeBar !== idx || m.notes.length === 0}>
                        <Delete fontSize="small" />
                      </IconButton>
                      <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={(e) => { e.stopPropagation(); pauseAll(true); playSequence([solution[idx]], repeats, idx) }}>
                        Oír
                      </Button>
                    </Stack>
                  )}
                  {mode === 'train' && (
                    <Button size="small" variant="outlined" startIcon={<PlayArrow />} onClick={(e) => { e.stopPropagation(); pauseAll(true); playSequence([solution[idx]], repeats, idx) }}>
                      Oír
                    </Button>
                  )}
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: mode === 'exam' || showSolution ? 1 : 0 }}>
                  <VFMeasure
                    notes={m.notes.length > 0 ? m.notes : [{ duration: 'qr', pitch: 'b/4' }]}
                    ts="4/4"
                    highlight={isPlaying && idx === currentBar ? currentNoteIndex ?? undefined : undefined}
                    showGrading={mode === 'exam' && graded.length > 0}
                    graded={graded[idx]}
                  />
                </Box>

                {mode === 'exam' && m.notes.length > 0 && (
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    {m.notes.filter(n => !n.duration.endsWith('r')).map((n, noteIdx) => {
                      const input = noteInputs[idx]?.[noteIdx] || ''
                      const parsed = parseNoteInput(input, pitchPool)
                      return (
                        <Grid item xs={6} md={4} key={`input-${idx}-${noteIdx}`}>
                          <TextField fullWidth size="small" label={`Nota ${noteIdx + 1}`} value={input} onChange={(e) => updateNotePitch(idx, noteIdx, e.target.value)} error={Boolean(input && !parsed.valid)} helperText={input && !parsed.valid ? 'Ej: C4 o Do4' : NOTE_NAMES[n.pitch] || n.pitch} />
                        </Grid>
                      )
                    })}
                  </Grid>
                )}

                {mode === 'train' && showSolution && (
                  <Box sx={{ borderTop: '1px dashed #ddd', pt: 1, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      💡 Solución correcta:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <VFMeasure
                        notes={solution[idx].notes}
                        ts="4/4"
                        highlight={isPlaying && idx === currentBar ? currentNoteIndex ?? undefined : undefined}
                      />
                    </Box>
                  </Box>
                )}

                {mode === 'train' && !showSolution && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 60, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1, mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Solución oculta
                    </Typography>
                  </Box>
                )}
              </Paper>
            )
          })}
        </Box>

        {mode === 'exam' && (
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt:2 }}>
            <Button variant="outlined" onClick={()=>{setAnswers(Array.from({length:barsCount},()=>({notes:[]})));setNoteInputs(Array.from({length:barsCount},()=>[]))}}>
              Limpiar todo
            </Button>
            <Button variant="contained" startIcon={<CheckCircle />} onClick={calificar} disabled={!allComplete}>
              Calificar
            </Button>
          </Stack>
        )}

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
          💡 {mode === 'train' ? 'Modo entrenamiento: escucha y observa la solución.' : 'Modo examen: construye el ritmo con la paleta y escribe la altura de cada nota (ej: C4 o Do4).'}
        </Typography>
      </Paper>
    </Box>
  )
}
