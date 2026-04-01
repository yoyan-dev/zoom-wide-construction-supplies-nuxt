<script setup lang="ts">
import type { CartLineItem } from "~/types/cart";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  item: CartLineItem;
}>();

const cartStore = useCartStore();

const lineSubtotal = computed(() =>
  cartStore.getLineSubtotal(props.item.product_id),
);

const detailTo = computed(() => `/shop/${props.item.product_id}`);

const increaseQuantity = () => {
  cartStore.increaseQuantity(props.item.product_id);
};

const decreaseQuantity = () => {
  cartStore.decreaseQuantity(props.item.product_id);
};

const removeItem = () => {
  cartStore.removeFromCart(props.item.product_id);
};
</script>

<template>
  <UCard class="rounded-xl bg-white/95 shadow-sm">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div class="flex gap-4">
        <NuxtLink
          :to="detailTo"
          class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100"
        >
          <img
            v-if="item.image_url"
            :src="item.image_url"
            :alt="item.name"
            class="h-full w-full object-cover"
          />
          <span v-else class="text-xl font-semibold text-slate-400">
            {{ item.name.charAt(0) }}
          </span>
        </NuxtLink>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink
              :to="detailTo"
              class="text-lg font-semibold text-slate-900 transition hover:text-amber-600"
            >
              {{ item.name }}
            </NuxtLink>
            <UBadge v-if="item.sku" color="neutral" variant="subtle">
              {{ item.sku }}
            </UBadge>
          </div>

          <p class="mt-2 text-sm text-slate-600">
            {{ formatCurrency(item.price) }} per {{ item.unit }}
          </p>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <div
              class="inline-flex items-center rounded-full bg-slate-100 p-1"
            >
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-minus"
                aria-label="Decrease quantity"
                @click="decreaseQuantity"
              />
              <span class="min-w-10 text-center text-sm font-medium text-slate-700">
                {{ item.quantity }}
              </span>
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-plus"
                aria-label="Increase quantity"
                @click="increaseQuantity"
              />
            </div>

            <UButton color="neutral" variant="outline" size="sm" @click="removeItem">
              Remove
            </UButton>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-start gap-2 lg:items-end">
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Line Subtotal
        </p>
        <p class="text-xl font-semibold text-slate-900">
          {{ formatCurrency(lineSubtotal) }}
        </p>
        <p class="text-sm text-slate-500">
          {{ item.quantity }} x {{ formatCurrency(item.price) }}
        </p>
      </div>
    </div>
  </UCard>
</template>
