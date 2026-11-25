/* Nexus extras: three features layered on the prototype.
   1. Workflow Canvas  - drag, connect and run agents on a live canvas
   2. Run Theater      - watch an agent think in real time, replay it, see tokens and cost
   3. Describe-it      - type what you want in plain English, Nex builds the agent and the workflow
   Everything is simulated in the browser: no model is called and nothing leaves the page. */
(function () {
  'use strict';

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.sheet.wide{width:min(720px,94vw)}',
    /* canvas */
    '.cvwrap{border:1px solid var(--line);border-radius:var(--r);background:var(--card);backdrop-filter:blur(28px) saturate(1.7);-webkit-backdrop-filter:blur(28px) saturate(1.7);box-shadow:var(--shadow);overflow:auto}',
    '.cvin{position:relative;min-width:700px;height:430px;background-image:radial-gradient(var(--line2) 1px,transparent 1px);background-size:22px 22px;touch-action:none}',
    '.wires{position:absolute;inset:0;width:100%;height:100%;overflow:visible}',
    '.w{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round;opacity:.7;pointer-events:none;transition:stroke .3s}',
    '.w.flow{stroke:var(--accent);opacity:1;stroke-dasharray:7 9;animation:wflow .5s linear infinite}',
    '.w.done{stroke:var(--ok);opacity:1}',
    '@keyframes wflow{to{stroke-dashoffset:-16}}',
    '.nd{position:absolute;width:156px;height:60px;display:flex;align-items:center;gap:10px;padding:0 12px;border-radius:16px;background:var(--pop);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.18);cursor:grab;user-select:none;transition:box-shadow .3s,border-color .3s}',
    '.nd:active{cursor:grabbing}',
    '.nd.run{border-color:var(--accent);box-shadow:0 0 0 3px var(--chip),0 8px 28px rgba(0,0,0,.25);animation:ndpulse .9s ease-in-out infinite}',
    '.nd.ok{border-color:var(--ok)}',
    '@keyframes ndpulse{50%{transform:scale(1.04)}}',
    '.ndi{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:var(--chip);color:var(--accent);flex:none}',
    '.ndi svg{width:16px;height:16px}',
    '.ndt{min-width:0}.ndt b{display:block;font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:84px}',
    '.ndt small{font-size:.68rem;color:var(--muted)}',
    '.ndx{position:absolute;top:-8px;right:-8px;width:20px;height:20px;border-radius:50%;border:1px solid var(--line2);background:var(--pop);color:var(--muted);font-size:.8rem;line-height:1;display:none;cursor:pointer}',
    '.nd:hover .ndx{display:block}',
    '.prt{position:absolute;top:24px;width:12px;height:12px;border-radius:50%;background:var(--pop);border:2px solid var(--muted);box-sizing:border-box}',
    '.prt.in{left:-7px}.prt.out{right:-7px;cursor:crosshair}.prt.out:hover{border-color:var(--accent);transform:scale(1.4)}',
    '.nd[data-t=trigger] .prt.in,.nd[data-t=output] .prt.out{display:none}',
    '.chips{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:14px 0}',
    '.chips button{display:inline-flex;align-items:center;gap:7px;padding:.42rem .8rem;border-radius:999px;border:1px solid var(--line2);background:var(--hover);color:var(--text);font-size:.78rem;cursor:pointer;transition:.2s}',
    '.chips button:hover{transform:translateY(-1px);border-color:var(--accent)}',
    '.chips button.on{background:var(--accent);color:var(--on-accent);border-color:transparent}',
    '.chips svg{width:14px;height:14px}',
    '.wflog{margin-top:14px;max-height:150px;overflow:auto;font:500 .78rem ui-monospace,Consolas,monospace;color:var(--muted)}',
    '.wflog p{margin:0;padding:3px 0;border-top:1px solid var(--line2)}.wflog p b{color:var(--text);font-weight:600}',
    '.wfname{background:transparent;border:0;border-bottom:1px dashed var(--line2);color:var(--text);font:600 1rem inherit;padding:2px 0;outline:none;min-width:160px}',
    /* theater */
    '.th .thh{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.th .thh b{font-size:1.05rem;display:block}.th .thh small{color:var(--muted);font-size:.78rem}',
    '.thm{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}',
    '.thm div{padding:12px 14px;border-radius:16px;background:var(--hover);border:1px solid var(--line2)}.thm small{display:block;font-size:.7rem;color:var(--muted)}.thm b{font-size:1.3rem;font-variant-numeric:tabular-nums}',
    '.thl{max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:8px;padding-right:4px}',
    '.ts{padding:10px 12px;border-radius:14px;font-size:.84rem;line-height:1.45;border:1px solid var(--line2);background:var(--hover);animation:tsin .35s cubic-bezier(.2,.8,.2,1)}',
    '@keyframes tsin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '.ts small{display:block;font-size:.66rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}',
    '.ts.tool{font-family:ui-monospace,Consolas,monospace;font-size:.78rem}.ts.tool em{font-style:normal;color:var(--ok)}',
    '.ts.final{background:var(--chip);border-color:var(--accent)}',
    '.thf{margin-top:14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}.thf input[type=range]{flex:1;min-width:140px;accent-color:var(--accent)}',
    '.thnote{font-size:.7rem;color:var(--muted);margin-top:10px}',
    /* builder */
    '.bld textarea{min-height:86px}',
    '.bsteps{margin:14px 0;display:flex;flex-direction:column;gap:6px}',
    '.bsteps p{margin:0;font-size:.84rem;color:var(--muted);display:flex;gap:10px;align-items:center;animation:tsin .35s}.bsteps p i{width:16px;height:16px;border-radius:50%;border:2px solid var(--line2);flex:none;display:grid;place-items:center;font-style:normal;font-size:.6rem}.bsteps p.ok{color:var(--text)}.bsteps p.ok i{background:var(--ok);border-color:var(--ok);color:#fff}',
    '.bcard{padding:16px;border-radius:18px;border:1px solid var(--accent);background:var(--chip);animation:tsin .4s}.bcard h4{margin:0 0 4px;font-size:1.05rem}.bcard p{margin:0 0 10px;font-size:.84rem;color:var(--muted)}',
    '.tag{display:inline-block;padding:.22rem .6rem;border-radius:999px;font-size:.72rem;background:var(--hover);border:1px solid var(--line2);margin:0 6px 6px 0}'
  ].join('\n');
  document.head.appendChild(css);

  /* ---------- helpers ---------- */
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var uid = function () { return 'n' + Math.random().toString(36).slice(2, 8); };
  var money = function (c) { return '$' + (c < 1 ? c.toFixed(4) : c.toFixed(2)); };
  var NT = {
    trigger: { n: 'Trigger', i: 'Activity' }, agent: { n: 'Agent', i: 'Agents' }, branch: { n: 'Branch', i: 'Context' },
    transform: { n: 'Transform', i: 'Tools' }, parallel: { n: 'Parallel', i: 'Workflows' }, output: { n: 'Output', i: 'Files' }
  };
  var W = 156, H = 60;

  /* =========================================================
     1. WORKFLOW CANVAS
     ========================================================= */
  var wfCur = 0, wfRunning = false;
  function wfs() { return S.data.workflows; }
  function curWf() {
    var w = wfs()[wfCur];
    if (w && !w.nodes) { w.nodes = []; w.edges = []; }
    return w;
  }
  function newWf(name, nodes, edges) {
    wfs().push({ name: name || 'Workflow ' + (wfs().length + 1), desc: 'Built on the canvas', nodes: nodes || [], edges: edges || [] });
    wfCur = wfs().length - 1; save();
  }
  function exampleFlow() {
    var a = S.data.agents[0] ? S.data.agents[0].name : 'Triage agent';
    var b = S.data.agents[1] ? S.data.agents[1].name : 'Responder';
    var n = [
      { id: 't1', type: 'trigger', label: 'New alert arrives', x: 16, y: 70 },
      { id: 'a1', type: 'agent', label: a, x: 190, y: 70 },
      { id: 'b1', type: 'branch', label: 'Is it urgent?', x: 364, y: 70 },
      { id: 'p1', type: 'parallel', label: 'Notify + ticket', x: 538, y: 70 },
      { id: 'a2', type: 'agent', label: b, x: 364, y: 250 },
      { id: 'o1', type: 'output', label: 'Send to Slack', x: 538, y: 250 }
    ];
    var e = [['t1', 'a1'], ['a1', 'b1'], ['b1', 'p1'], ['b1', 'a2'], ['p1', 'o1'], ['a2', 'o1']];
    return { n: n, e: e };
  }

  function viewWorkflows() {
    var p = PAGES.Workflows, w = curWf();
    if (!w) {
      return head('Workflows', p.desc, '<button class="btn2" data-x="wf-example">Load an example</button><button class="btn" data-x="wf-new">+ Open the canvas</button>') +
        '<div class="card empty a d2">' + emptyIco('Workflows') + '<h3>Build your first workflow</h3><p>Add steps to a live canvas, wire them together by dragging, then press Run and watch the data flow through. Or have Nex build one for you from a sentence.</p>' +
        '<div class="row" style="justify-content:center;gap:10px"><button class="btn" data-x="wf-new">Open the canvas</button><button class="btn2" data-x="wf-example">Load an example</button><button class="btn2" data-x="build">✨ Describe it to Nex</button></div></div>';
    }
    var tabs = wfs().length > 1 ? '<div class="chips">' + wfs().map(function (x, i) { return '<button class="' + (i === wfCur ? 'on' : '') + '" data-x="wf-pick:' + i + '">' + esc(x.name) + '</button>'; }).join('') + '</div>' : '';
    var pal = '<div class="chips"><small class="muted" style="font-size:.78rem">Add a step:</small>' + Object.keys(NT).map(function (k) { return '<button data-x="wf-add:' + k + '">' + svg(NT[k].i) + NT[k].n + '</button>'; }).join('') + '</div>';
    return head('Workflows', p.desc,
      '<button class="btn2" data-x="build">✨ Describe it</button><button class="btn2" data-x="wf-example">Load example</button><button class="btn2" data-x="wf-new">+ New</button><button class="btn" data-x="wf-run">▶ Run workflow</button>') +
      tabs + '<div class="row a d2" style="gap:12px;margin-bottom:6px"><input class="wfname" id="wfname" value="' + esc(w.name) + '" aria-label="Workflow name"><button class="btn2" data-x="wf-delete" style="margin-left:auto">Delete workflow</button></div>' + pal +
      '<div class="cvwrap a d3"><div class="cvin" id="cv"><svg class="wires" id="wires"></svg></div></div>' +
      '<p class="muted" style="font-size:.76rem;margin-top:10px">Drag a step to move it. Pull from the dot on its right edge to another step to connect them. Double-click a wire to cut it. Hover a step and press × to remove it.</p>' +
      '<div class="wflog" id="wflog"></div>';
  }

  function nodeHtml(n) {
    var t = NT[n.type];
    return '<div class="nd" data-id="' + n.id + '" data-t="' + n.type + '" style="left:' + n.x + 'px;top:' + n.y + 'px"><span class="ndi">' + svg(t.i) + '</span><div class="ndt"><b>' + esc(n.label) + '</b><small>' + t.n + '</small></div><button class="ndx" data-x="wf-rm:' + n.id + '" aria-label="Remove step">×</button><i class="prt in"></i><i class="prt out"></i></div>';
  }
  function paint() {
    var cv = document.getElementById('cv'), w = curWf();
    if (!cv || !w) return;
    cv.querySelectorAll('.nd').forEach(function (e) { e.remove(); });
    w.nodes.forEach(function (n) { cv.insertAdjacentHTML('beforeend', nodeHtml(n)); });
    drawWires();
  }
  function pos(id) { var n = curWf().nodes.find(function (x) { return x.id === id; }); return n; }
  function wire(a, b) {
    var x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2, d = Math.max(50, Math.abs(x2 - x1) / 2);
    return 'M' + x1 + ' ' + y1 + ' C' + (x1 + d) + ' ' + y1 + ',' + (x2 - d) + ' ' + y2 + ',' + x2 + ' ' + y2;
  }
  function drawWires(live) {
    var sv = document.getElementById('wires'), w = curWf();
    if (!sv || !w) return;
    var h = '';
    w.edges.forEach(function (e, i) {
      var a = pos(e[0]), b = pos(e[1]);
      if (!a || !b) return;
      var d = wire(a, b), cls = (live && live[e[0] + '>' + e[1]]) || '';
      h += '<path class="w ' + cls + '" d="' + d + '"/><path class="wh" data-ei="' + i + '" d="' + d + '" fill="none" stroke="transparent" stroke-width="16" style="pointer-events:stroke;cursor:pointer"/>';
    });
    h += '<path id="tmpw" class="w flow" d="" style="display:none"/>';
    sv.innerHTML = h;
  }
  function addNode(type) {
    var w = curWf(); if (!w) return;
    var k = w.nodes.length, labs = { trigger: 'Manual start', agent: (S.data.agents[k % Math.max(1, S.data.agents.length)] || { name: 'Agent' }).name, branch: 'If / else', transform: 'Reshape data', parallel: 'Run in parallel', output: 'Deliver result' };
    w.nodes.push({ id: uid(), type: type, label: labs[type], x: 16 + (k % 4) * 174, y: 30 + Math.floor(k / 4) * 130 + (k % 2) * 40 });
    save(); paint();
  }

  /* pointer interactions on the canvas */
  document.addEventListener('pointerdown', function (e) {
    var cv = document.getElementById('cv'); if (!cv || !cv.contains(e.target) || wfRunning) return;
    var w = curWf(), r = cv.getBoundingClientRect();
    if (e.target.classList.contains('out')) {
      var from = e.target.closest('.nd').dataset.id, tmp = document.getElementById('tmpw'), a = pos(from);
      e.preventDefault();
      var mv = function (ev) { tmp.style.display = ''; tmp.setAttribute('d', wire(a, { x: ev.clientX - r.left, y: ev.clientY - r.top - H / 2 })); };
      var up = function (ev) {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
        var el = document.elementFromPoint(ev.clientX, ev.clientY), nd = el && el.closest && el.closest('.nd');
        if (nd && nd.dataset.id !== from) {
          var to = nd.dataset.id;
          if (!w.edges.some(function (x) { return (x[0] === from && x[1] === to) || (x[0] === to && x[1] === from); })) { w.edges.push([from, to]); save(); }
        }
        drawWires();
      };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    } else if (e.target.closest('.ndx')) { return; }
    else {
      var nd = e.target.closest('.nd'); if (!nd) return;
      var n = pos(nd.dataset.id), ox = e.clientX - r.left - n.x, oy = e.clientY - r.top - n.y;
      e.preventDefault();
      var mv2 = function (ev) {
        n.x = Math.max(0, Math.min(cv.clientWidth - W, ev.clientX - r.left - ox)); n.y = Math.max(0, Math.min(cv.clientHeight - H, ev.clientY - r.top - oy));
        nd.style.left = n.x + 'px'; nd.style.top = n.y + 'px'; drawWires();
      };
      var up2 = function () { window.removeEventListener('pointermove', mv2); window.removeEventListener('pointerup', up2); save(); };
      window.addEventListener('pointermove', mv2); window.addEventListener('pointerup', up2);
    }
  });
  document.addEventListener('dblclick', function (e) {
    var h = e.target.closest && e.target.closest('.wh'); if (!h || wfRunning) return;
    curWf().edges.splice(+h.dataset.ei, 1); save(); drawWires(); toast('Wire cut');
  });
  document.addEventListener('change', function (e) {
    if (e.target.id === 'wfname' && curWf()) { curWf().name = e.target.value.trim() || 'Untitled workflow'; save(); }
  });

  function logLine(h) { var l = document.getElementById('wflog'); if (!l) return; l.insertAdjacentHTML('beforeend', '<p>' + h + '</p>'); l.scrollTop = l.scrollHeight; }
  async function runWf() {
    var w = curWf(); if (wfRunning) return;
    if (!w || !w.nodes.length) { toast('Add a few steps first'); return; }
    wfRunning = true; var live = {}, tokens = 0, seen = {}, t0 = Date.now();
    var l = document.getElementById('wflog'); if (l) l.innerHTML = '';
    var indeg = {}; w.nodes.forEach(function (n) { indeg[n.id] = 0; }); w.edges.forEach(function (e) { indeg[e[1]]++; });
    var level = w.nodes.filter(function (n) { return !indeg[n.id]; });
    if (!level.length) level = [w.nodes[0]];
    logLine('<b>Started</b> ' + esc(w.name));
    var guard = 0;
    while (level.length && guard++ < 20) {
      level.forEach(function (n) { seen[n.id] = 1; var el = document.querySelector('.nd[data-id="' + n.id + '"]'); if (el) el.classList.add('run'); });
      await sleep(850);
      level.forEach(function (n) {
        var el = document.querySelector('.nd[data-id="' + n.id + '"]'); if (el) { el.classList.remove('run'); el.classList.add('ok'); }
        var tk = n.type === 'agent' ? 400 + Math.floor(Math.random() * 700) : 0; tokens += tk;
        var msg = { trigger: 'Trigger fired: ' + esc(n.label), agent: esc(n.label) + ' finished (' + tk + ' tokens)', branch: 'Branch “' + esc(n.label) + '”: condition met', transform: 'Reshaped data: ' + esc(n.label), parallel: 'Fanned out: ' + esc(n.label), output: 'Delivered: ' + esc(n.label) }[n.type];
        logLine('<b>' + NT[n.type].n + '</b> · ' + msg);
      });
      var next = [];
      level.forEach(function (n) {
        w.edges.forEach(function (e) {
          if (e[0] === n.id) { live[e[0] + '>' + e[1]] = 'done'; var t = pos(e[1]); if (t && !seen[t.id] && next.indexOf(t) < 0) next.push(t); }
        });
      });
      level.forEach(function (n) { w.edges.forEach(function (e) { if (e[0] === n.id) live[e[0] + '>' + e[1]] = 'flow'; }); });
      drawWires(live);
      if (next.length) await sleep(600);
      Object.keys(live).forEach(function (k) { live[k] = 'done'; });
      drawWires(live); level = next;
    }
    var cost = tokens * 0.000004;
    S.runs.push({ name: w.name + ' (workflow)', t: Date.now(), tokens: tokens, cost: cost }); save();
    logLine('<b>Finished</b> in ' + ((Date.now() - t0) / 1000).toFixed(1) + 's · ' + tokens + ' tokens · ' + money(cost));
    toast('Workflow finished'); wfRunning = false;
  }

  /* =========================================================
     2. RUN THEATER
     ========================================================= */
  function makeTrace(name, role) {
    var topic = (role || name).replace(/\s+/g, ' ').slice(0, 54);
    return [
      { k: 'think', t: 'Reading the request and my role: “' + topic + '”.', tk: 120 },
      { k: 'think', t: 'Plan: 1) gather context  2) check what is already known  3) draft the result  4) double-check it.', tk: 160 },
      { k: 'tool', t: 'search_context', a: '{ "query": "' + topic.slice(0, 30) + '" }', r: '4 matches in 0.3s', tk: 90 },
      { k: 'tool', t: 'read_memory', a: '{ "store": "shared" }', r: '2 relevant notes', tk: 70 },
      { k: 'think', t: 'Cross-checking the matches. One is out of date, so I am setting it aside.', tk: 210 },
      { k: 'tool', t: 'draft_result', a: '{ "format": "summary" }', r: 'drafted, 142 words', tk: 260 },
      { k: 'final', t: 'Done. “' + name + '” checked the context, found 4 matches, set 1 stale item aside and wrote up the rest. Everything is ready for review.', tk: 180 }
    ];
  }
  function stepHtml(s) {
    if (s.k === 'tool') return '<div class="ts tool"><small>Tool call</small>' + esc(s.t) + '(' + esc(s.a) + ') → <em>' + esc(s.r) + '</em></div>';
    return '<div class="ts ' + (s.k === 'final' ? 'final' : '') + '"><small>' + (s.k === 'final' ? 'Result' : 'Thinking') + '</small>' + esc(s.t) + '</div>';
  }
  var theaterTok = 0;
  async function theater(name, role, replayRun) {
    var trace = replayRun ? replayRun.trace : makeTrace(name, role);
    var total = trace.reduce(function (a, s) { return a + s.tk; }, 0);
    var run = replayRun;
    if (!run) { run = { name: name, t: Date.now(), trace: trace, tokens: total, cost: total * 0.000004 }; S.runs.push(run); save(); render(); }
    var sh = openSheet('<div class="th"><div class="thh"><div><b>' + esc(name) + '</b><small>Live run · simulated</small></div><span class="pill" id="th-st">Running</span></div>' +
      '<div class="thm"><div><small>Tokens</small><b id="th-tok">0</b></div><div><small>Cost</small><b id="th-cost">$0.0000</b></div><div><small>Time</small><b id="th-time">0.0s</b></div></div>' +
      '<div class="thl" id="th-list"></div><div class="thf" id="th-foot"></div><p class="thnote">Prototype: no real model is called. The steps are a realistic simulation so you can see how a run reads.</p></div>', 'wide');
    var list = sh.querySelector('#th-list'), tokEl = sh.querySelector('#th-tok'), costEl = sh.querySelector('#th-cost'), timeEl = sh.querySelector('#th-time'), st = sh.querySelector('#th-st');
    var token = ++theaterTok, t0 = Date.now(), shown = 0;
    var clock = setInterval(function () { if (!document.body.contains(list) || token !== theaterTok) return clearInterval(clock); if (st.textContent === 'Running') timeEl.textContent = ((Date.now() - t0) / 1000).toFixed(1) + 's'; }, 100);
    var cum = 0;
    function setMeters(n) { tokEl.textContent = n; costEl.textContent = money(n * 0.000004); }
    for (var i = 0; i < trace.length; i++) {
      if (!document.body.contains(list) || token !== theaterTok) return;
      await sleep(650 + Math.random() * 450);
      if (!document.body.contains(list) || token !== theaterTok) return;
      list.insertAdjacentHTML('beforeend', stepHtml(trace[i])); list.scrollTop = list.scrollHeight;
      var from = cum; cum += trace[i].tk;
      for (var f = 1; f <= 8; f++) { setMeters(Math.round(from + (cum - from) * f / 8)); await sleep(30); }
      shown++;
    }
    st.textContent = 'Succeeded'; st.className = 'pill ok'; timeEl.textContent = ((Date.now() - t0) / 1000).toFixed(1) + 's';
    var foot = sh.querySelector('#th-foot');
    foot.innerHTML = '<span class="muted" style="font-size:.78rem">Scrub through the run</span><input type="range" id="th-scrub" min="0" max="' + trace.length + '" value="' + trace.length + '" aria-label="Replay position"><button class="btn2" id="th-replay">↻ Replay</button><button class="btn" data-act="close">Close</button>';
    sh.querySelector('#th-scrub').oninput = function () {
      var n = +this.value, c = 0; list.innerHTML = trace.slice(0, n).map(stepHtml).join('');
      for (var j = 0; j < n; j++) c += trace[j].tk; setMeters(c); st.textContent = n === trace.length ? 'Succeeded' : 'Replaying'; st.className = n === trace.length ? 'pill ok' : 'pill';
    };
    sh.querySelector('#th-replay').onclick = function () { theater(name, role, run); };
  }
  /* intercept run buttons so they open the theater instead of a toast */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-act]'); if (!b) return;
    var a = b.dataset.act.split(':');
    if (a[0] === 'run') { var ag = S.data.agents[+a[1]]; if (ag) { e.stopPropagation(); theater(ag.name, ag.desc); } }
    else if (a[0] === 'run-first' && S.data.agents.length) { e.stopPropagation(); theater(S.data.agents[0].name, S.data.agents[0].desc); }
    else if (a[0] === 'replay') { e.stopPropagation(); var r = S.runs.slice().reverse()[+a[1]]; if (r && r.trace) theater(r.name, '', r); }
  }, true);

  /* =========================================================
     3. DESCRIBE-IT (Nex builds the agent and the workflow)
     ========================================================= */
  var TOOLS = [
    ['Slack', /slack/], ['Email', /e-?mail|gmail|inbox/], ['GitHub', /github|pull request|\bprs?\b/], ['Jira', /jira|ticket/],
    ['Web search', /web|search|research|google/], ['SQL database', /sql|database|query/], ['Calendar', /calendar|meeting/],
    ['PagerDuty', /pagerduty|incident|on-?call/], ['Spreadsheet', /csv|spreadsheet|sheet|excel/], ['CRM', /crm|salesforce|hubspot|lead/], ['Notion', /notion|docs?\b/]
  ];
  function parse(text) {
    var t = text.toLowerCase(), tools = TOOLS.map(function (x) { var m = x[1].exec(t); return m ? [x[0], m.index] : null; }).filter(Boolean).sort(function (p, q) { return p[1] - q[1]; }).map(function (x) { return x[0]; });
    var role = /triage|classify|route|prioriti/.test(t) ? 'Triage' : /summar|digest|recap/.test(t) ? 'Summarizer' : /research|find out|look up/.test(t) ? 'Researcher' :
      /repl|respon|support|answer/.test(t) ? 'Support' : /report|dashboard/.test(t) ? 'Reporter' : /monitor|watch|alert|detect/.test(t) ? 'Watcher' : 'Assistant';
    var trig = /every (morning|day|weekday|night|hour|week|monday|friday)|daily|weekly|hourly|each (morning|day|week)/.exec(t);
    var trigger = trig ? 'Schedule: ' + trig[0] : /webhook/.test(t) ? 'Webhook received' : /(new|when|whenever|each|every) .*(arrives?|comes? in|is created|opens?|lands?)|new (ticket|alert|email|file|lead)/.test(t) ? 'Event: ' + ((/new (\w+)/.exec(t) || [])[0] || 'something happens') : 'Manual start';
    var approve = /approv|review|escalat|human|check with me/.test(t);
    var name = (tools[0] ? tools[0].replace(' database', '').replace(' search', '') + ' ' : '') + role;
    return { name: name, role: text.trim().replace(/^i (want|need) (an? )?/i, '').replace(/^\w/, function (c) { return c.toUpperCase(); }).slice(0, 220), tools: tools, trigger: trigger, approve: approve, model: 'Claude Sonnet' };
  }
  function specToFlow(sp) {
    var nodes = [], edges = [], x = 16, y = 70, prev = null, col = 0;
    function add(type, label, yy) { var n = { id: uid(), type: type, label: label, x: x, y: yy == null ? y : yy }; nodes.push(n); if (prev) edges.push([prev.id, n.id]); prev = n; col++; x += 174; if (col % 4 === 0) { x = 16; y += 130; } return n; }
    add('trigger', sp.trigger.length > 24 ? sp.trigger.slice(0, 22) + '…' : sp.trigger);
    if (sp.tools.length > 1) add('transform', 'Fetch: ' + sp.tools[0]);
    add('agent', sp.name);
    if (sp.approve) add('branch', 'Needs approval?');
    var dest = sp.tools.length > 1 ? sp.tools[sp.tools.length - 1] : (sp.tools[0] || 'the team');
    add('output', 'Send to ' + dest);
    return { nodes: nodes, edges: edges };
  }
  function builder() {
    var ex = ['Every weekday at 9, summarize new Jira tickets and post them to Slack', 'When a new alert arrives, triage it, ask me to approve, then page on-call', 'Research a lead on the web every morning and email me a one-page brief'];
    var sh = openSheet('<div class="bld"><h3>✨ Describe it to Nex</h3><p class="muted" style="font-size:.85rem;margin-top:4px">Say what you want in plain English. Nex picks the role, tools and trigger, then lays the workflow out for you.</p>' +
      '<label class="fld">What should it do?<textarea id="bd-text" placeholder="e.g. Every morning, read new support emails and draft replies for me to approve"></textarea></label>' +
      '<div class="chips">' + ex.map(function (x, i) { return '<button data-x="bd-ex:' + i + '">' + esc(x.slice(0, 44)) + '…</button>'; }).join('') + '</div>' +
      '<div class="bsteps" id="bd-steps"></div><div id="bd-out"></div>' +
      '<div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn2" data-act="close">Cancel</button><button class="btn" id="bd-go">Build it</button></div></div>', 'wide');
    sh._ex = ex;
    var go = sh.querySelector('#bd-go'), ta = sh.querySelector('#bd-text');
    go.onclick = async function () {
      var text = ta.value.trim(); if (!text) { ta.focus(); return; }
      go.disabled = true; var steps = sh.querySelector('#bd-steps'), out = sh.querySelector('#bd-out'); steps.innerHTML = ''; out.innerHTML = '';
      var sp = parse(text);
      var lines = ['Reading your request', 'Choosing a role: ' + sp.role.split(' ').slice(0, 0).join('') + sp.name.split(' ').slice(-1)[0], 'Attaching tools: ' + (sp.tools.join(', ') || 'none needed'), 'Setting the trigger: ' + sp.trigger, 'Laying out the workflow'];
      for (var i = 0; i < lines.length; i++) {
        if (!document.body.contains(steps)) return;
        steps.insertAdjacentHTML('beforeend', '<p><i></i>' + esc(lines[i]) + '</p>'); await sleep(520);
        var last = steps.lastChild; last.className = 'ok'; last.firstChild.textContent = '✓';
      }
      out.innerHTML = '<div class="bcard"><h4>' + esc(sp.name) + '</h4><p>' + esc(sp.role) + '</p><span class="tag">Model: ' + sp.model + '</span><span class="tag">Trigger: ' + esc(sp.trigger) + '</span>' +
        sp.tools.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + (sp.approve ? '<span class="tag">Human approval</span>' : '') +
        '<div class="row" style="gap:10px;margin-top:8px"><button class="btn" id="bd-both">Create agent + workflow</button><button class="btn2" id="bd-agent">Agent only</button></div></div>';
      go.disabled = false; go.textContent = 'Rebuild';
      out.querySelector('#bd-agent').onclick = function () { S.data.agents.push({ name: sp.name, desc: sp.role }); save(); closeSheet(); toast('Created “' + sp.name + '”'); location.hash = '#/agents'; render(); };
      out.querySelector('#bd-both').onclick = function () {
        S.data.agents.push({ name: sp.name, desc: sp.role });
        var f = specToFlow(sp); newWf(sp.name + ' flow', f.nodes, f.edges);
        closeSheet(); toast('Built “' + sp.name + '” and its workflow'); if (location.hash === '#/workflows') render(); else location.hash = '#/workflows';
      };
    };
  }

  /* ---------- delegated clicks for all data-x buttons ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-x]'); if (!b) return;
    var a = b.dataset.x.split(':'), k = a[0], v = a[1];
    if (k === 'build') { var p = document.getElementById('buddy'); if (p) p.classList.remove('open'); closeAll(); builder(); }
    else if (k === 'bd-ex') { var s = document.getElementById('bd-text'); s.value = document.getElementById('scrim')._ex[+v]; s.focus(); }
    else if (k === 'wf-new') { newWf(); render(); }
    else if (k === 'wf-example') { var f = exampleFlow(); newWf('Example: alert response', f.n, f.e); toast('Example loaded. Press Run!'); render(); }
    else if (k === 'wf-pick') { wfCur = +v; render(); }
    else if (k === 'wf-add') addNode(v);
    else if (k === 'wf-rm') { var w = curWf(); w.nodes = w.nodes.filter(function (n) { return n.id !== v; }); w.edges = w.edges.filter(function (x) { return x[0] !== v && x[1] !== v; }); save(); paint(); }
    else if (k === 'wf-delete') { wfs().splice(wfCur, 1); wfCur = Math.max(0, wfCur - 1); save(); render(); }
    else if (k === 'wf-run') runWf();
  });

  /* ---------- hook the app ---------- */
  VIEWS.Workflows = viewWorkflows;
  var baseRender = render;
  render = function () {
    baseRender();
    if (current === 'Workflows') paint();
    if (current === 'Dashboard') {
      var cost = S.runs.reduce(function (a, r) { return a + (r.cost || 0); }, 0);
      document.querySelectorAll('.stat').forEach(function (s) { if (/^Spend/.test(s.textContent)) { var bb = s.querySelector('b'); if (bb) bb.textContent = money(cost).replace(/0+$/, '').replace(/\.$/, '.00') || '$0.00'; } });
    }
    if (current === 'Activity' && actTab === 'Runs') {
      var rev = S.runs.slice().reverse(), rows = document.querySelectorAll('#page .card .li');
      rows.forEach(function (row, i) {
        var r = rev[i]; if (r && r.trace) row.insertAdjacentHTML('beforeend', '<button class="btn2" data-act="replay:' + i + '" style="margin-left:10px">▶ Replay</button>');
        if (r && r.cost) { var p = row.querySelector('p.muted'); if (p) p.textContent += ' · ' + money(r.cost); }
      });
    }
    if (current === 'Agents') {
      var row = document.querySelector('#page .head .row');
      if (row && !row.querySelector('[data-x=build]')) row.insertAdjacentHTML('afterbegin', '<button class="btn2" data-x="build">✨ Describe it</button>');
    }
  };

  /* Nex gets a new first button */
  var bub = document.getElementById('bbub');
  if (bub && !bub.querySelector('[data-x=build]')) {
    var first = bub.querySelector('button'); var nb = document.createElement('button'); nb.className = 'pri'; nb.setAttribute('data-x', 'build'); nb.innerHTML = '✨ Describe an agent in plain words';
    if (first) { first.classList.remove('pri'); first.parentNode.insertBefore(nb, first); }
  }
  /* keep the cmd palette honest: add an entry through a tiny wrapper */
  var baseOpenCmd = openCmd;
  openCmd = function () {
    baseOpenCmd();
    var res = document.querySelector('#scrim .res'), q = document.getElementById('q'); if (!res || !q) return;
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter' && /^describe|^build with nex/i.test(q.value)) { e.stopImmediatePropagation(); closeSheet(); builder(); } }, true);
  };
  render();
})();
