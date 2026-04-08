import { fonts } from '@/constants/fonts';
import { mono } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { lightImpact } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type IonName = ComponentProps<typeof Ionicons>['name'];

const ACCENT = colors.primary;
const WARN_RED = '#D9363E';
const SECTION_BG = '#EBF9F2';

// ─── Improve Your Plan bullets ───────────────────────────────────────────────
const IMPROVE_BULLETS: { icon: IonName; text: string }[] = [
  { icon: 'albums-outline', text: 'Schedule and complete bloodwork' },
  { icon: 'document-text-outline', text: 'Upload health documents' },
  { icon: 'person-outline', text: 'Update your health profile' },
  { icon: 'checkmark-circle-outline', text: 'Completing your to-dos' },
];

// ─── Positive Findings ───────────────────────────────────────────────────────
const POSITIVE_FINDINGS = [
  {
    title: 'Excellent Exercise Regimen',
    body: 'Your commitment to frequent cardio and strength training is the single most powerful behavior for extending healthspan and defending against all Four Horsemen.',
    nextStep: 'Continue this fantastic habit for life. Consider adding dedicated mobility work to support your training and prevent injury.',
    status: 'Current: 150-300 min cardio & >2x/wk strength training vs. Target: Maintain',
  },
  {
    title: 'No Alcohol or Nicotine Use',
    body: 'Avoiding these substances is one of the most significant actions you can take to reduce your risk of cancer, cardiovascular disease, and metabolic damage.',
    nextStep: 'Maintain this healthy choice. It provides a massive advantage for your long-term health.',
    status: 'Current: None vs. Target: Maintain',
  },
  {
    title: 'Strong Social Health and Low Stress',
    body: 'Strong social ties and low stress are powerful predictors of a longer, healthier life. They provide a crucial buffer against the physiological damage of stress.',
    nextStep: 'Continue to nurture your relationships and protect your low-stress lifestyle. This is a key pillar of your well-being.',
    status: 'Current: Weekly social connection, rare stress vs. Target: Maintain',
  },
];

// ─── Behavioral Goals ────────────────────────────────────────────────────────
const BEHAVIORAL_GOALS = [
  {
    title: 'Achieve Consistent, Quality Sleep',
    body: 'Sleep is non-negotiable for recovery, hormonal balance, and brain health. Making this a priority will amplify the benefits of your diet and exercise.',
    evidence: 'Consensus',
    frequency: 'Aim for 7-9 hours of quality sleep at least 6 nights per week.',
  },
  {
    title: 'Break Up Sedentary Time',
    body: 'Movement is medicine. Regularly interrupting long periods of sitting prevents the metabolic slowdown that increases risk for diabetes and heart disease.',
    evidence: 'Strong',
    frequency: 'Stand or walk for 2-5 minutes for every hour of sitting.',
  },
  {
    title: 'Increase Daily Hydration',
    body: 'Your body is mostly water. Optimal hydration is essential for energy levels, cognitive function, and physical performance. Your current intake is insufficient.',
    evidence: 'Consensus',
    frequency: 'Aim for 8-10 glasses (about 2-3 liters) of water daily.',
  },
  {
    title: 'Incorporate Daily Mobility',
    body: 'Your strength and cardio are excellent, but stability is the foundation that prevents injury. Adding mobility work will ensure you can train hard and stay resilient for life.',
    evidence: 'Strong',
    frequency: 'Perform 10 minutes of dynamic stretching or mobility exercises before each workout.',
  },
];

// ─── Diet Goals ──────────────────────────────────────────────────────────────
const DIET_GOALS = [
  {
    title: 'Prioritize Protein Intake',
    body: 'Adequate protein is essential to build and maintain muscle from your strength training, improve satiety to reduce cravings, and support stable blood sugar.',
    evidence: 'Consensus',
    how: 'Aim for at least 30 grams of high-quality protein with each meal. A simple way to start is by adding a scoop of protein powder to a morning smoothie or eating a serving of Greek yogurt.',
  },
  {
    title: 'Systematically Reduce Processed Foods',
    body: 'Your daily consumption of processed foods likely drives inflammation and metabolic stress. Reducing them is key to protecting your long-term health.',
    evidence: 'Consensus',
    how: 'Start by replacing one processed food item each day with a whole-food alternative. For example, swap a bag of chips for an apple with a handful of almonds.',
  },
];

