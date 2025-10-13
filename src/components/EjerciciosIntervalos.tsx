import React, { useEffect, useRef, useState } from 'react'
import {
  Container, Paper, Box, Grid, Typography, TextField, Select,
  InputLabel, FormControl, Stack, Button, MenuItem, Chip
} from '@mui/material'
import { PlayArrow, Pause, RestartAlt, CheckCircle, ArrowBack, Shuffle } from '@mui/icons-material'
import { Factory, Stave, StaveNote, Voice, Formatter, Accidental } from 'vexflow'
import * as Tone from 'tone'
import { useNavigate } from 'react-router-dom'

// ---------------- Audio sampler (persistente entre renders) ----------------
let toneSamplerRef: Tone.Sampler | null = null

// ---------------- Etiquetas bonitas (UI) ----------------
const LETTER_SPN: Record<string, string> = {
  c: 'C', 'c#': 'C♯', d: 'D', 'd#': 'D♯', e: 'E', f: 'F', 'f#': 'F♯',
  g: 'G', 'g#': 'G♯', a: 'A', 'a#': 'A♯', b: 'B'
}
const SOLFEGE: Record<string, string> = {
  c: 'Do', 'c#': 'Do♯', d: 'Re', 'd#': 'Re♯', e: 'Mi', f: 'Fa', 'f#': 'Fa♯',
  g: 'Sol', 'g#': 'Sol♯', a: 'La', 'a#': 'Si♭', b: 'Si'
}
const labelSPN = (vfKey: string): string => {
  const [s, o] = vfKey.split('/')
  return `${LETTER_SPN[s] ?? s.toUpperCase()}${o}`
}

const labelSolfege = (vfKey: string): string => {
  const [s, o] = vfKey.split('/')
  return `${SOLFEGE[s] ?? s.toUpperCase()}${o}`
}

// ---------------- Timing ----------------
type DurationType = 'q' | '8' | 'h'
type Duration = {
  label: string
  factor: number
  vf: 'q' | '8' | 'h'
}

const DURATIONS: Record<DurationType, Duration> = {
  q: { label: 'Negra', factor: 1, vf: 'q' as const },
  '8': { label: 'Corchea', factor: 0.5, vf: '8' as const },
  h: { label: 'Blanca', factor: 2, vf: 'h' as const },
}

// ---------------- Utilidades de pitch (Tone.js & synth) ----------------
const STEP_TO_INT: Record<string, number> = {
  c: 0, 'c#': 1, 'db': 1, d: 2, 'd#': 3, 'eb': 3, e: 4, f: 5, 'f#': 6, 'gb': 6,
  g: 7, 'g#': 8, 'ab': 8, a: 9, 'a#': 10, 'bb': 10, b: 11,
}
const INT_TO_ASCII = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

// Mapeo de intervalos respetando teoría musical desde Do
const INTERVAL_STEPS_FROM_C = [
  'c',   // 0 - Unísono
  'db',  // 1 - 2ª menor (Re♭, no Do♯)
  'd',   // 2 - 2ª mayor
  'eb',  // 3 - 3ª menor (Mi♭, no Re♯)
  'e',   // 4 - 3ª mayor
  'f',   // 5 - 4ª justa
  'gb',  // 6 - Tritono (Sol♭, no Fa♯ para ser consistente con bemoles)
  'g',   // 7 - 5ª justa
  'ab',  // 8 - 6ª menor (La♭, no Sol♯)
  'a',   // 9 - 6ª mayor
  'bb',  // 10 - 7ª menor (Si♭, no La♯)
  'b',   // 11 - 7ª mayor
  'c'    // 12 - Octava
]
function midiFromKey(key: string): number {
  const [s, o] = key.split('/')
  return (parseInt(o,10)+1)*12 + (STEP_TO_INT[s] ?? 0)
}

function toneNoteFromKey(key: string): string {
  const m = midiFromKey(key)
  return `${INT_TO_ASCII[m%12]}${Math.floor(m/12)-1}`
}
const AudioCtx = typeof window !== 'undefined'
  ? ((window as any).AudioContext || (window as any).webkitAudioContext)
  : null
const ctx: AudioContext | null = AudioCtx ? new AudioCtx() : null
let master: GainNode | null = ctx ? ctx.createGain() : null
if (master && ctx) { master.gain.value = 0.7; master.connect(ctx.destination) }

function freqOfKey(key: string): number {
  const midi = midiFromKey(key)
  return 440 * Math.pow(2, (midi - 69) / 12)
}
function pianoLike(freq: number, time: number, durSec: number): void {
  if (!ctx) return
  const out = ctx.createGain(); out.gain.value = 1
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'
  lp.frequency.setValueAtTime(10000, time)
  lp.frequency.exponentialRampToValueAtTime(1800, time + Math.min(0.6, durSec * 0.7))
  const pan = ctx.createStereoPanner()
  const panVal = Math.min(0.25, Math.max(-0.25, ((freq - 440) / 440) * 0.2))
  pan.pan.setValueAtTime(panVal, time)
  out.connect(lp); lp.connect(pan); pan.connect(master!)

  const PARTS: Array<{ type: OscillatorType; mult: number; g: number }> = [
    { type: 'triangle', mult: 1, g: 0.85 },
    { type: 'sine', mult: 2, g: 0.28 },
    { type: 'sine', mult: 3, g: 0.18 },
    { type: 'sine', mult: 4, g: 0.10 },
  ]
  PARTS.forEach(p => {
    const o = ctx.createOscillator(); o.type = p.type
    const g = ctx.createGain(); g.gain.value = 0
    o.frequency.setValueAtTime(freq * p.mult * 1.006, time)
    o.frequency.exponentialRampToValueAtTime(freq * p.mult, time + 0.03)
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(p.g, time + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0008, time + durSec * 0.95)
    o.connect(g); g.connect(out)
    o.start(time); o.stop(time + durSec)
  })
}

