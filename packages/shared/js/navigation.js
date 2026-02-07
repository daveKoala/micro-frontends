/**
 * Shared Navigation Component
 * Single source of truth for top-level navigation across all micro-frontends
 */

(function() {
    'use strict';

    // Navigation configuration - edit here to update all micro-frontends
    const NAV_CONFIG = {
        brand: {
            name: 'Micro Frontend',
            href: '/'
        },
        links: [
            {
                name: 'Booking',
                href: '/booking',
                service: 'booking',
                icon: '📅'
            },
            {
                name: 'Catalogue',
                href: '/catalogue',
                service: 'catalogue',
                icon: '📦'
            }
            // Add more micro-frontends here as needed:
            // { name: 'Orders', href: '/orders', service: 'orders', icon: '🛒' },
            // { name: 'Users', href: '/users', service: 'users', icon: '👥' },
        ]
    };

    // Detect current service based on URL path
    function getCurrentService() {
        const path = window.location.pathname;
        for (const link of NAV_CONFIG.links) {
            if (path.startsWith(link.href)) {
                return link.service;
            }
        }
        return null;
    }

    // Build navigation HTML
    function buildNavigation() {
        const currentService = getCurrentService();

        const linksHtml = NAV_CONFIG.links.map(link => {
            const isActive = link.service === currentService;
            const activeClass = isActive ? 'active' : '';
            return `
                <li>
                    <a href="${link.href}" class="${activeClass}">
                        <span class="nav-icon">${link.icon}</span>
                        ${link.name}
                    </a>
                </li>
            `;
        }).join('');

        // Get service badge
        const serviceBadge = currentService
            ? `<span class="nav-service-badge ${currentService}">${currentService}</span>`
            : '';

        return `
            <nav class="nav">
                <div class="nav-brand">
                    <a href="${NAV_CONFIG.brand.href}">${NAV_CONFIG.brand.name}</a>
                    ${serviceBadge}
                </div>
                <ul class="nav-links">
                    ${linksHtml}
                </ul>
            </nav>
        `;
    }

    // Build footer HTML
    function buildFooter() {
        const currentYear = new Date().getFullYear();
        const currentService = getCurrentService();

        return `
            <div class="container">
                <p>
                    Micro Frontend Platform &copy; ${currentYear}
                    ${currentService ? ` | Currently viewing: <strong>${currentService}</strong>` : ''}
                </p>
            </div>
        `;
    }

    // Initialize navigation
    function init() {
        // Find or create header element
        let header = document.querySelector('.header');
        if (!header) {
            header = document.createElement('header');
            header.className = 'header';
            document.body.insertBefore(header, document.body.firstChild);
        }

        // Inject navigation
        header.innerHTML = buildNavigation();

        // Find or create footer element
        let footer = document.querySelector('.footer');
        if (!footer) {
            footer = document.createElement('footer');
            footer.className = 'footer';
            document.body.appendChild(footer);
        }

        // Inject footer
        footer.innerHTML = buildFooter();

        console.log('[Shared Navigation] Initialized for service:', getCurrentService());
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API for other scripts
    window.SharedNav = {
        config: NAV_CONFIG,
        getCurrentService,
        refresh: init
    };

})();
