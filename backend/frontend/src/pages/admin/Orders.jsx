import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';
import StatusBadge from '../../components/StatusBadge.jsx';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [tab, setTab] = useState('all');
  const [data, setData] = useState({ orders: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api(`/admin/orders?status=${tab}`)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => { setLoading(true); load(); }, [tab]);

  const counts = data.counts || {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const change = async (id, status) => {
    try { await api(`/admin/orders/${id}`, { method: 'PUT', body: { status } }); load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {[['all', 'All', total], ...STATUSES.map((s) => [s, s[0].toUpperCase() + s.slice(1), counts[s] || 0])].map(([key, label, n]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${tab === key ? 'bg-brand text-white' : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-100'}`}>
            {label} <span className="ml-1 opacity-70">{n}</span>
          </button>
        ))}
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 align-top">
                <td className="p-3"><p className="font-semibold">#{o.id}</p><p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</p></td>
                <td className="p-3"><p className="font-medium">{o.customer.name}</p><p className="text-xs text-slate-500">{o.customer.email}</p><p className="text-xs text-slate-500">{o.address}, {o.city} {o.zip}</p></td>
                <td className="p-3 text-slate-600">{o.items.map((i, n) => <p key={n}>{i.name} × {i.quantity}</p>)}</td>
                <td className="p-3 font-semibold">{money(o.total)}</td>
                <td className="p-3"><StatusBadge value={o.payment_status} /></td>
                <td className="p-3">
                  <select className="input !w-auto !py-1" value={o.status} disabled={o.status === 'cancelled'} onChange={(e) => change(o.id, e.target.value)} aria-label={`Status of order ${o.id}`}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.orders.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No orders in this view.</p>}
        {loading && <p className="p-6 text-center text-sm text-slate-500">Loading orders…</p>}
      </div>
    </div>
  );
}
