'use client';

import { Minus, Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { RequestNav } from '@/components/RequestNav';
import { mealOptions, type MealOption } from '@/constants/meals';
import { useThemeColors } from '@/hooks/use-theme-colors';

type SelectedMeal = { meal: MealOption; quantity: number };

function NewRequestContent() {
  const router = useRouter();
  const params = useSearchParams();
  const locationId = params.get('location') ?? '';
  const colors = useThemeColors();
  const [selected, setSelected] = useState<Record<string, number>>({});

  const toggleMeal = (mealId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[mealId]) delete next[mealId];
      else next[mealId] = 1;
      return next;
    });
  };

  const adjustQty = (mealId: string, delta: number) => {
    setSelected((prev) => {
      const current = prev[mealId] ?? 0;
      const nextQty = Math.max(0, current + delta);
      const next = { ...prev };
      if (nextQty === 0) delete next[mealId];
      else next[mealId] = nextQty;
      return next;
    });
  };

  const selectedList: SelectedMeal[] = Object.entries(selected)
    .map(([id, quantity]) => {
      const meal = mealOptions.find((m) => m.id === id);
      return meal ? { meal, quantity } : null;
    })
    .filter(Boolean) as SelectedMeal[];
  const totalMeals = selectedList.reduce((sum, item) => sum + item.quantity, 0);
  const mainMeals = mealOptions.filter((meal) => meal.category === 'main');
  const desserts = mealOptions.filter((meal) => meal.category === 'dessert');

  const handleContinue = () => {
    if (selectedList.length === 0) return;
    const mealsParam = selectedList.map((s) => `${s.meal.id}:${s.quantity}`).join(',');
    router.push(`/request/details?location=${locationId}&meals=${encodeURIComponent(mealsParam)}`);
  };

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <RequestNav />
        <div className="px-4 pb-8 pt-4">
          <h1 className="text-2xl font-extrabold" style={{ color: colors.text }}>
            Select meals
          </h1>
          <p className="mt-1 text-sm" style={{ color: colors.mutedText }}>
            Choose what you would like delivered
          </p>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
            Main Courses
          </p>
          <div className="mt-2 space-y-3">
            {mainMeals.map((meal) => {
              const qty = selected[meal.id] ?? 0;
              const isSelected = qty > 0;
              return (
                <div
                  key={meal.id}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: isSelected ? colors.accent : colors.border,
                    backgroundColor: isSelected
                      ? colors.isDark
                        ? 'rgba(249, 115, 22, 0.15)'
                        : '#FFFBEB'
                      : colors.surfaceElevated,
                  }}
                >
                  <button type="button" onClick={() => toggleMeal(meal.id)} className="w-full text-left">
                    <p className="font-bold" style={{ color: colors.text }}>
                      {meal.name}
                    </p>
                    <p className="text-sm" style={{ color: colors.mutedText }}>
                      {meal.description}
                    </p>
                    <p className="text-xs" style={{ color: colors.mutedText }}>
                      {meal.servings}
                    </p>
                  </button>
                  {isSelected && (
                    <div className="mt-3 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => adjustQty(meal.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border"
                        style={{ borderColor: colors.border }}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold" style={{ color: colors.text }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQty(meal.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.accent, color: '#fff' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
            Desserts
          </p>
          <div className="mt-2 space-y-3">
            {desserts.map((meal) => {
              const qty = selected[meal.id] ?? 0;
              const isSelected = qty > 0;
              return (
                <div
                  key={meal.id}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: isSelected ? colors.accent : colors.border,
                    backgroundColor: isSelected
                      ? colors.isDark
                        ? 'rgba(249, 115, 22, 0.15)'
                        : '#FFFBEB'
                      : colors.surfaceElevated,
                  }}
                >
                  <button type="button" onClick={() => toggleMeal(meal.id)} className="w-full text-left">
                    <p className="font-bold" style={{ color: colors.text }}>
                      {meal.name}
                    </p>
                    <p className="text-sm" style={{ color: colors.mutedText }}>
                      {meal.description}
                    </p>
                    <p className="text-xs" style={{ color: colors.mutedText }}>
                      {meal.servings}
                    </p>
                  </button>
                  {isSelected && (
                    <div className="mt-3 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => adjustQty(meal.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border"
                        style={{ borderColor: colors.border }}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold" style={{ color: colors.text }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustQty(meal.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.accent, color: '#fff' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedList.length === 0}
            className="mt-6 w-full rounded-[28px] py-3.5 text-base font-extrabold text-white disabled:opacity-50"
            style={{ backgroundColor: colors.accent }}
          >
            {totalMeals > 0 ? `Continue (${totalMeals} selected)` : 'Continue'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF8F0]" />}>
      <NewRequestContent />
    </Suspense>
  );
}
