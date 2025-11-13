import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Divider,
  Stack,
  Button
} from '@mui/material'
import { MusicNote, PlayArrow } from '@mui/icons-material'
import { getYamahaSampler, releaseYamahaVoices } from '../utils/yamahaSampler'

const ROOT_OPTIONS = [
  { label: 'C', value: 'C' },
  { label: 'Db', value: 'Db' },
  { label: 'D', value: 'D' },
  { label: 'Eb', value: 'Eb' },
  { label: 'E', value: 'E' },
  { label: 'F', value: 'F' },
  { label: 'Gb', value: 'Gb' },
  { label: 'G', value: 'G' },
  { label: 'Ab', value: 'Ab' },
  { label: 'A', value: 'A' },
  { label: 'Bb', value: 'Bb' },
  { label: 'B', value: 'B' }
] as const

type RootNote = typeof ROOT_OPTIONS[number]['value']

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
  'B#': 0
}

const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const
const FLAT_PREFERENCE = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'])

const CHORD_QUALITIES = [
  {
    id: 'min7',
    symbol: 'm7',
    label: 'Arpegio de acorde menor séptima',
    englishLabel: 'minor 7 arpeggio',
    intervals: [0, 3, 7, 10] as const,
    degrees: ['1', 'b3', '5', 'b7'] as const,
    description: '1-b3-5-b7 (modo dórico / grado ii).'
  },
  {
    id: 'dom7',
    symbol: '7',
    label: 'Arpegio de acorde dominante séptima',
    englishLabel: 'dominant 7 arpeggio',
    intervals: [0, 4, 7, 10] as const,
    degrees: ['1', '3', '5', 'b7'] as const,
    description: '1-3-5-b7 con tensión hacia la tónica (grado V).'
  },
  {
    id: 'maj7',
    symbol: 'maj7',
    label: 'Arpegio de acorde mayor séptima mayor',
    englishLabel: 'major 7 arpeggio',
    intervals: [0, 4, 7, 11] as const,
    degrees: ['1', '3', '5', '7'] as const,
    description: '1-3-5-7 estable y luminoso (grado I).'
  }
] as const

type ChordQuality = typeof CHORD_QUALITIES[number]
type ChordQualityId = ChordQuality['id']

const ARPEGGIO_PATTERNS = [
  {
    id: 'ascending',
    label: 'Ascendente lineal',
    description: '1-3-5-7 para ubicar el acorde de forma directa.',
    order: [0, 1, 2, 3] as const
  },
  {
    id: 'descending',
    label: 'Descendente',
    description: '7-5-3-1 para resolver hacia el registro grave.',
    order: [3, 2, 1, 0] as const
  },
  {
    id: 'pivot',
    label: 'Salto de quinta',
    description: '1-5-7-3 (patrón típico en walking bass).',
    order: [0, 2, 3, 1] as const
  }
] as const

type Pattern = typeof ARPEGGIO_PATTERNS[number]

function noteNameFromSemitone(value: number, preferFlats: boolean) {
  const table = preferFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  const index = ((value % 12) + 12) % 12
  return table[index]
}

function buildChordNotes(root: RootNote, quality: ChordQuality, preferFlats: boolean) {
  const rootValue = NOTE_TO_SEMITONE[root] ?? 0
  return quality.intervals.map(interval => noteNameFromSemitone(rootValue + interval, preferFlats))
}

