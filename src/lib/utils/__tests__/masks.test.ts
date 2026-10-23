import { describe, expect, it } from 'vitest';
import { maskMoney, moneyToInput, parseMoney } from '../masks';

describe('maskMoney', () => {
  it('lê o que é digitado como reais, não como centavos', () => {
    expect(maskMoney('120')).toBe('120');
    expect(parseMoney(maskMoney('120'))).toBe(120);
    expect(parseMoney(maskMoney('60'))).toBe(60);
  });

  it('aceita vírgula ou ponto como separador decimal e limita a duas casas', () => {
    expect(maskMoney('120,5')).toBe('120,5');
    expect(maskMoney('120.50')).toBe('120,50');
    expect(maskMoney('120,555')).toBe('120,55');
    expect(parseMoney('120,50')).toBe(120.5);
  });

  it('descarta letras, zeros à esquerda e separadores extras', () => {
    expect(maskMoney('R$ 0080')).toBe('80');
    expect(maskMoney(',5')).toBe('0,5');
    expect(maskMoney('1,2,3')).toBe('1,23');
  });

  it('trata vazio e zero como valor ausente', () => {
    expect(parseMoney('')).toBeNull();
    expect(parseMoney('0')).toBeNull();
  });

  it('converte número para o formato do campo', () => {
    expect(moneyToInput(60)).toBe('60,00');
    expect(parseMoney(moneyToInput(99.9))).toBe(99.9);
  });
});
