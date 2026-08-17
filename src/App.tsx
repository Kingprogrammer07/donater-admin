import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { RouterProvider, useRouter } from "@/lib/router/RouterContext";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PlaceholderPage } from "@/features/placeholders/PlaceholderPage";
import { StyleguidePage } from "@/features/styleguide/StyleguidePage";
import { NotFoundPage } from "@/features/error/NotFoundPage";
import { findNavItemByPath } from "@/components/layout/navItems";
import { Icons } from "@/components/icons";

function AuthenticatedApp() {
  const { pathname } = useRouter();

  if (pathname === "/styleguide") {
    return (
      <AdminLayout>
        <StyleguidePage />
      </AdminLayout>
    );
  }

  const navItem = findNavItemByPath(pathname);
  if (navItem) {
    return (
      <AdminLayout>
        <PlaceholderPage />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <NotFoundPage />
    </AdminLayout>
  );
}

function MainRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-canvas text-fg">
        <div className="flex flex-col items-center gap-3">
          <Icons.Spinner size="lg" className="animate-spin text-fg-muted" />
          <span className="text-xs font-medium text-fg-muted">Sessiya tekshirilmoqda...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <ToastProvider>
          <MainRouter />
        </ToastProvider>
      </RouterProvider>
    </AuthProvider>
  );
}
