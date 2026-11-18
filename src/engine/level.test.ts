import { describe, expect, it } from "vitest";
import { fixtureLevel } from "./fixture";
import { parseLevel } from "./level";

const clone = () => structuredClone(fixtureLevel);

describe("parseLevel", () => {
  it("accepts a complete level and fills in defaults", () => {
    const input = clone();
    delete input.clues[0].minutes;
    const level = parseLevel(input);
    expect(level.clues[0].minutes).toBe(1);
  });

  it("rejects a level with no fix", () => {
    const input = clone();
    input.actions = input.actions.filter((a) => a.outcome !== "fixes");
    expect(() => parseLevel(input)).toThrow(/at least one action must fix the incident/);
  });

  it("rejects a level where every action fixes it", () => {
    const input = clone();
    input.actions = input.actions.map((a) => ({ ...a, outcome: "fixes" as const }));
    expect(() => parseLevel(input)).toThrow(/wrong or partial choice/);
  });

  it("rejects duplicate clue and action ids", () => {
    const input = clone();
    input.clues[1].id = input.clues[0].id;
    input.actions[1].id = input.actions[0].id;
    expect(() => parseLevel(input)).toThrow(/duplicate clue id "disk-graph"[\s\S]*duplicate action id "restart"/);
  });

  it("names the level and the field in the error", () => {
    const input = clone();
    input.alert.title = "";
    expect(() => parseLevel(input)).toThrow(/Invalid level "test-disk-full":\n- alert.title/);
  });

  it("rejects ids that are not url-safe", () => {
    const input = clone();
    input.id = "Disk Full";
    expect(() => parseLevel(input)).toThrow(/lowercase letters, digits and dashes/);
  });
});
