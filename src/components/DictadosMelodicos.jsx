import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Container, Paper, Box, Grid, Typography, TextField, MenuItem, Select, InputLabel, FormControl, Stack, Button, Chip, FormControlLabel, Checkbox } from '@mui/material'
import FundamentalNotesTable from './FundamentalNotesTable'
import ChromaticIntervalsTable from './ChromaticIntervalsTable'
import { PlayArrow, Pause, RestartAlt, DeleteOutline, CheckCircle, ArrowBack } from '@mui/icons-material'
import { Factory, StaveNote, Stave, TickContext } from 'vexflow'
import * as Tone from 'tone'
import { useNavigate } from 'react-router-dom'

// Mantener sampler entre renders
let toneSamplerRef = null

// ---------------- Configuración ----------------
// Definición de claves y sus rangos (todo lo que puede escribirse en el diagrama por clave)
const CLEF_CONFIGS = {
  treble: {
    name: 'Sol (2ª línea)',
    vexflowClef: 'treble',
    // Rango: B2–B6 (Si2–Si6) - Primera con 1 línea abajo: C4 (Do4)
    rangeKeys: [
      'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3',
      'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4',
      'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5', 'b/5',
      'c/6', 'd/6', 'e/6', 'f/6', 'g/6', 'a/6', 'b/6'
    ],
    // Notas CON rayitas para Clave de Sol: todo ≤ C4  todo ≥ A5
    ledgerLineNotes: [
      'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4',
      'a/5', 'b/5', 'c/6', 'd/6', 'e/6', 'f/6', 'g/6', 'a/6', 'b/6'
    ],
    defaultStart: 'c/4',   // primera con 1 línea abajo
    defaultEnd: 'b/6',     // última del rango
    // Secuencias específicas para esta clave
    sequences: {
      ascending: ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'],
      descending: ['c/5', 'b/4', 'a/4', 'g/4', 'f/4', 'e/4', 'd/4', 'c/4'],
      both: ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'c/5', 'b/4', 'a/4', 'g/4', 'f/4', 'e/4', 'd/4', 'c/4']
    }
  },
  bass: {
    name: 'Fa (4ª línea)',
    vexflowClef: 'bass',
    // Rango: D1–D5 (Re1–Re5) - Primera con 1 línea abajo: E2 (Mi2)
    rangeKeys: [
      'd/1', 'e/1', 'f/1', 'g/1', 'a/1', 'b/1',
      'c/2', 'd/2', 'e/2', 'f/2', 'g/2', 'a/2', 'b/2',
      'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3',
      'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4',
      'c/5', 'd/5'
    ],
    // Notas CON rayitas para Clave de Fa 4ª: todo ≤ E2 o todo ≥ C4
    ledgerLineNotes: [
      'd/1', 'e/1', 'f/1', 'g/1', 'a/1', 'b/1', 'c/2', 'd/2', 'e/2',
      'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5'
    ],
    defaultStart: 'e/2',   // primera con 1 línea abajo
    defaultEnd: 'd/5',     // última del rango
    // Secuencias específicas para esta clave
    sequences: {
      ascending: ['e/2', 'f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3'],
      descending: ['e/3', 'd/3', 'c/3', 'b/2', 'a/2', 'g/2', 'f/2', 'e/2'],
      both: ['e/2', 'f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'e/3', 'd/3', 'c/3', 'b/2', 'a/2', 'g/2', 'f/2', 'e/2']
    }
  },
  bass_3rd: {
    name: 'Fa (3ª línea)',
    vexflowClef: 'baritone-f',
    // Rango: F1–F5 (Fa1–Fa5) - Primera con 1 línea abajo: G2 (Sol2)
    rangeKeys: [
      'f/1', 'g/1', 'a/1', 'b/1',
      'c/2', 'd/2', 'e/2', 'f/2', 'g/2', 'a/2', 'b/2',
      'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3',
      'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4',
      'c/5', 'd/5', 'e/5', 'f/5'
    ],
    // Notas CON rayitas para Clave de Fa 3ª: todo ≤ G2 o todo ≥ E4
    ledgerLineNotes: [
      'f/1', 'g/1', 'a/1', 'b/1', 'c/2', 'd/2', 'e/2', 'f/2', 'g/2',
      'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5'
    ],
    defaultStart: 'g/2',   // primera con 1 línea abajo
    defaultEnd: 'f/5',     // última del rango
    // Secuencias específicas para esta clave
    sequences: {
      ascending: ['g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3'],
      descending: ['g/3', 'f/3', 'e/3', 'd/3', 'c/3', 'b/2', 'a/2', 'g/2'],
      both: ['g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'g/3', 'f/3', 'e/3', 'd/3', 'c/3', 'b/2', 'a/2', 'g/2']
    }
  }
}

const LETTERS = { c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', a: 'A', b: 'B' }
const SOLFEGE = { c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' }

function labelSPN(key) { // "c/4" -> "C4"
  const [s, o] = key.split('/')
  return `${LETTERS[s]}${o}`
}
function labelSolfege(key) { // "c/4" -> "Do4"
  const [s, o] = key.split('/')
  return `${SOLFEGE[s]}${o}`
}

const DURATIONS = {
  q: { label: 'Negra', factor: 1 },
  '8': { label: 'Corchea', factor: 0.5 },
  h: { label: 'Blanca', factor: 2 },
}

// ---------------- Utilidad core ----------------
function randInt(n) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1)
    window.crypto.getRandomValues(array)
    return array[0] % n
  }
  return Math.floor((Math.random() + Math.random() + Math.random()) / 3 * n)
}

