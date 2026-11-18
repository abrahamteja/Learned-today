import type { Zone } from "@/lib/types";

// The level map. Each level becomes playable once its incident file exists;
// until then it shows as planned so the map doubles as the roadmap.
export const zones: Zone[] = [
  {
    id: "infra",
    name: "Infrastructure",
    tagline: "Keep the servers, databases and deploys alive.",
    levels: [
      { id: "infra-disk-full", title: "Disk full at 3 AM", tier: "novice", teaches: "Log rotation and disk alerts", status: "planned" },
      { id: "infra-memory-leak", title: "The slow climb", tier: "novice", teaches: "Spotting a memory leak and restarting safely", status: "planned" },
      { id: "infra-bad-deploy", title: "It worked in staging", tier: "novice", teaches: "Rolling back a bad deploy", status: "planned" },
      { id: "infra-slow-query", title: "Checkout is slow", tier: "intermediate", teaches: "Finding a missing database index", status: "planned" },
      { id: "infra-cache-stampede", title: "Cache stampede", tier: "intermediate", teaches: "Cache expiry, locking and warm-up", status: "planned" },
      { id: "infra-queue-backlog", title: "The queue that never drains", tier: "intermediate", teaches: "Consumers, retries and dead-letter queues", status: "planned" },
      { id: "infra-cascading-failure", title: "One timeout takes down five services", tier: "expert", teaches: "Timeouts, circuit breakers and load shedding", status: "planned" },
      { id: "infra-region-outage", title: "A whole region goes dark", tier: "expert", teaches: "Failover, DNS and data replication", status: "planned" },
    ],
  },
  {
    id: "ml-ai",
    name: "ML and AI",
    tagline: "Keep models, data pipelines and AI features honest.",
    levels: [
      { id: "ml-stale-features", title: "Yesterday's data", tier: "novice", teaches: "Freshness checks on a feature pipeline", status: "planned" },
      { id: "ml-bad-label", title: "The model learned a typo", tier: "novice", teaches: "Label quality and data validation", status: "planned" },
      { id: "ml-latency-spike", title: "Inference got slow", tier: "novice", teaches: "Batching, timeouts and model size", status: "planned" },
      { id: "ml-model-drift", title: "Accuracy quietly drops", tier: "intermediate", teaches: "Detecting drift and when to retrain", status: "planned" },
      { id: "ai-rag-regression", title: "The assistant forgot the handbook", tier: "intermediate", teaches: "Retrieval, chunking and evals for RAG", status: "planned" },
      { id: "ai-token-bill", title: "The token bill tripled", tier: "intermediate", teaches: "Prompt caching, routing and cost limits", status: "planned" },
      { id: "ai-eval-regression", title: "New prompt, worse answers", tier: "expert", teaches: "Eval sets as a release gate", status: "planned" },
      { id: "ml-gpu-starvation", title: "Training jobs starve each other", tier: "expert", teaches: "GPU scheduling and capacity planning", status: "planned" },
    ],
  },
  {
    id: "security",
    name: "Security",
    tagline: "Find the breach, contain it and close the hole.",
    levels: [
      { id: "sec-leaked-key", title: "A key on GitHub", tier: "novice", teaches: "Rotating a leaked secret and scanning for more", status: "planned" },
      { id: "sec-public-bucket", title: "The bucket was public", tier: "novice", teaches: "Storage permissions and least privilege", status: "planned" },
      { id: "sec-brute-force", title: "Ten thousand failed logins", tier: "novice", teaches: "Rate limits, lockouts and MFA", status: "planned" },
      { id: "sec-sql-injection", title: "Strange queries in the logs", tier: "intermediate", teaches: "SQL injection and parameterized queries", status: "planned" },
      { id: "sec-expired-cert", title: "Every browser says not secure", tier: "intermediate", teaches: "TLS certificates and renewal automation", status: "planned" },
      { id: "sec-overbroad-role", title: "The intern can delete production", tier: "intermediate", teaches: "Role design and privilege escalation", status: "planned" },
      { id: "sec-prompt-injection", title: "The chatbot emailed the database", tier: "expert", teaches: "Prompt injection and tool permissions for AI agents", status: "planned" },
      { id: "sec-supply-chain", title: "A dependency turned hostile", tier: "expert", teaches: "Supply chain attacks, pinning and provenance", status: "planned" },
    ],
  },
];

export function getZone(id: string): Zone | undefined {
  return zones.find((zone) => zone.id === id);
}
