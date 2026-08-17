import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Icons } from "@/components/icons";

// Route-level Code Splitting (React.lazy)
const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const PlaceholderPage = lazy(() =>
  import("@/features/placeholders/PlaceholderPage").then((m) => ({ default: m.PlaceholderPage }))
);
const StyleguidePage = lazy(() =>
  import("@/features/styleguide/StyleguidePage").then((m) => ({ default: m.StyleguidePage }))
);
const NotFoundPage = lazy(() =>
  import("@/features/error/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function PageLoadingFallback() {
  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-fg-muted">
        <Icons.Spinner size="md" className="animate-spin text-fg-muted" />
        <span className="text-xs font-medium">Sahifa yuklanmoqda...</span>
      </div>
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>;
}

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
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LoginPage />
      </Suspense>
    );
  }

  return <AdminLayout />;
}

const router = createBrowserRouter(
  [
    {
      element: <ProtectedRoot />,
      children: [
        {
          path: "/",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/payments",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/orders",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/orders/:id",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/users",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/users/:id",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/catalog",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/pricing",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/broadcasts",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/system",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/settings",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/admins",
          element: (
            <SuspenseWrapper>
              <PlaceholderPage />
            </SuspenseWrapper>
          ),
        },
        ...(import.meta.env.DEV
          ? [
              {
                path: "/styleguide",
                element: (
                  <SuspenseWrapper>
                    <StyleguidePage />
                  </SuspenseWrapper>
                ),
              },
            ]
          : []),
        {
          path: "*",
          element: (
            <SuspenseWrapper>
              <NotFoundPage />
            </SuspenseWrapper>
          ),
        },
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
