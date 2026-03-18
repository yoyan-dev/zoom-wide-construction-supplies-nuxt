<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Warehouse } from "~/types/warehouse";
import { printText } from "~/utils/documents";

type TransferPayload = {
  productId?: string;
  sourceWarehouse?: string;
};

const props = defineProps<{
  payload: TransferPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const warehouseStore = useWarehouseStore();

const { products } = storeToRefs(productStore);
const { warehouses } = storeToRefs(warehouseStore);

const form = reactive({
  product_id: "",
  source_warehouse: "",
  destination_warehouse: "",
  quantity: 0,
  note: "",
});

const warehouseOptions = computed(() =>
  warehouses.value.map((item: Warehouse) => item.name),
);

const productOptions = computed(() =>
  products.value.filter((product) => product.id && product.name),
);

watch(
  () => props.payload,
  (payload) => {
    form.product_id = payload?.productId ?? "";
    form.source_warehouse = payload?.sourceWarehouse ?? "";
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
  if (!warehouses.value.length) {
    await warehouseStore.fetchWarehouses();
  }
});

const destinationOptions = computed(() =>
  warehouseOptions.value.filter((item) => item !== form.source_warehouse),
);

const canSubmit = computed(() => {
  return (
    form.product_id &&
    form.source_warehouse &&
    form.destination_warehouse &&
    form.source_warehouse !== form.destination_warehouse &&
    Number.isFinite(form.quantity) &&
    Math.abs(form.quantity) > 0
  );
});

const handleSubmit = async () => {
  if (!canSubmit.value) return;
  const quantity = Math.abs(form.quantity);
  const transferNote = `Transfer ${form.source_warehouse} -> ${form.destination_warehouse}`;
  const note = form.note.trim();

  await inventoryStore.createInventoryLog({
    product_id: form.product_id,
    movement_type: "out",
    quantity_change: quantity,
    reference_type: "transfer",
    reference_id: null,
    note: [transferNote, note].filter(Boolean).join(". ") || null,
    created_by: "admin",
  });

  await inventoryStore.createInventoryLog({
    product_id: form.product_id,
    movement_type: "in",
    quantity_change: quantity,
    reference_type: "transfer",
    reference_id: null,
    note: [transferNote, note].filter(Boolean).join(". ") || null,
    created_by: "admin",
  });

  inventoryStore.updateInventoryWarehouse(
    form.product_id,
    form.destination_warehouse,
  );

  printText(
    "Warehouse Transfer Notice",
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
          Stock Transfer
        </p>
        <h3 class="mt-2 text-lg font-semibold">Transfer Stock</h3>
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
              :items="warehouseOptions"
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
