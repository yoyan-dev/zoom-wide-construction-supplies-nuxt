<script setup lang="ts">
const props = defineProps<{
  distinctItemCount: number;
  itemCount: number;
}>();

const checkoutLabel = computed(() => {
  if (!props.distinctItemCount) {
    return "Add products to your cart before starting checkout.";
  }

  return `${props.distinctItemCount} item${props.distinctItemCount === 1 ? "" : "s"} / ${props.itemCount} unit${props.itemCount === 1 ? "" : "s"} ready for review`;
});
</script>

<template>
  <section class="rounded-xl bg-white/95 shadow-sm p-6 md:p-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
          Checkout Foundation
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Delivery and Order Review
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          {{ checkoutLabel }}
        </p>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-4 gap-2">
          <div class="rounded-lg bg-slate-50/80 p-3 text-center">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">1</p>
            <p class="mt-1 text-sm font-semibold text-slate-600">Cart</p>
          </div>
          <div class="rounded-lg bg-slate-50/80 p-3 text-center">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">2</p>
            <p class="mt-1 text-sm font-semibold text-slate-800">Details</p>
          </div>
          <div class="rounded-lg bg-slate-50/80 p-3 text-center">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">3</p>
            <p class="mt-1 text-sm font-semibold text-slate-600">Review</p>
          </div>
          <div class="rounded-lg bg-slate-50/80 p-3 text-center">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">4</p>
            <p class="mt-1 text-sm font-semibold text-slate-600">Submit</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3">
          <UButton color="neutral" variant="outline" class="rounded-lg font-semibold" to="/cart">
            Back to Cart
          </UButton>
          <UButton color="neutral" variant="ghost" class="rounded-lg" to="/shop">
            Continue Shopping
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
