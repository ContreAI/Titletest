# Title Company Agent Portal - Design Specification
## Complete Build Guide for Claude Code

---

## Overview

This document specifies the complete design and functionality for the Title Company Agent Portal. This portal is accessed by real estate agents (buyer's agent and seller's agent) to view transaction status, documents, timelines, and schedule closings for transactions managed by a title company.

### Portal Context

- **Users:** Real estate agents (one portal per side of transaction)
- **Access:** Password-protected unique URL per transaction side
- **Purpose:** Transparency into title company process, document access, signing scheduling
- **Branding:** White-labeled to title company

### Portal Types

Each transaction generates TWO separate portals:

| Portal | URL Pattern | User |
|--------|-------------|------|
| Buyer Agent Portal | `/tx/{transaction_id}/buyer` | Buyer's agent |
| Seller Agent Portal | `/tx/{transaction_id}/seller` | Seller's agent |

Portals are completely separate - agents cannot see the other side's information.

---

## Design System

### Color Palette (Pacific Northwest Theme)

```css
:root {
  /* Primary - Emerald/Teal */
  --primary-50: #ecfdf5;
  --primary-100: #d1fae5;
  --primary-200: #a7f3d0;
  --primary-300: #6ee7b7;
  --primary-400: #34d399;
  --primary-500: #10b981;
  --primary-600: #059669;
  --primary-700: #047857;
  --primary-800: #065f46;
  --primary-900: #064e3b;

  /* Neutral - Slate */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;

  /* Status Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;

  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;

  /* Borders */
  --border-light: #e2e8f0;
  --border-medium: #cbd5e1;
}
```

### Typography

```css
:root {
  /* Font Families */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

### Spacing Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

### Border Radius

```css
:root {
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;
}
```

### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

---

## Page Structure

### Overall Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (Fixed)                                                             │
│  - Title company logo (white-label)                                         │
│  - Property address                                                         │
│  - Settings / Help                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  TRANSACTION BANNER                                                         │
│  - Closing date with countdown                                              │
│  - Status indicator                                                         │
│  - Agent role badge                                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                             │
│  [Main] [Documents] [Timeline] [Checklist] [Parties] [Signing] [Chat]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TAB CONTENT AREA                                                           │
│  (Scrollable, changes based on selected tab)                                │
│                                                                             │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```css
/* Mobile first */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

---

## Components

### 1. Header Component

```jsx
<Header>
  <Logo src={titleCompany.logo} />
  <PropertyAddress>{transaction.property.address}</PropertyAddress>
  <HeaderActions>
    <IconButton icon="settings" />
    <IconButton icon="help" />
  </HeaderActions>
</Header>
```

**Specs:**
- Height: 64px
- Background: white
- Border-bottom: 1px solid var(--border-light)
- Logo max-height: 40px
- Position: sticky top

### 2. Transaction Banner Component

```jsx
<TransactionBanner>
  <BannerContent>
    <PropertyTitle>123 Main St, Boise ID 83702</PropertyTitle>
    <BannerMeta>
      <ClosingDate>
        <CalendarIcon />
        Closing: January 15, 2025
        <Countdown>(34 days)</Countdown>
      </ClosingDate>
      <StatusBadge status="in_progress">In Progress</StatusBadge>
      <RoleBadge>Buyer Agent</RoleBadge>
    </BannerMeta>
  </BannerContent>
</TransactionBanner>
```

**Specs:**
- Background: var(--bg-secondary)
- Padding: var(--space-4) var(--space-6)
- Property title: var(--text-xl), var(--font-semibold)
- Border-bottom: 1px solid var(--border-light)

### 3. Tab Navigation Component

```jsx
<TabNavigation>
  <Tab active={currentTab === 'main'} onClick={() => setTab('main')}>
    <HomeIcon /> Main
  </Tab>
  <Tab active={currentTab === 'documents'} onClick={() => setTab('documents')}>
    <DocumentIcon /> Documents
    {unreadDocs > 0 && <Badge>{unreadDocs}</Badge>}
  </Tab>
  <Tab active={currentTab === 'timeline'} onClick={() => setTab('timeline')}>
    <CalendarIcon /> Timeline
  </Tab>
  <Tab active={currentTab === 'checklist'} onClick={() => setTab('checklist')}>
    <ChecklistIcon /> Checklist
  </Tab>
  <Tab active={currentTab === 'parties'} onClick={() => setTab('parties')}>
    <UsersIcon /> Parties
  </Tab>
  <Tab active={currentTab === 'signing'} onClick={() => setTab('signing')}>
    <PenIcon /> Signing
    {!signingScheduled && <AlertDot />}
  </Tab>
  <Tab active={currentTab === 'chat'} onClick={() => setTab('chat')}>
    <ChatIcon /> Chat
  </Tab>
</TabNavigation>
```

