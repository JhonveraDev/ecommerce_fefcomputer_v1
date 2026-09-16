import { useEffect, useState } from 'react';
import { ImagePlus, Plus, Star, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminProductsPage.module.css';
import modalStyles from './AdminProductsModal.module.css';
import formStyles from './ProductFormDialog.module.css';

const MAX_IMAGES = 12;
const empty = { name: '', sku: '', categoryName: '', brandName: '', basePrice: '', compareAtPrice: '', offerStartsAt: '', offerEndsAt: '', physicalQuantity: 0, reorderPoint: 0, weightGrams: '', lengthCm: '', widthCm: '', heightCm: '', shortDescription: '', description: '', imageUrls: [], specifications: {}, status: 'ACTIVE', isFeatured: false };
const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 16) : '';
const toSpecifications = (specifications) => Object.entries(specifications || {}).map(([key, value]) => ({ key, value: String(value) }));
const serializeSpecifications = (specifications) => Object.fromEntries(specifications.filter(({ key, value }) => key.trim() && value.trim()).map(({ key, value }) => [key.trim(), value.trim()]));
const nullableNumber = (value) => value === '' || value == null ? null : Number(value);

function ImagePreview({ url, alt, prominent = false }) {
  return <div className={`${formStyles.preview} ${prominent ? formStyles.mainPreview : ''}`}>
    {url ? <img src={url} alt={alt} /> : <><ImagePlus size={prominent ? 34 : 22} /><span>{prominent ? 'Aún no has agregado una imagen' : 'Sin imagen'}</span></>}
  </div>;
}

