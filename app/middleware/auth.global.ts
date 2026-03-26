const isSectionPath = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  if (isSectionPath(to.path, "/auth")) {
    if (authStore.isAuthenticated) {
      return navigateTo(authStore.getRoleLandingPath());
    }

    return;
  }

  const isCustomerPath =
    isSectionPath(to.path, "/orders") || isSectionPath(to.path, "/checkout");
  const isStaffPath = isSectionPath(to.path, "/staff");
  const isAdminPath = isSectionPath(to.path, "/admin");

  if (!isCustomerPath && !isStaffPath && !isAdminPath) {
    return;
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: "/auth/login",
      query: {
        redirect: to.fullPath,
      },
    });
  }

  if (isCustomerPath && !authStore.hasAnyRole(["customer"])) {
    return navigateTo(authStore.getRoleLandingPath());
  }

  if (isStaffPath && !authStore.hasAnyRole(["staff", "admin", "manager"])) {
    return navigateTo(authStore.getRoleLandingPath());
  }

  if (isAdminPath && !authStore.hasAnyRole(["admin", "manager"])) {
    return navigateTo(authStore.getRoleLandingPath());
  }
});
