---
title: "CommuteShift"
description: "A London hybrid commute fare optimizer that compares TfL Contactless Pay-As-You-Go (PAYG) daily/weekly caps against Monthly Travelcards to surface instant monthly savings in under 60 seconds."
publishDate: 2026-10-23
tags: ["Product Management", "Next.js", "TypeScript", "Tailwind CSS", "TfL Fare Engine", "Consumer FinTech"]
mockupImage: "/images/projects/commuteshift-mockup.png"
mockupCaption: "Two-column interactive layout pairing 3-step commute routine inputs (Left) with an instant, zero-signup PAYG vs. Travelcard savings verdict and Slack/link viral sharing actions (Right)."
mobileMockupImage: "/images/projects/commuteshift-mobile-mockup.png"
mobileMockupCaption: "Single-column progressive disclosure optimized for the 60%+ mobile traffic arriving from Slack and LinkedIn shares, stacking From/To Zone inputs and thumb-friendly day toggles."
featured: true
status: "Concept"
role: "Product Manager"
timeline: "v1.0 MVP (Ready for Development)"
metrics:
  - label: "Activation Target"
    value: "> 75%"
    description: "Calculator completion rate"
  - label: "Time to Insight"
    value: "< 45s"
    description: "Max 3 simple user inputs"
  - label: "Core Value KPI"
    value: "> £10,000"
    description: "Aggregate identified savings"
  - label: "Viral Share Rate"
    value: "> 8%"
    description: "Copy link / Share to Slack"
techStack:
  languages: ["TypeScript", "JSON"]
  frameworks: ["Next.js", "Tailwind CSS"]
  infrastructure: ["Vercel / Netlify (Zero-Cost Static Edge)"]
  tools: ["Static TfL Fare Matrix (fares.json)", "Progressive Disclosure UI"]
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
  - Deliver an accurate cost comparison between Contactless Pay-As-You-Go (PAYG) and TfL Monthly Travelcard.
  - Calculate the exact monthly financial delta (£ saved/lost).
  - Keep time-to-insight under 60 seconds (max 3 simple user inputs).
- **Non-Goals (Out of Scope for v1):**
  - **National Rail / Out-of-boundary splitting:** Excluded to avoid API complexity; focus strictly on TfL Underground, Overground, and DLR.
  - **Bus-only passes and Cycle hires:** Excluded to keep comparison clean and binary.
  - **User Accounts / Auth:** No login required for MVP to minimize top-of-funnel drop-off.

---

<h2 id="design-process">2. UI Design, Scope & Functional Requirements</h2>

### UI Mockup & Interaction Architecture
The **CommuteShift London** interface (*"Stop Overpaying TfL."*) is designed around a split-panel reactive layout that eliminates page reloads and delivers an answer in under 45 seconds:

1. **Left Panel — `STEP 1: YOUR COMMUTE ROUTINE` (3 Frictionless Inputs + Fast-Follow Railcard Toggle):**
   - **1. Select Zones:** Side-by-side `From` (`Zone 2`) and `To` (`Zone 1`) selectors defaulting to the most common inner-London hybrid corridor.
   - **2. Office Days per Week:** Interactive `M` `T` `W` `Th` `F` toggle pills with a live counter (`3 days selected`), pre-selected to a 3-day hybrid pattern.
   - **3. Commute Times:** Separate **Morning Commute** (`Peak 06:30–09:30` vs. `Off-Peak`) and **Evening Commute** (`Peak 16:00–19:00` vs. `Off-Peak`) radio groups to accurately model asymmetric routines (such as *Hybrid Harry* travelling in during morning peak and returning after 19:00 off-peak).
   - **Railcard Discount Modifier (P1):** Checkbox for `16-25 / 26-30 Railcard` applying a 1/3 discount to off-peak Oyster/Contactless single fares and daily caps.
2. **Right Panel — `YOUR RECOMMENDATION` (High-Contrast Verdict & Viral Loop):**
   - **Winning Strategy Banner:** Highlights `BEST CHOICE — Contactless Pay-As-You-Go` at **£80.54 / month** with a high-visibility green pill: `YOU SAVE £84.56 / month (51% cheaper)`.
   - **Itemized Cost Breakdown (Monthly):** Transparently compares the daily return cost (`£6.20`, noting it sits under the `£8.50` daily cap) against the fixed `Monthly Travelcard (Zone 1-2)` at `£165.10`.
   - **Strategic Break-even Rule Callout:** Plain-English guidance (*"A Monthly Travelcard only becomes cheaper if you commute 6 full peak days every week"*).
   - **Growth & Viral Sharing Actions:** Dedicated `Copy Shareable Link` and `Share to Slack` CTAs driving the `> 8%` Result Share Rate KPI.

### MoSCoW Prioritization

- **Must Have (P0 — MVP):**
  - Zone selector (Zones 1 to 4).
  - Weekly office day selector (Monday–Friday toggles).
  - Peak vs. Off-Peak commute time selector.
  - Automated calculation engine comparing PAYG (with Daily Caps) vs. Monthly Travelcard.
  - Recommendation banner showing:
    1. Winning method.
    2. £ saved per month.
    3. Breakeven threshold (e.g., *"A Travelcard only saves money if you travel 4+ days/week"*).
- **Should Have (P1 — Fast Follow):**
  - Railcard discount toggle (1/3 off off-peak Oyster fares).
  - Annual Travelcard comparison toggle (factoring in the 12-for-10 month discount).
