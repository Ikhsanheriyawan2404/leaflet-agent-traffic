export const EARTH_RADIUS = 6371000;
export const MAX_STEP_EDGE = 100;
export const ALLOWED_HIGHWAYS = new Set([
  'motorway',
  'motorway_link',
  'trunk',
  'trunk_link',
  'primary',
  'primary_link'
])
export const SPEED_KMH = Object.freeze({
  SLOW: 20,
  MEDIUM: 40,
  FAST: 70,
  VERY_FAST: 100
});
