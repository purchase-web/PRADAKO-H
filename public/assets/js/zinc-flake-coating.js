"use strict";

/* ==========================================================
   ZINC FLAKE COATING PAGE JS
   Cleaned version:
   - Removed duplicate reveal animation system
   - Global animation is handled by /js/pradako-global-animations.js
   - Kept process timeline active state and smooth scroll
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initializeProcessTimeline();
    initializeZincSmoothScroll();
});

function initializeProcessTimeline() {
    const processSection = document.querySelector(".zinc-process");
    const processSteps = document.querySelectorAll(".process-step");

    if (!processSection || !processSteps.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                processSteps.forEach((step, index) => {
                    setTimeout(() => {
                        step.classList.add("active");
                    }, index * 120);
                });

                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.35 }
    );

    observer.observe(processSection);
}

function initializeZincSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (event) {
            const href = this.getAttribute("href");
            if (!href || href === "#") return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();

            window.scrollTo({
                top: target.offsetTop - 120,
                behavior: "smooth"
            });
        });
    });
}