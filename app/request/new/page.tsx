'use client';

import { ArrowRight, Bike } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { MealGridCard } from '@/components/meals/MealGridCard';
import { RequestFlowHeader } from '@/components/request/RequestFlowHeader';
import { mealOptions, type MealOption } from '@/constants/meals';

function NewRequestContent() {
  const router = useRouter();
  const params = useSearchParams();
  const locationId = params.get('location') ?? '';
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

  const totalMeals = Object.values(selected).reduce((sum, q) => sum + q, 0);
  const mainMeals = mealOptions.filter((meal) => meal.category === 'main');
  const desserts = mealOptions.filter((meal) => meal.category === 'dessert');

  const handleContinue = () => {
    if (totalMeals === 0) return;
    const mealsParam = Object.entries(selected)
      .map(([id, quantity]) => `${id}:${quantity}`)
      .join(',');
    router.push(`/request/details?location=${locationId}&meals=${encodeURIComponent(mealsParam)}`);
  };

  const renderGrid = (meals: MealOption[]) => (
    <div className="grid grid-cols-2 gap-3">
      {meals.map((meal) => (
        <MealGridCard
          key={meal.id}
          meal={meal}
          quantity={selected[meal.id] ?? 0}
          onAdd={() => toggleMeal(meal.id)}
          onIncrement={() => adjustQty(meal.id, 1)}
          onDecrement={() => adjustQty(meal.id, -1)}
        />
      ))}
    </div>
  );

  return (
    <AppShell>
      <div className="relative min-h-screen bg-[#FFF9F2] pb-24">
        <RequestFlowHeader
          title="Choose Your Meals"
          subtitle="All meals are 100% free"
          backHref="/request/location"
        />

        <div className="px-4 pt-4">
          <div className="mb-5 flex gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF2E6] p-4">
            <Bike size={24} className="shrink-0 text-[#F07B2A]" />
            <div>
              <p className="text-sm font-bold text-[#C2410C]">Langar is free for everyone</p>
              <p className="mt-0.5 text-[13px] leading-[18px] text-[#EA580C]">
                A volunteer will deliver your meal to a partner shelter or community drop-off
              </p>
            </div>
          </div>

          <p className="mb-3 text-base font-bold text-[#1A1A1A]">Main Courses</p>
          {renderGrid(mainMeals)}

          <p className="mb-3 mt-6 text-base font-bold text-[#1A1A1A]">Desserts</p>
          {renderGrid(desserts)}
        </div>

        {totalMeals > 0 && (
          <div className="fixed bottom-0 left-1/2 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-[#E8E3DA] bg-white px-4 py-4 pb-8">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F07B2A] text-sm font-bold text-white">
                {totalMeals}
              </span>
              <span className="text-sm text-[#6B7280]">
                meal{totalMeals === 1 ? '' : 's'} selected
              </span>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="flex items-center gap-2 rounded-full bg-[#F07B2A] px-6 py-3 text-base font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)] active:scale-[0.99]"
            >
              Continue
              <ArrowRight size={18} color="#fff" />
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFF9F2]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F07B2A] border-t-transparent" />
        </div>
      }
    >
      <NewRequestContent />
    </Suspense>
  );
}
