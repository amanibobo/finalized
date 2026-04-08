/**
 * Death Clock API client.
 *
 * For local development:
 *   iOS Simulator  → http://127.0.0.1:8000
 *   Physical device → http://<your-laptop-LAN-ip>:8000
 *
 * Set EXPO_PUBLIC_API_URL in your .env file.
 */

import type { OnboardingAnswers, PredictResult } from '@/store/onboardingStore';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

/** POST /predict — core prediction from questionnaire answers. */
export async function predictDeathClock(
  answers: Partial<OnboardingAnswers>,
): Promise<PredictResult> {
  return apiFetch<PredictResult>('/predict', { answers });
}

/** POST /explain — prediction + risk factors + retrieval queries. */
export async function explainPrediction(
  answers: Partial<OnboardingAnswers>,
): Promise<PredictResult> {
  return apiFetch<PredictResult>('/explain', { answers });
}

/** POST /what-if — compare base answers vs hypothetical overrides. */
export async function whatIfPrediction(
  answers: Partial<OnboardingAnswers>,
  overrides: Partial<OnboardingAnswers>,
): Promise<{
  base: PredictResult;
  hypothetical: PredictResult;
  delta_years: number;
  changed_fields: string[];
}> {
  return apiFetch('/what-if', { answers, overrides });
}

/** GET /health — liveness check. */
export async function checkApiHealth(): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error('API unreachable');
  return res.json();
}
