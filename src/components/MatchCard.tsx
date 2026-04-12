'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MatchWithData, TeamCode, UserName } from '@/lib/types';
import { getTeam, getUserColor, getUserInitials, formatMatchTime } from '@/lib/utils';
import TeamBadge from './TeamBadge';
import Countdown from './Countdown';
import { CheckCircle, Lock, MapPin, Clock, Trophy } from 'lucide-react';

interface Props {
  match: MatchWithData;
  onPredict: (match: MatchWithData) => void;
}

const USERS: UserName[] = ['Sravanth', 'Srivatsav', 'Sathwik', 'Vikhyath', 'Nithin'];

function PredictionChip({ userName, predicted, result }: {
  userName: UserName;
  predicted: TeamCode | null;
  result?: TeamCode | null;
}) {
  const color = getUserColor(userName);
  const initials = getUserInitials(userName);
  const team = predicted ? getTeam(predicted) : null;
  const isCorrect = result && predicted === result;
  const isWrong = result && predicted && predicted !== result;

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-900 ring-2 ring-slate-800"
          style={{ background: color }}
        >
          {initials}
        </div>
        {isCorrect && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle size={10} className="text-white" />
          </div>
        )}
        {isWrong && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">✗</span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">{userName.slice(0, 4)}</span>
      {predicted && team ? (
        <div
          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{ background: team.primaryColor + '30', color: team.primaryColor, border: `1px solid ${team.primaryColor}40` }}
        >
          {predicted}
        </div>
      ) : (
        <div className="px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-700">
          —
        </div>
      )}
    </div>
  );
}

export default function MatchCard({ match, onPredict }: Props) {
  const { currentUser, isLoggedIn } = useApp();
  const team1 = getTeam(match.team1);
  const team2 = getTeam(match.team2);
  const myPrediction = currentUser ? match.predictions[currentUser] : null;
  const canPredict = isLoggedIn && !match.isLocked;

  return (
    <div
      className={`match-card glass-card p-5 ${match.isCompleted ? 'border-emerald-500/10' : ''}`}
      style={{
        background: match.isCompleted
          ? 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(15,23,42,0.8))'
          : undefined,
      }}
    >
      {/* Match header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
            Match #{match.id}
          </span>
          {match.isCompleted && (
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Trophy size={10} /> Completed
            </span>
          )}
          {!match.isLocked && !match.isCompleted && (
            <Countdown deadlineISO={match.deadlineISO} />
          )}
          {match.isLocked && !match.isCompleted && (
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Lock size={10} /> Locked
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={11} />
          {formatMatchTime(match.matchTime)}
        </div>
      </div>

      {/* Teams vs layout */}
      <div className="flex items-center justify-between gap-2 md:gap-4 mb-5">
        {/* Team 1 */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div
            className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-lg md:text-2xl font-black border-2 border-transparent transition-all"
            style={{
              background: team1.primaryColor,
              color: team1.textColor,
              boxShadow: match.result === match.team1 ? `0 0 24px ${team1.primaryColor}80` : undefined,
              borderColor: match.result === match.team1 ? '#F59E0B' : 'transparent',
            }}
          >
            {team1.code.slice(0, 2)}
          </div>
          <div className="text-center w-full">
            <div className="font-bold text-white text-xs md:text-base leading-tight">{team1.code}</div>
            <div className="text-slate-500 text-[9px] md:text-xs truncate">{team1.shortName}</div>
          </div>
          {match.result === match.team1 && (
            <span className="text-[9px] md:text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              WINNER 🏆
            </span>
          )}
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="text-slate-600 font-black text-sm md:text-xl italic">VS</div>
          {match.isCompleted && !match.result && (
            <span className="text-[9px] text-slate-600">TBD</span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <div
            className="w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-lg md:text-2xl font-black border-2 border-transparent transition-all"
            style={{
              background: team2.primaryColor,
              color: team2.textColor,
              boxShadow: match.result === match.team2 ? `0 0 24px ${team2.primaryColor}80` : undefined,
              borderColor: match.result === match.team2 ? '#F59E0B' : 'transparent',
            }}
          >
            {team2.code.slice(0, 2)}
          </div>
          <div className="text-center w-full">
            <div className="font-bold text-white text-xs md:text-base leading-tight">{team2.code}</div>
            <div className="text-slate-500 text-[9px] md:text-xs truncate">{team2.shortName}</div>
          </div>
          {match.result === match.team2 && (
            <span className="text-[9px] md:text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              WINNER 🏆
            </span>
          )}
        </div>
      </div>

      {/* Venue */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
        <MapPin size={11} />
        <span className="truncate">{match.venue}</span>
      </div>

      {/* Predictions row */}
      <div className="border-t border-white/5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Predictions</span>
          {canPredict && (
            <button
              onClick={() => onPredict(match)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                myPrediction
                  ? 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border border-amber-400/20'
                  : 'bg-amber-400 text-slate-900 hover:bg-amber-300 pulse-glow'
              }`}
            >
              {myPrediction ? '✏️ Change' : '🏏 Predict'}
            </button>
          )}
          {!isLoggedIn && !match.isLocked && (
            <span className="text-xs text-slate-600 italic">Login to predict</span>
          )}
        </div>

        <div className="flex justify-around">
          {USERS.map((user) => (
            <PredictionChip
              key={user}
              userName={user}
              predicted={match.predictions[user]}
              result={match.result}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
