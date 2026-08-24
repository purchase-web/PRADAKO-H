import pandas as pd
import json
import re

def normalize_iso(iso_str):
    """Normalize ISO string by removing spaces and hyphens"""
    if pd.isna(iso_str):
        return ""
    return re.sub(r'[\s-]', '', str(iso_str)).lower()

def remove_duplicates(standards):
    """Remove duplicates based on normalized ISO number"""
    seen = set()
    unique = []
    for std in standards:
        norm_iso = normalize_iso(std['iso'])
        if norm_iso not in seen:
            seen.add(norm_iso)
            unique.append(std)
    return unique

# Read Excel file
df = pd.read_excel('ISO_fastener_standards_iso_org_verified_2026-06-11.xlsx')

# Rename columns
df.columns = ['family', 'iso', 'title', 'keywords']

# Convert to list of dictionaries
standards = []
for _, row in df.iterrows():
    if pd.notna(row['iso']):  # Skip empty rows
        standards.append({
            "family": str(row['family']) if pd.notna(row['family']) else "",
            "iso": str(row['iso']).strip(),
            "title": str(row['title']) if pd.notna(row['title']) else "",
            "keywords": str(row['keywords']) if pd.notna(row['keywords']) else ""
        })

# Remove duplicates
unique_standards = remove_duplicates(standards)

# Save to JSON
with open('iso-standards.json', 'w', encoding='utf-8') as f:
    json.dump(unique_standards, f, indent=2, ensure_ascii=False)

print(f"Converted {len(standards)} records to {len(unique_standards)} unique standards")
print(f"Saved to data/iso-standards.json")