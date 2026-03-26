<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  product: Product;
}>();

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const cartStore = useCartStore();
const quantity = ref(1);

const stockQuantity = computed(() => props.product.stock_quantity ?? 0);
const isAvailable = computed(() => props.product.is_active !== false);
const isPurchasable = computed(() => isAvailable.value && stockQuantity.value > 0);
const inCartQuantity = computed(() =>
  props.product.id ? cartStore.getItemQuantity(props.product.id) : 0,
);

const stockBadge = computed<{ color: BadgeColor; label: string }>(() => {
  if (!isAvailable.value) {
    return { color: "neutral", label: "Unavailable" };
  }

  if (stockQuantity.value <= 0) {
    return { color: "error", label: "Out of stock" };
  }

  if (
    props.product.minimum_stock_quantity !== undefined &&
    stockQuantity.value <= props.product.minimum_stock_quantity
  ) {
    return { color: "warning", label: "Low stock" };
  }

  return { color: "success", label: "In stock" };
});

const maxSelectableQuantity = computed(() => {
  if (!isPurchasable.value) {
    return 1;
  }

  return Math.max(1, stockQuantity.value);
});

const incrementQuantity = () => {
  quantity.value = Math.min(quantity.value + 1, maxSelectableQuantity.value);
};

const decrementQuantity = () => {
  quantity.value = Math.max(1, quantity.value - 1);
};

const addToCart = () => {
  cartStore.addToCart(props.product, quantity.value);
};

watch(
  () => props.product.id,
  () => {
    quantity.value = 1;
  },
);
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Purchase Details
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ formatCurrency(props.product.price ?? 0) }}
        </p>
        <p class="mt-2 text-sm text-slate-600">
          Per {{ props.product.unit ?? "unit" }}
        </p>
      </div>

      <UBadge :color="stockBadge.color" variant="subtle">
        {{ stockBadge.label }}
      </UBadge>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Category</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.product.category?.name ?? "Unassigned" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Supplier</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.product.supplier?.name ?? "Unassigned" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">SKU</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.product.sku ?? "No SKU" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Unit</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.product.unit ?? "N/A" }}
        </span>
      </div>
    </div>

    <div class="mt-6 rounded-2xl border border-slate-200/70 p-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Quantity
          </p>
          <p class="mt-1 text-sm text-slate-600">
            Choose how many units to add to your cart.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-minus"
            :disabled="quantity <= 1"
            @click="decrementQuantity"
          />
          <div class="min-w-12 text-center text-lg font-semibold text-slate-900">
            {{ quantity }}
          </div>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-plus"
            :disabled="quantity >= maxSelectableQuantity"
            @click="incrementQuantity"
          />
        </div>
      </div>

      <p v-if="inCartQuantity" class="mt-4 text-sm text-slate-600">
        {{ inCartQuantity }} {{ props.product.unit ?? "unit" }} already in cart.
      </p>
    </div>

    <div class="mt-6 flex flex-col gap-3">
      <UButton
        color="warning"
        size="lg"
        class="w-full justify-center"
        :disabled="!props.product.id || !isPurchasable"
        @click="addToCart"
      >
        Add {{ quantity }} to Cart
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        class="w-full justify-center"
        to="/cart"
      >
        View Cart
      </UButton>
    </div>
  </UCard>
</template>
