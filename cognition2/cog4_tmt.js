// /cognition/cog4_tmt.js
// Trail Making Test (TMT) — redesigned to match cog1/cog2/cog6 vibe
// Changes:
// - Start screen with big centered Start button + short instructions
// - Timer pill + progress bar (fixed 2 minutes, like the others)
// - Optional Fullscreen button (best-effort; silent if blocked)
// - Cleaner in-test UI (no extra text), simple ✓ feedback via highlighting
// - Saves to localStorage (latest session) + sends to battery via api.saveResult
// Exports: init(container, api)

export function init(container, api) {

  container.innerHTML = `
    <style>
      .tmt-wrap{ max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }

      .tmt-stage{
        position:relative; width:100%; height:420px;
        border-radius:20px; background:#F5F3F0; border:1px solid #E8E4DF;
        overflow:hidden; user-select:none;
        display:flex; flex-direction:column;
      }
      @media(max-width:600px){ .tmt-stage{ height:360px; border-radius:16px; } }

      /* Start overlay */
      .tmt-start{
        position:absolute; inset:0;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        gap:14px; padding:18px;
        background:#F5F3F0;
        z-index:10;
        transition:opacity .25s ease;
        text-align:center;
      }
      .tmt-start.hidden{ opacity:0; pointer-events:none; }

      .tmt-icon{ font-size:46px; }
      .tmt-title{ font-size:22px; font-weight:900; color:#2D2A26; letter-spacing:-0.3px; }
      .tmt-sub{ font-size:14px; color:#8A857E; line-height:1.5; max-width:460px; }
      .tmt-start-btn{
        margin-top:4px;
        padding:14px 40px; border-radius:999px; border:none;
        background:#4A90D9; color:#fff;
        font-family:inherit; font-size:16px; font-weight:850;
        cursor:pointer; transition:all .2s ease;
      }
      .tmt-start-btn:hover{ background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.28); }

      .tmt-miniRow{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:8px; }
      .tmt-miniBtn{
        padding:10px 18px; border-radius:999px;
        border:1px solid #E8E4DF; background:#fff;
        font-family:inherit; font-size:13px; font-weight:850; color:#2D2A26;
        cursor:pointer; transition:all .2s ease;
      }
      .tmt-miniBtn:hover{ background:#F5F3F0; transform:translateY(-1px); }

      .tmt-miniHint{ margin-top:10px; font-size:12px; color:#B5B0A8; }

      /* Top bar */
      .tmt-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        padding:14px 14px 0;
      }
      .tmt-pill{
        display:inline-flex; align-items:center; justify-content:center;
        padding:6px 14px; border-radius:999px;
        background:rgba(0,0,0,0.06);
        font-size:13px; font-weight:800; color:#8A857E;
        font-variant-numeric:tabular-nums;
      }
      .tmt-pill.strong{ color:#2D2A26; }
      .tmt-pill.bad{ background:rgba(199,80,80,0.12); color:#C75050; }
      .tmt-pill.good{ background:rgba(59,155,109,0.12); color:#3B9B6D; }

      .tmt-progress{
        margin:10px 14px 0;
        height:5px; border-radius:999px; overflow:hidden;
        background:rgba(0,0,0,0.06);
        display:none;
      }
      .tmt-progress-fill{
        height:100%; width:0%;
        background:#4A90D9;
        transition:width 0.12s linear;
      }

      /* Arena */
      .tmt-arenaWrap{
        position:relative;
        flex:1;
        padding:14px;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      .tmt-arena{
        position:relative;
        width:100%;
        max-width:680px;
        height:100%;
        border-radius:18px;
        border:1px solid #E8E4DF;
        background:#F8F6F3;
        overflow:hidden;
      }

      .tmt-node{
        position:absolute;
        width:46px; height:46px;
        border-radius:999px;
        background:#fff;
        border:1px solid #D9D4CF;
        display:flex; align-items:center; justify-content:center;
        font-weight:900; color:#2D2A26;
        cursor:pointer;
        transform:translate(-50%,-50%);
        transition:all .12s ease;
      }
      .tmt-node:hover{ background:#F5F3F0; transform:translate(-50%,-50%) translateY(-1px); }
      .tmt-node.active{ box-shadow:0 0 0 4px rgba(74,144,217,0.25); }
      .tmt-node.done{ background:#E7F4EC; border-color:#B6E0C8; cursor:default; }

      svg{ position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }

      /* Results */
      .tmt-results{
        display:none;
        padding:16px;
        border-top:1px solid #E8E4DF;
        background:#F5F3F0;
      }
      .tmt-results.show{ display:block; }

      .tmt-resultsTop{
        display:flex; align-items:center; justify-content:center; flex-direction:column;
        gap:6px; padding:6px 0 10px; text-align:center;
      }
      .tmt-resultsEmoji{ font-size:40px; }
      .tmt-resultsTitle{ font-size:20px; font-weight:900; color:#2D2A26; }

      .tmt-grid{
        display:grid; grid-template-columns:repeat(3,1fr);
        gap:12px; max-width:620px; margin:0 auto;
      }
      @media(max-width:480px){ .tmt-grid{ grid-template-columns:repeat(2,1fr); } }

      .tmt-card{
        background:#F5F3F0;
        border-radius:12px;
        border:1px solid #E8E4DF;
        padding:14px 12px;
        text-align:center;
      }
      .tmt-card .val{ font-size:22px; font-weight:900; color:#2D2A26; }
      .tmt-card .lbl{ margin-top:4px; font-size:11px; font-weight:850; color:#8A857E; }

      .tmt-actions{
        margin-top:14px;
        display:flex; gap:10px; justify-content:center; flex-wrap:wrap;
      }
      .tmt-btnSecondary{
        padding:10px 24px; border-radius:999px; border:1px solid #E8E4DF; background:#fff;
        font-family:inherit; font-size:14px; font-weight:900; cursor:pointer; color:#2D2A26;
        transition:all .2s ease;
      }
      .tmt-btnSecondary:hover{ background:#F5F3F0; transform:translateY(-1px); }
      .tmt-btnPrimary{
        padding:10px 24px; border-radius:999px; border:none; background:#4A90D9; color:#fff;
        font-family:inherit; font-size:14px; font-weight:900; cursor:pointer; transition:all .2s ease;
      }
      .tmt-btnPrimary:hover{ background:#3D7FCC; transform:translateY(-1px); }

      .tmt-latest{
        margin-top:10px;
        text-align:center;
        font-size:12px;
        color:#B5B0A8;
      }
    </style>

    <div class="tmt-wrap">
      <div class="tmt-stage" id="tmtStage">

        <div class="tmt-start" id="tmtStart">
          <div class="tmt-icon">🔗</div>
          <div class="tmt-title">Trail Making</div>
          <div class="tmt-sub">
            Tap the circles in order:<br/>
            <b>1 → A → 2 → B → 3 → C</b> … until the end.<br/>
            Runs for <b>2 minutes</b>. Stop when time ends.
          </div>
          <button class="tmt-start-btn" id="tmtBtnStart" type="button">Start</button>
          <div class="tmt-miniRow">
            <button class="tmt-miniBtn" id="tmtBtnFullscreen" type="button">Full screen</button>
            <button class="tmt-miniBtn" id="tmtBtnReset" type="button">Reset layout</button>
          </div>
          <div class="tmt-miniHint">Tip: go fast, but keep it clean.</div>
        </div>

        <div class="tmt-topbar">
          <div class="tmt-pill strong" id="tmtPhasePill">Ready</div>
          <div class="tmt-pill" id="tmtTimePill">2:00</div>
          <div class="tmt-pill" id="tmtErrPill">Errors: 0</div>
        </div>

        <div class="tmt-progress" id="tmtProgressWrap"><div class="tmt-progress-fill" id="tmtProgressBar"></div></div>

        <div class="tmt-arenaWrap">
          <div class="tmt-arena" id="tmtArena">
            <svg id="tmtLines" viewBox="0 0 1000 700" preserveAspectRatio="none"></svg>
          </div>
        </div>

        <div class="tmt-results" id="tmtResults">
          <div class="tmt-resultsTop">
            <div class="tmt-resultsEmoji">✅</div>
            <div class="tmt-resultsTitle">Test Complete</div>
          </div>

          <div class="tmt-grid" id="tmtResultsGrid"></div>

          <div class="tmt-actions">
            <button class="tmt-btnSecondary" id="tmtBtnRetry" type="button">Try again</button>
            <button class="tmt-btnPrimary" id="tmtBtnNext" type="button">Next test →</button>
          </div>

          <div class="tmt-latest" id="tmtLatestLine"></div>
        </div>

      </div>
    </div>
  `;

  // -------- Config --------
  const CFG = {
    storageKey: "tmt.simple.v2",
    durationMs: 120000,      // 2 minutes
    totalTargets: 24,        // 1..12 and A..L
    arenaW: 1000,
    arenaH: 700,
    margin: 80,
    minDist: 70,
    timeoutFinish: true      // auto-finish at 2:00
  };

  // -------- Elements --------
  const el = {
    stage: container.querySelector("#tmtStage"),

    start: container.querySelector("#tmtStart"),
    btnStart: container.querySelector("#tmtBtnStart"),
    btnFullscreen: container.querySelector("#tmtBtnFullscreen"),
    btnReset: container.querySelector("#tmtBtnReset"),

    phasePill: container.querySelector("#tmtPhasePill"),
    timePill: container.querySelector("#tmtTimePill"),
    errPill: container.querySelector("#tmtErrPill"),

    progressWrap: container.querySelector("#tmtProgressWrap"),
    progressBar: container.querySelector("#tmtProgressBar"),

    arena: container.querySelector("#tmtArena"),
    lines: container.querySelector("#tmtLines"),

    results: container.querySelector("#tmtResults"),
    resultsGrid: container.querySelector("#tmtResultsGrid"),
    btnRetry: container.querySelector("#tmtBtnRetry"),
    btnNext: container.querySelector("#tmtBtnNext"),
    latestLine: container.querySelector("#tmtLatestLine")
  };

  // -------- State --------
  const state = {
    nodes: [],
    order: [],
    currentIndex: 0,
    errors: 0,

    running: false,
    tStart: null,
    tEnd: null,
    tickTimer: null,

    correctClicks: [],
    pathLen: 0,

    // capture trial-like events
    events: []
  };

  function now(){ return Date.now(); }
  function nowISO(){ return new Date().toISOString(); }

  function fmtDate(iso){
    try{
      const d = new Date(iso);
      return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch { return iso; }
  }

  function fmtMs(ms){
    const s = ms / 1000;
    return s.toFixed(1) + " s";
  }

  function setPhase(txt, kind){
    el.phasePill.textContent = txt;
    el.phasePill.classList.remove("bad","good");
    if (kind === "bad") el.phasePill.classList.add("bad");
    if (kind === "good") el.phasePill.classList.add("good");
  }

  function showProgress(show){
    el.progressWrap.style.display = show ? "" : "none";
    if (!show) el.progressBar.style.width = "0%";
  }

  function updateTimeAndProgress(){
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

  function requiredOrder(){
    const order = [];
    const n = CFG.totalTargets / 2;
    for (let i=1; i<=n; i++){
      order.push(String(i));
      order.push(String.fromCharCode(64 + i)); // A..L
    }
    return order;
  }

  function distance(a,b){
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function generatePositions(count){
    const pts = [];
    let guard = 0;
    while (pts.length < count && guard < 20000){
      guard++;
      const x = CFG.margin + Math.random()*(CFG.arenaW - 2*CFG.margin);
      const y = CFG.margin + Math.random()*(CFG.arenaH - 2*CFG.margin);

      let ok = true;
      for (const p of pts){
        if (distance(p, {x,y}) < CFG.minDist) { ok = false; break; }
      }
      if (ok) pts.push({x,y});
    }
    // fallback: if placement is tight
    while (pts.length < count){
      pts.push({
        x: CFG.margin + Math.random()*(CFG.arenaW - 2*CFG.margin),
        y: CFG.margin + Math.random()*(CFG.arenaH - 2*CFG.margin)
      });
    }
    return pts;
  }

  function clearArena(){
    el.arena.querySelectorAll(".tmt-node").forEach(n => n.remove());
    el.lines.innerHTML = "";
    state.nodes = [];
    state.correctClicks = [];
    state.pathLen = 0;
  }

  function drawLine(a,b){
    const x1 = (a.x / CFG.arenaW) * 1000;
    const y1 = (a.y / CFG.arenaH) * 700;
    const x2 = (b.x / CFG.arenaW) * 1000;
    const y2 = (b.y / CFG.arenaH) * 700;

    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "rgba(0,0,0,0.35)");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    el.lines.appendChild(line);
  }

  function markActive(){
    state.nodes.forEach(n => n.el.classList.remove("active"));
    const next = state.order[state.currentIndex];
    const node = state.nodes.find(n => n.label === next);
    if (node) node.el.classList.add("active");
  }

  function shuffle(arr){
    const a = arr.slice();
    for (let i=a.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function initLayout(){
    clearArena();

    state.order = requiredOrder();
    const pts = generatePositions(CFG.totalTargets);

    // Random layout: place the labels shuffled
    const labels = shuffle(state.order);

    for (let i=0; i<CFG.totalTargets; i++){
      const label = labels[i];
      const p = pts[i];

      const div = document.createElement("div");
      div.className = "tmt-node";
      div.textContent = label;
      div.style.left = (p.x / CFG.arenaW * 100) + "%";
      div.style.top  = (p.y / CFG.arenaH * 100) + "%";
      div.addEventListener("click", () => onNodeClick(label));

      el.arena.appendChild(div);
      state.nodes.push({ label, x: p.x, y: p.y, el: div });
    }

    markActive();
  }

  function start(){
    // reset run state
    state.running = true;
    state.errors = 0;
    state.currentIndex = 0;
    state.correctClicks = [];
    state.pathLen = 0;
    state.events = [];

    el.errPill.textContent = "Errors: 0";
    el.results.classList.remove("show");
    el.start.classList.add("hidden");

    setPhase("Go", "good");
    showProgress(true);

    state.tStart = now();
    state.tEnd = state.tStart + CFG.durationMs;

    updateTimeAndProgress();
    if (state.tickTimer) clearInterval(state.tickTimer);
    state.tickTimer = setInterval(() => {
      updateTimeAndProgress();
      if (CFG.timeoutFinish && now() >= state.tEnd) finishAndSave("timeout");
    }, 120);
  }

  function finishAndSave(reason){
    if (!state.running) return;

    state.running = false;
    if (state.tickTimer) clearInterval(state.tickTimer);
    state.tickTimer = null;

    showProgress(false);
    setPhase("Done");
    markActive(); // remove highlight if any

    const duration = Math.max(0, now() - state.tStart);
    const completedSteps = Math.max(0, state.currentIndex - 1); // connections done
    const totalSteps = CFG.totalTargets - 1;

    const accuracy = (completedSteps + state.errors) > 0
      ? (completedSteps / (completedSteps + state.errors))
      : null;

    const raw = {
      test: "TMT",
      durationMs: CFG.durationMs,
      completionTime_ms: duration,
      errors_n: state.errors,
      completedTargets_n: state.currentIndex,     // how many targets were correctly clicked
      totalTargets_n: CFG.totalTargets,
      accuracy: (accuracy == null ? null : Number(accuracy.toFixed(3))),
      pathLen_px: Math.round(state.pathLen),
      completedAt: nowISO(),
      reason: reason || "completed",
      events: state.events
    };

    // localStorage
    if (raw.completedTargets_n > 0){
      addSession(raw);
    }

    // battery save
    if (api && typeof api.saveResult === "function"){
      api.saveResult("tmt", {
        completionTime_ms: duration,
        errors_n: state.errors,
        completedTargets_n: state.currentIndex,
        accuracy: (accuracy == null ? null : Number(accuracy.toFixed(3))),
        pathLen_px: Math.round(state.pathLen)
      }, {
        targets_n: CFG.totalTargets,
        duration_s: Math.round(CFG.durationMs / 1000),
        version: "2.0_intuitive",
        raw: raw
      });
    }

    showResults(raw);
  }

  function onNodeClick(label){
    const expected = state.order[state.currentIndex];

    // first click starts the timer
    if (!state.running) start();

    if (!expected) return;

    if (label !== expected){
      state.errors += 1;
      el.errPill.textContent = "Errors: " + state.errors;

      setPhase("Wrong", "bad");
      setTimeout(() => { if (!state.running) return; setPhase("Go", "good"); }, 220);

      state.events.push({ ts: nowISO(), type: "error", clicked: label, expected: expected, index: state.currentIndex });
      return;
    }

    const node = state.nodes.find(n => n.label === label);
    if (!node) return;

    node.el.classList.add("done");
    node.el.classList.remove("active");

    const last = state.correctClicks[state.correctClicks.length - 1];
    if (last){
      drawLine(last, node);
      state.pathLen += distance(last, node);
    }

    state.correctClicks.push(node);
    state.events.push({ ts: nowISO(), type: "correct", clicked: label, index: state.currentIndex });

    state.currentIndex += 1;

    if (state.currentIndex >= state.order.length){
      finishAndSave("completed");
      return;
    }

    markActive();
  }

  // ---------- Storage ----------
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
      // ignore storage errors
    }
  }

  function addSession(session){
    const sessions = loadSessions();
    sessions.unshift(session);
    saveSessions(sessions.slice(0, 200));
  }

  function renderLatestLine(){
    const s = loadSessions()[0] || null;
    if (!s){
      el.latestLine.textContent = "No saved sessions yet.";
      return;
    }
    const pct = (s.accuracy == null) ? "–" : Math.round(s.accuracy * 100) + "%";
    el.latestLine.textContent = `Last session: ${fmtDate(s.completedAt)} • ${pct} • ${s.completedTargets_n}/${s.totalTargets_n} targets`;
  }

  // ---------- Results UI ----------
  function showResults(raw){
    const pct = (raw.accuracy == null) ? "–" : Math.round(raw.accuracy * 100);
    const items = [
      { val: fmtMs(raw.completionTime_ms), label: "Time" },
      { val: raw.completedTargets_n + "/" + raw.totalTargets_n, label: "Targets" },
      { val: raw.errors_n, label: "Errors" },
      { val: (pct === "–" ? "–" : pct), label: "Accuracy (%)" },
      { val: raw.pathLen_px, label: "Path length" },
      { val: "2", label: "Max time (min)" }
    ];

    let html = "";
    for (let i=0; i<items.length; i++){
      const r = items[i];
      html += '<div class="tmt-card">';
      html += '<div class="val">' + r.val + '</div>';
      html += '<div class="lbl">' + r.label + '</div>';
      html += '</div>';
    }
    el.resultsGrid.innerHTML = html;

    renderLatestLine();
    el.results.classList.add("show");
  }

  // ---------- Fullscreen ----------
  function requestFullscreen(){
    const node = el.stage;
    try{
      const fn =
        node.requestFullscreen ||
        node.webkitRequestFullscreen ||
        node.mozRequestFullScreen ||
        node.msRequestFullscreen;
      if (fn) fn.call(node);
    } catch {
      // ignore if blocked
    }
  }

  // ---------- Events ----------
  el.btnStart.addEventListener("click", () => {
    initLayout();
    start();
  });

  el.btnFullscreen.addEventListener("click", requestFullscreen);

  el.btnReset.addEventListener("click", () => {
    if (state.running) return; // avoid mid-run resets
    initLayout();
  });

  el.btnRetry.addEventListener("click", () => {
    el.results.classList.remove("show");
    el.start.classList.remove("hidden");
    setPhase("Ready");
    el.timePill.textContent = "2:00";
    el.errPill.textContent = "Errors: 0";
  });

  el.btnNext.addEventListener("click", () => {
    if (api && typeof api.next === "function") api.next();
  });

  // Init
  (function initUI(){
    initLayout();
    setPhase("Ready");
    el.timePill.textContent = "2:00";
    el.errPill.textContent = "Errors: 0";
    showProgress(false);
  })();

  // Cleanup
  return () => {
    if (state.tickTimer) clearInterval(state.tickTimer);
  };
}
