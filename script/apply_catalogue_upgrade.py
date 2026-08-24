#!/usr/bin/env python3
"""Apply the August 2026 PMEW customised-products UX upgrade."""
from pathlib import Path
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]


def insert_before(text: str, marker: str, addition: str) -> str:
    if addition.strip() in text:
        return text
    if marker not in text:
        raise RuntimeError(f"Marker not found: {marker[:60]}")
    return text.replace(marker, addition + "\n" + marker, 1)


def add_shell_assets(path: Path, nested: bool = False) -> None:
    text = path.read_text(encoding="utf-8", errors="ignore")
    prefix = "../" if nested else ""
    css = f'<link rel="stylesheet" href="{prefix}css/pmew-site-shell.css">'
    js = f'<script defer src="{prefix}js/pmew-site-shell.js"></script>'
    if css not in text:
        text = insert_before(text, "</head>", css)
    if js not in text:
        text = insert_before(text, "</body>", js)
    path.write_text(text, encoding="utf-8")


def replace_screw_legacy_shell() -> None:
    path = ROOT / "screw.html"
    text = path.read_text(encoding="utf-8", errors="ignore")

    header_start = text.find('<header class="main-header">')
    header_end = text.find('</header>', header_start)
    if header_start >= 0 and header_end >= 0:
        text = text[:header_start] + '<div id="navbar-container"></div>\n' + text[header_end + len('</header>'):]

    footer_comment = text.find('<!-- ========== FOOTER ========== -->')
    footer_end = text.find('</footer>', footer_comment)
    if footer_comment >= 0 and footer_end >= 0:
        text = text[:footer_comment] + '<div id="footer-container"></div>\n' + text[footer_end + len('</footer>'):]

    # Remove the retired navigation/reveal script that followed the old footer.
    old_script = re.search(r'\n<script>\s*// ========== DESKTOP DROPDOWN FUNCTIONALITY.*?</script>', text, flags=re.S)
    if old_script:
        text = text[:old_script.start()] + '\n' + text[old_script.end():]

    if 'js/pradako-global-animations.js' not in text:
        text = text.replace('<script defer src="js/image-path-safety.js"></script>',
                            '<script defer src="js/pradako-global-animations.js"></script>\n  <script defer src="js/image-path-safety.js"></script>', 1)

    path.write_text(text, encoding="utf-8")


def simplify_customised_page() -> None:
    path = ROOT / "customised-products.html"
    soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="ignore"), "html.parser")

    page_nav = soup.select_one('.pradako-products-nav')
    if page_nav:
        page_nav.decompose()

    toggle = soup.select_one('.pradako-custom-view-toggle')
    if toggle:
        toggle.decompose()

    for selector in ('#customDetailsView', '#customMatrixView', '#customChartView'):
        node = soup.select_one(selector)
        if node:
            node.decompose()

    toolbar = soup.select_one('#customToolbar')
    if toolbar:
        toolbar.clear()
        search = soup.new_tag('div', attrs={'class': 'pmew-toolbar-search'})
        inp = soup.new_tag('input', attrs={
            'autocomplete': 'off',
            'class': 'pmew-toolbar-input',
            'id': 'customGlobalSearch',
            'type': 'search',
            'placeholder': 'Search products, standards, grades or materials...'
        })
        search.append(inp)
        toolbar.append(search)
        filter_btn = soup.new_tag('button', attrs={
            'aria-expanded': 'false', 'class': 'pmew-toolbar-btn',
            'id': 'customFacetToggle', 'type': 'button'
        })
        filter_btn.append('Filters')
        badge = soup.new_tag('span', attrs={'class': 'pmew-toolbar-badge', 'id': 'customFacetToggleCount', 'hidden': ''})
        filter_btn.append(badge)
        toolbar.append(filter_btn)
        count = soup.new_tag('span', attrs={'class': 'pmew-toolbar-count', 'id': 'customResultCount'})
        toolbar.append(count)
        clear = soup.new_tag('button', attrs={'class':'pmew-toolbar-clear','id':'customClearAll','type':'button','hidden':''})
        clear.string = 'Clear all'
        toolbar.append(clear)
        basket = soup.new_tag('button', attrs={'class':'pmew-toolbar-basket','data-open-enquiry':'','type':'button'})
        basket.append('Enquiry ')
        cart_badge = soup.new_tag('span', attrs={'class':'pmew-cta-badge','data-cart-badge':''})
        cart_badge.string = '0/10'
        basket.append(cart_badge)
        toolbar.append(basket)

    title = soup.select_one('#customised-products-page-title')
    if title:
        title.string = 'CUSTOMISED FASTENER PRODUCT GALLERY'
        p = soup.new_tag('p', attrs={'class':'pmew-gallery-intro'})
        p.string = 'Choose a product family, narrow it by type, and open the complete specification page for the exact item you need.'
        title.insert_after(p)

    grid = soup.select_one('#customGridView')
    if grid:
        grid['data-grid-only'] = 'true'

    meta = soup.find('meta', attrs={'name':'description'})
    if meta:
        meta['content'] = 'Explore Pradako customised fasteners in a clean card-only product gallery with direct links to complete specifications.'

    noscript = soup.find('noscript')
    if noscript:
        noscript.string = 'Please enable JavaScript to use the customised product gallery.'

    path.write_text(str(soup), encoding="utf-8")


