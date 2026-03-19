<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Delivery } from "~/types/delivery";
import type { Order, OrderItem, OrderStatus } from "~/types/order";
import type { Product } from "~/types/product";
import type { Customer } from "~/types/customer";
import { formatCurrency, formatShortDate } from "~/utils/format";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = defineProps<{
  orders: Order[];
  customersById: Record<string, Customer>;
  deliveriesByOrderId: Record<string, Delivery>;
  orderItemsByOrderId: Record<string, OrderItem[]>;
  productsById: Record<string, Product>;
}>();

const table = useTemplateRef("table");

const statusTone: Record<OrderStatus, BadgeColor> = {
  pending: "warning",
  approved: "info",
  completed: "success",
  rejected: "error",
  cancelled: "neutral",
};

const columns: TableColumn<Order>[] = [
  { id: "order", header: "Order", accessorFn: (row) => row.id },
  { id: "customer", header: "Customer", accessorFn: (row) => row.customer_id },
  { id: "items", header: "Materials", accessorFn: (row) => row.id },
  { id: "total", header: "Total", accessorFn: (row) => row.total_amount },
  { id: "status", header: "Status", accessorFn: (row) => row.status },
  { id: "delivery", header: "Delivery", accessorFn: (row) => row.id },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});

const itemSummary = (orderId: string) => {
  const items = props.orderItemsByOrderId[orderId] ?? [];
  if (!items.length) return "No items linked";

  const summary = items.slice(0, 2).map((item) => {
    const product = props.productsById[item.product_id];
    return `${item.quantity} ${product?.unit ?? "unit"} ${product?.name ?? item.product_id}`;
  });

  return items.length > 2 ? `${summary.join(", ")} +${items.length - 2} more` : summary.join(", ");
};
</script>

<template>
  <UCard>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Queue
        </p>
        <p class="mt-1 text-lg font-semibold">Daily order monitoring</p>
      </div>
      <UBadge color="primary" variant="subtle">
        {{ props.orders.length }} active records
      </UBadge>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.orders"
      :columns="columns"
      class="text-sm"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
    >
      <template #order-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">{{ row.original.id }}</span>
          <span class="text-xs text-slate-500">
            Updated {{ formatShortDate(row.original.updated_at) }}
          </span>
        </div>
      </template>

      <template #customer-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{
              props.customersById[row.original.customer_id]?.company_name ??
              row.original.customer_id
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              props.customersById[row.original.customer_id]?.contact_name ??
              "Contact pending"
            }}
          </span>
        </div>
      </template>

      <template #items-cell="{ row }">
        <span class="text-slate-600">{{ itemSummary(row.original.id) }}</span>
      </template>

      <template #total-cell="{ row }">
        <span class="font-medium text-slate-900">
          {{ formatCurrency(row.original.total_amount) }}
        </span>
      </template>

      <template #status-cell="{ row }">
        <div class="flex flex-col gap-2">
          <UBadge :color="statusTone[row.original.status]" variant="subtle">
            {{ row.original.status }}
          </UBadge>
          <span class="text-xs text-slate-500">
            {{ row.original.notes ?? "No notes" }}
          </span>
        </div>
      </template>

      <template #delivery-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{
              props.deliveriesByOrderId[row.original.id]?.status?.replace("_", " ") ??
              "Delivery pending"
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              props.deliveriesByOrderId[row.original.id]?.scheduled_at
                ? formatShortDate(props.deliveriesByOrderId[row.original.id].scheduled_at!)
                : "No schedule yet"
            }}
          </span>
        </div>
      </template>
    </UTable>

    <div class="flex justify-end border-t border-default px-4 pt-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(page) => table?.tableApi?.setPageIndex(page - 1)"
      />
    </div>
  </UCard>
</template>
