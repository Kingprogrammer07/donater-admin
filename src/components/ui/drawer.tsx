import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icons } from "@/components/icons";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: "right" | "left";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  hideCloseButton?: boolean;
}

const SIZE_CLASSES = {
  sm: "w-full max-w-[360px]",
  md: "w-full max-w-[460px]",
  lg: "w-full max-w-[580px]",
  xl: "w-full max-w-[720px]",
  full: "w-full max-w-[100vw]",
};

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "md",
  className = "",
  hideCloseButton = false,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus on close
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Initial focus on first focusable element or panel
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const focusable = panelRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      // Restore focus to original element
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === "function") {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const isRight = side === "right";
  const initialOffset = isRight ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-100 flex ${isRight ? "justify-end" : "justify-start"}`}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === "string" ? title : "Yon panel"}
        >
          {/* Scrim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: initialOffset }}
            animate={{ x: 0 }}
            exit={{ x: initialOffset }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className={`relative ${SIZE_CLASSES[size]} h-[100dvh] bg-surface shadow-3 flex flex-col z-10 border-hairline ${
              isRight ? "border-l" : "border-r"
            } safe-pt safe-pb ${isRight ? "safe-pr" : "safe-pl"} overscroll-contain select-none ${className}`}
          >
            {/* Drawer Header */}
            {(title || !hideCloseButton) && (
              <div className="flex items-start justify-between px-5 py-4 border-b border-hairline shrink-0 gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  {title && (
                    <h2 className="text-base font-semibold tracking-tight text-fg truncate">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>

                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="size-9 flex items-center justify-center rounded-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
                    aria-label="Yopish"
                  >
                    <Icons.X size="sm" />
                  </button>
                )}
              </div>
            )}

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
              {children}
            </div>

            {/* Drawer Footer */}
            {footer && (
              <div className="p-4 border-t border-hairline bg-surface shrink-0 flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
