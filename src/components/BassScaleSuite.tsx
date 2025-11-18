import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { ArrowBack, Pause, PlayArrow } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { Factory, Stave, StaveNote, Accidental, Formatter } from 'vexflow'
import * as Tone from 'tone'
import AlwaysOnTuner from './AlwaysOnTuner'
import { getYamahaSampler, releaseYamahaVoices } from '../utils/yamahaSampler'

const ROOT_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
type RootNote = typeof ROOT_NOTES[number]
type PatternId = 'major-scale' | 'minor-scale' | 'major-arpeggio' | 'minor-arpeggio'

const SCALE_MAJOR_BASS: Record<RootNote, readonly string[]> = {
  C: ['c/2','d/2','e/2','f/2','g/2','a/2','b/2','c/3','c/3','b/2','a/2','g/2','f/2','e/2','d/2','c/2'],
  D: ['d/2','e/2','f#/2','g/2','a/2','b/2','c#/3','d/3','d/3','c#/3','b/2','a/2','g/2','f#/2','e/2','d/2'],
  E: ['e/2','f#/2','g#/2','a/2','b/2','c#/3','d#/3','e/3','e/3','d#/3','c#/3','b/2','a/2','g#/2','f#/2','e/2'],
  F: ['f/2','g/2','a/2','bb/2','c/3','d/3','e/3','f/3','f/3','e/3','d/3','c/3','bb/2','a/2','g/2','f/2'],
  G: ['g/2','a/2','b/2','c/3','d/3','e/3','f#/3','g/3','g/3','f#/3','e/3','d/3','c/3','b/2','a/2','g/2'],
  A: ['a/2','b/2','c#/3','d/3','e/3','f#/3','g#/3','a/3','a/3','g#/3','f#/3','e/3','d/3','c#/3','b/2','a/2'],
  B: ['b/2','c#/3','d#/3','e/3','f#/3','g#/3','a#/3','b/3','b/3','a#/3','g#/3','f#/3','e/3','d#/3','c#/3','b/2'],
} as const

const SCALE_MINOR_BASS: Record<RootNote, readonly string[]> = {
  A: ['a/2','b/2','c/3','d/3','e/3','f/3','g/3','a/3','a/3','g/3','f/3','e/3','d/3','c/3','b/2','a/2'],
  B: ['b/2','c#/3','d/3','e/3','f#/3','g/3','a/3','b/3','b/3','a/3','g/3','f#/3','e/3','d/3','c#/3','b/2'],
  C: ['c/2','d/2','eb/2','f/2','g/2','ab/2','bb/2','c/3','c/3','bb/2','ab/2','g/2','f/2','eb/2','d/2','c/2'],
  D: ['d/2','e/2','f/2','g/2','a/2','bb/2','c/3','d/3','d/3','c/3','bb/2','a/2','g/2','f/2','e/2','d/2'],
  E: ['e/2','f#/2','g/2','a/2','b/2','c/3','d/3','e/3','e/3','d/3','c/3','b/2','a/2','g/2','f#/2','e/2'],
  F: ['f/2','g/2','ab/2','bb/2','c/3','db/3','eb/3','f/3','f/3','eb/3','db/3','c/3','bb/2','ab/2','g/2','f/2'],
  G: ['g/2','a/2','bb/2','c/3','d/3','eb/3','f/3','g/3','g/3','f/3','eb/3','d/3','c/3','bb/2','a/2','g/2'],
} as const

const ARPEGGIO_MAJOR_BASS: Record<RootNote, readonly string[]> = {
  C:  ['c/2','e/2','g/2','c/3','c/3','g/2','e/2','c/2'],
  D:  ['d/2','f#/2','a/2','d/3','d/3','a/2','f#/2','d/2'],
  E:  ['e/2','g#/2','b/2','e/3','e/3','b/2','g#/2','e/2'],
  F:  ['f/2','a/2','c/3','f/3','f/3','c/3','a/2','f/2'],
  G:  ['g/2','b/2','d/3','g/3','g/3','d/3','b/2','g/2'],
  A:  ['a/2','c#/3','e/3','a/3','a/3','e/3','c#/3','a/2'],
  B:  ['b/2','d#/3','f#/3','b/3','b/3','f#/3','d#/3','b/2'],
} as const

