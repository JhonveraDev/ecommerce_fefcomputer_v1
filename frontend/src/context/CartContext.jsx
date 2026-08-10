import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'fefcomputer-cart';

const readCart = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export function CartProvider({ children }) {
  const { isAuthenticated, isLoading, request } = useAuth();
  const [items, setItems] = useState(readCart);
  const [notice, setNotice] = useState(null);
  const [remoteReady, setRemoteReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (isLoading) return () => { active = false; };
    if (!isAuthenticated) {
      setRemoteReady(false);
      return () => { active = false; };
    }

    setRemoteReady(false);
    request('/account/shopping-state')
      .then((data) => {
        if (!active) return;
        setItems(Array.isArray(data.cart) ? data.cart : []);
        setRemoteReady(true);
      })
      .catch(() => { if (active) setRemoteReady(false); });
    return () => { active = false; };
  }, [isAuthenticated, isLoading, request]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (isAuthenticated && remoteReady) {
      request('/account/shopping-state/cart', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }).catch(() => {});
    }
  }, [items, isAuthenticated, remoteReady, request]);

  const addItem = (product, quantity = 1) => {
    const acceptedQuantity = Math.min(product.stock ?? Infinity, Math.max(1, quantity));
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) return current.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(product.stock ?? Infinity, item.quantity + acceptedQuantity) } : item);
      return [...current, { product, quantity: acceptedQuantity }];
    });
    setNotice({ id: Date.now(), product, quantity: acceptedQuantity });
  };
  const updateQuantity = (productId, quantity) => setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(item.product.stock ?? Infinity, Math.max(1, quantity)) } : item));
  const removeItem = (productId) => setItems((current) => current.filter((item) => item.product.id !== productId));
  const clearCart = () => setItems([]);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const savings = items.reduce((total, item) => total + Math.max(0, (item.product.previousPrice ?? item.product.price) - item.product.price) * item.quantity, 0);
  const dismissNotice = () => setNotice(null);
  const value = useMemo(() => ({ items, itemCount, subtotal, savings, notice, addItem, updateQuantity, removeItem, clearCart, dismissNotice }), [items, itemCount, subtotal, savings, notice]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
