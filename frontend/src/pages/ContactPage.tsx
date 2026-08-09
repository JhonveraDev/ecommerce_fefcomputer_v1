import { FormEvent, useState } from 'react';
import { CheckCircle2, Headphones, Send } from 'lucide-react';
import { StoreBanner } from '../components/StoreBanner';
import contactSupport from '../assets/contact/contact-support.png';
import styles from './ContactPage.module.css';

type FormValues = { name: string; email: string; phone: string; subject: string; message: string; accepted: boolean };
type Errors = Partial<Record<keyof FormValues, string>>;
const initialValues: FormValues = { name: '', email: '', phone: '', subject: '', message: '', accepted: false };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d][+()\d\s.-]{6,}$/;

function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Ingresa tu nombre completo.';
  if (!values.email.trim()) errors.email = 'Ingresa tu correo electrónico.';
  else if (!emailPattern.test(values.email)) errors.email = 'Ingresa un correo electrónico válido.';
  if (values.phone.trim() && !phonePattern.test(values.phone.trim())) errors.phone = 'Ingresa un teléfono válido.';
  if (!values.subject.trim()) errors.subject = 'Ingresa el asunto de tu mensaje.';
  if (!values.message.trim()) errors.message = 'Escribe tu mensaje.';
  else if (values.message.trim().length < 10) errors.message = 'El mensaje debe tener al menos 10 caracteres.';
  if (!values.accepted) errors.accepted = 'Debes aceptar el tratamiento de datos personales.';
  return errors;
}

export function ContactPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const updateValue = (field: keyof FormValues, value: string | boolean) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors(validate(next));
    if (status !== 'idle') setStatus('idle');
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStatus('sending');
    // No hay un servicio de correo configurado aún. Esta llamada queda aislada para conectarlo después.
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setStatus('error');
  };
  const fieldProps = (field: keyof FormValues) => ({
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    'aria-invalid': Boolean(errors[field]),
    className: errors[field] ? styles.invalid : undefined,
  });

  return <main className={styles.page}>
    <StoreBanner title="Contacto" items={['Inicio', 'Contacto']} />
    <section className={styles.content} aria-labelledby="contact-heading">
      <header className={styles.intro}>
        <span className={styles.eyebrow}><Headphones size={17} />Estamos aquí para ayudarte</span>
        <h2 id="contact-heading">Cuéntanos cómo podemos ayudarte</h2>
        <p>Envíanos un mensaje y nuestro equipo se pondrá en contacto contigo lo antes posible.</p>
      </header>
      <div className={styles.layout}>
        <aside className={styles.visual}>
          <img src={contactSupport} alt="Especialista de soporte atendiendo una consulta" />
          <div className={styles.visualCaption}><Headphones size={21} /><span><b>Atención cercana</b><small>Te orientamos en cada paso</small></span></div>
        </aside>
        <section className={styles.formCard} aria-label="Formulario de contacto">
          <h3>Envíanos tu mensaje</h3><p className={styles.formLead}>Completa tus datos y te responderemos pronto.</p>
          <form noValidate onSubmit={submit}>
            <div className={styles.fields}>
              <div className={styles.field}><label htmlFor="name">Nombre completo</label><input {...fieldProps('name')} id="name" name="name" type="text" autoComplete="name" value={values.name} onChange={(event) => updateValue('name', event.target.value)} placeholder="Escribe tu nombre" />{errors.name && <span id="name-error" className={styles.error}>{errors.name}</span>}</div>
              <div className={styles.field}><label htmlFor="email">Correo electrónico</label><input {...fieldProps('email')} id="email" name="email" type="email" autoComplete="email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} placeholder="nombre@ejemplo.com" />{errors.email && <span id="email-error" className={styles.error}>{errors.email}</span>}</div>
              <div className={styles.field}><label htmlFor="phone">Teléfono <small>(opcional)</small></label><input {...fieldProps('phone')} id="phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} placeholder="+57 300 000 0000" />{errors.phone && <span id="phone-error" className={styles.error}>{errors.phone}</span>}</div>
              <div className={styles.field}><label htmlFor="subject">Asunto</label><input {...fieldProps('subject')} id="subject" name="subject" type="text" value={values.subject} onChange={(event) => updateValue('subject', event.target.value)} placeholder="¿En qué podemos ayudarte?" />{errors.subject && <span id="subject-error" className={styles.error}>{errors.subject}</span>}</div>
              <div className={`${styles.field} ${styles.messageField}`}><label htmlFor="message">Mensaje</label><textarea {...fieldProps('message')} id="message" name="message" value={values.message} onChange={(event) => updateValue('message', event.target.value)} placeholder="Escribe los detalles de tu consulta" />{errors.message && <span id="message-error" className={styles.error}>{errors.message}</span>}</div>
            </div>
            <div className={styles.consent}><input {...fieldProps('accepted')} id="accepted" name="accepted" type="checkbox" checked={values.accepted} onChange={(event) => updateValue('accepted', event.target.checked)} /><label htmlFor="accepted">He leído y acepto los términos y condiciones de <span>tratamiento de datos personales</span>.</label>{errors.accepted && <span id="accepted-error" className={styles.error}>{errors.accepted}</span>}</div>
            {status === 'success' && <p className={styles.success} role="status"><CheckCircle2 size={20} />¡Mensaje enviado correctamente! Nos pondremos en contacto contigo lo antes posible.</p>}
            {status === 'error' && <p className={styles.submitError} role="alert">No fue posible enviar el mensaje. Inténtalo nuevamente.</p>}
            <button className={styles.submit} type="submit" disabled={status === 'sending'}><Send size={17} />{status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}</button>
          </form>
        </section>
      </div>
    </section>
  </main>;
}
