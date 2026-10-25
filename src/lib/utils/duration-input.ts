export interface DurationParts { hours: string; minutes: string }

export function durationParts(total?: number | null): DurationParts {
  if (!total || !Number.isSafeInteger(total) || total < 0) return { hours: '', minutes: '' };
  return { hours: String(Math.floor(total / 60)), minutes: String(total % 60) };
}

/** Empty parts mean zero; invalid/partial numbers must never be silently truncated. */
export function durationInMinutes({ hours, minutes }: DurationParts): number {
  if (!/^\d*$/.test(hours) || !/^\d*$/.test(minutes)) return 0;
  const total = Number(hours) * 60 + Number(minutes);
  return Number(minutes) < 60 && Number.isSafeInteger(total) && total <= 2147483647 ? total : 0;
}
