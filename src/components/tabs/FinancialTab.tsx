"use client";

import { useState } from "react";
import { DollarSign, Landmark, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, Badge } from "@/components/common";
import { CategoryDocumentList, ReportModal } from "@/components/documents";
import { Transaction, Document, DocumentWithAction } from "@/types";
import { mockDocuments, mockChecklistItems, formatCurrency } from "@/data/mockData";
import { enrichDocuments, getDocumentsByCategory } from "@/lib/documentCategories";

export interface FinancialTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

export default function FinancialTab({ transaction, side }: FinancialTabProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Get financial documents
  const financialDocs = getDocumentsByCategory(mockDocuments, "financial");
  const enrichedDocs = enrichDocuments(financialDocs);

  // Get financing-related checklist items
  const financingChecklist = mockChecklistItems.filter(
    (item) => item.category === "financing" || item.category === "closing_prep"
  );
  const completedCount = financingChecklist.filter((item) => item.complete).length;

  // Transaction financials
  const { purchasePrice, earnestMoney, loanAmount, downPayment, loanType } =
    transaction.financials;

  const handleDocumentClick = (doc: DocumentWithAction) => {
    console.log("Document clicked:", doc.name);
  };

  const handleViewReport = (doc: DocumentWithAction) => {
    setSelectedDocument(doc);
    setIsReportModalOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-storm-gray flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-spruce" />
          Financial Documents
        </h1>
        <p className="text-sm text-river-stone mt-1">
          Settlement statements, wire instructions, and loan documents
        </p>
      </div>

      {/* Loan Status Banner */}
      {loanAmount && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-blue-100 text-blue-700">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-storm-gray">Loan Status</h3>
                <Badge variant="default">{loanType || "Conventional"}</Badge>
              </div>
              <p className="text-sm text-river-stone mt-1">
                {formatCurrency(loanAmount)} • Pending approval
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Numbers Summary */}
      <Card>
        <CardHeader title="Transaction Summary" />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-mist">
            <div className="text-xs text-river-stone uppercase tracking-wide">
              Purchase Price
            </div>
            <div className="text-lg font-semibold text-storm-gray font-mono mt-1">
              {formatCurrency(purchasePrice)}
            </div>
          </div>
          {loanAmount && (
            <div className="p-3 rounded-lg bg-mist">
              <div className="text-xs text-river-stone uppercase tracking-wide">
                Loan Amount
              </div>
              <div className="text-lg font-semibold text-storm-gray font-mono mt-1">
                {formatCurrency(loanAmount)}
              </div>
            </div>
          )}
          {downPayment && (
            <div className="p-3 rounded-lg bg-mist">
              <div className="text-xs text-river-stone uppercase tracking-wide">
                Down Payment
              </div>
              <div className="text-lg font-semibold text-storm-gray font-mono mt-1">
                {formatCurrency(downPayment)}
              </div>
            </div>
          )}
          <div className="p-3 rounded-lg bg-mist">
            <div className="text-xs text-river-stone uppercase tracking-wide">
              Earnest Money
            </div>
            <div className="text-lg font-semibold text-storm-gray font-mono mt-1">
              {formatCurrency(earnestMoney)}
            </div>
          </div>
        </div>
      </Card>

      {/* Financing Checklist */}
      <Card>
        <CardHeader
          title="Financing Checklist"
          subtitle={`${completedCount} of ${financingChecklist.length} complete`}
        />
        <div className="mt-4 space-y-2">
          {financingChecklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-border last:border-0"
            >
              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center
                  ${item.complete ? "bg-fern text-white" : "border-2 border-river-stone/30"}
                `}
              >
                {item.complete && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <span
                className={`text-sm ${
                  item.complete ? "text-river-stone line-through" : "text-storm-gray"
                }`}
              >
                {item.title}
              </span>
              {item.waitingOn && !item.complete && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-river-stone/10 text-river-stone">
                  Waiting on {item.waitingOn}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader title="Documents" />
        <div className="mt-4">
          <CategoryDocumentList
            documents={enrichedDocs}
            emptyMessage="No financial documents yet"
            onDocumentClick={handleDocumentClick}
            onViewReport={handleViewReport}
          />
        </div>
      </Card>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReport}
        document={selectedDocument}
      />
    </div>
  );
}
