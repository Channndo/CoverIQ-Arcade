export interface LeaderboardEntry {
  rank: number;
  publicName: string;
  avatarId: string | null;
  value: number;
  updatedAt?: string;
  isYou?: boolean;
}

export interface LeaderboardResponse {
  ok: boolean;
  disabled?: boolean;
  gameSlug?: string;
  statKey?: string;
  label?: string;
  entries?: LeaderboardEntry[];
  you?: { rank: number; value: number; publicName: string } | null;
}

export interface ArcadeIdentityState {
  signedIn: boolean;
  publicName: string | null;
  avatarId: string | null;
  signupUrl: string;
  statsApiUrl: string;
}

export const AVATAR_GLYPHS: Record<string, string> = {
  'cyan-brain': '🧠',
  'teal-shield': '🛡️',
  'amber-book': '📘',
  'violet-star': '✦',
  'rose-heart': '♥',
  'sky-home': '🏠',
  'lime-leaf': '🌿',
  'slate-initials': '◆',
};
