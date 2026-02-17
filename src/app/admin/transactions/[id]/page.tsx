"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import TransactionDetailHeader from "@/components/admin/transactions/TransactionDetailHeader";
import DualSidedTaskTracker from "@/components/admin/transactions/DualSidedTaskTracker";
import DeliverableMatrix from "@/components/admin/transactions/DeliverableMatrix";
import TRIDComplianceWidget from "@/components/admin/transactions/TRIDComplianceWidget";
import { Card } from "@/components/common";
import { mockAdminTransactions } from "@/data/adminMockData";
import { BUYER_TASKS } from "@/data/buyerTasksMockData";
import { sellerTasks } from "@/data/sellerTasksMockData";
import { SHARED_DELIVERABLES } from "@/data/deliverablesMockData";
import type { TransactionTask } from "@/types";
import type { DeliverableStatus } from "@/types/admin";

type DetailTab = "overview" | "tasks" | "documents" | "communications" | "financial";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "documents", label: "Documents" },
  { id: "communications", label: "Communications" },
  { id: "financial", label: "Financial" },
];

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const txId = params.id as string;
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const transaction = mockAdminTransactions.find((tx) => tx.id === txId);

  if (!transaction) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">Transaction not found</p>
          <p className="text-sm text-[var(--text-tertiary)]">ID: {txId}</p>
          <button
            onClick={() => router.push("/admin/transactions")}
            className="mt-4 text-sm text-royal hover:text-royal-300 transition-colors"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  // Use the mock task data for this transaction
  const buyerTasks: TransactionTask[] = BUYER_TASKS;
  const sellerTasksList: TransactionTask[] = sellerTasks;
  const deliverables: DeliverableStatus[] = transaction.deliverables ?? SHARED_DELIVERABLES;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <TransactionDetailHeader
        transaction={{
          id: transaction.id,
          property: transaction.property,
          buyerNames: transaction.buyerNames,
          sellerNames: transaction.sellerNames,
          financials: transaction.financials,
          pipelineStage: transaction.pipelineStage,
          priority: transaction.priority,
          assignedCloserName: transaction.assignedCloserName,
          dates: transaction.dates,
        }}
        onBack={() => router.push("/admin/transactions")}
      />

      {/* Tab Bar */}
      <div className="border-b border-divider bg-paper sticky top-0 z-10">
        <div className="px-6 flex gap-0">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? "border-royal text-royal"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-divider"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* TRID Compliance */}
            <TRIDComplianceWidget
              closingDate={transaction.dates.closingDate}
              closingDisclosureSentDate={transaction.tridCompliance?.closingDisclosureSentDate}
              buyerCDStatus={transaction.tridCompliance?.buyerCDStatus ?? "not_generated"}
              sellerCDStatus={transaction.tridCompliance?.sellerCDStatus ?? "not_generated"}
            />

            {/* Dual-Sided Task Tracker */}
            <DualSidedTaskTracker
              buyerTasks={buyerTasks}
              sellerTasks={sellerTasksList}
            />
          </div>
        )}

        {activeTab === "tasks" && (
          <DualSidedTaskTracker
            buyerTasks={buyerTasks}
            sellerTasks={sellerTasksList}
          />
        )}

        {activeTab === "documents" && (
          <DeliverableMatrix
            deliverables={deliverables}
            onPush={(d) => {
              // In real app, this would open upload + push modal
              console.log("Push deliverable:", d.code, d.name);
            }}
          />
        )}

        {activeTab === "communications" && (
          <Card variant="default" padding="lg">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-[var(--text-tertiary)]">
                Communication log and quick message composer coming soon.
              </p>
            </div>
          </Card>
        )}

        {activeTab === "financial" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="default" padding="md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                Buyer Financials
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Purchase Price</span>
                  <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                    ${transaction.financials.purchasePrice.toLocaleString()}
                  </span>
                </div>
                {transaction.financials.loanAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Loan Amount</span>
                    <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                      ${transaction.financials.loanAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                {transaction.financials.downPayment && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Down Payment</span>
                    <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                      ${transaction.financials.downPayment.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Earnest Money</span>
                  <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                    ${transaction.financials.earnestMoney.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
            <Card variant="default" padding="md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                Seller Financials
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Sale Price</span>
                  <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                    ${transaction.financials.purchasePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Est. Net Proceeds</span>
                  <span className="font-[family-name:var(--font-mono)] text-fern font-semibold">
                    ${Math.round(transaction.financials.purchasePrice * 0.92).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] italic mt-2">
                  Detailed net proceeds breakdown available in seller portal.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
