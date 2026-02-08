'use client';

import { Milestone } from '@/types';
import { Calendar, MapPin, Clock, PartyPopper, Flag, CalendarCheck } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';

interface TimelineMilestoneProps {
  milestone: Milestone;
  isLast?: boolean;
}

function TimelineMilestone({ milestone, isLast }: TimelineMilestoneProps) {
  const daysUntil = differenceInDays(new Date(milestone.date), new Date());
  const isPastDate = isPast(new Date(milestone.date));

  const getTypeIcon = () => {
    if (milestone.isClosingDay) return PartyPopper;
    switch (milestone.type) {
      case 'deadline':
        return Flag;
      case 'appointment':
        return CalendarCheck;
      case 'milestone':
      default:
        return Calendar;
    }
  };

  const getNodeStyles = () => {
    if (milestone.isClosingDay) {
      return 'bg-spruce text-white border-spruce ring-4 ring-spruce/20';
    }
    if (isPastDate) {
      return 'bg-elevation2 border-elevation4 text-[var(--text-disabled)]';
    }
    if (daysUntil <= 3) {
      return 'bg-amber-50 border-amber-400 text-amber-600';
    }
    return 'bg-paper border-elevation4 text-[var(--text-tertiary)]';
  };

  const Icon = getTypeIcon();

  return (
    <div className="flex gap-4">
      {/* Timeline node and line */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${getNodeStyles()}`}>
          <Icon className="w-4 h-4" />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-elevation3 my-2 min-h-[40px]" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 ${isLast ? '' : ''}`}>
        {/* Date */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-semibold ${
            milestone.isClosingDay ? 'text-spruce' :
            isPastDate ? 'text-[var(--text-disabled)]' :
            daysUntil <= 3 ? 'text-amber-600' :
            'text-[var(--text-secondary)]'
          }`}>
            {format(new Date(milestone.date), 'MMM d')}
          </span>
          {!isPastDate && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              milestone.isClosingDay ? 'bg-spruce/10 text-spruce font-semibold' :
              daysUntil <= 3 ? 'bg-amber-100 text-amber-700' :
              'bg-elevation2 text-[var(--text-tertiary)]'
            }`}>
              {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className={`font-semibold ${
          milestone.isClosingDay ? 'text-lg text-[var(--text-primary)]' :
          isPastDate ? 'text-[var(--text-disabled)]' :
          'text-[var(--text-primary)]'
        }`}>
          {milestone.title}
          {milestone.isClosingDay && ' 🎉'}
        </h4>

        {/* Description */}
        {milestone.description && (
          <p className={`text-sm mt-0.5 ${isPastDate ? 'text-[var(--text-disabled)]' : 'text-[var(--text-tertiary)]'}`}>
            {milestone.description}
          </p>
        )}

        {/* Location and time for closing day */}
        {milestone.isClosingDay && (milestone.time || milestone.location) && (
          <div className="mt-2 p-3 bg-spruce/5 rounded-lg border border-spruce/20">
            {milestone.time && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock className="w-4 h-4 text-spruce" />
                <span>{milestone.time}</span>
              </div>
            )}
            {milestone.location && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mt-1">
                <MapPin className="w-4 h-4 text-spruce" />
                <span>{milestone.location}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface UpcomingTimelineProps {
  milestones: Milestone[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export default function UpcomingTimeline({
  milestones,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
}: UpcomingTimelineProps) {
  // Sort by date and filter to upcoming (include today)
  const sortedMilestones = [...milestones]
    .filter(m => differenceInDays(new Date(m.date), new Date()) >= -1)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, maxItems);

  if (sortedMilestones.length === 0) {
    return (
      <div className="bg-paper rounded-lg border border-divider shadow-[var(--shadow-1)] p-6 text-center">
        <Calendar className="w-10 h-10 text-[var(--text-disabled)] mx-auto mb-2" />
        <p className="text-[var(--text-tertiary)]">No upcoming milestones</p>
      </div>
    );
  }

  return (
    <div className="bg-paper rounded-lg border border-divider shadow-[var(--shadow-1)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-elevation1 border-b border-divider flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-elevation2 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Coming Up</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Key dates and milestones
            </p>
          </div>
        </div>
        {showViewAll && milestones.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-spruce font-medium hover:underline"
          >
            View all
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4">
        {sortedMilestones.map((milestone, index) => (
          <TimelineMilestone
            key={milestone.id}
            milestone={milestone}
            isLast={index === sortedMilestones.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
