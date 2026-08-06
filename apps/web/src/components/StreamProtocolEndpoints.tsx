import { useState } from 'react';
import {
  STREAM_PLAYER_UID,
  STREAM_WHIP_PUBLISH_URL,
  getStreamPlaybackEndpoints,
  type StreamProtocolEndpoint,
} from '../lib/streamConfig';

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function StreamProtocolEndpoints({ uid = STREAM_PLAYER_UID }: { uid?: string }) {
  const endpoints = getStreamPlaybackEndpoints(uid);
  const [copied, setCopied] = useState<string | null>(null);

  async function onCopy(ep: StreamProtocolEndpoint) {
    const ok = await copyText(ep.value);
    if (ok) {
      setCopied(ep.id);
      window.setTimeout(() => setCopied(null), 1600);
    }
  }

  const browser = endpoints.filter((e) => e.browser);
  const pro = endpoints.filter((e) => !e.browser);

  return (
    <div className="streamProtocolBlock">
      <h2>Protocol-specific endpoints</h2>
      <p className="cMuted">
        Playback for viewers · WHIP for browser ultra-low latency publish (owner only). SRT/RTMPS are for pro tools,
        not Chrome/Safari.
      </p>

      <h3 className="streamProtocolSub">Publish · browser (WHIP)</h3>
      <ul className="streamMetaList">
        <EndpointRow
          ep={{
            id: 'whip',
            label: 'WebRTC (WHIP) URL',
            value: STREAM_WHIP_PUBLISH_URL,
            kind: 'url',
            clients: 'Best for browser-based ultra low latency publishing · admin Go Live',
            browser: true,
          }}
          copied={copied === 'whip'}
          onCopy={() =>
            void copyText(STREAM_WHIP_PUBLISH_URL).then((ok) => {
              if (ok) {
                setCopied('whip');
                window.setTimeout(() => setCopied(null), 1600);
              }
            })
          }
        />
      </ul>

      <h3 className="streamProtocolSub">Playback · web / in-app</h3>
      <ul className="streamMetaList">
        {browser.map((ep) => (
          <EndpointRow key={ep.id} ep={ep} copied={copied === ep.id} onCopy={() => void onCopy(ep)} />
        ))}
      </ul>

      <h3 className="streamProtocolSub">Pro / mobile native (SRT · RTMPS)</h3>
      <ul className="streamMetaList">
        {pro.map((ep) => (
          <EndpointRow key={ep.id} ep={ep} copied={copied === ep.id} onCopy={() => void onCopy(ep)} />
        ))}
      </ul>
    </div>
  );
}

function EndpointRow({
  ep,
  copied,
  onCopy,
}: {
  ep: StreamProtocolEndpoint;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <li className="streamEndpointRow">
      <div className="streamEndpointHead">
        <strong>{ep.label}</strong>
        <button type="button" className="streamCopyBtn" onClick={onCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {ep.kind === 'url' && ep.value.startsWith('http') ? (
        <a href={ep.value} target="_blank" rel="noreferrer">
          {ep.value}
        </a>
      ) : (
        <code className="streamEndpointValue">{ep.value}</code>
      )}
      <code className="streamMetaHint">{ep.clients}</code>
    </li>
  );
}
