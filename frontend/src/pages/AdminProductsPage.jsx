import { useEffect, useMemo, useState } from 'react';
import { Archive, Image as ImageIcon, Pencil, Plus, Search, ShieldAlert, X } from 'lucide-react';
import { StoreBanner } from '../components/StoreBanner';
import { useAuth } from '../context/AuthContext';
import styles from './AdminProductsPage.module.css';

const blankProduct = { name: '', sku: '', category: '', brand: '', basePrice: '', compareAtPrice: '', physicalQuantity: 0, reorderPoint: 0, shortDescription: '', description: '', imageUrl: '', status: 'ACTIVE' };
const money = (value) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(value));
const canManageProducts = (user) => user?.roles?.some((role) => ['ADMIN', 'EMPLOYEE'].includes(role));

function ProductForm({ product, options, onCancel, onSaved }) {
  const { request } = useAuth();
  const [values, setValues] = useState(product || blankProduct);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!values.name.trim() || !values.category.trim()) return setError('El nombre y la categoría son obligatorios.');
    if (Number(values.basePrice) < 0 || Number(values.physicalQuantity) < 0 || Number(values.reorderPoint) < 0) return setError('Los precios e inventario no pueden ser negativos.');
    if (values.compareAtPrice !== '' && Number(values.compareAtPrice) < Number(values.basePrice)) return setError('El precio anterior debe ser igual o mayor al precio de venta.');
    setSaving(true);
    try {
      const payload = { ...values, basePrice: Number(values.basePrice), compareAtPrice: values.compareAtPrice === '' ? null : Number(values.compareAtPrice), physicalQuantity: Number(values.physicalQuantity), reorderPoint: Number(values.reorderPoint) };
      const data = await request(values.id ? `/admin/products/${values.id}` : '/admin/products', { method: values.id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      onSaved(data.product);
    } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const fields = [
    ['Nombre', 'name', 'text', true], ['SKU', 'sku', 'text'], ['Precio de venta', 'basePrice', 'number', true], ['Precio anterior', 'compareAtPrice', 'number'], ['Inventario físico', 'physicalQuantity', 'number', true], ['Punto de reposición', 'reorderPoint', 'number'],
  ];
  return <div className={styles.backdrop} role="presentation"><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="product-form-title"><header><div><p>Administración de catálogo</p><h2 id="product-form-title">{values.id ? 'Editar producto' : 'Nuevo producto'}</h2></div><button type="button" aria-label="Cerrar" onClick={onCancel}><X /></button></header><form onSubmit={submit}>{error && <p className={styles.error}>{error}</p>}<div className={styles.formGrid}>{fields.map(([label, key, type, required]) => <label key={key}>{label}<input type={type} min={type === 'number' ? 0 : undefined} step={key.includes('Price') ? 1 : undefined} required={required} value={values[key] ?? ''} onChange={(event) => update(key, event.target.value)} /></label>)}<label>Categoría<input list="admin-categories" required value={values.category} onChange={(event) => update('category', event.target.value)} placeholder="Selecciona o crea una categoría" /><datalist id="admin-categories">{options.categories.map((item) => <option key={item.id} value={item.name} />)}</datalist></label><label>Marca<input list="admin-brands" value={values.brand || ''} onChange={(event) => update('brand', event.target.value)} placeholder="Selecciona o crea una marca" /><datalist id="admin-brands">{options.brands.map((item) => <option key={item.id} value={item.name} />)}</datalist></label><label>Estado<select value={values.status} onChange={(event) => update('status', event.target.value)}><option value="ACTIVE">Activo</option><option value="DRAFT">Borrador</option><option value="INACTIVE">Inactivo</option></select></label><label className={styles.full}>URL de imagen<input type="url" value={values.imageUrl || ''} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://..." /></label><label className={styles.full}>Descripción corta<textarea maxLength="500" value={values.shortDescription || ''} onChange={(event) => update('shortDescription', event.target.value)} /></label><label className={styles.full}>Descripción<textarea rows="4" value={values.description || ''} onChange={(event) => update('description', event.target.value)} /></label></div><footer><button type="button" className={styles.secondary} onClick={onCancel}>Cancelar</button><button disabled={saving}>{saving ? 'Guardando…' : 'Guardar producto'}</button></footer></form></section></div>;
}

export function AdminProductsPage() {
  const { user, request } = useAuth();
  const [products, setProducts] = useState([]);
  const [options, setOptions] = useState({ categories: [], brands: [] });
  const [query, setQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { const [catalog, optionData] = await Promise.all([request(`/admin/products?includeArchived=${includeArchived}`), request('/admin/products/options')]); setProducts(catalog.products); setOptions(optionData); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } };
  useEffect(() => { if (canManageProducts(user)) load(); }, [includeArchived, user]);
  const filtered = useMemo(() => { const text = query.trim().toLocaleLowerCase(); return !text ? products : products.filter((product) => [product.name, product.sku, product.brand, product.category].some((value) => value?.toLocaleLowerCase().includes(text))); }, [products, query]);
  const save = (product) => { setEditing(null); setProducts((current) => [product, ...current.filter((item) => item.id !== product.id)]); setOptions((current) => ({ categories: product.category && !current.categories.some((item) => item.name === product.category) ? [...current.categories, { id: product.categoryId, name: product.category }] : current.categories, brands: product.brand && !current.brands.some((item) => item.name === product.brand) ? [...current.brands, { id: product.brandId, name: product.brand }] : current.brands })); window.dispatchEvent(new Event('catalog-updated')); };
  const archive = async (product) => { if (!window.confirm(`¿Archivar “${product.name}”? Dejará de estar disponible para venta.`)) return; try { await request(`/admin/products/${product.id}`, { method: 'DELETE' }); setProducts((current) => includeArchived ? current.map((item) => item.id === product.id ? { ...item, status: 'ARCHIVED' } : item) : current.filter((item) => item.id !== product.id)); window.dispatchEvent(new Event('catalog-updated')); } catch (requestError) { setError(requestError.message); } };
  if (!canManageProducts(user)) return <main className={styles.page}><StoreBanner title="Administración" items={['Inicio', 'Administración']} /><section className={styles.denied}><ShieldAlert size={42} /><h1>Acceso restringido</h1><p>Este panel está disponible únicamente para cuentas ADMIN y EMPLOYEE.</p></section></main>;
  return <main className={styles.page}><StoreBanner title="Productos" items={['Inicio', 'Administración', 'Productos']} /><section className={styles.content}><div className={styles.heading}><div><p>Panel administrativo</p><h1>Gestión de productos</h1><span>Crea, actualiza, encuentra y archiva el catálogo.</span></div><button onClick={() => setEditing(blankProduct)}><Plus size={18} />Nuevo producto</button></div><div className={styles.toolbar}><label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, SKU, marca o categoría" /></label><label className={styles.check}><input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />Ver archivados</label></div>{error && <p className={styles.error}>{error}</p>}{loading ? <p className={styles.loading}>Cargando productos…</p> : <div className={styles.tableWrap}><table><thead><tr><th>Producto</th><th>SKU</th><th>Categoría / Marca</th><th>Precio</th><th>Inventario</th><th>Estado</th><th aria-label="Acciones" /></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className={styles.productCell}>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <span><ImageIcon size={18} /></span>}<b>{product.name}</b></div></td><td>{product.sku || '—'}</td><td>{product.category}<small>{product.brand || 'Sin marca'}</small></td><td>{money(product.basePrice)}{product.compareAtPrice && <small>Antes: {money(product.compareAtPrice)}</small>}</td><td>{product.physicalQuantity}<small>Reposición: {product.reorderPoint}</small></td><td><span className={`${styles.status} ${styles[product.status.toLowerCase()]}`}>{product.status === 'ARCHIVED' ? 'Archivado' : product.status === 'ACTIVE' ? 'Activo' : product.status === 'DRAFT' ? 'Borrador' : 'Inactivo'}</span></td><td><div className={styles.actions}><button type="button" title="Editar" disabled={product.status === 'ARCHIVED'} onClick={() => setEditing(product)}><Pencil size={17} /></button><button type="button" title="Archivar" disabled={product.status === 'ARCHIVED'} onClick={() => archive(product)}><Archive size={17} /></button></div></td></tr>)}{!filtered.length && <tr><td colSpan="7" className={styles.empty}>No hay productos que coincidan con la búsqueda.</td></tr>}</tbody></table></div>}</section>{editing && <ProductForm product={editing} options={options} onCancel={() => setEditing(null)} onSaved={save} />}</main>;
}