function makeMelody(len, startNote, endNote, mode = 'random', includeSilences = false, clefConfig = CLEF_CONFIGS.treble) {
  const RANGE_KEYS = clefConfig.rangeKeys
  const startIdx = RANGE_KEYS.indexOf(startNote)
  const endIdx = RANGE_KEYS.indexOf(endNote)
  const minIdx = Math.min(startIdx, endIdx)
  const maxIdx = Math.max(startIdx, endIdx)
  const rangeKeys = RANGE_KEYS.slice(minIdx, maxIdx + 1)

  if (mode === 'random') {
    const arr = []
    let lastNote = null
    let sameNoteCount = 0
    for (let i = 0; i < len; i++) {
      const shouldAddRest = includeSilences && randInt(100) < 15 && lastNote !== 'rest' && i > 0 && i < len - 1
      if (shouldAddRest) {
        arr.push('rest')
        lastNote = 'rest'
        sameNoteCount = 0
      } else {
        let note
        let attempts = 0
        do {
          note = rangeKeys[randInt(rangeKeys.length)]
          attempts++
          if (note === lastNote) {
            sameNoteCount++
            if (sameNoteCount >= 2 && attempts < 10) continue
          } else {
            sameNoteCount = 0
          }
          break
        } while (attempts < 10)
        arr.push(note)
        lastNote = note
      }
    }
    return arr
  }
  if (mode === 'ascending') {
    // Usar secuencia específica de la clave si está disponible
    if (clefConfig.sequences && clefConfig.sequences.ascending) {
      return clefConfig.sequences.ascending
    }
    // Fallback al método original
    const arr = []
    for (let i = 0; i < len; i++) {
      const noteIdx = Math.min(startIdx + i, maxIdx)
      arr.push(RANGE_KEYS[noteIdx])
    }
    return arr
  }
  if (mode === 'descending') {
    // Usar secuencia específica de la clave si está disponible
    if (clefConfig.sequences && clefConfig.sequences.descending) {
      return clefConfig.sequences.descending
    }
    // Fallback al método original
    const arr = []
    for (let i = 0; i < len; i++) {
      const noteIdx = Math.max(startIdx - i, minIdx)
      arr.push(RANGE_KEYS[noteIdx])
    }
    return arr
  }
  if (mode === 'both') {
    // Usar secuencia específica de la clave si está disponible
    if (clefConfig.sequences && clefConfig.sequences.both) {
      return clefConfig.sequences.both
    }
    // Fallback al método original - con nota pico repetida
    const arr = []
    // Ascendente: 8 notas
    for (let i = 0; i < 8; i++) {
      const noteIdx = Math.min(startIdx + i, maxIdx)
      arr.push(RANGE_KEYS[noteIdx])
    }
    // Descendente: 8 notas (incluyendo repetición de la nota más alta)
    for (let i = 0; i < 8; i++) {
      const noteIdx = Math.max(maxIdx - i, minIdx)
      arr.push(RANGE_KEYS[noteIdx])
    }
    return arr
  }
  const arr = []
  for (let i = 0; i < len; i++) arr.push(rangeKeys[randInt(rangeKeys.length)])
  return arr
}

// Parseo de entrada textual: "C4" o "Do4" -> "c/4"
function parseNoteInput(raw) {
  if (!raw) return { valid: false }
  let s = String(raw).trim().replace(/\s+/g, '')
  if (!s) return { valid: false }
  const m = s.match(/^(do|re|mi|fa|sol|la|si|[cdefgabCDEFGAB])(\d)$/i)
  if (!m) return { valid: false }
  let name = m[1].toLowerCase()
  const oct = parseInt(m[2], 10)
  const solToStep = { do: 'c', re: 'd', mi: 'e', fa: 'f', sol: 'g', la: 'a', si: 'b' }
  const step = (name.length > 1 ? solToStep[name] : name)
  if (!step) return { valid: false }
  const key = `${step}/${oct}`
  const spn = `${LETTERS[step]}${oct}`
  const solf = `${SOLFEGE[step]}${oct}`
  const typedSolfege = name.length > 1
  return { valid: true, key, spn, solf, typedSolfege }
}

// ---------------- Audio ----------------
const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null
const ctx = AudioCtx ? new AudioCtx() : null
let master = ctx ? ctx.createGain() : null
if (master && ctx) { master.gain.value = 0.7; master.connect(ctx.destination) }