// ─── Supplements ─────────────────────────────────────────────────────────────
const SUPPLEMENTS = [
  {
    title: 'Vitamin D3',
    body: 'Essential for immune function, bone health, and mood. Many people are deficient, and individuals with darker skin tones are at higher risk. This is a safe and effective starting point.',
  },
  {
    title: 'Creatine Monohydrate',
    body: 'As one of the most studied supplements, creatine will directly support your strength training goals by increasing performance and helping build lean muscle mass.',
  },
  {
    title: 'Magnesium Glycinate',
    body: 'This form of magnesium is well-absorbed and can improve sleep quality and support muscle relaxation, which could help address your inconsistent sleep schedule.',
  },
];

// ─── Devices ─────────────────────────────────────────────────────────────────
const DEVICES = [
  {
    title: 'Wearable Sleep & Activity Tracker (e.g., Oura, Whoop)',
    body: 'Provides objective data on your sleep stages, duration, and quality, along with recovery and activity metrics.',
  },
  {
    title: 'Digital Blood Pressure Monitor',
    body: 'An easy-to-use device for tracking your blood pressure at home, a critical cardiovascular vital sign you currently don\'t know.',
  },
  {
    title: 'Continuous Glucose Monitor (CGM)',
    body: 'A wearable sensor that tracks your blood sugar levels 24/7, showing you exactly how your body responds to the foods you eat, including the processed foods you consume daily.',
  },
];

// ─── Screenings ───────────────────────────────────────────────────────────────
const SCREENINGS = [
  {
    title: 'Germline Genetic Testing',
    body: 'This one-time test screens for inherited genetic variants that can significantly increase your risk for certain cancers and cardiovascular conditions, such as BRCA or Familial Hypercholesterolemia.',
  },
  {
    title: 'Annual Skin Cancer Exam',
    body: 'A simple, non-invasive visual examination by a dermatologist to detect skin cancers like melanoma at their earliest, most treatable stage.',
  },
];

// ─── Doctor Discussion Topics ─────────────────────────────────────────────────
const DOCTOR_TOPICS = [
  {
    title: 'Ordering Comprehensive Longevity Bloodwork',
    body: 'This is the most critical missing piece of your health puzzle. Standard panels often miss the earliest signs of risk.',
    goal: 'Request a lab order for a comprehensive panel including ApoB, Lp(a), fasting insulin, and hs-CRP to establish a true baseline of your cardiovascular and metabolic health.',
  },
  {
    title: 'Discussing Key Genetic Tests',
    body: 'These one-time tests reveal lifelong, unmodifiable risks that require a more aggressive preventive strategy starting now.',
    goal: 'Ask for a referral or lab order for genetic tests, specifically for APOE genotype (Alzheimer\'s risk) and Lp(a) (cardiovascular risk).',
  },
  {
    title: 'Establishing a Blood Pressure Baseline',
    body: 'Hypertension is a \'silent killer\' and a primary driver of heart disease and stroke. Knowing your numbers is the first step to managing it.',
    goal: 'Get an accurate in-office blood pressure reading and discuss the value of tracking it at home to understand your true baseline outside of a clinical setting.',
  },
];

