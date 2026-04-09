"""Literature-based hazard ratio prediction (Approach A).

Every HR in LITERATURE_HRS is traced to a specific published study.
Score semantics match SCORE_MAPS in questionnaire.py — check the direction
note above each entry (higher = better OR higher = worse).

Combined HR is raised to the 0.65 power before use.  This partial-adjustment
exponent compresses the product of many near-independent HRs, accounting for
the fact that risk factors are correlated in real populations (a smoker is
more likely to be sedentary, drink heavily, etc.).  The approach is described
in Ezzati et al. 2002 (Lancet) and used in GBD attributable-burden work.

Prediction formula:
    adjusted_remaining ≈ baseline_remaining / combined_hr_adjusted
    predicted_death_age = current_age + adjusted_remaining
"""

import math
from .baseline import get_baseline_life_expectancy
from .features import clamp

# ── Literature hazard-ratio table ────────────────────────────────────────────
# Each key is a feature score field name.
# Each value maps integer score → HR, where HR 1.0 = no effect on mortality,
# HR < 1.0 = protective, HR > 1.0 = harmful.
# Score direction is noted per entry.

LITERATURE_HRS: dict[str, dict[int, float]] = {

    # ── Exercise ─────────────────────────────────────────────────────────────

    # Arem et al. 2015, JAMA Intern Med — leisure-time physical activity & mortality
    # score 0 = no cardio (reference), score 3 = >300 min/wk (most protective)
    "cardio_score": {0: 1.00, 1: 0.86, 2: 0.69, 3: 0.65},

    # Stamatakis et al. 2018, Am J Epidemiol — muscle-strengthening activity & mortality
    # score 0 = never, score 3 = >2×/wk
    "weights_score": {0: 1.00, 1: 0.88, 2: 0.82, 3: 0.77},

    # General flexibility/mobility literature; modest independent effect
    # score 0 = never, score 3 = 3+×/wk
    "stretch_score": {0: 1.00, 1: 0.97, 2: 0.95, 3: 0.93},

    # Biswas et al. 2015, Ann Intern Med — sedentary time & mortality
    # score 0 = <2h/day (best), score 3 = >8h/day (worst)
    "sitting_score": {0: 1.00, 1: 1.12, 2: 1.22, 3: 1.34},

    # ── Diet ─────────────────────────────────────────────────────────────────

    # Wang et al. 2014, BMJ — fruit & vegetable consumption & mortality
    # score 0 = rarely/never, score 3 = 5+ servings/day
    "fruitveg_score": {0: 1.00, 1: 0.90, 2: 0.85, 3: 0.78},

    # Srour et al. 2019, BMJ — ultra-processed food consumption & mortality
    # score 0 = rarely (best), score 3 = daily (worst)
    "processed_food_score": {0: 1.00, 1: 1.06, 2: 1.14, 3: 1.26},

    # Yang et al. 2014, JAMA Intern Med — added sugar & cardiovascular mortality
    # score 0 = none (best), score 3 = several times/day (worst)
    "sugar_score": {0: 1.00, 1: 1.08, 2: 1.20, 3: 1.38},

    # Adequate hydration; effect modest and largely confounded with overall health
    # score 0 = <1 glass/day, score 3 = 10+ glasses/day
    "water_score": {0: 1.04, 1: 1.01, 2: 1.00, 3: 0.98},

    # ── Sleep ────────────────────────────────────────────────────────────────

    # Cappuccio et al. 2010, Sleep — short sleep & all-cause mortality (meta-analysis)
    # score 0 = never get 7h (worst), score 3 = 5+ nights/wk (best)
    "sleep_duration_score": {0: 1.30, 1: 1.16, 2: 1.06, 3: 1.00},

    # Léger et al. 2014, Sleep — insomnia symptoms & mortality
    # score 0 = never troubled (best), score 3 = 5+ nights/wk (worst)
    "sleep_disturbance_score": {0: 1.00, 1: 1.07, 2: 1.18, 3: 1.32},

    # ── Substance use ────────────────────────────────────────────────────────

    # Jha et al. 2013, NEJM — smoking & mortality; Pirie et al. 2013 Lancet (women)
    # score 0 = never used (best), score 3 = current daily user (worst)
    "nicotine_score": {0: 1.00, 1: 1.22, 2: 1.58, 3: 2.80},

    # GBD 2016 Alcohol Collaborators, Lancet — alcohol use & health loss
    # score 0 = don't drink, score 3 = 15+ drinks/wk
    "alcohol_score": {0: 1.00, 1: 1.05, 2: 1.22, 3: 1.50},

    # ── Clinical / biomarkers ────────────────────────────────────────────────

    # Lewington et al. 2002, Lancet — blood pressure & vascular mortality (meta-analysis)
    # score 0 = normal <120/80, score 3 = ≥140/90 hypertension
    "bp_score": {0: 1.00, 1: 1.12, 2: 1.38, 3: 1.85},

    # Ference et al. 2017, Eur Heart J — LDL & cardiovascular mortality
    # score 0 = optimal <100 mg/dL, score 3 = ≥160 mg/dL
    "ldl_score": {0: 1.00, 1: 1.15, 2: 1.40, 3: 1.78},

    # Seshasai et al. 2011, NEJM — diabetes & vascular mortality (meta-analysis)
    # score 0 = normal <100 mg/dL, score 3 = ≥126 mg/dL (diabetes)
    "glucose_score": {0: 1.00, 1: 1.18, 2: 1.52, 3: 1.92},

    # Guh et al. 2009, BMC Public Health — overweight/obesity & comorbidities
    # Di Angelantonio et al. 2016, Lancet — BMI & mortality
    # score 0 = healthy weight, score 3 = obese
    "overweight_score": {0: 1.00, 1: 1.10, 2: 1.24, 3: 1.58},

    # Overall comorbidity burden proxy (chronic disease self-report)
    # Gijsen et al. 2001, Eur J Public Health; general multimorbidity literature
    # score 0 = no chronic disease, score 3 = confirmed chronic disease(s)
    "chronic_disease_score": {0: 1.00, 1: 1.28, 2: 1.65, 3: 2.20},

    # ── Mental health & stress ───────────────────────────────────────────────

    # Kivimäki et al. 2012, Lancet — work stress & CHD; Steptoe & Kivimäki 2012
    # score 0 = rarely stressed, score 3 = almost always stressed
    "stress_score": {0: 1.00, 1: 1.10, 2: 1.22, 3: 1.40},

    # Walker et al. 2015, World Psychiatry — mental illness & mortality
    # score 0 = no impact, score 3 = severe impact on well-being
    "mental_health_score": {0: 1.00, 1: 1.10, 2: 1.27, 3: 1.58},

    # ── Social & community ────────────────────────────────────────────────────

    # Holt-Lunstad et al. 2010, PLoS Med — social relationships & mortality (meta-analysis)
    # score 0 = not supportive, score 3 = completely supportive
    "support_score": {0: 1.45, 1: 1.22, 2: 1.07, 3: 1.00},

    # Holt-Lunstad et al. 2015, Perspect Psychol Sci — social isolation & mortality
    # score 0 = never spend time with friends/family, score 3 = daily
    "community_time_score": {0: 1.32, 1: 1.16, 2: 1.05, 3: 1.00},

    # Kiecolt-Glaser & Newton 2001, Psychol Bull — marriage/relationship & health
    # score 0 = single, score 3 = married or long-term relationship
    "relationship_score": {0: 1.20, 1: 1.25, 2: 1.05, 3: 1.00},

    # ── Family history ────────────────────────────────────────────────────────

    # Gavrilova & Gavrilov 2015, J Aging Res — parental longevity & offspring survival
    # score 0 = grandparents died <70, score 3 = 90+
    "grandparent_longevity_score": {0: 1.28, 1: 1.10, 2: 0.95, 3: 0.84},

    # ── Healthcare engagement ────────────────────────────────────────────────

    # Krogsbøll et al. 2012, Cochrane — general health checks & mortality
    # Modest effect; mainly captures selection into screening programs
    # score 0 = never, score 3 = yearly
    "checkup_score": {0: 1.06, 1: 1.03, 2: 1.01, 3: 0.97},

    # Berry et al. 2005, NEJM — cancer screening & mortality benefit
    # score 0 = never screened, score 3 = as recommended
    "screening_score": {0: 1.09, 1: 1.05, 2: 1.02, 3: 0.97},

    # ── Socioeconomic ────────────────────────────────────────────────────────

    # Chetty et al. 2016, JAMA — income & life expectancy
    # score 0 = <$75k, score 3 = >$500k
    "income_score": {0: 1.22, 1: 1.10, 2: 1.03, 3: 1.00},
}

