import { OCRExtractedData } from "@/types/admin";
import { Transaction, Party, TimelineEvent } from "@/types";

/**
 * OCR Processing Request
 */
export interface OCRProcessingRequest {
  file: File;
  documentType?: string;
}

/**
 * OCR Processing Result
 */
export interface OCRProcessingResult {
  success: boolean;
  data?: OCRExtractedData;
  error?: string;
  processingTimeMs?: number;
}

/**
 * OCR Service Interface
 * Can be implemented with AWS Textract, Google Document AI, Azure, etc.
 */
export interface IOCRService {
  processContract(request: OCRProcessingRequest): Promise<OCRProcessingResult>;
}

/**
 * Mock OCR Service for development
 * Simulates contract data extraction with realistic delays
 */
export class MockOCRService implements IOCRService {
  async processContract(request: OCRProcessingRequest): Promise<OCRProcessingResult> {
    const startTime = Date.now();

    // Simulate processing delay (1.5-3 seconds)
    await new Promise((resolve) =>
      setTimeout(resolve, 1500 + Math.random() * 1500)
    );

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        success: false,
        error: "Failed to process document. Please try again or enter data manually.",
        processingTimeMs: Date.now() - startTime,
      };
    }

    // Return mock extracted data
    const data = this.generateMockData();

    return {
      success: true,
      data,
      processingTimeMs: Date.now() - startTime,
    };
  }

  private generateMockData(): OCRExtractedData {
    // Generate realistic mock data
    const streets = [
      "123 Maple Avenue",
      "456 Oak Street",
      "789 Cedar Lane",
      "321 Pine Drive",
      "555 Birch Court",
      "888 Willow Way",
    ];
    const cities = ["Boise", "Meridian", "Eagle", "Nampa", "Caldwell", "Star"];
    const buyerFirstNames = ["Michael", "Sarah", "David", "Jennifer", "Robert", "Emily"];
    const buyerLastNames = ["Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson"];
    const sellerFirstNames = ["James", "Patricia", "John", "Linda", "William", "Elizabeth"];
    const sellerLastNames = ["Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"];

    const randomStreet = streets[Math.floor(Math.random() * streets.length)];
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const buyerFirst = buyerFirstNames[Math.floor(Math.random() * buyerFirstNames.length)];
    const buyerLast = buyerLastNames[Math.floor(Math.random() * buyerLastNames.length)];
    const sellerFirst = sellerFirstNames[Math.floor(Math.random() * sellerFirstNames.length)];
    const sellerLast = sellerLastNames[Math.floor(Math.random() * sellerLastNames.length)];

    // Generate dates
    const today = new Date();
    const contractDate = new Date(today);
    contractDate.setDate(today.getDate() - Math.floor(Math.random() * 5));

    const closingDate = new Date(today);
    closingDate.setDate(today.getDate() + 25 + Math.floor(Math.random() * 20));

    const inspectionDeadline = new Date(contractDate);
    inspectionDeadline.setDate(contractDate.getDate() + 10);

    const financingDeadline = new Date(closingDate);
    financingDeadline.setDate(closingDate.getDate() - 7);

    const appraisalDeadline = new Date(closingDate);
    appraisalDeadline.setDate(closingDate.getDate() - 14);

    // Generate price
    const basePrice = 250000 + Math.floor(Math.random() * 500000);
    const purchasePrice = Math.round(basePrice / 5000) * 5000;
    const earnestMoney = Math.round(purchasePrice * 0.02);

    return {
      extractedAt: new Date().toISOString(),
      confidence: 0.85 + Math.random() * 0.12,
      sourceDocumentId: `doc_ocr_${Date.now()}`,
      fields: {
        propertyAddress: { value: randomStreet, confidence: 0.95 },
        propertyCity: { value: randomCity, confidence: 0.93 },
        propertyState: { value: "ID", confidence: 0.98 },
        propertyZip: { value: `836${Math.floor(Math.random() * 90) + 10}`, confidence: 0.91 },
        purchasePrice: { value: purchasePrice, confidence: 0.97 },
        earnestMoney: { value: earnestMoney, confidence: 0.94 },
        loanType: { value: "Conventional", confidence: 0.88 },
        contractDate: { value: formatDate(contractDate), confidence: 0.92 },
        closingDate: { value: formatDate(closingDate), confidence: 0.90 },
        inspectionDeadline: { value: formatDate(inspectionDeadline), confidence: 0.87 },
        financingDeadline: { value: formatDate(financingDeadline), confidence: 0.85 },
        appraisalDeadline: { value: formatDate(appraisalDeadline), confidence: 0.83 },
        buyerNames: { value: [`${buyerFirst} ${buyerLast}`], confidence: 0.91 },
        buyerEmails: { value: [`${buyerFirst.toLowerCase()}.${buyerLast.toLowerCase()}@email.com`], confidence: 0.78 },
        buyerPhones: { value: [`(208) 555-${Math.floor(1000 + Math.random() * 9000)}`], confidence: 0.75 },
        sellerNames: { value: [`${sellerFirst} ${sellerLast}`], confidence: 0.89 },
        sellerEmails: { value: [`${sellerFirst.toLowerCase()}.${sellerLast.toLowerCase()}@email.com`], confidence: 0.76 },
        sellerPhones: { value: [`(208) 555-${Math.floor(1000 + Math.random() * 9000)}`], confidence: 0.74 },
        buyerAgentName: { value: "Sarah Johnson", confidence: 0.86 },
        buyerAgentEmail: { value: "sarah.johnson@abcrealty.com", confidence: 0.82 },
        buyerAgentPhone: { value: "(208) 555-9999", confidence: 0.80 },
        buyerAgentBrokerage: { value: "ABC Realty", confidence: 0.84 },
        sellerAgentName: { value: "Mike Williams", confidence: 0.85 },
        sellerAgentEmail: { value: "mike.williams@xyzrealestate.com", confidence: 0.81 },
        sellerAgentPhone: { value: "(208) 555-8888", confidence: 0.79 },
        sellerAgentBrokerage: { value: "XYZ Real Estate", confidence: 0.83 },
      },
    };
  }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Populate a partial Transaction from OCR extracted data
 */
