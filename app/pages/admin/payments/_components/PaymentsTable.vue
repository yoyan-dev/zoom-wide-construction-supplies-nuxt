<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Payment, PaymentStatus } from "~/types/payment";
import { formatCurrency, formatShortDate } from "~/utils/format";
import PaymentRowActions from "./PaymentRowActions.vue";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const table = useTemplateRef("table");
const props = defineProps<{
  payments: Payment[];
}>();

const statusTone: Record<PaymentStatus, BadgeColor> = {
  paid: "success",
  pending: "warning",
  failed: "error",
  refunded: "neutral",
};

const columns: TableColumn<Payment>[] = [
  {
    id: "payment",
    header: "Payment",
    accessorFn: (row) => row.id,
  },
  {
    id: "order",
    header: "Order",
    accessorFn: (row) => row.order_id,
  },
  {
    id: "amount",
    header: "Amount",
    accessorFn: (row) => row.amount,
  },
  {
    id: "method",
    header: "Method",
    accessorFn: (row) => row.method,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.status,
  },
  {
    id: "paid",
    header: "Paid At",
    accessorFn: (row) => row.paid_at ?? "",
  },
  {
    id: "actions",
    header: "",
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Transaction Ledger
        </p>
        <p class="mt-1 text-lg font-semibold">Payment overview</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
        Filters
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.payments"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #payment-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.id }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.transaction_ref ?? "No reference" }}
          </span>
        </div>
      </template>
      <template #order-cell="{ row }">
        <span class="text-slate-700">{{ row.original.order_id }}</span>
      </template>
      <template #amount-cell="{ row }">
        <span class="font-medium">
          {{ formatCurrency(row.original.amount) }}
        </span>
      </template>
      <template #method-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.method.replace("_", " ") }}
        </span>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="statusTone[row.original.status]" variant="subtle">
          {{ row.original.status }}
        </UBadge>
      </template>
      <template #paid-cell="{ row }">
        <span class="text-slate-600">
          {{
            row.original.paid_at
              ? formatShortDate(row.original.paid_at)
              : "Pending"
          }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <PaymentRowActions :payment="row.original" />
        </div>
      </template>
    </UTable>
    <div class="flex justify-end border-t border-default pt-4 px-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </UCard>
</template>
