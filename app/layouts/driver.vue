<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();

if (authStore.isAuthenticated && !accountStore.account) {
  await accountStore.fetchAccount();
}

const links = [
  {
    label: "Assigned Jobs",
    shortLabel: "Assigned",
    icon: "i-lucide-truck",
    to: "/driver",
  },
  {
    label: "Completed Jobs",
    shortLabel: "Completed",
    icon: "i-lucide-circle-check-big",
    to: "/driver/completed",
  },
] satisfies Array<
  NavigationMenuItem & {
    shortLabel: string;
    to: string;
  }
>;

const driverName = computed(
  () =>
    accountStore.account?.driver?.name ??
    authStore.displayName ??
    "Driver account",
);

const vehicleNumber = computed(
  () => accountStore.account?.driver?.vehicle_number ?? null,
);

const isActiveLink = (to: string) => {
  if (to === "/driver") {
    return route.path === "/driver";
  }

  return route.path === to || route.path.startsWith(`${to}/`);
};

const currentSectionLabel = computed(
  () => links.find((link) => isActiveLink(link.to))?.label ?? "Driver Deliveries",
);

const handleLogout = async () => {
  await authStore.logout();
  await router.push("/auth/login");
};
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex min-h-screen max-w-[1600px]">
      <aside
        class="hidden w-72 shrink-0 border-r border-slate-200/80 bg-white/95 md:flex md:flex-col"
      >
        <div class="border-b border-slate-200/80 px-6 py-6">
          <div class="flex items-center gap-3">
            <NuxtImg src="/logo.png" width="44" height="40" />
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
                Zoom Wide
              </p>
              <h1 class="mt-1 text-lg font-semibold text-slate-900">
                Driver Portal
              </h1>
            </div>
          </div>
        </div>

        <nav class="flex-1 space-y-2 px-4 py-6">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition"
            :class="
              isActiveLink(link.to)
                ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            "
          >
            <UIcon :name="link.icon" class="h-5 w-5" />
            <span>{{ link.label }}</span>
          </NuxtLink>
        </nav>

        <div class="border-t border-slate-200/80 p-4">
          <div class="rounded-3xl bg-slate-900 px-4 py-4 text-white">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-300">
              Signed in as
            </p>
            <p class="mt-2 text-base font-semibold">
              {{ driverName }}
            </p>
            <p v-if="vehicleNumber" class="mt-1 text-sm text-slate-300">
              Vehicle {{ vehicleNumber }}
            </p>

            <UButton
              color="neutral"
              variant="soft"
              class="mt-4 w-full justify-center"
              @click="handleLogout"
            >
              Logout
            </UButton>
          </div>
        </div>
      </aside>

      <div class="min-w-0 flex-1 pb-24 md:pb-0">
        <header
          class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur"
        >
          <div
            class="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
          >
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-amber-600">
                Driver Operations
              </p>
              <h2 class="mt-1 truncate text-xl font-semibold text-slate-900">
                {{ currentSectionLabel }}
              </h2>
            </div>

            <div class="flex items-center gap-3">
              <div class="hidden text-right sm:block">
                <p class="text-sm font-medium text-slate-900">
                  {{ driverName }}
                </p>
                <p v-if="vehicleNumber" class="text-xs text-slate-500">
                  Vehicle {{ vehicleNumber }}
                </p>
              </div>

              <UButton color="neutral" variant="ghost" @click="handleLogout">
                Logout
              </UButton>
            </div>
          </div>
        </header>

        <main class="px-4 py-6 sm:px-6 lg:px-8">
          <slot />
        </main>
      </div>
    </div>

    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur md:hidden"
    >
      <div class="grid grid-cols-2 gap-2 px-3 py-2">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition"
          :class="
            isActiveLink(link.to)
              ? 'bg-amber-50 text-amber-700'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          "
        >
          <UIcon :name="link.icon" class="h-5 w-5" />
          <span class="truncate">{{ link.shortLabel }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
