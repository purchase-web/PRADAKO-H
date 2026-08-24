/**
 * ISO Fastener Standards Database
 * Main JavaScript Module with Embedded Data
 * 
 * Features:
 * - Data loading and cleaning
 * - Search with autocomplete
 * - Filtering by product family
 * - Sorting
 * - Grid/List view toggle with localStorage
 * - Pagination (Load More)
 * - Modal details view
 * - Export with contact popup
 * - Copy to clipboard
 * - Toast notifications
 * - URL parameter support
 */

// ============================================
// EMBEDDED ISO STANDARDS DATA
// Keep your existing complete EMBEDDED_STANDARDS_DATA block here.
// The data block was not changed during JS cleanup.
// Only the functional JS below was cleaned.
// ============================================

const EMBEDDED_STANDARDS_DATA = [
    // IMPORTANT:
    // Paste your existing ISO standards data array here exactly as it is.
    // Start from:
    // { family: "...", iso: "...", title: "...", keywords: "..." }
    // and end with the closing ];
];

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let allStandards = [];
let filteredStandards = [];
let displayedCount = 0;
let currentView = "grid";
let activeFilters = new Set();
let currentSearchTerm = "";
let currentSort = "iso-asc";
let isLoading = false;
let currentPage = 0;

const PAGE_SIZE = 20;
const elements = {};

/* ==========================================================
   UTILITY FUNCTIONS
========================================================== */

function normalizeISO(isoString) {
    if (!isoString) return "";

    return isoString
        .toString()
        .toLowerCase()
        .replace(/[\s-]/g, "")
        .replace(/^iso/, "iso");
}

function removeDuplicates(standards) {
    const seen = new Map();
    const unique = [];

    standards.forEach((standard) => {
        const normalizedISO = normalizeISO(standard.iso);

        if (!seen.has(normalizedISO)) {
            seen.set(normalizedISO, true);
            unique.push(standard);
        }
    });

    console.log(`Removed ${standards.length - unique.length} duplicates`);

    return unique;
}

function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");

    if (!toastContainer) {
        console.log(message);
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon =
        type === "success"
            ? "fa-check-circle"
            : type === "error"
                ? "fa-exclamation-circle"
                : "fa-info-circle";

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button class="toast-close" type="button" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;

    const closeButton = toast.querySelector(".toast-close");

    closeButton?.addEventListener("click", () => {
        toast.remove();
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
        if (!toast.parentElement) return;

        toast.style.animation = "slideOutRight var(--transition-fast)";

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "";

    const div = document.createElement("div");
    div.textContent = String(text);

    return div.innerHTML;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(`Copied: ${text}`, "success");
        return true;
    } catch (error) {
        showToast("Failed to copy", "error");
        return false;
    }
}

/* ==========================================================
   DATA PROCESSING
========================================================== */

function extractFamilies(standards) {
    const families = new Set();

    standards.forEach((standard) => {
        if (!standard.family || !standard.family.trim()) return;

        const family = standard.family.trim().replace(/\s+mapping$/, "");

        families.add(family);
    });

    return Array.from(families).sort();
}

function processData() {
    let results = [...allStandards];

    if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();

        results = results.filter((standard) => {
            return (
                standard.iso.toLowerCase().includes(searchLower) ||
                standard.title.toLowerCase().includes(searchLower) ||
                standard.keywords.toLowerCase().includes(searchLower) ||
                standard.family.toLowerCase().includes(searchLower)
            );
        });
    }

    if (activeFilters.size > 0) {
        results = results.filter((standard) => {
            const family = standard.family.trim().replace(/\s+mapping$/, "");
            return activeFilters.has(family);
        });
    }

    results = sortStandards(results, currentSort);

    filteredStandards = results;

    updateResultCounter();
    renderActiveFilters();

    displayedCount = 0;
    currentPage = 0;

    loadMoreStandards();

    return results;
}

function sortStandards(standards, sortType) {
    const sorted = [...standards];

    switch (sortType) {
        case "iso-asc":
            sorted.sort((a, b) => normalizeISO(a.iso).localeCompare(normalizeISO(b.iso)));
            break;

        case "iso-desc":
            sorted.sort((a, b) => normalizeISO(b.iso).localeCompare(normalizeISO(a.iso)));
            break;

        case "title-asc":
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;

        case "title-desc":
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;

        case "family-asc":
            sorted.sort((a, b) => a.family.localeCompare(b.family));
            break;

        case "family-desc":
            sorted.sort((a, b) => b.family.localeCompare(a.family));
            break;

        default:
            sorted.sort((a, b) => normalizeISO(a.iso).localeCompare(normalizeISO(b.iso)));
            break;
    }

    return sorted;
}

