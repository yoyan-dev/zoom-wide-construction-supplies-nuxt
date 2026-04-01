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
  { label: "Storefront", to: "/shop" },
  { label: "Categories", to: "/shop/categories" },
  { label: "Solutions", to: "/shop/solutions" },
  { label: "Help", to: "/shop/help" },
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

  if (typeof route.query.category === "string" && route.query.category) {
    nextQuery.category = route.query.category;
  }

  await router.push({
    path: "/shop",
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
const hasCartItems = computed(() => itemCount.value > 0);
const isProductDetailPage = computed(
  () =>
    /^\/shop\/[^/]+$/.test(route.path) &&
    !["/shop/categories", "/shop/solutions", "/shop/help"].includes(route.path),
);

const handleLogout = async () => {
  authStore.logout();
  await router.push("/auth/login");
};

const isActivePath = (path: string) =>
  route.path === path || route.path.startsWith(`${path}/`);
</script>

<template>
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.08),_transparent_22%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_54%,#eef2f7_100%)] text-slate-900"
  >
    <!-- <div class="border-b border-slate-200/70 bg-slate-950 text-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <p class="font-medium text-slate-100">
          Built for contractors, procurement teams, and repeat construction buyers.
        </p>
        <div class="hidden items-center gap-3 text-slate-300 md:flex">
          <span>Stock-first catalog</span>
          <span class="text-slate-600">/</span>
          <span>Faster shortlist flow</span>
          <span class="text-slate-600">/</span>
          <span>Clear cart path</span>
        </div>
      </div>
    </div> -->

    <header
      class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/92 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8"
      >
        <NuxtLink to="/shop" class="shrink-0">
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm"
            >
              <UIcon name="i-lucide-hard-hat" class="text-xl" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
                ZOOM Wide
              </p>
              <p class="text-base font-semibold text-slate-900">
                Build Supply Market
              </p>
            </div>
          </div>
        </NuxtLink>

        <nav class="hidden items-center gap-2 lg:flex">
          <NuxtLink
            v-for="link in primaryLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'rounded-full px-4 py-2 text-sm font-medium transition',
              isActivePath(link.to)
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ]"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <form
          class="hidden min-w-[280px] flex-1 items-center gap-3 md:flex"
          @submit.prevent="submitSearch"
        >
          <UInput
            v-model="search"
            class="w-full"
            icon="i-lucide-search"
            size="lg"
            placeholder="Search materials, tools, or supply categories"
          />
          <UButton type="submit" color="warning" size="lg"> Find </UButton>
        </form>

        <div class="ml-auto flex items-center gap-2">
          <template v-if="isAuthenticated">
            <div class="hidden text-right lg:block">
              <p class="text-sm font-medium text-slate-900">
                {{ accountName }}
              </p>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
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

          <UPopover :ui="{ content: 'w-[320px] p-4' }">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-shopping-cart"
            >
              Cart
              <UBadge color="warning" variant="solid" class="ml-2">
                {{ itemCount }}
              </UBadge>
            </UButton>

            <template #content>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p
                      class="text-xs uppercase tracking-[0.18em] text-slate-500"
                    >
                      Buyer Cart
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

                <div class="space-y-3">
                  <div
                    v-for="item in items.slice(0, 4)"
                    :key="item.product_id"
                    class="flex items-center justify-between gap-3 rounded-lg bg-slate-50/80 p-3"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100"
                      >
                        <NuxtImg
                          :src="
                            item.image_url ||
                            'https://placehold.co/96x96?text=Item'
                          "
                          :alt="item.name"
                          class="h-full w-full object-cover"
                          width="96"
                          height="96"
                        />
                      </div>
                      <div>
                        <p
                          class="line-clamp-1 text-sm font-medium text-slate-900"
                        >
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
                  v-if="!items.length"
                  class="rounded-lg bg-slate-50/80 p-4 text-sm text-slate-500"
                >
                  Your cart is empty. Add products from the storefront to build
                  a quick material shortlist.
                </p>

                <div
                  class="flex items-center justify-between border-t border-slate-200 pt-3"
                >
                  <p class="text-sm text-slate-500">Subtotal</p>
                  <p class="text-lg font-semibold text-slate-900">
                    {{ formatCurrency(subtotal) }}
                  </p>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
      </div>

      <div class="border-t border-slate-200/70 px-4 py-3 md:hidden">
        <div class="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-3">
          <NuxtLink
            v-for="link in primaryLinks"
            :key="link.to"
            :to="link.to"
            :class="[
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
              isActivePath(link.to)
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700',
            ]"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <form
          class="mx-auto flex max-w-7xl gap-3"
          @submit.prevent="submitSearch"
        >
          <UInput
            v-model="search"
            class="w-full"
            icon="i-lucide-search"
            placeholder="Search supplies"
          />
          <UButton type="submit" color="warning"> Go </UButton>
        </form>
      </div>
    </header>

    <main class="page-layout page-layout--shop pb-24 md:pb-0">
      <slot />
    </main>

    <footer
      class="border-t border-slate-200/70 bg-slate-950 pb-24 text-white md:pb-0"
    >
      <div
        class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(0,0.7fr))] lg:px-8"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-amber-300">
            ZOOM Wide
          </p>
          <h2 class="mt-3 text-2xl font-semibold tracking-tight">
            A cleaner construction supply storefront for faster customer
            decisions.
          </h2>
          <p class="mt-3 max-w-xl text-sm leading-7 text-slate-300">
            The storefront now gives buyers stronger discovery paths, clearer
            trust signals, and simpler support content without losing the
            existing order flow.
          </p>
        </div>

        <div>
          <p class="text-sm font-semibold text-white">Browse</p>
          <div class="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <NuxtLink to="/shop" class="transition hover:text-white"
              >Storefront</NuxtLink
            >
            <NuxtLink to="/shop/categories" class="transition hover:text-white">
              Categories
            </NuxtLink>
            <NuxtLink to="/shop/solutions" class="transition hover:text-white">
              Solutions
            </NuxtLink>
            <NuxtLink to="/shop/help" class="transition hover:text-white"
              >Help</NuxtLink
            >
          </div>
        </div>

        <div>
          <p class="text-sm font-semibold text-white">Buyer Actions</p>
          <div class="mt-4 flex flex-col gap-3 text-sm text-slate-300">
            <NuxtLink to="/cart" class="transition hover:text-white"
              >View cart</NuxtLink
            >
            <NuxtLink to="/checkout" class="transition hover:text-white">
              Checkout
            </NuxtLink>
            <NuxtLink to="/auth/register" class="transition hover:text-white">
              Create account
            </NuxtLink>
            <NuxtLink to="/auth/login" class="transition hover:text-white"
              >Sign in</NuxtLink
            >
          </div>
        </div>
      </div>
    </footer>

    <div
      v-if="!isProductDetailPage"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 p-3 backdrop-blur md:hidden"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Cart subtotal
          </p>
          <p class="mt-1 text-lg font-semibold text-slate-900">
            {{ formatCurrency(subtotal) }}
          </p>
        </div>
        <UButton
          :to="hasCartItems ? '/cart' : '/shop'"
          color="warning"
          class="shrink-0"
        >
          {{ hasCartItems ? `Review Cart (${itemCount})` : "Browse Products" }}
        </UButton>
      </div>
    </div>
  </div>
</template>