export function ProductFormDialog({ product, onCancel, onSaved, onFailed }) {
  const { request } = useAuth();
  const initialImages = product?.imageUrls || (product?.imageUrl ? [product.imageUrl] : []);
  const [values, setValues] = useState(() => ({ ...empty, ...product, categoryName: product?.category || '', brandName: product?.brand || '', offerStartsAt: dateValue(product?.offerStartsAt), offerEndsAt: dateValue(product?.offerEndsAt) }));
  const [mainImage, setMainImage] = useState(() => initialImages[0] || '');
  const [additionalImages, setAdditionalImages] = useState(() => initialImages.slice(1));
  const [specifications, setSpecifications] = useState(() => toSpecifications(product?.specifications));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, []);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const updateAdditional = (index, url) => setAdditionalImages((current) => current.map((item, itemIndex) => itemIndex === index ? url : item));
  const addAdditional = () => setAdditionalImages((current) => current.length + 1 < MAX_IMAGES ? [...current, ''] : current);
  const removeAdditional = (index) => setAdditionalImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const updateSpecification = (index, field, value) => setSpecifications((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  const addSpecification = () => setSpecifications((current) => current.length < 20 ? [...current, { key: '', value: '' }] : current);
  const removeSpecification = (index) => setSpecifications((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const useAsMain = (index) => {
    const selected = additionalImages[index];
    setAdditionalImages((current) => [...(mainImage ? [mainImage] : []), ...current.filter((_, itemIndex) => itemIndex !== index)]);
    setMainImage(selected);
  };

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!values.categoryName.trim()) return setError('Indica una categoría.');
    if (!mainImage.trim()) return setError('La imagen principal es obligatoria.');
    setSaving(true);
    try {
      const payload = { ...values, categoryName: values.categoryName.trim(), brandName: values.brandName.trim(), basePrice: Number(values.basePrice), compareAtPrice: nullableNumber(values.compareAtPrice), physicalQuantity: Number(values.physicalQuantity), reorderPoint: Number(values.reorderPoint), weightGrams: nullableNumber(values.weightGrams), lengthCm: nullableNumber(values.lengthCm), widthCm: nullableNumber(values.widthCm), heightCm: nullableNumber(values.heightCm), offerStartsAt: values.offerStartsAt ? new Date(values.offerStartsAt).toISOString() : null, offerEndsAt: values.offerEndsAt ? new Date(values.offerEndsAt).toISOString() : null, imageUrls: [mainImage, ...additionalImages].map((url) => url.trim()).filter(Boolean), specifications: serializeSpecifications(specifications) };
      const data = await request(values.id ? `/admin/products/${values.id}` : '/admin/products', { method: values.id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      onSaved(data.product, values.id ? 'updated' : 'created');
    } catch (requestError) { setError(requestError.message); onFailed?.(requestError.message); } finally { setSaving(false); }
  };

  return <div className={`${styles.backdrop} ${modalStyles.backdrop}`} role="presentation"><section className={`${styles.dialog} ${modalStyles.dialog} ${formStyles.dialog}`} role="dialog" aria-modal="true" aria-labelledby="product-form-title"><header><div><p>Administración de catálogo</p><h2 id="product-form-title">{values.id ? 'Editar producto' : 'Nuevo producto'}</h2></div><button type="button" aria-label="Cerrar" onClick={onCancel}><X /></button></header><form onSubmit={submit}>{error && <p className={styles.error}>{error}</p>}
    <section className={formStyles.section}><h3>Información básica</h3><div className={styles.formGrid}><label>Nombre<input required value={values.name} onChange={(event) => update('name', event.target.value)} /></label><label>SKU<input required value={values.sku} onChange={(event) => update('sku', event.target.value)} placeholder="Ej. FEF-LAP-001" /></label><label>Categoría<input required value={values.categoryName} onChange={(event) => update('categoryName', event.target.value)} placeholder="Ej. Computadores" /></label><label>Marca<input value={values.brandName} onChange={(event) => update('brandName', event.target.value)} placeholder="Ej. Lenovo" /></label><label className={styles.full}>Descripción corta<textarea maxLength="500" value={values.shortDescription || ''} onChange={(event) => update('shortDescription', event.target.value)} /></label><label className={styles.full}>Descripción completa<textarea rows="4" value={values.description || ''} onChange={(event) => update('description', event.target.value)} /></label></div></section>
    <section className={formStyles.section}><h3>Precio y oferta</h3><p>Para una oferta por tiempo limitado, completa el precio anterior y ambas fechas.</p><div className={styles.formGrid}><label>Precio de venta<input type="number" min="0" required value={values.basePrice} onChange={(event) => update('basePrice', event.target.value)} /></label><label>Precio anterior<input type="number" min="0" value={values.compareAtPrice ?? ''} onChange={(event) => update('compareAtPrice', event.target.value)} /></label><label>Inicio de oferta<input type="datetime-local" value={values.offerStartsAt} onChange={(event) => update('offerStartsAt', event.target.value)} /></label><label>Fin de oferta<input type="datetime-local" value={values.offerEndsAt} onChange={(event) => update('offerEndsAt', event.target.value)} /></label></div></section>
    <section className={formStyles.section}><h3>Inventario y envío</h3><div className={styles.formGrid}><label>Inventario físico<input type="number" min="0" required value={values.physicalQuantity} onChange={(event) => update('physicalQuantity', event.target.value)} /></label><label>Punto de reposición<input type="number" min="0" required value={values.reorderPoint} onChange={(event) => update('reorderPoint', event.target.value)} /></label><label>Peso (gramos)<input type="number" min="0" value={values.weightGrams ?? ''} onChange={(event) => update('weightGrams', event.target.value)} /></label><label>Largo (cm)<input type="number" min="0" value={values.lengthCm ?? ''} onChange={(event) => update('lengthCm', event.target.value)} /></label><label>Ancho (cm)<input type="number" min="0" value={values.widthCm ?? ''} onChange={(event) => update('widthCm', event.target.value)} /></label><label>Alto (cm)<input type="number" min="0" value={values.heightCm ?? ''} onChange={(event) => update('heightCm', event.target.value)} /></label></div></section>
    <section className={formStyles.section}><h3>Imágenes del producto</h3><p>Agrega una portada obligatoria y, si lo necesitas, imágenes secundarias para la galería.</p><div className={formStyles.imagesLayout}>
      <article className={formStyles.mainImageCard}><div className={formStyles.imageCardHeading}><span><Star size={16} fill="currentColor" /> Imagen principal</span><small>Se mostrará como portada del producto.</small></div><ImagePreview url={mainImage} alt="Vista previa de imagen principal" prominent /><label className={formStyles.urlLabel}>URL de la imagen principal<input required type="url" value={mainImage} onChange={(event) => setMainImage(event.target.value)} placeholder="https://..." /></label><div className={formStyles.mainActions}><button type="button" className={formStyles.textButton} onClick={() => setMainImage('')}>Eliminar</button><span>Al cambiar la URL, reemplazas la imagen.</span></div></article>
      <aside className={formStyles.additionalPanel}><div className={formStyles.additionalHeading}><div><h4>Imágenes adicionales</h4><p>Opcionales · {additionalImages.filter(Boolean).length} de {MAX_IMAGES - 1}</p></div><button className={formStyles.addImage} type="button" disabled={additionalImages.length + 1 >= MAX_IMAGES} onClick={addAdditional}><ImagePlus size={16} /> Agregar imagen</button></div><div className={formStyles.additionalGrid}>{additionalImages.map((url, index) => <article className={formStyles.additionalCard} key={`${index}-${url}`}><ImagePreview url={url} alt={`Vista previa adicional ${index + 1}`} /><label>URL<input type="url" value={url} onChange={(event) => updateAdditional(index, event.target.value)} placeholder="https://..." /></label><div className={formStyles.additionalActions}><button type="button" onClick={() => useAsMain(index)} disabled={!url.trim()}><Star size={14} /> Principal</button><button type="button" onClick={() => removeAdditional(index)} aria-label={`Eliminar imagen adicional ${index + 1}`}><Trash2 size={15} /> Eliminar</button></div></article>)}<button className={formStyles.emptyAdditional} type="button" disabled={additionalImages.length + 1 >= MAX_IMAGES} onClick={addAdditional}><ImagePlus size={22} /><span>Agregar imagen</span></button></div></aside>
    </div><div className={formStyles.specificationEditor}><div className={formStyles.specificationHeading}><div><h4>Especificaciones técnicas</h4><p>Agrega únicamente los datos que ayudan a comparar este producto.</p></div><button type="button" onClick={addSpecification} disabled={specifications.length >= 20}><Plus size={16} /> Agregar especificación</button></div>{specifications.length ? <div className={formStyles.specificationRows}>{specifications.map((specification, index) => <div className={formStyles.specificationRow} key={index}><input value={specification.key} maxLength="100" onChange={(event) => updateSpecification(index, 'key', event.target.value)} placeholder="Característica (ej. Memoria RAM)" aria-label={`Característica ${index + 1}`} /><input value={specification.value} maxLength="1000" onChange={(event) => updateSpecification(index, 'value', event.target.value)} placeholder="Valor (ej. 16 GB)" aria-label={`Valor de característica ${index + 1}`} /><button type="button" onClick={() => removeSpecification(index)} aria-label={`Eliminar especificación ${index + 1}`}><Trash2 size={16} /></button></div>)}</div> : <button type="button" className={formStyles.emptySpecification} onClick={addSpecification}><Plus size={20} /><span>Agregar la primera especificación</span></button>}</div></section>
    <section className={formStyles.section}><h3>Visibilidad</h3><div className={formStyles.visibility}><label>Estado<select value={values.status} onChange={(event) => update('status', event.target.value)}><option value="ACTIVE">Activo</option><option value="DRAFT">Borrador</option><option value="INACTIVE">Inactivo</option></select></label><label className={formStyles.featured}><input type="checkbox" checked={Boolean(values.isFeatured)} onChange={(event) => update('isFeatured', event.target.checked)} /><span><b>Mostrar en productos destacados</b><small>Se verá en la sección principal de la tienda.</small></span></label></div></section>
    <footer><button type="button" className={styles.secondary} onClick={onCancel}>Cancelar</button><button disabled={saving}>{saving ? 'Guardando…' : 'Guardar producto'}</button></footer>
  </form></section></div>;
}
