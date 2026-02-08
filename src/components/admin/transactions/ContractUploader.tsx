"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Button from "@/components/common/Button";

interface ContractUploaderProps {
  onFileSelected: (file: File) => void;
  onProcess: () => void;
  isProcessing: boolean;
  processingStatus?: "idle" | "processing" | "success" | "error";
  error?: string;
}

export function ContractUploader({
  onFileSelected,
  onProcess,
  isProcessing,
  processingStatus = "idle",
  error,
}: ContractUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB
    disabled: isProcessing,
  });

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8
            transition-colors duration-200 cursor-pointer
            ${isDragActive
              ? "border-spruce bg-spruce/5"
              : "border-border hover:border-sea-glass hover:bg-mist/50"
            }
            ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-mist rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-river-stone" />
            </div>
            <h3 className="text-lg font-semibold text-storm-gray mb-2">
              Upload Purchase Agreement
            </h3>
            <p className="text-river-stone mb-4">
              {isDragActive
                ? "Drop the file here..."
                : "Drag and drop your contract, or click to browse"}
            </p>
            <p className="text-sm text-river-stone/70">
              PDF, DOC, DOCX, or image files up to 25MB
            </p>
          </div>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="border border-border rounded-xl p-4">
          <div className="flex items-start gap-4">
            {/* File Icon */}
            <div className="w-12 h-12 bg-mist rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-spruce" />
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-storm-gray truncate">
                {selectedFile.name}
              </h4>
              <p className="text-sm text-river-stone">
                {formatFileSize(selectedFile.size)}
              </p>

              {/* Processing Status */}
              {processingStatus === "processing" && (
                <div className="flex items-center gap-2 mt-2 text-sm text-spruce">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting contract data...</span>
                </div>
              )}

              {processingStatus === "success" && (
                <div className="flex items-center gap-2 mt-2 text-sm text-fern">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Data extracted successfully</span>
                </div>
              )}

              {processingStatus === "error" && (
                <div className="flex items-center gap-2 mt-2 text-sm text-signal-red">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error || "Failed to process document"}</span>
                </div>
              )}
            </div>

            {/* Remove Button */}
            {!isProcessing && processingStatus !== "success" && (
              <button
                onClick={removeFile}
                className="p-1.5 text-river-stone hover:text-signal-red hover:bg-signal-red/10 rounded-lg transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Process Button */}
          {processingStatus === "idle" && (
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="primary"
                onClick={onProcess}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                <FileText className="w-4 h-4 mr-2" />
                Extract Contract Data
              </Button>
              <p className="text-xs text-river-stone mt-2">
                Our AI will extract property details, parties, dates, and financial information from your contract.
              </p>
            </div>
          )}

          {/* Error Retry */}
          {processingStatus === "error" && (
            <div className="mt-4 pt-4 border-t border-border flex gap-3">
              <Button variant="primary" onClick={onProcess}>
                Try Again
              </Button>
              <Button variant="ghost" onClick={removeFile}>
                Choose Different File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
