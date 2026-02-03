import { useEffect } from 'react';
import { analytics, trackEvent } from '@/lib/analytics';

export function useAnalytics() {
  useEffect(() => {
    // Initialize analytics on mount
    analytics.init();
    
    // Track page view
    trackEvent.pageView('home');
  }, []);

  return {
    track: analytics.track.bind(analytics),
    trackEvent,
  };
}

