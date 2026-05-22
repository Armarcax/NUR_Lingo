/**
 * NUR Lingo — Rewards Persistence
 * Handles saving and loading HAYQ and Seeds from local storage.
 */

const STORAGE_KEY = "nur_lingo_seeds_v4";

export interface UserRewards {
  totalHAYQ: number;
  totalSeeds: number;
}

export function loadRewards(): UserRewards {
  if (typeof window === "undefined") return { totalHAYQ: 0, totalSeeds: 0 };

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { totalHAYQ: 0, totalSeeds: 0 };
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load rewards:", e);
    return { totalHAYQ: 0, totalSeeds: 0 };
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
  const updated = {
    totalHAYQ: current.totalHAYQ + hayq,
    totalSeeds: current.totalSeeds + seeds
  };
  saveRewards(updated);
  return updated;
}
