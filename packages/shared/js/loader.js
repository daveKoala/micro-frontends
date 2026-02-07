/**
 * Shared Assets Loader
 * Fetches HTML partials from local or CDN based on configuration
 */

(function() {
    'use strict';

    // Configuration - override via window.SHARED_CONFIG before this script loads
    const config = Object.assign({
        // Base URL for shared assets
        // Local: '/shared'
        // Production CDN: 'https://cdn.example.com/shared'
        baseUrl: '/shared',

        // Cache fetched partials in sessionStorage
        cache: true,

        // Cache version - bump to invalidate cache
        version: '1.0.0'
    }, window.SHARED_CONFIG || {});

    // Detect current service from URL
    function getCurrentService() {
        const path = window.location.pathname;
        if (path.startsWith('/booking')) return 'booking';
        if (path.startsWith('/catalogue')) return 'catalogue';
        // Add more services as needed
        return null;
    }

    // Cache helpers
    function getCacheKey(name) {
        return `shared_partial_${config.version}_${name}`;
    }

    function getFromCache(name) {
        if (!config.cache) return null;
        try {
            return sessionStorage.getItem(getCacheKey(name));
        } catch (e) {
            return null;
        }
    }

    function setCache(name, html) {
        if (!config.cache) return;
        try {
            sessionStorage.setItem(getCacheKey(name), html);
        } catch (e) {
            // Storage full or disabled
        }
    }

    // Fetch a partial
    async function fetchPartial(name) {
        // Check cache first
        const cached = getFromCache(name);
        if (cached) {
            console.log(`[Loader] Using cached: ${name}`);
            return cached;
        }

        const url = `${config.baseUrl}/html/${name}.html`;
        console.log(`[Loader] Fetching: ${url}`);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${name}: ${response.status}`);
            }
            const html = await response.text();
            setCache(name, html);
            return html;
        } catch (error) {
            console.error(`[Loader] Error fetching ${name}:`, error);
            return null;
        }
    }

    // Process header HTML - add active states, service badge
    function processHeader(html) {
        const currentService = getCurrentService();
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Set active state on nav links
        temp.querySelectorAll('[data-nav-link]').forEach(link => {
            if (link.dataset.navLink === currentService) {
                link.classList.add('active');
            }
        });

        // Set service badge
        const badge = temp.querySelector('[data-service-badge]');
        if (badge && currentService) {
            badge.textContent = currentService;
            badge.classList.add(currentService);
        } else if (badge) {
            badge.remove();
        }

        return temp.innerHTML;
    }

    // Process footer HTML - add year, current service
    function processFooter(html) {
        const currentService = getCurrentService();
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Set year
        const yearEl = temp.querySelector('[data-year]');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // Set current service text
        const serviceEl = temp.querySelector('[data-current-service]');
        if (serviceEl && currentService) {
            serviceEl.textContent = ` | Currently viewing: ${currentService}`;
        } else if (serviceEl) {
            serviceEl.remove();
        }

        return temp.innerHTML;
    }

    // Main initialization
    async function init() {
        console.log(`[Loader] Initializing with baseUrl: ${config.baseUrl}`);

        // Fetch partials in parallel
        const [headerHtml, footerHtml] = await Promise.all([
            fetchPartial('header'),
            fetchPartial('footer')
        ]);

        // Inject header
        const header = document.querySelector('.header');
        if (header && headerHtml) {
            header.innerHTML = processHeader(headerHtml);
        }

        // Inject footer
        const footer = document.querySelector('.footer');
        if (footer && footerHtml) {
            footer.innerHTML = processFooter(footerHtml);
        }

        console.log(`[Loader] Done. Service: ${getCurrentService()}`);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.SharedLoader = {
        config,
        getCurrentService,
        reload: init,
        clearCache: function() {
            if (typeof sessionStorage !== 'undefined') {
                Object.keys(sessionStorage)
                    .filter(k => k.startsWith('shared_partial_'))
                    .forEach(k => sessionStorage.removeItem(k));
            }
        }
    };

})();
