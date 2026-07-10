/* Домашний фитнес — мобильный трекер */
(() => {
  const START = new Date(2026, 6, 10); // 10.07.2026
  const WEEKS = 12;
  const STORAGE_KEY = "home-fitness-v2";
  const STEPS_GOAL = 10000;

  const DNI = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const TIPY = [
    { tip: "Верх", fokus: "Грудь, плечи, трицепс" },
    { tip: "Ноги", fokus: "Ноги и ягодицы" },
    { tip: "Пресс и спина", fokus: "Живот и поясница" },
    { tip: "Верх", fokus: "Грудь, плечи, трицепс" },
    { tip: "Ноги", fokus: "Ноги и ягодицы" },
    { tip: "Круговая", fokus: "Жиросжигание, всё тело" },
    { tip: "Лёгкий день", fokus: "Ходьба, растяжка, восстановление" },
  ];

  const BASE = { otzhimaniya: 10, prised: 20, planka: 30 };

  const MEASURE_FIELDS = [
    ["weight", "Вес (кг)"],
    ["neck", "Шея (см)"],
    ["shoulders", "Плечи (см)"],
    ["chest", "Грудь (см)"],
    ["bicepL", "Левый бицепс (см)"],
    ["bicepR", "Правый бицепс (см)"],
    ["waist", "Талия (см)"],
    ["belly", "Живот (см)"],
    ["hips", "Бёдра (см)"],
    ["thighL", "Левое бедро (см)"],
    ["thighR", "Правое бедро (см)"],
    ["calfL", "Левая икра (см)"],
    ["calfR", "Правая икра (см)"],
  ];

  const GUIDE = [
    {
      id: "push",
      anim: "push",
      name: "Отжимания",
      muscles: "Грудь, трицепс, плечи",
      steps: [
        "Упор лёжа, тело прямой линией от головы до пяток.",
        "Локти примерно 45° к корпусу (не разводи в стороны).",
        "Опусти грудь почти к полу, выжми вверх.",
      ],
      easy: "С колен или от стола/подоконника",
      hard: "Пауза внизу 1–2 сек или ноги на возвышении",
    },
    {
      id: "narrow",
      anim: "push",
      name: "Отжимания узким хватом",
      muscles: "Трицепс, грудь",
      steps: [
        "Ладони ближе друг к другу под грудью.",
        "Локти вдоль корпуса.",
        "Опускайся и поднимайся без провисания поясницы.",
      ],
      easy: "С колен",
      hard: "Медленно вниз 3 секунды",
    },
    {
      id: "dip",
      anim: "dip",
      name: "Отжимания от стула на трицепс",
      muscles: "Трицепс",
      steps: [
        "Сядь на край стула, руки по бокам, сдвинь таз вперёд.",
        "Опусти тело вниз, сгибая локти назад.",
        "Выжми себя вверх, не пожимая плечами к ушам.",
      ],
      easy: "Ноги ближе, меньше глубина",
      hard: "Ноги дальше вперёд",
    },
    {
      id: "pike",
      anim: "pike",
      name: "Отжимания «домиком»",
      muscles: "Плечи",
      steps: [
        "Таз вверх — тело буквой «Λ».",
        "Голова между руками, смотри на ноги/пол.",
        "Сгибай локти, приближая голову к полу, потом выжми.",
      ],
      easy: "Меньший угол / руки на возвышении",
      hard: "Ноги выше (на диван)",
    },
    {
      id: "squat",
      anim: "squat",
      name: "Приседания",
      muscles: "Бёдра, ягодицы",
      steps: [
        "Ноги на ширине плеч, носки чуть врозь.",
        "Таз назад и вниз, колени по направлению носков.",
        "Встань, не заваливая корпус сильно вперёд.",
      ],
      easy: "Сесть на стул и встать",
      hard: "Пауза внизу 2 сек",
    },
    {
      id: "lunge",
      anim: "lunge",
      name: "Выпады назад",
      muscles: "Ягодицы, ноги",
      steps: [
        "Шаг одной ногой назад.",
        "Оба колена ~90°, переднее колено над стопой.",
        "Оттолкнись и вернись. Потом другая нога.",
      ],
      easy: "Держись за стул",
      hard: "Пульсация внизу",
    },
    {
      id: "bridge",
      anim: "bridge",
      name: "Ягодичный мост",
      muscles: "Ягодицы",
      steps: [
        "Лёжа на спине, пятки под коленями.",
        "Подними таз, сожми ягодицы вверху.",
        "Опустись контролируемо, не плюхай.",
      ],
      easy: "Меньшая амплитуда",
      hard: "На одной ноге",
    },
    {
      id: "wall",
      anim: "wall",
      name: "Стульчик у стены",
      muscles: "Ноги",
      steps: [
        "Спина плотно к стене.",
        "Скользи вниз, пока бёдра не станут примерно параллельны полу.",
        "Держи, колени над стопами.",
      ],
      easy: "Выше угол / короче время",
      hard: "Дольше или руки вверх",
    },
    {
      id: "calf",
      anim: "calf",
      name: "Подъёмы на носки",
      muscles: "Икры",
      steps: [
        "Встань ровно, можно держаться за стену.",
        "Поднимись на носки максимально высоко.",
        "Пауза вверху, медленно вниз.",
      ],
      easy: "Двумя ногами",
      hard: "Одной ногой",
    },
    {
      id: "plank",
      anim: "plank",
      name: "Планка",
      muscles: "Живот, кор",
      steps: [
        "Локти под плечами (или на прямых руках).",
        "Тело — прямая линия, таз не провисает и не торчит вверх.",
        "Дыши ровно, смотри в пол.",
      ],
      easy: "С колен",
      hard: "Дольше удерживать",
    },
    {
      id: "side",
      anim: "side",
      name: "Боковая планка",
      muscles: "Косые мышцы живота",
      steps: [
        "На локте, тело боком в одну линию.",
        "Таз поднят, не провисает.",
        "Держи, потом смени сторону.",
      ],
      easy: "Нижнее колено на полу",
      hard: "Подъёмы таза вверх-вниз",
    },
    {
      id: "super",
      anim: "super",
      name: "Лодочка на животе",
      muscles: "Поясница",
      steps: [
        "Лёжа на животе, руки вперёд.",
        "Одновременно подними руки, грудь и ноги.",
        "Короткая пауза, опустись мягко.",
      ],
      easy: "Только руки или только ноги",
      hard: "Дольше удержание",
    },
    {
      id: "bird",
      anim: "bird",
      name: "Птица-собака",
      muscles: "Живот, спина",
      steps: [
        "На четвереньках, спина нейтральная.",
        "Вытяни противоположные руку и ногу.",
        "Не крути таз. Вернись и смени сторону.",
      ],
      easy: "Меньшая амплитуда",
      hard: "Пауза 2–3 сек наверху",
    },
    {
      id: "dead",
      anim: "dead",
      name: "Мёртвый жук",
      muscles: "Глубокий живот",
      steps: [
        "Лёжа, поясница прижата к полу.",
        "Руки вверх, ноги согнуты 90°.",
        "Медленно вытяни противоположные руку и ногу, верни, смени.",
      ],
      easy: "Только ноги",
      hard: "Ещё медленнее",
    },
    {
      id: "climb",
      anim: "climb",
      name: "«Скалолаз»",
      muscles: "Живот + дыхание",
      steps: [
        "Упор лёжа как в планке.",
        "Поочерёдно подтягивай колени к груди.",
        "Таз стабильный, не прыгает вверх-вниз.",
      ],
      easy: "Медленно",
      hard: "Быстрее / дольше",
    },
    {
      id: "jack",
      anim: "jack",
      name: "Прыжки ноги врозь",
      muscles: "Дыхание, жиросжигание",
      steps: [
        "Прыжок: ноги врозь + руки вверх.",
        "Прыжок обратно: ноги вместе, руки вниз.",
        "Мягко приземляйся на носки/всю стопу.",
      ],
      easy: "Шаги в стороны без прыжка",
      hard: "Быстрее темп",
    },
    {
      id: "burpee",
      anim: "burpee",
      name: "Упрощённые бёрпи",
      muscles: "Всё тело",
      steps: [
        "Присед, руки на пол.",
        "Шаг назад в планку (без прыжка ок).",
        "Шаг вперёд к рукам и встань (прыжок вверх — по желанию).",
      ],
      easy: "Без отжимания и без прыжка",
      hard: "Полный бёрпи с отжиманием",
    },
    {
      id: "walk",
      anim: "walk",
      name: "Ходьба",
      muscles: "Жиросжигание",
      steps: [
        "Быстрый шаг, можно на месте дома.",
        "Руки работают, спина прямая.",
        "Цель — 20–30 минут или шаги за день.",
      ],
      easy: "Короче по времени",
      hard: "Быстрее или в горку",
    },
  ];

  function animSvg(kind) {
    const commonHead = `<circle class="fig-head" cx="80" cy="28" r="8"/>`;
    const map = {
      push: `<g class="mover">${commonHead}
        <path class="fig-limb" d="M40 70 L80 55 L120 70"/>
        <path class="fig-accent" d="M50 95 L80 70 L110 95"/>
        <path class="fig-limb" d="M40 70 L30 100"/>
        <path class="fig-limb" d="M120 70 L130 100"/></g>`,
      dip: `<g class="mover">
        <rect x="30" y="40" width="20" height="50" rx="3" fill="#2d6a4f" opacity=".35"/>
        ${commonHead}
        <path class="fig-limb" d="M55 45 L80 50 L105 45"/>
        <path class="fig-accent" d="M80 50 L80 85"/>
        <path class="fig-limb" d="M70 110 L80 85 L90 110"/></g>`,
      pike: `<g class="mover">${commonHead}
        <path class="fig-limb" d="M45 95 L80 45 L115 95"/>
        <path class="fig-accent" d="M45 95 L35 105"/>
        <path class="fig-accent" d="M115 95 L125 105"/></g>`,
      squat: `<g class="mover">${commonHead}
        <path class="fig-accent" d="M80 36 L80 70"/>
        <path class="fig-limb" d="M55 45 L80 55 L105 45"/>
        <path class="fig-limb" d="M65 110 L80 70 L95 110"/></g>`,
      lunge: `<g class="mover">${commonHead}
        <path class="fig-accent" d="M80 36 L80 68"/>
        <path class="fig-limb" d="M60 48 L80 55 L100 48"/>
        <path class="fig-limb" d="M55 110 L70 85 L80 68 L100 95 L115 110"/></g>`,
      bridge: `<g class="mover">
        <path class="fig-limb" d="M35 95 L55 95 L80 70 L110 95 L130 95"/>
        <circle class="fig-head" cx="40" cy="88" r="7"/>
        <path class="fig-accent" d="M55 95 L55 110"/>
        <path class="fig-accent" d="M110 95 L110 110"/></g>`,
      wall: `<g class="mover">
        <path class="fig-limb" d="M120 20 L120 115" stroke-dasharray="4 6"/>
        ${commonHead.replace('cx="80"', 'cx="95"')}
        <path class="fig-accent" d="M95 36 L95 70"/>
        <path class="fig-limb" d="M75 70 L95 70 L115 70"/>
        <path class="fig-limb" d="M75 110 L75 70"/>
        <path class="fig-limb" d="M115 110 L115 70"/></g>`,
      calf: `<g class="mover">${commonHead}
        <path class="fig-accent" d="M80 36 L80 75"/>
        <path class="fig-limb" d="M65 50 L80 55 L95 50"/>
        <path class="fig-limb" d="M70 110 L80 75 L90 110"/>
        <path class="fig-limb" d="M65 110 L70 110 M90 110 L95 110"/></g>`,
      plank: `<g class="mover">
        <circle class="fig-head" cx="36" cy="58" r="8"/>
        <path class="fig-limb" d="M44 60 L100 60 L130 60"/>
        <path class="fig-accent" d="M50 60 L50 85 M120 60 L120 85"/>
        <path class="fig-limb" d="M40 85 L55 85 M115 85 L135 85"/></g>`,
      side: `<g class="mover">
        <circle class="fig-head" cx="55" cy="40" r="8"/>
        <path class="fig-accent" d="M55 48 L55 75 L55 105"/>
        <path class="fig-limb" d="M40 75 L55 75 L90 75"/>
        <path class="fig-limb" d="M35 95 L40 75"/></g>`,
      super: `<g class="mover">
        <circle class="fig-head" cx="55" cy="70" r="7"/>
        <path class="fig-limb" d="M30 85 L80 78 L130 70"/>
        <path class="fig-accent" d="M70 90 L100 70 L125 55"/>
        <path class="fig-limb" d="M85 95 L115 85"/></g>`,
      bird: `<g class="mover">
        <circle class="fig-head" cx="58" cy="48" r="7"/>
        <path class="fig-limb" d="M70 70 L90 70"/>
        <path class="fig-accent" d="M40 55 L70 70 L120 55"/>
        <path class="fig-limb" d="M70 70 L55 100"/>
        <path class="fig-limb" d="M90 70 L105 100"/></g>`,
      dead: `<g class="mover">
        <circle class="fig-head" cx="80" cy="30" r="7"/>
        <path class="fig-limb" d="M50 40 L80 45 L110 40"/>
        <path class="fig-accent" d="M65 70 L80 55 L95 70"/>
        <path class="fig-limb" d="M50 95 L65 70 M95 70 L110 95"/></g>`,
      climb: `<g class="mover">
        <circle class="fig-head" cx="40" cy="50" r="7"/>
        <path class="fig-limb" d="M48 52 L110 55"/>
        <path class="fig-accent" d="M70 55 L85 40"/>
        <path class="fig-limb" d="M95 55 L120 85"/>
        <path class="fig-limb" d="M55 55 L55 85 M110 55 L110 85"/></g>`,
      jack: `<g class="mover">${commonHead}
        <path class="fig-accent" d="M80 36 L80 70"/>
        <path class="fig-limb" d="M50 55 L80 50 L110 55"/>
        <path class="fig-limb" d="M55 110 L80 70 L105 110"/></g>`,
      burpee: `<g class="mover">
        <circle class="fig-head" cx="45" cy="45" r="7"/>
        <path class="fig-limb" d="M52 50 L90 70 L125 70"/>
        <path class="fig-accent" d="M70 95 L90 70"/>
        <path class="fig-limb" d="M55 100 L70 95 M120 70 L130 95"/></g>`,
      walk: `<g class="mover">${commonHead}
        <path class="fig-accent" d="M80 36 L80 70"/>
        <path class="fig-limb" d="M60 55 L80 50 L100 40"/>
        <path class="fig-limb" d="M65 110 L80 70 L100 100"/></g>`,
    };
    return `<svg viewBox="0 0 160 120" class="anim-${kind}" aria-hidden="true">${map[kind] || map.push}</svg>`;
  }

  // --- helpers ---
  const pad = (n) => String(n).padStart(2, "0");
  const toKey = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtRu = (d) =>
    `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const clamp = (n, min) => Math.max(min, Math.round(n));

  function koeff(week) {
    const build = [1, 2, 3, 5, 6, 7, 9, 10, 11];
    if (week === 4 || week === 8 || week === 12) return koeff(week - 1) * 0.7;
    return 1 + 0.08 * build.indexOf(week);
  }

  function targets(week) {
    const f = koeff(week);
    let sets = week < 5 ? 3 : 4;
    if (week === 4 || week === 8 || week === 12) sets = 2;
    return {
      f,
      sets,
      otzhimaniya: clamp(BASE.otzhimaniya * f, 1),
      prised: clamp(BASE.prised * f, 1),
      planka: clamp(BASE.planka * f, 20),
      vypady: clamp(8 * f, 1),
      most: clamp(12 * f, 1),
      triceps: clamp(8 * f, 1),
      lodochka: clamp(10 * f, 1),
      skalolaz: clamp(20 * f, 1),
      pryzhki: clamp(30 * f, 1),
      stulchik: clamp(30 * f, 20),
      bok: clamp(20 * f, 15),
      ikry: clamp(15 * f, 1),
      ptica: clamp(8 * f, 1),
      zhuk: clamp(8 * f, 1),
      domikom: clamp(6 * f, 1),
      burpi: week >= 3 ? clamp(5 * f, 1) : 0,
    };
  }

  function exercises(tip, t) {
    const p = t.sets;
    if (tip === "Верх") {
      return [
        ["Разминка: круги руками + прыжки на месте", "2–3 мин", "—"],
        ["Отжимания (можно с колен)", `${p}×${t.otzhimaniya}`, "60–90 сек"],
        ["Отжимания узким хватом", `${Math.max(2, p - 1)}×${Math.max(5, t.otzhimaniya - 2)}`, "60 сек"],
        ["Отжимания от стула на трицепс", `${p}×${t.triceps}`, "60 сек"],
        ["Отжимания «домиком»", `${Math.max(2, p - 1)}×${t.domikom}`, "60 сек"],
        ["Планка", `${p}×${t.planka} сек`, "45 сек"],
        ["Добивка: «скалолаз»", `2×${t.skalolaz}`, "45 сек"],
      ];
    }
    if (tip === "Ноги") {
      return [
        ["Разминка: марш на месте + круги тазом", "2–3 мин", "—"],
        ["Приседания", `${p}×${t.prised}`, "60–90 сек"],
        ["Выпады назад (на каждую ногу)", `${p}×${t.vypady}`, "60 сек"],
        ["Ягодичный мост", `${p}×${t.most}`, "45 сек"],
        ["Подъёмы на носки", `${p}×${t.ikry}`, "30 сек"],
        ["Стульчик у стены", `${Math.max(2, p - 1)}×${t.stulchik} сек`, "60 сек"],
        ["Добивка: приседания", `2×${Math.max(10, Math.floor(t.prised / 2))}`, "45 сек"],
      ];
    }
    if (tip === "Пресс и спина") {
      return [
        ["Разминка: «кошка-корова» + наклоны", "2–3 мин", "—"],
        ["Лодочка на животе", `${p}×${t.lodochka}`, "45 сек"],
        ["Птица-собака", `${p}×${t.ptica} на сторону`, "30 сек"],
        ["Мёртвый жук", `${p}×${t.zhuk} на сторону`, "30 сек"],
        ["Планка", `${p}×${t.planka} сек`, "45 сек"],
        ["Боковая планка", `2×${t.bok} сек на сторону`, "30 сек"],
        ["Обратные скручивания", `${p}×${Math.max(8, t.most - 2)}`, "45 сек"],
      ];
    }
    if (tip === "Круговая") {
      let krugi = p <= 3 ? 3 : 4;
      if (t.f < 0.85) krugi = 2;
      const burpi = t.burpi
        ? ["Упрощённые бёрпи", `${krugi}×${t.burpi}`, "45 сек"]
        : ["Шаг назад в планку и обратно", `${krugi}×6`, "45 сек"];
      return [
        ["Круговая: упражнения подряд", `${krugi} круга`, "90 сек между кругами"],
        ["Прыжки ноги врозь (или шаги)", `${krugi}×${t.pryzhki}`, "15 сек"],
        ["Приседания", `${krugi}×${Math.max(12, t.prised - 4)}`, "15 сек"],
        ["Отжимания", `${krugi}×${Math.max(6, t.otzhimaniya - 2)}`, "15 сек"],
        ["«Скалолаз»", `${krugi}×${t.skalolaz}`, "15 сек"],
        burpi,
        ["Планка в конце", `1×${t.planka} сек`, "—"],
      ];
    }
    return [
      ["Ходьба дома или на улице", "20–30 мин", "—"],
      ["Разминка суставов", "8–10 мин", "—"],
      ["Лёгкая планка или птица-собака", `2×${Math.max(20, t.planka - 10)} сек / 2×6`, "—"],
      ["Растяжка всего тела", "8–10 мин", "—"],
      ["Цель по шагам", `${STEPS_GOAL} шагов`, "—"],
    ];
  }

  function dayInfo(date) {
    const d0 = startOfDay(START);
    const d = startOfDay(date);
    const diff = Math.round((d - d0) / 86400000);
    if (diff < 0 || diff >= WEEKS * 7) {
      return { out: true, date: d, diff };
    }
    const week = Math.floor(diff / 7) + 1;
    const wd = (d.getDay() + 6) % 7; // Пн=0 … Вс=6
    const tipMeta = TIPY[wd];
    const t = targets(week);
    const list = exercises(tipMeta.tip, t).map(([name, target, rest], i) => ({
      id: `${toKey(d)}-${i}`,
      name,
      target,
      rest,
    }));
    return {
      out: false,
      date: d,
      key: toKey(d),
      week,
      wd,
      tip: tipMeta.tip,
      fokus: tipMeta.fokus,
      dni: DNI[wd],
      list,
      t,
    };
  }

  // --- state ---
  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      // миграция со старого ключа
      const legacy = JSON.parse(localStorage.getItem("home-fitness-v1") || "null");
      const base = raw.done || legacy ? { ...(legacy || {}), ...raw } : raw;
      return {
        done: base.done || {},
        measures: base.measures || [],
        habits: base.habits || {},
      };
    } catch {
      return { done: {}, measures: [], habits: {} };
    }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  let state = loadState();
  let tab = "today";
  let selectedKey = toKey(new Date());

  function getHabit(key) {
    const h = state.habits[key] || {};
    return {
      steps: Number(h.steps) || 0,
      cigs: Number(h.cigs) || 0,
      drinks: Number(h.drinks) || 0,
      drinkNote: h.drinkNote || "",
    };
  }
  function setHabit(key, patch) {
    state.habits[key] = { ...getHabit(key), ...patch };
    saveState();
  }

  function findGuideByName(name) {
    const n = (name || "").toLowerCase();
    if (n.includes("узк") || n.includes("алмаз")) return GUIDE.find((g) => g.id === "narrow");
    if (n.includes("стул") && (n.includes("трицепс") || n.includes("от стула")))
      return GUIDE.find((g) => g.id === "dip");
    if (n.includes("домик")) return GUIDE.find((g) => g.id === "pike");
    if (n.includes("выпад")) return GUIDE.find((g) => g.id === "lunge");
    if (n.includes("мост")) return GUIDE.find((g) => g.id === "bridge");
    if (n.includes("стульчик") || n.includes("стен")) return GUIDE.find((g) => g.id === "wall");
    if (n.includes("носк")) return GUIDE.find((g) => g.id === "calf");
    if (n.includes("боков")) return GUIDE.find((g) => g.id === "side");
    if (n.includes("лодоч")) return GUIDE.find((g) => g.id === "super");
    if (n.includes("птица")) return GUIDE.find((g) => g.id === "bird");
    if (n.includes("жук")) return GUIDE.find((g) => g.id === "dead");
    if (n.includes("скалолаз")) return GUIDE.find((g) => g.id === "climb");
    if (n.includes("прыжк") || n.includes("врозь")) return GUIDE.find((g) => g.id === "jack");
    if (n.includes("бёрпи") || n.includes("берпи") || n.includes("планку и обратно"))
      return GUIDE.find((g) => g.id === "burpee");
    if (n.includes("ходьб") || n.includes("шаг")) return GUIDE.find((g) => g.id === "walk");
    if (n.includes("планка")) return GUIDE.find((g) => g.id === "plank");
    if (n.includes("присед")) return GUIDE.find((g) => g.id === "squat");
    if (n.includes("отжим")) return GUIDE.find((g) => g.id === "push");
    return null;
  }

  function openGuide(guide) {
    if (!guide) {
      toast("Для этого нет карточки");
      return;
    }
    const modal = document.getElementById("modal");
    const content = document.getElementById("modal-content");
    content.innerHTML = `
      <div class="anim-stage">${animSvg(guide.anim)}</div>
      <h2 style="margin:0;font-size:20px;font-weight:800">${guide.name}</h2>
      <p style="margin:0;color:var(--muted);font-weight:700;font-size:13px">${guide.muscles}</p>
      <ol class="guide-steps">${guide.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <div class="guide-tags">
        <span class="guide-tag">Легче: ${guide.easy}</span>
        <span class="guide-tag">Сложнее: ${guide.hard}</span>
      </div>`;
    modal.hidden = false;
  }

  function closeModal() {
    document.getElementById("modal").hidden = true;
  }

  function habitsCardHtml(key) {
    const h = getHabit(key);
    const stepsPct = Math.min(100, Math.round((h.steps / STEPS_GOAL) * 100));
    const stepsOk = h.steps >= STEPS_GOAL;
    return `
      <section class="card habits-card">
        <h3>Привычки дня</h3>
        <div class="habit-row">
          <div class="habit-label">Шаги <span>цель ${STEPS_GOAL}</span></div>
          <div class="habit-controls">
            <button type="button" data-hab="steps" data-delta="-1000">−</button>
            <input inputmode="numeric" id="hab-steps" value="${h.steps || ""}" placeholder="0" />
            <button type="button" data-hab="steps" data-delta="1000">+</button>
          </div>
          <div class="steps-bar ${stepsOk ? "ok" : ""}"><span style="width:${stepsPct}%"></span></div>
          <p class="habit-hint">${stepsOk ? "Норма закрыта" : `Ещё ${Math.max(0, STEPS_GOAL - h.steps)} до цели`}</p>
        </div>
        <div class="habit-row">
          <div class="habit-label">Сигареты <span>чем меньше — тем лучше</span></div>
          <div class="habit-controls">
            <button type="button" data-hab="cigs" data-delta="-1">−</button>
            <input inputmode="numeric" id="hab-cigs" value="${h.cigs || ""}" placeholder="0" />
            <button type="button" data-hab="cigs" data-delta="1">+</button>
          </div>
          <p class="habit-hint">${h.cigs === 0 ? "День без никотина" : "Запиши честно — так проще бросать"}</p>
        </div>
        <div class="habit-row">
          <div class="habit-label">Алкоголь <span>порции</span></div>
          <div class="habit-controls">
            <button type="button" data-hab="drinks" data-delta="-1">−</button>
            <input inputmode="numeric" id="hab-drinks" value="${h.drinks || ""}" placeholder="0" />
            <button type="button" data-hab="drinks" data-delta="1">+</button>
          </div>
          <div class="habit-note">
            <input id="hab-drink-note" placeholder="Что пил (пиво, вино…)" value="${h.drinkNote.replace(/"/g, "&quot;")}" />
          </div>
          <p class="habit-hint">1 порция ≈ банка пива / бокал вина / стопка</p>
        </div>
      </section>`;
  }

  function bindHabitsCard(key) {
    const saveFromInputs = () => {
      setHabit(key, {
        steps: Math.max(0, parseInt(document.getElementById("hab-steps").value, 10) || 0),
        cigs: Math.max(0, parseInt(document.getElementById("hab-cigs").value, 10) || 0),
        drinks: Math.max(0, parseInt(document.getElementById("hab-drinks").value, 10) || 0),
        drinkNote: document.getElementById("hab-drink-note").value.trim(),
      });
    };
    view.querySelectorAll("[data-hab]").forEach((btn) => {
      btn.onclick = () => {
        const field = btn.dataset.hab;
        const delta = Number(btn.dataset.delta);
        const cur = getHabit(key);
        const next = Math.max(0, (cur[field] || 0) + delta);
        setHabit(key, { [field]: next });
        render();
      };
    });
    ["hab-steps", "hab-cigs", "hab-drinks", "hab-drink-note"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.onchange = () => {
        saveFromInputs();
        if (id !== "hab-drink-note") render();
        else toast("Сохранено");
      };
      if (id === "hab-drink-note") {
        el.onblur = () => {
          saveFromInputs();
        };
      }
    });
  }

  function dayStatus(info) {
    if (info.out) return { label: "—", cls: "no", ratio: 0, done: 0, total: 0 };
    const total = info.list.length;
    const done = info.list.filter((x) => state.done[x.id]).length;
    const ratio = total ? done / total : 0;
    if (done === 0) return { label: "Нет", cls: "no", ratio, done, total };
    if (ratio >= 0.8) return { label: "Да", cls: "ok", ratio, done, total };
    return { label: "Частично", cls: "part", ratio, done, total };
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, 1800);
  }

  // --- render ---
  const view = document.getElementById("view");
  const topDate = document.getElementById("top-date");
  const topTitle = document.getElementById("top-title");

  function setTop(dateStr, title) {
    topDate.textContent = dateStr;
    topTitle.textContent = title;
  }

  function renderToday() {
    const minKey = toKey(START);
    const maxKey = toKey(addDays(START, WEEKS * 7 - 1));
    const todayKey = toKey(new Date());
    if (!selectedKey) selectedKey = todayKey;

    const base = new Date(selectedKey + "T12:00:00");
    const info = dayInfo(base);
    const isToday = todayKey === selectedKey;
    const yesterdayKey = toKey(addDays(new Date(), -1));

    setTop(
      info.out
        ? fmtRu(base)
        : `${info.dni} · неделя ${info.week}`,
      isToday ? "Сегодня" : selectedKey === yesterdayKey ? "Вчера" : "День"
    );

    const dateBar = `
      <section class="date-bar">
        <button type="button" class="nav-day" id="day-prev" aria-label="Вчера">‹</button>
        <div class="date-mid">
          <input type="date" id="day-pick" value="${selectedKey}" min="${minKey}" max="${maxKey}" />
          <div class="date-quick">
            <button type="button" id="go-yesterday" class="${selectedKey === yesterdayKey ? "active" : ""}">Вчера</button>
            <button type="button" id="go-today" class="${isToday ? "active" : ""}">Сегодня</button>
            <button type="button" id="go-tomorrow">Завтра</button>
          </div>
        </div>
        <button type="button" class="nav-day" id="day-next" aria-label="Завтра">›</button>
      </section>`;

    if (info.out) {
      view.innerHTML = `${dateBar}<div class="card empty">Эта дата вне программы (12 недель с ${fmtRu(START)}).</div>`;
      bindDateNav(minKey, maxKey);
      return;
    }

    const st = dayStatus(info);
    const pct = Math.round(st.ratio * 100);

    view.innerHTML = `
      ${dateBar}
      <section class="hero">
        <div class="type">${info.tip} · ${fmtRu(info.date)}</div>
        <h2>${info.fokus}</h2>
        <p>Жми упражнение — галочка. «?» — как делать. День «Да» при ≥80%.</p>
        <div class="progress-wrap">
          <div class="progress-meta"><span>${st.done} из ${st.total}</span><span>${pct}%</span></div>
          <div class="bar"><span style="width:${pct}%"></span></div>
        </div>
        <div class="actions">
          <button type="button" class="btn btn-primary" id="mark-all">Отметить всё</button>
          <button type="button" class="btn btn-ghost" id="clear-all">Сбросить</button>
        </div>
      </section>
      <section class="card" id="ex-list"></section>
    `;

    bindDateNav(minKey, maxKey);

    const list = document.getElementById("ex-list");
    list.innerHTML = info.list
      .map((ex) => {
        const done = !!state.done[ex.id];
        return `
          <div class="ex ${done ? "done" : ""}">
            <button type="button" class="ex-main" data-id="${ex.id}">
              <span class="check">${done ? "✓" : ""}</span>
              <span>
                <p class="ex-name">${ex.name}</p>
                <p class="ex-meta">Отдых: ${ex.rest}</p>
              </span>
              <span class="ex-target">${ex.target}</span>
            </button>
            <button type="button" class="ex-help" data-help="${ex.name.replace(/"/g, "&quot;")}" aria-label="Как делать">?</button>
          </div>`;
      })
      .join("");

    list.querySelectorAll(".ex-main").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        state.done[id] = !state.done[id];
        if (!state.done[id]) delete state.done[id];
        saveState();
        render();
      });
    });
    list.querySelectorAll(".ex-help").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openGuide(findGuideByName(btn.dataset.help));
      });
    });

    document.getElementById("mark-all").onclick = () => {
      info.list.forEach((ex) => {
        state.done[ex.id] = true;
      });
      saveState();
      toast("День отмечен");
      render();
    };
    document.getElementById("clear-all").onclick = () => {
      info.list.forEach((ex) => delete state.done[ex.id]);
      saveState();
      toast("Сброшено");
      render();
    };
  }

  function bindDateNav(minKey, maxKey) {
    const shift = (delta) => {
      const d = addDays(new Date(selectedKey + "T12:00:00"), delta);
      const k = toKey(d);
      if (k < minKey || k > maxKey) {
        toast("Вне программы");
        return;
      }
      selectedKey = k;
      render();
    };
    const prev = document.getElementById("day-prev");
    const next = document.getElementById("day-next");
    const pick = document.getElementById("day-pick");
    const y = document.getElementById("go-yesterday");
    const t = document.getElementById("go-today");
    const tm = document.getElementById("go-tomorrow");
    if (prev) prev.onclick = () => shift(-1);
    if (next) next.onclick = () => shift(1);
    if (pick) {
      pick.onchange = () => {
        if (!pick.value) return;
        selectedKey = pick.value;
        render();
      };
    }
    if (y) {
      y.onclick = () => {
        selectedKey = toKey(addDays(new Date(), -1));
        render();
      };
    }
    if (t) {
      t.onclick = () => {
        selectedKey = toKey(new Date());
        render();
      };
    }
    if (tm) {
      tm.onclick = () => {
        selectedKey = toKey(addDays(new Date(), 1));
        render();
      };
    }
  }

  function csvEscape(v) {
    const s = String(v ?? "");
    if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function downloadText(filename, text, mime = "text/csv;charset=utf-8") {
    const bom = mime.includes("csv") ? "\uFEFF" : "";
    const blob = new Blob([bom + text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportBackup() {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      done: state.done || {},
      measures: state.measures || [],
      habits: state.habits || {},
    };
    downloadText(
      `fitness_backup_${toKey(new Date())}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8"
    );
    toast("Бэкап сохранён в Файлы");
  }

  function applyBackup(data) {
    if (!data || typeof data !== "object") throw new Error("Пустой файл");
    // полный бэкап или сырой state
    const next = {
      done: data.done && typeof data.done === "object" ? data.done : {},
      measures: Array.isArray(data.measures) ? data.measures : [],
      habits: data.habits && typeof data.habits === "object" ? data.habits : {},
    };
    state = next;
    saveState();
  }

  function importBackupFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || ""));
        if (
          !confirm(
            "Восстановить из бэкапа? Текущие галочки, замеры и привычки будут заменены."
          )
        ) {
          return;
        }
        applyBackup(data);
        toast("Восстановлено");
        render();
      } catch (err) {
        toast("Не удалось прочитать бэкап");
        console.error(err);
      }
    };
    reader.onerror = () => toast("Ошибка чтения файла");
    reader.readAsText(file);
  }

  function exportExcel() {
    // CSV с ; — Excel (RU) открывает нормально
    const trainRows = [
      ["Дата", "День", "Неделя", "Тип", "Упражнение", "Цель", "Отдых", "Сделано"].join(";"),
    ];
    for (let i = 0; i < WEEKS * 7; i++) {
      const info = dayInfo(addDays(START, i));
      if (info.out) continue;
      info.list.forEach((ex) => {
        trainRows.push(
          [
            fmtRu(info.date),
            info.dni,
            info.week,
            info.tip,
            ex.name,
            ex.target,
            ex.rest,
            state.done[ex.id] ? "Да" : "Нет",
          ]
            .map(csvEscape)
            .join(";")
        );
      });
    }

    const measureHeader = ["Дата", ...MEASURE_FIELDS.map(([, l]) => l), "Заметки"];
    const measureRows = [measureHeader.join(";")];
    state.measures.forEach((m) => {
      const d = new Date(m.date + "T12:00:00");
      measureRows.push(
        [fmtRu(d), ...MEASURE_FIELDS.map(([k]) => m[k] || ""), m.note || ""]
          .map(csvEscape)
          .join(";")
      );
    });

    const habitRows = [["Дата", "Шаги", "Сигареты", "Алко (порции)", "Что пил"].join(";")];
    const habitKeys = Object.keys(state.habits).sort();
    habitKeys.forEach((k) => {
      const h = getHabit(k);
      const d = new Date(k + "T12:00:00");
      habitRows.push(
        [fmtRu(d), h.steps, h.cigs, h.drinks, h.drinkNote].map(csvEscape).join(";")
      );
    });

    const stamp = toKey(new Date());
    downloadText(`trenirovki_${stamp}.csv`, trainRows.join("\n"));
    setTimeout(() => {
      downloadText(`zamery_${stamp}.csv`, measureRows.join("\n"));
    }, 350);
    setTimeout(() => {
      downloadText(`privychki_${stamp}.csv`, habitRows.join("\n"));
      toast("3 файла для Excel скачаны");
    }, 700);
  }

  function renderHabits() {
    const minKey = toKey(START);
    const maxKey = toKey(addDays(START, WEEKS * 7 - 1));
    const todayKey = toKey(new Date());
    if (!selectedKey) selectedKey = todayKey;
    const key = selectedKey;
    const d = new Date(key + "T12:00:00");

    setTop(fmtRu(d), "Привычки");

    let stepsSum = 0;
    let cigsSum = 0;
    let drinksSum = 0;
    let stepsDays = 0;
    let zeroCigDays = 0;
    let zeroDrinkDays = 0;
    let logged = 0;
    for (let i = 0; i < 7; i++) {
      const k = toKey(addDays(d, -i));
      if (!state.habits[k] && k !== key) continue;
      const hh = getHabit(k);
      logged++;
      stepsSum += hh.steps;
      cigsSum += hh.cigs;
      drinksSum += hh.drinks;
      if (hh.steps >= STEPS_GOAL) stepsDays++;
      if (hh.cigs === 0) zeroCigDays++;
      if (hh.drinks === 0) zeroDrinkDays++;
    }

    const dateBar = `
      <section class="date-bar">
        <button type="button" class="nav-day" id="day-prev">‹</button>
        <div class="date-mid">
          <input type="date" id="day-pick" value="${key}" min="${minKey}" max="${maxKey}" />
          <div class="date-quick">
            <button type="button" id="go-yesterday">Вчера</button>
            <button type="button" id="go-today" class="${key === todayKey ? "active" : ""}">Сегодня</button>
            <button type="button" id="go-tomorrow">Завтра</button>
          </div>
        </div>
        <button type="button" class="nav-day" id="day-next">›</button>
      </section>`;

    view.innerHTML = `
      ${dateBar}
      ${habitsCardHtml(key)}
      <p class="section-title">За 7 дней (где есть запись)</p>
      <div class="stat-grid">
        <div class="stat-box"><div class="n">${stepsDays}</div><div class="l">дней с ${STEPS_GOAL}+ шагов</div></div>
        <div class="stat-box"><div class="n">${Math.round(stepsSum / Math.max(1, logged))}</div><div class="l">шагов в среднем</div></div>
        <div class="stat-box"><div class="n">${cigsSum}</div><div class="l">сигарет суммарно</div></div>
        <div class="stat-box"><div class="n">${zeroCigDays}</div><div class="l">дней без сигарет</div></div>
        <div class="stat-box"><div class="n">${drinksSum}</div><div class="l">порций алко</div></div>
        <div class="stat-box"><div class="n">${zeroDrinkDays}</div><div class="l">дней без алко</div></div>
      </div>
      <section class="card help" style="margin-top:8px">
        <strong>Зачем это</strong>
        <p style="margin:8px 0 0">Шаги жгут жир. Сигареты и алко бьют по восстановлению и весу. Трекер просто показывает цифры — удобно, если режешь или бросаешь.</p>
      </section>
    `;
    bindDateNav(minKey, maxKey);
    bindHabitsCard(key);
  }

  function renderWeek() {
    setTop("Обзор", "Неделя");
    const today = startOfDay(new Date());
    // show current program week containing today, or week 1
    let anchor = dayInfo(today);
    const weekNum = anchor.out ? 1 : anchor.week;
    const weekStart = addDays(START, (weekNum - 1) * 7);

    let html = `<p class="section-title">Неделя ${weekNum} из ${WEEKS}</p><div class="day-list">`;
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStart, i);
      const info = dayInfo(d);
      const st = dayStatus(info);
      const isToday = toKey(d) === toKey(today);
      html += `
        <button type="button" class="day-row ${isToday ? "is-today" : ""}" data-key="${info.key}">
          <div class="d">${info.dni}<br><span style="font-weight:600;color:var(--muted);font-size:12px">${pad(d.getDate())}.${pad(d.getMonth() + 1)}</span></div>
          <div>
            <div class="t">${info.tip}</div>
            <div class="s">${st.done}/${st.total} упражнений</div>
          </div>
          <span class="badge ${st.cls}">${st.label}</span>
        </button>`;
    }
    html += `</div>
      <div class="card help" style="margin-top:8px">
        <strong>Другая неделя</strong>
        <div class="actions" style="margin-top:10px">
          <button type="button" class="btn btn-primary" id="prev-w" ${weekNum <= 1 ? "disabled" : ""}>← Назад</button>
          <button type="button" class="btn btn-primary" id="next-w" ${weekNum >= WEEKS ? "disabled" : ""}>Вперёд →</button>
        </div>
      </div>`;

    // store week on element via closure
    view.innerHTML = html;
    view.dataset.week = String(weekNum);

    const bindWeek = (wn) => {
      const ws = addDays(START, (wn - 1) * 7);
      setTop("Обзор", "Неделя");
      let h = `<p class="section-title">Неделя ${wn} из ${WEEKS}</p><div class="day-list">`;
      for (let i = 0; i < 7; i++) {
        const d = addDays(ws, i);
        const info = dayInfo(d);
        const st = dayStatus(info);
        const isToday = toKey(d) === toKey(today);
        h += `
          <button type="button" class="day-row ${isToday ? "is-today" : ""}" data-key="${info.key}">
            <div class="d">${info.dni}<br><span style="font-weight:600;color:var(--muted);font-size:12px">${pad(d.getDate())}.${pad(d.getMonth() + 1)}</span></div>
            <div>
              <div class="t">${info.tip}</div>
              <div class="s">${st.done}/${st.total} упражнений</div>
            </div>
            <span class="badge ${st.cls}">${st.label}</span>
          </button>`;
      }
      h += `</div>
        <div class="card help" style="margin-top:8px">
          <strong>Другая неделя</strong>
          <div class="actions" style="margin-top:10px">
            <button type="button" class="btn btn-primary" id="prev-w" ${wn <= 1 ? "disabled" : ""}>← Назад</button>
            <button type="button" class="btn btn-primary" id="next-w" ${wn >= WEEKS ? "disabled" : ""}>Вперёд →</button>
          </div>
        </div>`;
      view.innerHTML = h;
      view.dataset.week = String(wn);
      view.querySelectorAll(".day-row").forEach((btn) => {
        btn.onclick = () => {
          selectedKey = btn.dataset.key;
          tab = "today";
          syncNav();
          render();
        };
      });
      const pw = document.getElementById("prev-w");
      const nw = document.getElementById("next-w");
      if (pw) pw.onclick = () => bindWeek(wn - 1);
      if (nw) nw.onclick = () => bindWeek(wn + 1);
    };

    bindWeek(weekNum);
  }

  function renderMeasures() {
    setTop("Раз в неделю", "Замеры");
    const last = state.measures[state.measures.length - 1];

    view.innerHTML = `
      <section class="card">
        <form class="form" id="m-form">
          <label>Дата
            <input type="date" name="date" required value="${toKey(new Date())}" />
          </label>
          ${MEASURE_FIELDS.map(
            ([k, label]) =>
              `<label>${label}<input inputmode="decimal" name="${k}" placeholder="—" value="${last?.[k] ?? ""}" /></label>`
          ).join("")}
          <label>Заметки
            <textarea name="note" placeholder="Самочувствие, сон…">${last?.note ?? ""}</textarea>
          </label>
          <button type="submit" class="btn btn-primary">Сохранить замер</button>
        </form>
      </section>
      <p class="section-title">История</p>
      <div id="m-hist"></div>
    `;

    document.getElementById("m-form").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const row = { note: "" };
      for (const [k] of MEASURE_FIELDS) row[k] = fd.get(k)?.toString().trim() || "";
      row.date = fd.get("date");
      row.note = fd.get("note")?.toString().trim() || "";
      state.measures = state.measures.filter((m) => m.date !== row.date);
      state.measures.push(row);
      state.measures.sort((a, b) => a.date.localeCompare(b.date));
      saveState();
      toast("Замер сохранён");
      renderMeasures();
    };

    const hist = document.getElementById("m-hist");
    if (!state.measures.length) {
      hist.innerHTML = `<div class="card empty">Пока пусто. Внеси первый замер сегодня.</div>`;
      return;
    }
    hist.innerHTML = state.measures
      .slice()
      .reverse()
      .map((m) => {
        const d = new Date(m.date + "T12:00:00");
        return `<article class="card measure-card">
          <h3>${fmtRu(d)}</h3>
          <div class="kv">
            ${MEASURE_FIELDS.filter(([k]) => m[k])
              .map(([k, label]) => `<span>${label}</span><span>${m[k]}</span>`)
              .join("")}
          </div>
          ${m.note ? `<p class="ex-meta">${m.note}</p>` : ""}
          <button type="button" class="btn btn-ghost" style="background:#eee;color:var(--ink)" data-del="${m.date}">Удалить</button>
        </article>`;
      })
      .join("");

    hist.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = () => {
        state.measures = state.measures.filter((m) => m.date !== btn.dataset.del);
        saveState();
        toast("Удалено");
        renderMeasures();
      };
    });
  }

  function renderMore() {
    setTop("Справка", "Ещё");
    let closed = 0;
    for (let i = 0; i < WEEKS * 7; i++) {
      const st = dayStatus(dayInfo(addDays(START, i)));
      if (st.cls === "ok") closed++;
    }

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

    view.innerHTML = `
      <section class="card help">
        <strong>Прогресс программы</strong>
        <p style="margin:8px 0 0">Закрыто дней (≥80%): <b>${closed}</b> из ${WEEKS * 7}</p>
      </section>
      <section class="card help">
        <strong>Как поставить на экран iPhone</strong>
        <ol>
          <li>Открой эту страницу в <b>Safari</b> (не в Chrome).</li>
          <li>Нажми кнопку «Поделиться» (квадрат со стрелкой).</li>
          <li>Выбери <b>«На экран „Домой“»</b> → Добавить.</li>
        </ol>
        <p style="margin-top:10px;color:var(--muted);font-size:13px">
          ${isIos ? "Сейчас ты на iPhone — открой именно в Safari." : "С телефона зайди по адресу с компьютера."}
        </p>
      </section>
      <section class="card help">
        <strong>Цикл недели</strong>
        <p style="margin:8px 0 0">Пн Верх → Вт Ноги → Ср Пресс и спина → Чт Верх → Пт Ноги → Сб Круговая → Вс Лёгкий</p>
        <p style="margin:8px 0 0;color:var(--muted);font-size:13px">Старт: ${fmtRu(START)}. Недели 4, 8, 12 — разгрузка.</p>
      </section>
      <section class="card help">
        <strong>Данные</strong>
        <p style="margin:8px 0 0">Хранятся только на этом телефоне. Если очистишь Safari — пропадут.</p>
        <p style="margin:8px 0 0;color:var(--muted);font-size:13px">
          <b>Бэкап (.json)</b> — полный снимок для восстановления.<br/>
          <b>Excel (.csv)</b> — чтобы смотреть в таблице, из него обратно не восстанавливаем.
        </p>
        <div class="actions" style="margin-top:12px">
          <button type="button" class="btn btn-primary" id="export-backup">Скачать бэкап</button>
          <button type="button" class="btn btn-primary" id="import-backup">Восстановить</button>
        </div>
        <input type="file" id="import-file" accept="application/json,.json" hidden />
        <div class="actions" style="margin-top:8px">
          <button type="button" class="btn btn-ghost" style="background:#eee;color:var(--ink)" id="export-excel">В Excel (.csv)</button>
          <button type="button" class="btn btn-ghost" style="background:#fde8e6;color:var(--bad)" id="reset-data">Сбросить всё</button>
        </div>
      </section>
    `;

    document.getElementById("export-backup").onclick = () => exportBackup();
    document.getElementById("import-backup").onclick = () => {
      document.getElementById("import-file").click();
    };
    document.getElementById("import-file").onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (file) importBackupFile(file);
    };
    document.getElementById("export-excel").onclick = () => exportExcel();
    document.getElementById("reset-data").onclick = () => {
      if (confirm("Точно сбросить все галочки, замеры и привычки?")) {
        state = { done: {}, measures: [], habits: {} };
        saveState();
        toast("Сброшено");
        render();
      }
    };
  }

  function syncNav() {
    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
  }

  function render() {
    if (tab === "today") renderToday();
    else if (tab === "week") renderWeek();
    else if (tab === "habits") renderHabits();
    else if (tab === "measures") renderMeasures();
    else renderMore();
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      tab = btn.dataset.tab;
      if (tab === "today") selectedKey = toKey(new Date());
      syncNav();
      render();
    });
  });

  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });

  // service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  // install hint for iOS
  const hint = document.getElementById("btn-install-hint");
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true;
  if (isIos && !isStandalone) {
    hint.hidden = false;
    hint.onclick = () => {
      tab = "more";
      syncNav();
      render();
      toast("Инструкция ниже ↓");
    };
  }

  render();
})();
