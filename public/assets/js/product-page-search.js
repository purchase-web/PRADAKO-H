/* =========================================================
   PRADAKO PRODUCT PAGE SEARCH
   One shared search engine for every individual product page.

   Expected reusable page structure:
   .mega-category
     .category-title
     .category-count (optional)
     .product-card
       h3

   Products added later using the same classes are searchable
   automatically without updating this file.
   ========================================================= */

(function () {
    'use strict';

    const SELECTORS = {
        showcaseContainer: '.showcase-container',
        hero: '.showcase-hero',
        pendingPanel: '.pending-panel',
        category: '.mega-category',
        categoryTitle: '.category-title',
        categoryCount: '.category-count',
        card: '.product-card',
        productName: 'h3'
    };

    function normalise(value) {
        return String(value || '')
            .toLocaleLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getFamilyName() {
        const heading = document.querySelector('.showcase-title, #pending-title, h1');
        const name = heading ? heading.textContent.trim() : document.title.split('|')[0].trim();
        return name || 'products';
    }

    function createSearchUi() {
        const familyName = getFamilyName();
        const wrapper = document.createElement('section');
        wrapper.className = 'pradako-page-search';
        wrapper.setAttribute('aria-label', `Search ${familyName}`);
        wrapper.innerHTML = `
            <form class="pradako-page-search__form" role="search" novalidate>
                <div class="pradako-page-search__input-wrap">
                    <i class="fa-solid fa-magnifying-glass pradako-page-search__icon" aria-hidden="true"></i>
                    <label class="sr-only" for="pradakoProductPageSearch">Search ${escapeHtml(familyName)}</label>
                    <input
                        id="pradakoProductPageSearch"
                        class="pradako-page-search__input"
                        type="search"
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="Search ${escapeHtml(familyName)}, categories or product names"
                    >
                </div>
                <button class="pradako-page-search__button" type="submit">
                    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <span>Search</span>
                </button>
                <button class="pradako-page-search__clear" type="button" hidden>
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    <span>Clear</span>
                </button>
            </form>
            <div class="pradako-page-search__meta" aria-live="polite">
                <span class="pradako-page-search__status"></span>
                <span class="pradako-page-search__hint">Search by product or category name</span>
            </div>
        `;
        return wrapper;
    }

    function createEmptyState() {
        const empty = document.createElement('div');
        empty.className = 'pradako-page-search__empty';
        empty.hidden = true;
        empty.innerHTML = `
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <strong>No matching products found</strong>
            <span>Try a different product or category name.</span>
        `;
        return empty;
    }

    function findPlacement() {
        const showcaseContainer = document.querySelector(SELECTORS.showcaseContainer);
        if (showcaseContainer) {
            return {
                parent: showcaseContainer,
                after: showcaseContainer.querySelector(SELECTORS.hero)
            };
        }

        const pendingPanel = document.querySelector(SELECTORS.pendingPanel);
        if (pendingPanel) {
            return {
                parent: pendingPanel,
                after: pendingPanel.querySelector('.pending-copy, h1')
            };
        }

        const main = document.querySelector('main');
        return main ? { parent: main, after: null } : null;
    }

    function initialiseProductPageSearch() {
        if (document.querySelector('.pradako-page-search')) return;

        const placement = findPlacement();
        if (!placement) return;

        const searchUi = createSearchUi();
        const emptyState = createEmptyState();

        if (placement.after) {
            placement.after.insertAdjacentElement('afterend', searchUi);
        } else {
            placement.parent.prepend(searchUi);
        }

        searchUi.insertAdjacentElement('afterend', emptyState);

        const form = searchUi.querySelector('.pradako-page-search__form');
        const input = searchUi.querySelector('.pradako-page-search__input');
        const clearButton = searchUi.querySelector('.pradako-page-search__clear');
        const status = searchUi.querySelector('.pradako-page-search__status');
        const contentRoot = placement.parent;
        let activeQuery = '';
        let liveTimer = null;

        function getCategories() {
            return Array.from(contentRoot.querySelectorAll(SELECTORS.category));
        }

        function getAllCards() {
            return Array.from(contentRoot.querySelectorAll(SELECTORS.card));
        }

        function restoreCategoryCount(category) {
            const count = category.querySelector(SELECTORS.categoryCount);
            if (!count) return;
            if (!count.dataset.originalCountText) {
                count.dataset.originalCountText = count.textContent.trim();
            }
            count.textContent = count.dataset.originalCountText;
        }

        function resetView() {
            getCategories().forEach((category) => {
                category.hidden = false;
                restoreCategoryCount(category);
                category.querySelectorAll(SELECTORS.card).forEach((card) => {
                    card.hidden = false;
                    card.classList.remove('pradako-search-match');
                });
            });

            emptyState.hidden = true;
            clearButton.hidden = true;

            const totalCards = getAllCards().length;
            status.textContent = totalCards
                ? `${totalCards} products available on this page`
                : 'No product data has been added to this page yet';
        }

        function applySearch(rawQuery) {
            const query = normalise(rawQuery);
            activeQuery = query;

            if (!query) {
                resetView();
                return;
            }

            const categories = getCategories();
            let matchedProducts = 0;
            let matchedCategories = 0;

            categories.forEach((category) => {
                const titleElement = category.querySelector(SELECTORS.categoryTitle);
                const categoryName = normalise(titleElement ? titleElement.textContent : '');
                const categoryMatches = categoryName.includes(query);
                const cards = Array.from(category.querySelectorAll(SELECTORS.card));
                let visibleInCategory = 0;

                cards.forEach((card) => {
                    const nameElement = card.querySelector(SELECTORS.productName);
                    const productName = nameElement ? nameElement.textContent : card.textContent;
                    const imageAlt = Array.from(card.querySelectorAll('img[alt]'))
                        .map((image) => image.getAttribute('alt'))
                        .join(' ');
                    const keywords = card.dataset.searchKeywords || '';
                    const searchableText = normalise(`${productName} ${imageAlt} ${keywords}`);
                    const isMatch = categoryMatches || searchableText.includes(query);

                    card.hidden = !isMatch;
                    card.classList.toggle('pradako-search-match', isMatch && !categoryMatches);

                    if (isMatch) visibleInCategory += 1;
                });

                category.hidden = visibleInCategory === 0;

                if (visibleInCategory > 0) {
                    matchedCategories += 1;
                    matchedProducts += visibleInCategory;
                }

                const count = category.querySelector(SELECTORS.categoryCount);
                if (count) {
                    if (!count.dataset.originalCountText) {
                        count.dataset.originalCountText = count.textContent.trim();
                    }
                    count.textContent = visibleInCategory === 1
                        ? '1 Matching Product'
                        : `${visibleInCategory} Matching Products`;
                }
            });

            clearButton.hidden = false;
            emptyState.hidden = matchedProducts !== 0;

            if (matchedProducts === 0) {
                status.textContent = `No results for “${rawQuery.trim()}”`;
            } else {
                const productLabel = matchedProducts === 1 ? 'product' : 'products';
                const categoryLabel = matchedCategories === 1 ? 'category' : 'categories';
                status.textContent = `${matchedProducts} ${productLabel} found in ${matchedCategories} ${categoryLabel}`;
            }
        }

        function submitSearch() {
            applySearch(input.value);
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            submitSearch();
        });

        clearButton.addEventListener('click', () => {
            input.value = '';
            applySearch('');
            input.focus();
        });

        input.addEventListener('input', () => {
            window.clearTimeout(liveTimer);

            if (!input.value.trim()) {
                applySearch('');
                return;
            }

            liveTimer = window.setTimeout(submitSearch, 220);
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                input.value = '';
                applySearch('');
                input.focus();
            }
        });

        resetView();

        // Some product pages render their cards from JavaScript. Observe only
        // until cards appear, then reapply the current search and disconnect.
        if (getAllCards().length === 0) {
            const observer = new MutationObserver(() => {
                if (getAllCards().length > 0) {
                    applySearch(activeQuery || input.value);
                    observer.disconnect();
                }
            });

            observer.observe(contentRoot, {
                childList: true,
                subtree: true
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialiseProductPageSearch);
    } else {
        initialiseProductPageSearch();
    }
})();
