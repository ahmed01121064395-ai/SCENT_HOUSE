export const WHATSAPP_PHONE = '201095363169';

export const buildWhatsAppLink = (text: string): string => {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
};
