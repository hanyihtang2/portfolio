---
title: "CommuteShift"
description: "A London hybrid commute fare optimizer built with React 18, TypeScript, and Tailwind CSS that compares TfL Contactless Pay-As-You-Go (PAYG) daily caps against Monthly Travelcards to surface instant monthly savings in under 60 seconds."
publishDate: 2026-10-23
tags: ["Product Management", "React 18", "TypeScript", "Vite", "Tailwind CSS", "Consumer FinTech"]
githubUrl: "https://github.com/hanyihtang2/CommuteShift"
liveUrl: "https://commute-shift.vercel.app/"
mockupImage: "/images/projects/commuteshift-mockup.png"
mockupCaption: "Two-column interactive layout pairing 3-step commute routine inputs (Left) with an instant, zero-signup PAYG vs. Travelcard savings verdict and Slack/link viral sharing actions (Right)."
mobileMockupImage: "/images/projects/commuteshift-mobile-mockup.png"
mobileMockupCaption: "Single-column progressive disclosure optimized for the 60%+ mobile traffic arriving from Slack and LinkedIn shares, stacking From/To Zone inputs and thumb-friendly day toggles."
featured: true
status: "Completed"
role: "Product Manager & Builder"
timeline: "2026 (v1.0 MVP Live)"
metrics:
  - label: "Activation Target"
    value: "> 75%"
    description: "Calculator completion rate"
  - label: "Time to Insight"
    value: "< 45s"
    description: "Zero-signup reactive calculation"
  - label: "Zone Coverage"
    value: "Zones 1–6"
    description: "Peak, Off-Peak, Daily Cap & Railcard"
  - label: "Viral Share Rate"
    value: "> 8%"
    description: "URL state link & Slack report copy"
techStack:
  languages: ["TypeScript", "JavaScript (ES Modules)", "CSS"]
  frameworks: ["React 18", "Tailwind CSS", "Vite 5"]
  infrastructure: ["Vercel", "GitHub"]
  tools: ["Lucide React", "Automated Fare Math Suite (test-all.mjs)", "URL Query State Sync"]
---

<h2 id="summary">1. Executive Summary, Problem Statement & Personas</h2>

### Context
Post-pandemic, over **70% of London knowledge workers** commute on a hybrid pattern (typically 2–3 days a week). Transport for London (TfL) operates a complex tiered fare structure consisting of Peak vs. Off-Peak single fares, Daily Caps, Monday–Sunday Weekly Caps, and Monthly/Annual Travelcards.

### The Problem
Commuters default to habitual buying behaviors. Many purchase Monthly Travelcards out of habit or default to Contactless Pay-As-You-Go (PAYG) without knowing their break-even threshold.
- **Commuter Pain:** Wasting an estimated **£30–£80/month** by using the wrong payment strategy for their hybrid routine.
- **Cognitive Load:** Manually checking TfL single fare tables, peak definitions, and monthly caps across zones is tedious and confusing.

### Product Mission
Provide London hybrid workers with an instant, clear, and mathematically accurate commute recommendation in **under 60 seconds** with **zero sign-up barrier**.

### Target Personas
- **Primary Persona — "Hybrid Harry" (The 3-Day Commuter):**
  - **Role:** Operations Analyst working in Soho (Zone 1), living in Clapham (Zone 2).
  - **Behavior:** Travels into the office Tuesday, Wednesday, and Thursday during morning peak hours (08:30) and leaves after peak (19:15).
  - **Need:** Wants to know: *"Should I keep tapping my contactless card, or is a monthly pass cheaper now that my office mandated 3 days?"*
- **Secondary Persona — "Flexible Fiona" (The Budget Optimiser):**
  - **Role:** Junior Designer living in Walthamstow (Zone 3).
  - **Behavior:** Shift-flexible. Will alter travel time by 20 minutes if it saves £40/month.

### Goals & Non-Goals
- **Goals:**
  - Deliver an accurate cost comparison between Contactless Pay-As-You-Go (PAYG) and TfL Monthly Travelcard across **Zones 1–6**.
  - Calculate the exact monthly financial delta (£ saved/lost) and dynamic weekly break-even threshold.
  - Keep time-to-insight under 60 seconds (max 3 simple user inputs plus optional Railcard toggle and quick presets).
