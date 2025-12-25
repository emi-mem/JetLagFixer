/**
 * Plan Generator for Jet Lag Fixer
 * 
 * Generates personalized arrival-day sleep recommendations based on:
 * - Time zone difference
 * - Arrival time
 * - User's usual sleep schedule
 * - User preferences
 */

import { 
  calculateTimeZoneDifference, 
  determineAdjustmentDirection 
} from './timezone'

export interface UserInputs {
  homeTimeZone: string
  destinationTimeZone: string
  arrivalDateTime: Date // In destination local time
  usualBedtime: string // Format: "HH:mm" (24-hour, in home timezone)
  usualWakeTime: string // Format: "HH:mm" (24-hour, in home timezone)
  napsAllowed: boolean
  caffeineUse: boolean
}

export interface TimeWindow {
  start: string // Format: "HH:mm"
  end: string // Format: "HH:mm"
  description: string
}

export interface JetLagPlan {
  bedtime: string // Format: "HH:mm" (destination time)
  wakeTime: string // Format: "HH:mm" (destination time)
  napWindow: TimeWindow | null
  caffeineCutoff: string | null // Format: "HH:mm" (destination time)
  lightExposure: TimeWindow[]
  lightAvoidance: TimeWindow[]
  direction: 'advance' | 'delay'
  timeDifferenceHours: number
  fallbackRules: string[]
}

/**
 * Generate a personalized jet lag plan
 */
export function generatePlan(inputs: UserInputs): JetLagPlan {
  const { 
    homeTimeZone, 
    destinationTimeZone, 
    arrivalDateTime,
    usualBedtime,
    usualWakeTime,
    napsAllowed,
    caffeineUse
  } = inputs

  // Calculate time zone difference
  const timeDifferenceHours = calculateTimeZoneDifference(
    homeTimeZone,
    destinationTimeZone,
    arrivalDateTime
  )
  
  const direction = determineAdjustmentDirection(timeDifferenceHours)
  
  // Convert usual sleep times from home timezone to destination timezone
  const usualBedtimeDest = convertTimeToDestination(
    usualBedtime,
    homeTimeZone,
    destinationTimeZone,
    arrivalDateTime
  )
  
  const usualWakeTimeDest = convertTimeToDestination(
    usualWakeTime,
    homeTimeZone,
    destinationTimeZone,
    arrivalDateTime
  )
  
  // Generate recommendations based on direction and arrival time
  const arrivalHour = arrivalDateTime.getHours()
  const arrivalMinutes = arrivalDateTime.getMinutes()
  const arrivalTimeMinutes = arrivalHour * 60 + arrivalMinutes
  
  let bedtime: string
  let wakeTime: string
  let napWindow: TimeWindow | null = null
  let caffeineCutoff: string | null = null
  const lightExposure: TimeWindow[] = []
  const lightAvoidance: TimeWindow[] = []
  const fallbackRules: string[] = []
  
  if (direction === 'advance') {
    // Eastbound: Need to advance (wake up earlier)
    // Strategy: Go to bed earlier than usual, wake up earlier
    
    const { bedtime: recBedtime, wakeTime: recWakeTime } = 
      generateAdvancePlan(usualBedtimeDest, usualWakeTimeDest, arrivalTimeMinutes, timeDifferenceHours)
    
    bedtime = recBedtime
    wakeTime = recWakeTime
    
    // Light exposure: Morning light helps advance circadian rhythm
    if (arrivalTimeMinutes < 12 * 60) { // Arrived before noon
      lightExposure.push({
        start: '06:00',
        end: '10:00',
        description: 'Seek bright light (especially sunlight) to advance your clock'
      })
    } else {
      lightExposure.push({
        start: '07:00',
        end: '11:00',
        description: 'Seek bright light in the morning to advance your clock'
      })
    }
    
    // Light avoidance: Avoid evening light
    lightAvoidance.push({
      start: '18:00',
      end: '22:00',
      description: 'Avoid bright light in the evening to help advance your clock'
    })
    
    // Caffeine cutoff: Earlier than usual to help fall asleep earlier
    if (caffeineUse) {
      const cutoffHour = Math.max(12, parseInt(bedtime.split(':')[0]) - 8)
      caffeineCutoff = `${String(cutoffHour).padStart(2, '0')}:00`
    }
    
    // Nap strategy for eastbound
    if (napsAllowed && arrivalTimeMinutes < 14 * 60) {
      // If arriving before 2 PM, allow a short nap
      const napStart = addMinutes(arrivalTimeMinutes, 60) // 1 hour after arrival
      const napEnd = addMinutes(napStart, 20) // 20-minute nap
      napWindow = {
        start: formatTime(napStart),
        end: formatTime(napEnd),
        description: 'Short 20-minute nap to combat fatigue, but not too late'
      }
    }
    
    fallbackRules.push('If you can\'t sleep at the recommended time, try to at least rest in a dark room')
    fallbackRules.push('Even if you wake up early, try to stay in bed until the recommended wake time')
    
  } else {
    // Westbound: Need to delay (stay up later)
    // Strategy: Stay up later than usual, wake up later
    
    const { bedtime: recBedtime, wakeTime: recWakeTime } = 
      generateDelayPlan(usualBedtimeDest, usualWakeTimeDest, arrivalTimeMinutes, timeDifferenceHours)
    
    bedtime = recBedtime
    wakeTime = recWakeTime
    
    // Light exposure: Evening light helps delay circadian rhythm
    if (arrivalTimeMinutes > 12 * 60) { // Arrived after noon
      lightExposure.push({
        start: '16:00',
        end: '20:00',
        description: 'Seek bright light in the afternoon/evening to delay your clock'
      })
    } else {
      lightExposure.push({
        start: '14:00',
        end: '18:00',
        description: 'Seek bright light in the afternoon to delay your clock'
      })
    }
    
    // Light avoidance: Avoid morning light
    lightAvoidance.push({
      start: '06:00',
      end: '10:00',
      description: 'Avoid bright light in the morning to help delay your clock'
    })
    
    // Caffeine cutoff: Can be later than usual, but still reasonable
    if (caffeineUse) {
      const cutoffHour = Math.min(16, parseInt(bedtime.split(':')[0]) - 6)
      caffeineCutoff = `${String(cutoffHour).padStart(2, '0')}:00`
    }
    
    // Nap strategy for westbound
    if (napsAllowed && arrivalTimeMinutes < 16 * 60) {
      // If arriving before 4 PM, allow a short nap
      const napStart = addMinutes(arrivalTimeMinutes, 90) // 1.5 hours after arrival
      const napEnd = addMinutes(napStart, 30) // 30-minute nap
      napWindow = {
        start: formatTime(napStart),
        end: formatTime(napEnd),
        description: 'Short 30-minute nap to help you stay up later'
      }
    }
    
    fallbackRules.push('If you feel sleepy, try to stay active and get some light exposure')
    fallbackRules.push('Avoid napping too close to your recommended bedtime')
  }
  
  return {
    bedtime,
    wakeTime,
    napWindow,
    caffeineCutoff,
    lightExposure,
    lightAvoidance,
    direction,
    timeDifferenceHours,
    fallbackRules
  }
}

