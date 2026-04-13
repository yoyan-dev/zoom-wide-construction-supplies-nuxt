<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { useAdminPermissions } from "~/composables/admin/useAdminPermissions";

const open = ref(false);
const { canManageUsers } = useAdminPermissions();

const links = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: "Dashboard",
      icon: "i-lucide-layout-dashboard",
      to: "/admin/dashboard",
      onSelect: () => (open.value = false),
    },

    {
      label: "Product Management",
      icon: "i-lucide-package",
      type: "trigger",
      children: [
        {
          label: "Categories",
          to: "/admin/categories",
          onSelect: () => (open.value = false),
        },
        {
          label: "Products",
          to: "/admin/products",
          onSelect: () => (open.value = false),
        },
        {
          label: "Inventory",
          to: "/admin/inventory",
          onSelect: () => (open.value = false),
        },
        {
          label: "Warehouses",
          to: "/admin/warehouses",
          onSelect: () => (open.value = false),
        },
      ],
    },

    {
      label: "Orders",
      icon: "i-lucide-shopping-cart",
      to: "/admin/orders",
      onSelect: () => (open.value = false),
    },
    {
      label: "Customers",
      icon: "i-lucide-users",
      to: "/admin/customers",
      onSelect: () => (open.value = false),
    },

    {
      label: "Deliveries",
      icon: "i-lucide-truck",
      to: "/admin/deliveries",
      onSelect: () => (open.value = false),
    },
    {
      label: "Payments",
      icon: "i-lucide-credit-card",
      to: "/admin/payments",
      onSelect: () => (open.value = false),
    },
    {
      label: "Reports",
      icon: "i-lucide-chart-column",
      to: "/admin/reports",
      onSelect: () => (open.value = false),
    },

    {
      label: "Drivers",
      icon: "i-lucide-car",
      to: "/admin/drivers",
      onSelect: () => (open.value = false),
    },
    {
      label: "Users",
      icon: "i-lucide-users",
      to: "/admin/users",
      onSelect: () => (open.value = false),
    },

    {
      label: "System Settings",
      icon: "i-lucide-settings",
      type: "trigger",
      children: [
        {
          label: "General Settings",
          to: "/admin/settings",
          onSelect: () => (open.value = false),
        },
        {
          label: "Notifications",
          to: "/admin/settings/notifications",
          onSelect: () => (open.value = false),
        },
        {
          label: "Security",
          to: "/admin/settings/security",
          onSelect: () => (open.value = false),
        },
      ],
    },
  ].filter((item) => {
    if (
      "to" in item &&
      (item.to === "/admin/users" || item.to === "/admin/drivers")
    ) {
      return canManageUsers.value;
    }

    return true;
  }),

  [],
]);

const groups = computed(() => [
  {
    id: "links",
    label: "Navigation",
    items: links.value.flat(),
  },
]);
</script>
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="admin"
      v-model:open="open"
      collapsible
      resizable
      class="bg-white dark:bg-gray-900"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2" v-if="!collapsed">
          <NuxtImg src="/logo.png" width="50" height="40" />
          <h1 class="text-xl font-semibold text-primary">ZOOM WIDE</h1>
        </div>

        <NuxtImg src="/logo.png" width="40" height="40" v-else />

        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          v-if="links[1].length"
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <AppUserDropdown
          :collapsed="collapsed"
          button-class="w-full"
          :show-chevron="!collapsed"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />
    <UDashboardPanel id="customers">
      <template #header>
        <UDashboardNavbar
          title="ZOOM WIDE Construction Supplies"
          class="bg-white dark:bg-gray-900"
        >
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <AppUserDropdown />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
        <!-- <div
          class="w-full max-h-screen overflow-y-scroll bg-gray-50 dark:bg-gray-900"
        >
        </div> -->
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
