(function () {
    "use strict";

    const app = document.getElementById("allStandardsCrossReferenceApp");

    if (!app) return;

    const mount = document.getElementById("pmew-cross-reference-section-loader");
    const loadingState = document.getElementById("allStandardsCrossReferenceLoading");
    const errorState = document.getElementById("allStandardsCrossReferenceError");
    const errorText = document.getElementById("allStandardsCrossReferenceErrorText");
    const retryButton = document.getElementById("allStandardsCrossReferenceRetry");
    const backToTopButton = document.getElementById("allStandardsBackToTop");

    const sharedScript = app.dataset.sharedScript || "/assets/js/cross-reference-guide.js";
    const productsPage =
        app.dataset.productsPage ||
        "/pages/products/products.html#pmew-cross-reference-section-loader";

    let ready = false;
    let observer = null;
    let timeoutId = 0;
    let queryTimer = 0;

    function cleanText(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function hasRenderedContent() {
        if (!mount) return false;

        const meaningfulElement = mount.querySelector(
            "section, article, table, form, input, select, [class*='cross'], [class*='reference']"
        );

        if (meaningfulElement) return true;

        return cleanText(mount.textContent).length > 80;
    }

    function hideLoading() {
        if (loadingState) {
            loadingState.hidden = true;
            loadingState.setAttribute("aria-busy", "false");
        }
    }

    function hideError() {
        if (errorState) errorState.hidden = true;
    }

    function markReady() {
        if (ready || !hasRenderedContent()) return;

        ready = true;
        window.clearTimeout(timeoutId);
        hideLoading();
        hideError();
        app.classList.add("is-ready");

        if (observer) {
            observer.disconnect();
            observer = null;
        }

        applyQueryFromUrl();
        attachUrlStateSupport();
    }

    function showError(message) {
        if (ready) return;

        hideLoading();
        app.classList.add("has-error");

        if (errorState) errorState.hidden = false;

        if (errorText) {
            errorText.textContent = message ||
                `The shared module ${sharedScript} did not render the guide. ` +
                "Confirm that the file exists and that this page is opened through your website server.";
        }
    }

    function applyQueryFromUrl() {
        if (!mount) return;

        const params = new URLSearchParams(window.location.search);
        const query = cleanText(params.get("q"));

        if (!query) return;

        const searchInput = Array.from(
            mount.querySelectorAll(
                "input[type='search'], input[data-search], input[id*='search' i], input[placeholder*='search' i]"
            )
        ).find(input => !input.disabled && input.offsetParent !== null) ||
            mount.querySelector(
                "input[type='search'], input[data-search], input[id*='search' i], input[placeholder*='search' i]"
            );

        if (!searchInput) return;

        searchInput.value = query;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
        searchInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function updateUrlQuery(value) {
        const url = new URL(window.location.href);
        const query = cleanText(value);

        if (query) {
            url.searchParams.set("q", query);
        } else {
            url.searchParams.delete("q");
        }

        window.history.replaceState({}, "", url);
    }

    function attachUrlStateSupport() {
        if (!mount || mount.dataset.independentUrlStateReady === "true") return;

        mount.dataset.independentUrlStateReady = "true";

        mount.addEventListener("input", event => {
            const input = event.target.closest(
                "input[type='search'], input[data-search], input[id*='search' i], input[placeholder*='search' i]"
            );

            if (!input || !mount.contains(input)) return;

            window.clearTimeout(queryTimer);
            queryTimer = window.setTimeout(() => {
                updateUrlQuery(input.value);
            }, 180);
        });
    }

    function startRenderWatch() {
        if (!mount) {
            showError(
                "The required #pmew-cross-reference-section-loader mount is missing from this page."
            );
            return;
        }

        markReady();

        if (ready) return;

        observer = new MutationObserver(markReady);
        observer.observe(mount, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });

        timeoutId = window.setTimeout(() => {
            markReady();

            if (!ready) {
                showError(
                    `No cross-reference content was rendered by ${sharedScript}. ` +
                    "Check the shared script path, its data dependencies and the browser console."
                );
            }
        }, 12000);
    }

    function initialiseBackToTop() {
        if (!backToTopButton) return;

        const updateVisibility = () => {
            backToTopButton.classList.toggle(
                "is-visible",
                window.scrollY > 520
            );
        };

        window.addEventListener("scroll", updateVisibility, { passive: true });
        updateVisibility();

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth"
            });
        });
    }

    if (retryButton) {
        retryButton.addEventListener("click", () => {
            window.location.reload();
        });
    }

    /*
        Keep the source link available to the error state without inserting any
        source data into this page.
    */
    const sourceLink = errorState ? errorState.querySelector("a") : null;

    if (sourceLink) {
        sourceLink.href = productsPage;
    }

    startRenderWatch();
    initialiseBackToTop();
})();
