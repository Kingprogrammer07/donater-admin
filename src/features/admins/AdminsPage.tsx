import { useState } from "react";
import { AdminsTable } from "./components/AdminsTable";
import { AuditTable } from "./components/AuditTable";
import { CreateAdminModal } from "./components/CreateAdminModal";
import { EditAdminModal } from "./components/EditAdminModal";
import { Icons } from "@/components/icons";
import type { AdminOut } from "@/api/types";

export default function AdminsPage() {
  const [activeTab, setActiveTab] = useState<"admins" | "audit">("admins");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminOut | null>(null);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">
            Adminlar va Audit Jurnali (Admins & Audit)
          </h1>
          <p className="text-xs text-fg-subtle mt-0.5">
            Tizim administratorlarini boshqarish, rollar va operatsiyalar tarixi jurnali
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xs border border-hairline self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "admins"
                ? "bg-surface text-fg font-bold shadow-0"
                : "text-fg-subtle hover:text-fg"
            }`}
          >
            <Icons.ShieldCheck size={14} />
            <span>Adminlar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "audit"
                ? "bg-surface text-fg font-bold shadow-0"
                : "text-fg-subtle hover:text-fg"
            }`}
          >
            <Icons.Clock size={14} />
            <span>Audit Jurnali</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "admins" ? (
        <AdminsTable
          onEdit={(admin) => setEditingAdmin(admin)}
          onCreate={() => setCreateModalOpen(true)}
        />
      ) : (
        <AuditTable />
      )}

      {/* Modals */}
      <CreateAdminModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditAdminModal
        admin={editingAdmin}
        open={Boolean(editingAdmin)}
        onClose={() => setEditingAdmin(null)}
      />
    </div>
  );
}
