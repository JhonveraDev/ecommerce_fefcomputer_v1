import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Boxes, CheckCircle2, ChevronLeft, ChevronRight, Eye, FilePenLine, Image as ImageIcon, Pencil, Plus, RotateCcw, Search, ShieldAlert, Trash2, Upload, X, XCircle } from 'lucide-react';
import { StoreBanner } from '../components/StoreBanner';
import { useAuth } from '../context/AuthContext';
import styles from './AdminProductsPage.module.css';
import './AdminProductsTable.css';
import confirmStyles from './AdminProductsConfirm.module.css';
import dashboardStyles from './AdminProductsDashboard.module.css';
import noticeStyles from './AdminProductNotice.module.css';
import { ProductFormDialog } from './ProductFormDialog';
import { ProductImportDialog } from './ProductImportDialog';

const blankProduct = { name: '', sku: '', category: '', brand: '', basePrice: '', compareAtPrice: '', offerStartsAt: '', offerEndsAt: '', physicalQuantity: 0, shortDescription: '', description: '', imageUrl: '', status: 'ACTIVE', isFeatured: false };
const PRODUCTS_PER_PAGE = 12;
const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value));
const canManageProducts = (user) => user?.roles?.some((role) => ['ADMIN', 'EMPLOYEE'].includes(role));

function DeleteProductDialog({ product, deleting, onCancel, onConfirm }) {
  if (!product) return null;
  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}><section className={confirmStyles.dialog} role="dialog" aria-modal="true" aria-labelledby="delete-product-title"><button className={confirmStyles.close} type="button" aria-label="Cerrar" disabled={deleting} onClick={onCancel}><X size={20} /></button><span className={confirmStyles.warningIcon}><AlertTriangle size={27} /></span><p className={confirmStyles.eyebrow}>Acción permanente</p><h2 id="delete-product-title">¿Eliminar este producto?</h2><div className={confirmStyles.product}>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span><ImageIcon size={20} /></span>}<div><b>{product.name}</b><small>{product.sku || 'Sin SKU'} · {product.category}</small></div></div><p className={confirmStyles.text}>Se eliminarán el producto, su inventario, imágenes y registros relacionados. Esta acción no se puede deshacer.</p><div className={confirmStyles.actions}><button type="button" className={confirmStyles.keep} disabled={deleting} onClick={onCancel}>Conservar producto</button><button type="button" className={confirmStyles.delete} disabled={deleting} onClick={onConfirm}><Trash2 size={17} />{deleting ? 'Eliminando…' : 'Eliminar definitivamente'}</button></div></section></div>;
}

function ProductNotice({ notice, onClose }) {
  if (!notice) return null;
  const success = notice.type === 'success';
  const Icon = success ? CheckCircle2 : XCircle;
  return <aside className={`${noticeStyles.notice} ${success ? noticeStyles.success : noticeStyles.error}`} role="status"><Icon size={21} /><div><b>{success ? 'Producto guardado correctamente' : 'No fue posible guardar el producto'}</b><span>{notice.message}</span></div><button type="button" aria-label="Cerrar aviso" onClick={onClose}><X size={18} /></button></aside>;
}

