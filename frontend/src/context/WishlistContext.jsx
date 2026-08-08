import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'fefcomputer-wishlist';
const readWishlist = () => { try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } };

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState(readWishlist);
  const [notice, setNotice] = useState(null);
  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds)); }, [productIds]);
  const isFavorite = (productId) => productIds.includes(productId);
  const toggleWishlist = (product) => setProductIds((current) => {
    const added = !current.includes(product.id);
    setNotice({ id: Date.now(), product, added });
    return added ? [...current, product.id] : current.filter((id) => id !== product.id);
  });
  const removeFromWishlist = (productId) => setProductIds((current) => current.filter((id) => id !== productId));
  const dismissNotice = () => setNotice(null);
  const value = useMemo(() => ({ productIds, wishlistCount: productIds.length, notice, isFavorite, toggleWishlist, removeFromWishlist, dismissNotice }), [productIds, notice]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error('useWishlist debe usarse dentro de WishlistProvider'); return context; }