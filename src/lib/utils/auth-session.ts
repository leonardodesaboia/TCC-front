import { ACCESS_TOKEN_KEY, getStoredValue } from './token-storage';

function decodeJwtSegment(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.length % 4 === 0 ? base64 : base64 + '='.repeat(4 - (base64.length % 4));
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function readTokenPayload(token: string): { sub: string; role: string; email?: string } {
  const parts = token.split('.');
  if (parts.length < 2) throw new Error('Token inválido');
  return JSON.parse(decodeJwtSegment(parts[1]));
}

export async function getAuthenticatedUserId(): Promise<string> {
  const token = await getStoredValue(ACCESS_TOKEN_KEY);
  if (!token) {
    throw new Error('Sem token de acesso');
  }

  return readTokenPayload(token).sub;
}