export function AdminProductsPage() {
  const { user, request } = useAuth();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [summary, setSummary] = useState({});
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [importing, setImporting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const params = new URLSearchParams({ includeArchived: 'true', page: String(page), pageSize: String(PRODUCTS_PER_PAGE) }); if (query.trim()) params.set('q', query.trim()); if (statusFilter !== 'ALL') params.set('status', statusFilter); const catalog = await request(`/admin/products?${params}`); setProducts(catalog.products || []); setTotalProducts(catalog.pagination?.total ?? 0); setSummary(catalog.pagination?.summary || {}); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }, [page, query, request, statusFilter]);
  useEffect(() => { if (!canManageProducts(user)) return undefined; const timer = window.setTimeout(load, query.trim() ? 250 : 0); return () => window.clearTimeout(timer); }, [load, query, user]);
  const pageCount = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const visibleProducts = products;
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(null), 4000); return () => window.clearTimeout(timer); }, [notice]);
  const save = (product, action) => { setEditing(null); if (action === 'created' && page !== 1) setPage(1); else load(); setNotice({ type: 'success', message: action === 'created' ? `“${product.name}” fue creado y ya está en el catálogo.` : `Los cambios de “${product.name}” fueron guardados.` }); window.dispatchEvent(new Event('catalog-updated')); };
  const remove = async () => { if (!pendingDelete) return; setDeleting(true); try { await request(`/admin/products/${pendingDelete.id}`, { method: 'DELETE' }); await load(); setPendingDelete(null); window.dispatchEvent(new Event('catalog-updated')); } catch (requestError) { setError(requestError.message); } finally { setDeleting(false); } };
  if (!canManageProducts(user)) return <main className={styles.page}><StoreBanner title="Administración" items={['Inicio', 'Administración']} /><section className={styles.denied}><ShieldAlert size={42} /><h1>Acceso restringido</h1><p>Este panel está disponible únicamente para cuentas ADMIN y EMPLOYEE.</p></section></main>;
  const metrics = [{ label: 'Total de productos', value: Object.values(summary).reduce((total, count) => total + count, 0), Icon: Boxes }, { label: 'Productos activos', value: summary.ACTIVE || 0, Icon: FilePenLine }, { label: 'Borradores', value: summary.DRAFT || 0, Icon: FilePenLine }];
  const resetFilters = () => { setQuery(''); setStatusFilter('ALL'); setPage(1); };
  return <main className={styles.page}>
    <StoreBanner title="Productos" items={['Inicio', 'Administración', 'Productos']} />
    <section className={styles.content}>
      <div className={styles.heading}><div><p>Panel administrativo</p><h1>Gestión de productos</h1><span>Controla catálogo, disponibilidad y precios desde un solo lugar.</span></div><div className={dashboardStyles.headingActions} aria-label="Acciones de catálogo"><button className={dashboardStyles.importButton} onClick={() => setImporting(true)}><Upload size={18} /><span>Importar vía Excel</span></button><button className={dashboardStyles.createButton} onClick={() => setEditing(blankProduct)}><Plus size={18} /><span>Nuevo producto</span></button></div></div>
      <div className={dashboardStyles.summary}>{metrics.map(({ label, value, Icon }) => <article className={dashboardStyles.metric} key={label}><span className={dashboardStyles.metricIcon}><Icon size={20} /></span><div><small>{label}</small><b>{value}</b></div></article>)}</div>
      <div className={dashboardStyles.toolbar}><label className={dashboardStyles.search}><Search size={18} /><input value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} placeholder="Buscar por nombre, SKU, marca o categoría" /></label><label className={dashboardStyles.filter}>Estado<select value={statusFilter} onChange={(event) => { setPage(1); setStatusFilter(event.target.value); }}><option value="ALL">Todos</option><option value="ACTIVE">Activos</option><option value="DRAFT">Borradores</option><option value="INACTIVE">Inactivos</option><option value="ARCHIVED">Archivados</option></select></label>{(query || statusFilter !== 'ALL') && <button className={dashboardStyles.clear} type="button" onClick={resetFilters}><RotateCcw size={15} />Limpiar</button>}</div>
      <div className={dashboardStyles.resultBar}><span><b>{totalProducts}</b> productos encontrados</span><span>{totalProducts ? `Mostrando ${((page - 1) * PRODUCTS_PER_PAGE) + 1}–${Math.min(page * PRODUCTS_PER_PAGE, totalProducts)} de ${totalProducts}` : 'Los cambios se guardan directamente en el catálogo.'}</span></div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <p className={styles.loading}>Cargando productos…</p> : <><div className={styles.tableWrap}><table><thead><tr><th>Producto</th><th>SKU</th><th>Categoría / Marca</th><th>Precio</th><th>Inventario</th><th>Estado</th><th aria-label="Acciones" /></tr></thead><tbody>{visibleProducts.map((product) => <tr key={product.id}><td><div className={styles.productCell}>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span><ImageIcon size={18} /></span>}<div className={dashboardStyles.tableProduct}><b>{product.name}</b><small>{product.shortDescription || 'Sin descripción corta'}</small></div></div></td><td>{product.sku || '—'}</td><td>{product.category}<small>{product.brand || 'Sin marca'}</small></td><td>{money(product.basePrice)}{product.compareAtPrice && <small>Antes: {money(product.compareAtPrice)}</small>}</td><td><b>{product.totalPhysicalQuantity ?? product.physicalQuantity} unidades</b><small>Base: {product.physicalQuantity}</small></td><td><span className={`${styles.status} ${styles[product.status.toLowerCase()]}`}>{product.status === 'ARCHIVED' ? 'Archivado' : product.status === 'ACTIVE' ? 'Activo' : product.status === 'DRAFT' ? 'Borrador' : 'Inactivo'}</span></td><td><div className={styles.actions}><button type="button" aria-label={`Ver ${product.name} en tienda`} title={product.status === 'ACTIVE' ? 'Ver producto en tienda' : 'Solo los productos activos pueden verse en tienda'} disabled={product.status !== 'ACTIVE'} onClick={() => window.open(`/producto/${encodeURIComponent(product.slug)}`, '_blank', 'noopener,noreferrer')}><Eye size={17} /></button><button type="button" title="Editar" disabled={product.status === 'ARCHIVED'} onClick={() => setEditing(product)}><Pencil size={17} /></button><button type="button" title="Eliminar definitivamente" onClick={() => setPendingDelete(product)}><Trash2 size={17} /></button></div></td></tr>)}{!visibleProducts.length && <tr><td colSpan="7"><div className={dashboardStyles.empty}><Search size={30} /><h2>No encontramos productos</h2><p>Ajusta la búsqueda o limpia los filtros para ver el catálogo.</p></div></td></tr>}</tbody></table></div>{totalProducts > PRODUCTS_PER_PAGE && <nav className={dashboardStyles.pagination} aria-label="Paginación de productos"><button type="button" aria-label="Página anterior" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={17} /></button><span>Página <b>{page}</b> de {pageCount}</span><button type="button" aria-label="Página siguiente" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}><ChevronRight size={17} /></button></nav>}</>}
    </section>
    {editing && <ProductFormDialog product={editing} onCancel={() => setEditing(null)} onSaved={save} onFailed={(message) => setNotice({ type: 'error', message })} />}
    {importing && <ProductImportDialog onCancel={() => setImporting(false)} onFailed={(message) => setNotice({ type: 'error', message })} onImported={(count) => { setImporting(false); if (page === 1) load(); else setPage(1); setNotice({ type: 'success', message: `${count} productos fueron importados correctamente.` }); window.dispatchEvent(new Event('catalog-updated')); }} />}
    <DeleteProductDialog product={pendingDelete} deleting={deleting} onCancel={() => setPendingDelete(null)} onConfirm={remove} />
    <ProductNotice notice={notice} onClose={() => setNotice(null)} />
  </main>;
}
