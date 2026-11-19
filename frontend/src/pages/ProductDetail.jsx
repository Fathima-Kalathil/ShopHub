import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useApp } from '../AppContext.jsx';
import { Stars } from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, addToCart } = useApp();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const load = () => api(`/products/${id}`).then(setP).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, [id]);

  if (!p) return <p className="py-10 text-center text-slate-500">{msg || 'Loading…'}</p>;

  const add = async () => {
    if (!user) return nav('/login');
    try { await addToCart(p.id, qty); setMsg('Added to your cart.'); } catch (e) { setMsg(e.message); }
  };
  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api(`/products/${id}/reviews`, { method: 'POST', body: review });
      setReview({ rating: 5, comment: '' });
      load();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="space-y-8">
      <Link to="/" className="text-sm text-brand hover:underline">Back to shop</Link>
      <div className="card grid gap-8 p-6 md:grid-cols-2">
        <img src={p.image_url} alt={p.name} className="w-full rounded-lg bg-slate-100 object-cover" />
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <div className="flex items-center gap-2"><Stars value={p.rating} /><span className="text-sm text-slate-500">{p.reviews_count} reviews</span></div>
          <p className="text-3xl font-bold text-accent">{money(p.price)}</p>
          <p className={`text-sm font-medium ${p.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {p.stock > 0 ? `In stock (${p.stock} available)` : 'Out of stock'}
          </p>
          <p className="text-slate-600">{p.description}</p>
          <div className="flex items-center gap-3 pt-2">
            <input type="number" min="1" max={p.stock} value={qty} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))} className="input w-20" aria-label="Quantity" />
            <button className="btn-primary" onClick={add} disabled={p.stock < 1}>Add to cart</button>
          </div>
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
        </div>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-bold">Customer reviews</h2>
        {p.reviews.length === 0 && <p className="text-sm text-slate-500">No reviews yet. Be the first to review this product.</p>}
        <ul className="divide-y divide-slate-100">
          {p.reviews.map((r) => (
            <li key={r.id} className="py-3">
              <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="text-sm font-semibold">{r.name}</span></div>
              <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
            </li>
          ))}
        </ul>
        {user && (
          <form onSubmit={submitReview} className="mt-5 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-5">
            <select className="input w-auto" value={review.rating} onChange={(e) => setReview({ ...review, rating: +e.target.value })} aria-label="Rating">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
            <input className="input flex-1" placeholder="Share your experience" value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
            <button className="btn-dark">Post review</button>
          </form>
        )}
      </section>
    </div>
  );
}
