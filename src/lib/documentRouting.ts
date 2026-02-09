import { DocumentType } from "@/types";
import { DocumentRouting, DocumentRoutingRule } from "@/types/admin";

/**
 * Default routing rules for each document type.
 * These define the recommended routing when uploading documents.
 */
export const defaultRoutingRules: Record<DocumentType, DocumentRoutingRule> = {
  // Contract Documents
  purchase_agreement: {
    documentType: "purchase_agreement",
    defaultRouting: "both",
    description: "Both parties need the executed contract",
  },
  addendum: {
    documentType: "addendum",
    defaultRouting: "both",
    description: "Addendums affect both parties",
  },
  earnest_money_receipt: {
    documentType: "earnest_money_receipt",
    defaultRouting: "buyer_only",
    description: "Confirmation of buyer's deposit",
  },

  // Title Documents
  title_commitment: {
    documentType: "title_commitment",
    defaultRouting: "both",
    description: "Both parties should review title commitment",
  },
  preliminary_title_report: {
    documentType: "preliminary_title_report",
    defaultRouting: "both",
    description: "Both parties review preliminary report",
  },
  deed: {
    documentType: "deed",
    defaultRouting: "both",
    description: "Transfer document for both parties",
  },
  title_policy: {
    documentType: "title_policy",
    defaultRouting: "buyer_only",
    description: "Buyer receives the title insurance policy",
  },

  // Financial Documents
  settlement_statement_buyer: {
    documentType: "settlement_statement_buyer",
    defaultRouting: "buyer_only",
    description: "Contains buyer's confidential financial information",
    requiresApproval: true,
  },
  settlement_statement_seller: {
    documentType: "settlement_statement_seller",
    defaultRouting: "seller_only",
    description: "Contains seller's confidential financial information",
    requiresApproval: true,
  },
  wire_instructions: {
    documentType: "wire_instructions",
    defaultRouting: "buyer_only",
    description: "Buyer needs wire instructions to send funds",
  },
  closing_disclosure: {
    documentType: "closing_disclosure",
    defaultRouting: "both",
    description: "Required disclosure for both parties",
  },
  payoff_statement: {
    documentType: "payoff_statement",
    defaultRouting: "internal",
    description: "Sensitive seller financial info - internal only by default",
    requiresApproval: true,
  },
  loan_approval: {
    documentType: "loan_approval",
    defaultRouting: "buyer_only",
    description: "Buyer's loan approval documentation",
  },
  appraisal: {
    documentType: "appraisal",
    defaultRouting: "buyer_only",
    description: "Appraisal belongs to buyer/lender",
  },

  // Closing Documents
  inspection_report: {
    documentType: "inspection_report",
    defaultRouting: "buyer_only",
    description: "Inspection is buyer's due diligence",
  },
  insurance_binder: {
    documentType: "insurance_binder",
    defaultRouting: "buyer_only",
    description: "Buyer's homeowners insurance",
  },
  hoa_documents: {
    documentType: "hoa_documents",
    defaultRouting: "both",
    description: "HOA info relevant to both parties",
  },

  // Escrow / Shared Documents
  escrow_letter: {
    documentType: "escrow_letter",
    defaultRouting: "both",
    description: "Escrow opening letter sent to both parties",
  },
  escrow_instructions: {
    documentType: "escrow_instructions",
    defaultRouting: "both",
    description: "Escrow instructions for both parties to sign",
  },
  wire_fraud_advisory: {
    documentType: "wire_fraud_advisory",
    defaultRouting: "both",
    description: "Wire fraud prevention advisory for both parties",
  },
  closing_appointment: {
    documentType: "closing_appointment",
    defaultRouting: "both",
    description: "Closing appointment confirmation for both parties",
  },
  recording_confirmation: {
    documentType: "recording_confirmation",
    defaultRouting: "both",
    description: "Recording confirmation sent to both parties",
  },

  // Seller-specific Documents
  sellers_disclosure: {
    documentType: "sellers_disclosure",
    defaultRouting: "both",
    description: "Seller disclosure statement reviewed by both parties",
  },
  lead_paint_disclosure: {
    documentType: "lead_paint_disclosure",
    defaultRouting: "both",
    description: "Lead paint disclosure for pre-1978 properties",
  },
  seller_info_sheet: {
    documentType: "seller_info_sheet",
    defaultRouting: "seller_only",
    description: "Seller information and contact details",
  },
  leased_equipment_disclosure: {
    documentType: "leased_equipment_disclosure",
    defaultRouting: "both",
    description: "Disclosure of leased equipment on property",
  },
  compliance_confirmation: {
    documentType: "compliance_confirmation",
    defaultRouting: "seller_only",
    description: "Safety and compliance confirmation",
  },
  repair_receipts: {
    documentType: "repair_receipts",
    defaultRouting: "buyer_only",
    description: "Repair completion receipts for buyer verification",
  },
  repair_addendum: {
    documentType: "repair_addendum",
    defaultRouting: "both",
    description: "Repair negotiation addendum for both parties",
  },
  affidavit: {
    documentType: "affidavit",
    defaultRouting: "seller_only",
    description: "Seller affidavit",
  },
  firpta_certification: {
    documentType: "firpta_certification",
    defaultRouting: "internal",
    description: "FIRPTA certification - internal processing",
  },
  bill_of_sale: {
    documentType: "bill_of_sale",
    defaultRouting: "both",
    description: "Bill of sale for personal property",
  },
  disbursement_authorization: {
    documentType: "disbursement_authorization",
    defaultRouting: "seller_only",
    description: "Seller disbursement authorization",
  },
  form_1099s: {
    documentType: "form_1099s",
    defaultRouting: "seller_only",
    description: "1099-S tax form for seller",
  },
  proceeds_wire_confirmation: {
    documentType: "proceeds_wire_confirmation",
    defaultRouting: "seller_only",
    description: "Confirmation of seller proceeds wire",
  },

  // Buyer-specific Documents
  vesting_instructions: {
    documentType: "vesting_instructions",
    defaultRouting: "buyer_only",
    description: "Buyer vesting/title-holding instructions",
  },
  specialty_inspection_report: {
    documentType: "specialty_inspection_report",
    defaultRouting: "buyer_only",
    description: "Specialized inspection (pest, radon, etc.)",
  },
  credit_agreement: {
    documentType: "credit_agreement",
    defaultRouting: "buyer_only",
    description: "Repair credit agreement for buyer",
  },
  owners_title_insurance_quote: {
    documentType: "owners_title_insurance_quote",
    defaultRouting: "buyer_only",
    description: "Owner's title insurance quote",
  },
  clear_to_close_notice: {
    documentType: "clear_to_close_notice",
    defaultRouting: "buyer_only",
    description: "Lender clear-to-close notification",
  },
  closing_funds_wire_confirmation: {
    documentType: "closing_funds_wire_confirmation",
    defaultRouting: "buyer_only",
    description: "Buyer closing funds wire confirmation",
  },
  funds_receipt_confirmation: {
    documentType: "funds_receipt_confirmation",
    defaultRouting: "buyer_only",
    description: "Confirmation of funds received by escrow",
  },
  walkthrough_confirmation: {
    documentType: "walkthrough_confirmation",
    defaultRouting: "buyer_only",
    description: "Final walkthrough confirmation",
  },
  signed_closing_package: {
    documentType: "signed_closing_package",
    defaultRouting: "both",
    description: "Signed closing package for both parties",
  },
  recorded_deed: {
    documentType: "recorded_deed",
    defaultRouting: "buyer_only",
    description: "Recorded deed sent to buyer post-closing",
  },
  owners_title_policy: {
    documentType: "owners_title_policy",
    defaultRouting: "buyer_only",
    description: "Owner's title insurance policy for buyer",
  },
  home_warranty: {
    documentType: "home_warranty",
    defaultRouting: "buyer_only",
    description: "Home warranty documentation",
  },
  lender_welcome_package: {
    documentType: "lender_welcome_package",
    defaultRouting: "buyer_only",
    description: "Lender welcome package for buyer",
  },

  // Commercial Documents (Due Diligence)
  lease: {
    documentType: "lease",
    defaultRouting: "both",
    description: "Tenant leases for buyer due diligence",
  },
  rent_roll: {
    documentType: "rent_roll",
    defaultRouting: "both",
    description: "Current income summary for due diligence",
  },
  estoppel_certificate: {
    documentType: "estoppel_certificate",
    defaultRouting: "both",
    description: "Tenant verification certificates",
  },
  environmental_report: {
    documentType: "environmental_report",
    defaultRouting: "buyer_only",
    description: "Phase I/II environmental assessment for buyer",
  },
  survey: {
    documentType: "survey",
    defaultRouting: "both",
    description: "ALTA survey for both parties",
  },
  zoning_letter: {
    documentType: "zoning_letter",
    defaultRouting: "both",
    description: "Zoning compliance documentation",
  },
  tenant_financials: {
    documentType: "tenant_financials",
    defaultRouting: "buyer_only",
    description: "Confidential tenant financial statements",
    requiresApproval: true,
  },
  operating_agreement: {
    documentType: "operating_agreement",
    defaultRouting: "internal",
    description: "Entity operating agreements - internal by default",
  },
  ucc_search: {
    documentType: "ucc_search",
    defaultRouting: "both",
    description: "UCC lien search results",
  },
  entity_docs: {
    documentType: "entity_docs",
    defaultRouting: "internal",
    description: "Entity formation and authorization documents",
  },
  proration_true_up: {
    documentType: "proration_true_up",
    defaultRouting: "both",
    description: "Post-closing proration adjustment",
  },
  tenant_notification_letter: {
    documentType: "tenant_notification_letter",
    defaultRouting: "both",
    description: "Tenant notification of ownership change",
  },
  service_contract: {
    documentType: "service_contract",
    defaultRouting: "both",
    description: "Property service contracts for review",
  },
  security_deposit_schedule: {
    documentType: "security_deposit_schedule",
    defaultRouting: "both",
    description: "Security deposit schedule for tenant accounts",
  },

  // Other
  other: {
    documentType: "other",
    defaultRouting: "internal",
    description: "Review before routing",
  },
};

