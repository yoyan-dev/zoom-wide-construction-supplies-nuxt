<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { items, itemCount, subtotal } = storeToRefs(cartStore);
const { customer, isAuthenticated, user } = storeToRefs(authStore);

const search = ref(typeof route.query.q === "string" ? route.query.q : "");
const primaryLinks = [
  { label: "Home", to: "/shop" },
  { label: "Catalog", to: "/shop/catalog" },
  { label: "Categories", to: "/shop#categories" },
  { label: "Standards", to: "/shop#trust" },
] as const;

watch(
  () => route.query.q,
  (value) => {
    search.value = typeof value === "string" ? value : "";
  },
  { immediate: true },
);

const submitSearch = async () => {
  const query = search.value.trim();
  const nextQuery: Record<string, string> = {};

  if (query) {
    nextQuery.q = query;
  }

  if (
    typeof route.query.category_id === "string" &&
    route.query.category_id
  ) {
    nextQuery.category_id = route.query.category_id;
  }

  await router.push({
    path: "/shop/catalog",
    query: nextQuery,
  });
};

const accountLabel = computed(() =>
  authStore.role === "customer" ? "My Orders" : "Dashboard",
);

const accountTarget = computed(() => authStore.getRoleLandingPath());

const accountName = computed(
  () =>
    customer.value?.contact_name ??
    user.value?.full_name ??
    user.value?.email ??
    "Signed in",
);
const cartPreviewItems = computed(() => items.value.slice(0, 3));
const isProductDetailPage = computed(
  () =>
    /^\/shop\/[^/]+$/.test(route.path) &&
    !["/shop/catalog", "/shop/categories", "/shop/solutions", "/shop/help"].includes(route.path),
);

const handleLogout = async () => {
  await authStore.logout();
  await router.push("/auth/login");
};

const isActiveLink = (target: string) => {
  if (target.includes("#")) {
    return route.fullPath === target;
  }

  return route.path === target || route.path.startsWith(`${target}/`);
};
</script>

