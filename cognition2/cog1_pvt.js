// cog1_pvt.js — Reaction Time Test
// Completely reworked: minimal UI, intuitive, no jargon.
// Exports: init(container, api)

export function init(container, api) {

container.innerHTML = `
<style>
.pvt-wrap {
max-width: 720px;
margin: 0 auto;
padding: 16px;
font-family: -apple-system, BlinkMacSystemFont, ‘Segoe UI’, system-ui, sans-serif;
-webkit-font-smoothing: antialiased;
}

```
  /* ─── Stage: the main tappable area ─── */
  .pvt-stage {
    position: relative;
    width: 100%;
    height: 420px;
    border-radius: 20px;
    background: #F5F3F0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    transition: background 0.25s ease;
  }
  .pvt-stage.state-go {
    background: #1A1A2E;
  }
  .pvt-stage.state-done {
    background: #F5F3F0;
    cursor: default;
  }
  @media (max-width: 600px) {
    .pvt-stage { height: 360px; border-radius: 16px; }
  }

  /* ─── Counter display ─── */
  .pvt-counter {
    font-size: 80px;
    font-weight: 800;
    letter-spacing: 2px;
    line-height: 1;
    color: #2D2A26;
    font-variant-numeric: tabular-nums;
    transition: color 0.2s ease;
  }
  .pvt-stage.state-go .pvt-counter {
    color: #4AE68A;
  }

  .pvt-message {
    margin-top: 12px;
    font-size: 16px;
    font-weight: 500;
    color: #8A857E;
    line-height: 1.4;
    transition: color 0.2s ease;
  }
  .pvt-stage.state-go .pvt-message {
    color: rgba(255,255,255,0.7);
  }

  /* ─── Start overlay inside stage ─── */
  .pvt-start-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    z-index: 5;
    background: #F5F3F0;
    border-radius: 20px;
    transition: opacity 0.3s ease;
  }
  .pvt-start-overlay.hidden {
    opacity: 0;
    pointer-events: none;
  }

  .pvt-start-icon { font-size: 48px; }
  .pvt-start-title {
    font-size: 22px;
    font-weight: 700;
    color: #2D2A26;
    letter-spacing: -0.3px;
  }
  .pvt-start-hint {
    font-size: 14px;
    color: #8A857E;
    max-width: 320px;
    line-height: 1.5;
  }
  .pvt-start-btn {
    margin-top: 4px;
    padding: 14px 40px;
    border-radius: 999px;
    border: none;
    background: #4A90D9;
    color: white;
    font-family: inherit;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .pvt-start-btn:hover {
    background: #3D7FCC;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(74,144,217,0.3);
  }

  /* ─── Progress bar at bottom of stage ─── */
  .pvt-progress {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 5px;
    background: rgba(0,0,0,0.06);
  }
  .pvt-progress-fill {
    height: 100%;
    width: 0%;
    background: #4A90D9;
    transition: width 0.12s linear;
  }
  .pvt-stage.state-go .pvt-progress { background: rgba(255,255,255,0.1); }
  .pvt-stage.state-go .pvt-progress-fill { background: rgba(74,230,138,0.5); }

  /* ─── Time remaining pill ─── */
  .pvt-time-pill {
    position: absolute;
    top: 16px; right: 16px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(0,0,0,0.06);
    font-size: 13px;
    font-weight: 600;
    color: #8A857E;
    font-variant-numeric: tabular-nums;
    transition: all 0.2s ease;
  }
  .pvt-stage.state-go .pvt-time-pill {
    background: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.6);
  }

  /* ─── Feedback flash ─── */
  .pvt-feedback {
    position: absolute;
    top: 16px; left: 16px;
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .pvt-feedback.show { opacity: 1; }
  .pvt-feedback.good { background: rgba(59,155,109,0.12); color: #3B9B6D; }
  .pvt-feedback.slow { background: rgba(217,123,74,0.12); color: #D97B4A; }
  .pvt-feedback.early { background: rgba(199,80,80,0.12); color: #C75050; }

  /* ─── Live stats row below stage ─── */
  .pvt-stats {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 16px;
    flex-wrap: wrap;
  }
  .pvt-stat { text-align: center; }
  .pvt-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #2D2A26;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }
  .pvt-stat-label {
    font-size: 12px;
    color: #8A857E;
    margin-top: 2px;
    font-weight: 500;
  }

  /* ─── Results card (replaces stage on finish) ─── */
  .pvt-results {
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px 0 0;
  }
  .pvt-results.show { display: flex; }
  .pvt-results-emoji { font-size: 40px; }
  .pvt-results-title { font-size: 20px; font-weight: 700; color: #2D2A26; }

  .pvt-results-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 420px;
    margin-top: 8px;
  }
  @media (max-width: 480px) {
    .pvt-results-grid { grid-template-columns: repeat(2, 1fr); }
  }

  .pvt-result-card {
    background: #F5F3F0;
    border-radius: 12px;
    padding: 14px 12px;
    text-align: center;
  }
  .pvt-result-card .val {
    font-size: 22px;
    font-weight: 700;
    color: #2D2A26;
  }
  .pvt-result-card .lbl {
    font-size: 11px;
    color: #8A857E;
    margin-top: 4px;
    font-weight: 500;
  }

  .pvt-results-actions {
    display: flex;
    gap: 10px;
    margin-top: 16px;
  }
  .pvt-btn-secondary {
    padding: 10px 24px;
    border-radius: 999px;
    border: 1px solid #E8E4DF;
    background: white;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    color: #2D2A26;
    transition: all 0.2s ease;
  }
  .pvt-btn-secondary:hover { background: #F5F3F0; transform: translateY(-1px); }
  .pvt-btn-next {
    padding: 10px 24px;
    border-radius: 999px;
    border: none;
    background: #4A90D9;
    color: white;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .pvt-btn-next:hover { background: #3D7FCC; transform: translateY(-1px); }

  .pvt-key-hint {
    text-align: center;
    font-size: 12px;
    color: #B5B0A8;
    margin-top: 10px;
  }
  .pvt-key-hint kbd {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    background: #EDEAE6;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
  }
</style>

<div class="pvt-wrap">
  <div class="pvt-stage" id="stage">
    <div class="pvt-start-overlay" id="startOverlay">
      <div class="pvt-start-icon">⚡</div>
      <div class="pvt-start-title">Reaction Time</div>
      <div class="pvt-start-hint">
        When the screen goes dark and numbers appear, tap as fast as you can. Runs for 5 minutes.
      </div>
      <button class="pvt-start-btn" id="btnStart" type="button">Start</button>
    </div>

    <div class="pvt-counter" id="counter">—</div>
    <div class="pvt-message" id="message"></div>

    <div class="pvt-time-pill" id="timePill" style="display:none;">5:00</div>
    <div class="pvt-feedback" id="feedback"></div>

    <div class="pvt-progress" style="display:none;" id="progressWrap">
      <div class="pvt-progress-fill" id="progressBar"></div>
    </div>
  </div>

  <div class="pvt-stats" id="statsRow" style="display:none;">
    <div class="pvt-stat">
      <div class="pvt-stat-value" id="statMedian">–</div>
      <div class="pvt-stat-label">Median</div>
    </div>
    <div class="pvt-stat">
      <div class="pvt-stat-value" id="statTrials">0</div>
      <div class="pvt-stat-label">Reactions</div>
    </div>
    <div class="pvt-stat">
      <div class="pvt-stat-value" id="statLapses">0</div>
      <div class="pvt-stat-label">Slow</div>
    </div>
  </div>

  <div class="pvt-results" id="resultsCard">
    <div class="pvt-results-emoji">✅</div>
    <div class="pvt-results-title">Test Complete</div>
    <div class="pvt-results-grid" id="resultsGrid"></div>
    <div class="pvt-results-actions">
      <button class="pvt-btn-secondary" id="btnRetry" type="button">Try again</button>
      <button class="pvt-btn-next" id="btnNext" type="button">Next test →</button>
    </div>
  </div>

  <div class="pvt-key-hint" id="keyHint">or press <kbd>Space</kbd> to react</div>
</div>
```

`;

// ─── Config ───
const CONFIG = {
durationMs: 300000,
counterTickMs: 10,
isiMin: 2000,
isiMax: 10000,
lapseMs: 500,
storageKey: “pvt5.v1”
};

// ─── Elements ───
const el = {
stage:        container.querySelector(”#stage”),
startOverlay: container.querySelector(”#startOverlay”),
btnStart:     container.querySelector(”#btnStart”),
counter:      container.querySelector(”#counter”),
message:      container.querySelector(”#message”),
timePill:     container.querySelector(”#timePill”),
feedback:     container.querySelector(”#feedback”),
progressWrap: container.querySelector(”#progressWrap”),
progressBar:  container.querySelector(”#progressBar”),
statsRow:     container.querySelector(”#statsRow”),
statMedian:   container.querySelector(”#statMedian”),
statTrials:   container.querySelector(”#statTrials”),
statLapses:   container.querySelector(”#statLapses”),
resultsCard:  container.querySelector(”#resultsCard”),
resultsGrid:  container.querySelector(”#resultsGrid”),
btnRetry:     container.querySelector(”#btnRetry”),
btnNext:      container.querySelector(”#btnNext”),
keyHint:      container.querySelector(”#keyHint”)
};

// ─── State ───
const state = {
running: false,
phase: “idle”,
tStart: null,
tEnd: null,
tickTimer: null,
goTimer: null,
counterTimer: null,
goOnAt: null,
trials: [],
falseStarts: 0,
lapses: 0,
_pendingISI: null
};

// ─── Helpers ───
function now() { return Date.now(); }
function nowISO() { return new Date().toISOString(); }
function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

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

function loadSessions() {
try {
const raw = localStorage.getItem(CONFIG.storageKey);
if (!raw) return [];
return JSON.parse(raw) || [];
} catch { return []; }
}
function saveSessions(s) { localStorage.setItem(CONFIG.storageKey, JSON.stringify(s)); }
function addSession(session) {
const s = loadSessions();
s.unshift(session);
saveSessions(s.slice(0, 200));
}

function clearTimers() {
if (state.tickTimer) clearInterval(state.tickTimer);
if (state.counterTimer) clearInterval(state.counterTimer);
if (state.goTimer) clearTimeout(state.goTimer);
state.tickTimer = state.counterTimer = state.goTimer = null;
}

let feedbackTimeout = null;
function showFeedback(text, type) {
el.feedback.textContent = text;
el.feedback.className = “pvt-feedback show “ + type;
if (feedbackTimeout) clearTimeout(feedbackTimeout);
feedbackTimeout = setTimeout(() => el.feedback.classList.remove(“show”), 600);
}

function updateProgress() {
if (!state.running) { el.progressBar.style.width = “0%”; return; }
const frac = Math.max(0, Math.min(1, (now() - state.tStart) / (state.tEnd - state.tStart)));
el.progressBar.style.width = (frac * 100).toFixed(1) + “%”;
}

function updateTime() {
if (!state.running || !state.tEnd) return;
const remain = Math.max(0, state.tEnd - now());
const sec = Math.ceil(remain / 1000);
el.timePill.textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
}

function updateStats() {
const rts = state.trials.filter(t => t.rtMs != null).map(t => t.rtMs);
const med = median(rts);
el.statMedian.textContent = med != null ? `${Math.round(med)} ms` : “–”;
el.statTrials.textContent = String(rts.length);
el.statLapses.textContent = String(state.lapses);
}

// ─── Core ───
function start() {
clearTimers();
state.running = true;
state.phase = “wait”;
state.tStart = now();
state.tEnd = state.tStart + CONFIG.durationMs;
state.trials = [];
state.falseStarts = 0;
state.lapses = 0;

```
el.startOverlay.classList.add("hidden");
el.timePill.style.display = "";
el.progressWrap.style.display = "";
el.statsRow.style.display = "";
el.resultsCard.classList.remove("show");
el.stage.style.display = "";
el.stage.classList.remove("state-go", "state-done");
el.counter.textContent = "—";
el.message.textContent = "Wait for the numbers…";

updateProgress(); updateTime(); updateStats();

state.tickTimer = setInterval(() => {
  updateProgress(); updateTime();
  if (now() >= state.tEnd) finishAndSave();
}, 120);

scheduleNextGo();
```

}

function scheduleNextGo() {
if (!state.running) return;
state.phase = “wait”;
el.counter.textContent = “—”;
el.message.textContent = “Wait…”;
el.stage.classList.remove(“state-go”);

```
const isi = randInt(CONFIG.isiMin, CONFIG.isiMax);
state.goTimer = setTimeout(() => {
  if (!state.running) return;
  showGo(isi);
}, isi);
```

}

function showGo(isiMs) {
state.phase = “go”;
state.goOnAt = now();
state._pendingISI = isiMs;

```
el.stage.classList.add("state-go");
el.message.textContent = "TAP!";
el.counter.textContent = "000";

if (state.counterTimer) clearInterval(state.counterTimer);
state.counterTimer = setInterval(() => {
  el.counter.textContent = String(Math.max(0, now() - state.goOnAt)).padStart(3, "0");
}, CONFIG.counterTickMs);
```

}

function registerResponse(source = “tap”) {
if (!state.running) return;
const t = now();

```
if (state.phase === "wait") {
  state.falseStarts += 1;
  state.trials.push({ ts: nowISO(), isiMs: null, rtMs: null, lapse: false, falseStart: true, source });
  showFeedback("Too early!", "early");
  updateStats();
  return;
}

if (state.phase !== "go") return;

const rt = t - state.goOnAt;
const lapse = rt >= CONFIG.lapseMs;

if (state.counterTimer) clearInterval(state.counterTimer);
state.counterTimer = null;

if (lapse) state.lapses += 1;

state.trials.push({ ts: nowISO(), isiMs: state._pendingISI || null, rtMs: rt, lapse, falseStart: false, source });

el.counter.textContent = String(Math.round(rt));
el.message.textContent = rt < 200 ? "Incredible!" : rt < 300 ? "Fast!" : rt < CONFIG.lapseMs ? "Good" : "Slow";

showFeedback(`${Math.round(rt)} ms`, lapse ? "slow" : "good");
updateStats();

state.phase = "wait";
setTimeout(() => { if (state.running) scheduleNextGo(); }, 400);
```

}

function finishAndSave() {
if (!state.running) return;
state.running = false;
state.phase = “done”;
clearTimers();

```
const rts = state.trials.filter(t => t.rtMs != null).map(t => t.rtMs);
const med = median(rts);
const mn = mean(rts);
const fast10 = percentile(rts, 0.10);
const slow90 = percentile(rts, 0.90);

const session = {
  test: "PVT_5min", durationMs: CONFIG.durationMs,
  isiMinMs: CONFIG.isiMin, isiMaxMs: CONFIG.isiMax, lapseThresholdMs: CONFIG.lapseMs,
  trials: state.trials, trialsCount: state.trials.length,
  falseStarts: state.falseStarts, lapses: state.lapses,
  medianRtMs: med, meanRtMs: mn,
  fastest10pMs: fast10, slowest10pMs: slow90,
  completedAt: nowISO()
};
addSession(session);

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
  isiMin_s: Math.round(CONFIG.isiMin / 1000),
  isiMax_s: Math.round(CONFIG.isiMax / 1000),
  lapseThreshold_ms: CONFIG.lapseMs,
  version: "2.0",
  raw: session
});

showResultsUI(rts, med, mn, fast10, slow90);
```

}

function showResultsUI(rts, med, mn, fast10) {
el.stage.style.display = “none”;
el.timePill.style.display = “none”;
el.progressWrap.style.display = “none”;
el.statsRow.style.display = “none”;
el.keyHint.style.display = “none”;

```
const items = [
  { val: med != null ? Math.round(med) : "–", unit: "ms", label: "Median speed" },
  { val: mn != null ? Math.round(mn) : "–", unit: "ms", label: "Average speed" },
  { val: rts.length, unit: "", label: "Total reactions" },
  { val: state.lapses, unit: "", label: "Slow responses" },
  { val: state.falseStarts, unit: "", label: "Too early" },
  { val: fast10 != null ? Math.round(fast10) : "–", unit: "ms", label: "Your fastest" },
];

el.resultsGrid.innerHTML = items.map(r => `
  <div class="pvt-result-card">
    <div class="val">${r.val}<span style="font-size:14px;font-weight:500;color:#8A857E;">${r.unit ? ' '+r.unit : ''}</span></div>
    <div class="lbl">${r.label}</div>
  </div>
`).join("");

el.resultsCard.classList.add("show");
```

}

// ─── Events ───
const onKeyDown = (e) => {
if (e.key === “ “ || e.code === “Space”) {
e.preventDefault();
if (!state.running && state.phase === “idle”) start();
else registerResponse(“space”);
}
};

el.btnStart.addEventListener(“click”, start);

el.stage.addEventListener(“click”, (e) => {
if (e.target === el.btnStart || el.startOverlay.contains(e.target)) return;
registerResponse(“tap”);
});

el.btnRetry.addEventListener(“click”, () => {
el.resultsCard.classList.remove(“show”);
el.stage.style.display = “”;
el.stage.classList.remove(“state-done”);
el.startOverlay.classList.remove(“hidden”);
el.keyHint.style.display = “”;
state.phase = “idle”;
el.counter.textContent = “—”;
el.message.textContent = “”;
});

el.btnNext.addEventListener(“click”, () => api.next());

window.addEventListener(“keydown”, onKeyDown);

return () => {
clearTimers();
window.removeEventListener(“keydown”, onKeyDown);
};
}
