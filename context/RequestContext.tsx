'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { notifyMealDelivered } from '@/lib/notifications';
import * as storage from '@/lib/storage';

const REQUESTS_STORAGE_KEY = 'meal-requests';

export type MealRequestStatus =
  | 'pending'
  | 'matched'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type MealRequest = {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: {
    address: string;
    latitude: number;
    longitude: number;
  };
  servingSize: number;
  dietaryRestrictions: string[];
  driverNote: string;
  selectedMeals: { id: string; name: string; quantity: number }[];
  deliveryPreference: 'leave_at_door' | 'hand_to_me';
  deliveryWindow: string;
  donationAmount?: number;
  status: MealRequestStatus;
  createdAt: Date;
  estimatedDelivery?: Date;
  volunteerId?: string;
  volunteerName?: string;
  showVolunteerName?: boolean;
  gurdwaraId?: string;
  gurdwaraName?: string;
  gurdwaraLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  pickupLocationId?: string;
  pickupLocationName?: string;
  pickupLocation?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  volunteerLocation?: {
    latitude: number;
    longitude: number;
  };
  statusHistory: { status: MealRequestStatus; timestamp: Date }[];
};

type RequestContextType = {
  requests: MealRequest[];
  activeRequest: MealRequest | null;
  isLoading: boolean;
  submitRequest: (request: {
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: { address: string; latitude: number; longitude: number };
    servingSize: number;
    dietaryRestrictions: string[];
    driverNote: string;
    selectedMeals: { id: string; name: string; quantity: number }[];
    deliveryPreference: 'leave_at_door' | 'hand_to_me';
    deliveryWindow: string;
    donationAmount?: number;
    pickupLocation?: { address: string; latitude: number; longitude: number };
    pickupLocationId?: string;
    pickupLocationName?: string;
  }) => MealRequest;
  cancelRequest: (requestId: string) => void;
  getRequest: (requestId: string) => MealRequest | undefined;
  updateRequestStatus: (requestId: string, status: MealRequestStatus, updates?: Partial<MealRequest>) => void;
  setVolunteerNameVisibility: (requestId: string, showVolunteerName: boolean) => void;
};

const RequestContext = createContext<RequestContextType | null>(null);

