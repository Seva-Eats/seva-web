const PERMISSION_ASKED_KEY = 'tracking-notification-permission-asked';
const PERMISSION_GRANTED_KEY = 'tracking-notification-permission-granted';
const DELIVERED_NOTIFIED_KEY = 'tracking-notification-delivered-ids';

type DeliveredNotificationPayload = {
  requestId: string;
  deliveryAddress?: string;
};

function canUseBrowserNotifications() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    typeof Notification !== 'undefined' &&
    window.isSecureContext
  );
}

function getStoredIds() {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const raw = localStorage.getItem(DELIVERED_NOTIFIED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DELIVERED_NOTIFIED_KEY, JSON.stringify(ids));
  } catch {
    // no-op
  }
}

export async function shouldPromptForTrackingNotifications() {
  if (!canUseBrowserNotifications()) return false;
  if (typeof window === 'undefined') return false;
  try {
    const asked = localStorage.getItem(PERMISSION_ASKED_KEY);
    return asked !== 'true';
  } catch {
    return false;
  }
}

export async function markTrackingNotificationsPrompted(granted: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
    localStorage.setItem(PERMISSION_GRANTED_KEY, granted ? 'true' : 'false');
  } catch {
    // no-op
  }
}

export async function requestTrackingNotificationsPermission() {
  if (!canUseBrowserNotifications()) {
    await markTrackingNotificationsPrompted(false);
    return false;
  }

  const permission = await Notification.requestPermission();
  const granted = permission === 'granted';
  await markTrackingNotificationsPrompted(granted);
  return granted;
}

export async function notifyMealDelivered(payload: DeliveredNotificationPayload) {
  if (!canUseBrowserNotifications()) return;
  if (Notification.permission !== 'granted') return;

  const notifiedIds = getStoredIds();
  if (notifiedIds.includes(payload.requestId)) return;

  const addressSuffix = payload.deliveryAddress ? ` to ${payload.deliveryAddress}` : '';
  try {
    const notification = new Notification('Meal delivered', {
      body: `Your Seva Eats delivery${addressSuffix} is complete.`,
      tag: `seva-delivered-${payload.requestId}`,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    return;
  }

  setStoredIds([...notifiedIds, payload.requestId]);
}
