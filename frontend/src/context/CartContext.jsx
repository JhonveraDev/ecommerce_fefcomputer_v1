import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'fefcomputer-cart';

const readCart = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [notice, setNotice] = useState(null);
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

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
