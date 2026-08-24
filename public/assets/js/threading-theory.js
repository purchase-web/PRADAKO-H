/* ==========================================================================
   PRADAKO — THREADING THEORY
   Profile studio · table tabs · scroll reveal
   No dependencies. No CDN. ES5-safe syntax where practical.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1 · THREAD DATA — ISO 261 / ISO 262 preferred sizes
     Stored as [nominal diameter mm, pitch mm]
     -------------------------------------------------------------------- */
  var SERIES = {
    coarse: [
      [1.6, 0.35], [2, 0.4], [2.5, 0.45], [3, 0.5], [4, 0.7], [5, 0.8],
      [6, 1], [8, 1.25], [10, 1.5], [12, 1.75], [14, 2], [16, 2],
      [20, 2.5], [24, 3], [30, 3.5], [36, 4], [42, 4.5], [48, 5],
      [56, 5.5], [64, 6]
    ],
    fine: [
      [8, 1], [10, 1.25], [10, 1], [12, 1.5], [12, 1.25], [14, 1.5],
      [16, 1.5], [18, 1.5], [20, 1.5], [22, 1.5], [24, 2], [27, 2],
      [30, 2], [33, 2], [36, 3], [42, 3], [48, 3], [56, 4], [64, 4]
    ]
  };

  /* ----------------------------------------------------------------------
     2 · GEOMETRY — every value derived from ISO 68-1
     -------------------------------------------------------------------- */
  function geometry(d, P, starts) {
    var H  = Math.sqrt(3) / 2 * P;          // fundamental triangle height
    var d2 = d - 0.649519 * P;              // pitch diameter
    var d1 = d - 1.082532 * P;              // minor diameter (internal D1)
    var d3 = d1 - H / 6;                    // minor diameter, rounded root
    var As = Math.PI / 4 * Math.pow((d2 + d3) / 2, 2);
    var lead = starts * P;
    var lam  = Math.atan(lead / (Math.PI * d2)) * 180 / Math.PI;
    return {
      d: d, P: P, H: H, d2: d2, d1: d1, d3: d3,
      As: As, lead: lead, lam: lam,
      tap: d - P,
      es: -(15 + 11 * P),                   // ISO 965-1 position g, µm
      tpi: 25.4 / P,
      starts: starts
    };
  }

  function fmt(v, dp) { return v.toFixed(dp === undefined ? 3 : dp); }

  /* ----------------------------------------------------------------------
     3 · PROFILE STUDIO
     -------------------------------------------------------------------- */
  var svg      = document.getElementById('tt-profile-svg');
  var sizeSel  = document.getElementById('tt-size');
  var startsIn = document.getElementById('tt-starts');
  var segBtns  = document.querySelectorAll('.tt-seg button[data-series]');

  var state = { series: 'coarse', index: 8, starts: 1 };   // default M10 × 1.5

  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, text) {
    var n = document.createElementNS(NS, tag), k;
    for (k in attrs) { if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]); }
    if (text !== undefined) { n.textContent = text; }
    return n;
  }

  function populateSizes() {
    if (!sizeSel) { return; }
    var list = SERIES[state.series];
    sizeSel.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
      var o = document.createElement('option');
      o.value = i;
      o.textContent = 'M' + list[i][0] + ' × ' + list[i][1];
      sizeSel.appendChild(o);
    }
    if (state.index >= list.length) { state.index = 0; }
    sizeSel.value = String(state.index);
  }

  /* --- SVG profile: true-to-scale axial section, 3 pitches ------------- */
  function drawProfile(g) {
    if (!svg) { return; }
    while (svg.firstChild) { svg.removeChild(svg.firstChild); }

    var VW = 640, X0 = 62, X1 = 522, DRAW = X1 - X0;
    var NP = 3;                                   // pitches shown
    var s  = DRAW / (NP * g.P);                   // px per mm — isometric
    var Ppx = g.P * s, Hpx = g.H * s;

    var rTopY = 46;                               // y of sharp crest apex
    var yCrest = rTopY + Hpx / 8;                 // basic major diameter line
    var yPitch = rTopY + Hpx / 8 + (3 / 8) * Hpx; // pitch line: 3H/8 below crest
    var yMinor = rTopY + Hpx / 8 + (5 / 8) * Hpx; // basic minor (D1)
    var yD3    = yMinor + Hpx / 12;               // radial: (d1 − d3)/2 = H/12
    var ySharpRoot = rTopY + Hpx;

    /* --- material fill + profile path --- */
    var crestFlat = Ppx / 8, rootFlat = Ppx / 4, run = Ppx * 5 / 16;
    var path = 'M ' + X0 + ' ' + yCrest;
    var x = X0;
    for (var i = 0; i < NP; i++) {
      path += ' L ' + (x + crestFlat) + ' ' + yCrest;
      path += ' L ' + (x + crestFlat + run) + ' ' + yMinor;
      path += ' L ' + (x + crestFlat + run + rootFlat) + ' ' + yMinor;
      path += ' L ' + (x + Ppx) + ' ' + yCrest;
      x += Ppx;
    }
    var fill = path + ' L ' + X1 + ' ' + (ySharpRoot + 34) +
               ' L ' + X0 + ' ' + (ySharpRoot + 34) + ' Z';
    svg.appendChild(el('path', { d: fill, class: 'fillmat' }));

    /* --- fundamental triangle, dashed --- */
    var tri = '', tx = X0 - crestFlat / 2;
    for (var j = 0; j <= NP; j++) {
      tri += ' M ' + tx + ' ' + ySharpRoot +
             ' L ' + (tx + Ppx / 2) + ' ' + rTopY +
             ' L ' + (tx + Ppx) + ' ' + ySharpRoot;
      tx += Ppx;
    }
    svg.appendChild(el('path', { d: tri, class: 'basic' }));
    svg.appendChild(el('path', { d: path, class: 'flank' }));

    /* --- diameter reference lines --- */
    var lines = [
      [yCrest, 'd  major',  fmt(g.d)],
      [yPitch, 'd₂ pitch',  fmt(g.d2)],
      [yMinor, 'd₁ minor',  fmt(g.d1)],
      [yD3,    'd₃ root',   fmt(g.d3)]
    ];
    for (var k = 0; k < lines.length; k++) {
      svg.appendChild(el('line', {
        x1: X0 - 8, y1: lines[k][0], x2: X1 + 8, y2: lines[k][0], class: 'dim'
      }));
      svg.appendChild(el('text', {
        x: X1 + 14, y: lines[k][0] + 3, class: k === 1 ? 'lbl' : ''
      }, lines[k][1] + '  ' + lines[k][2]));
    }

    /* --- pitch dimension --- */
    var py = ySharpRoot + 22, ax = X0 + crestFlat / 2;
    svg.appendChild(el('line', { x1: ax, y1: py - 8, x2: ax, y2: py + 6, class: 'dim' }));
    svg.appendChild(el('line', { x1: ax + Ppx, y1: py - 8, x2: ax + Ppx, y2: py + 6, class: 'dim' }));
    svg.appendChild(el('line', { x1: ax, y1: py, x2: ax + Ppx, y2: py, class: 'dim' }));
    svg.appendChild(el('text', {
      x: ax + Ppx / 2, y: py - 5, 'text-anchor': 'middle', class: 'lbl'
    }, 'P = ' + g.P + ' mm'));

    /* --- H dimension --- */
    svg.appendChild(el('line', { x1: X0 - 26, y1: rTopY, x2: X0 - 26, y2: ySharpRoot, class: 'dim' }));
    svg.appendChild(el('line', { x1: X0 - 31, y1: rTopY, x2: X0 - 21, y2: rTopY, class: 'dim' }));
    svg.appendChild(el('line', { x1: X0 - 31, y1: ySharpRoot, x2: X0 - 21, y2: ySharpRoot, class: 'dim' }));
    svg.appendChild(el('text', {
      x: X0 - 34, y: (rTopY + ySharpRoot) / 2 + 3, 'text-anchor': 'end', class: 'lbl'
    }, 'H = ' + fmt(g.H)));

    /* --- 60° flank angle marker --- */
    var apexX = X0 - crestFlat / 2 + Ppx * 1.5, apexY = rTopY;
    svg.appendChild(el('path', {
      d: 'M ' + (apexX - 15) + ' ' + (apexY + 26) + ' A 30 30 0 0 0 ' + (apexX + 15) + ' ' + (apexY + 26),
      class: 'dim', fill: 'none'
    }));
    svg.appendChild(el('text', {
      x: apexX, y: apexY + 40, 'text-anchor': 'middle', class: 'lbl'
    }, '60°'));

    /* --- axis break + radial proportion bar --- */
    var barY = 322, bx0 = X0, bx1 = X1;
    svg.appendChild(el('text', { x: X0 - 26, y: barY - 26 }, 'axis break'));
    svg.appendChild(el('path', {
      d: 'M ' + X0 + ' ' + (barY - 34) + ' q 14 -8 28 0 q 14 8 28 0',
      class: 'dim', fill: 'none'
    }));

    var R = g.d / 2;
    function px(r) { return bx0 + (r / R) * (bx1 - bx0); }
    svg.appendChild(el('line', { x1: bx0, y1: barY, x2: bx1, y2: barY, class: 'ctr' }));
    svg.appendChild(el('text', { x: bx0, y: barY + 30, 'text-anchor': 'start' }, 'axis  ⌀0'));

    var ticks = [
      [g.d3 / 2, 'd₃'], [g.d1 / 2, 'd₁'], [g.d2 / 2, 'd₂'], [R, 'd']
    ];
    for (var t = 0; t < ticks.length; t++) {
      var X = px(ticks[t][0]);
      svg.appendChild(el('line', { x1: X, y1: barY - 11, x2: X, y2: barY + 11, class: 'dim' }));
      svg.appendChild(el('text', {
        x: X, y: barY - 17, 'text-anchor': 'middle', class: t === 3 ? 'lbl' : ''
      }, ticks[t][1]));
    }
    var depthPct = ((R - g.d3 / 2) / R * 100);
    svg.appendChild(el('rect', {
      x: px(g.d3 / 2), y: barY - 5, width: (bx1 - px(g.d3 / 2)), height: 10,
      fill: 'currentColor', opacity: '.12'
    }));
    svg.appendChild(el('text', {
      x: bx1, y: barY + 30, 'text-anchor': 'end'
    }, 'thread depth = ' + depthPct.toFixed(1) + '% of radius'));

    svg.setAttribute('viewBox', '0 0 ' + VW + ' 380');
  }

  function setText(id, v) {
    var n = document.getElementById(id);
    if (n) { n.textContent = v; }
  }

  function render() {
    var pair = SERIES[state.series][state.index];
    if (!pair) { return; }
    var g = geometry(pair[0], pair[1], state.starts);

    setText('ro-H',    fmt(g.H) + ' mm');
    setText('ro-d2',   fmt(g.d2) + ' mm');
    setText('ro-d1',   fmt(g.d1) + ' mm');
    setText('ro-d3',   fmt(g.d3) + ' mm');
    setText('ro-As',   fmt(g.As, 2) + ' mm²');
    setText('ro-lam',  fmt(g.lam, 2) + '°');
    setText('ro-lead', fmt(g.lead, 2) + ' mm');
    setText('ro-tap',  fmt(g.tap, 2) + ' mm');
    setText('ro-es',   fmt(g.es, 1) + ' µm');
    setText('ro-tpi',  fmt(g.tpi, 2));

    drawProfile(g);
  }

  if (sizeSel) {
    populateSizes();
    sizeSel.addEventListener('change', function () {
      state.index = parseInt(sizeSel.value, 10) || 0;
      render();
    });
  }

  for (var b = 0; b < segBtns.length; b++) {
    segBtns[b].addEventListener('click', function () {
      var want = this.getAttribute('data-series');
      if (want === state.series) { return; }
      state.series = want;
      state.index = want === 'coarse' ? 8 : 0;
      for (var q = 0; q < segBtns.length; q++) {
        segBtns[q].setAttribute('aria-pressed',
          segBtns[q].getAttribute('data-series') === want ? 'true' : 'false');
      }
      populateSizes();
      render();
    });
  }

  if (startsIn) {
    startsIn.addEventListener('input', function () {
      var v = parseInt(startsIn.value, 10);
      state.starts = (isNaN(v) || v < 1) ? 1 : Math.min(v, 6);
      render();
    });
  }

  render();

  /* ----------------------------------------------------------------------
     4 · TABLE TABS
     -------------------------------------------------------------------- */
  var tabs = document.querySelectorAll('.tt-tab[role="tab"]');
  function selectTab(tab) {
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i] === tab;
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      var panel = document.getElementById(tabs[i].getAttribute('aria-controls'));
      if (panel) { panel.hidden = !on; }
    }
  }
  for (var ti = 0; ti < tabs.length; ti++) {
    (function (tab) {
      tab.addEventListener('click', function () { selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') { return; }
        e.preventDefault();
        var idx = Array.prototype.indexOf.call(tabs, tab);
        var next = tabs[(idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        selectTab(next);
      });
    })(tabs[ti]);
  }

  /* ----------------------------------------------------------------------
     5 · SCROLL REVEAL
     -------------------------------------------------------------------- */
  var revs = document.querySelectorAll('.tt-rev');
  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    for (var r = 0; r < revs.length; r++) { revs[r].classList.add('in'); }
  } else {
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var node = entries[i].target;
          var d = Math.min(parseInt(node.getAttribute('data-delay') || '0', 10), 300);
          setTimeout(function (n) {
            return function () { n.classList.add('in'); };
          }(node), d);
          io.unobserve(node);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    for (var rr = 0; rr < revs.length; rr++) { io.observe(revs[rr]); }
  }

}());


