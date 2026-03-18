<script setup lang="ts">
import { storeToRefs } from "pinia";
import { defaultAssignedWarehouses, getWarehouseForId, isAssignedWarehouse } from "~/utils/warehouse";

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
const { products } = storeToRefs(productStore);
const { inventoryMeta } = storeToRefs(inventoryStore);

const assignedWarehouses = defaultAssignedWarehouses;

const mode = computed(() => props.payload?.mode ?? "in");
const modalTitle = computed(() =>
  props.payload?.title ?? (mode.value === "out" ? "Reduce Stock" : "Add Stock"),
);

const form = reactive({
  product_id: "",
  quantity: 0,
  note: "",
});

const getWarehouse = (productId: string) =>
  inventoryMeta.value[productId]?.warehouse ?? getWarehouseForId(productId);

const productOptions = computed(() =>
  products.value.filter((product) => {
    if (!product.id) return false;
    return isAssignedWarehouse(getWarehouse(product.id), assignedWarehouses);
  }),
);

const isAllowedProduct = computed(() => {
  if (!form.product_id) return false;
  return isAssignedWarehouse(getWarehouse(form.product_id), assignedWarehouses);
});

const canSubmit = computed(() => {
  return (
    isAllowedProduct.value &&
    Number.isFinite(form.quantity) &&
    Math.abs(form.quantity) > 0
  );
});

watch(
  () => props.payload,
  (payload) => {
    form.product_id = payload?.productId ?? "";
    form.quantity = 0;
    form.note = "";
  },
  { immediate: true },
);

onMounted(async () => {
  if (!products.value.length) {
    await productStore.fetchProducts();
  }
});

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  const quantity = Math.abs(form.quantity);
  const movement = mode.value === "out" ? "out" : "in";

  if (!inventoryMeta.value[form.product_id]?.warehouse) {
    inventoryStore.updateInventoryWarehouse(
      form.product_id,
      getWarehouse(form.product_id),
    );
  }

  await inventoryStore.createInventoryLog({
    product_id: form.product_id,
    movement_type: movement,
    quantity_change: quantity,
    reference_type: "adjustment",
    reference_id: null,
    note: form.note.trim() || null,
    created_by: "warehouse_manager",
  });

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

        <UFormField label="Quantity adjustment">
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

        <div class="rounded-lg border border-slate-200/70 bg-slate-50 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Assigned warehouse
          </p>
          <p class="mt-1 text-sm text-slate-700">
            {{
              form.product_id
                ? getWarehouse(form.product_id)
                : assignedWarehouses[0]
            }}
          </p>
        </div>

        <p v-if="form.product_id && !isAllowedProduct" class="text-sm text-red-500">
          This item is not assigned to your warehouse.
        </p>
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
