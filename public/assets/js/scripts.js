// ==========================================================
// PRADAKO MECHANICAL - GLOBAL SCRIPT
// Shared Across Entire Website
// ==========================================================

window.__pradakoMainScriptLoaded = true;

// ==========================================================
// PERMANENT SITE-SHELL COORDINATION
// Navbar/footer fetching is owned only by pradako-site-shell.js.
// This global script waits for the shell and can bootstrap it for
// legacy pages that have not yet added the permanent shell script.
// ==========================================================

(function bootstrapPradakoWebsite() {
    const mainScriptNode = document.currentScript;
    let websiteStarted = false;
    let shellRequested = false;

    function hasShellHosts() {
        return Boolean(
            document.getElementById('navbar-container') ||
            document.getElementById('footer-container')
        );
    }

    function permanentShellAlreadyPresent() {
        return Boolean(
            window.__PMEW_SITE_SHELL_BOOTSTRAPPED__ ||
            Array.from(document.scripts).some((script) =>
                /(?:^|\/)pradako-site-shell\.js(?:[?#]|$)/i.test(script.src || '')
            )
        );
    }

    function permanentShellUrl() {
        if (mainScriptNode && mainScriptNode.src) {
            return mainScriptNode.src.replace(
                /scripts\.js(?:[?#].*)?$/i,
                '/assets/js/pradako-site-shell.js'
            );
        }
        return '/assets/js/pradako-site-shell.js';
    }

    function ensurePermanentSiteShell() {
        if (!hasShellHosts() || permanentShellAlreadyPresent() || shellRequested) return;
        shellRequested = true;

        const loader = document.createElement('script');
        loader.src = permanentShellUrl();
        loader.async = false;
        loader.dataset.pmewShellBootstrap = '/assets/js/scripts.js';
        loader.addEventListener('error', () => {
            console.error('[PMEW] Unable to bootstrap pradako-site-shell.js from scripts.js.');
        }, { once: true });
        (document.head || document.documentElement).appendChild(loader);
    }

    function startWebsite() {
        if (websiteStarted) return;

        if (hasShellHosts() && !window.__PMEW_SHELL_LOADED__) {
            ensurePermanentSiteShell();
            return;
        }

        websiteStarted = true;
        initializeWebsite();
    }

    window.addEventListener('pmew:shell-loaded', startWebsite, { once: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startWebsite, { once: true });
    } else {
        startWebsite();
    }
})();

// ==========================================================
// INITIALIZE WEBSITE
// ==========================================================

function initializeWebsite() {

    initDesktopDropdown();

    initMobileMenu();

    initTimeline();

    initBackToTop();

    initEmailCopy();

    initAboutVideo();

    initMapResize();

    initHeroSlider();


    initDinProductSearch();

    initApplicationNavigation();

    initApplicationScrollSpy();

    initMegaMenuSliders();

}

// ==========================================================
// DESKTOP DROPDOWN
// ==========================================================

function initDesktopDropdown() {

    const dropdownToggles = document.querySelectorAll('.dropdown > a');

    dropdownToggles.forEach(toggle => {

        toggle.addEventListener('click', function(e) {

            e.preventDefault();

            e.stopPropagation();

            const parentDropdown = this.parentElement;

            const isActive = parentDropdown.classList.contains('active');

            document.querySelectorAll('.dropdown').forEach(dropdown => {

                dropdown.classList.remove('active');

            });

            if (!isActive) {

                parentDropdown.classList.add('active');

            }

        });

    });

    document.addEventListener('click', function(e) {

        if (!e.target.closest('.dropdown')) {

            document.querySelectorAll('.dropdown').forEach(dropdown => {

                dropdown.classList.remove('active');

            });

        }

    });

    document.querySelectorAll('.mega-menu').forEach(menu => {

        menu.addEventListener('click', e => e.stopPropagation());

    });

}

// ==========================================================
// MOBILE MENU
// ==========================================================

function initMobileMenu() {

    const hamburger = document.getElementById('hamburgerBtn');

    const overlay = document.getElementById('mobileOverlay');

    const mobileMenu = document.getElementById('mobileMenu');

    const closeMenuBtn = document.getElementById('closeMenuBtn');

    const body = document.body;

    let scrollY = 0;

    if (!hamburger || !mobileMenu) return;

    function openMobileMenu() {

        scrollY = window.scrollY;

        overlay.classList.add('active');

        mobileMenu.classList.add('active');

        body.classList.add('menu-open');

        body.style.top = `-${scrollY}px`;

    }

    function closeMobileMenu() {

        overlay.classList.remove('active');

        mobileMenu.classList.remove('active');

        body.classList.remove('menu-open');

        body.style.top = '';

        window.scrollTo(0, scrollY);

    }

    hamburger.addEventListener('click', openMobileMenu);

    closeMenuBtn.addEventListener('click', closeMobileMenu);

    overlay.addEventListener('click', closeMobileMenu);

    const accordionBtns = document.querySelectorAll('.accordion-btn');

    accordionBtns.forEach(btn => {

        btn.addEventListener('click', function(e) {

            e.preventDefault();

            const submenu = this.nextElementSibling;

            submenu.classList.toggle('open');

            this.classList.toggle('open');

        });

    });

}

// ==========================================================
// TIMELINE
// ==========================================================

function initTimeline() {

    window.showTimeline = function(id, btn) {

        document.querySelectorAll(".timeline-block")
            .forEach(block => block.classList.remove("active"));

        document.querySelectorAll(".timeline-btn")
            .forEach(button => button.classList.remove("active"));

        const targetBlock = document.getElementById(id);

        if (targetBlock) {

            targetBlock.classList.add("active");

        }

        if (btn) {

            btn.classList.add("active");

        }

    };

}

// ==========================================================
// BACK TO TOP
// ==========================================================

function initBackToTop() {

    const backToTopBtn = document.getElementById('backToTop');
    const hero = document.querySelector('.hero');

    if (!backToTopBtn) return;

    function getHeroBottom() {
        return hero ? hero.offsetTop + hero.offsetHeight : window.innerHeight;
    }

    window.addEventListener('scroll', () => {

        if (window.scrollY > getHeroBottom()) {

            backToTopBtn.classList.add('visible');

        } else {

            backToTopBtn.classList.remove('visible');

        }

    }, { passive: true });

    backToTopBtn.addEventListener('click', function(e) {

        e.preventDefault();

        window.scrollTo({

            top: 0,

            behavior: 'smooth'

        });

    });

}

// ==========================================================
// EMAIL COPY
// ==========================================================

function initEmailCopy() {

    document.querySelectorAll('.about-email').forEach(email => {

        email.addEventListener('click', async () => {

            const emailText = email.innerText.trim();

            try {

                await navigator.clipboard.writeText(emailText);

            } catch(err) {

                console.log(err);

            }

        });

    });

}

// ==========================================================
// ABOUT VIDEO
// ==========================================================

function initAboutVideo() {

    const aboutVideo = document.querySelector('.about-video-bg');

    if (!aboutVideo) return;

    if (window.innerWidth > 768) {

        aboutVideo.play().catch(() => {});

    }

}

// ==========================================================
// MAP RESIZE
// ==========================================================

function initMapResize() {

    window.addEventListener('resize', () => {

        const aboutMap = document.querySelector('.about-map');

        if (aboutMap) {

            aboutMap.style.transform = 'translate(-50%, -50%)';

        }

    });

}

// ==========================================================
// HERO SLIDER
// ==========================================================

function initHeroSlider() {

    const heroImages = document.querySelectorAll('.hero-bg');

    if (!heroImages.length) return;

    let currentIndex = 0;

    heroImages[0].classList.add('active');

    setInterval(() => {

        heroImages[currentIndex].classList.remove('active');

        currentIndex = (currentIndex + 1) % heroImages.length;

        heroImages[currentIndex].classList.add('active');

    }, 3500);

}

// ===============================================
// TECHNICAL PAGE SEARCH SCRIPT
// ===============================================

const searchInput = document.getElementById("techSearch");

const allCards = document.querySelectorAll(".technical-card");

function filterCards() {

    const filter = searchInput.value.toLowerCase().trim();

    allCards.forEach(card => {

        const text = card.innerText.toLowerCase();

        if (text.includes(filter)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";
        }

    });
}

if (searchInput) {

    searchInput.addEventListener("keyup", filterCards);

}

allCards.forEach(card => {

    card.addEventListener("click", function () {

        const name =
            this.getAttribute("data-name") ||
            this.querySelector("h4")?.innerText ||
            "Standard";

        alert(
            `Viewing details for ${name}\n\nFull specifications, engineering drawings, and dimension charts will be displayed here.`
        );

    });

});

// ==========================================================
// BLACK OXIDE PAGE SCRIPT
// Cleaned: generic reveal moved to /js/pradako-global-animations.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    const tableRows = document.querySelectorAll(".blackoxide-table tbody tr");

    tableRows.forEach((row) => {
        row.addEventListener("mouseenter", () => {
            row.style.background = "rgba(30,111,159,0.04)";
        });

        row.addEventListener("mouseleave", () => {
            row.style.background = "transparent";
        });
    });

    const prefersReducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion) {
        const cards = document.querySelectorAll(".blackoxide-card, .blackoxide-step");

        cards.forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 18;
                const rotateY = (centerX - x) / 18;

                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateY(-6px)
                `;
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
});

// ==========================================================
// MANUFACTURING PAGE SCRIPT
// Cleaned: generic reveal moved to /js/pradako-global-animations.js
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    const dashboard = document.querySelector(".manufacturing-dashboard");
    if (!dashboard) return;

    const dashboardObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const current = document.querySelector(".current");
                const expansion = document.querySelector(".expansion");
                const vision = document.querySelector(".vision-bar");

                if (current) current.style.width = "45%";
                if (expansion) expansion.style.width = "75%";
                if (vision) vision.style.width = "95%";

                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.3 }
    );

    dashboardObserver.observe(dashboard);
});

// ==========================================================
// DIN PRODUCT SEARCH
// ==========================================================

function initDinProductSearch() {

    const dinSearchInput =
        document.getElementById('searchInput');

    const dinProductLinks =
        document.querySelectorAll('.card-link');

    if (!dinSearchInput || !dinProductLinks.length) return;

    function handleDinProductFilter() {

        const searchQuery =
            dinSearchInput.value
            .trim()
            .toLowerCase();

        dinProductLinks.forEach(productLink => {

            const productCard =
                productLink.querySelector('.card');

            if (!productCard) return;

            const dinNumber =
                productCard
                .getAttribute('data-din')
                ?.toLowerCase() || '';

            const productType =
                productCard
                .querySelector('.type')
                ?.textContent
                .toLowerCase() || '';

            const isVisible =
                dinNumber.includes(searchQuery) ||
                productType.includes(searchQuery);

            productLink.style.display =
                isVisible ? 'block' : 'none';

        });

    }

    dinSearchInput.addEventListener(
        'keyup',
        handleDinProductFilter
    );

}

// ==========================================================
// APPLICATION INDUSTRY NAVIGATION
// ==========================================================

function initApplicationNavigation() {
    const currentPage = (
        window.location.pathname.split('/').pop() || '/index.html'
    ).toLowerCase();

    const isApplicationPage =
        currentPage === '/pages/applications/application.html' ||
        currentPage === 'applications.html';

    /* Keep the main website Applications item active after the shared
       navbar has been injected by pradako-site-shell.js. */
    if (isApplicationPage) {
        const mainApplicationsLink = document.querySelector('.applications-nav-link');
        if (mainApplicationsLink) {
            mainApplicationsLink.classList.add('active');
            const parentItem = mainApplicationsLink.closest('li');
            if (parentItem) parentItem.classList.add('active');
        }
    }

    const applicationNavigation = document.querySelector('.app-nav-wrapper');
    const applicationLinks = document.querySelectorAll('.app-nav-link');

    if (applicationNavigation && applicationLinks.length) {
        applicationLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href) return;

            let linkPage = '';
            try {
                linkPage = new URL(href, window.location.href)
                    .pathname.split('/').pop().toLowerCase();
            } catch (error) {
                linkPage = href.split('#')[0].split('?')[0].split('/').pop().toLowerCase();
            }

            if (currentPage === linkPage) link.classList.add('active');
        });

        if (isApplicationPage && !applicationNavigation.querySelector('.app-nav-link.active')) {
            applicationLinks[0]?.classList.add('active');
        }

        function handleNavigationScroll() {
            applicationNavigation.classList.toggle('nav-scrolled', window.scrollY > 50);
        }

        window.addEventListener('scroll', handleNavigationScroll, { passive: true });
        handleNavigationScroll();

        const navigationContainer = document.querySelector('.app-nav-main');
        if (navigationContainer) {
            navigationContainer.addEventListener('wheel', (event) => {
                if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
                event.preventDefault();
                navigationContainer.scrollLeft += event.deltaY;
            }, { passive: false });
        }
    }

    if (!isApplicationPage) return;

    /* Support links such as application.html#automotive without registering
       the two duplicate document-level application handlers that existed before. */
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href*="#"]');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        let targetUrl;
        try { targetUrl = new URL(href, window.location.href); }
        catch (error) { return; }

        const targetPage = targetUrl.pathname.split('/').pop().toLowerCase();
        if (
            targetUrl.origin !== window.location.origin ||
            targetPage !== currentPage ||
            !targetUrl.hash
        ) return;

        const targetSection = document.getElementById(decodeURIComponent(targetUrl.hash.slice(1)));
        if (!targetSection) return;

        event.preventDefault();
        history.pushState(null, '', targetUrl.hash);
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

const industryData = {

    automotive: {

        title: "Automotive, EV & Future Mobility",

        items: [

            {
                name: "Automotive",
                image: "/assets/images/applications/automotive.png",
                url: "/pages/applications/automotive.html"
            },

            {
                name: "Automotive Tier Ecosystem",
                image: "/assets/images/applications/tier-level.png",
                url: "/pages/applications/tier-level.html"
            },

            {
                name: "Electric Vehicles & Battery Platforms",
                image: "/assets/images/applications/ev-sectors.png",
                url: "/pages/applications/ev-sectors.html"
            },

            {
                name: "Automotive HVAC & Thermal Management",
                image: "/assets/images/applications/hvac.png",
                url: "/pages/applications/hvac.html"
            },

            {
                name: "Automotive Aftermarket",
                image: "/assets/images/applications/aftermarket.png",
                url: "/pages/applications/aftermarket.html"
            },

            {
                name: "Axles, Driveline & Wheel-End Systems",
                image: "/assets/images/applications/axles.png",
                url: "/pages/applications/axles.html"
            },

            {
                name: "Cycle Industry",
                image: "/assets/images/applications/bicycle.png",
                url:"/pages/applications/bicycle.html"
            },

            {
                name: "Agricultural & Earthmoving Equipment",
                image: "/assets/images/applications/agriculture.png",
                url: "/pages/applications/agriculture.html"
            }

        ]

    },

    electronics: {

        title: "Electronics, Medical, Home & Consumer Systems",

        items: [

            {
                name: "Electronics",
                image: "/assets/images/applications/electronics.png",
                url: "/pages/applications/electronics.html"
            },

            {
                name: "Medical equipments",
                image: "/assets/images/applications/medical-equipment.png",
                url: "/pages/applications/medical-equipment.html"
            },

            {
                name: "Home Appliances",
                image: "/assets/images/applications/home-appliances.png",
                url: "/pages/applications/home-appliances.html"
            },

            {
                name: "Home Interior",
                image: "/assets/images/applications/home-interior.png",
                url: "/pages/applications/home-interior.html"
            }

        ]

    },

    commercial: {

        title: "Commercial Partner & Supply Chain Categories",

        items: [

            {
                name: "Global Sourcing Companies",
                image: "/assets/images/applications/sourcing-companies.png",
                url: "/pages/applications/sourcing-companies.html"
            },

            {
                name: "Distributors & Stockist",
                image: "/assets/images/applications/distributor.png",
                url: "/pages/applications/distributor.html"
            }

        ]

    },

    aerospace: {

        title: "Aerospace, Defence & Strategic Engineering",

        items: [

            {
                name: "Aerospace",
                image: "/assets/images/applications/aerospace.png",
                url: "/pages/applications/aerospace.html"
            },

            {
                name: "Defence & Military",
                image: "/assets/images/applications/defence-military.png",
                url: "/pages/applications/defence-military.html"
            }

        ]

    },

    construction: {
        title: "Construction, Structural & Public Infrastructure",

        items: [

            {
                name: "Construction & Infrastructure",
                image: "/assets/images/applications/construction.png",
                url: "/pages/applications/construction.html"
            },

            {
                name: "PEB Structures",
                image: "/assets/images/applications/peb-structure.png",
                url: "/pages/applications/peb-structure.html"
            },

            {
                name: "Structural Fasteners",
                image: "/assets/images/applications/structural.png",
                url: "/pages/applications/structural.html"
            },

            {
                name: "Railway & Metro",
                image: "/assets/images/applications/railways.png",
                url: "/pages/applications/railways.html"
            },

            {
                name: "Road Crash Barriers",
                image: "/assets/images/applications/road-crash-barrier.png",
                url: "/pages/applications/road-crash-barrier.html"
            },

            {
                name: "Elevator & Escalator",
                image: "/assets/images/applications/elevator-escalator.png",
                url: "/pages/applications/elevator.html"
            }

        ]
    },

    heavy: {

        title: "Heavy Industry, Machinery & Process Automation",
        items: [

            {
                name: "Heavy Engineering",
                image: "/assets/images/applications/heavy-engineering.png",
                url: "/pages/applications/heavy-engineering.html"
            },

            {
                name: "Mining & Tunneling",
                image: "/assets/images/applications/mining-tunneling.png",
                url: "/pages/applications/mining-tunneling.html"
            },

            {
                name: "Automation Systems",
                image: "/assets/images/applications/automation.png",
                url: "/pages/applications/automation.html"
            },

            {
                name: "Packaging & Material Handling",
                image: "/assets/images/applications/packaging.png",
                url: "/pages/applications/packaging.html"
            },

            {
                name: "Food Processing Equipment",
                image: "/assets/images/applications/food-processing.png",
                url: "/pages/applications/food-processing.html"
            },

            {
                name: "Industrial Applications",
                image: "/assets/images/applications/industrial.png",
                url: "/pages/applications/industrial.html"
            }

        ]
    },

    marine: {
        title: "Marine, Ports & Shipbuilding",
        items: [

            {
                name: "Marine & Offshore",
                image: "/assets/images/applications/marine-offshore.png",
                url: "/pages/applications/marine-offshore.html"
            },

            {
                name: "Ports, Shipbuilding & Maritime Logistics",
                image: "/assets/images/applications/ports-shipbuilding.png",
                url: "/pages/applications/ports-shipbuilding.html"
            }
        ]
    },

    energy: {
        title: "Energy, Power & Transmission Infrastructure",
        items: [

            {
                name: "Solar Energy",
                image: "/assets/images/applications/solar-energy.png",
                url: "/pages/applications/solar-energy.html"
            },

            {
                name: "Wind Energy",
                image: "/assets/images/applications/wind-energy.png",
                url: "/pages/applications/wind-energy.html"
            },

            {
                name: "Thermal Energy",
                image: "/assets/images/applications/thermal-energy.png",
                url: "/pages/applications/thermal-energy.html"
            },

            {
                name: "Tower & Transmission Lines",
                image: "/assets/images/applications/tower-transmission.png",
                url: "/pages/applications/tower-transmission.html"
            },

            {
                name: "Transformer & Rectifiers",
                image: "/assets/images/applications/transformer.png",
                url: "/pages/applications/transformer.html"
            }

        ]
    },

    oilgas: {
        title: "Oil, Gas, Petrochemical & Fluid Control Systems",
        items: [

            {
                name: "Oil & Gas",
                image: "/assets/images/applications/oil-gas.png",
                url: "/pages/applications/oil-gas.html"
            },

            {
                name: "Petrochemical",
                image: "/assets/images/applications/petrochemical.png",
                url: "/pages/applications/petrochemical.html"
            },

            {
                name: "Pipeline",
                image: "/assets/images/applications/pipeline.png",
                url: "/pages/applications/pipeline.html"
            },

            {
                name: "Valves Industry",
                image: "/assets/images/applications/valve-industry.png",
                url: "/pages/applications/valve.html"
            },

            {
                name: "Pumps & Motors",
                image: "/assets/images/applications/pump-motors.png",
                url: "/pages/applications/pump-motors.html"
            },

            {
                name: "Wastewater & Water Treatment",
                image: "/assets/images/applications/waste-water.png",
                url: "/pages/applications/waste-water.html"
            }
        ]
    }

};

// ==========================================================
// APPLICATION PAGE SCROLLSPY
// ==========================================================

function initApplicationScrollSpy() {
    const sections = Array.from(
        document.querySelectorAll('.application-category-section')
    );
    const navLinks = Array.from(
        document.querySelectorAll('.application-sticky-nav a')
    );

    if (!sections.length || !navLinks.length) return;

    function setActive(sectionId) {
        if (!sectionId) return;
        navLinks.forEach((link) => {
            link.classList.toggle(
                'active',
                link.getAttribute('href') === '#' + sectionId
            );
        });
    }

    function applyHash() {
        const sectionId = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        if (sectionId && document.getElementById(sectionId)) setActive(sectionId);
    }

    function updateActiveSection() {
        const marker = 250;
        let currentSection = '';

        for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= marker && rect.bottom > marker) {
                currentSection = section.id;
                break;
            }
        }

        if (currentSection) setActive(currentSection);
    }

    let framePending = false;
    function scheduleScrollSpy() {
        if (framePending) return;
        framePending = true;
        window.requestAnimationFrame(() => {
            framePending = false;
            updateActiveSection();
        });
    }

    window.addEventListener('scroll', scheduleScrollSpy, { passive: true });
    window.addEventListener('resize', scheduleScrollSpy, { passive: true });
    window.addEventListener('hashchange', applyHash);

    applyHash();
    updateActiveSection();
}

function generateIndustryCurtains(category) {

    const container =
        document.getElementById(
            "industryCurtainContainer"
        );

    const title =
        document.getElementById(
            "activeIndustryTitle"
        );

    if (!container) return;

    const categoryData =
        industryData[category];

    if (!categoryData) return;

    if (title) {
        title.textContent =
            categoryData.title;
    }

    let html = "";

    categoryData.items.forEach(item => {

        html += `
            <div class="industry-strip-item">

                <a href="${item.url}">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                    >

                    <span>
                        ${item.name}
                    </span>

                </a>

            </div>
        `;

    });

    container.innerHTML = html;

}

function switchIndustryCategory(category) {

    const stage =
        document.querySelector(
            ".industry-stage"
        );

    if (!stage) return;

    stage.classList.add(
        "industry-slide-out"
    );

    setTimeout(() => {

        generateIndustryCurtains(
            category
        );

        stage.classList.remove(
            "industry-slide-out"
        );

        stage.classList.add(
            "industry-slide-in"
        );

        setTimeout(() => {

            stage.classList.remove(
                "industry-slide-in"
            );

        }, 600);

    }, 400);

}

function initIndustryExplorer() {

    const buttons =
        document.querySelectorAll(
            ".industry-category-btn"
        );

    if (!buttons.length) return;

    buttons.forEach(button => {

        button.addEventListener(
            "click",

            function() {

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });

                this.classList.add(
                    "active"
                );

                switchIndustryCategory(
                    this.dataset.category
                );

            }

        );

    });

    generateIndustryCurtains(
        "automotive"
    );

}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        initIndustryExplorer();
    }
);

// ==========================================================
// MEGA MENU PRODUCT SLIDERS
// ==========================================================

function initMegaMenuSliders(){

    document
    .querySelectorAll('.product-slider')
    .forEach(slider=>{

        const slides =
            slider.querySelectorAll('.slide');

        const dots =
            slider.querySelectorAll('.dot');

        const prev =
            slider.querySelector('.prev');

        const next =
            slider.querySelector('.next');

        if (!slides.length || !dots.length) return;

        let current = 0;
        let interval;

        function showSlide(index){

            slides.forEach(slide=>
                slide.classList.remove('active')
            );

            dots.forEach(dot=>
                dot.classList.remove('active')
            );

            current =
                (index + slides.length)
                % slides.length;

            slides[current]
                .classList.add('active');

            dots[current]
                .classList.add('active');
        }

        function nextSlide(){
            showSlide(current + 1);
        }

        function prevSlide(){
            showSlide(current - 1);
        }

        function start(){

            stop();

            interval = setInterval(
                nextSlide,
                2000
            );

        }

        function stop(){

            clearInterval(interval);

        }

        next?.addEventListener(
            'click',
            e=>{

                e.preventDefault();
                e.stopPropagation();

                nextSlide();

            }
        );

        prev?.addEventListener(
            'click',
            e=>{

                e.preventDefault();
                e.stopPropagation();

                prevSlide();

            }
        );

        dots.forEach((dot,index)=>{

            dot.addEventListener(
                'click',
                e=>{

                    e.preventDefault();
                    e.stopPropagation();

                    showSlide(index);

                }
            );

        });

        slider.addEventListener(
            'mouseenter',
            stop
        );

        slider.addEventListener(
            'mouseleave',
            start
        );

        showSlide(0);

        start();

    });

}

/* ==========================================================
   PMEW STANDARD AUTHORITY URL SEARCH
   Makes fallback links such as:
   /pages/standard-products/bs.html?standard=BS%2057
   automatically filter the authority library.
========================================================== */
(function initPmewAuthoritySearchFromUrl() {
    function applyStandardSearchFromUrl() {
        const path = window.location.pathname || "";

        if (
            !path.includes("/pages/standards/") &&
            !path.includes("/pages/standard-products/")
        ) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = (
            params.get("standard") ||
            params.get("search") ||
            ""
        ).trim();

        if (!query) return;

        const input = document.getElementById("searchInput");
        if (!input) return;

        input.value = query;

        const runSearch = () => {
            if (typeof window.searchStandards === "function") {
                window.searchStandards();
                return;
            }

            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("search", { bubbles: true }));
        };

        window.setTimeout(runSearch, 0);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            applyStandardSearchFromUrl,
            { once: true }
        );
    } else {
        applyStandardSearchFromUrl();
    }
})();
