/* =====================================================================
   GRE Blocks — application
   Vanilla JS. Everything is rendered from window.GRE_DATA (assets/data.js).
   Sections:
     1. Helpers (DOM, escaping, dates, ids, downloads, toast)
     2. State module (load / migrate / save, derived progress, XP, streak)
     3. Theme
     4. Router + render shell + event delegation
     5. Views: roadmap, day, today, verbal (+ vocab trainer), quant,
        writing, mocks, resources, exam, progress
     6. Vocab quiz (dialog)
     7. Essay timer
     8. Actions (click / change / input / submit handlers)
     9. Boot
   ===================================================================== */
(function () {
  'use strict';

  var D = window.GRE_DATA;
  if (!D) { document.getElementById('app').innerHTML = '<div class="container section"><div class="notice notice--bad">assets/data.js did not load.</div></div>'; return; }

  /* 1. Helpers ------------------------------------------------------- */
  var app = document.getElementById('app');
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var isoLocal = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var todayISO = function () { return isoLocal(new Date()); };
  var parseISO = function (s) { var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  var addDays = function (d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
  var dayDiff = function (aISO, bISO) { return Math.round((parseISO(bISO) - parseISO(aISO)) / 86400000); };
  var fmtDate = function (d, opts) { return d.toLocaleDateString(undefined, opts || { weekday: 'short', day: 'numeric', month: 'short' }); };
  var fmtShort = function (iso) { return fmtDate(parseISO(iso), { day: 'numeric', month: 'short' }); };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  var shuffle = function (arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); };
  var clamp = function (n, lo, hi) { return Math.max(lo, Math.min(hi, n)); };

  function download(name, text, type) {
    var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  var toastTimer;
  function toast(msg, kind) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast is-on' + (kind ? ' toast--' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = 'toast'; }, 2400);
  }

  var ICON = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12M6 10l6 6 6-6M4 20h16"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>'
  };

  /* 2. State ---------------------------------------------------------- */
  var KEY = 'gre-blocks:state';
  var THEME_KEY = 'gre-blocks:theme';
  function readRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function writeRaw(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  function defaults() {
    return { v: 1, startDate: null, tasks: {}, activeDates: [], known: {}, leech: {}, essays: [], drafts: {}, scores: [], targets: { v: '', q: '', awa: '' }, checklist: {}, errors: [], notes: '', tests: { attempts: [], active: null } };
  }
  function migrate(raw) {
    var d = defaults();
    if (!raw || typeof raw !== 'object') return d;
    var obj = function (x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; };
    var arr = function (x) { return Array.isArray(x) ? x : []; };
    d.startDate = /^\d{4}-\d{2}-\d{2}$/.test(raw.startDate || '') ? raw.startDate : null;
    d.tasks = obj(raw.tasks); d.known = obj(raw.known); d.leech = obj(raw.leech);
    d.drafts = obj(raw.drafts); d.checklist = obj(raw.checklist);
    d.activeDates = arr(raw.activeDates).filter(function (s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); });
    d.essays = arr(raw.essays); d.scores = arr(raw.scores); d.errors = arr(raw.errors);
    d.targets = Object.assign(d.targets, obj(raw.targets));
    d.notes = typeof raw.notes === 'string' ? raw.notes : '';
    var tests = obj(raw.tests);
    d.tests = { attempts: arr(tests.attempts).filter(function (a) { return a && typeof a === 'object' && a.id; }), active: typeof tests.active === 'string' ? tests.active : null };
    return d;
  }
  function load() {
    var raw = readRaw(KEY);
    if (!raw) return defaults();
    try { return migrate(JSON.parse(raw)); } catch (e) { return defaults(); }
  }
  var state = load();
  var storageOk = true;
  function save() { storageOk = writeRaw(KEY, JSON.stringify(state)); }
  function markActiveToday() { var t = todayISO(); if (state.activeDates.indexOf(t) < 0) state.activeDates.push(t); }

  /* Derived data */
  var dayById = function (n) { return D.days.filter(function (d) { return d.day === n; })[0]; };
  var phaseById = function (id) { return D.phases.filter(function (p) { return p.id === id; })[0]; };
  var resById = function (id) { return D.resources.filter(function (r) { return r.id === id; })[0]; };
  var phaseDays = function (p) { return D.days.filter(function (d) { return d.phase === p.id; }); };
  var isMockDay = function (d) { return d.focus.indexOf('mock') >= 0; };
  function dayProgress(d) {
    var done = d.tasks.filter(function (t) { return state.tasks[t.id]; }).length;
    return { done: done, total: d.tasks.length, complete: done === d.tasks.length && d.tasks.length > 0, pct: Math.round(100 * done / d.tasks.length) };
  }
  function phaseProgress(p) {
    var done = 0, total = 0, daysDone = 0, days = phaseDays(p);
    days.forEach(function (d) { var pr = dayProgress(d); done += pr.done; total += pr.total; if (pr.complete) daysDone++; });
    return { done: done, total: total, daysDone: daysDone, days: days.length, pct: total ? Math.round(100 * done / total) : 0 };
  }
  function xpTotal() {
    var xp = 0;
    D.days.forEach(function (d) { var p = dayProgress(d); xp += p.done * 10; if (p.complete) { xp += 50; if (isMockDay(d)) xp += 100; } });
    /* Built-in tests: +150 per completed full test, +40 per completed single-section drill */
    (state.tests && state.tests.attempts || []).forEach(function (a) { if (a.finishedAt) xp += a.mode === 'full' ? 150 : 40; });
    return xp;
  }
  function levelInfo() {
    var xp = xpTotal();
    var level = Math.floor(Math.sqrt(xp / 100)) + 1;
    var floor = (level - 1) * (level - 1) * 100, next = level * level * 100;
    return { xp: xp, level: level, next: next, toNext: next - xp, pct: Math.round(100 * (xp - floor) / (next - floor)) };
  }
  function streak() {
    var set = {}; state.activeDates.forEach(function (s) { set[s] = 1; });
    var d = todayISO();
    if (!set[d]) { d = isoLocal(addDays(parseISO(d), -1)); if (!set[d]) return 0; }
    var n = 0;
    while (set[d]) { n++; d = isoLocal(addDays(parseISO(d), -1)); }
    return n;
  }
  var dayDate = function (n) { return state.startDate ? addDays(parseISO(state.startDate), n - 1) : null; };
  function currentDayNumber() { return state.startDate ? dayDiff(state.startDate, todayISO()) + 1 : null; }
  var totals = {
    days: D.days.length,
    tasks: D.days.reduce(function (a, d) { return a + d.tasks.length; }, 0),
    hours: Math.round(D.days.reduce(function (a, d) { return a + d.hours; }, 0)),
    words: D.vocab.length,
    formulas: D.quant.topics.reduce(function (a, t) { return a + t.formulas.length; }, 0),
    mocks: D.mocks.length,
    resources: D.resources.length
  };
  var FOCUS_LABEL = { verbal: 'Verbal', quant: 'Quant', awa: 'Writing', vocab: 'Vocab', mock: 'Mock', review: 'Review', rest: 'Rest' };

  /* 3. Theme ---------------------------------------------------------- */
  function effectiveTheme() {
    var a = document.documentElement.getAttribute('data-theme');
    if (a === 'dark' || a === 'light') return a;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyThemeUI() {
    var t = effectiveTheme();
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? meta.dataset.dark : meta.dataset.light);
    var btn = document.getElementById('theme-toggle');
    var label = t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    btn.setAttribute('aria-label', label); btn.setAttribute('title', label);
  }
  function initTheme() {
    applyThemeUI();
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      writeRaw(THEME_KEY, next);
      applyThemeUI();
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { if (!document.documentElement.getAttribute('data-theme')) applyThemeUI(); };
      if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* 4. Router + render shell ------------------------------------------ */
  var ui = {
    view: null, anchor: null,
    vocab: { q: '', day: 'all', status: 'all' },
    res: { type: 'all', area: 'all' },
    essay: { prompt: null },
    scoreLabel: ''
  };
  var cleanupFns = [];
  var VIEWS = {
    roadmap: renderRoadmap, today: renderToday, verbal: renderVerbal, quant: renderQuant, writing: renderWriting,
    mocks: renderMocks, resources: renderResources, exam: renderExam, progress: renderProgress
  };
  var TITLES = { roadmap: 'GRE Blocks — 30-day GRE plan', today: 'Today', verbal: 'Verbal', quant: 'Quant', writing: 'Writing', mocks: 'Mocks', tests: 'Practice tests', test: 'Practice test', resources: 'Resources', exam: 'Exam', progress: 'My progress' };

  function parseHash() {
    var h = (location.hash || '#roadmap').slice(1);
    var m = h.match(/^day-(\d+)$/);
    if (m) return { view: 'day', day: clamp(parseInt(m[1], 10) || 1, 1, 30), anchor: null };
    var parts = h.split('/');
    if (parts[0] === 'test' && parts[1]) return { view: 'test', testId: parts[1], sub: parts[2] || '', arg: parts[3] || '', anchor: null, key: h };
    var view = VIEWS[parts[0]] ? parts[0] : (parts[0] === 'vocab' ? 'verbal' : 'roadmap');
    var anchor = parts[1] || (parts[0] === 'vocab' ? 'vocab' : null);
    return { view: view, day: null, anchor: anchor };
  }
  function updateNav(r) {
    var active = r.view;
    if (r.view === 'day') active = (state.startDate && currentDayNumber() === r.day) ? 'today' : 'roadmap';
    if (r.view === 'test') active = 'tests';
    $$('#nav a').forEach(function (a) {
      if (a.dataset.route === active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    var cur = $('#nav a[aria-current]'), ul = document.getElementById('nav');
    if (cur && ul.scrollWidth > ul.clientWidth) ul.scrollLeft = Math.max(0, cur.offsetLeft - (ul.clientWidth - cur.offsetWidth) / 2);
    setTimeout(navEdge, 0);
  }
  function render(opts) {
    opts = opts || {};
    var r = parseHash();
    var sameView = ui.view === r.view && (r.view !== 'day' || ui.day === r.day) && (r.view !== 'test' || ui.routeKey === r.key);
    if (sameView && r.anchor && !opts.force) { scrollToAnchor(r.anchor); return; }
    var y = opts.keepScroll ? window.scrollY : 0;
    cleanupFns.forEach(function (f) { try { f(); } catch (e) {} }); cleanupFns = [];
    document.body.classList.remove('is-focus');
    var viewFn = VIEWS[r.view] || renderRoadmap;
    var html = r.view === 'day' ? renderDay(r.day) : viewFn(r);
    app.innerHTML = '<div class="view" data-view="' + r.view + '">' + html + '</div>';
    app.setAttribute('aria-busy', 'false');
    ui.view = r.view; ui.day = r.day; ui.routeKey = r.key || null;
    updateNav(r);
    document.title = r.view === 'roadmap' ? TITLES.roadmap : (r.view === 'day' ? 'Day ' + r.day : TITLES[r.view]) + ' — GRE Blocks';
    updateLevelChip(false);
    if (r.anchor) { scrollToAnchor(r.anchor); }
    else if (opts.keepScroll) { window.scrollTo(0, y); }
    else { window.scrollTo(0, 0); }
  }
  function rerender() { render({ keepScroll: true, force: true }); }
  function scrollToAnchor(id) {
    var el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  function updateLevelChip(bump) {
    var li = levelInfo();
    var chip = document.getElementById('level-chip');
    $('.level-chip__lv', chip).textContent = 'Lv ' + li.level;
    $('.level-chip__xp', chip).textContent = li.xp + ' XP';
    chip.setAttribute('title', 'Level ' + li.level + ' · ' + li.xp + ' XP · ' + li.toNext + ' XP to level ' + (li.level + 1));
    if (bump) { chip.classList.remove('is-bumped'); void chip.offsetWidth; chip.classList.add('is-bumped'); }
  }

  /* Shared fragments */
  function pageHead(eyebrow, title, lead, extra) {
    return '<div class="container page-head"><p class="eyebrow">' + esc(eyebrow) + '</p><h1>' + title + '</h1>' +
      (lead ? '<p class="lead">' + lead + '</p>' : '') + (extra || '') + '</div>';
  }
  function focusChips(focus, cls) {
    return focus.map(function (f) { return '<span class="chip chip--line focus-' + f + ' ' + (cls || '') + '">' + FOCUS_LABEL[f] + '</span>'; }).join('');
  }
  function progressBar(pct, line, tall) {
    return '<div class="progress' + (tall ? ' progress--tall' : '') + (line ? ' ' + line : '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div class="progress__bar' + (pct === 0 ? ' is-zero' : '') + '" style="--value:' + pct + '%"></div></div>';
  }
  function resChip(id) {
    var r = resById(id); if (!r) return '';
    if (r.url.charAt(0) === '#') return '<a class="chip chip--note" href="' + esc(r.url) + '">' + esc(r.name) + ICON.arrowR + '</a>';
    return '<a class="chip" href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.name) + ICON.ext + '</a>';
  }
  function startDateControl(compact) {
    var val = state.startDate || '';
    return '<div class="start-bar' + (compact ? ' start-bar--compact' : '') + '">' +
      '<div class="field"><label for="start-date">Plan start date (Day 1)</label><input class="input input--mono" type="date" id="start-date" value="' + esc(val) + '" data-change="startDate"></div>' +
      '<div class="cluster"><button class="button button--small' + (state.startDate ? ' button--ghost' : '') + '" type="button" data-action="startToday">' + (state.startDate ? 'Reset to today' : 'Start today') + '</button>' +
      (state.startDate ? '<span class="chip chip--good">' + ICON.check + 'Day 1 = ' + esc(fmtDate(parseISO(state.startDate))) + '</span>' : '<span class="chip chip--warn">Not set yet</span>') + '</div></div>';
  }

  /* 5. Views ---------------------------------------------------------- */

  /* 5a. Roadmap: hero + stats + strip + phases */
  function renderRoadmap() {
    var cur = currentDayNumber();
    var ctaLabel = (cur && cur >= 1 && cur <= 30) ? 'Continue Day ' + cur : 'Start Day 1';
    var hero = '<section class="hero"><div class="container hero__inner">' +
      '<div class="hero__copy">' +
      '<span class="sticker">No sign-up. Progress stays on your device.</span>' +
      '<h1>Ace the GRE in <span class="hl" style="--hl:var(--block-blue)">30</span> days, one <span class="hl" style="--hl:var(--block-pink);--tilt:1.6deg">block</span> at a time.</h1>' +
      '<p class="lead">Four phases, ' + totals.tasks + ' tasks, ' + totals.words + ' high-frequency words, ' + totals.mocks + ' full-length mocks and every resource linked. A complete month of GRE preparation in one tab, with the progress tracker built in.</p>' +
      '<div class="cluster hero__actions"><a class="button" href="#today">' + ctaLabel + ICON.arrowR + '</a><a class="button button--ghost" href="#exam">See the exam format</a></div>' +
      '</div>' +
      '<div class="tower" aria-label="The four phases"><ul>' + D.phases.map(function (p) {
        var pp = phaseProgress(p);
        return '<li><a class="tower__block line-' + p.color + '" href="#roadmap/phase-' + p.id + '"><span class="tower__badge">P' + p.id + '</span><span class="tower__title">' + esc(p.title) + '</span><span class="tower__meta"><span>Days ' + p.days[0] + '–' + p.days[1] + '</span><span class="tower__done">' + pp.done + '/' + pp.total + ' tasks</span></span></a></li>';
      }).join('') + '</ul></div>' +
      '</div></section>';

    var stats = [[totals.days, 'days'], [totals.tasks, 'tasks'], [totals.words, 'words'], [totals.formulas, 'formula cards'], [totals.mocks, 'full mocks'], [totals.resources, 'resources'], ['~' + totals.hours, 'study hours']];
    if (window.GRE_TESTS) { var tq = window.GRE_TESTS.tests.reduce(function (a, t) { return a + t.sections.reduce(function (b, s) { return b + (s.questions ? s.questions.length : 0); }, 0); }, 0); stats.splice(5, 0, [window.GRE_TESTS.tests.length + ' full tests', tq + ' Q built in']); }
    var statRow = '<section class="container section"><div class="stat-row stat-row--color">' + stats.map(function (s) {
      return '<div class="stat"><div class="stat__value">' + s[0] + '</div><div class="stat__label">' + s[1] + '</div></div>';
    }).join('') + '</div></section>';

    var strip = '<ol class="strip" aria-label="30-day progress">' + D.days.map(function (d) {
      var p = phaseById(d.phase), pr = dayProgress(d);
      var cls = 'strip__block line-' + p.color + (pr.complete ? ' is-done' : pr.done ? ' is-partial' : '') + (cur === d.day ? ' is-today' : '') + (cur && d.day < cur ? ' is-past' : '');
      var label = 'Day ' + d.day + ': ' + pr.done + ' of ' + pr.total + ' tasks' + (cur === d.day ? ' (today)' : '');
      return '<li><a class="' + cls + '" href="#day-' + d.day + '" aria-label="' + esc(label) + '" title="' + esc(d.title) + '"><span class="strip__n">' + d.day + '</span>' + ICON.check.replace('<svg', '<svg class="strip__tick"') + '</a></li>';
    }).join('') + '</ol>' +
      '<div class="strip-legend"><span><i class="l-done"></i>Done</span><span><i class="l-partial"></i>In progress</span><span><i class="l-today"></i>Today</span><span><i></i>Not started</span></div>';

    var phases = D.phases.map(function (p) {
      var pp = phaseProgress(p);
      return '<section class="phase line-' + p.color + '" id="phase-' + p.id + '" aria-labelledby="phase-title-' + p.id + '">' +
        '<div class="phase__head"><div class="phase__badge">P' + p.id + '</div><div><h3 class="phase__title" id="phase-title-' + p.id + '">' + esc(p.title) + '</h3><p class="phase__goal">' + esc(p.goal) + '</p></div>' +
        '<div class="phase__meta"><span class="small"><b>Days ' + p.days[0] + '–' + p.days[1] + '</b> · <span class="mono">' + pp.done + '/' + pp.total + '</span> tasks</span>' + progressBar(pp.pct) + '</div></div>' +
        '<div class="day-grid">' + phaseDays(p).map(function (d) { return dayCard(d, p, cur); }).join('') + '</div></section>';
    }).join('');

    var roadmap = '<section class="container section" id="roadmap-body"><h2 class="section-title">The 30-day roadmap</h2>' +
      '<p class="section-intro">Set your start date and every day gets a calendar date. Each block below is one day; it fills in as you tick off tasks.</p>' +
      '<div class="card card--tint">' + startDateControl() + '</div>' +
      '<div class="section" style="padding-bottom:0">' + strip + '</div>' + phases + '</section>';

    return hero + statRow + roadmap;
  }
  function dayCard(d, p, cur) {
    var pr = dayProgress(d), dt = dayDate(d.day);
    var mins = d.tasks.reduce(function (a, t) { return a + t.min; }, 0);
    return '<a class="day-card line-' + p.color + (cur === d.day ? ' is-today' : '') + (pr.complete ? ' is-done' : '') + '" href="#day-' + d.day + '" aria-label="Day ' + d.day + ': ' + esc(d.title) + ', ' + pr.done + ' of ' + pr.total + ' tasks done">' +
      '<div class="day-card__band"><span class="day-card__num"><small>Day</small>' + d.day + '</span>' + (dt ? '<span class="day-card__date">' + esc(fmtDate(dt)) + '</span>' : '') + '</div>' +
      '<div class="day-card__body"><div class="day-card__title">' + esc(d.title) + '</div>' +
      '<div class="day-card__meta"><span>' + d.hours + ' h</span><span>' + plural(d.tasks.length, 'task') + '</span><span>' + mins + ' min</span></div>' +
      '<div class="day-card__focus">' + focusChips(d.focus) + '</div></div>' +
      '<div class="day-card__foot">' + (pr.complete ? '<span class="chip chip--done">' + ICON.check + 'Done</span>' : progressBar(pr.pct, 'line-' + p.color)) + '<span class="mono">' + pr.done + '/' + pr.total + '</span></div></a>';
  }

  /* 5b. Day view */
  function renderDay(n, prefix) {
    var d = dayById(n); if (!d) return '<div class="container section"><div class="notice notice--bad">No such day.</div></div>';
    var p = phaseById(d.phase), pr = dayProgress(d), dt = dayDate(n), cur = currentDayNumber();
    var words = D.vocab.filter(function (v) { return v.day === n; });
    var tasks = '<ul class="task-list" id="task-list">' + d.tasks.map(function (t) {
      var done = !!state.tasks[t.id];
      return '<li class="task' + (done ? ' is-done' : '') + '"><input class="task__check" type="checkbox" id="t-' + t.id + '" data-change="task" data-task="' + t.id + '" data-day="' + n + '"' + (done ? ' checked' : '') + '>' +
        '<label class="task__label" for="t-' + t.id + '">' + esc(t.text) + '</label>' +
        '<div class="task__meta"><span class="chip chip--mono">' + (t.min ? t.min + ' min' : 'no time') + '</span>' + (t.res || []).map(resChip).join('') + '</div></li>';
    }).join('') + '</ul>';
    var wordList = '<ul class="word-list">' + words.map(function (v) {
      var known = !!state.known[v.id];
      return '<li class="word-row' + (known ? ' is-known' : '') + '" data-word="' + v.id + '"><span><span class="word-row__w">' + esc(v.word) + '</span><span class="word-row__pos">' + esc(v.pos) + '</span></span>' +
        '<button class="known-toggle" type="button" data-action="toggleKnown" data-id="' + v.id + '" aria-pressed="' + known + '" aria-label="Mark ' + esc(v.word) + ' as known" title="Mark as known">' + ICON.check + '</button>' +
        '<span class="word-row__def">' + esc(v.def) + '</span><span class="word-row__ex">' + esc(v.ex) + '</span></li>';
    }).join('') + '</ul>';
    return (prefix || '') + '<div class="container section">' +
      '<nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#roadmap">Roadmap</a></li><li><a href="#roadmap/phase-' + p.id + '">Phase ' + p.id + ': ' + esc(p.title) + '</a></li><li aria-current="page">Day ' + n + '</li></ol></nav>' +
      '<div class="day-head"><div><span class="sticker line-' + p.color + '" style="--sticker:var(--block-' + p.color + ')">Day ' + n + ' of 30' + (cur === n ? ' · Today' : '') + '</span>' +
      '<h1 style="margin-top:.8rem">' + esc(d.title) + '</h1>' +
      '<div class="cluster day-meta">' + (dt ? '<span class="chip chip--mono">' + esc(fmtDate(dt, { weekday: 'long', day: 'numeric', month: 'long' })) + '</span>' : '<a class="chip chip--warn" href="#roadmap">Set a start date for calendar dates</a>') + '<span class="chip">' + d.hours + ' h planned</span>' + focusChips(d.focus) + '</div></div>' +
      '<div class="day-nav">' + (n > 1 ? '<a class="button button--ghost button--small" href="#day-' + (n - 1) + '" aria-label="Previous day">' + ICON.arrowL + 'Day ' + (n - 1) + '</a>' : '') + (n < 30 ? '<a class="button button--ghost button--small" href="#day-' + (n + 1) + '" aria-label="Next day">Day ' + (n + 1) + ICON.arrowR + '</a>' : '') + '</div></div>' +
      '<blockquote class="notice notice--quote line-' + p.color + '" style="margin-top:1.5rem">' + esc(d.why) + '</blockquote>' +
      '<div class="day-layout" style="margin-top:2rem"><section aria-labelledby="tasks-h">' +
      '<div class="cluster cluster--between" style="margin-bottom:.8rem"><h2 class="section-title--sub" id="tasks-h" style="margin:0">Tasks</h2><div id="day-progress" class="cluster" style="min-width:12rem"><span class="mono small"><b id="day-done">' + pr.done + '</b>/' + pr.total + '</span><div style="flex:1;min-width:7rem">' + progressBar(pr.pct, 'line-' + p.color) + '</div></div></div>' +
      tasks +
      '<div class="cluster day-footer"><button class="button button--small button--on" type="button" data-action="markAll" data-day="' + n + '">' + ICON.check + 'Mark all done</button><button class="button button--small button--ghost" type="button" data-action="resetDay" data-day="' + n + '">Reset day</button>' +
      '<span class="chip chip--xp" id="day-xp-note">' + (pr.complete ? 'Day complete · +' + (50 + (isMockDay(d) ? 100 : 0)) + ' XP bonus earned' : '10 XP per task · +50 when the day is done' + (isMockDay(d) ? ' · +100 mock bonus' : '')) + '</span></div>' +
      '</section>' +
      '<aside class="words-panel"><div class="card card--band line-purple"><div class="cluster cluster--between"><h2 class="section-title--sub" style="margin:0">Today’s 10 words</h2><button class="button button--small" type="button" data-action="quizDay" data-day="' + n + '">' + ICON.bolt + 'Quiz me</button></div>' +
      '<p class="small muted" style="margin:.4rem 0 .9rem">Tap the tick when a word is yours. Known words are skipped by “Quiz unknown” in the Verbal tab.</p>' + wordList + '</div></aside></div></div>';
  }

  /* 5c. Today */
  function renderToday() {
    if (!state.startDate) {
      return '<div class="container section"><div class="page-head" style="padding-top:1rem"><p class="eyebrow">Today</p><h1>When does Day 1 start?</h1><p class="lead">Set your start date and this tab will always open on the right day.</p></div>' +
        '<div class="card card--tint">' + startDateControl() + '</div>' +
        '<div class="empty-state" style="margin-top:2rem"><h3>Nothing scheduled yet</h3><p>Pick a start date above, or <a href="#day-1">preview Day 1</a> first.</p></div></div>';
    }
    var cur = currentDayNumber();
    if (cur < 1) {
      var dt = parseISO(state.startDate);
      return renderDay(1, '<div class="container" style="padding-top:1.5rem"><div class="notice notice--warn">Your plan starts on <b>' + esc(fmtDate(dt, { weekday: 'long', day: 'numeric', month: 'long' })) + '</b> (' + plural(1 - cur, 'day') + ' from now). Here is Day 1 so you can get a head start. <a href="#roadmap">Change the start date</a>.</div></div>');
    }
    if (cur > 30) {
      return '<div class="container section"><div class="page-head" style="padding-top:1rem"><span class="sticker" style="--sticker:var(--block-green)">Plan complete</span><h1 style="margin-top:1rem">Done. <span class="hl">Record your score.</span></h1><p class="lead">Day 30 was ' + plural(cur - 30, 'day') + ' ago. Log your official (or unofficial) result so the chart ends on the real thing, then do nothing GRE-related for a week.</p>' +
        '<div class="cluster" style="margin-top:1.5rem"><a class="button" href="#mocks/log">Log the score' + ICON.arrowR + '</a><a class="button button--ghost" href="#progress">See my progress</a><a class="button button--ghost" href="#roadmap">Restart the plan</a></div></div>' +
        '<div class="stat-row stat-row--color" style="margin-top:1rem">' + [[levelInfo().xp + ' XP', 'earned'], [Object.keys(state.known).length, 'words known'], [state.scores.length, 'scores logged'], [state.essays.length, 'essays written']].map(function (s) { return '<div class="stat"><div class="stat__value">' + s[0] + '</div><div class="stat__label">' + s[1] + '</div></div>'; }).join('') + '</div></div>';
    }
    return renderDay(cur);
  }

  /* 5d. Verbal + vocab trainer + roots */
  function renderVerbal() {
    if (!ui.vocab.touched) { var curDay = currentDayNumber(); ui.vocab.day = (curDay && curDay >= 1 && curDay <= 30) ? String(curDay) : 'all'; }
    var types = '<div class="grid-cards grid-cards--4">' + D.verbal.types.map(function (t, i) {
      var colors = ['blue', 'teal', 'purple', 'orange'];
      return '<article class="card card--band type-card line-' + colors[i % 4] + '"><h3>' + esc(t.name) + '</h3><div class="type-card__share"><span class="chip chip--line">' + esc(t.share) + '</span></div><p class="type-card__format">' + esc(t.format) + '</p>' +
        '<ol class="steps">' + t.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' +
        '<div class="traps"><span class="small" style="font-weight:800;width:100%">Traps</span>' + t.traps.map(function (s) { return '<span class="chip chip--bad">' + esc(s) + '</span>'; }).join('') + '</div></article>';
    }).join('') + '</div>';
    var callouts = '<div class="two-col" style="margin-top:2rem"><div class="callout line-blue"><h3><span class="dot"></span>Pacing</h3><p class="reading">' + esc(D.verbal.pacing) + '</p></div><div class="callout line-purple"><h3><span class="dot"></span>Daily reading habit</h3><p class="reading">' + esc(D.verbal.reading) + '</p></div></div>';

    var dayOpts = '<option value="all">All days</option>' + D.days.map(function (d) { return '<option value="' + d.day + '"' + (ui.vocab.day === String(d.day) ? ' selected' : '') + '>Day ' + d.day + '</option>'; }).join('');
    var statusOpts = [['all', 'All words'], ['unknown', 'Unknown'], ['known', 'Known'], ['leech', 'Leech (keep missing)']].map(function (o) { return '<option value="' + o[0] + '"' + (ui.vocab.status === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('');
    var vocab = '<section class="section" id="vocab" aria-labelledby="vocab-h"><h2 class="section-title" id="vocab-h">Vocabulary trainer</h2>' +
      '<p class="section-intro">' + totals.words + ' high-frequency words, ten a day. Click a card to flip it. Mark words known, flag the ones you keep missing as leeches, and quiz yourself.' + (ui.vocab.day !== 'all' && !ui.vocab.touched ? ' Showing today’s batch; pick “All days” to see everything.' : '') + '</p>' +
      '<div class="filter-bar vocab-toolbar"><div class="field field--wide"><label for="vocab-q">Search</label><div class="search-wrap">' + ICON.search + '<input class="input" type="search" id="vocab-q" placeholder="Word or meaning…" value="' + esc(ui.vocab.q) + '" data-input="vocabSearch" autocomplete="off"></div></div>' +
      '<div class="field"><label for="vocab-day">Day</label><select class="select" id="vocab-day" data-change="vocabDay">' + dayOpts + '</select></div>' +
      '<div class="field"><label for="vocab-status">Status</label><select class="select" id="vocab-status" data-change="vocabStatus">' + statusOpts + '</select></div>' +
      '<div class="cluster" style="grid-column:1/-1"><button class="button button--small" type="button" data-action="quizRandom">' + ICON.bolt + 'Quiz 20 random</button><button class="button button--small button--pink" type="button" data-action="quizUnknown">Quiz unknown</button><button class="button button--small button--ghost" type="button" data-action="exportCsv">' + ICON.down + 'Export CSV for Anki</button><span class="vocab-count" id="vocab-count"></span></div></div>' +
      '<ul class="vocab-grid" id="vocab-grid" style="margin-top:1.5rem"></ul></section>';

    var roots = '<section class="section" aria-labelledby="roots-h"><h2 class="section-title" id="roots-h">Roots &amp; prefixes</h2><p class="section-intro">Thirty roots that unlock hundreds of GRE words. When a word is new, look for one of these first.</p>' +
      '<div class="table-wrap"><table class="table roots-table"><thead><tr><th scope="col">Root</th><th scope="col">Meaning</th><th scope="col">Examples</th></tr></thead><tbody>' +
      D.roots.map(function (r) { return '<tr><td>' + esc(r.root) + '</td><td>' + esc(r.meaning) + '</td><td class="reading">' + esc(r.ex) + '</td></tr>'; }).join('') + '</tbody></table></div></section>';

    setTimeout(renderVocabGrid, 0);
    return pageHead('Verbal Reasoning', 'Verbal <span class="hl" style="--hl:var(--block-blue)">strategy</span>', 'Two sections, 12 then 15 questions. Four question types, one method each: read, find the clue, predict, then match. Vocabulary turns prediction into points.') +
      '<div class="container">' + types + callouts + vocab + roots + '</div>';
  }
  function vocabFiltered() {
    var q = ui.vocab.q.trim().toLowerCase();
    return D.vocab.filter(function (v) {
      if (ui.vocab.day !== 'all' && String(v.day) !== ui.vocab.day) return false;
      var known = !!state.known[v.id], leech = !!state.leech[v.id];
      if (ui.vocab.status === 'known' && !known) return false;
      if (ui.vocab.status === 'unknown' && known) return false;
      if (ui.vocab.status === 'leech' && !leech) return false;
      if (q && v.word.indexOf(q) < 0 && v.def.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function renderVocabGrid() {
    var grid = document.getElementById('vocab-grid'); if (!grid) return;
    var list = vocabFiltered();
    var knownN = Object.keys(state.known).length, leechN = Object.keys(state.leech).length;
    document.getElementById('vocab-count').textContent = 'Showing ' + list.length + ' of ' + totals.words + ' · ' + knownN + ' known · ' + leechN + ' leech';
    if (!list.length) { grid.innerHTML = '<li class="empty-state" style="grid-column:1/-1"><h3>No words match</h3><p>Try a different search or status.</p></li>'; return; }
    grid.innerHTML = list.map(vocabCard).join('');
  }
  function vocabCard(v) {
    var known = !!state.known[v.id], leech = !!state.leech[v.id];
    var pd = dayById(v.day), pcolor = pd ? phaseById(pd.phase).color : 'yellow';
    return '<li class="vcard' + (known ? ' is-known' : '') + (leech ? ' is-leech' : '') + '" data-vid="' + v.id + '">' +
      '<button class="vcard__face" type="button" data-action="flip" aria-label="' + esc(v.word) + ': flip to see the definition">' +
      '<span class="vcard__top"><span class="vcard__day line-' + pcolor + '">Day ' + v.day + '</span><span class="vcard__hint" aria-hidden="true">flip</span></span>' +
      '<span class="vcard__front"><span class="vcard__word">' + esc(v.word) + '</span><br><span class="vcard__pos">' + esc(v.pos) + '</span></span>' +
      '<span class="vcard__back"><span class="vcard__word">' + esc(v.word) + ' <span class="vcard__pos">' + esc(v.pos) + '</span></span>' + esc(v.def) + '<span class="ex" style="display:block">' + esc(v.ex) + '</span></span></button>' +
      '<div class="vcard__tools"><button class="t-known" type="button" data-action="toggleKnown" data-id="' + v.id + '" aria-pressed="' + known + '">' + (known ? 'Known' : 'Know it') + '</button><button class="t-leech" type="button" data-action="toggleLeech" data-id="' + v.id + '" aria-pressed="' + leech + '">' + (leech ? 'Leech' : 'Leech?') + '</button></div></li>';
  }

  /* 5e. Quant */
  function renderQuant() {
    var colors = ['green', 'blue', 'teal', 'yellow', 'orange'];
    var types = '<div class="grid-cards grid-cards--5">' + D.quant.questionTypes.map(function (t, i) {
      return '<article class="card card--band qtype line-' + colors[i % 5] + '"><h3>' + esc(t.name) + '</h3><div class="type-card__share"><span class="chip chip--line">' + esc(t.share) + '</span></div><p class="qtype__how">' + esc(t.how) + '</p><ul class="tips">' + t.tips.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></article>';
    }).join('') + '</div>';
    var sheet = '<section class="section print-target" id="formulas" aria-labelledby="formulas-h"><div class="cluster cluster--between no-print" style="margin-bottom:1rem"><h2 class="section-title" id="formulas-h" style="margin:0">Formula sheet</h2><button class="button button--small button--ghost" type="button" data-action="printFormulas">' + ICON.print + 'Print formula sheet</button></div>' +
      '<div class="formula-toolbar no-print"><div class="field"><label for="formula-q">Search formulas</label><div class="search-wrap">' + ICON.search + '<input class="input" type="search" id="formula-q" placeholder="e.g. remainder, slope, nCr…" data-input="formulaSearch" autocomplete="off"></div></div><span class="small" id="formula-count" style="font-weight:700">' + totals.formulas + ' cards</span></div>' +
      D.quant.topics.map(function (t, ti) {
        return '<section class="ftopic line-' + t.color + '" id="topic-' + ti + '"><div class="ftopic__head"><h3>' + esc(t.name) + '</h3><span class="chip">' + esc(t.weight) + ' of Quant</span><span class="chip">' + t.formulas.length + ' cards</span></div><div class="formula-grid">' +
          t.formulas.map(function (f) { return '<div class="formula" data-text="' + esc((f.k + ' ' + f.v).toLowerCase()) + '"><div class="formula__k">' + esc(f.k) + '</div><div class="formula__v">' + esc(f.v) + '</div></div>'; }).join('') +
          '</div></section>';
      }).join('') + '<p class="no-results notice notice--warn" id="formula-none" hidden>No formula matches that search.</p></section>';
    var lists = '<div class="two-col section"><div class="callout line-red"><h3><span class="dot"></span>QC traps</h3><ol>' + D.quant.qcTraps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>' +
      '<div class="callout line-green"><h3><span class="dot"></span>General strategies</h3><ol>' + D.quant.strategies.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div></div>';
    return pageHead('Quantitative Reasoning', 'Quant <span class="hl" style="--hl:var(--block-green)">formula sheet</span>', 'Two sections, 12 then 15 questions, on-screen calculator. Arithmetic through data analysis in ' + totals.formulas + ' cards, plus the traps Quantitative Comparison sets for you.') +
      '<div class="container">' + types + sheet + lists + '</div>';
  }

  /* 5f. Writing */
  function slotify(text) { return esc(text).replace(/\[([^\]]+)\]/g, '<span class="slot">[$1]</span>'); }
  function renderWriting() {
    var scoring = '<div class="table-wrap"><table class="table table--reading"><thead><tr><th scope="col">Score</th><th scope="col">What the rater sees</th></tr></thead><tbody>' + D.awa.scoring.map(function (s) { return '<tr><th scope="row" class="mono" style="white-space:nowrap">' + esc(s.score) + '</th><td>' + esc(s.desc) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    var mins = [4, 4, 14, 4, 4], colors = ['yellow', 'blue', 'green', 'purple', 'pink'];
    var stepper = '<ol class="stepper">' + D.awa.timeline.map(function (t) { return '<li><span class="stepper__t">' + esc(t.t) + '</span><span class="stepper__s">' + esc(t.step) + '</span></li>'; }).join('') + '</ol>' +
      '<div class="stepper__bar" aria-hidden="true">' + mins.map(function (m, i) { return '<span style="width:' + (m / 30 * 100) + '%;background:var(--block-' + colors[i] + ')" title="' + m + ' min"></span>'; }).join('') + '</div>';
    var template = '<ol class="template-stack">' + D.awa.template.map(function (t) { return '<li class="tpl"><span class="tpl__part">' + esc(t.part) + '</span><p class="tpl__text">' + slotify(t.text) + '</p></li>'; }).join('') + '</ol>';
    var tips = '<div class="callout line-pink"><h3><span class="dot"></span>Tips that move the score</h3><ul>' + D.awa.tips.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    var prompts = '<ol class="prompts">' + D.awa.practicePrompts.map(function (p, i) {
      var active = ui.essay.prompt === i, draft = state.drafts[i];
      return '<li class="prompt' + (active ? ' is-active' : '') + '" id="prompt-' + i + '"><span class="prompt__n">' + (i + 1) + '</span><span class="prompt__t">' + esc(p) + (draft ? ' <span class="chip chip--warn" style="font-size:.72rem">Draft saved</span>' : '') + '</span><button class="button button--small' + (active ? ' button--on' : '') + '" type="button" data-action="startEssay" data-i="' + i + '">' + (active ? 'Writing…' : ICON.play + 'Start 30:00 timer') + '</button></li>';
    }).join('') + '</ol>';
    var editor = '';
    if (ui.essay.prompt !== null) {
      var i = ui.essay.prompt, text = state.drafts[i] || '';
      editor = '<div class="essay-editor" id="essay-editor" style="margin-top:1.5rem"><div class="card card--band line-pink"><p class="eyebrow">Prompt ' + (i + 1) + '</p><p class="reading" style="margin:.4rem 0 1rem;font-weight:500">' + esc(D.awa.practicePrompts[i]) + '</p>' +
        '<label class="visually-hidden" for="essay-ta">Your essay</label><textarea class="textarea essay-ta" id="essay-ta" placeholder="Plan for four minutes, then write. Intro → Reason A → Reason B → Concession → Conclusion." data-input="draft" data-i="' + i + '">' + esc(text) + '</textarea>' +
        '<div class="essay-stats" style="margin-top:.6rem"><span><span class="mono" id="word-count">' + wordCount(text) + '</span> words <span class="muted">(target 500–650)</span></span><span class="muted small" id="draft-status">Draft autosaves here</span></div>' +
        '<div class="cluster" style="margin-top:1rem"><button class="button button--small button--on" type="button" data-action="saveEssay" data-i="' + i + '">' + ICON.check + 'Save essay</button><button class="button button--small button--ghost" type="button" data-action="clearDraft" data-i="' + i + '">Clear draft</button><button class="button button--small button--ghost" type="button" data-action="closeEditor">Close</button></div></div>' +
        '<div class="card timer"><div class="timer__display" id="timer-display" aria-live="off">30:00</div><div class="timer__phase" id="timer-phase">Ready. Press start.</div><div class="timer__btns"><button class="button button--small" type="button" data-action="timerToggle" id="timer-toggle">' + ICON.play + 'Start</button><button class="button button--small button--ghost" type="button" data-action="timerReset">Reset</button></div></div></div>';
      setTimeout(function () { timerPaint(); var ta = document.getElementById('essay-ta'); if (ta && !ui.essay.focused) { ta.focus(); ui.essay.focused = true; } }, 0);
    }
    var essays = state.essays.length ? '<ul class="essay-list">' + state.essays.slice().reverse().map(function (e) {
      return '<li><details><summary><span class="chip chip--mono">' + esc(fmtShort(e.date)) + '</span><span>' + esc(e.title) + '</span><span class="chip">' + e.words + ' words</span><button class="button button--small button--ghost" type="button" data-action="deleteEssay" data-id="' + esc(e.id) + '" style="margin-left:auto">Delete</button></summary><div class="essay__body">' + esc(e.text) + '</div></details></li>';
    }).join('') + '</ul>' : '<div class="empty-state"><h3>No essays yet</h3><p>Essay #1 is on Day 6. Start the timer above, write, and save — it lands here with its word count.</p></div>';
    return pageHead('Analytical Writing', 'The <span class="hl" style="--hl:var(--block-pink)">30-minute</span> Issue essay', esc(D.awa.format)) +
      '<div class="container"><section class="section" style="padding-top:0"><h2 class="section-title">How it is scored</h2>' + scoring + '</section>' +
      '<section class="section"><h2 class="section-title">The 30-minute timeline</h2>' + stepper + '</section>' +
      '<section class="section"><div class="two-col"><div><h2 class="section-title">Template</h2>' + template + '</div><div><h2 class="section-title">Tips</h2>' + tips + '</div></div></section>' +
      '<section class="section" id="practice"><h2 class="section-title">Practice prompts</h2><p class="section-intro">' + esc(D.awa.note) + '</p>' + prompts + editor + '</section>' +
      '<section class="section" id="essays"><h2 class="section-title">Past essays <span class="chip chip--mono" style="vertical-align:middle">' + state.essays.length + '</span></h2>' + essays + '</section></div>';
  }
  function wordCount(t) { var m = String(t || '').trim().match(/\S+/g); return m ? m.length : 0; }

  /* 5g. Mocks + score log + chart */
  function renderMocks() {
    var list = '<ol class="mock-list">' + D.mocks.map(function (m) {
      var r = resById(m.resource), dt = dayDate(m.day);
      var logged = state.scores.filter(function (s) { return s.label === m.name; })[0];
      return '<li class="mock' + (logged ? ' is-logged' : '') + '"><span class="mock__n">#' + m.n + '</span><div class="mock__name">' + esc(m.name) + '</div>' +
        '<div class="mock__act"><button class="button button--small' + (logged ? ' button--ghost' : '') + '" type="button" data-action="logMock" data-name="' + esc(m.name) + '">' + (logged ? 'Log again' : 'Log score') + '</button>' + (logged ? '<span class="chip chip--good">' + ICON.check + 'V ' + logged.v + ' · Q ' + logged.q + '</span>' : '') + '</div>' +
        '<div class="mock__meta"><a class="chip chip--line line-orange" href="#day-' + m.day + '">Day ' + m.day + (dt ? ' · ' + esc(fmtDate(dt)) : '') + '</a><span class="chip chip--mono">' + esc(m.cost) + '</span>' + (r ? resChip(r.id) : '') + '<span>' + esc(m.note) + '</span></div></li>';
    }).join('') + '</ol>';
    var t = state.targets;
    var form = '<form class="score-form card card--tint" data-submit="score" id="score-form">' +
      '<div class="field span-2"><label for="sc-date">Date</label><input class="input input--mono" type="date" id="sc-date" name="date" value="' + todayISO() + '" required></div>' +
      '<div class="field span-3"><label for="sc-label">Label</label><input class="input" type="text" id="sc-label" name="label" placeholder="e.g. POWERPREP Test 1" value="' + esc(ui.scoreLabel) + '" required maxlength="80"></div>' +
      '<div class="field"><label for="sc-v">Verbal</label><input class="input input--mono" type="number" id="sc-v" name="v" min="130" max="170" step="1" placeholder="130–170" required></div>' +
      '<div class="field"><label for="sc-q">Quant</label><input class="input input--mono" type="number" id="sc-q" name="q" min="130" max="170" step="1" placeholder="130–170" required></div>' +
      '<div class="field"><label for="sc-awa">AWA</label><input class="input input--mono" type="number" id="sc-awa" name="awa" min="0" max="6" step="0.5" placeholder="0–6"></div>' +
      '<div class="field span-3"><label for="sc-notes">Notes</label><input class="input" type="text" id="sc-notes" name="notes" placeholder="Guessed on 4 QC; ran out of time on RC" maxlength="200"></div>' +
      '<div class="span-6 cluster"><button class="button" type="submit">' + ICON.check + 'Add to log</button><span class="small muted">Verbal and Quant 130–170; AWA in half points.</span></div></form>';
    var targets = '<div class="card card--tint" style="margin-top:1.5rem"><h3 style="margin-bottom:.8rem">Target score</h3><div class="targets">' +
      [['v', 'Verbal', 130, 170, 1], ['q', 'Quant', 130, 170, 1], ['awa', 'AWA', 0, 6, 0.5]].map(function (k) {
        return '<div class="field"><label for="tg-' + k[0] + '">' + k[1] + '</label><input class="input input--mono" type="number" id="tg-' + k[0] + '" min="' + k[2] + '" max="' + k[3] + '" step="' + k[4] + '" value="' + esc(t[k[0]]) + '" placeholder="—" data-change="target" data-k="' + k[0] + '"></div>';
      }).join('') + '</div><p class="small muted" style="margin-top:.6rem">Targets draw as dashed lines on the chart.</p></div>';
    var sorted = state.scores.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var tv = parseFloat(t.v), tq = parseFloat(t.q);
    var chart = sorted.length ? '<div class="chart-wrap" style="margin-top:1.5rem">' + scoreChart(sorted, window.innerWidth < 640) + '<div class="legend"><span><i style="background:var(--block-blue)"></i>Verbal</span><span><i style="background:var(--block-green)"></i>Quant</span>' + (tv ? '<span><i class="dash dash--v"></i>Verbal target ' + tv + '</span>' : '') + (tq ? '<span><i class="dash dash--q"></i>Quant target ' + tq + '</span>' : '') + '</div></div>' : '<div class="empty-state" style="margin-top:1.5rem"><h3>No scores yet</h3><p>Mock #1 is the Day 1 diagnostic. Log it above and the chart appears here.</p></div>';
    setTimeout(paintChart, 0);
    var table = sorted.length ? '<div class="table-wrap" style="margin-top:1.5rem"><table class="table table--wide score-table"><thead><tr><th scope="col">Date</th><th scope="col">Label</th><th scope="col">Verbal</th><th scope="col">Quant</th><th scope="col">AWA</th><th scope="col">Notes</th><th scope="col"><span class="visually-hidden">Remove</span></th></tr></thead><tbody>' +
      sorted.map(function (s) { return '<tr><td class="num" data-label="Date">' + esc(fmtShort(s.date)) + '</td><td data-label="Label">' + esc(s.label) + '</td><td class="num" data-label="Verbal">' + s.v + '</td><td class="num" data-label="Quant">' + s.q + '</td><td class="num" data-label="AWA">' + (s.awa === '' || s.awa == null ? '—' : s.awa) + '</td><td class="reading" data-label="Notes">' + esc(s.notes) + '</td><td class="cell-actions"><button class="button button--small button--ghost del" type="button" data-action="deleteScore" data-id="' + esc(s.id) + '" aria-label="Delete score ' + esc(s.label) + '">' + ICON.x + '</button></td></tr>'; }).join('') + '</tbody></table></div>' : '';
    return pageHead('Mock tests', 'Five <span class="hl" style="--hl:var(--block-orange)">full-length</span> mocks', 'Diagnostic on Day 1, then Days 14, 21, 25 and 27. Every mock is followed by a deep review the next day; the review is where the points come from.') +
      '<div class="container"><section class="section" style="padding-top:0">' + list +
      (window.GRE_TESTS ? '<div class="notice notice--good" style="margin-top:1.2rem"><b>No budget?</b> Both built-in full-length tests are free and auto-scored — <a href="#tests">open the Tests tab</a>. Full runs land in the score log below automatically.</div>' : '') + '</section>' +
      '<section class="section" id="log"><h2 class="section-title">Score log</h2>' + form + chart + targets + table + '</section></div>';
  }
  /* Pure-SVG score chart. `compact` renders a 360-unit-wide viewBox so text stays legible on phones. */
  function scoreChart(sorted, compact) {
    var W = compact ? 360 : 720, H = compact ? 250 : 300, L = compact ? 34 : 44, R = 12, T = 22, B = compact ? 34 : 38, PAD = compact ? 38 : 44;
    var n = sorted.length, y0 = 130, y1 = 170;
    var xs = function (i) { return n === 1 ? L + (W - L - R) / 2 : L + PAD + (W - L - R - 2 * PAD) * i / (n - 1); };
    var ys = function (v) { return T + (H - T - B) * (1 - (v - y0) / (y1 - y0)); };
    var r = compact ? 5 : 6, sz = r * 2;
    var out = '<svg class="chart' + (compact ? ' chart--compact' : '') + '" data-compact="' + !!compact + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Verbal and Quant scores over time">';
    for (var g = y0; g <= y1; g += 10) { out += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + ys(g) + '" y2="' + ys(g) + '"/><text class="tick" x="' + (L - 6) + '" y="' + (ys(g) + 4) + '" text-anchor="end">' + g + '</text>'; }
    out += '<line class="axis" x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (H - B) + '"/><line class="axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>';
    /* Target lines: labels sit at the left inside the plot, pushed apart when the two targets are close. */
    var tv = parseFloat(state.targets.v), tq = parseFloat(state.targets.q);
    var hasV = tv >= y0 && tv <= y1, hasQ = tq >= y0 && tq <= y1;
    /* A small V / Q tag sits at the left end of each target line (the legend spells out the value).
       Tags go above the line unless that would leave the plot; two close tags are nudged apart. */
    var tags = [];
    if (hasV) tags.push({ k: 'v', y: ys(tv), title: 'Verbal target ' + tv });
    if (hasQ) tags.push({ k: 'q', y: ys(tq), title: 'Quant target ' + tq });
    tags.forEach(function (t) { t.ty = (t.y - 16 < T - 4) ? t.y + 3 : t.y - 16; });
    if (tags.length === 2 && Math.abs(tags[0].ty - tags[1].ty) < 15) {
      var lower = tags[0].y > tags[1].y ? tags[0] : tags[1], upper = lower === tags[0] ? tags[1] : tags[0];
      lower.ty = upper.ty + 16;
    }
    tags.forEach(function (t) {
      out += '<line class="target target--' + t.k + '" x1="' + L + '" x2="' + (W - R) + '" y1="' + t.y + '" y2="' + t.y + '"><title>' + t.title + '</title></line>' +
        '<rect class="ttag ttag--' + t.k + '" x="' + (L + 2) + '" y="' + t.ty + '" width="18" height="14" rx="3"/><text class="ttag__t" x="' + (L + 11) + '" y="' + (t.ty + 10.5) + '" text-anchor="middle">' + t.k.toUpperCase() + '</text>';
    });
    /* Series lines, then square "block" markers with values placed away from the other series. */
    var pv = sorted.map(function (s, i) { return [xs(i), ys(clamp(+s.v, y0, y1))]; });
    var pq = sorted.map(function (s, i) { return [xs(i), ys(clamp(+s.q, y0, y1))]; });
    if (n > 1) {
      out += '<polyline class="line line--v" points="' + pv.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"/>';
      out += '<polyline class="line line--q" points="' + pq.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '"/>';
    }
    sorted.forEach(function (s, i) {
      var vAbove = !(+s.q > +s.v); /* if Quant sits higher, put the Verbal value below and the Quant value above */
      var same = +s.q === +s.v;
      [['v', pv[i], vAbove], ['q', pq[i], same ? false : !vAbove]].forEach(function (d) {
        var k = d[0], p = d[1], above = d[2];
        out += '<rect class="dot dot--' + k + '" x="' + (p[0] - r) + '" y="' + (p[1] - r) + '" width="' + sz + '" height="' + sz + '" rx="3"/>';
        out += '<text class="val" x="' + p[0] + '" y="' + (p[1] + (above ? -(r + 6) : r + 15)) + '" text-anchor="middle">' + s[k] + '</text>';
      });
    });
    sorted.forEach(function (s, i) { out += '<text class="xlab" x="' + xs(i) + '" y="' + (H - B + 17) + '" text-anchor="middle">' + esc(fmtShort(s.date)) + '</text>'; });
    return out + '</svg>';
  }
  /* Re-render the chart at the width it actually has (compact below 560px). */
  function paintChart() {
    var wrap = $('.chart-wrap'); if (!wrap) return;
    var svg = $('svg.chart', wrap); if (!svg) return;
    var compact = wrap.clientWidth < 560;
    if (svg.dataset.compact === String(compact)) return;
    var sorted = state.scores.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    svg.outerHTML = scoreChart(sorted, compact);
  }

  /* 5h. Resources */
  var RES_TYPES = ['official', 'free', 'paid', 'video', 'book', 'app', 'community'];
  var RES_AREAS = ['General', 'Verbal', 'Quant', 'AWA', 'Vocab', 'Mock', 'Practice'];
  var PRIORITY = { 1: ['Must', 'chip--xp'], 2: ['Should', 'chip--note'], 3: ['Nice', ''] };
  function renderResources() {
    var chips = function (label, key, items) {
      var cur = ui.res[key];
      return '<div class="filter-row" role="group" aria-label="' + label + '"><span class="label">' + label + '</span><button class="chip chip--pill chip-btn" type="button" data-action="resFilter" data-k="' + key + '" data-v="all" aria-pressed="' + (cur === 'all') + '">All</button>' +
        items.map(function (v) { return '<button class="chip chip--pill chip-btn' + (key === 'type' ? ' type-' + v : '') + '" type="button" data-action="resFilter" data-k="' + key + '" data-v="' + esc(v) + '" aria-pressed="' + (cur === v) + '">' + esc(v) + '</button>'; }).join('') + '</div>';
    };
    var list = D.resources.filter(function (r) { return (ui.res.type === 'all' || r.type === ui.res.type) && (ui.res.area === 'all' || r.area === ui.res.area); })
      .sort(function (a, b) { return a.priority - b.priority || a.name.localeCompare(b.name); });
    var cards = list.length ? '<div class="grid-cards" id="res-grid">' + list.map(function (r) {
      var pr = PRIORITY[r.priority] || PRIORITY[3];
      return '<article class="card card--stripe res-card p-' + r.priority + '"><div class="res-card__top"><h3><a href="' + esc(r.url) + '"' + (r.url.charAt(0) === '#' ? '' : ' target="_blank" rel="noopener"') + '>' + esc(r.name) + '</a></h3><span class="sticker sticker--xs type-' + esc(r.type) + '">' + esc(r.type) + '</span></div>' +
        '<p class="res-card__note">' + esc(r.note) + '</p><div class="res-card__foot"><span class="chip ' + pr[1] + '">' + pr[0] + '</span><span class="chip chip--mono">' + esc(r.cost) + '</span><span class="chip">' + esc(r.area) + '</span></div></article>';
    }).join('') + '</div>' : '<div class="empty-state"><h3>Nothing matches</h3><p>Try another combination of type and area.</p></div>';
    return pageHead('Resources', 'Every link, <span class="hl" style="--hl:var(--block-teal)">ranked</span>', '“Must” is the shortlist the plan depends on. “Should” adds depth. “Nice” is optional. Official ETS material first, always.') +
      '<div class="container"><div class="card card--tint stack" style="--stack:.7rem">' + chips('Type', 'type', RES_TYPES) + chips('Area', 'area', RES_AREAS) + '</div>' +
      '<p class="small" style="margin:1rem 0;font-weight:700" id="res-count">Showing ' + list.length + ' of ' + totals.resources + '</p>' + cards + '</div>';
  }

  /* 5i. Exam */
  function renderExam() {
    var e = D.exam;
    var facts = '<div class="exam-facts"><div class="card card--band line-yellow"><p class="eyebrow">Total time</p><p class="stat__value" style="margin-top:.3rem">' + esc(e.totalTime) + '</p><p class="small muted" style="margin-top:.4rem">No breaks, no unscored section.</p></div>' +
      '<div class="card card--band line-orange"><p class="eyebrow">Fee</p><p class="reading" style="margin-top:.4rem">' + esc(e.fee) + '</p></div>' +
      '<div class="card card--band line-blue"><p class="eyebrow">Score reporting</p><p class="reading" style="margin-top:.4rem">' + esc(e.scoreReport) + '</p></div></div>' +
      '<div class="notice" style="margin-top:1.5rem"><b>Adaptive:</b> ' + esc(e.note) + '</div>';
    var sections = '<div class="table-wrap"><table class="table table--wide table--bands"><thead><tr><th scope="col" aria-label="Colour"></th><th scope="col">Section</th><th scope="col">Content</th><th scope="col">Questions</th><th scope="col">Time</th></tr></thead><tbody>' +
      e.sections.map(function (s) { return '<tr class="line-' + s.color + '"><td class="band"></td><th scope="row" data-label="Section">' + esc(s.name) + '</th><td class="reading" data-label="Content">' + esc(s.detail) + '</td><td class="num" data-label="Questions">' + esc(s.questions) + '</td><td class="num" data-label="Time">' + esc(s.time) + '</td></tr>'; }).join('') +
      '<tr class="line-ink"><td class="band"></td><th scope="row" data-label="Total">All sections</th><td class="reading" data-label="Content">5 sections, in this order</td><td class="num" data-label="Questions">55 Q</td><td class="num" data-label="Time">' + esc(e.totalTime) + '</td></tr></tbody></table></div>';
    var pacing = '<div class="table-wrap"><table class="table table--wide table--reading"><thead><tr><th scope="col">Area</th><th scope="col">Per question</th><th scope="col">Pacing rule</th></tr></thead><tbody>' + e.pacing.map(function (p) { return '<tr><th scope="row" data-label="Area">' + esc(p.area) + '</th><td class="num" data-label="Per question">' + esc(p.perQuestion) + '</td><td data-label="Rule">' + esc(p.tip) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    var doneN = D.testDay.checklist.filter(function (c) { return state.checklist[c.id]; }).length;
    var checklist = '<ul class="checklist">' + D.testDay.checklist.map(function (c) {
      var done = !!state.checklist[c.id];
      return '<li' + (done ? ' class="is-done"' : '') + '><input class="task__check" type="checkbox" id="td-' + c.id + '" data-change="checklist" data-id="' + c.id + '"' + (done ? ' checked' : '') + '><label for="td-' + c.id + '">' + esc(c.text) + '</label></li>';
    }).join('') + '</ul>';
    var mindset = '<ol class="mindset">' + D.testDay.mindset.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ol>';
    return pageHead('Exam facts', 'The <span class="hl" style="--hl:var(--block-yellow)">' + esc(e.name) + '</span>', 'The shorter GRE: five sections, under two hours, section-level adaptive. Know the shape of the test before you learn a single formula.') +
      '<div class="container"><section class="section" style="padding-top:0">' + facts + '</section>' +
      '<section class="section"><h2 class="section-title">Sections, in order</h2>' + sections + '</section>' +
      '<section class="section"><h2 class="section-title">Pacing</h2>' + pacing + '</section>' +
      '<section class="section two-col" id="checklist"><div><div class="cluster cluster--between" style="margin-bottom:1rem"><h2 class="section-title" style="margin:0">Test-day checklist</h2><span class="chip chip--mono" id="checklist-count">' + doneN + '/' + D.testDay.checklist.length + '</span></div>' + checklist + '</div>' +
      '<div><h2 class="section-title">Mindset</h2>' + mindset + '</div></section></div>';
  }

  /* 5j. Progress */
  function renderProgress() {
    var li = levelInfo();
    var done = 0; D.days.forEach(function (d) { done += dayProgress(d).done; });
    var daysDone = D.days.filter(function (d) { return dayProgress(d).complete; }).length;
    var pct = Math.round(100 * done / totals.tasks);
    var stats = [[pct + '%', 'tasks complete', done + ' of ' + totals.tasks], [daysDone, 'days complete', 'of 30'], [streak(), 'day streak', 'consecutive study days'], ['Lv ' + li.level, li.xp + ' XP', li.toNext + ' XP to level ' + (li.level + 1)], [Object.keys(state.known).length, 'words known', 'of ' + totals.words], [state.essays.length, 'essays written', 'target 5'], [state.scores.length, 'mocks logged', 'target 5']];
    var statRow = '<div class="stat-row stat-row--color">' + stats.map(function (s) { return '<div class="stat"><div class="stat__value">' + s[0] + '</div><div class="stat__label">' + s[1] + '</div><div class="stat__sub">' + s[2] + '</div></div>'; }).join('') + '</div>' +
      '<div class="card xp-bar" style="margin-top:1rem"><div class="cluster cluster--between"><b>Level ' + li.level + '</b><span class="mono small">' + li.xp + ' / ' + li.next + ' XP</span></div>' + progressBar(li.pct, 'line-yellow', true) + '<p class="small muted" style="margin-top:.5rem">10 XP per task · +50 per completed day · +100 extra on mock days. Level = ⌊√(XP/100)⌋ + 1.</p></div>';
    var phases = '<div class="dash-phases">' + D.phases.map(function (p) { var pp = phaseProgress(p); return '<div class="dash-phase line-' + p.color + '"><span class="dash-phase__badge">P' + p.id + '</span><span class="dash-phase__title">' + esc(p.title) + ' <span class="muted small">Days ' + p.days[0] + '–' + p.days[1] + '</span></span><span class="dash-phase__pct">' + pp.pct + '%</span>' + progressBar(pp.pct, 'line-' + p.color) + '</div>'; }).join('') + '</div>';
    var errForm = '<form class="error-form card card--tint" data-submit="error">' +
      '<div class="field span-2"><label for="er-date">Date</label><input class="input input--mono" type="date" id="er-date" name="date" value="' + todayISO() + '" required></div>' +
      '<div class="field span-2"><label for="er-section">Section</label><select class="select" id="er-section" name="section"><option>Verbal</option><option>Quant</option><option>Writing</option></select></div>' +
      '<div class="field span-2"><label for="er-type">Mistake type</label><select class="select" id="er-type" name="type"><option value="content">Content gap</option><option value="careless">Careless</option><option value="timing">Timing</option><option value="misread">Misread</option></select></div>' +
      '<div class="field span-3"><label for="er-topic">Topic</label><input class="input" type="text" id="er-topic" name="topic" placeholder="e.g. QC with negatives, inference RC" required maxlength="60"></div>' +
      '<div class="field span-3"><label for="er-note">Note / rule</label><input class="input" type="text" id="er-note" name="note" placeholder="One-line rule to prevent it next time" maxlength="200"></div>' +
      '<div class="cluster" style="grid-column:1/-1"><button class="button button--small" type="submit">' + ICON.check + 'Add to error log</button></div></form>';
    var topics = {}; state.errors.forEach(function (e) { var k = e.topic.trim().toLowerCase(); topics[k] = topics[k] || { n: 0, label: e.topic.trim() }; topics[k].n++; });
    var topicKeys = Object.keys(topics).sort(function (a, b) { return topics[b].n - topics[a].n; });
    var TYPE_CLS = { content: 'chip--note', careless: 'chip--warn', timing: 'chip--bad', misread: 'chip--bad' };
    var errTable = state.errors.length ? '<div class="topic-chips" style="margin:1rem 0"><span class="small" style="font-weight:800">Weak areas:</span>' + topicKeys.slice(0, 12).map(function (k) { return '<span class="chip ' + (topics[k].n >= 3 ? 'chip--bad' : topics[k].n === 2 ? 'chip--warn' : '') + '">' + esc(topics[k].label) + '<b>×' + topics[k].n + '</b></span>'; }).join('') + '</div>' +
      '<div class="table-wrap"><table class="table table--wide"><thead><tr><th scope="col">Date</th><th scope="col">Section</th><th scope="col">Topic</th><th scope="col">Type</th><th scope="col">Note</th><th scope="col"><span class="visually-hidden">Remove</span></th></tr></thead><tbody>' +
      state.errors.slice().reverse().map(function (e) { return '<tr><td class="num" data-label="Date">' + esc(fmtShort(e.date)) + '</td><td data-label="Section">' + esc(e.section) + '</td><td data-label="Topic">' + esc(e.topic) + '</td><td data-label="Type"><span class="chip ' + (TYPE_CLS[e.type] || '') + '">' + esc(e.type) + '</span></td><td class="reading" data-label="Note">' + esc(e.note) + '</td><td class="cell-actions"><button class="button button--small button--ghost del" type="button" data-action="deleteError" data-id="' + esc(e.id) + '" aria-label="Delete this error">' + ICON.x + '</button></td></tr>'; }).join('') + '</tbody></table></div>' :
      '<div class="empty-state" style="margin-top:1rem"><h3>Error log is empty</h3><p>After every practice set, log each miss with its topic and type. Repeated topics turn red — those are your Day 23 drills.</p></div>';
    var notes = '<div class="card card--band line-yellow"><label for="notes" class="eyebrow" style="display:block;margin-bottom:.5rem">Notes &amp; reflections</label><textarea class="textarea" id="notes" rows="8" placeholder="Week 1 reflection, timing plan, target scores, one-line rules…" data-input="notes">' + esc(state.notes) + '</textarea><p class="small muted" id="notes-status" style="margin-top:.4rem">Autosaves as you type.</p></div>';
    var backup = '<div class="card"><h3>Back up your progress</h3><p class="reading small" style="margin:.5rem 0 1rem">Everything lives in this browser' + (storageOk ? '' : ' — <b>and storage looks blocked right now, so export often</b>') + '. Export a JSON file to move to another device or keep a copy.</p>' +
      '<div class="cluster"><button class="button button--small" type="button" data-action="exportJson">' + ICON.down + 'Export JSON</button><label class="button button--small button--ghost" for="import-file">' + ICON.up + 'Import JSON<input class="import-input" type="file" id="import-file" accept="application/json,.json" data-change="importJson"></label></div></div>' +
      '<div class="card danger-zone" style="margin-top:1rem"><h3>Reset everything</h3><p class="reading small" style="margin:.5rem 0 1rem">Clears tasks, XP, vocab, essays, scores, error log and notes on this device. Export first.</p><button class="button button--small button--danger" type="button" data-action="resetAll">Reset everything</button></div>';
    return pageHead('My progress', 'Your <span class="hl" style="--hl:var(--block-green)">block tower</span> so far', 'Progress by task, phase and day; the XP that keeps you honest; and the error log that tells you what to drill.') +
      '<div class="container"><section class="section" style="padding-top:0">' + statRow + '</section>' +
      '<section class="section"><h2 class="section-title">By phase</h2>' + phases + '</section>' +
      '<section class="section" id="errors"><h2 class="section-title">Error log</h2>' + errForm + errTable + (window.GREApp && window.GREApp.hooks.progressExtra ? window.GREApp.hooks.progressExtra() : '') + '</section>' +
      '<section class="section two-col"><div>' + notes + '</div><div>' + backup + '</div></section></div>';
  }

  /* 6. Vocab quiz ------------------------------------------------------ */
  var quiz = { qs: [], i: 0, score: 0, missed: [], picked: false, title: '' };
  var dialog = document.getElementById('quiz');
  function startQuiz(pool, count, title) {
    if (pool.length < 1) { toast('No words to quiz on.', 'bad'); return; }
    var qs = shuffle(pool).slice(0, count).map(function (v) {
      var others = shuffle(D.vocab.filter(function (w) { return w.id !== v.id; })).slice(0, 3);
      return { v: v, choices: shuffle([v].concat(others)) };
    });
    quiz = { qs: qs, i: 0, score: 0, missed: [], picked: false, title: title };
    paintQuiz();
    if (typeof dialog.showModal === 'function') { if (!dialog.open) dialog.showModal(); } else { dialog.setAttribute('open', ''); }
  }
  function paintQuiz() {
    var q = quiz.qs[quiz.i];
    var head = '<div class="quiz__head"><h2 id="quiz-title">' + esc(quiz.title) + '</h2><button class="icon-button" type="button" data-action="quizClose" aria-label="Close quiz">' + ICON.x + '</button></div>';
    if (!q) {
      var pct = Math.round(100 * quiz.score / quiz.qs.length);
      dialog.innerHTML = head + '<div class="quiz__body quiz__result"><p class="eyebrow">Result</p><div class="quiz__score">' + quiz.score + '<span class="muted" style="font-size:1.4rem">/' + quiz.qs.length + '</span></div><p style="margin-top:.4rem;font-weight:700">' + (pct === 100 ? 'Perfect. Those are yours.' : pct >= 70 ? 'Solid. Flag the misses and go again.' : 'Good data. Leech the misses and revisit tomorrow.') + '</p>' +
        (quiz.missed.length ? '<div class="quiz__missed"><div class="cluster cluster--between"><b>Missed</b><button class="button button--small button--danger" type="button" data-action="quizLeechAll">Mark all as leech</button></div><ul>' + quiz.missed.map(function (v) { return '<li><span><b>' + esc(v.word) + '</b> — ' + esc(v.def) + '</span>' + (state.leech[v.id] ? '<span class="chip chip--bad">Leech</span>' : '<button class="chip chip-btn" type="button" data-action="quizLeech" data-id="' + v.id + '">Leech</button>') + '</li>'; }).join('') + '</ul></div>' : '') +
        '<div class="cluster" style="justify-content:center;margin-top:1.5rem"><button class="button" type="button" data-action="quizAgain">Quiz again</button><button class="button button--ghost" type="button" data-action="quizClose">Close</button></div></div>';
      return;
    }
    dialog.innerHTML = head + '<div class="quiz__body"><div class="cluster cluster--between"><span class="chip chip--mono">Question ' + (quiz.i + 1) + ' / ' + quiz.qs.length + '</span><span class="chip chip--good" id="quiz-score">' + quiz.score + ' right</span></div>' +
      '<p class="quiz__q">' + esc(q.v.def) + '<br><span class="small muted">(' + esc(q.v.pos) + ') ' + esc(q.v.ex.replace(new RegExp(q.v.word.slice(0, Math.max(4, q.v.word.length - 2)) + '\\w*', 'ig'), '____')) + '</span></p>' +
      '<ol class="quiz__choices">' + q.choices.map(function (c, i) { return '<li><button class="quiz__choice" type="button" data-action="quizPick" data-id="' + c.id + '"><span class="key" aria-hidden="true">' + (i + 1) + '</span><span class="quiz__word">' + esc(c.word) + '</span><span class="quiz__mark" aria-hidden="true"></span></button></li>'; }).join('') + '</ol>' +
      '<p class="quiz__status" id="quiz-status" role="status" aria-live="polite"></p>' +
      '<div class="quiz__foot"><span class="small muted">Press 1–4 to answer, Enter for next.</span><span id="quiz-next"></span></div></div>';
  }
  function quizPick(id) {
    if (quiz.picked) return;
    var q = quiz.qs[quiz.i]; quiz.picked = true;
    var right = id === q.v.id;
    if (right) quiz.score++; else quiz.missed.push(q.v);
    $$('.quiz__choice', dialog).forEach(function (b) {
      b.disabled = true;
      if (b.dataset.id === q.v.id) { b.classList.add('is-right'); $('.quiz__mark', b).innerHTML = ICON.check; b.setAttribute('aria-label', b.textContent.trim() + ' — correct answer'); }
      else if (b.dataset.id === id) { b.classList.add('is-wrong'); $('.quiz__mark', b).innerHTML = ICON.x; b.setAttribute('aria-label', b.textContent.trim() + ' — your answer, incorrect'); }
    });
    $('#quiz-score', dialog).textContent = quiz.score + ' right';
    var st = $('#quiz-status', dialog);
    st.className = 'quiz__status ' + (right ? 'is-right' : 'is-wrong');
    st.innerHTML = right ? ICON.check + '<span>Correct — <b>' + esc(q.v.word) + '</b>.</span>' : ICON.x + '<span>Not quite. It was <b>' + esc(q.v.word) + '</b>.</span>';
    $('#quiz-next', dialog).innerHTML = '<button class="button button--small" type="button" data-action="quizNext" id="quiz-next-btn">' + (quiz.i + 1 < quiz.qs.length ? 'Next' + ICON.arrowR : 'See result') + '</button>';
    $('#quiz-next-btn', dialog).focus();
  }
  function quizNext() { if (!quiz.picked) return; quiz.i++; quiz.picked = false; paintQuiz(); var f = $('.quiz__choice', dialog); if (f) f.focus(); }
  dialog.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]'); if (!el) return;
    var a = el.dataset.action;
    if (a === 'quizPick') quizPick(el.dataset.id);
    else if (a === 'quizNext') quizNext();
    else if (a === 'quizClose') dialog.close ? dialog.close() : dialog.removeAttribute('open');
    else if (a === 'quizAgain') { var pool = quiz.qs.map(function (q) { return q.v; }); startQuiz(pool, pool.length, quiz.title); }
    else if (a === 'quizLeech') { state.leech[el.dataset.id] = true; save(); paintQuiz(); refreshVocabUI(); }
    else if (a === 'quizLeechAll') { quiz.missed.forEach(function (v) { state.leech[v.id] = true; }); save(); paintQuiz(); refreshVocabUI(); toast('Marked ' + plural(quiz.missed.length, 'word') + ' as leech'); }
  });
  dialog.addEventListener('keydown', function (e) {
    if (e.key >= '1' && e.key <= '4' && !quiz.picked && quiz.qs[quiz.i]) { var b = $$('.quiz__choice', dialog)[+e.key - 1]; if (b) { e.preventDefault(); quizPick(b.dataset.id); } }
    else if (e.key === 'Enter' && quiz.picked && document.activeElement && !document.activeElement.closest('button')) { e.preventDefault(); quizNext(); }
  });
  function refreshVocabUI() {
    if (ui.view === 'verbal') renderVocabGrid();
  }

  /* 7. Essay timer ----------------------------------------------------- */
  var timer = { remaining: 1800, running: false, handle: null };
  var PHASES_30 = [[0, 'Plan: side, 2–3 examples, one counter-point'], [4, 'Intro: paraphrase, concede, thesis + preview'], [8, 'Body: two reasons, then the concession'], [22, 'Conclusion: thesis in new words, broaden'], [26, 'Proofread: agreement, pronouns, transitions, typos'], [30, 'Time. Pens down.']];
  function timerPaint() {
    var el = document.getElementById('timer-display'); if (!el) return;
    var r = Math.max(0, timer.remaining), m = Math.floor(r / 60), s = r % 60;
    el.textContent = pad(m) + ':' + pad(s);
    el.className = 'timer__display' + (timer.running ? ' is-running' : '') + (r === 0 ? ' is-over' : r <= 240 ? ' is-low' : '');
    var elapsed = (1800 - r) / 60, label = PHASES_30[0][1];
    PHASES_30.forEach(function (p) { if (elapsed >= p[0]) label = p[1]; });
    var ph = document.getElementById('timer-phase'); if (ph) ph.textContent = timer.running || r < 1800 ? label : 'Ready. Press start.';
    var tb = document.getElementById('timer-toggle'); if (tb) tb.innerHTML = timer.running ? ICON.pause + 'Pause' : (r === 0 ? ICON.play + 'Done' : ICON.play + (r < 1800 ? 'Resume' : 'Start'));
  }
  function timerToggle() {
    if (timer.running) { clearInterval(timer.handle); timer.running = false; timerPaint(); return; }
    if (timer.remaining <= 0) return;
    timer.running = true;
    var last = Date.now();
    timer.handle = setInterval(function () {
      var now = Date.now(); var dt = Math.round((now - last) / 1000); if (dt < 1) return; last = now;
      timer.remaining = Math.max(0, timer.remaining - dt);
      if (timer.remaining === 0) { clearInterval(timer.handle); timer.running = false; toast('Time! Pens down.', 'bad'); }
      timerPaint();
      var r = timer.remaining; if (r === 240 || r === 480 || r === 1320 || r === 1560) { toast(PHASES_30.filter(function (p) { return p[0] === (1800 - r) / 60; })[0][1]); }
    }, 250);
    timerPaint();
  }
  function timerReset() { clearInterval(timer.handle); timer.running = false; timer.remaining = 1800; timerPaint(); }
  function timerStop() { clearInterval(timer.handle); timer.running = false; }

  /* 8. Actions ---------------------------------------------------------- */
  var saveDebounce = {};
  function debounce(key, fn, ms) { clearTimeout(saveDebounce[key]); saveDebounce[key] = setTimeout(fn, ms); }

  var actions = {
    startToday: function () { state.startDate = todayISO(); save(); toast('Day 1 is today. Go.', 'good'); rerender(); },
    markAll: function (el) {
      var d = dayById(+el.dataset.day); var before = dayProgress(d);
      d.tasks.forEach(function (t) { state.tasks[t.id] = true; }); markActiveToday(); save();
      var gained = (before.total - before.done) * 10 + (before.complete ? 0 : 50 + (isMockDay(d) ? 100 : 0));
      toast('Day ' + d.day + ' complete! +' + gained + ' XP', 'good'); updateLevelChip(true); rerender();
    },
    resetDay: function (el) {
      var d = dayById(+el.dataset.day);
      if (!confirm('Uncheck all ' + d.tasks.length + ' tasks for Day ' + d.day + '?')) return;
      d.tasks.forEach(function (t) { delete state.tasks[t.id]; }); save(); updateLevelChip(true); rerender();
    },
    toggleKnown: function (el) {
      var id = el.dataset.id, now = !state.known[id];
      if (now) state.known[id] = true; else delete state.known[id]; save();
      $$('[data-action="toggleKnown"][data-id="' + id + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(now)); if (b.classList.contains('t-known')) b.textContent = now ? 'Known' : 'Know it'; });
      var row = el.closest('.word-row, .vcard'); if (row) row.classList.toggle('is-known', now);
      var c = document.getElementById('vocab-count'); if (c) c.textContent = 'Showing ' + vocabFiltered().length + ' of ' + totals.words + ' · ' + Object.keys(state.known).length + ' known · ' + Object.keys(state.leech).length + ' leech';
    },
    toggleLeech: function (el) {
      var id = el.dataset.id, now = !state.leech[id];
      if (now) state.leech[id] = true; else delete state.leech[id]; save();
      el.setAttribute('aria-pressed', String(now)); el.textContent = now ? 'Leech' : 'Leech?';
      var card = el.closest('.vcard'); if (card) card.classList.toggle('is-leech', now);
      var c = document.getElementById('vocab-count'); if (c) c.textContent = 'Showing ' + vocabFiltered().length + ' of ' + totals.words + ' · ' + Object.keys(state.known).length + ' known · ' + Object.keys(state.leech).length + ' leech';
    },
    flip: function (el) { el.closest('.vcard').classList.toggle('is-flipped'); },
    quizDay: function (el) { var n = +el.dataset.day; startQuiz(D.vocab.filter(function (v) { return v.day === n; }), 10, 'Day ' + n + ' words'); },
    quizRandom: function () { startQuiz(D.vocab, 20, '20 random words'); },
    quizUnknown: function () { var pool = D.vocab.filter(function (v) { return !state.known[v.id]; }); if (!pool.length) { toast('Every word is marked known. Nice.', 'good'); return; } startQuiz(pool, Math.min(20, pool.length), 'Unknown words'); },
    exportCsv: function () {
      var q = function (s) { return '"' + String(s).replace(/"/g, '""') + '"'; };
      var csv = 'word,definition,example\n' + D.vocab.map(function (v) { return [q(v.word), q(v.pos + ' ' + v.def), q(v.ex)].join(','); }).join('\n');
      download('gre-vocab.csv', csv, 'text/csv;charset=utf-8'); toast('gre-vocab.csv downloaded — import into Anki as Basic cards.');
    },
    printFormulas: function () {
      document.body.classList.add('print-formulas');
      var done = function () { document.body.classList.remove('print-formulas'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      window.print();
      setTimeout(done, 1500);
    },
    startEssay: function (el) {
      var i = +el.dataset.i;
      if (ui.essay.prompt !== null && ui.essay.prompt !== i && timer.running) { if (!confirm('Switch prompt? The running timer will reset.')) return; }
      timerReset(); ui.essay.prompt = i; ui.essay.focused = false;
      timerToggle(); /* start the countdown immediately; the fresh view paints the running state */
      rerender();
      setTimeout(function () { scrollToAnchor('essay-editor'); }, 50);
    },
    timerToggle: timerToggle,
    timerReset: timerReset,
    saveEssay: function (el) {
      var i = +el.dataset.i, text = (document.getElementById('essay-ta') || {}).value || state.drafts[i] || '';
      var words = wordCount(text);
      if (words < 20) { toast('Write at least 20 words before saving.', 'bad'); return; }
      state.essays.push({ id: uid(), date: todayISO(), promptIndex: i, title: 'Prompt ' + (i + 1) + ': ' + D.awa.practicePrompts[i].split(' — ')[0].slice(0, 70) + (D.awa.practicePrompts[i].length > 70 ? '…' : ''), words: words, text: text, seconds: 1800 - timer.remaining });
      delete state.drafts[i]; save(); timerStop(); ui.essay.prompt = null; markActiveToday();
      toast('Essay saved — ' + words + ' words', 'good'); rerender(); setTimeout(function () { scrollToAnchor('essays'); }, 50);
    },
    clearDraft: function (el) { var i = +el.dataset.i; if (!confirm('Clear this draft?')) return; delete state.drafts[i]; save(); var ta = document.getElementById('essay-ta'); if (ta) { ta.value = ''; document.getElementById('word-count').textContent = '0'; } },
    closeEditor: function () { if (timer.running && !confirm('Stop the timer and close the editor? Your draft is saved.')) return; timerStop(); ui.essay.prompt = null; rerender(); },
    deleteEssay: function (el) { if (!confirm('Delete this essay?')) return; state.essays = state.essays.filter(function (e) { return e.id !== el.dataset.id; }); save(); rerender(); },
    logMock: function (el) { ui.scoreLabel = el.dataset.name; rerender(); setTimeout(function () { scrollToAnchor('log'); var v = document.getElementById('sc-v'); if (v) v.focus(); }, 60); },
    deleteScore: function (el) { if (!confirm('Delete this score?')) return; state.scores = state.scores.filter(function (s) { return s.id !== el.dataset.id; }); save(); rerender(); },
    resFilter: function (el) { ui.res[el.dataset.k] = el.dataset.v; rerender(); },
    deleteError: function (el) { state.errors = state.errors.filter(function (e) { return e.id !== el.dataset.id; }); save(); rerender(); },
    exportJson: function () { download('gre-blocks-progress-' + todayISO() + '.json', JSON.stringify(state, null, 2), 'application/json'); toast('Progress exported'); },
    resetAll: function () {
      if (!confirm('Reset EVERYTHING on this device? Tasks, XP, vocab, essays, scores, error log and notes will be erased.')) return;
      if (!confirm('Last chance — this cannot be undone. Export first if unsure. Reset now?')) return;
      state = defaults(); save(); timerStop(); ui.essay.prompt = null; toast('Everything reset'); updateLevelChip(true); rerender();
    }
  };

  var changes = {
    task: function (el) {
      var id = el.dataset.task, d = dayById(+el.dataset.day), before = dayProgress(d);
      if (el.checked) { state.tasks[id] = true; markActiveToday(); } else delete state.tasks[id];
      save();
      var after = dayProgress(d);
      el.closest('.task').classList.toggle('is-done', el.checked);
      var doneEl = document.getElementById('day-done'); if (doneEl) doneEl.textContent = after.done;
      var bar = $('#day-progress .progress__bar'); if (bar) { bar.style.setProperty('--value', after.pct + '%'); bar.classList.toggle('is-zero', after.pct === 0); bar.parentNode.setAttribute('aria-valuenow', after.pct); }
      var note = document.getElementById('day-xp-note');
      if (after.complete && !before.complete) { var bonus = 50 + (isMockDay(d) ? 100 : 0); toast('Day ' + d.day + ' complete! +' + (10 + bonus) + ' XP', 'good'); if (note) note.textContent = 'Day complete · +' + bonus + ' XP bonus earned'; }
      else if (el.checked) { toast('+10 XP'); }
      else { if (note) note.textContent = '10 XP per task · +50 when the day is done' + (isMockDay(d) ? ' · +100 mock bonus' : ''); }
      updateLevelChip(true);
    },
    checklist: function (el) {
      if (el.checked) state.checklist[el.dataset.id] = true; else delete state.checklist[el.dataset.id]; save();
      el.closest('li').classList.toggle('is-done', el.checked);
      var c = document.getElementById('checklist-count'); if (c) c.textContent = Object.keys(state.checklist).length + '/' + D.testDay.checklist.length;
    },
    startDate: function (el) { if (!/^\d{4}-\d{2}-\d{2}$/.test(el.value)) return; state.startDate = el.value; save(); toast('Start date set: ' + fmtDate(parseISO(el.value))); rerender(); },
    vocabDay: function (el) { ui.vocab.day = el.value; ui.vocab.touched = true; renderVocabGrid(); },
    vocabStatus: function (el) { ui.vocab.status = el.value; ui.vocab.touched = true; renderVocabGrid(); },
    target: function (el) { state.targets[el.dataset.k] = el.value; save(); debounce('target', rerender, 400); },
    importJson: function (el) {
      var f = el.files && el.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var obj = JSON.parse(reader.result);
          if (!obj || typeof obj !== 'object' || !('tasks' in obj)) throw new Error('not a GRE Blocks file');
          var n = Object.keys(obj.tasks || {}).length;
          if (!confirm('Import this file and overwrite the progress on this device? (' + n + ' completed tasks, ' + (obj.scores || []).length + ' scores, ' + (obj.essays || []).length + ' essays)')) { el.value = ''; return; }
          state = migrate(obj); save(); toast('Progress imported', 'good'); updateLevelChip(true); rerender();
        } catch (e) { toast('Could not import: ' + e.message, 'bad'); }
        el.value = '';
      };
      reader.readAsText(f);
    }
  };

  var inputs = {
    vocabSearch: function (el) { ui.vocab.q = el.value; debounce('vocab', renderVocabGrid, 80); },
    formulaSearch: function (el) {
      var q = el.value.trim().toLowerCase(), shown = 0;
      $$('.ftopic').forEach(function (t) {
        var vis = 0;
        $$('.formula', t).forEach(function (f) { var hit = !q || f.dataset.text.indexOf(q) >= 0; f.classList.toggle('is-hidden', !hit); if (hit) vis++; });
        t.classList.toggle('is-hidden', vis === 0); shown += vis;
      });
      document.getElementById('formula-count').textContent = shown + (q ? ' of ' + totals.formulas : '') + ' cards';
      document.getElementById('formula-none').hidden = shown > 0;
    },
    draft: function (el) {
      var i = +el.dataset.i; state.drafts[i] = el.value;
      document.getElementById('word-count').textContent = wordCount(el.value);
      debounce('draft', function () { save(); var s = document.getElementById('draft-status'); if (s) s.textContent = 'Draft saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }, 400);
    },
    notes: function (el) { state.notes = el.value; debounce('notes', function () { save(); var s = document.getElementById('notes-status'); if (s) s.textContent = 'Saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }, 400); }
  };

  var submits = {
    score: function (form) {
      var f = form.elements;
      var v = parseInt(f.v.value, 10), q = parseInt(f.q.value, 10), awa = f.awa.value === '' ? '' : parseFloat(f.awa.value);
      if (!(v >= 130 && v <= 170) || !(q >= 130 && q <= 170)) { toast('Verbal and Quant must be 130–170', 'bad'); return; }
      state.scores.push({ id: uid(), date: f.date.value || todayISO(), label: f.label.value.trim(), v: v, q: q, awa: awa, notes: f.notes.value.trim() });
      ui.scoreLabel = ''; markActiveToday(); save(); toast('Score logged: V ' + v + ' · Q ' + q, 'good'); rerender(); setTimeout(function () { scrollToAnchor('log'); }, 50);
    },
    error: function (form) {
      var f = form.elements;
      state.errors.push({ id: uid(), date: f.date.value || todayISO(), section: f.section.value, topic: f.topic.value.trim(), type: f.type.value, note: f.note.value.trim() });
      save(); toast('Logged. Repeated topics turn red.'); rerender(); setTimeout(function () { scrollToAnchor('errors'); }, 50);
    }
  };

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]'); if (!el || !app.contains(el)) return;
    var fn = actions[el.dataset.action]; if (fn) { e.preventDefault(); fn(el, e); }
  });
  app.addEventListener('change', function (e) {
    var el = e.target.closest('[data-change]'); if (!el) return;
    var fn = changes[el.dataset.change]; if (fn) fn(el, e);
  });
  app.addEventListener('input', function (e) {
    var el = e.target.closest('[data-input]'); if (!el) return;
    var fn = inputs[el.dataset.input]; if (fn) fn(el, e);
  });
  app.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-submit]'); if (!form) return;
    e.preventDefault(); var fn = submits[form.dataset.submit]; if (fn) fn(form, e);
  });
  cleanupFns.push(function () {});

  /* Re-fit the score chart on resize; mark the nav when scrolled to its end so the fade hint can drop */
  window.addEventListener('resize', function () { debounce('resize', function () { if (ui.view === 'mocks') paintChart(); navEdge(); }, 150); });
  var navUl = document.getElementById('nav');
  function navEdge() { navUl.classList.toggle('is-at-end', navUl.scrollLeft + navUl.clientWidth >= navUl.scrollWidth - 2); navUl.classList.toggle('is-at-start', navUl.scrollLeft <= 2); }
  navUl.addEventListener('scroll', navEdge, { passive: true });

  /* Stop the essay timer when leaving the Writing view */
  window.addEventListener('hashchange', function () {
    var r = parseHash();
    if (ui.view === 'writing' && r.view !== 'writing' && timer.running) { timerStop(); toast('Essay timer paused — your draft is saved.'); }
    render();
  });

  /* Bridge for add-on modules (assets/tests-engine.js): state access, helpers, registries, router */
  window.GREApp = {
    get state() { return state; }, save: save, esc: esc, toast: toast, uid: uid, todayISO: todayISO, fmtShort: fmtShort, fmtDate: fmtDate, parseISO: parseISO,
    ICON: ICON, $: $, $$: $$, actions: actions, changes: changes, inputs: inputs, submits: submits, VIEWS: VIEWS, TITLES: TITLES, ui: ui,
    render: render, rerender: rerender, scrollToAnchor: scrollToAnchor, updateLevelChip: updateLevelChip, markActiveToday: markActiveToday, levelInfo: levelInfo,
    onCleanup: function (fn) { cleanupFns.push(fn); }, resById: resById, pageHead: pageHead, progressBar: progressBar, debounce: debounce, plural: plural, hooks: {}
  };

  /* 9. Boot ------------------------------------------------------------- */
  initTheme();
  if (!location.hash) history.replaceState(null, '', '#roadmap');
  render();
})();
