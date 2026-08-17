import { Badge } from "@/components/ui/badge";
import { DateTime } from "@/components/ui/datetime";
import { Icons } from "@/components/icons";
import type { AudienceFilter } from "@/api/types";

export interface AudienceFilterSummaryProps {
  filter?: AudienceFilter | null;
  className?: string;
}

export function AudienceFilterSummary({ filter, className = "" }: AudienceFilterSummaryProps) {
  if (!filter || Object.keys(filter).length === 0) {
    return (
      <div className={`p-3 rounded-xs border border-hairline bg-surface-2/40 text-xs text-fg-muted space-y-1 ${className}`}>
        <div className="flex items-center gap-1.5 font-semibold text-fg">
          <Icons.Users size={13} />
          <span>Barcha foydalanuvchilar (Filtrsiz)</span>
        </div>
        <p className="text-fg-subtle">
          Xabarnoma barcha faol (bloklanmagan) foydalanuvchilarga yuboriladi.
        </p>
      </div>
    );
  }

  const items: { icon: keyof typeof Icons; label: string; value: React.ReactNode }[] = [];

  // Languages
  if (filter.languages && filter.languages.length > 0) {
    const langLabels: Record<string, string> = {
      uz: "O'zbekcha (UZ)",
      ru: "Ruscha (RU)",
      en: "Inglizcha (EN)",
    };
    items.push({
      icon: "List",
      label: "Tanlangan tillar",
      value: (
        <div className="flex items-center gap-1 flex-wrap">
          {filter.languages.map((lang) => (
            <Badge key={lang} variant="neutral" styleType="subtle" className="text-xs uppercase font-mono">
              {langLabels[lang] || lang}
            </Badge>
          ))}
        </div>
      ),
    });
  } else {
    items.push({
      icon: "List",
      label: "Tillar",
      value: <span className="text-fg">Barcha tillar</span>,
    });
  }

  // Blocked status
  items.push({
    icon: "Shield",
    label: "Bloklanganlar",
    value: filter.include_blocked ? (
      <span className="text-status-warn font-medium">Bloklangan foydalanuvchilar kiritilgan</span>
    ) : (
      <span className="text-fg">Faqat bloklanmaganlar (Standart)</span>
    ),
  });

  // Balance range
  if (filter.balance_min !== undefined && filter.balance_min !== null || filter.balance_max !== undefined && filter.balance_max !== null) {
    const minStr = filter.balance_min !== null && filter.balance_min !== undefined ? `${Number(filter.balance_min).toLocaleString("uz-UZ")} UZS` : "0 UZS";
    const maxStr = filter.balance_max !== null && filter.balance_max !== undefined ? `${Number(filter.balance_max).toLocaleString("uz-UZ")} UZS` : "Cheksiz";
    items.push({
      icon: "Wallet",
      label: "Balans oralig'i",
      value: (
        <span className="font-mono text-fg font-medium">
          {minStr} — {maxStr}
        </span>
      ),
    });
  }

  // Order status
  if (filter.has_ordered !== undefined && filter.has_ordered !== null) {
    items.push({
      icon: "ShoppingCart",
      label: "Xaridorlik holati",
      value: filter.has_ordered ? (
        <Badge variant="ok" styleType="subtle" className="text-xs">
          Faqat kamida 1 marta buyurtma qilganlar
        </Badge>
      ) : (
        <Badge variant="neutral" styleType="subtle" className="text-xs">
          Hech qachon buyurtma qilmaganlar
        </Badge>
      ),
    });
  }

  // Activity seen_after
  if (filter.seen_after) {
    items.push({
      icon: "Activity",
      label: "Oxirgi faollik",
      value: (
        <span>
          <DateTime value={filter.seen_after} mode="relative" className="text-fg font-medium" /> dan keyin
        </span>
      ),
    });
  }

  // Registration dates
  if (filter.registered_from || filter.registered_to) {
    items.push({
      icon: "Clock",
      label: "Ro'yxatdan o'tgan davr",
      value: (
        <span className="text-fg font-medium">
          {filter.registered_from ? new Date(filter.registered_from).toLocaleDateString("uz-UZ") : "Boshidan"} —{" "}
          {filter.registered_to ? new Date(filter.registered_to).toLocaleDateString("uz-UZ") : "Hozirgacha"}
        </span>
      ),
    });
  }

  return (
    <div className={`p-3 rounded-xs border border-hairline bg-surface-2/40 space-y-2 text-xs ${className}`}>
      <div className="flex items-center gap-1.5 font-semibold text-fg border-b border-hairline pb-1.5">
        <Icons.Users size={13} />
        <span>Auditoriya filtri parametrlari</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {items.map((item, idx) => {
          const IconComp = Icons[item.icon] || Icons.Check;
          return (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center gap-1 text-fg-subtle">
                <IconComp size={11} />
                <span>{item.label}:</span>
              </div>
              <div className="text-fg">{item.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
