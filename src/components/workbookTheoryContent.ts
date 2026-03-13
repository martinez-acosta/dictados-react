export type WorkbookChecklistItem = {
  id: string;
  text: string;
};

export type WorkbookMicroExercise = {
  prompt: string;
  answer: string;
};

export type WorkbookGlossaryItem = {
  term: string;
  definition: string;
};

type WorkbookParagraphBlock = {
  type: "paragraph";
  text: string;
};

type WorkbookListBlock = {
  type: "list";
  title?: string;
  items: string[];
};

type WorkbookExampleBlock = {
  type: "example";
  title: string;
  lines: string[];
};

type WorkbookTableBlock = {
  type: "table";
  title?: string;
  columns: string[];
  rows: string[][];
};

type WorkbookChipsBlock = {
  type: "chips";
  title?: string;
  items: string[];
};

export type WorkbookSectionBlock =
  | WorkbookParagraphBlock
  | WorkbookListBlock
  | WorkbookExampleBlock
  | WorkbookTableBlock
  | WorkbookChipsBlock;

export type WorkbookSection = {
  title: string;
  blocks: WorkbookSectionBlock[];
};

export type WorkbookChapter = {
  chapterId: string;
  unit: string;
  focusBadge: string;
  title: string;
  summary: string;
  objective: string;
  prerequisites?: string[];
  studyFlow: string[];
  memoryHooks: string[];
  examFocus?: string[];
  sections: WorkbookSection[];
  commonMistakes: string[];
  reviewSummary: string[];
  checklistItems: WorkbookChecklistItem[];
  microExercises?: WorkbookMicroExercise[];
  glossary?: WorkbookGlossaryItem[];
};

