import { fonts } from '@/constants/fonts';
import { mono } from '@/constants/onboarding';
import { colors, radii } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const ACCENT = colors.primary;
const SECTION_BG = '#EBF9F2';

const TODOS: string[] = [
  'Schedule and complete bloodwork',
  'Upload health documents',
  'Update your health profile',
];

const POSITIVE_FINDINGS = [
  {
    title: 'Excellent Exercise Regimen',
    body: "Your commitment to frequent cardio and strength training is the single most powerful behavior for extending healthspan and defending against all Four Horsemen.",
    nextStep: 'Continue this fantastic habit for life. Consider adding dedicated mobility work to support your training and prevent injury.',
    status: 'Current: 150-300 min cardio & >2x/wk strength training vs. Target: Maintain',
  },
  {
    title: 'No Alcohol or Nicotine Use',
    body: "Avoiding these substances is one of the most significant actions you can take to reduce your risk of cancer, cardiovascular disease, and metabolic damage.",
    nextStep: 'Maintain this healthy choice. It provides a massive advantage for your long-term health.',
    status: 'Current: None vs. Target: Maintain',
  },
  {
    title: 'Strong Social Health and Low Stress',
    body: "Strong social ties and low stress are powerful predictors of a longer, healthier life. They provide a crucial buffer against the physiological damage of stress.",
    nextStep: 'Continue to nurture your relationships and protect your low-stress lifestyle. This is a key pillar of your well-being.',
    status: 'Current: Weekly social connection, rare stress vs. Target: Maintain',
  },
];

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
    body: "Your body is mostly water. Optimal hydration is essential for energy levels, cognitive function, and physical performance. Your current intake is insufficient.",
    evidence: 'Consensus',
    frequency: 'Aim for 8-10 glasses (about 2-3 liters) of water daily.',
  },
  {
    title: 'Incorporate Daily Mobility',
    body: "Your strength and cardio are excellent, but stability is the foundation that prevents injury. Adding mobility work will ensure you can train hard and stay resilient for life.",
    evidence: 'Strong',
    frequency: 'Perform 10 minutes of dynamic stretching or mobility exercises before each workout.',
  },
];

const DIET_GOALS = [
  {
    title: 'Prioritize Protein Intake',
    body: "Adequate protein is essential to build and maintain muscle from your strength training, improve satiety to reduce cravings, and support stable blood sugar.",
    evidence: 'Consensus',
    how: 'Aim for at least 30 grams of high-quality protein with each meal. A simple way to start is by adding a scoop of protein powder to a morning smoothie or eating a serving of Greek yogurt.',
  },
  {
    title: 'Systematically Reduce Processed Foods',
    body: "Your daily consumption of processed foods likely drives inflammation and metabolic stress. Reducing them is key to protecting your long-term health.",
    evidence: 'Consensus',
    how: 'Start by replacing one processed food item each day with a whole-food alternative. For example, swap a bag of chips for an apple with a handful of almonds.',
  },
];

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
    body: "This form of magnesium is well-absorbed and can improve sleep quality and support muscle relaxation, which could help address your inconsistent sleep schedule.",
  },
];

const DEVICES = [
  {
    title: 'Wearable Sleep & Activity Tracker (e.g., Oura, Whoop)',
    body: "Provides objective data on your sleep stages, duration, and quality, along with recovery and activity metrics.",
  },
  {
    title: 'Digital Blood Pressure Monitor',
    body: "An easy-to-use device for tracking your blood pressure at home, a critical cardiovascular vital sign you currently don't know.",
  },
  {
    title: 'Continuous Glucose Monitor (CGM)',
    body: "A wearable sensor that tracks your blood sugar levels 24/7, showing you exactly how your body responds to the foods you eat, including the processed foods you consume daily.",
  },
];

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

const DOCTOR_TOPICS = [
  {
    title: 'Ordering Comprehensive Longevity Bloodwork',
    body: 'This is the most critical missing piece of your health puzzle. Standard panels often miss the earliest signs of risk.',
    goal: 'Request a lab order for a comprehensive panel including ApoB, Lp(a), fasting insulin, and hs-CRP to establish a true baseline of your cardiovascular and metabolic health.',
  },
  {
    title: 'Discussing Key Genetic Tests',
    body: "These one-time tests reveal lifelong, unmodifiable risks that require a more aggressive preventive strategy starting now.",
    goal: "Ask for a referral or lab order for genetic tests, specifically for APOE genotype (Alzheimer's risk) and Lp(a) (cardiovascular risk).",
  },
  {
    title: 'Establishing a Blood Pressure Baseline',
    body: "Hypertension is a 'silent killer' and a primary driver of heart disease and stroke. Knowing your numbers is the first step to managing it.",
    goal: "Get an accurate in-office blood pressure reading and discuss the value of tracking it at home to understand your true baseline outside of a clinical setting.",
  },
];

// ── Reusable pieces ──────────────────────────────────────────────────────────

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

