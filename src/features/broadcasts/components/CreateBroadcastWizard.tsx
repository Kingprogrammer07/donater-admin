import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { broadcastApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { ApiError } from "@/api/errors";
import { queryClient } from "@/lib/queryClient";
import { AnimatePresence, motion } from "motion/react";
import { TelegramMessagePreview } from "./TelegramMessagePreview";
import { AudienceFilterSummary } from "./AudienceFilterSummary";
import type { AudienceFilter, BroadcastButton, BroadcastCreateRequest } from "@/api/types";

export interface CreateBroadcastWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBroadcastWizard({ isOpen, onClose }: CreateBroadcastWizardProps) {
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // --- Step 1: Audience State ---
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [includeBlocked, setIncludeBlocked] = useState<boolean>(false);
  const [balanceMin, setBalanceMin] = useState<string>("");
  const [balanceMax, setBalanceMax] = useState<string>("");
  const [hasOrdered, setHasOrdered] = useState<string>("all"); // 'all' | 'true' | 'false'
  const [seenAfter, setSeenAfter] = useState<string>("");
  const [registeredFrom, setRegisteredFrom] = useState<string>("");
  const [registeredTo, setRegisteredTo] = useState<string>("");

  // --- Step 2: Message State ---
  const [activeMessageLang, setActiveMessageLang] = useState<"uz" | "ru" | "en">("uz");
  const [textUz, setTextUz] = useState<string>("");
  const [textRu, setTextRu] = useState<string>("");
  const [textEn, setTextEn] = useState<string>("");
  const [buttons, setButtons] = useState<BroadcastButton[]>([]);

  // --- Step 3: Schedule State ---
  const [scheduledAt, setScheduledAt] = useState<string>("");

  // Build current audience filter object
  const audienceFilter: AudienceFilter = {
    languages: selectedLangs.length > 0 ? (selectedLangs as ("uz" | "ru" | "en")[]) : null,
    include_blocked: includeBlocked,
    balance_min: balanceMin ? Number(balanceMin) : null,
    balance_max: balanceMax ? Number(balanceMax) : null,
    has_ordered: hasOrdered === "all" ? null : hasOrdered === "true",
    seen_after: seenAfter ? new Date(seenAfter).toISOString() : null,
    registered_from: registeredFrom ? new Date(registeredFrom).toISOString() : null,
    registered_to: registeredTo ? new Date(registeredTo).toISOString() : null,
  };

  // Live Audience Preview Query with debounce
  const { data: previewData, isLoading: isPreviewLoading } = useQuery({
    queryKey: ["audience-preview", audienceFilter],
    queryFn: () => broadcastApi.previewAudience(audienceFilter),
    enabled: isOpen && step === 1,
    staleTime: 300,
  });

  const audienceTotal = previewData?.total ?? 0;

  // Create Broadcast Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: BroadcastCreateRequest) => {
      return broadcastApi.create(payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
      success(`Xabarnoma qoralamasi #${res.id} yaratildi. Yuborish uchun alohida tasdiq kerak.`);
      handleResetAndClose();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        toastError(err.message, { requestId: err.requestId });
      } else {
        toastError("Xabarnoma yaratishda xatolik yuz berdi.");
      }
    },
  });

  const handleResetAndClose = () => {
    setStep(1);
    setSelectedLangs([]);
    setIncludeBlocked(false);
    setBalanceMin("");
    setBalanceMax("");
    setHasOrdered("all");
    setSeenAfter("");
    setRegisteredFrom("");
    setRegisteredTo("");
    setTextUz("");
    setTextRu("");
    setTextEn("");
    setButtons([]);
    setScheduledAt("");
    onClose();
  };

  // Button management
  const handleAddButton = () => {
    if (buttons.length >= 5) return;
    setButtons([
      ...buttons,
      { url: "https://", text_uz: `Havola #${buttons.length + 1}` },
    ]);
  };

  const handleUpdateButton = (index: number, patch: Partial<BroadcastButton>) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], ...patch } as BroadcastButton;
    setButtons(updated);
  };

  const handleRemoveButton = (index: number) => {
    setButtons(buttons.filter((_, idx) => idx !== index));
  };

  const handleFinalSubmit = async () => {
    if (!textUz.trim()) {
      toastError("O'zbekcha matn (text_uz) kiritilishi shart!");
      return;
    }

    const payload: BroadcastCreateRequest = {
      audience: audienceFilter,
      text_uz: textUz.trim(),
      text_ru: textRu.trim() || null,
      text_en: textEn.trim() || null,
      buttons: buttons.map((b) => ({
        url: b.url.trim(),
        text_uz: b.text_uz.trim(),
        text_ru: b.text_ru?.trim() || null,
        text_en: b.text_en?.trim() || null,
      })),
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    };

    await createMutation.mutateAsync(payload);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
          aria-hidden="true"
        />

        {/* Wizard Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-3xl rounded-md border border-hairline bg-surface p-6 shadow-3 z-10 space-y-5 my-8"
        >
          {/* Header & Step Indicator */}
          <div className="flex items-start justify-between border-b border-hairline pb-4">
            <div>
              <h2 id="wizard-title" className="text-base font-bold text-fg tracking-tight">
                Yangi xabarnoma yaratish (Broadcast Wizard)
              </h2>
              <p className="text-xs text-fg-subtle mt-0.5">
                Auditoriya segmentatsiyasi, ko'p tilli xabar va yuborishni rejalashtirish
              </p>
            </div>

            <button
              onClick={handleResetAndClose}
              className="text-fg-subtle hover:text-fg p-1 rounded-xs transition-colors"
              aria-label="Yopish"
            >
              <Icons.X size="sm" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, title: "1. Auditoriya", desc: "Segment tanlash" },
              { num: 2, title: "2. Xabar", desc: "Matn va tugmalar" },
              { num: 3, title: "3. Tasdiq", desc: "Ko'rib chiqish & Reja" },
            ].map((s) => {
              const isCurrent = step === s.num;
              const isPassed = step > s.num;
              return (
                <div
                  key={s.num}
                  className={`p-2.5 rounded-xs border text-xs transition-colors ${
                    isCurrent
                      ? "border-brand bg-brand-muted/40 font-semibold"
                      : isPassed
                      ? "border-status-ok/40 bg-status-ok-bg/20 text-fg"
                      : "border-hairline bg-surface-2/40 text-fg-subtle"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isPassed ? (
                      <Icons.CheckCircle size={13} className="text-status-ok shrink-0" />
                    ) : (
                      <span
                        className={`size-4 rounded-full flex items-center justify-center text-[12px] font-mono shrink-0 ${
                          isCurrent ? "bg-brand text-canvas font-bold" : "bg-surface-2 text-fg-subtle"
                        }`}
                      >
                        {s.num}
                      </span>
                    )}
                    <span className={isCurrent ? "text-brand" : "text-fg font-medium"}>
                      {s.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* STEP 1: AUDIENCE */}
          {step === 1 && (
            <div className="space-y-4 pt-1">
              {/* Live Count Banner */}
              <div className="p-3.5 rounded-xs border border-brand/40 bg-brand-muted/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-full bg-brand flex items-center justify-center text-canvas shrink-0">
                    <Icons.Users size="sm" />
                  </div>
                  <div>
                    <span className="text-xs text-fg-subtle block font-medium">
                      Auditoriya qamrovi:
                    </span>
                    <span className="text-sm font-bold font-mono text-fg">
                      {isPreviewLoading ? (
                        "Hisoblanmoqda..."
                      ) : (
                        `${audienceTotal.toLocaleString("uz-UZ")} ta foydalanuvchi`
                      )}
                    </span>
                  </div>
                </div>

                {audienceTotal === 0 && !isPreviewLoading && (
                  <Badge variant="warn" styleType="subtle" className="text-xs">
                    0 ta foydalanuvchi
                  </Badge>
                )}
              </div>

              {/* Filters Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Languages */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-fg block">
                    Foydalanuvchi tili:
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { id: "uz", label: "O'zbekcha" },
                      { id: "ru", label: "Ruscha" },
                      { id: "en", label: "Inglizcha" },
                    ].map((lang) => {
                      const isSel = selectedLangs.includes(lang.id);
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setSelectedLangs(selectedLangs.filter((l) => l !== lang.id));
                            } else {
                              setSelectedLangs([...selectedLangs, lang.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xs border text-xs font-medium transition-colors cursor-pointer ${
                            isSel
                              ? "border-brand bg-brand-muted text-brand font-semibold"
                              : "border-hairline bg-canvas text-fg-muted hover:text-fg"
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs text-fg-subtle block">
                    {selectedLangs.length === 0 ? "Barcha tillar tanlangan" : `${selectedLangs.join(", ").toUpperCase()}`}
                  </span>
                </div>

                {/* Has Ordered */}
                <div className="space-y-1.5">
                  <label htmlFor="filter-has-ordered" className="text-xs font-semibold text-fg block">
                    Xarid tarixi:
                  </label>
                  <select
                    id="filter-has-ordered"
                    value={hasOrdered}
                    onChange={(e) => setHasOrdered(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg"
                  >
                    <option value="all">Barcha foydalanuvchilar</option>
                    <option value="true">Faqat xaridorlar (kamida 1 buyurtma)</option>
                    <option value="false">Hech qachon buyurtma bermaganlar</option>
                  </select>
                </div>

                {/* Balance Range */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-fg block">
                    Balans oralig'i (UZS):
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Min balans (UZS)"
                      value={balanceMin}
                      onChange={(e) => setBalanceMin(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Maks balans (UZS)"
                      value={balanceMax}
                      onChange={(e) => setBalanceMax(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                    />
                  </div>
                </div>

                {/* Include Blocked Toggle */}
                <div className="space-y-1.5 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setIncludeBlocked(!includeBlocked)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xs border text-xs transition-colors ${
                      includeBlocked
                        ? "border-status-warn/40 bg-status-warn-bg/20 text-status-warn font-semibold"
                        : "border-hairline bg-surface-2 text-fg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icons.Shield size="sm" />
                      <span>Bloklangan foydalanuvchilarga ham yuborilsin</span>
                    </div>
                    <span className="font-mono text-xs">{includeBlocked ? "HA" : "YO'Q"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MESSAGE */}
          {step === 2 && (
            <div className="space-y-4 pt-1">
              {/* Language Switcher Tabs */}
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <div className="flex items-center gap-2">
                  {(["uz", "ru", "en"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveMessageLang(lang)}
                      className={`px-3 py-1 rounded-xs text-xs font-semibold transition-colors cursor-pointer border ${
                        activeMessageLang === lang
                          ? "border-brand bg-brand-muted text-brand"
                          : "border-hairline bg-surface-2 text-fg-muted hover:text-fg"
                      }`}
                    >
                      {lang === "uz" ? "O'zbekcha (Majburiy)" : lang === "ru" ? "Ruscha (Ixtiyoriy)" : "Inglizcha (Ixtiyoriy)"}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-fg-subtle font-mono">
                  {(activeMessageLang === "uz" ? textUz : activeMessageLang === "ru" ? textRu : textEn).length} / 4096
                </span>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fg block">
                  Xabar matni ({activeMessageLang.toUpperCase()}):
                </label>
                <textarea
                  rows={6}
                  maxLength={4096}
                  placeholder={
                    activeMessageLang === "uz"
                      ? "Assalomu alaykum! Do'konimizda yangi aksiya..."
                      : "Xabar matni..."
                  }
                  value={
                    activeMessageLang === "uz"
                      ? textUz
                      : activeMessageLang === "ru"
                      ? textRu
                      : textEn
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeMessageLang === "uz") setTextUz(val);
                    else if (activeMessageLang === "ru") setTextRu(val);
                    else setTextEn(val);
                  }}
                  className="w-full p-3 rounded-xs border border-hairline bg-canvas text-xs text-fg leading-relaxed focus:outline-none focus:border-fg resize-y"
                />
              </div>

              {/* Inline Buttons Editor */}
              <div className="space-y-3 pt-2 border-t border-hairline">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.Tag size="sm" className="text-fg-muted" />
                    <span className="text-xs font-semibold text-fg">
                      Inline havolalar / Tugmalar (Maks 5 ta)
                    </span>
                  </div>

                  {buttons.length < 5 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddButton}
                      className="gap-1 text-xs"
                    >
                      <Icons.Plus size={12} />
                      <span>Tugma qo'shish</span>
                    </Button>
                  )}
                </div>

                {buttons.length === 0 ? (
                  <p className="text-xs text-fg-subtle italic">
                    Hozircha hech qanday inline tugma qo'shilmagan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {buttons.map((btn, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xs border border-hairline bg-surface-2/50 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center"
                      >
                        <div className="space-y-1">
                          <label className="text-[12px] text-fg-subtle block">
                            Tugma matni (UZ):
                          </label>
                          <input
                            type="text"
                            maxLength={64}
                            required
                            placeholder="Masalan: Saytga o'tish"
                            value={btn.text_uz}
                            onChange={(e) =>
                              handleUpdateButton(idx, { text_uz: e.target.value })
                            }
                            className="w-full px-2.5 py-1 rounded-xs border border-hairline bg-canvas text-xs text-fg focus:outline-none focus:border-fg"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[12px] text-fg-subtle block">
                            Havola (URL):
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://example.com"
                            value={btn.url}
                            onChange={(e) =>
                              handleUpdateButton(idx, { url: e.target.value })
                            }
                            className="w-full px-2.5 py-1 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                          />
                        </div>

                        <div className="flex items-center justify-end pt-4 sm:pt-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveButton(idx)}
                            className="text-xs text-status-fail hover:bg-status-fail-bg/20 gap-1"
                          >
                            <Icons.Trash size={12} />
                            <span>O'chirish</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & PREVIEW */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-1">
              {/* Left Column: Details & Schedule */}
              <div className="space-y-4">
                <AudienceFilterSummary filter={audienceFilter} />

                {/* Schedule DateTime Input */}
                <div className="p-3.5 rounded-xs border border-hairline bg-surface-2/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-fg">
                    <Icons.Clock size={13} className="text-fg-muted" />
                    <span>Rejalashtirilgan vaqt (Ixtiyoriy)</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xs border border-hairline bg-canvas text-xs text-fg font-mono focus:outline-none focus:border-fg"
                  />
                  <p className="text-xs text-fg-subtle">
                    Agar vaqt tanlansa, xabarnoma avtomatik tarzda o'sha vaqtda yuborishga tayyorlanadi.
                  </p>
                </div>

                {/* Safety Notice */}
                <div className="p-3 rounded-xs border border-brand/30 bg-brand-muted/20 text-xs text-fg-muted space-y-1">
                  <div className="flex items-center gap-1.5 text-brand font-semibold">
                    <Icons.ShieldCheck size={13} />
                    <span>Xavfsiz qoralama</span>
                  </div>
                  <p>
                    "Qoralamani yaratish" tugmasi bosilganda darhol xabar <strong>yuborilmaydi</strong>. Xabarnoma qoralamalar ro'yxatiga tushadi va uni boshlash uchun alohida tasdiq bosilishi kerak bo'ladi.
                  </p>
                </div>
              </div>

              {/* Right Column: Live Telegram Preview */}
              <div>
                <TelegramMessagePreview
                  textUz={textUz}
                  textRu={textRu}
                  textEn={textEn}
                  buttons={buttons}
                />
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-hairline">
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setStep((step - 1) as 1 | 2)}
                className="gap-1 text-xs"
              >
                <Icons.ArrowLeft size="sm" />
                <span>Orqaga</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleResetAndClose}
                className="text-xs"
              >
                Bekor qilish
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={step === 1 && audienceTotal === 0 && !isPreviewLoading}
                onClick={() => {
                  if (step === 1 && audienceTotal === 0) {
                    toastError("Auditoriya 0 bo'lganda davom etib bo'lmaydi.");
                    return;
                  }
                  if (step === 2 && !textUz.trim()) {
                    toastError("O'zbekcha matn kiritilishi majburiy!");
                    return;
                  }
                  setStep((step + 1) as 2 | 3);
                }}
                className="gap-1 text-xs"
              >
                <span>Keyingisi</span>
                <Icons.ArrowRight size="sm" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleFinalSubmit}
                disabled={createMutation.isPending}
                className="gap-2 text-xs font-semibold"
              >
                {createMutation.isPending && (
                  <Icons.Spinner size="sm" className="animate-spin" />
                )}
                <span>Qoralamani yaratish</span>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
