import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Flame,
  Grid2X2,
  Headphones,
  Heart,
  MapPin,
  Menu,
  MonitorSmartphone,
  Search,
  ShoppingCart,
  Sparkles,
  X,
  BatteryCharging,
  BriefcaseBusiness,
  Cable,
  ChevronUp,
  Cpu,
  Gamepad2,
  HardDrive,
  Keyboard,
  Laptop,
  Monitor,
  Network,
  Plus,
  Printer,
  Server,
  ShieldCheck,
  SunMedium,
} from 'lucide-react';
import styles from './Header.module.css';
import { MiniCart } from '../MiniCart/MiniCart';
import { AccountPopup } from '../AccountPopup/AccountPopup';
import { useAuth } from '../../context/AuthContext';
import { productCategories } from '../../data/mockProducts';

const navigationItems = [
  { label: 'Ofertas', icon: Flame, accent: true },
  { label: 'Inicio', dropdown: true, active: true },
  { label: 'Nosotros' },
  { label: 'Tienda', dropdown: true },
  { label: 'Marcas', dropdown: true },
  { label: 'TecnologÃ­a', dropdown: true },
  { label: 'Blog', dropdown: true },
  { label: 'PÃ¡ginas', dropdown: true },
  { label: 'Contacto' },
];

const actionItems = [
  { label: 'Comparar', value: 3, icon: Sparkles },
  { label: 'Favoritos', value: 6, icon: Heart },
  { label: 'Carrito', value: 2, icon: ShoppingCart },
  { label: 'Cuenta', icon: CircleUserRound },
];

const categoryIcons = [Gamepad2, Laptop, Monitor, SunMedium, ShieldCheck, Network, Server, Cpu, Cable, Keyboard, HardDrive, Printer, BriefcaseBusiness, BatteryCharging];
const categoryMenuItems = productCategories.map((label, index) => ({ label, Icon: categoryIcons[index] ?? Grid2X2 }));

