import type { SportEvent } from '../models/types';

function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function estimateEndTime(startIso: string): string {
  const end = new Date(startIso);
  end.setHours(end.getHours() + 2);
  return end.toISOString();
}

function escapeIcsText(text: string): string {
  return text.replace(/[,;]/g, (m) => `\\${m}`);
}

export function buildIcs(events: SportEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Personal Sports Calendar//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@personal-sports-calendar`,
      `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
      `DTSTART:${toIcsDate(event.startTime)}`,
      `DTEND:${toIcsDate(estimateEndTime(event.startTime))}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(event.competition)}`,
      ...(event.venue ? [`LOCATION:${escapeIcsText(event.venue)}`] : []),
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(events: SportEvent[], filename = 'sports-calendar.ics') {
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function googleCalendarLink(event: SportEvent): string {
  const start = toIcsDate(event.startTime);
  const end = toIcsDate(estimateEndTime(event.startTime));
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.competition,
    location: event.venue ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
