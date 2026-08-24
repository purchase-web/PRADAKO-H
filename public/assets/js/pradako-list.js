/* ==========================================================================
   PRADAKO — LIST VIEW
   --------------------------------------------------------------------------
   WHY THIS REPLACES "MATRIX"

   The old Matrix view was a bulk-selection interface wearing the costume of a
   catalogue view. A buyer choosing between "Grid, Details, Matrix, Chart" has
   no way to guess what Matrix shows, and the answer — chips grouped by type
   with checkboxes — is a tool, not a way of reading the catalogue.

   So the multi-select moves here, into a view whose purpose is obvious: a
   dense, scannable procurement table. Selecting several rows and adding them
   to the enquiry in one action is a natural thing to do in a table. It was
   never a reason to have a separate mode.

   WHAT THIS VIEW IS FOR

   A purchase or sourcing manager comparing forty products on the same six
   columns. Not photographs, not full specifications — just enough to shortlist
   quickly. Roughly thirty rows fit on a laptop screen against six products in
   the Gallery, which is the entire point.

   Columns are chosen to match how a fastener RFQ is actually written:
   Product, Family, Standard, Grade, Material, Size. Sorting is per column.

   DEPENDS ON
     js/customised-products.js
     js/pradako-enquiry-cart.js
     css/pradako-gallery.css
   ========================================================================== */

