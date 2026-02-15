/**
 * Format date to localized string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Format date to short string (DD/MM/YYYY)
 */
export function formatShortDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date to time string (HH:MM)
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format date to date and time string
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatShortDate(dateObj)} às ${formatTime(dateObj)}`;
}

/**
 * Format currency to BRL
 */
export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('pt-BR').format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
  } else {
    return formatShortDate(dateObj);
  }
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter of string
 */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format rating stars
 */
export function formatRatingStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);
  
  return (
    '★'.repeat(fullStars) +
    (hasHalfStar ? '½' : '') +
    '☆'.repeat(emptyStars)
  );
}
