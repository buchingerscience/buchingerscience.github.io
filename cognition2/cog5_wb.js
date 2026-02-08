// /cognition/cog5_wb.js
// Emoji Span (working memory) — simplified module version (cog1 vibe)
// Exports: init(container, api)
// api.saveResult(testId, metrics, extra)

export function init(container, api) {
  container.innerHTML = `
    <style>
      .wb-wrap{ --maxw: 780px; max-width: var(--maxw); margin: 0 auto; padding: 0; box-sizing:border-box; }

      .wb-top{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 12px;
      }
      .wb-title{ font-weight: 650; letter-spacing:.2px; }
      .wb-sub{ font-size: 12px; opacity:.78; margin-top: 2px; }

      .wb-actions{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }
      .wb-pill{
        display:inline-flex; align-items:center; justify-content:center;
        padding: 7px 12px;
        border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.9);
        font-size: 13px;
        color: inherit;
        cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        white-space: nowrap;
      }
      .wb-pill:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .wb-pill.primary{ background: var(--accent, #5bc2e7); color:#fff; border-color: rgba(0,0,0,0.05); }
      .wb-pill.primary:hover{ background:#67c9ea; }
      .wb-pill.danger{ background:#fff; border-color: rgba(220,53,69,0.25); }
      .wb-pill.danger:hover{ background: rgba(220,53,69,0.06); }

      .wb-card{
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 14px;
      }

      .wb-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .wb-row.spread{ justify-content: space-between; }

      .wb-badges{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; }
      .wb-badge{
        padding: 4px 8px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
        white-space: nowrap;
      }
      .wb-badge.ok{ border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .wb-badge.bad{ border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .wb-display{
        margin-top: 12px;
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        min-height: 96px;
        display:flex; align-items:center; justify-content:center;
        user-select:none;
        font-weight: 700;
        font-size: 44px;
        line-height: 1.2;
        text-align:center;
        padding: 10px;
      }

      .wb-answer{
        margin-top: 10px;
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 10px 12px;
        background: rgba(255,255,255,0.95);
        display:flex; align-items:center; justify-content:space-between; gap:10px;
      }
      .wb-answer .val{ font-weight:650; font-size: 18px; line-height:1.2; }
      .wb-answer .hint{ font-size: 12px; opacity:.7; }

      .wb-kbd{
        margin-top: 10px;
        display:grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }
      @media (max-width: 560px){
        .wb-kbd{ grid-template-columns: repeat(4, 1fr); }
      }
      .wb-btn{
        padding: 12px 10px;
        border-radius: 8px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.95);
        cursor: pointer;
        transition: transform .12s ease, box-shadow .12s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        user-select:none;
      }
      .wb-btn:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .wb-btn:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }

      .wb-emo{ font-size: 22px; }
      .wb-mini{ font-size: 12px; opacity:.8; }

      .wb-controls{
        margin-top: 10px;
        display:flex; gap:8px; flex-wrap:wrap; align-items:center;
      }
      .wb-controls .wb-pill{ padding: 8px 12px; border-radius: 16px; }

      .wb-kv{
        margin-top: 12px;
        display:grid; grid-template-columns: 1fr auto; gap: 6px 10px;
        font-size: 12.5px;
      }
      .wb-kv div:nth-child(odd){ opacity:.78; }

      .wb-foot{
        margin-top: 10px;
        font-size: 12px;
        opacity: .75;
        line-height: 1.35;
      }
    </style>

    <div class="wb-wrap">
      <div class="wb-top">
        <div>
          <div class="wb-title">Emoji Span</div>
          <div class="wb-sub">Watch the emojis. Then repeat them.</div>
        </div>
        <div class="wb-actions">
          <button class="wb-pill" id="btnMode" type="button" title="Toggle forward/backward">Forward</button>
          <button class="wb-pill primary" id="btnStart" type="button">Start</button>
          <button class="wb-pill" id="btnFinish" type="button">Finish</button>
          <button class="wb-pill danger" id="btnReset" type="button">Reset</button>
        </div>
      </div>

      <section class="wb-card" aria-live="polite">
        <div class="wb-row spread">
          <div class="wb-badges">
            <span class="wb-badge" id="badgePhase">Idle</span>
            <span class="wb-badge" id="badgeLen">Len: –</span>
            <span class="wb-badge" id="badgeTrial">Trial: –</span>
          </div>

          <div class="wb-badges">
            <span class="wb-badge" id="badgeBest">Best: –</span>
          </div>
        </div>

        <div class="wb-display" id="display">Press Start</div>

        <div class="wb-answer">
          <div>
            <div class="wb-mini">Your answer</div>
            <div class="val" id="answer">—</div>
          </div>
          <div class="hint" id="answerHint">Tap emojis below</div>
        </div>

        <div class="wb-kbd" id="kbd">
          <!-- buttons injected -->
        </div>

        <div class="wb-controls">
          <button class="wb-pill" id="btnBack" type="button">Backspace</button>
          <button class="wb-pill" id="btnClear" type="button">Clear</button>
          <button class="wb-pill primary" id="btnSubmit" type="button">Submit</button>
        </div>

        <div class="wb-kv">
          <div>Latest span</div><div id="latestSpan">–</div>
          <div>Latest mode</div><div id="latestMode">–</div>
          <div>Last session</div><div id="latestDate">–</div>
        </div>

        <div class="wb-foot" id="foot">
          Forward: same order. Backward: reverse order.
        </div>
      </section>
    </div>
  `;

  /********************************************************************
   * Logic (simplified)
   ********************************************************************/
  const CFG = {
    storageKey: "emojiSpan.simple.v1",
    // Keep it short. This is for daily tracking.
    speedMs: 800,
    gapMs: 220,
    trialsPerLen: 2,
    // Span range
    forward: { start: 3, max: 9 },
    backward:{ start: 2, max: 8 },
    emojis: ["🍎","🍌","🍇","🍓","🥝","🍍","🥕","🥦","🌽","🥒"]
  };

  const el = {
    btnMode: container.querySelector("#btnMode"),
    btnStart: container.querySelector("#btnStart"),
    btnFinish: container.querySelector("#btnFinish"),
    btnReset: container.querySelector("#btnReset"),

    badgePhase: container.querySelector("#badgePhase"),
    badgeLen: container.querySelector("#badgeLen"),
    badgeTrial: container.querySelector("#badgeTrial"),
    badgeBest: container.querySelector("#badgeBest"),

    display: container.querySelector("#display"),
    answer: container.querySelector("#answer"),
    answerHint: container.querySelector("#answerHint"),

    kbd: container.querySelector("#kbd"),
    btnBack: container.querySelector("#btnBack"),
    btnClear: container.querySelector("#btnClear"),
    btnSubmit: container.querySelector("#btnSubmit"),

    latestSpan: container.querySelector("#latestSpan"),
    latestMode: container.querySelector("#latestMode"),
    latestDate: container.querySelector("#latestDate"),
    foot: container.querySelector("#foot")
  };

  const state = {
    mode: "forward",          // forward | backward
    running: false,
    phase: "idle",            // idle | show | input | done
    len: null,
    trial: 0,                 // 0..trialsPerLen-1
    correctThisLen: 0,
    maxPassed: 0,
    startedAt: null,

    seq: [],
    expected: [],
    answer: [],
    timers: [],

    // summary
    totalTrials: 0,
    testTrials: 0,
    testCorrect: 0
  };

  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch { return iso; }
  }

  function setBadge(node, text, kind=null) {
    node.textContent = text;
    node.classList.remove("ok","bad");
    if (kind) node.classList.add(kind);
  }

  function clearTimers() {
    state.timers.forEach(t => clearTimeout(t));
    state.timers = [];
  }

  function lockInput(locked) {
    el.btnSubmit.disabled = locked;
    el.btnBack.disabled = locked;
    el.btnClear.disabled = locked;
    el.kbd.querySelectorAll("button").forEach(b => (b.disabled = locked));
  }

  function setPhase(phase, kind=null) {
    state.phase = phase;
    const label =
      phase === "idle" ? "Idle" :
      phase === "show" ? "Watch" :
      phase === "input" ? "Enter" :
      phase === "done" ? "Done" : "Running";
    setBadge(el.badgePhase, label, kind);
  }

  function updateBadges() {
    setBadge(el.badgeLen, state.len ? `Len: ${state.len}` : "Len: –");
    setBadge(el.badgeTrial, state.running ? `Trial: ${state.trial + 1}/${CFG.trialsPerLen}` : "Trial: –");
  }

  function setMode(mode) {
    if (state.running) return;
    state.mode = mode;
    el.btnMode.textContent = mode === "forward" ? "Forward" : "Backward";
    el.foot.textContent =
      mode === "forward"
        ? "Forward: repeat in the same order."
        : "Backward: repeat in reverse order.";
    renderBest();
    renderLatest();
  }

  function renderAnswer() {
    if (!state.answer.length) {
      el.answer.textContent = "—";
      el.answerHint.textContent = "Tap emojis below";
    } else {
      el.answer.textContent = state.answer.join(" ");
      el.answerHint.textContent = `${state.answer.length} / ${state.expected.length || "?"}`;
    }
  }

  function resetAnswer() {
    state.answer = [];
    renderAnswer();
  }

  function generateSeq(len) {
    const seq = [];
    let tries = 0;

    while (seq.length < len && tries < 3000) {
      tries++;
      const emo = CFG.emojis[Math.floor(Math.random() * CFG.emojis.length)];
      const n = seq.length;
      if (n >= 2 && seq[n-1] === emo && seq[n-2] === emo) continue;
      seq.push(emo);
    }
    while (seq.length < len) seq.push(CFG.emojis[Math.floor(Math.random() * CFG.emojis.length)]);
    return seq;
  }

  function expectedFromSeq(seq) {
    return state.mode === "forward" ? seq.slice() : seq.slice().reverse();
  }

  function loadSessions() {
    try {
      const raw = localStorage.getItem(CFG.storageKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  function saveSessions(sessions) {
    localStorage.setItem(CFG.storageKey, JSON.stringify(sessions));
  }

  function addSession(s) {
    const sessions = loadSessions();
    sessions.unshift(s);
    saveSessions(sessions.slice(0, 200));
    renderLatest();
    renderBest();
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  function renderLatest() {
    const sessions = loadSessions();
    const latest = sessions[0] || null;
    el.latestSpan.textContent = latest ? String(latest.span ?? "–") : "–";
    el.latestMode.textContent = latest ? (latest.mode === "forward" ? "Forward" : "Backward") : "–";
    el.latestDate.textContent = latest ? fmtDate(latest.completedAt) : "–";
  }

  function renderBest() {
    const sessions = loadSessions().filter(s => s.dayKey === todayKey() && s.mode === state.mode);
    if (!sessions.length) { el.badgeBest.textContent = "Best: –"; return; }
    const best = sessions.reduce((a,b) => (a.span > b.span ? a : b));
    el.badgeBest.textContent = `Best: ${best.span}`;
  }

  function start() {
    clearTimers();

    state.running = true;
    state.startedAt = nowISO();
    state.maxPassed = 0;

    state.totalTrials = 0;
    state.testTrials = 0;
    state.testCorrect = 0;

    state.trial = 0;
    state.correctThisLen = 0;

    state.len = (state.mode === "forward") ? CFG.forward.start : CFG.backward.start;

    el.btnStart.textContent = "Restart";
    setPhase("show", "ok");
    updateBadges();
    resetAnswer();

    runTrial();
  }

  function stopToIdle() {
    clearTimers();
    state.running = false;
    state.len = null;
    state.trial = 0;
    state.correctThisLen = 0;
    state.seq = [];
    state.expected = [];
    resetAnswer();
    el.btnStart.textContent = "Start";
    el.display.textContent = "Press Start";
    setPhase("idle");
    updateBadges();
    lockInput(true);
  }

  function runTrial() {
    clearTimers();
    resetAnswer();
    lockInput(true);

    setPhase("show", "ok");
    updateBadges();

    state.seq = generateSeq(state.len);
    state.expected = expectedFromSeq(state.seq);

    el.display.textContent = "•";

    let t = 0;
    for (let i=0; i<state.seq.length; i++) {
      t += (i === 0 ? 220 : CFG.gapMs);
      state.timers.push(setTimeout(() => { el.display.textContent = state.seq[i]; }, t));
      t += CFG.speedMs;
      state.timers.push(setTimeout(() => { el.display.textContent = "•"; }, t));
    }

    t += 140;
    state.timers.push(setTimeout(() => {
      setPhase("input");
      el.display.textContent = "Enter";
      lockInput(false);
      resetAnswer();
      updateBadges();
    }, t));
  }

  function submit() {
    if (!state.running) return;
    if (state.phase !== "input") return;

    if (state.answer.length !== state.expected.length) {
      el.answerHint.textContent = `Need ${state.expected.length}`;
      return;
    }

    lockInput(true);
    setPhase("done");

    const ok = state.answer.join("|") === state.expected.join("|");

    // count
    state.totalTrials += 1;
    state.testTrials += 1;
    if (ok) { state.testCorrect += 1; state.correctThisLen += 1; }

    el.display.textContent = ok ? "Correct ✓" : "Incorrect ✕";
    setPhase("done", ok ? "ok" : "bad");

    state.trial += 1;

    state.timers.push(setTimeout(() => {
      if (state.trial >= CFG.trialsPerLen) {
        const passed = state.correctThisLen >= 1;
        if (passed) {
          state.maxPassed = Math.max(state.maxPassed, state.len);

          const maxLen = (state.mode === "forward") ? CFG.forward.max : CFG.backward.max;
          if (state.len >= maxLen) { finish("reached_max"); return; }

          // next length
          state.len += 1;
          state.trial = 0;
          state.correctThisLen = 0;
          setPhase("show", "ok");
          runTrial();
        } else {
          finish("failed_len");
        }
      } else {
        // second trial same length
        setPhase("show", "ok");
        runTrial();
      }
    }, 750));
  }

  function finish(reason="manual_finish") {
    const span = state.maxPassed || 0;

    const session = {
      test: "EmojiSpan",
      mode: state.mode,
      span,
      totalTrials: state.totalTrials,
      testTrials: state.testTrials,
      testCorrect: state.testCorrect,
      testAccuracy: state.testTrials ? (state.testCorrect / state.testTrials) : null,
      startedAt: state.startedAt,
      completedAt: nowISO(),
      dayKey: todayKey(),
      settings: { speedMs: CFG.speedMs, gapMs: CFG.gapMs, trialsPerLen: CFG.trialsPerLen },
      reason
    };

    addSession(session);

    // UI
    state.running = false;
    el.btnStart.textContent = "Start";
    setPhase("done");
    updateBadges();
    lockInput(true);
    el.display.textContent = `Span: ${span}`;
    resetAnswer();

    // Battery save
    api.saveResult("wb", {
      mode: state.mode,
      span,
      totalTrials: session.totalTrials,
      testAccuracy: session.testAccuracy === null ? null : Number(session.testAccuracy.toFixed(3))
    }, {
      version: "2.0_simplified",
      reason,
      raw: session
    });
  }

  // Keypad UI
  function buildKeypad() {
    el.kbd.innerHTML = "";
    for (const emo of CFG.emojis) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "wb-btn";
      b.innerHTML = `<span class="wb-emo">${emo}</span>`;
      b.addEventListener("click", () => {
        if (!state.running || state.phase !== "input") return;
        if (state.answer.length >= state.expected.length) return;
        state.answer.push(emo);
        renderAnswer();
      });
      el.kbd.appendChild(b);
    }
  }

  // Keyboard: 1–9 -> first 9 emojis, 0 -> last emoji
  function onKeydown(e) {
    if (!state.running || state.phase !== "input") return;

    if (e.key >= "0" && e.key <= "9") {
      const map = { "1":0,"2":1,"3":2,"4":3,"5":4,"6":5,"7":6,"8":7,"9":8,"0":9 };
      const idx = map[e.key];
      const emo = CFG.emojis[idx];
      if (state.answer.length < state.expected.length) {
        state.answer.push(emo);
        renderAnswer();
      }
    } else if (e.key === "Backspace") {
      state.answer.pop();
      renderAnswer();
    } else if (e.key === "Enter") {
      submit();
    } else if (e.key === "Escape") {
      resetAnswer();
    }
  }
  window.addEventListener("keydown", onKeydown);

  // Buttons
  el.btnMode.addEventListener("click", () => {
    if (state.running) return;
    setMode(state.mode === "forward" ? "backward" : "forward");
  });

  el.btnStart.addEventListener("click", () => {
    if (state.running) { stopToIdle(); start(); }
    else start();
  });

  el.btnFinish.addEventListener("click", () => {
    if (state.running) finish("manual_finish");
    else api.saveResult("wb", { note: "Finished without run" }, { version: "2.0_simplified" });
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CFG.storageKey);
    renderLatest();
    renderBest();
    el.latestSpan.textContent = "–";
    el.latestMode.textContent = "–";
    el.latestDate.textContent = "–";
    el.badgeBest.textContent = "Best: –";
  });

  el.btnBack.addEventListener("click", () => {
    if (!state.running || state.phase !== "input") return;
    state.answer.pop();
    renderAnswer();
  });

  el.btnClear.addEventListener("click", () => {
    if (!state.running || state.phase !== "input") return;
    resetAnswer();
  });

  el.btnSubmit.addEventListener("click", submit);

  // Init
  (function initUI() {
    buildKeypad();
    setMode("forward");
    setPhase("idle");
    updateBadges();
    renderLatest();
    renderBest();
    lockInput(true);
    renderAnswer();
  })();

  // Cleanup
  return () => {
    clearTimers();
    window.removeEventListener("keydown", onKeydown);
  };
}
