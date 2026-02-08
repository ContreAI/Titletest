import { TimelineEvent, Transaction } from "@/types";

/**
 * Generate an iCal (.ics) file content for timeline events
 */
export function generateICalFile(
  events: TimelineEvent[],
  transaction: Transaction
): string {
  const propertyAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;

  const icalEvents = events.map((event) => {
    const eventDate = new Date(event.date);
    const dateStr = formatICalDate(eventDate);
    const uid = `${event.id}@contretitle.com`;
    const summary = escapeICalText(`${event.title} - ${transaction.property.address}`);
    const description = escapeICalText(
      `Transaction: ${propertyAddress}${event.source ? `\nSource: ${event.source.document}, ${event.source.section}` : ""}`
    );

    return `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICalDateTime(new Date())}
DTSTART;VALUE=DATE:${dateStr}
DTEND;VALUE=DATE:${dateStr}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${escapeICalText(propertyAddress)}
STATUS:${event.status === "complete" ? "COMPLETED" : "CONFIRMED"}
END:VEVENT`;
  });

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Contre Title//Title Portal//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:${escapeICalText(`${transaction.property.address} - Transaction Dates`)}
${icalEvents.join("\n")}
END:VCALENDAR`;
}

/**
 * Download an iCal file
 */
export function downloadICalFile(
  events: TimelineEvent[],
  transaction: Transaction
): void {
  const icalContent = generateICalFile(events, transaction);
  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${transaction.property.address.replace(/\s+/g, "_")}_dates.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL for a single event
 */
export function generateGoogleCalendarUrl(
  event: TimelineEvent,
  transaction: Transaction
): string {
  const propertyAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;
  const eventDate = new Date(event.date);
  const dateStr = formatGoogleDate(eventDate);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${event.title} - ${transaction.property.address}`,
    dates: `${dateStr}/${dateStr}`,
    details: `Transaction: ${propertyAddress}${event.source ? `\nSource: ${event.source.document}, ${event.source.section}` : ""}`,
    location: propertyAddress,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Google Calendar URL for all events
 */
export function generateGoogleCalendarBatchUrl(
  events: TimelineEvent[],
  transaction: Transaction
): string {
  // Google Calendar doesn't support batch creation via URL
  // Return URL for the first upcoming event, with a note to use iCal for all events
  const upcomingEvents = events.filter(e => e.status !== "complete");
  const nextEvent = upcomingEvents[0] || events[0];
  return generateGoogleCalendarUrl(nextEvent, transaction);
}

/**
 * Generate Outlook Calendar URL for a single event
 */
export function generateOutlookCalendarUrl(
  event: TimelineEvent,
  transaction: Transaction
): string {
  const propertyAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;
  const eventDate = new Date(event.date);
  const startDate = eventDate.toISOString().split("T")[0];

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `${event.title} - ${transaction.property.address}`,
    startdt: startDate,
    enddt: startDate,
    allday: "true",
    body: `Transaction: ${propertyAddress}${event.source ? `\nSource: ${event.source.document}, ${event.source.section}` : ""}`,
    location: propertyAddress,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate Office 365 Outlook Calendar URL for a single event
 */
export function generateOffice365CalendarUrl(
  event: TimelineEvent,
  transaction: Transaction
): string {
  const propertyAddress = `${transaction.property.address}, ${transaction.property.city}, ${transaction.property.state} ${transaction.property.zip}`;
  const eventDate = new Date(event.date);
  const startDate = eventDate.toISOString().split("T")[0];

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `${event.title} - ${transaction.property.address}`,
    startdt: startDate,
    enddt: startDate,
    allday: "true",
    body: `Transaction: ${propertyAddress}${event.source ? `\nSource: ${event.source.document}, ${event.source.section}` : ""}`,
    location: propertyAddress,
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Helper functions

function formatICalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatICalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function formatGoogleDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
