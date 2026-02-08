"use client";

import { Download, Mail, Printer } from "lucide-react";
import { Modal, Button } from "@/components/common";
import { Document } from "@/types";

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

export default function ReportModal({
  isOpen,
  onClose,
  document,
}: ReportModalProps) {
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Report: ${document.name}`}
      size="full"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Email Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print
            </Button>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {/* Placeholder Report Content */}
      <div className="min-h-[400px]">
        <div className="bg-mist rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-storm-gray mb-2">
            AI-Generated Summary
          </h3>
          <p className="text-sm text-river-stone">
            This is a placeholder for the AI-generated report content. The
            actual report will contain extracted data, key findings, and
            important dates from the document.
          </p>
        </div>

        {/* Sample Report Sections */}
        <div className="space-y-6">
          <section>
            <h4 className="font-semibold text-storm-gray mb-3">
              Document Overview
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-paper border border-divider rounded-lg p-4">
                <p className="text-xs text-river-stone uppercase tracking-wide mb-1">
                  Document Type
                </p>
                <p className="text-sm font-medium text-storm-gray">
                  {document.type.replace(/_/g, " ").toUpperCase()}
                </p>
              </div>
              <div className="bg-paper border border-divider rounded-lg p-4">
                <p className="text-xs text-river-stone uppercase tracking-wide mb-1">
                  Processing Status
                </p>
                <p className="text-sm font-medium text-storm-gray capitalize">
                  {document.processing.status}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-storm-gray mb-3">
              Extracted Data
            </h4>
            <div className="bg-paper border border-divider rounded-lg p-4">
              <p className="text-sm text-river-stone italic">
                Extracted data will appear here once the document is processed
                and analyzed.
              </p>
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-storm-gray mb-3">Key Findings</h4>
            <div className="bg-paper border border-divider rounded-lg p-4">
              <ul className="space-y-2 text-sm text-storm-gray">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-fern mt-2" />
                  <span>
                    Sample finding #1 - Important information extracted from the
                    document
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-fern mt-2" />
                  <span>
                    Sample finding #2 - Key dates and deadlines identified
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber mt-2" />
                  <span>
                    Sample warning - Items that may need attention
                  </span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}
