/**
 * Shared Authentication Utilities
 * Common auth state management across micro-frontends
 */

(function() {
    'use strict';

    const AUTH_STORAGE_KEY = 'mf_auth_user';
    const TOKEN_STORAGE_KEY = 'mf_auth_token';

    const Auth = {
        /**
         * Get current user from storage
         */
        getUser() {
            try {
                const userData = localStorage.getItem(AUTH_STORAGE_KEY);
                return userData ? JSON.parse(userData) : null;
            } catch (error) {
                console.error('[Auth] Error reading user:', error);
                return null;
            }
        },

        /**
         * Set current user in storage
         */
        setUser(user) {
            try {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

                // Notify other micro-frontends
                if (window.eventBus) {
                    window.eventBus.emit(window.EventTypes.USER_UPDATED, { user });
                }

                return true;
            } catch (error) {
                console.error('[Auth] Error saving user:', error);
                return false;
            }
        },

        /**
         * Get auth token
         */
        getToken() {
            return localStorage.getItem(TOKEN_STORAGE_KEY);
        },

        /**
         * Set auth token
         */
        setToken(token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        },

        /**
         * Check if user is authenticated
         */
        isAuthenticated() {
            return !!this.getToken() && !!this.getUser();
        },

        /**
         * Login user
         */
        login(user, token) {
            this.setToken(token);
            this.setUser(user);

            if (window.eventBus) {
                window.eventBus.emit(window.EventTypes.USER_LOGIN, { user });
            }
        },

        /**
         * Logout user
         */
        logout() {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);

            if (window.eventBus) {
                window.eventBus.emit(window.EventTypes.USER_LOGOUT, {});
            }
        },

        /**
         * Get authorization header for API requests
         */
        getAuthHeader() {
            const token = this.getToken();
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        }
    };

    // Listen for auth events from other micro-frontends
    if (window.eventBus) {
        window.eventBus.on(window.EventTypes.USER_LOGOUT, () => {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            console.log('[Auth] Logged out via event bus');
        });
    }

    window.Auth = Auth;

})();
