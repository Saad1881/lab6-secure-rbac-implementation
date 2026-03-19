import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import Navbar from './NavBar';
import Home from './Home';
import Book from './Book';
import BookForm from './BookForm';
import Magazine from './Magazine';
import MagazineForm from './MagazineForm';
import Phone from './Phone';             // NEW
import PhoneForm from './PhoneForm';     // NEW
import Cart from './Cart';
import Login from './pages/Login';
import Logout from './pages/Logout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useAuth } from './provider/authProvider';
import api from './api/axiosConfig';
import './App.css';

function App() {
    const { token } = useAuth();

    const [books,     setBooks]     = useState([]);
    const [magazines, setMagazines] = useState([]);
    const [phones,    setPhones]    = useState([]); // NEW – phone list state
    const [cartCount, setCartCount] = useState(0);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        // If no token exists, don't attempt to fetch secure data
        if (!token) {
            setLoading(false);
            return;
        }

        const loadInitialData = async () => {
            try {
                // NEW: added api.get('/phones') to the parallel fetch
                const [booksRes, magsRes, cartRes, phonesRes] = await Promise.all([
                    api.get('/books'),
                    api.get('/magazines'),
                    api.get('/cart'),
                    api.get('/phones'),   // NEW – fetches from /api/rest/phones
                ]);
                setBooks(booksRes.data);
                setMagazines(magsRes.data);
                setCartCount(cartRes.data.products.length);
                setPhones(phonesRes.data); // NEW – populate phones state
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [token]); // Re-run fetch when token changes (i.e., on login)

    // ── Cart handler (unchanged) ──────────────────────────────────────────────
    const handleAddToCart = async (productId) => {
        try {
            const res = await api.post(`/cart/add/${productId}`);
            setCartCount(res.data.products.length);
            alert("Added to cart!");
        } catch (err) {
            alert("Error adding to cart");
        }
    };

    // ── Book handlers (unchanged) ─────────────────────────────────────────────
    const handleDeleteBook = async (id) => {
        if (!window.confirm("Delete book?")) return;
        await api.delete(`/books/${id}`);
        setBooks(books.filter(b => b.id !== id));
    };

    const handleUpdateBook = async (id, data) => {
        const res = await api.put(`/books/${id}`, data);
        setBooks(books.map(b => b.id === id ? res.data : b));
    };

    // ── Phone handlers (NEW) ──────────────────────────────────────────────────
    // Mirrors the book handlers exactly — delete confirms, update replaces
    // the matching entry in state so the UI reflects the change immediately
    // without a full page reload.
    const handleDeletePhone = async (id) => {
        if (!window.confirm("Delete phone?")) return;
        await api.delete(`/phones/${id}`);
        setPhones(phones.filter(p => p.id !== id));
    };

    const handleUpdatePhone = async (id, data) => {
        const res = await api.put(`/phones/${id}`, data);
        setPhones(phones.map(p => p.id === id ? res.data : p));
    };

    if (loading) return <h2>Loading Bookstore...</h2>;

    return (
        <div className="app-container">
            {/* Only show Navbar if logged in */}
            {token && <Navbar cartCount={cartCount} />}

            <Routes>
                {/* 1. PUBLIC ROUTES */}
                <Route path="/login" element={<Login />} />

                {/* 2. PROTECTED ROUTES */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />

                    {/* ── Books (unchanged) ────────────────────────────────── */}
                    <Route path="/inventory" element={
                        <div className="book-list">
                            <h1>Books</h1>
                            {books.map(b => (
                                <Book key={b.id} {...b}
                                      onDelete={handleDeleteBook}
                                      onUpdate={handleUpdateBook}
                                      onAddToCart={handleAddToCart} />
                            ))}
                        </div>
                    } />

                    {/* ── Magazines (unchanged) ────────────────────────────── */}
                    <Route path="/magazines" element={
                        <div className="magazine-list">
                            <h1>Magazines</h1>
                            {magazines.map(m => (
                                <Magazine key={m.id} {...m}
                                          onAddToCart={handleAddToCart}
                                          onDelete={(id) =>
                                              api.delete(`/magazines/${id}`)
                                                  .then(() => setMagazines(magazines.filter(mag => mag.id !== id)))
                                          }
                                          onUpdate={(id, data) =>
                                              api.put(`/magazines/${id}`, data)
                                                  .then(res => setMagazines(magazines.map(mag => mag.id === id ? res.data : mag)))
                                          }
                                />
                            ))}
                        </div>
                    } />

                    {/* ── Phones (NEW) ──────────────────────────────────────
                        Path /phones renders every PhoneEntity from the DB.
                        Each Phone card receives:
                          - spread props  → brand, model, price, stock, id
                          - onDelete      → calls DELETE /api/rest/phones/{id}
                          - onUpdate      → calls PUT    /api/rest/phones/{id}
                          - onAddToCart   → calls POST   /api/rest/cart/add/{id}
                        The Phone component itself hides Edit/Delete for non-Admins
                        (handled inside Phone.jsx via the isAdmin context value).  */}
                    <Route path="/phones" element={
                        <div className="book-list">
                            <h1>📱 Phones</h1>
                            {phones.length === 0
                                ? <p>No phones in inventory.</p>
                                : phones.map(p => (
                                    <Phone key={p.id} {...p}
                                           onDelete={handleDeletePhone}
                                           onUpdate={handleUpdatePhone}
                                           onAddToCart={handleAddToCart} />
                                ))
                            }
                        </div>
                    } />

                    {/* ── Cart (unchanged) ─────────────────────────────────── */}
                    <Route path="/cart" element={
                        <Cart api={api} onCartChange={(count) => setCartCount(count)} />
                    } />

                    {/* ── Add Book (unchanged) ─────────────────────────────── */}
                    <Route path="/add" element={
                        <BookForm onBookAdded={(b) => setBooks([...books, b])} api={api} />
                    } />

                    {/* ── Add Magazine (unchanged) ─────────────────────────── */}
                    <Route path="/add-magazine" element={
                        <MagazineForm onMagazineAdded={(m) => setMagazines([...magazines, m])} api={api} />
                    } />

                    {/* ── Add Phone (NEW) ───────────────────────────────────
                        onPhoneAdded appends the newly created phone returned
                        by the POST response into the phones array so it shows
                        up in the /phones list immediately without a reload.    */}
                    <Route path="/add-phone" element={
                        <PhoneForm onPhoneAdded={(p) => setPhones([...phones, p])} api={api} />
                    } />

                    <Route path="/logout" element={<Logout />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;