(function (window, document) {
    'use strict';

    /* These must sum to 100 or the browser rebalances them and the fixed-width
       thumbnail column is the first thing to collapse. */
    var COLUMNS = [
        { key: 'partNo', label: 'Part No.', width: '13%' },
        { key: 'name', label: 'Product', width: '21%' },
        { key: 'family', label: 'Family', width: '10%' },
        { key: 'standard', label: 'Standard', width: '16%' },
        { key: 'grade', label: 'Grade / Class', width: '14%' },
        { key: 'material', label: 'Material', width: '16%' },
        { key: 'size', label: 'Size range', width: '10%' }
    ];

    /* Thumbnails default ON. A 52px photograph costs roughly a fifth of the
       row density this view exists for, and two fasteners at that size can look
       alike — but recognition by appearance is how many buyers actually search,
       and losing a fifth of the rows is a smaller cost than losing the ability
       to spot the part. The toggle is there because I would rather be corrected
       by the page than argue about it. */
    var state = { sort: 'partNo', dir: 1, selection: {}, thumbs: 'medium' };

    var STORAGE_THUMBS = 'pradako_list_thumbs';

    /* Photographs cost row density, which is the thing this view exists for.
       Rather than argue the trade-off in the abstract, it is set by the reader:

           off      ~44px rows   maximum rows on screen
           small    ~48px        enough to tell a hex from a countersunk
           medium   ~64px        default
           large    ~84px        inspect head form and drive

       Persisted, so a buyer sets it once. */
    var THUMB_SIZES = ['off', 'small', 'medium', 'large'];
    var pool = [];
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

    function first(value) {
        if (Array.isArray(value)) return value.length ? value[0] : '';
        return value || '';
    }

    function cellValue(product, key) {
        var attrs = product.attributes || {};
        switch (key) {
            case 'partNo': return product.partNo || '';
            case 'name': return product.name;
            case 'family': return product.family;
            case 'standard': return first(attrs.standards);
            case 'grade': return (attrs.grades || []).slice(0, 3).join(' / ');
            case 'material': return first(attrs.materials);
            case 'size': return String(attrs.sizeRange || '').split('|')[0].trim();
            default: return '';
        }
    }

    function selectedIds() { return Object.keys(state.selection); }

    /* ======================================================================
       02. RENDER
       ====================================================================== */

    function sorted(list) {
        var out = list.slice();
        out.sort(function (a, b) {
            var av = cellValue(a, state.sort) || '';
            var bv = cellValue(b, state.sort) || '';
            return av.localeCompare(bv) * state.dir || a.name.localeCompare(b.name);
        });
        return out;
    }

    function thumbCell(product) {
        if (state.thumbs === 'off') return '';
        return '<td class="pmew-list-thumb">' +
            (product.image
                ? '<img src="' + escapeHtml(product.image) + '" alt="" loading="lazy" decoding="async">'
                : '<span class="pmew-list-thumb-blank">' + icon('clipboard') + '</span>') +
            '</td>';
    }

    function row(product) {
        var picked = Boolean(state.selection[product.id]);
        var inCart = Boolean(window.PradakoEnquiryCart &&
            window.PradakoEnquiryCart.has(product.id));

        return '<tr class="pmew-list-row' + (picked ? ' is-picked' : '') +
            (inCart ? ' is-in-enquiry' : '') + '" data-list-id="' +
            escapeHtml(product.id) + '">' +

            '<td class="pmew-list-check"><input type="checkbox" data-list-pick="' +
            escapeHtml(product.id) + '"' + (picked ? ' checked' : '') +
            ' aria-label="Select ' + escapeHtml(product.name) + '"></td>' +
            thumbCell(product) +

            COLUMNS.map(function (column) {
                var value = cellValue(product, column.key);
                if (column.key === 'partNo') {
                    return '<td class="pmew-list-partno">' + escapeHtml(value) + '</td>';
                }
                if (column.key === 'name') {
                    return '<td class="pmew-list-name">' +
                        '<a href="' + escapeHtml(product.url || product.familyUrl) + '">' +
                        escapeHtml(value) + '</a>' +
                        (inCart ? '<span class="pmew-list-flag" title="In enquiry">' +
                            icon('check') + '</span>' : '') + '</td>';
                }
                return '<td>' + (value ? escapeHtml(value) :
                    '<span class="pmew-list-na">&mdash;</span>') + '</td>';
            }).join('') +

            '<td class="pmew-list-action">' +
            '<button type="button" class="pmew-list-add' + (inCart ? ' is-added' : '') + '"' +
            ' data-list-add="' + escapeHtml(product.id) + '"' +
            ' aria-label="' + (inCart ? 'Remove ' : 'Add ') + escapeHtml(product.name) + '">' +
            (inCart ? icon('check') : icon('plus')) + '</button></td></tr>';
    }

    function render(products) {
        if (!el.host) return;
        pool = products || [];

        if (!pool.length) {
            el.host.innerHTML = '<p class="pradako-custom-empty-result">' +
                'No product matches the current filters.</p>';
            renderBar();
            return;
        }

        var rows = sorted(pool);
        var allPicked = rows.every(function (p) { return state.selection[p.id]; });

        el.host.innerHTML =
            '<div class="pmew-list-toolbar">' +
            '<span class="pmew-list-ctl-label">Photographs</span>' +
            '<div class="pmew-list-thumbsizes" role="group" aria-label="Photograph size">' +
            THUMB_SIZES.map(function (size) {
                return '<button type="button" class="pmew-list-thumbbtn' +
                    (state.thumbs === size ? ' active' : '') +
                    '" data-list-thumbs="' + size + '" aria-pressed="' +
                    String(state.thumbs === size) + '">' +
                    size.charAt(0).toUpperCase() + size.slice(1) + '</button>';
            }).join('') + '</div></div>' +
            '<div class="pmew-list-wrap"><table class="pmew-list-table thumbs-' +
            state.thumbs + (state.thumbs !== 'off' ? ' has-thumbs' : '') + '">' +
            '<thead><tr>' +
            '<th class="pmew-list-check"><input type="checkbox" data-list-all' +
            (allPicked ? ' checked' : '') + ' aria-label="Select all"></th>' +
            (state.thumbs !== 'off' ? '<th class="pmew-list-thumb"></th>' : '') +
            COLUMNS.map(function (column) {
                var active = state.sort === column.key;
                return '<th style="width:' + column.width + '">' +
                    '<button type="button" class="pmew-list-sort' + (active ? ' active' : '') +
                    '" data-list-sort="' + column.key + '">' + escapeHtml(column.label) +
                    '<span>' + (active ? (state.dir === 1 ? '\u2191' : '\u2193') : '') +
                    '</span></button></th>';
            }).join('') +
            '<th class="pmew-list-action"></th>' +
            '</tr></thead><tbody>' + rows.map(row).join('') + '</tbody></table></div>';

        renderBar();
    }

    function renderBar() {
        if (!el.bar) return;

        var ids = selectedIds();
        el.bar.classList.toggle('is-visible', ids.length > 0);
        if (!ids.length) { el.bar.innerHTML = ''; return; }

        var cart = window.PradakoEnquiryCart;
        var room = cart ? Math.max(cart.MAX - cart.count(), 0) : ids.length;

        el.bar.innerHTML =
            '<span class="pmew-selbar-count">' + ids.length + ' selected</span>' +
            (room < ids.length
                ? '<span class="pmew-selbar-warn">' + icon('warn') + ' room for ' + room + '</span>'
                : '') +
            '<button type="button" class="pmew-selbar-btn pmew-selbar-primary" data-list-commit>' +
            icon('plus') + 'Add ' + Math.min(ids.length, room) + ' to Enquiry</button>' +
            '<button type="button" class="pmew-selbar-btn" data-list-compare>' +
            icon('compare') + 'Compare</button>' +
            '<button type="button" class="pmew-selbar-btn" data-list-clear>Clear</button>';
    }

    /* ======================================================================
       03. ACTIONS
       ====================================================================== */

    function byId(id) {
        for (var i = 0; i < pool.length; i += 1) {
            if (pool[i].id === id) return pool[i];
        }
        return null;
    }

    function commit() {
        var cart = window.PradakoEnquiryCart;
        if (!cart) return;

        var added = 0, skipped = 0;

        selectedIds().forEach(function (id) {
            var product = byId(id);
            if (!product) return;
            if (cart.has(id) || cart.isFull()) { skipped += 1; return; }

            if (cart.add({
                id: product.id,
                partNo: product.partNo,
                name: product.name,
                category: product.category || product.subType,
                family: product.family,
                familyUrl: product.familyUrl,
                image: product.image
            }, true)) added += 1;
            else skipped += 1;
        });

        state.selection = {};

        if (added && skipped) {
            cart.toast(added + ' added, ' + skipped + ' skipped \u2014 the basket holds ' +
                cart.MAX + ' products.', 'warning');
        } else if (added) {
            cart.toast(added + ' product' + (added === 1 ? '' : 's') +
                ' added to your enquiry.', 'success');
        } else {
            cart.toast('Nothing added \u2014 already in the basket, or it is full.', 'error');
        }

        render(pool);
    }

    function bind() {
        document.addEventListener('click', function (event) {
            var target;

            if ((target = event.target.closest('[data-list-thumbs]'))) {
                state.thumbs = target.getAttribute('data-list-thumbs');
                try { window.localStorage.setItem(STORAGE_THUMBS, state.thumbs); }
                catch (e) { /* a preference is not worth failing over */ }
                render(pool);
                return;
            }

            if ((target = event.target.closest('[data-list-sort]'))) {
                var key = target.getAttribute('data-list-sort');
                if (state.sort === key) state.dir = -state.dir;
                else { state.sort = key; state.dir = 1; }
                render(pool);
                return;
            }

            if ((target = event.target.closest('[data-list-add]'))) {
                var id = target.getAttribute('data-list-add');
                var cart = window.PradakoEnquiryCart;
                if (!cart) return;
                if (cart.has(id)) cart.remove(id);
                else {
                    var product = byId(id);
                    if (product) {
                        cart.add({
                            id: product.id,
                            partNo: product.partNo, name: product.name,
                            category: product.category || product.subType,
                            family: product.family, familyUrl: product.familyUrl,
                            image: product.image
                        });
                    }
                }
                return;
            }

            if (event.target.closest('[data-list-commit]')) { commit(); return; }

            if (event.target.closest('[data-list-clear]')) {
                state.selection = {};
                render(pool);
                return;
            }

            if (event.target.closest('[data-list-compare]')) {
                if (window.PradakoCompare) {
                    selectedIds().forEach(function (id) {
                        var product = byId(id);
                        if (product) window.PradakoCompare.add(product);
                    });
                    state.selection = {};
                    render(pool);
                    window.PradakoCompare.open();
                }
            }
        });

        document.addEventListener('change', function (event) {
            var node = event.target;

            if (node.hasAttribute && node.hasAttribute('data-list-pick')) {
                var id = node.getAttribute('data-list-pick');
                if (node.checked) state.selection[id] = true;
                else delete state.selection[id];

                var tr = node.closest('tr');
                if (tr) tr.classList.toggle('is-picked', node.checked);
                renderBar();
                return;
            }

            if (node.hasAttribute && node.hasAttribute('data-list-all')) {
                if (node.checked) pool.forEach(function (p) { state.selection[p.id] = true; });
                else state.selection = {};
                render(pool);
            }
        });

        if (window.PradakoEnquiryCart) {
            window.PradakoEnquiryCart.on('change', function () {
                if (el.host && el.host.querySelector('.pmew-list-table')) render(pool);
            });
        }
    }

    function mount(hostNode, barNode) {
        el.host = hostNode;
        el.bar = barNode;

        try {
            var saved = window.localStorage.getItem(STORAGE_THUMBS);
            if (THUMB_SIZES.indexOf(saved) > -1) state.thumbs = saved;
        } catch (e) { /* default stands */ }

        bind();
    }

    window.PradakoList = {
        mount: mount,
        render: render,
        clearSelection: function () { state.selection = {}; renderBar(); }
    };

}(window, document));
