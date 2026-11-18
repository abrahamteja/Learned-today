import { z } from "zod";
import { TIERS } from "@/lib/types";

const id = z.string().regex(/^[a-z0-9-]+$/, "use lowercase letters, digits and dashes");
const text = z.string().trim().min(1);

/** Something the player can look at: a graph, a log tail, a config file. */
export const ClueSchema = z.object({
  id,
  kind: z.enum(["metric", "log", "config", "trace", "note"]),
  title: text,
  lines: z.array(z.string()).min(1),
  /** Simulated minutes it takes to read this clue. */
  minutes: z.number().int().min(0).default(1),
});

/** Something the player can do to the system. */
export const ActionSchema = z.object({
  id,
  label: text,
  /** Simulated minutes the action takes. */
  minutes: z.number().int().min(0),
  /** fixes ends the incident; helps buys time; nothing wastes time; harms makes it worse. */
  outcome: z.enum(["fixes", "helps", "nothing", "harms"]),
  /** Change to system health, from -100 to 100, applied after the minutes pass. */
  health: z.number().int().min(-100).max(100),
  /** What the player sees after taking the action. */
  feedback: text,
});

export const LevelSchema = z
  .object({
    id,
    zone: z.enum(["infra", "ml-ai", "security"]),
    tier: z.enum(TIERS),
    title: text,
    alert: z.object({
      title: text,
      severity: z.enum(["low", "high", "critical"]),
      summary: text,
    }),
    startingHealth: z.number().int().min(1).max(100),
    /** Health lost per simulated minute while the incident is open. */
    healthLossPerMinute: z.number().min(0),
    /** Minutes a good on-call engineer would take. Faster than par earns full speed points. */
    parMinutes: z.number().int().min(1),
    clues: z.array(ClueSchema).min(1),
    actions: z.array(ActionSchema).min(2),
    rootCause: z.object({
      summary: text,
      /** Points a good write-up mentions. Used later to grade the player's explanation. */
      keyPoints: z.array(text).min(1),
    }),
    lesson: text,
  })
  .superRefine((level, ctx) => {
    const duplicate = (ids: string[]) => ids.find((value, index) => ids.indexOf(value) !== index);

    const clue = duplicate(level.clues.map((c) => c.id));
    if (clue) ctx.addIssue({ code: "custom", path: ["clues"], message: `duplicate clue id "${clue}"` });

    const action = duplicate(level.actions.map((a) => a.id));
    if (action) ctx.addIssue({ code: "custom", path: ["actions"], message: `duplicate action id "${action}"` });

    if (!level.actions.some((a) => a.outcome === "fixes")) {
      ctx.addIssue({ code: "custom", path: ["actions"], message: "at least one action must fix the incident" });
    }
    if (!level.actions.some((a) => a.outcome !== "fixes")) {
      ctx.addIssue({ code: "custom", path: ["actions"], message: "at least one action must be a wrong or partial choice" });
    }
  });

export type Clue = z.infer<typeof ClueSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Level = z.infer<typeof LevelSchema>;
/** A level as written in a JSON file, before defaults are filled in. */
export type LevelInput = z.input<typeof LevelSchema>;

/** Parse and check a level file. Throws with every problem listed if it is invalid. */
export function parseLevel(input: unknown): Level {
  const result = LevelSchema.safeParse(input);
  if (!result.success) {
    const where = typeof input === "object" && input && "id" in input ? ` "${String(input.id)}"` : "";
    const problems = result.error.issues.map((issue) => `${issue.path.join(".") || "level"}: ${issue.message}`);
    throw new Error(`Invalid level${where}:\n- ${problems.join("\n- ")}`);
  }
  return result.data;
}