function loadMoreStandards() {
    const start = displayedCount;
    const end = start + PAGE_SIZE;
    const newStandards = filteredStandards.slice(start, end);

    const loadMoreBtn = document.getElementById("load-more-btn");

    if (!newStandards.length) {
        if (loadMoreBtn) {
            loadMoreBtn.style.display = "none";
        }

        return;
    }

    renderStandards(newStandards, true);

    displayedCount += newStandards.length;

    if (loadMoreBtn) {
        loadMoreBtn.style.display =
            displayedCount >= filteredStandards.length
                ? "none"
                : "inline-flex";
    }

    if (window.pradakoRefreshAnimations) {
        window.pradakoRefreshAnimations();
    }
}

/* ==========================================================
   DOM INITIALIZATION
========================================================== */

function cacheElements() {
    elements.searchInput = document.getElementById("search-input");
    elements.clearSearch = document.getElementById("clear-search");
    elements.autocomplete = document.getElementById("autocomplete-results");
    elements.filterContainer = document.getElementById("filter-container");
    elements.activeFilters = document.getElementById("active-filters");
    elements.resultsCount = document.getElementById("results-count");
    elements.standardsGrid = document.getElementById("standards-grid");
    elements.loadMoreBtn = document.getElementById("load-more-btn");
    elements.loadingState = document.getElementById("loading-state");
    elements.emptyState = document.getElementById("empty-state");
    elements.gridViewBtn = document.getElementById("grid-view-btn");
    elements.listViewBtn = document.getElementById("list-view-btn");
    elements.sortSelect = document.getElementById("sort-select");
    elements.exportBtn = document.getElementById("export-btn");
    elements.modal = document.getElementById("standard-modal");
    elements.modalClose = document.getElementById("modal-close");
    elements.modalBody = document.getElementById("modal-body");
}

function populateFamilyFilters() {
    if (!elements.filterContainer) return;

    const families = extractFamilies(allStandards);

    elements.filterContainer.innerHTML = families.map((family) => `
        <button class="filter-chip" type="button" data-family="${escapeHtml(family)}">
            ${escapeHtml(family)}
        </button>
    `).join("");
}

/* ==========================================================
   RENDERING
========================================================== */

function renderStandards(standards, append = false) {
    if (!elements.standardsGrid) return;

    if (!append) {
        elements.standardsGrid.innerHTML = "";
    }

    if (!append && !standards.length) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    const html = standards.map((standard) => createStandardCard(standard)).join("");

    elements.standardsGrid.insertAdjacentHTML("beforeend", html);

    attachCardEventListeners();
}

function createStandardCard(standard) {
    const cleanFamily = standard.family.trim().replace(/\s+mapping$/, "");

    return `
        <article class="standard-card" data-iso="${escapeHtml(standard.iso)}">
            <div class="standard-card-header">
                <span class="standard-number">${escapeHtml(standard.iso)}</span>
                <button class="copy-standard-btn" type="button" data-copy="${escapeHtml(standard.iso)}" aria-label="Copy ${escapeHtml(standard.iso)}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>

            <div class="standard-card-body">
                <h3>${escapeHtml(standard.title)}</h3>
                <p>${escapeHtml(standard.keywords)}</p>
            </div>

            <div class="standard-card-footer">
                <span class="family-badge">${escapeHtml(cleanFamily)}</span>
                <button class="view-details-btn" type="button" data-iso="${escapeHtml(standard.iso)}">
                    View Details
                </button>
            </div>
        </article>
    `;
}

function showEmptyState() {
    if (elements.emptyState) {
        elements.emptyState.style.display = "block";
    }

    if (elements.standardsGrid) {
        elements.standardsGrid.innerHTML = "";
    }
}

function hideEmptyState() {
    if (elements.emptyState) {
        elements.emptyState.style.display = "none";
    }
}

function updateResultCounter() {
    if (!elements.resultsCount) return;

    elements.resultsCount.textContent =
        `${filteredStandards.length} standard${filteredStandards.length === 1 ? "" : "s"} found`;
}

function renderActiveFilters() {
    if (!elements.activeFilters) return;

    if (!activeFilters.size) {
        elements.activeFilters.innerHTML = "";
        return;
    }

    elements.activeFilters.innerHTML = Array.from(activeFilters).map((family) => `
        <button class="active-filter" type="button" data-remove-filter="${escapeHtml(family)}">
            ${escapeHtml(family)}
            <i class="fas fa-times"></i>
        </button>
    `).join("");
}

