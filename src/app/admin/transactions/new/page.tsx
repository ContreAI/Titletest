"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Settings,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/layout";
import {
  ContractUploader,
  OCRReviewPanel,
  TransactionTypeSelect,
  EditedOCRData,
} from "@/components/admin/transactions";
import Button from "@/components/common/Button";
import { ocrService } from "@/lib/ocrService";
import { generateTimelineFromOCR } from "@/lib/ocrService";
import { OCRExtractedData, TransactionType } from "@/types/admin";

type Step = "upload" | "review" | "configure" | "confirm";

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "upload", label: "Upload Contract", icon: FileText },
  { id: "review", label: "Review Data", icon: CheckCircle2 },
  { id: "configure", label: "Configure", icon: Settings },
  { id: "confirm", label: "Confirm", icon: Users },
];

export default function NewTransactionPage() {
  const router = useRouter();

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>("upload");

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [processingError, setProcessingError] = useState<string>();
  const [ocrData, setOcrData] = useState<OCRExtractedData | null>(null);

  // Edited data state
  const [editedData, setEditedData] = useState<EditedOCRData | null>(null);

  // Configuration state
  const [transactionType, setTransactionType] = useState<TransactionType>("purchase");
  const [assignCloser, setAssignCloser] = useState<string>("");
  const [generateTimeline, setGenerateTimeline] = useState(true);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Creating state
  const [isCreating, setIsCreating] = useState(false);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setProcessingStatus("idle");
    setProcessingError(undefined);
    setOcrData(null);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingStatus("processing");
    setProcessingError(undefined);

    try {
      const result = await ocrService.processContract({ file: selectedFile });

      if (result.success && result.data) {
        setOcrData(result.data);
        setProcessingStatus("success");
        // Auto-advance to review step after a brief delay
        setTimeout(() => setCurrentStep("review"), 500);
      } else {
        setProcessingStatus("error");
        setProcessingError(result.error || "Failed to process document");
      }
    } catch (error) {
      setProcessingStatus("error");
      setProcessingError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOCRConfirm = (data: EditedOCRData) => {
    setEditedData(data);
    setCurrentStep("configure");
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
    setProcessingStatus("idle");
  };

  const handleBackToReview = () => {
    setCurrentStep("review");
  };

  const handleBackToConfigure = () => {
    setCurrentStep("configure");
  };

  const handleContinueToConfirm = () => {
    setCurrentStep("confirm");
  };

  const handleCreateTransaction = async () => {
    if (!editedData) return;

    setIsCreating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, this would create the transaction via API
    // For now, redirect to the pipeline
    router.push("/admin/pipeline");
  };

  const getStepIndex = (step: Step) => STEPS.findIndex((s) => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <AdminHeader
        title="New Transaction"
        subtitle="Create a new real estate transaction"
        showSearch={false}
        showNewTransaction={false}
      />

      {/* Back Link */}
      <div className="px-6 py-4 border-b border-border bg-white">
        <Link
          href="/admin/pipeline"
          className="inline-flex items-center gap-2 text-sm text-river-stone hover:text-spruce transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-6 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = currentStepIndex === index;
              const isComplete = currentStepIndex > index;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  {/* Step */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        transition-colors duration-200
                        ${isComplete ? "bg-fern" : isActive ? "bg-spruce" : "bg-mist"}
                      `}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? "text-white" : "text-river-stone"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`
                        mt-2 text-sm font-medium
                        ${isActive ? "text-spruce" : isComplete ? "text-fern" : "text-river-stone"}
                      `}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-4 mt-[-1.5rem]
                        ${currentStepIndex > index ? "bg-fern" : "bg-border"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Upload */}
          {currentStep === "upload" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-storm-gray mb-2">
                  Upload Purchase Agreement
                </h2>
                <p className="text-river-stone">
                  Upload the executed purchase agreement to automatically extract
                  property details, parties, and key dates.
                </p>
              </div>

              <ContractUploader
                onFileSelected={handleFileSelected}
                onProcess={handleProcess}
                isProcessing={isProcessing}
                processingStatus={processingStatus}
                error={processingError}
              />

              {/* Manual Entry Option */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-river-stone mb-3">
                  Don't have a contract yet?
                </p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Skip to configure step with empty data
                    setEditedData({
                      property: { address: "", city: "", state: "ID", zip: "" },
                      financials: { purchasePrice: 0, earnestMoney: 0, loanType: "Conventional" },
                      dates: {
                        contractDate: "",
                        closingDate: "",
                        inspectionDeadline: "",
                        financingDeadline: "",
                        appraisalDeadline: "",
                      },
                      buyers: [{ name: "", email: "", phone: "" }],
                      sellers: [{ name: "", email: "", phone: "" }],
                      buyerAgent: { name: "", email: "", phone: "", brokerage: "" },
                      sellerAgent: { name: "", email: "", phone: "", brokerage: "" },
                    });
                    setCurrentStep("configure");
                  }}
                >
                  Enter Details Manually
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Review OCR Data */}
          {currentStep === "review" && ocrData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-storm-gray mb-2">
                  Review Extracted Data
                </h2>
                <p className="text-river-stone">
                  Please review the information extracted from your contract and make
                  any necessary corrections.
                </p>
              </div>

              <OCRReviewPanel
                data={ocrData}
                onConfirm={handleOCRConfirm}
                onBack={handleBackToUpload}
              />
            </div>
          )}

          {/* Step 3: Configure Transaction */}
          {currentStep === "configure" && editedData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-storm-gray mb-2">
                  Configure Transaction
                </h2>
                <p className="text-river-stone">
                  Select the transaction type and configure additional settings.
                </p>
              </div>

              {/* Transaction Type */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-storm-gray">
                  Transaction Type
                </label>
                <TransactionTypeSelect
                  value={transactionType}
                  onChange={setTransactionType}
                />
              </div>

              {/* Assign Closer */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-storm-gray">
                  Assign Closer (Optional)
                </label>
                <select
                  value={assignCloser}
                  onChange={(e) => setAssignCloser(e.target.value)}
                  className="w-full max-w-md px-3 py-2 border border-border rounded-lg bg-white text-storm-gray focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce"
                >
                  <option value="">Assign later</option>
                  <option value="emp_001">Emily Davis</option>
                  <option value="emp_002">Tom Anderson</option>
                </select>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-storm-gray">
                  Automation Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateTimeline}
                      onChange={(e) => setGenerateTimeline(e.target.checked)}
                      className="w-4 h-4 text-spruce border-border rounded focus:ring-spruce"
                    />
                    <span className="text-storm-gray">
                      Generate timeline from contract dates
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWelcomeEmail}
                      onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                      className="w-4 h-4 text-spruce border-border rounded focus:ring-spruce"
                    />
                    <span className="text-storm-gray">
                      Send welcome email to parties
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="ghost" onClick={ocrData ? handleBackToReview : handleBackToUpload}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleContinueToConfirm}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm & Create */}
          {currentStep === "confirm" && editedData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-storm-gray mb-2">
                  Confirm Transaction Details
                </h2>
                <p className="text-river-stone">
                  Review the summary below and create your transaction.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Property */}
                <SummaryCard title="Property" icon={FileText}>
                  <p className="font-medium text-storm-gray">
                    {editedData.property.address}
                  </p>
                  <p className="text-sm text-river-stone">
                    {editedData.property.city}, {editedData.property.state}{" "}
                    {editedData.property.zip}
                  </p>
                  <p className="text-sm text-spruce font-medium mt-2">
                    {TRANSACTION_TYPES[transactionType].label}
                  </p>
                </SummaryCard>

                {/* Financials */}
                <SummaryCard title="Financials" icon={Settings}>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-river-stone">Purchase Price:</span>
                      <span className="font-medium text-storm-gray">
                        ${editedData.financials.purchasePrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-river-stone">Earnest Money:</span>
                      <span className="font-medium text-storm-gray">
                        ${editedData.financials.earnestMoney.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-river-stone">Loan Type:</span>
                      <span className="font-medium text-storm-gray">
                        {editedData.financials.loanType}
                      </span>
                    </div>
                  </div>
                </SummaryCard>

                {/* Parties */}
                <SummaryCard title="Parties" icon={Users}>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-river-stone uppercase">Buyer(s)</span>
                      <p className="font-medium text-storm-gray">
                        {editedData.buyers.map((b) => b.name).join(", ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-river-stone uppercase">Seller(s)</span>
                      <p className="font-medium text-storm-gray">
                        {editedData.sellers.map((s) => s.name).join(", ")}
                      </p>
                    </div>
                  </div>
                </SummaryCard>

                {/* Key Dates */}
                <SummaryCard title="Key Dates" icon={Calendar}>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-river-stone">Contract:</span>
                      <span className="font-medium text-storm-gray">
                        {editedData.dates.contractDate
                          ? new Date(editedData.dates.contractDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-river-stone">Closing:</span>
                      <span className="font-medium text-storm-gray">
                        {editedData.dates.closingDate
                          ? new Date(editedData.dates.closingDate).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                </SummaryCard>
              </div>

              {/* Will Create */}
              <div className="bg-mist rounded-xl p-4">
                <h3 className="font-semibold text-storm-gray mb-3">
                  This will create:
                </h3>
                <ul className="space-y-2 text-sm text-storm-gray">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern" />
                    New transaction record
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern" />
                    {editedData.buyers.length + editedData.sellers.length + 2} party
                    records (buyers, sellers, agents)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern" />
                    Buyer and seller portal access
                  </li>
                  {generateTimeline && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-fern" />
                      Timeline with key dates
                    </li>
                  )}
                  {sendWelcomeEmail && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-fern" />
                      Welcome emails to all parties
                    </li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="ghost" onClick={handleBackToConfigure}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateTransaction}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Transaction"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component
function SummaryCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-spruce" />
        <h3 className="font-semibold text-storm-gray">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// Import TRANSACTION_TYPES constant
import { TRANSACTION_TYPES } from "@/types/admin";
