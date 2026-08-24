/* ==========================================================================
   PRADAKO — GALLERY VIEW
   --------------------------------------------------------------------------
   WHY A GALLERY EXISTS AT ALL

   A buyer often recognises a fastener by APPEARANCE before they know its
   standard. Somebody holding a part off a machine, or looking at a photograph
   from a customer, cannot type "DIN 7504 K" — but they can spot the hex washer
   head with the bonded EPDM washer in two seconds. For customised geometries —
   SEMS stacks, captive washers, special forgings, knurled shoulders — that is
   the primary way people search.

   WHY IT IS ONE VIEW AND NOT TWO

   The obvious design is Gallery (image + name) and Grid (image + name + family
   + standard + size + buttons) as separate modes. That is not two views. It is
   one view at two densities, and asking a buyer to learn an extra mode for the
   sake of three lines of text is exactly the interface friction we are trying
   to remove.

   So Gallery carries the controls instead:

       density   Small (6 across) / Medium (4) / Large (3)
       specs     off  -> image + name only, the "fastener museum" reading
                 on   -> family, lead standard, size range, actions

   Small + specs off is a visual scan of the whole catalogue. Large + specs on
   is a conventional product grid. Same code, one less thing to learn.

   DESIGN RULES

   - Strict 1:1 image canvas with object-fit: contain. Never masonry. Ragged
     tile heights make it impossible to compare part scale and proportion,
     which is the entire reason an engineer is looking at photographs.
   - Image-dominant, not card-dominant. No border, no shadow, no badge stack.
     On an ultra-white canvas the products should look like they are floating.
   - Clicking opens a Quick View, it does not navigate away. A buyer scanning
     for a shape wants to press the arrow keys through fifty parts, not load
     fifty pages.

   DEPENDS ON
     js/customised-products.js    (state, filtering, catalogue)
     js/pradako-enquiry-cart.js   (icons, basket)
     css/pradako-gallery.css
   ========================================================================== */

