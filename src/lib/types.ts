export type UserName = 'Sravanth' | 'Srivatsav' | 'Sathwik';

export type TeamCode = 'CSK' | 'MI' | 'RCB' | 'KKR' | 'RR' | 'GT' | 'PBKS' | 'LSG';

export interface Team {
  code: TeamCode;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export interface Match {
  id: number; // match number from IPL schedule
  matchDate: string; // ISO date string 'YYYY-MM-DD'
  matchTime: string; // '19:30' or '15:30' IST
  team1: TeamCode;
  team2: TeamCode;
  venue: string;
  deadlineISO: string; // ISO string in UTC - 5 min before match
}

export interface DbPrediction {
  id: string;
  match_id: number;
  user_name: UserName;
  predicted_winner: TeamCode;
  created_at: string;
  updated_at: string;
}

export interface DbResult {
  id: string;
  match_id: number;
  winner: TeamCode;
  created_at: string;
}

export interface DbUser {
  id: string;
  name: UserName;
  pin_hash: string;
  created_at: string;
}

export interface LeaderboardEntry {
  userName: UserName;
  correct: number;
  total: number;
  pending: number;
  accuracy: number;
}

export interface MatchWithData extends Match {
  result?: TeamCode | null;
  predictions: Record<UserName, TeamCode | null>;
  isLocked: boolean; // deadline passed
  isCompleted: boolean; // result entered
}