/* ==========================================================================
   V2 — navigator filter · cross-reference table · charts
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, a, t) {
    var n = document.createElementNS(NS, tag), k;
    for (k in a) { if (a.hasOwnProperty(k)) n.setAttribute(k, a[k]); }
    if (t !== undefined) { n.textContent = t; }
    return n;
  }

  /* ---------------- 1 · NAVIGATOR FILTER ---------------- */
  var navBtns = document.querySelectorAll('.tt-navfilter button[data-filter]');
  var navItems = document.querySelectorAll('.tt-navcol li[data-fam]');
  for (var i = 0; i < navBtns.length; i++) {
    navBtns[i].addEventListener('click', function () {
      var f = this.getAttribute('data-filter');
      for (var b = 0; b < navBtns.length; b++) {
        navBtns[b].setAttribute('aria-pressed',
          navBtns[b].getAttribute('data-filter') === f ? 'true' : 'false');
      }
      for (var n = 0; n < navItems.length; n++) {
        var fam = ' ' + navItems[n].getAttribute('data-fam') + ' ';
        var show = (f === 'all') || fam.indexOf(' ' + f + ' ') > -1;
        navItems[n].classList.toggle('is-out', !show);
      }
    });
  }

  /* ---------------- 2 · INCH CROSS-REFERENCE TABLE ----------------
     TPI verified against BS 84 and ASME B1.1. Nulls where the size
     does not exist in that series. Pitch computed, never transcribed. */
  var XREF = [
    ['No. 1', 1.854, null, null, 64, 72], ['No. 2', 2.184, null, null, 56, 64],
    ['No. 3', 2.515, null, null, 48, 56], ['No. 4', 2.845, null, null, 40, 48],
    ['No. 5', 3.175, null, null, 40, 44], ['No. 6', 3.505, null, null, 32, 40],
    ['No. 8', 4.166, null, null, 32, 36], ['No. 10', 4.826, null, null, 24, 32],
    ['No. 12', 5.486, null, null, 24, 28],
    ['1/8"', 3.175, 40, null, null, null], ['3/16"', 4.762, 24, 32, null, null],
    ['1/4"', 6.35, 20, 26, 20, 28], ['5/16"', 7.938, 18, 22, 18, 24],
    ['3/8"', 9.525, 16, 20, 16, 24], ['7/16"', 11.112, 14, 18, 14, 20],
    ['1/2"', 12.7, 12, 16, 13, 20], ['9/16"', 14.288, 12, 16, 12, 18],
    ['5/8"', 15.875, 11, 14, 11, 18], ['11/16"', 17.462, 11, 14, null, null],
    ['3/4"', 19.05, 10, 12, 10, 16], ['7/8"', 22.225, 9, 11, 9, 14],
    ['1"', 25.4, 8, 10, 8, 12], ['1.1/8"', 28.575, 7, 9, 7, 12],
    ['1.1/4"', 31.75, 7, 9, 7, 12], ['1.3/8"', 34.925, 6, 8, 6, 12],
    ['1.1/2"', 38.1, 6, 8, 6, 12], ['1.5/8"', 41.275, 5, 8, null, null],
    ['1.3/4"', 44.45, 5, 7, 5, null], ['2"', 50.8, 4.5, 7, 4.5, null],
    ['2.1/4"', 57.15, 4, 6, 4.5, null], ['2.1/2"', 63.5, 4, 6, 4, null],
    ['2.3/4"', 69.85, 3.5, 6, 4, null], ['3"', 76.2, 3.5, 5, 4, null],
    ['3.1/2"', 88.9, 3.25, null, null, null], ['4"', 101.6, 3, null, null, null],
    ['5"', 127, 2.75, null, null, null], ['6"', 152.4, 2.5, null, null, null]
  ];

  var xbody = document.getElementById('tt-xref-body');
  if (xbody) {
    var out = '';
    for (var r = 0; r < XREF.length; r++) {
      var row = XREF[r];
      out += '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td>';
      for (var c = 2; c < 6; c++) {
        if (row[c] === null) { out += '<td>—</td><td>—</td>'; }
        else { out += '<td>' + row[c] + '</td><td>' + (25.4 / row[c]).toFixed(3) + '</td>'; }
      }
      out += '</tr>';
    }
    xbody.innerHTML = out;
  }

  /* ---------------- 3 · CHART: STRESS AREA ---------------- */
  function stressArea(d, P) {
    var H = Math.sqrt(3) / 2 * P;
    var d2 = d - 0.649519 * P;
    var d3 = d - 1.082532 * P - H / 6;
    return Math.PI / 4 * Math.pow((d2 + d3) / 2, 2);
  }

  var chartAs = document.getElementById('tt-chart-as');
  if (chartAs) {
    var COARSE = [[6,1],[8,1.25],[10,1.5],[12,1.75],[16,2],[20,2.5],[24,3],[30,3.5],[36,4]];
    var FINE   = [[8,1],[10,1.25],[12,1.5],[16,1.5],[20,1.5],[24,2],[30,2],[36,3]];
    var W = 720, Hh = 320, L = 56, Rr = 18, T = 16, B = 44;
    var xMin = 6, xMax = 36, yMax = 900;
    function X(v){ return L + (v - xMin) / (xMax - xMin) * (W - L - Rr); }
    function Y(v){ return Hh - B - (v / yMax) * (Hh - T - B); }

    var g, k;
    for (k = 0; k <= 6; k++) {
      var yv = k * 150;
      chartAs.appendChild(el('line', { x1: L, y1: Y(yv), x2: W - Rr, y2: Y(yv), class: 'gl' }));
      chartAs.appendChild(el('text', { x: L - 8, y: Y(yv) + 3, 'text-anchor': 'end', class: 'ax' }, String(yv)));
    }
    chartAs.appendChild(el('line', { x1: L, y1: Y(0), x2: W - Rr, y2: Y(0), class: 'axline' }));
    var xt = [6,8,10,12,16,20,24,30,36];
    for (k = 0; k < xt.length; k++) {
      chartAs.appendChild(el('text', { x: X(xt[k]), y: Hh - B + 18, 'text-anchor': 'middle', class: 'ax' }, 'M' + xt[k]));
    }
    chartAs.appendChild(el('text', { x: L - 8, y: T + 4, 'text-anchor': 'end', class: 'ax' }, 'mm²'));

    function series(data, colour) {
      var dpath = '', j;
      for (j = 0; j < data.length; j++) {
        var a = stressArea(data[j][0], data[j][1]);
        dpath += (j ? ' L ' : 'M ') + X(data[j][0]) + ' ' + Y(a);
      }
      chartAs.appendChild(el('path', { d: dpath, fill: 'none', stroke: colour, 'stroke-width': '2.4', 'stroke-linejoin': 'round' }));
      for (j = 0; j < data.length; j++) {
        var av = stressArea(data[j][0], data[j][1]);
        chartAs.appendChild(el('circle', { cx: X(data[j][0]), cy: Y(av), r: '3.4', fill: colour }));
      }
    }
    series(COARSE, '#12525E');
    series(FINE, '#C1461E');

    var m10c = stressArea(10, 1.5), m10f = stressArea(10, 1.25);
    chartAs.appendChild(el('line', { x1: X(10), y1: Y(m10c), x2: X(10), y2: Y(m10f), stroke: 'rgba(10,10,11,.35)', 'stroke-width': '1', 'stroke-dasharray': '3 3' }));
    chartAs.appendChild(el('text', { x: X(10) + 8, y: Y(m10f) - 6 }, 'M10 · 58.0 vs 61.2 mm²'));
  }

  /* ---------------- 4 · CHART: TORQUE SPLIT ---------------- */
  var chartT = document.getElementById('tt-chart-torque');
  if (chartT) {
    var segs = [[50, '#D2521E', 'BEARING FACE FRICTION'], [40, '#8A6212', 'THREAD FRICTION'], [10, '#1F7A3D', 'BOLT EXTENSION']];
    var x0 = 20, wTot = 680, yBar = 56, hBar = 62, acc = 0;
    for (var s = 0; s < segs.length; s++) {
      var w = segs[s][0] / 100 * wTot;
      chartT.appendChild(el('rect', { x: x0 + acc, y: yBar, width: w, height: hBar, fill: segs[s][1] }));
      chartT.appendChild(el('text', {
        x: x0 + acc + w / 2, y: yBar + hBar / 2 + 4, 'text-anchor': 'middle',
        fill: '#fff', 'font-size': '13', 'font-weight': '700'
      }, segs[s][0] + '%'));
      chartT.appendChild(el('text', {
        x: x0 + acc + w / 2, y: yBar + hBar + 22, 'text-anchor': 'middle', 'font-size': '8.5'
      }, segs[s][2]));
      acc += w;
    }
    chartT.appendChild(el('text', { x: x0, y: 34 }, 'APPLIED TIGHTENING TORQUE — 100%'));
    chartT.appendChild(el('line', { x1: x0 + wTot * 0.9, y1: yBar - 10, x2: x0 + wTot, y2: yBar - 10, class: 'axline' }));
    chartT.appendChild(el('text', { x: x0 + wTot, y: yBar - 16, 'text-anchor': 'end', fill: '#1F7A3D', 'font-weight': '700' }, 'USEFUL WORK'));
  }

  /* ---------------- 5 · CHART: THREAD LOAD SHARE ---------------- */
  var chartS = document.getElementById('tt-chart-share');
  if (chartS) {
    var share = [34, 23, 16, 11, 9, 7];
    var bx = 60, bw = 78, gap = 22, base = 200, scale = 4.4;
    for (var t = 0; t < share.length; t++) {
      var h = share[t] * scale;
      var x = bx + t * (bw + gap);
      chartS.appendChild(el('rect', {
        x: x, y: base - h, width: bw, height: h,
        fill: t === 0 ? '#A81E3A' : 'rgba(10,10,11,.22)'
      }));
      chartS.appendChild(el('text', {
        x: x + bw / 2, y: base - h - 9, 'text-anchor': 'middle',
        'font-size': '12', 'font-weight': '700',
        fill: t === 0 ? '#A81E3A' : 'rgba(10,10,11,.55)'
      }, share[t] + '%'));
      chartS.appendChild(el('text', {
        x: x + bw / 2, y: base + 20, 'text-anchor': 'middle', class: 'ax'
      }, 'THREAD ' + (t + 1)));
    }
    chartS.appendChild(el('line', { x1: 40, y1: base, x2: 680, y2: base, class: 'axline' }));
    chartS.appendChild(el('text', { x: 40, y: 30 }, 'SHARE OF TOTAL AXIAL LOAD PER ENGAGED THREAD'));
  }
}());


