// TunerPage.tsx - Página de afinador con historial
import React, { useEffect, useRef, useState } from 'react'
import { Container, Paper, Typography, Box, Button, Stack, Chip, List, ListItem, ListItemText, Divider } from '@mui/material'
import { ArrowBack, MusicNote, Delete } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

type Mode = 'bass' | 'voice'
const NOTE_NAMES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const NOTE_NAMES_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']

type ModeCfg = {
  minF:number; maxF:number; buf:number; alpha:number; label:string;
  hp:number; lp:number; levelThresh:number; yinThresh:number; confGate:number;
  holdMs:number; changeDebounceMs:number; histSize:number;
}

const MODES: Record<Mode, ModeCfg> = {
  bass:  { minF: 28,  maxF: 600,  buf: 8192, alpha: 0.22, label: 'Bajo', hp: 22,  lp: 1400, levelThresh: 0.0007, yinThresh: 0.12, confGate: 0.70, holdMs: 180, changeDebounceMs: 130, histSize: 7 },
  voice: { minF: 70,  maxF: 1200, buf: 8192, alpha: 0.28, label: 'Voz',  hp: 45,  lp: 3000, levelThresh: 0.0010, yinThresh: 0.10, confGate: 0.68, holdMs: 140, changeDebounceMs: 90, histSize: 5 },
}

// Tipo para el historial
type HistoryEntry = {
  note: string
  freq: number
  cents: number
  timestamp: Date
  locked: boolean
}

// ---------------- Utilidades ----------------
function freqToNote(f: number, a4 = 440, useFlats = false) {
  const midi = Math.round(69 + 12 * Math.log2(f / a4))
  const noteFreq = a4 * Math.pow(2, (midi - 69) / 12)
  const cents = Math.round(1200 * Math.log2(f / noteFreq))
  const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  const name = noteNames[(midi % 12 + 12) % 12]
  const octave = Math.floor(midi / 12) - 1

  const noteIndex = (midi % 12 + 12) % 12
  let enharmonic = null
  if ([1, 3, 6, 8, 10].includes(noteIndex)) {
    const altNames = useFlats ? NOTE_NAMES_SHARP : NOTE_NAMES_FLAT
    enharmonic = altNames[noteIndex]
  }

  return { name, octave, cents, midi, noteFreq, enharmonic }
}

const clamp = (n:number, a:number, b:number)=> Math.min(b, Math.max(a, n))
const median = (arr:number[])=>{
  if (arr.length===0) return NaN
  const a = [...arr].sort((x,y)=>x-y)
  const m = Math.floor(a.length/2)
  return a.length%2 ? a[m] : (a[m-1]+a[m])/2
}
const tuningColor = (absCents:number)=>{
  if (absCents <= 4)  return '#2e7d32'
  if (absCents <= 9)  return '#f6c90e'
  if (absCents <= 16) return '#fb8c00'
  return '#e53935'
}

