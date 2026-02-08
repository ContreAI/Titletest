"use client";

import { useState } from "react";
import {
  PenTool,
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
  Phone,
  Mail,
  User,
} from "lucide-react";
import { Card, CardHeader, Button } from "@/components/common";
import { CategoryDocumentList, ReportModal } from "@/components/documents";
import { Transaction, Document, SigningMethod, DocumentWithAction } from "@/types";
import {
  mockSigningSlots,
  mockBuyerSide,
  mockTitleCompany,
  mockDocuments,
  mockChecklistItems,
  mockParties,
} from "@/data/mockData";
import { enrichDocuments, getDocumentsByCategory } from "@/lib/documentCategories";

export interface ClosingTabProps {
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

function formatTime(dateTime: string) {
  const date = new Date(dateTime);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateHeader(dateString: string) {
  const date = new Date(dateString);
  return {
    dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
    monthDay: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
}

export default function ClosingTab({ transaction, side }: ClosingTabProps) {
  const [selectedMethod, setSelectedMethod] = useState<SigningMethod>("in_person");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const signingStatus = mockBuyerSide.signing.status;

  // Get closing documents
  const closingDocs = getDocumentsByCategory(mockDocuments, "closing");
  const enrichedDocs = enrichDocuments(closingDocs);

  // Get closing-related checklist items
  const closingChecklist = mockChecklistItems.filter(
    (item) =>
      item.category === "inspection_due_diligence" ||
      item.category === "closing_prep" ||
      item.category === "closing"
  );

  // Get key contacts
  const titleCloser = mockParties.find((p) => p.role === "title_closer");
  const lender = mockParties.find((p) => p.role === "lender");

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
        alert(`Appointment requested for ${new Date(slot.dateTime).toLocaleString()}`);
      }
    }
  };

  const handleDocumentClick = (doc: DocumentWithAction) => {
    console.log("Document clicked:", doc.name);
  };

  const handleViewReport = (doc: DocumentWithAction) => {
    setSelectedDocument(doc);
    setIsReportModalOpen(true);
  };

  const handleCloseReport = () => {
    setIsReportModalOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-storm-gray flex items-center gap-2">
          <PenTool className="w-5 h-5 text-spruce" />
          Closing
        </h1>
        <p className="text-sm text-river-stone mt-1">
          Schedule signing, track requirements, and get contact info
        </p>
      </div>

      {/* Signing Appointment Section */}
      <Card>
        <CardHeader title="Signing Appointment" />
        <div className="mt-4">
          {/* Status */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
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
                <Button variant="secondary" size="sm" className="ml-auto">
                  Add to Calendar
                </Button>
              </>
            )}
          </div>

