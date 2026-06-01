// Academic-year unlock validity: 1st May -> 30th April cycle, exactly 1 year max.
export function computeValidity(from: Date = new Date()) {
  const year = from.getFullYear();
  const mayFirstThisYear = new Date(year, 4, 1); // May = month 4
  // If we're on/after May 1, the cycle ends April 30 next year; else April 30 this year.
  const endYear = from >= mayFirstThisYear ? year + 1 : year;
  const validUntil = new Date(endYear, 3, 30); // April 30
  return {
    validFrom: from.toISOString().slice(0, 10),
    validUntil: validUntil.toISOString().slice(0, 10),
  };
}

export function isUnlockValid(validUntil?: string | null): boolean {
  if (!validUntil) return true; // legacy unlocks (no expiry) stay valid
  return new Date(validUntil) >= new Date(new Date().toISOString().slice(0, 10));
}

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
