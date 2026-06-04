'use client';

import { Car, Check, Search } from 'lucide-react';

import type { MealRequestStatus } from '@/context';

const STEPS = [
  { key: 'finding', label: 'Finding Driver', statuses: ['pending'] as MealRequestStatus[] },
  { key: 'matched', label: 'Driver Matched', statuses: ['matched', 'picked_up'] as MealRequestStatus[] },
  { key: 'way', label: 'On the Way', statuses: ['on_the_way'] as MealRequestStatus[] },
  { key: 'done', label: 'Delivered', statuses: ['delivered'] as MealRequestStatus[] },
];

function stepIndex(status: MealRequestStatus): number {
  if (status === 'cancelled') return 0;
  if (status === 'pending') return 0;
  if (status === 'matched' || status === 'picked_up') return 1;
  if (status === 'on_the_way') return 2;
  return 3;
}

function StepIcon({ index, active, complete }: { index: number; active: boolean; complete: boolean }) {
  const bg = active ? '#F07B2A' : complete ? '#10B981' : '#F3F4F6';
  const color = active || complete ? '#FFFFFF' : '#9CA3AF';

  const icons = [
    <Search key="s" size={22} color={color} />,
    <Check key="c" size={22} color={color} />,
    <Car key="car" size={22} color={color} />,
    <Check key="d" size={22} color={color} />,
  ];

  return (
    <div
      className="flex h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: bg }}
    >
      {icons[index]}
    </div>
  );
}

export function DeliveryProgressStepper({ status }: { status: MealRequestStatus }) {
  const current = stepIndex(status);
  const isDelivered = status === 'delivered';

  return (
    <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4">
      <p className="mb-4 text-[15px] font-bold text-[#1A1A1A]">Delivery Progress</p>
      <div className="relative flex justify-between">
        <div className="absolute left-6 right-6 top-6 h-0.5 bg-[#E5E7EB]" />
        {STEPS.map((step, index) => {
          const complete = index < current || isDelivered;
          const active = index === current && !isDelivered;
          const labelColor = complete
            ? isDelivered && index === 3
              ? '#1A1A1A'
              : '#059669'
            : active
              ? '#1A1A1A'
              : '#9CA3AF';

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
              <StepIcon index={index} active={active} complete={complete} />
              <span
                className="max-w-[72px] truncate text-center text-[10px] font-semibold"
                style={{ color: labelColor }}
              >
                {step.label}
              </span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#F07B2A]" />
              )}
              {isDelivered && index === 3 && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#F07B2A]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
