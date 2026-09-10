(() => {
  "use strict";

  const state = {
    words: [],
    deck: [],
    currentCard: null,
    roundTime: 60,
    timeLeft: 60,
    timerId: null,
    difficulty: "easy",
    category: "all",
    teams: ["Team 1", "Team 2"],
    scores: [0, 0],
    activeTeam: 0,
    roundScore: 0,
  };

  const screens = {
    setup: document.getElementById("screen-setup"),
    game: document.getElementById("screen-game"),
    roundover: document.getElementById("screen-roundover"),
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== name);
    });
  }

  function selectPill(groupEl, selectedBtn) {
    groupEl.querySelectorAll(".pill").forEach((btn) => btn.classList.remove("selected"));
    selectedBtn.classList.add("selected");
  }

  document.getElementById("time-group").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.roundTime = parseInt(btn.dataset.time, 10);
    selectPill(e.currentTarget, btn);
  });

  document.getElementById("difficulty-group").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.difficulty = btn.dataset.difficulty;
    selectPill(e.currentTarget, btn);
  });

  document.getElementById("category-group").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.category = btn.dataset.category;
    selectPill(e.currentTarget, btn);
  });

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        /* ignore unsupported vibration */
      }
    }
  }

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
    if (state.category !== "all") {
      pool = pool.filter((w) => w.category === state.category);
    }
    if (state.difficulty === "easy") {
      pool = pool.filter((w) => w.difficulty === "easy");
    }
    if (pool.length === 0) pool = state.words;
    state.deck = shuffle(pool);
  }

  function nextCard() {
    if (state.deck.length === 0) buildDeck();
    state.currentCard = state.deck.pop();
    renderCard();
  }

  function renderCard() {
    const card = state.currentCard;
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

  function updateTimerRing() {
    const circumference = 283;
    const pct = state.timeLeft / state.roundTime;
    const offset = circumference * (1 - pct);
    const ring = document.getElementById("timer-ring-fg");
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = state.timeLeft <= 5 ? "var(--red, #dc2626)" : "var(--orange, #f97316)";
    document.getElementById("timer-text").textContent = state.timeLeft;
  }

  function startRound() {
    state.roundScore = 0;
    state.timeLeft = state.roundTime;
    document.getElementById("round-score").textContent = "Correct this round: 0";
    document.getElementById("turn-indicator").textContent = `${state.teams[state.activeTeam]}'s turn`;
    buildDeck();
    nextCard();
    updateTimerRing();
    showScreen("game");

    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      state.timeLeft -= 1;
      updateTimerRing();
      if (state.timeLeft <= 3 && state.timeLeft > 0) {
        vibrate(60);
      }
      if (state.timeLeft <= 0) {
        endRound();
      }
    }, 1000);
  }

  function endRound() {
    clearInterval(state.timerId);
    vibrate([120, 80, 120]);
    state.scores[state.activeTeam] += state.roundScore;
    renderScoreboard();
    showScreen("roundover");
  }

  function renderScoreboard() {
    const board = document.getElementById("scoreboard");
    board.innerHTML = "";
    const maxScore = Math.max(...state.scores);
    state.teams.forEach((name, i) => {
      const row = document.createElement("div");
      row.className = "row" + (state.scores[i] === maxScore && maxScore > 0 ? " leader" : "");
      row.innerHTML = `<span>${escapeHtml(name)}</span><span>${state.scores[i]}</span>`;
      board.appendChild(row);
    });
    const nextTeamIndex = (state.activeTeam + 1) % state.teams.length;
    document.getElementById("next-up").textContent = `${state.teams[nextTeamIndex]} is up next!`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function handleCorrect() {
    state.roundScore += 1;
    document.getElementById("round-score").textContent = `Correct this round: ${state.roundScore}`;
    vibrate(30);
    nextCard();
  }

  function handleSkip() {
    nextCard();
  }

  document.getElementById("correct-btn").addEventListener("click", handleCorrect);
  document.getElementById("skip-btn").addEventListener("click", handleSkip);
  document.getElementById("end-round-btn").addEventListener("click", endRound);

  document.getElementById("start-btn").addEventListener("click", () => {
    const t1 = document.getElementById("team1-name").value.trim() || "Team 1";
    const t2 = document.getElementById("team2-name").value.trim() || "Team 2";
    state.teams = [t1, t2];
    state.scores = [0, 0];
    state.activeTeam = 0;
    startRound();
  });

  document.getElementById("next-round-btn").addEventListener("click", () => {
    state.activeTeam = (state.activeTeam + 1) % state.teams.length;
    startRound();
  });

  document.getElementById("new-game-btn").addEventListener("click", () => {
    clearInterval(state.timerId);
    state.scores = [0, 0];
    state.activeTeam = 0;
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
