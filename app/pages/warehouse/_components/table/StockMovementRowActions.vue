<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";
import { downloadText, printText } from "~/utils/documents";
import { formatLongDate } from "~/utils/format";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  log: InventoryLog;
  productName: string;
  productSku: string;
}>();

const logId = computed(() => props.log.id);

const exportCsv = () => {
  const headers = [
    "id",
    "product_id",
    "product_name",
    "sku",
    "movement_type",
    "quantity_change",
    "reference_type",
    "reference_id",
    "note",
    "created_at",
  ];
  const row = [
    props.log.id,
    props.log.product_id,
    props.productName,
    props.productSku,
    props.log.movement_type,
    String(props.log.quantity_change),
    props.log.reference_type ?? "",
    props.log.reference_id ?? "",
    props.log.note ?? "",
    props.log.created_at,
  ];
  const csv = `${headers.join(",")}` + `\n${row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")}`;
  downloadText(`stock-movement-${logId.value}.csv`, csv, "text/csv");
};

const exportPdf = () => {
  printText(
    `Stock Movement ${logId.value}`,
    [
      `Entry ${props.log.id}`,
      `Product ${props.productName} (${props.log.product_id})`,
      `SKU ${props.productSku || "N/A"}`,
      `Movement ${props.log.movement_type}`,
      `Quantity ${props.log.quantity_change}`,
      `Reference ${props.log.reference_type ?? "manual"}`,
      `Reference ID ${props.log.reference_id ?? "N/A"}`,
      `Note ${props.log.note ?? ""}`,
      `Created ${formatLongDate(props.log.created_at)}`,
    ].join("\n"),
  );
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Inventory Item",
    icon: "i-lucide-eye",
    to: `/warehouse/inventory/${props.log.product_id}`,
  },
]);

const exportActions = computed<ActionItem[]>(() => [
  {
    label: "Export CSV",
    icon: "i-lucide-file-spreadsheet",
    onClick: exportCsv,
  },
  {
    label: "Export PDF",
    icon: "i-lucide-file-text",
    onClick: exportPdf,
  },
]);

const handleAction = async (action: ActionItem, close: () => void) => {
  if (action.onClick) {
    await action.onClick();
  }
  close();
};
</script>

<template>
  <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      variant="ghost"
      color="neutral"
      size="sm"
    />

    <template #content="{ close }">
      <div class="flex items-center justify-between gap-4 mb-4 w-full">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="flex flex-col gap-3 min-w-56">
        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            View
          </p>
          <UButton
            v-for="action in viewActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Export
          </p>
          <UButton
            v-for="action in exportActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
