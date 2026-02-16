"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  Zap,
  Users,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import {
  ContractUploader,
  OCRReviewPanel,
  TransactionTypeSelect,
  EditedOCRData,
} from "@/components/admin/transactions";
import { AutomationPreview } from "@/components/title";
import { Button } from "@/components/common";
import { ocrService } from "@/lib/ocrService";
import { OCRExtractedData, TransactionType } from "@/types/admin";

type Step = "upload" | "review" | "automation" | "confirm";

const STEPS: {
  id: Step;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "upload", label: "Upload Contract", icon: FileText },
  { id: "review", label: "Review Data", icon: CheckCircle2 },
  { id: "automation", label: "Automation Preview", icon: Zap },
  { id: "confirm", label: "Confirm & Send", icon: Users },
];

export default function TitleUploadPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [processingError, setProcessingError] = useState<string>();
  const [ocrData, setOcrData] = useState<OCRExtractedData | null>(null);
  const [editedData, setEditedData] = useState<EditedOCRData | null>(null);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("purchase");
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
        setTimeout(() => setCurrentStep("review"), 500);
      } else {
        setProcessingStatus("error");
        setProcessingError(result.error || "Failed to process document");
      }
    } catch {
      setProcessingStatus("error");
      setProcessingError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOCRConfirm = (data: EditedOCRData) => {
    setEditedData(data);
    setCurrentStep("automation");
  };

  const handleAutomationConfirm = () => {
    setCurrentStep("confirm");
  };

  const handleCreateTransaction = async () => {
    if (!editedData) return;
    setIsCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/title/transactions/tx_505332");
  };

  const getStepIndex = (step: Step) => STEPS.findIndex((s) => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  return (
    <div className="flex flex-col h-full">
      {/* Back Link */}
      <div className="px-6 py-4 border-b border-divider bg-paper">
        <Link
          href="/title"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-spruce transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-6 bg-paper border-b border-divider">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = currentStepIndex === index;
              const isComplete = currentStepIndex > index;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200
                        ${isComplete ? "bg-fern" : isActive ? "bg-spruce" : "bg-[var(--bg-elevation2)]"}
                      `}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-white" : "text-[var(--text-tertiary)]"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${isActive ? "text-spruce" : isComplete ? "text-fern" : "text-[var(--text-tertiary)]"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 mt-[-1.5rem] ${currentStepIndex > index ? "bg-fern" : "bg-divider"}`}
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
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  Upload Purchase Agreement
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Upload the executed purchase agreement. We'll extract all
                  parties, dates, and financial details automatically.
                </p>
              </div>
              <ContractUploader
                onFileSelected={handleFileSelected}
                onProcess={handleProcess}
                isProcessing={isProcessing}
                processingStatus={processingStatus}
                error={processingError}
              />
            </div>
          )}

          {/* Step 2: Review */}
          {currentStep === "review" && ocrData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  Review Extracted Data
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Verify the information we extracted. Make corrections if
                  needed.
                </p>
              </div>
              <OCRReviewPanel
                data={ocrData}
                onConfirm={handleOCRConfirm}
                onBack={() => {
                  setCurrentStep("upload");
                  setProcessingStatus("idle");
                }}
              />
            </div>
          )}

          {/* Step 3: Automation Preview */}
          {currentStep === "automation" && editedData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  Automation Preview
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Here's what will happen automatically when you create this
                  transaction.
                </p>
              </div>

              {/* Transaction Type */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">
                  Transaction Type
                </label>
                <TransactionTypeSelect
                  value={transactionType}
                  onChange={setTransactionType}
                />
              </div>

              <AutomationPreview editedData={editedData} />

              <div className="flex items-center justify-between pt-4 border-t border-divider">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep("review")}
                >
                  Back
                </Button>
                <Button variant="primary" onClick={handleAutomationConfirm}>
                  Looks Good — Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === "confirm" && editedData && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  Confirm & Create Transaction
                </h2>
                <p className="text-[var(--text-secondary)]">
                  Review the summary below. On confirm, agent invitations will
                  be sent immediately.
                </p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SummaryCard title="Property">
                  <p className="font-medium text-[var(--text-primary)]">
                    {editedData.property.address}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {editedData.property.city}, {editedData.property.state}{" "}
                    {editedData.property.zip}
                  </p>
                </SummaryCard>

                <SummaryCard title="Financials">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">
                        Purchase Price:
                      </span>
                      <span className="font-medium font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                        ${editedData.financials.purchasePrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">
                        Earnest Money:
                      </span>
                      <span className="font-medium font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                        ${editedData.financials.earnestMoney.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </SummaryCard>

                <SummaryCard title="Buyer's Agent">
                  <p className="font-medium text-[var(--text-primary)]">
                    {editedData.buyerAgent.name}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {editedData.buyerAgent.email}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {editedData.buyerAgent.brokerage}
                  </p>
                </SummaryCard>

                <SummaryCard title="Seller's Agent">
                  <p className="font-medium text-[var(--text-primary)]">
                    {editedData.sellerAgent.name}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {editedData.sellerAgent.email}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {editedData.sellerAgent.brokerage}
                  </p>
                </SummaryCard>
              </div>

              {/* What will happen */}
              <div className="bg-fern/5 border border-fern/20 rounded-xl p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-fern" />
                  On create, these automations will fire:
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-primary)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0" />
                    Portal invitation email to{" "}
                    <strong>{editedData.buyerAgent.name}</strong> (buyer's agent)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0" />
                    Portal invitation email to{" "}
                    <strong>{editedData.sellerAgent.name}</strong> (seller's
                    agent)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0" />
                    Transaction timeline generated from contract dates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0" />
                    Buyer and seller portal access created
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fern flex-shrink-0" />
                    AI report generated for purchase agreement
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-divider">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep("automation")}
                >
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
                      Creating & Sending...
                    </>
                  ) : (
                    "Create Transaction & Send Invitations"
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

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-divider rounded-xl p-4 bg-paper">
      <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
