const people = [
  {
    id: "grisha",
    name: "Гриша",
    icon: "👨",
    facts: [
      ["Рост", "178 см"],
      ["Волосы", "чёрные"],
      ["Особая примета", "ходит в очках"],
      ["Отношение к Анне", "любящий муж"]
    ]
  },
  {
    id: "korzhik",
    name: "Коржик",
    icon: "🐇",
    facts: [
      ["Рост", "20 см"],
      ["Шерсть", "огненная"],
      ["Характер", "шило в жопе"],
      ["Питание", "ест всё подряд"]
    ]
  },
  {
    id: "magnus",
    name: "Магнус",
    icon: "🐇",
    facts: [
      ["Рост", "25 см"],
      ["Шерсть", "золотой сатин"],
      ["Характер", "спокойный и послушный"]
    ]
  },
  {
    id: "marina",
    name: "Марина Анатольевна",
    icon: "👩",
    facts: [
      ["Рост", "168 см"],
      ["Волосы", "светлые"],
      ["Статус", "любящая мать"],
      ["Дома", "содержит кролика"]
    ]
  }
];

const places = [
  {
    id: "ave",
    name: "Аве Бистро",
    icon: "🍽️",
    facts: [
      ["Расположение", "остров Новая Голландия"],
      ["Назначение", "бистро"]
    ]
  },
  {
    id: "palkin",
    name: "Палкин",
    icon: "🏛️",
    facts: [
      ["Расположение", "Невский проспект"],
      ["Назначение", "ресторан русской кухни"]
    ]
  },
  {
    id: "apt1034",
    name: "Квартира 1034",
    icon: "🏠",
    facts: [
      ["Расположение", "Архивная"],
      ["Тип", "двухкомнатная квартира"]
    ]
  },
  {
    id: "apt814",
    name: "Квартира 814",
    icon: "🏠",
    facts: [
      ["Расположение", "Октябрьская набережная"],
      ["Тип", "однокомнатная квартира"]
    ]
  }
];

const items = [
  {
    id: "cake",
    name: "Торт",
    icon: "🎂",
    facts: [
      ["Материал", "органический продукт"],
      ["Вес", "самый тяжёлый"],
      ["Свойство", "скоропортящийся"]
    ]
  },
  {
    id: "flowers",
    name: "Цветы",
    icon: "💐",
    facts: [
      ["Материал", "органика"],
      ["Вес", "лёгкие"],
      ["Свойство", "требуют воды"]
    ]
  },
  {
    id: "candy",
    name: "Коробка конфет",
    icon: "🍫",
    facts: [
      ["Материал", "органика + картон"],
      ["Вес", "средний"],
      ["Свойство", "имеют сладкий запах"]
    ]
  },
  {
    id: "toy",
    name: "Мягкая игрушка",
    icon: "🧸",
    facts: [
      ["Материал", "текстиль + наполнитель"],
      ["Вес", "лёгкая"],
      ["Свойство", "не портится"]
    ]
  }
];

const clues = [
  "Оба кролика находились в квартирах. При этом спокойный и послушный кролик оказался именно в однокомнатной квартире.",
  "Подарок, который принёс кролик, который ест всё подряд, оказался одновременно самым тяжёлым и скоропортящимся из всех четырёх.",
  "Хозяйка кролика оказалась в месте, расположенном на острове. Подарок, который находился там, нельзя было съесть.",
  "В ресторане русской кухни оказался подарок, который нельзя было оставить без воды. Человек, принесший этот подарок, не является кроликом."
];

const solution = {
  person: "grisha",
  place: "palkin",
  item: "flowers"
};

const STORAGE_KEY = "birthday-murdle-case-0810-v1";

const PART2_ANSWER = "аня я тебя люблю кенгуру две тысячи один десятый класс";
const PART3_ANSWER = ["D", "E", "B", "B"];

function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      clueSeen: [],
      matrix: {},
      solved: false,
      cipherSolved: false,
      lockSolved: false
    };
  } catch {
    return { clueSeen: [], matrix: {}, solved: false, cipherSolved: false, lockSolved: false };
  }
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderCards(targetId, data) {
  const target = document.getElementById(targetId);
  target.innerHTML = data.map(item => `
    <article class="card">
      <div class="card-icon">${item.icon}</div>
      <h3>${item.name}</h3>
      <dl>
        ${item.facts.map(([k,v]) => `<dt>${k}:</dt> <dd>${v}</dd>`).join("")}
      </dl>
    </article>
  `).join("");
}

