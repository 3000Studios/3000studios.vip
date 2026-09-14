import { useCallback, useEffect, useState } from 'react';
import { getSiteOverview } from '../lib/api';
import { readOpsEvents } from '../lib/commerce';
import { fetchLiveRoom, type LiveChatMessage } from '../lib/liveRoom';

type ActivityItem = {
  id: string;
  at: number;
  type: 'visitor' | 'message' | 'stream' | 'commerce' | 'system';
  title: string;
  detail: string;
};

const SESSION_KEY = '3000-admin-sessions';

export function AdminActivityLog() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [viewers, setViewers] = useState<number | null>(null);
  const [visitors24h, setVisitors24h] = useState<number | null>(null);
  const [analyticsNote, setAnalyticsNote] = useState('Checking owner analytics…');
  const [, setRefreshedAt] = useState(0);

  const refresh = useCallback(async () => {
    setBusy(true);
    const room = await fetchLiveRoom().catch(() => null);
    if (room) {
      setMessages(room.messages);
      setViewers(room.viewers);
    }

    try {
      const response = await getSiteOverview();
      const studio = response.overview.find((entry) =>
        /3000studios\.vip/i.test(entry.site.url),
      );
      const count = studio?.traffic.visitors24h ?? null;
      setVisitors24h(count);
      setAnalyticsNote(
        count === null
          ? 'Cloudflare has not returned a 24-hour unique-visitor total yet.'
          : `${count.toLocaleString()} unique visitors reported in the last 24 hours.`,
      );
    } catch {
      setAnalyticsNote('Visitor analytics needs an active owner Cloudflare Access session.');
    }
    setRefreshedAt(Date.now());
    setBusy(false);
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0);
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const items: ActivityItem[] = (() => {
    const commerce = readOpsEvents().map((event, index) => ({
      id: `commerce-${event.ts}-${index}`,
      at: event.ts,
      type: 'commerce' as const,
      title: event.type.replaceAll('_', ' '),
      detail: 'Recorded by this owner browser.',
    }));
    let sessions: Array<{ ts: number; live: boolean }> = [];
    try {
      sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '[]');
    } catch {
      sessions = [];
    }
    const stream = sessions.map((entry, index) => ({
      id: `stream-${entry.ts}-${index}`,
      at: entry.ts,
      type: 'stream' as const,
      title: entry.live ? 'Broadcast started' : 'Broadcast ended',
      detail: entry.live ? 'The owner studio reported ON AIR.' : 'The owner ended the stream.',
    }));
    const chat = messages.map((message) => ({
      id: `message-${message.id}`,
      at: message.createdAt,
      type: 'message' as const,
      title: `Message from ${message.name || 'viewer'}`,
      detail: message.text,
    }));
    return [...chat, ...stream, ...commerce].sort((a, b) => b.at - a.at).slice(0, 100);
  })();

  const notifications = [
    messages.length ? `${messages.length} live-room message${messages.length === 1 ? '' : 's'} available` : 'No live-room messages yet',
    viewers === null ? 'Viewer presence is still loading' : `${viewers} viewer${viewers === 1 ? '' : 's'} currently reported`,
    analyticsNote,
  ];

  return (
    <section className="cPanel adminActivityPanel">
      <div className="cPanelHead">
        <div>
          <span className="adminEyebrow">OWNER NOTIFICATIONS</span>
          <h2>Website activity</h2>
        </div>
        <span className="cSpacer" />
        <button className="cBtn sm ghost" type="button" onClick={() => void refresh()} disabled={busy}>
          {busy ? 'Refreshing…' : 'Refresh'}
        </button>
        <button className="cBtn sm primary" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? 'Hide complete log' : `Open complete log${items.length ? ` (${items.length})` : ''}`}
        </button>
      </div>
      <div className="cPanelBody">
        <div className="adminNoticeGrid" aria-live="polite">
          {notifications.map((notification, index) => (
            <div className={`adminNotice ${index === 0 && messages.length ? 'hasUpdate' : ''}`} key={notification}>
              <span aria-hidden="true">{index === 0 ? '●' : index === 1 ? '◉' : '◆'}</span>
              <p>{notification}</p>
            </div>
          ))}
        </div>
        {open ? (
          <div className="adminFullLog" role="region" aria-label="Complete website activity log">
            <div className="adminLogSummary">
              <strong>{visitors24h?.toLocaleString() ?? '—'}</strong><span>Visitors · 24h</span>
              <strong>{viewers ?? '—'}</strong><span>Live viewers</span>
              <strong>{messages.length}</strong><span>Messages</span>
            </div>
            <ol>
              {items.map((item) => (
                <li key={item.id} data-kind={item.type}>
                  <time dateTime={new Date(item.at).toISOString()}>{new Date(item.at).toLocaleString()}</time>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </li>
              ))}
              {items.length === 0 ? <li className="adminLogEmpty">No activity has been recorded yet.</li> : null}
            </ol>
            <p className="cMuted adminLogLimit">
              This combines Cloudflare visitor totals, live-room messages, stream sessions, and owner-browser commerce events. It intentionally excludes passwords, tokens, IP addresses, and private credentials.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
