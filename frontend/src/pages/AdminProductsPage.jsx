import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Boxes, CheckCircle2, CircleAlert, FilePenLine, Image as ImageIcon, Pencil, Plus, RotateCcw, Search, ShieldAlert, Trash2, X, XCircle } from 'lucide-react';
import { StoreBanner } from '../components/StoreBanner';
import { useAuth } from '../context/AuthContext';
import styles from './AdminProductsPage.module.css';
import confirmStyles from './AdminProductsConfirm.module.css';
import dashboardStyles from './AdminProductsDashboard.module.css';
import modalStyles from './AdminProductsModal.module.css';
import noticeStyles from './AdminProductNotice.module.css';

const blankProduct = { name: '', sku: '', category: '', brand: '', basePrice: '', compareAtPrice: '', offerStartsAt: '', offerEndsAt: '', physicalQuantity: 0, reorderPoint: 0, shortDescription: '', description: '', imageUrl: '', status: 'ACTIVE', isFeatured: false };
const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value));
const canManageProducts = (user) => user?.roles?.some((role) => ['ADMIN', 'EMPLOYEE'].includes(role));

function ProductForm({ product, options, onCancel, onSaved, onFailed }) {
  const { request } = useAuth();
  const [values, setValues] = useState(() => ({ ...blankProduct, ...product, offerStartsAt: product?.offerStartsAt ? new Date(product.offerStartsAt).toISOString().slice(0, 16) : '', offerEndsAt: product?.offerEndsAt ? new Date(product.offerEndsAt).toISOString().slice(0, 16) : '' }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previousOverflow; }; }, []);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!values.name.trim() || !values.category.trim()) return setError('El nombre y la categoría son obligatorios.');
    if (Number(values.basePrice) < 0 || Number(values.physicalQuantity) < 0 || Number(values.reorderPoint) < 0) return setError('Los precios e inventario no pueden ser negativos.');
    setSaving(true);
    try {
      const payload = { ...values, basePrice: Number(values.basePrice), compareAtPrice: values.compareAtPrice === '' || values.compareAtPrice == null ? null : Number(values.compareAtPrice), offerStartsAt: values.offerStartsAt ? new Date(values.offerStartsAt).toISOString() : null, offerEndsAt: values.offerEndsAt ? new Date(values.offerEndsAt).toISOString() : null, physicalQuantity: Number(values.physicalQuantity), reorderPoint: Number(values.reorderPoint) };
      const data = await request(values.id ? `/admin/products/${values.id}` : '/admin/products', { method: values.id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      onSaved(data.product, values.id ? 'updated' : 'created');
    } catch (requestError) { setError(requestError.message); onFailed?.(requestError.message); } finally { setSaving(false); }
  };
  const fields = [
    ['Nombre', 'name', 'text', true], ['SKU', 'sku', 'text'], ['Precio de venta', 'basePrice', 'number', true], ['Precio anterior', 'compareAtPrice', 'number'], ['Inicio de oferta', 'offerStartsAt', 'datetime-local'], ['Fin de oferta', 'offerEndsAt', 'datetime-local'], ['Inventario físico', 'physicalQuantity', 'number', true], ['Punto de reposición', 'reorderPoint', 'number'],
  ];
  return <div className={`${styles.backdrop} ${modalStyles.backdrop}`} role="presentation"><section className={`${styles.dialog} ${modalStyles.dialog}`} role="dialog" aria-modal="true" aria-labelledby="product-form-title"><header><div><p>Administración de catálogo</p><h2 id="product-form-title">{values.id ? 'Editar producto' : 'Nuevo producto'}</h2></div><button type="button" aria-label="Cerrar" onClick={onCancel}><X /></button></header><form onSubmit={submit}>{error && <p className={styles.error}>{error}</p>}<div className={styles.formGrid}>{fields.map(([label, key, type, required]) => <label key={key}>{label}<input type={type} min={type === 'number' ? 0 : undefined} step={key.includes('Price') ? 1 : undefined} required={required} value={values[key] ?? ''} onChange={(event) => update(key, event.target.value)} /></label>)}<label>Categoría<input list="admin-categories" required value={values.category} onChange={(event) => update('category', event.target.value)} placeholder="Selecciona o crea una categoría" /><datalist id="admin-categories">{options.categories.map((item) => <option key={item.id} value={item.name} />)}</datalist></label><label>Marca<input list="admin-brands" value={values.brand || ''} onChange={(event) => update('brand', event.target.value)} placeholder="Selecciona o crea una marca" /><datalist id="admin-brands">{options.brands.map((item) => <option key={item.id} value={item.name} />)}</datalist></label><label>Estado<select value={values.status} onChange={(event) => update('status', event.target.value)}><option value="ACTIVE">Activo</option><option value="DRAFT">Borrador</option><option value="INACTIVE">Inactivo</option></select></label><label className={styles.full}>URL de imagen<input type="url" value={values.imageUrl || ''} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://..." /></label><label className={styles.featured}><input type="checkbox" checked={Boolean(values.isFeatured)} onChange={(event) => update('isFeatured', event.target.checked)} /><span><b>Mostrar en productos destacados</b><small>Se verá en la sección principal de la tienda.</small></span></label><label className={styles.full}>Descripción corta<textarea maxLength="500" value={values.shortDescription || ''} onChange={(event) => update('shortDescription', event.target.value)} /></label><label className={styles.full}>Descripción<textarea rows="4" value={values.description || ''} onChange={(event) => update('description', event.target.value)} /></label></div><footer><button type="button" className={styles.secondary} onClick={onCancel}>Cancelar</button><button disabled={saving}>{saving ? 'Guardando…' : 'Guardar producto'}</button></footer></form></section></div>;
}

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
  const [options, setOptions] = useState({ categories: [], brands: [] });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const [catalog, optionData] = await Promise.all([request('/admin/products?includeArchived=true'), request('/admin/products/options')]); setProducts(catalog.products); setOptions(optionData); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } };
  useEffect(() => { if (canManageProducts(user)) load(); }, [user]);
  const filtered = useMemo(() => { const text = query.trim().toLocaleLowerCase(); return products.filter((product) => (statusFilter === 'ALL' || product.status === statusFilter) && (!text || [product.name, product.sku, product.brand, product.category].some((value) => value?.toLocaleLowerCase().includes(text)))); }, [products, query, statusFilter]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(null), 4000); return () => window.clearTimeout(timer); }, [notice]);
  const save = (product, action) => { setEditing(null); setProducts((current) => [product, ...current.filter((item) => item.id !== product.id)]); setOptions((current) => ({ categories: product.category && !current.categories.some((item) => item.name === product.category) ? [...current.categories, { id: product.categoryId, name: product.category }] : current.categories, brands: product.brand && !current.brands.some((item) => item.name === product.brand) ? [...current.brands, { id: product.brandId, name: product.brand }] : current.brands })); setNotice({ type: 'success', message: action === 'created' ? `“${product.name}” fue creado y ya está en el catálogo.` : `Los cambios de “${product.name}” fueron guardados.` }); window.dispatchEvent(new Event('catalog-updated')); };
  const remove = async () => { if (!pendingDelete) return; setDeleting(true); try { await request(`/admin/products/${pendingDelete.id}`, { method: 'DELETE' }); setProducts((current) => current.filter((item) => item.id !== pendingDelete.id)); setPendingDelete(null); window.dispatchEvent(new Event('catalog-updated')); } catch (requestError) { setError(requestError.message); } finally { setDeleting(false); } };
  if (!canManageProducts(user)) return <main className={styles.page}><StoreBanner title="Administración" items={['Inicio', 'Administración']} /><section className={styles.denied}><ShieldAlert size={42} /><h1>Acceso restringido</h1><p>Este panel está disponible únicamente para cuentas ADMIN y EMPLOYEE.</p></section></main>;
  const metrics = [{ label: 'Total de productos', value: products.length, Icon: Boxes }, { label: 'Productos activos', value: products.filter((product) => product.status === 'ACTIVE').length, Icon: FilePenLine }, { label: 'Inventario bajo', value: products.filter((product) => product.physicalQuantity <= product.reorderPoint).length, Icon: CircleAlert }, { label: 'Borradores', value: products.filter((product) => product.status === 'DRAFT').length, Icon: FilePenLine }];
  const resetFilters = () => { setQuery(''); setStatusFilter('ALL'); };
  return <main className={styles.page}>
    <StoreBanner title="Productos" items={['Inicio', 'Administración', 'Productos']} />
    <section className={styles.content}>
      <div className={styles.heading}><div><p>Panel administrativo</p><h1>Gestión de productos</h1><span>Controla catálogo, disponibilidad y precios desde un solo lugar.</span></div><button onClick={() => setEditing(blankProduct)}><Plus size={18} />Nuevo producto</button></div>
      <div className={dashboardStyles.summary}>{metrics.map(({ label, value, Icon }) => <article className={dashboardStyles.metric} key={label}><span className={dashboardStyles.metricIcon}><Icon size={20} /></span><div><small>{label}</small><b>{value}</b></div></article>)}</div>
      <div className={dashboardStyles.toolbar}><label className={dashboardStyles.search}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, SKU, marca o categoría" /></label><label className={dashboardStyles.filter}>Estado<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">Todos</option><option value="ACTIVE">Activos</option><option value="DRAFT">Borradores</option><option value="INACTIVE">Inactivos</option><option value="ARCHIVED">Archivados</option></select></label>{(query || statusFilter !== 'ALL') && <button className={dashboardStyles.clear} type="button" onClick={resetFilters}><RotateCcw size={15} />Limpiar</button>}</div>
      <div className={dashboardStyles.resultBar}><span><b>{filtered.length}</b> de {products.length} productos</span><span>Los cambios se guardan directamente en el catálogo.</span></div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <p className={styles.loading}>Cargando productos…</p> : <div className={styles.tableWrap}><table><thead><tr><th>Producto</th><th>SKU</th><th>Categoría / Marca</th><th>Precio</th><th>Inventario</th><th>Estado</th><th aria-label="Acciones" /></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className={styles.productCell}>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span><ImageIcon size={18} /></span>}<div className={dashboardStyles.tableProduct}><b>{product.name}</b><small>{product.shortDescription || 'Sin descripción corta'}</small></div></div></td><td>{product.sku || '—'}</td><td>{product.category}<small>{product.brand || 'Sin marca'}</small></td><td>{money(product.basePrice)}{product.compareAtPrice && <small>Antes: {money(product.compareAtPrice)}</small>}</td><td><b className={product.physicalQuantity <= product.reorderPoint ? dashboardStyles.lowStock : ''}>{product.physicalQuantity} unidades</b><small>Reposición: {product.reorderPoint}</small></td><td><span className={`${styles.status} ${styles[product.status.toLowerCase()]}`}>{product.status === 'ARCHIVED' ? 'Archivado' : product.status === 'ACTIVE' ? 'Activo' : product.status === 'DRAFT' ? 'Borrador' : 'Inactivo'}</span></td><td><div className={styles.actions}><button type="button" title="Editar" disabled={product.status === 'ARCHIVED'} onClick={() => setEditing(product)}><Pencil size={17} /></button><button type="button" title="Eliminar definitivamente" onClick={() => setPendingDelete(product)}><Trash2 size={17} /></button></div></td></tr>)}{!filtered.length && <tr><td colSpan="7"><div className={dashboardStyles.empty}><Search size={30} /><h2>No encontramos productos</h2><p>Ajusta la búsqueda o limpia los filtros para ver el catálogo.</p></div></td></tr>}</tbody></table></div>}
    </section>
    {editing && <ProductForm product={editing} options={options} onCancel={() => setEditing(null)} onSaved={save} onFailed={(message) => setNotice({ type: 'error', message })} />}
    <DeleteProductDialog product={pendingDelete} deleting={deleting} onCancel={() => setPendingDelete(null)} onConfirm={remove} />
    <ProductNotice notice={notice} onClose={() => setNotice(null)} />
  </main>;
}
