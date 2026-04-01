<script setup lang="ts">
defineProps<{
  reviewMessage: string;
}>();
</script>

<template>
  <UCard class="rounded-xl bg-white/95 shadow-sm">
    <div class="space-y-4">
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Payment and Submission
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Next Phase Placeholder
        </h2>
      </div>

      <p class="text-sm leading-6 text-slate-600">
        Payment method selection and final order submission are intentionally
        deferred until the order phase. This checkout page only prepares buyer
        details and keeps the cart summary visible.
      </p>

      <div class="rounded-lg bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
        {{ reviewMessage }}
      </div>
    </div>
  </UCard>
</template>
