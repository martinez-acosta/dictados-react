import * as Tone from "tone";

let toneSamplerRef = null;

export const CLEF_CONFIGS = {
  treble: {
    name: "Sol (2ª línea)",
    vexflowClef: "treble",
    rangeKeys: [
      "b/2",
      "c/3",
      "d/3",
      "e/3",
      "f/3",
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
      "g/5",
      "a/5",
      "b/5",
      "c/6",
      "d/6",
      "e/6",
      "f/6",
      "g/6",
      "a/6",
      "b/6",
    ],
    ledgerLineNotes: [
      "b/2",
      "c/3",
      "d/3",
      "e/3",
      "f/3",
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "a/5",
      "b/5",
      "c/6",
      "d/6",
      "e/6",
      "f/6",
      "g/6",
      "a/6",
      "b/6",
    ],
    defaultStart: "c/4",
    defaultEnd: "g/4",
    firstLineNote: "e/4",
    studyRange: [
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
    ],
    sequences: {
      ascending: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"],
      descending: ["c/5", "b/4", "a/4", "g/4", "f/4", "e/4", "d/4", "c/4"],
      both: [
        "c/4",
        "d/4",
        "e/4",
        "f/4",
        "g/4",
        "a/4",
        "b/4",
        "c/5",
        "c/5",
        "b/4",
        "a/4",
        "g/4",
        "f/4",
        "e/4",
        "d/4",
        "c/4",
      ],
    },
  },
  bass: {
    name: "Fa (4ª línea)",
    vexflowClef: "bass",
    rangeKeys: [
      "d/1",
      "e/1",
      "f/1",
      "g/1",
      "a/1",
      "b/1",
      "c/2",
      "d/2",
      "e/2",
      "f/2",
      "g/2",
      "a/2",
      "b/2",
      "c/3",
      "d/3",
      "e/3",
      "f/3",
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
    ],
    ledgerLineNotes: [
      "d/1",
      "e/1",
      "f/1",
      "g/1",
      "a/1",
      "b/1",
      "c/2",
      "d/2",
      "e/2",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
    ],
    defaultStart: "e/2",
    defaultEnd: "d/5",
    firstLineNote: "g/2",
    studyRange: [
      "g/2",
      "a/2",
      "b/2",
      "c/3",
      "d/3",
      "e/3",
      "f/3",
      "g/3",
      "a/3",
    ],
    sequences: {
      ascending: ["e/2", "f/2", "g/2", "a/2", "b/2", "c/3", "d/3", "e/3"],
      descending: ["e/3", "d/3", "c/3", "b/2", "a/2", "g/2", "f/2", "e/2"],
      both: [
        "e/2",
        "f/2",
        "g/2",
        "a/2",
        "b/2",
        "c/3",
        "d/3",
        "e/3",
        "e/3",
        "d/3",
        "c/3",
        "b/2",
        "a/2",
        "g/2",
        "f/2",
        "e/2",
      ],
    },
  },
  bass_3rd: {
    name: "Fa (3ª línea)",
    vexflowClef: "baritone-f",
    rangeKeys: [
      "f/1",
      "g/1",
      "a/1",
      "b/1",
      "c/2",
      "d/2",
      "e/2",
      "f/2",
      "g/2",
      "a/2",
      "b/2",
      "c/3",
      "d/3",
      "e/3",
      "f/3",
      "g/3",
      "a/3",
      "b/3",
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
    ],
    ledgerLineNotes: [
      "f/1",
      "g/1",
      "a/1",
      "b/1",
      "c/2",
      "d/2",
      "e/2",
      "f/2",
      "g/2",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
    ],
    defaultStart: "g/2",
    defaultEnd: "f/5",
    firstLineNote: "b/2",
    studyRange: ["g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3"],
    sequences: {
      ascending: ["g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f/3", "g/3"],
      descending: ["g/3", "f/3", "e/3", "d/3", "c/3", "b/2", "a/2", "g/2"],
      both: [
        "g/2",
        "a/2",
        "b/2",
        "c/3",
        "d/3",
        "e/3",
        "f/3",
        "g/3",
        "g/3",
        "f/3",
        "e/3",
        "d/3",
        "c/3",
        "b/2",
        "a/2",
        "g/2",
      ],
    },
  },
};

