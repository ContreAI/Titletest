"use client";

import { useState } from "react";
import { FileSignature, CheckCircle2 } from "lucide-react";
import { Card, CardHeader } from "@/components/common";
import { CategoryDocumentList, ReportModal } from "@/components/documents";
import { Transaction, Document, DocumentWithAction } from "@/types";
import { mockDocuments, mockChecklistItems } from "@/data/mockData";
import { enrichDocuments, getDocumentsByCategory } from "@/lib/documentCategories";

export interface ContractTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

export default function ContractTab({ transaction, side }: ContractTabProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Get contract documents
  const contractDocs = getDocumentsByCategory(mockDocuments, "contract");
  const enrichedDocs = enrichDocuments(contractDocs);

  // Get contract-related checklist items
  const contractChecklist = mockChecklistItems.filter(
    (item) => item.category === "contract_earnest_money"
  );
  const completedCount = contractChecklist.filter((item) => item.complete).length;

  const handleDocumentClick = (doc: DocumentWithAction) => {
    // Open document viewer/modal
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
          <FileSignature className="w-5 h-5 text-spruce" />
          Contract Documents
        </h1>
        <p className="text-sm text-river-stone mt-1">
          Purchase agreement, addendums, and earnest money receipt
        </p>
      </div>

      {/* Mini Compliance Checklist */}
      <Card>
        <CardHeader
          title="Contract Checklist"
          subtitle={`${completedCount} of ${contractChecklist.length} complete`}
        />
        <div className="mt-4 space-y-2">
          {contractChecklist.map((item) => (
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
            emptyMessage="No contract documents yet"
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
