import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { ToastProvider } from "@/lib/toast/ToastContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Icons } from "@/components/icons";

// Route-level Code Splitting (React.lazy)
const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const PaymentsPage = lazy(() => import("@/features/payments/PaymentsPage"));
const OrdersPage = lazy(() => import("@/features/orders/OrdersPage"));
const UsersPage = lazy(() => import("@/features/users/UsersPage"));
const CatalogPage = lazy(() => import("@/features/catalog/CatalogPage"));
const PricingPage = lazy(() => import("@/features/pricing/PricingPage"));
const BroadcastsPage = lazy(() => import("@/features/broadcasts/BroadcastsPage"));
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

//  Outside the session gate, and only in development. The page renders mock
//  data and no real record, so hiding it behind a login only means the
//  primitives cannot be inspected or reviewed without one. It is stripped from
//  the production bundle entirely.
const devOnlyRoutes = import.meta.env.DEV
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
  : [];

const router = createBrowserRouter(
  [
    ...devOnlyRoutes,
    {
      element: <ProtectedRoot />,
      children: [
        {
          path: "/",
          element: (
            <SuspenseWrapper>
              <DashboardPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/payments",
          element: (
            <SuspenseWrapper>
              <PaymentsPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/orders",
          element: (
            <SuspenseWrapper>
              <OrdersPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/orders/:id",
          element: (
            <SuspenseWrapper>
              <OrdersPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/users",
          element: (
            <SuspenseWrapper>
              <UsersPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/users/:id",
          element: (
            <SuspenseWrapper>
              <UsersPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/catalog",
          element: (
            <SuspenseWrapper>
              <CatalogPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/pricing",
          element: (
            <SuspenseWrapper>
              <PricingPage />
            </SuspenseWrapper>
          ),
        },
        {
          path: "/broadcasts",
          element: (
            <SuspenseWrapper>
              <BroadcastsPage />
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
