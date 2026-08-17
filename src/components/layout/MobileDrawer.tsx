import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "./Sidebar";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop Scrim */}
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
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="relative w-[300px] max-w-[85vw] h-[100dvh] bg-surface shadow-3 flex flex-col z-10 safe-pt safe-pb safe-pl overscroll-contain"
          >
            {/* Sidebar Contents with integrated close handler */}
            <Sidebar onItemClick={onClose} onClose={onClose} className="border-r-0 h-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
