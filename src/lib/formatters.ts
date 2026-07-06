export const formatPriceVal = (price: number): string => {
  return price.toLocaleString('en-US');
};

export const formatPriceFull = (price: number): string => {
  return `${formatPriceVal(price)} جنيه`;
};

export const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'numeric' });
};

export const formatWeekdayShortDate = (date: Date): string => {
  return date.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric' });
};

export const formatLongDate = (date: Date): string => {
  return date.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
