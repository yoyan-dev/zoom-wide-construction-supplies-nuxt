<script setup lang="ts">
import type { CartLineItem } from "~/types/cart";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  items: CartLineItem[];
  isBusy?: boolean;
}>();

const cartStore = useCartStore();

const handleIncrease = async (productId: string) => {
  await cartStore.increaseQuantity(productId, 1);
};

const handleDecrease = async (productId: string) => {
  await cartStore.decreaseQuantity(productId, 1);
};

const handleRemove = async (productId: string) => {
  await cartStore.removeFromCart(productId);
};
</script>

<template>
  <div class="space-y-5">
    <StorefrontSectionCard
      v-for="item in props.items"
      :key="item.product_id"
      class="overflow-hidden bg-white"
      padding="lg"
    >
      <div class="flex flex-col gap-5 md:flex-row md:items-center">
        <NuxtLink
          :to="`/shop/${item.product_id}`"
          class="h-32 w-full overflow-hidden rounded-xl bg-slate-100 md:w-32 md:min-w-32"
        >
          <img
            :src="
              item.image_url ||
              `https://placehold.co/320x320/e2e8f0/0f172a?text=${encodeURIComponent(item.name)}`
            "
            :alt="item.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </NuxtLink>

        <div class="flex-1">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-700">
                {{ item.category_id ? "Catalog item" : "Project supply" }}
              </p>
              <NuxtLink
                :to="`/shop/${item.product_id}`"
                class="mt-1 block text-xl font-bold tracking-tight text-slate-950 transition hover:text-[#004687]"
              >
                {{ item.name }}
              </NuxtLink>
              <p class="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <span v-if="item.sku">SKU {{ item.sku }}</span>
                <span v-if="item.sku"> / </span>
                <span>{{ item.unit }}</span>
              </p>
            </div>

            <button
              type="button"
              class="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              :disabled="props.isBusy"
              @click="handleRemove(item.product_id)"
            >
              <UIcon name="i-lucide-trash-2" class="text-base" />
            </button>
          </div>

          <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white"
                :disabled="props.isBusy || item.quantity <= 1"
                @click="handleDecrease(item.product_id)"
              >
                <UIcon name="i-lucide-minus" class="text-sm" />
              </button>
              <span class="min-w-12 text-center text-sm font-semibold text-slate-950">
                {{ item.quantity }}
              </span>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition hover:bg-white"
                :disabled="props.isBusy"
                @click="handleIncrease(item.product_id)"
              >
                <UIcon name="i-lucide-plus" class="text-sm" />
              </button>
            </div>

            <div class="text-right">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Unit {{ formatCurrency(item.price) }}
              </p>
              <p class="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                {{ formatCurrency(item.price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </StorefrontSectionCard>
  </div>
</template>