- **Non-Goals (Out of Scope for v1):**
  - **National Rail / Out-of-boundary splitting:** Excluded to avoid API complexity; focus strictly on TfL Underground, Overground, and DLR.
  - **Bus-only passes and Cycle hires:** Excluded to keep comparison clean and binary.
  - **User Accounts / Auth:** No login required for MVP to minimize top-of-funnel drop-off; state is persisted directly in shareable URL query parameters.

---

<h2 id="design-process">2. UI Design, Scope & Functional Requirements</h2>

### UI Mockup & Interaction Architecture
Built with a high-trust UK fintech aesthetic (inspired by Monzo and Wise) using emerald green savings highlights and TfL blue (`#0019A8`) accents, the **CommuteShift London** interface (*"Stop Overpaying TfL."*) uses a purely reactive split-panel layout on desktop and a stacked progressive flow on mobile:

1. **Left Panel — `STEP 1: YOUR COMMUTE ROUTINE` (Reactive Inputs + Presets):**
   - **1. Select Zones:** Side-by-side `From` and `To` selectors supporting **Zones 1 to 6** into Zone 1 (defaulting to `Zone 2` → `Zone 1`).
   - **2. Office Days per Week:** Interactive `M` `T` `W` `Th` `F` toggle pills with a live counter (`3 days selected`) and quick test presets for 3-day hybrid (Tue–Thu), 2-day flexible, and 5-day full-time schedules.
   - **3. Commute Times:** Separate **Morning Commute** (`Peak 06:30–09:30` vs. `Off-Peak`) and **Evening Commute** (`Peak 16:00–19:00` vs. `Off-Peak`) radio groups to accurately model asymmetric routines.
   - **National Railcard Integration:** Checkbox for `16-25 / 26-30 Railcard` applying TfL's **1/3 (34%) discount** to off-peak single fares when linked to Oyster/Contactless.
2. **Right Panel — `YOUR RECOMMENDATION` (High-Contrast Verdict & Viral Loop):**
   - **Winning Strategy Banner:** Highlights `BEST CHOICE — Contactless Pay-As-You-Go` at **£80.54 / month** with a high-visibility green pill: `YOU SAVE £84.56 / month (51% cheaper)`.
   - **Itemized Cost Breakdown (Monthly):** Transparently compares the daily return cost (`£6.20`, noting it sits under the `£8.50` daily cap) against the fixed `Monthly Travelcard (Zone 1-2)` at `£165.10`.
   - **Dynamic Break-Even Rule Callout:** Calculates the exact number of full peak commute days per week required before a Monthly Travelcard becomes cheaper than PAYG (*"A Monthly Travelcard only becomes cheaper if you commute 6 full peak days every week"*).
   - **One-Click Sharing:**
     - **Copy Shareable Link:** Encodes all active user selections into URL query parameters (`from`, `days`, `am`, `pm`, `railcard`) for instant deep-linking.
     - **Share to Slack:** Generates and copies a formatted Slack summary of the monthly commute breakdown for team channels.

### MoSCoW Prioritization

- **Delivered in Baseline MVP (P0 & P1):**
  - Zone selector across **Zones 1 to 6** inbound to Zone 1.
  - Weekly office day selector (Monday–Friday toggles) + interactive schedule presets.
  - Separate Morning and Evening Peak vs. Off-Peak commute time selectors.
  - Automated calculation engine comparing PAYG (with Daily Cap enforcement) vs. Monthly Travelcard.
  - **National Railcard discount toggle** (1/3 off off-peak fares) and **URL query parameter serialization** + **Share to Slack** clipboard generator.
- **Future Fast-Follow / Backlog (P2):**
  - Annual Travelcard comparison toggle (factoring in the 12-for-10 month discount).
  - Employer Slack bot / Shareable team dashboard and carbon footprint comparison.
- **Explicit Trade-offs / Won't Have (P3):**
  - Real-time disruption alerts or live journey routing (unnecessary scope creep for a financial calculation tool).

### Functional Requirements & User Stories

#### Story 1: Inputting Commute Pattern
> **As a** London hybrid worker,  
> **I want to** select my starting zone, destination zone, and office days,  
> **So that** the calculation mirrors my actual work routine.

- **Acceptance Criteria:**
  - Default state: `Start = Zone 2`, `End = Zone 1`.
  - Day selector allows multi-selection of `Mon`, `Tue`, `Wed`, `Thu`, `Fri` (default: 3 days selected).
  - Peak/Off-peak toggles clearly display TfL peak definitions (**Peak:** `06:30–09:30` & `16:00–19:00`).

