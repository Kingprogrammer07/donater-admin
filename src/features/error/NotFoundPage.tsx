import { Link, useLocation } from "react-router";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";

export function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center p-6 text-center select-none">
      <div className="max-w-[420px] space-y-5">
        <div className="flex justify-center">
          <div className="size-14 rounded-full bg-surface-2 flex items-center justify-center text-fg-muted">
            <Icons.HelpCircle size="lg" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="label-caps">404 · Sahifa Topilmadi</div>
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            Bunday sahifa mavjud emas
          </h2>
          <p className="text-xs text-fg-muted leading-relaxed">
            Siz kiritgan <code className="font-mono text-fg bg-surface-2 px-1.5 py-0.5 rounded-sm">{location.pathname}</code> manzili bo'yicha hech qanday bo'lim topilmadi.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to="/"
            className={buttonVariants({ variant: "primary", size: "md" }) + " gap-2 no-underline"}
          >
            <Icons.Home size="sm" />
            <span>Dashboard'ga qaytish</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