// ---------------- TypeScript interfaces ----------------
type Dir = 'ascending' | 'descending'
type Mode = 'train' | 'exam' | 'complete'
type Engine = 'yamaha' | 'synth'
type IntervalType = 'Justo' | 'Mayor' | 'Menor' | 'Aum/Dis'


interface IntervalRow {
  symbol: string
  name: string
  type: IntervalType
  semitones: number
}

interface CurrentInterval {
  base: string
  target: string
  symbol: string
  name: string
  type: string
  semitones: number
  direction: Dir
}

interface NoteDisplay {
  spn: string
  solfege: string
  show: boolean
}

// ---------------- Datos hardcodeados (base: Do4 = c/4) ----------------

const BASE_VF = 'c/4' // Do4 fijo

// ---------------- Notas base disponibles ----------------
const BASE_NOTES = [
  { step: 'c', label: 'Do', spn: 'C' },
  { step: 'c#', label: 'Do♯', spn: 'C♯' },
  { step: 'd', label: 'Re', spn: 'D' },
  { step: 'd#', label: 'Re♯', spn: 'D♯' },
  { step: 'e', label: 'Mi', spn: 'E' },
  { step: 'f', label: 'Fa', spn: 'F' },
  { step: 'f#', label: 'Fa♯', spn: 'F♯' },
  { step: 'g', label: 'Sol', spn: 'G' },
  { step: 'g#', label: 'Sol♯', spn: 'G♯' },
  { step: 'a', label: 'La', spn: 'A' },
  { step: 'a#', label: 'La♯', spn: 'A♯' },
  { step: 'b', label: 'Si', spn: 'B' },
]

const INTERVALS: IntervalRow[] = [
  { symbol:'P1', name:'Unísono',   type:'Justo',   semitones:0 },
  { symbol:'m2', name:'2ª menor',  type:'Menor',   semitones:1 },
  { symbol:'M2', name:'2ª mayor',  type:'Mayor',   semitones:2 },
  { symbol:'m3', name:'3ª menor',  type:'Menor',   semitones:3 },
  { symbol:'M3', name:'3ª mayor',  type:'Mayor',   semitones:4 },
  { symbol:'P4', name:'4ª justa',  type:'Justo',   semitones:5 },
  { symbol:'TT', name:'Tritono',   type:'Aum/Dis', semitones:6 },
  { symbol:'P5', name:'5ª justa',  type:'Justo',   semitones:7 },
  { symbol:'m6', name:'6ª menor',  type:'Menor',   semitones:8 },
  { symbol:'M6', name:'6ª mayor',  type:'Mayor',   semitones:9 },
  { symbol:'m7', name:'7ª menor',  type:'Menor',   semitones:10 },
  { symbol:'M7', name:'7ª mayor',  type:'Mayor',   semitones:11 },
  { symbol:'P8', name:'Octava',    type:'Justo',   semitones:12 }
]

// ---------------- Clave de sol ----------------
const CLEF = 'treble' as const

