import { BasicsHeader } from '@/components/onboarding/BasicsHeader';
import { ContinueButton } from '@/components/onboarding/ContinueButton';
import { OnboardingScreenWrapper } from '@/components/onboarding/OnboardingScreenWrapper';
import { mono, onboarding } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type Unit = 'lb' | 'kg';

export default function OnboardingWeightScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const setAnswers = useOnboardingStore((s) => s.setAnswers);
  const [unit, setUnit] = useState<Unit>('lb');
  const [pounds, setPounds] = useState('140');
  const [kilos, setKilos] = useState('63');

  const value = unit === 'lb' ? pounds : kilos;
  const setValue = unit === 'lb' ? setPounds : setKilos;

  const canContinue = useMemo(() => value.trim().length > 0, [value]);

  const setUnitLb = () => {
    lightImpact();
    setUnit('lb');
  };

  const setUnitKg = () => {
    lightImpact();
    setUnit('kg');
  };

  return (
    <OnboardingScreenWrapper>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View
            style={[
              styles.pageColumn,
              { minHeight: Math.max(windowHeight - 100, 420) },
            ]}>
            <Animated.View entering={FadeIn.duration(200)} style={styles.headerWrap}>
              <BasicsHeader title="What is your weight?" />
            </Animated.View>
            <Animated.View
              entering={FadeIn.duration(200).delay(80)}
              style={styles.formMiddle}>
              <View style={styles.centerBlock}>
                <View style={styles.fieldBlock}>
                  <View style={styles.inputShell}>
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={setValue}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                    />
                    <Text style={styles.unit}>{unit === 'lb' ? 'lbs' : 'kg'}</Text>
                  </View>
                  <View style={styles.toggleRow}>
                    <Pressable
                      onPress={setUnitLb}
                      style={[styles.toggleChip, unit === 'lb' && styles.toggleOn]}>
                      <Text style={styles.toggleLabel}>Pounds</Text>
                    </Pressable>
                    <Pressable
                      onPress={setUnitKg}
                      style={[styles.toggleChip, unit === 'kg' && styles.toggleOn]}>
                      <Text style={styles.toggleLabel}>Kilograms</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.gapBeforeContinue} />
                <ContinueButton
                  onPress={() => {
                    setAnswers({
                      weight_value: parseFloat(value),
                      weight_unit: unit,
                    });
                    router.push('/onboarding/first-name');
                  }}
                  disabled={!canContinue}
                />
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </OnboardingScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  pageColumn: {
    flexGrow: 1,
    width: '100%',
  },
  formMiddle: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
  },
  centerBlock: {
    width: '100%',
  },
  fieldBlock: {
    gap: 24,
    width: '100%',
  },
  gapBeforeContinue: {
    height: 16,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radii.control,
    paddingLeft: 22,
    paddingRight: 18,
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontWeight: '400',
    color: colors.black,
    minWidth: 0,
    textAlign: 'center',
  },
  unit: {
    fontFamily: mono,
    fontSize: 15,
    color: onboarding.unitGray,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  toggleChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.control,
  },
  toggleOn: {
    backgroundColor: onboarding.toggleSelectedBg,
  },
  toggleLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.black,
  },
  headerWrap: {
    paddingTop: 48,
  },
});
