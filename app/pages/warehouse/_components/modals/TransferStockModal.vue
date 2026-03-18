<script setup lang="ts">
import { storeToRefs } from "pinia";
import { defaultAssignedWarehouses, getWarehouseForId, warehouseOptions } from "~/utils/warehouse";
import { printText } from "~/utils/documents";

type TransferStockPayload = {
  productId?: string;
  sourceWarehouse?: string;
};

const props = defineProps<{
  payload: TransferStockPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const { products } = storeToRefs(productStore);
const { inventoryMeta } = storeToRefs(inventoryStore);

const assignedWarehouses = defaultAssignedWarehouses;

const form = reactive({
  product_id: "",
  source_warehouse: assignedWarehouses[0] ?? "",
  destination_warehouse: "",
  quantity: 0,
  note: "",
});

const getWarehouse = (productId: string) =>
  inventoryMeta.value[productId]?.warehouse ?? getWarehouseForId(productId);

const productOptions = computed(() =>
  products.value.filter((product) => {
    if (!product.id) return false;
    return assignedWarehouses.includes(getWarehouse(product.id));
  }),
);

const destinationOptions = computed(() =>
  warehouseOptions.filter((warehouse) => warehouse !== form.source_warehouse),
);

const canSubmit = computed(() => {
  return (
    form.product_id &&
    form.source_warehouse &&
    form.destination_warehouse &&
    form.destination_warehouse !== form.source_warehouse &&
    Number.isFinite(form.quantity) &&
    Math.abs(form.quantity) > 0 &&
    assignedWarehouses.includes(form.source_warehouse)
  );
});

watch(
  () => props.payload,
  (payload) => {
    form.product_id = payload?.productId ?? "";
    form.source_warehouse =
      payload?.sourceWarehouse ?? assignedWarehouses[0] ?? "";
    form.destination_warehouse = "";
    form.quantity = 0;
    form.note = "";
  },
  { immediate: true },
);

watch(
  () => form.source_warehouse,
  (value) => {
    if (form.destination_warehouse === value) {
      form.destination_warehouse = "";
    }
  },
);

onMounted(async () => {
  if (!products.value.length) {
    await productStore.fetchProducts();
  }
});

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  const quantity = Math.abs(form.quantity);
  const note = form.note.trim();
  const transferNote = `Transfer ${form.source_warehouse} -> ${form.destination_warehouse}`;

  await inventoryStore.createInventoryLog({
    product_id: form.product_id,
    movement_type: "out",
    quantity_change: quantity,
    reference_type: "transfer",
    reference_id: null,
    note: [transferNote, note].filter(Boolean).join(". ") || null,
    created_by: "warehouse_manager",
  });

  await inventoryStore.createInventoryLog({
    product_id: form.product_id,
    movement_type: "in",
    quantity_change: quantity,
    reference_type: "transfer",
    reference_id: null,
    note: [transferNote, note].filter(Boolean).join(". ") || null,
    created_by: "warehouse_manager",
  });

  inventoryStore.updateInventoryWarehouse(
    form.product_id,
    form.destination_warehouse,
  );

  printText(
    "Inventory Transfer Notice",
    [
      `Product ${form.product_id}`,
      `Quantity ${quantity}`,
      `Source ${form.source_warehouse}`,
      `Destination ${form.destination_warehouse}`,
      note ? `Notes ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Inventory Transfer
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          Transfer Stock Between Warehouses
        </h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Inventory item">
          <USelect
            class="w-full"
            valueKey="id"
            labelKey="name"
            v-model="form.product_id"
            :items="productOptions"
            placeholder="Select a product"
          />
        </UFormField>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Source warehouse">
            <USelect
              class="w-full"
              v-model="form.source_warehouse"
              :items="assignedWarehouses"
              placeholder="Select source"
            />
          </UFormField>
          <UFormField label="Destination warehouse">
            <USelect
              class="w-full"
              v-model="form.destination_warehouse"
              :items="destinationOptions"
              placeholder="Select destination"
            />
          </UFormField>
        </div>

        <UFormField label="Quantity">
          <UInput
            class="w-full"
            v-model.number="form.quantity"
            type="number"
            placeholder="0"
          />
        </UFormField>

        <UFormField label="Notes">
          <UTextarea
            class="w-full"
            v-model="form.note"
            placeholder="Optional transfer notes"
          />
        </UFormField>

        <p v-if="form.source_warehouse && !assignedWarehouses.includes(form.source_warehouse)" class="text-sm text-red-500">
          You can only transfer from warehouses assigned to you.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="primary" :disabled="!canSubmit" @click="handleSubmit">
          Confirm Transfer
        </UButton>
      </div>
    </template>
  </UModal>
</template>
