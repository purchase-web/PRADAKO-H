PMEW CSS CLEANUP — CURRENT STAGE
Date: 21 August 2026

This package is the cleaned CSS pass based on the supplied 49-file CSS archive,
the cleaned JavaScript package from the preceding PMEW audit, and the available
navbar.html / footer.html / founder.html component/page copies found in the user's
prior file library.

Completed safely in this pass:
1. bolts-page.css syntax repaired.
2. Broken design_system.css / page_style.css imports corrected.
3. Internal CSS image URLs standardized to ../images/... so they work when
   /public is visible in local Live Server and when public/ becomes production web root.
4. Legacy shell CSS retired to zero-effect compatibility entry files.
5. leadership.css created; Founder/Chairman/Chairwoman common declarations extracted.
6. Obsolete cookie .is-visible/.is-open state CSS removed; compatibility entry points to cookies.css.
7. Duplicated unscoped half of pmew-engineering-response-desk.css removed.
8. Safe earlier identical blocks removed from style.css/index.css while preserving last cascade copy.
9. products-base.css created and shared by products.css + standard-products.css.
10. Clearly owned Application/Navbar/Footer responsive rules moved out of responsive.css.
11. Safe same-selector superseded declarations removed from major layered files.
13. Final parser/import/path checks pass: 0 CSS parser failures, 0 broken local imports,
    0 non-portable root image paths, 0 CSS import cycles.

Intentionally deferred until the CURRENT full HTML archive arrives:
- destructive deletion of legacy selectors and unused custom properties;
- moving homepage/general responsive rules out of responsive.css;
- aggressive removal of remaining !important declarations where cross-selector
  specificity cannot be proven without the real HTML and stylesheet load order;
- final shell CSS deletion rather than compatibility stubs;
- removal of old CSS <link> entries now made redundant by leadership.css,
  products-base.css, cookies.css, etc.

Reason: CSS cascade/specificity depends on actual HTML class combinations and stylesheet
load order. Removing those items without the current HTML would risk changing a page
that is not represented in the present attachment set.

When the current HTML + remaining JS data files are supplied, run the final usage/load-order
pass before calling the CSS migration production-final.
