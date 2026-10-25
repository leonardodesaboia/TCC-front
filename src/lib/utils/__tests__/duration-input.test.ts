import { describe, expect, it } from 'vitest';
import { durationInMinutes, durationParts } from '../duration-input';

describe('duration entry', () => {
  it.each([[3, 0, 180], [1, 30, 90], [0, 45, 45], [0, 0, 0]])('converts %sh %smin to %s minutes', (hours, minutes, expected) => {
    expect(durationInMinutes({ hours: String(hours), minutes: String(minutes) })).toBe(expected);
  });
  it.each(['60', '-1', '1.5', '3x'])('rejects invalid minute parts %s instead of truncating them', (minutes) => {
    expect(durationInMinutes({ hours: '1', minutes })).toBe(0);
  });
  it('roundtrips persisted durations without changing the service length', () => {
    for (const minutes of [1, 30, 60, 90, 180, 1440]) expect(durationInMinutes(durationParts(minutes))).toBe(minutes);
  });
  it('accepts an empty unused part and rejects decimals or overflow', () => {
    expect(durationInMinutes({ hours: '3', minutes: '' })).toBe(180);
    expect(durationInMinutes({ hours: '', minutes: '30' })).toBe(30);
    expect(durationInMinutes({ hours: '1.5', minutes: '' })).toBe(0);
    expect(durationInMinutes({ hours: '9999999999999', minutes: '' })).toBe(0);
  });
});