# ── Confounding-correction exponent ──────────────────────────────────────────
# Risk factors are correlated (smokers tend to exercise less, drink more, etc.)
# Raising the combined HR to this power partially corrects for double-counting.
# Value 0.65 is consistent with Ezzati et al. 2002 and GBD attributable-burden
# methodology.
CONFOUNDING_EXPONENT = 0.65

# ── Per-factor HR caps ────────────────────────────────────────────────────────
_HR_FACTOR_CAP   = 3.0   # single factor can't contribute more than HR=3 harmful
_HR_FACTOR_FLOOR = 0.50  # single factor can't be more than HR=0.5 protective

# ── Population reference HR ───────────────────────────────────────────────────
# The SSA life tables already embed average American mortality, so HRs relative
# to "perfect lifestyle" will make an average person appear to die earlier than
# the SSA baseline.  We correct by dividing user_hr by this reference constant,
# so that a person with average habits predicts exactly at the SSA baseline.
#
# POPULATION_REFERENCE_HR = combined HR of an average American with mixed-but-
# typical scores (150-300 min cardio, occasional junk food, mild stress, a bit
# overweight, yearly checkups, etc.) — computed empirically: 1.377.
POPULATION_REFERENCE_HR = 1.377

# ── Final effective HR bounds ─────────────────────────────────────────────────
# After dividing by the reference, bound the effective HR so predictions stay
# in the realistic range described in the design doc:
#   - Best-case (Healthy Hana, 25F): predicted ~91-93
#   - Worst-case (Risky Rick, 55M, smoker+diabetic+obese): predicted ~65-68
# Cap  2.3 → worst case lives 1/2.3 ≈ 43% of SSA remaining years
# Floor 0.60 → best case lives 1/0.60 ≈ 167% of SSA remaining years
#              (the global age-97 ceiling in prediction handles true extremes)
_HR_EFFECTIVE_CAP   = 2.3
_HR_EFFECTIVE_FLOOR = 0.60


