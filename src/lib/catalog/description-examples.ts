/**
 * Exemplo de descrição mostrado no campo do pedido, de acordo com a área escolhida.
 * Um exemplo fixo (ex.: tomadas) confunde quem está pedindo um encanador.
 */
const EXAMPLES: Record<string, string> = {
  hidraulica: 'Ex: A torneira da cozinha está pingando sem parar e a pia está com vazamento embaixo.',
  eletrica: 'Ex: Preciso trocar duas tomadas na sala e uma na cozinha. A fiação já está pronta.',
  climatizacao: 'Ex: O ar-condicionado do quarto liga, mas não gela. Modelo split de 9.000 BTUs.',
  limpeza: 'Ex: Limpeza completa de apartamento de 2 quartos, incluindo banheiros e cozinha.',
  pintura: 'Ex: Pintar duas paredes da sala (cerca de 20 m²). Já tenho a tinta.',
  montagem: 'Ex: Montar um guarda-roupa de 6 portas e uma cômoda que acabaram de chegar.',
  jardinagem: 'Ex: Cortar a grama e podar as plantas de um jardim pequeno na frente de casa.',
};

const GENERIC = 'Ex: Descreva o problema, onde ele está e se já tem algum material em casa.';

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function getDescriptionExample(areaName?: string | null): string {
  if (!areaName) return GENERIC;
  return EXAMPLES[normalize(areaName)] ?? GENERIC;
}
