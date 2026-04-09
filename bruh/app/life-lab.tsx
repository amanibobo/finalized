import { mono, onboarding } from '@/constants/onboarding';
import { fonts } from '@/constants/fonts';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRef, useState } from 'react';
import LongevityReportContent, { REPORT_SECTIONS } from '@/components/LongevityReportContent';
import DynamicReportContent from '@/components/DynamicReportContent';
import { generateAndShareReport } from '@/utils/generateReport';
import { generateLongevityReport } from '@/utils/api';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

const ICON_PROFILE = require('@/assets/images/icon_profile.png');
const ICON_DOCS = require('@/assets/images/icon_docs.png');
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const GAUGE_MIN = 34;
const GAUGE_MAX = 98;

const ACCENT_YELLOW = '#FFD60A';
const METRIC_RED = '#E53935';
const TRACK_GRAY = '#E0E0E0';
const SYNC_BANNER_BG = '#F5ECD8';

// ── Gauge helpers ─────────────────────────────────────────────────────────────
const GAUGE_SIZE = 280;
const STROKE = 5;
const R = GAUGE_SIZE / 2 - STROKE;
const CX = GAUGE_SIZE / 2;
const CY = GAUGE_SIZE / 2;
// Arc spans 270°, starting at bottom-left (135°) going clockwise to bottom-right (45° = 405°)
const START_DEG = 135;
const SWEEP_DEG = 270;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const large = sweep > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

type TabId = 'gauge' | 'plan';
type IonName = ComponentProps<typeof Ionicons>['name'];

const TABS: { id: TabId; icon: IonName }[] = [
  { id: 'gauge', icon: 'speedometer-outline' },
  { id: 'plan', icon: 'book-outline' },
];

