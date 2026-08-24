#!/usr/bin/env python3
"""
PRADAKO — MERGE THE 65-PRODUCT SCREWS SOURCE
============================================

WHY THIS EXISTS
---------------
Two files both claimed to be the truth for the Screws family:

    screw.html  in the uploaded package        56 products
    screwSections  in the newer screw page     65 products

That is how the count drifted. This script folds the 65-product version into
tools/catalog.source.json so there is ONE source again, then the normal build
pipeline regenerates everything downstream.

    python3 tools/merge_screws_65.py --dry-run    # report only
    python3 tools/merge_screws_65.py              # write

Input : tools/screwSections.json   (extracted from the 65-product screw page)
Output: tools/catalog.source.json  (screws family replaced)

Then run, as usual:
    python3 tools/build_catalog.py
    python3 tools/build_product_pages.py

IMAGE RESOLUTION
----------------
The 65-product file writes paths in the original upper-case, space-separated
form ("images/WATERMARKED  Images/CUSTOMISED FASTENERS/..."), while the package
normalised everything to lower-case hyphens. Paths are slugified to match, then
resolved in this order:

    1. the 65-file's own path, if that file exists on disk
    2. the image the package already had for a product of the same name
    3. an inline SVG placeholder (no new binary files are added)

Nothing in images/ is created, moved or renamed. The tree stays byte-identical.
"""

import json
import os
import re
import sys
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SOURCE = os.path.join(HERE, "catalog.source.json")
INCOMING = os.path.join(HERE, "screwSections.json")

# The 65-product file's section titles, mapped to the group names the rest of
# the site already uses. Keeping the existing names means product IDs, and
# therefore the generated detail-page URLs, stay stable for the 56 that already
# existed — no dead links, no lost SEO.
GROUP_NAMES = {
    "Type 1 - Universal Screws": "Universal Screws",
    "Type 2 - Based on Application": "Based on Application",
    "Special Types": "Special Screws",
    "Based on Threading Types / Head Types": "Thread / Head Types",
}


def norm(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def slug_path(path):
    """Normalise an upper-case, space-separated image path to the package's
    lower-case hyphenated convention."""
    if not path:
        return None

    out = []
    for segment in path.split("/"):
        base, dot, ext = segment.rpartition(".")
        if dot:
            stem = re.sub(r"\s+", "-", base.strip().lower())
            stem = re.sub(r"[^a-z0-9.-]", "-", stem)
            out.append(re.sub(r"-+", "-", stem).strip("-") + "." + ext.lower())
        else:
            seg = re.sub(r"\s+", "-", segment.strip().lower())
            seg = re.sub(r"[^a-z0-9-]", "-", seg)
            out.append(re.sub(r"-+", "-", seg).strip("-"))
    return "/".join(out)


def placeholder(name):
    """Inline SVG so a product with no photograph still renders cleanly and no
    binary file has to be invented."""
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">'
        '<rect width="600" height="400" fill="#eef2f6"/>'
        '<circle cx="300" cy="158" r="46" fill="none" stroke="#cbd6e2" stroke-width="5"/>'
        '<path d="M276 158h48M300 134v48" stroke="#0A3D62" stroke-width="7" stroke-linecap="round"/>'
        '<g fill="#0A3D62" text-anchor="middle" font-family="Montserrat,Arial,sans-serif">'
        '<text x="300" y="252" font-size="21" font-weight="700">'
        + name.replace("&", "&amp;") +
        '</text><text x="300" y="286" font-size="14" fill="#607487">'
        'Photograph on request</text></g></svg>'
    )
    return "data:image/svg+xml;charset=UTF-8," + quote(svg, safe="")


def main():
    dry = "--dry-run" in sys.argv

    with open(SOURCE, encoding="utf-8") as fh:
        catalog = json.load(fh)
    with open(INCOMING, encoding="utf-8") as fh:
        incoming = json.load(fh)

    screws = [f for f in catalog if f["slug"] == "screws"][0]

    # what the package already holds, so we can inherit its images
    prior = {}
    for group in screws["groups"]:
        for item in group["productItems"]:
            prior[norm(item["name"])] = item.get("image", "")

    before = sum(len(g["productItems"]) for g in screws["groups"])

    stats = {"own": 0, "inherited": 0, "placeholder": 0}
    added, kept = [], []
    groups = []

    for section in incoming:
        title = section["title"]
        name = GROUP_NAMES.get(title, title)
        items = []

        for product in section["products"]:
            pname = product["name"]
            key = norm(pname)

            candidate = slug_path(product.get("image"))

            if candidate and os.path.exists(os.path.join(ROOT, candidate)):
                image = candidate
                stats["own"] += 1
            elif prior.get(key):
                image = prior[key]
                stats["inherited"] += 1
            else:
                image = placeholder(pname)
                stats["placeholder"] += 1

            items.append({"name": pname, "image": image, "provisional": False})
            (kept if key in prior else added).append(pname)

        groups.append({
            "type": name,
            "provisional": False,
            "propertyClass": None,
            "productItems": items,
        })

    after = sum(len(g["productItems"]) for g in groups)

    print("SCREWS FAMILY MERGE")
    print("  before : %d products" % before)
    print("  after  : %d products  (%+d)" % (after, after - before))
    print()
    print("  groups:")
    for group in groups:
        print("    %-26s %d" % (group["type"], len(group["productItems"])))
    print()
    print("  images:")
    print("    from the 65-file          %d" % stats["own"])
    print("    inherited from package    %d" % stats["inherited"])
    print("    inline SVG placeholder    %d" % stats["placeholder"])
    print()
    print("  NEW products (%d):" % len(added))
    for a in added:
        print("    +", a)

    dropped = [n for k, n in
               [(norm(i["name"]), i["name"])
                for g in screws["groups"] for i in g["productItems"]]
               if k not in {norm(x) for gg in groups for x in
                            [i["name"] for i in gg["productItems"]]}]
    if dropped:
        print("\n  REPLACED / RENAMED (%d):" % len(dropped))
        for d in dropped:
            print("    -", d)

    if dry:
        print("\n(dry run — nothing written)")
        return

    screws["groups"] = groups
    with open(SOURCE, "w", encoding="utf-8") as fh:
        json.dump(catalog, fh, indent=1, ensure_ascii=False)

    print("\nWrote %s" % SOURCE)
    print("Now run:  python3 tools/build_catalog.py && python3 tools/build_product_pages.py")


if __name__ == "__main__":
    main()
