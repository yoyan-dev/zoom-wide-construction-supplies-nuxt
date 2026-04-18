export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  const userSession = useUserSession();

  if (!userSession.ready.value) {
    await userSession.fetch();
  }

  if (!authStore.session) {
    return;
  }

  const hasAccessToken = Boolean(authStore.token);
  const hasRefreshToken = Boolean(authStore.refreshToken);

  if (!hasAccessToken && hasRefreshToken) {
    await authStore.refreshSession();
  }
});
