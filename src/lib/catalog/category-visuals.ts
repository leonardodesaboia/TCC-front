import {
  Armchair,
  Baby,
  Bath,
  BrushCleaning,
  Construction,
  Drill,
  Droplets,
  Hammer,
  HeartHandshake,
  PaintRoller,
  Paintbrush,
  PawPrint,
  PlugZap,
  Search,
  ShowerHead,
  Sparkles,
  SprayCan,
  Wrench,
  Zap,
} from 'lucide-react-native';

type IconComponent = typeof Search;

interface CategoryVisual {
  Icon: IconComponent;
  color: string;
  bgColor: string;
}

interface CategoryRule extends CategoryVisual {
  match: string[];
}

const DEFAULT_VISUAL: CategoryVisual = {
  Icon: Search,
  color: '#2563EB',
  bgColor: '#DBEAFE',
};

const CATEGORY_RULES: CategoryRule[] = [
  { match: ['eletricista'], Icon: PlugZap, color: '#D97706', bgColor: '#FEF3C7' },
  { match: ['tomada', 'disjuntor'], Icon: Zap, color: '#F59E0B', bgColor: '#FEF3C7' },
  { match: ['faxina'], Icon: BrushCleaning, color: '#2563EB', bgColor: '#DBEAFE' },
  { match: ['pos-obra', 'pós-obra'], Icon: Sparkles, color: '#3B82F6', bgColor: '#DBEAFE' },
  { match: ['comercial'], Icon: SprayCan, color: '#1D4ED8', bgColor: '#DBEAFE' },
  { match: ['encanador'], Icon: Wrench, color: '#0891B2', bgColor: '#CFFAFE' },
  { match: ['desentup'], Icon: Droplets, color: '#06B6D4', bgColor: '#CFFAFE' },
  { match: ['torneira'], Icon: ShowerHead, color: '#0EA5E9', bgColor: '#E0F2FE' },
  { match: ['pintura interna', 'pintura externa'], Icon: PaintRoller, color: '#7C3AED', bgColor: '#EDE9FE' },
  { match: ['textura', 'efeitos'], Icon: Paintbrush, color: '#8B5CF6', bgColor: '#EDE9FE' },
  { match: ['manutencao', 'manutenção geral'], Icon: Wrench, color: '#DC2626', bgColor: '#FEE2E2' },
  { match: ['montagem de moveis', 'montagem de móveis'], Icon: Armchair, color: '#EA580C', bgColor: '#FFEDD5' },
  { match: ['reparos'], Icon: Drill, color: '#F97316', bgColor: '#FFEDD5' },
  { match: ['pedreiro'], Icon: Construction, color: '#B45309', bgColor: '#FEF3C7' },
  { match: ['gesseiro'], Icon: Hammer, color: '#A16207', bgColor: '#FEF3C7' },
  { match: ['azulejista'], Icon: Bath, color: '#0284C7', bgColor: '#E0F2FE' },
  { match: ['idosos'], Icon: HeartHandshake, color: '#DB2777', bgColor: '#FCE7F3' },
  { match: ['baba', 'babá'], Icon: Baby, color: '#EC4899', bgColor: '#FCE7F3' },
  { match: ['pet sitter'], Icon: PawPrint, color: '#BE185D', bgColor: '#FCE7F3' },
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getCategoryVisual(categoryName: string): CategoryVisual {
  const normalized = normalize(categoryName);
  const rule = CATEGORY_RULES.find((item) => item.match.some((term) => normalized.includes(normalize(term))));

  if (!rule) return DEFAULT_VISUAL;

  return {
    Icon: rule.Icon,
    color: rule.color,
    bgColor: rule.bgColor,
  };
}
