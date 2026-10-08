import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const reading = source("src/components/LecturaMusical.tsx");

test("Dandelot y la práctica usan páginas independientes", () => {
  assert.match(
    reading,
    /export default function EjerciciosDandelot\(\)[\s\S]*?<MusicalReadingPage mode="dandelot"/,
  );
  assert.match(
    source("src/components/PracticaLecturaMusical.tsx"),
    /export default function PracticaLecturaMusical\(\)[\s\S]*?<MusicalReadingPage mode="practice"/,
  );
});

test("los controles generados no se apilan debajo de los ejercicios numerados", () => {
  const numberedStart = reading.indexOf('{mode === "dandelot" && (');
  const practiceStart = reading.indexOf('{mode === "practice" && (');
  assert.ok(numberedStart > 0 && practiceStart > numberedStart);
  const numbered = reading.slice(numberedStart, practiceStart);
  const practice = reading.slice(practiceStart);
  assert.match(numbered, /<DandelotExerciseSheet/);
  assert.doesNotMatch(numbered, /Figuras aleatorias|Secuencia actual/);
  assert.match(practice, /Figuras aleatorias/);
  assert.match(practice, /Secuencia actual/);
  assert.doesNotMatch(practice, /<DandelotExerciseSheet/);
});

test("ambas páginas tienen ruta propia y se conserva el enlace anterior", () => {
  const routes = source("src/main.jsx");
  assert.match(
    routes,
    /path="\/lectura-dandelot" element={<EjerciciosDandelot \/>}/,
  );
  assert.match(
    routes,
    /path="\/practica-lectura-musical"\s+element={<PracticaLecturaMusical \/>}/,
  );
  assert.match(
    routes,
    /path="\/lectura-musical"\s+element={<Navigate to="\/lectura-dandelot" replace \/>}/,
  );
});

test("el menú distingue los ejercicios Dandelot de la práctica generada", () => {
  const dashboard = source("src/components/Dashboard.jsx");
  assert.match(
    dashboard,
    /route: "\/lectura-dandelot",\s+title: "Ejercicios Dandelot"/,
  );
  assert.match(
    dashboard,
    /route: "\/practica-lectura-musical",\s+title: "Práctica de lectura musical"/,
  );
  assert.doesNotMatch(dashboard, /title: "Lectura Dandelot"/);
});
