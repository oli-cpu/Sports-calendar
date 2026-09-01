export type SportId =
  | 'football'
  | 'basketball'
  | 'motorsport'
  | 'tennis'
  | 'ice_hockey'
  | 'american_football'
  | 'handball'
  | 'volleyball'
  | 'baseball'
  | 'rugby'
  | 'golf'
  | 'boxing'
  | 'mma'
  | 'athletics'
  | 'winter_sports';

export interface Sport {
  id: SportId;
  label: string;
  icon: string; // emoji glyph, kept swappable for a future icon set
}

export type InterestType = 'team' | 'league' | 'athlete' | 'competition';

export interface Interest {
  id: string;
  type: InterestType;
  name: string;
  sportId: SportId;
}

export interface Team {
  id: string;
  name: string;
  sportId: SportId;
}

export interface League {
  id: string;
  name: string;
  sportId: SportId;
}

export interface Athlete {
  id: string;
  name: string;
  sportId: SportId;
}

export interface Season {
  id: string;
  label: string;
  sportId: SportId;
  isCurrent: boolean;
}

export type EventStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface SportEvent {
  id: string;
  sportId: SportId;
  competition: string;
  title: string; // e.g. "Real Madrid vs Valencia" or "Italian Grand Prix"
  home?: string;
  away?: string;
  startTime: string; // ISO 8601
  venue?: string;
  status: EventStatus;
  relatedInterestIds: string[];
  /** set when a background refresh detects the schedule changed (spec §19) */
  previousStartTime?: string;
}

export interface EventQuery {
  interests: Interest[];
  from?: string;
  to?: string;
}

export type ReminderOffset = 'none' | '15m' | '30m' | '1h' | '3h' | '1d';

export interface CalendarEntry {
  eventId: string;
  addedAt: string;
  reminder: ReminderOffset;
}
