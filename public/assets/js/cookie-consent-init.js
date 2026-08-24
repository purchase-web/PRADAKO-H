(function (window, document) {
    "use strict";

    if (window.__PMEW_COOKIE_CONSENT_CORE__) return;
    window.__PMEW_COOKIE_CONSENT_CORE__ = true;

    const COOKIE_NAME = "pmew_cookie_consent";
    const LEGACY_STORAGE_KEY = "pmew_cookie_consent";
    const CONSENT_VERSION = "1.0";
    const CONSENT_DURATION_DAYS = 180;
    const MAX_AGE_SECONDS = CONSENT_DURATION_DAYS * 24 * 60 * 60;
    const MAX_AGE_MS = MAX_AGE_SECONDS * 1000;

    const DEFAULT_CONSENT = Object.freeze({
        version: CONSENT_VERSION,
        necessary: true,
        preferences: false,
        analytics: false,
        marketing: false,
        savedAt: null,
        updatedAt: null
    });

    function normaliseConsent(value) {
        const savedAt = Number(value && value.savedAt) || null;
        const updatedAt = value && value.updatedAt
            ? String(value.updatedAt)
            : (savedAt ? new Date(savedAt).toISOString() : null);

        return {
            version: CONSENT_VERSION,
            necessary: true,
            preferences: Boolean(value && value.preferences),
            analytics: Boolean(value && value.analytics),
            marketing: Boolean(value && value.marketing),
            savedAt,
            updatedAt
        };
    }

    function isValidConsent(value) {
        if (!value || value.version !== CONSENT_VERSION) return false;

        const savedAt = Number(value.savedAt);
        if (!savedAt || !Number.isFinite(savedAt)) return false;
        if (Date.now() - savedAt > MAX_AGE_MS) return false;

        return true;
    }

    function readCookie(name) {
        const prefix = name + "=";
        const part = document.cookie
            .split(";")
            .map((item) => item.trim())
            .find((item) => item.indexOf(prefix) === 0);

        return part ? part.substring(prefix.length) : null;
    }

    function readCookieConsent() {
        try {
            const encoded = readCookie(COOKIE_NAME);
            if (!encoded) return null;

            const parsed = JSON.parse(decodeURIComponent(encoded));
            return isValidConsent(parsed) ? normaliseConsent(parsed) : null;
        } catch (error) {
            console.warn("PMEW cookie consent could not be read:", error);
            return null;
        }
    }

    function writeCookieConsent(consent) {
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
        document.cookie =
            COOKIE_NAME + "=" + encodeURIComponent(JSON.stringify(consent)) +
            "; Path=/; Max-Age=" + MAX_AGE_SECONDS +
            "; SameSite=Lax" + secure;
    }

    function readLegacyLocalStorageConsent() {
        try {
            const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (!isValidConsent(parsed)) {
                window.localStorage.removeItem(LEGACY_STORAGE_KEY);
                return null;
            }

            return normaliseConsent(parsed);
        } catch (error) {
            return null;
        }
    }

    function removeLegacyLocalStorageConsent() {
        try { window.localStorage.removeItem(LEGACY_STORAGE_KEY); }
        catch (error) { /* storage may be unavailable */ }
    }

    function getSavedConsent() {
        const cookieConsent = readCookieConsent();
        if (cookieConsent) return cookieConsent;

        /* One-time migration from the previous localStorage implementation. */
        const legacyConsent = readLegacyLocalStorageConsent();
        if (legacyConsent) {
            try {
                writeCookieConsent(legacyConsent);
                removeLegacyLocalStorageConsent();
            } catch (error) {
                console.warn("PMEW cookie consent migration could not be completed:", error);
            }
            return legacyConsent;
        }

        return null;
    }

    function consentModePayload(consent) {
        return {
            security_storage: "granted",
            functionality_storage: consent.preferences ? "granted" : "denied",
            personalization_storage: consent.preferences ? "granted" : "denied",
            analytics_storage: consent.analytics ? "granted" : "denied",
            ad_storage: consent.marketing ? "granted" : "denied",
            ad_user_data: consent.marketing ? "granted" : "denied",
            ad_personalization: consent.marketing ? "granted" : "denied"
        };
    }

    function ensureGtag() {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };
    }

    function applyDocumentConsent(consent) {
        document.documentElement.dataset.pmewPreferences = consent.preferences ? "granted" : "denied";
        document.documentElement.dataset.pmewAnalytics = consent.analytics ? "granted" : "denied";
        document.documentElement.dataset.pmewMarketing = consent.marketing ? "granted" : "denied";
    }

    function applyConsent(consent, command) {
        const normalised = normaliseConsent(consent || DEFAULT_CONSENT);
        applyDocumentConsent(normalised);
        ensureGtag();

        const payload = consentModePayload(normalised);
        if ((command || "update") === "default") payload.wait_for_update = 500;
        window.gtag("consent", command || "update", payload);

        return normalised;
    }

    function saveConsent(preferences) {
        const now = Date.now();
        const consent = normaliseConsent({
            ...preferences,
            version: CONSENT_VERSION,
            necessary: true,
            savedAt: now,
            updatedAt: new Date(now).toISOString()
        });

        try {
            writeCookieConsent(consent);
            removeLegacyLocalStorageConsent();
        } catch (error) {
            console.warn("Unable to save PMEW cookie preferences:", error);
        }

        applyConsent(consent, "update");

        window.PMEW_COOKIE_CONSENT.hasChoice = true;
        window.PMEW_COOKIE_CONSENT.consent = consent;

        window.dispatchEvent(new CustomEvent("pmew:cookieConsentChanged", {
            detail: consent
        }));

        return consent;
    }

    const savedConsent = getSavedConsent();
    const effectiveConsent = savedConsent || normaliseConsent(DEFAULT_CONSENT);

    window.PMEW_COOKIE_CONSENT = {
        cookieName: COOKIE_NAME,
        version: CONSENT_VERSION,
        durationDays: CONSENT_DURATION_DAYS,
        hasChoice: Boolean(savedConsent),
        consent: effectiveConsent,
        defaults: { ...DEFAULT_CONSENT },
        getConsent: getSavedConsent,
        saveConsent,
        applyConsent
    };

    /* Consent Mode must be established as early as possible on every page. */
    applyConsent(effectiveConsent, "default");

    window.dispatchEvent(new CustomEvent("pmew:cookieConsentReady", {
        detail: window.PMEW_COOKIE_CONSENT
    }));

}(window, document));
