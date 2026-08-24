/* ==========================================================================
   PRADAKO / PMEW — SHARED PRODUCT COMPARISON (v8)
   --------------------------------------------------------------------------
   Shared comparison state + responsive drawer for catalogue, Customised
   Products and PDP pages.

   Important responsive rules:
   - the PAGE owns the viewport meta tag; this module never rewrites it.
   - compact mode is detected from layout/visual/device widths.
   - if a mobile device reports a desktop-sized layout viewport, only the
     compare drawer UI is scale-compensated so labels remain readable.
   ========================================================================== */
(function (window, document) {
    'use strict';

    var MAX = 4;
    var items = [];
    var listeners = { change: [] };
    var overlay = null;
    var panel = null;
    var ui = null;
    var body = null;
    var responsiveBound = false;
    var responsiveFrame = 0;

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function clean(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function positiveNumber(value) {
        value = Number(value);
        return isFinite(value) && value > 0 ? value : 0;
    }

    function attr(product, key) {
        var value = product && product.attributes ? product.attributes[key] : '';
        if (Array.isArray(value)) return value.filter(Boolean).join(' · ');
        return clean(value);
    }

    function threadValue(product) {
        return attr(product, 'threadType') || attr(product, 'thread') || attr(product, 'threads');
    }

    function isLocked(product) {
        return Boolean(product && (product.locked === true || product.comparisonRole === 'current'));
    }

    function emit() {
        listeners.change.slice().forEach(function (fn) {
            try { fn(items.slice()); } catch (error) { /* listener isolation */ }
        });
    }

    function layoutViewportWidth() {
        var values = [
            positiveNumber(window.innerWidth),
            positiveNumber(document.documentElement && document.documentElement.clientWidth)
        ].filter(Boolean);
        return values.length ? Math.max.apply(Math, values) : 1024;
    }

    function layoutViewportHeight() {
        var values = [
            positiveNumber(window.innerHeight),
            positiveNumber(document.documentElement && document.documentElement.clientHeight)
        ];
        if (window.visualViewport) values.push(positiveNumber(window.visualViewport.height));
        values = values.filter(Boolean);
        return values.length ? Math.max.apply(Math, values) : 720;
    }

    function effectiveDeviceWidth() {
        var layoutWidth = layoutViewportWidth();
        var values = [layoutWidth];

        if (window.visualViewport) values.push(positiveNumber(window.visualViewport.width));
        if (window.screen) {
            values.push(positiveNumber(window.screen.width));
            values.push(positiveNumber(window.screen.availWidth));
        }

        values = values.filter(Boolean);
        return values.length ? Math.min.apply(Math, values) : layoutWidth;
    }

    function responsiveState() {
        var layoutWidth = layoutViewportWidth();
        var deviceWidth = effectiveDeviceWidth();
        var compact = deviceWidth <= 900 || layoutWidth <= 900;
        var small = deviceWidth <= 480 || layoutWidth <= 480;
        var scale = 1;

        /* A normal responsive page reports similar layout and device widths.
           A large mismatch is characteristic of a scaled/emulated desktop
           viewport on a mobile-sized device. Compensate only in that case. */
        if (compact && deviceWidth > 0 && deviceWidth <= 900 && layoutWidth > deviceWidth * 1.18) {
            scale = Math.max(1, Math.min(4, layoutWidth / deviceWidth));
        }

        return {
            compact: compact,
            small: compact && small,
            layoutWidth: layoutWidth,
            layoutHeight: layoutViewportHeight(),
            deviceWidth: deviceWidth,
            scale: scale
        };
    }

    function syncResponsiveMode() {
        if (!panel || !ui) return;

        var state = responsiveState();
        panel.classList.toggle('pmew-compare-compact', state.compact);
        panel.classList.toggle('pmew-compare-compact-small', state.small);
        panel.classList.toggle('pmew-compare-viewport-compensated', state.compact && state.scale > 1.05);

        if (state.compact) {
            var ratio = state.small ? 0.88 : 0.82;
            var physicalCap = state.small ? 760 : 820;
            var drawerHeight = Math.max(
                420 * state.scale,
                Math.min(state.layoutHeight * ratio, physicalCap * state.scale)
            );

            panel.style.setProperty('--pmew-compare-height', Math.round(drawerHeight) + 'px');
            panel.style.setProperty('--pmew-compare-ui-scale', state.scale.toFixed(4));
            panel.style.setProperty('--pmew-compare-ui-width', Math.round(state.layoutWidth / state.scale) + 'px');
            panel.style.setProperty('--pmew-compare-ui-height', Math.round(drawerHeight / state.scale) + 'px');
        } else {
            panel.style.removeProperty('--pmew-compare-height');
            panel.style.removeProperty('--pmew-compare-ui-scale');
            panel.style.removeProperty('--pmew-compare-ui-width');
            panel.style.removeProperty('--pmew-compare-ui-height');
        }

        panel.setAttribute('data-compare-responsive', state.compact ? 'compact' : 'desktop');
        panel.setAttribute('data-compare-layout-width', String(Math.round(state.layoutWidth)));
        panel.setAttribute('data-compare-device-width', String(Math.round(state.deviceWidth)));
        panel.setAttribute('data-compare-ui-scale', state.scale.toFixed(3));
    }

    function scheduleResponsiveSync() {
        if (responsiveFrame) window.cancelAnimationFrame(responsiveFrame);
        responsiveFrame = window.requestAnimationFrame(function () {
            responsiveFrame = 0;
            syncResponsiveMode();
        });
    }

    function bindResponsiveMode() {
        if (responsiveBound) return;
        responsiveBound = true;

        window.addEventListener('resize', scheduleResponsiveSync, { passive: true });
        window.addEventListener('orientationchange', function () {
            window.setTimeout(scheduleResponsiveSync, 80);
        }, { passive: true });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', scheduleResponsiveSync, { passive: true });
        }
    }

    function ensure() {
        if (panel && overlay) {
            syncResponsiveMode();
            return;
        }

        overlay = document.createElement('div');
        overlay.className = 'pmew-compare-overlay';
        overlay.setAttribute('data-compare-close', '');
        overlay.setAttribute('aria-hidden', 'true');

        panel = document.createElement('section');
        panel.className = 'pmew-compare-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('aria-labelledby', 'pmewCompareTitle');
        panel.innerHTML =
            '<div class="pmew-compare-ui">' +
                '<div class="pmew-compare-head">' +
                    '<div>' +
                        '<span class="pmew-compare-kicker">PRODUCT COMPARISON</span>' +
                        '<h2 id="pmewCompareTitle">Compare selected products</h2>' +
                        '<p class="pmew-compare-help">Review the current product against selected alternatives or catalogue products.</p>' +
                    '</div>' +
                    '<button type="button" class="pmew-compare-close" data-compare-close aria-label="Close comparison">×</button>' +
                '</div>' +
                '<div class="pmew-compare-body" data-compare-body></div>' +
            '</div>';

        document.body.appendChild(overlay);
        document.body.appendChild(panel);

        ui = panel.querySelector('.pmew-compare-ui');
        body = panel.querySelector('[data-compare-body]');

        bindResponsiveMode();
        syncResponsiveMode();

        /* Keep vertical wheel/trackpad movement on the drawer body while the
           table surface remains free for genuine horizontal scrolling. */
        panel.addEventListener('wheel', function (event) {
            if (!panel.classList.contains('is-open') || !body || event.ctrlKey || event.shiftKey) return;
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

            var maxScroll = Math.max(0, body.scrollHeight - body.clientHeight);
            if (!maxScroll || !event.deltaY) return;

            var next = Math.max(0, Math.min(maxScroll, body.scrollTop + event.deltaY));
            if (next === body.scrollTop) return;

            body.scrollTop = next;
            event.preventDefault();
        }, { passive: false });

        render();
    }

    function has(id) {
        return items.some(function (product) { return product.id === id; });
    }

    function productHeader(product) {
        var locked = isLocked(product);
        var role = locked
            ? '<span class="pmew-compare-role is-current">CURRENT PRODUCT</span>'
            : '<span class="pmew-compare-role">' + (product.comparisonRole === 'alternative' ? 'ALTERNATIVE' : 'SELECTED') + '</span>';
        var media = product.image
            ? '<img src="' + esc(product.image) + '" alt="" loading="lazy" decoding="async">'
            : '<span class="pmew-compare-image-fallback" aria-hidden="true"></span>';
        var action = locked
            ? '<span class="pmew-compare-locked"><i class="fa-solid fa-lock" aria-hidden="true"></i> Reference</span>'
            : '<button class="pmew-compare-remove" type="button" data-compare-remove="' + esc(product.id) + '">Remove</button>';

        return '<div class="pmew-compare-product-head">' + media +
            '<div class="pmew-compare-product-copy">' + role +
            '<strong>' + esc(product.name || 'Product') + '</strong>' +
            '<small>' + esc(product.partNo || '') + '</small></div>' + action + '</div>';
    }

    function render() {
        if (!panel || !body) return;

        if (!items.length) {
            body.innerHTML = '<div class="pmew-compare-empty">Select a product to begin comparison.</div>';
            return;
        }

        var rows = [
            ['Pradako Product No.', function (p) { return p.partNo || ''; }],
            ['Product Type', function (p) { return p.subType || p.category || ''; }],
            ['Standards', function (p) { return attr(p, 'standards'); }],
            ['Grades / Classes', function (p) { return attr(p, 'grades'); }],
            ['Materials', function (p) { return attr(p, 'materials'); }],
            ['Finishes', function (p) { return attr(p, 'finishes'); }],
            ['Drive', function (p) { return attr(p, 'drive'); }],
            ['Head / Form', function (p) { return attr(p, 'head'); }],
            ['Thread', threadValue],
            ['Size Range', function (p) { return attr(p, 'sizeRange'); }],
            ['Sectors', function (p) { return attr(p, 'sectors'); }]
        ];

        var singleGuide = items.length === 1
            ? '<div class="pmew-compare-single-guide"><div><i class="fa-solid fa-code-compare" aria-hidden="true"></i></div>' +
              '<span><strong>Add an alternative to compare side by side.</strong>' +
              '<small>The current product is ready. Select one or more candidates in the Alternative Products section.</small></span>' +
              (document.getElementById('alternatives') ? '<button type="button" data-compare-view-alternatives>VIEW ALTERNATIVES</button>' : '') +
              '</div>'
            : '';

        var html = singleGuide +
            '<div class="pmew-compare-table-wrap" role="region" aria-label="Product comparison table" tabindex="0">' +
            '<table class="pmew-compare-table"><thead><tr><th class="pmew-compare-corner">Attribute</th>' +
            items.map(function (p) { return '<th class="pmew-compare-col">' + productHeader(p) + '</th>'; }).join('') +
            '</tr></thead><tbody>';

        rows.forEach(function (row) {
            html += '<tr><th scope="row">' + esc(row[0]) + '</th>' + items.map(function (p) {
                return '<td>' + esc(row[1](p) || '—') + '</td>';
            }).join('') + '</tr>';
        });

        html += '</tbody></table></div>';
        body.innerHTML = html;
        scheduleResponsiveSync();
    }

    function toast(message, type) {
        if (window.PradakoEnquiryCart && typeof window.PradakoEnquiryCart.toast === 'function') {
            window.PradakoEnquiryCart.toast(message, type || 'info');
        }
    }

    function add(product) {
        if (!product || !product.id) return false;
        if (has(product.id)) return true;
        if (items.length >= MAX) {
            toast('You can compare up to ' + MAX + ' products at a time.', 'warning');
            return false;
        }
        items.push(product);
        render();
        emit();
        return true;
    }

    function remove(id) {
        var target = items.find(function (product) { return product.id === id; });
        if (!target) return false;
        if (isLocked(target)) {
            toast('The current PDP product stays as the comparison reference.', 'info');
            return false;
        }
        items = items.filter(function (product) { return product.id !== id; });
        render();
        emit();
        return true;
    }

    function clear() {
        if (!items.length) return false;
        var locked = items.filter(isLocked);
        var changed = locked.length !== items.length;
        items = locked;
        render();
        if (changed) emit();
        return changed;
    }

    function toggle(product) {
        if (!product || !product.id) return false;
        if (has(product.id)) {
            var existing = items.find(function (item) { return item.id === product.id; });
            if (isLocked(existing)) return true;
            return remove(product.id);
        }
        return add(product);
    }

    function open() {
        ensure();
        if (!items.length) {
            toast('Select a product to compare.', 'warning');
            return false;
        }

        render();
        syncResponsiveMode();

        overlay.classList.add('is-open');
        panel.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        panel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('pmew-compare-open');

        /* Re-check after the browser has painted the open state. */
        scheduleResponsiveSync();
        window.setTimeout(scheduleResponsiveSync, 120);

        var closeButton = panel.querySelector('[data-compare-close]');
        if (closeButton) window.setTimeout(function () { closeButton.focus(); }, 60);
        return true;
    }

    function close() {
        if (!panel || !overlay) return;
        overlay.classList.remove('is-open');
        panel.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        panel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('pmew-compare-open');
    }

    function viewAlternatives() {
        var target = document.getElementById('alternatives');
        close();
        if (!target) return;
        window.setTimeout(function () {
            var offset = 112;
            var top = window.scrollY + target.getBoundingClientRect().top - offset;
            window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }, 80);
    }

    document.addEventListener('click', function (event) {
        var target = event.target.closest('[data-compare-close], [data-compare-remove], [data-compare-view-alternatives]');
        if (!target) return;

        if (target.hasAttribute('data-compare-close')) {
            event.preventDefault();
            close();
            return;
        }

        if (target.hasAttribute('data-compare-view-alternatives')) {
            event.preventDefault();
            viewAlternatives();
            return;
        }

        if (target.hasAttribute('data-compare-remove')) {
            event.preventDefault();
            remove(target.getAttribute('data-compare-remove'));
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') close();
    });

    window.PradakoCompare = {
        __pmewSharedV6: true,
        __pmewSharedV8: true,
        MAX: MAX,
        add: add,
        remove: remove,
        clear: clear,
        toggle: toggle,
        has: has,
        open: open,
        close: close,
        count: function () { return items.length; },
        items: function () { return items.slice(); },
        on: function (name, fn) {
            if (name === 'change' && typeof fn === 'function') listeners.change.push(fn);
        }
    };
}(window, document));
