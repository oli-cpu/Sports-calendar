# Personal Sports Calendar

A sport-agnostic web app: pick the teams, leagues and athletes you follow across any sport, and get a personal calendar of the matches, races and tournaments that matter to you — with `.ics` export and Google Calendar links.

## Sports data source

Live data from **[TheSportsDB](https://www.thesportsdb.com/)**'s free tier (`src/services/sports/TheSportsDbProvider.ts`), no signup or secret key needed:

- The free `123` key is public by design (it's baked into the request URL), so the
  app talks to TheSportsDB **directly from the browser** — no backend/proxy is needed
  for this data source.
- **Known free-tier limitation:** TheSportsDB's keyword-search endpoints
  (`searchteams.php`, `searchplayers.php`) are restricted on the free key and always
  return their own demo result, regardless of query — this is documented by
  TheSportsDB itself, not a bug here. To work around it, the app instead fetches the
  *unrestricted* list endpoints (all leagues, then each seed league's ~10 teams via
  `search_all_teams.php`) once, caches them in memory, and searches over that real,
  live-fetched catalog client-side.
- Covers well: football (Premier League, La Liga, Bundesliga, Serie A, Champions
  League), basketball (NBA, Euroleague), motorsport (Formula 1, MotoGP), ice hockey
  (NHL), American football (NFL), rugby.
- Weaker / not live: individual-athlete sports (tennis, boxing, MMA, athletics) — free
  athlete search is unreliable on TheSportsDB even ignoring the demo-result issue, so
  `searchAthletes` and tennis leagues use a small static seed list instead of pretending
  to search live data that doesn't reliably exist. Golf, handball, volleyball, baseball,
  winter sports currently have no seed leagues configured (`SEED_LEAGUE_NAMES` in the
  provider), so they show no results until leagues are added there.
- Events come straight from the API (`eventsnextleague.php` / `eventsnext.php`) for
  whichever leagues/teams you've added as interests — nothing about events is mocked.
- `MockSportsDataProvider` (fully offline, no network) is still in the codebase as a
  fallback for demos — swap the one line in `src/services/sports/index.ts` to use it.

If you outgrow the free tier (rate limits, more sports, live/2-min scores), TheSportsDB
Premium ($9/mo) gives a personal key and the v2 API — see "Connecting a different or
paid API" below.

## Status

Implemented:
- Landing page → onboarding (choose sports → search & add interests)
- Dashboard with upcoming events for your interests
- Events browser with sport/timeframe filters and multi-select "add selected to calendar"
- Event detail page with reminder options, Google Calendar link, `.ics` download
- Calendar page (Month / Week / Agenda views) with bulk `.ics` export
- My Interests page (add/remove/browse by sport)
- Dark mode by default, with a Light mode toggle in Settings
- Local persistence (interests, calendar, theme) via `localStorage` — no login required
- Debounced (350ms) search over the live team/league catalog described above
- Loading skeletons, error states, and empty states throughout

Not yet implemented:
- Automatic background refresh / reschedule detection (the data model already supports
  it via `SportEvent.previousStartTime`, shown on the event detail page, but nothing
  currently re-polls and diffs events)
- Actual browser push notifications firing at the chosen reminder offset (permission
  request is wired up in Settings; the scheduling itself still needs a backend or a
  service worker, since a browser tab that isn't open can't fire a timed notification)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. This calls TheSportsDB's live API, so you'll need an
internet connection (see `MockSportsDataProvider` above for an offline option).

To type-check and build for production:

```bash
npm run build
```

## Hosting on your Proxmox homelab

No backend is required for the current data source, so this is just a static site behind
nginx in a Docker container — a `Dockerfile`, `nginx.conf` and `docker-compose.yml` are
already included.

**1. Get a Docker-capable LXC on Proxmox** (skip if you already have one)

From the Proxmox host shell:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/docker.sh)"
```

This creates a Debian LXC with Docker pre-installed and walks you through
CPU/RAM/storage/network settings interactively (defaults are fine for a static site —
1 vCPU / 512MB RAM is plenty). Note the container's IP address at the end.

**2. Get the project onto that LXC**

Either `git clone` your repo, or copy this folder over, e.g. from your machine:

```bash
scp -r sports-calendar root@<lxc-ip>:/opt/sports-calendar
```

**3. Build and run**

On the LXC:

```bash
cd /opt/sports-calendar
docker compose up -d --build
```

The site is now up at `http://<lxc-ip>:8091`. Change the host port in
`docker-compose.yml` if `8091` is already used by something else on your network.

**4. (Optional) Put a domain + HTTPS in front of it**

If you don't already run a reverse proxy, Nginx Proxy Manager is the easiest way to add
one on Proxmox:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/nginxproxymanager.sh)"
```

Then in its web UI, add a **Proxy Host** pointing at `<lxc-ip>:8091`, with your desired
domain and Let's Encrypt SSL enabled if you're exposing it beyond your LAN.

**Updating later:** after pulling new code, `docker compose up -d --build` again rebuilds
the image and replaces the running container — nothing else to restart.

> As with the earlier community-scripts commands: they run as root on your Proxmox host,
> so it's worth a quick read of the script before pasting it in, same as any other
> homelab helper script.

## Hosting on GitHub Pages

No backend is required for the current data source, so this ships as a static site.

1. Push this project to a GitHub repository.
2. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually from the **Actions** tab). The included
   `.github/workflows/deploy.yml` builds the app and deploys `dist/` automatically.
4. Your site appears at `https://<username>.github.io/<repo-name>/` (or your custom
   domain, if configured under Pages settings).

Two things are already set up for this to work out of the box:
- `vite.config.ts` uses a relative `base: './'`, so the built assets resolve correctly
  whether the site ends up at a domain root or a `/repo-name/` subpath.
- Routing uses `HashRouter` (`src/App.tsx`), so deep links like `#/dashboard` work on
  GitHub Pages' static hosting without any server-side rewrite rules — a plain
  `BrowserRouter` would 404 on refresh there.

## Project structure

```
src/
├── components/     # EventCard, skeletons, empty/error states
├── layouts/        # AppShell (nav header + mobile tab bar)
├── pages/          # one file per route
├── services/sports/ # SportsDataProvider interface, TheSportsDbProvider, MockSportsDataProvider
├── stores/         # React context stores (interests, calendar, theme) backed by localStorage
├── models/         # shared TypeScript types + the sports catalog
├── calendar/        # .ics generation + Google Calendar link builder
├── hooks/          # useLocalStorage
├── utils/          # date formatting helpers
└── styles/         # Tailwind entry + design tokens
```

## Connecting a different or paid API

1. Implement `SportsDataProvider` (`src/services/sports/SportsDataProvider.ts`) against
   the new API, e.g. `src/services/sports/RestSportsDataProvider.ts`.
2. If the API needs a *secret* key (unlike TheSportsDB's public free key), don't call it
   from the browser — stand up a small backend/serverless proxy that reads the key from
   its own environment (see `.env.example`) and forwards requests, and call that proxy
   from your provider instead.
3. Swap the one line in `src/services/sports/index.ts` to use the new provider. No page
   or component needs to change, since they only depend on the `SportsDataProvider` type.

## Design

Dark-first "scoreboard" look: Bricolage Grotesque for display type, IBM Plex Sans for body
text, IBM Plex Mono (tabular figures) for times and dates, one signal-orange accent used
sparingly for live status, selection and primary actions.
