/**
 * Mars weather simulation — generates randomised weather data with realistic variation.
 */

const BASE_TEMPERATURE = -63;
const BASE_WIND_SPEED = 7.2;
const BASE_DUST_PROBABILITY = 15;
const VARIATION_PERCENT = 0.2;

/**
 * Generates a random Mars weather reading with ±20% variation.
 * @returns {{ temperature: number, windSpeed: number, dustProbability: number, pressure: number }}
 */
export function generateWeatherReading() {
  const vary = (base) => {
    const variation = base * VARIATION_PERCENT;
    return base + (Math.random() * 2 - 1) * variation;
  };

  return {
    temperature: Math.round(vary(BASE_TEMPERATURE)),
    windSpeed: parseFloat(vary(BASE_WIND_SPEED).toFixed(1)),
    dustProbability: Math.min(100, Math.max(0, Math.round(vary(BASE_DUST_PROBABILITY)))),
    pressure: parseFloat((vary(636) / 100).toFixed(2)),
  };
}

/**
 * Formats temperature for display.
 * @param {number} temp
 * @returns {string}
 */
export function formatTemperature(temp) {
  return `${temp}°C`;
}

/**
 * Formats wind speed for display.
 * @param {number} speed - m/s
 * @returns {string}
 */
export function formatWindSpeed(speed) {
  return `${speed} m/s`;
}
