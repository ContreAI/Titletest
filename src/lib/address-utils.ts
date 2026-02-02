/**
 * Address Utilities
 *
 * Shared utilities for PropertyAddress mapping and normalization.
 * Centralizes the repeated pattern of converting API address data to frontend format.
 */

import { PropertyAddress } from 'modules/transactions/typings/transactions.types';

/**
 * Default empty PropertyAddress structure
 */
export const DEFAULT_PROPERTY_ADDRESS: PropertyAddress = {
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'United States',
};

/**
 * API address data shape (from backend responses)
 * Uses optional fields since API responses may be partial
 */
export interface ApiPropertyAddress {
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
}

/**
 * Maps API property address data to frontend PropertyAddress format.
 * Handles null/undefined values with sensible defaults.
 *
 * @param apiAddress - Address data from API response (may have null/undefined fields)
 * @returns Normalized PropertyAddress with all required fields
 *
 * @example
 * const address = mapApiPropertyAddress(apiData.propertyAddress);
 * // { streetAddress: '123 Main St', city: 'Austin', state: 'TX', zipCode: '78701', country: 'United States' }
 */
export const mapApiPropertyAddress = (
  apiAddress: ApiPropertyAddress | null | undefined
): PropertyAddress => {
  if (!apiAddress) {
    return { ...DEFAULT_PROPERTY_ADDRESS };
  }

  return {
    streetAddress: apiAddress.streetAddress ?? '',
    city: apiAddress.city ?? '',
    state: apiAddress.state ?? '',
    zipCode: apiAddress.zipCode ?? '',
    country: apiAddress.country ?? 'United States',
  };
};

/**
 * Formats a PropertyAddress as a single-line string.
 *
 * @param address - PropertyAddress object
 * @param options - Formatting options
 * @returns Formatted address string
 *
 * @example
 * formatAddress(address); // "123 Main St, Austin, TX 78701"
 * formatAddress(address, { includeCountry: true }); // "123 Main St, Austin, TX 78701, United States"
 */
export const formatAddress = (
  address: PropertyAddress | null | undefined,
  options: { includeCountry?: boolean } = {}
): string => {
  if (!address) return '';

  const parts = [
    address.streetAddress,
    address.city,
    address.state && address.zipCode
      ? `${address.state} ${address.zipCode}`
      : address.state || address.zipCode,
  ].filter(Boolean);

  if (options.includeCountry && address.country) {
    parts.push(address.country);
  }

  return parts.join(', ');
};

/**
 * Checks if a PropertyAddress has any meaningful data.
 *
 * @param address - PropertyAddress object to check
 * @returns true if address has at least one non-empty field
 */
export const hasAddressData = (address: PropertyAddress | null | undefined): boolean => {
  if (!address) return false;

  return Boolean(
    address.streetAddress?.trim() ||
      address.city?.trim() ||
      address.state?.trim() ||
      address.zipCode?.trim()
  );
};
