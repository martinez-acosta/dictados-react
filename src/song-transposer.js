(function () {
  "use strict";

  const NOTE_TO_PITCH = {
    C: 0,
    "B#": 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    Fb: 4,
    "E#": 5,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
    Cb: 11,
  };

  const SHARP_NOTES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const FLAT_NOTES = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ];
  const SELECTABLE_ROOTS = [
    "C",
    "C#",
    "Db",
    "D",
    "D#",
    "Eb",
    "E",
    "F",
    "F#",
    "Gb",
    "G",
    "G#",
    "Ab",
    "A",
    "A#",
    "Bb",
    "B",
  ];

  const CHORD_PATTERN =
    /^([A-G](?:#|b|♯|♭)?)((?:(?:m(?:aj)?|maj|min|dim|aug|sus|add|omit|no)?\d*(?:(?:sus|add)\d*)?(?:\/\d+)?(?:\([^)]+\))?)?)(?:\/([A-G](?:#|b|♯|♭)?))?$/;

  function normalizeNote(note) {
    return note.replace("♯", "#").replace("♭", "b");
  }

  function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function splitWrappedToken(token) {
    const leading = token.match(/^[|/([{]+/)?.[0] || "";
    const trailing = token.match(/[|/)\]},;:]+$/)?.[0] || "";
    const core = token.slice(leading.length, token.length - trailing.length);
    return { leading, core, trailing };
  }

  function parseChordToken(token) {
    const directMatch = token.match(CHORD_PATTERN);
    if (directMatch) {
      return {
        leading: "",
        core: token,
        trailing: "",
        root: normalizeNote(directMatch[1]),
        suffix: directMatch[2] || "",
        bass: directMatch[3] ? normalizeNote(directMatch[3]) : "",
      };
    }

    const wrapped = splitWrappedToken(token);
    if (!wrapped.core) return null;

    const match = wrapped.core.match(CHORD_PATTERN);
    if (!match) return null;

    return {
      ...wrapped,
      root: normalizeNote(match[1]),
      suffix: match[2] || "",
      bass: match[3] ? normalizeNote(match[3]) : "",
    };
  }

  function isMeasureMarker(token) {
    return /^(?:\||\/|\/\/|:|x\d+|×\d+|-)+$/i.test(token);
  }

  function isChordLine(line) {
    const trimmed = line.trim();
    if (!trimmed || /^[eEADGB]\|/.test(trimmed)) return false;

    const tokens = trimmed.split(/\s+/);
    return tokens.length > 0 && tokens.every((token) => {
      return isMeasureMarker(token) || Boolean(parseChordToken(token));
    });
  }

  function preferredNoteName(pitch, preferFlats) {
    const names = preferFlats ? FLAT_NOTES : SHARP_NOTES;
    return names[positiveModulo(pitch, 12)];
  }

  function transposeParsedChord(parsed, semitones, preferFlats) {
    const rootPitch = NOTE_TO_PITCH[parsed.root];
    if (rootPitch === undefined) return parsed.leading + parsed.core + parsed.trailing;

    const root = preferredNoteName(rootPitch + semitones, preferFlats);
    let bass = "";

    if (parsed.bass) {
      const bassPitch = NOTE_TO_PITCH[parsed.bass];
      if (bassPitch !== undefined) {
        bass = "/" + preferredNoteName(bassPitch + semitones, preferFlats);
      }
    }

    return parsed.leading + root + parsed.suffix + bass + parsed.trailing;
  }

  function transposeChordLine(line, semitones, preferFlats) {
    return line.replace(/\S+/g, (token) => {
      const parsed = parseChordToken(token);
      return parsed
        ? transposeParsedChord(parsed, semitones, preferFlats)
        : token;
    });
  }

  function transposeText(text, semitones, preferFlats, forceChordText) {
    return text
      .split("\n")
      .map((line) => {
        if (forceChordText || isChordLine(line)) {
          return transposeChordLine(line, semitones, preferFlats);
        }
        return line;
      })
      .join("\n");
  }

  function collectTextRecords(element, forceChordText) {
    const records = [];
    const stack = [element];

    while (stack.length) {
      const node = stack.pop();
      if (node.nodeType === 3) {
        records.push({
          node,
          original: node.nodeValue || "",
          forceChordText,
        });
        continue;
      }

      const children = Array.from(node.childNodes || []);
      for (let index = children.length - 1; index >= 0; index -= 1) {
        stack.push(children[index]);
      }
    }

    return records;
  }

  function countChordsInText(text, forceChordText) {
    let count = 0;
    text.split("\n").forEach((line) => {
      if (!forceChordText && !isChordLine(line)) return;
      line.replace(/\S+/g, (token) => {
        if (parseChordToken(token)) count += 1;
        return token;
      });
    });
    return count;
  }

  function extractOriginalKey(heading) {
    const match = heading.match(/\[([A-G](?:#|b|♯|♭)?)(m?)(?=[,\]])/);
    if (!match) return null;

    return {
      root: normalizeNote(match[1]),
      minorSuffix: match[2] || "",
      full: normalizeNote(match[1]) + (match[2] || ""),
    };
  }

  function shouldPreferFlats(targetRoot, minorSuffix) {
    if (targetRoot.includes("b")) return true;
    if (targetRoot.includes("#")) return false;
    if (targetRoot === "F") return true;
    return minorSuffix === "m" && ["C", "D", "F", "G"].includes(targetRoot);
  }

  function injectStyles() {
    if (document.getElementById("song-transposer-styles")) return;

    const style = document.createElement("style");
    style.id = "song-transposer-styles";
    style.textContent = `
      .song-transposer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin: 8px 0 12px;
        padding: 9px 10px;
        border: 1px solid #d8dee6;
        border-radius: 8px;
        background: #f6f8fa;
        font-size: 13px;
      }
      .song-transposer__label { font-weight: 700; }
      .song-transposer select,
      .song-transposer button {
        min-height: 34px;
        border: 1px solid #aab4c0;
        border-radius: 6px;
        background: #fff;
        color: #17212b;
        font: inherit;
      }
      .song-transposer select { padding: 5px 28px 5px 9px; }
      .song-transposer button {
        cursor: pointer;
        padding: 5px 10px;
        font-weight: 650;
      }
      .song-transposer button:hover:not(:disabled) { background: #e9eef5; }
      .song-transposer button:disabled,
      .song-transposer select:disabled { cursor: not-allowed; opacity: .5; }
      .song-transposer__status { color: #46515c; }
      .song-transposer__hint {
        flex-basis: 100%;
        color: #66717d;
        font-size: 11px;
      }
      @media (max-width: 560px) {
        .song-transposer { gap: 6px; }
        .song-transposer__status { flex-basis: 100%; }
      }
      @media print {
        .song-transposer { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function createToolbar(options) {
    const {
      originalKey,
      hasChords,
      onStep,
      onSelect,
      onReset,
      onPrint,
    } = options;

    const toolbar = document.createElement("div");
    toolbar.className = "song-transposer";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-label", "Transponer canción");

    const label = document.createElement("span");
    label.className = "song-transposer__label";
    label.textContent = "Tono:";

    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "− semitono";
    down.title = "Bajar un semitono";
    down.addEventListener("click", () => onStep(-1));

    const select = document.createElement("select");
    select.setAttribute("aria-label", "Tonalidad de destino");
    SELECTABLE_ROOTS.forEach((root) => {
      const option = document.createElement("option");
      option.value = root + originalKey.minorSuffix;
      option.textContent = root + originalKey.minorSuffix;
      select.appendChild(option);
    });
    select.addEventListener("change", () => onSelect(select.value));

    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "+ semitono";
    up.title = "Subir un semitono";
    up.addEventListener("click", () => onStep(1));

    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "Original";
    reset.addEventListener("click", onReset);

    const print = document.createElement("button");
    print.type = "button";
    print.textContent = "Imprimir";
    print.addEventListener("click", onPrint);

    const status = document.createElement("span");
    status.className = "song-transposer__status";

    const hint = document.createElement("span");
    hint.className = "song-transposer__hint";
    hint.textContent = hasChords
      ? "Las tablaturas y digitaciones, si existen, permanecen en su posición original."
      : "Esta hoja todavía no contiene acordes capturados para transponer.";

    [down, select, up, reset].forEach((control) => {
      control.disabled = !hasChords;
    });

    toolbar.append(label, down, select, up, reset, print, status, hint);
    return { toolbar, select, status };
  }

  function initializeTransposer() {
    if (document.querySelector(".song-transposer")) return;

    const heading = document.querySelector("h1");
    if (!heading) return;

    const originalKey = extractOriginalKey(heading.textContent || "");
    if (!originalKey || NOTE_TO_PITCH[originalKey.root] === undefined) return;

    const chordElements = [
      ...document.querySelectorAll("pre.cifra:not(.tab)"),
      ...document.querySelectorAll(".chords"),
    ];
    const records = [];
    let chordCount = 0;

    chordElements.forEach((element) => {
      const forceChordText = element.classList.contains("chords");
      const elementRecords = collectTextRecords(element, forceChordText);
      elementRecords.forEach((record) => {
        chordCount += countChordsInText(record.original, forceChordText);
        records.push(record);
      });
    });

    const originalHeading = heading.textContent || "";
    const originalTitle = document.title;
    const originalPitch = NOTE_TO_PITCH[originalKey.root];
    const storageKey = "song-transposer:" + window.location.pathname;
    let currentTarget = originalKey.full;

    function targetParts(target) {
      return {
        root: target.slice(0, target.length - originalKey.minorSuffix.length),
        full: target,
      };
    }

    function updateUrl(target) {
      if (!/^https?:$/.test(window.location.protocol)) return;
      try {
        const url = new URL(window.location.href);
        if (target === originalKey.full) url.searchParams.delete("tono");
        else url.searchParams.set("tono", target);
        window.history.replaceState({}, "", url);
      } catch (_error) {
        // La transposición sigue funcionando aunque el navegador no permita editar la URL.
      }
    }

    function applyTarget(target, persist) {
      const parts = targetParts(target);
      const targetPitch = NOTE_TO_PITCH[parts.root];
      if (targetPitch === undefined) return;

      const semitones = positiveModulo(targetPitch - originalPitch, 12);
      const preferFlats = shouldPreferFlats(parts.root, originalKey.minorSuffix);

      records.forEach((record) => {
        record.node.nodeValue =
          target === originalKey.full
            ? record.original
            : transposeText(
                record.original,
                semitones,
                preferFlats,
                record.forceChordText,
              );
      });

      heading.textContent = originalHeading.replace(
        /\[([A-G](?:#|b|♯|♭)?m?)/,
        "[" + target,
      );
      document.title = originalTitle.replace(
        /\[([A-G](?:#|b|♯|♭)?m?)/,
        "[" + target,
      );

      currentTarget = target;
      controls.select.value = target;
      controls.status.textContent =
        target === originalKey.full
          ? "Tono original: " + originalKey.full
          : "Original " + originalKey.full + " → " + target;

      if (persist) {
        try {
          window.localStorage.setItem(storageKey, target);
        } catch (_error) {
          // El guardado es opcional; no impide usar el transpositor.
        }
        updateUrl(target);
      }
    }

    function stepTarget(direction) {
      const parts = targetParts(currentTarget);
      const currentPitch = NOTE_TO_PITCH[parts.root];
      const nextPitch = positiveModulo(currentPitch + direction, 12);
      const nextRoot = FLAT_NOTES[nextPitch];
      applyTarget(nextRoot + originalKey.minorSuffix, true);
    }

    injectStyles();
    const controls = createToolbar({
      originalKey,
      hasChords: chordCount > 0,
      onStep: stepTarget,
      onSelect: (target) => applyTarget(target, true),
      onReset: () => applyTarget(originalKey.full, true),
      onPrint: () => window.print(),
    });

    const flow = document.querySelector(".flow");
    if (flow) flow.insertAdjacentElement("afterend", controls.toolbar);
    else heading.insertAdjacentElement("afterend", controls.toolbar);

    let initialTarget = originalKey.full;
    try {
      const urlTarget = new URL(window.location.href).searchParams.get("tono");
      const savedTarget = window.localStorage.getItem(storageKey);
      const candidate = urlTarget || savedTarget;
      if (
        chordCount > 0 &&
        candidate &&
        controls.select.querySelector('option[value="' + candidate + '"]')
      ) {
        initialTarget = candidate;
      }
    } catch (_error) {
      // Se usa el tono original si no hay almacenamiento disponible.
    }

    applyTarget(initialTarget, false);

    window.SongTransposer = {
      applyTarget: (target) => applyTarget(target, true),
      originalKey: originalKey.full,
      transposeChordLine,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTransposer);
  } else {
    initializeTransposer();
  }
})();
