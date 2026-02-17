"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, Loader2, Zap } from "lucide-react";
import { Card, Button } from "@/components/common";
import { useDropzone } from "react-dropzone";

export interface DocumentUploadZoneProps {
  documentType: string;
  label: string;
  description: string;
  automationHint?: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
  isComplete?: boolean;
}

export default function DocumentUploadZone({
  documentType,
  label,
  description,
  automationHint,
  onUpload,
  isUploading = false,
  isComplete = false,
}: DocumentUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    disabled: isUploading || isComplete,
  });

  if (isComplete) {
    return (
      <Card className="border border-fern/30 bg-fern/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-fern/10">
            <CheckCircle2 className="w-5 h-5 text-fern" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-[var(--text-primary)]">{label}</p>
            <p className="text-sm text-fern">
              Uploaded{selectedFile ? `: ${selectedFile.name}` : ""}
            </p>
          </div>
          {automationHint && (
            <span className="text-xs text-fern flex items-center gap-1 bg-fern/10 px-2 py-1 rounded">
              <Zap className="w-3 h-3" />
              Automation triggered
            </span>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-divider">
      <div className="mb-3">
        <p className="font-medium text-[var(--text-primary)]">{label}</p>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-royal bg-royal/5" : "border-divider hover:border-royal/50"}
          ${isUploading ? "opacity-50 cursor-wait" : ""}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-royal" />
            <span className="text-sm text-[var(--text-secondary)]">
              Uploading & processing...
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Upload className="w-5 h-5 text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              Drop file here or click to upload
            </span>
          </div>
        )}
      </div>

      {automationHint && (
        <p className="text-xs text-[var(--text-tertiary)] mt-2 flex items-center gap-1">
          <Zap className="w-3 h-3 text-sea-glass-400" />
          {automationHint}
        </p>
      )}
    </Card>
  );
}
