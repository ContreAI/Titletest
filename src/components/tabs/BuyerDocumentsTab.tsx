"use client";

import { useMemo, useState, useRef } from "react";
import {
  FolderOpen,
  FileText,
  Upload,
  Download,
  Search,
  ChevronDown,
  ChevronRight,
  File,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button, EmptyState } from "@/components/common";
import { VaultFolder, Document, BuyerVaultFolder } from "@/types";

gsap.registerPlugin(useGSAP);

export interface BuyerDocumentsTabProps {
  documents: Document[];
  onUpload?: () => void;
  onDownload?: (doc: Document) => void;
}

// 7 buyer vault folders from the plan
const BUYER_VAULT_FOLDERS: VaultFolder[] = [
  {
    id: "escrow_opening",
    label: "Escrow & Opening",
    description: "Purchase agreement, earnest money receipt, escrow instructions",
    documentTypes: ["purchase_agreement", "addendum", "earnest_money_receipt", "escrow_letter", "escrow_instructions", "wire_fraud_advisory"],
    documentCount: 0,
  },
  {
    id: "title_survey",
    label: "Title & Survey",
    description: "Title commitment, preliminary report, survey",
    documentTypes: ["title_commitment", "preliminary_title_report", "survey"],
    documentCount: 0,
  },
  {
    id: "inspections",
    label: "Inspections",
    description: "Home inspection, specialty inspections, repair requests",
    documentTypes: ["inspection_report", "specialty_inspection_report", "repair_addendum"],
    documentCount: 0,
  },
  {
    id: "disclosures",
    label: "Disclosures",
    description: "Seller disclosures, lead paint, HOA documents",
    documentTypes: ["sellers_disclosure", "lead_paint_disclosure", "hoa_documents", "leased_equipment_disclosure"],
    documentCount: 0,
  },
  {
    id: "financing_insurance",
    label: "Financing & Insurance",
    description: "Loan documents, appraisal, insurance binder",
    documentTypes: ["loan_approval", "appraisal", "insurance_binder", "clear_to_close_notice", "vesting_instructions"],
    documentCount: 0,
  },
  {
    id: "closing_documents",
    label: "Closing Documents",
    description: "Closing disclosure, settlement statement, wire instructions",
    documentTypes: ["closing_disclosure", "settlement_statement_buyer", "wire_instructions", "closing_funds_wire_confirmation", "signed_closing_package"],
    documentCount: 0,
  },
  {
    id: "post_closing",
    label: "Post-Closing",
    description: "Recorded deed, title policy, home warranty",
    documentTypes: ["recorded_deed", "owners_title_policy", "deed", "title_policy", "home_warranty", "lender_welcome_package"],
    documentCount: 0,
  },
];

function FolderCard({
  folder,
  documents,
  onDownload,
  defaultOpen,
}: {
  folder: VaultFolder;
  documents: Document[];
  onDownload?: (doc: Document) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-elevation1 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
        )}

        <FolderOpen
          className={`w-5 h-5 flex-shrink-0 ${
            documents.length > 0 ? "text-spruce" : "text-[var(--text-disabled)]"
          }`}
        />

        <div className="flex-1 text-left min-w-0">
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {folder.label}
          </span>
          <span className="text-xs text-[var(--text-tertiary)] ml-2">
            {folder.description}
          </span>
        </div>

        <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--text-tertiary)] flex-shrink-0">
          {documents.length} {documents.length === 1 ? "doc" : "docs"}
        </span>
      </button>

      {open && (
        <div className="border-t border-divider">
          {documents.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <File className="w-8 h-8 text-[var(--text-disabled)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-tertiary)]">
                No documents yet
              </p>
              <p className="text-xs text-[var(--text-disabled)]">
                Documents will appear here as they are uploaded or delivered.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-divider/50">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-elevation1 transition-colors"
                >
                  <FileText className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-[var(--text-disabled)]">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                      {doc.source !== "title_created" && (
                        <span>
                          {" "}&middot;{" "}
                          {doc.source === "buyer_upload"
                            ? "You uploaded"
                            : doc.source === "seller_upload"
                              ? "From seller"
                              : "From escrow"}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => onDownload?.(doc)}
                    className="p-1.5 rounded-md hover:bg-elevation2 transition-colors"
                    aria-label={`Download ${doc.name}`}
                  >
                    <Download className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function BuyerDocumentsTab({
  documents,
  onUpload,
  onDownload,
}: BuyerDocumentsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 8,
      duration: 0.3,
      stagger: 0.04,
      ease: "power2.out",
    });
  }, []);

  // Group documents into folders
  const foldersWithDocs = useMemo(() => {
    let filteredDocs = documents;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredDocs = documents.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q)
      );
    }

    return BUYER_VAULT_FOLDERS.map((folder) => ({
      folder,
      documents: filteredDocs.filter((doc) =>
        folder.documentTypes.includes(doc.type)
      ),
    }));
  }, [documents, searchQuery]);

  const totalDocs = documents.length;

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Document Vault
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {totalDocs} {totalDocs === 1 ? "document" : "documents"} across 7 folders
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={onUpload}
          className="active:scale-[0.97]"
        >
          Upload Document
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-disabled)]" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-spruce/30 focus:border-spruce text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
        />
      </div>

      {/* Folder list */}
      <div className="space-y-3">
        {foldersWithDocs.map(({ folder, documents: folderDocs }) => (
          <FolderCard
            key={folder.id}
            folder={folder}
            documents={folderDocs}
            onDownload={onDownload}
            defaultOpen={folderDocs.length > 0}
          />
        ))}
      </div>
    </div>
  );
}
