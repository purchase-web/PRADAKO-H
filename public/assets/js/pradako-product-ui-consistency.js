/* ==========================================================================
   PRADAKO / PMEW — SHARED PRODUCT ACTION CONSISTENCY
   --------------------------------------------------------------------------
   One adapter for Customised Products + all 12 product-family pages.

   Responsibilities:
   - keep Add / Added / Remove to Enquiry states visually and functionally equal
     to the PDP shared enquiry control
   - keep Compare / Selected controls equal to the PDP comparison control
   - add Save to individual product cards only
   - do not create a second enquiry, compare or saved-products store
   ========================================================================== */
(function (window, document) {
    'use strict';

    var registry = {};
    var urlRegistry = {};
    var scanFrame = 0;
    var observer = null;

    var FAMILY_ROUTES = {
        'screws': '/pages/products/screws/index.html',
        'bolts': '/pages/products/bolts/index.html',
        'nuts': '/pages/products/nuts/index.html',
        'washers': '/pages/products/washers/index.html',
        'threaded-rods': '/pages/products/threaded-rods/index.html',
        'studs': '/pages/products/studs/index.html',
        'rivets': '/pages/products/rivets/index.html',
        'pins': '/pages/products/pins/index.html',
        'bushes': '/pages/products/bushes/index.html',
        'plugs': '/pages/products/plugs/index.html',
        'stainless-steel': '/pages/products/stainless-steel/index.html',
        'high-tensile': '/pages/products/high-tensile/index.html'
    };

    function clean(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }


    function absoluteUrl(value) {
        value = clean(value);
        if (!value) return '';
        try { return new URL(value, window.location.href).href; }
        catch (error) { return value; }
    }

    function pathKey(value) {
        value = absoluteUrl(value);
        if (!value) return '';
        try {
            var url = new URL(value);
            return (url.pathname + url.search).toLowerCase();
        } catch (error) {
            return value.toLowerCase();
        }
    }


    function sharedIcon(name) {
        return (window.PradakoEnquiryCart && typeof window.PradakoEnquiryCart.icon === 'function')
            ? window.PradakoEnquiryCart.icon(name) : '';
    }

    function sourceLabel(source) {
        source = clean(source).toLowerCase();
        if (source === 'standard') return 'Standard Products';
        if (source === 'spotlight') return 'Spotlight Products';
        return 'Customised Products';
    }

    function register(product, family, group) {
        if (!product || typeof product !== 'object') return;

        var item = {};
        Object.keys(product).forEach(function (key) { item[key] = product[key]; });

        if (family) {
            item.family = clean(item.family || family.name);
            item.familySlug = clean(item.familySlug || family.slug);
            item.familyUrl = clean(item.familyUrl || FAMILY_ROUTES[family.slug] || family.url);
        }
        if (group) {
            item.category = clean(item.category || group.type);
            item.subType = clean(item.subType || group.type);
        }

        var id = clean(item.id || item.baseProductId);
        if (!id) return;

        item.id = id;
        item.baseProductId = clean(item.baseProductId || id);
        item.source = clean(item.source || 'customised').toLowerCase();
        item.sourceLabel = clean(item.sourceLabel || sourceLabel(item.source));
        item.url = clean(item.url || item.productUrl || item.familyUrl);
        item.image = clean(item.image);
        item.partNo = clean(item.partNo);
        item.name = clean(item.name);

        registry[id] = item;
        var key = pathKey(item.url);
        if (key) urlRegistry[key] = item;
    }

    function rebuildRegistry() {
        registry = {};
        urlRegistry = {};

        var catalog = Array.isArray(window.PMEW_CUSTOM_PRODUCT_CATALOG)
            ? window.PMEW_CUSTOM_PRODUCT_CATALOG : [];

        catalog.forEach(function (family) {
            (family.groups || []).forEach(function (group) {
                var list = group.productItems && group.productItems.length
                    ? group.productItems
                    : (group.products || []).map(function (name) { return { name: name }; });

                list.forEach(function (product) { register(product, family, group); });
            });
        });

        if (window.PradakoProductFamilyPage &&
            typeof window.PradakoProductFamilyPage.products === 'function') {
            try {
                window.PradakoProductFamilyPage.products().forEach(function (product) {
                    register(product, null, null);
                });
            } catch (error) { /* family controller may still be starting */ }
        }
    }

    function idFromNode(card) {
        if (!card) return '';

        var id = clean(
            card.getAttribute('data-product-card') ||
            card.getAttribute('data-product-id') ||
            card.getAttribute('data-gallery-product-id') ||
            card.getAttribute('data-product')
        );
        if (id) return id;

        var action = card.querySelector(
            '[data-enquiry-id], [data-gallery-add], [data-compare-id], ' +
            '[data-product-compare], [data-compare-product]'
        );

        if (action) {
            return clean(
                action.getAttribute('data-enquiry-id') ||
                action.getAttribute('data-gallery-add') ||
                action.getAttribute('data-compare-id') ||
                action.getAttribute('data-product-compare') ||
                action.getAttribute('data-compare-product')
            );
        }

        return '';
    }

    function textFrom(card, selectors) {
        for (var i = 0; i < selectors.length; i += 1) {
            var node = card.querySelector(selectors[i]);
            var value = clean(node && node.textContent);
            if (value) return value;
        }
        return '';
    }

    function productFromCard(card) {
        if (!card) return null;

        var id = idFromNode(card);
        var product = id && registry[id] ? registry[id] : null;

        if (!product) {
            var anchor = card.querySelector('a[href]');
            var href = anchor && anchor.getAttribute('href');
            var matched = href ? urlRegistry[pathKey(href)] : null;
            if (matched) {
                product = matched;
                id = matched.id;
            }
        }

        var enquiry = card.querySelector('[data-enquiry-id]');
        var anchorNode = card.querySelector('a[href]');
        var url = clean(
            (product && product.url) ||
            (enquiry && (enquiry.dataset.productUrl || enquiry.dataset.enquiryFamilyUrl)) ||
            (anchorNode && anchorNode.getAttribute('href'))
        );

        var partNo = clean(
            (product && product.partNo) ||
            (enquiry && enquiry.dataset.enquiryPartno) ||
            textFrom(card, [
                '.card-part-no', '.pmew-partno', '.pmew-gallery-product-number',
                '.pmew-product-number', '[data-product-partno]'
            ])
        );

        var name = clean(
            (product && product.name) ||
            (enquiry && enquiry.dataset.enquiryName) ||
            textFrom(card, [
                '.card-content h3', '.pmew-gal-name', '.pmew-cat-name',
                '.pmew-detail-title', '.pmew-gallery-product-name',
                '.pradako-products-card-title', 'h3'
            ])
        );

        id = clean(id || (product && product.id) || (enquiry && enquiry.dataset.enquiryId));

        /* HARD RULE retained from Saved Products:
           no family/category save buttons. If this is not an identifiable
           individual product, do not invent metadata just to show Save. */
        if (!id || !partNo || !name || !url) return null;

        var source = clean(
            (product && product.source) ||
            (enquiry && enquiry.dataset.enquirySource) ||
            'customised'
        ).toLowerCase();

        return {
            entityType: 'product',
            id: id,
            baseProductId: clean((product && product.baseProductId) || id),
            partNo: partNo,
            name: name,
            description: clean((product && product.description) || ''),
            category: clean(
                (product && (product.category || product.subType)) ||
                (enquiry && enquiry.dataset.enquiryCategory)
            ),
            family: clean(
                (product && product.family) ||
                (enquiry && enquiry.dataset.enquiryFamily)
            ),
            familyUrl: clean(
                (product && product.familyUrl) ||
                (enquiry && enquiry.dataset.enquiryFamilyUrl)
            ),
            image: clean(
                (product && product.image) ||
                (enquiry && enquiry.dataset.enquiryImage) ||
                (card.querySelector('img') && card.querySelector('img').getAttribute('src'))
            ),
            url: url,
            source: source,
            sourceLabel: clean(
                (product && product.sourceLabel) ||
                (enquiry && enquiry.dataset.enquirySourceLabel) ||
                sourceLabel(source)
            ),
            catalogueUrl: clean(
                (product && product.catalogueUrl) ||
                (product && product.familyUrl) ||
                '/pages/products/customised-products.html'
            ),
            savedFrom: document.body.classList.contains('pmew-customised-products-page')
                ? 'customised-products'
                : 'family-page'
        };
    }

    function regularEnquiryMarkup(button) {
        if (!button || button.classList.contains('pmew-ui-enquiry-ready')) return;

        var compact = button.classList.contains('pmew-chart-add') ||
            button.classList.contains('pmew-gal-add') ||
            button.classList.contains('pmew-ui-icon-only');

        button.classList.add('pmew-ui-enquiry-action', 'pmew-ui-enquiry-ready');
        if (compact) button.classList.add('pmew-ui-enquiry-compact');

        if (compact) {
            button.innerHTML =
                '<span data-enquiry-icon><i class="fa-solid fa-plus" aria-hidden="true"></i></span>' +
                '<span class="pmew-visually-hidden" data-enquiry-label>Add to Enquiry</span>';
        } else if (!button.querySelector('[data-enquiry-label]') ||
                   !button.querySelector('[data-enquiry-icon]')) {
            button.innerHTML =
                '<span data-enquiry-icon><i class="fa-solid fa-plus" aria-hidden="true"></i></span>' +
                '<span data-enquiry-label>Add to Enquiry</span>';
        }
    }

    function syncEnquiryButtons() {
        var cart = window.PradakoEnquiryCart;

        document.querySelectorAll('button[data-enquiry-id]').forEach(function (button) {
            regularEnquiryMarkup(button);
        });

        /* Older Gallery/Catalogue modules may still emit data-gallery-add.
           Give them the same visual shell, but their existing module remains the
           click adapter into the SAME PradakoEnquiryCart store. State rendering
           is synchronized from that shared store below — there is no second cart. */
        document.querySelectorAll('button[data-gallery-add]:not([data-enquiry-id])').forEach(function (button) {
            var id = clean(button.getAttribute('data-gallery-add'));
            var product = registry[id] || {};
            var added = cart && cart.has(id);
            var full = cart && cart.isFull() && !added;
            var compact = button.classList.contains('pmew-gal-add') ||
                button.classList.contains('pmew-chart-add');

            button.classList.add('pmew-ui-enquiry-action');
            button.classList.toggle('pmew-ui-enquiry-compact', compact);
            button.classList.toggle('is-added', Boolean(added));
            button.classList.remove('is-remove-ready');
            if (full) button.setAttribute('disabled', 'disabled');
            else button.removeAttribute('disabled');
            button.setAttribute('aria-pressed', added ? 'true' : 'false');

            button.innerHTML =
                '<span data-enquiry-icon><i class="fa-solid ' + (added ? 'fa-check' : 'fa-plus') + '" aria-hidden="true"></i></span>' +
                '<span ' + (compact ? 'class="pmew-visually-hidden" ' : '') + 'data-enquiry-label>' +
                (added ? 'Added to Enquiry' : (full ? 'Basket Full (10/10)' : 'Add to Enquiry')) + '</span>';

            var name = clean(product.name) || 'product';
            button.title = added ? 'Added to enquiry' : (full ? 'Enquiry basket is full' : 'Add to enquiry');
            button.setAttribute('aria-label', added
                ? name + ' added to enquiry.'
                : (full ? 'Enquiry basket full. Cannot add ' + name + '.' : 'Add ' + name + ' to enquiry.'));
        });

        if (cart && typeof cart.syncButtons === 'function') cart.syncButtons();
    }

    function compareId(button) {
        if (!button) return '';
        return clean(
            button.getAttribute('data-compare-id') ||
            button.getAttribute('data-product-compare') ||
            button.getAttribute('data-compare-product')
        );
    }

    function syncCompareButtons() {
        var compare = window.PradakoCompare;
        if (!compare) return;

        document.querySelectorAll(
            'button[data-compare-id], button[data-product-compare], ' +
            'button[data-compare-product], button.pmew-gallery-compare, ' +
            'button.pmew-chart-compare'
        ).forEach(function (button) {
            var id = compareId(button);
            var compact = button.classList.contains('pmew-compare-icon') ||
                button.classList.contains('pmew-gallery-compare') ||
                button.classList.contains('pmew-chart-compare');

            button.classList.add('pmew-ui-compare-action');
            button.classList.toggle('pmew-ui-compare-compact', compact);
            if (!id) return;

            var selected = compare.has(id);
            button.classList.toggle('is-added', selected);
            button.classList.toggle('is-selected', selected);
            button.classList.toggle('is-compared', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');

            /* One Compare function = one icon everywhere. The compare glyph stays
               the same in both Compare and Selected states; only label/state color
               changes. This removes the family-page check-circle variation. */
            if (compact) {
                button.innerHTML = sharedIcon('compare') +
                    '<span class="pmew-visually-hidden" data-compare-label>' +
                    (selected ? 'Selected for comparison' : 'Select for comparison') + '</span>';
            } else {
                button.innerHTML = sharedIcon('compare') +
                    '<span data-compare-label>' + (selected ? 'Selected' : 'Compare') + '</span>';
            }

            button.title = selected ? 'Remove from comparison' : 'Select for comparison';
        });
    }

    function closestProductCard(node) {
        if (!node || !node.closest) return null;

        return node.closest(
            '.product-card, .pmew-gallery-product-card, .pmew-gal-card, ' +
            '.pmew-cat-card, .pmew-detail-card, .pradako-products-card'
        );
    }

    function candidateCards() {
        var set = [];

        document.querySelectorAll(
            '.product-card[data-product-card], .pmew-gallery-product-card, ' +
            '.pmew-gal-card, .pmew-cat-card, .pmew-detail-card'
        ).forEach(function (card) {
            if (set.indexOf(card) < 0) set.push(card);
        });

        document.querySelectorAll(
            '[data-enquiry-id], [data-gallery-add], [data-compare-id]'
        ).forEach(function (action) {
            var card = closestProductCard(action);
            if (card && set.indexOf(card) < 0) set.push(card);
        });

        return set;
    }

    function saveHost(card) {
        if (!card) return null;

        /* Some Customised gallery builds wrap the visual card in one large
           anchor. Never insert a button inside that anchor. */
        if (card.parentElement && card.parentElement.tagName === 'A') {
            var anchor = card.parentElement;
            var wrapper = anchor.parentElement;
            if (wrapper) return wrapper;
        }

        return card;
    }

    function directSaveButton(host) {
        if (!host) return null;
        for (var i = 0; i < host.children.length; i += 1) {
            if (host.children[i].classList &&
                host.children[i].classList.contains('pmew-product-save-action')) {
                return host.children[i];
            }
        }
        return null;
    }

    function injectSaveButtons() {
        var saved = window.PradakoSavedProducts;
        if (!saved || typeof saved.bind !== 'function') return;

        candidateCards().forEach(function (card) {
            var product = productFromCard(card);
            if (!product) return;

            var host = saveHost(card);
            if (!host) return;

            host.classList.add('pmew-save-host-card');

            var button = directSaveButton(host);
            if (!button) {
                button = document.createElement('button');
                button.type = 'button';
                button.className = 'pmew-product-save-action';
                button.innerHTML =
                    '<i class="fa-regular fa-bookmark" data-pmew-save-icon aria-hidden="true"></i>' +
                    '<span data-pmew-save-label>SAVE</span>';

                /* Keep Save independent from any card-level navigation/quick-view
                   listener. stopPropagation does not prevent the Saved Products
                   listener on this same button from running. */
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                });

                host.appendChild(button);
            }

            /* Customised Gallery already uses a top-right Compare control.
               Save sits immediately to its left instead of overlapping it. */
            var compareOverlay = host.querySelector(
                '.pmew-gallery-compare, .pmew-compare-icon'
            );
            button.classList.toggle('pmew-save-offset-compare', Boolean(compareOverlay));

            saved.bind(button, product);
        });

        if (typeof saved.syncButtons === 'function') saved.syncButtons();
    }

    function mutationNeedsScan(mutations) {
        for (var i = 0; i < mutations.length; i += 1) {
            var mutation = mutations[i];
            var target = mutation && mutation.target;
            var element = target && target.nodeType === 1
                ? target
                : (target && target.parentElement);

            /* Shared action stores intentionally rewrite their own icon/label markup
               when state changes. Those mutations are presentation-only and must
               not trigger a full product-card rescan, otherwise the Added -> Remove
               hover/focus state is immediately reset back to Added. */
            if (element && element.closest && element.closest(
                '.pmew-ui-enquiry-action, .pmew-ui-compare-action, .pmew-product-save-action'
            )) {
                continue;
            }

            return true;
        }
        return false;
    }

    function scan() {
        scanFrame = 0;

        /* The scan intentionally rewrites product-action icon/label markup.
           Pause the observer while doing that so our own UI synchronization
           cannot recursively schedule an endless MutationObserver loop. */
        if (observer) observer.disconnect();

        rebuildRegistry();
        syncEnquiryButtons();
        syncCompareButtons();
        injectSaveButtons();

        if (observer && document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    function scheduleScan() {
        if (scanFrame) return;
        scanFrame = window.requestAnimationFrame(scan);
    }

    function bindSharedStores() {
        if (window.PradakoEnquiryCart &&
            typeof window.PradakoEnquiryCart.on === 'function') {
            window.PradakoEnquiryCart.on('change', scheduleScan);
        }

        if (window.PradakoCompare &&
            typeof window.PradakoCompare.on === 'function') {
            window.PradakoCompare.on('change', scheduleScan);
        }

        if (window.PradakoSavedProducts &&
            typeof window.PradakoSavedProducts.on === 'function') {
            window.PradakoSavedProducts.on('change', scheduleScan);
        }
    }

    function init() {
        if (window.PradakoSavedProducts &&
            typeof window.PradakoSavedProducts.mount === 'function') {
            window.PradakoSavedProducts.mount();
        }

        bindSharedStores();
        scan();

        if ('MutationObserver' in window && document.body) {
            observer = new MutationObserver(function (mutations) {
                if (mutationNeedsScan(mutations)) scheduleScan();
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        window.addEventListener('pmew:shell-loaded', scheduleScan);
        window.addEventListener('load', scheduleScan, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    window.PradakoProductUiConsistency = {
        refresh: scheduleScan
    };

}(window, document));