def patch_customised_js() -> None:
    path = ROOT / 'js/customised-products.js'
    text = path.read_text(encoding='utf-8')

    text = text.replace("        var view = params.get('view');\n        if (['grid', 'details', 'matrix', 'chart'].indexOf(view) > -1) state.view = view;\n",
                        "        /* This page intentionally uses one card-only Grid view. */\n        state.view = 'grid';\n")
    text = text.replace("        if (state.view !== 'grid') params.set('view', state.view);\n", "")

    old_family_image = """        var image = (family.groups[0] && family.groups[0].products[0])
            ? family.groups[0].products[0].image : '';
"""
    new_family_image = """        var FAMILY_COVERS = {
            screws: 'images/product/MACHINE SCREW 1.png',
            bolts: 'images/product/hex_bolt.png',
            nuts: 'images/product/nut.png',
            washers: 'images/product/washer.png',
            'threaded-rods': 'images/product/threaded_rod.png',
            studs: 'images/product/stud.png',
            rivets: 'images/product/rivet.png',
            pins: 'images/product/pin.png',
            bushes: 'images/product/bush.png',
            plugs: 'images/product/plug.png',
            'stainless-steel': 'images/product/stainless-steel.png',
            'high-tensile': 'images/product/high-tensile.png'
        };
        var image = FAMILY_COVERS[family.slug] || ((family.groups[0] && family.groups[0].products[0])
            ? family.groups[0].products[0].image : '');
"""
    if old_family_image not in text:
        raise RuntimeError('family image block not found')
    text = text.replace(old_family_image, new_family_image, 1)

    marker = """    /* ======================================================================
       13. DETAILS VIEW  (observation 3)
       ====================================================================== */
"""
    compact = """    function renderGridProductCard(product) {
        var attrs = product.attributes || {};
        var media = product.image
            ? '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy" decoding="async">'
            : icon('clipboard');
        var chips = [];
        if (attrs.standards && attrs.standards.length) chips.push(attrs.standards[0]);
        if (attrs.grades && attrs.grades.length) chips.push(attrs.grades.slice(0, 2).join(' / '));
        if (attrs.sizeRange) chips.push(clean(String(attrs.sizeRange).split('|')[0]));

        return '<article class="pmew-grid-product-card" data-detail-id="' + escapeHtml(product.id) + '">' +
            '<div class="pmew-grid-product-media">' + media + '</div>' +
            '<div class="pmew-grid-product-body">' +
            '<span class="pmew-grid-product-meta">' + escapeHtml(product.family) + ' · ' + escapeHtml(product.category) + '</span>' +
            '<h3 class="pmew-grid-product-title">' + highlight(product.name, state.query) + provisionalBadge(product.provisional) + '</h3>' +
            (chips.length ? '<div class="pmew-grid-product-chips">' + chips.map(function (chip) { return '<span>' + escapeHtml(chip) + '</span>'; }).join('') + '</div>' : '') +
            '<div class="pmew-grid-product-actions">' +
            '<a class="pmew-card-spec-link" href="' + escapeHtml(product.url || product.familyUrl) + '">Full specification' + icon('arrow') + '</a>' +
            enquiryButton(product, true) +
            '</div></div></article>';
    }

""" + marker
    if marker not in text:
        raise RuntimeError('details marker not found')
    text = text.replace(marker, compact, 1)

    old_results = """                (pool.length
                    ? '<div class="pmew-details-grid">' + pool.slice(0, 60).map(renderDetailCard).join('') + '</div>'
                    : '<div class="pradako-custom-empty-result">No product matches the current filters.</div>') +
"""
    new_results = """                (pool.length
                    ? '<div class="pradako-products-grid pmew-compact-product-grid">' + pool.slice(0, 60).map(renderGridProductCard).join('') + '</div>'
                    : '<div class="pradako-custom-empty-result">No product matches the current filters.</div>') +
"""
    if old_results not in text:
        raise RuntimeError('grid result block not found')
    text = text.replace(old_results, new_results, 1)

    old_setview = """    function setView(view, immediate) {
        var run = function () {
            state.view = view;

            toggle(el.gridView, view !== 'grid');
            toggle(el.detailsView, view !== 'details');
            toggle(el.matrixView, view !== 'matrix');
            toggle(el.chartView, view !== 'chart');

            setActive(el.gridBtn, view === 'grid');
            setActive(el.detailsBtn, view === 'details');
            setActive(el.matrixBtn, view === 'matrix');
            setActive(el.chartBtn, view === 'chart');

            renderCurrent();
            writeUrlState();
        };

        if (immediate) run(); else transition(run);
    }
"""
    new_setview = """    function setView(view, immediate) {
        var run = function () {
            state.view = 'grid';
            toggle(el.gridView, false);
            renderCurrent();
            writeUrlState();
        };
        if (immediate) run(); else transition(run);
    }
"""
    if old_setview not in text:
        raise RuntimeError('setView block not found')
    text = text.replace(old_setview, new_setview, 1)

    old_current = """        if (state.view === 'grid') renderGrid();
        else if (state.view === 'details') renderDetails();
        else if (state.view === 'matrix') renderMatrix();
        else if (state.view === 'chart') renderChart();
        else renderGrid();
"""
    if old_current not in text:
        raise RuntimeError('renderCurrent block not found')
    text = text.replace(old_current, "        state.view = 'grid';\n        renderGrid();\n", 1)

    path.write_text(text, encoding='utf-8')


