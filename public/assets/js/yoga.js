(() => {
  "use strict";

  const page = document.querySelector("body.yoga-page");
  const main = document.getElementById("main-content");

  if (!page || !main || page.dataset.yogaInitialized === "true") {
    return;
  }

  page.dataset.yogaInitialized = "true";

  const navbarContainer = document.getElementById("navbar-container");
  const pledgeButton = document.getElementById("pledge-button");
  const pledgeMessage = document.getElementById("pledge-message");

  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const PLEDGE_STORAGE_KEY = "pmewYogaPledgeAccepted";

  const PLEDGE_MESSAGE =
    "I choose balance in thought, action, resources and responsibility.";

  let revealObserver = null;
  let navbarResizeObserver = null;
  let navbarMutationObserver = null;
  let animationFrameId = 0;

  /**
   * Runs layout updates once per animation frame.
   * This prevents unnecessary calculations during resize events.
   */
  const scheduleLayoutUpdate = () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = window.requestAnimationFrame(() => {
      animationFrameId = 0;
      updateNavbarHeight();
    });
  };

  /**
   * Measures the reusable PMEW navbar.
   *
   * The measured value is used by the Yoga CSS for anchor
   * scroll margins. It does not add additional spacing above
   * the hero because the PMEW navbar is already in the normal
   * document flow.
   */
  const updateNavbarHeight = () => {
    if (!navbarContainer) {
      return;
    }

    const navbar =
      navbarContainer.querySelector(".main-header") ||
      navbarContainer.firstElementChild;

    if (!navbar) {
      return;
    }

    const height = Math.ceil(
      navbar.getBoundingClientRect().height
    );

    if (height > 0) {
      page.style.setProperty(
        "--yoga-navbar-height",
        `${height}px`
      );
    }
  };

  /**
   * Observes the PMEW navbar after navbar.js injects it.
   *
   * ResizeObserver handles desktop/mobile navbar height changes.
   * MutationObserver handles navbar injection and dropdown changes.
   */
  const observeNavbar = () => {
    if (!navbarContainer) {
      return;
    }

    updateNavbarHeight();

    if ("ResizeObserver" in window) {
      navbarResizeObserver = new ResizeObserver(
        scheduleLayoutUpdate
      );

      navbarResizeObserver.observe(navbarContainer);

      const navbar =
        navbarContainer.querySelector(".main-header");

      if (navbar) {
        navbarResizeObserver.observe(navbar);
      }
    }

    if ("MutationObserver" in window) {
      navbarMutationObserver = new MutationObserver(() => {
        scheduleLayoutUpdate();

        const navbar =
          navbarContainer.querySelector(".main-header");

        if (navbar && navbarResizeObserver) {
          navbarResizeObserver.observe(navbar);
        }
      });

      navbarMutationObserver.observe(navbarContainer, {
        childList: true,
        subtree: true,
      });
    }
  };

  /**
   * Adds reveal-on-scroll animations.
   *
   * Content remains visible when:
   * - JavaScript is unavailable
   * - IntersectionObserver is unavailable
   * - The user prefers reduced motion
   */
  const initialiseReveals = () => {
    const revealElements = Array.from(
      main.querySelectorAll(".reveal")
    );

    if (!revealElements.length) {
      return;
    }

    if (
      reducedMotionQuery.matches ||
      !("IntersectionObserver" in window)
    ) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
      });

      return;
    }

    page.classList.add("yoga-reveal-ready");

    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  };

  /**
   * Improves loading performance for content images.
   *
   * The Yoga hero uses a CSS background image, so applying
   * lazy loading to normal images will not delay the hero.
   */
  const optimiseImages = () => {
    const images = main.querySelectorAll("img");

    images.forEach((image) => {
      if (!image.hasAttribute("decoding")) {
        image.decoding = "async";
      }

      if (!image.hasAttribute("loading")) {
        image.loading = "lazy";
      }
    });
  };

  /**
   * Safely reads the stored pledge state.
   */
  const getStoredPledgeState = () => {
    try {
      return (
        window.localStorage.getItem(
          PLEDGE_STORAGE_KEY
        ) === "true"
      );
    } catch (error) {
      return false;
    }
  };

  /**
   * Safely stores the pledge state.
   */
  const storePledgeState = () => {
    try {
      window.localStorage.setItem(
        PLEDGE_STORAGE_KEY,
        "true"
      );
    } catch (error) {
      /*
       * Browser storage may be unavailable in private,
       * restricted or security-controlled browsing modes.
       */
    }
  };

  /**
   * Updates the pledge button and accessible status message.
   */
  const applyPledgeState = ({
    announce = false,
  } = {}) => {
    if (!pledgeButton) {
      return;
    }

    pledgeButton.textContent = "Pledge Accepted";
    pledgeButton.disabled = true;

    pledgeButton.setAttribute(
      "aria-pressed",
      "true"
    );

    pledgeButton.dataset.state = "accepted";

    if (pledgeMessage) {
      pledgeMessage.textContent = PLEDGE_MESSAGE;

      if (announce) {
        pledgeMessage.setAttribute(
          "aria-live",
          "assertive"
        );

        window.setTimeout(() => {
          pledgeMessage.setAttribute(
            "aria-live",
            "polite"
          );
        }, 1000);
      }
    }
  };

  /**
   * Initialises the pledge interaction.
   *
   * The accepted state is preserved when the user returns
   * to the Yoga page in the same browser.
   */
  const initialisePledge = () => {
    if (!pledgeButton) {
      return;
    }

    pledgeButton.setAttribute(
      "aria-pressed",
      "false"
    );

    if (getStoredPledgeState()) {
      applyPledgeState();
      return;
    }

    pledgeButton.addEventListener(
      "click",
      () => {
        storePledgeState();

        applyPledgeState({
          announce: true,
        });
      },
      {
        once: true,
      }
    );
  };

  /**
   * Disables reveal motion immediately when the user changes
   * their device accessibility preference to reduced motion.
   */
  const handleMotionPreferenceChange = (event) => {
    if (!event.matches) {
      return;
    }

    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    page.classList.remove("yoga-reveal-ready");

    main
      .querySelectorAll(".reveal")
      .forEach((element) => {
        element.classList.add("is-visible");
      });
  };

  /**
   * Releases active observers when leaving the page.
   */
  const cleanUp = () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(
        animationFrameId
      );
    }

    revealObserver?.disconnect();
    navbarResizeObserver?.disconnect();
    navbarMutationObserver?.disconnect();
  };

  /**
   * Initialise Yoga page functionality.
   */
  observeNavbar();
  initialiseReveals();
  optimiseImages();
  initialisePledge();

  /**
   * Keep navbar measurements correct across screen changes.
   */
  window.addEventListener(
    "resize",
    scheduleLayoutUpdate,
    {
      passive: true,
    }
  );

  window.addEventListener(
    "orientationchange",
    scheduleLayoutUpdate,
    {
      passive: true,
    }
  );

  window.addEventListener(
    "pageshow",
    scheduleLayoutUpdate,
    {
      passive: true,
    }
  );

  window.addEventListener(
    "pagehide",
    cleanUp,
    {
      once: true,
    }
  );

  /**
   * Support both modern and older browser media-query APIs.
   */
  if (
    typeof reducedMotionQuery.addEventListener ===
    "function"
  ) {
    reducedMotionQuery.addEventListener(
      "change",
      handleMotionPreferenceChange
    );
  } else if (
    typeof reducedMotionQuery.addListener ===
    "function"
  ) {
    reducedMotionQuery.addListener(
      handleMotionPreferenceChange
    );
  }
})();