function renderClues() {
  const target = document.getElementById("clues");
  target.innerHTML = clues.map((clue, i) => `
    <article class="clue">
      <div class="clue-number">${String(i + 1).padStart(2, "0")}</div>
      <p>${clue}</p>
    </article>
  `).join("");
  document.getElementById("clueProgress").textContent = `${clues.length} / ${clues.length}`;
}

const matrixTypes = [
  {
    key: "peoplePlaces",
    title: "Кто где находился?",
    rows: people,
    cols: places,
    rowLabel: "Подозреваемый",
    colLabel: "Место"
  },
  {
    key: "peopleItems",
    title: "Кто что принёс?",
    rows: people,
    cols: items,
    rowLabel: "Подозреваемый",
    colLabel: "Предмет"
  },
  {
    key: "placesItems",
    title: "Что находилось где?",
    rows: places,
    cols: items,
    rowLabel: "Место",
    colLabel: "Предмет"
  }
];

function cellKey(group, row, col) {
  return `${group}:${row}:${col}`;
}

function removeAutoCrosses(group, row, col) {
  const groupDef = matrixTypes.find(g => g.key === group);
  groupDef.rows.forEach(r => {
    if (r.id !== row) {
      const k = cellKey(group, r.id, col);
      if (state.matrix[k] === -2) state.matrix[k] = 0;
    }
  });
  groupDef.cols.forEach(c => {
    if (c.id !== col) {
      const k = cellKey(group, row, c.id);
      if (state.matrix[k] === -2) state.matrix[k] = 0;
    }
  });
}

function cycleCell(group, row, col) {
  const key = cellKey(group, row, col);
  const current = state.matrix[key] || 0;

  if (current === -2) return;

  state.matrix[key] = current === 0 ? 1 : current === 1 ? -1 : 0;

  if (state.matrix[key] === 1) {
    const groupDef = matrixTypes.find(g => g.key === group);
    groupDef.rows.forEach(r => {
      if (r.id !== row && state.matrix[cellKey(group, r.id, col)] === 1) {
        state.matrix[cellKey(group, r.id, col)] = 0;
        removeAutoCrosses(group, r.id, col);
      }
    });
    groupDef.cols.forEach(c => {
      if (c.id !== col && state.matrix[cellKey(group, row, c.id)] === 1) {
        state.matrix[cellKey(group, row, c.id)] = 0;
        removeAutoCrosses(group, row, c.id);
      }
    });
    groupDef.rows.forEach(r => {
      if (r.id !== row) {
        const k = cellKey(group, r.id, col);
        if (!state.matrix[k]) state.matrix[k] = -2;
      }
    });
    groupDef.cols.forEach(c => {
      if (c.id !== col) {
        const k = cellKey(group, row, c.id);
        if (!state.matrix[k]) state.matrix[k] = -2;
      }
    });
  } else if (state.matrix[key] === -1) {
    removeAutoCrosses(group, row, col);
  }

  saveState();
  renderMatrix();
}

function renderMatrix() {
  const target = document.getElementById("matrix");
  target.innerHTML = matrixTypes.map(group => {
    let html = `
      <div class="matrix-block">
        <div class="matrix-title">${group.title}</div>
        <div class="grid">
          <div class="cell header">${group.rowLabel} \\ ${group.colLabel}</div>
          ${group.cols.map(c => `<div class="cell header">${c.icon || ""} ${c.name}</div>`).join("")}
    `;
    group.rows.forEach(row => {
      html += `<div class="cell row-header">${row.icon || ""} ${row.name}</div>`;
      group.cols.forEach(col => {
        const value = state.matrix[cellKey(group.key, row.id, col.id)] || 0;
        const cls = value === 1 ? "yes" : value === -1 ? "no" : value === -2 ? "auto" : "";
        const symbol = value === 1 ? "✓" : value === -1 || value === -2 ? "×" : "";
        const disabled = value === -2 ? "disabled" : "";
        html += `<button class="cell matrix-cell ${cls}" ${disabled} aria-label="${row.name} — ${col.name}" data-group="${group.key}" data-row="${row.id}" data-col="${col.id}">${symbol}</button>`;
      });
    });
    html += `</div></div>`;
    return html;
  }).join("");

  target.querySelectorAll(".matrix-cell").forEach(button => {
    button.addEventListener("click", () => {
      cycleCell(button.dataset.group, button.dataset.row, button.dataset.col);
    });
  });
}

function populateSelect(id, data) {
  const select = document.getElementById(id);
  data.forEach(x => {
    const option = document.createElement("option");
    option.value = x.id;
    option.textContent = x.name;
    select.appendChild(option);
  });
}

