'use client';

/**
 * ModalPortal — Production-grade portal renderer.
 *
 * Renders children into document.body so they are ALWAYS:
 *  - Fixed to viewport (independent of scroll position)
 *  - Above every stacking context (z-index: 9999)
 *  - Not affected by parent overflow, transform, or filter
 *
 * Usage:
 *   <ModalPortal onClose={onClose}>
 *     <YourModalContent />
 *   </ModalPortal>
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalPortalProps {
  children: React.ReactNode;
  onClose?: () => void;
  /** extra class on the centering wrapper */
  className?: string;
}

export default function ModalPortal({ children, onClose, className = '' }: ModalPortalProps) {
  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  // ── Scroll lock ───────────────────────────────────────────────────────────
  useEffect(() => {
    const shell = document.querySelector('.mobile-viewport-shell') as HTMLElement | null;
    const prevBodyOverflow = document.body.style.overflow;
    const prevShellOverflow = shell ? shell.style.overflowY : '';

    document.body.style.overflow = 'hidden';
    if (shell) shell.style.overflowY = 'hidden';

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      if (shell) shell.style.overflowY = prevShellOverflow;
    };
  }, []);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!portalRoot) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        // Backdrop
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        // Prevent scroll-through
        overflowY: 'auto',
      }}
      // Click backdrop to close
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90dvh',
          overflowY: 'auto',
          // Ensure no fixed children are trapped
          transform: 'none',
          margin: 'auto',
        }}
        className={`custom-scrollbar ${className}`}
        // Stop click propagation so backdrop-close doesn't fire
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>,
    portalRoot
  );
}
