<script setup lang="ts">
const props = defineProps<{
  distinctItemCount: number;
  itemCount: number;
}>();

const cartLabel = computed(() => {
  if (!props.distinctItemCount) {
    return "Your cart is ready when you are.";
  }

  return `${props.distinctItemCount} item${props.distinctItemCount === 1 ? "" : "s"} / ${props.itemCount} unit${props.itemCount === 1 ? "" : "s"}`;
});
</script>

<template>
  <section class="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Buyer Cart
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Review Your Cart
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          {{ cartLabel }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UButton color="neutral" variant="outline" to="/shop">
          Continue Shopping
        </UButton>
        <UButton color="primary" :disabled="!props.distinctItemCount" to="/checkout">
          Proceed to Checkout
        </UButton>
      </div>
    </div>
  </section>
</template>
