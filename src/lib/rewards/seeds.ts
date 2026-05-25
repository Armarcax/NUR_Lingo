/**
 * NUR Lingo — Rewards Persistence
 * Handles saving and loading HAYQ, Seeds, and Streaks from local storage.
 */

const STORAGE_KEY = "nur_lingo_seeds_v4";

export interface UserRewards {
  totalHAYQ: number;
  totalSeeds: number;
  streak: number;
  streakFreeze: number;
  lastActivityDate?: string; // YYYY-MM-DD
}

const DEFAULT_REWARDS: UserRewards = {
  totalHAYQ: 0,
  totalSeeds: 0,
  streak: 0,
  streakFreeze: 0,
};

export function loadRewards(): UserRewards {
  if (typeof window === "undefined") return DEFAULT_REWARDS;

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_REWARDS;
    const rewards = JSON.parse(data);
    return { ...DEFAULT_REWARDS, ...rewards };
  } catch (e) {
    console.error("Failed to load rewards:", e);
    return DEFAULT_REWARDS;
  }
}

export function saveRewards(rewards: UserRewards) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
  } catch (e) {
    console.error("Failed to save rewards:", e);
  }
}

export function addRewards(hayq: number, seeds: number) {
  const current = loadRewards();
  const today = new Date().toISOString().split("T")[0];

  let nextStreak = current.streak;
  if (current.lastActivityDate !== today) {
    // Check if it's the next day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (current.lastActivityDate === yesterdayStr) {
      nextStreak += 1;
    } else {
      // Streak broken, unless it was today
      if (!current.lastActivityDate) nextStreak = 1;
      // Note: checkAndApplyFreeze handles the logic for long gaps
    }
  }

  const updated: UserRewards = {
    ...current,
    totalHAYQ: current.totalHAYQ + hayq,
    totalSeeds: current.totalSeeds + seeds,
    streak: nextStreak,
    lastActivityDate: today,
  };
  saveRewards(updated);
  return updated;
}

export function buyStreakFreeze(): { success: boolean; error?: string; rewards: UserRewards } {
  const current = loadRewards();
  if (current.streakFreeze >= 2) {
    return { success: false, error: "Maximum 2 freezes allowed", rewards: current };
  }
  if (current.totalHAYQ < 50) {
    return { success: false, error: "Not enough HAYQ (needs 50)", rewards: current };
  }

  const updated: UserRewards = {
    ...current,
    totalHAYQ: current.totalHAYQ - 50,
    streakFreeze: current.streakFreeze + 1,
  };
  saveRewards(updated);
  return { success: true, rewards: updated };
}

export function checkAndApplyFreeze(): UserRewards {
  const current = loadRewards();
  if (!current.lastActivityDate) return current;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = new Date(current.lastActivityDate);
  lastDate.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    // More than 1 day missed
    if (current.streakFreeze > 0) {
      // Use freeze
      const updated: UserRewards = {
        ...current,
        streakFreeze: current.streakFreeze - 1,
        lastActivityDate: new Date(today.getTime() - 86400000).toISOString().split("T")[0], // Set to "yesterday"
      };
      saveRewards(updated);
      return updated;
    } else {
      // Streak lost
      const updated: UserRewards = {
        ...current,
        streak: 0,
      };
      saveRewards(updated);
      return updated;
    }
  }

  return current;
}
