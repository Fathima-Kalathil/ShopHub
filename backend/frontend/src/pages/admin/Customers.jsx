import { useEffect, useState } from 'react';
import { api, money } from '../../api.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/admin/customers').then(setCustomers).catch((e) => setError(e.message)); }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Customers</h1>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Orders</th><th className="p-3">Total spent</th><th className="p-3">Joined</th></tr></thead>
          <tbody>
            {(customers || []).map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{c.name}</td><td className="p-3 text-slate-600">{c.email}</td>
                <td className="p-3">{c.orders_count}</td><td className="p-3">{money(c.total_spent)}</td>
                <td className="p-3 text-slate-500">{new Date(c.joined).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers && customers.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No customers yet.</p>}
        {!customers && !error && <p className="p-6 text-center text-sm text-slate-500">Loading customers…</p>}
      </div>
    </div>
  );
}
