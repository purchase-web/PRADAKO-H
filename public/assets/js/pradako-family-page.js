/* ==========================================================================
   PRADAKO — FAMILY PAGE ENHANCER
   --------------------------------------------------------------------------
   WHY THIS EXISTS
   The 12 family pages were dead ends: no breadcrumb, no way to reach a sibling
   family, no way to raise an enquiry, no closing call to action. Fixing that by
   hand would have meant editing screw.html (190 KB), bolt.html (110 KB) and ten
   others — thousands of lines of duplicated markup and a permanent maintenance
   tax every time the range changes.

   Instead this one script upgrades every family page at runtime. Drop the two
   tags below into any family page and it inherits the whole upgrade:

     <link rel="stylesheet" href="/assets/css/pradako-products-plus.css">
     <script defer src="/assets/js/pradako-family-page.js"></script>

   WHAT IT ADDS
     01. Breadcrumb            Customized Products › Family
     02. Family tab strip      jump to any of the other 11 families
     03. Add to Enquiry        on every product card, capped at 10
     04. View all / Show less  on any category with more than 8 products
     05. Full-page CTA         closing enquiry band before the footer

   IT HANDLES THREE DIFFERENT MARKUP STYLES
     - Static .product-card markup      (washer, nut, rivet, threaded-rod,
                                         stud, bush, plug)
     - Mixed card classes               (screw.html uses .product-card,
                                         .pill-card, .special-card, .head-card)
     - Empty container to populate      (bolt.html, pin.html,
                                         stainless-steel.html, high-tensile.html)

   The universal hook is .card-content — present on all 56 screw cards and on
   every card of every other page.

   DEPENDS ON
     js/customised-products-data.js  (catalogue)
     js/pradako-enquiry-cart.js      (enquiry basket)
     css/pradako-products-plus.css
   ========================================================================== */

