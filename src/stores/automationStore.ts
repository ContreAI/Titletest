import { create } from "zustand";
import type {
  AutomationEvent,
  AutomationTrigger,
  AutomationSummary,
} from "@/types/automation";

// ============================================
// Automation Store: Tracks all automation events
// per transaction across all personas
// ============================================

interface AutomationStoreState {
  // Events keyed by transactionId
  events: Record<string, AutomationEvent[]>;

  // Actions
  addEvent: (event: AutomationEvent) => void;
  addEvents: (events: AutomationEvent[]) => void;
  updateEventStatus: (
    transactionId: string,
    eventId: string,
    status: AutomationEvent["status"]
  ) => void;
  getEventsForTransaction: (transactionId: string) => AutomationEvent[];
  getEventsByTrigger: (
    transactionId: string,
    trigger: AutomationTrigger
  ) => AutomationEvent[];
  getSummary: (transactionId: string) => AutomationSummary;
  clearTransaction: (transactionId: string) => void;
}

export const useAutomationStore = create<AutomationStoreState>((set, get) => ({
  events: {},

  addEvent: (event) => {
    set((state) => {
      const txEvents = state.events[event.transactionId] || [];
      return {
        events: {
          ...state.events,
          [event.transactionId]: [...txEvents, event],
        },
      };
    });
  },

  addEvents: (newEvents) => {
    if (newEvents.length === 0) return;
    set((state) => {
      const updated = { ...state.events };
      newEvents.forEach((event) => {
        const existing = updated[event.transactionId] || [];
        updated[event.transactionId] = [...existing, event];
      });
      return { events: updated };
    });
  },

  updateEventStatus: (transactionId, eventId, status) => {
    set((state) => {
      const txEvents = state.events[transactionId] || [];
      return {
        events: {
          ...state.events,
          [transactionId]: txEvents.map((e) =>
            e.id === eventId ? { ...e, status } : e
          ),
        },
      };
    });
  },

  getEventsForTransaction: (transactionId) => {
    return get().events[transactionId] || [];
  },

  getEventsByTrigger: (transactionId, trigger) => {
    const txEvents = get().events[transactionId] || [];
    return txEvents.filter((e) => e.trigger === trigger);
  },

  getSummary: (transactionId) => {
    const txEvents = get().events[transactionId] || [];
    const completed = txEvents.filter((e) => e.status === "completed");
    const pending = txEvents.filter((e) => e.status === "pending");
    const lastEvent = txEvents.length > 0 ? txEvents[txEvents.length - 1] : null;

    const activeFlows = [
      ...new Set(txEvents.filter((e) => e.status === "pending").map((e) => e.trigger)),
    ];

    return {
      totalEvents: txEvents.length,
      completedEvents: completed.length,
      pendingEvents: pending.length,
      lastEventTimestamp: lastEvent?.timestamp || null,
      activeFlows,
    };
  },

  clearTransaction: (transactionId) => {
    set((state) => {
      const updated = { ...state.events };
      delete updated[transactionId];
      return { events: updated };
    });
  },
}));
