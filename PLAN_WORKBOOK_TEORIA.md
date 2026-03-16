# Plan: Enriquecer contenido teórico del Workbook

## Contexto
El workbook tiene 41 capítulos organizados en 7 bloques, pero ~20 capítulos están **sparse/integrados** con contenido mínimo — solo tienen estructura (título, objective, studyFlow, etc.) pero las **sections** con la teoría real están vacías o muy escuetas. Para alguien que falta a clases y depende del workbook, estos capítulos vacíos son inútiles.

## Archivo a modificar
- `src/components/workbookTheoryContent.ts`

## Patrón a seguir
Cada capítulo enriquecido debe seguir el mismo formato que los capítulos ricos existentes (ej: `intervalos`, `triadas`):
- **sections**: Array con múltiples `WorkbookSection`, cada una con bloques variados (`paragraph`, `table`, `list`, `example`, `chips`)
- **microExercises**: Al menos 3-4 ejercicios por capítulo
- **glossary**: Términos clave del capítulo
- **commonMistakes**: Errores frecuentes específicos del tema
- Mantener el idioma en español, con terminología musical estándar

## Verificación (para cada fase)
1. `npm run build` — sin errores TS
2. Abrir app → navegar a cada capítulo enriquecido → verificar render
3. Confirmar que tablas, listas y ejemplos se ven bien
4. Progreso (checkmarks) sigue funcionando

---

## Diagnóstico: Capítulos bien desarrollados vs. pobres

### RICOS (no necesitan trabajo) — 17 capítulos
- lectura-musical, intervalos, escalas-mayores-menores, escalas-relativas-paralelas
- modos-eclesiasticos, notas-de-adorno, triadas, armonizacion-mayor, armonizacion-menor
- inversiones, secuencias-armonicas, acordes-de-septima, campo-armonico-septimas
- funciones-tonales, armonia-a-4-voces, dominantes-secundarias, acordes-aplicados

### MODERADOS (necesitan más contenido) — 5 capítulos
- cadencias-basicas
- introduccion-analisis-armonico
- conduccion-de-voces
- acorde-napolitano
- mezcla-modal

### SPARSE/VACÍOS (necesitan trabajo serio) — 19 capítulos

---

## Fase 1 — Fundamentos que faltan ✅ COMPLETADA

Estos son los que más duelen si faltas a clase porque son base para todo lo demás.

| Capítulo | Qué se agregó | Estado |
|---|---|---|
| **ritmo-y-metrica** | Tabla expandida (fusa, semifusa), figuras con punto, silencios, subdivisión binaria vs ternaria (tabla + ejemplo 3/4 vs 6/8), compases de amalgama (5/8, 7/8, 5/4, 11/8), anacrusa, +5 microExercises, +4 glossary, +3 commonMistakes, +2 checklistItems | ✅ |
| **circulo-de-quintas** | Tonalidades vecinas y lejanas (tabla + chips), uso práctico (progresiones por cuartas, modulación, improvisación, 2 ejemplos), +4 microExercises, +3 glossary, +2 commonMistakes, +2 checklistItems | ✅ |
| **campo-armonico-triadas** | Campo armónico menor armónica (tabla), campo armónico menor melódica (tabla), funciones armónicas agrupadas (tabla + ejemplo), comparación mayor vs menor vs armónica (tabla resumen), +4 microExercises, +2 glossary, +3 commonMistakes, +2 checklistItems | ✅ |
| **arpegios-y-extensiones** | Patrones de arpegio para bajo eléctrico (tabla 7 patrones + ejemplo walking bass), tensiones disponibles por tipo de acorde (tabla), voicings básicos y su relación con arpegios (lista), +5 microExercises, +4 glossary, +3 commonMistakes, +2 checklistItems | ✅ |

> **Pendiente**: correr `npm run build` para verificar que compila sin errores.

---

## Fase 2 — Armonía funcional intermedia ✅ COMPLETADA

Capítulos que conectan fundamentos con análisis real.

| Capítulo | Qué agregar | Estado |
|---|---|---|
| **cadencias-basicas** | Auténtica perfecta/imperfecta, semicadencia, plagal, rota/engañosa, frigia; ejemplos con progresiones, efecto expresivo de cada una | ✅ |
| **conduccion-de-voces** | Movimiento paralelo/contrario/oblicuo, quintas y octavas paralelas prohibidas, resolución de sensible y séptima, reglas de duplicación | ✅ |
| **introduccion-analisis-armonico** | Cómo cifrar con números romanos, análisis funcional paso a paso, ejemplo completo de una pieza corta | ✅ |
| **modulacion** | Modulación diatónica (acorde pivote), directa, cromática; cómo detectarla al oído y en partitura | ✅ |

---

## Fase 3 — Armonía cromática ✅ COMPLETADA

| Capítulo | Qué agregar | Estado |
|---|---|---|
| **mezcla-modal** | Expandir: tabla completa de acordes prestados, contextos de uso, diferencia con dominantes secundarias | ✅ |
| **acorde-napolitano** | Expandir: construcción, resolución típica bII6→V→i, ejemplos en mayor y menor | ✅ |
| **sextas-aumentadas** | It6, Fr6, Ger6: construcción, resolución, contexto histórico, tabla comparativa | ✅ |
| **dominantes-alteradas** | V7#5, V7b5, V7#9, V7b9: construcción, color, resolución, uso en jazz vs clásico | ✅ |
| **modulacion-avanzada** | Mediantes cromáticas, enarmonía, modulación por acorde napolitano o sexta aumentada | ✅ |

---

## Fase 4 — Contrapunto ✅ COMPLETADA

| Capítulo | Qué agregar | Estado |
|---|---|---|
| **contrapunto-de-especies** | 5 especies de Fux explicadas, reglas de cada una, ejemplos nota contra nota hasta florecido | ✅ |
| **contrapunto-invertible** | Inversión a la octava/décima/duodécima, reglas de intervalos válidos, ejemplos | ✅ |
| **introduccion-a-la-fuga** | Sujeto, respuesta (real vs tonal), contraexposición, episodios, stretto, ejemplo analizado | ✅ |

---

## Fase 5 — Forma y análisis ✅ COMPLETADA

| Capítulo | Qué agregar | Estado |
|---|---|---|
| **forma-musical** | Panorama general: motivo, frase, periodo, formas binarias/ternarias | ✅ |
| **forma-sonata** | Exposición (1er/2do tema, puente, codetta), desarrollo, recapitulación, coda, plan tonal | ✅ |
| **rondo** | ABACA, ABACABA, rondo-sonata, contraste temático | ✅ |
| **tema-y-variaciones** | Técnicas de variación (melódica, rítmica, armónica, de carácter), ejemplos clásicos | ✅ |
| **analisis-de-obras** | Metodología: forma + armonía + textura + estilo, ejemplo integrado | ✅ |

---

## Fase 6 — Teoría post-tonal ✅ COMPLETADA

| Capítulo | Qué agregar | Estado |
|---|---|---|
| **armonia-extendida** | Acordes por cuartas, clusters, poliacordes, dominantes extendidas | ✅ |
| **cromatismo-avanzado** | Saturación cromática, planing, enarmonía funcional | ✅ |
| **introduccion-post-tonal** | Pitch class sets, intervalos como clases, conjuntos, forma normal/prima | ✅ |
| **serialismo-basico** | Serie de 12 tonos, operaciones P/R/I/RI, matriz, técnica dodecafónica | ✅ |
