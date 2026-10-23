export function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return 'Ainda não definido';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateShort(value?: string): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateFull(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return 'Sob consulta';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}min` : `${hours}h`;
}

export function sortByNewest<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

/** Tempo decorrido em linguagem natural: "agora", "há 45 s", "há 19 min", "há 2 h". */
export function formatTimeAgo(seconds: number): string {
  if (seconds < 10) return 'agora';
  if (seconds < 60) return `há ${Math.floor(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  return `há ${Math.floor(minutes / 60)} h`;
}

/** Tempo restante até um prazo, no formato "4:05" (abaixo de 1 h) ou "1 h 20 min". */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours} h ${rest} min` : `${hours} h`;
  }
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Data com dia da semana, ex.: "sáb., 24/10/2026". */
export function formatDateWithWeekday(date: Date): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
  return `${weekday}, ${formatDateFull(date)}`;
}

/** "1 profissão" / "3 profissões". */
export function formatProfessionCount(count: number): string {
  return `${count} ${count === 1 ? 'profissão' : 'profissões'}`;
}

/** "1 avaliação" / "3 avaliações". */
export function formatReviewCount(count: number): string {
  return `${count} ${count === 1 ? 'avaliação' : 'avaliações'}`;
}
