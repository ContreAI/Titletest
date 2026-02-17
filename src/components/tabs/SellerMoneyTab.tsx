"use client";

import { useRef, useState } from "react";
import {
  DollarSign,
  Building2,
  CreditCard,
  ShieldAlert,
  Phone,
  Info,
  CheckCircle2,
  Clock,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Card, Button } from "@/components/common";
import NetProceedsBreakdown from "@/components/seller/NetProceedsBreakdown";
import WireFraudBanner from "@/components/buyer/WireFraudBanner";
import { Transaction, NetProceedsEstimate, TransactionTask } from "@/types";

gsap.registerPlugin(useGSAP);

export interface SellerMoneyTabProps {
  transaction: Transaction;
  netProceeds: NetProceedsEstimate;
  tasks: TransactionTask[];
  onTaskAction?: (task: TransactionTask) => void;
}

// Mock mortgage info form state
interface MortgageInfo {
  lenderName: string;
  loanNumber: string;
  contactPhone: string;
  contactEmail: string;
  payoffStatus: "not_submitted" | "ordered" | "received" | "reviewed";
}

interface BankAccount {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountType: "checking" | "savings";
}

export default function SellerMoneyTab({
  transaction,
  netProceeds,
  tasks,
  onTaskAction,
}: SellerMoneyTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock state for mortgage info
  const [mortgageInfo, setMortgageInfo] = useState<MortgageInfo>({
    lenderName: "",
    loanNumber: "",
    contactPhone: "",
    contactEmail: "",
    payoffStatus: "not_submitted",
  });

  // Mock state for bank account
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    confirmAccountNumber: "",
    accountType: "checking",
  });

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

  // Payoff status steps
  const payoffSteps = [
    { label: "Info Submitted", completed: mortgageInfo.payoffStatus !== "not_submitted" },
    { label: "Payoff Ordered", completed: mortgageInfo.payoffStatus === "ordered" || mortgageInfo.payoffStatus === "received" || mortgageInfo.payoffStatus === "reviewed" },
    { label: "Payoff Received", completed: mortgageInfo.payoffStatus === "received" || mortgageInfo.payoffStatus === "reviewed" },
    { label: "Reviewed", completed: mortgageInfo.payoffStatus === "reviewed" },
  ];

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Two column: Net Proceeds + Mortgage/Bank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        {/* Left: Full net proceeds breakdown */}
        <NetProceedsBreakdown estimate={netProceeds} />

        {/* Right: Mortgage + Bank forms */}
        <div className="space-y-[var(--content-gap)]">
          {/* Mortgage Information Form (S-02) */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-royal/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-royal" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Mortgage Information
              </h3>
            </div>

            {mortgageInfo.payoffStatus === "not_submitted" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                    Lender Name
                  </label>
                  <input
                    type="text"
                    value={mortgageInfo.lenderName}
                    onChange={(e) =>
                      setMortgageInfo({ ...mortgageInfo, lenderName: e.target.value })
                    }
                    placeholder="e.g., Wells Fargo"
                    className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                    Loan Number
                  </label>
                  <input
                    type="text"
                    value={mortgageInfo.loanNumber}
                    onChange={(e) =>
                      setMortgageInfo({ ...mortgageInfo, loanNumber: e.target.value })
                    }
                    placeholder="Your loan account number"
                    className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] font-[family-name:var(--font-mono)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                      Lender Phone
                    </label>
                    <input
                      type="tel"
                      value={mortgageInfo.contactPhone}
                      onChange={(e) =>
                        setMortgageInfo({ ...mortgageInfo, contactPhone: e.target.value })
                      }
                      placeholder="(555) 555-5555"
                      className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                      Lender Email
                    </label>
                    <input
                      type="email"
                      value={mortgageInfo.contactEmail}
                      onChange={(e) =>
                        setMortgageInfo({ ...mortgageInfo, contactEmail: e.target.value })
                      }
                      placeholder="payoffs@lender.com"
                      className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
                    />
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full mt-2 active:scale-[0.97]"
                  onClick={() =>
                    setMortgageInfo({ ...mortgageInfo, payoffStatus: "ordered" })
                  }
                >
                  Submit Mortgage Info
                </Button>
              </div>
            ) : (
              /* Payoff status tracker */
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {payoffSteps.map((step, i) => (
                    <div key={step.label} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.completed
                              ? "bg-fern text-white"
                              : "bg-elevation2 border border-divider"
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3 h-3 text-[var(--text-disabled)]" />
                          )}
                        </div>
                        <span className="text-[10px] mt-1 text-[var(--text-tertiary)] text-center">
                          {step.label}
                        </span>
                      </div>
                      {i < payoffSteps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${
                            step.completed ? "bg-fern" : "bg-divider"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">
                  <p>
                    <strong>Lender:</strong> {mortgageInfo.lenderName || "Not provided"}
                  </p>
                  <p>
                    <strong>Loan #:</strong>{" "}
                    <span className="font-[family-name:var(--font-mono)]">
                      {mortgageInfo.loanNumber || "Not provided"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Wire Fraud Warning */}
          <WireFraudBanner compact />

          {/* Bank Account Form (S-15) */}
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-royal/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-royal" />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Wire Instructions (Your Bank)
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankAccount.bankName}
                  onChange={(e) =>
                    setBankAccount({ ...bankAccount, bankName: e.target.value })
                  }
                  placeholder="Your bank name"
                  className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={bankAccount.routingNumber}
                  onChange={(e) =>
                    setBankAccount({ ...bankAccount, routingNumber: e.target.value })
                  }
                  placeholder="9-digit routing number"
                  maxLength={9}
                  className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] font-[family-name:var(--font-mono)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount.accountNumber}
                  onChange={(e) =>
                    setBankAccount({ ...bankAccount, accountNumber: e.target.value })
                  }
                  placeholder="Your account number"
                  className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] font-[family-name:var(--font-mono)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  value={bankAccount.confirmAccountNumber}
                  onChange={(e) =>
                    setBankAccount({
                      ...bankAccount,
                      confirmAccountNumber: e.target.value,
                    })
                  }
                  placeholder="Re-enter account number"
                  className="w-full px-3 py-2 text-sm bg-paper border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-royal/30 focus:border-royal text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] font-[family-name:var(--font-mono)]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">
                  Account Type
                </label>
                <div className="flex gap-3">
                  {(["checking", "savings"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setBankAccount({ ...bankAccount, accountType: type })
                      }
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                        bankAccount.accountType === type
                          ? "border-royal bg-royal/5 text-royal"
                          : "border-divider text-[var(--text-tertiary)] hover:border-royal/50"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full mt-2 active:scale-[0.97]"
              >
                Save Bank Information
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
