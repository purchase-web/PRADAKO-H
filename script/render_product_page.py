#!/usr/bin/env python3
"""Render one existing PMEW product detail page with the shared individual-product template.

This intentionally renders ONE page at a time. Later the same renderer can be wrapped in a
315-product-page batch command after the template system is approved.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from jinja2 import Environment, FileSystemLoader, select_autoescape

from product_catalog_index import build_catalog_index, load_catalog_index, lookup_related
from product_alternatives import load_alternatives_index

MID = re.compile(r"\s*[·•]\s*")
SLASH = re.compile(r"\s*/\s*")


def text(node, default=""):
    return node.get_text(" ", strip=True) if node else default


def meta(soup, **attrs):
    node = soup.find("meta", attrs=attrs)
    return node.get("content", "") if node else ""


def split_values(value):
    value = (value or "").strip()
    if not value:
        return []
    return [v.strip() for v in MID.split(value) if v.strip()]


def parse_source(path: Path, catalog_index=None, alternatives_index=None):
    html = path.read_text(encoding="utf-8", errors="replace")
    soup = BeautifulSoup(html, "html.parser")

    title = text(soup.title)
    meta_description = meta(soup, name="description")
    canonical_node = soup.find("link", rel="canonical")
    canonical = canonical_node.get("href", "") if canonical_node else ""
    og_title = meta(soup, property="og:title") or title
    og_description = meta(soup, property="og:description") or meta_description
    og_url = meta(soup, property="og:url") or canonical
    json_ld_node = soup.find("script", attrs={"type": "application/ld+json"})
    json_ld = json_ld_node.string.strip() if json_ld_node and json_ld_node.string else ""

    crumb_node = soup.select_one(".pmew-pd-crumb")
    breadcrumbs = []
    if crumb_node:
        for child in crumb_node.find_all(["a", "strong"], recursive=False):
            breadcrumbs.append({"label": text(child), "href": child.get("href", "") if child.name == "a" else ""})

    hero = soup.select_one(".pmew-pd-hero")
    product_name = text(hero.select_one(".pmew-pd-title") if hero else None)
    part_no = text(hero.select_one(".pmew-pd-partno") if hero else None)
    eyebrow = text(hero.select_one(".pmew-pd-eyebrow") if hero else None)
    lead = text(hero.select_one(".pmew-pd-lead") if hero else None)
    # Older generated pages sometimes repeat the family noun (e.g. "Square Nuts nut").
    # Clean that mechanical phrasing for the commerce template without changing source data.
    if product_name and lead:
        lead = re.sub(r"^(" + re.escape(product_name) + r")\s+(bolt|nut|screw|washer|rivet|stud|pin|bush|plug|rod)\b\s*,?\s*", r"\1, ", lead, flags=re.I)
    source_note = text(hero.select_one(".pmew-pd-source") if hero else None)
    image_node = hero.select_one(".pmew-pd-media img") if hero else None
    image = image_node.get("src", "") if image_node else ""

    enquiry = hero.select_one("[data-enquiry-id]") if hero else None
    product_id = enquiry.get("data-enquiry-id", path.stem) if enquiry else path.stem
    family = enquiry.get("data-enquiry-family", "") if enquiry else ""
    category = enquiry.get("data-enquiry-category", "") if enquiry else ""
    family_url = enquiry.get("data-enquiry-family-url", "") if enquiry else ""

    if (not family or not category) and eyebrow:
        bits = [x.strip() for x in eyebrow.split("·")]
        if not family and bits:
            family = bits[0]
        if not category and len(bits) > 1:
            category = bits[1]

    secondary = hero.select_one(".pmew-pd-secondary") if hero else None
    browse_url = secondary.get("href", family_url or "../customised-products.html") if secondary else (family_url or "../customised-products.html")

    key_specs = []
    for node in soup.select(".pmew-pd-keyspec"):
        key_specs.append({"label": text(node.find("small")), "value": text(node.find("strong"))})

    specs = []
    spec_map = {}
    spec_section = None
    for sec in soup.select(".pmew-pd-section"):
        if text(sec.find("h2")).lower() == "specification":
            spec_section = sec
            break
    if spec_section:
        for tr in spec_section.select("tr"):
            label = text(tr.find("th"))
            value = text(tr.find("td"))
            if label and value:
                specs.append({"label": label, "value": value})
                spec_map[label.lower()] = value

    xref_section = None
    tool_section = None
    related_section = None
    for sec in soup.select(".pmew-pd-section"):
        heading = text(sec.find("h2")).lower()
        if "cross-reference" in heading:
            xref_section = sec
        elif "engineering tools" in heading:
            tool_section = sec
        elif heading.startswith("related"):
            related_section = sec

    xref_note = text(xref_section.select_one(".pmew-pd-note") if xref_section else None)
    xrefs = [text(x) for x in (xref_section.select(".pmew-pd-xref li") if xref_section else []) if text(x)]
    if not xrefs:
        xrefs = split_values(spec_map.get("standards", ""))[:6]

    tool_icon = {
        "weight": ("fa-solid fa-weight-hanging", "Mass & quantity"),
        "thread": ("fa-solid fa-screwdriver-wrench", "Threading"),
        "galvanic": ("fa-solid fa-shield-halved", "Material pairing"),
        "container": ("fa-solid fa-boxes-stacked", "Logistics"),
    }
    tools = []
    for a in (tool_section.select(".pmew-pd-tool") if tool_section else []):
        label = text(a)
        low = label.lower()
        key = "weight" if "weight" in low else "thread" if "thread" in low else "galvanic" if "galvanic" in low else "container" if ("container" in low or "pallet" in low) else "weight"
        icon, eyebrow_tool = tool_icon[key]
        tools.append({"label": label, "href": a.get("href", "#"), "icon": icon, "eyebrow": eyebrow_tool})

    related_title = text(related_section.find("h2") if related_section else None, f"Related {family.lower() if family else 'products'}")

    def related_metadata(href, fallback_label):
        """Enrich a related-product card from source siblings or the catalogue index.

        Resolution order intentionally prefers the authoritative sibling source page
        when it is available. If this page is being rendered in isolation, the
        packaged catalogue index supplies the same metadata so Related Product images
        never depend on the temporary output directory.
        """
        clean_href = (href or "").split("#", 1)[0].split("?", 1)[0]
        fallback = {"label": fallback_label, "href": href or "#", "image": "", "part_no": "", "category": ""}
        if not clean_href.lower().endswith(".html"):
            return fallback

        # Resolve indexed metadata once. It is also used to backfill fields that
        # are intentionally blank on legacy alias pages.
        indexed = lookup_related(catalog_index or {}, clean_href)

        # 1) Prefer a real sibling source page if present, then backfill any
        # missing display metadata from the stable catalogue index.
        candidate = (path.parent / clean_href).resolve()
        try:
            candidate.relative_to(path.parent.resolve())
        except ValueError:
            candidate = None

        if candidate and candidate.is_file():
            try:
                linked = BeautifulSoup(candidate.read_text(encoding="utf-8", errors="replace"), "html.parser")
                linked_hero = linked.select_one(".pmew-pd-hero")
                if linked_hero:
                    linked_name = text(linked_hero.select_one(".pmew-pd-title"), fallback_label)
                    linked_part = text(linked_hero.select_one(".pmew-pd-partno"))
                    linked_image_node = linked_hero.select_one(".pmew-pd-media img")
                    linked_image = linked_image_node.get("src", "") if linked_image_node else ""
                    linked_enquiry = linked_hero.select_one("[data-enquiry-id]")
                    linked_category = linked_enquiry.get("data-enquiry-category", "") if linked_enquiry else ""
                    return {
                        "label": linked_name or (str(indexed.get("name")) if indexed else "") or fallback_label,
                        "href": href or "#",
                        "image": linked_image or (str(indexed.get("image") or "") if indexed else ""),
                        "part_no": linked_part or (str(indexed.get("partNo") or "") if indexed else ""),
                        "category": linked_category or (str(indexed.get("category") or "") if indexed else ""),
                    }
            except Exception:
                # Fall through to the catalogue index; an individual malformed linked
                # source page must not blank every related-product visual.
                pass

        # 2) Stable fallback: complete product metadata index.
        if indexed:
            return {
                "label": str(indexed.get("name") or fallback_label),
                "href": href or "#",
                "image": str(indexed.get("image") or ""),
                "part_no": str(indexed.get("partNo") or ""),
                "category": str(indexed.get("category") or ""),
            }

        # 3) Genuine no-metadata case only. The template may show its neutral fallback.
        return fallback

    related = []
    for a in (related_section.select(".pmew-pd-related a") if related_section else []):
        related.append(related_metadata(a.get("href", "#"), text(a)))

    cta = soup.select_one(".pmew-pd-cta")
    cta_copy = text(cta.find("p") if cta else None)

    def values_from(label):
        return split_values(spec_map.get(label.lower(), ""))

    standards = values_from("Standards")
    grades = values_from("Property class / grade")
    materials = values_from("Materials")
    finishes = values_from("Finishes")
    sectors = values_from("Sectors served")
    tests = values_from("Testing")

    attrs = {
        "standards": standards,
        "grades": grades,
        "materials": materials,
        "finishes": finishes,
        "drive": spec_map.get("drive", ""),
        "head": spec_map.get("head form", ""),
        "threadType": spec_map.get("thread", ""),
        "sizeRange": spec_map.get("size range", ""),
        "sectors": sectors,
        "tests": tests,
    }

    alternative_page = ((alternatives_index or {}).get("products") or {}).get(path.name, {})
    cross_alternatives = alternative_page.get("crossPage", []) if isinstance(alternative_page, dict) else []
    if not isinstance(cross_alternatives, list):
        cross_alternatives = []
    # Same-page alternatives are configuration swaps, never new URLs. Only axes that
    # already exist in the approved configurator are exposed here. Material remains
    # descriptive until the PDP has a verified material selector.
    config_alternatives = {
        "grade": grades,
        "finish": finishes,
    }
    product_obj = {
        "id": product_id,
        "name": product_name,
        "partNo": part_no,
        "family": family,
        "category": category,
        "subType": category,
        "familyUrl": family_url,
        "image": image,
        "attributes": attrs,
        # Phase 1 hardening hooks. Rules stay empty until engineering/product
        # data provides verified restrictions. "blocked" prevents adding;
        # "review" allows the RFQ but explicitly flags engineering confirmation.
        "configurationRules": {"blocked": [], "review": []},
        "configurationCapabilities": {
            "hasPublishedSizeRange": bool(attrs["sizeRange"]),
            "hasPublishedGrades": bool(grades),
            "hasPublishedFinishes": bool(finishes),
            "supportsDrawingSpecification": True,
        },
        "alternatives": {
            "configuration": config_alternatives,
            "products": cross_alternatives,
            "confidenceVocabulary": (alternatives_index or {}).get("confidenceVocabulary", {}),
        },
    }

    # sensible fallback quick specs when the source omits them
    if not key_specs:
        fallback = [
            ("Standard", standards[0] if standards else "—"),
            ("Grade", " / ".join(grades[:2]) if grades else "—"),
            ("Thread", attrs["threadType"] or "—"),
            ("Size range", attrs["sizeRange"] or "—"),
        ]
        key_specs = [{"label": a, "value": b} for a, b in fallback]
    key_specs = key_specs[:4]

    return {
        "title": title,
        "meta_description": meta_description,
        "canonical": canonical,
        "og_title": og_title,
        "og_description": og_description,
        "og_url": og_url,
        "json_ld": json_ld,
        "breadcrumbs": breadcrumbs,
        "product_name": product_name,
        "part_no": part_no,
        "family": family,
        "category": category,
        "family_url": family_url,
        "browse_url": browse_url,
        "lead": lead,
        "image": image,
        "product_id": product_id,
        "source_note": source_note or "Specification compiled from the governing published standards. Confirm critical dimensions with our engineering team before ordering.",
        "key_specs": key_specs,
        "specs": specs,
        "xref_note": xref_note or "Equivalent and near-equivalent designations. Confirm dimensional equivalence against the governing standard before substitution.",
        "xrefs": xrefs,
        "tools": tools,
        "related_title": related_title,
        "related": related,
        "config_alternatives": config_alternatives,
        "cross_alternatives": cross_alternatives,
        "cta_copy": cta_copy or "Send your drawing, sample or specification and our engineering team will review manufacturability and quotation requirements.",
        "standards": standards,
        "grades": grades,
        "materials": materials,
        "finishes": finishes,
        "sectors": sectors,
        "tests": tests,
        "primary_standard": standards[0] if standards else "",
        "primary_material": materials[0] if materials else "",
        "size_range": attrs["sizeRange"],
        "thread_type": attrs["threadType"],
        "drive": attrs["drive"],
        "head_form": attrs["head"],
        "product_json": json.dumps(product_obj, ensure_ascii=False).replace("</", "<\\/"),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Existing products/*.html page")
    parser.add_argument("output", type=Path, help="Rendered output HTML")
    parser.add_argument("--template", type=Path, default=Path(__file__).resolve().parents[1] / "templates" / "individual-product.template.html")
    parser.add_argument(
        "--catalog-index",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "product-metadata-index.json",
        help="Reusable product metadata index for related cards",
    )
    parser.add_argument(
        "--catalog-root",
        type=Path,
        help="Optional authoritative products directory. When supplied, metadata is built from it in memory and overrides --catalog-index.",
    )
    parser.add_argument(
        "--alternatives-index",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "product-alternatives-index.json",
        help="Derived + curated cross-product alternatives index.",
    )
    args = parser.parse_args()

    if args.catalog_root:
        catalog_index = build_catalog_index(args.catalog_root)
    else:
        catalog_index = load_catalog_index(args.catalog_index)
        # Development convenience: when the bundled index is absent, a normal full
        # source directory can still enrich its own related cards automatically.
        if not catalog_index.get("count"):
            catalog_index = build_catalog_index(args.source.parent)

    alternatives_index = load_alternatives_index(args.alternatives_index)
    context = parse_source(args.source, catalog_index=catalog_index, alternatives_index=alternatives_index)
    if not context.get("product_name") or not context.get("product_id"):
        raise SystemExit(f"Not a product-detail page: {args.source}")
    env = Environment(loader=FileSystemLoader(str(args.template.parent)), autoescape=select_autoescape(["html", "xml"]), trim_blocks=True, lstrip_blocks=True)
    template = env.get_template(args.template.name)
    rendered = template.render(**context)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")
    print(f"Rendered: {args.output}")
    print(f"Product: {context['product_name']} ({context['part_no']})")
    print(f"Specs: {len(context['specs'])}; xrefs: {len(context['xrefs'])}; tools: {len(context['tools'])}; related: {len(context['related'])}")

if __name__ == "__main__":
    main()
