import type { Sport } from './types';

export const SPORTS: Sport[] = [
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'motorsport', label: 'Motorsport', icon: '🏎️' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'ice_hockey', label: 'Ice Hockey', icon: '🏒' },
  { id: 'american_football', label: 'American Football', icon: '🏈' },
  { id: 'handball', label: 'Handball', icon: '🤾' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
  { id: 'baseball', label: 'Baseball', icon: '⚾' },
  { id: 'rugby', label: 'Rugby', icon: '🏉' },
  { id: 'golf', label: 'Golf', icon: '⛳' },
  { id: 'boxing', label: 'Boxing', icon: '🥊' },
  { id: 'mma', label: 'MMA', icon: '🥋' },
  { id: 'athletics', label: 'Athletics', icon: '🏃' },
  { id: 'winter_sports', label: 'Winter Sports', icon: '🎿' },
];

export function sportById(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}
