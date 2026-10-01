import type { RhythmPosition, RhythmTimeline } from "./rhythmReading";
import { YAMAHA_C4_SAMPLE_URL } from "../utils/yamahaSamples";

type PlaybackOptions = {
  timeline: RhythmTimeline;
  bpm: number;
  beatsPerMeasure: number;
  countIn: boolean;
  loop: boolean;
  metronome: boolean;
  onPosition: (
    position: RhythmPosition | null,
    entryBeat: number | null,
    pulse: number,
  ) => void;
  onFinish: () => void;
};

// The same recorded C4 used by the app's Yamaha/Salamander piano bank.
// Native sources share one clock with the highlighting and can be cancelled
// individually, including notes already scheduled for a future loop.
export class RhythmPianoPlayer {
  private context: AudioContext | null = null;
  private loading: Promise<void> | null = null;
  private pianoSample: AudioBuffer | null = null;
  private sources = new Set<AudioScheduledSourceNode>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private frame: number | null = null;

  async prepare() {
    this.context ??= new AudioContext();
    const context = this.context;
    await context.resume();
    if (!this.loading) {
      this.loading = fetch(YAMAHA_C4_SAMPLE_URL)
        .then(async (response) => {
          if (!response.ok)
            throw new Error("No se pudo cargar el piano Yamaha.");
          this.pianoSample = await context.decodeAudioData(
            await response.arrayBuffer(),
          );
        })
        .then(() => undefined)
        .catch((error) => {
          this.loading = null;
          throw error;
        });
    }
    await this.loading;
  }

  private connectSource(source: AudioScheduledSourceNode, gain: GainNode) {
    source.connect(gain);
    gain.connect(this.context!.destination);
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      source.disconnect();
      gain.disconnect();
    };
  }

  private playNote(start: number, duration: number) {
    const context = this.context!;
    const source = context.createBufferSource();
    source.buffer = this.pianoSample;
    source.loop = false;
    const end = start + duration;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.9, start + 0.002);
    gain.gain.setValueAtTime(0.9, end - 0.012);
    gain.gain.linearRampToValueAtTime(0, end);
    this.connectSource(source, gain);
    source.start(start);
    source.stop(end);
  }

  private click(start: number, strong: boolean) {
    const context = this.context!;
    const source = context.createOscillator();
    source.frequency.value = strong ? 1300 : 850;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.09, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
    this.connectSource(source, gain);
    source.start(start);
    source.stop(start + 0.05);
  }

  start(options: PlaybackOptions) {
    this.stop();
    if (!options.timeline.positions.length) return;
    const context = this.context!;
    const secondsPerBeat = 60 / options.bpm;
    const entryBeats = options.countIn ? options.beatsPerMeasure : 0;
    const entryStart = context.currentTime + 0.1;
    const exerciseStart = entryStart + entryBeats * secondsPerBeat;
    const cycleSeconds = options.timeline.totalBeats * secondsPerBeat;
    for (let beat = 0; beat < entryBeats; beat += 1)
      this.click(entryStart + beat * secondsPerBeat, beat === 0);

    const scheduleCycle = (start: number) => {
      options.timeline.attacks.forEach((attack) => {
        this.playNote(
          start + attack.startBeat * secondsPerBeat,
          attack.beats * secondsPerBeat,
        );
      });
      if (options.metronome) {
        for (let beat = 0; beat < options.timeline.totalBeats; beat += 1) {
          this.click(
            start + beat * secondsPerBeat,
            beat % options.beatsPerMeasure === 0,
          );
        }
      }
    };
    scheduleCycle(exerciseStart);
    let nextCycle = exerciseStart + cycleSeconds;
    if (options.loop) {
      scheduleCycle(nextCycle);
      nextCycle += cycleSeconds;
      this.timer = setInterval(() => {
        while (nextCycle < context.currentTime + cycleSeconds + 0.35) {
          scheduleCycle(nextCycle);
          nextCycle += cycleSeconds;
        }
      }, 50);
    }

    let lastPosition = "";
    const update = () => {
      const time = context.currentTime;
      if (!options.loop && time >= exerciseStart + cycleSeconds) {
        this.stop();
        options.onFinish();
        return;
      }
      let position: RhythmPosition | null = null;
      let entryBeat: number | null = null;
      let pulse = 0;
      if (time < exerciseStart) {
        if (time >= entryStart)
          entryBeat = Math.floor((time - entryStart) / secondsPerBeat);
      } else {
        const beat =
          ((time - exerciseStart) / secondsPerBeat) %
          options.timeline.totalBeats;
        pulse = Math.floor(beat) % options.beatsPerMeasure;
        position =
          options.timeline.positions.find(
            (note) =>
              beat >= note.startBeat && beat < note.startBeat + note.beats,
          ) ?? null;
      }
      const key = `${position?.noteIndex ?? "entry"}:${entryBeat}:${pulse}`;
      if (key !== lastPosition) {
        options.onPosition(position, entryBeat, pulse);
        lastPosition = key;
      }
      this.frame = requestAnimationFrame(update);
    };
    this.frame = requestAnimationFrame(update);
  }

  stop() {
    if (this.timer !== null) clearInterval(this.timer);
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.timer = null;
    this.frame = null;
    this.sources.forEach((source) => {
      try {
        source.stop();
      } catch {}
    });
    this.sources.clear();
  }

  dispose() {
    this.stop();
    void this.context?.close();
  }
}
