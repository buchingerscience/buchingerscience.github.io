// /cognition/cog6_dots.js
// Dot Comparison (numerosity) — simplified module version (cog1 vibe)
// Exports: init(container, api)
// api.saveResult(testId, metrics, extra)

export function init(container, api) {
  container.innerHTML = `
    <style>
      .dots-wrap{ --maxw: 780px; max-width: var(--maxw); margin: 0 auto; padding: 0; box-sizing:border-box; }

      .dots-top{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 12px;
      }
      .dots-title{ font-weight:650; letter-spacing:.2px; }
      .dots-sub{ font-size:12px; opacity:.78; margin-top:2px; }

      .dots-actions{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }
      .dots-pill{
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
      .dots-pill:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .dots-pill.primary{ background: var(--accent, #5bc2e7); color:#fff; border-color: rgba(0,0,0,0.05); }
      .dots-pill.primary:hover{ background:#67c9ea; }
      .dots-pill.danger{ background:#fff; border-color: rgba(220,53,69,0.25); }
      .dots-pill.danger:hover{ background: rgba(220,53,69,0.06); }

      .dots-card{
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 14px;
      }

      .dots-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .dots-row.spread{ justify-content: space-between; }

      .dots-badges{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; }
      .dots-badge{
        padding: 4px 8px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
        white-space: nowrap;
      }
      .dots-badge.ok{ border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .dots-badge.bad{ border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .dots-progress{
        margin-top: 10px;
        height: 8px;
        border-radius: 999px;
        background: rgba(222,226,230,0.7);
        overflow: hidden;
        border: 1px solid var(--border, #e9ecef);
      }
      .dots-bar{
        height:100%;
        width:0%;
        background: var(--accent, #5bc2e7);
        transition: width .12s linear;
      }

      .dots-arena{
        margin-top: 12px;
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        height: 320px;
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 10px;
        box-sizing:border-box;
        user-select:none;
      }
      @media (max-width: 560px){
        .dots-arena{ height: 300px; }
      }

      .dots-panel{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: rgba(255,255,255,0.92);
        position: relative;
        overflow:hidden;
      }
      .dots-overlay{
        position:absolute; inset:0;
        display:flex; align-items:center; justify-content:center;
        padding: 12px;
        text-align:center;
        font-size: 13px;
        opacity: .92;
        background: rgba(248,249,250,0.92);
      }
      .dots-overlay.hidden{ display:none; }

      .dots-choices{
        margin-top: 10px;
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .dots-choice{
        padding: 14px 10px;
        border-radius: 8px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.95);
        cursor:pointer;
        font-size: 14px;
        transition: transform .12s ease, box-shadow .12s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
      }
      .dots-choice:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .dots-choice:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }

      .dots-kv{
        margin-top: 12px;
        display:grid;
        grid-template-columns: 1fr auto;
        gap: 6px 10px;
        font-size: 12.5px;
      }
      .dots-kv div:nth-child(odd){ opacity:.78; }

      .dots-foot{
        margin-top: 10px;
        font-size: 12px;
        opacity: .75;
        line-height: 1.35;
      }
      .dots-foot kbd{
        display:inline-block;
        padding: 1px 7px;
        border-radius: 6px;
        background: rgba(248,249,250,0.95);
        border: 1px solid var(--border, #e9ecef);
        font-size: 11px;
        font-weight: 650;
      }
    </style>

    <div class="dots-wrap">
      <div class="dots-top">
        <div>
          <div class="dots-title">Dot Comparison</div>
          <div class="dots-sub">Which side had more dots?</div>
        </div>
        <div class="dots-actions">
          <button class="dots-pill primary" id="btnStart" type="button">Start</button>
          <button class="dots-pill" id="btnFinish" type="button">Finish</button>
          <button class="dots-pill danger" id="btnReset" type="button">Reset</button>
        </div>
      </div>

      <section class="dots-card" aria-live="polite">
        <div class="dots-row spread">
          <div class="dots-badges">
            <span class="dots-badge" id="bPhase">Idle</span>
            <span class="dots-badge" id="bTime">Time: –</span>
            <span class="dots-badge" id="bAcc">Acc: –</span>
          </div>
          <div class="dots-badges">
            <span class="dots-badge" id="bTrials">Trials: 0</span>
          </div>
        </div>

        <div class="dots-progress"><div class="dots-bar" id="bar"></div></div>

        <div class="dots-arena">
          <div class="dots-panel">
            <canvas id="cL" width="520" height="380" style="width:100%; height:100%;"></canvas>
            <div class="dots-overlay" id="ovL">Press Start</div>
          </div>
          <div class="dots-panel">
            <canvas id="cR" width="520" height="380" style="width:100%; height:100%;"></canvas>
            <div class="dots-overlay" id="ovR">Press Start</div>
          </div>
        </div>

        <div class="dots-choices">
          <button class="dots-choice" id="chooseL" type="button">Left more</button>
          <button class="dots-choice" id="chooseR" type="button">Right more</button>
        </div>

        <div class="dots-kv">
          <div>Median reaction time</div><div id="rtMed">–</div>
          <div>Last session</div><div id="latestDate">–</div>
        </div>

        <div class="dots-foot">
          Dots appear briefly, then disappear before you answer.
          Keyboard: <kbd>←</kbd> and <kbd>→</kbd>
        </div>
      </section>
    </div>
  `;

  // ===== Minimal defaults (no user controls) =====
  const CFG = {
    storageKey: "dots.simple.v1",
    durationSec: 120,
    stimMs: 800,
    minRatio: 1.20,
    dotRadius: 4,
    minDots: 8,
    maxDots: 30
  };

  const el = {
    btnStart: container.querySelector("#btnStart"),
    btnFinish: container.querySelector("#btnFinish"),
    btnReset: container.querySelector("#btnReset"),

    bPhase: container.querySelector("#bPhase"),
    bTime: container.querySelector("#bTime"),
    bAcc: container.querySelector("#bAcc"),
    bTrials: container.querySelector("#bTrials"),

    bar: container.querySelector("#bar"),

    cL: container.querySelector("#cL"),
    cR: container.querySelector("#cR"),
    ovL: container.querySelector("#ovL"),
    ovR: container.querySelector("#ovR"),

    chooseL: container.querySelector("#chooseL"),
    chooseR: container.querySelector("#chooseR"),

    rtMed: container.querySelector("#rtMed"),
    latestDate: container.querySelector("#latestDate")
  };

  const ctxL = el.cL.getContext("2d");
  const ctxR = el.cR.getContext("2d");

  const state = {
    running: false,
    phase: "idle", // idle | show | respond | done
    tStart: null,
    tEnd: null,
    tick: null,

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
    const a = arr.slice().sort((x,y)=>x-y);
    const m = Math.floor(a.length/2);
    return (a.length % 2) ? a[m] : (a[m-1] + a[m]) / 2;
  }

  function setBadge(node, text, kind=null) {
    node.textContent = text;
    node.classList.remove("ok","bad");
    if (kind) node.classList.add(kind);
  }

  function clearCanvas(ctx){ ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); }

  function setOverlay(text, show=true) {
    el.ovL.textContent = text;
    el.ovR.textContent = text;
    el.ovL.classList.toggle("hidden", !show);
    el.ovR.classList.toggle("hidden", !show);
  }

  function lockChoices(locked){
    el.chooseL.disabled = locked;
    el.chooseR.disabled = locked;
  }

  function randInt(a,b){ return a + Math.floor(Math.random() * (b - a + 1)); }

  function pickCounts(){
    const base = randInt(CFG.minDots, CFG.maxDots);
    const bigger = Math.max(base, Math.round(base * CFG.minRatio));
    const smaller = base;

    const largeOnLeft = Math.random() < 0.5;
    const L = largeOnLeft ? bigger : smaller;
    const R = largeOnLeft ? smaller : bigger;
    return { L, R, correctSide: largeOnLeft ? "L" : "R" };
  }

  function drawDots(ctx, count){
    clearCanvas(ctx);
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const r = CFG.dotRadius;
    const margin = 18;
    const pts = [];
    let attempts = 0;

    while (pts.length < count && attempts < 6000) {
      attempts++;
      const x = margin + Math.random() * (w - 2*margin);
      const y = margin + Math.random() * (h - 2*margin);

      let ok = true;
      for (const p of pts) {
        const dx = p.x - x, dy = p.y - y;
        if ((dx*dx + dy*dy) < ((2*r + 2) * (2*r + 2))) { ok = false; break; }
      }
      if (ok) pts.push({x,y});
    }

    ctx.beginPath();
    for (const p of pts) {
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.fill();
  }

  function updateStatsUI() {
    const attempted = state.correct + state.errors;
    const acc = attempted ? (state.correct / attempted) : 0;
    const med = median(state.rts);

    setBadge(el.bAcc, attempted ? `Acc: ${Math.round(acc*100)}%` : "Acc: –");
    setBadge(el.bTrials, `Trials: ${attempted}`);
    el.rtMed.textContent = med ? `${Math.round(med)} ms` : "–";
  }

  function updateTimeUI() {
    if (!state.running || !state.tEnd) { setBadge(el.bTime, "Time: –"); el.bar.style.width = "0%"; return; }
    const remainMs = Math.max(0, state.tEnd - now());
    const sec = Math.ceil(remainMs / 1000);
    const m = Math.floor(sec/60);
    const s = sec % 60;
    setBadge(el.bTime, `Time: ${m}:${String(s).padStart(2,"0")}`);

    const frac = Math.max(0, Math.min(1, (now() - state.tStart) / (state.tEnd - state.tStart)));
    el.bar.style.width = (frac * 100).toFixed(1) + "%";
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
  }
  function renderLatest() {
    const s = loadSessions()[0] || null;
    el.latestDate.textContent = s ? fmtDate(s.completedAt) : "–";
  }

  function start() {
    // reset
    state.running = true;
    state.phase = "show";
    state.correct = 0;
    state.errors = 0;
    state.rts = [];
    state.trials = [];

    setBadge(el.bPhase, "Running", "ok");
    updateStatsUI();

    state.tStart = now();
    state.tEnd = state.tStart + CFG.durationSec * 1000;

    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlay("Get ready…", true);
    lockChoices(true);

    if (state.tick) clearInterval(state.tick);
    state.tick = setInterval(() => {
      updateTimeUI();
      if (now() >= state.tEnd) finish("timeout");
    }, 120);

    updateTimeUI();

    setTimeout(() => nextTrial(), 600);
  }

  function nextTrial() {
    if (!state.running) return;
    if (now() >= state.tEnd) { finish("timeout"); return; }

    state.phase = "show";
    lockChoices(true);

    const p = pickCounts();
    state.leftCount = p.L;
    state.rightCount = p.R;
    state.correctSide = p.correctSide;

    drawDots(ctxL, state.leftCount);
    drawDots(ctxR, state.rightCount);
    setOverlay("", false);

    setTimeout(() => {
      // hard mask: clear dots before response
      clearCanvas(ctxL);
      clearCanvas(ctxR);
      setOverlay("Choose the side with more", true);

      state.phase = "respond";
      state.responseOpenedAt = now();
      lockChoices(false);
    }, CFG.stimMs);
  }

  function answer(side) {
    if (!state.running) return;
    if (state.phase !== "respond") return;

    lockChoices(true);

    const rt = state.responseOpenedAt ? (now() - state.responseOpenedAt) : null;
    const ok = (side === state.correctSide);

    state.trials.push({
      ts: nowISO(),
      leftCount: state.leftCount,
      rightCount: state.rightCount,
      correctSide: state.correctSide,
      answerSide: side,
      correct: ok,
      rtMs: rt
    });

    if (ok) state.correct += 1;
    else state.errors += 1;
    if (rt != null) state.rts.push(rt);

    updateStatsUI();
    setBadge(el.bPhase, ok ? "✓" : "✕", ok ? "ok" : "bad");

    setTimeout(() => {
      if (!state.running) return;
      setBadge(el.bPhase, "Running", "ok");
      nextTrial();
    }, 240);
  }

  function finish(reason="manual_finish") {
    const wasRunning = state.running;

    state.running = false;
    state.phase = "done";
    if (state.tick) clearInterval(state.tick);
    state.tick = null;

    lockChoices(true);
    setBadge(el.bPhase, "Done");
    updateTimeUI();

    const attempted = state.correct + state.errors;
    const acc = attempted ? (state.correct / attempted) : 0;
    const med = median(state.rts);

    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlay("Session finished", true);

    const session = {
      test: "DotComparison",
      durationSec: CFG.durationSec,
      stimMs: CFG.stimMs,
      minRatio: CFG.minRatio,
      correct: state.correct,
      errors: state.errors,
      trialsAttempted: attempted,
      accuracy: acc,
      medianRtMs: med ? Math.round(med) : null,
      completedAt: nowISO(),
      reason,
      trials: state.trials
    };

    if (wasRunning || attempted > 0) addSession(session);

    // Battery save
    api.saveResult("dots", {
      accuracy: attempted ? Number(acc.toFixed(3)) : null,
      trials: attempted,
      medianRtMs: med ? Math.round(med) : null
    }, {
      version: "2.0_simplified",
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
    if (state.running) finish("manual_finish");
    else api.saveResult("dots", { note: "Finished without run" }, { version: "2.0_simplified" });
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CFG.storageKey);
    el.latestDate.textContent = "–";
  });

  el.chooseL.addEventListener("click", () => answer("L"));
  el.chooseR.addEventListener("click", () => answer("R"));

  function onKeydown(e) {
    if (!state.running || state.phase !== "respond") return;
    if (e.key === "ArrowLeft") answer("L");
    if (e.key === "ArrowRight") answer("R");
  }
  window.addEventListener("keydown", onKeydown);

  // Init
  (function initUI() {
    setBadge(el.bPhase, "Idle");
    setBadge(el.bTime, "Time: –");
    setBadge(el.bAcc, "Acc: –");
    setBadge(el.bTrials, "Trials: 0");
    el.bar.style.width = "0%";
    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlay("Press Start", true);
    lockChoices(true);
    updateStatsUI();
    renderLatest();
  })();

  // Cleanup
  return () => {
    if (state.tick) clearInterval(state.tick);
    window.removeEventListener("keydown", onKeydown);
  };
}
