import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext.jsx';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { authenticate } = useApp();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await authenticate(isLogin ? '/auth/login' : '/auth/register', f);
      nav('/');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card mx-auto mt-6 max-w-sm space-y-4 p-6">
      <h1 className="text-xl font-bold">{isLogin ? 'Log in to ShopHub' : 'Create your account'}</h1>
      {!isLogin && <input className="input" placeholder="Full name" value={f.name} onChange={set('name')} required />}
      <input className="input" type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
      <input className="input" type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} required />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
      <p className="text-center text-sm text-slate-500">
        {isLogin ? <>New here? <Link to="/register" className="text-brand underline">Create an account</Link></> : <>Have an account? <Link to="/login" className="text-brand underline">Log in</Link></>}
      </p>
      {isLogin && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Demo: demo@shophub.com / Demo@123<br />Admin: admin@shophub.com / Admin@123</p>}
    </form>
  );
}
