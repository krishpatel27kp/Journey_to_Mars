/**
 * Light-speed delay calculator for Earth-Mars communication.
 */

const SPEED_OF_LIGHT_KM_S = 299792.458;
const EARTH_MARS_DISTANCE_KM = 225000000;

/**
 * Calculates signal travel time between Earth and Mars.
 * @param {number} distanceKm - Distance in km (default: 225M km)
 * @returns {{ totalSeconds: number, minutes: number, seconds: number, formatted: string }}
 */
export function calculateSignalDelay(distanceKm = EARTH_MARS_DISTANCE_KM) {
  const totalSeconds = distanceKm / SPEED_OF_LIGHT_KM_S;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return {
    totalSeconds,
    minutes,
    seconds,
    formatted: `${minutes} min ${seconds} sec`,
  };
}

/**
 * Formats a large number with comma separators.
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}
