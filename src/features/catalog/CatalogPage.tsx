import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { catalogApi } from "@/api/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icons } from "@/components/icons";
import { useToast } from "@/lib/toast/ToastContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { CategoriesTab } from "./components/CategoriesTab";
import { OffersTab } from "./components/OffersTab";

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "offers">("categories");
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);

  const { error: toastError, info } = useToast();
  const { admin } = useAuth();
  const isViewer = admin?.role === "viewer";

  const syncMutation = useMutation({
    mutationFn: async () => {
      return catalogApi.syncCatalog();
    },
    onSuccess: () => {
      info("Katalogni sinxronlash navbatga qo'yildi (202 Accepted). Yangilanishlar fon rejimida yuklanadi.");
      setIsSyncConfirmOpen(false);
    },
    onError: () => {
      toastError("Katalogni sinxronlashda xatolik yuz berdi.");
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">
            Katalog boshqaruvi
          </h1>
          <p className="text-xs text-fg-subtle mt-0.5">
            Kategoriyalar, mahsulot takliflari (offers) va fiskal parametrlar sozlamalari
          </p>
        </div>

        {/* Sync Button */}
        {!isViewer && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsSyncConfirmOpen(true)}
              className="gap-1.5"
            >
              <Icons.Refresh size="sm" />
              <span>Katalogni sinxronlash</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-hairline select-none">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "categories"
              ? "border-fg text-fg"
              : "border-transparent text-fg-muted hover:text-fg"
          }`}
        >
          <Icons.FolderTree size="sm" />
          <span>Kategoriyalar</span>
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "offers"
              ? "border-fg text-fg"
              : "border-transparent text-fg-muted hover:text-fg"
          }`}
        >
          <Icons.Tag size="sm" />
          <span>Takliflar (Offers)</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "categories" ? <CategoriesTab /> : <OffersTab />}

      {/* Sync Confirm Dialog */}
      <ConfirmDialog
        isOpen={isSyncConfirmOpen}
        onClose={() => setIsSyncConfirmOpen(false)}
        onConfirm={async () => {
          await syncMutation.mutateAsync();
        }}
        title="Katalogni sinxronlash"
        description="FazerCards provayderidan barcha tovarlar va kategoriyalar ro'yxatini yangilashni xohlaysizmi? Bu vazifa fon rejimida (arq worker) navbatga qo'yiladi."
        confirmLabel="Sinxronlashni boshlash"
        variant="primary"
        isLoading={syncMutation.isPending}
      />
    </div>
  );
}
