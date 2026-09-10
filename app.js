(() => {
  "use strict";

  const CATEGORY_LABELS = {
    all: "All Categories",
    animals: "Animals",
    food: "Food",
    school: "School",
    sports: "Sports",
    movies: "Fantasy & Fun",
    everyday: "Everyday",
  };

  const state = {
    words: [],
    deck: [],
    index: 0,
    difficulty: "easy",
    categories: new Set(["all"]),
  };

  const screens = {
    setup: document.getElementById("screen-setup"),
    cards: document.getElementById("screen-cards"),
  };

  const wordCard = document.getElementById("word-card");

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== name);
    });
  }

  document.getElementById("difficulty-group").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.difficulty = btn.dataset.difficulty;
    e.currentTarget.querySelectorAll(".pill").forEach((p) => p.classList.remove("selected"));
    btn.classList.add("selected");
  });

  document.getElementById("category-group").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    const group = e.currentTarget;
    const value = btn.dataset.category;

    if (value === "all") {
      state.categories = new Set(["all"]);
    } else {
      state.categories.delete("all");
      if (state.categories.has(value)) {
        state.categories.delete(value);
      } else {
        state.categories.add(value);
      }
      if (state.categories.size === 0) {
        state.categories = new Set(["all"]);
      }
    }

    group.querySelectorAll(".pill").forEach((p) => {
      p.classList.toggle("selected", state.categories.has(p.dataset.category));
    });
  });

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildDeck() {
    let pool = state.words;
    if (!state.categories.has("all")) {
      pool = pool.filter((w) => state.categories.has(w.category));
    }
    if (state.difficulty === "easy") {
      pool = pool.filter((w) => w.difficulty === "easy");
    }
    if (pool.length === 0) pool = state.words;
    state.deck = shuffle(pool);
    state.index = 0;
  }

  function categoryLabelText() {
    if (state.categories.has("all")) return CATEGORY_LABELS.all;
    return [...state.categories].map((c) => CATEGORY_LABELS[c] || c).join(", ");
  }

  function renderCard() {
    const card = state.deck[state.index];
    document.getElementById("target-word").textContent = card ? card.word : "🎉";
    const tabooList = document.getElementById("taboo-list");
    tabooList.innerHTML = "";
    if (card) {
      card.taboo.forEach((word) => {
        const div = document.createElement("div");
        div.className = "taboo-item";
        div.textContent = word;
        tabooList.appendChild(div);
      });
    }
  }

  function stepIndex(delta) {
    if (delta > 0) {
      if (state.index < state.deck.length - 1) {
        state.index++;
      } else {
        buildDeck();
      }
    } else if (state.index > 0) {
      state.index--;
    }
  }

  function advance(direction) {
    // direction: 1 = next (card exits left), -1 = prev (card exits right)
    const exitX = direction === 1 ? -window.innerWidth : window.innerWidth;
    const exitRot = direction === 1 ? -15 : 15;
    wordCard.style.transition = "transform 0.22s ease, opacity 0.22s ease";
    wordCard.style.transform = `translateX(${exitX}px) rotate(${exitRot}deg)`;
    wordCard.style.opacity = "0";

    setTimeout(() => {
      stepIndex(direction);
      renderCard();
      wordCard.style.transition = "none";
      const enterX = direction === 1 ? window.innerWidth * 0.4 : -window.innerWidth * 0.4;
      wordCard.style.transform = `translateX(${enterX}px)`;
      wordCard.style.opacity = "0";
      requestAnimationFrame(() => {
        wordCard.style.transition = "transform 0.22s ease, opacity 0.22s ease";
        wordCard.style.transform = "translateX(0) rotate(0)";
        wordCard.style.opacity = "1";
      });
    }, 200);
  }

  document.getElementById("next-btn").addEventListener("click", () => advance(1));
  document.getElementById("prev-btn").addEventListener("click", () => advance(-1));

  document.addEventListener("keydown", (e) => {
    if (screens.cards.classList.contains("hidden")) return;
    if (e.key === "ArrowRight") advance(1);
    if (e.key === "ArrowLeft") advance(-1);
  });

  // --- Swipe / drag handling ---
  const drag = { active: false, startX: 0, startY: 0, dx: 0 };
  const SWIPE_THRESHOLD = 70;

  function onPointerDown(e) {
    drag.active = true;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.dx = 0;
    wordCard.style.transition = "none";
  }

  function onPointerMove(e) {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) < Math.abs(dy)) return;
    drag.dx = dx;
    const rot = dx / 20;
    wordCard.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    wordCard.style.opacity = String(Math.max(1 - Math.abs(dx) / 400, 0.4));
  }

  function onPointerUp() {
    if (!drag.active) return;
    drag.active = false;
    const dx = drag.dx;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      advance(dx < 0 ? 1 : -1);
    } else {
      wordCard.style.transition = "transform 0.2s ease, opacity 0.2s ease";
      wordCard.style.transform = "translateX(0) rotate(0)";
      wordCard.style.opacity = "1";
    }
  }

  wordCard.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  document.getElementById("start-btn").addEventListener("click", () => {
    buildDeck();
    document.getElementById("category-label").textContent = categoryLabelText();
    wordCard.style.transition = "none";
    wordCard.style.transform = "translateX(0) rotate(0)";
    wordCard.style.opacity = "1";
    renderCard();
    showScreen("cards");
  });

  document.getElementById("change-categories-btn").addEventListener("click", () => {
    showScreen("setup");
  });

  async function loadWords() {
    try {
      const res = await fetch("words.json");
      state.words = await res.json();
    } catch (err) {
      state.words = [];
    }
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(() => {});
      });
    }
  }

  (async function init() {
    await loadWords();
    registerServiceWorker();
    showScreen("setup");
  })();
})();
