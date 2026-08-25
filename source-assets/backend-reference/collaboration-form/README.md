# PMEW Strategic Collaboration Form — Placement & Backend Notes

This package is already arranged using **project-relative PMEW paths**.

Copy/merge its folders into the root of `PRADAKO-H/`.

## Included structure

```text
PRADAKO-H/
├── public/
│   ├── pages/
│   │   └── about-us/
│   │       └── collaboration.html
│   └── api/
│       └── collaboration/
│           ├── .htaccess
│           └── submit.php
│
├── server/
│   └── config/
│       └── collaboration.php
│
├── storage/
│   └── collaboration/
│       ├── .htaccess
│       └── index.html
│
└── source-assets/
    └── backend-reference/
        └── collaboration-form/
            └── README.md
```

## Public page

Browser route:

```text
/pages/about-us/collaboration.html
```

Physical file:

```text
public/pages/about-us/collaboration.html
```

`public/` remains the PMEW web/document root. Do not put `/public/` in browser URLs.

## Collaboration endpoint

The form now submits to:

```text
POST /api/collaboration/submit.php
```

Physical handler:

```text
public/api/collaboration/submit.php
```

The old generic route:

```text
/api/submit.php
```

is no longer used.

## Private configuration

Configuration has been moved outside the public web root:

```text
server/config/collaboration.php
```

The PHP handler loads it from the PMEW project root.

## Private storage

Submissions, uploaded files and rate-limit records are stored under:

```text
storage/collaboration/
```

The handler creates:

```text
storage/collaboration/submissions/
storage/collaboration/rate-limits/
```

The web-server/PHP process must have write permission to `storage/collaboration/`.

## Production domain

No `pradako.co` or `pradakogroup.com` website origin is hard-coded in this package.

The handler accepts **same-origin submissions automatically**, so the page works after the final PMEW domain is selected without changing the PHP origin list.

If a separate staging/API origin is intentionally required, set:

```text
PMEW_ALLOWED_ORIGINS=https://staging.example.com,https://api.example.com
```

Do not use this for arbitrary origins.

## Email environment variables

Optional:

```text
PMEW_COLLAB_NOTIFICATION_EMAIL
PMEW_WEBSITE_FROM_EMAIL
```

Defaults currently remain:

```text
info@pradakomechanicals.com
website@pradakomechanicals.com
```

SMTP/transactional-mail modernization should be completed during the final backend implementation.

## SEO domain handling

Because the final PMEW production domain is not confirmed, the page no longer contains old-domain:

```text
canonical
og:url
absolute social image URL
URL-bearing JSON-LD
```

These should be regenerated across the full website after the final production domain is selected.

## PHP requirements

- PHP 8.1+
- `fileinfo`
- `mbstring`
- HTTPS in production
- writable private storage
- configured PHP mail or later SMTP/transactional mail service

Recommended PHP upload settings:

```text
upload_max_filesize >= 10M
post_max_size >= 32M
max_file_uploads >= 8
```

## Accepted upload types

```text
PDF
JPG / JPEG
PNG
DOCX
XLSX
ZIP
```

Current application limits:

```text
Maximum files: 8
Maximum per file: 10 MB
Maximum combined: 30 MB
```

If limits are changed in:

```text
server/config/collaboration.php
```

also update the matching `limits` object in:

```text
public/pages/about-us/collaboration.html
```

## Pre-launch testing

Test:

1. Valid submission without files.
2. Valid submission with each permitted format.
3. Multiple file drag-and-drop.
4. Oversized file rejection.
5. Total-size rejection.
6. Disallowed and renamed-extension rejection.
7. Rate limiting.
8. Same-origin production/staging submission.
9. PMEW notification email.
10. Customer confirmation email.
11. Submission reference display.
12. Private submission folder not being web-accessible.

## Future canonical API

During the final PMEW backend build, this endpoint can be migrated behind:

```text
POST /api/enquiries/collaboration
```

Use a compatibility route during migration rather than breaking the frontend abruptly.
