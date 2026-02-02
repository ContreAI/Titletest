type TemplateData = Record<string, unknown>;

/**
 * Transforms the JSON data from the database to match the template's expected structure.
 * Adds helper flags for conditional rendering of sections.
 * Note: Data is expected in camelCase format from the API.
 * Note: Document-specific transformations are handled by the backend transformer.
 */
export function transformTemplateData(data: TemplateData): TemplateData {
  let transformed: TemplateData = { ...data };

  // Normalize keys with underscore+number patterns (e.g., buyerName_1 → buyerName1)
  transformed = normalizeNumberSuffixKeys(transformed);

  // Add helper flags to check if arrays exist and have items (camelCase)
  transformed.hasCriticalIssues =
    Array.isArray(data.aiCriticalIssues) && (data.aiCriticalIssues as unknown[]).length > 0;
  transformed.hasKeyNotes =
    Array.isArray(data.aiKeyNotes) && (data.aiKeyNotes as unknown[]).length > 0;

  // Convert "paidBy" string fields to boolean flags for template conditionals
  transformed = convertPaidByFieldsToBooleans(transformed);

  // Add existence boolean helpers
  transformed = addExistenceBooleans(transformed);

  return transformed;
}

/**
 * Normalize keys with underscore+number patterns
 * e.g., buyerName_1 → buyerName1
 */
function normalizeNumberSuffixKeys(data: TemplateData): TemplateData {
  if (!data || typeof data !== 'object') return data;

  const result: TemplateData = {};
  for (const [key, value] of Object.entries(data)) {
    // Replace underscore followed by number with just the number
    const normalizedKey = key.replace(/_(\d)/g, '$1');
    result[normalizedKey] = value;
  }
  return result;
}

/**
 * Convert "paidBy" string fields to boolean flags for template conditionals
 * e.g., titleStandardPaidBy: "seller" → titleStandardPaidBySeller: true, titleStandardPaidByBuyer: false
 */
function convertPaidByFieldsToBooleans(data: TemplateData): TemplateData {
  const result: TemplateData = { ...data };

  const paidByFields = [
    'titleStandardPaidBy',
    'titleExtendedPaidBy',
    'closingEscrowFeePaidBy',
    'homeWarrantyPaidBy',
    'hoaTransferFeePaidBy',
  ];

  for (const field of paidByFields) {
    const value = result[field];
    // Only process if the boolean flags don't already exist
    if (value !== undefined && value !== null && result[`${field}Buyer`] === undefined) {
      const normalizedValue = String(value).toLowerCase();

      // Generate boolean flags for buyer, seller, and split
      result[`${field}Buyer`] = normalizedValue === 'buyer';
      result[`${field}Seller`] = normalizedValue === 'seller';
      result[`${field}Split`] = normalizedValue === 'split' || normalizedValue === 'both';
    }
  }

  return result;
}

/**
 * Add existence boolean helpers for template conditionals
 */
function addExistenceBooleans(data: TemplateData): TemplateData {
  const result: TemplateData = { ...data };

  // homeWarrantyExists: true if homeWarrantyPaidBy is not "na" or null
  if (result.homeWarrantyExists === undefined && result.homeWarrantyPaidBy !== undefined) {
    const paidBy = String(result.homeWarrantyPaidBy).toLowerCase();
    result.homeWarrantyExists =
      paidBy !== 'na' && paidBy !== 'null' && paidBy !== '' && result.homeWarrantyPaidBy !== null;
  }

  // hoaExists: check if explicitly set, or derive from hoaTransferFeePaidBy
  if (result.hoaExists === undefined && result.hoaTransferFeePaidBy !== undefined) {
    const paidBy = String(result.hoaTransferFeePaidBy).toLowerCase();
    result.hoaExists =
      paidBy !== 'na' && paidBy !== 'null' && paidBy !== '' && result.hoaTransferFeePaidBy !== null;
  }

  return result;
}
