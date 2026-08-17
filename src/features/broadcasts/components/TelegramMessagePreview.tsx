import { useState } from "react";
import { Icons } from "@/components/icons";
import type { BroadcastButton } from "@/api/types";

export interface TelegramMessagePreviewProps {
  textUz: string;
  textRu?: string | null;
  textEn?: string | null;
  buttons?: BroadcastButton[];
  className?: string;
}

export function TelegramMessagePreview({
  textUz,
  textRu,
  textEn,
  buttons = [],
  className = "",
}: TelegramMessagePreviewProps) {
  const [activeLang, setActiveLang] = useState<"uz" | "ru" | "en">("uz");

  const currentText =
    activeLang === "uz"
      ? textUz
      : activeLang === "ru"
      ? textRu || textUz
      : textEn || textUz;

  const nowTime = new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`rounded-md border border-hairline bg-surface p-4 space-y-3 shadow-1 ${className}`}>
      {/* Header with Language Tabs */}
      <div className="flex items-center justify-between border-b border-hairline pb-2.5">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-brand-muted flex items-center justify-center text-brand">
            <Icons.Send size={12} />
          </div>
          <span className="text-xs font-semibold text-fg">Telegramda ko'rinishi</span>
        </div>

        <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-xs border border-hairline">
          {(["uz", "ru", "en"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-2 py-0.5 rounded-xs text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeLang === lang
                  ? "bg-surface text-fg font-bold shadow-0"
                  : "text-fg-subtle hover:text-fg"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Simulated Telegram Chat Window */}
      <div className="rounded-sm border border-hairline bg-surface-2/70 p-3 sm:p-4 space-y-2 select-none">
        {/* Telegram Bubble */}
        <div className="max-w-[340px] ml-auto rounded-sm border border-hairline bg-surface p-3 shadow-1 space-y-2 text-left">
          {/* Bot Brand Header */}
          <div className="flex items-center gap-1.5 pb-1 border-b border-hairline/60">
            <span className="font-semibold text-xs text-brand">Donater Bot</span>
            <Icons.CheckCircle size={11} className="text-brand" />
            <span className="text-xs text-fg-subtle ml-auto">bot</span>
          </div>

          {/* Message Text */}
          <div className="text-xs text-fg leading-relaxed whitespace-pre-wrap break-words min-h-[48px]">
            {currentText.trim() ? (
              currentText
            ) : (
              <span className="text-fg-subtle italic">
                Xabar matni kiritilmagan...
              </span>
            )}
          </div>

          {/* Timestamp & Read Tick */}
          <div className="flex items-center justify-end gap-1 text-[12px] text-fg-subtle pt-0.5">
            <span>{nowTime}</span>
            <Icons.Check size={12} className="text-brand" />
          </div>
        </div>

        {/* Inline Buttons Grid */}
        {buttons && buttons.length > 0 && (
          <div className="max-w-[340px] ml-auto space-y-1">
            {buttons.map((btn, idx) => {
              const btnText =
                activeLang === "uz"
                  ? btn.text_uz
                  : activeLang === "ru"
                  ? btn.text_ru || btn.text_uz
                  : btn.text_en || btn.text_uz;

              return (
                <div
                  key={idx}
                  className="w-full py-1.5 px-3 rounded-xs border border-hairline bg-surface text-xs font-medium text-brand text-center hover:bg-surface-2 transition-colors flex items-center justify-center gap-1.5 shadow-0"
                >
                  <span className="truncate">{btnText || `Tugma #${idx + 1}`}</span>
                  <Icons.ArrowRight size={11} className="opacity-60" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
