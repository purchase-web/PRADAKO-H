"use strict";

/* =========================================================
    PRADAKO FOOTER NEWSLETTER

    Existing project filename: footer.js

    This uses a delegated submit listener, so it continues to work when
    footer.html is injected by the permanent pradako-site-shell.js loader.
========================================================= */

(() => {
    const FORM_SELECTOR = "#pradako-footer-newsletter-form";

    const DEFAULT_ENDPOINT =
        "https://formsubmit.co/ajax/INFO@PRADAKOMECHANICALS.COM";

    document.addEventListener("submit", async (event) => {
        const form = event.target;

        /*
         * Ignore every form except the Pradako footer
         * newsletter subscription form.
         */
        if (
            !(form instanceof HTMLFormElement) ||
            !form.matches(FORM_SELECTOR)
        ) {
            return;
        }

        event.preventDefault();

        const emailInput = form.querySelector('input[name="email"]');
        const honeyInput = form.querySelector('input[name="_honey"]');
        const submitButton = form.querySelector(
            'button[type="submit"]'
        );
        const status = form.querySelector(
            ".footer-newsletter-status"
        );
        const buttonIcon = submitButton?.querySelector("i");

        /*
         * Stop if the required newsletter elements
         * are missing from the HTML.
         */
        if (
            !(emailInput instanceof HTMLInputElement) ||
            !(submitButton instanceof HTMLButtonElement) ||
            !(status instanceof HTMLElement)
        ) {
            console.warn(
                "Pradako newsletter form elements were not found."
            );
            return;
        }

        const email = emailInput.value.trim();

        emailInput.value = email;
        emailInput.removeAttribute("aria-invalid");

        status.className = "footer-newsletter-status";
        status.textContent = "";

        /*
         * Email validation.
         */
        if (!email || !emailInput.checkValidity()) {
            emailInput.setAttribute("aria-invalid", "true");

            status.classList.add("is-error");
            status.textContent =
                "Please enter a valid email address.";

            emailInput.focus();
            return;
        }

        /*
         * Honeypot spam protection.
         * Real users will never see or complete this input.
         */
        if (
            honeyInput instanceof HTMLInputElement &&
            honeyInput.value.trim()
        ) {
            form.reset();

            status.className =
                "footer-newsletter-status is-success";

            status.textContent =
                "Thank you. Your subscription has been received.";

            return;
        }

        const originalIconClass =
            buttonIcon?.className || "";

        /*
         * Stop the request if it takes longer than 15 seconds.
         */
        const controller = new AbortController();

        const timeoutId = window.setTimeout(() => {
            controller.abort();
        }, 15000);

        /*
         * Loading state.
         */
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");

        status.className =
            "footer-newsletter-status is-loading";

        status.textContent =
            "Submitting your subscription…";

        if (buttonIcon) {
            buttonIcon.className =
                "fa-solid fa-spinner fa-spin";
        }

        try {
            const formData = new FormData(form);

            /*
             * Ensure the cleaned email is submitted.
             */
            formData.set("email", email);

            /*
             * Additional information included in the email.
             */
            formData.set("page_url", window.location.href);

            formData.set(
                "submitted_at",
                new Date().toISOString()
            );

            /*
             * Use the endpoint defined in the form when present.
             * Otherwise, use the default FormSubmit endpoint.
             */
            const endpoint =
                form.dataset.ajaxEndpoint ||
                DEFAULT_ENDPOINT;

            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json"
                },
                signal: controller.signal
            });

            const result = await response
                .json()
                .catch(() => ({}));

            const successValue = result?.success;

            const wasSuccessful =
                response.ok &&
                (
                    successValue === true ||
                    successValue === "true" ||
                    successValue === undefined
                );

            if (!wasSuccessful) {
                throw new Error(
                    result?.message ||
                    "Subscription request failed."
                );
            }

            /*
             * Success state.
             */
            form.reset();

            status.className =
                "footer-newsletter-status is-success";

            status.textContent =
                "Thank you. You are now subscribed to Pradako updates.";
        } catch (error) {
            const timedOut =
                error instanceof DOMException &&
                error.name === "AbortError";

            status.className =
                "footer-newsletter-status is-error";

            status.textContent = timedOut
                ? "The request took too long. Please try again."
                : "Subscription could not be completed. Please try again or email INFO@PRADAKOMECHANICALS.COM.";

            console.error(
                "Pradako newsletter subscription error:",
                error
            );
        } finally {
            window.clearTimeout(timeoutId);

            submitButton.disabled = false;

            submitButton.removeAttribute("aria-busy");

            if (buttonIcon) {
                buttonIcon.className =
                    originalIconClass;
            }
        }
    });
})();