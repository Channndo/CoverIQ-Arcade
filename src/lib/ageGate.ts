/** Client-side age verification. Stores only a verified flag + timestamp — never raw DOB. */

export const AGE_GATE_STORAGE_PREFIX = 'square1-arcade:age-verified:';

export interface AgeGateRecord {
  verified: true;
  verifiedAt: number;
}

function storageKey(slug: string): string {
  return `${AGE_GATE_STORAGE_PREFIX}${slug}`;
}

export function isAgeVerified(slug: string): boolean {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return false;
    const data = JSON.parse(raw) as Partial<AgeGateRecord>;
    return data.verified === true;
  } catch {
    return false;
  }
}

export function setAgeVerified(slug: string): void {
  const record: AgeGateRecord = { verified: true, verifiedAt: Date.now() };
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(record));
  } catch {
    // Private mode / quota — verification still applies for this session.
  }
}

export function clearAgeVerified(slug: string): void {
  try {
    localStorage.removeItem(storageKey(slug));
  } catch {
    // ignore
  }
}

export function isValidCalendarDate(month: number, day: number, year: number): boolean {
  if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) {
    return false;
  }
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  );
}

/** Whole years completed as of today. Returns null for invalid or future dates. */
export function ageFromDob(month: number, day: number, year: number): number | null {
  if (!isValidCalendarDate(month, day, year)) return null;

  const today = new Date();
  const dob = new Date(year, month - 1, day);
  if (dob.getTime() > today.getTime()) return null;

  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() - (month - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  return age;
}
