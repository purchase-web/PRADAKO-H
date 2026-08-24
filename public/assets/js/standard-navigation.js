/*
 * PMEW UNIVERSAL STANDARD NAVIGATION — V15 FAST
 * --------------------------------------------------------------
 * This version replaces the V14 MutationObserver implementation.
 *
 * Performance rules:
 * 1. No attribute observation.
 * 2. No full standards-index load during first paint.
 * 3. No page-existence network checks during page load.
 * 4. Legacy authority-table hrefs are converted to the PMEW preparation
 *    route using a cheap DOM-only pass.
 * 5. The large standard-page index is loaded only when the browser is idle
 *    or when the user first interacts with a standard.
 * 6. Actual file-existence checks happen only when the user clicks a
 *    standard that is not already known in the index.
 * 7. Dynamically inserted Product cards are handled by a childList-only
 *    MutationObserver, so V15 cannot observe or retrigger its own href edits.
 * -------------------------------------------------------------- */
(function (window, document) {
    "use strict";

    if (
        window.PMEWStandardNavigation &&
        window.PMEWStandardNavigation.__v15
    ) {
        return;
    }

    var INDEX_SCRIPT = "/assets/js/standard-page-index.js";
    var PREPARATION_PAGE = "/pages/standards/reference-in-preparation.html";

    var CACHE_PREFIX = "pmew-standard-probe-v15:";
    var MISSING_ANALYTICS_KEY = "pmew-missing-standard-clicks-v1";

    var POSITIVE_TTL = 60 * 60 * 1000;
    var NEGATIVE_TTL = /^(?:localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(
        window.location.hostname
    ) ? 5 * 1000 : 60 * 1000;

    var indexPromise = null;
    var authorityHtmlCache = Object.create(null);

    var AUTHORITIES = [
        { key: "as-nzs", regex: /^(?:AS\/NZS|AS\s*\/\s*NZS|AS NZS|AS-NZS|AS(?=\s+\d))/i, folders: ["australia"], label: "Australian / New Zealand Standards", browse: "/pages/standards/australia/index.html" },
        { key: "asme", regex: /^ASME\b/i, folders: ["asme"], label: "ASME Standards", browse: "/pages/standards/asme/index.html" },
        { key: "ansi", regex: /^ANSI\b/i, folders: ["ansi-asme-astm-ifi-sae", "asme"], label: "ANSI Standards", browse: "/pages/standards/ansi-asme-astm-ifi-sae/index.html" },
        { key: "astm", regex: /^ASTM\b/i, folders: ["astm"], label: "ASTM Standards", browse: "/pages/standards/astm/index.html" },
        { key: "bsi", regex: /^(?:BSI|BS)\b/i, folders: ["bsi"], label: "British Standards / BSI", browse: "/pages/standards/bsi/index.html" },
        { key: "cen", regex: /^(?:CEN|EN)\b/i, folders: ["en"], label: "European Standards / CEN", browse: "/pages/standards/en/index.html" },
        { key: "csn", regex: /^(?:CSN|ČSN)\b/i, folders: ["csn"], label: "Czech Standards / ČSN", browse: "/pages/standards/csn/index.html" },
        { key: "dast", regex: /^DAST\b/i, folders: ["dast"], label: "DASt Standards", browse: "/pages/standards/dast/index.html" },
        { key: "din", regex: /^DIN\b/i, folders: ["din"], label: "DIN Standards", browse: "/pages/standards/din/index.html" },
        { key: "ds", regex: /^DS\b/i, folders: ["ds"], label: "Danish Standards", browse: "/pages/standards/ds/index.html" },
        { key: "gost", regex: /^(?:GOST\s*R|GOST)\b/i, folders: ["gost"], label: "GOST Standards", browse: "/pages/standards/gost/index.html" },
        { key: "gso", regex: /^GSO\b/i, folders: ["gso"], label: "GSO Standards", browse: "/pages/standards/gso/index.html" },
        { key: "is", regex: /^IS\b/i, folders: ["is"], label: "Indian Standards / BIS", browse: "/pages/standards/is/index.html" },
        { key: "iso", regex: /^ISO\b/i, folders: ["iso"], label: "ISO Standards", browse: "/pages/standards/iso/index.html" },
        { key: "jis", regex: /^JIS\b/i, folders: ["jis"], label: "Japanese Industrial Standards", browse: "/pages/standards/jis/index.html" },
        { key: "mil-ms", regex: /^(?:MIL|MS|FED)\b/i, folders: ["mil-ms-fed"], label: "MIL / MS / Federal Standards", browse: "/pages/standards/mil-ms-fed/index.html" },
        { key: "nas", regex: /^(?:NASM|NAS)\b/i, folders: ["aia-nas"], label: "NAS / Aerospace Standards", browse: "/pages/standards/aia-nas/index.html" },
        { key: "nen", regex: /^NEN\b/i, folders: ["nen"], label: "Dutch Standards / NEN", browse: "/pages/standards/nen/index.html" },
        { key: "nf", regex: /^(?:NF|AFNOR)\b/i, folders: ["nf"], label: "French Standards / AFNOR", browse: "/pages/standards/nf/index.html" },
        { key: "pn", regex: /^PN\b/i, folders: ["pn"], label: "Polish Standards / PN", browse: "/pages/standards/pn/index.html" },
        { key: "sae", regex: /^SAE\b/i, folders: ["sae"], label: "SAE Standards", browse: "/pages/standards/sae/index.html" },
        { key: "sfs", regex: /^SFS\b/i, folders: ["sfs"], label: "Finnish Standards / SFS", browse: "/pages/standards/sfs/index.html" },
        { key: "sn-snv", regex: /^(?:SNV|SN)\b/i, folders: ["sn-snv"], label: "Swiss Standards / SNV", browse: "/pages/standards/sn-snv/index.html" },
        { key: "une", regex: /^UNE\b/i, folders: ["une"], label: "Spanish Standards / UNE", browse: "/pages/standards/une/index.html" },
        { key: "uni", regex: /^UNI\b/i, folders: ["uni"], label: "Italian Standards / UNI", browse: "/pages/standards/uni/index.html" },
        { key: "bds", regex: /^BDS\b/i, folders: ["bds"], label: "Bangladesh Standards / BDS", browse: "/pages/standards/bds/index.html" }
    ];

    function clean(value) {
        return String(value == null ? "" : value)
            .replace(/\s+/g, " ")
            .trim();
    }

    function canonicalDesignation(value) {
        return clean(value)
            .replace(/\s+\([^()]*[A-Za-z][^()]*\)\s*$/g, "")
            .replace(/\s+(?:HDG|BOLT|NUT|WASHER)\s*$/gi, "")
            .replace(/\s+[—–]\s+.*$/g, "")
            .replace(/\s+-\s+.*$/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function routeKey(value) {
        return canonicalDesignation(value)
            .toUpperCase()
            .replace(/ГОСТ/g, "GOST")
            .replace(/ИСО/g, "ISO")
            .replace(/БДС/g, "BDS")
            .replace(/ČSN/g, "CSN")
            .replace(/[^A-Z0-9]+/g, "");
    }

    function slugify(value) {
        return canonicalDesignation(value)
            .toLowerCase()
            .replace(/&/g, " and ")
            .replace(/\+/g, " plus ")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function detectAuthority(value) {
        var text = canonicalDesignation(value);

        for (var i = 0; i < AUTHORITIES.length; i += 1) {
            if (AUTHORITIES[i].regex.test(text)) {
                return AUTHORITIES[i];
            }
        }

        return null;
    }

    function sourceName() {
        var path = window.location.pathname.toLowerCase();

        if (path.indexOf("international-standards-cross-reference-guide") !== -1) {
            return "International Standards Cross-Reference";
        }

        if (path.indexOf("featured-spotlight-products") !== -1) {
            return "Spotlight Products";
        }

        if (path.indexOf("standard-products") !== -1) {
            return "Standard Products";
        }

        if (path.indexOf("/pages/products/") !== -1) {
            return "Products";
        }

        return "Pradako";
    }

    function sameOriginPath(value) {
        try {
            var url = new URL(value, window.location.href);

            if (url.origin !== window.location.origin) {
                return "";
            }

            return url.pathname + url.search + url.hash;
        } catch (error) {
            return "";
        }
    }

    function preparationUrl(standard, authority, candidate) {
        var params = new URLSearchParams();

        params.set("standard", canonicalDesignation(standard));

        if (authority && authority.key) {
            params.set("authority", authority.key);
        }

        if (candidate) {
            params.set("candidate", candidate);
        }

        params.set("from", sourceName());
        params.set(
            "return",
            window.location.pathname +
            window.location.search +
            window.location.hash
        );

        return PREPARATION_PAGE + "?" + params.toString();
    }

    function standardFromLegacyFallback(anchor) {
        if (!anchor || !anchor.getAttribute) {
            return "";
        }

        var raw = clean(anchor.getAttribute("href"));

        if (!raw) {
            return "";
        }

        try {
            var url = new URL(raw, window.location.href);

            if (url.origin !== window.location.origin) {
                return "";
            }

            var oldAuthorityTable =
                /^\/pages\/standard-products\/[^/]+\.html$/i.test(url.pathname) ||
                /^\/pages\/products\/standard-products\.html$/i.test(url.pathname);

            if (!oldAuthorityTable) {
                return "";
            }

            return clean(url.searchParams.get("standard"));
        } catch (error) {
            return "";
        }
    }

    function standardFromPreparation(anchor) {
        if (!anchor || !anchor.getAttribute) {
            return "";
        }

        try {
            var url = new URL(
                clean(anchor.getAttribute("href")),
                window.location.href
            );

            if (
                url.origin === window.location.origin &&
                url.pathname === PREPARATION_PAGE
            ) {
                return clean(url.searchParams.get("standard"));
            }
        } catch (error) {}

        return "";
    }

    function standardFromSpotlight(anchor) {
        if (!anchor) {
            return "";
        }

        var card = anchor.closest("[data-product-source='standard']");

        if (card) {
            var title = card.querySelector("h3");

            if (title) {
                return clean(title.textContent);
            }
        }

        var editorial = anchor.closest(".pmew-spotlight-editorial");

        if (editorial) {
            var enquiry = editorial.querySelector("[data-enquiry-source]");

            if (
                enquiry &&
                clean(enquiry.dataset.enquirySource).toLowerCase() === "standard"
            ) {
                var heading = editorial.querySelector(
                    ".pmew-spotlight-editorial-content h3"
                );

                if (heading) {
                    return clean(heading.textContent);
                }
            }
        }

        return "";
    }

    function standardFromAnchor(anchor) {
        if (!anchor) {
            return "";
        }

        var explicit =
            clean(anchor.getAttribute("data-standard-code")) ||
            clean(anchor.getAttribute("data-standard"));

        if (explicit) {
            return explicit;
        }

        return (
            standardFromLegacyFallback(anchor) ||
            standardFromPreparation(anchor) ||
            standardFromSpotlight(anchor)
        );
    }

    function canonicalCandidate(standard, authority) {
        if (
            !authority ||
            !authority.folders ||
            !authority.folders.length
        ) {
            return "";
        }

        var slug = slugify(standard);

        if (!slug) {
            return "";
        }

        return (
            "/pages/standards/" +
            authority.folders[0] +
            "/" +
            slug +
            ".html"
        );
    }

    /*
     * Cheap synchronous conversion.
     * This does NOT load the page index and does NOT perform fetch requests.
     *
     * Its only job is to make sure an old authority-table fallback never
     * remains as the user-visible href.
     */
    function neutralizeLegacyFallback(anchor) {
        if (!(anchor instanceof HTMLAnchorElement)) {
            return false;
        }

        var standard = standardFromLegacyFallback(anchor);

        if (!standard) {
            return false;
        }

        var authority = detectAuthority(standard);
        var candidate = canonicalCandidate(standard, authority);
        var desired = preparationUrl(standard, authority, candidate);

        anchor.setAttribute("data-standard-code", canonicalDesignation(standard));
        anchor.setAttribute("data-pmew-standard-link", "true");

        if (anchor.getAttribute("href") !== desired) {
            anchor.setAttribute("href", desired);
        }

        return true;
    }

    function neutralizeLegacyFallbacks(root) {
        root = root || document;

        var anchors = [];

        if (root instanceof HTMLAnchorElement) {
            anchors.push(root);
        }

        if (root.querySelectorAll) {
            anchors = anchors.concat(
                Array.prototype.slice.call(
                    root.querySelectorAll(
                        'a[href*="/pages/standard-products/"][href*="standard="],' +
                        'a[href*="/pages/products/standard-products.html"][href*="standard="]'
                    )
                )
            );
        }

        var changed = 0;

        for (var i = 0; i < anchors.length; i += 1) {
            if (neutralizeLegacyFallback(anchors[i])) {
                changed += 1;
            }
        }

        return changed;
    }

    function ensureIndex() {
        if (
            window.PMEWStandardPageIndex &&
            window.PMEWStandardPageIndex.routes
        ) {
            return Promise.resolve(window.PMEWStandardPageIndex);
        }

        if (indexPromise) {
            return indexPromise;
        }

        indexPromise = new Promise(function (resolve, reject) {
            var existing = document.querySelector(
                'script[data-pmew-standard-page-index],' +
                'script[src^="/assets/js/standard-page-index.js"]'
            );

            function finish() {
                if (
                    window.PMEWStandardPageIndex &&
                    window.PMEWStandardPageIndex.routes
                ) {
                    resolve(window.PMEWStandardPageIndex);
                } else {
                    reject(
                        new Error(
                            "PMEW standard page index did not initialise."
                        )
                    );
                }
            }

            if (existing) {
                if (
                    window.PMEWStandardPageIndex &&
                    window.PMEWStandardPageIndex.routes
                ) {
                    resolve(window.PMEWStandardPageIndex);
                    return;
                }

                existing.addEventListener("load", finish, { once: true });
                existing.addEventListener("error", reject, { once: true });
                return;
            }

            var script = document.createElement("script");

            script.src = INDEX_SCRIPT;
            script.async = true;
            script.dataset.pmewStandardPageIndex = "true";

            script.addEventListener("load", finish, { once: true });
            script.addEventListener(
                "error",
                function () {
                    reject(
                        new Error(
                            "Unable to load " + INDEX_SCRIPT
                        )
                    );
                },
                { once: true }
            );

            document.head.appendChild(script);
        }).catch(function (error) {
            indexPromise = null;
            throw error;
        });

        return indexPromise;
    }

    function indexedRoute(index, standard, authority) {
        if (
            !index ||
            !index.routes ||
            !authority
        ) {
            return "";
        }

        var mapping = index.routes[authority.key] || {};

        return mapping[routeKey(standard)] || "";
    }

    function applyIndexedHref(anchor, standard, index) {
        if (!(anchor instanceof HTMLAnchorElement)) {
            return "";
        }

        var cleanStandard = canonicalDesignation(standard);
        var authority = detectAuthority(cleanStandard);
        var direct = indexedRoute(index, cleanStandard, authority);

        anchor.setAttribute("data-standard-code", cleanStandard);
        anchor.setAttribute("data-pmew-standard-link", "true");

        if (direct) {
            if (anchor.getAttribute("href") !== direct) {
                anchor.setAttribute("href", direct);
            }

            return direct;
        }

        var candidate = canonicalCandidate(cleanStandard, authority);
        var prep = preparationUrl(
            cleanStandard,
            authority,
            candidate
        );

        if (anchor.getAttribute("href") !== prep) {
            anchor.setAttribute("href", prep);
        }

        return prep;
    }

    function primeAnchor(anchor) {
        if (!(anchor instanceof HTMLAnchorElement)) {
            return Promise.resolve("");
        }

        var standard = standardFromAnchor(anchor);

        if (!standard) {
            return Promise.resolve("");
        }

        /*
         * Always remove a stale authority-table URL immediately.
         */
        neutralizeLegacyFallback(anchor);

        return ensureIndex()
            .then(function (index) {
                return applyIndexedHref(anchor, standard, index);
            })
            .catch(function () {
                return anchor.getAttribute("href") || "";
            });
    }

    function cacheRead(path) {
        try {
            var raw = sessionStorage.getItem(CACHE_PREFIX + path);

            if (!raw) {
                return null;
            }

            var data = JSON.parse(raw);
            var ttl = data.exists ? POSITIVE_TTL : NEGATIVE_TTL;

            if (
                !data.at ||
                Date.now() - Number(data.at) > ttl
            ) {
                sessionStorage.removeItem(CACHE_PREFIX + path);
                return null;
            }

            return !!data.exists;
        } catch (error) {
            return null;
        }
    }

    function cacheWrite(path, exists) {
        try {
            sessionStorage.setItem(
                CACHE_PREFIX + path,
                JSON.stringify({
                    exists: !!exists,
                    at: Date.now()
                })
            );
        } catch (error) {}
    }

    function titleFromHtml(markup) {
        var match = String(markup || "").match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
        );

        return match
            ? clean(match[1].replace(/<[^>]+>/g, " "))
            : "";
    }

    /*
     * This is called only for a standard that is not already known.
     * No existence fetches occur during normal page load.
     */
    async function probePage(path, standard, force) {
        var safePath = sameOriginPath(path);

        if (!safePath) {
            return false;
        }

        if (!force) {
            var cached = cacheRead(safePath);

            if (cached !== null) {
                return cached;
            }
        }

        try {
            var response = await window.fetch(safePath, {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store",
                redirect: "follow",
                headers: {
                    Accept: "text/html,application/xhtml+xml"
                }
            });

            if (!response.ok) {
                cacheWrite(safePath, false);
                return false;
            }

            var requested = new URL(
                safePath,
                window.location.origin
            );
            var finalUrl = new URL(
                response.url || requested.href,
                window.location.origin
            );

            /*
             * Live Server may show another document for a nonexistent path.
             * Do not accept a redirect/fallback pathname as a valid
             * individual-standard page.
             */
            if (finalUrl.pathname !== requested.pathname) {
                cacheWrite(safePath, false);
                return false;
            }

            var markup = await response.text();
            var pageTitle = titleFromHtml(markup);
            var expectedKey = routeKey(standard);
            var titleKey = routeKey(pageTitle);

            var homeFallback =
                /<title>\s*Pradako\s*-\s*Quality Fasteners Since 1960\s*<\/title>/i.test(
                    markup
                );

            var standardSignals =
                markup.indexOf("PRA-STD-") !== -1 ||
                /Pradako Standards Library/i.test(markup) ||
                (
                    expectedKey &&
                    titleKey &&
                    titleKey.indexOf(expectedKey) !== -1
                );

            var exists =
                !!standardSignals &&
                !homeFallback;

            cacheWrite(safePath, exists);

            return exists;
        } catch (error) {
            return false;
        }
    }

    function signature(value) {
        return canonicalDesignation(value)
            .replace(
                /^(?:AS\/NZS|AS NZS|AS-NZS|ASME|ANSI|ASTM|BSI|BS|CEN|EN|DAST|DIN|GOST\s*R|GOST|GSO|ISO|IS|JIS|MIL|MS|FED|NASM|NAS|NEN|NF|AFNOR|PN|SAE|SFS|SNV|SN|UNE|UNI|CSN|ČSN|DS|BDS)\s*/i,
                ""
            )
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "");
    }

    function authorityIndexPath(folder) {
        return (
            "/pages/standards/" +
            folder +
            "/index.html"
        );
    }

    function loadAuthorityHtml(folder) {
        if (authorityHtmlCache[folder]) {
            return authorityHtmlCache[folder];
        }

        authorityHtmlCache[folder] = window
            .fetch(authorityIndexPath(folder), {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store",
                headers: {
                    Accept: "text/html,application/xhtml+xml"
                }
            })
            .then(function (response) {
                return response.ok
                    ? response.text()
                    : "";
            })
            .catch(function () {
                return "";
            });

        return authorityHtmlCache[folder];
    }

    async function discoverAuthorityRoute(
        standard,
        authority
    ) {
        if (
            !authority ||
            !authority.folders
        ) {
            return "";
        }

        var targetKey = routeKey(standard);
        var targetSignature = signature(standard);

        for (
            var folderIndex = 0;
            folderIndex < authority.folders.length;
            folderIndex += 1
        ) {
            var folder = authority.folders[folderIndex];
            var markup = await loadAuthorityHtml(folder);

            if (!markup) {
                continue;
            }

            var doc = new DOMParser().parseFromString(
                markup,
                "text/html"
            );
            var links = Array.prototype.slice.call(
                doc.querySelectorAll("a[href]")
            );

            var matches = [];

            for (var i = 0; i < links.length; i += 1) {
                var rawHref = clean(
                    links[i].getAttribute("href")
                );

                if (!rawHref) {
                    continue;
                }

                var path = sameOriginPath(rawHref);

                if (
                    !path ||
                    path.indexOf(
                        "/pages/standards/" +
                        folder +
                        "/"
                    ) !== 0 ||
                    /\/index\.html(?:[?#]|$)/i.test(path)
                ) {
                    continue;
                }

                var textKey = routeKey(
                    links[i].textContent || ""
                );
                var hrefKey = routeKey(
                    path
                        .split("/")
                        .pop()
                        .replace(/\.html(?:[?#].*)?$/i, "")
                );

                var score = 0;

                if (
                    targetKey &&
                    textKey === targetKey
                ) {
                    score = 120;
                } else if (
                    targetKey &&
                    (
                        textKey.indexOf(targetKey) === 0 ||
                        hrefKey.indexOf(targetKey) === 0
                    )
                ) {
                    score = 100;
                } else if (
                    targetSignature &&
                    targetSignature.length >= 2 &&
                    (
                        textKey.indexOf(targetSignature) !== -1 ||
                        hrefKey.indexOf(targetSignature) !== -1
                    )
                ) {
                    score = 70;
                }

                if (score) {
                    matches.push({
                        path: path,
                        score: score
                    });
                }
            }

            matches.sort(function (a, b) {
                return b.score - a.score;
            });

            for (
                var matchIndex = 0;
                matchIndex < Math.min(matches.length, 5);
                matchIndex += 1
            ) {
                if (
                    await probePage(
                        matches[matchIndex].path,
                        standard,
                        true
                    )
                ) {
                    return matches[matchIndex].path;
                }
            }
        }

        return "";
    }

    async function resolveForClick(standard) {
        var cleanStandard = canonicalDesignation(standard);
        var authority = detectAuthority(cleanStandard);
        var index = null;

        try {
            index = await ensureIndex();
        } catch (error) {}

        var direct = indexedRoute(
            index,
            cleanStandard,
            authority
        );

        /*
         * Known index routes were generated only from real pages, so they
         * open immediately without an extra network round trip.
         */
        if (direct) {
            return {
                status: "ready",
                standard: cleanStandard,
                authority: authority,
                url: direct
            };
        }

        var candidate = canonicalCandidate(
            cleanStandard,
            authority
        );

        if (
            candidate &&
            await probePage(
                candidate,
                cleanStandard,
                true
            )
        ) {
            return {
                status: "ready",
                standard: cleanStandard,
                authority: authority,
                url: candidate
            };
        }

        var discovered = await discoverAuthorityRoute(
            cleanStandard,
            authority
        );

        if (discovered) {
            return {
                status: "ready",
                standard: cleanStandard,
                authority: authority,
                url: discovered
            };
        }

        return {
            status: "preparation",
            standard: cleanStandard,
            authority: authority,
            candidate: candidate || "",
            url: preparationUrl(
                cleanStandard,
                authority,
                candidate
            )
        };
    }

    function recordMissing(result) {
        var payload = {
            standard: result.standard,
            authority:
                result.authority &&
                result.authority.key
                    ? result.authority.key
                    : "",
            candidate: result.candidate || "",
            source: sourceName(),
            sourcePage:
                window.location.pathname +
                window.location.search,
            at: new Date().toISOString()
        };

        try {
            var store = JSON.parse(
                localStorage.getItem(
                    MISSING_ANALYTICS_KEY
                ) || "{}"
            );
            var key =
                routeKey(payload.standard) ||
                payload.standard;
            var current = store[key] || {};

            store[key] = {
                standard: payload.standard,
                authority: payload.authority,
                candidate: payload.candidate,
                lastSource: payload.source,
                lastSourcePage:
                    payload.sourcePage,
                lastSeen: payload.at,
                count:
                    Number(current.count || 0) + 1
            };

            localStorage.setItem(
                MISSING_ANALYTICS_KEY,
                JSON.stringify(store)
            );
        } catch (error) {}

        window.dispatchEvent(
            new CustomEvent(
                "pmew:standard-reference-missing",
                { detail: payload }
            )
        );
    }

    function setBusy(element, busy) {
        if (!(element instanceof HTMLElement)) {
            return;
        }

        if (busy) {
            element.setAttribute(
                "aria-busy",
                "true"
            );
            element.dataset.pmewStandardChecking =
                "true";
        } else {
            element.removeAttribute("aria-busy");
            delete element.dataset.pmewStandardChecking;
        }
    }

    function standardFromTarget(target) {
        if (!(target instanceof Element)) {
            return null;
        }

        var codeNode = target.closest(
            "[data-standard-code]"
        );

        if (codeNode) {
            return {
                standard: clean(
                    codeNode.getAttribute(
                        "data-standard-code"
                    )
                ),
                trigger: codeNode,
                anchor:
                    codeNode instanceof HTMLAnchorElement
                        ? codeNode
                        : codeNode.closest("a[href]")
            };
        }

        var catalogue = target.closest(
            '[data-catalogue-action="standard-product-page"][data-standard],' +
            '[data-catalogue-action="standard-link"][data-standard]'
        );

        if (catalogue) {
            return {
                standard: clean(
                    catalogue.getAttribute(
                        "data-standard"
                    )
                ),
                trigger: catalogue,
                anchor:
                    catalogue instanceof HTMLAnchorElement
                        ? catalogue
                        : catalogue.closest("a[href]")
            };
        }

        var anchor = target.closest("a[href]");

        if (!anchor) {
            return null;
        }

        var standard = standardFromAnchor(anchor);

        if (!standard) {
            return null;
        }

        return {
            standard: standard,
            trigger: anchor,
            anchor: anchor
        };
    }

    /*
     * Hover/focus priming is deliberately non-blocking.
     * It improves the status-bar URL without delaying first paint.
     */
    function interactionPrime(event) {
        var anchor = event.target.closest
            ? event.target.closest("a[href]")
            : null;

        if (!anchor) {
            return;
        }

        var standard = standardFromAnchor(anchor);

        if (!standard) {
            return;
        }

        neutralizeLegacyFallback(anchor);

        primeAnchor(anchor);
    }

    function shouldIgnoreClick(event) {
        return (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
        );
    }

    async function clickHandler(event) {
        if (shouldIgnoreClick(event)) {
            return;
        }

        var data = standardFromTarget(
            event.target
        );

        if (
            !data ||
            !data.standard
        ) {
            return;
        }

        /*
         * If this is already a real individual-standard href and it was not
         * produced from a preparation/fallback link, let the browser navigate
         * immediately. No async work is needed.
         */
        if (
            data.anchor &&
            /^\/pages\/standards\/(?!reference-in-preparation\.html)/i.test(
                sameOriginPath(
                    data.anchor.getAttribute("href")
                )
            )
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        setBusy(data.trigger, true);

        var result;

        try {
            result = await resolveForClick(
                data.standard
            );
        } finally {
            setBusy(data.trigger, false);
        }

        if (
            result.status === "preparation"
        ) {
            recordMissing(result);
        }

        window.location.href = result.url;
    }

    /*
     * Safe dynamic-content support.
     *
     * IMPORTANT:
     * Only childList is observed.
     * V15 does NOT observe href or data-* attributes, so changing an href
     * cannot call the observer again.
     */
    function installDynamicContentObserver() {
        if (!("MutationObserver" in window)) {
            return;
        }

        var observer = new MutationObserver(
            function (mutations) {
                for (
                    var i = 0;
                    i < mutations.length;
                    i += 1
                ) {
                    var nodes =
                        mutations[i].addedNodes || [];

                    for (
                        var n = 0;
                        n < nodes.length;
                        n += 1
                    ) {
                        var node = nodes[n];

                        if (
                            node &&
                            node.nodeType === 1
                        ) {
                            neutralizeLegacyFallbacks(
                                node
                            );
                        }
                    }
                }
            }
        );

        observer.observe(
            document.documentElement,
            {
                childList: true,
                subtree: true
            }
        );
    }

    function idleWarmIndex() {
        var warm = function () {
            ensureIndex().catch(
                function () {}
            );
        };

        if (
            "requestIdleCallback" in window
        ) {
            window.requestIdleCallback(
                warm,
                { timeout: 3000 }
            );
        } else {
            window.setTimeout(
                warm,
                1500
            );
        }
    }

    function init() {
        /*
         * One cheap selector pass. No fetch. No standards index.
         */
        neutralizeLegacyFallbacks(document);

        installDynamicContentObserver();
        idleWarmIndex();

        /*
         * Event delegation works for both current and future Product cards.
         */
        document.addEventListener(
            "pointerover",
            interactionPrime,
            true
        );
        document.addEventListener(
            "focusin",
            interactionPrime,
            true
        );
        document.addEventListener(
            "click",
            clickHandler,
            true
        );
    }

    window.PMEWStandardNavigation =
        Object.freeze({
            __v15: true,
            version: "15.0.0",
            canonicalDesignation:
                canonicalDesignation,
            routeKey: routeKey,
            slugify: slugify,
            detectAuthority:
                detectAuthority,
            neutralizeLegacyFallbacks:
                neutralizeLegacyFallbacks,
            primeAnchor: primeAnchor,
            resolveStandard:
                resolveForClick,
            authorities:
                AUTHORITIES.slice()
        });

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

}(window, document));
