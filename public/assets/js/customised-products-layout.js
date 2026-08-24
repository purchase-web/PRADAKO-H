/* ========================================================================== 
   PMEW CUSTOMISED PRODUCTS — LIVE SHELL / STICKY TOOLBAR OFFSET
   --------------------------------------------------------------------------
   Measures the injected PMEW site header and exposes one CSS variable used by
   the catalogue toolbar. Floating enquiry UI is now created directly under
   <body> by pradako-enquiry-cart.js, so no DOM re-parenting observer is needed.
   ========================================================================== */
(function (window, document) {
    'use strict';

    var root = document.documentElement;
    var navbarHost = document.getElementById('navbar-container');
    var frame = 0;
    var resizeObserver = null;

    function isVisible(node) {
        if (!node || !node.getClientRects().length) return false;
        var style = window.getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    function measureStickyNavbar() {
        frame = 0;
        var offset = 0;

        if (navbarHost && isVisible(navbarHost)) {
            var candidates = [navbarHost].concat(Array.prototype.slice.call(
                navbarHost.querySelectorAll('header, nav, .main-header, .pmew-site-header, .navbar, [data-sticky-header]')
            ));

            candidates.forEach(function (node) {
                if (!isVisible(node)) return;

                var style = window.getComputedStyle(node);
                var rect = node.getBoundingClientRect();
                var pinned = style.position === 'fixed' || style.position === 'sticky';

                if (pinned && rect.top <= 2 && rect.bottom > 0) {
                    offset = Math.max(offset, rect.bottom);
                }
            });

            /* Fallback for a shell whose host itself owns the rendered height. */
            if (!offset) {
                var hostRect = navbarHost.getBoundingClientRect();
                if (hostRect.top <= 2 && hostRect.bottom > 0) offset = hostRect.bottom;
            }
        }

        offset = Math.max(0, Math.round(offset));
        root.style.setProperty('--pmew-main-header-height', offset + 'px');
        root.style.setProperty('--pmew-sticky-toolbar-top', offset + 'px');
    }

    function scheduleMeasure() {
        if (frame) window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(measureStickyNavbar);
    }

    function observeNavbar() {
        if (!navbarHost) return;

        if ('ResizeObserver' in window) {
            resizeObserver = new ResizeObserver(scheduleMeasure);
            resizeObserver.observe(navbarHost);
        }

        if ('MutationObserver' in window) {
            new MutationObserver(scheduleMeasure).observe(navbarHost, {
                childList: true,
                subtree: true,
                attributes: true
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        scheduleMeasure();
        observeNavbar();
    }, { once: true });

    window.addEventListener('load', scheduleMeasure, { once: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    window.addEventListener('orientationchange', scheduleMeasure, { passive: true });
    window.addEventListener('pmew:shell-loaded', scheduleMeasure);

}(window, document));
