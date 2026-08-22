// HustleSpark Input Sanitization Utilities

export function sanitizeInput(input, maxLength = 500) {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeListingField(input) {
  return sanitizeInput(input, 1000);
}

export function sanitizePrice(input) {
  const num = parseFloat(input);
  if (isNaN(num) || num < 0) return 0;
  if (num > 100000) return 100000;
  return Math.round(num * 100) / 100;
}

export function sanitizeEmail(input) {
  const trimmed = input.trim().toLowerCase().slice(0, 254);
  return /^[^s@]+@[^s@]+.[^s@]+$/.test(trimmed) ? trimmed : '';
}
