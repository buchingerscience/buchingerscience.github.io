// /cognition/cog3_dsst.js
// Module version of your DSST page. Renders into the container as a block.
// Exports: init(container, api)
// - api.saveResult(testId, metrics, extra) is provided by cognition.html
// - api.next() can move to the next test (optional)

export function init(container, api) {
  /********************************************************************
   * UI (block version)
   ********************************************************************/
  container.innerHTML = `
    <style>
      /* Scoped under .dsst-wrap */
      .dsst-wrap { --maxw: 1100px; max-width: var(--maxw); margin: 0 auto; padding: 0; box-sizing: border-box; }

      .dsst-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 10px;
      }
      .dsst-brand{ font-weight:650; letter-spacing:.2px; }
      .dsst-pill-row{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }

      .dsst-pill{
        display:inline-flex; align-items:center; gap:8px;
        padding: 7px 11px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.9);
        font-size: 13px; color: inherit; cursor: pointer; text-decoration:none;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        white-space: nowrap;
      }
      .dsst-pill:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .dsst-pill.primary{ background: var(--accent, #5bc2e7); color:#fff; border-color: rgba(0,0,0,0.05); }
      .dsst-pill.primary:hover{ background:#67c9ea; }
      .dsst-pill.danger{ background:#fff; border-color: rgba(220,53,69,0.25); }
      .dsst-pill.danger:hover{ background: rgba(220,53,69,0.06); }

      .dsst-grid{
        display:grid;
        grid-template-columns: 1.6fr 1fr;
        gap: 10px;
        min-height: 520px;
      }
      @media (max-width: 900px){
        .dsst-grid{ grid-template-columns: 1fr; min-height: 0; }
      }

      .dsst-card{
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 12px;
        box-sizing: border-box;
        overflow: hidden;
      }
      .dsst-muted{ opacity:.78; }
      .dsst-small{ font-size: 12px; }
      .dsst-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .dsst-row.spread{ justify-content: space-between; }
      .dsst-status{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; }

      .dsst-badge{
        padding: 4px 8px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
        white-space: nowrap;
      }
      .dsst-badge.ok{ border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .dsst-badge.bad{ border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .dsst-kv{ display:grid; grid-template-columns: 1fr auto; gap: 6px 10px; font-size: 12.5px; }
      .dsst-kv div:nth-child(odd){ opacity:.78; }

      .dsst-progress{
        height: 9px; border-radius: 999px;
        background: rgba(222,226,230,0.7);
        overflow: hidden;
        border: 1px solid var(--border, #e9ecef);
        margin-top: 8px;
      }
      .dsst-bar{
        height: 100%;
        width: 0%;
        background: var(--accent, #5bc2e7);
        transition: width .12s linear;
      }

      .dsst-label{ font-size: 12px; opacity:.8; margin-bottom: 6px; }

      .dsst-keywrap{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        overflow:hidden;
        background: rgba(255,255,255,0.95);
      }
      .dsst-keybar{
        display:flex; gap:8px; align-items:center; justify-content:space-between;
        padding: 7px 10px;
        background: rgba(248,249,250,0.9);
        border-bottom: 1px solid var(--border, #e9ecef);
      }
      .dsst-keygrid{ display:grid; grid-template-columns: repeat(9, 1fr); }
      .dsst-cell{
        padding: 7px 4px;
        text-align:center;
        border-right: 1px solid var(--border, #e9ecef);
        border-bottom: 1px solid var(--border, #e9ecef);
        font-size: 12.5px;
      }
      .dsst-cell:nth-child(9n){ border-right: 0; }
      .dsst-cell.digit{ font-weight: 700; background: rgba(255,255,255,0.96); }
      .dsst-cell.sym{ font-size: 18px; background: rgba(255,255,255,0.96); }

      .dsst-itemRow{
        display:grid;
        grid-template-columns: 0.9fr 1.1fr;
        gap: 10px;
        margin-top: 10px;
        align-items: stretch;
      }
      @media (max-width: 900px){ .dsst-itemRow{ grid-template-columns: 1fr; } }

      .dsst-symbolBox{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        display:flex; align-items:center; justify-content:center;
        user-select:none;
        min-height: 96px;
      }
      .dsst-symbol{
        font-size: 50px;
        font-weight: 700;
        line-height: 1;
      }
      .dsst-hintline{ margin-top: 6px; font-size: 12px; opacity:.75; line-height:1.25; }

      .dsst-kbd{
        display:grid;
        grid-template-columns: repeat(9, 1fr);
        gap: 8px;
        margin-top: 10px;
      }
      .dsst-kbd button{
        padding: 12px 0;
        border-radius: 8px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.95);
        cursor: pointer;
        font-size: 15px;
        transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
      }
      .dsst-kbd button:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .dsst-kbd button:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }

      .dsst-rightTop{
        display:flex; align-items:flex-start; justify-content:space-between; gap:10px; flex-wrap:wrap;
        margin-bottom: 8px;
      }
      .dsst-controls{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
      .dsst-controls select, .dsst-controls input[type="number"]{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 7px 9px;
        background: rgba(255,255,255,0.95);
        font-size: 12.5px;
        outline: none;
      }
      .dsst-controls select:focus, .dsst-controls input[type="number"]:focus{
        box-shadow: 0 0 0 4px rgba(91,194,231,0.25);
        border-color: rgba(91,194,231,0.65);
      }

      .dsst-table{ width:100%; border-collapse: collapse; }
      .dsst-table th, .dsst-table td{ text-align:left; padding: 7px 6px; border-bottom: 1px solid var(--border, #e9ecef); font-size: 12.5px; }
      .dsst-table th{ background: rgba(248,249,250,0.9); font-weight: 650; }
      .dsst-right{ text-align:right; }

      .dsst-historyBox{
        border:1px solid var(--border, #e9ecef);
        border-radius: 8px;
        overflow:hidden;
        max-height: 210px;
      }

      .dsst-footnote{ margin-top: 8px; font-size: 11.5px; opacity: .72; line-height: 1.25; }

      @media (max-width: 480px){
        .dsst-kbd{ grid-template-columns: repeat(3, 1fr); }
        .dsst-kbd button{ padding: 14px 0; font-size: 16px; }
      }

      /* avoid trapping scroll */
      .dsst-wrap, .dsst-card { overflow: visible; }
    </style>

    <div class="dsst-wrap">
      <div class="dsst-topbar">
        <div>
          <div class="dsst-brand">DSST</div>
          <div class="dsst-muted dsst-small">Digit Symbol Substitution Test (2–5 min)</div>
        </div>

        <div class="dsst-pill-row">
          <button id="btnStart" class="dsst-pill primary" type="button">Start</button>
          <button id="btnFinish" class="dsst-pill" type="button" title="Ends now and saves result">Finish</button>
          <button id="btnNewKey" class="dsst-pill" type="button" title="Generate a new emoji–digit key">New key</button>
          <button id="btnReset" class="dsst-pill danger" type="button" title="Clears your saved history">Reset history</button>
        </div>
      </div>

      <div class="dsst-grid">
        <!-- Main panel -->
        <section class="dsst-card" aria-live="polite">
          <div class="dsst-row spread">
            <div class="dsst-status">
              <span class="dsst-badge" id="badgePhase">Idle</span>
              <span class="dsst-badge" id="badgeTime">Time: –</span>
              <span class="dsst-badge" id="badgeScore">Score: –</span>
            </div>

            <div class="dsst-kv" style="min-width:210px;">
              <div>Duration</div><div><span id="durationLabel">120</span> s</div>
              <div>Practice</div><div><span id="practiceLabel">10</span> items</div>
              <div>Key</div><div>9 emojis</div>
            </div>
          </div>

          <div class="dsst-progress" aria-label="Time progress"><div class="dsst-bar" id="timeBar"></div></div>

          <div style="height:10px;"></div>

          <div class="dsst-label">Key</div>
          <div class="dsst-keywrap">
            <div class="dsst-keybar">
              <div style="font-weight:650; font-size:12.5px;">Match emoji → digit</div>
              <div class="dsst-muted dsst-small" id="subtitle">Fast and accurate.</div>
            </div>
            <div class="dsst-keygrid" id="keyGrid" aria-label="DSST key grid"></div>
          </div>

          <div class="dsst-itemRow">
            <div>
              <div class="dsst-label" id="itemLabel">Current item</div>
              <div class="dsst-symbolBox"><div class="dsst-symbol" id="currentSymbol">—</div></div>
              <div class="dsst-hintline" id="itemHint">Press Start. Practice comes first, then the timed test.</div>
            </div>

            <div>
              <div class="dsst-label">Respond (1–9)</div>
              <div class="dsst-kbd" aria-label="Digit response buttons">
                <button type="button" data-digit="1">1</button>
                <button type="button" data-digit="2">2</button>
                <button type="button" data-digit="3">3</button>
                <button type="button" data-digit="4">4</button>
                <button type="button" data-digit="5">5</button>
                <button type="button" data-digit="6">6</button>
                <button type="button" data-digit="7">7</button>
                <button type="button" data-digit="8">8</button>
                <button type="button" data-digit="9">9</button>
              </div>
              <div class="dsst-hintline">Keyboard works too (1–9).</div>
            </div>
          </div>
        </section>

        <!-- Right panel -->
        <aside class="dsst-card">
          <div class="dsst-rightTop">
            <div>
              <div style="font-weight:650;">Session</div>
              <div class="dsst-muted dsst-small">Saved in your browser (localStorage) + saved to battery result.</div>
            </div>

            <div class="dsst-controls">
              <select id="durationSelect" aria-label="Duration">
                <option value="120">2 min</option>
                <option value="180">3 min</option>
                <option value="240">4 min</option>
                <option value="300">5 min</option>
              </select>
              <input id="practiceCount" type="number" min="0" max="30" step="1" value="10" title="Practice items" aria-label="Practice items" style="width:78px;" />
            </div>
          </div>

          <div class="dsst-kv">
            <div>Correct</div><div id="statCorrect">0</div>
            <div>Errors</div><div id="statErrors">0</div>
            <div>Items/min</div><div id="statIPM">0.0</div>
            <div>Median RT</div><div id="statRT">–</div>
          </div>

          <div style="height:10px;"></div>

          <div class="dsst-kv">
            <div>Latest score</div><div id="latestScore">–</div>
            <div>Latest IPM</div><div id="latestIPM">–</div>
            <div>Last session</div><div id="latestDate">–</div>
          </div>

          <div style="height:10px;"></div>

          <div style="font-weight:650; font-size:12.5px; margin-bottom:6px;">History</div>
          <div class="dsst-historyBox">
            <table class="dsst-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th class="dsst-right">Score</th>
                  <th class="dsst-right">IPM</th>
                </tr>
              </thead>
              <tbody id="historyBody">
                <tr><td colspan="3" class="dsst-muted">No sessions yet.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="dsst-footnote">
            Primary outcome: <strong>correct responses</strong> within time.<br/>
            Keep the same device and similar conditions for comparisons.
          </div>
        </aside>
      </div>
    </div>
  `;

  /********************************************************************
   * Logic (adapted from your original script; module-safe + battery save)
   ********************************************************************/
  const CONFIG = {
    storageKey: "dsst.sessions.v3.emoji",
    keySize: 9,
    emojiPool: [
      "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🍍","🥝","🥭","🍏",
      "🥕","🌽","🥦","🥒","🫑","🍆","🥬","🧄","🧅","🥔","🍠","🫘"
    ]
  };

  const el = {
    btnStart: container.querySelector("#btnStart"),
    btnFinish: container.querySelector("#btnFinish"),
    btnNewKey: container.querySelector("#btnNewKey"),
    btnReset: container.querySelector("#btnReset"),

    subtitle: container.querySelector("#subtitle"),
    badgePhase: container.querySelector("#badgePhase"),
    badgeTime: container.querySelector("#badgeTime"),
    badgeScore: container.querySelector("#badgeScore"),

    durationLabel: container.querySelector("#durationLabel"),
    practiceLabel: container.querySelector("#practiceLabel"),
    durationSelect: container.querySelector("#durationSelect"),
    practiceCount: container.querySelector("#practiceCount"),

    timeBar: container.querySelector("#timeBar"),

    keyGrid: container.querySelector("#keyGrid"),
    currentSymbol: container.querySelector("#currentSymbol"),
    itemHint: container.querySelector("#itemHint"),
    itemLabel: container.querySelector("#itemLabel"),

    statCorrect: container.querySelector("#statCorrect"),
    statErrors: container.querySelector("#statErrors"),
    statIPM: container.querySelector("#statIPM"),
    statRT: container.querySelector("#statRT"),

    latestScore: container.querySelector("#latestScore"),
    latestIPM: container.querySelector("#latestIPM"),
    latestDate: container.querySelector("#latestDate"),
    historyBody: container.querySelector("#historyBody"),

    digitButtons: Array.from(container.querySelectorAll("[data-digit]"))
  };

  const state = {
    phase: "idle", // idle | practice | test | done
    key: null,
    running: false,

    durationSec: 120,
    practiceN: 10,

    tStart: null,
    tEnd: null,
    tickTimer: null,

    currentDigit: null,
    currentEmoji: null,
    itemShownAt: null,

    practiceDone: 0,
    correct: 0,
    errors: 0,
    rts: [],
    trials: []
  };

  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch { return iso; }
  }

  function median(arr) {
    if (!arr.length) return null;
    const a = arr.slice().sort((x,y) => x-y);
    const mid = Math.floor(a.length / 2);
    return (a.length % 2) ? a[mid] : (a[mid-1] + a[mid]) / 2;
  }

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setBadge(node, text, kind=null) {
    node.textContent = text;
    node.classList.remove("ok","bad");
    if (kind) node.classList.add(kind);
  }

  function lockResponses(locked) {
    el.digitButtons.forEach(b => { b.disabled = locked; });
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
    const s = sessions[0] || null;
    el.latestScore.textContent = s ? String(s.correct) : "–";
    el.latestIPM.textContent = s ? String(s.itemsPerMin.toFixed(1)) : "–";
    el.latestDate.textContent = s ? fmtDate(s.completedAt) : "–";
  }

  function renderHistory() {
    const sessions = loadSessions();
    const body = el.historyBody;
    body.innerHTML = "";

    if (!sessions.length) {
      body.innerHTML = '<tr><td colspan="3" class="dsst-muted">No sessions yet.</td></tr>';
      return;
    }

    for (const s of sessions.slice(0, 6)) {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = fmtDate(s.completedAt);

      const tdScore = document.createElement("td");
      tdScore.className = "dsst-right";
      tdScore.textContent = String(s.correct);

      const tdIpm = document.createElement("td");
      tdIpm.className = "dsst-right";
      tdIpm.textContent = s.itemsPerMin.toFixed(1);

      tr.appendChild(tdDate);
      tr.appendChild(tdScore);
      tr.appendChild(tdIpm);
      body.appendChild(tr);
    }
  }

  function updateStatsUI() {
    el.statCorrect.textContent = String(state.correct);
    el.statErrors.textContent = String(state.errors);

    const attempted = state.correct + state.errors;
    const ipm = attempted ? (attempted / state.durationSec) * 60 : 0;
    el.statIPM.textContent = ipm.toFixed(1);

    const med = median(state.rts);
    el.statRT.textContent = med != null ? `${Math.round(med)} ms` : "–";

    setBadge(el.badgeScore, `Score: ${state.correct}`);
  }

  function setProgressBar() {
    if (!state.running || !state.tStart || !state.tEnd) {
      el.timeBar.style.width = "0%";
      return;
    }
    const frac = Math.max(0, Math.min(1, (now() - state.tStart) / (state.tEnd - state.tStart)));
    el.timeBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function updateTimeBadge() {
    if (!state.running || !state.tEnd) { setBadge(el.badgeTime, "Time: –"); return; }
    const remainMs = Math.max(0, state.tEnd - now());
    const remainSec = Math.ceil(remainMs / 1000);
    const m = Math.floor(remainSec / 60);
    const s = remainSec % 60;
    setBadge(el.badgeTime, `Time: ${m}:${String(s).padStart(2,"0")}`);
  }

  function setSettingsFromUI() {
    const dur = parseInt(el.durationSelect.value, 10);
    const pr = parseInt(el.practiceCount.value, 10);

    state.durationSec = [120,180,240,300].includes(dur) ? dur : 120;
    state.practiceN = Math.max(0, Math.min(30, isFinite(pr) ? pr : 10));

    el.durationLabel.textContent = String(state.durationSec);
    el.practiceLabel.textContent = String(state.practiceN);
  }

  function pickKey() {
    const em = shuffle(CONFIG.emojiPool).slice(0, CONFIG.keySize);
    const digitToEmoji = {};
    const emojiToDigit = {};
    for (let d = 1; d <= 9; d++) {
      digitToEmoji[d] = em[d - 1];
      emojiToDigit[em[d - 1]] = d;
    }
    state.key = { digitToEmoji, emojiToDigit };
    renderKey();
  }

  function renderKey() {
    const g = el.keyGrid;
    g.innerHTML = "";

    for (let d = 1; d <= 9; d++) {
      const c = document.createElement("div");
      c.className = "dsst-cell digit";
      c.textContent = String(d);
      g.appendChild(c);
    }
    for (let d = 1; d <= 9; d++) {
      const c = document.createElement("div");
      c.className = "dsst-cell sym";
      c.textContent = state.key ? state.key.digitToEmoji[d] : "–";
      g.appendChild(c);
    }
  }

  function resetSessionState() {
    state.practiceDone = 0;
    state.correct = 0;
    state.errors = 0;
    state.rts = [];
    state.trials = [];

    state.currentDigit = null;
    state.currentEmoji = null;
    state.itemShownAt = null;

    state.tStart = null;
    state.tEnd = null;

    updateStatsUI();
    setProgressBar();
    updateTimeBadge();

    el.currentSymbol.textContent = "—";
    el.itemLabel.textContent = "Current item";
    el.itemHint.textContent = "Press Start. Practice comes first, then the timed test.";
  }

  function nextItem() {
    const d = 1 + Math.floor(Math.random() * 9);
    const emoji = state.key.digitToEmoji[d];

    state.currentDigit = d;
    state.currentEmoji = emoji;
    state.itemShownAt = now();

    el.currentSymbol.textContent = emoji;

    if (state.phase === "practice") {
      el.itemLabel.textContent = `Practice ${state.practiceDone + 1}/${state.practiceN}`;
      el.itemHint.textContent = "Practice is not counted. Learn the key.";
    } else {
      el.itemLabel.textContent = "Test";
      el.itemHint.textContent = "Fast and accurate.";
    }
  }

  function beginTimedTest() {
    state.phase = "test";
    setBadge(el.badgePhase, "Test", "ok");
    el.subtitle.textContent = "Timed test. Respond quickly.";

    state.tStart = now();
    state.tEnd = state.tStart + state.durationSec * 1000;

    lockResponses(false);
    nextItem();

    clearInterval(state.tickTimer);
    state.tickTimer = setInterval(() => {
      setProgressBar();
      updateTimeBadge();
      if (now() >= state.tEnd) finishAndSave();
    }, 120);

    setProgressBar();
    updateTimeBadge();
  }

  function start() {
    setSettingsFromUI();
    if (!state.key) pickKey();

    clearInterval(state.tickTimer);
    resetSessionState();

    state.running = true;
    el.btnStart.textContent = "Restart";

    if (state.practiceN > 0) {
      state.phase = "practice";
      setBadge(el.badgePhase, "Practice");
      el.subtitle.textContent = "Practice first, then timed test.";
      lockResponses(false);
      nextItem();
    } else {
      beginTimedTest();
    }
  }

  function finishAndSave() {
    if (!state.running) return;

    state.running = false;
    clearInterval(state.tickTimer);
    state.tickTimer = null;
    lockResponses(true);

    setBadge(el.badgePhase, "Done");
    updateTimeBadge();
    setProgressBar();

    const med = median(state.rts);
    const attempted = state.correct + state.errors;
    const itemsPerMin = attempted ? (attempted / state.durationSec) * 60 : 0;

    el.subtitle.textContent = "Session saved.";
    el.itemLabel.textContent = "Result";
    el.currentSymbol.textContent = String(state.correct);

    const session = {
      test: "DSST",
      durationSec: state.durationSec,
      practiceN: state.practiceN,
      correct: state.correct,
      errors: state.errors,
      itemsAttempted: attempted,
      itemsPerMin,
      medianRtMs: med != null ? Math.round(med) : null,
      completedAt: nowISO(),
      trials: state.trials,
      key: state.key
    };
    addSession(session);

    el.btnStart.textContent = "Start";

    // ===== Save battery result (clean object) =====
    api.saveResult("dsst", {
      correct_n: state.correct,
      errors_n: state.errors,
      itemsPerMin: Number(itemsPerMin.toFixed(1)),
      medianRT_ms: med != null ? Math.round(med) : null
    }, {
      duration_s: state.durationSec,
      practice_n: state.practiceN,
      version: "1.0",
      raw: session
    });

    // Optional auto-advance
    // api.next();
  }

  function handleAnswer(answerDigit, source="button") {
    if (!state.running) return;
    if (!state.currentDigit) return;

    const rt = state.itemShownAt ? (now() - state.itemShownAt) : null;
    const isCorrect = (answerDigit === state.currentDigit);

    state.trials.push({
      ts: nowISO(),
      phase: state.phase,
      emoji: state.currentEmoji,
      correctDigit: state.currentDigit,
      answerDigit,
      correct: isCorrect,
      rtMs: rt,
      source
    });

    if (state.phase === "practice") {
      setBadge(el.badgePhase, isCorrect ? "Practice ✓" : "Practice ✕", isCorrect ? "ok" : "bad");
      state.practiceDone += 1;

      if (state.practiceDone >= state.practiceN) {
        lockResponses(true);
        el.itemHint.textContent = "Practice complete. Starting timed test.";
        setTimeout(() => beginTimedTest(), 450);
        return;
      }
      nextItem();
      return;
    }

    if (isCorrect) state.correct += 1;
    else state.errors += 1;

    if (rt !== null) state.rts.push(rt);
    updateStatsUI();
    nextItem();
  }

  // ===== Events (scoped) =====
  const onKeyDown = (e) => {
    if (!state.running) return;
    if (e.key >= "1" && e.key <= "9") handleAnswer(parseInt(e.key, 10), "key");
  };

  el.btnStart.addEventListener("click", start);

  el.btnFinish.addEventListener("click", () => {
    if (state.running) finishAndSave();
    else api.saveResult("dsst", { note: "Finished without run" }, { version: "1.0" });
  });

  el.btnNewKey.addEventListener("click", () => {
    if (state.running) return;
    pickKey();
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CONFIG.storageKey);
    renderHistory();
    renderLatest();
  });

  el.digitButtons.forEach(btn => {
    btn.addEventListener("click", () => handleAnswer(parseInt(btn.getAttribute("data-digit"), 10), "button"));
  });

  el.durationSelect.addEventListener("change", () => { if (!state.running) setSettingsFromUI(); });
  el.practiceCount.addEventListener("change", () => { if (!state.running) setSettingsFromUI(); });

  window.addEventListener("keydown", onKeyDown);

  // Init
  (function initUI() {
    setSettingsFromUI();
    pickKey();
    renderHistory();
    renderLatest();

    setBadge(el.badgePhase, "Idle");
    setBadge(el.badgeTime, "Time: –");
    setBadge(el.badgeScore, "Score: –");
    lockResponses(true);
    updateStatsUI();
  })();

  // Cleanup if parent swaps modules
  return () => {
    clearInterval(state.tickTimer);
    window.removeEventListener("keydown", onKeyDown);
  };
}