export const REPORT_SECTIONS = [
  'Your Journey',
  'Progress and Trends',
  'Critical Findings',
  'Positive Findings',
  'Biomarker Goals',
  'Topics to Discuss with Your Doctor',
  'Hormone Analysis',
  'Genetics',
  'What to Do Next — Your Roadmap',
  'Behavioral Goals',
  'Diet',
  'Supplements',
  'Devices & Equipment',
  'Prescriptions',
  'Screenings',
] as const;

// ── Main export ──────────────────────────────────────────────────────────────

export default function LongevityReportContent({
  onSectionLayout,
}: {
  onSectionLayout?: SectionLayoutCb;
}) {
  return (
    <View style={s.root}>
      {/* Title */}
      <Text style={s.reportTitle}>{"Amani's\nLongevity Report"}</Text>
      <Text style={s.reportDate}>Last updated Apr 4, 2026</Text>
      <View style={s.titleDivider} />

      {/* Improve banner */}
      <View style={s.improveBanner}>
        <Text style={s.improveHead}>Things to do to improve your life</Text>
        {TODOS.map(item => (
          <View key={item} style={s.todoRow}>
            <Ionicons name="square-outline" size={18} color={ACCENT} />
            <Text style={s.todoText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Your Journey */}
      <SectionTitle onLayout={onSectionLayout}>Your Journey</SectionTitle>
      <Para>{"You've taken the crucial first step on your longevity journey. By completing your health survey, you've established the foundation for your plan. The next steps are focused on gathering objective data to make your recommendations more precise and powerful."}</Para>
      <SubHead>Complete Your Health Survey</SubHead>
      <Para>{"You've completed this! This provides the baseline for your plan."}</Para>
      <SubHead>Schedule Your Blood Work</SubHead>
      <Para>{"This is your most important next action. Objective lab data is needed to accurately assess your risk and tailor your plan."}</Para>
      <SubHead>Complete Your Health Profile</SubHead>
      <Para>{"Adding details about your family history will help us further personalize your screening recommendations."}</Para>

      {/* Progress */}
      <SectionTitle onLayout={onSectionLayout}>Progress and Trends</SectionTitle>
      <Para>{"This is your first Longevity Plan, which establishes your health baseline. As you complete bloodwork, track your habits, and add more data over time, this section will light up with your progress. We will highlight key trends in your biomarkers and behaviors, showing you the direct impact of your efforts."}</Para>

      {/* Critical Findings */}
      <SectionTitle onLayout={onSectionLayout}>Critical Findings</SectionTitle>
      <Para>{"Your profile reveals two key areas that require immediate attention. These behaviors have a disproportionate impact on your long-term health and are the most important opportunities for improvement right now."}</Para>
      <SubHead>Inconsistent Sleep</SubHead>
      <Para>{"Getting sufficient sleep only 3-4 nights per week is a major limiter on your healthspan. This directly undermines muscle repair, cognitive function, and metabolic health, effectively negating some of the significant benefits from your excellent exercise routine."}</Para>
      <SubHead>High Sedentary Time</SubHead>
      <Para>{"Even with regular workouts, sitting for more than 8 hours a day is an independent risk factor for metabolic disease, cardiovascular problems, and mortality. Breaking up long periods of sitting is critical to mitigate this risk."}</Para>

      {/* Positive Findings */}
      <SectionTitle onLayout={onSectionLayout}>Positive Findings</SectionTitle>
      <Para>{"Your profile shows several powerful strengths that are significant assets for your longevity. You should be proud of these habits and behaviors. They form a strong foundation upon which we can build the rest of your plan."}</Para>
      {POSITIVE_FINDINGS.map(f => (
        <View key={f.title}>
          <SubHead>{f.title}</SubHead>
          <Para>{f.body}</Para>
          <Para>{`Next Step: ${f.nextStep}`}</Para>
        </View>
      ))}

      {/* Biomarker Goals */}
      <SectionTitle onLayout={onSectionLayout}>Biomarker Goals</SectionTitle>
      <Para>{"We can't set specific biomarker goals until you complete your first blood test. This is the most important next step to making your plan precise. Once your results are in, this section will populate with your personalized targets for key health markers like ApoB and fasting insulin, showing you exactly where you stand and what to do next."}</Para>

      {/* Doctor Topics */}
      <SectionTitle onLayout={onSectionLayout}>Topics to Discuss with Your Doctor</SectionTitle>
      <Para>{"Your annual check-up is a valuable opportunity to be proactive. Use your next visit to discuss these key topics with your doctor to begin gathering the objective data needed for your longevity plan."}</Para>
      {DOCTOR_TOPICS.map(t => (
        <View key={t.title}>
          <SubHead>{t.title}</SubHead>
          <Para>{t.body}</Para>
          <Para>{`Goal of Discussion: ${t.goal}`}</Para>
        </View>
      ))}

      {/* Hormone / Genetics */}
      <SectionTitle onLayout={onSectionLayout}>Hormone Analysis</SectionTitle>
      <Para>{"Your hormone levels are critical for energy, mood, body composition, and long-term health. A comprehensive blood panel is needed to assess your hormonal status. Once these results are available, this section will provide a detailed analysis and personalized recommendations."}</Para>
      <SectionTitle onLayout={onSectionLayout}>Genetics</SectionTitle>
      <Para>{"Your genetic profile is a key part of your longevity puzzle, revealing your inherited predispositions for certain conditions. We recommend testing for key markers like APOE and Lp(a) to understand your inherited risks. Once you've completed this testing, this section will explain your results and the specific actions you can take."}</Para>

      {/* Roadmap */}
      <SectionTitle onLayout={onSectionLayout}>{"What to Do Next — Your Roadmap"}</SectionTitle>
      <Para>{"Your longevity journey is a marathon, not a sprint. At 19, you have the incredible advantage of time. Our roadmap is designed to build a powerful foundation of health over the coming years, starting with the most critical actions first."}</Para>
      <SubHead>Step 1: Establish Your Baseline</SubHead>
      <Para>{"Your immediate priority is to get foundational bloodwork. This will move your plan from being based on general statistics to being precisely tailored to your unique biology. This is the most important step to unlock the full power of your plan."}</Para>
      <SubHead>Step 2: Optimize Lifestyle Foundations</SubHead>
      <Para>{"Concurrently, focus on the low-hanging fruit identified in your critical findings. Prioritize achieving consistent sleep of 7-9 hours per night and actively breaking up your sedentary time during the day. These behavioral changes are free and have a massive return on investment."}</Para>
      <SubHead>Step 3: Track and Monitor</SubHead>
      <Para>{"Start gathering your own data. Use a home blood pressure monitor to establish your baseline and a wearable device to get objective feedback on your sleep and activity. What gets measured gets managed."}</Para>

      {/* Behavioral Goals */}
      <SectionTitle onLayout={onSectionLayout}>Behavioral Goals</SectionTitle>
      <Para>{"Building powerful habits now will compound benefits for decades. Based on your profile, focusing on these few key behaviors will provide the greatest return on your effort and lay the groundwork for a long healthspan."}</Para>
      {BEHAVIORAL_GOALS.map(g => (
        <View key={g.title}>
          <SubHead>{g.title}</SubHead>
          <Para>{g.body}</Para>
          <Para>{`Frequency: ${g.frequency}`}</Para>
        </View>
      ))}

      {/* Diet */}
      <SectionTitle onLayout={onSectionLayout}>Diet</SectionTitle>
      <Para>{"Your current diet is a mix of healthy habits and potential risks. The goal is to build on what you do well—eating fruits and veggies daily—while systematically reducing your intake of processed foods that can undermine your metabolic health."}</Para>
      {DIET_GOALS.map(g => (
        <View key={g.title}>
          <SubHead>{g.title}</SubHead>
          <Para>{g.body}</Para>
          <Para>{`How to Start: ${g.how}`}</Para>
        </View>
      ))}

      {/* Supplements */}
      <SectionTitle onLayout={onSectionLayout}>Supplements</SectionTitle>
      <Para>{"Supplements should be targeted, not speculative. Based on your profile, these foundational supplements can support your active lifestyle and fill potential gaps. This list will be refined once we have your bloodwork."}</Para>
      {SUPPLEMENTS.map(s2 => (
        <View key={s2.title}>
          <SubHead>{s2.title}</SubHead>
          <Para>{s2.body}</Para>
        </View>
      ))}

      {/* Devices */}
      <SectionTitle onLayout={onSectionLayout}>Devices & Equipment</SectionTitle>
      <Para>{"Objective data is your guide to progress. These devices can help you move from guessing to knowing, providing real-time feedback on your body's response to your habits and interventions."}</Para>
      {DEVICES.map(d => (
        <View key={d.title}>
          <SubHead>{d.title}</SubHead>
          <Para>{d.body}</Para>
        </View>
      ))}

      {/* Prescriptions */}
      <SectionTitle onLayout={onSectionLayout}>Prescriptions</SectionTitle>
      <Para>{"Prescription medications can be powerful tools for longevity, but they are only recommended when there is a clear, evidence-based need. Based on your current profile, no new prescriptions are suggested. This will be re-evaluated after you complete your bloodwork."}</Para>

      {/* Screenings */}
      <SectionTitle onLayout={onSectionLayout}>Screenings</SectionTitle>
      <Para>{"At your age, our screening strategy is focused on establishing a proactive baseline for the future. These recommendations provide critical information for lifelong risk management, rather than screening for diseases common in older age groups."}</Para>
      {SCREENINGS.map(s2 => (
        <View key={s2.title}>
          <SubHead>{s2.title}</SubHead>
          <Para>{s2.body}</Para>
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
  improveBanner: {
    backgroundColor: SECTION_BG,
    borderRadius: radii.sheet,
    padding: 16,
    gap: 10,
  },
  improveHead: {
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todoCheck: {
    width: 20,
    alignItems: 'center',
  },
  todoText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(0,0,0,0.75)',
    flex: 1,
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
