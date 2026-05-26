'use client';

/* Developed by Akash Mani - useKeyboardStatus Hook
 * Detects when the mobile virtual keyboard is visible using the
 * VisualViewport API — the most reliable cross-browser method.
 * Falls back gracefully on desktop (always returns false).
 */

import { useState, useEffect } from 'react';

/**
 * Returns `true` when the mobile virtual keyboard is open.
 * Relies on `window.visualViewport` — supported on all modern iOS/Android browsers.
 *
 * Usage:
 *   const isKeyboardOpen = useKeyboardStatus();
 *   if (isKeyboardOpen) // hide bottom nav, adjust layout, etc.
 */
export function useKeyboardStatus(): boolean {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // No-op on server or browsers without VisualViewport support
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const viewport = window.visualViewport;

    const handleViewportResize = () => {
      // If the visual viewport height is meaningfully shorter than the
      // layout viewport height, the software keyboard has pushed it up.
      // Threshold of 150px avoids false-positives from address bar shrink.
      const keyboardHeight = window.innerHeight - viewport.height;
      setIsKeyboardOpen(keyboardHeight > 150);
    };

    viewport.addEventListener('resize', handleViewportResize);
    // Also fire on scroll (iOS Safari resizes viewport on scroll sometimes)
    viewport.addEventListener('scroll', handleViewportResize);

    return () => {
      viewport.removeEventListener('resize', handleViewportResize);
      viewport.removeEventListener('scroll', handleViewportResize);
    };
  }, []);

  return isKeyboardOpen;
}