**Specs:**
- Background: white
- Border-bottom: 1px solid var(--border-light)
- Tab padding: var(--space-3) var(--space-4)
- Active tab: border-bottom 2px solid var(--primary-600), color var(--primary-700)
- Inactive tab: color var(--text-secondary)
- Mobile: horizontal scroll or hamburger menu

### 4. Status Badge Component

```jsx
<StatusBadge status="complete" />  // Green
<StatusBadge status="in_progress" />  // Blue
<StatusBadge status="pending" />  // Yellow
<StatusBadge status="overdue" />  // Red
<StatusBadge status="not_started" />  // Gray
```

**Specs:**
- Padding: var(--space-1) var(--space-2)
- Border-radius: var(--radius-full)
- Font-size: var(--text-xs)
- Font-weight: var(--font-medium)

### 5. Document Card Component

```jsx
<DocumentCard>
  <DocInfo>
    <DocName>505332 title commitment</DocName>
    <DocType>TITLE COMMITMENT</DocType>
    <DocStatus status="processed">● Processed</DocStatus>
    <DocDate>Uploaded 12/10/2025</DocDate>
  </DocInfo>
  <DocActions>
    <PrimaryButton>View Report</PrimaryButton>
    <IconButton icon="file" title="View Original" />
    <IconButton icon="refresh" title="Reprocess" />
    <IconButton icon="download" title="Download" />
    <IconButton icon="mail" title="Email" />
    <IconButton icon="copy" title="Copy Link" />
    <IconButton icon="trash" title="Delete" variant="danger" />
  </DocActions>
</DocumentCard>
```

**Specs:**
- Background: white
- Border: 1px solid var(--border-light)
- Border-radius: var(--radius-lg)
- Padding: var(--space-4)
- Hover: shadow-md, border-color var(--border-medium)
- "View Report" button: Primary style, prominent
- Doc type badge: uppercase, var(--text-xs), background var(--primary-100), color var(--primary-800)

### 6. Timeline Item Component

```jsx
<TimelineItem>
  <TimelineMarker status="complete" />
  <TimelineContent>
    <TimelineDate>Dec 11</TimelineDate>
    <TimelineTitle>Contract Accepted</TimelineTitle>
    <TimelineSource>PSA §1</TimelineSource>
  </TimelineContent>
  <TimelineStatus status="complete">
    <CheckIcon /> Done
  </TimelineStatus>
</TimelineItem>
```

**Timeline Marker Specs:**
- Complete: Solid green circle with checkmark
- Current/Upcoming: Hollow green circle, pulsing animation
- Future: Gray hollow circle
- Overdue: Red solid circle with exclamation

### 7. Checklist Item Component

```jsx
<ChecklistItem>
  <Checkbox checked={item.complete} onChange={handleToggle} disabled />
  <ChecklistContent>
    <ChecklistTitle>{item.title}</ChecklistTitle>
    {item.waitingOn && (
      <WaitingOn>← Waiting on: {item.waitingOn}</WaitingOn>
    )}
  </ChecklistContent>
</ChecklistItem>
```

### 8. Party Card Component

```jsx
<PartyCard>
  <PartyRole>BUYER</PartyRole>
  <PartyName>John Smith</PartyName>
  <PartyAddress>456 Oak Ave, Boise, ID 83701</PartyAddress>
  <PartyContact>
    <ContactItem icon="phone">(208) 555-1234</ContactItem>
    <ContactItem icon="email">john.smith@email.com</ContactItem>
  </PartyContact>
</PartyCard>
```

### 9. Signing Scheduler Component