def patch_family_js() -> None:
    path = ROOT / 'js/pradako-family-page.js'
    text = path.read_text(encoding='utf-8')

    utility_marker = """    function icon(name) {
        if (window.PradakoEnquiryCart && window.PradakoEnquiryCart.icon) {
            return window.PradakoEnquiryCart.icon(name);
        }
        return '';
    }
"""
    addition = utility_marker + """

    var FAMILY_COVERS = {
        screws: 'images/product/MACHINE SCREW 1.png', bolts: 'images/product/hex_bolt.png',
        nuts: 'images/product/nut.png', washers: 'images/product/washer.png',
        'threaded-rods': 'images/product/threaded_rod.png', studs: 'images/product/stud.png',
        rivets: 'images/product/rivet.png', pins: 'images/product/pin.png',
        bushes: 'images/product/bush.png', plugs: 'images/product/plug.png',
        'stainless-steel': 'images/product/stainless-steel.png',
        'high-tensile': 'images/product/high-tensile.png'
    };

    function normalKey(value) {
        return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
    }

    function familyProducts() {
        if (!family) return [];
        var out = [];
        (family.groups || []).forEach(function (group) {
            (group.productItems || []).forEach(function (product) {
                product.__category = group.type;
                out.push(product);
            });
        });
        return out;
    }

    function productForName(name) {
        var key = normalKey(name);
        var products = familyProducts();
        for (var i = 0; i < products.length; i += 1) {
            if (normalKey(products[i].name) === key) return products[i];
        }
        return null;
    }
"""
    if utility_marker not in text:
        raise RuntimeError('family utility marker not found')
    text = text.replace(utility_marker, addition, 1)

    old_hero = """            section.innerHTML = '<div class="showcase-container">' +
                '<div class="showcase-hero"><div class="hero-copy">' +
                '<div class="hero-badge">Premium Fastening Solutions</div>' +
                '<h1 class="showcase-title">' + escapeHtml(family.name.toUpperCase()) + '</h1>' +
                '<p class="showcase-desc">' + escapeHtml(metaBlurb()) + '</p>' +
                '</div></div>' +
                '<div data-family-sections></div></div>';
"""
    new_hero = """            var cover = FAMILY_COVERS[family.slug] || '';
            section.innerHTML = '<div class="showcase-container">' +
                '<div class="showcase-hero pmew-generated-hero"><div class="hero-copy">' +
                '<div class="hero-badge">Premium Fastening Solutions</div>' +
                '<h1 class="showcase-title">' + escapeHtml(family.name.toUpperCase()) + '</h1>' +
                '<p class="showcase-desc">' + escapeHtml(metaBlurb()) + '</p>' +
                '</div>' + (cover ? '<div class="pmew-generated-hero-media"><img src="' + escapeHtml(cover) + '" alt="' + escapeHtml(family.name) + '"></div>' : '') + '</div>' +
                '<div data-family-sections></div></div>';
"""
    if old_hero not in text:
        raise RuntimeError('generated hero block not found')
    text = text.replace(old_hero, new_hero, 1)

    old_inject = """            var category = categoryTitleFor(card);
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
"""
    new_inject = """            var category = categoryTitleFor(card);
            var familyName = family ? family.name : '';
            var product = productForName(name);
            var id = product && product.id
                ? product.id
                : slugify((family ? family.slug : slugify(familyName)) + '-' + category + '-' + name);

            var actions = document.createElement('div');
            actions.className = 'pmew-family-card-actions';

            if (product && product.url) {
                var link = document.createElement('a');
                link.className = 'pmew-card-spec-link';
                link.href = product.url;
                link.innerHTML = 'Full specification ' + icon('arrow');
                actions.appendChild(link);
            }

            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'pmew-card-enquiry';
            button.setAttribute('data-enquiry-id', id);
            button.setAttribute('data-enquiry-name', name);
            button.setAttribute('data-enquiry-category', product && product.__category ? product.__category : category);
            button.setAttribute('data-enquiry-family', familyName);
            button.setAttribute('data-enquiry-family-url', family ? family.url : currentPageFile());
            button.setAttribute('data-enquiry-image', product && product.image ? product.image : imageFor(card));
            button.innerHTML = '<span data-enquiry-icon>' + icon('plus') + '</span>' +
                '<span data-enquiry-label>Add to Enquiry</span>';

            actions.appendChild(button);
            content.appendChild(actions);
"""
    if old_inject not in text:
        raise RuntimeError('family inject block not found')
    text = text.replace(old_inject, new_inject, 1)

    path.write_text(text, encoding='utf-8')


