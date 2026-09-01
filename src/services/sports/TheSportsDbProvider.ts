import type {
  Athlete,
  EventQuery,
  League,
  Season,
  SportEvent,
  SportId,
  Team,
} from '../../models/types';
import type { SportsDataProvider } from './SportsDataProvider';

// --- TheSportsDB (free tier) -------------------------------------------
//
// Why this doesn't just call searchteams.php / searchplayers.php:
// on the shared free API key those two endpoints are hard-limited by
// TheSportsDB to always return their own "Arsenal" demo result, no matter
// what you query (documented in their API guide, confirmed on their forum).
// So instead we use the *unrestricted* list endpoints - all leagues, then
// all teams in a league - fetch them once, cache in memory, and do the
// "search" ourselves over that real, live-fetched catalog. Events and
// seasons are read straight from the API; nothing here is mock data.
//
// Free-tier limitation that's real and worth knowing: athlete/player search
// is similarly restricted, and TheSportsDB's individual-athlete coverage
// (tennis, boxing, MMA, athletics) is thin even on paid tiers. Athlete
// interests below use a small static seed list rather than pretending to
// search live data that doesn't reliably exist on this API.

const API_KEY = '123';
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// Map our sport ids to TheSportsDB's own strSport values.
const SPORT_TO_STRSPORT: Partial<Record<SportId, string>> = {
  football: 'Soccer',
  basketball: 'Basketball',
  motorsport: 'Motorsport',
  ice_hockey: 'Ice Hockey',
  american_football: 'American Football',
  handball: 'Handball',
  volleyball: 'Volleyball',
  baseball: 'Baseball',
  rugby: 'Rugby',
  golf: 'Golf',
};

// A handful of well-known leagues we seed each team-based sport's catalog
// with, so search has something real to filter over without needing the
// broken keyword-search endpoint. Matched against all_leagues.php by
// substring, so exact TheSportsDB league id numbering never has to be
// hardcoded or guessed.
const SEED_LEAGUE_NAMES: Partial<Record<SportId, string[]>> = {
  football: [
    'English Premier League',
    'Spanish La Liga',
    'German Bundesliga',
    'Italian Serie A',
    'UEFA Champions League',
  ],
  basketball: ['NBA', 'Euroleague'],
  motorsport: ['Formula 1', 'MotoGP'],
  ice_hockey: ['NHL'],
  american_football: ['NFL'],
  rugby: ['Rugby Union'],
};

// Sports TheSportsDB's free tier does not cover well as searchable teams
// (individual-athlete sports, or sports it barely indexes). These fall
// back to a tiny static seed list instead of a live API call.
const STATIC_ATHLETES: Athlete[] = [
  { id: 'a-alcaraz', name: 'Carlos Alcaraz', sportId: 'tennis' },
  { id: 'a-sabalenka', name: 'Aryna Sabalenka', sportId: 'tennis' },
  { id: 'a-djokovic', name: 'Novak Djokovic', sportId: 'tennis' },
];
const STATIC_LEAGUES_FALLBACK: Partial<Record<SportId, League[]>> = {
  tennis: [
    { id: 'l-atp', name: 'ATP Tour', sportId: 'tennis' },
    { id: 'l-wta', name: 'WTA Tour', sportId: 'tennis' },
    { id: 'l-wimbledon', name: 'Wimbledon', sportId: 'tennis' },
    { id: 'l-us-open-tennis', name: 'US Open', sportId: 'tennis' },
  ],
};

