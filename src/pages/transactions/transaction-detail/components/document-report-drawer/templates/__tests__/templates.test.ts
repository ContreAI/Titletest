import { describe, it, expect, vi } from 'vitest';

// Mock the HTML imports
vi.mock('../purchase-contract-template.html?raw', () => ({ default: '<div>purchase-contract</div>' }));
vi.mock('../addendum-template.html?raw', () => ({ default: '<div>addendum</div>' }));
vi.mock('../counter-offer-template.html?raw', () => ({ default: '<div>counter-offer</div>' }));
vi.mock('../seller-disclosure-template.html?raw', () => ({ default: '<div>seller-disclosure</div>' }));
vi.mock('../contingency-removal-template.html?raw', () => ({ default: '<div>contingency-removal</div>' }));
vi.mock('../disclosure-template.html?raw', () => ({ default: '<div>disclosure</div>' }));
vi.mock('../title-report-template.html?raw', () => ({ default: '<div>title-report</div>' }));
vi.mock('../inspection-report-template.html?raw', () => ({ default: '<div>inspection-report</div>' }));
vi.mock('../termination-template.html?raw', () => ({ default: '<div>termination</div>' }));
vi.mock('../loan-financing-template.html?raw', () => ({ default: '<div>loan-financing</div>' }));
vi.mock('../representation-template.html?raw', () => ({ default: '<div>representation</div>' }));
vi.mock('../general-template.html?raw', () => ({ default: '<div>general</div>' }));

import {
  DOCUMENT_TEMPLATES,
  getTemplateForDocumentType,
  hasTemplate,
  getDocumentTypesWithTemplates,
} from '../index';

