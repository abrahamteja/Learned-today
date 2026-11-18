import type { LevelInput } from "./level";

/** A small, complete level used by the engine tests. Not shown in the game. */
export const fixtureLevel: LevelInput = {
  id: "test-disk-full",
  zone: "infra",
  tier: "novice",
  title: "Disk full (test)",
  alert: { title: "Disk 98% full on api-1", severity: "high", summary: "Writes are starting to fail." },
  startingHealth: 60,
  healthLossPerMinute: 2,
  parMinutes: 10,
  clues: [
    { id: "disk-graph", kind: "metric", title: "Disk usage, last 24h", lines: ["Climbs 2% an hour, steady"], minutes: 2 },
    { id: "big-files", kind: "log", title: "Largest files", lines: ["/var/log/app.log  41 GB"], minutes: 3 },
  ],
  actions: [
    { id: "restart", label: "Restart the server", minutes: 4, outcome: "nothing", health: 0, feedback: "It comes back and the disk is still full." },
    { id: "delete-db", label: "Delete the database files", minutes: 1, outcome: "harms", health: -50, feedback: "You freed space by deleting customer data." },
    { id: "rotate-logs", label: "Rotate and compress the logs", minutes: 3, outcome: "fixes", health: 40, feedback: "Disk drops to 35%." },
  ],
  rootCause: { summary: "Logs were never rotated.", keyPoints: ["app log grew without limit", "log rotation was missing"] },
  lesson: "Rotate logs and alert on disk growth, not just on a full disk.",
};