function CategoryBrowser() {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const browserRef = useRef(null);
  const visibleCategories = showAll ? categoryMenuItems : categoryMenuItems.slice(0, 10);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!browserRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const selectCategory = (category) => {
    window.location.hash = `tienda?categoria=${encodeURIComponent(category)}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpen(false);
  };

  return <div className={styles.categoryBrowser} ref={browserRef}>
    <button className={styles.browseCategories} type="button" aria-expanded={open} aria-controls="header-category-menu" onClick={() => setOpen((value) => !value)}>
      <Grid2X2 size={20} /> Explorar categorías {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {open && <section className={styles.categoryMenu} id="header-category-menu" aria-label="Explorar categorías">
      <div className={styles.categoryGrid}>
        {visibleCategories.map(({ label, Icon }) => <button key={label} type="button" onClick={() => selectCategory(label)}>
          <span className={styles.categoryMenuIcon}><Icon size={22} strokeWidth={1.8} /></span>
          <span>{label}</span>
          <ChevronRight size={16} aria-hidden="true" />
        </button>)}
      </div>
      {categoryMenuItems.length > 10 && <button className={styles.showMoreCategories} type="button" onClick={() => setShowAll((value) => !value)}>
        <Plus size={20} /> {showAll ? 'Ver menos categorías' : 'Ver más categorías'}
      </button>}
    </section>}
  </div>;
}

function Brand() {
  return (
    <a className={styles.brand} href="#inicio" aria-label="FEFCOMPUTER, inicio">
      <span className={styles.brandMark} aria-hidden="true">
        <MonitorSmartphone size={31} strokeWidth={2.2} />
      </span>
      <span>
        <strong>FEF</strong><b>COMPUTER</b>
        <small>TECNOLOGÃA Y CONFIANZA</small>
      </span>
    </a>
  );
}

function HeaderAction({ icon: Icon, label, value, onClick }) {
  return (
    <button className={styles.headerAction} type="button" aria-label={label} onClick={onClick}>
      <span className={styles.actionIcon}>
        <Icon size={27} strokeWidth={1.8} />
        {value ? <span className={styles.counter}>{value}</span> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

function CartHeaderAction({ value, open, setOpen }) {
  const closeTimer = useRef();
  const keepOpen = () => { window.clearTimeout(closeTimer.current); setOpen(true); };
  const scheduleClose = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 380); };
  const openCart = () => { window.location.hash = 'carrito'; window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' })); setOpen(false); };
  return <div className={styles.cartAction} onMouseEnter={keepOpen} onMouseLeave={scheduleClose}>
    <HeaderAction icon={ShoppingCart} label="Carrito" value={value} onClick={openCart} />
    <MiniCart open={open} onClose={() => setOpen(false)} />
  </div>;
}

function AccountHeaderAction() {
  const closeTimer = useRef();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const keepOpen = () => { window.clearTimeout(closeTimer.current); setOpen(true); };
  const scheduleClose = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 420); };
  const openAccount = () => { window.location.hash = isAuthenticated ? 'cuenta' : 'login'; setOpen(false); };
  return <div className={styles.accountAction} onMouseEnter={keepOpen} onMouseLeave={scheduleClose}>
    <HeaderAction icon={CircleUserRound} label={isAuthenticated ? `Hola, ${user.name}` : "Cuenta"} onClick={openAccount} />
    <AccountPopup open={open} onClose={() => setOpen(false)} />
  </div>;
}

export function Header({ cartCount = 0, wishlistCount = 0, compareCount = 0 }) {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const getSearchFromUrl = () => new URLSearchParams(window.location.hash.split('?')[1] || window.location.search).get('search') || '';
  const [search, setSearch] = useState(getSearchFromUrl);
  useEffect(() => {
    const syncSearch = () => setSearch(getSearchFromUrl());
    window.addEventListener('hashchange', syncSearch);
    window.addEventListener('popstate', syncSearch);
    return () => { window.removeEventListener('hashchange', syncSearch); window.removeEventListener('popstate', syncSearch); };
  }, []);
  const submitSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    window.location.hash = query ? `tienda?search=${encodeURIComponent(query)}` : 'tienda';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={styles.header} id="inicio">
      <div className={styles.topBar}>
        <div className={styles.container}>
          <nav className={styles.utilityLinks} aria-label="Enlaces de utilidad">
            <a href="#nosotros">Nosotros</a>
            <a href="#cuenta">Mi cuenta</a>
            <a href="#favoritos">Favoritos</a>
            <a href="#rastrear">Rastrea tu pedido</a>
          </nav>
          <p className={styles.tagline}>TecnologÃ­a para potenciar tus ideas</p>
          <div className={styles.topControls}>
            <span>Â¿Necesitas ayuda? <a href="tel:+573000000000">LlÃ¡manos: <b>+57 311 8961906</b></a></span>
            <button type="button">EspaÃ±ol <ChevronDown size={12} /></button>
            <button type="button">COP <ChevronDown size={12} /></button>
          </div>
        </div>
      </div>

      <div className={styles.mainBar}>
        <div className={`${styles.container} ${styles.mainContent}`}>
          <Brand />
          <form className={styles.searchBar} role="search" onSubmit={submitSearch}>
            <button className={styles.categorySelect} type="button">
              Todas las categorÃ­as <ChevronDown size={15} />
            </button>
            <label className="srOnly" htmlFor="product-search">Buscar productos</label>
            <input id="product-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca computadores, perifÃ©ricos y mÃ¡s..." />
            <button className={styles.searchButton} type="submit" aria-label="Buscar"><Search size={24} /></button>
          </form>
          <button className={styles.location} type="button">
            <MapPin size={19} />
            <span><b>Tu ubicaciÃ³n</b><small>Selecciona tu ciudad</small></span>
            <ChevronDown size={14} />
          </button>
          <div className={styles.actions}>
            {actionItems.map((action) => action.label === 'Carrito' ? <CartHeaderAction key={action.label} value={cartCount} open={miniCartOpen} setOpen={setMiniCartOpen} /> : action.label === 'Cuenta' ? <AccountHeaderAction key={action.label} /> : <HeaderAction key={action.label} {...action} value={action.label === 'Favoritos' ? wishlistCount : compareCount} onClick={() => { window.location.hash = action.label === 'Favoritos' ? 'favoritos' : 'comparar'; }} />)}
          </div>
          <button className={styles.mobileToggle} type="button" aria-label="Abrir menÃº" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className={`${styles.navigationBar} ${mobileMenuOpen ? styles.menuOpen : ''}`}>
        <div className={`${styles.container} ${styles.navigationContent}`}>
          <CategoryBrowser />
          <nav className={styles.primaryNavigation} aria-label="NavegaciÃ³n principal">
            {navigationItems.map(({ label, icon: Icon, accent, active, dropdown }) => (
              <a key={label} href={label === 'Contacto' ? '#contacto' : `#${label.toLowerCase()}`} className={`${accent ? styles.accentItem : ''} ${active ? styles.activeItem : ''}`}>
                {Icon ? <Icon size={20} /> : null}{label}{dropdown ? <ChevronDown size={14} /> : null}
              </a>
            ))}
          </nav>
          <a className={styles.support} href="tel:+573000000000">
            <Headphones size={35} strokeWidth={1.8} />
            <span><b>+57 311 896 1906</b><small>Soporte al cliente</small></span>
          </a>
          <a className={styles.mobileBrowse} href="#categorias">Ver todas las categorÃ­as <ChevronRight size={16} /></a>
        </div>
      </div>
    </header>
  );
}
