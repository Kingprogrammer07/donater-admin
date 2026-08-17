import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { LoginPage } from "@/features/auth/LoginPage";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PlaceholderPage } from "@/features/placeholders/PlaceholderPage";
import { StyleguidePage } from "@/features/styleguide/StyleguidePage";
import { NotFoundPage } from "@/features/error/NotFoundPage";
import { Icons } from "@/components/icons";

function ProtectedRoot() {
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

  return <AdminLayout />;
}

const router = createBrowserRouter(
  [
    {
      element: <ProtectedRoot />,
      children: [
        { path: "/", element: <PlaceholderPage /> },
        { path: "/payments", element: <PlaceholderPage /> },
        { path: "/orders", element: <PlaceholderPage /> },
        { path: "/orders/:id", element: <PlaceholderPage /> },
        { path: "/users", element: <PlaceholderPage /> },
        { path: "/users/:id", element: <PlaceholderPage /> },
        { path: "/catalog", element: <PlaceholderPage /> },
        { path: "/pricing", element: <PlaceholderPage /> },
        { path: "/broadcasts", element: <PlaceholderPage /> },
        { path: "/system", element: <PlaceholderPage /> },
        { path: "/settings", element: <PlaceholderPage /> },
        { path: "/admins", element: <PlaceholderPage /> },
        ...(import.meta.env.DEV
          ? [{ path: "/styleguide", element: <StyleguidePage /> }]
          : []),
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  {
    basename: "/admin",
  }
);

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}
