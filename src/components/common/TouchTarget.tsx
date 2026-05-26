/* Developed by Akash Mani - TouchTarget utility component
 * Renders a small visual icon inside a 48×48px invisible hit area,
 * meeting Apple HIG and Material Design touch target guidelines.
 *
 * Usage:
 *   <TouchTarget onClick={handleAction} label="Mark as done">
 *     <CheckCircle className="w-5 h-5 text-primary" />
 *   </TouchTarget>
 */

import React from 'react';

interface TouchTargetProps {
  /** The click/tap handler */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible label for screen readers */
  label: string;
  /** Any visual content — icon, text, etc. */
  children: React.ReactNode;
  /** Extra Tailwind classes for the visual content wrapper */
  className?: string;
  /** Optional: disabled state */
  disabled?: boolean;
}

export function TouchTarget({
  onClick,
  label,
  children,
  className = '',
  disabled = false,
}: TouchTargetProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={[
        // ── Touch physics ──────────────────────────────────────
        // touch-manipulation eliminates the 300ms tap delay on Android
        // and is required for snappy button responses.
        'touch-manipulation',

        // ── Minimum 48×48px invisible touch target (Apple HIG) ─
        'flex items-center justify-center',
        'min-w-[48px] min-h-[48px]',

        // ── Native press feel ──────────────────────────────────
        // Scale down 4% on active press, spring back instantly
        'transition-transform duration-100 ease-out',
        'active:scale-95',

        // ── Remove web-browser tap glow ────────────────────────
        // -webkit-tap-highlight-color is set globally in globals.css
        // but we reinforce it here for component-level safety.
        'outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1',

        // ── Disabled state ─────────────────────────────────────
        disabled ? 'opacity-40 pointer-events-none' : '',

        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

/**
 * Convenience: renders any icon inside a 48×48 touch target with
 * an optional subtle hover background circle (for icon buttons in toolbars).
 *
 * @example
 * <IconButton onClick={toggleTheme} label="Toggle theme">
 *   <Sun className="w-5 h-5" />
 * </IconButton>
 */
export function IconButton({
  onClick,
  label,
  children,
  className = '',
}: TouchTargetProps) {
  return (
    <TouchTarget onClick={onClick} label={label} className={className}>
      {/* Subtle hover disc — invisible on mobile, shows on hover (desktop) */}
      <span className="relative flex items-center justify-center w-9 h-9 rounded-full group-hover:bg-white/5 transition-colors">
        {children}
      </span>
    </TouchTarget>
  );
}