/* ==========================================================
   FILTER CONTROL FUNCTIONS
========================================================== */

function removeFilter(filterValue) {
    activeFilters.delete(filterValue);
    updateFilterUI();
    processData();
    showToast(`Filter removed: ${filterValue}`, "info");
}

function clearSearch() {
    currentSearchTerm = "";

    if (elements.searchInput) {
        elements.searchInput.value = "";
    }

    if (elements.clearSearch) {
        elements.clearSearch.classList.remove("visible");
    }

    processData();
    showToast("Search cleared", "info");
}

function updateFilterUI() {
    if (!elements.filterContainer) return;

    const checkboxes = elements.filterContainer.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach((checkbox) => {
        checkbox.checked = activeFilters.has(checkbox.value);
    });
}

/* ==========================================================
   SEARCH AUTOCOMPLETE
========================================================== */

function setupAutocomplete() {
    if (!elements.searchInput || !elements.autocomplete) return;

    elements.searchInput.addEventListener(
        "input",
        debounce(() => {
            const term = elements.searchInput.value.trim().toLowerCase();

            if (!term) {
                elements.autocomplete.style.display = "none";
                elements.autocomplete.innerHTML = "";
                return;
            }

            const matches = allStandards
                .filter((standard) => {
                    return (
                        standard.iso.toLowerCase().includes(term) ||
                        standard.title.toLowerCase().includes(term) ||
                        standard.keywords.toLowerCase().includes(term) ||
                        standard.family.toLowerCase().includes(term)
                    );
                })
                .slice(0, 10);

            if (!matches.length) {
                elements.autocomplete.style.display = "none";
                elements.autocomplete.innerHTML = "";
                return;
            }

            elements.autocomplete.innerHTML = matches
                .map((match) => {
                    return `
                        <button class="autocomplete-item" type="button" data-autocomplete="${escapeHtml(match.iso)}">
                            <span class="autocomplete-iso">${escapeHtml(match.iso)}</span>
                            <span class="autocomplete-title">${escapeHtml(match.title.substring(0, 90))}</span>
                        </button>
                    `;
                })
                .join("");

            elements.autocomplete.style.display = "block";
        }, 250)
    );

    elements.autocomplete.addEventListener("click", (event) => {
        const item = event.target.closest("[data-autocomplete]");
        if (!item) return;

        const value = item.dataset.autocomplete;

        elements.searchInput.value = value;
        elements.autocomplete.style.display = "none";

        performSearch(value);
    });

    document.addEventListener("click", (event) => {
        if (
            !elements.searchInput.contains(event.target) &&
            !elements.autocomplete.contains(event.target)
        ) {
            elements.autocomplete.style.display = "none";
        }
    });
}

function performSearch(term) {
    currentSearchTerm = term.trim();

    if (elements.searchInput) {
        elements.searchInput.value = currentSearchTerm;
    }

    if (elements.clearSearch && currentSearchTerm) {
        elements.clearSearch.classList.add("visible");
    }

    processData();
    showToast(`Searching: "${currentSearchTerm}"`, "info");
}

/* ==========================================================
   FILTERS
========================================================== */

