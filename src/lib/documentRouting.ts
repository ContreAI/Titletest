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
  const labels: Record<DocumentType, string> = {
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
    lease: "Lease",
    rent_roll: "Rent Roll",
    estoppel_certificate: "Estoppel Certificate",
    environmental_report: "Environmental Report",
    survey: "Survey",
    zoning_letter: "Zoning Letter",
    tenant_financials: "Tenant Financials",
    operating_agreement: "Operating Agreement",
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
