(function (window, document) {
    "use strict";

    if (window.__PMEW_COOKIE_CONSENT_UI__) return;
    window.__PMEW_COOKIE_CONSENT_UI__ = true;

    const currentScript = document.currentScript;
    let coreRequested = false;
    let uiInitialised = false;
    let lastFocusedElement = null;

    function core() {
        const service = window.PMEW_COOKIE_CONSENT;
        return service &&
            typeof service.getConsent === "function" &&
            typeof service.saveConsent === "function"
            ? service
            : null;
    }

    function coreScriptUrl() {
        if (currentScript && currentScript.src) {
            return currentScript.src.replace(/cookies\.js(?:[?#].*)?$/i, "/assets/js/cookie-consent-init.js");
        }
        return "/assets/js/cookie-consent-init.js";
    }

    function ensureConsentCore() {
        if (core() || coreRequested) return;
        coreRequested = true;

        const existing = Array.from(document.scripts).some((script) =>
            /(?:^|\/)cookie-consent-init\.js(?:[?#]|$)/i.test(script.src || "")
        );
        if (existing) return;

        const loader = document.createElement("script");
        loader.src = coreScriptUrl();
        loader.async = false;
        loader.dataset.pmewCookieCoreBootstrap = "/assets/js/cookies.js";
        loader.addEventListener("error", () => {
            console.error("[PMEW] cookies.js could not load cookie-consent-init.js.");
        }, { once: true });
        (document.head || document.documentElement).appendChild(loader);
    }

    function initCookieConsentUi() {
        if (uiInitialised) return;

        const consentCore = core();
        if (!consentCore) {
            ensureConsentCore();
            return;
        }

        const banner = document.getElementById("pmewCookieBanner");
        const overlay = document.getElementById("pmewCookieOverlay");
        const panel = document.getElementById("pmewCookiePanel");
        const settingsButton = document.getElementById("pmewCookieSettingsButton");
        const acceptButton = document.getElementById("pmewAcceptCookies");
        const rejectButton = document.getElementById("pmewRejectCookies");
        const manageButton = document.getElementById("pmewManageCookies");
        const closePanelButton = document.getElementById("pmewCloseCookiePanel");
        const panelAcceptButton = document.getElementById("pmewPanelAcceptCookies");
        const panelRejectButton = document.getElementById("pmewPanelRejectCookies");
        const savePreferencesButton = document.getElementById("pmewSaveCookiePreferences");
        const preferenceCheckbox = document.getElementById("pmewPreferenceCookies");
        const analyticsCheckbox = document.getElementById("pmewAnalyticsCookies");
        const marketingCheckbox = document.getElementById("pmewMarketingCookies");

        /* Not every page has the consent UI markup. The core still runs safely. */
        if (!banner || !settingsButton) return;

        uiInitialised = true;

        function showBanner() {
            banner.classList.add("pmew-cookie-banner--visible");
            banner.setAttribute("aria-hidden", "false");
            settingsButton.classList.remove("pmew-cookie-settings-button--visible");
        }

        function hideBanner() {
            banner.classList.remove("pmew-cookie-banner--visible");
            banner.setAttribute("aria-hidden", "true");
        }

        function showSettingsButton() {
            settingsButton.classList.add("pmew-cookie-settings-button--visible");
        }

        function populatePanel(consent) {
            if (preferenceCheckbox) preferenceCheckbox.checked = Boolean(consent && consent.preferences);
            if (analyticsCheckbox) analyticsCheckbox.checked = Boolean(consent && consent.analytics);
            if (marketingCheckbox) marketingCheckbox.checked = Boolean(consent && consent.marketing);
        }

        function openPanel() {
            if (!panel || !overlay) return;
            lastFocusedElement = document.activeElement;
            populatePanel(consentCore.getConsent());

            panel.classList.add("pmew-cookie-panel--visible");
            overlay.classList.add("pmew-cookie-overlay--visible");
            panel.setAttribute("aria-hidden", "false");
            overlay.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";

            window.setTimeout(() => closePanelButton?.focus(), 100);
        }

        function closePanel() {
            if (!panel || !overlay) return;
            panel.classList.remove("pmew-cookie-panel--visible");
            overlay.classList.remove("pmew-cookie-overlay--visible");
            panel.setAttribute("aria-hidden", "true");
            overlay.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";

            if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
                lastFocusedElement.focus();
            }
        }

        function finishConsent(consent) {
            hideBanner();
            closePanel();
            populatePanel(consent);
            showSettingsButton();
        }

        function acceptAllCookies() {
            finishConsent(consentCore.saveConsent({
                preferences: true,
                analytics: true,
                marketing: true
            }));
        }

        function rejectOptionalCookies() {
            finishConsent(consentCore.saveConsent({
                preferences: false,
                analytics: false,
                marketing: false
            }));
        }

        function saveSelectedPreferences() {
            finishConsent(consentCore.saveConsent({
                preferences: Boolean(preferenceCheckbox?.checked),
                analytics: Boolean(analyticsCheckbox?.checked),
                marketing: Boolean(marketingCheckbox?.checked)
            }));
        }

        function handlePanelKeyboard(event) {
            if (!panel || !panel.classList.contains("pmew-cookie-panel--visible")) return;

            if (event.key === "Escape") {
                closePanel();
                return;
            }
            if (event.key !== "Tab") return;

            const focusableElements = panel.querySelectorAll([
                "button:not([disabled])",
                "input:not([disabled])",
                "a[href]",
                "[tabindex]:not([tabindex='-1'])"
            ].join(","));

            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }

        acceptButton?.addEventListener("click", acceptAllCookies);
        rejectButton?.addEventListener("click", rejectOptionalCookies);
        manageButton?.addEventListener("click", openPanel);
        settingsButton.addEventListener("click", openPanel);
        closePanelButton?.addEventListener("click", closePanel);
        overlay?.addEventListener("click", closePanel);
        panelAcceptButton?.addEventListener("click", acceptAllCookies);
        panelRejectButton?.addEventListener("click", rejectOptionalCookies);
        savePreferencesButton?.addEventListener("click", saveSelectedPreferences);
        document.addEventListener("keydown", handlePanelKeyboard);

        const savedConsent = consentCore.getConsent();
        if (savedConsent) {
            populatePanel(savedConsent);
            consentCore.applyConsent(savedConsent, "update");
            showSettingsButton();
            return;
        }

        window.setTimeout(showBanner, 700);
    }

    window.addEventListener("pmew:cookieConsentReady", initCookieConsentUi, { once: true });

    function boot() {
        if (core()) initCookieConsentUi();
        else ensureConsentCore();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

}(window, document));
