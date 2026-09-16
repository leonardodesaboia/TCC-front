import { describe, expect, it } from 'vitest';
import { compareWithGeocoded, describeFields, type AddressFormValues } from '../address-fill';

const EMPTY: AddressFormValues = {
  street: '',
  number: '',
  district: '',
  city: '',
  state: '',
  zipCode: '',
};

const GEOCODED = {
  lat: -3.734,
  lng: -38.494,
  normalizedAddress: {
    street: 'Avenida Dom Luís',
    number: '1233',
    district: 'Aldeota',
    city: 'Fortaleza',
    state: 'CE',
    zipCode: '60160-230',
  },
};

describe('compareWithGeocoded', () => {
  it('preenche os campos vazios com o que veio do mapa', () => {
    const { filled, divergent } = compareWithGeocoded(EMPTY, GEOCODED);

    expect(filled).toEqual({
      street: 'Avenida Dom Luís',
      number: '1233',
      district: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE',
      zipCode: '60160-230',
    });
    expect(divergent).toEqual([]);
  });

  /**
   * Regra central: a pessoa conhece o endereço dela melhor que o OpenStreetMap.
   * Corrigir em silêncio é como o pin e o endereço escrito passam a apontar para
   * lugares diferentes sem ninguém perceber.
   */
  it('nunca sobrescreve o que a pessoa digitou', () => {
    const { filled } = compareWithGeocoded(
      { ...EMPTY, street: 'Rua que eu sei que é a certa', number: '10' },
      GEOCODED,
    );

    expect(filled.street).toBeUndefined();
    expect(filled.number).toBeUndefined();
    expect(filled.district).toBe('Aldeota');
  });

  it('aponta divergência entre o digitado e o ponto marcado', () => {
    const { divergent } = compareWithGeocoded(
      { ...EMPTY, district: 'Meireles', city: 'Fortaleza' },
      GEOCODED,
    );

    expect(divergent).toEqual(['district']);
  });

  it('acento e caixa não contam como divergência', () => {
    const { divergent } = compareWithGeocoded(
      { ...EMPTY, street: 'avenida dom luis', city: 'FORTALEZA' },
      GEOCODED,
    );

    expect(divergent).toEqual([]);
  });

  it('ignora campo que o provider não devolveu', () => {
    const { filled, divergent } = compareWithGeocoded(EMPTY, {
      lat: -3.734,
      lng: -38.494,
      normalizedAddress: { street: 'Avenida Dom Luís' },
    });

    expect(filled).toEqual({ street: 'Avenida Dom Luís' });
    expect(divergent).toEqual([]);
  });
});

describe('describeFields', () => {
  it('monta a lista em linguagem corrida', () => {
    expect(describeFields([])).toBe('');
    expect(describeFields(['street'])).toBe('rua');
    expect(describeFields(['street', 'district'])).toBe('rua e bairro');
    expect(describeFields(['street', 'district', 'city'])).toBe('rua, bairro e cidade');
  });
});
