'use client';

import { TeamCode } from '@/lib/types';
import { getTeam } from '@/lib/utils';

interface Props {
  code: TeamCode;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showShortName?: boolean;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const sizeMap = {
  sm: { badge: 'w-8 h-8 text-xs', text: 'text-xs', wrap: 'gap-1.5' },
  md: { badge: 'w-11 h-11 text-sm', text: 'text-sm', wrap: 'gap-2' },
  lg: { badge: 'w-16 h-16 text-lg', text: 'text-base', wrap: 'gap-3' },
};

export default function TeamBadge({
  code,
  size = 'md',
  showName = false,
  showShortName = false,
  selected = false,
  onClick,
  disabled = false,
}: Props) {
  const team = getTeam(code);
  const sz = sizeMap[size];

  const badge = (
    <div
      className={`${sz.badge} rounded-xl flex items-center justify-center font-black border-2 transition-all ${
        selected ? 'scale-110 shadow-lg' : ''
      }`}
      style={{
        background: team.primaryColor,
        borderColor: selected ? '#F59E0B' : 'transparent',
        color: team.textColor,
        boxShadow: selected ? `0 0 20px ${team.primaryColor}60` : undefined,
      }}
    >
      {code.slice(0, 2)}
    </div>
  );

  if (!showName && !showShortName) {
    if (onClick) {
      return (
        <button onClick={onClick} disabled={disabled} className="team-btn disabled:opacity-40">
          {badge}
        </button>
      );
    }
    return badge;
  }

  const content = (
    <div className={`flex flex-col items-center ${sz.wrap}`}>
      {badge}
      {(showName || showShortName) && (
        <span className={`font-semibold text-white ${sz.text} text-center leading-tight`}>
          {showName ? team.name : team.shortName}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} disabled={disabled} className="team-btn disabled:opacity-40">
        {content}
      </button>
    );
  }

  return content;
}
