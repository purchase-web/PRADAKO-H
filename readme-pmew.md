# PRADAKO / PMEW Website

> **Pradako Mechanical & Engineering Works (PMEW)**  
> Engineering Trust · Excellence Since 1960

This repository contains the frontend architecture, standards library, product pages, shared components, data, SEO layer, technical assets, and development resources for the PMEW website.

The purpose of this README is to serve as the **primary operating manual and developer handoff document** for the project.

---

# Read This First

Before changing anything in the website, follow these rules:

1. **`public/` is the web/document root.**
2. **Never include `/public/` in browser URLs or runtime paths.**
3. Use root-relative paths such as:
   - `/assets/...`
   - `/components/...`
   - `/pages/...`
4. Do not change Standards routing, slug logic, or folder architecture without testing.
5. **`pradako.co` is NOT the final production domain.**
6. Do not delete files simply because they appear unused; audit references first.
7. Do not fabricate technical Standards content or missing product images.
8. Preserve the current homepage hero/banner system unless a deliberate redesign is approved.

---

# Table of Contents

1. [Project Overview](#1-project-overview)
2. [Quick Start](#2-quick-start)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Canonical Runtime Paths](#4-canonical-runtime-paths)
5. [Shared Navbar and Footer](#5-shared-navbar-and-footer)
6. [Brand Assets and Favicon](#6-brand-assets-and-favicon)
7. [Design System](#7-design-system)
8. [Homepage Rules](#8-homepage-rules)
9. [Product Pages](#9-product-pages)
10. [Standards Library Architecture](#10-standards-library-architecture)
11. [Universal Standard Navigation](#11-universal-standard-navigation)
12. [Reference In Preparation Page](#12-reference-in-preparation-page)
13. [Standard Page Naming Rules](#13-standard-page-naming-rules)
14. [Cross-Reference System](#14-cross-reference-system)
15. [Images and Media](#15-images-and-media)
16. [SEO Architecture](#16-seo-architecture)
17. [Production Domain](#17-production-domain)
18. [Internal Linking Rules](#18-internal-linking-rules)
19. [Redirects](#19-redirects)
20. [Backend-Dependent Features](#20-backend-dependent-features)
21. [Forms and API Endpoints](#21-forms-and-api-endpoints)
22. [Development-Only and Archived Files](#22-development-only-and-archived-files)
23. [Files That Must Not Be Deleted Without Audit](#23-files-that-must-not-be-deleted-without-audit)
24. [Known Empty, Fragment, and Special Files](#24-known-empty-fragment-and-special-files)
25. [Technical Standards Verification](#25-technical-standards-verification)
26. [QA Checklist](#26-qa-checklist)
27. [Pre-Production Checklist](#27-pre-production-checklist)
28. [Do Not Change Without Approval](#28-do-not-change-without-approval)
29. [Safe Change Procedure](#29-safe-change-procedure)
30. [Version and Change Log](#30-version-and-change-log)
31. [Current Project Status](#31-current-project-status)
32. [Developer Handoff Notes](#32-developer-handoff-notes)
33. [Ownership and Security Notes](#33-ownership-and-security-notes)

---

# 1. Project Overview

The PMEW website is a large industrial and technical website for:

**Pradako Mechanical & Engineering Works**

Primary subject areas include:

- Fasteners
- Screws
- Bolts
- Nuts
- Washers
- Threaded rods
- Studs
- Rivets
- Socket fasteners
- Structural fasteners
- Stainless steel fasteners
- Hot-forged and cold-forged products
- Industry-specific fasteners
- Technical Standards
- Specifications
- Cross-reference data
- Engineering drawings
- Application sectors
- Technical intelligence

The website is intended to support:

- International buyers
- OEMs
- Engineering teams
- Procurement teams
- Agents and representatives
- Distributors
- Technical researchers
- Standards-based product discovery

The project should be treated as a **production engineering website**, not as a collection of independent HTML experiments.

---

# 2. Quick Start

## Local Development

The `public/` directory is the website root.

A correct local URL looks like:

```text
http://127.0.0.1:5500/pages/about-us/ceo.html
```

Do **not** use:

```text
http://127.0.0.1:5500/public/pages/about-us/ceo.html
```

## Recommended Local Setup

Open the `public/` folder as the Live Server/document root.

Then browse using:

```text
/
├── assets/
├── components/
└── pages/
```

If a page loads with `/public/` in the browser URL, the development root is configured incorrectly.

---

# 3. Project Folder Structure

Canonical structure:

```text
PRADAKO-H/
├── .vscode/
│
├── public/                         ← WEB / DOCUMENT ROOT
│   ├── index.html
│   │
│   ├── components/
│   │   ├── navbar.html
│   │   └── footer.html
│   │
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │
│   └── pages/
│
├── data/
│
├── source-assets/                  ← NOT PUBLIC
│   └── development/
│
└── reports/
```

## Folder Responsibilities

### `public/`

Contains only content that may be delivered by the web server.

### `public/assets/`

Contains runtime frontend assets:

```text
/assets/css/
/assets/js/
/assets/images/
```

### `public/components/`

Shared HTML components such as navbar and footer.

### `public/pages/`

Public website pages.

### `data/`

Source datasets, technical data, manifests, research exports, generated data, and structured source material.

### `source-assets/`

Internal source material and development-only files that should not be publicly served.

### `reports/`

Audits, QA output, validation results, manifests, migration notes, and technical reports.

---

# 4. Canonical Runtime Paths

Always use root-relative runtime paths.

## CSS

```html
<link rel="stylesheet" href="/assets/css/example.css">
```

## JavaScript

```html
<script src="/assets/js/example.js" defer></script>
```

## Images

```html
<img src="/assets/images/example/example.jpg" alt="">
```

## Navbar and Footer

```text
/components/navbar.html
/components/footer.html
```

## Pages

```text
/pages/...
```

## Never Use

```text
/public/assets/...
/public/components/...
/public/pages/...
```

inside browser-facing HTML, JavaScript, or CSS URLs.

---

# 5. Shared Navbar and Footer

The website uses shared shell components.

Canonical locations:

```text
/components/navbar.html
/components/footer.html
```

Pages normally contain:

```html
<div id="navbar-container"></div>
```

and:

```html
<div id="footer-container"></div>
```

The shared site-shell logic loads the components centrally.

## Rule

Do not manually duplicate the complete navbar or footer into individual pages unless a deliberate standalone exception is required.

Shared shell changes should be made centrally so the full website remains consistent.

---

# 6. Brand Assets and Favicon

## Main Logo

Canonical PMEW logo:

```text
/assets/images/brand/pradako-logo.png
```

## Favicon Files

Store:

```text
public/assets/images/brand/
├── pradako-favicon.svg
├── pradako-favicon-32.png
└── pradako-apple-touch-icon.png
```

Recommended favicon block:

```html
<!-- PMEW FAVICON/TABICON/BROWSE ICON -->

<link rel="icon"
      type="image/svg+xml"
      href="/assets/images/brand/pradako-favicon.svg">

<link rel="icon"
      type="image/png"
      sizes="32x32"
      href="/assets/images/brand/pradako-favicon-32.png">

<link rel="apple-touch-icon"
      sizes="180x180"
      href="/assets/images/brand/pradako-apple-touch-icon.png">
```

This should be present consistently across public pages.

---

# 7. Design System

The website follows a premium industrial engineering visual language.

## Primary UI Principles

- Clean
- Technical
- Premium
- International
- High readability
- Strong hierarchy
- Generous whitespace
- Responsive
- Minimal clutter

## Preferred Fonts

Commonly used across the project:

- **Montserrat** — primary UI/body
- **Playfair Display** — selected hero/editorial treatment
- **Space Grotesk / Space Mono** — technical or data-oriented areas
- **Inter** — selected system/footer UI

## Common Brand Colours

Primary directions include:

```text
Ink / Graphite
#111315
#2C2C2C

PMEW Coral Accent
#F08080

Technical Slate
#5A6270

Deep Teal / Sustainability
#28766A

White
#FFFFFF
```

## Avoid

Unless deliberately required by a specific page:

- pale beige themes
- large areas of pink
- low-contrast grey-on-grey UI
- excessive card heights
- excessive decorative animation

---

# 8. Homepage Rules

The homepage hero/banner architecture is protected.

Current banner system:

```text
CONTINUOUS_TOTAL = 18
```

## Do Not

Without explicit approval:

- remove slides
- rename slides
- reorder slides
- rewrite the banner engine
- replace the hero logic
- change the main hero architecture
- break mobile responsiveness

Visual and content changes should be made carefully and tested against the full 18-slide flow.

---

# 9. Product Pages

Product pages may include:

- hero banner
- hero one-liner
- product range tables
- metric and inch ranges
- material
- grade
- coating
- plating
- manufacturing process
- testing
- inspection
- packaging
- applications
- Standards
- customised product capability
- CTA / enquiry

## Shared Data

Important shared Product datasets include:

```text
/assets/js/products.js
/assets/js/standard-products.js
```

Do not casually duplicate large product datasets into multiple page-specific files.

## Typical Product Navigation

Product cards may contain:

```text
data-standard
data-standard-code
data-catalogue-action
```

These attributes can be used by the universal Standards navigation layer.

---

# 10. Standards Library Architecture

The Standards Library is one of the most important website systems.

Typical structure:

```text
/pages/standards/
├── iso/
├── din/
├── astm/
├── asme/
├── bsi/
├── jis/
├── en/
├── uni/
├── gost/
├── ...
└── reference-in-preparation.html
```

Each authority folder may contain:

```text
index.html
individual-standard-page.html
```

## Authority Index vs Individual Standard Page

Example:

```text
/pages/standards/bsi/index.html
```

is the authority/library index.

Example:

```text
/pages/standards/bsi/bs-3692-2014.html
```

is an individual Standard page.

These two page types have different purposes and should not be confused.

## No Duplicate Standard Pages

If a valid individual page already exists, do not create another page just because a Product dataset uses a different label or shorthand.

Fix the route/alias mapping instead.

---

# 11. Universal Standard Navigation

The current Standards navigation architecture uses:

```text
/assets/js/standard-navigation.js
/assets/js/standard-page-index.js
/assets/js/standard-route-resolver.js
```

## Required Behaviour

```text
User clicks a Standard
        ↓
Individual page exists?
        ├── YES → open actual individual Standard page
        └── NO  → open Reference In Preparation page
```

## Important Rule

An authority table should **not** be the default fallback for a missing individual Standard.

Example:

```text
BS 2470
```

If the individual page is missing:

```text
/pages/standards/reference-in-preparation.html?standard=BS%202470
```

should be used.

## Future Page Detection

The navigation layer supports future page publication.

Example:

Today:

```text
BS 2470
→ Reference In Preparation
```

Later:

```text
/pages/standards/bsi/bs-2470.html
```

is created.

The navigation layer should detect the page and begin opening it without requiring every Product page to be rewritten.

---

# 12. Reference In Preparation Page

Canonical page:

```text
/pages/standards/reference-in-preparation.html
```

The customer-facing message is intentionally simple.

Typical structure:

```text
PRADAKO ENGINEERING LIBRARY

WE’RE
WORKING
ON IT.

[DYNAMIC STANDARD NUMBER]

INDIVIDUAL REFERENCE IN PREPARATION

This individual standards reference is currently being
prepared for the Pradako Engineering Library.

Need it now? Our team can assist with your technical
or commercial requirement.

[ REQUEST THIS REFERENCE ]   [ BACK ]

Check again

Engineering Trust · Excellence Since 1960
```

## Dynamic Standard Number

The Standard number must not be hard-coded.

Example:

```text
?standard=BS%202470
```

displays:

```text
BS 2470
```

## Do Not Expose

Do not show customers:

- expected file path
- route candidate
- internal routing logic
- developer status
- source-page implementation details

---

# 13. Standard Page Naming Rules

For new missing individual pages, use predictable canonical filenames where possible.

Examples:

```text
/pages/standards/bsi/bs-2470.html
/pages/standards/uni/uni-5783.html
```

Existing editioned pages may remain:

```text
/pages/standards/iso/iso-4014-2022.html
/pages/standards/bsi/bs-3692-2014.html
```

Compound/adoption filenames may also remain where already established.

Example:

```text
/pages/standards/din/din-7973-iso-1483.html
```

## Rule

Do not mass-rename existing Standard pages without:

- redirect mapping
- internal link audit
- resolver update
- sitemap update
- SEO review
- QA

---

# 14. Cross-Reference System

The International Standards Cross-Reference system links equivalent or related standards across authorities.

Examples may include:

```text
ISO ↔ DIN
DIN ↔ ISO
ANSI ↔ ASME
BS ↔ ISO
UNI ↔ EN / ISO
```

Cross-reference UI should use the same Standards navigation layer as Product pages.

## Required Behaviour

```text
Cross-reference pill click
→ actual individual Standard page if available
→ Reference In Preparation if unavailable
```

Do not silently send missing individual Standards to an authority table.

---

# 15. Images and Media

Canonical runtime image root:

```text
/assets/images/
```

## Brand

```text
/assets/images/brand/
```

## Watermarked Standard Fasteners

Flattened structure:

```text
/watermarked-images/standard-fasteners/bolts/...
/watermarked-images/standard-fasteners/nuts/...
```

Do not reintroduce old unnecessary intermediate folders such as:

```text
1536/
```

## Pending Images

If an image is not yet supplied:

- keep the intended runtime path
- do not invent or fabricate a replacement
- do not repeatedly restructure page HTML
- add the actual file later at the intended path

This allows the page to begin displaying the asset automatically when it becomes available.

---

# 16. SEO Architecture

The project may include:

- `<title>`
- meta description
- canonical URL
- `robots`
- Open Graph metadata
- Twitter metadata
- JSON-LD
- sitemap XML
- robots.txt
- redirect configuration

## Important

SEO should be treated as a production layer, not as a reason to restructure existing frontend routes.

---

# 17. Production Domain

## Critical

The following domain is **not the final production domain**:

```text
https://www.pradako.co
```

Also audit:

```text
https://pradako.co
http://www.pradako.co
http://pradako.co
```

## Do Not Launch With Old-Domain SEO Identity

Old-domain references can cause problems if left inside:

```html
<link rel="canonical" ...>
```

```html
<meta property="og:url" ...>
```

JSON-LD:

```json
{
  "url": "https://www.pradako.co/..."
}
```

Sitemaps:

```xml
<loc>https://www.pradako.co/...</loc>
```

robots.txt sitemap references and domain-specific redirect rules must also be reviewed.

## Until Final Domain Is Confirmed

Do not replace old URLs with:

```text
localhost
127.0.0.1
temporary development domain
```

When the final domain is approved, regenerate the SEO domain layer in one controlled operation.

---

# 18. Internal Linking Rules

Use root-relative internal navigation whenever possible.

Correct:

```html
<a href="/pages/products/bolts.html">Bolts</a>
```

Correct:

```html
<img src="/assets/images/products/bolt.jpg" alt="">
```

Avoid:

```html
<a href="https://www.pradako.co/pages/products/bolts.html">
```

for normal internal navigation.

Root-relative URLs make the site portable between development, staging, and the final production domain.

---

# 19. Redirects

Redirects may exist for:

- old URLs
- legacy Standards URLs
- previous specification URLs
- frontend migration paths
- route corrections

Do not remove redirects casually.

Before production:

- validate every redirect target
- update domain-specific redirect rules
- prevent loops
- prevent old-domain redirects from pointing backwards
- preserve important legacy search-engine signals where required

---

# 20. Backend-Dependent Features

Some frontend pages or forms may exist before the production backend is complete.

Potential backend-dependent areas include:

- Product enquiry
- Global enquiry
- Leadership collaboration
- Careers
- Executive interest
- Agent application
- Agent login
- Forgot password
- Shipment tracking
- Portal login
- Portal access request
- Newsletter

These should be internally classified as:

```text
LIVE
FRONTEND READY / BACKEND PENDING
BACKEND ACTIVE
DEVELOPMENT ONLY
```

A polished frontend form is not proof that its backend workflow is active.

---

# 21. Forms and API Endpoints

Frontend code may reference endpoints such as:

```text
/submit-product-type-enquiry
/submit-leadership-collaboration
/submit-global-enquiry
/tracking/login
/tracking/forgot-password
/agent/login
/agent/forgot-password
/api/agent-applications
/php/submit-career-application.php
submit-executive-interest.php
```

These must be validated against the real backend before launch.

## Security Rule

Never store:

- passwords
- private API keys
- SMTP credentials
- database passwords
- secret tokens
- private access credentials

inside public frontend files.

---

# 22. Development-Only and Archived Files

Development experiments should not live inside `public/`.

Example archived loader prototypes:

```text
source-assets/development/loaders/
├── pmew-page-loader.html
├── pmew-opening-manager.html
└── money-page-loader.html
```

These may remain useful as design/development references but should not automatically be deployed.

## Rule

```text
development experiment ≠ production webpage
```

---

# 23. Files That Must Not Be Deleted Without Audit

Do not delete a file simply because no obvious page links to it.

Before removal, check:

```text
HTML references
JS imports
dynamic imports
fetch() calls
event-driven loading
CSS references
sitemap references
redirect references
data dependencies
runtime-generated paths
```

Potential cleanup candidates must first be classified and verified.

---

# 24. Known Empty, Fragment, and Special Files

Some files may be:

- empty placeholders
- HTML fragments
- reusable sections
- temporary pages
- archived development concepts

Example previously identified Product-area files requiring classification:

```text
/pages/products/stainless-steel-fastener.html
/pages/products/cross-reference-guide-section.html
```

Do not assume both should be deleted.

A fragment may still be dynamically loaded.

An empty page may need:

- redirect
- archive
- population
- `noindex`
- replacement

depending on its actual role.

---

# 25. Technical Standards Verification

Frontend correctness and technical Standards correctness are separate responsibilities.

Some Standard pages may contain placeholders such as:

```text
Title to be added
Family to be added
```

Do not invent technical information simply to make the page look complete.

## Standards Content Should Be Verified Against Appropriate Sources

Where applicable:

- official Standards organizations
- Standards-body catalogues
- primary technical documentation
- verified engineering sources

Technical verification should be documented separately from frontend cleanup.

---

# 26. QA Checklist

Before approving a frontend change, test at minimum:

## Browsers

- Chrome
- Edge

## Viewports

- Desktop
- Laptop
- Tablet where relevant
- Mobile

## Shared UI

- Navbar loads
- Footer loads
- Favicon appears
- Logo appears
- No unexpected horizontal scroll
- Mobile navbar works

## Product Pages

- Product cards render
- Product images resolve
- Metric/inch content remains readable
- CTA works
- Standard links work

## Standards

- Existing Standards open their individual pages
- Missing Standards open Reference In Preparation
- Cross-reference navigation works
- `Check again` works where applicable
- No authority-table fallback appears accidentally

## Technical QA

- no console errors
- no uncaught JS exceptions
- no broken fetch paths
- no dead buttons
- no blank HTML pages
- no broken images caused by path errors
- no `/public/` runtime URLs

---

# 27. Pre-Production Checklist

Before production launch:

- [ ] Final production domain confirmed
- [ ] Old `pradako.co` references audited
- [ ] Canonical URLs regenerated
- [ ] Open Graph URLs regenerated
- [ ] JSON-LD URLs regenerated
- [ ] Sitemaps regenerated
- [ ] robots.txt verified
- [ ] Redirect configuration verified
- [ ] HTTPS confirmed
- [ ] Search Console setup completed
- [ ] Favicon verified
- [ ] Main logo verified
- [ ] Navbar/footer QA complete
- [ ] Standards navigation QA complete
- [ ] Product-page QA complete
- [ ] Cross-reference QA complete
- [ ] Broken-link audit complete
- [ ] Backend endpoints confirmed
- [ ] Forms tested end-to-end
- [ ] Placeholder content reviewed
- [ ] Pending image manifest reviewed
- [ ] Console error audit complete
- [ ] Mobile QA complete

---

# 28. Do Not Change Without Approval

The following areas should be treated as protected architecture:

- homepage 18-slide hero system
- `public/` document-root architecture
- root-relative runtime paths
- `/assets/`
- `/components/`
- `/pages/`
- Standard-page folder architecture
- Standard route resolver behaviour
- Universal Standard navigation behaviour
- major global styling
- shared navbar/footer loading architecture
- existing editioned/compound Standard filenames

Large changes require deliberate review and regression testing.

---

# 29. Safe Change Procedure

For every significant change:

```text
1. Back up current version
        ↓
2. Make the smallest possible change
        ↓
3. Validate syntax
        ↓
4. Test representative pages
        ↓
5. Test mobile
        ↓
6. Check console
        ↓
7. Run route/link audit where relevant
        ↓
8. Keep rollback copy
        ↓
9. Only then merge into production branch
```

## Mass Find/Replace

Mass replacement is allowed only when:

- the target is precisely defined
- false positives are reviewed
- generated output is validated
- a rollback copy exists

Never perform blind global replacement on technical data or routing.

---

# 30. Version and Change Log

This section records major architecture milestones, not every visual tweak.

## V11 — Frontend Structure Freeze

Major outcomes included:

- frontend architecture frozen
- shared path conventions stabilized
- legacy loader pages archived
- obsolete footer links cleaned
- dynamic-route audit completed
- legacy `/public/` browser paths prohibited

## V12 — Production Preparation

Major production-prep work included:

- SEO metadata layer
- sitemaps
- robots.txt
- 404 page
- redirect reports
- backend handoff matrix
- pending-image manifest
- Standards verification queue

> Note: V12 used `https://www.pradako.co` as a temporary production-origin assumption. That domain is no longer intended to be the final production domain and must be cleaned/replaced before launch.

## V15 — Universal Standard Navigation

Major behaviour:

```text
existing individual Standard page
→ open actual page

missing individual Standard page
→ Reference In Preparation
```

The navigation layer was optimized to avoid excessive page-load network checks and observer loops.

## Favicon Standardization

The PMEW favicon system now uses:

```text
pradako-favicon.svg
pradako-favicon-32.png
pradako-apple-touch-icon.png
```

across updated HTML pages.

## Current Domain Cleanup

Current planned work includes:

- auditing old `pradako.co` references
- separating SEO URLs from internal links
- removing obsolete domain identity
- regenerating SEO URLs after the final domain is selected

---

# 31. Current Project Status

## Completed / Stable

- canonical `public/` document-root architecture
- shared `/assets/`, `/components/`, `/pages/` paths
- shared navbar/footer architecture
- Standards authority routing cleanup
- Product Standard image-path fixes
- Universal Standards navigation
- Reference In Preparation page
- favicon system
- initial frontend cleanup
- archived development-only loader pages
- pending Standards-page audit
- production-prep documentation

## In Progress / Review

- old-domain cleanup
- unused-page audit
- unused/dead JavaScript audit
- backend readiness review
- technical Standards verification
- pending-image completion
- final SEO regeneration

## Still Required Before Production

- final domain confirmation
- domain-wide SEO regeneration
- backend endpoint confirmation
- full cross-browser QA
- final link audit
- final sitemap/robots generation
- Search Console setup
- production deployment verification

---

# 32. Developer Handoff Notes

## Frontend Developer

Responsible for:

- HTML
- CSS
- JavaScript
- UI responsiveness
- shared components
- frontend performance
- browser QA
- Product rendering
- Standards navigation behaviour

## Backend Developer

Responsible for:

- form submission
- email workflows
- authentication
- shipment tracking
- agent portal
- user/session security
- database integration
- APIs
- server validation
- logging

## SEO / Marketing

Responsible for:

- final production domain
- canonical URLs
- Open Graph
- structured data
- sitemap submission
- robots.txt
- redirects
- Search Console
- analytics
- campaign URLs

## Standards / Engineering Team

Responsible for:

- technical validity
- official titles
- dimensions
- mechanical specifications
- Standard revision status
- cross-reference accuracy
- technical drawings
- product applicability

---

# 33. Ownership and Security Notes

Project:

**Pradako Mechanical & Engineering Works (PMEW)**

Brand:

**PRADAKO**

Primary positioning:

**Engineering Trust · Excellence Since 1960**

## Never Store Secrets in This Repository

Do not commit:

```text
passwords
SMTP credentials
API keys
private tokens
database credentials
secret environment values
private customer data
```

Use secure environment configuration for production secrets.

---

# Final Principle

The PMEW website should be maintained as one coherent engineering platform.

When deciding whether to change something, prefer:

```text
consistency
clarity
technical accuracy
performance
maintainability
SEO correctness
buyer usability
```

over adding unnecessary complexity.

If a change cannot clearly improve one of those areas, it should be questioned before implementation.
