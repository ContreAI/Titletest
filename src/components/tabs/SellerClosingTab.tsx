"use client";

import { useMemo, useRef } from "react";
import {
  PenTool,
  Calendar,
  Key,
  CheckCircle2,
  Circle,
  FileSignature,
  Mail,
  DollarSign,
  FileText,
  Shield,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button } from "@/components/common";
import BuyerTaskRow from "@/components/buyer/BuyerTaskRow";
import { Transaction, TransactionTask, TabId } from "@/types";

gsap.registerPlugin(useGSAP);

export interface SellerClosingTabProps {
  transaction: Transaction;
  tasks: TransactionTask[];
  onTaskAction?: (task: TransactionTask) => void;
  onTabChange?: (tabId: TabId) => void;
}

interface KeyDeliveryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  delivered: boolean;
}

const KEY_DELIVERY_ITEMS: KeyDeliveryItem[] = [
  {
    id: "house-keys",
    label: "House keys (all copies)",
    icon: <Key className="w-4 h-4" />,
    delivered: false,
  },
  {
    id: "garage-openers",
    label: "Garage door openers",
    icon: <Key className="w-4 h-4" />,
    delivered: false,
  },
  {
    id: "gate-remotes",
    label: "Gate remotes / access cards",
    icon: <Key className="w-4 h-4" />,
    delivered: false,
  },
  {
    id: "access-codes",
    label: "Security / alarm codes",
    icon: <Shield className="w-4 h-4" />,
    delivered: false,
  },
  {
    id: "mailbox-keys",
    label: "Mailbox keys",
    icon: <Mail className="w-4 h-4" />,
    delivered: false,
  },
];

export default function SellerClosingTab({
  transaction,
  tasks,
  onTaskAction,
  onTabChange,
}: SellerClosingTabProps) {
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

  // Days to closing
  const daysToClose = useMemo(() => {
    const closing = new Date(transaction.dates.closingDate);
    const now = new Date();
    const diff = Math.ceil(
      (closing.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, diff);
  }, [transaction.dates.closingDate]);

  // Signing tasks (Phase 4-5)
  const signingTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (t.phase === 4 || t.phase === 5) &&
          (t.portalAction === "e_sign" || t.portalAction === "review_approve")
      ),
    [tasks]
  );

  // Post-closing tasks (Phase 6)
  const postClosingTasks = useMemo(
    () => tasks.filter((t) => t.phase === 6),
    [tasks]
  );

  // Build dependency labels
  const dependencyLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    tasks.forEach((t) => {
      labels[t.id] = t.title;
    });
    return labels;
  }, [tasks]);

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Closing countdown */}
      <Card variant="elevated" padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-royal/10 flex items-center justify-center">
              <span className="text-2xl font-bold font-[family-name:var(--font-mono)] text-royal">
                {daysToClose}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {daysToClose === 0
                  ? "Closing Day!"
                  : `${daysToClose} Days to Closing`}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {new Date(transaction.dates.closingDate).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Two column: Signing + Key Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        {/* Signing section */}
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-royal" />
            Documents to Sign
          </h3>

          <Card variant="default" padding="none">
            <div className="divide-y divide-divider/50">
              {signingTasks.length > 0 ? (
                signingTasks.map((task) => (
                  <BuyerTaskRow
                    key={task.id}
                    task={task}
                    onAction={onTaskAction}
                    dependencyLabels={dependencyLabels}
                  />
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                  No signing tasks yet. Documents will be ready closer to closing.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Key delivery checklist */}
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Key className="w-5 h-5 text-royal" />
            Key Delivery Checklist
          </h3>

          <Card variant="default" padding="md">
            <p className="text-xs text-[var(--text-tertiary)] mb-3">
              Prepare these items for delivery at closing.
            </p>
            <div className="space-y-2">
              {KEY_DELIVERY_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-elevation1 transition-colors"
                >
                  {item.delivered ? (
                    <CheckCircle2 className="w-5 h-5 text-fern flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--text-disabled)] flex-shrink-0" />
                  )}
                  <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                    {item.icon}
                  </div>
                  <span
                    className={`text-sm ${
                      item.delivered
                        ? "text-[var(--text-tertiary)] line-through"
                        : "text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Post-Closing section */}
      {postClosingTasks.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
            After Closing
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-3">
            These items will need attention after your transaction closes.
          </p>

          <Card variant="default" padding="none">
            <div className="divide-y divide-divider/50">
              {postClosingTasks.map((task) => (
                <BuyerTaskRow
                  key={task.id}
                  task={task}
                  onAction={onTaskAction}
                  dependencyLabels={dependencyLabels}
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Post-closing reminders */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
          Post-Closing Reminders
        </h3>
        <div className="space-y-2">
          {[
            {
              icon: <DollarSign className="w-4 h-4 text-fern" />,
              label: "Proceeds Wire",
              desc: "Your net proceeds will be wired to your bank account, typically within 1-2 business days after closing.",
            },
            {
              icon: <FileText className="w-4 h-4 text-royal" />,
              label: "1099-S Tax Form",
              desc: "You'll receive a 1099-S form by January 31st for the tax year of the sale.",
            },
            {
              icon: <Shield className="w-4 h-4 text-amber-400" />,
              label: "Cancel Home Insurance",
              desc: "Cancel your homeowners insurance policy after closing is confirmed and funds are disbursed.",
            },
            {
              icon: <Mail className="w-4 h-4 text-river-stone" />,
              label: "Mail Forwarding",
              desc: "Set up mail forwarding with USPS from the property address.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 p-2 rounded-lg"
            >
              <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
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