export default function BassArpeggioExplorer() {
  const [root, setRoot] = useState<RootNote>('D')
  const [qualityId, setQualityId] = useState<ChordQualityId>('min7')
  const [playingPatternId, setPlayingPatternId] = useState<string | null>(null)
  const playbackTimeouts = useRef<number[]>([])
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null)

  const selectedQuality = CHORD_QUALITIES.find(q => q.id === qualityId) ?? CHORD_QUALITIES[0]
  const preferFlats = FLAT_PREFERENCE.has(root)

  const notes = useMemo(
    () => buildChordNotes(root, selectedQuality, preferFlats),
    [root, selectedQuality, preferFlats]
  )

  const chordSymbol = `${root}${selectedQuality.symbol}`
  const NOTE_OCTAVES = [2, 2, 2, 3] as const

  function clearPlaybackTimers() {
    playbackTimeouts.current.forEach(id => window.clearTimeout(id))
    playbackTimeouts.current = []
  }

  function stopPlayback() {
    clearPlaybackTimers()
    setPlayingPatternId(null)
    releaseYamahaVoices()
    setActiveNoteIndex(null)
  }

  useEffect(() => {
    return () => {
      stopPlayback()
    }
  }, [])

  useEffect(() => {
    stopPlayback()
  }, [root, qualityId])

  async function handlePlayPattern(pattern: Pattern) {
    if (notes.length === 0) return
    stopPlayback()
    const sampler = await getYamahaSampler()
    setPlayingPatternId(pattern.id)
    setActiveNoteIndex(null)

    const stepMs = 550
    pattern.order.forEach((index, pos) => {
      const timeout = window.setTimeout(() => {
        setActiveNoteIndex(index)
        const toneNote = `${notes[index]}${NOTE_OCTAVES[index]}`
        sampler.triggerAttackRelease(toneNote, 0.5)
        if (pos === pattern.order.length - 1) {
          setTimeout(() => {
            setPlayingPatternId(null)
            setActiveNoteIndex(null)
          }, 200)
        }
      }, pos * stepMs)
      playbackTimeouts.current.push(timeout)
    })
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MusicNote sx={{ color: 'success.main' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Arpegios de 7ª para Bajo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona el acorde y consulta sus notas 1-3-5-7 en cifrado americano junto con patrones sugeridos.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="root-label">Fundamental</InputLabel>
              <Select
                labelId="root-label"
                label="Fundamental"
                value={root}
                onChange={e => setRoot(e.target.value as RootNote)}
              >
                {ROOT_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="quality-label">Modo / arpegio</InputLabel>
              <Select
                labelId="quality-label"
                label="Modo / arpegio"
                value={qualityId}
                onChange={e => setQualityId(e.target.value as ChordQualityId)}
              >
                {CHORD_QUALITIES.map(quality => (
                  <MenuItem key={quality.id} value={quality.id}>
                    {quality.symbol} — {quality.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {chordSymbol}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedQuality.label} / {selectedQuality.englishLabel}. {selectedQuality.description}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Notas en cifrado americano
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {notes.map((note, idx) => (
              <Chip
                key={`${note}-${idx}`}
                label={`${note} (${selectedQuality.degrees[idx]})`}
                color="default"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Modos / patrones sugeridos
          </Typography>
          <Grid container spacing={1.5}>
            {ARPEGGIO_PATTERNS.map(pattern => (
              <Grid item xs={12} md={4} key={pattern.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    height: '100%',
                    borderColor: playingPatternId === pattern.id ? 'success.main' : undefined
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {pattern.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {pattern.description}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                    {pattern.order.map((index, pos) => {
                      const isActiveNote = playingPatternId === pattern.id && activeNoteIndex === index
                      return (
                        <Chip
                          key={`${pattern.id}-${pos}`}
                          size="small"
                          label={`${notes[index]} (${selectedQuality.degrees[index]})`}
                          color={isActiveNote ? 'success' : 'default'}
                          variant={isActiveNote ? 'filled' : 'outlined'}
                        />
                      )
                    })}
                  </Stack>
                  <Button
                    size="small"
                    variant={playingPatternId === pattern.id ? 'contained' : 'outlined'}
                    startIcon={<PlayArrow fontSize="small" />}
                    sx={{ mt: 1 }}
                    onClick={() => handlePlayPattern(pattern)}
                  >
                    Escuchar
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Paper>
  )
}
