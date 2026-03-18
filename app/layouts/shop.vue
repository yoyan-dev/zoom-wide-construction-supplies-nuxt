<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const { items, itemCount, subtotal } = storeToRefs(cartStore);

const search = ref(typeof route.query.q === "string" ? route.query.q : "");

watch(
  () => route.query.q,
  (value) => {
    search.value = typeof value === "string" ? value : "";
  },
  { immediate: true },
);

const submitSearch = async () => {
  const query = search.value.trim();
  await router.push({
    path: "/shop",
    query: query ? { q: query } : {},
  });
};
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_55%,#f1f5f9_100%)] text-slate-900">
    <header class="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NuxtLink to="/shop" class="shrink-0">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
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

        <form class="hidden flex-1 items-center gap-3 md:flex" @submit.prevent="submitSearch">
          <UInput
            v-model="search"
            class="w-full"
            icon="i-lucide-search"
            size="lg"
            placeholder="Search materials, tools, or supply categories"
          />
          <UButton type="submit" color="warning" size="lg">
            Search
          </UButton>
        </form>

        <div class="ml-auto flex items-center gap-2">
          <UButton color="neutral" variant="ghost" to="/shop/categories">
            Categories
          </UButton>

          <UPopover :ui="{ content: 'w-[320px] p-4' }">
            <UButton color="neutral" variant="outline" icon="i-lucide-shopping-cart">
              Cart
              <UBadge color="warning" variant="solid" class="ml-2">
                {{ itemCount }}
              </UBadge>
            </UButton>

            <template #content>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
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
                    class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 p-3"
                  >
                    <div class="flex items-center gap-3">
                      <div class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                        <NuxtImg
                          :src="item.image_url || 'https://placehold.co/96x96?text=Item'"
                          :alt="item.name"
                          class="h-full w-full object-cover"
                          width="96"
                          height="96"
                        />
                      </div>
                      <div>
                        <p class="line-clamp-1 text-sm font-medium text-slate-900">
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
                  class="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500"
                >
                  Your cart is empty. Add products from the storefront to build a quick material shortlist.
                </p>

                <div class="flex items-center justify-between border-t border-slate-200 pt-3">
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
        <form class="mx-auto flex max-w-7xl gap-3" @submit.prevent="submitSearch">
          <UInput
            v-model="search"
            class="w-full"
            icon="i-lucide-search"
            placeholder="Search supplies"
          />
          <UButton type="submit" color="warning">
            Go
          </UButton>
        </form>
      </div>
    </header>

    <main class="page-layout page-layout--shop">
      <slot />
    </main>
  </div>
</template>
