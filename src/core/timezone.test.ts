/**
 * Simple test file to verify time zone calculations work correctly
 * Run with: node --loader ts-node/esm timezone.test.ts
 */

import { 
  calculateTimeZoneDifference, 
  determineAdjustmentDirection,
  getTimeDifferenceDescription 
} from './timezone.js';

// Test cases
console.log('Testing Time Zone Calculations\n');

// Test 1: New York to London (eastbound, ~5 hours ahead)
console.log('Test 1: New York → London (eastbound)');
const nyToLondon = calculateTimeZoneDifference('America/New_York', 'Europe/London');
console.log(`  Difference: ${nyToLondon} hours`);
console.log(`  Direction: ${determineAdjustmentDirection(nyToLondon)}`);
console.log(`  Description: ${getTimeDifferenceDescription(nyToLondon)}\n`);

// Test 2: London to New York (westbound, ~5 hours behind)
console.log('Test 2: London → New York (westbound)');
const londonToNy = calculateTimeZoneDifference('Europe/London', 'America/New_York');
console.log(`  Difference: ${londonToNy} hours`);
console.log(`  Direction: ${determineAdjustmentDirection(londonToNy)}`);
console.log(`  Description: ${getTimeDifferenceDescription(londonToNy)}\n`);

// Test 3: San Francisco to Tokyo (eastbound, ~17 hours ahead)
console.log('Test 3: San Francisco → Tokyo (eastbound)');
const sfToTokyo = calculateTimeZoneDifference('America/Los_Angeles', 'Asia/Tokyo');
console.log(`  Difference: ${sfToTokyo} hours`);
console.log(`  Direction: ${determineAdjustmentDirection(sfToTokyo)}`);
console.log(`  Description: ${getTimeDifferenceDescription(sfToTokyo)}\n`);

// Test 4: Same time zone
console.log('Test 4: Same time zone');
const same = calculateTimeZoneDifference('America/New_York', 'America/New_York');
console.log(`  Difference: ${same} hours`);
console.log(`  Direction: ${determineAdjustmentDirection(same)}`);
console.log(`  Description: ${getTimeDifferenceDescription(same)}\n`);

console.log('All tests completed!');

