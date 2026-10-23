import type { GeocodedAddress } from '@/types/address';

export interface AddressFormValues {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface AddressFillResult {
  /** Só os campos que estavam vazios e agora têm valor. */
  filled: Partial<AddressFormValues>;
  /** Campos que a pessoa preencheu e divergem do que o mapa devolveu. */
  divergent: Array<keyof AddressFormValues>;
}

const FIELD_LABELS: Record<keyof AddressFormValues, string> = {
  street: 'rua',
  number: 'número',
  district: 'bairro',
  city: 'cidade',
  state: 'estado',
  zipCode: 'CEP',
};

function normalize(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compara o endereço devolvido pelo mapa com o que está no formulário.
 *
 * <p>Regra que não se negocia: **nunca sobrescrever o que a pessoa digitou**. Ela
 * conhece o endereço melhor que o OpenStreetMap, e "corrigir" em silêncio é como
 * o pin e o endereço escrito passam a apontar para lugares diferentes sem ninguém
 * perceber. Campo vazio é preenchido; campo divergente vira aviso.
 */
export function compareWithGeocoded(
  current: AddressFormValues,
  geocoded: GeocodedAddress,
): AddressFillResult {
  const suggested = geocoded.normalizedAddress ?? {};
  const filled: Partial<AddressFormValues> = {};
  const divergent: Array<keyof AddressFormValues> = [];

  (Object.keys(FIELD_LABELS) as Array<keyof AddressFormValues>).forEach((field) => {
    const suggestion = suggested[field];
    if (!suggestion) return;

    const typed = current[field];
    if (!typed || typed.trim().length === 0) {
      filled[field] = suggestion;
      return;
    }

    if (normalize(typed) !== normalize(suggestion)) {
      divergent.push(field);
    }
  });

  return { filled, divergent };
}

/** "rua e bairro" — para montar o aviso de divergência em linguagem corrida. */
export function describeFields(fields: Array<keyof AddressFormValues>): string {
  const labels = fields.map((field) => FIELD_LABELS[field]);
  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`;
}
