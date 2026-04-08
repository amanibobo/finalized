export type LifestyleStep = {
  id: string;
  /** The questionnaire field name this step maps to in the backend payload. */
  questionnaireKey: string;
  section: string;
  title: string;
  /** Study line under the title; set to '' to suppress; omit to use DEFAULT_LIFESTYLE_CITATION. */
  citation?: string;
  /** Longer copy for the research drawer; omit to use `DEFAULT_CITATION_DETAIL`. */
  citationDetail?: string;
  /** 0–100 static impact score shown in the drawer slider. */
  impactScore?: number;
  /** Line under the slider; omit to use `DEFAULT_IMPACT_DESCRIPTION`. */
  impactDescription?: string;
  /** "Why is this important?" body; falls back to `citationDetail` then default. */
  whyImportant?: string;
  /** Shown as "Source: …" with optional link. */
  sourceLabel?: string;
  sourceUrl?: string;
  /** Remote URL for the question illustration image. */
  image?: string;
  options: string[];
};

/** Default caption when a step does not set its own `citation`. */
export const DEFAULT_LIFESTYLE_CITATION =
  'Based on 16 studies, 833,000 participants';

/** Default body when opening the citation drawer (tap "Based on…" line). */
export const DEFAULT_CITATION_DETAIL =
  'This question is grounded in peer-reviewed observational studies and meta-analyses that link these behaviors to longevity-related outcomes. The summary line is a simplified reference to that evidence and is not medical advice. Your answers help us estimate patterns used in the model.';

export const DEFAULT_IMPACT_SCORE = 43;

export const DEFAULT_IMPACT_DESCRIPTION =
  'Out of 100, this score shows how much this activity affects your life expectancy.';

