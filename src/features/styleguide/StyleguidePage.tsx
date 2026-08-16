import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import { useTheme } from "@/lib/theme";
import { springPresets } from "@/lib/motion";

export function StyleguidePage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [motionBoxOpen, setMotionBoxOpen] = useState(false);
  const [reducedMotionSim, setReducedMotionSim] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground safe-pt safe-pb safe-pl safe-pr transition-colors duration-150">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shadow-1">
              D
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Donater Admin — Styleguide
              </h1>
              <p className="text-xs text-muted-foreground">
                Step 0 (Poydevor) Token &amp; Component Verification
              </p>
            </div>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 rounded-md border border-border bg-muted p-1">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-all ${
                theme === "light"
                  ? "bg-surface text-foreground shadow-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Light theme"
            >
              <Icons.Sun size="sm" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-all ${
                theme === "dark"
                  ? "bg-surface text-foreground shadow-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dark theme"
            >
              <Icons.Moon size="sm" />
              <span className="hidden sm:inline">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-all ${
                theme === "system"
                  ? "bg-surface text-foreground shadow-1"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="System theme"
            >
              <Icons.Laptop size="sm" />
              <span className="hidden sm:inline">System ({resolvedTheme})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Intro banner */}
        <div className="rounded-md border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Icons.Shield size="sm" />
                <span>Poydevor (Foundation) Qoidalari</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Data-dense dizayn tokenlari: 4/8 spacing, 6/10/14px radius, tabular-nums,
                iOS Safari 16px input &amp; 44pt touch targets, Apple spring presets.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="ok">TypeScript Strict</Badge>
              <Badge variant="neutral">Vite + React 19</Badge>
            </div>
          </div>
        </div>

        {/* 1. Color Palette Tokens */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold tracking-tight">1. Rang Tokenlari (§1.1 &amp; §1.2)</h2>
            <span className="text-xs text-muted-foreground font-mono">
              Current: {resolvedTheme.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <ColorSwatch
              name="Primary"
              variable="--color-primary"
              lightHex="#1E40AF"
              darkHex="#60A5FA"
              bgClass="bg-primary"
              textClass="text-primary-foreground"
            />
            <ColorSwatch
              name="Secondary"
              variable="--color-secondary"
              lightHex="#3B82F6"
              darkHex="#38BDF8"
              bgClass="bg-secondary"
              textClass="text-primary-foreground"
            />
            <ColorSwatch
              name="Accent"
              variable="--color-accent"
              lightHex="#D97706"
              darkHex="#F0B429"
              bgClass="bg-accent"
              textClass="text-primary-foreground"
            />
            <ColorSwatch
              name="Background"
              variable="--color-background"
              lightHex="#F8FAFC"
              darkHex="#0B1220"
              bgClass="bg-background"
              textClass="text-foreground"
              border
            />
            <ColorSwatch
              name="Surface"
              variable="--color-surface"
              lightHex="#FFFFFF"
              darkHex="#131C2E"
              bgClass="bg-surface"
              textClass="text-foreground"
              border
            />
            <ColorSwatch
              name="Muted"
              variable="--color-muted"
              lightHex="#E9EEF6"
              darkHex="#1E293B"
              bgClass="bg-muted"
              textClass="text-muted-foreground"
              border
            />
            <ColorSwatch
              name="Border"
              variable="--color-border"
              lightHex="#DBEAFE"
              darkHex="#24324A"
              bgClass="bg-border"
              textClass="text-foreground"
            />
            <ColorSwatch
              name="Destructive"
              variable="--color-destructive"
              lightHex="#DC2626"
              darkHex="#F87171"
              bgClass="bg-destructive"
              textClass="text-primary-foreground"
            />
            <ColorSwatch
              name="Status OK"
              variable="--status-ok"
              lightHex="#16A34A"
              darkHex="#4ADE80"
              bgClass="bg-status-ok-bg"
              textClass="text-status-ok"
              border
            />
            <ColorSwatch
              name="Status Warn"
              variable="--status-warn"
              lightHex="#D97706"
              darkHex="#FBBF24"
              bgClass="bg-status-warn-bg"
              textClass="text-status-warn"
              border
            />
            <ColorSwatch
              name="Status Fail"
              variable="--status-fail"
              lightHex="#DC2626"
              darkHex="#F87171"
              bgClass="bg-status-fail-bg"
              textClass="text-status-fail"
              border
            />
            <ColorSwatch
              name="Status Neutral"
              variable="--status-neutral"
              lightHex="#64748B"
              darkHex="#94A3B8"
              bgClass="bg-status-neutral-bg"
              textClass="text-status-neutral"
              border
            />
          </div>
        </section>

        {/* 2. Typography & Tabular Numbers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold tracking-tight">2. Tipografika &amp; Tabular Raqamlar</h2>
            <span className="text-xs text-muted-foreground font-mono">12 / 14 / 16 / 18 / 24 / 32 px</span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Font Scale */}
            <Card elevation={1}>
              <CardHeader>
                <CardTitle>Shkala va Matn Ierarxiyasi</CardTitle>
                <CardDescription>system-ui font oilasi va o'lcham tokenlari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-border/50 pb-1.5">
                  <span className="text-4xl font-bold tracking-tight">32px Sarlavha (4xl)</span>
                  <span className="text-xs text-muted-foreground font-mono">font-bold -0.02em</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-border/50 pb-1.5">
                  <span className="text-2xl font-semibold tracking-tight">24px Bo'lim (2xl)</span>
                  <span className="text-xs text-muted-foreground font-mono">font-semibold -0.02em</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-border/50 pb-1.5">
                  <span className="text-lg font-semibold">18px Karta Sarlavhasi (lg)</span>
                  <span className="text-xs text-muted-foreground font-mono">font-semibold</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-border/50 pb-1.5">
                  <span className="text-base font-normal">16px Asosiy Matn / Input (base)</span>
                  <span className="text-xs text-muted-foreground font-mono">font-normal 1.5</span>
                </div>
                <div className="flex items-baseline justify-between border-b border-border/50 pb-1.5">
                  <span className="text-sm font-medium text-foreground">14px Jadval / Tugma (sm)</span>
                  <span className="text-xs text-muted-foreground font-mono">font-medium</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">12px Ikkilamchi / Badge (xs)</span>
                  <span className="text-xs text-muted-foreground font-mono">text-muted-foreground</span>
                </div>
              </CardContent>
            </Card>

            {/* Monospace & Tabular Numbers */}
            <Card elevation={1}>
              <CardHeader>
                <CardTitle>Tabular Raqamlar va Monospace ID</CardTitle>
                <CardDescription>
                  Pul va ID ustunlari raqam o'zgarganda gorizontal siljimaydi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground">
                        <th className="py-2 font-medium">Foydalanuvchi ID</th>
                        <th className="py-2 font-medium">Holat</th>
                        <th className="py-2 text-right font-medium">Balans (UZS)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">usr_9a4f21008</td>
                        <td className="py-2.5"><Badge variant="ok">Faol</Badge></td>
                        <td className="py-2.5 text-right font-mono font-medium tabular-nums">125 000,00 so'm</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">usr_117b90442</td>
                        <td className="py-2.5"><Badge variant="warn">Kutilmoqda</Badge></td>
                        <td className="py-2.5 text-right font-mono font-medium tabular-nums">1 850 000,00 so'm</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">usr_882cc3910</td>
                        <td className="py-2.5"><Badge variant="fail">Bloklangan</Badge></td>
                        <td className="py-2.5 text-right font-mono font-medium tabular-nums">0,00 so'm</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">usr_0034aef99</td>
                        <td className="py-2.5"><Badge variant="neutral">Yangi</Badge></td>
                        <td className="py-2.5 text-right font-mono font-medium tabular-nums">2 400,00 so'm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. Button States & Interactive pointerdown feedback */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight">3. Tugma Holatlari (§3.5 Apple uslubi)</h2>
              <p className="text-xs text-muted-foreground">
                Javob pointerdown da (scale 0.97), min touch target 44pt
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setButtonLoading((v) => !v)}
            >
              <Icons.Refresh size="sm" />
              <span>Loading Holatini {buttonLoading ? "O'chirish" : "Yoqish"}</span>
            </Button>
          </div>

          <Card elevation={1}>
            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Variants row */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Variantlar (Har biri bosilganda spring javob beradi)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" isLoading={buttonLoading}>
                    <Icons.Check size="sm" />
                    <span>Primary</span>
                  </Button>
                  <Button variant="secondary" isLoading={buttonLoading}>
                    <Icons.TrendingUp size="sm" />
                    <span>Secondary</span>
                  </Button>
                  <Button variant="destructive" isLoading={buttonLoading}>
                    <Icons.Trash size="sm" />
                    <span>Destructive</span>
                  </Button>
                  <Button variant="outline" isLoading={buttonLoading}>
                    <Icons.FileText size="sm" />
                    <span>Outline</span>
                  </Button>
                  <Button variant="ghost" isLoading={buttonLoading}>
                    <Icons.Eye size="sm" />
                    <span>Ghost</span>
                  </Button>
                  <Button disabled>
                    <Icons.Lock size="sm" />
                    <span>Disabled</span>
                  </Button>
                </div>
              </div>

              {/* Sizes row */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  O'lcham Tokenlari (sm: 32px, md: 44px min-touch, lg: 48px, icon)
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="primary">
                    <span>Small (32px)</span>
                  </Button>
                  <Button size="md" variant="primary">
                    <span>Medium (44px min)</span>
                  </Button>
                  <Button size="lg" variant="primary">
                    <span>Large (48px)</span>
                  </Button>
                  <Button size="icon" variant="outline" title="Icon action">
                    <Icons.Plus size="md" />
                  </Button>
                  <Button size="icon" variant="ghost" title="Settings action">
                    <Icons.Settings size="md" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Form Controls & Inputs (16px font-size for iOS) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight">4. Forma Elementlari &amp; iOS 16px Input</h2>
              <p className="text-xs text-muted-foreground">
                Safari fokusda sahifani avtomatik kattalashtirmasligi uchun font-size ≥ 16px
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card elevation={1}>
              <CardContent className="p-4 sm:p-5 space-y-2">
                <label className="text-xs font-medium text-foreground">Oddiy Input (Normal)</label>
                <Input placeholder="Foydalanuvchi tg_id yoki username..." />
                <p className="text-xs text-muted-foreground">Qidiruv yoki oddiy qiymat kiritish</p>
              </CardContent>
            </Card>

            <Card elevation={1}>
              <CardContent className="p-4 sm:p-5 space-y-2">
                <label className="text-xs font-medium text-destructive">Xatolik Holati (Error 422)</label>
                <Input error defaultValue="not-a-number" />
                <p className="text-xs text-destructive">Summa 2000 so'mdan kam bo'lmasligi kerak</p>
              </CardContent>
            </Card>

            <Card elevation={1}>
              <CardContent className="p-4 sm:p-5 space-y-2">
                <label className="text-xs font-medium text-muted-foreground">O'chirilgan (Disabled)</label>
                <Input disabled defaultValue="O'zgartirib bo'lmaydigan qiymat" />
                <p className="text-xs text-muted-foreground">Ruxsat yetmagan yoki muzlatilgan</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 5. Elevation & Radius Scales */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold tracking-tight">5. Soya (Elevation) &amp; Radius Shkalasi</h2>
            <span className="text-xs text-muted-foreground font-mono">0 / 1 / 2 / 3 &amp; 6 / 10 / 14 px</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card elevation={0} className="p-4 text-center">
              <span className="text-xs font-mono font-semibold text-muted-foreground">Elevation 0</span>
              <p className="mt-1 text-xs text-muted-foreground">Shadow yo'q (Tekis yuza)</p>
            </Card>
            <Card elevation={1} className="p-4 text-center">
              <span className="text-xs font-mono font-semibold text-foreground">Elevation 1</span>
              <p className="mt-1 text-xs text-muted-foreground">Karta &amp; Jadval yuzasi</p>
            </Card>
            <Card elevation={2} className="p-4 text-center">
              <span className="text-xs font-mono font-semibold text-foreground">Elevation 2</span>
              <p className="mt-1 text-xs text-muted-foreground">Dropdown &amp; Popover</p>
            </Card>
            <Card elevation={3} className="p-4 text-center">
              <span className="text-xs font-mono font-semibold text-foreground">Elevation 3</span>
              <p className="mt-1 text-xs text-muted-foreground">Modal &amp; Drawer</p>
            </Card>
          </div>
        </section>

        {/* 6. Skeleton Loader states */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight">6. Yuklanish Holatlari (Skeleton, spinner emas)</h2>
              <p className="text-xs text-muted-foreground">
                Yuklanish 300ms dan oshganda haqiqiy tartib shaklini takrorlovchi skelet
              </p>
            </div>
          </div>

          <Card elevation={1}>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
                <Skeleton className="h-20 rounded-md" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 7. Motion Spring Presets & a11y reduced-motion */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
            <div>
              <h2 className="text-lg font-bold tracking-tight">7. Motion Presets &amp; Prefers-Reduced-Motion</h2>
              <p className="text-xs text-muted-foreground">
                Spring physics: bounce 0 (default), bouncy 0.2 (gestures), opacity crossfade (reduced)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotionSim}
                  onChange={(e) => setReducedMotionSim(e.target.checked)}
                  className="rounded border-border"
                />
                <span>Simulate Reduced Motion</span>
              </label>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setMotionBoxOpen((v) => !v)}
              >
                <span>{motionBoxOpen ? "Yopish" : "Spring Animatsiyani Sinash"}</span>
              </Button>
            </div>
          </div>

          <Card elevation={1} className="overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {motionBoxOpen ? (
                  <motion.div
                    key="open"
                    initial={{ opacity: 0, y: reducedMotionSim ? 0 : -10, scale: reducedMotionSim ? 1 : 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: reducedMotionSim ? 0 : -8, scale: reducedMotionSim ? 1 : 0.98 }}
                    transition={reducedMotionSim ? springPresets.reduced : springPresets.default}
                    className="rounded-md border border-primary/30 bg-primary/10 p-5 text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
                        <Icons.Check size="md" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Spring Motion Faol</h4>
                        <p className="text-xs text-muted-foreground">
                          {reducedMotionSim
                            ? "Reduced motion rejimi: no-translation opacity crossfade."
                            : "Critically damped spring: bounce=0, duration ~0.3s."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="closed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center rounded-md border border-dashed border-border py-8 text-xs text-muted-foreground"
                  >
                    Yuqoridagi tugmani bosib spring animatsiyasini sinab ko'ring
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </section>

        {/* 8. Lucide Icons Tokens */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold tracking-tight">8. Lucide Ikonkalar (sm: 16px / md: 20px / lg: 24px)</h2>
            <span className="text-xs text-muted-foreground font-mono">Stroke: 1.75px</span>
          </div>

          <Card elevation={1}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.Users size="lg" className="text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">lg (24px)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.Shield size="md" className="text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">md (20px)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.CheckCircle size="sm" className="text-status-ok" />
                  <span className="text-xs font-mono text-muted-foreground">sm (16px)</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.AlertTriangle size="sm" className="text-status-warn" />
                  <span className="text-xs font-mono text-muted-foreground">warn</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.XCircle size="sm" className="text-status-fail" />
                  <span className="text-xs font-mono text-muted-foreground">fail</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.Search size="md" className="text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">search</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.TrendingUp size="md" className="text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">stats</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.Dollar size="md" className="text-accent" />
                  <span className="text-xs font-mono text-muted-foreground">money</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.Clock size="md" className="text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">clock</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <Icons.Smartphone size="md" className="text-secondary" />
                  <span className="text-xs font-mono text-muted-foreground">mobile</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-surface px-4 py-4 text-center text-xs text-muted-foreground">
        Donater Admin Panel — Step 0 Foundation Token System
      </footer>
    </div>
  );
}

interface ColorSwatchProps {
  name: string;
  variable: string;
  lightHex: string;
  darkHex: string;
  bgClass: string;
  textClass: string;
  border?: boolean;
}

function ColorSwatch({
  name,
  variable,
  lightHex,
  darkHex,
  bgClass,
  textClass,
  border = false,
}: ColorSwatchProps) {
  const { resolvedTheme } = useTheme();
  const currentHex = resolvedTheme === "dark" ? darkHex : lightHex;

  return (
    <div className="rounded-md border border-border bg-surface p-2.5 shadow-1 transition-colors">
      <div
        className={`h-12 w-full rounded-sm flex items-center justify-center font-mono text-xs font-semibold ${bgClass} ${textClass} ${
          border ? "border border-border" : ""
        }`}
      >
        Aa
      </div>
      <div className="mt-2 space-y-0.5">
        <div className="text-xs font-semibold text-foreground truncate">{name}</div>
        <div className="text-[10px] font-mono text-muted-foreground truncate">{variable}</div>
        <div className="text-[10px] font-mono font-medium text-foreground">{currentHex}</div>
      </div>
    </div>
  );
}
