<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { InventoryMovementType } from "~/types/inventory";

defineProps<{ payload?: unknown }>();
const emit = defineEmits<{ close: [boolean] }>();

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const { products } = storeToRefs(productStore);

const isSaving = ref(false);

const productOptions = computed(() =>
  products.value.filter((product) => product.id && product.name),
);

const movementOptions: Array<{ label: string; value: InventoryMovementType }> = [
  { label: "Inbound", value: "in" },
  { label: "Outbound", value: "out" },
  { label: "Adjustment", value: "adjustment" },
];

const form = reactive({
  product_id: "",
  movement_type: "adjustment" as InventoryMovementType,
  quantity_change: 0,
  reference_type: "",
  reference_id: "",
  note: "",
  created_by: "",
});

const resetForm = () => {
  form.product_id = "";
  form.movement_type = "adjustment";
  form.quantity_change = 0;
  form.reference_type = "";
  form.reference_id = "";
  form.note = "";
  form.created_by = "";
};

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const handleSave = async () => {
  if (!form.product_id.trim()) return;
  if (!Number.isFinite(form.quantity_change) || form.quantity_change === 0) {
    return;
  }

  isSaving.value = true;
  await inventoryStore.createInventoryLog({
    product_id: form.product_id.trim(),
    movement_type: form.movement_type,
    quantity_change: form.quantity_change,
    reference_type: normalize(form.reference_type),
    reference_id: normalize(form.reference_id),
    note: normalize(form.note),
    created_by: normalize(form.created_by),
  });
  isSaving.value = false;
  resetForm();
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          New Adjustment
        </p>
        <h3 class="mt-2 text-lg font-semibold">Record inventory activity</h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Product">
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
          <UFormField label="Movement type">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="form.movement_type"
              :items="movementOptions"
            />
          </UFormField>
          <UFormField label="Quantity change">
            <UInput
              class="w-full"
              v-model.number="form.quantity_change"
              type="number"
              placeholder="0"
            />
          </UFormField>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Reference type">
            <UInput
              class="w-full"
              v-model="form.reference_type"
              placeholder="purchase_order"
            />
          </UFormField>
          <UFormField label="Reference ID">
            <UInput
              class="w-full"
              v-model="form.reference_id"
              placeholder="po-9001"
            />
          </UFormField>
        </div>
        <UFormField label="Note">
          <UTextarea
            class="w-full"
            v-model="form.note"
            placeholder="Reason for the adjustment..."
          />
        </UFormField>
        <UFormField label="Created by">
          <UInput
            class="w-full"
            v-model="form.created_by"
            placeholder="usr-001"
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="!form.product_id.trim() || form.quantity_change === 0"
          :loading="isSaving"
          @click="handleSave"
        >
          Save
        </UButton>
      </div>
    </template>
  </UModal>
</template>