const ARPEGGIO_MINOR_BASS: Record<RootNote, readonly string[]> = {
  A:  ['a/2','c/3','e/3','a/3','a/3','e/3','c/3','a/2'],
  B:  ['b/2','d/3','f#/3','b/3','b/3','f#/3','d/3','b/2'],
  C:  ['c/2','eb/2','g/2','c/3','c/3','g/2','eb/2','c/2'],
  D:  ['d/2','f/2','a/2','d/3','d/3','a/2','f/2','d/2'],
  E:  ['e/2','g/2','b/2','e/3','e/3','b/2','g/2','e/2'],
  F:  ['f/2','ab/2','c/3','f/3','f/3','c/3','ab/2','f/2'],
  G:  ['g/2','bb/2','d/3','g/3','g/3','d/3','bb/2','g/2'],
} as const

const NOTE_LABELS: Record<string, string> = {
  c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', a: 'A', b: 'B',
  'c#': 'C#', 'd#': 'D#', 'f#': 'F#', 'g#': 'G#', 'a#': 'A#',
  db: 'Db', eb: 'Eb', gb: 'Gb', ab: 'Ab', bb: 'Bb',
  cb: 'Cb', fb: 'Fb', 'e#': 'E#', 'b#': 'B#'
}

const SEMITONES: Record<string, number> = {
  c: 0, 'c#': 1, db: 1,
  d: 2, 'd#': 3, eb: 3,
  e: 4, 'e#': 5, fb: 4,
  f: 5, 'f#': 6, gb: 6,
  g: 7, 'g#': 8, ab: 8,
  a: 9, 'a#': 10, bb: 10,
  b: 11, 'b#': 0, cb: 11
}

const CHROMATIC_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const FIGURE_OPTIONS = [
  { value: 'w', label: 'Redonda (1 compás)', beats: 4 },
  { value: 'h', label: 'Blanca (1/2 compás)', beats: 2 },
  { value: 'q', label: 'Negra (1 tiempo)', beats: 1 },
  { value: '8', label: 'Corchea (1/2 tiempo)', beats: 0.5 }
] as const

type FigureValue = typeof FIGURE_OPTIONS[number]['value']

const FIGURE_TO_BEATS: Record<FigureValue, number> = FIGURE_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.beats
  return acc
}, {} as Record<FigureValue, number>)

const SEGMENT_GAP_BEATS = 1

type PatternConfig = {
  id: PatternId
  title: string
  description: string
  color: string
  getNotes: (root: RootNote) => readonly string[]
}

type PatternWithNotes = PatternConfig & { notes: readonly string[] }

const PATTERN_CONFIGS: readonly PatternConfig[] = [
  {
    id: 'major-scale',
    title: 'Escala Mayor',
    description: 'Ascendente y descendente en una octava completa.',
    color: '#1976d2',
    getNotes: (root) => SCALE_MAJOR_BASS[root]
  },
  {
    id: 'minor-scale',
    title: 'Escala menor natural',
    description: 'Modalidad natural con sensibles bemoles según corresponda.',
    color: '#9c27b0',
    getNotes: (root) => SCALE_MINOR_BASS[root]
  },
  {
    id: 'major-arpeggio',
    title: 'Arpegio Mayor (1–3–5–8)',
    description: 'Triada mayor en posición cerrada, ida y vuelta.',
    color: '#2e7d32',
    getNotes: (root) => ARPEGGIO_MAJOR_BASS[root]
  },
  {
    id: 'minor-arpeggio',
    title: 'Arpegio menor (1–♭3–5–8)',
    description: 'Triada menor natural en registro grave.',
    color: '#f57c00',
    getNotes: (root) => ARPEGGIO_MINOR_BASS[root]
  }
] as const

const DEFAULT_PATTERN_SELECTION: Record<PatternId, boolean> = {
  'major-scale': true,
  'minor-scale': true,
  'major-arpeggio': true,
  'minor-arpeggio': true
}

function keyToAmericanLabel(key: string) {
  const [pc, octave] = key.split('/')
  const label = NOTE_LABELS[pc] ?? pc.toUpperCase()
  return `${label}${octave}`
}