(function (window, document) {
    'use strict';

    var CATEGORY_PREVIEW = 8;   /* cards shown before "View All" kicks in */

    /* ======================================================================
       01. UTILITIES
       ====================================================================== */

    function escapeHtml(value) {
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

    function slugify(value) {
        return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function icon(name) {
        if (window.PradakoEnquiryCart && window.PradakoEnquiryCart.icon) {
            return window.PradakoEnquiryCart.icon(name);
        }
        return '';
    }

    /* ======================================================================
       02. IDENTIFY THE CURRENT FAMILY
       ====================================================================== */

    var catalog = Array.isArray(window.PMEW_CUSTOM_PRODUCT_CATALOG)
        ? window.PMEW_CUSTOM_PRODUCT_CATALOG
        : [];

    function currentPageFile() {
        var path = window.location.pathname.split('/').pop();
        return path || '/index.html';
    }

    function findFamily() {
        var file = currentPageFile().toLowerCase();

        for (var i = 0; i < catalog.length; i += 1) {
            if (clean(catalog[i].url).toLowerCase() === file) return catalog[i];
        }

        /* Fall back to matching the <h1> against family names. */
        var heading = document.querySelector('.showcase-title, h1');
        if (heading) {
            var text = clean(heading.textContent).toLowerCase();
            for (var j = 0; j < catalog.length; j += 1) {
                if (text.indexOf(clean(catalog[j].name).toLowerCase()) === 0) return catalog[j];
            }
        }

        return null;
    }

    var family = findFamily();

    /* ======================================================================
       03. POPULATE PAGES THAT RENDER NOTHING
       bolt.html rendered its cards from an inline script that also carried a
       duplicate copy of the enquiry cart. pin / stainless-steel / high-tensile
       were "coming soon" placeholders. All four are filled from the catalogue.
       ====================================================================== */

    function productImage(product) {
        return clean(product.image);
    }

    function renderCard(product, categoryTitle) {
        var image = productImage(product);

        var media = image
            ? '<img class="card-img" src="' + escapeHtml(image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy" decoding="async">'
            : '';

        return '<div class="product-card">' +
            media +
            '<div class="card-content"><h3>' + escapeHtml(product.name) + '</h3></div>' +
            '</div>';
    }

    function renderSectionsFromData(container) {
        if (!family || !family.groups || !family.groups.length) return false;

        /* Marks this container as runtime-generated so the scoped grid and card
           rules in pradako-products-plus.css apply. Pages that ship their own
           static markup never get this class. */
        container.classList.add('pmew-generated-sections');

        container.innerHTML = family.groups.map(function (group, index) {
            var products = Array.isArray(group.productItems) && group.productItems.length
                ? group.productItems
                : (group.products || []).map(function (name) { return { name: name, image: '' }; });

            if (!products.length) return '';

            var cards = products.map(function (product) {
                return renderCard(product, group.type);
            }).join('');


            return '<div class="mega-category' + (index % 2 === 1 ? ' alt-bg' : '') + '">' +
                '<div class="category-header"><div>' +
                '<h2 class="category-title">' + escapeHtml(group.type) +
                (group.provisional ? '<span class="pmew-provisional-badge">Provisional</span>' : '') +
                '</h2><div class="category-line"></div></div>' +
                '<div class="category-count">' + products.length + ' Products</div>' +
                '</div>' +
                '<div class="grid-4">' + cards + '</div>' +
                '</div>';
        }).join('');

        return true;
    }

    function metaBlurb() {
        var meta = (window.PMEW_CUSTOM_FAMILY_META || {})[family ? family.slug : ''] || {};
        return meta.blurb || 'Explore the full customised range. Select the products you need and send one consolidated technical enquiry.';
    }

    function ensureContent() {
        var existing = document.querySelectorAll('.card-content').length;
        if (existing) return;

        /* bolt.html's original render target. */
        var target = document.getElementById('bolt-sections') ||
            document.querySelector('[data-family-sections]');

        if (!target) {
            /* Placeholder pages: replace the "coming soon" panel. */
            var pending = document.querySelector('.pending-page');
            if (!pending || !family || !family.groups.length) return;

            var section = document.createElement('section');
            section.className = 'premium-washers-showcase pmew-generated-page';
            section.innerHTML = '<div class="showcase-container">' +
                '<div class="showcase-hero"><div class="hero-copy">' +
                '<div class="hero-badge">Premium Fastening Solutions</div>' +
                '<h1 class="showcase-title">' + escapeHtml(family.name.toUpperCase()) + '</h1>' +
                '<p class="showcase-desc">' + escapeHtml(metaBlurb()) + '</p>' +
                '</div></div>' +
                '<div data-family-sections></div></div>';

            pending.parentNode.replaceChild(section, pending);
            target = section.querySelector('[data-family-sections]');
        }

        if (target) renderSectionsFromData(target);
    }

    /* ======================================================================
       04. BREADCRUMB + FAMILY TABS
       ====================================================================== */

    function buildBar() {
        if (document.querySelector('.pmew-fp-bar')) return;

        var host = document.querySelector('.showcase-container') ||
            document.querySelector('main') ||
            document.body;

        if (!host) return;

        var familyName = family ? family.name : clean(document.title).split('|')[0];

        var breadcrumb = '<nav class="pmew-fp-breadcrumb" aria-label="Breadcrumb">' +
            '<a href="/pages/products/customised-products.html">Customized Products</a>' +
            '<span class="pmew-fp-sep" aria-hidden="true">&rsaquo;</span>' +
            '<a href="/pages/products/customised-products.html?view=details">All Products</a>' +
            '<span class="pmew-fp-sep" aria-hidden="true">&rsaquo;</span>' +
            '<strong>' + escapeHtml(familyName) + '</strong>' +
            '</nav>';

        var tabs = catalog.map(function (item) {
            var total = (item.groups || []).reduce(function (sum, group) {
                var list = group.productItems || group.products || [];
                return sum + list.length;
            }, 0);

            var isCurrent = family && item.slug === family.slug;

            return '<a class="pmew-fp-tab' + (isCurrent ? ' is-current' : '') +
                (total ? '' : ' is-empty') + '" href="' + escapeHtml(item.url) + '"' +
                (isCurrent ? ' aria-current="page"' : '') + '>' +
                escapeHtml(item.name) + '<small>' + total + '</small></a>';
        }).join('');

        var bar = document.createElement('div');
        bar.className = 'pmew-fp-bar';
        bar.innerHTML = breadcrumb +
            '<div class="pmew-fp-tabs" aria-label="Other product families">' + tabs + '</div>';

        var hero = host.querySelector('.showcase-hero');
        if (hero && hero.nextSibling) host.insertBefore(bar, hero.nextSibling);
        else host.insertBefore(bar, host.firstChild);

        /* Scroll the current family into view inside the strip. */
        var current = bar.querySelector('.pmew-fp-tab.is-current');
        var strip = bar.querySelector('.pmew-fp-tabs');
        if (current && strip) {
            strip.scrollLeft = Math.max(0, current.offsetLeft - 80);
        }
    }

    /* ======================================================================
       05. ADD TO ENQUIRY ON EVERY CARD
       ====================================================================== */

    function categoryTitleFor(card) {
        var block = card.closest('.mega-category, .mega-column, section');
        if (!block) return family ? family.name : '';

        var heading = block.querySelector('.category-title, .category-header h2, .category-header h3, h2');
        return heading ? clean(heading.textContent) : (family ? family.name : '');
    }

    /* Card markup is not uniform across the 12 pages:
         .product-card / .special-card / .head-card
             <div class="card-content"><h3>Set Screws</h3></div>
         .pill-card  (screw.html, 15 cards)
             <div class="card-content">Wood / Timber Screws</div>   <-- no heading
       Reading only h3 silently skipped every pill card, so screw.html ended up
       with 41 Add-to-Enquiry buttons against 56 products. Three fallbacks now
       cover every variant on every page. */
    function productNameFor(content, card) {
        var heading = content.querySelector('h3, h4, .card-title');
        if (heading) return clean(heading.textContent);

        /* Plain-text card body: wrap it so the button can sit beneath it. */
        if (!content.children.length) {
            var text = clean(content.textContent);
            if (text) {
                content.innerHTML = '<h3>' + escapeHtml(text) + '</h3>';
                return text;
            }
        }

        var img = card ? card.querySelector('img[alt]') : null;
        return img ? clean(img.getAttribute('alt')) : clean(content.textContent);
    }

    function imageFor(card) {
        var img = card.querySelector('img');
        return img ? (img.getAttribute('src') || '') : '';
    }

    function injectEnquiryButtons() {
        var contents = document.querySelectorAll('.card-content');

        Array.prototype.forEach.call(contents, function (content) {
            if (content.querySelector('[data-enquiry-id]')) return;

            var card = content.closest('.product-card, .pill-card, .special-card, .head-card, article, div');
            if (!card) return;

            var name = productNameFor(content, card);
            if (!name) return;

            var category = categoryTitleFor(card);
            var familyName = family ? family.name : '';
            var id = slugify((family ? family.slug : slugify(familyName)) + '-' + category + '-' + name);

            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'pmew-card-enquiry';
            button.setAttribute('data-enquiry-id', id);
            button.setAttribute('data-enquiry-name', name);
            button.setAttribute('data-enquiry-category', category);
            button.setAttribute('data-enquiry-family', familyName);
            button.setAttribute('data-enquiry-family-url', family ? family.url : currentPageFile());
            button.setAttribute('data-enquiry-image', imageFor(card));
            button.innerHTML = '<span data-enquiry-icon>' + icon('plus') + '</span>' +
                '<span data-enquiry-label>Add to Enquiry</span>';

            content.appendChild(button);
        });

        if (window.PradakoEnquiryCart) window.PradakoEnquiryCart.syncButtons();
    }

    /* ======================================================================
       06. VIEW ALL / SHOW LESS PER CATEGORY
       ====================================================================== */

    function injectShowMore() {
        var blocks = document.querySelectorAll('.mega-category');

        Array.prototype.forEach.call(blocks, function (block, index) {
            if (block.querySelector('[data-showmore-category]')) return;

            var grid = block.querySelector('.grid-4, .mega-column, [class*="grid"]');
            if (!grid) return;

            var cards = Array.prototype.filter.call(grid.children, function (node) {
                return node.querySelector && node.querySelector('.card-content');
            });

            if (cards.length <= CATEGORY_PREVIEW) return;

            var expanded = false;

            var apply = function () {
                cards.forEach(function (card, i) {
                    card.classList.toggle('pmew-is-collapsed', !expanded && i >= CATEGORY_PREVIEW);
                });

                button.innerHTML = expanded
                    ? 'Show Less'
                    : 'View All ' + cards.length + ' Products' +
                      '<span class="pmew-showmore-count">+' + (cards.length - CATEGORY_PREVIEW) + '</span>';
            };

            var row = document.createElement('div');
            row.className = 'pmew-showmore-row';

            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'pmew-showmore-btn';
            button.setAttribute('data-showmore-category', String(index));

            button.addEventListener('click', function () {
                expanded = !expanded;
                apply();

                if (!expanded) {
                    block.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });

            row.appendChild(button);
            grid.parentNode.insertBefore(row, grid.nextSibling);

            apply();
        });
    }

    /* ======================================================================
       06b. STICKY CATEGORY RAIL WITH SCROLL-SPY   (review point 6)
       screw.html runs to 56 products across 4 categories and bolt.html to 55
       across 9. Once you were three screens down there was no way to see where
       you were or jump elsewhere without scrolling back to the top.
       ====================================================================== */

    function buildCategoryRail() {
        if (document.querySelector('.pmew-cat-rail')) return;

        var blocks = Array.prototype.slice.call(document.querySelectorAll('.mega-category'));
        if (blocks.length < 2) return;

        var entries = blocks.map(function (block, index) {
            var heading = block.querySelector('.category-title, .category-header h2, .category-header h3');
            var title = heading ? clean(heading.textContent) : ('Section ' + (index + 1));
            var id = 'cat-' + slugify(title) || ('cat-' + index);

            block.id = id;

            var cards = block.querySelectorAll('.card-content').length;
            return { id: id, title: title, count: cards, block: block };
        });

        var rail = document.createElement('nav');
        rail.className = 'pmew-cat-rail';
        rail.setAttribute('aria-label', 'Jump to a category');
        rail.innerHTML = '<span class="pmew-cat-rail-label">On this page</span>' +
            '<div class="pmew-cat-rail-track">' +
            entries.map(function (entry) {
                return '<a class="pmew-cat-chip" href="#' + entry.id + '" data-cat-link="' + entry.id + '">' +
                    escapeHtml(entry.title) + '<small>' + entry.count + '</small></a>';
            }).join('') + '</div>';

        var bar = document.querySelector('.pmew-fp-bar');
        if (bar && bar.parentNode) bar.parentNode.insertBefore(rail, bar.nextSibling);
        else if (entries[0].block.parentNode) {
            entries[0].block.parentNode.insertBefore(rail, entries[0].block);
        }

        /* Scroll-spy: highlight the category currently on screen and keep the
           active chip scrolled into view inside the rail. */
        if (!('IntersectionObserver' in window)) return;

        var chips = {};
        rail.querySelectorAll('[data-cat-link]').forEach(function (chip) {
            chips[chip.getAttribute('data-cat-link')] = chip;
        });

        var setActive = function (id) {
            Object.keys(chips).forEach(function (key) {
                chips[key].classList.toggle('is-current', key === id);
            });
            var current = chips[id];
            var track = rail.querySelector('.pmew-cat-rail-track');
            if (current && track) {
                var left = current.offsetLeft - track.clientWidth / 2 + current.offsetWidth / 2;
                track.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
            }
        };

        var spy = new window.IntersectionObserver(function (observed) {
            observed.forEach(function (entry) {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-25% 0px -65% 0px' });

        entries.forEach(function (entry) { spy.observe(entry.block); });

        rail.addEventListener('click', function (event) {
            var link = event.target.closest('[data-cat-link]');
            if (!link) return;
            event.preventDefault();
            var target = document.getElementById(link.getAttribute('data-cat-link'));
            if (target) {
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.pageYOffset - 130,
                    behavior: 'smooth'
                });
            }
        });
    }

    /* ======================================================================
       07. FULL-PAGE CTA
       ====================================================================== */

    function buildCta() {
        if (document.querySelector('.pmew-cta-band')) return;

        var familyName = family ? family.name : 'Customised Fasteners';
        var meta = (window.PMEW_CUSTOM_FAMILY_META || {})[family ? family.slug : ''] || {};

        var standards = (meta.standards || []).slice(0, 6).join(' \u00b7 ') || 'DIN \u00b7 ISO \u00b7 ASTM \u00b7 ASME \u00b7 BS \u00b7 IS';
        var grades = (meta.grades || []).slice(0, 6).join(' \u00b7 ') || 'On request';
        var finishes = (meta.finishes || []).slice(0, 4).join(' \u00b7 ') || 'On request';
        var sizeRange = meta.sizeRange || 'On request';

        var section = document.createElement('section');
        section.className = 'pmew-cta-band';
        section.id = 'family-enquiry-cta';

        section.innerHTML = '<div class="pmew-cta-inner">' +
            '<span class="pmew-cta-kicker">' + escapeHtml(familyName) + ' \u2014 Request a Quotation</span>' +
            '<h2>Send one RFQ.<br>Not ten emails.</h2>' +
            '<p>Select up to 10 products from this page or any other family, add your size, grade, finish and quantity against each line, and submit the complete requirement as a single technical enquiry. Our engineering team responds within one working day.</p>' +

            '<div class="pmew-cta-actions">' +
            '<button type="button" class="pmew-cta-btn pmew-cta-btn-gold" data-open-enquiry>' +
            'Open Enquiry Basket <span class="pmew-cta-badge" data-cart-badge>0/10</span>' +
            '</button>' +
            '<a class="pmew-cta-btn pmew-cta-btn-outline" href="/pages/products/customised-products.html?view=details">Browse All Products</a>' +
            '<a class="pmew-cta-btn pmew-cta-btn-outline" href="mailto:info@pradakomechanicals.com?subject=' +
            encodeURIComponent('Drawing / Sample Review \u2014 ' + familyName) + '">Send a Drawing</a>' +
            '</div>' +

            '<div class="pmew-cta-grid">' +
            '<div class="pmew-cta-card"><strong>Standards</strong><span>' + escapeHtml(standards) + '</span></div>' +
            '<div class="pmew-cta-card"><strong>Grades</strong><span>' + escapeHtml(grades) + '</span></div>' +
            '<div class="pmew-cta-card"><strong>Size Range</strong><span>' + escapeHtml(sizeRange) + '</span></div>' +
            '<div class="pmew-cta-card"><strong>Finishes</strong><span>' + escapeHtml(finishes) + '</span></div>' +
            '</div>' +

            '<div class="pmew-cta-contact">' +
            '<div class="pmew-cta-contact-line"><span>Email</span>' +
            '<a href="mailto:info@pradakomechanicals.com">info@pradakomechanicals.com</a></div>' +
            '<div class="pmew-cta-contact-line"><span>Call 24 \u00d7 7 \u00d7 365</span>' +
            '<a href="tel:+917045000507">+91 7045000507</a></div>' +
            '<div class="pmew-cta-contact-line"><span>WhatsApp</span>' +
            '<a href="https://wa.me/917045000507" target="_blank" rel="noopener">+91 7045000507</a></div>' +
            '</div>' +
            '</div>';

        var footer = document.getElementById('footer-container');
        if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
        else document.body.appendChild(section);
    }

    function syncCtaBadge() {
        var cart = window.PradakoEnquiryCart;
        if (!cart) return;

        document.querySelectorAll('[data-cart-badge]').forEach(function (node) {
            node.textContent = cart.count() + '/' + cart.MAX;
        });
    }

    /* ======================================================================
       08. IMAGE SAFETY
       ====================================================================== */

    function bindImageFallbacks() {
        document.querySelectorAll('.card-img, .product-card img').forEach(function (img) {
            if (img.dataset.pmewFallback === 'true') return;
            img.dataset.pmewFallback = 'true';

            img.addEventListener('error', function () {
                var card = img.closest('.product-card, .pill-card, .special-card, .head-card');
                if (card) card.classList.add('image-missing');
                img.style.display = 'none';
            }, { once: true });
        });
    }

    /* ======================================================================
       09. BOOT
       ====================================================================== */

    function init() {
        if (document.body.dataset.pmewFamilyReady === 'true') return;
        document.body.dataset.pmewFamilyReady = 'true';

        ensureContent();
        buildBar();
        buildCategoryRail();
        injectEnquiryButtons();
        injectShowMore();
        buildCta();
        bindImageFallbacks();
        syncCtaBadge();

        if (window.PradakoEnquiryCart) {
            window.PradakoEnquiryCart.on('change', syncCtaBadge);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PradakoFamilyPage = { init: init, family: function () { return family; } };

}(window, document));
