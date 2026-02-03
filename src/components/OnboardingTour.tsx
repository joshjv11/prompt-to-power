import { useEffect, useState, useMemo } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useOnboarding } from '@/hooks/useOnboarding';
import { trackEvent } from '@/lib/analytics';

interface OnboardingTourProps {
  hasData: boolean;
  hasDashboard: boolean;
}

export function OnboardingTour({ hasData, hasDashboard }: OnboardingTourProps) {
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();
  const [runTour, setRunTour] = useState(false);

  // Build steps dynamically based on current state
  const steps: Step[] = useMemo(() => {
    const baseSteps: Step[] = [
      {
        target: '#file-upload',
        content: (
          <div>
            <h3 className="font-semibold mb-2 text-base">Step 1: Upload Your Data</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your CSV or Excel file here. You can drag and drop or click to browse. 
              We'll automatically analyze your data structure and detect columns.
            </p>
          </div>
        ),
        placement: 'bottom' as const,
        disableBeacon: false,
        disableOverlayClose: false,
        hideCloseButton: false,
      },
      {
        target: '#prompt',
        content: (
          <div>
            <h3 className="font-semibold mb-2 text-base">Step 2: Describe Your Dashboard</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Type what you want in plain English. Be specific! For example:
              <br />
              <em className="text-xs mt-1 block bg-muted/50 p-2 rounded italic">
                "Show sales trends by region with bar charts, include top products table, and monthly revenue trends"
              </em>
            </p>
          </div>
        ),
        placement: 'bottom' as const,
        disableBeacon: false,
        disableOverlayClose: false,
        hideCloseButton: false,
      },
      {
        target: 'button[type="submit"]',
        content: (
          <div>
            <h3 className="font-semibold mb-2 text-base">Step 3: Generate Dashboard</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click this button to generate your dashboard. Our AI will create visualizations based on your description. 
              This usually takes 10-30 seconds. Watch the magic happen! ✨
            </p>
          </div>
        ),
        placement: 'top' as const,
        disableBeacon: false,
        disableOverlayClose: false,
        hideCloseButton: false,
      },
    ];

    // Only add chat and export steps if dashboard exists
    if (hasDashboard) {
      baseSteps.push(
        {
          target: '[data-chat-panel]',
          content: (
            <div>
              <h3 className="font-semibold mb-2 text-base">Step 4: Refine Your Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use this chat to refine your dashboard. Try natural language commands like:
                <br />
                <em className="text-xs mt-1 block bg-muted/50 p-2 rounded italic">
                  "Change the bar chart to a pie chart" or "Add a card showing total revenue"
                </em>
              </p>
            </div>
          ),
          placement: 'left' as const,
          disableBeacon: false,
          disableOverlayClose: false,
          hideCloseButton: false,
          spotlightClicks: true,
        },
        {
          target: '[data-export-button]',
          content: (
            <div>
              <h3 className="font-semibold mb-2 text-base">Step 5: Export Your Dashboard</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Export your dashboard to Power BI, PDF, or other formats. Your dashboard spec includes 
                complete DAX measures and M code - ready to import into Power BI Desktop!
              </p>
            </div>
          ),
          placement: 'bottom' as const,
          disableBeacon: false,
          disableOverlayClose: false,
          hideCloseButton: false,
          spotlightClicks: true,
        }
      );
    } else {
      // If no dashboard yet, add a completion step
      baseSteps.push({
        target: '#file-upload',
        content: (
          <div>
            <h3 className="font-semibold mb-2 text-base">You're All Set! 🎉</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once you generate your dashboard, you can refine it with the chat panel and export it to Power BI, PDF, or other formats. 
              Let's get started - upload your data and describe your dashboard!
            </p>
          </div>
        ),
        placement: 'bottom' as const,
        disableBeacon: false,
        disableOverlayClose: false,
        hideCloseButton: false,
      });
    }

    return baseSteps;
  }, [hasDashboard]);

  useEffect(() => {
    if (!shouldShowOnboarding) {
      setRunTour(false);
      return;
    }

    // Delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      // Check if primary target exists before starting tour
      const fileUpload = document.querySelector('#file-upload');
      const promptField = document.querySelector('#prompt');
      
      // At minimum, we need file upload or prompt field
      if (fileUpload || promptField) {
        setRunTour(true);
      } else {
        // Retry after a bit more time if targets don't exist yet
        setTimeout(() => {
          const fileUploadRetry = document.querySelector('#file-upload');
          const promptRetry = document.querySelector('#prompt');
          if (fileUploadRetry || promptRetry) {
            setRunTour(true);
          }
        }, 1200);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [shouldShowOnboarding, hasData]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type, step } = data;
    
    // Handle step not found gracefully
    if (type === 'step:not_found' || type === 'target_not_found') {
      console.warn('Tour target not found for step:', step?.target);
      // Continue to next step anyway
      return;
    }
    
    if (status === STATUS.FINISHED) {
      completeOnboarding();
      trackEvent.tutorialCompleted();
      setRunTour(false);
    } else if (status === STATUS.SKIPPED) {
      completeOnboarding();
      trackEvent.tutorialSkipped();
      setRunTour(false);
    } else if (action === 'prev' && index === 0) {
      // User went back from first step, allow them to skip
      setRunTour(false);
      completeOnboarding();
    }
  };

  if (!shouldShowOnboarding || !runTour || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      callback={handleJoyrideCallback}
      continuous
      showProgress
      showSkipButton
      run={runTour}
      disableOverlayClose={false}
      disableScrolling={false}
      hideCloseButton={false}
      scrollToFirstStep={true}
      spotlightClicks={false}
      styles={{
        options: {
          primaryColor: 'hsl(199, 89%, 48%)',
          zIndex: 10000,
          width: 400,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '8px',
          color: 'hsl(var(--foreground))',
        },
        tooltipContent: {
          padding: '4px 0',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'hsl(var(--muted-foreground))',
        },
        buttonNext: {
          backgroundColor: 'hsl(199, 89%, 48%)',
          borderRadius: '6px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 500,
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        },
        buttonBack: {
          color: 'hsl(199, 89%, 48%)',
          marginRight: '8px',
          fontSize: '14px',
          padding: '10px 16px',
          cursor: 'pointer',
        },
        buttonSkip: {
          color: 'hsl(var(--muted-foreground))',
          fontSize: '13px',
          padding: '10px 16px',
          cursor: 'pointer',
        },
        spotlight: {
          borderRadius: '12px',
          boxShadow: '0 0 0 4px hsl(199 89% 48% / 0.4)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
        },
        beacon: {
          inner: {
            backgroundColor: 'hsl(199, 89%, 48%)',
            border: '2px solid hsl(199, 89%, 48%)',
          },
          outer: {
            border: '2px solid hsl(199, 89%, 48%)',
          },
        },
      }}
      locale={{
        back: '← Back',
        close: '✕ Close',
        last: 'Finish Tour ✓',
        next: 'Next →',
        skip: 'Skip Tutorial',
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          arrow: {
            color: 'hsl(var(--card))',
          },
        },
      }}
    />
  );
}
