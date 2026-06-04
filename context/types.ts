export type MenuItem = {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  unit: string;
  image: string;
  storeId: string;
};

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'supply_confirmed'
  | 'batch_assigned'
  | 'prep_ops'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered';

export type DeliveryLocation = {
  latitude: number;
  longitude: number;
  address: string;
};

export type StoreLocation = {
  latitude: number;
  longitude: number;
  address: string;
};

export type DriverLocation = {
  latitude: number;
  longitude: number;
};

export type Order = {
  id: string;
  storeId: string;
  storeName: string;
  storeLocation: StoreLocation;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  placedAt: Date;
  estimatedDelivery: Date;
  deliveryLocation: DeliveryLocation;
  driverLocation?: DriverLocation;
  statusHistory: { status: OrderStatus; timestamp: Date }[];
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Seva Requested',
  confirmed: 'Request Confirmed',
  supply_confirmed: 'Supply Confirmed',
  batch_assigned: 'Batch Assigned',
  prep_ops: 'Prep Ops Underway',
  preparing: 'Meal Box Prepared',
  ready_for_pickup: 'Ready for Pickup',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  'placed',
  'confirmed',
  'supply_confirmed',
  'batch_assigned',
  'prep_ops',
  'preparing',
  'ready_for_pickup',
  'picked_up',
  'on_the_way',
  'delivered',
];
