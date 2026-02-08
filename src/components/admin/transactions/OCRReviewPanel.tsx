"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  User,
  Home,
  DollarSign,
  Calendar,
  Users,
  Building2,
} from "lucide-react";
import { OCRExtractedData, ExtractedField } from "@/types/admin";
import Button from "@/components/common/Button";

interface OCRReviewPanelProps {
  data: OCRExtractedData;
  onConfirm: (editedData: EditedOCRData) => void;
  onBack: () => void;
}

export interface EditedOCRData {
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  financials: {
    purchasePrice: number;
    earnestMoney: number;
    loanType: string;
  };
  dates: {
    contractDate: string;
    closingDate: string;
    inspectionDeadline: string;
    financingDeadline: string;
    appraisalDeadline: string;
  };
  buyers: Array<{ name: string; email: string; phone: string }>;
  sellers: Array<{ name: string; email: string; phone: string }>;
  buyerAgent: { name: string; email: string; phone: string; brokerage: string };
  sellerAgent: { name: string; email: string; phone: string; brokerage: string };
}

export function OCRReviewPanel({ data, onConfirm, onBack }: OCRReviewPanelProps) {
  const [editedData, setEditedData] = useState<EditedOCRData>(() =>
    initializeEditedData(data)
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["property", "financials", "dates", "buyers", "sellers", "buyerAgent", "sellerAgent"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = (path: string, value: string | number) => {
    setEditedData((prev) => {
      const newData = { ...prev };
      const parts = path.split(".");
      let current: Record<string, unknown> = newData;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const index = parseInt(parts[i + 1]);

        if (!isNaN(index) && Array.isArray(current[part])) {
          current = (current[part] as Record<string, unknown>[])[index] as Record<string, unknown>;
          i++; // Skip the index part
        } else {
          current = current[part] as Record<string, unknown>;
        }
      }

      current[parts[parts.length - 1]] = value;
      return newData;
    });
  };

  const overallConfidence = data.confidence;
  const confidenceColor =
    overallConfidence >= 0.9
      ? "text-fern"
      : overallConfidence >= 0.75
      ? "text-amber"
      : "text-signal-red";

  return (
    <div className="space-y-6">
      {/* Confidence Banner */}
      <div className="bg-mist rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {overallConfidence >= 0.85 ? (
            <CheckCircle2 className="w-6 h-6 text-fern" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber" />
          )}
          <div>
            <h3 className="font-medium text-storm-gray">
              Data Extraction Complete
            </h3>
            <p className="text-sm text-river-stone">
              Please review and correct any fields before continuing
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${confidenceColor}`}>
            {Math.round(overallConfidence * 100)}%
          </div>
          <div className="text-xs text-river-stone">Confidence</div>
        </div>
      </div>

      {/* Property Section */}
      <ReviewSection
        title="Property Information"
        icon={Home}
        expanded={expandedSections.has("property")}
        onToggle={() => toggleSection("property")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Street Address"
            value={editedData.property.address}
            confidence={data.fields.propertyAddress?.confidence}
            onChange={(v) => updateField("property.address", v)}
          />
          <EditableField
            label="City"
            value={editedData.property.city}
            confidence={data.fields.propertyCity?.confidence}
            onChange={(v) => updateField("property.city", v)}
          />
          <EditableField
            label="State"
            value={editedData.property.state}
            confidence={data.fields.propertyState?.confidence}
            onChange={(v) => updateField("property.state", v)}
          />
          <EditableField
            label="ZIP Code"
            value={editedData.property.zip}
            confidence={data.fields.propertyZip?.confidence}
            onChange={(v) => updateField("property.zip", v)}
          />
        </div>
      </ReviewSection>

      {/* Financial Section */}
      <ReviewSection
        title="Financial Information"
        icon={DollarSign}
        expanded={expandedSections.has("financials")}
        onToggle={() => toggleSection("financials")}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EditableField
            label="Purchase Price"
            value={editedData.financials.purchasePrice}
            confidence={data.fields.purchasePrice?.confidence}
            onChange={(v) => updateField("financials.purchasePrice", parseFloat(v) || 0)}
            type="currency"
          />
          <EditableField
            label="Earnest Money"
            value={editedData.financials.earnestMoney}
            confidence={data.fields.earnestMoney?.confidence}
            onChange={(v) => updateField("financials.earnestMoney", parseFloat(v) || 0)}
            type="currency"
          />
          <EditableField
            label="Loan Type"
            value={editedData.financials.loanType}
            confidence={data.fields.loanType?.confidence}
            onChange={(v) => updateField("financials.loanType", v)}
            options={["Conventional", "FHA", "VA", "USDA", "Cash", "Other"]}
          />
        </div>
      </ReviewSection>

      {/* Dates Section */}
      <ReviewSection
        title="Key Dates"
        icon={Calendar}
        expanded={expandedSections.has("dates")}
        onToggle={() => toggleSection("dates")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EditableField
            label="Contract Date"
            value={editedData.dates.contractDate}
            confidence={data.fields.contractDate?.confidence}
            onChange={(v) => updateField("dates.contractDate", v)}
            type="date"
          />
          <EditableField
            label="Closing Date"
            value={editedData.dates.closingDate}
            confidence={data.fields.closingDate?.confidence}
            onChange={(v) => updateField("dates.closingDate", v)}
            type="date"
          />
          <EditableField
            label="Inspection Deadline"
            value={editedData.dates.inspectionDeadline}
            confidence={data.fields.inspectionDeadline?.confidence}
            onChange={(v) => updateField("dates.inspectionDeadline", v)}
            type="date"
          />
          <EditableField
            label="Appraisal Deadline"
            value={editedData.dates.appraisalDeadline}
            confidence={data.fields.appraisalDeadline?.confidence}
            onChange={(v) => updateField("dates.appraisalDeadline", v)}
            type="date"
          />
          <EditableField
            label="Financing Deadline"
            value={editedData.dates.financingDeadline}
            confidence={data.fields.financingDeadline?.confidence}
            onChange={(v) => updateField("dates.financingDeadline", v)}
            type="date"
          />
        </div>
      </ReviewSection>

      {/* Buyers Section */}
      <ReviewSection
        title="Buyer(s)"
        icon={User}
        expanded={expandedSections.has("buyers")}
        onToggle={() => toggleSection("buyers")}
      >
        {editedData.buyers.map((buyer, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 last:mb-0">
            <EditableField
              label={`Buyer ${index + 1} Name`}
              value={buyer.name}
              confidence={data.fields.buyerNames?.confidence}
              onChange={(v) => updateField(`buyers.${index}.name`, v)}
            />
            <EditableField
              label="Email"
              value={buyer.email}
              confidence={data.fields.buyerEmails?.confidence}
              onChange={(v) => updateField(`buyers.${index}.email`, v)}
              type="email"
            />
            <EditableField
              label="Phone"
              value={buyer.phone}
              confidence={data.fields.buyerPhones?.confidence}
              onChange={(v) => updateField(`buyers.${index}.phone`, v)}
              type="tel"
            />
          </div>
        ))}
      </ReviewSection>

      {/* Sellers Section */}
      <ReviewSection
        title="Seller(s)"
        icon={Users}
        expanded={expandedSections.has("sellers")}
        onToggle={() => toggleSection("sellers")}
      >
        {editedData.sellers.map((seller, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 last:mb-0">
            <EditableField
              label={`Seller ${index + 1} Name`}
              value={seller.name}
              confidence={data.fields.sellerNames?.confidence}
              onChange={(v) => updateField(`sellers.${index}.name`, v)}
            />
            <EditableField
              label="Email"
              value={seller.email}
              confidence={data.fields.sellerEmails?.confidence}
              onChange={(v) => updateField(`sellers.${index}.email`, v)}
              type="email"
            />
            <EditableField
              label="Phone"
              value={seller.phone}
              confidence={data.fields.sellerPhones?.confidence}
              onChange={(v) => updateField(`sellers.${index}.phone`, v)}
              type="tel"
            />
          </div>
        ))}
      </ReviewSection>

      {/* Buyer Agent Section */}
      <ReviewSection
        title="Buyer's Agent"
        icon={Building2}
        expanded={expandedSections.has("buyerAgent")}
        onToggle={() => toggleSection("buyerAgent")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Agent Name"
            value={editedData.buyerAgent.name}
            confidence={data.fields.buyerAgentName?.confidence}
            onChange={(v) => updateField("buyerAgent.name", v)}
          />
          <EditableField
            label="Brokerage"
            value={editedData.buyerAgent.brokerage}
            confidence={data.fields.buyerAgentBrokerage?.confidence}
            onChange={(v) => updateField("buyerAgent.brokerage", v)}
          />
          <EditableField
            label="Email"
            value={editedData.buyerAgent.email}
            confidence={data.fields.buyerAgentEmail?.confidence}
            onChange={(v) => updateField("buyerAgent.email", v)}
            type="email"
          />
          <EditableField
            label="Phone"
            value={editedData.buyerAgent.phone}
            confidence={data.fields.buyerAgentPhone?.confidence}
            onChange={(v) => updateField("buyerAgent.phone", v)}
            type="tel"
          />
        </div>
      </ReviewSection>

      {/* Seller Agent Section */}
      <ReviewSection
        title="Seller's Agent"
        icon={Building2}
        expanded={expandedSections.has("sellerAgent")}
        onToggle={() => toggleSection("sellerAgent")}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="Agent Name"
            value={editedData.sellerAgent.name}
            confidence={data.fields.sellerAgentName?.confidence}
            onChange={(v) => updateField("sellerAgent.name", v)}
          />
          <EditableField
            label="Brokerage"
            value={editedData.sellerAgent.brokerage}
            confidence={data.fields.sellerAgentBrokerage?.confidence}
            onChange={(v) => updateField("sellerAgent.brokerage", v)}
          />
          <EditableField
            label="Email"
            value={editedData.sellerAgent.email}
            confidence={data.fields.sellerAgentEmail?.confidence}
            onChange={(v) => updateField("sellerAgent.email", v)}
            type="email"
          />
          <EditableField
            label="Phone"
            value={editedData.sellerAgent.phone}
            confidence={data.fields.sellerAgentPhone?.confidence}
            onChange={(v) => updateField("sellerAgent.phone", v)}
            type="tel"
          />
        </div>
      </ReviewSection>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={onBack}>
          Back to Upload
        </Button>
        <Button variant="primary" onClick={() => onConfirm(editedData)}>
          Continue to Transaction Setup
        </Button>
      </div>
    </div>
  );
}

// Helper Components

function ReviewSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-mist/30 hover:bg-mist/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-spruce" />
          <h3 className="font-semibold text-storm-gray">{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-river-stone transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}

function EditableField({
  label,
  value,
  confidence,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string | number;
  confidence?: number;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "date" | "currency";
  options?: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);

  const confidenceColor =
    confidence === undefined
      ? "bg-river-stone/30"
      : confidence >= 0.9
      ? "bg-fern"
      : confidence >= 0.75
      ? "bg-amber"
      : "bg-signal-red";

  const displayValue =
    type === "currency"
      ? `$${Number(value).toLocaleString()}`
      : type === "date" && value
      ? new Date(value as string).toLocaleDateString()
      : String(value);

  const inputValue =
    type === "currency"
      ? String(value)
      : type === "date" && value
      ? String(value)
      : String(value);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-storm-gray">{label}</label>
        {confidence !== undefined && (
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${confidenceColor}`} />
            <span className="text-xs text-river-stone">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {options ? (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-paper text-storm-gray focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative group">
          <input
            type={type === "currency" ? "number" : type}
            value={inputValue}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            className={`
              w-full px-3 py-2 border rounded-lg
              text-storm-gray
              focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-spruce
              ${isEditing ? "border-spruce bg-paper" : "border-border bg-mist/30"}
            `}
          />
          <Edit3 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-river-stone opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      )}
    </div>
  );
}

