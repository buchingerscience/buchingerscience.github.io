// /cognition/cog5_wb.js
// Emoji Span (working memory) — module version
// Exports: init(container, api)
// api.saveResult(testId, metrics, extra)
// api.next() optional

export function init(container, api) {
  /********************************************************************
   * UI (block version)
   ********************************************************************/
  container.innerHTML = `
    <style>
      /* Scoped under .wb-wrap */
      .wb-wrap { --maxw: 980px; max-width: var(--maxw); margin: 0 auto; padding: 12px 0 18px; }

      .wb-topbar {
        display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 10px 12px;
        margin: 0 0 12px;
      }
      .wb-brand { font-weight: 650; letter-spacing: 0.2px; }
      .wb-pill-row { display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }

      .wb-pill {
        display:inline-flex; align-items:center; gap:8px;
        padding: 7px 12px;
        border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.9);
        font-size: 13px;
        color: inherit;
        cursor: pointer;
        text-decoration: none;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        white-space: nowrap;
      }
      .wb-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .wb-pill.primary { background: var(--accent, #5bc2e7); color: #fff; border-color: rgba(0,0,0,0.05); }
      .wb-pill.primary:hover { background: #67c9ea; }
      .wb-pill.danger { background: #fff; border-color: rgba(220,53,69,0.25); }
      .wb-pill.danger:hover { background: rgba(220,53,69,0.06); }

      .wb-seg {
        display:flex; border: 1px solid var(--border, #e9ecef); border-radius: 16px; overflow:hidden;
        background: rgba(255,255,255,0.9);
      }
      .wb-seg button {
        border: 0; background: transparent; padding: 8px 12px; cursor:pointer;
        font-size: 13px;
      }
      .wb-seg button.active { background: rgba(91,194,231,0.18); color: #0b4f6c; }

      .wb-grid { display:grid; grid-template-columns: 1.15fr 0.85fr; gap: 16px; }
      @media (max-width: 900px) { .wb-grid { grid-template-columns: 1fr; } }

      .wb-card {
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 18px;
      }
      .wb-muted { opacity: .78; }
      .wb-small { font-size: 12.5px; }

      .wb-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
      .wb-row.spread { justify-content: space-between; }
      .wb-stack { display:flex; flex-direction:column; gap:10px; }

      .wb-label { font-size: 12px; opacity: .8; margin-bottom: 6px; }
      .wb-value {
        font-size: 44px;
        font-weight: 700;
        padding: 16px;
        text-align:center;
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        min-height: 84px;
        display:flex; align-items:center; justify-content:center;
        user-select: none;
        line-height: 1.2;
      }

      .wb-kv { display:grid; grid-template-columns: 1fr auto; gap: 8px 10px; font-size: 13px; }
      .wb-kv div:nth-child(odd) { opacity: .78; }

      .wb-kbd { display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
      .wb-kbd button {
        padding: 14px 10px;
        border-radius: 8px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.95);
        cursor: pointer;
        font-size: 22px;
        transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
      }
      .wb-kbd button:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .wb-kbd button.wide { grid-column: span 2; }
      .wb-kbd button.action { background: rgba(248,249,250,0.95); font-size: 14px; }

      .wb-answer {
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 10px 12px;
        min-height: 52px;
        display:flex;
        align-items:center;
        gap: 8px;
        justify-content: space-between;
        background: rgba(255,255,255,0.95);
        font-size: 18px;
      }
      .wb-answer .digits { font-weight: 650; line-height: 1.2; }
      .wb-answer .hint { font-size: 12px; opacity: .65; }

      .wb-status {
        display:flex; gap:8px; flex-wrap:wrap; align-items:center;
        font-size: 12.5px;
      }
      .wb-badge {
        padding: 5px 9px;
        border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
      }
      .wb-badge.ok { border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .wb-badge.bad { border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .wb-table { width:100%; border-collapse: collapse; }
      .wb-table th, .wb-table td { text-align:left; padding: 10px 8px; border-bottom: 1px solid var(--border, #e9ecef); font-size: 13px; }
      .wb-table th { background: rgba(248,249,250,0.9); font-weight: 650; }
      .wb-right { text-align:right; }

      .wb-footnote { margin-top: 12px; font-size: 12px; opacity: .75; line-height: 1.35; }
    </style>

    <div class="wb-wrap">
      <div class="wb-topbar">
        <div class="wb-brand">Emoji Span Test</div>

        <div class="wb-pill-row">
          <div class="wb-seg" role="tablist" aria-label="Mode">
            <button id="modeForward" class="active" type="button" role="tab" aria-selected="true">Forward</button>
            <button id="modeBackward" type="button" role="tab" aria-selected="false">Backward</button>
          </div>
          <button id="btnStart" class="wb-pill primary" type="button">Start</button>
          <button id="btnFinish" class="wb-pill" type="button" title="Finish now and save">Finish</button>
          <button id="btnReset" class="wb-pill danger" type="button" title="Clears your saved history">Reset history</button>
        </div>
      </div>

      <div class="wb-grid">
        <!-- Main test card -->
        <section class="wb-card" aria-live="polite">
          <div class="wb-row spread">
            <div class="wb-stack" style="gap:4px;">
              <div class="wb-muted wb-small" id="subtitle">A short attention and working-memory test using food emojis. Two trials per length.</div>
              <div class="wb-status" id="statusRow">
                <span class="wb-badge" id="badgePhase">Idle</span>
                <span class="wb-badge" id="badgeLength">Length: –</span>
                <span class="wb-badge" id="badgeTrial">Trial: –</span>
              </div>
            </div>

            <div class="wb-kv" style="min-width: 220px;">
              <div>Speed</div><div><span id="speedLabel">900</span> ms</div>
              <div>Gap</div><div><span id="gapLabel">250</span> ms</div>
              <div>Practice</div><div><span id="practiceLabel">2</span> trials</div>
            </div>
          </div>

          <div style="height: 14px;"></div>

          <div class="wb-label" id="mainLabel">Stimulus</div>
          <div class="wb-value" id="display">Press Start</div>

          <div style="height: 12px;"></div>

          <div class="wb-label">Your answer</div>
          <div class="wb-answer">
            <div class="digits" id="answerDigits">—</div>
            <div class="hint" id="answerHint">Tap emojis below</div>
          </div>

          <div class="wb-kbd" aria-label="Emoji keypad">
            <button type="button" data-emo="0">🍎</button>
            <button type="button" data-emo="1">🍌</button>
            <button type="button" data-emo="2">🍇</button>
            <button type="button" data-emo="3">🍓</button>
            <button type="button" data-emo="4">🥝</button>
            <button type="button" data-emo="5">🍍</button>
            <button type="button" data-emo="6">🥕</button>
            <button type="button" data-emo="7">🥦</button>
            <button type="button" data-emo="8">🌽</button>

            <button type="button" class="action wide" id="btnBackspace">Backspace</button>
            <button type="button" data-emo="9">🥒</button>
            <button type="button" class="action" id="btnClear">Clear</button>
            <button type="button" class="action wide" id="btnSubmit">Submit</button>
          </div>

          <div class="wb-footnote" id="instructions">
            <strong>Forward:</strong> repeat the emojis in the same order.<br />
            <strong>Backward:</strong> repeat the emojis in reverse order.<br />
            Tip: keep the same device and the same time of day for comparisons.
          </div>
        </section>

        <!-- Results + history -->
        <aside class="wb-card">
          <div class="wb-row spread">
            <div>
              <div style="font-weight:650;">Results</div>
              <div class="wb-muted wb-small">Saved locally + sent to the battery.</div>
            </div>
            <button class="wb-pill" id="btnExport" type="button">Export JSON</button>
          </div>

          <div style="height: 12px;"></div>

          <div class="wb-kv">
            <div>Forward span (latest)</div><div id="latestForward">–</div>
            <div>Backward span (latest)</div><div id="latestBackward">–</div>
            <div>Last session</div><div id="latestDate">–</div>
          </div>

          <div style="height: 14px;"></div>

          <div style="font-weight:650; margin-bottom: 8px;">History</div>
          <div style="overflow:auto; border:1px solid var(--border, #e9ecef); border-radius: 8px;">
            <table class="wb-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mode</th>
                  <th class="wb-right">Span</th>
                  <th class="wb-right">Trials</th>
                </tr>
              </thead>
              <tbody id="historyBody">
                <tr><td colspan="4" class="wb-muted">No sessions yet.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="wb-footnote">
            <strong>Scoring:</strong> two trials per length. If you get at least 1/2 correct, you move up.
            The test stops when you get 0/2 correct at a given length.
          </div>
        </aside>
      </div>
    </div>
  `;

  /********************************************************************
   * Logic
   ********************************************************************/
  const CONFIG = {
    speedMs: 900,
    gapMs: 250,
    practiceTrials: 2,
    trialsPerLength: 2,
    forward: { startLen: 3, maxLen: 9 },
    backward:{ startLen: 2, maxLen: 8 },
    storageKey: "emojiSpan.sessions.v1",
    emojiKeys: ["🍎","🍌","🍇","🍓","🥝","🍍","🥕","🥦","🌽","🥒"]
  };

  const el = {
    modeForward: container.querySelector("#modeForward"),
    modeBackward: container.querySelector("#modeBackward"),
    btnStart: container.querySelector("#btnStart"),
    btnFinish: container.querySelector("#btnFinish"),
    btnReset: container.querySelector("#btnReset"),
    btnExport: container.querySelector("#btnExport"),

    subtitle: container.querySelector("#subtitle"),
    badgePhase: container.querySelector("#badgePhase"),
    badgeLength: container.querySelector("#badgeLength"),
    badgeTrial: container.querySelector("#badgeTrial"),

    speedLabel: container.querySelector("#speedLabel"),
    gapLabel: container.querySelector("#gapLabel"),
    practiceLabel: container.querySelector("#practiceLabel"),

    mainLabel: container.querySelector("#mainLabel"),
    display: container.querySelector("#display"),
    answerDigits: container.querySelector("#answerDigits"),
    answerHint: container.querySelector("#answerHint"),

    btnBackspace: container.querySelector("#btnBackspace"),
    btnClear: container.querySelector("#btnClear"),
    btnSubmit: container.querySelector("#btnSubmit"),

    historyBody: container.querySelector("#historyBody"),
    latestForward: container.querySelector("#latestForward"),
    latestBackward: container.querySelector("#latestBackward"),
    latestDate: container.querySelector("#latestDate"),
    instructions: container.querySelector("#instructions")
  };

  const state = {
    mode: "forward",
    phase: "idle",
    isRunning: false,
    isShowing: false,

    startedAt: null,
    currentLen: null,
    currentTrialIndex: 0,
    correctInThisLen: 0,
    totalTrials: 0,

    practiceDone: 0,

    sequence: [],
    expected: [],
    answer: [],

    maxPassedLen: 0,
    timers: [],

    // summary
    totalCorrectTestTrials: 0,
    totalTestTrials: 0
  };

  function nowISO() { return new Date().toISOString(); }
  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch { return iso; }
  }

  function clearTimers() {
    state.timers.forEach(t => clearTimeout(t));
    state.timers = [];
  }

  function setBadge(node, text, kind = null) {
    node.textContent = text;
    node.classList.remove("ok", "bad");
    if (kind) node.classList.add(kind);
  }

  function lockInput(locked) {
    state.isShowing = locked;
    el.btnSubmit.disabled = locked;
  }

  function resetAnswer() {
    state.answer = [];
    el.answerDigits.textContent = "—";
    el.answerHint.textContent = "Tap emojis below";
  }

  function setAnswerText() {
    if (!state.answer.length) {
      el.answerDigits.textContent = "—";
      el.answerHint.textContent = "Tap emojis below";
    } else {
      el.answerDigits.textContent = state.answer.join(" ");
      el.answerHint.textContent = `${state.answer.length} items`;
    }
  }

  function phaseLabel() {
    if (!state.isRunning) return "Idle";
    if (state.phase.startsWith("practice")) return "Practice";
    if (state.phase === "show") return "Showing";
    if (state.phase === "input") return "Enter";
    if (state.phase === "feedback") return "Feedback";
    if (state.phase === "done") return "Done";
    return "Running";
  }

  function updateBadges() {
    setBadge(el.badgePhase, phaseLabel());
    setBadge(el.badgeLength, state.currentLen ? `Length: ${state.currentLen}` : "Length: –");
    setBadge(el.badgeTrial, state.isRunning ? `Trial: ${state.currentTrialIndex + 1}/${CONFIG.trialsPerLength}` : "Trial: –");
  }

  function setDisplay(text) { el.display.textContent = text; }

  function setMode(mode) {
    state.mode = mode;

    const isF = (mode === "forward");
    el.modeForward.classList.toggle("active", isF);
    el.modeBackward.classList.toggle("active", !isF);
    el.modeForward.setAttribute("aria-selected", isF ? "true" : "false");
    el.modeBackward.setAttribute("aria-selected", !isF ? "true" : "false");

    el.instructions.innerHTML = isF
      ? "<strong>Forward:</strong> repeat the emojis in the same order.<br /><strong>Tip:</strong> keep the same device and the same time of day for comparisons."
      : "<strong>Backward:</strong> repeat the emojis in reverse order.<br /><strong>Tip:</strong> keep the same device and the same time of day for comparisons.";

    if (!state.isRunning) {
      setDisplay("Press Start");
      el.mainLabel.textContent = "Stimulus";
      resetAnswer();
      updateBadges();
    }
  }

  function generateSequence(len) {
    const pool = CONFIG.emojiKeys;
    const seq = [];
    let tries = 0;

    while (seq.length < len && tries < 2000) {
      tries++;
      const emo = pool[Math.floor(Math.random() * pool.length)];
      const n = seq.length;

      // Avoid triple repeats
      if (n >= 2 && seq[n-1] === emo && seq[n-2] === emo) continue;

      // Avoid a single emoji dominating too much
      const counts = {};
      for (const e of seq) counts[e] = (counts[e] || 0) + 1;
      if ((counts[emo] || 0) >= Math.ceil(len / 2)) continue;

      seq.push(emo);
    }
    while (seq.length < len) seq.push(pool[Math.floor(Math.random() * pool.length)]);
    return seq;
  }

  function expectedFromSequence(seq) {
    return (state.mode === "forward") ? seq.slice() : seq.slice().reverse();
  }

  function loadSessions() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  function saveSessions(sessions) {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(sessions));
  }

  function addSession(session) {
    const sessions = loadSessions();
    sessions.unshift(session);
    saveSessions(sessions.slice(0, 200));
    renderHistory();
    renderLatest();
  }

  function renderLatest() {
    const sessions = loadSessions();
    const latest = sessions[0] || null;
    const latestF = sessions.find(s => s.mode === "forward") || null;
    const latestB = sessions.find(s => s.mode === "backward") || null;

    el.latestForward.textContent = latestF ? String(latestF.span) : "–";
    el.latestBackward.textContent = latestB ? String(latestB.span) : "–";
    el.latestDate.textContent = latest ? fmtDate(latest.completedAt) : "–";
  }

  function renderHistory() {
    const sessions = loadSessions();
    const body = el.historyBody;
    body.innerHTML = "";

    if (!sessions.length) {
      body.innerHTML = '<tr><td colspan="4" class="wb-muted">No sessions yet.</td></tr>';
      return;
    }

    for (const s of sessions.slice(0, 12)) {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = fmtDate(s.completedAt);

      const tdMode = document.createElement("td");
      tdMode.textContent = s.mode === "forward" ? "Forward" : "Backward";

      const tdSpan = document.createElement("td");
      tdSpan.className = "wb-right";
      tdSpan.textContent = String(s.span);

      const tdTrials = document.createElement("td");
      tdTrials.className = "wb-right";
      tdTrials.textContent = String(s.totalTrials);

      tr.appendChild(tdDate);
      tr.appendChild(tdMode);
      tr.appendChild(tdSpan);
      tr.appendChild(tdTrials);
      body.appendChild(tr);
    }
  }

  function startTest() {
    clearTimers();

    state.isRunning = true;
    state.startedAt = nowISO();
    state.practiceDone = 0;
    state.maxPassedLen = 0;

    state.totalTrials = 0;
    state.totalCorrectTestTrials = 0;
    state.totalTestTrials = 0;

    const startLen = (state.mode === "forward") ? CONFIG.forward.startLen : CONFIG.backward.startLen;
    state.currentLen = startLen;
    state.currentTrialIndex = 0;
    state.correctInThisLen = 0;

    resetAnswer();
    setAnswerText();

    el.btnStart.textContent = "Restart";
    el.subtitle.textContent = "Focus. Emojis will appear one by one.";
    runPracticeOrTrial();
  }

  function finishAndSave(reason = "completed") {
    state.phase = "done";
    updateBadges();

    const span = state.maxPassedLen || 0;

    const session = {
      test: "EmojiSpan",
      mode: state.mode,
      span,
      totalTrials: state.totalTrials,
      startedAt: state.startedAt,
      completedAt: nowISO(),
      settings: {
        speedMs: CONFIG.speedMs,
        gapMs: CONFIG.gapMs,
        practiceTrials: CONFIG.practiceTrials,
        trialsPerLength: CONFIG.trialsPerLength
      },
      summary: {
        testTrials: state.totalTestTrials,
        testCorrect: state.totalCorrectTestTrials,
        testAccuracy: state.totalTestTrials ? (state.totalCorrectTestTrials / state.totalTestTrials) : null
      },
      reason
    };

    addSession(session);

    el.subtitle.textContent = "Session saved. You can run it again for tracking.";
    el.mainLabel.textContent = "Result";
    setDisplay(`Span = ${span}`);
    lockInput(true);
    resetAnswer();
    setAnswerText();

    state.isRunning = false;
    el.btnStart.textContent = "Start";

    api.saveResult("wb", {
      mode: state.mode,
      span: span,
      totalTrials: state.totalTrials,
      testAccuracy: session.summary.testAccuracy === null ? null : Number(session.summary.testAccuracy.toFixed(3))
    }, {
      version: "1.0",
      reason,
      raw: session
    });
  }

  function runPracticeOrTrial() {
    updateBadges();
    resetAnswer();
    setAnswerText();

    if (state.practiceDone < CONFIG.practiceTrials) {
      state.phase = "practice_show";
      el.mainLabel.textContent = `Practice ${state.practiceDone + 1}/${CONFIG.practiceTrials}`;
      runOneTrial(true);
    } else {
      state.phase = "show";
      el.mainLabel.textContent = `${state.mode === "forward" ? "Forward" : "Backward"} — watch carefully`;
      runOneTrial(false);
    }
  }

  function runOneTrial(isPractice) {
    clearTimers();
    lockInput(true);

    const len = isPractice ? 3 : state.currentLen;
    state.sequence = generateSequence(len);
    state.expected = expectedFromSequence(state.sequence);

    setDisplay("•");

    let t = 0;
    for (let i = 0; i < state.sequence.length; i++) {
      t += (i === 0 ? 250 : CONFIG.gapMs);
      state.timers.push(setTimeout(() => setDisplay(state.sequence[i]), t));
      t += CONFIG.speedMs;
      state.timers.push(setTimeout(() => setDisplay("•"), t));
    }

    t += 120;
    state.timers.push(setTimeout(() => {
      state.phase = "input";
      el.mainLabel.textContent = isPractice ? "Practice — enter the sequence" : "Enter the sequence";
      setDisplay("Enter");
      lockInput(false);
      resetAnswer();
      setAnswerText();
      updateBadges();
    }, t));
  }

  function submitAnswer() {
    if (!state.isRunning) return;
    if (state.isShowing) return;
    if (state.phase !== "input") return;

    if (state.answer.length !== state.expected.length) {
      el.answerHint.textContent = `Need ${state.expected.length} emojis`;
      return;
    }

    state.phase = "feedback";
    lockInput(true);

    const isCorrect = (state.answer.join("|") === state.expected.join("|"));
    state.totalTrials += 1;

    if (state.practiceDone < CONFIG.practiceTrials) {
      state.practiceDone += 1;
      el.mainLabel.textContent = "Practice feedback";
      setDisplay(isCorrect ? "Correct ✓" : "Incorrect ✕");
      setBadge(el.badgePhase, "Practice", isCorrect ? "ok" : "bad");
      state.timers.push(setTimeout(runPracticeOrTrial, 900));
      return;
    }

    // test trials only
    state.totalTestTrials += 1;
    if (isCorrect) {
      state.correctInThisLen += 1;
      state.totalCorrectTestTrials += 1;
    }

    setDisplay(isCorrect ? "Correct ✓" : "Incorrect ✕");
    setBadge(el.badgePhase, "Feedback", isCorrect ? "ok" : "bad");

    state.currentTrialIndex += 1;

    state.timers.push(setTimeout(() => {
      if (state.currentTrialIndex >= CONFIG.trialsPerLength) {
        const passed = (state.correctInThisLen >= 1);

        if (passed) {
          state.maxPassedLen = Math.max(state.maxPassedLen, state.currentLen);

          const maxLen = (state.mode === "forward") ? CONFIG.forward.maxLen : CONFIG.backward.maxLen;
          if (state.currentLen >= maxLen) { finishAndSave("reached_maxLen"); return; }

          state.currentLen += 1;
          state.currentTrialIndex = 0;
          state.correctInThisLen = 0;

          el.subtitle.textContent = "Good. Next length.";
          runPracticeOrTrial();
        } else {
          finishAndSave("failed_length");
        }
      } else {
        el.subtitle.textContent = "Same length, second trial.";
        runPracticeOrTrial();
      }
    }, 900));
  }

  // ===== Events =====
  el.modeForward.addEventListener("click", () => { if (!state.isRunning) setMode("forward"); });
  el.modeBackward.addEventListener("click", () => { if (!state.isRunning) setMode("backward"); });

  el.btnStart.addEventListener("click", () => {
    if (state.isRunning) finishAndSave("restart_midrun");
    startTest();
  });

  el.btnFinish.addEventListener("click", () => {
    if (state.isRunning) finishAndSave("manual_finish");
    else api.saveResult("wb", { note: "Finished without run" }, { version: "1.0" });
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CONFIG.storageKey);
    renderHistory();
    renderLatest();
  });

  // Emoji keypad
  container.querySelectorAll("[data-emo]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!state.isRunning || state.isShowing || state.phase !== "input") return;
      const idx = parseInt(btn.getAttribute("data-emo"), 10);
      const emo = CONFIG.emojiKeys[idx];
      if (state.answer.length >= state.expected.length) return;
      state.answer.push(emo);
      setAnswerText();
    });
  });

  el.btnBackspace.addEventListener("click", () => {
    if (!state.isRunning || state.isShowing || state.phase !== "input") return;
    state.answer.pop();
    setAnswerText();
  });

  el.btnClear.addEventListener("click", () => {
    if (!state.isRunning || state.isShowing || state.phase !== "input") return;
    resetAnswer();
    setAnswerText();
  });

  el.btnSubmit.addEventListener("click", submitAnswer);

  // Keyboard: 1–9 = first 9 emojis, 0 = last emoji; Enter=submit; Backspace=delete
  function onKeydown(e) {
    if (!state.isRunning || state.isShowing || state.phase !== "input") return;

    if (e.key >= "0" && e.key <= "9") {
      const map = {
        "1": 0, "2": 1, "3": 2,
        "4": 3, "5": 4, "6": 5,
        "7": 6, "8": 7, "9": 8,
        "0": 9
      };
      const idx = map[e.key];
      const emo = CONFIG.emojiKeys[idx];
      if (state.answer.length < state.expected.length) {
        state.answer.push(emo);
        setAnswerText();
      }
    } else if (e.key === "Backspace") {
      state.answer.pop();
      setAnswerText();
    } else if (e.key === "Enter") {
      submitAnswer();
    } else if (e.key === "Escape") {
      resetAnswer();
      setAnswerText();
    }
  }
  window.addEventListener("keydown", onKeydown);

  el.btnExport.addEventListener("click", () => {
    const sessions = loadSessions();
    const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "emoji-span-sessions.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Init
  (function initUI() {
    el.speedLabel.textContent = String(CONFIG.speedMs);
    el.gapLabel.textContent = String(CONFIG.gapMs);
    el.practiceLabel.textContent = String(CONFIG.practiceTrials);

    setMode("forward");
    lockInput(true);

    renderHistory();
    renderLatest();
    updateBadges();
    setAnswerText();
  })();

  // Cleanup
  return () => {
    clearTimers();
    window.removeEventListener("keydown", onKeydown);
  };
}
