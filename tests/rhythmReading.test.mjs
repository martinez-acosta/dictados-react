import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { transformWithEsbuild } from "vite";

async function typeScriptUrl(path) {
  let source = readFileSync(new URL(path, import.meta.url), "utf8");
  if (source.includes('from "./rhythmVoiceSustain"')) {
    source = source.replace(
      '"./rhythmVoiceSustain"',
      JSON.stringify(
        await typeScriptUrl("../src/components/rhythmVoiceSustain.ts"),
      ),
    );
  }
  const { code } = await transformWithEsbuild(source, path, {
    loader: "ts",
    define: { "import.meta.env.BASE_URL": '"/dictados-react/"' },
  });
  return `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
}
async function importTypeScript(path) {
  return import(await typeScriptUrl(path));
}
const {
  RHYTHM_READING_EXERCISES: exercises,
  buildRhythmTimeline,
  writtenRhythmNotes,
  rhythmBeats,
} = await importTypeScript("../src/components/rhythmReading.ts");
const { RhythmVoicePlayer } = await importTypeScript(
  "../src/components/rhythmVoice.ts",
);
const { stretchRhythmSyllable } = await importTypeScript(
  "../src/components/rhythmVoiceSustain.ts",
);
const allSystems = (exercise) => exercise.systems.map((_, index) => index);

for (const exercise of exercises) {
  test(`Ejercicio ${exercise.id}: 20 compases exactos y diez ligaduras`, () => {
    assert.equal(exercise.systems.flat().length, 20);
    exercise.systems.flat().forEach((measure) => {
      assert.equal(
        measure.reduce((total, note) => total + rhythmBeats(note.duration), 0),
        exercise.beatsPerMeasure,
      );
    });
    const notes = writtenRhythmNotes(exercise);
    assert.equal(notes.filter((note) => note.tieToNext).length, 10);
    notes.forEach((note, index) => {
      if (note.tieToNext) {
        assert.ok(!note.rest && !notes[index + 1].rest);
        assert.equal(notes[index + 1].measureIndex, note.measureIndex + 1);
      }
    });
    const timeline = buildRhythmTimeline(exercise, allSystems(exercise));
    assert.equal(timeline.totalBeats, 20 * exercise.beatsPerMeasure);
    assert.equal(
      timeline.attacks.length,
      notes.filter((note) => !note.rest).length - 10,
    );
    for (const position of timeline.positions.filter(
      (note) => note.rest || note.continuation,
    )) {
      assert.ok(
        !timeline.attacks.some(
          (attack) => attack.noteIndex === position.noteIndex,
        ),
      );
    }
  });
}

test("25: ta-ka-ta-ka y negra ligada a corchea, sin segundo ataque", () => {
  const timeline = buildRhythmTimeline(exercises[0], [0]);
  assert.deepEqual(
    timeline.attacks
      .slice(0, 7)
      .map(({ startBeat, beats, syllable }) => [startBeat, beats, syllable]),
    [
      [0, 0.5, "ta"],
      [0.5, 0.5, "ka"],
      [1, 0.5, "ta"],
      [1.5, 0.5, "ka"],
      [2, 1.5, "ta"],
      [3.5, 0.5, "ka"],
      [4, 2, "ta"],
    ],
  );
});

test("26: blanca ligada a corchea y ligaduras entre sistemas", () => {
  const timeline = buildRhythmTimeline(exercises[1], [0, 1, 2]);
  assert.deepEqual(timeline.attacks[0], {
    noteIndex: 0,
    startBeat: 0,
    beats: 2.5,
    syllable: "ta",
  });
  const boundary = timeline.positions.find((note) => note.measureIndex === 13);
  assert.ok(boundary.continuation);
  assert.ok(
    !timeline.attacks.some((attack) => attack.noteIndex === boundary.noteIndex),
  );
});

test("Un sistema aislado rearticula una ligadura cuyo origen queda fuera", () => {
  const timeline = buildRhythmTimeline(exercises[1], [2]);
  assert.equal(timeline.positions[0].measureIndex, 13);
  assert.equal(timeline.positions[0].continuation, false);
  assert.equal(timeline.attacks[0].startBeat, 0);
});

test("Sistemas no consecutivos mantienen el orden, sin sostener figuras omitidas", () => {
  const timeline = buildRhythmTimeline(exercises[1], [2, 0]);
  assert.deepEqual(
    [...new Set(timeline.positions.map((note) => note.systemIndex))],
    [0, 2],
  );
  assert.equal(timeline.totalBeats, 26);
  assert.ok(!timeline.positions.some((note) => note.systemIndex === 1));
  assert.equal(
    timeline.positions.find((note) => note.systemIndex === 2).continuation,
    false,
  );
  const middleOnly = buildRhythmTimeline(exercises[1], [1]);
  const finalAttack = middleOnly.attacks.at(-1);
  assert.equal(finalAttack.beats, 0.5);
});

test("Selección vacía: no hay voz ni duración de loop", () => {
  assert.deepEqual(buildRhythmTimeline(exercises[0], []), {
    positions: [],
    attacks: [],
    totalBeats: 0,
  });
});

function decodeWav(bytes) {
  const buffer = Buffer.from(bytes);
  let rate, data;
  for (let offset = 12; offset < buffer.length; ) {
    const type = buffer.toString("ascii", offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    if (type === "fmt ") {
      assert.equal(buffer.readUInt16LE(offset + 8), 1);
      assert.equal(buffer.readUInt16LE(offset + 10), 1);
      assert.equal(buffer.readUInt16LE(offset + 22), 16);
      rate = buffer.readUInt32LE(offset + 12);
    }
    if (type === "data")
      data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 8 + length + (length % 2);
  }
  const samples = Float32Array.from(
    { length: data.length / 2 },
    (_, index) => data.readInt16LE(index * 2) / 32768,
  );
  return {
    sampleRate: rate,
    duration: samples.length / rate,
    getChannelData: () => samples,
  };
}

function fakeAudio(t) {
  const oldContext = globalThis.AudioContext;
  const oldFrame = globalThis.requestAnimationFrame;
  const oldCancel = globalThis.cancelAnimationFrame;
  let context, frameCallback, intervalCallback;
  class Source {
    playbackRate = { value: 1 };
    connect() {}
    disconnect() {}
    start(time) {
      this.startTime = time;
    }
    stop(time) {
      this.stopTime = time;
      this.stopCalls = (this.stopCalls ?? 0) + 1;
    }
  }
  class Context {
    currentTime = 0;
    destination = {};
    voices = [];
    clicks = [];
    constructor() {
      context = this;
    }
    async resume() {}
    async close() {}
    async decodeAudioData(bytes) {
      return decodeWav(bytes);
    }
    createBuffer(channels, length, rate) {
      assert.equal(channels, 1);
      const samples = new Float32Array(length);
      return {
        sampleRate: rate,
        duration: length / rate,
        getChannelData: () => samples,
      };
    }
    createBufferSource() {
      const source = new Source();
      this.voices.push(source);
      return source;
    }
    createOscillator() {
      const source = new Source();
      source.frequency = { value: 0 };
      this.clicks.push(source);
      return source;
    }
    createGain() {
      return {
        connect() {},
        disconnect() {},
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
      };
    }
  }
  globalThis.AudioContext = Context;
  globalThis.requestAnimationFrame = (callback) => {
    frameCallback = callback;
    return 1;
  };
  globalThis.cancelAnimationFrame = () => {
    frameCallback = null;
  };
  t.mock.method(globalThis, "setInterval", (callback) => {
    intervalCallback = callback;
    return 1;
  });
  t.mock.method(globalThis, "clearInterval", () => {
    intervalCallback = null;
  });
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.ok(url.startsWith("/dictados-react/audio/lectura-ritmica/"));
    const asset = readFileSync(
      new URL(
        `../public/audio/lectura-ritmica/${url.split("/").at(-1)}`,
        import.meta.url,
      ),
    );
    return {
      ok: true,
      arrayBuffer: async () =>
        asset.buffer.slice(
          asset.byteOffset,
          asset.byteOffset + asset.byteLength,
        ),
    };
  });
  t.after(() => {
    globalThis.AudioContext = oldContext;
    globalThis.requestAnimationFrame = oldFrame;
    globalThis.cancelAnimationFrame = oldCancel;
  });
  return {
    context: () => context,
    frame: () => frameCallback?.(),
    interval: () => intervalCallback?.(),
  };
}

test("La voz dura toda la figura y las ligaduras, sin bucles de audio", async (t) => {
  const fake = fakeAudio(t);
  const player = new RhythmVoicePlayer();
  await player.prepare();
  const timeline = buildRhythmTimeline(exercises[0], [0]);
  player.start({
    timeline,
    bpm: 60,
    beatsPerMeasure: 3,
    countIn: false,
    loop: false,
    metronome: false,
    onPosition() {},
    onFinish() {},
  });
  const { voices, clicks } = fake.context();
  assert.equal(voices.length, timeline.attacks.length);
  assert.equal(clicks.length, 0);
  voices.forEach((voice, index) => {
    const attack = timeline.attacks[index];
    assert.equal(voice.startTime, 0.1 + attack.startBeat);
    assert.equal(voice.loop, false);
    assert.ok(
      Math.abs(voice.buffer.duration - attack.beats) <
        1 / voice.buffer.sampleRate,
    );
    assert.ok(Math.abs(voice.stopTime - voice.startTime - attack.beats) < 1e-9);
  });
  assert.equal(voices[4].stopTime, 3.6);
  assert.ok(!voices.some((voice) => voice.startTime === 3.1));
  player.stop();
  assert.ok(voices.every((voice) => voice.stopCalls === 2));
});

for (const bpm of [40, 72, 160]) {
  test(`A ${bpm} BPM: duración completa, sin solapamientos ni cambiar el tono`, async (t) => {
    const fake = fakeAudio(t);
    const player = new RhythmVoicePlayer();
    await player.prepare();
    const timeline = buildRhythmTimeline(exercises[1], [0]);
    player.start({
      timeline,
      bpm,
      beatsPerMeasure: 2,
      countIn: false,
      loop: false,
      metronome: false,
      onPosition() {},
      onFinish() {},
    });
    const voices = fake.context().voices;
    assert.equal(voices.length, timeline.attacks.length);
    voices.forEach((voice, index) => {
      const attack = timeline.attacks[index];
      const duration = (attack.beats * 60) / bpm;
      assert.ok(
        Math.abs(voice.startTime - (0.1 + (attack.startBeat * 60) / bpm)) <
          1e-9,
      );
      assert.equal(voice.loop, false);
      assert.equal(voice.playbackRate.value, 1);
      assert.ok(Math.abs(voice.stopTime - voice.startTime - duration) < 1e-9);
      assert.ok(
        Math.abs(voice.buffer.duration - duration) <
          1 / voice.buffer.sampleRate,
      );
      if (voices[index + 1])
        assert.ok(voice.stopTime <= voices[index + 1].startTime + 1e-9);
    });
    // The opening half note tied to an eighth lasts 2.5 beats both visually
    // and audibly, with one consonant attack for the whole tie.
    assert.equal(timeline.attacks[0].beats, 2.5);
    assert.ok(
      Math.abs(voices[0].stopTime - voices[0].startTime - (2.5 * 60) / bpm) <
        1e-9,
    );
    player.dispose();
  });
}

for (const syllable of ["ta", "ka"]) {
  test(`${syllable}: conserva la consonante y la vocal no tiene cortes al sostenerse`, () => {
    const sample = decodeWav(
      readFileSync(
        new URL(
          `../public/audio/lectura-ritmica/${syllable}.wav`,
          import.meta.url,
        ),
      ),
    );
    const input = sample.getChannelData(0);
    for (const duration of [0.1875, 0.5, 1.25, 3.75]) {
      const output = stretchRhythmSyllable(input, sample.sampleRate, duration);
      assert.equal(output.length, Math.round(duration * sample.sampleRate));
      assert.ok(output.every(Number.isFinite));
      assert.ok(output.every((value) => Math.abs(value) <= 1));
      const attack = Math.round(sample.sampleRate * 0.04);
      for (let i = 0; i < attack; i++)
        assert.ok(Math.abs(output[i] - input[i]) < 1e-7);
      // No artificial silence or repeated amplitude envelope during the vowel.
      const window = Math.round(sample.sampleRate * 0.02);
      for (
        let start = attack;
        start + window < output.length - window;
        start += window
      ) {
        let energy = 0;
        for (let i = start; i < start + window; i++) energy += output[i] ** 2;
        assert.ok(Math.sqrt(energy / window) > 0.012);
      }
    }
  });
}

test("Entrada de un compás, posición sincronizada y final automático", async (t) => {
  const fake = fakeAudio(t);
  const player = new RhythmVoicePlayer();
  await player.prepare();
  const timeline = buildRhythmTimeline(exercises[1], [0]);
  let lastPosition,
    entry,
    finished = 0;
  player.start({
    timeline,
    bpm: 60,
    beatsPerMeasure: 2,
    countIn: true,
    loop: false,
    metronome: false,
    onPosition: (position, beat) => {
      lastPosition = position;
      entry = beat;
    },
    onFinish: () => {
      finished += 1;
    },
  });
  const context = fake.context();
  assert.deepEqual(
    context.clicks.map((click) => click.startTime),
    [0.1, 1.1],
  );
  assert.equal(context.voices[0].startTime, 2.1);
  context.currentTime = 0.7;
  fake.frame();
  assert.equal(entry, 0);
  context.currentTime = 4.3;
  fake.frame();
  assert.ok(lastPosition.continuation);
  context.currentTime = 14.2;
  fake.frame();
  assert.equal(finished, 1);
});

test("El loop conserva la duración y no añade otra entrada", async (t) => {
  const fake = fakeAudio(t);
  const player = new RhythmVoicePlayer();
  await player.prepare();
  const timeline = buildRhythmTimeline(exercises[0], [0]);
  player.start({
    timeline,
    bpm: 120,
    beatsPerMeasure: 3,
    countIn: true,
    loop: true,
    metronome: false,
    onPosition() {},
    onFinish() {},
  });
  const context = fake.context();
  const firstCount = context.voices.length;
  assert.equal(firstCount, timeline.attacks.length * 2);
  context.currentTime = 7.4;
  fake.interval();
  assert.equal(context.voices.length, timeline.attacks.length * 3);
  assert.equal(context.voices[firstCount].startTime, 13.6);
  assert.equal(context.clicks.length, 3);
  player.stop();
});
