import Link from "next/link";
import { zones } from "@/content/zones";

export default function Home() {
  const total = zones.reduce((sum, zone) => sum + zone.levels.length, 0);
  const playable = zones.reduce(
    (sum, zone) => sum + zone.levels.filter((level) => level.status === "playable").length,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">On-call</p>
        <h1 className="text-3xl font-semibold">Learned Today</h1>
        <p className="text-sm text-gray-400">
          An alert fires. You read the logs, pick a fix and explain what broke. One incident a day.
        </p>
      </header>

      <section className="rounded-xl border border-red-400/30 bg-red-400/5 p-4">
        <p className="font-mono text-xs uppercase tracking-widest text-red-300">Today&apos;s incident</p>
        <p className="mt-1 text-base">The pager is quiet for now.</p>
        <p className="mt-1 text-sm text-gray-400">
          {playable === 0
            ? `${total} incidents are on the map. The first ones go live this week.`
            : `${playable} of ${total} incidents are playable.`}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-gray-400">Zones</h2>
        {zones.map((zone) => (
          <Link
            key={zone.id}
            href={`/zones/${zone.id}`}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 active:bg-white/10"
          >
            <span className="flex flex-col">
              <span className="text-lg font-medium">{zone.name}</span>
              <span className="text-sm text-gray-400">{zone.tagline}</span>
            </span>
            <span className="ml-3 shrink-0 font-mono text-sm text-gray-500">{zone.levels.length}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
