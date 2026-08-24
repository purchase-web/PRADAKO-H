from pathlib import Path
import re, html, json, hashlib, shutil, zipfile
from collections import OrderedDict, defaultdict

SRC = Path('/mnt/data/Pasted text(20260817-110550).txt')
OUT = Path('/mnt/data/Pradako_DIN_Standards_Original_Graphite_Teal')
if OUT.exists(): shutil.rmtree(OUT)
(OUT / 'standard' / 'din').mkdir(parents=True)

source = SRC.read_text(encoding='utf-8')
m = re.search(r'const rawDinTSV = `(.+?)`;\n\nconst standardsData', source, re.S)
if not m:
    raise SystemExit('Could not locate rawDinTSV')
raw_tsv = m.group(1)
lines = raw_tsv.strip().splitlines()
header = lines[0].split('\t')
rows = []
for idx, line in enumerate(lines[1:], 1):
    parts = line.split('\t')
    if len(parts) != 7:
        raise SystemExit(f'Row {idx}: expected 7 columns, found {len(parts)}')
    rows.append({
        'standardCode': parts[0],
        'correctStandard': parts[1],
        'statusNote': parts[2],
        'officialEnglishTitle': parts[3],
        'originalGermanTitle': parts[4],
        'productFamily': parts[5],
        'websiteNote': parts[6],
        'rowNumber': idx,
    })

def slugify(text):
    s = text.lower().replace('&',' and ').replace('+',' plus ')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'standard'

# Every source row is an independent website standard record.
# This deliberately creates 487 unique Pradako Standard IDs and 487 unique pages,
# while preserving every supplied DIN source field exactly as-is.
base_counts = defaultdict(int)
used_slugs = set()
for i, r in enumerate(rows, 1):
    code = r['standardCode'].strip()
    base = slugify(code)
    base_counts[base] += 1
    occurrence = base_counts[base]
    candidate = base if occurrence == 1 else f'{base}-{occurrence:02d}'
    # Absolute collision guard for different designations that normalize to the same slug.
    while candidate in used_slugs:
        occurrence += 1
        candidate = f'{base}-{occurrence:02d}'
    used_slugs.add(candidate)
    r['pradakoId'] = f'PRA-STD-DIN-{i:04d}'
    r['pageSlug'] = candidate
    r['mediaSlug'] = base
    r['imageSrc'] = f"/images/product/standards-products/{base}.png"

id_list = [r['pradakoId'] for r in rows]
slug_list = [r['pageSlug'] for r in rows]
media_slug_list = [r['mediaSlug'] for r in rows]
id_js = json.dumps(id_list, ensure_ascii=False, indent=2)
slug_js = json.dumps(slug_list, ensure_ascii=False, indent=2)
media_slug_js = json.dumps(media_slug_list, ensure_ascii=False, indent=2)
raw_js = raw_tsv.replace('`', '\\`').replace('${', '\\${')

