"use client";

import { useState } from "react";
import {
  Bell,
  Mail,
  FileText,
  Calendar,
  CheckSquare,
  PenTool,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { Modal, Button, Card } from "@/components/common";

export interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const defaultPreferences: NotificationPreference[] = [
  {
    id: "new_documents",
    label: "New Documents",
    description: "When new documents are uploaded or ready for review",
    icon: <FileText className="w-5 h-5" />,
    enabled: true,
  },
  {
    id: "deadline_reminders",
    label: "Deadline Reminders",
    description: "Reminders 7 days and 1 day before important deadlines",
    icon: <Calendar className="w-5 h-5" />,
    enabled: true,
  },
  {
    id: "checklist_updates",
    label: "Checklist Updates",
    description: "When checklist items are completed or need attention",
    icon: <CheckSquare className="w-5 h-5" />,
    enabled: true,
  },
  {
    id: "signing_updates",
    label: "Signing Updates",
    description: "Appointment confirmations and reminders",
    icon: <PenTool className="w-5 h-5" />,
    enabled: true,
  },
  {
    id: "chat_messages",
    label: "Chat Messages",
    description: "When you receive a response from the AI assistant",
    icon: <MessageCircle className="w-5 h-5" />,
    enabled: false,
  },
  {
    id: "urgent_alerts",
    label: "Urgent Alerts",
    description: "Critical issues that need immediate attention",
    icon: <AlertTriangle className="w-5 h-5" />,
    enabled: true,
  },
];

export default function NotificationSettings({
  isOpen,
  onClose,
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [emailAddress, setEmailAddress] = useState("sarah@abcrealty.com");
  const [isSaving, setIsSaving] = useState(false);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    onClose();
  };

  const enabledCount = preferences.filter((p) => p.enabled).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Settings"
      size="md"
    >
      <div className="space-y-6">
        {/* Email Address */}
        <div>
          <label
            htmlFor="notification-email"
            className="block text-sm font-medium text-storm-gray mb-1"
          >
            Email Address
          </label>
          <input
            id="notification-email"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-storm-gray placeholder:text-river-stone/50 focus:outline-none focus:ring-2 focus:ring-spruce/20 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-river-stone">
            Notifications will be sent to this email address
          </p>
        </div>

        {/* Notification Preferences */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-storm-gray">
              Email Notifications
            </h3>
            <span className="text-xs text-river-stone">
              {enabledCount} of {preferences.length} enabled
            </span>
          </div>

          <div className="space-y-2">
            {preferences.map((pref) => (
              <div
                key={pref.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  pref.enabled
                    ? "border-spruce/30 bg-spruce/5"
                    : "border-border hover:border-sea-glass"
                }`}
                onClick={() => togglePreference(pref.id)}
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    pref.enabled
                      ? "bg-spruce/10 text-spruce"
                      : "bg-mist text-river-stone"
                  }`}
                >
                  {pref.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      pref.enabled ? "text-storm-gray" : "text-river-stone"
                    }`}
                  >
                    {pref.label}
                  </p>
                  <p className="text-xs text-river-stone mt-0.5">
                    {pref.description}
                  </p>
                </div>
                {/* Toggle Switch */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      pref.enabled ? "bg-spruce" : "bg-river-stone/30"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-paper shadow transition-transform ${
                        pref.enabled ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-mist border-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-spruce/10 text-spruce">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-storm-gray">
                You&apos;ll receive{" "}
                <span className="font-semibold">{enabledCount} types</span> of
                email notifications
              </p>
              <p className="text-xs text-river-stone mt-0.5">
                at {emailAddress}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            className="flex-1"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}
