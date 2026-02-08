// cog2_gng.js - Inhibitory Control (Go / No-Go)
// Minimal, lay-friendly version.
// Exports: init(container, api)

export function init(container, api) {

  // ---------- UI ----------
  container.innerHTML = [
    '<style>',
    '.gng-wrap { max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }',

    '.gng-stage { position:relative; width:100%; height:420px; border-radius:20px; background:#F5F3F0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; user-select:none; overflow:hidden; border:1px solid #E8E4DF; }',
    '@media(max-width:600px){ .gng-stage { height:360px; border-radius:16px; } }',

    '.gng-start-overlay { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; z-index:5; background:#F5F3F0; border-radius:20px; transition:opacity 0.25s ease; }',
    '.gng-start-overlay.hidden { opacity:0; pointer-events:none; }',
    '.gng-title { font-size:22px; font-weight:800; color:#2D2A26; letter-spacing:-0.3px; }',
    '.gng-subtitle { font-size:14px; color:#8A857E; max-width:360px; line-height:1.5; }',
    '.gng-rule { font-size:16px; font-weight:700; color:#2D2A26; }',
    '.gng-rule span { padding:2px 10px; border-radius:999px; background:rgba(0,0,0,0.05); }',
    '.gng-start-btn { margin-top:4px; padding:14px 40px; border-radius:999px; border:none; background:#4A90D9; color:white; font-family:inherit; font-size:16px; font-weight:700; cursor:pointer; transition:all 0.2s ease; }',
    '.gng-start-btn:hover{ background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.28); }',

    '.gng-time-pill { position:absolute; top:16px; right:16px; padding:6px 14px; border-radius:999px; background:rgba(0,0,0,0.06); font-size:13px; font-weight:700; color:#8A857E; font-variant-numeric:tabular-nums; display:none; }',

    '.gng-feedback { position:absolute; top:16px; left:16px; padding:6px 14px; border-radius:999px; font-size:13px; font-weight:700; opacity:0; transition:opacity 0.12s ease; }',
    '.gng-feedback.show { opacity:1; }',
    '.gng-feedback.good { background:rgba(59,155,109,0.12); color:#3B9B6D; }',
    '.gng-feedback.bad { background:rgba(199,80,80,0.12); color:#C75050; }',
    '.gng-feedback.neutral { background:rgba(0,0,0,0.06); color:#8A857E; }',

    '.gng-stimulus { font-size:96px; line-height:1; transform: translateY(-4px); }',
    '.gng-message { margin-top:10px; font-size:15px; font-weight:600; color:#8A857E; line-height:1.35; min-height: 22px; }',

    '.gng-progress { position:absolute; bottom:0; left:0; right:0; height:5px; background:rgba(0,0,0,0.06); display:none; }',
    '.gng-progress-fill { height:100%; width:0%; background:#4A90D9; transition:width 0.12s linear; }',

    '.gng-actions { margin-top:14px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }',
    '.gng-btn-secondary { padding:10px 24px; border-radius:999px; border:1px solid #E8E4DF; background:white; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; color:#2D2A26; transition:all 0.2s ease; }',
    '.gng-btn-secondary:hover { background:#F5F3F0; transform:translateY(-1px); }',
    '.gng-btn-next { padding:10px 24px; border-radius:999px; border:none; background:#4A90D9; color:white; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s ease; }',
    '.gng-btn-next:hover { background:#3D7FCC; transform:translateY(-1px); }',

    '.gng-results { display:none; flex-direction:column; align-items:center; gap:8px; padding:20px 0 0; }',
    '.gng-results.show { display:flex; }',
    '.gng-results-emoji { font-size:40px; }',
    '.gng-results-title { font-size:20px; font-weight:800; color:#2D2A26; }',
    '.gng-results-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:100%; max-width:420px; margin-top:8px; }',
    '@media(max-width:480px){ .gng-results-grid { grid-template-columns:repeat(2,1fr); } }',
    '.gng-result-card { background:#F5F3F0; border-radius:12px; padding:14px 12px; text-align:center; }',
    '.gng-result-card .val { font-size:22px; font-weight:800; color:#2D2A26; }',
    '.gng-result-card .val .unit { font-size:14px; font-weight:600; color:#8A857E; }',
    '.gng-result-card .lbl { font-size:11px; color:#8A857E; margin-top:4px; font-weight:600; }',

    '.gng-key-hint { text-align:center; font-size:12px; color:#B5B0A8; margin-top:10px; }',
    '.gng-key-hint kbd { display:inline-block; padding:2px 8px; border-radius:4px; background:#EDEAE6; font-family:inherit; font-size:11px; font-weight:700; }',
    '</style>',

    '<div class="gng-wrap">',
      '<div class="gng-stage" id="gngStage">',

        '<div class="gng-start-overlay" id="gngStartOverlay">',
          '<div class="gng-title">Inhibitory Control</div>',
          '<div class="gng-subtitle">You will see two foods. Tap only when you see the apple.</div>',
          '<div class="gng-rule">Tap for <span>🍏</span>. Do nothing for <span>🍩</span>.</div>',
          '<button class="gng-start-btn" id="gngBtnStart" type="button">Start</button>',
        '</div>',

        '<div class="gng-time-pill" id="gngTimePill">2:00</div>',
        '<div class="gng-feedback" id="gngFeedback"></div>',

        '<div class="gng-stimulus" id="gngStimulus">—</div>',
        '<div class="gng-message" id="gngMessage">Press Start</div>',

        '<div class="gng-progress" id="gngProgressWrap"><div class="gng-progress-fill" id="gngProgressBar"></div></div>',

      '</div>',

      '<div class="gng-results" id="gngResultsCard">',
        '<div class="gng-results-emoji">✅</div>',
        '<div class="gng-results-title">Test Complete</div>',
        '<div class="gng-results-grid" id="gngResultsGrid"></div>',
        '<div class="gng-actions">',
          '<button class="gng-btn-secondary" id="gngBtnRetry" type="button">Try again</button>',
          '<button class="gng-btn-next" id="gngBtnNext" type="button">Next test →</button>',
        '</div>',
      '</div>',

      '<div class="gng-key-hint" id="gngKeyHint">Tip: you can also press <kbd>Space</kbd> to tap</div>',
    '</div>'
  ].join('\n');

  // ---------- Config (fixed) ----------
  var DURATION_MS = 120000; // 2 minutes
  var STIM_MS = 600;
  var P_NOGO = 0.25;
  var ITI_MIN = 500;
  var ITI_MAX = 900;
  var RESPONSE_EXTRA = 250;

  // ---------- Elements ----------
  var stage        = container.querySelector("#gngStage");
  var startOverlay = container.querySelector("#gngStartOverlay");
  var btnStart     = container.querySelector("#gngBtnStart");
  var timePill     = container.querySelector("#gngTimePill");
  var feedback     = container.querySelector("#gngFeedback");
  var stimEl       = container.querySelector("#gngStimulus");
  var msgEl        = container.querySelector("#gngMessage");
  var progressWrap = container.querySelector("#gngProgressWrap");
  var progressBar  = container.querySelector("#gngProgressBar");

  var resultsCard  = container.querySelector("#gngResultsCard");
  var resultsGrid  = container.querySelector("#gngResultsGrid");
  var btnRetry     = container.querySelector("#gngBtnRetry");
  var btnNext      = container.querySelector("#gngBtnNext");
  var keyHint      = container.querySelector("#gngKeyHint");

  // ---------- State ----------
  var running = false;
  var phase = "idle";

  var tStart = null;
  var tEnd = null;
  var tickTimer = null;
  var timers = [];

  var trialIndex = 0;
  var trialType = null; // "GO" | "NOGO"
  var stimOnAt = null;
  var responseDeadline = null;
  var responded = false;
  var responseAt = null;

  var lastResponseSource = null;

  var goCorrect = 0;
  var nogoCorrect = 0;
  var commission = 0;
  var omission = 0;
  var rts = [];
  var trials = [];

  // ---------- Helpers ----------
  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }
  function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function median(arr) {
    if (!arr.length) return null;
    var a = arr.slice().sort(function(x,y){ return x-y; });
    var mid = Math.floor(a.length / 2);
    return (a.length % 2) ? a[mid] : (a[mid-1] + a[mid]) / 2;
  }

  function clearAllTimers() {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = null;
    for (var i=0; i<timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  function showFeedback(text, kind) {
    feedback.textContent = text;
    feedback.className = "gng-feedback show " + (kind || "neutral");
    setTimeout(function(){ feedback.classList.remove("show"); }, 450);
  }

  function updateProgress() {
    if (!running) { progressBar.style.width = "0%"; return; }
    var frac = Math.max(0, Math.min(1, (now() - tStart) / (tEnd - tStart)));
    progressBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function updateTime() {
    if (!running || !tEnd) return;
    var remain = Math.max(0, tEnd - now());
    var sec = Math.ceil(remain / 1000);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    timePill.textContent = m + ":" + (s < 10 ? "0" : "") + s;
  }

  function showStimulusBlank(message) {
    stimEl.textContent = "—";
    msgEl.textContent = message || "";
  }

  // ---------- Core ----------
  function start() {
    clearAllTimers();

    running = true;
    phase = "running";

    tStart = now();
    tEnd = tStart + DURATION_MS;

    trialIndex = 0;
    trialType = null;
    stimOnAt = null;
    responseDeadline = null;
    responded = false;
    responseAt = null;
    lastResponseSource = null;

    goCorrect = 0;
    nogoCorrect = 0;
    commission = 0;
    omission = 0;
    rts = [];
    trials = [];

    startOverlay.classList.add("hidden");
    resultsCard.classList.remove("show");
    keyHint.style.display = "";
    stage.style.display = "";

    timePill.style.display = "";
    progressWrap.style.display = "";
    showStimulusBlank("Get ready…");

    updateProgress();
    updateTime();

    tickTimer = setInterval(function(){
      updateProgress();
      updateTime();
      if (now() >= tEnd) finishAndSave();
    }, 120);

    timers.push(setTimeout(function(){ nextTrial(); }, 650));
  }

  function nextTrial() {
    if (!running) return;
    if (now() >= tEnd) { finishAndSave(); return; }

    trialIndex += 1;

    responded = false;
    responseAt = null;
    stimOnAt = null;
    responseDeadline = null;
    lastResponseSource = null;

    showStimulusBlank("");

    var iti = randInt(ITI_MIN, ITI_MAX);

    timers.push(setTimeout(function(){
      if (!running) return;

      var isNoGo = (Math.random() < P_NOGO);
      trialType = isNoGo ? "NOGO" : "GO";

      stimEl.textContent = isNoGo ? "🍩" : "🍏";
      msgEl.textContent = isNoGo ? "Do not tap" : "Tap";

      stimOnAt = now();
      responseDeadline = stimOnAt + STIM_MS + RESPONSE_EXTRA;

      timers.push(setTimeout(function(){
        if (!running) return;
        showStimulusBlank("");
      }, STIM_MS));

      timers.push(setTimeout(function(){
        if (!running) return;
        scoreTrial();
        nextTrial();
      }, STIM_MS + RESPONSE_EXTRA));

    }, iti));
  }

  function registerResponse(source) {
    if (!running) return;
    if (!responseDeadline) return;

    var t = now();
    if (t > responseDeadline) return;
    if (responded) return;

    responded = true;
    responseAt = t;
    lastResponseSource = source || null;

    if (trialType === "GO") showFeedback("Good", "good");
    else showFeedback("Too early", "bad");
  }

  function scoreTrial() {
    var isNoGo = (trialType === "NOGO");
    var rt = (responded && stimOnAt) ? (responseAt - stimOnAt) : null;

    var outcome = "";
    var correct = null;

    if (!isNoGo) {
      if (responded) {
        goCorrect += 1;
        if (rt != null) rts.push(rt);
        outcome = "GO_correct";
        correct = true;
      } else {
        omission += 1;
        outcome = "GO_omission";
        correct = false;
      }
    } else {
      if (responded) {
        commission += 1;
        outcome = "NOGO_commission";
        correct = false;
      } else {
        nogoCorrect += 1;
        outcome = "NOGO_correct";
        correct = true;
      }
    }

    trials.push({
      ts: nowISO(),
      trialIndex: trialIndex,
      trialType: trialType,
      responded: responded,
      rtMs: rt,
      outcome: outcome,
      correct: correct,
      source: lastResponseSource
    });
  }

  function finishAndSave() {
    if (!running) return;

    running = false;
    phase = "done";
    clearAllTimers();

    progressWrap.style.display = "none";
    timePill.style.display = "none";
    keyHint.style.display = "none";
    stage.style.display = "none";

    var total = goCorrect + nogoCorrect + commission + omission;
    var correctN = goCorrect + nogoCorrect;
    var acc = total ? (correctN / total) : 0;
    var med = median(rts);

    var session = {
      test: "GoNoGo",
      durationMs: DURATION_MS,
      stimMs: STIM_MS,
      pNoGo: P_NOGO,
      goCorrect: goCorrect,
      nogoCorrect: nogoCorrect,
      commission: commission,
      omission: omission,
      accuracy: acc,
      medianGoRtMs: (med != null) ? Math.round(med) : null,
      nTrials: total,
      completedAt: nowISO(),
      trials: trials
    };

    api.saveResult("gng", {
      accuracy_pct: Math.round(acc * 100),
      commissionErrors_n: commission,
      omissionErrors_n: omission,
      medianGoRT_ms: (med != null) ? Math.round(med) : null
    }, {
      duration_s: Math.round(DURATION_MS / 1000),
      stimulus_ms: STIM_MS,
      noGoRate_pct: Math.round(P_NOGO * 100),
      nTrials: total,
      version: "2.1",
      raw: session
    });

    showResultsUI(acc, med, total);
  }

  function showResultsUI(acc, med, total) {
    var items = [
      { val: Math.round(acc * 100), unit: "%", label: "Accuracy" },
      { val: commission, unit: "", label: "Tapped on 🍩" },
      { val: omission, unit: "", label: "Missed 🍏" },
      { val: (med != null ? Math.round(med) : "–"), unit: "ms", label: "Median speed" },
      { val: total, unit: "", label: "Total trials" },
      { val: Math.round(DURATION_MS / 1000), unit: "s", label: "Duration" }
    ];

    var html = "";
    for (var i=0; i<items.length; i++) {
      var r = items[i];
      html += '<div class="gng-result-card">';
      html += '<div class="val">' + r.val + (r.unit ? ' <span class="unit">' + r.unit + '</span>' : '') + '</div>';
      html += '<div class="lbl">' + r.label + '</div>';
      html += '</div>';
    }
    resultsGrid.innerHTML = html;
    resultsCard.classList.add("show");
  }

  // ---------- Events ----------
  function onKeyDown(e) {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (!running && phase === "idle") start();
      else registerResponse("space");
    }
  }

  btnStart.addEventListener("click", start);

  stage.addEventListener("click", function(e){
    if (startOverlay.contains(e.target)) return;
    registerResponse("tap");
  });

  btnRetry.addEventListener("click", function(){
    resultsCard.classList.remove("show");
    stage.style.display = "";
    startOverlay.classList.remove("hidden");
    keyHint.style.display = "";
    phase = "idle";
    showStimulusBlank("Press Start");
  });

  btnNext.addEventListener("click", function(){ api.next(); });

  window.addEventListener("keydown", onKeyDown);

  // Init
  phase = "idle";
  showStimulusBlank("Press Start");

  // Cleanup
  return function(){
    clearAllTimers();
    window.removeEventListener("keydown", onKeyDown);
  };
}
