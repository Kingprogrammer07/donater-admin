import { useTheme } from "@/lib/theme";
import { useRouter } from "@/lib/router/RouterContext";
import { Icons } from "@/components/icons";
import { findNavItemByPath } from "./navItems";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { pathname, navigate } = useRouter();

  const currentNav = findNavItemByPath(pathname);
  const pageTitle = currentNav?.label || "Boshqaruv";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/80 backdrop-blur-md safe-pt select-none">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left Section: Mobile Menu Toggle + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile hamburger button */}
          <button
            onClick={onMenuToggle}
            className="flex md:hidden size-11 items-center justify-center rounded-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer shrink-0"
            aria-label="Menyuni ochish"
          >
            <Icons.Menu size="md" />
          </button>

          {/* Breadcrumb Hierarchy */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs truncate">
            <button
              onClick={() => navigate("/")}
              className="text-fg-subtle hover:text-fg transition-colors cursor-pointer shrink-0 truncate font-mono text-[11px]"
            >
              Donater
            </button>
            <span className="text-fg-subtle shrink-0">/</span>
            <span className="font-semibold text-fg truncate">{pageTitle}</span>
          </nav>
        </div>

        {/* Right Section: Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 rounded-sm border border-hairline bg-surface p-0.5">
            <button
              onClick={() => setTheme("light")}
              className={`size-8 sm:size-7 flex items-center justify-center rounded-sm transition-colors cursor-pointer ${
                theme === "light" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
              }`}
              title="Yorug' rejim (Light)"
              aria-label="Yorug' rejim"
            >
              <Icons.Sun size="sm" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`size-8 sm:size-7 flex items-center justify-center rounded-sm transition-colors cursor-pointer ${
                theme === "dark" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
              }`}
              title="Qorong'u rejim (Dark)"
              aria-label="Qorong'u rejim"
            >
              <Icons.Moon size="sm" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`size-8 sm:size-7 flex items-center justify-center rounded-sm transition-colors cursor-pointer ${
                theme === "system" ? "bg-surface-2 text-fg" : "text-fg-muted hover:text-fg"
              }`}
              title="Tizim rejimi (System)"
              aria-label="Tizim rejimi"
            >
              <Icons.Laptop size="sm" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
