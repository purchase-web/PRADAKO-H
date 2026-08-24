"use strict";

/* Compatibility alias: shared implementation moved to leadership.js. */
(function (window, document) {
    if (window.__PMEW_LEADERSHIP_JS__ || window.__PMEW_LEADERSHIP_ALIAS_LOADING__) {
        if (window.PMEWLeadership && typeof window.PMEWLeadership.init === "function") {
            window.PMEWLeadership.init();
        }
        return;
    }

    window.__PMEW_LEADERSHIP_ALIAS_LOADING__ = true;

    const current = document.currentScript;
    const target = current && current.src
        ? current.src.replace(/chairman\.js(?:[?#].*)?$/i, "/assets/js/leadership.js")
        : "/assets/js/leadership.js";

    const loader = document.createElement("script");
    loader.src = target;
    loader.async = false;
    loader.dataset.pmewLeadershipAlias = "/assets/js/chairman.js";
    loader.addEventListener("error", () => {
        window.__PMEW_LEADERSHIP_ALIAS_LOADING__ = false;
        console.error("[PMEW] chairman.js could not load leadership.js from " + target);
    }, { once: true });
    (document.head || document.documentElement).appendChild(loader);

}(window, document));
