'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import UserAuthModal from '@/components/UserAuthModal';
import MatchCard from '@/components/MatchCard';
import PredictionModal from '@/components/PredictionModal';
import { MatchWithData } from '@/lib/types';
import { formatMatchDate } from '@/lib/utils';
import { Filter, Trophy, Zap } from 'lucide-react';

type FilterType = 'upcoming' | 'locked' | 'completed' | 'all';

export default function HomePage() {
  const { isLoggedIn, matchesWithData, currentUser } = useApp();
  const [predicting, setPredicting] = useState<MatchWithData | null>(null);
  const [filter, setFilter] = useState<FilterType>('upcoming');

  const filteredMatches = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return matchesWithData.filter((m) => !m.isLocked && !m.isCompleted);
      case 'locked':
        return matchesWithData.filter((m) => m.isLocked && !m.isCompleted);
      case 'completed':
        return matchesWithData.filter((m) => m.isCompleted);
      default:
        return matchesWithData;
    }
  }, [matchesWithData, filter]);

  // Group matches by date
  const groupedMatches = useMemo(() => {
    const groups: Record<string, MatchWithData[]> = {};
    filteredMatches.forEach((m) => {
      if (!groups[m.matchDate]) groups[m.matchDate] = [];
      groups[m.matchDate].push(m);
    });
    return groups;
  }, [filteredMatches]);

  const upcomingCount = matchesWithData.filter((m) => !m.isLocked && !m.isCompleted).length;
  const completedCount = matchesWithData.filter((m) => m.isCompleted).length;
  const myPredCount = currentUser
    ? matchesWithData.filter((m) => m.predictions[currentUser]).length
    : 0;

  const filterBtns: { key: FilterType; label: string; count: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: matchesWithData.filter(m => !m.isLocked && !m.isCompleted).length },
    { key: 'locked', label: 'Locked', count: matchesWithData.filter(m => m.isLocked && !m.isCompleted).length },
    { key: 'completed', label: 'Completed', count: completedCount },
    { key: 'all', label: 'All', count: matchesWithData.length },
  ];

  return (
    <div className="main-container pt-2 md:pt-6 pb-10">
      {/* Hero */}
      <div className="text-left md:text-center mb-8 md:mb-12 pl-1 md:pl-0">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-full mb-3 md:mb-4">
          <Zap size={10} className="md:w-3 md:h-3" />
          IPL 2026 Season
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
          Match{' '}
          <span className="gold-shimmer">Predictions</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm max-w-xs mx-auto">
          Predict before the deadline. May the best fan win! 🏏
        </p>
      </div>

      {/* Stats bar */}
      {isLoggedIn && currentUser && (
        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
          {[
            { label: 'Upcoming', value: upcomingCount, color: 'text-amber-400' },
            { label: 'My Preds', value: myPredCount, color: 'text-blue-400' },
            { label: 'Done', value: completedCount, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-2.5 md:p-4 text-center">
              <div className={`text-xl md:text-3xl font-black stats-value ${color}`}>{value}</div>
              <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Auth section (if not logged in) */}
      {!isLoggedIn && (
        <div className="glass-card p-8 mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Login to Start Predicting</h2>
          <p className="text-slate-400 text-sm mb-6">
            Join Sravanth, Srivatsav, Sathwik, Vikhyath & Nithin in predicting IPL 2026 match winners!
          </p>
          <UserAuthModal />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <Filter size={16} className="text-slate-500 my-auto flex-shrink-0" />
        {filterBtns.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === key
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60'
              }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-md ${filter === key ? 'bg-slate-900/20' : 'bg-slate-700/60'
                }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Matches grouped by date */}
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🏏</div>
          <p className="text-sm">No {filter} matches found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMatches).map(([date, matches]) => (
            <div key={date}>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-700" />
                {formatMatchDate(date)}
                <span className="w-full h-px bg-slate-700" />
              </h2>
              <div className="space-y-4">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onPredict={setPredicting}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prediction modal */}
      {predicting && (
        <PredictionModal
          match={predicting}
          onClose={() => setPredicting(null)}
        />
      )}
    </div>
  );
}
