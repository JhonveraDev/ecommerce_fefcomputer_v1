import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileSpreadsheet, LoaderCircle, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './AdminProductsPage.module.css';
import modalStyles from './AdminProductsModal.module.css';
import importStyles from './ProductImportDialog.module.css';

export function ProductImportDialog({ onCancel, onImported, onFailed }) {
  const { request } = useAuth();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const validate = async () => {
    if (!file) return setError('Selecciona un archivo Excel antes de continuar.');
    setBusy(true); setError(''); setPreview(null);
    try { const form = new FormData(); form.append('file', file); setPreview(await request('/admin/products/import/preview', { method: 'POST', body: form })); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };
  const confirm = async () => {
    if (!preview?.token) return; setBusy(true); setError('');
    try { const result = await request('/admin/products/import/confirm', { method: 'POST', body: JSON.stringify({ token: preview.token }) }); onImported(result.imported); }
    catch (requestError) { setError(requestError.message); onFailed?.(requestError.message); }
    finally { setBusy(false); }
  };
  const selectFile = (nextFile) => { setFile(nextFile || null); setPreview(null); setError(''); };
  const templateUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/product-import-template`;
  return <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}><section className={`${modalStyles.dialog} ${importStyles.dialog}`} role="dialog" aria-modal="true" aria-labelledby="product-import-title"><header className={importStyles.header}><div className={importStyles.titleGroup}><span className={importStyles.icon}><FileSpreadsheet size={20} /></span><div><p>Catálogo</p><h2 id="product-import-title">Importar productos vía Excel</h2></div></div><button className={importStyles.close} type="button" aria-label="Cerrar" disabled={busy} onClick={onCancel}><X size={19} /></button></header><div className={importStyles.body}>
    <div className={importStyles.intro}><p>Carga hasta 500 productos en un solo archivo. Revisaremos cada fila antes de agregarla al catálogo.</p><div className={importStyles.steps}><span><b>1</b>Plantilla</span><span><b>2</b>Validación</span><span><b>3</b>Importación</span></div></div>
    <a className={importStyles.template} href={templateUrl} download><span className={importStyles.templateIcon}><FileSpreadsheet size={20} /></span><span><b>Descargar plantilla Excel</b><small>Productos y variantes con ejemplos listos para editar.</small></span><span className={importStyles.download}>Descargar</span></a>
    <label className={importStyles.dropzone}><input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => selectFile(event.target.files?.[0])} /><span className={importStyles.uploadIcon}><Upload size={22} /></span><b>{file ? file.name : 'Selecciona o arrastra tu archivo Excel'}</b><small>{file ? `${Math.ceil(file.size / 1024)} KB · selecciona otro archivo para reemplazarlo` : 'Archivo .xlsx · máximo 5 MB'}</small></label>
    {error && <p className={importStyles.error}><AlertCircle size={18} />{error}</p>}
    {preview && <section className={importStyles.preview}><div className={importStyles.summary}><span><b>{preview.total}</b> filas revisadas</span><span className={preview.invalid ? importStyles.invalid : importStyles.valid}><b>{preview.valid}</b> válidas</span>{preview.invalid > 0 && <span className={importStyles.invalid}><b>{preview.invalid}</b> con errores</span>}</div><div className={importStyles.rows}>{preview.rows.map((row, index) => <article key={`${row.rowNumber}-${row.sku}-${index}`} className={row.valid ? importStyles.rowValid : importStyles.rowInvalid}><span>{row.valid ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}</span><div><b>Fila {row.rowNumber || 'Variantes'}{row.sku ? ` · ${row.sku}` : ''}</b><small>{row.valid ? row.name : row.errors.join(' ')}</small></div></article>)}</div></section>}
  </div><footer className={importStyles.footer}><button type="button" className={styles.secondary} disabled={busy} onClick={onCancel}>Cancelar</button>{preview?.canConfirm ? <button disabled={busy} onClick={confirm}>{busy && <LoaderCircle className={importStyles.spin} size={17} />}{busy ? 'Importando…' : `Importar ${preview.valid} productos`}</button> : <button disabled={busy || !file} onClick={validate}>{busy && <LoaderCircle className={importStyles.spin} size={17} />}{busy ? 'Validando…' : 'Validar archivo'}</button>}</footer></section></div>;
}
