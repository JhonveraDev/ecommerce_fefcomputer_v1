import type { LucideIcon } from 'lucide-react';

export interface FooterLink { label: string; href: string; }
export interface FooterColumn { title: string; links: FooterLink[]; }
export interface FooterContact { icon: LucideIcon; label: string; value: string; href?: string; }
export interface FooterPhone { label: string; detail: string; href: string; }
export interface FooterSocial { label: string; href: string; icon: LucideIcon; }
export interface FooterProps { description: string; contacts: FooterContact[]; columns: FooterColumn[]; downloadLabel: string; paymentLabel: string; phones: FooterPhone[]; socials: FooterSocial[]; copyright: string; }
