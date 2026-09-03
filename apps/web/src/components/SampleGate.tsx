import { useEffect } from 'react';
import { useGlobalMusic } from './GlobalMusic';
import { SAMPLE_SECONDS, hasFullAccess } from '../lib/commerce';

export function SampleGate() {
  const music = useGlobalMusic();
  useEffect(() => {
    const slug = music.activeSong?.slug;
    if (!slug) return;
    if (!hasFullAccess(slug) && music.currentTime >= SAMPLE_SECONDS) {
      music.pause();
      music.seekTo(SAMPLE_SECONDS);
      window.dispatchEvent(new CustomEvent('3000-sample-ended', { detail: { slug } }));
    }
  }, [music, music.currentTime, music.activeSong?.slug]);
  return null;
}
