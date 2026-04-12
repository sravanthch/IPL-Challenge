'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getUserColor, getUserInitials, getTeam } from '@/lib/utils';
import { LeaderboardEntry, UserName } from '@/lib/types';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';

const USERS: UserName[] = ['Sravanth', 'Srivatsav', 'Sathwik'];

const rankEmoji = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { matchesWithData } = useApp();

  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    return USERS.map((user) => {
      let correct = 0;
      let total = 0;
      let pending = 0;

      matchesWithData.forEach((match) => {
        const pred = match.predictions[user];
        if (pred) {
          total++;
          if (match.result) {
            if (pred === match.result) correct++;
          } else if (match.isLocked) {
            pending++;
          }
        }
      });

      const decided = total - pending;
      const accuracy = decided > 0 ? Math.round((correct / decided) * 100) : 0;

      return { userName: user, correct, total, pending, accuracy };
    }).sort((a, b) => b.correct - a.correct || b.accuracy - a.accuracy);
  }, [matchesWithData]);

  const completedMatches = matchesWithData.filter((m) => m.isCompleted).length;
  const totalMatches = matchesWithData.length;

  return (
    <div className="main-container pt-2 md:pt-6 pb-10">
      {/* Header */}
      <div className="text-left md:text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] md:text-xs font-medium px-2.5 py-1 rounded-full mb-3 md:mb-4">
          <Trophy size={10} className="md:w-3 md:h-3" />
          Live Standings
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
          Leader<span className="gold-shimmer">board</span>
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          {completedMatches} of {totalMatches} matches completed
        </p>
      </div>

      {/* Top 3 podium */}
      <div className="relative mb-8 md:mb-12">
        <div className="flex items-end justify-center gap-2 md:gap-6">
          {/* 2nd place */}
          {leaderboard[1] && (
            <div className="flex flex-col items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 flex-1 max-w-[80px] md:max-w-none">
              <div
                className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-xl font-bold text-slate-900 ring-2 md:ring-4 ring-slate-600/40"
                style={{ background: getUserColor(leaderboard[1].userName) }}
              >
                {getUserInitials(leaderboard[1].userName)}
              </div>
              <div className="text-center mb-1">
                <div className="text-white font-bold text-[10px] md:text-sm truncate w-full">{leaderboard[1].userName}</div>
                <div className="text-slate-500 text-[8px] md:text-xs">{leaderboard[1].correct} pts</div>
              </div>
              <div className="rank-2 w-full h-10 md:h-20 rounded-t-lg flex items-center justify-center shadow-lg">
                <span className="text-xl md:text-4xl">🥈</span>
              </div>
            </div>
          )}

          {/* 1st place */}
          {leaderboard[0] && (
            <div className="flex flex-col items-center gap-2 md:gap-3 flex-1 max-w-[100px] md:max-w-none">
              <div className="relative">
                <div
                  className="w-14 h-14 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-lg md:text-3xl font-bold text-slate-900 ring-4 ring-amber-400/60 shadow-2xl shadow-amber-400/30"
                  style={{ background: getUserColor(leaderboard[0].userName) }}
                >
                  {getUserInitials(leaderboard[0].userName)}
                </div>
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 text-xl md:text-3xl drop-shadow-lg">👑</div>
              </div>
              <div className="text-center mb-1">
                <div className="text-white font-black text-xs md:text-lg tracking-tight">{leaderboard[0].userName}</div>
                <div className="text-amber-400 text-[10px] md:text-sm font-bold uppercase">{leaderboard[0].correct} Correct</div>
              </div>
              <div className="rank-1 w-full h-16 md:h-28 rounded-t-xl flex items-center justify-center shadow-2xl">
                <span className="text-2xl md:text-5xl">🥇</span>
              </div>
            </div>
          )}

          {/* 3rd place */}
          {leaderboard[2] && (
            <div className="flex flex-col items-center gap-1.5 md:gap-2 mb-1 md:mb-2 flex-1 max-w-[80px] md:max-w-none">
              <div
                className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-sm md:text-xl font-bold text-slate-900 ring-2 md:ring-4 ring-orange-700/40"
                style={{ background: getUserColor(leaderboard[2].userName) }}
              >
                {getUserInitials(leaderboard[2].userName)}
              </div>
              <div className="text-center mb-1">
                <div className="text-white font-bold text-[10px] md:text-sm truncate w-full">{leaderboard[2].userName}</div>
                <div className="text-slate-500 text-[8px] md:text-xs">{leaderboard[2].correct} pts</div>
              </div>
              <div className="rank-3 w-full h-8 md:h-14 rounded-t-lg flex items-center justify-center shadow-lg">
                <span className="text-lg md:text-3xl">🥉</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed table */}
      <div className="glass-card overflow-hidden mb-6 md:mb-8">
        <div className="p-4 md:p-5 border-b border-white/5 bg-white/2">
          <h2 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
            <Award size={16} className="text-amber-400" />
            Detailed Standings
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {leaderboard.map((entry, idx) => (
            <div key={entry.userName} className="flex items-center gap-2.5 md:gap-4 p-3 md:p-5 hover:bg-white/[0.03] transition-colors">
              {/* Rank */}
              <div className="text-lg md:text-2xl w-6 md:w-8 text-center flex-shrink-0 font-black text-slate-600">
                {idx < 3 ? rankEmoji[idx] : `#${idx + 1}`}
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xs md:text-base font-bold text-slate-900 flex-shrink-0 shadow-inner"
                style={{ background: getUserColor(entry.userName) }}
              >
                {getUserInitials(entry.userName)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm md:text-base">{entry.userName}</div>
                <div className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1.5">
                  <span>{entry.total} Preds</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>{entry.pending} Pending</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-3 md:gap-6 text-right shrink-0">
                <div className="flex flex-col items-end">
                  <div className="text-base md:text-2xl font-black text-white leading-none">{entry.correct}</div>
                  <div className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase mt-0.5 md:mt-1">Pts</div>
                </div>
                <div className="flex flex-col items-end w-12 md:w-16">
                  <div
                    className={`text-base md:text-2xl font-black leading-none ${entry.accuracy >= 60
                        ? 'text-emerald-400'
                        : entry.accuracy >= 40
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                  >
                    {entry.accuracy}%
                  </div>
                  <div className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase mt-0.5 md:mt-1 tracking-tighter">Acc.</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-team breakdown */}
      <div className="glass-card p-4">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Target size={16} className="text-amber-400" />
          Prediction Stats by Match
        </h2>
        <div className="space-y-2">
          {matchesWithData.filter(m => m.isCompleted).map((match) => {
            const t1 = getTeam(match.team1);
            const t2 = getTeam(match.team2);
            const winner = match.result;
            const correct = USERS.filter(u => match.predictions[u] === winner).length;
            return (
              <div key={match.id} className="flex items-center gap-3 text-sm">
                <span className="text-slate-500 text-xs w-16 flex-shrink-0">Match #{match.id}</span>
                <span className="text-white font-medium flex-1">
                  <span style={{ color: t1.primaryColor }}>{match.team1}</span>
                  {' vs '}
                  <span style={{ color: t2.primaryColor }}>{match.team2}</span>
                </span>
                {winner && (
                  <span className="text-xs text-amber-400 font-medium">{winner} won</span>
                )}
                <span className="text-xs text-slate-500">{correct}/3 correct</span>
              </div>
            );
          })}
          {matchesWithData.filter(m => m.isCompleted).length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">No completed matches yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