function generateRequestId() {
  return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<MealRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const stored = await storage.getItem(REQUESTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const restored = parsed.map((r: MealRequest & {
          familySize?: number;
          specialInstructions?: string;
          selectedMeals?: { id: string; name: string; quantity: number }[];
          deliveryPreference?: 'leave_at_door' | 'hand_to_me';
          deliveryWindow?: string;
          donationAmount?: number;
        }) => ({
          ...r,
          servingSize: r.servingSize ?? (r as { familySize?: number }).familySize ?? 1,
          driverNote: r.driverNote ?? (r as { specialInstructions?: string }).specialInstructions ?? '',
          selectedMeals: r.selectedMeals ?? [],
          deliveryPreference: r.deliveryPreference ?? 'leave_at_door',
          deliveryWindow: r.deliveryWindow ?? '12-2 PM',
          donationAmount: typeof r.donationAmount === 'number' ? r.donationAmount : undefined,
          createdAt: new Date(r.createdAt),
          estimatedDelivery: r.estimatedDelivery ? new Date(r.estimatedDelivery) : undefined,
          statusHistory: r.statusHistory.map((h) => ({
            ...h,
            timestamp: new Date(h.timestamp),
          })),
          showVolunteerName: r.showVolunteerName ?? false,
        }));
        setRequests(restored);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequests = useCallback(async (newRequests: MealRequest[]) => {
    try {
      await storage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(newRequests));
    } catch (error) {
      console.error('Failed to save requests:', error);
    }
  }, []);

  const simulateDeliveryProgression = useCallback(
    (requestId: string) => {
      const statusProgression: { status: MealRequestStatus; delay: number }[] = [
        { status: 'picked_up', delay: 12000 },
        { status: 'on_the_way', delay: 20000 },
        { status: 'delivered', delay: 35000 },
      ];

      statusProgression.forEach(({ status, delay }) => {
        setTimeout(() => {
          let deliveredRequest: MealRequest | undefined;
          setRequests((prev) => {
            const updated = prev.map((req) => {
              if (req.id !== requestId) return req;
              if (req.status === 'delivered' || req.status === 'cancelled') return req;

              const now = new Date();

              let volunteerLocation = req.volunteerLocation;
              if (req.gurdwaraLocation && req.deliveryAddress) {
                const gurdwara = req.gurdwaraLocation;
                const delivery = req.deliveryAddress;

                if (status === 'picked_up') {
                  volunteerLocation = { latitude: gurdwara.latitude, longitude: gurdwara.longitude };
                } else if (status === 'on_the_way') {
                  volunteerLocation = {
                    latitude: (gurdwara.latitude + delivery.latitude) / 2,
                    longitude: (gurdwara.longitude + delivery.longitude) / 2,
                  };
                } else if (status === 'delivered') {
                  volunteerLocation = { latitude: delivery.latitude, longitude: delivery.longitude };
                }
              }

              const nextRequest = {
                ...req,
                status,
                volunteerLocation,
                statusHistory: [...req.statusHistory, { status, timestamp: now }],
              };

              if (status === 'delivered') {
                deliveredRequest = nextRequest;
              }
              return nextRequest;
            });
            saveRequests(updated);
            return updated;
          });

          if (deliveredRequest) {
            void notifyMealDelivered({
              requestId: deliveredRequest.id,
              deliveryAddress: deliveredRequest.deliveryAddress?.address,
            });
          }
        }, delay);
      });
    },
    [saveRequests]
  );

  const simulateVolunteerMatch = useCallback(
    (requestId: string) => {
      const matchDelay = 5000 + Math.random() * 5000;

      setTimeout(() => {
        setRequests((prev) => {
          const updated = prev.map((req) => {
            if (req.id !== requestId || req.status !== 'pending') return req;

            const now = new Date();
            const estimatedDelivery = new Date(now.getTime() + 45 * 60 * 1000);

            return {
              ...req,
              status: 'matched' as MealRequestStatus,
              volunteerId: 'vol-123',
              volunteerName: 'Gurpreet Singh',
              showVolunteerName: false,
              gurdwaraId: req.pickupLocationId ?? 'hub-brampton',
              gurdwaraName: req.pickupLocationName ?? 'Brampton Distribution Hub',
              gurdwaraLocation: req.pickupLocation ?? {
                address: '123 Community Way, Brampton, ON',
                latitude: 43.7315,
                longitude: -79.7624,
              },
              pickupLocationId: req.pickupLocationId ?? 'hub-brampton',
              pickupLocationName: req.pickupLocationName ?? 'Brampton Distribution Hub',
              pickupLocation: req.pickupLocation ?? {
                address: '123 Community Way, Brampton, ON',
                latitude: 43.7315,
                longitude: -79.7624,
              },
              estimatedDelivery,
              statusHistory: [...req.statusHistory, { status: 'matched' as MealRequestStatus, timestamp: now }],
            };
          });
          saveRequests(updated);
          return updated;
        });

        simulateDeliveryProgression(requestId);
      }, matchDelay);
    },
    [saveRequests, simulateDeliveryProgression]
  );

  const submitRequest = useCallback(
    (request: {
      recipientName: string;
      recipientPhone: string;
      deliveryAddress: { address: string; latitude: number; longitude: number };
      servingSize: number;
      dietaryRestrictions: string[];
      driverNote: string;
      selectedMeals: { id: string; name: string; quantity: number }[];
      deliveryPreference: 'leave_at_door' | 'hand_to_me';
      deliveryWindow: string;
      donationAmount?: number;
      pickupLocation?: { address: string; latitude: number; longitude: number };
      pickupLocationId?: string;
      pickupLocationName?: string;
    }): MealRequest => {
      const now = new Date();
      const newRequest: MealRequest = {
        id: generateRequestId(),
        recipientId: `recipient-${Date.now()}`,
        recipientName: request.recipientName,
        recipientPhone: request.recipientPhone,
        deliveryAddress: request.deliveryAddress,
        servingSize: request.servingSize,
        dietaryRestrictions: request.dietaryRestrictions,
        driverNote: request.driverNote,
        selectedMeals: request.selectedMeals,
        deliveryPreference: request.deliveryPreference,
        deliveryWindow: request.deliveryWindow,
        donationAmount: request.donationAmount,
        pickupLocationId: request.pickupLocationId,
        pickupLocationName: request.pickupLocationName,
        pickupLocation: request.pickupLocation,
        status: 'pending',
        createdAt: now,
        showVolunteerName: false,
        statusHistory: [{ status: 'pending', timestamp: now }],
      };

      setRequests((prev) => {
        const updated = [newRequest, ...prev];
        saveRequests(updated);
        return updated;
      });

      simulateVolunteerMatch(newRequest.id);

      return newRequest;
    },
    [saveRequests, simulateVolunteerMatch]
  );

  const cancelRequest = useCallback(
    (requestId: string) => {
      setRequests((prev) => {
        const updated = prev.map((req) => {
          if (req.id !== requestId) return req;
          if (req.status === 'delivered' || req.status === 'cancelled') return req;

          const now = new Date();
          return {
            ...req,
            status: 'cancelled' as MealRequestStatus,
            statusHistory: [...req.statusHistory, { status: 'cancelled' as MealRequestStatus, timestamp: now }],
          };
        });
        saveRequests(updated);
        return updated;
      });
    },
    [saveRequests]
  );

  const getRequest = useCallback(
    (requestId: string) => requests.find((r) => r.id === requestId),
    [requests]
  );

  const updateRequestStatus = useCallback(
    (requestId: string, status: MealRequestStatus, updates?: Partial<MealRequest>) => {
      let deliveredRequest: MealRequest | undefined;
      setRequests((prev) => {
        const updated = prev.map((req) => {
          if (req.id !== requestId) return req;
          const now = new Date();
          const nextRequest = {
            ...req,
            ...updates,
            status,
            statusHistory: [...req.statusHistory, { status, timestamp: now }],
          };

          if (status === 'delivered' && req.status !== 'delivered') {
            deliveredRequest = nextRequest;
          }
          return nextRequest;
        });
        saveRequests(updated);
        return updated;
      });

      if (deliveredRequest) {
        void notifyMealDelivered({
          requestId: deliveredRequest.id,
          deliveryAddress: deliveredRequest.deliveryAddress?.address,
        });
      }
    },
    [saveRequests]
  );

  const setVolunteerNameVisibility = useCallback(
    (requestId: string, showVolunteerName: boolean) => {
      setRequests((prev) => {
        const updated = prev.map((req) =>
          req.id === requestId ? { ...req, showVolunteerName } : req
        );
        saveRequests(updated);
        return updated;
      });
    },
    [saveRequests]
  );

  const activeRequest = useMemo(
    () => requests.find((r) => !['delivered', 'cancelled'].includes(r.status)) ?? null,
    [requests]
  );

  const value = useMemo(
    () => ({
      requests,
      activeRequest,
      isLoading,
      submitRequest,
      cancelRequest,
      getRequest,
      updateRequestStatus,
      setVolunteerNameVisibility,
    }),
    [
      requests,
      activeRequest,
      isLoading,
      submitRequest,
      cancelRequest,
      getRequest,
      updateRequestStatus,
      setVolunteerNameVisibility,
    ]
  );

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}

export function useRequests() {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
}

export const REQUEST_STATUS_LABELS: Record<MealRequestStatus, string> = {
  pending: 'Finding a Driver',
  matched: 'Driver Assigned',
  picked_up: 'Meal Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
