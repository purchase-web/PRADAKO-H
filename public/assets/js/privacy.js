"use strict";

/* ==========================================================
   PRIVACY PAGE ACTIVE SIDEBAR
   Kept as page-specific scroll-spy behaviour.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".privacy-section");
    const links = document.querySelectorAll(".privacy-sidebar-inner a");

    if (!sections.length || !links.length) return;

    let ticking = false;

    function updateActivePrivacyLink() {
        let current = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;

            if (window.scrollY >= sectionTop - 180) {
                current = section.getAttribute("id") || "";
            }
        });

        links.forEach((link) => {
            link.classList.remove("active");

            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });

        ticking = false;
    }

    function requestUpdate() {
        if (ticking) return;

        ticking = true;
        window.requestAnimationFrame(updateActivePrivacyLink);
    }

    updateActivePrivacyLink();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
});