function buildFilterOptions() {
    if (!elements.filterContainer) return;

    const families = extractFamilies(allStandards);
    const counts = {};

    allStandards.forEach((standard) => {
        const family = standard.family.trim().replace(/\s+mapping$/, "");
        counts[family] = (counts[family] || 0) + 1;
    });

    elements.filterContainer.innerHTML = families
        .map((family) => {
            const id = `filter-${family.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;

            return `
                <label class="filter-option" for="${escapeHtml(id)}">
                    <input
                        type="checkbox"
                        id="${escapeHtml(id)}"
                        value="${escapeHtml(family)}"
                    >
                    <span>${escapeHtml(family)}</span>
                    <small>${counts[family] || 0}</small>
                </label>
            `;
        })
        .join("");

    elements.filterContainer.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                activeFilters.add(checkbox.value);
            } else {
                activeFilters.delete(checkbox.value);
            }

            processData();
        });
    });
}

/* ==========================================================
   VIEW TOGGLE
========================================================== */

function setView(view) {
    currentView = view;

    if (!elements.standardsGrid) return;

    elements.standardsGrid.classList.remove("grid-view", "list-view");
    elements.standardsGrid.classList.add(`${view}-view`);

    elements.gridViewBtn?.classList.toggle("active", view === "grid");
    elements.listViewBtn?.classList.toggle("active", view === "list");

    elements.gridViewBtn?.setAttribute("aria-pressed", view === "grid" ? "true" : "false");
    elements.listViewBtn?.setAttribute("aria-pressed", view === "list" ? "true" : "false");

    localStorage.setItem("isoViewPreference", view);

    const currentDisplayed = filteredStandards.slice(0, displayedCount);
    renderStandards(currentDisplayed, false);

    if (window.pradakoRefreshAnimations) {
        window.pradakoRefreshAnimations();
    }
}

/* ==========================================================
   CARD EVENTS
========================================================== */

function attachCardEventListeners() {
    document.querySelectorAll(".copy-standard-btn").forEach((button) => {
        if (button.dataset.listenerAttached === "true") return;

        button.dataset.listenerAttached = "true";

        button.addEventListener("click", (event) => {
            event.stopPropagation();

            const value = button.dataset.copy;
            if (value) copyToClipboard(value);
        });
    });

    document.querySelectorAll(".view-details-btn").forEach((button) => {
        if (button.dataset.listenerAttached === "true") return;

        button.dataset.listenerAttached = "true";

        button.addEventListener("click", () => {
            const iso = button.dataset.iso;
            if (iso) showStandardDetails(iso);
        });
    });

    document.querySelectorAll(".standard-card").forEach((card) => {
        if (card.dataset.cardListenerAttached === "true") return;

        card.dataset.cardListenerAttached = "true";

        card.addEventListener("click", (event) => {
            if (event.target.closest("button")) return;

            const iso = card.dataset.iso;
            if (iso) showStandardDetails(iso);
        });
    });
}

/* ==========================================================
   MODAL DETAILS
========================================================== */

function showStandardDetails(iso) {
    if (!elements.modal || !elements.modalBody) return;

    const standard = allStandards.find((item) => item.iso === iso);
    if (!standard) return;

    const cleanFamily = standard.family.trim().replace(/\s+mapping$/, "");

    elements.modalBody.innerHTML = `
        <div class="modal-standard-header">
            <span class="modal-standard-number">${escapeHtml(standard.iso)}</span>
            <span class="modal-family-badge">${escapeHtml(cleanFamily)}</span>
        </div>

        <h2>${escapeHtml(standard.title)}</h2>

        <div class="modal-detail-section">
            <h4>Product Family</h4>
            <p>${escapeHtml(cleanFamily)}</p>
        </div>

        <div class="modal-detail-section">
            <h4>Keywords / Use Area</h4>
            <p>${escapeHtml(standard.keywords)}</p>
        </div>

        <div class="modal-detail-actions">
            <button class="btn-primary modal-copy-btn" type="button" data-copy="${escapeHtml(standard.iso)}">
                <i class="fas fa-copy"></i>
                Copy Standard
            </button>

            <button class="btn-secondary modal-close-btn" type="button">
                Close
            </button>
        </div>
    `;

    elements.modal.style.display = "flex";
    elements.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const copyButton = elements.modalBody.querySelector(".modal-copy-btn");
    const closeButton = elements.modalBody.querySelector(".modal-close-btn");

    copyButton?.addEventListener("click", () => {
        copyToClipboard(standard.iso);
    });

    closeButton?.addEventListener("click", hideModal);
}

function hideModal() {
    if (!elements.modal) return;

    elements.modal.style.display = "none";
    elements.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

/* ==========================================================
   EXPORT POPUP
========================================================== */

function showExportPopup() {
    const existingPopup = document.querySelector(".export-popup");

    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement("div");
    popup.className = "export-popup";

    popup.innerHTML = `
        <div class="export-popup-content">
            <i class="fas fa-envelope"></i>

            <h3>Export Feature Coming Soon</h3>

            <p>We are currently working on the export functionality.</p>
            <p>For ISO standard downloads, bulk exports, or technical mapping support, please contact:</p>

            <a href="mailto:info@pradakomechanicals.com" class="export-email">
                info@pradakomechanicals.com
            </a>

            <button class="export-popup-close" type="button">Close</button>
        </div>
    `;

    const styleId = "iso-export-popup-style";

    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;

        style.textContent = `
            .export-popup {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.52);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 20000;
                backdrop-filter: blur(5px);
                padding: 20px;
            }

            .export-popup-content {
                width: min(100%, 430px);
                background: #ffffff;
                padding: 42px;
                border-radius: 22px;
                text-align: center;
                box-shadow: 0 30px 90px rgba(0, 0, 0, 0.28);
                animation: isoPopupUp 0.28s ease;
            }

            .export-popup-content i {
                font-size: 44px;
                color: #d6aa3b;
                margin-bottom: 18px;
            }

            .export-popup-content h3 {
                margin: 0 0 14px;
                color: #0A3D62;
            }

            .export-popup-content p {
                margin: 8px 0;
                color: #64748b;
                line-height: 1.65;
            }

            .export-email {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 18px 0 16px;
                padding: 12px 22px;
                background: #0A3D62;
                color: #ffffff;
                text-decoration: none;
                border-radius: 999px;
                font-weight: 700;
            }

            .export-popup-close {
                width: 100%;
                padding: 12px 18px;
                border: none;
                border-radius: 999px;
                background: #eef2f6;
                color: #0A3D62;
                font-weight: 700;
                cursor: pointer;
            }

            @keyframes isoPopupUp {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.98);
                }

                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;

        document.head.appendChild(style);
    }

    document.body.appendChild(popup);

    popup.querySelector(".export-popup-close")?.addEventListener("click", () => {
        popup.remove();
    });

    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            popup.remove();
        }
    });
}

