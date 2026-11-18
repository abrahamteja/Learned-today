# Learned Today

A phone-first game that teaches software infrastructure, ML and AI, and security by putting you on call. An alert fires, you read the logs and metrics, pick a fix, and explain what broke. Levels run from novice to expert.

## Zones

| Zone | Novice | Expert |
| --- | --- | --- |
| Infrastructure | A full disk, a memory leak, a bad deploy | Cascading failures, a region outage |
| ML and AI | Stale features, bad labels, slow inference | Eval regressions, GPU scheduling |
| Security | A leaked key, a public bucket, brute-force logins | Prompt injection, a supply chain attack |

The full level map lives in [`src/content/zones.ts`](src/content/zones.ts). Levels marked `planned` show as "Soon" in the app, so the map is also the roadmap.

## How a level works

1. **Alert:** the pager fires with a symptom, like checkout latency at 4 seconds.
2. **Investigate:** tap through metric, log and config cards.
3. **Act:** choose a fix. The system recovers, or gets worse.
4. **Explain:** write the root cause in a sentence, and Claude grades it against the level's rubric.

## Writing a level

A level is a JSON file in [`src/content/levels`](src/content/levels), checked against the schema in [`src/engine/level.ts`](src/engine/level.ts):

- **alert:** what the pager says.
- **clues:** metrics, logs and configs to read. Each one costs simulated minutes.
- **actions:** what the player can do. Each one `fixes`, `helps`, does `nothing` or `harms`, and moves system health.
- **startingHealth** and **healthLossPerMinute:** how long the player has before the system goes down.
- **parMinutes:** how fast a good on-call engineer would fix it.
- **rootCause** and **lesson:** what broke, the points a good write-up mentions, and the takeaway.

The engine in [`src/engine/incident.ts`](src/engine/incident.ts) is pure functions over plain data: `startIncident`, `readClue`, `takeAction` and `scoreIncident`. A run scores 50 for fixing it, up to 30 for speed against par, and up to 20 for precision, minus 10 for each action that did nothing or made it worse. A broken level file fails the tests and the build.

## Stack

- Next.js (App Router) with TypeScript and Tailwind, installable on a phone as a web app
- Vercel for hosting, with a preview deploy for every pull request
- Supabase for sign-in and saved progress (coming)
- Claude for grading root-cause write-ups with structured output (coming)
- Vitest and GitHub Actions: lint, typecheck, tests and build on every pull request

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. To try it on your phone, open the deployed site and choose **Add to Home Screen**.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Roadmap

- [x] Day 1: app shell, phone install, zone map, CI
- [x] Day 2: level format and incident engine, with tests
- [ ] Day 3: the incident screen
- [ ] Day 4: three playable novice infrastructure levels
- [ ] Day 5: scoring and saved progress
- [ ] Day 6: Claude-graded root causes
- [ ] Day 7: polish from real play, screenshots

## License

MIT
