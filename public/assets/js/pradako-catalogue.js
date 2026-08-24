/* ==========================================================================
   PRADAKO — GROUPED CATALOGUE  ("Browse all products")
   --------------------------------------------------------------------------
   Every product on one page, in catalogue order:

       SCREWS
         Universal Screws        18 products    [cards]
         Based on Application    16 products    [cards]
         Special Screws          15 products    [cards]
         Thread / Head Types     16 products    [cards]
       BOLTS
         Standard Bolts          10 products    [cards]
         ...

   43 category blocks, 286 products.

   WHY THIS IS NOT JUST A LONG GRID
   --------------------------------
   Two problems have to be solved or the page is unusable.

   1. WEIGHT. 286 photographs at current file sizes is tens of megabytes and a
      slow first paint on a plant connection. Family blocks therefore render
      PROGRESSIVELY: the first two are built immediately and the rest arrive as
      an IntersectionObserver sentinel scrolls into view. Images are lazy on top
      of that, so a reader who stops after Screws downloads Screws.

   2. ORIENTATION. Scrolling past 65 screws to reach Bolts is not browsing, it
      is endurance. A sticky family rail with scroll-spy sits above the content
      so any family is one click away and the reader always knows where they are.

   The same visual language as the family pages — category heading, count,
   four-across cards — so moving between them feels like one catalogue rather
   than two systems.

   DEPENDS ON
     js/customised-products.js
     js/pradako-gallery.js        (quick view, reused here)
     js/pradako-enquiry-cart.js
   ========================================================================== */

