import {
  DocumentType,
  DocumentCategory,
  DocumentActionStatus,
  Document,
  DocumentWithAction,
  WaitingOn,
} from "@/types";

// Map document types to their category tabs
export const documentCategoryMap: Record<DocumentType, DocumentCategory> = {
  // Contract tab
  purchase_agreement: "contract",
  addendum: "contract",
  earnest_money_receipt: "contract",

  // Title tab
  title_commitment: "title",
  preliminary_title_report: "title",
  deed: "title",
  title_policy: "title",

  // Financial tab
  settlement_statement_buyer: "financial",
  settlement_statement_seller: "financial",
  wire_instructions: "financial",
  closing_disclosure: "financial",
  payoff_statement: "financial",
  loan_approval: "financial",
  appraisal: "financial",

  // Closing tab
  inspection_report: "closing",
  insurance_binder: "closing",
  hoa_documents: "closing",
  other: "closing",

  // Due Diligence tab (Commercial)
  lease: "due_diligence",
  rent_roll: "due_diligence",
  estoppel_certificate: "due_diligence",
  environmental_report: "due_diligence",
  survey: "due_diligence",
  zoning_letter: "due_diligence",
  tenant_financials: "due_diligence",
  operating_agreement: "due_diligence",
};

// Documents that typically require signing
const signatureRequiredTypes: DocumentType[] = [
  "purchase_agreement",
  "addendum",
  "closing_disclosure",
];

// Documents that require review/acknowledgment
const reviewRequiredTypes: DocumentType[] = [
  "title_commitment",
  "preliminary_title_report",
  "settlement_statement_buyer",
  "settlement_statement_seller",
  "wire_instructions",
];

// Documents typically provided by the lender
const lenderProvidedTypes: DocumentType[] = [
  "loan_approval",
  "closing_disclosure",
  "appraisal",
];

// Documents typically provided by title
const titleProvidedTypes: DocumentType[] = [
  "title_commitment",
  "preliminary_title_report",
  "deed",
  "title_policy",
  "settlement_statement_buyer",
  "settlement_statement_seller",
  "wire_instructions",
  "earnest_money_receipt",
  "payoff_statement",
];

export function getDocumentCategory(type: DocumentType): DocumentCategory {
  return documentCategoryMap[type];
}

export function getDocumentsByCategory(
  documents: Document[],
  category: DocumentCategory
): Document[] {
  return documents.filter((doc) => documentCategoryMap[doc.type] === category);
}

export function determineActionStatus(doc: Document): DocumentActionStatus {
  // If document hasn't been uploaded yet (placeholder), it's needed
  if (!doc.filePath || doc.filePath === "") {
    if (lenderProvidedTypes.includes(doc.type)) {
      return "pending_from_lender";
    }
    if (titleProvidedTypes.includes(doc.type)) {
      return "pending_from_title";
    }
    return "upload_needed";
  }

  // If document is still processing, treat as pending review
  if (doc.processing.status === "pending" || doc.processing.status === "processing") {
    return "review_required";
  }

  // If document failed processing, needs attention
  if (doc.processing.status === "failed") {
    return "review_required";
  }

  // Check if signature is needed based on document type
  if (signatureRequiredTypes.includes(doc.type)) {
    // This would ideally check a signing status field
    // For now, we'll treat processed signature docs as complete
    return "complete";
  }

  // Check if review is needed based on document type
  if (reviewRequiredTypes.includes(doc.type) && doc.processing.status === "processed") {
    // If recently processed, might need review
    // This would ideally check a "reviewed" or "acknowledged" field
    return "complete";
  }

  return "complete";
}

export function determineWaitingOn(doc: Document): WaitingOn | undefined {
  if (!doc.filePath || doc.filePath === "") {
    if (lenderProvidedTypes.includes(doc.type)) {
      return "lender";
    }
    if (titleProvidedTypes.includes(doc.type)) {
      return "title";
    }
    // Determine based on source
    if (doc.source === "buyer_upload") {
      return "buyer";
    }
    if (doc.source === "seller_upload") {
      return "seller";
    }
    return "agent";
  }
  return undefined;
}

export function enrichDocumentWithAction(doc: Document): DocumentWithAction {
  return {
    ...doc,
    actionStatus: determineActionStatus(doc),
    category: getDocumentCategory(doc.type),
    waitingOn: determineWaitingOn(doc),
  };
}

export function enrichDocuments(documents: Document[]): DocumentWithAction[] {
  return documents.map(enrichDocumentWithAction);
}

// Group documents by action status within a category
export function groupDocumentsByAction(
  documents: DocumentWithAction[]
): Record<DocumentActionStatus, DocumentWithAction[]> {
  const groups: Record<DocumentActionStatus, DocumentWithAction[]> = {
    sign_required: [],
    review_required: [],
    upload_needed: [],
    complete: [],
    pending_from_title: [],
    pending_from_lender: [],
  };

  documents.forEach((doc) => {
    groups[doc.actionStatus].push(doc);
  });

  return groups;
}

// Get category label for display
export function getCategoryLabel(category: DocumentCategory): string {
  const labels: Record<DocumentCategory, string> = {
    contract: "Contract",
    title: "Title",
    financial: "Financial",
    closing: "Closing",
    due_diligence: "Due Diligence",
  };
  return labels[category];
}

// Get action status label for display
export function getActionStatusLabel(status: DocumentActionStatus): string {
  const labels: Record<DocumentActionStatus, string> = {
    sign_required: "Sign",
    review_required: "Review",
    upload_needed: "Upload Needed",
    complete: "Complete",
    pending_from_title: "Waiting on Title",
    pending_from_lender: "Waiting on Lender",
  };
  return labels[status];
}

// Get waiting on label for display
export function getWaitingOnLabel(party: WaitingOn): string {
  const labels: Record<WaitingOn, string> = {
    title: "Title",
    lender: "Lender",
    agent: "Agent",
    buyer: "Buyer",
    seller: "Seller",
  };
  return labels[party];
}