// Initialize edited data from OCR data
function initializeEditedData(data: OCRExtractedData): EditedOCRData {
  const fields = data.fields;

  return {
    property: {
      address: fields.propertyAddress?.value || "",
      city: fields.propertyCity?.value || "",
      state: fields.propertyState?.value || "",
      zip: fields.propertyZip?.value || "",
    },
    financials: {
      purchasePrice: fields.purchasePrice?.value || 0,
      earnestMoney: fields.earnestMoney?.value || 0,
      loanType: fields.loanType?.value || "Conventional",
    },
    dates: {
      contractDate: fields.contractDate?.value || "",
      closingDate: fields.closingDate?.value || "",
      inspectionDeadline: fields.inspectionDeadline?.value || "",
      financingDeadline: fields.financingDeadline?.value || "",
      appraisalDeadline: fields.appraisalDeadline?.value || "",
    },
    buyers: (fields.buyerNames?.value || [""]).map((name, i) => ({
      name,
      email: fields.buyerEmails?.value?.[i] || "",
      phone: fields.buyerPhones?.value?.[i] || "",
    })),
    sellers: (fields.sellerNames?.value || [""]).map((name, i) => ({
      name,
      email: fields.sellerEmails?.value?.[i] || "",
      phone: fields.sellerPhones?.value?.[i] || "",
    })),
    buyerAgent: {
      name: fields.buyerAgentName?.value || "",
      email: fields.buyerAgentEmail?.value || "",
      phone: fields.buyerAgentPhone?.value || "",
      brokerage: fields.buyerAgentBrokerage?.value || "",
    },
    sellerAgent: {
      name: fields.sellerAgentName?.value || "",
      email: fields.sellerAgentEmail?.value || "",
      phone: fields.sellerAgentPhone?.value || "",
      brokerage: fields.sellerAgentBrokerage?.value || "",
    },
  };
}
