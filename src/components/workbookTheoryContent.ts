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

export type WorkbookBlock = {
  blockId: string;
  title: string;
  summary: string;
  chapters: WorkbookChapter[];
};

const LEGACY_WORKBOOK_THEORY_CHAPTERS: WorkbookChapter[] = [
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
            text: "El pentagrama tiene cinco lineas y cuatro espacios. Las notas se escriben en esas posiciones. La clave establece desde donde empiezas a leer y que nombre real recibe cada linea o espacio.",
          },
          {
            type: "table",
            columns: ["Clave", "Referencia", "Uso comun"],
            rows: [
              [
                "Sol",
                "2a linea = G",
                "Melodias, voces, registros medios y agudos",
              ],
              ["Fa", "4a linea = F", "Bajo, mano izquierda, registros graves"],
              [
                "Do",
                "Linea variable = C",
                "Viola, cello, voces, partituras antiguas",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "Por eso no puedes leer una nota solo por su altura visual. La misma posicion en el pentagrama cambia de nombre si cambias de clave.",
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
            text: "En clave de Do, la linea o espacio donde se dibuja el simbolo vale C4. Desde esa referencia puedes moverte por grados conjuntos igual que en cualquier otra clave.",
          },
          {
            type: "paragraph",
            text: "No necesitas memorizar todo de una sola vez. Lo eficaz es memorizar unas pocas referencias y moverte desde ellas por pasos conjuntos.",
          },
        ],
      },
      {
        title: "Armadura y alteraciones accidentales",
        blocks: [
          {
            type: "paragraph",
            text: "La armadura afecta todas las notas de ese nombre en la obra o seccion, mientras no cambie la armadura. Las alteraciones accidentales afectan a partir del punto donde aparecen y duran solo dentro del compas, salvo repeticion de la misma nota.",
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
            text: "Las lineas adicionales extienden el pentagrama hacia el registro agudo o grave. No deben leerse como casos aislados ni como dibujos sueltos: se leen usando una nota de referencia y avanzando por grados conjuntos. Esa es la forma mas segura de leer fuera del pentagrama sin perder la orientacion.",
          },
          {
            type: "paragraph",
            text: "En lectura real, casi nadie memoriza cada posicion extrema por separado. Lo normal es fijar una o dos notas de apoyo seguras y desplazarse desde ellas por lineas y espacios consecutivos. Por eso leer bien no significa adivinar rapido, sino moverse con seguridad desde referencias claras.",
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
      {
        id: "lec-1",
        text: "Puedo explicar para que sirve la clave de Sol y la de Fa.",
      },
      {
        id: "lec-2",
        text: "No ignoro armaduras ni alteraciones accidentales.",
      },
      {
        id: "lec-3",
        text: "Tengo notas de referencia claras para leer mas rapido.",
      },
    ],
    microExercises: [
      {
        prompt: "En clave de Sol, que nota esta en la segunda linea?",
        answer: "G.",
      },
      {
        prompt:
          "Si la armadura tiene Bb, como lees la nota B dentro del compas?",
        answer: "Como Bb, salvo cancelacion.",
      },
      {
        prompt:
          "Que cambia si una misma nota escrita pasa de clave de Sol a clave de Fa?",
        answer:
          "Cambia el nombre real de la nota porque cambia la referencia de lectura.",
      },
      {
        prompt: "Para que sirven las lineas adicionales?",
        answer:
          "Para extender el pentagrama y escribir notas mas agudas o mas graves sin cambiar de clave.",
      },
      {
        prompt: "Como conviene leer una nota fuera del pentagrama?",
        answer:
          "Tomando una referencia segura y avanzando por grados conjuntos.",
      },
      {
        prompt:
          "En clave de Do de alto (3a linea), que nota vale la 3a linea del pentagrama?",
        answer: "C.",
      },
      {
        prompt: "Por que existe la clave de Do si ya existen Sol y Fa?",
        answer:
          "Para escribir instrumentos de rango medio sin necesitar demasiadas lineas adicionales.",
      },
    ],
    glossary: [
      {
        term: "Pentagrama",
        definition: "Conjunto de cinco lineas donde se escriben las notas.",
      },
      {
        term: "Armadura",
        definition:
          "Alteraciones fijas colocadas al inicio que afectan a toda la seccion.",
      },
      {
        term: "Alteracion accidental",
        definition: "Signo que cambia una nota dentro del compas actual.",
      },
      {
        term: "Linea adicional",
        definition:
          "Linea corta que extiende el pentagrama para escribir notas fuera de sus cinco lineas.",
      },
      {
        term: "Nota de referencia",
        definition:
          "Nota que el lector reconoce con seguridad y usa como punto de apoyo para leer otras.",
      },
      {
        term: "Clave de Do",
        definition:
          "Clave movil cuya linea de referencia vale C4; se usa para instrumentos de rango medio como viola o cello.",
      },
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
        title: "Numero y calidad: el sistema de dos pasos",
        blocks: [
          {
            type: "paragraph",
            text: "Todo intervalo tiene dos componentes independientes que debes calcular por separado. El numero (2ª, 3ª, 5ª, etc.) indica cuantas letras musicales abarca la distancia, contando siempre tanto la nota de salida como la de llegada. La calidad (mayor, menor, justa, aumentada, disminuida) indica el tamaño exacto en semitonos comparado con un modelo de referencia. El error mas comun es mezclar ambos pasos: intentar deducir la calidad sin haber fijado primero el numero correcto.",
          },
          {
            type: "example",
            title: "Paso 1: el numero",
            lines: [
              "C a G: cuentas las letras C-D-E-F-G = 5 letras = quinta.",
              "C a E: cuentas C-D-E = 3 letras = tercera.",
              "D a B: cuentas D-E-F-G-A-B = 6 letras = sexta.",
              "IMPORTANTE: no cuentas teclas ni semitonos para el numero. Solo letras.",
            ],
          },
          {
            type: "paragraph",
            text: "Una vez que tienes el numero, pasas a la calidad. Para eso necesitas saber cuantos semitonos mide el intervalo y compararlo con el modelo base. El modelo base se toma de la escala mayor construida desde la nota inferior: si el intervalo coincide con la nota de esa escala mayor, la calidad es mayor (para 2ª, 3ª, 6ª, 7ª) o justa (para 4ª, 5ª, 8ª).",
          },
          {
            type: "example",
            title: "Paso 2: la calidad",
            lines: [
              "C a E: tercera. En C major, E es el 3er grado = 4 semitonos = 3ª mayor.",
              "C a Eb: tercera. Eb esta 1 semitono abajo del E natural = 3 semitonos = 3ª menor.",
              "C a G: quinta. En C major, G es el 5o grado = 7 semitonos = 5ª justa.",
              "C a G#: quinta. G# esta 1 semitono arriba del G natural = 8 semitonos = 5ª aumentada.",
            ],
          },
        ],
      },
      {
        title: "Tabla de referencia completa de intervalos",
        blocks: [
          {
            type: "paragraph",
            text: "La siguiente tabla muestra todos los intervalos simples con su tamaño en semitonos. Memorizar al menos los intervalos justos y mayores desde C es fundamental, porque sirven como patron de comparacion para calcular cualquier otro intervalo. Si un intervalo mayor se reduce un semitono, se vuelve menor. Si un intervalo justo se reduce, se vuelve disminuido. Si un intervalo mayor o justo se amplia, se vuelve aumentado.",
          },
          {
            type: "table",
            columns: ["Intervalo", "Semitonos", "Calidad", "Ejemplo desde C"],
            rows: [
              ["1ª justa (unisono)", "0", "Justa", "C - C"],
              ["2ª menor", "1", "Menor", "C - Db"],
              ["2ª mayor", "2", "Mayor", "C - D"],
              ["3ª menor", "3", "Menor", "C - Eb"],
              ["3ª mayor", "4", "Mayor", "C - E"],
              ["4ª justa", "5", "Justa", "C - F"],
              ["4ª aumentada / tritono", "6", "Aumentada", "C - F#"],
              ["5ª disminuida / tritono", "6", "Disminuida", "C - Gb"],
              ["5ª justa", "7", "Justa", "C - G"],
              ["5ª aumentada", "8", "Aumentada", "C - G#"],
              ["6ª menor", "8", "Menor", "C - Ab"],
              ["6ª mayor", "9", "Mayor", "C - A"],
              ["7ª menor", "10", "Menor", "C - Bb"],
              ["7ª mayor", "11", "Mayor", "C - B"],
              ["8ª justa", "12", "Justa", "C - C (octava)"],
            ],
          },
          {
            type: "paragraph",
            text: "Observa que 5ª aumentada y 6ª menor tienen el mismo numero de semitonos (8), pero no son el mismo intervalo: uno abarca 5 letras y el otro abarca 6. Esa es la razon por la que no puedes clasificar intervalos solo contando semitonos: el nombre de las notas importa.",
          },
        ],
      },
      {
        title: "Clasificacion completa de calidades",
        blocks: [
          {
            type: "paragraph",
            text: "Los intervalos se dividen en dos familias segun que calidades admiten. Los intervalos 'perfectos' (1ª, 4ª, 5ª, 8ª) se miden contra la calidad 'justa'. Los intervalos 'imperfectos' (2ª, 3ª, 6ª, 7ª) se miden contra la calidad 'mayor'. Este es el sistema completo:",
          },
          {
            type: "table",
            columns: [
              "Familia",
              "Posibles calidades (de menor a mayor tamaño)",
            ],
            rows: [
              ["Perfectos (1ª, 4ª, 5ª, 8ª)", "disminuido → justo → aumentado"],
              [
                "Imperfectos (2ª, 3ª, 6ª, 7ª)",
                "disminuido → menor → mayor → aumentado",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "Nunca existe una '5ª mayor' ni una '3ª justa'. Los intervalos perfectos no tienen calidad mayor ni menor; los imperfectos no tienen calidad justa. Mezclar estas familias es un error frecuente en examenes de ingreso.",
          },
          {
            type: "list",
            title: "Como modificar la calidad",
            items: [
              "Intervalo mayor - 1 semitono = menor.",
              "Intervalo menor - 1 semitono = disminuido.",
              "Intervalo mayor + 1 semitono = aumentado.",
              "Intervalo justo - 1 semitono = disminuido.",
              "Intervalo justo + 1 semitono = aumentado.",
            ],
          },
        ],
      },
      {
        title: "Melodicos, armonicos y conteo correcto",
        blocks: [
          {
            type: "paragraph",
            text: "Un intervalo melodico se produce cuando las dos notas suenan una despues de otra. Un intervalo armonico se produce cuando suenan al mismo tiempo. El nombre y la calidad del intervalo son identicos en ambos casos; lo que cambia es la presentacion auditiva. En dictado melodico necesitas reconocer intervalos sucesivos; en armonia escrita y analisis vertical trabajas con intervalos armonicos.",
          },
          {
            type: "paragraph",
            text: "Los intervalos melodicos pueden ser ascendentes o descendentes. En ambos casos, para nombrar el intervalo se cuentan las letras entre las dos notas de la misma manera. La direccion no cambia el nombre: C subiendo a E y C bajando a E (la E debajo) siguen siendo una tercera mayor, pero en direcciones opuestas.",
          },
          {
            type: "list",
            title: "Proceso practico para nombrar un intervalo",
            items: [
              "Escribe la nota de salida y la de llegada.",
              "Cuenta letras incluyendo ambas notas: eso da el numero.",
              "Cuenta los semitonos reales entre las dos notas.",
              "Compara ese numero de semitonos con la tabla de referencia.",
              "Asigna la calidad correcta.",
            ],
          },
        ],
      },
      {
        title: "El tritono: caso especial",
        blocks: [
          {
            type: "paragraph",
            text: "El tritono vale exactamente 6 semitonos (3 tonos enteros, de ahi su nombre). Es el unico intervalo que divide la octava exactamente a la mitad. Por eso es el intervalo mas inestable del sistema tonal y juega un papel central en la funcion de dominante.",
          },
          {
            type: "paragraph",
            text: "Lo peculiar del tritono es que puede escribirse como 4ª aumentada o como 5ª disminuida, dependiendo de los nombres de las notas. C-F# es una 4ª aumentada (C-D-E-F = 4 letras). C-Gb es una 5ª disminuida (C-D-E-F-G = 5 letras). Ambas suenan identico pero se escriben diferente. En armonia funcional, la forma de escribirlo determina como resuelve: la 4ª aumentada resuelve abriendose (las notas se alejan), la 5ª disminuida resuelve cerrandose (las notas se acercan).",
          },
          {
            type: "example",
            title: "El tritono en el V7",
            lines: [
              "En C major, G7 tiene las notas G-B-D-F.",
              "Entre B (3ª del acorde) y F (7ª del acorde) hay un tritono.",
              "B tiende a subir a C (sensible → tonica).",
              "F tiende a bajar a E (7ª → 3ª de la tonica).",
              "Esa doble atraccion es la que produce la fuerza de la cadencia V-I.",
            ],
          },
        ],
      },
      {
        title: "Inversion de intervalos",
        blocks: [
          {
            type: "paragraph",
            text: "Invertir un intervalo significa trasladar una de las dos notas a la otra octava de modo que el intervalo pase a su complemento. La regla es simple: el numero del intervalo original + el numero del intervalo invertido = 9. Una 3ª invierte a 6ª (3+6=9). Una 2ª invierte a 7ª (2+7=9). Una 4ª invierte a 5ª (4+5=9).",
          },
          {
            type: "paragraph",
            text: "Al invertir, la calidad tambien se transforma de forma predecible: mayor pasa a menor, menor pasa a mayor, aumentado pasa a disminuido, disminuido pasa a aumentado y justo permanece justo. Esto no es una regla arbitraria: refleja el hecho de que los semitonos que faltan para completar la octava determinan la calidad del intervalo invertido.",
          },
          {
            type: "table",
            columns: ["Intervalo original", "Invierte a", "Cambio de calidad"],
            rows: [
              ["2ª mayor (2 st)", "7ª menor (10 st)", "Mayor → Menor"],
              ["3ª menor (3 st)", "6ª mayor (9 st)", "Menor → Mayor"],
              ["4ª justa (5 st)", "5ª justa (7 st)", "Justa → Justa"],
              [
                "4ª aumentada (6 st)",
                "5ª disminuida (6 st)",
                "Aumentada → Disminuida",
              ],
              ["5ª justa (7 st)", "4ª justa (5 st)", "Justa → Justa"],
              ["6ª mayor (9 st)", "3ª menor (3 st)", "Mayor → Menor"],
              ["7ª mayor (11 st)", "2ª menor (1 st)", "Mayor → Menor"],
            ],
          },
          {
            type: "chips",
            title: "Regla rapida de calidad al invertir",
            items: ["Mayor ↔ Menor", "Aumentado ↔ Disminuido", "Justo ↔ Justo"],
          },
        ],
      },
      {
        title: "Consonancia y disonancia",
        blocks: [
          {
            type: "paragraph",
            text: "En teoria tonal, los intervalos se clasifican tambien por su grado de estabilidad sonora. Esta clasificacion es central para entender contrapunto, conduccion de voces y formacion de acordes.",
          },
          {
            type: "table",
            columns: ["Categoria", "Intervalos", "Efecto"],
            rows: [
              [
                "Consonancia perfecta",
                "Unisono, 5ª justa, 8ª justa",
                "Maximo reposo; las voces se funden",
              ],
              [
                "Consonancia imperfecta",
                "3ª mayor/menor, 6ª mayor/menor",
                "Estable pero con color; base de la triada",
              ],
              [
                "Disonancia suave",
                "4ª justa (en ciertos contextos)",
                "Estable entre voces internas pero disonante contra el bajo",
              ],
              [
                "Disonancia fuerte",
                "2ª mayor/menor, 7ª mayor/menor, tritono",
                "Tension que pide resolucion por grado conjunto",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "La 4ª justa es un caso especial: entre voces superiores suena consonante (por eso existe el acorde en segunda inversion), pero contra el bajo suena disonante. Es por eso que el acorde 6/4 se trata con mucho cuidado en armonia clasica. Las 3ªs y 6ªs son la base de la triada y del contrapunto a terceras, la textura mas comun en la musica tonal.",
          },
        ],
      },
      {
        title: "Intervalos compuestos",
        blocks: [
          {
            type: "paragraph",
            text: "Un intervalo compuesto es aquel que excede la octava. Se nombra sumando 7 al intervalo simple correspondiente: la 2ª + octava = 9ª, la 3ª + octava = 10ª, la 4ª + octava = 11ª, la 5ª + octava = 12ª, la 6ª + octava = 13ª. La calidad se hereda del intervalo simple: una 9ª mayor tiene la misma calidad que una 2ª mayor, solo que una octava mas arriba.",
          },
          {
            type: "table",
            columns: ["Compuesto", "Equivale a", "Semitonos", "Uso principal"],
            rows: [
              [
                "9ª mayor",
                "2ª mayor + octava",
                "14",
                "Extension de acordes de septima",
              ],
              [
                "9ª menor",
                "2ª menor + octava",
                "13",
                "Dominante alterado (7b9)",
              ],
              [
                "11ª justa",
                "4ª justa + octava",
                "17",
                "Extension en acordes menores",
              ],
              [
                "11ª aumentada",
                "4ª aumentada + octava",
                "18",
                "Extension lidia en maj7#11",
              ],
              [
                "13ª mayor",
                "6ª mayor + octava",
                "21",
                "Extension en dominantes y mayores",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "Los intervalos compuestos son fundamentales para entender la nomenclatura de acordes extendidos en jazz y armonia moderna. Cuando ves un acorde 'Dm9', el 9 se refiere a la novena mayor agregada sobre la septima. No es lo mismo que una segunda: la novena presupone que ya existe la septima debajo de ella.",
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
      {
        id: "int-1",
        text: "Puedo sacar el numero de un intervalo sin usar piano.",
      },
      { id: "int-2", text: "Puedo distinguir una 3a mayor de una 3a menor." },
      {
        id: "int-3",
        text: "Entiendo por que las formulas de acordes usan b3 y b7.",
      },
    ],
    microExercises: [
      { prompt: "Nombra el intervalo entre C y A.", answer: "Sexta mayor." },
      { prompt: "Nombra el intervalo entre E y G.", answer: "Tercera menor." },
      {
        prompt: "Que se calcula primero: numero o calidad?",
        answer: "Primero el numero.",
      },
      {
        prompt: "A que intervalo invierte una 3a mayor?",
        answer: "A una 6a menor.",
      },
      {
        prompt: "Como cambia la calidad al invertir un intervalo aumentado?",
        answer: "Pasa a disminuido.",
      },
      {
        prompt: "Que tipo de estabilidad suelen tener las 3as y 6as?",
        answer: "Consonancia imperfecta.",
      },
    ],
    glossary: [
      {
        term: "Intervalo armonico",
        definition: "Dos notas que suenan al mismo tiempo.",
      },
      {
        term: "Intervalo melodico",
        definition: "Dos notas que suenan una despues de otra.",
      },
      {
        term: "Calidad",
        definition: "Caracter exacto del intervalo respecto al modelo base.",
      },
      {
        term: "Consonancia",
        definition:
          "Intervalo de estabilidad relativa dentro del lenguaje tonal.",
      },
      {
        term: "Disonancia",
        definition: "Intervalo de tension que suele pedir resolucion.",
      },
      {
        term: "Inversion de intervalo",
        definition:
          "Transformacion por la cual un intervalo pasa a su complemento dentro de la octava.",
      },
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
        title: "Escala y tonalidad: conceptos diferentes",
        blocks: [
          {
            type: "paragraph",
            text: "Una escala es una sucesion ordenada de notas separadas por intervalos especificos. Una tonalidad es un sistema musical donde una nota funciona como centro de gravedad y organiza las tensiones y resoluciones. La escala es el material sonoro; la tonalidad es la funcion. Por eso puedes tocar una escala sin que eso signifique que estas 'en esa tonalidad': hace falta que el contexto musical establezca un centro tonal.",
          },
          {
            type: "paragraph",
            text: "Esta distincion importa porque dos escalas pueden compartir las mismas notas (como C mayor y A menor natural) y producir tonalidades completamente distintas. Lo que cambia es que nota actua como punto de reposo, que nota es la sensible, y como se comportan las tensiones. Cuando decimos 'la tonalidad de G mayor', estamos diciendo que G es el centro, que la escala mayor organizada desde G provee el material, y que las funciones tonales (tonica, dominante, predominante) se articulan alrededor de esa nota.",
          },
          {
            type: "chips",
            items: [
              "Escala = notas ordenadas por patron",
              "Tonalidad = sistema funcional con centro",
              "Dos escalas con las mismas notas pueden ser tonalidades distintas",
            ],
          },
        ],
      },
      {
        title: "Construccion de la escala mayor paso a paso",
        blocks: [
          {
            type: "paragraph",
            text: "La escala mayor se construye aplicando un patron fijo de tonos (T) y semitonos (S): T-T-S-T-T-T-S. Este patron funciona desde cualquier nota. El procedimiento es siempre el mismo: eliges una nota de partida (la tonica), y aplicas el patron nota por nota, asegurandote de usar una letra distinta para cada grado (no repites letras ni saltas letras). Esa disciplina de spelling es tan importante como las alturas reales.",
          },
          {
            type: "example",
            title: "Construccion de G major paso a paso",
            lines: [
              "Tonica: G",
              "G + T = A (2o grado)",
              "A + T = B (3er grado)",
              "B + S = C (4o grado)",
              "C + T = D (5o grado)",
              "D + T = E (6o grado)",
              "E + T = F# (7o grado: no F natural, sino F# para cumplir un Tono)",
              "F# + S = G (octava: cierra el ciclo)",
              "Resultado: G A B C D E F#",
            ],
          },
          {
            type: "example",
            title: "Construccion de Eb major paso a paso",
            lines: [
              "Tonica: Eb",
              "Eb + T = F",
              "F + T = G",
              "G + S = Ab",
              "Ab + T = Bb",
              "Bb + T = C",
              "C + T = D",
              "D + S = Eb",
              "Resultado: Eb F G Ab Bb C D",
            ],
          },
          {
            type: "paragraph",
            text: "Observa que en G major aparece un sostenido (F#) y en Eb major aparecen tres bemoles (Eb, Ab, Bb). El patron T-T-S-T-T-T-S es identico; lo que cambia son las alteraciones necesarias para mantener ese patron desde cada tonica. Esas alteraciones son exactamente las que aparecen en la armadura.",
          },
        ],
      },
      {
        title: "Las tres formas de la escala menor",
        blocks: [
          {
            type: "paragraph",
            text: "A diferencia de la escala mayor, que tiene una sola forma, la escala menor tiene tres variantes. Cada una modifica los grados 6o y/o 7o para lograr un efecto armonico o melodico distinto. No son tres escalas independientes: son tres estados del mismo sistema menor. Un compositor puede usar las tres dentro de la misma pieza, incluso dentro de la misma frase.",
          },
          {
            type: "table",
            columns: ["Forma", "Patron", "Grados modificados", "Notas en A"],
            rows: [
              ["Menor natural", "T S T T S T T", "Ninguno", "A B C D E F G"],
              [
                "Menor armonica",
                "T S T T S T+S S",
                "7o elevado",
                "A B C D E F G#",
              ],
              [
                "Menor melodica asc.",
                "T S T T T T S",
                "6o y 7o elevados",
                "A B C D E F# G#",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "La menor natural es la forma base: comparte exactamente las mismas notas que su relativa mayor (A menor natural = C mayor). Su problema funcional es que el 7o grado (G) esta a un tono de la tonica (A), no a un semitono. Eso significa que no hay sensible y la dominante es debil.",
          },
          {
            type: "paragraph",
            text: "La menor armonica resuelve ese problema elevando el 7o grado medio tono (G pasa a G#). Ahora G# esta a un semitono de A, creando una sensible fuerte y permitiendo que el acorde de dominante sea mayor (E-G#-B en lugar de E-G-B). El precio es que entre F y G# queda un intervalo de tono y medio (segunda aumentada), que suena exotico y a veces incomodo melodicamente.",
          },
          {
            type: "paragraph",
            text: "La menor melodica suaviza ese intervalo incomodo elevando tambien el 6o grado (F pasa a F#). Asi F#-G# es un tono normal. En el enfoque clasico, al descender se vuelve a la forma natural (A-G-F-E-D-C-B-A) porque ya no se necesita la sensible. En el enfoque jazz/moderno, la forma ascendente se usa en ambas direcciones.",
          },
        ],
      },
      {
        title: "Grados de la escala y sus funciones",
        blocks: [
          {
            type: "paragraph",
            text: "Cada posicion dentro de la escala recibe un nombre funcional que describe su papel en el sistema tonal. Estos nombres no son arbitrarios: reflejan la relacion de cada nota con la tonica y su tendencia de movimiento. Conocer estos nombres es esencial para entender la armonizacion y el analisis funcional.",
          },
          {
            type: "table",
            columns: ["Grado", "Nombre funcional", "Papel en el sistema tonal"],
            rows: [
              ["1o", "Tonica", "Centro de gravedad; punto de maximo reposo"],
              [
                "2o",
                "Supertonica",
                "Un grado por encima de la tonica; base del ii",
              ],
              [
                "3o",
                "Mediante",
                "Define si el caracter es mayor (3a mayor) o menor (3a menor)",
              ],
              [
                "4o",
                "Subdominante",
                "Zona de preparacion; tiende hacia la dominante",
              ],
              [
                "5o",
                "Dominante",
                "Maxima tension funcional; polo opuesto a la tonica",
              ],
              [
                "6o",
                "Superdominante",
                "Un grado por encima de la dominante; base del vi",
              ],
              [
                "7o",
                "Sensible (mayor/armo.) o Subtonica (nat.)",
                "A semitono de la tonica = sensible; a tono = subtonica",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "El 3er grado es especial porque determina el modo: si la distancia entre tonica y mediante es de 4 semitonos (3a mayor), el modo es mayor; si es de 3 semitonos (3a menor), el modo es menor. Esa sola nota cambia completamente el color de la escala.",
          },
          {
            type: "paragraph",
            text: "La distincion entre sensible y subtonica es critica: la sensible (7o grado a semitono de la tonica) genera una atraccion irresistible hacia la tonica, especialmente en contextos armonicos. La subtonica (a un tono) no tiene esa fuerza. Por eso la menor natural tiene una dominante debil: su 7o grado es subtonica, no sensible.",
          },
        ],
      },
      {
        title: "Escalas, armaduras y centro tonal",
        blocks: [
          {
            type: "paragraph",
            text: "La armadura resume que alteraciones son habituales dentro de una tonalidad. No equivale a toda la explicacion musical, pero orienta de inmediato sobre el material sonoro probable. Una armadura con un sostenido (F#) puede corresponder a G mayor o E menor, porque ambas tonalidades comparten las mismas notas y la misma armadura. El centro tonal real se confirma por otros medios: melodía, bajo, cadencias y reposo.",
          },
          {
            type: "paragraph",
            text: "El centro tonal es la nota que funciona como punto principal de reposo. Por eso dos escalas pueden compartir notas y producir sensaciones completamente distintas. La organizacion de tensiones, la presencia o ausencia de sensible, y la direccion melodica dependen de que nota actua como tonica. Determinar el centro tonal de una pieza es el primer paso del analisis armonico.",
          },
          {
            type: "example",
            title: "Como confirmar el centro tonal",
            lines: [
              "1. Mira en que nota tiende a terminar la melodia (reposo).",
              "2. Observa el bajo: suele apoyar la tonica en puntos cadenciales.",
              "3. Busca cadencias V-I: la nota de llegada es la tonica probable.",
              "4. Si la armadura tiene F# y la musica reposa en G, la tonalidad es G mayor.",
              "5. Si reposa en E con la misma armadura, la tonalidad es E menor.",
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
      {
        id: "esc-1",
        text: "Puedo escribir una escala mayor desde cualquier nota.",
      },
      {
        id: "esc-2",
        text: "Puedo comparar menor natural, armonica y melodica.",
      },
      { id: "esc-3", text: "Entiendo la diferencia entre escala y tonalidad." },
    ],
    microExercises: [
      { prompt: "Escribe D major.", answer: "D E F# G A B C#." },
      {
        prompt: "Que cambia de A natural minor a A harmonic minor?",
        answer: "Se eleva el 7o grado: G pasa a G#.",
      },
      { prompt: "Que es el 5o grado de una escala?", answer: "La dominante." },
      {
        prompt: "Que diferencia hay entre escala y tonalidad?",
        answer:
          "La escala es el material ordenado de notas; la tonalidad es el sistema funcional organizado alrededor de un centro tonal.",
      },
      {
        prompt: "Que armadura comparten G mayor y E menor?",
        answer: "Una armadura con F#.",
      },
      {
        prompt:
          "Que ocurre tradicionalmente al descender en la menor melodica?",
        answer: "Suele volver a la forma natural.",
      },
    ],
    glossary: [
      {
        term: "Tonica",
        definition: "Centro principal de la escala o tonalidad.",
      },
      {
        term: "Sensible",
        definition:
          "7o grado a semitono de la tonica; en modo mayor y menor armonico.",
      },
      {
        term: "Subtonica",
        definition:
          "7o grado cuando esta a un tono entero de la tonica; aparece en menor natural.",
      },
      {
        term: "Centro tonal",
        definition:
          "Nota o acorde que funciona como punto principal de reposo.",
      },
      {
        term: "Menor melodica",
        definition:
          "Forma de la escala menor que eleva 6o y 7o grado al ascender en el enfoque tradicional.",
      },
      {
        term: "Menor armonica",
        definition:
          "Forma de la escala menor que eleva el 7o grado para crear sensible.",
      },
      {
        term: "Patron",
        definition:
          "Secuencia fija de tonos (T) y semitonos (S) que define el caracter de una escala.",
      },
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
        title: "Escalas relativas: mismas notas, diferente centro",
        blocks: [
          {
            type: "paragraph",
            text: "Dos escalas son relativas cuando comparten exactamente las mismas notas y la misma armadura, pero tienen diferente tonica. La relativa menor de cualquier escala mayor se encuentra en el 6o grado. La relativa mayor de cualquier escala menor se encuentra en el 3er grado. Esta relacion es sistematica y funciona para todas las tonalidades.",
          },
          {
            type: "table",
            columns: ["Mayor", "Armadura", "Menor relativa"],
            rows: [
              ["C major", "0 alteraciones", "A minor"],
              ["G major", "1# (F#)", "E minor"],
              ["D major", "2# (F#, C#)", "B minor"],
              ["F major", "1b (Bb)", "D minor"],
              ["Bb major", "2b (Bb, Eb)", "G minor"],
              ["Eb major", "3b (Bb, Eb, Ab)", "C minor"],
              ["A major", "3# (F#, C#, G#)", "F# minor"],
            ],
          },
          {
            type: "paragraph",
            text: "Aunque relativas comparten las mismas notas, producen sensaciones tonales completamente dferentes. La razon es que el centro tonal cambia. En C mayor, la nota C es el punto de maximo reposo y B funciona como sensible. En A menor, la nota A es el reposo y el 7o grado (G) es subtonica, no sensible. Eso cambia radicalmente la jerarquia de tensiones, el comportamiento de las cadencias, y la direccion melodica general.",
          },
          {
            type: "example",
            title: "C major vs A minor: mismas notas, diferente funcion",
            lines: [
              "Notas compartidas: C D E F G A B",
              "En C major: C = tonica, G = dominante, B = sensible",
              "En A minor: A = tonica, E = dominante, G = subtonica (no sensible)",
              "La melodia que reposa en C suena 'cerrada' en C major",
              "La misma melodia reposando en A suena 'cerrada' en A minor",
            ],
          },
        ],
      },
      {
        title: "Escalas paralelas: misma tonica, diferente material",
        blocks: [
          {
            type: "paragraph",
            text: "Dos escalas son paralelas cuando comparten la misma tonica pero tienen notas distintas. C major y C minor empiezan en C, pero no usan las mismas alteraciones. C major tiene 0 alteraciones; C minor tiene 3 bemoles (Bb, Eb, Ab). Las diferencias principales estan en los grados 3o, 6o y 7o: en mayor son naturales, en menor son medio tono mas bajos.",
          },
          {
            type: "table",
            columns: ["Relacion", "Que comparte", "Que cambia", "Ejemplo"],
            rows: [
              ["Relativas", "Notas y armadura", "Tonica", "C major / A minor"],
              ["Paralelas", "Tonica", "Notas y armadura", "C major / C minor"],
            ],
          },
          {
            type: "paragraph",
            text: "El intercambio modal (borrowing) consiste en tomar acordes prestados de la paralela. Por ejemplo, estando en C major puedes usar el acorde de Ab (IV de C minor) como acorde 'prestado'. Este recurso es muy comun en musica popular y romantica, y produce un color especial que enriquece la armonia sin salir de la tonalidad principal. Entender la relacion entre paralelas es la base para comprender el intercambio modal.",
          },
          {
            type: "example",
            title: "Comparacion C major vs C minor",
            lines: [
              "C major: C D E F G A B (0 alteraciones)",
              "C minor: C D Eb F G Ab Bb (3 bemoles)",
              "Diferencias clave: 3o, 6o y 7o grados",
              "Acorde prestado tipico: usar Ab o Fm (de C minor) dentro de C major",
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
      {
        id: "rel-1",
        text: "Puedo sacar la menor relativa desde cualquier mayor.",
      },
      { id: "rel-2", text: "Puedo distinguir relativa y paralela sin dudar." },
      {
        id: "rel-3",
        text: "Puedo explicar por que C major y A minor comparten notas.",
      },
    ],
    microExercises: [
      { prompt: "Cual es la menor relativa de G major?", answer: "E minor." },
      {
        prompt: "C major y C minor son relativas o paralelas?",
        answer: "Paralelas.",
      },
      { prompt: "Bb major y G minor son relativas?", answer: "Si." },
      {
        prompt:
          "Si dos escalas comparten armadura pero no tonica, como se relacionan?",
        answer: "Como relativas.",
      },
      {
        prompt:
          "Por que C major y A minor no suenan iguales si usan las mismas notas?",
        answer: "Porque no tienen la misma tonica ni el mismo centro tonal.",
      },
    ],
    glossary: [
      {
        term: "Relativa",
        definition:
          "Relacion entre dos escalas que comparten notas y armadura.",
      },
      {
        term: "Paralela",
        definition: "Relacion entre dos escalas que comparten tonica.",
      },
      {
        term: "Centro tonal",
        definition:
          "Nota que organiza la jerarquia y la sensacion de reposo de una escala o tonalidad.",
      },
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
        title: "Que es una triada y como se construye",
        blocks: [
          {
            type: "paragraph",
            text: "Una triada es el acorde mas basico de la musica tonal: tres notas apiladas por terceras sobre una raiz. Las tres notas reciben nombres funcionales: raiz (o fundamental), tercera y quinta. El proceso de construccion es siempre el mismo: empiezas en la raiz, saltas una letra para llegar a la tercera, y saltas otra letra para llegar a la quinta. Despues ajustas con alteraciones segun la calidad que necesites.",
          },
          {
            type: "example",
            title: "Procedimiento paso a paso desde D",
            lines: [
              "1. Raiz: D",
              "2. Tercera: salta una letra (E) y llega a F. Pero D mayor necesita F#.",
              "3. Quinta: salta una letra (G) y llega a A. A es la quinta justa de D.",
              "4. Resultado: D-F#-A = triada de D mayor.",
              "5. Si quieres D menor: baja la tercera un semitono = D-F-A.",
            ],
          },
          {
            type: "paragraph",
            text: "Observa que primero fijas las letras correctas (D-F-A) y despues decides las alteraciones. Este orden es fundamental en teoria: la estructura por letras (spelling) es tan importante como la altura real. D-F#-A es un D mayor bien escrito. D-Gb-A suena identico pero esta mal deletreado porque Gb no es una tercera de D, es una cuarta disminuida.",
          },
        ],
      },
      {
        title: "Las cuatro calidades de triada",
        blocks: [
          {
            type: "paragraph",
            text: "Las cuatro calidades surgen de combinar dos tipos de tercera (mayor o menor) con tres tipos de quinta (justa, disminuida o aumentada). Cada combinacion produce un color sonoro distinto. En la practica, la mayor y la menor son las mas frecuentes; la disminuida aparece naturalmente en el VII grado del modo mayor; la aumentada es la menos comun en contextos diatonicos.",
          },
          {
            type: "table",
            columns: [
              "Calidad",
              "Formula",
              "Semitonos",
              "Ejemplo en C",
              "Ejemplo en E",
              "Simbolo",
            ],
            rows: [
              ["Mayor", "1 - 3 - 5", "0 - 4 - 7", "C E G", "E G# B", "C / E"],
              [
                "Menor",
                "1 - b3 - 5",
                "0 - 3 - 7",
                "C Eb G",
                "E G B",
                "Cm / Em",
              ],
              [
                "Disminuida",
                "1 - b3 - b5",
                "0 - 3 - 6",
                "C Eb Gb",
                "E G Bb",
                "Cdim (C°) / Edim",
              ],
              [
                "Aumentada",
                "1 - 3 - #5",
                "0 - 4 - 8",
                "C E G#",
                "E G# B# (=C)",
                "Caug (C+) / Eaug",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "La diferencia entre mayor y menor es un solo semitono en la tercera (4 vs 3 semitonos). La diferencia entre menor y disminuida es un solo semitono en la quinta (7 vs 6 semitonos). La aumentada sube la quinta un semitono respecto a la mayor (7 vs 8 semitonos). Por eso un solo semitono de diferencia cambia completamente el caracter del acorde.",
          },
          {
            type: "paragraph",
            text: "Es util pensar en las triadas como combinaciones de dos terceras apiladas: la mayor se construye con una 3a mayor + una 3a menor. La menor con una 3a menor + una 3a mayor. La disminuida con dos 3as menores. La aumentada con dos 3as mayores. Esta perspectiva te permite construir cualquier triada mentalmente con mucha rapidez.",
          },
          {
            type: "table",
            columns: [
              "Calidad",
              "Tercera inferior",
              "Tercera superior",
              "Resultado",
            ],
            rows: [
              [
                "Mayor",
                "3a mayor (4 st)",
                "3a menor (3 st)",
                "5a justa (7 st)",
              ],
              [
                "Menor",
                "3a menor (3 st)",
                "3a mayor (4 st)",
                "5a justa (7 st)",
              ],
              [
                "Disminuida",
                "3a menor (3 st)",
                "3a menor (3 st)",
                "5a disminuida (6 st)",
              ],
              [
                "Aumentada",
                "3a mayor (4 st)",
                "3a mayor (4 st)",
                "5a aumentada (8 st)",
              ],
            ],
          },
        ],
      },
      {
        title: "Por que suenan diferente: la acustica basica",
        blocks: [
          {
            type: "paragraph",
            text: "La triada mayor suena brillante y estable porque sus intervalos internos coinciden con los primeros armonicos naturales de una nota (la serie armonica). La tercera mayor y la quinta justa son los intervalos mas simples despues del unisono y la octava. La triada menor invierte el orden de las terceras, lo que produce un color mas oscuro y melancolico. La disminuida acumula tension por la quinta disminuida (tritono implicito). La aumentada genera un efecto de apertura e inestabilidad porque la quinta aumentada no tiene resolucion clara.",
          },
          {
            type: "paragraph",
            text: "Estas diferencias no son subjetivas: tienen una base acustica en la forma en que las frecuencias se relacionan. Aunque no necesitas estudiar acustica para un examen de ingreso, es util saber que el sistema tonal no es arbitrario: los intervalos que suenan mas estables son los que tienen relaciones de frecuencia mas simples.",
          },
        ],
      },
      {
        title: "Estado fundamental, inversiones y disposicion",
        blocks: [
          {
            type: "paragraph",
            text: "Una triada en estado fundamental tiene la raiz como nota mas grave. Cuando la tercera esta en el bajo, es primera inversion. Cuando la quinta esta en el bajo, es segunda inversion. Es crucial distinguir inversion de disposicion: la inversion dice que nota esta en el bajo; la disposicion dice como estan separadas las voces (cerrada = dentro de una octava, abierta = voces separadas por mas de una octava).",
          },
          {
            type: "table",
            columns: ["Estado", "Ejemplo en C", "Bajo", "Cifrado"],
            rows: [
              ["Fundamental", "C-E-G", "C (raiz)", "5 (o sin cifra)"],
              ["1a inversion", "E-G-C", "E (3a)", "6"],
              ["2a inversion", "G-C-E", "G (5a)", "6/4"],
            ],
          },
          {
            type: "paragraph",
            text: "Invertir un acorde no cambia su nombre ni su calidad: E-G-C sigue siendo un acorde de C mayor, solo que en primera inversion. Lo que cambia es la sonoridad y la funcion del bajo. La segunda inversion (6/4) es la mas inestable y se usa con restricciones en armonia clasica.",
          },
          {
            type: "example",
            title: "Inversion vs disposicion",
            lines: [
              "C-E-G = fundamental, disposicion cerrada.",
              "C-G-E (una octava arriba) = fundamental, disposicion abierta.",
              "E-G-C = 1a inversion, disposicion cerrada.",
              "E-C-G (una octava arriba) = 1a inversion, disposicion abierta.",
              "En todos los casos, la calidad es C mayor.",
            ],
          },
        ],
      },
      {
        title: "Spelling correcto: por que importa la escritura",
        blocks: [
          {
            type: "paragraph",
            text: "En teoria musical no basta con que las notas suenen correctas: la escritura debe reflejar la estructura real del acorde. Una triada siempre se escribe con letras alternas (saltas una): raiz, tercera (2 letras mas arriba), quinta (2 letras mas arriba). Si se rompe esa logica, la escritura no refleja la funcion y confunde el analisis.",
          },
          {
            type: "table",
            columns: ["Caso", "Escritura", "Correcto?", "Por que"],
            rows: [
              [
                "Triada mayor de C",
                "C E G",
                "Si",
                "Letras alternas: C-(D)-E-(F)-G",
              ],
              [
                "Triada aumentada de C",
                "C E G#",
                "Si",
                "Raiz-3a-5a aumentada por nombre",
              ],
              [
                "Equivalente incorrecto",
                "C E Ab",
                "No",
                "Ab es una 6a menor, no una 5a aumentada",
              ],
              [
                "Triada disminuida de B",
                "B D F",
                "Si",
                "Raiz-3a menor-5a disminuida",
              ],
              [
                "Equivalente incorrecto",
                "B D E#",
                "No",
                "E# es una 4a aumentada, no una 5a",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "La regla es: primero fija las tres letras correctas (siempre alternas en el alfabeto musical), y despues ajusta con sostenidos o bemoles para lograr la calidad deseada. Jamas reorganices las letras saltandote posiciones del alfabeto. Esta disciplina es indispensable en examenes de armonia y analisis.",
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
      {
        id: "tri-1",
        text: "Puedo escribir las cuatro calidades de triada desde cualquier raiz.",
      },
      { id: "tri-2", text: "Puedo traducir C, Cm, Cdim y C+ a notas." },
      { id: "tri-3", text: "No confundo inversion con disposicion." },
    ],
    microExercises: [
      { prompt: "Construye la triada de Eb mayor.", answer: "Eb G Bb." },
      { prompt: "Que calidad tiene B-D-F?", answer: "Disminuida." },
      { prompt: "Convierte A-C-E en simbolo.", answer: "Am." },
      {
        prompt: "Por que C-Fb-G no es una triada bien escrita?",
        answer:
          "Porque no respeta la estructura de raiz, tercera y quinta por nombre de letra.",
      },
      {
        prompt: "Que debes fijar primero al construir una triada?",
        answer: "Las letras correctas de raiz, tercera y quinta.",
      },
    ],
    glossary: [
      {
        term: "Triada",
        definition: "Acorde de tres notas construido por terceras.",
      },
      {
        term: "Estado fundamental",
        definition: "Acorde con la raiz en el bajo.",
      },
      {
        term: "Disposicion",
        definition: "Separacion entre las voces del acorde.",
      },
      {
        term: "Spelling",
        definition:
          "Escritura correcta de las notas de un acorde segun su estructura teorica.",
      },
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
            text: "Si haces esto en C major, obtienes C, Dm, Em, F, G, Am y Bdim. Ese patron no es casual: sale de la forma interna de la escala mayor.",
          },
        ],
      },
      {
        title: "Como sabes si es mayor, menor o disminuida",
        blocks: [
          {
            type: "paragraph",
            text: "Despues de construir 1-3-5, revisas la distancia entre la raiz y la tercera, y luego entre la raiz y la quinta. Esa combinacion define la calidad del acorde.",
          },
          {
            type: "table",
            columns: [
              "Acorde",
              "Notas",
              "3ra desde la raiz",
              "5ta desde la raiz",
              "Calidad",
            ],
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
            columns: [
              "Grado",
              "Calidad",
              "Funcion general",
              "Ejemplo en C major",
            ],
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
            text: "Ese patron no se memoriza como una tabla muerta. Primero lo construyes por terceras y calidad; despues lo memorizas para poder resolver mas rapido otras tonalidades.",
          },
        ],
      },
      {
        title: "Calidad y funcion no son lo mismo",
        blocks: [
          {
            type: "paragraph",
            text: "La calidad de un acorde describe su estructura interna: mayor, menor o disminuida. La funcion describe el papel que ese acorde cumple dentro de la tonalidad. Es importante no confundir ambos niveles. Dos acordes pueden tener la misma calidad y cumplir funciones distintas.",
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
            text: "Por eso armonizar no consiste solo en nombrar acordes. Tambien implica entender que algunos preparan, otros tensan y otros resuelven.",
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
      {
        prompt: "Armoniza D major por triadas.",
        answer: "D, Em, F#m, G, A, Bm, C#dim.",
      },
      { prompt: "Que calidad tiene el iii de Bb major?", answer: "Menor." },
      {
        prompt: "Por que el vii de C major es disminuido?",
        answer: "Porque B-D-F tiene 3ra menor y 5ta disminuida.",
      },
      {
        prompt:
          "Pueden dos acordes mayores tener funciones distintas en una misma tonalidad?",
        answer: "Si. Por ejemplo, IV y V en modo mayor.",
      },
      {
        prompt: "Que diferencia hay entre calidad y funcion?",
        answer:
          "La calidad describe la estructura del acorde; la funcion describe su papel dentro de la tonalidad.",
      },
    ],
    glossary: [
      {
        term: "Armonizar",
        definition: "Construir acordes diatonicos a partir de una escala.",
      },
      {
        term: "Predominante",
        definition: "Funcion que suele preparar la dominante.",
      },
      {
        term: "Dominante",
        definition: "Funcion de tension y empuje hacia la tonica.",
      },
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
            text: "Si armonizas la menor natural por triadas, mantienes el 7o grado sin elevar. Eso produce un quinto grado menor (v minuscula) y una tension dominante mas debil que en el sistema tonal clasico. El acorde Em, no E, no contiene sensible y por eso no empuja con la misma fuerza hacia la tonica.",
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
            text: "La diferencia entre v (Em) y V (E) es critica: Em no tiene G# por lo que no hay semitono a la tonica. Esa es la razon por la que en musica tonal funcional se suele preferir la menor armonica para la dominante.",
          },
        ],
      },
      {
        title: "Menor armonica",
        blocks: [
          {
            type: "paragraph",
            text: "Cuando elevas el 7o grado aparece la sensible. Eso cambia sobre todo el V y el vii°. En A harmonic minor, G pasa a G#, y el V se vuelve E mayor o E7 en contextos mas avanzados.",
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
            text: "La menor melodica tambien modifica el material armonico, aunque en cursos iniciales suele estudiarse despues de la menor natural y la armonica. En el enfoque tradicional, al ascender eleva 6o y 7o grado; al descender suele volver a la forma natural. Eso produce acordes distintos y amplia el lenguaje del modo menor.",
          },
          {
            type: "table",
            columns: ["Forma", "Cambios caracteristicos", "Resultado general"],
            rows: [
              ["Menor natural", "Sin elevar 6o ni 7o", "Dominante mas debil"],
              [
                "Menor armonica",
                "Eleva 7o",
                "Aparece sensible y dominante fuerte",
              ],
              [
                "Menor melodica",
                "Eleva 6o y 7o al ascender",
                "Amplia el color melodico y armonico",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "Para preparacion de ingreso conviene, al menos, reconocer que no existe una sola armonizacion menor universal. El resultado depende de la forma concreta de la escala que se use.",
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
      {
        id: "armm-1",
        text: "Puedo comparar el v de menor natural con el V de menor armonica.",
      },
      {
        id: "armm-2",
        text: "No doy por hecho un solo patron de armonizacion menor.",
      },
      { id: "armm-3", text: "Entiendo por que la sensible cambia la funcion." },
    ],
    microExercises: [
      {
        prompt: "En A natural minor, que calidad tiene el v?",
        answer: "Menor: Em.",
      },
      {
        prompt: "Que cambia en A harmonic minor respecto a A natural minor?",
        answer: "Se eleva G a G#.",
      },
      {
        prompt: "Por que la menor armonica acerca mas a la tonalidad clasica?",
        answer: "Porque crea sensible y fortalece la dominante.",
      },
      {
        prompt: "Existe un unico campo armonico menor fijo?",
        answer:
          "No. Cambia segun se use la menor natural, armonica o melodica.",
      },
      {
        prompt: "Que eleva la menor melodica ascendente?",
        answer: "El 6o y el 7o grado.",
      },
    ],
    glossary: [
      {
        term: "Menor armonica",
        definition: "Forma menor que eleva el 7o grado.",
      },
      {
        term: "Sensible",
        definition: "Nota a semitono de la tonica que pide resolver.",
      },
    ],
  },
  {
    chapterId: "inversiones",
    unit: "Bloque 2. Armonia inicial",
    focusBadge: "Muy probable en examen",
    title: "Inversiones",
    summary:
      "Reordenar un acorde sin cambiar su calidad, cambiando la nota que queda en el bajo.",
    objective: "Distinguir estado fundamental, inversiones y cifrados basicos.",
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
            text: "El nombre de la triada no cambia. Sigues teniendo C mayor aunque el bajo sea E o G. Lo que cambia es la funcion del bajo y la sonoridad del acorde.",
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
            text: "Ese cifrado no es decorativo. Resume que intervalos aparecen por encima del bajo. Por eso es muy usado en analisis y armonia funcional.",
          },
        ],
      },
      {
        title: "Que resume el cifrado",
        blocks: [
          {
            type: "paragraph",
            text: "El cifrado de inversiones resume que intervalos aparecen por encima del bajo. No es una etiqueta arbitraria. Sirve para leer con rapidez la disposicion funcional del acorde respecto a la nota grave.",
          },
          {
            type: "table",
            columns: [
              "Cifrado",
              "Intervalos caracteristicos sobre el bajo",
              "Ejemplo",
            ],
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
            text: "Entender esto ayuda mucho en analisis y armonia escrita, porque el bajo no solo sostiene el acorde: tambien organiza su comportamiento funcional.",
          },
        ],
      },
      {
        title: "El 6/4 cadencial: un caso especial",
        blocks: [
          {
            type: "paragraph",
            text: "La segunda inversion de triada (6/4) es el estado mas inestable porque el bajo lleva la quinta del acorde. En la practica tonal, el uso mas frecuente del 6/4 es como 6/4 cadencial, donde I6/4 aparece justo antes del V para preparar la cadencia. En ese contexto, el I6/4 no funciona como tonica: funciona como apoyo al V y sus voces resuelven por grado conjunto al V en estado fundamental.",
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
      {
        id: "inv-1",
        text: "Puedo distinguir fundamental, 1a y 2a inversion en triadas.",
      },
      { id: "inv-2", text: "Puedo leer 6, 6/4, 6/5, 4/3 y 4/2." },
      { id: "inv-3", text: "No confundo inversion con disposicion." },
    ],
    microExercises: [
      { prompt: "Que inversion es E-G-C?", answer: "1a inversion de C mayor." },
      {
        prompt: "Que bajo tiene un acorde 4/2?",
        answer: "El 7o grado del acorde, tercera inversion de septima.",
      },
      {
        prompt: "Que cifra corresponde a la 2a inversion de triada?",
        answer: "6/4.",
      },
      {
        prompt: "Que resume el cifrado 6/4?",
        answer: "Que sobre el bajo se forman principalmente una 4a y una 6a.",
      },
      {
        prompt: "Por que el cifrado no es arbitrario?",
        answer: "Porque describe los intervalos que aparecen sobre el bajo.",
      },
    ],
    glossary: [
      {
        term: "Inversion",
        definition: "Cambio de la nota del bajo dentro del mismo acorde.",
      },
      {
        term: "Cifrado",
        definition:
          "Forma breve de indicar la posicion interválica respecto al bajo.",
      },
    ],
  },
  {
    chapterId: "acordes-de-septima",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Muy probable en examen",
    title: "Acordes de septima",
    summary: "Cuatriadas construidas al agregar una septima sobre una triada.",
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
        title: "De triada a cuatriada: como se agrega la septima",
        blocks: [
          {
            type: "paragraph",
            text: "Un acorde de septima (o cuatriada) se forma cuando a una triada le agregas una tercera mas, obteniendo una cuarta nota: la septima. El proceso es identico al de las triadas: partes de la raiz, apilas la tercera, la quinta y despues la septima, todo dentro de la misma logica de letras alternas. Hay dos tipos de septima que debes distinguir: la septima mayor (a 11 semitonos de la raiz) y la septima menor (a 10 semitonos). Ademas existe la septima disminuida (9 semitonos), que aparece solo en el acorde dim7.",
          },
          {
            type: "example",
            title: "Construccion de Cmaj7 paso a paso",
            lines: [
              "1. Triada base: C mayor = C-E-G",
              "2. Septima: la siguiente tercera apilada es B (C-D-E-F-G-A-B = 7 letras)",
              "3. C a B = 11 semitonos = septima mayor",
              "4. Resultado: C-E-G-B = Cmaj7",
            ],
          },
          {
            type: "example",
            title: "Construccion de C7 (dominante) paso a paso",
            lines: [
              "1. Triada base: C mayor = C-E-G",
              "2. Septima: la septima por letra es B, pero la bajamos un semitono: Bb",
              "3. C a Bb = 10 semitonos = septima menor",
              "4. Resultado: C-E-G-Bb = C7",
              "5. Observa: la triada es mayor pero la septima es menor. Esa combinacion es unica del acorde dominante.",
            ],
          },
        ],
      },
      {
        title: "Las cinco calidades principales de septima",
        blocks: [
          {
            type: "paragraph",
            text: "Existen cinco calidades principales de acordes de septima. Cada una combina un tipo de triada con un tipo de septima. Memorizarlas es indispensable porque aparecen constantemente en armonia, analisis y examen de ingreso.",
          },
          {
            type: "table",
            columns: [
              "Simbolo",
              "Formula",
              "Semitonos",
              "Triada base",
              "Septima",
              "Ejemplo en C",
            ],
            rows: [
              [
                "maj7",
                "1-3-5-7",
                "0-4-7-11",
                "Mayor",
                "Mayor (11 st)",
                "C E G B",
              ],
              [
                "m7",
                "1-b3-5-b7",
                "0-3-7-10",
                "Menor",
                "Menor (10 st)",
                "C Eb G Bb",
              ],
              [
                "7 (dom.)",
                "1-3-5-b7",
                "0-4-7-10",
                "Mayor",
                "Menor (10 st)",
                "C E G Bb",
              ],
              [
                "m7b5 (ø)",
                "1-b3-b5-b7",
                "0-3-6-10",
                "Disminuida",
                "Menor (10 st)",
                "C Eb Gb Bb",
              ],
              [
                "dim7 (°7)",
                "1-b3-b5-bb7",
                "0-3-6-9",
                "Disminuida",
                "Disminuida (9 st)",
                "C Eb Gb Bbb (=A)",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "La confusion mas peligrosa es entre maj7 y 7. Ambos tienen triada mayor como base, pero la septima es diferente: maj7 lleva septima mayor (B natural en C), mientras que 7 (dominante) lleva septima menor (Bb en C). Un truco practico: si la septima esta a un semitono de la octava, es mayor (maj7). Si esta a un tono de la octava, es menor (7). Esta diferencia de un solo semitono cambia completamente la funcion del acorde.",
          },
          {
            type: "paragraph",
            text: "Otro error comun es confundir m7b5 con dim7. Ambos tienen triada disminuida como base, pero el tipo de septima es distinto: m7b5 tiene septima menor (10 semitonos), dim7 tiene septima disminuida (9 semitonos). m7b5 aparece naturalmente en el VII de la escala mayor. dim7 aparece en el vii de la menor armonica y tiene la particularidad de estar formado por tres terceras menores iguales, lo que lo hace simetricamente divisible.",
          },
        ],
      },
      {
        title: "Puente entre triada y septima",
        blocks: [
          {
            type: "paragraph",
            text: "Cada acorde de septima puede entenderse como una triada a la que se le añade una septima especifica. Pensarlo asi facilita mucho la construccion, porque primero reconoces la triada y despues determinas el tipo de septima.",
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
            text: "En lenguaje hablado, algunas personas dicen max7 al referirse a maj7, pero la escritura estandar en simbolos es maj7. Conviene acostumbrarse desde el principio a esa grafia.",
          },
        ],
      },
      {
        title: "Resolucion tipica de cada tipo",
        blocks: [
          {
            type: "paragraph",
            text: "Construir una septima es solo la mitad del trabajo. La otra mitad es saber como resuelve. En el sistema tonal, la septima de un acorde tiende a bajar por grado conjunto; la tercera del dominante tiende a subir hacia la tonica. Esos movimientos no son arbitrarios: reflejan la atraccion entre notas a semitono.",
          },
          {
            type: "table",
            columns: ["Acorde", "Contexto tipico", "Resolucion habitual"],
            rows: [
              [
                "V7 (G7 en C)",
                "Dominante → tonica",
                "La septima (F) baja a E; la 3a (B) sube a C",
              ],
              ["m7b5", "Semidisminuido → dominante", "iiø7 → V en menor"],
              [
                "dim7",
                "Leading-tone chord",
                "Resuelve a I o i por semitono en varias voces",
              ],
              ["maj7", "Tonica estable", "Generalmente no necesita resolver"],
              [
                "m7",
                "Predominante o tonica",
                "ii7 suele ir a V; i7 queda en reposo",
              ],
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
            text: "Memorizar solo la construccion sin la resolucion es perder la mitad de la informacion funcional. En armonia escrita, mover mal estas voces produce errores facilmente detectables.",
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
      {
        id: "sept-1",
        text: "Puedo construir las cinco calidades principales de septima.",
      },
      { id: "sept-2", text: "Puedo distinguir 7 de maj7." },
      { id: "sept-3", text: "No confundo m7b5 con dim7." },
    ],
    microExercises: [
      { prompt: "Escribe D7.", answer: "D F# A C." },
      { prompt: "Escribe Cmaj7.", answer: "C E G B." },
      { prompt: "Que calidad es B D F A?", answer: "Bm7b5 o semidisminuido." },
      {
        prompt: "Que diferencia estructural hay entre maj7 y 7?",
        answer:
          "Ambos tienen triada mayor, pero maj7 lleva 7a mayor y 7 lleva 7a menor.",
      },
      {
        prompt: "De que triada parte un m7b5?",
        answer: "De una triada disminuida.",
      },
    ],
    glossary: [
      {
        term: "Cuatriada",
        definition: "Acorde de cuatro notas construido por terceras.",
      },
      { term: "Dominante 7", definition: "Acorde mayor con septima menor." },
      { term: "Semidisminuido", definition: "Acorde m7b5." },
      {
        term: "Septima disminuida",
        definition:
          "Septima rebajada un semitono extra respecto a la septima menor; aparece en el acorde dim7.",
      },
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
    prerequisites: [
      "escalas-mayores-menores",
      "triadas",
      "acordes-de-septima",
      "armonizacion-mayor",
    ],
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
            text: "El grado dice desde que nota empiezas dentro de la escala. La calidad dice que tipo de tercera, quinta y septima aparecen. El simbolo resume ambas cosas en una sola etiqueta musical.",
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
            text: "Al usar la menor armonica como base, el V7 aparece naturalmente sobre el quinto grado. Eso produce E7 en A menor armonico (E G# B D), que es el dominante fuerte mas caracteristico del modo menor tonal. El vii°7 tambien cambia respecto a la natural.",
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
            text: "El V7 de la menor armonica (E7 en A menor) es el acorde mas importante del modo menor tonal. Sin el, la dominante es debil. Por eso cuando ves un V7 o un vii°7 en un contexto menor, estas viendo elementos de la menor armonica, aunque el compositor no lo diga explicitamente.",
          },
        ],
      },
      {
        title: "Menor natural y funcion tonal",
        blocks: [
          {
            type: "paragraph",
            text: "El patron de septimas en menor natural sirve como base diatonica y como punto de partida teorico. Sin embargo, en armonia tonal funcional el modo menor suele incorporar tambien la menor armonica para reforzar la dominante y la sensible. Por eso no conviene pensar que el comportamiento real del modo menor se agota en la forma natural.",
          },
          {
            type: "paragraph",
            text: "En otras palabras: la menor natural explica un campo armonico valido, pero la practica tonal clasica a menudo modifica el 7o grado para fortalecer la direccion hacia la tonica.",
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
      {
        id: "camp-1",
        text: "Puedo explicar por que G7 es dominante en C major.",
      },
      { id: "camp-2", text: "Puedo distinguir maj7, m7, 7 y m7b5." },
      {
        id: "camp-3",
        text: "Puedo escribir el patron de septimas en major y natural minor.",
      },
    ],
    microExercises: [
      { prompt: "Escribe el V7 de C major.", answer: "G7 = G B D F." },
      {
        prompt: "Que calidad tiene el vii de C major con septima?",
        answer: "m7b5 o semidisminuido.",
      },
      {
        prompt: "En A natural minor, que grado con septima es G B D F?",
        answer: "VII7.",
      },
      {
        prompt:
          "El campo armonico de menor natural basta por si solo para explicar toda la tonalidad menor funcional?",
        answer:
          "No. Con frecuencia tambien interviene la menor armonica para reforzar la dominante.",
      },
      {
        prompt: "Por que se modifica a veces el 7o grado en menor?",
        answer:
          "Para crear sensible y fortalecer la resolucion hacia la tonica.",
      },
      {
        prompt: "Que acorde es E G# B D en A menor armonico?",
        answer: "E7, el V7 de A menor armonico.",
      },
      {
        prompt: "Que calidad tiene el vii°7 en menor armonico?",
        answer: "dim7 (disminuido completo).",
      },
    ],
    glossary: [
      {
        term: "Campo armonico",
        definition: "Conjunto de acordes diatonicos que salen de una escala.",
      },
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
        title: "El sistema de tres funciones",
        blocks: [
          {
            type: "paragraph",
            text: "La armonia tonal se organiza en tres grandes funciones: tonica, predominante (o subdominante) y dominante. Esta no es una clasificacion arbitraria: refleja la jerarquia de tensiones que estructura el lenguaje musical tonal. La tonica es el punto de reposo; la dominante es el punto de maxima tension que exige resolucion; la predominante es la zona que prepara y dirige el movimiento hacia la dominante.",
          },
          {
            type: "paragraph",
            text: "La fuerza de este sistema radica en la direccion: el flujo natural es T (tonica) → PD (predominante) → D (dominante) → T (tonica). Este ciclo no es una ley inviolable, pero si el patron mas comun y el que el oido espera en contextos tonales. Cuando un compositor lo sigue, la musica suena 'logica'; cuando lo rompe intencionalmente (como en una cadencia de engaño), la sorpresa tiene efecto precisamente porque viola esa expectativa.",
          },
          {
            type: "table",
            columns: [
              "Zona funcional",
              "Grados principales",
              "Grados sustitutos",
              "Sensacion",
            ],
            rows: [
              [
                "Tonica (T)",
                "I",
                "vi, iii (parcialmente)",
                "Reposo, estabilidad, llegada",
              ],
              [
                "Predominante (PD)",
                "IV, ii",
                "vi (a veces)",
                "Preparacion, movimiento hacia D",
              ],
              [
                "Dominante (D)",
                "V",
                "vii°",
                "Tension maxima, necesidad de resolver",
              ],
            ],
          },
        ],
      },
      {
        title: "Por que cada grado cumple su funcion",
        blocks: [
          {
            type: "paragraph",
            text: "I es tonica porque contiene la nota fundamental de la tonalidad y produce la maxima estabilidad. vi funciona como sustituto de I porque comparte dos notas con el acorde de tonica (en C major: Am tiene A-C-E, dos notas comunes con C-E-G). iii es el miembro mas ambiguo: en C major, Em tiene E-G-B, comparte dos notas con I pero tambien con V. Por eso iii puede funcionar como tonica debil o como dominante sin sensible, dependiendo del contexto.",
          },
          {
            type: "paragraph",
            text: "IV y ii son predominantes porque preparan armonicamente la llegada de V. IV suena como una expansion directa desde I (solo un grado mas arriba). ii es el predominante mas fuerte porque contiene la cuarta de la escala (nota fundamental de IV) y al moverse a V produce un movimiento de bajo por quinta descendente (D → G en C major), que es el movimiento de bajo mas poderoso en armonia tonal.",
          },
          {
            type: "paragraph",
            text: "V y vii° son dominantes porque ambos contienen la sensible (7o grado de la escala). La sensible esta a semitono de la tonica y genera una atraccion casi irresistible hacia ella. V7 ademas contiene un tritono entre la sensible y la septima (B-F en G7), lo que duplica la tension. vii° contiene ese mismo tritono como parte de su estructura interna, por eso puede sustituir a V: comparte el mecanismo de tension.",
          },
          {
            type: "table",
            columns: [
              "Grado en C major",
              "Notas",
              "Notas comunes con I (C-E-G)",
              "Funcion",
            ],
            rows: [
              ["I: C", "C E G", "3 de 3", "Tonica principal"],
              ["ii: Dm", "D F A", "0 de 3", "Predominante fuerte"],
              ["iii: Em", "E G B", "2 de 3", "Tonica debil / ambiguo"],
              ["IV: F", "F A C", "1 de 3", "Predominante"],
              ["V: G", "G B D", "0 de 3", "Dominante"],
              ["vi: Am", "A C E", "2 de 3", "Tonica sustituta"],
              ["vii°: Bdim", "B D F", "0 de 3", "Dominante sin raiz"],
            ],
          },
        ],
      },
      {
        title: "La sensible como motor de la resolucion",
        blocks: [
          {
            type: "paragraph",
            text: "La sensible es el 7o grado cuando esta a un semitono de la tonica (B en C major).  Su poder de atraccion es la fuerza central del sistema tonal. Cuando aparece en el acorde de V, la tension se concentra entre la sensible (que quiere subir a la tonica) y la septima del acorde dominante (que quiere bajar al tercer grado). Esa doble atraccion del tritono es el mecanismo que hace que V7 → I sea la cadencia mas poderosa de la musica tonal.",
          },
          {
            type: "example",
            title: "Resolucion del tritono en C major",
            lines: [
              "G7 = G-B-D-F",
              "B (sensible) → C (tonica): sube por semitono",
              "F (7a del acorde) → E (3a de la tonica): baja por semitono",
              "El tritono B-F (6 semitonos) se resuelve contrayendose a C-E (4 semitonos)",
              "Esa contraccion es la resolucion obligada del tritono en modo mayor",
            ],
          },
          {
            type: "paragraph",
            text: "Por esta razon, en el modo menor natural (donde el 7o grado es subtonica, no sensible), la dominante es debil: no tiene esa fuerza de semitono. Es por eso que la menor armonica eleva el 7o grado: para crear la sensible que el modo menor natural no tiene.",
          },
        ],
      },
      {
        title: "El flujo funcional normativo",
        blocks: [
          {
            type: "paragraph",
            text: "El movimiento funcional mas comun en armonia tonal sigue el patron T → PD → D → T. Este flujo puede tomar muchas formas concretas, pero la direccionalidad es siempre la misma: desde la estabilidad hacia la tension y de regreso a la estabilidad.",
          },
          {
            type: "example",
            title: "Progresiones que siguen el flujo normativo",
            lines: [
              "I - IV - V - I = T - PD - D - T (basica)",
              "I - ii - V7 - I = T - PD - D - T (ii como predominante fuerte)",
              "I - vi - ii - V7 - I = T - T(sust) - PD - D - T (inicio ampliado)",
              "I - IV - ii - V7 - I = T - PD - PD - D - T (doble preparacion)",
            ],
          },
          {
            type: "paragraph",
            text: "Lo importante es notar el patron: la musica tonal raramente salta de tonica directamente a tonica. Casi siempre pasa por predominante y dominante. Y la dominante casi nunca va a predominante: el flujo retrogrado (D → PD) suena antinatural. Cuando ocurre (como V → IV), suele ser un efecto especial, no la norma.",
          },
          {
            type: "table",
            columns: ["Movimiento", "Frecuencia", "Comentario"],
            rows: [
              ["T → PD", "Muy comun", "I → IV, I → ii"],
              ["PD → D", "Muy comun", "IV → V, ii → V"],
              ["D → T", "Esperado", "V → I (cadencia autentica)"],
              [
                "D → PD (retrogrado)",
                "Raro",
                "V → IV suena fuera de lo normal",
              ],
              ["T → D (salto)", "Posible", "I → V omite la preparacion"],
            ],
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
      {
        id: "fun-3",
        text: "No miro solo el nombre del acorde, tambien su papel tonal.",
      },
    ],
    microExercises: [
      {
        prompt: "Que funcion cumple ii en una tonalidad mayor?",
        answer: "Predominante.",
      },
      { prompt: "Que zona funcional representa V?", answer: "Dominante." },
      {
        prompt: "Por que vii° empuja hacia I?",
        answer: "Porque contiene la sensible y estructura de fuerte tension.",
      },
      {
        prompt:
          "Que progresion resume con claridad tonica, predominante, dominante y tonica?",
        answer: "I - ii - V - I.",
      },
      {
        prompt: "vi tiene exactamente el mismo peso estructural que I?",
        answer:
          "No. Puede pertenecer a zona tonica, pero no tiene la misma estabilidad central que I.",
      },
    ],
    glossary: [
      {
        term: "Funcion tonal",
        definition: "Papel que cumple un acorde dentro de la tonalidad.",
      },
      {
        term: "Predominante",
        definition: "Zona que prepara la llegada de la dominante.",
      },
    ],
  },
  {
    chapterId: "cadencias-basicas",
    unit: "Bloque 3. Armonia preuniversitaria",
    focusBadge: "Ampliacion util",
    title: "Cadencias basicas",
    summary: "Formulas de cierre o pausa que organizan el discurso tonal.",
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
        title: "Las cuatro cadencias fundamentales",
        blocks: [
          {
            type: "paragraph",
            text: "Las cadencias son los puntos de articulacion mas importantes de la musica tonal. Funcionan como la puntuacion del lenguaje: un punto final (cadencia autentica), una coma (semicadencia), una sorpresa (cadencia de engano) o un cierre suave (plagal). Reconocerlas es indispensable para analizar la estructura de cualquier pieza.",
          },
          {
            type: "table",
            columns: ["Cadencia", "Formula", "Efecto", "Analogia"],
            rows: [
              [
                "Autentica",
                "V → I",
                "Cierre firme y conclusivo",
                "Punto final",
              ],
              ["Plagal", "IV → I", "Cierre suave, confirmatorio", "Amen"],
              [
                "Semicadencia",
                "x → V",
                "Pausa abierta; la frase queda suspendida",
                "Coma o punto y coma",
              ],
              [
                "De engano",
                "V → vi",
                "Cierre evitado; sorpresa armonica",
                "Puntos suspensivos",
              ],
            ],
          },
        ],
      },
      {
        title: "Cadencia autentica: perfecta e imperfecta",
        blocks: [
          {
            type: "paragraph",
            text: "La cadencia autentica (V → I) es el cierre mas fuerte. Pero no toda cadencia autentica tiene la misma fuerza. La teoria distingue entre cadencia autentica perfecta (CAP) y cadencia autentica imperfecta (CAI) segun tres condiciones que deben cumplirse para la perfecta:",
          },
          {
            type: "list",
            title: "Condiciones para la cadencia autentica perfecta (CAP)",
            items: [
              "V y I estan ambos en estado fundamental (raiz en el bajo).",
              "La voz superior (soprano) llega a la tonica (1er grado) en el acorde final.",
              "Ambos acordes ocurren en posiciones metricas adecuadas (V en tiempo debil o semifuerte, I en tiempo fuerte).",
            ],
          },
          {
            type: "paragraph",
            text: "Si alguna de estas condiciones falla (por ejemplo, el V esta invertido, o la soprano termina en la 3a o 5a), la cadencia es imperfecta (CAI). La CAI cierra la frase pero deja una sensacion de continuidad menor que la CAP.",
          },
          {
            type: "table",
            columns: ["Caso", "V", "I", "Soprano en I", "Tipo"],
            rows: [
              [
                "Perfecto",
                "G (fund.)",
                "C (fund.)",
                "C (tonica)",
                "CAP",
              ],
              [
                "Soprano en 3a",
                "G (fund.)",
                "C (fund.)",
                "E (3a)",
                "CAI",
              ],
              [
                "V invertido",
                "G/B (6)",
                "C (fund.)",
                "C (tonica)",
                "CAI",
              ],
            ],
          },
        ],
      },
      {
        title: "Semicadencia y Cadencia Frigia",
        blocks: [
          {
            type: "paragraph",
            text: "La semicadencia es una pausa sobre el acorde de dominante (V). Es una interrupcion temporal del discurso que genera expectativa de resolucion. Cualquier acorde puede preceder al V, pero los mas comunes son I, ii, IV o vi.",
          },
          {
            type: "paragraph",
            text: "Un tipo especial de semicadencia en modo menor es la Cadencia Frigia. Ocurre cuando el enlace es iv6 → V. Se llama asi porque el bajo desciende por semitono (de la sexta del iv a la fundamental del V), imitando el movimiento cadencial del modo frigio (fa → mi).",
          },
          {
            type: "example",
            title: "Ejemplo de Cadencia Frigia en A minor",
            lines: [
              "Acordes: Dm/F (iv6) → E (V)",
              "Bajo: F (fa) → E (mi)",
              "Contexto: Muy comun en el periodo barroco como final de movimientos lentos.",
            ],
          },
        ],
      },
      {
        title: "Cadencia de Engaño y Plagal",
        blocks: [
          {
            type: "paragraph",
            text: "La cadencia de engano (V → vi) evita la resolucion esperada. El oido espera el I, pero recibe el vi. Esto prolonga la frase y permite al compositor expandir la seccion antes del cierre definitivo.",
          },
          {
            type: "paragraph",
            text: "La cadencia plagal (IV → I) tiene un caracter mas estatico y solemne. A menudo se usa como un 'post-scriptum' despues de una cadencia autentica perfecta, reforzando la llegada a la tonica sin la tension del tritono de la dominante.",
          },
          {
            type: "chips",
            title: "Resumen de funciones en cadencias",
            items: [
              "Conclusivas: CAP, CAI, Plagal",
              "Suspensivas: Semicadencia, Frigia",
              "Evitativas: Engaño (V-vi), V-IV",
            ],
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
      {
        id: "cad-2",
        text: "Puedo explicar si una cadencia cierra o suspende.",
      },
      { id: "cad-3", text: "Relaciono cadencia con funcion tonal." },
      {
        id: "cad-4",
        text: "Puedo explicar por que V-vi se llama cadencia de engano.",
      },
    ],
    microExercises: [
      {
        prompt: "Que tipo de cadencia es G-C en C major?",
        answer: "Autentica.",
      },
      { prompt: "Que tipo de cadencia es F-C en C major?", answer: "Plagal." },
      {
        prompt: "Que produce V-vi?",
        answer: "Cadencia de engano o interrumpida.",
      },
      {
        prompt: "Todo V-I produce exactamente el mismo grado de cierre?",
        answer:
          "No. Puede haber diferencias de fuerza cadencial segun el contexto y la disposicion.",
      },
      {
        prompt: "Que relacion tienen las cadencias con el fraseo?",
        answer:
          "Ayudan a organizar cierres, pausas y articulacion estructural de la frase.",
      },
      {
        prompt: "Por que se llama cadencia de engano?",
        answer:
          "Porque el oido espera que V resuelva en I pero resuelve en vi, produciendo sorpresa.",
      },
    ],
    glossary: [
      {
        term: "Cadencia",
        definition: "Formula de cierre o pausa dentro de una frase.",
      },
      {
        term: "Cadencia de engano",
        definition:
          "Cadencia donde V evita resolver en I y va a vi en su lugar; tambien llamada interrumpida o deceptiva.",
      },
      {
        term: "Semicadencia",
        definition: "Pausa sobre el V que deja la frase abierta.",
      },
      {
        term: "Autentica perfecta",
        definition:
          "V-I con ambos acordes en estado fundamental y la tonica en la voz superior.",
      },
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
    prerequisites: [
      "funciones-tonales",
      "cadencias-basicas",
      "campo-armonico-septimas",
    ],
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
        title: "Pasos para el Analisis Armonico",
        blocks: [
          {
            type: "paragraph",
            text: "El analisis no es solo nombrar acordes aislados, es entender su relacion en el tiempo. Sigue esta guia paso a paso para analizar cualquier pasaje tonal.",
          },
          {
            type: "list",
            title: "Guia Paso a Paso",
            items: [
              "Identifica la Armadura y el Centro Tonal: ¿En que tonalidad estamos? ¿Es mayor o menor?",
              "Segmenta el Pasaje: Busca donde cambian los acordes (ritmo armonico).",
              "Identifica la Nota del Bajo: Es vital para saber la inversion (fundamental, 6, 6/4).",
              "Cifra el Acorde con Numeros Romanos: Indica el grado y la calidad (I, ii, iii, etc.).",
              "Analiza las Funciones Tonales: Agrupa los acordes en Tonica, Predominante o Dominante.",
              "Ubica las Cadencias: Identifica los puntos de reposo y su fuerza conclusiva.",
            ],
          },
        ],
      },
      {
        title: "Cifrado Romano Detallado",
        blocks: [
          {
            type: "table",
            columns: ["Grado", "Calidad (Mayor)", "Calidad (Menor)", "Simbolo"],
            rows: [
              ["I", "Mayor", "Menor", "I / i"],
              ["II", "Menor", "Disminuido", "ii / ii°"],
              ["III", "Menor", "Mayor (o Aum.)", "iii / III"],
              ["IV", "Mayor", "Menor", "IV / iv"],
              ["V", "Mayor", "Mayor", "V"],
              ["VI", "Menor", "Mayor", "vi / VI"],
              ["VII", "Disminuido", "Disminuido", "vii°"],
            ],
          },
          {
            type: "chips",
            title: "Cifrado de Inversiones",
            items: [
              "Estado Fundamental: Sin numero (o 5/3)",
              "Primera Inversion: 6",
              "Segunda Inversion: 6/4",
              "Septima (Fund.): 7",
              "Septima (1a inv): 6/5",
              "Septima (2a inv): 4/3",
              "Septima (3a inv): 4/2 (o 2)",
            ],
          },
        ],
      },
      {
        title: "Ejemplo de Analisis Integrado",
        blocks: [
          {
            type: "example",
            title: "Analisis de una Progresion en G Major",
            lines: [
              "Compas 1: G (I) -> C (IV) [Tonica a Predominante]",
              "Compas 2: D7 (V7) -> G (I) [Dominante a Tonica]",
              "Analisis Funcional: T - P - D - T",
              "Cadencia: Cadencia Autentica Perfecta (CAP)",
            ],
          },
          {
            type: "paragraph",
            text: "Al analizar, fijate siempre en las notas de paso o bordaduras que no pertenecen al acorde. No todo lo que suena es una nota estructural.",
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
      {
        id: "ana-1",
        text: "Puedo convertir una progresion sencilla a numeros romanos.",
      },
      { id: "ana-2", text: "Puedo ubicar funcion tonal basica." },
      { id: "ana-3", text: "Puedo reconocer un cierre elemental." },
    ],
    microExercises: [
      {
        prompt: "Analiza G - C en C major.",
        answer: "V - I, cadencia autentica.",
      },
      { prompt: "En C major, que funcion cumple Dm?", answer: "Predominante." },
      {
        prompt: "Cual seria el analisis de C - Am - Dm - G - C?",
        answer: "I - vi - ii - V - I.",
      },
      {
        prompt:
          "Cual es el primer paso serio antes de asignar numeros romanos?",
        answer: "Definir la tonalidad.",
      },
      {
        prompt: "Si ves Am - Dm - E - Am en A menor, cual es la funcion de E?",
        answer: "Dominante.",
      },
    ],
    glossary: [
      {
        term: "Analisis armonico",
        definition:
          "Lectura funcional de una progresion dentro de una tonalidad.",
      },
      {
        term: "Numero romano",
        definition: "Forma de representar grados armonicos.",
      },
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
            text: "Las figuras indican cuanto dura cada nota de forma relativa. Las duraciones no son absolutas en segundos: dependen del tempo. Sin embargo, las relaciones entre ellas son fijas.",
          },
          {
            type: "table",
            columns: [
              "Figura",
              "Equivalencia relativa",
              "Nombre en compas de 4/4",
            ],
            rows: [
              ["Redonda", "4 negras", "Dura 4 tiempos"],
              ["Blanca", "2 negras", "Dura 2 tiempos"],
              ["Negra", "1 negra", "Dura 1 tiempo"],
              ["Corchea", "1/2 negra", "Dura medio tiempo"],
              ["Semicorchea", "1/4 negra", "Dura un cuarto de tiempo"],
              ["Fusa", "1/8 negra", "Dura un octavo de tiempo"],
              ["Semifusa", "1/16 negra", "Dura un dieciseisavo de tiempo"],
            ],
          },
          {
            type: "paragraph",
            text: "El punto de aumentacion agrega la mitad del valor de la figura. Una blanca con punto equivale a 3 negras. Ese punto es muy frecuente en compas compuesto. El doble punto agrega la mitad de la mitad: una negra con doble punto vale 1 + 1/2 + 1/4 = 1.75 tiempos.",
          },
          {
            type: "table",
            title: "Figuras con punto de aumentacion",
            columns: ["Figura con punto", "Equivalencia", "Uso comun"],
            rows: [
              ["Blanca con punto", "3 negras (3 tiempos)", "Llena un compas de 3/4"],
              ["Negra con punto", "1.5 negras (1.5 tiempos)", "Unidad de tiempo en compas compuesto (6/8, 9/8, 12/8)"],
              ["Corchea con punto", "3/4 de negra", "Frecuente en ritmos con puntillo + semicorchea"],
            ],
          },
          {
            type: "paragraph",
            text: "Cada figura tiene un silencio equivalente con la misma duracion. El silencio de redonda se escribe debajo de la 4a linea, el de blanca encima de la 3a linea. Reconocer los silencios es tan importante como reconocer las figuras.",
          },
        ],
      },
      {
        title: "Compas simple y compuesto",
        blocks: [
          {
            type: "paragraph",
            text: "El compas se escribe como fraccion. El numero superior dice cuantos tiempos hay por compas. El inferior dice que figura vale un tiempo. En compas simple el tiempo se divide en 2; en compuesto se divide en 3.",
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
              [
                "Compuesto cuaternario",
                "12/8",
                "Cada tiempo = 3 subdivisiones",
              ],
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
        title: "Subdivision binaria vs ternaria",
        blocks: [
          {
            type: "paragraph",
            text: "La diferencia fundamental entre compas simple y compuesto es como se divide cada tiempo. En subdivision binaria cada tiempo se parte en 2 (corcheas en 4/4). En subdivision ternaria cada tiempo se parte en 3 (corcheas en 6/8). Esa diferencia cambia completamente la sensacion ritmica aunque el numero de acentos por compas sea igual.",
          },
          {
            type: "table",
            columns: ["Caracteristica", "Binaria (simple)", "Ternaria (compuesto)"],
            rows: [
              ["Division del tiempo", "2 partes iguales", "3 partes iguales"],
              ["Figura del tiempo", "Negra (en 2/4, 3/4, 4/4)", "Negra con punto (en 6/8, 9/8, 12/8)"],
              ["Subdivision tipica", "Corcheas en pares", "Corcheas en grupos de 3"],
              ["Sensacion", "Marcha, rock, pop", "Vals, jiga, blues shuffle"],
              ["Ejemplo clasico", "4/4 = 4 negras por compas", "6/8 = 2 negras con punto por compas"],
            ],
          },
          {
            type: "example",
            title: "3/4 vs 6/8: mismas corcheas, distinto acento",
            lines: [
              "3/4: | NEG neg neg | = 3 tiempos, subdivision binaria",
              "6/8: | neg.con.punto neg.con.punto | = 2 tiempos, subdivision ternaria",
              "Ambos tienen 6 corcheas por compas, pero los acentos caen diferente",
              "3/4 acentua cada 2 corcheas (1-2-3-4-5-6 → 1 3 5)",
              "6/8 acentua cada 3 corcheas (1-2-3-4-5-6 → 1 4)",
            ],
          },
        ],
      },
      {
        title: "Compases de amalgama",
        blocks: [
          {
            type: "paragraph",
            text: "Los compases de amalgama combinan grupos de tiempos desiguales. En lugar de tener todos los tiempos con la misma duracion, mezclan grupos de 2 y de 3. Son comunes en musica folklorica, progresiva y contemporanea.",
          },
          {
            type: "table",
            columns: ["Compas", "Agrupacion", "Tiempos", "Ejemplo de genero"],
            rows: [
              ["5/8", "3+2 o 2+3", "2 tiempos desiguales", "Musica folklorica balcanica, jazz"],
              ["7/8", "3+2+2 o 2+2+3", "3 tiempos desiguales", "Prog rock (Money de Pink Floyd = 7/4)"],
              ["5/4", "3+2 o 2+3", "2 tiempos desiguales", "Take Five de Brubeck"],
              ["11/8", "3+3+3+2 u otras", "Combinaciones variadas", "Musica contemporanea"],
            ],
          },
          {
            type: "paragraph",
            text: "Para leer un compas de amalgama, primero identifica la agrupacion (suele estar indicada con barras de agrupacion o acentos). Luego cuenta los pulsos internos. La clave es sentir los grupos, no los pulsos individuales.",
          },
        ],
      },
      {
        title: "Anacrusa",
        blocks: [
          {
            type: "paragraph",
            text: "La anacrusa es una nota o grupo de notas que precede al primer tiempo fuerte del primer compas completo. No ocupa un compas entero: es un compas incompleto al inicio. Muchas melodias conocidas comienzan en anacrusa.",
          },
          {
            type: "example",
            title: "Anacrusa en la practica",
            lines: [
              "Si una pieza en 4/4 comienza con una sola negra antes del primer compas completo:",
              "| neg | NEG neg neg neg | NEG neg neg neg | ...",
              "Esa negra sola es la anacrusa. El primer compas fuerte es el siguiente.",
              "Regla: el valor de la anacrusa + el valor del ultimo compas = 1 compas completo.",
            ],
          },
        ],
      },
      {
        title: "Sincopa y contratiempo",
        blocks: [
          {
            type: "paragraph",
            text: "La sincopa desplaza el acento al tiempo debil y lo sostiene ligado al tiempo fuerte siguiente. El contratiempo ataca en el tiempo debil pero no esta ligado al fuerte: simplemente ocupa ese espacio y el fuerte se deja en silencio.",
          },
          {
            type: "table",
            columns: ["Concepto", "Definicion", "Efecto"],
            rows: [
              [
                "Sincopa",
                "Acento en debil, ligado al fuerte siguiente",
                "Sensacion de empuje o tension ritmica",
              ],
              [
                "Contratiempo",
                "Ataque en debil, silencio en el fuerte",
                "Sensacion de salto o suspenso",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "Ambos recursos son muy frecuentes en musica tonal y en generos populares. En dictado y lectura ritmica, reconocerlos requiere tener claro donde cae el tiempo fuerte del compas.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir el numero superior del compas con el numero de figuras en total.",
      "Pensar que 6/8 es un compas de 6 tiempos.",
      "No distinguir sincopa de contratiempo porque ambos atacan en tiempo debil.",
      "Confundir 3/4 con 6/8: tienen las mismas corcheas pero los acentos son distintos.",
      "Olvidar que la anacrusa no es un compas completo y no se numera como compas 1.",
      "No reconocer compases de amalgama porque se intenta forzar una subdivision regular.",
    ],
    reviewSummary: [
      "Las figuras tienen valores relativos entre si: redonda = 4 negras, blanca = 2, corchea = 1/2.",
      "El compas simple divide el tiempo en 2; el compuesto en 3.",
      "Los compases de amalgama combinan grupos de 2 y 3 (5/8, 7/8).",
      "Sincopa y contratiempo desplazan el acento pero de manera distinta.",
      "La anacrusa es un compas incompleto al inicio de la pieza.",
    ],
    checklistItems: [
      {
        id: "rit-1",
        text: "Puedo escribir la equivalencia de redonda, blanca, negra y corchea.",
      },
      {
        id: "rit-2",
        text: "Puedo distinguir compas simple de compuesto observando el compas.",
      },
      {
        id: "rit-3",
        text: "Puedo reconocer una sincopa en un ejemplo escrito.",
      },
      {
        id: "rit-4",
        text: "Puedo distinguir 3/4 de 6/8 por la agrupacion de acentos.",
      },
      {
        id: "rit-5",
        text: "Puedo identificar una anacrusa al inicio de una pieza.",
      },
    ],
    microExercises: [
      { prompt: "Cuantas negras caben en una redonda?", answer: "Cuatro." },
      {
        prompt: "Que indica el numero inferior del compas?",
        answer: "La figura que equivale a un tiempo.",
      },
      {
        prompt: "Es 6/8 un compas simple o compuesto?",
        answer: "Compuesto binario: dos tiempos divididos en tres cada uno.",
      },
      {
        prompt: "Que es una sincopa?",
        answer:
          "Un acento en tiempo debil que queda ligado al tiempo fuerte siguiente.",
      },
      {
        prompt: "Diferencia entre sincopa y contratiempo?",
        answer:
          "La sincopa esta ligada al tiempo fuerte; el contratiempo ataca en el debil y el fuerte queda en silencio.",
      },
      {
        prompt: "Cuanto vale una negra con punto?",
        answer: "1.5 tiempos (1 + la mitad de 1).",
      },
      {
        prompt: "Diferencia entre 3/4 y 6/8?",
        answer:
          "3/4 tiene 3 tiempos con subdivision binaria; 6/8 tiene 2 tiempos con subdivision ternaria. Ambos suman 6 corcheas.",
      },
      {
        prompt: "Que es una anacrusa?",
        answer:
          "Un compas incompleto al inicio de la pieza, antes del primer tiempo fuerte.",
      },
      {
        prompt: "El compas 5/8 es simple, compuesto o de amalgama?",
        answer:
          "De amalgama: combina un grupo de 3 y uno de 2 (o viceversa).",
      },
      {
        prompt: "Cuantas corcheas caben en una blanca con punto?",
        answer: "Seis corcheas (3 negras x 2 corcheas cada una).",
      },
    ],
    glossary: [
      {
        term: "Compas",
        definition: "Unidad de medida ritmica que agrupa los tiempos.",
      },
      {
        term: "Compas simple",
        definition: "Compas donde el tiempo se divide en 2.",
      },
      {
        term: "Compas compuesto",
        definition: "Compas donde el tiempo se divide en 3.",
      },
      {
        term: "Compas de amalgama",
        definition: "Compas que mezcla grupos de 2 y de 3, como 5/8 o 7/8.",
      },
      {
        term: "Sincopa",
        definition:
          "Desplazamiento del acento al tiempo debil, ligado al fuerte.",
      },
      {
        term: "Contratiempo",
        definition: "Ataque en tiempo debil con silencio en el tiempo fuerte.",
      },
      {
        term: "Anacrusa",
        definition: "Nota o grupo de notas que preceden al primer tiempo fuerte del primer compas completo.",
      },
      {
        term: "Punto de aumentacion",
        definition: "Signo que agrega la mitad del valor a una figura.",
      },
      {
        term: "Subdivision binaria",
        definition: "Division del tiempo en 2 partes iguales (tipica de compas simple).",
      },
      {
        term: "Subdivision ternaria",
        definition: "Division del tiempo en 3 partes iguales (tipica de compas compuesto).",
      },
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
            text: "Cuando dos voces se mueven al mismo tiempo, la relacion entre ellas puede ser de cuatro tipos. Conocerlos es la base para escribir armonia a cuatro partes sin errores de conduccion.",
          },
          {
            type: "table",
            columns: ["Tipo de movimiento", "Descripcion", "Ejemplo"],
            rows: [
              [
                "Paralelo",
                "Las dos voces se mueven en la misma direccion por el mismo intervalo",
                "Ambas suben una tercera",
              ],
              [
                "Similar",
                "Las dos voces se mueven en la misma direccion por intervalos distintos",
                "Una sube una 3a, otra sube una 2a",
              ],
              [
                "Contrario",
                "Las dos voces se mueven en direcciones opuestas",
                "Una sube, la otra baja",
              ],
              [
                "Oblicuo",
                "Una voz se mueve y la otra permanece",
                "Una sube, la otra repite su nota",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "El movimiento contrario es el mas seguro porque reduce el riesgo de generar paralelos. El movimiento oblicuo tambien es util. El similar y el paralelo requieren mas cuidado.",
          },
        ],
      },
      {
        title: "Errores de conduccion clasicos",
        blocks: [
          {
            type: "paragraph",
            text: "Los errores mas graves en armonia clasica a cuatro voces son las quintas y octavas paralelas. Se producen cuando dos voces forman una quinta o una octava justa y luego se mueven en paralelo para formar otra quinta u octava justa.",
          },
          {
            type: "table",
            columns: ["Error", "Por que es un problema", "Como evitarlo"],
            rows: [
              [
                "Quintas paralelas",
                "Opacitan la independencia de las voces",
                "Usar movimiento contrario u oblicuo",
              ],
              [
                "Octavas paralelas",
                "Hacen que dos voces suenen como una sola",
                "Revisar que no se dupliquen trayectorias",
              ],
              [
                "Quintas directas",
                "Llegar por movimiento similar a una quinta justa desde un intervalo distinto (solo en voces extremas)",
                "Usar movimiento contrario en soprano o bajo",
              ],
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
        title: "Reglas de Duplicacion y Resolucion",
        blocks: [
          {
            type: "paragraph",
            text: "En armonia a cuatro voces, una de las notas de la triada debe duplicarse. La regla general es duplicar la fundamental, especialmente en acordes en estado fundamental. En inversiones, las reglas cambian para favorecer la sonoridad y la conduccion.",
          },
          {
            type: "table",
            columns: [
              "Tipo de acorde",
              "Nota preferida para duplicar",
              "Notas que conviene evitar duplicar",
            ],
            rows: [
              [
                "Triada mayor en fund.",
                "Raiz (fundamental)",
                "Tercera (especialmente la sensible)",
              ],
              [
                "Triada menor en fund.",
                "Raiz o tercera",
                "Quinta",
              ],
              [
                "Triada disminuida",
                "Tercera",
                "Quinta disminuida (muy inestable)",
              ],
              [
                "Primera Inversion (6)",
                "Bajo o soprano (notas estables)",
                "Sensible",
              ],
              [
                "Segunda Inversion (6/4)",
                "La quinta del acorde (el bajo)",
                "Raiz",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "Ademas de la duplicacion, existen reglas de resolucion obligatoria. La Sensible (7o grado) siempre debe resolver ascendentemente a la Tonica (1er grado) cuando forma parte del acorde de dominante. La Septima de un acorde siempre debe resolver descendentemente por grado conjunto.",
          },
          {
            type: "example",
            title: "Resolucion de V7 a I",
            lines: [
              "V7 (G-B-D-F) -> I (C-C-E-G)",
              "B (sensible) sube a C",
              "F (septima) baja a E",
              "G (fundamental) salta a C (o se mantiene si es voz interna)",
            ],
          },
        ],
      },
      {
        title: "Resumen de prohibiciones",
        blocks: [
          {
            type: "list",
            title: "Lo que debes evitar siempre",
            items: [
              "Quintas y Octavas paralelas: Dos voces moviendose en la misma direccion manteniendo el intervalo de 5a o 8a.",
              "Quintas y Octavas ocultas (directas): Llegar a una 5a o 8a por movimiento similar en las voces extremas.",
              "Cruzamiento de voces: Que la contralto cante mas agudo que la soprano, o el tenor mas grave que el bajo.",
              "Saltos aumentados o disminuidos: Especialmente la 4a aumentada (tritono) en una sola voz.",
            ],
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
      {
        id: "voz-1",
        text: "Puedo nombrar los cuatro tipos de movimiento entre voces.",
      },
      {
        id: "voz-2",
        text: "Puedo detectar quintas paralelas en un ejemplo dado.",
      },
      {
        id: "voz-3",
        text: "Se que nota duplicar en una triada basica a cuatro voces.",
      },
    ],
    microExercises: [
      {
        prompt: "Que tipo de movimiento es el mas seguro en armonia clasica?",
        answer: "El movimiento contrario.",
      },
      {
        prompt: "Por que son malas las quintas paralelas?",
        answer: "Porque anulan la independencia de las voces.",
      },
      {
        prompt:
          "Que nota se duplica normalmente en una triada mayor en estado fundamental?",
        answer: "La raiz.",
      },
      {
        prompt: "Por que no se duplica la sensible en el acorde de V?",
        answer:
          "Porque genera octavas paralelas al resolver ambas copias de la sensible hacia la tonica.",
      },
      {
        prompt: "Que es el movimiento oblicuo?",
        answer: "Cuando una voz se mueve y la otra permanece en la misma nota.",
      },
    ],
    glossary: [
      {
        term: "Conduccion de voces",
        definition:
          "Arte de mover cada parte de un acorde de forma independiente y eficiente al siguiente.",
      },
      {
        term: "Quintas paralelas",
        definition:
          "Error cuando dos voces forman 5as justas consecutivas moviendose en paralelo.",
      },
      {
        term: "Octavas paralelas",
        definition:
          "Error cuando dos voces forman octavas consecutivas en el mismo sentido.",
      },
      {
        term: "Movimiento contrario",
        definition: "Una voz sube mientras la otra baja.",
      },
      {
        term: "Duplicacion",
        definition:
          "Uso de la misma nota en dos voces distintas para completar cuatro partes.",
      },
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
    prerequisites: [
      "funciones-tonales",
      "escalas-relativas-paralelas",
      "campo-armonico-septimas",
    ],
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
        title: "Diferencia entre Modulacion e Inflexion",
        blocks: [
          {
            type: "paragraph",
            text: "No toda alteración accidental implica un cambio de tonalidad. Es fundamental distinguir entre una Inflexión (o tonificación momentánea) y una Modulación real.",
          },
          {
            type: "table",
            columns: ["Caracteristica", "Inflexion", "Modulacion"],
            rows: [
              [
                "Duracion",
                "Breve (1-2 acordes)",
                "Prolongada (una frase o seccion)",
              ],
              [
                "Confirmacion",
                "No requiere cadencia fuerte",
                "Requiere CAP en la nueva tonalidad",
              ],
              [
                "Centro Tonal",
                "Sigue siendo el original",
                "Se establece uno nuevo",
              ],
              [
                "Ejemplo",
                "Dominante secundaria (V7/ii)",
                "Pasar de C mayor a G mayor",
              ],
            ],
          },
        ],
      },
      {
        title: "Tipos de Modulacion",
        blocks: [
          {
            type: "list",
            title: "Clasificacion por Procedimiento",
            items: [
              "Modulacion Diatonica (por acorde pivote): El nexo es un acorde que pertenece a ambas tonalidades.",
              "Modulacion Cromatica: El cambio se produce mediante el movimiento semitonal de una o mas voces.",
              "Modulacion Directa (Fraseologica): Ocurre tras un silencio o pausa, empezando directamente en la nueva tonalidad.",
              "Modulacion Enarmonica: Un acorde se reinterpreta cambiando el nombre de sus notas (ej: de 7a disminuida a 6a aumentada).",
            ],
          },
          {
            type: "paragraph",
            text: "La modulacion mas comun es a tonalidades vecinas (aquellas que difieren en no mas de una alteracion en la armadura, o la relativa).",
          },
        ],
      },
      {
        title: "El Acorde Pivote",
        blocks: [
          {
            type: "paragraph",
            text: "El acorde pivote es el 'puente' funcional. Se analiza con un doble cifrado: su grado en la tonalidad vieja y su grado en la nueva.",
          },
          {
            type: "example",
            title: "Analisis de Pivote: C mayor -> G mayor",
            lines: [
              "C: I - IV - vi (Pivote)",
              "G:         ii - V7 - I",
              "El acorde Am funciona como vi en C y como ii en G.",
            ],
          },
          {
            type: "table",
            title: "Pivotes comunes entre tonalidades vecinas",
            columns: ["Relacion", "Ejemplo", "Acordes en comun"],
            rows: [
              ["Dominante", "C -> G", "C, Em, G, Am"],
              ["Subdominante", "C -> F", "C, Dm, F, Am"],
              ["Relativa", "C -> Am", "C, Dm, F, G, Am"],
            ],
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
      {
        id: "mod-1",
        text: "Puedo distinguir modulacion de inflexion cromatica.",
      },
      {
        id: "mod-2",
        text: "Puedo identificar un acorde pivote en una progresion sencilla.",
      },
      { id: "mod-3", text: "Se que la cadencia confirma la nueva tonalidad." },
    ],
    microExercises: [
      {
        prompt: "Que hace un acorde pivote en una modulacion?",
        answer:
          "Pertenece a las dos tonalidades al mismo tiempo y sirve de puente entre ellas.",
      },
      {
        prompt: "Una nota accidental aislada equivale a una modulacion?",
        answer:
          "No. La modulacion requiere un nuevo centro tonal confirmado por cadencia.",
      },
      {
        prompt: "Si vi de C major es Am, que grado es Am en G major?",
        answer: "ii de G major.",
      },
      {
        prompt: "Como se confirma que una modulacion ocurrio realmente?",
        answer: "Con una cadencia que establece el nuevo centro tonal.",
      },
      {
        prompt: "Que diferencia hay entre modulacion por pivote y cromatica?",
        answer:
          "La de pivote usa un acorde comun a las dos tonalidades; la cromatica no tiene ese puente y cambia por semitono.",
      },
    ],
    glossary: [
      {
        term: "Modulacion",
        definition:
          "Cambio de tonalidad dentro de una pieza, confirmado por cadencia en el nuevo centro.",
      },
      {
        term: "Acorde pivote",
        definition:
          "Acorde que pertenece a las dos tonalidades y sirve de nexo en la modulacion.",
      },
      {
        term: "Inflexion cromatica",
        definition:
          "Uso transitorio de una nota cromatica sin establecer un nuevo centro tonal.",
      },
      {
        term: "Tonalidad de destino",
        definition: "Nueva tonalidad hacia la que se modula.",
      },
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
        title: "Unidades Estructurales: Motivo, Frase y Periodo",
        blocks: [
          {
            type: "paragraph",
            text: "La musica se organiza de forma jerarquica, desde la celula mas pequeña hasta la obra completa.",
          },
          {
            type: "list",
            title: "Jerarquia Formal",
            items: [
              "Motivo: La unidad mas pequeña con identidad rítmica o melódica (ej: el inicio de la 5a de Beethoven).",
              "Semicadencia (Inciso): Fragmento de una frase.",
              "Frase: Unidad con sentido propio que termina en una cadencia. Suele durar 4 compases.",
              "Periodo: Union de dos frases (Antecedente y Consecuente) con relacion de pregunta y respuesta.",
              "Seccion: Conjunto de periodos que forman una parte mayor de la obra (A, B, C).",
            ],
          },
          {
            type: "table",
            title: "Tipos de Periodo",
            columns: ["Tipo", "Relacion entre frases", "Caracteristica"],
            rows: [
              ["Paralelo", "Inician igual", "El material tematico se repite al inicio de ambas"],
              ["Contrastante", "Inician distinto", "La segunda frase presenta material nuevo"],
              ["Simetrico", "Misma longitud", "4+4 o 8+8 compases"],
              ["Asimetrico", "Distinta longitud", "4+6 o similar (menos comun)"],
            ],
          },
        ],
      },
      {
        title: "Estructuras Binarias y Ternarias",
        blocks: [
          {
            type: "paragraph",
            text: "Las formas basicas se clasifican segun el numero de secciones principales y como se relacionan entre si.",
          },
          {
            type: "table",
            columns: ["Forma", "Esquema", "Descripcion"],
            rows: [
              ["Binaria Simple", "A B", "Dos secciones distintas, usualmente con repeticiones (||:A:||:B:||)"],
              ["Binaria Redondeada", "A B A'", "La seccion B termina con un retorno breve del material de A"],
              ["Ternaria (Da Capo)", "A B A", "Tres secciones completas; B es un contraste real (Trio)"],
              ["Rondo", "A B A C A", "Un estribillo (A) alterna con diferentes episodios"],
              ["Forma Variacion", "A A1 A2 A3", "Un tema seguido de modificaciones ornamentales o armonicas"],
            ],
          },
        ],
      },
      {
        title: "Analisis de la Macroforma",
        blocks: [
          {
            type: "paragraph",
            text: "Para entender la forma de una pieza compleja, debemos observar:",
          },
          {
            type: "chips",
            title: "Elementos de Cohesion",
            items: [
              "Repeticion: Crea unidad y familiaridad.",
              "Variacion: Mantiene el interes sobre material conocido.",
              "Contraste: Introduce conflicto y nuevas ideas.",
              "Retorno: Proporciona equilibrio y cierre formal.",
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
      {
        id: "for-1",
        text: "Puedo distinguir frase antecedente de consecuente.",
      },
      {
        id: "for-2",
        text: "Puedo identificar si una pieza corta es binaria o ternaria.",
      },
      {
        id: "for-3",
        text: "Relaciono las cadencias con los limites de forma.",
      },
    ],
    microExercises: [
      {
        prompt: "Cuantas frases forman un periodo?",
        answer: "Dos: antecedente y consecuente.",
      },
      { prompt: "Cual es el esquema de la forma ternaria?", answer: "A B A." },
      {
        prompt: "Que cadencia suele cerrar la frase antecedente?",
        answer: "Semicadencia.",
      },
      {
        prompt: "Que diferencia hay entre binaria redondeada y ternaria?",
        answer:
          "En la redondeada A regresa abreviado dentro de la segunda seccion; en la ternaria A regresa completa como tercera seccion.",
      },
      {
        prompt: "Como se usan las cadencias para identificar forma?",
        answer:
          "Marcan los limites de frase y seccion; la cadencia autentica cierra, la semicadencia deja abierto.",
      },
    ],
    glossary: [
      {
        term: "Frase",
        definition:
          "Unidad musical con sentido propio, generalmente de 4 a 8 compases.",
      },
      {
        term: "Periodo",
        definition:
          "Dos frases: antecedente (abierta) y consecuente (cerrada).",
      },
      {
        term: "Forma binaria",
        definition: "Estructura de dos secciones contrastantes: A B.",
      },
      {
        term: "Forma ternaria",
        definition:
          "Estructura de tres secciones donde la primera regresa: A B A.",
      },
      {
        term: "Frase antecedente",
        definition:
          "Primera frase del periodo; suele quedar abierta en semicadencia.",
      },
      {
        term: "Frase consecuente",
        definition: "Segunda frase del periodo; cierra con cadencia autentica.",
      },
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
            text: "El campo armonico es el conjunto de triadas que se forman al apilar terceras diatonicas desde cada grado de la escala. 'Diatonicas' significa que las notas que usas son siempre las de la escala, sin agregar alteraciones. El resultado es un grupo de 7 acordes, uno por cada grado.",
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
            text: "Nota que solo usas notas de la escala en cada paso. Por eso en G major el VII grado seria F# (no F), lo que cambia las notas exactas pero el patron de calidades permanece identico.",
          },
        ],
      },
      {
        title: "Patron de calidades en modo mayor",
        blocks: [
          {
            type: "paragraph",
            text: "La gran ventaja del campo armonico es que el patron de calidades es fijo para cualquier tonalidad mayor. No importa si estas en C, G, Ab o F#; el patron siempre es el mismo.",
          },
          {
            type: "table",
            columns: [
              "Grado",
              "Simbolo",
              "Calidad",
              "Ejemplo en C",
              "Ejemplo en G",
            ],
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
            text: "En la escala menor natural el patron cambia porque los intervalos internos de la escala son distintos. El punto mas importante: el v (grado 5) es menor, no mayor. Esto tiene implicaciones en la armonia de la musica en modo menor (ver el capitulo de armonizacion menor para mas detalle).",
          },
          {
            type: "table",
            columns: [
              "Grado",
              "Simbolo",
              "Calidad",
              "Ejemplo en Am",
              "Ejemplo en Dm",
            ],
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
            text: "Comparando los dos patrones: en mayor los acordes mayores son I-IV-V; en menor natural los mayores son III-VI-VII. El acorde de dominante (V) es el que mas diferencia tiene: Mayor en el modo mayor, menor en el modo menor natural.",
          },
        ],
      },
      {
        title: "Campo armonico de la escala menor armonica",
        blocks: [
          {
            type: "paragraph",
            text: "La escala menor armonica sube el VII grado un semitono respecto a la menor natural. Ese cambio tiene un efecto enorme en el campo armonico: el V pasa de menor a Mayor (y puede ser V7 dominante), y aparecen calidades nuevas como el acorde aumentado en III y el disminuido en VII.",
          },
          {
            type: "table",
            columns: [
              "Grado",
              "Simbolo",
              "Calidad",
              "Ejemplo en Am armonica",
            ],
            rows: [
              ["I", "i", "menor", "Am"],
              ["II", "ii°", "Disminuido", "B°"],
              ["III", "III+", "Aumentado", "C+"],
              ["IV", "iv", "menor", "Dm"],
              ["V", "V", "Mayor", "E"],
              ["VI", "VI", "Mayor", "F"],
              ["VII", "vii°", "Disminuido", "G#°"],
            ],
          },
          {
            type: "paragraph",
            text: "El cambio mas importante: ahora el V es Mayor, lo que permite la cadencia autentica V→i con la sensible (G#) resolviendo a la tonica (A). Por eso la menor armonica es la escala mas usada en contextos armonicos de modo menor.",
          },
        ],
      },
      {
        title: "Campo armonico de la escala menor melodica",
        blocks: [
          {
            type: "paragraph",
            text: "La escala menor melodica sube tanto el VI como el VII grado. Esto produce un campo armonico con calidades unicas, incluyendo acordes que no existen en ningun otro campo diatonico. Esta escala es muy importante en jazz.",
          },
          {
            type: "table",
            columns: [
              "Grado",
              "Simbolo",
              "Calidad",
              "Ejemplo en Am melodica",
            ],
            rows: [
              ["I", "i", "menor", "Am"],
              ["II", "II", "Mayor", "B (o Bsus)"],
              ["III", "III+", "Aumentado", "C+"],
              ["IV", "IV", "Mayor", "D"],
              ["V", "V", "Mayor", "E"],
              ["VI", "vi°", "Disminuido", "F#°"],
              ["VII", "vii°", "Disminuido", "G#°"],
            ],
          },
          {
            type: "paragraph",
            text: "En jazz, la menor melodica se usa completa (ascendente y descendente con los mismos grados). El IV Mayor (lydian dominant) y el VII disminuido (altered scale) son fuente de escalas muy usadas en improvisacion.",
          },
        ],
      },
      {
        title: "Funciones armonicas agrupadas",
        blocks: [
          {
            type: "paragraph",
            text: "Los 7 grados del campo armonico se agrupan en 3 funciones: tonica (reposo), subdominante (movimiento) y dominante (tension). Cada funcion contiene un grado principal y grados sustitutos que comparten notas en comun.",
          },
          {
            type: "table",
            columns: ["Funcion", "Grado principal", "Sustitutos", "Sensacion"],
            rows: [
              ["Tonica", "I", "iii, vi", "Reposo, estabilidad, llegada"],
              ["Subdominante", "IV", "ii", "Movimiento, partida, preparacion"],
              ["Dominante", "V", "vii°", "Tension, necesidad de resolver"],
            ],
          },
          {
            type: "example",
            title: "Por que iii y vi sustituyen al I?",
            lines: [
              "I en C = C-E-G",
              "iii en C = E-G-B (comparte E y G con el I)",
              "vi en C = A-C-E (comparte C y E con el I)",
              "Al compartir 2 de 3 notas, suenan 'parecido' al I y producen sensacion de reposo.",
            ],
          },
          {
            type: "paragraph",
            text: "Este esquema de funciones es la base del analisis armonico. Cualquier progresion tonal se puede reducir a una secuencia de funciones: T → S → D → T es el ciclo armonico mas basico.",
          },
        ],
      },
      {
        title: "Comparacion mayor vs menor: resumen",
        blocks: [
          {
            type: "table",
            title: "Diferencias clave entre campos armonicos",
            columns: ["Aspecto", "Mayor", "Menor natural", "Menor armonica"],
            rows: [
              ["Patron", "M-m-m-M-M-m-dim", "m-dim-M-m-m-M-M", "m-dim-Aum-m-M-M-dim"],
              ["Grado V", "Mayor (dominante)", "menor (no dominante)", "Mayor (dominante)"],
              ["Grado III", "menor", "Mayor", "Aumentado"],
              ["Grado VII", "Disminuido", "Mayor", "Disminuido"],
              ["Cadencia autentica V→I", "Natural", "Requiere armonica", "Natural"],
            ],
          },
        ],
      },
      {
        title: "Como identificar la calidad de un acorde apilado",
        blocks: [
          {
            type: "paragraph",
            text: "Una vez que tienes las 3 notas, comparas los intervalos internos para clasificar la triada.",
          },
          {
            type: "table",
            columns: [
              "Calidad",
              "Intervalo raiz-3ª",
              "Intervalo raiz-5ª",
              "Formula",
            ],
            rows: [
              [
                "Mayor",
                "3ª mayor (4 semitonos)",
                "5ª justa (7 semitonos)",
                "1-3-5",
              ],
              [
                "menor",
                "3ª menor (3 semitonos)",
                "5ª justa (7 semitonos)",
                "1-b3-5",
              ],
              [
                "Disminuido",
                "3ª menor (3 semitonos)",
                "5ª dism. (6 semitonos)",
                "1-b3-b5",
              ],
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Agregar alteraciones que no estan en la escala al apilar terceras.",
      "Olvidar que el patron de calidades cambia entre mayor y menor natural.",
      "Confundir el v menor de la escala menor natural con el V mayor (armonico).",
      "No distinguir menor natural de menor armonica: el VII grado alterado cambia todo.",
      "Pensar que iii y vi son 'iguales' al I; son sustitutos, no equivalentes exactos.",
      "Olvidar que el III en menor armonica es aumentado, no mayor.",
    ],
    reviewSummary: [
      "El campo armonico se construye apilando terceras diatonicas desde cada grado.",
      "En modo mayor el patron es: M-m-m-M-M-m-dim.",
      "En modo menor natural el patron es: m-dim-M-m-m-M-M.",
      "En modo menor armonico el V es Mayor y el VII es disminuido.",
      "Los grados se agrupan en funciones: tonica (I, iii, vi), subdominante (IV, ii), dominante (V, vii°).",
    ],
    checklistItems: [
      {
        id: "cat-1",
        text: "Puedo construir el campo armonico de C major sin ayuda.",
      },
      {
        id: "cat-2",
        text: "Se el patron de calidades del modo mayor de memoria.",
      },
      {
        id: "cat-3",
        text: "Puedo decir la calidad del iii grado en modo mayor sin calcular.",
      },
      {
        id: "cat-4",
        text: "Se que calidades cambian entre menor natural y menor armonica.",
      },
      {
        id: "cat-5",
        text: "Puedo agrupar los grados en funciones de tonica, subdominante y dominante.",
      },
    ],
    microExercises: [
      {
        prompt: "Que calidad tiene el ii grado en modo mayor?",
        answer: "menor.",
      },
      {
        prompt: "Que calidad tiene el vii en modo mayor?",
        answer: "Disminuido.",
      },
      {
        prompt: "En C major, cuales son los acordes del campo armonico?",
        answer: "C, Dm, Em, F, G, Am, B°.",
      },
      {
        prompt: "En modo menor natural, que calidad tiene el V?",
        answer: "menor (v minuscula).",
      },
      {
        prompt: "Por que el VII° solo aparece en modo mayor?",
        answer:
          "Porque en menor natural ese grado es Mayor (VII), no disminuido.",
      },
      {
        prompt: "Que cambia en el campo armonico al usar menor armonica en vez de natural?",
        answer:
          "El V pasa de menor a Mayor, el III se vuelve aumentado, y el VII pasa de Mayor a disminuido.",
      },
      {
        prompt: "Cuales son los grados con funcion de tonica en modo mayor?",
        answer: "I, iii y vi (comparten notas con el I).",
      },
      {
        prompt: "En Am armonica, que acorde es el V?",
        answer: "E Mayor (con G#, la sensible que resuelve a A).",
      },
      {
        prompt: "Cual es el ciclo armonico basico de funciones?",
        answer: "Tonica → Subdominante → Dominante → Tonica (T-S-D-T).",
      },
    ],
    glossary: [
      {
        term: "Campo armonico",
        definition:
          "Conjunto de 7 triadas formadas apilando terceras diatonicas desde cada grado de la escala.",
      },
      {
        term: "Terceras diatonicas",
        definition:
          "Terceras construidas usando solo las notas de la escala, sin alteraciones extras.",
      },
      {
        term: "Patron de calidades",
        definition:
          "Secuencia fija de calidades de acorde que resulta de construir el campo armonico de un modo dado.",
      },
      {
        term: "v menor",
        definition:
          "El quinto grado del modo menor natural, que es una triada menor (no mayor).",
      },
      {
        term: "Funcion armonica",
        definition:
          "Rol que cumple un acorde dentro de la tonalidad: tonica (reposo), subdominante (movimiento) o dominante (tension).",
      },
      {
        term: "Acorde aumentado",
        definition:
          "Triada con tercera mayor y quinta aumentada (1-3-#5). Aparece en el III grado de la menor armonica.",
      },
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
            text: "El circulo de quintas organiza las 12 tonalidades mayores en un ciclo donde cada tonalidad esta a una quinta justa de distancia de la siguiente. Subir por el circulo (hacia la derecha conventionalmente) agrega un sostenido. Bajar (hacia la izquierda) agrega un bemol.",
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
            text: "Las alteraciones no aparecen en cualquier orden: siempre se agregan en la misma secuencia fija. Conocer el orden es indispensable para leer una armadura rapidamente.",
          },
          {
            type: "table",
            columns: ["Tipo", "Orden", "Mnemotecnia"],
            rows: [
              ["Sostenidos", "F# C# G# D# A# E# B#", "Fa Do Sol Re La Mi Si"],
              [
                "Bemoles",
                "Bb Eb Ab Db Gb Cb Fb",
                "Si (Bb) Re La Sol Fa Do (= sostenidos al reves)",
              ],
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
            text: "Cada tonalidad mayor comparte su armadura con una tonalidad menor: su relativo menor. El relativo menor esta en el VI grado de la mayor (o, dicho de otro modo, a 3 semitonos por debajo de la tonica mayor). En el circulo el relativo menor aparece en el anillo interior.",
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
            text: "Regla rapida: el relativo menor es la nota que esta a una 6ª mayor sobre la tonica (o a una 3ª menor por debajo). Desde C, sube una 6ª mayor: C-D-E-F-G-A. El relativo de C mayor es Am.",
          },
        ],
      },
      {
        title: "Enarmonicas en el circulo",
        blocks: [
          {
            type: "paragraph",
            text: "En tres puntos del circulo existe una pareja de tonalidades enarmonicas: suenan identico pero se escriben diferente. Conocerlas evita errores de escritura en el examen.",
          },
          {
            type: "table",
            columns: [
              "Par enarmonico",
              "Version sostenidos",
              "Version bemoles",
            ],
            rows: [
              ["B / Cb", "B major (5#)", "Cb major (7b)"],
              ["F# / Gb", "F# major (6#)", "Gb major (6b)"],
              ["C# / Db", "C# major (7#)", "Db major (5b)"],
            ],
          },
          {
            type: "paragraph",
            text: "La version con menos alteraciones suele ser la que se usa en practica: Db (5b) en lugar de C# (7#), Gb (6b) o F# (6#) indistintamente, y B (5#) en lugar de Cb (7b).",
          },
        ],
      },
      {
        title: "Tonalidades vecinas y lejanas",
        blocks: [
          {
            type: "paragraph",
            text: "Dos tonalidades son vecinas (o cercanas) cuando difieren en 0 o 1 alteracion. En el circulo, las vecinas estan justo al lado. Las tonalidades lejanas estan a mayor distancia en el circulo y difieren en muchas alteraciones. La distancia en el circulo determina que tan 'dramatica' suena una modulacion.",
          },
          {
            type: "table",
            columns: ["Desde C major", "Tonalidad", "Distancia", "Relacion"],
            rows: [
              ["→", "G major (1#)", "1 paso", "Vecina (V de C)"],
              ["→", "F major (1b)", "1 paso", "Vecina (IV de C)"],
              ["→", "Am (0)", "0 pasos", "Relativa menor"],
              ["→", "Dm (1b)", "1 paso", "Vecina (relativa de F)"],
              ["→", "Em (1#)", "1 paso", "Vecina (relativa de G)"],
              ["→", "F# major (6#)", "6 pasos", "Lejana (tritono)"],
            ],
          },
          {
            type: "paragraph",
            text: "Regla practica: las tonalidades vecinas de una tonica son el IV, el V, sus relativas menores, y la propia relativa menor. Esas 5 tonalidades son las mas faciles para modular porque comparten casi todas las notas.",
          },
          {
            type: "chips",
            title: "Vecinas de C major",
            items: ["G major (V)", "F major (IV)", "Am (vi/relativa)", "Em (relativa de G)", "Dm (relativa de F)"],
          },
        ],
      },
      {
        title: "Uso practico del circulo de quintas",
        blocks: [
          {
            type: "paragraph",
            text: "El circulo no es solo un mapa teorico: es una herramienta de uso diario para componer, improvisar y analizar. Tres aplicaciones concretas:",
          },
          {
            type: "list",
            title: "Aplicaciones practicas",
            items: [
              "Progresiones: muchas progresiones populares se mueven por cuartas (= sentido antihorario en el circulo). La progresion ii-V-I en C es Dm-G-C: tres pasos consecutivos en el circulo.",
              "Modulacion: para modular a una tonalidad vecina, busca un acorde pivote que pertenezca a ambas tonalidades. Las vecinas comparten casi todo su campo armonico.",
              "Improvisacion: si estas en G major y el acorde cambia a Em, sabes que es la relativa menor (vi). Puedes usar la misma escala sin cambiar nada.",
            ],
          },
          {
            type: "example",
            title: "Progresion por cuartas en el circulo",
            lines: [
              "Tomemos la progresion: Bm7 - Em7 - Am7 - Dm7 - Gmaj7 - Cmaj7 - F#m7b5 - Bmaj7",
              "Cada acorde esta a una cuarta justa del anterior:",
              "B → E → A → D → G → C → F# → B",
              "Esto es recorrer el circulo en sentido antihorario.",
              "Esta secuencia se llama 'ciclo de cuartas' y es la base de muchos estandares de jazz.",
            ],
          },
          {
            type: "example",
            title: "Encontrar la escala para improvisar",
            lines: [
              "Estas tocando en Bb major y ves un acorde Gm7.",
              "En el circulo: Gm es la relativa menor de Bb.",
              "Conclusion: puedes usar la escala de Bb major sobre Gm7.",
              "Si ves un Eb major: esta a 1 paso (es el IV de Bb). Misma familia, misma escala base.",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir el orden de los sostenidos y los bemoles.",
      "Aplicar la regla del 'ultimo sostenido' a armaduras de bemoles.",
      "Olvidar que con 1 solo bemol (Bb) la tonalidad es F, no Bb.",
      "Pensar que tonalidades lejanas en el circulo no pueden relacionarse (si pueden, pero la modulacion es mas dramatica).",
      "No usar el circulo como herramienta practica: solo memorizarlo sin aplicarlo.",
    ],
    reviewSummary: [
      "El circulo organiza las 12 tonalidades por quintas; cada paso agrega 1 alteracion.",
      "Sostenidos: FCGDAEB. Bemoles: orden inverso BEADGCF.",
      "El relativo menor comparte la armadura de la mayor y esta en su VI grado.",
    ],
    checklistItems: [
      {
        id: "cq-1",
        text: "Puedo recitar el orden de los sostenidos de memoria.",
      },
      {
        id: "cq-2",
        text: "Puedo identificar la tonalidad de una armadura de sostenidos usando la regla.",
      },
      {
        id: "cq-3",
        text: "Se el relativo menor de las tonalidades mas comunes (C, G, D, F, Bb, Eb).",
      },
      {
        id: "cq-4",
        text: "Puedo nombrar las 5 tonalidades vecinas de cualquier tonica.",
      },
      {
        id: "cq-5",
        text: "Puedo usar el circulo para encontrar progresiones por cuartas.",
      },
    ],
    microExercises: [
      {
        prompt: "Di los sostenidos en orden.",
        answer: "F# C# G# D# A# E# B#.",
      },
      {
        prompt: "Una armadura tiene F# C# G# D#. Que tonalidad es?",
        answer:
          "El ultimo # es D#. D# + semitono = E. Tonalidad: E major (4 sostenidos).",
      },
      {
        prompt: "Una armadura tiene Bb Eb Ab. Que tonalidad es?",
        answer: "El penultimo bemol es Eb. Tonalidad: Eb major (3 bemoles).",
      },
      {
        prompt: "Cual es el relativo menor de G major?",
        answer: "Em (comparte 1 sostenido).",
      },
      {
        prompt: "Que par enarmonico tiene 6 alteraciones?",
        answer: "Gb major (6b) = F# major (6#).",
      },
      {
        prompt: "Nombra las 5 tonalidades vecinas de D major.",
        answer: "A major (V), G major (IV), Bm (relativa), F#m (relativa de A), Em (relativa de G).",
      },
      {
        prompt: "Si recorres el circulo en sentido antihorario desde C, que notas encuentras?",
        answer: "C - F - Bb - Eb - Ab - Db - Gb/F# - B - E - A - D - G - C. Es el ciclo de cuartas.",
      },
      {
        prompt: "Cuantas alteraciones tiene Bb major?",
        answer: "2 bemoles: Bb y Eb.",
      },
      {
        prompt: "La progresion ii-V-I en F major usa que acordes?",
        answer: "Gm7 - C7 - Fmaj7. Tres pasos consecutivos en el circulo.",
      },
    ],
    glossary: [
      {
        term: "Circulo de quintas",
        definition:
          "Mapa ciclico de las 12 tonalidades ordenadas a una quinta justa entre si.",
      },
      {
        term: "Armadura",
        definition:
          "Conjunto de alteraciones al inicio del pentagrama que indican la tonalidad.",
      },
      {
        term: "Enarmonica",
        definition:
          "Dos tonalidades que suenan igual pero se escriben con notacion distinta.",
      },
      {
        term: "Relativa menor",
        definition:
          "Tonalidad menor que comparte la misma armadura que una tonalidad mayor; esta en su VI grado.",
      },
      {
        term: "Sensible",
        definition:
          "VII grado de la escala; el ultimo sostenido de una armadura es la sensible de esa tonalidad.",
      },
      {
        term: "Tonalidades vecinas",
        definition:
          "Tonalidades que difieren en 0 o 1 alteracion; estan adyacentes en el circulo de quintas.",
      },
      {
        term: "Ciclo de cuartas",
        definition:
          "Recorrer el circulo de quintas en sentido antihorario; cada tonalidad esta a una cuarta justa de la anterior.",
      },
      {
        term: "Acorde pivote",
        definition:
          "Acorde que pertenece a dos tonalidades y sirve de puente para modular de una a otra.",
      },
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
            text: "Un acorde es un grupo de notas tocadas simultaneamente. Un arpegio es el mismo grupo de notas pero tocadas en sucesion, una tras otra. Las notas son exactamente las mismas; lo que cambia es si se tocan juntas o por separado. Un arpegio de Cm tiene las notas C-Eb-G igual que el acorde Cm; la diferencia es solo en la ejecucion.",
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
            text: "Cada familia de triada produce un arpegio con una sonoridad distinta. La formula indica los intervalos desde la raiz en semitonos. En la app de arpegios de bajo estos son el punto de partida.",
          },
          {
            type: "table",
            columns: [
              "Familia",
              "Formula",
              "Intervalos en semitonos",
              "Ejemplo en C",
            ],
            rows: [
              ["Mayor", "1-3-5", "0 - 4 - 7", "C E G"],
              ["Menor", "1-b3-5", "0 - 3 - 7", "C Eb G"],
              ["Disminuida", "1-b3-b5", "0 - 3 - 6", "C Eb Gb"],
              ["Aumentada", "1-3-#5", "0 - 4 - 8", "C E G#"],
            ],
          },
          {
            type: "paragraph",
            text: "La diferencia entre mayor y menor es solo un semitono en la tercera. La diferencia entre menor y disminuida es solo un semitono en la quinta. La aumentada es la menos comun en el campo armonico diatonico, pero aparece en el V grado alterado.",
          },
        ],
      },
      {
        title: "Arpegios de septima: los 4 tipos principales",
        blocks: [
          {
            type: "paragraph",
            text: "Al agregar una cuarta nota (la 7ª) obtienes arpegios de septima que son la base de la armonia jazz y funcional avanzada. Hay 4 tipos principales que debes conocer para preparacion universitaria.",
          },
          {
            type: "table",
            columns: [
              "Nombre",
              "Simbolo",
              "Formula",
              "Ejemplo en D",
              "Donde aparece",
            ],
            rows: [
              [
                "Mayor septima",
                "maj7",
                "1-3-5-7",
                "D F# A C#",
                "Imaj7, IVmaj7",
              ],
              ["Menor septima", "m7", "1-b3-5-b7", "D F A C", "ii7, iii7, vi7"],
              ["Dominante", "7", "1-3-5-b7", "D F# A C", "V7"],
              [
                "Semidisminuido",
                "m7b5 o ø",
                "1-b3-b5-b7",
                "D F Ab C",
                "vii°7 (mayor), ii°7 (menor)",
              ],
            ],
          },
          {
            type: "paragraph",
            text: "Observa la diferencia entre maj7 y 7 (dominante): ambos tienen tercera mayor y quinta justa, pero la septima difiere en un semitono. En maj7 la septima es mayor (7 semitonos desde la 6ª), en el dominante es menor (b7). Esa diferencia de un semitono cambia completamente la funcion armonica.",
          },
        ],
      },
      {
        title: "Guide tones: la 3ª y la 7ª",
        blocks: [
          {
            type: "paragraph",
            text: "Las notas guia (guide tones) son la 3ª y la 7ª del acorde. Estas dos notas definen la calidad del acorde mejor que cualquier otra. La 5ª es la nota menos informativa y a menudo se omite en voicings de jazz. Cuando improvisas o armonizas, priorizar la 3ª y la 7ª te da la sensacion del acorde con solo 2 notas.",
          },
          {
            type: "table",
            columns: [
              "Acorde",
              "3ª (guide tone)",
              "7ª (guide tone)",
              "Funcion",
            ],
            rows: [
              ["Cmaj7", "E (3ª mayor)", "B (7ª mayor)", "Tonica estable"],
              ["Dm7", "F (3ª menor)", "C (7ª menor)", "Subdominante / ii"],
              ["G7", "B (3ª mayor)", "F (7ª menor)", "Dominante con tension"],
            ],
          },
          {
            type: "paragraph",
            text: "En G7 -> Cmaj7 (V7->I), la 3ª de G7 (B) resuelve subiendo a C, y la 7ª de G7 (F) resuelve bajando a E. Eso es la resolucion de guide tones en accion.",
          },
        ],
      },
      {
        title: "Extensiones: 9ª, 11ª y 13ª",
        blocks: [
          {
            type: "paragraph",
            text: "Las extensiones son las notas que se agregan mas alla de la septima. Se nombran con numeros mayores que 7 para indicar que estan una octava mas arriba que los intervalos basicos.",
          },
          {
            type: "table",
            columns: [
              "Extension",
              "Equivale a",
              "Semitonos desde raiz",
              "Ejemplo sobre C",
            ],
            rows: [
              ["9ª", "2ª + octava", "14 semitonos", "D (una octava arriba)"],
              ["11ª", "4ª + octava", "17 semitonos", "F (una octava arriba)"],
              ["13ª", "6ª + octava", "21 semitonos", "A (una octava arriba)"],
            ],
          },
          {
            type: "paragraph",
            text: "Un acorde Dm9 tiene: D-F-A-C-E (triada menor + septima menor + novena mayor). En la app de arpegios de bajo los grupos 'Novenas y Trecenas' cubren estas extensiones en la practica.",
          },
        ],
      },
      {
        title: "Patrones de arpegio para bajo electrico",
        blocks: [
          {
            type: "paragraph",
            text: "En el bajo electrico los arpegios son la herramienta principal para construir lineas. No tocas acordes completos sino que despliegas las notas del acorde en patrones ritmicos. Conocer estos patrones y poder moverlos por el diapason es esencial.",
          },
          {
            type: "table",
            title: "Patrones basicos de arpegio en el bajo",
            columns: ["Patron", "Notas (sobre C)", "Uso", "Nivel"],
            rows: [
              ["1-5", "C - G", "Lineas de rock, punk, country basico", "Principiante"],
              ["1-3-5", "C - E - G", "Arpegio completo de triada, base de todo", "Principiante"],
              ["1-5-8", "C - G - C (octava)", "Lineas con movimiento vertical", "Principiante"],
              ["1-3-5-8", "C - E - G - C", "Arpegio ascendente completo con octava", "Intermedio"],
              ["1-b3-5-b7", "C - Eb - G - Bb", "Arpegio m7 completo para jazz/funk", "Intermedio"],
              ["1-3-5-7-8", "C - E - G - B - C", "Arpegio maj7 ascendente", "Intermedio"],
              ["Walking: 1-3-5-cromatismo", "C - E - G - G#/Ab", "Aproximacion cromatica al siguiente acorde", "Avanzado"],
            ],
          },
          {
            type: "example",
            title: "Linea de walking bass usando arpegios",
            lines: [
              "Progresion: Dm7 | G7 | Cmaj7 | Cmaj7 |",
              "Walking: D-F-A-C# | G-B-D-Eb | C-E-G-A | C-G-E-D",
              "Nota: la ultima nota de cada compas se aproxima cromaticamente a la raiz del siguiente.",
              "El C# al final de Dm7 sube a D? No: baja un semitono a C (raiz de Cmaj7).",
              "Correccion: D-F-A-Ab | G-B-D-Db | C-E-G-A | ...",
              "Cada aproximacion cromatica crea movimiento hacia la siguiente raiz.",
            ],
          },
        ],
      },
      {
        title: "Tensiones disponibles por tipo de acorde",
        blocks: [
          {
            type: "paragraph",
            text: "No todas las extensiones suenan bien sobre todos los acordes. Las 'tensiones disponibles' son las extensiones que no chocan con las notas del acorde. Las 'tensiones a evitar' (avoid notes) crean disonancia no deseada a menos que se manejen con cuidado.",
          },
          {
            type: "table",
            columns: ["Tipo de acorde", "Tensiones disponibles", "Tensiones a evitar"],
            rows: [
              ["maj7 (I)", "9, #11, 13", "11 natural (choca con la 3ª mayor)"],
              ["m7 (ii, iii, vi)", "9, 11, 13 (en ii y vi)", "b13 sobre iii (contexto dependiente)"],
              ["7 (V dominante)", "9, #11, 13, b9, #9, b13", "Ninguna fija: el dominante acepta todas las alteraciones"],
              ["m7b5 (vii°)", "9, 11, b13", "La 13 natural puede chocar"],
            ],
          },
          {
            type: "paragraph",
            text: "Para el bajo: al construir lineas, las tensiones disponibles son notas de paso seguras. Si tocas la 9a sobre un ii-7, suena natural. Si tocas la 11 natural sobre un Imaj7, choca con la 3a mayor (a un semitono). Estas reglas se aplican mas en jazz y armonia funcional que en rock o pop.",
          },
        ],
      },
      {
        title: "Voicings basicos y su relacion con arpegios",
        blocks: [
          {
            type: "paragraph",
            text: "Un voicing es la forma especifica en que distribuyes las notas de un acorde. No cambias las notas, cambias el orden y el registro en que aparecen. Los arpegios de bajo implicitamente sugieren un voicing segun el orden en que tocas las notas.",
          },
          {
            type: "list",
            title: "Tipos de voicing basicos",
            items: [
              "Posicion cerrada: todas las notas dentro de una octava (C-E-G-B). Sonido compacto.",
              "Posicion abierta: las notas se distribuyen en mas de una octava (C-G-E-B). Sonido espacioso.",
              "Drop 2: tomas la 2a nota mas aguda y la bajas una octava. Voicing muy usado en guitarra y piano jazz.",
              "Shell voicing: solo la raiz, 3a y 7a. Lo minimo para definir el acorde. Ideal para bajo + piano duo.",
            ],
          },
          {
            type: "paragraph",
            text: "Como bajista, tu funcion principal es tocar la raiz y definir el movimiento armonico. Pero al tocar arpegios, implicitamente estas creando un voicing lineal. Si tocas C-E-G-B (ascendente), el oyente percibe un Cmaj7 en posicion cerrada. Si tocas C-B-G-E (descendente), el efecto es diferente aunque el acorde sea el mismo.",
          },
        ],
      },
    ],
    commonMistakes: [
      "Confundir maj7 (7ª mayor) con 7 (dominante, 7ª menor).",
      "Pensar que la 9ª y la 2ª son lo mismo sin entender la octava de diferencia.",
      "Olvidar que el semidisminuido tiene 5ª disminuida (diferente al dominante que tiene 5ª justa).",
      "Tocar la 11 natural sobre un acorde maj7: choca con la 3ª a distancia de semitono.",
      "No usar aproximacion cromatica en walking bass, lo que produce lineas 'saltadas' sin direccion.",
      "Confundir voicing con inversion: el voicing es la distribucion espacial, la inversion cambia la nota mas grave.",
    ],
    reviewSummary: [
      "Un arpegio son las notas de un acorde tocadas en sucesion.",
      "Las 4 triadas: mayor (1-3-5), menor (1-b3-5), disminuida (1-b3-b5), aumentada (1-3-#5).",
      "Los 4 acordes de septima principales: maj7, m7, 7 (dominante), m7b5.",
      "Las guide tones (3ª y 7ª) definen la calidad del acorde.",
      "9ª = 2ª + octava. 11ª = 4ª + octava. 13ª = 6ª + octava.",
      "En el bajo, los patrones de arpegio (1-3-5, 1-5-8, walking) son la base de las lineas.",
      "Las tensiones disponibles varian segun el tipo de acorde.",
    ],
    checklistItems: [
      { id: "arp-1", text: "Puedo distinguir arpegio de acorde." },
      {
        id: "arp-2",
        text: "Puedo escribir las notas de un arpegio mayor, menor y dominante.",
      },
      {
        id: "arp-3",
        text: "Se que la 3a y la 7a son las guide tones que definen la calidad.",
      },
      {
        id: "arp-4",
        text: "Puedo tocar al menos 3 patrones de arpegio en el bajo.",
      },
      {
        id: "arp-5",
        text: "Entiendo que extensiones son disponibles sobre un acorde maj7 vs un dominante.",
      },
    ],
    microExercises: [
      {
        prompt: "Que diferencia hay entre Cmaj7 y C7?",
        answer: "Cmaj7 tiene septima mayor (B); C7 tiene septima menor (Bb).",
      },
      {
        prompt: "Escribe las notas del arpegio de Gm7.",
        answer: "G - Bb - D - F (1-b3-5-b7).",
      },
      {
        prompt: "Que es una guide tone?",
        answer:
          "La 3ª o la 7ª del acorde; las notas que mejor definen su calidad.",
      },
      {
        prompt: "Una novena es lo mismo que una segunda?",
        answer:
          "Son la misma nota de referencia pero la novena esta una octava mas arriba.",
      },
      {
        prompt: "Que formula tiene el arpegio semidisminuido?",
        answer: "1-b3-b5-b7.",
      },
      {
        prompt: "Que patron de bajo usarias para una linea simple de rock?",
        answer: "1-5 o 1-5-8: raiz y quinta, con o sin octava.",
      },
      {
        prompt: "Por que se evita la 11 natural sobre un acorde maj7?",
        answer: "Porque la 11 (4ª) esta a un semitono de la 3ª mayor, creando una disonancia aspera.",
      },
      {
        prompt: "Que es una aproximacion cromatica en walking bass?",
        answer:
          "Tocar una nota a un semitono de distancia de la raiz del siguiente acorde, justo antes de que cambie.",
      },
      {
        prompt: "Que notas tiene un shell voicing de Dm7?",
        answer: "D (raiz), F (3ª menor), C (7ª menor). Solo 3 notas.",
      },
      {
        prompt: "Que extensiones son disponibles sobre un V7 dominante?",
        answer: "Todas: 9, b9, #9, #11, 13, b13. El dominante acepta cualquier alteracion.",
      },
    ],
    glossary: [
      {
        term: "Arpegio",
        definition:
          "Las notas de un acorde ejecutadas en sucesion en lugar de simultaneamente.",
      },
      {
        term: "Guide tones",
        definition:
          "La 3ª y la 7ª de un acorde; las notas que definen su calidad con mayor claridad.",
      },
      {
        term: "Dominante",
        definition:
          "Acorde con formula 1-3-5-b7; el V7 de la tonalidad con maxima tension hacia la tonica.",
      },
      {
        term: "Semidisminuido (ø)",
        definition: "Acorde con formula 1-b3-b5-b7.",
      },
      {
        term: "Extension",
        definition: "Nota agregada mas alla de la 7ª: 9ª, 11ª o 13ª.",
      },
      {
        term: "Novena",
        definition:
          "Segunda una octava arriba; agrega color sin cambiar la funcion armonica basica.",
      },
      {
        term: "Tension disponible",
        definition:
          "Extension que suena consonante sobre un tipo de acorde especifico, sin chocar con sus notas basicas.",
      },
      {
        term: "Avoid note",
        definition:
          "Nota de la escala que genera disonancia aspera contra una nota del acorde (ej. 11 natural sobre maj7).",
      },
      {
        term: "Walking bass",
        definition:
          "Linea de bajo que se mueve principalmente por grado conjunto y arpegios, con un ataque por tiempo, tipica del jazz.",
      },
      {
        term: "Voicing",
        definition:
          "Distribucion especifica de las notas de un acorde en cuanto a registro y orden.",
      },
    ],
  },
];

function createChapter(chapter: WorkbookChapter): WorkbookChapter {
  return chapter;
}

function section(
  title: string,
  blocks: WorkbookSectionBlock[],
): WorkbookSection {
  return { title, blocks };
}

function paragraph(text: string): WorkbookSectionBlock {
  return { type: "paragraph", text };
}

function list(items: string[], title?: string): WorkbookSectionBlock {
  return { type: "list", title, items };
}

function example(title: string, lines: string[]): WorkbookSectionBlock {
  return { type: "example", title, lines };
}

function table(
  columns: string[],
  rows: string[][],
  title?: string,
): WorkbookSectionBlock {
  return { type: "table", title, columns, rows };
}

function chips(items: string[], title?: string): WorkbookSectionBlock {
  return { type: "chips", title, items };
}

const NEW_WORKBOOK_THEORY_CHAPTERS: WorkbookChapter[] = [
  createChapter({
    chapterId: "modos-eclesiasticos",
    unit: "Bloque 1. Fundamentos",
    focusBadge: "Expansion curricular",
    title: "Modos eclesiasticos",
    summary:
      "Panorama de los siete modos diatonicos y de su diferencia con el pensamiento tonal mayor-menor.",
    objective:
      "Reconocer la formula, color y nota caracteristica de cada modo para no reducirlos a 'escalas raras'.",
    prerequisites: [
      "escalas-mayores-menores",
      "escalas-relativas-paralelas",
      "intervalos",
    ],
    studyFlow: [
      "Parte de la escala mayor y gira su centro a cada grado.",
      "Identifica la alteracion modal caracteristica frente a mayor o menor.",
      "Asocia cada modo con una sonoridad y una cadencia tipica.",
    ],
    memoryHooks: [
      "Dorio = menor con 6 natural.",
      "Mixolidio = mayor con 7 menor.",
      "Lidio = mayor con 4 aumentada.",
    ],
    examFocus: [
      "Construir modos desde una nota dada.",
      "Distinguir modo de tonalidad funcional.",
      "Reconocer la nota caracteristica que define el color modal.",
    ],
    sections: [
      section("Que es un modo", [
        paragraph(
          "Un modo es una organizacion de grados dentro de la escala diatonica donde cambia el centro de gravedad sin cambiar necesariamente el material de notas. Por eso D dorio y C mayor pueden compartir alturas, pero no comparten reposo ni color. En analisis, el error comun es leer un pasaje modal como si fuera tonal solo porque no tiene alteraciones.",
        ),
        chips([
          "Jonico = mayor",
          "Dorio = b3 y b7 con 6 natural",
          "Frigio = b2 muy marcada",
          "Lidio = #4 brillante",
          "Mixolidio = b7",
          "Eolio = menor natural",
          "Locrio = b2 y b5",
        ]),
      ]),
      section("Formulas y color", [
        table(
          ["Modo", "Formula respecto a la tonica", "Color util"],
          [
            ["Jonico", "1 2 3 4 5 6 7", "Reposo mayor funcional"],
            ["Dorio", "1 2 b3 4 5 6 b7", "Menor flexible, mas abierto"],
            ["Frigio", "1 b2 b3 4 5 b6 b7", "Tension oscura por la b2"],
            ["Lidio", "1 2 3 #4 5 6 7", "Mayor expansivo por la #4"],
            ["Mixolidio", "1 2 3 4 5 6 b7", "Mayor sin sensible fuerte"],
            ["Eolio", "1 2 b3 4 5 b6 b7", "Menor natural"],
            ["Locrio", "1 b2 b3 4 b5 b6 b7", "Inestable por la b5"],
          ],
          "Resumen rapido",
        ),
        example("Comparacion util", [
          "D dorio = D E F G A B C. Su 6 natural (B) lo separa de D menor natural.",
          "G mixolidio = G A B C D E F. Su b7 evita la sensible F# de G mayor.",
          "F lidio = F G A B C D E. El B natural crea la #4 caracteristica.",
        ]),
      ]),
      section("Uso musical y lectura", [
        paragraph(
          "Los modos suelen funcionar por centro de reposo, patrones melodicos y pedal, mas que por progresiones dominante-tonica. Para identificar un modo, observa que grado suena como casa y cual es la nota que lo diferencia de mayor o menor. Esa nota suele aparecer acentuada, repetida o sostenida sobre un acorde estable.",
        ),
        list([
          "Si oyes 6 natural en un contexto menor estable, sospecha dorio.",
          "Si el 7o grado no empuja a la tonica pero el acorde mayor sigue estable, sospecha mixolidio.",
          "Si una 4 aumentada suena como color de reposo, sospecha lidio.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Pensar que un modo es solo 'la misma escala empezando en otra nota' sin cambiar el centro.",
      "Confundir eolio con menor armonica o melodica.",
      "Olvidar la nota caracteristica al construir el modo.",
    ],
    reviewSummary: [
      "El modo depende del centro, no solo del conjunto de notas.",
      "Cada modo se reconoce por una alteracion caracteristica frente a mayor o menor.",
      "El pensamiento modal usa color y centro, no siempre funcion tonal clasica.",
    ],
    checklistItems: [
      {
        id: "mod-1",
        text: "Puedo construir dorio, frigio, lidio y mixolidio desde cualquier tonica.",
      },
      {
        id: "mod-2",
        text: "Puedo explicar que nota le da identidad a cada modo.",
      },
      { id: "mod-3", text: "No confundo modo con tonalidad mayor-menor." },
    ],
    microExercises: [
      {
        prompt: "Que altera D dorio respecto a D menor natural?",
        answer: "Sube el 6o grado: B natural en lugar de Bb.",
      },
      { prompt: "Que formula tiene mixolidio?", answer: "1 2 3 4 5 6 b7." },
      {
        prompt: "Cual es la nota caracteristica de F lidio?",
        answer: "B natural, la #4 respecto a F.",
      },
    ],
    glossary: [
      {
        term: "Modo",
        definition:
          "Organizacion diatonica con un centro propio y un color determinado.",
      },
      {
        term: "Nota caracteristica",
        definition:
          "Grado que diferencia de forma mas clara un modo respecto a mayor o menor.",
      },
      { term: "Jonico", definition: "Modo equivalente a la escala mayor." },
      {
        term: "Eolio",
        definition: "Modo equivalente a la escala menor natural.",
      },
    ],
  }),
  createChapter({
    chapterId: "notas-de-adorno",
    unit: "Bloque 2. Armonia diatonica",
    focusBadge: "Muy preguntable",
    title: "Notas de adorno",
    summary:
      "Clasificacion de notas no armonicas y su comportamiento dentro de la linea melodica tonal.",
    objective:
      "Distinguir que notas pertenecen al acorde y cuales crean tension pasajera por contexto y resolucion.",
    prerequisites: ["intervalos", "triadas", "conduccion-de-voces"],
    studyFlow: [
      "Identifica primero el acorde real del momento.",
      "Luego compara la nota melodica contra ese acorde.",
      "Finalmente clasificala por preparacion, acento y resolucion.",
    ],
    memoryHooks: [
      "Paso entre dos notas del acorde = nota de paso.",
      "Sale y regresa por grado conjunto = bordadura.",
      "Retardo entra consonante y resuelve tarde.",
    ],
    examFocus: [
      "Nombrar notas de paso, bordaduras, retardos, anticipaciones y apoyaturas.",
      "Explicar como se preparan y resuelven.",
      "Distinguir disonancia estructural de disonancia decorativa.",
    ],
    sections: [
      section("Funcion general", [
        paragraph(
          "Las notas de adorno son sonidos que no pertenecen al acorde del momento pero enriquecen la linea y crean tension controlada. No todas se analizan igual: algunas son debiles y pasan casi desapercibidas, otras caen en tiempo fuerte y por eso suenan mas expresivas. El criterio basico es comparar la nota con el acorde, no solo con la escala.",
        ),
        table(
          ["Tipo", "Movimiento", "Acento habitual", "Idea clave"],
          [
            [
              "Paso",
              "Conecta dos notas del acorde por grado conjunto",
              "Debil o fuerte",
              "Llena un hueco",
            ],
            [
              "Bordadura",
              "Sale y regresa a la misma nota del acorde",
              "Debil",
              "Rodea una consonancia",
            ],
            [
              "Retardo",
              "Se sostiene desde el acorde anterior",
              "Fuerte",
              "Resuelve tarde por paso",
            ],
            [
              "Anticipacion",
              "Llega antes a la nota del acorde siguiente",
              "Debil",
              "Se adelanta a la armonia",
            ],
            [
              "Apoyatura",
              "Entra por salto y resuelve por paso",
              "Fuerte",
              "Disonancia expresiva",
            ],
            [
              "Escape",
              "Entra por paso y sale por salto",
              "Debil",
              "Figura breve e inestable",
            ],
          ],
        ),
      ]),
      section("Como reconocerlas", [
        example("Procedimiento", [
          "1. Escribe el acorde real debajo del compas.",
          "2. Marca que notas melodicas pertenecen al acorde.",
          "3. Las restantes clasifican por entrada y salida: paso, salto, preparacion y resolucion.",
        ]),
        list([
          "Si la disonancia esta preparada y cae en parte fuerte, piensa en retardo.",
          "Si entra por salto y resuelve por paso descendente o ascendente, piensa en apoyatura.",
          "Si la nota ya pertenece al acorde siguiente, piensa en anticipacion.",
        ]),
      ]),
      section("Aplicacion en escritura", [
        paragraph(
          "En armonia a 4 voces y en analisis, las notas de adorno no cambian la funcion del acorde si son pasajeras y resuelven bien. Por eso un I con apoyatura en soprano sigue analizandose como I. La clave es no sobredimensionar una disonancia superficial ni ignorar una disonancia estructural que realmente cambia el acorde.",
        ),
      ]),
    ],
    commonMistakes: [
      "Llamar 'nota de paso' a cualquier nota que no esta en el acorde.",
      "Olvidar comprobar si la disonancia cae en tiempo fuerte o debil.",
      "Confundir una apoyatura con una nueva armonia.",
    ],
    reviewSummary: [
      "La clasificacion depende del acorde, el acento y la resolucion.",
      "Retardo y apoyatura suelen ser las disonancias mas expresivas.",
      "Las notas de adorno colorean la linea sin cambiar necesariamente la funcion armonica.",
    ],
    checklistItems: [
      {
        id: "nda-1",
        text: "Puedo separar notas del acorde y notas de adorno en una melodia simple.",
      },
      {
        id: "nda-2",
        text: "Puedo distinguir retardo, apoyatura y anticipacion.",
      },
      {
        id: "nda-3",
        text: "No analizo como acorde nuevo una disonancia meramente decorativa.",
      },
    ],
    microExercises: [
      {
        prompt: "Una nota entre C y E, moviendose D por paso, que suele ser?",
        answer: "Una nota de paso si el acorde sigue siendo C.",
      },
      {
        prompt: "Que define a un retardo?",
        answer:
          "Se prepara como consonancia, cae disonante por mantenerse y resuelve por grado conjunto.",
      },
      {
        prompt: "Que diferencia hay entre apoyatura y anticipacion?",
        answer:
          "La apoyatura cae acentuada y resuelve; la anticipacion se adelanta al acorde siguiente.",
      },
    ],
    glossary: [
      {
        term: "Nota no armonica",
        definition: "Nota que no pertenece al acorde del momento.",
      },
      {
        term: "Retardo",
        definition: "Disonancia preparada que resuelve tarde por paso.",
      },
      {
        term: "Bordadura",
        definition: "Nota vecina que sale y regresa a la misma consonancia.",
      },
      {
        term: "Apoyatura",
        definition:
          "Disonancia acentuada que suele entrar por salto y resolver por paso.",
      },
    ],
  }),
  createChapter({
    chapterId: "secuencias-armonicas",
    unit: "Bloque 2. Armonia diatonica",
    focusBadge: "Patron recurrente",
    title: "Secuencias armonicas",
    summary:
      "Patrones repetitivos de progresion por grados o intervalos que organizan frases enteras.",
    objective:
      "Reconocer secuencias diatonicas comunes y entender por que simplifican el analisis de pasajes largos.",
    prerequisites: [
      "campo-armonico-triadas",
      "funciones-tonales",
      "modulacion",
    ],
    studyFlow: [
      "Encuentra primero el fragmento modelo.",
      "Observa como se repite a otra altura.",
      "Comprueba si la secuencia es exacta o tonal.",
    ],
    memoryHooks: [
      "La secuencia repite una idea, no necesariamente las mismas notas.",
      "Por quintas descendentes = cadena muy comun.",
      "La secuencia puede impulsar modulacion sin sentirse brusca.",
    ],
    examFocus: [
      "Detectar secuencias por terceras y por quintas.",
      "Distinguir secuencia real de secuencia tonal.",
      "Explicar su funcion como motor de desarrollo.",
    ],
    sections: [
      section("Que es una secuencia", [
        paragraph(
          "Una secuencia es la repeticion de un patron melodico-armonico a otra altura. Lo importante no es la identidad literal de las notas, sino la repeticion de la idea interválica o funcional. En musica tonal, muchas secuencias ajustan algunas notas para permanecer dentro de la tonalidad, por eso se llaman secuencias tonales.",
        ),
        chips([
          "Modelo",
          "Repeticion",
          "Transposicion",
          "Secuencia real",
          "Secuencia tonal",
        ]),
      ]),
      section("Patrones frecuentes", [
        table(
          ["Patron", "Esquema", "Uso"],
          [
            [
              "Quintas descendentes",
              "vi - ii - V - I / iii - vi - ii - V",
              "Impulso cadencial",
            ],
            [
              "Ascenso por segundas",
              "I - ii - iii - IV",
              "Crecimiento gradual",
            ],
            [
              "Terceras descendentes",
              "I - vi - IV - ii",
              "Color estable con variacion",
            ],
          ],
        ),
        example("Cadena clasica", [
          "En C major: Am - Dm - G - C.",
          "Cada raiz baja una quinta o sube una cuarta.",
          "La secuencia concentra predominante -> dominante -> tonica.",
        ]),
      ]),
      section("Secuencia y modulacion", [
        paragraph(
          "Las secuencias facilitan modulacion porque generan inercia: el oyente acepta el patron mientras las funciones se desplazan. Por eso aparecen mucho en desarrollos, transiciones y puentes. Analiticamente conviene marcar el patron una vez y luego comprobar en que punto deja de ser repeticion y se convierte en llegada cadencial real.",
        ),
      ]),
    ],
    commonMistakes: [
      "Analizar cada acorde aislado sin ver el patron repetitivo.",
      "Creer que toda repeticion literal es una secuencia.",
      "No distinguir entre repeticion exacta y adaptacion tonal.",
    ],
    reviewSummary: [
      "La secuencia repite una idea a distintas alturas.",
      "Las cadenas por quintas son de las mas importantes en armonia tonal.",
      "Las secuencias ayudan a moverse entre regiones tonales con continuidad.",
    ],
    checklistItems: [
      { id: "seq-1", text: "Puedo detectar un modelo y sus repeticiones." },
      { id: "seq-2", text: "Reconozco una cadena por quintas descendentes." },
      {
        id: "seq-3",
        text: "Puedo explicar por que una secuencia favorece la modulacion.",
      },
    ],
    microExercises: [
      {
        prompt: "Que patron de raices aparece en Dm - G - C - F?",
        answer: "Quintas descendentes o cuartas ascendentes.",
      },
      {
        prompt: "Que es una secuencia tonal?",
        answer:
          "Una repeticion del patron ajustada para mantenerse dentro de la tonalidad.",
      },
      {
        prompt: "Por que una secuencia aparece mucho en desarrollos?",
        answer:
          "Porque da continuidad, impulsa movimiento y permite desplazamiento tonal.",
      },
    ],
    glossary: [
      {
        term: "Secuencia",
        definition: "Repeticion de un patron a otra altura.",
      },
      {
        term: "Modelo",
        definition: "Fragmento original que se repite en la secuencia.",
      },
      {
        term: "Secuencia real",
        definition: "Repeticion con transposicion exacta de intervalos.",
      },
      {
        term: "Secuencia tonal",
        definition: "Repeticion adaptada para respetar el contexto tonal.",
      },
    ],
  }),
  createChapter({
    chapterId: "armonia-a-4-voces",
    unit: "Bloque 3. Armonia funcional",
    focusBadge: "Clave de examen",
    title: "Armonia a 4 voces",
    summary:
      "Reglas basicas de escritura coral estilo Bach para soprano, alto, tenor y bajo.",
    objective:
      "Distribuir acordes a 4 voces con buena conduccion, evitando errores graves como quintas y octavas paralelas.",
    prerequisites: [
      "triadas",
      "inversiones",
      "conduccion-de-voces",
      "funciones-tonales",
    ],
    studyFlow: [
      "Elige primero funcion y posicion del bajo.",
      "Completa soprano y voces internas con el acorde correcto.",
      "Revisa duplicaciones, resoluciones y paralelismos antes de cerrar.",
    ],
    memoryHooks: [
      "SATB = cuatro lineas independientes, no bloques verticales.",
      "Duplicar la tonica suele ser lo mas seguro.",
      "La sensible y la septima piden resolucion.",
    ],
    examFocus: [
      "Distribuir triadas e inversiones en disposicion abierta o cerrada.",
      "Evitar quintas y octavas paralelas.",
      "Resolver sensible, septima y voces activas con logica tonal.",
    ],
    sections: [
      section("Marco general", [
        paragraph(
          "La escritura a 4 voces busca equilibrio entre verticalidad armonica y autonomia melodica. Cada acorde debe sonar completo, pero cada voz tambien debe cantar con naturalidad. El criterio central es economizar movimiento: mantener notas comunes y mover por grado conjunto siempre que sea posible.",
        ),
        table(
          ["Voz", "Rango aproximado", "Funcion habitual"],
          [
            ["Soprano", "C4 - G5", "Linea superior y percepcion del acorde"],
            ["Alto", "G3 - D5", "Relleno medio y suavidad interna"],
            ["Tenor", "C3 - G4", "Soporte interno con perfil propio"],
            ["Bajo", "E2 - C4", "Define raiz e inversion"],
          ],
        ),
      ]),
      section("Reglas esenciales", [
        list([
          "No cruces voces ni sobrepases el registro inmediato entre alto-tenor y soprano-alto.",
          "Evita quintas y octavas paralelas entre cualquier par de voces.",
          "La sensible asciende a la tonica salvo contexto muy justificado.",
          "La septima de un acorde de septima desciende por paso.",
          "En triada fundamental suele duplicarse la raiz; en primera inversion se evalua segun funcion.",
        ]),
        example("Esqueleto seguro", [
          "I -> IV -> V -> I en C: C/E/G/C -> C/F/A/C -> B/F/G/D -> C/E/G/C.",
          "Manten notas comunes cuando existan y mueve el resto al acorde mas cercano.",
        ]),
      ]),
      section("Errores que se oyen de inmediato", [
        paragraph(
          "Las quintas y octavas paralelas vacian la textura porque dos voces dejan de sentirse independientes. Tambien suenan torpes los saltos excesivos en voces internas, la duplicacion de la sensible y la falta de preparacion de disonancias. En revision final conviene inspeccionar cada pareja de voces por separado y no solo el acorde completo.",
        ),
      ]),
    ],
    commonMistakes: [
      "Pensar solo en el cifrado y olvidar la cantabilidad de cada voz.",
      "Duplicar la sensible o dejarla sin resolver.",
      "Revisar solo soprano-bajo y no las parejas internas donde tambien hay paralelismos.",
    ],
    reviewSummary: [
      "Escritura a 4 voces = armonia vertical mas lineas cantables.",
      "Quintas y octavas paralelas son el control principal.",
      "Sensible y septima son notas activas que deben resolverse.",
    ],
    checklistItems: [
      {
        id: "satb-1",
        text: "Puedo escribir una progresion simple SATB sin cruces ni paralelismos evidentes.",
      },
      {
        id: "satb-2",
        text: "Se donde suele duplicarse la raiz y que notas conviene no duplicar.",
      },
      {
        id: "satb-3",
        text: "Reviso resolucion de sensible y septima antes de dar un ejercicio por bueno.",
      },
    ],
    microExercises: [
      {
        prompt: "Que nota conviene no duplicar en armonia tonal clasica?",
        answer: "La sensible, salvo casos muy controlados.",
      },
      {
        prompt: "Que suele hacer la septima de V7?",
        answer: "Descender por grado conjunto.",
      },
      {
        prompt: "Por que son problemáticas las quintas paralelas?",
        answer:
          "Porque hacen que dos voces pierdan independencia y suenen fusionadas.",
      },
    ],
    glossary: [
      {
        term: "SATB",
        definition:
          "Soprano, alto, tenor y bajo: las cuatro voces del coral clasico.",
      },
      {
        term: "Paralelismo",
        definition:
          "Movimiento simultaneo que conserva un intervalo perfecto entre dos voces.",
      },
      {
        term: "Duplicacion",
        definition: "Nota del acorde que aparece en dos voces.",
      },
      {
        term: "Voz interna",
        definition: "Alto o tenor; voces intermedias de la textura.",
      },
    ],
  }),
  createChapter({
    chapterId: "dominantes-secundarias",
    unit: "Bloque 3. Armonia funcional",
    focusBadge: "Expansion tonal",
    title: "Dominantes secundarias",
    summary:
      "Acordes dominantes que tonicizan temporalmente grados distintos de la tonica principal.",
    objective:
      "Analizar y construir V/x y V7/x entendiendo que producen una tonicizacion local, no una modulacion completa.",
    prerequisites: [
      "funciones-tonales",
      "acordes-de-septima",
      "campo-armonico-septimas",
    ],
    studyFlow: [
      "Encuentra primero el acorde de llegada.",
      "Construye su dominante real con sensible propia.",
      "Comprueba si hay confirmacion cadencial o solo tonicizacion breve.",
    ],
    memoryHooks: [
      "V del V prepara al dominante.",
      "La alteracion aparece para crear la sensible del grado objetivo.",
      "Tonicizar no es modular por si solo.",
    ],
    examFocus: [
      "Identificar V/V, V/ii, V/vi y sus resoluciones.",
      "Distinguir dominantes secundarias de prestamos o cromatismos libres.",
      "Explicar por que no suelen aplicarse a acordes disminuidos en igual forma.",
    ],
    sections: [
      section("Principio funcional", [
        paragraph(
          "Una dominante secundaria trata momentaneamente a un grado diatonico como si fuera tonica local. El mecanismo siempre es el mismo: se introduce la sensible de ese grado y se le aplica un acorde dominante. En C major, D7 contiene F#, que no pertenece a la tonalidad, pero funciona para empujar hacia G.",
        ),
        table(
          ["En C major", "Acorde", "Llega a"],
          [
            ["V/V", "D o D7", "G"],
            ["V/ii", "A o A7", "Dm"],
            ["V/vi", "E o E7", "Am"],
            ["V/iii", "B o B7", "Em"],
          ],
        ),
      ]),
      section("Tonicizacion vs modulacion", [
        paragraph(
          "Si el acorde aplicado aparece y resuelve de inmediato dentro del mismo flujo tonal, hablamos de tonicizacion. Si ademas la nueva region se confirma con permanencia, cadencia y cambio perceptivo de centro, hablamos de modulacion. En ejercicios cortos conviene no declarar modulacion sin evidencia suficiente.",
        ),
        example("Lectura segura", [
          "C - D7 - G - C: D7 es V/V porque toniciza a G pero la musica vuelve enseguida a C.",
          "C - E7 - Am: E7 es V/vi por la sensible G# hacia A.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Llamar modulacion a cualquier dominante secundaria.",
      "Olvidar construir la sensible del acorde objetivo.",
      "Analizar el acorde aplicado como si fuera diatonico solo por su raiz.",
    ],
    reviewSummary: [
      "Una dominante secundaria presta funcion dominante a un grado diatonico.",
      "La alteracion cromatica suele revelar la sensible del grado objetivo.",
      "No toda tonicizacion breve implica modulacion.",
    ],
    checklistItems: [
      {
        id: "ds-1",
        text: "Puedo construir V/V y V/ii desde cualquier tonalidad mayor simple.",
      },
      { id: "ds-2", text: "Reconozco la sensible del grado tonicizado." },
      {
        id: "ds-3",
        text: "Distingo tonicizacion local de modulacion estable.",
      },
    ],
    microExercises: [
      {
        prompt: "Que acorde es A7 en G major si resuelve a D?",
        answer: "V/V.",
      },
      {
        prompt: "Que nota cromatica delata E7 en C major?",
        answer: "G#, sensible de A.",
      },
      {
        prompt: "Una dominante secundaria siempre modula?",
        answer: "No. Puede solo tonicizar brevemente.",
      },
    ],
    glossary: [
      {
        term: "Dominante secundaria",
        definition:
          "Dominante aplicada a un grado distinto de la tonica principal.",
      },
      {
        term: "Tonicizacion",
        definition:
          "Sensacion momentanea de tonica local sin cambio tonal pleno.",
      },
      {
        term: "Acorde aplicado",
        definition:
          "Acorde cuya funcion se dirige a otro grado de la tonalidad.",
      },
      {
        term: "Sensible secundaria",
        definition:
          "Nota que actua como sensible del grado momentaneamente tonicizado.",
      },
    ],
  }),
  createChapter({
    chapterId: "acordes-aplicados",
    unit: "Bloque 3. Armonia funcional",
    focusBadge: "Dominante por disminuido",
    title: "Acordes aplicados",
    summary:
      "Uso de vii°/x y viiø7/x como dominantes incompletas dirigidas a grados diatonicos.",
    objective:
      "Reconocer los acordes aplicados disminuidos como variantes del dominante secundario y resolverlos correctamente.",
    prerequisites: [
      "dominantes-secundarias",
      "acordes-de-septima",
      "intervalos",
    ],
    studyFlow: [
      "Encuentra el grado de llegada.",
      "Construye su sensible y la triada disminuida correspondiente.",
      "Resuelve cada voz como si fuera parte de una dominante sin raiz.",
    ],
    memoryHooks: [
      "vii°/x comparte tension con V/x.",
      "Es una dominante incompleta: sensible + tritono.",
      "La resolucion suele ser aun mas estricta por grado conjunto.",
    ],
    examFocus: [
      "Identificar vii°/V y viiø7/ii.",
      "Comparar acorde aplicado con dominante secundaria equivalente.",
      "Resolver sensible y tritono correctamente.",
    ],
    sections: [
      section("Relacion con el dominante", [
        paragraph(
          "El acorde aplicado disminuido nace de la sensible del grado objetivo y funciona como sustituto incompleto del dominante. Si V/V en C es D7, su acorde aplicado emparentado es F#° o F#ø7. Ambos empujan a G porque contienen la sensible F# y el tritono asociado a la funcion dominante.",
        ),
        table(
          ["Objetivo", "Dominante secundaria", "Acorde aplicado"],
          [
            ["V en C", "D7", "F#° / F#ø7"],
            ["ii en C", "A7", "C#° / C#ø7"],
            ["vi en C", "E7", "G#° / G#ø7"],
          ],
        ),
      ]),
      section("Resolucion practica", [
        paragraph(
          "La sensible del acorde aplicado asciende al objetivo y las notas del tritono resuelven por movimiento contrario como en un dominante. En escritura coral, estos acordes requieren especial cuidado porque la quintad disminuida y la septima no toleran resoluciones libres. El analisis roman numeral explicita el destino: vii°/V, no simplemente vii°.",
        ),
        example("En C major", [
          "F# - A - C -> G - B - D.",
          "F# sube a G; A puede bajar a G o subir a B segun disposicion; C baja a B.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Analizar vii°/V como vii° diatonico de la tonalidad principal.",
      "No relacionar el acorde aplicado con el dominante del mismo objetivo.",
      "Resolver libremente la sensible o el tritono.",
    ],
    reviewSummary: [
      "El acorde aplicado es una dominante secundaria reducida.",
      "Su nombre siempre indica el objetivo: vii°/x.",
      "Las resoluciones siguen la logica de la funcion dominante.",
    ],
    checklistItems: [
      { id: "ap-1", text: "Puedo construir vii°/V y compararlo con V/V." },
      {
        id: "ap-2",
        text: "Se que la sensible del acorde aplicado debe resolver al objetivo.",
      },
      {
        id: "ap-3",
        text: "No confundo acorde aplicado con acorde diatonico disminuido.",
      },
    ],
    microExercises: [
      {
        prompt: "Cual es vii°/V en C major?",
        answer: "F#° o F#ø7 si se usa septima.",
      },
      {
        prompt: "Por que vii°/V funciona como dominante?",
        answer: "Porque contiene la sensible y el tritono que empujan a G.",
      },
      {
        prompt:
          "Como se etiqueta roman numeralmente un disminuido que resuelve a ii?",
        answer: "vii°/ii o viiø7/ii segun el caso.",
      },
    ],
    glossary: [
      {
        term: "Acorde aplicado",
        definition:
          "Acorde que toma funcion respecto a un objetivo diatonico local.",
      },
      {
        term: "vii°/x",
        definition: "Acorde de sensible aplicado a un grado objetivo x.",
      },
      {
        term: "Tritono",
        definition:
          "Intervalo central de la funcion dominante que pide resolucion.",
      },
      {
        term: "Dominante incompleta",
        definition: "Funcion dominante sin la raiz plena del acorde V7.",
      },
    ],
  }),
  createChapter({
    chapterId: "mezcla-modal",
    unit: "Bloque 4. Armonia cromatica",
    focusBadge: "Cromatismo tonal",
    title: "Mezcla modal",
    summary:
      "Prestamo de acordes entre modos paralelos, especialmente desde la paralela menor hacia una tonalidad mayor.",
    objective:
      "Reconocer acordes prestados como iv, bVI y bVII sin confundirlos con modulacion.",
    prerequisites: [
      "funciones-tonales",
      "escalas-relativas-paralelas",
      "modos-eclesiasticos",
    ],
    studyFlow: [
      "Fija primero la tonalidad principal.",
      "Compara el acorde cromatico con el modo paralelo.",
      "Evalua su funcion: color, predominante o expansion del reposo.",
    ],
    memoryHooks: [
      "Prestamo = mismo centro, material de otro modo paralelo.",
      "iv en mayor suaviza y oscurece la predominante.",
      "bVI y bVII son colores muy comunes de mezcla.",
    ],
    examFocus: [
      "Identificar acordes prestados en tonalidades mayores.",
      "Explicar su procedencia desde la paralela menor.",
      "Distinguir mezcla modal de dominante secundaria.",
    ],
    sections: [
      section("Concepto central", [
        paragraph(
          "La mezcla modal toma acordes del modo paralelo sin desplazar el centro tonal. En C major, usar F minor o Ab major no implica abandonar C como tonica; simplemente se importa color desde C minor. Esta tecnica amplifica el vocabulario tonal sin necesidad de una modulacion plena.",
        ),
        table(
          ["Acorde Prestado", "Nombre", "Origen (desde Mayor)", "Funcion Tipica"],
          [
            ["iio", "ii disminuido", "ii de la paralela menor", "Predominante"],
            ["bIII", "III Mayor", "I de la relativa mayor de la paralela menor", "Color / expansion de T"],
            ["iv", "Subdominante menor", "iv de la paralela menor", "Predominante suave"],
            ["v", "v menor", "v de la menor natural", "Dominante modal"],
            ["bVI", "VI Mayor", "VI de la paralela menor", "Sorpresa / Predominante"],
            ["bVII", "VII Mayor", "VII de la menor natural (Subtonica)", "Cadencia Mixolidia / Rock"],
            ["viio7", "vii disminuido 7", "vii de la paralela menor", "Dominante"],
          ],
        ),
      ]),
      section("Uso y Contexto", [
        paragraph(
          "El uso mas frecuente es la importación de acordes del modo menor hacia el modo mayor. Esto añade una cualidad 'oscura' o 'nostálgica' a la tonalidad mayor. El acorde de 'Sexta de Picardía' es el caso inverso: terminar una pieza en menor con un acorde de I mayor.",
        ),
        list([
          "Predominantes menores (iv, iio): Crean una direccion mas fuerte hacia el V.",
          "Cierre con bVI - bVII - I: Muy comun en musica epica y bandas sonoras (cadencia aeolica).",
          "Intercambio con otros modos: Aunque lo mas comun es mayor/menor, tambien se pueden tomar acordes del modo Dorico (IV mayor en menor) o Frigio (bII en mayor).",
        ]),
      ]),
      section("Diferenciacion Analitica", [
        paragraph(
          "La dominante secundaria introduce una sensible hacia otro grado; la mezcla modal introduce grados rebajados que colorean el mismo centro. Si el acorde cromatico no empuja a una tonica nueva sino que vuelve a I o prepara V desde un color paralelo, es mezcla modal.",
        ),
        example("Ejemplo de Progresion con Mezcla", [
          "C - Am - F - Fm - C",
          "I - vi - IV - iv - I",
          "El iv (Fm) añade un matiz de tristeza antes del reposo final.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Decir 'modulo a Ab' solo por encontrar bVI en C major.",
      "Confundir iv prestado con ii de otra tonalidad.",
      "Olvidar que el prestamo suele venir del modo paralelo, no del relativo.",
    ],
    reviewSummary: [
      "La mezcla modal altera el color sin cambiar necesariamente el centro.",
      "iv, bVI y bVII son prestamos muy frecuentes en modo mayor.",
      "El criterio analitico es la permanencia del centro tonal principal.",
    ],
    checklistItems: [
      {
        id: "mm-1",
        text: "Puedo detectar un acorde prestado en un contexto tonal mayor.",
      },
      { id: "mm-2", text: "Se de que modo paralelo procede iv en mayor." },
      { id: "mm-3", text: "No confundo mezcla modal con modulacion." },
    ],
    microExercises: [
      {
        prompt: "De donde viene iv en C major?",
        answer: "De C minor paralelo.",
      },
      {
        prompt: "Ab major en C major suele analizarse como que?",
        answer: "bVI prestado por mezcla modal.",
      },
      {
        prompt: "Que diferencia a mezcla modal de dominante secundaria?",
        answer:
          "La mezcla colorea el mismo centro; la dominante secundaria toniciza otro grado.",
      },
    ],
    glossary: [
      {
        term: "Mezcla modal",
        definition: "Prestamo de acordes entre modos paralelos.",
      },
      {
        term: "Modo paralelo",
        definition:
          "Modo con la misma tonica pero distinto patron de intervalos.",
      },
      {
        term: "Acorde prestado",
        definition: "Acorde importado desde el modo paralelo.",
      },
      {
        term: "bVI",
        definition:
          "Sexto grado rebajado, uno de los prestamos mas comunes en modo mayor.",
      },
    ],
  }),
  createChapter({
    chapterId: "acorde-napolitano",
    unit: "Bloque 4. Armonia cromatica",
    focusBadge: "Predominante clasico",
    title: "Acorde napolitano",
    summary:
      "El bII mayor, casi siempre en primera inversion, como acorde pre-dominante de alto impacto.",
    objective:
      "Construir y analizar el napolitano entendiendo su funcion pre-dominante y su relacion con el modo menor.",
    prerequisites: ["mezcla-modal", "funciones-tonales", "inversiones"],
    studyFlow: [
      "Parte del 2o grado rebajado.",
      "Forma una triada mayor y piensa su uso en sexta.",
      "Resuelvelo como predominante hacia V o cadencial 6/4.",
    ],
    memoryHooks: [
      "Napolitano = bII mayor.",
      "Aparece mucho en primera inversion: N6.",
      "Su funcion normal es pre-dominante.",
    ],
    examFocus: [
      "Construir N6 en mayor y menor.",
      "Distinguirlo de ii y de acordes prestados menos funcionales.",
      "Explicar su resolucion hacia dominante.",
    ],
    sections: [
      section("Construccion", [
        paragraph(
          "El acorde napolitano se forma sobre el 2o grado rebajado (bII) y es una triada mayor. Aunque puede aparecer en estado fundamental, su uso mas clasico y efectivo es en primera inversion, denotado como N6. Su sonoridad es oscura y tensa, evocando un color 'frigio' dentro del sistema tonal.",
        ),
        table(
          ["Tonalidad", "Grado bII", "Notas del Acorde", "Forma Clasica (N6)"],
          [
            ["C minor", "Db", "Db - F - Ab", "F - Ab - Db"],
            ["G minor", "Ab", "Ab - C - Eb", "C - Eb - Ab"],
            ["D major", "Eb", "Eb - G - Bb", "G - Bb - Eb"],
          ],
        ),
        paragraph(
          "En modo mayor, requiere alterar dos notas (b2 y b6). En modo menor, solo requiere alterar el 2o grado (b2), ya que el b6 es diatonico. Esto lo hace mas frecuente y natural en tonalidades menores.",
        ),
      ]),
      section("Funcion y Resolucion", [
        paragraph(
          "El napolitano funciona como una predominante de gran fuerza. Su destino casi inevitable es el acorde de dominante (V). La resolucion mas caracteristica implica que el b2 baje por semitono a la sensible (7) o a la fundamental (5) de la dominante.",
        ),
        list([
          "Resolucion Directa: N6 -> V (ej: Db/F -> G). Produce un salto de tercera disminuida (Db a B natural) que es muy expresivo.",
          "Resolucion via Cadencial 6/4: N6 -> I6/4 -> V. Suaviza la llegada a la dominante.",
          "Duplicacion: En el N6, se prefiere duplicar el bajo (la 3a del acorde, que es el 4to grado de la escala) para reforzar su funcion de predominante.",
        ]),
        example("Progresion Tipica en A minor", [
          "Am (i) - Dm (iv) - Bb/D (N6) - E (V) - Am (i)",
          "El bajo se mueve: A - D - D - E - A",
          "La soprano puede cantar: C - D - Bb - G# - A",
        ]),
      ]),
      section("Contexto Historico", [
        paragraph(
          "Aunque se llama 'napolitano' por su uso frecuente en la escuela de opera de Napoles del siglo XVIII (Scarlatti, Pergolesi), fue un recurso estandar para Bach, Mozart y especialmente Beethoven, quien lo uso para crear momentos de gran dramatismo.",
        ),
      ]),
    ],
    commonMistakes: [
      "Tratar el napolitano como simple acorde mayor de paso sin funcion.",
      "Escribirlo siempre en posicion fundamental, perdiendo la sonoridad clasica esperada.",
      "No llevarlo hacia dominante.",
    ],
    reviewSummary: [
      "Napolitano = bII mayor, casi siempre N6.",
      "Su funcion principal es pre-dominante.",
      "El color cromatico proviene del 2o grado rebajado.",
    ],
    checklistItems: [
      { id: "nap-1", text: "Puedo construir N6 desde una tonalidad dada." },
      {
        id: "nap-2",
        text: "Se que su destino funcional principal es la dominante.",
      },
      { id: "nap-3", text: "No lo confundo con ii diatonico." },
    ],
    microExercises: [
      {
        prompt: "Cual es el napolitano en A minor?",
        answer: "Bb - D - F; comunmente en primera inversion: D - F - Bb.",
      },
      {
        prompt: "Que significa N6?",
        answer: "Napolitano en primera inversion.",
      },
      {
        prompt: "Que funcion cumple el napolitano?",
        answer: "Predominante hacia dominante.",
      },
    ],
    glossary: [
      {
        term: "Napolitano",
        definition: "Acorde mayor construido sobre el 2o grado rebajado.",
      },
      {
        term: "N6",
        definition: "Forma mas comun del napolitano, en primera inversion.",
      },
      { term: "Predominante", definition: "Funcion que prepara la dominante." },
      {
        term: "bII",
        definition: "Segundo grado rebajado respecto a la escala diatonica.",
      },
    ],
  }),
  createChapter({
    chapterId: "sextas-aumentadas",
    unit: "Bloque 4. Armonia cromatica",
    focusBadge: "Cromatismo dirigido",
    title: "Sextas aumentadas",
    summary:
      "Acordes It+6, Fr+6 y Ger+6 como pre-dominantes cromaticos que empujan hacia la dominante.",
    objective:
      "Diferenciar los tres tipos de sexta aumentada y resolver sus voces caracteristicas correctamente.",
    prerequisites: ["acorde-napolitano", "funciones-tonales", "intervalos"],
    studyFlow: [
      "Encuentra el b6 y el #4 que forman la sexta aumentada.",
      "Identifica si el acorde es italiano, frances o aleman.",
      "Resuelve ambos sonidos expansivos hacia la dominante.",
    ],
    memoryHooks: [
      "b6 y #4 se abren hacia 5.",
      "It = 3 sonidos, Fr = agrega 2, Ger = agrega b3.",
      "Todos cumplen funcion pre-dominante.",
    ],
    examFocus: [
      "Construir It+6, Fr+6 y Ger+6.",
      "Resolverlos a V evitando paralelismos.",
      "Compararlos con el napolitano como predominantes cromaticos.",
    ],
    sections: [
      section("Estructura y Tipos", [
        paragraph(
          "Las sextas aumentadas son acordes predominantes cromaticos construidos sobre el 6to grado rebajado (b6) de la escala. Su rasgo distintivo es el intervalo de sexta aumentada que se forma entre el b6 y el 4to grado alterado (#4). Este intervalo es inestable y tiende a expandirse por semitono hacia la octava de la dominante (5).",
        ),
        table(
          ["Nombre", "Notas (en C)", "Contenido de Grados", "Notas Adicionales"],
          [
            ["Italiana (It+6)", "Ab - C - F#", "b6 - 1 - #4", "3 sonidos solamente"],
            ["Francesa (Fr+6)", "Ab - C - D - F#", "b6 - 1 - 2 - #4", "Contiene una 2a mayor (2)"],
            ["Alemana (Ger+6)", "Ab - C - Eb - F#", "b6 - 1 - b3 - #4", "Contiene una 3a menor (b3)"],
          ],
        ),
      ]),
      section("Resolucion y Conduccion", [
        paragraph(
          "La resolucion estandar es hacia el acorde de Dominante (V). El b6 baja al 5 y el #4 sube al 5. Debido a su estructura, cada variante tiene consideraciones especificas:",
        ),
        list([
          "Italiana: Se duplica la tonica (1) para completar las 4 voces.",
          "Francesa: El grado 2 se mantiene como nota comun al V (que es la 5a de la dominante) o baja al 7.",
          "Alemana: Es la mas propensa a generar quintas paralelas (Ab-Eb a G-D). Para evitarlas, casi siempre resuelve primero en un cadencial 6/4 (I6/4) antes de llegar al V.",
        ]),
        example("Resolucion Alemana en C", [
          "Ger+6 (Ab-C-Eb-F#) -> C/G (G-C-E-G) -> G (G-B-D-G)",
          "Evita las quintas prohibidas mediante el retraso del 6/4.",
        ]),
      ]),
      section("Comparativa", [
        table(
          ["Acorde", "Intervalo Clave", "Origen Tonal", "Efecto"],
          [
            ["Napolitano", "b2 - 4 - b6", "Mezcla Modal / Frigio", "Oscuro, solemne"],
            ["Sexta Aumentada", "b6 - #4", "Cromatismo dirigido", "Brillante, impulsivo"],
          ],
        ),
      ]),
    ],
    commonMistakes: [
      "Olvidar que la identidad del acorde esta en la sexta aumentada, no en cualquier tetracorde cromatico.",
      "Resolver el Ger+6 a V sin revisar paralelismos.",
      "Confundir Fr+6 con un dominante secundario por el tritono visible.",
    ],
    reviewSummary: [
      "Las sextas aumentadas son predominantes cromaticos orientados a V.",
      "It, Fr y Ger se distinguen por sus notas internas.",
      "b6 y #4 resuelven por semitono hacia 5.",
    ],
    checklistItems: [
      {
        id: "sa-1",
        text: "Puedo localizar el intervalo de sexta aumentada dentro del acorde.",
      },
      { id: "sa-2", text: "Distinguo It+6, Fr+6 y Ger+6 por su contenido." },
      { id: "sa-3", text: "Se como resolver el acorde hacia dominante." },
    ],
    microExercises: [
      {
        prompt: "Que dos grados forman la sexta aumentada?",
        answer: "b6 y #4 respecto a la tonalidad.",
      },
      { prompt: "Que variante incluye el 2 natural?", answer: "La francesa." },
      {
        prompt: "Que variante suele dar mas problemas de paralelos?",
        answer: "La alemana.",
      },
    ],
    glossary: [
      {
        term: "Sexta aumentada",
        definition: "Intervalo cromatico que se expande hacia la dominante.",
      },
      {
        term: "It+6",
        definition:
          "Acorde de sexta aumentada italiana, version basica de tres sonidos.",
      },
      {
        term: "Fr+6",
        definition: "Version francesa con el 2 natural agregado.",
      },
      { term: "Ger+6", definition: "Version alemana con b3 agregado." },
    ],
  }),
  createChapter({
    chapterId: "dominantes-alteradas",
    unit: "Bloque 4. Armonia cromatica",
    focusBadge: "Tension maxima",
    title: "Dominantes alteradas",
    summary:
      "Dominantes con quinta o novena alterada para intensificar la resolucion hacia la tonica.",
    objective:
      "Leer y construir dominantes con b9, #9, b5 y #5 entendiendo que las alteraciones refuerzan la funcion dominante.",
    prerequisites: [
      "dominantes-secundarias",
      "intervalos",
      "acordes-de-septima",
    ],
    studyFlow: [
      "Parte de un acorde V7 claro.",
      "Añade la alteracion como tension sobre la dominante.",
      "Resuelve cada sonido alterado por la via mas cercana.",
    ],
    memoryHooks: [
      "La alteracion no quita la funcion dominante: la intensifica.",
      "b9 suele bajar; #9 suele subir o reinterpretarse.",
      "b5/#5 colorean el acorde sin borrar 3a y 7a.",
    ],
    examFocus: [
      "Escribir V7b9, V7#9, V7b5 y V7#5.",
      "Resolver alteraciones de forma convincente.",
      "Distinguir dominante alterado de acorde autonomo cromatico.",
    ],
    sections: [
      section("Nucleo y Tensiones", [
        paragraph(
          "En un acorde de dominante, la 3a y la 7a forman el tritono que define su funcion. Las alteraciones actuan sobre la 5a o la 9a para incrementar la tension cromatica hacia la tonica. Estos acordes son pilares del lenguaje romantico tardio y del jazz.",
        ),
        table(
          ["Acorde", "Intervalos", "Notas (V7 de C)", "Uso / Color"],
          [
            ["V7(b9)", "1, 3, 5, b7, b9", "G-B-D-F-Ab", "Clasico, muy tenso hacia la 5a de I"],
            ["V7(#9)", "1, 3, 5, b7, #9", "G-B-D-F-A#", "Jazz / Blues ('Acorde Hendrix')"],
            ["V7(b5)", "1, 3, b5, b7", "G-B-Db-F", "Francia / Impresionismo"],
            ["V7(#5)", "1, 3, #5, b7", "G-B-D#-F", "Aumentado, empuje hacia la 3a de I"],
          ],
        ),
      ]),
      section("Resolucion de Alteraciones", [
        paragraph(
          "Las notas alteradas tienen una direccion obligada por su tendencia cromatica. Resolverlas 'en contra' de su alteracion suele sonar forzado o incorrecto.",
        ),
        list([
          "La b9 siempre baja por semitono (en C: Ab -> G).",
          "La #9 suele subir (A# -> B) o actuar como una b10 (Bb -> A) en contextos de blues.",
          "La b5 baja por semitono (Db -> C).",
          "La #5 sube por semitono (D# -> E).",
        ]),
        example("V7(#5) -> I en C Major", [
          "G - B - D# - F  resolviendo a  C - C - E - G",
          "El D# sube a E (3a de C)",
          "El F baja a E (3a de C)",
          "El B sube a C (Tonica)",
        ]),
      ]),
      section("Sustitucion Tritonica", [
        paragraph(
          "Un concepto avanzado relacionado es la sustitucion tritonica (SubV7). Un dominante puede ser reemplazado por otro a distancia de tritono (ej: Db7 sustituye a G7) porque comparten el mismo tritono funcional (F y B/Cb).",
        ),
      ]),
    ],
    commonMistakes: [
      "Olvidar que 3a y 7a siguen siendo el nucleo del acorde.",
      "Tratar las alteraciones como notas libres sin resolucion sugerida.",
      "Confundir un dominante alterado con una simple triada aumentada aislada.",
    ],
    reviewSummary: [
      "Las alteraciones agregan tension a un dominante ya funcional.",
      "3a y 7a deben seguir claras para que el acorde conserve identidad.",
      "La resolucion cromatica cercana suele ser la mas convincente.",
    ],
    checklistItems: [
      {
        id: "da-1",
        text: "Puedo construir un V7b9 y un V7#5 desde una tonalidad dada.",
      },
      { id: "da-2", text: "Mantengo 3a y 7a como base funcional del acorde." },
      {
        id: "da-3",
        text: "Resuelvo las tensiones alteradas por movimiento cercano.",
      },
    ],
    microExercises: [
      {
        prompt:
          "Que notas definen la funcion dominante aunque haya alteraciones?",
        answer: "La 3a y la 7a.",
      },
      {
        prompt: "Que agrega un V7b9?",
        answer:
          "La novena menor sobre la dominante, una tension cromatica fuerte.",
      },
      {
        prompt: "Un dominante alterado deja de ser dominante?",
        answer: "No. La alteracion suele intensificar su funcion.",
      },
    ],
    glossary: [
      {
        term: "Alteracion",
        definition: "Cambio cromatico aplicado a una tension del acorde.",
      },
      { term: "b9", definition: "Novena menor sobre la dominante." },
      {
        term: "#5",
        definition: "Quinta aumentada dentro del acorde dominante.",
      },
      {
        term: "Tension",
        definition: "Nota agregada que incrementa inestabilidad y color.",
      },
    ],
  }),
  createChapter({
    chapterId: "modulacion-avanzada",
    unit: "Bloque 4. Armonia cromatica",
    focusBadge: "Cambio tonal profundo",
    title: "Modulacion avanzada",
    summary:
      "Modulaciones cromaticas, enarmonicas y por acordes pivote complejos hacia regiones lejanas.",
    objective:
      "Describir estrategias de modulacion mas alla del acorde comun diatonico simple.",
    prerequisites: [
      "modulacion",
      "dominantes-secundarias",
      "sextas-aumentadas",
    ],
    studyFlow: [
      "Determina tonalidad de partida y llegada.",
      "Busca el mecanismo: pivote, cromatismo, enarmonia o dominante encadenada.",
      "Verifica la confirmacion tonal en el nuevo centro.",
    ],
    memoryHooks: [
      "Modular lejos exige preparar la escucha.",
      "La enarmonia cambia la lectura sin cambiar la altura real.",
      "Sin confirmacion cadencial no hay llegada estable.",
    ],
    examFocus: [
      "Reconocer modulacion por acorde pivote cromatico.",
      "Explicar reinterpretacion enarmonica de acordes disminuidos o de 7a.",
      "Distinguir transicion modulante de simple tonicizacion extendida.",
    ],
    sections: [
      section("Mediantes Cromaticas", [
        paragraph(
          "Las mediantes cromaticas son tonalidades o acordes cuyas fundamentales estan a distancia de tercera (mayor o menor) y que no pertenecen a la tonalidad diatonica. Por ejemplo, en C major, los acordes de E major o Ab major son mediantes cromaticas.",
        ),
        table(
          ["Relacion", "Ejemplo (en C)", "Caracteristica"],
          [
            ["Mediante Mayor", "E (III)", "III mayor en lugar de iii menor"],
            ["Submediante Menor", "Ab (bVI)", "bVI mayor prestado de C menor"],
            ["Mediante Menor", "Eb (bIII)", "bIII mayor prestado de C menor"],
            ["Submediante Mayor", "A (VI)", "VI mayor en lugar de vi menor"],
          ],
        ),
        paragraph(
          "Estas relaciones permiten modulaciones directas o por pivote cromatico muy coloridas, tipicas del Romanticismo (Schubert, Liszt).",
        ),
      ]),
      section("Reinterpretacion Enarmonica", [
        paragraph(
          "Ciertos acordes tienen una estructura simetrica que permite reinterpretarlos enarmonicamente para modular a tonalidades lejanas. Los dos casos mas famosos son la Septima Disminuida y la Sexta Aumentada Alemana.",
        ),
        list([
          "Septima Disminuida (vii°7): Al ser simetrico (todo terceras menores), cualquier nota puede ser la sensible. Un vii°7 de C (B-D-F-Ab) es enarmonico al vii°7 de Eb (D-F-Ab-Cb).",
          "Sexta Aumentada Alemana (Ger+6): Es enarmonica a un acorde de 7a de dominante (V7). Un Ger+6 en C (Ab-C-Eb-F#) suena igual a un Ab7 (V7 de Db).",
        ]),
        example("Modulacion via Ger+6 / V7", [
          "Tonalidad A: C major. Acorde: Ab-C-Eb-F# (Ger+6)",
          "Reinterpretacion: Ab-C-Eb-Gb (V7 de Db)",
          "Tonalidad B: Db major. Resolucion a Db.",
        ]),
      ]),
      section("Modulacion por Tonos Vecinos vs Lejanos", [
        paragraph(
          "Las modulaciones avanzadas suelen dirigirse a tonalidades lejanas (mas de dos alteraciones de diferencia en el circulo de quintas). El uso de pivotes cromaticos (acordes de mezcla modal usados como nexo) es la herramienta clave para mantener la coherencia musical en estos saltos grandes.",
        ),
      ]),
    ],
    commonMistakes: [
      "Declarar modulacion avanzada sin mostrar el mecanismo concreto.",
      "No distinguir entre ambiguedad transitoria y nueva tonalidad confirmada.",
      "Ignorar la grafia enarmonica al analizar acordes cromaticos.",
    ],
    reviewSummary: [
      "Las modulaciones avanzadas usan cromatismo y reinterpretacion para ir mas lejos.",
      "La confirmacion tonal sigue siendo necesaria aunque el camino sea complejo.",
      "El analisis debe explicar como se produce el cambio, no solo adonde llega.",
    ],
    checklistItems: [
      {
        id: "ma-1",
        text: "Puedo describir al menos dos tecnicas de modulacion avanzada.",
      },
      {
        id: "ma-2",
        text: "Se reconocer una reinterpretacion enarmonica basica.",
      },
      {
        id: "ma-3",
        text: "No llamo modulacion a una tonicizacion extendida sin cadencia de llegada.",
      },
    ],
    microExercises: [
      {
        prompt:
          "Que necesita una nueva region para sentirse modulada y no solo tonicizada?",
        answer:
          "Confirmacion tonal, normalmente con dominante/cadencia y permanencia.",
      },
      {
        prompt: "Que es una reinterpretacion enarmonica?",
        answer:
          "Leer la misma altura escrita de otro modo para darle otra funcion.",
      },
      {
        prompt: "Una cadena de dominantes puede modular?",
        answer: "Si, si termina confirmando un nuevo centro.",
      },
    ],
    glossary: [
      {
        term: "Enarmonia",
        definition:
          "Equivalencia sonora con distinta escritura y funcion teorica.",
      },
      {
        term: "Acorde pivote",
        definition: "Acorde que puede pertenecer a dos contextos tonales.",
      },
      {
        term: "Region lejana",
        definition:
          "Tonalidad con poca cercania diatonica respecto al centro inicial.",
      },
      {
        term: "Confirmacion tonal",
        definition:
          "Evidencia auditiva y funcional de que la nueva tonalidad se establecio.",
      },
    ],
  }),
  createChapter({
    chapterId: "contrapunto-de-especies",
    unit: "Bloque 5. Contrapunto",
    focusBadge: "Base contrapuntistica",
    title: "Contrapunto de especies",
    summary:
      "Introduccion a las cinco especies como metodo para entrenar independencia de voces.",
    objective:
      "Entender las reglas basicas de cada especie y su relacion con consonancia, disonancia y ritmo.",
    prerequisites: ["intervalos", "conduccion-de-voces", "armonia-a-4-voces"],
    studyFlow: [
      "Empieza por primera especie y domina consonancias permitidas.",
      "Añade luego ritmo y disonancias controladas en especies superiores.",
      "Piensa siempre en direccion de linea y clausula final.",
    ],
    memoryHooks: [
      "1:1, 2:1, 4:1, suspensiones y florido.",
      "La disonancia nunca entra sin contexto claro.",
      "El fin del contrapunto es independencia, no solo 'evitar errores'.",
    ],
    examFocus: [
      "Describir la diferencia entre las cinco especies.",
      "Aplicar consonancias y disonancias permitidas.",
      "Cerrar con clausulas correctas.",
    ],
    sections: [
      section("Las cinco especies de Fux", [
        paragraph(
          "El metodo de especies (popularizado por J.J. Fux en su 'Gradus ad Parnassum') entrena progresivamente la independencia de voces y el control de la disonancia.",
        ),
        table(
          ["Especie", "Relacion Ritmica", "Regla de Disonancia", "Recurso Clave"],
          [
            ["1a Especie", "1:1 (Redondas)", "Prohibida", "Solo consonancias (3, 5, 6, 8)"],
            ["2a Especie", "2:1 (Blancas)", "En tiempo debil", "Notas de paso y bordaduras"],
            ["3a Especie", "4:1 (Negras)", "En tiempos debiles", "Nota cambiata y bordaduras"],
            ["4a Especie", "2:1 (Sincopas)", "En tiempo fuerte", "Suspensiones (7-6, 4-3, 9-8)"],
            ["5a Especie", "Mixta (Florido)", "Segun contexto", "Combinacion de todas las especies"],
          ],
        ),
      ]),
      section("Reglas Melodicas y Armonicas", [
        paragraph(
          "El contrapunto busca que cada voz sea una melodia 'cantabile' por si misma, no solo un relleno armonico.",
        ),
        list([
          "Movimiento: Se prefiere el movimiento contrario para asegurar la independencia.",
          "Saltos: Evitar saltos de 7a, 9a o intervalos aumentados/disminuidos (excepto la 4a disminuida en ciertos contextos).",
          "Unisono: Solo se permite en el primer y ultimo compas (en 1a especie).",
          "Consonancias Perfectas: Las 5as y 8as no pueden ser paralelas ni directas fuertes.",
        ]),
      ]),
      section("La Cuarta Especie: Suspensiones", [
        paragraph(
          "Es la especie mas importante para entender la disonancia funcional. Una suspension tiene tres partes: Preparacion (consonante), Percusion (disonante por sincopa) y Resolucion (consonante bajando por grado conjunto).",
        ),
        example("Tipos de Suspension en el Bajo", [
          "Suspension 7-6: Muy comun en secuencias.",
          "Suspension 4-3: Tipica de cadencias finales.",
          "Suspension 2-3: Ocurre cuando la voz inferior tiene la suspension.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Pensar que contrapunto es solo una lista de prohibiciones.",
      "Escribir lineas rigidas o sin arco melodico.",
      "Introducir disonancia sin preparacion ni resolucion.",
    ],
    reviewSummary: [
      "Las especies entrenan progresivamente la independencia de voces.",
      "Consonancia y disonancia se regulan con precision estilistica.",
      "La calidad melodica de cada voz importa tanto como la combinacion vertical.",
    ],
    checklistItems: [
      {
        id: "ce-1",
        text: "Puedo explicar que cambia entre 1a, 2a y 4a especie.",
      },
      {
        id: "ce-2",
        text: "Se que la 4a especie gira en torno a suspensiones.",
      },
      { id: "ce-3", text: "Evito paralelos y mantengo lineas cantables." },
    ],
    microExercises: [
      {
        prompt: "Que caracteriza a la 1a especie?",
        answer: "Una nota contra una nota y solo consonancias.",
      },
      {
        prompt: "En que especie la suspension es el recurso central?",
        answer: "En la 4a especie.",
      },
      {
        prompt: "Que movimiento suele preferirse entre voces?",
        answer: "Movimiento contrario u oblicuo.",
      },
    ],
    glossary: [
      {
        term: "Especie",
        definition:
          "Nivel metodologico de complejidad dentro del estudio de contrapunto.",
      },
      {
        term: "Suspension",
        definition: "Disonancia preparada que resuelve por paso.",
      },
      {
        term: "Contrapunto florido",
        definition: "Quinta especie, combinacion libre de ritmos y recursos.",
      },
      {
        term: "Movimiento contrario",
        definition: "Dos voces que avanzan en direcciones opuestas.",
      },
    ],
  }),
  createChapter({
    chapterId: "contrapunto-invertible",
    unit: "Bloque 5. Contrapunto",
    focusBadge: "Tecnica avanzada",
    title: "Contrapunto invertible",
    summary:
      "Escritura de voces que pueden intercambiar posiciones sin destruir consonancia ni funcion.",
    objective:
      "Comprender la logica de las inversiones a la octava, decima y duodecima en dos voces.",
    prerequisites: ["contrapunto-de-especies", "intervalos"],
    studyFlow: [
      "Piensa cada intervalo y su inversion.",
      "Evita combinaciones que se vuelvan disonantes al invertirse.",
      "Prueba el intercambio real de las voces antes de cerrar.",
    ],
    memoryHooks: [
      "3a invierte a 6a.",
      "6a invierte a 3a.",
      "Lo que sirve arriba debe seguir sirviendo abajo.",
    ],
    examFocus: [
      "Definir contrapunto invertible.",
      "Aplicar inversiones de intervalos a dos voces.",
      "Prever que intervalos conviene evitar segun el tipo de inversion.",
    ],
    sections: [
      section("Fundamentos de la Inversion", [
        paragraph(
          "El contrapunto invertible permite que la voz superior pase abajo y la inferior arriba sin perder sentido musical. Eso obliga a prever no solo el intervalo actual, sino el que surgira tras la inversion.",
        ),
        table(
          ["Intervalo Original", "Inversion (Octava)", "Inversion (Decima)", "Inversion (Duodecima)"],
          [
            ["1 (Unisono)", "8 (Octava)", "10 (Decima)", "12 (Duodecima)"],
            ["2 (Segunda)", "7 (Septima)", "9 (Novena)", "11 (Oncena)"],
            ["3 (Tercera)", "6 (Sexta)", "8 (Octava)", "10 (Decima)"],
            ["4 (Cuarta)", "5 (Quinta)", "7 (Septima)", "9 (Novena)"],
            ["5 (Quinta)", "4 (Cuarta)", "6 (Sexta)", "8 (Octava)"],
            ["6 (Sexta)", "3 (Tercera)", "5 (Quinta)", "7 (Septima)"],
            ["7 (Septima)", "2 (Segunda)", "4 (Cuarta)", "6 (Sexta)"],
            ["8 (Octava)", "1 (Unisono)", "3 (Tercera)", "5 (Quinta)"],
          ],
        ),
      ]),
      section("Reglas por Tipo de Inversion", [
        paragraph(
          "Dependiendo del intervalo de inversion (8, 10 o 12), ciertos intervalos 'seguros' pueden volverse problematicos.",
        ),
        list([
          "Inversion a la Octava: La 5a es el intervalo mas critico, pues se convierte en 4a (disonante en contrapunto a 2 voces). Se debe tratar como disonancia o evitarse en tiempos fuertes.",
          "Inversion a la Decima: Las 3as, 6as y 10as son seguras. Se deben evitar los movimientos paralelos de 3a o 10a, ya que tras la inversion produciran octavas o unisonos paralelos.",
          "Inversion a la Duodecima: La 6a es el intervalo critico, ya que se convierte en 7a. La 3a se convierte en 10a (segura).",
        ]),
        example("Ejemplo de Inversion a la Octava", [
          "Voz Sup: E - F - G (3a - 4a - 5a sobre C)",
          "Voz Inf: C - C - C",
          "INVERTIDO ->",
          "Voz Sup: C - C - C",
          "Voz Inf: E - F - G (6a - 5a - 4a bajo C)",
          "Nota: La 5a original se volvio 4a disonante.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Revisar solo el intervalo actual y no su inversion resultante.",
      "Olvidar que una 5a pasa a 4a, que puede ser problematica segun contexto.",
      "No comprobar el registro final despues del intercambio.",
    ],
    reviewSummary: [
      "El contrapunto invertible exige pensar en dos estados de la misma pareja de voces.",
      "Las inversiones de intervalos son la herramienta basica para planearlo.",
      "No toda combinacion consonante inicial sigue siendo util al invertirse.",
    ],
    checklistItems: [
      { id: "ci-1", text: "Puedo invertir intervalos simples con seguridad." },
      {
        id: "ci-2",
        text: "Comprendo por que 3as y 6as son tan utiles para inversion.",
      },
      {
        id: "ci-3",
        text: "Reviso la nueva textura despues del intercambio de voces.",
      },
    ],
    microExercises: [
      { prompt: "A que invierte una 6a?", answer: "A una 3a." },
      {
        prompt: "Por que la 5a requiere cuidado en contrapunto invertible?",
        answer:
          "Porque al invertirse produce una 4a, que puede ser disonante segun el contexto.",
      },
      {
        prompt: "Que es contrapunto invertible?",
        answer:
          "Escritura de voces que sigue funcionando cuando cambian de posicion registral.",
      },
    ],
    glossary: [
      {
        term: "Inversion",
        definition:
          "Intercambio de posicion entre voces o complemento intervalico dentro de la octava.",
      },
      {
        term: "Contrapunto invertible",
        definition:
          "Contrapunto preparado para sonar correctamente tambien al invertirse.",
      },
      {
        term: "Decima",
        definition:
          "Tercera mas una octava; inversion frecuente en escritura a dos voces.",
      },
      {
        term: "Duodecima",
        definition:
          "Quinta mas una octava; otro marco de inversion contrapuntistica.",
      },
    ],
  }),
  createChapter({
    chapterId: "introduccion-a-la-fuga",
    unit: "Bloque 5. Contrapunto",
    focusBadge: "Culminacion imitativa",
    title: "Introduccion a la fuga",
    summary:
      "Elementos basicos de la fuga tonal: sujeto, respuesta, contrasujeto, episodios y reexposiciones.",
    objective:
      "Reconocer la arquitectura general de una fuga y la funcion de sus materiales principales.",
    prerequisites: [
      "contrapunto-de-especies",
      "contrapunto-invertible",
      "funciones-tonales",
    ],
    studyFlow: [
      "Ubica primero el sujeto.",
      "Distingue la respuesta real o tonal.",
      "Observa como los episodios desarrollan fragmentos entre entradas.",
    ],
    memoryHooks: [
      "Sujeto = idea principal.",
      "Respuesta = imitacion en otra voz, normalmente en dominante.",
      "Episodio = desarrollo sin entrada completa del sujeto.",
    ],
    examFocus: [
      "Definir sujeto, respuesta, contrasujeto y episodio.",
      "Distinguir exposicion y secciones intermedias.",
      "Reconocer el papel de la dominante en la respuesta.",
    ],
    sections: [
      section("Arquitectura de la Fuga", [
        paragraph(
          "La fuga es la culminacion del pensamiento contrapuntistico tonal. Mas que una 'forma' rigida, es un procedimiento de imitacion continua de un tema principal llamado Sujeto.",
        ),
        table(
          ["Elemento", "Definicion", "Funcion"],
          [
            ["Sujeto", "Tema principal", "Inaugura la fuga en la tonica"],
            ["Respuesta", "Imitacion del sujeto", "Aparece en la dominante (v o V)"],
            ["Contrasujeto", "Contrapunto recurrente", "Acompaña al sujeto/respuesta tras su entrada"],
            ["Codetta", "Pequeño puente", "Conecta la respuesta con la siguiente entrada"],
            ["Episodio", "Seccion libre", "Modula o desarrolla motivos entre entradas"],
            ["Estrecho (Stretto)", "Superposicion", "Las entradas se encabalgan para crear tension"],
          ],
        ),
      ]),
      section("La Exposicion", [
        paragraph(
          "Es la primera seccion de la fuga, donde todas las voces (2, 3, 4 o mas) presentan el sujeto o la respuesta una vez cada una. El orden de entrada suele ser alternativo (Sujeto - Respuesta - Sujeto - Respuesta).",
        ),
        list([
          "Respuesta Real: Transposicion exacta del sujeto a la quinta justa.",
          "Respuesta Tonal: Algunos intervalos se modifican (especialmente el salto de 5a a 4a) para no alejarse de la tonica original demasiado pronto.",
          "Contraexposicion: A veces sigue a la exposicion, con el mismo orden de voces pero distinta relacion sujeto/respuesta.",
        ]),
      ]),
      section("Desarrollo y Final", [
        paragraph(
          "Tras la exposicion, la fuga alterna Episodios (sin sujeto completo) y Entradas (sujeto completo en tonalidades vecinas).",
        ),
        list([
          "Pedal de Dominante: Suele preceder al final para acumular tension.",
          "Stretto Final: Las voces entran con el sujeto antes de que la anterior termine, aumentando la densidad.",
          "Tierce de Picardie: En fugas en modo menor, es comun terminar con un acorde de Tonica mayor.",
        ]),
        example("Estructura de Fuga a 3 voces", [
          "Voz 1: Sujeto (I) -> Contrasujeto 1 -> Contrasujeto 2 -> Episodio",
          "Voz 2:           -> Respuesta (V) -> Contrasujeto 1 -> Episodio",
          "Voz 3:                            -> Sujeto (I)    -> Episodio",
        ]),
      ]),
    ],
    commonMistakes: [
      "Pensar que toda imitacion es ya una fuga.",
      "No distinguir entrada completa del sujeto frente a episodio.",
      "Confundir respuesta tonal con error de transposicion.",
    ],
    reviewSummary: [
      "La fuga organiza entradas imitativas de un sujeto principal.",
      "Respuesta, contrasujeto y episodios articulan la forma.",
      "La respuesta tonal protege el equilibrio del centro tonal.",
    ],
    checklistItems: [
      {
        id: "fug-1",
        text: "Puedo identificar sujeto y respuesta en una exposicion simple.",
      },
      { id: "fug-2", text: "Se que es un episodio dentro de una fuga." },
      {
        id: "fug-3",
        text: "No confundo fuga con cualquier canon o imitacion libre.",
      },
    ],
    microExercises: [
      { prompt: "Que es el sujeto?", answer: "El tema principal de la fuga." },
      {
        prompt: "Que diferencia hay entre respuesta real y tonal?",
        answer:
          "La real transpone exactamente; la tonal ajusta intervalos para mantener equilibrio tonal.",
      },
      {
        prompt: "Que hace un episodio?",
        answer: "Desarrolla material y conecta entradas del sujeto.",
      },
    ],
    glossary: [
      { term: "Sujeto", definition: "Tema principal de la fuga." },
      {
        term: "Respuesta",
        definition: "Imitacion del sujeto, usualmente en la dominante.",
      },
      {
        term: "Contrasujeto",
        definition: "Contrapunto recurrente que acompana al sujeto.",
      },
      {
        term: "Estrecho",
        definition: "Entrada superpuesta o muy cercana de sujetos.",
      },
    ],
  }),
  createChapter({
    chapterId: "forma-sonata",
    unit: "Bloque 6. Forma y analisis",
    focusBadge: "Forma central clasica",
    title: "Forma sonata",
    summary:
      "Esquema de exposicion, desarrollo y recapitulacion propio del clasicismo y buena parte del romanticismo.",
    objective:
      "Reconocer las funciones formales de la forma sonata y no reducirla a una simple lista de secciones.",
    prerequisites: ["forma-musical", "modulacion", "analisis-de-obras"],
    studyFlow: [
      "Ubica la exposicion y sus zonas tematicas.",
      "Identifica donde el desarrollo rompe la estabilidad.",
      "Confirma la recapitulacion por el regreso del tema en la tonalidad principal.",
    ],
    memoryHooks: [
      "Exposicion presenta, desarrollo transforma, recapitulacion reconcilia.",
      "Tema B suele modular en exposicion.",
      "La recapitulacion trae de vuelta el material a la tonica.",
    ],
    examFocus: [
      "Describir exposicion, desarrollo y recapitulacion.",
      "Explicar la relacion entre forma y tonalidad.",
      "Reconocer introduccion lenta o coda como elementos opcionales.",
    ],
    sections: [
      section("Estructura Tripartita y Plan Tonal", [
        paragraph(
          "La Forma Sonata es el diseño estructural mas importante del periodo clasico. Se basa en una dialectica entre dos temas o grupos tematicos (A y B) y un plan tonal de tension y resolucion.",
        ),
        table(
          ["Seccion", "Sub-seccion", "Contenido Tematico", "Plan Tonal"],
          [
            ["Exposicion", "Tema A", "Caracter energico, Tonica", "I (o i)"],
            ["", "Puente", "Transicion modulante", "I -> V"],
            ["", "Tema B", "Caracter cantabile, contraste", "V (o III en menor)"],
            ["", "Codetta", "Cierre de la exposicion", "V"],
            ["Desarrollo", "Desarrollo", "Fragmentacion de A y B", "Inestabilidad (varias ton.)"],
            ["Recapitulacion", "Tema A", "Retorno del tema principal", "I"],
            ["", "Puente", "Adaptado para no modular", "I"],
            ["", "Tema B", "Retorno en la tonica", "I"],
            ["", "Coda", "Cierre definitivo de la obra", "I"],
          ],
        ),
      ]),
      section("Dinamica de las Secciones", [
        list([
          "Exposicion: Presenta el conflicto. El paso de la Tonica a la Dominante es el motor de toda la forma.",
          "Desarrollo: Es la zona de mayor tension. El compositor utiliza tecnicas como la fragmentacion, la secuencia y el contrapunto para 'desarmar' los temas.",
          "Recapitulacion: Resuelve el conflicto tonal. Al reexponer el Tema B en la Tonica, se 'reconcilia' el material contrastante con el centro tonal original.",
        ]),
      ]),
      section("Elementos Opcionales", [
        paragraph(
          "Muchas sonatas incluyen una Introduccion Lenta (para crear expectativa) y una Coda final (para dar mayor peso al cierre).",
        ),
        example("Plan Tonal en C Mayor", [
          "Exposicion: Tema A (C) -> Tema B (G)",
          "Desarrollo: Pasa por Am, Dm, F...",
          "Recapitulacion: Tema A (C) -> Tema B (C)",
        ]),
      ]),
    ],
    commonMistakes: [
      "Buscar un molde exacto sin considerar variantes historicas.",
      "Confundir cualquier ternaria grande con forma sonata.",
      "No relacionar el cambio formal con el plan tonal.",
    ],
    reviewSummary: [
      "La forma sonata se entiende por funcion, no por rigidez mecanica.",
      "La tension tonal entre salida y regreso es central.",
      "Exposicion, desarrollo y recapitulacion cumplen roles distintos.",
    ],
    checklistItems: [
      {
        id: "son-1",
        text: "Puedo explicar la funcion de cada gran seccion de la forma sonata.",
      },
      {
        id: "son-2",
        text: "Se donde buscar la modulacion principal de la exposicion.",
      },
      {
        id: "son-3",
        text: "Reconozco el regreso estructural de la recapitulacion.",
      },
    ],
    microExercises: [
      {
        prompt: "Que hace el desarrollo en forma sonata?",
        answer: "Transforma y desestabiliza el material presentado.",
      },
      {
        prompt: "Que marca el regreso de la recapitulacion?",
        answer: "El retorno del material principal en la tonalidad principal.",
      },
      {
        prompt: "A donde suele modular la exposicion en modo mayor?",
        answer: "A la dominante.",
      },
    ],
    glossary: [
      {
        term: "Exposicion",
        definition: "Seccion que presenta el material tematico principal.",
      },
      {
        term: "Desarrollo",
        definition: "Seccion de transformacion, secuencias y tension.",
      },
      {
        term: "Recapitulacion",
        definition: "Retorno del material dentro de la tonalidad principal.",
      },
      {
        term: "Coda",
        definition: "Cierre ampliado posterior a la recapitulacion.",
      },
    ],
  }),
  createChapter({
    chapterId: "rondo",
    unit: "Bloque 6. Forma y analisis",
    focusBadge: "Retorno tematico",
    title: "Rondo",
    summary:
      "Forma de alternancia entre un estribillo recurrente y episodios contrastantes.",
    objective:
      "Distinguir esquemas de rondo y entender la funcion del retorno recurrente del tema A.",
    prerequisites: ["forma-musical"],
    studyFlow: [
      "Detecta primero el estribillo.",
      "Marca cada retorno literal o variado del tema A.",
      "Relaciona los episodios con su contraste tonal o textural.",
    ],
    memoryHooks: [
      "ABACA es el rondo corto clasico.",
      "El retorno de A da identidad y orientacion.",
      "Cada episodio debe contrastar lo suficiente para justificar el regreso.",
    ],
    examFocus: [
      "Reconocer rondo simple y expandido.",
      "Diferenciar rondo de forma ternaria.",
      "Explicar la funcion de episodios y retornos.",
    ],
    sections: [
      section("El Estribillo y los Episodios", [
        paragraph(
          "El Rondó se basa en la alternancia entre un tema recurrente (Estribillo o Refrain) y secciones de contraste (Episodios o Couplets). Es una de las formas mas antiguas y populares, derivando de danzas circulares francesas.",
        ),
        table(
          ["Esquema", "Tipo", "Estructura Tonal"],
          [
            ["A B A C A", "Rondó de 5 partes", "A(I) - B(V) - A(I) - C(vi/IV) - A(I)"],
            ["A B A C A B A", "Rondó de 7 partes", "Simetrico, mayor desarrollo"],
            ["A B A C A D A...", "Rondó encadenado", "Varios episodios contrastantes"],
          ],
        ),
      ]),
      section("Sonata-Rondó", [
        paragraph(
          "En el periodo clasico, surgió un hibrido que combina el retorno tematico del rondó con la logica tonal de la sonata. La seccion B se comporta como el 'segundo tema' de una sonata, apareciendo en la dominante en la primera seccion y regresando en la tonica al final.",
        ),
        example("Esquema Sonata-Rondó", [
          "Exposicion: A (Tonica) -> B (Dominante) -> A (Tonica)",
          "Desarrollo: C (Tonalidad contrastante)",
          "Recapitulacion: A (Tonica) -> B (Tonica) -> A (Tonica)",
        ]),
      ]),
      section("Caracteristicas del Estribillo (A)", [
        paragraph(
          "El tema A debe ser pegadizo, ritmicamente claro y usualmente termina en una cadencia autentica perfecta (CAP) para que cada regreso se sienta como una llegada a casa estable despues de la aventura tonal del episodio.",
        ),
      ]),
    ],
    commonMistakes: [
      "Llamar rondo a cualquier forma con repeticion del inicio.",
      "No distinguir episodio de simple extension del estribillo.",
      "Confundir sonata-rondo con forma sonata ordinaria.",
    ],
    reviewSummary: [
      "El rondo gira en torno al regreso repetido de A.",
      "Los episodios aportan contraste y preparan cada retorno.",
      "ABACA y ABACABA son esquemas de referencia, no moldes absolutos.",
    ],
    checklistItems: [
      {
        id: "ron-1",
        text: "Puedo reconocer un estribillo recurrente en un rondo.",
      },
      { id: "ron-2", text: "Diferencio rondo de forma ternaria simple." },
      {
        id: "ron-3",
        text: "Identifico cuando un episodio realmente contrasta con A.",
      },
    ],
    microExercises: [
      { prompt: "Que esquema resume un rondo simple?", answer: "ABACA." },
      {
        prompt: "Que define al rondo?",
        answer: "El regreso recurrente del tema A entre episodios.",
      },
      {
        prompt: "Cuantas veces suele volver A en un rondo clasico?",
        answer: "Mas de una, por eso se diferencia de la ternaria.",
      },
    ],
    glossary: [
      {
        term: "Estribillo",
        definition: "Tema recurrente del rondo, usualmente A.",
      },
      {
        term: "Episodio",
        definition: "Seccion contrastante entre apariciones del estribillo.",
      },
      {
        term: "Sonata-rondo",
        definition: "Hibrido entre retorno de rondo y logica tonal de sonata.",
      },
      {
        term: "Retorno",
        definition:
          "Nueva aparicion del material principal despues de contraste.",
      },
    ],
  }),
  createChapter({
    chapterId: "tema-y-variaciones",
    unit: "Bloque 6. Forma y analisis",
    focusBadge: "Transformacion controlada",
    title: "Tema y variaciones",
    summary:
      "Forma donde un tema base reaparece transformado por ritmo, textura, armonia o caracter.",
    objective:
      "Reconocer que rasgos del tema permanecen y cuales cambian en cada variacion.",
    prerequisites: ["forma-musical", "analisis-de-obras"],
    studyFlow: [
      "Estudia primero el tema base completo.",
      "Compara cada variacion con el tema original.",
      "Anota que se conserva: armonia, fraseo, bajo, melodia o esquema formal.",
    ],
    memoryHooks: [
      "Variar no es improvisar sin limite: siempre queda huella del tema.",
      "A veces cambia la superficie y se conserva la armonia.",
      "La identidad puede vivir en el bajo, el ritmo o el contorno melodico.",
    ],
    examFocus: [
      "Definir la forma tema y variaciones.",
      "Identificar elementos invariantes entre tema y variaciones.",
      "Explicar estrategias comunes de transformacion.",
    ],
    sections: [
      section("Tecnicas de Variacion", [
        paragraph(
          "Variar no es simplemente cambiar notas, sino transformar una idea manteniendo su esencia. En el periodo clasico, las variaciones suelen conservar el esquema armonico y la estructura de frases del tema original.",
        ),
        table(
          ["Tipo de Variacion", "Descripcion", "Que cambia", "Que se mantiene"],
          [
            ["Ornamental", "Adorno de la melodia", "Figuracion rítmica", "Armonia y Estructura"],
            ["Caracteristica", "Cambio de estilo o aire", "Tempo, Dinamica, Modo", "Contorno Melodico"],
            ["Armonica", "Rearmonizacion del tema", "Acordes, Cromatismo", "Melodia y Fraseo"],
            ["Simplificada", "Reduccion a lo esencial", "Densidad de notas", "Esqueleto armonico"],
            ["Fantasía / Libre", "Transformacion radical", "Casi todo", "Motivo o germen rítmico"],
          ],
        ),
      ]),
      section("Formas Afines: Chacona y Pasacalle", [
        paragraph(
          "Son variaciones continuas sobre un bajo obstinado (Ostinato). Mientras el bajo se repite constantemente, las voces superiores despliegan variaciones de textura y contrapunto.",
        ),
        list([
          "Chacona: Variaciones sobre una progresion armonica fija.",
          "Pasacalle: Variaciones sobre una melodia fija en el bajo.",
        ]),
      ]),
      section("Como Escuchar una Variacion", [
        paragraph(
          "Para analizar variaciones, debemos buscar los 'invariantes': ¿Sigue el bajo haciendo la misma progresion? ¿Estan las frases en el mismo lugar? ¿Aparece el motivo original escondido en la nueva figuracion?",
        ),
        example("Ejemplos Famosos", [
          "Bach: Variaciones Goldberg (basadas en el bajo del Aria).",
          "Beethoven: Variaciones Diabelli (transformacion de caracter).",
          "Mozart: 'Ah, vous dirai-je, Maman' (variacion ornamental).",
        ]),
      ]),
    ],
    commonMistakes: [
      "Pensar que una variacion debe mantener la melodia intacta.",
      "No distinguir cambios superficiales de cambios estructurales.",
      "Analizar cada variacion como pieza aislada sin relacionarla con el tema.",
    ],
    reviewSummary: [
      "Tema y variaciones conserva una identidad base a traves de transformaciones.",
      "La permanencia puede estar en armonia, fraseo, bajo o contorno.",
      "El analisis compara cada variacion con el tema original.",
    ],
    checklistItems: [
      {
        id: "tyv-1",
        text: "Puedo explicar que rasgo conserva una variacion respecto al tema.",
      },
      { id: "tyv-2", text: "Identifico cambios de ritmo, textura o modo." },
      {
        id: "tyv-3",
        text: "No trato cada variacion como si no tuviera relacion con la original.",
      },
    ],
    microExercises: [
      {
        prompt: "Que suele conservarse en muchas variaciones clasicas?",
        answer: "El esquema armónico y la longitud de frase.",
      },
      {
        prompt: "Una variacion necesita repetir la melodia exacta?",
        answer: "No. Puede conservar otros rasgos estructurales.",
      },
      {
        prompt: "Que analiza primero antes de comparar variaciones?",
        answer: "El tema base.",
      },
    ],
    glossary: [
      {
        term: "Tema",
        definition: "Material original del que parten las variaciones.",
      },
      {
        term: "Variacion",
        definition:
          "Transformacion del tema que conserva alguna identidad estructural.",
      },
      {
        term: "Rearmonizacion",
        definition: "Cambio o enriquecimiento del soporte armónico.",
      },
      {
        term: "Figuracion",
        definition: "Patron rítmico o textural de la superficie musical.",
      },
    ],
  }),
  createChapter({
    chapterId: "analisis-de-obras",
    unit: "Bloque 6. Forma y analisis",
    focusBadge: "Sintesis aplicada",
    title: "Analisis de obras",
    summary:
      "Metodo practico para combinar forma, armonia, motivo y contexto en el estudio de una pieza completa.",
    objective:
      "Pasar del analisis de conceptos aislados al analisis integrado de una obra real.",
    prerequisites: [
      "introduccion-analisis-armonico",
      "forma-musical",
      "modulacion",
    ],
    studyFlow: [
      "Haz una lectura global antes de entrar en detalle.",
      "Marca forma, cadencias y regiones tonales grandes.",
      "Solo despues baja al nivel de motivos, acordes y texturas concretas.",
    ],
    memoryHooks: [
      "Del panorama a la lupa, no al reves.",
      "Las cadencias y retornos estructuran la obra.",
      "Un buen analisis explica relaciones, no solo etiquetas.",
    ],
    examFocus: [
      "Proponer un metodo ordenado de analisis.",
      "Relacionar forma y tonalidad.",
      "Sostener interpretaciones con evidencia musical visible u audible.",
    ],
    sections: [
      section("Metodología de Análisis Integrado", [
        paragraph(
          "El análisis de una obra completa requiere combinar todas las herramientas aprendidas (armonía, contrapunto, forma y ritmo) para entender cómo funciona la música como un todo.",
        ),
        table(
          ["Nivel de Análisis", "Qué buscar", "Herramientas clave"],
          [
            ["Macroforma", "Grandes secciones (A, B, C)", "Cadencias estructurales, Retornos"],
            ["Tonalidad", "Plan de modulaciones", "Círculo de quintas, Acordes pivote"],
            ["Microforma", "Frases, Periodos, Motivos", "Análisis de intervalos y ritmo"],
            ["Textura", "Relación entre voces", "Contrapunto, Melodía acompañada"],
            ["Estilo", "Contexto y lenguaje", "Convenciones de la época"],
          ],
        ),
      ]),
      section("Guía de Análisis en 4 Pasos", [
        list([
          "1. Audición y Lectura Global: Identificar el carácter, tempo y forma general sin detenerse en detalles.",
          "2. Esqueleto Armónico y Tonal: Marcar las cadencias principales y las tonalidades por las que pasa la obra.",
          "3. Segmentación y Temas: Delimitar las frases y reconocer los motivos rítmico-melódicos principales.",
          "4. Síntesis e Interpretación: Explicar cómo los elementos anteriores generan unidad (cohesión) y variedad (contraste).",
        ]),
      ]),
      section("Ejemplo de Análisis Aplicado", [
        example("Minueto en G de Petzold (Bach)", [
          "Forma: Binaria (A-B) con repeticiones.",
          "Armonía: Empieza en G, modula a D (Dominante) al final de A, regresa a G en B.",
          "Motivo: Una idea de corcheas ascendentes que se repite y varía.",
          "Textura: Melodía acompañada (homofonía) con momentos de contrapunto simple.",
        ]),
        paragraph(
          "Recuerda: Un buen análisis no es una lista de etiquetas, sino una narración de cómo la música se despliega en el tiempo.",
        ),
      ]),
    ],
    commonMistakes: [
      "Ir directo al microdetalle sin haber entendido la forma general.",
      "Confundir descripcion con interpretacion analitica.",
      "Dar conclusiones sin evidencia musical.",
    ],
    reviewSummary: [
      "Un analisis util combina vision global y detalle local.",
      "Forma, tonalidad y motivo deben leerse en conjunto.",
      "La evidencia musical sostiene cualquier afirmacion analitica.",
    ],
    checklistItems: [
      {
        id: "ao-1",
        text: "Tengo un metodo de varias pasadas para abordar una obra.",
      },
      {
        id: "ao-2",
        text: "Puedo conectar forma, armonia y motivo en una explicacion comun.",
      },
      { id: "ao-3", text: "Evito acumular etiquetas sin interpretarlas." },
    ],
    microExercises: [
      {
        prompt: "Que conviene hacer primero al analizar una obra?",
        answer:
          "Una lectura global para detectar forma y puntos estructurales.",
      },
      {
        prompt: "Que articulan muchas secciones formales?",
        answer: "Las cadencias.",
      },
      {
        prompt: "Que diferencia hay entre describir y analizar?",
        answer:
          "Analizar explica la funcion y relacion de los elementos, no solo los enumera.",
      },
    ],
    glossary: [
      {
        term: "Jerarquia estructural",
        definition:
          "Diferencia entre eventos centrales y eventos superficiales.",
      },
      {
        term: "Motivo",
        definition: "Unidad breve reconocible que puede transformarse.",
      },
      {
        term: "Cadencia estructural",
        definition: "Llegada que delimita o confirma una seccion importante.",
      },
      {
        term: "Hipotesis analitica",
        definition:
          "Interpretacion argumentada sobre el funcionamiento de la obra.",
      },
    ],
  }),
  createChapter({
    chapterId: "armonia-extendida",
    unit: "Bloque 7. Teoria post-tonal",
    focusBadge: "Puente a modernidad",
    title: "Armonia extendida",
    summary:
      "Uso funcional y coloristico de 9as, 11as y 13as mas alla de la triada y la septima basica.",
    objective:
      "Entender cuando una extension amplia el acorde sin anular su funcion principal.",
    prerequisites: [
      "acordes-de-septima",
      "arpegios-y-extensiones",
      "dominantes-alteradas",
    ],
    studyFlow: [
      "Parte de un acorde de septima bien definido.",
      "Agrega una extension y evalua su compatibilidad con la 3a.",
      "Decide si la extension funciona como color estable o tension de resolucion.",
    ],
    memoryHooks: [
      "9 = 2 + octava, 11 = 4 + octava, 13 = 6 + octava.",
      "La funcion base del acorde sigue importando.",
      "No toda extension se acomoda igual en cualquier calidad.",
    ],
    examFocus: [
      "Construir acordes con 9as, 11as y 13as.",
      "Distinguir extension estable de tension conflictiva.",
      "Relacionar extensiones con la cualidad del acorde base.",
    ],
    sections: [
      section("De Septima a Acorde Extendido", [
        paragraph(
          "La armonia extendida conserva el nucleo funcional del acorde y agrega colores por encima de la septima. Las extensiones naturales (9, 11, 13) se derivan de la escala diatonica, mientras que las alteradas (b9, #9, #11, b13) aportan cromatismo.",
        ),
        table(
          ["Calidad Base", "Extensiones Disponibles", "Evitar / Cuidado", "Efecto / Color"],
          [
            ["maj7 (I, IV)", "9, #11, 13", "11 natural (choque con la 3a)", "Brillante, Lidio (#11)"],
            ["m7 (ii, vi, iii)", "9, 11, 13", "b13 (choque con la 5a)", "Suave, Jazzy"],
            ["7 (V7)", "9, b9, #9, #11, 13, b13", "11 natural (choque con la 3a)", "Tension y Empuje"],
            ["m7b5 (vii°)", "11, b13", "9 natural", "Oscuro, Semidisminuido"],
          ],
        ),
      ]),
      section("Voicings y Disposicion", [
        paragraph(
          "En la practica (especialmente en el piano o la guitarra), no siempre se tocan todas las notas del acorde. Algunas notas son estructurales y otras pueden omitirse sin perder la identidad del acorde extendido.",
        ),
        list([
          "Notas Imprescindibles: La 3a y la 7a (definen la funcion). La extension deseada (9, 11 o 13).",
          "Notas Omitibles: La 5a justa (no aporta funcion). La fundamental (si el bajo la toca).",
          "Tensiones Disponibles: En Jazz, se dice que una tension es disponible si esta un tono por encima de una nota del acorde (evitando la 9a menor interna, excepto en dominantes).",
        ]),
      ]),
      section("Armonia por Cuartas y Poliacordes", [
        paragraph(
          "Mas alla de las terceras superpuestas, la armonia extendida abre la puerta a nuevas sonoridades:",
        ),
        list([
          "Acordes de Cuartas: Construidos apilando intervalos de 4a justa (ej: C-F-Bb). Sonoros y ambiguos.",
          "Poliacordes: Dos triadas distintas sonando simultaneamente (ej: D mayor sobre C mayor), creando una tension compleja.",
          "Clusters: Acordes formados por segundas consecutivas, creando una mancha sonora de gran densidad.",
        ]),
        example("Poliacorde Cmaj13(#11)", [
          "Se puede pensar como una triada de B minor sobre una triada de C major.",
          "Notas: (C-E-G) + (B-D-F#)",
          "Resultado: 1, 3, 5, 7, 9, #11",
        ]),
      ]),
    ],
    commonMistakes: [
      "Olvidar la funcion base del acorde al ver numeros grandes.",
      "Pensar que 11 siempre sirve sobre cualquier acorde mayor sin conflicto.",
      "Acumular extensiones sin escuchar el resultado.",
    ],
    reviewSummary: [
      "La armonia extendida parte de acordes de septima ya definidos.",
      "Las extensiones colorean o tensan sin borrar necesariamente la funcion.",
      "3a y 7a siguen siendo el ancla del acorde funcional.",
    ],
    checklistItems: [
      {
        id: "ae-1",
        text: "Puedo escribir un m9, maj9 y 13 desde una raiz dada.",
      },
      {
        id: "ae-2",
        text: "Se que la funcion base del acorde no desaparece por agregar extensiones.",
      },
      {
        id: "ae-3",
        text: "Reconozco que algunas extensiones chocan segun la calidad del acorde.",
      },
    ],
    microExercises: [
      {
        prompt: "Que extension suele asociarse a un acorde maj7 brillante?",
        answer: "La 9 o la #11 segun el color buscado.",
      },
      {
        prompt: "Que sigue definiendo un dominante aun con 13?",
        answer: "La 3a y la 7a.",
      },
      {
        prompt: "Que es una 13?",
        answer: "Una 6a colocada una octava arriba.",
      },
    ],
    glossary: [
      {
        term: "Extension",
        definition: "Nota agregada por encima de la septima: 9, 11 o 13.",
      },
      { term: "maj9", definition: "Acorde mayor con septima mayor y novena." },
      {
        term: "13",
        definition: "Acorde extendido que incluye la sexta una octava arriba.",
      },
      {
        term: "Color",
        definition: "Efecto sonoro agregado por una extension o alteracion.",
      },
    ],
  }),
  createChapter({
    chapterId: "cromatismo-avanzado",
    unit: "Bloque 7. Teoria post-tonal",
    focusBadge: "Borde de la tonalidad",
    title: "Cromatismo avanzado",
    summary:
      "Uso intensivo de lineas cromaticas y relaciones ambiguas que erosionan la claridad tonal tradicional.",
    objective:
      "Reconocer como el cromatismo puede seguir siendo funcional o empezar a disolver la jerarquia tonal.",
    prerequisites: [
      "dominantes-alteradas",
      "modulacion-avanzada",
      "mezcla-modal",
    ],
    studyFlow: [
      "Pregunta primero si el centro tonal aun se percibe.",
      "Sigue las lineas cromaticas por voz, no solo los acordes aislados.",
      "Observa si el cromatismo confirma o debilita la funcion tradicional.",
    ],
    memoryHooks: [
      "Mas cromatismo no significa automaticamente atonalidad.",
      "La linea cromatica puede organizar lo que el acorde ya no aclara.",
      "Wagner tensiona la tonalidad antes de romperla del todo.",
    ],
    examFocus: [
      "Describir cromatismo lineal y armonico.",
      "Distinguir expansion tonal de disolucion tonal.",
      "Relacionar cromatismo con ambiguedad funcional en repertorios tardorromanticos.",
    ],
    sections: [
      section("Saturacion Cromatica y Conduccion Lineal", [
        paragraph(
          "El cromatismo avanzado surge cuando las lineas melodicas individuales se mueven por semitono de forma tan constante que la armonia vertical resultante se vuelve ambigua o secundaria. Este fenomeno es central en el Romanticismo tardio (Wagner, Strauss, Mahler).",
        ),
        table(
          ["Concepto", "Descripcion", "Ejemplo Musical"],
          [
            ["Acorde de Tristan", "Acorde ambiguo (F-B-D#-G#) que inicia el drama wagneriano", "Tristan e Isolda"],
            ["Planing (Deslizamiento)", "Movimiento paralelo de acordes de la misma calidad", "Debussy (Catedral Sumergida)"],
            ["Enarmonia Funcional", "Un acorde cambia su destino mediante el cambio de nombre de sus notas", "Modulacion a regiones lejanas"],
            ["Omnitonalidad", "Sensacion de que cualquier nota puede seguir a cualquier otra dentro de la tonalidad", "Liszt (Bagatela sin tonalidad)"],
          ],
        ),
      ]),
      section("Disolucion de la Tonalidad", [
        paragraph(
          "Cuando el cromatismo deja de ser un adorno y se convierte en la estructura, la jerarquia de Tonica-Dominante empieza a desmoronarse.",
        ),
        list([
          "Saturacion: El uso de las 12 notas de la octava en un espacio breve sin privilegiar ninguna.",
          "Evitacion de la Cadencia: Las frases nunca llegan a un reposo en la Tonica, manteniendo una tension infinita.",
          "Acordes por Cuartas y Tritonos: El abandono de la triada por terceras reduce la sensacion de reposo diatonico.",
        ]),
        example("El Acorde de Tristan (Wagner)", [
          "Notas: Fa - Si - Re# - Sol#",
          "Analisis: Se puede leer como una sexta aumentada francesa 'disfrazada' o como un ii semidisminuido con la 3a alterada.",
          "Significado: Su resolucion se retrasa durante horas en la opera, simbolizando el deseo insatisfecho.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Etiquetar como atonal cualquier pasaje con muchas alteraciones.",
      "No seguir las lineas cromaticas por voz.",
      "Analizar solo verticalmente un repertorio que se organiza mucho por linea.",
    ],
    reviewSummary: [
      "El cromatismo avanzado puede expandir o erosionar la tonalidad.",
      "La linea cromatica es tan importante como el acorde.",
      "El analisis debe medir el grado real de estabilidad tonal restante.",
    ],
    checklistItems: [
      {
        id: "ca-1",
        text: "Puedo explicar cuando un pasaje cromatico sigue siendo tonal.",
      },
      {
        id: "ca-2",
        text: "Sigo las lineas cromaticas individuales en el analisis.",
      },
      { id: "ca-3", text: "Diferencio expansion tonal de disolucion tonal." },
    ],
    microExercises: [
      {
        prompt: "Mucho cromatismo implica automaticamente atonalidad?",
        answer: "No. Puede seguir habiendo centro tonal.",
      },
      {
        prompt:
          "Que conviene seguir en un analisis cromatico ademas de los acordes?",
        answer: "Las lineas por voz.",
      },
      {
        prompt: "Que pregunta central haces ante un pasaje cromatico?",
        answer: "Si el centro tonal aun se percibe con claridad.",
      },
    ],
    glossary: [
      {
        term: "Cromatismo lineal",
        definition: "Movimiento por semitonos dentro de una voz.",
      },
      {
        term: "Cromatismo armonico",
        definition: "Uso de acordes o relaciones no diatonicas.",
      },
      {
        term: "Ambiguedad tonal",
        definition: "Situacion donde el centro o la funcion ya no son claros.",
      },
      {
        term: "Expansion tonal",
        definition: "Ampliacion del lenguaje tonal sin abandonarlo del todo.",
      },
    ],
  }),
  createChapter({
    chapterId: "introduccion-post-tonal",
    unit: "Bloque 7. Teoria post-tonal",
    focusBadge: "Cambio de paradigma",
    title: "Introduccion post-tonal",
    summary:
      "Primer contacto con musica sin jerarquia tonal tradicional, centrada en clases de altura, intervalos y colecciones.",
    objective:
      "Entender que el analisis post-tonal usa herramientas distintas a la funcion armonica clasica.",
    prerequisites: ["cromatismo-avanzado", "intervalos"],
    studyFlow: [
      "Suelta primero la expectativa de tonica-dominante.",
      "Observa clases de altura y patrones intervalicos.",
      "Agrupa sonidos por colecciones o motivos mas que por funciones.",
    ],
    memoryHooks: [
      "Sin tonica funcional, el intervalo gana protagonismo.",
      "La misma clase de altura se reconoce en cualquier octava.",
      "Analizar post-tonal no es 'usar numeros por usar'.",
    ],
    examFocus: [
      "Definir clase de altura y conjunto basico.",
      "Explicar por que el analisis tonal no basta en repertorio atonal.",
      "Reconocer patrones interválicos recurrentes.",
    ],
    sections: [
      section("De la Altura a la Clase de Altura (Pitch Class)", [
        paragraph(
          "En el analisis post-tonal, dejamos de pensar en 'Do central' o 'Do agudo' para pensar en la Clase de Altura (PC) 0. Todas las octavas de una misma nota son funcionalmente equivalentes.",
        ),
        table(
          ["Nota", "Clase de Altura (Entero)", "Nota", "Clase de Altura (Entero)"],
          [
            ["C", "0", "F# / Gb", "6"],
            ["C# / Db", "1", "G", "7"],
            ["D", "2", "G# / Ab", "8"],
            ["D# / Eb", "3", "A", "9"],
            ["E", "4", "A# / Bb", "10"],
            ["F", "5", "B", "11"],
          ],
        ),
      ]),
      section("Colecciones y Conjuntos (Sets)", [
        paragraph(
          "Al no haber tonica, los sonidos se agrupan en colecciones que definen el color de la obra. El analisis se centra en el contenido intervalico de estos conjuntos (Set Theory).",
        ),
        list([
          "Coleccion Diatonica: Las 7 notas de una escala mayor/menor, pero sin jerarquia de tonica.",
          "Escala de Tonos Enteros: 6 notas separadas por un tono (ej: C-D-E-F#-G#-A#). Sin centro claro.",
          "Escala Octatonica (Disminuida): Alternancia de tono y semitono (8 notas). Muy simetrica.",
          "Cromatica Total: El uso de las 12 notas de la octava.",
        ]),
      ]),
      section("Intervalos como Clases (Interval Classes)", [
        paragraph(
          "Un intervalo de 3a menor (3 semitonos) es equivalente a su inversion, la 6a mayor (9 semitonos), en terminos de contenido armonico. Se agrupan en 6 clases de intervalos principales (IC 1 a 6).",
        ),
        example("Ejemplos de Colecciones en el Siglo XX", [
          "Debussy: Uso extensivo de la escala de tonos y pentatonica.",
          "Stravinsky: Uso de la escala octatonica y poliacordes.",
          "Bartók: Ejes de simetria y proporcion aurea en los intervalos.",
        ]),
      ]),
    ],
    commonMistakes: [
      "Forzar analisis tonal donde ya no hay evidencia funcional suficiente.",
      "Pensar que la musica post-tonal carece de organizacion.",
      "Confundir altura absoluta con clase de altura.",
    ],
    reviewSummary: [
      "El analisis post-tonal cambia de herramientas, no renuncia al orden.",
      "La clase de altura ignora la octava y enfoca la identidad abstracta.",
      "Intervalos y colecciones sustituyen a la funcion tonal como eje principal.",
    ],
    checklistItems: [
      { id: "ipt-1", text: "Puedo definir clase de altura." },
      {
        id: "ipt-2",
        text: "Se por que la funcion tonal no basta en repertorio post-tonal.",
      },
      {
        id: "ipt-3",
        text: "Empiezo a escuchar patrones intervalicos y colecciones.",
      },
    ],
    microExercises: [
      {
        prompt: "Que agrupa una clase de altura?",
        answer: "Todas las apariciones de una nota sin importar octava.",
      },
      {
        prompt: "Que reemplaza a la funcion tonal como foco analitico?",
        answer: "Intervalos, clases de altura y colecciones.",
      },
      {
        prompt: "La musica post-tonal carece de estructura?",
        answer: "No. Tiene otros principios de organizacion.",
      },
    ],
    glossary: [
      {
        term: "Clase de altura",
        definition:
          "Categoria abstracta que agrupa alturas equivalentes por nombre, sin octava.",
      },
      {
        term: "Coleccion",
        definition: "Conjunto de clases de altura usadas como material.",
      },
      {
        term: "Atonal",
        definition: "Sin centro tonal tradicional claramente funcional.",
      },
      {
        term: "Simetria",
        definition: "Organizacion equilibrada de intervalos o colecciones.",
      },
    ],
  }),
  createChapter({
    chapterId: "serialismo-basico",
    unit: "Bloque 7. Teoria post-tonal",
    focusBadge: "Tecnica del siglo XX",
    title: "Serialismo basico",
    summary:
      "Introduccion a la tecnica dodecafonica: serie, retrogradacion, inversion y formas derivadas.",
    objective:
      "Comprender la idea de una fila de doce sonidos y las operaciones basicas que la transforman.",
    prerequisites: ["introduccion-post-tonal", "intervalos"],
    studyFlow: [
      "Construye una serie sin repetir notas antes de completar las doce.",
      "Aprende las operaciones P, R, I y RI.",
      "Observa como una obra deriva material de la misma fila.",
    ],
    memoryHooks: [
      "Serie = orden fijo de las 12 clases de altura.",
      "R invierte el orden; I invierte los intervalos.",
      "RI hace ambas cosas.",
    ],
    examFocus: [
      "Definir fila dodecafonica.",
      "Explicar P, R, I y RI.",
      "Leer una matriz simple como mapa de transformaciones.",
    ],
    sections: [
      section("La Serie Dodecafonica", [
        paragraph(
          "El serialismo (o dodecafonismo), desarrollado por Arnold Schoenberg, propone que las 12 notas de la octava son iguales y deben organizarse en una Serie (o Fila) fija antes de poder repetirse.",
        ),
        list([
          "Democracia Sonora: Ninguna nota actua como centro o tonica.",
          "Orden Fijo: La serie determina la sucesion de alturas en la melodia y la armonia.",
          "No Repeticion: No se repite una nota hasta que hayan sonado las otras 11 (con algunas excepciones artisticas).",
        ]),
      ]),
      section("Las Cuatro Formas de la Serie", [
        paragraph(
          "Una sola serie genera 48 variantes mediante transposicion y tres operaciones basicas:",
        ),
        table(
          ["Forma", "Nombre", "Descripcion", "Lectura en Matriz"],
          [
            ["P (Original)", "Prime", "La serie tal como fue concebida", "Izquierda a Derecha"],
            ["I (Invertida)", "Inversion", "Intervalos en espejo (si sube 3, baja 3)", "Arriba hacia Abajo"],
            ["R (Retrograda)", "Retrograde", "La serie leida desde el final", "Derecha a Izquierda"],
            ["RI (Retro. Inv.)", "Retrograde Inversion", "La inversion leida desde el final", "Abajo hacia Arriba"],
          ],
        ),
      ]),
      section("La Matriz 12x12", [
        paragraph(
          "La matriz es una herramienta matematica para visualizar todas las transposiciones de la serie. Permite al compositor elegir que forma usar para cada frase o seccion de la obra.",
        ),
        example("Ejemplo de Segmentacion Serial", [
          "Serie: C - C# - G - Bb - F - ... (P0)",
          "Inversion: C - B - F - D - G - ... (I0)",
          "Retrograda: ... - F - Bb - G - C# - C (R0)",
        ]),
      ]),
    ],
    commonMistakes: [
      "Confundir inversion de intervalos con tocar la serie en espejo registral arbitrario.",
      "Pensar que serialismo = ausencia total de repeticion perceptible.",
      "Intentar analizar una fila con categorias tonales tradicionales.",
    ],
    reviewSummary: [
      "La serie dodecafonica ordena las 12 clases de altura.",
      "P, R, I y RI son las operaciones basicas.",
      "La matriz organiza visualmente las transformaciones posibles.",
    ],
    checklistItems: [
      { id: "ser-1", text: "Puedo explicar que es una serie de doce sonidos." },
      { id: "ser-2", text: "Distinguo P, R, I y RI." },
      {
        id: "ser-3",
        text: "Comprendo para que sirve una matriz dodecafonica simple.",
      },
    ],
    microExercises: [
      {
        prompt: "Que significa R en serialismo?",
        answer: "Retrograda: la serie en orden inverso.",
      },
      {
        prompt: "Que hace I?",
        answer: "Invierte la direccion de los intervalos de la serie.",
      },
      {
        prompt: "Para que sirve la matriz?",
        answer: "Para visualizar las distintas formas de la serie.",
      },
    ],
    glossary: [
      {
        term: "Serie",
        definition:
          "Orden determinado de las 12 clases de altura sin repeticion previa.",
      },
      {
        term: "Retrograda",
        definition: "Lectura de la serie en orden inverso.",
      },
      {
        term: "Inversion",
        definition: "Transformacion que invierte direcciones interválicas.",
      },
      {
        term: "Matriz dodecafonica",
        definition: "Cuadro que organiza las formas P, R, I y RI de una serie.",
      },
    ],
  }),
];

const CHAPTER_CATALOG = [
  ...LEGACY_WORKBOOK_THEORY_CHAPTERS,
  ...NEW_WORKBOOK_THEORY_CHAPTERS,
];

const CHAPTER_BY_ID = new Map(
  CHAPTER_CATALOG.map((chapter) => [chapter.chapterId, chapter] as const),
);

function chapterForBlock(chapterId: string, unit: string): WorkbookChapter {
  const chapter = CHAPTER_BY_ID.get(chapterId);

  if (!chapter) {
    throw new Error(`Workbook chapter not found: ${chapterId}`);
  }

  return {
    ...chapter,
    unit,
  };
}

function createBlock(
  blockId: string,
  title: string,
  summary: string,
  chapterIds: string[],
): WorkbookBlock {
  return {
    blockId,
    title,
    summary,
    chapters: chapterIds.map((chapterId) => chapterForBlock(chapterId, title)),
  };
}

export const WORKBOOK_THEORY_BLOCKS: WorkbookBlock[] = [
  createBlock(
    "fundamentos",
    "Bloque 1. Fundamentos",
    "Lectura, ritmo, escalas, intervalos y lenguajes base para entrar al resto del workbook con referencias firmes.",
    [
      "lectura-musical",
      "ritmo-y-metrica",
      "intervalos",
      "escalas-mayores-menores",
      "escalas-relativas-paralelas",
      "modos-eclesiasticos",
      "circulo-de-quintas",
    ],
  ),
  createBlock(
    "armonia-diatonica",
    "Bloque 2. Armonia diatonica",
    "Triadas, inversiones, armonizacion y recursos diatonicos para construir y reconocer progresiones estables.",
    [
      "triadas",
      "inversiones",
      "campo-armonico-triadas",
      "armonizacion-mayor",
      "armonizacion-menor",
      "notas-de-adorno",
      "secuencias-armonicas",
      "arpegios-y-extensiones",
    ],
  ),
  createBlock(
    "armonia-funcional",
    "Bloque 3. Armonia funcional",
    "Funciones, cadencias, escritura tonal y acordes aplicados para entender el empuje real del lenguaje tonal.",
    [
      "funciones-tonales",
      "cadencias-basicas",
      "conduccion-de-voces",
      "armonia-a-4-voces",
      "acordes-de-septima",
      "campo-armonico-septimas",
      "dominantes-secundarias",
      "acordes-aplicados",
      "modulacion",
      "introduccion-analisis-armonico",
    ],
  ),
  createBlock(
    "armonia-cromatica",
    "Bloque 4. Armonia cromatica",
    "Prestamos, predominantes cromaticos y modulaciones mas lejanas para ampliar el vocabulario tonal.",
    [
      "mezcla-modal",
      "acorde-napolitano",
      "sextas-aumentadas",
      "dominantes-alteradas",
      "modulacion-avanzada",
    ],
  ),
  createBlock(
    "contrapunto",
    "Bloque 5. Contrapunto",
    "Tecnicas de independencia entre voces que sostienen escritura imitativa y analisis polifonico.",
    [
      "contrapunto-de-especies",
      "contrapunto-invertible",
      "introduccion-a-la-fuga",
    ],
  ),
  createBlock(
    "forma-y-analisis",
    "Bloque 6. Forma y analisis",
    "Lectura de estructuras amplias para conectar armonia, temas y trayectoria de una obra completa.",
    [
      "forma-musical",
      "forma-sonata",
      "rondo",
      "tema-y-variaciones",
      "analisis-de-obras",
    ],
  ),
  createBlock(
    "teoria-post-tonal",
    "Bloque 7. Teoria post-tonal",
    "Puente hacia cromatismo extremo, colecciones no tonales y tecnicas del siglo XX.",
    [
      "armonia-extendida",
      "cromatismo-avanzado",
      "introduccion-post-tonal",
      "serialismo-basico",
    ],
  ),
];

export function flattenWorkbookBlocks(
  blocks: WorkbookBlock[],
): WorkbookChapter[] {
  return blocks.flatMap((block) => block.chapters);
}

export const WORKBOOK_THEORY_CHAPTERS: WorkbookChapter[] =
  flattenWorkbookBlocks(WORKBOOK_THEORY_BLOCKS);

export function getWorkbookBlockByChapterId(
  chapterId: string,
): WorkbookBlock | null {
  return (
    WORKBOOK_THEORY_BLOCKS.find((block) =>
      block.chapters.some((chapter) => chapter.chapterId === chapterId),
    ) || null
  );
}
