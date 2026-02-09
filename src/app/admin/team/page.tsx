"use client";

import { AdminHeader } from "@/components/admin/layout";
import { Card } from "@/components/common";
import {
  Users,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  TrendingUp,
  UserCircle,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────
type Role = "Closer" | "Processor" | "Admin";

interface TeamMember {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  activeTransactions: number;
  closingsThisMonth: number;
  onTimeRate: number | null; // null = n/a
}

// ── Mock Data ───────────────────────────────────────────────────────
const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-1",
    name: "Emily Davis",
    role: "Closer",
    email: "emily.davis@contitle.com",
    phone: "(208) 555-0101",
    activeTransactions: 12,
    closingsThisMonth: 4,
    onTimeRate: 96,
  },
  {
    id: "tm-2",
    name: "Tom Anderson",
    role: "Closer",
    email: "tom.anderson@contitle.com",
    phone: "(208) 555-0102",
    activeTransactions: 8,
    closingsThisMonth: 3,
    onTimeRate: 91,
  },
  {
    id: "tm-3",
    name: "Sarah Mitchell",
    role: "Processor",
    email: "sarah.mitchell@contitle.com",
    phone: "(208) 555-0103",
    activeTransactions: 15,
    closingsThisMonth: 6,
    onTimeRate: 98,
  },
  {
    id: "tm-4",
    name: "Mike Chen",
    role: "Admin",
    email: "mike.chen@contitle.com",
    phone: "(208) 555-0104",
    activeTransactions: 0,
    closingsThisMonth: 0,
    onTimeRate: null,
  },
];

const roleBadgeColors: Record<Role, string> = {
  Closer: "text-spruce bg-spruce/10",
  Processor: "text-sea-glass bg-sea-glass/10",
  Admin: "text-amber-600 bg-amber-50",
};

// ── Performance Helpers ─────────────────────────────────────────────
function getOnTimeColor(rate: number): string {
  if (rate >= 95) return "text-fern";
  if (rate >= 90) return "text-amber-600";
  return "text-signal-red";
}

// ── Page Component ──────────────────────────────────────────────────
export default function TeamPage() {
  const totalActive = TEAM_MEMBERS.reduce(
    (sum, m) => sum + m.activeTransactions,
    0
  );
  const closers = TEAM_MEMBERS.filter(
    (m) => m.role === "Closer" || m.role === "Processor"
  );
  const avgPerCloser =
    closers.length > 0
      ? Math.round(
          closers.reduce((s, m) => s + m.activeTransactions, 0) /
            closers.length
        )
      : 0;
  const totalClosingsThisMonth = TEAM_MEMBERS.reduce(
    (sum, m) => sum + m.closingsThisMonth,
    0
  );
  const ratedMembers = TEAM_MEMBERS.filter((m) => m.onTimeRate !== null);
  const avgOnTime =
    ratedMembers.length > 0
      ? Math.round(
          ratedMembers.reduce((s, m) => s + (m.onTimeRate ?? 0), 0) /
            ratedMembers.length
        )
      : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Team"
        subtitle="Manage team members and track performance"
      />

      <div className="p-6 space-y-6">
        {/* ── Performance Summary ────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-spruce" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Total Active
              </p>
            </div>
            <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              {totalActive}
            </p>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-sea-glass" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Avg per Closer
              </p>
            </div>
            <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              {avgPerCloser}
            </p>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-fern" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Closings This Month
              </p>
            </div>
            <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              {totalClosingsThisMonth}
            </p>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                On-Time Rate
              </p>
            </div>
            <p className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
              {avgOnTime}%
            </p>
          </Card>
        </div>

        {/* ── Team Grid ──────────────────────────────────────── */}
        <Card variant="default" padding="none">
          <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--text-secondary)]" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Team Members
              </h3>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">
              {TEAM_MEMBERS.length} members
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="rounded-lg border border-divider bg-elevation1 p-4 flex flex-col gap-3"
              >
                {/* Header: Avatar + name + role */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-elevation2 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-6 h-6 text-[var(--text-tertiary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {member.name}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${roleBadgeColors[member.role]}`}
                    >
                      {member.role}
                    </span>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-auto pt-3 border-t border-divider grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                      {member.activeTransactions}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                      Active
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold font-[family-name:var(--font-mono)] text-[var(--text-primary)]">
                      {member.closingsThisMonth}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                      This Mo.
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-semibold font-[family-name:var(--font-mono)] ${
                        member.onTimeRate !== null
                          ? getOnTimeColor(member.onTimeRate)
                          : "text-[var(--text-tertiary)]"
                      }`}
                    >
                      {member.onTimeRate !== null
                        ? `${member.onTimeRate}%`
                        : "\u2014"}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                      On-Time
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