/* ==========================================================================
   V3 — data engine · gauging & tap calculators · identifier · torque
   Depends on window.PX_THREADS (threading-data.js)
   ========================================================================== */
(function () {
  'use strict';
  var TD = window.PX_THREADS || {};

  function $(id){ return document.getElementById(id); }
  function fx(v,dp){ return (isFinite(v)? v.toFixed(dp===undefined?3:dp) : '—'); }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  /* ---------- table metadata ---------- */
  var META = {
    mc:['Metric coarse — basic','ISO 68-1 / ISO 261','profile geometry closure'],
    mf:['Metric fine — basic','ISO 68-1 / ISO 262','profile geometry closure'],
    mext:['Metric external limits','ISO 965-1 / ASME B1.13M','deviation + tolerance closure'],
    mint:['Metric internal limits 6H','ISO 965-1 / ASME B1.13M','EI = 0 at pitch diameter'],
    roll:['Metric roll-thread PD reference','ASME B1.13M','deviation + tolerance closure'],
    bsw:['BSW coarse','BS 84','55° Whitworth h = 0.640327P'],
    bsf:['BSF fine','BS 84','55° Whitworth h = 0.640327P'],
    bspp:['BSPP · G parallel','ISO 228-1','55° form + TPI closure'],
    bspt:['BSPT · R taper','ISO 7-1','55° form, taper 1:16'],
    npt:['NPT taper pipe','ASME B1.20.1','P = 1/n, h = 0.8P'],
    unc:['UNC coarse','ASME B1.1','basic PD = D − 0.649519P'],
    unf:['UNF fine','ASME B1.1','basic PD = D − 0.649519P'],
    unef:['UNEF extra fine','ASME B1.1','basic PD = D − 0.649519P'],
    uns:['UNS special','ASME B1.1','basic PD = D − 0.649519P'],
    un6:['6UN uniform pitch','ASME B1.1','basic PD closure'],
    un8:['8UN uniform pitch','ASME B1.1','basic PD closure'],
    un12:['12UN uniform pitch','ASME B1.1','basic PD closure'],
    un16:['16UN uniform pitch','ASME B1.1','basic PD closure'],
    un20:['20UN uniform pitch','ASME B1.1','basic PD closure'],
    un28:['28UN uniform pitch','ASME B1.1','basic PD closure'],
    un32:['32UN uniform pitch','ASME B1.1','basic PD closure'],
    unjc:['UNJC controlled root','ASME B1.15','root radius 0.15011P–0.18042P'],
    unjf:['UNJF controlled root','ASME B1.15','root radius 0.15011P–0.18042P'],
    unjef:['UNJEF controlled root','ASME B1.15','root radius 0.15011P–0.18042P'],
    unj8:['8UNJ controlled root','ASME B1.15','root radius band + PD closure'],
    unj12:['12UNJ controlled root','ASME B1.15','root radius band + PD closure'],
    unj16:['16UNJ controlled root','ASME B1.15','root radius band + PD closure'],
    tr:['Trapezoidal Tr','ISO 2901 / 2904','D2 = d − 0.5P, D1 = d − P'],
    acme:['Acme general purpose','ASME B1.5','h = P/2, F = 0.3707P'],
    stub:['Stub Acme','ASME B1.8','h = 0.3P, F = 0.4224P'],
    stubform:['Stub Acme form constants','ASME B1.8','exact pitch multiples'],
    forms:['Unified thread form constants','ASME B1.1','exact pitch multiples']
  };
  var ORDER = ['mc','mf','mext','mint','roll','unc','unf','unef','uns',
    'un6','un8','un12','un16','un20','un28','un32',
    'unjc','unjf','unjef','unj8','unj12','unj16',
    'bsw','bsf','bspp','bspt','npt','tr','acme','stub','stubform','forms'];

  var HEAD = {
    s:'Designation', d:'d (mm)', P:'P (mm)', d2:'d₂ (mm)', D1:'D₁ (mm)', d3:'d₃ (mm)',
    H:'H (mm)', r:'Root r (mm)', tap:'Tap drill', As:'Aₛ (mm²)', lam:'λ (°)',
    cls:'Class', dmax:'Major max', dmin:'Major min', p2max:'PD max', p2min:'PD min',
    tol:'PD tol', es:'es (µm)', D2max:'D₂ max', D2min:'D₂ min', D1min:'D₁ min',
    Dmin:'D min', d1:'d₁ (mm)', tpi:'TPI', H1:'H₁ (mm)', h:'h (mm)', eff:'Eff. length',
    nom:'Nominal', od:'OD (in)', odmm:'OD (mm)', E:'E at gauge', L1:'L₁', L2:'L₂',
    allow:'Allowance', icls:'Int. class', D1max:'D₁ max', D2:'D₂', D:'D',
    d3max:'d₃ max', d3min:'d₃ min', D4min:'D₄ min', t:'t (thickness)', F:'Flat F',
    shear:'Shear area', stress:'Stress area', sharp:'Sharp V depth', un:'UN depth',
    unr:'UNR depth', rmin:'Root r min', rmax:'Root r max',
    d1min:'Minor min', d1max:'Minor max', ID1min:'Int. minor min', ID1max:'Int. minor max',
    ID2min:'Int. PD min', ID2max:'Int. PD max', IDmin:'Int. major min'
  };

  /* ---------- data engine ---------- */
  var selT=$('dx-table'), selC=$('dx-class'), inS=$('dx-search'),
      head=$('dx-head'), body=$('dx-body'), empty=$('dx-empty'),
      cnt=$('dx-count'), stdEl=$('dx-std'), chkEl=$('dx-check');
  var cur='mc', sortCol=-1, sortDir=1;

  if (selT) {
    var opts='';
    for (var i=0;i<ORDER.length;i++){
      var k=ORDER[i];
      if(!TD[k]) continue;
      opts+='<option value="'+k+'">'+META[k][0]+' — '+TD[k].r.length+' rows</option>';
    }
    selT.innerHTML=opts;
    selT.value='mc';
  }

  function classesFor(k){
    var t=TD[k]; if(!t) return [];
    var ci=t.c.indexOf('cls');
    if(ci<0) return [];
    var set={},out=[];
    for(var i=0;i<t.r.length;i++){ var v=t.r[i][ci]; if(v&&!set[v]){set[v]=1;out.push(v);} }
    return out.sort();
  }

  function render(){
    var t=TD[cur]; if(!t||!body) return;
    var q=(inS&&inS.value||'').trim().toLowerCase();
    var cf=(selC&&selC.value)||'';
    var ci=t.c.indexOf('cls');

    var rows=[];
    for(var i=0;i<t.r.length;i++){
      var r=t.r[i];
      if(q && String(r[0]).toLowerCase().indexOf(q)<0) continue;
      if(cf && ci>=0 && r[ci]!==cf) continue;
      rows.push(r);
    }
    if(sortCol>=0){
      rows.sort(function(a,b){
        var x=a[sortCol],y=b[sortCol];
        var nx=parseFloat(x),ny=parseFloat(y);
        if(!isNaN(nx)&&!isNaN(ny)) return (nx-ny)*sortDir;
        return String(x).localeCompare(String(y))*sortDir;
      });
    }

    var h='';
    for(var c=0;c<t.c.length;c++){
      var key=t.c[c];
      h+='<th scope="col" data-col="'+c+'"'+(sortCol===c?' data-dir="'+(sortDir>0?'asc':'desc')+'"':'')+'>'
        +esc(HEAD[key]||key)+'</th>';
    }
    head.innerHTML=h;

    var b=[],lim=Math.min(rows.length,900);
    for(var j=0;j<lim;j++){
      var tr='<tr>';
      for(var c2=0;c2<t.c.length;c2++) tr+='<td>'+esc(rows[j][c2]||'—')+'</td>';
      b.push(tr+'</tr>');
    }
    body.innerHTML=b.join('');
    if(empty) empty.hidden = rows.length>0;
    if(cnt) cnt.textContent = rows.length + ' / ' + t.r.length + ' rows'
      + (rows.length>lim ? ' · showing 900' : '');
    if(stdEl) stdEl.innerHTML='<b>STANDARD</b> '+esc(META[cur][1]);
    if(chkEl) chkEl.innerHTML='<b>TEST</b> '+esc(META[cur][2]);
  }

  if(head){
    head.addEventListener('click',function(e){
      var th=e.target.closest('th[data-col]'); if(!th) return;
      var c=parseInt(th.getAttribute('data-col'),10);
      if(sortCol===c) sortDir=-sortDir; else {sortCol=c;sortDir=1;}
      render();
    });
  }
  if(selT) selT.addEventListener('change',function(){
    cur=selT.value; sortCol=-1; sortDir=1;
    var cl=classesFor(cur);
    if(selC){
      selC.innerHTML='<option value="">All classes</option>'+
        cl.map(function(x){return '<option value="'+esc(x)+'">'+esc(x)+'</option>';}).join('');
      selC.disabled = cl.length===0;
    }
    render();
  });
  if(inS) inS.addEventListener('input',render);
  if(selC) selC.addEventListener('change',render);
  if(selT){ selT.dispatchEvent(new Event('change')); }

  /* ---------- audit table ---------- */
  var AUDIT=[
    ['Metric coarse — basic dimensions',33,33,'ISO 68-1 profile, computed'],
    ['Metric fine — basic dimensions',171,166,'ISO 68-1 profile closure'],
    ['Metric external limits 6g/6h/4g6g',689,451,'deviation + tolerance closure'],
    ['Metric internal limits 6H',230,148,'EI = 0 at pitch diameter'],
    ['Metric roll-thread PD reference',157,155,'deviation + tolerance closure'],
    ['UNC — ASME B1.1',80,80,'basic PD closure'],
    ['UNF — ASME B1.1',59,59,'basic PD closure'],
    ['UNEF — ASME B1.1',48,48,'basic PD closure'],
    ['UNS — ASME B1.1',113,108,'basic PD closure'],
    ['6UN / 8UN / 12UN uniform pitch',189,188,'basic PD closure'],
    ['16UN / 20UN / 28UN / 32UN',203,202,'basic PD closure'],
    ['UNJC / UNJF / UNJEF',82,81,'root radius band 0.15011P–0.18042P'],
    ['8UNJ / 12UNJ / 16UNJ',139,138,'root radius band + PD closure'],
    ['BSW — BS 84 coarse',40,39,'55° Whitworth h = 0.640327P'],
    ['BSF — BS 84 fine',31,31,'55° Whitworth h = 0.640327P'],
    ['BSPP — ISO 228 parallel',25,24,'55° form + TPI closure'],
    ['BSPT — ISO 7-1 taper',15,15,'55° form, taper 1:16'],
    ['NPT — ASME B1.20.1',44,24,'P = 1/n, h = 0.8P'],
    ['Trapezoidal Tr — ISO 2904',378,378,'D₂ = d − 0.5P, D₁ = d − P'],
    ['Acme general purpose — ASME B1.5',23,23,'h = P/2, F = 0.3707P'],
    ['Stub Acme — ASME B1.8',50,33,'h = 0.3P, F = 0.4224P'],
    ['Unified thread form constants',26,26,'exact pitch multiples']
  ];
  var au=$('dx-audit');
  if(au){
    au.innerHTML=AUDIT.map(function(r){
      var rej=r[1]-r[2];
      return '<tr><td>'+esc(r[0])+'</td><td>'+r[1]+'</td><td class="ok">'+r[2]+'</td>'
        +'<td class="'+(rej?'rej':'')+'">'+(rej||'0')+'</td><td style="text-align:left">'+esc(r[3])+'</td></tr>';
    }).join('');
  }

  /* ---------- three-wire calculator ---------- */
  function wire(){
    var P=parseFloat($('w-P').value), a=parseFloat($('w-a').value),
        d2=parseFloat($('w-d2').value), w=parseFloat($('w-w').value);
    if(!(P>0&&a>0)) return;
    var ha=a/2*Math.PI/180;
    var best=P/(2*Math.cos(ha));
    var use=(w>0)?w:best;
    var k1=1+1/Math.sin(ha);
    var M=(isFinite(d2)?d2:0)+use*k1-(P/2)/Math.tan(ha);
    $('w-best').textContent=fx(best,4)+' mm';
    $('w-used').textContent=fx(use,4)+' mm'+((w>0)?'':' (best)');
    $('w-M').textContent=isFinite(d2)?fx(M,4)+' mm':'—';
    $('w-k1').textContent=fx(k1,5);
    $('w-k2').textContent=fx(1/Math.tan(ha),5);
    $('w-rev').textContent=isFinite(M)?fx(M-use*k1+(P/2)/Math.tan(ha),4)+' mm':'—';
    var note=$('w-note');
    if(w>0 && Math.abs(w-best)/best>0.35){
      note.innerHTML='<span class="warn">Wire size is far from best-wire.</span> '
        +'Flank-angle error will bias the result. Best wire for this pitch is '
        +fx(best,4)+' mm.';
    } else {
      note.innerHTML='Wires must be hardened, of known diameter, and seated without spring. '
        +'Measure at 20 °C with a constant-force micrometer. This gives simple pitch diameter '
        +'only, not functional size.';
    }
  }
  ['w-P','w-a','w-d2','w-w'].forEach(function(id){
    var e=$(id); if(e) e.addEventListener('input',wire);
  });
  if($('w-P')) wire();

  /* ---------- tap drill calculator ---------- */
  function tap(){
    var d=parseFloat($('t-d').value), P=parseFloat($('t-P').value),
        e=parseFloat($('t-e').value), have=parseFloat($('t-have').value);
    if(!(d>0&&P>0&&e>0)) return;
    var H=Math.sqrt(3)/2*P;
    var D1=d-1.082532*P, d2=d-0.649519*P;
    var cut=d-(e/76.98)*P;
    var form=d-(e/100)*(1.082532*P)*0.5;
    $('t-cut').textContent=fx(cut,2)+' mm';
    $('t-form').textContent=fx(form,2)+' mm';
    $('t-D1').textContent=fx(D1,3)+' mm';
    $('t-d2').textContent=fx(d2,3)+' mm';
    if(have>0){
      var pct=(d-have)/(1.082532*P)*100;
      $('t-actual').textContent=fx(pct,1)+'%';
      var v='',cls='';
      if(pct>85){v='Too much — tap breakage risk';cls='warn';}
      else if(pct>=65){v='Within normal working band';}
      else if(pct>=50){v='Low — check stripping strength';}
      else {v='Too little — thread will strip';cls='warn';}
      $('t-verdict').innerHTML=cls?'<span class="warn">'+v+'</span>':v;
    } else {
      $('t-actual').textContent='—';
      $('t-verdict').textContent='—';
    }
  }
  ['t-d','t-P','t-e','t-have'].forEach(function(id){
    var el=$(id); if(el) el.addEventListener('input',tap);
  });
  if($('t-d')) tap();

  /* ---------- thread identifier ---------- */
  var IDX=null;
  function buildIndex(){
    if(IDX) return IDX;
    IDX=[];
    var FAM={ mc:'metric', mf:'metric', unc:'inch', unf:'inch', unef:'inch', uns:'inch',
      un6:'inch',un8:'inch',un12:'inch',un16:'inch',un20:'inch',un28:'inch',un32:'inch',
      unjc:'inch',unjf:'inch',unjef:'inch',unj8:'inch',unj12:'inch',unj16:'inch',
      bsw:'inch', bsf:'inch', bspp:'pipe', bspt:'pipe', npt:'pipe',
      tr:'power', acme:'power', stub:'power' };
    for(var k in FAM){
      var t=TD[k]; if(!t) continue;
      var ci={},c;
      for(c=0;c<t.c.length;c++) ci[t.c[c]]=c;
      for(var i=0;i<t.r.length;i++){
        var r=t.r[i], d=null, P=null;
        if(ci.d!==undefined) d=parseFloat(r[ci.d]);
        if(d===null||isNaN(d)){
          if(ci.dmax!==undefined) d=parseFloat(r[ci.dmax]);
          else if(ci.D!==undefined) d=parseFloat(r[ci.D])*25.4;
          else if(ci.odmm!==undefined) d=parseFloat(r[ci.odmm]);
        }
        if(ci.P!==undefined) P=parseFloat(r[ci.P]);
        if(P===null||isNaN(P)){
          if(ci.tpi!==undefined) P=25.4/parseFloat(r[ci.tpi]);
        }
        if(k==='acme'||k==='stub'){ P=P*25.4; }
        if(!isFinite(d)||!isFinite(P)||d<=0||P<=0) continue;
        var seen={};
        var key=k+'|'+r[0];
        if(seen[key]) continue;
        IDX.push({s:r[0], d:d, P:P, tab:k, fam:FAM[k], std:META[k][1], name:META[k][0]});
      }
    }
    return IDX;
  }

  function identify(){
    var d=parseFloat($('id-d').value), unit=$('id-unit').value,
        pv=parseFloat($('id-p').value), pm=$('id-pmode').value,
        tol=parseFloat($('id-tol').value), fam=$('id-fam').value;
    var box=$('id-results'), sum=$('id-summary');
    if(!(d>0)){ box.innerHTML=''; return; }
    if(unit==='in') d=d*25.4;
    var P=null;
    if(pm==='mm' && pv>0) P=pv;
    else if(pm==='tpi' && pv>0) P=25.4/pv;

    var idx=buildIndex(), out=[], uniq={};
    for(var i=0;i<idx.length;i++){
      var e=idx[i];
      if(fam && e.fam!==fam) continue;
      var ed=Math.abs(e.d-d);
      if(ed>tol) continue;
      var ep=(P===null)?0:Math.abs(e.P-P);
      if(P!==null && ep>Math.max(0.08,P*0.10)) continue;
      var score=ed/tol + (P===null?0:ep/Math.max(0.08,P*0.10));
      var key=e.s+'|'+e.tab;
      if(uniq[key]!==undefined){ if(out[uniq[key]].score<=score) continue; out[uniq[key]]=null; }
      uniq[key]=out.length;
      out.push({e:e,score:score,ed:ed,ep:ep});
    }
    out=out.filter(Boolean).sort(function(a,b){return a.score-b.score;}).slice(0,14);

    if(!out.length){
      box.innerHTML='<div class="tt-idrow m2"><b>No match</b><span>Try a wider search '
        +'tolerance, or check whether the pitch was entered in the right unit.</span><em>0</em></div>';
      sum.textContent='Nothing found within the search band.';
      return;
    }
    sum.textContent=out.length+' candidate'+(out.length>1?'s':'')+', closest first.';
    box.innerHTML=out.map(function(o,i){
      var e=o.e;
      return '<div class="tt-idrow '+(i===0?'m1':'m2')+'">'
        +'<b>'+esc(e.s)+'</b>'
        +'<span>'+esc(e.std)+' · ⌀'+fx(e.d,2)+' mm · P '+fx(e.P,3)+' mm</span>'
        +'<em>Δ⌀ '+fx(o.ed,2)+'</em></div>';
    }).join('');
  }
  ['id-d','id-unit','id-p','id-pmode','id-tol','id-fam'].forEach(function(id){
    var el=$(id); if(el){ el.addEventListener('input',identify); el.addEventListener('change',identify); }
  });
  if($('id-d')) identify();

  /* ---------- torque + engagement ---------- */
  var SIZES=[[3,.5],[4,.7],[5,.8],[6,1],[8,1.25],[10,1.5],[12,1.75],[14,2],[16,2],
             [18,2.5],[20,2.5],[22,2.5],[24,3],[27,3],[30,3.5],[33,3.5],[36,4],[39,4],
             [42,4.5],[48,5],[56,5.5],[64,6],
             [8,1],[10,1.25],[10,1],[12,1.5],[12,1.25],[16,1.5],[20,1.5],[24,2],[30,2],[36,3]];
  function fillSizes(el,def){
    if(!el) return;
    el.innerHTML=SIZES.map(function(s,i){
      return '<option value="'+i+'">M'+s[0]+'×'+s[1]+'</option>'; }).join('');
    el.value=String(def);
  }
  fillSizes($('q-size'),5);
  fillSizes($('e-size'),5);

  function geo(d,P){
    var H=Math.sqrt(3)/2*P, d2=d-0.649519*P, D1=d-1.082532*P, d3=D1-H/6;
    return {H:H,d2:d2,D1:D1,d3:d3,As:Math.PI/4*Math.pow((d2+d3)/2,2)};
  }
  var PROOF={'8.8':[580,600],'10.9':[830,830],'12.9':[970,970],'70':[450,450],'80':[600,600]};

  function torque(){
    var s=SIZES[parseInt($('q-size').value,10)]; if(!s) return;
    var d=s[0],P=s[1],g=geo(d,P);
    var cls=$('q-cls').value, pct=parseFloat($('q-pct').value)/100;
    var mu=parseFloat($('q-mu').value), mub=parseFloat($('q-mub').value);
    var dk=parseFloat($('q-dk').value);
    if(!(dk>0)) dk=(1.5*d+d*1.05)/2;   // hex head estimate: across-flats ~1.5d
    var sp=PROOF[cls][d<=16?0:1];
    var proof=sp*g.As;                 // N
    var F=proof*pct;
    var c1=0.16*P, c2=0.58*mu*g.d2, c3=mub*dk/2;
    var T=F*(c1+c2+c3)/1000;           // N·m
    var tot=c1+c2+c3;
    $('q-as').textContent=fx(g.As,1)+' mm²';
    $('q-proof').textContent=fx(proof/1000,1)+' kN';
    $('q-f').textContent=fx(F/1000,1)+' kN';
    $('q-t').textContent=fx(T,1)+' N·m';
    $('q-c1').textContent=fx(c1/tot*100,1)+'%';
    $('q-c2').textContent=fx(c2/tot*100,1)+'%';
    $('q-c3').textContent=fx(c3/tot*100,1)+'%';
    $('q-eff').textContent=fx(c1/tot*100,1)+'%';
    $('q-k').textContent=fx((T*1000)/(F*d),3);
    var n=$('q-note');
    if(mu<0.06||mub<0.06){
      n.innerHTML='<span class="warn">Friction below 0.06 is unusual outside a fully '
        +'lubricated laboratory joint.</span> Verify the coefficient on the actual '
        +'surface condition before using this torque.';
    } else {
      n.innerHTML='Friction coefficients are the dominant uncertainty. Dry uncoated steel is '
        +'typically 0.16–0.20; zinc plated 0.14–0.18; waxed or lubricated 0.10–0.14. Torque '
        +'control carries ±25–35% preload scatter however precisely this is calculated.';
    }
  }
  ['q-size','q-cls','q-pct','q-mu','q-mub','q-dk'].forEach(function(id){
    var el=$(id); if(el){ el.addEventListener('input',torque); el.addEventListener('change',torque); }
  });
  if($('q-size')) torque();

  function engage(){
    var s=SIZES[parseInt($('e-size').value,10)]; if(!s) return;
    var d=s[0],P=s[1],g=geo(d,P);
    var rm=parseFloat($('e-rm').value), mat=parseFloat($('e-mat').value),
        sf=parseFloat($('e-sf').value);
    if(!(rm>0&&mat>0&&sf>0)) return;
    var cap=rm*g.As;                                   // N
    var tau=0.6*mat;                                   // MPa
    // nut-thread shear area per mm of engagement
    var per=Math.PI*d*(1/P)*(P/2+(g.d2-g.D1)*Math.tan(30*Math.PI/180));
    var Le=cap*sf/(tau*per);
    $('e-as').textContent=fx(g.As,1)+' mm²';
    $('e-cap').textContent=fx(cap/1000,1)+' kN';
    $('e-shear').textContent=fx(per,2)+' mm²/mm';
    $('e-le').textContent=fx(Le,1)+' mm';
    $('e-xd').textContent=fx(Le/d,2)+' × d';
    $('e-depth').textContent=fx(Le+2*P+0.5*d,1)+' mm';
  }
  ['e-size','e-rm','e-mat','e-sf'].forEach(function(id){
    var el=$(id); if(el){ el.addEventListener('input',engage); el.addEventListener('change',engage); }
  });
  if($('e-size')) engage();

}());