- **Could Have (P2 — Backlog):**
  - Employer Slack bot / Shareable team dashboard.
  - Carbon footprint comparison (Tube vs. Uber/Driving).
- **Won't Have (P3 — Explicit Trade-offs):**
  - Real-time disruption alerts or live journey routing (unnecessary scope creep for a financial calculation tool).

### Functional Requirements & User Stories

#### Story 1: Inputting Commute Pattern
> **As a** London hybrid worker,  
> **I want to** select my starting zone, destination zone, and office days,  
> **So that** the calculation mirrors my actual work routine.

- **Acceptance Criteria:**
  - Default state: `Start = Zone 2`, `End = Zone 1`.
  - Day selector allows multi-selection of `Mon`, `Tue`, `Wed`, `Thu`, `Fri` (default: `Tue`, `Wed`, `Thu` selected).
  - Peak/Off-peak toggle clearly displays TfL peak definitions (**Peak:** `06:30–09:30` & `16:00–19:00`).

#### Story 2: Calculation Engine & Comparison
> **As a** cost-conscious commuter,  
> **I want to** see an itemized monthly breakdown,  
> **So that** I understand where my money is going.

- **Acceptance Criteria:**
  - Uses the standardized monthly formula:
    `Monthly Cost = (Daily Cost) × (Days Commuted / Week) × 4.33`
  - `Daily Cost` respects the TfL Daily Cap for the chosen zone boundary.
  - Compares PAYG total against the fixed standard TfL Monthly Travelcard price.

#### Story 3: High-Impact Recommendation Card
> **As a** user,  
> **I want to** see an unambiguous verdict,  
> **So that** I know exactly what action to take without analyzing raw numbers.

- **Acceptance Criteria:**
  - Highlights the cheaper option with a clear badge: **RECOMMENDED**.
  - Displays the net monthly difference in green (e.g., **Save £46.20 / month**).
  - Displays the strategic rule: *"Break-even Point: You would need to commute at least 4 peak days every week for a Travelcard to be worth it."*

---

<h2 id="key-metrics">3. Success Metrics (KPI Framework)</h2>

| Category | Metric | Target | Rationale |
| :--- | :--- | :--- | :--- |
| **Activation** | Calculator Completion Rate | **> 75%** | % of landed users who select inputs and view the recommendation. |
| **Core Value** | "Total £ Identified Savings" | **> £10,000 in aggregate** | Proves tangible commercial impact to end users. |
| **Viral / Growth** | Result Share Rate | **> 8%** | % of users clicking "Copy Link / Share to Slack" to tell teammates. |
| **Speed** | Time to Recommendation | **< 45 seconds** | Validation of frictionless UX. |

---

<h2 id="technical-details">4. Edge Cases, Technical Assumptions & Next Steps</h2>

### Edge Cases & Handling
1. **User works 5 days a week during Peak:**
   - *Engine Behavior:* Ensure Weekly Cap and Monthly Travelcard are properly balanced; Monthly Travelcard should emerge as the winner or dead heat.
2. **Reverse Commuting (Zone 1 to Zone 3):**
   - *Engine Behavior:* TfL treats Zone 1–3 and Zone 3–1 travel symmetrically for capping; clarify this in an informational tooltip.
3. **Month Duration Fluctuations:**
   - *Engine Behavior:* Standardize on **4.33 weeks per month** (`52 weeks / 12 months`) and state this transparency note in the footer.

### Technical Assumptions & Architectural Trade-offs
- **Static Data Table (`fares.json`) vs. Live TfL Unified API:**
  - *Decision:* Fare data will be stored locally in a static `fares.json` file rather than hitting the live TfL Unified API.
  - *PM Justification:* TfL fares only adjust once per year (typically in March). Hardcoding fares eliminates external API latency, removes rate-limiting risks, and allows zero-cost hosting on Vercel/Netlify.
- **Responsive Mobile-First Design:**
  - Over 60% of traffic is expected via mobile links shared on LinkedIn or Slack, requiring a mobile-first 3-step progressive disclosure layout.

```json
{
  "effectiveDate": "2026-03-01",
  "weeksPerMonth": 4.33,
  "zones": {
    "1-2": {
      "peakSingle": 3.50,
      "offPeakSingle": 2.90,
      "dailyCap": 8.90,
      "weeklyCap": 44.70,
      "monthlyTravelcard": 171.70
    },
    "1-3": {
      "peakSingle": 3.80,
      "offPeakSingle": 3.10,
      "dailyCap": 10.50,
      "weeklyCap": 52.50,
      "monthlyTravelcard": 201.60
    },
    "1-4": {
      "peakSingle": 4.60,
      "offPeakSingle": 3.40,
      "dailyCap": 12.80,
      "weeklyCap": 64.20,
      "monthlyTravelcard": 246.60
    }
  }
}
```

### Next Steps & Implementation Roadmap
1. **Wireframe UI Flow:** 3-step progressive disclosure screen (Zones → Office Days & Peak/Off-Peak → Instant Recommendation Card).
2. **Setup Fare Matrix:** Populate `fares.json` with current London Underground Zone 1–4 Peak, Off-Peak, Daily Cap, Weekly Cap, and Monthly Travelcard values.
3. **Build Prototype:** Code MVP frontend using Next.js and Tailwind CSS.