/**
 * Get the suggested routing for a document type.
 */
export function getSuggestedRouting(type: DocumentType): DocumentRouting {
  return defaultRoutingRules[type]?.defaultRouting || "internal";
}

/**
 * Get the full routing rule for a document type.
 */
export function getRoutingRule(type: DocumentType): DocumentRoutingRule {
  return defaultRoutingRules[type];
}

/**
 * Convert routing selection to boolean flags for Document.routing.
 */
export function routingToFlags(routing: DocumentRouting): {
  toBuyer: boolean;
  toSeller: boolean;
} {
  switch (routing) {
    case "buyer_only":
      return { toBuyer: true, toSeller: false };
    case "seller_only":
      return { toBuyer: false, toSeller: true };
    case "both":
      return { toBuyer: true, toSeller: true };
    case "internal":
      return { toBuyer: false, toSeller: false };
    default:
      return { toBuyer: false, toSeller: false };
  }
}

/**
 * Convert boolean flags to routing selection.
 */
export function flagsToRouting(flags: {
  toBuyer: boolean;
  toSeller: boolean;
}): DocumentRouting {
  if (flags.toBuyer && flags.toSeller) return "both";
  if (flags.toBuyer && !flags.toSeller) return "buyer_only";
  if (!flags.toBuyer && flags.toSeller) return "seller_only";
  return "internal";
}

