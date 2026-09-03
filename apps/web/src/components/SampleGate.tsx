import { useEffect } from 'react';
import { useGlobalMusic } from './GlobalMusic';
import { SAMPLE_SECONDS, hasFullAccess } from '../lib/commerce';

export function SampleGate() {
  const { currentTime, activeSong, pause, seekTo } = useGlobalMusic();
  const slug = activeSong?.slug;
  useEffect(() => {
    if (!slug) return;
    if (!hasFullAccess(slug) && currentTime >= SAMPLE_SECONDS) {
      pause();
      seekTo(SAMPLE_SECONDS);
    }
  }, [currentTime, slug, pause, seekTo]);
  return null;
}
