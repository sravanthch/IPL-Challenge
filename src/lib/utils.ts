import { TeamCode } from './types';
import { TEAMS } from './schedule';

// Hash a string using SHA-256 via Web Crypto API (browser-compatible)
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`ipl2026-${pin}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Format date for display: 'Mon, Apr 14'
export function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Format match time from '19:30' to '7:30 PM IST'
export function formatMatchTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period} IST`;
}

// Check if a match deadline has passed
export function isDeadlinePassed(deadlineISO: string): boolean {
  return new Date() > new Date(deadlineISO);
}

// Get time remaining until deadline in a human readable string
export function getCountdownParts(deadlineISO: string): {
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
} {
  const now = new Date().getTime();
  const deadline = new Date(deadlineISO).getTime();
  const diff = deadline - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isPassed: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isPassed: false };
}

// Get team display info
export function getTeam(code: TeamCode) {
  return TEAMS[code];
}

// Get user avatar color (for consistent identification)
export function getUserColor(userName: string): string {
  const colors: Record<string, string> = {
    Sravanth: '#F59E0B',
    Srivatsav: '#10B981',
    Sathwik: '#6366F1',
    Vikhyath: '#EC4899',
    Nithin: '#8B5CF6',
  };
  return colors[userName] || '#94A3B8';
}

// Get user initials
export function getUserInitials(userName: string): string {
  return userName.slice(0, 2).toUpperCase();
}
