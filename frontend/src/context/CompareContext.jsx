import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const CompareContext = createContext(null);
const KEY = 'fefcomputer-compare';
const read = () => { try { return JSON.parse(window.localStorage.getItem(KEY) || '[]'); } catch { return []; } };
export function CompareProvider({ children }) {
  const [productIds, setProductIds] = useState(read);
  const [notice, setNotice] = useState(null);
  useEffect(() => { window.localStorage.setItem(KEY, JSON.stringify(productIds)); }, [productIds]);
  const isInCompare = (id) => productIds.includes(id);
  const toggleCompare = (product) => setProductIds((current) => { if (current.includes(product.id)) return current.filter((id) => id !== product.id); if (current.length >= 4) { setNotice('Puedes comparar hasta 4 productos a la vez.'); return current; } setNotice(`${product.name} se añadió a la comparación.`); return [...current, product.id]; });
  const removeFromCompare = (id) => setProductIds((current) => current.filter((item) => item !== id));
  const clearCompare = () => setProductIds([]);
  const dismissNotice = () => setNotice(null);
  const value = useMemo(() => ({ productIds, compareCount: productIds.length, notice, isInCompare, toggleCompare, removeFromCompare, clearCompare, dismissNotice }), [productIds, notice]);
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
export function useCompare() { const context = useContext(CompareContext); if (!context) throw new Error('useCompare debe usarse dentro de CompareProvider'); return context; }
