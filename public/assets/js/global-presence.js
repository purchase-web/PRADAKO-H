"use strict";

function initPradakoGlobalPresence() {
    const pradakoGpSection = document.getElementById("pradakoGlobalPresence");
    if (!pradakoGpSection) return;

    const activatePradakoGlobalPresence = () => {
        pradakoGpSection.classList.add("pradako-gp-active");
    };

    if ("IntersectionObserver" in window) {
        const pradakoGpObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    activatePradakoGlobalPresence();
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.2 }
        );

        pradakoGpObserver.observe(pradakoGpSection);
    } else {
        activatePradakoGlobalPresence();
    }
}


function initGlobalPresenceReveal() {
    const elements = Array.from(document.querySelectorAll(".pmew-global-reveal"));
    if (!elements.length) return;

    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = (element) => {
        element.classList.remove("pmew-global-reveal--pending");
        element.classList.add("pmew-global-reveal--visible");
    };

    /* Progressive enhancement: sections remain visible if JS/observer fails. */
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        elements.forEach(show);
        return;
    }

    elements.forEach((element) => {
        element.classList.add("pmew-global-reveal--pending");
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                show(entry.target);
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -6% 0px"
        }
    );

    elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const alreadyInView = rect.bottom > 0 && rect.top < window.innerHeight * 0.94;

        if (alreadyInView) {
            show(element);
        } else {
            observer.observe(element);
        }
    });
}

function populateCountryDropdown() {
    const countrySelect = document.getElementById("globalCountrySelect");
    if (!countrySelect) return;

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
        "Bahrain", "Bangladesh", "Belgium", "Brazil", "Canada", "China",
        "France", "Germany", "India", "Italy", "Japan", "Mexico", "Netherlands",
        "Poland", "Saudi Arabia", "Singapore", "South Africa", "South Korea",
        "Spain", "Sweden", "Switzerland", "Turkey", "UAE", "United Kingdom", "United States"
    ];

    const existingCountries = Array.from(countrySelect.options).map(
        (option) => option.value || option.textContent
    );

    countries.forEach((country) => {
        if (existingCountries.includes(country)) return;

        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

function initGlobalRfqScroll() {
    const rfqButtons = document.querySelectorAll('a[href="#global-export-form"]');

    rfqButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const target = document.getElementById("global-export-form");
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
}

function initGlobalExportForm() {
    const form = document.getElementById("global-export-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
        const requiredFields = form.querySelectorAll("[required]");
        let isValid = true;

        requiredFields.forEach((field) => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add("field-error");
            } else {
                field.classList.remove("field-error");
            }
        });

        if (!isValid) {
            event.preventDefault();
            alert("Please fill all required fields before submitting.");
        }
    });
}

function initFieldErrorReset() {
    const fields = document.querySelectorAll(
        "#global-export-form input, #global-export-form select, #global-export-form textarea"
    );

    fields.forEach((field) => {
        const clearError = () => field.classList.remove("field-error");
        field.addEventListener("input", clearError);
        field.addEventListener("change", clearError);
    });
}

function initPremiumCardMovement() {
    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll(
        ".pradako-gp-card, .pmew-global-market-row, .pmew-global-trust-row, .pradako-global-premium-info-card"
    );

    cards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -2;
            const rotateY = ((x - centerX) / centerX) * 2;

            card.style.transform = `
                perspective(900px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-3px)
            `;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });
}

function initGlobalPresencePage() {
    if (document.body.dataset.pmewGlobalPresenceReady === "true") return;
    document.body.dataset.pmewGlobalPresenceReady = "true";

    initPradakoGlobalPresence();
    initGlobalPresenceReveal();
    populateCountryDropdown();
    initGlobalRfqScroll();
    initGlobalExportForm();
    initFieldErrorReset();
    initPremiumCardMovement();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobalPresencePage, { once: true });
} else {
    initGlobalPresencePage();
}