export const LETTERS = {
  c: "C",
  d: "D",
  e: "E",
  f: "F",
  g: "G",
  a: "A",
  b: "B",
};

export const SOLFEGE = {
  c: "Do",
  d: "Re",
  e: "Mi",
  f: "Fa",
  g: "Sol",
  a: "La",
  b: "Si",
};

export const DURATIONS = {
  q: { label: "Negra", factor: 1 },
  8: { label: "Corchea", factor: 0.5 },
  h: { label: "Blanca", factor: 2 },
};

export function labelSPN(key) {
  if (key === "rest") return "---";
  const [step, octave] = key.split("/");
  return `${LETTERS[step]}${octave}`;
}

export function labelSolfege(key) {
  if (key === "rest") return "Silencio";
  const [step, octave] = key.split("/");
  return `${SOLFEGE[step]}${octave}`;
}

export function randInt(n) {
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues
  ) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % n;
  }
  return Math.floor(((Math.random() + Math.random() + Math.random()) / 3) * n);
}

export function makeMelody(
  len,
  startNote,
  endNote,
  mode = "random",
  includeSilences = false,
  clefConfig = CLEF_CONFIGS.treble,
) {
  const rangeKeys = clefConfig.rangeKeys ?? [];
  const startIdx = rangeKeys.indexOf(startNote);
  const endIdx = rangeKeys.indexOf(endNote);
  const minIdx = Math.min(startIdx, endIdx);
  const maxIdx = Math.max(startIdx, endIdx);
  const slice = rangeKeys.slice(minIdx, maxIdx + 1);

  if (mode === "random") {
    const arr = [];
    let lastNote = null;
    let sameNoteCount = 0;
    for (let i = 0; i < len; i += 1) {
      const shouldAddRest =
        includeSilences &&
        randInt(100) < 15 &&
        lastNote !== "rest" &&
        i > 0 &&
        i < len - 1;
      if (shouldAddRest) {
        arr.push("rest");
        lastNote = "rest";
        sameNoteCount = 0;
        continue;
      }

      let note;
      let attempts = 0;
      do {
        note = slice[randInt(slice.length)];
        attempts += 1;
        if (note === lastNote) {
          sameNoteCount += 1;
          if (sameNoteCount >= 2 && attempts < 10) {
            continue;
          }
        } else {
          sameNoteCount = 0;
        }
        break;
      } while (attempts < 10);

      arr.push(note);
      lastNote = note;
    }
    return arr;
  }

  if (mode === "ascending") {
    if (clefConfig.sequences?.ascending) return clefConfig.sequences.ascending;
    return Array.from({ length: len }, (_, i) => {
      const noteIdx = Math.min(startIdx + i, maxIdx);
      return rangeKeys[noteIdx];
    });
  }

  if (mode === "descending") {
    if (clefConfig.sequences?.descending) return clefConfig.sequences.descending;
    return Array.from({ length: len }, (_, i) => {
      const noteIdx = Math.max(startIdx - i, minIdx);
      return rangeKeys[noteIdx];
    });
  }

  if (mode === "both") {
    if (clefConfig.sequences?.both) return clefConfig.sequences.both;
    const arr = [];
    for (let i = 0; i < 8; i += 1) {
      arr.push(rangeKeys[Math.min(startIdx + i, maxIdx)]);
    }
    for (let i = 0; i < 8; i += 1) {
      arr.push(rangeKeys[Math.max(maxIdx - i, minIdx)]);
    }
    return arr;
  }

  return Array.from({ length: len }, () => slice[randInt(slice.length)]);
}

export function makeRandomStudyBlock(length, clef) {
  const clefConfig =
    typeof clef === "string" ? CLEF_CONFIGS[clef] : clef ?? CLEF_CONFIGS.treble;
  const pool = clefConfig.studyRange?.length
    ? clefConfig.studyRange
    : clefConfig.rangeKeys;
  return makeMelody(
    length,
    pool[0],
    pool[pool.length - 1],
    "random",
    false,
    { ...clefConfig, rangeKeys: pool },
  );
}

