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
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const addItem = (product, quantity = 1) => setItems((current) => {
    const existing = current.find((item) => item.product.id === product.id);
    const stock = product.stock ?? Infinity;
    if (existing) return current.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(stock, item.quantity + quantity) } : item);
    return [...current, { product, quantity: Math.min(stock, Math.max(1, quantity)) }];
  });
  const updateQuantity = (productId, quantity) => setItems((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: Math.min(item.product.stock ?? Infinity, Math.max(1, quantity)) } : item));
  const removeItem = (productId) => setItems((current) => current.filter((item) => item.product.id !== productId));
  const clearCart = () => setItems([]);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const savings = items.reduce((total, item) => total + Math.max(0, (item.product.previousPrice ?? item.product.price) - item.product.price) * item.quantity, 0);
  const value = useMemo(() => ({ items, itemCount, subtotal, savings, addItem, updateQuantity, removeItem, clearCart }), [items, itemCount, subtotal, savings]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}
