"use client";

import { useState } from "react";
import { Link2, CheckCircle, AlertCircle, Upload, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, Button } from "@/components/common";
import { DocumentCard, UploadDropzone, ReportModal } from "@/components/documents";
import { Transaction, Document } from "@/types";
import { mockDocuments, mockBuyerSide } from "@/data/mockData";

export interface DocumentsTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

export default function DocumentsTab({ transaction, side }: DocumentsTabProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [isPushing, setIsPushing] = useState(false);

  // Filter documents by source
  const titleDocuments = mockDocuments.filter(
    (doc) => doc.source === "title_created" || doc.source === "qualia"
  );

  const userUploads = mockDocuments.filter(
    (doc) =>
      doc.source === "buyer_upload" ||
      doc.source === "seller_upload"
  );

  const handleViewReport = (doc: Document) => {
    setSelectedDocument(doc);
    setIsReportModalOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportModalOpen(false);
    setSelectedDocument(null);
  };

  const handleUpload = (files: File[]) => {
    // Mock upload handler
    console.log("Uploading files:", files);
    alert(`Would upload ${files.length} file(s). This is a demo.`);
  };

  // SkySlope connection status
  const isSkySlopeConnected = mockBuyerSide.skyslope?.connected || false;

  // Count documents not yet pushed to SkySlope
  const unpushedDocs = mockDocuments.filter(
    (doc) =>
      doc.processing.status === "processed" &&
      (side === "buyer" ? !doc.skyslope.pushedToBuyer : !doc.skyslope.pushedToSeller)
  );

  const handleManualPush = async () => {
    setIsPushing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPushing(false);
    alert(`Would push ${unpushedDocs.length} document(s) to SkySlope. This is a demo.`);
  };

  const handleToggleAutoSync = () => {
    setAutoSyncEnabled(!autoSyncEnabled);
  };

  return (
    <div className="space-y-8">
      {/* SkySlope Sync Bar - Show at top when connected */}
      {isSkySlopeConnected && (
        <Card className="bg-spruce/5 border-spruce/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left side - Connection status and auto-sync */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-spruce" />
                <span className="font-medium text-storm-gray">SkySlope</span>
                <span className="inline-flex items-center gap-1 text-xs text-fern">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </span>
              </div>

              <div className="h-6 w-px bg-border hidden md:block" />

              {/* Auto-sync Toggle */}
              <button
                onClick={handleToggleAutoSync}
                className="flex items-center gap-2 text-sm"
                aria-pressed={autoSyncEnabled}
              >
                {autoSyncEnabled ? (
                  <ToggleRight className="w-7 h-7 text-fern" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-river-stone" />
                )}
                <span className="text-sm text-storm-gray">
                  Auto-sync {autoSyncEnabled ? "on" : "off"}
                </span>
              </button>
            </div>

            {/* Right side - Manual push */}
            <div className="flex items-center gap-3">
              {unpushedDocs.length > 0 && (
                <span className="text-xs text-amber font-medium">
                  {unpushedDocs.length} document{unpushedDocs.length !== 1 ? "s" : ""} pending
                </span>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleManualPush}
                isLoading={isPushing}
                leftIcon={isPushing ? undefined : <Upload className="w-4 h-4" />}
                disabled={unpushedDocs.length === 0}
              >
                {isPushing ? "Pushing..." : "Push to SkySlope"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Connect SkySlope prompt - Show when not connected */}
      {!isSkySlopeConnected && (
        <Card className="bg-mist border-dashed">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-river-stone/10 text-river-stone">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-storm-gray">
                  Connect SkySlope to sync documents automatically
                </p>
                <p className="text-xs text-river-stone">
                  Documents will be pushed to your SkySlope transaction
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Connect SkySlope
            </Button>
          </div>
        </Card>
      )}

      {/* From Title Company Section */}
      <section>
        <h2 className="text-xl font-semibold text-storm-gray mb-4">
          From Title Company
        </h2>
        <div className="space-y-3">
          {titleDocuments.map((doc) => {
            const isPushed = side === "buyer"
              ? doc.skyslope.pushedToBuyer
              : doc.skyslope.pushedToSeller;
            return (
              <DocumentCard
                key={doc.id}
                document={doc}
                onViewReport={() => handleViewReport(doc)}
                onViewOriginal={() => console.log("View original:", doc.name)}
                onReprocess={() => console.log("Reprocess:", doc.name)}
                onDownload={() => console.log("Download:", doc.name)}
                onEmail={() => console.log("Email:", doc.name)}
                onCopyLink={() => console.log("Copy link:", doc.name)}
                showSkySlopeActions={isSkySlopeConnected}
                isPushedToSkySlope={isPushed}
                onPushToSkySlope={() => {
                  alert(`Would push "${doc.name}" to SkySlope. This is a demo.`);
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Your Uploads Section */}
      <section>
        <h2 className="text-xl font-semibold text-storm-gray mb-4">
          Your Uploads
        </h2>
        <div className="space-y-3">
          {userUploads.length > 0 ? (
            userUploads.map((doc) => {
              const isPushed = side === "buyer"
                ? doc.skyslope.pushedToBuyer
                : doc.skyslope.pushedToSeller;
              return (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onViewReport={() => handleViewReport(doc)}
                  onViewOriginal={() => console.log("View original:", doc.name)}
                  onReprocess={() => console.log("Reprocess:", doc.name)}
                  onDownload={() => console.log("Download:", doc.name)}
                  onEmail={() => console.log("Email:", doc.name)}
                  onCopyLink={() => console.log("Copy link:", doc.name)}
                  onDelete={() => console.log("Delete:", doc.name)}
                  showSkySlopeActions={isSkySlopeConnected}
                  isPushedToSkySlope={isPushed}
                  onPushToSkySlope={() => {
                    alert(`Would push "${doc.name}" to SkySlope. This is a demo.`);
                  }}
                />
              );
            })
          ) : (
            <p className="text-sm text-river-stone">
              No documents uploaded yet.
            </p>
          )}

          {/* Upload Dropzone */}
          <UploadDropzone onUpload={handleUpload} />
        </div>
      </section>

      {/* SkySlope Details Section - Only show when connected */}
      {isSkySlopeConnected && (
        <section>
          <h2 className="text-xl font-semibold text-storm-gray mb-4">
            SkySlope Details
          </h2>
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-river-stone">
                  Transaction ID:{" "}
                  <span className="font-mono text-storm-gray">
                    {mockBuyerSide.skyslope?.transactionId || "N/A"}
                  </span>
                </p>
                <p className="text-sm text-river-stone">
                  Documents pushed: <span className="font-mono text-storm-gray">3</span>
                </p>
                <p className="text-xs text-river-stone">
                  Last sync: {mockBuyerSide.skyslope?.lastSyncAt || "Never"}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Disconnect
              </Button>
            </div>
          </Card>
        </section>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReport}
        document={selectedDocument}
      />
    </div>
  );
}
