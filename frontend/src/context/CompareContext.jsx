import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useCallback, useRef } from 'react';

const CompareContext = createContext(null);
const KEY = 'fefcomputer-compare';
const normalizeIds = (value) => [...new Set((Array.isArray(value) ? value : []).filter((id) => typeof id === 'string' && id.trim()))].slice(0, 4);
const sameIds = (first, second) => first.length === second.length && first.every((id, index) => id === second[index]);
const read = () => { try { return normalizeIds(JSON.parse(window.localStorage.getItem(KEY) || '[]')); } catch { return []; } };

export function CompareProvider({ children }) {
  const { isAuthenticated, isLoading, request } = useAuth();
  const [productIds, setProductIds] = useState(read);
  const [notice, setNotice] = useState(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const syncQueue = useRef(Promise.resolve());

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
        setProductIds(normalizeIds(data.compare));
        setRemoteReady(true);
      })
      .catch(() => { if (active) setRemoteReady(false); });
    return () => { active = false; };
  }, [isAuthenticated, isLoading, request]);

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(productIds));
    if (isAuthenticated && remoteReady) {
      // Preserve local mutation order when requests are slow or users click fast.
      const snapshot = productIds;
      syncQueue.current = syncQueue.current.catch(() => {}).then(() => request('/account/shopping-state/compare', {
        method: 'PUT',
        body: JSON.stringify({ items: snapshot }),
      })).then(({ items }) => setProductIds((current) => sameIds(current, snapshot) ? normalizeIds(items) : current)).catch(() => {});
    }
  }, [productIds, isAuthenticated, remoteReady, request]);

  useEffect(() => {
    const syncFromOtherTab = (event) => { if (event.key === KEY) setProductIds(read()); };
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

  const isInCompare = (id) => productIds.includes(id);
  const toggleCompare = (product) => setProductIds((current) => {
    if (typeof product?.id !== 'string') return current;
    if (current.includes(product.id)) return current.filter((id) => id !== product.id);
    if (current.length >= 4) { setNotice('Puedes comparar hasta 4 productos a la vez.'); return current; }
    setNotice(`${product.name} se añadió a la comparación.`);
    return [...current, product.id];
  });
  const removeFromCompare = (id) => setProductIds((current) => current.filter((item) => item !== id));
  const clearCompare = () => setProductIds([]);
  const dismissNotice = () => setNotice(null);
  const value = useMemo(() => ({ productIds, compareCount: productIds.length, notice, isInCompare, toggleCompare, removeFromCompare, clearCompare, reconcileProducts, dismissNotice }), [productIds, notice, reconcileProducts]);
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() { const context = useContext(CompareContext); if (!context) throw new Error('useCompare debe usarse dentro de CompareProvider'); return context; }
