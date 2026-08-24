#!/usr/bin/env python3
"""
PRADAKO — FAMILY PAGE GENERATOR
===============================

WHY THIS EXISTS
---------------
The Screws family drifted to two different truths:

    screw.html (uploaded package)   56 products, hand-maintained
    screwSections (newer page)      65 products

Nobody did anything wrong. Two files described the same catalogue and were
edited at different times. The symptoms were visible in the markup: one card
carried alt="SEMS Screws" with the SEMS photograph but an <h3> reading "Trox
Screws", and a category header claimed "17 Products" above sixteen cards.

This script removes the possibility. The twelve family pages become GENERATED
output of tools/catalog.source.json, exactly like the gallery and the 286
detail pages. Add a product in one place and it appears in all three.

    python3 tools/build_family_pages.py --dry-run
    python3 tools/build_family_pages.py

WHAT IT TOUCHES
---------------
ONLY the .mega-category blocks — the product cards and their category headers.
Everything else in each page is left byte-for-byte alone: <head>, hero copy,
inline styles, navigation, footer, scripts. Hand-written page copy survives.

WHY STATIC CARDS RATHER THAN CLIENT-SIDE RENDERING
--------------------------------------------------
These pages are the SEO landing pages — somebody searching "hex bolt
manufacturer India" lands on bolt.html. Cards rendered by JavaScript are much
weaker for indexing, so the cards stay as real HTML in the file. Generated, but
static.
"""

import json
import os
import re
import subprocess
import sys

from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SOURCE = os.path.join(HERE, "catalog.source.json")
GENERATED = os.path.join(ROOT, "js", "customised-products-data.js")

# family slug -> page filename
PAGES = {
    "screws": "screw.html",
    "bolts": "bolt.html",
    "nuts": "nut.html",
    "washers": "washer.html",
    "threaded-rods": "threaded-rod.html",
    "studs": "stud.html",
    "rivets": "rivet.html",
    "pins": "pin.html",
    "bushes": "bush.html",
    "plugs": "plug.html",
    "stainless-steel": "stainless-steel.html",
    "high-tensile": "high-tensile.html",
}


