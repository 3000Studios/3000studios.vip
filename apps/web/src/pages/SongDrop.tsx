import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '../styles/song-drop.css';

const API = 'https://apex-citadel-api.mr-jwswain.workers.dev';
type Mode = 'dry_run' | 'build_only' | 'publish';
type Job = {
  id: string;
  state: string;
  mode: Mode;
  originalName: string;
  progress: number;
  stage: string;
  updatedAt: string;
  error?: string;
};
const platforms = [
  'DistroKid package',
  'Full music video',
  'YouTube Shorts',
  'TikTok',
  'Instagram Reels',
  'Facebook Reels',
  'Spotify Canvas',
];

export function SongDrop() {
  const [file, setFile] = useState<File | null>(null),
    [mode, setMode] = useState<Mode>('dry_run'),
    [phrase, setPhrase] = useState(''),
    [jobs, setJobs] = useState<Job[]>([]),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API}/music/jobs`, { credentials: 'include' });
      if (!r.ok) throw Error(String(r.status));
      setJobs(((await r.json()).jobs || []).reverse());
    } catch {
      setNotice('Remote jobs require owner API access.');
    }
  }, []);
  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(load, 5000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [load]);
  async function upload() {
    if (!file) {
      setNotice('Choose a song first.');
      return;
    }
    if (mode === 'publish' && phrase !== 'PUBLISH 3000 STUDIOS') {
      setNotice('Type the exact publish confirmation.');
      return;
    }
    setBusy(true);
    setNotice('Encrypting and uploading…');
    try {
      const r = await fetch(`${API}/music/jobs`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': file.type || 'audio/wav',
          'x-file-name': file.name,
          'x-pipeline-mode': mode,
          'x-publish-confirmation': phrase,
        },
        body: file,
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || 'Upload failed');
      setNotice(`Job ${data.id.slice(0, 8)} queued successfully.`);
      setFile(null);
      setPhrase('');
      await load();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }
  const active = jobs.find((j) => !['complete', 'failed'].includes(j.state));
  return (
    <div className="sdStack">
      <motion.section
        className="sdHero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <span className="sdEyebrow">3000 STUDIOS RELEASE ENGINE</span>
          <h2>
            Drop one song.
            <br />
            <em>Launch everywhere.</em>
          </h2>
          <p>
            Remote beat-synced video, artwork, DistroKid packaging and social promotion—tracked from
            upload to every destination.
          </p>
        </div>
        <div className={`sdOrb ${active ? 'isRunning' : ''}`}>
          <span>{active ? `${active.progress || 0}%` : 'READY'}</span>
        </div>
      </motion.section>
      <section className="sdGrid">
        <motion.div className="cPanel sdUploader" layout>
          <div className="cPanelHead">
            <div>
              <h2>New release job</h2>
              <span className="cSub">WAV, FLAC, MP3 or M4A · up to 200 MB</span>
            </div>
          </div>
          <div className="cPanelBody">
            <button
              type="button"
              className={`sdDrop ${file ? 'hasFile' : ''}`}
              onClick={() => input.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setFile(e.dataTransfer.files[0] || null);
              }}
            >
              <input
                ref={input}
                hidden
                type="file"
                accept="audio/*,.wav,.flac"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <b>{file ? file.name : 'Choose or drop a song'}</b>
              <small>
                {file
                  ? `${(file.size / 1048576).toFixed(1)} MB · ready to upload`
                  : 'Tap here or drag the master file onto this panel'}
              </small>
              <i />
            </button>
            <div className="sdModes" role="radiogroup" aria-label="Pipeline mode">
              {(
                [
                  ['dry_run', 'Dry run', 'Preview only'],
                  ['build_only', 'Build', 'All assets'],
                  ['publish', 'Publish', 'Connected APIs'],
                ] as const
              ).map(([value, label, sub]) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === value}
                  className={mode === value ? 'active' : ''}
                  onClick={() => setMode(value)}
                  key={value}
                >
                  <b>{label}</b>
                  <small>{sub}</small>
                </button>
              ))}
            </div>
            <AnimatePresence>
              {mode === 'publish' && (
                <motion.label
                  className="sdConfirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  Public posting confirmation
                  <input
                    value={phrase}
                    onChange={(e) => setPhrase(e.target.value)}
                    placeholder="PUBLISH 3000 STUDIOS"
                  />
                </motion.label>
              )}
            </AnimatePresence>
            <button className="cBtn primary sdLaunch" disabled={busy} onClick={upload}>
              {busy ? 'Uploading…' : 'Start remote pipeline'}
              <span>→</span>
            </button>
            <p className="sdNotice" role="status">
              {notice}
            </p>
          </div>
        </motion.div>
        <div className="cPanel">
          <div className="cPanelHead">
            <div>
              <h2>Destination display</h2>
              <span className="cSub">What this flow prepares and delivers</span>
            </div>
          </div>
          <div className="cPanelBody sdPlatforms">
            {platforms.map((p, i) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                <b>{p}</b>
                <i className={active && active.progress > (i + 1) * 12 ? 'done' : ''} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="cPanel">
        <div className="cPanelHead">
          <div>
            <h2>Live job timeline</h2>
            <span className="cSub">Refreshes every five seconds</span>
          </div>
          <button className="cBtn sm ghost" onClick={load}>
            Refresh
          </button>
        </div>
        <div className="cPanelBody sdJobs">
          <AnimatePresence initial={false}>
            {jobs.length ? (
              jobs.map((j) => (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  key={j.id}
                  className={`sdJob state-${j.state}`}
                >
                  <div className="sdJobTop">
                    <div>
                      <b>{j.originalName}</b>
                      <small>{j.stage}</small>
                    </div>
                    <strong>{j.progress || 0}%</strong>
                  </div>
                  <div className="sdProgress">
                    <motion.i initial={{ width: 0 }} animate={{ width: `${j.progress || 0}%` }} />
                  </div>
                  <footer>
                    <span>{j.mode.replace('_', ' ')}</span>
                    <span>{j.state}</span>
                    <time>{new Date(j.updatedAt).toLocaleString()}</time>
                  </footer>
                </motion.article>
              ))
            ) : (
              <div className="sdEmpty">
                <span>♫</span>
                <b>No remote jobs yet</b>
                <small>Your first release will appear here.</small>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
