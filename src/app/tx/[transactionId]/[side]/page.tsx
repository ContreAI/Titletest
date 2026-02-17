"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  Header,
  TabNavigation,
  PageContainer,
  AmbientBackground,
} from "@/components/layout";
import { TabId, TransactionTask, NetProceedsEstimate } from "@/types";
import {
  mockTransaction,
  mockTitleCompany,
  mockDocuments,
  mockBuyerSide,
  mockSellerSide,
} from "@/data/mockData";
import { useAuth, logout } from "@/hooks";
import { Loader2 } from "lucide-react";
import { NotificationSettings } from "@/components/settings";
import { BUYER_TABS, SELLER_TABS } from "@/lib/tabConfigs";
import { ChatProvider } from "@/components/chat";
import { BUYER_TASKS } from "@/data/buyerTasksMockData";
import { sellerTasks as SELLER_TASKS_DATA } from "@/data/sellerTasksMockData";

// Buyer tab components
import BuyerDashboardTab from "@/components/tabs/BuyerDashboardTab";
import BuyerTasksTab from "@/components/tabs/BuyerTasksTab";
import BuyerDocumentsTab from "@/components/tabs/BuyerDocumentsTab";
import BuyerClosingTab from "@/components/tabs/BuyerClosingTab";

// Seller tab components
import SellerDashboardTab from "@/components/tabs/SellerDashboardTab";
import SellerClosingTab from "@/components/tabs/SellerClosingTab";

import { MiniJourneyTracker } from "@/components/journey";
import { TransactionPhase } from "@/types";
import { getTaskCounts } from "@/stores/taskStore";