function LifeExpectancyGauge({
  onPress,
  predictedAge,
  deltaYears,
}: {
  onPress: () => void;
  predictedAge: number;
  deltaYears: number;
}) {
  const progress = Math.max(0, Math.min(1, (predictedAge - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)));
  const endDeg = START_DEG + SWEEP_DEG * progress;
  const trackPath = describeArc(CX, CY, R, START_DEG, START_DEG + SWEEP_DEG);
  const progressPath = describeArc(CX, CY, R, START_DEG, endDeg);
  const knob = polar(CX, CY, R, endDeg);
  const labelStart = polar(CX, CY, R - 20, START_DEG);
  const labelEnd = polar(CX, CY, R - 20, START_DEG + SWEEP_DEG);

  return (
    <Pressable style={styles.gaugeWrap} onPress={() => { lightImpact(); onPress(); }} accessibilityRole="button">
      <View style={styles.gaugeContainer}>
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} style={styles.gaugeSvg}>
          {/* Track */}
          <Path d={trackPath} stroke={TRACK_GRAY} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
          {/* Progress */}
          <Path d={progressPath} stroke={colors.black} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
          {/* Knob */}
          <Circle cx={knob.x} cy={knob.y} r={7} fill={colors.white} stroke={colors.black} strokeWidth={2} />
        </Svg>

        {/* Min / max labels */}
        <Text style={[styles.gaugeRangeLabel, { position: 'absolute', left: labelStart.x - 14, top: labelStart.y + 12 }]}>
          {GAUGE_MIN}
        </Text>
        <Text style={[styles.gaugeRangeLabel, { position: 'absolute', left: labelEnd.x - 14, top: labelEnd.y + 12 }]}>
          {GAUGE_MAX}
        </Text>

        {/* Centre content */}
        <View style={styles.gaugeCentre} pointerEvents="none">
          <Text style={styles.gaugeEyebrow}>LIFE EXPECTANCY</Text>
          <Text style={styles.gaugeMain}>{predictedAge.toFixed(1)} yrs</Text>
          <View style={styles.deltaRow}>
            <View style={styles.deltaBadge}>
              <Text style={styles.deltaBadgeText}>
                {deltaYears >= 0 ? '+' : ''}{deltaYears.toFixed(1)} yrs
              </Text>
            </View>
          </View>
          <Text style={styles.deltaCaption}>vs. population baseline</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function LifeLabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));
  const [tab, setTab] = useState<TabId>('gauge');
  const [showContents, setShowContents] = useState(false);
  const [showLifeExpModal, setShowLifeExpModal] = useState(false);
  const reportScrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const predictionResult = useOnboardingStore((s) => s.prediction);
  const predictionError  = useOnboardingStore((s) => s.error);
  const answers          = useOnboardingStore((s) => s.answers);
  const report           = useOnboardingStore((s) => s.report);
  const setReport        = useOnboardingStore((s) => s.setReport);
  const firstName        = useOnboardingStore((s) => s.answers.first_name);

  const predictedAge = predictionResult?.prediction.predicted_death_age ?? 83;
  const deltaYears   = predictionResult?.prediction.years_vs_baseline ?? 0;

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const { report: data } = await generateLongevityReport(answers);
      setReport(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to generate report.');
    } finally {
      setReportLoading(false);
    }
  };

  const onTab = (id: TabId) => {
    lightImpact();
    setTab(id);
    if (id === 'plan' && !report && !reportLoading) {
      fetchReport();
    }
  };

  const tabBarBottom = Math.max(insets.bottom, 4);

  return (
    <SafeAreaView style={[styles.safe, tab === 'plan' && { backgroundColor: colors.white }]} edges={['top']}>
      <StatusBar style="dark" />
      <View style={[styles.root, { paddingHorizontal: pad }]}>
        {tab === 'gauge' && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>The Life Lab</Text>
            <View style={styles.headerIcons}>
              <Pressable hitSlop={10} onPress={() => lightImpact()} accessibilityLabel="Notifications">
                <Ionicons name="notifications-outline" size={26} color={colors.black} />
              </Pressable>
              <Pressable hitSlop={10} onPress={() => lightImpact()} accessibilityLabel="Menu">
                <Ionicons name="menu-outline" size={28} color={colors.black} />
              </Pressable>
            </View>
          </View>
        )}

        {tab === 'gauge' ? (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 72 + tabBarBottom }]}
              showsVerticalScrollIndicator={false}>
              <LifeExpectancyGauge
                onPress={() => setShowLifeExpModal(true)}
                predictedAge={predictedAge}
                deltaYears={deltaYears}
              />

              <View style={styles.gettingStarted}>
                <Text style={styles.gettingStartedEyebrow}>GETTING STARTED</Text>
                <View style={styles.gsListRow}>
                  {/* Single connected icon strip */}
                  <View style={styles.gsStrip}>
                    <Pressable style={styles.gsStripIcon} onPress={() => router.push('/health-profile')}>
                      <Ionicons name="checkmark" size={22} color={colors.primary} />
                    </Pressable>
                    <View style={styles.gsStripDivider} />
                    <Pressable style={[styles.gsStripIcon, { marginTop: 24 }]} onPress={() => onTab('plan')}>
                      <View style={styles.gsYellowCircle}>
                        <Ionicons name="book-outline" size={18} color={colors.black} />
                      </View>
                    </Pressable>
                  </View>
                  {/* Text labels */}
                  <View style={styles.gsLabels}>
                    <Pressable style={styles.gsLabelRow} onPress={() => router.push('/health-profile')}>
                      <Text style={[styles.gsTitle, styles.gsTitleDim]}>Add Medical History</Text>
                      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
                    </Pressable>
                    <Pressable style={styles.gsLabelRow} onPress={() => onTab('plan')}>
                      <Text style={[styles.gsTitle, styles.gsTitleBold]}>View Longevity Plan</Text>
                      <Ionicons name="chevron-forward" size={18} color={colors.white} />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.dashboard}>
                <View style={styles.cardWhite}>
                  <View style={styles.metricBlock}>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricEyebrow}>STEPS</Text>
                      <View style={styles.metricValueRow}>
                        <Ionicons name="footsteps-outline" size={20} color={METRIC_RED} />
                        <Text style={styles.metricValue}>0</Text>
                        <Text style={styles.metricSuffix}>/10k</Text>
                      </View>
                      <View style={styles.trackOuter}>
                        <View style={styles.trackLine} />
                        <View style={styles.trackKnob} />
                      </View>
                    </View>
                  </View>
                  <View style={[styles.metricBlock, styles.metricBlockDivider]}>
                    <View style={styles.metricContent}>
                      <Text style={styles.metricEyebrow}>SLEEP</Text>
                      <View style={styles.metricValueRow}>
                        <Ionicons name="bed-outline" size={20} color={METRIC_RED} />
                        <Text style={styles.metricValue}>0h</Text>
                        <Text style={styles.metricSuffix}>/8hr</Text>
                      </View>
                      <View style={styles.trackOuter}>
                        <View style={styles.trackLine} />
                        <View style={styles.trackKnob} />
                      </View>
                    </View>
                  </View>
                  <Pressable
                    style={styles.syncBanner}
                    onPress={() => lightImpact()}
                    accessibilityRole="button"
                    accessibilityLabel="Enable Apple Health">
                    <Ionicons name="sync-outline" size={20} color={colors.primary} />
                    <Text style={styles.syncBannerText}>
                      <Text style={styles.syncLink}>Enable Apple Health</Text>
                      <Text style={styles.syncRest}> to sync your data.</Text>
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.halfRow}>
                  <Pressable style={[styles.cardWhite, styles.cardHalf]} onPress={() => router.push('/health-profile')}>
                    <Text style={styles.smallCardTitle}>Health Profile</Text>
                    <Image source={ICON_PROFILE} style={styles.cardArtProfile} resizeMode="contain" />
                  </Pressable>
                  <Pressable style={[styles.cardWhite, styles.cardHalf]} onPress={() => router.push('/document-vault')}>
                    <Text style={styles.smallCardTitle}>Document Vault</Text>
                    <Image source={ICON_DOCS} style={styles.cardArtDocs} resizeMode="contain" />
                  </Pressable>
                </View>

                <View style={styles.cardWhite}>
                  <View style={styles.todosHeader}>
                    <Text style={styles.todosEyebrow}>TO-DOS</Text>
                    <Ionicons name="list-outline" size={20} color={onboarding.unitGray} />
                  </View>
                  <View style={styles.todosColumns}>
                    <View style={styles.todosCol}>
                      <View style={styles.todosNumRow}>
                        <Ionicons name="notifications" size={18} color={METRIC_RED} />
                        <Text style={styles.todosNum}>0</Text>
                      </View>
                      <Text style={styles.todosLabel}>Due</Text>
                    </View>
                    <View style={styles.todosCol}>
                      <View style={styles.todosNumRow}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                        <Text style={styles.todosNum}>0</Text>
                      </View>
                      <Text style={styles.todosLabel}>Completed</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <Pressable
              style={[styles.fab, { bottom: 44 + tabBarBottom }]}
              onPress={() => { lightImpact(); router.push('/ai-concierge'); }}
              accessibilityLabel="Chat">
              <Ionicons name="chatbubble-outline" size={26} color={colors.black} />
            </Pressable>
          </>
        ) : (
          <>
            {reportLoading ? (
              <View style={styles.refreshOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Generating your report…</Text>
              </View>
            ) : reportError ? (
              <View style={styles.refreshOverlay}>
                <Text style={styles.reportErrorText}>{reportError}</Text>
                <Pressable style={styles.retryBtn} onPress={fetchReport}>
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                ref={reportScrollRef}
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 96 + tabBarBottom }]}
                showsVerticalScrollIndicator={false}>
                {report ? (
                  <DynamicReportContent
                    report={report}
                    firstName={firstName}
                    onSectionLayout={(title, y) => { sectionOffsets.current[title] = y; }}
                  />
                ) : (
                  <LongevityReportContent
                    onSectionLayout={(title, y) => { sectionOffsets.current[title] = y; }}
                  />
                )}
              </ScrollView>
            )}

            {/* PDF / Refresh / Contents bar sits just above the tab bar */}
            <View style={[styles.reportActions, { bottom: tabBarBottom + 32 }]}>
              <Pressable style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.8 }]} onPress={() => { lightImpact(); generateAndShareReport(report, firstName); }}>
                <Ionicons name="document-outline" size={17} color={colors.black} />
                <Text style={styles.reportBtnText}>PDF</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  if (reportLoading) return;
                  lightImpact();
                  fetchReport();
                }}>
                <Ionicons name="refresh-outline" size={17} color={colors.black} />
                <Text style={styles.reportBtnText}>Refresh</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.reportBtn, pressed && { opacity: 0.8 }]} onPress={() => { lightImpact(); setShowContents(true); }}>
                <Ionicons name="list-outline" size={17} color={colors.black} />
                <Text style={styles.reportBtnText}>Contents</Text>
              </Pressable>
            </View>
          </>
        )}

        <View style={[styles.tabBar, { paddingBottom: tabBarBottom }]}>
          {TABS.map(({ id, icon }) => {
            const active = tab === id;
            return (
              <Pressable
                key={id}
                style={styles.tabItem}
                onPress={() => onTab(id)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}>
                <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                  <Ionicons name={icon} size={19} color={active ? colors.white : colors.black} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Life Expectancy modal */}
        <Modal
          visible={showLifeExpModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowLifeExpModal(false)}>
          <Pressable style={styles.leModalOverlay} onPress={() => setShowLifeExpModal(false)}>
            <Pressable style={styles.leModalSheet} onPress={e => e.stopPropagation()}>
              <Text style={styles.leModalTitle}>Life Expectancy</Text>

              <Text style={styles.leModalBody}>
                {'Your predicted death age is '}
                <Text style={styles.leModalBold}>{predictedAge.toFixed(1)}</Text>
                {predictionResult?.prediction.predicted_death_date
                  ? ` (${predictionResult.prediction.predicted_death_date})`
                  : ''}
                {'. This is based on your lifestyle survey, anchored to SSA actuarial life tables. It updates as you log more health data.'}
              </Text>
              {predictionError ? (
                <Text style={[styles.leModalBody, { color: '#D9363E', fontSize: 13 }]}>
                  {'Note: using default values — backend unreachable.'}
                </Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [styles.leOkBtn, pressed && { opacity: 0.85 }]}
                onPress={() => { lightImpact(); setShowLifeExpModal(false); }}>
                <Text style={styles.leOkBtnText}>OK</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Contents overlay */}
        <Modal
          visible={showContents}
          animationType="fade"
          transparent
          onRequestClose={() => setShowContents(false)}>
          <Pressable style={styles.contentsOverlay} onPress={() => setShowContents(false)}>
            <Pressable style={styles.contentsSheet} onPress={e => e.stopPropagation()}>
              <View style={styles.contentsHeader}>
                <Text style={styles.contentsEyebrow}>MY LONGEVITY REPORT</Text>
                <Pressable hitSlop={12} onPress={() => { lightImpact(); setShowContents(false); }}>
                  <Ionicons name="close" size={22} color={colors.white} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {REPORT_SECTIONS.map(title => (
                  <Pressable
                    key={title}
                    style={({ pressed }) => [styles.contentsItem, pressed && { opacity: 0.6 }]}
                    onPress={() => {
                      lightImpact();
                      setShowContents(false);
                      const y = sectionOffsets.current[title] ?? 0;
                      setTimeout(() => {
                        reportScrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
                      }, 150);
                    }}>
                    <Text style={styles.contentsItemText}>{title}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  root: {
    flex: 1,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.regular,
    fontSize: 26,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.4,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 40,
  },
  gaugeWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  gaugeContainer: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
  },
  gaugeSvg: {},
  gaugeCentre: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  gaugeRangeLabel: {
    fontFamily: mono,
    fontSize: 12,
    color: onboarding.unitGray,
    width: 28,
    textAlign: 'center',
  },
  gaugeEyebrow: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: onboarding.unitGray,
  },
  gaugeMain: {
    fontFamily: fonts.regular,
    fontSize: 44,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: -1,
    marginTop: 4,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deltaBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deltaBadgeText: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  deltaCaption: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '400',
    color: colors.black,
    marginTop: 4,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    backgroundColor: colors.black,
  },
  gettingStarted: {
    backgroundColor: colors.primary,
    borderRadius: radii.sheet,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 10,
  },
  gettingStartedEyebrow: {
    fontFamily: fonts.regular,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    color: colors.white,
    marginBottom: 8,
  },
  gsListRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  gsStrip: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
    alignItems: 'center',
    paddingVertical: 10,
    width: 38,
    overflow: 'visible',
  },
  gsStripIcon: {
    width: 38,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gsStripDivider: {
    width: 1,
    height: 1,
  },
  gsYellowCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT_YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gsLabels: {
    flex: 1,
    justifyContent: 'space-around',
  },
  gsLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gsTitle: {
    fontFamily: fonts.regular,
    fontSize: 17,
    fontWeight: '500',
    color: colors.white,
  },
  gsTitleDim: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '400',
  },
  gsTitleBold: {
    fontWeight: '900',
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  leModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  leModalSheet: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 14,
  },
  leModalTitle: {
    fontFamily: fonts.regular,
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
    letterSpacing: -0.3,
  },
  leWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leWarningText: {
    fontFamily: mono,
    fontSize: 13,
    color: '#D9363E',
    flex: 1,
    flexShrink: 1,
  },
  leModalBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.black,
    lineHeight: 23,
    textAlign: 'center',
  },
  leModalBold: {
    fontWeight: '700',
  },
  leOkBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  leOkBtnText: {
    fontFamily: mono,
    fontSize: 17,
    fontWeight: '600',
    color: colors.black,
  },
  contentsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  contentsSheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 28,
    paddingBottom: 48,
    maxHeight: '85%',
  },
  contentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  contentsEyebrow: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  contentsItem: {
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  contentsItemText: {
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '400',
    color: colors.white,
    letterSpacing: -0.2,
  },
  refreshOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
  },
  reportErrorText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#D9363E',
    textAlign: 'center',
    lineHeight: 21,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryBtnText: {
    fontFamily: mono,
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  reportActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.cream,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    paddingVertical: 11,
  },
  reportBtnText: {
    fontFamily: mono,
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.cream,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.0)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 1,
    paddingBottom: 1,
  },
  tabIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconWrapActive: {
    backgroundColor: colors.black,
  },
  dashboard: {
    marginTop: 20,
    gap: 12,
  },
  cardWhite: {
    backgroundColor: colors.white,
    borderRadius: radii.sheet,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  halfRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  cardHalf: {
    flex: 1,
    minHeight: 110,
    overflow: 'hidden',
  },
  cardArtProfile: {
    position: 'absolute',
    bottom: -14,
    right: -14,
    width: 60,
    height: 60,
  },
  cardArtDocs: {
    position: 'absolute',
    bottom: -14,
    right: -12,
    width: 60,
    height: 60,
  },
  metricBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metricBlockDivider: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  metricIcon: {
    marginTop: 4,
  },
  metricContent: {
    flex: 1,
    minWidth: 0,
  },
  metricEyebrow: {
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.black,
    marginBottom: 6,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  metricValue: {
    fontFamily: fonts.regular,
    fontSize: 32,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.5,
  },
  metricSuffix: {
    fontFamily: mono,
    fontSize: 15,
    fontWeight: '400',
    color: onboarding.unitGray,
  },
  trackOuter: {
    position: 'relative',
    height: 14,
    justifyContent: 'center',
  },
  trackLine: {
    height: 4,
    borderRadius: 2,
    backgroundColor: TRACK_GRAY,
    width: '100%',
  },
  trackKnob: {
    position: 'absolute',
    left: 0,
    top: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: METRIC_RED,
    borderWidth: 2,
    borderColor: colors.white,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: SYNC_BANNER_BG,
    borderRadius: radii.control,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 16,
  },
  syncBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.black,
  },
  syncLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  syncRest: {
    color: colors.black,
    fontWeight: '400',
  },
  smallCardTitle: {
    fontFamily: fonts.regular,
    fontSize: 17,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  todosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  todosEyebrow: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: colors.black,
  },
  todosColumns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  todosCol: {
    alignItems: 'center',
    gap: 4,
  },
  todosNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todosNum: {
    fontFamily: fonts.regular,
    fontSize: 34,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -1,
  },
  todosLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '400',
    color: colors.black,
  },
});
