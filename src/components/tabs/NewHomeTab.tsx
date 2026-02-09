"use client";

import { useRef } from "react";
import {
  Home,
  Zap,
  Wifi,
  Flame,
  Trash2,
  Shield,
  Mail,
  CreditCard,
  Building2,
  Car,
  Vote,
  Briefcase,
  FileText,
  Download,
  CheckCircle2,
  Circle,
  ExternalLink,
  PartyPopper,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button, EmptyState } from "@/components/common";
import { Transaction, TransactionTask } from "@/types";

gsap.registerPlugin(useGSAP);

export interface NewHomeTabProps {
  transaction: Transaction;
  tasks: TransactionTask[];
  onTaskAction?: (task: TransactionTask) => void;
}

interface ChecklistItemData {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  completed: boolean;
  externalLink?: string;
}

const UTILITY_CHECKLIST: ChecklistItemData[] = [
  {
    id: "electric",
    icon: <Zap className="w-4 h-4" />,
    label: "Electric",
    description: "Transfer or set up electric service with your local provider",
    completed: false,
  },
  {
    id: "gas",
    icon: <Flame className="w-4 h-4" />,
    label: "Gas",
    description: "Transfer natural gas service to your name",
    completed: false,
  },
  {
    id: "internet",
    icon: <Wifi className="w-4 h-4" />,
    label: "Internet & Cable",
    description: "Set up internet and cable TV service",
    completed: false,
  },
  {
    id: "trash",
    icon: <Trash2 className="w-4 h-4" />,
    label: "Trash & Recycling",
    description: "Register for trash and recycling pickup service",
    completed: false,
  },
  {
    id: "security",
    icon: <Shield className="w-4 h-4" />,
    label: "Security / Alarm",
    description: "Transfer or set up home security monitoring",
    completed: false,
  },
];

const ADDRESS_CHANGE_CHECKLIST: ChecklistItemData[] = [
  {
    id: "usps",
    icon: <Mail className="w-4 h-4" />,
    label: "USPS Mail Forwarding",
    description: "Forward your mail from your old address",
    completed: false,
    externalLink: "https://moversguide.usps.com",
  },
  {
    id: "dmv",
    icon: <Car className="w-4 h-4" />,
    label: "DMV / Driver's License",
    description: "Update your driver's license and vehicle registration",
    completed: false,
  },
  {
    id: "banks",
    icon: <CreditCard className="w-4 h-4" />,
    label: "Banks & Credit Cards",
    description: "Update billing address for all financial accounts",
    completed: false,
  },
  {
    id: "employer",
    icon: <Briefcase className="w-4 h-4" />,
    label: "Employer / HR",
    description: "Update your address with your employer for tax documents",
    completed: false,
  },
  {
    id: "insurance",
    icon: <Shield className="w-4 h-4" />,
    label: "Insurance Providers",
    description: "Update auto, health, and life insurance policies",
    completed: false,
  },
  {
    id: "voter",
    icon: <Vote className="w-4 h-4" />,
    label: "Voter Registration",
    description: "Update your voter registration to your new address",
    completed: false,
  },
];

function ChecklistSection({
  title,
  items,
}: {
  title: string;
  items: ChecklistItemData[];
}) {
  return (
    <Card variant="default" padding="md">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-elevation1 transition-colors"
          >
            {item.completed ? (
              <CheckCircle2 className="w-5 h-5 text-fern flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-[var(--text-disabled)] flex-shrink-0" />
            )}

            <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
              {item.icon}
            </div>

            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-medium ${
                  item.completed
                    ? "text-[var(--text-tertiary)] line-through"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </span>
              <p className="text-xs text-[var(--text-disabled)]">
                {item.description}
              </p>
            </div>

            {item.externalLink && (
              <a
                href={item.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-elevation2 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-spruce" />
              </a>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function NewHomeTab({
  transaction,
  tasks,
  onTaskAction,
}: NewHomeTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.children, {
      opacity: 0,
      y: 10,
      duration: 0.35,
      stagger: 0.06,
      ease: "power2.out",
    });
  }, []);

  // Post-closing tasks (Phase 6)
  const postClosingTasks = tasks.filter((t) => t.phase === 6);

  // Download tasks
  const recordedDeedTask = tasks.find((t) => t.id === "B-30");
  const titlePolicyTask = tasks.find((t) => t.id === "B-31");

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Welcome hero */}
      <Card variant="elevated" padding="lg" className="text-center">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full bg-fern/10 flex items-center justify-center">
            <PartyPopper className="w-8 h-8 text-fern" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Welcome to Your New Home!
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] max-w-lg">
            Congratulations on your purchase of{" "}
            <strong className="text-[var(--text-primary)]">
              {transaction.property.address}, {transaction.property.city},{" "}
              {transaction.property.state}
            </strong>
            . Here are some things to take care of as you settle in.
          </p>
        </div>
      </Card>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        {/* Utility transfers */}
        <ChecklistSection title="Utility Transfers" items={UTILITY_CHECKLIST} />

        {/* Address changes */}
        <ChecklistSection
          title="Address Change Checklist"
          items={ADDRESS_CHANGE_CHECKLIST}
        />
      </div>

      {/* Important downloads */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
          Important Documents
        </h3>
        <p className="text-xs text-[var(--text-disabled)] mb-4">
          These documents will be available after they are recorded and processed.
          This can take several weeks.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Recorded Deed */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              recordedDeedTask?.status === "completed"
                ? "border-fern/30 bg-fern/5"
                : "border-divider bg-elevation1/50"
            }`}
          >
            <FileText
              className={`w-5 h-5 flex-shrink-0 ${
                recordedDeedTask?.status === "completed"
                  ? "text-fern"
                  : "text-[var(--text-disabled)]"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Recorded Deed
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {recordedDeedTask?.status === "completed"
                  ? "Available for download"
                  : "7-60 days after closing"}
              </p>
            </div>
            {recordedDeedTask?.status === "completed" && (
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download
              </Button>
            )}
          </div>

          {/* Title Policy */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              titlePolicyTask?.status === "completed"
                ? "border-fern/30 bg-fern/5"
                : "border-divider bg-elevation1/50"
            }`}
          >
            <Building2
              className={`w-5 h-5 flex-shrink-0 ${
                titlePolicyTask?.status === "completed"
                  ? "text-fern"
                  : "text-[var(--text-disabled)]"
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Owner&apos;s Title Policy
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {titlePolicyTask?.status === "completed"
                  ? "Available for download"
                  : "30-90 days after closing"}
              </p>
            </div>
            {titlePolicyTask?.status === "completed" && (
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Additional post-closing reminders */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
          Additional Reminders
        </h3>
        <div className="space-y-2">
          {[
            {
              label: "Homestead Exemption",
              desc: "File for homestead exemption with your county assessor to reduce property taxes.",
            },
            {
              label: "Home Warranty",
              desc: "Register your home warranty if one was included in the purchase agreement.",
            },
            {
              label: "Mortgage Setup",
              desc: "Set up auto-pay for your mortgage and save your lender's contact information.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-2 rounded-lg"
            >
              <Circle className="w-4 h-4 text-[var(--text-disabled)] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {item.label}
                </span>
                <p className="text-xs text-[var(--text-tertiary)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
