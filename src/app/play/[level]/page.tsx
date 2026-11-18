import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IncidentPlayer } from "@/components/IncidentPlayer";
import { getLevel, levels } from "@/content/levels";

export function generateStaticParams() {
  return levels.map((level) => ({ level: level.id }));
}

export async function generateMetadata({ params }: PageProps<"/play/[level]">): Promise<Metadata> {
  const { level: id } = await params;
  const level = getLevel(id);
  return { title: level ? `${level.title} · Learned Today` : "Learned Today" };
}

export default async function PlayPage({ params }: PageProps<"/play/[level]">) {
  const { level: id } = await params;
  const level = getLevel(id);
  if (!level) notFound();
  return <IncidentPlayer level={level} />;
}
