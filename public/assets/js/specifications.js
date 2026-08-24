/* ==========================================================================
   PRADAKO — SPECIFICATIONS LIBRARY
   Renders only the active view, debounces search, keeps filter state in the
   URL, and degrades to a visible error if the data file fails to load.
   Requires: /js/specifications-data.js loaded first (defines window.specData).
   ========================================================================== */
(() => {
  "use strict";

  const LIBRARY_PAGE_SIZE = 60;
  const SEARCH_DEBOUNCE_MS = 180;
  const VIEWS = ["libraryView", "matrixView", "tableView", "authorityView", "familyView"];
  const PRIMARY_AUTHORITIES = ["All", "ASTM", "ISO", "IS", "EN", "DIN", "BS", "SAE"];

  const state = {
    authority: "All",
    family: "All",
    status: "All",
    query: "",
    view: "libraryView",
    libraryLimit: LIBRARY_PAGE_SIZE
  };

  /* Views are rebuilt lazily. A filter change marks all five dirty; only the
     visible one is rebuilt immediately, the rest on first switch. */
  const dirty = { familyView: true, authorityView: true, libraryView: true, matrixView: true, tableView: true };

  let cache = { key: null, rows: [] };
  let searchTimer = null;
  let lastFocusedBeforeModal = null;
  let openSpec = null;
  let authorityFiltersExpanded = false;

  /* ------------------------------------------------------------------ icons */
  const ICON = {
    bolt:      '<path d="M9 3h6l1 3H8l1-3Z"/><path d="M10 6h4v15h-4z"/><path d="M10 10h4M10 14h4M10 18h4"/>',
    screw:     '<path d="M12 3v18"/><path d="M8 4h8"/><path d="m9 8 6 2M9 12l6 2M9 16l6 2"/>',
    nut:       '<path d="m12 3 7 4.5v9L12 21l-7-4.5v-9L12 3Z"/><circle cx="12" cy="12" r="3.4"/>',
    washer:    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.4"/>',
    rivet:     '<path d="M6 5h12"/><path d="M9.5 5v14l2.5 2 2.5-2V5"/>',
    material:  '<path d="M4 8h16v9H4z"/><path d="M4 8 8 4h16-8l-4 4"/><path d="M8 4v4"/>',
    casting:   '<path d="M5 6h14v12H5z"/><path d="M5 10h14M9 6v12M15 6v12"/>',
    forging:   '<path d="m12 3 6 5-6 5-6-5 6-5Z"/><path d="m6 13 6 5 6-5"/>',
    coating:   '<path d="M4 15h16"/><path d="M6 15V9a6 6 0 0 1 12 0v6"/><path d="M4 19h16"/>',
    testing:   '<path d="m4 13 5 5 11-11"/><path d="M4 20h16"/>',
    mechanical:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    tolerance: '<path d="M3 8h18"/><path d="M3 6v4M21 6v4"/><path d="M6 14v5M12 14v5M18 14v5"/>',
    thread:    '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/><path d="m7 6 3 4-3 4 3 4"/>',
    weldstud:  '<path d="M12 3v9"/><path d="M8 12h8l-1.5 9h-5L8 12Z"/>',
    surface:   '<path d="M3 16c3-4 6-4 9 0s6 4 9 0"/><path d="M3 10c3-4 6-4 9 0s6 4 9 0"/>',
    reference: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.8h.01"/>',
    lifting:   '<circle cx="12" cy="6" r="3"/><path d="M12 9v7"/><path d="M8 21h8l-4-5-4 5Z"/>',
    anchor:    '<circle cx="12" cy="5" r="2"/><path d="M12 7v13"/><path d="M6 13a6 6 0 0 0 12 0"/><path d="M4 13h4M16 13h4"/>',
    nonferrous:'<path d="m12 4 7 4v8l-7 4-7-4V8l7-4Z"/><path d="M12 4v16M5 8l14 8M19 8 5 16"/>',
    tower:     '<path d="M12 3v18"/><path d="M6 21 12 3l6 18"/><path d="M8.5 13h7M7.2 17h9.6"/>',
    aerospace: '<path d="M12 3c1.6 2.2 2.4 5 2.4 8l4.6 3.4v2l-4.8-1.6-.6 3.6 1.9 1.5v1.1L12 20.4l-3.5.6v-1.1l1.9-1.5-.6-3.6L5 16.4v-2l4.6-3.4c0-3 .8-5.8 2.4-8Z"/>',
    defence:   '<path d="M12 3.5 19 6v6c0 4.2-2.9 7.4-7 8.5-4.1-1.1-7-4.3-7-8.5V6l7-2.5Z"/><path d="m9.2 12 2 2 3.6-3.6"/>',
    locking:   '<rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
    insert:    '<rect x="4" y="4" width="16" height="16" rx="1.5"/><circle cx="12" cy="12" r="4"/><path d="M12 4v4M12 16v4"/>',
    marking:   '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M8 9h8M8 13h8M8 17h4"/>',
    railway:   '<path d="M8 3v18M16 3v18"/><path d="M4 8h16M4 13h16M4 18h16"/>',
    structural:'<path d="M4 4h16v16H4z"/><path d="m4 4 16 16M20 4 4 20"/>',
    generic:   '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/>'
  };

  const familyIcons = {
    "Bolting": ICON.bolt,
    "Structural Bolts": ICON.structural,
    "Screws": ICON.screw,
    "Machine Screws": ICON.screw,
    "Nuts": ICON.nut,
    "Washers": ICON.washer,
    "Rivets": ICON.rivet,
    "Raw Material": ICON.material,
    "Raw Material / Castings": ICON.casting,
    "Forgings": ICON.forging,
    "Coating / Plating": ICON.coating,
    "QA / Testing": ICON.testing,
    "Mechanical Properties": ICON.mechanical,
    "Tolerances": ICON.tolerance,
    "Threads": ICON.thread,
    "Weld Studs": ICON.weldstud,
    "Surface Treatment": ICON.surface,
    "Reference / Support": ICON.reference,
    "Eyebolts / Lifting": ICON.lifting,
    "Anchors / Mining Bolts": ICON.anchor,
    "Nonferrous Fasteners": ICON.nonferrous,
    "Transmission Tower Fasteners": ICON.tower,
    "Railway Fasteners": ICON.railway,
    "Aerospace Fasteners": ICON.aerospace,
    "Aerospace Nuts": ICON.aerospace,
    "Aerospace Washers": ICON.aerospace,
    "Aerospace Threads": ICON.aerospace,
    "Defence Fasteners": ICON.defence,
    "Self-Locking Fasteners": ICON.locking,
    "Threaded Inserts": ICON.insert,
    "Marking / Documentation": ICON.marking
  };

  function svgIcon(paths) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths || ICON.generic}</svg>`;
  }

  /* --------------------------------------------------------------- ordering */
  const preferredAuthorityOrder = [
    "All", "ASTM", "ISO", "IS", "EN", "EN ISO", "DIN", "DIN EN", "DIN EN ISO",
    "BS", "BS EN", "BS EN ISO", "SAE", "SAE AMS", "SAE AS", "SAE MA",
    "NAS", "MIL", "FED", "FF", "MS"
  ];

  /* Matrix column order. Any family not listed is appended alphabetically,
     so new data never disappears off the end of the chart. */
  const preferredMatrixFamilies = [
    "Bolting", "Structural Bolts", "Screws", "Machine Screws", "Nuts", "Washers", "Rivets",
    "Weld Studs", "Threads", "Threaded Inserts", "Self-Locking Fasteners",
    "Coating / Plating", "Surface Treatment", "Mechanical Properties", "Tolerances",
    "QA / Testing", "Raw Material", "Raw Material / Castings", "Forgings",
    "Eyebolts / Lifting", "Anchors / Mining Bolts", "Nonferrous Fasteners",
    "Transmission Tower Fasteners", "Railway Fasteners",
    "Aerospace Fasteners", "Aerospace Nuts", "Aerospace Washers", "Aerospace Threads",
    "Defence Fasteners", "Marking / Documentation", "Reference / Support"
  ];

  const categoryClass = {
    "Product Standard": "px-cat-product",
    "Raw Material": "px-cat-raw",
    "Coating / Plating": "px-cat-coating",
    "Mechanical Properties": "px-cat-mechanical",
    "Testing / QA": "px-cat-testing",
    "Dimensions / Tolerances": "px-cat-tolerance",
    "Structural": "px-cat-structural",
    "Stainless Steel": "px-cat-stainless",
    "Aerospace / Defence": "px-cat-aerospace",
    "High Temperature / Pressure": "px-cat-temperature",
    "Nickel / Nonferrous": "px-cat-nonferrous",
    "Reference / Support": "px-cat-reference",
    "Withdrawn / Legacy": "px-cat-withdrawn"
  };

  const heroProfiles = {
    "All": { eyebrow: "Global Specifications Command Centre", title: "Fastener &amp; Material Specifications, <span>Structured for Critical Engineering.</span>", desc: "Explore ASTM, ISO, BIS / IS, EN / EN ISO, DIN / DIN EN ISO, BS / BS EN ISO, SAE / AMS / AS, NAS, MIL and FED specifications for bolting, screws, nuts, washers, rivets, coatings, raw materials, QA, testing, structural assemblies and aerospace supply.", badge: "GLOBAL", label: "Engineering reference ready" },
    "ASTM": { eyebrow: "ASTM Specifications", title: "ASTM Fastener, Bolting &amp; Coating Standards, <span>Ready for Critical Supply.</span>", desc: "ASTM references for pressure bolting, structural bolting, socket screws, stainless fasteners, washers, rivets, coatings, zinc flake, hot dip galvanizing, QA, testing and raw material control.", badge: "ASTM", label: "US engineering reference" },
    "ISO": { eyebrow: "ISO Fastener Standards", title: "ISO Mechanical, Product &amp; Coating Standards, <span>Mapped for Global Customers.</span>", desc: "ISO mechanical property, acceptance inspection, tolerance, product, washer, coating, zinc flake, hot dip galvanizing, torque/clamp force, stainless steel and hydrogen embrittlement references.", badge: "ISO", label: "International reference" },
    "IS": { eyebrow: "BIS / IS Fastener Standards", title: "Indian Standards for Fasteners, <span>Aligned for Defence, Infrastructure &amp; Industry.</span>", desc: "IS standards for hex bolts, screws, nuts, washers, high strength structural bolts, coatings, hot dip galvanizing, zinc plating, self-tapping screws, socket screws and foundation bolts.", badge: "BIS", label: "Indian standards ready" },
    "EN": { eyebrow: "European EN Specifications", title: "EN Structural &amp; Material Standards, <span>Prepared for European Supply.</span>", desc: "EN standards for structural bolting assemblies, non-preloaded assemblies, flange fasteners, pressure and structural steels, stainless materials and forging steels.", badge: "EN", label: "European reference" },
    "EN ISO": { eyebrow: "EN ISO Fastener Standards", title: "EN ISO Fastener Standards, <span>For Product, Quality &amp; Coating Control.</span>", desc: "Mechanical properties, hex bolts, hex screws, nuts, washers, socket screws, zinc flake, electroplating, HDG, inspection, tolerances, torque/clamp force and quality documentation.", badge: "EN ISO", label: "European ISO route" },
    "DIN": { eyebrow: "DIN Specifications", title: "DIN Fastener &amp; Technical Specifications, <span>Built for Precision Engineering.</span>", desc: "Pre-applied adhesive coatings, locking coatings, thread rolling screws, conical washers, surface roughness and German technical specifications for specialised supply.", badge: "DIN", label: "German standard route" },
    "DIN EN": { eyebrow: "DIN EN Material &amp; Fastener Standards", title: "DIN EN Standards, <span>For Material, Heat Treatment &amp; Special Service.</span>", desc: "Raw material, heat treatment steels, stainless bar and wire, nickel alloys, fastener material for elevated or low temperature service, nitriding and case-hardening.", badge: "DIN EN", label: "German EN route" },
    "DIN EN ISO": { eyebrow: "DIN EN ISO Fastener Standards", title: "DIN EN ISO Product &amp; Quality Standards, <span>For Export-Grade Fasteners.</span>", desc: "Mechanical properties, stainless fasteners, socket set screws, socket cap screws, coatings, washers, tolerances, hydrogen embrittlement, torque/clamp force and inspection documentation.", badge: "DIN ISO", label: "German ISO route" },
    "BS": { eyebrow: "British Standards", title: "BS Fastener &amp; Material Standards, <span>Curated for Railway, Aluminium &amp; Engineering Uses.</span>", desc: "Current and customer-drawing references such as railway fishplate bolts and nuts, aluminium rivet, bolt and screw stock, and spring-wire material references.", badge: "BS", label: "British standard route" },
    "BS EN": { eyebrow: "BS EN Structural &amp; Material Standards", title: "BS EN Specifications, <span>For Structural Bolting and Material Control.</span>", desc: "Structural bolting assemblies, non-preloaded assemblies, stainless materials, fastener materials for elevated and low temperature service, and forging standards.", badge: "BS EN", label: "UK EN route" },
    "BS EN ISO": { eyebrow: "BS EN ISO Fastener Standards", title: "BS EN ISO Standards, <span>For Fastener Product, Quality &amp; Coating.</span>", desc: "Mechanical properties, hex bolts, screws, nuts, washers, socket screws, electroplating, zinc flake, HDG, torque/clamp force, hydrogen embrittlement and QA standards.", badge: "BS ISO", label: "UK ISO route" },
    "SAE": { eyebrow: "SAE Fastener Standards", title: "SAE Automotive &amp; Inch-Series Fasteners, <span>Ready for High-Performance Applications.</span>", desc: "Mechanical and material requirements, machine screws, tapping screws, self-drilling screws, steel nuts, wheel bolts, torque-tension testing, decarburization, rivets and protective coatings.", badge: "SAE", label: "Automotive reference" },
    "SAE AMS": { eyebrow: "SAE AMS Coating Specifications", title: "AMS Coatings for Aerospace &amp; Defence, <span>Classified for Critical Finishes.</span>", desc: "Zinc electro-deposition, zinc-nickel plating, cadmium legacy controls, phosphate treatment, black oxide and aluminium-filled ceramic bonded fastener coatings.", badge: "AMS", label: "Aerospace coatings" },
    "SAE AS": { eyebrow: "SAE Aerospace Standards", title: "SAE AS Aerospace Fasteners, <span>For UNJ Threads and Procurement Specs.</span>", desc: "UNJ controlled-radius thread profiles, external wrenching aerospace design standards, titanium alloy bolts and screws, and corrosion-resistant steel bolts.", badge: "SAE AS", label: "Aerospace reference" },
    "SAE MA": { eyebrow: "SAE Metric Aerospace Standards", title: "SAE MA Metric Aerospace Fasteners, <span>For High-Temperature Metric Programmes.</span>", desc: "Metric aerospace corrosion and heat-resistant bolting, including A286 / UNS S66286 type high-temperature applications on drawing-controlled routes.", badge: "SAE MA", label: "Metric aerospace" },
    "NAS": { eyebrow: "AIA / NAS Aerospace Standards", title: "NAS &amp; NASM Aerospace Fasteners, <span>For Aircraft, Defence &amp; Drawing-Controlled Routes.</span>", desc: "Aerospace bolts, titanium close-tolerance fasteners, alloy-steel externally threaded fasteners, self-locking nut plates, high-temperature CRES nuts, NASM1312 testing and special washers.", badge: "NAS", label: "AIA aerospace route" },
    "MIL": { eyebrow: "Military &amp; Defence Specifications", title: "MIL Fastener, Coating &amp; QA Specifications, <span>Mapped for High-Reliability Defence Supply.</span>", desc: "High-reliability bolts, studs, screws and nuts, self-locking elements, threaded inserts, Zn-Ni plating, phosphate, black oxide, corrosion control, acceptance sampling and marking.", badge: "MIL", label: "Defence route" },
    "FED": { eyebrow: "Federal Thread Standards", title: "FED-STD Thread References, <span>For DoD Drawing-Controlled Fasteners.</span>", desc: "Federal screw-thread standards including UN/UNR, UNJ controlled-radius-root and metric thread routes for inch and metric military fastener programmes.", badge: "FED", label: "Federal thread route" },
    "FF": { eyebrow: "Federal Fastener Specifications", title: "FF Product Specifications, <span>For Defence Screws, Nuts and Washers.</span>", desc: "Socket-head cap screws, cap screws, machine screws, set screws, nuts, plain washers and legacy lock washers where Federal or defence procurement drawings call them out.", badge: "FF", label: "Federal fastener route" },
    "MS": { eyebrow: "MS Defence Part Standards", title: "MS-Series Fastener Parts, <span>For Drawing-Controlled Defence Supply.</span>", desc: "Defence part standards such as drilled-head cap screws, drilled-shank cap screws and hex cap screws for customer-drawing controlled applications.", badge: "MS", label: "MS part standards" }
  };

  const familyMicrocopy = {
    "Bolting": "Bolts, studs, threaded rods and critical bolting references.",
    "Structural Bolts": "Preloaded, non-preloaded and high-strength structural assemblies.",
    "Screws": "Socket, machine, tapping, thread forming and special screw standards.",
    "Machine Screws": "Inch and metric machine screw product standards.",
    "Nuts": "Hex, lock, high, thin, stainless and special nut references.",
    "Washers": "Plain, hardened, DTI, structural and special washer specifications.",
    "Rivets": "Solid, blind and structural rivet product standards.",
    "Coating / Plating": "Zinc, Zn-Ni, zinc flake, HDG, phosphate, black oxide and special finishes.",
    "Surface Treatment": "Surface preparation, roughness and pre-treatment references.",
    "QA / Testing": "Inspection, acceptance, torque, fatigue, hardness and surface defect controls.",
    "Mechanical Properties": "Property classes, proof load, tensile and hardness requirements.",
    "Tolerances": "Dimensional tolerance and product grade standards.",
    "Threads": "Thread profile, pitch, gauging and tolerance references.",
    "Threaded Inserts": "Wire thread inserts and threaded bush standards.",
    "Self-Locking Fasteners": "Prevailing torque and locking element specifications.",
    "Weld Studs": "Arc and drawn-arc weld stud specifications.",
    "Raw Material": "Steel, stainless, nickel, aluminium and alloy input material routes.",
    "Raw Material / Castings": "Casting material grades for non-fastener supply capability.",
    "Forgings": "Forging steel grades and forged component standards.",
    "Eyebolts / Lifting": "Eyebolts, eye nuts and lifting point specifications.",
    "Anchors / Mining Bolts": "Anchor bolts, foundation bolts and mining roof bolts.",
    "Nonferrous Fasteners": "Aluminium, brass, copper and nonferrous fastener standards.",
    "Transmission Tower Fasteners": "Tower bolting and transmission line hardware.",
    "Railway Fasteners": "Fishplate bolts, track fastening and railway hardware.",
    "Aerospace Fasteners": "Aerospace procurement and high-performance fastener standards.",
    "Aerospace Nuts": "Self-locking, nut plate and CRES aerospace nut standards.",
    "Aerospace Washers": "Aerospace washer and countersunk washer standards.",
    "Aerospace Threads": "UNJ and aerospace thread profile references.",
    "Defence Fasteners": "Military and defence-drawing controlled fastener specifications.",
    "Marking / Documentation": "Marking, designation and inspection document standards.",
    "Reference / Support": "Terminology, general requirements and supporting references."
  };

  const authorityMicrocopy = {
    "ASTM": "US fastener, bolting, coating, structural and testing standards.",
    "ISO": "International fastener product, quality, coating and testing route.",
    "IS": "BIS / Indian fastener, coating, washer and structural references.",
    "EN": "European structural bolting and engineering material references.",
    "EN ISO": "European adoption route for ISO fastener standards.",
    "DIN": "German DIN-specific technical and product specifications.",
    "DIN EN": "German adoption route for EN material and fastener standards.",
    "DIN EN ISO": "German adoption route for ISO fastener standards.",
    "BS": "British customer-drawing and current useful product references.",
    "BS EN": "British adoption route for EN structural and material standards.",
    "BS EN ISO": "British adoption route for ISO fastener standards.",
    "SAE": "Automotive, inch-series and testing standards for fasteners.",
    "SAE AMS": "Aerospace material and coating specifications.",
    "SAE AS": "Aerospace fastener procurement and UNJ thread standards.",
    "SAE MA": "Metric aerospace procurement specifications.",
    "NAS": "AIA / NAS aerospace fastener drawings and NASM specifications.",
    "MIL": "Military specifications for high-reliability defence supply.",
    "FED": "Federal screw-thread standards for DoD programmes.",
    "FF": "Federal product specifications for screws, nuts and washers.",
    "MS": "MS-series defence part standards for drawing-controlled supply."
  };

  const shortAuthority = { "DIN EN ISO": "DE ISO", "BS EN ISO": "BS ISO", "SAE AMS": "AMS", "SAE AS": "AS", "SAE MA": "MA" };

  const els = {};

  /* ------------------------------------------------------------------ boot */
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    if (!data().length) return showDataError();
    readStateFromUrl();
    buildFilterControls();
    bindEvents();
    activateView(state.view, { skipUrl: true });
    refresh();
  }

  function cacheElements() {
    const ids = [
      "searchInput", "familyFilter", "statusFilter", "authorityRow", "activeFilters",
      "familyGrid", "authorityGrid", "libraryGrid", "matrixHeadRow", "matrixBody", "tableBody",
      "familyResultCount", "authorityResultCount", "libraryResultCount", "matrixResultCount", "tableResultCount",
      "specModalOverlay", "closeModalBtn", "modalCopyBtn", "modalTagsRow",
      "exportCsvBtn", "goLibraryBtn", "copyLinkBtn", "loadMoreBtn", "dataError",
      "heroEyebrow", "heroTitle", "heroDesc", "heroFocusCode", "heroFocusLabel",
      "totalStandards", "totalFamilies", "totalStatus"
    ];
    ids.forEach(id => { els[id] = document.getElementById(id); });
    els.sections = {};
    VIEWS.forEach(v => { els.sections[v] = document.getElementById(v); });
  }

  function data() {
    return Array.isArray(window.specData) ? window.specData : [];
  }

  function showDataError() {
    if (els.dataError) els.dataError.hidden = false;
    VIEWS.forEach(v => { if (els.sections[v]) els.sections[v].hidden = true; });
  }

  /* ------------------------------------------------------------- url state */
  function readStateFromUrl() {
    const p = new URLSearchParams(window.location.search);
    if (p.get("authority")) state.authority = p.get("authority");
    if (p.get("family")) state.family = p.get("family");
    if (p.get("category")) state.status = p.get("category");
    if (p.get("q")) state.query = p.get("q");
    if (VIEWS.includes(p.get("view"))) state.view = p.get("view");

    if (els.searchInput) els.searchInput.value = state.query;

    /* #ASTM-A193 style deep link opens that specification directly */
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, "")).trim();
    if (hash) {
      const match = data().find(s => normalise(s.number) === normalise(hash));
      if (match) window.requestAnimationFrame(() => openModal(match.sr));
    }
  }

  function writeStateToUrl() {
    const p = new URLSearchParams();
    if (state.authority !== "All") p.set("authority", state.authority);
    if (state.family !== "All") p.set("family", state.family);
    if (state.status !== "All") p.set("category", state.status);
    if (state.query) p.set("q", state.query);
    if (state.view !== "libraryView") p.set("view", state.view);
    const qs = p.toString();
    const hash = window.location.hash || "";
    window.history.replaceState(null, "", (qs ? `?${qs}` : window.location.pathname) + hash);
  }

  /* --------------------------------------------------------------- filters */
  function buildFilterControls() {
    const counts = {};
    data().forEach(s => { counts[s.authority] = (counts[s.authority] || 0) + 1; });

    const present = Object.keys(counts);
    const ordered = [
      ...preferredAuthorityOrder.filter(a => a === "All" || present.includes(a)),
      ...present.filter(a => !preferredAuthorityOrder.includes(a)).sort(cmp)
    ];
    const secondary = ordered.filter(a => !PRIMARY_AUTHORITIES.includes(a));

    const authorityChip = authority => {
      const count = authority === "All" ? data().length : counts[authority];
      const isSecondary = secondary.includes(authority);
      const keepVisible = authorityFiltersExpanded || authority === state.authority;
      const hidden = isSecondary && !keepVisible ? " hidden" : "";
      return `<button class="px-authority-chip${authority === state.authority ? " is-active" : ""}${isSecondary ? " px-authority-secondary" : ""}" type="button"
        aria-pressed="${authority === state.authority}" data-authority="${esc(authority)}"${hidden}>${esc(authority)}<span class="px-chip-count">${count}</span></button>`;
    };

    els.authorityRow.classList.toggle("is-expanded", authorityFiltersExpanded);
    els.authorityRow.innerHTML = ordered.map(authorityChip).join("") +
      (secondary.length ? `<button class="px-authority-chip px-authority-toggle" type="button" id="toggleAuthorityBtn" aria-expanded="${authorityFiltersExpanded}">${authorityFiltersExpanded ? "Show less" : `More ${secondary.length}`}</button>` : "") +
      `<button class="px-authority-chip px-reset-btn" type="button" id="resetFiltersBtn">Clear all</button>`;

    fillSelect(els.familyFilter, "All families", unique("family"));
    fillSelect(els.statusFilter, "All categories", uniqueCategories());
    els.familyFilter.value = state.family;
    els.statusFilter.value = state.status;
  }

  function fillSelect(select, allLabel, values) {
    select.innerHTML = `<option value="All">${allLabel}</option>` +
      values.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
  }

  function unique(key) {
    return [...new Set(data().map(s => s[key]).filter(Boolean))].sort(cmp);
  }

  function uniqueCategories() {
    const present = new Set(data().flatMap(s => s.status || []));
    const ordered = Object.keys(categoryClass).filter(c => present.has(c));
    const extra = [...present].filter(c => !categoryClass[c]).sort(cmp);
    return [...ordered, ...extra];
  }

  function cmp(a, b) { return String(a).localeCompare(String(b)); }

  /* ---------------------------------------------------------------- search */
  /* Engineers type "ISO898-1" as often as "ISO 898-1", so both sides of the
     comparison are stripped of separators before matching. */
  function normalise(value) {
    return String(value == null ? "" : value).toLowerCase().replace(/[\s\-–—/.,:()]+/g, "");
  }

  function searchIndex(item) {
    if (!item._idx) {
      item._idx = normalise([
        item.sr, item.number, item.authority, item.title, item.family,
        (item.status || []).join(" "), (item.tags || []).join(" "),
        item.details, item.view, item.note
      ].join(" "));
    }
    return item._idx;
  }

  function getFiltered() {
    const key = [state.authority, state.family, state.status, state.query].join("\u0000");
    if (cache.key === key) return cache.rows;

    const q = normalise(state.query);
    const rows = data().filter(item =>
      (state.authority === "All" || item.authority === state.authority) &&
      (state.family === "All" || item.family === state.family) &&
      (state.status === "All" || (item.status || []).includes(state.status)) &&
      (!q || searchIndex(item).includes(q))
    );
    cache = { key, rows };
    return rows;
  }

  /* ----------------------------------------------------------------- events */
  function bindEvents() {
    els.searchInput.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        state.query = els.searchInput.value.trim();
        refresh();
      }, SEARCH_DEBOUNCE_MS);
    });

    els.familyFilter.addEventListener("change", () => { state.family = els.familyFilter.value; refresh(); });
    els.statusFilter.addEventListener("change", () => { state.status = els.statusFilter.value; refresh(); });

    els.authorityRow.addEventListener("click", event => {
      if (event.target.closest("#resetFiltersBtn")) return resetFilters();
      if (event.target.closest("#toggleAuthorityBtn")) {
        authorityFiltersExpanded = !authorityFiltersExpanded;
        buildFilterControls();
        return;
      }
      const btn = event.target.closest("[data-authority]");
      if (btn) setAuthority(btn.dataset.authority);
    });

    els.activeFilters.addEventListener("click", event => {
      const btn = event.target.closest("[data-clear]");
      if (!btn) return;
      const which = btn.dataset.clear;
      if (which === "query") { state.query = ""; els.searchInput.value = ""; }
      if (which === "authority") state.authority = "All";
      if (which === "family") { state.family = "All"; els.familyFilter.value = "All"; }
      if (which === "status") { state.status = "All"; els.statusFilter.value = "All"; }
      refresh();
    });

    const tabs = [...document.querySelectorAll(".px-view-btn")];
    tabs.forEach((btn, i) => {
      btn.addEventListener("click", () => activateView(btn.dataset.view));
      btn.addEventListener("keydown", event => {
        const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!delta) return;
        event.preventDefault();
        const next = tabs[(i + delta + tabs.length) % tabs.length];
        next.focus();
        activateView(next.dataset.view);
      });
    });

    document.addEventListener("click", event => {
      const fam = event.target.closest("[data-filter-family]");
      if (fam) return setFamily(fam.dataset.filterFamily, true);

      const auth = event.target.closest("[data-filter-authority-card]");
      if (auth) return setAuthority(auth.dataset.filterAuthorityCard, true);

      const open = event.target.closest("[data-open]");
      if (open) return openModal(Number(open.dataset.open));

      const copy = event.target.closest("[data-copy]");
      if (copy) copyText(copy.dataset.copy, copy);
    });

    els.loadMoreBtn.addEventListener("click", () => {
      state.libraryLimit += LIBRARY_PAGE_SIZE;
      renderLibrary();
    });

    els.closeModalBtn.addEventListener("click", closeModal);
    els.modalCopyBtn.addEventListener("click", () => { if (openSpec) copyText(openSpec.number, els.modalCopyBtn); });
    els.specModalOverlay.addEventListener("mousedown", event => {
      if (event.target === els.specModalOverlay) closeModal();
    });
    document.addEventListener("keydown", event => {
      if (els.specModalOverlay.hidden) return;
      if (event.key === "Escape") return closeModal();
      if (event.key === "Tab") trapFocus(event);
    });

    els.exportCsvBtn.addEventListener("click", exportCsv);
    els.copyLinkBtn.addEventListener("click", () => copyText(window.location.href, els.copyLinkBtn, "Link copied"));
    els.goLibraryBtn.addEventListener("click", () => {
      activateView("libraryView");
      els.sections.libraryView.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function syncAuthorityChips() {
    els.authorityRow.querySelectorAll("[data-authority]").forEach(btn => {
      const on = btn.dataset.authority === state.authority;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function setAuthority(authority, jumpToLibrary) {
    if (!authority) return;
    state.authority = authority;
    syncAuthorityChips();
    if (jumpToLibrary) activateView("libraryView");
    refresh();
    if (jumpToLibrary) els.sections.libraryView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setFamily(family, jumpToLibrary) {
    if (!family) return;
    state.family = family;
    els.familyFilter.value = family;
    if (jumpToLibrary) activateView("libraryView");
    refresh();
    if (jumpToLibrary) els.sections.libraryView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFilters() {
    state.authority = "All";
    state.family = "All";
    state.status = "All";
    state.query = "";
    authorityFiltersExpanded = false;
    els.searchInput.value = "";
    buildFilterControls();
    refresh();
  }

  function activateView(viewId, options = {}) {
    if (!VIEWS.includes(viewId)) viewId = "libraryView";
    state.view = viewId;

    document.querySelectorAll(".px-view-btn").forEach(btn => {
      const on = btn.dataset.view === viewId;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", String(on));
      btn.tabIndex = on ? 0 : -1;
    });
    VIEWS.forEach(v => {
      const section = els.sections[v];
      if (!section) return;
      section.classList.toggle("is-active", v === viewId);
      section.hidden = v !== viewId;
    });

    renderActiveView();
    if (!options.skipUrl) writeStateToUrl();
  }

  /* --------------------------------------------------------------- renderer */
  function refresh() {
    state.libraryLimit = LIBRARY_PAGE_SIZE;
    VIEWS.forEach(v => { dirty[v] = true; });
    syncAuthorityChips();
    updateHero();
    renderActiveFilters();
    renderActiveView();
    writeStateToUrl();
  }

  /* Only the visible view is built. The other four stay dirty until opened —
     this is what keeps typing responsive on a 545-row dataset. */
  function renderActiveView() {
    if (!dirty[state.view]) return;
    dirty[state.view] = false;
    if (state.view === "familyView") renderFamilyMap();
    if (state.view === "authorityView") renderAuthorities();
    if (state.view === "libraryView") renderLibrary();
    if (state.view === "matrixView") renderMatrix();
    if (state.view === "tableView") renderTable();
    updateAllCounts();
  }

  function updateAllCounts() {
    const n = getFiltered().length;
    const label = `${n.toLocaleString("en-IN")} ${n === 1 ? "result" : "results"}`;
    ["familyResultCount", "authorityResultCount", "libraryResultCount", "matrixResultCount", "tableResultCount"]
      .forEach(id => { if (els[id]) els[id].textContent = label; });
    VIEWS.forEach(v => { if (els.sections[v]) els.sections[v].classList.toggle("is-empty", n === 0); });
  }

  function updateHero() {
    const profile = heroProfiles[state.authority] || heroProfiles.All;
    const source = state.authority === "All" ? data() : data().filter(s => s.authority === state.authority);

    els.heroEyebrow.textContent = stripTags(profile.eyebrow);
    els.heroTitle.innerHTML = profile.title;
    els.heroDesc.textContent = profile.desc;
    els.heroFocusCode.textContent = profile.badge;
    els.heroFocusLabel.textContent = profile.label;
    els.totalStandards.textContent = source.length.toLocaleString("en-IN");
    els.totalFamilies.textContent = new Set(source.map(s => s.family).filter(Boolean)).size;
    els.totalStatus.textContent = new Set(source.flatMap(s => s.status || [])).size;
  }

  function renderActiveFilters() {
    const pills = [];
    const add = (key, label) => pills.push(
      `<span class="px-active-pill">${esc(label)}<button type="button" data-clear="${key}" aria-label="Remove filter ${esc(label)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button></span>`
    );
    if (state.query) add("query", `Search: ${state.query}`);
    if (state.authority !== "All") add("authority", `Authority: ${state.authority}`);
    if (state.family !== "All") add("family", `Family: ${state.family}`);
    if (state.status !== "All") add("status", `Category: ${state.status}`);
    els.activeFilters.innerHTML = pills.join("");
  }

  function categoryBadges(list) {
    if (!list || !list.length) return "";
    return `<div class="px-status-row">${list.map(c =>
      `<span class="px-status-badge ${categoryClass[c] || "px-cat-reference"}">${esc(c)}</span>`).join("")}</div>`;
  }

  function compactCategoryBadges(list, sr) {
    if (!list || !list.length) return "";
    const shown = list.slice(0, 2);
    const remaining = list.length - shown.length;
    return `<div class="px-status-row px-status-row-compact">${shown.map(c =>
      `<span class="px-status-badge ${categoryClass[c] || "px-cat-reference"}">${esc(c)}</span>`).join("")}${remaining > 0
        ? `<button class="px-status-more" type="button" data-open="${sr}" aria-label="View ${remaining} more categories">+${remaining} more</button>`
        : ""}</div>`;
  }

  function renderFamilyMap() {
    const grouped = groupBy(getFiltered(), "family");
    const families = Object.keys(grouped).sort(cmp);

    els.familyGrid.innerHTML = families.map(family => {
      const items = grouped[family].slice().sort((a, b) => cmp(a.number, b.number));
      const shown = items.slice(0, 12);
      const hidden = items.length - shown.length;
      return `<article class="px-family-card">
        <div class="px-family-top">
          <span class="px-family-icon">${svgIcon(familyIcons[family])}</span>
          <span class="px-family-count">${items.length} standards</span>
        </div>
        <h3>${esc(family)}</h3>
        <p>${esc(familyMicrocopy[family] || `Standards grouped for ${family.toLowerCase()} applications.`)}</p>
        <div class="px-standard-pills">
          ${shown.map(pill).join("")}
          ${hidden > 0 ? `<button class="px-standard-pill px-more-pill" type="button" data-filter-family="${esc(family)}">+${hidden} more</button>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  function renderAuthorities() {
    const grouped = groupBy(getFiltered(), "authority");
    const present = Object.keys(grouped);
    const ordered = [
      ...preferredAuthorityOrder.filter(a => present.includes(a)),
      ...present.filter(a => !preferredAuthorityOrder.includes(a)).sort(cmp)
    ];

    els.authorityGrid.innerHTML = ordered.map(authority => {
      const items = grouped[authority].slice().sort((a, b) => cmp(a.number, b.number));
      const families = [...new Set(items.map(s => s.family))].sort(cmp);
      const shownFamilies = families.slice(0, 6);
      const shownItems = items.slice(0, 14);
      const hiddenFamilies = families.length - shownFamilies.length;
      const hiddenItems = items.length - shownItems.length;
      return `<article class="px-authority-card">
        <div class="px-authority-title-row">
          <span class="px-authority-mark">${esc(shortAuthority[authority] || authority)}</span>
          <span class="px-authority-total">${items.length} standards</span>
        </div>
        <h3>${esc(authority)}</h3>
        <p>${esc(authorityMicrocopy[authority] || `Authority-wise specifications for ${authority}.`)}</p>
        <div class="px-authority-mini">
          ${shownFamilies.map(f => `<span class="px-authority-family-chip">${esc(f)}</span>`).join("")}
          ${hiddenFamilies > 0 ? `<button class="px-quick-filter-btn" type="button" data-filter-authority-card="${esc(authority)}">+${hiddenFamilies} families</button>` : ""}
        </div>
        <div class="px-standard-pills">
          ${shownItems.map(pill).join("")}
          ${hiddenItems > 0 ? `<button class="px-standard-pill px-more-pill" type="button" data-filter-authority-card="${esc(authority)}">+${hiddenItems} more</button>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  function pill(item) {
    return `<button class="px-standard-pill" type="button" data-open="${item.sr}">${esc(item.number)}</button>`;
  }

  function renderLibrary() {
    const rows = getFiltered();
    const shown = rows.slice(0, state.libraryLimit);

    els.libraryGrid.innerHTML = shown.map(item => `<article class="px-spec-card">
      <div class="px-spec-card-top">
        <span class="px-spec-authority">${esc(item.authority)}</span>
        <span class="px-spec-serial" aria-label="Serial number ${item.sr}">${String(item.sr).padStart(3, "0")}</span>
      </div>

      <div class="px-spec-identity">
        <h3 class="px-spec-number">${esc(item.number)}</h3>
        <p class="px-spec-title" title="${esc(item.title)}">${esc(item.title)}</p>
      </div>

      <div class="px-spec-classification">
        <span class="px-family-label">${esc(item.family)}</span>
        ${compactCategoryBadges(item.status, item.sr)}
      </div>

      <div class="px-card-actions">
        <button class="px-details-btn" type="button" data-open="${item.sr}" aria-label="View complete details for ${esc(item.number)}">View details</button>
        <button class="px-copy-btn" type="button" data-copy="${esc(item.number)}" aria-label="Copy ${esc(item.number)}">Copy code</button>
      </div>
    </article>`).join("");

    const remaining = rows.length - shown.length;
    els.loadMoreBtn.hidden = remaining <= 0;
    els.loadMoreBtn.textContent = `Show ${Math.min(remaining, LIBRARY_PAGE_SIZE)} more of ${remaining} remaining`;
  }

  /* Buckets are built once per render instead of filtering inside a nested
     loop, and columns come from the filtered set so the chart never fills
     with empty dashes. */
  function renderMatrix() {
    const rows = getFiltered();
    const bucket = new Map();
    const familiesPresent = new Set();
    const authoritiesPresent = new Set();

    rows.forEach(item => {
      familiesPresent.add(item.family);
      authoritiesPresent.add(item.authority);
      const key = item.authority + "\u0000" + item.family;
      if (!bucket.has(key)) bucket.set(key, []);
      bucket.get(key).push(item);
    });

    const families = [
      ...preferredMatrixFamilies.filter(f => familiesPresent.has(f)),
      ...[...familiesPresent].filter(f => !preferredMatrixFamilies.includes(f)).sort(cmp)
    ];
    const authorities = [
      ...preferredAuthorityOrder.filter(a => authoritiesPresent.has(a)),
      ...[...authoritiesPresent].filter(a => !preferredAuthorityOrder.includes(a)).sort(cmp)
    ];

    els.matrixHeadRow.innerHTML = `<th scope="col">Authority</th>` +
      families.map(f => `<th scope="col">${esc(f)}</th>`).join("");

    els.matrixBody.innerHTML = authorities.map(authority => {
      const cells = families.map(family => {
        const items = bucket.get(authority + "\u0000" + family);
        return `<td>${items && items.length
          ? `<div class="px-matrix-tags">${items.map(i => `<button class="px-matrix-tag" type="button" data-open="${i.sr}">${esc(i.number)}</button>`).join("")}</div>`
          : `<span class="px-dash" aria-label="none">&mdash;</span>`}</td>`;
      }).join("");
      return `<tr><th scope="row" class="px-authority-name">${esc(authority)}</th>${cells}</tr>`;
    }).join("");
  }

  function renderTable() {
    els.tableBody.innerHTML = getFiltered().map(item => `<tr>
      <th scope="row" class="px-table-standard">${esc(item.number)}</th>
      <td>${item.sr}</td>
      <td class="px-table-title">${esc(item.title)}</td>
      <td>${esc(item.family)}</td>
      <td>${categoryBadges(item.status)}</td>
      <td>${esc(item.details)}</td>
      <td class="px-table-note">${esc(item.view)}</td>
      <td class="px-table-note">${esc(item.note)}</td>
      <td><div class="px-table-actions">
        <button class="px-details-btn" type="button" data-open="${item.sr}">Open</button>
        <button class="px-copy-btn" type="button" data-copy="${esc(item.number)}">Copy</button>
      </div></td>
    </tr>`).join("");
  }

  function groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key] || "Others";
      (acc[value] = acc[value] || []).push(item);
      return acc;
    }, {});
  }

  /* ----------------------------------------------------------------- modal */
  /* Keyed on sr, not the standard number — two records can legitimately share
     a number across authorities and the wrong card must never open. */
  function openModal(sr) {
    const item = data().find(s => s.sr === sr);
    if (!item) return;
    openSpec = item;
    lastFocusedBeforeModal = document.activeElement;

    setText("modalNumber", item.number);
    setText("modalTitle", item.title);
    setText("modalAuthority", item.authority);
    setText("modalFamily", item.family);
    document.getElementById("modalStatus").innerHTML = categoryBadges(item.status);
    setText("modalDetails", item.details);
    setText("modalView", item.view);
    setText("modalNote", item.note);

    const tags = item.tags || [];
    els.modalTagsRow.hidden = !tags.length;
    document.getElementById("modalTags").innerHTML =
      `<span class="px-tag-row">${tags.map(t => `<span class="px-tag">${esc(t)}</span>`).join("")}</span>`;

    els.specModalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    els.closeModalBtn.focus();
  }

  function closeModal() {
    els.specModalOverlay.hidden = true;
    document.body.style.overflow = "";
    openSpec = null;
    if (lastFocusedBeforeModal && document.contains(lastFocusedBeforeModal)) lastFocusedBeforeModal.focus();
  }

  function trapFocus(event) {
    const focusable = els.specModalOverlay.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value == null ? "" : String(value);
  }

  /* ------------------------------------------------------------ copy / csv */
  async function copyText(text, button, successLabel) {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = successLabel || "Copied";
    } catch {
      button.textContent = "Press Ctrl+C";
      window.prompt("Copy this value:", text);
    }
    window.setTimeout(() => { button.textContent = original; }, 1400);
  }

  function exportCsv() {
    const rows = getFiltered();
    const headers = ["Sr", "Standard Number", "Authority", "Title", "Family", "Category", "Tags", "Details", "Engineering View", "Note"];
    const body = rows.map(item => [
      item.sr, item.number, item.authority, item.title, item.family,
      (item.status || []).join("; "), (item.tags || []).join("; "),
      item.details, item.view, item.note
    ]);

    /* BOM keeps Excel from mangling degree signs and accented characters. */
    const csv = "\uFEFF" + [headers, ...body].map(row => row.map(csvEscape).join(",")).join("\r\n");
    const parts = ["pradako-specifications"];
    if (state.authority !== "All") parts.push(slug(state.authority));
    if (state.family !== "All") parts.push(slug(state.family));
    parts.push(new Date().toISOString().slice(0, 10));

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${parts.join("-")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function csvEscape(value) {
    return `"${String(value == null ? "" : value).replace(/"/g, '""')}"`;
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function stripTags(value) {
    return String(value).replace(/<[^>]*>/g, "").replace(/&amp;/g, "&");
  }
})();
