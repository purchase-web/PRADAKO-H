#!/usr/bin/env python3
"""Build the reusable PMEW product metadata index used by related-product cards."""
from __future__ import annotations

import argparse
from pathlib import Path

from product_catalog_index import build_catalog_index, save_catalog_index


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("products_dir", type=Path, help="Directory containing the authoritative products/*.html source pages")
    parser.add_argument(
        "output",
        nargs="?",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "data" / "product-metadata-index.json",
        help="Output JSON index (defaults to package data/product-metadata-index.json)",
    )
    args = parser.parse_args()

    index = build_catalog_index(args.products_dir)
    save_catalog_index(index, args.output)
    print(f"Indexed {index['count']} product pages")
    print(f"Wrote: {args.output}")


if __name__ == "__main__":
    main()
