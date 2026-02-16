"use client";

import {
  Mail,
  FileText,
  Zap,
  Clock,
  Link as LinkIcon,
  Shield,
  Search,
} from "lucide-react";
import { Card } from "@/components/common";
import { EditedOCRData } from "@/components/admin/transactions";

export interface AutomationPreviewProps {
  editedData: EditedOCRData;
}

interface AutomationStep {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  timing: string;
  category: "immediate" | "agent_action" | "automated";
}

export default function AutomationPreview({
  editedData,
}: AutomationPreviewProps) {
  const steps: AutomationStep[] = [
    {
      icon: Mail,
      label: `Email portal invitation to ${editedData.buyerAgent.name || "Buyer's Agent"}`,
      description: `Personalized email with secure portal link sent to ${editedData.buyerAgent.email || "buyer agent email"}. Agent will enter their client's contact info to trigger wire instructions.`,
      timing: "Immediately",
      category: "immediate",
    },
    {
      icon: Mail,
      label: `Email portal invitation to ${editedData.sellerAgent.name || "Seller's Agent"}`,
      description: `Personalized email with secure portal link sent to ${editedData.sellerAgent.email || "seller agent email"}. Agent will enter their client's contact info.`,
      timing: "Immediately",
      category: "immediate",
    },
    {
      icon: FileText,
      label: "AI report generated for purchase contract",
      description:
        "Key terms extraction: price, dates, contingencies, parties, financing terms. Summary available in document vault.",
      timing: "Immediately",
      category: "immediate",
    },
    {
      icon: Clock,
      label: "Transaction timeline auto-generated",
      description:
        "Key dates from the contract (inspections, financing, closing) populated into the transaction timeline with automated reminders.",
      timing: "Immediately",
      category: "immediate",
    },
    {
      icon: LinkIcon,
      label: "Agent enters client contact info",
      description:
        "When the agent clicks their portal link and submits client details, the system auto-sends earnest money wire instructions to the buyer.",
      timing: "When agent onboards",
      category: "agent_action",
    },
    {
      icon: Shield,
      label: "Wire fraud advisory sent to clients",
      description:
        "Automatic wire fraud prevention advisory sent to both buyer and seller when their contact info is provided.",
      timing: "After client info entered",
      category: "automated",
    },
    {
      icon: Search,
      label: "Title report triggers lien holder identification",
      description:
        "When you upload the title commitment, AI will extract and summarize lien holders and automatically trigger payoff demand requests.",
      timing: "When title report uploaded",
      category: "automated",
    },
  ];

  const categoryLabels = {
    immediate: "Fires Immediately on Create",
    agent_action: "Triggered by Agent Action",
    automated: "Automated Follow-Up",
  };

  const categoryColors = {
    immediate: "border-fern/30 bg-fern/5",
    agent_action: "border-sea-glass/30 bg-sea-glass/5",
    automated: "border-spruce/20 bg-spruce/5",
  };

  const categories = ["immediate", "agent_action", "automated"] as const;

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categorySteps = steps.filter((s) => s.category === category);
        if (categorySteps.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
              {categoryLabels[category]}
            </h3>
            <div className="space-y-3">
              {categorySteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card
                    key={index}
                    className={`border ${categoryColors[category]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-paper flex-shrink-0">
                        <Icon className="w-4 h-4 text-spruce" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)]">
                          {step.label}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {step.description}
                        </p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0 bg-paper px-2 py-1 rounded">
                        {step.timing}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
