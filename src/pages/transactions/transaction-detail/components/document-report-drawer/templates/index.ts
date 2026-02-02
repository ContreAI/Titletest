/**
 * Template Registry
 * Maps document types to their corresponding HTML templates.
 * Keys must match the hyphenated S3 folder format used by the backend
 * (e.g., 'Purchase-and-Sale-Agreements' not 'Purchase and Sale Agreements').
 */

import purchaseContractTemplate from './purchase-contract-template.html?raw';
import addendumTemplate from './addendum-template.html?raw';
import counterOfferTemplate from './counter-offer-template.html?raw';
import sellerDisclosureTemplate from './seller-disclosure-template.html?raw';
import contingencyRemovalTemplate from './contingency-removal-template.html?raw';
import disclosureTemplate from './disclosure-template.html?raw';
import titleReportTemplate from './title-report-template.html?raw';
import inspectionReportTemplate from './inspection-report-template.html?raw';
import terminationTemplate from './termination-template.html?raw';
import loanFinancingTemplate from './loan-financing-template.html?raw';
import representationTemplate from './representation-template.html?raw';
import generalTemplate from './general-template.html?raw';

/**
 * Template registry mapping document type names to their HTML templates.
 * Keys use the hyphenated S3 folder format that the backend sends.
 */
export const DOCUMENT_TEMPLATES: Record<string, string> = {
  // Core transaction documents
  'Purchase-and-Sale-Agreements': purchaseContractTemplate,
  'Addenda-(Addendums-and-Amendments)': addendumTemplate,
  'Counter-Offer': counterOfferTemplate,
  'Seller-Property-Disclosure': sellerDisclosureTemplate,
  'Contingency-Removal': contingencyRemovalTemplate,

  // Disclosure documents
  'Disclosures': disclosureTemplate,
  'HOA-Documents': disclosureTemplate,
  'CCR-Rules-Bylaws': disclosureTemplate,

  // Title and ownership documents
  'Title-Report-Commitment': titleReportTemplate,
  'Deeds-Ownership-Transfer-Docs': titleReportTemplate,

  // Inspection and due diligence
  'Inspection-Reports': inspectionReportTemplate,
  'Environmental-Reports': inspectionReportTemplate,
  'Commercial-Due-Diligence': inspectionReportTemplate,

  // Termination documents
  'Termination-Cancellation': terminationTemplate,

  // Financing documents
  'Loan-and-Financing-Docs': loanFinancingTemplate,
  'Rent-Roll-and-Financials': loanFinancingTemplate,

  // Representation and agency
  'Representation-Agreements': representationTemplate,

  // Commercial documents
  'Commercial-Purchase-and-Sale': purchaseContractTemplate,
  'Commercial-Lease': generalTemplate,

  // General/fallback
  'New-Construction-Docs': generalTemplate,
  'Notices': generalTemplate,
  'General-Miscellaneous': generalTemplate,
};

/**
 * Get the template for a given document type
 * @param documentType - The document type name
 * @returns The HTML template string or null if no template exists
 */
export const getTemplateForDocumentType = (documentType: string): string | null => {
  return DOCUMENT_TEMPLATES[documentType] || null;
};

/**
 * Check if a template exists for a given document type
 * @param documentType - The document type name
 * @returns True if a template exists, false otherwise
 */
export const hasTemplate = (documentType: string): boolean => {
  return documentType in DOCUMENT_TEMPLATES;
};

/**
 * Get all document types that have templates
 * @returns Array of document type names with templates
 */
export const getDocumentTypesWithTemplates = (): string[] => {
  return Object.keys(DOCUMENT_TEMPLATES);
};
