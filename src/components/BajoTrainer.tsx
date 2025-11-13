import React, { useEffect, useRef, useState } from 'react'
import {
  Paper, Box, Grid, Typography, TextField, MenuItem, Select,
  InputLabel, FormControl, Stack, Button, Chip, FormControlLabel, Checkbox, Switch
} from '@mui/material'
import { PlayArrow, Pause, ArrowBack } from '@mui/icons-material'
import { Factory, StaveNote, Stave, Accidental, Formatter } from 'vexflow'
import * as Tone from 'tone'
import { useNavigate } from 'react-router-dom'
import AlwaysOnTuner from './AlwaysOnTuner'
import { getYamahaSampler, releaseYamahaVoices } from '../utils/yamahaSampler'

// ---------------- Claves ----------------
const CLEF_CONFIGS = {
  treble: { name: 'Sol (2ª línea)', vexflowClef: 'treble' as const },
  bass: { name: 'Fa (4ª línea)', vexflowClef: 'bass' as const },
  bass_3rd: { name: 'Fa (3ª línea)', vexflowClef: 'baritone-f' as const },
} as const

// ---------------- ARPEGGIOS MAYORES — raíz en octava 2 para bass y bass_3rd ----------------
export const ARPEGGIO_PATHS_MAJOR: Record<'treble' | 'bass' | 'bass_3rd', Record<string, readonly string[]>> = {
  treble: {
    C:  ['c/4','e/4','g/4','c/5','c/5','g/4','e/4','c/4'],
    D:  ['d/4','f#/4','a/4','d/5','d/5','a/4','f#/4','d/4'],
    E:  ['e/4','g#/4','b/4','e/5','e/5','b/4','g#/4','e/4'],
    F:  ['f/4','a/4','c/5','f/5','f/5','c/5','a/4','f/4'],
    G:  ['g/4','b/4','d/5','g/5','g/5','d/5','b/4','g/4'],
    A:  ['a/4','c#/5','e/5','a/5','a/5','e/5','c#/5','a/4'],
    B:  ['b/4','d#/5','f#/5','b/5','b/5','f#/5','d#/5','b/4'],
  },

  // Graves
  bass: {
    C:  ['c/2','e/2','g/2','c/3','c/3','g/2','e/2','c/2'],
    D:  ['d/2','f#/2','a/2','d/3','d/3','a/2','f#/2','d/2'],
    E:  ['e/2','g#/2','b/2','e/3','e/3','b/2','g#/2','e/2'],
    F:  ['f/2','a/2','c/3','f/3','f/3','c/3','a/2','f/2'],
    G:  ['g/2','b/2','d/3','g/3','g/3','d/3','b/2','g/2'],
    A:  ['a/2','c#/3','e/3','a/3','a/3','e/3','c#/3','a/2'],
    B:  ['b/2','d#/3','f#/3','b/3','b/3','f#/3','d#/3','b/2'],
  },

  bass_3rd: {
    C:  ['c/2','e/2','g/2','c/3','c/3','g/2','e/2','c/2'],
    D:  ['d/2','f#/2','a/2','d/3','d/3','a/2','f#/2','d/2'],
    E:  ['e/2','g#/2','b/2','e/3','e/3','b/2','g#/2','e/2'],
    F:  ['f/2','a/2','c/3','f/3','f/3','c/3','a/2','f/2'],
    G:  ['g/2','b/2','d/3','g/3','g/3','d/3','b/2','g/2'],
    A:  ['a/2','c#/3','e/3','a/3','a/3','e/3','c#/3','a/2'],
    B:  ['b/2','d#/3','f#/3','b/3','b/3','f#/3','d#/3','b/2'],
  },
}

// ---------------- ARPEGGIOS MENORES (natural) — raíz en octava 2 para bass y bass_3rd ----------------
export const ARPEGGIO_PATHS_MINOR: Record<'treble' | 'bass' | 'bass_3rd', Record<string, readonly string[]>> = {
  treble: {
    A:  ['a/4','c/5','e/5','a/5','a/5','e/5','c/5','a/4'],
    B:  ['b/4','d/5','f#/5','b/5','b/5','f#/5','d/5','b/4'],
    C:  ['c/4','eb/4','g/4','c/5','c/5','g/4','eb/4','c/4'],
    D:  ['d/4','f/4','a/4','d/5','d/5','a/4','f/4','d/4'],
    E:  ['e/4','g/4','b/4','e/5','e/5','b/4','g/4','e/4'],
    F:  ['f/4','ab/4','c/5','f/5','f/5','c/5','ab/4','f/4'],
    G:  ['g/4','bb/4','d/5','g/5','g/5','d/5','bb/4','g/4'],
  },

  // Graves
  bass: {
    A:  ['a/2','c/3','e/3','a/3','a/3','e/3','c/3','a/2'],
    B:  ['b/2','d/3','f#/3','b/3','b/3','f#/3','d/3','b/2'],
    C:  ['c/2','eb/2','g/2','c/3','c/3','g/2','eb/2','c/2'],
    D:  ['d/2','f/2','a/2','d/3','d/3','a/2','f/2','d/2'],
    E:  ['e/2','g/2','b/2','e/3','e/3','b/2','g/2','e/2'],
    F:  ['f/2','ab/2','c/3','f/3','f/3','c/3','ab/2','f/2'],
    G:  ['g/2','bb/2','d/3','g/3','g/3','d/3','bb/2','g/2'],
  },

  bass_3rd: {
    A:  ['a/2','c/3','e/3','a/3','a/3','e/3','c/3','a/2'],
    B:  ['b/2','d/3','f#/3','b/3','b/3','f#/3','d/3','b/2'],
    C:  ['c/2','eb/2','g/2','c/3','c/3','g/2','eb/2','c/2'],
    D:  ['d/2','f/2','a/2','d/3','d/3','a/2','f/2','d/2'],
    E:  ['e/2','g/2','b/2','e/3','e/3','b/2','g/2','e/2'],
    F:  ['f/2','ab/2','c/3','f/3','f/3','c/3','ab/2','f/2'],
    G:  ['g/2','bb/2','d/3','g/3','g/3','d/3','bb/2','g/2'],
  },
}

// ---------------- Metadatos de escalas y arpegios (solo notas naturales) ----------------
const SCALE_META_MAJOR: Record<string, string> = {
  C: 'Do Mayor',
  D: 'Re Mayor',
  E: 'Mi Mayor',
  F: 'Fa Mayor',
  G: 'Sol Mayor',
  A: 'La Mayor',
  B: 'Si Mayor',
}

