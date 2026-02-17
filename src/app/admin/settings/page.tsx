"use client";

import { Settings, Building2, Bell, Shield, Palette } from "lucide-react";
import { AdminHeader } from "@/components/admin/layout";
import { Card } from "@/components/common";

const SETTING_SECTIONS = [
  {
    icon: Building2,
    title: "Company Profile",
    description: "Company name, logo, contact information, and license details",
  },
  {
    icon: Bell,
    title: "Notification Preferences",
    description: "Default notification channels, timing rules, and escalation settings",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description: "Wire fraud prevention settings, access controls, and audit log configuration",
  },
  {
    icon: Palette,
    title: "Portal Customization",
    description: "Branding, colors, and client-facing portal appearance",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader
        title="Settings"
        subtitle="System configuration and preferences"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SETTING_SECTIONS.map((section) => (
            <Card key={section.title} variant="default" padding="md">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-royal/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-5 h-5 text-royal" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    {section.title}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {section.description}
                  </p>
                  <button className="mt-3 text-xs font-medium text-royal hover:text-royal-300 transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
