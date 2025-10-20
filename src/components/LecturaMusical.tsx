import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Paper, Box, Grid, Typography, FormControl, InputLabel, Select, MenuItem,
  Button, Stack, Chip, Switch, FormControlLabel
} from '@mui/material'
import { PlayArrow, Pause, ArrowBack, Refresh, AccessTime } from '@mui/icons-material'
import { Factory, StaveNote, Stave, TickContext, Formatter } from 'vexflow'
import * as Tone from 'tone'
import { useNavigate } from 'react-router-dom'
import AlwaysOnTuner from './AlwaysOnTuner'

// ---------------- Audio globals (persistentes) ----------------
let samplerRef: Tone.Sampler | null = null
let clickSynthRef: Tone.Synth | null = null

async function ensureAudio() {
  await Tone.start()
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
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/'
    }).toDestination()
    await Tone.loaded()
  }
  if (!clickSynthRef) {
    clickSynthRef = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }
    }).toDestination()
    clickSynthRef.volume.value = -6
  }
}

// ---------------- Utilidades ----------------
const DURATIONS = ['w', 'h', 'q', '8'] as const // Redonda, blanca, negra, corchea
type DurationSym = typeof DURATIONS[number]

function randInt(n: number): number {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0] % n
  }
  return Math.floor(Math.random() * n)
}
function pick<T>(arr: readonly T[]): T { return arr[randInt(arr.length)] }

// VexFlow key ('c/4') -> Scientific Pitch ('C4' / 'F#4'…)
function keyToSPN(key: string): string {
  const [l, oct] = key.split('/')
  const letter = l[0].toUpperCase()
  const sharp = l.includes('#') ? '#' : ''
  return `${letter}${sharp}${oct}`
}

// beats por figura en 4/4
function beatsFromDur(d: DurationSym): number {
  return d === 'w' ? 4 : d === 'h' ? 2 : d === 'q' ? 1 : 0.5
}
// notación musical para Tone
function toneDur(d: DurationSym): string {
  return d === 'w' ? '1n' : d === 'h' ? '2n' : d === 'q' ? '4n' : '8n'
}

// convertir beats acumulados a "bars:beats:sixteenths" (4/4)
function beatsToBBS(totalBeats: number): string {
  const bar = Math.floor(totalBeats / 4)
  const beat = totalBeats % 4
  return `${bar}:${beat}:0`
}

// Rango 2 octavas naturales: C4..B5
const RANGE_2OCT: string[] = [
  'c/4','d/4','e/4','f/4','g/4','a/4','b/4',
  'c/5','d/5','e/5','f/5','g/5','a/5','b/5'
]

// Rango 2 octavas cromáticas: C4..C6 (12 notas x 2 octavas + C6)
const RANGE_2OCT_CHROMATIC: string[] = [
  'c/4','c#/4','d/4','d#/4','e/4','f/4','f#/4','g/4','g#/4','a/4','a#/4','b/4',
  'c/5','c#/5','d/5','d#/5','e/5','f/5','f#/5','g/5','g#/5','a/5','a#/5','b/5',
  'c/6'
]

// Nombres en español
const NOTE_NAMES: Record<string, string> = {
  'b/1':'Si1',
  'c/2':'Do2','d/2':'Re2','e/2':'Mi2','f/2':'Fa2','f#/2':'Fa#2','g/2':'Sol2','a/2':'La2','b/2':'Si2','bb/2':'Sib2',
  'c/3':'Do3','d/3':'Re3','e/3':'Mi3','f/3':'Fa3','g/3':'Sol3','a/3':'La3','b/3':'Si3',
  'c/4':'Do4','c#/4':'Do#4','d/4':'Re4','d#/4':'Re#4','e/4':'Mi4','f/4':'Fa4','f#/4':'Fa#4',
  'g/4':'Sol4','g#/4':'Sol#4','a/4':'La4','a#/4':'La#4','b/4':'Si4',
  'c/5':'Do5','c#/5':'Do#5','d/5':'Re5','d#/5':'Re#5','e/5':'Mi5','f/5':'Fa5','f#/5':'Fa#5',
  'g/5':'Sol5','g#/5':'Sol#5','a/5':'La5','a#/5':'La#5','b/5':'Si5',
  'c/6':'Do6'
}

// Mapeo de nota escrita vs nota que suena (para bajo con 8vb)
const NOTE_WRITTEN: Record<string, string> = {
  'b/1':'Si1',
  'c/2':'Do2','d/2':'Re2','e/2':'Mi2','f/2':'Fa2','f#/2':'Fa#2','g/2':'Sol2','a/2':'La2','b/2':'Si2','bb/2':'Sib2',
  'c/3':'Do3','d/3':'Re3','e/3':'Mi3','f/3':'Fa3','g/3':'Sol3','a/3':'La3','b/3':'Si3',
  'c/4':'Do4','d/4':'Re4','e/4':'Mi4','f/4':'Fa4','g/4':'Sol4','a/4':'La4','b/4':'Si4',
}

const NOTE_SOUNDS: Record<string, string> = {
  'b/1':'Si0',
  'c/2':'Do1','d/2':'Re1','e/2':'Mi1','f/2':'Fa1','f#/2':'Fa#1','g/2':'Sol1','a/2':'La1','b/2':'Si1','bb/2':'Sib1',
  'c/3':'Do2','d/3':'Re2','e/3':'Mi2','f/3':'Fa2','g/3':'Sol2','a/3':'La2','b/3':'Si2',
  'c/4':'Do3','d/4':'Re3','e/4':'Mi3','f/4':'Fa3','g/4':'Sol3','a/4':'La3','b/4':'Si3',
}