```jsx
<SigningScheduler>
  <MethodSelector>
    <MethodOption 
      selected={method === 'in_person'}
      onClick={() => setMethod('in_person')}
    >
      <BuildingIcon />
      In-person at title office
    </MethodOption>
    <MethodOption 
      selected={method === 'mobile'}
      onClick={() => setMethod('mobile')}
    >
      <CarIcon />
      Mobile notary
    </MethodOption>
    <MethodOption 
      selected={method === 'ron'}
      onClick={() => setMethod('ron')}
    >
      <VideoIcon />
      Remote Online Notarization
    </MethodOption>
  </MethodSelector>
  
  <TimeSlotGrid>
    {availableSlots.map(slot => (
      <TimeSlot 
        key={slot.id}
        selected={selectedSlot === slot.id}
        onClick={() => selectSlot(slot.id)}
      >
        {slot.day} {slot.time}
      </TimeSlot>
    ))}
  </TimeSlotGrid>
  
  <SubmitButton disabled={!selectedSlot}>
    Request Appointment
  </SubmitButton>
</SigningScheduler>
```

### 10. Chat Interface Component

```jsx
<ChatInterface>
  <ChatMessages>
    {messages.map(msg => (
      <ChatMessage key={msg.id} role={msg.role}>
        <MessageContent>{msg.content}</MessageContent>
        {msg.source && <MessageSource>{msg.source}</MessageSource>}
      </ChatMessage>
    ))}
  </ChatMessages>
  
  <SuggestedQuestions>
    {suggestions.map(q => (
      <SuggestionChip key={q} onClick={() => askQuestion(q)}>
        {q}
      </SuggestionChip>
    ))}
  </SuggestedQuestions>
  
  <ChatInput>
    <TextInput 
      placeholder="Ask a question about this transaction..."
      value={input}
      onChange={setInput}
    />
    <SendButton onClick={sendMessage}>
      <SendIcon />
    </SendButton>
  </ChatInput>
</ChatInterface>
```

---

## Tab Content Specifications

### Main Tab (Landing Page)

**Purpose:** At-a-glance overview, action items, quick access

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  NEEDS ATTENTION (Alert Box)                                                │
│  - List of action items with icons                                          │
│  - Links to relevant tabs                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐          │
│  │  COMING UP                  │  │  RECENT DOCUMENTS           │          │
│  │  - Next 4 deadlines         │  │  - Last 3 documents         │          │
│  │  - Days remaining           │  │  - Quick download           │          │
│  │  [View All →]               │  │  [View All →]               │          │
│  └─────────────────────────────┘  └─────────────────────────────┘          │
├─────────────────────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                                              │
│  [Upload Document]  [Schedule Signing]  [Connect SkySlope]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  QUICK QUESTION (Mini chat input)                                           │
│  [Ask AI about this transaction...]                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Needs Attention Logic:**
- Documents awaiting upload (based on checklist)
- Deadlines within 7 days
- Signing not scheduled (if within 14 days of closing)
- Missing SkySlope connection (show once, dismissible)

### Documents Tab

**Purpose:** All documents with AI reports, upload capability

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FROM TITLE COMPANY                                                         │
│  ───────────────────────────────────────────────────────────────────────── │
│  [DocumentCard - Title Commitment]                                          │
│  [DocumentCard - Earnest Money Receipt]                                     │
│  [DocumentCard - Settlement Statement - Pending]                            │
│  [DocumentCard - Wire Instructions - Pending]                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  YOUR UPLOADS                                                               │
│  ───────────────────────────────────────────────────────────────────────── │
│  [DocumentCard - Inspection Report]                                         │
│  [DocumentCard - Appraisal - Not Yet]                                       │
│  [Upload Dropzone]                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  SKYSLOPE CONNECTION                                                        │
│  [Connection status, matched transaction, docs pushed count]                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Document States:**
- `processed` - Green dot, View Report enabled
- `processing` - Yellow dot, spinner, View Report disabled
- `pending` - Gray, "Awaiting from Title"
- `not_uploaded` - Shows Upload button instead

**Document Actions (icon buttons):**
| Icon | Action | Notes |
|------|--------|-------|
| 📄 | View original file | Opens in new tab or modal |
| 🔄 | Reprocess | Re-run AI extraction |
| ⬇️ | Download | Download original file |
| ✉️ | Email | Opens email composer with attachment |
| 📋 | Copy link | Copy shareable link to clipboard |
| 🗑️ | Delete | Only for user uploads, confirm dialog |

### Timeline Tab

