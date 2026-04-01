<script setup lang="ts">
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  distinctItemCount: number;
  itemCount: number;
  subtotal: number;
}>();

const cartStore = useCartStore();

const potentialSavings = computed(() => {
  if (props.itemCount < 10) {
    return 0;
  }

  return Math.round(props.subtotal * 0.03);
});
</script>

<template>
  <section class="xl:sticky xl:top-24">
    <UCard class="rounded-xl bg-white/95 shadow-sm">
      <div class="space-y-6">
        <div>
          <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
            Order Summary
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            Cart Totals
          </h2>
        </div>

        <div class="space-y-3 text-sm text-slate-600">
          <div class="flex items-center justify-between gap-4">
            <span>Distinct items</span>
            <span class="font-medium text-slate-900">{{ props.distinctItemCount }}</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span>Total quantity</span>
            <span class="font-medium text-slate-900">{{ props.itemCount }}</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <span class="text-lg font-semibold text-slate-900">
              {{ formatCurrency(props.subtotal) }}
            </span>
          </div>
        </div>

        <div
          v-if="potentialSavings > 0"
          class="rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
        >
          Potential bulk savings:
          <span class="font-semibold">{{ formatCurrency(potentialSavings) }}</span>
        </div>

        <div class="rounded-lg bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
          Shipping charges, taxes, and final order details will be confirmed in
          checkout.
        </div>

        <div class="flex flex-col gap-3">
          <UButton color="warning" class="rounded-lg font-semibold shadow-sm w-full justify-center" to="/checkout">
            Continue to Checkout
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-lg font-semibold w-full justify-center"
            to="/shop"
          >
            Add More Products
          </UButton>
          <UButton
            color="error"
            variant="ghost"
            class="rounded-lg w-full justify-center"
            @click="cartStore.clearCart()"
          >
            Clear Cart
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>