type ClefType = 'treble' | 'bass'
type ClefNotesMap = Readonly<Record<ClefType, readonly string[]>>

const CLEF_LINE_REFERENCES: Record<ClefType, readonly string[]> = {
  treble: ['e/4','g/4','b/4','d/5','f/5'], // Mi4, Sol4, Si4, Re5, Fa5
  bass: ['g/2','b/2','d/3','f/3','a/3']    // Sol2, Si2, Re3, Fa3, La3
} as const

type ExerciseConfig = {
  readonly name: string
  readonly notes: readonly string[]
  readonly description: string
  readonly clefNotes?: ClefNotesMap
}

// ---------------- Configuración de ejercicios ----------------
const TREBLE_EXERCISES = {
  // ========== PROGRESIÓN INCREMENTAL JAZZ — C4 a La5 ==========
  'jazz-1-do-sol': {
    name: '🎺 Jazz 1: Do y Sol (quinta justa)',
    notes: ['c/4','g/4','c/5','g/5'],
    description: 'Intervalos ancla del jazz: quinta justa. Base visual para leer el pentagrama.'
  },
  'jazz-2-do-sol-adyacentes': {
    name: '🎺 Jazz 2: Do-Re-Mi + Sol-La-Si (6 notas diatónicas)',
    notes: ['c/4','d/4','e/4','g/4','a/4','b/4','c/5','d/5','e/5','g/5','a/5','b/5','c/6'],
    description: 'Añade notas adyacentes a Do y Sol. Movimiento conjunto por pasos.'
  },
  'jazz-3-escala-mayor': {
    name: '🎺 Jazz 3: Escala mayor completa (7 notas)',
    notes: ['c/4','d/4','e/4','f/4','g/4','a/4','b/4','c/5','d/5','e/5','f/5','g/5','a/5'],
    description: 'Añade Fa. Escala diatónica completa de Do mayor: Do-Re-Mi-Fa-Sol-La-Si.'
  },
  'jazz-4-triada-mayor': {
    name: '🎺 Jazz 4: Tríada Do-Mi-Sol (enfoque armónico)',
    notes: ['c/4','e/4','g/4','c/5','e/5','g/5'],
    description: 'Acorde mayor básico (1-3-5). Reduce a las notas esenciales del acorde.'
  },
  'jazz-5-cmaj7': {
    name: '🎺 Jazz 5: Cmaj7 (Do-Mi-Sol-Si)',
    notes: ['c/4','e/4','g/4','b/4','c/5','e/5','g/5'],
    description: 'Añade Si (séptima mayor). Acorde jazz fundamental: Cmaj7.'
  },
  'jazz-6-septimas': {
    name: '🎺 Jazz 6: Acordes de séptima completos',
    notes: ['c/4','d/4','e/4','f/4','g/4','a/4','b/4','c/5','d/5','e/5','f/5','g/5','a/5'],
    description: 'Todas las notas diatónicas. Base armónica del jazz (maj7, dom7, min7).'
  },
  'jazz-7-pentatonica': {
    name: '🎺 Jazz 7: Pentatónica mayor (sin Fa ni Si)',
    notes: ['c/4','d/4','e/4','g/4','a/4','c/5','d/5','e/5','g/5','a/5'],
    description: 'Quita Fa y Si. Pentatónica para improvisación fluida (evita tensiones).'
  },
  'jazz-8-blues-notes': {
    name: '🎺 Jazz 8: Blues con notas blue (b3, b5, b7)',
    notes: ['c/4','d#/4','e/4','f/4','f#/4','g/4','a#/4','c/5','d#/5','e/5','f/5','f#/5','g/5','a/5'],
    description: 'Añade Mib, Fa#, Sib. Escala de blues con color característico del jazz.'
  },
  'jazz-9-cromatico': {
    name: '🎺 Jazz 9: Cromático completo (las 12 notas)',
    notes: ['c/4','c#/4','d/4','d#/4','e/4','f/4','f#/4','g/4','g#/4','a/4','a#/4','b/4',
            'c/5','c#/5','d/5','d#/5','e/5','f/5','f#/5','g/5','g#/5','a/5'],
    description: 'Todas las cromáticas C4-A5 (22 notas). Aproximaciones cromáticas típicas del bebop.'
  },
  'jazz-10-maestro': {
    name: '🎺 Jazz 10: Maestro — Todas las notas (nivel avanzado)',
    notes: ['c/4','c#/4','d/4','d#/4','e/4','f/4','f#/4','g/4','g#/4','a/4','a#/4','b/4',
            'c/5','c#/5','d/5','d#/5','e/5','f/5','f#/5','g/5','g#/5','a/5'],
    description: 'Consolidación: lectura cromática completa C4-A5. ¡Dominio total del pentagrama!'
  },

  // ========== EJERCICIOS CLÁSICOS (originales) ==========
  'clasico-lineas-sol': {
    name: '📖 Clásico: Líneas Clave Sol (Mi-Sol-Si-Re-Fa)',
    notes: ['e/4','g/4','b/4','d/5','f/5'],
    description: 'Solo notas sobre las líneas de la clave de Sol: Mi4, Sol4, Si4, Re5, Fa5.',
    clefNotes: {
      treble: ['e/4','g/4','b/4','d/5','f/5'],
      bass: ['g/2','b/2','d/3','f/3','a/3']
    }
  },
  'clasico-lineas-fa': {
    name: '📖 Clásico: Líneas Clave Fa 4ª (Sol-Si-Re-Fa-La)',
    notes: ['g/2','b/2','d/3','f/3','a/3'],
    description: 'Solo notas sobre las líneas de la clave de Fa en 4ª línea: Sol2, Si2, Re3, Fa3, La3.',
    clefNotes: {
      treble: ['e/4','g/4','b/4','d/5','f/5'],
      bass: ['g/2','b/2','d/3','f/3','a/3']
    }
  },
  'clasico-espacios-sol': {
    name: '📖 Clásico: Espacios (F4–A4–C5–E5)',
    notes: ['f/4','a/4','c/5','e/5'],
    description: 'Notas en espacios de la clave de Sol.'
  },
  'clasico-arpegio-mayor': {
    name: '📖 Clásico: Arpegios C mayor (2 octavas)',
    notes: ['c/4','e/4','g/4','c/5','e/5','g/5'],
    description: '1–3–5 en dos registros.'
  },
  'clasico-terceras': {
    name: '📖 Clásico: Saltos por terceras',
    notes: ['c/4','e/4','g/4','b/4','d/5','f/5','a/5','c/5','e/5','g/5','b/5'],
    description: 'Patrones 1–3–5…'
  },
  'clasico-cuartas-quintas': {
    name: '📖 Clásico: Saltos de 4ª/5ª',
    notes: ['c/4','f/4','g/4','d/5','a/5','e/5','b/5','g/5','c/5','f/5'],
    description: 'Saltos medios típicos.'
  },

  // ========== DANDELOT (LECTURA DIRIGIDA) ==========
  'dandelot-sol-la': {
    name: '📖 Dandelot: Sol-La-Sol-Do-Re-Fa-Si',
    notes: ['g/4','a/4','g/4','c/5','d/5','f/5','b/4','g/5'],
    description: 'Motivo fijo inspirado en Dandelot. Trabajo melódico con Sol-La-Sol-Do-Re-Fa-Si.',
    clefNotes: {
      treble: ['g/4','a/4','g/4','c/5','d/5','f/5','b/4','g/5'],
      bass: ['g/2','a/2','g/2','c/3','d/3','f/3','b/2','g/3']
    }
  },
  'dandelot-sol-la-lineas': {
    name: '📖 Dandelot: Sol-La-Sol-Do-Re-Mi-Fa-Si (con líneas adicionales)',
    notes: ['g/4','a/5','g/4','c/4','d/4','e/4','f/5','b/3'],
    description: 'Motivo Dandelot con líneas adicionales: La5 (línea superior), Do4, Re4 y Mi4 (debajo del pentagrama), Fa5, y Si3 (línea inferior). Practica lectura completa fuera del pentagrama.',
    clefNotes: {
      treble: ['g/4','a/5','g/4','c/4','d/4','e/4','f/5','b/3'],
      bass: ['g/2','a/3','g/2','c/2','d/2','e/2','f/3','b/1']
    }
  },
  'dandelot-sol-completo': {
    name: '📖 Dandelot Completo: Do4–Si5 (1 línea adicional)',
    notes: ['c/4','d/4','e/4','f/4','g/4','a/4','b/4','c/5','d/5','e/5','f/5','g/5','a/5','b/5'],
    description: 'Lectura integral en clave de Sol con todas las notas naturales, incluyendo las líneas adicionales inferiores y superiores (Do4 y Si5).'
  }
} as const
const BASS_EXERCISES = {
  'fa-lineas-c2-c3': {
    name: '🎼 Fa 1: Líneas Do2-Do3 (Mi2-Sol2-Si2-Re3-Fa3) [suena 8vb]',
    notes: ['e/2','g/2','b/2','d/3','f/3'],
    description: 'Líneas del pentagrama escritas en Do2-Do3 (suenan Do1-Do2). Notación estándar del bajo eléctrico con 8vb implícita.'
  },
  'fa-espacios-c2-c3': {
    name: '🎼 Fa 2: Espacios Do2-Do3 (Fa2-La2-Do3-Mi3) [suena 8vb]',
    notes: ['f/2','a/2','c/3','e/3'],
    description: 'Espacios del pentagrama escritos en Do2-Do3 (suenan Do1-Do2). Registro grave del bajo eléctrico.'
  },
  'fa-escala-do-c2-c3': {
    name: '🎼 Fa 3: Escala Do mayor (C2-C3) [suena C1-C2]',
    notes: ['c/2','d/2','e/2','f/2','g/2','a/2','b/2','c/3'],
    description: 'Escala de Do mayor escrita C2-C3 (suena C1-C2): notación estándar del bajo, una octava completa.'
  },
  'fa-walking-bass-c2-c3': {
    name: '🎼 Fa 4: Walking bass Do2-Do3 [suena C1-C2]',
    notes: ['c/2','d/2','e/2','f/2','g/2','a/2','b/2','c/3'],
    description: 'Walking bass escrito C2-C3 (suena C1-C2): notación estándar del bajo eléctrico, una octava completa.'
  },
  'fa-arpegios-c2-c3': {
    name: '🎼 Fa 5: Arpegios Do mayor (C2-C3) [suena C1-C2]',
    notes: ['c/2','e/2','g/2','c/3','g/2','e/2'],
    description: 'Arpegio de Do mayor escrito C2-C3 (suena C1-C2): notación estándar del bajo eléctrico.'
  },
  'fa-quintas-c2-c3': {
    name: '🎼 Fa 6: Quintas Do2-Do3 [suena C1-C2]',
    notes: ['c/2','g/2','f/2','c/3','d/2','a/2','e/2','b/2'],
    description: 'Saltos de quinta escritos C2-C3 (suenan C1-C2): patrón típico de líneas de bajo eléctrico.'
  },
  'fa-dandelot-do-c2-c3': {
    name: '🎼 Fa Dandelot: Do-Re-Mi-Fa-Sol (C2-G2) [suena C1-G1]',
    notes: ['c/2','d/2','e/2','f/2','g/2','f/2','e/2','d/2','c/2'],
    description: 'Motivo Dandelot escrito en C2-G2 (suena C1-G1): notación estándar del bajo, escala de 5 notas.'
  },
  'fa-dandelot-sol-c2-c3': {
    name: '🎼 Fa Dandelot: Sol-La-Si-Do (G2-C3) [suena G1-C2]',
    notes: ['g/2','a/2','b/2','c/3','b/2','a/2','g/2'],
    description: 'Motivo Dandelot escrito G2-C3 (suena G1-C2): notación estándar del bajo, completa el rango Do1-Do2.'
  },
  'fa-escala-do-c2-c4': {
    name: '🎼 Fa 9: Escala Do mayor (C2-C4) [suena C1-C3]',
    notes: ['c/2','d/2','e/2','f/2','g/2','a/2','b/2','c/3','d/3','e/3','f/3','g/3','a/3','b/3','c/4'],
    description: 'Escala de Do mayor escrita C2-C4 (suena C1-C3): dos octavas completas del bajo eléctrico, registro grave a medio.'
  }
} as const

