<script setup lang="ts">
import type { Customer } from "~/types/customer";

const props = defineProps<{
  customer: Customer | null;
  customerId: string;
}>();
</script>

<template>
  <UCard>
    <div>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Customer Summary
      </p>
      <h2 class="mt-2 text-xl font-semibold text-slate-900">
        {{ props.customer?.company_name ?? "Customer record unavailable" }}
      </h2>
      <p class="mt-2 text-sm text-slate-600">
        Review the linked customer context currently associated with this order.
      </p>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Customer ID</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.customerId }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Contact</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.customer?.contact_name ?? "Not available" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Email</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.customer?.email ?? "Not available" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Phone</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.customer?.phone ?? "Not available" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Shipping Address</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.customer?.shipping_address ?? "Not available" }}
        </span>
      </div>
    </div>
  </UCard>
</template>
