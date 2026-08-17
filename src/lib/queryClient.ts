import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number }).status;
          if (
            status === 401 ||
            status === 403 ||
            status === 404 ||
            status === 409 ||
            status === 422
          ) {
            return false;
          }
        }
        return failureCount < 2;
      },
      staleTime: 1000 * 10,
      refetchOnWindowFocus: false,
    },
  },
});
