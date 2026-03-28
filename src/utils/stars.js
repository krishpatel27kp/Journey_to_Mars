/**
 * Star Utils — Shared procedural starfield generation.
 * Used for background depth across all mission sections.
 */
import * as THREE from 'three';

/**
 * Generates a Float32Array of star positions within a spherical bounds.
 * @param {number} count Number of stars.
 * @param {number} radius Spherical radius.
 * @returns {Float32Array}
 */
export function generateStarPositions(count = 1500, radius = 100) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.8 + Math.random() * 0.2); // Keep stars in a shell-like layer
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

/**
 * Generates a Float32Array of random sizes for twinkly points.
 * @param {number} count 
 */
export function generateStarSizes(count) {
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    sizes[i] = Math.random();
  }
  return sizes;
}
