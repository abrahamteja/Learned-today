import { describe, expect, it } from "vitest";
import { fixtureLevel } from "./fixture";
import { readClue, scoreIncident, startIncident, takeAction } from "./incident";
import { parseLevel } from "./level";

const level = parseLevel(fixtureLevel);

describe("startIncident", () => {
  it("opens the incident at the level's starting health", () => {
    const state = startIncident(level);
    expect(state).toMatchObject({ levelId: "test-disk-full", minutes: 0, health: 60, status: "active" });
    expect(state.events).toEqual([{ minute: 0, kind: "alert", text: "Disk 98% full on api-1" }]);
  });
});

describe("readClue", () => {
  it("costs time and health", () => {
    const state = readClue(level, startIncident(level), "big-files");
    expect(state.minutes).toBe(3);
    expect(state.health).toBe(54);
    expect(state.cluesRead).toEqual(["big-files"]);
  });

  it("is free to read the same clue again", () => {
    const once = readClue(level, startIncident(level), "disk-graph");
    expect(readClue(level, once, "disk-graph")).toBe(once);
  });

  it("does not change the state it was given", () => {
    const start = startIncident(level);
    readClue(level, start, "disk-graph");
    expect(start.minutes).toBe(0);
    expect(start.cluesRead).toEqual([]);
  });

  it("throws on an unknown clue", () => {
    expect(() => readClue(level, startIncident(level), "nope")).toThrow(/Unknown clue "nope"/);
  });
});

describe("takeAction", () => {
  it("resolves the incident with the right fix", () => {
    let state = startIncident(level);
    state = readClue(level, state, "big-files");
    state = takeAction(level, state, "rotate-logs");
    expect(state.status).toBe("resolved");
    expect(state.minutes).toBe(6);
    expect(state.health).toBe(88);
    expect(state.events.at(-1)).toEqual({ minute: 6, kind: "resolved", text: "Incident resolved." });
  });

  it("wastes time on an action that does nothing", () => {
    const state = takeAction(level, startIncident(level), "restart");
    expect(state).toMatchObject({ status: "active", minutes: 4, health: 52 });
  });

  it("takes the system down when health runs out", () => {
    let state = takeAction(level, startIncident(level), "delete-db");
    expect(state).toMatchObject({ status: "active", health: 8 });
    state = takeAction(level, state, "restart");
    expect(state.status).toBe("down");
    expect(state.health).toBe(0);
    expect(state.events.at(-1)?.kind).toBe("down");
  });

  it("does nothing once the incident is over", () => {
    const resolved = takeAction(level, startIncident(level), "rotate-logs");
    expect(takeAction(level, resolved, "restart")).toBe(resolved);
    expect(readClue(level, resolved, "disk-graph")).toBe(resolved);
  });

  it("does not repeat an action", () => {
    const once = takeAction(level, startIncident(level), "restart");
    expect(takeAction(level, once, "restart")).toBe(once);
  });

  it("goes down if health runs out before the fix lands", () => {
    const tired = parseLevel({ ...fixtureLevel, startingHealth: 10 });
    const state = takeAction(tired, startIncident(tired), "rotate-logs");
    expect(state.status).toBe("resolved");
    const worse = parseLevel({ ...fixtureLevel, startingHealth: 5, healthLossPerMinute: 30 });
    expect(takeAction(worse, startIncident(worse), "rotate-logs").status).toBe("down");
  });

  it("refuses a run that belongs to another level", () => {
    const other = parseLevel({ ...fixtureLevel, id: "other-level" });
    expect(() => takeAction(other, startIncident(level), "restart")).toThrow(/This run is for "test-disk-full"/);
  });
});

describe("scoreIncident", () => {
  it("gives full marks for a fast, clean fix", () => {
    let state = readClue(level, startIncident(level), "big-files");
    state = takeAction(level, state, "rotate-logs");
    expect(scoreIncident(level, state)).toEqual({ total: 100, resolved: 50, speed: 30, precision: 20, stars: 3 });
  });

  it("takes points off for slow work and wrong moves", () => {
    let state = startIncident(level);
    state = readClue(level, state, "disk-graph");
    state = readClue(level, state, "big-files");
    state = takeAction(level, state, "restart");
    state = takeAction(level, state, "rotate-logs");
    // 12 minutes against a par of 10, and one wasted action.
    expect(scoreIncident(level, state)).toEqual({ total: 84, resolved: 50, speed: 24, precision: 10, stars: 2 });
  });

  it("scores zero while the incident is open or after it goes down", () => {
    expect(scoreIncident(level, startIncident(level)).total).toBe(0);
    let down = takeAction(level, startIncident(level), "delete-db");
    down = takeAction(level, down, "restart");
    expect(down.status).toBe("down");
    expect(scoreIncident(level, down)).toEqual({ total: 0, resolved: 0, speed: 0, precision: 0, stars: 0 });
  });
});
