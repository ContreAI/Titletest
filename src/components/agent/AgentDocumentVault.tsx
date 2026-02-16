"use client";

import { useState } from "react";
import { FolderOpen, FileText, Download, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { Card } from "@/components/common";
import { Document } from "@/types";

// Vault folder structure from PDF spec Section 6
const BUYER_FOLDERS = [
  { id: "escrow", label: "Escrow & Opening", types: ["escrow_letter", "escrow_instructions", "earnest_money_receipt", "wire_instructions"] },
  { id: "title", label: "Title & Survey", types: ["title_commitment", "preliminary_title_report", "survey"] },
  { id: "inspections", label: "Inspections", types: ["inspection_report", "specialty_inspection", "repair_addendum"] },
  { id: "disclosures", label: "Disclosures", types: ["seller_disclosure", "lead_paint_disclosure", "hoa_documents"] },
  { id: "financing", label: "Financing & Insurance", types: ["loan_estimate", "closing_disclosure", "insurance_binder", "appraisal"] },
  { id: "closing", label: "Closing Documents", types: ["settlement_statement_buyer", "closing_package", "deed_of_trust"] },
  { id: "post_closing", label: "Post-Closing", types: ["recorded_deed", "title_policy", "home_warranty"] },
];

const SELLER_FOLDERS = [
  { id: "escrow", label: "Escrow & Opening", types: ["escrow_letter", "escrow_instructions", "seller_info_sheet"] },
  { id: "title", label: "Title & Payoffs", types: ["title_commitment", "payoff_statement"] },
  { id: "disclosures", label: "Disclosures", types: ["seller_disclosure", "lead_paint_disclosure", "hoa_documents", "leased_equipment"] },
  { id: "inspection", label: "Inspection Response", types: ["repair_addendum", "repair_receipts", "credit_agreement"] },
  { id: "closing", label: "Closing Documents", types: ["settlement_statement_seller", "closing_disclosure", "closing_package"] },
  { id: "post_closing", label: "Post-Closing", types: ["proceeds_wire_confirmation", "form_1099s", "insurance_cancellation"] },
];

export interface AgentDocumentVaultProps {
  side: "buyer" | "seller";
  documents: Document[];
}

export default function AgentDocumentVault({ side, documents }: AgentDocumentVaultProps) {
  const folders = side === "buyer" ? BUYER_FOLDERS : SELLER_FOLDERS;
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.slice(0, 2).map((f) => f.id))
  );

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {folders.map((folder) => {
        const folderDocs = documents.filter((d) =>
          folder.types.includes(d.type)
        );
        const isExpanded = expandedFolders.has(folder.id);

        return (
          <Card key={folder.id} padding="none">
            <button
              onClick={() => toggleFolder(folder.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-[var(--bg-elevation1)] transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
              )}
              <FolderOpen className="w-5 h-5 text-spruce flex-shrink-0" />
              <span className="font-medium text-[var(--text-primary)] flex-1">
                {folder.label}
              </span>
              <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-elevation1)] px-2 py-0.5 rounded">
                {folderDocs.length} doc{folderDocs.length !== 1 ? "s" : ""}
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-divider">
                {folderDocs.length > 0 ? (
                  <div className="divide-y divide-divider">
                    {folderDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 px-4 py-3 pl-12 hover:bg-[var(--bg-elevation1)] transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {doc.type.replace(/_/g, " ")} &middot;{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button className="p-1.5 rounded-md hover:bg-[var(--bg-elevation2)] text-[var(--text-secondary)] hover:text-spruce transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-[var(--bg-elevation2)] text-[var(--text-secondary)] hover:text-spruce transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-12 py-4 text-sm text-[var(--text-disabled)] italic">
                    No documents yet — will populate as the transaction progresses.
                  </p>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
