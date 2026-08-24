/* ==========================================================================
   PRADAKO / PMEW — SHARED SAVED PRODUCTS
   Version 1.3
   --------------------------------------------------------------------------
   One shortlist across PDP, Customised Products, Spotlight Products and
   product-family pages.

   HARD RULE:
   Only a single identifiable product may be saved. Categories, families,
   collections, material groups and property-class groups are rejected.
   ========================================================================== */
(function (window, document) {
    'use strict';

    var STORAGE_KEY = 'pmew-saved-products-v1';
    var MAX = 30;
    var mounted = false;
    var openState = false;
    var lastFocused = null;
    var listeners = [];
    var bindings = [];
    var ui = {};

    function clean(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }

    function canonicalId(product) {
        return clean(product && (product.baseProductId || product.id));
    }

    function isSaveableProduct(product) {
        return Boolean(
            product &&
            clean(product.entityType).toLowerCase() === 'product' &&
            canonicalId(product) &&
            clean(product.partNo) &&
            clean(product.name) &&
            clean(product.url)
        );
    }

    function normalizeProduct(product, allowLegacy) {
        if (!product || typeof product !== 'object') return null;

        var entityType = clean(product.entityType).toLowerCase();
        var legacyLooksLikeProduct = allowLegacy && !entityType &&
            clean(product.id) && clean(product.partNo) && clean(product.name) && clean(product.url);

        if (legacyLooksLikeProduct) entityType = 'product';
        if (entityType !== 'product') return null;

        var id = canonicalId(product);
        var normalized = {
            entityType: 'product',
            id: id,
            baseProductId: id,
            partNo: clean(product.partNo),
            name: clean(product.name),
            category: clean(product.category),
            family: clean(product.family),
            familyUrl: clean(product.familyUrl),
            image: clean(product.image),
            url: clean(product.url),
            source: clean(product.source) || 'product',
            sourceLabel: clean(product.sourceLabel) || 'Product',
            catalogueUrl: clean(product.catalogueUrl),
            savedFrom: clean(product.savedFrom) || 'product',
            savedAt: clean(product.savedAt) || new Date().toISOString()
        };

        return isSaveableProduct(normalized) ? normalized : null;
    }

    function readRaw() {
        try {
            var parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function read() {
        var seen = {};
        return readRaw().map(function (item) {
            return normalizeProduct(item, true);
        }).filter(function (item) {
            if (!item || seen[item.baseProductId]) return false;
            seen[item.baseProductId] = true;
            return true;
        }).slice(0, MAX);
    }

    function write(items) {
        var safe = (items || []).map(function (item) {
            return normalizeProduct(item, true);
        }).filter(Boolean).slice(0, MAX);

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
        } catch (error) {
            /* Storage can be unavailable in restricted browser modes. */
        }
        return safe;
    }

    function toast(message, type, duration) {
        var cart = window.PradakoEnquiryCart;
        if (cart && typeof cart.toast === 'function') {
            cart.toast(message, type || 'info', duration);
            return;
        }
        console.info('[PMEW Saved Products]', message);
    }

    function emitChange() {
        render();
        syncButtons();
        var snapshot = items();
        listeners.slice().forEach(function (listener) {
            try { listener(snapshot); } catch (error) { console.error(error); }
        });
        try {
            document.dispatchEvent(new CustomEvent('pmew:saved-products-change', {
                detail: { items: snapshot, count: snapshot.length }
            }));
        } catch (error) { /* CustomEvent optional in very old browsers. */ }
    }

    function items() {
        return read();
    }

    function count() {
        return items().length;
    }

    function has(productOrId) {
        var id = typeof productOrId === 'string' ? clean(productOrId) : canonicalId(productOrId);
        if (!id) return false;
        return items().some(function (item) { return item.baseProductId === id; });
    }

    function add(product) {
        var normalized = normalizeProduct(product, false);
        if (!normalized) {
            console.warn('[PMEW Saved Products] Save rejected. Only individual products with entityType="product", baseProductId/id, partNo, name and url are saveable.', product);
            return false;
        }

        var current = items();
        var existing = current.findIndex(function (item) {
            return item.baseProductId === normalized.baseProductId;
        });

        if (existing >= 0) {
            /* Refresh canonical display data without creating a duplicate. */
            normalized.savedAt = current[existing].savedAt || normalized.savedAt;
            current[existing] = normalized;
            write(current);
            emitChange();
            return false;
        }

        normalized.savedAt = new Date().toISOString();
        current.unshift(normalized);
        write(current.slice(0, MAX));
        toast(normalized.name + ' saved for later.', 'success', 2600);
        emitChange();
        return true;
    }

    function remove(productOrId) {
        var id = typeof productOrId === 'string' ? clean(productOrId) : canonicalId(productOrId);
        if (!id) return false;
        var current = items();
        var removed = null;
        var next = current.filter(function (item) {
            if (item.baseProductId === id) {
                removed = item;
                return false;
            }
            return true;
        });
        if (!removed) return false;
        write(next);
        toast(removed.name + ' removed from Saved Products.', 'removed', 2400);
        emitChange();
        return true;
    }

    function toggle(product) {
        var normalized = normalizeProduct(product, false);
        if (!normalized) {
            console.warn('[PMEW Saved Products] Toggle rejected because the item is not an individual product.', product);
            return false;
        }
        if (has(normalized.baseProductId)) {
            remove(normalized.baseProductId);
            return false;
        }
        add(normalized);
        return true;
    }

    function clear() {
        if (!items().length) return;
        write([]);
        toast('Saved Products cleared.', 'removed', 2400);
        emitChange();
    }

    function enquiryCart() {
        return window.PradakoEnquiryCart || null;
    }

    function inEnquiry(product) {
        var cart = enquiryCart();
        if (!cart || !product) return false;

        if (typeof cart.findByBase === 'function') {
            try {
                var matches = cart.findByBase(product.baseProductId);
                if (Array.isArray(matches)) return matches.length > 0;
                return Boolean(matches);
            } catch (error) { /* fallback below */ }
        }

        if (typeof cart.has === 'function') {
            try {
                return Boolean(
                    cart.has(product.baseProductId + '::saved-base') ||
                    cart.has(product.baseProductId)
                );
            } catch (error) { return false; }
        }
        return false;
    }

    function toEnquiry(product) {
        return {
            id: product.baseProductId + '::saved-base',
            baseProductId: product.baseProductId,
            configKey: 'saved-base',
            partNo: product.partNo,
            name: product.name,
            description: [product.category, product.family].filter(Boolean).join(' · '),
            category: product.category,
            family: product.family,
            familyUrl: product.familyUrl,
            url: product.url,
            image: product.image,
            source: product.source || 'product',
            sourceLabel: product.sourceLabel || 'Product',
            quantity: null,
            unit: 'Pieces',
            specifications: '',
            notes: 'Added from Saved Products. Requirement/configuration to be confirmed.',
            configurationStatus: 'engineering-review',
            reviewReasons: 'Requirement/configuration not specified in Saved Products.'
        };
    }

    function addToEnquiry(productOrId) {
        var product = typeof productOrId === 'string'
            ? items().find(function (item) { return item.baseProductId === clean(productOrId); })
            : normalizeProduct(productOrId, true);
        var cart = enquiryCart();

        if (!product || !cart || typeof cart.add !== 'function') {
            toast('Enquiry Cart is unavailable on this page.', 'warning', 3200);
            return false;
        }

        if (inEnquiry(product)) {
            if (typeof cart.open === 'function') cart.open('quick');
            return false;
        }

        if (typeof cart.isFull === 'function' && cart.isFull()) {
            toast('Enquiry Cart is full. Remove a product before adding another.', 'warning', 3600);
            return false;
        }

        cart.add(toEnquiry(product));
        window.setTimeout(render, 0);
        return true;
    }

    function addAllToEnquiry() {
        var cart = enquiryCart();
        if (!cart || typeof cart.add !== 'function') {
            toast('Enquiry Cart is unavailable on this page.', 'warning', 3200);
            return 0;
        }

        var added = 0;
        items().forEach(function (product) {
            if (inEnquiry(product)) return;
            if (typeof cart.isFull === 'function' && cart.isFull()) return;
            cart.add(toEnquiry(product));
            added += 1;
        });

        if (!added) {
            if (items().length) toast('All saved products are already in the Enquiry Cart, or the cart is full.', 'info', 3200);
            return 0;
        }
        window.setTimeout(render, 0);
        return added;
    }

    function iconClass(active) {
        return active ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
    }

    function syncButton(button, product) {
        if (!button || !product) return;
        var active = has(product.baseProductId);
        button.hidden = false;
        button.classList.toggle('is-saved', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.setAttribute('title', active ? 'Remove saved product' : 'Save product');
        button.setAttribute('aria-label', active
            ? 'Remove ' + product.name + ' from Saved Products'
            : 'Save ' + product.name);

        var icon = button.querySelector('[data-pmew-save-icon], .fa-bookmark');
        if (icon) icon.className = iconClass(active);
        var label = button.querySelector('[data-pmew-save-label]');
        if (label) label.textContent = active ? 'SAVED' : 'SAVE';
    }

    function syncButtons() {
        bindings = bindings.filter(function (binding) {
            return binding.button && document.documentElement.contains(binding.button);
        });
        bindings.forEach(function (binding) {
            syncButton(binding.button, binding.product);
        });
    }

    function bind(button, product) {
        if (!button) return false;
        var normalized = normalizeProduct(product, false);
        if (!normalized) {
            /* Prevent accidental category/family Save controls from being visible. */
            button.hidden = true;
            button.setAttribute('aria-hidden', 'true');
            return false;
        }

        button.hidden = false;
        button.removeAttribute('aria-hidden');
        if (!button.__pmewSavedProductsBound) {
            button.addEventListener('click', function () {
                var bound = button.__pmewSavedProductsProduct;
                if (bound) toggle(bound);
            });
            button.__pmewSavedProductsBound = true;
        }
        button.__pmewSavedProductsProduct = normalized;

        /* If this product was saved by an older page build, refresh only its
           canonical display/source metadata while preserving the original
           savedAt timestamp. This silently migrates legacy source='pdp' items. */
        var stored = items();
        var storedIndex = stored.findIndex(function (item) { return item.baseProductId === normalized.baseProductId; });
        if (storedIndex >= 0) {
            normalized.savedAt = stored[storedIndex].savedAt || normalized.savedAt;
            stored[storedIndex] = normalized;
            write(stored);
        }

        var existing = bindings.find(function (binding) { return binding.button === button; });
        if (existing) existing.product = normalized;
        else bindings.push({ button: button, product: normalized });

        syncButton(button, normalized);
        return true;
    }

    function productMeta(product) {
        return [product.category, product.family].filter(Boolean).join(' · ');
    }

    function renderItem(product) {
        var added = inEnquiry(product);
        var image = product.image
            ? '<img src="' + escapeAttr(product.image) + '" alt="' + escapeAttr(product.name) + '" loading="lazy" decoding="async">'
            : '<span class="pmew-saved-item-fallback"><i class="fa-solid fa-screwdriver-wrench" aria-hidden="true"></i></span>';

        return '' +
            '<article class="pmew-saved-item" data-pmew-saved-item="' + escapeAttr(product.baseProductId) + '">' +
                '<a class="pmew-saved-item-image" href="' + escapeAttr(product.url) + '" aria-label="View ' + escapeAttr(product.name) + '">' + image + '</a>' +
                '<div class="pmew-saved-item-copy">' +
                    '<span class="pmew-saved-item-partno">' + escapeHtml(product.partNo) + '</span>' +
                    '<h3>' + escapeHtml(product.name) + '</h3>' +
                    (productMeta(product) ? '<p>' + escapeHtml(productMeta(product)) + '</p>' : '') +
                '</div>' +
                '<div class="pmew-saved-item-actions">' +
                    '<a class="pmew-saved-view" href="' + escapeAttr(product.url) + '"><span>VIEW PRODUCT</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>' +
                    '<button type="button" class="pmew-saved-enquiry' + (added ? ' is-added' : '') + '" data-pmew-saved-enquiry="' + escapeAttr(product.baseProductId) + '">' +
                        '<i class="fa-solid ' + (added ? 'fa-check' : 'fa-plus') + '" aria-hidden="true"></i>' +
                        '<span>' + (added ? 'IN ENQUIRY' : 'ADD TO ENQUIRY') + '</span>' +
                    '</button>' +
                    '<button type="button" class="pmew-saved-remove" data-pmew-saved-remove="' + escapeAttr(product.baseProductId) + '" aria-label="Remove ' + escapeAttr(product.name) + ' from Saved Products">REMOVE</button>' +
                '</div>' +
            '</article>';
    }

    function render() {
        if (!mounted) return;
        var saved = items();
        if (ui.count) ui.count.textContent = String(saved.length);
        if (ui.launcherCount) ui.launcherCount.textContent = String(saved.length);
        if (ui.launcher) ui.launcher.setAttribute('aria-label', 'Open Saved Products, ' + saved.length + ' saved');
        if (ui.clear) ui.clear.hidden = !saved.length;
        if (ui.addAll) {
            ui.addAll.hidden = !saved.length;
            ui.addAll.disabled = !saved.length;
        }

        if (!ui.list) return;
        if (!saved.length) {
            ui.list.innerHTML = '' +
                '<div class="pmew-saved-empty">' +
                    '<span class="pmew-saved-empty-icon"><i class="fa-regular fa-bookmark" aria-hidden="true"></i></span>' +
                    '<h3>No saved products yet</h3>' +
                    '<p>Use the bookmark on an individual product to build your shortlist. Product categories and families cannot be saved.</p>' +
                '</div>';
            return;
        }
        ui.list.innerHTML = saved.map(renderItem).join('');
    }

    function focusableElements() {
        if (!ui.drawer) return [];
        return Array.prototype.slice.call(ui.drawer.querySelectorAll(
            'a[href], button:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"])'
        )).filter(function (node) {
            return !node.hasAttribute('hidden') && node.offsetParent !== null;
        });
    }

    function open() {
        mount();
        if (openState) return;
        openState = true;
        lastFocused = document.activeElement;
        render();
        document.body.classList.add('pmew-saved-open');
        ui.backdrop.classList.add('is-open');
        ui.drawer.classList.add('is-open');
        ui.drawer.setAttribute('aria-hidden', 'false');
        ui.launcher.setAttribute('aria-expanded', 'true');
        window.setTimeout(function () {
            if (ui.close) ui.close.focus();
        }, 30);
    }

    function close() {
        if (!openState) return;
        openState = false;
        document.body.classList.remove('pmew-saved-open');
        ui.backdrop.classList.remove('is-open');
        ui.drawer.classList.remove('is-open');
        ui.drawer.setAttribute('aria-hidden', 'true');
        ui.launcher.setAttribute('aria-expanded', 'false');
        if (lastFocused && typeof lastFocused.focus === 'function') {
            window.setTimeout(function () { lastFocused.focus(); }, 30);
        }
    }

    function handleDrawerKeydown(event) {
        if (!openState) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }
        if (event.key !== 'Tab') return;
        var focusables = focusableElements();
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function buildUi() {
        var host = document.createElement('div');
        host.id = 'pmewSharedSavedProductsUi';
        host.innerHTML = '' +
            '<button type="button" class="pmew-saved-trigger" id="pmewSavedProductsTrigger" aria-controls="pmewSavedProductsDrawer" aria-expanded="false">' +
                '<i class="fa-solid fa-bookmark" aria-hidden="true"></i>' +
                '<span>SAVED</span>' +
                '<strong id="pmewSavedProductsTriggerCount">0</strong>' +
            '</button>' +
            '<div class="pmew-saved-backdrop" data-pmew-saved-close></div>' +
            '<aside class="pmew-saved-drawer" id="pmewSavedProductsDrawer" role="dialog" aria-modal="true" aria-labelledby="pmewSavedProductsTitle" aria-hidden="true">' +
                '<header class="pmew-saved-header">' +
                    '<div>' +
                        '<span class="pmew-saved-kicker">PRODUCT SHORTLIST</span>' +
                        '<h2 id="pmewSavedProductsTitle">Saved Products <strong id="pmewSavedProductsCount">0</strong></h2>' +
                        '<p>Products you want to keep for later. Save is available only for individual products.</p>' +
                    '</div>' +
                    '<button type="button" class="pmew-saved-close" data-pmew-saved-close aria-label="Close Saved Products"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
                '</header>' +
                '<div class="pmew-saved-scroll">' +
                    '<div class="pmew-saved-toolbar">' +
                        '<span><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Saved on this browser</span>' +
                        '<button type="button" class="pmew-saved-clear" data-pmew-saved-clear>CLEAR ALL</button>' +
                    '</div>' +
                    '<div class="pmew-saved-list" data-pmew-saved-list></div>' +
                '</div>' +
                '<footer class="pmew-saved-footer">' +
                    '<div><strong>Ready to request a quotation?</strong><span>Move your shortlist into the shared Enquiry Cart.</span></div>' +
                    '<button type="button" class="pmew-saved-add-all" data-pmew-saved-add-all><i class="fa-solid fa-plus" aria-hidden="true"></i><span>ADD ALL TO ENQUIRY</span></button>' +
                '</footer>' +
            '</aside>';
        document.body.appendChild(host);

        ui.host = host;
        ui.launcher = host.querySelector('#pmewSavedProductsTrigger');
        ui.launcherCount = host.querySelector('#pmewSavedProductsTriggerCount');
        ui.backdrop = host.querySelector('.pmew-saved-backdrop');
        ui.drawer = host.querySelector('.pmew-saved-drawer');
        ui.close = host.querySelector('.pmew-saved-close');
        ui.count = host.querySelector('#pmewSavedProductsCount');
        ui.list = host.querySelector('[data-pmew-saved-list]');
        ui.clear = host.querySelector('[data-pmew-saved-clear]');
        ui.addAll = host.querySelector('[data-pmew-saved-add-all]');
    }

    function bindUiEvents() {
        ui.launcher.addEventListener('click', open);
        Array.prototype.slice.call(ui.host.querySelectorAll('[data-pmew-saved-close]')).forEach(function (button) {
            button.addEventListener('click', close);
        });
        ui.clear.addEventListener('click', function () {
            if (!items().length) return;
            if (window.confirm('Remove all saved products?')) clear();
        });
        ui.addAll.addEventListener('click', addAllToEnquiry);
        ui.drawer.addEventListener('keydown', handleDrawerKeydown);

        ui.list.addEventListener('click', function (event) {
            var removeButton = event.target.closest('[data-pmew-saved-remove]');
            if (removeButton) {
                remove(removeButton.getAttribute('data-pmew-saved-remove'));
                return;
            }
            var enquiryButton = event.target.closest('[data-pmew-saved-enquiry]');
            if (enquiryButton) {
                addToEnquiry(enquiryButton.getAttribute('data-pmew-saved-enquiry'));
            }
        });
    }

    function mount() {
        if (mounted) return api;
        mounted = true;
        buildUi();
        bindUiEvents();
        /* Re-write once to migrate the previous PDP-only saved format. */
        write(items());
        render();

        window.addEventListener('storage', function (event) {
            if (event.key === STORAGE_KEY) emitChange();
        });

        var cart = enquiryCart();
        if (cart && typeof cart.on === 'function') {
            cart.on('change', function () { render(); });
        }
        return api;
    }

    function on(eventName, listener) {
        if (eventName !== 'change' || typeof listener !== 'function') return function () {};
        listeners.push(listener);
        return function () {
            listeners = listeners.filter(function (item) { return item !== listener; });
        };
    }

    var api = {
        MAX: MAX,
        STORAGE_KEY: STORAGE_KEY,
        mount: mount,
        add: add,
        remove: remove,
        toggle: toggle,
        clear: clear,
        has: has,
        count: count,
        items: items,
        open: open,
        close: close,
        bind: bind,
        syncButtons: syncButtons,
        isSaveableProduct: isSaveableProduct,
        addToEnquiry: addToEnquiry,
        addAllToEnquiry: addAllToEnquiry,
        on: on
    };

    window.PradakoSavedProducts = api;

}(window, document));
