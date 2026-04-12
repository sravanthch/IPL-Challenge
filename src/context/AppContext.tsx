'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase } from '@/lib/supabase';
import { hashPin } from '@/lib/utils';
import { MATCHES } from '@/lib/schedule';
import {
  UserName,
  TeamCode,
  DbPrediction,
  DbResult,
  MatchWithData,
} from '@/lib/types';

interface AppContextType {
  currentUser: UserName | null;
  isLoggedIn: boolean;
  predictions: DbPrediction[];
  results: DbResult[];
  matchesWithData: MatchWithData[];
  login: (userName: UserName, pin: string) => Promise<{ error?: string }>;
  register: (userName: UserName, pin: string) => Promise<{ error?: string }>;
  logout: () => void;
  submitPrediction: (matchId: number, winner: TeamCode) => Promise<{ error?: string }>;
  isRegistered: (userName: UserName) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserName | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [predictions, setPredictions] = useState<DbPrediction[]>([]);
  const [results, setResults] = useState<DbResult[]>([]);

  // Load session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ipl_session');
    if (saved) {
      const { user } = JSON.parse(saved);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    const [predsRes, resultsRes] = await Promise.all([
      supabase.from('predictions').select('*'),
      supabase.from('results').select('*'),
    ]);
    if (predsRes.data) setPredictions(predsRes.data as DbPrediction[]);
    if (resultsRes.data) setResults(resultsRes.data as DbResult[]);
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('ipl-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Build matchesWithData from MATCHES + predictions + results
  const matchesWithData: MatchWithData[] = MATCHES.map((match) => {
    const result = results.find((r) => r.match_id === match.id);
    const matchPreds = predictions.filter((p) => p.match_id === match.id);

    const predsByUser: Record<string, TeamCode | null> = {
      Sravanth: null,
      Srivatsav: null,
      Sathwik: null,
      Vikhyath: null,
      Nithin: null,
    };
    matchPreds.forEach((p) => {
      predsByUser[p.user_name] = p.predicted_winner as TeamCode;
    });

    const isLocked = new Date() > new Date(match.deadlineISO);
    const isCompleted = !!result;

    return {
      ...match,
      result: result ? (result.winner as TeamCode) : null,
      predictions: predsByUser as Record<UserName, TeamCode | null>,
      isLocked,
      isCompleted,
    };
  });

  const isRegistered = async (userName: UserName): Promise<boolean> => {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('name', userName)
      .single();
    return !!data;
  };

  const register = async (userName: UserName, pin: string): Promise<{ error?: string }> => {
    try {
      const pinHash = await hashPin(pin);
      const { error } = await supabase.from('users').insert({
        name: userName,
        pin_hash: pinHash,
      });
      if (error) return { error: error.message };

      setCurrentUser(userName);
      setIsLoggedIn(true);
      localStorage.setItem('ipl_session', JSON.stringify({ user: userName }));
      return {};
    } catch (e) {
      return { error: 'Registration failed' };
    }
  };

  const login = async (userName: UserName, pin: string): Promise<{ error?: string }> => {
    try {
      const pinHash = await hashPin(pin);
      const { data, error } = await supabase
        .from('users')
        .select('pin_hash')
        .eq('name', userName)
        .single();

      if (error || !data) return { error: 'User not found' };
      if (data.pin_hash !== pinHash) return { error: 'Incorrect PIN' };

      setCurrentUser(userName);
      setIsLoggedIn(true);
      localStorage.setItem('ipl_session', JSON.stringify({ user: userName }));
      return {};
    } catch (e) {
      return { error: 'Login failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('ipl_session');
  };

  const submitPrediction = async (
    matchId: number,
    winner: TeamCode
  ): Promise<{ error?: string }> => {
    if (!currentUser) return { error: 'Not logged in' };

    // Check if deadline has passed
    const match = MATCHES.find((m) => m.id === matchId);
    if (!match) return { error: 'Match not found' };
    if (new Date() > new Date(match.deadlineISO)) {
      return { error: 'Prediction deadline has passed' };
    }

    const existing = predictions.find(
      (p) => p.match_id === matchId && p.user_name === currentUser
    );

    if (existing) {
      const { error } = await supabase
        .from('predictions')
        .update({ predicted_winner: winner, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from('predictions').insert({
        match_id: matchId,
        user_name: currentUser,
        predicted_winner: winner,
      });
      if (error) return { error: error.message };
    }

    await fetchData();
    return {};
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        predictions,
        results,
        matchesWithData,
        login,
        register,
        logout,
        submitPrediction,
        isRegistered,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
