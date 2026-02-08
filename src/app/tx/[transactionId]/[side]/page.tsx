"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Header,
  TabNavigation,
  PageContainer,
} from "@/components/layout";
import { TabId } from "@/types";
import {
  mockTransaction,
  mockTitleCompany,
  mockDocuments,
  mockBuyerSide,
  mockSellerSide,
  mockChecklistItems,
} from "@/data/mockData";
import { useAuth, logout } from "@/hooks";
import { Loader2 } from "lucide-react";
import { NotificationSettings } from "@/components/settings";
import { enrichDocuments, getDocumentsByCategory } from "@/lib/documentCategories";

// Tab content components - new structure
import DashboardTab from "@/components/tabs/DashboardTab";
import ContractTab from "@/components/tabs/ContractTab";
import TitleTab from "@/components/tabs/TitleTab";
import FinancialTab from "@/components/tabs/FinancialTab";
import ClosingTab from "@/components/tabs/ClosingTab";
import { MiniJourneyTracker } from "@/components/journey";
import { TransactionPhase } from "@/types";

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

  // Calculate pending counts per category
  const enrichedDocs = enrichDocuments(mockDocuments);
  const pendingCounts: Record<TabId, number> = {
    dashboard: 0,
    contract: enrichedDocs.filter(
      (d) => d.category === "contract" && d.actionStatus !== "complete"
    ).length,
    title: enrichedDocs.filter(
      (d) => d.category === "title" && d.actionStatus !== "complete"
    ).length,
    financial: enrichedDocs.filter(
      (d) => d.category === "financial" && d.actionStatus !== "complete"
    ).length,
    closing: enrichedDocs.filter(
      (d) => d.category === "closing" && d.actionStatus !== "complete"
    ).length,
  };

  const signingNeeded = transactionSide.signing.status === "awaiting_selection";

  const fullAddress = `${transaction.property.address}, ${transaction.property.city} ${transaction.property.state} ${transaction.property.zip}`;

  // Journey tracker data - in production, this would come from API
  const journeyData = {
    currentPhase: "financing" as TransactionPhase,
    percentComplete: 68,
    isFinanced: transaction.financials.isFinanced,
    // Demo alert: lender docs not received with 5 days to close
    phaseAlerts: {
      financing: {
        level: "error" as const,
        message: "Lender docs not received",
        daysOverdue: 2,
      },
    },
  };

  // Handle phase click from mini tracker
  const handlePhaseClick = (phase: TransactionPhase) => {
    const phaseToTab: Record<TransactionPhase, TabId> = {
      contract: "contract",
      title: "title",
      financing: "financial",
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            transaction={transaction}
            side={side}
            onTabChange={handleTabChange}
          />
        );
      case "contract":
        return <ContractTab transaction={transaction} side={side} />;
      case "title":
        return <TitleTab transaction={transaction} side={side} />;
      case "financial":
        return <FinancialTab transaction={transaction} side={side} />;
      case "closing":
        return <ClosingTab transaction={transaction} side={side} />;
      default:
        return (
          <DashboardTab
            transaction={transaction}
            side={side}
            onTabChange={handleTabChange}
          />
        );
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-mist flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-spruce animate-spin mx-auto mb-4" />
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
    <div className="min-h-screen bg-mist">
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
  );
}
