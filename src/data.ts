/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Daily RPG Medieval quotes
export const MOTIVATIONAL_QUOTES = [
  "To defeat the Sloth, one must take the first Woodland Step!",
  "A mind sharpened by study is the finest shield against the Shadow Procrastinator.",
  "Every minute off your device weakens the spell of the Snooze Beast.",
  "Streak guards ready! The forest spirits watch your persistence.",
  "Even a flying rabbit started as a small baby bunny. Take your first walk today!",
  "Do not let the Quitter animal shroud you in the cloak of shame. Fight on!"
];

// 3 Default habits/quests
export const DEFAULT_HABITS = [
  {
    id: "habit-walk",
    name: "Afternoon walk 10 mins",
    category: "Fitness",
    difficulty: "Easy",
    xpReward: 5,
    gemReward: 1, // Awarded on 3-day streak completion
    streakTarget: 3,
    description: "Venturing into the green woods. Clear the mind and stretch your paws."
  },
  {
    id: "habit-phone",
    name: "1 hour no phone",
    category: "Mind",
    difficulty: "Medium",
    xpReward: 10,
    gemReward: 15, // Awarded on 5-day streak completion
    streakTarget: 5,
    description: "Banish the glowing screen curse to focus on physical reality."
  },
  {
    id: "habit-study",
    name: "1 hour studying",
    category: "Academic",
    difficulty: "Hard",
    xpReward: 15,
    gemReward: 30, // Awarded on 7-day streak completion
    streakTarget: 7,
    description: "Scribing ancient codexes and scrolls to fortify your intelligence."
  }
];

// Leaderboard AI Competitors for offline fallback and fantasy competition
export const LEADERBOARD_BOTS = [
  { name: "Sir Procrastinator Defeated", xp: 4520, level: 14, tag: "Guardian" },
  { name: "Slayer of Sloths", xp: 3200, level: 12, tag: "Warlord" },
  { name: "Young Sprout Barnaby", xp: 1980, level: 8, tag: "Scholar" },
  { name: "Winged Bun Fanatic", xp: 1550, level: 7, tag: "Novice" },
  { name: "Lethargy Spell Shield", xp: 950, level: 4, tag: "Sentry" }
];
