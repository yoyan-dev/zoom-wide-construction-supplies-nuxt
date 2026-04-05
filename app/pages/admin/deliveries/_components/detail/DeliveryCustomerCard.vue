<script setup lang="ts">
import type { Customer } from "~/types/customer";

const props = defineProps<{
  customer: Customer | null;
  customerId?: string | null;
}>();
</script>

<template>
  <UCard>
    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
      Customer Summary
    </p>
    <h2 class="mt-2 text-xl font-semibold text-slate-900">
      Delivery contact
    </h2>

    <div v-if="props.customer" class="mt-6 grid gap-4 md:grid-cols-2">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Company
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ props.customer.company_name }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Contact
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ props.customer.contact_name }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Email
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ props.customer.email }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Phone
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ props.customer.phone ?? "Not provided" }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8"
    >
      <p class="text-sm font-medium text-slate-900">
        Customer summary unavailable
      </p>
      <p class="mt-2 text-sm text-slate-600">
        {{ props.customerId ?? "Customer record" }} could not be resolved from the current delivery relationships.
      </p>
    </div>
  </UCard>
</template>
