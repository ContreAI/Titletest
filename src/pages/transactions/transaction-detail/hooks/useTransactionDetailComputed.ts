import { useMemo } from 'react';
import type { TimelineDate, AlertLevel } from '../components/deal-timeline';
import type { TransactionReport } from 'modules/transaction-reports';

export const useTransactionDetailComputed = (report: TransactionReport | null) => {
  // Compute risk alerts from report data
  const riskAlerts = useMemo(() => {
    const data = report?.data || {};
    return [
      { level: 'high' as const, count: data.high_risk_count || 0 },
      { level: 'medium' as const, count: data.medium_risk_count || 0 },
      { level: 'low' as const, count: data.low_risk_count || 0 },
    ];
  }, [report?.data]);

  // Compute timeline dates from report data (5 key milestones)
  const timelineDates = useMemo<TimelineDate[]>(() => {
    const data = report?.data;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Helper to check if a date is in the past (handles null/undefined)
    const isPastOrToday = (dateStr: string | null | undefined): boolean => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      return date <= today;
    };

    // Helper to determine alert level based on days until deadline
    const getAlertInfo = (
      dateStr: string | null | undefined,
      isComplete: boolean
    ): { alertLevel: AlertLevel; alertMessage?: string; daysOverdue?: number } => {
      if (!dateStr || isComplete) {
        return { alertLevel: 'none' };
      }

      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      const diffTime = date.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) {
        // Overdue
        const daysOverdue = Math.abs(daysUntil);
        return {
          alertLevel: 'error',
          alertMessage: `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
          daysOverdue,
        };
      } else if (daysUntil <= 3) {
        // Due soon (within 3 days)
        return {
          alertLevel: 'warning',
          alertMessage: daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
        };
      }

      return { alertLevel: 'none' };
    };

    // Helper to format date for display (handles null/undefined)
    const formatDate = (dateStr: string | null | undefined): string | undefined => {
      if (!dateStr) return undefined;
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return undefined;
      }
    };

    // Build timeline items - include all dates that exist
    const items: TimelineDate[] = [];

    // 1. Effective Contract Date (Day One) - always show (no alerts, just completion)
    const contractComplete = isPastOrToday(data?.effective_contract_date);
    items.push({
      label: 'Contract Start Date (Day One)',
      caption: formatDate(data?.effective_contract_date) || 'TBD',
      date: data?.effective_contract_date || null,
      active: contractComplete,
    });

    // 2. Earnest Money Due - check for overdue
    const emComplete = isPastOrToday(data?.earnest_money_due);
    const emAlertInfo = getAlertInfo(data?.earnest_money_due, emComplete);
    items.push({
      label: 'Earnest Money',
      caption: formatDate(data?.earnest_money_due) || 'TBD',
      date: data?.earnest_money_due || null,
      active: emComplete,
      ...emAlertInfo,
    });

    // 3. Inspection Deadline - check for overdue
    const inspComplete = isPastOrToday(data?.inspection_deadline);
    const inspAlertInfo = getAlertInfo(data?.inspection_deadline, inspComplete);
    items.push({
      label: 'Inspection',
      caption: formatDate(data?.inspection_deadline) || 'TBD',
      date: data?.inspection_deadline || null,
      active: inspComplete,
      ...inspAlertInfo,
    });

    // 4. Financing Deadline - check for overdue
    const financeDate = data?.financing_deadline || data?.financial_deadline;
    const finComplete = isPastOrToday(financeDate);
    const finAlertInfo = getAlertInfo(financeDate, finComplete);
    items.push({
      label: 'Financing',
      caption: formatDate(financeDate) || 'TBD',
      date: financeDate || null,
      active: finComplete,
      ...finAlertInfo,
    });

    // 5. Closing Date - check for overdue
    const closeComplete = isPastOrToday(data?.closing_date);
    const closeAlertInfo = getAlertInfo(data?.closing_date, closeComplete);
    items.push({
      label: 'Closing',
      caption: formatDate(data?.closing_date) || 'TBD',
      date: data?.closing_date || null,
      active: closeComplete,
      ...closeAlertInfo,
    });

    return items;
  }, [report?.data]);

  // Compute AI Summary data for the expandable card
  const aiSummaryData = useMemo(() => {
    const data = report?.data;

    // Format price
    const formatPrice = (price: string | null | undefined): string => {
      if (!price) return 'Not specified';
      if (price.includes('$')) return price;
      const num = parseFloat(price);
      return !isNaN(num) ? `$${num.toLocaleString()}` : price;
    };

    // Format date
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return 'Not specified';
      try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch {
        return dateStr;
      }
    };

    // Calculate days until earnest money
    const getEarnestMoneySummary = (): string => {
      if (!data?.earnest_money_due) return 'Not specified';
      const dueDate = new Date(data.earnest_money_due);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Past due';
      if (diffDays === 0) return 'Due today';
      return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
    };

    return {
      formattedPrice: formatPrice(data?.purchase_price),
      formattedClosingDate: formatDate(data?.closing_date),
      earnestSummary: getEarnestMoneySummary(),
      fullAiSummary: data?.deal_details || 'No AI summary available. Generate a report to get an AI-powered analysis of this transaction.',
    };
  }, [report?.data]);

  // Compute grouped risks for the Risks & Alerts card
  const groupedRisks = useMemo(() => {
    // Return empty arrays if no report data
    // In the future, this could be populated from report data
    return {
      high: [] as { id: string; description: string }[],
      medium: [] as { id: string; description: string }[],
      low: [] as { id: string; description: string }[],
    };
  }, []);

  // Get top risk for collapsed view
  const topRisk = useMemo(() => {
    if (groupedRisks.high.length > 0) {
      return { id: groupedRisks.high[0].id, title: groupedRisks.high[0].description };
    }
    if (groupedRisks.medium.length > 0) {
      return { id: groupedRisks.medium[0].id, title: groupedRisks.medium[0].description };
    }
    return undefined;
  }, [groupedRisks]);

  return {
    riskAlerts,
    timelineDates,
    aiSummaryData,
    groupedRisks,
    topRisk,
  };
};

