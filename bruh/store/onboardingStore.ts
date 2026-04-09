/**
 * Zustand store for onboarding survey answers and API prediction result.
 *
 * Answers accumulate as the user moves through each onboarding screen.
 * The `prediction` field is populated once the `analyzing` screen fires
 * the POST /predict request and gets a response back.
 */

import { create } from 'zustand';

// ── Raw questionnaire answers ────────────────────────────────────────────────

export type HeightValue = number | [number, number]; // ft_in = [feet, inches]

export interface OnboardingAnswers {
  // Demographics
  first_name: string;
  age: number;
  sex: string;
  race: string;
  in_us: boolean;
  height_value: HeightValue;
  height_unit: 'cm' | 'ft_in' | 'm';
  weight_value: number;
  weight_unit: 'kg' | 'lb';

  // Lifestyle — all values are the raw human-readable labels sent to the
  // backend, which normalises them to snake_case internally.
  diet_fruits_veggies: string;
  diet_processed_foods: string;
  diet_sugar: string;
  diet_water: string;
  exercise_cardio: string;
  exercise_weights: string;
  exercise_mobility: string;
  exercise_sitting: string;
  activity_tracking: string;
  sleep_duration: string;
  sleep_trouble: string;
  community_time: string;
  relationship_status: string;
  children: string;
  social_support: string;
  household_income: string;
  bloodwork_recency: string;
  clinical_data_method: string;
  alcohol: string;
  nicotine: string;
  stress: string;
  mental_health_impact: string;
  checkups: string;
  cancer_screenings: string;
  grandparents_max_age: string;
  overweight: string;
  blood_pressure: string;
  ldl: string;
  glucose: string;
  chronic_disease: string;
}

// ── API response shapes ──────────────────────────────────────────────────────

export interface VitalityParams {
  y0: number;
  zeta: number;
  sigma: number;
  lambda_jump: number;
}

export interface Prediction {
  lifestyle_score: number;
  year_adjustment: number;
  remaining_years: number;
  predicted_death_age: number;
  predicted_death_date: string;
  baseline_death_age: number;
  years_vs_baseline: number;
}

export interface RiskFactor {
  label: string;
  score: number;
  level: 'high_risk' | 'needs_improvement';
}

export interface PredictResult {
  features: Record<string, number | string>;
  vitality_params: VitalityParams;
  prediction: Prediction;
  /** Populated by /explain only */
  risk_factors?: {
    actionable: RiskFactor[];
    clinical: RiskFactor[];
  };
}

// ── Longevity report types ───────────────────────────────────────────────────

export interface ReportMilestone { title: string; body: string; done: boolean }
export interface ReportItem       { title: string; body: string }
export interface ReportItemNextStep extends ReportItem { next_step: string; status: string }
export interface ReportItemGoal    extends ReportItem { goal: string }
export interface ReportItemFreq    extends ReportItem { evidence: string; frequency: string }
export interface ReportItemHow     extends ReportItem { evidence: string; how: string }
export interface ReportStep        { title: string; body: string }

export interface LongevityReport {
  your_journey:        { intro: string; milestones: ReportMilestone[] };
  progress_and_trends: string;
  critical_findings:   { intro: string; items: ReportItem[] };
  positive_findings:   { intro: string; items: ReportItemNextStep[] };
  doctor_topics:       { intro: string; items: ReportItemGoal[] };
  hormone_analysis:    string;
  genetics:            string;
  roadmap:             { intro: string; steps: ReportStep[] };
  behavioral_goals:    { intro: string; items: ReportItemFreq[] };
  diet:                { intro: string; items: ReportItemHow[] };
  supplements:         { intro: string; items: ReportItem[] };
  devices:             { intro: string; items: ReportItem[] };
  prescriptions:       string;
  screenings:          { intro: string; items: ReportItem[] };
}

// ── Store ────────────────────────────────────────────────────────────────────

interface OnboardingStore {
  answers: Partial<OnboardingAnswers>;
  prediction: PredictResult | null;
  report: LongevityReport | null;
  isLoading: boolean;
  error: string | null;

  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  setAnswers: (partial: Partial<OnboardingAnswers>) => void;
  setPrediction: (result: PredictResult) => void;
  setReport: (report: LongevityReport) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  answers: {} as Partial<OnboardingAnswers>,
  prediction: null,
  report: null,
  isLoading: false,
  error: null,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...INITIAL_STATE,

  setAnswer: (key, value) =>
    set((state) => ({ answers: { ...state.answers, [key]: value } })),

  setAnswers: (partial) =>
    set((state) => ({ answers: { ...state.answers, ...partial } })),

  setPrediction: (result) => set({ prediction: result, error: null }),

  setReport: (report) => set({ report }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set(INITIAL_STATE),
}));
