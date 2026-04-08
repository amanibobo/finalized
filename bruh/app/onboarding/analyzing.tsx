import { ContinueButton } from '@/components/onboarding/ContinueButton';
import { mono, onboarding, onboardingHeadingFontSize } from '@/constants/onboarding';
import { colors } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { predictDeathClock } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type IonName = ComponentProps<typeof Ionicons>['name'];

const DATA_ROWS: { icon: IonName; text: string }[] = [
  { icon: 'document-text-outline', text: '1,217 longevity studies' },
  { icon: 'globe-outline', text: '53 million lifespans' },
  { icon: 'layers-outline', text: '11 petabytes of health data' },
];

const RESULT_ROWS: { label: string; pendingIcon: IonName }[] = [
  { label: 'Current Life Expectancy', pendingIcon: 'heart-outline' },
  { label: 'Possible Life Expectancy', pendingIcon: 'trending-up-outline' },
  { label: "Most Likely Ways You'll Die", pendingIcon: 'warning-outline' },
  { label: 'Biological Age', pendingIcon: 'leaf-outline' },
  { label: 'Longevity Plan', pendingIcon: 'book-outline' },
];

const monoData = Platform.select({
  ios: 'Menlo',
  default: 'monospace',
}) as string;

const CHAR_DELAY_MS = 28;
const PAUSE_BETWEEN_LINES_MS = 550;
const PAUSE_BEFORE_CROSSFADE_MS = 450;
const CROSSFADE_MS = 420;
const ROW_LOAD_MS = 820;

export default function AnalyzingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));
  const headingSize = onboardingHeadingFontSize(width) + 8;

  const comparingOpacity = useRef(new Animated.Value(1)).current;
  const resultsOpacity = useRef(new Animated.Value(0)).current;
  const transitionedRef = useRef(false);

  const [typedLines, setTypedLines] = useState(['', '', '']);
  const titleLineHeight = headingSize + 10;

  const [panel, setPanel] = useState<'comparing' | 'results'>('comparing');
  const [completedRows, setCompletedRows] = useState(0);

  // ── API call ────────────────────────────────────────────────────────────────
  const answers = useOnboardingStore((s) => s.answers);
  const setPrediction = useOnboardingStore((s) => s.setPrediction);
  const setError = useOnboardingStore((s) => s.setError);
  const apiCalledRef = useRef(false);

  useEffect(() => {
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;

    predictDeathClock(answers)
      .then((result) => {
        setPrediction(result);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Prediction failed';
        setError(message);
        // Still let the animation complete so UX isn't blocked.
        // life-lab.tsx will show the error state or fallback values.
      });
  }, []);

  // ── Typing animation ────────────────────────────────────────────────────────
  const allResultsComplete = completedRows >= RESULT_ROWS.length;

  useEffect(() => {
    let cancelled = false;
    const full = DATA_ROWS.map((r) => r.text);

    async function typeAll() {
      for (let li = 0; li < full.length; li++) {
        const text = full[li];
        for (let c = 1; c <= text.length; c++) {
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, CHAR_DELAY_MS));
          if (cancelled) return;
          setTypedLines((prev) => {
            const next = [...prev];
            next[li] = text.slice(0, c);
            return next;
          });
        }
        if (li < full.length - 1) {
          await new Promise((r) => setTimeout(r, PAUSE_BETWEEN_LINES_MS));
        }
      }
    }

    void typeAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const typingComplete = DATA_ROWS.every((row, i) => typedLines[i] === row.text);

  useEffect(() => {
    if (!typingComplete || transitionedRef.current || panel !== 'comparing') return;

    transitionedRef.current = true;
    const t = setTimeout(() => {
      Animated.timing(comparingOpacity, {
        toValue: 0,
        duration: CROSSFADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;
        setPanel('results');
        resultsOpacity.setValue(0);
        Animated.timing(resultsOpacity, {
          toValue: 1,
          duration: CROSSFADE_MS,
          useNativeDriver: true,
        }).start();
      });
    }, PAUSE_BEFORE_CROSSFADE_MS);

    return () => clearTimeout(t);
  }, [typingComplete, panel, comparingOpacity, resultsOpacity]);

  useEffect(() => {
    if (panel !== 'results') return;
    if (completedRows >= RESULT_ROWS.length) return;

    const t = setTimeout(() => {
      setCompletedRows((n) => n + 1);
    }, ROW_LOAD_MS);

    return () => clearTimeout(t);
  }, [panel, completedRows]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>
        <View style={styles.top}>
          <View style={styles.titleWrap}>
            <Text
              style={[
                styles.title,
                {
                  fontSize: headingSize,
                  lineHeight: titleLineHeight,
                  color: colors.black,
                },
              ]}>
              {allResultsComplete
                ? `Results ready in\nThe Life Lab`
                : 'Analyzing your responses'}
            </Text>
          </View>

          <View style={styles.panelStack}>
            {panel === 'comparing' ? (
              <Animated.View style={[styles.comparingPanel, { opacity: comparingOpacity }]}>
                <Text style={styles.comparing}>Comparing against:</Text>
                <View style={styles.dataList}>
                  {DATA_ROWS.map((row, i) => (
                    <View key={row.text} style={styles.dataRow}>
                      <Ionicons name={row.icon} size={22} color={colors.black} style={styles.dataIcon} />
                      <Text style={[styles.dataText, { fontFamily: monoData }]}>{typedLines[i]}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {panel === 'results' ? (
              <Animated.View style={[styles.resultsPanel, { opacity: resultsOpacity }]}>
                <View style={styles.resultList}>
                  {RESULT_ROWS.map((row, i) => {
                    const done = i < completedRows;
                    const loading = i === completedRows && completedRows < RESULT_ROWS.length;

                    return (
                      <View key={row.label} style={styles.resultRow}>
                        <View style={styles.resultIcon}>
                          {done ? (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                          ) : loading ? (
                            <ActivityIndicator size="small" color={colors.black} />
                          ) : (
                            <Ionicons name={row.pendingIcon} size={22} color={onboarding.unitGray} />
                          )}
                        </View>
                        <Text
                          style={[
                            styles.resultLabel,
                            !done && !loading && styles.resultLabelPending,
                          ]}>
                          {row.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <ContinueButton
            onPress={() => router.push('/life-lab')}
            label="Continue"
            disabled={!allResultsComplete}
          />
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
  },
  top: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'flex-start',
    paddingTop: 72,
  },
  titleWrap: {
    width: '100%',
    marginBottom: 60,
  },
  title: {
    fontWeight: '400',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  panelStack: {
    width: '100%',
    minHeight: 220,
  },
  comparingPanel: {
    width: '100%',
  },
  resultsPanel: {
    width: '100%',
  },
  comparing: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  dataList: {
    gap: 14,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dataIcon: {
    marginTop: 2,
  },
  dataText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: colors.black,
    lineHeight: 22,
  },
  resultList: {
    gap: 31,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultIcon: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultLabel: {
    flex: 1,
    fontFamily: mono,
    fontSize: 17,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 24,
  },
  resultLabelPending: {
    color: onboarding.unitGray,
    fontWeight: '400',
  },
  footer: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 4,
  },
});
