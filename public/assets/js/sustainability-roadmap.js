"use strict";

/* =========================================================
   PMEW SUSTAINABILITY
   - Loads the Sustainability Roadmap
   - Initialises the Roadmap reveal animation
   - Initialises the Sustainability Framework slider
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /*
     * Initialise the framework immediately when it already
     * exists directly inside index.html.
     */
    initPmewSustainabilityFramework();

    /*
     * Load the external Sustainability Roadmap section.
     */
    await loadPmewSustainabilityRoadmap();

    /*
     * Run again after external content has loaded.
     * Duplicate initialisation is prevented by a data attribute.
     */
    initPmewSustainabilityFramework();
});


/* =========================================================
   LOAD SUSTAINABILITY ROADMAP
========================================================= */

async function loadPmewSustainabilityRoadmap() {

    const loader = document.getElementById(
        "pmew-sustainability-roadmap-loader"
    );

    if (!loader) {
        console.warn(
            "Sustainability roadmap loader div not found."
        );
        return;
    }

    try {

        /*
         * sustainability-roadmap.html is in the same folder
         * as index.html.
         */
        const response = await fetch(
            "/pages/sustainability/sustainability-roadmap.html"
        );

        if (!response.ok) {
            throw new Error(
                `Unable to load sustainability-roadmap.html. Status: ${response.status}`
            );
        }

        loader.innerHTML = await response.text();

        initPmewSustainabilityRoadmapAnimation();

        /*
         * This also supports the framework being included
         * inside externally loaded HTML.
         */
        initPmewSustainabilityFramework();

    } catch (error) {

        console.error(
            "Sustainability roadmap loading failed:",
            error
        );
    }
}


/* =========================================================
   SUSTAINABILITY ROADMAP REVEAL ANIMATION
========================================================= */

function initPmewSustainabilityRoadmapAnimation() {

    const roadmap = document.getElementById(
        "pmewSustainabilityRoadmap"
    );

    if (!roadmap) {
        console.warn("Roadmap section ID not found.");
        return;
    }

    /*
     * Prevent duplicate initialisation.
     */
    if (
        roadmap.dataset.pmewRoadmapInitialised ===
        "true"
    ) {
        return;
    }

    roadmap.dataset.pmewRoadmapInitialised = "true";

    if (!("IntersectionObserver" in window)) {
        roadmap.classList.add("is-visible");
        return;
    }

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    roadmap.classList.add("is-visible");

                    observer.unobserve(roadmap);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    observer.observe(roadmap);
}


/* =========================================================
   SUSTAINABILITY FRAMEWORK SLIDER
========================================================= */

