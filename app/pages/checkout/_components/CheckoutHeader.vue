<script setup lang="ts">
const props = defineProps<{
  distinctItemCount: number;
  itemCount: number;
}>();

const checkoutLabel = computed(() => {
  if (!props.distinctItemCount) {
    return "Add products to your cart before starting checkout.";
  }

  return `${props.distinctItemCount} item${props.distinctItemCount === 1 ? "" : "s"} • ${props.itemCount} unit${props.itemCount === 1 ? "" : "s"} ready for review`;
});
</script>

<template>
  <section class="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Checkout Foundation
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Delivery and Order Review
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          {{ checkoutLabel }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UButton color="neutral" variant="outline" to="/cart">
          Back to Cart
        </UButton>
        <UButton color="neutral" variant="ghost" to="/shop">
          Continue Shopping
        </UButton>
      </div>
    </div>
  </section>
</template>
