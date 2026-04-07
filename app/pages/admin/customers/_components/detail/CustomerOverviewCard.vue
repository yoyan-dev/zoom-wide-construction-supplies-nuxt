<script setup lang="ts">
import type { Customer } from "~/types/customer";

const props = defineProps<{
  customer: Customer;
}>();

const customerInitial = computed(
  () => props.customer.company_name?.slice(0, 1).toUpperCase() ?? "C",
);

const summaryItems = computed(() => [
  {
    label: "Account",
    value: props.customer.user_id ? "Linked" : "Unlinked",
  },
  {
    label: "Billing",
    value: props.customer.billing_address ? "On file" : "Missing",
  },
  {
    label: "Shipping",
    value: props.customer.shipping_address ? "On file" : "Missing",
  },
]);
</script>

<template>
  <UCard>
    <div
      class="flex h-64 items-center justify-center rounded-sm border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-amber-50"
    >
      <div class="text-center">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Customer
        </p>
        <p class="mt-3 text-5xl font-semibold text-slate-800">
          {{ customerInitial }}
        </p>
      </div>
    </div>

    <div
      class="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
    >
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-semibold text-slate-900">
            {{ props.customer.company_name }}
          </h2>
          <UBadge
            :color="props.customer.user_id ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{
              props.customer.user_id ? "Linked account" : "No linked account"
            }}
          </UBadge>
        </div>
        <p class="mt-2 text-sm text-slate-600">
          Primary contact: {{ props.customer.contact_name }}
        </p>
      </div>
      <div class="text-sm text-slate-500">
        Customer ID: {{ props.customer.id }}
      </div>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <div v-for="item in summaryItems" :key="item.label">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ item.label }}
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ item.value }}
        </p>
      </div>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <div class="rounded-lg border border-slate-200/70 p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
        <p class="mt-2 text-sm font-medium text-slate-800">
          {{ props.customer.email }}
        </p>
      </div>
      <div class="rounded-lg border border-slate-200/70 p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Phone</p>
        <p class="mt-2 text-sm font-medium text-slate-800">
          {{ props.customer.phone || "No phone number on file" }}
        </p>
      </div>
    </div>
  </UCard>
</template>