function checkAnswer() {
  const person = document.getElementById("answerPerson").value;
  const place = document.getElementById("answerPlace").value;
  const item = document.getElementById("answerItem").value;
  const message = document.getElementById("answerMessage");

  if (!person || !place || !item) {
    message.className = "answer-message error";
    message.textContent = "Сначала заполни все три поля.";
    return;
  }

  if (person === solution.person && place === solution.place && item === solution.item) {
    state.solved = true;
    saveState();
    message.className = "answer-message success";
    message.innerHTML = "<strong>ВЕРСИЯ ПОДТВЕРЖДЕНА.</strong> Все три элемента совпадают.";
    document.getElementById("caseClosed").classList.remove("hidden");
    document.getElementById("part2").classList.remove("locked");
    document.getElementById("caseClosed").scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    message.className = "answer-message error";
    message.textContent = "Эта версия не подтверждается всеми уликами. Проверь матрицу и попробуй ещё раз.";
  }
}

function restoreSolved() {
  if (state.solved) {
    document.getElementById("answerPerson").value = solution.person;
    document.getElementById("answerPlace").value = solution.place;
    document.getElementById("answerItem").value = solution.item;
    document.getElementById("answerMessage").className = "answer-message success";
    document.getElementById("answerMessage").innerHTML = "<strong>ДЕЛО УЖЕ РАСКРЫТО.</strong>";
    document.getElementById("caseClosed").classList.remove("hidden");
  }
}

document.getElementById("resetMatrix").addEventListener("click", () => {
  state.matrix = {};
  saveState();
  renderMatrix();
});

document.getElementById("solveBtn").addEventListener("click", checkAnswer);

document.getElementById("continueBtn").addEventListener("click", () => {
  document.getElementById("part2").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("cipherBtn").addEventListener("click", () => {
  const input = document.getElementById("cipherInput").value;
  const message = document.getElementById("cipherMessage");
  if (!input.trim()) {
    message.className = "answer-message error";
    message.textContent = "Сначала введи расшифрованный текст.";
    return;
  }
  if (normalizeAnswer(input) === PART2_ANSWER) {
    state.cipherSolved = true;
    saveState();
    message.className = "answer-message success";
    message.innerHTML = "<strong>ПОСЛАНИЕ ПРОЧИТАНО.</strong> Замок ждёт свой ключ.";
    document.getElementById("part3").classList.remove("locked");
    document.getElementById("part3").scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    message.className = "answer-message error";
    message.textContent = "Это не то послание. Проверь подсказки и попробуй ещё раз.";
  }
});

document.getElementById("lockBtn").addEventListener("click", () => {
  const values = [0, 1, 2, 3].map(i => document.getElementById(`lock${i}`).value.trim().toUpperCase());
  const message = document.getElementById("lockMessage");
  if (values.some(v => !v)) {
    message.className = "answer-message error";
    message.textContent = "Заполни все четыре поля.";
    return;
  }
  if (values.every((v, i) => v === PART3_ANSWER[i])) {
    state.lockSolved = true;
    saveState();
    message.className = "answer-message success";
    message.innerHTML = "<strong>ЗАМОК ОТКРЫТ.</strong> С днём рождения, Аня! 🎉";
  } else {
    message.className = "answer-message error";
    message.textContent = "Замок не поддаётся. Проверь ответы в книге.";
  }
});

document.querySelectorAll(".lock-input").forEach((input, i) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^a-dA-D]/g, "");
    if (input.value && i < 3) {
      document.getElementById(`lock${i + 1}`).focus();
    }
  });
});

function initParts() {
  if (!state.solved) document.getElementById("part2").classList.add("locked");
  if (!state.cipherSolved) document.getElementById("part3").classList.add("locked");
}

function restoreParts() {
  if (state.cipherSolved) {
    document.getElementById("cipherMessage").className = "answer-message success";
    document.getElementById("cipherMessage").innerHTML = "<strong>ПОСЛАНИЕ ПРОЧИТАНО.</strong>";
  }
  if (state.lockSolved) {
    PART3_ANSWER.forEach((v, i) => {
      document.getElementById(`lock${i}`).value = v;
    });
    document.getElementById("lockMessage").className = "answer-message success";
    document.getElementById("lockMessage").innerHTML = "<strong>ЗАМОК ОТКРЫТ.</strong> С днём рождения, Аня! 🎉";
  }
}

renderCards("peopleCards", people);
renderCards("placeCards", places);
renderCards("itemCards", items);
renderClues();
renderMatrix();
populateSelect("answerPerson", people);
populateSelect("answerPlace", places);
populateSelect("answerItem", items);
restoreSolved();
initParts();
restoreParts();
