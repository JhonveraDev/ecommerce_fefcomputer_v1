import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Minus, Phone, Send } from 'lucide-react';
import styles from './WhatsAppChat.module.css';

const WHATSAPP_NUMBER = '573166447621';

export function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) window.setTimeout(() => textareaRef.current?.focus(), 170);
  }, [open]);

  const sendMessage = () => {
    const text = message.trim();
    if (!text) {
      setStatus('empty');
      textareaRef.current?.focus();
      return;
    }
    setStatus('sending');
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => setStatus('sent'), 180);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return <aside className={`${styles.widget} ${open ? styles.open : ''}`} aria-label="Chat de WhatsApp FEFComputer">
    {open && <section className={styles.panel} id="whatsapp-chat-panel" aria-live="polite">
      <header className={styles.header}>
        <span className={styles.brandIcon}><MessageCircle size={22} fill="currentColor" /><Phone size={10} /></span>
        <span className={styles.headerCopy}><b>FEFComputer</b><small><i />Normalmente respondemos rápido</small></span>
        <button type="button" className={styles.minimize} onClick={() => setOpen(false)} aria-label="Minimizar chat"><Minus size={20} /></button>
      </header>
      <div className={styles.conversation}>
        <p className={styles.time}>Hoy</p>
        <div className={styles.welcome}><span>¡Hola! 👋</span><span>¿En qué podemos ayudarte?</span><small>Ahora</small></div>
      </div>
      <div className={styles.composer}>
        <textarea ref={textareaRef} value={message} onChange={(event) => { setMessage(event.target.value); setStatus('idle'); }} onKeyDown={onKeyDown} placeholder="Escribe tu mensaje..." aria-label="Mensaje para WhatsApp" rows={1} />
        <button type="button" className={styles.send} onClick={sendMessage} aria-label="Enviar mensaje a WhatsApp"><Send size={18} /></button>
      </div>
      {status === 'empty' && <p className={styles.feedback}>Escribe un mensaje antes de enviar.</p>}
      {status === 'sent' && <p className={styles.feedback}>Abrimos WhatsApp con tu mensaje preparado.</p>}
    </section>}
    <button type="button" className={styles.trigger} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="whatsapp-chat-panel">
      <span className={styles.triggerIcon}><MessageCircle size={22} fill="currentColor" /><Phone size={9} /></span>
      <span><b>¿Necesitas ayuda?</b><small><i />Estamos en línea</small></span>
    </button>
  </aside>;
}
