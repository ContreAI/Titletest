"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/common";

export interface ClientInfoFormProps {
  side: "buyer" | "seller";
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  onCancel: () => void;
}

export default function ClientInfoForm({
  side,
  onSubmit,
  onCancel,
}: ClientInfoFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSubmit({ name, email, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          {side === "buyer" ? "Buyer" : "Seller"}'s Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John & Mary Smith"
          required
          className="w-full px-3 py-2 border border-divider rounded-lg bg-paper text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          className="w-full px-3 py-2 border border-divider rounded-lg bg-paper text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(208) 555-1234"
          className="w-full px-3 py-2 border border-divider rounded-lg bg-paper text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
        />
      </div>

      {/* Automation preview */}
      <div className="bg-fern/5 border border-fern/20 rounded-lg p-3">
        <p className="text-xs font-semibold text-fern flex items-center gap-1 mb-1">
          <Zap className="w-3 h-3" />
          On submit, these automations will trigger:
        </p>
        <ul className="text-xs text-[var(--text-secondary)] space-y-1 ml-4">
          {side === "buyer" ? (
            <>
              <li>Earnest money wire instructions sent to buyer</li>
              <li>Wire fraud advisory sent to buyer</li>
              <li>Buyer portal access created</li>
              <li>Escrow opening letter delivered to buyer portal</li>
            </>
          ) : (
            <>
              <li>Seller portal access created</li>
              <li>Escrow opening letter delivered to seller portal</li>
              <li>Seller info form assigned (mortgage/lien details)</li>
            </>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting || !name || !email}>
          {isSubmitting ? "Sending..." : "Submit & Send Automations"}
        </Button>
      </div>
    </form>
  );
}
