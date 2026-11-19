import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';
import { money } from '../api.js';

export const Stars = ({ value }) => (
  <span className="text-sm text-amber-500" aria-label={`${value} out of 5`}>
    {'★'.repeat(Math.round(value))}<span className="text-slate-300">{'★'.repeat(5 - Math.round(value))}</span>
  </span>
);

export default function ProductCard({ p }) {
  const { user, addToCart } = useApp();
  const nav = useNavigate();
  const add = async () => {
    if (!user) return nav('/login');
    try { await addToCart(p.id); } catch (e) { alert(e.message); }
  };
  return (
    <div className="card flex flex-col overflow-hidden">
      <Link to={`/products/${p.id}`}>
        <img src={p.image_url} alt={p.name} loading="lazy" className="h-44 w-full bg-slate-100 object-cover" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link to={`/products/${p.id}`} className="font-semibold leading-snug hover:text-brand">{p.name}</Link>
        <div className="flex items-center gap-2"><Stars value={p.rating} /><span className="text-xs text-slate-500">({p.reviews_count})</span></div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-accent">{money(p.price)}</span>
          <button className="btn-dark" onClick={add} disabled={p.stock < 1}>{p.stock < 1 ? 'Sold out' : 'Add to cart'}</button>
        </div>
      </div>
    </div>
  );
}
