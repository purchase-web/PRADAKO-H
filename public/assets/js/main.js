"use strict";

/* ==========================================================
   LEGACY NAVBAR-CONTROLLER COMPATIBILITY
   ----------------------------------------------------------
   Permanent navbar/footer fetching is owned by:
     pradako-site-shell.js

   This file no longer fetches navbar.html. It remains only for old pages
   that still include main.js. If the permanent shell is missing, this file
   loads that shell script from the same JavaScript folder and then applies
   the legacy navbar interactions only when scripts.js is not present.
========================================================== */

(function (window, document) {
    const currentScript = document.currentScript;
    let shellRequested = false;
    let legacyReady = false;

    function shellAlreadyPresent() {
        return Boolean(
            window.__PMEW_SITE_SHELL_BOOTSTRAPPED__ ||
            Array.from(document.scripts).some((script) =>
                /(?:^|\/)pradako-site-shell\.js(?:[?#]|$)/i.test(script.src || "")
            )
        );
    }

    function shellUrl() {
        if (currentScript && currentScript.src) {
            return currentScript.src.replace(/main\.js(?:[?#].*)?$/i, "pradako-site-shell.js");
        }
        return "pradako-site-shell.js";
    }

    function ensurePermanentShell() {
        const hasHost =
            document.getElementById("navbar-container") ||
            document.getElementById("footer-container");

        if (!hasHost || shellAlreadyPresent() || shellRequested) return;
        shellRequested = true;

        const loader = document.createElement("script");
        loader.src = shellUrl();
        loader.async = false;
        loader.dataset.pmewShellBootstrap = "main.js";
        loader.addEventListener("error", () => {
            console.error("[PMEW] main.js could not bootstrap pradako-site-shell.js.");
        }, { once: true });
        (document.head || document.documentElement).appendChild(loader);
    }

    function mainGlobalScriptPresent() {
        return Boolean(
            window.__pradakoMainScriptLoaded ||
            Array.from(document.scripts).some((script) =>
                /(?:^|\/)scripts\.js(?:[?#]|$)/i.test(script.src || "")
            )
        );
    }

    function initializeLegacyNavbar() {
        if (legacyReady || mainGlobalScriptPresent()) return;

        const navbar = document.getElementById("navbar-container");
        if (!navbar || !navbar.children.length) return;

        legacyReady = true;
        document.body.dataset.legacyNavbarReady = "true";

        const dropdownToggles = document.querySelectorAll(".dropdown > a");
        dropdownToggles.forEach((toggle) => {
            toggle.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                const parentDropdown = this.parentElement;
                const isActive = parentDropdown.classList.contains("active");

                document.querySelectorAll(".dropdown").forEach((dropdown) => {
                    dropdown.classList.remove("active");
                });

                if (!isActive) parentDropdown.classList.add("active");
            });
        });

        document.addEventListener("click", (event) => {
            if (!event.target.closest(".dropdown")) {
                document.querySelectorAll(".dropdown").forEach((dropdown) => {
                    dropdown.classList.remove("active");
                });
            }
        });

        const hamburger = document.getElementById("hamburgerBtn");
        const overlay = document.getElementById("mobileOverlay");
        const mobileMenu = document.getElementById("mobileMenu");
        const closeMenuBtn = document.getElementById("closeMenuBtn");
        const body = document.body;
        let scrollY = 0;

        function openMobileMenu() {
            if (!overlay || !mobileMenu) return;
            scrollY = window.scrollY;
            overlay.classList.add("active");
            mobileMenu.classList.add("active");
            body.classList.add("menu-open");
            body.style.top = `-${scrollY}px`;
        }

        function closeMobileMenu() {
            if (!overlay || !mobileMenu) return;
            overlay.classList.remove("active");
            mobileMenu.classList.remove("active");
            body.classList.remove("menu-open");
            body.style.top = "";
            window.scrollTo(0, scrollY);
        }

        hamburger?.addEventListener("click", openMobileMenu);
        closeMenuBtn?.addEventListener("click", closeMobileMenu);
        overlay?.addEventListener("click", closeMobileMenu);

        document.querySelectorAll(".accordion-btn").forEach((button) => {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                const submenu = this.nextElementSibling;
                submenu?.classList.toggle("open");
                this.classList.toggle("open");
            });
        });
    }

    function boot() {
        ensurePermanentShell();
        if (window.__PMEW_SHELL_LOADED__) initializeLegacyNavbar();
    }

    window.addEventListener("pmew:shell-loaded", initializeLegacyNavbar);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
        boot();
    }

}(window, document));
