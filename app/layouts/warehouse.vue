<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const open = ref(false);

const links = [
  [
    {
      label: "Dashboard",
      icon: "i-lucide-layout-dashboard",
      to: "/warehouse",
      onSelect: () => (open.value = false),
    },
    {
      label: "Inventory",
      icon: "i-lucide-package",
      to: "/warehouse/inventory",
      onSelect: () => (open.value = false),
    },
    {
      label: "Stock Adjustment",
      icon: "i-lucide-plus-square",
      to: "/warehouse/stock-adjustment",
      onSelect: () => (open.value = false),
    },
    {
      label: "Inventory Transfer",
      icon: "i-lucide-repeat",
      to: "/warehouse/transfer",
      onSelect: () => (open.value = false),
    },
    {
      label: "Warehouse Users",
      icon: "i-lucide-users",
      to: "/warehouse/users",
      onSelect: () => (open.value = false),
    },
    {
      label: "Reports",
      icon: "i-lucide-bar-chart",
      to: "/warehouse/reports",
      onSelect: () => (open.value = false),
    },
  ],
  [
    {
      label: "Help & Support",
      icon: "i-lucide-life-buoy",
      to: "/warehouse/help",
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

</script>
<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="staff"
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
    <UDashboardPanel id="staff">
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
