(() => {
  "use strict";

  const state = {
    authority: "All",
    family: "All",
    status: "All",
    query: "",
    view: "familyView"
  };

  const familyIcons = {
    "Bolting": "⛓",
    "Structural Bolts": "🏗",
    "Screws": "✦",
    "Nuts": "⬡",
    "Washers": "◎",
    "Rivets": "●",
    "Raw Material": "▰",
    "Raw Material / Castings": "◼",
    "Forgings": "◆",
    "Coating / Plating": "◈",
    "QA / Testing": "✓",
    "Reference / Support": "ⓘ",
    "Eyebolts / Lifting": "⟲",
    "Anchors / Mining Bolts": "⌖",
    "Nonferrous Fasteners": "◇",
    "Transmission Tower Fasteners": "⚡"
  };

  const preferredMatrixFamilies = [
    "Bolting",
    "Structural Bolts",
    "Screws",
    "Nuts",
    "Washers",
    "Rivets",
    "Coating / Plating",
    "QA / Testing",
    "Raw Material",
    "Raw Material / Castings",
    "Forgings",
    "Reference / Support",
    "Eyebolts / Lifting",
    "Anchors / Mining Bolts",
    "Nonferrous Fasteners",
    "Transmission Tower Fasteners"
  ];

  const els = {};

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();
    initStats();
    initFilters();
    initEvents();
    renderAll();
  });

  function cacheElements() {
    els.searchInput = document.getElementById("searchInput");
    els.familyFilter = document.getElementById("familyFilter");
    els.statusFilter = document.getElementById("statusFilter");
    els.authorityRow = document.getElementById("authorityRow");
    els.familyGrid = document.getElementById("familyGrid");
    els.authorityGrid = document.getElementById("authorityGrid");
    els.libraryGrid = document.getElementById("libraryGrid");
    els.matrixHeadRow = document.getElementById("matrixHeadRow");
    els.matrixBody = document.getElementById("matrixBody");
    els.tableBody = document.getElementById("tableBody");
    els.familyEmpty = document.getElementById("familyEmpty");
    els.authorityEmpty = document.getElementById("authorityEmpty");
    els.libraryEmpty = document.getElementById("libraryEmpty");
    els.familyResultCount = document.getElementById("familyResultCount");
    els.authorityResultCount = document.getElementById("authorityResultCount");
    els.libraryResultCount = document.getElementById("libraryResultCount");
    els.matrixResultCount = document.getElementById("matrixResultCount");
    els.tableResultCount = document.getElementById("tableResultCount");
    els.modalOverlay = document.getElementById("specModalOverlay");
    els.closeModalBtn = document.getElementById("closeModalBtn");
    els.exportCsvBtn = document.getElementById("exportCsvBtn");
    els.goLibraryBtn = document.getElementById("goLibraryBtn");
  }

  function data() {
    return Array.isArray(window.specData) ? window.specData : [];
  }

  function uniqueValues(key) {
    return [...new Set(data().map(item => item[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function uniqueStatuses() {
    return [...new Set(data().flatMap(item => item.status || []))].sort((a, b) => a.localeCompare(b));
  }

  function initStats() {
    const totalStandards = document.getElementById("totalStandards");
    const totalFamilies = document.getElementById("totalFamilies");
    const totalStatus = document.getElementById("totalStatus");

    if (totalStandards) totalStandards.textContent = data().length;
    if (totalFamilies) totalFamilies.textContent = uniqueValues("family").length;
    if (totalStatus) totalStatus.textContent = uniqueStatuses().length;
  }

  function initFilters() {
    const authorities = ["All", ...uniqueValues("authority")];
    els.authorityRow.innerHTML = authorities.map(authority => `
      <button class="authority-chip ${authority === "All" ? "active" : ""}" type="button" data-authority="${escapeAttr(authority)}">
        ${escapeHtml(authority)}
      </button>
    `).join("") + `<button class="authority-chip reset-btn" type="button" id="resetFiltersBtn">Reset</button>`;

    fillSelect(els.familyFilter, ["All", ...uniqueValues("family")]);
    fillSelect(els.statusFilter, ["All", ...uniqueStatuses()]);
  }

  function fillSelect(selectEl, options) {
    selectEl.innerHTML = options.map(option => `<option value="${escapeAttr(option)}">${escapeHtml(option)}</option>`).join("");
  }

  function initEvents() {
    els.searchInput.addEventListener("input", () => {
      state.query = els.searchInput.value.trim().toLowerCase();
      renderAll();
    });

    els.familyFilter.addEventListener("change", () => {
      state.family = els.familyFilter.value;
      renderAll();
    });

    els.statusFilter.addEventListener("change", () => {
      state.status = els.statusFilter.value;
      renderAll();
    });

    els.authorityRow.addEventListener("click", event => {
      const button = event.target.closest("[data-authority]");
      if (!button) return;
      state.authority = button.dataset.authority;

      els.authorityRow.querySelectorAll("[data-authority]").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      renderAll();
    });

    document.getElementById("resetFiltersBtn")?.addEventListener("click", resetFilters);

    document.querySelectorAll(".view-btn").forEach(button => {
      button.addEventListener("click", () => activateView(button.dataset.view));
    });

    document.addEventListener("click", event => {
      const openButton = event.target.closest("[data-open]");
      if (openButton) {
        openModal(openButton.dataset.open);
        return;
      }

      const copyButton = event.target.closest("[data-copy]");
      if (copyButton) {
        copyStandard(copyButton.dataset.copy, copyButton);
      }
    });

    els.closeModalBtn.addEventListener("click", closeModal);
    els.modalOverlay.addEventListener("click", event => {
      if (event.target === els.modalOverlay) closeModal();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeModal();
    });

    els.exportCsvBtn.addEventListener("click", exportFilteredCsv);
    els.goLibraryBtn.addEventListener("click", () => {
      activateView("libraryView");
      document.getElementById("libraryView")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function activateView(viewId) {
    state.view = viewId;
    document.querySelectorAll(".view-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.view === viewId));
    document.querySelectorAll(".view-section").forEach(section => section.classList.toggle("active", section.id === viewId));
  }

  function resetFilters() {
    state.authority = "All";
    state.family = "All";
    state.status = "All";
    state.query = "";

    els.searchInput.value = "";
    els.familyFilter.value = "All";
    els.statusFilter.value = "All";
    els.authorityRow.querySelectorAll("[data-authority]").forEach(btn => btn.classList.toggle("active", btn.dataset.authority === "All"));
    renderAll();
  }

  function getFilteredData() {
    return data().filter(item => {
      const searchableText = [
        item.sr,
        item.number,
        item.authority,
        item.title,
        item.family,
        ...(item.status || []),
        item.details,
        item.view,
        item.note
      ].join(" ").toLowerCase();

      const matchesQuery = !state.query || searchableText.includes(state.query);
      const matchesAuthority = state.authority === "All" || item.authority === state.authority;
      const matchesFamily = state.family === "All" || item.family === state.family;
      const matchesStatus = state.status === "All" || (item.status || []).includes(state.status);

      return matchesQuery && matchesAuthority && matchesFamily && matchesStatus;
    });
  }

  function groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key] || "Others";
      if (!acc[value]) acc[value] = [];
      acc[value].push(item);
      return acc;
    }, {});
  }

  function renderAll() {
    renderFamilyMap();
    renderAuthorityView();
    renderLibrary();
    renderMatrix();
    renderTable();
  }

  function renderFamilyMap() {
    const filtered = getFilteredData();
    const grouped = groupBy(filtered, "family");
    const families = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    els.familyGrid.innerHTML = families.map(family => {
      const items = grouped[family];
      return `
        <article class="family-card">
          <div class="family-top">
            <div class="family-icon">${familyIcons[family] || "●"}</div>
            <div class="family-count">${items.length} Standards</div>
          </div>
          <h3>${escapeHtml(family)}</h3>
          <p>Relevant ASTM specifications connected with ${escapeHtml(family.toLowerCase())}. Click any standard to view details.</p>
          <div class="standard-pills">
            ${items.map(item => `<button class="standard-pill" type="button" data-open="${escapeAttr(item.number)}">${escapeHtml(item.number)}</button>`).join("")}
          </div>
        </article>
      `;
    }).join("");

    els.familyEmpty.style.display = filtered.length ? "none" : "block";
    els.familyResultCount.textContent = `${filtered.length} Results`;
  }

  function renderAuthorityView() {
    const filtered = getFilteredData();
    const grouped = groupBy(filtered, "authority");
    const authorities = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    els.authorityGrid.innerHTML = authorities.map(authority => {
      const items = grouped[authority];
      const families = [...new Set(items.map(item => item.family))].sort((a, b) => a.localeCompare(b));
      return `
        <article class="authority-card">
          <div class="authority-title-row">
            <div class="authority-mark">${escapeHtml(authority)}</div>
            <div class="authority-total">${items.length} Standards</div>
          </div>
          <h3>${escapeHtml(authority)} Standards</h3>
          <p>Browse ${escapeHtml(authority)} specifications by product family, technical category and engineering use.</p>
          <div class="authority-mini">
            ${families.map(family => `<span class="authority-family-chip">${escapeHtml(family)}</span>`).join("")}
          </div>
          <div class="standard-pills">
            ${items.map(item => `<button class="standard-pill" type="button" data-open="${escapeAttr(item.number)}">${escapeHtml(item.number)}</button>`).join("")}
          </div>
        </article>
      `;
    }).join("");

    els.authorityEmpty.style.display = filtered.length ? "none" : "block";
    els.authorityResultCount.textContent = `${filtered.length} Results`;
  }

  function renderLibrary() {
    const filtered = getFilteredData();

    els.libraryGrid.innerHTML = filtered.map(item => `
      <article class="spec-card">
        <div class="spec-card-top">
          <div class="spec-number">${escapeHtml(item.number)}</div>
          <div class="spec-authority">${escapeHtml(item.authority)}</div>
        </div>
        <div class="spec-title">${escapeHtml(item.title)}</div>
        <div class="spec-meta">
          <span class="meta">${escapeHtml(item.family)}</span>
          <span class="meta">Sr. ${escapeHtml(String(item.sr))}</span>
        </div>
        ${renderStatusBadges(item.status)}
        <div class="spec-note">${escapeHtml(item.note)}</div>
        <div class="card-actions">
          <button class="details-btn" type="button" data-open="${escapeAttr(item.number)}">View Details →</button>
          <button class="copy-btn" type="button" data-copy="${escapeAttr(item.number)}">Copy Standard</button>
        </div>
      </article>
    `).join("");

    els.libraryEmpty.style.display = filtered.length ? "none" : "block";
    els.libraryResultCount.textContent = `${filtered.length} Results`;
  }

  function renderMatrix() {
    const filtered = getFilteredData();
    const familiesInData = [...new Set(data().map(item => item.family))];
    const families = preferredMatrixFamilies.filter(fam => familiesInData.includes(fam));
    const authorities = [...new Set(filtered.map(item => item.authority))].sort((a, b) => a.localeCompare(b));

    els.matrixHeadRow.innerHTML = `<th>Authority</th>` + families.map(family => `<th>${escapeHtml(family)}</th>`).join("");

    els.matrixBody.innerHTML = authorities.map(authority => {
      const rowItems = filtered.filter(item => item.authority === authority);
      return `
        <tr>
          <td><span class="authority-name">${escapeHtml(authority)}</span></td>
          ${families.map(family => {
            const familyItems = rowItems.filter(item => item.family === family);
            return `
              <td>
                <div class="matrix-tags">
                  ${familyItems.length ? familyItems.map(item => `<button class="matrix-tag" type="button" data-open="${escapeAttr(item.number)}">${escapeHtml(item.number)}</button>`).join("") : `<span class="dash">—</span>`}
                </div>
              </td>
            `;
          }).join("")}
        </tr>
      `;
    }).join("");

    els.matrixResultCount.textContent = `${filtered.length} Results`;
  }

  function renderTable() {
    const filtered = getFilteredData();

    els.tableBody.innerHTML = filtered.map(item => `
      <tr>
        <td>${escapeHtml(String(item.sr))}</td>
        <td><span class="table-standard">${escapeHtml(item.number)}</span></td>
        <td class="table-title">${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.family)}</td>
        <td>${renderStatusBadges(item.status)}</td>
        <td>${escapeHtml(item.details)}</td>
        <td class="table-note">${escapeHtml(item.view)}</td>
        <td class="table-note">${escapeHtml(item.note)}</td>
        <td>
          <button class="details-btn" type="button" data-open="${escapeAttr(item.number)}">Open</button><br><br>
          <button class="copy-btn" type="button" data-copy="${escapeAttr(item.number)}">Copy</button>
        </td>
      </tr>
    `).join("");

    els.tableResultCount.textContent = `${filtered.length} Results`;
  }

  function renderStatusBadges(statusArray = []) {
    return `
      <div class="status-row">
        ${statusArray.map(status => `<span class="status-badge ${statusClass(status)}">${escapeHtml(status)}</span>`).join("")}
      </div>
    `;
  }

  function statusClass(status) {
    const value = String(status).toLowerCase();
    if (value.includes("product")) return "status-product";
    if (value.includes("raw")) return "status-raw";
    if (value.includes("coating")) return "status-coating";
    if (value.includes("testing")) return "status-testing";
    if (value.includes("qa")) return "status-qa";
    if (value.includes("withdrawn") || value.includes("legacy")) return "status-withdrawn";
    if (value.includes("structural")) return "status-structural";
    if (value.includes("stainless")) return "status-stainless";
    if (value.includes("temperature") || value.includes("pressure")) return "status-temperature";
    if (value.includes("nonferrous") || value.includes("nickel")) return "status-nonferrous";
    if (value.includes("special") || value.includes("aerospace") || value.includes("defence")) return "status-special";
    return "";
  }

  function openModal(number) {
    const item = data().find(spec => spec.number === number);
    if (!item) return;

    document.getElementById("modalNumber").textContent = item.number;
    document.getElementById("modalTitle").textContent = item.title;
    document.getElementById("modalAuthority").textContent = item.authority;
    document.getElementById("modalFamily").textContent = item.family;
    document.getElementById("modalStatus").innerHTML = renderStatusBadges(item.status);
    document.getElementById("modalDetails").textContent = item.details;
    document.getElementById("modalView").textContent = item.view;
    document.getElementById("modalNote").textContent = item.note;

    els.modalOverlay.classList.add("active");
    els.modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modalOverlay.classList.remove("active");
    els.modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  async function copyStandard(number, button) {
    try {
      await navigator.clipboard.writeText(number);
      const originalText = button.textContent;
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = originalText; }, 1200);
    } catch {
      alert(`Copy this standard: ${number}`);
    }
  }

  function exportFilteredCsv() {
    const filtered = getFilteredData();
    const headers = ["Sr", "Standard Number", "Authority", "Title", "Family", "Category", "Details", "Engineering View", "Note"];
    const rows = filtered.map(item => [
      item.sr,
      item.number,
      item.authority,
      item.title,
      item.family,
      (item.status || []).join("; "),
      item.details,
      item.view,
      item.note
    ]);

    const csv = [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pradako-astm-specifications.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
