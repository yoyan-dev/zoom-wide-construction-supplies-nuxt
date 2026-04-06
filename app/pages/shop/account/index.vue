<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency, formatLongDate, formatNumber } from "~/utils/format";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "My Account | ZOOM WIDE Construction Supplies",
  description:
    "Manage your customer profile, review order activity, and access key shop account actions from one place.",
});

const authStore = useAuthStore();
const accountStore = useAccountStore();
const orderStore = useOrderStore();
const addressStore = useCustomerAddressesStore();
const cartStore = useCartStore();

const { customer, user } = storeToRefs(authStore);
const { account, isLoading } = storeToRefs(accountStore);
const { orders, totalOrders } = storeToRefs(orderStore);
const { addresses, isLoading: isAddressesLoading } = storeToRefs(addressStore);
const { itemCount, subtotal } = storeToRefs(cartStore);

const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const profileName = computed(
  () =>
    account.value?.customer?.company_name ??
    customer.value?.company_name ??
    account.value?.user.full_name ??
    customer.value?.contact_name ??
    user.value?.full_name ??
    authStore.displayName,
);

const profileContact = computed(
  () =>
    account.value?.customer?.contact_name ??
    customer.value?.contact_name ??
    account.value?.user.full_name ??
    user.value?.full_name ??
    "Customer account",
);

const profileEmail = computed(
  () => account.value?.user.email ?? customer.value?.email ?? user.value?.email ?? "",
);

const profilePhone = computed(
  () =>
    account.value?.customer?.phone ??
    account.value?.user.phone ??
    customer.value?.phone ??
    user.value?.phone ??
    "No phone number on file",
);

const profileImage = computed(
  () => account.value?.user.image_url ?? user.value?.image_url ?? undefined,
);

const memberSince = computed(() => {
  const createdAt =
    customer.value?.created_at ??
    account.value?.customer?.created_at ??
    account.value?.user.created_at ??
    user.value?.created_at;

  return createdAt ? formatLongDate(createdAt) : "Recently joined";
});

const orderStats = computed(() => {
  const allOrders = orders.value;

  return {
    pending: allOrders.filter((order) => order.status === "pending").length,
    approved: allOrders.filter((order) => order.status === "approved").length,
    completed: allOrders.filter((order) => order.status === "completed").length,
    cancelled: allOrders.filter((order) => order.status === "cancelled").length,
  };
});

const purchaseActions = computed(() => [
  {
    label: "Pending",
    icon: "i-lucide-wallet",
    value: formatNumber(orderStats.value.pending),
    to: "/orders?status=pending",
  },
  {
    label: "Approved",
    icon: "i-lucide-package-check",
    value: formatNumber(orderStats.value.approved),
    to: "/orders?status=approved",
  },
  {
    label: "Completed",
    icon: "i-lucide-truck",
    value: formatNumber(orderStats.value.completed),
    to: "/orders?status=completed",
  },
  {
    label: "Cancelled",
    icon: "i-lucide-badge-x",
    value: formatNumber(orderStats.value.cancelled),
    to: "/orders?status=cancelled",
  },
]);

const accountRows = computed(() => [
  {
    label: "Construction cart",
    icon: "i-lucide-shopping-cart",
    value: `${formatNumber(itemCount.value)} items`,
    to: "/cart",
  },
  {
    label: "Saved addresses",
    icon: "i-lucide-map-pinned",
    value: `${formatNumber(addresses.value.length)} on file`,
    to: "/checkout",
  },
  {
    label: "Order history",
    icon: "i-lucide-receipt-text",
    value: `${formatNumber(totalOrders.value || orders.value.length)} orders`,
    to: "/orders",
  },
]);

const settingsRows = [
  {
    label: "Profile settings",
    icon: "i-lucide-user-round-cog",
    to: "/shop/account/settings",
  },
  {
    label: "Account & security",
    icon: "i-lucide-shield-check",
    to: "/shop/account/security",
  },
  {
    label: "Shop standards",
    icon: "i-lucide-hard-hat",
    to: "/shop/standards",
  },
] as const;

const isBusy = computed(() => isLoading.value || isAddressesLoading.value);

