import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ q, category, sort }).toString();
      api(`/products?${qs}`)
        .then((d) => { setProducts(d); setError(''); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, sort]);

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-brand px-8 py-10 text-white">
        <h1 className="text-3xl font-bold">Everyday tech, fairly priced</h1>
        <p className="mt-2 max-w-xl text-blue-100">Headphones, chargers and desk gear. Free shipping, 30-day returns.</p>
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          <option>Electronics</option>
          <option>Accessories</option>
        </select>
        <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading && !products.length ? (
        <p className="py-10 text-center text-slate-500">Loading products…</p>
      ) : products.length === 0 && !error ? (
        <p className="py-10 text-center text-slate-500">No products match your search. Try a different keyword.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