function freqOfKey(key) {
  const [s, o] = key.split('/')
  const OCT = parseInt(o, 10)
  const STEPS = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }
  const midi = (OCT + 1) * 12 + STEPS[s.toLowerCase()]
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function pianoLike(freq, time, durSec) {
  if (!ctx) return
  const out = ctx.createGain(); out.gain.value = 1
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'
  lp.frequency.setValueAtTime(10000, time)
  lp.frequency.exponentialRampToValueAtTime(1800, time + Math.min(0.6, durSec * 0.7))
  const pan = ctx.createStereoPanner(); pan.pan.setValueAtTime(Math.min(0.25, Math.max(-0.25, (freq - 440) / 440 * 0.2)), time)
  out.connect(lp); lp.connect(pan); pan.connect(master)

  const PARTS = [
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

function clickMetronome(time) {
  if (!ctx) return
  const osc = ctx.createOscillator(); const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, time)
  g.gain.exponentialRampToValueAtTime(0.6, time + 0.001)
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.07)
  osc.type = 'square'; osc.frequency.setValueAtTime(2000, time)
  osc.connect(g); g.connect(master)
  osc.start(time); osc.stop(time + 0.08)
}

// ---------------- App ----------------
export default function DictadosMelodicos() {
  const navigate = useNavigate()
  const [num, setNum] = useState(5)
  const [bpm, setBpm] = useState(60)
  const [dur, setDur] = useState('h')
  const [mode, setMode] = useState('train') // 'train' | 'exam'
  const [sequentialMode, setSequentialMode] = useState('random') // 'random' | 'ascending' | 'descending' | 'both'
  const [selectedClef, setSelectedClef] = useState('treble') // 'treble' | 'bass' | 'bass_3rd'
  const [engine, setEngine] = useState('yamaha') // 'yamaha' | 'synth'
  const [samplerReady, setSamplerReady] = useState(false)
  // Defaults: primera con rayita y última del rango para la clave de Sol de inicio
  const [startNote, setStartNote] = useState(CLEF_CONFIGS.treble.defaultStart)
  const [dictation, setDictation] = useState([])
  const [endNote, setEndNote] = useState(CLEF_CONFIGS.treble.defaultEnd)
  const [userNotes, setUserNotes] = useState([])
  const [userInputs, setUserInputs] = useState([]) // texto por slot (C4 o Do4)
  const [status, setStatus] = useState('Listo: genera un dictado y coloca tus notas en el pentagrama inferior.')
  const [mask, setMask] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [showNoteReference, setShowNoteReference] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingNote, setCurrentPlayingNote] = useState(-1)
  const [currentNoteDisplay, setCurrentNoteDisplay] = useState({ spn: '', solfege: '', show: false })
  const [metronomeActive, setMetronomeActive] = useState(false)
  const [metronomeBeat, setMetronomeBeat] = useState(0)
  const [includeSilences, setIncludeSilences] = useState(false)
  const inputRefs = useRef([])
  const playIntervalRef = useRef(null)
  const playTimeoutsRef = useRef([])
  const metronomeIntervalRef = useRef(null)

  const wrapA = useRef(null)
  const wrapB = useRef(null)
  const vfA = useRef(null)
  const vfB = useRef(null)
  const staveA = useRef(null)
  const staveB = useRef(null)

  const currentClefConfig = CLEF_CONFIGS[selectedClef]

  // Set de notas con rayita por clave (evita mezclar entre claves)
  const ledgerSet = useMemo(() => new Set(currentClefConfig.ledgerLineNotes), [selectedClef])

  // Dibujo dictado y respuesta
  useEffect(() => { drawDictation() }, [dictation, dur, mode, currentPlayingNote, selectedClef])
  useEffect(() => { drawUser() }, [userNotes, dur, mask, selectedClef])

  useEffect(() => { newDictation() }, [])

  // Actualizar número de notas cuando cambia el tipo de secuencia
  useEffect(() => {
    if (sequentialMode === 'both') {
      setNum(16) // 8 ascendente + 8 descendente (con nota pico repetida)
    } else if (sequentialMode === 'ascending' || sequentialMode === 'descending') {
      setNum(8)
    }
  }, [sequentialMode])

  // Al cambiar de clave, colocar defaults: primera con rayita / última del rango
  useEffect(() => {
    const clefConfig = CLEF_CONFIGS[selectedClef]
    setStartNote(clefConfig.defaultStart)
    setEndNote(clefConfig.defaultEnd)
  }, [selectedClef])

  async function loadYamaha() {
    if (toneSamplerRef) return toneSamplerRef
    await Tone.start()
    toneSamplerRef = new Tone.Sampler({
      urls: {
        A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', A5: 'A5.mp3', C6: 'C6.mp3'
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/'
    }).toDestination()
    setSamplerReady(true)
    return toneSamplerRef
  }

  function ensureAudio() { if (ctx && ctx.state === 'suspended') ctx.resume() }

  function stopAllSounds() {
    playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    playTimeoutsRef.current = []
    if (toneSamplerRef) {
      try { toneSamplerRef.releaseAll() } catch (e) { }
    }
    if (ctx) {
      try {
        if (master) {
          master.disconnect()
          master = ctx.createGain()
          master.gain.value = 0.7
          master.connect(ctx.destination)
        }
      } catch (e) { }
    }
  }

  function drawDictation() {
    if (!wrapA.current) return
    wrapA.current.innerHTML = ''
    vfA.current = new Factory({ renderer: { elementId: wrapA.current.id, width: 1100, height: 200 } });

    const ctxV = vfA.current.getContext()
    const x = 10, y = 20, width = 1080
    const stave = new Stave(x, y, width)
    stave.addClef(currentClefConfig.vexflowClef).addTimeSignature('4/4')
    stave.setContext(ctxV).draw()

    if (mode === 'exam' || !dictation.length) { staveA.current = stave; return }

    const d = dur === '8' ? '8' : dur === 'h' ? 'h' : 'q'
    const N = dictation.length
    const startX = stave.getNoteStartX() - 40
    const endX = stave.getX() + stave.getWidth() - 60
    const availableWidth = endX - startX
    const noteBeatDuration = DURATIONS[dur]?.factor ?? 1

    const totalBeats = N * noteBeatDuration
    const beatWidth = availableWidth / totalBeats

    let currentBeat = 0
    const notePositions = []

    for (let i = 0; i < N; i++) {
      const k = dictation[i]
      let note = (k === 'rest')
        ? new StaveNote({ clef: currentClefConfig.vexflowClef, keys: ['b/4'], duration: d + 'r' })
        : new StaveNote({ clef: currentClefConfig.vexflowClef, keys: [k], duration: d })
      if (currentPlayingNote === i && k !== 'rest') {
        note.setStyle({ fillStyle: '#ff6b35', strokeStyle: '#ff6b35' })
      }
      note.setStave(stave).setContext(ctxV)
      const tc = new TickContext()
      const noteX = startX + currentBeat * beatWidth + (noteBeatDuration * beatWidth / 2)
      tc.addTickable(note).preFormat().setX(noteX)
      note.setTickContext(tc)
      note.draw()
      notePositions.push({ x: noteX, beat: currentBeat, endBeat: currentBeat + noteBeatDuration })
      currentBeat += noteBeatDuration
    }

    let currentCompasBeats = 0
    for (let i = 0; i < notePositions.length - 1; i++) {
      currentCompasBeats += noteBeatDuration
      if (currentCompasBeats >= 4) {
        const currentNoteEnd = notePositions[i].x + (noteBeatDuration * beatWidth / 2)
        const nextNoteStart = notePositions[i + 1].x - (noteBeatDuration * beatWidth / 2)
        const barX = (currentNoteEnd + nextNoteStart) / 2
        ctxV.beginPath()
        ctxV.moveTo(barX, stave.getYForLine(0))
        ctxV.lineTo(barX, stave.getYForLine(4))
        ctxV.strokeStyle = '#999'
        ctxV.lineWidth = 1
        ctxV.stroke()
        currentCompasBeats = 0
      }
    }

    staveA.current = stave
  }

  function drawUser() {
    if (!wrapB.current) return
    wrapB.current.innerHTML = ''
    vfB.current = new Factory({ renderer: { elementId: wrapB.current.id, width: 1100, height: 200 } });
    const ctxV = vfB.current.getContext()
    const x = 10, y = 20, width = 1080
    const stave = new Stave(x, y, width)
    stave.addClef(currentClefConfig.vexflowClef).addTimeSignature('4/4')
    stave.setContext(ctxV).draw()

    const d = dur === '8' ? '8' : dur === 'h' ? 'h' : 'q'
    const N = Math.max(1, dictation.length)
    const startX = stave.getNoteStartX() - 40
    const endX = stave.getX() + stave.getWidth() - 60
    const availableWidth = endX - startX
    const noteBeatDuration = DURATIONS[dur]?.factor ?? 1

    const totalBeats = N * noteBeatDuration
    const beatWidth = availableWidth / totalBeats

    let currentBeat = 0
    const notePositions = []

    for (let i = 0; i < N; i++) {
      const k = userNotes[i]
      const noteX = startX + currentBeat * beatWidth + (noteBeatDuration * beatWidth / 2)
      if (k) {
        const note = (k === 'rest')
          ? new StaveNote({ clef: currentClefConfig.vexflowClef, keys: ['b/4'], duration: d + 'r' })
          : new StaveNote({ clef: currentClefConfig.vexflowClef, keys: [k], duration: d })
        if (mask && k !== 'rest') {
          const color = mask[i] ? '#34d399' : '#fb7185'
          note.setStyle({ fillStyle: color, strokeStyle: color })
        }
        note.setStave(stave).setContext(ctxV)
        const tc = new TickContext()
        tc.addTickable(note).preFormat().setX(noteX)
        note.setTickContext(tc)
        note.draw()
      }
      notePositions.push({ x: noteX, beat: currentBeat, endBeat: currentBeat + noteBeatDuration })
      currentBeat += noteBeatDuration
    }

    let currentCompasBeats = 0
    for (let i = 0; i < notePositions.length - 1; i++) {
      currentCompasBeats += noteBeatDuration
      if (currentCompasBeats >= 4) {
        const currentNoteEnd = notePositions[i].x + (noteBeatDuration * beatWidth / 2)
        const nextNoteStart = notePositions[i + 1].x - (noteBeatDuration * beatWidth / 2)
        const barX = (currentNoteEnd + nextNoteStart) / 2
        ctxV.beginPath()
        ctxV.moveTo(barX, stave.getYForLine(0))
        ctxV.lineTo(barX, stave.getYForLine(4))
        ctxV.strokeStyle = '#999'
        ctxV.lineWidth = 1
        ctxV.stroke()
        currentCompasBeats = 0
      }
    }

    bindUserCanvas()
  }

  function bindUserCanvas() {
    const canvas = wrapB.current?.querySelector('canvas')
    if (!canvas || canvas.dataset.bound) return
    canvas.addEventListener('click', onClickStaff)
    canvas.addEventListener('contextmenu', e => { e.preventDefault(); undo() })
    window.addEventListener('keydown', e => { if (e.key === 'Backspace') undo() })
    canvas.style.cursor = 'crosshair'
    canvas.dataset.bound = '1'
  }

  function onClickStaff(e) {
    if (!(mode === 'exam' || mode === 'train')) return
    if (mask) setMask(null) // Limpiar colores al hacer clic en el pentagrama
    const k = keyFromY(e.clientY)
    const label = labelSPN(k)
    setUserNotes(prev => { const next = [...prev]; if (activeIdx < next.length) next[activeIdx] = k; return next })
    setUserInputs(prev => { const next = [...prev]; if (activeIdx < next.length) next[activeIdx] = label; return next })
    setActiveIdx(i => {
      const len = dictation.length
      for (let j = (i + 1); j < len; j++) { if (!userNotes[j]) return j }
      for (let j = 0; j < len; j++) { if (!userNotes[j]) return j }
      return Math.min(len - 1, i)
    })
  }

  function undo() {
    setUserNotes(prev => {
      if (!prev.length) return prev
      const next = [...prev]; next[activeIdx] = null; return next
    })
    setUserInputs(prev => {
      if (!prev.length) return prev
      const next = [...prev]; next[activeIdx] = ''; return next
    })
    setMask(null) // Limpiar colores al usar undo
  }

  function keyFromY(clientY) {
    const canvas = wrapB.current?.querySelector('canvas')
    const rect = canvas.getBoundingClientRect()
    const localY = clientY - rect.top
    const top = 15, lineDist = 10
    const ORDER = currentClefConfig.rangeKeys
    // Nota de referencia = 1ª línea del pentagrama según clave
    let refNote
    if (selectedClef === 'treble') {
      refNote = 'e/4'  // 1ª línea en Sol
    } else if (selectedClef === 'bass') {
      refNote = 'g/2'  // 1ª línea en Fa 4ª
    } else { // bass_3rd
      refNote = 'b/2'  // 1ª línea en Fa 3ª
    }
    const refIndex = ORDER.indexOf(refNote)
    const base = top + 4 * lineDist
    let best = ORDER[0], bestDist = 1e9
    for (let i = 0; i < ORDER.length; i++) {
      const yy = base - (i - refIndex) * (lineDist / 2)
      const d = Math.abs(localY - yy)
      if (d < bestDist) { bestDist = d; best = ORDER[i] }
    }
    return best
  }

  function newDictation() {
    if (isPlaying) {
      setIsPlaying(false)
      setCurrentPlayingNote(-1)
      setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
      setMetronomeActive(false)
      stopAllSounds()
      if (playIntervalRef.current) { clearInterval(playIntervalRef.current); playIntervalRef.current = null }
      if (metronomeIntervalRef.current) { clearInterval(metronomeIntervalRef.current); metronomeIntervalRef.current = null }
    }

    let n = clamp(num, 1, 16)
    let currentStartNote = startNote
    let currentEndNote = endNote

    if (sequentialMode !== 'random') {
      const clefConfig = currentClefConfig
      const firstNote = clefConfig.rangeKeys[0]
      const lastNote = clefConfig.rangeKeys[clefConfig.rangeKeys.length - 1]
      // Para modos secuenciales: respetar dirección
      if (sequentialMode === 'descending') {
        currentStartNote = lastNote
        currentEndNote = firstNote
      } else {
        currentStartNote = firstNote
        currentEndNote = lastNote
      }
      if (sequentialMode === 'both') { n = 16; if (num !== 16) setNum(16) }
      else { n = 8; if (num !== 8) setNum(8) }
      if (startNote !== currentStartNote) setStartNote(currentStartNote)
      if (endNote !== currentEndNote) setEndNote(currentEndNote)
    }

    if (sequentialMode === 'random') {
      if (n === 1) {
        setDictation([currentStartNote === currentEndNote ? currentStartNote : (Math.random() < 0.5 ? currentStartNote : currentEndNote)])
      } else if (n === 2) {
        setDictation([currentStartNote, currentEndNote])
      } else {
        const middle = makeMelody(n - 2, currentStartNote, currentEndNote, 'random', includeSilences, currentClefConfig)
        setDictation([currentStartNote, ...middle, currentEndNote])
      }
    } else {
      const sequence = makeMelody(n, currentStartNote, currentEndNote, sequentialMode, false, currentClefConfig)
      setDictation(sequence)
    }

    setUserNotes(Array(n).fill(null))
    setUserInputs(Array(n).fill(''))
    setActiveIdx(0)
    setMask(null)

    const modeLabel = {
      random: 'aleatorio',
      ascending: 'secuencial ascendente',
      descending: 'secuencial descendente',
      both: 'secuencial (ascendente + descendente)'
    }[sequentialMode] || 'aleatorio'

    setStatus(`Nuevo dictado de ${n} notas (${modeLabel}). Coloca tu respuesta y califica.`)
  }

  function playSequence(keys) {
    if (isPlaying) {
      setIsPlaying(false)
      setCurrentPlayingNote(-1)
      setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
      setMetronomeActive(false)
      stopAllSounds()
      if (playIntervalRef.current) { clearInterval(playIntervalRef.current); playIntervalRef.current = null }
      if (metronomeIntervalRef.current) { clearInterval(metronomeIntervalRef.current); metronomeIntervalRef.current = null }
      return
    }

    ensureAudio()
    setIsPlaying(true)

    const beatSec = 60 / bpm
    const len = DURATIONS[dur]?.factor ?? 1
    const durSec = len * beatSec * 0.95
    const sequenceDuration = 1.0 + keys.length * beatSec * len

    function playOnce() {
      playTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      playTimeoutsRef.current = []
      const prepTime = 1.0
      setCurrentPlayingNote(-1)
      setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
      setMetronomeActive(true)
      setMetronomeBeat(0)
      if (metronomeIntervalRef.current) { clearInterval(metronomeIntervalRef.current) }
      const totalBeats = keys.length * len
      for (let beat = 0; beat < totalBeats; beat++) {
        const timeout = setTimeout(() => setMetronomeBeat(beat % 4), (prepTime + beat * beatSec) * 1000)
        playTimeoutsRef.current.push(timeout)
      }
      const endTimeout = setTimeout(() => setMetronomeActive(false), (prepTime + totalBeats * beatSec) * 1000)
      playTimeoutsRef.current.push(endTimeout)

      const playOne = (k, when, duration) => {
        if (k === 'rest') {
          setCurrentNoteDisplay({ spn: '---', solfege: 'Silencio', show: true })
        } else {
          setCurrentNoteDisplay({ spn: labelSPN(k), solfege: labelSolfege(k), show: true })
          if (engine === 'yamaha' && toneSamplerRef) {
            toneSamplerRef.triggerAttackRelease(labelSPN(k), duration)
          } else {
            pianoLike(freqOfKey(k), ctx.currentTime + when, duration)
          }
        }
      }

      const schedule = () => {
        keys.forEach((k, i) => {
          const noteTimeout = setTimeout(() => {
            setCurrentPlayingNote(i)
            playOne(k, prepTime + i * beatSec * len, durSec)
            const lightTimeout = setTimeout(() => {
              if (i === keys.length - 1) {
                setCurrentPlayingNote(-1)
                setCurrentNoteDisplay({ spn: '', solfege: '', show: false })
              }
            }, durSec * 1000)
            playTimeoutsRef.current.push(lightTimeout)
          }, (prepTime + i * beatSec * len) * 1000)
          playTimeoutsRef.current.push(noteTimeout)
        })
      }

      if (engine === 'yamaha') {
        loadYamaha().then(schedule).catch(schedule)
      } else {
        schedule()
      }
    }

    playOnce()
    playIntervalRef.current = setInterval(playOnce, (sequenceDuration + 1) * 1000)
  }

  function startMet() { ensureAudio(); const beatSec = 60 / bpm; let t = ctx.currentTime + 0.05; for (let i = 0; i < 4; i++) { clickMetronome(t + i * beatSec) } }

  function grade() {
    if (!dictation.length) { setStatus('Primero genera un dictado.'); return }
    if (mode === 'exam') {
      const m = userNotes.map((k, i) => k ? k === dictation[i] : null)
      const answered = userNotes.filter(Boolean).length
      const correct = m.filter(Boolean).length
      const pct = answered > 0 ? Math.round(100 * correct / answered) : 0
      setMask(m)
      if (answered === dictation.length) {
        setStatus(`Resultado final: ${correct}/${dictation.length} (${Math.round(100 * correct / dictation.length)}%).`)
      } else {
        setStatus(`Progreso: ${correct}/${answered} correctas de ${answered}/${dictation.length} respondidas (${pct}% acierto).`)
      }
      return
    }
    // En modo train, permitir calificar incluso con campos vacíos
    const m = userNotes.map((k, i) => k ? k === dictation[i] : null)
    const answered = userNotes.filter(Boolean).length
    const correct = m.filter(Boolean).length
    const pct = answered > 0 ? Math.round(100 * correct / answered) : 0
    setMask(m)
    if (answered === dictation.length) {
      setStatus(`Resultado: ${correct}/${dictation.length} (${Math.round(100 * correct / dictation.length)}%).`)
    } else {
      setStatus(`Progreso: ${correct}/${answered} correctas de ${answered}/${dictation.length} respondidas (${pct}% acierto).`)
    }
  }

  return (
    <Container className="wrap">
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/')}
          >
            Volver al menú
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0b2a50', flex: 1 }}>🎧 Entrenador de dictados melódicos — Clave de {currentClefConfig.name} (4/4)</Typography>
        </Box>

        {/* Información musical */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              🎵 Información musical
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowNoteReference(!showNoteReference)}
            >
              {showNoteReference ? 'Ocultar' : 'Mostrar'}
            </Button>
          </Stack>

          {showNoteReference && (
            <Grid container spacing={2}>
              <FundamentalNotesTable />
              <ChromaticIntervalsTable />
            </Grid>
          )}
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} className="panel" alignItems="center">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="# de notas (1–16)" type="number" inputProps={{ min: 1, max: 16 }} value={num} onChange={e => setNum(Number(e.target.value))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="BPM (40–180)" type="number" inputProps={{ min: 40, max: 180 }} value={bpm} onChange={e => setBpm(Number(e.target.value))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="dur-label">Duración</InputLabel>
                <Select labelId="dur-label" label="Duración" value={dur} onChange={e => setDur(e.target.value)}>
                  <MenuItem value={'q'}>Negra (q)</MenuItem>
                  <MenuItem value={'8'}>Corchea (8)</MenuItem>
                  <MenuItem value={'h'}>Blanca (h)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="start-label">Nota inicial</InputLabel>
                <Select labelId="start-label" label="Nota inicial" value={startNote} onChange={e => setStartNote(e.target.value)}>
                  {currentClefConfig.rangeKeys.map(k => (
                    <MenuItem
                      key={`${selectedClef}-${k}`}
                      value={k}
                      sx={ledgerSet.has(k) ? { backgroundColor: '#fce4ec', '&:hover': { backgroundColor: '#f8bbd9' } } : undefined}
                    >
                      {`${labelSPN(k)} (${labelSolfege(k)})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="end-label">Nota final</InputLabel>
                <Select labelId="end-label" label="Nota final" value={endNote} onChange={e => setEndNote(e.target.value)}>
                  {currentClefConfig.rangeKeys.map(k => (
                    <MenuItem
                      key={`${selectedClef}-${k}`}
                      value={k}
                      sx={ledgerSet.has(k) ? { backgroundColor: '#fce4ec', '&:hover': { backgroundColor: '#f8bbd9' } } : undefined}
                    >
                      {`${labelSPN(k)} (${labelSolfege(k)})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="mode-label">Modo</InputLabel>
                <Select labelId="mode-label" label="Modo" value={mode} onChange={e => setMode(e.target.value)}>
                  <MenuItem value={'train'}>Entrenamiento</MenuItem>
                  <MenuItem value={'exam'}>Examen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="clef-label">Clave</InputLabel>
                <Select labelId="clef-label" label="Clave" value={selectedClef} onChange={e => setSelectedClef(e.target.value)}>
                  <MenuItem value={'treble'}>Sol (2ª línea)</MenuItem>
                  <MenuItem value={'bass'}>Fa (4ª línea)</MenuItem>
                  <MenuItem value={'bass_3rd'}>Fa (3ª línea)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="seq-mode-label">Tipo de secuencia</InputLabel>
                <Select labelId="seq-mode-label" label="Tipo de secuencia" value={sequentialMode} onChange={e => setSequentialMode(e.target.value)}>
                  <MenuItem value={'random'}>Aleatorio</MenuItem>
                  <MenuItem value={'ascending'}>Secuencial ascendente</MenuItem>
                  <MenuItem value={'descending'}>Secuencial descendente</MenuItem>
                  <MenuItem value={'both'}>Ambos (ascendente o descendente)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              {sequentialMode === 'random' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeSilences}
                      onChange={(e) => setIncludeSilences(e.target.checked)}
                      sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}
                    />
                  }
                  label="Incluir silencios"
                  sx={{ height: '56px', alignItems: 'center', ml: 1 }}
                />
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="eng-label">Sonido</InputLabel>
                <Select labelId="eng-label" label="Sonido" value={engine} onChange={e => setEngine(e.target.value)}>
                  <MenuItem value={'yamaha'}>Piano Yamaha (muestras)</MenuItem>
                  <MenuItem value={'synth'}>Piano simulado (rápido)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button variant="contained" onClick={newDictation} startIcon={<RestartAlt />}>Nuevo</Button>
                <Button variant="contained" color="primary" onClick={() => playSequence(dictation)} startIcon={isPlaying ? <Pause /> : <PlayArrow />}>
                  {isPlaying ? 'Pausar' : 'Reproducir'}
                </Button>
                <Button variant="outlined" onClick={startMet}>Metrónomo</Button>
              </Stack>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1}>
            <Chip label={`Rango: ${labelSPN(startNote)}–${labelSPN(endNote)}`} />
            <Chip label="Naturales (sin alteraciones)" />
            <Chip label="Tiempo 4/4" />
          </Stack>
        </Stack>

        <Paper className="staff">
          <div className="legend">Pentagrama 1 (dictado) – solo lectura</div>
          {mode === 'train' && (currentNoteDisplay.show || (isPlaying && currentNoteDisplay.spn)) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1, backgroundColor: 'rgba(255, 107, 53, 0.1)', borderRadius: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff6b35', textAlign: 'center' }}>
                ♪ {currentNoteDisplay.spn} ({currentNoteDisplay.solfege}) ♪
              </Typography>
            </Box>
          )}
          {metronomeActive && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, py: 1, backgroundColor: 'rgba(33, 150, 243, 0.1)', borderRadius: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
                {bpm} BPM:
              </Typography>
              {[0, 1, 2, 3].map(beat => (
                <Box key={beat} sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: metronomeBeat === beat ? '#2196f3' : '#e0e0e0', transition: 'background-color 0.1s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: metronomeBeat === beat ? 'white' : '#666', fontWeight: 'bold' }}>
                    {beat + 1}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          <div id="staveA" ref={wrapA} />
          {mode === 'train' && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {dictation.map((k, idx) => (
                <Chip key={`L-${idx}`} label={`${labelSPN(k)} (${labelSolfege(k)})`} size="small" />
              ))}
            </Box>
          )}
        </Paper>

        <Paper className="staff">
          <div className="legend">Pentagrama 2 (tu respuesta) – clic para añadir · clic derecho o ⌫ para deshacer</div>
          <div id="staveB" ref={wrapB} />
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {Array.from({ length: dictation.length }, (_, i) => {
              const txt = userInputs[i] ?? ''
              const p = parseNoteInput(txt)
              const helper = txt ? (p.valid ? (p.typedSolfege ? labelSPN(p.key) : labelSolfege(p.key)) : 'Ej: C4 o Do4') : 'Ej: C4 o Do4'
              const color = mask && txt ? (mask[i] ? 'success' : 'error') : undefined
              const persistentStyle = mask && txt ? (mask[i] ?
                { '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#4caf50', borderWidth: '2px' },
                    '&:hover fieldset': { borderColor: '#4caf50', borderWidth: '2px' },
                    '&.Mui-focused fieldset': { borderColor: '#4caf50', borderWidth: '2px' },
                    '&.Mui-disabled fieldset': { borderColor: '#4caf50', borderWidth: '2px' }
                  } } :
                { '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#f44336', borderWidth: '2px' },
                    '&:hover fieldset': { borderColor: '#f44336', borderWidth: '2px' },
                    '&.Mui-focused fieldset': { borderColor: '#f44336', borderWidth: '2px' },
                    '&.Mui-disabled fieldset': { borderColor: '#f44336', borderWidth: '2px' }
                  } }
              ) : {}
              return (
                <Grid item xs={6} md={3} key={`in-${i}`}>
                  <TextField fullWidth size="small" label={`#${i + 1}`}
                    value={txt}
                    onChange={(e) => {
                      const val = e.target.value
                      setMask(null) // Limpiar colores al editar
                      setActiveIdx(i)
                      setUserInputs(prev => { const next = [...prev]; next[i] = val; return next })
                      const q = parseNoteInput(val)
                      setUserNotes(prev => { const next = [...prev]; next[i] = q.valid ? q.key : null; return next })
                    }}
                    onFocus={() => { setActiveIdx(i) }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const next = Math.min(dictation.length - 1, i + 1)
                        inputRefs.current[next]?.focus()
                      }
                    }}
                    inputRef={(el) => { inputRefs.current[i] = el }}
                    error={Boolean(txt && !p.valid)} helperText={helper} color={color}
                    sx={persistentStyle}
                  />
                </Grid>
              )
            })}
          </Grid>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <Box className="status" sx={{ flex: 1 }}>{status}</Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" color="warning" startIcon={<DeleteOutline />} onClick={() => { setUserNotes(Array(dictation.length).fill(null)); setUserInputs(Array(dictation.length).fill('')); setActiveIdx(0); setMask(null); setStatus('Respuesta borrada.'); }}>Borrar respuesta</Button>
            <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={grade}>Calificar</Button>
          </Stack>
        </Stack>

      </Stack>
    </Container>
  )
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }