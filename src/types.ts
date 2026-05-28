/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserState {
  userId: string;
  email: string;
  username: string;
  level: number;
  xp: number;
  xpNeeded: number;
  gems: number;
  
  // Custom Attributes (points)
  strength: number;
  wisdom: number;
  spirit: number;
  
  // Streaks for individual habits
  walkStreak: number;
  phoneStreak: number;
  studyStreak: number;
  
  // Overall campaign totals
  perfectDaysCount: number;
  bestStreak: number;
  
  // Avatar Progression
  bunnyStage: 'Baby' | 'Clean Baby' | 'Medium' | 'Grown' | 'Flying'; // Stage 1 to 5
  bunnyXp: number; // accumulated
  bunnyXpNeeded: number;
  selectedTrail: 'None' | 'Blue' | 'Pink' | 'Rainbow';
  ownedItems: string[]; // shop items bought, e.g. ['blue-trail', 'avatar-badge']
  
  // Active Boosts & Shields
  streakShieldCount: number; // spendable streak shields owned
  xpBoostEnd: string | null;  // ISO timestamp
  doubleXpBoostEnd: string | null; // ISO timestamp
  hasAvatarBadge: boolean;
  
  // Individual Completion Status
  walkCompletedToday: boolean;
  phoneCompletedToday: boolean;
  studyCompletedToday: boolean;
  
  // Historic Active Date checks
  lastActiveDate: string; // "YYYY-MM-DD"
  
  // Boss HP Tracker
  bossHp: number;
  bossMaxHp: number;
  bossTier: 1 | 2 | 3;
  
  // 7-Day XP History for stats chart rendering
  xpHistory: { [dateStr: string]: number }; // timestamp -> xp gained on that day
}

export interface JournalNote {
  id: string;
  userId: string;
  date: string;
  title: string;
  content: string;
}

export interface LeaderboardEntry {
  username: string;
  email?: string;
  level: number;
  xp: number;
  isBot?: boolean;
  tag?: string;
}
