// cog1_pvt.js - Reaction Time Test (PVT-like)
// Minimal UI, intuitive, no jargon.
// Now: saves to localStorage + sends result via api.saveResult
// Duration: 2 minutes
// Exports: init(container, api)

export function init(container, api) {
  container.innerHTML = [
    '<style>',
    '.pvt-wrap { max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }',

    '.pvt-stage { position:relative; width:100%; height:420px; border-radius:20px; background:#F5F3F0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; cursor:pointer; user-select:none; overflow:hidden; transition:background 0.25s ease; }',
    '.pvt-stage.state-go { background:#1A1A2E; }',
    '.pvt-stage.state-done { background:#F5F3F0; cursor:default; }',
    '@media(max-width:600px){ .pvt-stage { height:360px; border-radius:16px; } }',

    '.pvt-counter { font-size:80px; font-weight:800; letter-spacing:2px; line-height:1; color:#2D2A26; font-variant-numeric:tabular-nums; transition:color 0.2s ease; }',
    '.pvt-stage.state-go .pvt-counter { color:#4AE68A; }',

    '.pvt-message { margin-top:12px; font-size:16px; font-weight:500; color:#8A857E; line-height:1.4; transition:color 0.2s ease; }',
    '.pvt-stage.state-go .pvt-message { color:rgba(255,255,255,0.7); }',

    '.pvt-start-overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; z-index:5; background:#F5F3F0; border-radius:20px; transition:opacity 0.3s ease; }',
    '.pvt-start-overlay.hidden { opacity:0; pointer-events:none; }',
    '.pvt-start-icon { font-size:48px; }',
    '.pvt-start-title { font-size:22px; font-weight:700; color:#2D2A26; letter-spacing:-0.3px; }',
    '.pvt-start-hint { font-size:14px; color:#8A857E; max-width:320px; line-height:1.5; }',
    '.pvt-start-btn { margin-top:4px; padding:14px 40px; border-radius:999px; border:none; background:#4A90D9; color:white; font-family:inherit; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.2s ease; }',
    '.pvt-start-btn:hover { background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.3); }',

    '.pvt-progress { position:absolute; bottom:0; left:0; right:0; height:5px; background:rgba(0,0,0,0.06); }',
    '.pvt-progress-fill { height:100%; width:0%; background:#4A90D9; transition:width 0.12s linear; }',
    '.pvt-stage.state-go .pvt-progress { background:rgba(255,255,255,0.1); }',
    '.pvt-stage.state-go .pvt-progress-fill { background:rgba(74,230,138,0.5); }',

    '.pvt-time-pill { position:absolute; top:16px; right:16px; padding:6px 14px; border-radius:999px; background:rgba(0,0,0,0.06); font-size:13px; font-weight:600; color:#8A857E; font-variant-numeric:tabular-nums; transition:all 0.2s ease; }',
    '.pvt-stage.state-go .pvt-time-pill { background:rgba(255,255,255,0.12); color:rgba(255,255,255,0.6); }',
    '</style>',

    '<div class="pvt-wrap">',
      '<div class="pvt-stage" id="pvtStage">',

        '<div class="pvt-start-overlay" id="pvtStartOverlay">',
          '<div class="pvt-start-icon">\u26A1</div>',
          '<div class="pvt-start-title">Reaction Time</div>',
          '<div class="pvt-start-hint">When the screen goes dark and numbers appear, tap as fast as you can. Runs for 2 minutes.</div>',
          '<button class="pvt-start-btn" id="pvtBtnStart" type="button">Start</button>',
        '</div>',

        '<div class="pvt-counter" id="pvtCounter">\u2014</div>',
        '<div class="pvt-message" id="pvtMessage"></div>',

        '<div class="pvt-time-pill" id="pvtTimePill" style="display:none">2:00</div>',
        '<div class="pvt-progress" id="pvtProgressWrap" style="display:none">',
          '<div class="pvt-progress-fill" id="pvtProgressBar"></div>',
        '</div>',

      '</div>',
    '</div>'
  ].join('\n');

  // ===== Config =====
  var DURATION_MS = 120000; // 2 minutes
  var COUNTER_TICK = 10;
  var ISI_MIN = 2000;
  var ISI_MAX = 10000;
  var LAPSE_MS = 500;

  // localStorage session history for this test
  var STORAGE_KEY = "pvt.v1.sessions";
  var STORAGE_MAX = 200;

  // ===== Elements =====
  var stage = container.querySelector("#pvtStage");
  var startOverlay = container.querySelector("#pvtStartOverlay");
  var btnStart = container.querySelector("#pvtBtnStart");
  var counter = container.querySelector("#pvtCounter");
  var message = container.querySelector("#pvtMessage");
  var timePill = container.querySelector("#pvtTimePill");
  var progressWrap = container.querySelector("#pvtProgressWrap");
  var progressBar = container.querySelector("#pvtProgressBar");

  // ===== State =====
  var running = false;
  var phase = "idle"; // idle | wait | go | done
  var tStart = null;
  var tEnd = null;

  var tickTimer = null;
  var goTimer = null;
  var counterTimer = null;

  var goOnAt = null;

  // richer trial objects (helps later)
  var trials = []; // {rtMs, ts}

  // ===== Helpers =====
  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function mean(arr) {
    if (!arr.length) return null;
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }

  function median(arr) {
    if (!arr.length) return null;
    var a = arr.slice().sort(function(x,y){ return x-y; });
    var mid = Math.floor(a.length / 2);
    return (a.length % 2) ? a[mid] : (a[mid-1] + a[mid]) / 2;
  }

  function loadSessions() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      // ignore quota / privacy errors
    }
  }

  function addSession(session) {
    var sessions = loadSessions();
    sessions.unshift(session);
    if (sessions.length > STORAGE_MAX) sessions = sessions.slice(0, STORAGE_MAX);
    saveSessions(sessions);
  }

  function clearTimers() {
    if (tickTimer) clearInterval(tickTimer);
    if (counterTimer) clearInterval(counterTimer);
    if (goTimer) clearTimeout(goTimer);
    tickTimer = counterTimer = goTimer = null;
  }

  function updateProgress() {
    if (!running || !tStart || !tEnd) { progressBar.style.width = "0%"; return; }
    var frac = Math.max(0, Math.min(1, (now() - tStart) / (tEnd - tStart)));
    progressBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function updateTimePill() {
    if (!running || !tEnd) return;
    var remain = Math.max(0, tEnd - now());
    var sec = Math.ceil(remain / 1000);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    timePill.textContent = m + ":" + (s < 10 ? "0" : "") + s;
  }

  // ===== Flow =====
  function start() {
    clearTimers();

    trials = [];
    running = true;
    phase = "wait";
    tStart = now();
    tEnd = tStart + DURATION_MS;

    startOverlay.classList.add("hidden");
    timePill.style.display = "";
    progressWrap.style.display = "";

    stage.classList.remove("state-go");
    stage.classList.remove("state-done");

    counter.textContent = "\u2014";
    message.textContent = "Wait for the numbers...";

    updateProgress();
    updateTimePill();

    tickTimer = setInterval(function() {
      updateProgress();
      updateTimePill();
      if (now() >= tEnd) finish("timeout");
    }, 120);

    scheduleNext();
  }

  function scheduleNext() {
    if (!running) return;
    if (now() >= tEnd) { finish("timeout"); return; }

    phase = "wait";
    counter.textContent = "\u2014";
    message.textContent = "Wait...";
    stage.classList.remove("state-go");

    var isi = randInt(ISI_MIN, ISI_MAX);
    goTimer = setTimeout(function() {
      if (!running) return;
      if (now() >= tEnd) { finish("timeout"); return; }
      showGo();
    }, isi);
  }

  function showGo() {
    phase = "go";
    goOnAt = now();
    stage.classList.add("state-go");
    message.textContent = "TAP!";
    counter.textContent = "000";

    if (counterTimer) clearInterval(counterTimer);
    counterTimer = setInterval(function() {
      counter.textContent = String(Math.max(0, now() - goOnAt)).padStart(3, "0");
    }, COUNTER_TICK);
  }

  function registerResponse() {
    if (!running) return;
    if (phase !== "go") return;

    var rt = now() - goOnAt;

    if (counterTimer) clearInterval(counterTimer);
    counterTimer = null;

    trials.push({ rtMs: rt, ts: nowISO() });

    counter.textContent = String(rt);
    message.textContent = (rt >= LAPSE_MS) ? "Late" : "Good";

    phase = "wait";
    setTimeout(scheduleNext, 350);
  }

  function finish(reason) {
    if (!running) return;

    running = false;
    clearTimers();
    phase = "done";

    stage.classList.remove("state-go");
    stage.classList.add("state-done");

    message.textContent = "Test complete";
    timePill.style.display = "none";
    progressWrap.style.display = "none";
    updateProgress();

    // ---- Compute metrics ----
    var rts = trials.map(function(t){ return t.rtMs; });
    var attempted = rts.length;

    var lapses = 0;
    for (var i=0; i<rts.length; i++) if (rts[i] >= LAPSE_MS) lapses++;

    var m = mean(rts);
    var med = median(rts);
    var best = attempted ? Math.min.apply(null, rts) : null;

    // ---- Build session object ----
    var session = {
      test: "PVT",
      durationMs: DURATION_MS,
      isiMinMs: ISI_MIN,
      isiMaxMs: ISI_MAX,
      lapseMs: LAPSE_MS,
      attempted: attempted,
      meanRtMs: (m == null) ? null : Math.round(m),
      medianRtMs: (med == null) ? null : Math.round(med),
      bestRtMs: (best == null) ? null : Math.round(best),
      lapsesN: lapses,
      completedAt: nowISO(),
      reason: reason || "completed",
      trials: trials
    };

    // ---- Save to localStorage ----
    addSession(session);

    // ---- Send to battery via api ----
    if (api && typeof api.saveResult === "function") {
      api.saveResult("pvt", {
        attempted_n: attempted,
        meanRT_ms: session.meanRtMs,
        medianRT_ms: session.medianRtMs,
        bestRT_ms: session.bestRtMs,
        lapses_n: lapses
      }, {
        duration_s: Math.round(DURATION_MS / 1000),
        lapse_ms: LAPSE_MS,
        version: "1.0",
        reason: session.reason,
        raw: session
      });
    }
  }

  // ===== Events =====
  btnStart.addEventListener("click", start);
  stage.addEventListener("click", registerResponse);

  // Init state
  counter.textContent = "\u2014";
  message.textContent = "";
  timePill.textContent = "2:00";

  // Cleanup
  return function() {
    clearTimers();
  };
}