**Purpose:** Visual timeline of all critical dates

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VISUAL TIMELINE BAR                                                        │
│  ●━━━━━●━━━━━●━━━━━○━━━━━○━━━━━○━━━━━◎                                      │
│  Contract EM    Inspect Appraisal Loan  Closing                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  TIMELINE TABLE                                                             │
│  │ Date     │ Event                  │ Status   │ Days │ Source │          │
│  ├──────────┼────────────────────────┼──────────┼──────┼────────│          │
│  │ Dec 11   │ Contract Accepted      │ ✓ Done   │ --   │ PSA §1 │          │
│  │ Dec 14   │ Earnest Money Due      │ ✓ Done   │ --   │ PSA §3 │          │
│  │ Dec 21   │ Inspection Deadline    │ ⏳ 9 days│ 9    │ PSA §8 │          │
│  │ ...      │ ...                    │ ...      │ ...  │ ...    │          │
├─────────────────────────────────────────────────────────────────────────────┤
│  CALENDAR EXPORT                                                            │
│  [Google Calendar] [Outlook] [iCal Download]                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Status Indicators:**
- ✓ Done - Green checkmark
- ⏳ X days - Yellow clock (within 14 days)
- ○ Pending - Gray circle
- ⚠️ Overdue - Red warning
- 🎯 Target - For closing date

### Checklist Tab

**Purpose:** Track what's complete, what's needed, who's responsible

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PROGRESS BAR                                                               │
│  ████████░░░░░░░░ 45% Complete                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  CONTRACT & EARNEST MONEY                                                   │
│  ☑ Purchase Agreement received                                              │
│  ☑ Earnest money deposited                                                  │
│  ☑ Earnest money receipt issued                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  TITLE                                                                      │
│  ☑ Title search completed                                                   │
│  ☑ Title commitment issued                                                  │
│  ☐ Title exceptions cleared                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  ... (additional sections)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Checklist Categories:**
1. Contract & Earnest Money
2. Title
3. Inspection & Due Diligence
4. Financing
5. Closing Prep
6. Closing

**Waiting On Labels:**
- "← Waiting on: Title"
- "← Waiting on: Lender"
- "← Action needed: You"
- "← Waiting on: Seller" (buyer side only)
- "← Waiting on: Buyer" (seller side only)

### Parties Tab

**Purpose:** Contact information for all parties extracted from PSA

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BUYER(S)                                                                   │
│  [PartyCard - John Smith]                                                   │
│  [PartyCard - Mary Smith]                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  SELLER(S)                                                                  │
│  [PartyCard - Jane Doe]                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  AGENTS                                                                     │
│  [PartyCard - Buyer Agent: Sarah Johnson]                                   │
│  [PartyCard - Seller Agent: Mike Williams]                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  LENDER                                                                     │
│  [PartyCard - First National Bank / Tom Brown]                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  TITLE COMPANY                                                              │
│  [PartyCard - ABC Title / Sarah Johnson (Closer)]                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Party Card Actions:**
- Click phone to call (tel: link)
- Click email to compose (mailto: link)
- Copy contact info button

### Signing Tab

**Purpose:** Select signing method, schedule appointment

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SIGNING METHOD                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                     │
│  │ ● In-Person   │ │ ○ Mobile      │ │ ○ Remote RON  │                     │
│  │   at Office   │ │   Notary      │ │               │                     │
│  └───────────────┘ └───────────────┘ └───────────────┘                     │
│  [Change Method]                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  APPOINTMENT STATUS: ⏳ Not Yet Scheduled                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  AVAILABLE TIMES (Jan 13-17)                                                │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │      Mon 1/13   Tue 1/14   Wed 1/15   Thu 1/16   Fri 1/17      │       │
│  │ 9am     ○          ○         --          ○          --         │       │
│  │ 10am    ○          --        --          ○          ○          │       │
│  │ 11am    --         --        --          ○          ○          │       │
│  │ 2pm     ○          ○         --          ○          ○          │       │
│  │ 3pm     --         ○         --          --         --         │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  Selected: [None]                                                           │
│  [Request Appointment]                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  WHAT TO BRING                                                              │
│  • Valid government-issued photo ID                                         │
│  • Certified funds or wire confirmation                                     │
│  • Any outstanding documents                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  TITLE OFFICE LOCATION                                                      │
│  ABC Title Company                                                          │
│  100 Title Way, Suite 200, Boise, ID 83702                                 │
│  [Get Directions]                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Signing Status States:**
- `not_configured` - "Title company setting up availability"
- `awaiting_selection` - Show time slots grid
- `requested` - "Requested: Mon 1/13 @ 2pm - Awaiting confirmation"
- `confirmed` - "✓ Confirmed: Mon 1/13 @ 2pm" with calendar add buttons
- `completed` - "✓ Signing completed on Jan 13, 2025"

