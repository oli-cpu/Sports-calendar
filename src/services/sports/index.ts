import { MockSportsDataProvider } from './MockSportsDataProvider';
import { TheSportsDbProvider } from './TheSportsDbProvider';
import type { SportsDataProvider } from './SportsDataProvider';

// Phase 2: live data from TheSportsDB's free tier (see README > "Sports
// data source" for what's real vs. seeded, and its known gaps). No secret
// key is involved - the free "123" key is public by design - so this talks
// to the API directly from the browser with no backend proxy needed.
//
// MockSportsDataProvider is kept as a fallback for fully offline dev/demo;
// switch the line below if you ever need it again. Nothing else in the app
// depends on which one is active, since both implement SportsDataProvider.
export const sportsDataProvider: SportsDataProvider = new TheSportsDbProvider();

export { MockSportsDataProvider, TheSportsDbProvider };
export type { SportsDataProvider };
