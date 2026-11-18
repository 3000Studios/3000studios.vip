/**
 * Shared tilt state for the live header/footer bands and the page aura.
 * x/y run from -1 to 1. EmpireFX writes it from DeviceOrientation (phones)
 * or the pointer position (desktop); LiveBand reads it every frame.
 */
export const tilt = { x: 0, y: 0, source: 'none' as 'none' | 'device' | 'pointer' };
