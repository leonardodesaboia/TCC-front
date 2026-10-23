export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1');
  if (digits.length <= 7) return digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.replace(/(\d{2})(\d{0,2})/, '$1/$2');
  return digits.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
}

/**
 * Máscara de valor em reais para campos digitados.
 * O que a pessoa digita é lido como reais: "120" vira "120" (R$ 120,00), "120,5" vira "120,5".
 * Aceita vírgula ou ponto como separador decimal e limita a duas casas.
 * Não usa separador de milhar, para que o ponto digitado nunca seja ambíguo.
 */
export function maskMoney(value: string): string {
  const cleaned = value.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [rawInteger, ...rest] = cleaned.split(',');
  const integer = rawInteger.replace(/^0+(?=\d)/, '').slice(0, 6);

  if (rest.length === 0) return integer;

  const decimals = rest.join('').slice(0, 2);
  return `${integer || '0'},${decimals}`;
}

/** Converte o texto de maskMoney em número (reais). Retorna null se vazio ou zero. */
export function parseMoney(value: string): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** Converte um valor numérico em texto compatível com maskMoney (ex.: 60 -> "60,00"). */
export function moneyToInput(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[10])) return false;

  return true;
}