/**
 * Get human-readable label for routing.
 */
export function getRoutingLabel(routing: DocumentRouting): string {
  const labels: Record<DocumentRouting, string> = {
    buyer_only: "Buyer Only",
    seller_only: "Seller Only",
    both: "Both Parties",
    internal: "Internal Only",
  };
  return labels[routing];
}

/**
 * Get description for routing option.
 */
export function getRoutingDescription(routing: DocumentRouting): string {
  const descriptions: Record<DocumentRouting, string> = {
    buyer_only: "Document will appear in buyer's portal only",
    seller_only: "Document will appear in seller's portal only",
    both: "Document will appear in both buyer and seller portals",
    internal: "Document visible to title company only (not shared with parties)",
  };
  return descriptions[routing];
}

/**
 * Routing options for UI dropdowns.
 */
export const ROUTING_OPTIONS: {
  value: DocumentRouting;
  label: string;
  description: string;
}[] = [
  {
    value: "both",
    label: "Both Parties",
    description: "Visible to buyer and seller",
  },
  {
    value: "buyer_only",
    label: "Buyer Only",
    description: "Visible to buyer only",
  },
  {
    value: "seller_only",
    label: "Seller Only",
    description: "Visible to seller only",
  },
  {
    value: "internal",
    label: "Internal Only",
    description: "Title company only",
  },
];

