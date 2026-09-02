import { useMemo, useState } from 'react';

type Platform = 'youtube' | 'shorts' | 'tiktok' | 'instagram';
type VideoStyle = 'cinematic' | 'neon' | 'street' | 'surreal' | 'performance' | 'visualizer';

const styleLabels: Record<VideoStyle, string> = {
  cinematic: 'Cinematic story',
  neon: 'Neon stage',
  street: 'Street premiere',
  surreal: 'Surreal lyric world',
  performance: 'Artist performance',
  visualizer: 'Beat visualizer',
};

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube music video',
  shorts: 'YouTube Shorts',
  tiktok: 'TikTok',
  instagram: 'Instagram Reels',
};

const platformFormats: Record<Platform, string> = {
  youtube: '16:9 landscape, 1920x1080, full song, clean intro/outro',
  shorts: '9:16 vertical, 1080x1920, strongest hook first, under 60 seconds when possible',
  tiktok: '9:16 vertical, 1080x1920, fast captions, hook in first 2 seconds',
  instagram: '9:16 vertical, 1080x1920, polished captions, high-contrast cover frame',
};

const styleDirections: Record<VideoStyle, string> = {
  cinematic:
    'premium music-video lighting, camera movement, grounded locations, dramatic closeups, polished color grade',
  neon: 'black studio, animated LED walls, neon reflections, smoke, chrome details, audio-reactive light pulses',
  street:
    'night city energy, handheld motion, bold poster typography, performance cuts, flash photography accents',
  surreal:
    'dreamlike symbolic scenes, impossible rooms, lyric objects becoming real, smooth transitions, rich atmosphere',
  performance:
    'artist-led performance, closeups, crowd moments, stage lights, confident camera push-ins, clean editorial pacing',
  visualizer:
    'album art world, animated waveform, beat-synced particles, abstract 3D motion, readable lyric overlays',
};

function splitLyrics(lyrics: string) {
  return lyrics
    .split(/\n{2,}|\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 18);
}

function sectionName(index: number, total: number) {
  if (index === 0) return 'Intro / opening image';
  if (index === total - 1) return 'Final hook / outro';
  if (index === 1) return 'Verse one';
  if (index === 2) return 'Hook / chorus';
  if (index === 3) return 'Verse two';
  if (index === 4) return 'Bridge / switch-up';
  return `Scene ${index + 1}`;
}

