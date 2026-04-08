import { FIRST_LIFESTYLE_STEP_ID } from '@/constants/lifestyleQuestions';
import { mono, onboarding, onboardingHeadingFontSize } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { useFlashPress } from '@/hooks/useFlashPress';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type IonName = ComponentProps<typeof Ionicons>['name'];

type Step = {
  num: string;
  accent: string;
  title: string;
  sub: string;
  icon: IonName;
};

const STEPS: Step[] = [
  {
    num: '1',
    accent: '#5B9FFF',
    title: 'Answer 30 Questions',
    sub: 'Establish your longevity baseline',
    icon: 'clipboard-outline',
  },
  {
    num: '2',
    accent: colors.primary,
    title: 'See Two Predictions',
    sub: 'See your current and possible death dates',
    icon: 'planet-outline',
  },
  {
    num: '3',
    accent: '#E86880',
    title: 'Access Your Life Lab',
    sub: 'Bridge the gap and live longer',
    icon: 'flask-outline',
  },
];

function GetStartedButton({ onPress }: { onPress: () => void }) {
  const { flash, handlePress } = useFlashPress(onPress);

  return (
    <Pressable
      style={[styles.cta, flash && styles.ctaFlash]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Get Started">
      <Text style={styles.ctaText}>Get Started →</Text>
    </Pressable>
  );
}

export default function ScienceIntroScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));
  const titleOffset = Math.min(44, Math.max(28, width * 0.075));
  const headlineSize = onboardingHeadingFontSize(width);

  const goNext = () => router.push(`/onboarding/lifestyle/${FIRST_LIFESTYLE_STEP_ID}`);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>
        <View style={styles.grid}>
          <View style={[styles.head, { marginTop: titleOffset + 60 }]}>
            <Text style={[styles.titleLine, { fontSize: headlineSize, lineHeight: headlineSize + 8 }]}>
              Basics set.
            </Text>
            <Text style={[styles.titleLine, { fontSize: headlineSize, lineHeight: headlineSize + 8 }]}>
              Next, the science.
            </Text>
          </View>

          <ScrollView
            style={styles.stepsScroll}
            contentContainerStyle={styles.stepsScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            <View style={styles.steps}>
              {STEPS.map((step) => (
                <View key={step.num} style={styles.stepRow}>
                  <View style={styles.rail}>
                    <Text style={[styles.railNum, { color: step.accent }]}>{step.num}</Text>
                    <View style={[styles.railLine, { backgroundColor: step.accent }]} />
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSub}>{step.sub}</Text>
                  </View>
                  <View style={styles.iconWrap}>
                    <Ionicons name={step.icon} size={40} color={step.accent} />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <GetStartedButton onPress={goNext} />
            {/* TEMP: remove — dev shortcut */}
            <Pressable
              style={styles.skipDev}
              onPress={() => router.push('/onboarding/analyzing')}
              hitSlop={10}>
              <Text style={styles.skipDevText}>Skip → Analyzing</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  inner: {
    flex: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    minHeight: 0,
  },
  grid: {
    flex: 1,
    minHeight: 0,
  },
  head: {
    width: '100%',
  },
  titleLine: {
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.4,
  },
  stepsScroll: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  stepsScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  /** CTA pinned to bottom of screen (above safe area) */
  footer: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 4,
    alignItems: 'center',
  },
  skipDev: {
    marginTop: 14,
    paddingVertical: 6,
  },
  skipDevText: {
    fontSize: 12,
    fontWeight: '400',
    color: onboarding.unitGray,
    textDecorationLine: 'underline',
  },
  steps: {
    gap: 28,
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rail: {
    alignItems: 'center',
    width: 28,
  },
  railNum: {
    fontSize: 24,
    fontWeight: '400',
  },
  railLine: {
    width: 3,
    height: 40,
    marginTop: 4,
    borderRadius: 2,
  },
  stepBody: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  stepTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 6,
  },
  stepSub: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.5)',
    lineHeight: 20,
  },
  iconWrap: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaText: {
    fontFamily: mono,
    fontSize: 17,
    fontWeight: '400',
    color: colors.black,
  },
  ctaFlash: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
});