function keyToToneName(key: string) {
  const [pcRaw, octaveRaw] = key.split('/')
  let pc = pcRaw
  let octave = parseInt(octaveRaw, 10)
  if (pc === 'b#') { pc = 'c'; octave += 1 }
  else if (pc === 'cb') { pc = 'b'; octave -= 1 }
  else if (pc === 'e#') { pc = 'f' }
  else if (pc === 'fb') { pc = 'e' }
  const semitone = SEMITONES[pc] ?? 0
  const midi = (octave + 1) * 12 + semitone
  const noteName = CHROMATIC_NAMES[midi % 12]
  const noteOctave = Math.floor(midi / 12) - 1
  return `${noteName}${noteOctave}`
}

export default function BassScaleSuite() {
  const navigate = useNavigate()
  const [selectedRoot, setSelectedRoot] = useState<RootNote>('C')
  const [noteFigure, setNoteFigure] = useState<FigureValue>('q')
  const [bpm, setBpm] = useState(80)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeSegment, setActiveSegment] = useState<PatternId | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const patternRefs = useRef<Record<PatternId, HTMLDivElement | null>>({
    'major-scale': null,
    'minor-scale': null,
    'major-arpeggio': null,
    'minor-arpeggio': null
  })
  const timerRefs = useRef<number[]>([])
  const [enabledPatterns, setEnabledPatterns] = useState<Record<PatternId, boolean>>(DEFAULT_PATTERN_SELECTION)
  const isPlayingRef = useRef(false)

  const patternData = useMemo<PatternWithNotes[]>(
    () => PATTERN_CONFIGS.map((pattern) => ({
      ...pattern,
      notes: pattern.getNotes(selectedRoot)
    })),
    [selectedRoot]
  )

  const patternMap = useMemo(() => {
    return patternData.reduce((acc, pattern) => {
      acc[pattern.id] = pattern
      return acc
    }, {} as Record<PatternId, PatternWithNotes>)
  }, [patternData])

  const selectedPatternData = useMemo(
    () => patternData.filter((pattern) => enabledPatterns[pattern.id]),
    [patternData, enabledPatterns]
  )

  useEffect(() => {
    patternData.forEach((pattern) => {
      const container = patternRefs.current[pattern.id]
      if (!container) return
      if (!container.id) {
        container.id = `bass-suite-${pattern.id}`
      }
      container.innerHTML = ''

      const parentWidth = container.parentElement?.clientWidth ?? 560
      const width = Math.max(420, parentWidth - 16)
      const height = 150
      const factory = new Factory({
        renderer: { elementId: container.id, width, height }
      })
      const ctx = factory.getContext()
      const stave = new Stave(12, 30, width - 24)
      stave.addClef('bass').addTimeSignature('4/4')
      stave.setContext(ctx).draw()

      const vexNotes = pattern.notes.map((key, idx) => {
        const note = new StaveNote({
          clef: 'bass',
          keys: [key],
          duration: noteFigure
        })
        const [pc] = key.split('/')
        if (pc.includes('#')) {
          note.addModifier(new Accidental('#'), 0)
        } else if (pc.length > 1 && pc.endsWith('b')) {
          note.addModifier(new Accidental('b'), 0)
        }

        if (activeSegment === pattern.id && activeIndex === idx) {
          note.setStyle({ fillStyle: '#ff6b35', strokeStyle: '#ff6b35' })
        }
        return note
      })

      Formatter.FormatAndDraw(ctx, stave, vexNotes)
      container.style.width = '100%'
      container.style.minWidth = '0'
      container.style.minHeight = `${height}px`
    })
  }, [patternData, activeSegment, activeIndex, noteFigure])

  useEffect(() => {
    return () => {
      stopPlayback()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearTimers = () => {
    timerRefs.current.forEach((id) => window.clearTimeout(id))
    timerRefs.current = []
  }

  const stopPlayback = () => {
    clearTimers()
    releaseYamahaVoices()
    setIsPlaying(false)
    setActiveSegment(null)
    setActiveIndex(null)
    isPlayingRef.current = false
  }

  const handlePlay = async () => {
    stopPlayback()
    if (!selectedPatternData.length) return
    const sampler = await getYamahaSampler()
    await Tone.start()
    setIsPlaying(true)
    isPlayingRef.current = true

    const clampedBpm = Math.max(30, Math.min(240, bpm))
    const secondsPerBeat = 60 / clampedBpm
    const noteSeconds = secondsPerBeat * FIGURE_TO_BEATS[noteFigure]
    const segmentGapSeconds = secondsPerBeat * SEGMENT_GAP_BEATS

    const scheduleCycle = () => {
      if (!isPlayingRef.current) return
      let offsetSeconds = 0
      selectedPatternData.forEach((pattern) => {
        pattern.notes.forEach((key, idx) => {
          const noteName = keyToToneName(key)
          const timerId = window.setTimeout(() => {
            if (!isPlayingRef.current) return
            setActiveSegment(pattern.id)
            setActiveIndex(idx)
            sampler.triggerAttackRelease(noteName, Math.max(0.2, noteSeconds * 0.9))
          }, offsetSeconds * 1000)
          timerRefs.current.push(timerId)
          offsetSeconds += noteSeconds
        })
        offsetSeconds += segmentGapSeconds
      })
      const loopTimer = window.setTimeout(() => {
        scheduleCycle()
      }, offsetSeconds * 1000)
      timerRefs.current.push(loopTimer)
    }

    scheduleCycle()
  }

  const handleRootChange = (event: SelectChangeEvent) => {
    setSelectedRoot(event.target.value as RootNote)
  }

  const handleFigureChange = (event: SelectChangeEvent<FigureValue>) => {
    setNoteFigure(event.target.value as FigureValue)
  }

  const handleBpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value)
    if (!Number.isNaN(next)) {
      const clamped = Math.max(30, Math.min(220, next))
      setBpm(clamped)
    }
  }

  const handlePatternToggle = (patternId: PatternId) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isPlayingRef.current) {
      stopPlayback()
    }
    const checked = event.target.checked
    setEnabledPatterns((prev) => ({
      ...prev,
      [patternId]: checked
    }))
  }

  const renderPatternCard = (pattern?: PatternWithNotes, isEnabled = true) => {
    if (!pattern) return null
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderLeft: `6px solid ${pattern.color}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          opacity: isEnabled ? 1 : 0.45,
          transition: 'opacity 0.2s ease'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {pattern.title} en {selectedRoot}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pattern.description}
          </Typography>
        </Stack>
        {!isEnabled && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            (No se reproducirá hasta que marques su checkbox.)
          </Typography>
        )}

        <Box
          sx={{
            mt: 2,
            flexGrow: 1,
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            bgcolor: '#fafafa',
            overflow: 'hidden',
            px: 1,
            py: 1
          }}
        >
          <Box
            ref={(el) => {
              patternRefs.current[pattern.id] = el
            }}
            id={`bass-suite-${pattern.id}`}
          />
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          {pattern.notes.map((note, idx) => {
            const isActive = activeSegment === pattern.id && activeIndex === idx
            return (
              <Chip
                key={`${pattern.id}-${note}-${idx}`}
                label={keyToAmericanLabel(note)}
                color={isActive ? 'primary' : 'default'}
                variant={isActive ? 'filled' : 'outlined'}
                size="small"
                sx={{ mb: 1 }}
              />
            )
          })}
        </Stack>
      </Paper>
    )
  }

  const hasActivePatterns = selectedPatternData.length > 0

  const selectorCard = (
    <Paper
      variant="outlined"
      sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Selector de tonalidad
      </Typography>
      <FormControl fullWidth size="small">
        <InputLabel>Tonalidad</InputLabel>
        <Select
          label="Tonalidad"
          value={selectedRoot}
          onChange={handleRootChange}
          MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
        >
          {ROOT_NOTES.map((note) => (
            <MenuItem key={note} value={note}>
              {note}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Figura</InputLabel>
        <Select
          label="Figura"
          value={noteFigure}
          onChange={handleFigureChange}
        >
          {FIGURE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="BPM"
        type="number"
        size="small"
        value={bpm}
        onChange={handleBpmChange}
        inputProps={{ min: 30, max: 220 }}
        fullWidth
      />
      <FormGroup sx={{ border: '1px solid #e0e0e0', borderRadius: 1.5, p: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Patrones incluidos
        </Typography>
        {PATTERN_CONFIGS.map((pattern) => (
          <FormControlLabel
            key={`toggle-${pattern.id}`}
            control={
              <Checkbox
                checked={enabledPatterns[pattern.id]}
                onChange={handlePatternToggle(pattern.id)}
                size="small"
              />
            }
            label={pattern.title}
          />
        ))}
      </FormGroup>
      <Button
        variant="contained"
        color="primary"
        startIcon={isPlaying ? <Pause /> : <PlayArrow />}
        onClick={isPlaying ? stopPlayback : handlePlay}
        fullWidth
        disabled={!hasActivePatterns}
      >
        {isPlaying ? 'Detener suite' : 'Reproducir suite'}
      </Button>
      <Typography variant="body2" color="text.secondary">
        Configura tonalidad, figura rítmica, BPM y qué patrones quieres encadenar. La suite se repetirá en bucle
        hasta que presiones detener.
      </Typography>
    </Paper>
  )

  const tunerCard = (
    <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Afinador siempre activo
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Mantén tu referencia en la misma vista. Ajusta cuerdas antes de tocar cada patrón.
      </Typography>
      <AlwaysOnTuner />
    </Paper>
  )

  const guideCard = (
    <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Guía rápida
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Elige una tonalidad, pulsa reproducir y deja que la suite te lleve por la escala mayor, la menor natural y
        ambos arpegios. Cada nota resaltada muestra su cifrado americano.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Usa el mismo patrón técnico para ambos arpegios: 1–3–5–8 descendiendo con digitación espejo para memorizar
        saltos amplios.
      </Typography>
    </Paper>
  )

  const orderCard = (
    <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Orden de reproducción
      </Typography>
      {hasActivePatterns ? (
        <Stack spacing={1.5}>
          {selectedPatternData.map((pattern, idx) => (
            <Stack key={`${pattern.id}-order`} direction="row" spacing={1} alignItems="flex-start">
              <Chip label={idx + 1} color="primary" size="small" />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {pattern.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {pattern.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No hay patrones seleccionados. Marca al menos uno para escuchar la suite.
        </Typography>
      )}
    </Paper>
  )

  const tonalitiesCard = (
    <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Tonalidades disponibles
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toca una tonalidad para rehacer la suite y practicar otra posición.
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {ROOT_NOTES.map((note) => {
          const isActive = selectedRoot === note
          return (
            <Chip
              key={`tonality-${note}`}
              label={note}
              color={isActive ? 'primary' : 'default'}
              variant={isActive ? 'filled' : 'outlined'}
              onClick={() => setSelectedRoot(note)}
              clickable
              sx={{ mb: 1 }}
            />
          )
        })}
      </Stack>
    </Paper>
  )

  const column1 = [selectorCard, guideCard]
  const column2 = [
    patternMap['major-scale'] && renderPatternCard(patternMap['major-scale'], enabledPatterns['major-scale']),
    patternMap['major-arpeggio'] && renderPatternCard(patternMap['major-arpeggio'], enabledPatterns['major-arpeggio']),
    tunerCard
  ].filter(Boolean) as React.ReactNode[]
  const column3 = [
    patternMap['minor-scale'] && renderPatternCard(patternMap['minor-scale'], enabledPatterns['minor-scale']),
    patternMap['minor-arpeggio'] && renderPatternCard(patternMap['minor-arpeggio'], enabledPatterns['minor-arpeggio']),
    orderCard,
    tonalitiesCard
  ].filter(Boolean) as React.ReactNode[]

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2, md: 4 }, py: 3 }}>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/')}>
            Volver al menú
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0b2a50' }}>
            Suite de Bajo: Escala + Arpegios encadenados
          </Typography>
        </Stack>

        <Box
          sx={{
            width: '100%',
            display: 'grid',
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              md: 'minmax(260px, 0.5fr) repeat(2, minmax(0, 1fr))'
            }
          }}
        >
          {[column1, column2, column3].map((columnNodes, columnIdx) => (
            <Stack key={`col-${columnIdx}`} spacing={2}>
              {columnNodes.map((node, idx) => (
                <Box key={`col-${columnIdx}-item-${idx}`}>{node}</Box>
              ))}
            </Stack>
          ))}
        </Box>
      </Stack>
    </Box>
  )
}
