// /cognition/cog1_pvt.js
// Module version of your PVT page. Renders into the container as a block.
// Exports: init(container, api)
// - api.saveResult(testId, metrics, extra) is provided by cognition.html
// - api.next() can move to the next test (optional)

export function init(container, api) {
  /********************************************************************
   * UI (block version)
   ********************************************************************/
  container.innerHTML = `
    <style>
      /* Scoped-ish: keep selectors under .pvt-wrap to avoid leaking */
      .pvt-wrap { --maxw: 1100px; max-width: var(--maxw); margin: 0 auto; padding: 0; box-sizing: border-box; }
      .pvt-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        background: rgba(248,249,250,0.85); backdrop-filter: blur(10px);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        padding: 8px 10px;
        margin-bottom: 10px;
      }
      .pvt-brand{ font-weight:650; letter-spacing:.2px; }
      .pvt-muted{ opacity:.78; }
      .pvt-small{ font-size:12px; }

      .pvt-pill-row{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; justify-content:flex-end; }
      .pvt-pill{
        display:inline-flex; align-items:center; gap:8px;
        padding: 7px 11px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(255,255,255,0.9);
        font-size: 13px; color: inherit; cursor: pointer;
        transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
        box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        white-space: nowrap;
      }
      .pvt-pill:hover{ transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
      .pvt-pill.primary{ background: var(--accent, #5bc2e7); color:#fff; border-color: rgba(0,0,0,0.05); }
      .pvt-pill.primary:hover{ background:#67c9ea; }
      .pvt-pill.danger{ background:#fff; border-color: rgba(220,53,69,0.25); }
      .pvt-pill.danger:hover{ background: rgba(220,53,69,0.06); }

      .pvt-grid{
        display:grid;
        grid-template-columns: 1.7fr 1fr;
        gap: 10px;
        min-height: 520px;
      }
      @media (max-width: 900px){
        .pvt-grid{ grid-template-columns: 1fr; min-height:0; }
      }

      .pvt-card{
        background: rgba(255,255,255,0.95);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        box-shadow: 0 2px 14px rgba(0,0,0,0.05);
        padding: 12px;
        box-sizing: border-box;
        overflow: hidden;
      }

      .pvt-row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .pvt-row.spread{ justify-content: space-between; }

      .pvt-status{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:12px; }
      .pvt-badge{
        padding: 4px 8px; border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.9);
        white-space: nowrap;
      }
      .pvt-badge.ok{ border-color: rgba(25,135,84,0.25); background: rgba(25,135,84,0.08); }
      .pvt-badge.bad{ border-color: rgba(220,53,69,0.25); background: rgba(220,53,69,0.08); }

      .pvt-kv{ display:grid; grid-template-columns: 1fr auto; gap: 6px 10px; font-size: 12.5px; }
      .pvt-kv div:nth-child(odd){ opacity:.78; }

      .pvt-progress{
        height: 9px; border-radius: 999px;
        background: rgba(222,226,230,0.7);
        overflow: hidden;
        border: 1px solid var(--border, #e9ecef);
        margin-top: 8px;
      }
      .pvt-bar{
        height: 100%;
        width: 0%;
        background: var(--accent, #5bc2e7);
        transition: width .12s linear;
      }

      .pvt-stage{
        border: 1px solid var(--border, #e9ecef);
        border-radius: 8px;
        background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(255,255,255,0.95));
        height: 410px;
        position: relative;
        overflow:hidden;
        user-select:none;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
        cursor: pointer;
      }
      @media (max-width: 900px){
        .pvt-stage{ height: 380px; }
      }

      .pvt-centerBox{
        width: min(520px, 92%);
        border: 1px solid var(--border, #e9ecef);
        border-radius: 12px;
        background: rgba(255,255,255,0.94);
        box-shadow: 0 2px 18px rgba(0,0,0,0.06);
        padding: 18px 16px;
      }

      .pvt-big{
        font-size: 72px;
        font-weight: 800;
        letter-spacing: 1px;
        line-height: 1;
        margin: 0;
      }
      .pvt-sub{
        margin-top: 10px;
        font-size: 13px;
        opacity: .75;
        line-height: 1.25;
      }

      .pvt-tapHint{
        margin-top: 10px;
        display:inline-flex;
        gap: 8px;
        align-items:center;
        justify-content:center;
        padding: 7px 10px;
        border-radius: 16px;
        border: 1px solid var(--border, #e9ecef);
        background: rgba(248,249,250,0.95);
        font-size: 12.5px;
        opacity: .95;
      }

      .pvt-footnote{ margin-top: 8px; font-size: 11.5px; opacity: .72; line-height: 1.25; }

      .pvt-historyBox{
        border:1px solid var(--border, #e9ecef);
        border-radius: 8px;
        overflow:hidden;
        max-height: 210px;
      }
      .pvt-table{ width:100%; border-collapse: collapse; }
      .pvt-table th, .pvt-table td{ text-align:left; padding: 7px 6px; border-bottom: 1px solid var(--border, #e9ecef); font-size: 12.5px; }
      .pvt-table th{ background: rgba(248,249,250,0.9); font-weight: 650; }
      .pvt-right{ text-align:right; }

      /* Better embedding: avoid trapping scroll */
      .pvt-wrap, .pvt-card { overflow: visible; }
    </style>

    <div class="pvt-wrap">
      <div class="pvt-topbar">
        <div>
          <div class="pvt-brand">Psychomotor Vigilance Task</div>
          <div class="pvt-muted pvt-small">5 minutes. Tap as soon as the counter appears. (Spacebar also works.)</div>
        </div>

        <div class="pvt-pill-row">
          <button id="btnStart" class="pvt-pill primary" type="button">Start</button>
          <button id="btnFinish" class="pvt-pill" type="button" title="Ends now and saves result">Finish</button>
          <button id="btnReset" class="pvt-pill danger" type="button" title="Clears your saved history">Reset history</button>
        </div>
      </div>

      <div class="pvt-grid">
        <!-- Main -->
        <section class="pvt-card" aria-live="polite">
          <div class="pvt-row spread">
            <div class="pvt-status">
              <span class="pvt-badge" id="badgePhase">Idle</span>
              <span class="pvt-badge" id="badgeTime">Time: –</span>
              <span class="pvt-badge" id="badgeLast">Last RT: –</span>
            </div>

            <div class="pvt-kv" style="min-width:260px;">
              <div>Duration</div><div>300 s</div>
              <div>ISI range</div><div><span id="isiLabel">2–10</span> s</div>
              <div>Lapse threshold</div><div><span id="lapseLabel">500</span> ms</div>
            </div>
          </div>

          <div class="pvt-progress"><div class="pvt-bar" id="timeBar"></div></div>

          <div style="height:10px;"></div>

          <div class="pvt-stage" id="stage" aria-label="PVT stage">
            <div class="pvt-centerBox">
              <div class="pvt-big" id="display">—</div>
              <div class="pvt-tapHint" id="tapHint">Tap screen or press Space</div>
              <div class="pvt-sub" id="subtext">
                Wait. When numbers appear, react as fast as you can.
                Do not tap before the numbers (false start).
              </div>
            </div>
          </div>

          <div class="pvt-footnote">
            Outputs: mean/median RT, lapses (≥ threshold), false starts, fastest 10%, slowest 10%.
            This is an app-style PVT for within-person tracking.
          </div>
        </section>

        <!-- Side -->
        <aside class="pvt-card">
          <div class="pvt-row spread" style="margin-bottom:8px;">
            <div>
              <div style="font-weight:650;">Session</div>
              <div class="pvt-muted pvt-small">Saved in your browser (localStorage) + saved to battery result.</div>
            </div>
            <div class="pvt-row" style="gap:8px;">
              <select id="isiSelect" aria-label="ISI range">
                <option value="2,10" selected>2–10 s</option>
                <option value="2,6">2–6 s</option>
                <option value="3,12">3–12 s</option>
              </select>
              <select id="lapseSelect" aria-label="Lapse threshold">
                <option value="355">355 ms</option>
                <option value="500" selected>500 ms</option>
                <option value="700">700 ms</option>
              </select>
            </div>
          </div>

          <div class="pvt-kv">
            <div>Trials</div><div id="statTrials">0</div>
            <div>Median RT</div><div id="statMed">–</div>
            <div>Mean RT</div><div id="statMean">–</div>
            <div>Lapses</div><div id="statLapses">0</div>
            <div>False starts</div><div id="statFalse">0</div>
            <div>Fastest 10%</div><div id="statFast">–</div>
            <div>Slowest 10%</div><div id="statSlow">–</div>
          </div>

          <div style="height:10px;"></div>

          <div class="pvt-kv">
            <div>Latest median</div><div id="latestMed">–</div>
            <div>Latest lapses</div><div id="latestLapses">–</div>
            <div>Last session</div><div id="latestDate">–</div>
          </div>

          <div style="height:10px;"></div>

          <div style="font-weight:650; font-size:12.5px; margin-bottom:6px;">History</div>
          <div class="pvt-historyBox">
            <table class="pvt-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th class="pvt-right">Med</th>
                  <th class="pvt-right">Lapses</th>
                </tr>
              </thead>
              <tbody id="historyBody">
                <tr><td colspan="3" class="pvt-muted">No sessions yet.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="pvt-footnote">
            Tip: do it seated, same device, same time of day.
            Keyboard: <strong>Space</strong>.
          </div>
        </aside>
      </div>
    </div>
  `;

  /********************************************************************
   * Logic (adapted from your original script)
   ********************************************************************/
  const CONFIG = {
    storageKey: "pvt5.v1",
    durationMs: 300000,
    counterTickMs: 10,
  };

  const el = {
    btnStart: container.querySelector("#btnStart"),
    btnFinish: container.querySelector("#btnFinish"),
    btnReset: container.querySelector("#btnReset"),

    badgePhase: container.querySelector("#badgePhase"),
    badgeTime: container.querySelector("#badgeTime"),
    badgeLast: container.querySelector("#badgeLast"),
    timeBar: container.querySelector("#timeBar"),

    isiSelect: container.querySelector("#isiSelect"),
    lapseSelect: container.querySelector("#lapseSelect"),

    isiLabel: container.querySelector("#isiLabel"),
    lapseLabel: container.querySelector("#lapseLabel"),

    stage: container.querySelector("#stage"),
    display: container.querySelector("#display"),
    subtext: container.querySelector("#subtext"),

    statTrials: container.querySelector("#statTrials"),
    statMed: container.querySelector("#statMed"),
    statMean: container.querySelector("#statMean"),
    statLapses: container.querySelector("#statLapses"),
    statFalse: container.querySelector("#statFalse"),
    statFast: container.querySelector("#statFast"),
    statSlow: container.querySelector("#statSlow"),

    latestMed: container.querySelector("#latestMed"),
    latestLapses: container.querySelector("#latestLapses"),
    latestDate: container.querySelector("#latestDate"),
    historyBody: container.querySelector("#historyBody")
  };

  const state = {
    running: false,
    phase: "idle",  // idle | wait | go | done
    tStart: null,
    tEnd: null,

    isiMin: 2000,
    isiMax: 10000,
    lapseMs: 500,

    tickTimer: null,
    goTimer: null,
    counterTimer: null,
    goOnAt: null,

    trials: [], // {ts, isiMs, rtMs, lapse, falseStart, source}
    falseStarts: 0,
    lapses: 0,
    lastRT: null,
    _pendingISI: null
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

  function mean(arr) {
    if (!arr.length) return null;
    return arr.reduce((s,x)=>s+x,0) / arr.length;
  }

  function percentile(arr, p) {
    if (!arr.length) return null;
    const a = arr.slice().sort((x,y)=>x-y);
    const idx = (a.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return a[lo];
    const w = idx - lo;
    return a[lo]*(1-w) + a[hi]*w;
  }

  function setBadge(node, text, kind=null) {
    node.textContent = text;
    node.classList.remove("ok","bad","pvt-badge");
    // we keep pvt-badge on element already; only toggle ok/bad
    node.classList.remove("ok","bad");
    if (kind) node.classList.add(kind);
  }

  function setProgressBar() {
    if (!state.running || !state.tStart || !state.tEnd) { el.timeBar.style.width = "0%"; return; }
    const frac = Math.max(0, Math.min(1, (now() - state.tStart) / (state.tEnd - state.tStart)));
    el.timeBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function updateTimeBadge() {
    if (!state.running || !state.tEnd) { el.badgeTime.textContent = "Time: –"; return; }
    const remainMs = Math.max(0, state.tEnd - now());
    const remainSec = Math.ceil(remainMs / 1000);
    const m = Math.floor(remainSec / 60);
    const s = remainSec % 60;
    el.badgeTime.textContent = `Time: ${m}:${String(s).padStart(2,"0")}`;
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
    el.latestMed.textContent = s && s.medianRtMs != null ? `${Math.round(s.medianRtMs)} ms` : "–";
    el.latestLapses.textContent = s ? String(s.lapses) : "–";
    el.latestDate.textContent = s ? fmtDate(s.completedAt) : "–";
  }

  function renderHistory() {
    const sessions = loadSessions();
    const body = el.historyBody;
    body.innerHTML = "";
    if (!sessions.length) {
      body.innerHTML = '<tr><td colspan="3" class="pvt-muted">No sessions yet.</td></tr>';
      return;
    }
    for (const s of sessions.slice(0, 6)) {
      const tr = document.createElement("tr");

      const tdDate = document.createElement("td");
      tdDate.textContent = fmtDate(s.completedAt);

      const tdMed = document.createElement("td");
      tdMed.className = "pvt-right";
      tdMed.textContent = (s.medianRtMs != null) ? `${Math.round(s.medianRtMs)} ms` : "–";

      const tdL = document.createElement("td");
      tdL.className = "pvt-right";
      tdL.textContent = String(s.lapses);

      tr.appendChild(tdDate);
      tr.appendChild(tdMed);
      tr.appendChild(tdL);
      body.appendChild(tr);
    }
  }

  function clearTimers() {
    if (state.tickTimer) clearInterval(state.tickTimer);
    if (state.counterTimer) clearInterval(state.counterTimer);
    if (state.goTimer) clearTimeout(state.goTimer);
    state.tickTimer = null;
    state.counterTimer = null;
    state.goTimer = null;
  }

  function setIdleUI() {
    el.badgePhase.textContent = "Idle";
    el.badgeTime.textContent = "Time: –";
    el.badgeLast.textContent = "Last RT: –";

    el.display.textContent = "—";
    el.subtext.textContent = "Wait. When numbers appear, react as fast as you can. Do not tap before the numbers (false start).";

    el.statTrials.textContent = "0";
    el.statMed.textContent = "–";
    el.statMean.textContent = "–";
    el.statLapses.textContent = "0";
    el.statFalse.textContent = "0";
    el.statFast.textContent = "–";
    el.statSlow.textContent = "–";

    el.timeBar.style.width = "0%";
    el.btnStart.textContent = "Start";
  }

  function applySettings() {
    const isiParts = (el.isiSelect.value || "2,10").split(",").map(x => parseInt(x,10));
    state.isiMin = Math.max(500, (isiParts[0]||2) * 1000);
    state.isiMax = Math.max(state.isiMin + 500, (isiParts[1]||10) * 1000);
    state.lapseMs = parseInt(el.lapseSelect.value, 10) || 500;

    el.isiLabel.textContent = `${Math.round(state.isiMin/1000)}–${Math.round(state.isiMax/1000)}`;
    el.lapseLabel.textContent = String(state.lapseMs);
  }

  function start() {
    applySettings();
    clearTimers();

    state.running = true;
    state.phase = "wait";
    state.tStart = now();
    state.tEnd = state.tStart + CONFIG.durationMs;

    state.trials = [];
    state.falseStarts = 0;
    state.lapses = 0;
    state.lastRT = null;

    el.badgePhase.textContent = "Running";
    el.badgePhase.classList.add("ok");
    el.btnStart.textContent = "Stop";

    setProgressBar();
    updateTimeBadge();

    state.tickTimer = setInterval(() => {
      setProgressBar();
      updateTimeBadge();
      if (now() >= state.tEnd) finishAndSave();
    }, 120);

    el.display.textContent = "—";
    el.subtext.textContent = "Wait…";
    scheduleNextGo();
    updateStatsUI();
  }

  function finishAndSave() {
    if (!state.running) return;

    state.running = false;
    state.phase = "done";
    clearTimers();

    el.badgePhase.textContent = "Done";
    el.badgePhase.classList.remove("ok","bad");
    el.btnStart.textContent = "Start";

    el.display.textContent = "—";
    el.subtext.textContent = "Session finished.";

    const rts = state.trials.filter(t => t.rtMs != null).map(t => t.rtMs);
    const med = median(rts);
    const mn = mean(rts);
    const fast10 = percentile(rts, 0.10);
    const slow90 = percentile(rts, 0.90);

    const session = {
      test: "PVT_5min",
      durationMs: CONFIG.durationMs,
      isiMinMs: state.isiMin,
      isiMaxMs: state.isiMax,
      lapseThresholdMs: state.lapseMs,
      trials: state.trials,
      trialsCount: state.trials.length,
      falseStarts: state.falseStarts,
      lapses: state.lapses,
      medianRtMs: med,
      meanRtMs: mn,
      fastest10pMs: fast10,
      slowest10pMs: slow90,
      completedAt: nowISO()
    };
    addSession(session);
    updateStatsUI();
    el.badgeTime.textContent = "Time: 0:00";

    // ===== Save battery result (clean object) =====
    api.saveResult("pvt", {
      medianRT_ms: med != null ? Math.round(med) : null,
      meanRT_ms: mn != null ? Math.round(mn) : null,
      lapses_n: state.lapses,
      falseStarts_n: state.falseStarts,
      fastest10p_ms: fast10 != null ? Math.round(fast10) : null,
      slowest90p_ms: slow90 != null ? Math.round(slow90) : null
    }, {
      nTrials: state.trials.length,
      duration_s: Math.round(CONFIG.durationMs / 1000),
      isiMin_s: Math.round(state.isiMin / 1000),
      isiMax_s: Math.round(state.isiMax / 1000),
      lapseThreshold_ms: state.lapseMs,
      version: "1.0",
      // keep the full raw data if you want (comment out if too heavy)
      raw: session
    });

    // Optional auto-advance
    // api.next();
  }

  function scheduleNextGo() {
    if (!state.running) return;

    state.phase = "wait";
    el.display.textContent = "—";
    el.subtext.textContent = "Wait…";

    const isi = randInt(state.isiMin, state.isiMax);
    state.goTimer = setTimeout(() => {
      if (!state.running) return;
      showGo(isi);
    }, isi);
  }

  function showGo(isiMs) {
    state.phase = "go";
    state.goOnAt = now();

    el.subtext.textContent = "Tap now!";
    el.display.textContent = "000";

    if (state.counterTimer) clearInterval(state.counterTimer);
    state.counterTimer = setInterval(() => {
      const rt = now() - state.goOnAt;
      el.display.textContent = String(Math.max(0, rt)).padStart(3, "0");
    }, CONFIG.counterTickMs);

    state._pendingISI = isiMs;
  }

  function randInt(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  function registerResponse(source="tap") {
    if (!state.running) return;

    const t = now();

    if (state.phase === "wait") {
      state.falseStarts += 1;
      state.trials.push({
        ts: nowISO(),
        isiMs: null,
        rtMs: null,
        lapse: false,
        falseStart: true,
        source
      });
      el.badgePhase.textContent = "False start";
      el.badgePhase.classList.remove("ok");
      el.badgePhase.classList.add("bad");
      setTimeout(() => {
        if (!state.running) return;
        el.badgePhase.textContent = "Running";
        el.badgePhase.classList.remove("bad");
        el.badgePhase.classList.add("ok");
      }, 350);
      updateStatsUI();
      return;
    }

    if (state.phase !== "go") return;

    const rt = t - state.goOnAt;
    const lapse = rt >= state.lapseMs;

    if (state.counterTimer) clearInterval(state.counterTimer);
    state.counterTimer = null;

    state.lastRT = rt;
    el.badgeLast.textContent = "Last RT: " + Math.round(rt) + " ms";
    el.badgeLast.classList.remove("ok","bad");
    el.badgeLast.classList.add(lapse ? "bad" : "ok");

    if (lapse) state.lapses += 1;

    state.trials.push({
      ts: nowISO(),
      isiMs: state._pendingISI || null,
      rtMs: rt,
      lapse,
      falseStart: false,
      source
    });

    el.subtext.textContent = lapse ? "Lapse (slow). Keep going." : "Good. Keep going.";
    el.display.textContent = String(Math.round(rt)).padStart(3,"0");

    updateStatsUI();

    state.phase = "wait";
    setTimeout(() => {
      if (!state.running) return;
      scheduleNextGo();
    }, 350);
  }

  function updateStatsUI() {
    const rts = state.trials.filter(t => t.rtMs != null).map(t => t.rtMs);
    const med = median(rts);
    const mn = mean(rts);
    const fast10 = percentile(rts, 0.10);
    const slow90 = percentile(rts, 0.90);

    el.statTrials.textContent = String(state.trials.length);
    el.statMed.textContent = med != null ? `${Math.round(med)} ms` : "–";
    el.statMean.textContent = mn != null ? `${Math.round(mn)} ms` : "–";
    el.statLapses.textContent = String(state.lapses);
    el.statFalse.textContent = String(state.falseStarts);
    el.statFast.textContent = fast10 != null ? `${Math.round(fast10)} ms` : "–";
    el.statSlow.textContent = slow90 != null ? `${Math.round(slow90)} ms` : "–";
  }

  // ===== Events (scoped to this module) =====
  const onKeyDown = (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      registerResponse("space");
    }
  };

  el.btnStart.addEventListener("click", () => {
    if (state.running) { finishAndSave(); return; }
    start();
  });

  el.btnFinish.addEventListener("click", () => {
    if (state.running) finishAndSave();
    else {
      // If user clicks Finish without running: save an empty result (optional)
      api.saveResult("pvt", { note: "Finished without run" }, { version: "1.0" });
    }
  });

  el.btnReset.addEventListener("click", () => {
    localStorage.removeItem(CONFIG.storageKey);
    renderHistory();
    renderLatest();
  });

  el.stage.addEventListener("click", () => registerResponse("tap"));
  window.addEventListener("keydown", onKeyDown);

  // React to setting changes immediately (nice UX)
  el.isiSelect.addEventListener("change", () => { if (!state.running) applySettings(); });
  el.lapseSelect.addEventListener("change", () => { if (!state.running) applySettings(); });

  // Init
  applySettings();
  setIdleUI();
  renderHistory();
  renderLatest();

  // Cleanup if the parent swaps modules
  // (cognition.html does not call this yet, but good practice)
  return () => {
    clearTimers();
    window.removeEventListener("keydown", onKeyDown);
  };
}
