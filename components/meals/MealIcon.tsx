'use client';

import {
  Croissant,
  IceCream,
  Leaf,
  Soup,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'rice-bowl': Soup,
  'bakery-dining': Croissant,
  'soup-kitchen': UtensilsCrossed,
  eco: Leaf,
  'ramen-dining': Wheat,
  icecream: IceCream,
};

export function MealIcon({
  icon,
  color,
  size = 28,
}: {
  icon: string;
  color: string;
  size?: number;
}) {
  const Icon = ICON_MAP[icon] ?? UtensilsCrossed;
  return <Icon size={size} color={color} strokeWidth={1.75} />;
}
