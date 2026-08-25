(function () {
  'use strict';

  const ROOT = '/';
  const componentMap = {
    'navbar-container': '/components/navbar.html',
    'footer-container': '/components/footer.html'
  };

  async function injectComponent(id, url) {
    const target = document.getElementById(id);
    if (!target || target.children.length) return false;
    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) throw new Error(String(response.status));
      target.innerHTML = await response.text();
      return true;
    } catch (error) {
      target.setAttribute('data-component-error', 'true');
      console.warn(`PMEW component unavailable: ${url}`, error);
      return false;
    }
  }

  function initSharedNavbar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    if (hamburger && mobileMenu) {
      const openMenu = () => {
        mobileMenu.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
      };
      const closeMenu = () => {
        mobileMenu.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      };
      hamburger.addEventListener('click', openMenu);
      if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
      if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
    }

    document.querySelectorAll('.accordion-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const submenu = button.nextElementSibling;
        if (!submenu) return;
        const open = submenu.classList.toggle('active');
        submenu.classList.toggle('open', open);
        button.classList.toggle('open', open);
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    document.querySelectorAll('.navbar .dropdown-toggle').forEach((toggle) => {
      toggle.addEventListener('click', (event) => {
        const parent = toggle.closest('.dropdown');
        if (!parent) return;
        event.preventDefault();
        event.stopPropagation();
        const wasOpen = parent.classList.contains('active');
        document.querySelectorAll('.navbar .dropdown.active').forEach((item) => item.classList.remove('active'));
        if (!wasOpen) parent.classList.add('active');
      });
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.navbar .dropdown')) {
        document.querySelectorAll('.navbar .dropdown.active').forEach((item) => item.classList.remove('active'));
      }
    });

    document.querySelectorAll('.product-slider').forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll('.slide'));
      const dots = Array.from(slider.querySelectorAll('.dot'));
      if (!slides.length) return;
      let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));
      const show = (next) => {
        index = (next + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      };
      slider.querySelectorAll('.slider-btn').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          show(index + (button.classList.contains('next') ? 1 : -1));
        });
      });
      dots.forEach((dot, i) => dot.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        show(i);
      }));
    });

    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      const updateBackToTop = () => backToTop.classList.toggle('show', window.scrollY > 300);
      window.addEventListener('scroll', updateBackToTop, { passive: true });
      backToTop.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      updateBackToTop();
    }
  }

  function addBreadcrumb() {
    const body = document.body;
    const section = body.dataset.pmewSection;
    const sectionUrl = body.dataset.pmewSectionUrl;
    const page = body.dataset.pmewPage;
    if (!section || !sectionUrl || !page || document.querySelector('.pmew-breadcrumb')) return;

    const crumb = document.createElement('nav');
    crumb.className = 'pmew-breadcrumb';
    crumb.setAttribute('aria-label', 'Breadcrumb');
    crumb.innerHTML = `<div class="pmew-breadcrumb__inner"><a href="${ROOT}">Home</a><span aria-hidden="true">/</span><a href="${sectionUrl}">${section}</a><span aria-hidden="true">/</span><span aria-current="page">${page}</span></div>`;
    const navbar = document.getElementById('navbar-container');
    (navbar || body).insertAdjacentElement(navbar ? 'afterend' : 'afterbegin', crumb);
  }

  const relatedPages = {
    'Socket Screws': [['Countersunk Screws','/pages/products/screws/countersunk-screws.html'],['Inch Fasteners','/pages/products/inch-fasteners/index.html'],['Automotive & EV','/pages/applications/automotive-ev-fasteners.html'],['Cold Forming & Hot Forging','/pages/quality-manufacturing/cold-forming-hot-forging.html']],
    'Countersunk Screws': [['Socket Screws','/pages/products/screws/socket-screws.html'],['Electronics Fasteners','/pages/applications/electronics-fasteners.html'],['Inch Fasteners','/pages/products/inch-fasteners/index.html'],['All Products','/pages/products/products.html']],
    'Brass Fasteners': [['Electronics Fasteners','/pages/applications/electronics-fasteners.html'],['Inch Fasteners','/pages/products/inch-fasteners/index.html'],['Cold Forming & Hot Forging','/pages/quality-manufacturing/cold-forming-hot-forging.html'],['All Products','/pages/products/products.html']],
    'Inch Fasteners': [['Socket Screws','/pages/products/screws/socket-screws.html'],['Oil, Gas & Petrochemical','/pages/applications/oil-gas-petrochemical-fasteners.html'],['Automotive & EV','/pages/applications/automotive-ev-fasteners.html'],['All Products','/pages/products/products.html']],
    'Automotive & EV Fasteners': [['Socket Screws','/pages/products/screws/socket-screws.html'],['Inch Fasteners','/pages/products/inch-fasteners/index.html'],['Electronics Fasteners','/pages/applications/electronics-fasteners.html'],['Cold Forming & Hot Forging','/pages/quality-manufacturing/cold-forming-hot-forging.html']],
    'Electronics Fasteners': [['Brass Fasteners','/pages/products/brass-fasteners/index.html'],['Countersunk Screws','/pages/products/screws/countersunk-screws.html'],['Automotive & EV','/pages/applications/automotive-ev-fasteners.html'],['All Products','/pages/products/products.html']],
    'Renewable Energy Fasteners': [['Cold Forming & Hot Forging','/pages/quality-manufacturing/cold-forming-hot-forging.html'],['Inch Fasteners','/pages/products/inch-fasteners/index.html'],['Socket Screws','/pages/products/screws/socket-screws.html'],['All Products','/pages/products/products.html']],
    'Oil, Gas & Petrochemical Fasteners': [['Inch Fasteners','/pages/products/inch-fasteners/index.html'],['Cold Forming & Hot Forging','/pages/quality-manufacturing/cold-forming-hot-forging.html'],['Renewable Energy','/pages/applications/renewable-energy-fasteners.html'],['All Products','/pages/products/products.html']],
    'Cold Forming & Hot Forging': [['Socket Screws','/pages/products/screws/socket-screws.html'],['Automotive & EV','/pages/applications/automotive-ev-fasteners.html'],['Renewable Energy','/pages/applications/renewable-energy-fasteners.html'],['Oil, Gas & Petrochemical','/pages/applications/oil-gas-petrochemical-fasteners.html']]
  };

  function addRelatedPages() {
    const links = relatedPages[document.body.dataset.pmewPage];
    if (!links || document.querySelector('.pmew-related')) return;
    const section = document.createElement('section');
    section.className = 'pmew-related';
    section.innerHTML = `<div class="pmew-related__inner"><div><span>Continue exploring</span><h2>Related PMEW capabilities</h2></div><div class="pmew-related__links">${links.map(([label,url]) => `<a href="${url}">${label}<b aria-hidden="true">→</b></a>`).join('')}</div></div>`;
    const footer = document.getElementById('footer-container') || document.querySelector('footer');
    (footer || document.body).insertAdjacentElement(footer ? 'beforebegin' : 'beforeend', section);
  }

  document.addEventListener('DOMContentLoaded', async function () {
    addBreadcrumb();
    addRelatedPages();
    const navbarLoaded = await injectComponent('navbar-container', componentMap['navbar-container']);
    await injectComponent('footer-container', componentMap['footer-container']);
    if (navbarLoaded || document.querySelector('#navbar-container .main-header')) initSharedNavbar();
  });
})();
