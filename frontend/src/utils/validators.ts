/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('A senha deve ter no mínimo 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate name (min 2 chars, max 100 chars)
 */
export function isValidName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

/**
 * Validate phone number (Brazilian format)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate price (positive number, max 2 decimal places)
 */
export function isValidPrice(price: number): boolean {
  return price > 0 && price * 100 % 1 === 0;
}

/**
 * Validate product name (min 3 chars, max 200 chars)
 */
export function isValidProductName(name: string): boolean {
  return name.length >= 3 && name.length <= 200;
}

/**
 * Validate product description (min 10 chars, max 2000 chars)
 */
export function isValidProductDescription(description: string): boolean {
  return description.length >= 10 && description.length <= 2000;
}

/**
 * Validate rating (1-5)
 */
export function isValidRating(rating: number): boolean {
  return rating >= 1 && rating <= 5 && rating * 1 === rating;
}

/**
 * Validate purchase notes (max 500 chars)
 */
export function isValidPurchaseNotes(notes: string): boolean {
  return notes.length <= 500;
}

/**
 * Validate testimonial content (min 20 chars, max 500 chars)
 */
export function isValidTestimonialContent(content: string): boolean {
  return content.length >= 20 && content.length <= 500;
}

/**
 * Validate notification title (min 2 chars, max 100 chars)
 */
export function isValidNotificationTitle(title: string): boolean {
  return title.length >= 2 && title.length <= 100;
}

/**
 * Validate notification message (min 5 chars, max 500 chars)
 */
export function isValidNotificationMessage(message: string): boolean {
  return message.length >= 5 && message.length <= 500;
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
}

/**
 * Validate minimum length
 */
export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Validate maximum length
 */
export function hasMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Validate exact length
 */
export function hasExactLength(value: string, length: number): boolean {
  return value.length === length;
}

/**
 * Validate date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Validate date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Validate date range
 */
export function isValidDateRange(startDate: string | Date, endDate: string | Date): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return start < end;
}

/**
 * Validate category
 */
export function isValidCategory(category: string): boolean {
  const validCategories = [
    'Brinquedos',
    'Eletrônicos',
    'Móveis',
    'Roupas',
    'Livros',
    'Esportes',
    'Outros',
  ];
  return validCategories.includes(category);
}

/**
 * Validate product condition
 */
export function isValidProductCondition(condition: string): boolean {
  const validConditions = ['new', 'like-new', 'good', 'fair', 'poor'];
  return validConditions.includes(condition);
}

/**
 * Validate payment method
 */
export function isValidPaymentMethod(method: string): boolean {
  const validMethods = ['cash', 'card', 'pix', 'other'];
  return validMethods.includes(method);
}
