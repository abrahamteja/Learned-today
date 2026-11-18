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
