import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { AuthenticatedShell } from "@/features/auth/AuthenticatedShell";
import { Icons } from "@/components/icons";

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

  return <AuthenticatedShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
