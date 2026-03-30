const PLUS_FEATURES = new Set([
  'custom_frames',
  'exclusive_badges',
  'aura_colors',
  'early_access',
  'priority_support',
]);

export function requiresPlus(feature: string): boolean {
  return PLUS_FEATURES.has(feature);
}
