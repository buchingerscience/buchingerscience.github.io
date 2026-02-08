// cog1_pvt.js - Reaction Time Test
// Reworked: minimal UI, intuitive, no jargon.
// Exports: init(container, api)

export function init(container, api) {

  container.innerHTML = [
    '<style>',
    '.pvt-wrap { max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystem_attach,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }',

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
    '<div class="pvt-start-hint">When the screen goes dark and numbers appear, tap as fast as you can. Runs for 5 minutes.</div>',
    '<button class="pvt-start-btn" id="pvtBtnStart" type="button">Start</button>',
    '</div>',

    '<div class="pvt-counter" id="pvtCounter">\u2014</div>',
    '<div class="pvt-message" id="pvtMessage"></div>',

    '<div class="pvt-time-pill" id="pvtTimePill" style="display:none">5:00</div>',
    '<div class="pvt-progress" id="pvtProgressWrap" style="display:none">',
    '<div class="pvt-progress-fill" id="pvtProgressBar"></div>',
    '</div>',

    '</div>',
    '</div>'
  ].join('\n');

  var DURATION_MS = 120000;
  var COUNTER_TICK = 10;
  var ISI_MIN = 2000;
  var ISI_MAX = 10000;
  var LAPSE_MS = 500;
  var STORAGE_KEY = "pvt5.v1";

  var stage = container.querySelector("#pvtStage");
  var startOverlay = container.querySelector("#pvtStartOverlay");
  var btnStart = container.querySelector("#pvtBtnStart");
  var counter = container.querySelector("#pvtCounter");
  var message = container.querySelector("#pvtMessage");
  var timePill = container.querySelector("#pvtTimePill");
  var progressWrap = container.querySelector("#pvtProgressWrap");
  var progressBar = container.querySelector("#pvtProgressBar");

  var running = false;
  var phase = "idle";
  var tStart = null;
  var tEnd = null;
  var tickTimer = null;
  var goTimer = null;
  var counterTimer = null;
  var goOnAt = null;
  var trials = [];

  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function clearTimers() {
    if (tickTimer) clearInterval(tickTimer);
    if (counterTimer) clearInterval(counterTimer);
    if (goTimer) clearTimeout(goTimer);
    tickTimer = counterTimer = goTimer = null;
  }

  function updateProgress() {
    if (!running) { progressBar.style.width = "0%"; return; }
    var frac = Math.max(0, Math.min(1, (now() - tStart) / (tEnd - tStart)));
    progressBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function start() {
    clearTimers();
    running = true;
    phase = "wait";
    tStart = now();
    tEnd = tStart + DURATION_MS;

    startOverlay.classList.add("hidden");
    timePill.style.display = "";
    progressWrap.style.display = "";
    stage.classList.remove("state-go");
    counter.textContent = "\u2014";
    message.textContent = "Wait for the numbers...";

    tickTimer = setInterval(function() {
      updateProgress();
      if (now() >= tEnd) finish();
    }, 120);

    scheduleNext();
  }

  function scheduleNext() {
    if (!running) return;
    phase = "wait";
    counter.textContent = "\u2014";
    message.textContent = "Wait...";
    stage.classList.remove("state-go");

    var isi = randInt(ISI_MIN, ISI_MAX);
    goTimer = setTimeout(function() {
      if (!running) return;
      showGo();
    }, isi);
  }

  function showGo() {
    phase = "go";
    goOnAt = now();
    stage.classList.add("state-go");
    message.textContent = "TAP!";
    counter.textContent = "000";

    counterTimer = setInterval(function() {
      counter.textContent = String(Math.max(0, now() - goOnAt)).padStart(3, "0");
    }, COUNTER_TICK);
  }

  function registerResponse() {
    if (!running) return;
    if (phase !== "go") return;

    var rt = now() - goOnAt;
    clearInterval(counterTimer);
    trials.push(rt);

    counter.textContent = String(rt);
    message.textContent = "Good";

    phase = "wait";
    setTimeout(scheduleNext, 400);
  }

  function finish() {
    running = false;
    clearTimers();
    phase = "done";
    stage.classList.remove("state-go");
    message.textContent = "Test complete";
  }

  btnStart.addEventListener("click", start);
  stage.addEventListener("click", registerResponse);

  return function() {
    clearTimers();
  };
}
