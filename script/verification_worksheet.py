#!/usr/bin/env python3
"""
PRADAKO — VERIFICATION WORKSHEET
================================

THE PROBLEM THIS SOLVES
-----------------------
All 286 products currently report source "derived" — the attributes were
compiled by rule from published DIN / ISO / ASTM / EN / IS / JIS standards, not
from Pradako's works data. Those values describe what the STANDARD permits, not
what your plants will quote.

Asking the works team to hand-edit tools/overrides.json is unrealistic. They
work in Excel. So:

    python3 tools/verification_worksheet.py --export
        writes tools/verification-worksheet.csv — open it in Excel, fill the
        columns, save as CSV.

    python3 tools/verification_worksheet.py --import
        reads it back and writes tools/overrides.json.

    python3 tools/build_catalog.py
        every filled row flips from "derived" to "verified".

Nothing else changes. The site code never needs touching.

HOW THE SHEET WORKS
-------------------
Each row is one product. The derived values are pre-filled in the "current_*"
columns so the works team is CORRECTING rather than authoring from a blank
sheet — far faster and far less error-prone.

They fill only the "verified_*" columns. A blank verified column means "the
derived value is fine, leave it"; a filled one overrides it. Multiple values go
in one cell separated by semicolons:

    verified_grades      8.8; 10.9; 12.9
    verified_size_range  M5 - M42
    verified_finishes    Zinc flake 720 h; Trivalent zinc

    >>> PRIORITISE. Do not attempt all 286 at once.
    >>> --export --top 40  writes only the highest-value lines: the products
    >>> most likely to be searched and filtered on.
    >>> Size range and grade matter most — those are what buyers filter by.
"""

import csv
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SHEET = os.path.join(HERE, "verification-worksheet.csv")
OVERRIDES = os.path.join(HERE, "overrides.json")

# The attributes worth a works signature, in the order a buyer cares about.
FIELDS = [
    ("size_range", "sizeRange", False),
    ("grades", "grades", True),
    ("materials", "materials", True),
    ("finishes", "finishes", True),
    ("standards", "standards", True),
    ("drive", "drive", False),
    ("head", "head", False),
    ("thread_type", "threadType", False),
]

# Families whose products a buyer is most likely to search for first.
PRIORITY_FAMILIES = ["bolts", "screws", "nuts", "washers", "high-tensile"]


def load_catalog():
    data_path = os.path.join(ROOT, "js", "customised-products-data.js")
    script = ("global.window={};require(%s);"
              "process.stdout.write(JSON.stringify(window.PMEW_CUSTOM_PRODUCT_CATALOG));"
              % json.dumps(data_path))
    return json.loads(subprocess.check_output(["node", "-e", script]))


def flatten(catalog):
    rows = []
    for family in catalog:
        for group in family["groups"]:
            for product in group["productItems"]:
                rows.append((family, group, product))
    return rows


def joined(value):
    if isinstance(value, list):
        return "; ".join(str(v) for v in value if v)
    return str(value or "")


def export(top):
    catalog = load_catalog()
    rows = flatten(catalog)

    if top:
        # Priority families first, then the rest, so a truncated sheet still
        # covers the products most likely to be searched.
        order = {slug: i for i, slug in enumerate(PRIORITY_FAMILIES)}
        rows.sort(key=lambda r: (order.get(r[0]["slug"], 99), r[0]["slug"], r[2]["name"]))
        rows = rows[:top]

    header = (["product_id", "family", "category", "product_name"]
              + ["current_" + name for name, _, _ in FIELDS]
              + ["verified_" + name for name, _, _ in FIELDS])

    with open(SHEET, "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.writer(fh)
        writer.writerow(header)

        for family, group, product in rows:
            attrs = product.get("attributes", {})
            writer.writerow(
                [product["id"], family["name"], group["type"], product["name"]]
                + [joined(attrs.get(key)) for _, key, _ in FIELDS]
                + [""] * len(FIELDS)
            )

    print("Wrote %s" % SHEET)
    print("%d products%s" % (len(rows), " (priority subset)" if top else ""))
    print()
    print("Open in Excel. Fill ONLY the verified_* columns.")
    print("Leave a cell blank to keep the derived value.")
    print("Separate multiple values with a semicolon.")
    print()
    print("Then:  python3 tools/verification_worksheet.py --import")


def do_import():
    if not os.path.exists(SHEET):
        print("No worksheet found at %s" % SHEET)
        print("Run --export first.")
        return

    overrides = {}
    if os.path.exists(OVERRIDES):
        with open(OVERRIDES, encoding="utf-8") as fh:
            overrides = json.load(fh)

    filled = 0
    cells = 0
    skipped_unchanged = 0

    with open(SHEET, encoding="utf-8-sig") as fh:
        for row in csv.DictReader(fh):
            pid = (row.get("product_id") or "").strip()
            if not pid:
                continue

            entry = {}
            for name, key, is_list in FIELDS:
                raw = (row.get("verified_" + name) or "").strip()
                if not raw:
                    continue

                # If they pasted the derived value back unchanged, that is
                # still a signature — it means "checked, correct".
                if raw == (row.get("current_" + name) or "").strip():
                    skipped_unchanged += 1

                entry[key] = ([v.strip() for v in raw.split(";") if v.strip()]
                              if is_list else raw)
                cells += 1

            if entry:
                overrides[pid] = entry
                filled += 1

    with open(OVERRIDES, "w", encoding="utf-8") as fh:
        json.dump(overrides, fh, indent=1, ensure_ascii=False, sort_keys=True)

    print("Wrote %s" % OVERRIDES)
    print("%d products verified, %d attribute values" % (filled, cells))
    if skipped_unchanged:
        print("(%d values match the derived figure — recorded as confirmed)"
              % skipped_unchanged)
    print()
    print("Now run:  python3 tools/build_catalog.py")
    print("          python3 tools/build_product_pages.py")


def main():
    if "--export" in sys.argv:
        top = None
        if "--top" in sys.argv:
            top = int(sys.argv[sys.argv.index("--top") + 1])
        export(top)
    elif "--import" in sys.argv:
        do_import()
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
