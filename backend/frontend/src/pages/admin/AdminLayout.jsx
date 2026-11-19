import { NavLink, Outlet } from 'react-router-dom';

const items = [
  ['/admin', 'Dashboard', true],
  ['/admin/products', 'Products'],
  ['/admin/orders', 'Orders'],
  ['/admin/customers', 'Customers'],
];

export default function AdminLayout() {
  const link = ({ isActive }) =>
    `block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="card h-fit p-3">
        <p className="px-3 pb-2 text-xs font-semibold text-slate-500">Admin</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {items.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end} className={link}>{label}</NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