**Mobile Notary Additional Fields:**
- Signing address input (if mobile notary selected)
- Special instructions textarea

### Chat Tab

**Purpose:** AI-powered Q&A about the transaction

**Layout:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AI ASSISTANT                                                               │
│  Ask anything about this transaction. Answers sourced from your documents.  │
├─────────────────────────────────────────────────────────────────────────────┤
│  CHAT MESSAGES (scrollable)                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │ You: When is the inspection deadline?                           │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │ AI: The inspection deadline is December 21, 2024, which is      │       │
│  │     10 days from contract acceptance.                           │       │
│  │     (Source: Purchase Agreement, Section 8)                     │       │
│  └─────────────────────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────────────────────┤
│  SUGGESTED QUESTIONS                                                        │
│  [What contingencies apply?] [Who pays for title insurance?]               │
│  [What items are included?] [When is closing?]                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  INPUT                                                                      │
│  ┌─────────────────────────────────────────────────────────┐  [Send]       │
│  │ Ask a question...                                       │               │
│  └─────────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Chat Message Styling:**
- User messages: Right-aligned, primary color background, white text
- AI messages: Left-aligned, light gray background, dark text
- Source citations: Smaller text, muted color, italic

---

## Data Models

### Transaction

```typescript
interface Transaction {
  id: string;
  titleCompanyId: string;
  qualiaOrderId: string;
  
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    legalDescription?: string;
  };
  
  financials: {
    purchasePrice: number;
    earnestMoney: number;
    loanAmount?: number;
    downPayment?: number;
    loanType?: string;
  };
  
  dates: {
    contractDate: string;
    closingDate: string;
    signingWindowStart?: string;
    signingWindowEnd?: string;
  };
  
  status: 'pending' | 'in_progress' | 'closing_scheduled' | 'closed' | 'cancelled';
  closingAgentId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### TransactionSide

```typescript
interface TransactionSide {
  id: string;
  transactionId: string;
  side: 'buyer' | 'seller';
  
  agent: {
    name: string;
    email: string;
    phone?: string;
    brokerage?: string;
  };
  
  clients: Array<{
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }>;
  
  portal: {
    url: string;
    passwordHash: string;
  };
  
  clientPortal?: {
    enabled: boolean;
    passwordHash?: string;
  };
  
  skyslope?: {
    connected: boolean;
    transactionId?: string;
    lastSyncAt?: string;
  };
  
  signing: {
    method?: 'in_person' | 'mobile_notary' | 'ron';
    location?: string; // For mobile notary
    status: 'not_configured' | 'awaiting_selection' | 'requested' | 'confirmed' | 'completed';
    requestedSlotId?: string;
    confirmedDateTime?: string;
    completedAt?: string;
  };
  
  createdAt: string;
}
```

### Document

```typescript
interface Document {
  id: string;
  transactionId: string;
  
  name: string;
  type: DocumentType;
  filePath: string;
  
  source: 'qualia' | 'buyer_upload' | 'seller_upload' | 'title_created';
  
  routing: {
    toBuyer: boolean;
    toSeller: boolean;
  };
  
  processing: {
    status: 'pending' | 'processing' | 'processed' | 'failed';
    reportPath?: string;
    extractedData?: Record<string, any>;
    processedAt?: string;
    error?: string;
  };
  
  skyslope: {
    pushedToBuyer: boolean;
    pushedToSeller: boolean;
    buyerDocId?: string;
    sellerDocId?: string;
  };
  
  uploadedAt: string;
  uploadedBy?: string;
}

type DocumentType = 
  | 'purchase_agreement'
  | 'addendum'
  | 'earnest_money_receipt'
  | 'title_commitment'
  | 'preliminary_title_report'
  | 'settlement_statement_buyer'
  | 'settlement_statement_seller'
  | 'wire_instructions'
  | 'closing_disclosure'
  | 'deed'
  | 'title_policy'
  | 'payoff_statement'
  | 'inspection_report'
  | 'appraisal'
  | 'loan_approval'
  | 'insurance_binder'
  | 'hoa_documents'
  | 'other';
