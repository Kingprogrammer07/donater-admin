import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-[100dvh] w-full bg-canvas text-fg safe-pt safe-pb safe-pl safe-pr">
      {/* Floating Translucent Top Navbar */}
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
            <span className="hidden sm:inline-block text-xs text-fg-subtle">/</span>
            <span className="hidden sm:inline-block text-xs text-fg-muted font-medium">
              Styleguide
            </span>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 rounded-sm border border-hairline bg-surface p-0.5">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs transition-colors ${
                theme === "light"
                  ? "bg-surface-2 text-fg font-medium"
                  : "text-fg-muted hover:text-fg"
              }`}
              title="Light theme"
            >
              <Icons.Sun size="sm" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs transition-colors ${
                theme === "dark"
                  ? "bg-surface-2 text-fg font-medium"
                  : "text-fg-muted hover:text-fg"
              }`}
              title="Dark theme"
            >
              <Icons.Moon size="sm" />
              <span className="hidden sm:inline">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs transition-colors ${
                theme === "system"
                  ? "bg-surface-2 text-fg font-medium"
                  : "text-fg-muted hover:text-fg"
              }`}
              title="System theme"
            >
              <Icons.Laptop size="sm" />
              <span className="hidden sm:inline">Auto ({resolvedTheme})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container with whitespace hierarchy: 40px+ between sections */}
      <main className="mx-auto max-w-5xl space-y-12 px-4 py-8 sm:px-6">
        {/* Large Title Section */}
        <div>
          <div className="label-caps mb-1">0-Qadam · Poydevor</div>
          <h2 className="text-display text-fg">
            Dizayn Tili &amp; Tokenlar
          </h2>
          <p className="mt-1 text-sm text-fg-muted max-w-2xl">
            Neytral asos (95%), bitta brend rangi, qora/oq primary tugma, hairline ajratgichlar,
            va tabular raqamlar.
          </p>
        </div>

        {/* 1. Neytral va Brend Shkalasi (§1.1) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-2">
            <h3 className="text-title text-fg">1. Neytral &amp; Brend Tokenlari</h3>
            <span className="text-xs font-mono text-fg-subtle">
              Theme: {resolvedTheme.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <ColorSwatch
              name="Canvas"
              token="--canvas"
              hex={resolvedTheme === "dark" ? "#0C0D10" : "#F7F8FA"}
              bgStyle="bg-canvas"
              textStyle="text-fg"
              border
            />
            <ColorSwatch
              name="Surface"
              token="--surface"
              hex={resolvedTheme === "dark" ? "#131519" : "#FFFFFF"}
              bgStyle="bg-surface"
              textStyle="text-fg"
              border
            />
            <ColorSwatch
              name="Surface-2"
              token="--surface-2"
              hex={resolvedTheme === "dark" ? "#1B1E24" : "#F1F3F6"}
              bgStyle="bg-surface-2"
              textStyle="text-fg"
            />
            <ColorSwatch
              name="Text Main"
              token="--fg"
              hex={resolvedTheme === "dark" ? "#EDF0F5" : "#0F1115"}
              bgStyle="bg-fg"
              textStyle="text-canvas"
            />
            <ColorSwatch
              name="Text Muted"
              token="--fg-muted"
              hex={resolvedTheme === "dark" ? "#A0A8B8" : "#5B6472"}
              bgStyle="bg-surface-2"
              textStyle="text-fg-muted"
            />
            <ColorSwatch
              name="Hairline"
              token="--hairline"
              hex={resolvedTheme === "dark" ? "rgba(255,255,255,.08)" : "rgba(15,17,21,.08)"}
              bgStyle="bg-surface border border-hairline"
              textStyle="text-fg-subtle"
            />
            <ColorSwatch
              name="Brand"
              token="--brand"
              hex={resolvedTheme === "dark" ? "#7C9BFF" : "#2A4FD7"}
              bgStyle="bg-brand"
              textStyle="text-canvas"
            />
          </div>
        </section>

        {/* 2. Status Indikatorlari */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h3 className="text-title text-fg">2. Holat (Status) Indikatorlari</h3>
            <p className="text-xs text-fg-muted mt-0.5">
              To'ldirilgan kamalak pill emas — nuqta/ikonka + matn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 rounded-md bg-surface p-4 border border-hairline">
            <div className="flex items-center gap-2">
              <span className="text-xs text-fg-subtle">Dot:</span>
              <Badge variant="ok">Muvaffaqiyatli</Badge>
              <Badge variant="warn">Kutilmoqda</Badge>
              <Badge variant="fail">Xatolik</Badge>
              <Badge variant="neutral">Bajarilmadi</Badge>
              <Badge variant="brand">Faol sessiya</Badge>
            </div>
            <div className="h-4 w-px bg-hairline hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-fg-subtle">Subtle:</span>
              <Badge variant="ok" styleType="subtle">To'langan</Badge>
              <Badge variant="warn" styleType="subtle">Tekshiruvda</Badge>
              <Badge variant="fail" styleType="subtle">Bekor qilingan</Badge>
              <Badge variant="neutral" styleType="subtle">Arxiv</Badge>
            </div>
          </div>
        </section>

        {/* 3. Tipografika va Tabular Raqamlar */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h3 className="text-title text-fg">3. Tipografika &amp; Tabular Raqamlar</h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Display 30/600, Title 20/600, Body 14/400, Label 12 CAPS. Pul ustunlari tabular.
            </p>
          </div>

          {/* Grouped Inset Data Table (No card-in-card) */}
          <div className="rounded-md bg-surface border border-hairline overflow-hidden">
            <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
              <span className="label-caps">Oxirgi Ledger Yozuvlari</span>
              <span className="text-xs font-mono text-fg-subtle">4 ta qator</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs text-fg-muted">
                    <th className="px-4 py-2.5 font-medium">Tranzaksiya / ID</th>
                    <th className="px-4 py-2.5 font-medium">Foydalanuvchi</th>
                    <th className="px-4 py-2.5 font-medium">Holat</th>
                    <th className="px-4 py-2.5 text-right font-medium">Summa (UZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-fg-muted">tx_88204b1</td>
                    <td className="px-4 py-3 text-sm text-fg font-medium">@kingdev</td>
                    <td className="px-4 py-3"><Badge variant="ok">To'ldirildi</Badge></td>
                    <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-fg">
                      +150 000,00 so'm
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-fg-muted">tx_88204b2</td>
                    <td className="px-4 py-3 text-sm text-fg font-medium">@alex_uz</td>
                    <td className="px-4 py-3"><Badge variant="warn">Tekshirilmoqda</Badge></td>
                    <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-fg">
                      +1 250 000,00 so'm
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-fg-muted">tx_88204b3</td>
                    <td className="px-4 py-3 text-sm text-fg font-medium">@nodir_99</td>
                    <td className="px-4 py-3"><Badge variant="fail">Rad etildi</Badge></td>
                    <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-fg-muted">
                      0,00 so'm
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-2/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-fg-muted">tx_88204b4</td>
                    <td className="px-4 py-3 text-sm text-fg font-medium">@jasur_m</td>
                    <td className="px-4 py-3"><Badge variant="neutral">Hold</Badge></td>
                    <td className="px-4 py-3 text-right font-mono font-medium tabular-nums text-fg">
                      -45 000,00 so'm
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. Tugma Holatlari (§1.1 & §3.5) */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-title text-fg">4. Tugmalar (Bitta Primary, Jim Secondary)</h3>
              <p className="text-xs text-fg-muted mt-0.5">
                Primary = qora/oq to'ldirilgan; Secondary = surface + hairline; pointerdown javob ≤100ms.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setButtonLoading((v) => !v)}
            >
              <Icons.Refresh size="sm" />
              <span>Loading: {buttonLoading ? "Yoqilgan" : "O'chiq"}</span>
            </Button>
          </div>

          <div className="rounded-md bg-surface p-4 sm:p-5 border border-hairline space-y-5">
            <div>
              <div className="label-caps mb-2">Variantlar</div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Single filled primary button on screen */}
                <Button variant="primary" isLoading={buttonLoading}>
                  <span>Asosiy Harakat (Primary)</span>
                </Button>
                <Button variant="secondary" isLoading={buttonLoading}>
                  <span>Ikkilamchi (Secondary)</span>
                </Button>
                <Button variant="ghost" isLoading={buttonLoading}>
                  <span>Ghost</span>
                </Button>
                <Button variant="destructive" isLoading={buttonLoading}>
                  <span>Destructive</span>
                </Button>
                <Button disabled>
                  <span>Disabled</span>
                </Button>
              </div>
            </div>

            <div className="border-t border-hairline pt-4">
              <div className="label-caps mb-2">O'lchamlar (xs 28px, sm 32px, md 36px, touch 44px)</div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs" variant="secondary">XS 28px</Button>
                <Button size="sm" variant="secondary">SM 32px</Button>
                <Button size="md" variant="secondary">MD 36px</Button>
                <Button size="icon" variant="secondary" title="Qidiruv">
                  <Icons.Search size="sm" />
                </Button>
                <Button size="icon" variant="ghost" title="Sozlamalar">
                  <Icons.Settings size="sm" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Forma Elementlari & iOS 16px Baseline */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h3 className="text-title text-fg">5. Forma Elementlari (16px iOS Input)</h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Input font-size doim 16px (Safari auto-zoom'ning oldini oladi).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-fg">Oddiy Input</label>
              <Input placeholder="Foydalanuvchi qidirish..." />
              <span className="text-[11px] text-fg-subtle">Username yoki Telegram ID</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-status-fail">Xatolik (422)</label>
              <Input error defaultValue="not-a-number" />
              <span className="text-[11px] text-status-fail">Summa kamida 2 000 so'm bo'lishi shart</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-fg-muted">O'chirilgan</label>
              <Input disabled defaultValue="Muzlatilgan qiymat" />
              <span className="text-[11px] text-fg-subtle">Faqat o'qish uchun</span>
            </div>
          </div>
        </section>

        {/* 6. Motion & Accessibility */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-title text-fg">6. Spring Motion &amp; a11y</h3>
              <p className="text-xs text-fg-muted mt-0.5">
                Critically damped spring (bounce: 0, ~0.3s) va prefers-reduced-motion.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-fg-muted flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotionSim}
                  onChange={(e) => setReducedMotionSim(e.target.checked)}
                  className="rounded border-hairline"
                />
                <span>Simulate Reduced Motion</span>
              </label>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setMotionBoxOpen((v) => !v)}
              >
                <span>{motionBoxOpen ? "Yopish" : "Spring Sinash"}</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-surface p-4 border border-hairline overflow-hidden">
            <AnimatePresence mode="wait">
              {motionBoxOpen ? (
                <motion.div
                  key="open"
                  initial={{ opacity: 0, y: reducedMotionSim ? 0 : -8, scale: reducedMotionSim ? 1 : 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: reducedMotionSim ? 0 : -6, scale: reducedMotionSim ? 1 : 0.99 }}
                  transition={reducedMotionSim ? springPresets.reduced : springPresets.default}
                  className="rounded-sm bg-surface-2 p-4 flex items-center gap-3"
                >
                  <Icons.CheckCircle size="md" className="text-status-ok" />
                  <div>
                    <div className="text-sm font-medium text-fg">Spring Motion Aktiv</div>
                    <div className="text-xs text-fg-muted">
                      {reducedMotionSim
                        ? "Reduced motion: no-translation opacity crossfade (0.15s)."
                        : "Apple-style critically damped spring (stiffness: 400, damping: 30)."}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="py-4 text-center text-xs text-fg-subtle">
                  Yuqoridagi tugmani bosing va spring harakatini sinab ko'ring
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 7. Skeleton & Loading States */}
        <section className="space-y-4">
          <div className="border-b border-hairline pb-2">
            <h3 className="text-title text-fg">7. Yuklanish (Skeleton)</h3>
            <p className="text-xs text-fg-muted mt-0.5">
              300ms dan oshgan jarayonlar uchun layout shaklini takrorlovchi puls.
            </p>
          </div>

          <div className="rounded-md bg-surface p-4 border border-hairline space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-sm" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-1/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <Skeleton className="h-14 rounded-sm" />
              <Skeleton className="h-14 rounded-sm" />
              <Skeleton className="h-14 rounded-sm" />
            </div>
          </div>
        </section>
      </main>

      {/* Modern iOS Mobile Preview Footer Bar (Section 3.7) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-hairline bg-canvas/80 backdrop-blur-md p-3 safe-pb">
        <Button variant="primary" className="w-full min-h-[44px]">
          Asosiy Amal (To'liq Kenglik)
        </Button>
      </div>

      <footer className="mt-16 border-t border-hairline py-6 text-center text-xs text-fg-subtle">
        Donater Admin — Step 0 Neutral Foundation System
      </footer>
    </div>
  );
}

interface ColorSwatchProps {
  name: string;
  token: string;
  hex: string;
  bgStyle: string;
  textStyle: string;
  border?: boolean;
}

function ColorSwatch({
  name,
  token,
  hex,
  bgStyle,
  textStyle,
  border = false,
}: ColorSwatchProps) {
  return (
    <div className="rounded-sm bg-surface p-2 border border-hairline transition-colors">
      <div
        className={`h-10 w-full rounded-sm flex items-center justify-center font-mono text-xs font-semibold ${bgStyle} ${textStyle} ${
          border ? "border border-hairline" : ""
        }`}
      >
        Aa
      </div>
      <div className="mt-1.5 space-y-0.5">
        <div className="text-xs font-medium text-fg truncate">{name}</div>
        <div className="text-[10px] font-mono text-fg-subtle truncate">{token}</div>
        <div className="text-[10px] font-mono text-fg-muted">{hex}</div>
      </div>
    </div>
  );
}