function lyricImage(line: string) {
  const clean = line.replace(/[^\w\s']/g, '').trim();
  const words = clean.split(/\s+/).filter((word) => word.length > 3);
  const seed = words.slice(0, 7).join(' ') || 'the main lyric';
  return seed.toLowerCase();
}

function buildPlan({
  title,
  artist,
  lyrics,
  mood,
  style,
  platform,
}: {
  title: string;
  artist: string;
  lyrics: string;
  mood: string;
  style: VideoStyle;
  platform: Platform;
}) {
  const lines = splitLyrics(lyrics);
  const sourceLines = lines.length ? lines : ['Paste lyrics to generate scene-by-scene video prompts.'];
  const durationPerScene = platform === 'youtube' ? 12 : 4;
  const artistName = artist.trim() || '3000 Studios';
  const songTitle = title.trim() || 'Untitled song';
  const moodText = mood.trim() || 'confident, high-energy, polished';

  return sourceLines.map((line, index) => {
    const start = index * durationPerScene;
    const end = start + durationPerScene;
    const section = sectionName(index, sourceLines.length);
    const visualHook = lyricImage(line);
    return {
      id: `${index + 1}`.padStart(2, '0'),
      section,
      timing: `${start}s-${end}s`,
      lyric: line,
      prompt:
        `${styleLabels[style]} scene for "${songTitle}" by ${artistName}: ${visualHook}. ` +
        `${styleDirections[style]}. Mood: ${moodText}. ` +
        `${platformFormats[platform]}. No logos, no fake brands, no unreadable text, leave space for lyric captions.`,
      edit: index % 3 === 0 ? 'Slow push-in, cut on snare, lyric caption enters from bottom.' : index % 3 === 1 ? 'Match cut into movement, add quick flash on the last word.' : 'Hold the strongest frame, add beat pulse and clean caption emphasis.',
    };
  });
}

export function MusicVideoGenerator() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('3000 Studios');
  const [mood, setMood] = useState('cinematic, funny, bold, viral, expensive-looking');
  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [platform, setPlatform] = useState<Platform>('youtube');
  const [lyrics, setLyrics] = useState('');

  const plan = useMemo(
    () => buildPlan({ title, artist, lyrics, mood, style, platform }),
    [title, artist, lyrics, mood, style, platform],
  );

  const exportText = useMemo(() => {
    const songTitle = title.trim() || 'Untitled song';
    const artistName = artist.trim() || '3000 Studios';
    const scenes = plan
      .map(
        (scene) =>
          `${scene.id}. ${scene.section} (${scene.timing})\nLyric: ${scene.lyric}\nPrompt: ${scene.prompt}\nEdit: ${scene.edit}`,
      )
      .join('\n\n');
    return [
      `MUSIC VIDEO PLAN: ${songTitle} - ${artistName}`,
      `Format: ${platformLabels[platform]} | ${platformFormats[platform]}`,
      `Style: ${styleLabels[style]} | Mood: ${mood}`,
      '',
      scenes,
      '',
      `Thumbnail prompt: ${artistName} ${songTitle} official music video cover frame, ${styleDirections[style]}, bold readable title space, high contrast, premium music release artwork, ${mood}.`,
      '',
      `YouTube title: ${artistName} - ${songTitle} (Official Music Video)`,
      `Description starter: Watch the official ${songTitle} music video by ${artistName}. Stream more music, live shows, and 3000 Studios drops at https://3000studios.vip/`,
      'Tags: 3000 Studios, official music video, AI music video, new music, independent artist, lyric video',
      '',
      'Production order: generate cover frame, generate scenes, edit to beat, add lyric captions, color match, export vertical and landscape versions, upload with thumbnail.',
    ].join('\n');
  }, [artist, mood, plan, platform, style, title]);

  async function copyPlan() {
    await navigator.clipboard.writeText(exportText);
  }

  return (
    <div className="cStack musicVideoTool">
      <section className="cHero musicVideoHero">
        <div>
          <span className="cTag accent">Creator workflow</span>
          <h2>Music video generator</h2>
          <p>
            Turn lyrics into a scene-by-scene AI video plan with prompts, timing, captions,
            thumbnail copy, and upload metadata for YouTube, Shorts, TikTok, and Reels.
          </p>
        </div>
        <div className="cHeroActions">
          <button className="cBtn primary" type="button" onClick={() => void copyPlan()}>
            Copy full plan
          </button>
          <a className="cBtn ghost" href="/music" target="_blank" rel="noreferrer">
            Open music deck
          </a>
        </div>
      </section>

      <section className="cPanel">
        <div className="cPanelHead">
          <h2>Song setup</h2>
          <span className="cSub">Paste lyrics once, then copy prompts into Kaiber, Runway, Pika, or CapCut.</span>
        </div>
        <div className="cPanelBody">
          <div className="mvFormGrid">
            <label className="mvField">
              <span>Song title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Ride Smooth" />
            </label>
            <label className="mvField">
              <span>Artist</span>
              <input value={artist} onChange={(e) => setArtist(e.target.value)} />
            </label>
            <label className="mvField">
              <span>Visual style</span>
              <select value={style} onChange={(e) => setStyle(e.target.value as VideoStyle)}>
                {Object.entries(styleLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mvField">
              <span>Platform</span>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
                {Object.entries(platformLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mvField mvMood">
            <span>Mood / art direction</span>
            <input value={mood} onChange={(e) => setMood(e.target.value)} />
          </label>
          <label className="mvField">
            <span>Lyrics</span>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste the song lyrics here. Each line or paragraph becomes a video scene."
            />
          </label>
        </div>
      </section>

      <section className="mvWorkflow" aria-label="Music video workflow">
        {['Lyrics', 'Storyboard', 'AI clips', 'Beat edit', 'Upload'].map((step, index) => (
          <div className="mvWorkflowStep" key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>

      <section className="cPanel">
        <div className="cPanelHead">
          <h2>Scene prompts</h2>
          <span className="cSub">{plan.length} generated scenes</span>
        </div>
        <div className="cPanelBody">
          <div className="mvSceneGrid">
            {plan.map((scene) => (
              <article className="mvSceneCard" key={scene.id}>
                <div className="mvSceneTop">
                  <span>{scene.id}</span>
                  <strong>{scene.section}</strong>
                  <em>{scene.timing}</em>
                </div>
                <p className="mvLyric">{scene.lyric}</p>
                <p>{scene.prompt}</p>
                <small>{scene.edit}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cPanel">
        <div className="cPanelHead">
          <h2>Copy-ready export</h2>
          <span className="cSub">Use this as the production brief.</span>
        </div>
        <div className="cPanelBody">
          <textarea className="mvExport" readOnly value={exportText} />
        </div>
      </section>
    </div>
  );
}
