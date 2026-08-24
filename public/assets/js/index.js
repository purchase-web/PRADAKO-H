/* ==========================================================
   PMEW INDEX PAGE — PAGE NAVIGATION + UNIFIED 18-BANNER LOGIC

   This file contains JavaScript that was previously embedded
   inside index.html.

   Banner sequence:
   01     PRADAKO logo reveal
   02–08  Existing PMEW hero banners
   09–18  Colour-finishes continuation

   The hero uses one permanent Previous / Counter / Pause / Next
   control deck for all 18 logical banners.
   ========================================================== */

(function () {
    "use strict";

    /* ==========================================================
       1. STICKY PAGE NAVIGATION
       ========================================================== */

    function initPageNavigation() {
        const pageNavigation = document.getElementById("pageNavigation");
        const linksViewport = document.getElementById("pageNavigationLinks");

        if (
            !pageNavigation ||
            !linksViewport ||
            pageNavigation.dataset.initialized === "true"
        ) {
            return;
        }

        pageNavigation.dataset.initialized = "true";

        const links = Array.from(
            pageNavigation.querySelectorAll("[data-page-nav-link]")
        );
        const leftButton = pageNavigation.querySelector(
            '[data-page-nav-scroll="left"]'
        );
        const rightButton = pageNavigation.querySelector(
            '[data-page-nav-scroll="right"]'
        );
        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const destinations = links
            .map(function (link) {
                const selector = link.getAttribute("href");
                const section = selector
                    ? document.querySelector(selector)
                    : null;

                return section
                    ? {
                        link: link,
                        section: section,
                        selector: selector
                    }
                    : null;
            })
            .filter(Boolean);

        let ticking = false;

        function getNumberVariable(name) {
            const value = getComputedStyle(
                document.documentElement
            ).getPropertyValue(name);

            return Number.parseFloat(value) || 0;
        }

        function updateStickyMeasurements() {
            const navbarContainer = document.getElementById("navbar-container");
            let headerOffset = 0;

            if (navbarContainer) {
                const candidates = [navbarContainer].concat(
                    Array.from(
                        navbarContainer.querySelectorAll(
                            "header, nav, .navbar, .main-navbar, .site-header, .navbar-wrapper"
                        )
                    )
                );

                candidates.forEach(function (element) {
                    const styles = window.getComputedStyle(element);
                    const rect = element.getBoundingClientRect();

                    const isFixed = styles.position === "fixed";
                    const isStuck =
                        styles.position === "sticky" &&
                        rect.top <= 1;

                    if (
                        (isFixed || isStuck) &&
                        rect.bottom > 0 &&
                        rect.top <= 1
                    ) {
                        headerOffset = Math.max(
                            headerOffset,
                            Math.min(rect.bottom, 220)
                        );
                    }
                });
            }

            document.documentElement.style.setProperty(
                "--pmew-site-header-offset",
                Math.max(0, Math.round(headerOffset)) + "px"
            );

            /*
             * Do not measure the page navigation and write its height
             * back into --pmew-page-nav-height.
             *
             * Its height is controlled permanently through CSS.
             */
        }

        function getScrollOffset() {
            return (
                getNumberVariable("--pmew-site-header-offset") +
                getNumberVariable("--pmew-page-nav-height") +
                18
            );
        }

        function setActiveLink(activeLink) {
            links.forEach(function (link) {
                const isActive = link === activeLink;

                link.classList.toggle("is-active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });

            if (activeLink) {
                const targetLeft =
                    activeLink.offsetLeft -
                    (linksViewport.clientWidth - activeLink.offsetWidth) / 2;

                linksViewport.scrollTo({
                    left: Math.max(0, targetLeft),
                    behavior: prefersReducedMotion.matches
                        ? "auto"
                        : "smooth"
                });
            }
        }

        function scrollToDestination(destination, updateHistory) {
            const destinationTop =
                destination.section.getBoundingClientRect().top +
                window.pageYOffset -
                getScrollOffset();

            window.scrollTo({
                top: Math.max(0, destinationTop),
                behavior: prefersReducedMotion.matches
                    ? "auto"
                    : "smooth"
            });

            setActiveLink(destination.link);

            if (
                updateHistory &&
                window.history &&
                window.history.pushState
            ) {
                window.history.pushState(
                    null,
                    "",
                    destination.selector
                );
            }
        }

        function updateActiveSection() {
            if (!destinations.length) {
                return;
            }

            const marker =
                window.pageYOffset +
                getScrollOffset() +
                32;

            let activeDestination = destinations[0];

            destinations.forEach(function (destination) {
                const sectionTop =
                    destination.section.getBoundingClientRect().top +
                    window.pageYOffset;

                if (sectionTop <= marker) {
                    activeDestination = destination;
                }
            });

            if (
                window.innerHeight + window.pageYOffset >=
                document.documentElement.scrollHeight - 8
            ) {
                activeDestination =
                    destinations[destinations.length - 1];
            }

            if (
                !activeDestination.link.classList.contains("is-active")
            ) {
                setActiveLink(activeDestination.link);
            }
        }

        function updateScrollButtons() {
            const maximumScroll =
                linksViewport.scrollWidth -
                linksViewport.clientWidth;

            const hasOverflow = maximumScroll > 4;

            pageNavigation.classList.toggle(
                "is-scrollable",
                hasOverflow
            );

            if (leftButton) {
                leftButton.disabled =
                    !hasOverflow ||
                    linksViewport.scrollLeft <= 4;
            }

            if (rightButton) {
                rightButton.disabled =
                    !hasOverflow ||
                    linksViewport.scrollLeft >= maximumScroll - 4;
            }
        }

        function requestNavigationUpdate() {
            if (ticking) {
                return;
            }

            ticking = true;

            window.requestAnimationFrame(function () {
                updateStickyMeasurements();
                updateActiveSection();
                updateScrollButtons();
                ticking = false;
            });
        }

        links.forEach(function (link) {
            link.addEventListener("click", function (event) {
                const destination = destinations.find(
                    function (item) {
                        return item.link === link;
                    }
                );

                if (!destination) {
                    return;
                }

                event.preventDefault();
                scrollToDestination(destination, true);
            });
        });

        if (leftButton) {
            leftButton.addEventListener("click", function () {
                linksViewport.scrollBy({
                    left: -Math.max(
                        260,
                        linksViewport.clientWidth * 0.72
                    ),
                    behavior: prefersReducedMotion.matches
                        ? "auto"
                        : "smooth"
                });
            });
        }

        if (rightButton) {
            rightButton.addEventListener("click", function () {
                linksViewport.scrollBy({
                    left: Math.max(
                        260,
                        linksViewport.clientWidth * 0.72
                    ),
                    behavior: prefersReducedMotion.matches
                        ? "auto"
                        : "smooth"
                });
            });
        }

        linksViewport.addEventListener(
            "scroll",
            updateScrollButtons,
            { passive: true }
        );

        window.addEventListener(
            "scroll",
            requestNavigationUpdate,
            { passive: true }
        );

        window.addEventListener(
            "resize",
            requestNavigationUpdate
        );

        window.addEventListener(
            "load",
            requestNavigationUpdate
        );

        window.addEventListener("hashchange", function () {
            const matchingDestination = destinations.find(
                function (destination) {
                    return (
                        destination.selector ===
                        window.location.hash
                    );
                }
            );

            if (matchingDestination) {
                scrollToDestination(
                    matchingDestination,
                    false
                );
            }
        });

        const navbarContainer =
            document.getElementById("navbar-container");

        if (
            navbarContainer &&
            "MutationObserver" in window
        ) {
            const navbarObserver =
                new MutationObserver(
                    requestNavigationUpdate
                );

            navbarObserver.observe(
                navbarContainer,
                {
                    childList: true,
                    subtree: true
                }
            );
        }

        if (
            "ResizeObserver" in window &&
            navbarContainer
        ) {
            const resizeObserver =
                new ResizeObserver(
                    requestNavigationUpdate
                );

            resizeObserver.observe(navbarContainer);
        }

        updateStickyMeasurements();
        updateActiveSection();
        updateScrollButtons();

        if (window.location.hash) {
            const initialDestination = destinations.find(
                function (destination) {
                    return (
                        destination.selector ===
                        window.location.hash
                    );
                }
            );

            if (initialDestination) {
                window.setTimeout(function () {
                    scrollToDestination(
                        initialDestination,
                        false
                    );
                }, 120);
            }
        }
    }

    /* ==========================================================
       2. BANNERS 09–18 — COLOUR-FINISHES PRESENTATION LAYER
       ========================================================== */

    function initColourFinishesCarousel() {
        const hero = document.getElementById("pcf-hero");

        if (
            !hero ||
            hero.dataset.initialised === "true"
        ) {
            return;
        }

        hero.dataset.initialised = "true";

        const slides = [
            {
                src: "/assets/images/home/banners/blue.png",
                name: "Blue",
                accent: "#0A63F4",
                type: "image",
                hold: 2800
            },
            {
                src: "/assets/images/home/banners/purple.png",
                name: "Purple",
                accent: "#7A22D5",
                type: "image",
                hold: 2800
            },
            {
                src: "/assets/images/home/banners/rainbow.png",
                name: "Rainbow",
                accent: "#A33AF0",
                type: "image",
                hold: 2800
            },
            {
                src: "/assets/images/home/banners/teal.png",
                name: "Teal",
                accent: "#009E91",
                type: "image",
                hold: 2800
            },
            {
                src: "/assets/images/home/banners/black.png",
                name: "Black",
                accent: "#161616",
                type: "image",
                hold: 2800
            },
            {
                src: "/assets/images/home/banners/red.png",
                name: "Red",
                accent: "#E12028",
                type: "image",
                hold: 2800
            },
            {
                src: "/assets/images/home/banners/gold.png",
                name: "Gold",
                accent: "#C99000",
                type: "image",
                hold: 2800
            },
            {
                src: "/assets/images/home/banners/copper.png",
                name: "Copper",
                accent: "#B65A31",
                type: "image",
                hold: 2800
            },
            {
                name: "All Finishes",
                accent: "#F08080",
                type: "collage",
                hold: 2800
            },
            {
                name: "Contact Us",
                accent: "#0A63F4",
                type: "contact",
                hold: 2800
            }
        ];

        const defaultHold = 2800;
        const stage = hero.querySelector("#pcf-stage");
        const currentName =
            hero.querySelector("#pcf-current-name");
        const hiddenStrip =
            hero.querySelector("#pcf-colour-strip");
        const hiddenNumber =
            hero.querySelector("#pcf-number");
        const hiddenTotal =
            hero.querySelector("#pcf-total");

        if (!stage || !currentName) {
            return;
        }

        let index = 0;

        const imageSlides = slides.filter(
            function (item) {
                return item.type === "image";
            }
        );

        function createImageSlide(
            item,
            slide,
            slideIndex
        ) {
            const image =
                document.createElement("img");

            image.src = item.src;
            image.alt =
                item.name +
                " fasteners, threaded rods and studs";
            image.decoding = "async";
            image.fetchPriority =
                slideIndex < 2
                    ? "high"
                    : "auto";

            slide.appendChild(image);
        }

        function createCollageSlide(slide) {
            const canvas =
                document.createElement("div");

            canvas.className =
                "pcf-merge-canvas";

            const grid =
                document.createElement("div");

            grid.className =
                "pcf-merge-grid";

            imageSlides.forEach(
                function (item) {
                    const tile =
                        document.createElement("div");

                    tile.className =
                        "pcf-merge-tile";

                    const image =
                        document.createElement("img");

                    image.src = item.src;
                    image.alt =
                        item.name + " finish";
                    image.decoding = "async";

                    tile.appendChild(image);
                    grid.appendChild(tile);
                }
            );

            const wash =
                document.createElement("div");

            wash.className =
                "pcf-merge-wash";

            wash.setAttribute(
                "aria-hidden",
                "true"
            );

            canvas.appendChild(grid);
            canvas.appendChild(wash);
            slide.appendChild(canvas);
        }

        function createContactSlide(slide) {
            const canvas =
                document.createElement("div");

            canvas.className =
                "pcf-contact-canvas";

            canvas.setAttribute(
                "aria-hidden",
                "true"
            );

            const lines =
                document.createElement("div");

            lines.className =
                "pcf-contact-lines";

            const orbit =
                document.createElement("div");

            orbit.className =
                "pcf-contact-orbit";

            for (
                let orbitIndex = 0;
                orbitIndex < 8;
                orbitIndex += 1
            ) {
                orbit.appendChild(
                    document.createElement("span")
                );
            }

            canvas.appendChild(lines);
            canvas.appendChild(orbit);
            slide.appendChild(canvas);
        }

        slides.forEach(
            function (item, slideIndex) {
                const slide =
                    document.createElement("figure");

                slide.className =
                    "pcf-slide" +
                    (
                        slideIndex === 0
                            ? " pcf-active"
                            : ""
                    );

                slide.setAttribute(
                    "aria-hidden",
                    slideIndex === 0
                        ? "false"
                        : "true"
                );

                slide.dataset.type =
                    item.type;

                if (item.type === "collage") {
                    createCollageSlide(slide);
                } else if (
                    item.type === "contact"
                ) {
                    createContactSlide(slide);
                } else {
                    createImageSlide(
                        item,
                        slide,
                        slideIndex
                    );
                }

                stage.appendChild(slide);
            }
        );

        const slideElements =
            Array.from(
                hero.querySelectorAll(".pcf-slide")
            );

        function normalise(nextIndex) {
            return (
                nextIndex +
                slides.length
            ) % slides.length;
        }

        function setTheme(item) {
            hero.style.setProperty(
                "--accent",
                item.accent
            );

            currentName.textContent =
                item.name;

            hero.dataset.mode =
                item.type;

            /*
             * Keep neutral typography black.
             * Only intended accent elements inherit
             * the current finish colour.
             */
            hero.style.color =
                "#101114";
        }

        function show(nextIndex) {
            index = normalise(nextIndex);

            slideElements.forEach(
                function (element, elementIndex) {
                    const active =
                        elementIndex === index;

                    element.classList.toggle(
                        "pcf-active",
                        active
                    );

                    element.setAttribute(
                        "aria-hidden",
                        active
                            ? "false"
                            : "true"
                    );
                }
            );

            setTheme(slides[index]);

            /*
             * These elements are hidden by CSS in the
             * unified interface. They stay synchronized
             * for accessibility and possible future reuse.
             */
            if (hiddenNumber) {
                hiddenNumber.textContent =
                    String(9 + index).padStart(
                        2,
                        "0"
                    );
            }

            if (hiddenTotal) {
                hiddenTotal.textContent =
                    "18";
            }
        }

        function getDuration(localIndex) {
            const item =
                slides[normalise(localIndex)];

            const value =
                Number(item && item.hold);

            return (
                Number.isFinite(value) &&
                value >= 1200
            )
                ? value
                : defaultHold;
        }

        function getName(localIndex) {
            const item =
                slides[normalise(localIndex)];

            return item
                ? item.name
                : "";
        }

        hero.pmewColourController = {
            count: slides.length,
            show: show,
            getIndex: function () {
                return index;
            },
            getDuration: getDuration,
            getName: getName
        };

        if (hiddenStrip) {
            hiddenStrip.textContent = "";

            slides.forEach(
                function (item, localIndex) {
                    const button =
                        document.createElement("button");

                    button.type = "button";
                    button.className =
                        "pcf-colour-button";
                    button.tabIndex = -1;

                    button.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                    button.setAttribute(
                        "aria-label",
                        "Banner " +
                        String(9 + localIndex).padStart(
                            2,
                            "0"
                        ) +
                        ": " +
                        item.name
                    );

                    hiddenStrip.appendChild(
                        button
                    );
                }
            );
        }

        show(0);

        hero.dispatchEvent(
            new CustomEvent(
                "pmew:colour-carousel-ready",
                {
                    bubbles: true,
                    detail: {
                        count: slides.length
                    }
                }
            )
        );
    }

    /* ==========================================================
       3. ONE CONTINUOUS 18-BANNER HOME HERO
       ========================================================== */

    function initPmewHomeHero() {
        const root =
            document.querySelector(
                "[data-pmew-home-hero]"
            );

        if (
            !root ||
            root.dataset.pmewHeroReady === "true"
        ) {
            return;
        }

        root.dataset.pmewHeroReady =
            "true";

        const physicalSlides =
            Array.from(
                root.querySelectorAll(
                    ".pmew-home-hero__slide"
                )
            );

        const dotsContainer =
            root.querySelector(
                "[data-pmew-hero-dots]"
            );

        const previousButton =
            root.querySelector(
                '[data-pmew-hero-action="previous"]'
            );

        const nextButton =
            root.querySelector(
                '[data-pmew-hero-action="next"]'
            );

        const pauseButton =
            root.querySelector(
                '[data-pmew-hero-action="pause"]'
            );

        const currentLabel =
            root.querySelector(
                "[data-pmew-hero-current]"
            );

        const totalLabel =
            root.querySelector(
                "[data-pmew-hero-total]"
            );

        const status =
            root.querySelector(
                "[data-pmew-hero-status]"
            );

        const colourHost =
            root.querySelector(
                "[data-pmew-colour-banner-host]"
            );

        const colourHero =
            colourHost
                ? colourHost.querySelector(
                    "#pcf-hero"
                )
                : null;

        let colourController =
            colourHero
                ? colourHero.pmewColourController
                : null;

        const reducedMotionQuery =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

        let logicalSlides = [];
        let dots = [];
        let timer = null;
        let timerDueAt = 0;
        let pausedRemaining = null;
        let isPaused = false;
        let touchStartX = 0;
        let activeLogicalIndex = 0;

        if (!physicalSlides.length) {
            return;
        }

        function padNumber(number) {
            return String(number).padStart(
                2,
                "0"
            );
        }

        function getVirtualCount(slide) {
            const declared =
                Number(
                    slide &&
                    slide.dataset.virtualCount
                );

            if (
                slide === colourHost &&
                colourController &&
                Number.isFinite(
                    colourController.count
                ) &&
                colourController.count > 0
            ) {
                return colourController.count;
            }

            return (
                Number.isFinite(declared) &&
                declared > 0
            )
                ? declared
                : 1;
        }

        function rebuildLogicalSlides() {
            logicalSlides = [];

            physicalSlides.forEach(
                function (slide, physicalIndex) {
                    const count =
                        getVirtualCount(slide);

                    for (
                        let localIndex = 0;
                        localIndex < count;
                        localIndex += 1
                    ) {
                        logicalSlides.push({
                            slide: slide,
                            physicalIndex:
                                physicalIndex,
                            localIndex:
                                localIndex,
                            isVirtual:
                                count > 1
                        });
                    }
                }
            );
        }

        rebuildLogicalSlides();

        function getLogicalDuration(index) {
            const item =
                logicalSlides[index];

            if (!item) {
                return 3200;
            }

            if (
                item.slide === colourHost &&
                colourController &&
                typeof colourController.getDuration ===
                    "function"
            ) {
                return colourController.getDuration(
                    item.localIndex
                );
            }

            const value =
                Number(
                    item.slide.dataset.duration
                );

            return (
                Number.isFinite(value) &&
                value >= 1200
            )
                ? value
                : 3200;
        }

        function getLogicalName(index) {
            const item =
                logicalSlides[index];

            if (!item) {
                return (
                    "Banner " +
                    (index + 1)
                );
            }

            if (
                item.slide === colourHost &&
                colourController &&
                typeof colourController.getName ===
                    "function"
            ) {
                return colourController.getName(
                    item.localIndex
                );
            }

            return (
                item.slide.getAttribute(
                    "aria-label"
                ) ||
                (
                    "Banner " +
                    (index + 1)
                )
            );
        }

        function stopTimer(
            preserveRemaining
        ) {
            if (timer !== null) {
                if (preserveRemaining) {
                    pausedRemaining =
                        Math.max(
                            0,
                            timerDueAt -
                            performance.now()
                        );
                }

                window.clearTimeout(timer);
                timer = null;
            }
        }

        function startTimer(useRemaining) {
            stopTimer(false);

            if (
                isPaused ||
                reducedMotionQuery.matches ||
                document.hidden ||
                logicalSlides.length < 2
            ) {
                return;
            }

            const fullDuration =
                getLogicalDuration(
                    activeLogicalIndex
                );

            const duration =
                (
                    useRemaining &&
                    Number.isFinite(
                        pausedRemaining
                    ) &&
                    pausedRemaining > 0
                )
                    ? pausedRemaining
                    : fullDuration;

            pausedRemaining = null;
            timerDueAt =
                performance.now() +
                duration;

            timer =
                window.setTimeout(
                    function () {
                        timer = null;

                        showLogicalSlide(
                            activeLogicalIndex + 1,
                            false
                        );
                    },
                    duration
                );
        }

        function restartLogoAnimation(
            slide
        ) {
            const logo =
                slide &&
                slide.querySelector(
                    ".pmew-home-hero__logo"
                );

            if (
                !logo ||
                reducedMotionQuery.matches
            ) {
                return;
            }

            logo.style.animation =
                "none";

            void logo.offsetWidth;

            logo.style.animation =
                "";
        }

        function restartProgress(dot) {
            if (
                !dot ||
                reducedMotionQuery.matches
            ) {
                return;
            }

            dot.classList.remove(
                "is-active"
            );

            void dot.offsetWidth;

            dot.classList.add(
                "is-active"
            );
        }

        function updatePauseButton() {
            root.classList.toggle(
                "is-paused",
                isPaused
            );

            if (!pauseButton) {
                return;
            }

            pauseButton.classList.toggle(
                "is-paused",
                isPaused
            );

            pauseButton.setAttribute(
                "aria-pressed",
                String(isPaused)
            );

            pauseButton.setAttribute(
                "aria-label",
                isPaused
                    ? "Play banner rotation"
                    : "Pause banner rotation"
            );

            pauseButton.title =
                isPaused
                    ? "Play banner rotation"
                    : "Pause banner rotation";
        }

        function setPaused(nextPaused) {
            if (nextPaused === isPaused) {
                return;
            }

            isPaused = nextPaused;

            if (isPaused) {
                stopTimer(true);
                root.classList.add(
                    "is-paused"
                );
            } else {
                root.classList.remove(
                    "is-paused"
                );
            }

            updatePauseButton();

            if (!isPaused) {
                startTimer(true);
            }
        }

        function activatePhysicalSlide(item) {
            /*
             * Important transition rule:
             *
             * CSS now fades the outgoing physical banner fully
             * toward the hero's ultra-white background before the
             * incoming physical banner begins fading in.
             *
             * The two physical banners therefore never become
             * visibly superimposed during 01→02, 02→03, 08→09,
             * 18→01, etc.
             */
            physicalSlides.forEach(
                function (slide, physicalIndex) {
                    const active =
                        physicalIndex ===
                        item.physicalIndex;

                    slide.classList.toggle(
                        "is-active",
                        active
                    );

                    slide.setAttribute(
                        "aria-hidden",
                        active
                            ? "false"
                            : "true"
                    );
                }
            );

            if (
                item.slide === colourHost &&
                colourController
            ) {
                colourController.show(
                    item.localIndex
                );
            }

            if (item.localIndex === 0) {
                restartLogoAnimation(
                    item.slide
                );
            }
        }

        function showLogicalSlide(
            nextIndex,
            userInitiated
        ) {
            const total =
                logicalSlides.length;

            if (!total) {
                return;
            }

            activeLogicalIndex =
                (
                    nextIndex +
                    total
                ) % total;

            const item =
                logicalSlides[
                    activeLogicalIndex
                ];

            const duration =
                getLogicalDuration(
                    activeLogicalIndex
                );

            pausedRemaining = null;

            root.style.setProperty(
                "--pmew-hero-active-duration",
                duration + "ms"
            );

            activatePhysicalSlide(item);

            dots.forEach(
                function (dot, dotIndex) {
                    const active =
                        dotIndex ===
                        activeLogicalIndex;

                    dot.classList.toggle(
                        "is-active",
                        active
                    );

                    dot.setAttribute(
                        "aria-current",
                        active
                            ? "true"
                            : "false"
                    );

                    if (active) {
                        restartProgress(dot);
                    }
                }
            );

            if (currentLabel) {
                currentLabel.textContent =
                    padNumber(
                        activeLogicalIndex + 1
                    );
            }

            if (totalLabel) {
                totalLabel.textContent =
                    padNumber(total);
            }

            if (status) {
                status.textContent =
                    "Showing banner " +
                    (activeLogicalIndex + 1) +
                    " of " +
                    total +
                    ": " +
                    getLogicalName(
                        activeLogicalIndex
                    );
            }

            if (
                userInitiated &&
                isPaused
            ) {
                stopTimer(false);
            } else {
                startTimer(false);
            }
        }

        function buildDots() {
            if (!dotsContainer) {
                return;
            }

            dotsContainer.textContent = "";
            dots = [];

            logicalSlides.forEach(
                function (_item, index) {
                    const dot =
                        document.createElement(
                            "button"
                        );

                    dot.type = "button";
                    dot.className =
                        "pmew-home-hero__dot";

                    dot.setAttribute(
                        "aria-label",
                        "Show banner " +
                        padNumber(index + 1) +
                        ": " +
                        getLogicalName(index)
                    );

                    dot.setAttribute(
                        "aria-current",
                        index ===
                            activeLogicalIndex
                            ? "true"
                            : "false"
                    );

                    dot.addEventListener(
                        "click",
                        function () {
                            showLogicalSlide(
                                index,
                                true
                            );
                        }
                    );

                    dotsContainer.appendChild(
                        dot
                    );

                    dots.push(dot);
                }
            );
        }

        const activePhysicalIndex =
            Math.max(
                0,
                physicalSlides.findIndex(
                    function (slide) {
                        return slide.classList.contains(
                            "is-active"
                        );
                    }
                )
            );

        let logicalOffset = 0;

        physicalSlides.some(
            function (slide, physicalIndex) {
                const count =
                    getVirtualCount(slide);

                if (
                    physicalIndex ===
                    activePhysicalIndex
                ) {
                    let localIndex = 0;

                    if (
                        slide === colourHost &&
                        colourController &&
                        typeof colourController.getIndex ===
                            "function"
                    ) {
                        localIndex =
                            colourController.getIndex();
                    }

                    activeLogicalIndex =
                        logicalOffset +
                        Math.min(
                            localIndex,
                            count - 1
                        );

                    return true;
                }

                logicalOffset += count;
                return false;
            }
        );

        buildDots();
        updatePauseButton();

        if (previousButton) {
            previousButton.addEventListener(
                "click",
                function () {
                    showLogicalSlide(
                        activeLogicalIndex - 1,
                        true
                    );
                }
            );
        }

        if (nextButton) {
            nextButton.addEventListener(
                "click",
                function () {
                    showLogicalSlide(
                        activeLogicalIndex + 1,
                        true
                    );
                }
            );
        }

        if (pauseButton) {
            pauseButton.addEventListener(
                "click",
                function () {
                    setPaused(!isPaused);
                }
            );
        }

        root.addEventListener(
            "keydown",
            function (event) {
                const target =
                    event.target;

                const isInteractive =
                    target &&
                    (
                        target.tagName === "A" ||
                        target.tagName === "BUTTON" ||
                        target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.tagName === "SELECT"
                    );

                if (event.key === "ArrowLeft") {
                    event.preventDefault();

                    showLogicalSlide(
                        activeLogicalIndex - 1,
                        true
                    );
                } else if (
                    event.key === "ArrowRight"
                ) {
                    event.preventDefault();

                    showLogicalSlide(
                        activeLogicalIndex + 1,
                        true
                    );
                } else if (
                    (
                        event.key === " " ||
                        event.key === "Spacebar"
                    ) &&
                    !isInteractive
                ) {
                    event.preventDefault();
                    setPaused(!isPaused);
                }
            }
        );

        root.addEventListener(
            "touchstart",
            function (event) {
                touchStartX =
                    event.changedTouches[0].clientX;
            },
            { passive: true }
        );

        root.addEventListener(
            "touchend",
            function (event) {
                const distance =
                    event.changedTouches[0].clientX -
                    touchStartX;

                if (Math.abs(distance) > 55) {
                    showLogicalSlide(
                        activeLogicalIndex +
                        (
                            distance < 0
                                ? 1
                                : -1
                        ),
                        true
                    );
                }
            },
            { passive: true }
        );

        document.addEventListener(
            "visibilitychange",
            function () {
                if (document.hidden) {
                    stopTimer(true);
                } else if (!isPaused) {
                    startTimer(true);
                }
            }
        );

        if (
            typeof reducedMotionQuery.addEventListener ===
            "function"
        ) {
            reducedMotionQuery.addEventListener(
                "change",
                function () {
                    if (
                        reducedMotionQuery.matches
                    ) {
                        stopTimer(false);
                    } else if (!isPaused) {
                        startTimer(false);
                    }
                }
            );
        }

        root.addEventListener(
            "pmew:colour-carousel-ready",
            function () {
                colourController =
                    colourHero
                        ? colourHero.pmewColourController
                        : null;

                rebuildLogicalSlides();
                buildDots();

                showLogicalSlide(
                    Math.min(
                        activeLogicalIndex,
                        logicalSlides.length - 1
                    ),
                    false
                );
            }
        );

        showLogicalSlide(
            activeLogicalIndex,
            false
        );
    }

    /* ==========================================================
       INITIALISE INDEX PAGE
       ========================================================== */

    function initIndexPage() {
        initPageNavigation();

        /*
         * Initialise the nested colour layer first so that
         * the outer carousel sees all 10 virtual slides and
         * immediately builds the correct 18-banner sequence.
         */
        initColourFinishesCarousel();
        initPmewHomeHero();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initIndexPage,
            { once: true }
        );
    } else {
        initIndexPage();
    }
}());