// Inline subsets below are kept for reference but overridden by full spec data
const MOCK_BUYER_TASKS: TransactionTask[] = [
  {
    id: "B-01", side: "buyer", phase: 1, phaseName: "Escrow Opening",
    title: "Acknowledge receipt of escrow opening letter",
    description: "Review and acknowledge receipt of the escrow opening letter from the title company.",
    whoActs: "Buyer", documentRequired: "Escrow Letter (from Escrow)", portalAction: "acknowledge",
    dueExpression: "Day 1", status: "completed", dependsOn: [], blocks: ["B-02"],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "escrow_letter",
    completedDate: "2024-12-04", order: 1,
  },
  {
    id: "B-02", side: "buyer", phase: 1, phaseName: "Escrow Opening",
    title: "Download wire instructions for earnest money deposit",
    description: "Download the secure wire instructions from the portal for your earnest money deposit.",
    whoActs: "Buyer", documentRequired: "Wire Instructions (from Escrow)", portalAction: "download",
    dueExpression: "Day 1", status: "completed", dependsOn: ["B-01"], blocks: ["B-03"],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "wire_instructions",
    completedDate: "2024-12-04", order: 2,
  },
  {
    id: "B-03", side: "buyer", phase: 1, phaseName: "Escrow Opening",
    title: "Upload earnest money wire confirmation",
    description: "Upload the wire confirmation receipt showing your earnest money has been sent.",
    whoActs: "Buyer", documentRequired: "Wire Confirmation (upload)", portalAction: "upload_pay",
    dueExpression: "Day 1-3", status: "completed", dependsOn: ["B-02"], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "earnest_money_receipt",
    completedDate: "2024-12-05", order: 3,
  },
  {
    id: "B-04", side: "buyer", phase: 1, phaseName: "Escrow Opening",
    title: "Acknowledge wire fraud advisory",
    description: "Read and acknowledge the wire fraud advisory provided by the title company.",
    whoActs: "Buyer", documentRequired: "Wire Fraud Advisory (from Escrow)", portalAction: "acknowledge",
    dueExpression: "Day 1", status: "completed", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "wire_fraud_advisory",
    completedDate: "2024-12-04", order: 4,
  },
  {
    id: "B-05", side: "buyer", phase: 1, phaseName: "Escrow Opening",
    title: "Upload vesting instructions",
    description: "Submit your vesting instructions indicating how you want to hold title to the property.",
    whoActs: "Buyer", documentRequired: "Vesting Instructions (upload/form)", portalAction: "upload_form",
    dueExpression: "Day 1-5", status: "completed", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "vesting_instructions",
    completedDate: "2024-12-06", order: 5,
  },
  {
    id: "B-09", side: "buyer", phase: 2, phaseName: "Inspections & Due Diligence",
    title: "Download and review title commitment",
    description: "Review the title commitment report showing liens, easements, and exceptions.",
    whoActs: "Buyer", documentRequired: "Title Commitment (from Escrow)", portalAction: "download",
    dueExpression: "Day 5-12", status: "action_required", dependsOn: [], blocks: ["B-10"],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "title_commitment", order: 1,
  },
  {
    id: "B-10", side: "buyer", phase: 2, phaseName: "Inspections & Due Diligence",
    title: "Upload inspection report",
    description: "Upload the home inspection report after the inspection is completed.",
    whoActs: "Buyer", documentRequired: "Inspection Report (upload)", portalAction: "upload",
    dueExpression: "Day 7-15", status: "action_required", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "inspection_report", order: 2,
  },
  {
    id: "B-11", side: "buyer", phase: 2, phaseName: "Inspections & Due Diligence",
    title: "Review seller disclosures",
    description: "Review and acknowledge the seller's property disclosure statements.",
    whoActs: "Buyer", documentRequired: "Seller Disclosures (from Seller)", portalAction: "review_approve",
    dueExpression: "Day 5-10", status: "not_started", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "sellers_disclosure", order: 3,
  },
  {
    id: "B-15", side: "buyer", phase: 3, phaseName: "Financing & Insurance",
    title: "Upload homeowners insurance binder",
    description: "Upload your homeowners insurance binder showing coverage effective on or before closing.",
    whoActs: "Buyer", documentRequired: "Insurance Binder (upload)", portalAction: "upload",
    dueExpression: "Pre-close", status: "not_started", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "insurance_binder", order: 1,
  },
  {
    id: "B-16", side: "buyer", phase: 3, phaseName: "Financing & Insurance",
    title: "Review owner's title insurance quote",
    description: "Review the owner's title insurance quote and coverage details.",
    whoActs: "Buyer", documentRequired: "Title Insurance Quote (from Escrow)", portalAction: "review_approve",
    dueExpression: "Day 10-20", status: "not_started", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "owners_title_insurance_quote", order: 2,
  },
  {
    id: "B-20", side: "buyer", phase: 4, phaseName: "Pre-Closing",
    title: "Review and e-sign closing disclosure",
    description: "Review and electronically sign the Closing Disclosure. TRID requires 3 business days before closing.",
    whoActs: "Buyer", documentRequired: "Closing Disclosure (from Escrow)", portalAction: "e_sign",
    dueExpression: "3+ biz days pre-close", status: "locked", dependsOn: ["B-15"], blocks: ["B-21"],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "closing_disclosure", order: 1,
  },
  {
    id: "B-21", side: "buyer", phase: 4, phaseName: "Pre-Closing",
    title: "Download final wire instructions for closing funds",
    description: "Download the secure wire instructions for your closing funds.",
    whoActs: "Buyer", documentRequired: "Wire Instructions (from Escrow)", portalAction: "download",
    dueExpression: "Pre-close", status: "locked", dependsOn: ["B-20"], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "wire_instructions", order: 2,
  },
  {
    id: "B-23", side: "buyer", phase: 5, phaseName: "Closing Day",
    title: "Confirm final walkthrough completed",
    description: "Confirm that the final walkthrough of the property has been completed satisfactorily.",
    whoActs: "Buyer", documentRequired: "Walkthrough Confirmation (from Agent)", portalAction: "acknowledge",
    dueExpression: "Closing Day", status: "locked", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "walkthrough_confirmation", order: 1,
  },
  {
    id: "B-24", side: "buyer", phase: 5, phaseName: "Closing Day",
    title: "e-Sign closing documents",
    description: "Review and electronically sign all closing documents.",
    whoActs: "Buyer", documentRequired: "Closing Package (from Escrow)", portalAction: "e_sign",
    dueExpression: "Closing Day", status: "locked", dependsOn: ["B-23"], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "signed_closing_package", order: 2,
  },
  {
    id: "B-30", side: "buyer", phase: 6, phaseName: "Post-Closing",
    title: "Download recorded deed",
    description: "Download your recorded deed once it's been returned from the county recorder.",
    whoActs: "Buyer", documentRequired: "Recorded Deed (from Escrow)", portalAction: "download",
    dueExpression: "7-60 days post", status: "locked", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "recorded_deed", order: 1,
  },
  {
    id: "B-31", side: "buyer", phase: 6, phaseName: "Post-Closing",
    title: "Download owner's title insurance policy",
    description: "Download your owner's title insurance policy once it has been issued.",
    whoActs: "Buyer", documentRequired: "Title Policy (from Escrow)", portalAction: "download",
    dueExpression: "30-90 days post", status: "locked", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "owners_title_policy", order: 2,
  },
];

