import type { ComponentProps } from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type CardTone = 'primary' | 'warm' | 'neutral';

export const heroHighlights = ['Escrow protegido', 'Busca rapida', 'Profissionais verificados'];

export const trustPoints = [
  {
    title: 'Sem dor de cabeca',
    description: 'Perfis claros, avaliacoes reais e decisao mais segura para contratar.',
    icon: 'shield-checkmark-outline' as IconName,
    tone: 'warm' as CardTone,
  },
  {
    title: 'Pagamento protegido',
    description: 'O valor fica retido ate a confirmacao do servico realizado.',
    icon: 'wallet-outline' as IconName,
    tone: 'primary' as CardTone,
  },
  {
    title: 'Agilidade de ponta a ponta',
    description: 'Fluxo simples para contratar no modo Express ou por agendamento.',
    icon: 'flash-outline' as IconName,
    tone: 'primary' as CardTone,
  },
  {
    title: 'Qualidade comprovada',
    description: 'Avaliacao bilateral e historico ajudam a manter a rede confiavel.',
    icon: 'star-outline' as IconName,
    tone: 'neutral' as CardTone,
  },
];

export const serviceCategories = [
  {
    title: 'Diarista',
    description: 'Limpeza e organizacao para casa ou escritorio.',
    icon: 'sparkles-outline' as IconName,
    tone: 'primary' as CardTone,
  },
  {
    title: 'Baba',
    description: 'Cuidado com seguranca, rotina e acolhimento.',
    icon: 'heart-outline' as IconName,
    tone: 'warm' as CardTone,
  },
  {
    title: 'Passadeira',
    description: 'Roupas prontas com capricho e previsibilidade.',
    icon: 'shirt-outline' as IconName,
    tone: 'neutral' as CardTone,
  },
];

export const howItWorksSteps = [
  {
    step: '1',
    title: 'Escolha o modo',
    description: 'Use Express para urgencia ou OnDemand para agendar dia e horario.',
  },
  {
    step: '2',
    title: 'Veja perfis e detalhes',
    description: 'Compare experiencia, distancia, preco e disponibilidade.',
  },
  {
    step: '3',
    title: 'Pague com seguranca',
    description: 'O pagamento entra em custodia e so e liberado na conclusao.',
  },
  {
    step: '4',
    title: 'Conclua e avalie',
    description: 'Confirme o servico, avalie e mantenha a comunidade confiavel.',
  },
];

export const featuredProfessionals = [
  {
    name: 'Maria Silva',
    role: 'Diarista premium',
    rating: '4.9',
    price: 'R$ 90 / visita',
    availability: 'Hoje, 14h',
    tags: ['Diarista', 'Passadeira'],
  },
  {
    name: 'Ana Costa',
    role: 'Baba com rotina noturna',
    rating: '4.8',
    price: 'R$ 32 / hora',
    availability: 'Amanha, 08h',
    tags: ['Baba', 'Infantil'],
  },
  {
    name: 'Joana Lima',
    role: 'Passadeira residencial',
    rating: '5.0',
    price: 'R$ 75 / atendimento',
    availability: 'Sexta, 09h',
    tags: ['Passadeira', 'Express'],
  },
];
