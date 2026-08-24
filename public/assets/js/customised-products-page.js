/* ========================================================================== 
   PMEW CUSTOMISED PRODUCTS — LIGHT PAGE CONTROLS
   ========================================================================== */
(function (window, document) {
    'use strict';

    var VIEW_BUTTONS = {
        gallery: '#customGalleryViewBtn',
        grid: '#customGridViewBtn',
        list: '#customListViewBtn',
        detail: '#customDetailsViewBtn',
        technical: '#customDetailsViewBtn',
        chart: '#customChartViewBtn'
    };

    function goToView(view) {
        var selector = VIEW_BUTTONS[view] || '';
        var button = selector ? document.querySelector(selector) : null;
        if (button) button.click();

        var section = document.getElementById('customized_products');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateBackTop() {
        var button = document.getElementById('pmewBackTop');
        if (button) button.classList.toggle('is-visible', window.scrollY > 700);
    }

    function bind() {
        document.addEventListener('click', function (event) {
            var viewLink = event.target.closest('[data-nav-view]');
            if (!viewLink) return;
            event.preventDefault();
            goToView(viewLink.getAttribute('data-nav-view'));
        });

        var back = document.getElementById('pmewBackTop');
        if (back) {
            back.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        window.addEventListener('scroll', updateBackTop, { passive: true });
        updateBackTop();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
    else bind();

}(window, document));
