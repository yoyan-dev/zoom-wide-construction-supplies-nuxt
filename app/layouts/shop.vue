<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const { items, itemCount, subtotal } = storeToRefs(cartStore);
const { customer, isAuthenticated, user } = storeToRefs(authStore);

const mobileNavOpen = ref(false);
const search = ref(typeof route.query.q === "string" ? route.query.q : "");
const primaryLinks = [
  { label: "Home", to: "/shop" },
  { label: "Catalog", to: "/shop/catalog" },
  { label: "Categories", to: "/shop/categories" },
  { label: "Standards", to: "/shop/standards" },
] as const;

watch(
  () => route.query.q,
  (value) => {
    search.value = typeof value === "string" ? value : "";
  },
  { immediate: true },
);

watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false;
  },
);

const accountLabel = computed(() =>
  authStore.role === "customer" ? "My Account" : "Dashboard",
);

const accountTarget = computed(() =>
  authStore.role === "customer"
    ? "/shop/account"
    : authStore.getRoleLandingPath(),
);

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
    ![
      "/shop/catalog",
      "/shop/categories",
      "/shop/solutions",
      "/shop/help",
    ].includes(route.path),
);

const navigationItems = computed<NavigationMenuItem[]>(() =>
  primaryLinks.map((link) => ({
    label: link.label,
    to: link.to,
    onSelect: () => {
      mobileNavOpen.value = false;
    },
  })),
);

const footerItems = computed<NavigationMenuItem[]>(() => [
  {
    label: "Home",
    to: "/shop",
    active: route.path === "/shop",
  },
  {
    label: "Catalog",
    to: "/shop/catalog",
    active: route.path.startsWith("/shop/catalog"),
  },
  {
    label: "Categories",
    to: "/shop/categories",
    active: route.path.startsWith("/shop/categories"),
  },
  {
    label: "Standards",
    to: "/shop/standards",
    active: route.path.startsWith("/shop/standards"),
  },
]);

const handleLogout = async () => {
  await authStore.logout();
  await router.push("/auth/login");
};
</script>

<template>
  <div class="shop-shell min-h-screen text-slate-900">
    <div
      class="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/88 backdrop-blur-md"
    >
      <UHeader
        class="mx-auto max-w-352 px-4 py-4 sm:px-6 lg:px-8"
        :ui="{
          right: 'gap-2',
          root: 'min-h-0 border-0 ',
          container: 'px-0 sm:px-0 lg:px-0',
        }"
      >
        <template #title>
          <NuxtLink to="/shop" class="flex items-center">
            <NuxtImg
              src="/logo-full.png"
              alt="Zoom Wide"
              class="h-8 w-auto rounded-2xl"
            />
          </NuxtLink>
        </template>

        <UNavigationMenu :items="navigationItems" />

        <template #right>
          <template v-if="isAuthenticated">
            <div class="hidden text-right xl:block">
              <p class="text-sm font-semibold text-slate-900">
                {{ accountName }}
              </p>
              <p
                class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                {{ user?.role ?? "account" }}
              </p>
            </div>
            <UButton
              color="warning"
              variant="soft"
              :to="accountTarget"
              :aria-label="accountLabel"
            >
              <UIcon name="i-lucide-user-round" class="text-base sm:mr-2" />
              <span class="hidden sm:inline">{{ accountLabel }}</span>
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              aria-label="Logout"
              @click="handleLogout"
            >
              <UIcon name="i-lucide-log-out" class="text-base sm:mr-2" />
              <span class="hidden sm:inline">Logout</span>
            </UButton>
          </template>

          <template v-else>
            <UButton
              color="neutral"
              variant="ghost"
              to="/auth/login"
              aria-label="Sign in"
            >
              <UIcon name="i-lucide-log-in" class="text-base sm:mr-2" />
              <span class="hidden sm:inline">Sign in</span>
            </UButton>
            <UButton
              color="warning"
              variant="soft"
              to="/auth/register"
              aria-label="Create account"
            >
              <UIcon name="i-lucide-user-plus" class="text-base sm:mr-2" />
              <span class="hidden sm:inline">Create account</span>
            </UButton>
          </template>

          <UPopover :ui="{ content: 'w-[330px] p-4' }">
            <UButton
              color="neutral"
              variant="solid"
              class="bg-[#031b34] text-white hover:bg-brand-500"
              aria-label="Cart"
            >
              <UIcon name="i-lucide-shopping-cart" class="text-base sm:mr-2" />
              <span class="hidden sm:inline">Cart</span>
              <UBadge color="warning" variant="solid" class="ml-2">
                {{ itemCount }}
              </UBadge>
            </UButton>

            <template #content>
              <div class="space-y-4">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <p
                      class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
                    >
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
                        />
                      </div>
                      <div>
                        <p
                          class="line-clamp-1 text-sm font-semibold text-slate-900"
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
                  v-else
                  class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-7 text-slate-500"
                >
                  Your cart is empty. Add products from the featured section to
                  start building a material shortlist.
                </p>

                <div
                  class="flex items-center justify-between border-t border-slate-200 pt-3"
                >
                  <p class="text-sm text-slate-500">Subtotal</p>
                  <p class="text-lg font-semibold text-slate-900">
                    {{ formatCurrency(subtotal) }}
                  </p>
                </div>

                <UButton to="/cart" color="warning" block> View cart </UButton>
              </div>
            </template>
          </UPopover>
        </template>
        <template #body>
          <UNavigationMenu
            :items="navigationItems"
            orientation="vertical"
            class="-mx-2.5"
          />
        </template>
      </UHeader>
    </div>

    <main class="page-layout page-layout--shop">
      <slot />
    </main>

    <div class="border-t-4 border-amber-500 bg-slate-100">
      <UFooter
        class="mx-auto max-w-352 px-4 py-6 sm:px-6 lg:px-8"
        :ui="{
          root: 'border-0 bg-transparent',
          container: 'px-0 sm:px-0 lg:px-0',
          left: 'flex-1',
          center: 'justify-center',
          right: 'flex-1 justify-end gap-2',
        }"
      >
        <template #left>
          <div class="flex flex-col gap-1">
            <p class="text-sm text-slate-500">
              Copyright © {{ new Date().getFullYear() }} Zoom Wide Construction
              Supplies
            </p>
            <p
              v-if="!isProductDetailPage"
              class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
            >
              Buyer cart active: {{ itemCount }} items
            </p>
          </div>
        </template>

        <UNavigationMenu :items="footerItems" variant="link" />

        <template #right>
          <UButton
            icon="i-lucide-house"
            color="neutral"
            variant="ghost"
            to="/shop"
            aria-label="Home"
          />
          <UButton
            icon="i-lucide-shopping-cart"
            color="neutral"
            variant="ghost"
            to="/cart"
            aria-label="Cart"
          />
          <UButton
            :icon="isAuthenticated ? 'i-lucide-user-round' : 'i-lucide-log-in'"
            color="neutral"
            variant="ghost"
            :to="isAuthenticated ? accountTarget : '/auth/login'"
            :aria-label="isAuthenticated ? accountLabel : 'Sign in'"
          />
        </template>
      </UFooter>
    </div>
  </div>
</template>
