export async function notifyMealDelivered(opts: {
  requestId: string;
  deliveryAddress?: string;
}) {
  if (typeof window === 'undefined') return;
  void opts;
  // Web: optional toast could be added here; data layer still marks delivered.
}
