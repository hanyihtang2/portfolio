---
id: FEAT-006
title: PostHog Analytics and Recruiter Journey Tracking
status: ready
priority: P1
target_release: v0.6.0
lead: human
created_at: 2026-10-30
branch_prefix: feat/posthog-analytics-and-recruiter-journey-tracking
areas:
  - analytics/posthog
  - pages/core
---

# PRD: PostHog Analytics and Recruiter Journey Tracking

## 1. Executive Summary & Problem Statement

The portfolio serves as the central proof-of-work asset for job applications, recruiter outreach, and peer engineering review. However, the site currently operates with **zero telemetry**:
1. **Application Blindness:** When submitting applications with portfolio links or custom referral parameters, there is no visibility into whether hiring managers actually opened the site.
2. **Engagement & Drop-Off Ambiguity:** It is impossible to know whether visitors skim the hero section or read deep technical sections of case studies (*PlateMark*, *MAKER*, *CommuteShift*).
3. **Conversion Tracking Deficit:** Clicks on high-value conversion actions—such as downloading the resume CV, navigating to GitHub source repositories, or launching live interactive demos—are not measured.

**Solution:**
Integrate **PostHog** as the portfolio's analytics and behavioral insight platform. PostHog provides product analytics, session replay (allowing review of actual navigation patterns), conversion funnels, and declarative event capture with a generous free tier (1,000,000 events/month, 5,000 recordings/month). The integration will be lightweight, production-only, cookie-banner-free, and designed to preserve the site's sub-second load times and 100/100 Lighthouse score.

---

## 2. User Stories

- **As a Portfolio Owner (PM & Engineer)**, I want to track referrer sources, UTM parameters, and inbound hiring pipelines (e.g. `?ref=linkedin`, `?utm_source=company-application`) so that I can measure the effectiveness of application outreach.
- **As a Portfolio Owner**, I want event telemetry on high-value interactions (resume views/downloads, outbound demo links, GitHub links, contact clicks) so that I can monitor funnel conversion rates.
- **As a Portfolio Owner**, I want session replays of anonymized visitor journeys so that I can observe where recruiters spend time on technical case studies and identify layout or friction points.
- **As a Site Visitor / Recruiter**, I want a pristine, fast-loading portfolio with zero intrusive cookie consent popups or blocking scripts.
- **As a Developer**, I want telemetry to execute strictly in production builds (`import.meta.env.PROD`), keeping local development and automated CI runs completely isolated from production datasets.

---

## 3. Scope & Key Capabilities

### In Scope
- **PostHog Client Initialization Component (`src/components/Analytics.astro`):**
  - Lightweight, asynchronous initialization loaded in the `<head>` of [`src/layouts/BaseLayout.astro`](../../src/layouts/BaseLayout.astro).
  - Environment gating: Active only when `import.meta.env.PROD === true` and required public keys are present.
  - Configurable via Astro public environment variables (`PUBLIC_POSTHOG_API_KEY`, `PUBLIC_POSTHOG_HOST`).
- **Privacy & Performance Configuration:**
  - Cookie-less / persistence configuration set to `localStorage+cookie` or memory to avoid invasive tracking.
  - Automatic masking of sensitive text elements during session recordings (`mask_all_text: false`, `mask_all_element_attributes: false` with targeted redaction classes).
  - Respect for browser `Do Not Track` (`respect_dnt: true`).
- **High-Value Custom Event Telemetry:**
  - `resume_view` & `resume_download`: Triggered when visitors click the CV/Resume buttons from the navigation, homepage matrix, or resume page.
  - `project_outbound_click`: Captures outbound clicks to live project demos, GitHub repositories, and package registries.
  - `contact_click`: Captures clicks on LinkedIn, GitHub, or mailto links.
  - `case_study_scroll_milestone`: Optional milestone telemetry (e.g., reaching 50% / 90% scroll depth on case study pages).
- **Declarative HTML Event Helper:**
  - Standardized `data-analytics-event` and `data-analytics-prop-*` attributes allowing simple declarative tagging on any Astro link or button without inline scripts.

### Out of Scope
- Reverse-proxy rewrite rules on GitHub Pages (PostHog US/EU cloud endpoints will be used directly).
- Invasive fingerprinting or collecting personally identifiable information (PII).
- Intrusive feedback widgets or survey modals.

---

## 4. User Experience & Funnel Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Inbound Traffic Channels                        │
│         (LinkedIn Application, Resume PDF Link, GitHub Profile)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ UTM Attribution (?ref=...)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Landing Page Impression                         │
│                    (Home / Projects Index / Resume)                    │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│        Case Study Engagement         │ │       Direct Conversion       │
│  (PlateMark / MAKER / CommuteShift)  │ │  (Click "Full CV & History")  │
│  • Scroll depth milestones           │ └───────────────┬───────────────┘
│  • Architecture diagram views        │                 │
└───────────────────┬──────────────────┘                 │
                    │                                    │
                    ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        High-Value Final Actions                        │
│           • Outbound Demo Click  • GitHub Source Repo Click            │
│           • PDF Resume Download  • LinkedIn Profile Connect            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Technical Architecture & Constraints

- **Primary Code Areas**:
  - `analytics/posthog`: Client configuration, session recording settings, event helpers.
  - `pages/core`: Integration into [`src/layouts/BaseLayout.astro`](../../src/layouts/BaseLayout.astro) and interactive buttons.
- **Dependencies & Bundle Budget**:
  - Load script asynchronously via PostHog JS web snippet or `@posthog/js` dynamic client import.
  - Zero impact on First Contentful Paint (FCP) and Time to Interactive (TTI).
- **Constraints & Safety**:
  - **Static Compatibility:** Must run safely on static Astro builds (`base: '/portfolio'`).
  - **Dev Safety:** Must not send mock events or recordings during `npm run dev` or `npm run build`.
  - **Type Safety:** Typed analytics event map in TypeScript to prevent typo-driven telemetry fragmentation.

---

## 6. Acceptance Criteria

- [ ] PostHog client script loads asynchronously in `BaseLayout.astro` only when `import.meta.env.PROD` is true.
- [ ] Environment variables (`PUBLIC_POSTHOG_API_KEY`, `PUBLIC_POSTHOG_HOST`) documented in `.env.example`.
- [ ] Session replay is enabled with privacy-safe text/attribute masking defaults.
- [ ] High-value actions (Resume clicks, outbound demo/GitHub links) dispatch structured custom events.
- [ ] Declarative event tracking helper handles client-side click events cleanly across Astro pages.
- [ ] Local build passes cleanly (`npm run build`) with zero type errors or hydration warnings.
- [ ] Lighthouse performance score remains >= 95.

---

## 7. Task Breakdown Index

- [ ] [TASK-023: Integrate PostHog Analytics and Recruiter Event Tracking](./tasks/0-backlog/TASK-023-integrate-posthog-analytics-and-recruiter-event-tracking.md) (`P1`, Backlog)
