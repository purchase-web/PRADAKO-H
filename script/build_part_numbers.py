#!/usr/bin/env python3
"""
PRADAKO — PART NUMBER ASSIGNMENT
================================

    PRA-SCR-A-001        Machine Screws
    PRA-BLT-D-003        Wheel Bolts
    PRA-HTN-109-004      10.9 12-Point Bolts

    PRA-SCR-000          the Screws SERIES  (family level, 3 segments)
    PRA-SCR-A-001        Machine Screws     (product level, 4 segments)

    Sequence 000 is RESERVED and never issued to a product, so a family-level
    code can never collide with a part. Fewer segments meaning broader scope is
    how part numbering normally reads, and it gives the family card a code that
    is complete in itself rather than a truncated prefix.

    PRA     house prefix
    SCR     family, three letters
    A       category letter, in catalogue order
            (High Tensile uses the property class instead: 088 109 129 149 STR,
             because class IS the organising axis there and the code then tells
             an engineer something before they look it up)
    001     sequence within that category

    python3 tools/build_part_numbers.py            # assign, then export
    python3 tools/build_part_numbers.py --report   # show what would change
    python3 tools/build_part_numbers.py --export   # rewrite the ERP CSV only


THE LOCKFILE IS THE WHOLE POINT
-------------------------------
A part number is the longest-lived artifact this project will produce. It gets
stamped on drawings, embedded in customer PPAP packs, printed on packaging
labels, keyed into the customer's own ERP, and quoted back years later by
somebody who has never seen the website.

So numbers must NEVER move. tools/assigned_numbers.json is a permanent ledger:

    - once a product has a number, that number is read from the ledger and
      reused, whatever happens to catalogue ordering afterwards
    - a new product takes the next free sequence in its category
    - a WITHDRAWN product keeps its entry, flagged retired. Its number is never
      reissued and the gap is never backfilled

    >>> assigned_numbers.json IS AS IMPORTANT AS THE CATALOGUE ITSELF.
    >>> Keep it in version control. Losing it means renumbering parts that are
    >>> already printed on customer drawings.

Re-running this script on an unchanged catalogue changes nothing. That property
is what makes it safe to run in a build pipeline.


OUTPUT
------
    tools/assigned_numbers.json    the permanent ledger
    tools/catalog.source.json      each product gains "partNo"
    PRADAKO-PART-NUMBERS.csv       flat list for the ERP import
"""

import csv
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SOURCE = os.path.join(HERE, "catalog.source.json")
LEDGER = os.path.join(HERE, "assigned_numbers.json")
CSV_OUT = os.path.join(ROOT, "PRADAKO-PART-NUMBERS.csv")

PREFIX = "PRA"

FAMILY_CODE = {
    "screws": "SCR",
    "bolts": "BLT",
    "nuts": "NUT",
    "washers": "WSH",
    "threaded-rods": "ROD",
    "studs": "STD",
    "rivets": "RIV",
    "pins": "PIN",
    "bushes": "BSH",
    "plugs": "PLG",
    "stainless-steel": "SST",
    "high-tensile": "HTN",
}

# High Tensile is organised by property class, so the class is the segment.
CLASS_CODE = {
    "8.8": "088",
    "10.9": "109",
    "12.9": "129",
    "14.9": "149",
    "Structural": "STR",
}


def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def product_key(family_slug, group_type, name):
    """
    A STABLE identity for a product, independent of its position.

    Deliberately NOT the display name alone: two families could both hold a
    product called "Hex Bolts". Deliberately NOT the array index either, since
    reordering the catalogue would then reshuffle live part numbers.
    """
    return "%s|%s|%s" % (family_slug, slugify(group_type), slugify(name))


def segment_for(family, group, index):
    if family["slug"] == "high-tensile":
        raw = (group.get("propertyClass") or group["type"]).replace("Property Class ", "")
        raw = raw.split(" (")[0].strip()
        return CLASS_CODE.get(raw, "X%02d" % (index + 1))
    return chr(65 + index)


