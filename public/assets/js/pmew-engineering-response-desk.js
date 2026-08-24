/* =========================================================
PMEW ENGINEERING RESPONSE DESK JS
Corrected Full JS
Safe for fetched homepage section
========================================================= */

(function () {
    "use strict";

    window.initPmewEngineeringResponseDesk = function initPmewEngineeringResponseDesk() {
        const section = document.getElementById("pmew-engineering-response-desk");
        if (!section) return;

        if (section.dataset.erdInitialized === "true") return;
        section.dataset.erdInitialized = "true";

        const PMEW_EMAIL = "purchase@pradakomechanicals.com";

        const form = section.querySelector("#pmewErdForm");
        const serviceSelect = section.querySelector("#erdService");
        const resultWrap = section.querySelector("#pmewErdResultWrap");
        const resultBox = section.querySelector("#pmewErdResult");

        const copyBtn = section.querySelector("#pmewErdCopy");
        const whatsappBtn = section.querySelector("#pmewErdWhatsapp");
        const emailBtn = section.querySelector("#pmewErdEmail");

        let latestEnquiryText = "";

        function getValue(selector) {
            const element = section.querySelector(selector);
            return element ? element.value.trim() : "";
        }

        function buildEnquiryText() {
            const service = getValue("#erdService");
            const company = getValue("#erdCompany");
            const contact = getValue("#erdContact");
            const product = getValue("#erdProduct");
            const quantity = getValue("#erdQuantity");
            const details = getValue("#erdDetails");

            return `PMEW Engineering Response Desk Enquiry

Requirement Type:
${service || "Not specified"}

Name / Company:
${company || "Not specified"}

Email / Phone:
${contact || "Not specified"}

Product / Standard:
${product || "Not specified"}

Quantity / Urgency:
${quantity || "Not specified"}

Requirement Details:
${details || "Not specified"}

Attachments to be shared separately:
Drawing / BOM / Sample Photo / Enquiry Sheet / Inspection Report / Standard Reference

Request:
Please review the above requirement and guide the next step based on stock, tooling, production feasibility, QC clearance and logistics feasibility.`;
        }

        function fallbackCopy(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.setAttribute("readonly", "");
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";

            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand("copy");
            } catch (error) {
                console.warn("Copy failed", error);
            }

            document.body.removeChild(textarea);
        }

        function copyText(text) {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            }

            fallbackCopy(text);
            return Promise.resolve();
        }

        function updateButtonText(button, text, resetText) {
            if (!button) return;

            button.textContent = text;

            window.setTimeout(function () {
                button.textContent = resetText;
            }, 1600);
        }

        /* =========================================================
        Card button service preselect
        ========================================================= */

        section.querySelectorAll("[data-erd-select]").forEach(function (button) {
            button.addEventListener("click", function () {
                const selectedService = button.getAttribute("data-erd-select");

                if (serviceSelect && selectedService) {
                    serviceSelect.value = selectedService;
                }

                if (form) {
                    form.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }

                window.setTimeout(function () {
                    if (serviceSelect) {
                        serviceSelect.focus();
                    }
                }, 450);
            });
        });

        /* =========================================================
        Generate enquiry text
        ========================================================= */

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                latestEnquiryText = buildEnquiryText();

                if (resultBox) {
                    resultBox.textContent = latestEnquiryText;
                }

                if (resultWrap) {
                    resultWrap.classList.add("is-visible");
                }

                copyText(latestEnquiryText)
                    .then(function () {
                        updateButtonText(copyBtn, "Copied", "Copy Enquiry");
                    })
                    .catch(function () {
                        updateButtonText(copyBtn, "Copy Manually", "Copy Enquiry");
                    });
            });
        }

        /* =========================================================
        Copy action
        ========================================================= */

        if (copyBtn) {
            copyBtn.addEventListener("click", function () {
                latestEnquiryText = latestEnquiryText || buildEnquiryText();

                copyText(latestEnquiryText)
                    .then(function () {
                        updateButtonText(copyBtn, "Copied", "Copy Enquiry");
                    })
                    .catch(function () {
                        updateButtonText(copyBtn, "Copy Failed", "Copy Enquiry");
                    });
            });
        }

        /* =========================================================
        WhatsApp action
        ========================================================= */

        if (whatsappBtn) {
            whatsappBtn.addEventListener("click", function () {
                latestEnquiryText = latestEnquiryText || buildEnquiryText();

                const whatsappUrl =
                    "https://wa.me/?text=" + encodeURIComponent(latestEnquiryText);

                window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            });
        }

        /* =========================================================
        Email action
        ========================================================= */

        if (emailBtn) {
            emailBtn.addEventListener("click", function () {
                latestEnquiryText = latestEnquiryText || buildEnquiryText();

                const subject = "PMEW Engineering Response Desk Enquiry";

                const mailtoUrl =
                    "mailto:" + encodeURIComponent(PMEW_EMAIL) +
                    "?subject=" + encodeURIComponent(subject) +
                    "&body=" + encodeURIComponent(latestEnquiryText);

                window.location.href = mailtoUrl;
            });
        }

        /* =========================================================
        Reveal animation
        IMPORTANT:
        The form is intentionally NOT included here.
        This prevents the form fields from disappearing.
        ========================================================= */

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const motionTargets = [
            ...section.querySelectorAll(".pmew-erd__header"),
            ...section.querySelectorAll(".pmew-erd__problem-strip"),
            ...section.querySelectorAll(".pmew-erd__problem-item"),
            ...section.querySelectorAll(".pmew-erd__card"),
            ...section.querySelectorAll(".pmew-erd__command-left"),
            ...section.querySelectorAll(".pmew-erd__flow div"),
            ...section.querySelectorAll(".pmew-erd__trust-note")
        ];

        motionTargets.forEach(function (item, index) {
            item.classList.add("pmew-erd__motion-item");

            const delay = Math.min(index * 52, 520);
            item.style.setProperty("--motion-delay", delay + "ms");
        });

        if (reduceMotion) {
            motionTargets.forEach(function (item) {
                item.classList.add("is-motion-visible");
            });
        } else if ("IntersectionObserver" in window) {
            const motionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-motion-visible");
                        motionObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: "0px 0px -8% 0px"
            });

            motionTargets.forEach(function (item) {
                motionObserver.observe(item);
            });
        } else {
            motionTargets.forEach(function (item) {
                item.classList.add("is-motion-visible");
            });
        }

        /* =========================================================
        Desktop card tilt
        ========================================================= */

        const cards = section.querySelectorAll(".pmew-erd__card");

        cards.forEach(function (card) {
            let rafId = null;

            function updateCardTilt(event) {
                const rect = card.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((centerY - y) / centerY) * 2.8;
                const rotateY = ((x - centerX) / centerX) * 3.2;

                card.style.setProperty("--mx", x + "px");
                card.style.setProperty("--my", y + "px");

                card.style.transform =
                    "perspective(1100px) rotateX(" +
                    rotateX +
                    "deg) rotateY(" +
                    rotateY +
                    "deg) translateY(-5px)";
            }

            card.addEventListener("pointermove", function (event) {
                if (window.innerWidth < 900) return;

                if (rafId) {
                    cancelAnimationFrame(rafId);
                }

                rafId = requestAnimationFrame(function () {
                    updateCardTilt(event);
                });
            });

            card.addEventListener("pointerleave", function () {
                if (window.innerWidth < 900) return;

                if (rafId) {
                    cancelAnimationFrame(rafId);
                }

                card.style.transform = "";
            });
        });

        /* =========================================================
        Button ripple
        ========================================================= */

        const rippleButtons = section.querySelectorAll(
            ".pmew-erd__card-btn, .pmew-erd__submit, .pmew-erd__actions button"
        );

        rippleButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement("span");

                ripple.className = "pmew-erd__btn-ripple";
                ripple.style.left = event.clientX - rect.left + "px";
                ripple.style.top = event.clientY - rect.top + "px";

                button.appendChild(ripple);

                window.setTimeout(function () {
                    ripple.remove();
                }, 600);
            });
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            window.initPmewEngineeringResponseDesk();
        });
    } else {
        window.initPmewEngineeringResponseDesk();
    }
})();