// ---------------- Componente principal ----------------
export default function IntervalosDo4Hardcoded() {
  const navigate = useNavigate()

  const [direction, setDirection] = useState<Dir>('ascending')
  const [selectedSymbol, setSelectedSymbol] = useState<string>('M3')
  const [bpm, setBpm] = useState<number>(60)
  const [dur, setDur] = useState<DurationType>('h')
  const [repetitions, setRepetitions] = useState<number>(5)
  const [mode, setMode] = useState<Mode>('train')
  const [engine, setEngine] = useState<Engine>('yamaha')

  // Estados para modo "Entrenamiento Completo"
  const [baseNote, setBaseNote] = useState<string>('c')
  const [isCompleteMode, setIsCompleteMode] = useState(false)
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0)
  const [pauseBetweenIntervals, setPauseBetweenIntervals] = useState(10) // ms

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingNote, setCurrentPlayingNote] = useState(-1)
  const [isPlayingChord, setIsPlayingChord] = useState(false)
  const [currentPlayingSymbol, setCurrentPlayingSymbol] = useState<string | null>(null)
  const [currentNoteDisplay, setCurrentNoteDisplay] = useState<NoteDisplay>({ spn:'', solfege:'', show:false })
  const [status, setStatus] = useState('Selecciona un intervalo y presiona "Nuevo".')

  const [currentInterval, setCurrentInterval] = useState<CurrentInterval | null>(null)

  const wrapA = useRef<HTMLDivElement | null>(null)
  const vfA = useRef<Factory | null>(null)
  const playTimeoutsRef = useRef<number[]>([])
  const loopRef = useRef<number | null>(null)

  useEffect(() => { drawStaff() }, [currentInterval, currentPlayingNote, isPlayingChord, dur, repetitions, isCompleteMode, baseNote, direction])
  useEffect(() => () => { stopAllSounds() }, [])

  // --------- Yamaha sampler
  async function ensureSampler(): Promise<Tone.Sampler> {
    if (toneSamplerRef) return toneSamplerRef
    await Tone.start()
    toneSamplerRef = new Tone.Sampler({
      urls: {
        A0:'A0.mp3', C1:'C1.mp3', 'D#1':'Ds1.mp3', 'F#1':'Fs1.mp3',
        A1:'A1.mp3', C2:'C2.mp3', 'D#2':'Ds2.mp3', 'F#2':'Fs2.mp3',
        A2:'A2.mp3', C3:'C3.mp3', 'D#3':'Ds3.mp3', 'F#3':'Fs3.mp3',
        A3:'A3.mp3', C4:'C4.mp3', 'D#4':'Ds4.mp3', 'F#4':'Fs4.mp3',
        A4:'A4.mp3', C5:'C5.mp3', 'D#5':'Ds5.mp3', 'F#5':'Fs5.mp3',
        A5:'A5.mp3', C6:'C6.mp3'
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/'
    }).toDestination()
    await Tone.loaded()
    return toneSamplerRef
  }
  function ensureAudio(): void { if (ctx && ctx.state === 'suspended') ctx.resume() }
  
  function stopAllSounds(): void {
    playTimeoutsRef.current.forEach(t=>clearTimeout(t))
    playTimeoutsRef.current=[]
    if (loopRef.current){ clearInterval(loopRef.current); loopRef.current=null }
    if (toneSamplerRef){ try { (toneSamplerRef as any).releaseAll?.() } catch{} }
    setCurrentPlayingSymbol(null)
    setIsPlaying(false)
  }

  // --------- Helpers de accidentales y drawing ----------
  const addAccidental = (note: StaveNote, step: string): StaveNote => {
    // Agrega ♯ o ♭ si el "step" termina con esos símbolos (evita confundir la nota B natural 'b')
    const acc = step.endsWith('#') ? '#' : (step.length > 1 && step.endsWith('b') ? 'b' : null)
    if (acc) note.addModifier(new Accidental(acc as '#' | 'b'), 0)
    return note
  }

  // --------- Dibujo del pentagrama (base -> target) x repeticiones
  function drawStaff(): void {
    if(!wrapA.current){ return }
    wrapA.current.innerHTML = ''

    // Inicializa el renderer usando el elemento
    if (!wrapA.current.id) wrapA.current.id = 'vexflow-staff'
    vfA.current = new Factory({ renderer: { elementId: wrapA.current.id, width: 10, height: 10 } })
    const ctxV = vfA.current.getContext()

    let notesStr: string[] = []
    const d = DURATIONS[dur].vf

    if(isCompleteMode) {
      // Modo completo: mostrar todos los intervalos desde la nota base
      const baseKey = `${baseNote}/4`
      for(let interval of INTERVALS) {
        const targetKey = calculateIntervalFromBase(baseNote, interval.semitones, direction)
        notesStr.push(baseKey, targetKey) // Cada intervalo como par
      }
      console.log('🎵 Modo completo - Intervalos:', INTERVALS.length, 'Notas generadas:', notesStr.length, notesStr)
    } else {
      // Estado vacío o modo normal
      if(!currentInterval){
        const containerWidth = wrapA.current.parentElement?.offsetWidth || window.innerWidth - 100
        const width = Math.max(600, containerWidth - 80)
        const height = 200
        vfA.current.getContext().resize(width, height)
        const stave = new Stave(20, 20, width - 40)
        stave.addClef(CLEF).addTimeSignature('4/4')
        stave.setContext(ctxV).draw()
        return
      }

      // Modo normal: un solo intervalo repetido
      const seq = [currentInterval.base, currentInterval.target]
      // Ahora necesitamos repetitions*2 veces las notas (para alternar arpegio/acorde)
      for(let i=0;i<repetitions*2;i++){ notesStr.push(...seq) }
    }

    // Crea Stave y calcula tamaño usando el ancho disponible del contenedor padre
    const containerWidth = wrapA.current.parentElement?.offsetWidth || window.innerWidth - 100
    const staffPadding = 40

    // Usar el ancho normal sin importar el modo
    const width = Math.max(600, containerWidth - 80)
    const height = 200

    vfA.current.getContext().resize(width, height)
    const stave = new Stave(staffPadding/2, 20, width - staffPadding)
    stave.addClef(CLEF).addTimeSignature('4/4').addKeySignature('C')
    stave.setContext(ctxV).draw()

    // Crea VexFlow StaveNotes con accidentales
    const vfNotes = notesStr.map((k, i) => {
      const [step] = k.split('/')
      const n = new StaveNote({ clef: CLEF, keys: [k], duration: d })

      // Lógica de coloreado mejorada
      let shouldColor = false

      if (isPlayingChord) {
        // En modo acorde: colorear el par de notas actual
        const pairIndex = Math.floor(currentPlayingNote / 2) // Qué par estamos reproduciendo
        const pairStart = pairIndex * 2
        const pairEnd = pairStart + 1
        shouldColor = (i === pairStart || i === pairEnd)
      } else {
        // En modo arpegio: colorear solo la nota específica
        shouldColor = (currentPlayingNote === i)
      }

      if (shouldColor) {
        n.setStyle({ fillStyle:'#ff6b35', strokeStyle:'#ff6b35' })
      }
      addAccidental(n, step)
      return n
    })

    if (isCompleteMode) {
      // En modo completo, usar una sola voz con todas las notas
      const totalBeats = vfNotes.length // Cada nota cuenta como 1 beat
      const voice = new Voice({ num_beats: totalBeats, beat_value: 4 }).setStrict(false)
      voice.addTickables(vfNotes)

      // Usar todo el ancho disponible
      const availableWidth = stave.getWidth() - 60
      new Formatter().joinVoices([voice]).format([voice], availableWidth)
      voice.draw(ctxV, stave)
    } else {
      // Modo normal
      const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false)
      voice.addTickables(vfNotes)
      const availableWidth = stave.getWidth() - 60
      new Formatter().joinVoices([voice]).format([voice], availableWidth)
      voice.draw(ctxV, stave)
    }
  }

  // --------- Generar intervalos desde cualquier nota base usando teoría musical
  function calculateIntervalFromBase(baseStep: string, semitones: number, dir: Dir): string {
    const baseInt = STEP_TO_INT[baseStep] ?? 0
    const baseOctave = 4 // Empezamos en octava 4

    let targetInt: number
    let targetOctave: number

    if (dir === 'ascending') {
      targetInt = baseInt + semitones
      targetOctave = baseOctave + Math.floor(targetInt / 12)
      targetInt = targetInt % 12
    } else {
      targetInt = baseInt - semitones
      targetOctave = baseOctave + Math.floor(targetInt / 12)
      if (targetInt < 0) {
        targetInt = (targetInt % 12 + 12) % 12
        targetOctave -= 1
      }
    }

    // Calcular el intervalo transpuesto desde Do
    let targetStep: string
    if (baseStep === 'c') {
      // Si la base es Do, usar directamente el mapeo de intervalos
      targetStep = INTERVAL_STEPS_FROM_C[semitones] || 'c'
    } else {
      // Para otras notas base, transponer el intervalo desde Do
      const intervalFromC = INTERVAL_STEPS_FROM_C[semitones] || 'c'
      const intervalInt = STEP_TO_INT[intervalFromC] ?? 0
      const baseFromC = STEP_TO_INT['c'] ?? 0
      const transposition = baseInt - baseFromC

      const transposedInt = (intervalInt + transposition + 12) % 12

      // Buscar la nota que corresponde a este entero, prefiriendo la misma "familia" de accidentales
      if (baseStep.includes('#')) {
        // Si la base tiene sostenido, preferir sostenidos
        targetStep = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'][transposedInt]
      } else if (baseStep.includes('b')) {
        // Si la base tiene bemol, preferir bemoles
        targetStep = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'][transposedInt]
      } else {
        // Para notas naturales, usar el mapeo estándar desde Do
        targetStep = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'][transposedInt]
      }
    }

    return `${targetStep}/${targetOctave}`
  }

  // --------- Generar (SIEMPRE calcula desde la nota base)
  function generateInterval(symbol: string = selectedSymbol, customBase?: string): void {
    const row = INTERVALS.find(r=>r.symbol===symbol)!

    // Determinar la nota base
    const baseNote = customBase || 'c' // Si no hay base personalizada, usar Do
    const base = `${baseNote}/4`
    const target = calculateIntervalFromBase(baseNote, row.semitones, direction)

    setCurrentInterval({
      base,
      target,
      symbol: row.symbol,
      name: row.name,
      type: row.type,
      semitones: row.semitones,
      direction
    })
    setStatus(`Intervalo: ${row.name} ${direction==='ascending'?'ascendente':'descendente'} desde ${labelSPN(base)}`)
  }
  function generateRandomInterval(): void {
    const pool = INTERVALS
    const pick = pool[Math.floor(Math.random()*pool.length)]
    setSelectedSymbol(pick.symbol)
    generateInterval(pick.symbol)
    setTimeout(()=>{ if(!isPlaying) playInterval() }, 400)
  }

  // --------- Modo Completo
  function generateCompleteIntervals(): void {
    setIsCompleteMode(true)
    // En modo completo no necesitamos currentInterval individual
    setStatus(`🎯 Modo Completo - Todos los intervalos desde ${BASE_NOTES.find(n => n.step === baseNote)?.label}4`)
  }

  function exitCompleteMode(): void {
    setIsCompleteMode(false)
    setIsPlaying(false)
    stopAllSounds()
    setStatus('Selecciona un intervalo y presiona "Nuevo".')
  }

  async function playCompleteSequence(): Promise<void> {
    // Inicializar Yamaha sampler si es necesario
    if(engine === 'yamaha') {
      try {
        await ensureSampler()
      } catch(e) {
        console.warn('Error inicializando Yamaha sampler:', e)
      }
    }

    const baseKey = `${baseNote}/4`
    const beatSec = 60 / bpm
    const len = DURATIONS[dur].factor
    const noteDur = len * beatSec
    const audioDur = noteDur * 0.95

    // Definir funciones locales para reproducción
    const playOne = (vfKey: string, i: number, delay: number): void => {
      const tId = window.setTimeout(()=>{
        setCurrentPlayingNote(i)
        setCurrentNoteDisplay({ spn:labelSPN(vfKey), solfege:labelSolfege(vfKey), show:true })

        if(engine==='yamaha' && toneSamplerRef){
          toneSamplerRef.triggerAttackRelease(toneNoteFromKey(vfKey), audioDur)
        } else {
          pianoLike(freqOfKey(vfKey), (ctx as AudioContext).currentTime, audioDur)
        }

        const clearId = window.setTimeout(()=>{
          const total = INTERVALS.length * 4 // 4 notas por intervalo
          if(i===total-1){
            setCurrentPlayingNote(-1)
            setIsPlayingChord(false)
            setCurrentNoteDisplay({ spn:'', solfege:'', show:false })
            setIsPlaying(false)
          }
        }, noteDur*1000*0.8)
        playTimeoutsRef.current.push(clearId)
      }, delay*1000)
      playTimeoutsRef.current.push(tId)
    }

    const playChordComplete = (notes: string[], startIndex: number, delay: number): void => {
      const tId = window.setTimeout(()=>{
        setIsPlayingChord(true)
        setCurrentPlayingNote(startIndex)

        const noteLabels = notes.map(vfKey => labelSPN(vfKey)).join(' + ')
        const solfegeLabels = notes.map(vfKey => labelSolfege(vfKey)).join(' + ')
        setCurrentNoteDisplay({ spn: noteLabels, solfege: solfegeLabels, show: true })

        if(engine==='yamaha' && toneSamplerRef){
          const now = Tone.now()
          notes.forEach(vfKey => {
            toneSamplerRef!.triggerAttackRelease(toneNoteFromKey(vfKey), audioDur, now)
          })
        } else {
          const startTime = (ctx as AudioContext).currentTime
          notes.forEach(vfKey => {
            pianoLike(freqOfKey(vfKey), startTime, audioDur)
          })
        }

        const clearId = window.setTimeout(()=>{
          setIsPlayingChord(false)
        }, noteDur*1000*0.8)
        playTimeoutsRef.current.push(clearId)
      }, delay*1000)
      playTimeoutsRef.current.push(tId)
    }

    let totalDelay = 0
    let noteIndex = 0

    for (let i = 0; i < INTERVALS.length; i++) {
      const interval = INTERVALS[i]
      const targetKey = calculateIntervalFromBase(baseNote, interval.semitones, direction)

      const pair = direction === 'ascending' ? [baseKey, targetKey] : [targetKey, baseKey]

      setStatus(`🎯 ${interval.name} (${i + 1}/${INTERVALS.length})`)

      // Actualizar el índice del intervalo cuando empiece el arpegio
      const updateIntervalIndex = (intervalIndex: number, delay: number): void => {
        const tId = window.setTimeout(() => {
          setCurrentIntervalIndex(intervalIndex)
        }, delay * 1000)
        playTimeoutsRef.current.push(tId)
      }

      // Actualizar índice al comenzar este intervalo
      updateIntervalIndex(i, totalDelay)

      // Arpegio
      playOne(pair[0], noteIndex, totalDelay)
      playOne(pair[1], noteIndex + 1, totalDelay + noteDur)

      // Pausa pequeña entre arpegio y acorde
      totalDelay += noteDur * 2 + 0.2

      // Acorde
      playChordComplete(pair, noteIndex + 2, totalDelay)

      // Pausa entre intervalos
      totalDelay += noteDur * 2 + (pauseBetweenIntervals / 1000)
      noteIndex += 4
    }

    // Terminar después de la secuencia completa
    const finishTimeout = setTimeout(() => {
      setIsPlaying(false)
      setCurrentPlayingNote(-1)
      setIsPlayingChord(false)
      setStatus('✅ Entrenamiento completo terminado')
    }, totalDelay * 1000)

    playTimeoutsRef.current.push(finishTimeout)
  }


  // --------- Reproducir
  async function playInterval(): Promise<void> {
    if(!isCompleteMode && !currentInterval){ setStatus('Primero genera un intervalo.'); return }
    if(isPlaying){
      setIsPlaying(false)
      setCurrentPlayingNote(-1)
      setIsPlayingChord(false)
      setCurrentNoteDisplay({ spn:'', solfege:'', show:false })
      setCurrentPlayingSymbol(null)
      stopAllSounds()
      return
    }

    ensureAudio()
    setIsPlaying(true)

    if(isCompleteMode) {
      // Modo completo: reproducir todos los intervalos secuencialmente
      await playCompleteSequence()
      return
    }

    setCurrentPlayingSymbol(currentInterval!.symbol)

    // Orden auditivo según dirección
    const pair = direction==='ascending'
      ? [currentInterval!.base, currentInterval!.target]
      : [currentInterval!.target, currentInterval!.base]

    const beatSec = 60 / bpm
    const len = DURATIONS[dur].factor
    const noteDur = len * beatSec
    const audioDur = noteDur * 0.95

    const playOne = (vfKey: string, i: number, delay: number): void => {
      const tId = window.setTimeout(()=>{
        setCurrentPlayingNote(i)
        setCurrentNoteDisplay({ spn:labelSPN(vfKey), solfege:labelSolfege(vfKey), show:true })

        if(engine==='yamaha' && toneSamplerRef){
          toneSamplerRef.triggerAttackRelease(toneNoteFromKey(vfKey), audioDur)
        } else {
          pianoLike(freqOfKey(vfKey), (ctx as AudioContext).currentTime, audioDur)
        }

        const clearId = window.setTimeout(()=>{
          const total = repetitions * 4 // Actualizado: ahora son más notas
          if(i===total-1){
            setCurrentPlayingNote(-1)
            setIsPlayingChord(false)
            setCurrentNoteDisplay({ spn:'', solfege:'', show:false })
            setCurrentPlayingSymbol(null)
            setIsPlaying(false)
          }
        }, noteDur*1000*0.8)
        playTimeoutsRef.current.push(clearId)
      }, delay*1000)
      playTimeoutsRef.current.push(tId)
    }

    const playCycle = (): void => {
      playTimeoutsRef.current.forEach(t=>clearTimeout(t))
      playTimeoutsRef.current=[]

      let totalDelay = 0
      let noteIndex = 0

      // N repeticiones alternando: arpegio, acorde, arpegio, acorde...
      for(let rep=0; rep<repetitions*2; rep++){
        const isArpeggio = rep % 2 === 0 // Alterna: rep 0,2,4... = arpegio, rep 1,3,5... = acorde

        if(isArpeggio){
          // Arpegio: nota por nota
          playOne(pair[0], noteIndex, totalDelay)
          playOne(pair[1], noteIndex+1, totalDelay + noteDur)
          noteIndex += 2
          totalDelay += noteDur * 2 // Siguiente repetición después de ambas notas
        } else {
          // Acorde: ambas notas al mismo tiempo (mismo índice visual para colorear ambas)
          playChord(pair, noteIndex, totalDelay)
          noteIndex += 2
          totalDelay += noteDur * 2 // Duración del acorde
        }
      }
    }

    // Nueva función para manejar acordes (colorea ambas notas)
    const playChord = (notes: string[], startIndex: number, delay: number): void => {
      const tId = window.setTimeout(()=>{
        // Activar modo acorde para colorear ambas notas
        setIsPlayingChord(true)
        setCurrentPlayingNote(startIndex) // Usar el índice correcto para el coloreado

        // Mostrar información de ambas notas
        const noteLabels = notes.map(vfKey => labelSPN(vfKey)).join(' + ')
        const solfegeLabels = notes.map(vfKey => labelSolfege(vfKey)).join(' + ')
        setCurrentNoteDisplay({ spn: noteLabels, solfege: solfegeLabels, show: true })

        // Reproducir ambas notas EXACTAMENTE al mismo tiempo
        if(engine==='yamaha' && toneSamplerRef){
          // Para Yamaha: usar triggerAttackRelease con tiempo específico para perfecta sincronización
          const now = Tone.now()
          // console.log('🎹 ACORDE:', notes.map(n => toneNoteFromKey(n)), 'en tiempo:', now)
          notes.forEach(vfKey => {
            toneSamplerRef!.triggerAttackRelease(toneNoteFromKey(vfKey), audioDur, now)
          })
        } else {
          // Para synth: capturar el tiempo una sola vez para ambas notas
          const startTime = (ctx as AudioContext).currentTime
          // console.log('🎹 ACORDE:', notes.map(n => labelSPN(n)), 'en tiempo:', startTime)
          notes.forEach(vfKey => {
            pianoLike(freqOfKey(vfKey), startTime, audioDur)
          })
        }

        const clearId = window.setTimeout(()=>{
          const total = repetitions * 4 // Ahora son repetitions*2 ciclos, cada uno con 2 notas
          if(startIndex+1 >= total-1){
            setCurrentPlayingNote(-1)
            setIsPlayingChord(false)
            setCurrentNoteDisplay({ spn:'', solfege:'', show:false })
            setCurrentPlayingSymbol(null)
            setIsPlaying(false)
          } else {
            setIsPlayingChord(false) // Desactivar modo acorde al final de cada ciclo
          }
        }, noteDur*1000*0.8)
        playTimeoutsRef.current.push(clearId)
      }, delay*1000)
      playTimeoutsRef.current.push(tId)
    }

    const totalCycle = (noteDur*2*repetitions*2)+1 // Ahora son repetitions*2 ciclos, cada uno toma noteDur*2
    const schedule = (): void => {
      playCycle()
      loopRef.current = window.setInterval(playCycle, totalCycle*1000)
    }

    if(engine==='yamaha'){ try { await ensureSampler(); schedule() } catch{ schedule() } }
    else { schedule() }
  }

  function checkAnswer(userSymbol: string): void {
    if(!currentInterval) return
    const ok = userSymbol === currentInterval.symbol
    setStatus(ok ? '¡Correcto!' : `Incorrecto. Era ${currentInterval.name} ${direction==='ascending'?'ascendente':'descendente'}.`)
  }

  // --------- UI
  return (
    <Container maxWidth="xl" className="wrap">
      <Stack spacing={2}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={()=>navigate('/')}>
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight:700, color:'#0b2a50', flex:1 }}>
            🎵 Intervalos desde Do4 (hardcoded)
          </Typography>
        </Box>

        {/* Tabla + Controles */}
        <Paper sx={{ p:2 }}>
          <Box sx={{ display:'flex', alignItems:'flex-start', flexWrap:'wrap', justifyContent:'center' }}>
            {/* Tabla compacta */}
            <Box sx={{ flex:'0 0 auto', width:'fit-content', overflowX:'auto', display:'inline-block' }}>
              <Typography variant="h6" sx={{ fontWeight:'bold', color:'primary.main', mb:1 }}>
                📐 Tabla de intervalos musicales
              </Typography>
              <table
                style={{ display:'inline-table', width:'auto', borderCollapse:'collapse', tableLayout:'auto' }}
                cellSpacing={0} cellPadding={0}
              >
                <thead>
                  <tr style={{ borderBottom:'1px solid #ddd' }}>
                    <th style={{ padding:'2px 4px', fontSize:'0.78em', fontWeight:700 }}>Semit.</th>
                    <th style={{ padding:'2px 4px', fontSize:'0.78em', fontWeight:700 }}>Tipo</th>
                    <th style={{ padding:'2px 4px', fontSize:'0.78em', fontWeight:700 }}>Nota inicio</th>
                    <th style={{ padding:'2px 4px', fontSize:'0.78em', fontWeight:700 }}>Símbolo / Intervalo</th>
                    <th style={{ padding:'2px 4px', fontSize:'0.78em', fontWeight:700 }}>Nota destino</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERVALS.map((row, idx)=>{
                    // Calcular la nota destino dinámicamente
                    const targetKey = calculateIntervalFromBase('c', row.semitones, direction)
                    const targetLabel = labelSPN(targetKey)
                    const playing = currentPlayingSymbol === row.symbol
                    const selected = selectedSymbol === row.symbol
                    return (
                      <tr key={row.symbol}
                        style={{
                          borderBottom:'1px solid #eee',
                          backgroundColor: playing ? 'rgba(255,107,53,0.28)' :
                                         selected ? 'rgba(33,150,243,0.15)' :
                                         (idx%2===0 ? '#fafafa' : '#fff')
                        }}
                      >
                        <td style={{ padding:'2px 4px', fontSize:'0.78em', textAlign:'center' }}>{row.semitones}</td>
                        <td style={{ padding:'2px 4px', fontSize:'0.78em', fontWeight:700, color: row.type==='Justo'?'#2e7d32':row.type==='Mayor'?'#1565c0':row.type==='Menor'?'#c62828':'#ed6c02', textAlign:'center' }}>
                          {row.type}
                        </td>
                        <td style={{ padding:'2px 4px', fontSize:'0.78em' }}>Do4</td>
                        <td style={{ padding:'2px 4px', fontSize:'0.78em', fontFamily:'monospace', fontWeight:700 }}>
                          {row.symbol} <span style={{ opacity:0.6 }}>/</span> <span style={{ fontWeight:500, fontFamily:'inherit' }}>{row.name}</span>
                        </td>
                        <td style={{ padding:'2px 4px', fontSize:'0.78em', fontFamily:'monospace' }}>
                          {targetLabel}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <Typography variant="caption" sx={{ mt: 1, display:'block', color:'text.secondary', fontStyle:'italic' }}>
                Base fija: Do4 (C4). Dirección asc/desc cambia la nota destino y el orden de reproducción.
              </Typography>
            </Box>

            {/* Controles */}
            <Box sx={{ width:{ xs:'100%', md:360 }, flex:'0 0 auto', ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight:'bold', color:'secondary.main', mb: 2 }}>
                🎛️ Controles
              </Typography>

              <Grid container spacing={1.2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="interval-label">Intervalo</InputLabel>
                    <Select
                      labelId="interval-label" label="Intervalo"
                      value={selectedSymbol} onChange={e=>setSelectedSymbol(e.target.value as string)}
                    >
                      {INTERVALS.map(r=>(
                        <MenuItem key={r.symbol} value={r.symbol}>{r.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="dir-label">Dirección</InputLabel>
                    <Select
                      labelId="dir-label" label="Dirección"
                      value={direction} onChange={e=>setDirection(e.target.value as Dir)}
                    >
                      <MenuItem value="ascending">Ascendente</MenuItem>
                      <MenuItem value="descending">Descendente</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={4}>
                  <TextField fullWidth size="small" type="number" label="BPM" value={bpm}
                    inputProps={{ min:40, max:180 }} onChange={e=>setBpm(Number(e.target.value)||60)} />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="dur-label">Duración</InputLabel>
                    <Select labelId="dur-label" label="Duración" value={dur} onChange={e=>setDur(e.target.value as 'q'|'8'|'h')}>
                      <MenuItem value="q">Negra</MenuItem>
                      <MenuItem value="8">Corchea</MenuItem>
                      <MenuItem value="h">Blanca</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="rep-label">Repeticiones</InputLabel>
                    <Select labelId="rep-label" label="Repeticiones" value={repetitions} onChange={e=>setRepetitions(Number(e.target.value))}>
                      {[1,2,3,4,5,6,8].map(n=><MenuItem key={n} value={n}>{n}x</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="mode-label">Modo</InputLabel>
                    <Select labelId="mode-label" label="Modo" value={mode} onChange={e=>setMode(e.target.value as 'train'|'exam')}>
                      <MenuItem value="train">Entrenamiento</MenuItem>
                      <MenuItem value="exam">Examen</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="eng-label">Audio</InputLabel>
                    <Select labelId="eng-label" label="Audio" value={engine} onChange={e=>setEngine(e.target.value as 'yamaha'|'synth')}>
                      <MenuItem value="yamaha">Yamaha</MenuItem>
                      <MenuItem value="synth">Synth</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={4}>
                  <Button fullWidth size="small" variant="contained" startIcon={<RestartAlt/>}
                    onClick={()=>generateInterval()}>
                    Nuevo
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth size="small" color="secondary" variant="contained" startIcon={<Shuffle/>}
                    onClick={generateRandomInterval}>
                    Random
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button fullWidth size="small" color="primary" variant="contained"
                    startIcon={isPlaying ? <Pause/> : <PlayArrow/>}
                    onClick={playInterval}
                    disabled={!selectedSymbol}>
                    {isPlaying ? 'Pausa' : 'Play'}
                  </Button>
                </Grid>

                {/* Modo Completo */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight:'bold', color:'success.main', mt: 2, mb: 1 }}>
                    🎯 Modo Completo
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="base-note-label">Nota Base</InputLabel>
                    <Select
                      labelId="base-note-label" label="Nota Base"
                      value={baseNote} onChange={e=>setBaseNote(e.target.value as string)}
                      disabled={isCompleteMode}
                    >
                      {BASE_NOTES.map(note=>(
                        <MenuItem key={note.step} value={note.step}>{note.label} ({note.spn}4)</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth size="small"
                    label="Pausa entre intervalos (ms)"
                    type="number"
                    value={pauseBetweenIntervals}
                    onChange={e=>setPauseBetweenIntervals(Number(e.target.value))}
                    inputProps={{ min: 10, max: 2000, step: 10 }}
                    disabled={isCompleteMode}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Button
                    fullWidth size="small"
                    color={isCompleteMode ? "warning" : "success"}
                    variant="contained"
                    onClick={isCompleteMode ? exitCompleteMode : generateCompleteIntervals}
                  >
                    {isCompleteMode ? "Salir Modo Completo" : "Activar Modo Completo"}
                  </Button>
                </Grid>

                <Grid item xs={6}>
                  <Button
                    fullWidth size="small"
                    color="primary" variant="contained"
                    startIcon={isPlaying ? <Pause/> : <PlayArrow/>}
                    onClick={playInterval}
                    disabled={!isCompleteMode && !selectedSymbol}
                  >
                    {isPlaying ? 'Pausar' : 'Reproducir'}
                  </Button>
                </Grid>

              </Grid>
            </Box>
          </Box>
        </Paper>

        {/* Pentagrama */}
        <Paper sx={{ p:2 }}>
          <Typography variant="body2" sx={{ mb:1, color:'text.secondary' }}>
            {isCompleteMode
              ? `Pentagrama — TODOS los intervalos desde ${BASE_NOTES.find(n => n.step === baseNote)?.label}4`
              : `Pentagrama — visualización del intervalo (${labelSPN(currentInterval?.base || BASE_VF)} → destino) × ${repetitions}`
            }
          </Typography>

          {mode==='train' && (isCompleteMode || currentInterval) && (
            <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', py:1, backgroundColor: isCompleteMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)', borderRadius:1, mb:1 }}>
              <Typography variant="h6" sx={{ fontWeight:'bold', color: isCompleteMode ? '#4caf50' : '#1976d2', textAlign:'center' }}>
                {isCompleteMode ? (
                  <>
                    🎯 Modo Completo — Todos los intervalos desde {BASE_NOTES.find(n => n.step === baseNote)?.label}4 {direction==='ascending' ? '↗️' : '↘️'}
                    {isPlaying && (
                      <Typography component="span" sx={{ ml: 2, fontSize: '0.8em', opacity: 0.8 }}>
                        ({currentIntervalIndex + 1}/{INTERVALS.length}) - {INTERVALS[currentIntervalIndex]?.name}
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    🎵 {currentInterval!.name} {currentInterval!.direction==='ascending' ? '↗️' : '↘️'} — {labelSPN(currentInterval!.base)} → {labelSPN(currentInterval!.target)} × {repetitions}
                  </>
                )}
              </Typography>
            </Box>
          )}

          {mode==='train' && (
            <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', py:1, backgroundColor:'rgba(255,107,53,0.1)', borderRadius:1, mb:1 }}>
              <Typography variant="h6" sx={{ fontWeight:'bold', color:'#ff6b35', textAlign:'center' }}>
                {currentNoteDisplay.show ? `♪ ${currentNoteDisplay.spn} (${currentNoteDisplay.solfege}) ♪` : '♪ Reproduciendo intervalo... ♪'}
              </Typography>
            </Box>
          )}

          <Box sx={{ display:'flex', justifyContent:'flex-start', overflowX:'auto' }}>
            <div ref={wrapA} />
          </Box>

          {mode==='train' && currentInterval && (
            <Box sx={{ mt:1, display:'flex', gap:1, flexWrap:'wrap', justifyContent:'center' }}>
              <Chip label={`${currentInterval.semitones} semitonos`} size="small" color="primary" />
              <Chip label={currentInterval.type} size="small" color="secondary" />
              <Chip label={currentInterval.direction==='ascending'?'Ascendente ↗️':'Descendente ↘️'} size="small" />
            </Box>
          )}
        </Paper>

        {/* Examen opcional */}
        {mode==='exam' && currentInterval && (
          <Paper sx={{ p:2 }}>
            <Typography variant="h6" sx={{ mb:1 }}>¿Qué intervalo es?</Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} md={8}>
                <FormControl fullWidth>
                  <InputLabel id="ans-label">Tu respuesta</InputLabel>
                  <Select labelId="ans-label" label="Tu respuesta" defaultValue="">
                    {INTERVALS.map(r=>(
                      <MenuItem key={r.symbol} value={r.symbol} onClick={()=>checkAnswer(r.symbol)}>
                        {r.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="outlined" startIcon={<CheckCircle/>} onClick={()=>checkAnswer(selectedSymbol)}>
                  Verificar con selección actual
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Box className="status" sx={{ p:2, backgroundColor:'rgba(0,0,0,0.05)', borderRadius:1 }}>
          {status}
        </Box>
      </Stack>
    </Container>
  )
}