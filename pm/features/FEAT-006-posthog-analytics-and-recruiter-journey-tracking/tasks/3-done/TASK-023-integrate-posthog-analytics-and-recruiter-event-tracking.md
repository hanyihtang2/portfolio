---
id: TASK-023
parent_feature: FEAT-006
title: Integrate PostHog Analytics and Recruiter Event Tracking
status: done
priority: P1
areas:
  - analytics/posthog
  - pages/core
target_paths:
  - src/components/Analytics.astro
  - src/layouts/BaseLayout.astro
  - src/lib/analytics.ts
  - .env.example
branch: feat/feat-006-integrate-posthog-analytics-and-recruiter-event-tracking
dependencies: []
assigned_to: human
created_at: 2026-10-30
updated_at: 2026-10-30
---

# TASK-023: Integrate PostHog Analytics and Recruiter Event Tracking

## 1. Objective

Integrate PostHog web analytics and session recording into the portfolio site. Provide production-gated client initialization, privacy-preserving defaults (masking, respect DNT, cookie-free persistence), and declarative custom event tracking for high-value recruiter interactions (resume downloads, project demo clicks, outbound GitHub links).

---

## 2. Context & PRD Reference

- **Parent PRD:** [`../../prd.md`](../prd.md) (FEAT-006: PostHog Analytics and Recruiter Journey Tracking)
- **Target Areas:** `analytics/posthog`, `pages/core` (see `pm/areas.json`)
- **Key Files:**
  - `src/components/Analytics.astro` (new component)
  - `src/lib/analytics.ts` (new typed event definitions & helpers)
  - `src/layouts/BaseLayout.astro` (layout integration)
  - `.env.example` (environment variable contract)

---

## 3. Technical Implementation Details

1. **Environment Configuration (`.env.example`):**
   - Define public environment keys:
     ```env
     PUBLIC_POSTHOG_API_KEY=phc_your_posthog_key_here
     PUBLIC_POSTHOG_HOST=https://us.i.posthog.com # or https://eu.i.posthog.com
     ```
   - In GitHub Pages deployment workflows, pass these from GitHub Repository Secrets during the build phase.

2. **Typed Analytics Contract (`src/lib/analytics.ts`):**
   - Define strongly typed event names and payloads:
     ```typescript
     export type AnalyticsEvent =
       | { name: 'resume_click'; properties: { location: string; format?: 'pdf' | 'html' } }
       | { name: 'outbound_demo_click'; properties: { project: string; url: string } }
       | { name: 'outbound_github_click'; properties: { project?: string; url: string } }
       | { name: 'contact_click'; properties: { channel: 'linkedin' | 'email' | 'github' } }
       | { name: 'case_study_scroll_depth'; properties: { project: string; depth_percentage: number } };
     ```
   - Provide a safe dispatch helper:
     ```typescript
     export function trackEvent<T extends AnalyticsEvent['name']>(
       name: T,
       properties?: Extract<AnalyticsEvent, { name: T }>['properties']
     ): void;
     ```

3. **Analytics Head Component (`src/components/Analytics.astro`):**
   - Inject the official lightweight asynchronous PostHog snippet into `<head>`.
   - Gate execution with `import.meta.env.PROD && apiKey`.
   - Configuration flags:
     - `api_host`: `import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'`
     - `person_profiles`: `'identified_only'` (avoid polluting anonymous profiles)
     - `respect_dnt`: `true`
     - `session_recording`: `{ maskAllInputs: true, maskTextSelector: '[data-ph-mask]' }`
     - `autocapture`: `true`
   - Include a lightweight global event listener for elements with `data-analytics-event="event_name"` and `data-analytics-props='{...}'`.

4. **Layout Integration (`src/layouts/BaseLayout.astro`):**
   - Import and render `<Analytics />` inside `<head>`.

5. **Tag High-Value Interactive Elements:**
   - Add data attributes to:
     - Navbar Resume link & CV download button.
     - Homepage Dual-Track matrix CV link (`data-analytics-event="resume_click"`).
     - Project Cards outbound live demo / code buttons.
     - Footer contact icons.

---

## 4. Acceptance Criteria

- [x] `src/components/Analytics.astro` created and imported into `src/layouts/BaseLayout.astro`.
- [x] PostHog script only activates when `import.meta.env.PROD` is true and `PUBLIC_POSTHOG_API_KEY` is present.
- [x] Session recording is enabled with privacy-safe input and text masking.
- [x] High-value CTA elements (Resume, Demo links, GitHub source links) are tagged with declarative tracking attributes.
- [x] `src/lib/analytics.ts` exports TypeScript types for all supported events.
- [x] `.env.example` documents `PUBLIC_POSTHOG_API_KEY` and `PUBLIC_POSTHOG_HOST`.
- [x] Astro static check and build pass cleanly: `npm run build`.
- [x] No regressions in Lighthouse performance score (zero blocking JS; inlined module and deferred async snippet).

---

## 5. Agent Run Notes & Prompt Guidance

> **Agent Instructions:**
> When implementing this task:
> 1. Restrict file modifications strictly to `target_paths`.
> 2. Ensure PostHog never loads or throws errors during SSR/static prerendering (`typeof window !== 'undefined'`).
> 3. Verify clean build with `npm run build` before moving task to `2-review`.

### Execution Log / Decisions
- **Environment**: Documented `PUBLIC_POSTHOG_API_KEY` and `PUBLIC_POSTHOG_HOST` in `.env.example`.
- **Contracts**: Created `src/lib/analytics.ts` with strongly-typed `EventMap` supporting `resume_click`, `outbound_demo_click`, `outbound_github_click`, `contact_click`, `case_study_scroll_depth`, and `navigation_click`.
- **Component**: Built `src/components/Analytics.astro` with the asynchronous PostHog snippet, gated to production builds with a configured API key. Initialized with `respect_dnt: true`, `person_profiles: 'identified_only'`, and session recording input masking.
- **Declarative Listener**: Attached global click delegation listener in `Analytics.astro` to capture `[data-analytics-event]` attributes without writing inline scripts on buttons.
- **Tagged Elements**:
  - `Navbar.astro`: Desktop & Mobile Resume and GitHub links.
  - `index.astro`: Dual-Track Core Competencies CV link.
  - `ProjectCard.astro`: Case study, GitHub repo, and Live Demo links.
  - `ProjectDetailLayout.astro`: Header GitHub Repo and Live Demo buttons.
  - `resume.astro`: PDF Print/Save button, Contact Me button, and LinkedIn link.
  - `contact.astro`: Direct email, LinkedIn, and GitHub cards, plus successful form submission tracking.
- **Verification**:
  - `astro check`: 26 files, 0 errors, 0 warnings, 0 hints.
  - `astro build`: 16/16 static routes generated successfully in 1.19s with minified inline module script.
