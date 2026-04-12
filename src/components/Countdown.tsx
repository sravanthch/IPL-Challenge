'use client';

import { useEffect, useState, useRef } from 'react';
import { getCountdownParts } from '@/lib/utils';

interface Props {
  deadlineISO: string;
}

export default function Countdown({ deadlineISO }: Props) {
  const [parts, setParts] = useState(getCountdownParts(deadlineISO));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setParts(getCountdownParts(deadlineISO));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [deadlineISO]);

  if (parts.isPassed) {
    return (
      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
        Locked
      </span>
    );
  }

  const isUrgent = parts.hours === 0 && parts.minutes < 30;
  const textColor = isUrgent ? 'text-red-400' : 'text-amber-400';

  if (parts.hours > 24) {
    const days = Math.floor(parts.hours / 24);
    const remHours = parts.hours % 24;
    return (
      <span className={`text-xs font-medium flex items-center gap-1 ${textColor}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block dot-pulse" />
        Closes in {days}d {remHours}h
      </span>
    );
  }

  if (parts.hours > 0) {
    return (
      <span className={`text-xs font-medium flex items-center gap-1 ${textColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full inline-block dot-pulse ${isUrgent ? 'bg-red-400' : 'bg-amber-400'}`} />
        Closes in {parts.hours}h {parts.minutes}m
      </span>
    );
  }

  return (
    <span className="text-xs font-bold text-red-400 flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block dot-pulse" />
      {String(parts.minutes).padStart(2, '0')}:{String(parts.seconds).padStart(2, '0')} left!
    </span>
  );
}
