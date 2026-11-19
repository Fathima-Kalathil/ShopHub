import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../../api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats').then(setStats).catch((e) => setError(e.message));
    api('/admin/orders').then((d) => setOrders(d.orders.slice(0, 5))).catch((e) => setError(e.message));
    api('/products').then(setProducts).catch((e) => setError(e.message));
  }, []);

  const low = products.filter((p) => p.stock < 15).sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[['Products', stats.products], ['Orders', stats.orders], ['Customers', stats.customers], ['Revenue', money(stats.revenue)]].map(([l, v]) => (
            <div key={l} className="card p-4"><p className="text-xs text-slate-500">{l}</p><p className="text-2xl font-bold">{v}</p></div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Latest orders</h2>
            <Link to="/admin/orders" className="text-sm text-brand hover:underline">View all orders</Link>
          </div>
          {orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : (
            <ul className="divide-y divide-slate-100">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div><p className="font-semibold">#{o.id} · {o.customer.name}</p><p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()}</p></div>
                  <div className="flex items-center gap-3"><span className="font-semibold">{money(o.total)}</span><StatusBadge value={o.status} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold">Low stock</h2>
          {low.length === 0 ? <p className="text-sm text-slate-500">Every product has enough stock.</p> : (
            <ul className="space-y-2 text-sm">
              {low.map((p) => (
                <li key={p.id} className="flex justify-between gap-2"><span>{p.name}</span><span className="font-semibold text-red-600">{p.stock} left</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