const SCALE_META_MINOR: Record<string, string> = {
  A: 'La menor (natural)',
  B: 'Si menor (natural)',
  C: 'Do menor (natural)',
  D: 'Re menor (natural)',
  E: 'Mi menor (natural)',
  F: 'Fa menor (natural)',
  G: 'Sol menor (natural)',
}

const ARPEGGIO_META_MAJOR: Record<string, string> = {
  C: 'Arpegio Do Mayor',
  D: 'Arpegio Re Mayor',
  E: 'Arpegio Mi Mayor',
  F: 'Arpegio Fa Mayor',
  G: 'Arpegio Sol Mayor',
  A: 'Arpegio La Mayor',
  B: 'Arpegio Si Mayor',
}

const ARPEGGIO_META_MINOR: Record<string, string> = {
  A: 'Arpegio La menor',
  B: 'Arpegio Si menor',
  C: 'Arpegio Do menor',
  D: 'Arpegio Re menor',
  E: 'Arpegio Mi menor',
  F: 'Arpegio Fa menor',
  G: 'Arpegio Sol menor',
}

type IntervalExercise = {
  id: string
  name: string
  description: string
  notes: readonly string[]
}

const INTERVAL_EXERCISES: IntervalExercise[] = [
  {
    id: 'interval-seconds',
    name: 'Intervalos de 2ª (movimiento conjunto)',
    description: 'Lectura de segundas mayores/menores dentro del registro grave (C2–D3).',
    notes: [
      'c/2','d/2','e/2','f/2','g/2','a/2','b/2','c/3',
      'd/3','c/3','b/2','a/2','g/2','f/2','e/2','d/2'
    ]
  },
  {
    id: 'interval-thirds',
    name: 'Intervalos de 3ª (Do–Mi…)',
    description: 'Saltos en terceras diatónicas pensados para visualización de líneas/espacios.',
    notes: [
      'c/2','e/2','d/2','f/2','e/2','g/2','f/2','a/2',
      'g/2','b/2','a/2','c/3','b/2','d/3','c/3','e/3'
    ]
  },
  {
    id: 'interval-fourths-fifths',
    name: 'Intervalos de 4ª y 5ª',
    description: 'Patrones de cuartas y quintas para ubicar saltos frecuentes en bajo.',
    notes: [
      'c/2','f/2','c/2','g/2','d/2','g/2','d/2','a/2',
      'e/2','a/2','e/2','b/2','f/2','bb/2','f/2','c/3'
    ]
  },
  {
    id: 'interval-sixths',
    name: 'Intervalos de 6ª',
    description: 'Saltos amplios manteniendo la referencia tonal dentro del pentagrama.',
    notes: [
      'c/2','a/2','d/2','b/2','e/2','c/3','f/2','d/3',
      'g/2','e/3','a/2','f/3','b/2','g/3','c/3','a/2'
    ]
  },
  {
    id: 'interval-octaves',
    name: 'Octavas alternadas',
    description: 'Alterna fundamental–octava para consolidar ubicación visual de las notas.',
    notes: [
      'c/2','c/3','d/2','d/3','e/2','e/3','f/2','f/3',
      'g/2','g/3','a/2','a/3','b/2','b/3','c/3','c/2'
    ]
  }
]

// ---------------- Rutas HARD-CODED (ESCALAS MAYORES) — grave (C2..C3) ----------------
const SCALE_PATHS_MAJOR: Record<'treble' | 'bass' | 'bass_3rd', Record<string, readonly string[]>> = {
  treble: {
    C: ['c/4','d/4','e/4','f/4','g/4','a/4','b/4','c/5','c/5','b/4','a/4','g/4','f/4','e/4','d/4','c/4'],
    D: ['d/4','e/4','f#/4','g/4','a/4','b/4','c#/5','d/5','d/5','c#/5','b/4','a/4','g/4','f#/4','e/4','d/4'],
    E: ['e/4','f#/4','g#/4','a/4','b/4','c#/5','d#/5','e/5','e/5','d#/5','c#/5','b/4','a/4','g#/4','f#/4','e/4'],
    F: ['f/4','g/4','a/4','bb/4','c/5','d/5','e/5','f/5','f/5','e/5','d/5','c/5','bb/4','a/4','g/4','f/4'],
    G: ['g/4','a/4','b/4','c/5','d/5','e/5','f#/5','g/5','g/5','f#/5','e/5','d/5','c/5','b/4','a/4','g/4'],
    A: ['a/4','b/4','c#/5','d/5','e/5','f#/5','g#/5','a/5','a/5','g#/5','f#/5','e/5','d/5','c#/5','b/4','a/4'],
    B: ['b/4','c#/5','d#/5','e/5','f#/5','g#/5','a#/5','b/5','b/5','a#/5','g#/5','f#/5','e/5','d#/5','c#/5','b/4'],
  },

  // ↓↓↓ BAJADAS A LA OCTAVA 2 ↓↓↓
  bass: {
    C: ['c/2','d/2','e/2','f/2','g/2','a/2','b/2','c/3','c/3','b/2','a/2','g/2','f/2','e/2','d/2','c/2'],
    D: ['d/2','e/2','f#/2','g/2','a/2','b/2','c#/3','d/3','d/3','c#/3','b/2','a/2','g/2','f#/2','e/2','d/2'],
    E: ['e/2','f#/2','g#/2','a/2','b/2','c#/3','d#/3','e/3','e/3','d#/3','c#/3','b/2','a/2','g#/2','f#/2','e/2'],
    F: ['f/2','g/2','a/2','bb/2','c/3','d/3','e/3','f/3','f/3','e/3','d/3','c/3','bb/2','a/2','g/2','f/2'],
    G: ['g/2','a/2','b/2','c/3','d/3','e/3','f#/3','g/3','g/3','f#/3','e/3','d/3','c/3','b/2','a/2','g/2'],
    A: ['a/2','b/2','c#/3','d/3','e/3','f#/3','g#/3','a/3','a/3','g#/3','f#/3','e/3','d/3','c#/3','b/2','a/2'],
    B: ['b/2','c#/3','d#/3','e/3','f#/3','g#/3','a#/3','b/3','b/3','a#/3','g#/3','f#/3','e/3','d#/3','c#/3','b/2'],
  },

  // Igual que bass, pero en clave Fa (3ª) — todos en la octava 2
  bass_3rd: {
    C: ['c/2','d/2','e/2','f/2','g/2','a/2','b/2','c/3','c/3','b/2','a/2','g/2','f/2','e/2','d/2','c/2'],
    D: ['d/2','e/2','f#/2','g/2','a/2','b/2','c#/3','d/3','d/3','c#/3','b/2','a/2','g/2','f#/2','e/2','d/2'],
    E: ['e/2','f#/2','g#/2','a/2','b/2','c#/3','d#/3','e/3','e/3','d#/3','c#/3','b/2','a/2','g#/2','f#/2','e/2'],
    F: ['f/2','g/2','a/2','bb/2','c/3','d/3','e/3','f/3','f/3','e/3','d/3','c/3','bb/2','a/2','g/2','f/2'],
    G: ['g/2','a/2','b/2','c/3','d/3','e/3','f#/3','g/3','g/3','f#/3','e/3','d/3','c/3','b/2','a/2','g/2'],
    A: ['a/2','b/2','c#/3','d/3','e/3','f#/3','g#/3','a/3','a/3','g#/3','f#/3','e/3','d/3','c#/3','b/2','a/2'],
    B: ['b/2','c#/3','d#/3','e/3','f#/3','g#/3','a#/3','b/3','b/3','a#/3','g#/3','f#/3','e/3','d#/3','c#/3','b/2'],
  },
}

