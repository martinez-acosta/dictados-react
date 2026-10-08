// Cada pareja de corcheas ocupa un pulso. La nota final suelta es una negra.
// Se conserva la octava escrita, incluidas las líneas adicionales.
const eighthNotePairs = (systems) =>
  systems.map((system) => {
    const notes = system.split(" ");
    const groups = [];
    for (let index = 0; index < notes.length; index += 2) {
      groups.push(notes.slice(index, index + 2));
    }
    return groups;
  });

export const DANDELOT_SERIES_EXERCISE_18 = eighthNotePairs([
  "c/5 e/5 f/5 a/5 g/5 e/5 c/5 a/4 g/4 b/4 d/5 f/5 e/5 c/5 a/4 f/4 d/4 b/3 g/4 e/4 d/4 f/4",
  "c/4 e/4 g/4 c/5 f/5 d/5 g/5 e/5 c/6 b/5 d/5 b/4 f/5 d/5 g/4 e/4 d/4 f/4 b/3 d/4 c/4 e/4",
  "c/5 a/4 g/4 b/4 g/5 e/5 b/4 d/5 b/5 g/5 a/4 c/5 f/5 d/5 e/4 g/4 a/5 f/5 d/4 f/4 e/5 c/5 c/4",
]);

export const DANDELOT_SERIES_EXERCISE_19 = eighthNotePairs([
  "g/4 c/5 b/4 c/5 d/5 b/4 c/5 e/5 g/5 f/5 d/5 g/5 e/5 a/5 f/5 d/5 b/4 e/5 d/5 b/4 g/4 c/5 b/4 c/5",
  "d/5 g/5 e/5 c/5 c/6 b/5 d/6 a/5 g/5 e/5 a/5 f/5 d/5 e/5 f/5 d/5 b/4 g/4 c/5 g/4 d/4 a/3 b/3 e/4 a/4 d/5",
  "g/4 c/5 f/5 c/6 g/5 e/5 a/5 f/5 d/5 a/4 f/4 b/3 d/4 g/4 e/4 g/4 c/5 e/5 g/5 f/5 d/5 b/4 g/4 e/4 c/4",
]);
