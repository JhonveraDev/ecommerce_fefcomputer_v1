import { Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { useCompare } from '../../context/CompareContext';
import styles from './CompareNotification.module.css';
export function CompareNotification() { const { notice, dismissNotice } = useCompare(); useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(dismissNotice, 3500); return () => window.clearTimeout(timer); }, [notice, dismissNotice]); if (!notice) return null; return <aside className={styles.toast} role="status"><Info size={19} /><span>{notice}</span><button type="button" aria-label="Cerrar" onClick={dismissNotice}><X size={16} /></button></aside>; }
