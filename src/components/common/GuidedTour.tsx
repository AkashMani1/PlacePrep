'use client';

import { useState, useEffect } from 'react';
import { Joyride, EventData, STATUS, Step, TooltipRenderProps } from 'react-joyride';

// Example steps. You should assign these classes or IDs to elements in your application.
const TOUR_STEPS: Step[] = [
  {
    target: '.tour-settings-btn',
    content: 'Welcome! Click here to open your Settings, where you can edit your name and details.',
    skipBeacon: true,
  },
  {
    target: '.tour-prep-dates',
    content: 'Select your Prep Start Date and Goal Duration (Months) to tailor your schedule.',
  },
  {
    target: '.tour-dsa-sheet',
    content: 'Access the complete DSA Must-Do list and track your daily coding progress here.',
  },
  {
    target: '.tour-connect-google',
    content: 'Connect your Google account to sync your progress securely across all your devices!',
  },
];

// Custom Tooltip component for full Tailwind CSS control
const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-zinc-900 border border-zinc-800 text-white rounded-lg shadow-xl p-5 w-[320px] max-w-full font-sans animate-in fade-in zoom-in-95 duration-200"
    >
      {step.title && <h3 className="text-lg font-semibold mb-2">{step.title as React.ReactNode}</h3>}
      <div className="text-sm text-zinc-300 mb-6">{step.content as React.ReactNode}</div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-xs text-zinc-500 font-medium">
          Step {index + 1} of {TOUR_STEPS.length}
        </div>
        <div className="flex gap-2">
          {!isLastStep && (
            <button
              {...closeProps}
              className="px-3 py-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Skip
            </button>
          )}
          
          <button
            {...primaryProps}
            className="px-4 py-1.5 text-sm font-medium bg-white text-black rounded-md hover:bg-zinc-200 transition-colors"
          >
            {continuous ? (isLastStep ? 'Finish' : 'Next') : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function GuidedTour() {
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check localStorage if the tour was completed or skipped
    const tourCompleted = localStorage.getItem('tourCompleted');
    const tourSkipped = localStorage.getItem('tourSkipped');

    if (!tourCompleted && !tourSkipped) {
      // Small delay ensures elements are mounted before tour starts
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideEvent = (data: EventData) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // If user clicked close/skip, set skipped, else completed
      if (action === 'close' || status === STATUS.SKIPPED) {
        localStorage.setItem('tourSkipped', 'true');
      } else {
        localStorage.setItem('tourCompleted', 'true');
      }
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <Joyride
      onEvent={handleJoyrideEvent}
      continuous
      run={run}
      scrollToFirstStep
      steps={TOUR_STEPS}
      tooltipComponent={CustomTooltip}
      floatingOptions={{}} // New v3 equivalent to floaterProps without animation handled by tailwind
      options={{
        zIndex: 10000,
        showProgress: true,
      }}
    />
  );
}
