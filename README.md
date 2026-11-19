# Immo Watch

Self-hosted dashboard that watches real-estate listings for you. You describe what you want once
(onboarding), an [eve](https://eve.dev) agent searches the listing sites on a schedule and stores
the results in Postgres, and the dashboard (Next.js + [Arc UI](https://uiarc.dev)) shows them.

```
web (Next.js, :3000) ──reads──> db (Postgres) <──writes── agent (eve, cron + skills + tools) ──drives──> browser
        └────── "run now" (HTTP, basic auth) ───────────────────┘
```

## Run

```bash
cp .env.example .env        # fill POSTGRES_PASSWORD, AGENT_PASSWORD, ANTHROPIC_API_KEY
docker compose up -d --build
```

Open http://localhost:3000: the onboarding creates your first search and starts it.

## How it works

- **Cron**: `my-agent/agent/schedules/tick.md` fires every 10 minutes (run by `eve start`). The agent calls
  `due_searches` and runs each search whose own interval (set in the UI) has elapsed.
- **Skills** (`my-agent/agent/skills/<site>/SKILL.md`): how to query one site. Add a site = add a skill and its
  name to `save_listings`' `source` enum and to the onboarding `SOURCES`.
- **Tools** (`my-agent/agent/tools/`): `fetch_url`, `save_listings`, `record_run`, `get_search`, `due_searches`.
- **Schema**: `db/init.sql`, applied when the database volume is created.

## Browsing

The agent browses the sites like a person: the `browser` service is a stealth Chromium (Scrapling/Patchright, headed in
a virtual display) driven through the `browser_goto`, `browser_click`, `browser_fill`, `browser_read` and `browser_eval`
tools. It handles JavaScript pages and Cloudflare challenges.

| Site | How | Status |
|---|---|---|
| bienici | public JSON API (`fetch_url`) | works |
| pap | browser | works (tested) |
| seloger | browser | works from a normal connection; DataDome may refuse datacenter IPs: set `BROWSER_PROXY` to a residential proxy |

A refused run shows as `blocked` in the Searches page. Respect each site's terms of use.

## Dev

`my-agent`: `npm i && npx eve dev` (Node 24+). `web`: `npm i && npm run dev`. Dashboard UI components live in
`web/components/arc/` (installed with `npx shadcn@latest add @uiarc/<name>`).
