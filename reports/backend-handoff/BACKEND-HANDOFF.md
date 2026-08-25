# PMEW Backend Developer Handoff Manual

> **Project:** Pradako Mechanical & Engineering Works (PMEW)  
> **Brand:** PRADAKO  
> **Website Type:** Large static-first industrial / engineering website with backend-dependent workflows  
> **Frontend Document Root:** `public/`  
> **Final Production Domain:** **TBD — `pradako.co` is not the final domain**  
> **Primary Objective:** Add secure backend functionality without breaking the existing frontend architecture, URLs, Standards routing, SEO structure, or customer experience.

---

# Table of Contents

1. [Purpose of This Document](#1-purpose-of-this-document)
2. [Backend Scope](#2-backend-scope)
3. [Non-Negotiable Frontend Architecture](#3-non-negotiable-frontend-architecture)
4. [Canonical Folder Structure](#4-canonical-folder-structure)
5. [Runtime URL Rules](#5-runtime-url-rules)
6. [Production Domain Rules](#6-production-domain-rules)
7. [Recommended Backend Architecture](#7-recommended-backend-architecture)
8. [Backend Technology Guidance](#8-backend-technology-guidance)
9. [Recommended API Namespace](#9-recommended-api-namespace)
10. [Known Frontend Workflows](#10-known-frontend-workflows)
11. [Known Existing Endpoint References](#11-known-existing-endpoint-references)
12. [Recommended API Standardization](#12-recommended-api-standardization)
13. [Standard API Response Contract](#13-standard-api-response-contract)
14. [Reference Number Strategy](#14-reference-number-strategy)
15. [Product Enquiry Workflow](#15-product-enquiry-workflow)
16. [Enquiry Cart / Multi-Item RFQ](#16-enquiry-cart--multi-item-rfq)
17. [Suggested Enquiry Database Model](#17-suggested-enquiry-database-model)
18. [Global / General Enquiries](#18-global--general-enquiries)
19. [Leadership / Executive Enquiries](#19-leadership--executive-enquiries)
20. [Career Application Workflow](#20-career-application-workflow)
21. [Agent / Distributor Workflow](#21-agent--distributor-workflow)
22. [Authentication](#22-authentication)
23. [Session Strategy](#23-session-strategy)
24. [Roles and Permissions](#24-roles-and-permissions)
25. [Forgot Password / Password Reset](#25-forgot-password--password-reset)
26. [Shipment Tracking](#26-shipment-tracking)
27. [Protected Shipment Documents](#27-protected-shipment-documents)
28. [Newsletter](#28-newsletter)
29. [Email Delivery](#29-email-delivery)
30. [Email Templates](#30-email-templates)
31. [File Upload Security](#31-file-upload-security)
32. [Server-Side Validation](#32-server-side-validation)
33. [Spam / Abuse Protection](#33-spam--abuse-protection)
34. [Database Security](#34-database-security)
35. [Logging](#35-logging)
36. [Audit Logs](#36-audit-logs)
37. [Error Monitoring](#37-error-monitoring)
38. [Environment Configuration](#38-environment-configuration)
39. [Development / Staging / Production](#39-development--staging--production)
40. [CORS](#40-cors)
41. [CSRF](#41-csrf)
42. [Rate Limiting](#42-rate-limiting)
43. [Static Assets and Caching](#43-static-assets-and-caching)
44. [Compression](#44-compression)
45. [HTTPS](#45-https)
46. [Security Headers](#46-security-headers)
47. [404 and HTTP Status Behaviour](#47-404-and-http-status-behaviour)
48. [Standards Library Constraints](#48-standards-library-constraints)
49. [SEO / Server Responsibilities](#49-seo--server-responsibilities)
50. [Redirects](#50-redirects)
51. [Sitemaps and robots.txt](#51-sitemaps-and-robotstxt)
52. [Canonical / Open Graph / Structured Data](#52-canonical--open-graph--structured-data)
53. [Backward Compatibility](#53-backward-compatibility)
54. [Backend Integration Workflow](#54-backend-integration-workflow)
55. [Recommended Implementation Phases](#55-recommended-implementation-phases)
56. [Definition of Done](#56-definition-of-done)
57. [Required Developer Documentation](#57-required-developer-documentation)
58. [API Documentation Template](#58-api-documentation-template)
59. [Deployment Handoff](#59-deployment-handoff)
60. [Backup and Restore](#60-backup-and-restore)
61. [Rollback Plan](#61-rollback-plan)
62. [PMEW-Specific Non-Negotiables](#62-pmew-specific-non-negotiables)
63. [Final Acceptance Checklist](#63-final-acceptance-checklist)
64. [Recommended Backend Handoff Folder](#64-recommended-backend-handoff-folder)

---

# 1. Purpose of This Document

This document defines how the PMEW backend must be designed, integrated, deployed, secured, documented, and handed over.

The backend developer should treat the existing frontend as a **stable customer-facing platform**.

The backend's responsibility is to add:

- secure data submission
- authentication
- authorization
- database persistence
- email delivery
- file storage
- internal workflows
- shipment tracking
- agent / distributor systems
- logging
- auditing
- production configuration

without unnecessarily rebuilding the website.

---

# 2. Backend Scope

The backend should support, over time:

```text
Commercial enquiries
Product RFQs
Multi-product enquiry cart
Global enquiries
Technical reference requests
Leadership / executive enquiries
Career applications
Agent applications
Distributor workflows
Agent login
Portal access
Forgot password
Shipment tracking
Protected customer documents
Newsletter subscriptions
Internal administration
Audit logs
Operational reporting
```

The backend should **not** automatically include:

- rewriting all HTML pages
- converting the site to another frontend framework
- renaming thousands of Standard pages
- moving runtime assets
- changing the homepage hero architecture
- changing Standards routing logic without frontend coordination

---

# 3. Non-Negotiable Frontend Architecture

The production server must respect:

```text
public/ = web/document root
```

Correct public URL:

```text
/pages/products/bolts.html
```

Physical file:

```text
PRADAKO-H/public/pages/products/bolts.html
```

Incorrect public URL:

```text
/public/pages/products/bolts.html
```

The backend must not introduce `/public/` into browser-facing URLs.

---

# 4. Canonical Folder Structure

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
│
└── reports/
```

Backend implementation may add its own non-public directories outside `public/`, for example:

```text
backend/
server/
app/
storage/
migrations/
config/
```

depending on the selected backend stack.

Public secrets, private storage, raw uploads, and internal logs must **not** be placed inside `public/`.

---

# 5. Runtime URL Rules

The frontend uses root-relative paths.

Correct:

```text
/assets/css/...
/assets/js/...
/assets/images/...
/components/...
/pages/...
```

Do not rewrite these to:

```text
/public/assets/...
../assets/...
absolute old-domain URLs
```

unless there is a deliberate, reviewed migration reason.

---

# 6. Production Domain Rules

The following domains are legacy / temporary references and are **not assumed to be the final production domain**:

```text
https://www.pradako.co
https://pradako.co
http://www.pradako.co
http://pradako.co
```

The backend must not hard-code any of them.

Use environment configuration:

```env
SITE_URL=https://final-domain.example
API_URL=https://final-domain.example/api
```

or equivalent.

The final domain must drive:

```text
canonical URLs
Open Graph URLs
JSON-LD URLs
password reset links
portal links
email links
sitemap URLs
robots.txt sitemap URL
redirect configuration
CORS configuration
cookie domain where needed
```

---

# 7. Recommended Backend Architecture

Recommended model:

```text
Browser
   │
   ├── Static PMEW HTML / CSS / JS
   │
   └── /api/*
          │
          ▼
       Backend Application
          │
          ├── Validation
          ├── Authentication
          ├── Authorization
          ├── Business Logic
          ├── Database
          ├── File Storage
          ├── Email
          ├── Logging
          └── Audit Trail
```

The static frontend and dynamic backend should remain logically separated.

---

# 8. Backend Technology Guidance

The project does not mandate a specific backend framework.

Suitable options include:

```text
Node.js / TypeScript
Laravel / PHP
Python / Django
Python / FastAPI
ASP.NET
```

Selection should prioritize:

```text
developer competence
long-term maintainability
security
hosting compatibility
support availability
deployment reliability
```

A relational database is recommended:

```text
PostgreSQL
MySQL / MariaDB
```

---

# 9. Recommended API Namespace

Use:

```text
/api/
```

Recommended logical groups:

```text
/api/enquiries/
/api/careers/
/api/agents/
/api/auth/
/api/tracking/
/api/portal/
/api/newsletter/
```

This keeps backend functionality separate from page URLs.

---

# 10. Known Frontend Workflows

The backend developer should audit and implement the following areas.

| Workflow | Current Frontend State | Backend Requirement |
|---|---|---|
| Product enquiry | UI exists | API + DB + email |
| Global enquiry | UI exists | API + DB + email |
| Leadership collaboration | UI exists | API + DB/email |
| Technical reference request | UI / page exists | API or enquiry integration |
| Career application | UI exists | API + DB + secure upload |
| Executive interest | UI exists | API + DB/email |
| Agent application | UI exists | API + approval workflow |
| Agent login | UI exists/planned | Auth + authorization |
| Agent forgot password | UI exists/planned | Secure reset |
| Shipment tracking | UI exists/planned | Auth + shipment data |
| Tracking forgot password | UI exists/planned | Secure reset |
| Portal access request | UI exists/planned | Approval workflow |
| Newsletter | Basic/external flow | Subscription API recommended |

This table must be replaced by a **fully audited endpoint inventory** before production.

---

# 11. Known Existing Endpoint References

Historical / current frontend references include examples such as:

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

These references are **not proof that the endpoints are implemented**.

Before coding, audit:

```text
public/**/*.html
public/assets/js/**/*.js
```

for:

```text
fetch(
XMLHttpRequest
axios
<form action=
/api/
.php
/submit-
login
forgot-password
```

Create an explicit endpoint inventory before implementation.

---

# 12. Recommended API Standardization

Long-term recommended endpoints:

```text
POST /api/enquiries/product
POST /api/enquiries/global
POST /api/enquiries/leadership
POST /api/enquiries/reference

POST /api/careers/applications

POST /api/agents/applications
POST /api/agents/login
POST /api/agents/forgot-password

POST /api/tracking/login
POST /api/tracking/forgot-password

POST /api/portal/access-request

POST /api/newsletter/subscribe
```

Do not break existing frontend forms while standardizing.

Use one of:

```text
temporary compatibility routes
controlled frontend update
backend proxy/adapter
```

---

# 13. Standard API Response Contract

Successful request:

```json
{
  "success": true,
  "message": "Your enquiry has been submitted successfully.",
  "reference": "PMEW-ENQ-2026-000145"
}
```

Validation error:

```json
{
  "success": false,
  "message": "Please correct the highlighted fields.",
  "errors": {
    "email": "Enter a valid email address."
  }
}
```

Unexpected server error:

```json
{
  "success": false,
  "message": "We could not process your request right now.",
  "error_reference": "PMEW-ERR-7F3A91"
}
```

Never expose:

```text
stack traces
SQL statements
database hostnames
filesystem paths
SMTP errors
secret tokens
framework debug output
```

to end users.

---

# 14. Reference Number Strategy

Important submissions should receive a server-generated reference.

Examples:

```text
PMEW-ENQ-2026-000001
PMEW-PRD-2026-000001
PMEW-CAR-2026-000001
PMEW-AGT-2026-000001
PMEW-TRK-2026-000001
```

Suggested prefixes:

```text
ENQ = General enquiry
PRD = Product enquiry
CAR = Career application
AGT = Agent application
DST = Distributor
EXE = Executive interest
TRK = Tracking-related request
```

Reference generation must be atomic and server-side.

---

# 15. Product Enquiry Workflow

Recommended flow:

```text
Customer submits enquiry
        ↓
Server validates
        ↓
Database record created
        ↓
Reference generated
        ↓
Item rows created
        ↓
Files stored securely
        ↓
PMEW notification email
        ↓
Customer confirmation email
        ↓
JSON success response
```

Recommended fields:

```text
reference_number
created_at

customer_name
company_name
email
phone
country

product_name
product_code
standard
size
thread
material
grade
finish
coating

quantity
annual_requirement
target_price

drawing_reference
customer_part_number
message

source_page
source_url

status
assigned_to
internal_notes
```

Do not rely on email alone as the system of record.

---

# 16. Enquiry Cart / Multi-Item RFQ

The backend should support multiple items under one enquiry.

Example request concept:

```json
{
  "customer": {
    "name": "Example Buyer",
    "company": "Example Company",
    "email": "buyer@example.com"
  },
  "items": [
    {
      "product": "Socket Head Cap Screw",
      "standard": "ISO 4762",
      "size": "M8 x 40",
      "quantity": 50000
    },
    {
      "product": "Hex Nut",
      "standard": "ISO 4032",
      "size": "M8",
      "quantity": 50000
    }
  ]
}
```

Recommended relationship:

```text
enquiries
   │
   ├── enquiry_items
   ├── enquiry_items
   └── enquiry_items
```

Do not create one disconnected enquiry record for each line item.

---

# 17. Suggested Enquiry Database Model

Conceptual schema:

```text
enquiries
---------
id
reference
type
company_name
contact_name
email
phone
country
message
status
source_url
assigned_to
created_at
updated_at


enquiry_items
-------------
id
enquiry_id
product
product_code
standard
size
thread
material
grade
finish
coating
quantity
unit
customer_part_number
drawing_reference
remarks
created_at
```

Normalize further only where it provides clear value.

---

# 18. Global / General Enquiries

Recommended fields:

```text
reference
name
company
email
phone
country
subject
message
source_page
created_at
status
assigned_to
```

Route to the correct PMEW team based on enquiry type or region where appropriate.

---

# 19. Leadership / Executive Enquiries

These should be stored securely and routed only to the appropriate internal recipients.

Recommended controls:

```text
server validation
rate limiting
spam protection
database persistence
restricted internal access
email notification
audit trail
```

Do not expose direct private internal addresses unnecessarily in frontend source.

---

# 20. Career Application Workflow

Recommended fields:

```text
application_reference
name
email
phone
location

position
department

experience_years
current_company
current_designation
current_salary
expected_salary
notice_period

resume_path
cover_message

status
created_at
updated_at
```

Suggested statuses:

```text
NEW
SCREENING
SHORTLISTED
INTERVIEW
HOLD
REJECTED
SELECTED
JOINED
```

Resumes must be stored outside public web directories.

---

# 21. Agent / Distributor Workflow

Recommended workflow:

```text
Application submitted
        ↓
PENDING
        ↓
PMEW review
        ↓
APPROVED / REJECTED
        ↓
approved entity invited
        ↓
account creation
        ↓
portal access activated
```

Suggested entities:

```text
agent_applications
agents
agent_users
agent_regions
agent_permissions
```

Application fields may include:

```text
company
country
region
contact person
email
phone
website
industry
customer base
territory
experience
expected business
comments
```

Do not automatically create active portal credentials when an application is submitted.

---

# 22. Authentication

Authentication must be server-controlled.

Backend responsibilities:

```text
password verification
session/token issuance
account status
authorization
session expiration
login throttling
password reset
MFA later if required
```

Password hashing:

```text
Argon2
bcrypt
```

Never use:

```text
plain text
MD5
SHA1
reversible encrypted password storage
```

---

# 23. Session Strategy

For a traditional PMEW portal, secure server sessions / HttpOnly cookies are recommended unless there is a clear reason to use a token architecture.

Recommended cookie attributes:

```text
HttpOnly
Secure
SameSite=Lax
```

Use stricter settings where compatible.

Production authentication must run over HTTPS only.

---

# 24. Roles and Permissions

Example roles:

```text
ADMIN
MANAGEMENT
SALES
EXPORT
QUALITY
HR
AGENT
TRACKING_CUSTOMER
```

Permissions must be enforced on the backend.

Never rely on hiding buttons in frontend JavaScript as authorization.

Example:

```text
Agent A
```

must never be able to retrieve:

```text
Agent B records
another customer's shipment
internal PMEW notes
all enquiries
admin-only documents
```

by manually changing a URL or API parameter.

---

# 25. Forgot Password / Password Reset

Required flow:

```text
Forgot password
      ↓
user submits email
      ↓
server generates one-time token
      ↓
short expiry
      ↓
email secure reset link
      ↓
new password
      ↓
token invalidated
      ↓
existing sessions optionally revoked
```

Never email an existing password.

Do not reveal whether an account exists.

Recommended response:

```text
If an account exists for this email address, reset instructions have been sent.
```

---

# 26. Shipment Tracking

Shipment tracking requires real backend data.

Suggested entities:

```text
customers
shipments
shipment_items
shipment_events
documents
```

Example reference:

```text
PMEW-SHP-2026-001258
```

Possible shipment states:

```text
ORDER RECEIVED
PRODUCTION
QUALITY INSPECTION
PACKING
READY FOR DISPATCH
DISPATCHED
IN TRANSIT
CUSTOMS
DELIVERED
```

Never generate fictional tracking information on the frontend.

---

# 27. Protected Shipment Documents

Potential documents:

```text
invoice
packing list
MTC
COC
inspection report
shipping bill
bill of lading
test report
```

Do not expose them at predictable public URLs.

Bad:

```text
/documents/customer123/invoice.pdf
```

Use:

```text
authenticated download endpoint
signed temporary URL
authorization check before download
```

---

# 28. Newsletter

Recommended endpoint:

```text
POST /api/newsletter/subscribe
```

Suggested fields:

```text
email
subscription_status
consent_timestamp
source_page
created_at
updated_at
```

Suggested statuses:

```text
PENDING
ACTIVE
UNSUBSCRIBED
BOUNCED
```

Provide proper unsubscribe handling.

---

# 29. Email Delivery

All important submissions should generate server-side emails.

Examples:

```text
Product enquiry → sales / export / purchase team
Career → HR
Agent application → management / responsible commercial team
Global enquiry → commercial team
```

Configuration belongs in environment variables.

Example:

```env
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_FROM_NAME="Pradako Mechanical & Engineering Works"
```

Never expose SMTP credentials in frontend JavaScript.

---

# 30. Email Templates

Use branded HTML templates.

Recommended content:

```text
PMEW logo
submission reference
customer / applicant details
request summary
submission timestamp
link to internal system
```

Customer confirmation example:

```text
Thank you for contacting Pradako Mechanical & Engineering Works.

Reference: PMEW-ENQ-2026-000145

Our team has received your requirement and will review it.
```

---

# 31. File Upload Security

Potential upload types:

```text
PDF
Excel
Word
images
CAD / technical files
CV / resume
RFQ
engineering drawing
```

Validate:

```text
MIME type
extension
file size
filename
content where practical
malware where practical
```

Store outside directly executable web directories.

Never allow uploaded executable files to become runnable.

Reject / strongly restrict:

```text
.php
.exe
.js
.sh
.bat
.cmd
```

Generate server filenames rather than trusting user-provided paths.

---

# 32. Server-Side Validation

Frontend validation is only UX.

Every field must be validated again on the server.

Examples of invalid inputs that must be rejected:

```text
negative quantity where not allowed
extremely large text payload
invalid email
script injection
path traversal
malformed uploaded file
unsupported enum value
```

Use explicit validation rules per endpoint.

---

# 33. Spam / Abuse Protection

Public endpoints should use appropriate protection:

```text
rate limiting
honeypot
CSRF protection where applicable
server validation
IP throttling
bot protection where justified
```

Do not add CAPTCHA by default unless spam volume justifies the UX cost.

---

# 34. Database Security

Use:

```text
ORM
prepared statements
parameterized queries
least-privilege DB credentials
```

Never concatenate raw user input into SQL.

Do not expose the database publicly.

---

# 35. Logging

Recommended request/application log fields:

```text
timestamp
request ID
route
HTTP method
response status
execution time
authenticated user ID where applicable
internal error ID
```

Do not log:

```text
passwords
password reset tokens
session secrets
private API keys
SMTP passwords
full confidential uploaded content
```

---

# 36. Audit Logs

Maintain audit history for sensitive internal actions.

Recommended events:

```text
enquiry status changes
account approvals
user creation
user disable/enable
role changes
shipment updates
document uploads
document deletion
password/admin reset actions
agent approval/rejection
```

Example:

```text
2026-08-24 14:32
User: sales-user-18
Action: Enquiry status changed
From: NEW
To: QUOTING
Reference: PMEW-ENQ-2026-000145
```

---

# 37. Error Monitoring

Production should have centralized error monitoring.

Customer response:

```text
We could not process your request right now.
Reference: PMEW-ERR-7F3A91
```

Internal monitoring should retain:

```text
exception
stack
route
request ID
timestamp
server/environment
```

Do not expose technical stack traces to visitors.

---

# 38. Environment Configuration

Use environment variables.

Example:

```env
APP_ENV=production

SITE_URL=
API_URL=

DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=

SESSION_SECRET=
UPLOAD_PATH=
LOG_LEVEL=
```

Provide:

```text
.env.example
```

Do not commit the real production `.env`.

---

# 39. Development / Staging / Production

Maintain separate environments:

```text
development
staging
production
```

Development:

```text
localhost
```

Staging:

```text
private/test domain
separate database
non-production email routing
```

Production:

```text
final PMEW domain
production database
production mail
production storage
```

Do not share production secrets with local development.

---

# 40. CORS

If API is same-origin:

```text
https://final-domain.example/api/...
```

prefer same-origin requests.

If using:

```text
www.final-domain.example
api.final-domain.example
```

configure CORS explicitly.

Do not use:

```text
Access-Control-Allow-Origin: *
```

for authenticated private APIs.

---

# 41. CSRF

If cookie-based authentication is used, protect state-changing actions.

Examples:

```text
POST
PUT
PATCH
DELETE
```

Use framework-standard CSRF protection or an equivalent secure pattern.

---

# 42. Rate Limiting

Protect at minimum:

```text
login
forgot password
enquiry submission
career submission
agent application
newsletter
tracking lookup
portal access request
```

Authentication endpoints should have stricter limits than ordinary informational endpoints.

---

# 43. Static Assets and Caching

Static assets:

```text
/assets/images/
/assets/css/
/assets/js/
```

may use browser caching.

Use:

```text
Cache-Control
ETag
Last-Modified
```

as appropriate.

Do not over-cache HTML unless invalidation is controlled.

If future build tooling produces fingerprinted assets such as:

```text
main.a83d921.js
```

those may use long immutable caching.

---

# 44. Compression

Enable:

```text
Brotli
or
gzip
```

for:

```text
HTML
CSS
JavaScript
JSON
SVG
```

This is particularly useful for the large PMEW Standards website.

---

# 45. HTTPS

Production must use HTTPS.

After final domain configuration is verified:

```text
http://
→ 301
https://
```

Use permanent redirects only after the production domain is final.

---

# 46. Security Headers

Review and test:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Do not deploy an overly restrictive CSP without testing the existing frontend because some pages may still contain inline script/style content.

---

# 47. 404 and HTTP Status Behaviour

Correct HTTP status codes are critical.

A missing URL must return:

```text
404
```

with the PMEW 404 page if desired.

Do not return:

```text
200 + homepage HTML
```

for missing routes.

That causes:

```text
soft 404s
SEO confusion
false-positive Standards page detection
broken route validation
```

The frontend already contains:

```text
public/404.html
```

Use it while preserving a real `404` response status.

---

# 48. Standards Library Constraints

The Standards Library is primarily a static frontend / SEO system.

Important runtime JS:

```text
/assets/js/standard-navigation.js
/assets/js/standard-page-index.js
/assets/js/standard-route-resolver.js
```

Expected behaviour:

```text
Standard exists
→ actual individual Standard page

Standard missing
→ /pages/standards/reference-in-preparation.html
```

The backend/server must not interfere with this.

Do not configure server fallback behaviour that silently turns a missing Standard into:

```text
homepage
authority table
generic 200 page
```

---

# 49. SEO / Server Responsibilities

Server must correctly support:

```text
200 = valid page
301 = permanent move
302 / 307 = temporary redirect where appropriate
404 = missing page
410 = intentionally removed page where appropriate
500 = genuine server error
```

HTTP status accuracy is especially important across thousands of technical pages.

---

# 50. Redirects

Redirect rules may exist for:

```text
legacy specification URLs
old Standard URLs
historical page locations
frontend route migrations
future domain migration
```

Before production:

```text
validate every target
prevent loops
prevent redirect chains
remove backward redirects
use final production domain where required
```

Do not delete redirect history casually.

---

# 51. Sitemaps and robots.txt

Sitemaps must use the final domain.

Do not publish production sitemap URLs containing:

```text
https://www.pradako.co
```

if that is not the production domain.

The project may contain sitemap groups such as:

```text
pages
products
standards
specifications
applications
```

`robots.txt` should also reference the final sitemap URL.

---

# 52. Canonical / Open Graph / Structured Data

Final production pages should use the final domain for:

```text
<link rel="canonical">
<meta property="og:url">
JSON-LD "url"
JSON-LD "@id" where applicable
absolute sitemap URLs
```

Do not publish canonicals using:

```text
localhost
127.0.0.1
staging domain
old pradako.co domain
```

unless one of those is intentionally the final public domain.

---

# 53. Backward Compatibility

When replacing old endpoints, preserve functionality during migration.

Recommended pattern:

```text
old frontend endpoint
        ↓
compatibility route
        ↓
new backend service
```

Then update the frontend in a controlled release.

Do not break forms simply to achieve cleaner API naming.

---

# 54. Backend Integration Workflow

For each feature:

```text
1. Locate frontend page/form
2. Record fields
3. Record current endpoint
4. Record JS behaviour
5. Define API contract
6. Define validation
7. Define database model
8. Implement endpoint
9. Implement persistence
10. Implement email
11. Implement upload handling if needed
12. Integrate frontend
13. Test success
14. Test validation failure
15. Test server failure
16. Test abuse protection
17. Test mobile
18. Test Chrome / Edge
19. Add logs/audit
20. Deploy staging
21. Obtain approval
22. Deploy production
```

---

# 55. Recommended Implementation Phases

## Phase 1 — Backend Foundation

```text
application structure
environment configuration
database connection
migrations
logging
error handling
email service
storage
security baseline
```

## Phase 2 — Commercial Enquiries

```text
Product enquiry
Global enquiry
Reference enquiry
Enquiry cart
Customer confirmation email
Internal notification
```

## Phase 3 — Applications

```text
Career
Executive interest
Agent / distributor application
File uploads
```

## Phase 4 — Authentication / Portal

```text
Agent login
Portal access
Forgot password
Roles
Permissions
Sessions
```

## Phase 5 — Shipment Tracking

```text
shipment records
shipment events
customer access
documents
```

## Phase 6 — Admin

```text
dashboard
enquiry management
application management
shipment management
assignment
notes
reporting
audit logs
```

## Phase 7 — Marketing

```text
newsletter
lead tagging
CRM integration
analytics integration
```

---

# 56. Definition of Done

A backend feature is not complete because an endpoint returns `200`.

Minimum Definition of Done:

```text
frontend integrated
server validation implemented
database persistence verified
error handling tested
success response tested
email tested where required
authorization tested
rate limiting tested where required
uploads secured where required
mobile tested
Chrome tested
Edge tested
logging enabled
audit trail enabled where required
staging tested
production variables documented
```

---

# 57. Required Developer Documentation

Backend handoff must include:

```text
BACKEND-README.md
.env.example
ENDPOINT-INVENTORY.md
API-CONTRACTS.md
DATABASE-SCHEMA.md
DEPLOYMENT.md
SECURITY-CHECKLIST.md
BACKEND-QA.md
BACKUP-RESTORE.md
ROLE-PERMISSION-MATRIX.md
KNOWN-ISSUES.md
```

Also provide:

```text
migration files
seed instructions if required
cron/scheduled jobs
queue worker instructions
third-party integration details
storage configuration
email configuration
rollback procedure
```

A code-only handoff is incomplete.

---

# 58. API Documentation Template

Every API endpoint should document:

```text
Name:
Purpose:

Method:
URL:

Authentication required:
Allowed roles:

Request content type:

Request fields:
- field
- type
- required?
- validation

Success status:
Success response:

Validation status:
Validation response:

Other errors:

Database effects:
Email effects:
File effects:

Rate limit:
Audit event:

Frontend page(s) using endpoint:

Notes:
```

Example:

```text
Name:
Product Enquiry

Method:
POST

URL:
/api/enquiries/product

Authentication:
No

Success:
201 Created

Effects:
- creates enquiry
- creates enquiry item rows
- creates PMEW reference
- emails PMEW
- emails customer confirmation
```

---

# 59. Deployment Handoff

Backend developer must document:

```text
server requirements
runtime version
package dependencies
database setup
migration command
environment variables
document root
file permissions
storage permissions
HTTPS
email
cron jobs
queue workers
cache configuration
logging
backup
deployment command
rollback command
```

Production deployment must not rely on undocumented personal knowledge.

---

# 60. Backup and Restore

Production database must have automated backups.

Recommended starting policy:

```text
daily backup
weekly retention
monthly archive
off-server storage
periodic restore test
```

Final retention policy should match PMEW's operational requirements.

Also back up:

```text
database
protected uploads
critical documents
configuration templates
migration history
```

A backup is not verified until restore has been tested.

---

# 61. Rollback Plan

Every production release should have:

```text
previous code artifact
deployment rollback process
configuration backup
database migration rollback strategy
pre-deployment database backup where appropriate
```

Destructive migrations require explicit approval and recovery planning.

---

# 62. PMEW-Specific Non-Negotiables

The backend developer must not:

```text
add /public/ to browser URLs

move the public document root unexpectedly

rewrite all frontend pages

convert the whole site to a new frontend framework as part of backend work

rename thousands of Standard pages

interfere with standard-navigation.js

return homepage HTML with HTTP 200 for missing Standards

hard-code pradako.co as the production domain

expose private credentials in frontend code

store public uploads as executable files

invent technical Standards information

break pending-image paths

replace the homepage hero architecture

remove redirects without audit

delete shared files simply because they appear unused
```

---

# 63. Final Acceptance Checklist

Before backend acceptance:

## Architecture

- [ ] `public/` is document root
- [ ] No `/public/` browser URLs
- [ ] Existing `/assets/`, `/components/`, `/pages/` paths work

## API

- [ ] Endpoint inventory complete
- [ ] API contracts documented
- [ ] Validation tested
- [ ] Consistent JSON responses

## Database

- [ ] Migrations supplied
- [ ] Production schema documented
- [ ] Backups configured
- [ ] Restore tested

## Email

- [ ] Production mail configured
- [ ] Customer confirmations tested
- [ ] Internal notifications tested

## Authentication

- [ ] Password hashing secure
- [ ] Login throttled
- [ ] Forgot-password tested
- [ ] Session security verified
- [ ] Authorization verified
- [ ] Cross-account data access blocked

## Uploads

- [ ] MIME validation
- [ ] size validation
- [ ] dangerous extensions blocked
- [ ] non-public storage
- [ ] authorization on protected downloads

## Security

- [ ] HTTPS
- [ ] CSRF where applicable
- [ ] CORS reviewed
- [ ] rate limiting
- [ ] security headers tested
- [ ] secrets outside source control

## Standards

- [ ] Existing Standard pages return `200`
- [ ] Missing Standard pages return real `404` at server level
- [ ] Standard navigation works
- [ ] Reference In Preparation works
- [ ] No homepage soft-404 fallback

## SEO / Domain

- [ ] Final domain configured
- [ ] `pradako.co` legacy identity removed/replaced where required
- [ ] canonicals correct
- [ ] OG URLs correct
- [ ] JSON-LD URLs correct
- [ ] sitemap correct
- [ ] robots.txt correct
- [ ] redirects tested

## QA

- [ ] Chrome tested
- [ ] Edge tested
- [ ] mobile tested
- [ ] forms tested
- [ ] error states tested
- [ ] logging tested
- [ ] audit logs tested
- [ ] staging tested
- [ ] production smoke test complete

---
