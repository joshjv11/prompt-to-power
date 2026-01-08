import { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/store/appStore';
import { track } from '@/lib/analytics';

const ONBOARDING_KEY = 'promptbi-onboarding-completed';

const tourSteps: Step[] = [
  {
    target: '.file-uploader',
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-lg mb-2">📁 Upload Your Data</h3>
        <p className="text-muted-foreground">
          Drag your CSV or Excel file here, or click to browse. You can also try our sample datasets!
        </p>
      </div>
    ),
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.demo-data-loader',
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-lg mb-2">🎯 Try Sample Data</h3>
        <p className="text-muted-foreground">
          Not ready to upload? Click here to load sample sales data instantly!
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '.prompt-form',
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-lg mb-2">✍️ Describe Your Dashboard</h3>
        <p className="text-muted-foreground">
          Tell the AI what you want to see in plain English. For example: "Show sales by region with a bar chart and monthly trends"
        </p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '.generate-button',
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-lg mb-2">🚀 Generate Dashboard</h3>
        <p className="text-muted-foreground">
          Click Generate or press ⌘G to create your AI-powered dashboard. Watch the magic happen! ✨
        </p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '.dashboard-preview-area',
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-lg mb-2">📊 Dashboard Preview</h3>
        <p className="text-muted-foreground">
          Your charts appear here instantly. Click on charts to filter across all visuals!
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '.refinement-chat',
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-lg mb-2">💬 Refine with Chat</h3>
        <p className="text-muted-foreground">
          Want changes? Just ask! "Add a pie chart", "Change colors to blue", "Filter to last 6 months"
        </p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '.export-button',
    content: (
      <div className="text-left">
        <h3 className="font-semibold text-lg mb-2">📤 Export to Power BI</h3>
        <p className="text-muted-foreground">
          Export ready-to-use Power BI files. No DAX required! You're all set. 🎉
        </p>
      </div>
    ),
    placement: 'bottom',
  },
];

const stepNames = [
  'file-upload',
  'demo-data',
  'prompt-form',
  'generate-button',
  'dashboard-preview',
  'refinement-chat',
  'export-button',
];

interface OnboardingTourProps {
  forceRun?: boolean;
  onComplete?: () => void;
}

export const OnboardingTour = ({ forceRun = false, onComplete }: OnboardingTourProps) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const { rawData } = useAppStore();

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed || forceRun) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        setRun(true);
        track.onboardingStarted();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceRun]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type } = data;

    // Handle step changes
    if (type === EVENTS.STEP_AFTER) {
      track.onboardingStepCompleted(index, stepNames[index]);
      setStepIndex(index + 1);
    }

    // Handle completion
    if (status === STATUS.FINISHED) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      track.onboardingCompleted();
      
      // Celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'],
      });

      // Second burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#3B82F6', '#8B5CF6'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10B981', '#F59E0B'],
        });
      }, 250);

      onComplete?.();
    }

    // Handle skip
    if (status === STATUS.SKIPPED || (action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER)) {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      track.onboardingSkipped(index);
      setRun(false);
    }
  }, [onComplete]);

  // Reset tour function (can be called externally)
  const resetTour = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setStepIndex(0);
    setRun(true);
    track.onboardingStarted();
  }, []);

  // Expose reset function globally for debugging
  useEffect(() => {
    (window as unknown as { resetOnboarding: () => void }).resetOnboarding = resetTour;
  }, [resetTour]);

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      spotlightClicks
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: 'hsl(199, 89%, 48%)',
          backgroundColor: 'hsl(222, 47%, 11%)',
          textColor: 'hsl(210, 40%, 98%)',
          arrowColor: 'hsl(222, 47%, 11%)',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: 600,
        },
        tooltipContent: {
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: 'hsl(199, 89%, 48%)',
          borderRadius: '8px',
          padding: '10px 20px',
          fontWeight: 500,
        },
        buttonBack: {
          color: 'hsl(210, 40%, 98%)',
          marginRight: 10,
        },
        buttonSkip: {
          color: 'hsl(215, 20%, 55%)',
        },
        spotlight: {
          borderRadius: '12px',
        },
        beacon: {
          display: 'none',
        },
        beaconInner: {
          backgroundColor: 'hsl(199, 89%, 48%)',
        },
        beaconOuter: {
          backgroundColor: 'hsla(199, 89%, 48%, 0.3)',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish!',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
};

// Export helper to reset onboarding
export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
  window.location.reload();
};