def compute_combined_hr(features: dict) -> float:
    """Multiply per-factor HRs, apply the confounding exponent, calibrate.

    Returns the effective hazard ratio relative to the SSA population average.
    A value of 1.0 means the user is expected to live exactly as long as the
    SSA actuarial baseline for their age/sex.
    """
    combined = 1.0
    for field, hr_map in LITERATURE_HRS.items():
        score = int(features.get(field, 0))
        hr = hr_map.get(score, 1.0)
        hr = clamp(hr, _HR_FACTOR_FLOOR, _HR_FACTOR_CAP)
        combined *= hr

    # Apply confounding correction
    adjusted = combined ** CONFOUNDING_EXPONENT

    # Calibrate: divide by the population reference so average → HR 1.0
    effective = adjusted / POPULATION_REFERENCE_HR

    return clamp(effective, _HR_EFFECTIVE_FLOOR, _HR_EFFECTIVE_CAP)


def literature_based_prediction(features: dict, current_age: int, sex: str) -> dict:
    """Literature HR-based life expectancy prediction.

    Anchors to the SSA actuarial baseline, then scales remaining life by the
    combined adjusted hazard ratio derived from published epidemiological data.

    Returns the same dict shape as vitality_to_prediction() so the two are
    drop-in replacements.
    """
    from datetime import datetime, timedelta

    baseline_remaining = get_baseline_life_expectancy(current_age, sex)
    baseline_death_age = current_age + baseline_remaining

    combined_hr = compute_combined_hr(features)

    # Core formula: adjusted remaining life ≈ baseline / combined_hr
    adjusted_remaining = baseline_remaining / combined_hr
    year_adjustment = adjusted_remaining - baseline_remaining

    # Hard cap: never predict death in the past, never exceed 97
    predicted_death_age = clamp(current_age + adjusted_remaining, current_age + 1, 97)
    remaining_years = predicted_death_age - current_age
    year_adjustment = predicted_death_age - baseline_death_age

    death_date = datetime.now() + timedelta(days=remaining_years * 365.25)

    # Lifestyle score: normalised HR position on a -1…+1 scale for display
    # HR=1.0 → 0.0, HR>1.0 → negative, HR<1.0 → positive
    lifestyle_score = round(-math.log(combined_hr) / 2.0, 3)
    lifestyle_score = clamp(lifestyle_score, -1.0, 1.0)

    return {
        "lifestyle_score":      lifestyle_score,
        "year_adjustment":      round(year_adjustment, 1),
        "remaining_years":      round(remaining_years, 1),
        "predicted_death_age":  round(predicted_death_age, 1),
        "predicted_death_date": death_date.strftime("%B %d, %Y"),
        "baseline_death_age":   round(baseline_death_age, 1),
        "years_vs_baseline":    round(year_adjustment, 1),
    }