export const WORKBOOK_THEORY_CHAPTERS: WorkbookChapter[] = [
  {
    chapterId: "lectura-musical",
    unit: "Bloque 1. Fundamentos",
    focusBadge: "Base obligatoria",
    title: "Lectura musical",
    summary:
      "Base visual para entender pentagrama, claves, lineas adicionales, armaduras y alteraciones.",
    objective:
      "Leer notas con mas seguridad en clave de Sol y clave de Fa, sin adivinar posiciones.",
    prerequisites: [],
    studyFlow: [
      "Primero fija la clave y una nota de referencia segura.",
      "Despues cuenta lineas y espacios desde esa referencia.",
      "Por ultimo revisa armadura y alteraciones accidentales.",
    ],
    memoryHooks: [
      "La clave cambia el mapa, no la musica.",
      "Primero clave, luego posicion, luego alteraciones.",
      "Leer rapido no es adivinar: es reconocer referencias.",
    ],
    examFocus: [
      "Identificar notas en clave de Sol y Fa.",
      "Distinguir armadura de alteraciones accidentales.",
      "Leer lineas adicionales sin perder la referencia.",
    ],
    sections: [
      {
        title: "El pentagrama y las claves",
        blocks: [
          {
            type: "paragraph",
            text:
              "El pentagrama tiene cinco lineas y cuatro espacios. Las notas se escriben en esas posiciones. La clave establece desde donde empiezas a leer y que nombre real recibe cada linea o espacio.",
          },
          {
            type: "table",
            columns: ["Clave", "Referencia", "Uso comun"],
            rows: [
              ["Sol", "G", "Melodias, voces, registros medios y agudos"],
              ["Fa", "F", "Bajo, mano izquierda, registros graves"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Por eso no puedes leer una nota solo por su altura visual. La misma posicion en el pentagrama cambia de nombre si cambias de clave.",
          },
        ],
      },
      {
        title: "Notas de referencia rapida",
        blocks: [
          {
            type: "table",
            title: "Clave de Sol",
            columns: ["Posicion", "Nota"],
            rows: [
              ["2a linea", "G"],
              ["1er espacio", "F"],
              ["2o espacio", "A"],
              ["3a linea", "B"],
            ],
          },
          {
            type: "table",
            title: "Clave de Fa",
            columns: ["Posicion", "Nota"],
            rows: [
              ["4a linea", "F"],
              ["2o espacio", "B"],
              ["3a linea", "D"],
              ["1er espacio", "A"],
            ],
          },
          {
            type: "paragraph",
            text:
              "No necesitas memorizar todo de una sola vez. Lo eficaz es memorizar unas pocas referencias y moverte desde ellas por pasos conjuntos.",
          },
        ],
      },
      {
        title: "Armadura y alteraciones accidentales",
        blocks: [
          {
            type: "paragraph",
            text:
              "La armadura afecta todas las notas de ese nombre en la obra o seccion, mientras no cambie la armadura. Las alteraciones accidentales afectan a partir del punto donde aparecen y duran solo dentro del compas, salvo repeticion de la misma nota.",
          },
          {
            type: "example",
            title: "Ejemplos",
            lines: [
              "Si la armadura tiene F#, todo F del pentagrama vale F#.",
              "Si aparece un becuadro sobre F en un compas, ese F vuelve a ser natural solo en ese compas.",
              "En el compas siguiente, si no hay becuadro, vuelve a mandar la armadura.",
            ],
          },
        ],
      },
      {
        title: "Lineas adicionales y lectura por referencia",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las lineas adicionales extienden el pentagrama hacia el registro agudo o grave. No deben leerse como casos aislados ni como dibujos sueltos: se leen usando una nota de referencia y avanzando por grados conjuntos. Esa es la forma mas segura de leer fuera del pentagrama sin perder la orientacion.",
          },
          {
            type: "paragraph",
            text:
              "En lectura real, casi nadie memoriza cada posicion extrema por separado. Lo normal es fijar una o dos notas de apoyo seguras y desplazarse desde ellas por lineas y espacios consecutivos. Por eso leer bien no significa adivinar rapido, sino moverse con seguridad desde referencias claras.",
          },
          {
            type: "list",
            title: "Como leer una nota fuera del pentagrama",
            items: [
              "Ubica primero la clave.",
              "Encuentra una nota de referencia segura dentro del pentagrama.",
              "Desplazate por lineas y espacios en orden, sin saltarte nombres.",
              "Revisa armadura y alteraciones antes de nombrar la nota final.",
            ],
          },
          {
            type: "example",
            title: "Idea practica",
            lines: [
              "Si en clave de Sol reconoces la 2a linea como G, puedes subir o bajar contando lineas y espacios consecutivos.",
              "Lo mismo pasa en clave de Fa si usas la 4a linea como F.",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Leer por forma visual sin tomar en cuenta la clave.",
      "Olvidar la armadura al nombrar notas.",
      "Confundir alteracion accidental con cambio permanente de tonalidad.",
    ],
    reviewSummary: [
      "La clave te dice como se llama cada posicion del pentagrama.",
      "Las referencias seguras aceleran la lectura.",
      "La armadura y las alteraciones cambian el nombre real de la nota.",
    ],
    checklistItems: [
      { id: "lec-1", text: "Puedo explicar para que sirve la clave de Sol y la de Fa." },
      { id: "lec-2", text: "No ignoro armaduras ni alteraciones accidentales." },
      { id: "lec-3", text: "Tengo notas de referencia claras para leer mas rapido." },
    ],
    microExercises: [
      { prompt: "En clave de Sol, que nota esta en la segunda linea?", answer: "G." },
      { prompt: "Si la armadura tiene Bb, como lees la nota B dentro del compas?", answer: "Como Bb, salvo cancelacion." },
      { prompt: "Que cambia si una misma nota escrita pasa de clave de Sol a clave de Fa?", answer: "Cambia el nombre real de la nota porque cambia la referencia de lectura." },
      { prompt: "Para que sirven las lineas adicionales?", answer: "Para extender el pentagrama y escribir notas mas agudas o mas graves sin cambiar de clave." },
      { prompt: "Como conviene leer una nota fuera del pentagrama?", answer: "Tomando una referencia segura y avanzando por grados conjuntos." },
    ],
    glossary: [
      { term: "Pentagrama", definition: "Conjunto de cinco lineas donde se escriben las notas." },
      { term: "Armadura", definition: "Alteraciones fijas colocadas al inicio que afectan a toda la seccion." },
      { term: "Alteracion accidental", definition: "Signo que cambia una nota dentro del compas actual." },
      { term: "Linea adicional", definition: "Linea corta que extiende el pentagrama para escribir notas fuera de sus cinco lineas." },
      { term: "Nota de referencia", definition: "Nota que el lector reconoce con seguridad y usa como punto de apoyo para leer otras." },
    ],
  },
  {
    chapterId: "intervalos",
    unit: "Bloque 1. Fundamentos",
    focusBadge: "Base obligatoria",
    title: "Intervalos",
    summary:
      "Fundamento para nombrar distancias entre notas y entender formulas de escalas, triadas y acordes de septima.",
    objective:
      "Distinguir numero y calidad de un intervalo, y evitar confundir conteo de letras con conteo de semitonos.",
    prerequisites: ["lectura-musical"],
    studyFlow: [
      "Saca primero el numero contando letras, no semitonos.",
      "Despues compara la distancia real contra el patron mayor o justo.",
      "Solo al final decides si es menor, aumentada o disminuida.",
    ],
    memoryHooks: [
      "2a, 3a, 6a y 7a se comparan contra mayor o menor.",
      "4a, 5a y 8a se comparan contra justo, aumentado o disminuido.",
      "Si no sacaste bien el numero, la calidad tambien se te va a ir mal.",
    ],
    examFocus: [
      "Nombrar intervalos con numero y calidad correctos.",
      "Distinguir intervalo armonico y melodico.",
      "Aplicar intervalos al leer formulas de acordes.",
    ],
    sections: [
      {
        title: "Numero y calidad",
        blocks: [
          {
            type: "paragraph",
            text:
              "Todo intervalo tiene dos partes. El numero dice cuantas letras abarca. La calidad dice como es esa distancia en comparacion con el modelo base. Por eso C a E puede ser una tercera; despues decides si es mayor o menor.",
          },
          {
            type: "example",
            title: "Ejemplo",
            lines: [
              "C a G = quinta porque cuentas C-D-E-F-G.",
              "Despues comparas la distancia real y confirmas que es quinta justa.",
            ],
          },
        ],
      },
      {
        title: "Melodicos, armonicos y conteo correcto",
        blocks: [
          {
            type: "paragraph",
            text:
              "Un intervalo melodico se escucha una nota despues de otra. Un intervalo armonico se escucha al mismo tiempo. El nombre del intervalo puede ser el mismo, aunque la presentacion auditiva cambie.",
          },
          {
            type: "list",
            title: "Proceso practico",
            items: [
              "Escribe la nota de salida y la de llegada.",
              "Cuenta letras incluyendo ambas notas.",
              "Revisa la distancia real en semitonos.",
              "Asigna la calidad correcta.",
            ],
          },
        ],
      },
      {
        title: "Patron de referencia e inversion",
        blocks: [
          {
            type: "table",
            columns: ["Intervalo base", "Desde C", "Tipo base"],
            rows: [
              ["2a", "C-D", "Mayor"],
              ["3a", "C-E", "Mayor"],
              ["4a", "C-F", "Justa"],
              ["5a", "C-G", "Justa"],
              ["6a", "C-A", "Mayor"],
              ["7a", "C-B", "Mayor"],
              ["8a", "C-C", "Justa"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Las inversiones tambien importan: una 3a suele invertir a 6a, una 2a a 7a y una 4a a 5a. Esta idea sirve mucho mas adelante en armonia y contrapunto.",
          },
        ],
      },
      {
        title: "Consonancia, disonancia e inversion",
        blocks: [
          {
            type: "paragraph",
            text:
              "En teoria tonal no todos los intervalos generan la misma estabilidad. Las consonancias perfectas, como la 5a justa y la 8a, producen reposo fuerte. Las consonancias imperfectas, como 3as y 6as mayores o menores, tambien son estables, pero con menor rigidez. Las 2as, 7as y muchas 4as en ciertos contextos funcionan como disonancias y suelen pedir resolucion.",
          },
          {
            type: "paragraph",
            text:
              "La inversion de intervalos consiste en cambiar una nota de lugar de modo que el intervalo pase a su complemento dentro de la octava. Una 3a invierte a 6a, una 2a a 7a y una 4a a 5a. En esa inversion, mayor pasa a menor, menor pasa a mayor, aumentado pasa a disminuido, disminuido pasa a aumentado y justo permanece justo.",
          },
          {
            type: "table",
            columns: ["Intervalo", "Invierte a"],
            rows: [
              ["2a", "7a"],
              ["3a", "6a"],
              ["4a", "5a"],
              ["5a", "4a"],
              ["6a", "3a"],
              ["7a", "2a"],
              ["8a", "1a u 8a segun contexto"],
            ],
          },
          {
            type: "chips",
            title: "Regla rapida de calidad al invertir",
            items: ["Mayor ↔ Menor", "Aumentado ↔ Disminuido", "Justo ↔ Justo"],
          },
        ],
      },
    ],
    commonMistakes: [
      "Contar solo teclas o semitonos y olvidar el nombre del intervalo.",
      "Decidir la calidad antes de haber sacado bien el numero.",
      "Olvidar que la nota inicial tambien se cuenta.",
    ],
    reviewSummary: [
      "Numero y calidad se calculan por separado.",
      "Mayor/menor no se aplica igual que justo/aumentado/disminuido.",
      "Los intervalos estan detras de todas las formulas armonicas.",
    ],
    checklistItems: [
      { id: "int-1", text: "Puedo sacar el numero de un intervalo sin usar piano." },
      { id: "int-2", text: "Puedo distinguir una 3a mayor de una 3a menor." },
      { id: "int-3", text: "Entiendo por que las formulas de acordes usan b3 y b7." },
    ],
    microExercises: [
      { prompt: "Nombra el intervalo entre C y A.", answer: "Sexta mayor." },
      { prompt: "Nombra el intervalo entre E y G.", answer: "Tercera menor." },
      { prompt: "Que se calcula primero: numero o calidad?", answer: "Primero el numero." },
      { prompt: "A que intervalo invierte una 3a mayor?", answer: "A una 6a menor." },
      { prompt: "Como cambia la calidad al invertir un intervalo aumentado?", answer: "Pasa a disminuido." },
      { prompt: "Que tipo de estabilidad suelen tener las 3as y 6as?", answer: "Consonancia imperfecta." },
    ],
    glossary: [
      { term: "Intervalo armonico", definition: "Dos notas que suenan al mismo tiempo." },
      { term: "Intervalo melodico", definition: "Dos notas que suenan una despues de otra." },
      { term: "Calidad", definition: "Caracter exacto del intervalo respecto al modelo base." },
      { term: "Consonancia", definition: "Intervalo de estabilidad relativa dentro del lenguaje tonal." },
      { term: "Disonancia", definition: "Intervalo de tension que suele pedir resolucion." },
      { term: "Inversion de intervalo", definition: "Transformacion por la cual un intervalo pasa a su complemento dentro de la octava." },
    ],
  },
  {
    chapterId: "escalas-mayores-menores",
    unit: "Bloque 1. Fundamentos",
    focusBadge: "Muy probable en examen",
    title: "Escalas mayores y menores",
    summary:
      "Construccion de escalas por patron de tonos y semitonos, y diferencias entre menor natural, armonica y melodica.",
    objective:
      "Entender como se construye una escala y distinguir escala de tonalidad.",
    prerequisites: ["lectura-musical", "intervalos"],
    studyFlow: [
      "Aprende primero el patron de la escala mayor.",
      "Despues compara las tres formas basicas de la menor.",
      "Por ultimo conecta la escala con la idea de centro tonal y armadura.",
    ],
    memoryHooks: [
      "Mayor = T T S T T T S",
      "Menor natural = T S T T S T T",
      "La menor armonica sube el 7o grado; la melodica sube 6o y 7o al ascender",
    ],
    examFocus: [
      "Construir escalas mayores desde cualquier nota.",
      "Diferenciar menor natural, armonica y melodica.",
      "Entender grados de la escala.",
    ],
    sections: [
      {
        title: "Escala y tonalidad",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una escala es una sucesion ordenada de notas. Una tonalidad es un sistema musical donde una nota funciona como centro y organiza las tensiones y resoluciones. Por eso una escala es material; una tonalidad es funcion.",
          },
          {
            type: "chips",
            items: ["Escala = notas ordenadas", "Tonalidad = centro tonal y funcion"],
          },
        ],
      },
      {
        title: "Patrones mayores y menores",
        blocks: [
          {
            type: "table",
            columns: ["Tipo", "Patron"],
            rows: [
              ["Mayor", "T T S T T T S"],
              ["Menor natural", "T S T T S T T"],
              ["Menor armonica", "T S T T S T+S S"],
              ["Menor melodica asc.", "T S T T T T S"],
            ],
          },
          {
            type: "example",
            title: "Ejemplos comparativos",
            lines: [
              "A natural minor = A B C D E F G",
              "A harmonic minor = A B C D E F G#",
              "A melodic minor asc. = A B C D E F# G#",
              "A melodic minor desc. en enfoque tradicional = A G F E D C B A",
            ],
          },
        ],
      },
      {
        title: "Grados de la escala",
        blocks: [
          {
            type: "paragraph",
            text:
              "Cada nota de la escala cumple una funcion por grado: tonica, supertonica, mediante, subdominante, dominante, superdominante y sensible o subtónica segun el contexto. Esas funciones preparan el terreno para armonizacion y analisis.",
          },
          {
            type: "table",
            columns: ["Numero", "Nombre funcional"],
            rows: [
              ["1", "Tonica"],
              ["2", "Supertonica"],
              ["3", "Mediante"],
              ["4", "Subdominante"],
              ["5", "Dominante"],
              ["6", "Superdominante"],
              ["7", "Sensible o subtónica"],
            ],
          },
        ],
      },
      {
        title: "Escalas, armaduras y centro tonal",
        blocks: [
          {
            type: "paragraph",
            text:
              "La armadura resume que alteraciones son habituales dentro de una tonalidad o pasaje. No equivale por si sola a toda la explicacion musical, pero orienta de inmediato sobre el material sonoro probable. Por ejemplo, una armadura con un sostenido suele apuntar hacia G mayor o E menor, aunque el centro tonal real se confirma por contexto, reposo y funcion.",
          },
          {
            type: "paragraph",
            text:
              "El centro tonal es la nota que funciona como punto principal de reposo. Por eso dos escalas pueden compartir notas y, aun asi, no sentirse iguales. La organizacion de tensiones, la sensible y la direccion melodica dependen de que nota actua como tonica.",
          },
          {
            type: "example",
            title: "Relacion entre armadura y centro tonal",
            lines: [
              "Un sostenido en armadura puede corresponder a G mayor o E menor.",
              "Las notas pueden coincidir, pero el centro tonal cambia la percepcion musical.",
              "Por eso la armadura orienta, pero no sustituye el analisis.",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir escala con tonalidad.",
      "Usar el patron mayor cuando se intenta construir una menor.",
      "No distinguir entre menor natural, armonica y melodica.",
    ],
    reviewSummary: [
      "La escala mayor y menor se construyen por patrones distintos.",
      "La menor no es una sola cosa; tiene variantes segun el contexto.",
      "Los grados luego se vuelven acordes y funciones.",
    ],
    checklistItems: [
      { id: "esc-1", text: "Puedo escribir una escala mayor desde cualquier nota." },
      { id: "esc-2", text: "Puedo comparar menor natural, armonica y melodica." },
      { id: "esc-3", text: "Entiendo la diferencia entre escala y tonalidad." },
    ],
    microExercises: [
      { prompt: "Escribe D major.", answer: "D E F# G A B C#." },
      { prompt: "Que cambia de A natural minor a A harmonic minor?", answer: "Se eleva el 7o grado: G pasa a G#." },
      { prompt: "Que es el 5o grado de una escala?", answer: "La dominante." },
      { prompt: "Que diferencia hay entre escala y tonalidad?", answer: "La escala es el material ordenado de notas; la tonalidad es el sistema funcional organizado alrededor de un centro tonal." },
      { prompt: "Que armadura comparten G mayor y E menor?", answer: "Una armadura con F#." },
      { prompt: "Que ocurre tradicionalmente al descender en la menor melodica?", answer: "Suele volver a la forma natural." },
    ],
    glossary: [
      { term: "Tonica", definition: "Centro principal de la escala o tonalidad." },
      { term: "Sensible", definition: "7o grado a semitono de la tonica." },
      { term: "Subtonica", definition: "7o grado cuando esta a tono de la tonica." },
      { term: "Centro tonal", definition: "Nota o acorde que funciona como punto principal de reposo." },
      { term: "Menor melodica", definition: "Forma de la escala menor que eleva 6o y 7o grado al ascender en el enfoque tradicional." },
    ],
  },
  {
    chapterId: "escalas-relativas-paralelas",
    unit: "Bloque 1. Fundamentos",
    focusBadge: "Muy probable en examen",
    title: "Escalas relativas y paralelas",
    summary:
      "Relaciones entre escalas mayores y menores: mismas notas o misma tonica, segun el caso.",
    objective:
      "Distinguir relativa y paralela, y no mezclar ambos conceptos en examenes o tareas.",
    prerequisites: ["escalas-mayores-menores"],
    studyFlow: [
      "Primero identifica las notas de la escala.",
      "Luego pregunta si se comparte armadura o se comparte tonica.",
      "Con eso decides si la relacion es relativa o paralela.",
    ],
    memoryHooks: [
      "Relativas comparten notas.",
      "Paralelas comparten tonica.",
      "Mayor -> menor relativa = 6o grado.",
    ],
    examFocus: [
      "Sacar menor relativa desde una escala mayor.",
      "Distinguir relativa y paralela en ejemplos escritos.",
      "Leer la armadura como pista para detectar relaciones.",
    ],
    sections: [
      {
        title: "Relativas",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una escala mayor y su menor relativa tienen las mismas notas y la misma armadura. Lo que cambia es la tonica. Por ejemplo, C major y A minor usan exactamente C D E F G A B.",
          },
          {
            type: "list",
            items: [
              "Mayor -> menor relativa = 6o grado.",
              "Menor -> mayor relativa = 3er grado.",
              "La armadura es la misma.",
            ],
          },
          {
            type: "paragraph",
            text:
              "Aunque dos escalas relativas comparten exactamente las mismas notas, no producen la misma sensacion tonal. La razon es que la tonica cambia. Eso modifica jerarquias, puntos de reposo, comportamiento de la sensible y direccion general de la frase. Compartir material no significa compartir funcion.",
          },
        ],
      },
      {
        title: "Paralelas",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las escalas paralelas comparten tonica, no notas. C major y C minor empiezan en C, pero no tienen la misma armadura ni el mismo material sonoro.",
          },
          {
            type: "table",
            columns: ["Relacion", "Comparte", "Ejemplo"],
            rows: [
              ["Relativas", "Notas y armadura", "C major / A minor"],
              ["Paralelas", "Tonica", "C major / C minor"],
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Buscar la relativa menor por semitonos en vez de por grados.",
      "Confundir relativa con paralela.",
      "Pensar que si la tonica es la misma, entonces tambien son relativas.",
    ],
    reviewSummary: [
      "Relativas = mismas notas, distinta tonica.",
      "Paralelas = misma tonica, distintas notas.",
      "La menor relativa sale del 6o grado de la mayor.",
    ],
    checklistItems: [
      { id: "rel-1", text: "Puedo sacar la menor relativa desde cualquier mayor." },
      { id: "rel-2", text: "Puedo distinguir relativa y paralela sin dudar." },
      { id: "rel-3", text: "Puedo explicar por que C major y A minor comparten notas." },
    ],
    microExercises: [
      { prompt: "Cual es la menor relativa de G major?", answer: "E minor." },
      { prompt: "C major y C minor son relativas o paralelas?", answer: "Paralelas." },
      { prompt: "Bb major y G minor son relativas?", answer: "Si." },
      { prompt: "Si dos escalas comparten armadura pero no tonica, como se relacionan?", answer: "Como relativas." },
      { prompt: "Por que C major y A minor no suenan iguales si usan las mismas notas?", answer: "Porque no tienen la misma tonica ni el mismo centro tonal." },
    ],
    glossary: [
      { term: "Relativa", definition: "Relacion entre dos escalas que comparten notas y armadura." },
      { term: "Paralela", definition: "Relacion entre dos escalas que comparten tonica." },
      { term: "Centro tonal", definition: "Nota que organiza la jerarquia y la sensacion de reposo de una escala o tonalidad." },
    ],
  },
  {
    chapterId: "triadas",
    unit: "Bloque 2. Armonia inicial",
    focusBadge: "Base obligatoria",
    title: "Triadas",
    summary:
      "Acordes de tres notas construidos por terceras: raiz, tercera y quinta.",
    objective:
      "Construir triadas a mano y reconocer sus calidades por formula, intervalo y spelling.",
    prerequisites: ["intervalos", "escalas-mayores-menores"],
    studyFlow: [
      "Escribe la raiz y apila 3a y 5a por nombre de nota.",
      "Revisa si la tercera es mayor o menor.",
      "Revisa si la quinta quedo justa, disminuida o aumentada.",
    ],
    memoryHooks: [
      "Mayor = 1-3-5",
      "Menor = 1-b3-5",
      "Disminuida y aumentada cambian la quinta",
    ],
    examFocus: [
      "Construir triadas desde cualquier raiz.",
      "Identificar calidad a partir de notas dadas.",
      "No cometer errores de spelling.",
    ],
    sections: [
      {
        title: "Construccion basica",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una triada se forma apilando dos terceras sobre una nota raiz. El resultado minimo es raiz, tercera y quinta. Lo primero es escribir esas letras correctas; despues revisas la calidad real.",
          },
          {
            type: "example",
            title: "Esqueleto de C",
            lines: [
              "Raiz: C",
              "Tercera: E",
              "Quinta: G",
              "Resultado: C-E-G",
            ],
          },
        ],
      },
      {
        title: "Calidades y simbolos",
        blocks: [
          {
            type: "table",
            columns: ["Calidad", "Formula", "Ejemplo", "Simbolo habitual"],
            rows: [
              ["Mayor", "1 - 3 - 5", "C E G", "C"],
              ["Menor", "1 - b3 - 5", "C Eb G", "Cm"],
              ["Disminuida", "1 - b3 - b5", "C Eb Gb", "Cdim o C°"],
              ["Aumentada", "1 - 3 - #5", "C E G#", "C+ o Caug"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Si la tercera es mayor y la quinta justa, la triada es mayor. Si la tercera baja, se vuelve menor. Si ademas la quinta se encoge, se vuelve disminuida. Si la quinta sube, se vuelve aumentada.",
          },
        ],
      },
      {
        title: "Estado fundamental y disposicion",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una triada en estado fundamental tiene la raiz abajo. Eso no es lo mismo que hablar de disposicion abierta o cerrada. Disposicion describe separacion entre voces; inversion describe que nota esta en el bajo.",
          },
          {
            type: "example",
            title: "Comparacion",
            lines: [
              "C-E-G = fundamental, disposicion cerrada",
              "C-G-E = fundamental, disposicion abierta",
              "E-G-C = 1a inversion",
            ],
          },
        ],
      },
      {
        title: "Spelling correcto",
        blocks: [
          {
            type: "paragraph",
            text:
              "En teoria no basta con aproximarse al sonido en un teclado. Tambien importa la escritura correcta de las notas. Una triada debe conservar la logica de raiz, tercera y quinta por nombre de letra. Si se rompe esa logica, la escritura deja de reflejar la estructura real del acorde.",
          },
          {
            type: "table",
            columns: ["Caso", "Escritura", "Comentario"],
            rows: [
              ["Triada aumentada correcta", "C E G#", "Mantiene raiz, 3a y 5a alterada"],
              ["Error de spelling", "C Fb G", "No esta escrita por terceras apiladas"],
              ["Triada disminuida correcta", "B D F", "Raiz, 3a menor y 5a disminuida"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Por eso, al construir una triada, primero se fijan las letras correctas y despues se corrigen con alteraciones. Esa disciplina es muy importante en armonia, analisis y examenes de ingreso.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Escribir notas correctas en altura pero mal deletreadas.",
      "Confundir triada menor con acorde menor septima.",
      "Creer que simbolo y estructura siempre se adivinan sin revisar formula.",
    ],
    reviewSummary: [
      "Las triadas se construyen con 1-3-5.",
      "La tercera define mayor o menor.",
      "La quinta alterada cambia a disminuida o aumentada.",
    ],
    checklistItems: [
      { id: "tri-1", text: "Puedo escribir las cuatro calidades de triada desde cualquier raiz." },
      { id: "tri-2", text: "Puedo traducir C, Cm, Cdim y C+ a notas." },
      { id: "tri-3", text: "No confundo inversion con disposicion." },
    ],
    microExercises: [
      { prompt: "Construye la triada de Eb mayor.", answer: "Eb G Bb." },
      { prompt: "Que calidad tiene B-D-F?", answer: "Disminuida." },
      { prompt: "Convierte A-C-E en simbolo.", answer: "Am." },
      { prompt: "Por que C-Fb-G no es una triada bien escrita?", answer: "Porque no respeta la estructura de raiz, tercera y quinta por nombre de letra." },
      { prompt: "Que debes fijar primero al construir una triada?", answer: "Las letras correctas de raiz, tercera y quinta." },
    ],
    glossary: [
      { term: "Triada", definition: "Acorde de tres notas construido por terceras." },
      { term: "Estado fundamental", definition: "Acorde con la raiz en el bajo." },
      { term: "Disposicion", definition: "Separacion entre las voces del acorde." },
      { term: "Spelling", definition: "Escritura correcta de las notas de un acorde segun su estructura teorica." },
    ],
  },
  {
    chapterId: "armonizacion-mayor",
    unit: "Bloque 2. Armonia inicial",
    focusBadge: "Muy probable en examen",
    title: "Armonizacion de la escala mayor",
    summary:
      "Construccion de los 7 acordes diatonicos de una escala mayor apilando terceras.",
    objective:
      "Resolver a mano el patron de triadas del modo mayor y explicar por que sale cada calidad.",
    prerequisites: ["escalas-mayores-menores", "triadas", "intervalos"],
    studyFlow: [
      "Escribe las 7 notas de la tonalidad.",
      "Construye cada acorde con 1-3-5 sin salirte de la escala.",
      "Revisa la tercera y la quinta para sacar la calidad.",
    ],
    memoryHooks: [
      "Mayor, menor, menor, Mayor, Mayor, menor, disminuido",
      "I ii iii IV V vi vii°",
      "El patron es fijo; lo que cambia es el spelling",
    ],
    examFocus: [
      "Armonizar una escala mayor completa por triadas.",
      "Explicar por que un grado sale mayor, menor o disminuido.",
      "Escribir simbolos y notas correctos en varias tonalidades.",
    ],
    sections: [
      {
        title: "El procedimiento",
        blocks: [
          {
            type: "list",
            items: [
              "Escribe las 7 notas de la escala mayor.",
              "Desde cada grado, apila 1-3-5 dentro de esa misma escala.",
              "No salgas de la tonalidad mientras construyes.",
              "Despues clasifica la calidad y escribe el simbolo.",
            ],
          },
          {
            type: "paragraph",
            text:
              "Si haces esto en C major, obtienes C, Dm, Em, F, G, Am y Bdim. Ese patron no es casual: sale de la forma interna de la escala mayor.",
          },
        ],
      },
      {
        title: "Como sabes si es mayor, menor o disminuida",
        blocks: [
          {
            type: "paragraph",
            text:
              "Despues de construir 1-3-5, revisas la distancia entre la raiz y la tercera, y luego entre la raiz y la quinta. Esa combinacion define la calidad del acorde.",
          },
          {
            type: "table",
            columns: ["Acorde", "Notas", "3ra desde la raiz", "5ta desde la raiz", "Calidad"],
            rows: [
              ["C", "C E G", "Mayor", "Justa", "Mayor"],
              ["Dm", "D F A", "Menor", "Justa", "Menor"],
              ["Em", "E G B", "Menor", "Justa", "Menor"],
              ["F", "F A C", "Mayor", "Justa", "Mayor"],
              ["G", "G B D", "Mayor", "Justa", "Mayor"],
              ["Am", "A C E", "Menor", "Justa", "Menor"],
              ["Bdim", "B D F", "Menor", "Disminuida", "Disminuida"],
            ],
          },
          {
            type: "example",
            title: "Lectura paso a paso en C major",
            lines: [
              "I: C-E-G -> 3ra mayor + 5ta justa -> C mayor",
              "ii: D-F-A -> 3ra menor + 5ta justa -> D menor",
              "vii°: B-D-F -> 3ra menor + 5ta disminuida -> B disminuido",
            ],
          },
        ],
      },
      {
        title: "Patron fijo y funcion",
        blocks: [
          {
            type: "table",
            columns: ["Grado", "Calidad", "Funcion general", "Ejemplo en C major"],
            rows: [
              ["I", "Mayor", "Tonica", "C"],
              ["ii", "Menor", "Predominante", "Dm"],
              ["iii", "Menor", "Zona tonica", "Em"],
              ["IV", "Mayor", "Predominante", "F"],
              ["V", "Mayor", "Dominante", "G"],
              ["vi", "Menor", "Zona tonica", "Am"],
              ["vii°", "Disminuida", "Dominante", "Bdim"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Ese patron no se memoriza como una tabla muerta. Primero lo construyes por terceras y calidad; despues lo memorizas para poder resolver mas rapido otras tonalidades.",
          },
        ],
      },
      {
        title: "Calidad y funcion no son lo mismo",
        blocks: [
          {
            type: "paragraph",
            text:
              "La calidad de un acorde describe su estructura interna: mayor, menor o disminuida. La funcion describe el papel que ese acorde cumple dentro de la tonalidad. Es importante no confundir ambos niveles. Dos acordes pueden tener la misma calidad y cumplir funciones distintas.",
          },
          {
            type: "example",
            title: "Ejemplo en C major",
            lines: [
              "F = acorde mayor, funcion predominante",
              "G = acorde mayor, funcion dominante",
              "Ambos son mayores, pero no actuan igual dentro de la tonalidad",
            ],
          },
          {
            type: "paragraph",
            text:
              "Por eso armonizar no consiste solo en nombrar acordes. Tambien implica entender que algunos preparan, otros tensan y otros resuelven.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Salir de la escala y meter alteraciones ajenas a la tonalidad.",
      "Confundir armonizar por triadas con construir 7 acordes de una misma familia.",
      "No revisar la quinta del vii y escribirlo como menor.",
    ],
    reviewSummary: [
      "Armonizar mayor es apilar 1-3-5 dentro de una sola escala.",
      "La calidad se saca revisando tercera y quinta.",
      "El patron fijo de calidades se repite en cualquier escala mayor.",
    ],
    checklistItems: [
      { id: "arm-1", text: "Puedo armonizar C, G y F major sin mirar ayuda." },
      { id: "arm-2", text: "Puedo explicar por que ii y iii son menores." },
      { id: "arm-3", text: "Entiendo que vii° es disminuido por la quinta." },
    ],
    microExercises: [
      { prompt: "Armoniza D major por triadas.", answer: "D, Em, F#m, G, A, Bm, C#dim." },
      { prompt: "Que calidad tiene el iii de Bb major?", answer: "Menor." },
      { prompt: "Por que el vii de C major es disminuido?", answer: "Porque B-D-F tiene 3ra menor y 5ta disminuida." },
      { prompt: "Pueden dos acordes mayores tener funciones distintas en una misma tonalidad?", answer: "Si. Por ejemplo, IV y V en modo mayor." },
      { prompt: "Que diferencia hay entre calidad y funcion?", answer: "La calidad describe la estructura del acorde; la funcion describe su papel dentro de la tonalidad." },
    ],
    glossary: [
      { term: "Armonizar", definition: "Construir acordes diatonicos a partir de una escala." },
      { term: "Predominante", definition: "Funcion que suele preparar la dominante." },
      { term: "Dominante", definition: "Funcion de tension y empuje hacia la tonica." },
    ],
  },
  {
    chapterId: "armonizacion-menor",
    unit: "Bloque 2. Armonia inicial",
    focusBadge: "Ampliacion util",
    title: "Armonizacion de la escala menor",
    summary:
      "Comparacion de armonizacion menor natural, armonica y melodica para no creer que existe un solo patron menor.",
    objective:
      "Entender que el modo menor cambia segun la forma de la escala usada.",
    prerequisites: ["escalas-mayores-menores", "triadas", "armonizacion-mayor"],
    studyFlow: [
      "Empieza por menor natural porque es la forma mas estable para arrancar.",
      "Luego compara que cambia al subir el 7o grado en menor armonica.",
      "Despues revisa la menor melodica como caso de ampliacion.",
    ],
    memoryHooks: [
      "Menor natural no produce dominante mayor.",
      "Menor armonica crea sensible y dominante fuerte.",
      "No hables de armonizacion menor sin decir que version de la escala usas.",
    ],
    examFocus: [
      "Comparar patrones entre menor natural y armonica.",
      "Explicar por que en menor armonica aparece dominante mayor.",
      "No confundir resultados segun la forma de la escala.",
    ],
    sections: [
      {
        title: "Menor natural",
        blocks: [
          {
            type: "paragraph",
            text:
              "Si armonizas la menor natural por triadas, mantienes el 7o grado sin elevar. Eso produce un quinto grado menor y una tension dominante mas debil que en el sistema tonal clasico.",
          },
          {
            type: "table",
            columns: ["Grado", "Calidad en A natural minor"],
            rows: [
              ["i", "Am"],
              ["ii°", "Bdim"],
              ["III", "C"],
              ["iv", "Dm"],
              ["v", "Em"],
              ["VI", "F"],
              ["VII", "G"],
            ],
          },
        ],
      },
      {
        title: "Menor armonica",
        blocks: [
          {
            type: "paragraph",
            text:
              "Cuando elevas el 7o grado aparece la sensible. Eso cambia sobre todo el V y el vii°. En A harmonic minor, G pasa a G#, y el V se vuelve E mayor o E7 en contextos mas avanzados.",
          },
          {
            type: "example",
            title: "Comparacion en A minor",
            lines: [
              "Natural: E-G-B = Em",
              "Armonica: E-G#-B = E",
              "Natural: G-B-D = G",
              "Armonica: G#-B-D = G#dim",
            ],
          },
        ],
      },
      {
        title: "Menor melodica como ampliacion",
        blocks: [
          {
            type: "paragraph",
            text:
              "La menor melodica tambien modifica el material armonico, aunque en cursos iniciales suele estudiarse despues de la menor natural y la armonica. En el enfoque tradicional, al ascender eleva 6o y 7o grado; al descender suele volver a la forma natural. Eso produce acordes distintos y amplia el lenguaje del modo menor.",
          },
          {
            type: "table",
            columns: ["Forma", "Cambios caracteristicos", "Resultado general"],
            rows: [
              ["Menor natural", "Sin elevar 6o ni 7o", "Dominante mas debil"],
              ["Menor armonica", "Eleva 7o", "Aparece sensible y dominante fuerte"],
              ["Menor melodica", "Eleva 6o y 7o al ascender", "Amplia el color melodico y armonico"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Para preparacion de ingreso conviene, al menos, reconocer que no existe una sola armonizacion menor universal. El resultado depende de la forma concreta de la escala que se use.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Hablar de escala menor como si siempre diera el mismo campo armonico.",
      "Olvidar que elevar el 7o grado cambia acordes clave.",
      "Usar patron mayor por costumbre.",
    ],
    reviewSummary: [
      "Menor natural y menor armonica no producen los mismos acordes.",
      "La armonica fortalece la dominante al crear sensible.",
      "Siempre debes decir que forma de la menor estas usando.",
    ],
    checklistItems: [
      { id: "armm-1", text: "Puedo comparar el v de menor natural con el V de menor armonica." },
      { id: "armm-2", text: "No doy por hecho un solo patron de armonizacion menor." },
      { id: "armm-3", text: "Entiendo por que la sensible cambia la funcion." },
    ],
    microExercises: [
      { prompt: "En A natural minor, que calidad tiene el v?", answer: "Menor: Em." },
      { prompt: "Que cambia en A harmonic minor respecto a A natural minor?", answer: "Se eleva G a G#." },
      { prompt: "Por que la menor armonica acerca mas a la tonalidad clasica?", answer: "Porque crea sensible y fortalece la dominante." },
      { prompt: "Existe un unico campo armonico menor fijo?", answer: "No. Cambia segun se use la menor natural, armonica o melodica." },
      { prompt: "Que eleva la menor melodica ascendente?", answer: "El 6o y el 7o grado." },
    ],
    glossary: [
      { term: "Menor armonica", definition: "Forma menor que eleva el 7o grado." },
      { term: "Sensible", definition: "Nota a semitono de la tonica que pide resolver." },
    ],
  },
  {
    chapterId: "inversiones",
    unit: "Bloque 2. Armonia inicial",
    focusBadge: "Muy probable en examen",
    title: "Inversiones",
    summary:
      "Reordenar un acorde sin cambiar su calidad, cambiando la nota que queda en el bajo.",
    objective:
      "Distinguir estado fundamental, inversiones y cifrados basicos.",
    prerequisites: ["triadas", "acordes-de-septima"],
    studyFlow: [
      "Primero identifica el acorde en estado fundamental.",
      "Despues mira que nota quedo en el bajo.",
      "Por ultimo traduce ese bajo a 1, 3, 5 o 7 y al cifrado correspondiente.",
    ],
    memoryHooks: [
      "Invertir no cambia la calidad.",
      "El bajo decide la inversion.",
      "Triadas: 5, 6, 6/4. Septimas: 7, 6/5, 4/3, 4/2.",
    ],
    examFocus: [
      "Identificar inversiones por el bajo.",
      "Relacionar inversiones con cifrado.",
      "No confundir inversion con disposicion.",
    ],
    sections: [
      {
        title: "Triadas e inversiones",
        blocks: [
          {
            type: "table",
            columns: ["Estado", "Ejemplo en C", "Bajo", "Cifrado"],
            rows: [
              ["Fundamental", "C E G", "1", "5 o sin cifra"],
              ["1a inversion", "E G C", "3", "6"],
              ["2a inversion", "G C E", "5", "6/4"],
            ],
          },
          {
            type: "paragraph",
            text:
              "El nombre de la triada no cambia. Sigues teniendo C mayor aunque el bajo sea E o G. Lo que cambia es la funcion del bajo y la sonoridad del acorde.",
          },
        ],
      },
      {
        title: "Acordes de septima e inversiones",
        blocks: [
          {
            type: "table",
            columns: ["Estado", "Bajo", "Cifrado"],
            rows: [
              ["Fundamental", "1", "7"],
              ["1a inversion", "3", "6/5"],
              ["2a inversion", "5", "4/3"],
              ["3a inversion", "7", "4/2"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Ese cifrado no es decorativo. Resume que intervalos aparecen por encima del bajo. Por eso es muy usado en analisis y armonia funcional.",
          },
        ],
      },
      {
        title: "Que resume el cifrado",
        blocks: [
          {
            type: "paragraph",
            text:
              "El cifrado de inversiones resume que intervalos aparecen por encima del bajo. No es una etiqueta arbitraria. Sirve para leer con rapidez la disposicion funcional del acorde respecto a la nota grave.",
          },
          {
            type: "table",
            columns: ["Cifrado", "Intervalos caracteristicos sobre el bajo", "Ejemplo"],
            rows: [
              ["6", "3a y 6a", "1a inversion de triada"],
              ["6/4", "4a y 6a", "2a inversion de triada"],
              ["6/5", "3a, 5a y 6a", "1a inversion de septima"],
              ["4/3", "3a, 4a y 6a", "2a inversion de septima"],
              ["4/2", "2a, 4a y 6a", "3a inversion de septima"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Entender esto ayuda mucho en analisis y armonia escrita, porque el bajo no solo sostiene el acorde: tambien organiza su comportamiento funcional.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Creer que invertir cambia la calidad del acorde.",
      "Leer la primera nota escrita y no el bajo real.",
      "Confundir cifrado de triadas con cifrado de acordes de septima.",
    ],
    reviewSummary: [
      "Inversion = misma estructura, distinto bajo.",
      "Triadas tienen dos inversiones; cuatriadas tienen tres.",
      "El cifrado te ayuda a leer la posicion funcional del acorde.",
    ],
    checklistItems: [
      { id: "inv-1", text: "Puedo distinguir fundamental, 1a y 2a inversion en triadas." },
      { id: "inv-2", text: "Puedo leer 6, 6/4, 6/5, 4/3 y 4/2." },
      { id: "inv-3", text: "No confundo inversion con disposicion." },
    ],
    microExercises: [
      { prompt: "Que inversion es E-G-C?", answer: "1a inversion de C mayor." },
      { prompt: "Que bajo tiene un acorde 4/2?", answer: "El 7o grado del acorde, tercera inversion de septima." },
      { prompt: "Que cifra corresponde a la 2a inversion de triada?", answer: "6/4." },
      { prompt: "Que resume el cifrado 6/4?", answer: "Que sobre el bajo se forman principalmente una 4a y una 6a." },
      { prompt: "Por que el cifrado no es arbitrario?", answer: "Porque describe los intervalos que aparecen sobre el bajo." },
    ],
    glossary: [
      { term: "Inversion", definition: "Cambio de la nota del bajo dentro del mismo acorde." },
      { term: "Cifrado", definition: "Forma breve de indicar la posicion interválica respecto al bajo." },
    ],
  },
  {
    chapterId: "acordes-de-septima",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Muy probable en examen",
    title: "Acordes de septima",
    summary:
      "Cuatriadas construidas al agregar una septima sobre una triada.",
    objective:
      "Reconocer las calidades principales de septima sin depender todavia del campo armonico.",
    prerequisites: ["triadas", "intervalos"],
    studyFlow: [
      "Parte de la triada y luego agrega la septima.",
      "Compara la tercera, quinta y septima contra la raiz.",
      "Traduce el resultado a simbolo.",
    ],
    memoryHooks: [
      "maj7 = 1-3-5-7",
      "m7 = 1-b3-5-b7",
      "7 = 1-3-5-b7",
      "m7b5 = 1-b3-b5-b7",
      "dim7 = 1-b3-b5-bb7",
    ],
    examFocus: [
      "Construir maj7, m7, 7, m7b5 y dim7.",
      "Distinguir dominante de maj7.",
      "Leer simbolos y formulas con seguridad.",
    ],
    sections: [
      {
        title: "De triada a cuatriada",
        blocks: [
          {
            type: "paragraph",
            text:
              "Un acorde de septima nace cuando a la triada le agregas la septima correspondiente. Por eso primero debes dominar la triada y luego revisar que tipo de septima aparece sobre la raiz.",
          },
          {
            type: "example",
            title: "Ejemplos",
            lines: [
              "Cmaj7 = C E G B",
              "Am7 = A C E G",
              "G7 = G B D F",
            ],
          },
        ],
      },
      {
        title: "Calidades principales",
        blocks: [
          {
            type: "table",
            columns: ["Simbolo", "Formula", "Lectura"],
            rows: [
              ["maj7", "1 - 3 - 5 - 7", "Triada mayor + septima mayor"],
              ["m7", "1 - b3 - 5 - b7", "Triada menor + septima menor"],
              ["7", "1 - 3 - 5 - b7", "Triada mayor + septima menor"],
              ["m7b5", "1 - b3 - b5 - b7", "Semidisminuido"],
              ["dim7", "1 - b3 - b5 - bb7", "Disminuido completo"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La gran confusion suele ser entre maj7 y 7. Ambos tienen tercera mayor, pero la septima cambia: maj7 lleva 7 natural; dominante 7 lleva b7.",
          },
        ],
      },
      {
        title: "Puente entre triada y septima",
        blocks: [
          {
            type: "paragraph",
            text:
              "Cada acorde de septima puede entenderse como una triada a la que se le añade una septima especifica. Pensarlo asi facilita mucho la construccion, porque primero reconoces la triada y despues determinas el tipo de septima.",
          },
          {
            type: "table",
            columns: ["Acorde", "Base triadica", "Septima añadida"],
            rows: [
              ["maj7", "Triada mayor", "7a mayor"],
              ["m7", "Triada menor", "7a menor"],
              ["7", "Triada mayor", "7a menor"],
              ["m7b5", "Triada disminuida", "7a menor"],
              ["dim7", "Triada disminuida", "7a disminuida"],
            ],
          },
          {
            type: "paragraph",
            text:
              "En lenguaje hablado, algunas personas dicen max7 al referirse a maj7, pero la escritura estandar en simbolos es maj7. Conviene acostumbrarse desde el principio a esa grafia.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Pensar que 7 significa septima mayor.",
      "Ver triada mayor y escribir maj7 automaticamente.",
      "No revisar si la quinta es justa o disminuida.",
    ],
    reviewSummary: [
      "La septima se suma a la triada, no la reemplaza.",
      "La diferencia entre maj7 y 7 esta en la septima.",
      "m7b5 y dim7 no son el mismo acorde.",
    ],
    checklistItems: [
      { id: "sept-1", text: "Puedo construir las cinco calidades principales de septima." },
      { id: "sept-2", text: "Puedo distinguir 7 de maj7." },
      { id: "sept-3", text: "No confundo m7b5 con dim7." },
    ],
    microExercises: [
      { prompt: "Escribe D7.", answer: "D F# A C." },
      { prompt: "Escribe Cmaj7.", answer: "C E G B." },
      { prompt: "Que calidad es B D F A?", answer: "Bm7b5 o semidisminuido." },
      { prompt: "Que diferencia estructural hay entre maj7 y 7?", answer: "Ambos tienen triada mayor, pero maj7 lleva 7a mayor y 7 lleva 7a menor." },
      { prompt: "De que triada parte un m7b5?", answer: "De una triada disminuida." },
    ],
    glossary: [
      { term: "Cuatriada", definition: "Acorde de cuatro notas construido por terceras." },
      { term: "Dominante 7", definition: "Acorde mayor con septima menor." },
      { term: "Semidisminuido", definition: "Acorde m7b5." },
      { term: "Septima disminuida", definition: "Septima rebajada un semitono extra respecto a la septima menor; aparece en el acorde dim7." },
    ],
  },
  {
    chapterId: "campo-armonico-septimas",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Muy probable en examen",
    title: "Campo armonico con septimas",
    summary:
      "Version de cuatro notas del campo armonico, usando 1-3-5-7 y calidades de cuatriadas.",
    objective:
      "Distinguir grado, calidad y simbolo al construir acordes de septima en major y natural minor.",
    prerequisites: ["escalas-mayores-menores", "triadas", "acordes-de-septima", "armonizacion-mayor"],
    studyFlow: [
      "Separa siempre grado, calidad y simbolo.",
      "Construye 1-3-5-7 dentro de la escala elegida.",
      "Revisa si la septima es mayor o menor antes de escribir maj7 o 7.",
    ],
    memoryHooks: [
      "Grado = posicion en la escala",
      "Calidad = estructura interna",
      "Simbolo = nombre resumido del resultado",
    ],
    examFocus: [
      "Escribir el patron diatonico de septimas en major y natural minor.",
      "Explicar por que V7 es dominante.",
      "No mezclar grado y calidad.",
    ],
    sections: [
      {
        title: "Grado, calidad y simbolo",
        blocks: [
          {
            type: "paragraph",
            text:
              "El grado dice desde que nota empiezas dentro de la escala. La calidad dice que tipo de tercera, quinta y septima aparecen. El simbolo resume ambas cosas en una sola etiqueta musical.",
          },
          {
            type: "example",
            title: "Ejemplo en C major",
            lines: [
              "V7 = quinto grado dominante",
              "Grado: V",
              "Calidad: 7",
              "Notas: G B D F",
            ],
          },
        ],
      },
      {
        title: "Patron diatonico",
        blocks: [
          {
            type: "table",
            title: "Major",
            columns: ["Grado", "Calidad", "Ejemplo en C major"],
            rows: [
              ["Imaj7", "maj7", "Cmaj7"],
              ["ii7", "m7", "Dm7"],
              ["iii7", "m7", "Em7"],
              ["IVmaj7", "maj7", "Fmaj7"],
              ["V7", "7", "G7"],
              ["vi7", "m7", "Am7"],
              ["viiø7", "m7b5", "Bm7b5"],
            ],
          },
          {
            type: "table",
            title: "Natural minor",
            columns: ["Grado", "Calidad"],
            rows: [
              ["i7", "m7"],
              ["iiø7", "m7b5"],
              ["IIImaj7", "maj7"],
              ["iv7", "m7"],
              ["v7", "m7"],
              ["VImaj7", "maj7"],
              ["VII7", "7"],
            ],
          },
        ],
      },
      {
        title: "Menor natural y funcion tonal",
        blocks: [
          {
            type: "paragraph",
            text:
              "El patron de septimas en menor natural sirve como base diatonica y como punto de partida teorico. Sin embargo, en armonia tonal funcional el modo menor suele incorporar tambien la menor armonica para reforzar la dominante y la sensible. Por eso no conviene pensar que el comportamiento real del modo menor se agota en la forma natural.",
          },
          {
            type: "paragraph",
            text:
              "En otras palabras: la menor natural explica un campo armonico valido, pero la practica tonal clasica a menudo modifica el 7o grado para fortalecer la direccion hacia la tonica.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Pensar que 7 significa septima mayor.",
      "Confundir grado con calidad.",
      "Escribir dominante como maj7 por ver una triada mayor.",
    ],
    reviewSummary: [
      "Grado, calidad y simbolo cumplen funciones distintas.",
      "La dominante 7 es 1-3-5-b7.",
      "En major el V7 aparece naturalmente sobre el quinto grado.",
    ],
    checklistItems: [
      { id: "camp-1", text: "Puedo explicar por que G7 es dominante en C major." },
      { id: "camp-2", text: "Puedo distinguir maj7, m7, 7 y m7b5." },
      { id: "camp-3", text: "Puedo escribir el patron de septimas en major y natural minor." },
    ],
    microExercises: [
      { prompt: "Escribe el V7 de C major.", answer: "G7 = G B D F." },
      { prompt: "Que calidad tiene el vii de C major con septima?", answer: "m7b5 o semidisminuido." },
      { prompt: "En A natural minor, que grado con septima es G B D F?", answer: "VII7." },
      { prompt: "El campo armonico de menor natural basta por si solo para explicar toda la tonalidad menor funcional?", answer: "No. Con frecuencia tambien interviene la menor armonica para reforzar la dominante." },
      { prompt: "Por que se modifica a veces el 7o grado en menor?", answer: "Para crear sensible y fortalecer la resolucion hacia la tonica." },
    ],
    glossary: [
      { term: "Campo armonico", definition: "Conjunto de acordes diatonicos que salen de una escala." },
      { term: "V7", definition: "Quinto grado con calidad dominante." },
    ],
  },
  {
    chapterId: "funciones-tonales",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Muy probable en examen",
    title: "Funciones tonales",
    summary:
      "Relacion funcional entre acordes: tonica, predominante y dominante.",
    objective:
      "Reconocer para que sirve un acorde dentro de la tonalidad, no solo como conjunto de notas.",
    prerequisites: ["armonizacion-mayor", "campo-armonico-septimas"],
    studyFlow: [
      "Identifica primero el grado.",
      "Despues ubica si pertenece a zona tonica, predominante o dominante.",
      "Finalmente piensa a donde quiere resolver.",
    ],
    memoryHooks: [
      "Tonica = reposo",
      "Predominante = preparacion",
      "Dominante = tension y empuje",
    ],
    examFocus: [
      "Identificar funciones por grado.",
      "Explicar tendencia de resolucion.",
      "Reconocer por que V y vii empujan a I.",
    ],
    sections: [
      {
        title: "Tres grandes zonas funcionales",
        blocks: [
          {
            type: "table",
            columns: ["Zona", "Grados frecuentes", "Sensacion general"],
            rows: [
              ["Tonica", "I, vi, a veces iii", "Reposo, estabilidad"],
              ["Predominante", "ii, IV", "Preparacion"],
              ["Dominante", "V, vii°", "Tension, necesidad de resolver"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Estas zonas no son una regla mecanica absoluta, pero sirven muchisimo para empezar a analizar progresiones y para entender por que ciertos acordes tienden a otros.",
          },
        ],
      },
      {
        title: "Sensible y resolucion",
        blocks: [
          {
            type: "paragraph",
            text:
              "La sensible es el 7o grado que esta a semitono de la tonica. Por eso genera mucha atraccion hacia ella. Cuando aparece en V o vii°, la sensacion de resolucion hacia I se vuelve muy fuerte.",
          },
          {
            type: "example",
            title: "En C major",
            lines: [
              "B tiende a C",
              "G7 tiende a C",
              "Bdim tiende a C",
            ],
          },
        ],
      },
      {
        title: "Progresiones funcionales basicas",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una funcion tonal se entiende mejor cuando se observa dentro de una progresion real. La tonica da reposo, la predominante prepara el movimiento y la dominante concentra la tension que busca resolucion. Ver esa direccion en cadenas sencillas es esencial para el analisis inicial.",
          },
          {
            type: "example",
            title: "Progresiones frecuentes",
            lines: [
              "I - IV - V - I = reposo, preparacion, tension, resolucion",
              "I - ii - V - I = tonica, predominante, dominante, tonica",
              "vi - ii - V - I = zona tonica, predominante, dominante, tonica",
            ],
          },
          {
            type: "paragraph",
            text:
              "Aunque iii y vi pueden agruparse en zona tonica, no sustituyen exactamente el peso estructural de I. La tonica principal sigue siendo el centro mas estable de la tonalidad.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Pensar que todos los acordes sirven igual dentro de una tonalidad.",
      "Analizar solo calidad y no funcion.",
      "No distinguir reposo de tension.",
    ],
    reviewSummary: [
      "La armonia tonal se organiza por funciones.",
      "Tonica, predominante y dominante cumplen papeles distintos.",
      "La sensible empuja con fuerza hacia la tonica.",
    ],
    checklistItems: [
      { id: "fun-1", text: "Puedo ubicar I, ii, IV, V y vii° por funcion." },
      { id: "fun-2", text: "Entiendo por que V resuelve a I." },
      { id: "fun-3", text: "No miro solo el nombre del acorde, tambien su papel tonal." },
    ],
    microExercises: [
      { prompt: "Que funcion cumple ii en una tonalidad mayor?", answer: "Predominante." },
      { prompt: "Que zona funcional representa V?", answer: "Dominante." },
      { prompt: "Por que vii° empuja hacia I?", answer: "Porque contiene la sensible y estructura de fuerte tension." },
      { prompt: "Que progresion resume con claridad tonica, predominante, dominante y tonica?", answer: "I - ii - V - I." },
      { prompt: "vi tiene exactamente el mismo peso estructural que I?", answer: "No. Puede pertenecer a zona tonica, pero no tiene la misma estabilidad central que I." },
    ],
    glossary: [
      { term: "Funcion tonal", definition: "Papel que cumple un acorde dentro de la tonalidad." },
      { term: "Predominante", definition: "Zona que prepara la llegada de la dominante." },
    ],
  },
  {
    chapterId: "cadencias-basicas",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Ampliacion util",
    title: "Cadencias basicas",
    summary:
      "Formulas de cierre o pausa que organizan el discurso tonal.",
    objective:
      "Distinguir autentica, plagal, semicadencia y rota en progresiones sencillas.",
    prerequisites: ["funciones-tonales"],
    studyFlow: [
      "Identifica la progresion final.",
      "Mira si termina en tonica o se queda abierta.",
      "Relaciona esa llegada con el tipo de cadencia.",
    ],
    memoryHooks: [
      "Autentica = V-I",
      "Plagal = IV-I",
      "Semicadencia = termina en V",
      "Rota = V-vi",
    ],
    examFocus: [
      "Reconocer formulas de cierre.",
      "Saber si una frase cierra o queda abierta.",
      "Relacionar cadencias con funcion tonal.",
    ],
    sections: [
      {
        title: "Tipos principales",
        blocks: [
          {
            type: "table",
            columns: ["Cadencia", "Formula base", "Efecto"],
            rows: [
              ["Autentica", "V-I", "Cierre fuerte"],
              ["Plagal", "IV-I", "Cierre mas suave"],
              ["Semicadencia", "x-V", "Pausa abierta"],
              ["Rota", "V-vi", "Cierre evitado"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La cadencia no depende solo de la calidad del acorde, sino de la funcion tonal del enlace. Por eso debes pensar en grados y direccion, no solo en simbolos aislados.",
          },
        ],
      },
      {
        title: "Cadencia autentica perfecta e imperfecta",
        blocks: [
          {
            type: "paragraph",
            text:
              "Dentro de la cadencia autentica, algunos cursos distinguen entre autentica perfecta e imperfecta. La perfecta produce un cierre mas fuerte cuando la dominante y la tonica aparecen en posicion que refuerza claramente la llegada. La imperfecta conserva el enlace V-I, pero debilita en algun grado la sensacion de clausura.",
          },
          {
            type: "paragraph",
            text:
              "Aunque no todos los examenes exigen ese nivel de detalle, conviene reconocer desde ahora que no todo V-I suena con la misma fuerza. El contexto, la posicion de las voces y el peso metrico influyen en la sensacion final.",
          },
          {
            type: "paragraph",
            text:
              "Ademas, la cadencia no es solo una formula de acordes: organiza el fraseo. Es decir, ayuda a percibir donde una idea termina, se suspende o evita cerrar del todo.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Creer que cualquier V-I es automaticamente autentica perfecta sin revisar contexto.",
      "Confundir plagal con autentica por terminar en I.",
      "No distinguir entre cierre y pausa abierta.",
    ],
    reviewSummary: [
      "Las cadencias organizan cierres y pausas.",
      "La autentica y la plagal cierran; la semicadencia deja abierto.",
      "La rota evita la resolucion esperada de V-I.",
    ],
    checklistItems: [
      { id: "cad-1", text: "Puedo reconocer V-I, IV-I, x-V y V-vi." },
      { id: "cad-2", text: "Puedo explicar si una cadencia cierra o suspende." },
      { id: "cad-3", text: "Relaciono cadencia con funcion tonal." },
    ],
    microExercises: [
      { prompt: "Que tipo de cadencia es G-C en C major?", answer: "Autentica." },
      { prompt: "Que tipo de cadencia es F-C en C major?", answer: "Plagal." },
      { prompt: "Que produce V-vi?", answer: "Cadencia rota." },
      { prompt: "Todo V-I produce exactamente el mismo grado de cierre?", answer: "No. Puede haber diferencias de fuerza cadencial segun el contexto y la disposicion." },
      { prompt: "Que relacion tienen las cadencias con el fraseo?", answer: "Ayudan a organizar cierres, pausas y articulacion estructural de la frase." },
    ],
    glossary: [
      { term: "Cadencia", definition: "Formula de cierre o pausa dentro de una frase." },
      { term: "Rota", definition: "Cadencia donde V evita resolver en I." },
    ],
  },
  {
    chapterId: "introduccion-analisis-armonico",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Ampliacion util",
    title: "Introduccion al analisis armonico",
    summary:
      "Puente entre teoria aislada y lectura funcional de progresiones reales.",
    objective:
      "Dar los primeros pasos para analizar una progresion en grados y funciones.",
    prerequisites: ["funciones-tonales", "cadencias-basicas", "campo-armonico-septimas"],
    studyFlow: [
      "Detecta la tonalidad.",
      "Identifica los acordes y conviertelos a grados.",
      "Marca su funcion y observa como resuelven.",
    ],
    memoryHooks: [
      "Primero tonalidad, luego grados, despues funcion.",
      "No analices simbolos sin contexto tonal.",
      "Las cadencias te ayudan a detectar estructura.",
    ],
    examFocus: [
      "Pasar de acordes escritos a numeros romanos.",
      "Detectar funcion tonal basica.",
      "Reconocer cierres y centro tonal.",
    ],
    sections: [
      {
        title: "Ruta minima de analisis",
        blocks: [
          {
            type: "list",
            items: [
              "Encuentra la tonalidad probable.",
              "Escribe los grados romanos de cada acorde.",
              "Ubica las funciones tonales principales.",
              "Mira si hay cadencia o punto de reposo.",
            ],
          },
          {
            type: "example",
            title: "Ejemplo corto en C major",
            lines: [
              "Acordes: C - Dm - G - C",
              "Romanos: I - ii - V - I",
              "Funciones: tonica - predominante - dominante - tonica",
              "Cierre: autentica final",
            ],
          },
        ],
      },
      {
        title: "Errores frecuentes al analizar",
        blocks: [
          {
            type: "list",
            items: [
              "Analizar acordes sin haber fijado primero la tonalidad.",
              "Confundir calidad del acorde con funcion tonal.",
              "Pensar que un acorde mayor siempre cumple la misma funcion.",
              "Ignorar las cadencias al leer una progresion.",
            ],
          },
          {
            type: "paragraph",
            text:
              "Analizar no consiste en poner nombres aislados a los acordes. Consiste en leer relaciones dentro de una tonalidad. Por eso el primer paso serio siempre es definir el contexto tonal y luego entender como cada grado participa en la direccion general de la progresion.",
          },
        ],
      },
      {
        title: "Ejemplo adicional en menor",
        blocks: [
          {
            type: "example",
            title: "Ejemplo corto en A minor",
            lines: [
              "Acordes: Am - Dm - E - Am",
              "Romanos: i - iv - V - i",
              "Funciones: tonica - predominante - dominante - tonica",
              "Observacion: la dominante fuerte presupone la presencia de G# en el contexto tonal menor",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Analizar sin haber fijado tonalidad.",
      "Confundir calidad del acorde con funcion tonal.",
      "No ver la direccion de la progresion.",
    ],
    reviewSummary: [
      "Analizar es leer relaciones, no solo nombres de acordes.",
      "La tonalidad organiza los grados.",
      "Funcion y cadencia te ayudan a entender la frase.",
    ],
    checklistItems: [
      { id: "ana-1", text: "Puedo convertir una progresion sencilla a numeros romanos." },
      { id: "ana-2", text: "Puedo ubicar funcion tonal basica." },
      { id: "ana-3", text: "Puedo reconocer un cierre elemental." },
    ],
    microExercises: [
      { prompt: "Analiza G - C en C major.", answer: "V - I, cadencia autentica." },
      { prompt: "En C major, que funcion cumple Dm?", answer: "Predominante." },
      { prompt: "Cual seria el analisis de C - Am - Dm - G - C?", answer: "I - vi - ii - V - I." },
      { prompt: "Cual es el primer paso serio antes de asignar numeros romanos?", answer: "Definir la tonalidad." },
      { prompt: "Si ves Am - Dm - E - Am en A menor, cual es la funcion de E?", answer: "Dominante." },
    ],
    glossary: [
      { term: "Analisis armonico", definition: "Lectura funcional de una progresion dentro de una tonalidad." },
      { term: "Numero romano", definition: "Forma de representar grados armonicos." },
    ],
  },
];
