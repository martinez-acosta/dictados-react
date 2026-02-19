import * as Tone from "tone";

let sampler: Tone.Sampler | null = null;
let samplerPromise: Promise<Tone.Sampler> | null = null;

async function createSampler() {
  await Tone.start();
  const s = new Tone.Sampler({
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      A2: "A2.mp3",
      C3: "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      A3: "A3.mp3",
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).toDestination();
  await Tone.loaded();
  sampler = s;
  return s;
}

export async function getYamahaSampler() {
  if (sampler) return sampler;
  if (!samplerPromise) {
    samplerPromise = createSampler();
  }
  return samplerPromise;
}

export function releaseYamahaVoices() {
  if (sampler) {
    try {
      (sampler as any).releaseAll?.();
    } catch {}
  }
}
