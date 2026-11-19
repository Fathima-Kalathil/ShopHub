import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';

export default function Navbar() {
  const { user, cartCount, logout } = useApp();
  const nav = useNavigate();
  const link = ({ isActive }) => `text-sm font-medium ${isActive ? 'text-brand' : 'text-slate-600 hover:text-brand'}`;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-brand">ShopHub</Link>
        <nav className="flex items-center gap-5">
          <NavLink to="/" end className={link}>Shop</NavLink>
          {user && <NavLink to="/orders" className={link}>My orders</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin" className={link}>Admin</NavLink>}
          <NavLink to="/cart" className={link}>Cart{cartCount > 0 && <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs text-white">{cartCount}</span>}</NavLink>
          {user ? (
            <button className="btn-light" onClick={() => { logout(); nav('/'); }}>Log out</button>
          ) : (
            <Link to="/login" className="btn-dark">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
