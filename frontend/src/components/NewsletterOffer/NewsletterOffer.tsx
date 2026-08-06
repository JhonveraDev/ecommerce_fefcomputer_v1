import { Mail, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { NewsletterForm } from './NewsletterForm';
import type { NewsletterOfferProps } from './types';
import styles from './NewsletterOffer.module.css';

export function NewsletterOffer({ title, description, image, imageAlt, emailPlaceholder, submitLabel, benefits, onSubmit, className = '', emailIcon = <Mail size={20} />, submitIcon = <Send size={15} /> }: NewsletterOfferProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    if (typeof email === 'string') onSubmit?.(email);
  };

  return (
    <section className={`${styles.section} ${className}`} aria-labelledby="newsletter-offer-title">
      <div className={styles.banner}>
        <div className={styles.content}>
          <h2 id="newsletter-offer-title">{title}</h2>
          <p>{description}</p>
          <NewsletterForm emailPlaceholder={emailPlaceholder} submitLabel={submitLabel} emailIcon={emailIcon} submitIcon={submitIcon} onFormSubmit={handleSubmit} />
        </div>
        <img className={styles.deliveryImage} src={image} alt={imageAlt} />
      </div>
      <div className={styles.benefits}>
        {benefits.map((benefit) => (
          <article className={styles.benefit} key={benefit.id}>
            <span className={styles.benefitIcon} aria-hidden="true">{benefit.icon}</span>
            <div><h3>{benefit.title}</h3><p>{benefit.description}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
