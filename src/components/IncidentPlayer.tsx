"use client";

import Link from "next/link";
import { useState } from "react";
import { readClue, scoreIncident, startIncident, takeAction, type IncidentState } from "@/engine/incident";
import type { Level } from "@/engine/level";

const kindLabel = { metric: "Metric", log: "Log", config: "Config", trace: "Trace", note: "Note" } as const;
const severityStyle = {
  low: "border-amber-400/40 text-amber-300",
  high: "border-orange-400/40 text-orange-300",
  critical: "border-red-400/50 text-red-300",
} as const;

export function IncidentPlayer({ level }: { level: Level }) {
  const [state, setState] = useState<IncidentState>(() => startIncident(level));
  const over = state.status !== "active";
  const lastAction = [...state.events].reverse().find((e) => e.kind === "action");

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <Link href={`/zones/${level.zone}`} className="text-sm text-emerald-400">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 font-mono text-xs uppercase ${severityStyle[level.alert.severity]}`}>
            {level.alert.severity}
          </span>
          <span className="font-mono text-xs text-gray-500">{level.title}</span>
        </div>
        <h1 className="text-2xl font-semibold">{level.alert.title}</h1>
        <p className="text-sm text-gray-400">{level.alert.summary}</p>
      </header>

      <StatusBar state={state} />

      {lastAction && !over && (
        <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm" aria-live="polite">
          {lastAction.text}
        </p>
      )}

      {over ? (
        <Result level={level} state={state} onRetry={() => setState(startIncident(level))} />
      ) : (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium uppercase tracking-widest text-gray-400">Investigate</h2>
            {level.clues.map((clue) => {
              const read = state.cluesRead.includes(clue.id);
              return (
                <div key={clue.id} className="rounded-xl border border-white/10 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setState((s) => readClue(level, s, clue.id))}
                    className="flex w-full items-center justify-between gap-3 p-4 text-left active:bg-white/10"
                    aria-expanded={read}
                  >
                    <span className="flex flex-col">
                      <span className="font-mono text-xs uppercase text-gray-500">{kindLabel[clue.kind]}</span>
                      <span className="text-base">{clue.title}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-gray-500">{read ? "read" : `${clue.minutes} min`}</span>
                  </button>
                  {read && (
                    <pre className="overflow-x-auto border-t border-white/10 px-4 py-3 font-mono text-xs leading-relaxed text-gray-300">
                      {clue.lines.join("\n")}
                    </pre>
                  )}
                </div>
              );
            })}
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium uppercase tracking-widest text-gray-400">Act</h2>
            {level.actions.map((action) => {
              const taken = state.actionsTaken.includes(action.id);
              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={taken}
                  onClick={() => setState((s) => takeAction(level, s, action.id))}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 text-left active:bg-emerald-400/15 disabled:border-white/10 disabled:bg-transparent disabled:text-gray-500"
                >
                  <span className="text-base">{action.label}</span>
                  <span className="shrink-0 font-mono text-xs text-gray-500">{taken ? "done" : `${action.minutes} min`}</span>
                </button>
              );
            })}
          </section>
        </>
      )}

      <Timeline state={state} />
    </div>
  );
}

function StatusBar({ state }: { state: IncidentState }) {
  const tone = state.health > 50 ? "bg-emerald-400" : state.health > 20 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between font-mono text-xs text-gray-400">
          <span>System health</span>
          <span>{state.health}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={state.health} aria-valuemin={0} aria-valuemax={100} aria-label="System health">
          <div className={`h-full ${tone} transition-all`} style={{ width: `${state.health}%` }} />
        </div>
      </div>
      <div className="flex flex-col items-end font-mono">
        <span className="text-xs text-gray-400">Elapsed</span>
        <span className="text-sm" data-testid="elapsed">{state.minutes} min</span>
      </div>
    </div>
  );
}

function Result({ level, state, onRetry }: { level: Level; state: IncidentState; onRetry: () => void }) {
  const score = scoreIncident(level, state);
  const resolved = state.status === "resolved";
  return (
    <section className="flex flex-col gap-4">
      <div className={`rounded-xl border p-4 ${resolved ? "border-emerald-400/40 bg-emerald-400/5" : "border-red-400/40 bg-red-400/5"}`}>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-400">{resolved ? "Resolved" : "System down"}</p>
        <p className="mt-1 text-3xl font-semibold">
          {score.total}
          <span className="text-base text-gray-400"> / 100</span>
        </p>
        <p className="mt-1 text-lg" aria-label={`${score.stars} of 3 stars`}>
          {"★".repeat(score.stars)}
          <span className="text-gray-600">{"★".repeat(3 - score.stars)}</span>
        </p>
        {resolved && (
          <dl className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs text-gray-400">
            <div><dt>Fixed</dt><dd className="text-base text-gray-200">{score.resolved}</dd></div>
            <div><dt>Speed</dt><dd className="text-base text-gray-200">{score.speed}</dd></div>
            <div><dt>Precision</dt><dd className="text-base text-gray-200">{score.precision}</dd></div>
          </dl>
        )}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-gray-400">What broke</h2>
        <p className="mt-2 text-base">{level.rootCause.summary}</p>
        <h2 className="mt-4 text-sm font-medium uppercase tracking-widest text-gray-400">Learned today</h2>
        <p className="mt-2 text-base">{level.lesson}</p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onRetry} className="flex-1 rounded-xl border border-white/20 p-3 active:bg-white/10">
          Try again
        </button>
        <Link href={`/zones/${level.zone}`} className="flex-1 rounded-xl bg-emerald-500 p-3 text-center font-medium text-gray-950 active:bg-emerald-400">
          More incidents
        </Link>
      </div>
    </section>
  );
}

function Timeline({ state }: { state: IncidentState }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium uppercase tracking-widest text-gray-400">Timeline</h2>
      <ol className="flex flex-col gap-1 font-mono text-xs text-gray-400">
        {state.events.map((event, index) => (
          <li key={index} className="flex gap-3">
            <span className="w-10 shrink-0 text-right text-gray-600">+{event.minute}m</span>
            <span className={event.kind === "down" ? "text-red-300" : event.kind === "resolved" ? "text-emerald-300" : ""}>
              {event.text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
