<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const open = ref(false);

const links = [
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
          label: "Suppliers",
          to: "/admin/suppliers",
          onSelect: () => (open.value = false),
        },
        {
          label: "Inventory",
          to: "/admin/inventory",
          onSelect: () => (open.value = false),
        },
      ],
    },

    {
      label: "Warehouse",
      icon: "i-lucide-package",
      to: "/admin/warehouse",
      onSelect: () => (open.value = false),
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
      label: "Reports",
      icon: "i-lucide-bar-chart",
      to: "/admin/reports",
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
  ],

  [
    {
      label: "Help & Support",
      icon: "i-lucide-life-buoy",
      to: "/admin/help",
      onSelect: () => (open.value = false),
    },
  ],
] satisfies NavigationMenuItem[][];

const groups = computed(() => [
  {
    id: "links",
    label: "Navigation",
    items: links.flat(),
  },
]);

const handleLogout = async () => {
  authStore.logout();
  await router.push("/auth/login");
};
</script>
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="admin"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
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
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />
    <UDashboardPanel id="customers">
      <template #header>
        <UDashboardNavbar title="ZOOM WIDE Construction Supplies">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <div class="flex items-center gap-3">
              <UButton color="neutral" variant="ghost" @click="handleLogout">
                Logout
              </UButton>
              <UAvatar src="https://github.com/benjamincanac.png" />
            </div>
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
