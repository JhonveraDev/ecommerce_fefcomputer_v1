import { FormEvent, useState } from 'react';
import { Eye, EyeOff, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { StoreBanner } from '../components/StoreBanner';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const go = (hash) => { window.location.hash = hash; window.scrollTo({ top: 0, behavior: 'smooth' }); };
const field = (label, name, type = 'text', extra = {}) => ({ label, name, type, ...extra });

export function AuthPage({ mode }) {
  const { login, register, isAuthenticated } = useAuth();
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [notice, setNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  if (isAuthenticated && (mode === 'login' || mode === 'register')) { go('cuenta'); return null; }

  const config = {
    login: { title: 'Iniciar sesión', subtitle: 'Accede a tu cuenta para disfrutar de todos tus beneficios.', submit: 'Iniciar sesión', icon: LogIn, fields: [field('Correo electrónico', 'email', 'email'), field('Contraseña', 'password', 'password')], action: async () => login({ email: values.email, password: values.password }) },
    register: { title: 'Crear cuenta', subtitle: 'Regístrate para gestionar tus compras y beneficios.', submit: 'Crear cuenta', icon: UserPlus, fields: [field('Nombre', 'name'), field('Apellido', 'lastName'), field('Correo electrónico', 'email', 'email'), field('Teléfono', 'phone', 'tel'), field('Contraseña', 'password', 'password'), field('Confirmar contraseña', 'confirmPassword', 'password')], action: async () => register({ name: values.name, lastName: values.lastName, email: values.email, phone: values.phone, password: values.password }) },
    forgot: { title: 'Recuperar contraseña', subtitle: 'Te enviaremos instrucciones para recuperar el acceso a tu cuenta.', submit: 'Enviar instrucciones', icon: KeyRound, fields: [field('Correo electrónico', 'email', 'email')], action: async () => authService.forgotPassword(values.email) },
    reset: { title: 'Restablecer contraseña', subtitle: 'Elige una contraseña nueva y segura para tu cuenta.', submit: 'Actualizar contraseña', icon: KeyRound, fields: [field('Nueva contraseña', 'password', 'password'), field('Confirmar contraseña', 'confirmPassword', 'password')], action: async () => authService.resetPassword({ token: new URLSearchParams(window.location.hash.split('?')[1] || '').get('token') || '', password: values.password }) },
  }[mode];

  const validate = () => {
    const next = {};
    config.fields.forEach(({ name, label }) => { if (!values[name]?.trim()) next[name] = `${label} es obligatorio.`; });
    if (values.email && !emailPattern.test(values.email)) next.email = 'Ingresa un correo electrónico válido.';
    if ((mode === 'register' || mode === 'reset') && values.password && values.password.length < 10) next.password = 'La contraseña debe tener al menos 10 caracteres.';
    if ((mode === 'register' || mode === 'reset') && values.password !== values.confirmPassword) next.confirmPassword = 'Las contraseñas no coinciden.';
    if (mode === 'register' && !values.accepted) next.accepted = 'Debes aceptar los términos para crear tu cuenta.';
    if (mode === 'reset' && !new URLSearchParams(window.location.hash.split('?')[1] || '').get('token')) next.form = 'El enlace de restablecimiento no es válido.';
    return next;
  };
  const submit = async (event) => {
    event.preventDefault(); const next = validate(); setErrors(next); setNotice('');
    if (Object.keys(next).length) return;
    setStatus('loading');
    try { await config.action(); setStatus('success'); setNotice(mode === 'forgot' ? 'Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.' : mode === 'reset' ? 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' : 'Operación realizada correctamente.'); if (mode === 'login' || mode === 'register') go('cuenta'); }
    catch (error) { setStatus('error'); setNotice(error.message); }
  };
  const Icon = config.icon;
  return <main className={styles.page}><StoreBanner title={config.title} items={['Inicio', config.title]} /><section className={styles.card}><header><span className={styles.icon}><Icon size={24} /></span><h2>{config.title}</h2><p>{config.subtitle}</p></header><form noValidate onSubmit={submit}><div className={styles.fields}>{config.fields.map(({ label, name, type }) => <div className={styles.field} key={name}><label htmlFor={name}>{label}</label><div className={styles.inputWrap}><input id={name} name={name} type={type === 'password' && showPassword ? 'text' : type} value={values[name] || ''} onChange={(e) => setValues({ ...values, [name]: e.target.value })} aria-invalid={Boolean(errors[name])} />{type === 'password' && <button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}</div>{errors[name] && <small className={styles.error}>{errors[name]}</small>}</div>)}</div>{mode === 'register' && <label className={styles.consent}><input type="checkbox" checked={Boolean(values.accepted)} onChange={(e) => setValues({ ...values, accepted: e.target.checked })} />Acepto los términos y condiciones y el tratamiento de datos personales.</label>}{errors.accepted && <small className={styles.error}>{errors.accepted}</small>}{errors.form && <p className={styles.error}>{errors.form}</p>}{notice && <p className={status === 'success' ? styles.success : styles.error} role={status === 'error' ? 'alert' : 'status'}>{notice}</p>}<div className={styles.links}>{mode === 'login' && <button type="button" onClick={() => go('recuperar-password')}>¿Olvidaste tu contraseña?</button>}</div><button className={styles.submit} disabled={status === 'loading'}>{status === 'loading' ? 'Procesando...' : config.submit}</button></form><footer>{mode === 'login' && <>¿No tienes una cuenta? <button onClick={() => go('registro')}>Crear una cuenta</button></>}{mode === 'register' && <>¿Ya tienes una cuenta? <button onClick={() => go('login')}>Iniciar sesión</button></>}{(mode === 'forgot' || mode === 'reset') && <button onClick={() => go('login')}>Volver a iniciar sesión</button>}</footer></section></main>;
}