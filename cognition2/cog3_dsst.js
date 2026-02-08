// cog3_dsst.js - DSST (Digit Symbol Substitution Test)
// Minimal, lay-friendly version.
// Exports: init(container, api)

export function init(container, api) {

  // ---------- UI ----------
  container.innerHTML = [
    '<style>',
    '.dsst-wrap { max-width:720px; margin:0 auto; padding:16px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif; -webkit-font-smoothing:antialiased; }',

    '.dsst-stage { position:relative; width:100%; border-radius:20px; background:#F5F3F0; border:1px solid #E8E4DF; overflow:hidden; padding:16px; }',
    '@media(max-width:600px){ .dsst-stage { border-radius:16px; } }',

    '.dsst-start { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:12px; padding:28px 14px; }',
    '.dsst-title { font-size:22px; font-weight:800; color:#2D2A26; letter-spacing:-0.3px; }',
    '.dsst-sub { font-size:14px; color:#8A857E; max-width:440px; line-height:1.5; }',
    '.dsst-start-btn { margin-top:4px; padding:14px 40px; border-radius:999px; border:none; background:#4A90D9; color:white; font-family:inherit; font-size:16px; font-weight:700; cursor:pointer; transition:all 0.2s ease; }',
    '.dsst-start-btn:hover{ background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.28); }',

    '.dsst-toprow { display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px; }',
    '.dsst-pill { padding:6px 14px; border-radius:999px; background:rgba(0,0,0,0.06); font-size:13px; font-weight:700; color:#8A857E; font-variant-numeric:tabular-nums; }',
    '.dsst-pill.strong { color:#2D2A26; }',

    '.dsst-progress { height:5px; background:rgba(0,0,0,0.06); border-radius:999px; overflow:hidden; margin:10px 0 14px; display:none; }',
    '.dsst-progress-fill { height:100%; width:0%; background:#4A90D9; transition:width 0.12s linear; }',

    '.dsst-key { display:grid; grid-template-columns:repeat(9, 1fr); gap:8px; margin-top:6px; }',
    '.dsst-key-card { background:rgba(255,255,255,0.7); border:1px solid #E8E4DF; border-radius:12px; padding:10px 8px; text-align:center; }',
    '.dsst-key-emoji { font-size:24px; line-height:1; }',
    '.dsst-key-digit { margin-top:6px; font-size:14px; font-weight:800; color:#2D2A26; }',

    '.dsst-main { display:none; }',

    '.dsst-itemRow { display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:14px; align-items:stretch; }',
    '@media(max-width:700px){ .dsst-itemRow { grid-template-columns:1fr; } }',

    '.dsst-symbolBox { background:linear-gradient(180deg, rgba(248,249,250,0.9), rgba(255,255,255,0.9)); border:1px solid #E8E4DF; border-radius:16px; min-height:140px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }',
    '.dsst-symbol { font-size:56px; line-height:1; }',
    '.dsst-hint { font-size:14px; font-weight:700; color:#2D2A26; }',
    '.dsst-subhint { font-size:12px; color:#8A857E; max-width:320px; text-align:center; line-height:1.4; }',

    '.dsst-kbd { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }',
    '.dsst-kbd button { padding:14px 0; border-radius:14px; border:1px solid #E8E4DF; background:white; cursor:pointer; font-size:18px; font-weight:800; color:#2D2A26; transition:all 0.18s ease; }',
    '.dsst-kbd button:hover { background:#F5F3F0; transform:translateY(-1px); }',
    '.dsst-kbd button:disabled { opacity:0.55; cursor:not-allowed; transform:none; }',

    '.dsst-results { display:none; flex-direction:column; align-items:center; gap:8px; padding:20px 0 0; }',
    '.dsst-results.show { display:flex; }',
    '.dsst-results-emoji { font-size:40px; }',
    '.dsst-results-title { font-size:20px; font-weight:800; color:#2D2A26; }',
    '.dsst-results-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:100%; max-width:420px; margin-top:8px; }',
    '@media(max-width:480px){ .dsst-results-grid { grid-template-columns:repeat(2,1fr); } }',
    '.dsst-result-card { background:#F5F3F0; border-radius:12px; padding:14px 12px; text-align:center; }',
    '.dsst-result-card .val { font-size:22px; font-weight:800; color:#2D2A26; }',
    '.dsst-result-card .val .unit { font-size:14px; font-weight:700; color:#8A857E; }',
    '.dsst-result-card .lbl { font-size:11px; color:#8A857E; margin-top:4px; font-weight:700; }',

    '.dsst-actions { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; justify-content:center; }',
    '.dsst-btn-secondary { padding:10px 24px; border-radius:999px; border:1px solid #E8E4DF; background:white; font-family:inherit; font-size:14px; font-weight:800; cursor:pointer; color:#2D2A26; transition:all 0.2s ease; }',
    '.dsst-btn-secondary:hover { background:#F5F3F0; transform:translateY(-1px); }',
    '.dsst-btn-next { padding:10px 24px; border-radius:999px; border:none; background:#4A90D9; color:white; font-family:inherit; font-size:14px; font-weight:800; cursor:pointer; transition:all 0.2s ease; }',
    '.dsst-btn-next:hover { background:#3D7FCC; transform:translateY(-1px); }',

    '.dsst-keyhint { text-align:center; font-size:12px; color:#B5B0A8; margin-top:10px; }',
    '.dsst-keyhint kbd { display:inline-block; padding:2px 8px; border-radius:4px; background:#EDEAE6; font-family:inherit; font-size:11px; font-weight:800; }',
    '</style>',

    '<div class="dsst-wrap">',
      '<div class="dsst-stage">',

        '<div id="dsstStart" class="dsst-start">',
          '<div class="dsst-title">Symbol Matching</div>',
          '<div class="dsst-sub">Match the emoji to the correct number using the key. First a short practice, then a 2-minute test.</div>',
          '<button id="dsstBtnStart" class="dsst-start-btn" type="button">Start</button>',
        '</div>',

        '<div id="dsstMain" class="dsst-main">',

          '<div class="dsst-toprow">',
            '<div class="dsst-pill strong" id="dsstPhasePill">Practice</div>',
            '<div class="dsst-pill" id="dsstTimePill">2:00</div>',
          '</div>',

          '<div class="dsst-progress" id="dsstProgressWrap"><div class="dsst-progress-fill" id="dsstProgressBar"></div></div>',

          '<div class="dsst-sub" style="margin-top:2px; margin-bottom:10px;">Use the key below. Tap a number (or press 1–9).</div>',
          '<div class="dsst-key" id="dsstKey"></div>',

          '<div class="dsst-itemRow">',
            '<div class="dsst-symbolBox">',
              '<div class="dsst-symbol" id="dsstSymbol">—</div>',
              '<div class="dsst-hint" id="dsstHint">Practice</div>',
              '<div class="dsst-subhint" id="dsstSubHint">Try to be accurate first.</div>',
            '</div>',

            '<div>',
              '<div class="dsst-kbd" id="dsstKbd">',
                '<button type="button" data-digit="1">1</button>',
                '<button type="button" data-digit="2">2</button>',
                '<button type="button" data-digit="3">3</button>',
                '<button type="button" data-digit="4">4</button>',
                '<button type="button" data-digit="5">5</button>',
                '<button type="button" data-digit="6">6</button>',
                '<button type="button" data-digit="7">7</button>',
                '<button type="button" data-digit="8">8</button>',
                '<button type="button" data-digit="9">9</button>',
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

        '<div class="dsst-keyhint" id="dsstKeyHint">Keyboard: press <kbd>1</kbd> to <kbd>9</kbd></div>',

      '</div>',
    '</div>'
  ].join('\n');

  // ---------- Fixed defaults ----------
  var PRACTICE_N = 10;
  var DURATION_MS = 120000; // 2 min
  var KEY_SIZE = 9;
  var EMOJI_POOL = [
    "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🍍","🥝","🥭","🍏",
    "🥕","🌽","🥦","🥒","🫑","🍆","🥬","🧄","🧅","🥔","🍠","🫘"
  ];

  // ---------- Elements ----------
  var startScreen = container.querySelector("#dsstStart");
  var btnStart = container.querySelector("#dsstBtnStart");

  var main = container.querySelector("#dsstMain");
  var phasePill = container.querySelector("#dsstPhasePill");
  var timePill = container.querySelector("#dsstTimePill");
  var progressWrap = container.querySelector("#dsstProgressWrap");
  var progressBar = container.querySelector("#dsstProgressBar");

  var keyEl = container.querySelector("#dsstKey");
  var symbolEl = container.querySelector("#dsstSymbol");
  var hintEl = container.querySelector("#dsstHint");
  var subHintEl = container.querySelector("#dsstSubHint");

  var kbd = container.querySelector("#dsstKbd");
  var digitButtons = Array.from(container.querySelectorAll("[data-digit]"));

  var results = container.querySelector("#dsstResults");
  var resultsGrid = container.querySelector("#dsstResultsGrid");
  var btnRetry = container.querySelector("#dsstBtnRetry");
  var btnNext = container.querySelector("#dsstBtnNext");
  var keyHint = container.querySelector("#dsstKeyHint");

  // ---------- State ----------
  var running = false;
  var phase = "idle"; // idle | practice | test | done

  var key = null; // { digitToEmoji: {1..9}, emojiToDigit: {emoji: digit} }
  var practiceDone = 0;

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

  function pickKey() {
    var em = shuffle(EMOJI_POOL).slice(0, KEY_SIZE);
    var digitToEmoji = {};
    var emojiToDigit = {};
    for (var d = 1; d <= 9; d++) {
      digitToEmoji[d] = em[d - 1];
      emojiToDigit[em[d - 1]] = d;
    }
    key = { digitToEmoji: digitToEmoji, emojiToDigit: emojiToDigit };
    renderKey();
  }

  function renderKey() {
    keyEl.innerHTML = "";
    for (var d = 1; d <= 9; d++) {
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
    if (!running || phase !== "test") { progressBar.style.width = "0%"; return; }
    var frac = Math.max(0, Math.min(1, (now() - tStart) / (tEnd - tStart)));
    progressBar.style.width = (frac * 100).toFixed(1) + "%";
  }

  function updateTime() {
    if (!running || phase !== "test" || !tEnd) return;
    var remain = Math.max(0, tEnd - now());
    var sec = Math.ceil(remain / 1000);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    timePill.textContent = m + ":" + (s < 10 ? "0" : "") + s;
  }

  function nextItem() {
    var d = 1 + Math.floor(Math.random() * 9);
    currentDigit = d;
    currentEmoji = key.digitToEmoji[d];
    itemShownAt = now();

    symbolEl.textContent = currentEmoji;

    if (phase === "practice") {
      phasePill.textContent = "Practice";
      hintEl.textContent = "Practice";
      subHintEl.textContent = "Accuracy first. This part is not counted.";
    } else {
      phasePill.textContent = "Test";
      hintEl.textContent = "Test";
      subHintEl.textContent = "Go as fast as you can, without guessing too much.";
    }
  }

  function beginPractice() {
    phase = "practice";
    practiceDone = 0;
    correct = 0;
    errors = 0;
    rts = [];
    trials = [];

    running = true;

    startScreen.style.display = "none";
    results.classList.remove("show");
    keyHint.style.display = "";

    main.style.display = "block";
    progressWrap.style.display = "none";
    timePill.textContent = "2:00";

    lockResponses(false);
    nextItem();
  }

  function beginTest() {
    phase = "test";
    phasePill.textContent = "Test";
    progressWrap.style.display = "block";

    tStart = now();
    tEnd = tStart + DURATION_MS;

    updateProgress();
    updateTime();

    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(function(){
      updateProgress();
      updateTime();
      if (now() >= tEnd) finishAndSave();
    }, 120);

    nextItem();
  }

  function start() {
    if (!key) pickKey();
    beginPractice();
  }

  function handleAnswer(answerDigit, source) {
    if (!running) return;
    if (!currentDigit) return;

    var rt = itemShownAt ? (now() - itemShownAt) : null;
    var isCorrect = (answerDigit === currentDigit);

    trials.push({
      ts: nowISO(),
      phase: phase,
      emoji: currentEmoji,
      correctDigit: currentDigit,
      answerDigit: answerDigit,
      correct: isCorrect,
      rtMs: rt,
      source: source || "button"
    });

    if (phase === "practice") {
      practiceDone += 1;
      if (practiceDone >= PRACTICE_N) {
        lockResponses(true);
        subHintEl.textContent = "Practice complete. Starting the timed test…";
        setTimeout(function(){
          lockResponses(false);
          beginTest();
        }, 450);
        return;
      }
      nextItem();
      return;
    }

    // Timed test scoring
    if (isCorrect) correct += 1;
    else errors += 1;
    if (rt != null) rts.push(rt);

    nextItem();
  }

  function finishAndSave() {
    if (!running) return;

    running = false;
    phase = "done";

    if (tickTimer) clearInterval(tickTimer);
    tickTimer = null;

    lockResponses(true);
    main.style.display = "none";
    keyHint.style.display = "none";

    var attempted = correct + errors;
    var ipm = attempted ? (attempted / (DURATION_MS / 1000)) * 60 : 0;
    var med = median(rts);

    var raw = {
      test: "DSST",
      durationMs: DURATION_MS,
      practiceN: PRACTICE_N,
      correct: correct,
      errors: errors,
      attempted: attempted,
      itemsPerMin: ipm,
      medianRtMs: (med != null) ? Math.round(med) : null,
      completedAt: nowISO(),
      key: key,
      trials: trials
    };

    api.saveResult("dsst", {
      correct_n: correct,
      errors_n: errors,
      itemsPerMin: Number(ipm.toFixed(1)),
      medianRT_ms: (med != null) ? Math.round(med) : null
    }, {
      duration_s: Math.round(DURATION_MS / 1000),
      practice_n: PRACTICE_N,
      version: "2.0",
      raw: raw
    });

    showResultsUI(correct, errors, ipm, med);
  }

  function showResultsUI(correctN, errorsN, ipm, med) {
    var items = [
      { val: correctN, unit: "", label: "Correct" },
      { val: errorsN, unit: "", label: "Errors" },
      { val: ipm.toFixed(1), unit: "", label: "Items / min" },
      { val: (med != null ? Math.round(med) : "–"), unit: "ms", label: "Median speed" },
      { val: 2, unit: "min", label: "Duration" },
      { val: PRACTICE_N, unit: "", label: "Practice items" }
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
    if (e.key >= "1" && e.key <= "9") {
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
    startScreen.style.display = "";
    main.style.display = "none";
    keyHint.style.display = "";
    phase = "idle";
    running = false;
    symbolEl.textContent = "—";
  });

  btnNext.addEventListener("click", function(){ api.next(); });

  window.addEventListener("keydown", onKeyDown);

  // Init
  pickKey();
  lockResponses(true);

  // Cleanup
  return function(){
    if (tickTimer) clearInterval(tickTimer);
    window.removeEventListener("keydown", onKeyDown);
  };
}
