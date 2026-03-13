export type WorkbookChecklistItem = {
  id: string;
  text: string;
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
  title: string;
  summary: string;
  objective: string;
  studyFlow: string[];
  memoryHooks: string[];
  sections: WorkbookSection[];
  commonMistakes: string[];
  reviewSummary: string[];
  checklistItems: WorkbookChecklistItem[];
};

export const WORKBOOK_THEORY_CHAPTERS: WorkbookChapter[] = [
  {
    chapterId: "intervalos",
    title: "Intervalos",
    summary:
      "Base para nombrar distancias entre notas, leer formulas y entender acordes y escalas.",
    objective:
      "Reconocer como se cuenta un intervalo y diferenciar cantidad numerica y calidad.",
    studyFlow: [
      "Primero saca el numero contando letras, no semitonos.",
      "Despues identifica si la referencia base es mayor o justa.",
      "Por ultimo corrige con b, #, aumentado o disminuido si la distancia real cambio.",
    ],
    memoryHooks: [
      "2a, 3a, 6a y 7a se comparan contra mayor o menor.",
      "4a, 5a y 8a se comparan contra justo, aumentado o disminuido.",
      "Si no sabes el numero, no puedes nombrar bien el intervalo.",
    ],
    sections: [
      {
        title: "Que es un intervalo",
        blocks: [
          {
            type: "paragraph",
            text:
              "Un intervalo es la distancia entre dos notas. Siempre tiene dos partes: el numero y la calidad. El numero dice cuantas letras abarca; la calidad dice si esa distancia es mayor, menor, justa, aumentada o disminuida.",
          },
          {
            type: "paragraph",
            text:
              "Por ejemplo, de C a G hay una quinta porque cuentas C-D-E-F-G. Despues revisas la distancia real en semitonos y confirmas que se trata de una quinta justa.",
          },
          {
            type: "chips",
            title: "Ideas clave",
            items: [
              "Numero = cuantas letras",
              "Calidad = distancia real",
              "No basta con contar teclas",
            ],
          },
        ],
      },
      {
        title: "Como se cuentan",
        blocks: [
          {
            type: "list",
            title: "Proceso practico",
            items: [
              "Escribe la nota de salida y la nota de llegada.",
              "Cuenta ambas notas para sacar el numero del intervalo.",
              "Compara la distancia real con el patron mayor o justo.",
              "Si la distancia baja un semitono, puede pasar a menor o disminuida; si sube, puede pasar a aumentada.",
            ],
          },
          {
            type: "table",
            title: "Patron de referencia desde C",
            columns: ["Intervalo", "Notas", "Tipo base"],
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
        ],
      },
      {
        title: "Para que te sirven en armonia",
        blocks: [
          {
            type: "paragraph",
            text:
              "Las formulas de acordes usan intervalos resumidos. Cuando lees 1-b3-5, en realidad estas leyendo raiz, tercera menor y quinta justa. Cuando lees 1-3-5-b7, estas leyendo una triada mayor mas septima menor.",
          },
          {
            type: "example",
            title: "Ejemplo",
            lines: [
              "Cmaj7 = C E G B = 1 - 3 - 5 - 7",
              "G7 = G B D F = 1 - 3 - 5 - b7",
              "Am7 = A C E G = 1 - b3 - 5 - b7",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Contar solo semitonos y olvidar el nombre del intervalo.",
      "Pensar que mayor y justo funcionan igual en todos los numeros.",
      "Olvidar que la nota inicial tambien se cuenta.",
    ],
    reviewSummary: [
      "El numero y la calidad se calculan por separado.",
      "2a, 3a, 6a y 7a se comparan contra mayor/menor.",
      "4a, 5a y 8a se comparan contra justo/aumentado/disminuido.",
    ],
    checklistItems: [
      { id: "int-1", text: "Puedo contar el numero de un intervalo sin usar piano." },
      { id: "int-2", text: "Puedo distinguir una 3a mayor de una 3a menor." },
      { id: "int-3", text: "Entiendo por que las formulas de acordes usan b3 y b7." },
    ],
  },
  {
    chapterId: "triadas",
    title: "Triadas",
    summary:
      "Acordes de tres notas construidos por terceras: raiz, tercera y quinta.",
    objective:
      "Construir triadas a mano y reconocer sus calidades por formula e intervalo.",
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
    sections: [
      {
        title: "Construccion basica",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una triada se forma apilando dos terceras sobre una nota raiz. El resultado son tres funciones basicas: raiz, tercera y quinta.",
          },
          {
            type: "paragraph",
            text:
              "Si partes de C y apilas una tercera hasta E, y otra tercera hasta G, obtienes C-E-G. Ese es el esqueleto minimo de una triada.",
          },
          {
            type: "chips",
            title: "Estructura",
            items: ["Raiz", "3a", "5a", "Se construye por terceras"],
          },
        ],
      },
      {
        title: "Calidades principales",
        blocks: [
          {
            type: "table",
            columns: ["Calidad", "Formula", "Ejemplo", "Color general"],
            rows: [
              ["Mayor", "1 - 3 - 5", "C = C E G", "Estable, brillante"],
              ["Menor", "1 - b3 - 5", "Cm = C Eb G", "Mas oscuro"],
              ["Disminuida", "1 - b3 - b5", "Cdim = C Eb Gb", "Inestable"],
              ["Aumentada", "1 - 3 - #5", "C+ = C E G#", "Abierta, tensa"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La diferencia clave suele estar en la tercera y la quinta. Si la tercera baja medio tono, pasas de mayor a menor. Si la quinta baja o sube, cambias a disminuida o aumentada.",
          },
        ],
      },
      {
        title: "Simbolos y lectura rapida",
        blocks: [
          {
            type: "list",
            items: [
              "Mayor normalmente no lleva sufijo: C, F, G.",
              "Menor usa m: Am, Dm, Em.",
              "Disminuida puede aparecer como dim o con simbolo reducido segun el contexto.",
              "Aumentada suele aparecer como + o aug.",
            ],
          },
          {
            type: "example",
            title: "Lectura rapida",
            lines: [
              "G = G B D",
              "Em = E G B",
              "Bdim = B D F",
              "C+ = C E G#",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Escribir notas correctas en altura pero mal deletreadas.",
      "Confundir triada menor con acorde menor septima.",
      "Pensar que el simbolo define las notas sin revisar la formula.",
    ],
    reviewSummary: [
      "Las triadas se construyen con 1-3-5.",
      "La tercera decide si mayor o menor.",
      "La quinta alterada cambia a aumentada o disminuida.",
    ],
    checklistItems: [
      { id: "tri-1", text: "Puedo escribir las cuatro calidades de triada desde cualquier raiz." },
      { id: "tri-2", text: "Puedo traducir C, Cm, Cdim y C+ a notas." },
      { id: "tri-3", text: "Reviso spelling correcto, no solo teclas aproximadas." },
    ],
  },
  {
    chapterId: "escalas-relativas",
    title: "Escalas relativas",
    summary:
      "Relacion entre una escala mayor y su menor relativa: comparten notas y armadura.",
    objective:
      "Encontrar la menor relativa desde el sexto grado y la mayor relativa desde el tercer grado de la menor.",
    studyFlow: [
      "Escribe la escala mayor completa.",
      "Busca el sexto grado para hallar la menor relativa.",
      "Comprueba que ambas escalas comparten exactamente las mismas notas.",
    ],
    memoryHooks: [
      "Mayor -> 6o grado",
      "Menor -> 3er grado",
      "Relativas comparten notas; paralelas comparten tonica",
    ],
    sections: [
      {
        title: "Idea central",
        blocks: [
          {
            type: "paragraph",
            text:
              "Una escala mayor y su menor relativa usan exactamente las mismas notas. Lo que cambia es la nota que funciona como centro tonal.",
          },
          {
            type: "paragraph",
            text:
              "En C major las notas son C D E F G A B. La menor relativa es A minor porque A es el sexto grado de C major y comparte todas esas notas.",
          },
          {
            type: "chips",
            title: "Regla rapida",
            items: [
              "Mayor -> menor relativa = 6o grado",
              "Menor -> mayor relativa = 3er grado",
              "Comparten armadura",
            ],
          },
        ],
      },
      {
        title: "Como encontrarla",
        blocks: [
          {
            type: "list",
            items: [
              "Escribe la escala mayor.",
              "Ubica su sexto grado.",
              "Ese sexto grado es la tonica de la menor relativa.",
              "Comprueba que ambas escalas usan las mismas alteraciones.",
            ],
          },
          {
            type: "example",
            title: "Ejemplos",
            lines: [
              "C major -> A minor",
              "G major -> E minor",
              "F major -> D minor",
            ],
          },
        ],
      },
      {
        title: "Que no debes confundir",
        blocks: [
          {
            type: "paragraph",
            text:
              "Relativa no significa paralela. C major y C minor no son relativas; son paralelas porque comparten tonica, no notas. C major y A minor si son relativas porque comparten notas, no tonica.",
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
      "Buscar la relativa menor en el sexto semitono en vez del sexto grado.",
      "Confundir relativa con paralela.",
      "Olvidar que comparten armadura, no tonica.",
    ],
    reviewSummary: [
      "La menor relativa vive en el sexto grado de la mayor.",
      "La mayor relativa vive en el tercer grado de la menor.",
      "Relativa = mismas notas, distinto centro tonal.",
    ],
    checklistItems: [
      { id: "rel-1", text: "Puedo sacar la menor relativa desde cualquier escala mayor." },
      { id: "rel-2", text: "Puedo explicar por que C major y A minor comparten notas." },
      { id: "rel-3", text: "No confundo relativa con paralela." },
    ],
  },
  {
    chapterId: "inversiones",
    title: "Inversiones de acordes",
    summary:
      "Reordenar un acorde sin cambiar su calidad, cambiando la nota que queda en el bajo.",
    objective:
      "Distinguir posicion fundamental e inversiones, y leer que grado queda abajo.",
    studyFlow: [
      "Identifica primero la calidad del acorde en posicion fundamental.",
      "Mira que nota quedo en el bajo.",
      "Traduce ese bajo a 1, 3, 5 o 7 para nombrar la inversion.",
    ],
    memoryHooks: [
      "Invertir no cambia la calidad",
      "El bajo decide la inversion",
      "En cuatriadas existe 3a inversion",
    ],
    sections: [
      {
        title: "Que cambia y que no cambia",
        blocks: [
          {
            type: "paragraph",
            text:
              "En una inversion no cambias la calidad del acorde. Sigues teniendo las mismas notas, pero en distinto orden. Lo importante es que ahora otra nota queda en el bajo.",
          },
          {
            type: "paragraph",
            text:
              "C-E-G y E-G-C contienen la misma triada de C mayor. La diferencia es que en la segunda el bajo ya no es C sino E.",
          },
        ],
      },
      {
        title: "Triadas",
        blocks: [
          {
            type: "table",
            columns: ["Estado", "Orden posible", "Bajo"],
            rows: [
              ["Posicion fundamental", "C E G", "1"],
              ["1a inversion", "E G C", "3"],
              ["2a inversion", "G C E", "5"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La manera mas rapida de identificar la inversion es mirar la nota mas grave y preguntarte que grado del acorde representa: 1, 3 o 5.",
          },
        ],
      },
      {
        title: "Cuatriadas",
        blocks: [
          {
            type: "paragraph",
            text:
              "En acordes con septima aparece una inversion adicional. Ahora el bajo puede ser 1, 3, 5 o 7.",
          },
          {
            type: "table",
            columns: ["Estado", "Bajo esperado"],
            rows: [
              ["Fundamental", "1"],
              ["1a inversion", "3"],
              ["2a inversion", "5"],
              ["3a inversion", "7"],
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Creer que la inversion cambia la calidad del acorde.",
      "Identificar por la primera nota escrita y no por el bajo real.",
      "Confundir 2a inversion de triada con 3a inversion de cuatriada.",
    ],
    reviewSummary: [
      "Mismas notas, distinto orden.",
      "La calidad no cambia; cambia el bajo.",
      "En cuatriadas el 7 tambien puede quedar abajo.",
    ],
    checklistItems: [
      { id: "inv-1", text: "Puedo identificar el bajo como 1, 3, 5 o 7." },
      { id: "inv-2", text: "Puedo distinguir fundamental, 1a, 2a y 3a inversion." },
      { id: "inv-3", text: "No cambio la calidad al invertir." },
    ],
  },
  {
    chapterId: "armonizacion-mayor",
    title: "Armonizacion de la escala mayor",
    summary:
      "Construccion de los 7 acordes diatonicos de una escala mayor apilando terceras.",
    objective:
      "Resolver a mano el patron diatonico de triadas del modo mayor.",
    studyFlow: [
      "Escribe las 7 notas de la tonalidad.",
      "Construye cada acorde con 1-3-5 sin salirte de la escala.",
      "Al final compara el resultado con el patron I ii iii IV V vi vii°.",
    ],
    memoryHooks: [
      "Mayor, menor, menor, Mayor, Mayor, menor, disminuido",
      "El patron de calidad no cambia entre tonalidades mayores",
      "Lo que cambia es el spelling",
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
              "Despues de construir 1-3-5, no basta con mirar las letras: tienes que revisar la distancia entre la raiz y la tercera, y luego entre la raiz y la quinta. Esa combinacion es la que define la calidad.",
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
            type: "paragraph",
            text:
              "Entonces la regla practica es esta: si la tercera es mayor y la quinta es justa, el acorde es mayor. Si la tercera es menor y la quinta es justa, es menor. Si la tercera es menor y la quinta tambien se encoge, el acorde se vuelve disminuido.",
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
        title: "Patron fijo",
        blocks: [
          {
            type: "chips",
            items: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
          },
          {
            type: "table",
            columns: ["Grado", "Calidad", "Ejemplo en C major"],
            rows: [
              ["I", "Mayor", "C"],
              ["ii", "Menor", "Dm"],
              ["iii", "Menor", "Em"],
              ["IV", "Mayor", "F"],
              ["V", "Mayor", "G"],
              ["vi", "Menor", "Am"],
              ["vii°", "Disminuida", "Bdim"],
            ],
          },
          {
            type: "paragraph",
            text:
              "Ese patron no se memoriza como algo magico: es el resumen de las calidades que acabas de sacar al apilar terceras dentro de la escala mayor. Primero lo construyes; despues lo memorizas para ir mas rapido.",
          },
        ],
      },
      {
        title: "Como estudiarlo",
        blocks: [
          {
            type: "paragraph",
            text:
              "Primero memoriza el patron de calidades. Luego practica escribir notas reales en varias tonalidades. Lo que debe cambiar son las notas y el spelling; lo que no cambia es la secuencia de funciones.",
          },
          {
            type: "example",
            title: "Ejemplo rapido",
            lines: [
              "G major: G, Am, Bm, C, D, Em, F#dim",
              "F major: F, Gm, Am, Bb, C, Dm, Edim",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Salir de la escala y meter alteraciones que no pertenecen a la tonalidad.",
      "Confundir la tarea diatonica con construir 7 acordes de una misma familia.",
      "Olvidar que el vii es disminuido, no menor.",
    ],
    reviewSummary: [
      "Apilas 1-3-5 dentro de la escala.",
      "El patron fijo es Mayor, menor, menor, Mayor, Mayor, menor, disminuido.",
      "Los romanos cambian mayusculas o minusculas segun la calidad.",
    ],
    checklistItems: [
      { id: "arm-1", text: "Puedo armonizar una escala mayor sin mirar ayuda." },
      { id: "arm-2", text: "Puedo escribir notas y simbolos correctos en C, G y F major." },
      { id: "arm-3", text: "Entiendo que el patron de calidad es fijo." },
    ],
  },
  {
    chapterId: "campo-armonico-septimas",
    title: "Campo armonico con septimas",
    summary:
      "Version de cuatro notas del campo armonico, usando 1-3-5-7 y calidad de cuatriadas.",
    objective:
      "Distinguir grado, calidad y simbolo al construir acordes de septima en major y natural minor.",
    studyFlow: [
      "Separa siempre grado, calidad y simbolo.",
      "Construye 1-3-5-7 dentro de la escala elegida.",
      "Revisa si la septima es mayor o menor antes de escribir maj7 o 7.",
    ],
    memoryHooks: [
      "maj7 = 1-3-5-7",
      "7 = 1-3-5-b7",
      "m7b5 = 1-b3-b5-b7",
    ],
    sections: [
      {
        title: "Grado y calidad no son lo mismo",
        blocks: [
          {
            type: "paragraph",
            text:
              "El grado dice desde que nota empiezas dentro de la escala. La calidad dice que tipo de tercera, quinta y septima aparecen cuando apilas 1-3-5-7.",
          },
          {
            type: "paragraph",
            text:
              "Por eso puedes leer V7 como quinto grado dominante. El V te dice la posicion; el 7 te dice la calidad del acorde.",
          },
          {
            type: "chips",
            title: "Idea clave",
            items: [
              "Grado = posicion en la escala",
              "Calidad = estructura interna",
              "Simbolo = nombre resumido del resultado",
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
              ["7", "1 - 3 - 5 - b7", "Mayor con septima menor, dominante"],
              ["m7b5", "1 - b3 - b5 - b7", "Semidisminuido"],
            ],
          },
          {
            type: "paragraph",
            text:
              "La dominante es el acorde 7 porque mantiene tercera mayor pero baja la septima. En C major, el quinto grado es G y sale G-B-D-F. Como esa F es b7 respecto a G, el resultado es G7 y no Gmaj7.",
          },
        ],
      },
      {
        title: "Patrones diatonicos",
        blocks: [
          {
            type: "table",
            title: "Major",
            columns: ["Grado", "Calidad"],
            rows: [
              ["Imaj7", "maj7"],
              ["ii7", "m7"],
              ["iii7", "m7"],
              ["IVmaj7", "maj7"],
              ["V7", "7"],
              ["vi7", "m7"],
              ["viiø7", "m7b5"],
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
  },
  {
    chapterId: "lectura-musical",
    title: "Lectura musical",
    summary:
      "Base visual para ubicar notas, claves, lineas adicionales y alteraciones.",
    objective:
      "Leer notas de forma mas segura en clave de Sol y de Fa, entendiendo la logica del pentagrama.",
    studyFlow: [
      "Fija una nota de referencia segura en la clave.",
      "Cuenta lineas y espacios desde esa referencia.",
      "Verifica armadura y alteraciones antes de cantar o tocar.",
    ],
    memoryHooks: [
      "La clave cambia el mapa, no la musica",
      "Primero clave, luego posicion, luego alteraciones",
      "Leer rapido no es adivinar",
    ],
    sections: [
      {
        title: "El pentagrama y las claves",
        blocks: [
          {
            type: "paragraph",
            text:
              "El pentagrama tiene cinco lineas y cuatro espacios. La clave fija una referencia para saber que nota representa cada linea o espacio.",
          },
          {
            type: "paragraph",
            text:
              "La clave de Sol coloca la referencia sobre G. La clave de Fa coloca la referencia sobre F. Cambiar de clave no cambia la musica, cambia la manera de escribirla.",
          },
          {
            type: "table",
            columns: ["Clave", "Referencia", "Uso frecuente"],
            rows: [
              ["Sol", "G", "Voz, melodias, mano derecha, instrumentos agudos"],
              ["Fa", "F", "Bajo, mano izquierda, registros graves"],
            ],
          },
        ],
      },
      {
        title: "Como ubicar notas",
        blocks: [
          {
            type: "list",
            items: [
              "Ubica una nota de referencia segura.",
              "Cuenta por lineas y espacios sin saltarte pasos.",
              "Usa lineas adicionales cuando la nota quede fuera del pentagrama.",
              "Revisa armadura y alteraciones accidentales antes de cantar o tocar.",
            ],
          },
          {
            type: "paragraph",
            text:
              "Leer bien no es memorizar todas las notas de golpe; es crear puntos de apoyo y moverte desde ellos con rapidez.",
          },
        ],
      },
      {
        title: "Alteraciones y contexto",
        blocks: [
          {
            type: "paragraph",
            text:
              "Un sostenido sube medio tono, un bemol baja medio tono y un becuadro cancela la alteracion vigente. Pero siempre debes leerlas dentro del compas y de la armadura actual.",
          },
          {
            type: "example",
            title: "Lectura mental",
            lines: [
              "Si la armadura tiene F#, todo F del pentagrama vale F# salvo cancelacion.",
              "Si aparece un becuadro, esa nota vuelve a natural en ese compas.",
            ],
          },
        ],
      },
    ],
    commonMistakes: [
      "Leer una nota por posicion visual sin tomar en cuenta la clave.",
      "Olvidar las alteraciones de armadura o de compas.",
      "Confundir lectura rapida con adivinanza.",
    ],
    reviewSummary: [
      "La clave da el mapa del pentagrama.",
      "Las alteraciones cambian el nombre real de la nota.",
      "Leer bien significa ubicar referencia, contexto y patron.",
    ],
    checklistItems: [
      { id: "lec-1", text: "Puedo explicar para que sirve la clave de Sol y la de Fa." },
      { id: "lec-2", text: "No ignoro armaduras ni alteraciones accidentales." },
      { id: "lec-3", text: "Tengo notas de referencia claras para leer mas rapido." },
    ],
  },
];
