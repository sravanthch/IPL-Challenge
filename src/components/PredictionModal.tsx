'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MatchWithData, TeamCode } from '@/lib/types';
import { getTeam, formatMatchDate, formatMatchTime } from '@/lib/utils';
import { X, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  match: MatchWithData;
  onClose: () => void;
}

export default function PredictionModal({ match, onClose }: Props) {
  const { submitPrediction, currentUser } = useApp();
  const [selected, setSelected] = useState<TeamCode | null>(
    currentUser ? match.predictions[currentUser] : null
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const team1 = getTeam(match.team1);
  const team2 = getTeam(match.team2);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    const result = await submitPrediction(match.id, selected);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => onClose(), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm glass-card p-5 md:p-6 fade-in-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-1">Your Prediction</h3>
          <div className="text-[10px] md:text-xs text-slate-500 font-medium">
            Match #{match.id} • {formatMatchDate(match.matchDate)}
          </div>
        </div>

        {/* Team selection */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
          {([match.team1, match.team2] as TeamCode[]).map((teamCode) => {
            const team = getTeam(teamCode);
            const isSelected = selected === teamCode;
            return (
              <button
                key={teamCode}
                onClick={() => setSelected(teamCode)}
                className={`team-btn relative flex flex-col items-center gap-2 md:gap-3 p-4 md:p-5 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-amber-400 shadow-xl'
                    : 'border-white/8 bg-slate-900/50 hover:border-white/20'
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${team.primaryColor}20, ${team.primaryColor}08)`
                    : undefined,
                  boxShadow: isSelected ? `0 0 30px ${team.primaryColor}30` : undefined,
                }}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle size={12} className="text-slate-900" />
                  </div>
                )}

                {/* Team badge */}
                <div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl font-black shadow-inner"
                  style={{ background: team.primaryColor, color: team.textColor }}
                >
                  {team.code.slice(0, 2)}
                </div>

                <div className="text-center">
                  <div className="font-bold text-white text-xs md:text-sm">{team.code}</div>
                  <div className="text-slate-400 text-[10px] md:text-xs">{team.shortName}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 px-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selected || loading || success}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/20"
        >
          {loading ? (
            <><Loader2 size={18} className="spin" /> Saving...</>
          ) : success ? (
            <><CheckCircle size={18} /> Prediction Saved!</>
          ) : (
            `🏏 Predict ${selected ? getTeam(selected).code : 'a team'}`
          )}
        </button>

        {success && (
          <p className="text-center text-xs text-slate-500 mt-3">Closing...</p>
        )}
      </div>
    </div>
  );
}
