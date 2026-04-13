const isSectionPath = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

const resolveRedirectQuery = (value: unknown) =>
  typeof value === "string" ? value : null;

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  const redirectToRoleHome = () =>
    navigateTo(authStore.getRoleLandingPath(), { replace: true });

  const isAuthPath = isSectionPath(to.path, "/auth");
  const isCustomerPath =
    isSectionPath(to.path, "/orders") ||
    isSectionPath(to.path, "/checkout") ||
    isSectionPath(to.path, "/shop");
  const isStaffPath = isSectionPath(to.path, "/staff");
  const isDriverPath = isSectionPath(to.path, "/driver");
  const isAdminPath = isSectionPath(to.path, "/admin");
  const isWarehousePath = isSectionPath(to.path, "/warehouse");
  const isFinancePath = isSectionPath(to.path, "/finance");

  const needsAuthResolution =
    isAuthPath ||
    isCustomerPath ||
    isStaffPath ||
    isDriverPath ||
    isAdminPath ||
    isWarehousePath ||
    isFinancePath;

  if (needsAuthResolution && authStore.session && !authStore.token) {
    if (authStore.refreshToken) {
      await authStore.refreshSession();
    } else {
      authStore.clearSession();
    }
  }

  if (isAuthPath) {
    if (authStore.isAuthenticated) {
      return navigateTo(
        authStore.resolveRedirectPath(resolveRedirectQuery(to.query.redirect)),
        { replace: true },
      );
    }

    return;
  }

  if (!needsAuthResolution) {
    return;
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: "/auth/login",
      query: {
        redirect: to.fullPath,
      },
      replace: true,
    });
  }

  if (isCustomerPath && !authStore.hasAnyRole(["customer"])) {
    return redirectToRoleHome();
  }

  if (isStaffPath && !authStore.hasAnyRole(["staff", "admin", "manager"])) {
    return redirectToRoleHome();
  }

  if (isDriverPath && !authStore.hasAnyRole(["driver"])) {
    return redirectToRoleHome();
  }

  if (isAdminPath && !authStore.hasAnyRole(["admin", "manager"])) {
    return redirectToRoleHome();
  }

  if (
    isSectionPath(to.path, "/admin/users") &&
    !authStore.hasAnyRole(["admin"])
  ) {
    return redirectToRoleHome();
  }

  if (
    isSectionPath(to.path, "/admin/drivers") &&
    !authStore.hasAnyRole(["admin"])
  ) {
    return redirectToRoleHome();
  }

  if (
    isWarehousePath &&
    !authStore.hasAnyRole(["warehouse_manager", "admin", "manager"])
  ) {
    return redirectToRoleHome();
  }

  if (
    isFinancePath &&
    !authStore.hasAnyRole(["finance", "auditor", "admin", "manager"])
  ) {
    return redirectToRoleHome();
  }
});
