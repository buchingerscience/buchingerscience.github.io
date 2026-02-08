// /cognition/cog6_dots.js
// Dot Comparison (numerosity) — redesigned for intuitive UX (cog1/cog2 vibe)
// Key changes:
// - Center start overlay (big Start button) + short instructions once
// - During play: almost no text (just “Watch” then “Choose”)
// - Timer pill + progress bar visible during the 2 minutes
// - Clear feedback ✓ / ✕ without clutter
// - Results screen at the end (simple cards) + Retry / Next
// - localStorage saving works (latest session date + latest accuracy shown)
// Exports: init(container, api)

export function init(container, api) {

  container.innerHTML = `
    <style>
      .dots-wrap{ max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }

.dots-stage{
  position:relative;
  width:100%;
  height: 100%;          /* fill the container */
  min-height: 420px;     /* fallback so it still looks good on desktop */
  border-radius:20px; background:#F5F3F0; border:1px solid #E8E4DF;
  overflow:hidden; user-select:none;
  display:flex; flex-direction:column;
}

@media(max-width:600px){
  .dots-stage{
    min-height: 360px;   /* instead of forcing a fixed height */
    border-radius:16px;
  }
}
      /* Start overlay */
      .dots-start{
        position:absolute; inset:0;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        gap:14px; padding:18px;
        background:#F5F3F0;
        z-index:5;
        transition:opacity .25s ease;
        text-align:center;
      }
      .dots-start.hidden{ opacity:0; pointer-events:none; }

      .dots-icon{ font-size:46px; }
      .dots-title{ font-size:22px; font-weight:900; color:#2D2A26; letter-spacing:-0.3px; }
      .dots-sub{ font-size:14px; color:#8A857E; line-height:1.5; max-width:440px; }
      .dots-start-btn{
        margin-top:4px;
        padding:14px 40px; border-radius:999px; border:none;
        background:#4A90D9; color:#fff;
        font-family:inherit; font-size:16px; font-weight:850;
        cursor:pointer; transition:all .2s ease;
      }
      .dots-start-btn:hover{ background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.28); }

      .dots-miniHint{
        margin-top:10px;
        font-size:12px;
        color:#B5B0A8;
      }
      .dots-miniHint kbd{
        display:inline-block; padding:2px 8px; border-radius:4px;
        background:#EDEAE6; font-family:inherit; font-size:11px; font-weight:900;
      }

      /* Top bar */
      .dots-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        padding:14px 14px 0;
      }
      .dots-pill{
        display:inline-flex; align-items:center; justify-content:center;
        padding:6px 14px; border-radius:999px;
        background:rgba(0,0,0,0.06);
        font-size:13px; font-weight:800; color:#8A857E;
        font-variant-numeric:tabular-nums;
      }
      .dots-pill.strong{ color:#2D2A26; }

      .dots-progress{
        margin:10px 14px 0;
        height:5px; border-radius:999px; overflow:hidden;
        background:rgba(0,0,0,0.06);
        display:none;
      }
      .dots-progress-fill{
        height:100%; width:0%;
        background:#4A90D9;
        transition:width 0.12s linear;
      }

      /* Arena */
 .dots-center{
  flex:1;
  min-height: 0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:14px;
}
  .dots-arena{
  width:100%;
  max-width:620px;
  height:260px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}
@media(max-width:600px){ .dots-arena{ height:240px; } }

      .dots-panel{
        border-radius:18px;
        border:1px solid #E8E4DF;
        background:linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,247,245,0.92));
        position:relative;
        overflow:hidden;
      }

      .dots-canvas{ width:100%; height:100%; display:block; }

      .dots-overlay{
        position:absolute; inset:0;
        display:flex; align-items:center; justify-content:center;
        text-align:center;
        padding:14px;
        font-size:14px; font-weight:750;
        color:#8A857E;
        background:rgba(245,243,240,0.90);
      }
      .dots-overlay.hidden{ display:none; }

      .dots-big{
        font-size:52px; font-weight:950; color:#2D2A26; line-height:1;
      }

      .dots-help{
        margin-top:12px;
        font-size:14px; font-weight:650; color:#8A857E;
        min-height:22px;
        text-align:center;
      }

      .dots-choices{
        margin-top:12px;
        width:100%;
        max-width:620px;
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      }
      .dots-choice{
        padding:14px 10px;
        border-radius:999px;
        border:1px solid #E8E4DF;
        background:#fff;
        cursor:pointer;
        font-size:14px;
        font-weight:900;
        color:#2D2A26;
        transition:all .18s ease;
      }
      .dots-choice:hover{ background:#F5F3F0; transform:translateY(-1px); }
      .dots-choice:disabled{ opacity:0.55; cursor:not-allowed; transform:none; }

      /* Results */
      .dots-results{
        display:none;
        padding:16px;
        border-top:1px solid #E8E4DF;
        background:#F5F3F0;
      }
      .dots-results.show{ display:block; }

      .dots-resultsTop{
        display:flex; align-items:center; justify-content:center; flex-direction:column;
        gap:6px; padding:6px 0 10px;
        text-align:center;
      }
      .dots-resultsEmoji{ font-size:40px; }
      .dots-resultsTitle{ font-size:20px; font-weight:900; color:#2D2A26; }

      .dots-grid{
        display:grid; grid-template-columns:repeat(3,1fr);
        gap:12px; max-width:620px; margin:0 auto;
      }
      @media(max-width:480px){ .dots-grid{ grid-template-columns:repeat(2,1fr); } }

      .dots-card{
        background:#F5F3F0;
        border-radius:12px;
        border:1px solid #E8E4DF;
        padding:14px 12px;
        text-align:center;
      }
      .dots-card .val{ font-size:22px; font-weight:900; color:#2D2A26; }
      .dots-card .lbl{ margin-top:4px; font-size:11px; font-weight:850; color:#8A857E; }

      .dots-actions{
        margin-top:14px;
        display:flex; gap:10px; justify-content:center; flex-wrap:wrap;
      }
      .dots-btnSecondary{
        padding:10px 24px; border-radius:999px; border:1px solid #E8E4DF; background:#fff;
        font-family:inherit; font-size:14px; font-weight:900; cursor:pointer; color:#2D2A26;
        transition:all .2s ease;
      }
      .dots-btnSecondary:hover{ background:#F5F3F0; transform:translateY(-1px); }
      .dots-btnPrimary{
        padding:10px 24px; border-radius:999px; border:none; background:#4A90D9; color:#fff;
        font-family:inherit; font-size:14px; font-weight:900; cursor:pointer; transition:all .2s ease;
      }
      .dots-btnPrimary:hover{ background:#3D7FCC; transform:translateY(-1px); }

      .dots-latest{
        margin-top:10px;
        text-align:center;
        font-size:12px;
        color:#B5B0A8;
      }
    </style>

    <div class="dots-wrap">
      <div class="dots-stage" id="dotsStage">

        <div class="dots-start" id="dotsStart">
          <div class="dots-icon">⚪️⚫️</div>
          <div class="dots-title">Dot Comparison</div>
          <div class="dots-sub">
            Dots will flash briefly on both sides.<br/>
            Then they disappear. Choose the side that had more.<br/>
            Runs for <b>2 minutes</b>.
          </div>
          <button class="dots-start-btn" id="dotsBtnStart" type="button">Start</button>
          <div class="dots-miniHint">Keyboard: <kbd>←</kbd> / <kbd>→</kbd></div>
        </div>

        <div class="dots-topbar">
          <div class="dots-pill strong" id="dotsPhasePill">Ready</div>
          <div class="dots-pill" id="dotsTimePill">2:00</div>
        </div>

        <div class="dots-progress" id="dotsProgressWrap"><div class="dots-progress-fill" id="dotsProgressBar"></div></div>

        <div class="dots-center">
          <div class="dots-arena">
            <div class="dots-panel">
              <canvas id="dotsCL" width="520" height="380" class="dots-canvas"></canvas>
              <div class="dots-overlay" id="dotsOvL">Press Start</div>
            </div>
            <div class="dots-panel">
              <canvas id="dotsCR" width="520" height="380" class="dots-canvas"></canvas>
              <div class="dots-overlay" id="dotsOvR">Press Start</div>
            </div>
          </div>

          <div class="dots-help" id="dotsHelp"></div>

          <div class="dots-choices">
            <button class="dots-choice" id="dotsChooseL" type="button">Left</button>
            <button class="dots-choice" id="dotsChooseR" type="button">Right</button>
          </div>
        </div>

        <div class="dots-results" id="dotsResults">
          <div class="dots-resultsTop">
            <div class="dots-resultsEmoji">✅</div>
            <div class="dots-resultsTitle">Test Complete</div>
          </div>

          <div class="dots-grid" id="dotsResultsGrid"></div>

          <div class="dots-actions">
            <button class="dots-btnSecondary" id="dotsBtnRetry" type="button">Try again</button>
            <button class="dots-btnPrimary" id="dotsBtnNext" type="button">Next test →</button>
          </div>

          <div class="dots-latest" id="dotsLatestLine"></div>
        </div>

      </div>
    </div>
  `;

  // ===== Defaults (fixed) =====
  const CFG = {
    storageKey: "dots.simple.v2",
    durationMs: 120000,   // 2 minutes
    stimMs: 800,
    minRatio: 1.20,
    dotRadius: 4,
    minDots: 8,
    maxDots: 30
  };

  const el = {
    start: container.querySelector("#dotsStart"),
    btnStart: container.querySelector("#dotsBtnStart"),

    phasePill: container.querySelector("#dotsPhasePill"),
    timePill: container.querySelector("#dotsTimePill"),

    progressWrap: container.querySelector("#dotsProgressWrap"),
    progressBar: container.querySelector("#dotsProgressBar"),

    cL: container.querySelector("#dotsCL"),
    cR: container.querySelector("#dotsCR"),
    ovL: container.querySelector("#dotsOvL"),
    ovR: container.querySelector("#dotsOvR"),

    help: container.querySelector("#dotsHelp"),

    chooseL: container.querySelector("#dotsChooseL"),
    chooseR: container.querySelector("#dotsChooseR"),

    results: container.querySelector("#dotsResults"),
    resultsGrid: container.querySelector("#dotsResultsGrid"),
    btnRetry: container.querySelector("#dotsBtnRetry"),
    btnNext: container.querySelector("#dotsBtnNext"),
    latestLine: container.querySelector("#dotsLatestLine")
  };

  const ctxL = el.cL.getContext("2d");
  const ctxR = el.cR.getContext("2d");

  const state = {
    running: false,
    phase: "idle", // idle | show | respond | done

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

  function now(){ return Date.now(); }
  function nowISO(){ return new Date().toISOString(); }

  function fmtDate(iso){
    try{
      const d = new Date(iso);
      return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch { return iso; }
  }

  function median(arr){
    if (!arr.length) return null;
    const a = arr.slice().sort((x,y)=>x-y);
    const m = Math.floor(a.length/2);
    return (a.length % 2) ? a[m] : (a[m-1] + a[m]) / 2;
  }

  function clearAllTimers(){
    if (state.tickTimer) clearInterval(state.tickTimer);
    state.tickTimer = null;
  }

  function clearCanvas(ctx){ ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); }

  function setOverlay(text, show){
    el.ovL.textContent = text;
    el.ovR.textContent = text;
    el.ovL.classList.toggle("hidden", !show);
    el.ovR.classList.toggle("hidden", !show);
  }

  function lockChoices(locked){
    el.chooseL.disabled = locked;
    el.chooseR.disabled = locked;
  }

  function showProgress(show){
    el.progressWrap.style.display = show ? "" : "none";
    if (!show) el.progressBar.style.width = "0%";
  }

  function setPhase(text){
    el.phasePill.textContent = text;
  }

  function updateProgressAndTime(){
    if (!state.running || !state.tEnd){
      el.timePill.textContent = "2:00";
      el.progressBar.style.width = "0%";
      return;
    }

    const remain = Math.max(0, state.tEnd - now());
    const sec = Math.ceil(remain / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    el.timePill.textContent = m + ":" + (s < 10 ? "0" : "") + s;

    const frac = Math.max(0, Math.min(1, (now() - state.tStart) / (state.tEnd - state.tStart)));
    el.progressBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function randInt(a,b){ return a + Math.floor(Math.random() * (b - a + 1)); }

  function pickCounts(){
    const base = randInt(CFG.minDots, CFG.maxDots);
    const bigger = Math.max(base, Math.round(base * CFG.minRatio));
    const smaller = base;

    const bigLeft = Math.random() < 0.5;
    return {
      L: bigLeft ? bigger : smaller,
      R: bigLeft ? smaller : bigger,
      correctSide: bigLeft ? "L" : "R"
    };
  }

  function drawDots(ctx, count){
    clearCanvas(ctx);

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const r = CFG.dotRadius;
    const margin = 18;

    const pts = [];
    let attempts = 0;

    while (pts.length < count && attempts < 6000){
      attempts++;
      const x = margin + Math.random() * (w - 2*margin);
      const y = margin + Math.random() * (h - 2*margin);

      let ok = true;
      for (const p of pts){
        const dx = p.x - x;
        const dy = p.y - y;
        if ((dx*dx + dy*dy) < ((2*r + 2) * (2*r + 2))) { ok = false; break; }
      }
      if (ok) pts.push({x,y});
    }

    ctx.beginPath();
    for (const p of pts){
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = "rgba(0,0,0,0.78)";
    ctx.fill();
  }

  function loadSessions(){
    try{
      const raw = localStorage.getItem(CFG.storageKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  function saveSessions(sessions){
    try{
      localStorage.setItem(CFG.storageKey, JSON.stringify(sessions));
    } catch {
      // ignore storage errors (private mode / quota)
    }
  }

  function addSession(s){
    const sessions = loadSessions();
    sessions.unshift(s);
    saveSessions(sessions.slice(0, 200));
  }

  function renderLatestLine(){
    const s = loadSessions()[0] || null;
    if (!s){
      el.latestLine.textContent = "No saved sessions yet.";
      return;
    }
    el.latestLine.textContent = `Last session: ${fmtDate(s.completedAt)} • ${Math.round(s.accuracy*100)}% • ${s.trialsAttempted} trials`;
  }

  function start(){
    clearAllTimers();

    state.running = true;
    state.phase = "show";

    state.correct = 0;
    state.errors = 0;
    state.rts = [];
    state.trials = [];

    state.tStart = now();
    state.tEnd = state.tStart + CFG.durationMs;

    el.results.classList.remove("show");
    el.start.classList.add("hidden");

    showProgress(true);
    setPhase("Watch");
    el.help.textContent = "";
    lockChoices(true);

    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlay("Get ready…", true);

    updateProgressAndTime();
    state.tickTimer = setInterval(() => {
      updateProgressAndTime();
      if (now() >= state.tEnd) finishAndSave("timeout");
    }, 120);

    setTimeout(() => nextTrial(), 600);
  }

  function nextTrial(){
    if (!state.running) return;
    if (now() >= state.tEnd) { finishAndSave("timeout"); return; }

    state.phase = "show";
    setPhase("Watch");
    el.help.textContent = "";
    lockChoices(true);

    const p = pickCounts();
    state.leftCount = p.L;
    state.rightCount = p.R;
    state.correctSide = p.correctSide;

    drawDots(ctxL, state.leftCount);
    drawDots(ctxR, state.rightCount);

    setOverlay("", false);

    setTimeout(() => {
      // Hard mask: remove dots before response
      clearCanvas(ctxL);
      clearCanvas(ctxR);

      state.phase = "respond";
      state.responseOpenedAt = now();

      setPhase("Choose");
      el.help.textContent = "Which side had more?";
      setOverlay("Choose", true);
      lockChoices(false);
    }, CFG.stimMs);
  }

  function answer(side){
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

    // quick, clean feedback
    setOverlay(ok ? "✓" : "✕", true);
    setPhase(ok ? "✓" : "✕");
    el.help.textContent = "";

    setTimeout(() => {
      if (!state.running) return;
      setOverlay("", false);
      nextTrial();
    }, 220);
  }

  function finishAndSave(reason){
    if (!state.running) return;

    state.running = false;
    state.phase = "done";
    clearAllTimers();

    lockChoices(true);
    showProgress(false);

    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlay("Done", true);
    setPhase("Done");
    el.help.textContent = "";

    const attempted = state.correct + state.errors;
    const acc = attempted ? (state.correct / attempted) : 0;
    const med = median(state.rts);

    const session = {
      test: "DotComparison",
      durationMs: CFG.durationMs,
      stimMs: CFG.stimMs,
      minRatio: CFG.minRatio,
      correct: state.correct,
      errors: state.errors,
      trialsAttempted: attempted,
      accuracy: acc,
      medianRtMs: (med != null) ? Math.round(med) : null,
      completedAt: nowISO(),
      reason: reason || "completed",
      trials: state.trials
    };

    if (attempted > 0) addSession(session);

    // Save to battery (guarded)
    if (api && typeof api.saveResult === "function"){
      api.saveResult("dots", {
        accuracy: attempted ? Number(acc.toFixed(3)) : null,
        trials: attempted,
        medianRtMs: (med != null) ? Math.round(med) : null,
        stimMs: CFG.stimMs,
        minRatio: Number(CFG.minRatio.toFixed(2))
      }, {
        version: "3.0_intuitive",
        reason: session.reason,
        raw: session
      });
    }

    showResults(acc, med, attempted);
  }

  function showResults(acc, med, attempted){
    const items = [
      { val: attempted ? Math.round(acc * 100) : "–", label: "Accuracy (%)" },
      { val: attempted, label: "Trials" },
      { val: (med != null ? Math.round(med) : "–"), label: "Median speed (ms)" },
      { val: "2", label: "Duration (min)" },
      { val: CFG.stimMs, label: "Dot time (ms)" },
      { val: CFG.minRatio.toFixed(2), label: "Difficulty" }
    ];

    let html = "";
    for (let i=0; i<items.length; i++){
      const r = items[i];
      html += '<div class="dots-card">';
      html += '<div class="val">' + r.val + '</div>';
      html += '<div class="lbl">' + r.label + '</div>';
      html += '</div>';
    }
    el.resultsGrid.innerHTML = html;

    renderLatestLine();
    el.results.classList.add("show");
  }

  // Events
  el.btnStart.addEventListener("click", start);

  el.chooseL.addEventListener("click", () => answer("L"));
  el.chooseR.addEventListener("click", () => answer("R"));

  function onKeydown(e){
    if (!state.running || state.phase !== "respond") return;
    if (e.key === "ArrowLeft") answer("L");
    if (e.key === "ArrowRight") answer("R");
  }
  window.addEventListener("keydown", onKeydown);

  el.btnRetry.addEventListener("click", () => {
    el.results.classList.remove("show");
    el.start.classList.remove("hidden");
    setOverlay("Press Start", true);
    setPhase("Ready");
    el.help.textContent = "";
    el.timePill.textContent = "2:00";
  });

  el.btnNext.addEventListener("click", () => {
    if (api && typeof api.next === "function") api.next();
  });

  // Init
  (function initUI(){
    setPhase("Ready");
    el.timePill.textContent = "2:00";
    showProgress(false);

    clearCanvas(ctxL);
    clearCanvas(ctxR);
    setOverlay("Press Start", true);
    lockChoices(true);
  })();

  // Cleanup
  return () => {
    clearAllTimers();
    window.removeEventListener("keydown", onKeydown);
  };
}
