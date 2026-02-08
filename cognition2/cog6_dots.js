// /cognition/cog6_dots.js
// Dot Comparison (numerosity) — module version
// Exports: init(container, api)
// api.saveResult(testId, metrics, extra)
// api.next() optional

export function init(container, api) {
  /********************************************************************
   * UI (block version)
   ********************************************************************/
  container.innerHTML = `
    <style>
      .dots-wrap { --maxw: 1100px; max-width: var(--maxw); margin: 0 auto; padding: 12px 0 18px; }

      .dots-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 10px;
      }
      .dots-brand{ font-weight:650; letter-spacing:.2px; }
      .dots-muted{ opacity:.78; }
      .dots-small{ font-size:12px; }

      .dots-pill-row{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }
      .dots-pill{
        display:inline-flex; align-items:center; gap:8px;
        padding: 7px 11px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.9);
        font-size: 13px; color: inherit; cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        white-space: nowrap;
      }
      .dots-pill:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .dots-pill.primary{ background: var(--accent, #5bc2e7); color:#fff; border-color: rgba(0,0,0,0.05); }
      .dots-pill.primary:hover{ background:#67c9ea; }
      .dots-pill.danger{ background:#fff; border-color: rgba(220,53,69,0.25); }
      .dots-pill.danger:hover{ background: rgba(220,53,69,0.06); }

      .dots-grid{
        display:grid;
        grid-template-columns: 1.7fr 1fr;
        gap: 10px;
        min-height: 520px;
      }
      @media (max-width: 900px){
        .dots-grid{ grid-template-columns: 1fr; min-height:0; }
      }

      .dots-card{
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 12px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .dots-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .dots-row.spread{ justify-content: space-between; }

      .dots-status{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; }
      .dots-badge{
        padding: 4px 8px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
        white-space: nowrap;
      }
      .dots-badge.ok{ border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .dots-badge.bad{ border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .dots-kv{ display:grid; grid-template-columns: 1fr auto; gap: 6px 10px; font-size: 12.5px; }
      .dots-kv div:nth-child(odd){ opacity:.78; }

      .dots-progress{
        height: 9px; border-radius: 999px;
        background: rgba(222,226,230,0.7);
        overflow: hidden;
        border: 1px solid var(--border, #e9ecef);
        margin-top: 8px;
      }
      .dots-bar{
        height: 100%;
        width: 0%;
        background: var(--accent, #5bc2e7);
        transition: width .12s linear;
      }

      .dots-arena{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        height: 360px;
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 10px;
        box-sizing: border-box;
        user-select: none;
        align-items: stretch;
      }
      @media (max-width: 900px){
        .dots-arena{ height: 340px; }
      }

      .dots-panel{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: rgba(255,255,255,0.9);
        position: relative;
        overflow: hidden;
      }

      .dots-overlay{
        position:absolute; inset:0;
        display:flex; align-items:center; justify-content:center;
        background: rgba(248,249,250,0.92);
        font-size: 13px; opacity:.95;
        padding: 14px; text-align:center;
        z-index: 5;
      }
      .dots-overlay.hidden{ display:none; }

      .dots-choices{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 10px;
      }
      .dots-choiceBtn{
        padding: 14px 10px;
        border-radius: 8px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.95);
        cursor:pointer;
        font-size: 14px;
        transition: transform .12s ease, box-shadow .12s ease, background-color .12s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
      }
      .dots-choiceBtn:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .dots-choiceBtn:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }

      .dots-controls{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
      .dots-controls select{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 7px 9px;
        background: rgba(255,255,255,0.95);
        font-size: 12.5px;
        outline: none;
      }
      .dots-controls select:focus{
        box-shadow: 0 0 0 4px rgba(91,194,231,0.25);
        border-color: rgba(91,194,231,0.65);
      }

      .dots-table{ width:100%; border-collapse: collapse; }
      .dots-table th, .dots-table td{ text-align:left; padding: 7px 6px; border-bottom: 1px solid var(--border, #e9ecef); font-size: 12.5px; }
      .dots-table th{ background: rgba(248,249,250,0.9); font-weight: 650; }
      .dots-right{ text-align:right; }

      .dots-historyBox{
        border:1px solid var(--border, #e9ecef);
        border-radius: 8px;
        overflow:hidden;
        max-height: 210px;
      }

      .dots-footnote{ margin-top: 8px; font-size: 11.5px; opacity: .72; line-height: 1.25; }
    </style>

    <div class="dots-wrap">
      <div class="dots-topbar">
        <div>
          <div class="dots-brand">Perceptual Accuracy</div>
          <div class="dots-muted dots-small">Dot comparison (numerosity). Dots disappear completely before response.</div>
        </div>

        <div class="dots-pill-row">
          <button id="btnStart" class="dots-pill primary" type="button">Start</button>
          <button id="btnFinish" class="dots-pill" type="button" title="Finish now and save">Finish</button>
          <button id="btnReset" class="dots-pill danger" type="button" title="Clears your saved history">Reset</button>
        </div>
      </div>

      <div class="dots-grid">
        <!-- Main -->
        <section class="dots-card" aria-live="polite">
          <div class="dots-row spread">
            <div class="dots-status">
              <span class="dots-badge" id="badgePhase">Idle</span>
              <span class="dots-badge" id="badgeTime">Time: –</span>
              <span class="dots-badge" id="badgeScore">Accuracy: –</span>
            </div>

            <div class="dots-kv" style="min-width:240px;">
              <div>Duration</div><div><span id="durationLabel">120</span> s</div>
              <div>Stimulus time</div><div><span id="stimLabel">800</span> ms</div>
              <div>Min ratio</div><div><span id="ratioLabel">1.20</span></div>
            </div>
          </div>

          <div class="dots-progress"><div class="dots-bar" id="timeBar"></div></div>

          <div style="height:10px;"></div>

          <div class="dots-arena">
            <div class="dots-panel">
              <canvas id="canLeft" width="520" height="380" style="width:100%; height:100%;"></canvas>
              <div class="dots-overlay" id="ovLeft">Press Start</div>
            </div>
            <div class="dots-panel">
              <canvas id="canRight" width="520" height="380" style="width:100%; height:100%;"></canvas>
              <div class="dots-overlay" id="ovRight">Press Start</div>
            </div>
          </div>

          <div class="dots-choices">
            <button class="dots-choiceBtn" id="btnLeft" type="button">Left has more</button>
            <button class="dots-choiceBtn" id="btnRight" type="button">Right has more</button>
          </div>

          <div class="dots-footnote">
            The dots appear briefly, then the screen is masked and the canvases are cleared.
            Answer without counting. Use ArrowLeft / ArrowRight if you prefer.
          </div>
        </section>

        <!-- Side -->
        <aside class="dots-card">
          <div class="dots-row spread" style="margin-bottom:8px;">
            <div>
              <div style="font-weight:650;">Session</div>
              <div class="dots-muted dots-small">Saved in localStorage + sent to the battery.</div>
            </div>

            <div class="dots-controls">
              <select id="durationSelect">
                <option value="60">1 min</option>
                <option value="120" selected>2 min</option>
                <option value="180">3 min</option>
                <option value="240">4 min</option>
                <option value="300">5 min</option>
              </select>

              <select id="stimSelect">
                <option value="500">500 ms</option>
                <option value="800" selected>800 ms</option>
                <option value="1000">1000 ms</option>
              </select>

              <select id="ratioSelect">
                <option value="1.15">1.15</option>
                <option value="1.20" selected>1.20</option>
                <option value="1.30">1.30</option>
                <option value="1.40">1.40</option>
              </select>
            </div>
          </div>

          <div class="dots-kv">
            <div>Correct</div><div id="statCorrect">0</div>
            <div>Errors</div><div id="statErrors">0</div>
            <div>Accuracy</div><div id="statAcc">0%</div>
            <div>Median RT</div><div id="statRT">–</div>
          </div>

          <div style="height:10px;"></div>

          <div class="dots-kv">
            <div>Latest accuracy</div><div id="latestAcc">–</div>
            <div>Latest trials</div><div id="latestTrials">–</div>
            <div>Last session</div><div id="latestDate">–</div>
          </div>

          <div style="height:10px;"></div>

          <div style="font-weight:650; font-size:12.5px; margin-bottom:6px;">History</div>
          <div class="dots-historyBox">
            <table class="dots-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th class="dots-right">Acc</th>
                  <th class="dots-right">Trials</th>
                </tr>
              </thead>
              <tbody id="historyBody">
                <tr><td colspan="3" class="dots-muted">No sessions yet.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="dots-footnote">
            Ratio closer to 1 is harder.
          </div>
        </aside>
      </div>
    </div>
  `;

  /********************************************************************
   * Logic
   ********************************************************************/
  const CONFIG = {
    storageKey: "perceptualAccuracy.dotCompare.v2",
    dotRadius: 4,
    minDots: 8,
    maxDots: 30
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
    ratioLabel: container.querySelector("#ratioLabel"),

    durationSelect: container.querySelector("#durationSelect"),
    stimSelect: container.querySelector("#stimSelect"),
    ratioSelect: container.querySelector("#ratioSelect"),

    canLeft: container.querySelector("#canLeft"),
    canRight: container.querySelector("#canRight"),
    ovLeft: container.querySelector("#ovLeft"),
    ovRight: container.querySelector("#ovRight"),

    btnLeft: container.querySelector("#btnLeft"),
    btnRight: container.querySelector("#btnRight"),

    statCorrect: container.querySelector("#statCorrect"),
    statErrors: container.querySelector("#statErrors"),
    statAcc: container.querySelector("#statAcc"),
    statRT: container.querySelector("#statRT"),

    latestAcc: container.querySelector("#latestAcc"),
    latestTrials: container.querySelector("#latestTrials"),
    latestDate: container.querySelector("#latestDate"),
    historyBody: container.querySelector("#historyBody")
  };

  // HiDPI-safe canvas scaling
  function setupCanvas(canvas) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const cssW = canvas.clientWidth || canvas.width;
    const cssH = canvas.clientHeight || canvas.height;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    return ctx;
  }

  const ctxL = setupCanvas(el.canLeft);
  const ctxR = setupCanvas(el.canRight);

  // Re-setup on resize (keeps dots crisp)
  let resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setupCanvas(el.canLeft);
      setupCanvas(el.canRight);
      // Use overlays anyway; keep canvases blank until next trial
      clearCanvas(ctxL);
      clearCanvas(ctxR);
    }, 120);
  }
  window.addEventListener("resize", onResize);

  const state = {
    running: false,
    phase: "idle",
    durationSec: 120,
    stimMs: 800,
    minRatio: 1.20,

    tStart: null,
    tEnd: null,
    tickTimer: null,

    responseOpenedAt: null,
    correctSide: null,
    leftCount: null,
    rightCount: null,

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

  function setBadge(node, text, kind=null) {
    node.textContent = text;
    node.classList.remove("ok","bad");
    if (kind) node.classList.add(kind);
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
    el.latestTrials.textContent = s ? String(s.trialsAttempted) : "–";
    el.latestDate.textContent = s ? fmtDate(s.completedAt) : "–";
  }

  function renderHistory() {
    const sessions = loadSessions();
    const body = el.historyBody;
    body.innerHTML = "";
    if (!sessions.length) {
      body.innerHTML = '<tr><td colspan="3" class="dots-muted">No sessions yet.</td></tr>';
      return;
    }
    for (const s of sessions.slice(0, 6)) {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = fmtDate(s.completedAt);

      const tdAcc = document.createElement("td");
      tdAcc.className = "dots-right";
      tdAcc.textContent = `${Math.round(s.accuracy*100)}%`;

      const tdTr = document.createElement("td");
      tdTr.className = "dots-right";
      tdTr.textContent = String(s.trialsAttempted);

      tr.appendChild(tdDate);
      tr.appendChild(tdAcc);
      tr.appendChild(tdTr);
      body.appendChild(tr);
    }
  }

  function clearCanvas(ctx) {
    // ctx is already scaled to CSS pixels by setTransform()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // After clearRect, because canvas is in device pixels, we clear full resolution:
    // But we drew with setTransform(dpr,...), so clearRect should be in device px if not reset.
    // To be robust, do a reset + clear in device px:
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.restore();
  }

  function drawDots(ctx, count) {
    // Draw in CSS pixels. Thanks to setTransform(dpr,..), we can use client sizes.
    clearCanvas(ctx);

    const canvas = ctx.canvas;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const margin = 18;
    const r = CONFIG.dotRadius;

    const dots = [];
    let attempts = 0;

    while (dots.length < count && attempts < 8000) {
      attempts++;
      const x = margin + Math.random() * (w - 2*margin);
      const y = margin + Math.random() * (h - 2*margin);

      let ok = true;
      for (const p of dots) {
        const dx = p.x - x;
        const dy = p.y - y;
        if ((dx*dx + dy*dy) < ((2*r + 2) * (2*r + 2))) { ok = false; break; }
      }
      if (ok) dots.push({x,y});
    }

    ctx.beginPath();
    for (const p of dots) {
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.fill();
  }

  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function pickCounts() {
    // Choose smaller count, then larger count respecting minRatio
    const smaller = randInt(CONFIG.minDots, CONFIG.maxDots);
    const bigger = Math.max(smaller + 1, Math.round(smaller * state.minRatio));

    // Keep bigger within maxDots; if it overflows, shift both down
    if (bigger > CONFIG.maxDots) {
      const cappedBigger = CONFIG.maxDots;
      const cappedSmaller = Math.max(CONFIG.minDots, Math.round(cappedBigger / state.minRatio));
      const largeOnLeft = Math.random() < 0.5;
      return {
        L: largeOnLeft ? cappedBigger : cappedSmaller,
        R: largeOnLeft ? cappedSmaller : cappedBigger,
        correctSide: largeOnLeft ? "L" : "R"
      };
    }

    const largeOnLeft = Math.random() < 0.5;
    return {
      L: largeOnLeft ? bigger : smaller,
      R: largeOnLeft ? smaller : bigger,
      correctSide: largeOnLeft ? "L" : "R"
    };
  }

  function setProgressBar() {
    if (!state.running || !state.tStart || !state.tEnd) { el.timeBar.style.width = "0%"; return; }
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

  function updateStatsUI() {
    el.statCorrect.textContent = String(state.correct);
    el.statErrors.textContent = String(state.errors);

    const attempted = state.correct + state.errors;
    const acc = attempted ? (state.correct / attempted) : 0;
    el.statAcc.textContent = `${Math.round(acc * 100)}%`;

    const med = median(state.rts);
    el.statRT.textContent = med ? `${Math.round(med)} ms` : "–";

    setBadge(el.badgeScore, `Accuracy: ${Math.round(acc * 100)}%`);
  }

  function lockChoices(locked) {
    el.btnLeft.disabled = locked;
    el.btnRight.disabled = locked;
  }

  function setOverlays(textLeft, textRight, show=true) {
    el.ovLeft.textContent = textLeft;
    el.ovRight.textContent = textRight;
    el.ovLeft.classList.toggle("hidden", !show);
    el.ovRight.classList.toggle("hidden", !show);
  }

  function applySettingsFromUI() {
    state.durationSec = parseInt(el.durationSelect.value, 10) || 120;
    state.stimMs = parseInt(el.stimSelect.value, 10) || 800;
    state.minRatio = parseFloat(el.ratioSelect.value) || 1.2;

    el.durationLabel.textContent = String(state.durationSec);
    el.stimLabel.textContent = String(state.stimMs);
    el.ratioLabel.textContent = state.minRatio.toFixed(2);
  }

  function start() {
    applySettingsFromUI();

    state.running = true;
    state.phase = "show";
    state.correct = 0;
    state.errors = 0;
    state.rts = [];
    state.trials = [];

    setBadge(el.badgePhase, "Running", "ok");
    updateStatsUI();

    state.tStart = now();
    state.tEnd = state.tStart + state.durationSec * 1000;

    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlays("Get ready…", "Get ready…", true);
    lockChoices(true);

    clearInterval(state.tickTimer);
    state.tickTimer = setInterval(() => {
      setProgressBar();
      updateTimeBadge();
      if (now() >= state.tEnd) finish("timeout");
    }, 120);

    setProgressBar();
    updateTimeBadge();

    setTimeout(() => nextTrial(), 600);
  }

  function nextTrial() {
    if (!state.running) return;
    if (now() >= state.tEnd) { finish("timeout"); return; }

    state.phase = "show";
    lockChoices(true);

    const pick = pickCounts();
    state.leftCount = pick.L;
    state.rightCount = pick.R;
    state.correctSide = pick.correctSide;

    drawDots(ctxL, state.leftCount);
    drawDots(ctxR, state.rightCount);

    setOverlays("", "", false);

    setTimeout(() => {
      // HARD MASK: fully remove dots BEFORE response
      clearCanvas(ctxL);
      clearCanvas(ctxR);

      setOverlays("Choose the side with more dots", "Choose the side with more dots", true);

      state.phase = "respond";
      state.responseOpenedAt = now();
      lockChoices(false);
    }, state.stimMs);
  }

  function answer(side) {
    if (!state.running) return;
    if (state.phase !== "respond") return;

    lockChoices(true);

    const rt = state.responseOpenedAt ? (now() - state.responseOpenedAt) : null;
    const isCorrect = (side === state.correctSide);

    state.trials.push({
      ts: nowISO(),
      leftCount: state.leftCount,
      rightCount: state.rightCount,
      correctSide: state.correctSide,
      answerSide: side,
      correct: isCorrect,
      rtMs: rt
    });

    if (isCorrect) state.correct += 1;
    else state.errors += 1;
    if (rt !== null) state.rts.push(rt);

    updateStatsUI();
    setBadge(el.badgePhase, isCorrect ? "✓" : "✕", isCorrect ? "ok" : "bad");

    setTimeout(() => {
      setBadge(el.badgePhase, "Running", "ok");
      nextTrial();
    }, 280);
  }

  function finish(reason = "completed") {
    const attempted = state.correct + state.errors;

    // If nothing started and you press Finish, still emit a result but keep it clean.
    const wasRunning = state.running;

    state.running = false;
    state.phase = "done";
    clearInterval(state.tickTimer);
    state.tickTimer = null;

    lockChoices(true);
    setBadge(el.badgePhase, "Done");

    const acc = attempted ? (state.correct / attempted) : 0;
    const med = median(state.rts);

    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlays("Session finished", "Session finished", true);

    const session = {
      test: "PerceptualAccuracy_DotComparison",
      durationSec: state.durationSec,
      stimMs: state.stimMs,
      minRatio: state.minRatio,
      correct: state.correct,
      errors: state.errors,
      trialsAttempted: attempted,
      accuracy: attempted ? acc : null,
      medianRtMs: med ? Math.round(med) : null,
      completedAt: nowISO(),
      reason,
      trials: state.trials
    };

    // Save only if it truly ran or has any trials
    if (wasRunning || attempted > 0) addSession(session);

    // Update UI
    el.btnStart.textContent = "Start";
    updateTimeBadge();
    setProgressBar();
    updateStatsUI();

    // Battery save
    api.saveResult("dots", {
      accuracy: attempted ? Number(acc.toFixed(3)) : null,
      trials: attempted,
      medianRtMs: med ? Math.round(med) : null,
      stimMs: state.stimMs,
      minRatio: Number(state.minRatio.toFixed(2))
    }, {
      version: "1.0",
      reason,
      raw: session
    });
  }

  // Events
  el.btnStart.addEventListener("click", () => {
    if (state.running) finish("restart");
    start();
    el.btnStart.textContent = "Restart";
  });

  el.btnFinish.addEventListener("click", () => {
    finish("manual_finish");
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CONFIG.storageKey);
    renderHistory();
    renderLatest();
  });

  el.btnLeft.addEventListener("click", () => answer("L"));
  el.btnRight.addEventListener("click", () => answer("R"));

  function onKeydown(e) {
    if (!state.running) return;
    if (state.phase !== "respond") return;
    if (e.key === "ArrowLeft") answer("L");
    if (e.key === "ArrowRight") answer("R");
  }
  window.addEventListener("keydown", onKeydown);

  // Init
  (function initUI() {
    setBadge(el.badgePhase, "Idle");
    setBadge(el.badgeTime, "Time: –");
    setBadge(el.badgeScore, "Accuracy: –");

    applySettingsFromUI();
    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlays("Press Start", "Press Start", true);
    lockChoices(true);

    renderHistory();
    renderLatest();
    updateStatsUI();
  })();

  // Cleanup
  return () => {
    clearInterval(state.tickTimer);
    window.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", onResize);
  };
}
