export type LiveChatMessage = {
  id: string;
  name: string;
  text: string;
  createdAt: number;
};

const NAME_KEY = '3000-live-chat-name';
const VIEWER_ID_KEY = '3000-live-viewer-id';
const LOCAL_MESSAGES_KEY = '3000-live-chat-local';
const LIVE_ROOM_API = import.meta.env.VITE_LIVE_ROOM_API?.toString().trim() || '';

export const isLiveRoomConnected = Boolean(LIVE_ROOM_API);

function localRoom() {
  try {
    const messages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '[]') as LiveChatMessage[];
    return { messages: messages.slice(-50), viewers: 1 };
  } catch {
    return { messages: [], viewers: 1 };
  }
}

export function liveChatName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function setLiveChatName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name.slice(0, 32));
  } catch {
    /* ignore */
  }
}

export function liveViewerId() {
  try {
    const existing = localStorage.getItem(VIEWER_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(VIEWER_ID_KEY, id);
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`;
  }
}

export async function fetchLiveRoom(): Promise<{ messages: LiveChatMessage[]; viewers: number }> {
  if (!LIVE_ROOM_API) return localRoom();
  const res = await fetch(LIVE_ROOM_API, { cache: 'no-store' });
  if (!res.ok) throw new Error('live room unavailable');
  const data = (await res.json()) as { messages?: LiveChatMessage[]; viewers?: number };
  return { messages: data.messages ?? [], viewers: data.viewers ?? 0 };
}

export async function heartbeatLiveRoom(id: string) {
  if (!LIVE_ROOM_API) return { ...localRoom(), id };
  const res = await fetch(LIVE_ROOM_API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'presence', id }),
  });
  if (!res.ok) throw new Error('presence failed');
  const data = (await res.json()) as { messages?: LiveChatMessage[]; viewers?: number; id?: string };
  return { messages: data.messages ?? [], viewers: data.viewers ?? 0, id: data.id || id };
}

export async function sendLiveChat(name: string, text: string) {
  if (!LIVE_ROOM_API) {
    const next = {
      id: crypto.randomUUID(),
      name: name.slice(0, 32),
      text: text.slice(0, 280),
      createdAt: Date.now(),
    };
    const room = localRoom();
    const messages = [...room.messages, next].slice(-50);
    try {
      localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
    return { messages, viewers: 1 };
  }
  const res = await fetch(LIVE_ROOM_API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'chat', name, text }),
  });
  const data = (await res.json()) as { ok?: boolean; error?: string; messages?: LiveChatMessage[]; viewers?: number };
  if (!res.ok || !data.ok) throw new Error(data.error || 'Could not send');
  return { messages: data.messages ?? [], viewers: data.viewers ?? 0 };
}

export const CASH_APP_CASHTAG = 'addcashGift';
export const CASH_APP_URL = 'https://cash.app/$addcashGift';

export function cashAppTipUrl(amount?: number) {
  if (!amount || amount <= 0) return CASH_APP_URL;
  return `${CASH_APP_URL}/${amount}`;
}
