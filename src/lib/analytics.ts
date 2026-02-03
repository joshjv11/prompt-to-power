// Analytics tracking utility
// Uses PostHog if available, otherwise falls back to console logging

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

class Analytics {
  private posthog: any = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Dynamically import PostHog to avoid SSR issues
      const posthog = (await import('posthog-js')).default;
      
      // Only initialize if we have a key (optional for now)
      const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
      if (posthogKey) {
        posthog.init(posthogKey, {
          api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
          loaded: (posthog) => {
            this.posthog = posthog;
          },
        });
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }

  track(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      this.init();
    }

    // Track with PostHog if available
    if (this.posthog) {
      this.posthog.capture(event.name, event.properties);
    } else {
      // Fallback to console in development
      if (import.meta.env.DEV) {
        console.log('[Analytics]', event.name, event.properties);
      }
    }
  }

  identify(userId: string, properties?: Record<string, unknown>) {
    if (this.posthog) {
      this.posthog.identify(userId, properties);
    }
  }

  reset() {
    if (this.posthog) {
      this.posthog.reset();
    }
  }
}

export const analytics = new Analytics();

// Initialize on module load
analytics.init();

// Event tracking functions
export const trackEvent = {
  pageView: (page: string) => {
    analytics.track({ name: 'page_view', properties: { page } });
  },
  
  fileUploaded: (fileName: string, rowCount: number, fileSize?: number) => {
    analytics.track({
      name: 'file_uploaded',
      properties: { fileName, rowCount, fileSize },
    });
  },
  
  dashboardGenerated: (source: string, visualCount: number, timeMs?: number) => {
    analytics.track({
      name: 'dashboard_generated',
      properties: { source, visualCount, timeMs },
    });
  },
  
  dashboardRefined: (refinement: string, success: boolean) => {
    analytics.track({
      name: 'dashboard_refined',
      properties: { refinement, success },
    });
  },
  
  dashboardExported: (format: string) => {
    analytics.track({
      name: 'dashboard_exported',
      properties: { format },
    });
  },
  
  exampleLoaded: (exampleId: string) => {
    analytics.track({
      name: 'example_loaded',
      properties: { exampleId },
    });
  },
  
  tutorialCompleted: () => {
    analytics.track({ name: 'tutorial_completed' });
  },
  
  tutorialSkipped: () => {
    analytics.track({ name: 'tutorial_skipped' });
  },
  
  errorOccurred: (errorType: string, errorMessage: string, context?: Record<string, unknown>) => {
    analytics.track({
      name: 'error_occurred',
      properties: { errorType, errorMessage, ...context },
    });
  },
  
  suggestionClicked: (suggestion: string, category: string) => {
    analytics.track({
      name: 'suggestion_clicked',
      properties: { suggestion, category },
    });
  },
};

