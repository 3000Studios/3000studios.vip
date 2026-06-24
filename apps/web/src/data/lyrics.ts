export interface LyricLine {
  time: number;      // seconds from song start
  duration: number;  // how long it stays visible
  text: string;
  position?: 'left' | 'center' | 'right' | 'random';
}

// IMPORTANT: Do not invent copyrighted lyrics.
// Only add real project-owned or licensed lyrics here.
// For "Always Feel Like" — owner to provide final lyrics.
// Leave empty until real lyrics are supplied.
export const alwaysFeelLikeLyrics: LyricLine[] = [
  // Example structure (commented out until real lyrics provided):
  // { time: 12.5, duration: 3.2, text: "Always feel like...", position: "center" },
  // { time: 18.0, duration: 2.8, text: "Something new is coming through", position: "random" },
];

// Add more songs here as they are produced
export const songLyrics: Record<string, LyricLine[]> = {
  "always-feel-like": alwaysFeelLikeLyrics,
};
