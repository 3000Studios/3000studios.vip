import { featureSong } from '../data/music';
import { useGlobalMusic } from './GlobalMusic';

export function HeroFeaturePlayer() {
  const music = useGlobalMusic();
  const title = featureSong.title;
  const cover = featureSong.cover;
  const isThis =
    music.activeSong?.slug === 'taqueesha-cant-get-right' || music.activeTitle === title;

  const toggleFeature = () => {
    if (!isThis) {
      music.playTrack(featureSong.src, title);
      return;
    }
    music.toggle();
  };

  return (
    <div className="heroPlayer">
      <img className="heroPlayerArt" src={cover} alt={`${title} cover`} />
      <div className="heroPlayerMeta">
        <small>Homepage feature · tap play</small>
        <strong>{title}</strong>
        <div className="heroPlayerControls">
          <button type="button" className="heroPlayBtn" onClick={toggleFeature} aria-label={isThis && music.isPlaying ? 'Pause' : 'Play'}>
            {isThis && music.isPlaying ? 'Pause' : 'Play'}
          </button>
          <label className="heroVol">
            <span>Vol</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(music.volume * 100)}
              onChange={(e) => music.setVolume(Number(e.target.value) / 100)}
              aria-label="Volume"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
