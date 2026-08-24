(() => {
    "use strict";

    const app = document.getElementById("standardsApp");

    if (!app) return;

    const sourcePage = app.dataset.sourcePage || "/pages/products/products.html";
    const sourceSelector = app.dataset.sourceSelector ||
        "#list .pradako-products-standards-grid";

    const grid = document.getElementById("standardsGrid");
    const searchInput = document.getElementById("standardsSearch");
    const clearButton = document.getElementById("standardsSearchClear");
    const status = document.getElementById("standardsStatus");
    const count = document.getElementById("standardsCount");
    const emptyState = document.getElementById("standardsEmpty");
    const errorState = document.getElementById("standardsError");
    const errorText = document.getElementById("standardsErrorText");
    const retryButton = document.getElementById("standardsRetry");
    const sourceLink = document.getElementById("standardsSourceLink");
    const backToTop = document.getElementById("standardsBackToTop");
    const viewButtons = Array.from(
        document.querySelectorAll("[data-standards-view]")
    );

    let cards = [];
    let currentView = "grid";
    let sourceUrl = "";

    function normalise(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function pluralise(total) {
        return `${total} ${total === 1 ? "standard" : "standards"}`;
    }

    function safeUrl(value, baseUrl, options = {}) {
        const raw = String(value || "").trim();

        if (!raw) return "";
        if (raw.startsWith("#")) return raw;
        if (/^(data:|mailto:|tel:)/i.test(raw)) return raw;

        try {
            const resolved = new URL(raw, baseUrl);
            const allowedProtocols = options.image
                ? ["http:", "https:", "data:"]
                : ["http:", "https:", "mailto:", "tel:"];

            return allowedProtocols.includes(resolved.protocol)
                ? resolved.href
                : "";
        } catch (error) {
            return "";
        }
    }

    function sanitiseImportedCard(sourceCard, baseUrl) {
        const card = sourceCard.cloneNode(true);

        card.querySelectorAll("script, iframe, object, embed").forEach(node => {
            node.remove();
        });

        [card, ...card.querySelectorAll("*")].forEach(element => {
            Array.from(element.attributes || []).forEach(attribute => {
                if (/^on/i.test(attribute.name)) {
                    element.removeAttribute(attribute.name);
                }
            });
        });

        const resolvedHref = safeUrl(card.getAttribute("href"), baseUrl);

        if (!resolvedHref) {
            card.removeAttribute("href");
            card.setAttribute("aria-disabled", "true");
        } else {
            card.setAttribute("href", resolvedHref);
        }

        if (card.getAttribute("target") === "_blank") {
            card.setAttribute("rel", "noopener noreferrer");
        }

        card.querySelectorAll("img").forEach(image => {
            const resolvedSrc = safeUrl(image.getAttribute("src"), baseUrl, {
                image: true
            });

            if (resolvedSrc) {
                image.setAttribute("src", resolvedSrc);
            } else {
                image.removeAttribute("src");
            }

            const srcset = image.getAttribute("srcset");

            if (srcset) {
                const resolvedSet = srcset
                    .split(",")
                    .map(item => {
                        const parts = item.trim().split(/\s+/);
                        const url = safeUrl(parts[0], baseUrl, { image: true });
                        return url ? [url, ...parts.slice(1)].join(" ") : "";
                    })
                    .filter(Boolean)
                    .join(", ");

                if (resolvedSet) {
                    image.setAttribute("srcset", resolvedSet);
                } else {
                    image.removeAttribute("srcset");
                }
            }

            image.loading = "lazy";
            image.decoding = "async";
        });

        const searchableText = [
            card.textContent,
            card.getAttribute("href"),
            ...Array.from(card.querySelectorAll("img")).map(image => image.alt)
        ].join(" ");

        card.dataset.standardSearch = normalise(searchableText);
        card.classList.add("pmew-imported-standard-card");

        return card;
    }

    function getQueryFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get("q") || "";
    }

    function getViewFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const requestedView = params.get("view");
        return requestedView === "list" ? "list" : "grid";
    }

    function updateUrlState() {
        const url = new URL(window.location.href);
        const query = searchInput ? searchInput.value.trim() : "";

        if (query) {
            url.searchParams.set("q", query);
        } else {
            url.searchParams.delete("q");
        }

        if (currentView === "list") {
            url.searchParams.set("view", "list");
        } else {
            url.searchParams.delete("view");
        }

        window.history.replaceState({}, "", url);
    }

    function setView(view, updateUrl = true) {
        currentView = view === "list" ? "list" : "grid";

        grid.classList.toggle("list-view", currentView === "list");
        grid.classList.toggle("grid-view", currentView === "grid");

        viewButtons.forEach(button => {
            const active = button.dataset.standardsView === currentView;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        try {
            window.localStorage.setItem("pmewStandardsView", currentView);
        } catch (error) {
            // Storage can be unavailable in private browsing; the view still works.
        }

        if (updateUrl) updateUrlState();
    }

    function applySearch(updateUrl = true) {
        const query = normalise(searchInput ? searchInput.value : "");
        let visible = 0;

        cards.forEach(card => {
            const matches = !query || card.dataset.standardSearch.includes(query);
            card.classList.toggle("standards-card-hidden", !matches);

            if (matches) visible += 1;
        });

        if (clearButton) {
            const hasValue = Boolean(searchInput && searchInput.value.trim());
            clearButton.classList.toggle("is-hidden", !hasValue);
        }

        if (count) count.textContent = pluralise(visible);

        if (status) {
            status.textContent = query
                ? `${visible} result${visible === 1 ? "" : "s"} for “${searchInput.value.trim()}”.`
                : `Showing all ${cards.length} standards loaded from the Products page.`;
        }

        if (emptyState) {
            emptyState.hidden = visible !== 0 || cards.length === 0;
        }

        if (updateUrl) updateUrlState();
    }

    function showLoading() {
        grid.setAttribute("aria-busy", "true");
        grid.classList.remove("is-loaded");

        if (errorState) errorState.hidden = true;
        if (emptyState) emptyState.hidden = true;
        if (status) status.textContent = "Loading standards from the Products page...";
        if (count) count.textContent = "0 standards";
    }

    function showError(error) {
        cards = [];
        grid.replaceChildren();
        grid.setAttribute("aria-busy", "false");

        if (status) status.textContent = "The standards directory could not be loaded.";
        if (count) count.textContent = "0 standards";
        if (emptyState) emptyState.hidden = true;

        if (errorText) {
            errorText.textContent = error && error.message
                ? error.message
                : "Confirm that the Products page is available and try again.";
        }

        if (errorState) errorState.hidden = false;
    }

    async function loadStandards() {
        showLoading();

        try {
            sourceUrl = new URL(sourcePage, window.location.href).href;

            const currentUrl = new URL(window.location.href);
            const requestedUrl = new URL(sourceUrl);

            if (
                currentUrl.origin === requestedUrl.origin &&
                currentUrl.pathname === requestedUrl.pathname
            ) {
                throw new Error(
                    "The source page points to this same page. Set data-source-page to your Products page URL."
                );
            }

            const response = await fetch(sourceUrl, {
                method: "GET",
                credentials: "same-origin",
                cache: "no-cache",
                headers: {
                    Accept: "text/html,application/xhtml+xml"
                }
            });

            if (!response.ok) {
                throw new Error(
                    `The Products page returned HTTP ${response.status}. Check data-source-page="${sourcePage}".`
                );
            }

            const html = await response.text();
            const sourceDocument = new DOMParser().parseFromString(html, "text/html");
            const sourceGrid = sourceDocument.querySelector(sourceSelector);

            if (!sourceGrid) {
                throw new Error(
                    `The selector “${sourceSelector}” was not found in ${sourcePage}. Keep the existing #list section on the Products page or update data-source-selector.`
                );
            }

            const sourceCards = Array.from(
                sourceGrid.querySelectorAll(":scope > .pradako-products-standard-card-link")
            );

            if (!sourceCards.length) {
                throw new Error(
                    "The Products page List of Standards section does not contain any standard cards."
                );
            }

            const baseUrl = response.url || sourceUrl;
            const importedCards = sourceCards.map(card =>
                sanitiseImportedCard(card, baseUrl)
            );

            grid.replaceChildren(...importedCards);
            cards = importedCards;

            grid.setAttribute("aria-busy", "false");
            grid.classList.add("is-loaded");

            if (errorState) errorState.hidden = true;

            if (sourceLink) {
                sourceLink.href = `${sourceUrl.split("#")[0]}#list`;
            }

            const urlQuery = getQueryFromUrl();

            if (searchInput && urlQuery && !searchInput.value) {
                searchInput.value = urlQuery;
            }

            applySearch(false);
            setView(currentView, false);
            updateUrlState();
        } catch (error) {
            console.error("List of Standards load failed:", error);
            showError(error);
        }
    }

    function initialiseView() {
        const urlView = getViewFromUrl();
        let storedView = "";

        try {
            storedView = window.localStorage.getItem("pmewStandardsView") || "";
        } catch (error) {
            storedView = "";
        }

        currentView = urlView === "list"
            ? "list"
            : storedView === "list"
                ? "list"
                : "grid";

        setView(currentView, false);
    }

    if (searchInput) {
        let searchTimer = 0;

        searchInput.addEventListener("input", () => {
            window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(() => applySearch(), 90);
        });

        searchInput.addEventListener("search", () => applySearch());

        searchInput.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                searchInput.value = "";
                applySearch();
                searchInput.focus();
            }
        });
    }

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            if (!searchInput) return;
            searchInput.value = "";
            applySearch();
            searchInput.focus();
        });
    }

    viewButtons.forEach(button => {
        button.addEventListener("click", () => {
            setView(button.dataset.standardsView);
        });
    });

    if (retryButton) {
        retryButton.addEventListener("click", loadStandards);
    }

    if (backToTop) {
        const updateBackToTop = () => {
            backToTop.classList.toggle("is-visible", window.scrollY > 550);
        };

        window.addEventListener("scroll", updateBackToTop, { passive: true });
        updateBackToTop();

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    initialiseView();
    loadStandards();
})();
