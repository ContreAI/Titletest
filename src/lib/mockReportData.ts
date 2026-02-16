import type { DocumentReport } from "@/types/automation";
import type { DocumentType } from "@/types";

// ============================================
// Mock AI Report Data
// Returns persona-aware mock reports for each
// document type. In production, these would come
// from the external AI service (contre-ai-ui-main).
// ============================================

const REPORTS: Partial<Record<DocumentType, DocumentReport>> = {
  purchase_agreement: {
    documentId: "",
    documentType: "purchase_agreement",
    generatedAt: new Date().toISOString(),
    summary:
      "This purchase agreement establishes the sale of 1234 Elm Street, Boise ID 83702 for $385,000. The buyer (John & Mary Smith) will deposit $8,000 in earnest money within 3 business days. Financing contingency expires Feb 14, 2025 and the inspection period ends Jan 31, 2025. Closing is scheduled for Feb 28, 2025.",
    keyFindings: [
      {
        category: "financial",
        severity: "info",
        title: "Purchase Price: $385,000",
        detail:
          "Cash to close will depend on loan terms and closing costs. Estimated at $82,000-$88,000 for conventional financing.",
        sourceSection: "Section 1 — Purchase Price",
      },
      {
        category: "financial",
        severity: "info",
        title: "Earnest Money: $8,000",
        detail:
          "Due within 3 business days of contract execution. Deposited to Premier Title & Escrow trust account.",
        sourceSection: "Section 2 — Earnest Money",
      },
      {
        category: "timeline",
        severity: "warning",
        title: "Inspection Contingency: Jan 31, 2025",
        detail:
          "Buyer must complete all inspections and deliver any repair requests by this date or the contingency expires.",
        sourceSection: "Section 8 — Inspection",
      },
      {
        category: "timeline",
        severity: "info",
        title: "Financing Contingency: Feb 14, 2025",
        detail:
          "Buyer must secure loan commitment by this date. Failure to do so allows either party to terminate.",
        sourceSection: "Section 9 — Financing",
      },
      {
        category: "party",
        severity: "info",
        title: "Buyer's Agent: Sarah Johnson, Premier Boise Realty",
        detail: "Commission: 3% of purchase price ($11,550).",
      },
      {
        category: "party",
        severity: "info",
        title: "Seller's Agent: Mike Williams, Idaho Realty Group",
        detail: "Commission: 3% of purchase price ($11,550).",
      },
      {
        category: "property",
        severity: "info",
        title: "Property Inclusions",
        detail:
          "Refrigerator, washer, dryer, attached window coverings, garage door opener. Excludes: dining room chandelier (seller's personal property).",
        sourceSection: "Section 3 — Inclusions/Exclusions",
      },
      {
        category: "legal",
        severity: "warning",
        title: "HOA Disclosure Required",
        detail:
          "Property is within an HOA. Seller must provide CC&Rs, bylaws, and financial statements within 10 days.",
        sourceSection: "Section 12 — HOA",
      },
    ],
    extractedData: {
      "Purchase Price": "$385,000",
      "Earnest Money": "$8,000",
      "Loan Type": "Conventional",
      "Down Payment": "~20%",
      "Closing Date": "Feb 28, 2025",
      "Inspection Deadline": "Jan 31, 2025",
      "Financing Deadline": "Feb 14, 2025",
      "Appraisal Deadline": "Feb 10, 2025",
      "Buyer": "John & Mary Smith",
      "Seller": "Jane Doe",
      "Buyer Agent": "Sarah Johnson",
      "Seller Agent": "Mike Williams",
      "Title Company": "Premier Title & Escrow",
    },
    actionItems: [
      {
        id: "ai_1",
        label: "Send wire instructions for earnest money",
        description:
          "Earnest money of $8,000 is due within 3 business days.",
        dueDate: "3 business days from execution",
        urgent: true,
      },
      {
        id: "ai_2",
        label: "Schedule home inspection",
        description:
          "Inspection period ends Jan 31 — schedule ASAP to allow time for repair negotiations.",
        dueDate: "Jan 31, 2025",
        urgent: true,
      },
      {
        id: "ai_3",
        label: "Request HOA documents from seller",
        description:
          "Seller is required to provide HOA docs within 10 days per Section 12.",
        dueDate: "10 days from execution",
        urgent: false,
      },
    ],
    metadata: {
      confidenceScore: 0.96,
      processingTimeMs: 2340,
      modelVersion: "contre-doc-v2.1",
    },
  },

  title_commitment: {
    documentId: "",
    documentType: "title_commitment",
    generatedAt: new Date().toISOString(),
    summary:
      "Title commitment issued by Premier Title & Escrow for 1234 Elm Street. One existing mortgage lien identified (Wells Fargo, ~$198,500 balance). Standard exceptions apply. Schedule B-I contains 4 requirements that must be satisfied before closing. No unusual encumbrances or title defects found.",
    keyFindings: [
      {
        category: "financial",
        severity: "info",
        title: "Existing Mortgage: Wells Fargo",
        detail:
          "First mortgage lien with approximate balance of $198,500. Payoff demand letter will be sent automatically.",
        sourceSection: "Schedule B-II — Exceptions",
      },
      {
        category: "legal",
        severity: "info",
        title: "Property Taxes Current",
        detail:
          "2024 property taxes paid in full. 2025 taxes will be prorated at closing.",
        sourceSection: "Schedule B-II — Item 3",
      },
      {
        category: "legal",
        severity: "warning",
        title: "HOA Covenants Apply",
        detail:
          "Property subject to Elm Creek Homeowners Association CC&Rs recorded as Instrument #2008-045678. Buyer should review restrictions.",
        sourceSection: "Schedule B-II — Item 5",
      },
      {
        category: "legal",
        severity: "info",
        title: "Utility Easement",
        detail:
          "Standard 10-foot utility easement along rear property line. Does not affect buildable area or typical use.",
        sourceSection: "Schedule B-II — Item 4",
      },
      {
        category: "risk",
        severity: "info",
        title: "No Title Defects Found",
        detail:
          "Chain of title is clean. No judgments, liens (other than mortgage), or pending legal actions found.",
      },
    ],
    extractedData: {
      "Commitment Number": "TC-2025-001234",
      "Effective Date": "Jan 30, 2025",
      "Policy Amount": "$385,000",
      "Vesting": "John Smith and Mary Smith, husband and wife",
      "Lien Holder": "Wells Fargo Bank, N.A.",
      "Loan Number": "****4567",
      "Approx. Payoff": "$198,500",
      "Property Tax (2024)": "$4,320 (paid)",
      "HOA": "Elm Creek HOA",
    },
    actionItems: [
      {
        id: "tc_1",
        label: "Review Schedule B-I requirements",
        description:
          "4 items must be satisfied before policy issuance. Most are standard (signatures, payoff).",
        urgent: false,
      },
      {
        id: "tc_2",
        label: "Payoff demand sent to Wells Fargo",
        description:
          "Automated payoff request has been triggered for the existing mortgage.",
        urgent: false,
      },
      {
        id: "tc_3",
        label: "Review HOA CC&Rs",
        description:
          "Buyer should review Elm Creek HOA restrictions before financing contingency expires.",
        dueDate: "Before Feb 14, 2025",
        urgent: true,
      },
    ],
    metadata: {
      confidenceScore: 0.94,
      processingTimeMs: 3120,
      modelVersion: "contre-doc-v2.1",
    },
  },

  closing_disclosure: {
    documentId: "",
    documentType: "closing_disclosure",
    generatedAt: new Date().toISOString(),
    summary:
      "Closing Disclosure prepared for 1234 Elm Street closing on Feb 28, 2025. Buyer's cash to close is $85,420. All figures are within TRID tolerance limits compared to the Loan Estimate. No changed circumstances identified.",
    keyFindings: [
      {
        category: "financial",
        severity: "info",
        title: "Cash to Close: $85,420",
        detail:
          "Includes down payment ($77,000), closing costs ($6,870), and prepaid items ($1,550).",
        sourceSection: "Page 1 — Closing Cost Details",
      },
      {
        category: "financial",
        severity: "info",
        title: "Loan Amount: $308,000",
        detail:
          "30-year fixed at 6.75%. Monthly P&I payment: $1,997. Total monthly with escrow: $2,485.",
        sourceSection: "Page 1 — Loan Terms",
      },
      {
        category: "legal",
        severity: "info",
        title: "TRID Compliance: OK",
        detail:
          "All fees within tolerance limits compared to Loan Estimate dated Jan 20, 2025. No changed circumstances.",
      },
      {
        category: "financial",
        severity: "info",
        title: "Seller Credits: $2,500",
        detail:
          "Seller contributing $2,500 toward buyer's closing costs per contract addendum.",
        sourceSection: "Page 2 — Summaries of Transactions",
      },
      {
        category: "timeline",
        severity: "warning",
        title: "3-Day Review Period Required",
        detail:
          "TRID requires buyer to receive the CD at least 3 business days before closing. Review period ends Feb 25.",
      },
    ],
    extractedData: {
      "Cash to Close": "$85,420",
      "Loan Amount": "$308,000",
      "Interest Rate": "6.75%",
      "Monthly Payment (P&I)": "$1,997",
      "Monthly Payment (Total)": "$2,485",
      "Closing Costs (Buyer)": "$6,870",
      "Seller Credits": "$2,500",
      "Title Insurance": "$1,850",
      "Escrow Fee": "$1,200",
      "Recording Fees": "$150",
    },
    actionItems: [
      {
        id: "cd_1",
        label: "Review and e-sign Closing Disclosure",
        description: "Must be signed by Feb 25 to maintain Feb 28 closing date.",
        dueDate: "Feb 25, 2025",
        urgent: true,
      },
      {
        id: "cd_2",
        label: "Wire closing funds",
        description:
          "Wire $85,420 to Premier Title & Escrow using the secure wire instructions provided.",
        dueDate: "Feb 27, 2025",
        urgent: true,
      },
    ],
    metadata: {
      confidenceScore: 0.98,
      processingTimeMs: 1890,
      modelVersion: "contre-doc-v2.1",
    },
  },

  inspection_report: {
    documentId: "",
    documentType: "inspection_report",
    generatedAt: new Date().toISOString(),
    summary:
      "Home inspection completed for 1234 Elm Street. The property is in generally good condition for its age (built 2008). 3 items flagged for attention: HVAC filter replacement needed, minor grading issue at foundation, and one GFCI outlet not functioning. No major structural or safety concerns identified.",
    keyFindings: [
      {
        category: "property",
        severity: "warning",
        title: "HVAC: Filter Replacement Needed",
        detail:
          "Furnace filter is heavily soiled. Recommend replacement and annual maintenance. System is functioning properly otherwise (2018 Lennox, ~7 years old).",
        sourceSection: "Section 4 — HVAC Systems",
      },
      {
        category: "property",
        severity: "warning",
        title: "Exterior: Grading Concern",
        detail:
          "Negative grading observed at southeast foundation corner. Soil slopes toward foundation approximately 2 inches over 6 feet. Recommend re-grading to ensure proper drainage.",
        sourceSection: "Section 2 — Exterior",
      },
      {
        category: "property",
        severity: "info",
        title: "Electrical: GFCI Outlet Non-functional",
        detail:
          "One GFCI outlet in guest bathroom did not trip when tested. Recommend electrician evaluate and repair.",
        sourceSection: "Section 5 — Electrical",
      },
      {
        category: "property",
        severity: "info",
        title: "Roof: Good Condition",
        detail:
          "Architectural shingle roof (2015) with estimated 15-20 years remaining life. No leaks, missing shingles, or flashing issues observed.",
        sourceSection: "Section 1 — Roof",
      },
      {
        category: "property",
        severity: "info",
        title: "Foundation: No Issues",
        detail:
          "Poured concrete foundation with no cracks, settling, or moisture intrusion observed.",
        sourceSection: "Section 3 — Foundation",
      },
    ],
    extractedData: {
      "Property Age": "Built 2008 (17 years)",
      "Roof": "Good — ~15-20 years remaining",
      "HVAC": "Lennox (2018) — functioning",
      "Plumbing": "Good condition",
      "Electrical": "1 GFCI issue",
      "Foundation": "Good — no concerns",
      "Items Flagged": "3",
      "Major Concerns": "0",
    },
    actionItems: [
      {
        id: "ir_1",
        label: "Consider repair request for grading issue",
        description:
          "Foundation grading is the most significant item. Estimated repair cost: $300-$800.",
        urgent: false,
      },
      {
        id: "ir_2",
        label: "GFCI outlet repair",
        description:
          "Minor electrical repair. Estimated cost: $75-$150.",
        urgent: false,
      },
    ],
    metadata: {
      confidenceScore: 0.92,
      processingTimeMs: 2870,
      modelVersion: "contre-doc-v2.1",
    },
  },

  earnest_money_receipt: {
    documentId: "",
    documentType: "earnest_money_receipt",
    generatedAt: new Date().toISOString(),
    summary:
      "Earnest money receipt confirms $8,000 wire received by Premier Title & Escrow on Jan 27, 2025. Funds deposited to escrow trust account. Receipt matches the contract terms.",
    keyFindings: [
      {
        category: "financial",
        severity: "info",
        title: "Amount Received: $8,000",
        detail: "Matches earnest money amount specified in the purchase agreement.",
      },
      {
        category: "timeline",
        severity: "info",
        title: "Received: Jan 27, 2025",
        detail: "Within the 3 business day requirement from contract execution (Jan 24).",
      },
      {
        category: "financial",
        severity: "info",
        title: "Deposit Method: Wire Transfer",
        detail: "Funds received via wire transfer and deposited to Premier Title & Escrow trust account #****8901.",
      },
    ],
    extractedData: {
      "Amount": "$8,000",
      "Date Received": "Jan 27, 2025",
      "Method": "Wire Transfer",
      "Trust Account": "****8901",
      "Contract Amount": "$8,000 (match)",
    },
    actionItems: [],
    metadata: {
      confidenceScore: 0.99,
      processingTimeMs: 980,
      modelVersion: "contre-doc-v2.1",
    },
  },

  settlement_statement_seller: {
    documentId: "",
    documentType: "settlement_statement_seller",
    generatedAt: new Date().toISOString(),
    summary:
      "Seller's settlement statement for 1234 Elm Street. Estimated net proceeds: $195,550 after mortgage payoff ($198,500), commissions ($23,100), fees ($3,200), and prorations ($2,250). Wire proceeds will be sent within 1-2 business days after closing.",
    keyFindings: [
      {
        category: "financial",
        severity: "info",
        title: "Net Proceeds: $195,550",
        detail: "After all deductions from the $385,000 sale price.",
      },
      {
        category: "financial",
        severity: "info",
        title: "Mortgage Payoff: $198,500",
        detail: "Payoff to Wells Fargo Bank, N.A. Including per-diem interest through closing date.",
        sourceSection: "Line 504",
      },
      {
        category: "financial",
        severity: "info",
        title: "Total Commissions: $23,100",
        detail: "Buyer agent: $11,550 (3%), Seller agent: $11,550 (3%).",
        sourceSection: "Lines 700-704",
      },
      {
        category: "timeline",
        severity: "info",
        title: "Proceeds Wire: 1-2 Business Days",
        detail: "Net proceeds will be wired to your bank account within 1-2 business days after closing and recording.",
      },
    ],
    extractedData: {
      "Sale Price": "$385,000",
      "Mortgage Payoff": "$198,500",
      "Buyer Agent Commission": "$11,550",
      "Seller Agent Commission": "$11,550",
      "Title Insurance": "$1,850",
      "Escrow Fee": "$600",
      "Recording Fees": "$150",
      "Tax Proration": "$1,800",
      "HOA Proration": "$450",
      "Net Proceeds": "$195,550",
    },
    actionItems: [
      {
        id: "ss_1",
        label: "Verify bank account for proceeds wire",
        description: "Confirm your bank account details with the title company for net proceeds wire.",
        urgent: true,
      },
    ],
    metadata: {
      confidenceScore: 0.97,
      processingTimeMs: 1650,
      modelVersion: "contre-doc-v2.1",
    },
  },
};

/**
 * Get a mock AI report for a given document.
 * Returns null if no report template exists for that document type.
 */
export function getMockReport(
  documentId: string,
  documentType: DocumentType
): DocumentReport | null {
  const template = REPORTS[documentType];
  if (!template) return null;

  return {
    ...template,
    documentId,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Check if a report is available for a given document type.
 */
export function hasReport(documentType: DocumentType): boolean {
  return documentType in REPORTS;
}
