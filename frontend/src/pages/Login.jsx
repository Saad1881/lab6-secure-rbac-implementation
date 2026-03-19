import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../provider/authProvider";
import api from "../api/axiosConfig";

// Login.jsx — updated to display a "Session Expired" warning banner when the
// URL contains ?expired=true (set by the axios response interceptor in
// axiosConfig.js when a 401/403 is received on a protected endpoint).
const Login = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();

    // ── Read URL query parameters ─────────────────────────────────────────────
    // useSearchParams() gives us a URLSearchParams object without any manual
    // window.location.search parsing.
    //
    // We check for the 'expired' param that the axios interceptor appended:
    //   /login?expired=true
    //
    // We use !! to coerce the string "true" / null to a boolean.
    const [searchParams] = useSearchParams();
    const isExpired = !!searchParams.get('expired');

    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]    = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Call the Spring Boot AuthController at /api/rest/auth/login.
            const res = await api.post("/auth/login", { email, password });

            // Store the JWT in the auth context (which also writes localStorage).
            setToken(res.data.token);

            // Redirect to home page after successful login.
            navigate("/", { replace: true });
        } catch (err) {
            // A 400 Bad Request from AuthController means wrong credentials.
            // We show a specific message here; the axios interceptor does NOT
            // redirect for login-endpoint errors (see the pathname guard there).
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Sign In to Bookstore Admin</h2>

            {/* ── SESSION EXPIRED BANNER (NEW) ─────────────────────────────────
                Shown ONLY when the URL contains ?expired=true.
                This is set by the axios response interceptor when a 401 or 403
                is returned from any protected /api/rest/** endpoint, meaning
                the user's JWT has expired or been invalidated.
                We use a distinct amber/yellow colour to differentiate it from
                the red "wrong credentials" error message below.               */}
            {isExpired && (
                <p style={{
                    color: '#856404',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    display: 'inline-block',
                    marginBottom: '12px'
                }}>
                    ⚠️ Your session has expired. Please sign in again.
                </p>
            )}

            {/* Standard wrong-credentials error (unchanged from original) */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleLogin} style={{ display: "inline-block", textAlign: "left" }}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Username:</label><br/>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <small style={{ display: "block", color: "#888" }}>
                        Hint: try 'admin' or 'user'
                    </small>
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Password:</label><br/>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" style={{ width: "100%" }}>Login</button>
            </form>
        </div>
    );
};

export default Login;