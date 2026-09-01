import type { Athlete, EventQuery, League, Season, SportEvent, SportId, Team } from '../../models/types';

/**
 * Every sports-data backend the app can use must implement this contract.
 * The UI never talks to a concrete API directly - only to this interface -
 * so the underlying provider (mock data now, a real sports API later,
 * behind our own backend proxy) can be swapped without touching pages
 * or components. See /src/services/sports/index.ts for provider selection.
 */
export interface SportsDataProvider {
  searchTeams(query: string, sportId?: SportId): Promise<Team[]>;
  searchLeagues(query: string, sportId?: SportId): Promise<League[]>;
  searchAthletes(query: string, sportId?: SportId): Promise<Athlete[]>;
  getSeasons(sportId: SportId): Promise<Season[]>;
  getEvents(params: EventQuery): Promise<SportEvent[]>;
}
