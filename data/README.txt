PMEW DATA PACKAGE — 2026-08-21

This package separates master/source engineering data from generated browser data and from website runtime code.

IMPORTANT:
1. data/source/standards is the source/provenance layer. Do not delete it when regenerating website data.
2. data/generated/standards/authority contains derived JavaScript datasets. None of these filenames is directly referenced by the current 5,194-page HTML baseline or the cleaned interactive JS package at the time of this audit.
3. config/redirect-map.csv is backend/SEO migration data and should be retained.
4. data/manifests/specifications-manifest.json is the preferred machine-readable manifest; the CSV is retained for human/Excel review.
5. tools/archive/iso-standards-converter.py was supplied under the misleading filename iso-standards.json. It expects an Excel file named ISO_fastener_standards_iso_org_verified_2026-06-11.xlsx, which was not supplied in the current archives.
6. data/archive/product-taxonomy/screwdata.json is retained as historical taxonomy. It is not currently referenced by the audited HTML/cleaned JS.
7. HTML files were intentionally not rewritten in this pass.

See docs/PMEW-DATA-ORGANIZATION-REPORT.txt for detailed audit results.
