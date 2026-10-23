import { useEffect, useState } from 'react';

/** Retorna o horário atual (ms) e re-renderiza a cada `intervalMs`. Usado em contagens regressivas. */
export function useNow(intervalMs = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);

  return now;
}
