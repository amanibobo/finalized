import { BasicsHeader } from '@/components/onboarding/BasicsHeader';
import { OnboardingScreenWrapper } from '@/components/onboarding/OnboardingScreenWrapper';
import { SelectionPill } from '@/components/onboarding/SelectionPill';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

/** Label → backend canonical value mapping. */
const RACES: { label: string; value: string }[] = [
  { label: 'Asian',                              value: 'asian' },
  { label: 'Black',                              value: 'black' },
  { label: 'Hispanic',                           value: 'hispanic' },
  { label: 'American Indian and Alaska Native',  value: 'american_indian_alaska_native' },
  { label: 'White',                              value: 'white' },
];

export default function OnboardingRaceScreen() {
  const router = useRouter();
  const setAnswer = useOnboardingStore((s) => s.setAnswer);

  const go = (value: string) => {
    setAnswer('race', value);
    router.push('/onboarding/us');
  };

  return (
    <OnboardingScreenWrapper>
      <View style={styles.flex}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.headerWrap}>
          <BasicsHeader title="What is your race?" />
        </Animated.View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {RACES.map(({ label, value }, i) => (
            <Animated.View key={value} entering={FadeIn.duration(200).delay(80 + i * 40)}>
              <SelectionPill label={label} onPress={() => go(value)} />
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
    marginTop: 12,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: 12,
    paddingBottom: 36,
  },
  headerWrap: {
    paddingTop: 48,
  },
});
