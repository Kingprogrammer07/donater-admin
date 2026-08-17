import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

interface RouterContextValue {
  path: string;
  pathname: string;
  search: string;
  params: URLSearchParams;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  isActive: (targetPath: string) => boolean;
}

const RouterContext = createContext<RouterContextValue | null>(null);

const BASE_PATH = "/admin";

function normalizePath(rawPath: string): string {
  let p = rawPath;
  if (p.startsWith(BASE_PATH)) {
    p = p.slice(BASE_PATH.length);
  }
  if (!p.startsWith("/")) {
    p = "/" + p;
  }
  // Strip trailing slash except for root
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window === "undefined") return { pathname: "/", search: "" };
    return {
      pathname: normalizePath(window.location.pathname),
      search: window.location.search,
    };
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentUrl({
        pathname: normalizePath(window.location.pathname),
        search: window.location.search,
      });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const [targetPath, targetSearch = ""] = to.split("?");
    const cleanPath = normalizePath(targetPath || "/");
    const fullSearch = targetSearch ? `?${targetSearch}` : "";
    const fullUrl = `${BASE_PATH}${cleanPath}${fullSearch}`;

    if (options?.replace) {
      window.history.replaceState(null, "", fullUrl);
    } else {
      window.history.pushState(null, "", fullUrl);
    }

    setCurrentUrl({
      pathname: cleanPath,
      search: fullSearch,
    });
  }, []);

  const isActive = useCallback(
    (targetPath: string): boolean => {
      const cleanTarget = normalizePath(targetPath);
      if (cleanTarget === "/") {
        return currentUrl.pathname === "/";
      }
      return currentUrl.pathname === cleanTarget || currentUrl.pathname.startsWith(cleanTarget + "/");
    },
    [currentUrl.pathname]
  );

  const params = useMemo(() => new URLSearchParams(currentUrl.search), [currentUrl.search]);

  const value = useMemo<RouterContextValue>(
    () => ({
      path: `${currentUrl.pathname}${currentUrl.search}`,
      pathname: currentUrl.pathname,
      search: currentUrl.search,
      params,
      navigate,
      isActive,
    }),
    [currentUrl, params, navigate, isActive]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