```

### TimelineEvent

```typescript
interface TimelineEvent {
  id: string;
  transactionId: string;
  
  date: string;
  title: string;
  description?: string;
  
  status: 'complete' | 'upcoming' | 'pending' | 'overdue';
  daysRemaining?: number;
  
  source?: {
    document: string;
    section: string;
  };
  
  completedAt?: string;
  completedBy?: string;
}
```

### ChecklistItem

```typescript
interface ChecklistItem {
  id: string;
  transactionId: string;
  side: 'buyer' | 'seller' | 'both';
  
  category: string;
  title: string;
  order: number;
  
  complete: boolean;
  completedAt?: string;
  
  waitingOn?: 'title' | 'lender' | 'agent' | 'buyer' | 'seller';
  linkedDocumentId?: string;
}
```

### SigningSlot

```typescript
interface SigningSlot {
  id: string;
  transactionId: string;
  
  dateTime: string;
  method: 'in_person' | 'mobile_notary' | 'ron';
  
  available: boolean;
  bookedBySide?: 'buyer' | 'seller';
  
  createdAt: string;
}
```

### Party

```typescript
interface Party {
  id: string;
  transactionId: string;
  
  role: 'buyer' | 'seller' | 'buyer_agent' | 'seller_agent' | 'lender' | 'title_closer';
  
  name: string;
  company?: string;
  
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  
  extractedFrom?: {
    documentId: string;
    field: string;
  };
}
```

### ChatMessage

```typescript
interface ChatMessage {
  id: string;
  transactionId: string;
  side: 'buyer' | 'seller';
  
  role: 'user' | 'assistant';
  content: string;
  
  source?: {
    documentName: string;
    section: string;
  };
  
  createdAt: string;
}
```

---

## API Endpoints

### Authentication

```
POST /api/portal/auth
Body: { transactionId, side, password }
Response: { token, expiresAt }
```

### Transaction Data

```
GET /api/portal/transaction
Headers: Authorization: Bearer {token}
Response: Transaction object with side-specific data
```

### Documents

```
GET /api/portal/documents
Response: Document[] (filtered by side access)

POST /api/portal/documents/upload
Body: FormData { file, documentType }
Response: Document

GET /api/portal/documents/:id/report
Response: { reportHtml, reportPdf }

POST /api/portal/documents/:id/reprocess
Response: { status: 'processing' }
```

### Timeline

```
GET /api/portal/timeline
Response: TimelineEvent[]
```

### Checklist

```
GET /api/portal/checklist
Response: ChecklistItem[] (filtered by side)
```

### Parties

```
GET /api/portal/parties
Response: Party[]
```

### Signing

```
GET /api/portal/signing/slots
Response: SigningSlot[] (filtered by method)

POST /api/portal/signing/method
Body: { method, location? }
Response: { success: true }

POST /api/portal/signing/request
Body: { slotId }
Response: { status: 'requested' }

GET /api/portal/signing/status
Response: { status, requestedSlot?, confirmedDateTime? }
```

### Chat

```
GET /api/portal/chat/messages
Response: ChatMessage[]

POST /api/portal/chat/message
Body: { content }
Response: ChatMessage (AI response)

GET /api/portal/chat/suggestions
Response: string[]
```

### SkySlope

```
GET /api/portal/skyslope/status
Response: { connected, transactionId?, docsPushed }

POST /api/portal/skyslope/connect
Initiates OAuth flow