describe('Template Registry', () => {
  describe('DOCUMENT_TEMPLATES', () => {
    it('should have exactly 22 document type mappings', () => {
      expect(Object.keys(DOCUMENT_TEMPLATES)).toHaveLength(22);
    });

    it('should include all core transaction documents', () => {
      const coreDocuments = [
        'Purchase-and-Sale-Agreements',
        'Addenda-(Addendums-and-Amendments)',
        'Counter-Offer',
        'Seller-Property-Disclosure',
        'Contingency-Removal',
      ];

      coreDocuments.forEach((docType) => {
        expect(DOCUMENT_TEMPLATES).toHaveProperty(docType);
      });
    });

    it('should include all disclosure documents', () => {
      const disclosureDocuments = [
        'Disclosures',
        'HOA-Documents',
        'CCR-Rules-Bylaws',
      ];

      disclosureDocuments.forEach((docType) => {
        expect(DOCUMENT_TEMPLATES).toHaveProperty(docType);
      });
    });

    it('should include all title and ownership documents', () => {
      const titleDocuments = [
        'Title-Report-Commitment',
        'Deeds-Ownership-Transfer-Docs',
      ];

      titleDocuments.forEach((docType) => {
        expect(DOCUMENT_TEMPLATES).toHaveProperty(docType);
      });
    });

    it('should include all inspection and due diligence documents', () => {
      const inspectionDocuments = [
        'Inspection-Reports',
        'Environmental-Reports',
        'Commercial-Due-Diligence',
      ];

      inspectionDocuments.forEach((docType) => {
        expect(DOCUMENT_TEMPLATES).toHaveProperty(docType);
      });
    });

    it('should include termination documents', () => {
      expect(DOCUMENT_TEMPLATES).toHaveProperty('Termination-Cancellation');
    });

    it('should include financing documents', () => {
      const financingDocuments = ['Loan-and-Financing-Docs', 'Rent-Roll-and-Financials'];

      financingDocuments.forEach((docType) => {
        expect(DOCUMENT_TEMPLATES).toHaveProperty(docType);
      });
    });

    it('should include representation documents', () => {
      expect(DOCUMENT_TEMPLATES).toHaveProperty('Representation-Agreements');
    });

    it('should include commercial documents', () => {
      const commercialDocuments = ['Commercial-Purchase-and-Sale', 'Commercial-Lease'];

      commercialDocuments.forEach((docType) => {
        expect(DOCUMENT_TEMPLATES).toHaveProperty(docType);
      });
    });

    it('should include general/miscellaneous documents', () => {
      const generalDocuments = ['New-Construction-Docs', 'Notices', 'General-Miscellaneous'];

      generalDocuments.forEach((docType) => {
        expect(DOCUMENT_TEMPLATES).toHaveProperty(docType);
      });
    });

    it('should use disclosure template for all disclosure document types', () => {
      const disclosureTypes = [
        'Disclosures',
        'HOA-Documents',
        'CCR-Rules-Bylaws',
      ];

      const templateValues = disclosureTypes.map((type) => DOCUMENT_TEMPLATES[type]);
      const uniqueTemplates = new Set(templateValues);

      // All disclosure types should use the same template
      expect(uniqueTemplates.size).toBe(1);
    });

    it('should use inspection template for all inspection document types', () => {
      const inspectionTypes = ['Inspection-Reports', 'Environmental-Reports', 'Commercial-Due-Diligence'];

      const templateValues = inspectionTypes.map((type) => DOCUMENT_TEMPLATES[type]);
      const uniqueTemplates = new Set(templateValues);

      // All inspection types should use the same template
      expect(uniqueTemplates.size).toBe(1);
    });
  });

  describe('getTemplateForDocumentType', () => {
    it('should return the correct template for a known document type', () => {
      const template = getTemplateForDocumentType('Purchase-and-Sale-Agreements');
      expect(template).toBe('<div>purchase-contract</div>');
    });

    it('should return null for an unknown document type', () => {
      const template = getTemplateForDocumentType('Unknown Document Type');
      expect(template).toBeNull();
    });

    it('should return null for empty string', () => {
      const template = getTemplateForDocumentType('');
      expect(template).toBeNull();
    });

    it('should be case-sensitive', () => {
      const template = getTemplateForDocumentType('purchase-and-sale-agreements');
      expect(template).toBeNull();
    });

    it('should return disclosure template for disclosure types', () => {
      const template = getTemplateForDocumentType('Disclosures');
      expect(template).toBe('<div>disclosure</div>');
    });

    it('should return title report template for title documents', () => {
      const template = getTemplateForDocumentType('Title-Report-Commitment');
      expect(template).toBe('<div>title-report</div>');
    });

    it('should return general template for miscellaneous documents', () => {
      const template = getTemplateForDocumentType('General-Miscellaneous');
      expect(template).toBe('<div>general</div>');
    });
  });

  describe('hasTemplate', () => {
    it('should return true for a known document type', () => {
      expect(hasTemplate('Purchase-and-Sale-Agreements')).toBe(true);
    });

    it('should return false for an unknown document type', () => {
      expect(hasTemplate('Unknown Document Type')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(hasTemplate('')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(hasTemplate('PURCHASE-AND-SALE-AGREEMENTS')).toBe(false);
    });

    it('should return true for all 22 registered document types', () => {
      const allTypes = [
        'Purchase-and-Sale-Agreements',
        'Addenda-(Addendums-and-Amendments)',
        'Counter-Offer',
        'Seller-Property-Disclosure',
        'Contingency-Removal',
        'Disclosures',
        'HOA-Documents',
        'CCR-Rules-Bylaws',
        'Title-Report-Commitment',
        'Deeds-Ownership-Transfer-Docs',
        'Inspection-Reports',
        'Environmental-Reports',
        'Commercial-Due-Diligence',
        'Termination-Cancellation',
        'Loan-and-Financing-Docs',
        'Rent-Roll-and-Financials',
        'Representation-Agreements',
        'Commercial-Purchase-and-Sale',
        'Commercial-Lease',
        'New-Construction-Docs',
        'Notices',
        'General-Miscellaneous',
      ];

      allTypes.forEach((type) => {
        expect(hasTemplate(type)).toBe(true);
      });
    });
  });

  describe('getDocumentTypesWithTemplates', () => {
    it('should return an array of all document types', () => {
      const types = getDocumentTypesWithTemplates();
      expect(Array.isArray(types)).toBe(true);
      expect(types).toHaveLength(22);
    });

    it('should include Purchase-and-Sale-Agreements', () => {
      const types = getDocumentTypesWithTemplates();
      expect(types).toContain('Purchase-and-Sale-Agreements');
    });

    it('should include General-Miscellaneous', () => {
      const types = getDocumentTypesWithTemplates();
      expect(types).toContain('General-Miscellaneous');
    });

    it('should return strings only', () => {
      const types = getDocumentTypesWithTemplates();
      types.forEach((type) => {
        expect(typeof type).toBe('string');
      });
    });

    it('should not include duplicate types', () => {
      const types = getDocumentTypesWithTemplates();
      const uniqueTypes = new Set(types);
      expect(types.length).toBe(uniqueTypes.size);
    });
  });
});
