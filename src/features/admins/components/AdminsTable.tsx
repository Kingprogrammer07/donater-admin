import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "@/components/ui/datetime";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminRoleBadge } from "./AdminRoleBadge";
import type { AdminOut } from "@/api/types";

export interface AdminsTableProps {
  onEdit: (admin: AdminOut) => void;
  onCreate: () => void;
}

export function AdminsTable({ onEdit, onCreate }: AdminsTableProps) {
  const { admin: currentAdmin, hasPermission } = useAuth();
  const canManageAdmins = hasPermission("manage_admins");

  const {
    data: admins = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admins-list"],
    queryFn: () => adminApi.listAdmins(),
  });

  return (
    <div className="rounded-md border border-hairline bg-surface p-5 space-y-4 shadow-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-brand-muted flex items-center justify-center text-brand shrink-0">
            <Icons.ShieldCheck size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg tracking-tight">
                Adminlar Ro'yxati ({admins.length})
              </h2>
            </div>
            <p className="text-[12px] text-fg-subtle">
              Tizimga kirish huquqiga ega bo'lgan administratorlar va ularning rollari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canManageAdmins && (
            <Button
              variant="primary"
              size="sm"
              onClick={onCreate}
              className="gap-1.5 text-xs font-semibold"
            >
              <Icons.Plus size={13} />
              <span>Yangi admin</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 text-xs"
            title="Yangilash"
          >
            <Icons.Refresh size={12} className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xs border border-status-fail/40 bg-status-fail-bg/20 text-status-fail text-xs flex items-center justify-between">
          <span>Adminlar ro'yxatini yuklab bo'lmadi.</span>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
            Qayta urinish
          </Button>
        </div>
      ) : (
        <div className="border border-hairline rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-2/60 text-fg-subtle text-[12px]">
                <th className="p-3 font-medium">Telegram ID</th>
                <th className="p-3 font-medium">Ism / Username</th>
                <th className="p-3 font-medium">Rol</th>
                <th className="p-3 font-medium">Holati</th>
                <th className="p-3 font-medium">Oxirgi kirish</th>
                <th className="p-3 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {admins.map((adm: AdminOut) => {
                const isSelf = adm.id === currentAdmin?.id;

                return (
                  <tr key={adm.id} className="hover:bg-surface-2/40 transition-colors">
                    {/* Telegram ID */}
                    <td className="p-3 font-mono font-bold text-fg">
                      <div className="flex items-center gap-1.5">
                        <span>{adm.tg_id}</span>
                        {isSelf && (
                          <Badge variant="brand" styleType="subtle" className="text-[12px]">
                            Siz
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Name / Username */}
                    <td className="p-3 text-fg">
                      <div className="space-y-0.5">
                        <span className="font-medium block">
                          {adm.full_name || "—"}
                        </span>
                        {adm.username && (
                          <span className="text-[12px] text-fg-subtle font-mono block">
                            @{adm.username}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-3">
                      <AdminRoleBadge role={adm.role} />
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <Badge
                        variant={adm.is_active ? "ok" : "fail"}
                        styleType="subtle"
                        className="text-[12px] gap-1"
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            adm.is_active ? "bg-status-ok" : "bg-status-fail"
                          }`}
                        />
                        <span>{adm.is_active ? "Faol" : "Bloklangan"}</span>
                      </Badge>
                    </td>

                    {/* Last Login */}
                    <td className="p-3 text-fg-subtle">
                      {adm.last_login_at ? (
                        <DateTime value={adm.last_login_at} mode="relative" />
                      ) : (
                        <span className="text-[12px] text-fg-subtle">Kirmagan</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      {isSelf ? (
                        <span className="text-[12px] text-fg-subtle italic">
                          O'zingizni o'zgartira olmaysiz
                        </span>
                      ) : canManageAdmins ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(adm)}
                          className="gap-1 text-xs"
                        >
                          <Icons.Edit size={11} />
                          <span>Tahrirlash</span>
                        </Button>
                      ) : (
                        <span className="text-[12px] text-fg-subtle">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