def patch_shell_css_extras() -> None:
    path = ROOT / 'css/pmew-site-shell.css'
    text = path.read_text(encoding='utf-8')
    extra = """

.pmew-gallery-intro {
  max-width: 760px;
  margin: 12px auto 0;
  color: #64798a;
  font-size: 13px;
  line-height: 1.7;
  text-align: center;
}
.pmew-compact-product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.pmew-generated-hero { display: grid !important; grid-template-columns: minmax(0,1fr) minmax(280px,.72fr); gap: 36px; align-items: center; }
.pmew-generated-hero-media { min-height: 300px; display: grid; place-items: center; padding: 18px; }
.pmew-generated-hero-media img { width: 100%; max-height: 330px; object-fit: contain; }
body.pmew-shell-menu-open { overflow: hidden; }
@media (max-width: 1100px) { .pmew-compact-product-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
@media (max-width: 780px) {
  .pmew-compact-product-grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .pmew-generated-hero { grid-template-columns: 1fr; }
  .pmew-generated-hero-media { min-height: 220px; }
}
@media (max-width: 520px) { .pmew-compact-product-grid { grid-template-columns: 1fr; } }
"""
    if '.pmew-gallery-intro' not in text:
        text += extra
    path.write_text(text, encoding='utf-8')


def patch_generator() -> None:
    path = ROOT / 'tools/build_product_pages.py'
    text = path.read_text(encoding='utf-8')

    text = text.replace('<link rel="stylesheet" href="../css/pradako-products-plus.css">',
                        '<link rel="stylesheet" href="../css/pradako-products-plus.css">\n<link rel="stylesheet" href="../css/pmew-site-shell.css">', 1)
    text = text.replace('<body class="pmew-product-page">\n\n<main class="pmew-pd-wrap">',
                        '<body class="pmew-product-page">\n<div id="navbar-container"></div>\n\n<main class="pmew-pd-wrap">', 1)
    text = text.replace('</main>\n\n<script defer src="../js/pradako-enquiry-cart.js"></script>',
                        '</main>\n<div id="footer-container"></div>\n\n<script defer src="../js/pradako-enquiry-cart.js"></script>', 1)
    text = text.replace('<script defer src="../js/pradako-compare.js"></script>\n</body>',
                        '<script defer src="../js/pradako-compare.js"></script>\n<script defer src="../js/pmew-site-shell.js"></script>\n</body>', 1)

    # Generated A-Z index also receives the shared shell.
    text = text.replace('"<link rel=\\"stylesheet\\" href=\\"../css/pradako-products-plus.css\\">",\n             "</head><body class=\\"pmew-product-page\\"><main class=\\"pmew-pd-wrap\\">",',
                        '"<link rel=\\"stylesheet\\" href=\\"../css/pradako-products-plus.css\\">",\n             "<link rel=\\"stylesheet\\" href=\\"../css/pmew-site-shell.css\\">",\n             "</head><body class=\\"pmew-product-page\\"><div id=\\"navbar-container\\"></div><main class=\\"pmew-pd-wrap\\">",', 1)
    text = text.replace('index.append("</div></main></body></html>")',
                        'index.append("</div></main><div id=\\"footer-container\\"></div><script defer src=\\"../js/pmew-site-shell.js\\"></script></body></html>")', 1)

    path.write_text(text, encoding='utf-8')


def ensure_placeholders() -> None:
    for path in ROOT.glob('*.html'):
        if path.name == 'index.html':
            continue
        text = path.read_text(encoding='utf-8', errors='ignore')
        if '<body' not in text:
            continue
        body_end = text.find('>', text.find('<body'))
        if 'navbar-container' not in text:
            text = text[:body_end+1] + '\n<div id="navbar-container"></div>' + text[body_end+1:]
        if 'footer-container' not in text:
            text = text.replace('</body>', '<div id="footer-container"></div>\n</body>', 1)
        path.write_text(text, encoding='utf-8')


def main() -> None:
    replace_screw_legacy_shell()
    simplify_customised_page()
    patch_customised_js()
    patch_family_js()
    patch_shell_css_extras()
    patch_generator()
    ensure_placeholders()

    # Root catalogue pages and all generated product pages receive the shell assets.
    for path in ROOT.glob('*.html'):
        add_shell_assets(path, nested=False)
    for path in (ROOT / 'products').glob('*.html'):
        add_shell_assets(path, nested=True)

    print('PMEW catalogue upgrade applied.')


if __name__ == '__main__':
    main()
