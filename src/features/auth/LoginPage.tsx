import { useEffect, useRef, useState, useCallback } from "react";
import type { PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/theme";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, unknown>) => void;
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

export function LoginPage() {
  const { loginWithTelegram, isLoading, authError, clearError } = useAuth();
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [isDevLoginLoading, setIsDevLoginLoading] = useState(false);

  // Pointer parallax (max 10px shift)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 25 });

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x * 16); // max ~8-10px
      mouseY.set(y * 16);
    },
    [mouseX, mouseY, prefersReducedMotion]
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Check Telegram Mini App initData on mount
  useEffect(() => {
    if (window.Telegram?.WebApp?.initData) {
      window.Telegram.WebApp.ready?.();
      window.Telegram.WebApp.expand?.();
      loginWithTelegram({ init_data: window.Telegram.WebApp.initData }).catch(() => {
        // Handled via authError in context
      });
    }
  }, [loginWithTelegram]);

  // Set up Telegram widget global callback
  useEffect(() => {
    window.onTelegramAuth = (user: Record<string, unknown>) => {
      clearError();
      loginWithTelegram(user as unknown as Record<string, string | number | boolean>).catch(() => {
        // Handled via authError in context
      });
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [loginWithTelegram, clearError]);

  // Local dev login simulation (for localhost testing when widget is blocked)
  const handleDevLogin = async (tgId: number) => {
    setIsDevLoginLoading(true);
    clearError();
    try {
      // In local dev environment, send a payload to test the full auth flow
      await loginWithTelegram({
        id: tgId,
        first_name: "Aziz",
        username: "aziz",
        auth_date: Math.floor(Date.now() / 1000),
      });
    } catch {
      // Handled via authError
    } finally {
      setIsDevLoginLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-canvas text-fg safe-pt safe-pb safe-pl safe-pr overflow-hidden select-none"
    >
      {/* Top Header with Brand and Theme toggle */}
      <header className="w-full flex items-center justify-between p-4 sm:p-6 z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-sm bg-fg text-canvas font-mono text-xs font-bold shadow-1">
            D
          </div>
          <span className="text-sm font-semibold tracking-tight text-fg">Donater Admin</span>
        </div>

        {/* Minimal Theme Switcher */}
        <div className="flex items-center gap-1 rounded-sm border border-hairline bg-surface p-0.5">
          <button
            onClick={() => setTheme("light")}
            className={`p-1.5 rounded-sm transition-colors ${
              theme === "light" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
            }`}
            title="Light mode"
            aria-label="Light mode"
          >
            <Icons.Sun size="sm" />
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-1.5 rounded-sm transition-colors ${
              theme === "dark" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
            }`}
            title="Dark mode"
            aria-label="Dark mode"
          >
            <Icons.Moon size="sm" />
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`p-1.5 rounded-sm transition-colors ${
              theme === "system" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
            }`}
            title="System theme"
            aria-label="System theme"
          >
            <Icons.Laptop size="sm" />
          </button>
        </div>
      </header>

      {/* Center Auth Card with Parallax Layer (§3.6) */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div
          style={{
            x: prefersReducedMotion ? 0 : springX,
            y: prefersReducedMotion ? 0 : springY,
          }}
          className="w-full max-w-[380px] rounded-md border border-hairline bg-surface p-6 sm:p-8 shadow-2 space-y-6"
        >
          {/* Title and description */}
          <div className="space-y-1.5 text-center">
            <div className="label-caps">Xavfsiz Kirish</div>
            <h2 className="text-xl font-semibold tracking-tight text-fg">
              Boshqaruv Paneli
            </h2>
            <p className="text-xs text-fg-muted">
              Tizimga kirish faqat vakolatli Telegram akkauntlar orqali amalga oshiriladi.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div
              role="alert"
              className="rounded-sm border border-status-fail/30 bg-status-fail-bg p-3 text-xs space-y-1 text-status-fail"
            >
              <div className="flex items-start gap-2 font-medium">
                <Icons.AlertCircle size="sm" className="shrink-0 mt-0.5" />
                <span>{authError.message}</span>
              </div>
              {authError.retryAfter && (
                <p className="text-[11px] text-fg-muted pl-5">
                  Qayta urinish: {authError.retryAfter} soniyadan keyin.
                </p>
              )}
              {authError.requestId && (
                <p className="text-[10px] font-mono text-fg-subtle pl-5">
                  Request ID: {authError.requestId}
                </p>
              )}
            </div>
          )}

          {/* Telegram Login Action Area */}
          <div className="space-y-4 pt-1">
            <div
              ref={widgetContainerRef}
              className="flex justify-center min-h-[44px] items-center"
            >
              {/* Telegram Login Widget button / Custom trigger */}
              <Button
                variant="primary"
                size="md"
                className="w-full min-h-[44px] gap-2 font-medium"
                isLoading={isLoading}
                onClick={() => {
                  // If real widget iframe is embedded, click it or trigger login
                  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
                    handleDevLogin(777967425);
                  }
                }}
              >
                <Icons.User size="sm" />
                <span>Telegram orqali kirish</span>
              </Button>
            </div>

            {/* Quick dev-testing buttons if on localhost */}
            {typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
              <div className="border-t border-hairline pt-3 text-center space-y-2">
                <span className="text-[11px] font-mono text-fg-subtle">Dev Test Akkauntlar:</span>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="secondary"
                    size="xs"
                    isLoading={isDevLoginLoading}
                    onClick={() => handleDevLogin(777967425)}
                    title="Owner ID: 777967425"
                  >
                    Owner
                  </Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    isLoading={isDevLoginLoading}
                    onClick={() => handleDevLogin(999999)}
                    title="Non-admin ID for testing 403"
                  >
                    Not Admin (403 Test)
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="text-center pt-1">
            <p className="text-[11px] text-fg-subtle">
              Parol saqlanmaydi · Telegram SHA-256 HMAC orqali autentifikatsiya
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4 sm:p-6 text-center text-xs text-fg-subtle z-10">
        Donater Admin v0.1.0 · Himoyalangan xizmat
      </footer>
    </div>
  );
}
