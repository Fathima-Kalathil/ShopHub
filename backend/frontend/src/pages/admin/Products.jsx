import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';

const empty = { name: '', description: '', price: '', stock: '', category: 'Electronics', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/products').then(setProducts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api(editing ? `/products/${editing}` : '/products', { method: editing ? 'PUT' : 'POST', body: form });
      setForm(empty); setEditing(null); load();
    } catch (err) { setError(err.message); }
  };
  const edit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category: p.category || '', image_url: p.image_url || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api(`/products/${p.id}`, { method: 'DELETE' }); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Products</h1>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <form onSubmit={save} className="card grid gap-3 p-5 md:grid-cols-3">
        <h2 className="font-bold md:col-span-3">{editing ? 'Edit product' : 'Add a product'}</h2>
        <input className="input" placeholder="Name" value={form.name} onChange={set('name')} required />
        <input className="input" type="number" step="0.01" min="0" placeholder="Price" value={form.price} onChange={set('price')} required />
        <input className="input" type="number" min="0" placeholder="Stock" value={form.stock} onChange={set('stock')} required />
        <input className="input" placeholder="Category" value={form.category} onChange={set('category')} />
        <input className="input md:col-span-2" placeholder="Image URL" value={form.image_url} onChange={set('image_url')} />
        <textarea className="input md:col-span-3" rows="2" placeholder="Description" value={form.description} onChange={set('description')} />
        <div className="flex gap-2 md:col-span-3">
          <button className="btn-primary">{editing ? 'Save changes' : 'Add product'}</button>
          {editing && <button type="button" className="btn-light" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3"></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{p.name}</td><td className="p-3">{p.category}</td><td className="p-3">{money(p.price)}</td>
                <td className="p-3"><span className={p.stock < 15 ? 'font-semibold text-red-600' : ''}>{p.stock}</span></td>
                <td className="space-x-2 p-3 text-right whitespace-nowrap"><button className="btn-light !py-1" onClick={() => edit(p)}>Edit</button><button className="btn-light !py-1 text-red-600" onClick={() => del(p)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
