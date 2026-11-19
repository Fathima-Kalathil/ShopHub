import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useApp } from '../AppContext.jsx';

export default function Checkout() {
  const { cart, cartTotal, loadCart } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ address: '', city: '', zip: '', card: '4111 1111 1111 1111' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (cart.length === 0) {
    return <p className="py-16 text-center text-slate-500">Your cart is empty. <Link to="/" className="text-brand underline">Browse products</Link></p>;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    let order;
    try {
      order = await api('/orders', { method: 'POST', body: { address: f.address, city: f.city, zip: f.zip } });
      await api(`/orders/${order.id}/pay`, { method: 'POST', body: { card: f.card } });
      await loadCart();
      nav('/orders', { state: { placed: order.id } });
    } catch (err) {
      if (order) { await api(`/orders/${order.id}/cancel`, { method: 'POST' }).catch(() => {}); await loadCart(); }
      setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card space-y-3 p-6">
          <h2 className="text-lg font-bold">Shipping address</h2>
          <input className="input" placeholder="Street address" value={f.address} onChange={set('address')} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="City" value={f.city} onChange={set('city')} required />
            <input className="input" placeholder="Postal code" value={f.zip} onChange={set('zip')} required />
          </div>
        </section>
        <section className="card space-y-3 p-6">
          <h2 className="text-lg font-bold">Payment</h2>
          <input className="input" inputMode="numeric" placeholder="Card number" value={f.card} onChange={set('card')} required />
          <p className="text-xs text-slate-500">Demo store. Use 4111 1111 1111 1111 to succeed, 4000 0000 0000 0000 to be declined, or any card ending in 0000 for insufficient funds.</p>
        </section>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      </div>
      <aside className="card h-fit space-y-3 p-5">
        <h2 className="font-bold">Order summary</h2>
        {cart.map((i) => (
          <div key={i.product_id} className="flex justify-between text-sm"><span>{i.name} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>
        ))}
        <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold"><span>Total</span><span>{money(cartTotal)}</span></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Processing…' : `Pay ${money(cartTotal)}`}</button>
      </aside>
    </form>
  );
}
