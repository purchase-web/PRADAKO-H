(function () {
    /*
       SPOTLIGHT PRODUCTS — SHARED PRODUCT SYSTEM EDITION
       Spotlight owns product selection/timeline/editorial rendering only.
       Enquiry cart, drawer, RFQ form, uploads, recovery and toasts are owned by
       window.PradakoEnquiryCart.
    */
    "use strict";

    const app = document.getElementById("featuredSpotlightProductsApp");
    if (!app) return;

    const loading = document.getElementById("featuredSpotlightProductsLoading");
    const errorSection = document.getElementById("featuredSpotlightProductsError");
    const errorText = document.getElementById("featuredSpotlightProductsErrorText");
    const retryButton = document.getElementById("featuredSpotlightProductsRetry");
    const dayMount = document.getElementById("featuredProductOfDayMount");
    const weekMount = document.getElementById("featuredProductOfWeekMount");
    const sourceMount = document.getElementById("featuredSpotlightProductsMount");
    const highlightsMount = document.getElementById("featuredProductHighlightsMount");
    const backToTop = document.getElementById("featuredSpotlightProductsBackToTop");

    const locale = cleanText(app.dataset.locale) || "en-IN";
    const timeZone = cleanText(app.dataset.timeZone) || "Asia/Kolkata";
    const customCataloguePage = cleanText(app.dataset.customCataloguePage) || "/pages/products/products.html";
    const setCount = clampInt(app.dataset.productSetCount, 3, 4, 4);
    const cardCount = clampInt(app.dataset.sourceCardCount, 1, 8, 4);
    const timelineInterval = Math.max(
        15000,
        Number.parseInt(app.dataset.timelineCheckInterval, 10) || 30000
    );

    const state = {
        standardProducts: [],
        customisedProducts: [],
        standardSets: [],
        customisedSets: [],
        activeSetIndex: claimNextSetIndex(),
        timelineSignature: "",
        hiddenAt: 0,
        monitorId: null
    };

    function cleanText(value) {
        return String(value ?? "").replace(/\s+/g, " ").trim();
    }

    function clampInt(value, minimum, maximum, fallback) {
        const number = Number.parseInt(value, 10);
        if (!Number.isFinite(number)) return fallback;
        return Math.min(maximum, Math.max(minimum, number));
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function hashString(value) {
        let hash = 2166136261;
        for (const character of String(value ?? "")) {
            hash ^= character.charCodeAt(0);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    function claimNextSetIndex() {
        const key = "pmew-featured-products-js-set-index";

        try {
            const previous = Number.parseInt(localStorage.getItem(key), 10);
            const next = Number.isFinite(previous)
                ? (previous + 1) % setCount
                : Math.floor(Math.random() * setCount);

            localStorage.setItem(key, String(next));
            return next;
        } catch (error) {
            return Math.floor(Math.random() * setCount);
        }
    }

    function advanceSetIndex() {
        state.activeSetIndex = (state.activeSetIndex + 1) % setCount;

        try {
            localStorage.setItem(
                "pmew-featured-products-js-set-index",
                String(state.activeSetIndex)
            );
        } catch (error) {
            // localStorage can be unavailable in strict privacy modes.
        }
    }

    let standardRouteResolverPromise = null;

    function ensureStandardRouteResolver() {
        if (
            window.PMEWStandardRouteResolver &&
            typeof window.PMEWStandardRouteResolver.resolve === "function"
        ) {
            return Promise.resolve(window.PMEWStandardRouteResolver);
        }

        if (standardRouteResolverPromise) {
            return standardRouteResolverPromise;
        }

        standardRouteResolverPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector(
                'script[data-pmew-standard-route-resolver], script[src^="/assets/js/standard-route-resolver.js"]'
            );

            const finish = () => {
                if (
                    window.PMEWStandardRouteResolver &&
                    typeof window.PMEWStandardRouteResolver.resolve === "function"
                ) {
                    resolve(window.PMEWStandardRouteResolver);
                } else {
                    reject(new Error("PMEW Standard Route Resolver loaded but did not initialise."));
                }
            };

            if (existing) {
                if (
                    window.PMEWStandardRouteResolver &&
                    typeof window.PMEWStandardRouteResolver.resolve === "function"
                ) {
                    resolve(window.PMEWStandardRouteResolver);
                    return;
                }

                existing.addEventListener("load", finish, { once: true });
                existing.addEventListener(
                    "error",
                    () => reject(new Error("PMEW Standard Route Resolver failed to load.")),
                    { once: true }
                );
                return;
            }

            const script = document.createElement("script");
            script.src = "/assets/js/standard-route-resolver.js";
            script.defer = true;
            script.dataset.pmewStandardRouteResolver = "true";
            script.addEventListener("load", finish, { once: true });
            script.addEventListener(
                "error",
                () => reject(new Error("PMEW Standard Route Resolver failed to load.")),
                { once: true }
            );
            document.head.appendChild(script);
        }).catch((error) => {
            standardRouteResolverPromise = null;
            throw error;
        });

        return standardRouteResolverPromise;
    }

    function resolveSpotlightProductUrl(name, source, incomingUrl) {
        const suppliedUrl = cleanText(incomingUrl);

        /*
           Standard Products are re-resolved here at the final presentation
           layer instead of blindly trusting the URL returned by products.js.

           This protects the Spotlight page from stale/legacy catalogue URLs
           such as:
               /pages/products/standard-products.html?standard=DIN%20660

           when a real individual standard page already exists:
               /pages/standards/din/din-660.html
        */
        if (source === "standard") {
            try {
                if (
                    window.PMEWStandardRouteResolver &&
                    typeof window.PMEWStandardRouteResolver.resolve === "function"
                ) {
                    const resolved = cleanText(
                        window.PMEWStandardRouteResolver.resolve(name)
                    );

                    if (resolved) {
                        return resolved;
                    }
                }
            } catch (error) {
                // Preserve the supplied product URL if the shared resolver is unavailable.
            }

            return suppliedUrl ||
                `/pages/products/standard-products.html?standard=${encodeURIComponent(
                    cleanText(name)
                )}`;
        }

        return suppliedUrl ||
            "/pages/products/products.html#customized_products";
    }

    function normaliseProduct(raw, source, index) {
        const candidates = Array.isArray(raw?.imageCandidates)
            ? raw.imageCandidates.map(cleanText).filter(Boolean)
            : [];

        const directImage = cleanText(raw?.image);
        if (directImage && !candidates.includes(directImage)) {
            candidates.unshift(directImage);
        }

        const name = cleanText(raw?.name || raw?.title || raw?.label) || `Product ${index + 1}`;
        const description = cleanText(
            raw?.description ||
            raw?.subtype ||
            raw?.family ||
            raw?.category ||
            (source === "standard" ? "International Standard Fastener" : "Made to Requirement")
        );

        return {
            id: cleanText(raw?.id) || `${source}-${hashString(`${name}-${index}`)}`,
            partNo: cleanText(raw?.partNo || raw?.productNo || raw?.sku),
            name,
            description,
            category: cleanText(raw?.category || raw?.family || raw?.subtype),
            family: cleanText(raw?.family || raw?.category),
            image: candidates[0] || "",
            imageCandidates: candidates,
            url: resolveSpotlightProductUrl(name, source, raw?.url),
            source,
            sourceLabel: source === "standard" ? "Standard Product" : "Customise Product"
        };
    }

    function uniqueProducts(products) {
        const map = new Map();

        products.forEach((product) => {
            const key = `${product.source}|${product.name.toLowerCase()}|${product.description.toLowerCase()}`;
            if (!map.has(key)) map.set(key, product);
        });

        return [...map.values()];
    }

    function stableProductOrder(products, source) {
        return [...products].sort((a, b) => {
            const aHash = hashString(`${source}|${a.id}|${a.name}|${a.image}`);
            const bHash = hashString(`${source}|${b.id}|${b.name}|${b.image}`);
            return aHash - bHash;
        });
    }

    function buildProductSets(products, source) {
        if (!products.length) return [];

        const ordered = stableProductOrder(products, source);
        const size = Math.min(cardCount, ordered.length);
        const sets = [];

        for (let setIndex = 0; setIndex < setCount; setIndex += 1) {
            const start = (setIndex * size) % ordered.length;
            const set = [];

            for (let offset = 0; offset < ordered.length && set.length < size; offset += 1) {
                const product = ordered[(start + offset) % ordered.length];
                if (!set.some((item) => item.id === product.id)) set.push(product);
            }

            sets.push(set);
        }

        return sets;
    }

    function getActiveSet(source) {
        const sets = source === "standard" ? state.standardSets : state.customisedSets;
        const products = source === "standard" ? state.standardProducts : state.customisedProducts;

        if (!sets.length) return products.slice(0, cardCount);
        return sets[state.activeSetIndex % sets.length] || products.slice(0, cardCount);
    }

    function dateParts(instant = new Date()) {
        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        });

        const values = Object.fromEntries(
            formatter
                .formatToParts(instant)
                .filter((part) => part.type !== "literal")
                .map((part) => [part.type, part.value])
        );

        return {
            year: Number(values.year),
            month: Number(values.month),
            day: Number(values.day),
            hour: Number(values.hour),
            minute: Number(values.minute),
            second: Number(values.second)
        };
    }

    function isoWeek(calendarDate) {
        const date = new Date(calendarDate.getTime());
        const day = date.getUTCDay() || 7;
        const thursday = new Date(date.getTime());
        thursday.setUTCDate(thursday.getUTCDate() + 4 - day);

        const isoYear = thursday.getUTCFullYear();
        const yearStart = new Date(Date.UTC(isoYear, 0, 1));
        const week = Math.ceil((((thursday - yearStart) / 86400000) + 1) / 7);
        const start = new Date(date.getTime());
        start.setUTCDate(start.getUTCDate() - day + 1);
        const end = new Date(start.getTime());
        end.setUTCDate(end.getUTCDate() + 6);

        return { isoYear, week, start, end };
    }

    function timelineSnapshot(instant = new Date()) {
        const parts = dateParts(instant);
        const calendarDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
        const week = isoWeek(calendarDate);
        const dayKey = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
        const weekKey = `${week.isoYear}-W${String(week.week).padStart(2, "0")}`;
        const monthKey = `${parts.year}-${String(parts.month).padStart(2, "0")}`;

        return {
            instant,
            parts,
            calendarDate,
            week,
            dayKey,
            weekKey,
            monthKey,
            daySeed: Math.floor(calendarDate.getTime() / 86400000),
            weekSeed: Math.floor(week.start.getTime() / 604800000),
            monthSeed: (parts.year * 12) + parts.month - 1,
            signature: `${dayKey}|${weekKey}|${monthKey}`,
            liveLabel: new Intl.DateTimeFormat(locale, {
                timeZone,
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short"
            }).format(instant)
        };
    }

    function formatUtc(date, options) {
        return new Intl.DateTimeFormat(locale, {
            ...options,
            timeZone: "UTC"
        }).format(date);
    }

    function formatDay(snapshot) {
        return formatUtc(snapshot.calendarDate, {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function formatMonth(snapshot) {
        return formatUtc(snapshot.calendarDate, {
            month: "long",
            year: "numeric"
        });
    }

    function formatWeek(snapshot) {
        const { start, end } = snapshot.week;
        const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
        const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

        const startLabel = formatUtc(start, {
            day: "2-digit",
            ...(sameMonth ? {} : { month: "long" }),
            ...(sameYear ? {} : { year: "numeric" })
        });

        const endLabel = formatUtc(end, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

        return `${startLabel} – ${endLabel}`;
    }

    function choose(products, seed, excluded = []) {
        if (!products.length) return null;

        const excludedSet = new Set(excluded.filter(Boolean));
        const available = products.filter((product) => !excludedSet.has(product.id));
        const pool = available.length ? available : products;
        return pool[Math.abs(seed) % pool.length];
    }

    function rotate(products, seed, count, excluded = []) {
        if (!products.length || count <= 0) return [];

        const excludedSet = new Set(excluded.filter(Boolean));
        const available = products.filter((product) => !excludedSet.has(product.id));
        const pool = available.length ? available : products;
        const start = Math.abs(seed) % pool.length;
        const result = [];

        for (let offset = 0; offset < pool.length && result.length < count; offset += 1) {
            result.push(pool[(start + offset) % pool.length]);
        }

        return result;
    }

    function encodeCandidates(product) {
        const candidates = product.imageCandidates.length
            ? product.imageCandidates
            : (product.image ? [product.image] : []);

        return encodeURIComponent(JSON.stringify(candidates));
    }

    function productImageMarkup(product, className = "") {
        const candidates = product.imageCandidates.length
            ? product.imageCandidates
            : (product.image ? [product.image] : []);

        if (!candidates.length) {
            return `<span class="pmew-spotlight-image-fallback" style="display:grid;">${escapeHtml(product.name)}</span>`;
        }

        return `
            <img
                class="${escapeAttribute(className)}"
                src="${escapeAttribute(candidates[0])}"
                alt="${escapeAttribute(product.name)}"
                loading="lazy"
                data-pmew-image-index="0"
                data-pmew-product-image-id="${escapeAttribute(product.id)}"
                data-pmew-image-candidates="${escapeAttribute(encodeCandidates(product))}"
            >
            <span class="pmew-spotlight-image-fallback">${escapeHtml(product.name)}</span>
        `;
    }

    function enquiryActionIcon(type) {
        const icons = {
            plus: "fa-plus",
            minus: "fa-minus",
            check: "fa-check"
        };

        return `<i class="fa-solid ${icons[type] || icons.plus}" aria-hidden="true"></i>`;
    }

    function enquiryDataAttributes(product) {
        return [
            `data-enquiry-id="${escapeAttribute(product.id)}"`,
            `data-enquiry-partno="${escapeAttribute(product.partNo || "")}"`,
            `data-enquiry-name="${escapeAttribute(product.name)}"`,
            `data-enquiry-category="${escapeAttribute(product.category || product.family || "Fasteners")}"`,
            `data-enquiry-family="${escapeAttribute(product.family || "")}"`,
            `data-enquiry-family-url="${escapeAttribute(product.url)}"`,
            `data-enquiry-image="${escapeAttribute(product.image || product.imageCandidates[0] || "")}"`,
            `data-enquiry-source="${escapeAttribute(product.source)}"`,
            `data-enquiry-source-label="${escapeAttribute(product.sourceLabel)}"`,
            `data-product-url="${escapeAttribute(product.url)}"`
        ].join(" ");
    }

function sourceCardMarkup(product) {
    return `
        <article
            class="pmew-spotlight-source-card pmew-spotlight-reveal"
            data-product-id="${escapeAttribute(product.id)}"
            data-product-source="${escapeAttribute(product.source)}"
        >
            <a
                class="pmew-spotlight-source-card-link"
                href="${escapeAttribute(product.url)}"
                aria-label="View ${escapeAttribute(product.name)}"
            >
                <div class="pmew-spotlight-source-card-media">
                    ${productImageMarkup(product)}
                </div>

                <div class="pmew-spotlight-source-card-body">
                    <h3>${escapeHtml(product.name)}</h3>

                    <p>${escapeHtml(product.description)}</p>

                    <span class="pmew-spotlight-source-card-source">
                        ${escapeHtml(product.sourceLabel)}
                    </span>
                </div>
            </a>

            <div class="pmew-spotlight-source-card-actions">
                <button
                    class="pmew-spotlight-card-enquiry"
                    type="button"
                    ${enquiryDataAttributes(product)}
                    data-spotlight-open-after-enquiry="quick"
                >
                    <span data-enquiry-icon aria-hidden="true">
                        ${enquiryActionIcon("plus")}
                    </span>

                    <span data-enquiry-label>Add to Enquiry</span>
                </button>
            </div>
        </article>
    `;
}

    function sourceRangeMarkup(source, products) {
        const isCustom = source === "customised";
        const title = isCustom ? "CUSTOMISE SPOTLIGHT PRODUCTS" : "STANDARD SPOTLIGHT PRODUCTS";
        const kicker = isCustom ? "Made to Your Requirement" : "International Standards";
        const description = isCustom
            ? "Selected exclusively from the Customised Products catalogue supplied by products.js. Names, images and links never come from the Standard Products dataset."
            : "Selected exclusively from the Standard Products master data supplied by products.js. Every standard name remains paired with its own standard-product image candidates."

        return `
            <section class="pmew-spotlight-source-range ${isCustom ? "is-customised" : "is-standard"}" data-source-range="${source}">
                <div class="pmew-spotlight-source-header">
                    <span class="pmew-spotlight-source-kicker">${kicker}</span>
                    <h2>${title}</h2>
                    <p>${description}</p>
                </div>

                <div class="pmew-spotlight-source-grid">
                    ${products.map(sourceCardMarkup).join("")}
                </div>
            </section>
        `;
    }

    function editorialMarkup(type, product, snapshot, reversed = false) {
        if (!product) return "";

        const settings = {
            day: {
                className: "is-day",
                kicker: "Daily Product Selection",
                heading: "PRODUCT OF THE DAY",
                time: formatDay(snapshot),
                description: "This product changes automatically at the start of every India calendar day."
            },
            week: {
                className: "is-week",
                kicker: "Weekly Product Selection",
                heading: "PRODUCT OF THE WEEK",
                time: formatWeek(snapshot),
                description: "This product changes automatically every Monday using the current ISO week."
            },
            month: {
                className: "is-month",
                kicker: "Monthly Product Selection",
                heading: "PRODUCT OF THE MONTH",
                time: formatMonth(snapshot),
                description: "This product changes automatically on the first day of every calendar month."
            }
        }[type];

        return `
            <section class="pmew-spotlight-editorial ${settings.className} ${reversed ? "is-reversed" : ""}" id="product-of-${type}">
                <div class="pmew-spotlight-editorial-inner">
                    <div class="pmew-spotlight-editorial-media pmew-spotlight-reveal">
                        ${productImageMarkup(product)}
                    </div>

                    <div class="pmew-spotlight-editorial-content pmew-spotlight-reveal">
                        <div class="pmew-spotlight-editorial-meta">
                            <span class="pmew-spotlight-editorial-kicker">${settings.kicker}</span>
                            <span class="pmew-spotlight-editorial-time">${escapeHtml(settings.time)}</span>
                            <span class="pmew-spotlight-live-status">Live Timeline</span>
                        </div>

                        <h2>${settings.heading}</h2>
                        <h3>${escapeHtml(product.name)}</h3>
                        <p>${escapeHtml(product.description)}. ${settings.description}</p>


                        <div class="pmew-spotlight-editorial-actions">
                            <a href="${escapeAttribute(product.url)}">VIEW PRODUCT</a>
                            <button
                                class="secondary pmew-spotlight-editorial-enquiry"
                                type="button"
                                ${enquiryDataAttributes(product)}
                                data-spotlight-open-after-enquiry="quick"
                            >
                                <span data-enquiry-icon aria-hidden="true">${enquiryActionIcon("plus")}</span>
                                <span data-enquiry-label>ADD TO ENQUIRY</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    function collectionMarkup(options) {
        return `
            <section class="pmew-spotlight-collection ${options.className || ""}" id="${escapeAttribute(options.id)}">
                <div class="pmew-spotlight-collection-inner">
                    <div class="pmew-spotlight-section-heading">
                        <div class="pmew-spotlight-section-heading-top">
                            <span class="pmew-spotlight-section-kicker">${escapeHtml(options.kicker)}</span>
                            <span class="pmew-spotlight-section-time">${escapeHtml(options.time)}</span>
                        </div>
                        <h2>${escapeHtml(options.heading)}</h2>
                        <p>${escapeHtml(options.description)}</p>
                    </div>

                    <div class="pmew-spotlight-collection-grid">
                        ${options.products.map(sourceCardMarkup).join("")}
                    </div>
                </div>
            </section>
        `;
    }

    function enquiryCtaMarkup() {
        return `
            <section class="pmew-spotlight-enquiry-cta" id="featured-product-enquiry">
                <div class="pmew-spotlight-enquiry-cta-inner">
                    <div class="pmew-spotlight-reveal">
                        <span class="pmew-spotlight-enquiry-cta-kicker">Engineering & Commercial Support</span>
                        <h2>HAVE A STANDARD OR CUSTOM REQUIREMENT?</h2>
                        <p>
                            Select products from this page or submit a general requirement.
                            Share sizes, quantities, materials, coatings, inspection needs and drawings
                            with the Pradako team without leaving this page.
                        </p>
                    </div>

                    <div class="pmew-spotlight-enquiry-cta-actions pmew-spotlight-reveal">
                        <button type="button" data-open-enquiry="quick">START QUICK ENQUIRY</button>
                        <button class="secondary" type="button" data-open-enquiry="detailed">UPLOAD DRAWING / DETAILED RFQ</button>
                    </div>
                </div>
            </section>
        `;
    }

    function readImageCandidates(image) {
        try {
            const parsed = JSON.parse(
                decodeURIComponent(image.dataset.pmewImageCandidates || "%5B%5D")
            );
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch (error) {
            return [];
        }
    }

    function absoluteImageSource(value) {
        try {
            return new URL(value, window.location.href).href;
        } catch (error) {
            return String(value || "");
        }
    }

    function imageUniquenessGroup(image) {
        return image.closest(
            ".pmew-spotlight-source-grid, .pmew-spotlight-collection-grid, .pmew-spotlight-editorial-inner"
        );
    }

    function usedImageSources(image) {
        const group = imageUniquenessGroup(image);
        if (!group) return new Set();

        return new Set(
            Array.from(group.querySelectorAll("img[data-pmew-image-candidates]"))
                .filter((candidateImage) => candidateImage !== image)
                .filter((candidateImage) => candidateImage.complete && candidateImage.naturalWidth > 0)
                .map((candidateImage) => absoluteImageSource(candidateImage.currentSrc || candidateImage.src))
                .filter(Boolean)
        );
    }

    function showImageTextFallback(image) {
        image.style.display = "none";
        const fallback = image.nextElementSibling;
        if (fallback) fallback.style.display = "grid";
    }

    function advanceImageCandidate(image, avoidUsedImages = false) {
        const candidates = readImageCandidates(image);
        const current = Number.parseInt(image.dataset.pmewImageIndex || "0", 10);
        const used = avoidUsedImages ? usedImageSources(image) : new Set();

        for (let next = current + 1; next < candidates.length; next += 1) {
            const candidateSource = absoluteImageSource(candidates[next]);
            if (avoidUsedImages && used.has(candidateSource)) continue;

            image.dataset.pmewImageIndex = String(next);
            image.src = candidates[next];
            return true;
        }

        return false;
    }

    function ensureUniqueLoadedImage(image) {
        if (!image.complete || image.naturalWidth <= 0) return;

        const currentSource = absoluteImageSource(image.currentSrc || image.src);
        if (!usedImageSources(image).has(currentSource)) return;

        /*
           A sibling card has already resolved to this photograph. Advance to
           the next working candidate so a four-card section shows four visual
           treatments whenever the products.js candidate pool permits it.
        */
        advanceImageCandidate(image, true);
    }

    function bindImageFallbacks(root = document) {
        root.querySelectorAll("img[data-pmew-image-candidates]").forEach((image) => {
            if (image.dataset.pmewImageFallbackReady === "true") return;
            image.dataset.pmewImageFallbackReady = "true";

            image.addEventListener("error", () => {
                if (!advanceImageCandidate(image, false)) {
                    showImageTextFallback(image);
                }
            });

            image.addEventListener("load", () => {
                window.requestAnimationFrame(() => ensureUniqueLoadedImage(image));
            });

            if (image.complete && image.naturalWidth > 0) {
                window.requestAnimationFrame(() => ensureUniqueLoadedImage(image));
            }
        });
    }

    function bindReveal(root = document) {
        const elements = root.querySelectorAll(".pmew-spotlight-reveal:not([data-reveal-ready])");

        if (!("IntersectionObserver" in window)) {
            elements.forEach((element) => element.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        elements.forEach((element) => {
            element.dataset.revealReady = "true";
            observer.observe(element);
        });
    }



    /* ======================================================================
       SHARED ENQUIRY BRIDGE
       ----------------------------------------------------------------------
       The shared module owns add/remove state and the complete enquiry UI.
       Spotlight only adds one behaviour: when a product is newly added through
       an explicit Spotlight enquiry button, open the shared Quick Enquiry drawer.
       ====================================================================== */
    function syncSharedEnquiryButtons() {
        const cart = window.PradakoEnquiryCart;
        if (cart && typeof cart.sync === "function") cart.sync();
    }

    function initSharedEnquiryBridge() {
        const cart = window.PradakoEnquiryCart;
        if (!cart) {
            console.warn("PradakoEnquiryCart is unavailable. Spotlight enquiry actions are disabled.");
            return;
        }

        document.addEventListener("click", (event) => {
            const button = event.target.closest("[data-spotlight-open-after-enquiry]");
            if (!button) return;

            const productId = cleanText(button.getAttribute("data-enquiry-id"));
            const mode = cleanText(button.getAttribute("data-spotlight-open-after-enquiry")) || "quick";

            /* PradakoEnquiryCart registers its delegated click handler during
               DOMContentLoaded. This micro-delay lets that canonical handler
               finish add/remove/limit processing before Spotlight decides
               whether the drawer should open. */
            window.setTimeout(() => {
                if (productId && cart.has(productId)) cart.open(mode);
            }, 0);
        });

        if (typeof cart.on === "function") {
            cart.on("change", syncSharedEnquiryButtons);
        }

        syncSharedEnquiryButtons();
    }

    function allProducts() {
        return uniqueProducts([
            ...state.standardProducts,
            ...state.customisedProducts
        ]);
    }

    function render(snapshot = timelineSnapshot()) {
        const standardActive = getActiveSet("standard");
        const customisedActive = getActiveSet("customised");
        const combined = allProducts();

        const productOfDay = choose(combined, snapshot.daySeed);
        const productOfWeek = choose(combined, snapshot.weekSeed, [productOfDay?.id]);
        const productOfMonth = choose(combined, snapshot.monthSeed, [
            productOfDay?.id,
            productOfWeek?.id
        ]);

        const mostEnquired = rotate(combined, snapshot.weekSeed + 13, 4, [
            productOfDay?.id,
            productOfWeek?.id,
            productOfMonth?.id
        ]);

        const newlyAdded = rotate(combined, snapshot.daySeed + state.activeSetIndex + 29, 4, [
            ...mostEnquired.map((product) => product.id)
        ]);

        dayMount.innerHTML = editorialMarkup("day", productOfDay, snapshot, false);
        weekMount.innerHTML = editorialMarkup("week", productOfWeek, snapshot, true);

        sourceMount.innerHTML = [
            sourceRangeMarkup("standard", standardActive),
            sourceRangeMarkup("customised", customisedActive)
        ].join("");

        highlightsMount.innerHTML = [
            editorialMarkup("month", productOfMonth, snapshot, false),
            collectionMarkup({
                id: "most-enquired-this-week",
                kicker: "Weekly Selection",
                heading: "MOST ENQUIRED THIS WEEK",
                time: formatWeek(snapshot),
                description: "A rotating weekly selection generated from the central Standard and Customise product datasets.",
                products: mostEnquired
            }),
            collectionMarkup({
                id: "newly-added-products",
                className: "is-new",
                kicker: "Range Discovery",
                heading: "NEWLY ADDED PRODUCTS",
                time: formatDay(snapshot),
                description: "A refreshed product discovery set that changes with the daily timeline and page refresh set.",
                products: newlyAdded
            }),
            enquiryCtaMarkup()
        ].join("");

        state.timelineSignature = snapshot.signature;
        bindImageFallbacks(app);
        bindReveal(app);
        syncSharedEnquiryButtons();
    }

    function showError(message) {
        if (loading) loading.hidden = true;
        if (errorText) errorText.textContent = message;
        if (errorSection) errorSection.hidden = false;
        app.classList.remove("is-ready");
    }

    function showReady() {
        if (loading) loading.hidden = true;
        if (errorSection) errorSection.hidden = true;
        app.classList.add("is-ready");
    }

    function waitForProductsApi(timeout = 12000) {
        if (window.PradakoProductsAPI) {
            return Promise.resolve(window.PradakoProductsAPI);
        }

        return new Promise((resolve, reject) => {
            const timer = window.setTimeout(() => {
                window.removeEventListener("pradako:products-api-ready", onReady);
                reject(new Error("The Products JavaScript API did not become available."));
            }, timeout);

            function onReady() {
                if (!window.PradakoProductsAPI) return;
                window.clearTimeout(timer);
                window.removeEventListener("pradako:products-api-ready", onReady);
                resolve(window.PradakoProductsAPI);
            }

            window.addEventListener("pradako:products-api-ready", onReady);
        });
    }

    async function loadProducts() {
        if (loading) loading.hidden = false;
        if (errorSection) errorSection.hidden = true;

        try {
            /*
               Spotlight must own this dependency itself. Do not rely on the
               page HTML having already loaded standard-route-resolver.js.
               This prevents stale catalogue fallbacks such as
               ?standard=DIN%20660 from being reused when a real DIN 660
               individual page exists.
            */
            try {
                await ensureStandardRouteResolver();
            } catch (resolverError) {
                console.warn(
                    "Spotlight standard route resolver was unavailable; product URLs will use their supplied fallbacks.",
                    resolverError
                );
            }

            const api = await waitForProductsApi();
            const result = await api.getFeaturedProducts({
                customCataloguePage
            });

            const standard = uniqueProducts(
                (result.standard || []).map((product, index) => normaliseProduct(product, "standard", index))
            );
            const customised = uniqueProducts(
                (result.customised || []).map((product, index) => normaliseProduct(product, "customised", index))
            );

            if (!standard.length) {
                throw new Error("products.js returned no Standard Products data.");
            }

            if (!customised.length) {
                throw new Error(
                    "products.js returned no Customise Products data. Confirm that /products.html contains #customized_products or .pradako-customised-products-section with product cards."
                );
            }

            state.standardProducts = standard;
            state.customisedProducts = customised;
            state.standardSets = buildProductSets(standard, "standard");
            state.customisedSets = buildProductSets(customised, "customised");

            render(timelineSnapshot());
            showReady();
            startTimelineMonitor();
        } catch (error) {
            console.error("Spotlight Products failed to load", error);
            showError(error instanceof Error ? error.message : String(error));
        }
    }

    function startTimelineMonitor() {
        if (state.monitorId) window.clearInterval(state.monitorId);

        state.monitorId = window.setInterval(() => {
            const snapshot = timelineSnapshot();
            if (snapshot.signature !== state.timelineSignature) render(snapshot);
        }, timelineInterval);
    }

    function rerenderSourceSets() {
        if (!state.standardProducts.length || !state.customisedProducts.length) return;
        render(timelineSnapshot());
    }

    retryButton?.addEventListener("click", () => {
        loadProducts();
    });

    backToTop?.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
        backToTop?.classList.toggle("is-visible", window.scrollY > 560);
    }, { passive: true });

    window.addEventListener("pageshow", (event) => {
        if (!event.persisted) return;
        advanceSetIndex();
        rerenderSourceSets();
        syncSharedEnquiryButtons();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            state.hiddenAt = Date.now();
            return;
        }

        if (state.hiddenAt && Date.now() - state.hiddenAt > 1000) {
            advanceSetIndex();
            rerenderSourceSets();
        }

        state.hiddenAt = 0;
    });

    initSharedEnquiryBridge();
    loadProducts();
})();
