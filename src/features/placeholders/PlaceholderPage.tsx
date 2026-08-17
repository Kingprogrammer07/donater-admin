import { useLocation, useParams } from "react-router";
import { findNavItemByPath } from "@/components/layout/navItems";
import { useToast } from "@/lib/toast/ToastContext";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PlaceholderPage() {
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const toast = useToast();

  const navItem = findNavItemByPath(location.pathname);

  const title = navItem?.label || "Boshqaruv";
  const step = navItem?.step ?? 2;
  const description = navItem?.description || "Ushbu sahifa navbatdagi qadamda to'liq quriladi.";
  const IconComponent = navItem ? Icons[navItem.icon] : Icons.Layers;

  const handleTestError = () => {
    throw new Error("Sinov xatoligi: ErrorBoundary ishlashini tekshirish.");
  };

  const handleTest500Toast = () => {
    const fakeRequestId = "req_" + Math.random().toString(36).slice(2, 12);
    toast.error("Serverda ichki xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.", {
      title: "500 Server Xatosi",
      requestId: fakeRequestId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="label-caps">{step}-QADAM REJASI</span>
            <Badge variant="brand" styleType="subtle" className="text-xs">
              Qobiq Tayyor
            </Badge>
          </div>
          <h1 className="text-display font-semibold tracking-tight text-fg flex items-center gap-2.5">
            <IconComponent size="md" className="text-fg-muted" />
            <span>
              {title} {params.id ? `(#${params.id})` : ""}
            </span>
          </h1>
          <p className="text-xs text-fg-muted max-w-2xl leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Placeholder Empty State Box (§1.2 Grouped Inset style) */}
      <div className="rounded-md border border-hairline bg-surface p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="size-12 rounded-full bg-surface-2 flex items-center justify-center text-fg-muted">
            <IconComponent size="md" />
          </div>
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          <h2 className="text-base font-semibold text-fg">
            {title} {params.id ? `(ID: ${params.id})` : ""} ekrani {step}-qadamda ishlab chiqiladi
          </h2>
          {params.id && (
            <div className="inline-block px-3 py-1 rounded-sm bg-surface-2 font-mono text-xs text-fg font-medium">
              useParams id: {params.id}
            </div>
          )}
          <p className="text-xs text-fg-muted leading-relaxed">
            Hozirda 2-qadam (React Router v7 deklarativ marshrutlar, Layout qobig'i, navigatsiya, header, toast tizimi va xato chegaralari) to'liq faol.
          </p>
        </div>

        {/* Toast & ErrorBoundary Interactive Testing Area */}
        <div className="border-t border-hairline pt-6 mt-6 max-w-xl mx-auto space-y-3">
          <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
            2-Qadam Qobiq Imkoniyatlarini Sinash:
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => toast.success("Ma'lumot muvaffaqiyatli saqlandi!", { title: "Muvaffaqiyat" })}
              className="text-status-ok"
            >
              <Icons.CheckCircle size="sm" />
              <span>Success Toast</span>
            </Button>

            <Button
              variant="secondary"
              size="xs"
              onClick={handleTest500Toast}
              className="text-status-fail"
            >
              <Icons.AlertCircle size="sm" />
              <span>500 Error Toast (Request ID)</span>
            </Button>

            <Button
              variant="secondary"
              size="xs"
              onClick={() => toast.warn("Ushbu amal qaytarilmaydi.", { title: "Ogohlantirish" })}
              className="text-status-warn"
            >
              <Icons.AlertTriangle size="sm" />
              <span>Warn Toast</span>
            </Button>

            <Button
              variant="secondary"
              size="xs"
              onClick={handleTestError}
              className="text-status-fail border-status-fail/30"
            >
              <Icons.XCircle size="sm" />
              <span>Trigger ErrorBoundary</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
