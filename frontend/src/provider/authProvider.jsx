import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext();

// ─── JWT DECODER HELPER ───────────────────────────────────────────────────────
// Decodes the Base64Url payload section of a JWT using the browser's built-in
// atob() — no third-party library needed.
//
// A JWT is three dot-separated segments:  header.payload.signature
// Only the middle segment (index 1) contains the user data we care about.
//
// Base64Url vs standard Base64: two characters differ:
//   '-' in Base64Url  →  '+' in standard Base64
//   '_' in Base64Url  →  '/' in standard Base64
// We swap them back before calling atob() so it doesn't throw.
//
// Returns the decoded payload object, or null if ANYTHING goes wrong
// (missing segment, invalid Base64, bad JSON, etc.).  Defensive by design —
// a broken token should never crash the entire app.
const decodeJwt = (token) => {
    try {
        // Split on '.' and grab the payload (middle) section.
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        // Convert Base64Url → standard Base64, then atob → JSON string → object.
        const base64 = base64Url
            .replace(/-/g, '+')   // Base64Url '-' → standard Base64 '+'
            .replace(/_/g, '/');  // Base64Url '_' → standard Base64 '/'

        return JSON.parse(atob(base64));
    } catch (e) {
        // Silently return null; the app will treat this as "not logged in".
        console.warn('JWT decode failed:', e);
        return null;
    }
};

// ─── AUTH PROVIDER ────────────────────────────────────────────────────────────
const AuthProvider = ({ children }) => {
    // Initialize token from localStorage so it survives a page refresh.
    const [token, setToken_] = useState(localStorage.getItem("token"));

    // Wrap the setter so consuming components call setToken(value) uniformly,
    // matching the original API used throughout the project.
    const setToken = (newToken) => {
        setToken_(newToken);
    };

    // ── Decode JWT payload whenever the token changes ─────────────────────────
    // We derive this with useMemo (not a second useState + useEffect) so the
    // decoded value is ALWAYS in sync with `token` on the same render cycle.
    // There is no intermediate render where token is set but payload is stale.
    const decodedPayload = useMemo(() => {
        if (!token) return null;
        return decodeJwt(token);
    }, [token]);

    // ── Derive isAdmin from the decoded payload's roles array ─────────────────
    // Spring Security's UserDetails .roles("ADMIN") builder automatically
    // prepends "ROLE_", so the JWT will contain "ROLE_ADMIN".
    // We check for both "ROLE_ADMIN" and "ADMIN" to be safe in case the token
    // was issued with the raw role string directly.
    // Falls back to false if payload is null or roles is missing.
    const isAdmin = useMemo(() => {
        if (!decodedPayload?.roles) return false;
        return decodedPayload.roles.some(
            (role) => role === 'ROLE_ADMIN' || role === 'ADMIN'
        );
    }, [decodedPayload]);

    // ── Sync token with Axios headers and localStorage ────────────────────────
    // Unchanged from original: keeps the default Axios header and localStorage
    // in sync whenever the token state changes (login or logout).
    useEffect(() => {
        if (token) {
            api.defaults.headers.common["Authorization"] = "Bearer " + token;
            localStorage.setItem("token", token);
        } else {
            delete api.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
        }
    }, [token]);

    // ── Memoize context value to avoid unnecessary re-renders ─────────────────
    // NEW: isAdmin is now included in the context so any component in the tree
    // can read it via useAuth() without prop-drilling.
    const contextValue = useMemo(
        () => ({
            token,
            setToken,
            isAdmin,        // NEW – boolean: true if the logged-in user has ADMIN role
        }),
        [token, isAdmin]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;