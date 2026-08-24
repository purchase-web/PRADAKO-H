#!/usr/bin/env python3
"""
PRADAKO — SITEMAP GENERATOR
===========================

WHY THIS EXISTS
---------------
An audit of the crawl path found this:

    crawlable links to the 286 product pages   0
    products/index.html linked from anywhere   no
    sitemap.xml                                did not exist

So 286 generated product pages — the entire argument for ranking on
"DIN 933 hex bolt manufacturer India" — were orphans. Google had no route to
any of them.

Three fixes were needed and this is the third:

    1. family cards on customised-products.html are <a> again, not buttons
    2. every family page links each product to its detail page
    3. sitemap.xml, generated here, so it can never drift from the catalogue

    python3 tools/build_sitemap.py

Writes sitemap.xml and robots.txt at the package root.

PRIORITIES
----------
Deliberate rather than decorative. Search engines mostly ignore <priority>,
but it documents intent for whoever maintains this next:

    1.0   customised-products.html   the hub
    0.9   the 12 family pages        the terms buyers actually search
    0.7   the 286 product pages      the long tail
    0.5   the A-Z index              a crawl aid, not a destination

    >>> UPDATE THE DOMAIN BELOW before deploying if pradako.co is not final.
"""

import json
import os
import subprocess
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SITE = "https://www.pradako.co"
TODAY = date.today().isoformat()

FAMILY_PAGES = ["screw.html", "bolt.html", "nut.html", "washer.html",
                "threaded-rod.html", "stud.html", "rivet.html", "pin.html",
                "bush.html", "plug.html", "stainless-steel.html",
                "high-tensile.html"]


def load_catalog():
    data_path = os.path.join(ROOT, "js", "customised-products-data.js")
    script = ("global.window={};require(%s);"
              "process.stdout.write(JSON.stringify(window.PMEW_CUSTOM_PRODUCT_CATALOG));"
              % json.dumps(data_path))
    return json.loads(subprocess.check_output(["node", "-e", script]))


def url(loc, priority, changefreq="monthly"):
    return ("  <url>\n"
            "    <loc>%s/%s</loc>\n"
            "    <lastmod>%s</lastmod>\n"
            "    <changefreq>%s</changefreq>\n"
            "    <priority>%s</priority>\n"
            "  </url>\n" % (SITE, loc, TODAY, changefreq, priority))


def main():
    catalog = load_catalog()

    out = ['<?xml version="1.0" encoding="UTF-8"?>\n',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n']

    out.append(url("customised-products.html", "1.0", "weekly"))

    families = 0
    for page in FAMILY_PAGES:
        if os.path.exists(os.path.join(ROOT, page)):
            out.append(url(page, "0.9"))
            families += 1

    out.append(url("products/index.html", "0.5"))

    products = 0
    for family in catalog:
        for group in family["groups"]:
            for product in group["productItems"]:
                out.append(url(product["url"], "0.7"))
                products += 1

    out.append("</urlset>\n")

    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as fh:
        fh.write("".join(out))

    robots = ("User-agent: *\n"
              "Allow: /\n\n"
              "# Faceted views are the same products under query strings.\n"
              "# Let the canonical pages carry the ranking instead.\n"
              "Disallow: /*?view=\n"
              "Disallow: /*?f_\n\n"
              "Sitemap: %s/sitemap.xml\n" % SITE)

    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as fh:
        fh.write(robots)

    total = 1 + families + 1 + products
    print("Wrote sitemap.xml and robots.txt")
    print("  hub page      1")
    print("  family pages  %d" % families)
    print("  A-Z index     1")
    print("  product pages %d" % products)
    print("  TOTAL         %d urls" % total)


if __name__ == "__main__":
    main()
