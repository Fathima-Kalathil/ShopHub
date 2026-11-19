const styles = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-slate-200 text-slate-600',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ value }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[value] || 'bg-slate-100 text-slate-600'}`}>{value}</span>;
}
