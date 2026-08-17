import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "@/lib/router/RouterContext";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { NAV_SECTIONS, type NavItemConfig } from "./navItems";

interface SidebarProps {
  onItemClick?: () => void;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onItemClick, onClose, className = "" }: SidebarProps) {
  const { admin, hasPermission, logout } = useAuth();
  const { navigate, isActive } = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  return (
    <aside
      className={`flex flex-col justify-between h-full bg-surface border-r border-hairline select-none ${className}`}
    >
      {/* Top Header & Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto overscroll-contain">
        {/* Brand Monogram & Title */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-hairline">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 items-center justify-center rounded-sm bg-fg text-canvas font-mono text-xs font-bold shadow-1 shrink-0">
              D
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight text-fg truncate">Donater Admin</span>
              <span className="text-xs text-fg-subtle truncate">Boshqaruv Paneli</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="brand" styleType="subtle" className="text-xs uppercase">
              {String(admin?.role || "admin")}
            </Badge>

            {onClose && (
              <button
                onClick={onClose}
                className="size-8 flex items-center justify-center rounded-sm text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer ml-1"
                aria-label="Menyuni yopish"
              >
                <Icons.X size="sm" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-5 flex-1">
          {NAV_SECTIONS.map((section) => {
            // Filter items by user permission
            const visibleItems = section.items.filter((item) => {
              if (!item.permission) return true;
              return hasPermission(item.permission);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.id} className="space-y-1">
                <div className="px-3 pb-1 text-xs font-semibold text-fg-subtle uppercase tracking-wider">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <SidebarNavItem
                      key={item.id}
                      item={item}
                      active={isActive(item.path)}
                      onClick={() => handleNavClick(item.path)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="p-3 border-t border-hairline bg-surface">
        <div className="flex items-center justify-between p-2 rounded-sm bg-surface-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-full bg-surface flex items-center justify-center text-fg font-mono text-xs font-bold shrink-0 border border-hairline">
              {String(admin?.full_name || admin?.username || "A")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-fg truncate">
                {String(admin?.full_name || admin?.username || "Admin")}
              </div>
              <div className="text-xs font-mono text-fg-subtle truncate">
                {admin?.username ? `@${admin.username}` : `ID: ${admin?.tg_id}`}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="size-11 flex items-center justify-center rounded-sm text-fg-muted hover:text-status-fail hover:bg-status-fail-bg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Tizimdan chiqish"
            aria-label="Tizimdan chiqish"
          >
            {isLoggingOut ? (
              <Icons.Spinner size="sm" className="animate-spin text-status-fail" />
            ) : (
              <Icons.Logout size="sm" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavItem({
  item,
  active,
  onClick,
}: {
  item: NavItemConfig;
  active: boolean;
  onClick: () => void;
}) {
  const IconComponent = Icons[item.icon] || Icons.FolderTree;

  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-sm text-xs transition-colors text-left cursor-pointer group ${
        active
          ? "bg-surface-2 text-fg font-semibold shadow-0"
          : "text-fg-muted hover:text-fg hover:bg-surface-2/60"
      }`}
    >
      <IconComponent
        size="sm"
        className={`shrink-0 transition-colors ${
          active ? "text-brand" : "text-fg-subtle group-hover:text-fg"
        }`}
      />
      <span className="truncate flex-1">{item.label}</span>
      {active && (
        <span className="size-1.5 rounded-full bg-brand shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
