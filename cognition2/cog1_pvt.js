// cog1_pvt.js - Reaction Time Test
// Reworked: minimal UI, intuitive, no jargon.
// Exports: init(container, api)

export function init(container, api) {

container.innerHTML = [
‘<style>’,
‘.pvt-wrap { max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystemFont,“Segoe UI”,system-ui,sans-serif; -webkit-font-smoothing:antialiased; }’,

```
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

'.pvt-feedback { position:absolute; top:16px; left:16px; padding:6px 14px; border-radius:999px; font-size:13px; font-weight:600; opacity:0; transition:opacity 0.15s ease; }',
'.pvt-feedback.show { opacity:1; }',
'.pvt-feedback.good { background:rgba(59,155,109,0.12); color:#3B9B6D; }',
'.pvt-feedback.slow { background:rgba(217,123,74,0.12); color:#D97B4A; }',
'.pvt-feedback.early { background:rgba(199,80,80,0.12); color:#C75050; }',

'.pvt-stats { display:flex; justify-content:center; gap:32px; margin-top:16px; flex-wrap:wrap; }',
'.pvt-stat { text-align:center; }',
'.pvt-stat-value { font-size:28px; font-weight:700; color:#2D2A26; font-variant-numeric:tabular-nums; letter-spacing:-0.5px; }',
'.pvt-stat-label { font-size:12px; color:#8A857E; margin-top:2px; font-weight:500; }',

'.pvt-results { display:none; flex-direction:column; align-items:center; gap:8px; padding:20px 0 0; }',
'.pvt-results.show { display:flex; }',
'.pvt-results-emoji { font-size:40px; }',
'.pvt-results-title { font-size:20px; font-weight:700; color:#2D2A26; }',

'.pvt-results-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:100%; max-width:420px; margin-top:8px; }',
'@media(max-width:480px){ .pvt-results-grid { grid-template-columns:repeat(2,1fr); } }',

'.pvt-result-card { background:#F5F3F0; border-radius:12px; padding:14px 12px; text-align:center; }',
'.pvt-result-card .val { font-size:22px; font-weight:700; color:#2D2A26; }',
'.pvt-result-card .val .unit { font-size:14px; font-weight:500; color:#8A857E; }',
'.pvt-result-card .lbl { font-size:11px; color:#8A857E; margin-top:4px; font-weight:500; }',

'.pvt-results-actions { display:flex; gap:10px; margin-top:16px; }',
'.pvt-btn-secondary { padding:10px 24px; border-radius:999px; border:1px solid #E8E4DF; background:white; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; color:#2D2A26; transition:all 0.2s ease; }',
'.pvt-btn-secondary:hover { background:#F5F3F0; transform:translateY(-1px); }',
'.pvt-btn-next { padding:10px 24px; border-radius:999px; border:none; background:#4A90D9; color:white; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s ease; }',
'.pvt-btn-next:hover { background:#3D7FCC; transform:translateY(-1px); }',

'.pvt-key-hint { text-align:center; font-size:12px; color:#B5B0A8; margin-top:10px; }',
'.pvt-key-hint kbd { display:inline-block; padding:2px 8px; border-radius:4px; background:#EDEAE6; font-family:inherit; font-size:11px; font-weight:600; }',
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
    '<div class="pvt-feedback" id="pvtFeedback"></div>',

    '<div class="pvt-progress" id="pvtProgressWrap" style="display:none">',
      '<div class="pvt-progress-fill" id="pvtProgressBar"></div>',
    '</div>',

  '</div>',

  '<div class="pvt-stats" id="pvtStatsRow" style="display:none">',
    '<div class="pvt-stat"><div class="pvt-stat-value" id="pvtStatMedian">\u2013</div><div class="pvt-stat-label">Median</div></div>',
    '<div class="pvt-stat"><div class="pvt-stat-value" id="pvtStatTrials">0</div><div class="pvt-stat-label">Reactions</div></div>',
    '<div class="pvt-stat"><div class="pvt-stat-value" id="pvtStatLapses">0</div><div class="pvt-stat-label">Slow</div></div>',
  '</div>',

  '<div class="pvt-results" id="pvtResultsCard">',
    '<div class="pvt-results-emoji">\u2705</div>',
    '<div class="pvt-results-title">Test Complete</div>',
    '<div class="pvt-results-grid" id="pvtResultsGrid"></div>',
    '<div class="pvt-results-actions">',
      '<button class="pvt-btn-secondary" id="pvtBtnRetry" type="button">Try again</button>',
      '<button class="pvt-btn-next" id="pvtBtnNext" type="button">Next test \u2192</button>',
    '</div>',
  '</div>',

  '<div class="pvt-key-hint" id="pvtKeyHint">or press <kbd>Space</kbd> to react</div>',
'</div>'
```

].join(’\n’);

// Config (fixed defaults, no user-facing settings)
var DURATION_MS = 300000;
var COUNTER_TICK = 10;
var ISI_MIN = 2000;
var ISI_MAX = 10000;
var LAPSE_MS = 500;
var STORAGE_KEY = “pvt5.v1”;

// Elements
var stage        = container.querySelector(”#pvtStage”);
var startOverlay = container.querySelector(”#pvtStartOverlay”);
var btnStart     = container.querySelector(”#pvtBtnStart”);
var counter      = container.querySelector(”#pvtCounter”);
var message      = container.querySelector(”#pvtMessage”);
var timePill     = container.querySelector(”#pvtTimePill”);
var feedback     = container.querySelector(”#pvtFeedback”);
var progressWrap = container.querySelector(”#pvtProgressWrap”);
var progressBar  = container.querySelector(”#pvtProgressBar”);
var statsRow     = container.querySelector(”#pvtStatsRow”);
var statMedian   = container.querySelector(”#pvtStatMedian”);
var statTrials   = container.querySelector(”#pvtStatTrials”);
var statLapses   = container.querySelector(”#pvtStatLapses”);
var resultsCard  = container.querySelector(”#pvtResultsCard”);
var resultsGrid  = container.querySelector(”#pvtResultsGrid”);
var btnRetry     = container.querySelector(”#pvtBtnRetry”);
var btnNext      = container.querySelector(”#pvtBtnNext”);
var keyHint      = container.querySelector(”#pvtKeyHint”);

// State
var running = false;
var phase = “idle”;
var tStart = null;
var tEnd = null;
var tickTimer = null;
var goTimer = null;
var counterTimer = null;
var goOnAt = null;
var trials = [];
var falseStarts = 0;
var lapses = 0;
var pendingISI = null;
var feedbackTimer = null;

// Helpers
function now() { return Date.now(); }
function nowISO() { return new Date().toISOString(); }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

function median(arr) {
if (!arr.length) return null;
var a = arr.slice().sort(function(x,y){ return x-y; });
var mid = Math.floor(a.length / 2);
return (a.length % 2) ? a[mid] : (a[mid-1] + a[mid]) / 2;
}
function mean(arr) {
if (!arr.length) return null;
var s = 0; for (var i=0; i<arr.length; i++) s += arr[i];
return s / arr.length;
}
function percentile(arr, p) {
if (!arr.length) return null;
var a = arr.slice().sort(function(x,y){ return x-y; });
var idx = (a.length - 1) * p;
var lo = Math.floor(idx);
var hi = Math.ceil(idx);
if (lo === hi) return a[lo];
var w = idx - lo;
return a[lo]*(1-w) + a[hi]*w;
}

function loadSessions() {
try { var raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
catch(e) { return []; }
}
function saveSessions(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function addSession(session) {
var s = loadSessions();
s.unshift(session);
saveSessions(s.slice(0, 200));
}

function clearTimers() {
if (tickTimer) clearInterval(tickTimer);
if (counterTimer) clearInterval(counterTimer);
if (goTimer) clearTimeout(goTimer);
tickTimer = counterTimer = goTimer = null;
}

function showFeedbackPill(text, type) {
feedback.textContent = text;
feedback.className = “pvt-feedback show “ + type;
if (feedbackTimer) clearTimeout(feedbackTimer);
feedbackTimer = setTimeout(function() { feedback.classList.remove(“show”); }, 600);
}

function updateProgress() {
if (!running) { progressBar.style.width = “0%”; return; }
var frac = Math.max(0, Math.min(1, (now() - tStart) / (tEnd - tStart)));
progressBar.style.width = (frac * 100).toFixed(1) + “%”;
}

function updateTime() {
if (!running || !tEnd) return;
var remain = Math.max(0, tEnd - now());
var sec = Math.ceil(remain / 1000);
var m = Math.floor(sec / 60);
var s = sec % 60;
timePill.textContent = m + “:” + (s < 10 ? “0” : “”) + s;
}

function updateStats() {
var rts = [];
for (var i=0; i<trials.length; i++) { if (trials[i].rtMs != null) rts.push(trials[i].rtMs); }
var med = median(rts);
statMedian.textContent = med != null ? Math.round(med) + “ ms” : “\u2013”;
statTrials.textContent = String(rts.length);
statLapses.textContent = String(lapses);
}

// Core game
function start() {
clearTimers();
running = true;
phase = “wait”;
tStart = now();
tEnd = tStart + DURATION_MS;
trials = [];
falseStarts = 0;
lapses = 0;

```
startOverlay.classList.add("hidden");
timePill.style.display = "";
progressWrap.style.display = "";
statsRow.style.display = "";
resultsCard.classList.remove("show");
stage.style.display = "";
stage.classList.remove("state-go", "state-done");
counter.textContent = "\u2014";
message.textContent = "Wait for the numbers\u2026";

updateProgress();
updateTime();
updateStats();

tickTimer = setInterval(function() {
  updateProgress();
  updateTime();
  if (now() >= tEnd) finishAndSave();
}, 120);

scheduleNextGo();
```

}

function scheduleNextGo() {
if (!running) return;
phase = “wait”;
counter.textContent = “\u2014”;
message.textContent = “Wait\u2026”;
stage.classList.remove(“state-go”);

```
var isi = randInt(ISI_MIN, ISI_MAX);
goTimer = setTimeout(function() {
  if (!running) return;
  showGo(isi);
}, isi);
```

}

function showGo(isiMs) {
phase = “go”;
goOnAt = now();
pendingISI = isiMs;

```
stage.classList.add("state-go");
message.textContent = "TAP!";
counter.textContent = "000";

if (counterTimer) clearInterval(counterTimer);
counterTimer = setInterval(function() {
  counter.textContent = String(Math.max(0, now() - goOnAt)).padStart(3, "0");
}, COUNTER_TICK);
```

}

function registerResponse(source) {
if (!running) return;
var t = now();

```
if (phase === "wait") {
  falseStarts += 1;
  trials.push({ ts: nowISO(), isiMs: null, rtMs: null, lapse: false, falseStart: true, source: source });
  showFeedbackPill("Too early!", "early");
  updateStats();
  return;
}

if (phase !== "go") return;

var rt = t - goOnAt;
var isLapse = rt >= LAPSE_MS;

if (counterTimer) clearInterval(counterTimer);
counterTimer = null;

if (isLapse) lapses += 1;

trials.push({ ts: nowISO(), isiMs: pendingISI, rtMs: rt, lapse: isLapse, falseStart: false, source: source });

counter.textContent = String(Math.round(rt));
message.textContent = rt < 200 ? "Incredible!" : rt < 300 ? "Fast!" : rt < LAPSE_MS ? "Good" : "Slow";

showFeedbackPill(Math.round(rt) + " ms", isLapse ? "slow" : "good");
updateStats();

phase = "wait";
setTimeout(function() { if (running) scheduleNextGo(); }, 400);
```

}

function finishAndSave() {
if (!running) return;
running = false;
phase = “done”;
clearTimers();

```
var rts = [];
for (var i=0; i<trials.length; i++) { if (trials[i].rtMs != null) rts.push(trials[i].rtMs); }
var med = median(rts);
var mn = mean(rts);
var fast10 = percentile(rts, 0.10);
var slow90 = percentile(rts, 0.90);

var session = {
  test: "PVT_5min", durationMs: DURATION_MS,
  isiMinMs: ISI_MIN, isiMaxMs: ISI_MAX, lapseThresholdMs: LAPSE_MS,
  trials: trials, trialsCount: trials.length,
  falseStarts: falseStarts, lapses: lapses,
  medianRtMs: med, meanRtMs: mn,
  fastest10pMs: fast10, slowest10pMs: slow90,
  completedAt: nowISO()
};
addSession(session);

api.saveResult("pvt", {
  medianRT_ms: med != null ? Math.round(med) : null,
  meanRT_ms: mn != null ? Math.round(mn) : null,
  lapses_n: lapses,
  falseStarts_n: falseStarts,
  fastest10p_ms: fast10 != null ? Math.round(fast10) : null,
  slowest90p_ms: slow90 != null ? Math.round(slow90) : null
}, {
  nTrials: trials.length,
  duration_s: Math.round(DURATION_MS / 1000),
  isiMin_s: Math.round(ISI_MIN / 1000),
  isiMax_s: Math.round(ISI_MAX / 1000),
  lapseThreshold_ms: LAPSE_MS,
  version: "2.0",
  raw: session
});

showResultsUI(rts, med, mn, fast10);
```

}

function showResultsUI(rts, med, mn, fast10) {
stage.style.display = “none”;
statsRow.style.display = “none”;
keyHint.style.display = “none”;

```
var items = [
  { val: med != null ? Math.round(med) : "\u2013", unit: "ms", label: "Median speed" },
  { val: mn  != null ? Math.round(mn)  : "\u2013", unit: "ms", label: "Average speed" },
  { val: rts.length,   unit: "", label: "Total reactions" },
  { val: lapses,        unit: "", label: "Slow responses" },
  { val: falseStarts,   unit: "", label: "Too early" },
  { val: fast10 != null ? Math.round(fast10) : "\u2013", unit: "ms", label: "Your fastest" }
];

var html = "";
for (var i=0; i<items.length; i++) {
  var r = items[i];
  html += '<div class="pvt-result-card">';
  html += '<div class="val">' + r.val + (r.unit ? ' <span class="unit">' + r.unit + '</span>' : '') + '</div>';
  html += '<div class="lbl">' + r.label + '</div>';
  html += '</div>';
}
resultsGrid.innerHTML = html;
resultsCard.classList.add("show");
```

}

// Events
function onKeyDown(e) {
if (e.key === “ “ || e.code === “Space”) {
e.preventDefault();
if (!running && phase === “idle”) start();
else registerResponse(“space”);
}
}

btnStart.addEventListener(“click”, start);

stage.addEventListener(“click”, function(e) {
if (e.target === btnStart || startOverlay.contains(e.target)) return;
registerResponse(“tap”);
});

btnRetry.addEventListener(“click”, function() {
resultsCard.classList.remove(“show”);
stage.style.display = “”;
stage.classList.remove(“state-done”);
startOverlay.classList.remove(“hidden”);
keyHint.style.display = “”;
phase = “idle”;
counter.textContent = “\u2014”;
message.textContent = “”;
});

btnNext.addEventListener(“click”, function() { api.next(); });

window.addEventListener(“keydown”, onKeyDown);

// Cleanup
return function() {
clearTimers();
window.removeEventListener(“keydown”, onKeyDown);
};
}
