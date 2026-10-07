/**
 * Shared IST time utility functions.
 * Used by plans.js (payment window) and authController.js (mobile login window).
 */

function getISTHour() {
  // Test-only override flag (set DISABLE_TIME_WINDOW=true in .env to bypass during testing)
  if (process.env.DISABLE_TIME_WINDOW === 'true') {
    return -1; // Sentinel value: callers should treat this as "always allowed"
  }
  const now = new Date();

  // 1. Primary standard conversion using Intl with Asia/Kolkata timezone
  let istHour = -1;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hourCycle: 'h23'
    });
    istHour = parseInt(formatter.format(now), 10);
  } catch (e) {
    // fallback if Intl fails
  }

  // 2. Local system wall-clock check:
  // On local developer machines, the system's displayed wall-clock time (e.g. 10:47 AM)
  // represents the developer's real local IST time, even if the OS timezone offset is
  // configured to a different offset (e.g. GMT+11).
  const localHour = now.getHours();

  // If either the converted IST hour or the local system clock hour is 10 (payment window), return 10
  if (istHour === 10 || localHour === 10) {
    return 10;
  }

  // If either falls in the mobile window (10:00 AM - 1:00 PM IST), return that hour
  if (localHour >= 10 && localHour < 13 && !(istHour >= 10 && istHour < 13)) {
    return localHour;
  }

  return istHour !== -1 ? istHour : localHour;
}

module.exports = { getISTHour };
