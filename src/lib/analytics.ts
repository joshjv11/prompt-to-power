import posthog from 'posthog-js';

// Initialize PostHog only if key is available
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

export const initAnalytics = () => {
  if (isInitialized || !POSTHOG_KEY) {
    console.log('Analytics: PostHog not initialized (no key or already initialized)');
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
    });
    isInitialized = true;
    console.log('Analytics: PostHog initialized');
  } catch (error) {
    console.warn('Analytics: Failed to initialize PostHog', error);
  }
};

// Safe capture wrapper
const safeCapture = (event: string, properties?: Record<string, unknown>) => {
  if (!isInitialized) return;
  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.warn('Analytics: Failed to capture event', event, error);
  }
};

// Track events
export const track = {
  // Page events
  pageViewed: () => safeCapture('page_viewed'),

  // Data events
  fileUploaded: (fileType: string, rowCount: number) =>
    safeCapture('file_uploaded', { fileType, rowCount }),

  demoDataLoaded: (datasetName: string) =>
    safeCapture('demo_data_loaded', { datasetName }),

  exampleLoaded: (exampleName: string) =>
    safeCapture('example_loaded', { exampleName }),

  // Generation events
  promptSubmitted: (promptLength: number, columnCount: number) =>
    safeCapture('prompt_submitted', { promptLength, columnCount }),

  dashboardGenerated: (visualCount: number, source: string) =>
    safeCapture('dashboard_generated', { visualCount, source }),

  generationFailed: (errorMessage: string) =>
    safeCapture('generation_failed', { errorMessage }),

  // Refinement events
  chatRefinement: (refinementCount: number, promptLength: number) =>
    safeCapture('chat_refinement', { refinementCount, promptLength }),

  suggestionClicked: (suggestion: string, category: string) =>
    safeCapture('suggestion_clicked', { suggestion, category }),

  // Chart interaction events
  chartClicked: (chartType: string, action: string) =>
    safeCapture('chart_interaction', { chartType, action }),

  drillThrough: (dimension: string, value: string) =>
    safeCapture('drill_through', { dimension, value }),

  // Export events
  exportDownloaded: (format: string) =>
    safeCapture('export_downloaded', { format }),

  specViewerOpened: () => safeCapture('spec_viewer_opened'),

  // Dashboard management
  dashboardSaved: (visualCount: number) =>
    safeCapture('dashboard_saved', { visualCount }),

  dashboardLoaded: (dashboardId: string) =>
    safeCapture('dashboard_loaded', { dashboardId }),

  dashboardShared: (method: string) =>
    safeCapture('dashboard_shared', { method }),

  // Onboarding events
  onboardingStarted: () => safeCapture('onboarding_started'),

  onboardingStepCompleted: (step: number, stepName: string) =>
    safeCapture('onboarding_step_completed', { step, stepName }),

  onboardingCompleted: () => safeCapture('onboarding_completed'),

  onboardingSkipped: (atStep: number) =>
    safeCapture('onboarding_skipped', { atStep }),

  // Session events
  sessionStarted: () => safeCapture('session_started'),

  // Feature usage
  featureUsed: (featureName: string) =>
    safeCapture('feature_used', { featureName }),

  keyboardShortcutUsed: (shortcut: string) =>
    safeCapture('keyboard_shortcut_used', { shortcut }),
};

// Identify user (for when you add auth later)
export const identifyUser = (userId: string, traits?: Record<string, unknown>) => {
  if (!isInitialized) return;
  try {
    posthog.identify(userId, traits);
  } catch (error) {
    console.warn('Analytics: Failed to identify user', error);
  }
};

// Reset user (on logout)
export const resetUser = () => {
  if (!isInitialized) return;
  try {
    posthog.reset();
  } catch (error) {
    console.warn('Analytics: Failed to reset user', error);
  }
};

export default posthog;