// ---------------- Rutas HARD-CODED (ESCALAS MENORES NATURALES) — grave (C2..C3) ----------------
const SCALE_PATHS_MINOR: Record<'treble' | 'bass' | 'bass_3rd', Record<string, readonly string[]>> = {
  treble: {
    A: ['a/4','b/4','c/5','d/5','e/5','f/5','g/5','a/5','a/5','g/5','f/5','e/5','d/5','c/5','b/4','a/4'],
    B: ['b/4','c#/5','d/5','e/5','f#/5','g/5','a/5','b/5','b/5','a/5','g/5','f#/5','e/5','d/5','c#/5','b/4'],
    C: ['c/4','d/4','eb/4','f/4','g/4','ab/4','bb/4','c/5','c/5','bb/4','ab/4','g/4','f/4','eb/4','d/4','c/4'],
    D: ['d/4','e/4','f/4','g/4','a/4','bb/4','c/5','d/5','d/5','c/5','bb/4','a/4','g/4','f/4','e/4','d/4'],
    E: ['e/4','f#/4','g/4','a/4','b/4','c/5','d/5','e/5','e/5','d/5','c/5','b/4','a/4','g/4','f#/4','e/4'],
    F: ['f/4','g/4','ab/4','bb/4','c/5','db/5','eb/5','f/5','f/5','eb/5','db/5','c/5','bb/4','ab/4','g/4','f/4'],
    G: ['g/4','a/4','bb/4','c/5','d/5','eb/5','f/5','g/5','g/5','f/5','eb/5','d/5','c/5','bb/4','a/4','g/4'],
  },

  // ↓↓↓ BAJADAS A LA OCTAVA 2 ↓↓↓
  bass: {
    A: ['a/2','b/2','c/3','d/3','e/3','f/3','g/3','a/3','a/3','g/3','f/3','e/3','d/3','c/3','b/2','a/2'],
    B: ['b/2','c#/3','d/3','e/3','f#/3','g/3','a/3','b/3','b/3','a/3','g/3','f#/3','e/3','d/3','c#/3','b/2'],
    C: ['c/2','d/2','eb/2','f/2','g/2','ab/2','bb/2','c/3','c/3','bb/2','ab/2','g/2','f/2','eb/2','d/2','c/2'],
    D: ['d/2','e/2','f/2','g/2','a/2','bb/2','c/3','d/3','d/3','c/3','bb/2','a/2','g/2','f/2','e/2','d/2'],
    E: ['e/2','f#/2','g/2','a/2','b/2','c/3','d/3','e/3','e/3','d/3','c/3','b/2','a/2','g/2','f#/2','e/2'],
    F: ['f/2','g/2','ab/2','bb/2','c/3','db/3','eb/3','f/3','f/3','eb/3','db/3','c/3','bb/2','ab/2','g/2','f/2'],
    G: ['g/2','a/2','bb/2','c/3','d/3','eb/3','f/3','g/3','g/3','f/3','eb/3','d/3','c/3','bb/2','a/2','g/2'],
  },

  // Igual que bass, pero en clave Fa (3ª)
  bass_3rd: {
    A: ['a/2','b/2','c/3','d/3','e/3','f/3','g/3','a/3','a/3','g/3','f/3','e/3','d/3','c/3','b/2','a/2'],
    B: ['b/2','c#/3','d/3','e/3','f#/3','g/3','a/3','b/3','b/3','a/3','g/3','f#/3','e/3','d/3','c#/3','b/2'],
    C: ['c/2','d/2','eb/2','f/2','g/2','ab/2','bb/2','c/3','c/3','bb/2','ab/2','g/2','f/2','eb/2','d/2','c/2'],
    D: ['d/2','e/2','f/2','g/2','a/2','bb/2','c/3','d/3','d/3','c/3','bb/2','a/2','g/2','f/2','e/2','d/2'],
    E: ['e/2','f#/2','g/2','a/2','b/2','c/3','d/3','e/3','e/3','d/3','c/3','b/2','a/2','g/2','f#/2','e/2'],
    F: ['f/2','g/2','ab/2','bb/2','c/3','db/3','eb/3','f/3','f/3','eb/3','db/3','c/3','bb/2','ab/2','g/2','f/2'],
    G: ['g/2','a/2','bb/2','c/3','d/3','eb/3','f/3','g/3','g/3','f/3','eb/3','d/3','c/3','bb/2','a/2','g/2'],
  },
}

// ---------------- Utilidades de etiquetas y audio ----------------
const LETTERS: Record<string, string> = {
  c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', a: 'A', b: 'B',
  'c#': 'C♯', 'd#': 'D♯', 'f#': 'F♯', 'g#': 'G♯', 'a#': 'A♯',
  db: 'D♭', eb: 'E♭', gb: 'G♭', ab: 'A♭', bb: 'B♭',
  'e#': 'E♯', 'b#': 'B♯', cb: 'C♭', fb: 'F♭'
}
const SOLFEGE: Record<string, string> = {
  c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si',
  'c#': 'Do♯', 'd#': 'Re♯', 'f#': 'Fa♯', 'g#': 'Sol♯', 'a#': 'La♯',
  db: 'Re♭', eb: 'Mi♭', gb: 'Sol♭', ab: 'La♭', bb: 'Si♭',
  'e#': 'Mi♯', 'b#': 'Si♯', cb: 'Do♭', fb: 'Fa♭'
}

