/* ==========================================================================
   PRADAKO / PMEW — SHARED PRODUCT ENQUIRY SYSTEM
   --------------------------------------------------------------------------
   Shared across product pages. Backward-compatible with the existing
   window.PradakoEnquiryCart API used by Customised Products.

   UI/UX standard:
   - persistent enquiry cart launcher
   - Quick Enquiry / Detailed RFQ drawer
   - saved enquiry recovery notification
   - shared success / info / warning / removal / error toasts
   - browser-side draft recovery (technical fields only; buyer PII is excluded)
   - 10-product basket cap
   - drawing/specification upload validation
   - smart recovery notice: silent for empty state, compact for draft-only recovery
   ========================================================================== */
(function (window, document) {
    'use strict';

    if (window.PradakoEnquiryCart && window.PradakoEnquiryCart.__pmewSharedV2) return;

    var MAX = 10;
    var CART_KEY = 'pmew-product-enquiry-cart-v2';
    var DRAFT_KEY = 'pmew-product-enquiry-draft-v2';
    var DRAFT_VERSION = 2;
    var DRAFT_DEBOUNCE = 240;
    var MAX_FILES = 5;
    var MAX_FILE_SIZE = 20 * 1024 * 1024;
    var ALLOWED_EXTENSIONS = ['pdf','step','stp','iges','igs','dwg','dxf','png','jpg','jpeg','xlsx'];

    var listeners = { change: [] };
    var state = {
        mounted: false,
        cart: [],
        mode: 'quick',
        lastFocused: null,
        drawerOpen: false,
        formDirty: false,
        restoredDraft: false,
        returnNoticeDismissed: false,
        returnNoticeTimer: 0,
        draftTimer: 0,
        submissionComplete: false,
        toastSequence: 0,
        toastTimers: {},
        uploadFiles: []
    };

    var ui = {};

    function clean(value) { return String(value == null ? '' : value).replace(/\s+/g, ' ').trim(); }
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;').replace(/'/g, '&#039;');
    }
    function escapeAttr(value) { return escapeHtml(value); }

    /* Font Awesome is used for the three product-action states only.
       The rest of the shared enquiry UI keeps its existing icon system. */
    function enquiryActionIcon(name) {
        var icons = {
            plus: 'fa-plus',
            minus: 'fa-minus',
            check: 'fa-check'
        };
        var className = icons[name] || icons.plus;
        return '<i class="fa-solid ' + className + '" aria-hidden="true"></i>';
    }

    function icon(name) {
        var icons = {
            plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
            check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            remove: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12M10 11v6M14 11v6M9 7l1-2h4l1 2m-8 0 1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            enquiry: '<i class="fa-solid fa-file-signature" aria-hidden="true"></i>',
            close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v5h5M9 13h6M9 17h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V5m0 0L8 9m4-4 4 4M5 15v4h14v-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.8-2.9 8.1-7 10-4.1-1.9-7-5.2-7-10V6z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10v6M12 7h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 20H3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v5m0 3h.01" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            compare: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14M5 8l3-3 3 3M13 16l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
        return '<span class="pmew-icon" aria-hidden="true">' + (icons[name] || icons.info) + '</span>';
    }

    function endpoint() {
        var host = document.querySelector('[data-pmew-enquiry-endpoint]');
        return clean(host && host.getAttribute('data-pmew-enquiry-endpoint')) || '/php/submit-featured-enquiry.php';
    }

    function normaliseProduct(raw) {
        raw = raw || {};
        var id = clean(raw.id || raw.productId || raw.partNo || raw.name);
        var name = clean(raw.name || raw.productName || raw.label);
        if (!id || !name) return null;
        var source = clean(raw.source || raw.productSource || 'customised');
        var sourceLabel = clean(raw.sourceLabel || raw.productSourceLabel) || (source === 'standard' ? 'Standard Product' : 'Customise Product');
        var quantity = raw.quantity == null || raw.quantity === '' ? null : Number(raw.quantity);
        if (!Number.isFinite(quantity)) quantity = null;
        return {
            id: id,
            baseProductId: clean(raw.baseProductId),
            configKey: clean(raw.configKey),
            partNo: clean(raw.partNo),
            name: name,
            description: clean(raw.description),
            category: clean(raw.category),
            family: clean(raw.family),
            familyUrl: clean(raw.familyUrl || raw.url),
            url: clean(raw.url || raw.familyUrl),
            image: clean(raw.image),
            source: source,
            sourceLabel: sourceLabel,
            quantity: quantity,
            unit: clean(raw.unit),
            specifications: clean(raw.specifications),
            notes: clean(raw.notes),
            configurationStatus: clean(raw.configurationStatus),
            reviewReasons: clean(raw.reviewReasons)
        };
    }

    function productFromElement(element) {
        if (!element || !element.dataset) return null;

        /* Backward-compatible shared attribute contract.
           Cross-Reference and other technical product pages can now pass
           configuration/specification context without creating a second cart. */
        return normaliseProduct({
            id: element.dataset.enquiryId || element.dataset.productId,
            baseProductId: element.dataset.enquiryBaseProductId || element.dataset.baseProductId || '',
            configKey: element.dataset.enquiryConfigKey || element.dataset.configKey || '',
            partNo: element.dataset.enquiryPartno || element.dataset.productPartno || '',
            name: element.dataset.enquiryName || element.dataset.productName,
            description: element.dataset.enquiryDescription || element.dataset.productDescription || '',
            category: element.dataset.enquiryCategory || element.dataset.productCategory,
            family: element.dataset.enquiryFamily || element.dataset.productFamily || '',
            familyUrl: element.dataset.enquiryFamilyUrl || element.dataset.productUrl,
            url: element.dataset.productUrl || element.dataset.enquiryFamilyUrl,
            image: element.dataset.enquiryImage || element.dataset.productImage,
            source: element.dataset.enquirySource || element.dataset.productSource || 'customised',
            sourceLabel: element.dataset.enquirySourceLabel || element.dataset.productSourceLabel || '',
            quantity: element.dataset.enquiryQuantity || '',
            unit: element.dataset.enquiryUnit || '',
            specifications: element.dataset.enquirySpecifications || element.dataset.productSpecifications || '',
            notes: element.dataset.enquiryNotes || '',
            configurationStatus: element.dataset.enquiryConfigurationStatus || '',
            reviewReasons: element.dataset.enquiryReviewReasons || ''
        });
    }

    function emit(type, payload) {
        (listeners[type] || []).slice().forEach(function (fn) {
            try { fn(payload); } catch (error) { console.error(error); }
        });
    }

    function on(type, fn) {
        if (!listeners[type]) listeners[type] = [];
        if (typeof fn === 'function') listeners[type].push(fn);
        return function () {
            listeners[type] = (listeners[type] || []).filter(function (item) { return item !== fn; });
        };
    }

    function loadCart() {
        /* The v2 cart is the source of truth once it exists — including when
           it intentionally contains an empty array. Previously an empty v2
           cart fell through to legacy storage keys, which could resurrect a
           product that the user had already removed before refreshing. */
        try {
            var currentRaw = localStorage.getItem(CART_KEY);
            if (currentRaw !== null) {
                var current = JSON.parse(currentRaw || '[]');
                if (!Array.isArray(current)) return [];
                return current.map(normaliseProduct).filter(Boolean).slice(0, MAX);
            }
        } catch (error) {
            return [];
        }

        /* Legacy keys are consulted only once, before the v2 key has ever
           been created. init() immediately writes the migrated result to v2. */
        var legacyKeys = ['pradako_product_enquiry_v1', 'pmew-customised-products-enquiry-v1', 'pmew-featured-enquiry-cart-v1'];
        for (var i = 0; i < legacyKeys.length; i += 1) {
            try {
                var parsed = JSON.parse(localStorage.getItem(legacyKeys[i]) || '[]');
                if (Array.isArray(parsed) && parsed.length) {
                    return parsed.map(normaliseProduct).filter(Boolean).slice(0, MAX);
                }
            } catch (error) {}
        }
        return [];
    }

    function saveCart() {
        try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart.slice(0, MAX))); } catch (error) {}
    }

    function has(id) { return state.cart.some(function (item) { return item.id === clean(id); }); }
    function count() { return state.cart.length; }
    function isFull() { return state.cart.length >= MAX; }
    function items() { return state.cart.map(function (item) { return Object.assign({}, item); }); }

    function baseProductIdOf(item) {
        if (!item) return '';
        if (item.baseProductId) return clean(item.baseProductId);
        return clean(item.id).split('::cfg-')[0];
    }

    function findByBase(baseProductId) {
        baseProductId = clean(baseProductId);
        if (!baseProductId) return [];
        return state.cart.filter(function (item) { return baseProductIdOf(item) === baseProductId; })
            .map(function (item) { return Object.assign({}, item); });
    }

    function updateAllButtons() {
        document.querySelectorAll('[data-enquiry-id], [data-product-id][data-product-name]').forEach(function (button) {
            if (!(button instanceof HTMLElement)) return;
            var product = productFromElement(button);
            if (!product) return;

            var added = has(product.id);
            var full = isFull() && !added;

            /* Three explicit states:
               1) Add    = PMEW navy
               2) Added  = green confirmation
               3) Remove = red, revealed intentionally on hover/focus of an added item */
            button.classList.toggle('is-added', added);
            button.classList.remove('is-remove-ready');
            button.setAttribute('aria-pressed', String(added));

            if (full) button.setAttribute('disabled', 'disabled');
            else button.removeAttribute('disabled');

            var label = button.querySelector('[data-enquiry-label]');
            if (label) {
                label.textContent = added
                    ? 'Added to Enquiry'
                    : (full ? 'Basket Full (10/10)' : 'Add to Enquiry');
            }

            var iconHost = button.querySelector('[data-enquiry-icon]');
            if (iconHost) iconHost.innerHTML = added ? enquiryActionIcon('check') : enquiryActionIcon('plus');

            if (added) {
                button.title = 'Added to enquiry — hover or focus to remove';
                button.setAttribute('aria-label', product.name + ' added to enquiry. Activate to remove.');
            } else if (full) {
                button.title = 'Enquiry basket is full';
                button.setAttribute('aria-label', 'Enquiry basket full. Cannot add ' + product.name + '.');
            } else {
                button.title = 'Add to enquiry';
                button.setAttribute('aria-label', 'Add ' + product.name + ' to enquiry.');
            }
        });

        document.querySelectorAll('[data-cart-badge]').forEach(function (node) {
            node.textContent = count() + '/' + MAX;
        });
    }

    function setRemoveIntent(button, active) {
        if (!button || !button.classList || !button.classList.contains('is-added')) return;

        var product = productFromElement(button);
        if (!product) return;

        active = Boolean(active);
        button.classList.toggle('is-remove-ready', active);
        button.setAttribute('data-enquiry-state', active ? 'remove' : 'added');
        button.title = active ? 'Remove from enquiry' : 'Added to enquiry — hover or focus to remove';
        button.setAttribute('aria-label', active
            ? 'Remove ' + product.name + ' from enquiry.'
            : product.name + ' added to enquiry. Activate to remove.');

        var label = button.querySelector('[data-enquiry-label]');
        if (label) label.textContent = active ? 'Remove from Enquiry' : 'Added to Enquiry';

        var iconHost = button.querySelector('[data-enquiry-icon]');
        if (iconHost) iconHost.innerHTML = active ? enquiryActionIcon('minus') : enquiryActionIcon('check');
    }

    function add(raw, silent) {
        var product = normaliseProduct(raw);
        if (!product) return false;
        if (has(product.id)) {
            if (!silent) toast(product.name + ' is already selected for enquiry.', 'info');
            return true;
        }
        if (isFull()) {
            if (!silent) toast('You can select a maximum of ' + MAX + ' products in one enquiry.', 'error', 5200);
            return false;
        }
        state.cart.push(product);
        state.submissionComplete = false;
        saveCart();
        renderCart();
        syncRequirementType();
        updateAllButtons();
        emit('change', items());
        if (!silent) toast(product.name + ' added to your enquiry.', 'success');
        return true;
    }

    function remove(id, silent) {
        id = clean(id);
        var removed = state.cart.filter(function (item) { return item.id === id; })[0];
        if (!removed) return false;
        state.cart = state.cart.filter(function (item) { return item.id !== id; });
        state.submissionComplete = false;
        saveCart();
        renderCart();
        syncRequirementType();
        updateAllButtons();
        emit('change', items());
        if (!silent) toast(removed.name + ' removed from your enquiry.', 'removed');
        return true;
    }

    function clear(options) {
        options = options || {};
        state.cart = [];
        saveCart();
        renderCart();
        syncRequirementType();
        updateAllButtons();
        emit('change', items());
        if (!options.silent) toast('Enquiry cart cleared.', 'info');
    }

    function ensureUi() {
        if (document.getElementById('pmewProductEnquiryDrawer')) { cacheUi(); return; }

        var wrap = document.createElement('div');
        wrap.id = 'pmewSharedEnquiryUi';
        wrap.innerHTML = '' +
        '<button id="pmewEnquiryCartTrigger" class="pmew-enquiry-cart-trigger" type="button" aria-controls="pmewProductEnquiryDrawer" aria-expanded="false">' +
            icon('enquiry') + '<span>ENQUIRY CART</span><strong id="pmewEnquiryCartCount" aria-label="0 of 10 products selected">0/10</strong></button>' +
        '<section id="pmewEnquiryReturnNotice" class="pmew-enquiry-return-notice" role="status" aria-live="polite" aria-atomic="true" aria-hidden="true" hidden>' +
            '<span class="pmew-enquiry-return-notice-accent" aria-hidden="true"></span>' +
            '<div class="pmew-enquiry-return-notice-expanded"><div class="pmew-enquiry-return-notice-main">' +
                '<div class="pmew-enquiry-return-notice-signal" aria-hidden="true"><span class="pmew-enquiry-return-notice-pulse"></span>' + icon('clock') + '</div>' +
                '<div class="pmew-enquiry-return-notice-copy"><div class="pmew-enquiry-return-notice-eyebrow"><span id="pmewEnquiryReturnNoticeStatus">SAVED ENQUIRY RESTORED</span></div>' +
                    '<h2 id="pmewEnquiryReturnNoticeTitle">Welcome back — your enquiry is saved</h2>' +
                    '<p id="pmewEnquiryReturnNoticeText">Your selected products and technical enquiry details were restored from this browser.</p></div></div>' +
                '<div class="pmew-enquiry-return-notice-actions"><button id="pmewResumeSavedEnquiry" type="button">' + icon('arrow') + '<span>CONTINUE ENQUIRY</span></button>' +
                '<button id="pmewDiscardSavedEnquiry" type="button">' + icon('remove') + '<span>DISCARD &amp; START NEW</span></button></div></div>' +
            '<button id="pmewEnquiryReturnNoticeCompact" class="pmew-enquiry-return-notice-compact" type="button" aria-label="Continue saved enquiry">' +
                '<span class="pmew-enquiry-return-notice-compact-icon" aria-hidden="true">' + icon('check') + '</span><span class="pmew-enquiry-return-notice-compact-copy"><strong id="pmewEnquiryReturnNoticeCompactLabel">ENQUIRY SAVED</strong><small id="pmewEnquiryReturnNoticeCompactText">Your enquiry is waiting</small></span>' +
                '<span id="pmewEnquiryReturnNoticeCompactCount" class="pmew-enquiry-return-notice-compact-count" aria-label="0 selected products">0</span>' + icon('arrow') + '</button>' +
            '<button id="pmewEnquiryReturnNoticeClose" class="pmew-enquiry-return-notice-close" type="button" aria-label="Dismiss saved enquiry notification">' + icon('close') + '</button>' +
        '</section>' +
        '<div id="pmewEnquiryToastRegion" class="pmew-enquiry-toast-region" role="region" aria-label="Enquiry notifications" aria-live="polite" aria-atomic="false"></div>' +
        '<div id="pmewEnquiryBackdrop" class="pmew-enquiry-backdrop" aria-hidden="true"></div>' +
        '<aside id="pmewProductEnquiryDrawer" class="pmew-enquiry-drawer" role="dialog" aria-modal="true" aria-labelledby="pmewEnquiryDrawerTitle" aria-hidden="true">' +
            '<div class="pmew-enquiry-drawer-header"><div><span class="pmew-enquiry-drawer-kicker">Product Requirement</span><h2 id="pmewEnquiryDrawerTitle">SEND PRODUCT ENQUIRY</h2>' +
            '<p>Submit a quick requirement or a complete technical RFQ without leaving this page.</p></div>' +
            '<button id="pmewEnquiryDrawerClose" class="pmew-enquiry-drawer-close" type="button" aria-label="Close enquiry form">' + icon('close') + '</button></div>' +
            '<div class="pmew-enquiry-drawer-scroll">' +
                '<section class="pmew-enquiry-cart-panel" aria-labelledby="pmewSelectedProductsTitle"><div class="pmew-enquiry-panel-heading"><div><span>Selected Products</span><h3 id="pmewSelectedProductsTitle">ENQUIRY CART</h3></div>' +
                '<button id="pmewContinueBrowsing" type="button">CONTINUE BROWSING</button></div><div id="pmewEnquiryCartList" class="pmew-enquiry-cart-list"></div>' +
                '<p id="pmewEnquiryCartEmpty" class="pmew-enquiry-cart-empty">No product is selected yet. You may still submit a general requirement or add products from this page.</p></section>' +
                '<div class="pmew-enquiry-mode-tabs" role="tablist" aria-label="Enquiry type"><button id="pmewQuickEnquiryTab" class="is-active" type="button" role="tab" aria-selected="true" aria-controls="pmewQuickEnquiryPanel" data-enquiry-mode="quick">QUICK ENQUIRY</button>' +
                '<button id="pmewDetailedRfqTab" type="button" role="tab" aria-selected="false" aria-controls="pmewDetailedRfqPanel" data-enquiry-mode="detailed">DETAILED RFQ</button></div>' +
                '<form id="pmewProductEnquiryForm" class="pmew-product-enquiry-form" method="post" enctype="multipart/form-data" novalidate>' +
                    '<input id="pmewProductsJson" type="hidden" name="products_json" value="[]"><input id="pmewEnquiryModeInput" type="hidden" name="enquiry_mode" value="quick">' +
                    '<input id="pmewSourcePage" type="hidden" name="source_page" value=""><input id="pmewSubmittedAt" type="hidden" name="submitted_at" value="">' +
                    '<div class="pmew-enquiry-honeypot" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
                    '<fieldset class="pmew-enquiry-requirement-type"><legend>Requirement type</legend>' +
                        '<label><input type="radio" name="requirement_type" value="standard"><span>Standard Product</span></label>' +
                        '<label><input type="radio" name="requirement_type" value="customised"><span>Customised Product</span></label>' +
                        '<label><input type="radio" name="requirement_type" value="technical-assistance" checked><span>Need Technical Assistance</span></label></fieldset>' +
                    '<div class="pmew-enquiry-form-grid is-two-column"><label class="pmew-enquiry-field"><span>Required quantity <b>*</b></span><input type="number" name="quantity" min="1" step="1" inputmode="numeric" required placeholder="Example: 25,000"></label>' +
                        '<label class="pmew-enquiry-field"><span>Quantity unit</span><select name="quantity_unit"><option value="pieces">Pieces</option><option value="sets">Sets</option><option value="kilograms">Kilograms</option><option value="tonnes">Tonnes</option><option value="boxes">Boxes</option></select></label></div>' +
                    '<label class="pmew-enquiry-field is-full"><span>Requirement summary <b>*</b></span><textarea name="requirement_summary" rows="4" required placeholder="Mention required product, size, application, specification or assistance needed."></textarea></label>' +
                    '<section id="pmewQuickEnquiryPanel" class="pmew-enquiry-tab-panel is-active" role="tabpanel" aria-labelledby="pmewQuickEnquiryTab"><div class="pmew-enquiry-form-grid is-two-column">' +
                        '<label class="pmew-enquiry-field"><span>Size / thread</span><input type="text" name="size_thread" placeholder="Example: M8 × 40"></label>' +
                        '<label class="pmew-enquiry-field"><span>Material</span><input type="text" name="material" placeholder="Alloy steel, stainless steel, etc."></label>' +
                        '<label class="pmew-enquiry-field"><span>Grade / property class</span><input type="text" name="grade" placeholder="8.8, 10.9, 12.9, A2-70, etc."></label>' +
                        '<label class="pmew-enquiry-field"><span>Finish / coating</span><input type="text" name="finish" placeholder="Zinc, zinc flake, black, HDG, etc."></label></div></section>' +
                    '<section id="pmewDetailedRfqPanel" class="pmew-enquiry-tab-panel" role="tabpanel" aria-labelledby="pmewDetailedRfqTab" hidden>' +
                        '<div class="pmew-enquiry-section-title"><span>Technical Specification</span><h3>DETAILED RFQ INFORMATION</h3></div>' +
                        '<div class="pmew-enquiry-form-grid is-two-column">' +
                            '<label class="pmew-enquiry-field"><span>Annual requirement</span><input type="text" name="annual_requirement" placeholder="Example: 1.2 million pieces/year"></label>' +
                            '<label class="pmew-enquiry-field"><span>Required delivery date</span><input type="date" name="required_delivery_date"></label>' +
                            '<label class="pmew-enquiry-field"><span>Diameter / thread</span><input type="text" name="diameter_thread" placeholder="M6, M8 × 1.0, 1/2-13 UNC, etc."></label>' +
                            '<label class="pmew-enquiry-field"><span>Length</span><input type="text" name="product_length" placeholder="Under-head or overall length"></label>' +
                            '<label class="pmew-enquiry-field"><span>Material specification</span><input type="text" name="material_specification" placeholder="SCM435, 304, 316, Inconel, etc."></label>' +
                            '<label class="pmew-enquiry-field"><span>Grade / strength</span><input type="text" name="strength_grade" placeholder="Property class or strength requirement"></label>' +
                            '<label class="pmew-enquiry-field"><span>Coating / surface treatment</span><input type="text" name="coating" placeholder="Type, colour, thickness and salt-spray hours"></label>' +
                            '<label class="pmew-enquiry-field"><span>Special tolerance</span><input type="text" name="tolerance" placeholder="Critical dimensions or tolerance class"></label></div>' +
                        '<label class="pmew-enquiry-field is-full"><span>Application</span><textarea name="application" rows="3" placeholder="Industry, assembly, operating conditions and product function."></textarea></label>' +
                        '<div class="pmew-enquiry-form-grid is-two-column">' +
                            '<label class="pmew-enquiry-field"><span>Inspection / documentation</span><input type="text" name="inspection_requirements" placeholder="PPAP, MTC, COC, FAI, third-party inspection, etc."></label>' +
                            '<label class="pmew-enquiry-field"><span>Packaging requirement</span><input type="text" name="packaging_requirements" placeholder="Bulk, VCI, retail, barcode, export, etc."></label></div>' +
                        '<fieldset class="pmew-enquiry-inline-options"><legend>Sample availability</legend><label><input type="radio" name="sample_available" value="yes"> Yes</label><label><input type="radio" name="sample_available" value="no"> No</label><label><input type="radio" name="sample_available" value="not-applicable" checked> Not applicable</label></fieldset>' +
                        '<label id="pmewDrawingDropzone" class="pmew-enquiry-upload" tabindex="0"><input id="pmewDrawingUpload" type="file" name="drawings[]" multiple accept=".pdf,.step,.stp,.iges,.igs,.dwg,.dxf,.png,.jpg,.jpeg,.xlsx">' +
                            '<span class="pmew-enquiry-upload-icon">' + icon('upload') + '</span><strong>UPLOAD DRAWINGS OR SPECIFICATIONS</strong><span class="pmew-enquiry-upload-action">Choose files or drag &amp; drop</span><small>PDF, STEP, STP, IGES, IGS, DWG, DXF, PNG, JPG or XLSX · Maximum 5 files · 20 MB each</small></label>' +
                        '<div id="pmewDrawingFileList" class="pmew-enquiry-file-list" aria-live="polite"></div>' +
                        '<p class="pmew-enquiry-confidentiality">' + icon('shield') + 'Drawings and technical information are treated as confidential and used only for quotation and manufacturability review.</p>' +
                    '</section>' +
                    '<div class="pmew-enquiry-section-title"><span>Buyer Information</span><h3>CONTACT DETAILS</h3></div>' +
                    '<div class="pmew-enquiry-form-grid is-two-column">' +
                        '<label class="pmew-enquiry-field"><span>Full name <b>*</b></span><input type="text" name="full_name" autocomplete="name" required></label>' +
                        '<label class="pmew-enquiry-field"><span>Company <b>*</b></span><input type="text" name="company" autocomplete="organization" required></label>' +
                        '<label class="pmew-enquiry-field"><span>Work email <b>*</b></span><input type="email" name="email" autocomplete="email" required></label>' +
                        '<label class="pmew-enquiry-field"><span>Country <b>*</b></span><input type="text" name="country" autocomplete="country-name" required placeholder="India, Germany, USA, etc."></label>' +
                        '<label class="pmew-enquiry-field"><span>Country code <b>*</b></span><input type="text" name="country_code" autocomplete="tel-country-code" required value="+91" pattern="^\\+[0-9]{1,4}$" placeholder="+91"></label>' +
                        '<label class="pmew-enquiry-field"><span>Mobile / telephone <b>*</b></span><input type="tel" name="mobile" autocomplete="tel-national" inputmode="tel" required pattern="^[0-9 ()-]{6,20}$" placeholder="9876543210"></label></div>' +
                    '<label class="pmew-enquiry-consent"><input type="checkbox" name="consent" value="accepted" required><span>I consent to Pradako using these details to review and respond to this product enquiry. <b>*</b></span></label>' +
                    '<div id="pmewEnquiryFormStatus" class="pmew-enquiry-form-status" role="status" aria-live="polite"></div>' +
                    '<div class="pmew-enquiry-submit-bar"><div><span id="pmewEnquirySubmitCount">0 products selected</span><small>Maximum 10 products per enquiry</small></div>' +
                        '<button id="pmewEnquirySubmitButton" type="submit"><span>SEND ENQUIRY</span>' + icon('arrow') + '</button></div>' +
                '</form>' +
            '</div>' +
        '</aside>';

        document.body.appendChild(wrap);
        cacheUi();
    }

    function cacheUi() {
        ui.trigger = document.getElementById('pmewEnquiryCartTrigger');
        ui.triggerCount = document.getElementById('pmewEnquiryCartCount');
        ui.backdrop = document.getElementById('pmewEnquiryBackdrop');
        ui.drawer = document.getElementById('pmewProductEnquiryDrawer');
        ui.drawerClose = document.getElementById('pmewEnquiryDrawerClose');
        ui.continueBrowsing = document.getElementById('pmewContinueBrowsing');
        ui.cartList = document.getElementById('pmewEnquiryCartList');
        ui.cartEmpty = document.getElementById('pmewEnquiryCartEmpty');
        ui.form = document.getElementById('pmewProductEnquiryForm');
        ui.productsJson = document.getElementById('pmewProductsJson');
        ui.modeInput = document.getElementById('pmewEnquiryModeInput');
        ui.sourcePage = document.getElementById('pmewSourcePage');
        ui.submittedAt = document.getElementById('pmewSubmittedAt');
        ui.status = document.getElementById('pmewEnquiryFormStatus');
        ui.submit = document.getElementById('pmewEnquirySubmitButton');
        ui.submitCount = document.getElementById('pmewEnquirySubmitCount');
        ui.upload = document.getElementById('pmewDrawingUpload');
        ui.uploadZone = document.getElementById('pmewDrawingDropzone');
        ui.fileList = document.getElementById('pmewDrawingFileList');
        ui.quickTab = document.getElementById('pmewQuickEnquiryTab');
        ui.detailedTab = document.getElementById('pmewDetailedRfqTab');
        ui.quickPanel = document.getElementById('pmewQuickEnquiryPanel');
        ui.detailedPanel = document.getElementById('pmewDetailedRfqPanel');
        ui.notice = document.getElementById('pmewEnquiryReturnNotice');
        ui.noticeTitle = document.getElementById('pmewEnquiryReturnNoticeTitle');
        ui.noticeText = document.getElementById('pmewEnquiryReturnNoticeText');
        ui.noticeStatus = document.getElementById('pmewEnquiryReturnNoticeStatus');
        ui.noticeClose = document.getElementById('pmewEnquiryReturnNoticeClose');
        ui.noticeResume = document.getElementById('pmewResumeSavedEnquiry');
        ui.noticeDiscard = document.getElementById('pmewDiscardSavedEnquiry');
        ui.noticeCompact = document.getElementById('pmewEnquiryReturnNoticeCompact');
        ui.noticeCompactLabel = document.getElementById('pmewEnquiryReturnNoticeCompactLabel');
        ui.noticeCompactText = document.getElementById('pmewEnquiryReturnNoticeCompactText');
        ui.noticeCompactCount = document.getElementById('pmewEnquiryReturnNoticeCompactCount');
        ui.toastRegion = document.getElementById('pmewEnquiryToastRegion');
    }

    function cartItemMarkup(product) {
        var media = product.image
            ? '<img src="' + escapeAttr(product.image) + '" alt="' + escapeAttr(product.name) + '" loading="lazy">'
            : '<span class="pmew-enquiry-cart-item-fallback">' + escapeHtml(product.name) + '</span>';
        var configMeta = '';
        if (product.specifications || product.quantity != null || product.configurationStatus) {
            var commercial = product.quantity != null ? String(product.quantity) + (product.unit ? ' ' + product.unit : '') : '';
            var spec = product.specifications || '';
            var status = product.configurationStatus === 'engineering-review' ? 'ENGINEERING REVIEW' : (product.configurationStatus === 'configured' ? 'CONFIGURED' : '');
            configMeta = '<div class="pmew-enquiry-cart-item-config">' +
                (status ? '<span>' + escapeHtml(status) + '</span>' : '') +
                (commercial ? '<strong>' + escapeHtml(commercial) + '</strong>' : '') +
                (spec ? '<small>' + escapeHtml(spec) + '</small>' : '') +
                '</div>';
        }
        return '<article class="pmew-enquiry-cart-item"><div class="pmew-enquiry-cart-item-media">' + media + '</div><div class="pmew-enquiry-cart-item-copy"><h4>' + escapeHtml(product.name) + '</h4><p>' +
            escapeHtml(product.sourceLabel) + (product.partNo ? ' · ' + escapeHtml(product.partNo) : '') + (product.category ? ' · ' + escapeHtml(product.category) : '') + '</p>' + configMeta + '</div>' +
            '<button type="button" data-remove-enquiry-product="' + escapeAttr(product.id) + '" aria-label="Remove ' + escapeAttr(product.name) + '">' + icon('remove') + '</button></article>';
    }

    function renderCart() {
        if (!ui.cartList) return;
        ui.cartList.innerHTML = state.cart.map(cartItemMarkup).join('');
        if (ui.cartEmpty) ui.cartEmpty.hidden = state.cart.length > 0;
        if (ui.triggerCount) {
            ui.triggerCount.textContent = count() + '/' + MAX;
            ui.triggerCount.setAttribute('aria-label', count() + ' of ' + MAX + ' products selected');
        }
        if (ui.productsJson) ui.productsJson.value = JSON.stringify(state.cart);
        if (ui.submitCount) ui.submitCount.textContent = count() === 1 ? '1 product selected' : count() + ' products selected';
        updateAllButtons();
    }

    function showMessage(message, type) {
        if (!ui.status) return;
        ui.status.textContent = message || '';
        ui.status.className = 'pmew-enquiry-form-status' + (type ? ' is-' + type : '');
    }

    function toast(message, type, duration) {
        ensureUi();
        if (!ui.toastRegion || !message) return;
        type = type || 'success';
        duration = duration || 4200;
        state.toastSequence += 1;
        var id = 'pmew-enquiry-toast-' + state.toastSequence;
        var node = document.createElement('div');
        node.id = id;
        node.className = 'pmew-enquiry-toast is-' + type;
        node.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
        node.innerHTML = '<span class="pmew-enquiry-toast-icon">' + icon(type === 'success' ? 'check' : (type === 'removed' ? 'minus' : (type === 'warning' ? 'warning' : 'info'))) + '</span>' +
            '<p class="pmew-enquiry-toast-copy">' + escapeHtml(message) + '</p><button class="pmew-enquiry-toast-close" type="button" aria-label="Dismiss notification">' + icon('close') + '</button>';
        ui.toastRegion.appendChild(node);
        requestAnimationFrame(function () { node.classList.add('is-visible'); });
        var timer = window.setTimeout(function () { dismissToast(node); }, duration);
        state.toastTimers[id] = timer;
        node.querySelector('.pmew-enquiry-toast-close').addEventListener('click', function () { dismissToast(node); });
    }

    function dismissToast(node) {
        if (!node) return;
        var timer = state.toastTimers[node.id];
        if (timer) window.clearTimeout(timer);
        delete state.toastTimers[node.id];
        node.classList.remove('is-visible');
        window.setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 220);
    }

    function setMode(mode) {
        mode = mode === 'detailed' ? 'detailed' : 'quick';
        state.mode = mode;
        if (ui.modeInput) ui.modeInput.value = mode;
        if (ui.quickTab) { ui.quickTab.classList.toggle('is-active', mode === 'quick'); ui.quickTab.setAttribute('aria-selected', String(mode === 'quick')); }
        if (ui.detailedTab) { ui.detailedTab.classList.toggle('is-active', mode === 'detailed'); ui.detailedTab.setAttribute('aria-selected', String(mode === 'detailed')); }
        if (ui.quickPanel) ui.quickPanel.hidden = mode !== 'quick';
        if (ui.detailedPanel) ui.detailedPanel.hidden = mode !== 'detailed';
        saveDraft();
    }

    function open(options) {
        ensureUi();
        options = typeof options === 'string' ? { mode: options } : (options || {});
        if (options.product) add(options.product, true);
        if (options.mode) setMode(options.mode);
        state.lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        state.drawerOpen = true;
        hideReturnNotice();
        renderCart();
        if (ui.sourcePage) ui.sourcePage.value = window.location.pathname + window.location.search;
        document.body.classList.add('pmew-enquiry-open');
        ui.backdrop.classList.add('is-open');
        ui.drawer.classList.add('is-open');
        ui.drawer.setAttribute('aria-hidden', 'false');
        ui.trigger.setAttribute('aria-expanded', 'true');
        window.setTimeout(function () { if (ui.drawerClose) ui.drawerClose.focus(); }, 30);
    }

    function close() {
        if (!ui.drawer) return;
        state.drawerOpen = false;
        saveDraft({ immediate: true });
        document.body.classList.remove('pmew-enquiry-open');
        ui.backdrop.classList.remove('is-open');
        ui.drawer.classList.remove('is-open');
        ui.drawer.setAttribute('aria-hidden', 'true');
        ui.trigger.setAttribute('aria-expanded', 'false');
        if (state.lastFocused && typeof state.lastFocused.focus === 'function') {
            try { state.lastFocused.focus(); } catch (error) {}
        }
    }

    function syncRequirementType() {
        if (!ui.form) return;
        var radios = ui.form.querySelectorAll('input[name="requirement_type"]');
        if (!radios.length) return;
        var desired = 'technical-assistance';
        if (state.cart.length) {
            var allStandard = state.cart.every(function (item) { return item.source === 'standard'; });
            var allCustom = state.cart.every(function (item) { return item.source !== 'standard'; });
            desired = allStandard ? 'standard' : (allCustom ? 'customised' : 'technical-assistance');
        }
        radios.forEach(function (radio) { radio.checked = radio.value === desired; });
    }

    function technicalFieldPersistable(field) {
        if (!field || !field.name || field.disabled) return false;
        var allowed = {
            enquiry_mode:1, requirement_type:1, quantity:1, quantity_unit:1, requirement_summary:1,
            size_thread:1, material:1, grade:1, finish:1, annual_requirement:1,
            required_delivery_date:1, diameter_thread:1, product_length:1, material_specification:1,
            strength_grade:1, coating:1, tolerance:1, application:1, inspection_requirements:1,
            packaging_requirements:1, sample_available:1
        };
        return Boolean(allowed[field.name]);
    }

    function collectDraft() {
        var fields = {};
        if (ui.form) {
            Array.prototype.forEach.call(ui.form.elements, function (field) {
                if (!technicalFieldPersistable(field)) return;
                if (field.type === 'radio') { if (field.checked) fields[field.name] = field.value; return; }
                if (field.type === 'checkbox') { fields[field.name] = Boolean(field.checked); return; }
                fields[field.name] = field.value;
            });
        }
        return { version: DRAFT_VERSION, savedAt: new Date().toISOString(), mode: state.mode, fields: fields };
    }

    function draftMeaningful(draft) {
        if (!draft || !draft.fields) return false;
        var defaults = { quantity_unit:'pieces', requirement_type:'technical-assistance', sample_available:'not-applicable', enquiry_mode:'quick' };
        return Object.keys(draft.fields).some(function (name) {
            var value = draft.fields[name];
            if (defaults[name] != null && String(value) === defaults[name]) return false;
            return typeof value === 'boolean' ? value : Boolean(clean(value));
        });
    }

    function saveDraft(options) {
        options = options || {};
        if (state.submissionComplete) return;
        function write() {
            state.draftTimer = 0;
            try {
                var draft = collectDraft();
                if (draftMeaningful(draft)) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                else localStorage.removeItem(DRAFT_KEY);
            } catch (error) {}
        }
        if (state.draftTimer) { window.clearTimeout(state.draftTimer); state.draftTimer = 0; }
        if (options.immediate) write(); else state.draftTimer = window.setTimeout(write, DRAFT_DEBOUNCE);
    }

    function restoreDraft() {
        if (!ui.form) return false;
        var draft = null;
        try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch (error) {}
        if (!draft || draft.version !== DRAFT_VERSION || !draft.fields) return false;

        /* A draft made only of default / empty values is not a real recovery
           candidate. Remove any such stale entry before touching the form so a
           first-time product-page visit stays completely silent. */
        if (!draftMeaningful(draft)) {
            clearDraft();
            state.restoredDraft = false;
            state.formDirty = false;
            return false;
        }

        Object.keys(draft.fields).forEach(function (name) {
            var fields = Array.prototype.filter.call(ui.form.elements, function (field) { return field.name === name && technicalFieldPersistable(field); });
            fields.forEach(function (field) {
                if (field.type === 'radio') field.checked = field.value === String(draft.fields[name]);
                else if (field.type === 'checkbox') field.checked = Boolean(draft.fields[name]);
                else field.value = String(draft.fields[name] == null ? '' : draft.fields[name]);
            });
        });
        setMode(draft.mode || draft.fields.enquiry_mode || 'quick');
        state.restoredDraft = true;
        state.formDirty = true;
        return true;
    }

    function clearDraft() {
        if (state.draftTimer) { window.clearTimeout(state.draftTimer); state.draftTimer = 0; }
        try { localStorage.removeItem(DRAFT_KEY); } catch (error) {}
    }

    function hasPending() { return state.cart.length > 0 || state.formDirty || state.restoredDraft; }

    function noticeSummary() {
        var n = count();
        if (n && state.restoredDraft) return n + ' selected ' + (n === 1 ? 'product' : 'products') + ' and your technical RFQ details were restored.';
        if (n) return n + ' selected ' + (n === 1 ? 'product was' : 'products were') + ' restored to your enquiry cart.';
        return 'Your unfinished technical enquiry details were restored from this browser.';
    }

    function updateReturnNotice() {
        if (!ui.notice) return;
        var n = count();
        if (ui.noticeTitle) ui.noticeTitle.textContent = 'Welcome back — your enquiry is saved';
        if (ui.noticeText) ui.noticeText.textContent = noticeSummary();
        if (ui.noticeStatus) ui.noticeStatus.textContent = n && state.restoredDraft ? 'CART AND DRAFT RESTORED' : (n ? 'PRODUCTS RESTORED' : 'DRAFT RESTORED');
        if (ui.noticeCompactLabel) ui.noticeCompactLabel.textContent = n ? 'ENQUIRY SAVED' : 'RFQ DRAFT SAVED';
        if (ui.noticeCompactText) ui.noticeCompactText.textContent = n ? n + ' ' + (n === 1 ? 'product' : 'products') + ' waiting' : 'Continue unfinished RFQ';
        if (ui.noticeCompactCount) { ui.noticeCompactCount.textContent = String(n); ui.noticeCompactCount.hidden = n === 0; }
    }

    function noticeTop() {
        if (!ui.notice || ui.notice.hidden) return;

        /* The PMEW navbar is injected dynamically and is not always itself
           `position: fixed/sticky`.  Position the recovery card from the
           VISIBLE bottom edge of the real navbar instead of relying on its
           CSS positioning mode.  This keeps both expanded and compact saved-
           enquiry states directly below the navigation, matching the page
           hierarchy and preventing the notice from covering the header. */
        var candidates = [
            document.querySelector('#navbar-container nav'),
            document.querySelector('#navbar-container header'),
            document.querySelector('#navbar-container .navbar'),
            document.querySelector('#navbar-container .main-header'),
            document.querySelector('#navbar-container .pmew-site-header'),
            document.getElementById('navbar-container')
        ].filter(Boolean);

        var bottom = 0;
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        var headerZone = Math.min(340, Math.max(220, viewportHeight * 0.42));

        candidates.forEach(function (candidate) {
            var rect = candidate.getBoundingClientRect();
            var style = window.getComputedStyle(candidate);
            var visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;

            if (!visible) return;
            if (rect.bottom <= 0 || rect.top >= headerZone) return;

            /* Ignore unusually tall wrapper nodes while still accepting the
               normal navbar host (the PMEW header is roughly 100–230px high). */
            if (rect.height <= 320 || candidate.id === 'navbar-container') {
                bottom = Math.max(bottom, Math.min(rect.bottom, headerZone));
            }
        });

        var top = bottom > 0 ? bottom + 20 : 18;
        ui.notice.style.setProperty('--pmew-return-notice-top', Math.round(Math.max(18, top)) + 'px');
    }

    function scheduleNoticeMinimise() {
        if (state.returnNoticeTimer) window.clearTimeout(state.returnNoticeTimer);
        state.returnNoticeTimer = window.setTimeout(function () {
            if (ui.notice && ui.notice.classList.contains('is-visible')) ui.notice.classList.add('is-minimised');
        }, 10000);
    }

    function showReturnNotice(force) {
        if (!ui.notice || !hasPending() || state.drawerOpen) return;
        if (state.returnNoticeDismissed && !force) return;

        var hasProducts = state.cart.length > 0;
        var draftOnly = !hasProducts && state.restoredDraft;

        /* Recovery hierarchy:
           - saved products (with or without a draft): show the full recovery card
           - meaningful RFQ draft only: start directly in the compact state
           - no products + no meaningful draft: hasPending() is false, so show nothing
           This avoids a large "Welcome back" panel on a normal first visit. */
        updateReturnNotice();
        ui.notice.hidden = false;
        ui.notice.setAttribute('aria-hidden', 'false');
        ui.notice.classList.toggle('is-minimised', draftOnly);
        noticeTop();

        requestAnimationFrame(function () {
            ui.notice.classList.add('is-visible');
            if (!draftOnly) scheduleNoticeMinimise();
        });
    }

    function hideReturnNotice() {
        if (!ui.notice) return;
        if (state.returnNoticeTimer) window.clearTimeout(state.returnNoticeTimer);
        ui.notice.classList.remove('is-visible', 'is-minimised');
        ui.notice.setAttribute('aria-hidden', 'true');
        window.setTimeout(function () { if (!ui.notice.classList.contains('is-visible')) ui.notice.hidden = true; }, 330);
    }

    function discardSaved() {
        if (!window.confirm('Discard your saved enquiry and start a new one? Selected products and technical draft details will be cleared.')) return;
        state.submissionComplete = true;
        clear({ silent: true });
        clearDraft();
        if (ui.form) ui.form.reset();
        clearUploadFiles({ silent: true });
        setMode('quick');
        state.formDirty = false; state.restoredDraft = false; state.returnNoticeDismissed = true;
        showMessage('', '');
        hideReturnNotice();
        state.submissionComplete = false;
        open('quick');
        toast('Saved enquiry cleared. You can now start a new enquiry.', 'success');
    }

    function fileIdentity(file) {
        return [file.name, file.size, file.lastModified || 0].join('::');
    }

    function validateFileArray(files) {
        files = Array.isArray(files) ? files : [];

        if (files.length > MAX_FILES) {
            toast('Upload a maximum of ' + MAX_FILES + ' files.', 'error');
            return false;
        }

        for (var i = 0; i < files.length; i += 1) {
            var ext = (files[i].name.split('.').pop() || '').toLowerCase();
            if (ALLOWED_EXTENSIONS.indexOf(ext) < 0) {
                toast(files[i].name + ' is not a supported drawing/specification file.', 'error', 5200);
                return false;
            }
            if (files[i].size > MAX_FILE_SIZE) {
                toast(files[i].name + ' exceeds the 20 MB file limit.', 'error', 5200);
                return false;
            }
        }
        return true;
    }

    function syncNativeUpload() {
        if (!ui.upload) return;

        /* DataTransfer keeps the native input in sync where the browser allows it.
           Submission does not depend on this: submit() appends state.uploadFiles
           directly to FormData, so the selected files are genuinely uploaded. */
        try {
            if (typeof DataTransfer === 'undefined') return;
            var transfer = new DataTransfer();
            state.uploadFiles.forEach(function (file) { transfer.items.add(file); });
            ui.upload.files = transfer.files;
        } catch (error) {}
    }

    function addUploadFiles(fileList) {
        var incoming = Array.prototype.slice.call(fileList || []);
        if (!incoming.length) return;

        var next = state.uploadFiles.slice();
        var known = {};
        next.forEach(function (file) { known[fileIdentity(file)] = true; });

        incoming.forEach(function (file) {
            var key = fileIdentity(file);
            if (!known[key]) {
                known[key] = true;
                next.push(file);
            }
        });

        if (!validateFileArray(next)) return;

        state.uploadFiles = next;
        syncNativeUpload();
        renderFileList();
    }

    function removeUploadFile(index) {
        index = Number(index);
        if (!Number.isInteger(index) || index < 0 || index >= state.uploadFiles.length) return;

        var removed = state.uploadFiles[index];
        state.uploadFiles.splice(index, 1);
        syncNativeUpload();
        renderFileList();

        if (removed) toast(removed.name + ' removed from upload.', 'removed', 3000);
    }

    function clearUploadFiles(options) {
        options = options || {};
        state.uploadFiles = [];

        if (ui.upload) {
            try { ui.upload.value = ''; } catch (error) {}
        }

        syncNativeUpload();
        renderFileList();

        if (!options.silent) toast('Drawing/specification uploads cleared.', 'info', 3000);
    }

    function validateFiles() {
        return validateFileArray(state.uploadFiles);
    }

    function renderFileList() {
        if (!ui.fileList) return;

        var files = state.uploadFiles.slice();
        if (!files.length) {
            ui.fileList.innerHTML = '';
            return;
        }

        var rows = files.map(function (file, index) {
            return '<div class="pmew-enquiry-file-item">' +
                '<span class="pmew-enquiry-file-icon">' + icon('file') + '</span>' +
                '<strong title="' + escapeAttr(file.name) + '">' + escapeHtml(file.name) + '</strong>' +
                '<small>' + (file.size / (1024 * 1024)).toFixed(2) + ' MB</small>' +
                '<button type="button" class="pmew-enquiry-file-remove" data-remove-upload-index="' + index + '"' +
                    ' aria-label="Remove ' + escapeAttr(file.name) + ' from upload" title="Remove file">' + icon('close') + '</button>' +
                '</div>';
        }).join('');

        var clearAll = files.length > 1
            ? '<div class="pmew-enquiry-file-actions"><span>' + files.length + ' of ' + MAX_FILES + ' files ready</span>' +
                '<button type="button" data-clear-upload-files>CLEAR ALL</button></div>'
            : '';

        ui.fileList.innerHTML = rows + clearAll;
    }

    function firstInvalid() {
        if (!ui.form) return null;
        var controls = ui.form.querySelectorAll('input,select,textarea');
        for (var i = 0; i < controls.length; i += 1) {
            if (!controls[i].checkValidity()) return controls[i];
        }
        return null;
    }

    async function submit(event) {
        event.preventDefault();
        if (!ui.form || !ui.submit) return;
        if (!validateFiles()) return;
        if (!ui.form.checkValidity()) {
            var invalid = firstInvalid();
            if (invalid) { try { invalid.focus(); } catch (error) {} }
            ui.form.reportValidity();
            showMessage('Please complete the required fields before sending your enquiry.', 'error');
            toast('Please complete the required enquiry fields.', 'error');
            return;
        }
        if (ui.productsJson) ui.productsJson.value = JSON.stringify(state.cart);
        if (ui.sourcePage) ui.sourcePage.value = window.location.pathname + window.location.search;
        if (ui.submittedAt) ui.submittedAt.value = new Date().toISOString();
        saveDraft({ immediate: true });

        var original = ui.submit.innerHTML;
        ui.submit.disabled = true;
        ui.submit.innerHTML = '<span>SENDING…</span>';
        showMessage('Sending your enquiry…', '');
        try {
            var formData = new FormData(ui.form);
            formData.delete('drawings[]');
            state.uploadFiles.forEach(function (file) {
                formData.append('drawings[]', file, file.name);
            });

            var response = await fetch(endpoint(), { method: 'POST', body: formData, credentials: 'same-origin' });
            var payload = null;
            try { payload = await response.json(); } catch (error) {}
            if (!response.ok || (payload && payload.success === false)) {
                throw new Error((payload && (payload.message || payload.error)) || ('Enquiry could not be submitted (HTTP ' + response.status + ').'));
            }
            state.submissionComplete = true;
            showMessage((payload && payload.message) || 'Your enquiry has been sent successfully. Our team will review the requirement.', 'success');
            toast('Enquiry sent successfully.', 'success', 5200);
            state.cart = []; saveCart(); clearDraft();
            ui.form.reset(); clearUploadFiles({ silent: true }); setMode('quick'); state.formDirty = false; state.restoredDraft = false;
            renderCart(); syncRequirementType(); emit('change', items());
            window.setTimeout(function () { state.submissionComplete = false; }, 300);
        } catch (error) {
            state.submissionComplete = false;
            showMessage(error && error.message ? error.message : 'Unable to send the enquiry. Please try again.', 'error');
            toast('Unable to send the enquiry. Your technical draft remains saved.', 'error', 6200);
        } finally {
            ui.submit.disabled = false;
            ui.submit.innerHTML = original;
        }
    }

    function trapFocus(event) {
        if (!state.drawerOpen || !ui.drawer) return;
        if (event.key === 'Escape') { event.preventDefault(); close(); return; }
        if (event.key !== 'Tab') return;
        var focusable = Array.prototype.slice.call(ui.drawer.querySelectorAll('button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'))
            .filter(function (el) { return !el.hidden && el.offsetParent !== null; });
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    function bindUi() {
        ui.trigger.addEventListener('click', function () { open(); });
        ui.drawerClose.addEventListener('click', close);
        ui.continueBrowsing.addEventListener('click', close);
        ui.backdrop.addEventListener('click', close);
        ui.quickTab.addEventListener('click', function () { setMode('quick'); });
        ui.detailedTab.addEventListener('click', function () { setMode('detailed'); });
        ui.upload.addEventListener('change', function () {
            var chosen = Array.prototype.slice.call(ui.upload.files || []);
            try { ui.upload.value = ''; } catch (error) {}
            addUploadFiles(chosen);
        });

        if (ui.uploadZone) {
            ['dragenter', 'dragover'].forEach(function (name) {
                ui.uploadZone.addEventListener(name, function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    ui.uploadZone.classList.add('is-dragging');
                    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
                });
            });

            ['dragleave', 'dragend'].forEach(function (name) {
                ui.uploadZone.addEventListener(name, function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    ui.uploadZone.classList.remove('is-dragging');
                });
            });

            ui.uploadZone.addEventListener('drop', function (event) {
                event.preventDefault();
                event.stopPropagation();
                ui.uploadZone.classList.remove('is-dragging');
                if (event.dataTransfer && event.dataTransfer.files) addUploadFiles(event.dataTransfer.files);
            });

            ui.uploadZone.addEventListener('keydown', function (event) {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                ui.upload.click();
            });
        }

        if (ui.fileList) {
            ui.fileList.addEventListener('click', function (event) {
                var removeButton = event.target.closest('[data-remove-upload-index]');
                if (removeButton) {
                    event.preventDefault();
                    removeUploadFile(removeButton.getAttribute('data-remove-upload-index'));
                    return;
                }

                var clearButton = event.target.closest('[data-clear-upload-files]');
                if (clearButton) {
                    event.preventDefault();
                    clearUploadFiles();
                }
            });
        }
        ui.form.addEventListener('input', function () { state.submissionComplete = false; state.formDirty = draftMeaningful(collectDraft()); saveDraft(); });
        ui.form.addEventListener('change', function () { state.submissionComplete = false; state.formDirty = draftMeaningful(collectDraft()); saveDraft(); });
        ui.form.addEventListener('submit', submit);
        ui.noticeClose.addEventListener('click', function () { state.returnNoticeDismissed = true; hideReturnNotice(); });
        ui.noticeResume.addEventListener('click', function () { hideReturnNotice(); open(state.mode); showMessage('Your saved products and technical enquiry details are ready to continue.', 'success'); });
        ui.noticeCompact.addEventListener('click', function () { hideReturnNotice(); open(state.mode); });
        ui.noticeDiscard.addEventListener('click', discardSaved);
        ui.notice.addEventListener('mouseenter', function () { if (state.returnNoticeTimer) window.clearTimeout(state.returnNoticeTimer); });
        ui.notice.addEventListener('mouseleave', scheduleNoticeMinimise);
        document.addEventListener('keydown', trapFocus);
        window.addEventListener('resize', noticeTop, { passive: true });
        window.addEventListener('scroll', noticeTop, { passive: true });
    }

    function bindDelegated() {
        document.addEventListener('click', function (event) {
            var removeButton = event.target.closest('[data-remove-enquiry-product]');
            if (removeButton) { event.preventDefault(); remove(removeButton.getAttribute('data-remove-enquiry-product')); return; }

            var openButton = event.target.closest('[data-open-enquiry]');
            if (openButton) {
                event.preventDefault();
                var mode = clean(openButton.getAttribute('data-open-enquiry')) || clean(openButton.getAttribute('data-enquiry-mode')) || 'quick';
                open(mode);
                return;
            }

            var button = event.target.closest('[data-enquiry-id], [data-product-id][data-product-name]');
            if (!button || button.hasAttribute('data-open-enquiry')) return;
            var product = productFromElement(button);
            if (!product) return;
            event.preventDefault();
            event.stopPropagation();
            if (has(product.id)) remove(product.id); else add(product);
        });

        /* Added buttons stay green as confirmation. Hovering/focusing an added
           button intentionally reveals the red Remove state. */
        document.addEventListener('pointerover', function (event) {
            var button = event.target.closest('button[data-enquiry-id], button[data-product-id][data-product-name]');
            if (!button || (event.relatedTarget && button.contains(event.relatedTarget))) return;
            setRemoveIntent(button, true);
        });

        document.addEventListener('pointerout', function (event) {
            var button = event.target.closest('button[data-enquiry-id], button[data-product-id][data-product-name]');
            if (!button || (event.relatedTarget && button.contains(event.relatedTarget))) return;
            setRemoveIntent(button, false);
        });

        document.addEventListener('focusin', function (event) {
            var button = event.target.closest('button[data-enquiry-id], button[data-product-id][data-product-name]');
            if (button) setRemoveIntent(button, true);
        });

        document.addEventListener('focusout', function (event) {
            var button = event.target.closest('button[data-enquiry-id], button[data-product-id][data-product-name]');
            if (button) setRemoveIntent(button, false);
        });
    }

    function init() {
        if (state.mounted) return;
        state.mounted = true;
        ensureUi();
        state.cart = loadCart();
        saveCart(); /* migrate any compatible legacy cart into the site-wide v2 key */
        renderCart();
        syncRequirementType();
        setMode('quick');
        var restored = restoreDraft();
        bindUi();
        bindDelegated();
        renderCart();
        if (state.cart.length || restored) window.setTimeout(function () { showReturnNotice(false); }, 650);

        window.addEventListener('pagehide', function () { if (hasPending()) { saveCart(); saveDraft({ immediate: true }); } });
        window.addEventListener('storage', function (event) {
            if (event.key !== CART_KEY) return;
            state.cart = loadCart(); renderCart(); syncRequirementType(); emit('change', items());
        });
    }

    var API = {
        __pmewSharedV2: true, MAX: MAX, mount: init, add: add, remove: remove, clear: clear, has: has, count: count, isFull: isFull, items: items, findByBase: findByBase,
        open: open, close: close, toast: toast, on: on, icon: icon, render: renderCart, syncButtons: updateAllButtons, sync: updateAllButtons, setMode: setMode
    };
    window.PradakoEnquiryCart = API;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();

}(window, document));
