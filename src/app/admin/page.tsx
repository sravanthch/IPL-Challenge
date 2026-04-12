'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { getTeam, formatMatchDate, formatMatchTime } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Shield, Loader2, CheckCircle, XCircle, Trophy, Lock, Ban } from 'lucide-react';
import { TeamCode, MatchResult } from '@/lib/types';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'ipl2026admin';

export default function AdminPage() {
  const { matchesWithData, refreshData, currentUser } = useApp();

  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState('');

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<MatchResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwdError('');
    } else {
      setPwdError('Incorrect password');
    }
  };

  // Only show locked (deadline passed) matches that don't have a result yet + completed ones
  const adminMatches = useMemo(() => {
    return matchesWithData.filter((m) => m.isLocked).sort((a, b) => a.id - b.id);
  }, [matchesWithData]);

  const handleSaveResult = async () => {
    if (!selectedMatch || selectedWinner === null) return;
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const match = matchesWithData.find((m) => m.id === selectedMatch);
    if (!match) { setSaving(false); return; }

    if (match.isCompleted) {
      // Update existing result
      const { error } = await supabase
        .from('results')
        .update({ winner: selectedWinner })
        .eq('match_id', selectedMatch);
      if (error) { setSaveError(error.message); setSaving(false); return; }
    } else {
      // Insert new result
      const { error } = await supabase.from('results').insert({
        match_id: selectedMatch,
        winner: selectedWinner,
      });
      if (error) { setSaveError(error.message); setSaving(false); return; }
    }

    await refreshData();
    setSaving(false);
    setSaveSuccess(true);
    setSelectedMatch(null);
    setSelectedWinner(null);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!currentUser || currentUser.toLowerCase() !== 'sravanth') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-6">
          <Shield size={28} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-8">
          This area is restricted. Only the administrator can manage match results.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all border border-white/5"
        >
          Return to Predictions
        </Link>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Enter the admin password to manage results</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Admin Password</label>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Enter password..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10 transition-all"
              autoFocus
            />
            {pwdError && (
              <p className="text-red-400 text-xs mt-1">{pwdError}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:from-blue-400 hover:to-indigo-500 transition-all"
          >
            <div className="flex items-center justify-center gap-2">
              <Lock size={16} />
              Unlock Admin
            </div>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
          <Shield size={12} />
          Admin Mode
        </div>
        <h1 className="text-3xl font-black text-white mb-2">
          Enter <span className="gold-shimmer">Results</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Select a completed match and enter the winner
        </p>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-6 fade-in-up">
          <CheckCircle size={16} />
          Result saved successfully! Leaderboard updated.
        </div>
      )}

      {/* Match list */}
      <div className="space-y-3">
        {adminMatches.length === 0 ? (
          <div className="text-center py-16 text-slate-500 glass-card">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-sm">No matches with passed deadlines yet</p>
          </div>
        ) : (
          adminMatches.map((match) => {
            const t1 = getTeam(match.team1);
            const t2 = getTeam(match.team2);
            const isSelected = selectedMatch === match.id;

            return (
              <div
                key={match.id}
                className={`glass-card p-4 cursor-pointer transition-all ${isSelected ? 'border-amber-400/30 bg-amber-400/5' : 'hover:border-white/10'
                  }`}
                onClick={() => {
                  setSelectedMatch(isSelected ? null : match.id);
                  setSelectedWinner(match.result || null);
                }}
              >
                {/* Match info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
                      #{match.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatMatchDate(match.matchDate)} • {formatMatchTime(match.matchTime)}
                    </span>
                  </div>
                  {match.isCompleted ? (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={11} /> Result entered
                    </span>
                  ) : (
                    <span className="text-xs text-amber-400 font-medium">Needs result</span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                      style={{ background: t1.primaryColor, color: t1.textColor }}
                    >
                      {match.team1.slice(0, 2)}
                    </div>
                    <span className="text-white font-semibold text-sm">{match.team1}</span>
                  </div>
                  <span className="text-slate-600 text-xs">vs</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                      style={{ background: t2.primaryColor, color: t2.textColor }}
                    >
                      {match.team2.slice(0, 2)}
                    </div>
                    <span className="text-white font-semibold text-sm">{match.team2}</span>
                  </div>
                  {match.result && match.result !== 'NR' && (
                    <span className="ml-auto text-amber-400 text-xs font-bold">
                      🏆 {match.result} won
                    </span>
                  )}
                  {match.result === 'NR' && (
                    <span className="ml-auto text-slate-400 text-xs font-bold flex items-center gap-1">
                      <Ban size={11} /> No Result
                    </span>
                  )}
                </div>

                {/* Winner selection (expanded) */}
                {isSelected && (
                  <div className="border-t border-white/5 pt-4 mt-2 fade-in-up">
                    <p className="text-xs text-slate-400 mb-3 font-medium">Select the winner:</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {([match.team1, match.team2] as TeamCode[]).map((code) => {
                        const team = getTeam(code);
                        const isSel = selectedWinner === code;
                        return (
                          <button
                            key={code}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWinner(code);
                            }}
                            className="team-btn flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
                            style={{
                              background: isSel ? team.primaryColor + '20' : 'rgba(15,23,42,0.5)',
                              borderColor: isSel ? team.primaryColor : 'rgba(255,255,255,0.08)',
                              boxShadow: isSel ? `0 0 20px ${team.primaryColor}30` : undefined,
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                              style={{ background: team.primaryColor, color: team.textColor }}
                            >
                              {code.slice(0, 2)}
                            </div>
                            <div className="text-left">
                              <div className="font-bold text-white text-sm">{code}</div>
                              <div className="text-slate-400 text-xs">{team.shortName}</div>
                            </div>
                            {isSel && <Trophy size={14} className="ml-auto text-amber-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* No Result button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWinner('NR');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all mb-4 text-sm font-semibold"
                      style={{
                        background: selectedWinner === 'NR' ? 'rgba(100,116,139,0.2)' : 'rgba(15,23,42,0.5)',
                        borderColor: selectedWinner === 'NR' ? '#64748B' : 'rgba(255,255,255,0.08)',
                        color: selectedWinner === 'NR' ? '#CBD5E1' : '#64748B',
                      }}
                    >
                      <Ban size={15} />
                      No Result (Washed Out / Cancelled)
                    </button>

                    {saveError && (
                      <div className="text-red-400 text-xs bg-red-400/10 px-3 py-2 rounded-lg mb-3 flex items-center gap-1">
                        <XCircle size={12} /> {saveError}
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveResult();
                      }}
                      disabled={!selectedWinner || saving}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {saving ? (
                        <><Loader2 size={15} className="spin" /> Saving...</>
                      ) : (
                        <><Trophy size={15} /> Save Result</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
