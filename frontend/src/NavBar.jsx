import { Link } from 'react-router';
import { useAuth } from './provider/authProvider';

// NavBar mirrors the original structure but now reads isAdmin from the auth
// context to conditionally render the "Add" links.
//
// WHY hide nav links (not just the page)?
//   Showing links that lead to an "Access Denied" page is confusing UX.
//   Regular users should simply never see the add-product options.
//   The backend still enforces the role check — this is purely a UX improvement.
function Navbar({ cartCount }) {

    // ── Pull isAdmin from the global auth context ─────────────────────────────
    const { isAdmin } = useAuth();

    return (
        <nav className="navbar">
            {/* These links are visible to ALL authenticated users */}
            <Link to="/">🏠 Home</Link>
            <Link to="/inventory">📚 Books</Link>
            <Link to="/magazines">📰 Magazines</Link>
            <Link to="/phones">📱 Phones</Link>
            <Link to="/cart">🛒 Cart ({cartCount})</Link>

            {/* ── RBAC GUARD ─────────────────────────────────────────────────
                "Add" links are ONLY rendered for Admin users.
                Regular users (USER role) can browse and buy, but they have no
                reason to see or visit the add-product forms.
                We use conditional rendering so the <Link> elements are
                completely absent from the DOM — not just hidden with CSS.    */}
            {isAdmin && <Link to="/add">➕ Add Book</Link>}
            {isAdmin && <Link to="/add-magazine">➕ Add Magazine</Link>}
            {isAdmin && <Link to="/add-phone">➕ Add Phone</Link>}

            {/* Logout is always visible, pushed to the far right */}
            <Link to="/logout" style={{ color: "#ff4444", marginLeft: "auto" }}>
                🚪 Logout
            </Link>
        </nav>
    );
}

export default Navbar;