const EXERCISES_BY_CLEF = {
  treble: TREBLE_EXERCISES,
  bass: BASS_EXERCISES
} as const

type ExerciseCollections = typeof EXERCISES_BY_CLEF
type ExerciseKeyByClef<C extends ClefType> = keyof ExerciseCollections[C]
type ExerciseKey = ExerciseKeyByClef<'treble'> | ExerciseKeyByClef<'bass'>

function resolveExerciseConfig(clef: ClefType, key: ExerciseKey): ExerciseConfig {
  const map = EXERCISES_BY_CLEF[clef] as Record<string, ExerciseConfig>
  if (Object.prototype.hasOwnProperty.call(map, key)) {
    return map[key]
  }
  const firstKey = Object.keys(map)[0]
  return map[firstKey]
}

function getNotePool(
  config: ExerciseConfig,
  clef: ClefType
): readonly string[] {
  const clefSpecific = config.clefNotes?.[clef]
  if (clefSpecific && clefSpecific.length > 0) return clefSpecific
  return config.notes
}

function generateExercise(notePool: readonly string[], length: number = 30): string[] {
  const out: string[] = []
  const notes = notePool
  if (notes.length === 0) return out

  const uniqueCount = new Set(notes).size
  const historyLimit = uniqueCount >= 4 ? 3 : uniqueCount === 3 ? 2 : uniqueCount === 2 ? 1 : 0

  // Hacer más aleatorio evitando repeticiones consecutivas y patrones cortos
  for (let i = 0; i < length; i++) {
    let newNote = pick(notes)
    if (historyLimit > 0) {
      const recent = out.slice(-historyLimit)
      const avoid = new Set(recent)
      let attempts = 0
      const maxAttempts = 30
      while (avoid.has(newNote) && attempts < maxAttempts) {
        newNote = pick(notes)
        attempts++
      }
    }
    out.push(newNote)
  }
  return out
}
function randomDurations(len: number): DurationSym[] {
  const out: DurationSym[] = []
  for (let i = 0; i < len; i++) out.push(pick(DURATIONS))
  return out
}

