/**
 * Simple Mustache-style template renderer
 * Handles basic variable replacement and conditional sections
 */

interface TemplateData {
  [key: string]: any;
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Renders a Mustache-style template with provided data
 * Supports:
 * - Simple variables: {{variable}} (HTML-escaped for security)
 * - Unescaped variables: {{{variable}}} (raw HTML output - use with caution)
 * - Conditional sections: {{#condition}}...{{/condition}}
 * - Inverted sections: {{^condition}}...{{/condition}}
 * - Array iteration: {{#array}}{{.}}{{/array}}
 */
export function renderTemplate(template: string, data: TemplateData): string {
  let result = template;

  // Handle conditional and inverted sections first
  result = processSections(result, data);

  // Replace simple variables
  result = replaceVariables(result, data);

  return result;
}

/**
 * Process conditional sections ({{#var}}...{{/var}}) and inverted sections ({{^var}}...{{/var}})
 * Handles nested sections by processing innermost first
 */
function processSections(template: string, data: TemplateData): string {
  let result = template;
  let hasChanges = true;
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops

  // Process sections iteratively until no more sections remain
  while (hasChanges && iterations < maxIterations) {
    hasChanges = false;
    iterations++;

    // Find the innermost section (one that doesn't contain another section)
    const sectionRegex = /\{\{([#^])(\w+)\}\}([\s\S]*?)\{\{\/\2\}\}/g;
    let match;
    let innermostMatch: RegExpMatchArray | null = null;

    // Find all matches and identify the innermost one
    const allMatches: Array<{ match: RegExpMatchArray; depth: number }> = [];
    while ((match = sectionRegex.exec(result)) !== null) {
      const [, , , content] = match;
      // Count how many section tags are in the content (depth)
      const depth = (content.match(/\{\{[#^]/g) || []).length;
      allMatches.push({ match, depth });
    }

    // Find the match with the lowest depth (innermost)
    if (allMatches.length > 0) {
      innermostMatch = allMatches.reduce((prev, curr) => (curr.depth < prev.depth ? curr : prev)).match;
    }

    if (innermostMatch) {
      const [fullMatch, type, varName, content] = innermostMatch;
      const value = getNestedValue(data, varName);

      let replacement = '';

      if (type === '#') {
        // Positive section: render if truthy
        if (isTruthy(value)) {
          if (Array.isArray(value)) {
            // Array iteration: render content for each item
            replacement = value
              .map((item) => {
                if (typeof item === 'object' && item !== null) {
                  // If item is an object, merge it with data for nested rendering
                  return renderTemplate(content, { ...data, ...item });
                }
                // If item is a primitive, use it as {{.}}
                return renderTemplate(content, { ...data, '.': item });
              })
              .join('');
          } else if (typeof value === 'object' && value !== null) {
            // Object context: merge with data
            replacement = renderTemplate(content, { ...data, ...value });
          } else {
            // Truthy value: render content once
            replacement = renderTemplate(content, data);
          }
        }
      } else {
        // Inverted section ({{^var}}): render if falsy
        if (!isTruthy(value)) {
          replacement = renderTemplate(content, data);
        }
      }

      result = result.replace(fullMatch, replacement);
      hasChanges = true;
    }
  }

  return result;
}

/**
 * Replace simple variables {{var}} with their values (HTML-escaped)
 * and {{{var}}} with unescaped values (raw HTML)
 */
function replaceVariables(template: string, data: TemplateData): string {
  let result = template;

  // First, handle unescaped triple-brace variables {{{var}}}
  // Match {{{var}}} or {{{var.property}}} or {{{.}}} (dot variable for array iteration)
  const unescapedVarRegex = /\{\{\{(\.|\w+(?:\.\w+)*)\}\}\}/g;
  const unescapedReplacements = new Map<string, string>();

  let match;
  while ((match = unescapedVarRegex.exec(template)) !== null) {
    const [fullMatch, varPath] = match;
    if (!unescapedReplacements.has(fullMatch)) {
      const value = getNestedValue(data, varPath);
      // No HTML escaping for triple-brace syntax
      const replacement = safeStringify(value, varPath, false);
      unescapedReplacements.set(fullMatch, replacement);
    }
  }

  // Replace unescaped variables first (before escaped ones, since {{{ contains {{)
  unescapedReplacements.forEach((replacement, variable) => {
    const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedVariable, 'g');
    result = result.replace(regex, replacement);
  });

  // Then handle escaped double-brace variables {{var}}
  // Match {{var}} or {{var.property}} or {{.}} (dot variable for array iteration)
  const varRegex = /\{\{(\.|\w+(?:\.\w+)*)\}\}/g;
  const replacements = new Map<string, string>();

  // First pass: collect all unique variables and their replacements
  while ((match = varRegex.exec(result)) !== null) {
    const [fullMatch, varPath] = match;
    if (!replacements.has(fullMatch)) {
      const value = getNestedValue(data, varPath);
      // HTML escape by default for double-brace syntax
      const replacement = safeStringify(value, varPath, true);
      replacements.set(fullMatch, replacement);
    }
  }

  // Second pass: replace all occurrences of each variable
  replacements.forEach((replacement, variable) => {
    // Escape special regex characters in the variable
    const escapedVariable = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedVariable, 'g');
    result = result.replace(regex, replacement);
  });

  return result;
}

/**
 * Get nested value from object using dot notation (e.g., "user.name")
 * Special case: "." returns obj['.'] for array iteration context
 */
function getNestedValue(obj: any, path: string): any {
  // Handle dot variable ({{.}}) used for array iteration
  if (path === '.') {
    return obj && typeof obj === 'object' ? obj['.'] : undefined;
  }
  
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj);
}

/**
 * Check if value is truthy (for conditionals)
 */
function isTruthy(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

/**
 * Safely convert value to string for template rendering
 * Handles objects and arrays gracefully instead of returning [object Object]
 *
 * @param value - The value to stringify
 * @param varPath - The variable path (for logging)
 * @param escapeOutput - Whether to HTML-escape the output (default: true for XSS prevention)
 *
 * Note: Backend transformer normalizes to camelCase, so we only check camelCase keys here.
 */
function safeStringify(value: any, varPath: string, escapeOutput: boolean = true): string {
  // Helper to optionally escape the final string result
  const maybeEscape = (str: string): string => (escapeOutput ? escapeHtml(str) : str);

  // Null/undefined -> empty string
  if (value === undefined || value === null) {
    return '';
  }

  // Primitives -> direct string conversion (escaped)
  if (typeof value !== 'object') {
    return maybeEscape(String(value));
  }

  // Date objects -> formatted string (escaped)
  if (value instanceof Date) {
    return maybeEscape(
      value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }

  // Arrays of primitives -> join with comma (each item escaped)
  if (Array.isArray(value)) {
    const primitives = value.filter((v) => typeof v !== 'object' || v === null);
    if (primitives.length === value.length) {
      return value.map((v) => maybeEscape(String(v))).join(', ');
    }
    // Array of objects shouldn't be rendered as simple variable
    console.warn(
      `[template-renderer] Variable "${varPath}" is an array of objects - use section syntax {{#${varPath}}}...{{/${varPath}}}`
    );
    return maybeEscape(`[${value.length} items]`);
  }

  // Objects -> try to format intelligently (camelCase only)

  // Check for fullName first (common pre-computed field)
  if (value.fullName !== undefined) return maybeEscape(String(value.fullName));

  // Check for address-like objects (but not email addresses)
  const hasAddressField = 'street' in value || 'streetAddress' in value || 'city' in value;
  const isEmailObject = typeof value.address === 'string' && value.address.includes('@');

  if (hasAddressField && !isEmailObject) {
    const parts = [
      value.street || value.streetAddress,
      value.city,
      value.state,
      value.zip || value.zipCode || value.postalCode,
    ].filter(Boolean);
    return parts.map((p) => maybeEscape(String(p))).join(', ');
  }

  // Check for email-like objects
  if (isEmailObject) {
    return maybeEscape(String(value.address));
  }

  // Check for name-like objects (camelCase only)
  if (('first' in value || 'firstName' in value) && ('last' in value || 'lastName' in value)) {
    const first = value.first || value.firstName || '';
    const last = value.last || value.lastName || '';
    return maybeEscape(`${first} ${last}`.trim());
  }

  // Try common value properties
  if (value.value !== undefined) return maybeEscape(String(value.value));
  if (value.name !== undefined) return maybeEscape(String(value.name));
  if (value.text !== undefined) return maybeEscape(String(value.text));

  // Check for contract/transaction reference objects (has originalContractDate or propertyAddress)
  if ('originalContractDate' in value || ('propertyAddress' in value && 'originalPurchasePrice' in value)) {
    const parts: string[] = [];

    // Format the date if present
    if (value.originalContractDate) {
      const dateStr = String(value.originalContractDate);
      let formattedDate = dateStr;
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
      } catch {
        // Use original string if date parsing fails
      }
      parts.push(`Purchase Agreement dated ${formattedDate}`);
    } else {
      parts.push('Original Purchase Agreement');
    }

    // Add property name or address if present
    if (value.propertyName && String(value.propertyName).trim()) {
      parts.push(`for ${value.propertyName}`);
    } else if (value.propertyAddress && String(value.propertyAddress).trim()) {
      parts.push(`for ${value.propertyAddress}`);
    }

    // Add original purchase price if present
    if (value.originalPurchasePrice) {
      const price = Number(value.originalPurchasePrice);
      if (!isNaN(price)) {
        const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price);
        parts.push(`at ${formattedPrice}`);
      }
    }

    return maybeEscape(parts.join(' '));
  }

  // Fallback: JSON stringify (better than [object Object])
  console.warn(`[template-renderer] Variable "${varPath}" is an object - serializing as JSON`);
  try {
    return maybeEscape(JSON.stringify(value));
  } catch {
    return '[Complex Object]';
  }
}

