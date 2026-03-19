import { useState } from 'react';
import { useAuth } from './provider/authProvider';

// PhoneForm mirrors BookForm/MagazineForm in structure.
// NEW: the entire form is hidden from non-Admin users.
// Even if someone navigates directly to /add-phone, they will see an
// Access Denied message instead of the form — no API call will be made.
function PhoneForm({ onPhoneAdded, api }) {

    // ── Pull isAdmin from the global auth context ─────────────────────────────
    const { isAdmin } = useAuth();

    const [brand,  setBrand]  = useState('');
    const [model,  setModel]  = useState('');
    const [price,  setPrice]  = useState(0);
    const [stock,  setStock]  = useState(10);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/phones', {
                brand,
                model,
                price: parseFloat(price),
                stock: parseInt(stock),
            });
            alert("Phone Saved!");
            onPhoneAdded(res.data);
            // Reset form fields after a successful save.
            setBrand(''); setModel(''); setPrice(0); setStock(10);
        } catch (err) {
            alert("Save failed.");
        }
    };

    // ── RBAC GUARD ────────────────────────────────────────────────────────────
    // If the logged-in user is NOT an Admin, render a clear access-denied
    // message instead of the form.  This is a frontend convenience guard;
    // the backend's .hasRole("ADMIN") on POST /api/rest/phones is the true
    // enforcement layer — but showing a clear UI message is good UX.
    if (!isAdmin) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ff4444' }}>
                <h3>🚫 Access Denied</h3>
                <p>Only Administrators can add new phones.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="form-style">
            <h3>📱 Add New Phone</h3>

            <input
                type="text"
                placeholder="Brand (e.g. Apple, Samsung)"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Model (e.g. iPhone 15 Pro)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
            />
            <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />
            <label>
                Stock:&nbsp;
                <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    style={{ width: '80px' }}
                />
            </label>

            <button type="submit">Save Phone</button>
        </form>
    );
}

export default PhoneForm;