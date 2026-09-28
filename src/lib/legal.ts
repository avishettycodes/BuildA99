export const LEGAL_LINKS = [
  ['how-to-play', 'How to Play'],
  ['privacy-policy', 'Privacy Policy'],
  ['cookie-policy', 'Cookie Policy'],
  ['terms-of-use', 'Terms of Use'],
  ['contact', 'Contact Us'],
] as const;
export const legalOwner = import.meta.env.VITE_LEGAL_OWNER?.trim() || 'Andrew Yee';
export const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'acyee25@gmail.com';
export const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
export const legalReady = Boolean(legalOwner && validEmail);

