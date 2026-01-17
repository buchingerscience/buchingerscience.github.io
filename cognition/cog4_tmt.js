// /cognition/cog4_tmtb.js
// Module version of your TMT-B page. Renders into the container as a block.
// Exports: init(container, api)
// - api.saveResult(testId, metrics, extra) is provided by cognition.html
// - api.next() can move to the next test (optional)

export function init(container, api) {
  /********************************************************************
   * UI (block version)
   ********************************************************************/
  container.innerHTML = `
    <style>
      /* Scoped under .tmtb-wrap */
      .tmtb-wrap { --maxw: 1100px; max-width: var(--maxw); margin: 0 auto; padding: 0; box-sizing: border-box; }
      .tmtb-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 10px;
      }
      .tmtb-brand{ font-weight:650; letter-spacing:.2px; }
      .tmtb-muted{ opacity:.78; }
      .tmtb-small{ font-size:12px; }

      .tmtb-pill-row{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }
      .tmtb-pill{
        display:inline-flex; align-items:center; gap:8px;
        padding: 7px 11px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.9);
        font-size: 13px; color: inherit; cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        white-space: nowrap;
      }
      .tmtb-pill:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .tmtb-pill.primary{ background: var(--accent, #5bc2e7); color:#fff; border-color: rgba(0,0,0,0.05); }
      .tmtb-pill.primary:hover{ background:#67c9ea; }
      .tmtb-pill.danger{ background:#fff; border-color: rgba(220,53,69,0.25); }
      .tmtb-pill.danger:hover{ background: rgba(220,53,69,0.06); }

      .tmtb-grid{
        display:grid;
        grid-template-columns: 1.8fr 1fr;
        gap: 10px;
        min-height: 520px;
      }
      @media (max-width: 900px){
        .tmtb-grid{ grid-template-columns: 1fr; min-height:0; }
      }

      .tmtb-card{
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 12px;
        box-sizing: border-box;
        overflow: visible; /* do not trap scroll */
      }

      .tmtb-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .tmtb-row.spread{ justify-content: space-between; }
      .tmtb-status{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; }

      .tmtb-badge{
        padding: 4px 8px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
        white-space: nowrap;
      }
      .tmtb-badge.ok{ border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .tmtb-badge.bad{ border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .tmtb-kv{ display:grid; grid-template-columns: 1fr auto; gap: 6px 10px; font-size: 12.5px; }
      .tmtb-kv div:nth-child(odd){ opacity:.78; }

      .tmtb-arena{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        height: 410px;
        position: relative;
        overflow:hidden;
        user-select:none;
      }
      @media (max-width: 900px){
        .tmtb-arena{ height: 380px; }
      }

      .tmtb-node{
        position:absolute;
        width: 46px; height: 46px;
        border-radius: 999px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.96);
        box-shadow: 0 1px 8px rgba(0,0,0,0.06);
        display:flex; align-items:center; justify-content:center;
        font-weight: 700;
        cursor:pointer;
        transform: translate(-50%, -50%);
        transition: transform .08s ease, box-shadow .12s ease, background-color .12s ease;
        font-size: 15px;
      }
      .tmtb-node:hover{ transform: translate(-50%, -50%) scale(1.03); box-shadow: 0 4px 14px rgba(0,0,0,0.10); }
      .tmtb-node.disabled{ cursor:not-allowed; opacity:.55; }
      .tmtb-node.active{
        border-color: rgba(91,194,231,0.9);
        box-shadow: 0 0 0 4px rgba(91,194,231,0.22), 0 4px 14px rgba(0,0,0,0.10);
      }
      .tmtb-node.done{
        background: rgba(25,135,84,0.10);
        border-color: rgba(25,135,84,0.25);
      }

      svg#tmtb-lines{
        position:absolute; inset:0;
        width:100%; height:100%;
        pointer-events:none;
      }

      .tmtb-hint{
        margin-top: 8px;
        font-size: 12px;
        opacity: .78;
        line-height: 1.25;
      }

      .tmtb-table{ width:100%; border-collapse: collapse; }
      .tmtb-table th, .tmtb-table td{ text-align:left; padding: 7px 6px; border-bottom: 1px solid var(--border, #e9ecef); font-size: 12.5px; }
      .tmtb-table th{ background: rgba(248,249,250,0.9); font-weight: 650; }
      .tmtb-right{ text-align:right; }

      .tmtb-historyBox{
        border:1px solid var(--border, #e9ecef);
        border-radius: 8px;
        overflow:hidden;
        max-height: 210px;
      }

      .tmtb-footnote{ margin-top: 8px; font-size: 11.5px; opacity: .72; line-height: 1.25; }

      .tmtb-tinyBtn{
        padding: 7px 10px;
        border-radius: 8px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.95);
        cursor:pointer;
        font-size: 12.5px;
        transition: transform .12s ease, box-shadow .12s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
      }
      .tmtb-tinyBtn:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .tmtb-tinyBtn:disabled{ opacity:.55; cursor:not-allowed; transform:none; box-shadow:none; }
    </style>

    <div class="tmtb-wrap">
      <div class="tmtb-topbar">
        <div>
          <div class="tmtb-brand">Trail Making Test B</div>
          <div class="tmtb-muted tmtb-small">Connect in order: 1–A–2–B–3–C… Tap the next circle.</div>
        </div>

        <div class="tmtb-pill-row">
          <button id="btnStart" class="tmtb-pill primary" type="button">Start</button>
          <button id="btnFinish" class="tmtb-pill" type="button" title="Finish now and save">Finish</button>
          <button id="btnNew" class="tmtb-pill" type="button">New layout</button>
          <button id="btnReset" class="tmtb-pill danger" type="button" title="Clears your saved history">Reset history</button>
        </div>
      </div>

      <div class="tmtb-grid">
        <!-- Main -->
        <section class="tmtb-card" aria-live="polite">
          <div class="tmtb-row spread">
            <div class="tmtb-status">
              <span class="tmtb-badge" id="badgePhase">Idle</span>
              <span class="tmtb-badge" id="badgeTime">Time: –</span>
              <span class="tmtb-badge" id="badgeErrors">Errors: –</span>
            </div>

            <div class="tmtb-kv" style="min-width:260px;">
              <div>Targets</div><div><span id="targetsLabel">24</span></div>
              <div>Current</div><div><span id="currentLabel">—</span></div>
              <div>Best (today)</div><div><span id="bestLabel">—</span></div>
            </div>
          </div>

          <div style="height:10px;"></div>

          <div class="tmtb-arena" id="arena">
            <svg id="tmtb-lines" viewBox="0 0 1000 700" preserveAspectRatio="none"></svg>
          </div>

          <div class="tmtb-hint">
            Tap the next item. If you tap the wrong one, an error is counted and you must continue with the correct next item.
            The goal is to finish as fast as possible with few errors.
          </div>
        </section>

        <!-- Side -->
        <aside class="tmtb-card">
          <div class="tmtb-row spread" style="margin-bottom:8px;">
            <div>
              <div style="font-weight:650;">Results</div>
              <div class="tmtb-muted tmtb-small">Saved in your browser (localStorage) + saved to battery result.</div>
            </div>
            <div class="tmtb-row" style="gap:8px;">
              <button class="tmtb-tinyBtn" id="btnPractice" type="button">Practice (8)</button>
              <button class="tmtb-tinyBtn" id="btnFull" type="button">Full (24)</button>
            </div>
          </div>

          <div class="tmtb-kv">
            <div>Completion time</div><div id="statTime">–</div>
            <div>Errors</div><div id="statErr">0</div>
            <div>Accuracy</div><div id="statAcc">–</div>
            <div>Path length</div><div id="statPath">–</div>
          </div>

          <div style="height:10px;"></div>

          <div class="tmtb-kv">
            <div>Latest time</div><div id="latestTime">–</div>
            <div>Latest errors</div><div id="latestErr">–</div>
            <div>Last session</div><div id="latestDate">–</div>
          </div>

          <div style="height:10px;"></div>

          <div style="font-weight:650; font-size:12.5px; margin-bottom:6px;">History</div>
          <div class="tmtb-historyBox">
            <table class="tmtb-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th class="tmtb-right">Time</th>
                  <th class="tmtb-right">Err</th>
                </tr>
              </thead>
              <tbody id="historyBody">
                <tr><td colspan="3" class="tmtb-muted">No sessions yet.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="tmtb-footnote">
            This is a simplified digital TMT-B. Useful for repeated within-person tracking.
            Keep the same device and screen size for comparisons.
          </div>
        </aside>
      </div>
    </div>
  `;

  /********************************************************************
   * Logic (adapted from your original script; module-safe + battery save)
   ********************************************************************/
  const CONFIG = {
    storageKey: "tmtb.v1",
    arenaW: 1000,
    arenaH: 700,
    nodeSizePx: 46,
    minDist: 72,
    margin: 70,
    maxAttempts: 12000
  };

  const el = {
    btnStart: container.querySelector("#btnStart"),
    btnFinish: container.querySelector("#btnFinish"),
    btnNew: container.querySelector("#btnNew"),
    btnReset: container.querySelector("#btnReset"),

    btnPractice: container.querySelector("#btnPractice"),
    btnFull: container.querySelector("#btnFull"),

    badgePhase: container.querySelector("#badgePhase"),
    badgeTime: container.querySelector("#badgeTime"),
    badgeErrors: container.querySelector("#badgeErrors"),

    targetsLabel: container.querySelector("#targetsLabel"),
    currentLabel: container.querySelector("#currentLabel"),
    bestLabel: container.querySelector("#bestLabel"),

    statTime: container.querySelector("#statTime"),
    statErr: container.querySelector("#statErr"),
    statAcc: container.querySelector("#statAcc"),
    statPath: container.querySelector("#statPath"),

    latestTime: container.querySelector("#latestTime"),
    latestErr: container.querySelector("#latestErr"),
    latestDate: container.querySelector("#latestDate"),
    historyBody: container.querySelector("#historyBody"),

    arena: container.querySelector("#arena"),
    lines: container.querySelector("#tmtb-lines")
  };

  const state = {
    running: false,
    mode: "full", // practice | full
    totalTargets: 24,

    nodes: [],     // {id,label,x,y,el}
    order: [],     // required labels in order
    currentIndex: 0,
    errors: 0,

    tStart: null,
    timer: null,
    correctClicks: [], // {x,y,label,t}
    pathLen: 0
  };

  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
    } catch { return iso; }
  }

  function fmtMs(ms) {
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)} s`;
    const m = Math.floor(s / 60);
    const r = s - m*60;
    return `${m}:${String(Math.floor(r)).padStart(2,"0")} (${s.toFixed(1)} s)`;
  }

  function setBadge(node, text, kind=null) {
    node.textContent = text;
    node.classList.remove("ok","bad");
    if (kind) node.classList.add(kind);
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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
    renderBestToday();
  }

  function renderLatest() {
    const sessions = loadSessions();
    const s = sessions[0] || null;
    el.latestTime.textContent = s ? fmtMs(s.durationMs) : "–";
    el.latestErr.textContent = s ? String(s.errors) : "–";
    el.latestDate.textContent = s ? fmtDate(s.completedAt) : "–";
  }

  function renderBestToday() {
    const sessions = loadSessions().filter(s => s.dayKey === todayKey() && s.mode === state.mode);
    if (!sessions.length) { el.bestLabel.textContent = "—"; return; }
    const best = sessions.reduce((a,b) => (a.durationMs < b.durationMs ? a : b));
    el.bestLabel.textContent = fmtMs(best.durationMs);
  }

  function renderHistory() {
    const sessions = loadSessions().filter(s => s.mode === state.mode);
    const body = el.historyBody;
    body.innerHTML = "";
    if (!sessions.length) {
      body.innerHTML = '<tr><td colspan="3" class="tmtb-muted">No sessions yet.</td></tr>';
      return;
    }
    for (const s of sessions.slice(0, 6)) {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = fmtDate(s.completedAt);

      const tdTime = document.createElement("td");
      tdTime.className = "tmtb-right";
      tdTime.textContent = fmtMs(s.durationMs);

      const tdErr = document.createElement("td");
      tdErr.className = "tmtb-right";
      tdErr.textContent = String(s.errors);

      tr.appendChild(tdDate);
      tr.appendChild(tdTime);
      tr.appendChild(tdErr);
      body.appendChild(tr);
    }
  }

  function setMode(mode) {
    state.mode = mode;
    state.totalTargets = (mode === "practice") ? 8 : 24;
    el.targetsLabel.textContent = String(state.totalTargets);
    stopToIdle(true);
    newLayout();
    renderHistory();
    renderLatest();
    renderBestToday();
  }

  function requiredOrder(nTargets) {
    const pairs = nTargets / 2;
    const order = [];
    for (let i=1; i<=pairs; i++) {
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
        if ((dx*dx + dy*dy) < (CONFIG.minDist*CONFIG.minDist)) { ok = false; break; }
      }
      if (ok) pts.push({x,y});
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

  function newLayout() {
    clearArena();

    state.order = requiredOrder(state.totalTargets);

    const pts = generatePositions(state.totalTargets);
    const labels = state.order.slice();
    const shuffled = labels.slice().sort(() => Math.random() - 0.5);

    const nodes = [];
    for (let i=0; i<state.totalTargets; i++) {
      const label = shuffled[i];
      const p = pts[i];

      const div = document.createElement("div");
      div.className = "tmtb-node";
      div.textContent = label;
      div.style.left = (p.x / CONFIG.arenaW * 100) + "%";
      div.style.top  = (p.y / CONFIG.arenaH * 100) + "%";
      div.setAttribute("data-label", label);

      div.addEventListener("click", () => onNodeClick(label));

      el.arena.appendChild(div);

      nodes.push({ id: i, label, x: p.x, y: p.y, el: div });
    }

    state.nodes = nodes;

    state.currentIndex = 0;
    state.errors = 0;
    state.correctClicks = [];
    state.pathLen = 0;

    updateUIIdle();
    markActiveTarget();
  }

  function getNodeByLabel(label) {
    return state.nodes.find(n => n.label === label);
  }

  function markActiveTarget() {
    state.nodes.forEach(n => n.el.classList.remove("active"));
    const next = state.order[state.currentIndex];
    const node = getNodeByLabel(next);
    if (node) node.el.classList.add("active");
    el.currentLabel.textContent = next || "—";
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
    line.setAttribute("stroke", "rgba(0,0,0,0.38)");
    line.setAttribute("stroke-width", "3");
    line.setAttribute("stroke-linecap", "round");
    el.lines.appendChild(line);
  }

  function startTest() {
    if (state.running) return;

    state.running = true;
    state.tStart = now();
    setBadge(el.badgePhase, "Running", "ok");
    el.btnStart.textContent = "Restart";

    state.timer = setInterval(() => {
      const t = now() - state.tStart;
      setBadge(el.badgeTime, "Time: " + fmtMs(t));
    }, 100);

    setBadge(el.badgeErrors, "Errors: " + state.errors);
    markActiveTarget();
  }

  function stopToIdle(keepLayout=false) {
    state.running = false;
    if (state.timer) clearInterval(state.timer);
    state.timer = null;

    el.btnStart.textContent = "Start";

    if (!keepLayout) newLayout();
    updateUIIdle();
  }

  function updateUIIdle() {
    setBadge(el.badgePhase, "Idle");
    setBadge(el.badgeTime, "Time: –");
    setBadge(el.badgeErrors, "Errors: " + state.errors);

    el.statTime.textContent = "–";
    el.statErr.textContent = String(state.errors);
    el.statAcc.textContent = "–";
    el.statPath.textContent = "–";

    el.currentLabel.textContent = state.order[state.currentIndex] || "—";
  }

  function computeAccuracy() {
    const totalClicks = state.totalTargets - 1; // correct transitions
    return totalClicks >= 0 ? Math.max(0, (totalClicks) / (totalClicks + state.errors)) : 0;
  }

  function finishTest(saveToBattery=true) {
    if (!state.running) return;

    state.running = false;
    if (state.timer) clearInterval(state.timer);
    state.timer = null;

    const durationMs = now() - state.tStart;
    const acc = computeAccuracy();

    setBadge(el.badgePhase, "Done");
    setBadge(el.badgeTime, "Time: " + fmtMs(durationMs));
    setBadge(el.badgeErrors, "Errors: " + state.errors);

    el.statTime.textContent = fmtMs(durationMs);
    el.statErr.textContent = String(state.errors);
    el.statAcc.textContent = `${Math.round(acc * 100)}%`;
    el.statPath.textContent = state.pathLen ? `${Math.round(state.pathLen)} px` : "–";

    const session = {
      test: "TMT-B",
      mode: state.mode,
      totalTargets: state.totalTargets,
      durationMs,
      errors: state.errors,
      accuracy: acc,
      pathLenPx: Math.round(state.pathLen || 0),
      completedAt: nowISO(),
      dayKey: todayKey(),
      layout: state.nodes.map(n => ({ label:n.label, x:n.x, y:n.y })),
      order: state.order.slice()
    };
    addSession(session);

    // mark all done visually
    state.nodes.forEach(n => n.el.classList.add("done"));
    state.nodes.forEach(n => n.el.classList.remove("active"));

    el.btnStart.textContent = "Start";

    if (saveToBattery) {
      api.saveResult("tmtb", {
        completionTime_ms: durationMs,
        errors_n: state.errors,
        accuracy: Number(acc.toFixed(3)),
        pathLen_px: Math.round(state.pathLen || 0)
      }, {
        mode: state.mode,
        targets_n: state.totalTargets,
        version: "1.0",
        raw: session
      });
      // api.next();
    }
  }

  function onNodeClick(label) {
    // allow first click to start
    if (!state.running) startTest();

    const expected = state.order[state.currentIndex];
    if (!expected) return;

    if (label !== expected) {
      state.errors += 1;
      setBadge(el.badgeErrors, "Errors: " + state.errors, "bad");
      setTimeout(() => setBadge(el.badgeErrors, "Errors: " + state.errors), 280);
      return;
    }

    const node = getNodeByLabel(label);
    if (!node) return;

    node.el.classList.add("done");
    node.el.classList.remove("active");

    const t = now() - state.tStart;
    const last = state.correctClicks[state.correctClicks.length - 1];

    if (last) {
      const a = { x: last.x, y: last.y };
      const b = { x: node.x, y: node.y };
      drawLine(a, b);
      state.pathLen += distance(a, b);
    }

    state.correctClicks.push({ x: node.x, y: node.y, label, t });

    state.currentIndex += 1;
    setBadge(el.badgeErrors, "Errors: " + state.errors);

    if (state.currentIndex >= state.order.length) {
      finishTest(true);
      return;
    }
    markActiveTarget();
  }

  // ===== Events (scoped) =====
  el.btnStart.addEventListener("click", () => {
    // restart with same layout
    stopToIdle(true);
    startTest();
  });

  el.btnFinish.addEventListener("click", () => {
    if (state.running) finishTest(true);
    else api.saveResult("tmtb", { note: "Finished without run" }, { version: "1.0" });
  });

  el.btnNew.addEventListener("click", () => {
    stopToIdle(true);
    newLayout();
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CONFIG.storageKey);
    renderHistory();
    renderLatest();
    renderBestToday();
    el.bestLabel.textContent = "—";
    el.latestTime.textContent = "–";
    el.latestErr.textContent = "–";
    el.latestDate.textContent = "–";
  });

  el.btnPractice.addEventListener("click", () => setMode("practice"));
  el.btnFull.addEventListener("click", () => setMode("full"));

  // Init
  (function initUI() {
    setMode("full");
    renderHistory();
    renderLatest();
    renderBestToday();
  })();

  // Cleanup if parent swaps modules
  return () => {
    if (state.timer) clearInterval(state.timer);
  };
}
