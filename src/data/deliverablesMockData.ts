import { DeliverableStatus } from "@/types/admin";

/**
 * All 17 shared deliverables from the Contitle Portal PDF spec (X-01 through X-17).
 * These represent the documents and notifications an escrow officer pushes to buyer/seller portals
 * throughout the lifecycle of a real estate transaction.
 */
export const SHARED_DELIVERABLES: DeliverableStatus[] = [
  {
    code: "X-01",
    name: "Opening Letter / Welcome Packet",
    description:
      "Welcome packet with timeline overview sent to both buyer and seller portals on Day 1. Auto-populates the document vault.",
    expectedWindow: "Day 1",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "escrow_letter",
  },
  {
    code: "X-02",
    name: "Escrow Instructions",
    description:
      "Escrow instructions (buyer version + seller version) sent to respective portals for e-signature.",
    expectedWindow: "Day 1-3",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "escrow_instructions",
  },
  {
    code: "X-03",
    name: "Earnest Money Receipt",
    description:
      "Earnest money deposit receipt sent to both buyer and seller portals. Auto-populates the document vault.",
    expectedWindow: "Day 2-4",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "earnest_money_receipt",
  },
  {
    code: "X-04",
    name: "Title Commitment / Preliminary Title Report",
    description:
      "Title commitment or preliminary title report sent to both portals for review.",
    expectedWindow: "Day 7-10",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "title_commitment",
  },
  {
    code: "X-05",
    name: "Survey / Plat",
    description:
      "Survey or plat map (if ordered) sent to both portals. Auto-populates the document vault.",
    expectedWindow: "Day 10-20",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "survey",
  },
  {
    code: "X-06",
    name: "Settlement Statements",
    description:
      "Settlement statements (buyer version + seller version) sent to respective portals for review 2-3 days before closing.",
    expectedWindow: "2-3 days pre-close",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "settlement_statement_buyer",
  },
  {
    code: "X-07",
    name: "Closing Disclosure \u2014 Buyer",
    description:
      "Closing Disclosure for the buyer (from Lender via Escrow) sent to buyer portal for review. Must be delivered 3+ business days before closing per TRID.",
    expectedWindow: "3+ biz days pre-close",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "n_a",
    documentType: "closing_disclosure",
  },
  {
    code: "X-08",
    name: "Closing Disclosure \u2014 Seller",
    description:
      "Closing Disclosure for the seller sent to seller portal for review 2-3 days before closing.",
    expectedWindow: "2-3 days pre-close",
    status: "not_started",
    buyerPortalStatus: "n_a",
    sellerPortalStatus: "not_sent",
    documentType: "closing_disclosure",
  },
  {
    code: "X-09",
    name: "Closing Appointment Confirmation",
    description:
      "Closing appointment confirmation sent to both portals as a notification with calendar integration.",
    expectedWindow: "2-3 days pre-close",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "closing_appointment",
  },
  {
    code: "X-10",
    name: "Signed Closing Packages",
    description:
      "Signed closing packages (buyer + seller versions) sent to respective portals on closing day. Auto-populates the document vault.",
    expectedWindow: "Closing Day",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "signed_closing_package",
  },
  {
    code: "X-11",
    name: "Recording Confirmation",
    description:
      "Recording confirmation with document numbers sent to both portals on closing day as a notification and vault document.",
    expectedWindow: "Closing Day",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "recording_confirmation",
  },
  {
    code: "X-12",
    name: "Transaction Closed Notification",
    description:
      "Transaction closed notification with final status update sent to both portals on closing day.",
    expectedWindow: "Closing Day",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: undefined,
  },
  {
    code: "X-13",
    name: "Recorded Deed",
    description:
      "Copy of the recorded deed sent to buyer portal 7-60 days post-closing. Auto-populates the document vault.",
    expectedWindow: "Days 7-60 post-close",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "n_a",
    documentType: "recorded_deed",
  },
  {
    code: "X-14",
    name: "Owner's Title Insurance Policy",
    description:
      "Owner's title insurance policy sent to buyer portal 30-90 days post-closing. Auto-populates the document vault.",
    expectedWindow: "Days 30-90 post-close",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "n_a",
    documentType: "owners_title_policy",
  },
  {
    code: "X-15",
    name: "Lender's Title Insurance Policy",
    description:
      "Lender's title insurance policy issued 30-90 days post-closing. Internal only — not visible on buyer or seller portals.",
    expectedWindow: "Days 30-90 post-close",
    status: "not_started",
    buyerPortalStatus: "n_a",
    sellerPortalStatus: "n_a",
    documentType: "title_policy",
  },
  {
    code: "X-16",
    name: "1099-S Tax Form",
    description:
      "1099-S tax form sent to seller portal by January 31. Auto-populates the document vault.",
    expectedWindow: "By Jan 31",
    status: "not_started",
    buyerPortalStatus: "n_a",
    sellerPortalStatus: "not_sent",
    documentType: "form_1099s",
  },
  {
    code: "X-17",
    name: "Wire Fraud Prevention Advisory",
    description:
      "Wire fraud prevention advisory sent to both portals on Day 1 and again pre-close. Requires acknowledgement.",
    expectedWindow: "Day 1 + pre-close",
    status: "not_started",
    buyerPortalStatus: "not_sent",
    sellerPortalStatus: "not_sent",
    documentType: "wire_fraud_advisory",
  },
];