/**
 * Generate plan for eastbound travel (advance)
 */
function generateAdvancePlan(
  usualBedtimeDest: string,
  usualWakeTimeDest: string,
  arrivalTimeMinutes: number,
  timeDifferenceHours: number
): { bedtime: string; wakeTime: string } {
  const usualBedtimeMinutes = parseTime(usualBedtimeDest)
  const usualWakeTimeMinutes = parseTime(usualWakeTimeDest)
  
  // For eastbound, we want to advance by going to bed earlier
  // Adjust by about 1/3 to 1/2 of the time difference on first night
  const adjustmentHours = Math.min(Math.abs(timeDifferenceHours) * 0.4, 3)
  const adjustmentMinutes = Math.round(adjustmentHours * 60)
  
  let bedtimeMinutes = usualBedtimeMinutes - adjustmentMinutes
  let wakeTimeMinutes = usualWakeTimeMinutes - adjustmentMinutes
  
  // Ensure bedtime is reasonable (not before 8 PM or after 11 PM)
  const minBedtime = 20 * 60 // 8 PM
  const maxBedtime = 23 * 60 // 11 PM
  
  if (bedtimeMinutes < minBedtime) {
    bedtimeMinutes = minBedtime
    wakeTimeMinutes = bedtimeMinutes + (usualWakeTimeMinutes - usualBedtimeMinutes)
  } else if (bedtimeMinutes > maxBedtime) {
    bedtimeMinutes = maxBedtime
    wakeTimeMinutes = bedtimeMinutes + (usualWakeTimeMinutes - usualBedtimeMinutes)
  }
  
  // Ensure wake time is reasonable (not before 6 AM)
  const minWakeTime = 6 * 60 // 6 AM
  if (wakeTimeMinutes < minWakeTime) {
    wakeTimeMinutes = minWakeTime
  }
  
  // If arriving very late, adjust bedtime to be later
  if (arrivalTimeMinutes > 22 * 60) { // After 10 PM
    bedtimeMinutes = Math.min(arrivalTimeMinutes + 60, maxBedtime) // 1 hour after arrival
    wakeTimeMinutes = bedtimeMinutes + (usualWakeTimeMinutes - usualBedtimeMinutes)
  }
  
  return {
    bedtime: formatTime(bedtimeMinutes),
    wakeTime: formatTime(wakeTimeMinutes)
  }
}