(function (window, document) {
    'use strict';

    var FIRST_PAINT_FAMILIES = 2;   /* rendered immediately; rest stream in */

    var el = {};
    var families = [];              /* [{ family, groups: [{group, products}] }] */
    var flat = [];                  /* every product, in render order */
    var rendered = 0;
    var observer = null;
    var spy = null;

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

    function slugify(value) {
        return String(value || '').toLowerCase()
            .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    /* ======================================================================
       02. MARKUP
       ====================================================================== */

    function card(product, index) {
        var inCart = Boolean(window.PradakoEnquiryCart &&
            window.PradakoEnquiryCart.has(product.id));

        var link = escapeHtml(product.url || product.familyUrl);

        return '<article class="pradako-products-card pmew-cat-card">' +
            '<div class="pradako-products-image-box pmew-gal-canvas" ' +
            'data-gallery-open="' + index + '" role="button" tabindex="0" ' +
            'aria-label="Quick view: ' + escapeHtml(product.name) + '">' +
            (product.image
                ? '<img src="' + escapeHtml(product.image) + '" alt="' +
                  escapeHtml(product.name) + '" loading="lazy" decoding="async">'
                : '<span class="pmew-gal-blank">' + icon('clipboard') + '</span>') +
            (inCart ? '<span class="pmew-gal-flag" title="In enquiry">' +
                icon('check') + '</span>' : '') +
            '</div>' +
            '<div class="pradako-products-card-body pmew-cat-body">' +
            (product.partNo
                ? '<span class="pmew-partno">' + escapeHtml(product.partNo) + '</span>'
                : '') +
            '<h3 class="pmew-cat-name"><a href="' + link + '">' +
            escapeHtml(product.name) + '</a></h3>' +
            '<button type="button" class="pmew-cat-add' + (inCart ? ' is-added' : '') + '"' +
            ' data-gallery-add="' + escapeHtml(product.id) + '">' +
            (inCart ? icon('check') + ' In enquiry' : icon('plus') + ' Add to Enquiry') +
            '</button></div></article>';
    }

    function categoryBlock(entry, cursor) {
        var cards = entry.products.map(function (product, i) {
            return card(product, cursor + i);
        }).join('');

        return '<section class="pmew-cat-block" id="cat-' +
            escapeHtml(entry.slug) + '">' +
            '<header class="pmew-cat-head"><div>' +
            '<h3 class="pmew-cat-title">' + escapeHtml(entry.group.type) + '</h3>' +
            '<div class="pmew-cat-rule"></div></div>' +
            '<span class="pmew-cat-count">' + entry.products.length +
            ' Product' + (entry.products.length === 1 ? '' : 's') + '</span>' +
            '</header>' +
            '<div class="pmew-cat-grid">' + cards + '</div></section>';
    }

    function familyBlock(node) {
        var cursor = node.cursor;

        var blocks = node.groups.map(function (entry) {
            var html = categoryBlock(entry, cursor);
            cursor += entry.products.length;
            return html;
        }).join('');

        return '<section class="pmew-fam-block" id="fam-' +
            escapeHtml(node.family.slug) + '" data-family-block="' +
            escapeHtml(node.family.slug) + '">' +
            '<header class="pmew-fam-head">' +
            (node.family.seriesNo
                ? '<span class="pmew-partno pmew-fam-series">' +
                  escapeHtml(node.family.seriesNo) + '</span>'
                : '') +
            '<h2 class="pmew-fam-title">' + escapeHtml(node.family.name) + '</h2>' +
            '<span class="pmew-fam-meta">' + node.total + ' products \u00b7 ' +
            node.groups.length + ' categories</span>' +
            '<a class="pmew-fam-open" href="' + escapeHtml(node.family.url) + '">' +
            'Open the ' + escapeHtml(node.family.name) + ' page' + icon('arrow') + '</a>' +
            '</header>' + blocks + '</section>';
    }

    function rail() {
        return '<nav class="pmew-cat-familyrail" aria-label="Jump to a family">' +
            '<span class="pmew-cat-rail-label">Families</span>' +
            '<div class="pmew-cat-rail-track">' +
            families.map(function (node) {
                return '<a class="pmew-cat-railchip" href="#fam-' +
                    escapeHtml(node.family.slug) + '" data-rail="' +
                    escapeHtml(node.family.slug) + '">' +
                    escapeHtml(node.family.name) +
                    '<small>' + node.total + '</small></a>';
            }).join('') + '</div></nav>';
    }

    /* ======================================================================
       03. PROGRESSIVE RENDER
       ====================================================================== */

    function renderNext(count) {
        var html = '';
        var limit = Math.min(rendered + count, families.length);

        for (; rendered < limit; rendered += 1) {
            html += familyBlock(families[rendered]);
        }

        if (html) el.stream.insertAdjacentHTML('beforeend', html);

        if (rendered >= families.length) {
            if (el.sentinel) el.sentinel.hidden = true;
            if (observer) observer.disconnect();
        }

        attachSpy();
    }

    function attachSpy() {
        if (!('IntersectionObserver' in window)) return;
        if (spy) spy.disconnect();

        var chips = {};
        el.host.querySelectorAll('[data-rail]').forEach(function (chip) {
            chips[chip.getAttribute('data-rail')] = chip;
        });

        spy = new window.IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var slug = entry.target.getAttribute('data-family-block');
                Object.keys(chips).forEach(function (key) {
                    chips[key].classList.toggle('is-current', key === slug);
                });
                var current = chips[slug];
                var track = el.host.querySelector('.pmew-cat-rail-track');
                if (current && track) {
                    track.scrollTo({
                        left: Math.max(0, current.offsetLeft - track.clientWidth / 2 +
                            current.offsetWidth / 2),
                        behavior: 'smooth'
                    });
                }
            });
        }, { rootMargin: '-20% 0px -70% 0px' });

        el.host.querySelectorAll('[data-family-block]').forEach(function (block) {
            spy.observe(block);
        });
    }

    /* ======================================================================
       04. BUILD
       ====================================================================== */

    function render(catalog, products) {
        if (!el.host) return;

        /* Group in catalogue order so the page reads the same way the printed
           catalogue does. */
        families = [];
        flat = [];
        var cursor = 0;

        catalog.forEach(function (family) {
            var groups = [];
            var total = 0;

            family.groups.forEach(function (group) {
                var items = products.filter(function (p) {
                    return p.familySlug === family.slug && p.groupKey === group.key;
                });
                if (!items.length) return;

                groups.push({
                    group: group,
                    products: items,
                    slug: family.slug + '-' + slugify(group.type)
                });
                total += items.length;
            });

            if (!groups.length) return;

            families.push({ family: family, groups: groups, total: total, cursor: cursor });
            groups.forEach(function (entry) {
                entry.products.forEach(function (p) { flat.push(p); });
                cursor += entry.products.length;
            });
        });

        /* Quick view steps through the whole page in visual order. */
        if (window.PradakoGallery) window.PradakoGallery.setPool(flat);

        rendered = 0;
        el.host.innerHTML =
            rail() +
            '<div class="pmew-cat-summary">' + flat.length + ' products across ' +
            families.length + ' families</div>' +
            '<div class="pmew-cat-stream" id="pmewCatStream"></div>' +
            '<div class="pmew-cat-sentinel" id="pmewCatSentinel">' +
            '<span class="pmew-cat-spinner"></span>Loading more families\u2026</div>';

        el.stream = document.getElementById('pmewCatStream');
        el.sentinel = document.getElementById('pmewCatSentinel');

        renderNext(FIRST_PAINT_FAMILIES);

        if ('IntersectionObserver' in window && rendered < families.length) {
            observer = new window.IntersectionObserver(function (entries) {
                if (entries.some(function (e) { return e.isIntersecting; })) renderNext(1);
            }, { rootMargin: '600px 0px' });
            observer.observe(el.sentinel);
        } else {
            renderNext(families.length);
        }
    }

    /* ======================================================================
       05. EVENTS
       ====================================================================== */

    function bind() {
        document.addEventListener('click', function (event) {
            var chip = event.target.closest('[data-rail]');
            if (!chip || !el.host || !el.host.contains(chip)) return;

            event.preventDefault();
            var slug = chip.getAttribute('data-rail');

            /* A family further down may not be built yet. Build up to it, then
               jump — otherwise the anchor points at nothing. */
            var index = families.findIndex(function (n) { return n.family.slug === slug; });
            if (index >= rendered) renderNext(index - rendered + 1);

            var target = document.getElementById('fam-' + slug);
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - 120,
                    behavior: 'smooth'
                });
            }
        });

        if (window.PradakoEnquiryCart) {
            window.PradakoEnquiryCart.on('change', function () {
                if (!el.host) return;
                el.host.querySelectorAll('[data-gallery-add]').forEach(function (button) {
                    var added = window.PradakoEnquiryCart.has(
                        button.getAttribute('data-gallery-add'));
                    button.classList.toggle('is-added', added);
                    button.innerHTML = added
                        ? icon('check') + ' In enquiry'
                        : icon('plus') + ' Add to Enquiry';
                });
            });
        }
    }

    function mount(hostNode) {
        el.host = hostNode;
        bind();
    }

    window.PradakoCatalogue = {
        mount: mount,
        render: render
    };

}(window, document));
