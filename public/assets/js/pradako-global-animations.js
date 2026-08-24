"use strict";

/* ==========================================================
   PRADAKO GLOBAL WEBSITE ANIMATION SYSTEM
   File: /js/pradako-global-animations.js

   Purpose:
   - One premium animation system for the complete website
   - Supports existing classes:
     .reveal / .show
     .fade / .active
     .reveal-element / .revealed
     .pg-animate / .pg-visible
     .pmew-page-animate / .pmew-page-visible
   - Works with dynamically generated product/specification cards
   - Keeps page-specific features safe
========================================================== */

(function () {
    if (window.__pradakoGlobalAnimationSystemLoaded) return;
    window.__pradakoGlobalAnimationSystemLoaded = true;

    const PREFERS_REDUCED_MOTION =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ANIMATION_STYLE_ID = "pradako-global-animation-style";

    function injectPradakoGlobalAnimationCSS() {
        if (document.getElementById(ANIMATION_STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = ANIMATION_STYLE_ID;

        style.textContent = `
            .pmew-global-animate {
                opacity: 0;
                transform: translateY(28px);
                filter: blur(5px);
                transition:
                    opacity 0.78s cubic-bezier(.16, 1, .3, 1),
                    transform 0.78s cubic-bezier(.16, 1, .3, 1),
                    filter 0.78s cubic-bezier(.16, 1, .3, 1);
                transition-delay: calc(var(--pmew-animation-delay, 0) * 58ms);
                will-change: opacity, transform, filter;
            }

            .pmew-global-visible {
                opacity: 1;
                transform: translateY(0);
                filter: blur(0);
            }

            .pmew-global-animate-left { transform: translateX(-26px); }
            .pmew-global-animate-right { transform: translateX(26px); }
            .pmew-global-animate-soft { transform: translateY(18px); filter: blur(3px); }
            .pmew-global-animate-zoom { transform: scale(0.965); filter: blur(4px); }

            .pmew-global-visible.pmew-global-animate-left,
            .pmew-global-visible.pmew-global-animate-right,
            .pmew-global-visible.pmew-global-animate-soft,
            .pmew-global-visible.pmew-global-animate-zoom {
                transform: translate(0, 0) scale(1);
                filter: blur(0);
            }

            .pmew-hero-animate {
                opacity: 0;
                transform: translateY(24px);
                filter: blur(4px);
                transition:
                    opacity 0.9s cubic-bezier(.16, 1, .3, 1),
                    transform 0.9s cubic-bezier(.16, 1, .3, 1),
                    filter 0.9s cubic-bezier(.16, 1, .3, 1);
                transition-delay: calc(var(--pmew-animation-delay, 0) * 80ms);
                will-change: opacity, transform, filter;
            }

            .pmew-hero-visible {
                opacity: 1;
                transform: translateY(0);
                filter: blur(0);
            }

            .pmew-image-animate {
                opacity: 0;
                transform: scale(0.97);
                filter: blur(4px);
                transition:
                    opacity 0.9s cubic-bezier(.16, 1, .3, 1),
                    transform 0.9s cubic-bezier(.16, 1, .3, 1),
                    filter 0.9s cubic-bezier(.16, 1, .3, 1);
                transition-delay: calc(var(--pmew-animation-delay, 0) * 60ms);
                will-change: opacity, transform, filter;
            }

            .pmew-image-visible {
                opacity: 1;
                transform: scale(1);
                filter: blur(0);
            }

            .pmew-section-visible { --pmew-section-is-visible: 1; }

            .pmew-global-scroll-progress {
                position: fixed;
                left: 0;
                top: 0;
                width: 0%;
                height: 4px;
                background: linear-gradient(90deg, #0A3D62, #D8A514);
                z-index: 999999;
                pointer-events: none;
                transition: width 0.08s linear;
            }

            .pmew-header-scrolled {
                box-shadow: 0 10px 30px rgba(9, 33, 52, 0.10);
            }

            @media (prefers-reduced-motion: reduce) {
                .pmew-global-animate,
                .pmew-hero-animate,
                .pmew-image-animate,
                .pg-animate,
                .reveal,
                .fade,
                .reveal-element,
                .pmew-page-animate {
                    opacity: 1 !important;
                    transform: none !important;
                    filter: none !important;
                    transition: none !important;
                    animation: none !important;
                    transition-delay: 0ms !important;
                }

                .pmew-global-scroll-progress { display: none !important; }
            }
        `;

        document.head.appendChild(style);
    }

    const HERO_TEXT_SELECTORS = [
        ".hero h1", ".hero h2", ".hero p", ".hero .hero-cta", ".hero .cta-primary", ".hero .cta-secondary", ".hero a",
        ".pradako-products-hero h1", ".pradako-products-hero-bottom", ".pradako-products-hero-cta",
        ".gp-hero h1", ".gp-hero p", ".gp-hero-kicker", ".gp-rfq-btn",
        ".contact-hero h1", ".contact-hero p",
        ".privacy-hero h1", ".privacy-hero p", ".privacy-tag", ".privacy-meta",
        ".cookie-hero h1", ".cookie-hero p", ".cookie-tag", ".cookie-meta",
        ".zinc-hero h1", ".zinc-hero-subtitle",
        ".chairman-hero-title", ".chairman-hero-subtitle", ".chairman-hero-actions",
        ".chairwoman-hero-title", ".chairwoman-hero-subtitle", ".chairwoman-hero-actions",
        ".founder-hero-title", ".founder-hero-subtitle", ".founder-hero-actions",
        ".spec-hero h1", ".spec-hero p", ".hero-card .eyebrow", ".hero-card .hero-content", ".hero-card .hero-stats"
    ].join(",");

    const GLOBAL_REVEAL_SELECTORS = [
        "[data-pmew-animate]",
        ".reveal", ".fade", ".reveal-element", ".pg-animate", ".pmew-page-animate",
        "section > .container", ".section-header", ".section-heading", ".section-title", ".page-heading", ".page-title", ".section-eyebrow", ".section-description", ".section-large-text", ".section-divider",
        ".intro", ".certification-section", ".quality-certificates", ".timeline-section", ".division-section", ".portfolio-section", ".strength-section", ".framework-section",
        ".division-card", ".certificate-card", ".timeline-block", ".portfolio-card", ".strength-card", ".framework-box", ".global-card",
        ".pradako-products-title", ".pradako-products-section-title", ".pradako-products-controls", ".pradako-products-card", ".pradako-products-standard-card", ".pradako-catalogue-type-card", ".pradako-catalogue-subtype-block", ".pradako-catalogue-subcat-card", ".pradako-catalogue-product-card", ".pradako-standard-group-section", ".pradako-products-hot-card", ".pradako-products-info-card", ".pradako-producttype-premium-inner", ".pradako-producttype-premium-mini-card", ".pradako-producttype-premium-form-card",
        ".spec-controls", ".spec-card", ".spec-matrix-card", ".spec-table-wrap", ".authority-card", ".family-card", ".library-card", ".hero-card",
        ".gp-rfq-top", ".gp-section", ".gp-card", ".gp-stat-card", ".gp-panel", ".gp-region-card", ".gp-form-card", ".gp-mini-card", ".gp-market-card", ".gp-trust-card", ".pradako-global-premium-info-card", ".pradako-global-premium-left", ".pradako-global-premium-right",
        ".pradako-app-badge", ".pradako-app-title", ".pradako-app-description", ".pradako-app-table-section", ".pradako-app-card", ".pradako-app-row",
        ".contact-hero-content", ".region", ".capabilities", ".grid", ".card", ".contact-card", ".contact-form", ".contact-map",
        ".privacy-sidebar-inner", ".privacy-section", ".privacy-content", ".privacy-layout",
        ".cookie-section", ".cookie-content", ".cookie-card",
        ".zinc-tech-card", ".zinc-benefit-card", ".process-step", ".zinc-testing-card", ".zinc-environment-card",
        ".chairman-container", ".chairwoman-container", ".section-container", ".leadership-collaboration-section", ".leadership-form-card", ".leadership-card",
        ".blackoxide-reveal", ".manufacturing-reveal", ".best-fade",
        ".btn-primary", ".btn-secondary", ".learn-btn", ".cta-primary", ".cta-secondary"
    ].join(",");

    const IMAGE_REVEAL_SELECTORS = [
        ".hero img", ".pradako-app-hero-image", ".division-icon img", ".certificate-card img", ".product-slider", ".gallery-item img",
        ".pradako-products-image-box img", ".pradako-products-standard-img img", ".pradako-catalogue-type-art img", ".pradako-catalogue-subcat-image img", ".pradako-catalogue-product-image img", ".pradako-products-hot-card > img",
        ".chairman-image img", ".chairwoman-image img", ".founder-image img"
    ].join(",");

    const HERO_MICRO_SELECTORS = [
        ".hero", ".pradako-products-hero", ".gp-hero", ".contact-hero", ".privacy-hero", ".cookie-hero", ".zinc-hero", ".chairman-hero-section", ".chairwoman-hero-section", ".founder-hero-section", ".pradako-app-hero"
    ].join(",");

    function isElement(node) {
        return node instanceof HTMLElement;
    }

    function shouldSkipElement(element) {
        if (!element || !isElement(element)) return true;
        if (element.closest("[data-pmew-no-animate='true']")) return true;
        if (element.matches("script, style, noscript, template")) return true;
        if (element.closest(".mobile-menu, #mobileOverlay, #mobileMenu, .mobileOverlay")) return true;
        return false;
    }

    function setDelay(element, index, max = 8) {
        element.style.setProperty("--pmew-animation-delay", String(index % max));
    }

    function addVisibleCompatibilityClasses(element) {
        element.classList.add("pmew-global-visible");

        if (element.classList.contains("pmew-hero-animate")) element.classList.add("pmew-hero-visible");
        if (element.classList.contains("pmew-image-animate")) element.classList.add("pmew-image-visible");
        if (element.classList.contains("reveal")) element.classList.add("show");
        if (element.classList.contains("fade")) element.classList.add("active");
        if (element.classList.contains("reveal-element")) element.classList.add("revealed");
        if (element.classList.contains("pg-animate")) element.classList.add("pg-visible");
        if (element.classList.contains("pmew-page-animate")) element.classList.add("pmew-page-visible");
        if (element.classList.contains("blackoxide-reveal")) element.classList.add("show");
        if (element.classList.contains("manufacturing-reveal")) element.classList.add("show");
        if (element.classList.contains("best-fade")) element.classList.add("show");
    }

    let globalObserver = null;

    function createGlobalObserver() {
        if (PREFERS_REDUCED_MOTION || !("IntersectionObserver" in window)) return null;

        return new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    addVisibleCompatibilityClasses(entry.target);
                    globalObserver?.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -70px 0px" }
        );
    }

    function observeElement(element) {
        if (PREFERS_REDUCED_MOTION || !globalObserver) {
            addVisibleCompatibilityClasses(element);
            return;
        }
        globalObserver.observe(element);
    }

    function prepareHeroText(root = document) {
        const elements = Array.from(root.querySelectorAll(HERO_TEXT_SELECTORS));
        elements.forEach((element, index) => {
            if (shouldSkipElement(element) || element.dataset.pmewHeroAnimated === "true") return;
            element.dataset.pmewHeroAnimated = "true";
            element.classList.add("pmew-hero-animate");
            setDelay(element, index, 7);
            observeElement(element);
        });
    }

    function prepareGlobalReveal(root = document) {
        const elements = Array.from(root.querySelectorAll(GLOBAL_REVEAL_SELECTORS));
        elements.forEach((element, index) => {
            if (shouldSkipElement(element) || element.dataset.pmewGlobalAnimated === "true") return;
            element.dataset.pmewGlobalAnimated = "true";
            element.classList.add("pmew-global-animate");

            const mode = element.dataset.pmewAnimate;
            if (mode === "left") element.classList.add("pmew-global-animate-left");
            else if (mode === "right") element.classList.add("pmew-global-animate-right");
            else if (mode === "zoom") element.classList.add("pmew-global-animate-zoom");
            else if (index % 5 === 2) element.classList.add("pmew-global-animate-soft");

            setDelay(element, index, 9);
            observeElement(element);
        });
    }

    function prepareImageReveal(root = document) {
        const elements = Array.from(root.querySelectorAll(IMAGE_REVEAL_SELECTORS));
        elements.forEach((element, index) => {
            if (shouldSkipElement(element) || element.dataset.pmewImageAnimated === "true") return;
            if (element.closest(".product-slider, .slider") || element.classList.contains("slide")) return;

            element.dataset.pmewImageAnimated = "true";
            element.classList.add("pmew-image-animate");
            setDelay(element, index, 6);
            observeElement(element);
        });
    }

    function prepareSectionVisibility(root = document) {
        const sections = Array.from(root.querySelectorAll("section"));
        if (!sections.length) return;

        const sectionObserver = PREFERS_REDUCED_MOTION || !("IntersectionObserver" in window)
            ? null
            : new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add("pmew-section-visible");
                        sectionObserver.unobserve(entry.target);
                    });
                },
                { threshold: 0.08, rootMargin: "0px 0px -100px 0px" }
            );

        sections.forEach((section) => {
            if (section.dataset.pmewSectionObserved === "true") return;
            section.dataset.pmewSectionObserved = "true";
            if (!sectionObserver) section.classList.add("pmew-section-visible");
            else sectionObserver.observe(section);
        });
    }

    function prepareAllAnimations(root = document) {
        if (!root) return;
        prepareHeroText(root);
        prepareGlobalReveal(root);
        prepareImageReveal(root);
        prepareSectionVisibility(root);
    }

    function initMutationWatcher() {
        if (!("MutationObserver" in window)) return;

        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (!isElement(node) || shouldSkipElement(node)) return;
                    prepareAllAnimations(node);
                });
            });
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    function initHeroMicroMovement() {
        if (PREFERS_REDUCED_MOTION) return;

        const heroes = Array.from(document.querySelectorAll(HERO_MICRO_SELECTORS));
        if (!heroes.length) return;

        let ticking = false;

        function updateHeroMovement() {
            heroes.forEach((hero) => {
                if (!isElement(hero)) return;
                if (hero.dataset.pmewNoHeroMotion === "true" || hero.closest("[data-pmew-no-hero-motion='true']")) return;

                const backgroundImage = window.getComputedStyle(hero).backgroundImage;
                if (!backgroundImage || backgroundImage === "none") return;

                const rect = hero.getBoundingClientRect();
                if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

                const progress = Math.min(Math.max(Math.abs(rect.top) / Math.max(rect.height, 1), 0), 1);
                const offset = Math.round(progress * 18);
                hero.style.backgroundPosition = `center calc(50% + ${offset}px)`;
            });
            ticking = false;
        }

        function requestUpdate() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(updateHeroMovement);
        }

        requestUpdate();
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate);
    }

    function initOptionalScrollProgress() {
        const enabled =
            document.body.dataset.pmewScrollProgress === "true" ||
            document.documentElement.dataset.pmewScrollProgress === "true";

        if (!enabled || PREFERS_REDUCED_MOTION) return;
        if (document.querySelector(".pmew-global-scroll-progress")) return;

        const progress = document.createElement("div");
        progress.className = "pmew-global-scroll-progress";
        document.body.appendChild(progress);

        function updateProgress() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percentage = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
            progress.style.width = `${percentage}%`;
        }

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
    }

    function initHeaderScrollState() {
        const headers = document.querySelectorAll(".main-header, header, .pradako-products-nav");
        if (!headers.length) return;

        let ticking = false;

        function updateHeaderState() {
            const scrolled = window.scrollY > 24;
            headers.forEach((header) => {
                if (isElement(header)) header.classList.toggle("pmew-header-scrolled", scrolled);
            });
            ticking = false;
        }

        function requestUpdate() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(updateHeaderState);
        }

        updateHeaderState();
        window.addEventListener("scroll", requestUpdate, { passive: true });
    }

    window.pradakoRefreshAnimations = function () {
        prepareAllAnimations(document);
    };

    window.pradakoRevealNow = function (selector) {
        if (!selector) return;
        document.querySelectorAll(selector).forEach(addVisibleCompatibilityClasses);
    };

    function initPradakoGlobalAnimationSystem() {
        injectPradakoGlobalAnimationCSS();
        globalObserver = createGlobalObserver();
        prepareAllAnimations(document);
        initMutationWatcher();
        initHeroMicroMovement();
        initOptionalScrollProgress();
        initHeaderScrollState();
        window.dispatchEvent(new CustomEvent("pradako:animations-ready"));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initPradakoGlobalAnimationSystem);
    } else {
        initPradakoGlobalAnimationSystem();
    }
})();
