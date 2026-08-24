(function (window, document) {
    'use strict';

    if (window.__PMEW_SITE_SHELL_BOOTSTRAPPED__) return;
    window.__PMEW_SITE_SHELL_BOOTSTRAPPED__ = true;

    var SHELL_FILE = 'pradako-site-shell.js';
    var COMPONENTS = {
        navbar: 'components/navbar.html',
        footer: 'components/footer.html'
    };

    function getShellScript() {
        if (document.currentScript && document.currentScript.src) return document.currentScript;

        return Array.prototype.slice.call(document.scripts).find(function (script) {
            return new RegExp('(?:^|/)' + SHELL_FILE.replace('.', '\\.') + '(?:[?#]|$)', 'i')
                .test(script.src || '');
        }) || null;
    }

    function normaliseRoot(value) {
        value = String(value == null ? '' : value).trim();
        if (!value || value === '/') return '';

        try {
            var url = new URL(value, window.location.origin + '/');
            if (url.origin !== window.location.origin) return '';
            return url.pathname.replace(/\/+$/, '');
        } catch (error) {
            return value.replace(/^\/+|\/+$/g, '') ? '/' + value.replace(/^\/+|\/+$/g, '') : '';
        }
    }

    function detectSiteRoot() {
        if (typeof window.PMEW_SITE_ROOT === 'string') {
            return normaliseRoot(window.PMEW_SITE_ROOT);
        }

        var script = getShellScript();
        if (!script || !script.src) return '';

        try {
            var pathname = new URL(script.src, document.baseURI).pathname;
            var markers = [
                '/assets/js/' + SHELL_FILE,
                '/js/' + SHELL_FILE
            ];

            for (var i = 0; i < markers.length; i += 1) {
                var index = pathname.toLowerCase().lastIndexOf(markers[i].toLowerCase());
                if (index !== -1) return normaliseRoot(pathname.slice(0, index));
            }

            return '';
        } catch (error) {
            return '';
        }
    }

    var siteRoot = detectSiteRoot();

    function sitePath(path) {
        path = String(path == null ? '' : path).trim();
        if (!path) return siteRoot || '/';

        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;

        return (siteRoot || '') + '/' + path.replace(/^\/+/, '');
    }

    window.PMEW_SITE_ROOT = siteRoot;
    window.PMEW_SITE = window.PMEW_SITE || {};
    window.PMEW_SITE.root = siteRoot;
    window.PMEW_SITE.path = sitePath;
    window.PMEW_SITE.components = {
        navbar: sitePath(COMPONENTS.navbar),
        footer: sitePath(COMPONENTS.footer)
    };

    function externalScriptAlreadyLoaded(src, currentNode) {
        if (!src) return false;
        var absolute;
        try { absolute = new URL(src, document.baseURI).href; }
        catch (error) { absolute = src; }

        return Array.prototype.slice.call(document.scripts).some(function (script) {
            return script !== currentNode && script.src && script.src === absolute;
        });
    }

    function executeScripts(container) {
        container.querySelectorAll('script').forEach(function (oldScript) {
            if (oldScript.src && externalScriptAlreadyLoaded(oldScript.src, oldScript)) {
                oldScript.remove();
                return;
            }

            var script = document.createElement('script');
            Array.prototype.forEach.call(oldScript.attributes, function (attr) {
                script.setAttribute(attr.name, attr.value);
            });
            if (!oldScript.src) script.textContent = oldScript.textContent;
            oldScript.replaceWith(script);
        });
    }

    function updateHeaderOffset() {
        var container = document.getElementById('navbar-container');
        var height = container ? Math.ceil(container.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty('--pmew-main-header-height', height + 'px');
    }

    async function loadComponent(id, type) {
        var container = document.getElementById(id);
        if (!container) return { type: type, skipped: true, loaded: false };

        if (container.dataset.pmewShellLoaded === 'true' || container.innerHTML.trim()) {
            container.dataset.pmewShellLoaded = 'true';
            return { type: type, skipped: true, loaded: true };
        }

        var url = window.PMEW_SITE.components[type];

        try {
            var isLocalDevelopment = /^(?:localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname);
            var response = await window.fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                cache: isLocalDevelopment ? 'no-store' : 'default',
                headers: { Accept: 'text/html,application/xhtml+xml' }
            });

            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ' for ' + url);
            }

            var html = await response.text();
            if (!html || !html.trim()) throw new Error('Empty component response for ' + url);

            container.innerHTML = html;
            container.dataset.pmewShellLoaded = 'true';
            container.removeAttribute('data-pmew-shell-error');
            executeScripts(container);

            return { type: type, skipped: false, loaded: true, url: url };
        } catch (error) {
            container.dataset.pmewShellError = 'true';
            console.error('[PMEW Site Shell] Unable to load ' + type + ' from ' + url + '.', error);
            return { type: type, skipped: false, loaded: false, url: url, error: error };
        }
    }

    function dispatchShellLoaded(results) {
        window.__PMEW_SHELL_LOADED__ = true;
        window.__PMEW_SHELL_RESULTS__ = results;

        window.dispatchEvent(new CustomEvent('pmew:shell-loaded', {
            detail: {
                root: siteRoot,
                components: window.PMEW_SITE.components,
                results: results
            }
        }));
    }

    async function init() {
        if (window.__PMEW_SITE_SHELL_INIT_STARTED__) return;
        window.__PMEW_SITE_SHELL_INIT_STARTED__ = true;

        var results = await Promise.all([
            loadComponent('navbar-container', 'navbar'),
            loadComponent('footer-container', 'footer')
        ]);

        updateHeaderOffset();
        window.setTimeout(updateHeaderOffset, 150);
        dispatchShellLoaded(results);

        if ('ResizeObserver' in window) {
            var navbar = document.getElementById('navbar-container');
            if (navbar) {
                var observer = new ResizeObserver(updateHeaderOffset);
                observer.observe(navbar);
                window.__PMEW_HEADER_RESIZE_OBSERVER__ = observer;
            }
        } else {
            window.addEventListener('resize', updateHeaderOffset, { passive: true });
        }
    }

    window.PMEW_SITE.load = init;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();

}(window, document));