<template>
  <div class="shop-shell min-h-screen text-slate-900">
    <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/88 backdrop-blur-md">
      <div class="mx-auto flex max-w-[88rem] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <NuxtLink to="/shop" class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#031b34] text-amber-300 shadow-sm">
              <UIcon name="i-lucide-hard-hat" class="text-xl" />
            </div>
            <div>
              <p class="sf-display text-xl font-black uppercase tracking-[-0.05em] text-[#031b34]">
                Zoom Wide
              </p>
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Construction Supplies
              </p>
            </div>
          </NuxtLink>

          <nav class="ml-4 hidden items-center gap-6 lg:flex">
            <NuxtLink
              v-for="link in primaryLinks"
              :key="link.to"
              :to="link.to"
              :class="[
                'sf-display border-b-2 pb-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition',
                isActiveLink(link.to)
                  ? 'border-amber-500 text-[#031b34]'
                  : 'border-transparent text-slate-500 hover:border-amber-400/60 hover:text-[#004687]',
              ]"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <div class="ml-auto flex items-center gap-2">
            <template v-if="isAuthenticated">
              <div class="hidden text-right xl:block">
                <p class="text-sm font-semibold text-slate-900">
                  {{ accountName }}
                </p>
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {{ user?.role ?? "account" }}
                </p>
              </div>
              <UButton color="warning" variant="soft" :to="accountTarget">
                {{ accountLabel }}
              </UButton>
              <UButton color="neutral" variant="ghost" @click="handleLogout">
                Logout
              </UButton>
            </template>

            <template v-else>
              <UButton color="neutral" variant="ghost" to="/auth/login">
                Sign in
              </UButton>
              <UButton color="warning" variant="soft" to="/auth/register">
                Create account
              </UButton>
            </template>

            <UPopover :ui="{ content: 'w-[330px] p-4' }">
              <UButton color="neutral" variant="solid" class="bg-[#031b34] text-white hover:bg-[#004687]">
                <UIcon name="i-lucide-shopping-cart" class="mr-2 text-base" />
                Cart
                <UBadge color="warning" variant="solid" class="ml-2">
                  {{ itemCount }}
                </UBadge>
              </UButton>

              <template #content>
                <div class="space-y-4">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Buyer cart
                      </p>
                      <p class="mt-1 text-lg font-semibold text-slate-900">
                        {{ itemCount }} items selected
                      </p>
                    </div>

                    <UButton
                      v-if="items.length"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      @click="cartStore.clearCart()"
                    >
                      Clear
                    </UButton>
                  </div>

                  <div v-if="cartPreviewItems.length" class="space-y-3">
                    <div
                      v-for="item in cartPreviewItems"
                      :key="item.product_id"
                      class="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3"
                    >
                      <div class="flex items-center gap-3">
                        <div class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            :src="item.image_url || 'https://placehold.co/96x96?text=Item'"
                            :alt="item.name"
                            class="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p class="line-clamp-1 text-sm font-semibold text-slate-900">
                            {{ item.name }}
                          </p>
                          <p class="text-xs text-slate-500">
                            {{ item.quantity }} x {{ item.unit }}
                          </p>
                        </div>
                      </div>

                      <div class="text-right">
                        <p class="text-sm font-semibold text-slate-900">
                          {{ formatCurrency(item.price * item.quantity) }}
                        </p>
                        <UButton
                          color="neutral"
                          variant="ghost"
                          size="xs"
                          @click="cartStore.removeFromCart(item.product_id)"
                        >
                          Remove
                        </UButton>
                      </div>
                    </div>
                  </div>

                  <p
                    v-else
                    class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-7 text-slate-500"
                  >
                    Your cart is empty. Add products from the featured section to
                    start building a material shortlist.
                  </p>

                  <div class="flex items-center justify-between border-t border-slate-200 pt-3">
                    <p class="text-sm text-slate-500">Subtotal</p>
                    <p class="text-lg font-semibold text-slate-900">
                      {{ formatCurrency(subtotal) }}
                    </p>
                  </div>

                  <UButton to="/cart" color="warning" block>
                    View cart
                  </UButton>
                </div>
              </template>
            </UPopover>
          </div>
        </div>

        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <div class="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <NuxtLink
              v-for="link in primaryLinks"
              :key="link.to"
              :to="link.to"
              :class="[
                'whitespace-nowrap rounded-full border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition',
                isActiveLink(link.to)
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600',
              ]"
            >
              {{ link.label }}
            </NuxtLink>
          </div>

          <form class="flex flex-1 items-center gap-3" @submit.prevent="submitSearch">
            <StorefrontInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Search materials, tools, or specification notes"
            />
            <StorefrontButton type="submit" tone="primary" size="lg">
              Search
            </StorefrontButton>
          </form>
        </div>
      </div>
    </header>

    <main class="page-layout page-layout--shop">
      <slot />
    </main>

    <footer class="border-t-4 border-amber-500 bg-slate-100">
      <div class="mx-auto grid max-w-[88rem] gap-8 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div class="md:col-span-1">
          <p class="sf-display text-xl font-bold text-[#031b34]">Zoom Wide</p>
          <p class="mt-4 max-w-sm text-sm leading-7 text-slate-500">
            Precision-oriented supply paths for construction teams that need a
            calmer storefront without sacrificing real stock and cart behavior.
          </p>
        </div>

        <div>
          <p class="sf-display text-xs font-bold uppercase tracking-[0.2em] text-[#031b34]">
            Browse
          </p>
          <div class="mt-5 flex flex-col gap-3 text-sm text-slate-500">
            <NuxtLink to="/shop" class="transition hover:text-[#004687]">Home</NuxtLink>
            <NuxtLink to="/shop#categories" class="transition hover:text-[#004687]">
              Categories
            </NuxtLink>
            <NuxtLink to="/shop/catalog" class="transition hover:text-[#004687]">
              Product catalog
            </NuxtLink>
            <NuxtLink to="/shop#trust" class="transition hover:text-[#004687]">
              Trust signals
            </NuxtLink>
          </div>
        </div>

        <div>
          <p class="sf-display text-xs font-bold uppercase tracking-[0.2em] text-[#031b34]">
            Account
          </p>
          <div class="mt-5 flex flex-col gap-3 text-sm text-slate-500">
            <NuxtLink
              v-if="isAuthenticated"
              :to="accountTarget"
              class="transition hover:text-[#004687]"
            >
              {{ accountLabel }}
            </NuxtLink>
            <NuxtLink v-else to="/auth/login" class="transition hover:text-[#004687]">
              Sign in
            </NuxtLink>
            <NuxtLink to="/auth/register" class="transition hover:text-[#004687]">
              Create account
            </NuxtLink>
            <button
              v-if="isAuthenticated"
              type="button"
              class="text-left transition hover:text-[#004687]"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>
        </div>

        <div>
          <p class="sf-display text-xs font-bold uppercase tracking-[0.2em] text-[#031b34]">
            Connect
          </p>
          <div class="mt-5 flex gap-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
              <UIcon name="i-lucide-building-2" class="text-lg" />
            </span>
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
              <UIcon name="i-lucide-truck" class="text-lg" />
            </span>
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
              <UIcon name="i-lucide-ruler" class="text-lg" />
            </span>
          </div>
          <p class="mt-5 text-sm leading-7 text-slate-500">
            Cart subtotal:
            <span class="font-semibold text-slate-900">
              {{ formatCurrency(subtotal) }}
            </span>
          </p>
        </div>
      </div>

      <div class="border-t border-slate-200 bg-slate-200/70">
        <div class="mx-auto flex max-w-[88rem] flex-col gap-3 px-4 py-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <span>Copyright 2026 Zoom Wide Construction Supplies. Built for precision.</span>
          <span v-if="!isProductDetailPage" class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-emerald-500" />
            Buyer cart active: {{ itemCount }} items
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>