function initPmewSustainabilityFramework() {

    const sustainabilityTrack = document.getElementById(
        "pmewSustainabilityTrack"
    );

    const sustainabilityPreviousButton =
        document.getElementById(
            "pmewSustainabilityPrevious"
        );

    const sustainabilityNextButton =
        document.getElementById(
            "pmewSustainabilityNext"
        );

    /*
     * The framework may not exist on every page.
     */
    if (
        !sustainabilityTrack ||
        !sustainabilityPreviousButton ||
        !sustainabilityNextButton
    ) {
        return;
    }

    /*
     * Prevent duplicate event listeners.
     */
    if (
        sustainabilityTrack.dataset
            .pmewFrameworkInitialised === "true"
    ) {
        return;
    }

    sustainabilityTrack.dataset
        .pmewFrameworkInitialised = "true";

    const sustainabilityCards = Array.from(
        sustainabilityTrack.querySelectorAll(
            ".pmew-sustainability-card"
        )
    );

    if (!sustainabilityCards.length) {
        console.warn(
            "No sustainability framework cards were found."
        );
        return;
    }


    /* =====================================================
       SETTINGS
    ====================================================== */

    const autoScrollSpeed = 0.5;

    /*
     * Used after arrow, wheel or keyboard interaction.
     * Hover exit does not use this delay and resumes immediately.
     */
    const interactionResumeDelay = 1600;

    const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const prefersReducedMotion =
        reducedMotionQuery.matches;


    /* =====================================================
       STATE
    ====================================================== */

    let autoScrollEnabled = !prefersReducedMotion;
    let autoScrollFrame = null;
    let resumeTimer = null;

    let pointerIsDown = false;
    let activePointerId = null;
    let pointerStartX = 0;
    let pointerStartScrollLeft = 0;

    let resizeTimer = null;


    /* =====================================================
       TRACK HELPERS
    ====================================================== */

    function getMaximumSustainabilityScroll() {

        return Math.max(
            0,
            sustainabilityTrack.scrollWidth -
            sustainabilityTrack.clientWidth
        );
    }


    function getSustainabilityTrackLeftPadding() {

        const trackStyles = window.getComputedStyle(
            sustainabilityTrack
        );

        return parseFloat(
            trackStyles.paddingLeft
        ) || 0;
    }


    function getSustainabilityCardScrollPosition(card) {

        const maximumScroll =
            getMaximumSustainabilityScroll();

        const leftPadding =
            getSustainabilityTrackLeftPadding();

        const desiredPosition =
            card.offsetLeft - leftPadding;

        return Math.max(
            0,
            Math.min(desiredPosition, maximumScroll)
        );
    }


    function getCurrentSustainabilityCardIndex() {

        const currentScroll =
            sustainabilityTrack.scrollLeft;

        let closestIndex = 0;
        let closestDistance =
            Number.POSITIVE_INFINITY;

        sustainabilityCards.forEach(
            (card, index) => {

                const cardPosition =
                    getSustainabilityCardScrollPosition(
                        card
                    );

                const distance = Math.abs(
                    currentScroll - cardPosition
                );

                if (distance < closestDistance) {

                    closestDistance = distance;
                    closestIndex = index;
                }
            }
        );

        return closestIndex;
    }


    function isAtSustainabilityStart() {

        return sustainabilityTrack.scrollLeft <= 3;
    }


    function isAtSustainabilityEnd() {

        const maximumScroll =
            getMaximumSustainabilityScroll();

        return (
            sustainabilityTrack.scrollLeft >=
            maximumScroll - 3
        );
    }


    function scrollToSustainabilityPosition(
        position,
        behaviour = "smooth"
    ) {

        sustainabilityTrack.scrollTo({
            left: position,
            behavior: behaviour
        });
    }


    function scrollToSustainabilityCard(
        card,
        behaviour = "smooth"
    ) {

        scrollToSustainabilityPosition(
            getSustainabilityCardScrollPosition(card),
            behaviour
        );
    }


    function scrollToFirstSustainabilityCard(
        behaviour = "smooth"
    ) {

        scrollToSustainabilityPosition(
            0,
            behaviour
        );
    }


    function scrollToLastSustainabilityCard(
        behaviour = "smooth"
    ) {

        scrollToSustainabilityPosition(
            getMaximumSustainabilityScroll(),
            behaviour
        );
    }


    /* =====================================================
       AUTO-SCROLL CONTROLS
    ====================================================== */

    function clearSustainabilityResumeTimer() {

        if (resumeTimer) {
            window.clearTimeout(resumeTimer);
            resumeTimer = null;
        }
    }


    function pauseSustainabilityAutoScroll() {

        autoScrollEnabled = false;

        clearSustainabilityResumeTimer();
    }


    function resumeSustainabilityAutoScrollImmediately() {

        if (prefersReducedMotion) {
            return;
        }

        clearSustainabilityResumeTimer();

        autoScrollEnabled = true;
    }


    function resumeSustainabilityAutoScrollAfterDelay() {

        if (prefersReducedMotion) {
            return;
        }

        clearSustainabilityResumeTimer();

        resumeTimer = window.setTimeout(
            () => {
                autoScrollEnabled = true;
            },
            interactionResumeDelay
        );
    }


    /* =====================================================
       PREVIOUS ARROW
       FIRST CARD → LAST CARD
    ====================================================== */

    function showPreviousSustainabilityCard() {

        pauseSustainabilityAutoScroll();

        const behaviour =
            prefersReducedMotion
                ? "auto"
                : "smooth";

        if (isAtSustainabilityStart()) {

            scrollToLastSustainabilityCard(
                behaviour
            );

            resumeSustainabilityAutoScrollAfterDelay();

            return;
        }

        const currentIndex =
            getCurrentSustainabilityCardIndex();

        const previousIndex = Math.max(
            0,
            currentIndex - 1
        );

        scrollToSustainabilityCard(
            sustainabilityCards[previousIndex],
            behaviour
        );

        resumeSustainabilityAutoScrollAfterDelay();
    }


    /* =====================================================
       NEXT ARROW
       LAST CARD → FIRST CARD
    ====================================================== */

    function showNextSustainabilityCard() {

        pauseSustainabilityAutoScroll();

        const behaviour =
            prefersReducedMotion
                ? "auto"
                : "smooth";

        if (isAtSustainabilityEnd()) {

            scrollToFirstSustainabilityCard(
                behaviour
            );

            resumeSustainabilityAutoScrollAfterDelay();

            return;
        }

        const currentIndex =
            getCurrentSustainabilityCardIndex();

        const nextIndex = Math.min(
            sustainabilityCards.length - 1,
            currentIndex + 1
        );

        scrollToSustainabilityCard(
            sustainabilityCards[nextIndex],
            behaviour
        );

        resumeSustainabilityAutoScrollAfterDelay();
    }


    sustainabilityPreviousButton.addEventListener(
        "click",
        showPreviousSustainabilityCard
    );

    sustainabilityNextButton.addEventListener(
        "click",
        showNextSustainabilityCard
    );


    /* =====================================================
       CONTINUOUS AUTOMATIC SCROLLING
    ====================================================== */

    function sustainabilityAutoScrollStep() {

        if (
            autoScrollEnabled &&
            !pointerIsDown &&
            !document.hidden
        ) {

            const maximumScroll =
                getMaximumSustainabilityScroll();

            if (maximumScroll > 0) {

                if (
                    sustainabilityTrack.scrollLeft >=
                    maximumScroll - 1
                ) {

                    /*
                     * Restart automatically from the beginning
                     * after reaching the final card.
                     */
                    sustainabilityTrack.scrollLeft = 0;

                } else {

                    sustainabilityTrack.scrollLeft +=
                        autoScrollSpeed;
                }
            }
        }

        autoScrollFrame =
            window.requestAnimationFrame(
                sustainabilityAutoScrollStep
            );
    }


    /* =====================================================
       HOVER INTERACTION
    ====================================================== */

    sustainabilityTrack.addEventListener(
        "mouseenter",
        () => {
            pauseSustainabilityAutoScroll();
        }
    );

    sustainabilityTrack.addEventListener(
        "mouseleave",
        () => {

            /*
             * Resume immediately when the pointer exits.
             */
            resumeSustainabilityAutoScrollImmediately();
        }
    );


    /* =====================================================
       WHEEL INTERACTION
    ====================================================== */

    sustainabilityTrack.addEventListener(
        "wheel",
        () => {

            pauseSustainabilityAutoScroll();

            resumeSustainabilityAutoScrollAfterDelay();
        },
        {
            passive: true
        }
    );


    /* =====================================================
       TOUCH INTERACTION
    ====================================================== */

    sustainabilityTrack.addEventListener(
        "touchstart",
        () => {
            pauseSustainabilityAutoScroll();
        },
        {
            passive: true
        }
    );

    sustainabilityTrack.addEventListener(
        "touchend",
        () => {

            /*
             * Resume immediately after touch interaction ends.
             */
            resumeSustainabilityAutoScrollImmediately();
        },
        {
            passive: true
        }
    );

    sustainabilityTrack.addEventListener(
        "touchcancel",
        () => {
            resumeSustainabilityAutoScrollImmediately();
        },
        {
            passive: true
        }
    );


    /* =====================================================
       POINTER DRAGGING
    ====================================================== */

    sustainabilityTrack.addEventListener(
        "pointerdown",
        event => {

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            pointerIsDown = true;
            activePointerId = event.pointerId;

            pointerStartX = event.clientX;

            pointerStartScrollLeft =
                sustainabilityTrack.scrollLeft;

            pauseSustainabilityAutoScroll();

            sustainabilityTrack.classList.add(
                "is-dragging"
            );

            try {

                sustainabilityTrack.setPointerCapture(
                    event.pointerId
                );

            } catch (error) {

                /*
                 * Pointer dragging still works when pointer
                 * capture is unavailable.
                 */
            }
        }
    );


    sustainabilityTrack.addEventListener(
        "pointermove",
        event => {

            if (
                !pointerIsDown ||
                event.pointerId !== activePointerId
            ) {
                return;
            }

            const movement =
                event.clientX - pointerStartX;

            sustainabilityTrack.scrollLeft =
                pointerStartScrollLeft - movement;
        }
    );


    function finishSustainabilityPointerInteraction(
        event
    ) {

        if (
            activePointerId !== null &&
            event.pointerId !== activePointerId
        ) {
            return;
        }

        pointerIsDown = false;
        activePointerId = null;

        sustainabilityTrack.classList.remove(
            "is-dragging"
        );

        /*
         * Resume immediately after dragging ends.
         */
        resumeSustainabilityAutoScrollImmediately();
    }


    sustainabilityTrack.addEventListener(
        "pointerup",
        finishSustainabilityPointerInteraction
    );

    sustainabilityTrack.addEventListener(
        "pointercancel",
        finishSustainabilityPointerInteraction
    );

    sustainabilityTrack.addEventListener(
        "lostpointercapture",
        event => {

            if (pointerIsDown) {

                finishSustainabilityPointerInteraction(
                    event
                );
            }
        }
    );


    /* =====================================================
       KEYBOARD NAVIGATION
    ====================================================== */

    sustainabilityTrack.addEventListener(
        "keydown",
        event => {

            if (event.key === "ArrowLeft") {

                event.preventDefault();

                showPreviousSustainabilityCard();

            } else if (
                event.key === "ArrowRight"
            ) {

                event.preventDefault();

                showNextSustainabilityCard();

            } else if (
                event.key === "Home"
            ) {

                event.preventDefault();

                pauseSustainabilityAutoScroll();

                scrollToFirstSustainabilityCard(
                    prefersReducedMotion
                        ? "auto"
                        : "smooth"
                );

                resumeSustainabilityAutoScrollAfterDelay();

            } else if (
                event.key === "End"
            ) {

                event.preventDefault();

                pauseSustainabilityAutoScroll();

                scrollToLastSustainabilityCard(
                    prefersReducedMotion
                        ? "auto"
                        : "smooth"
                );

                resumeSustainabilityAutoScrollAfterDelay();
            }
        }
    );


    /* =====================================================
       PAGE VISIBILITY
    ====================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {

                pauseSustainabilityAutoScroll();

            } else {

                resumeSustainabilityAutoScrollImmediately();
            }
        }
    );


    /* =====================================================
       WINDOW RESIZE
    ====================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (resizeTimer) {
                window.clearTimeout(resizeTimer);
            }

            resizeTimer = window.setTimeout(
                () => {

                    /*
                     * Keep the scroll position within the
                     * recalculated maximum after resizing.
                     */
                    const maximumScroll =
                        getMaximumSustainabilityScroll();

                    if (
                        sustainabilityTrack.scrollLeft >
                        maximumScroll
                    ) {

                        sustainabilityTrack.scrollLeft =
                            maximumScroll;
                    }
                },
                150
            );
        },
        {
            passive: true
        }
    );


    /* =====================================================
       INITIALISE AUTOMATIC SCROLLING
    ====================================================== */

    if (!prefersReducedMotion) {

        autoScrollFrame =
            window.requestAnimationFrame(
                sustainabilityAutoScrollStep
            );
    }
}