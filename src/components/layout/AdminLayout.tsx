import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, ScrollRestoration } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Focus management on route change (WCAG focus-on-route-change)
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname, location.search]);

  return (
    <div className="flex h-[100dvh] w-full bg-canvas text-fg overflow-hidden">
      <ScrollRestoration />

      {/* Desktop Sidebar (Fixed Left) */}
      <div className="hidden md:flex w-64 shrink-0 h-full">
        <Sidebar className="w-64" />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Header */}
        <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable Page Content with focusable main */}
        <main
          ref={mainRef}
          tabIndex={-1}
          aria-label="Asosiy tarkib"
          className="flex-1 overflow-y-auto overscroll-contain safe-pb safe-pl safe-pr focus:outline-none"
        >
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
