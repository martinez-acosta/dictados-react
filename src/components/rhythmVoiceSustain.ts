// Speech time scaling using waveform-similarity overlap-add (WSOLA).
// Preserve the consonant; extend the vowel with phase-aligned crossfades,
// not a hard loop boundary. Source: Verhelst & Roelands, ICASSP 1993.
export function stretchRhythmSyllable(
  input: Float32Array,
  sampleRate: number,
  duration: number,
): Float32Array {
  if (!Number.isFinite(duration) || duration <= 0 || sampleRate <= 0)
    throw new Error("Duración de voz inválida.");

  const length = Math.max(1, Math.round(duration * sampleRate));
  const output = new Float32Array(length);
  if (!input.length) return output;

  // Exclude the recorded silence at the end; release is applied at the actual
  // figure end. Keep all leading samples so /t/ and /k/ remain intact.
  let peak = 0;
  for (const value of input) peak = Math.max(peak, Math.abs(value));
  let lastVoiced = input.length - 1;
  while (lastVoiced > 0 && Math.abs(input[lastVoiced]) < peak * 0.06)
    lastVoiced -= 1;
  const samples = input.subarray(
    0,
    Math.min(input.length, lastVoiced + Math.round(sampleRate * 0.002) + 1),
  );

  const frame = Math.min(samples.length, Math.round(sampleRate * 0.04));
  const hop = Math.max(1, Math.floor(frame / 2));
  const overlap = frame - hop;
  const search = Math.round(sampleRate * 0.009);
  const attack = Math.min(Math.round(sampleRate * 0.04), samples.length / 3);
  const release = Math.min(Math.round(sampleRate * 0.02), samples.length / 4);
  const sourceVowel = Math.max(1, samples.length - attack - release);
  const targetVowel = Math.max(1, length - attack - release);
  const maxSource = samples.length - frame;
  output.set(samples.subarray(0, Math.min(frame, length)));

  for (let destination = hop; destination < length; destination += hop) {
    const remaining = length - destination;
    const matchLength = Math.min(overlap, remaining);
    const expected = Math.round(
      destination < attack
        ? destination
        : destination > length - release
          ? samples.length - remaining
          : attack + ((destination - attack) / targetVowel) * sourceVowel,
    );
    const anchor = Math.max(0, Math.min(maxSource, expected));
    let source = anchor;

    if (destination >= attack && maxSource > 0) {
      const first = Math.max(0, anchor - search);
      const last = Math.min(maxSource, anchor + search);
      let energy = 0;
      for (let i = 0; i < matchLength; i += 3)
        energy += output[destination + i] ** 2;
      const similarity = (candidate: number) => {
        let product = 0;
        let candidateEnergy = 0;
        for (let i = 0; i < matchLength; i += 3) {
          product += output[destination + i] * samples[candidate + i];
          candidateEnergy += samples[candidate + i] ** 2;
        }
        return (
          product / Math.sqrt(energy * candidateEnergy + 1e-12) -
          0.01 * ((candidate - anchor) / Math.max(1, search)) ** 2
        );
      };
      let best = -Infinity;
      for (let candidate = first; candidate <= last; candidate += 4) {
        const score = similarity(candidate);
        if (score > best) {
          best = score;
          source = candidate;
        }
      }
      const coarse = source;
      for (
        let candidate = Math.max(first, coarse - 3);
        candidate <= Math.min(last, coarse + 3);
        candidate += 1
      ) {
        const score = similarity(candidate);
        if (score > best) {
          best = score;
          source = candidate;
        }
      }
    }

    for (let i = 0; i < Math.min(frame, remaining); i += 1) {
      const blend =
        i < overlap ? 0.5 - 0.5 * Math.cos((Math.PI * i) / overlap) : 1;
      output[destination + i] =
        output[destination + i] * (1 - blend) + samples[source + i] * blend;
    }
  }
  return output;
}