// MIDI helpers (para reproducir)
const STEPS: Record<string, number> = {
  c: 0, 'c#': 1, db: 1,
  d: 2, 'd#': 3, eb: 3,
  e: 4, 'e#': 5, fb: 4,
  f: 5, 'f#': 6, gb: 6,
  g: 7, 'g#': 8, ab: 8,
  a: 9, 'a#': 10, bb: 10,
  b: 11, 'b#': 0, cb: 11
}
function midiFromKey(key: string) {
  const [s, o] = key.split('/')
  let octave = parseInt(o, 10)
  let n = s
  if (s === 'b#') { n = 'c'; octave += 1 }
  else if (s === 'e#') n = 'f'
  else if (s === 'cb') { n = 'b'; octave -= 1 }
  else if (s === 'fb') n = 'e'
  return (octave + 1) * 12 + (STEPS[n] ?? 0)
}
const NAMES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const NAMES_SHARP_LOWER = ['c','c#','d','d#','e','f','f#','g','g#','a','a#','b']
function midiToToneName(midi: number) {
  const name = NAMES_SHARP[midi % 12]
  const oct = Math.floor(midi / 12) - 1
  return `${name}${oct}`
}
function keyFromMidi(midi: number) {
  const name = NAMES_SHARP_LOWER[midi % 12]
  const oct = Math.floor(midi / 12) - 1
  return `${name}/${oct}`
}
function toneNoteFromKey(key: string) {
  const midi = midiFromKey(key)
  return midiToToneName(midi)
}
function prettyFromKey(key: string) {
  const [s, o] = key.split('/')
  const symbol = (LETTERS as Record<string, string>)[s] ?? s.toUpperCase().replace(/#/g,'♯').replace(/b/g,'♭')
  return `${symbol}${o}`
}
function labelSolfege(key: string) {
  const [s, o] = key.split('/')
  return `${(SOLFEGE[s] || s.toUpperCase())}${o}`
}

// ---------------- Audio ----------------
const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null
const ctx = AudioCtx ? new AudioCtx() : null
let master = ctx ? ctx.createGain() : null
if (master && ctx) { master.gain.value = 0.7; master.connect(ctx.destination) }

function freqOfKey(key: string) { return 440 * Math.pow(2, (midiFromKey(key) - 69) / 12) }
function pianoLike(freq: number, time: number, durSec: number) {
  if (!ctx) return
  const out = ctx.createGain(); out.gain.value = 1
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'
  lp.frequency.setValueAtTime(10000, time)
  lp.frequency.exponentialRampToValueAtTime(1800, time + Math.min(0.6, durSec * 0.7))
  const pan = (ctx as AudioContext).createStereoPanner()
  const panVal = Math.max(-0.25, Math.min(0.25, (freq - 440) / 440 * 0.2))
  pan.pan.setValueAtTime(panVal, time)
  out.connect(lp); lp.connect(pan); pan.connect(master!)

  const PARTS = [
    { type: 'triangle' as OscillatorType, mult: 1, g: 0.85 },
    { type: 'sine' as OscillatorType, mult: 2, g: 0.28 },
    { type: 'sine' as OscillatorType, mult: 3, g: 0.18 },
    { type: 'sine' as OscillatorType, mult: 4, g: 0.10 },
  ]
  PARTS.forEach(p => {
    const o = ctx!.createOscillator(); o.type = p.type
    const g = ctx!.createGain(); g.gain.value = 0
    o.frequency.setValueAtTime(freq * p.mult * 1.006, time)
    o.frequency.exponentialRampToValueAtTime(freq * p.mult, time + 0.03)
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(p.g, time + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0008, time + durSec * 0.95)
    o.connect(g); g.connect(out)
    o.start(time); o.stop(time + durSec)
  })
}

// ---------------- UI principal ----------------

// ------ Notas válidas por cuerda (afinación estándar 5c: B0–E1–A1–D2–G2) ------
const BASS_STRINGS = [
  { id: 'B', name: 'B (5ª)', baseKey: 'b/0' },
  { id: 'E', name: 'E (4ª)', baseKey: 'e/1' },
  { id: 'A', name: 'A (3ª)', baseKey: 'a/1' },
  { id: 'D', name: 'D (2ª)', baseKey: 'd/2' },
  { id: 'G', name: 'G (1ª)', baseKey: 'g/2' },
] as const
type StringId = typeof BASS_STRINGS[number]['id']

function noteKeyForStringFret(stringId: StringId, fret: number) {
  const info = BASS_STRINGS.find(s => s.id === stringId)!
  const baseMidi = midiFromKey(info.baseKey)
  const midi = baseMidi + fret
  return keyFromMidi(midi)
}

export default function BajoTrainer() {
  const navigate = useNavigate()

  // ---- Estados base ----
  const [trainerMode, setTrainerMode] = useState<'scales' | 'intervals'>('scales')
  const [selectedClef, setSelectedClef] = useState<'treble' | 'bass' | 'bass_3rd'>('bass')
  const [exerciseType, setExerciseType] = useState<'major_scales' | 'minor_scales' | 'major_arpeggios' | 'minor_arpeggios'>('major_scales')
  const [selectedKey, setSelectedKey] = useState<string>('C')
  const [selectedIntervalId, setSelectedIntervalId] = useState<string>(INTERVAL_EXERCISES[0]?.id ?? 'interval-seconds')
  const [bpm, setBpm] = useState(80)
  const [dur, setDur] = useState<'w' | 'h' | 'q'>('w') // por defecto REDONDA
  const [noteRotation, setNoteRotation] = useState(false) // switch rotación de figuras
  const [metronomeActive, setMetronomeActive] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0) // 0..3 para 4/4
  const [exerciseCycleCount, setExerciseCycleCount] = useState(0) // contador de ciclos completos
  const [currentExerciseDuration, setCurrentExerciseDuration] = useState<'w' | 'h' | 'q'>('w') // duración actual del ejercicio completo
  const [currentScale, setCurrentScale] = useState<{ name: string; notes: readonly string[]; description?: string } | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false) // flag para evitar recursión en rotación

  // ---- Reproducción ----
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingNote, setCurrentPlayingNote] = useState(-1)
  const [currentNoteDisplay, setCurrentNoteDisplay] = useState({ spn: '', solfege: '', show: false })

  // ---- Modo “Nota fija” ----
  const [fixedMode, setFixedMode] = useState(false)
  const [fixedString, setFixedString] = useState<StringId>('B')
  const [fixedFret, setFixedFret] = useState<number>(0)

  // ---- Otros ----
  const wrapA = useRef<HTMLDivElement | null>(null)
  const vfA = useRef<any>(null)
  const playTimeoutsRef = useRef<number[]>([])
  const playIntervalRef = useRef<number | null>(null)
  const metronomeIdRef = useRef<number | null>(null)
  // Señal para encadenar automáticamente el siguiente ciclo en rotación
  const autoNextRef = useRef(false)
  // Duración efectivamente usada en el ciclo actual (para calcular la siguiente)
  const currentCycleDurRef = useRef<'w' | 'h' | 'q'>('w')
  const currentClefConfig = CLEF_CONFIGS[selectedClef]

  // Claves disponibles (solo notas naturales)
  const naturalKeys = ['C','D','E','F','G','A','B']
  const naturalKeysMinor = ['A','B','C','D','E','F','G']

  // Ciclo de rotación de figuras: ejercicio completo con redonda → ejercicio completo con blanca → ejercicio completo con negra
  const rotationCycle: ('w' | 'h' | 'q')[] = ['w', 'h', 'q']
  const selectedInterval = (INTERVAL_EXERCISES.find(ex => ex.id === selectedIntervalId) ?? INTERVAL_EXERCISES[0]) as IntervalExercise

  function getCurrentExerciseDuration(): 'w' | 'h' | 'q' {
    if (!noteRotation) return dur
    return rotationCycle[exerciseCycleCount % rotationCycle.length]
  }

  function getExerciseDurationLabel(duration: 'w' | 'h' | 'q'): string {
    return duration === 'w' ? 'Redondas' : duration === 'h' ? 'Blancas' : 'Negras'
  }

  // Construir ruta según tipo de ejercicio
  useEffect(() => {
    if (trainerMode !== 'scales' || fixedMode) return

    let paths: Record<'treble' | 'bass' | 'bass_3rd', Record<string, readonly string[]>>
    let meta: Record<string, string>

    switch (exerciseType) {
      case 'major_scales':
        paths = SCALE_PATHS_MAJOR
        meta = SCALE_META_MAJOR
        break
      case 'minor_scales':
        paths = SCALE_PATHS_MINOR
        meta = SCALE_META_MINOR
        break
      case 'major_arpeggios':
        paths = ARPEGGIO_PATHS_MAJOR
        meta = ARPEGGIO_META_MAJOR
        break
      case 'minor_arpeggios':
        paths = ARPEGGIO_PATHS_MINOR
        meta = ARPEGGIO_META_MINOR
        break
      default:
        paths = SCALE_PATHS_MAJOR
        meta = SCALE_META_MAJOR
    }

    const path = paths[selectedClef]?.[selectedKey]
    if (path) setCurrentScale({ name: meta[selectedKey], notes: path })
    else setCurrentScale(null)
  }, [selectedKey, selectedClef, fixedMode, exerciseType, trainerMode])

  useEffect(() => {
    if (trainerMode !== 'intervals') return
    stopAllSounds()
    setCurrentPlayingNote(-1)
    setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
    if (selectedInterval) {
      setCurrentScale({ name: selectedInterval.name, notes: selectedInterval.notes, description: selectedInterval.description })
    } else {
      setCurrentScale(null)
    }
  }, [trainerMode, selectedInterval])

  // Cuando se cambia el tipo de ejercicio, asegurar que la clave seleccionada sea válida
  useEffect(() => {
    if (trainerMode !== 'scales') return
    const validKeys = getValidKeysForType(exerciseType)
    if (!validKeys.includes(selectedKey)) {
      setSelectedKey(getDefaultKeyForType(exerciseType))
    }
  }, [exerciseType, trainerMode])

  // Construir la “escala” de nota fija (16 repeticiones) cuando el modo está activo
  useEffect(() => {
    if (!fixedMode || trainerMode !== 'scales') return
    const k = noteKeyForStringFret(fixedString, fixedFret)
    const label = `${prettyFromKey(k)} (${midiToToneName(midiFromKey(k))})`
    setCurrentScale({ name: `Nota fija: ${label}`, notes: Array(16).fill(k) })
  }, [fixedMode, fixedString, fixedFret, trainerMode])

  useEffect(() => { drawStaff() }, [currentScale, selectedClef, currentPlayingNote, dur, noteRotation, currentExerciseDuration])

  // Mantener BPM en tiempo real cuando cambia el slider
  useEffect(() => {
    try { Tone.Transport.bpm.value = bpm } catch {}
  }, [bpm])

  useEffect(() => {
    if (trainerMode === 'intervals' && fixedMode) setFixedMode(false)
    stopAllSounds()
    setCurrentPlayingNote(-1)
    setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
  }, [trainerMode])

  // (El encadenado automático se maneja directamente en el callback del final de ciclo)

  async function loadYamaha() {
    return getYamahaSampler()
  }

  function ensureAudio() { if (ctx && ctx.state === 'suspended') ctx.resume() }
  function stopAllSounds() {
    try {
      Tone.Transport.stop()
      Tone.Transport.cancel(0)
      Tone.Transport.loop = false
    } catch {}
    playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    playTimeoutsRef.current = []
    if (playIntervalRef.current) { clearInterval(playIntervalRef.current); playIntervalRef.current = null }
    if (metronomeIdRef.current !== null) {
      try { Tone.Transport.clear(metronomeIdRef.current) } catch {}
      metronomeIdRef.current = null
    }
    releaseYamahaVoices()
    setMetronomeActive(false)
    setCurrentBeat(0)
    // Asegurar que futuros reinicios no choquen con el guard inicial
    setIsPlaying(false)
    setIsTransitioning(false) // Detener cualquier transición en curso
  }

  function drawStaff() {
    if (!wrapA.current || !currentScale) return
    wrapA.current.innerHTML = ''
    const notes = currentScale.notes
    if (notes.length === 0) return

    // Calcular ancho para 16 notas
    const noteWidth = 75
    const LEFT_PAD = 24
    const RIGHT_PAD = 80
    const staveMargins = 200
    const calculatedWidth = staveMargins + (notes.length * noteWidth) + LEFT_PAD + RIGHT_PAD

    vfA.current = new Factory({ renderer: { elementId: wrapA.current.id, width: calculatedWidth, height: 200 } })

    const ctxV = vfA.current.getContext()
    const x = 10, y = 20, width = calculatedWidth - 20
    const stave = new Stave(x, y, width)
    stave.addClef(currentClefConfig.vexflowClef).addTimeSignature('4/4')
    stave.setContext(ctxV).draw()

    const notePositions: { x: number; beat: number }[] = []

    // En rotación usamos la duración efectiva del ciclo actual para dibujar
    const exerciseDur = noteRotation ? currentExerciseDuration : getCurrentExerciseDuration()
    const noteDuration = (exerciseDur === 'w') ? 4 : (exerciseDur === 'h') ? 2 : 1
    const noteBeats = notes.map(() => noteDuration)

    // Crear todas las notas y sus accidentales ANTES de formatear
    const vexNotes: StaveNote[] = []

    notes.forEach((noteKey, i) => {
      // Todas las notas del ejercicio usan la misma duración en este ciclo
      const d = exerciseDur === 'w' ? 'w' : exerciseDur === 'h' ? 'h' : 'q'

      const note = new StaveNote({
        clef: currentClefConfig.vexflowClef,
        keys: [noteKey],
        duration: d,
      })

      const [pc] = noteKey.split('/'); // 'c', 'bb', 'f#', 'b', etc.
      // sostenido
      if (pc.includes('#')) {
        note.addModifier(new Accidental('#'), 0)
      // bemol (solo ab, bb, cb, db, eb, fb, gb)
      } else if (pc.length > 1 && pc.endsWith('b')) {
        note.addModifier(new Accidental('b'), 0)
      }

      if (currentPlayingNote === i) {
        note.setStyle({ fillStyle: '#ff6b35', strokeStyle: '#ff6b35' })
      }

      vexNotes.push(note)
    })

    // *** CAMBIO CLAVE: usar el helper que pre-formatea y dibuja ***
    Formatter.FormatAndDraw(ctxV, stave, vexNotes)

    // Después de dibujar, obtener posiciones para barras de compás
    let accumulatedBeats = 0
    vexNotes.forEach((note, i) => {
      const bounds = note.getBoundingBox()
      if (bounds) {
        notePositions.push({ x: bounds.x + bounds.w / 2, beat: accumulatedBeats })
        accumulatedBeats += noteBeats[i] || 1
      }
    })

    // Barras cada 4 tiempos (considerando duraciones variables)
    let currentCompasBeats = 0
    for (let i = 0; i < notePositions.length - 1; i++) {
      currentCompasBeats += noteBeats[i] || 1
      if (currentCompasBeats >= 4) {
        const barX = (notePositions[i].x + notePositions[i + 1].x) / 2
        ctxV.beginPath()
        ctxV.moveTo(barX, stave.getYForLine(0))
        ctxV.lineTo(barX, stave.getYForLine(4))
        ctxV.strokeStyle = '#999'
        ctxV.lineWidth = 1
        ctxV.stroke()
        currentCompasBeats = 0
      }
    }
  }

  // Reiniciar reproducción si se cambia el modo/nota fija
  useEffect(() => {
    if (isPlaying) {
      stopAllSounds()
      setIsPlaying(false)
      setCurrentPlayingNote(-1)
      setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
    }
  }, [fixedMode, fixedString, fixedFret])

  // Reiniciar contador cuando se desactiva la rotación
  useEffect(() => {
    if (!noteRotation) {
      setExerciseCycleCount(0)
      setIsTransitioning(false)
    }
  }, [noteRotation])

  // Metrónomo sincronizado usando Tone.Transport
  function scheduleMetronome() {
    if (metronomeIdRef.current !== null) {
      try { Tone.Transport.clear(metronomeIdRef.current) } catch {}
      metronomeIdRef.current = null
    }
    // Disparo inicial en el downbeat para alinear desde el primer compás
    Tone.Transport.schedule((time) => {
      const isDownbeat = true
      if (ctx) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.value = isDownbeat ? 1000 : 800
        gain.gain.value = 0.3
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(time)
        osc.stop(time + 0.1)
      }
      setCurrentBeat(0)
    }, '0:0:0')
    const id = Tone.Transport.scheduleRepeat((time) => {
      const pos = Tone.Transport.position
      let beat = 0
      try {
        const parts = String(pos).split(':')
        beat = parseInt(parts[1] ?? '0', 10) || 0
      } catch {}
      const isDownbeat = beat === 0
      // Click del metrónomo usando oscilador simple
      if (ctx) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.value = isDownbeat ? 1000 : 800
        gain.gain.value = isDownbeat ? 0.3 : 0.1
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(time)
        osc.stop(time + 0.1)
      }
      setCurrentBeat(beat)
    }, '4n', '0:0:0')
    metronomeIdRef.current = id
  }

  function beatsToBBS(totalBeats: number): string {
    const bar = Math.floor(totalBeats / 4)
    const beat = totalBeats % 4
    return `${bar}:${beat}:0`
  }

  async function playScale(overrideDur?: 'w' | 'h' | 'q') {
    if (!currentScale) return
    const launchingFromAuto = autoNextRef.current === true
    if (isPlaying && !isTransitioning && !launchingFromAuto) {
      setIsPlaying(false); setCurrentPlayingNote(-1)
      setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
      stopAllSounds()
      return
    }

    // Si estamos en transición, no permitir manipulación manual
    if (isTransitioning) return

    ensureAudio(); setIsPlaying(true)

    // Limpiar bandera de auto siguiente para no interferir con futuros toques manuales
    if (launchingFromAuto) autoNextRef.current = false

    const sampler = await loadYamaha()

    // Configurar Tone.Transport
    Tone.Transport.cancel(0)
    Tone.Transport.bpm.value = bpm
    Tone.Transport.timeSignature = [4, 4]
    Tone.Transport.position = '0:0:0'

    // Determinar la duración para este ciclo del ejercicio
    const exerciseDur = noteRotation ? (overrideDur ?? getCurrentExerciseDuration()) : getCurrentExerciseDuration()
    setCurrentExerciseDuration(exerciseDur)
    currentCycleDurRef.current = exerciseDur

    const len = (exerciseDur === 'w') ? 4 : (exerciseDur === 'h') ? 2 : 1
    const totalBeats = currentScale.notes.length * len
    const loopEnd = beatsToBBS(totalBeats)

    // Programar metrónomo
    scheduleMetronome()
    setMetronomeActive(true)
    setCurrentBeat(0)

    // Programar notas (todas con la misma duración en este ciclo)
    let accBeats = 0
    const secondsPerBeat = 60 / bpm
    const noteDurSec = len * secondsPerBeat

    currentScale.notes.forEach((noteKey, i) => {
      const startAt = beatsToBBS(accBeats)

      Tone.Transport.schedule((time) => {
        setCurrentPlayingNote(i)
        setCurrentNoteDisplay({ spn: prettyFromKey(noteKey), solfege: labelSolfege(noteKey), show: true })

        if (sampler) {
          // Usar segundos para duración para respetar BPM exactamente
          sampler.triggerAttackRelease(toneNoteFromKey(noteKey), noteDurSec, time)
        } else {
          pianoLike(freqOfKey(noteKey), time, noteDurSec * 0.95)
        }
      }, startAt)

      accBeats += len
    })

    // Al final de cada ciclo, manejar rotación de figuras y relanzar automáticamente
    if (noteRotation) {
      Tone.Transport.schedule(() => {
        setIsTransitioning(true)
        autoNextRef.current = true
        setExerciseCycleCount(prev => prev + 1)
        // Calcular la siguiente figura explícitamente para evitar depender de setState
        const cur = currentCycleDurRef.current
        const next: 'w' | 'h' | 'q' = cur === 'w' ? 'h' : (cur === 'h' ? 'q' : 'w')
        // Detener transporte y limpiar, luego relanzar siguiente ciclo con la nueva figura
        stopAllSounds()
        setCurrentPlayingNote(-1)
        setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
        setTimeout(() => {
          setIsTransitioning(false)
          playScale(next)
        }, 80)
      }, loopEnd)
    }

    // Loop infinito solo cuando NO hay rotación por ejercicio
    if (!noteRotation) {
      Tone.Transport.setLoopPoints('0:0:0', loopEnd)
      Tone.Transport.loop = true
    } else {
      Tone.Transport.loop = false
    }
    Tone.Transport.start('+0.05')
  }

  const fixedKey = noteKeyForStringFret(fixedString, fixedFret)
  const fixedSpn = midiToToneName(midiFromKey(fixedKey))

  // Funciones para obtener claves válidas según el tipo de ejercicio
  function getValidKeysForType(type: typeof exerciseType): string[] {
    switch (type) {
      case 'major_scales':
      case 'major_arpeggios':
        return naturalKeys
      case 'minor_scales':
      case 'minor_arpeggios':
        return naturalKeysMinor
      default:
        return naturalKeys
    }
  }

  function getDefaultKeyForType(type: typeof exerciseType): string {
    switch (type) {
      case 'major_scales':
      case 'major_arpeggios':
        return 'C'
      case 'minor_scales':
      case 'minor_arpeggios':
        return 'A'
      default:
        return 'C'
    }
  }

  function getMetaForType(type: typeof exerciseType): Record<string, string> {
    switch (type) {
      case 'major_scales':
        return SCALE_META_MAJOR
      case 'minor_scales':
        return SCALE_META_MINOR
      case 'major_arpeggios':
        return ARPEGGIO_META_MAJOR
      case 'minor_arpeggios':
        return ARPEGGIO_META_MINOR
      default:
        return SCALE_META_MAJOR
    }
  }

  const validKeys = trainerMode === 'scales' ? getValidKeysForType(exerciseType) : []
  const meta = trainerMode === 'scales' ? getMetaForType(exerciseType) : {} as Record<string, string>
  const isMinorExercise = trainerMode === 'scales' && exerciseType.includes('minor')
  const bannerBgColor = trainerMode === 'intervals'
    ? 'rgba(142, 36, 170, 0.12)'
    : (isMinorExercise ? 'rgba(25,118,210,0.10)' : 'rgba(76,175,80,0.1)')
  const bannerTextColor = trainerMode === 'intervals'
    ? '#8e24aa'
    : (isMinorExercise ? '#1976d2' : '#4caf50')
  const bannerEmoji = fixedMode ? '🔁' : (trainerMode === 'intervals' ? '🎯' : '🎵')

  return (
    <Box sx={{ width: '100%', px: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/')}>
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0b2a50', flex: 1 }}>
            🎸 Entrenador de Bajo — {currentClefConfig.name}
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="mode-label">Modo</InputLabel>
                <Select
                  labelId="mode-label"
                  label="Modo"
                  value={trainerMode}
                  onChange={e => setTrainerMode(e.target.value as 'scales' | 'intervals')}
                >
                  <MenuItem value="scales">Escalas / Arpegios</MenuItem>
                  <MenuItem value="intervals">Notas (intervalos)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="clef-label">Clave</InputLabel>
                <Select labelId="clef-label" label="Clave" value={selectedClef} onChange={e => setSelectedClef(e.target.value as any)}>
                  <MenuItem value="treble">Sol (2ª línea)</MenuItem>
                  <MenuItem value="bass">Fa (4ª línea)</MenuItem>
                  <MenuItem value="bass_3rd">Fa (3ª línea)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={3} md={1.5}>
              <TextField fullWidth label="BPM" type="number" inputProps={{ min: 40, max: 180 }} value={bpm} onChange={e => setBpm(Number(e.target.value))} size="small" />
            </Grid>

            <Grid item xs={6} sm={3} md={2}>
              <FormControlLabel
                control={<Switch checked={noteRotation} onChange={(e) => setNoteRotation(e.target.checked)} />}
                label="Rotación de figuras"
                sx={{ mb: 1 }}
              />
              <FormControl fullWidth size="small" disabled={noteRotation}>
                <InputLabel id="dur-label">Duración fija</InputLabel>
                <Select labelId="dur-label" label="Duración fija" value={dur} onChange={e => setDur(e.target.value as any)}>
                  <MenuItem value={'w'}>Redonda</MenuItem>
                  <MenuItem value={'h'}>Blanca</MenuItem>
                  <MenuItem value={'q'}>Negra</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {trainerMode === 'scales' ? (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small" disabled={fixedMode}>
                    <InputLabel id="exercise-type-label">Tipo de ejercicio</InputLabel>
                    <Select labelId="exercise-type-label" label="Tipo de ejercicio" value={exerciseType} onChange={e => setExerciseType(e.target.value as typeof exerciseType)}>
                      <MenuItem value="major_scales">Escalas mayores</MenuItem>
                      <MenuItem value="minor_scales">Escalas menores</MenuItem>
                      <MenuItem value="major_arpeggios">Arpegios mayores</MenuItem>
                      <MenuItem value="minor_arpeggios">Arpegios menores</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small" disabled={fixedMode}>
                    <InputLabel id="key-label">Clave</InputLabel>
                    <Select labelId="key-label" label="Clave" value={selectedKey} onChange={e => setSelectedKey(e.target.value)}>
                      {validKeys.map((k) => (
                        <MenuItem key={k} value={k}>{meta[k]}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={<Checkbox checked={fixedMode} onChange={(e) => setFixedMode(e.target.checked)} size="small" />}
                    label="Modo Nota fija (bucle infinito)"
                    sx={{ fontSize: '0.9rem', userSelect: 'none' }}
                  />
                </Grid>

                {fixedMode && (
                  <>
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="fixed-string-label">Cuerda</InputLabel>
                        <Select labelId="fixed-string-label" label="Cuerda" value={fixedString} onChange={(e) => setFixedString(e.target.value as StringId)}>
                          {BASS_STRINGS.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="fixed-fret-label">Traste</InputLabel>
                        <Select labelId="fixed-fret-label" label="Traste" value={fixedFret} onChange={(e) => setFixedFret(Number(e.target.value))}>
                          {Array.from({ length: 13 }, (_, i) => i).map(fr => <MenuItem key={fr} value={fr}>{fr}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={3}>
                      <TextField fullWidth size="small" label="Nota seleccionada" value={`${prettyFromKey(fixedKey)}  ·  ${fixedSpn}`} InputProps={{ readOnly: true }} />
                    </Grid>
                  </>
                )}
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="interval-exercise-label">Ejercicio de intervalos</InputLabel>
                    <Select
                      labelId="interval-exercise-label"
                      label="Ejercicio de intervalos"
                      value={selectedIntervalId}
                      onChange={e => setSelectedIntervalId(e.target.value as string)}
                    >
                      {INTERVAL_EXERCISES.map(ex => (
                        <MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedInterval?.description}
                  </Typography>
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={1.5}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => playScale()}
                startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                disabled={!currentScale}
                fullWidth
                size="small"
                sx={{ fontSize: '0.75rem' }}
              >
                {isPlaying ? 'Pausa' : 'Play'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Afinador */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Afinador (micrófono)
          </Typography>
          <Box sx={{ borderRadius: 1, p: 1 }}>
            <AlwaysOnTuner />
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            Tip: para graves (E≈41 Hz / B≈31 Hz) una interfaz de audio rastrea más estable que el mic del laptop.
          </Typography>
        </Paper>

        {/* Pentagrama */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            {fixedMode
              ? `Pentagrama — Nota fija: ${prettyFromKey(fixedKey)} (${fixedSpn})`
              : `Pentagrama — ${currentScale?.name || 'Selecciona una escala'}`}
          </Typography>

          {currentScale && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1, backgroundColor: bannerBgColor, borderRadius: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: bannerTextColor, textAlign: 'center' }}>
                {fixedMode
                  ? `${bannerEmoji} Nota fija en bucle — ${prettyFromKey(fixedKey)} (${fixedSpn})`
                  : `${bannerEmoji} ${currentScale.name} — ${currentScale.notes.length} notas`}
                {noteRotation && (
                  <Typography component="span" sx={{ ml: 2, fontSize: '0.9em', fontWeight: 'normal' }}>
                    📐 Rotación por ejercicio: {getExerciseDurationLabel(currentExerciseDuration)}
                  </Typography>
                )}
              </Typography>
            </Box>
          )}

          {currentScale?.description && !fixedMode && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {currentScale.description}
            </Typography>
          )}

          {currentNoteDisplay.show && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1, backgroundColor: 'rgba(255,107,53,0.1)', borderRadius: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff6b35', textAlign: 'center' }}>
                ♪ {currentNoteDisplay.spn} ({currentNoteDisplay.solfege}) ♪
                {noteRotation && (
                  <Typography component="span" sx={{ ml: 2, fontSize: '0.8em', fontWeight: 'normal' }}>
                    [Ejercicio: {getExerciseDurationLabel(currentExerciseDuration)}]
                  </Typography>
                )}
              </Typography>
            </Box>
          )}

          {/* Secuencia de notas */}
          {currentScale && !fixedMode && (
            <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(33, 150, 243, 0.03)' }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                📝 Secuencia completa — {currentScale.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                {currentScale.notes.map((note, idx) => {
                  const isAscending = trainerMode === 'scales' && idx < currentScale.notes.length / 2
                  const isCurrentNote = currentPlayingNote === idx
                  const chipBg = trainerMode === 'scales'
                    ? (isAscending ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)')
                    : 'rgba(142,36,170,0.08)'
                  const chipBorder = trainerMode === 'scales'
                    ? (isAscending ? '#4caf50' : '#ff9800')
                    : '#8e24aa'
                  return (
                    <Box key={`sequence-${note}-${idx}`} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={prettyFromKey(note)}
                        size="small"
                        color={isCurrentNote ? 'primary' : 'default'}
                        sx={{
                          backgroundColor: isCurrentNote ? undefined : chipBg,
                          borderColor: chipBorder,
                          border: isCurrentNote ? undefined : '1px solid',
                          fontWeight: isCurrentNote ? 'bold' : 'normal'
                        }}
                      />
                      {idx < currentScale.notes.length - 1 && (
                        <Typography variant="caption" sx={{ mx: 0.5, color: 'text.secondary' }}>
                          {trainerMode === 'scales'
                            ? (isAscending && idx === (currentScale.notes.length / 2) - 1 ? '🔄' : '→')
                            : '⋯'}
                        </Typography>
                      )}
                    </Box>
                  )
                })}
              </Box>
              {trainerMode === 'scales' && (
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Typography variant="caption" sx={{ color: '#4caf50', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: 'rgba(76,175,80,0.3)', borderRadius: '50%', border: '1px solid #4caf50' }} />
                    Ascendente
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, backgroundColor: 'rgba(255,152,0,0.3)', borderRadius: '50%', border: '1px solid #ff9800' }} />
                    Descendente
                  </Typography>
                </Box>
              )}
            </Paper>
          )}

          {/* Indicador visual del metrónomo */}
          {(metronomeActive || isPlaying) && (
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

          <Box sx={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', width: '100%' }}>
            <div id="staveA" ref={wrapA} />
          </Box>

          {currentScale && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {currentScale.notes.map((note, idx) => (
                <Chip key={`${note}-${idx}`} label={prettyFromKey(note)} size="small" color={currentPlayingNote === idx ? 'primary' : 'default'} />
              ))}
            </Box>
          )}
        </Paper>
      </Stack>
    </Box>
  )
}
