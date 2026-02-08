import {
  Transaction,
  TransactionSide,
  Document,
  TimelineEvent,
  ChecklistItem,
  SigningSlot,
  Party,
  ChatMessage,
  TitleCompany,
} from "@/types";

// Title Company
export const mockTitleCompany: TitleCompany = {
  id: "tc_001",
  name: "Contre Title",
  logo: "/logo.svg",
  address: "100 Title Way, Suite 200, Boise, ID 83702",
  phone: "(208) 555-1000",
  email: "closings@contretitle.com",
};

// Sample Transaction
export const mockTransaction: Transaction = {
  id: "tx_505332",
  titleCompanyId: "tc_001",
  qualiaOrderId: "Q-505332",

  property: {
    address: "123 Main St",
    city: "Boise",
    state: "ID",
    zip: "83702",
    legalDescription: "Lot 5, Block 2, Sunrise Addition",
  },

  financials: {
    purchasePrice: 425000,
    earnestMoney: 10000,
    earnestMoneyReceivedDate: "2024-12-05",
    loanAmount: 340000,
    downPayment: 85000,
    loanType: "Conventional",
    isFinanced: true, // Set to false for cash transactions
  },

  dates: {
    contractDate: "2024-12-11",
    closingDate: "2025-01-15",
    signingWindowStart: "2025-01-13",
    signingWindowEnd: "2025-01-17",
  },

  status: "in_progress",
  closingAgentId: "agent_001",
  createdAt: "2024-12-11T10:00:00Z",
  updatedAt: "2024-12-11T14:30:00Z",
};

// Buyer Side
export const mockBuyerSide: TransactionSide = {
  id: "side_buyer_001",
  transactionId: "tx_505332",
  side: "buyer",

  agent: {
    name: "Sarah Johnson",
    email: "sarah@abcrealty.com",
    phone: "(208) 555-9999",
    brokerage: "ABC Realty",
  },

  clients: [
    {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(208) 555-1234",
      address: "456 Oak Ave, Boise, ID 83701",
    },
    {
      name: "Mary Smith",
      email: "mary.smith@email.com",
      phone: "(208) 555-1235",
      address: "456 Oak Ave, Boise, ID 83701",
    },
  ],

  portal: {
    url: "/tx/tx_505332/buyer",
    passwordHash: "hashed_password",
  },

  skyslope: {
    connected: true,
    transactionId: "SS-2024-78432",
    lastSyncAt: "2024-12-11T14:30:00Z",
  },

  signing: {
    status: "awaiting_selection",
  },

  createdAt: "2024-12-11T10:00:00Z",
};

// Seller Side
export const mockSellerSide: TransactionSide = {
  id: "side_seller_001",
  transactionId: "tx_505332",
  side: "seller",

  agent: {
    name: "Mike Williams",
    email: "mike@xyzrealestate.com",
    phone: "(208) 555-8888",
    brokerage: "XYZ Real Estate",
  },

  clients: [
    {
      name: "Jane Doe",
      email: "jane.doe@email.com",
      phone: "(208) 555-5678",
      address: "123 Main St, Boise, ID 83702",
    },
  ],

  portal: {
    url: "/tx/tx_505332/seller",
    passwordHash: "hashed_password",
  },

  skyslope: {
    connected: false,
  },

  signing: {
    status: "awaiting_selection",
  },

  createdAt: "2024-12-11T10:00:00Z",
};

