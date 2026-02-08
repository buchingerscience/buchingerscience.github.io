// cog4_tmt.js
// Minimal Trail Making Test (TMT)
// Exports: init(container, api)

export function init(container, api) {

  container.innerHTML = `
    <style>
      .tmt-wrap {
        max-width: 720px;
        margin: 0 auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      }

      .tmt-top {
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:12px;
        flex-wrap:wrap;
        gap:10px;
      }

      .tmt-title {
        font-weight:700;
        font-size:18px;
      }

      .tmt-badges {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }

      .tmt-badge {
        padding:6px 12px;
        border-radius:999px;
        background:#F1EFEC;
        font-size:13px;
        font-weight:600;
      }

      .tmt-arena {
        position:relative;
        height:420px;
        border-radius:12px;
        border:1px solid #E8E4DF;
        background:#F8F6F3;
        overflow:hidden;
      }

      .tmt-node {
        position:absolute;
        width:44px;
        height:44px;
        border-radius:50%;
        background:white;
        border:1px solid #D9D4CF;
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:700;
        cursor:pointer;
        transform:translate(-50%,-50%);
        transition:all 0.12s ease;
      }

      .tmt-node:hover {
        background:#F0ECE8;
      }

      .tmt-node.active {
        box-shadow:0 0 0 4px rgba(74,144,217,0.25);
      }

      .tmt-node.done {
        background:#E7F4EC;
        border-color:#B6E0C8;
      }

      svg {
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        pointer-events:none;
      }

      .tmt-finish {
        margin-top:16px;
        text-align:center;
      }

      .tmt-btn {
        padding:10px 22px;
        border-radius:999px;
        border:none;
        background:#4A90D9;
        color:white;
        font-weight:600;
        cursor:pointer;
      }
    </style>

    <div class="tmt-wrap">
      <div class="tmt-top">
        <div class="tmt-title">Trail Making Test</div>
        <div class="tmt-badges">
          <div class="tmt-badge" id="badgeTime">Time: –</div>
          <div class="tmt-badge" id="badgeErrors">Errors: 0</div>
        </div>
      </div>

      <div class="tmt-arena" id="arena">
        <svg id="lines" viewBox="0 0 1000 700" preserveAspectRatio="none"></svg>
      </div>

      <div class="tmt-finish" id="finishArea" style="display:none;">
        <button class="tmt-btn" id="btnNext">Next test →</button>
      </div>
    </div>
  `;

  const arena = container.querySelector("#arena");
  const lines = container.querySelector("#lines");
  const badgeTime = container.querySelector("#badgeTime");
  const badgeErrors = container.querySelector("#badgeErrors");
  const btnNext = container.querySelector("#btnNext");
  const finishArea = container.querySelector("#finishArea");

  const CONFIG = {
    totalTargets: 24,
    arenaW: 1000,
    arenaH: 700,
    margin: 80,
    minDist: 70
  };

  const state = {
    nodes: [],
    order: [],
    currentIndex: 0,
    errors: 0,
    running: false,
    tStart: null,
    timer: null,
    correctClicks: [],
    pathLen: 0
  };

  function now(){ return Date.now(); }

  function fmtMs(ms){
    const s = ms/1000;
    return s.toFixed(1) + " s";
  }

  function requiredOrder(){
    const order=[];
    for(let i=1;i<=CONFIG.totalTargets/2;i++){
      order.push(String(i));
      order.push(String.fromCharCode(64+i));
    }
    return order;
  }

  function distance(a,b){
    const dx=a.x-b.x;
    const dy=a.y-b.y;
    return Math.sqrt(dx*dx+dy*dy);
  }

  function generatePositions(count){
    const pts=[];
    while(pts.length<count){
      const x=CONFIG.margin+Math.random()*(CONFIG.arenaW-2*CONFIG.margin);
      const y=CONFIG.margin+Math.random()*(CONFIG.arenaH-2*CONFIG.margin);
      let ok=true;
      for(const p of pts){
        if(distance(p,{x,y})<CONFIG.minDist){ ok=false; break;}
      }
      if(ok) pts.push({x,y});
    }
    return pts;
  }

  function clearArena(){
    arena.querySelectorAll(".tmt-node").forEach(n=>n.remove());
    lines.innerHTML="";
    state.nodes=[];
  }

  function drawLine(a,b){
    const x1=a.x/CONFIG.arenaW*1000;
    const y1=a.y/CONFIG.arenaH*700;
    const x2=b.x/CONFIG.arenaW*1000;
    const y2=b.y/CONFIG.arenaH*700;

    const line=document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1",x1);
    line.setAttribute("y1",y1);
    line.setAttribute("x2",x2);
    line.setAttribute("y2",y2);
    line.setAttribute("stroke","rgba(0,0,0,0.4)");
    line.setAttribute("stroke-width","3");
    line.setAttribute("stroke-linecap","round");
    lines.appendChild(line);
  }

  function markActive(){
    state.nodes.forEach(n=>n.el.classList.remove("active"));
    const next=state.order[state.currentIndex];
    const node=state.nodes.find(n=>n.label===next);
    if(node) node.el.classList.add("active");
  }

  function start(){
    state.running=true;
    state.tStart=now();
    state.timer=setInterval(()=>{
      badgeTime.textContent="Time: "+fmtMs(now()-state.tStart);
    },100);
  }

  function finish(){
    clearInterval(state.timer);
    state.running=false;

    const duration=now()-state.tStart;
    const acc=(CONFIG.totalTargets-1)/(CONFIG.totalTargets-1+state.errors);

    badgeTime.textContent="Time: "+fmtMs(duration);
    finishArea.style.display="block";

    api.saveResult("tmt",{
      completionTime_ms:duration,
      errors_n:state.errors,
      accuracy:Number(acc.toFixed(3)),
      pathLen_px:Math.round(state.pathLen)
    },{
      targets_n:CONFIG.totalTargets,
      version:"1.0"
    });
  }

  function onNodeClick(label){
    if(!state.running) start();

    const expected=state.order[state.currentIndex];
    if(label!==expected){
      state.errors++;
      badgeErrors.textContent="Errors: "+state.errors;
      return;
    }

    const node=state.nodes.find(n=>n.label===label);
    node.el.classList.add("done");
    node.el.classList.remove("active");

    const last=state.correctClicks[state.correctClicks.length-1];
    if(last){
      drawLine(last,node);
      state.pathLen+=distance(last,node);
    }

    state.correctClicks.push(node);
    state.currentIndex++;

    if(state.currentIndex>=state.order.length){
      finish();
      return;
    }

    markActive();
  }

  function initLayout(){
    clearArena();
    state.order=requiredOrder();
    const pts=generatePositions(CONFIG.totalTargets);
    const shuffled=state.order.slice().sort(()=>Math.random()-0.5);

    for(let i=0;i<CONFIG.totalTargets;i++){
      const label=shuffled[i];
      const p=pts[i];

      const div=document.createElement("div");
      div.className="tmt-node";
      div.textContent=label;
      div.style.left=(p.x/CONFIG.arenaW*100)+"%";
      div.style.top=(p.y/CONFIG.arenaH*100)+"%";
      div.addEventListener("click",()=>onNodeClick(label));

      arena.appendChild(div);
      state.nodes.push({label,x:p.x,y:p.y,el:div});
    }

    markActive();
  }

  btnNext.addEventListener("click",()=>api.next());

  initLayout();

  return ()=>{
    if(state.timer) clearInterval(state.timer);
  };
}
