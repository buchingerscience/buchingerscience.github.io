// cog3_dsst.js - DSST (Digit Symbol Substitution Test)
// Simplified to match cog1/cog2 vibe:
// - Big start button centered (overlay)
// - Minimal text during the test (instructions shown only on start screen)
// - Removes "Test" labels during play
// - Adds localStorage session saving (fixes storage problem)
// - Keeps 5 symbols (digits 1–5), no practice
// Exports: init(container, api)

export function init(container, api) {

  // ---------- UI ----------
  container.innerHTML = [
    '<style>',
    '.dsst-wrap { max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }',

    '.dsst-stage { position:relative; width:100%; height:420px; border-radius:20px; background:#F5F3F0; border:1px solid #E8E4DF; overflow:hidden; display:flex; align-items:center; justify-content:center; }',
    '@media(max-width:600px){ .dsst-stage { height:360px; border-radius:16px; } }',

    '.dsst-start-overlay{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; padding:22px 16px; background:#F5F3F0; z-index:5; transition:opacity 0.25s ease; }',
    '.dsst-start-overlay.hidden{ opacity:0; pointer-events:none; }',
    '.dsst-start-icon{ font-size:46px; }',
    '.dsst-title{ font-size:22px; font-weight:800; color:#2D2A26; letter-spacing:-0.3px; }',
    '.dsst-sub{ font-size:14px; color:#8A857E; max-width:420px; line-height:1.5; }',
    '.dsst-start-btn{ margin-top:2px; padding:14px 40px; border-radius:999px; border:none; background:#4A90D9; color:#fff; font-family:inherit; font-size:16px; font-weight:700; cursor:pointer; transition:all 0.2s ease; }',
    '.dsst-start-btn:hover{ background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.28); }',

    '.dsst-time-pill{ position:absolute; top:16px; right:16px; padding:6px 14px; border-radius:999px; background:rgba(0,0,0,0.06); font-size:13px; font-weight:700; color:#8A857E; font-variant-numeric:tabular-nums; display:none; }',

    '.dsst-progress{ position:absolute; bottom:0; left:0; right:0; height:5px; background:rgba(0,0,0,0.06); display:none; }',
    '.dsst-progress-fill{ height:100%; width:0%; background:#4A90D9; transition:width 0.12s linear; }',

    '.dsst-main{ width:100%; height:100%; padding:16px; box-sizing:border-box; display:none; }',
    '.dsst-key{ display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-top:6px; }',
    '.dsst-key-card{ background:rgba(255,255,255,0.7); border:1px solid #E8E4DF; border-radius:12px; padding:10px 8px; text-align:center; }',
    '.dsst-key-emoji{ font-size:22px; line-height:1; }',
    '.dsst-key-digit{ margin-top:6px; font-size:13px; font-weight:800; color:#2D2A26; }',

    '.dsst-itemRow{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:14px; align-items:stretch; }',
    '@media(max-width:700px){ .dsst-itemRow{ grid-template-columns:1fr; } }',

    '.dsst-symbolBox{ background:linear-gradient(180deg, rgba(248,249,250,0.9), rgba(255,255,255,0.9)); border:1px solid #E8E4DF; border-radius:16px; min-height:140px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }',
    '.dsst-symbol{ font-size:64px; line-height:1; }',
    '.dsst-minitext{ font-size:13px; font-weight:700; color:#8A857E; }',

    '.dsst-kbd{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }',
    '.dsst-kbd button{ padding:14px 0; border-radius:14px; border:1px solid #E8E4DF; background:#fff; cursor:pointer; font-size:18px; font-weight:800; color:#2D2A26; transition:all 0.18s ease; }',
    '.dsst-kbd button:hover{ background:#F5F3F0; transform:translateY(-1px); }',
    '.dsst-kbd button:disabled{ opacity:0.55; cursor:not-allowed; transform:none; }',

    '.dsst-results{ display:none; flex-direction:column; align-items:center; gap:8px; padding:20px 0 0; }',
    '.dsst-results.show{ display:flex; }',
    '.dsst-results-emoji{ font-size:40px; }',
    '.dsst-results-title{ font-size:20px; font-weight:800; color:#2D2A26; }',
    '.dsst-results-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:100%; max-width:420px; margin-top:8px; }',
    '@media(max-width:480px){ .dsst-results-grid{ grid-template-columns:repeat(2,1fr); } }',
    '.dsst-result-card{ background:#F5F3F0; border-radius:12px; padding:14px 12px; text-align:center; }',
    '.dsst-result-card .val{ font-size:22px; font-weight:800; color:#2D2A26; }',
    '.dsst-result-card .val .unit{ font-size:14px; font-weight:700; color:#8A857E; }',
    '.dsst-result-card .lbl{ font-size:11px; color:#8A857E; margin-top:4px; font-weight:700; }',

    '.dsst-actions{ display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; justify-content:center; }',
    '.dsst-btn-secondary{ padding:10px 24px; border-radius:999px; border:1px solid #E8E4DF; background:#fff; font-family:inherit; font-size:14px; font-weight:800; cursor:pointer; color:#2D2A26; transition:all 0.2s ease; }',
    '.dsst-btn-secondary:hover{ background:#F5F3F0; transform:translateY(-1px); }',
    '.dsst-btn-next{ padding:10px 24px; border-radius:999px; border:none; background:#4A90D9; color:#fff; font-family:inherit; font-size:14px; font-weight:800; cursor:pointer; transition:all 0.2s ease; }',
    '.dsst-btn-next:hover{ background:#3D7FCC; transform:translateY(-1px); }',

    '.dsst-keyhint{ text-align:center; font-size:12px; color:#B5B0A8; margin-top:10px; }',
    '.dsst-keyhint kbd{ display:inline-block; padding:2px 8px; border-radius:4px; background:#EDEAE6; font-family:inherit; font-size:11px; font-weight:800; }',
    '</style>',

    '<div class="dsst-wrap">',
      '<div class="dsst-stage" id="dsstStage">',

        '<div class="dsst-start-overlay" id="dsstStartOverlay">',
          '<div class="dsst-start-icon">🔁</div>',
          '<div class="dsst-title">Symbol Matching</div>',
          '<div class="dsst-sub">',
            'Use the key to match the emoji to a number (1–5).<br/>',
            'Press the number or tap it. Runs for 2 minutes.',
          '</div>',
          '<button class="dsst-start-btn" id="dsstBtnStart" type="button">Start</button>',
          '<div class="dsst-keyhint">Keyboard: <kbd>1</kbd> to <kbd>5</kbd></div>',
        '</div>',

        '<div class="dsst-time-pill" id="dsstTimePill">2:00</div>',
        '<div class="dsst-progress" id="dsstProgressWrap"><div class="dsst-progress-fill" id="dsstProgressBar"></div></div>',

        '<div class="dsst-main" id="dsstMain">',
          '<div class="dsst-key" id="dsstKey"></div>',
          '<div class="dsst-itemRow">',
            '<div class="dsst-symbolBox">',
              '<div class="dsst-symbol" id="dsstSymbol">—</div>',
              '<div class="dsst-minitext" id="dsstMiniText">Tap the matching number</div>',
            '</div>',
            '<div>',
              '<div class="dsst-kbd" id="dsstKbd">',
                '<button type="button" data-digit="1">1</button>',
                '<button type="button" data-digit="2">2</button>',
                '<button type="button" data-digit="3">3</button>',
                '<button type="button" data-digit="4">4</button>',
                '<button type="button" data-digit="5">5</button>',
              '</div>',
            '</div>',
          '</div>',
        '</div>',

      '</div>',

      '<div class="dsst-results" id="dsstResults">',
        '<div class="dsst-results-emoji">✅</div>',
        '<div class="dsst-results-title">Test Complete</div>',
        '<div class="dsst-results-grid" id="dsstResultsGrid"></div>',
        '<div class="dsst-actions">',
          '<button class="dsst-btn-secondary" id="dsstBtnRetry" type="button">Try again</button>',
          '<button class="dsst-btn-next" id="dsstBtnNext" type="button">Next test →</button>',
        '</div>',
      '</div>',
    '</div>'
  ].join('\n');

  // ---------- Fixed defaults ----------
  var DURATION_MS = 120000; // 2 min
  var KEY_SIZE = 5;

  var EMOJI_POOL = [
    "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🍍","🥝","🥭","🍏",
    "🥕","🌽","🥦","🥒","🫑","🍆","🥬","🧄","🧅","🥔","🍠","🫘"
  ];

  // localStorage (fix storage problem)
  var STORAGE_KEY = "dsst.v1.sessions";
  var STORAGE_MAX = 200;

  // ---------- Elements ----------
  var stage = container.querySelector("#dsstStage");

  var startOverlay = container.querySelector("#dsstStartOverlay");
  var btnStart = container.querySelector("#dsstBtnStart");

  var timePill = container.querySelector("#dsstTimePill");
  var progressWrap = container.querySelector("#dsstProgressWrap");
  var progressBar = container.querySelector("#dsstProgressBar");

  var main = container.querySelector("#dsstMain");
  var keyEl = container.querySelector("#dsstKey");
  var symbolEl = container.querySelector("#dsstSymbol");

  var digitButtons = Array.from(container.querySelectorAll("[data-digit]"));

  var results = container.querySelector("#dsstResults");
  var resultsGrid = container.querySelector("#dsstResultsGrid");
  var btnRetry = container.querySelector("#dsstBtnRetry");
  var btnNext = container.querySelector("#dsstBtnNext");

  // ---------- State ----------
  var running = false;

  var key = null; // { digitToEmoji: {1..5}, emojiToDigit: {emoji: digit} }

  var tStart = null;
  var tEnd = null;
  var tickTimer = null;

  var currentDigit = null;
  var currentEmoji = null;
  var itemShownAt = null;

  var correct = 0;
  var errors = 0;
  var rts = [];
  var trials = [];

  // ---------- Helpers ----------
  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  function median(arr) {
    if (!arr.length) return null;
    var a = arr.slice().sort(function(x,y){ return x-y; });
    var mid = Math.floor(a.length / 2);
    return (a.length % 2) ? a[mid] : (a[mid-1] + a[mid]) / 2;
  }

  function shuffle(a) {
    var arr = a.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function lockResponses(locked) {
    for (var i=0; i<digitButtons.length; i++) digitButtons[i].disabled = locked;
  }

  function loadSessions() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  function saveSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      // ignore quota/private mode errors
    }
  }

  function addSession(session) {
    var sessions = loadSessions();
    sessions.unshift(session);
    if (sessions.length > STORAGE_MAX) sessions = sessions.slice(0, STORAGE_MAX);
    saveSessions(sessions);
  }

  function pickKey() {
    var em = shuffle(EMOJI_POOL).slice(0, KEY_SIZE);
    var digitToEmoji = {};
    var emojiToDigit = {};
    for (var d = 1; d <= KEY_SIZE; d++) {
      digitToEmoji[d] = em[d - 1];
      emojiToDigit[em[d - 1]] = d;
    }
    key = { digitToEmoji: digitToEmoji, emojiToDigit: emojiToDigit };
    renderKey();
  }

  function renderKey() {
    keyEl.innerHTML = "";
    for (var d = 1; d <= KEY_SIZE; d++) {
      var card = document.createElement("div");
      card.className = "dsst-key-card";
      var e = document.createElement("div");
      e.className = "dsst-key-emoji";
      e.textContent = key.digitToEmoji[d];
      var n = document.createElement("div");
      n.className = "dsst-key-digit";
      n.textContent = String(d);
      card.appendChild(e);
      card.appendChild(n);
      keyEl.appendChild(card);
    }
  }

  function updateProgress() {
    if (!running || !tStart || !tEnd) { progressBar.style.width = "0%"; return; }
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

  function nextItem() {
    var d = 1 + Math.floor(Math.random() * KEY_SIZE);
    currentDigit = d;
    currentEmoji = key.digitToEmoji[d];
    itemShownAt = now();
    symbolEl.textContent = currentEmoji;
  }

  function start() {
    // reset run state
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = null;

    running = true;

    correct = 0;
    errors = 0;
    rts = [];
    trials = [];

    if (!key) pickKey();

    // show test UI
    results.classList.remove("show");
    startOverlay.classList.add("hidden");

    main.style.display = "block";
    timePill.style.display = "";
    progressWrap.style.display = "";
    progressBar.style.width = "0%";

    lockResponses(false);

    tStart = now();
    tEnd = tStart + DURATION_MS;

    updateProgress();
    updateTime();

    tickTimer = setInterval(function(){
      updateProgress();
      updateTime();
      if (now() >= tEnd) finishAndSave("timeout");
    }, 120);

    nextItem();
  }

  function handleAnswer(answerDigit, source) {
    if (!running) return;
    if (!currentDigit) return;

    var rt = itemShownAt ? (now() - itemShownAt) : null;
    var isCorrect = (answerDigit === currentDigit);

    trials.push({
      ts: nowISO(),
      emoji: currentEmoji,
      correctDigit: currentDigit,
      answerDigit: answerDigit,
      correct: isCorrect,
      rtMs: rt,
      source: source || "button"
    });

    if (isCorrect) correct += 1;
    else errors += 1;
    if (rt != null) rts.push(rt);

    nextItem();
  }

  function finishAndSave(reason) {
    if (!running) return;

    running = false;

    if (tickTimer) clearInterval(tickTimer);
    tickTimer = null;

    lockResponses(true);
    main.style.display = "none";
    timePill.style.display = "none";
    progressWrap.style.display = "none";

    var attempted = correct + errors;
    var ipm = attempted ? (attempted / (DURATION_MS / 1000)) * 60 : 0;
    var med = median(rts);

    var raw = {
      test: "DSST",
      durationMs: DURATION_MS,
      keySize: KEY_SIZE,
      correct: correct,
      errors: errors,
      attempted: attempted,
      itemsPerMin: ipm,
      medianRtMs: (med != null) ? Math.round(med) : null,
      completedAt: nowISO(),
      reason: reason || "completed",
      key: key,
      trials: trials
    };

    // ---- localStorage save (fix) ----
    addSession(raw);

    // ---- battery save (guarded) ----
    if (api && typeof api.saveResult === "function") {
      api.saveResult("dsst", {
        correct_n: correct,
        errors_n: errors,
        itemsPerMin: Number(ipm.toFixed(1)),
        medianRT_ms: (med != null) ? Math.round(med) : null
      }, {
        duration_s: Math.round(DURATION_MS / 1000),
        keySize: KEY_SIZE,
        version: "1.0",
        reason: raw.reason,
        raw: raw
      });
    }

    showResultsUI(correct, errors, ipm, med);
  }

  function showResultsUI(correctN, errorsN, ipm, med) {
    var items = [
      { val: correctN, unit: "", label: "Correct" },
      { val: errorsN, unit: "", label: "Errors" },
      { val: ipm.toFixed(1), unit: "", label: "Items / min" },
      { val: (med != null ? Math.round(med) : "–"), unit: "ms", label: "Median speed" },
      { val: 2, unit: "min", label: "Duration" },
      { val: KEY_SIZE, unit: "", label: "Symbols" }
    ];

    var html = "";
    for (var i=0; i<items.length; i++) {
      var r = items[i];
      html += '<div class="dsst-result-card">';
      html += '<div class="val">' + r.val + (r.unit ? ' <span class="unit">' + r.unit + '</span>' : '') + '</div>';
      html += '<div class="lbl">' + r.label + '</div>';
      html += '</div>';
    }
    resultsGrid.innerHTML = html;
    results.classList.add("show");
  }

  // ---------- Events ----------
  function onKeyDown(e) {
    if (!running) return;
    if (e.key >= "1" && e.key <= "5") {
      handleAnswer(parseInt(e.key, 10), "key");
    }
  }

  btnStart.addEventListener("click", start);

  digitButtons.forEach(function(btn){
    btn.addEventListener("click", function(){
      handleAnswer(parseInt(btn.getAttribute("data-digit"), 10), "button");
    });
  });

  btnRetry.addEventListener("click", function(){
    results.classList.remove("show");
    // show start overlay again
    startOverlay.classList.remove("hidden");
    main.style.display = "none";
    timePill.style.display = "none";
    progressWrap.style.display = "none";
    progressBar.style.width = "0%";
    timePill.textContent = "2:00";
    symbolEl.textContent = "—";
    running = false;
  });

  btnNext.addEventListener("click", function(){
    if (api && typeof api.next === "function") api.next();
  });

  window.addEventListener("keydown", onKeyDown);

  // Init
  pickKey();
  lockResponses(true);
  symbolEl.textContent = "—";

  // Cleanup
  return function(){
    if (tickTimer) clearInterval(tickTimer);
    window.removeEventListener("keydown", onKeyDown);
  };
}
