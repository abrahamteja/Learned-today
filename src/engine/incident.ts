import type { Level } from "./level";

export type IncidentStatus = "active" | "resolved" | "down";

export interface IncidentEvent {
  minute: number;
  kind: "alert" | "clue" | "action" | "resolved" | "down";
  text: string;
}

/** Everything about one run of a level. Plain data, so it can be saved and restored. */
export interface IncidentState {
  levelId: string;
  minutes: number;
  health: number;
  status: IncidentStatus;
  cluesRead: string[];
  actionsTaken: string[];
  events: IncidentEvent[];
}

export function startIncident(level: Level): IncidentState {
  return {
    levelId: level.id,
    minutes: 0,
    health: level.startingHealth,
    status: "active",
    cluesRead: [],
    actionsTaken: [],
    events: [{ minute: 0, kind: "alert", text: level.alert.title }],
  };
}

function checkLevel(level: Level, state: IncidentState) {
  if (state.levelId !== level.id) {
    throw new Error(`This run is for "${state.levelId}", not "${level.id}"`);
  }
}

/** Let time pass while the incident is open, and take the system down if health runs out. */
function passTime(level: Level, state: IncidentState, minutes: number): IncidentState {
  const health = clamp(Math.round(state.health - level.healthLossPerMinute * minutes));
  return { ...state, minutes: state.minutes + minutes, health };
}

function settle(state: IncidentState): IncidentState {
  if (state.status === "active" && state.health <= 0) {
    return {
      ...state,
      status: "down",
      events: [...state.events, { minute: state.minutes, kind: "down", text: "The system went down." }],
    };
  }
  return state;
}

export function readClue(level: Level, state: IncidentState, clueId: string): IncidentState {
  checkLevel(level, state);
  const clue = level.clues.find((c) => c.id === clueId);
  if (!clue) throw new Error(`Unknown clue "${clueId}" in level "${level.id}"`);
  // Reading again is free, and nothing changes once the incident is over.
  if (state.status !== "active" || state.cluesRead.includes(clueId)) return state;

  const later = passTime(level, state, clue.minutes);
  return settle({
    ...later,
    cluesRead: [...state.cluesRead, clueId],
    events: [...state.events, { minute: later.minutes, kind: "clue", text: clue.title }],
  });
}

export function takeAction(level: Level, state: IncidentState, actionId: string): IncidentState {
  checkLevel(level, state);
  const action = level.actions.find((a) => a.id === actionId);
  if (!action) throw new Error(`Unknown action "${actionId}" in level "${level.id}"`);
  if (state.status !== "active" || state.actionsTaken.includes(actionId)) return state;

  const later = passTime(level, state, action.minutes);
  // If the system ran out of health while the action was underway, it went down first.
  if (later.health <= 0) {
    return settle({ ...later, actionsTaken: [...state.actionsTaken, actionId] });
  }
  const health = clamp(later.health + action.health);
  const events: IncidentEvent[] = [
    ...state.events,
    { minute: later.minutes, kind: "action", text: `${action.label}: ${action.feedback}` },
  ];
  const next: IncidentState = { ...later, health, actionsTaken: [...state.actionsTaken, actionId], events };

  if (action.outcome === "fixes" && health > 0) {
    return {
      ...next,
      status: "resolved",
      events: [...events, { minute: later.minutes, kind: "resolved", text: "Incident resolved." }],
    };
  }
  return settle(next);
}

export interface Score {
  total: number;
  /** 50 points for fixing it at all. */
  resolved: number;
  /** Up to 30 points for finishing at or under par. */
  speed: number;
  /** Up to 20 points, minus 10 for each action that did nothing or made it worse. */
  precision: number;
  stars: 0 | 1 | 2 | 3;
}

export function scoreIncident(level: Level, state: IncidentState): Score {
  checkLevel(level, state);
  if (state.status !== "resolved") {
    return { total: 0, resolved: 0, speed: 0, precision: 0, stars: 0 };
  }

  const overPar = Math.max(0, state.minutes - level.parMinutes);
  // Lose all speed points at twice the par time.
  const speed = Math.round(30 * Math.max(0, 1 - overPar / level.parMinutes));

  const misses = state.actionsTaken.filter((id) => {
    const outcome = level.actions.find((a) => a.id === id)?.outcome;
    return outcome === "nothing" || outcome === "harms";
  }).length;
  const precision = Math.max(0, 20 - 10 * misses);

  const total = 50 + speed + precision;
  const stars = total >= 90 ? 3 : total >= 70 ? 2 : 1;
  return { total, resolved: 50, speed, precision, stars };
}

function clamp(health: number) {
  return Math.min(100, Math.max(0, health));
}