/**
 * Validate routing for a document type.
 * Returns warning if routing deviates from recommended or has restrictions.
 */
export function validateRouting(
  type: DocumentType,
  routing: DocumentRouting
): { valid: boolean; warning?: string } {
  const rule = defaultRoutingRules[type];

  // Check for restricted combinations
  const restrictions: Partial<
    Record<DocumentType, { forbidden: DocumentRouting[]; warning: string }[]>
  > = {
    settlement_statement_buyer: [
      {
        forbidden: ["seller_only", "both"],
        warning:
          "Buyer's settlement statement contains confidential buyer financial information and should not be shared with seller",
      },
    ],
    settlement_statement_seller: [
      {
        forbidden: ["buyer_only", "both"],
        warning:
          "Seller's settlement statement contains confidential seller financial information and should not be shared with buyer",
      },
    ],
    payoff_statement: [
      {
        forbidden: ["buyer_only", "both"],
        warning:
          "Payoff statement contains sensitive seller mortgage information",
      },
    ],
    tenant_financials: [
      {
        forbidden: ["seller_only"],
        warning:
          "Tenant financials are typically buyer due diligence, not seller information",
      },
    ],
  };

  const typeRestrictions = restrictions[type];
  if (typeRestrictions) {
    for (const restriction of typeRestrictions) {
      if (restriction.forbidden.includes(routing)) {
        return { valid: false, warning: restriction.warning };
      }
    }
  }

  // Warn if deviating from default (but allow it)
  if (rule && rule.defaultRouting !== routing) {
    return {
      valid: true,
      warning: `Default routing for ${getDocumentTypeLabel(type)} is "${getRoutingLabel(rule.defaultRouting)}". You selected "${getRoutingLabel(routing)}".`,
    };
  }

  return { valid: true };
}

