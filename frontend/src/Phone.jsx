import { useState } from 'react';
import { useAuth } from './provider/authProvider';

// Phone is the "niche product" component.
// It mirrors the Book/Magazine pattern: inline editing with Save/Cancel,
// an Add-to-Cart button always visible, and Edit/Delete ONLY shown to Admins.
function Phone({ id, brand, model, price, stock, onDelete, onUpdate, onAddToCart }) {

    // ── Pull isAdmin from the global auth context ─────────────────────────────
    // No prop-drilling needed — the same AuthProvider that wraps the whole app
    // exposes isAdmin, which was decoded from the JWT payload in authProvider.jsx.
    const { isAdmin } = useAuth();

    const [isEditing, setIsEditing]   = useState(false);
    const [tempBrand, setTempBrand]   = useState(brand);
    const [tempModel, setTempModel]   = useState(model);
    const [tempPrice, setTempPrice]   = useState(price);
    const [tempStock, setTempStock]   = useState(stock);

    const handleSave = () => {
        const updatedPhone = {
            id,
            brand:  tempBrand,
            model:  tempModel,
            price:  parseFloat(tempPrice),
            stock:  parseInt(tempStock),
        };
        onUpdate(id, updatedPhone);
        setIsEditing(false);
    };

    // ── Editing view ──────────────────────────────────────────────────────────
    // Only reachable by Admins (the Edit button that triggers this is hidden
    // from non-Admins), but we keep the guard here as a second layer of safety.
    if (isEditing) {
        return (
            <div className="book-row editing">
                <input
                    type="text"
                    value={tempBrand}
                    onChange={(e) => setTempBrand(e.target.value)}
                    placeholder="Brand"
                />
                <input
                    type="text"
                    value={tempModel}
                    onChange={(e) => setTempModel(e.target.value)}
                    placeholder="Model"
                />
                <input
                    type="number"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    placeholder="Price"
                />
                <input
                    type="number"
                    value={tempStock}
                    onChange={(e) => setTempStock(e.target.value)}
                    placeholder="Stock"
                />
                <button onClick={handleSave} className="btn-save">Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
        );
    }

    // ── Read-only view ────────────────────────────────────────────────────────
    return (
        <div className="book-row">
            <div className="book-info">
                <h3>📱 {brand} {model}</h3>
                <p>
                    <strong>Price:</strong> ${Number(price).toFixed(2)} &nbsp;|&nbsp;
                    <strong>Stock:</strong> {stock} units
                </p>
            </div>
            <div className="book-actions">
                {/* Add-to-Cart is available to ALL authenticated users (USER + ADMIN). */}
                <button
                    onClick={() => onAddToCart(id)}
                    style={{ backgroundColor: '#28a745', color: 'white' }}
                >
                    🛒 Add to Cart
                </button>

                {/* ── RBAC GUARD ─────────────────────────────────────────────
                    Edit and Delete are ONLY rendered when isAdmin is true.
                    Using conditional rendering (not just CSS display:none) means
                    the buttons are completely absent from the DOM for non-Admins,
                    so there is no way to reveal them via browser DevTools.       */}
                {isAdmin && (
                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ backgroundColor: '#ffc107' }}
                    >
                        Edit
                    </button>
                )}

                {isAdmin && (
                    <button
                        onClick={() => onDelete(id)}
                        style={{ backgroundColor: '#ff4444', color: 'white' }}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}

export default Phone;