// Documents
export const mockDocuments: Document[] = [
  // Contract Documents
  {
    id: "doc_001",
    transactionId: "tx_505332",
    name: "Purchase Agreement",
    type: "purchase_agreement",
    filePath: "/documents/psa.pdf",
    source: "buyer_upload",
    routing: { toBuyer: true, toSeller: true },
    processing: {
      status: "processed",
      reportPath: "/reports/psa-report.html",
      processedAt: "2024-12-11T11:00:00Z",
    },
    skyslope: { pushedToBuyer: true, pushedToSeller: false },
    uploadedAt: "2024-12-11T10:30:00Z",
  },
  {
    id: "doc_002",
    transactionId: "tx_505332",
    name: "RE-11 Addendum",
    type: "addendum",
    filePath: "/documents/addendum-re11.pdf",
    source: "buyer_upload",
    routing: { toBuyer: true, toSeller: true },
    processing: {
      status: "processed",
      processedAt: "2024-12-11T12:00:00Z",
    },
    skyslope: { pushedToBuyer: true, pushedToSeller: false },
    uploadedAt: "2024-12-11T11:30:00Z",
  },
  {
    id: "doc_003",
    transactionId: "tx_505332",
    name: "505332 Earnest Money Receipt",
    type: "earnest_money_receipt",
    filePath: "/documents/em-receipt.pdf",
    source: "title_created",
    routing: { toBuyer: true, toSeller: true },
    processing: {
      status: "processed",
      processedAt: "2024-12-08T10:00:00Z",
    },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "2024-12-08T09:00:00Z",
  },

  // Title Documents
  {
    id: "doc_004",
    transactionId: "tx_505332",
    name: "505332 Title Commitment",
    type: "title_commitment",
    filePath: "/documents/title-commitment.pdf",
    source: "title_created",
    routing: { toBuyer: true, toSeller: true },
    processing: {
      status: "processed",
      reportPath: "/reports/title-commitment-report.html",
      processedAt: "2024-12-10T14:30:00Z",
    },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "2024-12-10T12:00:00Z",
  },
  {
    id: "doc_005",
    transactionId: "tx_505332",
    name: "Preliminary Title Report",
    type: "preliminary_title_report",
    filePath: "/documents/prelim-report.pdf",
    source: "title_created",
    routing: { toBuyer: true, toSeller: true },
    processing: {
      status: "processed",
      processedAt: "2024-12-09T16:00:00Z",
    },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "2024-12-09T15:00:00Z",
  },
  {
    id: "doc_006",
    transactionId: "tx_505332",
    name: "Deed",
    type: "deed",
    filePath: "",
    source: "title_created",
    routing: { toBuyer: true, toSeller: true },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },
  {
    id: "doc_007",
    transactionId: "tx_505332",
    name: "Title Policy",
    type: "title_policy",
    filePath: "",
    source: "title_created",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },

  // Financial Documents
  {
    id: "doc_008",
    transactionId: "tx_505332",
    name: "Settlement Statement (Buyer)",
    type: "settlement_statement_buyer",
    filePath: "",
    source: "title_created",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },
  {
    id: "doc_009",
    transactionId: "tx_505332",
    name: "Wire Instructions",
    type: "wire_instructions",
    filePath: "",
    source: "title_created",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },
  {
    id: "doc_010",
    transactionId: "tx_505332",
    name: "Closing Disclosure",
    type: "closing_disclosure",
    filePath: "",
    source: "qualia",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },
  {
    id: "doc_011",
    transactionId: "tx_505332",
    name: "Loan Approval Letter",
    type: "loan_approval",
    filePath: "",
    source: "buyer_upload",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },
  {
    id: "doc_012",
    transactionId: "tx_505332",
    name: "Appraisal Report",
    type: "appraisal",
    filePath: "",
    source: "buyer_upload",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },

  // Closing Documents
  {
    id: "doc_013",
    transactionId: "tx_505332",
    name: "Home Inspection Report",
    type: "inspection_report",
    filePath: "",
    source: "buyer_upload",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },
  {
    id: "doc_014",
    transactionId: "tx_505332",
    name: "Homeowners Insurance Binder",
    type: "insurance_binder",
    filePath: "",
    source: "buyer_upload",
    routing: { toBuyer: true, toSeller: false },
    processing: { status: "pending" },
    skyslope: { pushedToBuyer: false, pushedToSeller: false },
    uploadedAt: "",
  },
];

// Timeline Events
export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "evt_001",
    transactionId: "tx_505332",
    date: "2024-12-11",
    title: "Contract Accepted",
    status: "complete",
    source: { document: "Purchase Agreement", section: "§1" },
    completedAt: "2024-12-11T10:00:00Z",
  },
  {
    id: "evt_002",
    transactionId: "tx_505332",
    date: "2024-12-14",
    title: "Earnest Money Due",
    status: "complete",
    source: { document: "Purchase Agreement", section: "§3" },
    completedAt: "2024-12-14T09:00:00Z",
  },
  {
    id: "evt_003",
    transactionId: "tx_505332",
    date: "2024-12-21",
    title: "Inspection Deadline",
    status: "upcoming",
    daysRemaining: 10,
    source: { document: "Purchase Agreement", section: "§8" },
  },
  {
    id: "evt_004",
    transactionId: "tx_505332",
    date: "2024-12-28",
    title: "Appraisal Due",
    status: "pending",
    daysRemaining: 17,
    source: { document: "Purchase Agreement", section: "§9" },
  },
  {
    id: "evt_005",
    transactionId: "tx_505332",
    date: "2025-01-05",
    title: "Loan Contingency",
    status: "pending",
    daysRemaining: 25,
    source: { document: "Purchase Agreement", section: "§10" },
  },
  {
    id: "evt_006",
    transactionId: "tx_505332",
    date: "2025-01-15",
    title: "Closing",
    status: "pending",
    daysRemaining: 35,
    source: { document: "Purchase Agreement", section: "§2" },
  },
];

