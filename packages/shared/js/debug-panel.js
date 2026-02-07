/**
 * Shared Event Bus Debug Panel
 * Lightweight overlay to inspect cross-microfrontend events
 */

(function() {
    'use strict';

    const eventBus = window.eventBus;
    const EventTypes = window.EventTypes || {};
    const MAX_EVENTS = 50;
    const PANEL_ID = 'mf-debug-panel';

    if (!eventBus) return;

    function createPanel() {
        const existing = document.getElementById(PANEL_ID);
        if (existing) {
            return existing.querySelector('.mf-debug-list');
        }

        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.className = 'mf-debug-panel';
        // Defensive inline styles in case shared CSS is cached
        panel.style.position = 'fixed';
        panel.style.bottom = '16px';
        panel.style.right = '16px';
        panel.style.zIndex = '2147483647';
        panel.innerHTML = `
            <button class="mf-debug-toggle" type="button">MF Events</button>
            <div class="mf-debug-body">
                <div class="mf-debug-title">
                    Event Bus <span class="mf-debug-service">${eventBus.service || 'unknown'}</span>
                </div>
                <div class="mf-debug-list"></div>
            </div>
        `;

        const toggle = panel.querySelector('.mf-debug-toggle');
        const body = panel.querySelector('.mf-debug-body');
        toggle.addEventListener('click', () => {
            body.classList.toggle('is-open');
        });

        if (document.body) {
            document.body.appendChild(panel);
        }
        return panel.querySelector('.mf-debug-list');
    }

    function formatPayload(payload) {
        try {
            return JSON.stringify(payload);
        } catch (e) {
            return String(payload);
        }
    }

    function logEvent(listEl, direction, type, payload, source) {
        if (!listEl || !listEl.isConnected) {
            listEl = createPanel();
            if (!listEl) return;
        }

        const item = document.createElement('div');
        item.className = `mf-debug-item ${direction === 'in' ? 'in' : 'out'}`;
        const time = new Date().toLocaleTimeString();
        item.innerHTML = `
            <div class="mf-debug-meta">
                <span class="mf-debug-time">${time}</span>
                <span class="mf-debug-direction">${direction}</span>
                <span class="mf-debug-type">${type}</span>
            </div>
            <div class="mf-debug-payload">
                <span class="mf-debug-source">${source || 'unknown'}</span>
                <span class="mf-debug-data">${formatPayload(payload)}</span>
            </div>
        `;

        listEl.prepend(item);
        while (listEl.children.length > MAX_EVENTS) {
            listEl.removeChild(listEl.lastChild);
        }
    }

    function init() {
        let listEl = createPanel();

        // Re-attach panel if some script replaces the body
        if (document.body) {
            const observer = new MutationObserver(() => {
                if (!document.getElementById(PANEL_ID)) {
                    listEl = createPanel();
                }
            });
            observer.observe(document.body, { childList: true, subtree: false });
        }

        // Log outbound events
        const originalEmit = eventBus.emit.bind(eventBus);
        eventBus.emit = function(type, payload) {
            logEvent(listEl, 'out', type, payload, eventBus.service);
            return originalEmit(type, payload);
        };

        // Log inbound events for known types
        Object.values(EventTypes).forEach(type => {
            eventBus.on(type, (payload, source) => {
                logEvent(listEl, 'in', type, payload, source);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