// ─── Reusable sub-components ─────────────────────────────────────────────────

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

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function LongevityReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pad = Math.max(16, Math.min(36, width * 0.065));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={[styles.inner, { paddingHorizontal: pad }]}>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <Pressable hitSlop={12} onPress={() => { lightImpact(); router.back(); }}>
            <Ionicons name="chevron-back" size={28} color={colors.black} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
          showsVerticalScrollIndicator={false}>

          {/* ── Report title ── */}
          <Text style={styles.reportTitle}>{"Amani's\nLongevity Report"}</Text>
          <Text style={styles.reportDate}>Last updated Apr 4, 2026</Text>
          <View style={styles.titleDivider} />

          {/* ── Improve your plan ── */}
          <View style={styles.improveBanner}>
            <Text style={styles.improveHead}>You can improve your report by completing the following:</Text>
            {IMPROVE_BULLETS.map(b => (
              <View key={b.text} style={styles.improveBullet}>
                <Ionicons name={b.icon} size={18} color={ACCENT} />
                <Text style={styles.improveBulletText}>{b.text}</Text>
              </View>
            ))}
          </View>

          {/* ── Your Journey ── */}
          <SectionTitle>Your Journey</SectionTitle>
          <Paragraph>
            {"You've taken the crucial first step on your longevity journey. By completing your health survey, you've established the foundation for your plan. The next steps are focused on gathering objective data to make your recommendations more precise and powerful."}
          </Paragraph>

          <SubHead>Complete Your Health Survey</SubHead>
          <Paragraph>{"You've completed this! This provides the baseline for your plan."}</Paragraph>

          <SubHead>Schedule Your Blood Work</SubHead>
          <Paragraph>
            {"This is your most important next action. Objective lab data is needed to accurately assess your risk and tailor your plan."}
          </Paragraph>

          <SubHead>Complete Your Health Profile</SubHead>
          <Paragraph>
            {"Adding details about your family history will help us further personalize your screening recommendations."}
          </Paragraph>

          {/* ── Progress and Trends ── */}
          <SectionTitle>Progress and Trends</SectionTitle>
          <Paragraph>
            {"This is your first Longevity Plan, which establishes your health baseline. As you complete bloodwork, track your habits, and add more data over time, this section will light up with your progress. We will highlight key trends in your biomarkers and behaviors, showing you the direct impact of your efforts."}
          </Paragraph>

          {/* ── Missing Information ── */}
          <SectionTitle>Missing Information Summary</SectionTitle>
          <Paragraph>
            {"You've created a strong foundation by completing your health survey. To create a truly personalized and precise longevity plan, we need objective data from bloodwork and other key health markers. Filling in these gaps is the most important next step you can take."}
          </Paragraph>

          <Card>
            <SubHead>Comprehensive Bloodwork</SubHead>
            <Paragraph>
              {"Your blood reveals your internal health status. Key markers like ApoB (for heart disease risk), fasting insulin (for metabolic health), and hs-CRP (for inflammation) are essential for assessing your risk for the Four Horsemen of chronic disease. Without this, our recommendations are based on external behaviors, not your unique physiology."}
            </Paragraph>
          </Card>

          <Card>
            <SubHead>Blood Pressure</SubHead>
            <Paragraph>
              {"You indicated you don't know your blood pressure. This is a fundamental vital sign for cardiovascular health. Consistently elevated blood pressure is a major risk factor for heart attack and stroke, and it's crucial to know your baseline."}
            </Paragraph>
          </Card>

          <Card>
            <SubHead>Genetic Risk Markers</SubHead>
            <Paragraph>
              {"Certain genes, like APOE (related to Alzheimer's risk) and Lp(a) (related to heart disease risk), can significantly influence your long-term health. A one-time test can reveal these lifelong risks, allowing us to implement more aggressive and targeted preventive strategies."}
            </Paragraph>
          </Card>

          {/* ── Critical Findings ── */}
          <SectionTitle>Critical Findings</SectionTitle>
          <Paragraph>
            {"Your profile reveals two key areas that require immediate attention. These behaviors have a disproportionate impact on your long-term health and are the most important opportunities for improvement right now."}
          </Paragraph>

          <Card>
            <View style={styles.criticalTag}>
              <Ionicons name="warning-outline" size={14} color={WARN_RED} />
              <Text style={styles.criticalTagText}>Needs Attention</Text>
            </View>
            <SubHead>Inconsistent Sleep</SubHead>
            <Paragraph>
              {"Getting sufficient sleep only 3-4 nights per week is a major limiter on your healthspan. This directly undermines muscle repair, cognitive function, and metabolic health, effectively negating some of the significant benefits from your excellent exercise routine."}
            </Paragraph>
          </Card>

          <Card>
            <View style={styles.criticalTag}>
              <Ionicons name="warning-outline" size={14} color={WARN_RED} />
              <Text style={styles.criticalTagText}>Needs Attention</Text>
            </View>
            <SubHead>High Sedentary Time</SubHead>
            <Paragraph>
              {"Even with regular workouts, sitting for more than 8 hours a day is an independent risk factor for metabolic disease, cardiovascular problems, and mortality. Breaking up long periods of sitting is critical to mitigate this risk."}
            </Paragraph>
          </Card>

          {/* ── Positive Findings ── */}
          <SectionTitle>Positive Findings</SectionTitle>
          <Paragraph>
            {"Your profile shows several powerful strengths that are significant assets for your longevity. You should be proud of these habits and behaviors. They form a strong foundation upon which we can build the rest of your plan."}
          </Paragraph>

          {POSITIVE_FINDINGS.map(f => (
            <Card key={f.title}>
              <View style={styles.positiveTag}>
                <Ionicons name="checkmark-circle" size={14} color={ACCENT} />
                <Text style={styles.positiveTagText}>Strength</Text>
              </View>
              <SubHead>{f.title}</SubHead>
              <Paragraph>{f.body}</Paragraph>
              <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>Next Step: </Text>
                <Text style={styles.statusText}>{f.nextStep}</Text>
              </View>
              <View style={[styles.statusBox, { marginTop: 6 }]}>
                <Text style={styles.statusLabel}>Status: </Text>
                <Text style={styles.statusText}>{f.status}</Text>
              </View>
            </Card>
          ))}

          {/* ── Biomarker Goals ── */}
          <SectionTitle>Biomarker Goals</SectionTitle>
          <Paragraph>
            {"We can't set specific biomarker goals until you complete your first blood test. This is the most important next step to making your plan precise. Once your results are in, this section will populate with your personalized targets for key health markers like ApoB and fasting insulin, showing you exactly where you stand and what to do next."}
          </Paragraph>

          {/* ── Topics for Doctor ── */}
          <SectionTitle>Topics to Discuss with Your Doctor</SectionTitle>
          <Paragraph>
            {"Your annual check-up is a valuable opportunity to be proactive. Use your next visit to discuss these key topics with your doctor to begin gathering the objective data needed for your longevity plan."}
          </Paragraph>

          {DOCTOR_TOPICS.map(t => (
            <Card key={t.title}>
              <SubHead>{t.title}</SubHead>
              <Paragraph>{t.body}</Paragraph>
              <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>Goal of Discussion: </Text>
                <Text style={styles.statusText}>{t.goal}</Text>
              </View>
            </Card>
          ))}

          {/* ── Hormone Analysis & Genetics ── */}
          <SectionTitle>Hormone Analysis</SectionTitle>
          <Paragraph>
            {"Your hormone levels are critical for energy, mood, body composition, and long-term health. A comprehensive blood panel is needed to assess your hormonal status. Once these results are available, this section will provide a detailed analysis and personalized recommendations."}
          </Paragraph>

          <SectionTitle>Genetics</SectionTitle>
          <Paragraph>
            {"Your genetic profile is a key part of your longevity puzzle, revealing your inherited predispositions for certain conditions. We recommend testing for key markers like APOE and Lp(a) to understand your inherited risks. Once you've completed this testing, this section will explain your results and the specific actions you can take."}
          </Paragraph>

          {/* ── Roadmap ── */}
          <SectionTitle>{"What to Do Next — Your Roadmap, Retesting, and Results Loop"}</SectionTitle>
          <Paragraph>
            {"Your longevity journey is a marathon, not a sprint. At 19, you have the incredible advantage of time. Our roadmap is designed to build a powerful foundation of health over the coming years, starting with the most critical actions first."}
          </Paragraph>

          <Card>
            <SubHead>Step 1: Establish Your Baseline</SubHead>
            <Paragraph>
              {"Your immediate priority is to get foundational bloodwork. This will move your plan from being based on general statistics to being precisely tailored to your unique biology. This is the most important step to unlock the full power of your plan."}
            </Paragraph>
          </Card>

          <Card>
            <SubHead>Step 2: Optimize Lifestyle Foundations</SubHead>
            <Paragraph>
              {"Concurrently, focus on the low-hanging fruit identified in your critical findings. Prioritize achieving consistent sleep of 7-9 hours per night and actively breaking up your sedentary time during the day. These behavioral changes are free and have a massive return on investment."}
            </Paragraph>
          </Card>

          <Card>
            <SubHead>Step 3: Track and Monitor</SubHead>
            <Paragraph>
              {"Start gathering your own data. Use a home blood pressure monitor to establish your baseline and a wearable device to get objective feedback on your sleep and activity. What gets measured gets managed."}
            </Paragraph>
          </Card>

          {/* ── Behavioral Goals ── */}
          <SectionTitle>Behavioral Goals</SectionTitle>
          <Paragraph>
            {"Building powerful habits now will compound benefits for decades. Based on your profile, focusing on these few key behaviors will provide the greatest return on your effort and lay the groundwork for a long healthspan."}
          </Paragraph>

          {BEHAVIORAL_GOALS.map(g => (
            <Card key={g.title}>
              <SubHead>{g.title}</SubHead>
              <Paragraph>{g.body}</Paragraph>
              <EvidencePill label={g.evidence} />
              <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>Frequency: </Text>
                <Text style={styles.statusText}>{g.frequency}</Text>
              </View>
            </Card>
          ))}

          {/* ── Diet ── */}
          <SectionTitle>Diet</SectionTitle>
          <Paragraph>
            {"Your current diet is a mix of healthy habits and potential risks. The goal is to build on what you do well—eating fruits and veggies daily—while systematically reducing your intake of processed foods that can undermine your metabolic health."}
          </Paragraph>

          {DIET_GOALS.map(g => (
            <Card key={g.title}>
              <SubHead>{g.title}</SubHead>
              <Paragraph>{g.body}</Paragraph>
              <EvidencePill label={g.evidence} />
              <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>How to Start: </Text>
                <Text style={styles.statusText}>{g.how}</Text>
              </View>
            </Card>
          ))}

          {/* ── Supplements ── */}
          <SectionTitle>Supplements</SectionTitle>
          <Paragraph>
            {"Supplements should be targeted, not speculative. Based on your profile, these foundational supplements can support your active lifestyle and fill potential gaps. This list will be refined once we have your bloodwork."}
          </Paragraph>

          {SUPPLEMENTS.map(s => (
            <Card key={s.title}>
              <SubHead>{s.title}</SubHead>
              <Paragraph>{s.body}</Paragraph>
            </Card>
          ))}

          {/* ── Devices ── */}
          <SectionTitle>Devices & Equipment</SectionTitle>
          <Paragraph>
            {"Objective data is your guide to progress. These devices can help you move from guessing to knowing, providing real-time feedback on your body's response to your habits and interventions."}
          </Paragraph>

          {DEVICES.map(d => (
            <Card key={d.title}>
              <SubHead>{d.title}</SubHead>
              <Paragraph>{d.body}</Paragraph>
            </Card>
          ))}

          {/* ── Prescriptions ── */}
          <SectionTitle>Prescriptions</SectionTitle>
          <Paragraph>
            {"Prescription medications can be powerful tools for longevity, but they are only recommended when there is a clear, evidence-based need. Based on your current profile, no new prescriptions are suggested. This will be re-evaluated after you complete your bloodwork."}
          </Paragraph>

          {/* ── Screenings ── */}
          <SectionTitle>Screenings</SectionTitle>
          <Paragraph>
            {"At your age, our screening strategy is focused on establishing a proactive baseline for the future. These recommendations provide critical information for lifelong risk management, rather than screening for diseases common in older age groups."}
          </Paragraph>

          {SCREENINGS.map(s => (
            <Card key={s.title}>
              <SubHead>{s.title}</SubHead>
              <Paragraph>{s.body}</Paragraph>
            </Card>
          ))}
        </ScrollView>

        {/* ── Bottom action bar ── */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable
            style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.8 }]}
            onPress={() => lightImpact()}>
            <Ionicons name="document-outline" size={18} color={colors.black} />
            <Text style={styles.bottomBtnText}>PDF</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.8 }]}
            onPress={() => lightImpact()}>
            <Ionicons name="refresh-outline" size={18} color={colors.black} />
            <Text style={styles.bottomBtnText}>Refresh</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.8 }]}
            onPress={() => lightImpact()}>
            <Ionicons name="list-outline" size={18} color={colors.black} />
            <Text style={styles.bottomBtnText}>Contents</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  inner: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 14,
    paddingTop: 4,
  },

  // ── Report header ──
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

  // ── Improve banner ──
  improveBanner: {
    backgroundColor: SECTION_BG,
    borderRadius: radii.sheet,
    padding: 16,
    gap: 10,
  },
  improveHead: {
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '500',
    color: colors.black,
    lineHeight: 21,
  },
  improveBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  improveBulletText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: ACCENT,
    flex: 1,
  },

  // ── Text ──
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

  // ── Cards ──
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
  criticalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  criticalTagText: {
    fontFamily: mono,
    fontSize: 12,
    color: WARN_RED,
    fontWeight: '600',
  },
  positiveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  positiveTagText: {
    fontFamily: mono,
    fontSize: 12,
    color: ACCENT,
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

  // ── Bottom bar ──
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