// Checklist Items
export const mockChecklistItems: ChecklistItem[] = [
  // Contract & Earnest Money
  {
    id: "chk_001",
    transactionId: "tx_505332",
    side: "both",
    category: "contract_earnest_money",
    title: "Purchase Agreement received",
    order: 1,
    complete: true,
    completedAt: "2024-12-11T10:00:00Z",
  },
  {
    id: "chk_002",
    transactionId: "tx_505332",
    side: "both",
    category: "contract_earnest_money",
    title: "Earnest money deposited",
    order: 2,
    complete: true,
    completedAt: "2024-12-14T09:00:00Z",
  },
  {
    id: "chk_003",
    transactionId: "tx_505332",
    side: "both",
    category: "contract_earnest_money",
    title: "Earnest money receipt issued",
    order: 3,
    complete: true,
    completedAt: "2024-12-14T10:00:00Z",
  },

  // Title
  {
    id: "chk_004",
    transactionId: "tx_505332",
    side: "both",
    category: "title",
    title: "Title search completed",
    order: 1,
    complete: true,
    completedAt: "2024-12-10T14:00:00Z",
  },
  {
    id: "chk_005",
    transactionId: "tx_505332",
    side: "both",
    category: "title",
    title: "Title commitment issued",
    order: 2,
    complete: true,
    completedAt: "2024-12-10T14:30:00Z",
  },
  {
    id: "chk_006",
    transactionId: "tx_505332",
    side: "both",
    category: "title",
    title: "Title exceptions cleared",
    order: 3,
    complete: false,
    waitingOn: "title",
  },

  // Inspection
  {
    id: "chk_007",
    transactionId: "tx_505332",
    side: "buyer",
    category: "inspection_due_diligence",
    title: "Home inspection completed",
    order: 1,
    complete: false,
    waitingOn: "buyer",
  },
  {
    id: "chk_008",
    transactionId: "tx_505332",
    side: "buyer",
    category: "inspection_due_diligence",
    title: "Inspection response submitted",
    order: 2,
    complete: false,
    waitingOn: "agent",
  },

  // Financing
  {
    id: "chk_009",
    transactionId: "tx_505332",
    side: "buyer",
    category: "financing",
    title: "Appraisal ordered",
    order: 1,
    complete: false,
    waitingOn: "lender",
  },
  {
    id: "chk_010",
    transactionId: "tx_505332",
    side: "buyer",
    category: "financing",
    title: "Appraisal completed",
    order: 2,
    complete: false,
    waitingOn: "lender",
  },
  {
    id: "chk_011",
    transactionId: "tx_505332",
    side: "buyer",
    category: "financing",
    title: "Loan approved",
    order: 3,
    complete: false,
    waitingOn: "lender",
  },

  // Closing Prep
  {
    id: "chk_012",
    transactionId: "tx_505332",
    side: "buyer",
    category: "closing_prep",
    title: "Settlement statement reviewed",
    order: 1,
    complete: false,
    waitingOn: "title",
  },
  {
    id: "chk_013",
    transactionId: "tx_505332",
    side: "buyer",
    category: "closing_prep",
    title: "Signing appointment scheduled",
    order: 2,
    complete: false,
    waitingOn: "agent",
  },

  // Closing
  {
    id: "chk_014",
    transactionId: "tx_505332",
    side: "buyer",
    category: "closing",
    title: "Documents signed",
    order: 1,
    complete: false,
  },
  {
    id: "chk_015",
    transactionId: "tx_505332",
    side: "buyer",
    category: "closing",
    title: "Funds wired",
    order: 2,
    complete: false,
  },
  {
    id: "chk_016",
    transactionId: "tx_505332",
    side: "buyer",
    category: "closing",
    title: "Transaction closed",
    order: 3,
    complete: false,
  },
];

