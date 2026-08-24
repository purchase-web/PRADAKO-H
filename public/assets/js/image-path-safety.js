/* Image path safety only. The supplied images folder is not modified. */
(function () {
    'use strict';
    function escapeXml(value) {
        return String(value || 'Product image')
            .replace(/&/g, 'and')
            .replace(/[<>]/g, '')
            .slice(0, 42);
    }
    function fallback(label) {
        const text = escapeXml(label);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="#eef2f6"/><g fill="#0A3D62" text-anchor="middle" font-family="Montserrat,Arial,sans-serif"><circle cx="300" cy="150" r="52" fill="none" stroke="#cbd6e2" stroke-width="5"/><path d="M270 150h60M300 120v60" stroke="#0A3D62" stroke-width="7" stroke-linecap="round"/><text x="300" y="245" font-size="28" font-weight="700">${text}</text><text x="300" y="282" font-size="15" fill="#607487">Customised Product</text></g></svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }
    function protect(img) {
        if (!(img instanceof HTMLImageElement) || img.dataset.pmewImageProtected === 'true') return;
        img.dataset.pmewImageProtected = 'true';
        img.addEventListener('error', function () {
            if (img.dataset.pmewFallbackApplied === 'true') return;
            img.dataset.pmewFallbackApplied = 'true';
            img.src = fallback(img.alt || 'Product image');
        });
    }
    function scan(root) {
        if (root instanceof HTMLImageElement) protect(root);
        if (root && root.querySelectorAll) root.querySelectorAll('img').forEach(protect);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document));
    else scan(document);
    new MutationObserver((entries) => entries.forEach((entry) => entry.addedNodes.forEach(scan)))
        .observe(document.documentElement, { childList: true, subtree: true });
})();
