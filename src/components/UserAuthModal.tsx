'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { UserName } from '@/lib/types';
import { USERS } from '@/lib/schedule';
import { getUserColor, getUserInitials } from '@/lib/utils';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

type Step = 'select-user' | 'set-pin' | 'enter-pin';

export default function UserAuthModal({ onClose }: Props) {
  const { login, register, isRegistered } = useApp();
  const [step, setStep] = useState<Step>('select-user');
  const [selectedUser, setSelectedUser] = useState<UserName | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSelectUser = async (userName: UserName) => {
    setSelectedUser(userName);
    setError('');
    setPin('');
    setConfirmPin('');
    const registered = await isRegistered(userName);
    setStep(registered ? 'enter-pin' : 'set-pin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError('');

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (step === 'set-pin') {
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      setLoading(true);
      const result = await register(selectedUser, pin);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => onClose?.(), 800);
      }
    } else {
      setLoading(true);
      const result = await login(selectedUser, pin);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => onClose?.(), 800);
      }
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-2">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg shadow-amber-500/20">
          <Lock size={24} className="text-slate-900 md:w-7 md:h-7" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
          {step === 'select-user' ? 'Who are you?' : selectedUser}
        </h2>
        <p className="text-slate-400 text-xs md:text-sm px-4">
          {step === 'select-user'
            ? 'Select your name to start predicting'
            : step === 'set-pin'
            ? 'Create a 4-digit PIN to secure your account'
            : 'Enter your PIN to continue'}
        </p>
      </div>

      {/* User Selection */}
      {step === 'select-user' && (
        <div className="space-y-2 md:space-y-3 px-2">
          {USERS.map((user) => {
            const color = getUserColor(user);
            const initials = getUserInitials(user);
            return (
              <button
                key={user}
                onClick={() => handleSelectUser(user as UserName)}
                className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-white/8 bg-slate-900/50 hover:bg-slate-800/50 hover:border-amber-400/30 transition-all group"
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-base md:text-lg font-bold text-slate-900 shadow-md shrink-0"
                  style={{ background: color }}
                >
                  {initials}
                </div>
                <span className="text-white font-semibold text-base md:text-lg group-hover:text-amber-300 transition-colors">
                  {user}
                </span>
                <span className="ml-auto text-slate-500 group-hover:text-slate-300 transition-colors">→</span>
              </button>
            );
          })}
        </div>
      )}

      {/* PIN Entry / Creation */}
      {(step === 'set-pin' || step === 'enter-pin') && (
        <form onSubmit={handleSubmit} className="space-y-4 px-2">
          {/* User avatar */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold text-slate-900 shadow-lg"
              style={{ background: getUserColor(selectedUser!) }}
            >
              {getUserInitials(selectedUser!)}
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                {step === 'set-pin' ? 'Create PIN' : 'Enter PIN'}
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  maxLength={4}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white text-center text-2xl md:text-3xl font-bold tracking-[0.5em] md:tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm PIN (only for registration) */}
            {step === 'set-pin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Confirm PIN</label>
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  maxLength={4}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 md:py-4 text-white text-center text-2xl md:text-3xl font-bold tracking-[0.5em] md:tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-400/50 focus:ring-4 focus:ring-amber-400/10 transition-all"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 px-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              {step === 'set-pin' ? 'Account created!' : 'Logged in!'}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success || pin.length !== 4}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold text-base hover:from-amber-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : success ? (
              <CheckCircle size={18} />
            ) : step === 'set-pin' ? (
              'Create Account'
            ) : (
              'Login'
            )}
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => {
              setStep('select-user');
              setPin('');
              setConfirmPin('');
              setError('');
            }}
            className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Choose different user
          </button>
        </form>
      )}
    </div>
  );
}
