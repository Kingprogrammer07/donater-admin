import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-canvas text-fg overflow-hidden">
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

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overscroll-contain safe-pb safe-pl safe-pr">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
