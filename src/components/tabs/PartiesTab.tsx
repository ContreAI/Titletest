"use client";

import { Phone, Mail, MapPin, Building2, Copy } from "lucide-react";
import { Card, CardHeader, Badge, IconButton } from "@/components/common";
import { Transaction, PartyRole } from "@/types";
import { mockParties } from "@/data/mockData";

export interface PartiesTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

// Role display names and groupings
const roleConfig: Record<
  PartyRole,
  { label: string; badgeColor: string; group: string }
> = {
  buyer: { label: "BUYER", badgeColor: "bg-spruce/10 text-spruce", group: "Buyers" },
  seller: { label: "SELLER", badgeColor: "bg-fern/10 text-fern", group: "Sellers" },
  buyer_agent: { label: "BUYER AGENT", badgeColor: "bg-river-stone/10 text-river-stone", group: "Agents" },
  seller_agent: { label: "SELLER AGENT", badgeColor: "bg-river-stone/10 text-river-stone", group: "Agents" },
  lender: { label: "LENDER", badgeColor: "bg-amber/10 text-amber", group: "Lender" },
  title_closer: { label: "TITLE CLOSER", badgeColor: "bg-sea-glass/30 text-storm-gray", group: "Title Company" },
};

// Group order
const groupOrder = ["Buyers", "Sellers", "Agents", "Lender", "Title Company"];

// Party Card Component
function PartyCard({ party }: { party: (typeof mockParties)[0] }) {
  const config = roleConfig[party.role];

  const handleCopyContact = () => {
    const contactInfo = [
      party.name,
      party.company,
      party.contact.phone,
      party.contact.email,
      party.contact.address,
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(contactInfo);
    alert("Contact info copied to clipboard!");
  };

  return (
    <div className="p-4 border border-border rounded-lg bg-paper hover:border-sea-glass hover:shadow-[var(--shadow-0)] transition-all">
      {/* Role Badge */}
      <span
        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${config.badgeColor}`}
      >
        {config.label}
      </span>

      {/* Name */}
      <h4 className="mt-2 text-lg font-semibold text-storm-gray">{party.name}</h4>

      {/* Company */}
      {party.company && (
        <div className="flex items-center gap-1.5 mt-1 text-sm text-river-stone">
          <Building2 className="w-3.5 h-3.5" />
          {party.company}
        </div>
      )}

      {/* Address */}
      {party.contact.address && (
        <div className="flex items-start gap-1.5 mt-2 text-sm text-river-stone">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{party.contact.address}</span>
        </div>
      )}

      {/* Contact Actions */}
      <div className="flex items-center gap-2 mt-4">
        {party.contact.phone && (
          <a
            href={`tel:${party.contact.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-spruce bg-spruce/10 rounded-lg hover:bg-spruce/20 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {party.contact.phone}
          </a>
        )}
        {party.contact.email && (
          <a
            href={`mailto:${party.contact.email}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-river-stone bg-mist rounded-lg hover:bg-sea-glass/20 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
        )}
        <IconButton
          variant="ghost"
          size="sm"
          label="Copy contact info"
          onClick={handleCopyContact}
        >
          <Copy className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
}

export default function PartiesTab({ transaction, side }: PartiesTabProps) {
  // Group parties by their group
  const groupedParties = groupOrder.reduce((acc, groupName) => {
    const parties = mockParties.filter(
      (party) => roleConfig[party.role].group === groupName
    );
    if (parties.length > 0) {
      acc[groupName] = parties;
    }
    return acc;
  }, {} as Record<string, typeof mockParties>);

  return (
    <div className="space-y-6">
      {groupOrder.map((groupName) => {
        const parties = groupedParties[groupName];
        if (!parties || parties.length === 0) return null;

        return (
          <Card key={groupName}>
            <CardHeader title={groupName} />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {parties.map((party) => (
                <PartyCard key={party.id} party={party} />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
