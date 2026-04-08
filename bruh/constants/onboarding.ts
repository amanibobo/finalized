import { fonts } from './fonts';

/** Diatype Mono — category badges, study/source lines, button labels, unit labels, pills. */
export const mono = fonts.mono;

/**
 * Responsive question title size for Basics + lifestyle flows.
 * (Previously ~22–30; larger min/max + scale for readability.)
 */
export function onboardingHeadingFontSize(screenWidth: number): number {
  return Math.min(38, Math.max(28, screenWidth * 0.084));
}

/** Init screen hero — larger than onboarding question titles. */
export function initHeroHeadingFontSize(screenWidth: number): number {
  return Math.min(56, Math.max(40, screenWidth * 0.118));
}

export const onboarding = {
  unitGray: '#8E8E8E',
  toggleSelectedBg: '#E8DCCD',
} as const;
