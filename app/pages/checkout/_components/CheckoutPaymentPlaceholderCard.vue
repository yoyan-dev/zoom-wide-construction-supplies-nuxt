<script setup lang="ts">
defineProps<{
  reviewMessage: string;
}>();
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
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

      <div class="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        {{ reviewMessage }}
      </div>
    </div>
  </UCard>
</template>