(function (window, document) {
    'use strict';

    var STORAGE_DENSITY = 'pradako_gallery_density';
    var STORAGE_SPECS = 'pradako_gallery_specs';

    /* Medium is the ORIGINAL card size — four across, 340px tall, 200px image
       box. Small and Large are conveniences either side of it, never the
       default, so the page always opens at the size the site was designed at. */
    var DENSITIES = ['small', 'medium', 'large'];

    var state = {
        density: 'medium',
        showSpecs: false,
        quickIndex: -1
    };

    var pool = [];          /* the currently filtered products, in view order */
    var el = {};

    /* ======================================================================
       01. UTILITIES
       ====================================================================== */

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function icon(name) {
        return (window.PradakoEnquiryCart && window.PradakoEnquiryCart.icon)
            ? window.PradakoEnquiryCart.icon(name) : '';
    }

    function read(key, fallback) {
        try {
            var value = window.localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function write(key, value) {
        try { window.localStorage.setItem(key, value); } catch (error) { /* ignore */ }
    }

    /* ======================================================================
       02. TILE
       ====================================================================== */

    function specLine(product) {
        var attrs = product.attributes || {};
        var bits = [];

        if (attrs.standards && attrs.standards.length) bits.push(attrs.standards[0]);
        if (attrs.sizeRange) bits.push(String(attrs.sizeRange).split('|')[0].trim());

        return bits.join('  \u00b7  ');
    }

    function tile(product, index) {
        var inCart = Boolean(window.PradakoEnquiryCart &&
            window.PradakoEnquiryCart.has(product.id));

        var media = product.image
            ? '<img src="' + escapeHtml(product.image) + '" alt="' +
              escapeHtml(product.name) + '" loading="lazy" decoding="async">'
            : '<span class="pmew-gal-blank">' + icon('clipboard') + '</span>';

        /* The product NAME is an anchor to its own detail page, not a button.
           These 286 pages were previously reachable only through a JavaScript
           view behind query strings, which meant Googlebot had no path to any
           of them — 286 generated pages, zero crawlable links. Rendering the
           name as a real <a> gives every product an indexable route in. */
        var link = escapeHtml(product.url || product.familyUrl);

        var specs = state.showSpecs
            ? '<span class="pmew-gal-spec">' + escapeHtml(specLine(product)) + '</span>'
            : '';

        return '<article class="pradako-products-card pmew-gal-card" ' +
            'data-gallery-index="' + index + '">' +

            '<div class="pradako-products-image-box pmew-gal-canvas" ' +
            'data-gallery-open="' + index + '" role="button" tabindex="0" ' +
            'aria-label="Quick view: ' + escapeHtml(product.name) + '">' + media +
            (inCart ? '<span class="pmew-gal-flag" title="In enquiry">' +
                icon('check') + '</span>' : '') +
            '</div>' +

            '<div class="pradako-products-card-body pmew-gal-body">' +
            '<h3 class="pradako-products-card-title pmew-gal-name">' +
            '<a href="' + link + '">' + escapeHtml(product.name) + '</a></h3>' +
            (product.partNo
                ? '<span class="pmew-partno">' + escapeHtml(product.partNo) + '</span>'
                : '') +
            '<span class="pmew-gal-family">' + escapeHtml(product.family) + '</span>' +
            specs +
            '<div class="pmew-gal-actions">' +
            '<a class="pmew-gal-open" href="' + link + '">View product</a>' +
            '<button type="button" class="pmew-gal-add' + (inCart ? ' is-added' : '') + '"' +
            ' data-gallery-add="' + escapeHtml(product.id) + '"' +
            ' aria-label="' + (inCart ? 'In enquiry: ' : 'Add to enquiry: ') +
            escapeHtml(product.name) + '">' +
            (inCart ? icon('check') : icon('plus')) + '</button></div>' +
            '</div></article>';
    }

    /* ======================================================================
       03. RENDER
       ====================================================================== */

    function renderControls() {
        if (!el.controls) return;

        el.controls.innerHTML =
            '<span class="pmew-gal-ctl-label">Card size</span>' +
            '<div class="pmew-gal-density" role="group" aria-label="Image size">' +
            DENSITIES.map(function (d) {
                return '<button type="button" class="pmew-gal-density-btn' +
                    (state.density === d ? ' active' : '') + '" data-gallery-density="' + d + '"' +
                    ' aria-pressed="' + String(state.density === d) + '">' +
                    d.charAt(0).toUpperCase() + d.slice(1) + '</button>';
            }).join('') + '</div>' +
            '<label class="pmew-gal-specs-toggle">' +
            '<input type="checkbox" data-gallery-specs' +
            (state.showSpecs ? ' checked' : '') + '> Show details</label>';
    }

    function render(products) {
        if (!el.grid) return;

        pool = products || [];
        renderControls();

        el.grid.className = 'pmew-gal-grid is-' + state.density +
            (state.showSpecs ? ' has-specs' : '');

        if (!pool.length) {
            el.grid.innerHTML = '<p class="pradako-custom-empty-result">' +
                'No product matches the current filters.</p>';
            return;
        }

        el.grid.innerHTML = pool.map(tile).join('');
    }

    /* ======================================================================
       04. QUICK VIEW
       Clicking a tile must not navigate away. The whole point of a visual scan
       is pressing the arrow keys through fifty parts without page loads.
       ====================================================================== */

    function buildQuickView() {
        if (document.getElementById('pmew-quick')) return;

        var holder = document.createElement('div');
        holder.innerHTML = [
            '<div class="pmew-quick-overlay" id="pmew-quick-overlay"></div>',
            '<div class="pmew-quick" id="pmew-quick" role="dialog" aria-modal="true"',
            '     aria-label="Product quick view">',
            '  <button type="button" class="pmew-quick-close" id="pmew-quick-close"',
            '          aria-label="Close">' + icon('close') + '</button>',
            '  <button type="button" class="pmew-quick-nav pmew-quick-prev" id="pmew-quick-prev"',
            '          aria-label="Previous product">&#8249;</button>',
            '  <div class="pmew-quick-body" id="pmew-quick-body"></div>',
            '  <button type="button" class="pmew-quick-nav pmew-quick-next" id="pmew-quick-next"',
            '          aria-label="Next product">&#8250;</button>',
            '</div>'
        ].join('');

        while (holder.firstChild) document.body.appendChild(holder.firstChild);
    }

    function similarTo(product) {
        /* Browsing a customised catalogue is exploratory. Somebody looking at a
           hex washer head SEMS is very likely also weighing the pan head and
           the square washer variants. */
        return pool.filter(function (other) {
            return other.id !== product.id &&
                other.familySlug === product.familySlug &&
                other.category === product.category;
        }).slice(0, 6);
    }

    function renderQuick() {
        var product = pool[state.quickIndex];
        if (!product || !el.quickBody) return;

        var attrs = product.attributes || {};
        var inCart = Boolean(window.PradakoEnquiryCart &&
            window.PradakoEnquiryCart.has(product.id));

        var chips = [];
        if (attrs.standards && attrs.standards.length) chips.push(attrs.standards[0]);
        if (attrs.grades && attrs.grades.length) chips.push(attrs.grades.slice(0, 3).join(' / '));
        if (attrs.drive) chips.push(attrs.drive);
        if (attrs.sizeRange) chips.push(String(attrs.sizeRange).split('|')[0].trim());

        var similar = similarTo(product);

        el.quickBody.innerHTML =
            '<div class="pmew-quick-stage" id="pmew-quick-stage">' +
            (product.image
                ? '<img src="' + escapeHtml(product.image) + '" alt="' +
                  escapeHtml(product.name) + '" id="pmew-quick-img">'
                : '<span class="pmew-gal-blank">' + icon('clipboard') + '</span>') +
            '<span class="pmew-quick-zoomhint">Hover to inspect</span>' +
            '</div>' +

            '<div class="pmew-quick-meta">' +
            (product.partNo
                ? '<span class="pmew-partno is-lg">' + escapeHtml(product.partNo) + '</span>'
                : '') +
            '<span class="pmew-quick-eyebrow">' + escapeHtml(product.family) + ' \u00b7 ' +
            escapeHtml(product.category) + '</span>' +
            '<h3 class="pmew-quick-title">' + escapeHtml(product.name) + '</h3>' +
            '<div class="pmew-quick-chips">' + chips.map(function (c) {
                return '<span>' + escapeHtml(c) + '</span>';
            }).join('') + '</div>' +

            '<div class="pmew-quick-actions">' +
            '<a class="pmew-quick-primary" href="' +
            escapeHtml(product.url || product.familyUrl) + '">View full specification</a>' +
            '<button type="button" class="pmew-quick-secondary' + (inCart ? ' is-added' : '') +
            '" data-gallery-add="' + escapeHtml(product.id) + '">' +
            (inCart ? icon('check') + ' In enquiry' : icon('plus') + ' Add to enquiry') +
            '</button></div>' +

            '<span class="pmew-quick-counter">' + (state.quickIndex + 1) + ' of ' +
            pool.length + '  \u00b7  use \u2190 \u2192</span>' +
            '</div>' +

            (similar.length
                ? '<div class="pmew-quick-similar"><span>Similar products</span><div>' +
                  similar.map(function (s) {
                      var at = pool.indexOf(s);
                      return '<button type="button" data-gallery-open="' + at + '" title="' +
                          escapeHtml(s.name) + '">' +
                          (s.image ? '<img src="' + escapeHtml(s.image) + '" alt="">' : '') +
                          '</button>';
                  }).join('') + '</div></div>'
                : '');

        bindZoom();

        if (el.prev) el.prev.disabled = state.quickIndex <= 0;
        if (el.next) el.next.disabled = state.quickIndex >= pool.length - 1;
    }

    /* Restrained 1.8x zoom. Enough to read a recess, a knurl or a serration —
       not the exaggerated e-commerce magnifier, which is disorienting when what
       you are checking is geometry rather than fabric texture. */
    function bindZoom() {
        var stage = document.getElementById('pmew-quick-stage');
        var img = document.getElementById('pmew-quick-img');
        if (!stage || !img) return;

        stage.addEventListener('mousemove', function (event) {
            var box = stage.getBoundingClientRect();
            var x = ((event.clientX - box.left) / box.width) * 100;
            var y = ((event.clientY - box.top) / box.height) * 100;
            img.style.transformOrigin = x + '% ' + y + '%';
            img.style.transform = 'scale(1.8)';
        });

        stage.addEventListener('mouseleave', function () {
            img.style.transform = '';
        });
    }

    function openQuick(index) {
        if (index < 0 || index >= pool.length) return;
        state.quickIndex = index;
        renderQuick();

        el.quick.classList.add('is-open');
        el.overlay.classList.add('is-open');
        document.body.classList.add('pmew-quick-open');
        if (el.close) el.close.focus();
    }

    function closeQuick() {
        if (!el.quick) return;
        state.quickIndex = -1;
        el.quick.classList.remove('is-open');
        el.overlay.classList.remove('is-open');
        document.body.classList.remove('pmew-quick-open');
    }

    function step(delta) {
        var next = state.quickIndex + delta;
        if (next < 0 || next >= pool.length) return;
        state.quickIndex = next;
        renderQuick();
    }

    /* ======================================================================
       05. EVENTS
       ====================================================================== */

    function addToCart(id) {
        var cart = window.PradakoEnquiryCart;
        if (!cart) return;

        if (cart.has(id)) { cart.remove(id); return; }

        var product = null;
        for (var i = 0; i < pool.length; i += 1) {
            if (pool[i].id === id) { product = pool[i]; break; }
        }
        if (!product) return;

        cart.add({
            id: product.id,
            partNo: product.partNo,
            name: product.name,
            category: product.category || product.subType,
            family: product.family,
            familyUrl: product.familyUrl,
            image: product.image
        });
    }

    function bind() {
        document.addEventListener('click', function (event) {
            var target;

            if ((target = event.target.closest('[data-gallery-density]'))) {
                state.density = target.getAttribute('data-gallery-density');
                write(STORAGE_DENSITY, state.density);
                render(pool);
                return;
            }

            if ((target = event.target.closest('[data-gallery-add]'))) {
                event.preventDefault();
                event.stopPropagation();
                addToCart(target.getAttribute('data-gallery-add'));
                return;
            }

            if ((target = event.target.closest('[data-gallery-open]'))) {
                openQuick(parseInt(target.getAttribute('data-gallery-open'), 10));
                return;
            }

            if (event.target.closest('#pmew-quick-close') ||
                event.target.closest('#pmew-quick-overlay')) {
                closeQuick();
                return;
            }

            if (event.target.closest('#pmew-quick-prev')) { step(-1); return; }
            if (event.target.closest('#pmew-quick-next')) { step(1); }
        });

        document.addEventListener('change', function (event) {
            if (event.target.hasAttribute && event.target.hasAttribute('data-gallery-specs')) {
                state.showSpecs = event.target.checked;
                write(STORAGE_SPECS, state.showSpecs ? '1' : '0');
                render(pool);
            }
        });

        document.addEventListener('keydown', function (event) {
            var canvas = event.target.closest && event.target.closest('[data-gallery-open]');
            if (canvas && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                openQuick(parseInt(canvas.getAttribute('data-gallery-open'), 10));
                return;
            }

            if (state.quickIndex < 0) return;
            if (event.key === 'Escape') closeQuick();
            if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
        });

        if (window.PradakoEnquiryCart) {
            window.PradakoEnquiryCart.on('change', function () {
                /* Refresh tile state in place; a full re-render would lose the
                   reader's scroll position halfway down 286 products. */
                document.querySelectorAll('[data-gallery-add]').forEach(function (button) {
                    var added = window.PradakoEnquiryCart.has(
                        button.getAttribute('data-gallery-add'));
                    button.classList.toggle('is-added', added);
                });
                if (state.quickIndex >= 0) renderQuick();
            });
        }
    }

    /* ======================================================================
       06. BOOT
       ====================================================================== */

    function mount(gridNode, controlsNode) {
        el.grid = gridNode;
        el.controls = controlsNode;

        if (DENSITIES.indexOf(read(STORAGE_DENSITY, '')) > -1) {
            state.density = read(STORAGE_DENSITY, 'medium');
        }
        state.showSpecs = read(STORAGE_SPECS, '0') === '1';

        buildQuickView();

        el.quick = document.getElementById('pmew-quick');
        el.overlay = document.getElementById('pmew-quick-overlay');
        el.quickBody = document.getElementById('pmew-quick-body');
        el.close = document.getElementById('pmew-quick-close');
        el.prev = document.getElementById('pmew-quick-prev');
        el.next = document.getElementById('pmew-quick-next');

        bind();
    }

    /* The grouped catalogue renders its own cards but reuses quick view, so it
       hands over the ordered set the arrows should step through. */
    function setPool(products) {
        pool = products || [];
    }

    window.PradakoGallery = {
        mount: mount,
        render: render,
        setPool: setPool,
        state: function () { return JSON.parse(JSON.stringify(state)); }
    };

}(window, document));
