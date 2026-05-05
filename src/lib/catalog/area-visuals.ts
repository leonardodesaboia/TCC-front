import {
  Brush,
  Droplets,
  HardHat,
  Heart,
  Search,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react-native';

type IconComponent = typeof Search;

interface AreaVisual {
  Icon: IconComponent;
  color: string;
  bgColor: string;
}

interface AreaRule extends AreaVisual {
  match: string[];
}

const DEFAULT_VISUAL: AreaVisual = {
  Icon: Search,
  color: '#2563EB',
  bgColor: '#DBEAFE',
};

const AREA_RULES: AreaRule[] = [
  { match: ['eletrica', 'eletrica e iluminacao', 'eletricidade'], Icon: Zap, color: '#F59E0B', bgColor: '#FEF3C7' },
  { match: ['limpeza'], Icon: Sparkles, color: '#3B82F6', bgColor: '#DBEAFE' },
  { match: ['hidraulica', 'hidraulico'], Icon: Droplets, color: '#06B6D4', bgColor: '#CFFAFE' },
  { match: ['pintura'], Icon: Brush, color: '#8B5CF6', bgColor: '#EDE9FE' },
  { match: ['manutencao'], Icon: Wrench, color: '#EF4444', bgColor: '#FEE2E2' },
  { match: ['reforma', 'reformas', 'obra'], Icon: HardHat, color: '#E98936', bgColor: '#FFF1E5' },
  { match: ['cuidado', 'cuidados'], Icon: Heart, color: '#EC4899', bgColor: '#FCE7F3' },
];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getAreaVisual(areaName: string): AreaVisual {
  const normalized = normalize(areaName);
  const rule = AREA_RULES.find((item) => item.match.some((term) => normalized.includes(normalize(term))));

  if (!rule) return DEFAULT_VISUAL;

  return {
    Icon: rule.Icon,
    color: rule.color,
    bgColor: rule.bgColor,
  };
}
