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
      "Leer notas con mas seguridad en clave de Sol, clave de Fa y clave de Do, sin adivinar posiciones.",
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
      "Identificar notas en clave de Sol, Fa y Do.",
      "Distinguir armadura de alteraciones accidentales.",
      "Leer lineas adicionales sin perder la referencia.",
      "Reconocer en que linea se fija la clave de Do segun el instrumento.",
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
              ["Sol", "2a linea = G", "Melodias, voces, registros medios y agudos"],
              ["Fa", "4a linea = F", "Bajo, mano izquierda, registros graves"],
              ["Do", "Linea variable = C", "Viola, cello, voces, partituras antiguas"],
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
            type: "table",
            title: "Clave de Do",
            columns: ["Variante", "Posicion de C", "Uso tipico"],
            rows: [
              ["Soprano (1a)", "1a linea", "Musica antigua, voces"],
              ["Mezzo (2a)", "2a linea", "Poco frecuente hoy"],
              ["Contralto (3a)", "3a linea", "Viola"],
              ["Tenor (4a)", "4a linea", "Cello, fagot, trombon"],
            ],
          },
          {
            type: "paragraph",
            text:
              "En clave de Do, la linea o espacio donde se dibuja el simbolo vale C4. Desde esa referencia puedes moverte por grados conjuntos igual que en cualquier otra clave.",
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
      { prompt: "En clave de Do de alto (3a linea), que nota vale la 3a linea del pentagrama?", answer: "C." },
      { prompt: "Por que existe la clave de Do si ya existen Sol y Fa?", answer: "Para escribir instrumentos de rango medio sin necesitar demasiadas lineas adicionales." },
    ],
    glossary: [
      { term: "Pentagrama", definition: "Conjunto de cinco lineas donde se escriben las notas." },
      { term: "Armadura", definition: "Alteraciones fijas colocadas al inicio que afectan a toda la seccion." },
      { term: "Alteracion accidental", definition: "Signo que cambia una nota dentro del compas actual." },
      { term: "Linea adicional", definition: "Linea corta que extiende el pentagrama para escribir notas fuera de sus cinco lineas." },
      { term: "Nota de referencia", definition: "Nota que el lector reconoce con seguridad y usa como punto de apoyo para leer otras." },
      { term: "Clave de Do", definition: "Clave movil cuya linea de referencia vale C4; se usa para instrumentos de rango medio como viola o cello." },
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
      { term: "Sensible", definition: "7o grado a semitono de la tonica; en modo mayor y menor armonico." },
      { term: "Subtonica", definition: "7o grado cuando esta a un tono entero de la tonica; aparece en menor natural." },
      { term: "Centro tonal", definition: "Nota o acorde que funciona como punto principal de reposo." },
      { term: "Menor melodica", definition: "Forma de la escala menor que eleva 6o y 7o grado al ascender en el enfoque tradicional." },
      { term: "Menor armonica", definition: "Forma de la escala menor que eleva el 7o grado para crear sensible." },
      { term: "Patron", definition: "Secuencia fija de tonos (T) y semitonos (S) que define el caracter de una escala." },
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
              "Si armonizas la menor natural por triadas, mantienes el 7o grado sin elevar. Eso produce un quinto grado menor (v minuscula) y una tension dominante mas debil que en el sistema tonal clasico. El acorde Em, no E, no contiene sensible y por eso no empuja con la misma fuerza hacia la tonica.",
          },
          {
            type: "table",
            columns: ["Grado", "Calidad en A natural minor", "Nota clave"],
            rows: [
              ["i", "Am", "Tonica"],
              ["ii°", "Bdim", "Predominante con 5a disminuida"],
              ["III", "C", "Mayo relativa"],
              ["iv", "Dm", "Predominante"],
              ["v", "Em (menor, no mayor)", "Dominante debil sin sensible"],
              ["VI", "F", "Zona tonica ampliada"],
              ["VII", "G", "Subtonica como acorde"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La diferencia entre v (Em) y V (E) es critica: Em no tiene G# por lo que no hay semitono a la tonica. Esa es la razon por la que en musica tonal funcional se suele preferir la menor armonica para la dominante.",
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
      {
        title: "El 6/4 cadencial: un caso especial",
        blocks: [
          {
            type: "paragraph",
            text:
              "La segunda inversion de triada (6/4) es el estado mas inestable porque el bajo lleva la quinta del acorde. En la practica tonal, el uso mas frecuente del 6/4 es como 6/4 cadencial, donde I6/4 aparece justo antes del V para preparar la cadencia. En ese contexto, el I6/4 no funciona como tonica: funciona como apoyo al V y sus voces resuelven por grado conjunto al V en estado fundamental.",
          },
          {
            type: "example",
            title: "6/4 cadencial en C major",
            lines: [
              "I6/4 = C acorde con G en el bajo (G C E)",
              "Aparece sobre el mismo bajo que el V",
              "C y E resuelven a B y D del G mayor",
              "Formula tipica: I - I6/4 - V - I",
            ],
          },
          {
            type: "chips",
            title: "Regla del 6/4",
            items: [
              "6/4 es siempre inestable",
              "El 6/4 cadencial prepara el V",
              "Sus notas superiores resuelven por grado conjunto",
            ],
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
      {
        title: "Resolucion tipica de cada tipo",
        blocks: [
          {
            type: "paragraph",
            text:
              "Construir una septima es solo la mitad del trabajo. La otra mitad es saber como resuelve. En el sistema tonal, la septima de un acorde tiende a bajar por grado conjunto; la tercera del dominante tiende a subir hacia la tonica. Esos movimientos no son arbitrarios: reflejan la atraccion entre notas a semitono.",
          },
          {
            type: "table",
            columns: ["Acorde", "Contexto tipico", "Resolucion habitual"],
            rows: [
              ["V7 (G7 en C)", "Dominante → tonica", "La septima (F) baja a E; la 3a (B) sube a C"],
              ["m7b5", "Semidisminuido → dominante", "iiø7 → V en menor"],
              ["dim7", "Leading-tone chord", "Resuelve a I o i por semitono en varias voces"],
              ["maj7", "Tonica estable", "Generalmente no necesita resolver"],
              ["m7", "Predominante o tonica", "ii7 suele ir a V; i7 queda en reposo"],
            ],
          },
          {
            type: "example",
            title: "V7 → I en C major",
            lines: [
              "G7 = G B D F",
              "B (3a del acorde) sube a C = sensible resuelve a tonica",
              "F (7a del acorde) baja a E = septima resuelve por grado conjunto descendente",
              "G puede quedarse en G o bajar a C (duplicacion)",
            ],
          },
          {
            type: "paragraph",
            text:
              "Memorizar solo la construccion sin la resolucion es perder la mitad de la informacion funcional. En armonia escrita, mover mal estas voces produce errores facilmente detectables.",
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
        title: "Menor armonica con septimas",
        blocks: [
          {
            type: "paragraph",
            text:
              "Al usar la menor armonica como base, el V7 aparece naturalmente sobre el quinto grado. Eso produce E7 en A menor armonico (E G# B D), que es el dominante fuerte mas caracteristico del modo menor tonal. El vii°7 tambien cambia respecto a la natural.",
          },
          {
            type: "table",
            title: "A harmonic minor con septimas",
            columns: ["Grado", "Calidad", "Ejemplo"],
            rows: [
              ["i7", "m7", "Am7"],
              ["iiø7", "m7b5", "Bm7b5"],
              ["IIImaj7#5", "maj7 con 5a aumentada", "Cmaj7#5"],
              ["iv7", "m7", "Dm7"],
              ["V7", "7 (dominante fuerte)", "E7"],
              ["VImaj7", "maj7", "Fmaj7"],
              ["vii°7", "dim7", "G#dim7"],
            ],
          },
          {
            type: "paragraph",
            text:
              "El V7 de la menor armonica (E7 en A menor) es el acorde mas importante del modo menor tonal. Sin el, la dominante es debil. Por eso cuando ves un V7 o un vii°7 en un contexto menor, estas viendo elementos de la menor armonica, aunque el compositor no lo diga explicitamente.",
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
      { prompt: "Que acorde es E G# B D en A menor armonico?", answer: "E7, el V7 de A menor armonico." },
      { prompt: "Que calidad tiene el vii°7 en menor armonico?", answer: "dim7 (disminuido completo)." },
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
      "Cadencia de engaño = V-vi (evita el cierre esperado)",
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
              ["De engaño / interrumpida", "V-vi", "Cierre evitado; el oido espera I pero llega vi"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La cadencia de engaño tambien se llama cadencia interrumpida. Su efecto es sorpresivo: justamente cuando el oido espera el cierre en I, el acorde resuelve en vi. Es un recurso muy frecuente en musica tonal y aparece en examenes de analisis.",
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
      { id: "cad-4", text: "Puedo explicar por que V-vi se llama cadencia de engano." },
    ],
    microExercises: [
      { prompt: "Que tipo de cadencia es G-C en C major?", answer: "Autentica." },
      { prompt: "Que tipo de cadencia es F-C en C major?", answer: "Plagal." },
      { prompt: "Que produce V-vi?", answer: "Cadencia de engano o interrumpida." },
      { prompt: "Todo V-I produce exactamente el mismo grado de cierre?", answer: "No. Puede haber diferencias de fuerza cadencial segun el contexto y la disposicion." },
      { prompt: "Que relacion tienen las cadencias con el fraseo?", answer: "Ayudan a organizar cierres, pausas y articulacion estructural de la frase." },
      { prompt: "Por que se llama cadencia de engano?", answer: "Porque el oido espera que V resuelva en I pero resuelve en vi, produciendo sorpresa." },
    ],
    glossary: [
      { term: "Cadencia", definition: "Formula de cierre o pausa dentro de una frase." },
      { term: "Cadencia de engano", definition: "Cadencia donde V evita resolver en I y va a vi en su lugar; tambien llamada interrumpida o deceptiva." },
      { term: "Semicadencia", definition: "Pausa sobre el V que deja la frase abierta." },
      { term: "Autentica perfecta", definition: "V-I con ambos acordes en estado fundamental y la tonica en la voz superior." },
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
  {
    chapterId: "ritmo-y-metrica",
    unit: "Bloque 1. Fundamentos",
    focusBadge: "Base obligatoria",
    title: "Ritmo y metrica",
    summary:
      "Figuras ritmicas, valores, compases simples y compuestos, sincopa y contratiempo.",
    objective:
      "Leer y escribir ritmos basicos en compas simple y compuesto, y distinguir sincopa de contratiempo.",
    prerequisites: [],
    studyFlow: [
      "Primero aprende las figuras y sus valores relativos.",
      "Despues aprende como se agrupan en compas simple y compuesto.",
      "Finalmente trabaja sincopa y contratiempo como desplazamientos del acento.",
    ],
    memoryHooks: [
      "Redonda = 4 tiempos, blanca = 2, negra = 1, corchea = 1/2",
      "Compas simple: el tiempo se divide en 2. Compuesto: en 3.",
      "Sincopa = acento en tiempo debil ligado al siguiente fuerte",
    ],
    examFocus: [
      "Reconocer figuras y sus valores.",
      "Distinguir compas simple de compuesto por el numero inferior.",
      "Identificar sincopa y contratiempo en un ejemplo escrito.",
    ],
    sections: [
      {
        title: "Figuras y sus valores",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las figuras indican cuanto dura cada nota de forma relativa. Las duraciones no son absolutas en segundos: dependen del tempo. Sin embargo, las relaciones entre ellas son fijas.",
          },
          {
            type: "table",
            columns: ["Figura", "Equivalencia relativa", "Nombre en compas de 4/4"],
            rows: [
              ["Redonda", "4 negras", "Dura 4 tiempos"],
              ["Blanca", "2 negras", "Dura 2 tiempos"],
              ["Negra", "1 negra", "Dura 1 tiempo"],
              ["Corchea", "1/2 negra", "Dura medio tiempo"],
              ["Semicorchea", "1/4 negra", "Dura un cuarto de tiempo"],
            ],
          },
          {
            type: "paragraph",
            text:
              "El punto de aumentacion agrega la mitad del valor de la figura. Una blanca con punto equivale a 3 negras. Ese punto es muy frecuente en compas compuesto.",
          },
        ],
      },
      {
        title: "Compas simple y compuesto",
        blocks: [
          {
            type: "paragraph",
            text:
              "El compas se escribe como fraccion. El numero superior dice cuantos tiempos hay por compas. El inferior dice que figura vale un tiempo. En compas simple el tiempo se divide en 2; en compuesto se divide en 3.",
          },
          {
            type: "table",
            columns: ["Tipo", "Ejemplos de compas", "Division del tiempo"],
            rows: [
              ["Simple binario", "2/4", "Cada tiempo = 2 subdivisiones"],
              ["Simple ternario", "3/4", "Cada tiempo = 2 subdivisiones"],
              ["Simple cuaternario", "4/4", "Cada tiempo = 2 subdivisiones"],
              ["Compuesto binario", "6/8", "Cada tiempo = 3 subdivisiones"],
              ["Compuesto ternario", "9/8", "Cada tiempo = 3 subdivisiones"],
              ["Compuesto cuaternario", "12/8", "Cada tiempo = 3 subdivisiones"],
            ],
          },
          {
            type: "example",
            title: "Como leer el compas 6/8",
            lines: [
              "6 = seis corcheas por compas",
              "8 = la corchea es la unidad de subdivision",
              "Pero el tiempo real son 2 grupos de 3 corcheas = compas compuesto binario",
            ],
          },
        ],
      },
      {
        title: "Sincopa y contratiempo",
        blocks: [
          {
            type: "paragraph",
            text:
              "La sincopa desplaza el acento al tiempo debil y lo sostiene ligado al tiempo fuerte siguiente. El contratiempo ataca en el tiempo debil pero no esta ligado al fuerte: simplemente ocupa ese espacio y el fuerte se deja en silencio.",
          },
          {
            type: "table",
            columns: ["Concepto", "Definicion", "Efecto"],
            rows: [
              ["Sincopa", "Acento en debil, ligado al fuerte siguiente", "Sensacion de empuje o tension ritmica"],
              ["Contratiempo", "Ataque en debil, silencio en el fuerte", "Sensacion de salto o suspenso"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Ambos recursos son muy frecuentes en musica tonal y en generos populares. En dictado y lectura ritmica, reconocerlos requiere tener claro donde cae el tiempo fuerte del compas.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir el numero superior del compas con el numero de figuras en total.",
      "Pensar que 6/8 es un compas de 6 tiempos.",
      "No distinguir sincopa de contratiempo porque ambos atacan en tiempo debil.",
    ],
    reviewSummary: [
      "Las figuras tienen valores relativos entre si.",
      "El compas simple divide el tiempo en 2; el compuesto en 3.",
      "Sincopa y contratiempo desplazan el acento pero de manera distinta.",
    ],
    checklistItems: [
      { id: "rit-1", text: "Puedo escribir la equivalencia de redonda, blanca, negra y corchea." },
      { id: "rit-2", text: "Puedo distinguir compas simple de compuesto observando el compas." },
      { id: "rit-3", text: "Puedo reconocer una sincopa en un ejemplo escrito." },
    ],
    microExercises: [
      { prompt: "Cuantas negras caben en una redonda?", answer: "Cuatro." },
      { prompt: "Que indica el numero inferior del compas?", answer: "La figura que equivale a un tiempo." },
      { prompt: "Es 6/8 un compas simple o compuesto?", answer: "Compuesto binario: dos tiempos divididos en tres cada uno." },
      { prompt: "Que es una sincopa?", answer: "Un acento en tiempo debil que queda ligado al tiempo fuerte siguiente." },
      { prompt: "Diferencia entre sincopa y contratiempo?", answer: "La sincopa esta ligada al tiempo fuerte; el contratiempo ataca en el debil y el fuerte queda en silencio." },
    ],
    glossary: [
      { term: "Compas", definition: "Unidad de medida ritmica que agrupa los tiempos." },
      { term: "Compas simple", definition: "Compas donde el tiempo se divide en 2." },
      { term: "Compas compuesto", definition: "Compas donde el tiempo se divide en 3." },
      { term: "Sincopa", definition: "Desplazamiento del acento al tiempo debil, ligado al fuerte." },
      { term: "Contratiempo", definition: "Ataque en tiempo debil con silencio en el tiempo fuerte." },
      { term: "Punto de aumentacion", definition: "Signo que agrega la mitad del valor a una figura." },
    ],
  },
  {
    chapterId: "conduccion-de-voces",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Ampliacion util",
    title: "Conduccion de voces",
    summary:
      "Reglas basicas para mover voces en armonia a cuatro partes: evitar paralelos, duplicacion correcta y movimientos recomendados.",
    objective:
      "Reconocer y evitar errores de conduccion como quintas y octavas paralelas, y aplicar movimientos contrario y oblicuo.",
    prerequisites: ["triadas", "inversiones", "funciones-tonales"],
    studyFlow: [
      "Aprende primero los tipos de movimiento entre voces.",
      "Despues identifica los errores clasicos que se deben evitar.",
      "Finalmente practica duplicar correctamente en triadas.",
    ],
    memoryHooks: [
      "Quintas y octavas paralelas = error grave",
      "Movimiento contrario = mas seguro",
      "En triada mayor: duplica la raiz por defecto",
    ],
    examFocus: [
      "Identificar quintas o octavas paralelas en un ejemplo.",
      "Reconocer movimiento contrario, oblicuo y directo.",
      "Saber que nota se duplica en una triada a cuatro voces.",
    ],
    sections: [
      {
        title: "Tipos de movimiento entre voces",
        blocks: [
          {
            type: "paragraph",
            text:
              "Cuando dos voces se mueven al mismo tiempo, la relacion entre ellas puede ser de cuatro tipos. Conocerlos es la base para escribir armonia a cuatro partes sin errores de conduccion.",
          },
          {
            type: "table",
            columns: ["Tipo de movimiento", "Descripcion", "Ejemplo"],
            rows: [
              ["Paralelo", "Las dos voces se mueven en la misma direccion por el mismo intervalo", "Ambas suben una tercera"],
              ["Similar", "Las dos voces se mueven en la misma direccion por intervalos distintos", "Una sube una 3a, otra sube una 2a"],
              ["Contrario", "Las dos voces se mueven en direcciones opuestas", "Una sube, la otra baja"],
              ["Oblicuo", "Una voz se mueve y la otra permanece", "Una sube, la otra repite su nota"],
            ],
          },
          {
            type: "paragraph",
            text:
              "El movimiento contrario es el mas seguro porque reduce el riesgo de generar paralelos. El movimiento oblicuo tambien es util. El similar y el paralelo requieren mas cuidado.",
          },
        ],
      },
      {
        title: "Errores de conduccion clasicos",
        blocks: [
          {
            type: "paragraph",
            text:
              "Los errores mas graves en armonia clasica a cuatro voces son las quintas y octavas paralelas. Se producen cuando dos voces forman una quinta o una octava justa y luego se mueven en paralelo para formar otra quinta u octava justa.",
          },
          {
            type: "table",
            columns: ["Error", "Por que es un problema", "Como evitarlo"],
            rows: [
              ["Quintas paralelas", "Opacitan la independencia de las voces", "Usar movimiento contrario u oblicuo"],
              ["Octavas paralelas", "Hacen que dos voces suenen como una sola", "Revisar que no se dupliquen trayectorias"],
              ["Quintas directas", "Llegar por movimiento similar a una quinta justa desde un intervalo distinto (solo en voces extremas)", "Usar movimiento contrario en soprano o bajo"],
            ],
          },
          {
            type: "example",
            title: "Quintas paralelas C major a G major (error)",
            lines: [
              "Voz 1: C -> D (2a ascendente)",
              "Voz 2: G -> A (2a ascendente)",
              "C-G = 5a justa, D-A = 5a justa en paralelo = error",
            ],
          },
        ],
      },
      {
        title: "Duplicacion en triadas",
        blocks: [
          {
            type: "paragraph",
            text:
              "En armonia a cuatro voces, una de las notas de la triada debe duplicarse para completar las cuatro partes. La eleccion de que nota duplicar no es arbitraria.",
          },
          {
            type: "table",
            columns: ["Tipo de acorde", "Nota preferida para duplicar", "Notas que conviene evitar duplicar"],
            rows: [
              ["Triada mayor en fund.", "Raiz", "Tercera (en V evita duplicar la sensible)"],
              ["Triada menor en fund.", "Raiz", "Tercera en la mayoria de los casos"],
              ["Triada disminuida", "Tercera", "Quinta disminuida (muy inestable duplicada)"],
              ["V en modo mayor/menor", "Raiz o quinta, nunca la sensible", "Sensible (B en C major)"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Duplicar la sensible en el V produce que esta quiera resolver en dos voces a la vez, lo que genera octavas paralelas hacia la tonica. Por eso es uno de los errores mas comunes en examenes.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Escribir quintas paralelas entre las voces del bajo y el tenor.",
      "Duplicar la sensible en el acorde de dominante.",
      "Mover todas las voces en la misma direccion sin revisar paralelos.",
    ],
    reviewSummary: [
      "Quintas y octavas paralelas son errores graves en armonia clasica.",
      "El movimiento contrario reduce el riesgo de errores.",
      "La duplicacion correcta depende del tipo de acorde y del grado.",
    ],
    checklistItems: [
      { id: "voz-1", text: "Puedo nombrar los cuatro tipos de movimiento entre voces." },
      { id: "voz-2", text: "Puedo detectar quintas paralelas en un ejemplo dado." },
      { id: "voz-3", text: "Se que nota duplicar en una triada basica a cuatro voces." },
    ],
    microExercises: [
      { prompt: "Que tipo de movimiento es el mas seguro en armonia clasica?", answer: "El movimiento contrario." },
      { prompt: "Por que son malas las quintas paralelas?", answer: "Porque anulan la independencia de las voces." },
      { prompt: "Que nota se duplica normalmente en una triada mayor en estado fundamental?", answer: "La raiz." },
      { prompt: "Por que no se duplica la sensible en el acorde de V?", answer: "Porque genera octavas paralelas al resolver ambas copias de la sensible hacia la tonica." },
      { prompt: "Que es el movimiento oblicuo?", answer: "Cuando una voz se mueve y la otra permanece en la misma nota." },
    ],
    glossary: [
      { term: "Conduccion de voces", definition: "Arte de mover cada parte de un acorde de forma independiente y eficiente al siguiente." },
      { term: "Quintas paralelas", definition: "Error cuando dos voces forman 5as justas consecutivas moviendose en paralelo." },
      { term: "Octavas paralelas", definition: "Error cuando dos voces forman octavas consecutivas en el mismo sentido." },
      { term: "Movimiento contrario", definition: "Una voz sube mientras la otra baja." },
      { term: "Duplicacion", definition: "Uso de la misma nota en dos voces distintas para completar cuatro partes." },
    ],
  },
  {
    chapterId: "modulacion",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Ampliacion util",
    title: "Modulacion",
    summary:
      "Proceso por el cual una pieza abandona su tonalidad original y establece un nuevo centro tonal.",
    objective:
      "Reconocer cuando una progresion ha cambiado de tonalidad y distinguir el acorde pivote como nexo entre ambas.",
    prerequisites: ["funciones-tonales", "escalas-relativas-paralelas", "campo-armonico-septimas"],
    studyFlow: [
      "Primero confirma la tonalidad de origen.",
      "Detecta el acorde pivote: el que funciona en las dos tonalidades a la vez.",
      "Confirma la nueva tonalidad por la cadencia de llegada.",
    ],
    memoryHooks: [
      "Acorde pivote = pertenece a las dos tonalidades al mismo tiempo",
      "Sin cadencia en la nueva tonica, no hay modulacion real",
      "La armadura puede cambiar, pero no siempre lo hace de inmediato",
    ],
    examFocus: [
      "Identificar el acorde pivote en una progresion modulante.",
      "Reconocer a que tonalidad se modula.",
      "Distinguir modulacion de breve inflexion cromatica.",
    ],
    sections: [
      {
        title: "Que es modular",
        blocks: [
          {
            type: "paragraph",
            text:
              "Modular no es solo usar una nota cromatica. Modular implica establecer un nuevo centro tonal que se confirma con una cadencia. Sin ese cierre en la nueva tonica, el pasaje es solo una inflexion o un color transitorio.",
          },
          {
            type: "chips",
            title: "Diferencias clave",
            items: [
              "Inflexion = nota cromatica sin nuevo centro confirmado",
              "Modulacion = nuevo centro tonal con cadencia de arribo",
            ],
          },
        ],
      },
      {
        title: "Modulacion por acorde pivote",
        blocks: [
          {
            type: "paragraph",
            text:
              "El metodo mas comun en musica tonal clasica. El acorde pivote pertenece a las dos tonalidades al mismo tiempo. En la tonalidad de origen es un grado determinado; en la nueva tonalidad, ese mismo acorde tiene un grado distinto. El analisis cambia de nombre romanos justo en ese acorde.",
          },
          {
            type: "example",
            title: "Ejemplo: C major a G major",
            lines: [
              "En C major: I - IV - ii - [V] ...",
              "El IV de C (F-A-C) es tambien VII de G? No.",
              "El ii de C (D-F-A) es IV de A minor.",
              "El acorde Am (vi de C) es tambien ii de G major.",
              "Desde Am se analiza como ii de G y se confirma con D-G.",
            ],
          },
          {
            type: "table",
            columns: ["Tonalidad origen", "Tonalidad destino", "Acorde pivote tipico"],
            rows: [
              ["C major", "G major", "I de C = IV de G, o vi de C = ii de G"],
              ["C major", "F major", "IV de C = I de F, o ii de C = vi de F"],
              ["C major", "A minor (relativa)", "iv de Am = ii de C; vi de C = i de Am"],
            ],
          },
        ],
      },
      {
        title: "Modulacion cromatica",
        blocks: [
          {
            type: "paragraph",
            text:
              "La modulacion cromatica no usa un acorde pivote diatonico. En cambio, una voz se mueve por semitono a una nota que pertenece a la nueva tonalidad, y desde ahi se establece el nuevo centro. Es mas abrupt y se reconoce porque el cambio de armonia no se puede explicar dentro de la tonalidad de origen.",
          },
          {
            type: "paragraph",
            text:
              "Para preparacion de ingreso basta reconocer que existe y distinguirla de la modulacion por pivote. La modulacion cromatica es mas frecuente en musica del siglo XIX.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Declarar modulacion cada vez que aparece una nota accidental.",
      "No buscar la cadencia de confirmacion en la nueva tonica.",
      "Confundir modulacion a la relativa con modulacion por pivote a otra tonalidad.",
    ],
    reviewSummary: [
      "Modular es establecer un nuevo centro tonal confirmado por cadencia.",
      "El acorde pivote une las dos tonalidades funcionalmente.",
      "Inflexion cromatica y modulacion real no son lo mismo.",
    ],
    checklistItems: [
      { id: "mod-1", text: "Puedo distinguir modulacion de inflexion cromatica." },
      { id: "mod-2", text: "Puedo identificar un acorde pivote en una progresion sencilla." },
      { id: "mod-3", text: "Se que la cadencia confirma la nueva tonalidad." },
    ],
    microExercises: [
      { prompt: "Que hace un acorde pivote en una modulacion?", answer: "Pertenece a las dos tonalidades al mismo tiempo y sirve de puente entre ellas." },
      { prompt: "Una nota accidental aislada equivale a una modulacion?", answer: "No. La modulacion requiere un nuevo centro tonal confirmado por cadencia." },
      { prompt: "Si vi de C major es Am, que grado es Am en G major?", answer: "ii de G major." },
      { prompt: "Como se confirma que una modulacion ocurrio realmente?", answer: "Con una cadencia que establece el nuevo centro tonal." },
      { prompt: "Que diferencia hay entre modulacion por pivote y cromatica?", answer: "La de pivote usa un acorde comun a las dos tonalidades; la cromatica no tiene ese puente y cambia por semitono." },
    ],
    glossary: [
      { term: "Modulacion", definition: "Cambio de tonalidad dentro de una pieza, confirmado por cadencia en el nuevo centro." },
      { term: "Acorde pivote", definition: "Acorde que pertenece a las dos tonalidades y sirve de nexo en la modulacion." },
      { term: "Inflexion cromatica", definition: "Uso transitorio de una nota cromatica sin establecer un nuevo centro tonal." },
      { term: "Tonalidad de destino", definition: "Nueva tonalidad hacia la que se modula." },
    ],
  },
  {
    chapterId: "forma-musical",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Ampliacion util",
    title: "Forma musical basica",
    summary:
      "Unidades estructurales de la musica tonal: frase, periodo y las formas mas frecuentes.",
    objective:
      "Reconocer frase y periodo, y distinguir formas binaria, ternaria y de cancion en ejemplos sencillos.",
    prerequisites: ["cadencias-basicas", "funciones-tonales"],
    studyFlow: [
      "Empieza por entender frase y periodo como unidades minimas.",
      "Luego aprende como esas unidades se organizan en formas.",
      "Finalmente practica identificar la estructura de una pieza corta.",
    ],
    memoryHooks: [
      "Frase = pregunta o afirmacion musical; suele terminar en cadencia",
      "Periodo = 2 frases (antecedente + consecuente)",
      "Binaria = AB. Ternaria = ABA. Cancion = a a b a",
    ],
    examFocus: [
      "Distinguir frase de periodo.",
      "Identificar estructura binaria o ternaria en una pieza corta.",
      "Relacionar las cadencias con los cierres de frase.",
    ],
    sections: [
      {
        title: "Frase y periodo",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una frase es la unidad musical mas pequena con sentido propio. Suele terminar en una cadencia. Normalmente tiene entre 4 y 8 compases, aunque eso varia. El periodo esta formado por dos frases: la frase antecedente, que queda abierta (semicadencia frecuente), y la frase consecuente, que cierra con cadencia autentica.",
          },
          {
            type: "table",
            columns: ["Unidad", "Longitud tipica", "Cadencia de cierre"],
            rows: [
              ["Frase antecedente", "4-8 compases", "Semicadencia o cadencia debil"],
              ["Frase consecuente", "4-8 compases", "Cadencia autentica (cierre fuerte)"],
              ["Periodo", "2 frases = 8-16 compases", "Autentica al final"],
            ],
          },
        ],
      },
      {
        title: "Formas principales",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las formas describen como se organiza el material tematico a lo largo de una pieza. Para preparacion de ingreso basta reconocer si una seccion se repite, contrasta o regresa.",
          },
          {
            type: "table",
            columns: ["Forma\", \"Esquema\", \"Descripcion basica"],
            rows: [
              ["Binaria simple", "A B", "Dos secciones contrastantes; cada una puede repetirse"],
              ["Binaria redondeada", "A B A'", "La segunda seccion regresa al material de A, aunque abreviado"],
              ["Ternaria", "A B A", "Tres secciones; B contrasta; A regresa completa"],
              ["Forma cancion", "a a b a", "Cuatro frases: dos iguales, una de contraste, regreso a a"],
            ],
          },
          {
            type: "example",
            title: "Como analizar una pieza corta",
            lines: [
              "1. Escucha o lee y marca los cierres cadenciales.",
              "2. Agrupa las frases en secciones por contenido tematico.",
              "3. Asigna letras: A para el tema inicial, B para contraste.",
              "4. Si A regresa, escribe A o A'.",
              "5. El esquema de letras es la forma.",
            ],
          },
        ],
      },
      {
        title: "Relacion entre forma y cadencia",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las cadencias no solo cierran acordes: organizan la estructura. Una semicadencia suele dejar abierta una seccion, lo que impulsa hacia la siguiente. Una cadencia autentica perfecta cierra una seccion con firmeza. Por eso para identificar la forma hay que seguir las cadencias.",
          },
          {
            type: "chips",
            title: "Cadencias como mapa de forma",
            items: [
              "Semicadencia -> frase antecedente abierta",
              "Cadencia autentica debil -> cierre parcial",
              "Cadencia autentica perfecta -> cierre de seccion",
              "Cadencia de engano -> extension de la frase",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir seccion con frase.",
      "Asumir que toda pieza es ABA sin analizar las cadencias.",
      "No distinguir binaria redondeada de ternaria.",
    ],
    reviewSummary: [
      "La frase es la unidad minima; el periodo es par de frases.",
      "Las formas se identifican siguiendo el retorno o el contraste del material tematico.",
      "Las cadencias marcan los limites de las secciones.",
    ],
    checklistItems: [
      { id: "for-1", text: "Puedo distinguir frase antecedente de consecuente." },
      { id: "for-2", text: "Puedo identificar si una pieza corta es binaria o ternaria." },
      { id: "for-3", text: "Relaciono las cadencias con los limites de forma." },
    ],
    microExercises: [
      { prompt: "Cuantas frases forman un periodo?", answer: "Dos: antecedente y consecuente." },
      { prompt: "Cual es el esquema de la forma ternaria?", answer: "A B A." },
      { prompt: "Que cadencia suele cerrar la frase antecedente?", answer: "Semicadencia." },
      { prompt: "Que diferencia hay entre binaria redondeada y ternaria?", answer: "En la redondeada A regresa abreviado dentro de la segunda seccion; en la ternaria A regresa completa como tercera seccion." },
      { prompt: "Como se usan las cadencias para identificar forma?", answer: "Marcan los limites de frase y seccion; la cadencia autentica cierra, la semicadencia deja abierto." },
    ],
    glossary: [
      { term: "Frase", definition: "Unidad musical con sentido propio, generalmente de 4 a 8 compases." },
      { term: "Periodo", definition: "Dos frases: antecedente (abierta) y consecuente (cerrada)." },
      { term: "Forma binaria", definition: "Estructura de dos secciones contrastantes: A B." },
      { term: "Forma ternaria", definition: "Estructura de tres secciones donde la primera regresa: A B A." },
      { term: "Frase antecedente", definition: "Primera frase del periodo; suele quedar abierta en semicadencia." },
      { term: "Frase consecuente", definition: "Segunda frase del periodo; cierra con cadencia autentica." },
    ],
  },
  {
    chapterId: "campo-armonico-triadas",
    unit: "Bloque 2. Armonia basica",
    focusBadge: "Clave para la app",
    title: "Campo armonico con triadas",
    summary:
      "Como construir el campo armonico apilando terceras desde cada grado de la escala, y el patron de calidades resultante.",
    objective:
      "Construir el campo armonico de cualquier tonalidad mayor o menor natural y reconocer la calidad de cada grado.",
    prerequisites: ["triadas", "escalas-mayores-menores"],
    studyFlow: [
      "Escribe las 7 notas de la escala.",
      "Desde cada nota apila la 3ª y la 5ª diatonicas (dentro de la escala).",
      "Clasifica la triada resultante comparando sus intervalos internos.",
      "Memoriza el patron de calidades: no tienes que recalcular desde cero cada vez.",
    ],
    memoryHooks: [
      "Mayor: M m m M M m dim (I ii iii IV V vi vii°)",
      "Menor natural: m dim M m m M M (i ii° III iv v VI VII)",
      "El V en mayor siempre es Mayor, el v en menor natural siempre es menor",
    ],
    examFocus: [
      "Dado un grado en modo mayor, decir su calidad.",
      "Construir el campo armonico completo de una tonalidad dada.",
      "Reconocer el patron de calidades de la escala menor natural.",
    ],
    sections: [
      {
        title: "Como se construye el campo armonico",
        blocks: [
          {
            type: "paragraph",
            text:
              "El campo armonico es el conjunto de triadas que se forman al apilar terceras diatonicas desde cada grado de la escala. 'Diatonicas' significa que las notas que usas son siempre las de la escala, sin agregar alteraciones. El resultado es un grupo de 7 acordes, uno por cada grado.",
          },
          {
            type: "example",
            title: "Ejemplo paso a paso en C major",
            lines: [
              "Escala: C D E F G A B",
              "Grado I: C + E (3ª) + G (5ª) = C-E-G = acorde Mayor",
              "Grado II: D + F (3ª) + A (5ª) = D-F-A = acorde menor",
              "Grado III: E + G (3ª) + B (5ª) = E-G-B = acorde menor",
              "Grado IV: F + A (3ª) + C (5ª) = F-A-C = acorde Mayor",
              "Grado V: G + B (3ª) + D (5ª) = G-B-D = acorde Mayor",
              "Grado VI: A + C (3ª) + E (5ª) = A-C-E = acorde menor",
              "Grado VII: B + D (3ª) + F (5ª) = B-D-F = acorde Disminuido",
            ],
          },
          {
            type: "paragraph",
            text:
              "Nota que solo usas notas de la escala en cada paso. Por eso en G major el VII grado seria F# (no F), lo que cambia las notas exactas pero el patron de calidades permanece identico.",
          },
        ],
      },
      {
        title: "Patron de calidades en modo mayor",
        blocks: [
          {
            type: "paragraph",
            text:
              "La gran ventaja del campo armonico es que el patron de calidades es fijo para cualquier tonalidad mayor. No importa si estas en C, G, Ab o F#; el patron siempre es el mismo.",
          },
          {
            type: "table",
            columns: ["Grado", "Simbolo", "Calidad", "Ejemplo en C", "Ejemplo en G"],
            rows: [
              ["I", "I", "Mayor", "C", "G"],
              ["II", "ii", "menor", "Dm", "Am"],
              ["III", "iii", "menor", "Em", "Bm"],
              ["IV", "IV", "Mayor", "F", "C"],
              ["V", "V", "Mayor", "G", "D"],
              ["VI", "vi", "menor", "Am", "Em"],
              ["VII", "vii°", "Disminuido", "B°", "F#°"],
            ],
          },
          {
            type: "chips",
            title: "Mnemotecnia: MAY me me MAY MAY me DIM",
            items: [
              "I Mayor",
              "ii menor",
              "iii menor",
              "IV Mayor",
              "V Mayor",
              "vi menor",
              "vii° Disminuido",
            ],
          },
        ],
      },
      {
        title: "Patron de calidades en modo menor natural",
        blocks: [
          {
            type: "paragraph",
            text:
              "En la escala menor natural el patron cambia porque los intervalos internos de la escala son distintos. El punto mas importante: el v (grado 5) es menor, no mayor. Esto tiene implicaciones en la armonia de la musica en modo menor (ver el capitulo de armonizacion menor para mas detalle).",
          },
          {
            type: "table",
            columns: ["Grado", "Simbolo", "Calidad", "Ejemplo en Am", "Ejemplo en Dm"],
            rows: [
              ["I", "i", "menor", "Am", "Dm"],
              ["II", "ii°", "Disminuido", "B°", "E°"],
              ["III", "III", "Mayor", "C", "F"],
              ["IV", "iv", "menor", "Dm", "Gm"],
              ["V", "v", "menor", "Em", "Am"],
              ["VI", "VI", "Mayor", "F", "Bb"],
              ["VII", "VII", "Mayor", "G", "C"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Comparando los dos patrones: en mayor los acordes mayores son I-IV-V; en menor natural los mayores son III-VI-VII. El acorde de dominante (V) es el que mas diferencia tiene: Mayor en el modo mayor, menor en el modo menor natural.",
          },
        ],
      },
      {
        title: "Como identificar la calidad de un acorde apilado",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una vez que tienes las 3 notas, comparas los intervalos internos para clasificar la triada.",
          },
          {
            type: "table",
            columns: ["Calidad", "Intervalo raiz-3ª", "Intervalo raiz-5ª", "Formula"],
            rows: [
              ["Mayor", "3ª mayor (4 semitonos)", "5ª justa (7 semitonos)", "1-3-5"],
              ["menor", "3ª menor (3 semitonos)", "5ª justa (7 semitonos)", "1-b3-5"],
              ["Disminuido", "3ª menor (3 semitonos)", "5ª dism. (6 semitonos)", "1-b3-b5"],
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Agregar alteraciones que no estan en la escala al apilar terceras.",
      "Olvidar que el patron de calidades cambia entre mayor y menor natural.",
      "Confundir el v menor de la escala menor natural con el V mayor (armonico).",
    ],
    reviewSummary: [
      "El campo armonico se construye apilando terceras diatonicas desde cada grado.",
      "En modo mayor el patron es: M-m-m-M-M-m-dim.",
      "En modo menor natural el patron es: m-dim-M-m-m-M-M.",
    ],
    checklistItems: [
      { id: "cat-1", text: "Puedo construir el campo armonico de C major sin ayuda." },
      { id: "cat-2", text: "Se el patron de calidades del modo mayor de memoria." },
      { id: "cat-3", text: "Puedo decir la calidad del iii grado en modo mayor sin calcular." },
    ],
    microExercises: [
      { prompt: "Que calidad tiene el ii grado en modo mayor?", answer: "menor." },
      { prompt: "Que calidad tiene el vii en modo mayor?", answer: "Disminuido." },
      { prompt: "En C major, cuales son los acordes del campo armonico?", answer: "C, Dm, Em, F, G, Am, B°." },
      { prompt: "En modo menor natural, que calidad tiene el V?", answer: "menor (v minuscula)." },
      { prompt: "Por que el VII° solo aparece en modo mayor?", answer: "Porque en menor natural ese grado es Mayor (VII), no disminuido." },
    ],
    glossary: [
      { term: "Campo armonico", definition: "Conjunto de 7 triadas formadas apilando terceras diatonicas desde cada grado de la escala." },
      { term: "Terceras diatonicas", definition: "Terceras construidas usando solo las notas de la escala, sin alteraciones extras." },
      { term: "Patron de calidades", definition: "Secuencia fija de calidades de acorde que resulta de costruir el campo armonico de un modo dado." },
      { term: "v menor", definition: "El quinto grado del modo menor natural, que es una triada menor (no mayor)." },
    ],
  },
  {
    chapterId: "circulo-de-quintas",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Clave para la app",
    title: "Circulo de quintas",
    summary:
      "Mapa de las 12 tonalidades ordenadas por quintas: armaduras, orden de alteraciones, relativas y enarmonicas.",
    objective:
      "Leer cualquier armadura e identificar la tonalidad, y navegar el circulo para encontrar tonalidades cercanas.",
    prerequisites: ["escalas-mayores-menores", "escalas-relativas-paralelas"],
    studyFlow: [
      "Aprende el orden de los sostenidos (FCGDAEB) y de los bemoles (BEADGCF).",
      "Aprende la regla para identificar la tonalidad desde su armadura.",
      "Ubica el relativo menor de cada tonalidad mayor en el circulo.",
      "Identifica los tres puntos enarmonicos (B/Cb, Gb/F#, Db/C#).",
    ],
    memoryHooks: [
      "Sostenidos: Fa Do Sol Re La Mi Si (FCGDAEB). Frase: Fa-Cilmente Come Gatos De Azotea El Bicho",
      "Bemoles: Si Fa Mi Re Do Fa La (BEADGCF) = orden inverso de los sostenidos",
      "Tonalidad de sostenidos: el ultimo sostenido es la sensible (VII) -> sube un semitono = tonica",
      "Tonalidad de bemoles: el penultimo bemol es la tonica",
    ],
    examFocus: [
      "Decir cuantas y que alteraciones tiene una tonalidad dada.",
      "Identificar la tonalidad a partir de su armadura.",
      "Encontrar el relativo menor de una tonalidad mayor.",
    ],
    sections: [
      {
        title: "Que es el circulo de quintas",
        blocks: [
          {
            type: "paragraph",
            text:
              "El circulo de quintas organiza las 12 tonalidades mayores en un ciclo donde cada tonalidad esta a una quinta justa de distancia de la siguiente. Subir por el circulo (hacia la derecha conventionalmente) agrega un sostenido. Bajar (hacia la izquierda) agrega un bemol.",
          },
          {
            type: "table",
            columns: ["Tonalidad", "Alter.", "Tipo", "Alteraciones en orden"],
            rows: [
              ["C major", "0", "—", "ninguna"],
              ["G major", "1", "#", "F#"],
              ["D major", "2", "#", "F# C#"],
              ["A major", "3", "#", "F# C# G#"],
              ["E major", "4", "#", "F# C# G# D#"],
              ["B major", "5", "#", "F# C# G# D# A#"],
              ["F# / Gb", "6", "#/b", "F# C# G# D# A# E# / Bb Eb Ab Db Gb Cb"],
              ["Db major", "5", "b", "Bb Eb Ab Db Gb"],
              ["Ab major", "4", "b", "Bb Eb Ab Db"],
              ["Eb major", "3", "b", "Bb Eb Ab"],
              ["Bb major", "2", "b", "Bb Eb"],
              ["F major", "1", "b", "Bb"],
            ],
          },
        ],
      },
      {
        title: "Orden de las alteraciones",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las alteraciones no aparecen en cualquier orden: siempre se agregan en la misma secuencia fija. Conocer el orden es indispensable para leer una armadura rapidamente.",
          },
          {
            type: "table",
            columns: ["Tipo", "Orden", "Mnemotecnia"],
            rows: [
              ["Sostenidos", "F# C# G# D# A# E# B#", "Fa Do Sol Re La Mi Si"],
              ["Bemoles", "Bb Eb Ab Db Gb Cb Fb", "Si (Bb) Re La Sol Fa Do (= sostenidos al reves)"],
            ],
          },
          {
            type: "example",
            title: "Como leer una armadura de sostenidos",
            lines: [
              "Regla: el ultimo sostenido es la sensible (VII grado).",
              "Sensible + 1 semitono = tonica de la tonalidad.",
              "Ejemplo: armadura con F# C# G# -> ultimo # es G#.",
              "G# + semitono = A. Tonalidad = A major.",
            ],
          },
          {
            type: "example",
            title: "Como leer una armadura de bemoles",
            lines: [
              "Regla: el penultimo bemol es la tonica.",
              "Excepcion: con 1 bemol (solo Bb) la tonica es F (memorizar).",
              "Ejemplo: armadura con Bb Eb Ab Db -> penultimo = Ab.",
              "Tonalidad = Ab major.",
            ],
          },
        ],
      },
      {
        title: "Relativo menor en el circulo",
        blocks: [
          {
            type: "paragraph",
            text:
              "Cada tonalidad mayor comparte su armadura con una tonalidad menor: su relativo menor. El relativo menor esta en el VI grado de la mayor (o, dicho de otro modo, a 3 semitonos por debajo de la tonica mayor). En el circulo el relativo menor aparece en el anillo interior.",
          },
          {
            type: "table",
            columns: ["Mayor", "Relativa menor", "Armadura"],
            rows: [
              ["C", "Am", "0"],
              ["G", "Em", "1#"],
              ["D", "Bm", "2#"],
              ["F", "Dm", "1b"],
              ["Bb", "Gm", "2b"],
              ["Eb", "Cm", "3b"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Regla rapida: el relativo menor es la nota que esta a una 6ª mayor sobre la tonica (o a una 3ª menor por debajo). Desde C, sube una 6ª mayor: C-D-E-F-G-A. El relativo de C mayor es Am.",
          },
        ],
      },
      {
        title: "Enarmonicas en el circulo",
        blocks: [
          {
            type: "paragraph",
            text:
              "En tres puntos del circulo existe una pareja de tonalidades enarmonicas: suenan identico pero se escriben diferente. Conocerlas evita errores de escritura en el examen.",
          },
          {
            type: "table",
            columns: ["Par enarmonico", "Version sostenidos", "Version bemoles"],
            rows: [
              ["B / Cb", "B major (5#)", "Cb major (7b)"],
              ["F# / Gb", "F# major (6#)", "Gb major (6b)"],
              ["C# / Db", "C# major (7#)", "Db major (5b)"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La version con menos alteraciones suele ser la que se usa en practica: Db (5b) en lugar de C# (7#), Gb (6b) o F# (6#) indistintamente, y B (5#) en lugar de Cb (7b).",
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir el orden de los sostenidos y los bemoles.",
      "Aplicar la regla del 'ultimo sostenido' a armaduras de bemoles.",
      "Olvidar que con 1 solo bemol (Bb) la tonalidad es F, no Bb.",
    ],
    reviewSummary: [
      "El circulo organiza las 12 tonalidades por quintas; cada paso agrega 1 alteracion.",
      "Sostenidos: FCGDAEB. Bemoles: orden inverso BEADGCF.",
      "El relativo menor comparte la armadura de la mayor y esta en su VI grado.",
    ],
    checklistItems: [
      { id: "cq-1", text: "Puedo recitar el orden de los sostenidos de memoria." },
      { id: "cq-2", text: "Puedo identificar la tonalidad de una armadura de sostenidos usando la regla." },
      { id: "cq-3", text: "Se el relativo menor de las tonalidades mas comunes (C, G, D, F, Bb, Eb)." },
    ],
    microExercises: [
      { prompt: "Di los sostenidos en orden.", answer: "F# C# G# D# A# E# B#." },
      { prompt: "Una armadura tiene F# C# G# D#. Que tonalidad es?", answer: "El ultimo # es D#. D# + semitono = E. Tonalidad: E major (4 sostenidos)." },
      { prompt: "Una armadura tiene Bb Eb Ab. Que tonalidad es?", answer: "El penultimo bemol es Eb. Tonalidad: Eb major (3 bemoles)." },
      { prompt: "Cual es el relativo menor de G major?", answer: "Em (comparte 1 sostenido)." },
      { prompt: "Que par enarmonico tiene 6 alteraciones?", answer: "Gb major (6b) = F# major (6#)." },
    ],
    glossary: [
      { term: "Circulo de quintas", definition: "Mapa ciclico de las 12 tonalidades ordenadas a una quinta justa entre si." },
      { term: "Armadura", definition: "Conjunto de alteraciones al inicio del pentagrama que indican la tonalidad." },
      { term: "Enarmonica", definition: "Dos tonalidades que suenan igual pero se escriben con notacion distinta." },
      { term: "Relativa menor", definition: "Tonalidad menor que comparte la misma armadura que una tonalidad mayor; esta en su VI grado." },
      { term: "Sensible", definition: "VII grado de la escala; el ultimo sostenido de una armadura es la sensible de esa tonalidad." },
    ],
  },
  {
    chapterId: "arpegios-y-extensiones",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Clave para la app",
    title: "Arpegios y extensiones",
    summary:
      "Que es un arpegio, como se construyen sobre triadas y acordes de septima, y que son las extensiones (9a, 11a, 13a).",
    objective:
      "Distinguir arpegio de acorde, construir arpegios de triada y septima, y reconocer las extensiones basicas.",
    prerequisites: ["triadas", "acordes-de-septima"],
    studyFlow: [
      "Entiende la diferencia entre acorde y arpegio.",
      "Aprende las 4 formulas de arpegios de triada.",
      "Aprende los 4 arpegios de septima principales.",
      "Comprende como se agregan extensiones (9a, 11a, 13a).",
    ],
    memoryHooks: [
      "Arpegio = notas del acorde tocadas una por una",
      "Triada mayor: 1-3-5. Menor: 1-b3-5. Disminuida: 1-b3-b5. Aumentada: 1-3-#5",
      "Septima: agrega la 7ª sobre la triada. Novena: agrega la 9ª sobre la septima",
      "Guide tones (notas guia) = la 3ª y la 7ª: definen la calidad del acorde",
    ],
    examFocus: [
      "Escribir las notas de un arpegio mayor, menor o dominante dado.",
      "Distinguir m7, maj7, 7 (dominante) y m7b5 por su formula.",
      "Saber que la 9a = 2a una octava arriba, la 11a = 4a una octava arriba.",
    ],
    sections: [
      {
        title: "Arpegio vs acorde",
        blocks: [
          {
            type: "paragraph",
            text:
              "Un acorde es un grupo de notas tocadas simultaneamente. Un arpegio es el mismo grupo de notas pero tocadas en sucesion, una tras otra. Las notas son exactamente las mismas; lo que cambia es si se tocan juntas o por separado. Un arpegio de Cm tiene las notas C-Eb-G igual que el acorde Cm; la diferencia es solo en la ejecucion.",
          },
          {
            type: "chips",
            title: "Mismo contenido, diferente ejecucion",
            items: [
              "Acorde = notas simultaneas",
              "Arpegio = notas sucesivas",
              "Inversion = cambia la nota mas grave pero las notas son las mismas",
            ],
          },
        ],
      },
      {
        title: "Arpegios de triada: las 4 familias",
        blocks: [
          {
            type: "paragraph",
            text:
              "Cada familia de triada produce un arpegio con una sonoridad distinta. La formula indica los intervalos desde la raiz en semitonos. En la app de arpegios de bajo estos son el punto de partida.",
          },
          {
            type: "table",
            columns: ["Familia", "Formula", "Intervalos en semitonos", "Ejemplo en C"],
            rows: [
              ["Mayor", "1-3-5", "0 - 4 - 7", "C E G"],
              ["Menor", "1-b3-5", "0 - 3 - 7", "C Eb G"],
              ["Disminuida", "1-b3-b5", "0 - 3 - 6", "C Eb Gb"],
              ["Aumentada", "1-3-#5", "0 - 4 - 8", "C E G#"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La diferencia entre mayor y menor es solo un semitono en la tercera. La diferencia entre menor y disminuida es solo un semitono en la quinta. La aumentada es la menos comun en el campo armonico diatonico, pero aparece en el V grado alterado.",
          },
        ],
      },
      {
        title: "Arpegios de septima: los 4 tipos principales",
        blocks: [
          {
            type: "paragraph",
            text:
              "Al agregar una cuarta nota (la 7ª) obtienes arpegios de septima que son la base de la armonia jazz y funcional avanzada. Hay 4 tipos principales que debes conocer para preparacion universitaria.",
          },
          {
            type: "table",
            columns: ["Nombre", "Simbolo", "Formula", "Ejemplo en D", "Donde aparece"],
            rows: [
              ["Mayor septima", "maj7", "1-3-5-7", "D F# A C#", "Imaj7, IVmaj7"],
              ["Menor septima", "m7", "1-b3-5-b7", "D F A C", "ii7, iii7, vi7"],
              ["Dominante", "7", "1-3-5-b7", "D F# A C", "V7"],
              ["Semidisminuido", "m7b5 o ø", "1-b3-b5-b7", "D F Ab C", "vii°7 (mayor), ii°7 (menor)"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Observa la diferencia entre maj7 y 7 (dominante): ambos tienen tercera mayor y quinta justa, pero la septima difiere en un semitono. En maj7 la septima es mayor (7 semitonos desde la 6ª), en el dominante es menor (b7). Esa diferencia de un semitono cambia completamente la funcion armonica.",
          },
        ],
      },
      {
        title: "Guide tones: la 3ª y la 7ª",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las notas guia (guide tones) son la 3ª y la 7ª del acorde. Estas dos notas definen la calidad del acorde mejor que cualquier otra. La 5ª es la nota menos informativa y a menudo se omite en voicings de jazz. Cuando improvisas o armonizas, priorizar la 3ª y la 7ª te da la sensacion del acorde con solo 2 notas.",
          },
          {
            type: "table",
            columns: ["Acorde", "3ª (guide tone)", "7ª (guide tone)", "Funcion"],
            rows: [
              ["Cmaj7", "E (3ª mayor)", "B (7ª mayor)", "Tonica estable"],
              ["Dm7", "F (3ª menor)", "C (7ª menor)", "Subdominante / ii"],
              ["G7", "B (3ª mayor)", "F (7ª menor)", "Dominante con tension"],
            ],
          },
          {
            type: "paragraph",
            text:
              "En G7 -> Cmaj7 (V7->I), la 3ª de G7 (B) resuelve subiendo a C, y la 7ª de G7 (F) resuelve bajando a E. Eso es la resolucion de guide tones en accion.",
          },
        ],
      },
      {
        title: "Extensiones: 9ª, 11ª y 13ª",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las extensiones son las notas que se agregan mas alla de la septima. Se nombran con numeros mayores que 7 para indicar que estan una octava mas arriba que los intervalos basicos.",
          },
          {
            type: "table",
            columns: ["Extension", "Equivale a", "Semitonos desde raiz", "Ejemplo sobre C"],
            rows: [
              ["9ª", "2ª + octava", "14 semitonos", "D (una octava arriba)"],
              ["11ª", "4ª + octava", "17 semitonos", "F (una octava arriba)"],
              ["13ª", "6ª + octava", "21 semitonos", "A (una octava arriba)"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Un acorde Dm9 tiene: D-F-A-C-E (triada menor + septima menor + novena mayor). En la app de arpegios de bajo los grupos 'Novenas y Trecenas' cubren estas extensiones en la practica.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir maj7 (7ª mayor) con 7 (dominante, 7ª menor).",
      "Pensar que la 9ª y la 2ª son lo mismo sin entender la octava de diferencia.",
      "Olvidar que el semidisminuido tiene 5ª disminuida (diferente al dominante que tiene 5ª justa).",
    ],
    reviewSummary: [
      "Un arpegio son las notas de un acorde tocadas en sucesion.",
      "Las 4 triadas: mayor (1-3-5), menor (1-b3-5), disminuida (1-b3-b5), aumentada (1-3-#5).",
      "Los 4 acordes de septima principales: maj7, m7, 7 (dominante), m7b5.",
      "Las guide tones (3ª y 7ª) definen la calidad del acorde.",
      "9ª = 2ª + octava. 11ª = 4ª + octava. 13ª = 6ª + octava.",
    ],
    checklistItems: [
      { id: "arp-1", text: "Puedo distinguir arpegio de acorde." },
      { id: "arp-2", text: "Puedo escribir las notas de un arpegio mayor, menor y dominante." },
      { id: "arp-3", text: "Se que la 3a y la 7a son las guide tones que definen la calidad." },
    ],
    microExercises: [
      { prompt: "Que diferencia hay entre Cmaj7 y C7?", answer: "Cmaj7 tiene septima mayor (B); C7 tiene septima menor (Bb)." },
      { prompt: "Escribe las notas del arpegio de Gm7.", answer: "G - Bb - D - F (1-b3-5-b7)." },
      { prompt: "Que es una guide tone?", answer: "La 3ª o la 7ª del acorde; las notas que mejor definen su calidad." },
      { prompt: "Una novena es lo mismo que una segunda?", answer: "Son la misma nota de referencia pero la novena esta una octava mas arriba." },
      { prompt: "Que formula tiene el arpegio semidisminuido?", answer: "1-b3-b5-b7." },
    ],
    glossary: [
      { term: "Arpegio", definition: "Las notas de un acorde ejecutadas en sucesion en lugar de simultaneamente." },
      { term: "Guide tones", definition: "La 3ª y la 7ª de un acorde; las notas que definen su calidad con mayor claridad." },
      { term: "Dominante", definition: "Acorde con formula 1-3-5-b7; el V7 de la tonalidad con maxima tension hacia la tonica." },
      { term: "Semidisminuido (ø)", definition: "Acorde con formula 1-b3-b5-b7." },
      { term: "Extension", definition: "Nota agregada mas alla de la 7ª: 9ª, 11ª o 13ª." },
      { term: "Novena", definition: "Segunda un octava arriba; agrega color sin cambiar la funcion armonica basica." },
    ],
  },
];


