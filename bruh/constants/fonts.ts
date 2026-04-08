/**
 * Family names must match keys in `useFonts` in `app/_layout.tsx`.
 */
export const fonts = {
  /** Question titles and body default — Diatype Regular */
  regular: 'Diatype-Regular',
  /** Badges, citation/source lines, buttons (Continue, pills, etc.) — ABC Diatype Mono */
  mono: 'DiatypeMono',
} as const;

export const fontSources = {
  regular: require('../assets/fonts/ABCDiatype-Regular-Trial.otf'),
  mono: require('../assets/fonts/ABC Diatype Mono.otf'),
} as const;