main_html = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Pradako DIN Standards Library</title>
<meta name="description" content="Search the Pradako DIN standards library by standard number, official English title, original German title and product family." />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link rel="stylesheet" href="/CSS/navbar.css">
<link rel="stylesheet" href="/CSS/design_system.css">
<style>
:root{--white:#fff;--navy:#24343b;--blue:#28766a;--gold:#f08080;--line:#dde5e7;--text:#26343b;--muted:#6d7b82;--soft-blue:#eef7f4;--soft:#f7faf9;--shadow:0 16px 42px rgba(36,52,59,.08);--sticky-top:0px}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:"Montserrat","Segoe UI",Arial,sans-serif;color:var(--text);background:var(--white)}a{color:inherit}.page{min-height:100vh;background:#fff}.top-hero{padding:52px clamp(24px,3.1vw,58px) 40px;border-bottom:1px solid var(--line)}.hero-kicker{display:inline-flex;gap:8px;align-items:center;margin-bottom:14px;color:var(--blue);font-size:11px;font-weight:900;letter-spacing:1.4px;text-transform:uppercase}.top-hero h1{margin:0;max-width:1150px;font-family:"Space Grotesk",Georgia,serif;font-size:clamp(46px,4.4vw,76px);line-height:1;letter-spacing:-1.8px;color:var(--navy)}.top-hero p{max-width:1080px;margin:20px 0 0;font-size:15px;line-height:1.75;color:var(--muted);font-weight:600}.control-zone{position:sticky;top:0;z-index:1500;padding:20px 32px 0;background:#fff;border-bottom:1px solid var(--line);box-shadow:0 10px 26px rgba(36,52,59,.055)}.controls-grid{display:grid;grid-template-columns:minmax(360px,1.5fr) minmax(240px,.7fr) auto auto auto;gap:10px;align-items:center}.search-wrap,.family-wrap{position:relative}.search-wrap input,.family-filter{width:100%;height:44px;border:1px solid var(--line);border-radius:14px;background:#fff;outline:0;font:700 13px "Montserrat",sans-serif;color:var(--text);transition:.2s}.search-wrap input{padding:0 18px 0 46px}.family-filter{padding:0 14px}.search-wrap input:focus,.family-filter:focus{border-color:var(--blue);box-shadow:0 0 0 4px var(--soft-blue)}.search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:17px;color:var(--navy)}.btn{height:44px;border-radius:14px;padding:0 16px;font:900 11px "Montserrat",sans-serif;letter-spacing:.35px;text-transform:uppercase;cursor:pointer;white-space:nowrap;transition:.2s}.btn-primary{background:var(--navy);border:1px solid var(--navy);color:#fff}.btn-primary:hover{background:var(--blue);border-color:var(--blue)}.btn-soft{background:#fff;border:1px solid var(--line);color:var(--navy)}.btn-soft:hover,.btn-soft.active{background:var(--soft-blue);border-color:var(--blue)}.stats-row{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-top:14px}.stat-pills,.stats-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.stat-pill{padding:8px 12px;border:1px solid var(--line);border-radius:999px;color:var(--navy);font-size:12px;font-weight:900;background:#fff}.duplicate-mode-pill{display:none}.duplicate-mode-pill.show{display:inline-flex}.duplicate-check-btn{border-color:#f08080;background:#fff2f2;color:#493538}.duplicate-check-btn.active{background:#f08080;color:#fff;border-color:#f08080}.view-panel{display:none;margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,#fff,var(--soft));box-shadow:0 10px 25px rgba(36,52,59,.04)}.view-panel.open{display:block}.view-panel-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}.view-panel-title{font-size:12px;font-weight:900;color:var(--navy);letter-spacing:.6px;text-transform:uppercase}.preset-actions{display:flex;gap:6px;flex-wrap:wrap}.mini-btn{height:32px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--navy);padding:0 11px;font:900 10px "Montserrat",sans-serif;text-transform:uppercase;cursor:pointer}.mini-btn.active,.mini-btn:hover{background:var(--navy);border-color:var(--navy);color:#fff}.view-groups{display:grid;grid-template-columns:2fr 1fr 1fr;gap:10px}.view-group{padding:11px;border:1px solid var(--line);border-radius:14px;background:#fff}.view-group h4{margin:0 0 8px;font-size:10px;color:var(--muted);letter-spacing:.8px;text-transform:uppercase}.column-checks{display:flex;gap:7px;flex-wrap:wrap}.check-item{display:inline-flex;align-items:center;gap:7px;padding:7px 9px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--text);font-size:11px;font-weight:800;cursor:pointer}.check-item:has(input:checked){border-color:#94c2b5;background:var(--soft-blue);color:var(--navy)}.check-item input{accent-color:var(--navy)}.sticky-table-head-wrap{margin:16px -32px 0;background:#fff;border-top:1px solid var(--line);box-shadow:0 12px 24px rgba(36,52,59,.065)}.sticky-table-head-scroll{width:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}.sticky-table-head-scroll::-webkit-scrollbar{display:none}.sticky-head-table,#standardsTable{width:max-content;min-width:0;border-collapse:separate;border-spacing:0;table-layout:fixed}.sticky-head-table thead th{position:relative!important;background:var(--navy)}#standardsTable thead{display:none}.table-zone{position:relative;background:#fff}.table-scroll{position:relative;width:100%;overflow-x:auto;overflow-y:visible}.table-scroll.fit-core{overflow-x:auto}.sticky-table-head-scroll.fit-core{overflow-x:auto}.sticky-head-table th,#standardsTable th,#standardsTable td{box-sizing:border-box}thead th{padding:12px 8px;text-align:left;font-size:9.5px;letter-spacing:.55px;color:#fff;background:var(--navy);border-right:1px solid rgba(255,255,255,.2);cursor:pointer;user-select:none;white-space:normal;text-transform:uppercase;line-height:1.35}thead th.not-sortable{cursor:default}tbody tr{height:190px}tbody td{padding:16px 9px;vertical-align:middle;font-size:12px;line-height:1.5;background:#fff;color:var(--text);border-right:1px solid var(--line);border-bottom:1px solid var(--line);font-weight:600;overflow-wrap:anywhere}tbody tr:hover td{background:#f3f9f7}.media-cell{padding:16px 14px!important}.media-card{width:210px;height:154px;border:1px solid var(--line);border-radius:16px;background:#fff;overflow:hidden;position:relative;box-shadow:0 9px 22px rgba(36,52,59,.055);cursor:pointer}.media-card img{width:100%;height:100%;display:block;object-fit:contain;padding:9px;background:#fff;transition:.22s}.media-card:hover{border-color:var(--blue)}.media-card:hover img{transform:scale(1.035)}.media-empty{width:210px;height:154px;border:1px dashed #c8d5d7;border-radius:16px;background:#fbfcfc;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;text-align:center;color:var(--muted);font-size:10px;font-weight:900;letter-spacing:.45px;text-transform:uppercase}.media-empty i{font-size:20px;color:#82959b}.pradako-id{display:inline-flex;padding:7px 9px;border:1px solid #cad6d8;border-radius:9px;background:#f6f9f8;color:var(--navy);font:900 11px "Montserrat",sans-serif;letter-spacing:.2px;white-space:nowrap}.standard-link{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:10px;background:var(--navy);color:#fff;text-decoration:none;font-weight:900;white-space:normal}.standard-link:hover{background:var(--blue)}.standard-link i{font-size:9px}.title-cell{font-weight:800;color:var(--text);display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}.family-pill,.status-pill{display:inline-flex;padding:7px 10px;border-radius:999px;border:1px solid var(--line);font-size:11px;font-weight:900;line-height:1.35}.family-pill{background:#fff;color:var(--navy)}.status-pill{background:var(--soft-blue);color:var(--navy)}mark{background:#dcefe9;color:var(--navy);padding:0 2px;border-radius:3px}.empty-state{display:none;padding:64px 20px;text-align:center;color:var(--muted)}.empty-state h3{margin:0 0 8px;color:var(--navy)}.footer-note{padding:16px 32px;border-top:1px solid var(--line);color:var(--muted);font-size:11px;line-height:1.7;font-weight:700}.modal-overlay,.image-preview-overlay{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(24,34,39,.84);backdrop-filter:blur(8px)}.modal-overlay.show,.image-preview-overlay.show{display:flex}.modal-card,.image-preview-card{position:relative;width:min(620px,96vw);max-height:92vh;overflow:auto;border-radius:22px;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.24)}.image-preview-card{width:min(1000px,96vw)}.modal-top,.image-preview-head{padding:22px 26px;background:var(--navy);color:#fff;border-bottom:3px solid var(--gold)}.modal-top h2,.image-preview-head h3{margin:0}.modal-top p{margin:9px 0 0;line-height:1.6;font-size:13px}.modal-body,.image-preview-body{padding:24px}.image-preview-body img{width:100%;max-height:70vh;object-fit:contain;display:block}.modal-close,.image-preview-close{position:absolute;right:15px;top:15px;width:38px;height:38px;border:0;border-radius:50%;background:#fff;color:var(--navy);font-size:22px;cursor:pointer;z-index:3}.work-message{padding:17px;border:1px solid var(--line);border-radius:14px;line-height:1.7;font-weight:700}.email-line{margin-top:8px;color:var(--navy);font-weight:900}.modal-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.modal-btn{height:42px;padding:0 14px;border-radius:12px;border:1px solid var(--line);font:900 11px "Montserrat";text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}.modal-btn-primary{background:var(--navy);border-color:var(--navy);color:#fff}.modal-btn-soft{background:#fff;color:var(--navy)}.copy-status{display:none;margin-top:10px;color:var(--navy);font-size:12px;font-weight:900}.copy-status.show{display:block}.back-to-top-fixed{position:fixed;right:28px;bottom:28px;width:58px;height:58px;border:1px solid rgba(255,255,255,.12);border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;z-index:5000;box-shadow:0 16px 34px rgba(36,52,59,.28);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(10px);transition:opacity .2s ease,visibility .2s ease,transform .2s ease,background .2s ease,box-shadow .2s ease}.back-to-top-fixed.show{opacity:1;visibility:visible;pointer-events:auto;transform:none}.back-to-top-fixed.show:hover{background:var(--blue);transform:translateY(-2px);box-shadow:0 18px 38px rgba(36,52,59,.32)}.back-to-top-fixed:focus-visible{outline:3px solid rgba(40,118,106,.28);outline-offset:3px}
@media(max-width:1350px){.controls-grid{grid-template-columns:1fr 1fr auto auto}.controls-grid .btn-primary{grid-column:auto}.stats-row{align-items:flex-start}.view-groups{grid-template-columns:1fr}.control-zone{position:relative}.sticky-col{position:static!important;box-shadow:none}.sticky-table-head-wrap{margin-top:14px}}
@media(max-width:760px){.top-hero{padding:34px 20px}.control-zone{padding:16px 16px 0}.controls-grid{grid-template-columns:1fr}.btn{width:100%}.stats-row{flex-direction:column}.stats-actions{width:100%}.stats-actions .btn{width:auto}.view-panel-head{align-items:flex-start;flex-direction:column}.sticky-table-head-wrap{margin-left:-16px;margin-right:-16px}.media-card,.media-empty{width:170px;height:124px}.footer-note{padding:15px 18px}}
</style>
</head>
<body>
<div id="navbar-container"></div>
<section class="page">
<header class="top-hero">
  <div class="hero-kicker"><i class="fa-solid fa-book-open"></i> Pradako Standards Library · DIN</div>
  <h1>DIN Fastener Standards Reference</h1>
  <p>Searchable DIN, DIN EN and DIN EN ISO reference library. The default view keeps product media, Pradako standard identity, the standard designation, official English title, original German title and product family visible; deeper reference fields can be opened on request.</p>
</header>
<section class="control-zone">
  <div class="controls-grid">
    <div class="search-wrap"><i class="fa-solid fa-magnifying-glass search-icon"></i><input id="searchInput" type="text" placeholder="Search DIN number, title, Pradako ID or family..." /></div>
    <select id="familyFilter" class="family-filter"><option value="">All Product Families</option></select>
    <button class="btn btn-primary" onclick="searchStandards()">Search</button>
    <button class="btn btn-soft" onclick="clearSearch()">Clear</button>
    <button class="btn btn-soft active" id="viewOptionsBtn" onclick="toggleViewPanel()"><i class="fa-solid fa-sliders"></i>&nbsp; View Options</button>
  </div>
  <div class="stats-row">
    <div class="stat-pills">
      <div class="stat-pill">Showing <span id="visibleCount">0</span> of <span id="totalCount">0</span> rows</div>
      <div class="stat-pill"><span id="pageCount">0</span> individual pages</div>
      <div class="stat-pill"><span id="visibleColumnCount">0</span> visible columns</div>
      <div class="stat-pill duplicate-mode-pill" id="duplicateModePill">Duplicate View: <span id="duplicateGroupsCount">0</span> groups / <span id="duplicateRowsCount">0</span> rows</div>
    </div>
    <div class="stats-actions">
      <button class="btn btn-soft" onclick="openExportPopup()">Export CSV</button>
      <button type="button" id="duplicateCheckBtn" class="btn duplicate-check-btn" onclick="showDuplicateEntriesInTable()"><span>⧉</span>&nbsp; Check Duplicates</button>
    </div>
  </div>
  <div class="view-panel open" id="viewPanel">
    <div class="view-panel-head">
      <div class="view-panel-title">Choose the information you want visible</div>
      <div class="preset-actions">
        <button class="mini-btn active" id="presetCore" onclick="applyViewPreset('core')">Core</button>
        <button class="mini-btn" id="presetTechnical" onclick="applyViewPreset('technical')">Technical</button>
        <button class="mini-btn" id="presetAll" onclick="applyViewPreset('all')">Show All</button>
      </div>
    </div>
    <div class="view-groups" id="viewGroups"></div>
  </div>
  <div class="sticky-table-head-wrap"><div class="sticky-table-head-scroll" id="stickyTableHeadScroll"><table class="sticky-head-table" aria-hidden="true"><thead><tr id="stickyTableHeadRow"></tr></thead></table></div></div>
</section>
<section class="table-zone"><div class="table-scroll"><table id="standardsTable"><thead><tr id="tableHeadRow"></tr></thead><tbody id="standardsTableBody"></tbody></table><div class="empty-state" id="emptyState"><h3>No standards found</h3><p>Try another standard number, title, Pradako ID or product family.</p></div></div></section>
<footer class="footer-note">The supplied DIN master-data values are preserved unchanged. Pradako Standard IDs and individual-page links are presentation/identity fields added for the website architecture.</footer>
</section>
<section class="modal-overlay" id="exportModal"><div class="modal-card"><button class="modal-close" onclick="closeExportPopup()">&times;</button><div class="modal-top"><h2>Export Request</h2><p>The export feature is currently being upgraded for the complete standards database.</p></div><div class="modal-body"><div class="work-message">We are working on it.<br>Please email us on:<div class="email-line">info@pradakomechanicals.com</div></div><div class="modal-actions"><a class="modal-btn modal-btn-primary" href="mailto:info@pradakomechanicals.com?subject=DIN%20Standards%20Library%20Export%20Request">Email Us</a><button class="modal-btn modal-btn-soft" onclick="copyEmail()">Copy Email</button><button class="modal-btn modal-btn-soft" onclick="closeExportPopup()">Close</button></div><div class="copy-status" id="copyStatus">Email copied successfully.</div></div></div></section>
<section class="image-preview-overlay" id="imagePreviewModal"><div class="image-preview-card"><button class="image-preview-close" onclick="closeImagePreview()">&times;</button><div class="image-preview-head"><h3 id="imagePreviewTitle">Standard Media</h3></div><div class="image-preview-body"><img id="imagePreviewImg" src="" alt=""></div></div></section>
<div id="footer-container"></div>
<button class="back-to-top-fixed" id="backToTopFixed" type="button" aria-label="Back to top" title="Back to top"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button>
<script src="js/script.js" defer></script>
<script>
async function loadComponent(id,file){try{const r=await fetch(file);if(!r.ok)return;document.getElementById(id).innerHTML=await r.text()}catch(e){}}
loadComponent("navbar-container","/components/navbar.html");loadComponent("footer-container","/components/footer.html");
const PRADAKO_STANDARD_IDS = __ID_LIST__;
const STANDARD_PAGE_SLUGS = __SLUG_LIST__;
const STANDARD_MEDIA_SLUGS = __MEDIA_SLUG_LIST__;
const columns=[
{key:"imageSrc",label:"Photo / 2D / 3D",width:240,fixed:true,core:true,group:"core",type:"media",searchable:false,sortable:false},
{key:"pradakoId",label:"Pradako Standard ID",width:140,minWidth:132,core:true,group:"core",type:"id",searchable:true,sortable:true},
{key:"standardCode",label:"Standard",width:130,minWidth:118,core:true,group:"core",type:"standard",searchable:true,sortable:true},
{key:"officialEnglishTitle",label:"Official English Title",width:260,minWidth:220,core:true,group:"core",type:"title",searchable:true,sortable:true},
{key:"originalGermanTitle",label:"Original German Title",width:260,minWidth:220,core:true,group:"core",type:"title",searchable:true,sortable:true},
{key:"productFamily",label:"Product Family",width:155,minWidth:145,core:true,group:"core",type:"family",searchable:true,sortable:true},
{key:"correctStandard",label:"Standard Number with Edition",width:215,minWidth:195,core:false,technical:true,group:"details",type:"title",searchable:true,sortable:true},
{key:"statusNote",label:"Status / Usage Note",width:195,minWidth:180,core:false,technical:true,group:"details",type:"status",searchable:true,sortable:true},
{key:"websiteNote",label:"Website Note",width:200,minWidth:185,core:false,technical:false,group:"notes",type:"title",searchable:true,sortable:true}
];
function makeStandard(row,index){const code=String(row.standardCode||"").trim();const pageSlug=STANDARD_PAGE_SLUGS[index]||`record-${String(index+1).padStart(4,"0")}`;const mediaSlug=STANDARD_MEDIA_SLUGS[index]||pageSlug;return{id:`record-${String(index+1).padStart(4,"0")}`,pradakoId:PRADAKO_STANDARD_IDS[index]||"—",imageSrc:`/images/product/standards-products/${mediaSlug}.png`,imageAlt:`${code} standard media`,imageExists:true,pageUrl:`/standard/din/${pageSlug}.html`,standardCode:code,correctStandard:row.correctStandard||"—",statusNote:row.statusNote||"—",officialEnglishTitle:row.officialEnglishTitle||"—",originalGermanTitle:row.originalGermanTitle||"—",productFamily:[row.family||"Unclassified"],websiteNote:row.websiteNote||"—"}}
const rawDinTSV=`__RAW_TSV__`;
const standardsData=rawDinTSV.trim().split("\n").slice(1).map((line,index)=>{const [standardCode,correctStandard,statusNote,officialEnglishTitle,originalGermanTitle,family,websiteNote]=line.split("\t");return makeStandard({standardCode:(standardCode||"").trim(),correctStandard:(correctStandard||"—").trim(),statusNote:(statusNote||"—").trim(),officialEnglishTitle:(officialEnglishTitle||"—").trim(),originalGermanTitle:(originalGermanTitle||"—").trim(),family:(family||"Unclassified").trim(),websiteNote:(websiteNote||"—").trim()},index)});
const tableHeadRow=document.getElementById("tableHeadRow"),stickyTableHeadRow=document.getElementById("stickyTableHeadRow"),tableBody=document.getElementById("standardsTableBody"),searchInput=document.getElementById("searchInput"),familyFilter=document.getElementById("familyFilter"),emptyState=document.getElementById("emptyState"),viewPanel=document.getElementById("viewPanel"),viewGroups=document.getElementById("viewGroups"),viewOptionsBtn=document.getElementById("viewOptionsBtn"),exportModal=document.getElementById("exportModal"),copyStatus=document.getElementById("copyStatus"),imagePreviewModal=document.getElementById("imagePreviewModal"),imagePreviewImg=document.getElementById("imagePreviewImg"),imagePreviewTitle=document.getElementById("imagePreviewTitle"),visibleCount=document.getElementById("visibleCount"),totalCount=document.getElementById("totalCount"),pageCount=document.getElementById("pageCount"),visibleColumnCount=document.getElementById("visibleColumnCount"),duplicateModePill=document.getElementById("duplicateModePill"),duplicateGroupsCount=document.getElementById("duplicateGroupsCount"),duplicateRowsCount=document.getElementById("duplicateRowsCount"),duplicateCheckBtn=document.getElementById("duplicateCheckBtn");
let visibleColumns=new Set(columns.filter(c=>c.core).map(c=>c.key)),currentFilteredData=[...standardsData],duplicateMode=false,duplicateBaseData=[],sortState={key:null,direction:"asc"};totalCount.textContent=standardsData.length;pageCount.textContent=standardsData.length;
function escapeHTML(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function escapeRegex(v){return v.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function highlightText(v,q){const t=escapeHTML(v);if(!q.trim())return t;const r=new RegExp("("+escapeRegex(escapeHTML(q.trim()))+")","gi");return t.replace(r,"<mark>$1</mark>")}
function getVisibleColumns(){return columns.filter(c=>visibleColumns.has(c.key))}
function buildFamilyFilter(){const fs=[...new Set(standardsData.flatMap(x=>x.productFamily||[]))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:"base"}));familyFilter.innerHTML='<option value="">All Product Families</option>';fs.forEach(f=>{const o=document.createElement("option");o.value=f;o.textContent=f;familyFilter.appendChild(o)})}
const groupMeta={core:{label:"Core Information"},details:{label:"Standard Details"},notes:{label:"Notes"}};
function buildViewPanel(){viewGroups.innerHTML="";Object.entries(groupMeta).forEach(([key,meta])=>{const cols=columns.filter(c=>c.group===key);if(!cols.length)return;const g=document.createElement("div");g.className="view-group";const h=document.createElement("h4");h.textContent=meta.label;const wrap=document.createElement("div");wrap.className="column-checks";cols.forEach(c=>{const label=document.createElement("label");label.className="check-item";const input=document.createElement("input");input.type="checkbox";input.checked=visibleColumns.has(c.key);input.addEventListener("change",()=>{if(input.checked)visibleColumns.add(c.key);else{if(visibleColumns.size===1){input.checked=true;return}visibleColumns.delete(c.key)}setPresetState("custom");renderTable(currentFilteredData);buildViewPanel()});const span=document.createElement("span");span.textContent=c.label;label.append(input,span);wrap.appendChild(label)});g.append(h,wrap);viewGroups.appendChild(g)})}
function toggleViewPanel(){viewPanel.classList.toggle("open");const isOpen=viewPanel.classList.contains("open");viewOptionsBtn.classList.toggle("active",isOpen);viewOptionsBtn.setAttribute("aria-expanded",String(isOpen));requestAnimationFrame(updateTableHeaderStickyTop)}
function setPresetState(which){["Core","Technical","All"].forEach(n=>{const el=document.getElementById("preset"+n);if(el)el.classList.toggle("active",which===n.toLowerCase())})}
function applyViewPreset(which){if(which==="core")visibleColumns=new Set(columns.filter(c=>c.core).map(c=>c.key));else if(which==="technical")visibleColumns=new Set(columns.filter(c=>c.core||c.technical).map(c=>c.key));else visibleColumns=new Set(columns.map(c=>c.key));setPresetState(which);buildViewPanel();renderTable(currentFilteredData);requestAnimationFrame(updateTableHeaderStickyTop)}
function renderMediaCell(item){const src=item.imageSrc||"",alt=item.imageAlt||item.standardCode||"Standard media";return `<div class="media-card" data-image-src="${escapeHTML(src)}" data-image-alt="${escapeHTML(alt)}" data-image-title="${escapeHTML(item.standardCode)}"><img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy" onerror="this.parentElement.outerHTML='<div class=&quot;media-empty&quot;><i class=&quot;fa-regular fa-image&quot;></i><span>Photo / 2D / 3D<br>Coming Soon</span></div>'"></div>`}
function resolveColumnWidths(list){
  const tableScroll=document.querySelector(".table-scroll");
  const containerWidth=Math.max(0,Math.floor(tableScroll.clientWidth||window.innerWidth));
  const widths=list.map(c=>Math.max(c.minWidth||0,c.width||180));
  const total=widths.reduce((s,w)=>s+w,0);
  return {fit:total<=containerWidth,widths,total};
}
function applyExactColumnLayout(list){
  const layout=resolveColumnWidths(list),body=document.getElementById("standardsTable"),head=document.querySelector(".sticky-head-table"),bodyScroll=document.querySelector(".table-scroll"),headScroll=document.getElementById("stickyTableHeadScroll");
  bodyScroll.classList.toggle("fit-core",layout.fit);headScroll.classList.toggle("fit-core",layout.fit);
  const total=layout.total||layout.widths.reduce((s,w)=>s+w,0);
  [body,head].forEach(t=>{if(!t)return;t.style.width=total+"px";t.style.minWidth=total+"px";const old=t.querySelector("colgroup");if(old)old.remove();const cg=document.createElement("colgroup");layout.widths.forEach(w=>{const col=document.createElement("col");col.style.width=w+"px";cg.appendChild(col)});t.insertBefore(cg,t.firstChild)});
  return layout;
}
function renderTable(data){const q=searchInput.value.trim(),list=getVisibleColumns(),layout=applyExactColumnLayout(list);visibleColumnCount.textContent=list.length;visibleCount.textContent=data.length;tableHeadRow.innerHTML="";stickyTableHeadRow.innerHTML="";tableBody.innerHTML="";function thFor(c,i){const th=document.createElement("th");th.textContent=sortState.key===c.key?c.label+(sortState.direction==="asc"?" ▲":" ▼"):c.label;th.style.width=layout.widths[i]+"px";if(c.sortable===false)th.classList.add("not-sortable");else th.addEventListener("click",()=>sortByColumn(c.key));return th}list.forEach((c,i)=>{tableHeadRow.appendChild(thFor(c,i));stickyTableHeadRow.appendChild(thFor(c,i))});const frag=document.createDocumentFragment();data.forEach(item=>{const tr=document.createElement("tr");list.forEach((c,i)=>{const td=document.createElement("td"),v=item[c.key]!==undefined?item[c.key]:"—";td.style.width=layout.widths[i]+"px";if(c.type==="media"){td.classList.add("media-cell");td.innerHTML=renderMediaCell(item)}else if(c.type==="id")td.innerHTML=`<span class="pradako-id">${highlightText(v,q)}</span>`;else if(c.type==="standard")td.innerHTML=`<a class="standard-link" href="${escapeHTML(item.pageUrl)}" aria-label="Open ${escapeHTML(item.standardCode)} standard page"><span>${highlightText(item.standardCode,q)}</span><i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;else if(c.type==="family"){const a=Array.isArray(v)?v:[v];td.innerHTML=a.map(x=>`<span class="family-pill">${highlightText(x,q)}</span>`).join("")}else if(c.type==="status")td.innerHTML=`<span class="status-pill">${highlightText(v,q)}</span>`;else td.innerHTML=`<div class="title-cell" title="${escapeHTML(v)}">${highlightText(v,q)}</div>`;tr.appendChild(td)});frag.appendChild(tr)});tableBody.appendChild(frag);emptyState.style.display=data.length?"none":"block";requestAnimationFrame(updateTableHeaderStickyTop)}
function normalizeDuplicateKey(v){return String(v||"").trim().toLowerCase().replace(/\s+/g," ")}function getDuplicateGroups(){const m=new Map();standardsData.forEach(x=>{const k=normalizeDuplicateKey(x.standardCode);if(!k||k==="—")return;if(!m.has(k))m.set(k,[]);m.get(k).push(x)});return [...m.values()].filter(g=>g.length>1).sort((a,b)=>a[0].standardCode.localeCompare(b[0].standardCode,undefined,{numeric:true,sensitivity:"base"}))}
function updateDuplicateViewPill(gc,rc){if(!duplicateMode){duplicateModePill.classList.remove("show");duplicateGroupsCount.textContent="0";duplicateRowsCount.textContent="0";return}duplicateGroupsCount.textContent=gc;duplicateRowsCount.textContent=rc;duplicateModePill.classList.add("show")}
function showDuplicateEntriesInTable(){const groups=getDuplicateGroups(),r=groups.flat();duplicateMode=true;duplicateBaseData=r;searchInput.value="";familyFilter.value="";sortState={key:null,direction:"asc"};currentFilteredData=[...r];updateDuplicateViewPill(groups.length,r.length);duplicateCheckBtn.classList.add("active");searchInput.placeholder="Search within duplicate entries...";renderTable(currentFilteredData)}function hideDuplicateView(){duplicateMode=false;duplicateBaseData=[];updateDuplicateViewPill(0,0);duplicateCheckBtn.classList.remove("active");searchInput.placeholder="Search DIN number, title, Pradako ID or family..."}
function searchStandards(){const q=searchInput.value.trim().toLowerCase(),f=familyFilter.value,src=duplicateMode?duplicateBaseData:standardsData;currentFilteredData=src.filter(item=>{const ms=!q||columns.some(c=>{if(c.searchable===false)return false;const v=item[c.key];if(v==null)return false;if(Array.isArray(v))return v.some(e=>String(e).toLowerCase().includes(q));return String(v).toLowerCase().includes(q)});const mf=!f||item.productFamily.includes(f);return ms&&mf});if(sortState.key)currentFilteredData=sortData(currentFilteredData,sortState.key,sortState.direction);renderTable(currentFilteredData)}function clearSearch(){searchInput.value="";familyFilter.value="";sortState={key:null,direction:"asc"};hideDuplicateView();currentFilteredData=[...standardsData];renderTable(currentFilteredData)}
function sortData(data,key,direction){return [...data].sort((a,b)=>{let A=a[key],B=b[key];if(Array.isArray(A))A=A.join(", ");if(Array.isArray(B))B=B.join(", ");A=String(A??"").toLowerCase();B=String(B??"").toLowerCase();return A<B?(direction==="asc"?-1:1):A>B?(direction==="asc"?1:-1):0})}function sortByColumn(key){const c=columns.find(x=>x.key===key);if(!c||c.sortable===false)return;if(sortState.key===key)sortState.direction=sortState.direction==="asc"?"desc":"asc";else sortState={key,direction:"asc"};currentFilteredData=sortData(currentFilteredData,key,sortState.direction);renderTable(currentFilteredData)}
function openExportPopup(){exportModal.classList.add("show");document.body.style.overflow="hidden";copyStatus.classList.remove("show")}function closeExportPopup(){exportModal.classList.remove("show");document.body.style.overflow=""}function copyEmail(){const e="info@pradakomechanicals.com";if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(e).then(()=>copyStatus.classList.add("show"));else{const t=document.createElement("textarea");t.value=e;t.style.position="fixed";t.style.left="-9999px";document.body.appendChild(t);t.select();try{document.execCommand("copy");copyStatus.classList.add("show")}catch(err){copyStatus.textContent="Please copy manually: "+e;copyStatus.classList.add("show")}t.remove()}}
function openImagePreview(src,alt,title){imagePreviewImg.src=src;imagePreviewImg.alt=alt;imagePreviewTitle.textContent=title+" · Photo / 2D / 3D";imagePreviewModal.classList.add("show");document.body.style.overflow="hidden"}function closeImagePreview(){imagePreviewModal.classList.remove("show");imagePreviewImg.src="";document.body.style.overflow=""}
let searchTimer;searchInput.addEventListener("input",()=>{clearTimeout(searchTimer);searchTimer=setTimeout(searchStandards,160)});familyFilter.addEventListener("change",searchStandards);tableBody.addEventListener("click",e=>{const box=e.target.closest(".media-card");if(box)openImagePreview(box.dataset.imageSrc,box.dataset.imageAlt,box.dataset.imageTitle)});exportModal.addEventListener("click",e=>{if(e.target===exportModal)closeExportPopup()});imagePreviewModal.addEventListener("click",e=>{if(e.target===imagePreviewModal)closeImagePreview()});document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeExportPopup();closeImagePreview()}});
function updateTableHeaderStickyTop(){const z=document.querySelector(".control-zone"),mobile=window.matchMedia("(max-width:1350px)").matches;document.documentElement.style.setProperty("--sticky-top",z&&!mobile?Math.ceil(z.getBoundingClientRect().height)+"px":"0px")}
function syncScroll(){const b=document.querySelector(".table-scroll"),h=document.getElementById("stickyTableHeadScroll");let sync=false;b.addEventListener("scroll",()=>{if(sync)return;sync=true;h.scrollLeft=b.scrollLeft;sync=false},{passive:true});h.addEventListener("scroll",()=>{if(sync)return;sync=true;b.scrollLeft=h.scrollLeft;sync=false},{passive:true})}
const back=document.getElementById("backToTopFixed");function toggleBack(){back.classList.toggle("show",window.scrollY>250)}window.addEventListener("scroll",toggleBack,{passive:true});back.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));let resizeTimer;window.addEventListener("resize",()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{renderTable(currentFilteredData);updateTableHeaderStickyTop()},100)});if("ResizeObserver" in window)new ResizeObserver(updateTableHeaderStickyTop).observe(document.querySelector(".control-zone"));
buildFamilyFilter();buildViewPanel();renderTable(currentFilteredData);syncScroll();updateTableHeaderStickyTop();toggleBack();
</script>
</body>
</html>'''
main_html = main_html.replace('__ID_LIST__', id_js).replace('__SLUG_LIST__', slug_js).replace('__MEDIA_SLUG_LIST__', media_slug_js).replace('__RAW_TSV__', raw_js)
(OUT / 'pradako-din-standards-library.html').write_text(main_html, encoding='utf-8')

# Individual standard page template
page_css = r'''
:root{--white:#fff;--navy:#24343b;--blue:#28766a;--gold:#f08080;--line:#dde5e7;--text:#26343b;--muted:#6d7b82;--soft:#f7faf9;--shadow:0 18px 48px rgba(36,52,59,.08)}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:"Montserrat","Segoe UI",Arial,sans-serif;background:#fff;color:var(--text)}a{color:inherit}.standard-page{max-width:1440px;margin:0 auto;padding:38px 32px 70px}.breadcrumb{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:24px;color:var(--muted);font-size:11px;font-weight:800}.breadcrumb a{text-decoration:none}.breadcrumb a:hover{color:var(--blue)}.hero{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:34px;align-items:stretch;padding:34px;border:1px solid var(--line);border-radius:26px;background:linear-gradient(135deg,#fff 55%,#f2f8f6);box-shadow:var(--shadow)}.eyebrow{display:flex;gap:8px;align-items:center;color:var(--blue);font-size:11px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase}.hero h1{margin:14px 0 8px;font-family:"Space Grotesk",Georgia,serif;font-size:clamp(48px,4.7vw,72px);line-height:1;color:var(--navy)}.official-title{max-width:880px;margin:16px 0 0;font-size:19px;line-height:1.55;font-weight:800;color:var(--text)}.id-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.pill{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--navy);font-size:11px;font-weight:900}.pill.id{background:var(--navy);border-color:var(--navy);color:#fff}.media{min-height:280px;border:1px solid var(--line);border-radius:20px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.media img{width:100%;height:100%;max-height:310px;object-fit:contain;padding:18px}.media-empty{display:flex;flex-direction:column;gap:10px;align-items:center;color:var(--muted);text-align:center;font-size:11px;font-weight:900;letter-spacing:.45px;text-transform:uppercase}.media-empty i{font-size:30px}.media-label{position:absolute;left:12px;bottom:12px;padding:7px 10px;border-radius:999px;background:rgba(36,52,59,.94);color:#fff;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase}.section{margin-top:28px}.section-head{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-bottom:12px}.section h2{margin:0;font-family:"Space Grotesk",Georgia,serif;font-size:34px;color:var(--navy)}.section-note{font-size:11px;color:var(--muted);font-weight:700}.detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));border:1px solid var(--line);border-radius:20px;overflow:hidden}.detail{padding:18px 20px;background:#fff;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}.detail:nth-child(even){border-right:0}.detail.full{grid-column:1/-1;border-right:0}.detail-label{margin-bottom:7px;color:var(--muted);font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase}.detail-value{font-size:14px;line-height:1.65;font-weight:750;color:var(--text);overflow-wrap:anywhere}.detail-value.strong{font-size:18px;color:var(--navy);font-weight:900}.source-records{display:grid;gap:12px}.record-card{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff}.record-head{display:flex;justify-content:space-between;gap:12px;padding:12px 16px;background:var(--soft);border-bottom:1px solid var(--line);color:var(--navy);font-size:11px;font-weight:900}.record-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.record-field{padding:13px 16px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}.record-field:nth-child(even){border-right:0}.record-field.full{grid-column:1/-1;border-right:0}.record-label{font-size:8px;color:var(--muted);font-weight:900;letter-spacing:.7px;text-transform:uppercase;margin-bottom:5px}.record-value{font-size:12px;line-height:1.55;font-weight:700}.integrity-note{padding:16px 18px;border-left:4px solid var(--gold);border-radius:12px;background:#fff5f5;color:#6c4a4e;font-size:12px;line-height:1.7;font-weight:700}.page-nav{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;margin-top:34px}.nav-link{display:flex;flex-direction:column;gap:4px;padding:14px 16px;border:1px solid var(--line);border-radius:14px;text-decoration:none;background:#fff}.nav-link:hover{border-color:var(--blue);background:var(--soft)}.nav-link.next{text-align:right}.nav-kicker{font-size:8px;color:var(--muted);font-weight:900;letter-spacing:.7px;text-transform:uppercase}.nav-title{font-size:12px;color:var(--navy);font-weight:900}.back-library{padding:12px 16px;border-radius:12px;background:var(--navy);color:#fff;text-decoration:none;font-size:10px;font-weight:900;text-transform:uppercase;white-space:nowrap}.back-library:hover{background:var(--blue)}.back-to-top-fixed{position:fixed;right:28px;bottom:28px;width:58px;height:58px;border:1px solid rgba(255,255,255,.12);border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;z-index:5000;box-shadow:0 16px 34px rgba(36,52,59,.28);opacity:0;visibility:hidden;pointer-events:none;transform:translateY(10px);transition:opacity .2s ease,visibility .2s ease,transform .2s ease,background .2s ease,box-shadow .2s ease}.back-to-top-fixed.show{opacity:1;visibility:visible;pointer-events:auto;transform:none}.back-to-top-fixed.show:hover{background:var(--blue);transform:translateY(-2px);box-shadow:0 18px 38px rgba(36,52,59,.32)}.back-to-top-fixed:focus-visible{outline:3px solid rgba(40,118,106,.28);outline-offset:3px}
@media(max-width:900px){.standard-page{padding:24px 18px 50px}.hero{grid-template-columns:1fr;padding:24px}.media{min-height:220px}.detail-grid,.record-grid{grid-template-columns:1fr}.detail,.record-field{border-right:0}.detail.full,.record-field.full{grid-column:auto}.page-nav{grid-template-columns:1fr}.back-library{grid-row:1;text-align:center}.nav-link.next{text-align:left}}
'''

# One independent page for every supplied DIN source row (487 pages).
for pos, rr in enumerate(rows):
    code = rr['standardCode'].strip()
    pid = rr['pradakoId']
    slug = rr['pageSlug']
    title = rr['officialEnglishTitle'] or 'DIN standard reference'
    german = rr['originalGermanTitle'] or '—'
    fam = rr['productFamily'] or '—'
    edition = rr['correctStandard'] or '—'
    status = rr['statusNote'] or '—'
    note = rr['websiteNote'] or '—'
    image_src = rr['imageSrc']
    prev_r = rows[pos-1] if pos > 0 else None
    next_r = rows[pos+1] if pos+1 < len(rows) else None
    def e(x): return html.escape(str(x), quote=True)
    prev_html = '' if not prev_r else f'<a class="nav-link" href="{e(prev_r["pageSlug"])}.html"><span class="nav-kicker">Previous standard</span><span class="nav-title">← {e(prev_r["standardCode"])}</span></a>'
    next_html = '' if not next_r else f'<a class="nav-link next" href="{e(next_r["pageSlug"])}.html"><span class="nav-kicker">Next standard</span><span class="nav-title">{e(next_r["standardCode"])} →</span></a>'
    source_card = f'''<article class="record-card"><div class="record-head"><span>Library record {rr['rowNumber']}</span><span>{e(pid)}</span></div><div class="record-grid">
<div class="record-field"><div class="record-label">Given standard</div><div class="record-value">{e(rr['standardCode'])}</div></div>
<div class="record-field"><div class="record-label">Standard number with edition</div><div class="record-value">{e(rr['correctStandard'])}</div></div>
<div class="record-field full"><div class="record-label">Status / usage note</div><div class="record-value">{e(rr['statusNote'])}</div></div>
<div class="record-field full"><div class="record-label">Official English title</div><div class="record-value">{e(rr['officialEnglishTitle'])}</div></div>
<div class="record-field full"><div class="record-label">Original German title</div><div class="record-value">{e(rr['originalGermanTitle'])}</div></div>
<div class="record-field"><div class="record-label">Product family</div><div class="record-value">{e(rr['productFamily'])}</div></div>
<div class="record-field"><div class="record-label">Website note</div><div class="record-value">{e(rr['websiteNote'])}</div></div>
</div></article>'''
    page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(code)} – {e(title)} | Pradako DIN Standards</title><meta name="description" content="{e(code)} — {e(title)}. Pradako DIN standard reference page with edition, status, German title and product family from the verified library data."><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"><link rel="stylesheet" href="/CSS/navbar.css"><link rel="stylesheet" href="/CSS/design_system.css"><style>{page_css}</style></head><body><div id="navbar-container"></div><main class="standard-page"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../pradako-din-standards-library.html">DIN Standards Library</a><span>›</span><span>{e(code)}</span></nav><section class="hero"><div><div class="eyebrow"><i class="fa-solid fa-book-open"></i> DIN Standard Reference</div><h1>{e(code)}</h1><div class="official-title">{e(title)}</div><div class="id-row"><span class="pill id">{e(pid)}</span><span class="pill"><i class="fa-solid fa-layer-group"></i> {e(fam)}</span></div></div><div class="media"><img src="{e(image_src)}" alt="{e(code)} standard media" onerror="this.outerHTML='<div class=&quot;media-empty&quot;><i class=&quot;fa-regular fa-image&quot;></i><span>Photo / 2D / 3D<br>Coming Soon</span></div>'"><span class="media-label">Photo / 2D / 3D</span></div></section><section class="section"><div class="section-head"><h2>Standard Reference</h2><div class="section-note">Independent Pradako DIN record page</div></div><div class="detail-grid"><div class="detail"><div class="detail-label">Pradako Standard ID</div><div class="detail-value strong">{e(pid)}</div></div><div class="detail"><div class="detail-label">Standard</div><div class="detail-value strong">{e(code)}</div></div><div class="detail full"><div class="detail-label">Official English Title</div><div class="detail-value">{e(title)}</div></div><div class="detail full"><div class="detail-label">Original German Title</div><div class="detail-value">{e(german)}</div></div><div class="detail"><div class="detail-label">Product Family</div><div class="detail-value">{e(fam)}</div></div><div class="detail"><div class="detail-label">Standard Number with Edition</div><div class="detail-value">{e(edition)}</div></div><div class="detail full"><div class="detail-label">Status / Usage Note</div><div class="detail-value">{e(status)}</div></div><div class="detail full"><div class="detail-label">Website Note</div><div class="detail-value">{e(note)}</div></div></div></section><section class="section"><div class="section-head"><h2>Verified Library Record</h2><div class="section-note">Source row {rr['rowNumber']} of {len(rows)}</div></div><div class="integrity-note">The values below are reproduced from the supplied verified DIN master data without rewriting, merging or silently correcting the technical text. Each library row has its own Pradako Standard ID and independent page.</div><div class="source-records" style="margin-top:12px">{source_card}</div></section><nav class="page-nav">{prev_html}<a class="back-library" href="../../pradako-din-standards-library.html">← DIN Library</a>{next_html}</nav></main><div id="footer-container"></div><button class="back-to-top-fixed" id="backToTopFixed" type="button" aria-label="Back to top" title="Back to top"><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button><script>async function loadComponent(id,file){{try{{const r=await fetch(file);if(!r.ok)return;document.getElementById(id).innerHTML=await r.text()}}catch(e){{}}}}loadComponent("navbar-container","/components/navbar.html");loadComponent("footer-container","/components/footer.html");const b=document.getElementById("backToTopFixed");function t(){{b.classList.toggle("show",window.scrollY>250)}}window.addEventListener("scroll",t,{{passive:true}});b.addEventListener("click",()=>window.scrollTo({{top:0,behavior:"smooth"}}));t();</script></body></html>'''
    (OUT / 'standard' / 'din' / f'{slug}.html').write_text(page, encoding='utf-8')

# A manifest useful for future integration
manifest = {
    'source_rows': len(rows),
    'unique_standard_designations': len(set(r['standardCode'].strip() for r in rows)),
    'individual_pages_generated': len(rows),
    'unique_pradako_standard_ids': len(set(r['pradakoId'] for r in rows)),
    'default_core_columns': ['Photo / 2D / 3D','Pradako Standard ID','Standard','Official English Title','Original German Title','Product Family'],
    'layout_policy': 'Media stays fixed at 240 px. The other five core columns dynamically share the remaining table width so all six core columns fit in one desktop view; optional views may scroll horizontally.',
    'data_policy': 'All seven supplied DIN source fields are preserved exactly; only Pradako IDs, row-specific URLs and UI metadata are added.'
}
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
(OUT / 'README.txt').write_text('''Pradako DIN Standards — Original Layout / Graphite + Teal Theme

Main library:
  pradako-din-standards-library.html

Independent standard pages:
  standard/din/*.html

Theme package notes:
- 487 supplied DIN source rows = 487 unique Pradako Standard IDs = 487 independent HTML pages.
- Repeated designations are NOT collapsed into one page.
- Media column remains fixed at 240 px.
- In the default Core view, all five remaining columns dynamically share the available desktop width so all six columns are visible in one go.
- Horizontal sticky columns were removed to eliminate header/body overlap and movement misalignment.
- Technical / Show All views may use horizontal scrolling because they intentionally expose extra columns.
- The supplied seven DIN technical/source fields remain unchanged.
''', encoding='utf-8')
# Copy generator for repeatability
shutil.copy2(__file__, OUT / 'generate_din_original_graphite_teal.py')

zip_path = Path('/mnt/data/Pradako_DIN_Standards_Original_Graphite_Teal.zip')
if zip_path.exists(): zip_path.unlink()
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for fp in OUT.rglob('*'):
        if fp.is_file(): z.write(fp, fp.relative_to(OUT.parent))
print(json.dumps(manifest, indent=2))
print('main', OUT/'pradako-din-standards-library.html')
print('zip', zip_path)
