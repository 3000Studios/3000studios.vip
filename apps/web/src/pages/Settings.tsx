import { useEffect, useMemo, useRef, useState } from 'react';
import { loadAudioPrefs, saveAudioPrefs } from '../lib/prefs';
import { Synth } from '../lib/synth';

export function Settings() {
  const synthRef = useRef<Synth | null>(null);
  const [prefs, setPrefs] = useState(loadAudioPrefs());
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new Synth();
    }
    saveAudioPrefs(prefs);
    synthRef.current.setVolumes(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!armed || !synthRef.current) return;
    const stop = synthRef.current.startAmbientPulse();
    return () => stop();
  }, [armed]);

  const reducedMotion = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const armAudio = async () => {
    if (!synthRef.current) {
      synthRef.current = new Synth();
    }
    await synthRef.current.resume();
    setArmed(true);
    synthRef.current.blip('sfx', 660, 140);
  };

  return (
    <div className="grid">
      <div className="panel">
        <div className="panelHeader">
          <h2>Audio Console</h2>
          <span className="muted">
            Default mute. Your choice is saved. {reducedMotion ? 'Reduced motion detected.' : ''}
          </span>
        </div>

        <div className="row">
          <button className="btn primary" onClick={armAudio} disabled={armed}>
            Arm Audio
          </button>
          <button className="btn" onClick={() => synthRef.current?.blip('sfx', 880, 120)} disabled={!armed}>
            SFX Blip
          </button>
          <button className="btn" onClick={() => synthRef.current?.blip('music', 220, 220)} disabled={!armed}>
            Music Pulse
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Mix</h2>
          <span className="muted">Tasteful. Powerful. Controlled.</span>
        </div>

        <div className="mix">
          <label className="toggle">
            <input
              type="checkbox"
              checked={prefs.musicEnabled}
              onChange={(e) => setPrefs({ ...prefs, musicEnabled: e.target.checked })}
            />
            <span>Music</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={prefs.musicVolume}
            onChange={(e) => setPrefs({ ...prefs, musicVolume: Number(e.target.value) })}
          />
        </div>

        <div className="mix">
          <label className="toggle">
            <input
              type="checkbox"
              checked={prefs.sfxEnabled}
              onChange={(e) => setPrefs({ ...prefs, sfxEnabled: e.target.checked })}
            />
            <span>SFX</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={prefs.sfxVolume}
            onChange={(e) => setPrefs({ ...prefs, sfxVolume: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
