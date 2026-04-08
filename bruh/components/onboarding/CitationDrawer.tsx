import { mono } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = Math.min(620, WINDOW_HEIGHT * 0.88);

/** Slider palette — green accent */
const SLIDER = {
  track: 'rgba(9,226,125,0.18)',
  marker: '#09E27D',
  score: '#09E27D',
} as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  impactScore: number;
  impactDescription: string;
  whyImportant: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

function StaticImpactSlider({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));

  return (
    <View style={sliderStyles.wrap}>
      <View style={sliderStyles.scoreRow}>
        <View
          style={[
            sliderStyles.scoreAnchor,
            {
              left: `${clamped}%`,
              marginLeft: -22,
            },
          ]}>
          <Text style={sliderStyles.scoreText}>{clamped}</Text>
        </View>
      </View>
      <View style={sliderStyles.trackArea}>
        <View style={sliderStyles.track} />
        <View
          style={[
            sliderStyles.markerLine,
            {
              left: `${clamped}%`,
              marginLeft: -1,
            },
          ]}
        />
      </View>
      <View style={sliderStyles.ends}>
        <Text style={sliderStyles.endLabel}>0</Text>
        <Text style={sliderStyles.endLabel}>100</Text>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
  },
  scoreRow: {
    height: 36,
    position: 'relative',
    width: '100%',
  },
  scoreAnchor: {
    position: 'absolute',
    width: 44,
    alignItems: 'center',
    bottom: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '500',
    color: SLIDER.score,
    letterSpacing: -0.3,
  },
  trackArea: {
    position: 'relative',
    width: '100%',
    height: 14,
    justifyContent: 'center',
  },
  track: {
    height: 12,
    borderRadius: radii.track,
    backgroundColor: SLIDER.track,
    width: '100%',
  },
  markerLine: {
    position: 'absolute',
    width: 3,
    height: 22,
    borderRadius: 1,
    backgroundColor: SLIDER.marker,
    bottom: 0,
  },
  ends: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  endLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.black,
  },
});

/**
 * Bottom sheet: Impact Score (static slider) + why it matters + optional source link.
 */
export function CitationDrawer({
  visible,
  onClose,
  impactScore,
  impactDescription,
  whyImportant,
  sourceLabel,
  sourceUrl,
}: Props) {
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(SHEET_MAX_HEIGHT)).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(SHEET_MAX_HEIGHT);
    fade.setValue(0);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 28,
          stiffness: 280,
          mass: 0.85,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [visible, fade, translateY]);

  const close = () => {
    lightImpact();
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SHEET_MAX_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const openSource = () => {
    if (sourceUrl) {
      lightImpact();
      void Linking.openURL(sourceUrl);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[styles.scrim, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Dismiss" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: SHEET_MAX_HEIGHT,
              paddingBottom: Math.max(insets.bottom, 20),
              transform: [{ translateY }],
            },
          ]}
          accessibilityViewIsModal>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Impact Score</Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close">
              <Ionicons name="chevron-down" size={28} color={colors.black} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces>
            <StaticImpactSlider score={impactScore} />
            <Text style={styles.impactDesc}>{impactDescription}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Why is this important?</Text>
            <Text style={styles.body}>{whyImportant}</Text>

            {sourceLabel ? (
              <Pressable
                onPress={sourceUrl ? openSource : undefined}
                disabled={!sourceUrl}
                style={styles.sourceRow}
                accessibilityRole={sourceUrl ? 'link' : 'text'}
                accessibilityLabel={sourceUrl ? `Open source ${sourceLabel}` : undefined}>
                <Text style={styles.sourceText}>
                  Source: {sourceLabel}
                </Text>
                {sourceUrl ? (
                  <Ionicons name="open-outline" size={18} color="#09E27D" style={styles.sourceIcon} />
                ) : null}
              </Pressable>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.3,
  },
  scroll: {
    maxHeight: SHEET_MAX_HEIGHT - 100,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  impactDesc: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
    fontWeight: '400',
    marginTop: 16,
    marginBottom: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.12)',
    marginVertical: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.black,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.black,
    fontWeight: '400',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
    alignSelf: 'flex-start',
  },
  sourceText: {
    fontFamily: mono,
    fontSize: 15,
    fontWeight: '400',
    color: colors.black,
  },
  sourceIcon: {
    marginTop: 1,
  },
});
