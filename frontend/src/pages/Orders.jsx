import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api, money } from '../api.js';

const badge = { pending: 'bg-amber-100 text-amber-800', processing: 'bg-blue-100 text-blue-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-slate-200 text-slate-600' };

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const { state } = useLocation();
  const load = () => api('/orders').then(setOrders).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try { await api(`/orders/${id}/cancel`, { method: 'POST' }); load(); } catch (e) { setError(e.message); }
  };

  if (!orders) return <p className="py-10 text-center text-slate-500">{error || 'Loading…'}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My orders</h1>
      {state?.placed && <p className="rounded-lg bg-green-50 p-4 text-sm text-green-800">Payment received. Order #{state.placed} is being processed.</p>}
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {orders.length === 0 && <p className="text-slate-500">No orders yet. <Link to="/" className="text-brand underline">Start shopping</Link></p>}
      {orders.map((o) => (
        <div key={o.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-bold">Order #{o.id}</p>
              <p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()} · {o.payment_status}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge[o.status] || ''}`}>{o.status}</span>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {o.items.map((i, idx) => <li key={idx}>{i.name} × {i.quantity} — {money(i.price * i.quantity)}</li>)}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="font-bold">{money(o.total)}</span>
            {['pending', 'processing'].includes(o.status) && <button className="btn-light" onClick={() => cancel(o.id)}>Cancel order</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
