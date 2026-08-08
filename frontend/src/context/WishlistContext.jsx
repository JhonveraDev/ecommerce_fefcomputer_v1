import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'fefcomputer-wishlist';
const readWishlist = () => { try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState(readWishlist);
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds)); }, [productIds]);
  const isFavorite = (productId) => productIds.includes(productId);
  const toggleWishlist = (product) => setProductIds((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id]);
  const removeFromWishlist = (productId) => setProductIds((current) => current.filter((id) => id !== productId));
  const value = useMemo(() => ({ productIds, wishlistCount: productIds.length, isFavorite, toggleWishlist, removeFromWishlist }), [productIds]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error('useWishlist debe usarse dentro de WishlistProvider'); return context; }