// ---------------- Componente principal ----------------
export default function LecturaMusical() {
  const navigate = useNavigate()

  const [selectedExercise, setSelectedExercise] = useState<ExerciseKey>('jazz-1-do-sol')
  const [selectedClef, setSelectedClef] = useState<ClefType>('treble')
  const [bpm, setBpm] = useState(60)
  const [duration, setDuration] = useState<DurationSym>('q') // por defecto NEGRA (walking bass)
  const [randomFigure, setRandomFigure] = useState(false)
  const [showNoteLabels, setShowNoteLabels] = useState(true)
  const [jazzStyle, setJazzStyle] = useState(true) // metrónomo estilo jazz (2 y 4 fuertes)
  const [reverseOrder, setReverseOrder] = useState(false) // invertir orden del ejercicio
  const [tunerEnabled, setTunerEnabled] = useState(false)

  const [currentExercise, setCurrentExercise] = useState<string[]>([])
  const [durSeq, setDurSeq] = useState<DurationSym[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [metronomeActive, setMetronomeActive] = useState(false) // true durante reproducción o metrónomo solo
  const [currentBeat, setCurrentBeat] = useState(0) // 0..3
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number | null>(null)

  const staff1Ref = useRef<HTMLDivElement | null>(null)
  const metronomeIdRef = useRef<number | null>(null)

  const clef = selectedClef
  const currentExerciseMap = EXERCISES_BY_CLEF[clef]
  useEffect(() => {
    setTunerEnabled(clef === 'bass')
  }, [clef])
  useEffect(() => {
    if (!Object.prototype.hasOwnProperty.call(currentExerciseMap, selectedExercise)) {
      const firstKey = Object.keys(currentExerciseMap)[0]
      if (firstKey) setSelectedExercise(firstKey as ExerciseKey)
    }
  }, [currentExerciseMap, selectedExercise])

  const config = useMemo(() => resolveExerciseConfig(clef, selectedExercise), [clef, selectedExercise])
  const notePool = useMemo(() => getNotePool(config, clef), [config, clef])
  const noteDisplayPool = useMemo(() => Array.from(new Set(notePool)), [notePool])
  const lineReferences = useMemo(() => CLEF_LINE_REFERENCES[clef], [clef])
  const [lineChipPositions, setLineChipPositions] = useState<number[]>([])

  // Generar ejercicio al cambiar selector
  useEffect(() => { generateNewExercise() /* eslint-disable-line */ }, [selectedExercise, clef])

  // Recalcular figuras cuando cambia el switch o la duración fija
  useEffect(() => {
    if (currentExercise.length === 0) return
    setDurSeq(randomFigure ? randomDurations(currentExercise.length)
                           : Array(currentExercise.length).fill(duration))
  }, [randomFigure, duration, currentExercise.length])

  // Limpieza global al desmontar
  useEffect(() => () => hardStop(), [])

  function generateNewExercise() {
    if (notePool.length === 0) {
      setCurrentExercise([])
      setDurSeq([])
      softStopUI()
      return
    }
    const ex = generateExercise(notePool, 30)
    setCurrentExercise(ex)
    setDurSeq(randomFigure ? randomDurations(ex.length)
                           : Array(ex.length).fill(duration))
    softStopUI()
  }

  // --------- Control del Transport ----------
  function hardStop() {
    try {
      Tone.Transport.stop()
      Tone.Transport.cancel(0)
      Tone.Transport.loop = false
    } catch {}
    softStopUI()
  }
  function softStopUI() {
    setIsPlaying(false)
    setMetronomeActive(false)
    setCurrentBeat(0)
    setCurrentNoteIndex(null)
  }

  // --------- Metrónomo con Tone.Transport (cuartos) ----------
  function scheduleMetronome() {
    if (metronomeIdRef.current !== null) {
      Tone.Transport.clear(metronomeIdRef.current)
      metronomeIdRef.current = null
    }
    // Repite cada negra; calculamos downbeat leyendo la posición del Transport
    const id = Tone.Transport.scheduleRepeat((time) => {
      const pos = Tone.Transport.position // "bar:beat:sixteenth"
      let beat = 0
      try {
        const parts = String(pos).split(':')
        beat = parseInt(parts[1] ?? '0', 10) || 0
      } catch {}

      // JAZZ: énfasis en 2 y 4 (backbeat) | CLÁSICO: énfasis en 1
      const isStrongBeat = jazzStyle
        ? (beat === 1 || beat === 3)  // Jazz: beats 2 y 4 (índice 1 y 3)
        : (beat === 0)                 // Clásico: beat 1 (índice 0)

      if (clickSynthRef) {
        const freq = isStrongBeat ? 1200 : 800  // Más agudo para fuertes en jazz
        clickSynthRef.volume.value = isStrongBeat ? -6 : -12
        clickSynthRef.triggerAttackRelease(freq, '32n', time)
      }
      setCurrentBeat(beat)
    }, '4n', '0:0:0')
    metronomeIdRef.current = id
  }

  async function toggleMetronomeOnly() {
    if (isPlaying) return // durante reproducción ya está el metrónomo
    if (metronomeActive) { hardStop(); return }
    await ensureAudio()
    Tone.Transport.cancel(0)
    Tone.Transport.bpm.value = bpm
    Tone.Transport.timeSignature = [4, 4]
    Tone.Transport.loop = false // metrónomo solo: no necesitamos loop de puntos, seguirá indefinidamente
    scheduleMetronome()
    setMetronomeActive(true)
    setCurrentBeat(0)
    Tone.Transport.position = '0:0:0'
    Tone.Transport.start('+0.05')
  }

  // --------- Dibujo del pentagrama ----------
  function drawStaff(
    containerRef: React.RefObject<HTMLDivElement | null>,
    notes: string[],
    durs: DurationSym[],
    clef: 'treble' | 'bass',
    highlight?: number,
    showLabels: boolean = true,
    onLinePositions?: (positions: number[]) => void
  ) {
    if (!containerRef.current) return
    containerRef.current.innerHTML = ''

    const bboxWidth = containerRef.current.getBoundingClientRect().width
    const width = Math.max(Math.floor(bboxWidth), 600)
    const height = 180
    const vf = new Factory({ renderer: { elementId: containerRef.current.id, width, height } })
    const ctx = vf.getContext()
    const stave = new Stave(10, 10, width - 20)

    stave.addClef(clef).addTimeSignature('4/4').setContext(ctx).draw()

    if (onLinePositions) {
      const positions = CLEF_LINE_REFERENCES[clef].map((_, idx) => {
        const lineIndex = 4 - idx
        return stave.getYForLine(lineIndex)
      })
      onLinePositions(positions)
    }

    if (notes.length === 0) return

    const staveNotes = notes.map((key, i) => {
      const dur = durs[i] ?? 'h'
      const note = new StaveNote({ clef, keys: [key], duration: dur })
      if (highlight === i) note.setStyle({ fillStyle: '#ff6b35', strokeStyle: '#ff6b35' })
      return note
    })

    try {
      Formatter.FormatAndDraw(ctx, stave, staveNotes)
      if (showLabels) {
        const leftPad = 50, rightPad = 20
        const leftEdge = stave.getX() + leftPad
        const rightEdge = stave.getX() + stave.getWidth() - rightPad
        const span = Math.max(1, rightEdge - leftEdge)
        staveNotes.forEach((_, i) => {
          const x = leftEdge + (span * (i + 0.5)) / notes.length
          const baseY = stave.getYForLine(4) + (clef === 'bass' ? 40 : 25)
          ctx.fillStyle = highlight === i ? '#ff6b35' : '#666'
          ctx.font = '10px Arial'

          if (clef === 'bass') {
            // Clave de Fa: dos líneas (nota escrita arriba, nota que suena abajo)
            const written = NOTE_WRITTEN[notes[i]] ?? NOTE_NAMES[notes[i]] ?? notes[i]
            const sounds = NOTE_SOUNDS[notes[i]] ?? ''
            const w1 = ctx.measureText(written).width
            ctx.fillText(written, x - w1 / 2, baseY)
            if (sounds) {
              ctx.font = '9px Arial'
              ctx.fillStyle = highlight === i ? '#ff6b35' : '#999'
              const w2 = ctx.measureText(`(${sounds})`).width
              ctx.fillText(`(${sounds})`, x - w2 / 2, baseY + 11)
            }
          } else {
            // Clave de Sol: una línea normal
            const label = NOTE_NAMES[notes[i]] ?? notes[i]
            const w = ctx.measureText(label).width
            ctx.fillText(label, x - w / 2, baseY)
          }
        })
      }
    } catch {
      const startX = stave.getNoteStartX()
      const totalBeats = durs.reduce((s,d)=>s+beatsFromDur(d),0)
      const span = stave.getWidth() - 60
      let accBeats = 0
      staveNotes.forEach((note, i) => {
        const nb = beatsFromDur(durs[i])
        const xCenter = startX + (span * (accBeats + nb/2)) / Math.max(1,totalBeats)
        const tc = new TickContext()
        tc.addTickable(note).preFormat().setX(xCenter)
        note.setTickContext(tc).setStave(stave)
        try { note.draw() } catch {}
        if (showLabels) {
          const baseY = stave.getYForLine(4) + (clef === 'bass' ? 40 : 25)
          ctx.fillStyle = highlight === i ? '#ff6b35' : '#666'
          ctx.font = '10px Arial'

          if (clef === 'bass') {
            // Clave de Fa: dos líneas (nota escrita arriba, nota que suena abajo)
            const written = NOTE_WRITTEN[notes[i]] ?? NOTE_NAMES[notes[i]] ?? notes[i]
            const sounds = NOTE_SOUNDS[notes[i]] ?? ''
            const w1 = ctx.measureText(written).width
            ctx.fillText(written, xCenter - w1 / 2, baseY)
            if (sounds) {
              ctx.font = '9px Arial'
              ctx.fillStyle = highlight === i ? '#ff6b35' : '#999'
              const w2 = ctx.measureText(`(${sounds})`).width
              ctx.fillText(`(${sounds})`, xCenter - w2 / 2, baseY + 11)
            }
          } else {
            // Clave de Sol: una línea normal
            const label = NOTE_NAMES[notes[i]] ?? notes[i]
            const w = ctx.measureText(label).width
            ctx.fillText(label, xCenter - w / 2, baseY)
          }
        }
        accBeats += nb
      })
    }
  }

  useEffect(() => {
    drawStaff(
      staff1Ref,
      currentExercise,
      durSeq,
      clef,
      currentNoteIndex ?? undefined,
      showNoteLabels,
      (positions) => {
        setLineChipPositions(prev => {
          if (prev.length === positions.length && prev.every((v, i) => Math.abs(v - positions[i]) < 0.5)) {
            return prev
          }
          return positions
        })
      }
    )
  }, [currentExercise, currentNoteIndex, durSeq, showNoteLabels, clef])

  // --------- Reproducción en bucle infinito ----------
  async function playExercise() {
    if (isPlaying) { hardStop(); return }
    if (currentExercise.length === 0) return

    await ensureAudio()
    // preparar tempo/compás y limpiar programación previa
    Tone.Transport.cancel(0)
    Tone.Transport.bpm.value = bpm
    Tone.Transport.timeSignature = [4, 4]
    Tone.Transport.position = '0:0:0'

    // beats totales para definir el loop
    const totalBeats = durSeq.reduce((s,d)=>s+beatsFromDur(d),0)
    const loopEnd = beatsToBBS(totalBeats)

    // programar metrónomo (no se autoapaga; corre mientras el Transport esté activo)
    scheduleMetronome()
    setMetronomeActive(true)
    setCurrentBeat(0)

    // Si reverseOrder está activo, invertir el orden de reproducción
    const playbackOrder = reverseOrder
      ? [...currentExercise].map((_, i) => currentExercise.length - 1 - i)
      : currentExercise.map((_, i) => i)

    // programar notas exactamente en su beat y se repetirán por el loop del Transport
    let accBeats = 0
    playbackOrder.forEach((originalIndex, playbackIndex) => {
      const key = currentExercise[originalIndex]
      const startAt = beatsToBBS(accBeats) // "bar:beat:0"
      const d = durSeq[originalIndex] ?? 'h'
      const durNotation = toneDur(d)
      const spn = keyToSPN(key)
      Tone.Transport.schedule((time) => {
        setCurrentNoteIndex(originalIndex) // Destacar la nota correcta en el pentagrama
        samplerRef!.triggerAttackRelease(spn, durNotation, time)
      }, startAt)
      accBeats += beatsFromDur(d)
    })

    // activar loop infinito sobre todo el ejercicio
    Tone.Transport.setLoopPoints('0:0:0', loopEnd)
    Tone.Transport.loop = true

    setIsPlaying(true)
    Tone.Transport.start('+0.05')
  }

  // -------------------- UI --------------------
  return (
    <Box sx={{ width: '100%', px: 2 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/')}>
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0b2a50', flex: 1 }}>
            📖 Lectura Musical — Método Dandelot (Sol · Fa)
          </Typography>
        </Box>

        {/* Controles */}
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Ejercicio</InputLabel>
                <Select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise(e.target.value as ExerciseKey)}
                  label="Ejercicio"
                >
                  {Object.entries(currentExerciseMap).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>{cfg.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>BPM</InputLabel>
                <Select value={bpm} onChange={(e) => setBpm(Number(e.target.value))} label="BPM">
                  {[40,50,60,72,80,96,100,120].map(v=>(
                    <MenuItem key={v} value={v}>{v} BPM</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Clave</InputLabel>
                <Select
                  value={clef}
                  onChange={(e) => setSelectedClef(e.target.value as ClefType)}
                  label="Clave"
                >
                  <MenuItem value="treble">Clave de Sol (G)</MenuItem>
                  <MenuItem value="bass">Clave de Fa en 4ª línea (F)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={<Switch checked={randomFigure} onChange={(e)=>setRandomFigure(e.target.checked)} />}
                label="Figuras aleatorias (w/h/q/8)"
              />
              <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                <InputLabel>Duración fija</InputLabel>
                <Select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value as DurationSym)}
                  label="Duración fija"
                  disabled={randomFigure}
                >
                  <MenuItem value="w">Redonda (w)</MenuItem>
                  <MenuItem value="h">Blanca (h)</MenuItem>
                  <MenuItem value="q">Negra (q) - Walking bass</MenuItem>
                  <MenuItem value="8">Corchea (8) - Swing</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={<Switch checked={showNoteLabels} onChange={(e)=>setShowNoteLabels(e.target.checked)} />}
                label="Mostrar nombres de notas"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch checked={jazzStyle} onChange={(e)=>setJazzStyle(e.target.checked)} />}
                label={jazzStyle ? "🎺 Metrónomo Jazz (2 y 4)" : "🎼 Metrónomo Clásico (1)"}
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch checked={reverseOrder} onChange={(e)=>setReverseOrder(e.target.checked)} />}
                label="🔄 Invertir orden (fin → inicio)"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch checked={tunerEnabled} onChange={(e)=>setTunerEnabled(e.target.checked)} />}
                label="🎯 Mostrar afinador"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={playExercise}
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  disabled={currentExercise.length === 0}
                >
                  {isPlaying ? 'Detener' : 'Reproducir (loop)'}
                </Button>
                <Button
                  variant={metronomeActive && !isPlaying ? 'contained' : 'outlined'}
                  color={metronomeActive && !isPlaying ? 'secondary' : 'inherit'}
                  onClick={toggleMetronomeOnly}
                  startIcon={<AccessTime />}
                  disabled={isPlaying}
                >
                  {metronomeActive && !isPlaying ? 'Parar metrónomo' : 'Metrónomo'}
                </Button>
                <Button variant="outlined" onClick={generateNewExercise} startIcon={<Refresh />}>
                  Nuevo
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip size="small" label={`${noteDisplayPool.length} alturas`} color="primary" />
                <Chip
                  size="small"
                  label={`Clave: ${clef === 'treble' ? 'Sol' : 'Fa en 4ª'}`}
                  color="secondary"
                />
                <Chip size="small" label="Ámbito variable" variant="outlined" />
                <Chip size="small" label={randomFigure ? 'Figuras: aleatorias' : `Figura fija: ${duration.toUpperCase()}`} />
                <Chip
                  size="small"
                  label={showNoteLabels ? 'Etiquetas: visibles' : 'Etiquetas: ocultas'}
                  color={showNoteLabels ? 'default' : 'success'}
                  variant={showNoteLabels ? 'outlined' : 'filled'}
                />
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {tunerEnabled && (
          <Paper sx={{ p: 2, borderLeft: '4px solid #4caf50' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'primary.dark' }}>
              🎯 Afinador en tiempo real
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Afina antes de leer: mantén tu instrumento cerca y verifica la afinación mientras practicas la clave seleccionada.
            </Typography>
            <AlwaysOnTuner />
          </Paper>
        )}

        {/* Descripción del ejercicio */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            {config.name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {config.description}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Typography variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
              Notas disponibles:
            </Typography>
            {noteDisplayPool.map(n => {
              const written = NOTE_WRITTEN[n] ?? NOTE_NAMES[n] ?? n
              const sounds = NOTE_SOUNDS[n]
              const label = clef === 'bass' && sounds ? `${written} (${sounds})` : (NOTE_NAMES[n] ?? n)
              return <Chip key={n} size="small" label={label} variant="outlined" color="primary" />
            })}
          </Stack>
        </Paper>

        {/* Pentagrama de Lectura + metrónomo visual */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', textAlign: 'center' }}>
            📖 Pentagrama de Lectura
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}>
            Lee las notas siguiendo el metrónomo (4/4). El ejercicio se repite en bucle hasta que detengas.
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}>
            Clave actual: {clef === 'treble' ? 'Sol (G clef)' : 'Fa en 4ª línea (F clef)'}
            {clef === 'bass' && <span style={{ color: '#ff6b35', fontWeight: 600 }}> - Notación 8vb: se escribe Do2 pero suena Do1 🎸</span>}
          </Typography>

          {(metronomeActive || isPlaying) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 1, mb: 2, backgroundColor: jazzStyle ? 'rgba(255, 152, 0, 0.08)' : 'rgba(33, 150, 243, 0.08)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                {bpm} BPM {jazzStyle ? '🎺' : '🎼'}:
              </Typography>
              {[0,1,2,3].map(beat => {
                const isStrongBeat = jazzStyle ? (beat === 1 || beat === 3) : (beat === 0)
                const isActive = currentBeat === beat
                return (
                  <Box
                    key={beat}
                    sx={{
                      width: isStrongBeat ? 26 : 22,
                      height: isStrongBeat ? 26 : 22,
                      borderRadius: '50%',
                      backgroundColor: isActive
                        ? (jazzStyle ? '#ff9800' : '#2196f3')
                        : (isStrongBeat ? '#ffcc80' : '#e0e0e0'),
                      transition: 'background-color 0.1s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: isStrongBeat ? '2px solid #ff9800' : 'none'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: isActive ? 'white' : '#666', fontWeight: isStrongBeat ? 'bold' : 'normal' }}>
                      {beat + 1}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, width: '100%' }}>
            <Box
              sx={{
                position: 'relative',
                width: '95%',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                bgcolor: 'rgba(0,0,0,0.01)',
                minHeight: 180,
                overflow: 'hidden'
              }}
            >
              <Box
                id="staff1"
                ref={staff1Ref}
                sx={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 72,
                  right: 12,
                  minHeight: 180
                }}
              />
              {lineReferences.map((key, idx) => {
                const top = lineChipPositions[idx]
                return (
                  <Chip
                    key={`${key}-${idx}`}
                    size="small"
                    label={keyToSPN(key)}
                    sx={{
                      position: 'absolute',
                      left: 12,
                      top: top != null ? top - 10 : (32 + idx * 24),
                      fontSize: '0.6rem',
                      height: 18,
                      minHeight: 'unset'
                    }}
                    variant="outlined"
                  />
                )
              })}
            </Box>
          </Box>

          {currentExercise.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>Secuencia actual:</Typography>
              <Box sx={{ mt: 1 }}>
                {currentExercise.map((note, i) => {
                  const written = NOTE_WRITTEN[note] ?? NOTE_NAMES[note] ?? note
                  const sounds = NOTE_SOUNDS[note]
                  const noteLabel = clef === 'bass' && sounds ? `${written} (${sounds})` : (NOTE_NAMES[note] ?? note)
                  return (
                    <Chip
                      key={`${note}-${i}`}
                      size="small"
                      label={`${noteLabel} · ${durSeq[i] ?? duration}`}
                      sx={{
                        mr: 0.5, mb: 0.5,
                        bgcolor: currentNoteIndex === i ? '#ff6b35' : undefined,
                        color: currentNoteIndex === i ? 'white' : undefined
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          )}
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', fontStyle: 'italic', textAlign: 'center' }}>
            💡 En 4/4: redonda=4 beats, blanca=2, negra=1, corchea=0.5. {jazzStyle ? '🎺 Jazz: énfasis en beats 2 y 4 (backbeat).' : '🎼 Clásico: énfasis en beat 1.'} Loop infinito hasta pulsar "Detener".
          </Typography>
        </Paper>

        {/* Instrucciones */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(255, 193, 7, 0.05)' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00', mb: 1 }}>
            📚 Instrucciones de uso
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2"><strong>1.</strong> Elige un ejercicio. 🎺 Jazz: progresión incremental desde Do-Sol. 📖 Clásico: ejercicios tradicionales.</Typography>
            <Typography variant="body2"><strong>2.</strong> Ajusta el BPM (40-120 recomendado para jazz).</Typography>
            <Typography variant="body2"><strong>3.</strong> Elige metrónomo: Jazz (énfasis 2 y 4) o Clásico (énfasis en 1).</Typography>
            <Typography variant="body2"><strong>4.</strong> Activa "Figuras aleatorias" o fija una figura (negras para walking bass, corcheas para swing).</Typography>
            <Typography variant="body2"><strong>5.</strong> Pulsa "Reproducir (loop)" para que el ejercicio se repita indefinidamente.</Typography>
            <Typography variant="body2"><strong>6.</strong> Pulsa "Detener" para parar el transporte y el metrónomo.</Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: '#ff9800' }}>
              💡 <strong>Tip de Jazz:</strong> En swing, las corcheas se tocan con un "feeling" desigual (la primera es más larga que la segunda), aunque en la partitura se vean iguales.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