const MOCK_SELLER_TASKS: TransactionTask[] = [
  {
    id: "S-01", side: "seller", phase: 1, phaseName: "Escrow Opening",
    title: "Acknowledge receipt of escrow opening letter",
    description: "Review and acknowledge receipt of the escrow opening letter.",
    whoActs: "Seller", documentRequired: "Escrow Letter (from Escrow)", portalAction: "acknowledge",
    dueExpression: "Day 1", status: "completed", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "escrow_letter",
    completedDate: "2024-12-04", order: 1,
  },
  {
    id: "S-02", side: "seller", phase: 1, phaseName: "Escrow Opening",
    title: "Provide mortgage/lien information",
    description: "Provide your mortgage lender name, loan number, and contact information for payoff processing.",
    whoActs: "Seller", documentRequired: "Lender Info (form)", portalAction: "upload_form",
    dueExpression: "Day 1-3", status: "action_required", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, order: 2,
  },
  {
    id: "S-05", side: "seller", phase: 1, phaseName: "Escrow Opening",
    title: "Upload completed seller information sheet",
    description: "Complete and upload the seller information sheet with your contact and forwarding details.",
    whoActs: "Seller", documentRequired: "Seller Info Sheet (upload)", portalAction: "upload",
    dueExpression: "Day 1-5", status: "action_required", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "seller_info_sheet", order: 3,
  },
  {
    id: "S-06", side: "seller", phase: 2, phaseName: "Disclosures & Compliance",
    title: "Upload completed seller's disclosure statement",
    description: "Complete and upload the Seller's Real Property Disclosure Statement.",
    whoActs: "Seller", documentRequired: "Seller Disclosure (upload)", portalAction: "upload",
    dueExpression: "Day 3-7", status: "action_required", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "sellers_disclosure", order: 1,
  },
  {
    id: "S-07", side: "seller", phase: 2, phaseName: "Disclosures & Compliance",
    title: "Upload lead-based paint disclosure (pre-1978 homes)",
    description: "Complete and upload the lead-based paint disclosure form required for homes built before 1978.",
    whoActs: "Seller", documentRequired: "Lead Paint Disclosure (upload)", portalAction: "upload",
    dueExpression: "Day 3-7", status: "not_started", dependsOn: [], blocks: [],
    isConditional: true, conditionKey: "yearBuilt", isCommercialOnly: false,
    linkedDocumentType: "lead_paint_disclosure", order: 2,
  },
  {
    id: "S-08", side: "seller", phase: 2, phaseName: "Disclosures & Compliance",
    title: "Upload HOA documents (if applicable)",
    description: "Provide HOA documents including CC&Rs, bylaws, financials, and meeting minutes.",
    whoActs: "Seller", documentRequired: "HOA Docs (upload)", portalAction: "upload",
    dueExpression: "Day 3-10", status: "not_started", dependsOn: [], blocks: [],
    isConditional: true, conditionKey: "hasHOA", isCommercialOnly: false,
    linkedDocumentType: "hoa_documents", order: 3,
  },
  {
    id: "S-11", side: "seller", phase: 3, phaseName: "Inspections",
    title: "Review buyer's repair request and respond",
    description: "Review the buyer's repair request from their inspection and respond to each item.",
    whoActs: "Seller", documentRequired: "Repair Request (from Buyer Agent)", portalAction: "review_approve",
    dueExpression: "Per contract", status: "action_required", dependsOn: [], blocks: ["S-12"],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "repair_addendum", order: 1,
  },
  {
    id: "S-12", side: "seller", phase: 3, phaseName: "Inspections",
    title: "Upload repair receipts (if applicable)",
    description: "Upload receipts for completed repairs as agreed in the repair addendum.",
    whoActs: "Seller", documentRequired: "Repair Receipts (upload)", portalAction: "upload",
    dueExpression: "Pre-close", status: "locked", dependsOn: ["S-11"], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "repair_receipts", order: 2,
  },
  {
    id: "S-13", side: "seller", phase: 3, phaseName: "Inspections",
    title: "Review title commitment Schedule B-I obligations",
    description: "Review the title commitment's Schedule B-I items that require seller action before closing.",
    whoActs: "Seller", documentRequired: "Title Commitment (from Escrow)", portalAction: "review_approve",
    dueExpression: "Day 10-20", status: "not_started", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "title_commitment", order: 3,
  },
  {
    id: "S-17", side: "seller", phase: 4, phaseName: "Pre-Closing",
    title: "Review and e-sign seller closing disclosure",
    description: "Review your side of the Closing Disclosure and sign electronically.",
    whoActs: "Seller", documentRequired: "Seller CD (from Escrow)", portalAction: "e_sign",
    dueExpression: "Pre-close", status: "locked", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "settlement_statement_seller", order: 1,
  },
  {
    id: "S-19", side: "seller", phase: 5, phaseName: "Closing Day",
    title: "e-Sign closing documents",
    description: "Review and sign all seller closing documents.",
    whoActs: "Seller", documentRequired: "Closing Package (from Escrow)", portalAction: "e_sign",
    dueExpression: "Closing Day", status: "locked", dependsOn: ["S-17"], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "signed_closing_package", order: 1,
  },
  {
    id: "S-22", side: "seller", phase: 5, phaseName: "Closing Day",
    title: "Deliver keys, garage openers, access codes",
    description: "Deliver all keys, garage door openers, gate remotes, and access codes at closing.",
    whoActs: "Seller", documentRequired: "Acknowledgment", portalAction: "acknowledge",
    dueExpression: "Closing Day", status: "locked", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, order: 2,
  },
  {
    id: "S-23", side: "seller", phase: 6, phaseName: "Post-Closing",
    title: "Confirm net proceeds wire received",
    description: "Confirm that your net proceeds wire has been received in your bank account.",
    whoActs: "Seller", documentRequired: "Wire Confirmation (from bank)", portalAction: "acknowledge",
    dueExpression: "1-2 days post", status: "locked", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "proceeds_wire_confirmation", order: 1,
  },
  {
    id: "S-25", side: "seller", phase: 6, phaseName: "Post-Closing",
    title: "Download 1099-S tax form",
    description: "Download your 1099-S tax form reporting the sale proceeds for tax purposes.",
    whoActs: "Seller", documentRequired: "1099-S (from Escrow)", portalAction: "download",
    dueExpression: "By Jan 31", status: "locked", dependsOn: [], blocks: [],
    isConditional: false, isCommercialOnly: false, linkedDocumentType: "form_1099s", order: 2,
  },
];

