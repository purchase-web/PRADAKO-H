#!/usr/bin/env python3
from __future__ import annotations
import argparse, json
from pathlib import Path
from product_alternatives import validate_index
p=argparse.ArgumentParser()
p.add_argument('index', type=Path)
p.add_argument('products_dir', type=Path)
p.add_argument('output', type=Path)
a=p.parse_args()
idx=json.loads(a.index.read_text(encoding='utf-8'))
report=validate_index(idx,a.products_dir)
a.output.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'passed':report['passed'],'errors':len(report['errors']),'warnings':len(report['warnings'])},indent=2))
raise SystemExit(0 if report['passed'] else 1)