const loadPage = async () => {
  pageError.value = null;

  const accountResponse = await accountStore.fetchAccount();

  if (accountResponse.status === "error") {
    pageError.value =
      accountResponse.message || "Your account hub could not be loaded.";
    return;
  }

  const resolvedCustomerId =
    accountStore.account?.customer?.id ?? authStore.customer?.id ?? null;

  if (!resolvedCustomerId) {
    pageError.value =
      "This signed-in user does not have a linked customer record yet.";
    return;
  }

  const [ordersResponse, addressesResponse] = await Promise.all([
    orderStore.fetchOrders({ customer_id: resolvedCustomerId, page: 1 }),
    addressStore.fetchAddresses(resolvedCustomerId, { page: 1, limit: 20 }),
  ]);

  if (ordersResponse.status === "error" || addressesResponse.status === "error") {
    pageError.value =
      ordersResponse.message ||
      addressesResponse.message ||
      "Some account details are temporarily unavailable.";
  }
};

await loadPage();

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  await navigateTo("/auth/login");
};
</script>

<template>
  <div class="pb-28 md:pb-16">
    <StorefrontPageContainer size="wide" class="py-8 md:py-10">
      <StorefrontStateCard
        v-if="pageError"
        eyebrow="Account Hub"
        title="Your account hub is temporarily unavailable"
        :description="pageError"
        tone="error"
      >
        <template #actions>
          <div class="flex flex-wrap gap-3">
            <StorefrontButton
              tone="danger"
              :loading="isRetrying"
              @click="handleRetry"
            >
              Retry
            </StorefrontButton>
            <StorefrontButton tone="secondary" to="/shop">
              Back to shop
            </StorefrontButton>
          </div>
        </template>
      </StorefrontStateCard>

      <template v-else>
        <section
          class="sf-card overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_70px_rgba(3,20,37,0.08)] md:p-8"
        >
          <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
              <div class="relative">
                <div
                  class="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(254,117,11,0.15),rgba(0,70,135,0.3),rgba(254,117,11,0.15))] blur-sm"
                />
                <UAvatar
                  :src="profileImage"
                  :alt="profileName"
                  size="3xl"
                  class="relative ring-4 ring-accent-300/40"
                />
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-accent-700">
                  Account Hub
                </p>
                <h1 class="sf-display mt-2 text-3xl font-bold tracking-[-0.05em] text-brand-950 md:text-4xl">
                  {{ profileName }}
                </h1>
                <p class="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500 md:justify-start">
                  <UIcon name="i-lucide-badge-check" class="text-accent-500" />
                  {{ profileContact }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ profileEmail }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{ profilePhone }}
                </p>
                <p class="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Member since {{ memberSince }}
                </p>
                <div class="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  <StorefrontButton tone="subtle" to="/shop/account/settings">
                    Edit profile
                  </StorefrontButton>
                  <StorefrontButton tone="ghost" @click="handleLogout">
                    Logout
                  </StorefrontButton>
                </div>
              </div>
            </div>

            <div
              class="grid w-full gap-4 border-t border-slate-200/80 pt-6 sm:grid-cols-3 lg:w-auto lg:min-w-[340px] lg:border-l lg:border-t-0 lg:pt-0 lg:pl-8"
            >
              <div class="text-center">
                <p class="text-2xl font-bold tracking-tight text-accent-600">
                  {{ formatNumber(totalOrders || orders.length) }}
                </p>
                <p class="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Orders
                </p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold tracking-tight text-accent-600">
                  {{ formatNumber(addresses.length) }}
                </p>
                <p class="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Addresses
                </p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold tracking-tight text-accent-600">
                  {{ formatCurrency(subtotal) }}
                </p>
                <p class="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Cart Total
                </p>
              </div>
            </div>
          </div>
        </section>

        <div class="mt-6 space-y-6">
          <section>
            <div class="mb-3 flex items-center justify-between gap-4">
              <h2 class="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                My Purchases
              </h2>
              <NuxtLink
                to="/orders"
                class="text-xs font-semibold text-accent-600 transition hover:text-accent-700"
              >
                View Purchase History >
              </NuxtLink>
            </div>

            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <NuxtLink
                v-for="action in purchaseActions"
                :key="action.label"
                :to="action.to"
                class="sf-card group rounded-[1.25rem] border border-slate-200/80 bg-white/95 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent-200 hover:shadow-[0_20px_50px_rgba(3,20,37,0.08)]"
              >
                <div class="flex flex-col items-center gap-3 text-center">
                  <span
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600"
                  >
                    <UIcon :name="action.icon" class="text-2xl" />
                  </span>
                  <div>
                    <p class="text-lg font-bold text-brand-950">
                      {{ action.value }}
                    </p>
                    <p class="mt-1 text-sm font-medium text-slate-600">
                      {{ action.label }}
                    </p>
                  </div>
                </div>
              </NuxtLink>
            </div>
          </section>

          <div class="grid gap-6 xl:grid-cols-2">
            <section class="sf-card overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/95">
              <div class="flex items-center gap-2 border-b border-slate-100 px-5 py-4 font-semibold text-brand-950">
                <UIcon name="i-lucide-wallet-cards" class="text-accent-600" />
                Storefront Snapshot
              </div>

              <div v-if="isBusy" class="space-y-3 p-5">
                <USkeleton class="h-16 w-full rounded-xl" />
                <USkeleton class="h-16 w-full rounded-xl" />
                <USkeleton class="h-16 w-full rounded-xl" />
              </div>

              <div v-else class="divide-y divide-slate-50">
                <NuxtLink
                  v-for="row in accountRows"
                  :key="row.label"
                  :to="row.to"
                  class="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/80"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-brand-950/65">
                      <UIcon :name="row.icon" class="text-lg" />
                    </span>
                    <span class="text-sm font-medium text-slate-800">
                      {{ row.label }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-sm font-semibold text-accent-600">
                    {{ row.value }}
                    <UIcon name="i-lucide-chevron-right" class="text-slate-400" />
                  </div>
                </NuxtLink>
              </div>
            </section>

            <section class="sf-card overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/95">
              <div class="flex items-center gap-2 border-b border-slate-100 px-5 py-4 font-semibold text-brand-950">
                <UIcon name="i-lucide-settings-2" class="text-accent-600" />
                Account Settings
              </div>

              <div class="divide-y divide-slate-50">
                <NuxtLink
                  v-for="row in settingsRows"
                  :key="row.label"
                  :to="row.to"
                  class="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50/80"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-brand-950/65">
                      <UIcon :name="row.icon" class="text-lg" />
                    </span>
                    <span class="text-sm font-medium text-slate-800">
                      {{ row.label }}
                    </span>
                  </div>
                  <UIcon name="i-lucide-chevron-right" class="text-slate-400" />
                </NuxtLink>
              </div>
            </section>
          </div>

          <section
            class="overflow-hidden rounded-[1.5rem] bg-brand-950 text-white shadow-[0_24px_70px_rgba(3,20,37,0.18)]"
          >
            <div
              class="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-accent-400"
                >
                  <UIcon name="i-lucide-hard-hat" class="text-2xl" />
                </div>
                <div>
                  <p class="font-bold">Need help with a bulk industrial order?</p>
                  <p class="mt-1 text-sm text-white/70">
                    Review storefront standards, then continue to your order history or checkout with the same customer account.
                  </p>
                </div>
              </div>

              <StorefrontButton tone="secondary" to="/shop/standards">
                Contact Us
              </StorefrontButton>
            </div>
          </section>
        </div>
      </template>
    </StorefrontPageContainer>

    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-2 py-2 shadow-[0_-12px_40px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
    >
      <div class="mx-auto grid max-w-md grid-cols-4 gap-1">
        <NuxtLink
          to="/shop"
          class="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-50 hover:text-brand-600"
        >
          <UIcon name="i-lucide-house" class="text-lg" />
          <span>Home</span>
        </NuxtLink>
        <NuxtLink
          to="/shop/catalog"
          class="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-50 hover:text-brand-600"
        >
          <UIcon name="i-lucide-shopping-bag" class="text-lg" />
          <span>Shop</span>
        </NuxtLink>
        <NuxtLink
          to="/orders"
          class="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-50 hover:text-brand-600"
        >
          <UIcon name="i-lucide-list-ordered" class="text-lg" />
          <span>Orders</span>
        </NuxtLink>
        <NuxtLink
          to="/shop/account"
          class="flex flex-col items-center gap-1 rounded-xl bg-accent-50 px-2 py-2 text-xs font-semibold text-accent-600"
        >
          <UIcon name="i-lucide-user-round" class="text-lg" />
          <span>Me</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
