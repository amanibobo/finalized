import { OnboardingScreenWrapper } from '@/components/onboarding/OnboardingScreenWrapper';
import { QuestionHeader } from '@/components/onboarding/QuestionHeader';
import { SelectionPill } from '@/components/onboarding/SelectionPill';
import {
  DEFAULT_LIFESTYLE_CITATION,
  FIRST_LIFESTYLE_STEP_ID,
  getLifestyleStep,
  getNextLifestyleStepId,
  resolveDrawerPayload,
} from '@/constants/lifestyleQuestions';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { OnboardingAnswers } from '@/store/onboardingStore';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

export default function LifestyleQuestionScreen() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step: string }>();
  const config = getLifestyleStep(step);
  const setAnswer = useOnboardingStore((s) => s.setAnswer);

  if (!config) {
    return <Redirect href={`/onboarding/lifestyle/${FIRST_LIFESTYLE_STEP_ID}`} />;
  }

  const goNext = (selectedLabel: string) => {
    setAnswer(config.questionnaireKey as keyof OnboardingAnswers, selectedLabel);
    const nextId = getNextLifestyleStepId(config.id);
    if (nextId) {
      router.push(`/onboarding/lifestyle/${nextId}`);
    } else {
      router.push('/onboarding/analyzing');
    }
  };

  const drawer = resolveDrawerPayload(config);

  return (
    <OnboardingScreenWrapper>
      <View style={styles.flex}>
        {config.image ? (
          <Animated.View entering={FadeInRight.duration(350)} style={styles.illustrationWrap}>
            <Image
              source={{ uri: config.image }}
              style={styles.illustration}
              resizeMode="contain"
            />
          </Animated.View>
        ) : null}
        <Animated.View entering={FadeIn.duration(200)} style={styles.headerWrap}>
          <QuestionHeader
            badge={config.section}
            title={config.title}
            citation={config.citation ?? DEFAULT_LIFESTYLE_CITATION}
            drawer={drawer}
          />
        </Animated.View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {config.options.map((label, i) => (
            <Animated.View key={label} entering={FadeIn.duration(200).delay(i * 40)}>
              <SelectionPill label={label} onPress={() => goNext(label)} />
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
    position: 'relative',
    zIndex: 0,
  },
  headerWrap: {
    zIndex: 1,
    paddingTop: 70,
  },
  illustrationWrap: {
    position: 'absolute',
    top: -188,
    right: -26,
    width: 400,
    height: 400,
    zIndex: 0,
  },
  illustration: {
    width: 400,
    height: 400,
    borderRadius: 20,
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
    paddingBottom: 4,
  },
});
