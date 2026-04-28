import type { ApiResponse, SpringPage } from '@/types/api';

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

export function unwrapItem<T>(payload: ApiResponse<T> | T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export function unwrapList<T>(payload: ApiResponse<T[]> | SpringPage<T> | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  if ('content' in payload && Array.isArray(payload.content)) return payload.content;
  if ('data' in payload && Array.isArray(payload.data)) return payload.data;
  return [];
}
