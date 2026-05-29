const customerCode = import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim();
const liveInputId = import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim();
const streamTitle = import.meta.env.VITE_STREAM_TITLE?.toString().trim() || '3000 Studios Private Stream';

export function StreamVault() {
  const isConfigured = Boolean(customerCode && liveInputId);
  const embedUrl = isConfigured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;
  const hlsUrl = isConfigured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/manifest/video.m3u8`
    : null;

  return (
    <div className="dashboard">
      <section className="heroPanel streamHero">
        <div>
          <span className="eyebrow">Private Stream Vault</span>
          <h1>{streamTitle}</h1>
          <p>
            Owner-gated playback for OBS streams routed through Cloudflare Stream. Stream keys stay
            in OBS and Cloudflare, never in this frontend.
          </p>
        </div>
        <div className={`streamStatus ${isConfigured ? 'ready' : 'setup'}`}>
          <span>{isConfigured ? 'Configured' : 'Setup required'}</span>
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h2>Live Player</h2>
          <span className="muted">Protected by the vault route and your existing access gate.</span>
        </div>
        {embedUrl ? (
          <div className="streamFrameWrap">
            <iframe
              title={streamTitle}
              src={embedUrl}
              className="streamFrame"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="emptyState">
            <strong>Cloudflare Stream playback is not configured yet.</strong>
            <span>
              Add `VITE_STREAM_CUSTOMER_CODE`, `VITE_STREAM_LIVE_INPUT_ID`, and optionally
              `VITE_STREAM_TITLE` to the web deployment environment after the live input exists.
            </span>
          </div>
        )}
      </section>

      <section className="split splitWide">
        <div className="panel">
          <div className="panelHeader">
            <h2>OBS Ingest</h2>
            <span className="muted">Keep this in OBS/Cloudflare only.</span>
          </div>
          <div className="featureList">
            <div className="featureLine">
              <strong>Server</strong>
              <span>rtmps://live.cloudflare.com:443/live/</span>
            </div>
            <div className="featureLine">
              <strong>Stream key</strong>
              <span>Use the Cloudflare Stream Live Input key. Do not commit it.</span>
            </div>
            <div className="featureLine">
              <strong>OBS basics</strong>
              <span>CBR, AAC audio, 2 second keyframe interval, B-frames 0 for lower latency.</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <h2>Phone Playback</h2>
            <span className="muted">Private remote viewer path.</span>
          </div>
          <div className="featureList">
            <div className="featureLine">
              <strong>Best path</strong>
              <span>Open this vault page from the phone after signing in.</span>
            </div>
            <div className="featureLine">
              <strong>HLS URL</strong>
              <span>{hlsUrl || 'Available after Stream env vars are set.'}</span>
            </div>
            <div className="featureLine">
              <strong>Local-only option</strong>
              <span>Use a LAN HLS/RTMP relay only on trusted Wi-Fi when you do not want cloud playback.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
