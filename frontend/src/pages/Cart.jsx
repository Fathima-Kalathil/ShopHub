import { Link } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';
import { money } from '../api.js';

export default function Cart() {
  const { cart, cartTotal, setQty, removeItem } = useApp();

  if (cart.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-slate-500">Find something you like and it will show up here.</p>
        <Link to="/" className="btn-primary mt-5">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card divide-y divide-slate-100">
        <h1 className="p-5 text-xl font-bold">Shopping cart</h1>
        {cart.map((i) => (
          <div key={i.product_id} className="flex items-center gap-4 p-5">
            <img src={i.image_url} alt="" className="h-20 w-20 rounded-lg bg-slate-100 object-cover" />
            <div className="flex-1">
              <Link to={`/products/${i.product_id}`} className="font-semibold hover:text-brand">{i.name}</Link>
              <p className="text-sm text-accent font-semibold">{money(i.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="btn-light !px-2 !py-1" onClick={() => i.quantity > 1 && setQty(i.product_id, i.quantity - 1)} aria-label="Decrease quantity">−</button>
                <span className="w-8 text-center text-sm">{i.quantity}</span>
                <button className="btn-light !px-2 !py-1" onClick={() => setQty(i.product_id, i.quantity + 1)} disabled={i.quantity >= i.stock} aria-label="Increase quantity">+</button>
                <button className="ml-3 text-sm text-red-600 hover:underline" onClick={() => removeItem(i.product_id)}>Remove</button>
              </div>
            </div>
            <p className="font-bold">{money(i.price * i.quantity)}</p>
          </div>
        ))}
      </div>
      <aside className="card h-fit space-y-3 p-5">
        <h2 className="font-bold">Order summary</h2>
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{money(cartTotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-green-700">Free</span></div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold"><span>Total</span><span>{money(cartTotal)}</span></div>
        <Link to="/checkout" className="btn-primary w-full">Go to checkout</Link>
      </aside>
    </div>
  );
}
