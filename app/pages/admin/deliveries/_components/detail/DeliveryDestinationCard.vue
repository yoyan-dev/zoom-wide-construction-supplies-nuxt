<script setup lang="ts">
import type { Customer } from "~/types/customer";

const props = defineProps<{
  customer: Customer | null;
}>();

const destination = computed(() => {
  if (!props.customer) {
    return null;
  }

  return props.customer.shipping_address || props.customer.billing_address || null;
});
</script>

<template>
  <UCard>
    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
      Destination
    </p>
    <h2 class="mt-2 text-xl font-semibold text-slate-900">
      Stored delivery address
    </h2>

    <div
      v-if="destination"
      class="mt-6 rounded-sm bg-white p-4 dark:bg-gray-900"
    >
      <p class="whitespace-pre-line text-sm leading-6 text-slate-700">
        {{ destination }}
      </p>
    </div>

    <div
      v-else
      class="mt-6 rounded-sm border border-dashed border-slate-200 bg-white px-6 py-8 dark:bg-gray-900"
    >
      <p class="text-sm font-medium text-slate-900">
        No structured destination available
      </p>
      <p class="mt-2 text-sm text-slate-600">
        The current repository only provides stored customer shipping or billing addresses for delivery context.
      </p>
    </div>
  </UCard>
</template>
