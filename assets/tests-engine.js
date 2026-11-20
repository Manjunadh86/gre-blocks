/* =====================================================================
   GRE Blocks — built-in practice test engine
   Loads after app.js and plugs into window.GREApp (state, helpers,
   router registries). Data comes from window.GRE_TESTS (assets/tests.js).
   Sections:
     1. Setup, data helpers, answer checking, scoring
     2. Attempt state (inside gre-blocks:state.tests)
     3. Lobby view (#tests)
     4. Runner: ready/pause screen, shell, timer, question renderers
     5. AWA runner + self-score checklist
     6. Review grid, calculator (dialogs)
     7. Results + review mode
     8. Actions / changes / inputs + keyboard
     9. Hooks (Progress weak areas) + registration
   ===================================================================== */
(function () {
  'use strict';
  var A = window.GREApp, T = window.GRE_TESTS;
  if (!A || !T) return;
  var esc = A.esc, $ = A.$, $$ = A.$$, ICON = A.ICON, toast = A.toast;
  ICON.flag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4h12l-2.5 4 2.5 4H5"/></svg>';
  ICON.grid = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';
  ICON.calc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8.5 6.5h7M8.5 11h1M14.5 11h1M8.5 15h1M14.5 15h1M8.5 19h1M14.5 19h1"/></svg>';

  /* 1. Data helpers ----------------------------------------------------- */
  var QC_OPTIONS = ['Quantity A is greater.', 'Quantity B is greater.', 'The two quantities are equal.', 'The relationship cannot be determined from the information given.'];
  var KIND_LABEL = { tc: 'Text Completion', se: 'Sentence Equivalence', rc: 'Reading Comprehension', arg: 'Paragraph Argument', qc: 'Quantitative Comparison', mc: 'Multiple choice', mcm: 'Multiple choice (one or more)', ne: 'Numeric Entry', di: 'Data Interpretation' };
  var TYPE_ORDER = { verbal: ['tc', 'se', 'rc', 'arg'], quant: ['qc', 'mc', 'mcm', 'ne', 'di'] };
  var LETTERS = 'ABCDEF';
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var mmss = function (s) { s = Math.max(0, Math.round(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
  var nowISO = function () { return new Date().toISOString(); };
  var testById = function (id) { return T.tests.filter(function (t) { return t.id === id; })[0]; };
  var sectionById = function (t, sid) { return t.sections.filter(function (s) { return s.id === sid; })[0]; };
  var testNum = function (t) { return T.tests.indexOf(t) + 1; };
  var sectionShort = function (s) { return s.type === 'awa' ? 'Writing' : (s.type === 'verbal' ? 'Verbal ' : 'Quant ') + s.n; };
  function qType(q, s) { if (q.kind === 'rc') { var p = s.passages && s.passages[q.passage]; return p && p.length < 400 ? 'arg' : 'rc'; } if (q.data) return 'di'; return q.kind; }
  function parseNum(str) {
    if (str == null) return NaN;
    var s = String(str).trim().replace(/\s+/g, '').replace(/^\$/, '').replace(/,/g, '').replace(/−/g, '-');
    if (!s) return NaN;
    var m = s.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
    if (m) { var d = parseFloat(m[2]); return d === 0 ? NaN : parseFloat(m[1]) / d; }
    return /^-?\d*\.?\d+$/.test(s) ? parseFloat(s) : NaN;
  }
  function sameSet(a, b) { if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false; var x = a.slice().sort(), y = b.slice().sort(); return x.every(function (v, i) { return v === y[i]; }); }
  function isAnswered(q, v) {
    if (v == null) return false;
    if (q.kind === 'tc') return Array.isArray(v) && q.blanks.every(function (b, i) { return v[i] != null; });
    if (q.kind === 'ne') return String(v).trim() !== '';
    if (q.kind === 'se') return Array.isArray(v) && v.length === 2;
    return Array.isArray(v) ? v.length > 0 : true;
  }
  function isCorrect(q, v) {
    if (!isAnswered(q, v)) return false;
    switch (q.kind) {
      case 'tc': return q.answer.every(function (a, i) { return v[i] === a; });
      case 'qc': return v[0] === q.answer;
      case 'ne': var n = parseNum(v); return !isNaN(n) && Math.abs(n - q.answer) <= (q.tol || 0.01);
      default: return sameSet(v, q.answer);
    }
  }
  function correctArray(q) { return q.kind === 'qc' ? [q.answer] : (Array.isArray(q.answer) ? q.answer : [q.answer]); }

  /* 2. Attempt state ----------------------------------------------------- */
  function tstate() { var s = A.state; if (!s.tests) s.tests = { attempts: [], active: null }; if (!s.tests.attempts) s.tests.attempts = []; return s.tests; }
  function attemptById(id) { return tstate().attempts.filter(function (a) { return a.id === id; })[0]; }
  function openAttempt(testId) { return tstate().attempts.filter(function (a) { return a.testId === testId && !a.finishedAt && !a.abandoned; })[0]; }
  function completed(testId) { return tstate().attempts.filter(function (a) { return a.testId === testId && a.finishedAt; }); }
  function newAttempt(testId, mode, sectionId) {
    var prev = openAttempt(testId); if (prev) prev.abandoned = true;
    var a = { id: A.uid(), testId: testId, startedAt: nowISO(), finishedAt: null, mode: mode, sectionId: sectionId || null, sections: {}, essay: null, scores: null, logged: null };
    tstate().attempts.push(a); tstate().active = a.id; A.save(); return a;
  }
  function sectionsFor(a, t) { return a.mode === 'section' ? [sectionById(t, a.sectionId)].filter(Boolean) : t.sections; }
  function essayState(a, s) { if (!a.essay) a.essay = { text: '', words: 0, checked: [], band: null, startedAt: null, submittedAt: null, timeLeft: s.time * 60 }; return a.essay; }
  function secState(a, s) { return a.sections[s.id] || (a.sections[s.id] = { answers: {}, marked: [], time: {}, startedAt: null, submittedAt: null, timeLeft: s.time * 60 }); }
  function isSubmitted(a, s) { if (s.type === 'awa') return !!(a.essay && a.essay.band != null); var sec = a.sections[s.id]; return !!(sec && sec.submittedAt); }
  function isStarted(a, s) { if (s.type === 'awa') return !!(a.essay && a.essay.startedAt); var sec = a.sections[s.id]; return !!(sec && sec.startedAt); }
  function nextSection(a, t) { return sectionsFor(a, t).filter(function (s) { return !isSubmitted(a, s); })[0] || null; }
  function routeFor(a, t) { var n = nextSection(a, t); return n ? '#test/' + t.id + '/' + n.id : '#test/' + t.id + '/result/' + a.id; }
  function wordCount(t) { var m = String(t || '').trim().match(/\S+/g); return m ? m.length : 0; }

  function scoreAttempt(a, t) {
    var res = { verbal: { raw: 0, n: 0, sections: 0, scaled: null }, quant: { raw: 0, n: 0, sections: 0, scaled: null }, types: {}, items: [], awaBand: a.essay && a.essay.band != null ? a.essay.band : null };
    sectionsFor(a, t).forEach(function (s) {
      if (s.type === 'awa') return;
      var sec = a.sections[s.id]; if (!sec || !sec.submittedAt) return;
      var m = res[s.type]; m.sections++;
      s.questions.forEach(function (q) {
        var v = sec.answers[q.id], ok = isCorrect(q, v), ty = qType(q, s);
        m.n++; if (ok) m.raw++;
        var tt = res.types[ty] = res.types[ty] || { n: 0, ok: 0, measure: s.type };
        tt.n++; if (ok) tt.ok++;
        res.items.push({ q: q, s: s, sec: sec, time: sec.time[q.id] || 0, ok: ok, answered: isAnswered(q, v), marked: sec.marked.indexOf(q.id) >= 0 });
      });
    });
    if (res.verbal.sections === 2) res.verbal.scaled = T.conversion.verbal[Math.min(27, res.verbal.raw)];
    if (res.quant.sections === 2) res.quant.scaled = T.conversion.quant[Math.min(27, res.quant.raw)];
    return res;
  }
  function bandNumber(band) { var m = String(band || '').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : ''; }
  function finishAttempt(a, t) {
    var r = scoreAttempt(a, t);
    a.finishedAt = nowISO();
    a.scores = { verbalRaw: r.verbal.raw, verbalN: r.verbal.n, verbalScaled: r.verbal.scaled, quantRaw: r.quant.raw, quantN: r.quant.n, quantScaled: r.quant.scaled, awaBand: r.awaBand };
    if (tstate().active === a.id) tstate().active = null;
    var xp = a.mode === 'full' ? 150 : 40;
    if (a.mode === 'full' && r.verbal.scaled != null && r.quant.scaled != null && !a.logged) {
      var id = A.uid();
      A.state.scores.push({ id: id, date: A.todayISO(), label: 'Built-in Test ' + testNum(t), v: r.verbal.scaled, q: r.quant.scaled, awa: bandNumber(r.awaBand), notes: 'Auto-scored built-in test' + (r.awaBand ? ' · AWA self-score band ' + r.awaBand : '') });
      a.logged = id;
    }
    A.markActiveToday(); A.save(); A.updateLevelChip(true);
    toast((a.mode === 'full' ? 'Full test complete! +' : 'Section complete! +') + xp + ' XP' + (a.logged ? ' · added to score log' : ''), 'good');
  }

  /* 3. Lobby ------------------------------------------------------------- */
  function renderLobby() {
    var ets = A.resById('powerprep');
    var cards = T.tests.map(function (t) {
      var open = openAttempt(t.id), done = completed(t.id), last = done[done.length - 1];
      var status;
      if (open) status = '<span class="chip chip--warn">In progress · ' + (open.mode === 'full' ? 'full test' : sectionShort(sectionById(t, open.sectionId))) + '</span>';
      else if (last && last.mode === 'full') status = '<span class="chip chip--good">' + ICON.check + 'Completed: V ' + (last.scores.verbalScaled || '—') + ' · Q ' + (last.scores.quantScaled || '—') + ' · AWA ' + (last.scores.awaBand || '—') + '</span>';
      else if (last) status = '<span class="chip chip--note">Drilled ' + done.length + ' section' + (done.length > 1 ? 's' : '') + '</span>';
      else status = '<span class="chip">Not started</span>';
      var secs = '<ul class="tl-sections">' + t.sections.map(function (s) {
        return '<li class="line-' + (s.type === 'awa' ? 'pink' : s.type === 'verbal' ? 'blue' : 'green') + '"><span class="tl-sections__dot"></span><span>' + esc(s.title) + '</span><span class="mono small">' + (s.questions ? s.questions.length + ' Q · ' : '') + s.time + ' min</span></li>';
      }).join('') + '</ul>';
      var drill = '<div class="tl-drill" id="drill-' + t.id + '" hidden><p class="small" style="font-weight:800;margin-bottom:.4rem">Take one section as a timed drill:</p><div class="cluster">' + t.sections.map(function (s) {
        return '<button class="button button--small button--ghost" type="button" data-action="tStartSection" data-test="' + t.id + '" data-sid="' + s.id + '">' + esc(sectionShort(s)) + ' <span class="muted">' + s.time + 'm</span></button>';
      }).join('') + '</div></div>';
      var history = done.length ? '<div class="table-wrap" style="margin-top:1rem"><table class="table table--wide tl-history"><thead><tr><th scope="col">Date</th><th scope="col">Mode</th><th scope="col">Verbal</th><th scope="col">Quant</th><th scope="col">AWA</th><th scope="col">Time</th><th scope="col"><span class="visually-hidden">Review</span></th></tr></thead><tbody>' +
        done.slice().reverse().map(function (a) {
          var sc = a.scores || {}, used = timeUsed(a, t);
          return '<tr><td class="num" data-label="Date">' + esc(A.fmtShort(a.finishedAt.slice(0, 10))) + '</td><td data-label="Mode">' + (a.mode === 'full' ? 'Full test' : esc(sectionShort(sectionById(t, a.sectionId)))) + '</td>' +
            '<td class="num" data-label="Verbal">' + (sc.verbalN ? (sc.verbalScaled != null ? sc.verbalScaled : sc.verbalRaw + '/' + sc.verbalN) : '—') + '</td><td class="num" data-label="Quant">' + (sc.quantN ? (sc.quantScaled != null ? sc.quantScaled : sc.quantRaw + '/' + sc.quantN) : '—') + '</td><td class="num" data-label="AWA">' + (sc.awaBand || '—') + '</td><td class="num" data-label="Time">' + mmss(used) + '</td>' +
            '<td class="cell-actions"><a class="button button--small button--ghost" href="#test/' + t.id + '/result/' + a.id + '">Review</a></td></tr>';
        }).join('') + '</tbody></table></div>' : '';
      var buttons = '<div class="cluster" style="margin-top:1rem">' +
        (open ? '<a class="button" href="' + routeFor(open, t) + '">' + ICON.play + 'Resume</a><button class="button button--small button--ghost" type="button" data-action="tStartFull" data-test="' + t.id + '" data-restart="1">Start over</button>' :
          '<button class="button" type="button" data-action="tStartFull" data-test="' + t.id + '">' + ICON.play + (last && last.mode === 'full' ? 'Retake full test' : 'Start full test') + '</button>') +
        '<button class="button button--ghost" type="button" data-action="tToggleDrill" data-test="' + t.id + '" aria-expanded="false" aria-controls="drill-' + t.id + '">Take a section</button>' +
        (last ? '<a class="button button--ghost" href="#test/' + t.id + '/result/' + last.id + '">Review last</a>' : '') + '</div>';
      return '<article class="card card--band line-' + (testNum(t) === 1 ? 'orange' : 'purple') + ' tl-card"><div class="cluster cluster--between"><h3>' + esc(t.name) + '</h3>' + status + '</div><p class="reading" style="margin:.5rem 0 1rem;color:var(--ink-2)">' + esc(t.blurb) + '</p>' + secs + buttons + drill + history + '</article>';
    }).join('');
    return A.pageHead('Practice tests', 'Two <span class="hl" style="--hl:var(--block-orange)">full-length</span> tests, built in',
      'Two complete GRE-format tests: essay, two Verbal and two Quant sections in the real order and timing, auto-scored with explanations. Scaled scores are estimates from a fixed form — there is no section-level adaptivity here. The official <a href="' + esc(ets ? ets.url : '#') + '" target="_blank" rel="noopener">POWERPREP tests</a> remain the gold standard; use these for timing, stamina and review.',
      '<p style="margin-top:1rem"><span class="sticker" style="--sticker:var(--block-green)">Free · built in · auto-scored</span></p>') +
      '<div class="container"><div class="grid-cards grid-cards--4 tl-grid">' + cards + '</div>' +
      '<div class="notice notice--warn" style="margin-top:1.5rem"><b>Calibration:</b> a 27-question form is a small sample; treat a scaled score as ±3 points. The AWA band is a self-score from a checklist, not a rater.</div></div>';
  }
  function timeUsed(a, t) {
    var used = 0;
    sectionsFor(a, t).forEach(function (s) {
      if (s.type === 'awa') { if (a.essay && a.essay.submittedAt) used += s.time * 60 - (a.essay.timeLeft || 0); }
      else { var sec = a.sections[s.id]; if (sec && sec.submittedAt) used += s.time * 60 - (sec.timeLeft || 0); }
    });
    return used;
  }

  /* 4. Runner ------------------------------------------------------------ */
  var run = { a: null, t: null, s: null, sec: null, qi: 0, qStart: 0, timer: null, pauseNext: false, pauseTimer: null, warned: {}, collapsed: false };
  var saveSoon = function () { A.debounce('tests-save', A.save, 300); };

  function renderTest(r) {
    var t = testById(r.testId);
    if (!t) return '<div class="container section"><div class="notice notice--bad">Unknown test.</div></div>';
    if (r.sub === 'result') return renderResult(t, r.arg);
    if (r.sub === 'review') return renderReview(t, r.arg);
    var s = sectionById(t, r.sub);
    if (!s) return '<div class="container section"><div class="notice notice--bad">Unknown section.</div> <p style="margin-top:1rem"><a class="button" href="#tests">Back to tests</a></p></div>';
    var a = openAttempt(t.id);
    if (!a) {
      return '<div class="container section"><div class="empty-state"><h3>No test in progress</h3><p>' + esc(s.title) + ' belongs to ' + esc(t.name) + '. Start the full test or take just this section.</p><div class="cluster" style="justify-content:center;margin-top:1rem"><button class="button" type="button" data-action="tStartFull" data-test="' + t.id + '">' + ICON.play + 'Start full test</button><button class="button button--ghost" type="button" data-action="tStartSection" data-test="' + t.id + '" data-sid="' + s.id + '">Take this section</button><a class="button button--ghost" href="#tests">All tests</a></div></div></div>';
    }
    if (a.mode === 'section' && a.sectionId !== s.id) { redirect('#test/' + t.id + '/' + a.sectionId); return loading(); }
    if (isSubmitted(a, s)) { redirect(routeFor(a, t)); return loading(); }
    document.body.classList.add('is-focus');
    if (!isStarted(a, s)) return renderReady(a, t, s);
    if (s.type === 'awa') return renderAwa(a, t, s);
    return renderSection(a, t, s);
  }
  function redirect(hash) { setTimeout(function () { location.replace(hash); }, 0); }
  function loading() { return '<div class="container section"><p class="muted">Loading…</p></div>'; }

  /* Ready / pause screen before a section starts */
  function renderReady(a, t, s) {
    var pos = sectionsFor(a, t).indexOf(s) + 1, total = sectionsFor(a, t).length;
    var pause = run.pauseNext; run.pauseNext = false;
    if (pause) {
      var left = 60;
      run.pauseTimer = setInterval(function () { left--; var el = document.getElementById('pause-left'); if (el) el.textContent = mmss(left); if (left <= 0) { clearInterval(run.pauseTimer); beginSection(a, t, s); } }, 1000);
      A.onCleanup(function () { clearInterval(run.pauseTimer); });
    }
    return '<div class="container section ready"><div class="card ready__card line-' + (s.type === 'awa' ? 'pink' : s.type === 'verbal' ? 'blue' : 'green') + '">' +
      '<p class="eyebrow">' + esc(t.name) + ' · Section ' + pos + ' of ' + total + '</p><h1 style="margin:.4rem 0 1rem;font-size:clamp(1.8rem,1.2rem+2vw,2.6rem)">' + esc(s.title) + '</h1>' +
      '<div class="cluster"><span class="chip chip--mono">' + (s.questions ? s.questions.length + ' questions' : '1 essay') + '</span><span class="chip chip--mono">' + s.time + ':00</span>' + (s.type === 'quant' ? '<span class="chip">On-screen calculator available</span>' : '') + '</div>' +
      (pause ? '<div class="notice" style="margin-top:1.2rem">Optional pause — the next section starts automatically in <b class="mono" id="pause-left">01:00</b>. The real test has <b>no break</b> between sections, so start early if you can.</div>' : '<p class="reading" style="margin-top:1.2rem;color:var(--ink-2)">The timer starts when you press Begin. You can mark questions, jump around with Review, and exit to resume later — the clock pauses when you exit.</p>') +
      '<div class="cluster" style="margin-top:1.4rem"><button class="button" type="button" data-action="tBegin" data-test="' + t.id + '" data-sid="' + s.id + '">' + ICON.play + 'Begin section</button><a class="button button--ghost" href="#tests" data-action="tLeave">Back to tests</a></div></div></div>';
  }
  function beginSection(a, t, s) {
    clearInterval(run.pauseTimer);
    if (s.type === 'awa') essayState(a, s).startedAt = nowISO(); else secState(a, s).startedAt = nowISO();
    A.save(); A.rerender();
  }

  /* Live section */
  function renderSection(a, t, s) {
    run.a = a; run.t = t; run.s = s; run.sec = secState(a, s); run.warned = {};
    var firstOpen = s.questions.findIndex(function (q) { return !isAnswered(q, run.sec.answers[q.id]); });
    run.qi = Math.max(0, Math.min(s.questions.length - 1, run.sec.lastIndex != null ? run.sec.lastIndex : (firstOpen < 0 ? 0 : firstOpen)));
    startTimer(function () { return run.sec.timeLeft; }, function (v) { run.sec.timeLeft = v; }, function () { submitSection(true); });
    setTimeout(function () { paintQuestion(true); }, 0);
    return shell(a, t, s, s.type === 'quant');
  }
  function shell(a, t, s, calc) {
    return '<div class="runner" data-type="' + s.type + '">' +
      '<header class="runner__bar"><div class="runner__title"><span class="sticker sticker--xs" style="--sticker:var(--block-' + (s.type === 'awa' ? 'pink' : s.type === 'verbal' ? 'blue' : 'green') + ')">Test ' + testNum(t) + '</span><b>' + esc(s.title) + '</b></div>' +
      '<div class="runner__count mono" id="run-count"></div><div class="runner__timer mono" id="run-timer" aria-live="off" aria-label="Time remaining"></div>' +
      '<div class="runner__tools">' + (s.type !== 'awa' ? '<button class="button button--small button--ghost" type="button" data-action="tMark" id="run-mark" aria-pressed="false">' + ICON.flag + '<span>Mark</span></button><button class="button button--small button--ghost" type="button" data-action="tReview">' + ICON.grid + '<span>Review</span></button>' : '') +
      (calc ? '<button class="button button--small button--ghost" type="button" data-action="tCalc">' + ICON.calc + '<span>Calc</span></button>' : '') +
      '<button class="button button--small button--ghost" type="button" data-action="tExit">' + ICON.x + '<span>Exit</span></button></div></header>' +
      '<div class="visually-hidden" id="run-announce" aria-live="polite"></div>' +
      '<div class="runner__body container" id="run-body"></div>' +
      (s.type !== 'awa' ? '<footer class="runner__nav container"><button class="button button--ghost" type="button" data-action="tPrev" id="run-prev">' + ICON.arrowL + 'Back</button><div class="runner__dots" id="run-dots"></div><button class="button" type="button" data-action="tNext" id="run-next">Next' + ICON.arrowR + '</button></footer>' : '') +
      '</div>';
  }

  /* Timer shared by sections and the essay */
  function startTimer(getLeft, setLeft, onZero) {
    stopTimer();
    var last = Date.now(), sinceSave = 0;
    paintTimer(getLeft());
    run.timer = setInterval(function () {
      var now = Date.now(), dt = Math.round((now - last) / 1000); if (dt < 1) return; last = now;
      var left = Math.max(0, getLeft() - dt); setLeft(left); paintTimer(left);
      if (left <= 300 && !run.warned[300]) { run.warned[300] = true; announce('5 minutes remaining'); }
      if (left <= 60 && !run.warned[60]) { run.warned[60] = true; announce('1 minute remaining'); }
      sinceSave += dt; if (sinceSave >= 5) { sinceSave = 0; flushTime(); A.save(); }
      if (left === 0) { stopTimer(); onZero(); }
    }, 250);
    A.onCleanup(stopTimer);
    A.onCleanup(function () { flushTime(); A.save(); run.qStart = 0; run.s = null; run.sec = null; });
  }
  function stopTimer() { if (run.timer) { clearInterval(run.timer); run.timer = null; } }
  function paintTimer(left) { var el = document.getElementById('run-timer'); if (!el) return; el.textContent = mmss(left); el.className = 'runner__timer mono' + (left <= 60 ? ' is-bad' : left <= 300 ? ' is-warn' : ''); }
  function announce(msg) { var el = document.getElementById('run-announce'); if (el) { el.textContent = ''; setTimeout(function () { el.textContent = msg; }, 50); } toast(msg, 'bad'); }
  function flushTime() {
    if (!run.sec || !run.s || !run.qStart) return;
    var q = run.s.questions[run.qi]; if (!q) return;
    run.sec.time[q.id] = (run.sec.time[q.id] || 0) + (Date.now() - run.qStart) / 1000;
    run.qStart = Date.now();
  }

  /* Question painting */
  function paintQuestion(focusHeading) {
    var s = run.s, sec = run.sec, q = s.questions[run.qi]; if (!q) return;
    run.qStart = Date.now(); sec.lastIndex = run.qi;
    var body = document.getElementById('run-body'); if (!body) return;
    var side = sidePane(q, s);
    body.className = 'runner__body container' + (side ? ' has-side' : '');
    var sideName = q.kind === 'rc' ? 'passage' : 'data';
    body.innerHTML = (side ? '<aside class="pane pane--side' + (run.collapsed ? ' is-collapsed' : '') + '" id="pane-side"><button class="pane__toggle button button--small button--ghost" type="button" data-action="tTogglePassage" data-name="' + sideName + '" aria-expanded="' + !run.collapsed + '">' + (run.collapsed ? 'Show ' : 'Hide ') + sideName + '</button><div class="pane__body">' + side + '</div></aside>' : '') +
      '<section class="pane pane--q"><h2 class="q__head" id="q-head" tabindex="-1">Question ' + (run.qi + 1) + ' <span class="muted">of ' + s.questions.length + '</span> <span class="chip q__kind">' + esc(KIND_LABEL[qType(q, s)]) + '</span></h2>' + renderQuestion(q, s, sec.answers[q.id], null) + '</section>';
    document.getElementById('run-count').textContent = (run.qi + 1) + ' / ' + s.questions.length;
    var mark = document.getElementById('run-mark'); if (mark) mark.setAttribute('aria-pressed', String(sec.marked.indexOf(q.id) >= 0));
    document.getElementById('run-prev').disabled = run.qi === 0;
    var last = run.qi === s.questions.length - 1;
    document.getElementById('run-next').innerHTML = last ? ICON.check + 'Review & submit' : 'Next' + ICON.arrowR;
    document.getElementById('run-dots').innerHTML = s.questions.map(function (qq, i) { var st = i === run.qi ? ' is-current' : ''; if (isAnswered(qq, sec.answers[qq.id])) st += ' is-done'; if (sec.marked.indexOf(qq.id) >= 0) st += ' is-marked'; return '<button type="button" class="dot' + st + '" data-action="tGo" data-i="' + i + '" aria-label="Question ' + (i + 1) + '"></button>'; }).join('');
    if (focusHeading) { var h = document.getElementById('q-head'); if (h) h.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
  }
  function sidePane(q, s) {
    if (q.kind === 'rc') { var p = s.passages[q.passage] || ''; return '<div class="passage">' + p.split(/\n\n+/).map(function (para) { return '<p>' + esc(para) + '</p>'; }).join('') + '</div>'; }
    if (q.data && s.data && s.data[q.data]) return renderData(s.data[q.data]);
    return '';
  }
  function renderData(d) {
    if (d.kind === 'table') {
      return '<figure class="dfig"><figcaption>' + esc(d.title) + '</figcaption><div class="table-wrap"><table class="table dtable"><thead><tr>' + d.head.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        d.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + esc(c) + '</th>' : '<td class="num">' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></figure>';
    }
    if (d.kind === 'bar') {
      var W = 420, H = 260, L = 44, R = 12, Tt = 16, B = 60, max = Math.max.apply(null, d.bars.map(function (b) { return b[1]; }));
      var step = max > 200 ? 100 : max > 80 ? 50 : max > 40 ? 20 : 10, top = Math.ceil(max / step) * step;
      var colors = ['blue', 'green', 'orange', 'purple', 'pink', 'teal', 'yellow', 'red'];
      var bw = (W - L - R) / d.bars.length, ys = function (v) { return Tt + (H - Tt - B) * (1 - v / top); };
      var out = '<svg class="bars" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(d.title) + '">';
      for (var g = 0; g <= top; g += step) out += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + ys(g) + '" y2="' + ys(g) + '"/><text class="tick" x="' + (L - 6) + '" y="' + (ys(g) + 4) + '" text-anchor="end">' + g + '</text>';
      d.bars.forEach(function (b, i) { var x = L + bw * i + bw * 0.18, w = bw * 0.64, y = ys(b[1]); out += '<rect class="bar" x="' + x + '" y="' + y + '" width="' + w + '" height="' + (ys(0) - y) + '" style="fill:var(--block-' + colors[i % colors.length] + ')"/><text class="val" x="' + (x + w / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + b[1] + '</text><text class="xlab" x="' + (x + w / 2) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + esc(b[0]) + '</text>'; });
      out += '<line class="axis" x1="' + L + '" x2="' + L + '" y1="' + Tt + '" y2="' + ys(0) + '"/><line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + ys(0) + '" y2="' + ys(0) + '"/>' + (d.unit ? '<text class="unit" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">' + esc(d.unit) + '</text>' : '') + '</svg>';
      return '<figure class="dfig"><figcaption>' + esc(d.title) + '</figcaption>' + out + '</figure>';
    }
    return '';
  }

  /* Renders one question. `review` = { correct: bool } for read-only mode. */
  function renderQuestion(q, s, val, review) {
    var ro = !!review, out = '';
    var inputs = function (type, choices, selected, name) {
      var correct = correctArray(q);
      return '<ul class="choices" role="' + (type === 'radio' ? 'radiogroup' : 'group') + '">' + choices.map(function (c, i) {
        var sel = selected.indexOf(i) >= 0, isC = correct.indexOf(i) >= 0;
        var cls = 'choice' + (sel ? ' is-selected' : '') + (ro && isC ? ' is-correct' : '') + (ro && sel && !isC ? ' is-wrong' : '');
        return '<li><label class="' + cls + '"><input type="' + type + '" name="' + name + '" value="' + i + '" data-change="tChoice" data-i="' + i + '"' + (sel ? ' checked' : '') + (ro ? ' disabled' : '') + '><span class="choice__key" aria-hidden="true">' + LETTERS[i] + '</span><span class="choice__text">' + esc(c) + '</span>' + (ro ? '<span class="choice__mark" aria-hidden="true">' + (isC ? ICON.check : sel ? ICON.x : '') + '</span>' : '') + '</label></li>';
      }).join('') + '</ul>';
    };
    switch (q.kind) {
      case 'tc': {
        var v = Array.isArray(val) ? val : [];
        var roman = ['i', 'ii', 'iii'];
        var text = esc(q.text).replace(/___\((i{1,3})\)___/g, function (m, r) {
          var b = roman.indexOf(r), pick = v[b];
          if (ro) { var ok = pick === q.answer[b]; return '<span class="blank ' + (ok ? 'is-correct' : 'is-wrong') + '">' + (pick != null && !ok ? '<s>' + esc(q.blanks[b][pick]) + '</s> ' : '') + esc(q.blanks[b][q.answer[b]]) + '</span>'; }
          return '<span class="blank' + (pick != null ? ' is-filled' : '') + '" data-blank="' + b + '">' + (pick != null ? esc(q.blanks[b][pick]) : '(' + r + ')') + '</span>';
        });
        out += '<p class="q__text reading">' + text + '</p><div class="tc-cols cols-' + q.blanks.length + '">' + q.blanks.map(function (opts, b) {
          return '<div class="tc-col"><p class="small" style="font-weight:800">Blank (' + roman[b] + ')</p>' + opts.map(function (o, i) {
            var sel = v[b] === i, isC = q.answer[b] === i;
            return '<button type="button" class="tc-opt' + (sel ? ' is-selected' : '') + (ro && isC ? ' is-correct' : '') + (ro && sel && !isC ? ' is-wrong' : '') + '" data-action="tBlank" data-b="' + b + '" data-i="' + i + '" aria-pressed="' + sel + '"' + (ro ? ' disabled' : '') + '>' + esc(o) + (ro && isC ? ICON.check : '') + '</button>';
          }).join('') + '</div>';
        }).join('') + '</div>';
        break;
      }
      case 'se':
        out += '<p class="q__text reading">' + esc(q.text).replace(/______/g, '<span class="blank">______</span>') + '</p><p class="q__hint">Select the <b>two</b> answer choices that both fit the blank and produce sentences alike in meaning.</p>' + inputs('checkbox', q.choices, Array.isArray(val) ? val : [], q.id);
        break;
      case 'rc':
        out += '<p class="q__text reading">' + esc(q.text) + '</p>' + (q.multi ? '<p class="q__hint">Consider each of the choices separately and select all that apply.</p>' : '') + inputs(q.multi ? 'checkbox' : 'radio', q.choices, Array.isArray(val) ? val : [], q.id);
        break;
      case 'qc':
        out += (q.given ? '<div class="notice qc-given">' + esc(q.given) + '</div>' : '') + '<div class="qc-grid"><div class="qc-box"><p class="eyebrow">Quantity A</p><p class="qc-val mono">' + esc(q.a) + '</p></div><div class="qc-box"><p class="eyebrow">Quantity B</p><p class="qc-val mono">' + esc(q.b) + '</p></div></div>' + inputs('radio', QC_OPTIONS, Array.isArray(val) ? val : [], q.id);
        break;
      case 'mc':
        out += '<p class="q__text reading">' + esc(q.text) + '</p>' + inputs('radio', q.choices, Array.isArray(val) ? val : [], q.id);
        break;
      case 'mcm':
        out += '<p class="q__text reading">' + esc(q.text) + '</p><p class="q__hint">Indicate <b>all</b> such values. No partial credit.</p>' + inputs('checkbox', q.choices, Array.isArray(val) ? val : [], q.id);
        break;
      case 'ne': {
        var n = parseNum(val), ok = isCorrect(q, val);
        out += '<p class="q__text reading">' + esc(q.text) + '</p><div class="ne-row"><label class="small" for="ne-' + q.id + '" style="font-weight:800">Your answer</label><div class="ne-input' + (ro ? (ok ? ' is-correct' : ' is-wrong') : '') + '">' + (q.unit ? '<span class="ne-unit mono">' + esc(q.unit) + '</span>' : '') + '<input class="input input--mono" id="ne-' + q.id + '" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 12, -3.5 or 7/2" value="' + esc(val == null ? '' : val) + '" data-input="tNum"' + (ro ? ' disabled' : '') + '></div>' + (ro ? '<span class="chip ' + (ok ? 'chip--good' : 'chip--bad') + '">' + (ok ? ICON.check + ' correct' : ICON.x + ' correct answer: ' + q.answer) + '</span>' : '<span class="small muted">Fractions like 3/4 and decimals are both fine.</span>') + '</div>';
        break;
      }
    }
    return out;
  }

  /* Navigation + answers */
  function goTo(i) {
    if (!run.s) return;
    flushTime();
    run.qi = Math.max(0, Math.min(run.s.questions.length - 1, i));
    saveSoon(); paintQuestion(true);
  }
  function setAnswer(q, v) { run.sec.answers[q.id] = v; saveSoon(); refreshDots(); }
  function refreshDots() {
    var q = run.s.questions[run.qi];
    $$('#run-dots .dot').forEach(function (d, i) { var qq = run.s.questions[i]; d.classList.toggle('is-done', isAnswered(qq, run.sec.answers[qq.id])); d.classList.toggle('is-marked', run.sec.marked.indexOf(qq.id) >= 0); });
    var mark = document.getElementById('run-mark'); if (mark) mark.setAttribute('aria-pressed', String(run.sec.marked.indexOf(q.id) >= 0));
  }
  function toggleMark() {
    var q = run.s.questions[run.qi], i = run.sec.marked.indexOf(q.id);
    if (i >= 0) run.sec.marked.splice(i, 1); else run.sec.marked.push(q.id);
    saveSoon(); refreshDots();
  }
  function openReviewGrid() {
    var s = run.s, sec = run.sec, answered = 0, marked = sec.marked.length;
    s.questions.forEach(function (q) { if (isAnswered(q, sec.answers[q.id])) answered++; });
    var dlg = document.getElementById('run-review');
    dlg.innerHTML = '<div class="quiz__head" style="background:var(--block-yellow)"><h2 id="review-title">Review section</h2><button class="icon-button" type="button" data-action="rgClose" aria-label="Close review">' + ICON.x + '</button></div>' +
      '<div class="quiz__body"><div class="cluster"><span class="chip chip--good">' + answered + ' answered</span><span class="chip ' + (answered < s.questions.length ? 'chip--bad' : '') + '">' + (s.questions.length - answered) + ' unanswered</span><span class="chip chip--warn">' + marked + ' marked</span></div>' +
      '<ol class="rgrid">' + s.questions.map(function (q, i) { var st = ''; if (isAnswered(q, sec.answers[q.id])) st += ' is-done'; if (sec.marked.indexOf(q.id) >= 0) st += ' is-marked'; if (i === run.qi) st += ' is-current'; return '<li><button type="button" class="rgrid__q' + st + '" data-action="rgGo" data-i="' + i + '"><span class="rgrid__n">' + (i + 1) + '</span><span class="rgrid__k">' + esc(q.kind.toUpperCase()) + '</span></button></li>'; }).join('') + '</ol>' +
      '<p class="small muted" style="margin-top:.8rem">Legend: filled = answered · outlined = unanswered · corner flag = marked. Unanswered questions score as wrong — guess rather than leave blanks.</p>' +
      '<div class="quiz__foot"><button class="button button--ghost" type="button" data-action="rgClose">Keep working</button><button class="button button--on" type="button" data-action="rgSubmit">' + ICON.check + 'Submit section</button></div></div>';
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
  }
  function closeDialog(id) { var d = document.getElementById(id); if (d && d.open) d.close(); }
  function submitSection(auto) {
    var a = run.a, t = run.t, s = run.s, sec = run.sec; if (!a || !s || sec.submittedAt) return;
    stopTimer(); flushTime(); closeDialog('run-review'); closeDialog('calc');
    sec.submittedAt = nowISO(); delete sec.lastIndex;
    if (auto) toast('Time is up — section submitted.', 'bad');
    afterSection(a, t);
  }
  function afterSection(a, t) {
    var nx = nextSection(a, t);
    if (nx) { A.save(); run.pauseNext = a.mode === 'full'; location.hash = '#test/' + t.id + '/' + nx.id; }
    else { finishAttempt(a, t); location.hash = '#test/' + t.id + '/result/' + a.id; }
  }

  /* 5. AWA runner ---------------------------------------------------------- */
  function renderAwa(a, t, s) {
    var e = essayState(a, s);
    run.a = a; run.t = t; run.s = s; run.sec = null; run.warned = {};
    if (!e.submittedAt) {
      startTimer(function () { return e.timeLeft; }, function (v) { e.timeLeft = v; }, function () { submitEssay(true); });
      setTimeout(function () { var el = document.getElementById('run-count'); if (el) el.textContent = 'Issue essay'; paintTimer(e.timeLeft); var ta = document.getElementById('awa-ta'); if (ta) ta.focus(); }, 0);
      return shell(a, t, s, false).replace('<div class="runner__body container" id="run-body"></div>',
        '<div class="runner__body container awa"><div class="awa__prompt"><div class="card card--band line-pink"><p class="eyebrow">Issue</p><p class="awa__claim reading">' + esc(s.prompt) + '</p></div><div class="card card--tint" style="margin-top:1rem"><p class="eyebrow">Instruction</p><p class="reading small" style="margin-top:.4rem">' + esc(s.instruction) + '</p></div>' +
        '<div class="callout line-yellow" style="margin-top:1rem"><h3><span class="dot"></span>Plan</h3><ul><li>0–4 min: side, 2–3 examples, counter-point</li><li>4–22 min: intro, two reasons, concession</li><li>22–30 min: conclusion, proofread</li></ul></div></div>' +
        '<div class="awa__editor card"><label class="visually-hidden" for="awa-ta">Your essay</label><textarea class="textarea essay-ta" id="awa-ta" data-input="tEssay" placeholder="Write your response here. Aim for 500–650 words in five paragraphs.">' + esc(e.text) + '</textarea>' +
        '<div class="essay-stats" style="margin-top:.6rem"><span><span class="mono" id="awa-words">' + e.words + '</span> words</span><span class="small muted" id="awa-status">Autosaves as you type</span></div>' +
        '<div class="cluster" style="margin-top:1rem"><button class="button button--on" type="button" data-action="tSubmitEssay">' + ICON.check + 'Submit essay</button></div></div></div>');
    }
    /* Self-score checklist */
    var checked = e.checked || [], band = T.awaBands[Math.min(6, checked.length)];
    setTimeout(function () { var el = document.getElementById('run-count'); if (el) el.textContent = 'Self-score'; var tm = document.getElementById('run-timer'); if (tm) tm.textContent = 'Submitted'; }, 0);
    return shell(a, t, s, false).replace('<div class="runner__body container" id="run-body"></div>',
      '<div class="runner__body container awa"><div><div class="card card--band line-pink"><p class="eyebrow">Your essay · ' + e.words + ' words</p><div class="essay__body" style="border:0;padding:0;max-height:22rem;overflow:auto;margin-top:.5rem">' + esc(e.text || '(no text submitted)') + '</div></div></div>' +
      '<div class="card"><h2 class="section-title--sub">Score it honestly</h2><p class="reading small" style="color:var(--ink-2);margin:.3rem 0 1rem">Tick what your essay actually does. The band is a rough guide, not a rater.</p>' +
      '<ul class="checklist">' + T.awaSelfScore.map(function (c) { var on = checked.indexOf(c.id) >= 0; return '<li' + (on ? ' class="is-done"' : '') + '><input class="task__check" type="checkbox" id="awa-' + c.id + '" data-change="tAwaCheck" data-id="' + c.id + '"' + (on ? ' checked' : '') + '><label for="awa-' + c.id + '">' + esc(c.text) + '</label></li>'; }).join('') + '</ul>' +
      '<div class="cluster cluster--between" style="margin-top:1.2rem"><div><span class="eyebrow">Suggested band</span><div class="awa__band mono" id="awa-band">' + esc(band) + '</div></div><button class="button button--on" type="button" data-action="tAwaDone">' + ICON.check + 'Save band & continue</button></div></div></div>');
  }
  function submitEssay(auto) {
    var e = run.a && run.a.essay; if (!e || e.submittedAt) return;
    stopTimer();
    var ta = document.getElementById('awa-ta'); if (ta) e.text = ta.value;
    e.words = wordCount(e.text); e.submittedAt = nowISO(); A.save();
    if (auto) toast('Time is up — essay submitted.', 'bad');
    A.rerender();
  }

  /* 6. Calculator ----------------------------------------------------------- */
  var calc = { display: '0', acc: null, op: null, fresh: true };
  function calcPaint() { var d = document.getElementById('calc-display'); if (d) d.textContent = calc.display; }
  function calcInput(k) {
    var cur = calc.display;
    var apply = function () { var a = parseFloat(calc.acc), b = parseFloat(cur), r; switch (calc.op) { case '+': r = a + b; break; case '-': r = a - b; break; case '*': r = a * b; break; case '/': r = b === 0 ? NaN : a / b; break; default: r = b; } return r; };
    var fmt = function (n) { if (!isFinite(n)) return 'Error'; var s = String(Math.round(n * 1e10) / 1e10); return s.length > 14 ? n.toPrecision(10) : s; };
    if (/^[0-9]$/.test(k)) { calc.display = calc.fresh || cur === '0' ? k : cur + k; calc.fresh = false; }
    else if (k === '.') { if (calc.fresh) { calc.display = '0.'; calc.fresh = false; } else if (cur.indexOf('.') < 0) calc.display = cur + '.'; }
    else if (k === 'C') { calc.display = '0'; calc.acc = null; calc.op = null; calc.fresh = true; }
    else if (k === 'back') { calc.display = cur.length > 1 && !calc.fresh ? cur.slice(0, -1) : '0'; }
    else if (k === 'neg') { calc.display = cur.charAt(0) === '-' ? cur.slice(1) : (cur === '0' ? cur : '-' + cur); }
    else if (k === 'sqrt') { var v = parseFloat(cur); calc.display = v < 0 ? 'Error' : fmt(Math.sqrt(v)); calc.fresh = true; }
    else if (k === '=') { if (calc.op != null && calc.acc != null) { calc.display = fmt(apply()); calc.acc = null; calc.op = null; } calc.fresh = true; }
    else if ('+-*/'.indexOf(k) >= 0) { if (calc.op != null && calc.acc != null && !calc.fresh) calc.display = fmt(apply()); calc.acc = calc.display; calc.op = k; calc.fresh = true; }
    calcPaint();
  }
  function openCalc() {
    var dlg = document.getElementById('calc');
    var keys = [['C', 'C'], ['back', '⌫'], ['neg', '±'], ['/', '÷'], ['7', '7'], ['8', '8'], ['9', '9'], ['*', '×'], ['4', '4'], ['5', '5'], ['6', '6'], ['-', '−'], ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+'], ['sqrt', '√'], ['0', '0'], ['.', '.'], ['=', '=']];
    dlg.innerHTML = '<div class="quiz__head" style="background:var(--block-green)"><h2>Calculator</h2><button class="icon-button" type="button" data-action="calcClose" aria-label="Close calculator">' + ICON.x + '</button></div><div class="calc__body"><output class="calc__display mono" id="calc-display" aria-live="polite">' + calc.display + '</output><div class="calc__keys">' + keys.map(function (k) { return '<button type="button" class="calc__key' + (k[0] === '=' ? ' is-eq' : /^[+\-*\/]$/.test(k[0]) ? ' is-op' : '') + '" data-action="calcKey" data-k="' + k[0] + '">' + k[1] + '</button>'; }).join('') + '</div></div>';
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.show(); } else dlg.setAttribute('open', '');
  }

  /* 7. Results + review ------------------------------------------------------ */
  function renderResult(t, attemptId) {
    var a = attemptById(attemptId);
    if (!a || !a.finishedAt) return '<div class="container section"><div class="empty-state"><h3>No result yet</h3><p>This attempt is not finished.</p><a class="button" href="#tests" style="margin-top:1rem">Back to tests</a></div></div>';
    var r = scoreAttempt(a, t), drill = a.mode === 'section';
    var card = function (color, label, big, sub) { return '<div class="score-card line-' + color + '"><p class="eyebrow">' + label + '</p><div class="score-card__big">' + big + '</div><p class="score-card__sub">' + sub + '</p></div>'; };
    var cards = '<div class="score-cards">' +
      (r.verbal.n ? card('blue', 'Verbal Reasoning', r.verbal.scaled != null ? r.verbal.scaled : r.verbal.raw + '<small>/' + r.verbal.n + '</small>', r.verbal.scaled != null ? 'raw ' + r.verbal.raw + ' / 27 · estimate ±3' : 'raw score · take both Verbal sections for a scaled estimate') : '') +
      (r.quant.n ? card('green', 'Quantitative Reasoning', r.quant.scaled != null ? r.quant.scaled : r.quant.raw + '<small>/' + r.quant.n + '</small>', r.quant.scaled != null ? 'raw ' + r.quant.raw + ' / 27 · estimate ±3' : 'raw score · take both Quant sections for a scaled estimate') : '') +
      (r.awaBand ? card('pink', 'Analytical Writing', esc(r.awaBand), 'self-scored band · ' + (a.essay.words || 0) + ' words') : '') + '</div>';
    var typeRows = function (measure) {
      return TYPE_ORDER[measure].filter(function (k) { return r.types[k]; }).map(function (k) { var x = r.types[k], pct = Math.round(100 * x.ok / x.n); return '<tr><th scope="row">' + esc(KIND_LABEL[k]) + '</th><td class="num">' + x.ok + ' / ' + x.n + '</td><td><div class="cluster" style="flex-wrap:nowrap"><div style="flex:1;min-width:5rem">' + A.progressBar(pct, pct >= 80 ? 'line-green' : pct >= 60 ? 'line-yellow' : 'line-red') + '</div><span class="mono small" style="width:3rem;text-align:right">' + pct + '%</span></div></td></tr>'; }).join('');
    };
    var types = '<div class="two-col">' + ['verbal', 'quant'].filter(function (m) { return r[m].n; }).map(function (m) {
      return '<div class="table-wrap"><table class="table"><thead><tr><th scope="col">' + (m === 'verbal' ? 'Verbal' : 'Quant') + ' by type</th><th scope="col">Right</th><th scope="col">Accuracy</th></tr></thead><tbody>' + typeRows(m) + '</tbody></table></div>';
    }).join('') + '</div>';
    var timed = r.items.filter(function (it) { return it.time > 0; });
    var avg = timed.length ? timed.reduce(function (x, it) { return x + it.time; }, 0) / timed.length : 0;
    var slow = r.items.slice().sort(function (x, y) { return y.time - x.time; }).slice(0, 3);
    var timing = r.items.length ? '<div class="card" style="margin-top:1.5rem"><div class="cluster cluster--between"><h3>Pacing</h3><span class="chip chip--mono">avg ' + mmss(avg) + ' / question</span></div><p class="small muted" style="margin:.3rem 0 .8rem">Slowest three — the GRE budget is about 1:30 (Verbal) and 1:45 (Quant) per question.</p><ol class="slow-list">' +
      slow.map(function (it) { var i = it.s.questions.indexOf(it.q); return '<li><a href="#test/' + t.id + '/review/' + a.id + '" data-action="tReviewJump" data-sid="' + it.s.id + '" data-i="' + i + '"><span class="mono">' + mmss(it.time) + '</span> ' + esc(sectionShort(it.s)) + ' Q' + (i + 1) + ' · ' + esc(KIND_LABEL[qType(it.q, it.s)]) + (it.ok ? ' <span class="chip chip--good">right</span>' : ' <span class="chip chip--bad">wrong</span>') + '</a></li>'; }).join('') + '</ol></div>' : '';
    var wrong = r.items.filter(function (it) { return !it.ok; }).length, marked = r.items.filter(function (it) { return it.marked; }).length;
    var buttons = '<div class="cluster" style="margin-top:1.5rem">' +
      '<a class="button" href="#test/' + t.id + '/review/' + a.id + '" data-action="tReviewFilter" data-f="all">Review all</a>' +
      '<a class="button button--pink" href="#test/' + t.id + '/review/' + a.id + '" data-action="tReviewFilter" data-f="wrong">Review wrong only (' + wrong + ')</a>' +
      '<a class="button button--ghost" href="#test/' + t.id + '/review/' + a.id + '" data-action="tReviewFilter" data-f="marked">Review marked (' + marked + ')</a>' +
      (drill ? '<span class="chip">Drill — not added to the score log</span>' : a.logged ? '<a class="chip chip--good" href="#mocks/log">' + ICON.check + 'In score log</a>' : (r.verbal.scaled != null && r.quant.scaled != null ? '<button class="button button--ghost" type="button" data-action="tAddLog" data-id="' + a.id + '">Add to score log</button>' : '')) +
      '<a class="button button--ghost" href="#tests">All tests</a></div>';
    return A.pageHead(t.name + ' · ' + (drill ? sectionShort(sectionById(t, a.sectionId)) + ' drill' : 'full test') + ' · ' + A.fmtShort(a.finishedAt.slice(0, 10)), (drill ? 'Section ' : 'Test ') + '<span class="hl" style="--hl:var(--block-orange)">result</span>', 'Scaled scores use an approximate 27-question conversion — treat them as ±3. Review every miss <b>and</b> every lucky guess.') +
      '<div class="container">' + cards + buttons + '<section class="section">' + types + timing + '</section></div>';
  }

  var rv = { filter: 'all', idx: 0 };
  function reviewItems(a, t) {
    var items = [];
    sectionsFor(a, t).forEach(function (s) { if (s.type === 'awa') return; var sec = a.sections[s.id]; if (!sec || !sec.submittedAt) return; s.questions.forEach(function (q, i) { items.push({ q: q, s: s, sec: sec, i: i, ok: isCorrect(q, sec.answers[q.id]), marked: sec.marked.indexOf(q.id) >= 0, kind: qType(q, s) }); }); });
    return items;
  }
  function renderReview(t, attemptId) {
    var a = attemptById(attemptId);
    if (!a) return '<div class="container section"><div class="notice notice--bad">Unknown attempt.</div></div>';
    var all = reviewItems(a, t);
    var f = rv.filter;
    var list = all.filter(function (it) { return f === 'all' || (f === 'wrong' && !it.ok) || (f === 'marked' && it.marked) || it.kind === f; });
    if (rv.idx >= list.length) rv.idx = 0;
    var kinds = []; all.forEach(function (it) { if (kinds.indexOf(it.kind) < 0) kinds.push(it.kind); });
    var chip = function (key, label, n) { return '<button type="button" class="chip chip--pill chip-btn" data-action="tReviewSet" data-f="' + key + '" aria-pressed="' + (f === key) + '">' + label + ' <b class="mono">' + n + '</b></button>'; };
    var chips = '<div class="filter-row">' + chip('all', 'All', all.length) + chip('wrong', 'Wrong', all.filter(function (x) { return !x.ok; }).length) + chip('marked', 'Marked', all.filter(function (x) { return x.marked; }).length) + kinds.map(function (k) { return chip(k, KIND_LABEL[k], all.filter(function (x) { return x.kind === k; }).length); }).join('') + '</div>';
    var body;
    if (!list.length) body = '<div class="empty-state" style="margin-top:1.5rem"><h3>Nothing here</h3><p>No questions match this filter.</p></div>';
    else {
      var it = list[rv.idx], val = it.sec.answers[it.q.id], side = sidePane(it.q, it.s);
      body = '<div class="review' + (side ? ' has-side' : '') + '">' + (side ? '<aside class="pane pane--side"><div class="pane__body">' + side + '</div></aside>' : '') +
        '<section class="pane pane--q"><div class="cluster cluster--between"><h2 class="q__head" id="q-head" tabindex="-1">' + esc(sectionShort(it.s)) + ' · Q' + (it.i + 1) + ' <span class="chip q__kind">' + esc(KIND_LABEL[it.kind]) + '</span></h2><div class="cluster">' + (it.ok ? '<span class="chip chip--good">' + ICON.check + 'Correct</span>' : isAnswered(it.q, val) ? '<span class="chip chip--bad">' + ICON.x + 'Wrong</span>' : '<span class="chip chip--bad">Not answered</span>') + (it.marked ? '<span class="chip chip--warn">' + ICON.flag + 'Marked</span>' : '') + '<span class="chip chip--mono">' + mmss(it.sec.time[it.q.id] || 0) + '</span></div></div>' +
        renderQuestion(it.q, it.s, val, { correct: it.ok }) +
        '<div class="notice notice--quote line-yellow" style="margin-top:1.2rem"><b>Explanation.</b> ' + esc(it.q.expl || '') + '</div>' +
        '<div class="cluster cluster--between" style="margin-top:1.2rem"><button class="button button--ghost" type="button" data-action="tReviewNav" data-d="-1"' + (rv.idx === 0 ? ' disabled' : '') + '>' + ICON.arrowL + 'Previous</button><span class="mono">' + (rv.idx + 1) + ' / ' + list.length + '</span><button class="button" type="button" data-action="tReviewNav" data-d="1"' + (rv.idx >= list.length - 1 ? ' disabled' : '') + '>Next' + ICON.arrowR + '</button></div></section></div>';
    }
    return '<div class="container section"><nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#tests">Tests</a></li><li><a href="#test/' + t.id + '/result/' + a.id + '">' + esc(t.name) + ' result</a></li><li aria-current="page">Review</li></ol></nav><h1 style="font-size:clamp(1.8rem,1.2rem+2vw,2.6rem);margin-bottom:1rem">Review</h1>' + chips + body + '</div>';
  }

  /* 8. Actions ---------------------------------------------------------------- */
  Object.assign(A.actions, {
    tStartFull: function (el) {
      var t = testById(el.dataset.test); if (!t) return;
      if (el.dataset.restart && !confirm('Start over? The unfinished attempt will be discarded.')) return;
      var a = newAttempt(t.id, 'full'); run.pauseNext = false;
      location.hash = '#test/' + t.id + '/' + t.sections[0].id;
    },
    tStartSection: function (el) {
      var t = testById(el.dataset.test), s = t && sectionById(t, el.dataset.sid); if (!s) return;
      var open = openAttempt(t.id);
      if (open && !confirm('You have an unfinished attempt on this test. Starting a drill will discard it. Continue?')) return;
      newAttempt(t.id, 'section', s.id); run.pauseNext = false;
      location.hash = '#test/' + t.id + '/' + s.id;
    },
    tToggleDrill: function (el) { var box = document.getElementById('drill-' + el.dataset.test); var open = box.hidden; box.hidden = !open; el.setAttribute('aria-expanded', String(open)); },
    tBegin: function (el) { var t = testById(el.dataset.test), s = sectionById(t, el.dataset.sid), a = openAttempt(t.id); if (a && s) beginSection(a, t, s); },
    tLeave: function () { clearInterval(run.pauseTimer); location.hash = '#tests'; },
    tPrev: function () { goTo(run.qi - 1); },
    tNext: function () { if (run.qi >= run.s.questions.length - 1) openReviewGrid(); else goTo(run.qi + 1); },
    tGo: function (el) { goTo(+el.dataset.i); },
    tMark: toggleMark,
    tReview: openReviewGrid,
    tCalc: openCalc,
    tTogglePassage: function (el) { run.collapsed = !run.collapsed; var p = document.getElementById('pane-side'); if (p) p.classList.toggle('is-collapsed', run.collapsed); el.setAttribute('aria-expanded', String(!run.collapsed)); el.textContent = (run.collapsed ? 'Show ' : 'Hide ') + (el.dataset.name || 'passage'); },
    tExit: function () {
      if (!confirm('Exit this section? Your answers and remaining time are kept; resume from the Tests tab.')) return;
      stopTimer(); flushTime(); A.save(); location.hash = '#tests';
    },
    tBlank: function (el) {
      var q = run.s.questions[run.qi], b = +el.dataset.b, i = +el.dataset.i;
      var v = Array.isArray(run.sec.answers[q.id]) ? run.sec.answers[q.id].slice() : [];
      v[b] = v[b] === i ? null : i; setAnswer(q, v);
      var col = el.parentNode; $$('.tc-opt', col).forEach(function (btn) { var on = btn === el && v[b] === i; btn.classList.toggle('is-selected', on); btn.setAttribute('aria-pressed', String(on)); });
      var slot = $('.blank[data-blank="' + b + '"]'); if (slot) { slot.textContent = v[b] != null ? q.blanks[b][v[b]] : '(' + ['i', 'ii', 'iii'][b] + ')'; slot.classList.toggle('is-filled', v[b] != null); }
    },
    tSubmitEssay: function () { if (!confirm('Submit your essay? You cannot edit it afterwards.')) return; submitEssay(false); },
    tAwaDone: function () {
      var a = run.a, t = run.t, e = a.essay; e.band = T.awaBands[Math.min(6, (e.checked || []).length)]; A.save();
      afterSection(a, t);
    },
    tAddLog: function (el) {
      var a = attemptById(el.dataset.id), t = a && testById(a.testId); if (!a || a.logged) return;
      var r = scoreAttempt(a, t); var id = A.uid();
      A.state.scores.push({ id: id, date: a.finishedAt.slice(0, 10), label: 'Built-in Test ' + testNum(t), v: r.verbal.scaled, q: r.quant.scaled, awa: bandNumber(r.awaBand), notes: 'Auto-scored built-in test' });
      a.logged = id; A.save(); toast('Added to the score log', 'good'); A.rerender();
    },
    tReviewFilter: function (el) { rv.filter = el.dataset.f; rv.idx = 0; location.hash = el.getAttribute('href').slice(1); },
    tReviewJump: function (el) {
      rv.filter = 'all'; var a = attemptById(el.getAttribute('href').split('/')[3]), t = a && testById(a.testId);
      if (a) { var items = reviewItems(a, t); rv.idx = Math.max(0, items.findIndex(function (it) { return it.s.id === el.dataset.sid && it.i === +el.dataset.i; })); }
      location.hash = el.getAttribute('href').slice(1);
    },
    tReviewSet: function (el) { rv.filter = el.dataset.f; rv.idx = 0; A.rerender(); },
    tReviewNav: function (el) { rv.idx += +el.dataset.d; A.rerender(); setTimeout(function () { var h = document.getElementById('q-head'); if (h) h.focus({ preventScroll: true }); window.scrollTo(0, 0); }, 0); },
    rgClose: function () { closeDialog('run-review'); },
    rgGo: function (el) { closeDialog('run-review'); goTo(+el.dataset.i); },
    rgSubmit: function () { submitSection(false); },
    calcClose: function () { closeDialog('calc'); },
    calcKey: function (el) { calcInput(el.dataset.k); }
  });
  Object.assign(A.changes, {
    tChoice: function (el) {
      var q = run.s.questions[run.qi], i = +el.dataset.i;
      var v = Array.isArray(run.sec.answers[q.id]) ? run.sec.answers[q.id].slice() : [];
      if (el.type === 'radio') v = [i];
      else {
        var at = v.indexOf(i);
        if (at >= 0) v.splice(at, 1); else { v.push(i); if (q.kind === 'se' && v.length > 2) { var old = v.shift(); var oldInput = $('.choices input[data-i="' + old + '"]'); if (oldInput) { oldInput.checked = false; oldInput.closest('.choice').classList.remove('is-selected'); } } }
      }
      setAnswer(q, v);
      $$('.choices .choice').forEach(function (c) { var inp = $('input', c); c.classList.toggle('is-selected', inp.checked); });
    },
    tAwaCheck: function (el) {
      var e = run.a.essay; e.checked = e.checked || [];
      var at = e.checked.indexOf(el.dataset.id); if (el.checked && at < 0) e.checked.push(el.dataset.id); if (!el.checked && at >= 0) e.checked.splice(at, 1);
      el.closest('li').classList.toggle('is-done', el.checked);
      document.getElementById('awa-band').textContent = T.awaBands[Math.min(6, e.checked.length)]; A.save();
    }
  });
  Object.assign(A.inputs, {
    tNum: function (el) { var q = run.s.questions[run.qi]; setAnswer(q, el.value); },
    tEssay: function (el) { var e = run.a.essay; e.text = el.value; e.words = wordCount(el.value); document.getElementById('awa-words').textContent = e.words; A.debounce('awa-save', function () { A.save(); var s = document.getElementById('awa-status'); if (s) s.textContent = 'Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }, 500); }
  });

  /* Dialog delegation + keyboard */
  ['run-review', 'calc'].forEach(function (id) {
    var d = document.createElement('dialog'); d.id = id; d.className = id === 'calc' ? 'quiz calc' : 'quiz'; d.setAttribute('aria-label', id === 'calc' ? 'Calculator' : 'Review section');
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { var el = e.target.closest('[data-action]'); if (!el) return; var fn = A.actions[el.dataset.action]; if (fn) fn(el, e); });
  });
  document.addEventListener('keydown', function (e) {
    if (!run.s || !run.sec || A.ui.view !== 'test' || !document.body.classList.contains('is-focus')) return;
    var tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
    var dlg = document.getElementById('run-review'); if ((dlg && dlg.open) || document.getElementById('calc').open) return;
    var q = run.s.questions[run.qi];
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(run.qi - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (run.qi < run.s.questions.length - 1) goTo(run.qi + 1); }
    else if (e.key === 'm' || e.key === 'M') { toggleMark(); }
    else if (e.key === 'r' || e.key === 'R') { openReviewGrid(); }
    else if (/^[1-6]$/.test(e.key) && q.kind !== 'tc' && q.kind !== 'ne') { var inp = $('.choices input[data-i="' + (+e.key - 1) + '"]'); if (inp) { inp.click(); } }
  });
  window.addEventListener('beforeunload', function () { if (run.sec || (run.a && run.a.essay)) { flushTime(); A.save(); } });
  document.addEventListener('visibilitychange', function () { if (document.hidden && run.s) { flushTime(); A.save(); } });

  /* 9. Hooks + registration --------------------------------------------------- */
  A.hooks.progressExtra = function () {
    var agg = {};
    tstate().attempts.forEach(function (a) { var t = testById(a.testId); if (!t) return; var r = scoreAttempt(a, t); Object.keys(r.types).forEach(function (k) { agg[k] = agg[k] || { n: 0, ok: 0 }; agg[k].n += r.types[k].n; agg[k].ok += r.types[k].ok; }); });
    var keys = Object.keys(agg); if (!keys.length) return '';
    var weak = keys.filter(function (k) { return agg[k].n >= 2 && agg[k].ok / agg[k].n < 0.6; }).sort(function (a, b) { return agg[a].ok / agg[a].n - agg[b].ok / agg[b].n; });
    return '<div class="card card--band line-orange" style="margin-top:1.5rem"><div class="cluster cluster--between"><h3>From built-in tests</h3><a class="chip" href="#tests">Tests tab</a></div><p class="small muted" style="margin:.3rem 0 .8rem">Question types under 60% accuracy across all your attempts.</p>' +
      (weak.length ? '<div class="topic-chips">' + weak.map(function (k) { return '<span class="chip chip--bad">' + esc(KIND_LABEL[k]) + '<b>' + Math.round(100 * agg[k].ok / agg[k].n) + '%</b></span>'; }).join('') + '</div>' : '<span class="chip chip--good">' + ICON.check + 'No type below 60% — nice.</span>') + '</div>';
  };
  A.VIEWS.tests = renderLobby;
  A.VIEWS.test = renderTest;
  if (/^#(tests|test\/)/.test(location.hash)) A.render({ force: true });
})();