export function parseNoteInput(raw) {
  if (!raw) return { valid: false };
  const compact = String(raw).trim().replace(/\s+/g, "");
  if (!compact) return { valid: false };
  const match = compact.match(/^(do|re|mi|fa|sol|la|si|[cdefgabCDEFGAB])(\d)$/i);
  if (!match) return { valid: false };

  const name = match[1].toLowerCase();
  const octave = parseInt(match[2], 10);
  const solfegeToStep = {
    do: "c",
    re: "d",
    mi: "e",
    fa: "f",
    sol: "g",
    la: "a",
    si: "b",
  };
  const step = name.length > 1 ? solfegeToStep[name] : name;
  if (!step) return { valid: false };

  const key = `${step}/${octave}`;
  return {
    valid: true,
    key,
    spn: `${LETTERS[step]}${octave}`,
    solf: `${SOLFEGE[step]}${octave}`,
    typedSolfege: name.length > 1,
  };
}

const AudioCtx =
  typeof window !== "undefined"
    ? window.AudioContext || window.webkitAudioContext
    : null;

export const audioContext = AudioCtx ? new AudioCtx() : null;

let master = audioContext ? audioContext.createGain() : null;
if (master && audioContext) {
  master.gain.value = 0.7;
  master.connect(audioContext.destination);
}

function resetMaster() {
  if (!audioContext) return;
  if (master) {
    try {
      master.disconnect();
    } catch (error) {
      // noop
    }
  }
  master = audioContext.createGain();
  master.gain.value = 0.7;
  master.connect(audioContext.destination);
}

export async function loadYamahaSampler() {
  if (toneSamplerRef) return toneSamplerRef;
  await Tone.start();
  toneSamplerRef = new Tone.Sampler({
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
  return toneSamplerRef;
}

export function getLoadedSampler() {
  return toneSamplerRef;
}

export function ensureAudio() {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

export function stopAllSounds() {
  if (toneSamplerRef) {
    try {
      toneSamplerRef.releaseAll();
    } catch (error) {
      // noop
    }
  }
  resetMaster();
}

export function freqOfKey(key) {
  const [step, octaveValue] = key.split("/");
  const octave = parseInt(octaveValue, 10);
  const steps = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const midi = (octave + 1) * 12 + steps[step.toLowerCase()];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function pianoLike(freq, time, durSec) {
  if (!audioContext || !master) return;

  const out = audioContext.createGain();
  out.gain.value = 1;

  const lowPass = audioContext.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.setValueAtTime(10000, time);
  lowPass.frequency.exponentialRampToValueAtTime(
    1800,
    time + Math.min(0.6, durSec * 0.7),
  );

  const pan = audioContext.createStereoPanner();
  pan.pan.setValueAtTime(
    Math.min(0.25, Math.max(-0.25, ((freq - 440) / 440) * 0.2)),
    time,
  );

  out.connect(lowPass);
  lowPass.connect(pan);
  pan.connect(master);

  const partials = [
    { type: "triangle", mult: 1, gain: 0.85 },
    { type: "sine", mult: 2, gain: 0.28 },
    { type: "sine", mult: 3, gain: 0.18 },
    { type: "sine", mult: 4, gain: 0.1 },
  ];

  partials.forEach((partial) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = partial.type;
    oscillator.frequency.setValueAtTime(freq * partial.mult * 1.006, time);
    oscillator.frequency.exponentialRampToValueAtTime(
      freq * partial.mult,
      time + 0.03,
    );
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(partial.gain, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0008, time + durSec * 0.95);
    oscillator.connect(gain);
    gain.connect(out);
    oscillator.start(time);
    oscillator.stop(time + durSec);
  });
}

export function clickMetronome(time) {
  if (!audioContext || !master) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.6, time + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(2000, time);
  oscillator.connect(gain);
  gain.connect(master);
  oscillator.start(time);
  oscillator.stop(time + 0.08);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
