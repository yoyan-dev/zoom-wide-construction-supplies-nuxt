<script setup lang="ts">
import { formatCurrency } from "~/utils/format";

defineProps<{
  distinctItemCount: number;
  itemCount: number;
  subtotal: number;
}>();

const cartStore = useCartStore();
</script>

<template>
  <section class="xl:sticky xl:top-24">
    <UCard>
      <div class="space-y-6">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Order Summary
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            Cart Totals
          </h2>
        </div>

        <div class="space-y-3 text-sm text-slate-600">
          <div class="flex items-center justify-between gap-4">
            <span>Distinct items</span>
            <span class="font-medium text-slate-900">{{ distinctItemCount }}</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span>Total quantity</span>
            <span class="font-medium text-slate-900">{{ itemCount }}</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <span class="text-lg font-semibold text-slate-900">
              {{ formatCurrency(subtotal) }}
            </span>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Shipping charges, taxes, and final order details will be confirmed in
          checkout.
        </div>

        <div class="flex flex-col gap-3">
          <UButton color="primary" class="w-full justify-center" to="/checkout">
            Continue to Checkout
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="w-full justify-center"
            to="/shop"
          >
            Add More Products
          </UButton>
          <UButton
            color="error"
            variant="ghost"
            class="w-full justify-center"
            @click="cartStore.clearCart()"
          >
            Clear Cart
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>
