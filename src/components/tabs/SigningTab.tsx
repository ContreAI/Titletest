"use client";

import { useState } from "react";
import {
  Building2,
  Car,
  Video,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
  CreditCard,
  IdCard,
} from "lucide-react";
import { Card, CardHeader, Button } from "@/components/common";
import { Transaction, SigningMethod } from "@/types";
import { mockSigningSlots, mockBuyerSide, mockTitleCompany } from "@/data/mockData";

export interface SigningTabProps {
  transaction: Transaction;
  side: "buyer" | "seller";
}

// Signing method config
const methodConfig: Record<
  SigningMethod,
  { icon: React.ReactNode; label: string; description: string }
> = {
  in_person: {
    icon: <Building2 className="w-6 h-6" />,
    label: "In-Person",
    description: "Sign at title office",
  },
  mobile_notary: {
    icon: <Car className="w-6 h-6" />,
    label: "Mobile Notary",
    description: "Notary comes to you",
  },
  ron: {
    icon: <Video className="w-6 h-6" />,
    label: "Remote Online",
    description: "Sign via video call",
  },
};

// Group slots by date
function groupSlotsByDate(slots: typeof mockSigningSlots) {
  const grouped: Record<string, typeof mockSigningSlots> = {};

  slots.forEach((slot) => {
    const date = new Date(slot.dateTime);
    const dateKey = date.toISOString().split("T")[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(slot);
  });

  return grouped;
}

// Format time from dateTime string
function formatTime(dateTime: string) {
  const date = new Date(dateTime);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Format date header
function formatDateHeader(dateString: string) {
  const date = new Date(dateString);
  return {
    dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
    monthDay: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

export default function SigningTab({ transaction }: SigningTabProps) {
  const [selectedMethod, setSelectedMethod] = useState<SigningMethod>("in_person");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const signingStatus = mockBuyerSide.signing.status;

  // Filter available slots by method
  const availableSlots = mockSigningSlots.filter(
    (slot) => slot.method === selectedMethod && slot.available
  );
  const groupedSlots = groupSlotsByDate(availableSlots);
  const sortedDates = Object.keys(groupedSlots).sort();

  const handleRequestAppointment = () => {
    if (selectedSlot) {
      const slot = mockSigningSlots.find((s) => s.id === selectedSlot);
      if (slot) {
        alert(
          `Appointment requested for ${new Date(slot.dateTime).toLocaleString()}`
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Appointment Status */}
      <Card>
        <CardHeader title="Appointment Status" />
        <div className="mt-4 flex items-center gap-3">
          {signingStatus === "awaiting_selection" && (
            <>
              <div className="p-2 rounded-full bg-amber/10 text-amber">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-storm-gray">Not Yet Scheduled</p>
                <p className="text-sm text-river-stone">
                  Select a signing method and time slot below
                </p>
              </div>
            </>
          )}
          {signingStatus === "requested" && (
            <>
              <div className="p-2 rounded-full bg-river-stone/10 text-river-stone">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-storm-gray">Pending Confirmation</p>
                <p className="text-sm text-river-stone">
                  Awaiting title company confirmation
                </p>
              </div>
            </>
          )}
          {signingStatus === "confirmed" && (
            <>
              <div className="p-2 rounded-full bg-fern/10 text-fern">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-storm-gray">Confirmed</p>
                <p className="text-sm text-river-stone">
                  {mockBuyerSide.signing.confirmedDateTime
                    ? new Date(mockBuyerSide.signing.confirmedDateTime).toLocaleString()
                    : "Date TBD"}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="secondary" size="sm">
                  Add to Calendar
                </Button>
              </div>
            </>
          )}
          {signingStatus === "completed" && (
            <>
              <div className="p-2 rounded-full bg-fern/10 text-fern">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-storm-gray">Completed</p>
                <p className="text-sm text-river-stone">
                  Signing completed on{" "}
                  {mockBuyerSide.signing.completedAt
                    ? new Date(mockBuyerSide.signing.completedAt).toLocaleDateString()
                    : "Date TBD"}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Signing Method Selector */}
      {signingStatus === "awaiting_selection" && (
        <Card>
          <CardHeader title="Signing Method" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {(Object.keys(methodConfig) as SigningMethod[]).map((method) => {
              const config = methodConfig[method];
              const isSelected = selectedMethod === method;

              return (
                <button
                  key={method}
                  onClick={() => {
                    setSelectedMethod(method);
                    setSelectedSlot(null);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all min-h-[48px] ${
                    isSelected
                      ? "border-spruce bg-spruce/5"
                      : "border-border hover:border-sea-glass"
                  }`}
                >
                  <div className="flex sm:block items-center gap-3">
                    <div
                      className={`sm:mb-2 ${
                        isSelected ? "text-spruce" : "text-river-stone"
                      }`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h4
                        className={`font-semibold ${
                          isSelected ? "text-spruce" : "text-storm-gray"
                        }`}
                      >
                        {config.label}
                      </h4>
                      <p className="text-xs text-river-stone mt-0.5 sm:mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Time Slot Selection */}
      {signingStatus === "awaiting_selection" && (
        <Card>
          <CardHeader
            title="Available Times"
            subtitle={`Signing window: ${transaction.dates.signingWindowStart ? new Date(transaction.dates.signingWindowStart).toLocaleDateString() : "TBD"} - ${transaction.dates.signingWindowEnd ? new Date(transaction.dates.signingWindowEnd).toLocaleDateString() : "TBD"}`}
          />
          <div className="mt-4">
            {sortedDates.length === 0 ? (
              <div className="py-8 text-center text-river-stone">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No available slots for {methodConfig[selectedMethod].label}</p>
              </div>
            ) : (
              <>
                {/* Desktop: Grid layout */}
                <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sortedDates.map((dateKey) => {
                    const slots = groupedSlots[dateKey];
                    const { dayOfWeek, monthDay } = formatDateHeader(dateKey);

                    return (
                      <div key={dateKey}>
                        {/* Date Header */}
                        <div className="text-center mb-3 pb-2 border-b border-border">
                          <div className="text-xs text-river-stone uppercase">
                            {dayOfWeek}
                          </div>
                          <div className="text-sm font-semibold text-storm-gray">
                            {monthDay}
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-2">
                          {slots
                            .sort(
                              (a, b) =>
                                new Date(a.dateTime).getTime() -
                                new Date(b.dateTime).getTime()
                            )
                            .map((slot) => {
                              const isSelected = selectedSlot === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot.id)}
                                  className={`w-full py-2 px-3 text-sm rounded-lg border transition-all min-h-[44px] ${
                                    isSelected
                                      ? "border-spruce bg-spruce text-white"
                                      : "border-border hover:border-sea-glass text-storm-gray"
                                  }`}
                                >
                                  {formatTime(slot.dateTime)}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: Vertical list grouped by date */}
                <div className="sm:hidden space-y-4">
                  {sortedDates.map((dateKey) => {
                    const slots = groupedSlots[dateKey];
                    const { dayOfWeek, monthDay } = formatDateHeader(dateKey);

                    return (
                      <div key={dateKey} className="border border-border rounded-lg overflow-hidden">
                        {/* Date Header */}
                        <div className="bg-mist px-4 py-2 border-b border-border">
                          <span className="text-xs text-river-stone uppercase mr-2">
                            {dayOfWeek}
                          </span>
                          <span className="text-sm font-semibold text-storm-gray">
                            {monthDay}
                          </span>
                        </div>

                        {/* Time Slots - horizontal wrap */}
                        <div className="p-3 flex flex-wrap gap-2">
                          {slots
                            .sort(
                              (a, b) =>
                                new Date(a.dateTime).getTime() -
                                new Date(b.dateTime).getTime()
                            )
                            .map((slot) => {
                              const isSelected = selectedSlot === slot.id;
                              return (
                                <button
                                  key={slot.id}
                                  onClick={() => setSelectedSlot(slot.id)}
                                  className={`py-2 px-4 text-sm rounded-lg border transition-all min-h-[44px] ${
                                    isSelected
                                      ? "border-spruce bg-spruce text-white"
                                      : "border-border hover:border-sea-glass text-storm-gray"
                                  }`}
                                >
                                  {formatTime(slot.dateTime)}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Request Button */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div>
                {selectedSlot && (
                  <p className="text-sm text-storm-gray">
                    <span className="text-river-stone">Selected:</span>{" "}
                    <span className="font-medium">
                      {(() => {
                        const slot = mockSigningSlots.find(
                          (s) => s.id === selectedSlot
                        );
                        if (slot) {
                          return new Date(slot.dateTime).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          });
                        }
                        return "";
                      })()}
                    </span>
                  </p>
                )}
              </div>
              <Button
                variant="primary"
                disabled={!selectedSlot}
                onClick={handleRequestAppointment}
              >
                Request Appointment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* What to Bring */}
      <Card>
        <CardHeader title="What to Bring" />
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-spruce/10 text-spruce">
              <IdCard className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-storm-gray">Valid Photo ID</p>
              <p className="text-sm text-river-stone">
                Government-issued photo identification (driver&apos;s license, passport)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-spruce/10 text-spruce">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-storm-gray">Certified Funds</p>
              <p className="text-sm text-river-stone">
                Cashier&apos;s check or wire transfer confirmation for closing costs
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-spruce/10 text-spruce">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="font-medium text-storm-gray">Outstanding Documents</p>
              <p className="text-sm text-river-stone">
                Any documents requested by title or lender that haven&apos;t been submitted
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Title Office Location */}
      {selectedMethod === "in_person" && (
        <Card>
          <CardHeader title="Title Office Location" />
          <div className="mt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sea-glass/20 text-river-stone">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-storm-gray">
                  {mockTitleCompany.name}
                </p>
                <p className="text-sm text-river-stone mt-1">
                  {mockTitleCompany.address}
                </p>
                <p className="text-sm text-river-stone">
                  {mockTitleCompany.phone}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                rightIcon={<ExternalLink className="w-4 h-4" />}
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      mockTitleCompany.address
                    )}`,
                    "_blank"
                  );
                }}
              >
                Get Directions
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
