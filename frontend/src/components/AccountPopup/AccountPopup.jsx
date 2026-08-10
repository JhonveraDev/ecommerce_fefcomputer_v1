import { Heart, LogIn, MapPin, Package, Scale, UserRound, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './AccountPopup.module.css';

const go = (hash, close) => { window.location.hash = hash; close(); };
export function AccountPopup({ open, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  return <section className={open ? styles.open : styles.panel} aria-label="Opciones de cuenta" aria-hidden={!open}>
    {isAuthenticated ? <><header><span>Hola, {user.name}</span><small>{user.email}</small></header><nav><button onClick={() => go('cuenta', onClose)}><UserRound size={17} />Mi cuenta</button><button onClick={() => go('mis-pedidos', onClose)}><Package size={17} />Mis pedidos</button><button onClick={() => go('mis-direcciones', onClose)}><MapPin size={17} />Mis direcciones</button><button onClick={() => go('favoritos', onClose)}><Heart size={17} />Mis favoritos</button><button onClick={() => go('comparar', onClose)}><Scale size={17} />Comparar productos</button></nav><button className={styles.logout} onClick={async () => { await logout(); go('login', onClose); }}><LogOut size={17} />Cerrar sesión</button></> : <><header><span>Mi cuenta</span><small>Inicia sesión para acceder a tus beneficios.</small></header><button className={styles.login} onClick={() => go('login', onClose)}><LogIn size={17} />Iniciar sesión</button><p>¿No tienes una cuenta? <button onClick={() => go('registro', onClose)}>Crear cuenta</button></p></>}
  </section>;
}