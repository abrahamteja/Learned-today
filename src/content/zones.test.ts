import { describe, expect, it } from "vitest";
import { TIERS } from "@/lib/types";
import { getZone, zones } from "./zones";

describe("level map", () => {
  it("has the three zones in order", () => {
    expect(zones.map((zone) => zone.id)).toEqual(["infra", "ml-ai", "security"]);
  });

  it("uses level ids that are unique across every zone", () => {
    const ids = zones.flatMap((zone) => zone.levels.map((level) => level.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses url-safe ids", () => {
    for (const zone of zones) {
      expect(zone.id).toMatch(/^[a-z0-9-]+$/);
      for (const level of zone.levels) {
        expect(level.id).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("gives every zone at least one level in each tier", () => {
    for (const zone of zones) {
      for (const tier of TIERS) {
        expect(zone.levels.some((level) => level.tier === tier), `${zone.id} ${tier}`).toBe(true);
      }
    }
  });

  it("orders each zone from novice to expert", () => {
    for (const zone of zones) {
      const ranks = zone.levels.map((level) => TIERS.indexOf(level.tier));
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it("finds a zone by id and returns undefined for an unknown one", () => {
    expect(getZone("security")?.name).toBe("Security");
    expect(getZone("nope")).toBeUndefined();
  });
});
