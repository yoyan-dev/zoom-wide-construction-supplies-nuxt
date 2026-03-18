<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Warehouse } from "~/types/warehouse";

type StockAdjustmentPayload = {
  productId?: string;
  mode?: "in" | "out";
  warehouse?: string;
  title?: string;
};

const props = defineProps<{
  payload: StockAdjustmentPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const warehouseStore = useWarehouseStore();

const { products } = storeToRefs(productStore);
const { warehouses } = storeToRefs(warehouseStore);

const mode = computed(() => props.payload?.mode ?? "in");
const modalTitle = computed(() =>
  props.payload?.title ?? (mode.value === "out" ? "Reduce Stock" : "Add Stock"),
);

const form = reactive({
  product_id: "",
  warehouse: "",
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
    form.warehouse = payload?.warehouse ?? "";
    form.quantity = 0;
    form.note = "";
  },
  { immediate: true },
);

onMounted(async () => {
  if (!products.value.length) {
    await productStore.fetchProducts();
  }
  if (!warehouses.value.length) {
    await warehouseStore.fetchWarehouses();
  }
});

const canSubmit = computed(() => {
  return (
    form.product_id &&
    form.warehouse &&
    Number.isFinite(form.quantity) &&
    Math.abs(form.quantity) > 0
  );
});

const handleSubmit = async () => {
  if (!canSubmit.value) return;
  const quantity = Math.abs(form.quantity);
  const movement = mode.value === "out" ? "out" : "in";

  await inventoryStore.createInventoryLog({
    product_id: form.product_id,
    movement_type: movement,
    quantity_change: quantity,
    reference_type: "adjustment",
    reference_id: null,
    note: form.note.trim() || null,
    created_by: "admin",
  });

  inventoryStore.updateInventoryWarehouse(form.product_id, form.warehouse);

  await productStore.adjustProductStock(
    form.product_id,
    movement === "out" ? -quantity : quantity,
  );

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock Adjustment
        </p>
        <h3 class="mt-2 text-lg font-semibold">{{ modalTitle }}</h3>
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

        <UFormField label="Warehouse">
          <USelect
            class="w-full"
            v-model="form.warehouse"
            :items="warehouseOptions"
            placeholder="Select warehouse"
          />
        </UFormField>

        <UFormField label="Quantity">
          <UInput
            class="w-full"
            v-model.number="form.quantity"
            type="number"
            placeholder="0"
          />
        </UFormField>

        <UFormField label="Reason / notes">
          <UTextarea
            class="w-full"
            v-model="form.note"
            placeholder="Reason for adjustment"
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
          Save
        </UButton>
      </div>
    </template>
  </UModal>
</template>
