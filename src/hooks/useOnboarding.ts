import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'promptbi-onboarding-completed';

export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    setIsCompleted(completed);
    setShouldShowOnboarding(!completed);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsCompleted(true);
    setShouldShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsCompleted(false);
    setShouldShowOnboarding(true);
  };

  return {
    shouldShowOnboarding,
    isCompleted,
    completeOnboarding,
    resetOnboarding,
  };
}

