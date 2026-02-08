"use client";

import { useState } from "react";
import { Building2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardHeader, Button, Badge } from "@/components/common";
import { CategoryDocumentList, ReportModal } from "@/components/documents";
import { Transaction, Document, DocumentWithAction } from "@/types";
import { mockDocuments, mockChecklistItems } from "@/data/mockData";
import { enrichDocuments, getDocumentsByCategory } from "@/lib/documentCategories";

export interface TitleTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

export default function TitleTab({ transaction, side }: TitleTabProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Get title documents
  const titleDocs = getDocumentsByCategory(mockDocuments, "title");
  const enrichedDocs = enrichDocuments(titleDocs);

  // Get title-related checklist items
  const titleChecklist = mockChecklistItems.filter(
    (item) => item.category === "title"
  );
  const completedCount = titleChecklist.filter((item) => item.complete).length;

  // Check if title commitment is available and has a report
  const titleCommitment = enrichedDocs.find(
    (doc) => doc.type === "title_commitment"
  );
  const hasReport = titleCommitment?.processing.reportPath;

  // Mock title exceptions (would come from AI extraction in real app)
  const titleExceptions = [
    { id: 1, description: "Easement for utility access along north boundary", status: "reviewing" },
    { id: 2, description: "Prior deed of trust - to be released at closing", status: "will_clear" },
    { id: 3, description: "Property taxes for current year - prorated at closing", status: "will_clear" },
  ];

  const handleDocumentClick = (doc: DocumentWithAction) => {
    console.log("Document clicked:", doc.name);
  };

  const handleViewReport = (doc?: DocumentWithAction) => {
    const target = doc || titleCommitment;
    if (target) {
      setSelectedDocument(target);
      setIsReportModalOpen(true);
    }
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
          <Building2 className="w-5 h-5 text-spruce" />
          Title Documents
        </h1>
        <p className="text-sm text-river-stone mt-1">
          Title commitment, preliminary report, deed, and policy
        </p>
      </div>

      {/* Title Status Banner */}
      <Card className="border-l-4 border-l-spruce bg-spruce/5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-spruce/10 text-spruce">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-storm-gray">Title Status</h3>
            <p className="text-sm text-river-stone mt-1">
              Title commitment issued • {titleExceptions.length} exceptions identified
            </p>
            {hasReport && (
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<ExternalLink className="w-4 h-4" />}
                onClick={() => handleViewReport()}
                className="mt-2"
              >
                View AI Summary
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Title Exceptions Summary */}
      {titleExceptions.length > 0 && (
        <Card>
          <CardHeader
            title="Title Exceptions"
            subtitle="Items identified in title search"
          />
          <div className="mt-4 space-y-3">
            {titleExceptions.map((exception) => (
              <div
                key={exception.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-mist"
              >
                <div
                  className={`
                    p-1 rounded-full shrink-0
                    ${exception.status === "reviewing" ? "bg-amber/10 text-amber" : "bg-fern/10 text-fern"}
                  `}
                >
                  {exception.status === "reviewing" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-storm-gray">{exception.description}</p>
                  <p className="text-xs text-river-stone mt-1">
                    {exception.status === "reviewing"
                      ? "Under review"
                      : "Will clear at closing"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Title Checklist */}
      <Card>
        <CardHeader
          title="Title Checklist"
          subtitle={`${completedCount} of ${titleChecklist.length} complete`}
        />
        <div className="mt-4 space-y-2">
          {titleChecklist.map((item) => (
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
            emptyMessage="No title documents yet"
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
