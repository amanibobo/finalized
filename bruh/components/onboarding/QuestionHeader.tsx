import { StudyCitation } from '@/components/onboarding/StudyCitation';
import { mono, onboardingHeadingFontSize } from '@/constants/onboarding';
import { fonts } from '@/constants/fonts';
import type { ResolvedDrawerPayload } from '@/constants/lifestyleQuestions';
import { colors } from '@/constants/theme';
import { useWindowDimensions, StyleSheet, Text, View } from 'react-native';

type Props = {
  badge: string;
  title: string;
  /** Shown under the title (e.g. study source line). */
  citation?: string;
  /** Impact slider + "why" copy for the citation drawer. */
  drawer?: ResolvedDrawerPayload;
};

/**
 * Section badge (e.g. DIET) + question title — matches BasicsHeader layout.
 */
export function QuestionHeader({ badge, title, citation, drawer }: Props) {
  const { width } = useWindowDimensions();
  const headingSize = onboardingHeadingFontSize(width);
  const blockOffset = Math.min(44, Math.max(28, width * 0.075));

  return (
    <View style={[styles.block, { marginTop: blockOffset }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
      <Text style={[styles.heading, { fontSize: headingSize, lineHeight: headingSize + 10 }]}>
        {title}
      </Text>
      {citation && drawer ? <StudyCitation text={citation} payload={drawer} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.black,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: colors.black,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: fonts.regular,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
});
