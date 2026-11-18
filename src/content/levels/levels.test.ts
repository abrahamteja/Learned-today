import { describe, expect, it } from "vitest";
import { getZone, zones } from "@/content/zones";
import { levels } from ".";

describe("level files", () => {
  it("match an entry on the level map", () => {
    for (const level of levels) {
      const entry = getZone(level.zone)?.levels.find((l) => l.id === level.id);
      expect(entry, `${level.id} is missing from the map`).toBeDefined();
      expect(entry?.tier).toBe(level.tier);
    }
  });

  it("exist for every level the map calls playable", () => {
    const files = new Set(levels.map((level) => level.id));
    for (const zone of zones) {
      for (const level of zone.levels.filter((l) => l.status === "playable")) {
        expect(files.has(level.id), `${level.id} is playable but has no file`).toBe(true);
      }
    }
  });
});

describe("every level", () => {
  it("can still be fixed after reading every clue", async () => {
    const { readClue, startIncident, takeAction } = await import("@/engine/incident");
    for (const level of levels) {
      let state = startIncident(level);
      for (const clue of level.clues) state = readClue(level, state, clue.id);
      expect(state.status, `${level.id}: down before any action`).toBe("active");
      const fix = level.actions.find((a) => a.outcome === "fixes");
      state = takeAction(level, state, fix!.id);
      expect(state.status, `${level.id}: the fix should still land`).toBe("resolved");
    }
  });

  it("has a par time the fix can beat", () => {
    for (const level of levels) {
      const fastest = Math.min(...level.actions.filter((a) => a.outcome === "fixes").map((a) => a.minutes));
      expect(fastest, level.id).toBeLessThanOrEqual(level.parMinutes);
    }
  });
});
