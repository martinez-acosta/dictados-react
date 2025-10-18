// VocalTrainer.tsx
import React, { useEffect, useRef, useState } from 'react'
import {
  Container, Paper, Box, Grid, Typography, TextField, MenuItem, Select,
  InputLabel, FormControl, Stack, Button, Chip, FormControlLabel, Checkbox
} from '@mui/material'
import { PlayArrow, Pause, ArrowBack } from '@mui/icons-material'
import { Factory, StaveNote, Stave, TickContext } from 'vexflow'
import * as Tone from 'tone'
import { useNavigate } from 'react-router-dom'
import AlwaysOnTuner from './AlwaysOnTuner'

// ------------------------------------------------------------
// Helpers de notación / nombres
// ------------------------------------------------------------
const LETTERS: Record<string, string> = {
  c:'C', d:'D', e:'E', f:'F', g:'G', a:'A', b:'B',
  'c#':'C♯','d#':'D♯','f#':'F♯','g#':'G♯','a#':'A♯',
  db:'D♭', eb:'E♭', gb:'G♭', ab:'A♭', bb:'B♭',
  'e#':'E♯','b#':'B♯', cb:'C♭', fb:'F♭'
}
const SOLFEGE: Record<string, string> = {
  c:'Do', d:'Re', e:'Mi', f:'Fa', g:'Sol', a:'La', b:'Si',
  'c#':'Do♯','d#':'Re♯','f#':'Fa♯','g#':'Sol♯','a#':'La♯',
  db:'Re♭', eb:'Mi♭', gb:'Sol♭', ab:'La♭', bb:'Si♭',
  'e#':'Mi♯','b#':'Si♯', cb:'Do♭', fb:'Fa♭'
}
const STEPS: Record<string, number> = {
  c:0, 'c#':1, db:1, d:2, 'd#':3, eb:3, e:4, 'e#':5, fb:4,
  f:5, 'f#':6, gb:6, g:7, 'g#':8, ab:8, a:9, 'a#':10, bb:10,
  b:11, 'b#':0, cb:11
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
function midiToToneName(m:number){const name=NAMES_SHARP[m%12]; const o=Math.floor(m/12)-1; return `${name}${o}`}
function keyFromMidi(m:number){const name=NAMES_SHARP_LOWER[m%12]; const o=Math.floor(m/12)-1; return `${name}/${o}`}
function toneNoteFromKey(key:string){return midiToToneName(midiFromKey(key))}
function prettyFromKey(key:string){
  const [s,o]=key.split('/')
  const sym=(LETTERS as any)[s]??s.toUpperCase().replace(/#/g,'♯').replace(/b/g,'♭')
  return `${sym}${o}`
}
function labelSolfege(key:string){const [s,o]=key.split('/'); return `${(SOLFEGE as any)[s]||s.toUpperCase()}${o}`}

// ------------------------------------------------------------
// Audio base
// ------------------------------------------------------------
const AudioCtx = typeof window!=='undefined' ? (window.AudioContext||(window as any).webkitAudioContext) : null
const ctx = AudioCtx ? new AudioCtx() : null
let master = ctx ? ctx.createGain() : null
if (master && ctx){ master.gain.value = 0.7; master.connect(ctx.destination) }
let toneSamplerRef: Tone.Sampler | null = null

async function loadYamaha() {
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

function pianoLike(freq:number, time:number, durSec:number, activeOsc?: Set<OscillatorNode>){
  if (!ctx) return
  const out=ctx.createGain(); out.gain.value=1
  const lp=ctx.createBiquadFilter(); lp.type='lowpass'
  lp.frequency.setValueAtTime(10000,time)
  lp.frequency.exponentialRampToValueAtTime(1800,time+Math.min(0.6,durSec*0.7))
  const pan=(ctx as AudioContext).createStereoPanner(); pan.pan.setValueAtTime(0,time)
  out.connect(lp); lp.connect(pan); pan.connect(master!)
  ;[
    {t:'triangle' as OscillatorType, mult:1, g:0.85},
    {t:'sine' as OscillatorType,     mult:2, g:0.28},
    {t:'sine' as OscillatorType,     mult:3, g:0.18},
    {t:'sine' as OscillatorType,     mult:4, g:0.10},
  ].forEach(p=>{
    const o=ctx!.createOscillator(); o.type=p.t
    const g=ctx!.createGain(); g.gain.value=0
    o.frequency.setValueAtTime(freq*p.mult*1.006,time)
    o.frequency.exponentialRampToValueAtTime(freq*p.mult,time+0.03)
    g.gain.setValueAtTime(0,time)
    g.gain.linearRampToValueAtTime(p.g,time+0.008)
    g.gain.exponentialRampToValueAtTime(0.0008,time+durSec*0.95)
    o.connect(g); g.connect(out)

    if (activeOsc){ activeOsc.add(o); o.addEventListener('ended',()=>activeOsc.delete(o)) }

    o.start(time); o.stop(time+durSec)
  })
}

function sineGuide(freq:number, time:number, durSec:number, glideToFreq?:number, gainDb=-8, activeOsc?: Set<OscillatorNode>){
  if (!ctx) return
  const o=ctx.createOscillator(); o.type='sine'
  const g=ctx.createGain()
  const lin=Math.pow(10, gainDb/20)
  g.gain.setValueAtTime(0, time)
  g.gain.linearRampToValueAtTime(lin, time+0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, time+durSec)
  o.frequency.setValueAtTime(freq, time)
  if (glideToFreq!=null){ o.frequency.linearRampToValueAtTime(glideToFreq, time+durSec) }
  o.connect(g); g.connect(master!)

  if (activeOsc){ activeOsc.add(o); o.addEventListener('ended',()=>activeOsc.delete(o)) }

  o.start(time); o.stop(time+durSec+0.05)
}
function metronomeClickNow(volDb=-3, activeOsc?: Set<OscillatorNode>){
  if (!ctx) return
  const osc=ctx.createOscillator(); osc.type='square'
  const g=ctx.createGain(); g.gain.value=Math.pow(10, volDb/20)
  osc.connect(g); g.connect(master!)
  const t = (ctx as AudioContext).currentTime
  osc.frequency.setValueAtTime(1200, t)
  g.gain.setValueAtTime(g.gain.value, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t+0.08)

  if (activeOsc){ activeOsc.add(osc); osc.addEventListener('ended',()=>activeOsc.delete(osc)) }

  osc.start(t); osc.stop(t+0.1)
}

// ------------------------------------------------------------
// Escalas base (clave de Sol, registro medio C4–C5). 16 notas
// ------------------------------------------------------------
const SCALE_META: Record<string,string> = {
  C:'Do Mayor', G:'Sol Mayor', D:'Re Mayor', A:'La Mayor', E:'Mi Mayor', B:'Si Mayor',
  'F#':'Fa# Mayor', 'C#':'Do# Mayor', F:'Fa Mayor', Bb:'Si♭ Mayor', Eb:'Mi♭ Mayor',
  Ab:'La♭ Mayor', Db:'Re♭ Mayor', Gb:'Sol♭ Mayor'
}
const scaleOrder = ['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb']

const VOCAL_PATHS_MID: Record<string,string[]> = {
  C:  ['c/4','d/4','e/4','f/4','g/4','a/4','b/4','c/5','c/5','b/4','a/4','g/4','f/4','e/4','d/4','c/4'],
  G:  ['g/4','a/4','b/4','c/5','d/5','e/5','f#/5','g/5','g/5','f#/5','e/5','d/5','c/5','b/4','a/4','g/4'],
  D:  ['d/4','e/4','f#/4','g/4','a/4','b/4','c#/5','d/5','d/5','c#/5','b/4','a/4','g/4','f#/4','e/4','d/4'],
  A:  ['a/4','b/4','c#/5','d/5','e/5','f#/5','g#/5','a/5','a/5','g#/5','f#/5','e/5','d/5','c#/5','b/4','a/4'],
  E:  ['e/4','f#/4','g#/4','a/4','b/4','c#/5','d#/5','e/5','e/5','d#/5','c#/5','b/4','a/4','g#/4','f#/4','e/4'],
  B:  ['b/4','c#/5','d#/5','e/5','f#/5','g#/5','a#/5','b/5','b/5','a#/5','g#/5','f#/5','e/5','d#/5','c#/5','b/4'],
  'F#':['f#/4','g#/4','a#/4','b/4','c#/5','d#/5','e#/5','f#/5','f#/5','e#/5','d#/5','c#/5','b/4','a#/4','g#/4','f#/4'],
  'C#':['c#/4','d#/4','e#/4','f#/4','g#/4','a#/4','b#/4','c#/5','c#/5','b#/4','a#/4','g#/4','f#/4','e#/4','d#/4','c#/4'],
  F:  ['f/4','g/4','a/4','bb/4','c/5','d/5','e/5','f/5','f/5','e/5','d/5','c/5','bb/4','a/4','g/4','f/4'],
  Bb: ['bb/4','c/5','d/5','eb/5','f/5','g/5','a/5','bb/5','bb/5','a/5','g/5','f/5','eb/5','d/5','c/5','bb/4'],
  Eb: ['eb/4','f/4','g/4','ab/4','bb/4','c/5','d/5','eb/5','eb/5','d/5','c/5','bb/4','ab/4','g/4','f/4','eb/4'],
  Ab: ['ab/4','bb/4','c/5','db/5','eb/5','f/5','g/5','ab/5','ab/5','g/5','f/5','eb/5','db/5','c/5','bb/4','ab/4'],
  Db: ['db/4','eb/4','f/4','gb/4','ab/4','bb/4','c/5','db/5','db/5','c/5','bb/4','ab/4','gb/4','f/4','eb/4','db/4'],
  Gb: ['gb/4','ab/4','bb/4','cb/5','db/5','eb/5','f/5','gb/5','gb/5','f/5','eb/5','db/5','cb/5','bb/4','ab/4','gb/4'],
}

// ---------------- RANGOS / pasaggio aprox ----------------
type VoiceRange = 'bajo'|'baritono'|'tenor'|'contralto'|'mezzo'|'soprano'
const RANGE_LABEL: Record<VoiceRange,string> = {
  bajo:'Bajo (≈E2–E4)', baritono:'Barítono (≈A2–A4)', tenor:'Tenor (≈C3–C5)',
  contralto:'Contralto (≈F3–F5)', mezzo:'Mezzosoprano (≈A3–A5)', soprano:'Soprano (≈C4–C6)'
}
const RANGE_LIMITS: Record<VoiceRange,{min:number; max:number}> = {
  bajo:      { min: 40, max: 64 },
  baritono:  { min: 45, max: 69 },
  tenor:     { min: 48, max: 72 },
  contralto: { min: 53, max: 77 },
  mezzo:     { min: 57, max: 81 },
  soprano:   { min: 60, max: 84 },
}
const PASSAGGIO_ZONES: Record<VoiceRange,{lo:number; hi:number}> = {
  bajo:      { lo: 62, hi: 66 },
  baritono:  { lo: 62, hi: 67 },
  tenor:     { lo: 64, hi: 71 },
  contralto: { lo: 69, hi: 76 },
  mezzo:     { lo: 71, hi: 78 },
  soprano:   { lo: 72, hi: 79 },
}

// ------------------------------------------------------------
// Ejercicios
// ------------------------------------------------------------
type GuideMode = 'piano' | 'sine' | 'sine_dual'
type ExerciseKind = 'pattern' | 'gliss' | 'sustain'
type Exercise = {
  id: string
  name: string
  kind: ExerciseKind
  patternDegrees?: number[]
  patternSemitones?: number[]
  steps?: number
  spanSemitones?: number
  sustainBeats?: number
  gliss?: boolean
}
const NOTE_TO_PC: Record<string, number> = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 }
const MAJOR_DEGREE_TO_ST: Record<number, number> = { 1:0,2:2,3:4,4:5,5:7,6:9,7:11,8:12 }

const EXERCISES: Exercise[] = [
  { id: 'scale_up_down', name: 'Escala 1–8–1 (Mayor)', kind: 'pattern', patternDegrees:[1,2,3,4,5,6,7,8,8,7,6,5,4,3,2,1] },
  { id: 'five_tone',     name: '5 tonos 1–5–1',         kind: 'pattern', patternSemitones:[0,2,4,5,7,5,4,2,0] },
  { id: 'arpeggio_ma',   name: 'Arpegio 1–3–5–8–5–3–1', kind: 'pattern', patternSemitones:[0,4,7,12,7,4,0] },
  { id: 'octave_clean',  name: 'Octava limpia 1–8–1',   kind: 'pattern', patternSemitones:[0,12,0] },
  { id: 'fa_si',         name: 'Fa–Si (gliss tritono)',  kind: 'gliss',   steps:24, spanSemitones:6 },
  { id: 'sirena',        name: 'Sirena (gliss 1→8→1)',  kind: 'gliss',   steps:36, spanSemitones:12 },
  { id: 'sirena_personal', name: 'Sirena Personal (C3→C#5)', kind: 'gliss', steps:50, spanSemitones:25 },
  { id: 'sustain',       name: 'Nota larga (messa di voce)', kind: 'sustain', sustainBeats:4 },
]

// Ayuda contextual
const EXERCISE_HELP: Record<string,string> = {
  scale_up_down: 'Coordina soporte y paso a mixto en la octava. Útil para estabilizar el 2º pasaggio sin forzar.',
  five_tone:     'Afinación y homogeneidad en registro medio. Ideal para calentar y nivelar vocales.',
  arpeggio_ma:   'Activa resonancias y el registro mixto. Trabaja saltos limpios sin empujar el pecho.',
  octave_clean:  'Practica el salto de octava limpio (1–8–1). Clave para el control del ataque en el agudo.',
  fa_si:         'Glissando de tritono (4ª aumentada, 6 semitonos): desliza suavemente hacia arriba y de regreso. Desarrolla control en intervalos amplios y tensión armónica sin cortes.',
  sirena:        'Desliza (gliss) a través de los pasaggi sin cortes. Afloja tensiones y mejora continuidad.',
  sirena_personal: 'Sirena personalizada C3→C#5 (25 semitonos). Abarca todo tu rango vocal con glissando suave.',
  sustain:       'Control de aire y dinámica (crescendo–diminuendo) manteniendo afinación estable.',
}

// ------------------------------------------------------------
// UI y lógica
// ------------------------------------------------------------
const DURATIONS = { w:{label:'Redonda',factor:4}, h:{label:'Blanca',factor:2}, q:{label:'Negra',factor:1}, '8':{label:'Corchea',factor:0.5} }

export default function VocalTrainer(){
  const navigate = useNavigate()

  // Parámetros
  const [range, setRange] = useState<VoiceRange>('baritono')
  const [selectedScale, setSelectedScale] = useState<string>('C')
  const [exerciseId, setExerciseId] = useState<string>('scale_up_down')
  const [guideMode, setGuideMode] = useState<GuideMode>('piano')
  const [bpm, setBpm] = useState(80)
  const [dur, setDur] = useState<'w'|'h'|'q'|'8'>('w')
  const [countIn, setCountIn] = useState(true)
  const [repeats, setRepeats] = useState(1)
  const [restBeats, setRestBeats] = useState(2)
  const [autoFit, setAutoFit] = useState(true)

  // Estado secuencia
  const [currentScale, setCurrentScale] = useState<{name:string; notes:readonly string[]}|null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingNote, setCurrentPlayingNote] = useState(-1)
  const [currentNoteDisplay, setCurrentNoteDisplay] = useState({ spn:'', solfege:'', show:false })
  const [fitInfo, setFitInfo] = useState<{ transposition:number; peakMidi:number; warnsPassaggio:boolean }|null>(null)

  // Refs
  const wrapA = useRef<HTMLDivElement|null>(null)
  const vfA = useRef<any>(null)
  const timeoutsRef = useRef<number[]>([])
  const loopTimeoutRef = useRef<number | null>(null)
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set())

  // Limpieza al desmontar
  useEffect(() => () => stopAllSounds(true), [])

  // Utilidades
  function ensureAudio(){
    if (ctx && ctx.state==='suspended') ctx.resume()
    try { (Tone as any).Destination.mute = false } catch {}
    if (master && ctx){ try { master.gain.setValueAtTime(0.7, ctx.currentTime) } catch {} }
  }

  function hardMuteToneDestination() {
    try {
      (Tone as any).Destination.mute = true
      ;(Tone as any).Transport?.stop?.()
      ;(Tone as any).Transport?.cancel?.()
    } catch {}
  }

  function clearAllTimeouts(){
    timeoutsRef.current.forEach(id => clearTimeout(id))
    timeoutsRef.current = []
    if (loopTimeoutRef.current){ clearTimeout(loopTimeoutRef.current); loopTimeoutRef.current = null }
  }

  function stopAllSounds(fromUnmount = false){
    clearAllTimeouts()
    try{ (toneSamplerRef as any)?.releaseAll?.() }catch{}
    activeOscillatorsRef.current.forEach(o=>{ try{o.stop()}catch{} })
    activeOscillatorsRef.current.clear()
    hardMuteToneDestination()
    if (ctx && master){
      try{ master.gain.setValueAtTime(0, ctx.currentTime) }catch{}
    }
    if (!fromUnmount){
      setIsPlaying(false)
      setCurrentPlayingNote(-1)
      setCurrentNoteDisplay({ spn:'', solfege:'', show:false })
    }
  }

  // Construcción de frase según ejercicio + clave elegida
  useEffect(()=>{
    const ex = EXERCISES.find(e=>e.id===exerciseId)!
    const limits = RANGE_LIMITS[range]
    const pass = PASSAGGIO_ZONES[range]
    const rootPc = NOTE_TO_PC[selectedScale]

    let rootMidi = 60 + (rootPc - NOTE_TO_PC['C'])

    let offsets:number[] = []
    if (ex.kind==='pattern'){
      if (ex.patternDegrees) offsets = ex.patternDegrees.map(d => MAJOR_DEGREE_TO_ST[d as 1|2|3|4|5|6|7|8])
      else if (ex.patternSemitones) offsets = ex.patternSemitones.slice()
    } else if (ex.kind==='gliss'){
      if (ex.id === 'sirena_personal') {
        // Sirena hardcodeada C3 → C#5 → C3
        const c3Midi = 48  // C3 = 48
        const cs5Midi = 73 // C#5 = 73
        const steps = ex.steps ?? 50
        const totalSpan = cs5Midi - c3Midi // 25 semitonos
        const up = Array.from({length:steps},(_,i)=> Math.round((totalSpan*i)/(steps-1)))
        const down = Array.from({length:steps},(_,i)=> totalSpan - Math.round((totalSpan*i)/(steps-1)))
        offsets = [...up, ...down]
        rootMidi = c3Midi // Forzar C3 como base
      } else {
        const steps=ex.steps ?? 36, span=ex.spanSemitones ?? 12
        const up  = Array.from({length:steps},(_,i)=> Math.round((span*i)/(steps-1)))
        const down= Array.from({length:steps},(_,i)=> span - Math.round((span*i)/(steps-1)))
        offsets = [...up, ...down]
      }
    } else if (ex.kind==='sustain'){
      offsets = Array(4).fill(0)
    }

    const relMin = Math.min(...offsets)
    const relMax = Math.max(...offsets)

    let transposition = 0
    const tryFits = [0, -12, +12, -24, +24]
    // No aplicar ajuste automático al ejercicio personal
    if (autoFit && ex.id !== 'sirena_personal'){
      let best: {tp:number; inside:number} | null = null
      for (const tp of tryFits){
        const low  = rootMidi + relMin + tp
        const high = rootMidi + relMax + tp
        const inside = Math.max(0, limits.min - low) + Math.max(0, high - limits.max)
        if (!best || inside < best.inside) best = { tp, inside }
        if (inside===0){ transposition = tp; break }
      }
      if (best && best.inside!==0) transposition = best.tp
    }

    const midis = offsets.map(st => rootMidi + st + transposition)
    const keys  = midis.map(m=>keyFromMidi(m))
    const peak  = Math.max(...midis)
    const warns = peak>=pass.lo && peak<=pass.hi

    setCurrentScale({ name: `${SCALE_META[selectedScale]} — ${EXERCISES.find(e=>e.id===exerciseId)!.name} — ${RANGE_LABEL[range]}`, notes: keys })
    setFitInfo({ transposition, peakMidi: peak, warnsPassaggio: warns })
  }, [exerciseId, selectedScale, range, autoFit])

  // Dibujo del pentagrama
  useEffect(()=>{ drawStaff() },[currentScale, currentPlayingNote, dur])

  function drawStaff(){
    if (!wrapA.current || !currentScale) return
    wrapA.current.innerHTML=''
    const notes=currentScale.notes
    if (!notes.length) return

    // Hacer el pentagrama más adaptable al espacio disponible
    const containerWidth = wrapA.current.parentElement?.clientWidth || 800
    const LEFT_PAD=24, RIGHT_PAD=80, staveMargins=200
    const minNoteWidth = 20 // Mínimo espacio por nota para ejercicios largos
    const maxNoteWidth = 75 // Máximo para ejercicios cortos
    const availableWidth = Math.max(600, containerWidth - 40) // Mínimo 600px
    const optimalNoteWidth = Math.min(maxNoteWidth, Math.max(minNoteWidth, (availableWidth - staveMargins - LEFT_PAD - RIGHT_PAD) / notes.length))
    const calculatedWidth = Math.min(availableWidth, staveMargins + (notes.length * optimalNoteWidth) + LEFT_PAD + RIGHT_PAD)

    vfA.current = new Factory({ renderer:{ elementId: wrapA.current.id, width: calculatedWidth, height:200 } })
    const ctxV = vfA.current.getContext()
    const x=10, y=20, width=calculatedWidth-20
    const stave = new Stave(x,y,width)
    stave.addClef('treble').addTimeSignature('4/4')
    stave.setContext(ctxV).draw()

    const startX = stave.getNoteStartX() + LEFT_PAD
    const endX   = stave.getX() + stave.getWidth() - RIGHT_PAD
    const avail  = endX - startX

    const d = dur==='8' ? '8' : dur==='h' ? 'h' : dur==='w' ? 'w' : 'q'
    const beatsPerNote = DURATIONS[dur]?.factor ?? 1
    const spacing = avail / (notes.length + 1)
    const positions: {x:number; beat:number}[] = []

    notes.forEach((noteKey,i)=>{
      const note = new StaveNote({ clef:'treble', keys:[noteKey], duration:d })
      if (currentPlayingNote===i) note.setStyle({ fillStyle:'#ff6b35', strokeStyle:'#ff6b35' })
      note.setStave(stave).setContext(ctxV)
      const tc = new TickContext()
      const noteX = startX + (i+1)*spacing
      tc.addTickable(note).preFormat().setX(noteX)
      note.setTickContext(tc); note.draw()
      positions.push({ x:noteX, beat:i*beatsPerNote })
    })

    let acc=0
    for (let i=0;i<positions.length-1;i++){
      acc += beatsPerNote
      if (acc>=4){
        const barX=(positions[i].x+positions[i+1].x)/2
        ctxV.beginPath()
        ctxV.moveTo(barX, stave.getYForLine(0))
        ctxV.lineTo(barX, stave.getYForLine(4))
        ctxV.strokeStyle='#999'; ctxV.lineWidth=1; ctxV.stroke()
        acc=0
      }
    }
  }

  // ----------------- Play / Pause con scheduler cancelable -----------------
  async function play(){
    if (!currentScale) return

    // Si ya está sonando → PAUSA dura
    if (isPlaying){
      stopAllSounds()
      return
    }

    // Arranque limpio
    ensureAudio()
    await loadYamaha()
    setIsPlaying(true)

    const ex = EXERCISES.find(e=>e.id===exerciseId)!
    const beatSec=60/bpm
    const len = DURATIONS[dur]?.factor ?? 1
    const noteDurSec = len*beatSec
    const noteDurMs  = noteDurSec * 1000
    const restMs     = restBeats * beatSec * 1000

    // Count-in con timeouts cancelables
    const nowMs = performance.now()
    const startDelayMs = countIn ? 2 * beatSec * 1000 : 0

    if (countIn){
      const id1 = window.setTimeout(()=>metronomeClickNow(-3, activeOscillatorsRef.current), startDelayMs - 2*beatSec*1000)
      const id2 = window.setTimeout(()=>metronomeClickNow(-3, activeOscillatorsRef.current), startDelayMs - 1*beatSec*1000)
      timeoutsRef.current.push(id1, id2)
    }

    const schedulePhraseOnce = (phraseStartMs:number) => {
      currentScale.notes.forEach((key,i)=>{
        const whenMs = phraseStartMs + i * noteDurMs

        // UI
        const tIdx = window.setTimeout(()=> setCurrentPlayingNote(i), whenMs - performance.now())
        const tLbl = window.setTimeout(()=> setCurrentNoteDisplay({ spn:prettyFromKey(key), solfege:labelSolfege(key), show:true }), whenMs - performance.now())
        timeoutsRef.current.push(tIdx, tLbl)

        // AUDIO en “ahora” (sin programar futuro) para poder cancelarlo con clearTimeout
        const tAud = window.setTimeout(()=> {
          const f = 440 * Math.pow(2, (midiFromKey(key) - 69)/12)
          if (guideMode==='piano'){
            if (toneSamplerRef){
              toneSamplerRef.triggerAttackRelease(toneNoteFromKey(key), noteDurSec*0.95)
            } else {
              pianoLike(f, (ctx as AudioContext).currentTime, noteDurSec*0.95, activeOscillatorsRef.current)
            }
          } else {
            const next = i<currentScale.notes.length-1 ? currentScale.notes[i+1] : undefined
            const glide = (ex.kind==='gliss'||ex.gliss) && next
              ? 440 * Math.pow(2, (midiFromKey(next) - 69)/12) : undefined
            sineGuide(f, (ctx as AudioContext).currentTime, noteDurSec*0.95, glide, -8, activeOscillatorsRef.current)
            if (guideMode==='sine_dual'){
              if (f*2 < 5000) sineGuide(f*2, (ctx as AudioContext).currentTime, noteDurSec*0.95, glide?glide*2:undefined, -16, activeOscillatorsRef.current)
              if (f/2 > 40)   sineGuide(f/2, (ctx as AudioContext).currentTime, noteDurSec*0.95, glide?glide/2:undefined, -16, activeOscillatorsRef.current)
            }
          }
        }, whenMs - performance.now())
        timeoutsRef.current.push(tAud)

        if (i===currentScale.notes.length-1){
          const tClear = window.setTimeout(()=> {
            setCurrentPlayingNote(-1)
            setCurrentNoteDisplay({ spn:'', solfege:'', show:false })
          }, whenMs - performance.now() + noteDurMs*0.8)
          timeoutsRef.current.push(tClear)
        }
      })
    }

    const phraseLenMs = currentScale.notes.length * noteDurMs

    const scheduleSeries = (seriesStartMs:number) => {
      for (let r=0; r<repeats; r++){
        schedulePhraseOnce(seriesStartMs + r*(phraseLenMs + restMs))
      }
      // programar siguiente serie con timeout (cancelable)
      const nextStart = seriesStartMs + repeats*(phraseLenMs + restMs)
      loopTimeoutRef.current = window.setTimeout(() => {
        scheduleSeries(performance.now() + 50) // pequeño margen
      }, nextStart - performance.now())
    }

    // Primera serie
    scheduleSeries(nowMs + startDelayMs)
  }

  // --------- UI ---------
  const peakSpn = fitInfo ? midiToToneName(fitInfo.peakMidi) : ''
  const showWarning = fitInfo?.warnsPassaggio
  const helpText = EXERCISE_HELP[exerciseId] || ''

  return (
    <Box sx={{ width: '100%', px: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={()=>navigate('/')}>Volver al menú</Button>
          <Typography variant="h5" sx={{ fontWeight:700, color:'#0b2a50', flex:1 }}>
            🎤 Entrenador Vocal — Perfiles + Ejercicios
          </Typography>
        </Box>

        <Paper sx={{ p:2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="range-label">Perfil / Rango</InputLabel>
                <Select labelId="range-label" label="Perfil / Rango" value={range} onChange={e=>setRange(e.target.value as VoiceRange)}>
                  {(['bajo','baritono','tenor','contralto','mezzo','soprano'] as VoiceRange[]).map(r=>(
                    <MenuItem key={r} value={r}>{RANGE_LABEL[r]}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                sx={{ mt:0.5 }}
                control={<Checkbox size="small" checked={autoFit} onChange={e=>setAutoFit(e.target.checked)} />}
                label="Ajuste automático al rango"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="exercise-label">Ejercicio</InputLabel>
                <Select labelId="exercise-label" label="Ejercicio" value={exerciseId} onChange={e=>setExerciseId(e.target.value as string)}>
                  {EXERCISES.map(ex => (<MenuItem key={ex.id} value={ex.id}>{ex.name}</MenuItem>))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="scale-label">Tono</InputLabel>
                <Select labelId="scale-label" label="Tono" value={selectedScale} onChange={e=>setSelectedScale(e.target.value)}>
                  {scaleOrder.map(k=><MenuItem key={k} value={k}>{SCALE_META[k]}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={3} md={1.5}>
              <TextField fullWidth size="small" label="BPM" type="number" inputProps={{min:40,max:180}} value={bpm} onChange={e=>setBpm(Number(e.target.value))}/>
            </Grid>

            <Grid item xs={6} sm={3} md={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="dur-label">Duración</InputLabel>
                <Select labelId="dur-label" label="Duración" value={dur} onChange={e=>setDur(e.target.value as any)}>
                  <MenuItem value={'w'}>Redonda</MenuItem>
                  <MenuItem value={'h'}>Blanca</MenuItem>
                  <MenuItem value={'q'}>Negra</MenuItem>
                  <MenuItem value={'8'}>Corchea</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={3} md={1}>
              <FormControlLabel control={<Checkbox size="small" checked={countIn} onChange={e=>setCountIn(e.target.checked)} />} label="Count-in" />
            </Grid>

            <Grid item xs={6} sm={3} md={1}>
              <TextField fullWidth size="small" label="Reps" type="number" inputProps={{min:1,max:8}} value={repeats} onChange={e=>setRepeats(Number(e.target.value))}/>
            </Grid>

            <Grid item xs={6} sm={3} md={1.5}>
              <TextField fullWidth size="small" label="Descanso (beats)" type="number" inputProps={{min:0,max:16}} value={restBeats} onChange={e=>setRestBeats(Number(e.target.value))}/>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained" color="primary" onClick={play}
                startIcon={isPlaying ? <Pause/> : <PlayArrow/>}
                disabled={!currentScale} fullWidth size="small"
              >
                {isPlaying ? 'Pausa' : 'Play'}
              </Button>
            </Grid>
          </Grid>

          {/* Ayuda del ejercicio */}
          <Box sx={{ mt:1.5, p:1.25, borderRadius:1, bgcolor:'rgba(25,118,210,0.06)', border:'1px solid rgba(25,118,210,0.22)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight:700, color:'#1976d2', mb:0.25 }}>
              ¿Para qué sirve este ejercicio?
            </Typography>
            <Typography variant="body2" sx={{ color:'text.secondary' }}>
              {EXERCISE_HELP[exerciseId] || ''}
            </Typography>
          </Box>

          {/* Avisos de ajuste / pasaggio */}
          {fitInfo && (
            <Box sx={{ mt:1, display:'flex', gap:1, flexWrap:'wrap' }}>
              {fitInfo.transposition!==0 && (
                <Chip size="small" color="info" label={`Transpuesto ${fitInfo.transposition>0?'+':''}${fitInfo.transposition} st para encajar en ${RANGE_LABEL[range]}`} />
              )}
              <Chip size="small" variant="outlined" label={`Pico: ${peakSpn}`} />
              {showWarning && (
                <Chip size="small" color="warning" label="⚠ En zona de pasaggio — sube con soporte y poca presión" />
              )}
            </Box>
          )}
        </Paper>

        {/* Afinador centrado */}
        <Paper sx={{ p:2 }}>
          <Typography variant="body2" sx={{ mb:1, color:'text.secondary', textAlign:'center' }}>
            Afinador (micrófono)
          </Typography>
          <Box sx={{ borderRadius:1, p:1, display:'flex', justifyContent:'center' }}>
            <AlwaysOnTuner />
          </Box>
          <Typography variant="caption" sx={{ color:'text.secondary', mt:1, display:'block', textAlign:'center' }}>
            Objetivo de precisión: ±10 cents. Si te alejas, baja el tono raíz o usa la guía "Sine".
          </Typography>
        </Paper>

        {/* Pentagrama */}
        <Paper sx={{ p:2 }}>
          <Typography variant="body2" sx={{ mb:1, color:'text.secondary' }}>
            {currentScale?.name || 'Selecciona perfil, ejercicio y tono'}
          </Typography>

          {currentNoteDisplay.show && (
            <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', py:1, backgroundColor:'rgba(255,107,53,0.1)', borderRadius:1, mb:1 }}>
              <Typography variant="h6" sx={{ fontWeight:'bold', color:'#ff6b35', textAlign:'center' }}>
                ♪ {currentNoteDisplay.spn} ({currentNoteDisplay.solfege}) ♪
              </Typography>
            </Box>
          )}

          <Box sx={{ display:'flex', justifyContent:'center', overflowX:'auto', width:'100%' }}>
            <div id="staveA" ref={wrapA}/>
          </Box>

          {currentScale && (
            <Box sx={{ mt:1, display:'flex', gap:1, flexWrap:'wrap', justifyContent:'center' }}>
              {currentScale.notes.map((n,idx)=>(
                <Chip key={`${n}-${idx}`} label={prettyFromKey(n)} size="small" color={currentPlayingNote===idx?'primary':'default'}/>
              ))}
            </Box>
          )}
        </Paper>
      </Stack>
    </Box>
  )
}