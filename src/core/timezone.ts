/**
 * Core time zone calculation utilities for Jet Lag Fixer
 * 
 * This module handles:
 * - Calculating time zone differences
 * - Determining advance/delay direction (eastbound/westbound)
 */

export interface TimeZoneInfo {
  timeZone: string;
  offsetHours: number; // UTC offset in hours
}

/**
 * Calculate the time difference between two time zones in hours
 * @param homeTimeZone - IANA time zone string (e.g., "America/New_York")
 * @param destinationTimeZone - IANA time zone string (e.g., "Europe/London")
 * @param date - Date to calculate offset for (to handle DST)
 * @returns Time difference in hours (positive = destination ahead, negative = destination behind)
 */
export function calculateTimeZoneDifference(
  homeTimeZone: string,
  destinationTimeZone: string,
  date: Date = new Date()
): number {
  // Get UTC offsets for both time zones at the given date
  const homeOffset = getUTCOffset(homeTimeZone, date);
  const destinationOffset = getUTCOffset(destinationTimeZone, date);
  
  // Difference = destination offset - home offset
  // Positive means destination is ahead, negative means behind
  return destinationOffset - homeOffset;
}

/**
 * Get UTC offset in hours for a time zone at a specific date
 * @param timeZone - IANA time zone string
 * @param date - Date to check (important for DST)
 * @returns UTC offset in hours
 */
function getUTCOffset(timeZone: string, date: Date): number {
  // Simple and reliable method:
  // Format the same UTC timestamp in both UTC and the target timezone,
  // then calculate the difference in displayed time
  
  const utcTimestamp = date.getTime();
  
  // Get UTC time components
  const utcDate = new Date(utcTimestamp);
  const utcTime = utcDate.getUTCHours() * 60 + utcDate.getUTCMinutes();
  
  // Get timezone time components for the same UTC moment
  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const tzParts = tzFormatter.formatToParts(utcTimestamp);
  const tzHour = parseInt(tzParts.find((p: Intl.DateTimeFormatPart) => p.type === 'hour')?.value || '0', 10);
  const tzMinute = parseInt(tzParts.find((p: Intl.DateTimeFormatPart) => p.type === 'minute')?.value || '0', 10);
  const tzTime = tzHour * 60 + tzMinute;
  
  // Calculate difference in minutes
  let diffMinutes = tzTime - utcTime;
  
  // Handle day wraparound (timezone might be on different day)
  // Check if the day is different
  const utcDay = utcDate.getUTCDate();
  const tzDayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    day: 'numeric'
  });
  const tzDay = parseInt(tzDayFormatter.format(utcTimestamp), 10);
  
  if (tzDay > utcDay) {
    // Timezone is ahead by a day
    diffMinutes += 24 * 60;
  } else if (tzDay < utcDay) {
    // Timezone is behind by a day
    diffMinutes -= 24 * 60;
  }
  
  // Normalize to -12 to +12 hour range
  let offsetHours = diffMinutes / 60;
  if (offsetHours > 12) offsetHours -= 24;
  if (offsetHours < -12) offsetHours += 24;
  
  return offsetHours;
}

/**
 * Determine if the user needs to advance or delay their body clock
 * @param timeDifferenceHours - Time difference in hours (from calculateTimeZoneDifference)
 * @returns 'advance' if eastbound (need to wake up earlier), 'delay' if westbound (need to sleep later)
 */
export function determineAdjustmentDirection(timeDifferenceHours: number): 'advance' | 'delay' {
  // Positive difference = destination is ahead = eastbound = need to advance
  // Negative difference = destination is behind = westbound = need to delay
  return timeDifferenceHours > 0 ? 'advance' : 'delay';
}

/**
 * Get a human-readable description of the time zone difference
 * @param timeDifferenceHours - Time difference in hours
 * @returns Description string
 */
export function getTimeDifferenceDescription(timeDifferenceHours: number): string {
  const absHours = Math.abs(timeDifferenceHours);
  const hours = Math.floor(absHours);
  const minutes = Math.round((absHours - hours) * 60);
  
  const direction = timeDifferenceHours > 0 ? 'ahead' : 'behind';
  
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${direction}`;
  }
  return `${hours}h ${minutes}m ${direction}`;
}