#### Story 2: Calculation Engine & Comparison
> **As a** cost-conscious commuter,  
> **I want to** see an itemized monthly breakdown,  
> **So that** I understand where my money is going.

- **Acceptance Criteria:**
  - Uses the standardized monthly formula:
    `Monthly Cost = (Daily Cost) × (Days Commuted / Week) × 4.33`
  - `Daily Cost` enforces the TfL Daily Cap (`Math.min(amFare + pmFare, dailyCap)`) for the chosen zone boundary.
  - Compares PAYG total against the fixed standard TfL Monthly Travelcard price.

#### Story 3: High-Impact Recommendation Card
> **As a** user,  
> **I want to** see an unambiguous verdict,  
> **So that** I know exactly what action to take without analyzing raw numbers.

- **Acceptance Criteria:**
  - Highlights the cheaper option with a clear badge: **BEST CHOICE / RECOMMENDED**.
  - Displays the net monthly difference and percentage saved in emerald green.
  - Displays the dynamic strategic rule showing the exact weekly peak-day break-even point.

---

<h2 id="key-metrics">3. Success Metrics (KPI Framework)</h2>

| Category | Metric | Target | Rationale |
| :--- | :--- | :--- | :--- |
| **Activation** | Calculator Completion Rate | **> 75%** | % of landed users who select inputs and view the recommendation. |
| **Core Value** | "Total £ Identified Savings" | **> £10,000 in aggregate** | Proves tangible commercial impact to end users. |
| **Viral / Growth** | Result Share Rate | **> 8%** | % of users clicking "Copy Shareable Link" or "Share to Slack" to tell teammates. |
| **Speed** | Time to Recommendation | **< 45 seconds** | Validation of frictionless, purely reactive UX. |

---

<h2 id="technical-details">4. Technical Implementation, Fare Matrix & Edge Cases</h2>

### TfL Fare Data Matrix (Zone 1 Inbound)
Rather than calling the external TfL Unified API on every keystroke, CommuteShift embeds the verified TfL Underground fare matrix directly in the client bundle. Since TfL fares adjust once per year (typically in March), static edge data eliminates network latency, prevents rate-limiting, and enables zero-cost static hosting on **Vercel**.

| Origin Route | Peak Single | Off-Peak Single | Daily Cap | Monthly Travelcard |
| :--- | :---: | :---: | :---: | :---: |
| **Within Zone 1** | £2.80 | £2.70 | £8.50 | £165.10 |
| **Zone 1 to 2** | £3.40 | £2.80 | £8.50 | £165.10 |
| **Zone 1 to 3** | £4.00 | £3.40 | £10.00 | £194.00 |
| **Zone 1 to 4** | £4.70 | £3.60 | £12.30 | £237.00 |
| **Zone 1 to 5** | £5.10 | £3.50 | £14.60 | £280.40 |
| **Zone 1 to 6** | £5.60 | £3.60 | £15.60 | £301.40 |

### Edge Cases & Automated Math Verification
1. **Daily Cap Enforcement:** Ensures any combination of peak/off-peak morning and evening single fares is automatically capped at the zone's `dailyCap`.
2. **Railcard Off-Peak Discounting:** Applies TfL's 34% (`1/3`) discount strictly to off-peak single legs when the `16-25 / 26-30 Railcard` option is active.
3. **Month Duration Standardization:** Standardizes on **4.33 working weeks per month** (`52 weeks / 12 months`) with full formula transparency in the UI breakdown.
4. **Automated Fare Math Test Suite:** Validated via `npm test` (`node test-all.mjs`) to verify daily cap boundaries, asymmetric peak/off-peak journeys, Railcard discounts, and break-even thresholds.

---

<h2 id="repository">5. Live Application & GitHub Repository</h2>

The baseline v1.0 application is deployed on **Vercel** and the source code is available on **GitHub**:

- **Live Web App:** [https://commute-shift.vercel.app/](https://commute-shift.vercel.app/)
- **GitHub Repository:** [https://github.com/hanyihtang2/CommuteShift](https://github.com/hanyihtang2/CommuteShift)
- **Local Quickstart:**
  ```bash
  # Clone the repository
  git clone https://github.com/hanyihtang2/CommuteShift.git

  # Install dependencies and start the Vite dev server
  cd CommuteShift
  npm install
  npm run dev

  # Run automated fare math verification tests
  npm test
  ```