POST /api/portal/skyslope/disconnect
Response: { success: true }
```

---

## User Flows

### 1. Initial Portal Access

```
1. Agent receives email with portal link + password
2. Agent clicks link → arrives at login screen
3. Agent enters password
4. System validates → issues JWT token
5. Agent lands on Main tab
6. System shows "Connect SkySlope" prompt (dismissible)
```

### 2. Viewing Document Report

```
1. Agent navigates to Documents tab
2. Agent clicks "View Report" on document card
3. Modal opens with AI-generated report
4. Report shows: Summary, extracted data, flagged items
5. Agent can download PDF, email, or close
```

### 3. Uploading Document

```
1. Agent clicks "Upload Document" or drags file to dropzone
2. File type selector appears
3. Agent selects document type
4. Upload begins → progress indicator
5. Processing starts → "Processing" status shown
6. Processing completes → "View Report" becomes available
7. If SkySlope connected → doc queued for push
```

### 4. Scheduling Signing

```
1. Agent navigates to Signing tab
2. Agent selects signing method (if not pre-set)
3. If mobile notary → enters signing address
4. Available time slots displayed
5. Agent selects slot
6. Agent clicks "Request Appointment"
7. Status changes to "Requested"
8. Title company receives notification
9. Title company confirms
10. Agent sees "Confirmed" status with calendar add options
```

### 5. Using AI Chat

```
1. Agent navigates to Chat tab (or uses mini-input on Main)
2. Agent types question
3. System queries transaction document embeddings
4. AI generates response with source citations
5. Response displayed with source reference
6. Agent can click suggested follow-up questions
```

### 6. Connecting SkySlope

```
1. Agent clicks "Connect SkySlope" button
2. OAuth popup opens
3. Agent authorizes Contre access
4. System searches for matching transaction by address
5. Match found → linked automatically
6. No match → agent can enter transaction ID manually
7. Connection confirmed
8. Existing docs pushed to SkySlope
9. Future docs will auto-push
```

---

## States & Loading

### Loading States

```jsx
// Skeleton for document card
<DocumentCardSkeleton>
  <SkeletonBox width="60%" height="20px" />
  <SkeletonBox width="30%" height="16px" />
  <SkeletonBox width="100px" height="32px" />
</DocumentCardSkeleton>

// Skeleton for timeline
<TimelineSkeleton>
  {[1,2,3,4,5].map(i => (
    <TimelineItemSkeleton key={i} />
  ))}
</TimelineSkeleton>
```

### Empty States

```jsx
// No documents yet
<EmptyState
  icon={<DocumentIcon />}
  title="No documents yet"
  description="Documents from the title company will appear here once ready."
/>

// No chat history
<EmptyState
  icon={<ChatIcon />}
  title="Ask a question"
  description="Get instant answers about your transaction."
>
  <SuggestedQuestions questions={defaultQuestions} />
</EmptyState>
```

### Error States

```jsx
<ErrorState
  title="Unable to load documents"
  description="There was a problem loading documents. Please try again."
  action={<Button onClick={retry}>Try Again</Button>}
/>
```

---

## Mobile Responsive Design

### Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Tab Navigation (Mobile)

- Horizontal scroll with fade indicators
- Or hamburger menu with dropdown list
- Active tab always visible/scrolled into view

### Document Cards (Mobile)

- Stack layout (not side-by-side)
- Primary action (View Report) full width
- Secondary actions in "..." overflow menu

### Signing Calendar (Mobile)

- Day selector instead of full week grid
- Or vertical list view of available slots

### Touch Targets

- Minimum 44x44px for all interactive elements
- Adequate padding between tap targets

---

## Accessibility (WCAG 2.1 AA)

### Requirements

- Color contrast 4.5:1 minimum
- Keyboard navigation for all features
- Screen reader support with ARIA labels
- Focus indicators visible
- Form labels properly associated
- Error messages announced

### Focus Management

- Tab trap in modals
- Focus returned on modal close
- Skip link to main content
- Logical tab order

---

## Animations & Transitions

```css
/* Global transition */
* {
  transition-property: color, background-color, border-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease;
}

/* Button hover lift */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Tab content fade */
.tab-content-enter {
  opacity: 0;
  transform: translateY(4px);
}
.tab-content-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 200ms ease;
}

