import type { AuthSession } from "~/types/auth";
import { AUTH_SESSION_COOKIE_KEY } from "~/utils/api";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const sessionCookie = useCookie<AuthSession | null>(AUTH_SESSION_COOKIE_KEY, {
    default: () => null,
    sameSite: "lax",
    watch: true,
  });

  if (sessionCookie.value && !authStore.session) {
    authStore.clearSession();
    return;
  }

  if (!authStore.session) {
    return;
  }

  const hasAccessToken = Boolean(authStore.token);
  const hasRefreshToken = Boolean(authStore.refreshToken);

  if (!hasAccessToken && !hasRefreshToken) {
    authStore.clearSession();
    return;
  }

  if (!hasAccessToken && hasRefreshToken) {
    await authStore.refreshSession();
  }
});
