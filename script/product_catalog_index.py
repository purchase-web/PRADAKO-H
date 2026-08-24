#!/usr/bin/env python3
"""Shared product metadata index helpers for PMEW individual-product generation.

The index decouples related-product enrichment from the render directory. A PDP can
therefore be rendered in isolation and still receive the correct image, Pradako part
number, category, family and name for every related-product link.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

INDEX_VERSION = 1


def _text(node, default: str = "") -> str:
    return node.get_text(" ", strip=True) if node else default


def _old_page_metadata(path: Path, soup: BeautifulSoup) -> dict[str, str] | None:
    hero = soup.select_one(".pmew-pd-hero")
    if not hero:
        return None

    name = _text(hero.select_one(".pmew-pd-title"))
    part_no = _text(hero.select_one(".pmew-pd-partno"))
    image_node = hero.select_one(".pmew-pd-media img")
    image = image_node.get("src", "") if image_node else ""
    enquiry = hero.select_one("[data-enquiry-id]")
    product_id = enquiry.get("data-enquiry-id", path.stem) if enquiry else path.stem
    family = enquiry.get("data-enquiry-family", "") if enquiry else ""
    category = enquiry.get("data-enquiry-category", "") if enquiry else ""

    if not name:
        return None

    return {
        "id": product_id,
        "filename": path.name,
        "name": name,
        "partNo": part_no,
        "family": family,
        "category": category,
        "image": image,
    }


def _generated_page_metadata(path: Path, soup: BeautifulSoup) -> dict[str, str] | None:
    """Fallback parser for already-generated PMEW commerce PDPs.

    The source catalogue remains the preferred index source. This parser makes the
    index builder resilient if it is pointed at a generated products directory.
    """
    h1 = soup.select_one("#pmewProductTitle")
    if not h1:
        return None

    name = _text(h1)
    part_node = soup.select_one("[data-copy-partno]")
    part_no = part_node.get("data-copy-partno", "") if part_node else ""
    image_node = soup.select_one(".pmew-ip-image-stage img")
    image = image_node.get("src", "") if image_node else ""

    family = ""
    category = ""
    taxonomy = soup.select_one(".pmew-ip-taxonomy")
    if taxonomy:
        bits = [_text(x) for x in taxonomy.find_all(["a", "span"], recursive=False)]
        bits = [x for x in bits if x and x != "›"]
        if bits:
            family = bits[0]
        if len(bits) > 1:
            category = bits[1]

    product_id = path.stem
    data_script = soup.find("script", attrs={"id": "pmew-product-data"})
    if data_script and data_script.string:
        try:
            parsed = json.loads(data_script.string)
            product_id = str(parsed.get("id") or product_id)
            family = str(parsed.get("family") or family)
            category = str(parsed.get("category") or category)
        except Exception:
            pass

    if not name:
        return None

    return {
        "id": product_id,
        "filename": path.name,
        "name": name,
        "partNo": part_no,
        "family": family,
        "category": category,
        "image": image,
    }


def extract_product_metadata(path: Path) -> dict[str, str] | None:
    try:
        html = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
    soup = BeautifulSoup(html, "html.parser")
    return _old_page_metadata(path, soup) or _generated_page_metadata(path, soup)


def build_catalog_index(products_dir: Path) -> dict[str, Any]:
    products_dir = products_dir.resolve()
    products: dict[str, dict[str, str]] = {}
    by_id: dict[str, str] = {}

    for path in sorted(products_dir.glob("*.html")):
        meta = extract_product_metadata(path)
        if not meta:
            continue
        products[path.name] = meta
        product_id = meta.get("id", "")
        if product_id:
            by_id[product_id] = path.name

    # Some legacy alias PDPs intentionally omit their own visible Pradako number even
    # though they represent the same photographed product as a canonical PDP. Related
    # cards benefit from showing the canonical number, so infer it only when the match
    # is unambiguous. This does NOT alter the source PDP itself.
    populated = [v for v in products.values() if v.get("partNo") and v.get("image")]
    for meta in products.values():
        if meta.get("partNo") or not meta.get("image"):
            continue
        candidates = [v for v in populated if v.get("image") == meta.get("image")]
        chosen = None
        same_name = [v for v in candidates if v.get("name", "").casefold() == meta.get("name", "").casefold()]
        if len(same_name) == 1:
            chosen = same_name[0]
        if chosen is None:
            same_category = [v for v in candidates if v.get("category") and v.get("category") == meta.get("category")]
            if len(same_category) == 1:
                chosen = same_category[0]
        if chosen is None and len(candidates) == 1:
            chosen = candidates[0]
        if chosen is not None:
            meta["partNo"] = chosen.get("partNo", "")
            meta["partNoInheritedFrom"] = chosen.get("filename", "")

    return {
        "version": INDEX_VERSION,
        "source": "PMEW products metadata",
        "count": len(products),
        "products": products,
        "byId": by_id,
    }


def save_catalog_index(index: dict[str, Any], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_catalog_index(path: Path | None) -> dict[str, Any]:
    if not path or not path.is_file():
        return {"version": INDEX_VERSION, "count": 0, "products": {}, "byId": {}}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"version": INDEX_VERSION, "count": 0, "products": {}, "byId": {}}
    if not isinstance(raw, dict) or not isinstance(raw.get("products"), dict):
        return {"version": INDEX_VERSION, "count": 0, "products": {}, "byId": {}}
    return raw


def lookup_related(index: dict[str, Any], href: str) -> dict[str, str] | None:
    """Resolve a related href to indexed product metadata.

    Related product links are sibling HTML URLs. Query strings and fragments are
    intentionally ignored because they do not identify a different product.
    """
    clean_href = (href or "").split("#", 1)[0].split("?", 1)[0]
    if not clean_href.lower().endswith(".html"):
        return None
    filename = Path(clean_href).name
    value = (index.get("products") or {}).get(filename)
    return value if isinstance(value, dict) else None
