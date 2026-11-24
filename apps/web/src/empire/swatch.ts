/** Gradient used where a card has no art of its own. */
export function swatch(i: number): string {
  const sets = [
    ['#f2c867', '#ff5a2c'],
    ['#9b6bff', '#3ee8ff'],
    ['#3df2a8', '#3ee8ff'],
    ['#ff3d7f', '#9b6bff'],
    ['#3ee8ff', '#f2c867'],
    ['#ff5a2c', '#9b6bff'],
  ];
  const [a, b] = sets[i % sets.length];
  return `radial-gradient(120% 90% at 85% 0%, ${a}55, transparent 60%), linear-gradient(150deg, ${b}33, #0a0810 70%)`;
}


export const SPOTIFY_ARTIST = 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik';
export const APPLE_ARTIST = 'https://music.apple.com/us/artist/3000-studios/6802721597';
export const YOUTUBE_CHANNEL = 'https://www.youtube.com/@3000Studio';
