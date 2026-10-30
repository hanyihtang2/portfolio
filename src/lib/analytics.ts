/**
 * PostHog Analytics Client Helpers & Type Contracts
 *
 * Provides typed event dispatching and declarative event binding
 * for recruiter navigation, project interactions, and conversion tracking.
 */

export interface EventMap {
  resume_click: {
    location: string;
    format?: 'pdf' | 'html';
  };
  outbound_demo_click: {
    project: string;
    url: string;
  };
  outbound_github_click: {
    project?: string;
    url: string;
  };
  contact_click: {
    channel: 'linkedin' | 'email' | 'github' | 'form';
    location?: string;
  };
  case_study_scroll_depth: {
    project: string;
    depth_percentage: number;
  };
  navigation_click: {
    label: string;
    target: string;
  };
}

export type EventName = keyof EventMap;

declare global {
  interface Window {
    posthog?: {
      capture: (eventName: string, properties?: Record<string, unknown>) => void;
      identify?: (distinctId: string, userProperties?: Record<string, unknown>) => void;
      isFeatureEnabled?: (key: string) => boolean;
      onFeatureFlags?: (callback: () => void) => void;
      has_opted_out_capturing?: () => boolean;
      opt_in_capturing?: () => void;
      opt_out_capturing?: () => void;
    };
  }
}

/**
 * Safely dispatch an analytics event to PostHog.
 * In development, logs event data to console for local testing.
 */
export function trackEvent<E extends EventName>(
  name: E,
  properties?: EventMap[E]
): void {
  if (typeof window === 'undefined') return;

  if (window.posthog && typeof window.posthog.capture === 'function') {
    window.posthog.capture(name, properties as Record<string, unknown>);
  } else if (import.meta.env.DEV) {
    console.debug(`[Analytics:DEV] ${name}`, properties);
  }
}

/**
 * Initializes global declarative click listener.
 * Scans for `data-analytics-event` attributes on clicked elements or their parents.
 */
export function initDeclarativeAnalytics(): void {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const el = typeof target.closest === 'function'
      ? target.closest<HTMLElement>('[data-analytics-event]')
      : null;
    if (!el) return;

    const eventName = el.getAttribute('data-analytics-event') as EventName | null;
    if (!eventName) return;

    // Collect properties from data-analytics-props JSON or individual data-analytics-* attributes
    let props: Record<string, unknown> = {};

    const rawProps = el.getAttribute('data-analytics-props');
    if (rawProps) {
      try {
        const parsed = JSON.parse(rawProps);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          props = parsed as Record<string, unknown>;
        }
      } catch (err) {
        console.warn('[Analytics] Invalid JSON in data-analytics-props', rawProps, err);
      }
    }

    // Individual fallback attributes
    const location = el.getAttribute('data-analytics-location');
    if (location) props.location = location;

    const project = el.getAttribute('data-analytics-project');
    if (project) props.project = project;

    const url = el.getAttribute('data-analytics-url') || el.getAttribute('href');
    if (url) props.url = url;

    const channel = el.getAttribute('data-analytics-channel');
    if (channel) props.channel = channel;

    const format = el.getAttribute('data-analytics-format');
    if (format) props.format = format;

    trackEvent(eventName, props as any);
  });
}
