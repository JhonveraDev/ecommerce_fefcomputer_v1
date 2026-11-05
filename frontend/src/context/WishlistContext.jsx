import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCallback, useRef } from 'react';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'fefcomputer-wishlist';
const normalizeIds = (value) => [...new Set((Array.isArray(value) ? value : []).filter((id) => typeof id === 'string' && id.trim()))];
const sameIds = (first, second) => first.length === second.length && first.every((id, index) => id === second[index]);
const readWishlist = () => { try { return normalizeIds(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return []; } };

export function WishlistProvider({ children }) {
  const { isAuthenticated, isLoading, request } = useAuth();
  const [productIds, setProductIds] = useState(readWishlist);
  const [notice, setNotice] = useState(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const syncQueue = useRef(Promise.resolve());
  const skipNextRemoteSync = useRef(false);

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
        skipNextRemoteSync.current = true;
        setProductIds(normalizeIds(data.wishlist));
        setRemoteReady(true);
      })
      .catch(() => { if (active) setRemoteReady(false); });
    return () => { active = false; };
  }, [isAuthenticated, isLoading, request]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
    if (isAuthenticated && remoteReady) {
      if (skipNextRemoteSync.current) {
        skipNextRemoteSync.current = false;
        return;
      }
      // Serialize snapshots so an older PUT cannot arrive after a newer one.
      const snapshot = productIds;
      syncQueue.current = syncQueue.current.catch(() => {}).then(() => request('/account/shopping-state/wishlist', {
        method: 'PUT',
        body: JSON.stringify({ items: snapshot }),
      })).then(({ items }) => setProductIds((current) => {
        // Do not replace state with an equivalent array: that would retrigger
        // this effect and create an endless sequence of PUT requests.
        if (!sameIds(current, snapshot)) return current;
        const normalized = normalizeIds(items);
        return sameIds(current, normalized) ? current : normalized;
      })).catch(() => {});
    }
  }, [productIds, isAuthenticated, remoteReady, request]);

  useEffect(() => {
    const syncFromOtherTab = (event) => { if (event.key === STORAGE_KEY) setProductIds(readWishlist()); };
    window.addEventListener('storage', syncFromOtherTab);
    return () => window.removeEventListener('storage', syncFromOtherTab);
  }, []);

  const reconcileProducts = useCallback((products) => {
    const available = new Set((Array.isArray(products) ? products : []).map((product) => product.id));
    setProductIds((current) => {
      const next = current.filter((id) => available.has(id));
      return sameIds(current, next) ? current : next;
    });
  }, []);

  const isFavorite = (productId) => productIds.includes(productId);
  const toggleWishlist = (product) => setProductIds((current) => {
    if (typeof product?.id !== 'string') return current;
    const added = !current.includes(product.id);
    setNotice({ id: Date.now(), product, added });
    return added ? [...current, product.id] : current.filter((id) => id !== product.id);
  });
  const removeFromWishlist = (productId) => setProductIds((current) => current.filter((id) => id !== productId));
  const dismissNotice = () => setNotice(null);
  const value = useMemo(() => ({ productIds, wishlistCount: productIds.length, notice, isFavorite, toggleWishlist, removeFromWishlist, reconcileProducts, dismissNotice }), [productIds, notice, reconcileProducts]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() { const context = useContext(WishlistContext); if (!context) throw new Error('useWishlist debe usarse dentro de WishlistProvider'); return context; }