/**
 * Generate plan for westbound travel (delay)
 */
function generateDelayPlan(
  usualBedtimeDest: string,
  usualWakeTimeDest: string,
  arrivalTimeMinutes: number,
  timeDifferenceHours: number
): { bedtime: string; wakeTime: string } {
  const usualBedtimeMinutes = parseTime(usualBedtimeDest)
  const usualWakeTimeMinutes = parseTime(usualWakeTimeDest)
  
  // For westbound, we want to delay by staying up later
  // Adjust by about 1/3 to 1/2 of the time difference on first night
  const adjustmentHours = Math.min(Math.abs(timeDifferenceHours) * 0.4, 3)
  const adjustmentMinutes = Math.round(adjustmentHours * 60)
  
  let bedtimeMinutes = usualBedtimeMinutes + adjustmentMinutes
  let wakeTimeMinutes = usualWakeTimeMinutes + adjustmentMinutes
  
  // Ensure bedtime is reasonable (not before 9 PM or after 1 AM)
  const minBedtime = 21 * 60 // 9 PM
  const maxBedtime = 25 * 60 // 1 AM (next day)
  
  if (bedtimeMinutes < minBedtime) {
    bedtimeMinutes = minBedtime
    wakeTimeMinutes = bedtimeMinutes + (usualWakeTimeMinutes - usualBedtimeMinutes)
  } else if (bedtimeMinutes > maxBedtime) {
    bedtimeMinutes = maxBedtime
    wakeTimeMinutes = bedtimeMinutes + (usualWakeTimeMinutes - usualBedtimeMinutes)
  }
  
  // Handle next-day wake time
  if (wakeTimeMinutes >= 24 * 60) {
    wakeTimeMinutes = wakeTimeMinutes - 24 * 60
  }
  
  // If arriving very early, adjust bedtime to be earlier
  if (arrivalTimeMinutes < 8 * 60) { // Before 8 AM
    bedtimeMinutes = Math.max(21 * 60, arrivalTimeMinutes + 14 * 60) // 14 hours after arrival, but not before 9 PM
    wakeTimeMinutes = bedtimeMinutes + (usualWakeTimeMinutes - usualBedtimeMinutes)
    if (wakeTimeMinutes >= 24 * 60) {
      wakeTimeMinutes = wakeTimeMinutes - 24 * 60
    }
  }
  
  return {
    bedtime: formatTime(bedtimeMinutes),
    wakeTime: formatTime(wakeTimeMinutes)
  }
}

/**
 * Convert a time from home timezone to destination timezone
 * This tells us what time it is in destination when it's the given time in home
 */
function convertTimeToDestination(
  time: string, // Format: "HH:mm" (in home timezone)
  homeTimeZone: string,
  destinationTimeZone: string,
  referenceDate: Date
): string {
  // Parse the time
  const [hours, minutes] = time.split(':').map(Number)
  
  // Calculate time difference
  const timeDiff = calculateTimeZoneDifference(homeTimeZone, destinationTimeZone, referenceDate)
  
  // Add the time difference to get destination time
  let destTotalMinutes = hours * 60 + minutes + (timeDiff * 60)
  
  // Handle wraparound
  if (destTotalMinutes < 0) {
    destTotalMinutes += 24 * 60
  } else if (destTotalMinutes >= 24 * 60) {
    destTotalMinutes -= 24 * 60
  }
  
  const destHours = Math.floor(destTotalMinutes / 60)
  const destMins = destTotalMinutes % 60
  
  return `${String(destHours).padStart(2, '0')}:${String(destMins).padStart(2, '0')}`
}

/**
 * Parse time string "HH:mm" to minutes since midnight
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Format minutes since midnight to "HH:mm"
 */
function formatTime(minutes: number): string {
  const totalMinutes = minutes % (24 * 60)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

/**
 * Add minutes to a time (in minutes since midnight)
 */
function addMinutes(timeMinutes: number, minutesToAdd: number): number {
  return (timeMinutes + minutesToAdd) % (24 * 60)
}

