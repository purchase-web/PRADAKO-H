"use strict";

/* =====================================================
   PMEW SHARED LEADERSHIP PAGE JS
   -----------------------------------------------------
   Shared by Founder, Chairman and Chairwoman pages.
   Owns:
   - CTA smooth scroll
   - collaboration form validation/submission
   - field-error reset
   Generic reveal animations remain in pradako-global-animations.js.
===================================================== */

(function (window, document) {
    if (window.__PMEW_LEADERSHIP_JS__) return;
    window.__PMEW_LEADERSHIP_JS__ = true;

    function initLeadershipCtaScroll() {
        const ctaLinks = document.querySelectorAll('a[href="#leadership-collaboration-form"]');

        ctaLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                const target = document.getElementById("leadership-collaboration-form");
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        });
    }

    function initLeadershipCollaborationForm() {
        const form = document.getElementById("leadershipCollaborationForm");
        if (!form || form.dataset.pmewLeadershipFormReady === "true") return;

        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        form.dataset.pmewLeadershipFormReady = "true";

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const requiredFields = form.querySelectorAll("[required]");
            let isValid = true;

            requiredFields.forEach((field) => {
                const valid = typeof field.checkValidity === "function"
                    ? field.checkValidity()
                    : Boolean(String(field.value || "").trim());

                field.classList.toggle("leadership-field-error", !valid);
                if (!valid) isValid = false;
            });

            if (!isValid) {
                const firstInvalid = form.querySelector(".leadership-field-error");
                firstInvalid?.focus();
                alert("Please fill all required fields before submitting.");
                return;
            }

            const originalButtonText = submitButton.textContent.trim();
            submitButton.disabled = true;
            submitButton.textContent = "SENDING...";

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: form.method || "POST",
                    body: formData
                });

                if (!response.ok) throw new Error("Form submission failed");

                submitButton.textContent = "REQUEST SENT SUCCESSFULLY";
                form.reset();
            } catch (error) {
                console.error("Leadership collaboration form submission failed:", error);
                submitButton.textContent = "PLEASE TRY AGAIN";
                alert("Unable to send right now. Please try again or contact us directly.");
            } finally {
                window.setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }, 2500);
            }
        });
    }

    function initLeadershipFormErrorReset() {
        const fields = document.querySelectorAll(
            "#leadershipCollaborationForm input, #leadershipCollaborationForm select, #leadershipCollaborationForm textarea"
        );

        fields.forEach((field) => {
            if (field.dataset.pmewLeadershipErrorReset === "true") return;
            field.dataset.pmewLeadershipErrorReset = "true";

            const clearError = () => field.classList.remove("leadership-field-error");
            field.addEventListener("input", clearError);
            field.addEventListener("change", clearError);
        });
    }

    function initLeadershipPage() {
        if (document.body.dataset.pmewLeadershipReady === "true") return;
        document.body.dataset.pmewLeadershipReady = "true";

        initLeadershipCtaScroll();
        initLeadershipCollaborationForm();
        initLeadershipFormErrorReset();
    }

    window.PMEWLeadership = {
        init: initLeadershipPage
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initLeadershipPage, { once: true });
    } else {
        initLeadershipPage();
    }

}(window, document));
