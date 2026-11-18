import { parseLevel, type Level } from "@/engine/level";

// Each playable level is a JSON file in this folder, imported and listed here.
// Parsing at import time means a broken level fails the build and the tests.
const files: unknown[] = [];

export const levels: Level[] = files.map(parseLevel);

export function getLevel(id: string): Level | undefined {
  return levels.find((level) => level.id === id);
}
