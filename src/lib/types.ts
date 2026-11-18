export const TIERS = ["novice", "intermediate", "expert"] as const;

export type Tier = (typeof TIERS)[number];

export type LevelStatus = "planned" | "playable";

export interface LevelSummary {
  /** Stable id, used in URLs and saved progress. Never rename once shipped. */
  id: string;
  title: string;
  tier: Tier;
  /** One line on what the player learns by fixing it. */
  teaches: string;
  status: LevelStatus;
}

export interface Zone {
  id: string;
  name: string;
  tagline: string;
  levels: LevelSummary[];
}