function yinPitch(
  input: Float32Array,
  sr: number,
  minF: number,
  maxF: number,
  yinThresh: number
): { freq:number, q:number } | null {
  const N = input.length
  if (N < 32) return null

  let mean = 0
  for (let i=0;i<N;i++) mean += input[i]
  mean /= N
  for (let i=0;i<N;i++) {
    const n = i/(N-1)
    const w = 0.5*(1 - Math.cos(2*Math.PI*n))
    input[i] = (input[i]-mean) * w
  }

  const tauMin = Math.max(2, Math.floor(sr / maxF))
  const tauMax = Math.min(Math.floor(sr / minF), N-3)
  if (tauMin >= tauMax) return null

  const d = new Float32Array(tauMax+1)
  for (let tau=tauMin; tau<=tauMax; tau++){
    let sum = 0
    for (let j=0; j < N - tau; j++){
      const diff = input[j] - input[j+tau]
      sum += diff*diff
    }
    d[tau] = sum
  }

  const cmndf = new Float32Array(tauMax+1)
  cmndf[0] = 1
  let run = 0
  for (let tau=tauMin; tau<=tauMax; tau++){
    run += d[tau]
    cmndf[tau] = d[tau] * tau / (run || 1)
  }

  let tauBest = -1
  for (let tau=tauMin; tau<=tauMax; tau++){
    if (cmndf[tau] < yinThresh) {
      let t = tau
      while (t+1<=tauMax && cmndf[t+1] < cmndf[t]) t++
      tauBest = t
      break
    }
  }
  if (tauBest < 0) {
    let minVal = Infinity
    for (let tau=tauMin; tau<=tauMax; tau++){
      if (cmndf[tau] < minVal){ minVal = cmndf[tau]; tauBest = tau }
    }
  }

  let bestVal = cmndf[tauBest]
  for (let off=-2; off<=2; off++){
    const t = clamp(tauBest + off, tauMin, tauMax)
    if (cmndf[t] < bestVal) { bestVal = cmndf[t]; tauBest = t }
  }

  const preferFundamental = (k:number) => {
    const t = tauBest * k
    if (t <= tauMax) {
      if (cmndf[t] <= cmndf[tauBest] * 1.02) tauBest = t
    }
  }
  preferFundamental(2)
  preferFundamental(3)

  const t0 = Math.max(tauMin, tauBest-1)
  const t2 = Math.min(tauMax, tauBest+1)
  const y0 = cmndf[t0], y1 = cmndf[tauBest], y2 = cmndf[t2]
  const denom = (y0 - 2*y1 + y2)
  const shift = denom !== 0 ? 0.5*(y0 - y2)/denom : 0
  const tauRefined = clamp(tauBest + shift, tauMin, tauMax)

  const freq = sr / tauRefined
  const q = 1 - cmndf[tauBest]
  if (!isFinite(freq) || freq < minF || freq > maxF) return null
  return { freq, q }
}

/** ---------- UI: Medidor tipo afinador ---------- */
function NeedleGauge({ cents, max = 50 }: { cents:number; max?:number }) {
  const c = clamp(cents, -max, max)
  const pct = ((c + max) / (2*max)) * 100
  const abs = Math.abs(c)
  const color = tuningColor(abs)

  const tickStyle: React.CSSProperties = {position:'absolute', top:0, height:'100%', width:1, background:'#bbb', opacity:0.8}
  const labelStyle: React.CSSProperties = {position:'absolute', top:'56px', fontSize:10, color:'#666', transform:'translateX(-50%)'}

  return (
    <div style={{marginTop:10}}>
      <div style={{
        position:'relative', height:58, width:'100%', margin:'0 auto',
        borderRadius:10, border:'1px solid #ddd', background:
          'linear-gradient(90deg, rgba(229,57,53,0.10) 0%, rgba(229,57,53,0.06) 16%, rgba(251,140,0,0.06) 32%, rgba(46,125,50,0.10) 50%, rgba(251,140,0,0.06) 68%, rgba(229,57,53,0.06) 84%, rgba(229,57,53,0.10) 100%)'
      }}>
        <div style={{...tickStyle, left:'0%'}} />
        <div style={{...tickStyle, left:'25%'}} />
        <div style={{...tickStyle, left:'50%', width:2, background:'#888'}} />
        <div style={{...tickStyle, left:'75%'}} />
        <div style={{...tickStyle, left:'100%'}} />
        {['12.5%','37.5%','62.5%','87.5%'].map((l,i)=>(
          <div key={i} style={{...tickStyle, left:l as any, opacity:0.45}} />
        ))}

        <div
          style={{
            position:'absolute',
            left:`${pct}%`,
            bottom:-2,
            transform:'translateX(-50%)',
            width:0, height:0,
            borderLeft:'10px solid transparent',
            borderRight:'10px solid transparent',
            borderTop:`18px solid ${color}`,
            filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
            transition:'left 70ms linear'
          }}
          aria-label={`Desviación ${Math.round(c)} cents`}
        />

        <div style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          bottom:0, width:2, height:10, background:'#2e7d32', borderRadius:2
        }}/>

        <div style={{...labelStyle, left:'0%'}}>-50</div>
        <div style={{...labelStyle, left:'25%'}}>-25</div>
        <div style={{...labelStyle, left:'50%', fontWeight:700, color:'#2e7d32'}}>0</div>
        <div style={{...labelStyle, left:'75%'}}>+25</div>
        <div style={{...labelStyle, left:'100%'}}>+50</div>
      </div>

      <div style={{textAlign:'center', marginTop:8, fontSize:12, color:'#555'}}>
        {cents>0 ? `+${cents} cents (agudo)` : cents<0 ? `${cents} cents (grave)` : '±0 cents'}
      </div>
    </div>
  )
}

