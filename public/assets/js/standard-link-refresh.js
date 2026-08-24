/*
 * PMEW V14 helper:
 * Call window.PMEWRefreshStandardLinks() after custom code injects a
 * non-standard DOM fragment and you want to force an immediate href refresh.
 */
window.PMEWRefreshStandardLinks = function (root) {
    if (
        window.PMEWStandardNavigation &&
        typeof window.PMEWStandardNavigation.rewriteStandardLinks === "function"
    ) {
        return window.PMEWStandardNavigation.rewriteStandardLinks(root || document);
    }
    return Promise.resolve(0);
};
