<script setup lang="ts">
import { useTimeoutFn } from "@vueuse/core";
import type { Product } from "~/types/product";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  product: Product;
  stock: number;
  badge?: string;
  badgeColor?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral";
}>();

const cartStore = useCartStore();
const added = ref(false);
const { start } = useTimeoutFn(() => {
  added.value = false;
}, 1400, { immediate: false });

const stockMeta = computed(() => {
  if (props.stock <= 0) {
    return { label: "Out of stock", color: "error" as const };
  }
  if (props.stock <= (props.product.minimum_stock_quantity ?? 0)) {
    return { label: "Low stock", color: "warning" as const };
  }
  return { label: "Available", color: "success" as const };
});

const shortSpec = computed(() => {
  const firstSpec = props.product.handbook?.specifications?.[0];
  if (firstSpec?.value) return `${firstSpec.label}: ${firstSpec.value}`;
  return props.product.unit ?? "unit";
});

const addToCart = () => {
  cartStore.addToCart(props.product, 1);
  added.value = true;
  start();
};
</script>

<template>
  <UCard
    :ui="{
      root: 'rounded-[28px] border border-slate-200/70 bg-white shadow-sm',
      body: 'p-0'
    }"
    class="h-full overflow-hidden"
  >
    <div class="relative">
      <NuxtLink :to="`/shop/product/${props.product.id}`" class="block">
        <div class="h-48 overflow-hidden bg-slate-100">
          <NuxtImg
            :src="props.product.image_url || 'https://placehold.co/640x420?text=Supply'"
            :alt="props.product.name ?? 'Product image'"
            class="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
            width="640"
            height="420"
          />
        </div>
      </NuxtLink>

      <div class="absolute left-4 top-4 flex flex-wrap gap-2">
        <UBadge
          v-if="props.badge"
          :color="props.badgeColor ?? 'warning'"
          variant="solid"
        >
          {{ props.badge }}
        </UBadge>
        <UBadge :color="stockMeta.color" variant="solid">
          {{ stockMeta.label }}
        </UBadge>
      </div>
    </div>

    <div class="space-y-4 p-5">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ shortSpec }}
        </p>
        <NuxtLink :to="`/shop/product/${props.product.id}`" class="mt-2 block">
          <h3 class="line-clamp-2 text-lg font-semibold text-slate-900">
            {{ props.product.name ?? "Product" }}
          </h3>
        </NuxtLink>
        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {{
            props.product.handbook?.summary ??
            props.product.description ??
            "Browse this product for more technical notes and supply details."
          }}
        </p>
      </div>

      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Price
          </p>
          <p class="mt-1 text-2xl font-semibold text-slate-900">
            {{ formatCurrency(props.product.price ?? 0) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ props.stock }} {{ props.product.unit ?? "unit" }} ready
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton
          class="flex-1 justify-center"
          color="warning"
          :disabled="props.stock <= 0"
          @click="addToCart"
        >
          {{ added ? "Added" : "Add to Cart" }}
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          :to="`/shop/product/${props.product.id}`"
        >
          View Details
        </UButton>
      </div>
    </div>
  </UCard>
</template>
