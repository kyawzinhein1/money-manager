import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken && onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn && onAuthFailure) {
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInForGoogleCalendar = async (): Promise<{ user: User; accessToken: string }> => {
  if (cachedAccessToken && auth.currentUser) {
    return { user: auth.currentUser, accessToken: cachedAccessToken };
  }
  
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not retrieve OAuth access token from Google');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const getSavedCalendarEventId = (): string | null => {
  return localStorage.getItem('mm_google_calendar_event_id');
};

export interface SyncCalendarParams {
  time: string; // HH:MM
  message: string;
  lang?: string;
}

export const syncGoogleCalendarEvent = async ({ time, message, lang }: SyncCalendarParams): Promise<string> => {
  const { accessToken } = await signInForGoogleCalendar();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes + 15, 0);

  // Format YYYY-MM-DDTHH:mm:ss
  const pad = (n: number) => String(n).padStart(2, '0');
  const startISO = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}T${pad(startDate.getHours())}:${pad(startDate.getMinutes())}:00`;
  const endISO = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}:00`;

  const title = lang === 'my' ? "Money Manager သတိပေးချက်" : "Money Manager Daily Expense Reminder";
  const desc = message || (lang === 'my' ? "ဒီနေ့ အသုံးစရိတ်များကို ရေးသွင်းရန် မမေ့ပါနဲ့!" : "Don't forget to log your daily expenses!");

  const eventPayload = {
    summary: title,
    description: desc,
    start: {
      dateTime: startISO,
      timeZone: timeZone,
    },
    end: {
      dateTime: endISO,
      timeZone: timeZone,
    },
    recurrence: ['RRULE:FREQ=DAILY'],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 0 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };

  const existingEventId = getSavedCalendarEventId();
  let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  let method = 'POST';

  if (existingEventId) {
    url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${existingEventId}`;
    method = 'PUT';
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventPayload)
  });

  if (!res.ok) {
    if (res.status === 404 && existingEventId) {
      // Event was deleted externally, fallback to creating a new one
      localStorage.removeItem('mm_google_calendar_event_id');
      return syncGoogleCalendarEvent({ time, message, lang });
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Google Calendar API error: ${res.statusText}`);
  }

  const data = await res.json();
  const eventId = data.id;
  if (eventId) {
    localStorage.setItem('mm_google_calendar_event_id', eventId);
  }
  return eventId;
};

export const deleteGoogleCalendarEvent = async (confirmMessage?: string): Promise<boolean> => {
  const eventId = getSavedCalendarEventId();
  if (!eventId) return false;

  if (confirmMessage) {
    const userConfirmed = window.confirm(confirmMessage);
    if (!userConfirmed) return false;
  }

  try {
    const { accessToken } = await signInForGoogleCalendar();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (res.ok || res.status === 404) {
      localStorage.removeItem('mm_google_calendar_event_id');
      return true;
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Failed to delete event from Google Calendar');
    }
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    // Still clear local ID if needed or rethrow
    throw error;
  }
};
