import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);

  const loadCart = useCallback(() => api('/cart').then(setCart).catch(() => setCart([])), []);

  useEffect(() => {
    if (!localStorage.getItem('token')) { setReady(true); return; }
    api('/auth/me')
      .then((u) => { setUser(u); return loadCart(); })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, [loadCart]);

  const authenticate = async (path, body) => {
    const { token, user } = await api(path, { method: 'POST', body });
    localStorage.setItem('token', token);
    setUser(user);
    await loadCart();
    return user;
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); setCart([]); };

  const addToCart = async (productId, quantity = 1) => {
    await api('/cart', { method: 'POST', body: { productId, quantity } });
    await loadCart();
  };
  const setQty = async (productId, quantity) => {
    await api(`/cart/${productId}`, { method: 'PUT', body: { quantity } });
    await loadCart();
  };
  const removeItem = async (productId) => {
    await api(`/cart/${productId}`, { method: 'DELETE' });
    await loadCart();
  };

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cart.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <Ctx.Provider value={{ user, ready, cart, cartCount, cartTotal, authenticate, logout, addToCart, setQty, removeItem, loadCart }}>
      {children}
    </Ctx.Provider>
  );
}
