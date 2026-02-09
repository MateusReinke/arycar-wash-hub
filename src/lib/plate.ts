/**
 * Normalize a Brazilian license plate: uppercase, no hyphens, no spaces.
 */
export function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, '');
}

/**
 * Validate Brazilian plate formats:
 * - Mercosul: AAA0A00
 * - Antiga:   AAA0000
 */
export function isValidPlate(plate: string): boolean {
  const normalized = normalizePlate(plate);
  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  const antiga = /^[A-Z]{3}[0-9]{4}$/;
  return mercosul.test(normalized) || antiga.test(normalized);
}

/**
 * Format plate for display: ABC1D23 or ABC1234
 */
export function formatPlate(plate: string): string {
  return normalizePlate(plate);
}
