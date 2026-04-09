import { fonts } from '@/constants/fonts';
import { mono } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import {
  useOnboardingStore,
  type LongevityReport,
  type ReportItem,
  type ReportItemNextStep,
  type ReportItemGoal,
  type ReportItemFreq,
  type ReportItemHow,
  type ReportStep,
  type ReportMilestone,
} from '@/store/onboardingStore';
import { generateLongevityReport } from '@/utils/api';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type IonName = ComponentProps<typeof Ionicons>['name'];

const ACCENT    = colors.primary;
const WARN_RED  = '#D9363E';
const SECTION_BG = '#EBF9F2';

// ── Reusable sub-components ───────────────────────────────────────────────────

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}
function Paragraph({ children }: { children: string }) {
  return <Text style={styles.para}>{children}</Text>;
}
function SubHead({ children }: { children: string }) {
  return <Text style={styles.subHead}>{children}</Text>;
}
function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}
function EvidencePill({ label }: { label: string }) {
  return (
    <View style={styles.evidencePill}>
      <Text style={styles.evidencePillText}>Evidence: {label}</Text>
    </View>
  );
}
function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusBox}>
      <Text style={styles.statusLabel}>{label} </Text>
      <Text style={styles.statusText}>{value}</Text>
    </View>
  );
}
function Tag({ icon, label, color }: { icon: IonName; label: string; color: string }) {
  return (
    <View style={styles.tag}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

// ── Loading state ─────────────────────────────────────────────────────────────

function ReportLoading({ onCancel }: { onCancel: () => void }) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color={ACCENT} />
      <Text style={styles.loadingTitle}>Generating your report</Text>
      <Text style={styles.loadingBody}>
        The AI is analysing your health data and building a personalised longevity plan. This takes about 15–30 seconds.
      </Text>
      <Pressable onPress={onCancel} style={styles.cancelBtn}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function ReportError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.loadingWrap}>
      <Ionicons name="warning-outline" size={36} color={WARN_RED} />
      <Text style={styles.loadingTitle}>Couldn't generate report</Text>
      <Text style={styles.loadingBody}>{message}</Text>
      <Pressable onPress={onRetry} style={styles.retryBtn}>
        <Text style={styles.retryText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

// ── Report content ────────────────────────────────────────────────────────────

function ReportContent({ report, name }: { report: LongevityReport; name: string }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      {/* Title */}
      <Text style={styles.reportTitle}>{`${name}'s\nLongevity Report`}</Text>
      <Text style={styles.reportDate}>Last updated {today}</Text>
      <View style={styles.titleDivider} />

      {/* Your Journey */}
      <SectionTitle>Your Journey</SectionTitle>
      <Paragraph>{report.your_journey.intro}</Paragraph>
      {report.your_journey.milestones.map((m: ReportMilestone) => (
        <View key={m.title}>
          <View style={styles.milestoneRow}>
            <Ionicons
              name={m.done ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={m.done ? ACCENT : 'rgba(0,0,0,0.3)'}
            />
            <SubHead>{m.title}</SubHead>
          </View>
          <Paragraph>{m.body}</Paragraph>
        </View>
      ))}

      {/* Progress and Trends */}
      <SectionTitle>Progress and Trends</SectionTitle>
      <Paragraph>{report.progress_and_trends}</Paragraph>

      {/* Critical Findings */}
      <SectionTitle>Critical Findings</SectionTitle>
      <Paragraph>{report.critical_findings.intro}</Paragraph>
      {report.critical_findings.items.map((item: ReportItem) => (
        <Card key={item.title}>
          <Tag icon="warning-outline" label="Needs Attention" color={WARN_RED} />
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
        </Card>
      ))}

      {/* Positive Findings */}
      <SectionTitle>Positive Findings</SectionTitle>
      <Paragraph>{report.positive_findings.intro}</Paragraph>
      {report.positive_findings.items.map((item: ReportItemNextStep) => (
        <Card key={item.title}>
          <Tag icon="checkmark-circle" label="Strength" color={ACCENT} />
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
          <StatusRow label="Next Step:" value={item.next_step} />
          <StatusRow label="Status:" value={item.status} />
        </Card>
      ))}

      {/* Topics for Doctor */}
      <SectionTitle>Topics to Discuss with Your Doctor</SectionTitle>
      <Paragraph>{report.doctor_topics.intro}</Paragraph>
      {report.doctor_topics.items.map((item: ReportItemGoal) => (
        <Card key={item.title}>
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
          <StatusRow label="Goal of Discussion:" value={item.goal} />
        </Card>
      ))}

      {/* Hormone Analysis */}
      <SectionTitle>Hormone Analysis</SectionTitle>
      <Paragraph>{report.hormone_analysis}</Paragraph>

      {/* Genetics */}
      <SectionTitle>Genetics</SectionTitle>
      <Paragraph>{report.genetics}</Paragraph>

      {/* Roadmap */}
      <SectionTitle>What to Do Next — Your Roadmap</SectionTitle>
      <Paragraph>{report.roadmap.intro}</Paragraph>
      {report.roadmap.steps.map((step: ReportStep) => (
        <Card key={step.title}>
          <SubHead>{step.title}</SubHead>
          <Paragraph>{step.body}</Paragraph>
        </Card>
      ))}

      {/* Behavioral Goals */}
      <SectionTitle>Behavioral Goals</SectionTitle>
      <Paragraph>{report.behavioral_goals.intro}</Paragraph>
      {report.behavioral_goals.items.map((item: ReportItemFreq) => (
        <Card key={item.title}>
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
          <EvidencePill label={item.evidence} />
          <StatusRow label="Frequency:" value={item.frequency} />
        </Card>
      ))}

      {/* Diet */}
      <SectionTitle>Diet</SectionTitle>
      <Paragraph>{report.diet.intro}</Paragraph>
      {report.diet.items.map((item: ReportItemHow) => (
        <Card key={item.title}>
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
          <EvidencePill label={item.evidence} />
          <StatusRow label="How to Start:" value={item.how} />
        </Card>
      ))}

      {/* Supplements */}
      <SectionTitle>Supplements</SectionTitle>
      <Paragraph>{report.supplements.intro}</Paragraph>
      {report.supplements.items.map((item: ReportItem) => (
        <Card key={item.title}>
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
        </Card>
      ))}

      {/* Devices */}
      <SectionTitle>Devices & Equipment</SectionTitle>
      <Paragraph>{report.devices.intro}</Paragraph>
      {report.devices.items.map((item: ReportItem) => (
        <Card key={item.title}>
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
        </Card>
      ))}

      {/* Prescriptions */}
      <SectionTitle>Prescriptions</SectionTitle>
      <Paragraph>{report.prescriptions}</Paragraph>

      {/* Screenings */}
      <SectionTitle>Screenings</SectionTitle>
      <Paragraph>{report.screenings.intro}</Paragraph>
      {report.screenings.items.map((item: ReportItem) => (
        <Card key={item.title}>
          <SubHead>{item.title}</SubHead>
          <Paragraph>{item.body}</Paragraph>
        </Card>
      ))}
    </>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function LongevityReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));

  const answers  = useOnboardingStore((s) => s.answers);
  const report   = useOnboardingStore((s) => s.report);
  const setReport = useOnboardingStore((s) => s.setReport);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const name = answers.first_name ?? 'Your';

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const { report: generated } = await generateLongevityReport(answers);
      setReport(generated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if no cached report
  useEffect(() => {
    if (!report) fetchReport();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable hitSlop={12} onPress={() => { lightImpact(); router.back(); }}>
            <Ionicons name="chevron-back" size={28} color={colors.black} />
          </Pressable>
        </View>

        {/* Body */}
        {loading ? (
          <ReportLoading onCancel={() => { setLoading(false); router.back(); }} />
        ) : error ? (
          <ReportError message={error} onRetry={fetchReport} />
        ) : report ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
            showsVerticalScrollIndicator={false}>
            <ReportContent report={report} name={name} />
          </ScrollView>
        ) : null}

        {/* Bottom bar — only show when report is loaded */}
        {report && !loading && (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Pressable
              style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.8 }]}
              onPress={() => lightImpact()}>
              <Ionicons name="document-outline" size={18} color={colors.black} />
              <Text style={styles.bottomBtnText}>PDF</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.8 }]}
              onPress={() => { lightImpact(); fetchReport(); }}>
              <Ionicons name="refresh-outline" size={18} color={colors.black} />
              <Text style={styles.bottomBtnText}>Refresh</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  inner: { flex: 1, maxWidth: 600, width: '100%', alignSelf: 'center' },
  headerRow: { paddingTop: 4, paddingBottom: 4 },
  scroll: { flex: 1 },
  scrollContent: { gap: 14, paddingTop: 4 },

  // Loading / error
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontFamily: fonts.regular,
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  loadingBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(0,0,0,0.55)',
    textAlign: 'center',
    lineHeight: 22,
  },
  cancelBtn: { marginTop: 8 },
  cancelText: { fontFamily: mono, fontSize: 14, color: 'rgba(0,0,0,0.4)' },
  retryBtn: {
    marginTop: 8,
    backgroundColor: ACCENT,
    borderRadius: radii.control,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryText: { fontFamily: mono, fontSize: 15, fontWeight: '600', color: colors.black },

  // Report header
  reportTitle: {
    fontFamily: fonts.regular,
    fontSize: 32,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  reportDate: {
    fontFamily: mono,
    fontSize: 13,
    color: 'rgba(0,0,0,0.45)',
    marginTop: 4,
  },
  titleDivider: {
    height: 2,
    backgroundColor: ACCENT,
    borderRadius: 1,
    marginTop: 10,
  },

  // Milestone
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 2,
  },

  // Text
  sectionTitle: {
    fontFamily: fonts.regular,
    fontSize: 22,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.3,
    marginTop: 8,
  },
  subHead: {
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 4,
  },
  para: {
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(0,0,0,0.75)',
    lineHeight: 23,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.sheet,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  tagText: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '600',
  },
  statusBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  statusLabel: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
  },
  statusText: {
    fontFamily: mono,
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    flex: 1,
    flexShrink: 1,
  },
  evidencePill: {
    alignSelf: 'flex-start',
    backgroundColor: SECTION_BG,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginVertical: 2,
  },
  evidencePillText: {
    fontFamily: mono,
    fontSize: 11,
    color: ACCENT,
    fontWeight: '600',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ACCENT,
    borderRadius: radii.control,
    paddingVertical: 13,
  },
  bottomBtnText: {
    fontFamily: mono,
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
});
