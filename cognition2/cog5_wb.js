// /cognition/cog5_wb.js
// Emoji Span (working memory) — redesigned for intuitive UX (cog1/cog2 vibe)
// Key changes:
// - Start screen in the middle with clear "Forward / Backward" choice (no tiny toggle)
// - During play: almost no text, just "Watch" then "Repeat"
// - Input shows "slots" so people instantly understand how many emojis to enter
// - Tap a slot to remove that emoji (more intuitive than Backspace)
// - Auto-submits when all slots are filled (no need to press Submit)
// - Keeps localStorage saving + api.saveResult("wb", ...)
// Exports: init(container, api)

export function init(container, api) {

  container.innerHTML = `
    <style>
     .wb-wrap{
  max-width:720px;
  margin:0 auto;
  padding:16px;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;

  height:100%;
} 

.wb-stage{
  position:relative;
  width:100%;
  height:100%;
  min-height:420px;

  border-radius:20px;
  background:#F5F3F0;
  border:1px solid #E8E4DF;
  overflow:hidden;

  display:flex;
  flex-direction:column;
}

@media(max-width:600px){
  .wb-stage{
    min-height:360px;
    border-radius:16px;
  }
}
      /* Top pills (minimal) */
      .wb-topbar{
        display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;
        padding:14px 14px 0;
      }
      .wb-pill{
        display:inline-flex; align-items:center; justify-content:center;
        padding:6px 14px; border-radius:999px;
        background:rgba(0,0,0,0.06);
        font-size:13px; font-weight:700; color:#8A857E;
        font-variant-numeric:tabular-nums;
      }
      .wb-pill.strong{ color:#2D2A26; }

      .wb-progress{
        margin:10px 14px 0;
        height:5px; border-radius:999px; overflow:hidden;
        background:rgba(0,0,0,0.06);
        display:none;
      }
      .wb-progress-fill{
        height:100%; width:0%;
        background:#4A90D9;
        transition:width 0.12s linear;
      }

      /* Center area */
.wb-center{
  flex:1 1 auto;
  min-height:0;                 /* important */
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:14px;
  user-select:none;
}

.wb-display{
  width:100%;
  max-width:560px;

  flex: 1 1 auto;      /* lets it grow */
  min-height:150px;
  max-height: 420px;   /* keeps it reasonable on tall screens */

  border-radius:18px;
  background:linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,247,245,0.9));
  border:1px solid #E8E4DF;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}

      .wb-big{
        font-size:72px; font-weight:900; line-height:1;
        color:#2D2A26;
      }
      @media(max-width:600px){ .wb-big{ font-size:60px; } }

      .wb-help{
        margin-top:12px;
        font-size:14px; font-weight:650;
        color:#8A857E;
        min-height: 22px;
      }

      /* Start overlay */
      .wb-start{
        position:absolute; inset:0;
        display:flex; flex-direction:column;
        align-items:center; justify-content:center;
        gap:14px; padding:18px;
        background:#F5F3F0;
        z-index:5;
        transition:opacity .25s ease;
      }
      .wb-start.hidden{ opacity:0; pointer-events:none; }

      .wb-start-icon{ font-size:46px; }
      .wb-title{ font-size:22px; font-weight:900; color:#2D2A26; letter-spacing:-0.3px; }
      .wb-sub{ font-size:14px; color:#8A857E; line-height:1.5; max-width:420px; }

      .wb-modeRow{ display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-top:4px; }
      .wb-modeBtn{
        padding:12px 16px; border-radius:14px;
        border:1px solid #E8E4DF; background:#fff;
        cursor:pointer; font-size:14px; font-weight:850; color:#2D2A26;
        transition:all .18s ease;
        min-width: 160px;
      }
      .wb-modeBtn:hover{ background:#F5F3F0; transform:translateY(-1px); }
      .wb-modeBtn.active{ border-color:#4A90D9; box-shadow:0 0 0 4px rgba(74,144,217,0.18); }

      .wb-startBtn{
        margin-top:4px;
        padding:14px 40px; border-radius:999px; border:none;
        background:#4A90D9; color:#fff;
        font-family:inherit; font-size:16px; font-weight:850;
        cursor:pointer; transition:all .2s ease;
      }
      .wb-startBtn:hover{ background:#3D7FCC; transform:translateY(-1px); box-shadow:0 4px 16px rgba(74,144,217,0.28); }

      /* Input area */
      .wb-input{
        width:100%;
        max-width:560px;
        margin-top:12px;
      }

      .wb-slots{
        display:flex; gap:8px; flex-wrap:wrap;
        justify-content:center;
        margin-bottom:10px;
      }
      .wb-slot{
        width:46px; height:46px;
        border-radius:14px;
        border:1px solid #E8E4DF;
        background:rgba(255,255,255,0.9);
        display:flex; align-items:center; justify-content:center;
        font-size:22px;
        cursor:pointer;
        transition:transform .12s ease, box-shadow .12s ease, background-color .12s ease;
      }
      .wb-slot:hover{ transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.08); }
      .wb-slot.empty{ cursor:default; opacity:0.75; }
      .wb-slot.empty:hover{ transform:none; box-shadow:none; }

      .wb-kbd{
        display:grid;
        grid-template-columns:repeat(5,1fr);
        gap:10px;
      }
      @media(max-width:560px){ .wb-kbd{ grid-template-columns:repeat(4,1fr); } }

      .wb-key{
        padding:14px 0;
        border-radius:16px;
        border:1px solid #E8E4DF;
        background:#fff;
        cursor:pointer;
        font-size:22px;
        transition:all .18s ease;
        user-select:none;
      }
      .wb-key:hover{ background:#F5F3F0; transform:translateY(-1px); }
      .wb-key:disabled{ opacity:0.55; cursor:not-allowed; transform:none; }

      /* Results */
      .wb-results{
        display:none;
        padding:16px;
        border-top:1px solid #E8E4DF;
        background:#F5F3F0;
      }
      .wb-results.show{ display:block; }

      .wb-resultsTop{
        display:flex; align-items:center; justify-content:center; flex-direction:column;
        gap:6px; padding:6px 0 10px;
        text-align:center;
      }
      .wb-resultsEmoji{ font-size:40px; }
      .wb-resultsTitle{ font-size:20px; font-weight:900; color:#2D2A26; }

      .wb-grid{
        display:grid; grid-template-columns:repeat(3,1fr);
        gap:12px; max-width:560px; margin: 0 auto;
      }
      @media(max-width:480px){ .wb-grid{ grid-template-columns:repeat(2,1fr); } }
      .wb-card{
        background:#F5F3F0;
        border-radius:12px;
        border:1px solid #E8E4DF;
        padding:14px 12px;
        text-align:center;
      }
      .wb-card .val{ font-size:22px; font-weight:900; color:#2D2A26; }
      .wb-card .lbl{ margin-top:4px; font-size:11px; font-weight:800; color:#8A857E; }

      .wb-actions{
        margin-top:14px;
        display:flex; gap:10px; justify-content:center; flex-wrap:wrap;
      }
      .wb-btnSecondary{
        padding:10px 24px; border-radius:999px; border:1px solid #E8E4DF; background:#fff;
        font-family:inherit; font-size:14px; font-weight:900; cursor:pointer; color:#2D2A26;
        transition:all .2s ease;
      }
      .wb-btnSecondary:hover{ background:#F5F3F0; transform:translateY(-1px); }
      .wb-btnPrimary{
        padding:10px 24px; border-radius:999px; border:none; background:#4A90D9; color:#fff;
        font-family:inherit; font-size:14px; font-weight:900; cursor:pointer; transition:all .2s ease;
      }
      .wb-btnPrimary:hover{ background:#3D7FCC; transform:translateY(-1px); }

      .wb-miniHint{
        margin-top:10px;
        text-align:center;
        font-size:12px;
        color:#B5B0A8;
      }
      .wb-miniHint kbd{
        display:inline-block; padding:2px 8px; border-radius:4px;
        background:#EDEAE6; font-family:inherit; font-size:11px; font-weight:900;
      }
    </style>

    <div class="wb-wrap">
      <div class="wb-stage" id="wbStage">

        <div class="wb-start" id="wbStart">
          <div class="wb-start-icon">🧠</div>
          <div class="wb-title">Emoji Span</div>
          <div class="wb-sub">
            Watch the emojis. Then repeat them.<br/>
            Choose a mode, then start.
          </div>

          <div class="wb-modeRow">
            <button class="wb-modeBtn active" id="wbModeForward" type="button">Forward<br/><span style="font-weight:650; color:#8A857E; font-size:12px;">Same order</span></button>
            <button class="wb-modeBtn" id="wbModeBackward" type="button">Backward<br/><span style="font-weight:650; color:#8A857E; font-size:12px;">Reverse order</span></button>
          </div>

          <button class="wb-startBtn" id="wbBtnStart" type="button">Start</button>

          <div class="wb-miniHint">Tip: keyboard <kbd>1</kbd>–<kbd>9</kbd> and <kbd>0</kbd>, then <kbd>Enter</kbd></div>
        </div>

        <div class="wb-topbar">
          <div class="wb-pill strong" id="wbPhasePill">Ready</div>
          <div class="wb-pill" id="wbInfoPill">Len 3 • 1/2</div>
        </div>

        <div class="wb-progress" id="wbProgressWrap"><div class="wb-progress-fill" id="wbProgressBar"></div></div>

        <div class="wb-center">
          <div class="wb-display">
            <div class="wb-big" id="wbDisplay">—</div>
          </div>

          <div class="wb-help" id="wbHelp"></div>

          <div class="wb-input" id="wbInput" style="display:none;">
            <div class="wb-slots" id="wbSlots"></div>
            <div class="wb-kbd" id="wbKbd"></div>
          </div>
        </div>

        <div class="wb-results" id="wbResults">
          <div class="wb-resultsTop">
            <div class="wb-resultsEmoji">✅</div>
            <div class="wb-resultsTitle">Test Complete</div>
          </div>

          <div class="wb-grid" id="wbResultsGrid"></div>

          <div class="wb-actions">
            <button class="wb-btnSecondary" id="wbBtnRetry" type="button">Try again</button>
            <button class="wb-btnPrimary" id="wbBtnNext" type="button">Next test →</button>
          </div>
        </div>

      </div>
    </div>
  `;

  /********************************************************************
   * Logic
   ********************************************************************/
  const CFG = {
    storageKey: "emojiSpan.simple.v2",
    speedMs: 800,
    gapMs: 240,
    trialsPerLen: 2,
    forward: { start: 3, max: 9 },
    backward:{ start: 2, max: 8 },
    emojis: ["🍎","🍌","🍇","🍓","🥝","🍍","🥕","🥦","🌽","🥒"]
  };

  const el = {
    stage: container.querySelector("#wbStage"),

    start: container.querySelector("#wbStart"),
    modeForward: container.querySelector("#wbModeForward"),
    modeBackward: container.querySelector("#wbModeBackward"),
    btnStart: container.querySelector("#wbBtnStart"),

    phasePill: container.querySelector("#wbPhasePill"),
    infoPill: container.querySelector("#wbInfoPill"),

    progressWrap: container.querySelector("#wbProgressWrap"),
    progressBar: container.querySelector("#wbProgressBar"),

    display: container.querySelector("#wbDisplay"),
    help: container.querySelector("#wbHelp"),

    input: container.querySelector("#wbInput"),
    slots: container.querySelector("#wbSlots"),
    kbd: container.querySelector("#wbKbd"),

    results: container.querySelector("#wbResults"),
    resultsGrid: container.querySelector("#wbResultsGrid"),
    btnRetry: container.querySelector("#wbBtnRetry"),
    btnNext: container.querySelector("#wbBtnNext")
  };

  const state = {
    mode: "forward",      // forward|backward
    running: false,
    phase: "idle",        // idle|show|input|feedback|done

    len: 3,
    trial: 0,
    correctThisLen: 0,
    maxPassed: 0,

    seq: [],
    expected: [],
    answer: [],

    startedAt: null,
    totalTrials: 0,
    testTrials: 0,
    testCorrect: 0,

    timers: []
  };

  function now() { return Date.now(); }
  function nowISO() { return new Date().toISOString(); }

  function clearTimers(){
    state.timers.forEach(t => clearTimeout(t));
    state.timers = [];
  }

  function setPhase(label){
    el.phasePill.textContent = label;
  }

  function setInfo(){
    if (!state.running) { el.infoPill.textContent = "—"; return; }
    el.infoPill.textContent = `Len ${state.len} • ${state.trial + 1}/${CFG.trialsPerLen}`;
  }

  function showProgress(show){
    el.progressWrap.style.display = show ? "" : "none";
    if (!show) el.progressBar.style.width = "0%";
  }

  function setProgress(frac){
    const f = Math.max(0, Math.min(1, frac));
    el.progressBar.style.width = (f * 100).toFixed(1) + "%";
  }

  function setMode(mode){
    if (state.running) return;
    state.mode = mode;
    el.modeForward.classList.toggle("active", mode === "forward");
    el.modeBackward.classList.toggle("active", mode === "backward");
  }

  function generateSeq(len){
    const seq = [];
    let tries = 0;
    while (seq.length < len && tries < 3000){
      tries++;
      const emo = CFG.emojis[Math.floor(Math.random() * CFG.emojis.length)];
      const n = seq.length;
      if (n >= 2 && seq[n-1] === emo && seq[n-2] === emo) continue;
      seq.push(emo);
    }
    while (seq.length < len) seq.push(CFG.emojis[Math.floor(Math.random() * CFG.emojis.length)]);
    return seq;
  }

  function expectedFromSeq(seq){
    return state.mode === "forward" ? seq.slice() : seq.slice().reverse();
  }

  function renderSlots(){
    el.slots.innerHTML = "";
    const need = state.expected.length || 0;
    for (let i=0; i<need; i++){
      const slot = document.createElement("div");
      const emo = state.answer[i] || null;
      slot.className = "wb-slot" + (emo ? "" : " empty");
      slot.textContent = emo ? emo : "•";

      // Tap to remove from this position (intuitive)
      if (emo){
        slot.addEventListener("click", () => {
          if (!state.running || state.phase !== "input") return;
          state.answer.splice(i, 1);
          renderSlots();
        });
      }
      el.slots.appendChild(slot);
    }
  }

  function lockInput(locked){
    el.kbd.querySelectorAll("button").forEach(b => b.disabled = locked);
  }

  function buildKeypad(){
    el.kbd.innerHTML = "";
    for (let i=0; i<CFG.emojis.length; i++){
      const emo = CFG.emojis[i];
      const b = document.createElement("button");
      b.type = "button";
      b.className = "wb-key";
      b.textContent = emo;
      b.addEventListener("click", () => pressEmoji(emo));
      el.kbd.appendChild(b);
    }
  }

  function pressEmoji(emo){
    if (!state.running || state.phase !== "input") return;
    if (state.answer.length >= state.expected.length) return;

    state.answer.push(emo);
    renderSlots();

    // Auto-submit when complete
    if (state.answer.length === state.expected.length){
      submit();
    }
  }

  function loadSessions(){
    try{
      const raw = localStorage.getItem(CFG.storageKey);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }

  function saveSessions(sessions){
    try{
      localStorage.setItem(CFG.storageKey, JSON.stringify(sessions));
    } catch {
      // ignore storage errors (private mode/quota)
    }
  }

  function addSession(s){
    const sessions = loadSessions();
    sessions.unshift(s);
    saveSessions(sessions.slice(0, 200));
  }

  function startRun(){
    clearTimers();

    state.running = true;
    state.startedAt = nowISO();
    state.maxPassed = 0;

    state.totalTrials = 0;
    state.testTrials = 0;
    state.testCorrect = 0;

    state.trial = 0;
    state.correctThisLen = 0;

    state.len = (state.mode === "forward") ? CFG.forward.start : CFG.backward.start;

    el.results.classList.remove("show");
    el.start.classList.add("hidden");

    el.input.style.display = "none";
    el.help.textContent = "";
    el.display.textContent = "—";

    showProgress(true);
    setProgress(0);

    runTrial();
  }

  function runTrial(){
    clearTimers();

    state.phase = "show";
    setPhase("Watch");
    setInfo();

    el.input.style.display = "none";
    lockInput(true);

    state.answer = [];
    state.seq = generateSeq(state.len);
    state.expected = expectedFromSeq(state.seq);

    el.display.textContent = "•";
    el.help.textContent = "";

    // Show sequence
    let t = 0;
    for (let i=0; i<state.seq.length; i++){
      t += (i === 0 ? 260 : CFG.gapMs);
      state.timers.push(setTimeout(() => {
        el.display.textContent = state.seq[i];
        setProgress((i + 0.5) / (state.seq.length + 1));
      }, t));

      t += CFG.speedMs;
      state.timers.push(setTimeout(() => {
        el.display.textContent = "•";
        setProgress((i + 1) / (state.seq.length + 1));
      }, t));
    }

    // Switch to input
    t += 200;
    state.timers.push(setTimeout(() => {
      state.phase = "input";
      setPhase("Repeat");
      setInfo();

      el.display.textContent = "—";
      el.help.textContent = (state.mode === "forward") ? "Same order" : "Reverse order";

      el.input.style.display = "";
      renderSlots();
      lockInput(false);
      setProgress(1);
    }, t));
  }

  function submit(){
    if (!state.running) return;
    if (state.phase !== "input") return;
    if (state.answer.length !== state.expected.length) return;

    lockInput(true);
    state.phase = "feedback";

    const ok = state.answer.join("|") === state.expected.join("|");

    state.totalTrials += 1;
    state.testTrials += 1;
    if (ok){ state.testCorrect += 1; state.correctThisLen += 1; }

    el.display.textContent = ok ? "✓" : "✕";
    setPhase(ok ? "Correct" : "Not quite");

    state.trial += 1;

    state.timers.push(setTimeout(() => {
      // After 2 trials at this length
      if (state.trial >= CFG.trialsPerLen){
        const passed = state.correctThisLen >= 1;

        if (passed){
          state.maxPassed = Math.max(state.maxPassed, state.len);

          const maxLen = (state.mode === "forward") ? CFG.forward.max : CFG.backward.max;
          if (state.len >= maxLen){ finish("reached_max"); return; }

          state.len += 1;
          state.trial = 0;
          state.correctThisLen = 0;
          runTrial();
        } else {
          finish("failed_len");
        }
      } else {
        // second trial, same length
        runTrial();
      }
    }, 520));
  }

  function finish(reason){
    clearTimers();

    const span = state.maxPassed || 0;
    const acc = state.testTrials ? (state.testCorrect / state.testTrials) : null;

    const session = {
      test: "EmojiSpan",
      mode: state.mode,
      span: span,
      totalTrials: state.totalTrials,
      testTrials: state.testTrials,
      testCorrect: state.testCorrect,
      testAccuracy: acc,
      startedAt: state.startedAt,
      completedAt: nowISO(),
      settings: { speedMs: CFG.speedMs, gapMs: CFG.gapMs, trialsPerLen: CFG.trialsPerLen },
      reason: reason || "completed"
    };

    addSession(session);

    // Send to battery (guarded)
    if (api && typeof api.saveResult === "function"){
      api.saveResult("wb", {
        mode: state.mode,
        span: span,
        totalTrials: session.totalTrials,
        testAccuracy: acc === null ? null : Number(acc.toFixed(3))
      }, {
        version: "3.0_intuitive",
        reason: session.reason,
        raw: session
      });
    }

    state.running = false;
    state.phase = "done";

    showProgress(false);
    el.input.style.display = "none";
    lockInput(true);

    setPhase("Done");
    el.infoPill.textContent = (state.mode === "forward") ? "Forward" : "Backward";
    el.display.textContent = String(span);
    el.help.textContent = "Your span";

    showResults(span, acc);
  }

  function showResults(span, acc){
    const accPct = (acc === null) ? "–" : String(Math.round(acc * 100));
    const items = [
      { val: span, label: "Span" },
      { val: (state.mode === "forward" ? "Forward" : "Backward"), label: "Mode" },
      { val: accPct, label: "Accuracy (%)" },
      { val: state.testTrials, label: "Trials" },
      { val: "2", label: "Trials / length" },
      { val: "•", label: "Tap slots to undo" }
    ];

    let html = "";
    for (let i=0; i<items.length; i++){
      const r = items[i];
      html += '<div class="wb-card">';
      html += '<div class="val">' + r.val + '</div>';
      html += '<div class="lbl">' + r.label + '</div>';
      html += '</div>';
    }
    el.resultsGrid.innerHTML = html;
    el.results.classList.add("show");
  }

  // Keyboard: 1–9 = first 9 emojis, 0 = last emoji, Backspace removes last, Enter submits
  function onKeydown(e){
    if (!state.running) return;

    if (state.phase === "input"){
      if (e.key >= "0" && e.key <= "9"){
        const map = { "1":0,"2":1,"3":2,"4":3,"5":4,"6":5,"7":6,"8":7,"9":8,"0":9 };
        const idx = map[e.key];
        const emo = CFG.emojis[idx];
        pressEmoji(emo);
      } else if (e.key === "Backspace"){
        state.answer.pop();
        renderSlots();
      } else if (e.key === "Enter"){
        submit();
      } else if (e.key === "Escape"){
        state.answer = [];
        renderSlots();
      }
    }
  }

  // Events
  el.modeForward.addEventListener("click", () => setMode("forward"));
  el.modeBackward.addEventListener("click", () => setMode("backward"));
  el.btnStart.addEventListener("click", startRun);

  el.btnRetry.addEventListener("click", () => {
    el.results.classList.remove("show");
    el.start.classList.remove("hidden");
    el.display.textContent = "—";
    el.help.textContent = "";
    setPhase("Ready");
    el.infoPill.textContent = "—";
    showProgress(false);
  });

  el.btnNext.addEventListener("click", () => {
    if (api && typeof api.next === "function") api.next();
  });

  window.addEventListener("keydown", onKeydown);

  // Init UI
  buildKeypad();
  setPhase("Ready");
  el.infoPill.textContent = "—";
  el.display.textContent = "—";
  el.help.textContent = "";
  showProgress(false);

  // Cleanup
  return () => {
    clearTimers();
    window.removeEventListener("keydown", onKeydown);
  };
}
