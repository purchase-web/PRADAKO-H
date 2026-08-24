/*
 * PMEW REFERENCE IN PREPARATION — V16 LIGHTWEIGHT
 *
 * Initial page load:
 * - reads query parameters only;
 * - does not load the standards page index;
 * - does not run page-existence checks;
 * - does not load standard-navigation.js.
 *
 * standard-navigation.js is loaded lazily only when "Check again" is used.
 */
(function (window, document) {
    "use strict";

    var NAVIGATION_SCRIPT = "/assets/js/standard-navigation.js";
    var navigationPromise = null;

    function clean(value) {
        return String(value == null ? "" : value)
            .replace(/\s+/g, " ")
            .trim();
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {
        var node = byId(id);

        if (node) {
            node.textContent = value;
        }
    }

    function safeReturn(value) {
        try {
            var url = new URL(
                value || "/pages/products/products.html",
                window.location.origin
            );

            if (url.origin !== window.location.origin) {
                return "/pages/products/products.html";
            }

            return url.pathname + url.search + url.hash;
        } catch (error) {
            return "/pages/products/products.html";
        }
    }

    function requestUrl(standard) {
        var url = new URL(
            "/pages/contact/contact-us.html",
            window.location.origin
        );

        url.searchParams.set("standard", standard);
        url.searchParams.set(
            "request",
            "technical-reference"
        );

        return url.pathname + url.search;
    }

    function ensureNavigation() {
        if (
            window.PMEWStandardNavigation &&
            typeof window.PMEWStandardNavigation.resolveStandard === "function"
        ) {
            return Promise.resolve(
                window.PMEWStandardNavigation
            );
        }

        if (navigationPromise) {
            return navigationPromise;
        }

        navigationPromise = new Promise(
            function (resolve, reject) {
                var existing = document.querySelector(
                    'script[src^="' +
                    NAVIGATION_SCRIPT +
                    '"]'
                );

                function finish() {
                    if (
                        window.PMEWStandardNavigation &&
                        typeof window.PMEWStandardNavigation.resolveStandard === "function"
                    ) {
                        resolve(
                            window.PMEWStandardNavigation
                        );
                    } else {
                        reject(
                            new Error(
                                "Standard navigation did not initialise."
                            )
                        );
                    }
                }

                if (existing) {
                    existing.addEventListener(
                        "load",
                        finish,
                        { once: true }
                    );
                    existing.addEventListener(
                        "error",
                        reject,
                        { once: true }
                    );

                    window.setTimeout(finish, 0);
                    return;
                }

                var script = document.createElement(
                    "script"
                );

                script.src = NAVIGATION_SCRIPT;
                script.async = true;

                script.addEventListener(
                    "load",
                    finish,
                    { once: true }
                );

                script.addEventListener(
                    "error",
                    function () {
                        reject(
                            new Error(
                                "Unable to load standard navigation."
                            )
                        );
                    },
                    { once: true }
                );

                document.head.appendChild(script);
            }
        ).catch(function (error) {
            navigationPromise = null;
            throw error;
        });

        return navigationPromise;
    }

    async function checkAgain(
        standard,
        button
    ) {
        if (button) {
            button.disabled = true;
            button.setAttribute(
                "aria-busy",
                "true"
            );
        }

        setText(
            "pmewWorkMessage",
            "Checking the Pradako Engineering Library…"
        );

        try {
            var navigation =
                await ensureNavigation();

            var result =
                await navigation.resolveStandard(
                    standard
                );

            if (
                result &&
                result.status === "ready" &&
                result.url
            ) {
                setText(
                    "pmewWorkMessage",
                    "Reference found. Opening the individual page…"
                );

                window.setTimeout(
                    function () {
                        window.location.href =
                            result.url;
                    },
                    300
                );

                return;
            }

            setText(
                "pmewWorkMessage",
                "Still in preparation. Please check again later or request the reference from our team."
            );
        } catch (error) {
            setText(
                "pmewWorkMessage",
                "We couldn’t complete the check right now. Please try again."
            );
        } finally {
            if (button) {
                button.disabled = false;
                button.removeAttribute(
                    "aria-busy"
                );
            }
        }
    }

    function init() {
        var params =
            new URLSearchParams(
                window.location.search
            );

        var standard =
            clean(
                params.get("standard")
            ) ||
            "STANDARD REFERENCE";

        var returnUrl =
            safeReturn(
                params.get("return")
            );

        document.title =
            standard +
            " — We’re Working On It | Pradako";

        setText(
            "pmewWorkStandard",
            standard
        );

        var request =
            byId("pmewWorkRequest");

        if (request) {
            request.setAttribute(
                "href",
                requestUrl(standard)
            );
        }

        var back =
            byId("pmewWorkBack");

        if (back) {
            back.setAttribute(
                "href",
                returnUrl
            );
        }

        var check =
            byId("pmewWorkCheck");

        if (check) {
            check.addEventListener(
                "click",
                function () {
                    checkAgain(
                        standard,
                        check
                    );
                }
            );
        }
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

}(window, document));