export type ResolvedDrawerPayload = {
  impactScore: number;
  impactDescription: string;
  whyImportant: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

export function resolveDrawerPayload(step: LifestyleStep): ResolvedDrawerPayload {
  return {
    impactScore: step.impactScore ?? DEFAULT_IMPACT_SCORE,
    impactDescription: step.impactDescription ?? DEFAULT_IMPACT_DESCRIPTION,
    whyImportant: step.whyImportant ?? step.citationDetail ?? DEFAULT_CITATION_DETAIL,
    sourceLabel: step.sourceLabel,
    sourceUrl: step.sourceUrl,
  };
}

export const LIFESTYLE_STEPS: LifestyleStep[] = [
  {
    id: 'diet-fruits-veggies',
    questionnaireKey: 'diet_fruits_veggies',
    section: 'DIET',
    title: 'How often do you include fruits and veggies in your meals?',
    citation: 'Based on 16 studies, 833,000+ participants',
    impactScore: 43,
    whyImportant:
      'Research from 16 studies involving over 833,000 participants shows that each additional daily serving of fruits and vegetables reduces the risk of death from all causes by 5%, with benefits peaking at five servings per day.',
    sourceLabel: 'The BMJ',
    sourceUrl: 'https://www.bmj.com/content/349/bmj.g4490/',
    image: 'https://app.deathclock.co/images/vegetables.png',
    options: [
      'Rarely or never',
      'Several times a week',
      'Daily',
      'Five or more servings a day',
    ],
  },
  {
    id: 'diet-processed',
    questionnaireKey: 'diet_processed_foods',
    section: 'DIET',
    title:
      'How often do you eat processed foods like fast food, canned goods, or frozen meals?',
    citation: 'Based on 45 studies, nearly 10M participants',
    impactScore: 34,
    whyImportant:
      'Based on a comprehensive analysis of 45 studies involving nearly 10 million participants, higher consumption of ultra-processed foods is linked to significant increases in heart disease, diabetes, and other severe health risks.',
    sourceLabel: 'The BMJ',
    sourceUrl: 'https://www.bmj.com/content/384/bmj-2023-077310',
    image: 'https://app.deathclock.co/images/processed.png',
    options: ['Daily', 'Several times a week or more', 'Once a week', 'Rarely or never'],
  },
  {
    id: 'diet-sugar',
    questionnaireKey: 'diet_sugar',
    section: 'DIET',
    title: 'How much sugar do you usually have a day?',
    citation: 'Based on 73 meta-analyses',
    impactScore: 34,
    whyImportant:
      'This question is based on findings from 73 meta-analyses reviewed in a major study, which linked higher sugar intake to increased risks of numerous health issues, including certain cancers and higher all-cause mortality rates.',
    sourceLabel: 'The BMJ',
    sourceUrl: 'https://www.bmj.com/content/381/bmj-2022-071609',
    image: 'https://app.deathclock.co/images/sugar.png',
    options: [
      'Sweets several times a day',
      'Daily sweet treat',
      'Just a few treats a week',
      'None',
    ],
  },
  {
    id: 'diet-water',
    questionnaireKey: 'diet_water',
    section: 'DIET',
    title: 'How much water do you usually drink a day?',
    citation: 'Based on a systematic review, Nutrients 2018',
    impactScore: 24,
    whyImportant:
      'Based on an extensive systematic review published in Nutrients 2018, water intake is essential for metabolism and overall health, yet individual needs vary widely due to factors such as activity level and environmental conditions.',
    sourceLabel: 'MDPI',
    sourceUrl: 'https://www.mdpi.com/2072-6643/10/12/1928',
    image: 'https://app.deathclock.co/images/water.png',
    options: [
      'Less than one glass',
      '2 to 5 glasses',
      '6 to 9 glasses',
      '10 or more glasses',
    ],
  },
  {
    id: 'exercise-cardio',
    questionnaireKey: 'exercise_cardio',
    section: 'EXERCISE',
    title:
      'How often do you do cardio each week? Think running, swimming, hiking, etc.',
    citation: '',
    image: 'https://app.deathclock.co/images/cardio.png',
    options: [
      'Rarely or never',
      'Less than 150 minutes',
      '150 to 300 minutes',
      'More than 300 minutes',
    ],
  },
  {
    id: 'exercise-weights',
    questionnaireKey: 'exercise_weights',
    section: 'EXERCISE',
    title: 'How often do you hit the weights?',
    citation: 'Based on 16 studies, systematic meta-analysis',
    impactScore: 34,
    whyImportant:
      'Based on a systematic review and meta-analysis involving 16 studies, engaging in muscle-strengthening activities is linked to a 10–17% reduction in the risk of major non-communicable diseases and all-cause mortality.',
    sourceLabel: 'BJSM',
    sourceUrl: 'https://bjsm.bmj.com/content/56/13/755',
    image: 'https://app.deathclock.co/images/weights.png',
    options: [
      'Rarely or never',
      'Less than once a week',
      'One to two days per week',
      'More than two days per week',
    ],
  },
  {
    id: 'exercise-mobility',
    questionnaireKey: 'exercise_mobility',
    section: 'EXERCISE',
    title: 'How often do you mix in things like yoga or stretching into your routine?',
    citation: 'Based on a meta-analysis of 22 studies',
    impactScore: 15,
    whyImportant:
      'Based on a meta-analysis of 22 studies, yoga significantly enhances physical function and health quality, correlating with potential longevity benefits by improving balance, flexibility, and strength.',
    sourceLabel: 'IJBNPA',
    sourceUrl: 'https://ijbnpa.biomedcentral.com/articles/10.1186/s12966-019-0789-2',
    image: 'https://app.deathclock.co/images/yoga.png',
    options: [
      'Never',
      'A few times a month',
      '1–2 times per week',
      'Three or more times per week',
    ],
  },
  {
    id: 'exercise-sitting',
    questionnaireKey: 'exercise_sitting',
    section: 'EXERCISE',
    title: 'How much of your day do you spend sitting?',
    citation: 'Based on 47 studies, systematic meta-analysis',
    impactScore: 34,
    whyImportant:
      'Based on a systematic review and meta-analysis of 47 studies, prolonged sedentary time is linked to increased risks of mortality, cardiovascular disease, cancer, and type 2 diabetes.',
    sourceLabel: 'PubMed',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/25599350/',
    image: 'https://app.deathclock.co/images/sitting.png',
    options: ['More than 8 hours', '4–8 hours', '2–4 hours', 'Less than 2 hours'],
  },
  {
    id: 'activity-tracking',
    questionnaireKey: 'activity_tracking',
    section: 'ACTIVITY',
    title: 'Are you currently using a device to track your physical activity and sleep?',
    citation: '',
    options: [
      'Yes, tracking both',
      'Only tracking activity',
      'Only tracking sleep',
      'No, not using any device',
    ],
  },
  {
    id: 'sleep-duration',
    questionnaireKey: 'sleep_duration',
    section: 'SLEEP',
    title: 'How often do you get at least 7 hours of sleep?',
    citation: 'Based on 16 studies, 1.3M+ participants',
    impactScore: 100,
    whyImportant:
      'Based on a systematic review of 16 studies involving over 1.3 million participants, getting enough sleep is associated with a 24% reduction in the risk of all-cause mortality and a 20% reduction in the risk of cardiovascular disease.',
    sourceLabel: 'Sleep Journal',
    sourceUrl: 'https://academic.oup.com/sleep/article/33/5/585/2454478',
    image: 'https://app.deathclock.co/images/howmuchsleep.png',
    options: [
      'Never',
      '1–2 nights per week',
      '3–4 nights per week',
      '5 or more nights per week',
    ],
  },
  {
    id: 'sleep-trouble',
    questionnaireKey: 'sleep_trouble',
    section: 'SLEEP',
    title: 'How frequently do you have trouble falling asleep or staying asleep?',
    citation: 'Based on 85 meta-analyses',
    impactScore: 62,
    whyImportant:
      'Based on an umbrella review of 85 meta-analyses, poor sleep quality is associated with a significant increase in the risk of various adverse health outcomes, including diabetes, obesity, cardiovascular disease, and all-cause mortality.',
    sourceLabel: 'Frontiers in Medicine',
    sourceUrl: 'https://www.frontiersin.org/articles/10.3389/fmed.2021.813943/full',
    image: 'https://app.deathclock.co/images/stayasleep.png',
    options: [
      'Five or more nights per week',
      'Three to four nights per week',
      'One to two nights per week',
      'Never',
    ],
  },
  {
    id: 'community-time',
    questionnaireKey: 'community_time',
    section: 'COMMUNITY',
    title: 'How often do you spend time with friends, family, or local community?',
    citation: 'Based on 23 meta-analyses',
    impactScore: 41,
    whyImportant:
      'Based on an analysis of 23 meta-analyses, strong social support is linked to significant improvements in health and longevity, reducing the risk of disease and mortality.',
    sourceLabel: 'Frontiers in Psychology',
    sourceUrl:
      'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.717164/full',
    image: 'https://app.deathclock.co/images/friendsandfamily.png',
    options: ['Never', 'A few times a month', 'Weekly', 'Daily'],
  },
  {
    id: 'community-relationship',
    questionnaireKey: 'relationship_status',
    section: 'COMMUNITY',
    title: 'What is your current relationship status?',
    citation: 'Based on 148 studies, 300,000+ participants',
    impactScore: 1,
    whyImportant:
      'A meta-analysis of 148 studies involving over 300,000 participants shows that relationship status significantly impacts health.',
    sourceLabel: 'PLOS',
    sourceUrl:
      'https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1000316',
    image: 'https://app.deathclock.co/images/relationship.png',
    options: [
      'In a long term relationship',
      'Married',
      'Single',
      'Divorced / widowed / separated',
    ],
  },
  {
    id: 'community-children',
    questionnaireKey: 'children',
    section: 'COMMUNITY',
    title: 'Do you have any children?',
    citation: 'Based on a meta-analysis of 17 studies',
    impactScore: 14,
    whyImportant:
      'A meta-analysis of 17 studies shows that having children impacts health, offering benefits like social support and emotional well-being, but also presenting stress and lifestyle challenges.',
    sourceLabel: 'Springer',
    sourceUrl: 'https://link.springer.com/article/10.1007/s10680-018-9469-1',
    image: 'https://app.deathclock.co/images/nest.png',
    options: [
      'Yes, not living at home',
      'Yes, living at home',
      'No, but planning to',
      'No, and not planning to',
    ],
  },
  {
    id: 'health-income',
    questionnaireKey: 'household_income',
    section: 'HEALTH PLANNING',
    title: 'Which range best describes your annual household income?',
    citation: '',
    image: 'https://app.deathclock.co/images/piggybank.png',
    options: ['Under $75k', '$75k – $200k', '$200k – $500k', 'Over $500k'],
  },
  {
    id: 'community-supportive',
    questionnaireKey: 'social_support',
    section: 'COMMUNITY',
    title: 'How supportive do you find your social circle when you need help?',
    citation: 'Harvard Study of Adult Development',
    impactScore: 27,
    whyImportant:
      'Based on findings from the Harvard Study of Adult Development, strong social connections are linked to better physical health, greater happiness, and longer life.',
    sourceLabel: 'Adult Development Study',
    sourceUrl: 'https://www.adultdevelopmentstudy.org/',
    image: 'https://app.deathclock.co/images/socialsupport.png',
    options: [
      'Not supportive',
      'Slightly supportive',
      'Fairly supportive',
      'Completely supportive',
    ],
  },
  {
    id: 'substance-alcohol',
    questionnaireKey: 'alcohol',
    section: 'SUBSTANCE USE',
    title: 'How many alcohol drinks do you consume per week?',
    citation: 'Meta-analysis, U.S. National Cancer Institute',
    impactScore: 74,
    whyImportant:
      'A meta-analysis by the U.S. National Cancer Institute shows that alcohol consumption significantly increases the risks of cancer, heart disease, stroke, and other conditions.',
    sourceLabel: 'BMC Medicine',
    sourceUrl:
      'https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-021-02040-2',
    image: 'https://app.deathclock.co/images/dailyalcohol.png',
    options: [
      '15 or more drinks per week',
      '8–14 drinks per week',
      '1–7 drinks per week',
      "I don't drink",
    ],
  },
  {
    id: 'substance-nicotine',
    questionnaireKey: 'nicotine',
    section: 'SUBSTANCE USE',
    title:
      'What best describes your nicotine use (e.g., cigarettes, vapes, ZYN, pouches)?',
    citation: 'U.S. National Cancer Institute',
    impactScore: 74,
    whyImportant:
      'A meta-analysis by the U.S. National Cancer Institute shows that smoking significantly increases the risks of cancer, heart disease, stroke, and lung disease.',
    sourceLabel: 'NCI',
    sourceUrl:
      'https://www.cancer.gov/about-cancer/causes-prevention/risk/tobacco/cessation-fact-sheet',
    image: 'https://app.deathclock.co/images/nicotene.png',
    options: [
      'Current daily user',
      'Current occasional user',
      'Former user',
      'Never used',
    ],
  },
  {
    id: 'mental-stress',
    questionnaireKey: 'stress',
    section: 'MENTAL HEALTH',
    title: 'How often do you experience significant stress in your daily life?',
    citation: 'Research involving 10,000+ participants',
    impactScore: 30,
    whyImportant:
      'Research involving over 10,000 participants shows that chronic psychological stress significantly harms health, contributing to increased inflammation and accelerated cellular aging, thereby raising morbidity and mortality risks.',
    sourceLabel: 'BMC',
    sourceUrl:
      'https://bmcpublichealth.biomedcentral.com/articles/10.1186/1471-2458-14-9',
    image: 'https://app.deathclock.co/images/stress.png',
    options: ['Almost all the time', 'Frequently', 'Occasionally', 'Rarely or never'],
  },
  {
    id: 'mental-impact',
    questionnaireKey: 'mental_health_impact',
    section: 'MENTAL HEALTH',
    title: 'How much does your mental health negatively impact your well-being?',
    citation: 'Based on 10 cohort studies, 68,222 participants',
    impactScore: 51,
    whyImportant:
      'Research from 10 large cohort studies involving 68,222 participants shows that even low levels of psychological distress significantly increase the risk of death from all causes.',
    sourceLabel: 'The BMJ',
    sourceUrl: 'https://www.bmj.com/content/345/bmj.e4933',
    image: 'https://app.deathclock.co/images/mentalhealth.png',
    options: ['Severely', 'Moderately', 'Mildly', 'Not at all'],
  },
  {
    id: 'healthcare-checkups',
    questionnaireKey: 'checkups',
    section: 'HEALTHCARE',
    title: 'How often do you go for general health check-ups with your doctor?',
    citation: 'Based on 14 trials, 182,880 participants',
    impactScore: 41,
    whyImportant:
      'Research from 14 trials involving 182,880 participants shows that general health checks are valuable for disease prevention, early diagnosis, and overall health management.',
    sourceLabel: 'The BMJ',
    sourceUrl: 'https://www.bmj.com/content/345/bmj.e7191',
    image: 'https://app.deathclock.co/images/checkups.png',
    options: ['Never', 'Every five years', 'Every two to three years', 'Yearly'],
  },
  {
    id: 'health-blood-recent',
    questionnaireKey: 'bloodwork_recency',
    section: 'HEALTH PLANNING',
    title: 'How recently have you had a blood test to check your health?',
    citation: '',
    image: 'https://app.deathclock.co/images/bloodvials.png',
    options: [
      'Eager to get blood work done soon',
      'Got blood work recently, will keep doing it',
      "Rarely get blood work done, don't see a need",
      'Avoid blood work',
    ],
  },
  {
    id: 'health-clinical-data',
    questionnaireKey: 'clinical_data_method',
    section: 'HEALTH PLANNING',
    title:
      'What is the easiest way for you to provide clinical data for a more accurate prediction?',
    citation: '',
    image: 'https://app.deathclock.co/images/records.png',
    options: [
      'Upload blood work or lab results',
      'Sync my medical records',
      'Both upload and sync',
      'None of the above',
    ],
  },
  {
    id: 'healthcare-cancer-screenings',
    questionnaireKey: 'cancer_screenings',
    section: 'HEALTHCARE',
    title: 'How often do you get recommended cancer screenings?',
    citation: 'Based on 18 trials, 2.1M participants',
    impactScore: 68,
    whyImportant:
      'Research from 18 long-term randomized clinical trials involving 2.1 million individuals shows that colorectal cancer screening, prostate cancer screening, and lung cancer screening can increase longevity.',
    sourceLabel: 'JAMA',
    sourceUrl:
      'https://jamanetwork.com/journals/jamainternalmedicine/article-abstract/2808648',
    image: 'https://app.deathclock.co/images/screening.png',
    options: ['Never', 'Once or twice', 'Sometimes, but not consistently', 'As recommended'],
  },
  {
    id: 'healthcare-grandparents-age',
    questionnaireKey: 'grandparents_max_age',
    section: 'HEALTHCARE',
    title:
      "What's the oldest age your biological grandparents reached (or your best guess)?",
    citation: 'Widely cited genetic longevity meta-analysis',
    impactScore: 7,
    whyImportant:
      'A widely cited meta-analysis suggests that genetic factors strongly influence human longevity, with the lifespan of grandparents notably impacting their descendants.',
    sourceLabel: 'IntechOpen',
    sourceUrl: 'https://www.intechopen.com/chapters/55982',
    image: 'https://app.deathclock.co/images/longevity.png',
    options: ['Under 70', '70–79', '80–89', '90+'],
  },
  {
    id: 'disease-overweight',
    questionnaireKey: 'overweight',
    section: 'DISEASE',
    title: 'Are you overweight?',
    citation: 'Based on 230 studies, 30.3M+ participants',
    impactScore: 21,
    whyImportant:
      'Research from 230 cohort studies involving over 30.3 million participants shows that each 5-unit increase in BMI above 25 significantly increases the risk of death from all causes.',
    sourceLabel: 'The BMJ',
    sourceUrl: 'https://www.bmj.com/content/353/bmj.i2156',
    image: 'https://app.deathclock.co/images/weight.png',
    options: ['Obese', 'Overweight', 'A little overweight', 'No'],
  },
  {
    id: 'disease-blood-pressure',
    questionnaireKey: 'blood_pressure',
    section: 'DISEASE',
    title: 'What is your typical blood pressure reading?',
    citation: 'Based on 61 studies, 1M+ participants',
    impactScore: 21,
    whyImportant:
      'A meta-analysis of 61 studies involving over 1 million participants demonstrates that high blood pressure significantly increases the risk of cardiovascular diseases, stroke, and mortality.',
    sourceLabel: 'JAMA',
    sourceUrl:
      'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2663255',
    image: 'https://app.deathclock.co/images/heartdisease.png',
    options: [
      'Below 120/80 (normal)',
      "I don't know",
      '120/80 to 139/89 (elevated)',
      '140/90 or higher (high)',
    ],
  },
  {
    id: 'disease-ldl',
    questionnaireKey: 'ldl',
    section: 'DISEASE',
    title: 'What is your typical "bad" (LDL) cholesterol level?',
    citation: 'Based on 74 studies, 2.5M+ participants',
    impactScore: 32,
    whyImportant:
      'Research from 74 studies involving over 2.5 million participants shows that cardiovascular diseases significantly reduce life expectancy, with individuals losing an average of several years due to these conditions.',
    sourceLabel: 'PLOS ONE',
    sourceUrl:
      'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0284052',
    image: 'https://app.deathclock.co/images/ldl.png',
    options: [
      'Below 100 mg/dL (optimal)',
      "I don't know",
      '100–159 mg/dL (borderline high)',
      '160 mg/dL or higher (high to very high)',
    ],
  },
  {
    id: 'disease-glucose',
    questionnaireKey: 'glucose',
    section: 'DISEASE',
    title: 'What is your typical fasting blood glucose level?',
    citation: 'Based on 100+ studies, 800,000+ participants',
    impactScore: 32,
    whyImportant:
      'Research from over 100 studies involving more than 800,000 participants shows that diabetes nearly doubles the risk of all-cause mortality.',
    sourceLabel: 'Hindawi',
    sourceUrl: 'https://www.hindawi.com/journals/jdr/2020/5767582/',
    image: 'https://app.deathclock.co/images/bloodglucose.png',
    options: [
      'Below 100 mg/dL (normal)',
      "I don't know",
      '100–125 mg/dL (prediabetes)',
      '126 mg/dL or higher (diabetes)',
    ],
  },
  {
    id: 'disease-chronic',
    questionnaireKey: 'chronic_disease',
    section: 'DISEASE',
    title: 'Do you have any other chronic disease?',
    citation: 'Based on 37 studies on long-term conditions',
    impactScore: 21,
    whyImportant:
      'Research from 37 studies involving various long-term conditions shows that these conditions significantly reduce life expectancy.',
    sourceLabel: 'PLOS',
    sourceUrl:
      'https://journals.plos.org/globalpublichealth/article?id=10.1371/journal.pgph.0000745',
    image: 'https://app.deathclock.co/images/disease.png',
    options: ['Yes', 'Risk factors for chronic diseases', "I'm not sure", 'No'],
  },
];

export const FIRST_LIFESTYLE_STEP_ID = LIFESTYLE_STEPS[0].id;

export function getLifestyleStep(id: string | undefined): LifestyleStep | undefined {
  if (!id) return undefined;
  return LIFESTYLE_STEPS.find((s) => s.id === id);
}

export function getNextLifestyleStepId(currentId: string): string | null {
  const i = LIFESTYLE_STEPS.findIndex((s) => s.id === currentId);
  if (i < 0 || i >= LIFESTYLE_STEPS.length - 1) return null;
  return LIFESTYLE_STEPS[i + 1].id;
}