// Mock net proceeds for seller
const MOCK_NET_PROCEEDS: NetProceedsEstimate = {
  purchasePrice: 425000,
  deductions: [
    { id: "payoff-1", label: "First Mortgage Payoff", amount: 198500, isEstimate: false, category: "payoff", tooltip: "Payoff amount as of estimated closing date, including per-diem interest." },
    { id: "comm-buyer", label: "Buyer Agent Commission (3%)", amount: 12750, isEstimate: false, category: "commission" },
    { id: "comm-seller", label: "Seller Agent Commission (3%)", amount: 12750, isEstimate: false, category: "commission" },
    { id: "title-ins", label: "Owner's Title Insurance", amount: 1850, isEstimate: true, category: "fee" },
    { id: "escrow-fee", label: "Escrow Fee", amount: 1200, isEstimate: true, category: "fee" },
    { id: "recording", label: "Recording Fees", amount: 150, isEstimate: true, category: "fee" },
    { id: "tax-prorate", label: "Property Tax Proration", amount: 1800, isEstimate: true, category: "proration", tooltip: "Prorated property taxes from Jan 1 to closing date." },
    { id: "hoa-prorate", label: "HOA Proration", amount: 450, isEstimate: true, category: "proration" },
  ],
  totalDeductions: 229450,
  estimatedNet: 195550,
  disclaimer: "This is a preliminary estimate. Actual amounts may vary based on the final closing date, payoff amounts, and other factors. Final figures will be on your Closing Disclosure.",
  lastUpdated: new Date().toISOString(),
};