def load_ledger():
    if os.path.exists(LEDGER):
        with open(LEDGER, encoding="utf-8") as fh:
            return json.load(fh)
    return {"issued": {}, "retired": {}}


def main():
    report_only = "--report" in sys.argv
    export_only = "--export" in sys.argv

    with open(SOURCE, encoding="utf-8") as fh:
        catalog = json.load(fh)

    ledger = load_ledger()
    issued = ledger.get("issued", {})
    retired = ledger.get("retired", {})

    # highest sequence already used per PRA-FAM-SEG group, including retired
    highest = {}
    for number in list(issued.values()) + list(retired.values()):
        head, _, tail = number.rpartition("-")
        try:
            highest[head] = max(highest.get(head, 0), int(tail))
        except ValueError:
            continue

    series_rows = []
    rows = []
    fresh = 0
    reused = 0
    seen_keys = set()

    for family in catalog:
        fam_code = FAMILY_CODE.get(family["slug"])
        if not fam_code:
            print("  !! no family code for %s — skipped" % family["slug"])
            continue

        # family-level series code; 000 is reserved, never issued to a product
        series = "%s-%s-000" % (PREFIX, fam_code)
        family["seriesNo"] = series
        series_rows.append({
            "part_number": series,
            "product_name": family["name"] + " (series)",
            "family": family["name"],
            "category": "",
            "family_code": fam_code,
            "category_code": "",
            "status": "series",
            "catalogue_key": "series|" + family["slug"],
        })

        for index, group in enumerate(family["groups"]):
            segment = segment_for(family, group, index)
            head = "%s-%s-%s" % (PREFIX, fam_code, segment)

            for product in group["productItems"]:
                key = product_key(family["slug"], group["type"], product["name"])
                seen_keys.add(key)

                if key in issued:
                    number = issued[key]
                    reused += 1
                else:
                    nxt = highest.get(head, 0) + 1
                    highest[head] = nxt
                    number = "%s-%03d" % (head, nxt)
                    issued[key] = number
                    fresh += 1

                product["partNo"] = number

                rows.append({
                    "part_number": number,
                    "product_name": product["name"],
                    "family": family["name"],
                    "category": group["type"],
                    "family_code": fam_code,
                    "category_code": segment,
                    "status": "active",
                    "catalogue_key": key,
                })

    # products that vanished from the catalogue retire; their numbers are
    # never reissued and the sequence gap is never backfilled
    newly_retired = 0
    for key, number in list(issued.items()):
        if key not in seen_keys:
            retired[key] = number
            del issued[key]
            newly_retired += 1
            rows.append({
                "part_number": number,
                "product_name": key.split("|")[-1].replace("-", " ").title(),
                "family": key.split("|")[0],
                "category": key.split("|")[1].replace("-", " ").title(),
                "family_code": "",
                "category_code": "",
                "status": "retired",
                "catalogue_key": key,
            })

    print("PART NUMBER ASSIGNMENT")
    print("  reused from ledger : %d" % reused)
    print("  newly issued       : %d" % fresh)
    print("  newly retired      : %d" % newly_retired)
    print("  total active       : %d" % len(issued))
    print("  series codes       : %d  (family level, reserved 000)" % len(series_rows))

    if report_only:
        print("\n(report only — nothing written)")
        return

    if not export_only:
        with open(LEDGER, "w", encoding="utf-8") as fh:
            json.dump({"issued": issued, "retired": retired}, fh,
                      indent=1, ensure_ascii=False, sort_keys=True)
        with open(SOURCE, "w", encoding="utf-8") as fh:
            json.dump(catalog, fh, indent=1, ensure_ascii=False)

    rows = series_rows + rows
    rows.sort(key=lambda r: r["part_number"])

    with open(CSV_OUT, "w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=[
            "part_number", "product_name", "family", "category",
            "family_code", "category_code", "status", "catalogue_key"])
        writer.writeheader()
        writer.writerows(rows)

    print("\nWrote %s  (%d rows)" % (LEDGER, len(issued)))
    print("Wrote %s" % SOURCE)
    print("Wrote %s" % CSV_OUT)


if __name__ == "__main__":
    main()
