import Papa from 'papaparse';
import { csvRowSchema } from '../schemas/invite.schema';
import type { CsvImportRow, ParsedCsvRow, CsvValidationResult } from '../typings/team.types';

/**
 * Maximum number of rows allowed in a CSV import
 */
export const MAX_CSV_ROWS = 100;

/**
 * Expected CSV headers
 */
export const CSV_HEADERS = ['email', 'role', 'first_name', 'last_name'];

/**
 * Parse and validate a CSV file for team member imports
 */
export async function parseCsvFile(file: File): Promise<CsvValidationResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize headers to snake_case
        return header.toLowerCase().trim().replace(/\s+/g, '_');
      },
      complete: async (results) => {
        try {
          const validationResult = await validateCsvRows(results.data);
          resolve(validationResult);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Validate parsed CSV rows against the schema
 */
async function validateCsvRows(
  rows: Record<string, string>[]
): Promise<CsvValidationResult> {
  if (rows.length === 0) {
    return {
      isValid: false,
      rows: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    };
  }

  if (rows.length > MAX_CSV_ROWS) {
    const truncatedRows = rows.slice(0, MAX_CSV_ROWS);
    const parsedRows = await Promise.all(
      truncatedRows.map((row, index) => validateSingleRow(row, index))
    );

    // Add an error for the truncation
    parsedRows.push({
      email: '',
      role: '',
      rowIndex: MAX_CSV_ROWS,
      isValid: false,
      errors: [`CSV exceeds maximum of ${MAX_CSV_ROWS} rows. Only first ${MAX_CSV_ROWS} rows will be processed.`],
    });

    const validRowCount = parsedRows.filter((r) => r.isValid).length;
    return {
      isValid: validRowCount > 0,
      rows: parsedRows,
      totalRows: rows.length,
      validRows: validRowCount,
      invalidRows: parsedRows.length - validRowCount,
    };
  }

  const parsedRows = await Promise.all(
    rows.map((row, index) => validateSingleRow(row, index))
  );

  const validRowCount = parsedRows.filter((r) => r.isValid).length;
  const invalidRowCount = parsedRows.filter((r) => !r.isValid).length;

  return {
    isValid: validRowCount > 0 && invalidRowCount === 0,
    rows: parsedRows,
    totalRows: rows.length,
    validRows: validRowCount,
    invalidRows: invalidRowCount,
  };
}

/**
 * Validate a single CSV row
 */
async function validateSingleRow(
  row: Record<string, string>,
  rowIndex: number
): Promise<ParsedCsvRow> {
  const normalizedRow: CsvImportRow = {
    email: row.email?.trim() || '',
    role: row.role?.trim().toLowerCase() || '',
    firstName: row.first_name?.trim() || undefined,
    lastName: row.last_name?.trim() || undefined,
  };

  try {
    await csvRowSchema.validate(normalizedRow, { abortEarly: false });
    return {
      ...normalizedRow,
      rowIndex: rowIndex,
      isValid: true,
      errors: [],
    };
  } catch (error) {
    if (error instanceof Error && 'inner' in error) {
      const yupError = error as { inner: Array<{ message: string }> };
      return {
        ...normalizedRow,
        rowIndex: rowIndex,
        isValid: false,
        errors: yupError.inner.map((e) => e.message),
      };
    }
    return {
      ...normalizedRow,
      rowIndex: rowIndex,
      isValid: false,
      errors: ['Validation failed'],
    };
  }
}

/**
 * Generate a CSV template for download
 */
export function generateCsvTemplate(): string {
  const headers = CSV_HEADERS.join(',');
  const exampleRows = [
    'john@example.com,member,John,Doe',
    'jane@example.com,admin,Jane,Smith',
  ];
  return [headers, ...exampleRows].join('\n');
}

/**
 * Download the CSV template
 */
export function downloadCsvTemplate(): void {
  const csv = generateCsvTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'team-invite-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert parsed rows to API payload format
 */
export function convertRowsToPayload(rows: ParsedCsvRow[]): CsvImportRow[] {
  return rows
    .filter((row) => row.isValid)
    .map(({ email, role, firstName, lastName }) => ({
      email,
      role,
      firstName,
      lastName,
    }));
}