export function populateTransactionFromOCR(
  data: OCRExtractedData
): Partial<Transaction> {
  const fields = data.fields;

  return {
    property: {
      address: fields.propertyAddress?.value || "",
      city: fields.propertyCity?.value || "",
      state: fields.propertyState?.value || "",
      zip: fields.propertyZip?.value || "",
    },
    financials: {
      purchasePrice: fields.purchasePrice?.value || 0,
      earnestMoney: fields.earnestMoney?.value || 0,
      loanType: fields.loanType?.value,
    },
    dates: {
      contractDate: fields.contractDate?.value || "",
      closingDate: fields.closingDate?.value || "",
    },
  };
}

/**
 * Generate Party records from OCR extracted data
 */
export function generatePartiesFromOCR(
  data: OCRExtractedData,
  transactionId: string
): Partial<Party>[] {
  const parties: Partial<Party>[] = [];
  const fields = data.fields;

  // Add buyers
  if (fields.buyerNames?.value) {
    fields.buyerNames.value.forEach((name, index) => {
      parties.push({
        transactionId,
        role: "buyer",
        name,
        contact: {
          email: fields.buyerEmails?.value?.[index],
          phone: fields.buyerPhones?.value?.[index],
        },
        extractedFrom: {
          documentId: data.sourceDocumentId,
          field: "buyerNames",
        },
      });
    });
  }

  // Add sellers
  if (fields.sellerNames?.value) {
    fields.sellerNames.value.forEach((name, index) => {
      parties.push({
        transactionId,
        role: "seller",
        name,
        contact: {
          email: fields.sellerEmails?.value?.[index],
          phone: fields.sellerPhones?.value?.[index],
        },
        extractedFrom: {
          documentId: data.sourceDocumentId,
          field: "sellerNames",
        },
      });
    });
  }

  // Add buyer agent
  if (fields.buyerAgentName?.value) {
    parties.push({
      transactionId,
      role: "buyer_agent",
      name: fields.buyerAgentName.value,
      company: fields.buyerAgentBrokerage?.value,
      contact: {
        email: fields.buyerAgentEmail?.value,
        phone: fields.buyerAgentPhone?.value,
      },
      extractedFrom: {
        documentId: data.sourceDocumentId,
        field: "buyerAgentName",
      },
    });
  }

  // Add seller agent
  if (fields.sellerAgentName?.value) {
    parties.push({
      transactionId,
      role: "seller_agent",
      name: fields.sellerAgentName.value,
      company: fields.sellerAgentBrokerage?.value,
      contact: {
        email: fields.sellerAgentEmail?.value,
        phone: fields.sellerAgentPhone?.value,
      },
      extractedFrom: {
        documentId: data.sourceDocumentId,
        field: "sellerAgentName",
      },
    });
  }

  return parties;
}

/**
 * Generate Timeline events from OCR extracted dates
 */
export function generateTimelineFromOCR(
  data: OCRExtractedData,
  transactionId: string
): Partial<TimelineEvent>[] {
  const events: Partial<TimelineEvent>[] = [];
  const fields = data.fields;

  // Contract accepted
  if (fields.contractDate?.value) {
    events.push({
      transactionId,
      date: fields.contractDate.value,
      title: "Contract Accepted",
      status: "complete",
      source: { document: "Purchase Agreement", section: "Contract Date" },
    });
  }

  // Earnest money due (typically 3 days after contract)
  if (fields.contractDate?.value) {
    const emDate = new Date(fields.contractDate.value);
    emDate.setDate(emDate.getDate() + 3);
    events.push({
      transactionId,
      date: formatDate(emDate),
      title: "Earnest Money Due",
      status: "pending",
      source: { document: "Purchase Agreement", section: "Earnest Money" },
    });
  }

  // Inspection deadline
  if (fields.inspectionDeadline?.value) {
    events.push({
      transactionId,
      date: fields.inspectionDeadline.value,
      title: "Inspection Deadline",
      status: "pending",
      source: { document: "Purchase Agreement", section: "Inspection Contingency" },
    });
  }

  // Appraisal deadline
  if (fields.appraisalDeadline?.value) {
    events.push({
      transactionId,
      date: fields.appraisalDeadline.value,
      title: "Appraisal Due",
      status: "pending",
      source: { document: "Purchase Agreement", section: "Appraisal Contingency" },
    });
  }

  // Financing deadline
  if (fields.financingDeadline?.value) {
    events.push({
      transactionId,
      date: fields.financingDeadline.value,
      title: "Loan Contingency",
      status: "pending",
      source: { document: "Purchase Agreement", section: "Financing Contingency" },
    });
  }

  // Closing
  if (fields.closingDate?.value) {
    events.push({
      transactionId,
      date: fields.closingDate.value,
      title: "Closing",
      status: "pending",
      source: { document: "Purchase Agreement", section: "Closing Date" },
    });
  }

  // Sort by date
  events.sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return events;
}

// Export singleton instance
export const ocrService = new MockOCRService();