/* Status pulse for upcoming deadlines */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.status-upcoming { animation: pulse 2s infinite; }
```

---

## Recommended File Structure

```
/src
├── /components
│   ├── /common
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Skeleton.tsx
│   │   └── EmptyState.tsx
│   ├── /layout
│   │   ├── Header.tsx
│   │   ├── TransactionBanner.tsx
│   │   ├── TabNavigation.tsx
│   │   └── PageContainer.tsx
│   ├── /documents
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentList.tsx
│   │   ├── UploadDropzone.tsx
│   │   ├── ReportModal.tsx
│   │   └── SkySlopeStatus.tsx
│   ├── /timeline
│   │   ├── TimelineBar.tsx
│   │   ├── TimelineTable.tsx
│   │   └── TimelineItem.tsx
│   ├── /checklist
│   │   ├── ChecklistSection.tsx
│   │   ├── ChecklistItem.tsx
│   │   └── ProgressBar.tsx
│   ├── /parties
│   │   ├── PartyCard.tsx
│   │   └── PartySection.tsx
│   ├── /signing
│   │   ├── MethodSelector.tsx
│   │   ├── TimeSlotGrid.tsx
│   │   ├── AppointmentStatus.tsx
│   │   └── LocationInput.tsx
│   └── /chat
│       ├── ChatInterface.tsx
│       ├── ChatMessage.tsx
│       ├── SuggestedQuestions.tsx
│       └── ChatInput.tsx
├── /pages (or /app for Next.js 13+)
│   ├── /tx
│   │   └── /[transactionId]
│   │       └── /[side]
│   │           ├── page.tsx
│   │           └── layout.tsx
│   └── /login
│       └── page.tsx
├── /hooks
│   ├── useTransaction.ts
│   ├── useDocuments.ts
│   ├── useTimeline.ts
│   ├── useChecklist.ts
│   ├── useParties.ts
│   ├── useSigning.ts
│   ├── useChat.ts
│   └── useSkyslope.ts
├── /lib
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── /types
│   └── index.ts
└── /styles
    ├── globals.css
    └── variables.css
```

---

## Tech Stack Recommendation

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom design tokens
- **State:** React Query for server state, Zustand for client state
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Animations:** Framer Motion (optional, CSS works too)
- **Date handling:** date-fns
- **File upload:** react-dropzone

---

## Implementation Priority

### Phase 1: Core Portal
1. Login/auth flow
2. Layout (header, banner, tabs)
3. Main tab with alerts
4. Documents tab with cards and reports
5. Timeline tab

### Phase 2: Full Features
6. Checklist tab
7. Parties tab
8. Signing tab with scheduler
9. Chat tab with AI integration

### Phase 3: Integrations
10. SkySlope OAuth + push
11. Calendar export
12. Email notifications
13. Mobile polish

---

## Sample Data for Development

```typescript
const sampleTransaction = {
  id: 'tx_123',
  property: {
    address: '123 Main St',
    city: 'Boise',
    state: 'ID',
    zip: '83702'
  },
  financials: {
    purchasePrice: 425000,
    earnestMoney: 10000,
    loanAmount: 340000
  },
  dates: {
    contractDate: '2024-12-11',
    closingDate: '2025-01-15'
  },
  status: 'in_progress'
};

const sampleDocuments = [
  {
    id: 'doc_1',
    name: '505332 title commitment',
    type: 'title_commitment',
    processing: { status: 'processed' },
    uploadedAt: '2024-12-10'
  },
  {
    id: 'doc_2',
    name: '505332 EM receipt',
    type: 'earnest_money_receipt',
    processing: { status: 'processed' },
    uploadedAt: '2024-12-08'
  }
];

const sampleTimeline = [
  { date: '2024-12-11', title: 'Contract Accepted', status: 'complete' },
  { date: '2024-12-14', title: 'Earnest Money Due', status: 'complete' },
  { date: '2024-12-21', title: 'Inspection Deadline', status: 'upcoming', daysRemaining: 9 },
  { date: '2024-12-28', title: 'Appraisal Due', status: 'pending', daysRemaining: 16 },
  { date: '2025-01-05', title: 'Loan Contingency', status: 'pending', daysRemaining: 24 },
  { date: '2025-01-15', title: 'Closing', status: 'pending', daysRemaining: 34 }
];

const sampleParties = [
  { role: 'buyer', name: 'John Smith', contact: { phone: '208-555-1234', email: 'john@email.com' }},
  { role: 'seller', name: 'Jane Doe', contact: { phone: '208-555-5678', email: 'jane@email.com' }},
  { role: 'buyer_agent', name: 'Sarah Johnson', company: 'ABC Realty', contact: { phone: '208-555-9999', email: 'sarah@abcrealty.com' }},
  { role: 'title_closer', name: 'Sarah Johnson', company: 'ABC Title', contact: { phone: '208-555-1000', email: 'closings@abctitle.com' }}
];
```

---

*End of Design Specification*