/* ============================================================================
   PRADAKO / PMEW — INDIVIDUAL PRODUCT DETAIL PAGE
   SHARED PMEW PRODUCT SERVICES — ENQUIRY / COMPARE / SAVED PRODUCTS
   ---------------------------------------------------------------------------
   This module deliberately DOES NOT own enquiry, compare, notifications,
   recovery or uploads. It adapts a configured PDP product into the existing
   shared PradakoEnquiryCart / PradakoCompare / PradakoSavedProducts APIs.
   ========================================================================== */
(function (window, document) {
    'use strict';

    var data = readProductData();
    if (!data) return;

    var el = {};
    var state = {
        engineeringRequested: false,
        lightboxOpen: false,
        lastFocused: null,
        currentEntryId: '',
        mobileObserver: null,
        altSelected: []
    };

    var RECENT_KEY = 'pmew-recent-products-v1';
    var MAX_RECENT = 6;


    /* Canonical catalogue registry controls only catalogue identity / wording.
       URLs stay product-data driven so adding a future catalogue never requires
       guessing routes from product names, image folders or taxonomy labels. */
    var CATALOGUE_REGISTRY = {
        standard: {
            key: 'standard',
            label: 'Standard Products',
            badge: 'STANDARD RANGE',
            catalogueLabel: 'Standard Products Catalogue'
        },
        customised: {
            key: 'customised',
            label: 'Customised Products',
            badge: 'CUSTOMISED RANGE',
            catalogueLabel: 'Customised Products Catalogue'
        },
        spotlight: {
            key: 'spotlight',
            label: 'Spotlight Products',
            badge: 'SPOTLIGHT PRODUCT',
            catalogueLabel: 'Spotlight Products'
        }
    };

    /* ----------------------------------------------------------------------
       DATA + UTILITIES
       ---------------------------------------------------------------------- */

    function readProductData() {
        var node = document.getElementById('pmew-pdp-data');
        if (!node) return null;
        try {
            return JSON.parse(node.textContent || '{}');
        } catch (error) {
            console.error('Unable to read PMEW PDP product data.', error);
            return null;
        }
    }

    function clean(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }


    function safeStorageRead(key, fallback) {
        try {
            var parsed = JSON.parse(window.localStorage.getItem(key));
            return parsed == null ? fallback : parsed;
        } catch (error) {
            return fallback;
        }
    }

    function safeStorageWrite(key, value) {
        try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage optional */ }
    }

    function toast(message, type, duration) {
        if (window.PradakoEnquiryCart && typeof window.PradakoEnquiryCart.toast === 'function') {
            window.PradakoEnquiryCart.toast(message, type || 'info', duration);
            return;
        }
        console.info('[PMEW PDP]', message);
    }

    function hash(value) {
        /* Small deterministic FNV-1a style hash. It keeps configured cart IDs
           compact while baseProductId preserves the canonical product identity. */
        var h = 2166136261;
        var str = String(value || '');
        for (var i = 0; i < str.length; i += 1) {
            h ^= str.charCodeAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        return ('00000000' + (h >>> 0).toString(16)).slice(-8);
    }

    function fillSelect(select, values) {
        if (!select) return;
        var base = select.querySelector('option[value=""]');
        var existing = base ? [base.outerHTML] : [];
        (values || []).filter(Boolean).forEach(function (value) {
            existing.push('<option value="' + escapeAttr(value) + '">' + escapeHtml(value) + '</option>');
        });
        existing.push('<option value="As per customer drawing / specification">As per drawing / specification</option>');
        existing.push('<option value="Engineering recommendation required">Let PMEW Engineering recommend</option>');
        select.innerHTML = existing.join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function escapeAttr(value) { return escapeHtml(value); }

    function isReviewValue(value) {
        value = clean(value).toLowerCase();
        return !value || value.indexOf('engineering') >= 0 || value.indexOf('drawing') >= 0 || value.indexOf('specification') >= 0;
    }


    function catalogueFor(product, fallback) {
        product = product || {};
        var raw = product.canonicalCatalogue || product.catalogueSource || product.sourcePage || {};
        var fallbackSource = fallback || null;
        var key = clean(raw.key).toLowerCase();

        /* Backward compatibility for older product records that only supplied
           sourcePage labels. Never infer from category names or asset paths. */
        if (!key) {
            var legacyLabel = clean(raw.label).toLowerCase();
            if (legacyLabel.indexOf('custom') >= 0) key = 'customised';
            else if (legacyLabel.indexOf('spotlight') >= 0 || legacyLabel.indexOf('featured') >= 0) key = 'spotlight';
            else if (legacyLabel.indexOf('standard') >= 0) key = 'standard';
        }

        if (!key && fallbackSource && fallbackSource.key) key = fallbackSource.key;
        var registry = CATALOGUE_REGISTRY[key] || {};

        var resolved = {
            key: key || clean(fallbackSource && fallbackSource.key) || 'product',
            label: clean(raw.label) || clean(registry.label) || clean(fallbackSource && fallbackSource.label) || 'Products',
            badge: clean(raw.badge) || clean(registry.badge) || clean(fallbackSource && fallbackSource.badge) || 'PRODUCT RANGE',
            catalogueLabel: clean(raw.catalogueLabel) || clean(registry.catalogueLabel) || clean(fallbackSource && fallbackSource.catalogueLabel) || 'Product Catalogue',
            rootUrl: clean(raw.rootUrl || raw.url) || clean(fallbackSource && fallbackSource.rootUrl),
            familyUrl: clean(raw.familyUrl) || clean(fallbackSource && fallbackSource.familyUrl),
            categoryUrl: clean(raw.categoryUrl) || clean(raw.familyUrl) || clean(fallbackSource && fallbackSource.categoryUrl) || clean(fallbackSource && fallbackSource.familyUrl)
        };

        if (!resolved.familyUrl) resolved.familyUrl = resolved.rootUrl;
        if (!resolved.categoryUrl) resolved.categoryUrl = resolved.familyUrl || resolved.rootUrl;
        return resolved;
    }

    function currentCatalogue() {
        return catalogueFor(data, null);
    }

    function candidateCatalogue(candidate) {
        return catalogueFor(candidate, currentCatalogue());
    }

    function canonicalOrigin() {
        var link = document.querySelector('link[rel="canonical"]');
        try {
            return link && link.href ? new URL(link.href, window.location.href).origin : window.location.origin;
        } catch (error) {
            return window.location.origin;
        }
    }

    function canonicalUrl(value) {
        value = clean(value);
        if (!value) return '';
        try { return new URL(value, canonicalOrigin()).href; } catch (error) { return value; }
    }

    /* ----------------------------------------------------------------------
       ELEMENT CACHE
       ---------------------------------------------------------------------- */

    function cacheElements() {
        el.hero = document.querySelector('[data-pdp-hero]');
        el.buybox = document.querySelector('[data-pdp-buybox]');
        el.sourceBadge = document.querySelector('[data-pdp-source-badge]');
        el.familyBadge = document.querySelector('[data-pdp-family-badge]');
        el.breadcrumbRoot = document.querySelector('[data-pdp-breadcrumb-root]');
        el.breadcrumbFamily = document.querySelector('[data-pdp-breadcrumb-family]');
        el.breadcrumbCategory = document.querySelector('[data-pdp-breadcrumb-category]');
        el.breadcrumbCurrent = document.querySelector('[data-pdp-breadcrumb-current]');
        el.size = document.querySelector('[data-pdp-size]');
        el.grade = document.querySelector('[data-pdp-grade]');
        el.material = document.querySelector('[data-pdp-material]');
        el.finish = document.querySelector('[data-pdp-finish]');
        el.quantity = document.querySelector('[data-pdp-quantity]');
        el.unit = document.querySelector('[data-pdp-unit]');
        el.quantityHint = document.querySelector('[data-pdp-quantity-hint]');
        el.pitch = document.querySelector('[data-pdp-pitch]');
        el.tolerance = document.querySelector('[data-pdp-tolerance]');
        el.testing = document.querySelector('[data-pdp-testing]');
        el.packaging = document.querySelector('[data-pdp-packaging]');
        el.customerSpec = document.querySelector('[data-pdp-customer-spec]');

        el.configurator = document.querySelector('[data-pdp-configurator]');
        el.configToggleSummary = document.querySelector('[data-pdp-config-toggle-summary]');
        el.configToggleLabel = document.querySelector('[data-pdp-config-toggle-label]');

        el.add = document.querySelector('[data-pdp-add]');
        el.addIcon = document.querySelector('[data-pdp-add-icon]');
        el.addLabel = document.querySelector('[data-pdp-add-label]');
        el.quick = document.querySelector('[data-pdp-quick-enquiry]');
        el.detailed = document.querySelector('[data-pdp-open-detailed]');
        el.reset = document.querySelector('[data-pdp-config-reset]');
        el.engineering = document.querySelector('[data-pdp-engineering-review]');
        el.save = document.querySelector('[data-pdp-save]');
        el.share = document.querySelector('[data-pdp-share]');

        el.imageOpen = document.querySelector('[data-pdp-image-open]');
        el.lightbox = document.querySelector('[data-pdp-lightbox]');
        el.lightboxClose = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-image-close]'));

        el.mobileBar = document.querySelector('[data-pdp-mobile-bar]');
        el.mobileAdd = document.querySelector('[data-pdp-mobile-add]');
        el.mobileQuick = document.querySelector('[data-pdp-mobile-quick]');

        el.anchorWrap = document.querySelector('[data-pdp-anchor-wrap]');
        el.anchorNav = document.querySelector('[data-pdp-anchor-nav]');
        el.anchorLinks = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-anchor-nav] a[href^="#"]'));
        el.pageSections = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-section][id]'));
        el.pathways = document.querySelector('[data-pdp-pathways]');
        el.pathwayCards = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-pathway]'));
        el.pathwayLinks = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-jump]'));
        el.detailedButtons = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-open-detailed]'));
        el.configApplyButtons = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-config-apply]'));
        el.altAddButtons = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-alt-add]'));
        el.altSelectButtons = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-alt-select]'));
        el.selectionBar = document.querySelector('[data-pdp-selection-bar]');
        el.selectionCount = document.querySelector('[data-pdp-selection-count]');
        el.selectionAdd = document.querySelector('[data-pdp-add-selected-alternatives]');
        el.selectionAddLabel = document.querySelector('[data-pdp-selection-add-label]');
        el.selectionCompare = document.querySelector('[data-pdp-open-selected-compare]');
        el.selectionClear = document.querySelector('[data-pdp-clear-selection]');
        el.relatedAddButtons = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-related-add]'));
        el.relatedSource = document.querySelector('[data-pdp-related-source]');
        el.relatedSourceTitle = document.querySelector('[data-pdp-related-source-title]');
        el.relatedSourceDescription = document.querySelector('[data-pdp-related-source-description]');
        el.relatedSourceLink = document.querySelector('[data-pdp-related-source-link]');
        el.relatedSourceLinkLabel = document.querySelector('[data-pdp-related-source-link-label]');
        el.recentSection = document.querySelector('[data-pdp-recent-section]');
        el.recentGrid = document.querySelector('[data-pdp-recent-grid]');
        el.recentClear = document.querySelector('[data-pdp-recent-clear]');
        el.finalAdd = document.querySelector('[data-pdp-final-add]');
        el.finalAddIcon = document.querySelector('[data-pdp-final-add-icon]');
        el.finalAddLabel = document.querySelector('[data-pdp-final-add-label]');
        el.finalDetailed = document.querySelector('[data-pdp-final-detailed]');
        el.finalEngineering = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-final-engineering]'));
    }

    /* ----------------------------------------------------------------------
       CANONICAL CATALOGUE / SOURCE CONTEXT
       ---------------------------------------------------------------------- */

    function renderCatalogueContext() {
        var source = currentCatalogue();

        if (el.sourceBadge) {
            el.sourceBadge.textContent = source.badge;
            el.sourceBadge.setAttribute('data-pdp-catalogue-key', source.key);
            el.sourceBadge.title = 'View ' + source.label;
            if (source.rootUrl) {
                el.sourceBadge.href = source.rootUrl;
                el.sourceBadge.removeAttribute('aria-disabled');
            } else {
                el.sourceBadge.removeAttribute('href');
                el.sourceBadge.setAttribute('aria-disabled', 'true');
            }
        }

        if (el.familyBadge) el.familyBadge.textContent = clean(data.family).toUpperCase() || 'PRODUCT';

        if (el.breadcrumbRoot) {
            el.breadcrumbRoot.textContent = 'Products';
            if (source.rootUrl) el.breadcrumbRoot.href = source.rootUrl;
            el.breadcrumbRoot.title = 'Browse ' + source.label;
        }
        if (el.breadcrumbFamily) {
            el.breadcrumbFamily.textContent = data.family || 'Products';
            if (data.familyUrl) el.breadcrumbFamily.href = data.familyUrl;
            else if (source.familyUrl) el.breadcrumbFamily.href = source.familyUrl;
        }
        if (el.breadcrumbCategory) {
            el.breadcrumbCategory.textContent = data.category || data.subType || 'Products';
            if (source.categoryUrl) el.breadcrumbCategory.href = source.categoryUrl;
        }
        if (el.breadcrumbCurrent) el.breadcrumbCurrent.textContent = data.name || 'Product';

        document.documentElement.setAttribute('data-pdp-catalogue', source.key);
        renderStructuredDataSource(source);
    }

    function renderStructuredDataSource(source) {
        var node = document.getElementById('pmew-pdp-schema');
        if (!node) return;
        try {
            var schema = JSON.parse(node.textContent || '{}');
            var graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
            var breadcrumbs = graph.find(function (item) { return item && item['@type'] === 'BreadcrumbList'; });
            if (!breadcrumbs || !Array.isArray(breadcrumbs.itemListElement)) return;

            var list = breadcrumbs.itemListElement;
            if (list[0]) {
                list[0].name = 'Products';
                if (source.rootUrl) list[0].item = canonicalUrl(source.rootUrl);
            }
            if (list[1]) {
                list[1].name = data.family || list[1].name;
                if (data.familyUrl || source.familyUrl) list[1].item = canonicalUrl(data.familyUrl || source.familyUrl);
            }
            if (list[2]) {
                list[2].name = data.category || data.subType || list[2].name;
                if (source.categoryUrl) list[2].item = canonicalUrl(source.categoryUrl);
            }
            if (list[3]) {
                list[3].name = data.name || list[3].name;
                if (data.url) list[3].item = canonicalUrl(data.url);
            }
            node.textContent = JSON.stringify(schema);
        } catch (error) {
            console.warn('[PMEW PDP] Structured breadcrumb source could not be updated.', error);
        }
    }

    /* ----------------------------------------------------------------------
       CHECKPOINT D — PRODUCT PATHWAYS / SECTION AVAILABILITY
       ---------------------------------------------------------------------- */

    function collection(name) {
        return Array.isArray(data[name]) ? data[name].filter(Boolean) : [];
    }

    function renderPathwayThumbs(name) {
        var hosts = Array.prototype.slice.call(document.querySelectorAll('[data-pdp-path-thumbs="' + name + '"]'));
        if (!hosts.length) return;
        var items = collection(name).slice(0, 3);
        hosts.forEach(function (host) {
            host.innerHTML = items.map(function (item) {
                if (!item.image) return '<span class="pmew-pdp-pathway-thumb-fallback"><i class="fa-solid fa-box" aria-hidden="true"></i></span>';
                return '<img src="' + escapeAttr(item.image) + '" alt="" loading="lazy" decoding="async">';
            }).join('');
        });
    }

    function renderRelatedSource() {
        var items = collection('related');
        if (!el.relatedSource || !items.length) return;

        var sources = items.map(function (item) {
            var source = candidateCatalogue(item);
            var url = source.rootUrl || source.categoryUrl || source.familyUrl;
            if (!clean(url)) return null;
            return {
                key: source.key,
                label: source.label,
                catalogueLabel: source.catalogueLabel,
                url: clean(url)
            };
        }).filter(Boolean);

        var unique = [];
        sources.forEach(function (source) {
            if (!unique.some(function (existing) { return existing.url === source.url; })) unique.push(source);
        });

        if (unique.length === 1 && sources.length === items.length) {
            var source = unique[0];
            if (el.relatedSourceTitle) el.relatedSourceTitle.textContent = source.catalogueLabel;
            if (el.relatedSourceDescription) {
                el.relatedSourceDescription.textContent = 'Browse the catalogue containing these related products.';
            }
            if (el.relatedSourceLink) {
                el.relatedSourceLink.href = source.url;
                el.relatedSourceLink.hidden = false;
            }
            if (el.relatedSourceLinkLabel) el.relatedSourceLinkLabel.textContent = 'VIEW ' + source.label.toUpperCase();
            return;
        }

        if (el.relatedSourceTitle) el.relatedSourceTitle.textContent = unique.length > 1 ? 'Multiple Product Catalogues' : 'Related Products';
        if (el.relatedSourceDescription) {
            el.relatedSourceDescription.textContent = unique.length > 1
                ? 'These related products are available across multiple PMEW catalogues.'
                : 'Browse the available product catalogue for additional options.';
        }
        if (el.relatedSourceLink) el.relatedSourceLink.hidden = true;
    }

    function renderPathways() {
        ['alternatives', 'related'].forEach(function (name) {
            var count = collection(name).length;
            document.querySelectorAll('[data-pdp-path-count="' + name + '"]').forEach(function (node) {
                node.textContent = String(count);
            });
            document.querySelectorAll('[data-pdp-pathway="' + name + '"]').forEach(function (node) {
                node.hidden = count === 0;
                node.setAttribute('aria-label', (name === 'alternatives' ? 'View ' : 'View ') + count + ' ' + name + ' for ' + data.name);
            });
            document.querySelectorAll('[data-pdp-anchor-nav] a[href="#' + name + '"]').forEach(function (node) {
                node.hidden = count === 0;
            });
            var section = document.getElementById(name);
            if (section) section.hidden = count === 0;
            if (count) renderPathwayThumbs(name);
        });
        if (el.pathways) {
            el.pathways.hidden = collection('alternatives').length === 0 && collection('related').length === 0;
        }
    }

    function markUnavailableImage(img) {
        if (!img || img.classList.contains('is-unavailable')) return;
        img.classList.add('is-unavailable');
        var parent = img.parentElement;
        if (parent) parent.classList.add('pmew-pdp-image-unavailable');
    }

    function initImageFallbacks() {
        document.querySelectorAll('.pmew-pdp-page img').forEach(function (img) {
            img.addEventListener('error', function () { markUnavailableImage(img); }, { once: true });
            if (img.complete && img.naturalWidth === 0) markUnavailableImage(img);
        });
    }

    /* ----------------------------------------------------------------------
       CONFIGURATION MODEL
       ---------------------------------------------------------------------- */

    function currentConfig() {
        return {
            size: clean(el.size && el.size.value),
            grade: clean(el.grade && el.grade.value),
            material: clean(el.material && el.material.value),
            finish: clean(el.finish && el.finish.value),
            quantity: clean(el.quantity && el.quantity.value),
            unit: clean(el.unit && el.unit.value) || 'Pieces',
            pitch: clean(el.pitch && el.pitch.value),
            tolerance: clean(el.tolerance && el.tolerance.value),
            testing: clean(el.testing && el.testing.value),
            packaging: clean(el.packaging && el.packaging.value),
            customerSpec: clean(el.customerSpec && el.customerSpec.value)
        };
    }

    function quantityValidation(config) {
        var raw = clean(config.quantity);
        if (!raw) return { valid: true, empty: true, value: null };

        var value = Number(raw.replace(/,/g, ''));
        if (!Number.isFinite(value) || value <= 0) return { valid: false, message: 'Enter a quantity greater than zero.' };

        var wholeOnly = ['Pieces', 'Boxes', 'Sets'].indexOf(config.unit) >= 0;
        if (wholeOnly && !Number.isInteger(value)) {
            return { valid: false, message: config.unit + ' must use a whole number.' };
        }

        return { valid: true, empty: false, value: value };
    }

    function reviewReasons(config) {
        var reasons = [];
        if (state.engineeringRequested) reasons.push('Engineering recommendation requested');
        if (!config.size) reasons.push('Size/thread not selected');
        if (isReviewValue(config.grade)) reasons.push('Grade/class requires engineering confirmation');
        if (isReviewValue(config.material)) reasons.push('Material requires engineering confirmation');
        if (isReviewValue(config.finish)) reasons.push('Finish/coating requires engineering confirmation');
        if (!config.quantity) reasons.push('Quantity not specified');
        if (config.grade.toLowerCase().indexOf('drawing') >= 0 ||
            config.material.toLowerCase().indexOf('drawing') >= 0 ||
            config.finish.toLowerCase().indexOf('drawing') >= 0 ||
            config.customerSpec) {
            reasons.push('Customer drawing/specification review required');
        }
        return unique(reasons);
    }

    function unique(values) {
        var seen = {};
        return (values || []).filter(function (value) {
            value = clean(value);
            if (!value || seen[value]) return false;
            seen[value] = true;
            return true;
        });
    }

    function configSummaryParts(config) {
        var bits = [];
        if (config.size) bits.push(config.size);
        if (config.grade && !isReviewValue(config.grade)) bits.push('Grade ' + config.grade);
        if (config.material && !isReviewValue(config.material)) bits.push(config.material);
        if (config.finish && !isReviewValue(config.finish)) bits.push(config.finish);
        if (config.quantity) bits.push(config.quantity + ' ' + config.unit);
        return bits;
    }

    function configKey(config) {
        return [
            config.size,
            config.grade,
            config.material,
            config.finish,
            config.quantity,
            config.unit,
            config.pitch,
            config.tolerance,
            config.testing,
            config.packaging,
            config.customerSpec,
            state.engineeringRequested ? 'engineering' : ''
        ].map(function (value) { return clean(value).toLowerCase(); }).join('|');
    }

    function currentEntry() {
        var config = currentConfig();
        var validation = quantityValidation(config);
        var reasons = reviewReasons(config);
        var key = configKey(config);
        var keyHash = hash(key || 'base-product');
        var specifications = [];

        if (config.size) specifications.push('Size/thread: ' + config.size);
        if (config.grade) specifications.push('Grade/class: ' + config.grade);
        if (config.material) specifications.push('Material: ' + config.material);
        if (config.finish) specifications.push('Finish/coating: ' + config.finish);
        if (config.pitch) specifications.push('Thread pitch/special thread: ' + config.pitch);
        if (config.tolerance) specifications.push('Tolerance/critical dimension: ' + config.tolerance);
        if (config.testing) specifications.push('Testing/inspection: ' + config.testing);
        if (config.packaging) specifications.push('Packaging: ' + config.packaging);
        if (config.customerSpec) specifications.push('Customer standard/drawing: ' + config.customerSpec);

        return {
            id: (data.baseProductId || data.id) + '::' + keyHash,
            baseProductId: data.baseProductId || data.id,
            configKey: keyHash,
            partNo: data.partNo,
            name: data.name,
            description: data.category + ' · ' + (data.attributes.primaryStandard || (data.attributes.standards || [])[0] || ''),
            category: data.category,
            family: data.family,
            familyUrl: currentCatalogue().familyUrl || data.familyUrl,
            url: data.url,
            image: data.image,
            source: currentCatalogue().key,
            sourceLabel: currentCatalogue().label,
            quantity: validation.valid ? validation.value : null,
            unit: config.unit,
            specifications: specifications.join(' · '),
            notes: state.engineeringRequested ? 'Engineering recommendation requested from PDP.' : '',
            configurationStatus: reasons.length ? 'engineering-review' : 'configured',
            reviewReasons: reasons.join(' · '),
            _config: config,
            _quantityValidation: validation
        };
    }

    function updateSummary() {
        var entry = currentEntry();
        var config = entry._config;
        var validation = entry._quantityValidation;
        var bits = configSummaryParts(config);

        if (el.quantity) el.quantity.classList.toggle('is-invalid', !validation.valid);
        if (el.quantityHint) {
            el.quantityHint.textContent = validation.valid
                ? 'Enter the required quantity.'
                : validation.message;
            el.quantityHint.style.color = validation.valid ? '' : '#b42318';
        }

        if (el.configToggleSummary) {
            el.configToggleSummary.textContent = !validation.valid
                ? 'CHECK QUANTITY · ' + validation.message
                : (bits.length
                    ? bits.join(' · ')
                    : 'ENGINEERING REVIEW · No configuration selected');
        }

        state.currentEntryId = entry.id;
        syncCartState();
        return entry;
    }

    function openConfigurator() {
        if (!el.configurator) return;
        if ('open' in el.configurator) el.configurator.open = true;
        if (el.configToggleLabel) el.configToggleLabel.textContent = 'CLOSE';
    }

    /* ----------------------------------------------------------------------
       SHARED ENQUIRY ADAPTER
       ---------------------------------------------------------------------- */

    function cart() { return window.PradakoEnquiryCart || null; }

    function cartHas(id) {
        var api = cart();
        return Boolean(api && typeof api.has === 'function' && api.has(id));
    }

    function syncCartState() {
        var entry = currentEntry();
        var api = cart();
        var added = cartHas(entry.id);
        var full = Boolean(api && typeof api.isFull === 'function' && api.isFull() && !added);

        if (el.add) {
            el.add.classList.toggle('is-added', added);
            el.add.classList.remove('is-remove-ready');
            el.add.disabled = full;
            el.add.setAttribute('aria-pressed', added ? 'true' : 'false');
        }

        if (el.addLabel) el.addLabel.textContent = added ? 'ADDED TO ENQUIRY' : (full ? 'BASKET FULL (10/10)' : 'ADD TO ENQUIRY');
        if (el.addIcon) el.addIcon.innerHTML = '<i class="fa-solid ' + (added ? 'fa-check' : 'fa-plus') + '" aria-hidden="true"></i>';

        if (el.finalAdd) {
            el.finalAdd.classList.toggle('is-added', added);
            el.finalAdd.classList.remove('is-remove-ready');
            el.finalAdd.disabled = full;
            el.finalAdd.setAttribute('aria-pressed', added ? 'true' : 'false');
        }
        if (el.finalAddLabel) el.finalAddLabel.textContent = added ? 'ADDED TO ENQUIRY' : (full ? 'BASKET FULL (10/10)' : 'ADD PRODUCT TO ENQUIRY');
        if (el.finalAddIcon) el.finalAddIcon.innerHTML = '<i class="fa-solid ' + (added ? 'fa-check' : 'fa-plus') + '" aria-hidden="true"></i>';

        if (el.mobileAdd) {
            el.mobileAdd.classList.toggle('is-added', added);
            el.mobileAdd.disabled = full;
            el.mobileAdd.innerHTML = '<i class="fa-solid ' + (added ? 'fa-check' : 'fa-plus') + '" aria-hidden="true"></i><span>' + (added ? 'ADDED' : 'ADD') + '</span>';
        }
    }

    function addOrRemoveCurrent(options) {
        options = options || {};
        var api = cart();
        if (!api) {
            toast('The shared PMEW enquiry system is not available on this page.', 'error');
            return false;
        }

        var entry = currentEntry();
        if (!entry._quantityValidation.valid) {
            openConfigurator();
            if (el.quantity) el.quantity.focus();
            toast(entry._quantityValidation.message, 'error');
            return false;
        }

        if (cartHas(entry.id)) {
            api.remove(entry.id);
            syncCartState();
            return false;
        }

        var payload = Object.assign({}, entry);
        delete payload._config;
        delete payload._quantityValidation;
        var added = api.add(payload, Boolean(options.silent));
        syncCartState();
        return Boolean(added);
    }

    function ensureCurrentInCart(silent) {
        var api = cart();
        if (!api) return false;
        var entry = currentEntry();
        if (!entry._quantityValidation.valid) {
            openConfigurator();
            if (el.quantity) el.quantity.focus();
            toast(entry._quantityValidation.message, 'error');
            return false;
        }
        if (cartHas(entry.id)) return true;
        var payload = Object.assign({}, entry);
        delete payload._config;
        delete payload._quantityValidation;
        return Boolean(api.add(payload, Boolean(silent)));
    }

    function openEnquiry(mode) {
        var api = cart();
        if (!api || typeof api.open !== 'function') {
            toast('The shared PMEW enquiry system is not available on this page.', 'error');
            return;
        }
        if (!ensureCurrentInCart(true)) return;
        api.open(mode || 'quick');
    }

    function bindAddHoverState() {
        function bindButton(button, labelNode, iconNode, addedText, removeText) {
            if (!button) return;
            function setRemoveIntent(active) {
                if (!button.classList.contains('is-added')) return;
                button.classList.toggle('is-remove-ready', Boolean(active));
                if (labelNode) labelNode.textContent = active ? removeText : addedText;
                if (iconNode) iconNode.innerHTML = '<i class="fa-solid ' + (active ? 'fa-minus' : 'fa-check') + '" aria-hidden="true"></i>';
            }
            button.addEventListener('pointerenter', function () { setRemoveIntent(true); });
            button.addEventListener('pointerleave', function () { setRemoveIntent(false); });
            button.addEventListener('focus', function () { setRemoveIntent(true); });
            button.addEventListener('blur', function () { setRemoveIntent(false); });
        }
        bindButton(el.add, el.addLabel, el.addIcon, 'ADDED TO ENQUIRY', 'REMOVE FROM ENQUIRY');
        bindButton(el.finalAdd, el.finalAddLabel, el.finalAddIcon, 'ADDED TO ENQUIRY', 'REMOVE FROM ENQUIRY');
    }

    /* ----------------------------------------------------------------------
       CHECKPOINT C — ALTERNATIVE / RELATED PRODUCT ADAPTERS
       ---------------------------------------------------------------------- */

    function candidateById(collectionName, id) {
        var list = Array.isArray(data[collectionName]) ? data[collectionName] : [];
        return list.find(function (item) { return item && item.id === id; }) || null;
    }


    function adaptSharedEnquiryButton(button, collectionName, id) {
        var api = cart();
        var candidate = candidateById(collectionName, id);
        if (!button || !candidate) return;

        button.classList.add('pmew-pdp-add');

        /* Adapter only: the shared PradakoEnquiryCart owns add/remove state,
           basket limits, hover-to-remove behaviour, toasts and persistence. */
        button.setAttribute('data-enquiry-id', candidate.id);
        button.setAttribute('data-enquiry-partno', candidate.partNo || '');
        button.setAttribute('data-enquiry-name', candidate.name || 'Product');
        button.setAttribute('data-enquiry-category', candidate.category || '');
        button.setAttribute('data-enquiry-family', candidate.family || '');
        var catalogue = candidateCatalogue(candidate);
        button.setAttribute('data-enquiry-family-url', candidate.familyUrl || catalogue.familyUrl || catalogue.rootUrl || candidate.url || '');
        button.setAttribute('data-enquiry-image', candidate.image || '');
        button.setAttribute('data-enquiry-source', catalogue.key);
        button.setAttribute('data-enquiry-source-label', catalogue.label);
        button.setAttribute('data-product-description', (candidate.category || candidate.family || '') +
            (collectionName === 'related'
                ? ' · Related product; confirm mating size, grade, geometry and application.'
                : ' · Alternative product; engineering review required before substitution.'));

        var icon = button.querySelector('[data-enquiry-icon]');
        if (!icon) {
            var existingIcon = button.querySelector('i');
            icon = document.createElement('span');
            icon.className = 'pmew-pdp-add-icon pmew-pdp-shared-enquiry-icon';
            icon.setAttribute('data-enquiry-icon', '');
            if (existingIcon) {
                existingIcon.parentNode.insertBefore(icon, existingIcon);
                icon.appendChild(existingIcon);
            } else {
                button.insertBefore(icon, button.firstChild);
            }
        }

        if (icon) icon.classList.add('pmew-pdp-add-icon', 'pmew-pdp-shared-enquiry-icon');

        var label = button.querySelector('[data-enquiry-label]');
        if (!label) {
            label = button.querySelector('span:not([data-enquiry-icon])');
            if (!label) {
                label = document.createElement('span');
                button.appendChild(label);
            }
            label.setAttribute('data-enquiry-label', '');
        }

        if (api && typeof api.syncButtons === 'function') api.syncButtons();
    }

    function adaptSharedEnquiryButtons() {
        (el.altAddButtons || []).forEach(function (button) {
            adaptSharedEnquiryButton(button, 'alternatives', button.getAttribute('data-pdp-alt-add'));
        });
        (el.relatedAddButtons || []).forEach(function (button) {
            adaptSharedEnquiryButton(button, 'related', button.getAttribute('data-pdp-related-add'));
        });
    }

    function syncCandidateStates() {
        var api = cart();
        if (api && typeof api.syncButtons === 'function') api.syncButtons();
    }

    function selectedAlternativeCandidates() {
        return state.altSelected.map(function (id) { return candidateById('alternatives', id); }).filter(Boolean);
    }

    function syncAlternativeSelection() {
        var selected = state.altSelected.slice();
        (el.altSelectButtons || []).forEach(function (button) {
            var id = button.getAttribute('data-pdp-alt-select');
            var active = selected.indexOf(id) >= 0;
            button.classList.toggle('is-selected', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
            var icon = button.querySelector('i');
            var label = button.querySelector('span');
            if (icon) icon.className = active ? 'fa-solid fa-circle-check' : 'fa-solid fa-code-compare';
            if (label) label.textContent = active ? 'SELECTED' : 'COMPARE';
            var candidate = candidateById('alternatives', id);
            var candidateName = candidate && candidate.name ? candidate.name : 'alternative product';
            button.setAttribute('aria-label', active ? ('Remove ' + candidateName + ' from comparison') : ('Select ' + candidateName + ' for comparison'));
            button.title = active ? 'Remove from comparison' : 'Select for comparison';
            var card = button.closest('[data-pdp-alt-card]');
            if (card) card.classList.toggle('is-compare-selected', active);
        });

        var visible = selected.length > 0;
        if (el.selectionBar) {
            el.selectionBar.classList.toggle('is-visible', visible);
            el.selectionBar.setAttribute('aria-hidden', visible ? 'false' : 'true');
        }
        if (el.selectionCount) el.selectionCount.textContent = String(selected.length);

        var api = cart();
        var candidates = selectedAlternativeCandidates();
        var addable = candidates.filter(function (candidate) {
            return !api || (!api.has(candidate.id) && !api.isFull());
        }).length;

        if (el.selectionAdd) el.selectionAdd.disabled = !visible || addable <= 0;
        if (el.selectionAddLabel) {
            el.selectionAddLabel.textContent = visible
                ? 'ADD ' + (addable > 0 ? addable : selected.length) + ' TO ENQUIRY'
                : 'ADD TO ENQUIRY';
        }
        if (el.selectionCompare) el.selectionCompare.disabled = !visible;
    }

    function toggleAlternativeSelection(id) {
        if (!candidateById('alternatives', id)) return;
        var index = state.altSelected.indexOf(id);
        if (index >= 0) {
            state.altSelected.splice(index, 1);
            syncAlternativeSelection();
            return;
        }
        var compare = window.PradakoCompare;
        var max = compare && Number(compare.MAX) ? Math.max(1, Number(compare.MAX) - 1) : 3;
        if (state.altSelected.length >= max) {
            toast('Select up to ' + max + ' alternatives. The current product occupies the first comparison column.', 'warning', 4200);
            return;
        }
        state.altSelected.push(id);
        syncAlternativeSelection();
    }

    function clearAlternativeSelection() {
        state.altSelected = [];
        syncAlternativeSelection();
    }

    function addSelectedAlternativesToEnquiry() {
        var api = cart();
        var candidates = selectedAlternativeCandidates();
        if (!api || !candidates.length) return;

        var added = 0;
        var skipped = 0;
        candidates.forEach(function (candidate) {
            if (api.has(candidate.id) || api.isFull()) { skipped += 1; return; }
            var catalogue = candidateCatalogue(candidate);
            var ok = api.add({
                id: candidate.id,
                partNo: candidate.partNo,
                name: candidate.name,
                category: candidate.category || candidate.subType || '',
                family: candidate.family || '',
                familyUrl: candidate.familyUrl || catalogue.familyUrl || catalogue.rootUrl || '',
                url: candidate.url || '',
                image: candidate.image || '',
                source: catalogue.key,
                sourceLabel: catalogue.label
            }, true);
            if (ok) added += 1; else skipped += 1;
        });

        if (added && skipped) {
            api.toast(added + ' added, ' + skipped + ' skipped. The enquiry basket may already contain them or be full.', 'warning');
        } else if (added) {
            api.toast(added + ' product' + (added === 1 ? '' : 's') + ' added to your enquiry.', 'success');
        } else {
            api.toast('These selected products are already in the enquiry basket, or the basket is full.', 'warning');
        }
        syncAlternativeSelection();
    }

    function candidateCompareProduct(candidate) {
        return {
            id: candidate.id,
            partNo: candidate.partNo,
            name: candidate.name,
            family: candidate.family,
            category: candidate.category,
            subType: candidate.subType,
            image: candidate.image,
            url: candidate.url,
            attributes: candidate.attributes || {},
            comparisonRole: 'alternative'
        };
    }

    function openSelectedAlternativeComparison() {
        var compare = window.PradakoCompare;
        if (!compare || typeof compare.add !== 'function' || typeof compare.open !== 'function') {
            toast('The shared PMEW comparison system is not available on this page.', 'error');
            return;
        }
        if (!state.altSelected.length) {
            toast('Select at least one Alternative Product to compare with ' + data.name + '.', 'warning');
            return;
        }

        /* Establish a clean PDP comparison context. The current product is
           added first and locked; clear() then removes any old removable
           selections while preserving that reference product. */
        if (!compare.has(data.id)) compare.add(compareProduct());
        if (typeof compare.clear === 'function') compare.clear();
        if (!compare.has(data.id)) compare.add(compareProduct());

        state.altSelected.forEach(function (id) {
            var candidate = candidateById('alternatives', id);
            if (candidate && !compare.has(candidate.id)) compare.add(candidateCompareProduct(candidate));
        });
        compare.open();
    }

    function applyConfigurationAlternative(button) {
        var axis = button.getAttribute('data-axis');
        var value = button.getAttribute('data-value') || '';
        var target = axis === 'grade' ? el.grade : (axis === 'finish' ? el.finish : null);
        if (!target) return;
        target.value = value;
        state.engineeringRequested = false;
        updateSummary();
        toast(value + ' applied to the current Square Nuts configuration.', 'success', 2800);
        if (el.configurator) {
            openConfigurator();
            var top = window.scrollY + el.configurator.getBoundingClientRect().top - sectionOffset() - 12;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    }

    /* ----------------------------------------------------------------------
       CHECKPOINT C — RECENTLY VIEWED
       ---------------------------------------------------------------------- */

    function productTypeLabel(item) {
        item = item || {};
        var raw = clean(item.productType || item.subType || item.family || item.category || 'Product').toLowerCase();
        if (raw.indexOf('threaded rod') >= 0) return 'THREADED ROD';
        if (raw.indexOf('screw') >= 0) return 'SCREW';
        if (raw.indexOf('bolt') >= 0) return 'BOLT';
        if (raw.indexOf('washer') >= 0) return 'WASHER';
        if (raw.indexOf('nut') >= 0) return 'NUT';
        if (raw.indexOf('rivet') >= 0) return 'RIVET';
        if (raw.indexOf('stud') >= 0) return 'STUD';
        if (raw.indexOf('pin') >= 0) return 'PIN';
        if (raw.indexOf('bush') >= 0) return 'BUSH';
        if (raw.indexOf('plug') >= 0) return 'PLUG';
        return clean(item.productType || item.subType || item.family || 'PRODUCT').toUpperCase();
    }

    function recentDescription(item) {
        if (clean(item && item.description)) return clean(item.description);
        if (clean(item && item.category)) return clean(item.category) + ' product previously viewed on PMEW.';
        return 'Previously viewed PMEW product.';
    }

    function renderRecentlyViewed() {
        if (!el.recentSection || !el.recentGrid) return;
        var items = safeStorageRead(RECENT_KEY, []);
        if (!Array.isArray(items)) items = [];
        items = items.filter(function (item) { return item && item.id && item.id !== data.id; }).slice(0, MAX_RECENT);
        if (!items.length) {
            el.recentSection.hidden = true;
            el.recentGrid.innerHTML = '';
            return;
        }

        el.recentGrid.innerHTML = items.map(function (item) {
            var url = item.url || '#';
            var sourceKey = clean(item.source || 'product');
            var sourceLabel = clean(item.sourceLabel || 'Product');
            var family = clean(item.family || item.category || '');
            var category = clean(item.category || '');
            var description = recentDescription(item);

            return '<article class="pmew-pdp-product-card pmew-pdp-recent-card" data-product-id="' + escapeAttr(item.id) + '">' +
                '<div class="pmew-pdp-product-card-media">' +
                    '<span class="pmew-pdp-product-type">' + escapeHtml(productTypeLabel(item)) + '</span>' +
                    (item.image ? '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.name || 'Recently viewed product') + '" loading="lazy" decoding="async">' : '') +
                '</div>' +
                '<div class="pmew-pdp-product-card-body">' +
                    '<span class="pmew-pdp-product-number">' + escapeHtml(item.partNo || '') + '</span>' +
                    '<h3>' + escapeHtml(item.name || 'Product') + '</h3>' +
                    '<p>' + escapeHtml(description) + '</p>' +
                    '<span class="pmew-pdp-product-card-accent" aria-hidden="true"></span>' +
                '</div>' +
                '<div class="pmew-pdp-product-card-actions">' +
                    '<a class="pmew-pdp-product-view" href="' + escapeAttr(url) + '">' +
                        '<span>View Product</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i>' +
                    '</a>' +
                    '<button type="button" class="pmew-pdp-add pmew-pdp-recent-enquiry"' +
                        ' data-enquiry-id="' + escapeAttr(item.id) + '"' +
                        ' data-enquiry-partno="' + escapeAttr(item.partNo || '') + '"' +
                        ' data-enquiry-name="' + escapeAttr(item.name || 'Product') + '"' +
                        ' data-enquiry-category="' + escapeAttr(category) + '"' +
                        ' data-enquiry-family="' + escapeAttr(family) + '"' +
                        ' data-enquiry-family-url="' + escapeAttr(item.familyUrl || url) + '"' +
                        ' data-enquiry-image="' + escapeAttr(item.image || '') + '"' +
                        ' data-enquiry-source="' + escapeAttr(sourceKey) + '"' +
                        ' data-enquiry-source-label="' + escapeAttr(sourceLabel) + '"' +
                        ' data-product-url="' + escapeAttr(url) + '"' +
                        ' data-product-description="' + escapeAttr(description) + '">' +
                        '<span class="pmew-pdp-add-icon pmew-pdp-shared-enquiry-icon" data-enquiry-icon><i class="fa-solid fa-plus" aria-hidden="true"></i></span>' +
                        '<span data-enquiry-label>Add to Enquiry</span>' +
                    '</button>' +
                '</div>' +
            '</article>';
        }).join('');

        el.recentSection.hidden = false;
        var api = cart();
        if (api && typeof api.syncButtons === 'function') api.syncButtons();
    }

    function clearRecentlyViewed() {
        safeStorageWrite(RECENT_KEY, []);
        renderRecentlyViewed();
        toast('Recently viewed product history cleared.', 'info', 2400);
    }

    /* ----------------------------------------------------------------------
       SHARED SAVED PRODUCTS ADAPTER / SHARE / COPY
       ---------------------------------------------------------------------- */

    function savedProductIdentity() {
        var source = currentCatalogue();
        return {
            entityType: 'product',
            id: data.baseProductId || data.id,
            baseProductId: data.baseProductId || data.id,
            partNo: data.partNo,
            name: data.name,
            category: data.family || data.category,
            family: data.category || data.subType,
            familyUrl: source.familyUrl || data.familyUrl,
            image: data.image,
            url: data.url,
            source: source.key,
            sourceLabel: source.label,
            catalogueUrl: source.rootUrl,
            savedFrom: 'pdp'
        };
    }

    function initSavedProduct() {
        if (!el.save) return;
        var api = window.PradakoSavedProducts;
        if (!api || typeof api.bind !== 'function') {
            el.save.hidden = true;
            console.warn('[PMEW PDP] Shared Saved Products module is unavailable; Save control hidden.');
            return;
        }
        if (typeof api.mount === 'function') api.mount();
        api.bind(el.save, savedProductIdentity());
    }

    async function copyText(value, successMessage) {
        value = clean(value);
        if (!value) return false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(value);
            } else {
                var area = document.createElement('textarea');
                area.value = value;
                area.setAttribute('readonly', '');
                area.style.position = 'fixed';
                area.style.opacity = '0';
                document.body.appendChild(area);
                area.select();
                document.execCommand('copy');
                area.remove();
            }
            toast(successMessage || 'Copied to clipboard.', 'success', 2600);
            return true;
        } catch (error) {
            toast('Unable to copy automatically. Please copy it manually.', 'error');
            return false;
        }
    }

    function shareProduct() {
        var payload = {
            title: data.name + ' — ' + data.partNo + ' | Pradako',
            text: data.name + ' · ' + data.partNo,
            url: new URL(data.url || window.location.pathname, window.location.origin).href
        };
        if (navigator.share) {
            navigator.share(payload).catch(function () { /* user cancellation is not an error */ });
        } else {
            copyText(payload.url, 'Product link copied.');
        }
    }

    /* ----------------------------------------------------------------------
       COMPARE ADAPTER — CURRENT SHARED API ONLY
       ---------------------------------------------------------------------- */

    function compareProduct() {
        return {
            id: data.id,
            partNo: data.partNo,
            name: data.name,
            family: data.family,
            category: data.category,
            subType: data.subType,
            image: data.image,
            url: data.url,
            attributes: data.attributes || {},
            comparisonRole: 'current',
            locked: true
        };
    }

    /* ----------------------------------------------------------------------
       LIGHTBOX
       ---------------------------------------------------------------------- */

    function openLightbox() {
        if (!el.lightbox || state.lightboxOpen) return;
        state.lightboxOpen = true;
        state.lastFocused = document.activeElement;
        el.lightbox.hidden = false;
        el.lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('pmew-pdp-lightbox-open');
        var close = el.lightbox.querySelector('[data-pdp-image-close]:not(.pmew-pdp-lightbox-backdrop)');
        if (close) window.setTimeout(function () { close.focus(); }, 30);
    }

    function closeLightbox() {
        if (!el.lightbox || !state.lightboxOpen) return;
        state.lightboxOpen = false;
        el.lightbox.hidden = true;
        el.lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('pmew-pdp-lightbox-open');
        if (state.lastFocused && typeof state.lastFocused.focus === 'function') state.lastFocused.focus();
    }

    /* ----------------------------------------------------------------------
       RECENTLY VIEWED
       ---------------------------------------------------------------------- */

    function rememberRecentlyViewed() {
        var items = safeStorageRead(RECENT_KEY, []);
        if (!Array.isArray(items)) items = [];
        items = items.filter(function (item) { return item && item.id !== data.id; });

        var source = currentCatalogue();
        items.unshift({
            id: data.id,
            baseProductId: data.baseProductId || data.id,
            partNo: data.partNo,
            name: data.name,
            description: clean(data.description),
            family: data.family,
            category: data.category,
            subType: data.subType,
            image: data.image,
            url: data.url,
            familyUrl: source.familyUrl || source.rootUrl || data.url,
            source: source.key,
            sourceLabel: source.label,
            viewedAt: new Date().toISOString()
        });
        safeStorageWrite(RECENT_KEY, items.slice(0, MAX_RECENT));
    }

    /* ----------------------------------------------------------------------
       HEADER OFFSET + MOBILE ACTION VISIBILITY
       ---------------------------------------------------------------------- */

    function measureHeader() {
        var host = document.getElementById('navbar-container');
        var offset = 0;
        if (host && host.getClientRects().length) {
            var candidates = [host].concat(Array.prototype.slice.call(host.querySelectorAll('header, nav, .main-header, .pmew-site-header, .navbar, [data-sticky-header]')));
            candidates.forEach(function (node) {
                if (!node.getClientRects().length) return;
                var style = window.getComputedStyle(node);
                var rect = node.getBoundingClientRect();
                var pinned = style.position === 'fixed' || style.position === 'sticky';
                if (pinned && rect.top <= 2 && rect.bottom > 0) offset = Math.max(offset, rect.bottom);
            });
        }
        document.documentElement.style.setProperty('--pdp-header-offset', Math.max(0, Math.round(offset)) + 'px');
        if (typeof scheduleActiveAnchor === 'function') scheduleActiveAnchor();
    }

    function initHeaderObserver() {
        var host = document.getElementById('navbar-container');
        measureHeader();
        if (host && 'ResizeObserver' in window) new ResizeObserver(measureHeader).observe(host);
        if (host && 'MutationObserver' in window) {
            new MutationObserver(measureHeader).observe(host, { childList: true, subtree: true, attributes: true });
        }
        window.addEventListener('resize', measureHeader, { passive: true });
        window.addEventListener('orientationchange', measureHeader, { passive: true });
    }

    function initMobileBar() {
        if (!el.mobileBar || !el.add) return;
        if (!('IntersectionObserver' in window)) return;
        state.mobileObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var show = !entry.isIntersecting && window.matchMedia('(max-width: 768px)').matches;
                el.mobileBar.classList.toggle('is-visible', show);
                el.mobileBar.setAttribute('aria-hidden', show ? 'false' : 'true');
            });
        }, { threshold: 0.05 });
        state.mobileObserver.observe(el.add);
    }

    /* ----------------------------------------------------------------------
       CHECKPOINT B: STICKY SECTION NAVIGATION
       ---------------------------------------------------------------------- */

    var navFrame = 0;

    function sectionOffset() {
        var raw = getComputedStyle(document.documentElement).getPropertyValue('--pdp-header-offset');
        var header = parseInt(raw, 10) || 0;
        var anchor = el.anchorWrap ? el.anchorWrap.getBoundingClientRect().height : 0;
        return header + anchor + 28;
    }

    function centerAnchorHorizontally(link) {
        if (!link || !el.anchorNav) return;
        var rail = el.anchorNav;
        var linkLeft = link.offsetLeft;
        var linkRight = linkLeft + link.offsetWidth;
        var viewLeft = rail.scrollLeft;
        var viewRight = viewLeft + rail.clientWidth;
        if (linkLeft >= viewLeft + 12 && linkRight <= viewRight - 12) return;
        var targetLeft = linkLeft - Math.max(0, (rail.clientWidth - link.offsetWidth) / 2);
        try { rail.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' }); }
        catch (error) { rail.scrollLeft = Math.max(0, targetLeft); }
    }

    function scrollToSection(target) {
        if (!target) return;
        var node = typeof target === 'string' ? document.querySelector(target) : target;
        if (!node) return;
        var top = window.scrollY + node.getBoundingClientRect().top - sectionOffset() + 3;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        if (node.id) {
            setActiveAnchor(node.id);
            try { window.history.replaceState(null, '', '#' + node.id); } catch (error) { /* hash is optional */ }
        }
    }

    function setActiveAnchor(id) {
        if (!id || !el.anchorLinks || !el.anchorLinks.length) return;
        el.anchorLinks.forEach(function (link) {
            var active = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', active);
            if (active) {
                link.setAttribute('aria-current', 'location');
                /* IMPORTANT: never call link.scrollIntoView() here. That API can
                   alter the document's vertical scroll position and fight the
                   mouse wheel / browser scrollbar. Only the horizontal nav rail
                   is allowed to move during active-section synchronisation. */
                centerAnchorHorizontally(link);
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function updateActiveAnchor() {
        navFrame = 0;
        if (!el.pageSections || !el.pageSections.length) return;
        var offset = sectionOffset();
        var active = el.pageSections[0];
        el.pageSections.forEach(function (section) {
            if (section.getBoundingClientRect().top <= offset) active = section;
        });
        if (active && active.id) setActiveAnchor(active.id);
    }

    function scheduleActiveAnchor() {
        if (navFrame) return;
        navFrame = window.requestAnimationFrame(updateActiveAnchor);
    }

    function initSectionNavigation() {
        if (!el.anchorNav) return;
        el.anchorNav.addEventListener('click', function (event) {
            var link = event.target.closest('a[href^="#"]');
            if (!link) return;
            var target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            scrollToSection(target);
        });
        window.addEventListener('scroll', scheduleActiveAnchor, { passive: true });
        window.addEventListener('resize', scheduleActiveAnchor, { passive: true });
        window.addEventListener('orientationchange', scheduleActiveAnchor, { passive: true });
        window.addEventListener('pmew:shell-loaded', scheduleActiveAnchor);
        window.addEventListener('pageshow', scheduleActiveAnchor, { passive: true });
        updateActiveAnchor();
    }

    /* ----------------------------------------------------------------------
       RESET / ENGINEERING REVIEW
       ---------------------------------------------------------------------- */

    function resetConfigurator() {
        state.engineeringRequested = false;
        [el.size, el.quantity, el.pitch, el.tolerance, el.testing, el.packaging, el.customerSpec].forEach(function (node) {
            if (node) node.value = '';
        });
        [el.grade, el.material, el.finish].forEach(function (node) { if (node) node.value = ''; });
        if (el.unit) el.unit.value = 'Pieces';
        updateSummary();
        toast('Product configuration reset.', 'info', 2400);
    }

    function requestEngineeringReview() {
        state.engineeringRequested = true;
        [el.grade, el.material, el.finish].forEach(function (node) { if (node) node.value = 'Engineering recommendation required'; });
        updateSummary();
        toast('PMEW Engineering recommendation selected. Add any size, quantity or drawing reference you know.', 'info', 4200);
    }

    /* ----------------------------------------------------------------------
       EVENTS
       ---------------------------------------------------------------------- */

    function bindEvents() {
        var inputs = [el.size, el.grade, el.material, el.finish, el.quantity, el.unit, el.pitch, el.tolerance, el.testing, el.packaging, el.customerSpec].filter(Boolean);
        inputs.forEach(function (node) {
            node.addEventListener(node.tagName === 'SELECT' ? 'change' : 'input', function () {
                state.engineeringRequested = false;
                updateSummary();
            });
        });

        if (el.add) el.add.addEventListener('click', function () { addOrRemoveCurrent(); });
        if (el.quick) el.quick.addEventListener('click', function () { openEnquiry('quick'); });
        if (el.configurator) {
            el.configurator.addEventListener('toggle', function () {
                if (el.configToggleLabel) el.configToggleLabel.textContent = el.configurator.open ? 'CLOSE' : 'OPEN';
            });
        }
        (el.detailedButtons || []).forEach(function (button) {
            button.addEventListener('click', function () { openEnquiry('detailed'); });
        });
        if (el.reset) el.reset.addEventListener('click', resetConfigurator);
        if (el.engineering) el.engineering.addEventListener('click', requestEngineeringReview);
        if (el.share) el.share.addEventListener('click', shareProduct);

        document.querySelectorAll('[data-copy-partno]').forEach(function (button) {
            button.addEventListener('click', function () {
                copyText(button.getAttribute('data-copy-partno') || data.partNo, 'Pradako Product No. copied.');
            });
        });

        if (el.imageOpen) el.imageOpen.addEventListener('click', openLightbox);
        el.lightboxClose.forEach(function (button) { button.addEventListener('click', closeLightbox); });

        if (el.mobileAdd) el.mobileAdd.addEventListener('click', function () { addOrRemoveCurrent(); });
        if (el.mobileQuick) el.mobileQuick.addEventListener('click', function () { openEnquiry('quick'); });

        (el.pathwayLinks || []).forEach(function (link) {
            link.addEventListener('click', function (event) {
                var selector = link.getAttribute('data-pdp-jump') || link.getAttribute('href');
                var target = selector ? document.querySelector(selector) : null;
                if (!target) return;
                event.preventDefault();
                scrollToSection(target);
            });
        });

        (el.configApplyButtons || []).forEach(function (button) {
            button.addEventListener('click', function () { applyConfigurationAlternative(button); });
        });
        (el.altSelectButtons || []).forEach(function (button) {
            button.addEventListener('click', function () { toggleAlternativeSelection(button.getAttribute('data-pdp-alt-select')); });
        });
        if (el.selectionAdd) el.selectionAdd.addEventListener('click', addSelectedAlternativesToEnquiry);
        if (el.selectionCompare) el.selectionCompare.addEventListener('click', openSelectedAlternativeComparison);
        if (el.selectionClear) el.selectionClear.addEventListener('click', clearAlternativeSelection);
        if (el.recentClear) el.recentClear.addEventListener('click', clearRecentlyViewed);
        if (el.finalAdd) el.finalAdd.addEventListener('click', function () { addOrRemoveCurrent(); });
        if (el.finalDetailed) el.finalDetailed.addEventListener('click', function () { openEnquiry('detailed'); });
        (el.finalEngineering || []).forEach(function (button) {
            button.addEventListener('click', function () { requestEngineeringReview(); openEnquiry('detailed'); });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && state.lightboxOpen) closeLightbox();
        });

        if (window.PradakoEnquiryCart && typeof window.PradakoEnquiryCart.on === 'function') {
            window.PradakoEnquiryCart.on('change', function () { syncCartState(); syncCandidateStates(); });
        }
    }

    /* ----------------------------------------------------------------------
       INIT
       ---------------------------------------------------------------------- */

    function init() {
        cacheElements();
        renderCatalogueContext();
        renderPathways();
        renderRelatedSource();
        initImageFallbacks();
        fillSelect(el.grade, (data.attributes || {}).grades || []);
        fillSelect(el.material, (data.attributes || {}).materials || []);
        fillSelect(el.finish, (data.attributes || {}).finishes || []);
        rememberRecentlyViewed();
        renderRecentlyViewed();
        initSavedProduct();
        updateSummary();
        adaptSharedEnquiryButtons();
        syncCandidateStates();
        syncAlternativeSelection();
        bindAddHoverState();
        bindEvents();
        initHeaderObserver();
        initSectionNavigation();
        initMobileBar();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();

}(window, document));
