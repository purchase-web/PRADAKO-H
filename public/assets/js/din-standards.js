/* ============================================================================
   PRADAKO MECHANICAL & ENGINEERING WORKS
   din-standards.js  —  DIN Standards Library engine
   ----------------------------------------------------------------------------
   Requires (in this order):  js/din-data.js  →  js/din-drawings.js  →  this file
   ----------------------------------------------------------------------------
   Responsibilities
     · parse the TSV, merge form variants and duplicate rows into one record
     · derive status, lineage, replacement chain, product group, drawing key
     · search (AND semantics), filter, sort, paginate, deep-link
     · detail drawer, enquiry list (localStorage), mailto / clipboard handoff
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 0. CONFIGURATION — check these three before go-live
   * ------------------------------------------------------------------ */
  var CONFIG = {
    enquiryEmail: 'sales@pradakomechanicals.com', // ← confirm the live inbox
    cartKey: 'pradako_enquiry_cart',              // ← must match the site-wide cart key
    refPrefix: 'RFQ',                             // house reference prefix
    pageSize: 36
  };

  /* ------------------------------------------------------------------ *
   * 1. SMALL HELPERS
   * ------------------------------------------------------------------ */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var EM = '—';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function blank(v) { return !v || v === EM || v === '-' || !String(v).trim(); }
  function uniq(a) { var o = [], s = {}; a.forEach(function (v) { if (v && !s[v]) { s[v] = 1; o.push(v); } }); return o; }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  /* ------------------------------------------------------------------ *
   * 2. PARSE + ENRICH
   * ------------------------------------------------------------------ */
  var DESIG_RE = /^(DIN(?:\s+EN)?(?:\s+ISO)?)\s+(\d+)(?:-([0-9A-Za-z]+(?:[-\/][0-9A-Za-z]+)*))?\s*(.*)$/;

  var STATUS_META = {
    current:    { label: 'Current',      long: 'Current', rank: 0 },
    superseded: { label: 'Superseded',   long: 'Superseded — replacement listed', rank: 1 },
    withdrawn:  { label: 'Withdrawn',    long: 'Withdrawn / legacy', rank: 2 },
    unverified: { label: 'Edition to confirm', long: 'In library — edition not yet verified against a controlled copy', rank: 3 }
  };

  var GROUP_RULES = [
    [/timber structur|holzbau/i, 'Non-product standards'],
    [/disc spring|tellerfeder|conical spring washer|belleville/i, 'Washers & spring elements'],
    [/mechanical properties|tolerances|general requirements|nominal lengths|widths across flats|torsional test|mechanical testing|locking coating/i, 'Property & tolerance standards'],
    [/thimble|rope|chain|turnbuckle|eye bolt|eye nut|lifting|spannschloss|u-bolt|pipe strap|fork head|clevises|ball joint|angle joint/i, 'Lifting, rigging & linkage'],
    [/handle|knob|grip|griff/i, 'Operating elements'],
    [/\bkeys?\b|keyway|woodruff|shaft collar|adjusting ring|stellring|spanner|hex key|allen|assembly tools/i, 'Keys, collars & tools'],
    [/retaining ring|circlip|e-clip|sicherungsring|retaining washer|sprengring/i, 'Retaining rings'],
    [/rivet|niet/i, 'Rivets'],
    [/\bnuts?\b|mutter/i, 'Nuts'],
    [/self-drilling|drilling screw|tapping|thread cutting|thread rolling|thread-forming|chipboard|particle board|wood screw|coach screw/i, 'Tapping, self-drilling & wood screws'],
    [/seating screw|bucket|conveyor|elevator/i, 'Sector-specific fasteners'],
    [/washer|scheibe|disc spring|federring|shim ring|sealing ring|assemblies/i, 'Washers & spring elements'],
    [/set screw|grub|thrust screw|gewindestift/i, 'Set screws'],
    [/\bstuds?\b|threaded rod|anchor|foundation|masonry|steinschraube/i, 'Studs, rods & anchors'],
    [/\bpins?\b|cotter|dowel|stift|bolzen|linch/i, 'Pins & cotters'],
    [/nipple|hose clamp|plug|thread(ed)? insert|wire thread insert|screw insert/i, 'Plugs, nipples & inserts'],
    [/rail|mining|automotive|wheel|agricultur|conveyor|elevator|marine|electrical|process equipment|railway/i, 'Sector-specific fasteners'],
    [/bolt|screw|schraube/i, 'Bolts & screws']
  ];


  function groupOf(text) {
    for (var i = 0; i < GROUP_RULES.length; i++) { if (GROUP_RULES[i][0].test(text)) { return GROUP_RULES[i][1]; } }
    return 'Other fastening components';
  }

  function statusOf(note, edition, titleEn) {
    var n = (note || '') + ' ' + (titleEn || '');
    if (/withdrawn/i.test(n)) { return 'withdrawn'; }
    if (/not intended for new designs/i.test(n)) { return 'withdrawn'; }
    if (/legacy DIN entry|replacement/i.test(note || '') || /replacement/i.test(edition || '')) { return 'superseded'; }
    if (/^current/i.test((note || '').trim())) { return 'current'; }
    if (/merged from second uploaded/i.test(note || '')) {
      return /(19|20)\d\d/.test(edition || '') && parseInt((String(edition).match(/(19|20)\d\d/) || ['0'])[0], 10) >= 2000
        ? 'current' : 'unverified';
    }
    return 'unverified';
  }

  function cleanForm(f) {
    if (!f) { return ''; }
    f = String(f).replace(/^form\s+/i, '').trim();
    if (/^series$/i.test(f) || /^variant$/i.test(f)) { return ''; }
    if (/^\d+([A-Z]+)$/.test(f)) { return f.replace(/^\d+/, ''); }   // "980V" → "V"
    return f;
  }

  function splitDesignation(raw) {
    var equivalents = [], primary = String(raw).trim();
    if (primary.indexOf(' + ') > -1) {
      var plus = primary.split(' + ');
      primary = plus.shift().trim();
      equivalents = equivalents.concat(plus.map(function (s) { return s.trim(); }));
    }
    if (primary.indexOf(' / ') > -1) {
      var slash = primary.split(' / ');
      primary = slash.shift().trim();
      equivalents = equivalents.concat(slash.map(function (s) { return s.trim(); }));
    }
    // equivalents may themselves carry a slash list
    equivalents = equivalents.reduce(function (acc, e) { return acc.concat(e.split(' / ')); }, [])
      .map(function (s) { return s.trim(); }).filter(Boolean);
    return { primary: primary, equivalents: equivalents };
  }

  function parseRows(tsv) {
    var lines = String(tsv).split('\n'), out = [], i, c;
    for (i = 1; i < lines.length; i++) {
      if (!lines[i] || !lines[i].trim()) { continue; }
      c = lines[i].split('\t');
      out.push({
        raw: (c[0] || '').trim(),
        edition: (c[1] || '').trim(),
        note: (c[2] || '').trim(),
        titleEn: (c[3] || '').trim(),
        titleDe: (c[4] || '').trim(),
        family: (c[5] || '').trim(),
        provenance: (c[6] || '').trim()
      });
    }
    return out;
  }

  function build() {
    var rows = parseRows(window.DIN_TSV), map = {}, order = [];

    rows.forEach(function (row) {
      var sp = splitDesignation(row.raw);
      var m = DESIG_RE.exec(sp.primary);
      var prefix, number, part = '', forms = [];

      if (m) {
        prefix = m[1].replace(/\s+/g, ' ');
        number = m[2];
        var seg = m[3] || '';
        if (seg) {
          if (/^\d+$/.test(seg)) { part = seg; }
          else { forms = forms.concat(seg.split(/[\/]/).map(cleanForm)); }
        }
        if (m[4]) { forms = forms.concat(cleanForm(m[4])); }
      } else {
        prefix = 'DIN'; number = sp.primary.replace(/\D+/g, '') || '0';
      }

      var key = prefix + ' ' + number + (part ? '-' + part : '');
      var rec = map[key];
      if (!rec) {
        rec = map[key] = {
          id: key.toLowerCase().replace(/\s+/g, '-'),
          designation: key,
          prefix: prefix,
          number: parseInt(number, 10),
          part: part,
          series: prefix + ' ' + number,
          forms: [], editions: [], statuses: [], equivalents: [],
          provenance: [], families: [], notes: [],
          titleEn: '', titleDe: ''
        };
        order.push(rec);
      }

      rec.forms = rec.forms.concat(forms.filter(Boolean));
      if (!blank(row.edition)) { rec.editions.push(row.edition); }
      if (!blank(row.note)) { rec.notes.push(row.note); }
      if (!blank(row.provenance)) { rec.provenance.push(row.provenance); }
      if (!blank(row.family)) { rec.families.push(row.family); }
      rec.equivalents = rec.equivalents.concat(sp.equivalents);
      rec.statuses.push(statusOf(row.note, row.edition, row.titleEn));

      if (!blank(row.titleEn) && row.titleEn.length > rec.titleEn.length) { rec.titleEn = row.titleEn; }
      if (!blank(row.titleDe) && row.titleDe.length > rec.titleDe.length) { rec.titleDe = row.titleDe; }
    });

    order.forEach(function (rec) {
      rec.forms = uniq(rec.forms).sort();
      rec.editions = uniq(rec.editions);
      rec.equivalents = uniq(rec.equivalents);
      rec.provenance = uniq(rec.provenance);
      rec.notes = uniq(rec.notes);
      rec.family = uniq(rec.families)[0] || EM;
      rec.familiesAll = uniq(rec.families);

      /* aggregate status: the most favourable state present */
      rec.status = rec.statuses.sort(function (a, b) { return STATUS_META[a].rank - STATUS_META[b].rank; })[0] || 'unverified';
      rec.statusLabel = STATUS_META[rec.status].label;
      rec.statusLong = STATUS_META[rec.status].long;

      /* replacement chain */
      var joined = rec.editions.join(' ; ');
      var rep = /replacements?\s+(.+)$/i.exec(joined);
      rec.replacedBy = rep ? rep[1].split(/\s+and\s+|\s*;\s*|\s*,\s*/).map(function (s) { return s.trim(); }).filter(Boolean) : [];
      var leg = /legacy\s+(DIN[^;]+?)(?:;|$)/i.exec(joined);
      rec.legacyEdition = leg ? leg[1].trim() : '';

      /* latest edition year */
      var years = joined.match(/(19|20)\d\d/g) || [];
      rec.year = years.length ? Math.max.apply(null, years.map(Number)) : 0;

      var blob = [rec.designation, rec.titleEn, rec.titleDe, rec.family, rec.familiesAll.join(' ')].join(' ');
      rec.group = groupOf(blob);
      rec.drawing = window.DIN_DRAWINGS.resolve(blob);

      rec.search = (
        rec.designation + ' ' + rec.designation.replace(/\s+/g, '') + ' ' +
        rec.forms.join(' ') + ' ' + rec.titleEn + ' ' + rec.titleDe + ' ' +
        rec.familiesAll.join(' ') + ' ' + rec.equivalents.join(' ') + ' ' +
        rec.equivalents.join('').replace(/\s+/g, '') + ' ' + rec.editions.join(' ') + ' ' +
        rec.group + ' ' + rec.statusLabel
      ).toLowerCase();

      delete rec.families;
      delete rec.statuses;
    });

    return order;
  }

  var DATA = build();

  /* ------------------------------------------------------------------ *
   * 3. STATE
   * ------------------------------------------------------------------ */
  var state = { q: '', status: 'all', lineage: 'all', group: 'all', sort: 'number', view: 'cards', shown: CONFIG.pageSize };
  var view = [];
  var cart = loadCart();

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CONFIG.cartKey) || '[]'); }
    catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(CONFIG.cartKey, JSON.stringify(cart)); } catch (e) { /* storage disabled */ }
  }
  function inCart(id) { return cart.some(function (i) { return i.id === id; }); }

  /* ------------------------------------------------------------------ *
   * 4. FILTER + SORT
   * ------------------------------------------------------------------ */
  function matches(rec, s, skip) {
    if (s.status !== 'all' && skip !== 'status' && rec.status !== s.status) { return false; }
    if (s.lineage !== 'all' && skip !== 'lineage' && rec.prefix !== s.lineage) { return false; }
    if (s.group !== 'all' && skip !== 'group' && rec.group !== s.group) { return false; }
    if (s.tokens.length) {
      for (var i = 0; i < s.tokens.length; i++) {
        if (rec.search.indexOf(s.tokens[i]) === -1) { return false; }
      }
    }
    return true;
  }

  function compute() {
    state.tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    view = DATA.filter(function (r) { return matches(r, state); });
    var s = state.sort;
    view.sort(function (a, b) {
      if (s === 'number-desc') { return b.number - a.number || a.designation.localeCompare(b.designation); }
      if (s === 'year') { return (b.year - a.year) || (a.number - b.number); }
      if (s === 'status') { return STATUS_META[a.status].rank - STATUS_META[b.status].rank || a.number - b.number; }
      if (s === 'group') { return a.group.localeCompare(b.group) || a.number - b.number; }
      return (a.prefix.length - b.prefix.length) || (a.number - b.number) ||
        (parseInt(a.part || 0, 10) - parseInt(b.part || 0, 10));
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. RENDER
   * ------------------------------------------------------------------ */
  var elGrid, elTable, elCount, elMore, elEmpty, elChips;

  function pill(rec) {
    return '<span class="px-pill px-pill--' + rec.status + '">' + rec.statusLabel + '</span>';
  }

  function formsHtml(rec) {
    if (!rec.forms.length) { return '<span>' + EM + '</span>'; }
    return '<span class="px-forms">' + rec.forms.map(function (f) {
      return '<span class="px-form">' + esc(f) + '</span>';
    }).join('') + '</span>';
  }

  function cardHtml(rec) {
    var edition = rec.editions.length ? rec.editions[0] : 'Edition not stated';
    return '' +
      '<article class="px-card' + (inCart(rec.id) ? ' is-incart' : '') + '" data-id="' + rec.id + '">' +
        '<div class="px-plate">' + window.DIN_DRAWINGS.svg(rec.drawing) +
          '<span class="px-plate-stamp">' + esc(rec.group) + '</span>' +
          '<span class="px-plate-scale">Not to scale</span>' +
        '</div>' +
        '<div class="px-card-body">' +
          '<div class="px-card-top"><h3 class="px-desig">' + esc(rec.designation) + '</h3>' + pill(rec) + '</div>' +
          '<p class="px-title-en">' + esc(rec.titleEn || 'Title not stated in source data') + '</p>' +
          (rec.titleDe ? '<p class="px-title-de">' + esc(rec.titleDe) + '</p>' : '') +
          '<dl class="px-metalist">' +
            '<dt>Edition</dt><dd>' + esc(edition) + '</dd>' +
            (rec.forms.length ? '<dt>Forms</dt><dd>' + formsHtml(rec) + '</dd>' : '') +
            (rec.equivalents.length ? '<dt>Also cited</dt><dd>' + esc(rec.equivalents.join(', ')) + '</dd>' : '') +
            '<dt>Family</dt><dd>' + esc(rec.family) + '</dd>' +
          '</dl>' +
        '</div>' +
        '<div class="px-card-actions">' +
          '<button class="px-btn px-btn--primary" data-act="detail">Open record</button>' +
          '<button class="px-btn' + (inCart(rec.id) ? ' is-on' : '') + '" data-act="cart">' +
            (inCart(rec.id) ? 'In enquiry' : 'Add to enquiry') + '</button>' +
        '</div>' +
      '</article>';
  }

  function rowHtml(rec) {
    return '' +
      '<tr data-id="' + rec.id + '">' +
        '<td class="px-tdrawing">' + window.DIN_DRAWINGS.svg(rec.drawing) + '</td>' +
        '<td class="px-tdesig"><button class="px-linkbtn" data-act="detail">' + esc(rec.designation) + '</button>' +
          (rec.forms.length ? '<div class="px-forms" style="margin-top:6px">' + rec.forms.map(function (f) {
            return '<span class="px-form">' + esc(f) + '</span>'; }).join('') + '</div>' : '') +
        '</td>' +
        '<td>' + esc(rec.titleEn || EM) + (rec.titleDe ? '<div style="color:var(--px-ink-3);font-style:italic;font-size:12px;margin-top:4px">' + esc(rec.titleDe) + '</div>' : '') + '</td>' +
        '<td>' + esc(rec.editions[0] || EM) + '</td>' +
        '<td>' + pill(rec) + '</td>' +
        '<td>' + esc(rec.group) + '</td>' +
        '<td><button class="px-btn' + (inCart(rec.id) ? ' is-on' : '') + '" data-act="cart">' +
          (inCart(rec.id) ? 'Added' : 'Add') + '</button></td>' +
      '</tr>';
  }

  function renderChips() {
    var groups = {}, s;
    DATA.forEach(function (r) {
      s = matches(r, state, 'group');
      if (s) { groups[r.group] = (groups[r.group] || 0) + 1; }
    });
    var names = Object.keys(groups).sort(function (a, b) { return groups[b] - groups[a]; });
    var html = '<button class="px-chip" data-group="all" aria-pressed="' + (state.group === 'all') + '">All families ' +
      '<span class="px-chip-n">' + DATA.filter(function (r) { return matches(r, state, 'group'); }).length + '</span></button>';
    names.forEach(function (n) {
      html += '<button class="px-chip" data-group="' + esc(n) + '" aria-pressed="' + (state.group === n) + '">' +
        esc(n) + ' <span class="px-chip-n">' + groups[n] + '</span></button>';
    });
    if (state.group !== 'all' || state.q || state.status !== 'all' || state.lineage !== 'all') {
      html += '<button class="px-chip px-chip--reset" data-reset="1">Clear all filters</button>';
    }
    elChips.innerHTML = html;
  }

  function render(reset) {
    if (reset) { state.shown = CONFIG.pageSize; }
    compute();
    renderChips();

    var slice = view.slice(0, state.shown);
    elCount.innerHTML = '<b>' + view.length + '</b> of ' + DATA.length + ' records' +
      (state.q ? ' matching “' + esc(state.q) + '”' : '');

    elEmpty.hidden = view.length > 0;
    elGrid.hidden = state.view !== 'cards' || !view.length;
    elTable.hidden = state.view !== 'table' || !view.length;

    if (state.view === 'cards') {
      elGrid.innerHTML = slice.map(cardHtml).join('');
    } else {
      $('tbody', elTable).innerHTML = slice.map(rowHtml).join('');
    }

    elMore.hidden = state.shown >= view.length;
    $('#px-more-btn').textContent = 'Show ' + Math.min(CONFIG.pageSize, view.length - state.shown) +
      ' more (' + (view.length - state.shown) + ' remaining)';

    writeHash();
    renderFab();
  }

  /* ------------------------------------------------------------------ *
   * 6. DETAIL DRAWER
   * ------------------------------------------------------------------ */
  function byId(id) { for (var i = 0; i < DATA.length; i++) { if (DATA[i].id === id) { return DATA[i]; } } return null; }

  function related(rec) {
    return DATA.filter(function (r) {
      return r.id !== rec.id && (r.series === rec.series || r.group === rec.group);
    }).sort(function (a, b) {
      var as = a.series === rec.series ? 0 : 1, bs = b.series === rec.series ? 0 : 1;
      return as - bs || Math.abs(a.number - rec.number) - Math.abs(b.number - rec.number);
    }).slice(0, 8);
  }

  function openDetail(id) {
    var rec = byId(id); if (!rec) { return; }
    var body = $('#px-detail-body');

    var chain = '';
    if (rec.replacedBy.length || rec.legacyEdition) {
      chain = '<div class="px-chain"><h4>Replacement chain</h4><div class="px-chain-row">' +
        '<span>' + esc(rec.legacyEdition || rec.designation) + '</span>' +
        (rec.replacedBy.length ? '<span class="px-chain-arrow">→</span><span class="px-chain-to">' +
          rec.replacedBy.map(esc).join('</span><span class="px-chain-arrow">·</span><span class="px-chain-to">') + '</span>' : '') +
        '</div><p style="font-size:12.5px;color:var(--px-ink-3);margin:10px 0 0">' +
        (rec.replacedBy.length
          ? 'Quote the replacement on new drawings. The legacy number stays valid for spares and repeat orders against existing prints.'
          : 'No replacement recorded in the source data.') +
        '</p></div>';
    }

    var rel = related(rec);

    body.innerHTML =
      '<div class="px-detail-plate">' + window.DIN_DRAWINGS.svg(rec.drawing) +
        '<span class="px-plate-stamp">Representative elevation</span>' +
        '<span class="px-plate-scale">Not to scale</span></div>' +
      '<h3 class="px-detail-title">' + esc(rec.designation) + '</h3>' +
      '<div style="margin-bottom:14px">' + pill(rec) + '</div>' +
      '<p class="px-detail-sub">' + esc(rec.titleEn || 'Title not stated in source data') + '</p>' +
      (rec.titleDe ? '<p class="px-detail-de">' + esc(rec.titleDe) + '</p>' : '') +
      '<dl class="px-dl">' +
        '<dt>Status</dt><dd>' + esc(rec.statusLong) + '</dd>' +
        '<dt>Edition(s)</dt><dd>' + (rec.editions.length ? rec.editions.map(esc).join('<br>') : 'Not stated in source data') + '</dd>' +
        (rec.forms.length ? '<dt>Forms</dt><dd>' + formsHtml(rec) + '</dd>' : '') +
        (rec.part ? '<dt>Part</dt><dd>Part ' + esc(rec.part) + ' of ' + esc(rec.series) + '</dd>' : '') +
        '<dt>Product family</dt><dd>' + esc(rec.familiesAll.join(' · ') || EM) + '</dd>' +
        '<dt>Category</dt><dd>' + esc(rec.group) + '</dd>' +
        (rec.equivalents.length ? '<dt>Also cited as</dt><dd>' + esc(rec.equivalents.join(', ')) + '</dd>' : '') +
        '<dt>Lineage</dt><dd>' + esc(rec.prefix) + ' — ' + esc(lineageNote(rec.prefix)) + '</dd>' +
        (rec.notes.length ? '<dt>Source note</dt><dd>' + esc(rec.notes.join(' · ')) + '</dd>' : '') +
      '</dl>' +
      chain +
      (rel.length ? '<h4 style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--px-ink-3);margin:0 0 12px">Related records</h4>' +
        '<div class="px-related">' + rel.map(function (r) {
          return '<button data-goto="' + r.id + '">' + esc(r.designation) + '</button>';
        }).join('') + '</div>' : '');

    $('#px-detail-add').textContent = inCart(rec.id) ? 'Remove from enquiry' : 'Add to enquiry';
    $('#px-detail-add').dataset.id = rec.id;
    $('#px-detail-copy').dataset.id = rec.id;

    openDrawer('#px-detail');
    location.hash = hashString({ std: rec.id });
  }

  function lineageNote(prefix) {
    if (prefix === 'DIN EN ISO') { return 'ISO standard adopted through CEN and published in Germany'; }
    if (prefix === 'DIN EN') { return 'European standard adopted as a German national standard'; }
    if (prefix === 'DIN ISO') { return 'ISO standard adopted directly by DIN'; }
    return 'German national standard';
  }

  /* ------------------------------------------------------------------ *
   * 7. ENQUIRY LIST
   * ------------------------------------------------------------------ */
  function reference() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    if (!reference.v) {
      reference.v = CONFIG.refPrefix + '-DIN-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' +
        String(Math.floor(Math.random() * 9000) + 1000);
    }
    return reference.v;
  }

  function toggleCart(id) {
    var rec = byId(id); if (!rec) { return; }
    if (inCart(id)) {
      cart = cart.filter(function (i) { return i.id !== id; });
      toast(rec.designation + ' removed from enquiry');
    } else {
      cart.push({ id: id, designation: rec.designation, title: rec.titleEn, drawing: rec.drawing, added: Date.now() });
      toast(rec.designation + ' added to enquiry');
    }
    saveCart();
    render();
    if ($('#px-cart').classList.contains('is-open')) { renderCart(); }
    if ($('#px-detail').classList.contains('is-open') && $('#px-detail-add').dataset.id === id) {
      $('#px-detail-add').textContent = inCart(id) ? 'Remove from enquiry' : 'Add to enquiry';
    }
  }

  function renderCart() {
    var b = $('#px-cart-body');
    if (!cart.length) {
      b.innerHTML = '<div class="px-empty"><h3>No standards selected yet</h3>' +
        '<p>Add records from the library and they will be listed here, ready to send to our engineering desk.</p>' +
        '<button class="px-btn px-btn--primary" data-close-drawer>Browse the library</button></div>';
      $('#px-cart-foot').hidden = true;
      return;
    }
    $('#px-cart-foot').hidden = false;
    b.innerHTML =
      '<p class="px-cart-ref">Reference ' + reference() + ' · ' + cart.length + ' standard' + (cart.length > 1 ? 's' : '') + '</p>' +
      '<ul class="px-cartlist">' + cart.map(function (i) {
        return '<li>' + window.DIN_DRAWINGS.svg(i.drawing) +
          '<div><b>' + esc(i.designation) + '</b><span>' + esc(i.title || '') + '</span></div>' +
          '<button class="px-cart-remove" data-remove="' + i.id + '" aria-label="Remove ' + esc(i.designation) + '">×</button></li>';
      }).join('') + '</ul>' +
      '<label style="display:block;margin-top:20px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--px-ink-3);font-weight:600">Sizes, quantities, material and finish</label>' +
      '<textarea id="px-cart-note" rows="4" placeholder="e.g. DIN 933 M10 × 40, class 8.8, hot dip galvanised — 25,000 pcs, annual" ' +
      'style="width:100%;margin-top:8px;padding:12px;border:1px solid var(--px-rule-strong);font:14px/1.5 var(--px-body);border-radius:2px"></textarea>';
  }

  function cartText() {
    return 'Pradako Mechanical & Engineering Works — standards enquiry\n' +
      'Reference: ' + reference() + '\n\n' +
      cart.map(function (i, n) { return (n + 1) + '. ' + i.designation + ' — ' + (i.title || ''); }).join('\n') +
      '\n\nRequirement:\n' + (($('#px-cart-note') && $('#px-cart-note').value) || '(sizes, quantities, material, finish)') + '\n';
  }

  function renderFab() {
    var fab = $('#px-fab');
    fab.classList.toggle('is-visible', cart.length > 0);
    $('#px-fab-n').textContent = cart.length;
  }

  /* ------------------------------------------------------------------ *
   * 8. DRAWERS, TOAST, HASH
   * ------------------------------------------------------------------ */
  var lastFocus = null;

  function openDrawer(sel) {
    lastFocus = document.activeElement;
    $$('.px-drawer').forEach(function (d) { d.classList.remove('is-open'); });
    $(sel).classList.add('is-open');
    $('#px-scrim').classList.add('is-open');
    document.body.style.overflow = 'hidden';
    var c = $('.px-x', $(sel)); if (c) { c.focus(); }
  }
  function closeDrawers() {
    $$('.px-drawer').forEach(function (d) { d.classList.remove('is-open'); });
    $('#px-scrim').classList.remove('is-open');
    document.body.style.overflow = '';
    if (location.hash.indexOf('std=') > -1) { location.hash = hashString({ std: null }); }
    if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#px-toast');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2400);
  }

  function hashString(over) {
    var o = {
      q: state.q || null,
      status: state.status !== 'all' ? state.status : null,
      lineage: state.lineage !== 'all' ? state.lineage : null,
      group: state.group !== 'all' ? state.group : null,
      sort: state.sort !== 'number' ? state.sort : null,
      view: state.view !== 'cards' ? state.view : null,
      std: null
    };
    if (over) { Object.keys(over).forEach(function (k) { o[k] = over[k]; }); }
    var parts = Object.keys(o).filter(function (k) { return o[k]; })
      .map(function (k) { return k + '=' + encodeURIComponent(o[k]); });
    return parts.length ? '#' + parts.join('&') : '#';
  }
  var writingHash = false;
  function writeHash() {
    var h = hashString(location.hash.indexOf('std=') > -1 ? { std: (readHash().std || null) } : null);
    if (h !== location.hash && !(h === '#' && !location.hash)) {
      writingHash = true;
      history.replaceState(null, '', h);
      writingHash = false;
    }
  }
  function readHash() {
    var o = {};
    location.hash.replace(/^#/, '').split('&').forEach(function (p) {
      var kv = p.split('='); if (kv[0]) { o[kv[0]] = decodeURIComponent(kv[1] || ''); }
    });
    return o;
  }
  function applyHash() {
    var h = readHash();
    state.q = h.q || '';
    state.status = h.status || 'all';
    state.lineage = h.lineage || 'all';
    state.group = h.group || 'all';
    state.sort = h.sort || 'number';
    state.view = h.view === 'table' ? 'table' : 'cards';
    $('#px-q').value = state.q;
    $('#px-status').value = state.status;
    $('#px-lineage').value = state.lineage;
    $('#px-sort').value = state.sort;
    syncViewButtons();
    render(true);
    if (h.std) { openDetail(h.std); }
  }
  function syncViewButtons() {
    $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === state.view)); });
  }

  /* ------------------------------------------------------------------ *
   * 9. STAT BAND
   * ------------------------------------------------------------------ */
  function stats() {
    var c = { current: 0, superseded: 0, withdrawn: 0, unverified: 0 }, groups = {};
    DATA.forEach(function (r) { c[r.status]++; groups[r.group] = 1; });
    $('#px-stat-total').textContent = DATA.length;
    $('#px-stat-current').textContent = c.current;
    $('#px-stat-superseded').textContent = c.superseded;
    $('#px-stat-withdrawn').textContent = c.withdrawn;
    $('#px-stat-groups').textContent = Object.keys(groups).length;
    ['current', 'superseded', 'withdrawn', 'unverified'].forEach(function (k) {
      var el = $('#px-legend-' + k); if (el) { el.textContent = c[k]; }
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. EVENTS
   * ------------------------------------------------------------------ */
  function wire() {
    elGrid = $('#px-grid');
    elTable = $('#px-table');
    elCount = $('#px-count');
    elMore = $('#px-more');
    elEmpty = $('#px-empty');
    elChips = $('#px-chips');

    var onQ = debounce(function (v) { state.q = v; render(true); }, 120);
    $('#px-q').addEventListener('input', function () { onQ(this.value); });
    $('#px-hero-q').addEventListener('input', function () { $('#px-q').value = this.value; onQ(this.value); });
    $('#px-hero-go').addEventListener('click', function () {
      document.getElementById('library').scrollIntoView({ behavior: 'smooth' });
    });
    $('#px-q-clear').addEventListener('click', function () {
      $('#px-q').value = ''; $('#px-hero-q').value = ''; state.q = ''; render(true); $('#px-q').focus();
    });

    $('#px-status').addEventListener('change', function () { state.status = this.value; render(true); });
    $('#px-lineage').addEventListener('change', function () { state.lineage = this.value; render(true); });
    $('#px-sort').addEventListener('change', function () { state.sort = this.value; render(true); });

    $$('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.dataset.view; syncViewButtons(); render(); });
    });

    elChips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) { return; }
      if (b.dataset.reset) {
        state.q = ''; state.status = 'all'; state.lineage = 'all'; state.group = 'all';
        $('#px-q').value = ''; $('#px-hero-q').value = '';
        $('#px-status').value = 'all'; $('#px-lineage').value = 'all';
        render(true); return;
      }
      if (b.dataset.group) { state.group = b.dataset.group; render(true); }
    });

    function delegate(e) {
      var host = e.target.closest('[data-id]'); if (!host) { return; }
      var act = e.target.closest('[data-act]');
      if (!act) { return; }
      if (act.dataset.act === 'detail') { openDetail(host.dataset.id); }
      if (act.dataset.act === 'cart') { toggleCart(host.dataset.id); }
    }
    elGrid.addEventListener('click', delegate);
    elTable.addEventListener('click', delegate);

    $('#px-more-btn').addEventListener('click', function () { state.shown += CONFIG.pageSize; render(); });

    $$('[data-open-cart]').forEach(function (b) {
      b.addEventListener('click', function () { renderCart(); openDrawer('#px-cart'); });
    });

    $('#px-scrim').addEventListener('click', closeDrawers);
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-close-drawer]')) { closeDrawers(); }
      var g = e.target.closest('[data-goto]');
      if (g) { openDetail(g.dataset.goto); }
      var rm = e.target.closest('[data-remove]');
      if (rm) { toggleCart(rm.dataset.remove); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawers(); }
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault(); $('#px-q').focus();
      }
    });

    $('#px-detail-add').addEventListener('click', function () { toggleCart(this.dataset.id); });
    $('#px-detail-copy').addEventListener('click', function () {
      var rec = byId(this.dataset.id); if (!rec) { return; }
      copy(rec.designation + ' — ' + rec.titleEn + (rec.editions.length ? ' (' + rec.editions[0] + ')' : ''));
    });

    $('#px-cart-copy').addEventListener('click', function () { copy(cartText()); });
    $('#px-cart-clear').addEventListener('click', function () {
      cart = []; saveCart(); renderCart(); render(); toast('Enquiry list cleared');
    });
    $('#px-cart-send').addEventListener('click', function () {
      window.location.href = 'mailto:' + CONFIG.enquiryEmail +
        '?subject=' + encodeURIComponent('Standards enquiry ' + reference()) +
        '&body=' + encodeURIComponent(cartText());
    });

    window.addEventListener('hashchange', function () {
      if (writingHash) { return; }
      applyHash();
    });
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); },
        function () { toast('Copy failed — select the text manually'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Copied to clipboard'); }
      catch (e) { toast('Copy failed — select the text manually'); }
      document.body.removeChild(ta);
    }
  }

  /* ------------------------------------------------------------------ *
   * 11. INIT
   * ------------------------------------------------------------------ */
  function init() {
    wire();
    stats();
    applyHash();
    renderFab();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }

  /* expose for console checks / other page modules */
  window.PRADAKO_DIN = { data: DATA, state: state, open: openDetail };
}());