interface TsdbLeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
}
interface TsdbTeam {
  idTeam: string;
  strTeam: string;
  strLeague: string;
  strSport: string;
  strStadium?: string;
}
interface TsdbEvent {
  idEvent: string;
  strEvent: string;
  strLeague: string;
  strSport: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  dateEvent: string; // "2026-09-06"
  strTime?: string; // "15:00:00" UTC
  strVenue?: string;
  strStatus?: string;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`TheSportsDB request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function toIso(dateEvent: string, strTime?: string): string {
  const time = strTime && strTime.length > 0 ? strTime : '00:00:00';
  return new Date(`${dateEvent}T${time}Z`).toISOString();
}

function mapEvent(e: TsdbEvent, sportId: SportId, interestIds: string[]): SportEvent {
  return {
    id: e.idEvent,
    sportId,
    competition: e.strLeague,
    title: e.strHomeTeam && e.strAwayTeam ? `${e.strHomeTeam} vs ${e.strAwayTeam}` : e.strEvent,
    home: e.strHomeTeam,
    away: e.strAwayTeam,
    startTime: toIso(e.dateEvent, e.strTime),
    venue: e.strVenue,
    status: e.strStatus === 'Match Finished' ? 'finished' : 'scheduled',
    relatedInterestIds: interestIds,
  };
}

export class TheSportsDbProvider implements SportsDataProvider {
  private leaguesCache: Promise<TsdbLeague[]> | null = null;
  private teamCatalogCache = new Map<SportId, Promise<Team[]>>();

  private async allLeagues(): Promise<TsdbLeague[]> {
    if (!this.leaguesCache) {
      this.leaguesCache = getJson<{ leagues: TsdbLeague[] | null }>('all_leagues.php').then(
        (r) => r.leagues ?? [],
      );
    }
    return this.leaguesCache;
  }

  private async seedLeaguesFor(sportId: SportId): Promise<TsdbLeague[]> {
    const names = SEED_LEAGUE_NAMES[sportId];
    if (!names) return [];
    const strSport = SPORT_TO_STRSPORT[sportId];
    const all = await this.allLeagues();
    return all.filter(
      (l) => l.strSport === strSport && names.some((n) => l.strLeague.toLowerCase().includes(n.toLowerCase())),
    );
  }

  /** Builds (and caches) a real team catalog for a sport from its seed leagues. */
  private async teamCatalogFor(sportId: SportId): Promise<Team[]> {
    if (!this.teamCatalogCache.has(sportId)) {
      const promise = (async () => {
        const seeds = await this.seedLeaguesFor(sportId);
        const rosters = await Promise.all(
          seeds.map((l) => {
            // Free tier's documented "list teams" endpoint takes the league
            // name (spaces as underscores), not the numeric id, and is
            // capped at 10 teams - fine for a search seed catalog.
            const leagueParam = encodeURIComponent(l.strLeague.replace(/ /g, '_'));
            return getJson<{ teams: TsdbTeam[] | null }>(
              `search_all_teams.php?l=${leagueParam}`,
            ).then((r) => r.teams ?? []);
          }),
        );
        const seen = new Set<string>();
        const teams: Team[] = [];
        for (const roster of rosters) {
          for (const t of roster) {
            if (seen.has(t.idTeam)) continue;
            seen.add(t.idTeam);
            teams.push({ id: t.idTeam, name: t.strTeam, sportId });
          }
        }
        return teams;
      })();
      this.teamCatalogCache.set(sportId, promise);
    }
    return this.teamCatalogCache.get(sportId)!;
  }

  async searchTeams(query: string, sportId?: SportId): Promise<Team[]> {
    if (!query.trim() || !sportId) return [];
    const catalog = await this.teamCatalogFor(sportId);
    const q = query.trim().toLowerCase();
    return catalog.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 10);
  }

  async searchLeagues(query: string, sportId?: SportId): Promise<League[]> {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();

    if (sportId && STATIC_LEAGUES_FALLBACK[sportId]) {
      return STATIC_LEAGUES_FALLBACK[sportId]!.filter((l) => l.name.toLowerCase().includes(q));
    }

    const strSport = sportId ? SPORT_TO_STRSPORT[sportId] : undefined;
    const all = await this.allLeagues();
    return all
      .filter((l) => (!strSport || l.strSport === strSport) && l.strLeague.toLowerCase().includes(q))
      .slice(0, 10)
      .map((l) => ({ id: l.idLeague, name: l.strLeague, sportId: sportId ?? 'football' }));
  }

  async searchAthletes(query: string, sportId?: SportId): Promise<Athlete[]> {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return STATIC_ATHLETES.filter(
      (a) => a.name.toLowerCase().includes(q) && (!sportId || a.sportId === sportId),
    );
  }

  async getSeasons(sportId: SportId): Promise<Season[]> {
    const seeds = await this.seedLeaguesFor(sportId);
    if (seeds.length === 0) {
      // Fall back to a date-derived label so the UI still has something sane.
      const year = new Date().getFullYear();
      const label = (offset: number) => `${year - offset}/${String(year - offset + 1).slice(2)}`;
      return [
        { id: `${sportId}-${label(0)}`, label: label(0), sportId, isCurrent: true },
        { id: `${sportId}-${label(1)}`, label: label(1), sportId, isCurrent: false },
      ];
    }
    const seasons = await getJson<{ seasons: { strSeason: string }[] | null }>(
      `search_all_seasons.php?id=${seeds[0].idLeague}`,
    );
    const list = (seasons.seasons ?? []).map((s) => s.strSeason).filter(Boolean);
    return list.slice(-4).reverse().map((label, i) => ({
      id: `${sportId}-${label}`,
      label,
      sportId,
      isCurrent: i === 0,
    }));
  }

  async getEvents(params: EventQuery): Promise<SportEvent[]> {
    if (params.interests.length === 0) return [];

    const results = await Promise.all(
      params.interests.map(async (interest) => {
        if (interest.type === 'athlete') return []; // no reliable free-tier schedule endpoint per athlete
        try {
          const path =
            interest.type === 'league'
              ? `eventsnextleague.php?id=${interest.id}`
              : `eventsnext.php?id=${interest.id}`;
          const data = await getJson<{ events: TsdbEvent[] | null }>(path);
          return (data.events ?? []).map((e) => mapEvent(e, interest.sportId, [interest.id]));
        } catch {
          return [];
        }
      }),
    );

    const merged = new Map<string, SportEvent>();
    for (const event of results.flat()) {
      const existing = merged.get(event.id);
      if (existing) {
        existing.relatedInterestIds = Array.from(
          new Set([...existing.relatedInterestIds, ...event.relatedInterestIds]),
        );
      } else {
        merged.set(event.id, event);
      }
    }

    return Array.from(merged.values()).sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }
}
