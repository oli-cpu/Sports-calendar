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

// --- Seed catalog -----------------------------------------------------
// This stands in for a real sports API in Phase 1 (see project spec §20/32).
// Swap MockSportsDataProvider for a real implementation in services/sports/index.ts
// once a backend proxy exists - the UI does not need to change.

const TEAMS: Team[] = [
  { id: 't-real-madrid', name: 'Real Madrid', sportId: 'football' },
  { id: 't-real-sociedad', name: 'Real Sociedad', sportId: 'football' },
  { id: 't-real-betis', name: 'Real Betis', sportId: 'football' },
  { id: 't-barcelona', name: 'FC Barcelona', sportId: 'football' },
  { id: 't-man-city', name: 'Manchester City', sportId: 'football' },
  { id: 't-bayern', name: 'Bayern München', sportId: 'football' },
  { id: 't-valencia', name: 'Valencia CF', sportId: 'football' },
  { id: 't-lakers', name: 'LA Lakers', sportId: 'basketball' },
  { id: 't-celtics', name: 'Boston Celtics', sportId: 'basketball' },
  { id: 't-bruins', name: 'Boston Bruins', sportId: 'ice_hockey' },
  { id: 't-chiefs', name: 'Kansas City Chiefs', sportId: 'american_football' },
];

const LEAGUES: League[] = [
  { id: 'l-la-liga', name: 'La Liga', sportId: 'football' },
  { id: 'l-premier-league', name: 'Premier League', sportId: 'football' },
  { id: 'l-champions-league', name: 'Champions League', sportId: 'football' },
  { id: 'l-nba', name: 'NBA', sportId: 'basketball' },
  { id: 'l-euroleague', name: 'EuroLeague', sportId: 'basketball' },
  { id: 'l-formula-1', name: 'Formula 1', sportId: 'motorsport' },
  { id: 'l-motogp', name: 'MotoGP', sportId: 'motorsport' },
  { id: 'l-atp', name: 'ATP Tour', sportId: 'tennis' },
  { id: 'l-wta', name: 'WTA Tour', sportId: 'tennis' },
  { id: 'l-wimbledon', name: 'Wimbledon', sportId: 'tennis' },
  { id: 'l-us-open-tennis', name: 'US Open', sportId: 'tennis' },
];

const ATHLETES: Athlete[] = [
  { id: 'a-alcaraz', name: 'Carlos Alcaraz', sportId: 'tennis' },
  { id: 'a-sabalenka', name: 'Aryna Sabalenka', sportId: 'tennis' },
  { id: 'a-verstappen', name: 'Max Verstappen', sportId: 'motorsport' },
  { id: 'a-norris', name: 'Lando Norris', sportId: 'motorsport' },
];

function daysFromNow(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

// Event templates reference the catalog above by id so search results
// and generated events stay consistent with each other.
function buildEvents(): SportEvent[] {
  return [
    {
      id: 'e-rm-valencia',
      sportId: 'football',
      competition: 'La Liga',
      title: 'Real Madrid vs Valencia',
      home: 'Real Madrid',
      away: 'Valencia',
      startTime: daysFromNow(0, 21, 0),
      venue: 'Santiago Bernabéu',
      status: 'scheduled',
      relatedInterestIds: ['t-real-madrid', 'l-la-liga', 't-valencia'],
    },
    {
      id: 'e-athletic-rm',
      sportId: 'football',
      competition: 'La Liga',
      title: 'Athletic Bilbao vs Real Madrid',
      home: 'Athletic Bilbao',
      away: 'Real Madrid',
      startTime: daysFromNow(6, 20, 0),
      venue: 'San Mamés',
      status: 'scheduled',
      relatedInterestIds: ['t-real-madrid', 'l-la-liga'],
    },
    {
      id: 'e-rm-barca',
      sportId: 'football',
      competition: 'La Liga',
      title: 'Real Madrid vs FC Barcelona',
      home: 'Real Madrid',
      away: 'FC Barcelona',
      startTime: daysFromNow(20, 21, 0),
      venue: 'Santiago Bernabéu',
      status: 'scheduled',
      relatedInterestIds: ['t-real-madrid', 't-barcelona', 'l-la-liga'],
    },
    {
      id: 'e-italian-gp',
      sportId: 'motorsport',
      competition: 'Formula 1',
      title: 'Italian Grand Prix',
      startTime: daysFromNow(6, 15, 0),
      venue: 'Monza',
      status: 'scheduled',
      relatedInterestIds: ['l-formula-1'],
    },
    {
      id: 'e-singapore-gp',
      sportId: 'motorsport',
      competition: 'Formula 1',
      title: 'Singapore Grand Prix',
      startTime: daysFromNow(27, 14, 0),
      venue: 'Marina Bay',
      status: 'scheduled',
      relatedInterestIds: ['l-formula-1'],
    },
    {
      id: 'e-us-open-final',
      sportId: 'tennis',
      competition: 'US Open',
      title: 'US Open Final',
      startTime: daysFromNow(1, 18, 0),
      venue: 'Arthur Ashe Stadium',
      status: 'scheduled',
      relatedInterestIds: ['l-us-open-tennis'],
    },
    {
      id: 'e-nba-lakers-celtics',
      sportId: 'basketball',
      competition: 'NBA',
      title: 'LA Lakers vs Boston Celtics',
      home: 'LA Lakers',
      away: 'Boston Celtics',
      startTime: daysFromNow(3, 22, 30),
      venue: 'Crypto.com Arena',
      status: 'scheduled',
      relatedInterestIds: ['t-lakers', 't-celtics', 'l-nba'],
    },
  ];
}

function matchesQuery(name: string, query: string): boolean {
  return name.toLowerCase().includes(query.trim().toLowerCase());
}

const NETWORK_DELAY_MS = 260;
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY_MS));
}

export class MockSportsDataProvider implements SportsDataProvider {
  async searchTeams(query: string, sportId?: SportId): Promise<Team[]> {
    if (!query.trim()) return delay([]);
    return delay(
      TEAMS.filter((t) => matchesQuery(t.name, query) && (!sportId || t.sportId === sportId)).slice(0, 8),
    );
  }

  async searchLeagues(query: string, sportId?: SportId): Promise<League[]> {
    if (!query.trim()) return delay([]);
    return delay(
      LEAGUES.filter((l) => matchesQuery(l.name, query) && (!sportId || l.sportId === sportId)).slice(0, 8),
    );
  }

  async searchAthletes(query: string, sportId?: SportId): Promise<Athlete[]> {
    if (!query.trim()) return delay([]);
    return delay(
      ATHLETES.filter((a) => matchesQuery(a.name, query) && (!sportId || a.sportId === sportId)).slice(0, 8),
    );
  }

  async getSeasons(sportId: SportId): Promise<Season[]> {
    const year = new Date().getFullYear();
    const label = (offset: number) => `${year - offset}/${String(year - offset + 1).slice(2)}`;
    return delay([
      { id: `${sportId}-${label(0)}`, label: label(0), sportId, isCurrent: true },
      { id: `${sportId}-${label(1)}`, label: label(1), sportId, isCurrent: false },
      { id: `${sportId}-${label(2)}`, label: label(2), sportId, isCurrent: false },
    ]);
  }

  async getEvents(params: EventQuery): Promise<SportEvent[]> {
    const interestIds = new Set(params.interests.map((i) => i.id));
    const all = buildEvents();
    const filtered =
      interestIds.size === 0
        ? all
        : all.filter((e) => e.relatedInterestIds.some((id) => interestIds.has(id)));
    const sorted = filtered.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    return delay(sorted);
  }
}
