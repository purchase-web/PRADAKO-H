#!/usr/bin/env python3
from __future__ import annotations
import argparse, json
from pathlib import Path
from product_catalog_index import build_catalog_index, load_catalog_index
from product_alternatives import build_alternatives_index

p=argparse.ArgumentParser()
p.add_argument('products_dir', type=Path)
p.add_argument('output', type=Path)
p.add_argument('--catalog-index', type=Path)
p.add_argument('--overrides', type=Path)
p.add_argument('--max-degree', type=int, default=4)
a=p.parse_args()
cat=load_catalog_index(a.catalog_index) if a.catalog_index else build_catalog_index(a.products_dir)
overrides={}
if a.overrides and a.overrides.is_file(): overrides=json.loads(a.overrides.read_text(encoding='utf-8'))
idx=build_alternatives_index(a.products_dir,cat,overrides,max_degree=max(1,a.max_degree))
a.output.parent.mkdir(parents=True,exist_ok=True)
a.output.write_text(json.dumps(idx,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(f"Built alternatives for {idx['count']} pages -> {a.output}")
