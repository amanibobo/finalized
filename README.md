demo vid will go here

deathclock clone built for Deep24 bounty. transforms actuarial science into an engaging ios experience asking dozens of health questions, running lifespan calculations based on real mortality research, and delivering predictions through thoughtfully designed ui.

for usage and more:

[project page](https://animate3d.github.io/) , [youtube video](https://arxiv.org/abs/2407.11398) , [figma](https://www.youtube.com/watch?v=qkaeeGzLnY8) , 
[google colab](https://huggingface.co/datasets/yanqinJiang/MV-Video) , 
[deep24 bounty submission](https://drive.google.com/file/d/1iFSuCAwWBVzlLCQH32yoikz8M2qBJ8rP/view?usp=sharing) 

---

## What is Death Clock?

Death Clock is a longevity prediction engine that estimates your life expectancy based on your lifestyle, health biomarkers, and family history. Unlike generic calculators that ask a handful of questions, Death Clock uses a **29-question lifestyle survey** combined with **actuarial science** and **peer-reviewed epidemiological research** to deliver a personalized prediction.

### What makes Death Clock different?

| Traditional Calculators | Death Clock |
|------------------------|-------------|
| 5-10 questions | 29 comprehensive questions |
| Arbitrary coefficients | Hazard ratios from published studies |
| One-size-fits-all | Sex-specific baselines |
| No context | AI-powered explanations and reports |

---

## The Science Behind Death Clock

### Vitality Model Architecture

Death Clock models health as a **vitality score** that drifts downward over time. The model is based on a stochastic process where death occurs when vitality hits zero:

```
y(t) = y₀ + ζt + σW(t) + jumps
```

| Parameter | Meaning |
|-----------|---------|
| **y₀** | Initial vitality — how healthy you are right now |
| **ζ (zeta)** | Drift rate — speed of health decline (always ≤ 0) |
| **σ (sigma)** | Volatility — uncertainty in your trajectory |
| **λ (lambda)** | Jump hazard — probability of sudden health shocks |

The model is anchored to real-world data: Li et al. 2018 (Circulation) showed a ~14-year life expectancy gap between people with 0 vs 5 healthy factors. Death Clock's maximum vitality swing is calibrated to this finding.

### Literature-Based Hazard Ratios

Every risk factor in Death Clock maps to **specific published studies**:

| Category | Source | Effect |
|----------|--------|--------|
| Exercise (cardio) | Arem et al. 2015, JAMA Intern Med | 35% reduction at highest activity |
| Blood pressure | Lewington et al. 2002, Lancet | HR 1.85 at hypertension |
| Smoking | Jha et al. 2013, NEJM | HR 2.80 for daily smokers |
| BMI/Obesity | Di Angelantonio et al. 2016, Lancet | HR 1.58 for obese |
| Social isolation | Holt-Lunstad et al. 2015, Perspect Psychol Sci | HR 1.32 |

The combined hazard ratio is raised to the **0.65 power** to correct for risk factor correlation (Ezzati et al. 2002, Lancet).

### Actuarial Foundation

Death Clock uses **SSA 2022 life tables** as the baseline, representing the average remaining years of life for Americans by age and sex. Your prediction is then scaled relative to this baseline based on your lifestyle hazard ratio.

---

## Features

### Mobile App (Expo/React Native)
- **29-question onboarding survey** covering demographics, lifestyle, diet, exercise, sleep, social factors, clinical biomarkers, and family history
- **Real-time prediction** with animated countdown to your predicted death date
- **Risk factor breakdown** showing your highest-impact areas
- **What-If mode** — compare your current lifestyle vs hypothetical changes
- **AI Longevity Report** — personalized PDF-ready report with milestones, recommendations, and actionable steps
- **AI Health Concierge** — chat with context-aware assistant trained on your health profile

### Backend API (FastAPI)
- **`POST /predict`** — Full prediction from questionnaire answers
- **`POST /explain`** — Prediction with risk factor breakdown and retrieval queries
- **`POST /what-if`** — Compare base predictions vs hypothetical lifestyle changes
- **`POST /report`** — Generate AI-powered longevity report
- **`POST /chat`** — RAG-grounded health concierge chat

### Jupyter Notebook
- Full development pipeline from data to model
- NHANES data integration for Cox PH calibration
- PubMed paper ingestion and embedding pipeline
- ChromaDB vector store for evidence retrieval
- Model evaluation and export

---

## Quick Start

### Mobile App

```bash
cd bruh
npm install
npx expo start
```

### Backend API

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to backend/.env
uvicorn app.main:app --reload --port 8000
```

### Connect App to Backend

In `bruh/.env`:
```bash
# iOS Simulator
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000

# Physical device on same WiFi — use your laptop's LAN IP
EXPO_PUBLIC_API_URL=http://192.168.1.XX:8000
```

---

## Explore the Model

Want to understand how the predictions work or run your own analysis? Open the interactive notebook:

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/)

The notebook covers:
1. Setup & Configuration
2. Questionnaire Schema & Scoring
3. Feature Engineering
4. SSA Baseline Life Tables
5. Vitality Model Implementation
6. Cox Proportional Hazards (NHANES)
7. Paper Ingestion Pipeline
8. Chunking, Embeddings & Vector DB
9. RAG Retrieval & Explanation Assembly
10. Evaluation & Export

---

## Project Structure

```
├── bruh/                        # Expo/React Native mobile app
│   ├── store/                   # Zustand state management
│   └── assets/                  # Images, fonts
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py             # API routes
│   │   ├── schemas.py          # Pydantic models
│   │   └── model/
│   │       ├── questionnaire.py # Survey schema & scoring
│   │       ├── features.py     # Feature engineering
│   │       ├── baseline.py     # SSA life tables
│   │       ├── vitality.py     # Vitality model
│   │       ├── literature.py   # Hazard ratios from literature
│   │       ├── cox.py          # Cox PH calibration
│   │       ├── explain.py      # Risk factors & explanations
│   │       ├── chat.py         # AI concierge prompts
│   │       └── report.py       # Longevity report generation
│   │
│   └── requirements.txt
│
└── death-clock-v2.ipynb         # Full development notebook
```