/**
 * Get human-readable document type label.
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Partial<Record<DocumentType, string>> = {
    purchase_agreement: "Purchase Agreement",
    addendum: "Addendum",
    earnest_money_receipt: "Earnest Money Receipt",
    title_commitment: "Title Commitment",
    preliminary_title_report: "Preliminary Title Report",
    settlement_statement_buyer: "Settlement Statement (Buyer)",
    settlement_statement_seller: "Settlement Statement (Seller)",
    wire_instructions: "Wire Instructions",
    closing_disclosure: "Closing Disclosure",
    deed: "Deed",
    title_policy: "Title Policy",
    payoff_statement: "Payoff Statement",
    inspection_report: "Inspection Report",
    appraisal: "Appraisal",
    loan_approval: "Loan Approval",
    insurance_binder: "Insurance Binder",
    hoa_documents: "HOA Documents",
    escrow_letter: "Escrow Opening Letter",
    escrow_instructions: "Escrow Instructions",
    wire_fraud_advisory: "Wire Fraud Advisory",
    closing_appointment: "Closing Appointment",
    recording_confirmation: "Recording Confirmation",
    sellers_disclosure: "Seller's Disclosure",
    lead_paint_disclosure: "Lead Paint Disclosure",
    seller_info_sheet: "Seller Information Sheet",
    leased_equipment_disclosure: "Leased Equipment Disclosure",
    compliance_confirmation: "Compliance Confirmation",
    repair_receipts: "Repair Receipts",
    repair_addendum: "Repair Addendum",
    affidavit: "Affidavit",
    firpta_certification: "FIRPTA Certification",
    bill_of_sale: "Bill of Sale",
    disbursement_authorization: "Disbursement Authorization",
    form_1099s: "1099-S Tax Form",
    proceeds_wire_confirmation: "Proceeds Wire Confirmation",
    vesting_instructions: "Vesting Instructions",
    specialty_inspection_report: "Specialty Inspection Report",
    credit_agreement: "Repair Credit Agreement",
    owners_title_insurance_quote: "Owner's Title Insurance Quote",
    clear_to_close_notice: "Clear to Close Notice",
    closing_funds_wire_confirmation: "Closing Funds Wire Confirmation",
    funds_receipt_confirmation: "Funds Receipt Confirmation",
    walkthrough_confirmation: "Walkthrough Confirmation",
    signed_closing_package: "Signed Closing Package",
    recorded_deed: "Recorded Deed",
    owners_title_policy: "Owner's Title Policy",
    home_warranty: "Home Warranty",
    lender_welcome_package: "Lender Welcome Package",
    lease: "Lease",
    rent_roll: "Rent Roll",
    estoppel_certificate: "Estoppel Certificate",
    environmental_report: "Environmental Report",
    survey: "Survey",
    zoning_letter: "Zoning Letter",
    tenant_financials: "Tenant Financials",
    operating_agreement: "Operating Agreement",
    ucc_search: "UCC Search",
    entity_docs: "Entity Documents",
    proration_true_up: "Proration True-Up",
    tenant_notification_letter: "Tenant Notification Letter",
    service_contract: "Service Contract",
    security_deposit_schedule: "Security Deposit Schedule",
    other: "Other",
  };
  return labels[type] || type;
}

/**
 * Group document types by category for upload UI.
 */
export const DOCUMENT_TYPE_GROUPS: {
  label: string;
  types: { value: DocumentType; label: string }[];
}[] = [
  {
    label: "Contract",
    types: [
      { value: "purchase_agreement", label: "Purchase Agreement" },
      { value: "addendum", label: "Addendum" },
      { value: "earnest_money_receipt", label: "Earnest Money Receipt" },
    ],
  },
  {
    label: "Title",
    types: [
      { value: "title_commitment", label: "Title Commitment" },
      { value: "preliminary_title_report", label: "Preliminary Title Report" },
      { value: "deed", label: "Deed" },
      { value: "title_policy", label: "Title Policy" },
    ],
  },
  {
    label: "Financial",
    types: [
      { value: "settlement_statement_buyer", label: "Settlement Statement (Buyer)" },
      { value: "settlement_statement_seller", label: "Settlement Statement (Seller)" },
      { value: "wire_instructions", label: "Wire Instructions" },
      { value: "closing_disclosure", label: "Closing Disclosure" },
      { value: "payoff_statement", label: "Payoff Statement" },
      { value: "loan_approval", label: "Loan Approval" },
      { value: "appraisal", label: "Appraisal" },
    ],
  },
  {
    label: "Closing",
    types: [
      { value: "inspection_report", label: "Inspection Report" },
      { value: "insurance_binder", label: "Insurance Binder" },
      { value: "hoa_documents", label: "HOA Documents" },
    ],
  },
  {
    label: "Commercial / Due Diligence",
    types: [
      { value: "lease", label: "Lease" },
      { value: "rent_roll", label: "Rent Roll" },
      { value: "estoppel_certificate", label: "Estoppel Certificate" },
      { value: "environmental_report", label: "Environmental Report" },
      { value: "survey", label: "Survey" },
      { value: "zoning_letter", label: "Zoning Letter" },
      { value: "tenant_financials", label: "Tenant Financials" },
      { value: "operating_agreement", label: "Operating Agreement" },
    ],
  },
  {
    label: "Other",
    types: [{ value: "other", label: "Other Document" }],
  },
];