def esc(value):
    return (str(value or "")
            .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def grid_class(html):
    """
    Each family page defines its own grid classes in its inline stylesheet.
    screw.html goes up to .grid-5; nut.html, washer.html and the rest stop at
    .grid-4. Hard-coding grid-5 everywhere left the other pages with an
    undefined class, so cards stacked one per row and page height doubled.

    Use the widest grid the page actually defines.
    """
    # Selectors are often grouped, e.g. ".grid-5, .grid-6, .special-grid {",
    # so match the class wherever it appears in a selector list rather than
    # only immediately before the brace.
    defined = set()
    for selectors in re.findall(r"([^{}]+)\{", html):
        if "@" in selectors:
            continue
        for n in re.findall(r"\.grid-(\d)\b", selectors):
            defined.add(int(n))
    # Cap at 5. screw.html also defines .grid-6, but six product cards per row
    # is too tight to read a fastener photograph, and the hand-built page used
    # grid-5. Five across is the ceiling.
    return "grid-%d" % (min(max(defined), 5) if defined else 4)


def category_block(group, alt_bg, grid):
    """One .mega-category section: header, count, and a grid of product cards."""
    items = group["productItems"]

    cards = []
    for product in items:
        image = product.get("image", "")
        name = product["name"]
        href = product.get("url") or ""

        # THE PRODUCT NAME IS A LINK.
        #
        # The 286 generated detail pages were previously reachable only through
        # a JavaScript view behind query strings, so Googlebot had no path to a
        # single one of them. Making the name a real <a> here gives the crawl a
        # complete chain:
        #
        #     customised-products.html -> screw.html -> products/<id>.html
        #
        # data-* attributes let the runtime enhancer reconcile a card to its
        # catalogue entry without re-parsing the visible text.
        title = ('<a href="%s">%s</a>' % (esc(href), esc(name))) if href else esc(name)

        cards.append(
            '<div class="product-card" data-product-name="%s">\n'
            '<img alt="%s" class="card-img" loading="lazy" src="%s"/>\n'
            '<div class="card-content">\n<h3>%s</h3>\n</div>\n</div>'
            % (esc(name), esc(name), esc(image), title)
        )

    return (
        '<div class="mega-category%s">\n'
        '<div class="category-header">\n<div>\n'
        '<h2 class="category-title">%s</h2>\n'
        '<div class="category-line"></div>\n</div>\n'
        '<div class="category-count">%d Product%s</div>\n</div>\n'
        '<div class="%s">\n%s\n</div>\n</div>'
        % (" alt-bg" if alt_bg else "",
           esc(group["type"]),
           len(items),
           "" if len(items) == 1 else "s",
           grid,
           "\n".join(cards))
    )


def rebuild(path, family, dry):
    with open(path, encoding="utf-8") as fh:
        html = fh.read()

    soup = BeautifulSoup(html, "html.parser")
    blocks = soup.select(".mega-category")

    if not blocks:
        # These pages build their cards at runtime, so the HTML a crawler sees
        # contains zero product links. Rendering the same list statically as a
        # plain <ul> gives the crawl a route to every detail page without
        # touching the visual design — the block is visually subdued and sits
        # below the fold as an index, the way a site map section would.
        target = soup.select_one("[data-family-sections]") or soup.select_one("main") or soup.body
        if target is None:
            return ("skipped", 0, 0, "no insertion point")

        existing = soup.select_one(".pmew-crawl-index")
        if existing:
            existing.decompose()

        items = []
        for group in family["groups"]:
            links = "".join(
                '<li><a href="%s">%s</a></li>' % (esc(p.get("url", "")), esc(p["name"]))
                for p in group["productItems"] if p.get("url")
            )
            items.append('<div class="pmew-crawl-group"><h3>%s</h3><ul>%s</ul></div>'
                         % (esc(group["type"]), links))

        count = sum(len(g["productItems"]) for g in family["groups"])

        nav = BeautifulSoup(
            '<nav class="pmew-crawl-index" aria-label="All %s products">'
            '<h2>All %s products</h2>'
            '<p>Every product below has its own specification page.</p>'
            '%s</nav>' % (esc(family["name"]), esc(family["name"]), "".join(items)),
            "html.parser")

        target.insert_after(nav)

        if not dry:
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(str(soup))

        return ("indexed", 0, count, "static crawl index added")

    before = len(soup.select(".card-content"))

    grid = grid_class(html)

    new_markup = "\n".join(
        category_block(group, index % 2 == 1, grid)
        for index, group in enumerate(family["groups"])
    )
    new_nodes = BeautifulSoup(new_markup, "html.parser")

    # Replace the first block with the whole regenerated set, drop the rest.
    first = blocks[0]
    for extra in blocks[1:]:
        extra.decompose()
    first.replace_with(new_nodes)

    after = sum(len(g["productItems"]) for g in family["groups"])

    if not dry:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(str(soup))

    return ("rebuilt", before, after, grid)


def main():
    dry = "--dry-run" in sys.argv

    # Read the GENERATED catalogue, not the source, because that is where the
    # per-product ids and detail-page urls live.
    script = ("global.window={};require(%s);"
              "process.stdout.write(JSON.stringify(window.PMEW_CUSTOM_PRODUCT_CATALOG));"
              % json.dumps(GENERATED))
    catalog = {f["slug"]: f for f in
               json.loads(subprocess.check_output(["node", "-e", script]))}

    print("%-18s %8s %8s %7s  %s" % ("PAGE", "BEFORE", "AFTER", "DELTA", "NOTE"))

    for slug, filename in PAGES.items():
        path = os.path.join(ROOT, filename)
        if not os.path.exists(path):
            print("%-18s %8s %8s %7s  file not found" % (filename, "-", "-", "-"))
            continue

        family = catalog.get(slug)
        if not family:
            print("%-18s %8s %8s %7s  not in catalogue" % (filename, "-", "-", "-"))
            continue

        status, before, after, note = rebuild(path, family, dry)

        if status in ("skipped", "indexed"):
            print("%-18s %8s %8s %7s  %s"
                  % (filename, "-", after if status == "indexed" else "-", "-", note))
        else:
            print("%-18s %8d %8d %+7d  %s"
                  % (filename, before, after, after - before, note))

    if dry:
        print("\n(dry run — nothing written)")


if __name__ == "__main__":
    main()