export default function PortalPage() {
  const params = useParams();
  const transactionId = params.transactionId as string;
  const side = params.side as "buyer" | "seller";

  const { isAuthenticated, isLoading } = useAuth({ transactionId, side });
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // For demo, we use mock data based on side
  const transaction = mockTransaction;
  const titleCompany = mockTitleCompany;
  const transactionSide = side === "buyer" ? mockBuyerSide : mockSellerSide;
  // Use full spec-aligned data (B-01 to B-35, S-01 to S-27) from data files
  const tasks = side === "buyer" ? BUYER_TASKS : SELLER_TASKS_DATA;

  // Tab configuration based on side
  const tabs = side === "buyer" ? BUYER_TABS : SELLER_TABS;

  // Calculate pending counts from tasks
  const taskCounts = useMemo(() => getTaskCounts(tasks), [tasks]);
  const pendingCounts: Partial<Record<TabId, number>> = useMemo(() => ({
    tasks: taskCounts.actionRequired + taskCounts.overdue,
    documents: 0,
  }), [taskCounts]);

  const signingNeeded = transactionSide.signing.status === "awaiting_selection";

  // Journey tracker data — in production from API
  const journeyData = {
    currentPhase: "financing" as TransactionPhase,
    percentComplete: 68,
    isFinanced: transaction.financials.isFinanced,
    phaseAlerts: {
      financing: {
        level: "error" as const,
        message: "Lender docs not received",
        daysOverdue: 2,
      },
    },
  };

  const handlePhaseClick = (phase: TransactionPhase) => {
    const phaseToTab: Record<TransactionPhase, TabId> = {
      contract: "tasks",
      title: "tasks",
      financing: "tasks",
      clear_to_close: "closing",
      closed: "closing",
    };
    setActiveTab(phaseToTab[phase]);
  };

  const handleLogout = () => {
    logout(transactionId, side);
  };

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  const handleTaskAction = (task: TransactionTask) => {
    console.log("Task action:", task.id, task.portalAction);
  };

  // Unified tab rendering — both buyer and seller share the same 4-tab structure
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return side === "buyer" ? (
          <BuyerDashboardTab
            transaction={transaction}
            tasks={tasks}
            onTabChange={handleTabChange}
            onTaskAction={handleTaskAction}
          />
        ) : (
          <SellerDashboardTab
            transaction={transaction}
            tasks={tasks}
            netProceeds={MOCK_NET_PROCEEDS}
            onTabChange={handleTabChange}
            onTaskAction={handleTaskAction}
          />
        );
      case "tasks":
        return <BuyerTasksTab tasks={tasks} onTaskAction={handleTaskAction} />;
      case "documents":
        return <BuyerDocumentsTab documents={mockDocuments} side={side} />;
      case "closing":
        return side === "buyer" ? (
          <BuyerClosingTab
            transaction={transaction}
            tasks={tasks}
            onTaskAction={handleTaskAction}
            onTabChange={handleTabChange}
          />
        ) : (
          <SellerClosingTab
            transaction={transaction}
            tasks={tasks}
            onTaskAction={handleTaskAction}
            onTabChange={handleTabChange}
          />
        );
      default:
        return side === "buyer" ? (
          <BuyerDashboardTab
            transaction={transaction}
            tasks={tasks}
            onTabChange={handleTabChange}
            onTaskAction={handleTaskAction}
          />
        ) : (
          <SellerDashboardTab
            transaction={transaction}
            tasks={tasks}
            netProceeds={MOCK_NET_PROCEEDS}
            onTabChange={handleTabChange}
            onTaskAction={handleTaskAction}
          />
        );
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-royal animate-spin mx-auto mb-4" />
          <p className="text-river-stone">Loading portal...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the hook will redirect to login
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ChatProvider persona="client" transactionId={transactionId} side={side}>
    <div className="min-h-screen bg-transparent relative z-0">
      <AmbientBackground persona="client" />
      {/* All content above ambient bg */}
      <div className="relative z-10 min-h-screen flex flex-col">
      <Header
        logo={titleCompany.logo}
        companyName={titleCompany.name}
        transaction={transaction}
        side={side}
        onSettingsClick={() => setShowNotificationSettings(true)}
        onHelpClick={() => window.open(`mailto:${titleCompany.email}?subject=Help with Transaction ${transactionId}`, "_blank")}
        onLogoutClick={handleLogout}
      />

      {/* Persistent Journey Tracker - visible on all tabs */}
      <MiniJourneyTracker
        currentPhase={journeyData.currentPhase}
        percentComplete={journeyData.percentComplete}
        closingDate={transaction.dates.closingDate}
        isFinanced={journeyData.isFinanced}
        phaseAlerts={journeyData.phaseAlerts}
        onPhaseClick={handlePhaseClick}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={tabs}
        pendingCounts={pendingCounts}
        signingNeeded={signingNeeded}
      />

      <main>
        <PageContainer>
          <div key={activeTab} className="tab-content">
            {renderTabContent()}
          </div>
        </PageContainer>
      </main>

      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
      </div>
    </div>
    </ChatProvider>
  );
}
