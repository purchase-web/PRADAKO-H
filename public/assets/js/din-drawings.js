/* ============================================================================
   PRADAKO MECHANICAL & ENGINEERING WORKS
   din-drawings.js  —  parametric inline-SVG elevation library
   ----------------------------------------------------------------------------
   No external images, no CDN, no icon fonts. Every drawing is generated from
   primitives and inherits colour from CSS custom properties, so it works in
   any accent theme and prints cleanly.

   Canvas: viewBox "0 0 260 130", axis of revolution at y = 65.
   Stroke classes (styled in css/din-standards.css):
       .b  outline / body        .t  thin construction line
       .c  centre line           .a  accent feature (drive, insert, point)
       .h  void / bore           .d  hidden or dashed detail
   ----------------------------------------------------------------------------
   Drawings are representative elevations for identification only.
   They are NOT to scale and carry no dimensional authority.
   ========================================================================== */

window.DIN_DRAWINGS = (function () {
  'use strict';

  var CY = 65;
  var f = function (n) { return Math.round(n * 10) / 10; };

  /* ---- primitives ------------------------------------------------------ */
  function r(x, y, w, h, c) {
    return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" class="' + (c || 'b') + '"/>';
  }
  function ln(x1, y1, x2, y2, c) {
    return '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '" class="' + (c || 't') + '"/>';
  }
  function ci(cx, cy, rad, c) {
    return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(rad) + '" class="' + (c || 'b') + '"/>';
  }
  function p(d, c) { return '<path d="' + d + '" class="' + (c || 'b') + '"/>'; }
  function cl(x1, x2, y) { return ln(x1, y || CY, x2, y || CY, 'c'); }

  /* threaded shank: body + crest/root lines + flank hatch */
  function th(x, y, w, h, pitch) {
    pitch = pitch || 7;
    var y1 = y + h * 0.2, y2 = y + h * 0.8, d = '', i;
    for (i = x + pitch * 0.6; i <= x + w - 0.5; i += pitch) {
      d += 'M' + f(i) + ' ' + f(y1) + 'L' + f(i - pitch * 0.55) + ' ' + f(y2);
    }
    return r(x, y, w, h) + p(d, 't') + ln(x, y1, x + w, y1) + ln(x, y2, x + w, y2);
  }

  /* hexagon head / nut in side elevation (across-flats view with chamfer) */
  function hex(x, w, h, cy) {
    cy = cy || CY;
    var y = cy - h / 2, ch = h * 0.15;
    return r(x, y, w, h) + ln(x, y + ch, x + w, y + ch) + ln(x, y + h - ch, x + w, y + h - ch);
  }

  /* square head / nut (no chamfer lines) */
  function sq(x, w, h, cy) { cy = cy || CY; return r(x, cy - h / 2, w, h); }

  /* internal thread bore shown as a void with crest ticks */
  function bore(x, w, h, cy) {
    cy = cy || CY;
    var y = cy - h / 2, s = '';
    s += r(x, y, w, h, 'h');
    s += ln(x, y, x + w, y, 'd') + ln(x, y + h, x + w, y + h, 'd');
    for (var i = x + 5; i < x + w - 2; i += 7) { s += ln(i, y, i, y + 2.5, 't') + ln(i, y + h, i, y + h - 2.5, 't'); }
    return s;
  }

  /* annulus front view (washers, rings) */
  function ring(cx, cy, ro, ri) { return ci(cx, cy, ro) + ci(cx, cy, ri, 'h'); }

  /* hexagon socket drive glyph */
  function socket(cx, cy, rad) {
    var d = '', i, a;
    for (i = 0; i < 6; i++) {
      a = Math.PI / 6 + i * Math.PI / 3;
      d += (i ? 'L' : 'M') + f(cx + rad * Math.cos(a)) + ' ' + f(cy + rad * Math.sin(a));
    }
    return p(d + 'Z', 'a');
  }

  /* -------------------------------------------------------------------- */
  var D = {};

  /* --- bolts & screws --------------------------------------------------- */
  D.hexBolt = hex(28, 34, 58) + r(62, 52, 90, 26) + th(152, 52, 80, 26) + cl(14, 246);
  D.hexScrew = hex(28, 34, 58) + th(62, 52, 170, 26) + cl(14, 246);
  D.hexFit = hex(28, 34, 58) + r(62, 50, 100, 30) + th(162, 52, 70, 26) + cl(14, 246);
  D.flangeBolt = hex(28, 30, 42) + p('M58 44L58 86L70 96L70 34Z') + r(70, 52, 84, 26) + th(154, 52, 78, 26) + cl(14, 246);
  D.carriageBolt = p('M28 44Q56 44 60 52L60 78Q56 86 28 86Z') + sq(60, 22, 44) + th(82, 52, 150, 26) + cl(14, 246);
  D.tBolt = sq(30, 20, 66) + r(50, 52, 22, 26) + th(72, 52, 160, 26) + cl(14, 246);
  D.squareHeadScrew = sq(28, 34, 52) + th(62, 52, 170, 26) + cl(14, 246);
  D.socketCap = r(38, 38, 36, 54) + socket(56, CY, 12) + th(74, 52, 158, 26) + cl(14, 246);
  D.socketLow = r(38, 46, 34, 38) + socket(55, CY, 9) + th(72, 52, 160, 26) + cl(14, 246);
  D.socketCsk = p('M28 38L74 52L74 78L28 92Z') + socket(46, CY, 11) + th(74, 52, 158, 26) + cl(14, 246);
  D.buttonHead = p('M30 47Q30 34 52 34Q74 34 74 47L74 83Q74 96 52 96Q30 96 30 83Z') + socket(50, CY, 10) + th(74, 54, 158, 22) + cl(14, 246);
  D.panScrew = p('M34 44Q34 36 46 36L64 36Q76 36 76 44L76 86Q76 94 64 94L46 94Q34 94 34 86Z') + r(34, 60, 14, 10, 'a') + th(76, 53, 156, 24) + cl(14, 246);
  D.cheeseScrew = r(36, 34, 40, 62) + r(36, 60, 12, 10, 'a') + th(76, 53, 156, 24) + cl(14, 246);
  D.cskScrew = p('M30 36L76 53L76 77L30 94Z') + r(30, 60, 12, 10, 'a') + th(76, 53, 156, 24) + cl(14, 246);
  D.raisedCsk = p('M30 36Q52 28 76 53L76 77Q52 102 30 94Z') + r(30, 60, 12, 10, 'a') + th(76, 53, 156, 24) + cl(14, 246);
  D.shoulderScrew = r(34, 38, 26, 54) + r(60, 46, 74, 38) + th(134, 53, 98, 24) + cl(14, 246);
  D.capstanScrew = r(36, 40, 30, 50) + ln(36, 52, 66, 52) + ln(36, 78, 66, 78) + th(66, 53, 166, 24) + cl(14, 246);

  /* --- set screws ------------------------------------------------------- */
  D.setScrew = th(50, 48, 150, 34) + socket(66, CY, 11) + p('M200 48L212 56L212 74L200 82Z') + cl(14, 246);
  D.setScrewSlot = th(50, 48, 162, 34) + r(50, 59, 12, 12, 'a') + p('M212 48L222 65L212 82Z') + cl(14, 246);
  D.thrustScrew = th(46, 48, 150, 34) + socket(62, CY, 11) + p('M196 48Q214 65 196 82Z') + cl(14, 246);

  /* --- studs & rods ----------------------------------------------------- */
  D.stud = th(26, 52, 66, 26) + r(92, 52, 76, 26) + th(168, 52, 66, 26) + cl(14, 246) +
    ln(92, 42, 92, 88, 'd') + ln(168, 42, 168, 88, 'd');
  D.rod = th(24, 52, 212, 26) + cl(14, 246);
  D.reducedShank = th(24, 52, 54, 26) + p('M78 52L96 58L164 58L182 52L182 78L164 72L96 72L78 78Z') + th(182, 52, 54, 26) + cl(14, 246);
  D.weldStud = r(30, 46, 16, 38) + th(46, 52, 150, 26) + p('M196 52L214 65L196 78Z', 'a') + cl(14, 246);

  /* --- nuts ------------------------------------------------------------- */
  D.hexNut = hex(88, 70, 58) + bore(88, 70, 22) + cl(14, 246);
  D.thinNut = hex(88, 70, 32) + bore(88, 70, 18) + cl(14, 246);
  D.highNut = hex(76, 96, 58) + bore(76, 96, 22) + cl(14, 246);
  D.couplingNut = hex(56, 140, 52) + bore(56, 140, 20) + cl(14, 246);
  D.squareNut = sq(92, 62, 58) + bore(92, 62, 22) + cl(14, 246);
  D.squareThinNut = sq(92, 62, 32) + bore(92, 62, 18) + cl(14, 246);
  D.castleNut = hex(72, 60, 58) + r(132, 40, 22, 50) + ln(132, 52, 154, 52) + ln(132, 78, 154, 78) +
    r(139, 40, 8, 12, 'h') + r(139, 78, 8, 12, 'h') + bore(72, 60, 22) + cl(14, 246);
  D.capNut = hex(74, 56, 58) + p('M130 36L146 36Q170 36 170 65Q170 94 146 94L130 94Z') + bore(74, 56, 22) + cl(14, 246);
  D.lockNut = hex(74, 62, 58) + r(136, 44, 16, 42, 'a') + bore(74, 62, 22) + cl(14, 246);
  D.flangeNut = hex(84, 56, 42) + p('M140 44L140 86L152 98L152 32Z') + bore(84, 68, 20) + cl(14, 246);
  D.weldNut = hex(84, 56, 40) + p('M140 48L150 53L140 58ZM140 62L150 68L140 74ZM140 78L150 83L140 88Z', 'a') + bore(84, 56, 18) + cl(14, 246);
  D.wingNut = r(110, 48, 30, 34) + p('M110 60Q78 20 62 44Q56 62 110 74Z') + p('M140 60Q172 20 188 44Q194 62 140 74Z') + bore(110, 30, 16) + cl(14, 246);
  D.knurledNut = r(94, 42, 62, 46) + bore(94, 62, 20) +
    p('M99 42L94 50M107 42L102 50M115 42L110 50M123 42L118 50M131 42L126 50M139 42L134 50M147 42L142 50M155 42L150 50M99 88L94 80M107 88L102 80M115 88L110 80M123 88L118 80M131 88L126 80M139 88L134 80M147 88L142 80M155 88L150 80', 't') + cl(14, 246);
  D.roundNut = r(92, 40, 66, 50) + r(104, 40, 8, 9, 'h') + r(138, 40, 8, 9, 'h') +
    r(104, 81, 8, 9, 'h') + r(138, 81, 8, 9, 'h') + bore(92, 66, 22) + cl(14, 246);
  D.pipeNut = hex(88, 70, 58) + bore(88, 70, 30) + cl(14, 246);
  D.palNut = p('M74 86Q130 40 186 86L186 96Q130 52 74 96Z') + cl(14, 246);

  /* --- washers & spring elements ---------------------------------------- */
  D.plainWasher = ring(96, CY, 42, 17) + r(178, 23, 12, 26) + r(178, 81, 12, 26) + cl(14, 246) + ln(184, 23, 184, 107, 'c');
  D.largeWasher = ring(96, CY, 48, 15) + r(180, 17, 10, 32) + r(180, 81, 10, 32) + cl(14, 246);
  D.squareWasher = sq(56, 82, 82) + ci(97, CY, 16, 'h') + r(178, 24, 12, 26) + r(178, 80, 12, 26) + cl(14, 246);
  D.springWasher = p('M96 23A42 42 0 1 1 89 106', 'n') + ci(96, CY, 25, 'h') +
    p('M92 106L104 100L104 108Z', 'a') + r(178, 24, 12, 24) + r(178, 82, 12, 24) + cl(14, 246);
  D.toothWasher = (function () {
    var d = '', i, a, ro = 42, ri = 33, cx = 96, cy = CY, n = 18;
    for (i = 0; i < n; i++) {
      a = i * 2 * Math.PI / n;
      var a2 = (i + 0.5) * 2 * Math.PI / n;
      d += (i ? 'L' : 'M') + f(cx + ro * Math.cos(a)) + ' ' + f(cy + ro * Math.sin(a));
      d += 'L' + f(cx + ri * Math.cos(a2)) + ' ' + f(cy + ri * Math.sin(a2));
    }
    return p(d + 'Z') + ci(cx, cy, 17, 'h') + r(178, 30, 10, 20) + r(178, 80, 10, 20) + cl(14, 246);
  }());
  D.tabWasher = ring(96, CY, 40, 16) + p('M84 25L108 25L108 8L84 8Z', 'a') + r(178, 26, 12, 24) + r(178, 80, 12, 24) + cl(14, 246);
  D.coneWasher = p('M60 88L124 44L136 44L136 52L72 96L60 96Z') + p('M200 88L136 44L124 44L124 52L188 96L200 96Z') + cl(14, 246, 70);
  D.discSpring = p('M40 92L118 40L142 40L142 50L64 102L40 102Z') + p('M220 92L142 40L118 40L118 50L196 102L220 102Z') + cl(14, 246, 71);
  D.sphericalWasher = p('M64 82Q130 20 196 82L196 96L64 96Z') + ci(130, 96, 18, 'h') +
    p('M52 96Q130 30 208 96', 'n') + cl(14, 246, 96);
  D.taperWasher = p('M60 46L200 46L200 84L60 68Z') + ci(128, 62, 15, 'h') + cl(14, 246);
  D.shimRing = ring(96, CY, 40, 20) + r(178, 40, 6, 10) + r(178, 56, 6, 10) + r(178, 72, 6, 10) + cl(14, 246);
  D.sealRing = ring(100, CY, 38, 24) + r(180, 40, 8, 12) + r(180, 78, 8, 12) + cl(14, 246);

  /* --- retaining rings -------------------------------------------------- */
  D.circlip = p('M120 24A41 41 0 1 0 120 106', 'n') + p('M120 24L120 40M120 106L120 90', 't') +
    ci(120, 30, 6) + ci(120, 100, 6) + ci(120, 30, 2.5, 'h') + ci(120, 100, 2.5, 'h') + cl(14, 246);
  D.eClip = p('M132 26A40 40 0 1 0 132 104L132 86A22 22 0 1 1 132 44Z') + cl(14, 246);
  D.wireRing = p('M124 26A40 40 0 1 0 118 104', 'n') + ci(124, 26, 4) + ci(118, 104, 4) + cl(14, 246);

  /* --- pins ------------------------------------------------------------- */
  D.pinParallel = p('M32 54L38 50L222 50L228 54L228 76L222 80L38 80L32 76Z') + cl(14, 246);
  D.pinTaper = p('M30 50L228 57L228 73L30 80Z') + cl(14, 246);
  D.pinTaperThread = p('M30 51L180 57L180 73L30 79Z') + th(180, 55, 50, 20) + cl(14, 246);
  D.pinGrooved = p('M32 52L40 48L220 48L228 52L228 78L220 82L40 82L32 78Z') +
    p('M70 48L74 82M120 48L124 82M170 48L174 82', 'a') + cl(14, 246);
  D.pinSpring = r(40, 48, 172, 34) + ln(40, 62, 212, 62, 'd') + ln(40, 68, 212, 68, 'd') +
    p('M40 48L40 82', 't') + ci(226, CY, 17) + ci(226, CY, 11, 'h') + p('M226 48L226 54', 'a') + cl(14, 246);
  D.pinCoiled = r(40, 48, 176, 34) + p('M52 48L44 82M68 48L60 82M84 48L76 82M100 48L92 82M116 48L108 82M132 48L124 82M148 48L140 82M164 48L156 82M180 48L172 82M196 48L188 82M212 48L204 82', 't') + cl(14, 246);
  D.splitPin = p('M62 46A20 20 0 0 0 62 84', 'n') + p('M62 46L198 46L212 53L198 60L62 60Z') + p('M62 70L198 70L216 77L198 84L62 84Z') + cl(14, 246);
  D.clevisPin = r(30, 36, 16, 58) + r(46, 50, 180, 30) + ci(206, CY, 5, 'h') + cl(14, 246);
  D.linchPin = p('M46 44L214 44L214 58L46 58Z') + p('M214 58A26 26 0 0 1 168 86', 'n') + ci(46, 51, 12, 'n') + cl(14, 246, 51);

  /* --- rivets ----------------------------------------------------------- */
  D.rivetRound = p('M36 40Q68 40 68 52L68 78Q68 90 36 90Z') + r(68, 52, 164, 26) + cl(14, 246);
  D.rivetCsk = p('M30 38L74 52L74 78L30 92Z') + r(74, 54, 158, 22) + cl(14, 246);
  D.rivetFlat = r(34, 42, 22, 46) + r(56, 52, 176, 26) + cl(14, 246);
  D.rivetTubular = r(34, 40, 18, 50) + r(52, 50, 180, 30) + ln(52, 58, 232, 58, 'd') + ln(52, 72, 232, 72, 'd') + cl(14, 246);
  D.rivetBlind = r(48, 40, 14, 50) + r(62, 50, 130, 30) + p('M192 50L206 50L206 80L192 80Z') +
    r(28, 60, 20, 10) + r(206, 61, 26, 8, 'a') + cl(14, 246);

  /* --- tapping, self-drilling & wood screws ----------------------------- */
  (function () {
    function gimlet(x, w, y0, h0, tip) {
      var steps = 15, d = '', top = '', bot = [], i, t, hh, xx;
      for (i = 0; i <= steps; i++) {
        t = i / steps;
        hh = tip ? h0 * (t < 0.62 ? 1 : 1 - ((t - 0.62) / 0.38) * 0.88) : h0 * (1 - t * 0.10);
        xx = x + t * w;
        top += (i ? 'L' : 'M') + f(xx) + ' ' + f(y0 - hh / 2);
        bot.unshift(f(xx) + ' ' + f(y0 + hh / 2));
        if (i < steps) { d += 'M' + f(xx) + ' ' + f(y0 - hh / 2) + 'L' + f(xx + w / steps * 0.55) + ' ' + f(y0 + hh / 2); }
      }
      return p(top + 'L' + bot.join('L') + 'Z') + p(d, 't');
    }
    D.woodScrew = p('M30 36L78 53L78 77L30 94Z') + r(30, 60, 12, 10, 'a') + gimlet(78, 154, CY, 30, true) + cl(14, 246);
    D.tappingScrew = p('M34 44Q34 36 46 36L64 36Q76 36 76 44L76 86Q76 94 64 94L46 94Q34 94 34 86Z') +
      r(34, 60, 14, 10, 'a') + gimlet(76, 156, CY, 26, true) + cl(14, 246);
    D.threadFormScrew = p('M30 36L78 53L78 77L30 94Z') + socket(48, CY, 10) + gimlet(78, 152, CY, 26, false) + cl(14, 246);
    D.selfDrill = hex(30, 30, 44) + p('M26 87L62 87L62 79L26 79Z') + gimlet(62, 130, CY, 26, false) +
      p('M192 52L214 58L222 65L214 72L192 78Z', 'a') + cl(14, 246);
  }());

  /* --- keys, collars & drive parts -------------------------------------- */
  D.keyParallel = p('M34 50L226 50L226 80L34 80Z') + ln(34, 58, 226, 58) + cl(14, 246);
  D.keyGibHead = p('M34 38L58 44L58 86L34 92Z') + r(58, 52, 168, 26) + cl(14, 246);
  D.keyWoodruff = p('M60 78A70 70 0 0 1 200 78Z') + ln(60, 70, 200, 70) + cl(14, 246, 78);
  D.collar = ring(112, CY, 44, 24) + r(104, 14, 16, 12) + r(190, 34, 16, 62) + ci(198, CY, 6, 'h') + cl(14, 246);
  D.hexKey = p('M40 34L58 34L58 74L214 74L214 92L40 92Z') + socket(49, 44, 7) + cl(14, 246, 83);
  D.hookSpanner = p('M40 58L150 58L150 74L40 74Z') + p('M150 66A34 34 0 1 0 196 98', 'n') + cl(14, 246, 66);

  /* --- lifting, rigging & handling --------------------------------------- */
  D.eyeBolt = ci(64, 44, 30) + ci(64, 44, 15, 'h') + r(44, 74, 40, 12) + th(84, 62, 148, 22) + cl(84, 246, 73);
  D.eyeNut = ci(120, 40, 28) + ci(120, 40, 14, 'h') + hex(96, 48, 26, 82) + bore(96, 48, 14, 82);
  D.turnbuckle = p('M78 46L182 46L182 84L78 84Z') + ci(130, CY, 12, 'h') + th(30, 56, 48, 18) + th(182, 56, 48, 18) +
    ci(24, CY, 12, 'n') + ci(236, CY, 12, 'n') + cl(14, 246);
  D.thimble = p('M130 20Q196 30 196 65Q196 100 130 110Q64 100 64 65Q64 30 130 20Z') +
    p('M130 34Q182 42 182 65Q182 88 130 96Q78 88 78 65Q78 42 130 34Z', 'h') + cl(14, 246);
  D.ropeClip = p('M74 40A44 44 0 0 1 186 40', 'n') + r(60, 40, 140, 22) + r(72, 62, 24, 34) + r(164, 62, 24, 34) +
    hex(72, 24, 14, 104) + hex(164, 24, 14, 104) + cl(14, 246, 51);
  D.chain = p('M22 65A24 24 0 0 1 46 41L86 41A24 24 0 0 1 86 89L46 89A24 24 0 0 1 22 65Z', 'n') +
    p('M92 65A24 24 0 0 1 116 41L156 41A24 24 0 0 1 156 89L116 89A24 24 0 0 1 92 65Z', 'n') +
    p('M162 65A24 24 0 0 1 186 41L226 41A24 24 0 0 1 226 89L186 89A24 24 0 0 1 162 65Z', 'n') + cl(14, 246);
  D.uBolt = p('M56 24L56 78A56 56 0 0 0 168 78L168 24', 'n') +
    p('M49 30L63 30M49 38L63 38M49 46L63 46M161 30L175 30M161 38L175 38M161 46L175 46', 't') + cl(112, 112);
  D.clevisFork = p('M40 44L120 44L120 56L70 56L70 74L120 74L120 86L40 86Z') + th(120, 54, 112, 22) +
    ci(56, 50, 5, 'h') + ci(56, 80, 5, 'h') + cl(14, 246);

  /* --- operating elements ------------------------------------------------ */
  D.knob = ci(88, CY, 40) + r(128, 54, 104, 22) + ln(128, 60, 232, 60, 't') + cl(14, 246);
  D.starKnob = (function () {
    var d = '', i, a, cx = 118, cy = CY, ro = 48, ri = 30, n = 6;
    for (i = 0; i < n * 2; i++) {
      a = i * Math.PI / n - Math.PI / 2;
      var rr = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ' ' + f(cy + rr * Math.sin(a));
    }
    return p(d + 'Z') + ci(cx, cy, 14, 'h') + th(166, 56, 66, 18) + cl(14, 246);
  }());
  D.handleTapered = p('M40 40Q52 30 60 40L60 90Q52 100 40 90Z') + p('M60 44L206 56L206 74L60 86Z') + th(206, 56, 26, 18) + cl(14, 246);
  D.ballHandle = ci(66, CY, 34) + p('M100 56L204 60L204 70L100 74Z') + th(204, 56, 28, 18) + cl(14, 246);

  /* --- plugs, nipples, inserts ------------------------------------------- */
  D.screwPlug = hex(30, 34, 58) + r(64, 50, 14, 30) + th(78, 52, 150, 26) + cl(14, 246);
  D.socketPlug = r(34, 40, 32, 50) + socket(50, CY, 11) + th(66, 52, 162, 26) + cl(14, 246);
  D.greaseNipple = ci(46, CY, 22) + ci(46, CY, 7, 'h') + hex(68, 40, 40) + th(108, 54, 124, 22) + cl(14, 246);
  D.threadInsert = (function () {
    var d = '', i;
    for (i = 0; i < 12; i++) { d += 'M' + f(40 + i * 15) + ' 42L' + f(28 + i * 15) + ' 88L' + f(40 + i * 15) + ' 88L' + f(52 + i * 15) + ' 42Z'; }
    return p(d) + cl(14, 246);
  }());
  D.hoseClamp = ci(130, 74, 44, 'n') + ci(130, 74, 33, 'n') + r(96, 8, 68, 28) + p('M104 14L104 28M114 14L114 28M124 14L124 28M134 14L134 28M144 14L144 28M154 14L154 28', 't') + cl(14, 246);
  D.sealingCap = p('M70 34L190 34L190 82Q130 108 70 82Z') + ln(70, 46, 190, 46) + cl(14, 246);

  /* --- assemblies & sector parts ----------------------------------------- */
  D.screwWasherAssembly = hex(28, 30, 44) + r(58, 32, 12, 66) + ring(64, CY, 33, 12) + th(76, 53, 156, 24) + cl(14, 246);
  D.railFastening = p('M40 74L128 74L128 52L176 52L176 74L226 74L226 92L40 92Z') + th(140, 18, 24, 34) + cl(14, 246, 92);
  D.wheelFastener = hex(30, 34, 56) + p('M64 40Q84 52 84 65Q84 78 64 90Z') + th(84, 52, 148, 26) + cl(14, 246);
  D.electricalWasher = ring(96, CY, 38, 15) + p('M134 46L206 46L206 84L134 84Z') + ci(180, CY, 9, 'h') + cl(14, 246);
  D.conveyorScrew = p('M34 40Q62 40 66 52L66 78Q62 90 34 90Z') + sq(66, 20, 40) + th(86, 53, 146, 24) + cl(14, 246);

  /* --- documents / non-product standards --------------------------------- */
  D.spec = r(56, 18, 148, 94) +
    p('M72 40L188 40M72 54L188 54M72 68L160 68M72 82L188 82M72 96L140 96', 't') +
    r(56, 18, 148, 14, 'a') + cl(14, 246, 118);
  D.testSpec = r(50, 22, 160, 86) + r(50, 22, 160, 13, 'a') +
    p('M66 50L120 50M66 64L120 64M66 78L104 78', 't') +
    p('M140 92L140 46L160 46L160 92M170 92L170 58L190 58L190 92', 'n') + cl(14, 246, 116);
  D.timberSpec = p('M40 92L130 34L220 92Z', 'n') + r(64, 92, 132, 18) + cl(14, 246, 116);

  D.generic = D.spec;

  /* ======================================================================
     Family resolver — first match wins, so order is deliberate:
     specific product words before generic ones.
     ==================================================================== */
  var RULES = [
    /* non-product / specification standards */
    [/timber structur|holzbau/i, 'timberSpec'],
    [/mechanical properties|tolerances for fasteners|general requirements|nominal lengths|widths across flats|torsional test|mechanical testing|locking coating/i, 'testSpec'],
    [/tapping screws thread$|thread - dimensions$/i, 'testSpec'],

    /* tools */
    [/hook spanner/i, 'hookSpanner'],
    [/hex key|screw key|allen/i, 'hexKey'],

    /* rigging, lifting, handling */
    [/thimble/i, 'thimble'],
    [/rope (clip|grip)/i, 'ropeClip'],
    [/chain/i, 'chain'],
    [/turnbuckle|spannschloss/i, 'turnbuckle'],
    [/eye nut|ring nut|lifting eye nut/i, 'eyeNut'],
    [/eye bolt|lifting eye|augenschraube/i, 'eyeBolt'],
    [/u-bolt|pipe strap|steel strap/i, 'uBolt'],
    [/fork head|clevis(es)?$|angle joint|ball joint/i, 'clevisFork'],

    /* operating elements */
    [/star (grip|knob)/i, 'starKnob'],
    [/ball (knob|handle)/i, 'ballHandle'],
    [/tapered handle|handle/i, 'handleTapered'],
    [/knob/i, 'knob'],

    /* plugs, nipples, inserts, clamps */
    [/grease nipple|lubrication nipple|schmiernippel/i, 'greaseNipple'],
    [/hose clamp|schlauchschelle/i, 'hoseClamp'],
    [/sealing cap|dished plug/i, 'sealingCap'],
    [/internal[- ]drive.*plug|internal drive/i, 'socketPlug'],
    [/plug/i, 'screwPlug'],
    [/thread(ed)? insert|wire thread insert|screw insert/i, 'threadInsert'],
    [/sealing ring/i, 'sealRing'],

    /* keys, collars */
    [/woodruff/i, 'keyWoodruff'],
    [/gib-head|gib head/i, 'keyGibHead'],
    [/parallel key|keyway|drive type fastening/i, 'keyParallel'],
    [/shaft collar|adjusting ring|stellring/i, 'collar'],

    /* pins */
    [/split pin|cotter|linch pin|klappstecker|federstecker/i, 'splitPin'],
    [/spiral|coiled spring pin/i, 'pinCoiled'],
    [/spring[- ]type straight pin|slotted spring pin|spannstift/i, 'pinSpring'],
    [/grooved (pin|nail)|kerbstift|kerbnagel/i, 'pinGrooved'],
    [/taper pin.*(thread|gewinde)|threaded taper pin/i, 'pinTaperThread'],
    [/taper pin|kegelstift/i, 'pinTaper'],
    [/clevis pin|pins? without head|bolzen/i, 'clevisPin'],
    [/parallel pin|dowel pin|zylinderstift/i, 'pinParallel'],

    /* retaining rings */
    [/retaining washer|e-clip|sicherungsscheibe/i, 'eClip'],
    [/round wire retaining|sprengring/i, 'wireRing'],
    [/retaining ring|circlip|sicherungsring/i, 'circlip'],

    /* rivets */
    [/blind rivet|break (pull |mandrel )/i, 'rivetBlind'],
    [/tubular rivet/i, 'rivetTubular'],
    [/flat head rivet|flachkopfniet/i, 'rivetFlat'],
    [/countersunk.*rivet|rivet.*countersunk|senkniet/i, 'rivetCsk'],
    [/rivet|niet/i, 'rivetRound'],

    /* tapping / self-drilling / wood */
    [/self-drilling|drilling screw|bohrschraube/i, 'selfDrill'],
    [/thread rolling|thread-forming|thread cutting|schneidschraube/i, 'threadFormScrew'],
    [/tapping screw|blechschraube/i, 'tappingScrew'],
    [/wood screw|coach screw|particle board|chipboard|holzschraube/i, 'woodScrew'],

    [/screw and washer assembl|schraube.*scheibe.*kombination/i, 'screwWasherAssembly'],

    /* washers & spring elements */
    [/disc spring|tellerfeder/i, 'discSpring'],
    [/conical spring washer|belleville|kegel-federscheibe/i, 'coneWasher'],
    [/spherical washer|conical seat|kugelscheibe/i, 'sphericalWasher'],
    [/taper washer|keilscheibe|keilförmig/i, 'taperWasher'],
    [/tab washer|locking washer|lock washer.*(tab|nase)|sicherungsblech/i, 'tabWasher'],
    [/serrated|toothed|zahnscheibe/i, 'toothWasher'],
    [/spring (lock )?washer|spring lock|federring|federscheibe/i, 'springWasher'],
    [/shim ring|supporting ring|passscheibe/i, 'shimRing'],
    [/square washer|timber construction.*square|form v/i, 'squareWasher'],
    [/large series|extra large series|timber construction|large od/i, 'largeWasher'],
    [/connecting washer|conductor/i, 'electricalWasher'],
    [/washer|scheibe/i, 'plainWasher'],

    /* nuts */
    [/wing nut|flügelmutter/i, 'wingNut'],
    [/knurled nut|rändelmutter/i, 'knurledNut'],
    [/(cap|domed) nut|hutmutter/i, 'capNut'],
    [/castle|slotted and castle|kronenmutter/i, 'castleNut'],
    [/weld nut|schweißmutter/i, 'weldNut'],
    [/flange nut|nuts? with flange|flange lock/i, 'flangeNut'],
    [/pal ?nut|counter nut/i, 'palNut'],
    [/prevailing torque|lock ?nut|klemmteil/i, 'lockNut'],
    [/square thin nut|vierkantmutter.*niedrig/i, 'squareThinNut'],
    [/square nut|t-slot nut|nuts for t-slots|nutenstein|vierkantmutter/i, 'squareNut'],
    [/round nut|two-hole|slotted round|bearing locknut|nutmutter|schlitzmutter/i, 'roundNut'],
    [/pipe nut|rohrmutter/i, 'pipeNut'],
    [/coupling nut|extension nut|verbindungsmutter/i, 'couplingNut'],
    [/thin nut|1,5 d|1.5d|low hexagon|niedrige form/i, 'thinNut'],
    [/high nut|1,5d high/i, 'highNut'],
    [/nut|mutter/i, 'hexNut'],

    /* set screws */
    [/hexagon socket set screw|hexalobular socket set screw|grub|gewindestift.*innensechs/i, 'setScrew'],
    [/thrust screw|druckschraube/i, 'thrustScrew'],
    [/slotted set screw|headless screw|gewindestift/i, 'setScrewSlot'],
    [/square head set screw|vierkantschraube/i, 'squareHeadScrew'],
    [/set screw/i, 'setScrew'],

    /* studs & rods */
    [/weld stud|studs for welding|anschweißende|projection weld/i, 'weldStud'],
    [/reduced shank|dehnschaft/i, 'reducedShank'],
    [/threaded rod/i, 'rod'],
    [/stud/i, 'stud'],

    /* sector-specific */
    [/wheel (fastener|bolt|nut)|radbefestigung|radschraube/i, 'wheelFastener'],
    [/rail|schiene|mining|track fastener/i, 'railFastening'],
    [/conveyor|elevator|bucket|belt/i, 'conveyorScrew'],

    /* bolts & screws */
    [/t-head|t-slot bolt|hammerschraube/i, 'tBolt'],
    [/square neck|mushroom head|cup head|nib bolt|carriage/i, 'carriageBolt'],
    [/shoulder/i, 'shoulderScrew'],
    [/capstan/i, 'capstanScrew'],
    [/button head|linsenkopf/i, 'buttonHead'],
    [/socket countersunk|countersunk.*socket/i, 'socketCsk'],
    [/low head|reduced head/i, 'socketLow'],
    [/socket head cap|hexalobular socket head|zylinderschraube.*innensechs/i, 'socketCap'],
    [/raised countersunk|linsensenk/i, 'raisedCsk'],
    [/countersunk|senkschraube|senkkopf/i, 'cskScrew'],
    [/cheese head|zylinderschraube/i, 'cheeseScrew'],
    [/pan head|flachkopf|hexalobular socket pan/i, 'panScrew'],
    [/fit(ted)? bolt|passschraube/i, 'hexFit'],
    [/flange bolt|bolts? with flange/i, 'flangeBolt'],
    [/masonry|foundation|anchor|steinschraube/i, 'stud'],
    [/hexagon head|hexagon bolt|sechskantschraube|hex/i, 'hexBolt'],
    [/bolt|screw|schraube/i, 'hexScrew']
  ];

  function resolve(text) {
    for (var i = 0; i < RULES.length; i++) { if (RULES[i][0].test(text)) { return RULES[i][1]; } }
    return 'generic';
  }

  function svg(key, extraClass) {
    var body = D[key] || D.generic;
    return '<svg class="dv ' + (extraClass || '') + '" viewBox="0 0 260 130" role="img" aria-hidden="true" ' +
      'preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  }

  return { shapes: D, resolve: resolve, svg: svg };
}());
