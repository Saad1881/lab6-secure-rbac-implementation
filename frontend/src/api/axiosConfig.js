import axios from 'axios';

const api = axios.create({
    baseURL: '/api/rest'
});

// ─── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
// Unchanged from original: dynamically grabs the JWT from localStorage and
// injects it into the Authorization header before every outgoing request.
// We read it dynamically (not once at startup) so login/logout always reflects
// the current token without recreating the axios instance.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ─── RESPONSE INTERCEPTOR (NEW) ───────────────────────────────────────────────
// Runs after EVERY response comes back from the server (including errors).
//
// WHY WE NEED THIS:
//   401 Unauthorized  → No valid token was sent (missing or malformed JWT).
//   403 Forbidden     → A valid token was sent but it has EXPIRED, or the user's
//                       role does not have permission for that endpoint.
//
// In both cases the user must re-authenticate, so we:
//   1. Wipe the stale/expired token from localStorage immediately.
//   2. Redirect to /login?expired=true so Login.jsx can show a warning banner.
//
// The pathname guard prevents an infinite redirect loop: if the login POST
// itself returns a 401 (wrong password), we let Login.jsx handle that error
// instead of redirecting back to /login endlessly.
api.interceptors.response.use(
    // Happy path – pass the successful response straight through, untouched.
    (response) => response,

    // Error path – inspect the HTTP status code and act accordingly.
    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            // Step 1: Purge the bad token so no future request sends it.
            localStorage.removeItem('token');

            // Step 2: Redirect to login with the expired flag, but ONLY if we
            // are not already on the login page (avoids infinite redirect loop).
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }

        // Always re-reject so any .catch() in the calling component still fires.
        return Promise.reject(error);
    }
);

export default api;