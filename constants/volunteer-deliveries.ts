/** Phase 0 mock data — replaced by Supabase driver_routes + route_stops in Phase 3+ */

export type VolunteerStopStatus = 'pending' | 'en_route' | 'delivered' | 'skipped';

export type VolunteerRouteStop = {
  id: string;
  sequence: number;
  recipientName: string;
  addressLine: string;
  city: string;
  meals: number;
  status: VolunteerStopStatus;
  notes?: string;
};

export type VolunteerRouteStatus = 'assigned' | 'in_progress' | 'completed';

export type VolunteerActiveRoute = {
  id: string;
  label: string;
  routeDate: string;
  kitchenName: string;
  pickupAddress: string;
  pickupAt: string;
  status: VolunteerRouteStatus;
  totalStops: number;
  completedStops: number;
  stops: VolunteerRouteStop[];
};

export const MOCK_VOLUNTEER_ROUTE: VolunteerActiveRoute = {
  id: 'route-demo-3',
  label: 'Route 3',
  routeDate: new Date().toISOString().slice(0, 10),
  kitchenName: 'Ontario Khalsa Darbar',
  pickupAddress: '7080 Dixie Rd, Mississauga',
  pickupAt: '5:30 PM',
  status: 'assigned',
  totalStops: 5,
  completedStops: 0,
  stops: [
    {
      id: 'stop-1',
      sequence: 1,
      recipientName: 'Singh family',
      addressLine: '420 Bovaird Dr W',
      city: 'Brampton',
      meals: 4,
      status: 'pending',
      notes: 'Buzz 4421',
    },
    {
      id: 'stop-2',
      sequence: 2,
      recipientName: 'Kaur household',
      addressLine: '15 Glenforest Blvd',
      city: 'Brampton',
      meals: 3,
      status: 'pending',
    },
    {
      id: 'stop-3',
      sequence: 3,
      recipientName: 'Patel family',
      addressLine: '88 Queen St E',
      city: 'Brampton',
      meals: 2,
      status: 'pending',
    },
    {
      id: 'stop-4',
      sequence: 4,
      recipientName: 'Ahmed family',
      addressLine: '210 Main St S',
      city: 'Brampton',
      meals: 5,
      status: 'pending',
    },
    {
      id: 'stop-5',
      sequence: 5,
      recipientName: 'Chen household',
      addressLine: '55 Kennedy Rd S',
      city: 'Brampton',
      meals: 2,
      status: 'pending',
    },
  ],
};