export default function TunerPage() {
  const navigate = useNavigate()
  const [running, setRunning] = useState(false)
  const [a4, setA4] = useState(440)
  const [mode, setMode] = useState<Mode>('bass')
  const [useFlats, setUseFlats] = useState(false)
  const [readout, setReadout] = useState<{note:string, cents:number, freq:number, q:number, locked:boolean, enharmonic?:string} | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const bufRef = useRef<Float32Array | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const smoothRef = useRef<number | null>(null)
  const filtersRef = useRef<{ hp?: BiquadFilterNode; lp?: BiquadFilterNode }>({})
  const missRef = useRef(0)
  const skipRef = useRef(false)
  const rmsAvgRef = useRef(0)
  const fHistRef = useRef<number[]>([])
  const lastStableNoteRef = useRef<string | null>(null)
  const holdUntilRef = useRef(0)
  const lastNoteChangeAtRef = useRef(0)

  useEffect(() => () => stop(), [])

  useEffect(() => {
    const analyser = analyserRef.current
    const ctx = audioCtxRef.current
    const cfg = MODES[mode]
    if (analyser) {
      analyser.fftSize = cfg.buf
      analyser.smoothingTimeConstant = 0
      const buffer = new ArrayBuffer(analyser.fftSize * 4)
      bufRef.current = new Float32Array(buffer)
    }
    if (ctx && filtersRef.current.hp && filtersRef.current.lp) {
      filtersRef.current.hp!.frequency.value = cfg.hp
      filtersRef.current.lp!.frequency.value = cfg.lp
    }
    smoothRef.current = null
    missRef.current = 0
    fHistRef.current = []
    lastStableNoteRef.current = null
    holdUntilRef.current = 0
    lastNoteChangeAtRef.current = 0
  }, [mode])

  async function start() {
    if (running) return
    const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext
    const ctx: AudioContext = new AC({ latencyHint: 'interactive' })

    const analyser = ctx.createAnalyser()
    const cfg = MODES[mode]
    analyser.fftSize = cfg.buf
    analyser.smoothingTimeConstant = 0

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
    })
    const source = ctx.createMediaStreamSource(stream)

    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = cfg.hp;  hp.Q.value = 0.707
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = cfg.lp;  lp.Q.value = 0.707
    source.connect(hp); hp.connect(lp); lp.connect(analyser)

    audioCtxRef.current = ctx
    analyserRef.current = analyser
    sourceRef.current = source
    streamRef.current = stream
    const buffer = new ArrayBuffer(analyser.fftSize * 4)
    bufRef.current = new Float32Array(buffer)
    filtersRef.current = { hp, lp }
    setRunning(true)
    missRef.current = 0
    skipRef.current = false
    rmsAvgRef.current = 0
    fHistRef.current = []
    lastStableNoteRef.current = null
    holdUntilRef.current = 0
    lastNoteChangeAtRef.current = 0
    tick(true)
  }

  function stop() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (sourceRef.current) sourceRef.current.disconnect()
    if (audioCtxRef.current) audioCtxRef.current.close()
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    audioCtxRef.current = null
    analyserRef.current = null
    sourceRef.current = null
    streamRef.current = null
    bufRef.current = null
    filtersRef.current = {}
    setRunning(false)
    setReadout(null)
    smoothRef.current = null
    missRef.current = 0
    skipRef.current = false
    rmsAvgRef.current = 0
    fHistRef.current = []
    lastStableNoteRef.current = null
    holdUntilRef.current = 0
    lastNoteChangeAtRef.current = 0
  }

  function tick(force = false) {
    const analyser = analyserRef.current
    const ctx = audioCtxRef.current
    const buf = bufRef.current
    if (!analyser || !ctx || !buf) return

    if (!force) {
      skipRef.current = !skipRef.current
      if (skipRef.current) { rafRef.current = requestAnimationFrame(()=>tick()); return }
    }

    analyser.getFloatTimeDomainData(buf as any)

    let rms = 0
    for (let i=0;i<buf.length;i++){ const v = buf[i]; rms += v*v }
    rms = Math.sqrt(rms / buf.length)
    rmsAvgRef.current = 0.95*rmsAvgRef.current + 0.05*rms
    const cfg = MODES[mode]
    const adaptiveGate = Math.max(cfg.levelThresh, rmsAvgRef.current*0.25)
    if (rms < adaptiveGate) {
      const nowForGate = typeof performance !== 'undefined' ? performance.now() : Date.now()
      handleNoDetection(nowForGate)
      return scheduleNext()
    }

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const res = yinPitch(buf, ctx.sampleRate, cfg.minF, cfg.maxF, cfg.yinThresh)
    if (res) {
      fHistRef.current.push(res.freq)
      const histLimit = cfg.histSize || 5
      if (fHistRef.current.length > histLimit) fHistRef.current.shift()
      const fMed = median(fHistRef.current)
      const fSmooth = smoothRef.current == null ? fMed : (cfg.alpha * fMed + (1 - cfg.alpha) * smoothRef.current)
      smoothRef.current = fSmooth

      const { name, octave, cents, enharmonic } = freqToNote(fSmooth, a4, useFlats)
      const noteId = `${name}${octave}`
      const prevNote = lastStableNoteRef.current
      if (prevNote && prevNote !== noteId) {
        const sinceChange = nowMs - lastNoteChangeAtRef.current
        if (sinceChange < cfg.changeDebounceMs) {
          missRef.current = 0
          holdUntilRef.current = Math.max(holdUntilRef.current, nowMs + cfg.holdMs * 0.5)
          return scheduleNext()
        }
      }

      // Locked = perfectamente afinado (calidad alta Y cents bajos)
      const locked = (res.q >= cfg.confGate) && (Math.abs(cents) <= 4)
      // Mostrar siempre que tenga calidad mínima (50%)
      const shouldShow = res.q >= 0.50

      if (shouldShow) {
        setReadout({ note: noteId, cents, freq: fSmooth, q: res.q, locked, enharmonic: enharmonic || undefined })
      }

      // Agregar al historial si cambió la nota Y tiene calidad razonable (no necesita estar perfecto)
      if (prevNote !== noteId && res.q >= 0.55) {
        setHistory(prev => [{
          note: noteId,
          freq: fSmooth,
          cents,
          timestamp: new Date(),
          locked
        }, ...prev].slice(0, 20)) // Mantener solo las últimas 20
        lastNoteChangeAtRef.current = nowMs
      }
      lastStableNoteRef.current = noteId
      holdUntilRef.current = nowMs + cfg.holdMs
      missRef.current = 0
    } else {
      handleNoDetection(nowMs)
    }

    scheduleNext()

    function handleNoDetection(nowParam?: number){
      missRef.current += 1
      if (missRef.current >= 6) {
        const now = nowParam ?? (typeof performance !== 'undefined' ? performance.now() : Date.now())
        if (now > holdUntilRef.current) {
          setReadout(null)
          lastStableNoteRef.current = null
          holdUntilRef.current = 0
        }
        smoothRef.current = null
        fHistRef.current = []
        missRef.current = 0
      }
    }
    function scheduleNext(){
      rafRef.current = requestAnimationFrame(()=>tick())
    }
  }

  const cfg = MODES[mode]

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/')}>
          Volver al menú
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0b2a50' }}>
          🎵 Afinador Cromático
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Panel principal del afinador */}
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
              <Button
                variant={running ? "contained" : "outlined"}
                color={running ? "error" : "primary"}
                onClick={running ? stop : start}
                size="large"
                sx={{ fontWeight: 600 }}
              >
                {running ? 'Detener' : 'Iniciar Afinador'}
              </Button>

              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Box>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>A4 (Hz)</Typography>
                  <input
                    type="number"
                    value={a4}
                    min={415}
                    max={466}
                    step={1}
                    onChange={e => setA4(Number(e.target.value))}
                    style={{ width: 80, padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>Alteraciones</Typography>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={useFlats}
                      onChange={e => setUseFlats(e.target.checked)}
                    />
                    <span>Bemoles (♭)</span>
                  </label>
                </Box>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={3} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Instrumento:</Typography>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'bass'}
                  onChange={() => setMode('bass')}
                />
                Bajo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'voice'}
                  onChange={() => setMode('voice')}
                />
                Voz
              </label>
              <Chip
                label={`${cfg.minF}–${cfg.maxF} Hz`}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Divider />

            <Box sx={{ textAlign: 'center', minHeight: 200, py: 3 }}>
              {readout ? (
                <>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Typography variant="h1" sx={{ fontSize: 72, fontWeight: 800, color: tuningColor(Math.abs(readout.cents)) }}>
                      {readout.note}
                    </Typography>
                    {readout.enharmonic && (
                      <Typography variant="h4" sx={{ color: '#666' }}>
                        / {readout.enharmonic}{readout.note.slice(-1)}
                      </Typography>
                    )}
                    <Chip
                      label={readout.locked ? 'AFINADO' : `${(readout.q * 100).toFixed(0)}%`}
                      color={readout.locked ? 'success' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                  <Typography variant="h6" sx={{ opacity: 0.7, mb: 2 }}>
                    {readout.freq.toFixed(2)} Hz
                  </Typography>
                  <NeedleGauge cents={clamp(readout.cents, -50, 50)} />
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, opacity: 0.6 }}>
                  <MusicNote sx={{ fontSize: 64, mb: 2, color: '#ccc' }} />
                  <Typography variant="body1">
                    {running ? 'Esperando señal de audio...' : 'Pulsa "Iniciar Afinador" y permite el acceso al micrófono'}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                Afinación estándar BEADG:
              </Typography>
              <Typography variant="caption" sx={{ color: '#666', lineHeight: 1.6 }}>
                B0 ≈ 30.87 Hz · E1 ≈ 41.20 Hz · A1 ≈ 55.00 Hz · D2 ≈ 73.42 Hz · G2 ≈ 98.00 Hz
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666', lineHeight: 1.6 }}>
                Detector: YIN (CMNDF) con ventana Hann, gate RMS adaptativo y preferencia por fundamental
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Panel de historial */}
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Historial de Notas
            </Typography>
            <Button
              size="small"
              startIcon={<Delete />}
              onClick={() => setHistory([])}
              disabled={history.length === 0}
            >
              Limpiar
            </Button>
          </Stack>

          {history.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, opacity: 0.5 }}>
              <Typography variant="body2">
                Las notas detectadas aparecerán aquí
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 500, overflowY: 'auto' }}>
              {history.map((entry, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <Divider />}
                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: tuningColor(Math.abs(entry.cents)) }}>
                            {entry.note}
                          </Typography>
                          {entry.locked && (
                            <Chip label="✓" size="small" color="success" sx={{ height: 20, fontSize: 10 }} />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            {entry.freq.toFixed(2)} Hz · {entry.cents > 0 ? '+' : ''}{entry.cents} cents
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999', fontSize: 10 }}>
                            {entry.timestamp.toLocaleTimeString()}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  )
}
