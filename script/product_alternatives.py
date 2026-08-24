#!/usr/bin/env python3
"""Derived, conservative alternative-product graph for PMEW PDPs.

The engine intentionally distinguishes:
1) same-page configuration alternatives (handled by the PDP configurator), and
2) cross-page product-form candidates.

Cross-page candidates are never auto-promoted above ENGINEERING REVIEW. Stronger
confidence levels require an explicit verified override and, for VERIFIED EQUIVALENT,
a named standards/equivalence basis.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup

CONFIDENCE = {
    "verified-equivalent": "VERIFIED EQUIVALENT",
    "compatible-variant": "COMPATIBLE VARIANT",
    "engineering-review": "ENGINEERING REVIEW",
}

MID = re.compile(r"\s*[·•]\s*")
METRIC = re.compile(r"\bM\s*(\d+(?:\.\d+)?)\b", re.I)
INCH = re.compile(r"(?:UNC|UNF|UNEF|BSW|BSF|NPT|#\d|\d+\s*/\s*\d+\s*\")", re.I)


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def norm(value: Any) -> str:
    return clean(value).casefold()


def split_values(value: str) -> list[str]:
    return [clean(v) for v in MID.split(clean(value)) if clean(v)]


def _text(node) -> str:
    return node.get_text(" ", strip=True) if node else ""


def parse_record(path: Path, metadata: dict[str, Any] | None = None) -> dict[str, Any] | None:
    try:
        soup = BeautifulSoup(path.read_text(encoding="utf-8", errors="replace"), "html.parser")
    except OSError:
        return None
    hero = soup.select_one(".pmew-pd-hero")
    if not hero:
        return None
    name = _text(hero.select_one(".pmew-pd-title"))
    if not name:
        return None
    enquiry = hero.select_one("[data-enquiry-id]")
    product_id = enquiry.get("data-enquiry-id", path.stem) if enquiry else path.stem
    family = enquiry.get("data-enquiry-family", "") if enquiry else ""
    category = enquiry.get("data-enquiry-category", "") if enquiry else ""
    part_no = _text(hero.select_one(".pmew-pd-partno"))
    image_node = hero.select_one(".pmew-pd-media img")
    image = image_node.get("src", "") if image_node else ""

    spec: dict[str, str] = {}
    for sec in soup.select(".pmew-pd-section"):
        if norm(_text(sec.find("h2"))) != "specification":
            continue
        for tr in sec.select("tr"):
            th, td = tr.find("th"), tr.find("td")
            if th and td:
                spec[norm(_text(th))] = _text(td)
        break

    if metadata:
        part_no = part_no or clean(metadata.get("partNo"))
        family = family or clean(metadata.get("family"))
        category = category or clean(metadata.get("category"))
        image = image or clean(metadata.get("image"))

    attrs = {
        "standards": split_values(spec.get("standards", "")),
        "drive": clean(spec.get("drive", "")),
        "head": clean(spec.get("head form", "")),
        "thread": clean(spec.get("thread", "")),
        "grades": split_values(spec.get("property class / grade", "")),
        "materials": split_values(spec.get("materials", "")),
        "finishes": split_values(spec.get("finishes", "")),
        "sizeRange": clean(spec.get("size range", "")),
        "sectors": split_values(spec.get("sectors served", "")),
    }
    return {
        "id": product_id,
        "filename": path.name,
        "name": name,
        "partNo": part_no,
        "family": family,
        "category": category,
        "image": image,
        "attributes": attrs,
    }


def thread_systems(thread: str, size_range: str = "") -> set[str]:
    text = f"{thread} {size_range}"
    out: set[str] = set()
    if re.search(r"\bmetric\b", text, re.I) or METRIC.search(text):
        out.add("Metric")
    if INCH.search(text) or re.search(r"\binch\b", text, re.I):
        out.add("Inch")
    return out


def metric_range(size_range: str) -> tuple[float, float] | None:
    vals = [float(v) for v in METRIC.findall(size_range or "")]
    if not vals:
        return None
    return (min(vals), max(vals))


def metric_overlap(a: str, b: str) -> tuple[float, float] | None:
    ra, rb = metric_range(a), metric_range(b)
    if not ra or not rb:
        return None
    lo, hi = max(ra[0], rb[0]), min(ra[1], rb[1])
    return (lo, hi) if lo <= hi else None


def fmt_metric(value: float) -> str:
    return str(int(value)) if value.is_integer() else ("%.3f" % value).rstrip("0").rstrip(".")


def normal_set(values: list[str]) -> dict[str, str]:
    return {norm(v): clean(v) for v in values if clean(v)}


def intersections(a: list[str], b: list[str]) -> list[str]:
    aa, bb = normal_set(a), normal_set(b)
    return [aa[k] for k in aa.keys() & bb.keys()]


def authorities(standards: list[str]) -> set[str]:
    out = set()
    for s in standards:
        n = s.upper().strip()
        if n.startswith("DIN"): out.add("DIN")
        if n.startswith("ISO"): out.add("ISO")
        if n.startswith("EN"): out.add("EN")
        if n.startswith("ASTM"): out.add("ASTM")
        if n.startswith("ASME"): out.add("ASME")
        if n.startswith("IS ") or n.startswith("IS-"): out.add("IS")
        if n.startswith("JIS"): out.add("JIS")
        if n.startswith("BS"): out.add("BS")
        if n.startswith("SAE"): out.add("SAE")
    return out


def pair_score(a: dict[str, Any], b: dict[str, Any]) -> float | None:
    # Derived defaults are deliberately conservative: same family AND same category.
    if norm(a.get("family")) != norm(b.get("family")):
        return None
    if not a.get("category") or norm(a.get("category")) != norm(b.get("category")):
        return None
    aa, bb = a["attributes"], b["attributes"]
    systems_a = thread_systems(aa.get("thread", ""), aa.get("sizeRange", ""))
    systems_b = thread_systems(bb.get("thread", ""), bb.get("sizeRange", ""))
    if systems_a and systems_b and not (systems_a & systems_b):
        return None
    overlap = metric_overlap(aa.get("sizeRange", ""), bb.get("sizeRange", ""))
    if metric_range(aa.get("sizeRange", "")) and metric_range(bb.get("sizeRange", "")) and not overlap:
        return None

    score = 5.0  # same category
    if systems_a & systems_b: score += 4.0
    if overlap: score += 3.0
    score += min(2.0, len(intersections(aa.get("grades", []), bb.get("grades", []))) * .7)
    score += min(2.0, len(intersections(aa.get("finishes", []), bb.get("finishes", []))) * .35)
    score += min(1.5, len(intersections(aa.get("materials", []), bb.get("materials", []))) * .5)
    score += min(1.0, len(intersections(aa.get("sectors", []), bb.get("sectors", []))) * .25)
    if authorities(aa.get("standards", [])) & authorities(bb.get("standards", [])): score += .8
    if norm(aa.get("thread")) == norm(bb.get("thread")) and aa.get("thread"): score += 1.0
    return score


def relationship_label(a: dict[str, Any], b: dict[str, Any]) -> str:
    aa, bb = a["attributes"], b["attributes"]
    drive_diff = norm(aa.get("drive")) != norm(bb.get("drive"))
    head_diff = norm(aa.get("head")) != norm(bb.get("head"))
    if drive_diff and not head_diff:
        return "DRIVE ALTERNATIVE"
    if head_diff:
        return "FORM ALTERNATIVE"
    return "PRODUCT ALTERNATIVE"


def computed_diff(a: dict[str, Any], b: dict[str, Any]) -> tuple[list[str], list[str]]:
    aa, bb = a["attributes"], b["attributes"]
    changes: list[str] = []
    same: list[str] = []

    for label, key in [("Drive", "drive"), ("Form", "head"), ("Thread", "thread")]:
        av, bv = clean(aa.get(key)), clean(bb.get(key))
        if av and bv:
            if norm(av) == norm(bv):
                same.append(f"{label}: {av}")
            else:
                changes.append(f"{label}: {av} → {bv}")

    pa = aa.get("standards", [""])[0] if aa.get("standards") else ""
    pb = bb.get("standards", [""])[0] if bb.get("standards") else ""
    if pa and pb and norm(pa) != norm(pb):
        changes.append(f"Primary standard: {pa} → {pb}")

    overlap = metric_overlap(aa.get("sizeRange", ""), bb.get("sizeRange", ""))
    if overlap:
        same.append(f"Shared metric size coverage: M{fmt_metric(overlap[0])}–M{fmt_metric(overlap[1])}")

    grade_overlap = intersections(aa.get("grades", []), bb.get("grades", []))
    if grade_overlap:
        shown = " / ".join(grade_overlap[:3])
        same.append(f"Shared grade coverage: {shown}" + (" + more" if len(grade_overlap) > 3 else ""))

    finish_overlap = intersections(aa.get("finishes", []), bb.get("finishes", []))
    if finish_overlap:
        same.append(f"Shared finish options: {len(finish_overlap)}")

    material_overlap = intersections(aa.get("materials", []), bb.get("materials", []))
    if material_overlap:
        shown = " / ".join(material_overlap[:2])
        same.append(f"Shared material options: {shown}" + (" + more" if len(material_overlap) > 2 else ""))

    if not same:
        systems = thread_systems(aa.get("thread", ""), aa.get("sizeRange", "")) & thread_systems(bb.get("thread", ""), bb.get("sizeRange", ""))
        if systems:
            same.append("Shared thread system: " + " / ".join(sorted(systems)))

    return changes[:4], same[:4]


def load_overrides(path: Path | None) -> dict[str, Any]:
    if not path or not path.is_file():
        return {"version": 1, "pairs": {}}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        return raw if isinstance(raw, dict) else {"version": 1, "pairs": {}}
    except Exception:
        return {"version": 1, "pairs": {}}


def pair_key(a_id: str, b_id: str) -> str:
    return "::".join(sorted([str(a_id), str(b_id)]))


def build_alternatives_index(products_dir: Path, catalog_index: dict[str, Any], overrides: dict[str, Any] | None = None, max_degree: int = 4) -> dict[str, Any]:
    products_dir = products_dir.resolve()
    metadata_products = catalog_index.get("products", {}) if isinstance(catalog_index, dict) else {}
    records: dict[str, dict[str, Any]] = {}
    by_id: dict[str, dict[str, Any]] = {}

    for path in sorted(products_dir.glob("*.html")):
        meta = metadata_products.get(path.name, {}) if isinstance(metadata_products, dict) else {}
        rec = parse_record(path, meta)
        if not rec:
            continue
        records[path.name] = rec
        by_id[rec["id"]] = rec

    # Alias pages without a visible Pradako number must not become candidates. They can
    # still receive alternatives by matching their image/name to a canonical product.
    canonical = [r for r in records.values() if clean(r.get("partNo"))]
    canonical_by_image: dict[str, list[dict[str, Any]]] = {}
    for rec in canonical:
        if rec.get("image"):
            canonical_by_image.setdefault(rec["image"], []).append(rec)

    # Build a symmetric graph with a degree cap. Highest-scoring pairs win.
    pairs: list[tuple[float, dict[str, Any], dict[str, Any]]] = []
    for i, a in enumerate(canonical):
        for b in canonical[i + 1:]:
            score = pair_score(a, b)
            if score is not None and score >= 9.0:
                pairs.append((score, a, b))
    pairs.sort(key=lambda row: (-row[0], row[1]["name"], row[2]["name"]))
    degree = {r["id"]: 0 for r in canonical}
    edges: dict[str, list[dict[str, Any]]] = {r["id"]: [] for r in canonical}
    override_pairs = (overrides or {}).get("pairs", {}) if isinstance(overrides, dict) else {}

    def pair_override(a: dict[str, Any], b: dict[str, Any]) -> dict[str, Any]:
        value = override_pairs.get(pair_key(a["id"], b["id"]), {}) if isinstance(override_pairs, dict) else {}
        return value if isinstance(value, dict) else {}

    for score, a, b in pairs:
        ov = pair_override(a, b)
        if ov.get("suppress") is True:
            continue
        if degree[a["id"]] >= max_degree or degree[b["id"]] >= max_degree:
            continue
        changes_ab, same_ab = computed_diff(a, b)
        changes_ba, same_ba = computed_diff(b, a)
        confidence = clean(ov.get("confidence")) or "engineering-review"
        if confidence not in CONFIDENCE:
            confidence = "engineering-review"
        basis = clean(ov.get("basis"))
        labels = ov.get("labels", {}) if isinstance(ov.get("labels"), dict) else {}
        entry_ab = {
            "id": b["id"], "href": b["filename"], "name": b["name"], "partNo": b["partNo"],
            "family": b["family"], "category": b["category"], "image": b["image"],
            "confidence": confidence, "confidenceLabel": CONFIDENCE[confidence],
            "basis": basis, "reason": clean(labels.get(a["id"])) or relationship_label(a, b),
            "score": round(score, 2), "changes": changes_ab, "same": same_ab,
            "attributes": b["attributes"],
        }
        entry_ba = {
            "id": a["id"], "href": a["filename"], "name": a["name"], "partNo": a["partNo"],
            "family": a["family"], "category": a["category"], "image": a["image"],
            "confidence": confidence, "confidenceLabel": CONFIDENCE[confidence],
            "basis": basis, "reason": clean(labels.get(b["id"])) or relationship_label(b, a),
            "score": round(score, 2), "changes": changes_ba, "same": same_ba,
            "attributes": a["attributes"],
        }
        edges[a["id"]].append(entry_ab)
        edges[b["id"]].append(entry_ba)
        degree[a["id"]] += 1
        degree[b["id"]] += 1

    # Explicit forced pairs are added after the derived graph (and may exceed the cap).
    if isinstance(override_pairs, dict):
        for key, ov in override_pairs.items():
            if not isinstance(ov, dict) or ov.get("suppress") or not ov.get("force"):
                continue
            ids = key.split("::")
            if len(ids) != 2 or ids[0] not in by_id or ids[1] not in by_id:
                continue
            a, b = by_id[ids[0]], by_id[ids[1]]
            if any(x.get("id") == b["id"] for x in edges.setdefault(a["id"], [])):
                continue
            confidence = clean(ov.get("confidence")) or "engineering-review"
            if confidence not in CONFIDENCE: confidence = "engineering-review"
            basis = clean(ov.get("basis"))
            labels = ov.get("labels", {}) if isinstance(ov.get("labels"), dict) else {}
            for src, dst in [(a, b), (b, a)]:
                changes, same = computed_diff(src, dst)
                edges.setdefault(src["id"], []).append({
                    "id": dst["id"], "href": dst["filename"], "name": dst["name"], "partNo": dst["partNo"],
                    "family": dst["family"], "category": dst["category"], "image": dst["image"],
                    "confidence": confidence, "confidenceLabel": CONFIDENCE[confidence], "basis": basis,
                    "reason": clean(labels.get(src["id"])) or relationship_label(src, dst), "score": None,
                    "changes": changes, "same": same, "attributes": dst["attributes"],
                })

    # Page-level output. Alias pages inherit the graph of a unique matching canonical record.
    page_output: dict[str, Any] = {}
    for filename, rec in records.items():
        source = rec
        if not clean(rec.get("partNo")) and rec.get("image"):
            matches = canonical_by_image.get(rec["image"], [])
            same_name = [x for x in matches if norm(x["name"]) == norm(rec["name"])]
            if len(same_name) == 1:
                source = same_name[0]
            elif len(matches) == 1:
                source = matches[0]
        page_output[filename] = {
            "productId": rec["id"],
            "canonicalProductId": source["id"],
            "crossPage": sorted(edges.get(source["id"], []), key=lambda x: (-(x.get("score") or 0), x["name"]))[:max_degree],
        }

    return {
        "version": 1,
        "confidenceVocabulary": CONFIDENCE,
        "policy": {
            "derivedConfidence": "engineering-review",
            "verifiedEquivalentRequiresBasis": True,
            "candidateRule": "same family + same category + compatible thread system + overlapping published metric range when both ranges are parseable",
        },
        "count": len(page_output),
        "products": page_output,
    }


def validate_index(index: dict[str, Any], products_dir: Path) -> dict[str, Any]:
    files = {p.name for p in products_dir.glob("*.html")}
    products = index.get("products", {}) if isinstance(index, dict) else {}
    errors: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []
    edge_lookup: dict[tuple[str, str], dict[str, Any]] = {}

    for filename, pdata in products.items():
        source_id = clean(pdata.get("canonicalProductId") or pdata.get("productId"))
        for alt in pdata.get("crossPage", []) or []:
            target_id = clean(alt.get("id"))
            href = clean(alt.get("href"))
            if not href or href not in files:
                errors.append({"type": "missing-target", "page": filename, "target": href})
            if source_id and target_id and source_id == target_id:
                errors.append({"type": "self-reference", "page": filename, "target": target_id})
            if alt.get("confidence") == "verified-equivalent" and not clean(alt.get("basis")):
                errors.append({"type": "verified-without-basis", "page": filename, "target": target_id})
            edge_lookup[(source_id, target_id)] = alt

    for (a, b), edge in edge_lookup.items():
        reverse = edge_lookup.get((b, a))
        if not reverse:
            # Alias pages do not own canonical graph edges; only canonical IDs count here.
            warnings.append({"type": "non-reciprocal-visible-page-or-alias", "source": a, "target": b})
        elif clean(reverse.get("confidence")) != clean(edge.get("confidence")):
            errors.append({"type": "confidence-mismatch", "source": a, "target": b})

    return {
        "version": 1,
        "pages": len(products),
        "errors": errors,
        "warnings": warnings,
        "passed": len(errors) == 0,
    }

def load_alternatives_index(path: Path | None) -> dict[str, Any]:
    if not path or not path.is_file():
        return {"version": 1, "count": 0, "products": {}}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(raw, dict) and isinstance(raw.get("products"), dict):
            return raw
    except Exception:
        pass
    return {"version": 1, "count": 0, "products": {}}
