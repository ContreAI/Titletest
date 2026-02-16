"use client";

import { useState } from "react";
import { Users, UserPlus, CheckCircle2, Mail, Phone } from "lucide-react";
import { Card, Button } from "@/components/common";
import { TransactionSide } from "@/types";
import ClientInfoForm from "./ClientInfoForm";

export interface ClientStatusCardProps {
  side: "buyer" | "seller";
  clientNames: string;
  sideData: TransactionSide;
}

export default function ClientStatusCard({
  side,
  clientNames,
  sideData,
}: ClientStatusCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [clientOnboarded, setClientOnboarded] = useState(
    sideData.clients.length > 0 && sideData.clients[0].email !== ""
  );

  const handleClientSubmit = (data: {
    name: string;
    email: string;
    phone: string;
  }) => {
    setClientOnboarded(true);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-spruce" />
          Enter Client Contact Information
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Once you provide your client's info, we'll automatically send them
          {side === "buyer"
            ? " earnest money wire instructions and their portal access."
            : " their portal access and escrow opening letter."}
        </p>
        <ClientInfoForm
          side={side}
          onSubmit={handleClientSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-spruce" />
        {side === "buyer" ? "Buyer" : "Seller"} Client
      </h2>

      {clientOnboarded ? (
        <div className="space-y-3">
          {sideData.clients.map((client, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-fern/5 border border-fern/20"
            >
              <CheckCircle2 className="w-5 h-5 text-fern flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-[var(--text-primary)]">
                  {client.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-0.5">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {client.email}
                  </span>
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-fern font-medium">Onboarded</span>
            </div>
          ))}
          <p className="text-xs text-[var(--text-tertiary)]">
            Wire instructions and portal access have been sent to your client.
          </p>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-divider rounded-xl">
          <UserPlus className="w-8 h-8 mx-auto mb-2 text-[var(--text-disabled)]" />
          <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
            No client info yet
          </p>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Enter your client's contact details to trigger automated
            onboarding.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Client Info
          </Button>
        </div>
      )}
    </Card>
  );
}
