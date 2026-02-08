"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button, Card } from "@/components/common";

export interface UploadDropzoneProps {
  onUpload?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export default function UploadDropzone({
  onUpload,
  accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg",
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = useCallback(
    (fileList: FileList | File[]): File[] => {
      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(fileList).forEach((file) => {
        if (file.size > maxSize) {
          errors.push(`${file.name} is too large (max ${maxSize / 1024 / 1024}MB)`);
          return;
        }
        validFiles.push(file);
      });

      if (validFiles.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        validFiles.splice(maxFiles);
      }

      if (errors.length > 0) {
        setError(errors.join(". "));
      } else {
        setError(null);
      }

      return validFiles;
    },
    [maxFiles, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = validateFiles(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        setFiles(droppedFiles);
      }
    },
    [validateFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = validateFiles(e.target.files);
        if (selectedFiles.length > 0) {
          setFiles(selectedFiles);
        }
      }
    },
    [validateFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(() => {
    if (files.length > 0 && onUpload) {
      onUpload(files);
      setFiles([]);
    }
  }, [files, onUpload]);

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative p-8 border-2 border-dashed rounded-lg transition-all
          ${
            isDragging
              ? "border-spruce bg-spruce/5"
              : "border-sea-glass hover:border-river-stone"
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center text-center">
          <div
            className={`
              w-12 h-12 rounded-full flex items-center justify-center mb-4
              ${isDragging ? "bg-spruce/10 text-spruce" : "bg-sea-glass/20 text-river-stone"}
            `}
          >
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-storm-gray mb-1">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-river-stone mb-3">
            or click to browse your computer
          </p>
          <p className="text-xs text-river-stone">
            PDF, DOC, DOCX, PNG, JPG up to {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-signal-red/10 text-signal-red text-sm">
          {error}
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="p-4 bg-mist border-t border-border">
          <p className="text-xs font-medium text-river-stone mb-2">
            Selected files ({files.length})
          </p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-2 p-2 bg-paper rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-river-stone flex-shrink-0" />
                  <span className="text-sm text-storm-gray truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-river-stone flex-shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-river-stone hover:text-signal-red transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            size="sm"
            className="mt-3 w-full"
            onClick={handleUpload}
          >
            Upload {files.length} file{files.length > 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </Card>
  );
}
