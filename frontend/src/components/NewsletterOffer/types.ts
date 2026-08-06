import type { FormEvent, ReactNode } from 'react';

export interface NewsletterBenefit {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export interface NewsletterOfferProps {
  title: string;
  description: ReactNode;
  image: string;
  imageAlt: string;
  emailPlaceholder: string;
  submitLabel: string;
  benefits: NewsletterBenefit[];
  onSubmit?: (email: string) => void;
  className?: string;
  emailIcon?: ReactNode;
  submitIcon?: ReactNode;
}

export interface NewsletterFormProps {
  emailPlaceholder: string;
  submitLabel: string;
  onSubmit?: (email: string) => void;
  emailIcon?: ReactNode;
  submitIcon?: ReactNode;
  onFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
}
