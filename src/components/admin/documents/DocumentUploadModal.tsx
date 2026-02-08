"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  X,
  ChevronDown,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { RoutingSelector } from "./RoutingSelector";
import { DocumentType } from "@/types";
import { DocumentRouting } from "@/types/admin";
import {
  getSuggestedRouting,
  validateRouting,
  getDocumentTypeLabel,
  DOCUMENT_TYPE_GROUPS,
} from "@/lib/documentRouting";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onUploadComplete?: (documents: UploadedDocument[]) => void;
}

interface UploadedDocument {
  file: File;
  type: DocumentType;
  routing: DocumentRouting;
}

interface FileWithMeta {
  file: File;
  id: string;
  type: DocumentType | null;
  routing: DocumentRouting;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  transactionId,
  onUploadComplete,
}: DocumentUploadModalProps) {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setIsUploading(false);
    }
  }, [isOpen]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: FileWithMeta[] = acceptedFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: null,
      routing: "internal",
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    disabled: isUploading,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFileType = (id: string, type: DocumentType) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const suggestedRouting = getSuggestedRouting(type);
          return { ...f, type, routing: suggestedRouting };
        }
        return f;
      })
    );
  };

  const updateFileRouting = (id: string, routing: DocumentRouting) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, routing } : f))
    );
  };

  const canUpload =
    files.length > 0 &&
    files.every((f) => f.type !== null) &&
    !isUploading;

  const handleUpload = async () => {
    setIsUploading(true);

    // Update all files to uploading status
    setFiles((prev) =>
      prev.map((f) => ({ ...f, status: "uploading" as const }))
    );

    // Simulate upload for each file
    for (const file of files) {
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: "complete" as const } : f
        )
      );
    }

    // Brief delay to show completion
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Call completion handler
    if (onUploadComplete) {
      const uploadedDocs: UploadedDocument[] = files.map((f) => ({
        file: f.file,
        type: f.type!,
        routing: f.routing,
      }));
      onUploadComplete(uploadedDocs);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Documents" size="lg">
      <div className="space-y-6">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6
            transition-colors duration-200 cursor-pointer
            ${isDragActive
              ? "border-spruce bg-spruce/5"
              : "border-border hover:border-sea-glass hover:bg-mist/50"
            }
            ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-mist rounded-full flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-river-stone" />
            </div>
            <p className="text-storm-gray font-medium">
              {isDragActive ? "Drop files here..." : "Drag & drop files here"}
            </p>
            <p className="text-sm text-river-stone mt-1">
              or click to browse (PDF, DOC, images up to 25MB)
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-storm-gray">
              Files to Upload ({files.length})
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {files.map((fileMeta) => (
                <FileCard
                  key={fileMeta.id}
                  fileMeta={fileMeta}
                  onRemove={() => removeFile(fileMeta.id)}
                  onTypeChange={(type) => updateFileType(fileMeta.id, type)}
                  onRoutingChange={(routing) => updateFileRouting(fileMeta.id, routing)}
                  disabled={isUploading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!canUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} {files.length === 1 ? "File" : "Files"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// File Card Component
function FileCard({
  fileMeta,
  onRemove,
  onTypeChange,
  onRoutingChange,
  disabled,
}: {
  fileMeta: FileWithMeta;
  onRemove: () => void;
  onTypeChange: (type: DocumentType) => void;
  onRoutingChange: (routing: DocumentRouting) => void;
  disabled: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const validation = fileMeta.type
    ? validateRouting(fileMeta.type, fileMeta.routing)
    : { valid: true };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-mist/30">
        {/* File Icon / Status */}
        <div className="w-10 h-10 bg-paper rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
          {fileMeta.status === "uploading" ? (
            <Loader2 className="w-5 h-5 text-spruce animate-spin" />
          ) : fileMeta.status === "complete" ? (
            <CheckCircle2 className="w-5 h-5 text-fern" />
          ) : (
            <FileText className="w-5 h-5 text-river-stone" />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-storm-gray truncate">
            {fileMeta.file.name}
          </h4>
          <p className="text-xs text-river-stone">
            {formatFileSize(fileMeta.file.size)}
            {fileMeta.type && (
              <span className="ml-2">• {getDocumentTypeLabel(fileMeta.type)}</span>
            )}
          </p>
        </div>

        {/* Actions */}
        {!disabled && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-river-stone hover:text-storm-gray hover:bg-mist rounded-lg transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 text-river-stone hover:text-signal-red hover:bg-signal-red/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && !disabled && (
        <div className="p-4 space-y-4 border-t border-border">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-storm-gray mb-2">
              Document Type <span className="text-signal-red">*</span>
            </label>
            <select
              value={fileMeta.type || ""}
              onChange={(e) => onTypeChange(e.target.value as DocumentType)}
              className={`
                w-full px-3 py-2 border rounded-lg bg-paper text-storm-gray
                focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce
                ${!fileMeta.type ? "border-signal-red" : "border-border"}
              `}
            >
              <option value="">Select document type...</option>
              {DOCUMENT_TYPE_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {!fileMeta.type && (
              <p className="text-xs text-signal-red mt-1">
                Please select a document type
              </p>
            )}
          </div>

          {/* Routing */}
          {fileMeta.type && (
            <div>
              <label className="block text-sm font-medium text-storm-gray mb-2">
                Send To
              </label>
              <RoutingSelector
                value={fileMeta.routing}
                onChange={onRoutingChange}
                warning={validation.warning}
                compact
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
