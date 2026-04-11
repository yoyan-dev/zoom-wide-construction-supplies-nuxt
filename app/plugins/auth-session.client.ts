import { useAuthSessionCookie } from "~/utils/api";

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const sessionCookie = useAuthSessionCookie();

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
