import { trpc } from "@/providers/trpc";

/**
 * Provider authentication state + actions.
 * Backed by the httpOnly session cookie set by the API.
 */
export function useProviderAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  return {
    provider: meQuery.data?.provider ?? null,
    isLoading: meQuery.isLoading,
    isAuthenticated: !!meQuery.data?.provider,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error?.message ?? null,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
  };
}