          {/* Method Selector */}
          {signingStatus === "awaiting_selection" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-spruce bg-spruce/5"
                          : "border-border hover:border-sea-glass"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={isSelected ? "text-spruce" : "text-river-stone"}>
                          {config.icon}
                        </div>
                        <div>
                          <h4 className={`font-medium ${isSelected ? "text-spruce" : "text-storm-gray"}`}>
                            {config.label}
                          </h4>
                          <p className="text-xs text-river-stone">{config.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-storm-gray mb-3">Available Times</h4>
                {sortedDates.length === 0 ? (
                  <div className="py-6 text-center text-river-stone">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No available slots for {methodConfig[selectedMethod].label}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedDates.slice(0, 3).map((dateKey) => {
                      const slots = groupedSlots[dateKey];
                      const { dayOfWeek, monthDay } = formatDateHeader(dateKey);
                      return (
                        <div key={dateKey} className="border border-border rounded-lg overflow-hidden">
                          <div className="bg-mist px-3 py-2 border-b border-border">
                            <span className="text-xs text-river-stone uppercase mr-2">{dayOfWeek}</span>
                            <span className="text-sm font-medium text-storm-gray">{monthDay}</span>
                          </div>
                          <div className="p-2 flex flex-wrap gap-2">
                            {slots
                              .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                              .map((slot) => {
                                const isSelected = selectedSlot === slot.id;
                                return (
                                  <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlot(slot.id)}
                                    className={`py-1.5 px-3 text-sm rounded-md border transition-all ${
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
                )}

                {selectedSlot && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-river-stone">
                      Selected:{" "}
                      <span className="font-medium text-storm-gray">
                        {(() => {
                          const slot = mockSigningSlots.find((s) => s.id === selectedSlot);
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
                    <Button variant="primary" onClick={handleRequestAppointment}>
                      Request Appointment
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Closing Requirements Checklist */}
      <Card>
        <CardHeader
          title="Closing Requirements"
          subtitle={`${closingChecklist.filter((i) => i.complete).length} of ${closingChecklist.length} complete`}
        />
        <div className="mt-4 space-y-2">
          {closingChecklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 border-b border-border last:border-0"
            >
              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center shrink-0
                  ${item.complete ? "bg-fern text-white" : "border-2 border-river-stone/30"}
                `}
              >
                {item.complete && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <span
                className={`text-sm flex-1 ${
                  item.complete ? "text-river-stone line-through" : "text-storm-gray"
                }`}
              >
                {item.title}
              </span>
              {item.waitingOn && !item.complete && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-river-stone/10 text-river-stone">
                  Waiting on {item.waitingOn}
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>

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
                Government-issued photo identification
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
                Cashier&apos;s check or wire confirmation
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
                Any pending docs requested by title or lender
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Contacts */}
      <Card>
        <CardHeader title="Key Contacts" />
        <div className="mt-4 space-y-4">
          {/* Title Closer */}
          {titleCloser && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-mist">
              <div className="p-2 rounded-full bg-spruce/10 text-spruce">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-storm-gray">{titleCloser.name}</p>
                <p className="text-sm text-river-stone">{titleCloser.company}</p>
                <p className="text-xs text-spruce mt-1">Closing Agent</p>
              </div>
              <div className="flex gap-2">
                {titleCloser.contact.phone && (
                  <a
                    href={`tel:${titleCloser.contact.phone}`}
                    className="p-2 rounded-lg border border-border hover:border-spruce hover:bg-spruce/5 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-river-stone" />
                  </a>
                )}
                {titleCloser.contact.email && (
                  <a
                    href={`mailto:${titleCloser.contact.email}`}
                    className="p-2 rounded-lg border border-border hover:border-spruce hover:bg-spruce/5 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-river-stone" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Lender */}
          {lender && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-mist">
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-storm-gray">{lender.name}</p>
                <p className="text-sm text-river-stone">{lender.company}</p>
                <p className="text-xs text-blue-700 mt-1">Lender</p>
              </div>
              <div className="flex gap-2">
                {lender.contact.phone && (
                  <a
                    href={`tel:${lender.contact.phone}`}
                    className="p-2 rounded-lg border border-border hover:border-spruce hover:bg-spruce/5 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-river-stone" />
                  </a>
                )}
                {lender.contact.email && (
                  <a
                    href={`mailto:${lender.contact.email}`}
                    className="p-2 rounded-lg border border-border hover:border-spruce hover:bg-spruce/5 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-river-stone" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Title Office */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-mist">
            <div className="p-2 rounded-full bg-sea-glass/20 text-river-stone">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-storm-gray">{mockTitleCompany.name}</p>
              <p className="text-sm text-river-stone">{mockTitleCompany.address}</p>
              <p className="text-sm text-river-stone">{mockTitleCompany.phone}</p>
            </div>
            <Button
              variant="ghost"
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
              Directions
            </Button>
          </div>
        </div>
      </Card>

      {/* Closing Documents */}
      <Card>
        <CardHeader title="Closing Documents" />
        <div className="mt-4">
          <CategoryDocumentList
            documents={enrichedDocs}
            emptyMessage="No closing documents yet"
            onDocumentClick={handleDocumentClick}
            onViewReport={handleViewReport}
          />
        </div>
      </Card>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={handleCloseReport}
        document={selectedDocument}
      />
    </div>
  );
}
