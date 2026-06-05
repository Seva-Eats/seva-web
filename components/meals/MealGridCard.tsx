'use client';

import { Minus, Plus } from 'lucide-react';

import { MealIcon } from '@/components/meals/MealIcon';
import type { MealOption } from '@/constants/meals';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

type MealGridCardProps = {
  meal: MealOption;
  quantity: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function MealGridCard({
  meal,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: MealGridCardProps) {
  const isSelected = quantity > 0;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border-2 bg-white p-3 pb-3.5 transition-all duration-150',
        isSelected
          ? 'border-[#F07B2A] shadow-[0_2px_12px_rgba(240,123,42,0.12)]'
          : 'cursor-pointer border-[#E8E3DA] shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-[#F7B37B] hover:shadow-[0_4px_14px_rgba(240,123,42,0.14)] active:scale-[0.995]'
      )}
      onClick={isSelected ? undefined : onAdd}
      onKeyDown={
        isSelected
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onAdd();
              }
            }
      }
      role={isSelected ? undefined : 'button'}
      tabIndex={isSelected ? -1 : 0}
      aria-label={isSelected ? undefined : `Add ${meal.name}`}
    >
      {isSelected ? (
        <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-[#F07B2A] px-1 py-0.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDecrement();
            }}
            className="flex h-6 w-6 items-center justify-center text-white"
            aria-label={`Decrease ${meal.name}`}
          >
            <Minus size={14} strokeWidth={3} />
          </button>
          <span className={cn(TypeClass.body, 'min-w-[16px] text-center font-bold text-white')}>
            {quantity}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onIncrement();
            }}
            className="flex h-6 w-6 items-center justify-center text-white"
            aria-label={`Increase ${meal.name}`}
          >
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      ) : (
        <div
          className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#F07B2A] text-white"
          aria-hidden="true"
        >
          <Plus size={16} strokeWidth={3} />
        </div>
      )}

      <div
        className="mx-auto mt-1 flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: meal.backgroundColor }}
      >
        <MealIcon icon={meal.icon} color={meal.iconColor} />
      </div>

      <p className={cn(TypeClass.mealName, 'mt-2 text-center text-[#1A1A1A]')}>{meal.name}</p>
      <p className={cn(TypeClass.mealDesc, 'mt-1 text-center text-[#6B7280]')}>{meal.description}</p>
      <p className={cn(TypeClass.mealServings, 'mt-2 text-center text-[#F07B2A]')}>{meal.servings}</p>
    </div>
  );
}
