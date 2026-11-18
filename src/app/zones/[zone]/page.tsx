import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getZone, zones } from "@/content/zones";
import { TIERS } from "@/lib/types";

export function generateStaticParams() {
  return zones.map((zone) => ({ zone: zone.id }));
}

export async function generateMetadata({ params }: PageProps<"/zones/[zone]">): Promise<Metadata> {
  const { zone: id } = await params;
  const zone = getZone(id);
  return { title: zone ? `${zone.name} · Learned Today` : "Learned Today" };
}

const tierLabel = { novice: "Novice", intermediate: "Intermediate", expert: "Expert" } as const;

export default async function ZonePage({ params }: PageProps<"/zones/[zone]">) {
  const { zone: id } = await params;
  const zone = getZone(id);
  if (!zone) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Link href="/" className="text-sm text-emerald-400">
          ← All zones
        </Link>
        <h1 className="text-3xl font-semibold">{zone.name}</h1>
        <p className="text-sm text-gray-400">{zone.tagline}</p>
      </header>

      {TIERS.map((tier) => {
        const levels = zone.levels.filter((level) => level.tier === tier);
        if (levels.length === 0) return null;
        return (
          <section key={tier} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium uppercase tracking-widest text-gray-400">{tierLabel[tier]}</h2>
            <ol className="flex flex-col gap-2">
              {levels.map((level) => (
                <li key={level.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-base font-medium">{level.title}</span>
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-xs text-gray-400">
                      {level.status === "playable" ? "Play" : "Soon"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">{level.teaches}</p>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
