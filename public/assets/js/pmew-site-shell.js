(function (window, document) {
    'use strict';

    /*
     * COMPATIBILITY ALIAS ONLY.
     * The permanent PMEW shell loader is pradako-site-shell.js.
     * This file no longer creates, fetches, or owns navbar/footer markup.
     * Old pages may continue to reference pmew-site-shell.js while they are
     * migrated; this shim delegates to the permanent loader in the same folder.
     */

    if (window.__PMEW_SITE_SHELL_BOOTSTRAPPED__ || window.__PMEW_SITE_SHELL_ALIAS_LOADING__) return;
    window.__PMEW_SITE_SHELL_ALIAS_LOADING__ = true;

    var current = document.currentScript;
    var src = current && current.src ? current.src : '';
    var target = src
        ? src.replace(/pmew-site-shell\.js(?:[?#].*)?$/i, 'pradako-site-shell.js')
        : 'pradako-site-shell.js';

    var existing = Array.prototype.slice.call(document.scripts).some(function (script) {
        return script.src && /(?:^|\/)pradako-site-shell\.js(?:[?#]|$)/i.test(script.src);
    });

    if (existing) return;

    var loader = document.createElement('script');
    loader.src = target;
    loader.async = false;
    loader.dataset.pmewCompatibilityAlias = 'pmew-site-shell.js';
    loader.addEventListener('error', function () {
        console.error('[PMEW] Compatibility alias could not load pradako-site-shell.js from ' + target);
    }, { once: true });
    (document.head || document.documentElement).appendChild(loader);

}(window, document));
