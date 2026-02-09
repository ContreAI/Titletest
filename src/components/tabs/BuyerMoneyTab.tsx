"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import WireFraudBanner from "@/components/buyer/WireFraudBanner";
import EarnestMoneyTracker from "@/components/buyer/EarnestMoneyTracker";
import CashToCloseCalculator from "@/components/buyer/CashToCloseCalculator";
import { Card } from "@/components/common";
import { WireTracker, Transaction } from "@/types";

gsap.registerPlugin(useGSAP);

export interface BuyerMoneyTabProps {
  transaction: Transaction;
}

// Mock data — in production from API
const mockEMTracker: WireTracker = {
  type: "earnest_money",
  totalAmount: 15000,
  fraudWarningAcknowledged: true,
  steps: [
    {
      id: "em-1",
      label: "Instructions Received",
      status: "completed",
      completedDate: "Dec 5",
    },
    {
      id: "em-2",
      label: "Wire Sent",
      status: "completed",
      completedDate: "Dec 6",
    },
    {
      id: "em-3",
      label: "Receipt Confirmed",
      status: "active",
    },
  ],
};

const mockClosingFundsTracker: WireTracker = {
  type: "closing_funds",
  totalAmount: 97250,
  fraudWarningAcknowledged: false,
  steps: [
    {
      id: "cf-1",
      label: "Amount Finalized",
      status: "pending",
    },
    {
      id: "cf-2",
      label: "Instructions Received",
      status: "pending",
    },
    {
      id: "cf-3",
      label: "Wire Sent",
      status: "pending",
    },
    {
      id: "cf-4",
      label: "Funds Received",
      status: "pending",
    },
  ],
};

const mockCashToCloseItems = [
  {
    id: "closing-costs",
    label: "Closing Costs",
    amount: 8750,
    isEstimate: true,
    tooltip: "Includes title insurance, escrow fees, recording fees, and lender fees.",
  },
  {
    id: "prepaids",
    label: "Prepaids & Escrows",
    amount: 4200,
    isEstimate: true,
    tooltip: "Property taxes, homeowners insurance, and interest prepaid at closing.",
  },
  {
    id: "earnest-credit",
    label: "Earnest Money Credit",
    amount: 15000,
    isDeduction: true,
    tooltip: "Your earnest money deposit is credited toward your closing costs.",
  },
  {
    id: "seller-credit",
    label: "Seller Credit",
    amount: 5000,
    isDeduction: true,
    tooltip: "Seller has agreed to credit this amount toward your closing costs.",
  },
];

export default function BuyerMoneyTab({ transaction }: BuyerMoneyTabProps) {
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

  const purchasePrice = transaction.financials.purchasePrice;
  const loanAmount = transaction.financials.loanAmount || 0;
  const downPayment = purchasePrice - loanAmount;

  const totalCashToClose =
    downPayment +
    mockCashToCloseItems.reduce((sum, item) => {
      return sum + (item.isDeduction ? -item.amount : item.amount);
    }, 0);

  return (
    <div ref={containerRef} className="space-y-[var(--section-spacing)]">
      {/* Wire Fraud Warning — always visible */}
      <WireFraudBanner />

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--content-gap)]">
        {/* Left: Wire trackers */}
        <div className="space-y-[var(--content-gap)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Wire Transfers
          </h2>

          {/* Earnest Money Tracker */}
          <EarnestMoneyTracker tracker={mockEMTracker} />

          {/* Closing Funds Tracker */}
          <EarnestMoneyTracker tracker={mockClosingFundsTracker} />
        </div>

        {/* Right: Cash to Close */}
        <div className="space-y-[var(--content-gap)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Financial Summary
          </h2>

          <CashToCloseCalculator
            purchasePrice={purchasePrice}
            loanAmount={loanAmount}
            items={mockCashToCloseItems}
            totalCashToClose={totalCashToClose}
            isFinalized={false}
          />

          {/* Additional info card */}
          <Card variant="default" padding="md">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Key Dates
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Contract Date</span>
                <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                  {new Date(transaction.dates.contractDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Closing Date</span>
                <span className="font-[family-name:var(--font-mono)] text-[var(--text-primary)] font-semibold">
                  {new Date(transaction.dates.closingDate).toLocaleDateString()}
                </span>
              </div>
              {transaction.financials.isFinanced && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Loan Type</span>
                  <span className="text-[var(--text-primary)]">
                    {transaction.financials.loanType || "Conventional"}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