// Signing Slots
export const mockSigningSlots: SigningSlot[] = [
  // Monday 1/13
  { id: "slot_001", transactionId: "tx_505332", dateTime: "2025-01-13T09:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_002", transactionId: "tx_505332", dateTime: "2025-01-13T10:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_003", transactionId: "tx_505332", dateTime: "2025-01-13T14:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  // Tuesday 1/14
  { id: "slot_004", transactionId: "tx_505332", dateTime: "2025-01-14T09:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_005", transactionId: "tx_505332", dateTime: "2025-01-14T14:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_006", transactionId: "tx_505332", dateTime: "2025-01-14T15:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  // Thursday 1/16
  { id: "slot_007", transactionId: "tx_505332", dateTime: "2025-01-16T09:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_008", transactionId: "tx_505332", dateTime: "2025-01-16T10:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_009", transactionId: "tx_505332", dateTime: "2025-01-16T11:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_010", transactionId: "tx_505332", dateTime: "2025-01-16T14:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  // Friday 1/17
  { id: "slot_011", transactionId: "tx_505332", dateTime: "2025-01-17T10:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_012", transactionId: "tx_505332", dateTime: "2025-01-17T11:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
  { id: "slot_013", transactionId: "tx_505332", dateTime: "2025-01-17T14:00:00", method: "in_person", available: true, createdAt: "2024-12-10T00:00:00Z" },
];

// Parties
export const mockParties: Party[] = [
  {
    id: "party_001",
    transactionId: "tx_505332",
    role: "buyer",
    name: "John Smith",
    contact: {
      phone: "(208) 555-1234",
      email: "john.smith@email.com",
      address: "456 Oak Ave, Boise, ID 83701",
    },
  },
  {
    id: "party_002",
    transactionId: "tx_505332",
    role: "buyer",
    name: "Mary Smith",
    contact: {
      phone: "(208) 555-1235",
      email: "mary.smith@email.com",
      address: "456 Oak Ave, Boise, ID 83701",
    },
  },
  {
    id: "party_003",
    transactionId: "tx_505332",
    role: "seller",
    name: "Jane Doe",
    contact: {
      phone: "(208) 555-5678",
      email: "jane.doe@email.com",
      address: "123 Main St, Boise, ID 83702",
    },
  },
  {
    id: "party_004",
    transactionId: "tx_505332",
    role: "buyer_agent",
    name: "Sarah Johnson",
    company: "ABC Realty",
    contact: {
      phone: "(208) 555-9999",
      email: "sarah@abcrealty.com",
    },
  },
  {
    id: "party_005",
    transactionId: "tx_505332",
    role: "seller_agent",
    name: "Mike Williams",
    company: "XYZ Real Estate",
    contact: {
      phone: "(208) 555-8888",
      email: "mike@xyzrealestate.com",
    },
  },
  {
    id: "party_006",
    transactionId: "tx_505332",
    role: "lender",
    name: "Tom Brown",
    company: "First National Bank",
    contact: {
      phone: "(208) 555-7777",
      email: "tbrown@firstnational.com",
    },
  },
  {
    id: "party_007",
    transactionId: "tx_505332",
    role: "title_closer",
    name: "Emily Davis",
    company: "Contre Title",
    contact: {
      phone: "(208) 555-1000",
      email: "emily@contretitle.com",
    },
  },
];

// Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg_001",
    transactionId: "tx_505332",
    side: "buyer",
    role: "user",
    content: "When is the inspection deadline?",
    createdAt: "2024-12-11T15:00:00Z",
  },
  {
    id: "msg_002",
    transactionId: "tx_505332",
    side: "buyer",
    role: "assistant",
    content: "The inspection deadline is December 21, 2024, which is 10 days from contract acceptance.",
    source: {
      documentName: "Purchase Agreement",
      section: "Section 8",
    },
    createdAt: "2024-12-11T15:00:05Z",
  },
];

// Suggested Questions for Chat
export const mockSuggestedQuestions = [
  "What contingencies apply to this transaction?",
  "Who pays for title insurance?",
  "What items are included in the sale?",
  "When is the closing date?",
  "What is the earnest money amount?",
  "What are the loan terms?",
];

// Helper function to calculate days remaining
export function calculateDaysRemaining(targetDate: string): number {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Helper function to format short date
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
