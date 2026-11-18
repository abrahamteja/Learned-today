import { parseLevel, type Level } from "@/engine/level";
import infraBadDeploy from "./infra-bad-deploy.json";
import infraDiskFull from "./infra-disk-full.json";
import infraMemoryLeak from "./infra-memory-leak.json";

// Each playable level is a JSON file in this folder, imported and listed here.
// Parsing at import time means a broken level fails the build and the tests.
const files: unknown[] = [infraDiskFull, infraMemoryLeak, infraBadDeploy];

export const levels: Level[] = files.map(parseLevel);

export function getLevel(id: string): Level | undefined {
  return levels.find((level) => level.id === id);
}
