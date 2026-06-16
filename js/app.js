/* ============================================================
   CCAT Practice Simulator — application engine
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const LETTERS = ["A", "B", "C", "D", "E", "F"];

  /* ---------------- Test catalogue (10 practice tests) ---------------- */
  const BADGES = ["medium", "easy", "medium", "hard", "medium", "easy", "hard", "medium", "hard", "medium"];
  const FLAVOR = [
    "A balanced mix of verbal, math & logic, and spatial questions — a solid first run.",
    "An approachable set to warm up your reasoning and pacing.",
    "Standard difficulty across all three categories. Watch the clock.",
    "A tougher draw with trickier number series and spatial flips.",
    "Even coverage of every question type you'll see on the real test.",
    "A lighter set — great for a confidence-building quick run.",
    "Challenging analogies, multi-step word problems, and rotations.",
    "Full-length simulation with a representative category spread.",
    "Hard mode: expect dense logic and demanding spatial items.",
    "A final mixed simulation to measure where you stand."
  ];
  const TESTS = Array.from({ length: 10 }, (_, i) => ({
    id: `test-${i + 1}`,
    no: i + 1,
    name: `Practice Test ${i + 1}`,
    badge: BADGES[i],
    desc: FLAVOR[i]
  }));

  const CATEGORIES = ["Verbal Reasoning", "Math & Logic", "Spatial Reasoning"];

  /* ---------------- App state ---------------- */
  const state = {
    test: null,
    questions: [],
    answers: [],
    flags: [],
    current: 0,
    config: { count: 50, timer: true, shuffle: true },
    limitSec: 900,
    remainingSec: 900,
    elapsedSec: 0,
    timerId: null,
    finished: false,
    reviewFilter: "all"
  };

  /* ---------------- Utilities ---------------- */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, Math.min(n, arr.length)); }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  /* ---------------- Session building ---------------- */
  function categoryCounts(n) {
    // Proportional to CCAT-style mix; verbal ≈ math > spatial.
    let v = Math.round(n * 0.36);
    let m = Math.round(n * 0.36);
    let s = n - v - m;
    if (s < 0) { m += s; s = 0; }
    return { "Verbal Reasoning": v, "Math & Logic": m, "Spatial Reasoning": s };
  }

  function buildSession() {
    const bank = window.QUESTION_BANK || [];
    const byCat = {};
    CATEGORIES.forEach((c) => (byCat[c] = bank.filter((q) => q.category === c)));
    const counts = categoryCounts(state.config.count);

    let picked = [];
    CATEGORIES.forEach((c) => { picked = picked.concat(sample(byCat[c], counts[c])); });
    // If a category pool was too small, top up from the rest of the bank.
    if (picked.length < state.config.count) {
      const ids = new Set(picked.map((q) => q.id));
      const extra = sample(bank.filter((q) => !ids.has(q.id)), state.config.count - picked.length);
      picked = picked.concat(extra);
    }
    picked = shuffle(picked);

    // Prepare per-question (optionally shuffle answer choices, remap correct index).
    state.questions = picked.map((q) => prepareQuestion(q));
    state.answers = state.questions.map(() => null);
    state.flags = state.questions.map(() => false);
    state.current = 0;
    state.finished = false;

    state.limitSec = Math.round(state.config.count * 18); // 18s/question → 50 = 15:00
    state.remainingSec = state.limitSec;
    state.elapsedSec = 0;
  }

  function prepareQuestion(q) {
    const idxs = q.options.map((_, i) => i);
    const order = state.config.shuffle ? shuffle(idxs) : idxs;
    return {
      id: q.id,
      category: q.category,
      type: q.type,
      stem: q.stem,
      figuresHTML: q.figuresHTML || "",
      options: order.map((i) => q.options[i]),
      answer: order.indexOf(q.answer),
      explanation: q.explanation
    };
  }

  /* ---------------- Screen switching ---------------- */
  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.remove("active"));
    $(`#${id}`).classList.add("active");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  /* ---------------- Home ---------------- */
  function renderHome() {
    const grid = $("#test-grid");
    grid.innerHTML = "";
    TESTS.forEach((t) => {
      const best = localStorage.getItem(`ccat_best_${t.id}`);
      const card = document.createElement("button");
      card.className = "test-card";
      card.innerHTML =
        `<div class="tc-top">
           <span class="tc-no">Test ${t.no}</span>
           <span class="tc-badge badge-${t.badge}">${t.badge}</span>
         </div>
         <h3>${t.name}</h3>
         <p>${t.desc}</p>
         <span class="tc-cta">Start test →</span>
         ${best ? `<span class="tc-best">Best score: ${best}%</span>` : ""}`;
      card.addEventListener("click", () => startTest(t));
      grid.appendChild(card);
    });
  }

  function readConfig() {
    state.config.count = parseInt($("#cfg-count").value, 10) || 50;
    state.config.timer = $("#cfg-timer").value === "on";
    state.config.shuffle = $("#cfg-shuffle").value === "on";
  }

  /* ---------------- Start / run a test ---------------- */
  function startTest(test) {
    readConfig();
    state.test = test;
    buildSession();
    $("#test-title-label").textContent = test.name;
    $("#q-total").textContent = state.questions.length;
    showScreen("screen-test");
    renderQuestion();
    renderPalette();
    startTimer();
  }

  function startTimer() {
    stopTimer();
    const timerEl = $("#timer");
    if (!state.config.timer) {
      timerEl.classList.remove("warn", "danger");
      timerEl.textContent = fmtTime(0);
      state.timerId = setInterval(() => {
        state.elapsedSec++;
        timerEl.textContent = fmtTime(state.elapsedSec);
      }, 1000);
      return;
    }
    updateTimerDisplay();
    state.timerId = setInterval(() => {
      state.remainingSec--;
      state.elapsedSec++;
      updateTimerDisplay();
      if (state.remainingSec <= 0) { stopTimer(); finishTest(true); }
    }, 1000);
  }
  function stopTimer() { if (state.timerId) { clearInterval(state.timerId); state.timerId = null; } }
  function updateTimerDisplay() {
    const el = $("#timer");
    el.textContent = fmtTime(state.remainingSec);
    el.classList.toggle("warn", state.remainingSec <= state.limitSec * 0.2 && state.remainingSec > state.limitSec * 0.07);
    el.classList.toggle("danger", state.remainingSec <= state.limitSec * 0.07);
  }

  function renderOptionInner(opt, key) {
    const body = (typeof opt === "object" && opt.svg)
      ? `<span class="opt-figbody"><span class="opt-fig">${opt.svg}</span></span>`
      : `<span>${opt}</span>`;
    return `<span class="opt-key">${key}</span>${body}`;
  }

  function renderQuestion() {
    const q = state.questions[state.current];
    $("#q-current").textContent = state.current + 1;
    $("#q-category").textContent = `${q.category} · ${q.type}`;
    $("#q-stem").innerHTML = q.stem + (q.figuresHTML || "");

    const isFig = typeof q.options[0] === "object" && q.options[0].svg;
    const box = $("#q-options");
    box.className = "q-options" + (isFig ? " grid" : "");
    box.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "opt" + (state.answers[state.current] === i ? " selected" : "");
      btn.innerHTML = renderOptionInner(opt, LETTERS[i]);
      btn.addEventListener("click", () => selectOption(i));
      box.appendChild(btn);
    });

    // Nav buttons
    $("#btn-prev").disabled = state.current === 0;
    $("#btn-next").disabled = state.current === state.questions.length - 1;
    const flagBtn = $("#btn-flag");
    flagBtn.classList.toggle("btn-flag-active", state.flags[state.current]);
    flagBtn.textContent = state.flags[state.current] ? "⚑ Flagged" : "⚑ Flag for review";

    // Progress bar
    const answered = state.answers.filter((a) => a !== null).length;
    $("#progress-fill").style.width = `${(answered / state.questions.length) * 100}%`;

    updatePaletteActive();
  }

  function selectOption(i) {
    state.answers[state.current] = i;
    $$("#q-options .opt").forEach((el, idx) => el.classList.toggle("selected", idx === i));
    const answered = state.answers.filter((a) => a !== null).length;
    $("#progress-fill").style.width = `${(answered / state.questions.length) * 100}%`;
    refreshPaletteCell(state.current);
  }

  function renderPalette() {
    const pal = $("#palette");
    pal.innerHTML = "";
    state.questions.forEach((_, i) => {
      const cell = document.createElement("button");
      cell.className = "pcell";
      cell.textContent = i + 1;
      cell.addEventListener("click", () => { state.current = i; renderQuestion(); });
      pal.appendChild(cell);
    });
    state.questions.forEach((_, i) => refreshPaletteCell(i));
    updatePaletteActive();
  }
  function refreshPaletteCell(i) {
    const cell = $("#palette").children[i];
    if (!cell) return;
    cell.classList.toggle("answered", state.answers[i] !== null);
    cell.classList.toggle("flagged", state.flags[i]);
  }
  function updatePaletteActive() {
    $$("#palette .pcell").forEach((c, i) => c.classList.toggle("current", i === state.current));
  }

  function go(delta) {
    const next = state.current + delta;
    if (next < 0 || next >= state.questions.length) return;
    state.current = next;
    renderQuestion();
  }
  function toggleFlag() {
    state.flags[state.current] = !state.flags[state.current];
    renderQuestion();
    refreshPaletteCell(state.current);
  }

  /* ---------------- Finishing & scoring ---------------- */
  function finishTest(auto) {
    if (state.finished) return;
    const answered = state.answers.filter((a) => a !== null).length;
    if (!auto) {
      const unanswered = state.questions.length - answered;
      if (unanswered > 0 &&
        !confirm(`You have ${unanswered} unanswered question(s). On the real CCAT there's no penalty for guessing — answer them all!\n\nFinish and score anyway?`)) {
        return;
      }
    }
    state.finished = true;
    stopTimer();
    renderResults(auto);
    showScreen("screen-results");
  }

  function percentileBand(pct) {
    if (pct >= 90) return { band: "Top ~5% (≈95th percentile)", note: "Outstanding — well above the typical hiring bar for most roles." };
    if (pct >= 80) return { band: "≈ 88th percentile", note: "Excellent. Comfortably above the cut-off for competitive roles." };
    if (pct >= 70) return { band: "≈ 78th percentile", note: "Strong result — above average and a good score for many positions." };
    if (pct >= 60) return { band: "≈ 68th percentile", note: "Above average. With a bit more speed you'll reach the top tier." };
    if (pct >= 50) return { band: "≈ 58th percentile", note: "Slightly above the average CCAT score (~24/50)." };
    if (pct >= 44) return { band: "≈ 50th percentile", note: "Right around the average CCAT score. Keep practising for speed and accuracy." };
    if (pct >= 34) return { band: "≈ 35th percentile", note: "Below average — focus on the categories that cost you the most marks." };
    if (pct >= 24) return { band: "≈ 22nd percentile", note: "Plenty of room to grow. Work on pacing so you reach more questions." };
    return { band: "Bottom ~15%", note: "Don't worry — review the explanations below and try again. Speed comes with practice." };
  }

  function renderResults(auto) {
    const qs = state.questions;
    const total = qs.length;
    let correct = 0;
    const catStat = {};
    CATEGORIES.forEach((c) => (catStat[c] = { correct: 0, total: 0 }));

    qs.forEach((q, i) => {
      catStat[q.category].total++;
      if (state.answers[i] === q.answer) { correct++; catStat[q.category].correct++; }
    });
    const pct = Math.round((correct / total) * 100);
    const band = percentileBand(pct);
    const timeUsed = state.config.timer ? state.limitSec - state.remainingSec : state.elapsedSec;
    const answered = state.answers.filter((a) => a !== null).length;

    // Save best score per test
    const key = `ccat_best_${state.test.id}`;
    const prevBest = parseInt(localStorage.getItem(key) || "0", 10);
    if (pct > prevBest) localStorage.setItem(key, String(pct));

    // ---- Summary with score ring ----
    const R = 70, C = 2 * Math.PI * R, off = C * (1 - correct / total);
    $("#results-summary").innerHTML =
      `<div class="score-ring">
         <svg width="180" height="180" viewBox="0 0 180 180">
           <circle cx="90" cy="90" r="${R}" fill="none" stroke="#eef2fa" stroke-width="16"/>
           <circle cx="90" cy="90" r="${R}" fill="none" stroke="#2f6df6" stroke-width="16"
             stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
         </svg>
         <div class="ring-label"><div class="ring-num">${correct}</div><div class="ring-of">of ${total}</div></div>
       </div>
       <div class="summary-text">
         <h2>${pct}% correct${auto ? " · ⏱ time expired" : ""}</h2>
         <p>Estimated standing: <span class="pct-band">${band.band}</span></p>
         <p>${band.note}</p>
         <div class="summary-pills">
           <span class="pill"><strong>${correct}</strong> correct</span>
           <span class="pill"><strong>${total - correct}</strong> incorrect</span>
           <span class="pill"><strong>${total - answered}</strong> skipped</span>
           <span class="pill">Time used: <strong>${fmtTime(timeUsed)}</strong></span>
         </div>
       </div>`;

    // ---- Category breakdown ----
    const bd = $("#results-breakdown");
    bd.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const st = catStat[c];
      const p = st.total ? Math.round((st.correct / st.total) * 100) : 0;
      const card = document.createElement("div");
      card.className = "bd-card";
      card.innerHTML =
        `<h4>${c}<span>${st.correct}/${st.total}</span></h4>
         <div class="bd-bar"><div style="width:${p}%"></div></div>`;
      bd.appendChild(card);
    });

    state.reviewFilter = "all";
    $$(".review-filter .chip").forEach((c) => c.classList.toggle("chip-active", c.dataset.filter === "all"));
    renderReview();
  }

  function renderReview() {
    const list = $("#review-list");
    list.innerHTML = "";
    state.questions.forEach((q, i) => {
      const chosen = state.answers[i];
      const isCorrect = chosen === q.answer;
      const isSkipped = chosen === null;
      const status = isSkipped ? "skipped" : isCorrect ? "correct" : "wrong";
      if (state.reviewFilter !== "all" && state.reviewFilter !== status) return;

      const optsHTML = q.options.map((opt, idx) => {
        const txt = (typeof opt === "object" && opt.svg)
          ? `<span class="opt-fig">${opt.svg}</span>` : `<span>${opt}</span>`;
        let cls = "ri-opt";
        let mark = "";
        if (idx === q.answer) { cls += " is-correct"; mark = "✓ correct"; }
        else if (idx === chosen) { cls += " is-chosen-wrong"; mark = "✗ your answer"; }
        return `<div class="${cls}"><span class="opt-key">${LETTERS[idx]}</span>${txt}<span class="mark">${mark}</span></div>`;
      }).join("");

      const item = document.createElement("div");
      item.className = `review-item ${status}`;
      item.innerHTML =
        `<div class="ri-head">
           <span class="ri-num">Question ${i + 1}</span>
           <span class="ri-tag ${status}">${status === "wrong" ? "Incorrect" : status[0].toUpperCase() + status.slice(1)}</span>
         </div>
         <div class="ri-cat">${q.category} · ${q.type}</div>
         <div class="ri-stem">${q.stem}${q.figuresHTML ? `<div class="ri-figs">${q.figuresHTML}</div>` : ""}</div>
         <div class="ri-opts">${optsHTML}</div>
         <div class="ri-explain"><strong>Explanation:</strong> ${q.explanation}</div>`;
      list.appendChild(item);
    });
    if (!list.children.length) {
      list.innerHTML = `<div class="review-item"><div class="ri-explain">No questions in this category.</div></div>`;
    }
  }

  /* ---------------- Navigation / exit ---------------- */
  function goHome() {
    stopTimer();
    state.finished = true;
    renderHome();
    showScreen("screen-home");
  }
  function confirmLeaveToHome() {
    if (state.test && !state.finished && $("#screen-test").classList.contains("active")) {
      if (!confirm("Leave this test? Your progress will be lost.")) return;
    }
    goHome();
  }

  /* ---------------- Wiring ---------------- */
  function init() {
    renderHome();

    $("#btn-prev").addEventListener("click", () => go(-1));
    $("#btn-next").addEventListener("click", () => go(1));
    $("#btn-flag").addEventListener("click", toggleFlag);
    $("#btn-finish").addEventListener("click", () => finishTest(false));
    $("#btn-finish-2").addEventListener("click", () => finishTest(false));
    $("#btn-home").addEventListener("click", goHome);
    $("#btn-retake").addEventListener("click", () => startTest(state.test));
    $("#brand-home").addEventListener("click", confirmLeaveToHome);

    $$(".review-filter .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        $$(".review-filter .chip").forEach((c) => c.classList.remove("chip-active"));
        chip.classList.add("chip-active");
        state.reviewFilter = chip.dataset.filter;
        renderReview();
      });
    });

    // Keyboard: 1-5 / A-E select, arrows navigate, F flag
    document.addEventListener("keydown", (e) => {
      if (!$("#screen-test").classList.contains("active")) return;
      const q = state.questions[state.current];
      if (!q) return;
      const k = e.key.toLowerCase();
      const letterIdx = LETTERS.map((l) => l.toLowerCase()).indexOf(k);
      const numIdx = /^[1-6]$/.test(k) ? parseInt(k, 10) - 1 : -1;
      const idx = letterIdx >= 0 ? letterIdx : numIdx;
      if (idx >= 0 && idx < q.options.length) { selectOption(idx); e.preventDefault(); }
      else if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
      else if (k === "f") { toggleFlag(); e.preventDefault(); }
    });

    // Warn before accidental unload mid-test
    window.addEventListener("beforeunload", (e) => {
      if (state.test && !state.finished && $("#screen-test").classList.contains("active")) {
        e.preventDefault(); e.returnValue = "";
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
