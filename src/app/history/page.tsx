'use client';

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getUserColor, getUserInitials, getTeam, formatMatchDate, formatMatchTime } from '@/lib/utils';
import { UserName, TeamCode, MatchResult } from '@/lib/types';
import { BarChart2, CheckCircle, XCircle, Clock } from 'lucide-react';

const USERS: UserName[] = ['Sravanth', 'Srivatsav', 'Sathwik', 'Vikhyath', 'Nithin'];

function PredBadge({ pred, result }: { pred: TeamCode | null; result?: MatchResult | null }) {
  if (!pred) return <span className="text-slate-600 text-xs">—</span>;
  const team = getTeam(pred);
  const isCorrect = result !== 'NR' && result === pred;
  const isWrong = result && (result === 'NR' || result !== pred);

  return (
    <div className="flex items-center gap-1">
      <div
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
        style={{
          background: team.primaryColor + '25',
          color: team.primaryColor,
          border: `1px solid ${team.primaryColor}40`,
        }}
      >
        {pred}
      </div>
      {isCorrect && <CheckCircle size={12} className="text-emerald-400" />}
      {isWrong && <XCircle size={12} className="text-red-400" />}
      {!result && <Clock size={11} className="text-slate-600" />}
    </div>
  );
}

export default function HistoryPage() {
  const { matchesWithData } = useApp();

  // Show all locked + completed matches (historical)
  const historyMatches = useMemo(() => {
    return [...matchesWithData]
      .filter((m) => m.isLocked || m.isCompleted)
      .reverse();
  }, [matchesWithData]);

  const allMatches = matchesWithData.length;
  const completedCount = matchesWithData.filter(m => m.isCompleted).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <BarChart2 size={12} />
          Match Archive
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          Match <span className="gold-shimmer">History</span>
        </h1>
        <p className="text-slate-400 text-sm">
          {completedCount} results entered • {historyMatches.length} matches in history
        </p>
      </div>

      {historyMatches.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <div className="text-5xl mb-4">📋</div>
          <p>No match history yet — check back after the first deadline passes!</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Table header */}
          <div 
            className="grid gap-3 px-4 py-3 border-b border-white/5 bg-slate-900/50"
            style={{ gridTemplateColumns: `auto 1fr repeat(${USERS.length}, minmax(0, 1fr)) auto` }}
          >
            <div className="text-[10px] text-slate-500 uppercase tracking-wide w-16">Match</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide">Teams & Venue</div>
            {USERS.map((u) => (
              <div key={u} className="text-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900 mx-auto"
                  style={{ background: getUserColor(u) }}
                >
                  {getUserInitials(u)}
                </div>
              </div>
            ))}
            <div className="text-[10px] text-slate-500 uppercase tracking-wide text-center w-20">Result</div>
          </div>

          {/* Match rows */}
          <div className="divide-y divide-white/5">
            {historyMatches.map((match) => {
              const t1 = getTeam(match.team1);
              const t2 = getTeam(match.team2);
              return (
                <div
                  key={match.id}
                  className={`grid gap-3 items-center px-4 py-3 hover:bg-white/2 transition-colors ${
                    match.isCompleted ? 'bg-emerald-500/2' : ''
                  }`}
                  style={{ gridTemplateColumns: `auto 1fr repeat(${USERS.length}, minmax(0, 1fr)) auto` }}
                >
                  {/* Match # */}
                  <div className="w-16">
                    <div className="text-xs font-medium text-slate-500">#{match.id}</div>
                    <div className="text-[10px] text-slate-600">{formatMatchDate(match.matchDate)}</div>
                    <div className="text-[10px] text-slate-600">{formatMatchTime(match.matchTime)}</div>
                  </div>

                  {/* Teams */}
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                      <span style={{ color: t1.primaryColor }}>{match.team1}</span>
                      <span className="text-slate-600 text-xs">vs</span>
                      <span style={{ color: t2.primaryColor }}>{match.team2}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 truncate max-w-[180px]">
                      {match.venue.split(',')[0]}
                    </div>
                  </div>

                  {/* Predictions per user */}
                  {USERS.map((u) => (
                    <div key={u} className="flex justify-center">
                      <PredBadge pred={match.predictions[u]} result={match.result} />
                    </div>
                  ))}

                  {/* Result */}
                  <div className="w-20 text-center">
                    {match.result === 'NR' ? (
                      <span className="text-[10px] text-slate-400 font-bold italic px-2 py-1 bg-slate-800/80 rounded">
                        No Result
                      </span>
                    ) : match.result ? (
                      <div>
                        <div
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{
                            background: getTeam(match.result).primaryColor + '25',
                            color: getTeam(match.result).primaryColor,
                          }}
                        >
                          {match.result}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">won</div>
                      </div>
                    ) : match.isLocked ? (
                      <span className="text-[10px] text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded">Awaiting</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
