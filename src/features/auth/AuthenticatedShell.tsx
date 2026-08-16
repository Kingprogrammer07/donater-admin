import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { StyleguidePage } from "@/features/styleguide/StyleguidePage";

export function AuthenticatedShell() {
  const { admin, permissions, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showStyleguide, setShowStyleguide] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (showStyleguide) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-50 bg-surface border-b border-hairline px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-fg-muted font-mono">
            Kirgan admin: {admin?.username || admin?.full_name} ({String(admin?.role)})
          </span>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => setShowStyleguide(false)}
          >
            ← Boshqaruvga qaytish
          </Button>
        </div>
        <StyleguidePage />
      </div>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-canvas text-fg safe-pt safe-pb safe-pl safe-pr">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-sm bg-fg text-canvas font-mono text-xs font-bold">
              D
            </span>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-fg">
                Donater Admin
              </h1>
            </div>
            <span className="text-xs text-fg-subtle hidden sm:inline">/</span>
            <Badge variant="brand" styleType="subtle" className="hidden sm:inline-flex">
              {String(admin?.role || "").toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <div className="flex items-center gap-1 rounded-sm border border-hairline bg-surface p-0.5">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-sm transition-colors ${
                  theme === "light" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
                }`}
                title="Light mode"
              >
                <Icons.Sun size="sm" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-sm transition-colors ${
                  theme === "dark" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
                }`}
                title="Dark mode"
              >
                <Icons.Moon size="sm" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-sm transition-colors ${
                  theme === "system" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
                }`}
                title="System theme"
              >
                <Icons.Laptop size="sm" />
              </button>
            </div>

            {/* Logout button */}
            <Button
              variant="secondary"
              size="sm"
              isLoading={isLoggingOut}
              onClick={handleLogout}
              className="text-xs gap-1.5"
            >
              <Icons.Logout size="sm" />
              <span>Chiqish</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <div className="label-caps mb-1">1-Qadam · Autentifikatsiya Muvaffaqiyatli</div>
          <h2 className="text-display text-fg">
            Xush kelibsiz, {String(admin?.full_name || admin?.username || "Admin")}
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Siz tizimga <strong>{String(admin?.role)}</strong> huquqi bilan kirdingiz.
          </p>
        </div>

        {/* User Context Card */}
        <div className="rounded-md bg-surface p-5 border border-hairline space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-surface-2 flex items-center justify-center text-fg font-mono text-sm font-semibold">
                {String(admin?.full_name || admin?.username || "A")[0]?.toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-fg">
                  {String(admin?.full_name || admin?.username || "")} {admin?.username ? `(@${String(admin.username)})` : ""}
                </div>
                <div className="text-xs font-mono text-fg-subtle">TG ID: {String(admin?.tg_id)}</div>
              </div>
            </div>
            <Badge variant="ok">Faol Sessiya</Badge>
          </div>

          <div>
            <div className="label-caps mb-2">Sizning Ruxsatlaringiz (Permissions):</div>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-0.5 rounded-sm bg-surface-2 text-fg text-xs font-mono"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-hairline pt-4 flex items-center justify-between">
            <span className="text-xs text-fg-muted">
              Navbatdagi qadam: 2-Qadam (Layout qobig'i: Sidebar + Header)
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowStyleguide(true)}
            >
              Styleguide'ni Ko'rish →
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
