// Clave de Fa en cuarta línea. Cada grupo contiene una negra: un pulso.
// Las octavas conservan la altura escrita, incluidas las líneas adicionales.
const quarterNotes = (systems) =>
  systems.map((system) => system.split(" ").map((key) => [key]));

export const DANDELOT_BASS_EXERCISE_4 = quarterNotes([
  // Primer sistema corregido según la captura del ejercicio 4.
  "f/3 e/3 c/3 f/3 c/3 b/2 c/3 f/2 g/2 e/2 f/2 c/4 b/3 d/4 c/4 f/3 e/3 f/2 g/2 d/3 c/3",
  "e/3 f/3 b/3 c/4 c/3 d/3 g/3 f/3 b/2 c/3 e/2 f/2 g/2 f/2 b/2 d/3 c/3 c/4 b/3 g/3 f/3",
  "b/2 c/3 g/2 f/2 d/4 c/4 c/3 f/3 g/3 f/3 f/2 c/3 b/2 g/2 f/2 e/2 g/2 f/2 c/3 f/3 c/4 f/3",
]);

export const DANDELOT_BASS_EXERCISE_5 = quarterNotes([
  "f/3 c/3 d/3 f/2 g/2 f/2 c/4 g/3 f/3 d/3 c/3 e/3 f/3 g/2 f/2 e/2 f/2 f/3 d/3 c/3 g/3 f/3",
  "d/4 c/4 b/3 d/4 c/4 g/3 e/3 f/3 g/3 f/3 g/2 f/2 e/2 g/2 f/2 c/3 d/3 b/2 c/3 g/3 e/3 f/3",
]);

export const DANDELOT_BASS_EXERCISE_6 = quarterNotes([
  "c/4 g/3 d/3 c/3 f/3 b/2 c/3 g/2 d/3 g/3 c/3 f/3 b/3 c/4 d/4 g/3 e/3 f/3 g/2 c/3",
  "f/2 b/2 e/3 f/3 d/3 c/3 d/4 b/3 c/4 e/3 f/3 b/2 c/3 g/3 f/3 g/2 e/2 f/2 f/3 f/2",
]);
