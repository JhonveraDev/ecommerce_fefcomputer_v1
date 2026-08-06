import type { NewsletterFormProps } from './types';
import styles from './NewsletterOffer.module.css';

export function NewsletterForm({ emailPlaceholder, submitLabel, emailIcon, submitIcon, onFormSubmit }: NewsletterFormProps) {
  return (
    <form className={styles.form} onSubmit={onFormSubmit}>
      <label className="srOnly" htmlFor="newsletter-email">Correo electrónico</label>
      <span className={styles.emailIcon} aria-hidden="true">{emailIcon}</span>
      <input id="newsletter-email" name="email" type="email" placeholder={emailPlaceholder} required />
      <button type="submit">{submitLabel}{submitIcon}</button>
    </form>
  );
}
