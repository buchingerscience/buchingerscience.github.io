// /cognition/cog2_gng.js
// Module version of your Go/No-Go page. Renders into the container as a block.
// Exports: init(container, api)
// - api.saveResult(testId, metrics, extra) is provided by cognition.html
// - api.next() can move to the next test (optional)

export function init(container, api) {
  /********************************************************************
   * UI (block version)
   ********************************************************************/
  container.innerHTML = `
    <style>
      /* Scoped under .gng-wrap */
      .gng-wrap { --maxw: 1100px; max-width: var(--maxw); margin: 0 auto; padding: 0; box-sizing: border-box; }

      .gng-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 10px;
      }
      .gng-brand{ font-weight:650; letter-spacing:.2px; }
      .gng-muted{ opacity:.78; }
      .gng-small{ font-size:12px; }

      .gng-pill-row{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }
      .gng-pill{
        display:inline-flex; align-items:center; gap:8px;
        padding: 7px 11px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.9);
        font-size: 13px; color: inherit; cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        white-space: nowrap;
      }
      .gng-pill:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .gng-pill.primary{ background: var(--accent, #5bc2e7); color:#fff; border-color: rgba(0,0,0,0.05); }
      .gng-pill.primary:hover{ background:#67c9ea; }
      .gng-pill.danger{ background:#fff; border-color: rgba(220,53,69,0.25); }
      .gng-pill.danger:hover{ background: rgba(220,53,69,0.06); }

      .gng-grid{
        display:grid;
        grid-template-columns: 1.65fr 1fr;
        gap: 10px;
        min-height: 520px;
      }
      @media (max-width: 900px){
        .gng-grid{ grid-template-columns: 1fr; min-height:0; }
      }

      .gng-card{
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 12px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .gng-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .gng-row.spread{ justify-content: space-between; }

      .gng-status{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; }
      .gng-badge{
        padding: 4px 8px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
        white-space: nowrap;
      }
      .gng-badge.ok{ border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .gng-badge.bad{ border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .gng-kv{ display:grid; grid-template-columns: 1fr auto; gap: 6px 10px; font-size: 12.5px; }
      .gng-kv div:nth-child(odd){ opacity:.78; }

      .gng-progress{
        height: 9px; border-radius: 999px;
        background: rgba(222,226,230,0.7);
        overflow: hidden;
        border: 1px solid var(--border, #e9ecef);
        margin-top: 8px;
      }
      .gng-bar{
        height: 100%;
        width: 0%;
        background: var(--accent, #5bc2e7);
        transition: width .12s linear;
      }

      .gng-stage{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        height: 360px;
        display:flex;
        align-items:center;
        justify-content:center;
        user-select:none;
        position: relative;
        overflow:hidden;
      }
      @media (max-width: 900px){
        .gng-stage{ height: 340px; }
      }

      .gng-stimulus{
        font-size: 84px;
        line-height: 1;
        font-weight: 700;
        transform: translateY(-4px);
      }
      .gng-stimText{
        font-size: 22px;
        font-weight: 650;
        letter-spacing: .2px;
      }
      .gng-subhint{
        position:absolute;
        bottom: 10px;
        left: 12px;
        right: 12px;
        text-align:center;
        font-size: 12px;
        opacity:.75;
        line-height: 1.25;
      }

      .gng-bigBtnRow{
        display:grid;
        grid-template-columns: 1fr;
        gap: 10px;
        margin-top: 10px;
      }
      .gng-goBtn{
        padding: 16px 14px;
        border-radius: 8px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.95);
        cursor:pointer;
        font-size: 14px;
        transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
      }
      .gng-goBtn:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .gng-goBtn:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }

      .gng-table{ width:100%; border-collapse: collapse; }
      .gng-table th, .gng-table td{ text-align:left; padding: 7px 6px; border-bottom: 1px solid var(--border, #e9ecef); font-size: 12.5px; }
      .gng-table th{ background: rgba(248,249,250,0.9); font-weight: 650; }
      .gng-right{ text-align:right; }

      .gng-historyBox{
        border:1px solid var(--border, #e9ecef);
        border-radius: 8px;
        overflow:hidden;
        max-height: 210px;
      }

      .gng-footnote{ margin-top: 8px; font-size: 11.5px; opacity: .72; line-height: 1.25; }

      .gng-ring{
        position:absolute;
        inset: 18px;
        border-radius: 8px;
        border: 1px dashed rgba(222,226,230,0.95);
        pointer-events:none;
        opacity:.6;
      }

      /* avoid trapping scroll */
      .gng-wrap, .gng-card { overflow: visible; }
    </style>

    <div class="gng-wrap">
      <div class="gng-topbar">
        <div>
          <div class="gng-brand">Inhibitory Control</div>
          <div class="gng-muted gng-small">Go/No-Go task. Tap only on “GO” (🍏). Do nothing for “NO-GO” (🍩).</div>
        </div>

        <div class="gng-pill-row">
          <button id="btnStart" class="gng-pill primary" type="button">Start</button>
          <button id="btnFinish" class="gng-pill" type="button" title="Ends now and saves result">Finish</button>
          <button id="btnReset" class="gng-pill danger" type="button" title="Clears your saved history">Reset history</button>
        </div>
      </div>

      <div class="gng-grid">
        <!-- Main -->
        <section class="gng-card" aria-live="polite">
          <div class="gng-row spread">
            <div class="gng-status">
              <span class="gng-badge" id="badgePhase">Idle</span>
              <span class="gng-badge" id="badgeTime">Time: –</span>
              <span class="gng-badge" id="badgeScore">Acc: –</span>
            </div>

            <div class="gng-kv" style="min-width:250px;">
              <div>Duration</div><div><span id="durationLabel">120</span> s</div>
              <div>Stimulus</div><div><span id="stimLabel">600</span> ms</div>
              <div>No-Go rate</div><div><span id="nogLabel">25</span>%</div>
            </div>
          </div>

          <div class="gng-progress"><div class="gng-bar" id="timeBar"></div></div>

          <div style="height:10px;"></div>

          <div class="gng-stage" id="stage" aria-label="Stimulus area">
            <div class="gng-ring"></div>
            <div id="stimWrap" style="text-align:center;">
              <div class="gng-stimulus" id="stimulus">—</div>
              <div class="gng-stimText gng-muted" id="stimText">Press Start</div>
            </div>
            <div class="gng-subhint" id="subhint">
              Respond by clicking the button or pressing the spacebar. Try to be fast, but do not tap on 🍩.
            </div>
          </div>

          <div class="gng-bigBtnRow">
            <button class="gng-goBtn" id="btnGo" type="button">Tap (GO)</button>
          </div>

          <div class="gng-footnote" id="hint">
            Outcomes: commission errors (taps on NO-GO), omission errors (missed GO), and reaction time on GO trials.
          </div>
        </section>

        <!-- Side -->
        <aside class="gng-card">
          <div class="gng-row spread" style="margin-bottom:8px;">
            <div>
              <div style="font-weight:650;">Session</div>
              <div class="gng-muted gng-small">Saved in your browser (localStorage) + saved to battery result.</div>
            </div>

            <div class="gng-row" style="gap:8px;">
              <select id="durationSelect" aria-label="Duration">
                <option value="60">1 min</option>
                <option value="120" selected>2 min</option>
                <option value="180">3 min</option>
                <option value="240">4 min</option>
                <option value="300">5 min</option>
              </select>

              <select id="stimSelect" aria-label="Stimulus time">
                <option value="400">400 ms</option>
                <option value="600" selected>600 ms</option>
                <option value="800">800 ms</option>
              </select>

              <select id="nogSelect" aria-label="No-Go probability">
                <option value="0.15">15%</option>
                <option value="0.25" selected>25%</option>
                <option value="0.33">33%</option>
                <option value="0.40">40%</option>
              </select>
            </div>
          </div>

          <div class="gng-kv">
            <div>Go correct</div><div id="statGoCorrect">0</div>
            <div>No-Go correct</div><div id="statNoGoCorrect">0</div>
            <div>Commission errors</div><div id="statCommission">0</div>
            <div>Omission errors</div><div id="statOmission">0</div>
            <div>Overall accuracy</div><div id="statAcc">0%</div>
            <div>Median Go RT</div><div id="statRT">–</div>
          </div>

          <div style="height:10px;"></div>

          <div class="gng-kv">
            <div>Latest accuracy</div><div id="latestAcc">–</div>
            <div>Latest commission</div><div id="latestCom">–</div>
            <div>Last session</div><div id="latestDate">–</div>
          </div>

          <div style="height:10px;"></div>

          <div style="font-weight:650; font-size:12.5px; margin-bottom:6px;">History</div>
          <div class="gng-historyBox">
            <table class="gng-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th class="gng-right">Acc</th>
                  <th class="gng-right">Com</th>
                </tr>
              </thead>
              <tbody id="historyBody">
                <tr><td colspan="3" class="gng-muted">No sessions yet.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="gng-footnote">
            GO = 🍏 (tap). NO-GO = 🍩 (do nothing). Keyboard: <strong>Space</strong> to tap.
          </div>
        </aside>
      </div>
    </div>
  `;

  /********************************************************************
   * Logic (adapted from your original script)
   ********************************************************************/
  const CONFIG = {
    storageKey: "inhibitoryControl.gonogo.v1",
    itiMinMs: 500,
    itiMaxMs: 900,
    responseWindowExtraMs: 250
  };

  const el = {
    btnStart: container.querySelector("#btnStart"),
    btnFinish: container.querySelector("#btnFinish"),
    btnReset: container.querySelector("#btnReset"),

    badgePhase: container.querySelector("#badgePhase"),
    badgeTime: container.querySelector("#badgeTime"),
    badgeScore: container.querySelector("#badgeScore"),
    timeBar: container.querySelector("#timeBar"),

    durationLabel: container.querySelector("#durationLabel"),
    stimLabel: container.querySelector("#stimLabel"),
    nogLabel: container.querySelector("#nogLabel"),

    durationSelect: container.querySelector("#durationSelect"),
    stimSelect: container.querySelector("#stimSelect"),
    nogSelect: container.querySelector("#nogSelect"),

    stimulus: container.querySelector("#stimulus"),
    stimText: container.querySelector("#stimText"),
    subhint: container.querySelector("#subhint"),
    stage: container.querySelector("#stage"),
    btnGo: container.querySelector("#btnGo"),

    statGoCorrect: container.querySelector("#statGoCorrect"),
    statNoGoCorrect: container.querySelector("#statNoGoCorrect"),
    statCommission: container.querySelector("#statCommission"),
    statOmission: container.querySelector("#statOmission"),
    statAcc: container.querySelector("#statAcc"),
    statRT: container.querySelector("#statRT"),

    latestAcc: container.querySelector("#latestAcc"),
    latestCom: container.querySelector("#latestCom"),
    latestDate: container.querySelector("#latestDate"),
    historyBody: container.querySelector("#historyBody")
  };

  const state = {
    running: false,
    phase: "idle",
    durationSec: 120,
    stimMs: 600,
    pNoGo: 0.25,

    tStart: null,
    tEnd: null,
    tickTimer: null,
    timers: [],

    trialIndex: 0,
    trialType: null,   // "GO" | "NOGO"
    stimOnAt: null,
    responseDeadline: null,
    responded: false,
    responseAt: null,

    goCorrect: 0,
    nogoCorrect: 0,
    commission: 0,
    omission: 0,
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

  function setBadge(node, text, kind=null) {
    node.textContent = text;
    node.classList.remove("ok","bad");
    if (kind) node.classList.add(kind);
  }

  function clearTimers() {
    state.timers.forEach(t => clearTimeout(t));
    state.timers = [];
  }

  function randInt(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
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
    el.latestAcc.textContent = s ? `${Math.round(s.accuracy*100)}%` : "–";
    el.latestCom.textContent = s ? String(s.commission) : "–";
    el.latestDate.textContent = s ? fmtDate(s.completedAt) : "–";
  }

  function renderHistory() {
    const sessions = loadSessions();
    const body = el.historyBody;
    body.innerHTML = "";
    if (!sessions.length) {
      body.innerHTML = '<tr><td colspan="3" class="gng-muted">No sessions yet.</td></tr>';
      return;
    }
    for (const s of sessions.slice(0, 6)) {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = fmtDate(s.completedAt);

      const tdAcc = document.createElement("td");
      tdAcc.className = "gng-right";
      tdAcc.textContent = `${Math.round(s.accuracy*100)}%`;

      const tdCom = document.createElement("td");
      tdCom.className = "gng-right";
      tdCom.textContent = String(s.commission);

      tr.appendChild(tdDate);
      tr.appendChild(tdAcc);
      tr.appendChild(tdCom);
      body.appendChild(tr);
    }
  }

  function updateTimeBadge() {
    if (!state.running || !state.tEnd) { setBadge(el.badgeTime, "Time: –"); return; }
    const remainMs = Math.max(0, state.tEnd - now());
    const remainSec = Math.ceil(remainMs / 1000);
    const m = Math.floor(remainSec / 60);
    const s = remainSec % 60;
    setBadge(el.badgeTime, `Time: ${m}:${String(s).padStart(2,"0")}`);
  }

  function setProgressBar() {
    if (!state.running || !state.tStart || !state.tEnd) { el.timeBar.style.width = "0%"; return; }
    const frac = Math.max(0, Math.min(1, (now() - state.tStart) / (state.tEnd - state.tStart)));
    el.timeBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function updateStatsUI() {
    el.statGoCorrect.textContent = String(state.goCorrect);
    el.statNoGoCorrect.textContent = String(state.nogoCorrect);
    el.statCommission.textContent = String(state.commission);
    el.statOmission.textContent = String(state.omission);

    const total = state.goCorrect + state.nogoCorrect + state.commission + state.omission;
    const correct = state.goCorrect + state.nogoCorrect;
    const acc = total ? (correct / total) : 0;

    el.statAcc.textContent = `${Math.round(acc * 100)}%`;
    setBadge(el.badgeScore, `Acc: ${Math.round(acc * 100)}%`);

    const med = median(state.rts);
    el.statRT.textContent = med != null ? `${Math.round(med)} ms` : "–";
  }

  function lockResponse(locked) {
    el.btnGo.disabled = locked;
  }

  function showBlank(message="") {
    el.stimulus.textContent = "—";
    el.stimText.textContent = message || " ";
  }

  function start() {
    state.durationSec = parseInt(el.durationSelect.value, 10) || 120;
    state.stimMs = parseInt(el.stimSelect.value, 10) || 600;
    state.pNoGo = parseFloat(el.nogSelect.value) || 0.25;

    el.durationLabel.textContent = String(state.durationSec);
    el.stimLabel.textContent = String(state.stimMs);
    el.nogLabel.textContent = String(Math.round(state.pNoGo * 100));

    clearTimers();
    state.running = true;
    state.phase = "running";
    state.trialIndex = 0;

    state.goCorrect = 0;
    state.nogoCorrect = 0;
    state.commission = 0;
    state.omission = 0;
    state.rts = [];
    state.trials = [];

    setBadge(el.badgePhase, "Running", "ok");
    el.btnStart.textContent = "Restart";
    el.subhint.textContent = "Tap only for 🍏 (GO). Do nothing for 🍩 (NO-GO). Spacebar also works.";

    updateStatsUI();

    state.tStart = now();
    state.tEnd = state.tStart + state.durationSec * 1000;

    lockResponse(true);
    showBlank("Get ready…");

    clearInterval(state.tickTimer);
    state.tickTimer = setInterval(() => {
      setProgressBar();
      updateTimeBadge();
      if (now() >= state.tEnd) finishAndSave();
    }, 120);

    setProgressBar();
    updateTimeBadge();

    state.timers.push(setTimeout(() => nextTrial(), 700));
  }

  function nextTrial() {
    if (!state.running) return;
    if (now() >= state.tEnd) { finishAndSave(); return; }

    state.trialIndex += 1;

    lockResponse(true);
    showBlank("");

    const iti = randInt(CONFIG.itiMinMs, CONFIG.itiMaxMs);

    state.timers.push(setTimeout(() => {
      const isNoGo = (Math.random() < state.pNoGo);
      state.trialType = isNoGo ? "NOGO" : "GO";
      state.responded = false;
      state.responseAt = null;

      el.stimulus.textContent = isNoGo ? "🍩" : "🍏";
      el.stimText.textContent = isNoGo ? "NO-GO (do not tap)" : "GO (tap)";

      state.stimOnAt = now();
      state.responseDeadline = state.stimOnAt + state.stimMs + CONFIG.responseWindowExtraMs;

      lockResponse(false);

      state.timers.push(setTimeout(() => {
        showBlank("");
      }, state.stimMs));

      state.timers.push(setTimeout(() => {
        lockResponse(true);
        scoreTrial();
        nextTrial();
      }, state.stimMs + CONFIG.responseWindowExtraMs));
    }, iti));
  }

  function registerResponse(source="button") {
    if (!state.running) return;
    if (state.responseDeadline === null) return;

    const t = now();
    if (t > state.responseDeadline) return;
    if (state.responded) return;

    state.responded = true;
    state.responseAt = t;

    if (state.trialType === "GO") setBadge(el.badgePhase, "Tap ✓", "ok");
    else setBadge(el.badgePhase, "Tap ✕", "bad");
  }

  function scoreTrial() {
    setBadge(el.badgePhase, "Running", "ok");

    const responded = state.responded;
    const isNoGo = (state.trialType === "NOGO");
    const rt = responded && state.stimOnAt ? (state.responseAt - state.stimOnAt) : null;

    let outcome = "";
    let correct = null;

    if (!isNoGo) {
      if (responded) {
        state.goCorrect += 1;
        if (rt !== null) state.rts.push(rt);
        outcome = "GO_correct";
        correct = true;
      } else {
        state.omission += 1;
        outcome = "GO_omission";
        correct = false;
      }
    } else {
      if (responded) {
        state.commission += 1;
        outcome = "NOGO_commission";
        correct = false;
      } else {
        state.nogoCorrect += 1;
        outcome = "NOGO_correct";
        correct = true;
      }
    }

    state.trials.push({
      ts: nowISO(),
      trialIndex: state.trialIndex,
      trialType: state.trialType,
      responded,
      rtMs: rt,
      outcome,
      correct
    });

    updateStatsUI();
  }

  function finishAndSave() {
    if (!state.running) return;

    state.running = false;
    clearTimers();
    clearInterval(state.tickTimer);
    state.tickTimer = null;

    lockResponse(true);
    showBlank("Session finished");

    setBadge(el.badgePhase, "Done");

    const total = state.goCorrect + state.nogoCorrect + state.commission + state.omission;
    const correctN = state.goCorrect + state.nogoCorrect;
    const acc = total ? (correctN / total) : 0;
    const med = median(state.rts);

    const session = {
      test: "GoNoGo",
      durationSec: state.durationSec,
      stimMs: state.stimMs,
      pNoGo: state.pNoGo,
      goCorrect: state.goCorrect,
      nogoCorrect: state.nogoCorrect,
      commission: state.commission,
      omission: state.omission,
      accuracy: acc,
      medianGoRtMs: med != null ? Math.round(med) : null,
      completedAt: nowISO(),
      trials: state.trials
    };
    addSession(session);

    el.btnStart.textContent = "Start";
    updateTimeBadge();
    setProgressBar();
    updateStatsUI();

    // ===== Save battery result (clean object) =====
    api.saveResult("gng", {
      accuracy_pct: Math.round(acc * 100),
      commissionErrors_n: state.commission,
      omissionErrors_n: state.omission,
      medianGoRT_ms: med != null ? Math.round(med) : null
    }, {
      duration_s: state.durationSec,
      stimulus_ms: state.stimMs,
      noGoRate_pct: Math.round(state.pNoGo * 100),
      nTrials: total,
      version: "1.0",
      raw: session
    });

    // Optional auto-advance
    // api.next();
  }

  // ===== Events (scoped) =====
  const onKeyDown = (e) => {
    if (!state.running) return;
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      registerResponse("space");
    }
  };

  el.btnStart.addEventListener("click", () => {
    if (state.running) finishAndSave();
    start();
  });

  el.btnFinish.addEventListener("click", () => {
    if (state.running) finishAndSave();
    else api.saveResult("gng", { note: "Finished without run" }, { version: "1.0" });
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CONFIG.storageKey);
    renderHistory();
    renderLatest();
  });

  el.btnGo.addEventListener("click", () => registerResponse("button"));

  window.addEventListener("keydown", onKeyDown);

  // Update labels when user changes settings (only when idle)
  const onSettingsChange = () => {
    if (state.running) return;
    const durationSec = parseInt(el.durationSelect.value, 10) || 120;
    const stimMs = parseInt(el.stimSelect.value, 10) || 600;
    const pNoGo = parseFloat(el.nogSelect.value) || 0.25;
    el.durationLabel.textContent = String(durationSec);
    el.stimLabel.textContent = String(stimMs);
    el.nogLabel.textContent = String(Math.round(pNoGo * 100));
  };
  el.durationSelect.addEventListener("change", onSettingsChange);
  el.stimSelect.addEventListener("change", onSettingsChange);
  el.nogSelect.addEventListener("change", onSettingsChange);

  // Init
  (function initUI() {
    setBadge(el.badgePhase, "Idle");
    setBadge(el.badgeTime, "Time: –");
    setBadge(el.badgeScore, "Acc: –");
    showBlank("Press Start");
    lockResponse(true);

    onSettingsChange();
    renderHistory();
    renderLatest();
    updateStatsUI();
  })();

  // Cleanup if parent swaps modules
  return () => {
    clearTimers();
    clearInterval(state.tickTimer);
    window.removeEventListener("keydown", onKeyDown);
  };
}
