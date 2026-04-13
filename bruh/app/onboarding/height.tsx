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

type Unit = 'ft' | 'm';

export default function OnboardingHeightScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const setAnswers = useOnboardingStore((s) => s.setAnswers);
  const [unit, setUnit] = useState<Unit>('ft');
  const [feet, setFeet] = useState('5');
  const [inches, setInches] = useState('10');
  const [meters, setMeters] = useState('1.75');

  const canContinue = useMemo(() => {
    if (unit === 'm') {
      return meters.trim().length > 0;
    }
    return feet.trim().length > 0 && inches.trim().length > 0;
  }, [unit, feet, inches, meters]);

  const setUnitFt = () => {
    lightImpact();
    setUnit('ft');
  };

  const setUnitM = () => {
    lightImpact();
    setUnit('m');
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
              <BasicsHeader title="What is your height?" />
            </Animated.View>
            <Animated.View entering={FadeIn.duration(200).delay(80)} style={styles.formMiddle}>
              <View style={styles.centerBlock}>
                <View style={styles.fieldBlock}>
                  {unit === 'ft' ? (
                    <View style={styles.row}>
                      <View style={[styles.inputShell, styles.half]}>
                        <TextInput
                          style={styles.input}
                          value={feet}
                          onChangeText={setFeet}
                          keyboardType="number-pad"
                          maxLength={2}
                          returnKeyType="next"
                        />
                        <Text style={styles.unit}>ft</Text>
                      </View>
                      <View style={[styles.inputShell, styles.half]}>
                        <TextInput
                          style={styles.input}
                          value={inches}
                          onChangeText={setInches}
                          keyboardType="number-pad"
                          maxLength={2}
                          returnKeyType="done"
                        />
                        <Text style={styles.unit}>in</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.inputShell}>
                      <TextInput
                        style={styles.input}
                        value={meters}
                        onChangeText={setMeters}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                      />
                      <Text style={styles.unit}>m</Text>
                    </View>
                  )}
                  <View style={styles.toggleRow}>
                    <Pressable
                      onPress={setUnitFt}
                      style={[styles.toggleChip, unit === 'ft' && styles.toggleOn]}>
                      <Text style={styles.toggleLabel}>Feet</Text>
                    </Pressable>
                    <Pressable
                      onPress={setUnitM}
                      style={[styles.toggleChip, unit === 'm' && styles.toggleOn]}>
                      <Text style={styles.toggleLabel}>Meters</Text>
                    </Pressable>
                  </View>
                </View>
                <View style={styles.gapBeforeContinue} />
                <ContinueButton
                  onPress={() => {
                    if (unit === 'ft') {
                      setAnswers({
                        height_value: [parseInt(feet, 10), parseInt(inches, 10)],
                        height_unit: 'ft_in',
                      });
                    } else {
                      setAnswers({
                        height_value: parseFloat(meters),
                        height_unit: 'm',
                      });
                    }
                    router.push('/onboarding/weight');
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
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  half: {
    flex: 1,
    minWidth: 0,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: radii.control,
    paddingLeft: 18,
    paddingRight: 14,
    paddingVertical: 14,
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
    paddingHorizontal: 20,
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
