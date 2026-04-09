import { fonts } from '@/constants/fonts';
import { mono } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import type { LongevityReport, ReportItem, ReportItemFreq, ReportItemGoal, ReportItemHow, ReportItemNextStep, ReportMilestone, ReportStep } from '@/store/onboardingStore';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const ACCENT = colors.primary;
const SECTION_BG = '#EBF9F2';

type SectionLayoutCb = (title: string, y: number) => void;

function SectionTitle({ children, onLayout }: { children: string; onLayout?: SectionLayoutCb }) {
  return (
    <Text
      style={s.sectionTitle}
      onLayout={onLayout ? e => onLayout(children, e.nativeEvent.layout.y) : undefined}>
      {children}
    </Text>
  );
}
function Para({ children }: { children: string }) {
  return <Text style={s.para}>{children}</Text>;
}
function SubHead({ children }: { children: string }) {
  return <Text style={s.subHead}>{children}</Text>;
}

export default function DynamicReportContent({
  report,
  firstName,
  onSectionLayout,
}: {
  report: LongevityReport;
  firstName?: string;
  onSectionLayout?: SectionLayoutCb;
}) {
  const title = firstName ? `${firstName}'s\nLongevity Report` : 'Your\nLongevity Report';
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ── your_journey ─────────────────────────────────────────────────────────
  const journey = report.your_journey as any;
  const journeyIntro: string = journey?.intro ?? '';
  const milestones: ReportMilestone[] = Array.isArray(journey?.milestones) ? journey.milestones : [];

  // ── critical_findings ────────────────────────────────────────────────────
  const criticalFindings = report.critical_findings as any;
  const criticalIntro: string = criticalFindings?.intro ?? '';
  const criticalItems: ReportItem[] = Array.isArray(criticalFindings?.items) ? criticalFindings.items : [];

  // ── positive_findings ────────────────────────────────────────────────────
  const positiveFindings = report.positive_findings as any;
  const positiveIntro: string = positiveFindings?.intro ?? '';
  const positiveItems: ReportItemNextStep[] = Array.isArray(positiveFindings?.items) ? positiveFindings.items : [];

  // ── doctor_topics ────────────────────────────────────────────────────────
  const doctorTopics = report.doctor_topics as any;
  const doctorIntro: string = doctorTopics?.intro ?? '';
  const doctorItems: ReportItemGoal[] = Array.isArray(doctorTopics?.items) ? doctorTopics.items : [];

  // ── roadmap ───────────────────────────────────────────────────────────────
  const roadmap = report.roadmap as any;
  const roadmapIntro: string = roadmap?.intro ?? '';
  const roadmapSteps: ReportStep[] = Array.isArray(roadmap?.steps) ? roadmap.steps : [];

  // ── behavioral_goals ─────────────────────────────────────────────────────
  const behavioralGoals = report.behavioral_goals as any;
  const behavioralIntro: string = behavioralGoals?.intro ?? '';
  const behavioralItems: ReportItemFreq[] = Array.isArray(behavioralGoals?.items) ? behavioralGoals.items : [];

  // ── diet ──────────────────────────────────────────────────────────────────
  const diet = report.diet as any;
  const dietIntro: string = diet?.intro ?? '';
  const dietItems: ReportItemHow[] = Array.isArray(diet?.items) ? diet.items : [];

  // ── supplements ───────────────────────────────────────────────────────────
  const supplements = report.supplements as any;
  const supplementsIntro: string = supplements?.intro ?? '';
  const supplementItems: ReportItem[] = Array.isArray(supplements?.items) ? supplements.items : [];

  // ── devices ───────────────────────────────────────────────────────────────
  const devices = report.devices as any;
  const devicesIntro: string = devices?.intro ?? '';
  const deviceItems: ReportItem[] = Array.isArray(devices?.items) ? devices.items : [];

  // ── screenings ────────────────────────────────────────────────────────────
  const screenings = report.screenings as any;
  const screeningsIntro: string = screenings?.intro ?? '';
  const screeningItems: ReportItem[] = Array.isArray(screenings?.items) ? screenings.items : [];

  return (
    <View style={s.root}>
      {/* Title */}
      <Text style={s.reportTitle}>{title}</Text>
      <Text style={s.reportDate}>Last updated {dateStr}</Text>
      <View style={s.titleDivider} />

      {/* Your Journey */}
      <SectionTitle onLayout={onSectionLayout}>Your Journey</SectionTitle>
      {!!journeyIntro && <Para>{journeyIntro}</Para>}
      {milestones.map((m, i) => (
        <View key={i}>
          <SubHead>{m.title}</SubHead>
          <Para>{m.body}</Para>
        </View>
      ))}

      {/* Progress and Trends */}
      <SectionTitle onLayout={onSectionLayout}>Progress and Trends</SectionTitle>
      {!!report.progress_and_trends && <Para>{report.progress_and_trends}</Para>}

      {/* Critical Findings */}
      <SectionTitle onLayout={onSectionLayout}>Critical Findings</SectionTitle>
      {!!criticalIntro && <Para>{criticalIntro}</Para>}
      {criticalItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
        </View>
      ))}

      {/* Positive Findings */}
      <SectionTitle onLayout={onSectionLayout}>Positive Findings</SectionTitle>
      {!!positiveIntro && <Para>{positiveIntro}</Para>}
      {positiveItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
          {!!item.next_step && <Para>{`Next Step: ${item.next_step}`}</Para>}
        </View>
      ))}

      {/* Biomarker Goals placeholder */}
      <SectionTitle onLayout={onSectionLayout}>Biomarker Goals</SectionTitle>
      <Para>{"We can't set specific biomarker goals until you complete your first blood test. Once your results are in, this section will populate with your personalized targets."}</Para>

      {/* Doctor Topics */}
      <SectionTitle onLayout={onSectionLayout}>Topics to Discuss with Your Doctor</SectionTitle>
      {!!doctorIntro && <Para>{doctorIntro}</Para>}
      {doctorItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
          {!!item.goal && <Para>{`Goal of Discussion: ${item.goal}`}</Para>}
        </View>
      ))}

      {/* Hormone Analysis */}
      <SectionTitle onLayout={onSectionLayout}>Hormone Analysis</SectionTitle>
      {!!report.hormone_analysis && <Para>{report.hormone_analysis}</Para>}

      {/* Genetics */}
      <SectionTitle onLayout={onSectionLayout}>Genetics</SectionTitle>
      {!!report.genetics && <Para>{report.genetics}</Para>}

      {/* Roadmap */}
      <SectionTitle onLayout={onSectionLayout}>{"What to Do Next — Your Roadmap"}</SectionTitle>
      {!!roadmapIntro && <Para>{roadmapIntro}</Para>}
      {roadmapSteps.map((step, i) => (
        <View key={i}>
          <SubHead>{step.title}</SubHead>
          <Para>{step.body}</Para>
        </View>
      ))}

      {/* Behavioral Goals */}
      <SectionTitle onLayout={onSectionLayout}>Behavioral Goals</SectionTitle>
      {!!behavioralIntro && <Para>{behavioralIntro}</Para>}
      {behavioralItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
          {!!item.frequency && <Para>{`Frequency: ${item.frequency}`}</Para>}
        </View>
      ))}

      {/* Diet */}
      <SectionTitle onLayout={onSectionLayout}>Diet</SectionTitle>
      {!!dietIntro && <Para>{dietIntro}</Para>}
      {dietItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
          {!!item.how && <Para>{`How to Start: ${item.how}`}</Para>}
        </View>
      ))}

      {/* Supplements */}
      <SectionTitle onLayout={onSectionLayout}>Supplements</SectionTitle>
      {!!supplementsIntro && <Para>{supplementsIntro}</Para>}
      {supplementItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
        </View>
      ))}

      {/* Devices */}
      <SectionTitle onLayout={onSectionLayout}>Devices & Equipment</SectionTitle>
      {!!devicesIntro && <Para>{devicesIntro}</Para>}
      {deviceItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
        </View>
      ))}

      {/* Prescriptions */}
      <SectionTitle onLayout={onSectionLayout}>Prescriptions</SectionTitle>
      {!!report.prescriptions && <Para>{report.prescriptions}</Para>}

      {/* Screenings */}
      <SectionTitle onLayout={onSectionLayout}>Screenings</SectionTitle>
      {!!screeningsIntro && <Para>{screeningsIntro}</Para>}
      {screeningItems.map((item, i) => (
        <View key={i}>
          <SubHead>{item.title}</SubHead>
          <Para>{item.body}</Para>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    gap: 14,
    paddingTop: 4,
  },
  reportTitle: {
    fontFamily: fonts.regular,
    fontSize: 32,
    fontWeight: '400',
    color: colors.black,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  reportDate: {
    fontFamily: fonts.regular,
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
  sectionTitle: {
    fontFamily: fonts.regular,
    fontSize: 23,
    fontWeight: '900',
    color: colors.black,
    letterSpacing: -0.4,
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
});
