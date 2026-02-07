/**
 * Shared Event Bus
 * Cross-microsite communication using BroadcastChannel API
 */

(function() {
    'use strict';

    const CHANNEL_NAME = 'micro-frontend-events';

    class EventBus {
        constructor() {
            this.channel = new BroadcastChannel(CHANNEL_NAME);
            this.listeners = new Map();
            this.service = this._detectService();

            this.channel.onmessage = (event) => {
                this._handleMessage(event.data);
            };

            console.log(`[EventBus] Initialized for service: ${this.service}`);
        }

        _detectService() {
            const path = window.location.pathname;
            if (path.startsWith('/booking')) return 'booking';
            if (path.startsWith('/catalogue')) return 'catalogue';
            return 'unknown';
        }

        _handleMessage(data) {
            const { type, payload, source } = data;

            // Don't handle our own messages
            if (source === this.service) return;

            console.log(`[EventBus] Received ${type} from ${source}:`, payload);

            const handlers = this.listeners.get(type) || [];
            handlers.forEach(handler => {
                try {
                    handler(payload, source);
                } catch (error) {
                    console.error(`[EventBus] Error in handler for ${type}:`, error);
                }
            });
        }

        /**
         * Emit an event to all micro-frontends
         */
        emit(type, payload = {}) {
            const message = {
                type,
                payload,
                source: this.service,
                timestamp: Date.now()
            };

            this.channel.postMessage(message);
            console.log(`[EventBus] Emitted ${type}:`, payload);
        }

        /**
         * Listen for events from other micro-frontends
         */
        on(type, handler) {
            if (!this.listeners.has(type)) {
                this.listeners.set(type, []);
            }
            this.listeners.get(type).push(handler);

            // Return unsubscribe function
            return () => this.off(type, handler);
        }

        /**
         * Remove event listener
         */
        off(type, handler) {
            const handlers = this.listeners.get(type);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        }

        /**
         * Close the event bus
         */
        destroy() {
            this.channel.close();
            this.listeners.clear();
        }
    }

    // Create singleton instance
    window.eventBus = new EventBus();

    // Common event types
    window.EventTypes = {
        USER_LOGIN: 'user:login',
        USER_LOGOUT: 'user:logout',
        USER_UPDATED: 'user:updated',
        CART_UPDATED: 'cart:updated',
        BOOKING_CREATED: 'booking:created',
        BOOKING_UPDATED: 'booking:updated',
        NOTIFICATION: 'notification'
    };

})();
