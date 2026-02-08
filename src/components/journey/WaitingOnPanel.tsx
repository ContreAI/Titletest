'use client';

import { WaitingOnItem, ResponsibleParty } from '@/types';
import { Clock, Building2, Landmark, User, Users, Home, ClipboardCheck } from 'lucide-react';

const PARTY_CONFIG: Record<ResponsibleParty, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = {
  lender: { label: 'Lender', icon: Landmark, color: 'text-blue-600' },
  title: { label: 'Title Company', icon: Building2, color: 'text-purple-600' },
  agent: { label: 'Agent', icon: User, color: 'text-spruce' },
  buyer: { label: 'Buyer', icon: Users, color: 'text-teal-600' },
  seller: { label: 'Seller', icon: Home, color: 'text-amber-600' },
  appraiser: { label: 'Appraiser', icon: ClipboardCheck, color: 'text-indigo-600' },
};

interface WaitingOnPanelProps {
  items: WaitingOnItem[];
}

export default function WaitingOnPanel({ items }: WaitingOnPanelProps) {
  if (items.length === 0) return null;

  // Group items by party
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.party]) {
      acc[item.party] = [];
    }
    acc[item.party].push(item);
    return acc;
  }, {} as Record<ResponsibleParty, WaitingOnItem[]>);

  return (
    <div className="bg-paper rounded-lg border border-divider shadow-[var(--shadow-1)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-elevation1 border-b border-divider flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-elevation2 flex items-center justify-center">
          <Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Waiting On</h3>
          <p className="text-xs text-[var(--text-tertiary)]">
            Items that are blocking progress
          </p>
        </div>
      </div>

      {/* Grouped items */}
      <div className="divide-y divide-divider">
        {Object.entries(groupedItems).map(([party, partyItems]) => {
          const config = PARTY_CONFIG[party as ResponsibleParty];
          const Icon = config.icon;

          return (
            <div key={party} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  From {config.label}:
                </span>
              </div>
              <ul className="space-y-1.5 ml-6">
                {partyItems.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-disabled)] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-[var(--text-secondary)]">{item.item}</span>
                      {item.expectedDuration && (
                        <span className="text-xs text-[var(--text-tertiary)] ml-2">
                          (typically {item.expectedDuration})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
