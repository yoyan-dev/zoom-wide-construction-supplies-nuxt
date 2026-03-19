<script setup lang="ts">
import type { StaffOrder } from "./staff-dashboard.types";
import { formatCurrency } from "~/utils/format";

defineProps<{
  orders: StaffOrder[];
}>();
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Recent Orders
        </p>
        <p class="mt-1 text-lg font-semibold">Active order monitoring</p>
      </div>

      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-right"
        to="/staff/orders"
      >
        View all orders
      </UButton>
    </div>

    <div class="mt-5 overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead
          class="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"
        >
          <tr>
            <th class="px-4 py-3 font-medium">Order</th>
            <th class="px-4 py-3 font-medium">Materials</th>
            <th class="px-4 py-3 font-medium">Total</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium">Delivery Window</th>
            <th class="px-4 py-3 font-medium">Staff</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/80">
          <tr v-for="order in orders" :key="order.id" class="align-top">
            <td class="px-4 py-4">
              <div>
                <p class="font-semibold text-slate-900">{{ order.id }}</p>
                <p class="mt-1 text-slate-700">{{ order.customer }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ order.project }}</p>
              </div>
            </td>
            <td class="px-4 py-4 text-slate-600">
              {{ order.items }}
            </td>
            <td class="px-4 py-4 font-semibold text-slate-900">
              {{ formatCurrency(order.total) }}
            </td>
            <td class="px-4 py-4">
              <UBadge :color="order.statusTone" variant="subtle">
                {{ order.status }}
              </UBadge>
            </td>
            <td class="px-4 py-4 text-slate-600">
              {{ order.deliveryWindow }}
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center justify-between gap-3">
                <span class="text-slate-600">{{ order.assignee }}</span>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-arrow-up-right"
                  to="/staff/orders"
                >
                  Open
                </UButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </UCard>
</template>
