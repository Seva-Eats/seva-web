'use client';

import { MapPin, Phone, User, Users } from 'lucide-react';

type RequestDetailsCardProps = {
  name: string;
  phone: string;
  deliveryAddress: string;
  servingSize: number;
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#F3F4F6] py-3 last:border-0">
      <Icon size={18} className="mt-0.5 shrink-0 text-[#9CA3AF]" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-[#9CA3AF]">{label}</p>
        <p className="text-sm font-bold text-[#1A1A1A]">{value}</p>
      </div>
    </div>
  );
}

export function RequestDetailsCard({
  name,
  phone,
  deliveryAddress,
  servingSize,
}: RequestDetailsCardProps) {
  return (
    <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4">
      <p className="mb-1 text-[15px] font-bold text-[#1A1A1A]">Request Details</p>
      <DetailRow icon={User} label="Name" value={name} />
      <DetailRow icon={Phone} label="Phone" value={phone} />
      <DetailRow icon={MapPin} label="Delivery to" value={deliveryAddress} />
      <DetailRow icon={Users} label="Serving size" value={`${servingSize} servings`} />
    </div>
  );
}
