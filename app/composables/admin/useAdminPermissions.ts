import type { UserRole } from "~/types/user";

export function useAdminPermissions() {
  const authStore = useAuthStore();

  const hasAnyRole = (roles: UserRole[]) => authStore.hasAnyRole(roles);

  const isAdmin = computed(() => hasAnyRole(["admin"]));
  const isManager = computed(() => hasAnyRole(["manager"]));
  const isFinance = computed(() => hasAnyRole(["finance"]));
  const isAuditor = computed(() => hasAnyRole(["auditor"]));
  const isWarehouseManager = computed(() => hasAnyRole(["warehouse_manager"]));

  const canUseAdminWorkspace = computed(
    () => isAdmin.value || isManager.value,
  );
  const canManageUsers = computed(() => isAdmin.value);
  const canViewFinance = computed(
    () =>
      isAdmin.value ||
      isManager.value ||
      isFinance.value ||
      isAuditor.value,
  );
  const canManageFinance = computed(() => isAdmin.value || isFinance.value);
  const canViewWarehouses = computed(
    () => isAdmin.value || isManager.value || isWarehouseManager.value,
  );
  const canManageWarehouses = computed(
    () => isAdmin.value || isWarehouseManager.value,
  );

  return {
    isAdmin,
    isManager,
    isFinance,
    isAuditor,
    isWarehouseManager,
    canUseAdminWorkspace,
    canManageUsers,
    canViewFinance,
    canManageFinance,
    canViewWarehouses,
    canManageWarehouses,
  };
}