function exportToCSV() {
    showExportPopup();
}

/* ==========================================================
   URL PARAMETER HANDLING
========================================================== */

function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const isoParam = urlParams.get("iso");

    if (!isoParam) return;

    currentSearchTerm = isoParam;

    if (elements.searchInput) {
        elements.searchInput.value = isoParam;
    }

    if (elements.clearSearch) {
        elements.clearSearch.classList.add("visible");
    }

    processData();
    showToast(`Searching for ISO: ${isoParam}`, "info");
}

/* ==========================================================
   EVENT LISTENERS
========================================================== */

function initEventListeners() {
    elements.searchInput?.addEventListener(
        "input",
        debounce((event) => {
            currentSearchTerm = event.target.value.trim();

            if (currentSearchTerm) {
                elements.clearSearch?.classList.add("visible");
            } else {
                elements.clearSearch?.classList.remove("visible");
            }

            processData();
        }, 250)
    );

    elements.clearSearch?.addEventListener("click", clearSearch);

    elements.sortSelect?.addEventListener("change", (event) => {
        currentSort = event.target.value;
        processData();

        const selectedText =
            elements.sortSelect.options[elements.sortSelect.selectedIndex]?.text || "selected order";

        showToast(`Sorted by: ${selectedText}`, "info");
    });

    elements.gridViewBtn?.addEventListener("click", () => setView("grid"));
    elements.listViewBtn?.addEventListener("click", () => setView("list"));

    elements.exportBtn?.addEventListener("click", exportToCSV);
    elements.loadMoreBtn?.addEventListener("click", loadMoreStandards);

    elements.activeFilters?.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-remove-filter]");
        if (!removeButton) return;

        removeFilter(removeButton.dataset.removeFilter);
    });

    document.addEventListener("click", (event) => {
        const activeFilter = event.target.closest(".active-filter");

        if (!activeFilter) return;

        const removeValue = activeFilter.dataset.removeFilter;

        if (removeValue) {
            removeFilter(removeValue);
        }
    });

    elements.modalClose?.addEventListener("click", hideModal);

    if (elements.modal) {
        elements.modal.addEventListener("click", (event) => {
            if (event.target === elements.modal) {
                hideModal();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            hideModal();
        }
    });
}

/* ==========================================================
   PREFERENCES
========================================================== */

function loadPreferences() {
    const savedView = localStorage.getItem("isoViewPreference");

    if (savedView === "list") {
        currentView = "list";
    } else {
        currentView = "grid";
    }

    if (elements.standardsGrid) {
        elements.standardsGrid.classList.remove("grid-view", "list-view");
        elements.standardsGrid.classList.add(`${currentView}-view`);
    }

    elements.gridViewBtn?.classList.toggle("active", currentView === "grid");
    elements.listViewBtn?.classList.toggle("active", currentView === "list");
}

/* ==========================================================
   INITIALIZATION
========================================================== */

function loadData() {
    try {
        allStandards = removeDuplicates(EMBEDDED_STANDARDS_DATA);
        filteredStandards = [...allStandards];

        const totalCountEl = document.getElementById("total-standards-count");

        if (totalCountEl) {
            totalCountEl.textContent = allStandards.length;
        }

        buildFilterOptions();
        setupAutocomplete();
        processData();
        handleURLParams();

        showToast(`Loaded ${allStandards.length} ISO standards`, "success");
    } catch (error) {
        console.error("Error loading ISO standards data:", error);
        showToast("Failed to load ISO standards data", "error");
    }
}

function init() {
    cacheElements();
    loadPreferences();
    initEventListeners();
    loadData();
}

document.addEventListener("DOMContentLoaded", init);