// cog4_tmtb.js - Trail Making Test B (simplified)
// Minimal, lay-friendly, single page.
// Exports: init(container, api)

export function init(container, api) {

  // ---------- UI ----------
  container.innerHTML = `
    <style>
      .tmtb-wrap{
        max-width: 780px;
        margin: 0 auto;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        color: #2D2A26;
      }

      .tmtb-card{
        background: #F5F3F0;
        border: 1px solid #E8E4DF;
        border-radius: 20px;
        padding: 16px;
        overflow: hidden;
      }
      @media(max-width:600px){ .tmtb-card{ border-radius:16px; } }

      .tmtb-top{
        display:flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }

      .tmtb-title{
        font-size: 22px;
        font-weight: 800;
        letter-spacing: -0.3px;
      }
      .tmtb-sub{
        margin-top: 4px;
        font-size: 14px;
        color: #8A857E;
        line-height: 1.5;
        max-width: 520px;
      }

      .tmtb-pillrow{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
      .tmtb-pill{
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(0,0,0,0.06);
        font-size: 13px;
        font-weight: 700;
        color: #8A857E;
        font-variant-numeric: tabular-nums;
      }
      .tmtb-pill.strong{ color:#2D2A26; }

      .tmtb-btnrow{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 10px; }
      .tmtb-btn-primary{
        padding: 12px 22px;
        border-radius: 999px;
        border: none;
        background: #4A90D9;
        color: #fff;
        font-family: inherit;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .tmtb-btn-primary:hover{ background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.28); }

      .tmtb-btn-secondary{
        padding: 12px 18px;
        border-radius: 999px;
        border: 1px solid #E8E4DF;
        background: #fff;
        color: #2D2A26;
        font-family: inherit;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .tmtb-btn-secondary:hover{ background:#F5F3F0; transform:translateY(-1px); }

      .tmtb-arena{
        margin-top: 12px;
        position: relative;
        height: 440px;
        border-radius: 16px;
        border: 1px solid #E8E4DF;
        background: linear-gradient(180deg, rgba(248,249,250,0.9), rgba(255,255,255,0.9));
        overflow: hidden;
        user-select: none;
      }
      @media(max-width:600px){ .tmtb-arena{ height: 380px; } }

      svg#tmtbLines{
        position:absolute; inset:0;
        width:100%; height:100%;
        pointer-events:none;
      }

      .tmtb-node{
        position:absolute;
        width: 46px; height: 46px;
        border-radius: 999px;
        border: 1px solid #E8E4DF;
        background: rgba(255,255,255,0.96);
        box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        display:flex; align-items:center; justify-content:center;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: transform .08s ease, box-shadow .12s ease, background-color .12s ease, border-color .12s ease;
      }
      .tmtb-node:hover{ transform: translate(-50%, -50%) scale(1.03); box-shadow: 0 4px 14px rgba(0,0,0,0.10); }
      .tmtb-node.active{
        border-color: rgba(74,144,217,0.95);
        box-shadow: 0 0 0 4px rgba(74,144,217,0.18), 0 4px 14px rgba(0,0,0,0.10);
      }
      .tmtb-node.done{
        background: rgba(59,155,109,0.10);
        border-color: rgba(59,155,109,0.22);
        cursor: default;
      }

      .tmtb-start{
        display:flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 22px 12px;
        text-align: center;
      }

      .tmtb-start-hint{
        font-size: 14px;
        color: #8A857E;
        line-height: 1.5;
        max-width: 520px;
      }

      .tmtb-feedback{
        margin-top: 10px;
        display:none;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid #E8E4DF;
        background: rgba(255,255,255,0.7);
        font-size: 13px;
        color: #8A857E;
      }
      .tmtb-feedback.show{ display:block; }

      .tmtb-results{
        display:none;
        margin-top: 12px;
        padding: 14px;
        border-radius: 16px;
        border: 1px solid #E8E4DF;
        background: rgba(255,255,255,0.75);
      }
      .tmtb-results.show{ display:block; }

      .tmtb-results-title{
        font-size: 16px;
        font-weight: 900;
        margin-bottom: 8px;
      }
      .tmtb-results-grid{
        display:grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      @media(max-width:520px){ .tmtb-results-grid{ grid-template-columns: repeat(2, 1fr); } }

      .tmtb-result-card{
        background:#F5F3F0;
        border-radius: 12px;
        padding: 12px 10px;
        text-align:center;
      }
      .tmtb-result-card .val{
        font-size: 18px;
        font-weight: 900;
      }
      .tmtb-result-card .lbl{
        margin-top: 4px;
        font-size: 11px;
        color:#8A857E;
        font-weight: 800;
      }
    </style>

    <div class="tmtb-wrap">
      <div class="tmtb-card">

        <div id="tmtbStart" class="tmtb-start">
          <div class="tmtb-title">Connecting Circles</div>
          <div class="tmtb-start-hint">
            Tap the circles in order: <strong>1 → A → 2 → B → 3 → C</strong>… until the end.
            <br/>Go quickly, but stay accurate.
          </div>
          <button id="btnStart" class="tmtb-btn-primary" type="button">Start</button>
        </div>

        <div id="tmtbMain" style="display:none;">
          <div class="tmtb-top">
            <div>
              <div class="tmtb-title" style="font-size:20px;">Trail Making (B)</div>
              <div class="tmtb-sub">Next target: <strong id="nextLabel">—</strong></div>
            </div>

            <div class="tmtb-pillrow">
              <div class="tmtb-pill strong" id="pillTime">Time: 0.0 s</div>
              <div class="tmtb-pill" id="pillErrors">Errors: 0</div>
            </div>

            <div class="tmtb-btnrow">
              <button id="btnNew" class="tmtb-btn-secondary" type="button">New layout</button>
              <button id="btnFinish" class="tmtb-btn-secondary" type="button">Finish</button>
            </div>
          </div>

          <div class="tmtb-arena" id="arena">
            <svg id="tmtbLines" viewBox="0 0 1000 700" preserveAspectRatio="none"></svg>
          </div>

          <div id="feedback" class="tmtb-feedback"></div>

          <div id="results" class="tmtb-results">
            <div class="tmtb-results-title">Result</div>
            <div class="tmtb-results-grid" id="resultsGrid"></div>
            <div class="tmtb-btnrow" style="justify-content:center; margin-top:12px;">
              <button id="btnRetry" class="tmtb-btn-secondary" type="button">Try again</button>
              <button id="btnNext" class="tmtb-btn-primary" type="button">Next test →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // ---------- Config ----------
  const CONFIG = {
    arenaW: 1000,
    arenaH: 700,
    totalTargets: 24,   // simplified: always 24
    nodeSizePx: 46,
    minDist: 72,
    margin: 70,
    maxAttempts: 12000
  };

  // ---------- Elements ----------
  const el = {
    start: container.querySelector("#tmtbStart"),
    main: container.querySelector("#tmtbMain"),

    btnStart: container.querySelector("#btnStart"),
    btnNew: container.querySelector("#btnNew"),
    btnFinish: container.querySelector("#btnFinish"),
    btnRetry: container.querySelector("#btnRetry"),
    btnNext: container.querySelector("#btnNext"),

    pillTime: container.querySelector("#pillTime"),
    pillErrors: container.querySelector("#pillErrors"),
    nextLabel: container.querySelector("#nextLabel"),

    arena: container.querySelector("#arena"),
    lines: container.querySelector("#tmtbLines"),

    feedback: container.querySelector("#feedback"),
    results: container.querySelector("#results"),
    resultsGrid: container.querySelector("#resultsGrid"),
  };

  // ---------- State ----------
  const state = {
    running: false,
    order: [],
    nodes: [],            // {label,x,y,el}
    currentIndex: 0,
    errors: 0,
    tStart: null,
    timer: null,
    correctClicks: [],    // {x,y,label,t}
    pathLen: 0
  };

  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  function fmtMs(ms) {
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)} s`;
    const m = Math.floor(s / 60);
    const r = s - m*60;
    return `${m}:${String(Math.floor(r)).padStart(2,"0")} (${s.toFixed(1)} s)`;
  }

  function showFeedback(msg) {
    el.feedback.textContent = msg;
    el.feedback.classList.add("show");
    setTimeout(() => el.feedback.classList.remove("show"), 650);
  }

  function requiredOrder(nTargets) {
    const pairs = nTargets / 2; // 24 => 12 pairs: 1-A ... 12-L
    const order = [];
    for (let i = 1; i <= pairs; i++) {
      order.push(String(i));
      order.push(String.fromCharCode(64 + i)); // A=65
    }
    return order;
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function generatePositions(count) {
    const pts = [];
    let attempts = 0;

    while (pts.length < count && attempts < CONFIG.maxAttempts) {
      attempts++;
      const x = CONFIG.margin + Math.random() * (CONFIG.arenaW - 2*CONFIG.margin);
      const y = CONFIG.margin + Math.random() * (CONFIG.arenaH - 2*CONFIG.margin);

      let ok = true;
      for (const p of pts) {
        const dx = p.x - x, dy = p.y - y;
        if ((dx*dx + dy*dy) < (CONFIG.minDist * CONFIG.minDist)) { ok = false; break; }
      }
      if (ok) pts.push({ x, y });
    }

    while (pts.length < count) {
      pts.push({
        x: CONFIG.margin + Math.random() * (CONFIG.arenaW - 2*CONFIG.margin),
        y: CONFIG.margin + Math.random() * (CONFIG.arenaH - 2*CONFIG.margin)
      });
    }

    return pts;
  }

  function clearArena() {
    el.arena.querySelectorAll(".tmtb-node").forEach(n => n.remove());
    el.lines.innerHTML = "";
    state.nodes = [];
  }

  function drawLine(a, b) {
    const x1 = a.x / CONFIG.arenaW * 1000;
    const y1 = a.y / CONFIG.arenaH * 700;
    const x2 = b.x / CONFIG.arenaW * 1000;
    const y2 = b.y / CONFIG.arenaH * 700;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "rgba(0,0,0,0.35)");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    el.lines.appendChild(line);
  }

  function getNodeByLabel(label) {
    return state.nodes.find(n => n.label === label);
  }

  function markActiveTarget() {
    state.nodes.forEach(n => n.el.classList.remove("active"));
    const next = state.order[state.currentIndex];
    const node = getNodeByLabel(next);
    if (node) node.el.classList.add("active");
    el.nextLabel.textContent = next || "—";
  }

  function newLayout() {
    clearArena();

    state.order = requiredOrder(CONFIG.totalTargets);
    const pts = generatePositions(CONFIG.totalTargets);

    // Place labels randomly, but keep the required order list for the logic.
    const labels = state.order.slice().sort(() => Math.random() - 0.5);

    const nodes = [];
    for (let i = 0; i < CONFIG.totalTargets; i++) {
      const label = labels[i];
      const p = pts[i];

      const div = document.createElement("div");
      div.className = "tmtb-node";
      div.textContent = label;

      div.style.left = (p.x / CONFIG.arenaW * 100) + "%";
      div.style.top  = (p.y / CONFIG.arenaH * 100) + "%";

      div.addEventListener("click", () => onNodeClick(label));

      el.arena.appendChild(div);
      nodes.push({ label, x: p.x, y: p.y, el: div });
    }

    state.nodes = nodes;
    resetRunState(false);
    markActiveTarget();
  }

  function resetRunState(keepLayout=true) {
    state.running = false;
    state.currentIndex = 0;
    state.errors = 0;
    state.tStart = null;
    state.correctClicks = [];
    state.pathLen = 0;

    if (state.timer) clearInterval(state.timer);
    state.timer = null;

    el.pillTime.textContent = "Time: 0.0 s";
    el.pillErrors.textContent = "Errors: 0";
    el.results.classList.remove("show");

    // clear visuals
    if (!keepLayout) newLayout();
    else {
      el.lines.innerHTML = "";
      state.nodes.forEach(n => {
        n.el.classList.remove("done", "active");
      });
    }
  }

  function startTest() {
    if (state.running) return;
    state.running = true;
    state.tStart = now();

    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      const t = now() - state.tStart;
      el.pillTime.textContent = "Time: " + fmtMs(t);
    }, 100);

    markActiveTarget();
  }

  function finishTest(saveToBattery=true) {
    if (!state.tStart) return;

    state.running = false;
    if (state.timer) clearInterval(state.timer);
    state.timer = null;

    const durationMs = now() - state.tStart;

    const totalCorrect = state.order.length;          // number of correct taps needed
    const acc = totalCorrect / (totalCorrect + state.errors);

    // Save
    const raw = {
      test: "TMT-B",
      totalTargets: CONFIG.totalTargets,
      durationMs,
      errors: state.errors,
      accuracy: acc,
      pathLenPx: Math.round(state.pathLen || 0),
      completedAt: nowISO(),
      layout: state.nodes.map(n => ({ label: n.label, x: n.x, y: n.y })),
      order: state.order.slice()
    };

    if (saveToBattery) {
      api.saveResult("tmtb", {
        completionTime_ms: durationMs,
        errors_n: state.errors,
        accuracy_pct: Math.round(acc * 100)
      }, {
        targets_n: CONFIG.totalTargets,
        version: "2.0",
        raw
      });
    }

    showResultsUI(durationMs, state.errors, acc);
    state.nodes.forEach(n => n.el.classList.remove("active"));
  }

  function showResultsUI(durationMs, errors, acc) {
    const items = [
      { val: fmtMs(durationMs), lbl: "Time" },
      { val: String(errors), lbl: "Errors" },
      { val: `${Math.round(acc * 100)}%`, lbl: "Accuracy" }
    ];

    let html = "";
    for (const it of items) {
      html += `<div class="tmtb-result-card"><div class="val">${it.val}</div><div class="lbl">${it.lbl}</div></div>`;
    }
    el.resultsGrid.innerHTML = html;
    el.results.classList.add("show");
  }

  function onNodeClick(label) {
    // Allow first click to start the timer (keeps it intuitive)
    if (!state.running) startTest();

    const expected = state.order[state.currentIndex];
    if (!expected) return;

    if (label !== expected) {
      state.errors += 1;
      el.pillErrors.textContent = "Errors: " + state.errors;
      showFeedback("Wrong circle. Continue with: " + expected);
      return;
    }

    const node = getNodeByLabel(label);
    if (!node) return;

    node.el.classList.add("done");
    node.el.classList.remove("active");

    const last = state.correctClicks[state.correctClicks.length - 1];
    if (last) {
      const a = { x: last.x, y: last.y };
      const b = { x: node.x, y: node.y };
      drawLine(a, b);
      state.pathLen += distance(a, b);
    }

    state.correctClicks.push({ x: node.x, y: node.y, label, t: now() - state.tStart });
    state.currentIndex += 1;

    el.pillErrors.textContent = "Errors: " + state.errors;

    if (state.currentIndex >= state.order.length) {
      finishTest(true);
      return;
    }

    markActiveTarget();
  }

  // ---------- Events ----------
  el.btnStart.addEventListener("click", () => {
    el.start.style.display = "none";
    el.main.style.display = "block";
    newLayout();
    // do not auto-start; start on first tap
  });

  el.btnNew.addEventListener("click", () => {
    // keep it simple: new layout resets run
    resetRunState(false);
  });

  el.btnFinish.addEventListener("click", () => {
    if (!state.tStart) {
      // never started
      api.saveResult("tmtb", { note: "Finished without run" }, { version: "2.0" });
      showFeedback("Start first, then finish.");
      return;
    }
    finishTest(true);
  });

  el.btnRetry.addEventListener("click", () => {
    el.results.classList.remove("show");
    resetRunState(true);
    markActiveTarget();
  });

  el.btnNext.addEventListener("click", () => api.next());

  // ---------- Init ----------
  // Keep the start screen shown. Create a layout only once user starts.
  // Cleanup if parent swaps modules
  return () => {
    if (state.timer) clearInterval(state.timer);
  };
}
