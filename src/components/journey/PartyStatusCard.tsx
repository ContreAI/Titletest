'use client';

import { ResponsibleParty, PartyTask } from '@/types';
import { Check, Clock, Loader2, Building2, Landmark, User, Users, Home, ClipboardCheck } from 'lucide-react';

// Party configuration
const PARTY_CONFIG: Record<ResponsibleParty, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = {
  lender: {
    label: 'Lender',
    icon: Landmark,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  title: {
    label: 'Title Co',
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  agent: {
    label: 'Agent',
    icon: User,
    color: 'text-spruce',
    bgColor: 'bg-spruce/10',
  },
  buyer: {
    label: 'Buyer',
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  seller: {
    label: 'Seller',
    icon: Home,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  appraiser: {
    label: 'Appraiser',
    icon: ClipboardCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
};

interface PartyStatusCardProps {
  party: ResponsibleParty;
  task: string;
  status: 'complete' | 'in_progress' | 'waiting';
  completedDate?: string;
  estimatedDate?: string;
  details?: string;
  compact?: boolean;
}

export default function PartyStatusCard({
  party,
  task,
  status,
  completedDate,
  estimatedDate,
  details,
  compact = false,
}: PartyStatusCardProps) {
  const config = PARTY_CONFIG[party];
  const Icon = config.icon;

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <Check className="w-4 h-4 text-fern" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      case 'waiting':
        return <Clock className="w-4 h-4 text-[var(--text-disabled)]" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'complete':
        return completedDate || 'Complete';
      case 'in_progress':
        return estimatedDate ? `Est: ${estimatedDate}` : 'In Progress';
      case 'waiting':
        return 'Waiting';
    }
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'complete':
        return 'border-fern-200 bg-fern-50/50';
      case 'in_progress':
        return 'border-amber-200 bg-amber-50/50';
      case 'waiting':
        return 'border-divider bg-elevation1/50';
    }
  };

  if (compact) {
    return (
      <div className={`rounded-lg border p-3 ${getStatusStyles()}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-6 h-6 rounded-md ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{config.label}</span>
          {getStatusIcon()}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">{task}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 p-4 transition-all hover:shadow-[var(--shadow-1)] ${getStatusStyles()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--text-primary)]">{config.label}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {getStatusIcon()}
              <span className={`text-xs font-medium ${
                status === 'complete' ? 'text-fern' :
                status === 'in_progress' ? 'text-amber-600' :
                'text-[var(--text-tertiary)]'
              }`}>
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{task}</p>
        {details && (
          <p className="text-xs text-[var(--text-tertiary)]">{details}</p>
        )}
      </div>
    </div>
  );
}

// Grid component to display multiple party status cards
interface PartyStatusGridProps {
  tasks: PartyTask[];
  compact?: boolean;
}

export function PartyStatusGrid({ tasks, compact = false }: PartyStatusGridProps) {
  return (
    <div className={`grid gap-3 ${
      compact
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {tasks.map((task) => (
        <PartyStatusCard
          key={task.id}
          party={task.party}
          task={task.task}
          status={task.status}
          completedDate={task.completedDate}
          estimatedDate={task.estimatedDate}
          details={task.details}
          compact={compact}
        />
      ))}
    </div>
  );
}
